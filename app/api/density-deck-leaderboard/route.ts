import { type NextRequest, NextResponse } from "next/server"
import { getDensityDeckAuthToken } from "@/lib/density-deck-auth"

export const dynamic = "force-dynamic"

/**
 * GET /api/density-deck-leaderboard
 * Fetches leaderboard data from Density Deck API
 * Endpoint: https://api.densitydeck.com/leaderboard
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get("page") || "1"
    const limit = searchParams.get("limit") || "50"

    // SECURITY: Validate and bound pagination parameters
    const pageNum = Math.max(1, parseInt(page) || 1)
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 50)) // Max 100 per page

    // Density Deck API endpoint from env or default
    const densityDeckApiUrl = process.env.NEXT_PUBLIC_DENSITY_DECK_API_URL || "https://api.densitydeck.com"
    const apiEndpoint = `${densityDeckApiUrl}/leaderboard?page=${pageNum}&limit=${limitNum}`

    console.log("📡 Fetching Density Deck leaderboard from:", apiEndpoint)

    // Fetch leaderboard data from Density Deck API - Note: /leaderboard is a public endpoint
    const response = await fetch(apiEndpoint, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(15000), // Increased to 15 second timeout
    })

    if (!response.ok) {
      console.error(`❌ Density Deck API error: ${response.status} ${response.statusText}`)
      return NextResponse.json(
        { success: false, error: `Density Deck API error: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()

    if (!Array.isArray(data)) {
      console.error("❌ Invalid leaderboard data format:", typeof data, data)
      return NextResponse.json(
        { success: false, error: "Invalid leaderboard data format - expected array" },
        { status: 500 }
      )
    }

    // Process and map the data
    const processedData = data.map((entry: any, index: number) => {
      const user = entry.user || {}

      // Calculate rank based on page and index (using validated pageNum/limitNum from outer scope)
      const rank = ((pageNum - 1) * limitNum) + index + 1

      // Build avatar URL if avatar exists
      let avatarUrl = ""
      const avatar = user.avatar || ""
      if (avatar) {
        avatarUrl = avatar.startsWith("http")
          ? avatar
          : `https://api.densitydeck.com/avatar/${avatar}`
      }

      // Map API fields to our expected format
      return {
        rank: rank,
        address: user.address || "",
        username: user.username || null,
        displayName: user.username || (user.address ? `${user.address.slice(0, 6)}...${user.address.slice(-4)}` : "Unknown"),
        avatar: avatarUrl || null,
        wins: entry.score || 0, // In this API, 'score' represents the leaderboard metric (wins/points)
        winrate: 0, // API doesn't provide winrate directly in this endpoint
        lastPlayedAt: entry.lastPlayedAt || null,
      }
    })

    console.log(`✅ Processed ${processedData.length} Density Deck leaderboard entries`)

    return NextResponse.json({
      success: true,
      data: processedData,
      total: processedData.length, // Note: API doesn't seem to return total count, so we rely on infinite scroll
      page: pageNum,
      limit: limitNum
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

