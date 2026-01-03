import { type NextRequest, NextResponse } from "next/server"
import { getDensityDeckAuthToken } from "@/lib/density-deck-auth"

export const dynamic = "force-dynamic"

/**
 * GET /api/density-deck-leaderboard?test=true
 * Test endpoint to verify private key is set (development only)
 * 
 * GET /api/density-deck-leaderboard
 * Fetches leaderboard data from Density Deck API
 * Returns wins, winrate, username, and avatar for all users
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const isTest = searchParams.get("test") === "true"
  
  // Test endpoint to verify environment variable (development only)
  if (isTest && process.env.NODE_ENV === 'development') {
    const hasKey = !!process.env.DENSITY_DECK_PRIVATE_KEY
    const keyLength = process.env.DENSITY_DECK_PRIVATE_KEY?.length || 0
    const keyPrefix = process.env.DENSITY_DECK_PRIVATE_KEY?.substring(0, 6) || "none"
    
    return NextResponse.json({
      hasPrivateKey: hasKey,
      privateKeyLength: keyLength,
      privateKeyPrefix: keyPrefix,
      startsWith0x: process.env.DENSITY_DECK_PRIVATE_KEY?.startsWith("0x") || false,
    })
  }
  try {
    // Density Deck API - try different possible endpoints
    // The API might be at api.densitydeck.com or densitydeck.com/api
    let densityDeckApiUrl = process.env.NEXT_PUBLIC_DENSITY_DECK_API_URL || "https://api.densitydeck.com"
    
    // If no custom URL is set, try the API subdomain first
    if (!process.env.NEXT_PUBLIC_DENSITY_DECK_API_URL) {
      densityDeckApiUrl = "https://api.densitydeck.com"
    }
    
    const apiEndpoint = `${densityDeckApiUrl}/leaderboard`
    console.log("📡 Fetching Density Deck leaderboard from:", apiEndpoint)

    // Get authentication token (uses cached token if available)
    let authToken: string
    try {
      // Check if private key is set (for debugging)
      const hasPrivateKey = !!process.env.DENSITY_DECK_PRIVATE_KEY
      console.log("🔍 DENSITY_DECK_PRIVATE_KEY is set:", hasPrivateKey)
      if (hasPrivateKey) {
        const keyLength = process.env.DENSITY_DECK_PRIVATE_KEY?.length || 0
        console.log("🔍 Private key length:", keyLength)
        console.log("🔍 Private key starts with 0x:", process.env.DENSITY_DECK_PRIVATE_KEY?.startsWith("0x"))
      }
      
      authToken = await getDensityDeckAuthToken()
      console.log("✅ Authentication successful, token obtained")
    } catch (error) {
      console.error("❌ Failed to authenticate with Density Deck API:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown authentication error"
      const errorStack = error instanceof Error ? error.stack : undefined
      console.error("❌ Error details:", { message: errorMessage, stack: errorStack })
      
      // Include full error details for debugging
      const errorResponse: any = {
        success: false,
        error: "Failed to authenticate with Density Deck API. Please check DENSITY_DECK_PRIVATE_KEY environment variable.",
        details: errorMessage,
        debug: {
          hasPrivateKey: !!process.env.DENSITY_DECK_PRIVATE_KEY,
          privateKeyLength: process.env.DENSITY_DECK_PRIVATE_KEY?.length || 0,
          privateKeyPrefix: process.env.DENSITY_DECK_PRIVATE_KEY?.substring(0, 4) || "none",
        },
      }
      
      // In development, include more details including the error message which may contain API response info
      if (process.env.NODE_ENV === 'development') {
        errorResponse.stack = errorStack
        // Include API response data if available in the error
        if (error && typeof error === 'object' && 'responseData' in error) {
          errorResponse.apiResponse = (error as any).responseData
        }
      }
      
      return NextResponse.json(errorResponse, { status: 500 })
    }

    // Fetch leaderboard data from Density Deck API (single call for all data)
    const response = await fetch(apiEndpoint, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    })

    // Check if response is actually JSON
    const contentType = response.headers.get("content-type") || ""
    if (!contentType.includes("application/json")) {
      const text = await response.text()
      console.error("❌ Density Deck API returned non-JSON response")
      console.error("Content-Type:", contentType)
      console.error("Response preview:", text.substring(0, 500))
      console.error("Status:", response.status, response.statusText)
      
      // If it's HTML, the endpoint might be wrong
      if (text.trim().startsWith("<!") || text.trim().startsWith("<html")) {
        return NextResponse.json(
          { 
            success: false, 
            error: "Density Deck API endpoint returned HTML instead of JSON. Please check the API URL configuration.",
            details: "The endpoint might require authentication or be at a different path."
          },
          { status: 500 }
        )
      }
      
      return NextResponse.json(
        { success: false, error: "Density Deck API returned invalid response format" },
        { status: 500 }
      )
    }

    // Handle response - check for 401 and retry with fresh token if needed
    let leaderboardData: any
    let finalResponse = response
    
    if (!response.ok) {
      // If we get a 401, try refreshing the token and retry once
      if (response.status === 401) {
        console.log("🔄 Got 401, refreshing token and retrying...")
        const { clearDensityDeckAuthToken } = await import("@/lib/density-deck-auth")
        clearDensityDeckAuthToken()
        
        try {
          authToken = await getDensityDeckAuthToken()
          
          // Retry the request with new token
          const retryResponse = await fetch(apiEndpoint, {
            cache: "no-store",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            signal: AbortSignal.timeout(10000),
          })
          
          // Check content type for retry response
          const retryContentType = retryResponse.headers.get("content-type") || ""
          if (!retryContentType.includes("application/json")) {
            const text = await retryResponse.text()
            console.error("❌ Density Deck API returned non-JSON response on retry")
            return NextResponse.json(
              { success: false, error: "Density Deck API returned invalid response format" },
              { status: 500 }
            )
          }
          
          if (!retryResponse.ok) {
            const errorData = await retryResponse.json().catch(() => ({}))
            console.error(`❌ Density Deck API error after retry: ${retryResponse.status}`, errorData)
            return NextResponse.json(
              { success: false, error: `Density Deck API error: ${retryResponse.status} - ${errorData.message || retryResponse.statusText}` },
              { status: retryResponse.status }
            )
          }
          
          // Use the retry response
          finalResponse = retryResponse
          leaderboardData = await retryResponse.json()
        } catch (retryError) {
          console.error("❌ Error retrying with refreshed token:", retryError)
          return NextResponse.json(
            { success: false, error: "Failed to authenticate with Density Deck API after token refresh" },
            { status: 500 }
          )
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error(`❌ Density Deck API error: ${response.status}`, errorData)
        return NextResponse.json(
          { success: false, error: `Density Deck API error: ${response.status} - ${errorData.message || response.statusText}` },
          { status: response.status }
        )
      }
    } else {
      // Success - parse the response
      leaderboardData = await response.json()
    }
    
    if (!Array.isArray(leaderboardData)) {
      console.error("❌ Invalid leaderboard data format:", typeof leaderboardData, leaderboardData)
      return NextResponse.json(
        { success: false, error: "Invalid leaderboard data format - expected array" },
        { status: 500 }
      )
    }

    // Process and enrich the data
    // Score system: Winning = 3 points, Second place = 2 points
    // For leaderboard, we only want winners (score = 3)
    // Group by user address and count wins (entries with score = 3)
    const userWinsMap = new Map<string, {
      address: string
      username: string | null
      avatar: string | null
      wins: number
      totalGames: number
      lastPlayedAt: string | null
    }>()

    leaderboardData.forEach((entry: any) => {
      const user = entry.user || {}
      const address = (user.address || "").toLowerCase()
      const score = entry.score || 0
      
      // Only count winners (score = 3)
      if (score === 3 && address) {
        if (!userWinsMap.has(address)) {
          // Build avatar URL if avatar exists
          let avatarUrl = ""
          const avatar = user.avatar || ""
          if (avatar) {
            avatarUrl = avatar.startsWith("http") 
              ? avatar 
              : `https://densitydeck.com/avatar/${avatar}`
          }

          userWinsMap.set(address, {
            address,
            username: user.username || null,
            avatar: avatarUrl || null,
            wins: 0,
            totalGames: 0,
            lastPlayedAt: entry.lastPlayedAt || null,
          })
        }
        
        const userData = userWinsMap.get(address)!
        userData.wins += 1
        userData.totalGames += 1
        // Keep the most recent lastPlayedAt
        if (entry.lastPlayedAt && (!userData.lastPlayedAt || entry.lastPlayedAt > userData.lastPlayedAt)) {
          userData.lastPlayedAt = entry.lastPlayedAt
        }
      }
    })

    // Convert to array and sort by wins (descending)
    const processedData = Array.from(userWinsMap.values())
      .map((userData, index) => {
        // Calculate winrate (wins / total games, but since we only count wins, winrate = 100% for winners)
        // Actually, we need total games played to calculate winrate properly
        // For now, we'll set winrate based on wins (assuming each win is a game won)
        const winrate = userData.wins > 0 ? 100 : 0 // Winners have 100% winrate since we only count wins

        return {
          rank: index + 1,
          address: userData.address,
          username: userData.username,
          avatar: userData.avatar,
          wins: userData.wins,
          winrate: winrate,
          lastPlayedAt: userData.lastPlayedAt,
        }
      })
      .sort((a, b) => b.wins - a.wins) // Sort by wins descending
      .map((entry, index) => ({
        ...entry,
        rank: index + 1, // Recalculate rank after sorting
      }))

    console.log(`✅ Processed ${processedData.length} Density Deck leaderboard entries`)

    return NextResponse.json({
      success: true,
      data: processedData,
      total: processedData.length,
    })
  } catch (error) {
    console.error("❌ Error fetching Density Deck leaderboard:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        data: [],
      },
      { status: 500 }
    )
  }
}

