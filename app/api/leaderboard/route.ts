import { type NextRequest, NextResponse } from "next/server"
import { getCachedData, setCachedData, isCacheStale, isRefreshing, getRefreshPromise, setRefreshPromise } from "@/lib/leaderboard-cache"

export const dynamic = "force-dynamic"

/**
 * Fetch fresh leaderboard data from APIs
 */
async function fetchLeaderboardData(): Promise<any[]> {
  const amplifyApiUrl = process.env.NEXT_PUBLIC_AMPLIFY_API_URL

  if (!amplifyApiUrl) {
    throw new Error("Amplify API URL not configured")
  }

  // Fetch all NFT owners to build leaderboard
  let owners: string[] = []
  try {
    const ownersResponse = await fetch(`${amplifyApiUrl}/nfts/owners`)
    if (ownersResponse.ok) {
      const ownersData = await ownersResponse.json()
      owners = ownersData?.data || []
    }
  } catch (error) {
    console.error("Error fetching NFT owners:", error)
    // Continue with empty owners list
  }

  // Fetch data for each owner in parallel (limit to reasonable number for performance)
  const leaderboardPromises = owners.slice(0, 1000).map(async (address: string) => {
    try {
      const addressLower = address.toLowerCase()

      // Fetch NFTs
      const nftResponse = await fetch(`${amplifyApiUrl}/nfts/${address}`)
      if (!nftResponse.ok) return null

      const nftData = await nftResponse.json()
      const oldRockNFTs = nftData?.data?.OldRocks || []
      const goliathNFTs = nftData?.data?.Goliath || []
      const hasOldRock = oldRockNFTs.length > 0
      const hasGoliath = goliathNFTs.length > 0

      // Fetch DENSITY balance
      let density = 0
      let unextractedDensity = 0
      try {
        const densityResponse = await fetch(`${amplifyApiUrl}/density/${address}`)
        if (densityResponse.ok) {
          const densityData = await densityResponse.json()
          density = parseFloat(densityData?.data?.amount || "0") || 0
          unextractedDensity = parseFloat(densityData?.data?.amountUnclaimed || "0") || 0
        }
      } catch (e) {
        // Ignore density fetch errors
      }

      // Fetch ENS name
      let ensName: string | undefined
      try {
        const ensResponse = await fetch(`https://api.ensideas.com/ens/resolve/${address}`)
        if (ensResponse.ok) {
          const ensData = await ensResponse.json()
          ensName = ensData?.name || undefined
        }
      } catch (e) {
        // Ignore ENS fetch errors
      }

      // Calculate ranking score based on:
      // 1. $DENSITY balance (highest priority - multiply by 1,000,000)
      // 2. Old Rock rarity and quantity
      // 3. Goliath rarity and quantity
      // 4. Old Rock prioritized over Goliath
      
      let rankingScore = density * 1000000 // $DENSITY is highest priority
      
      // Calculate Old Rock score
      let rockScore = 0
      const rockReactiveScores: { [key: string]: number } = {
        "Pure": 1000,
        "Polar": 500,
        "Recurrent": 200,
      }
      const rockDensityScores: { [key: string]: number } = {
        "High": 500,
        "Medium": 200,
        "Low": 50,
      }
      
      oldRockNFTs.forEach((nft: any) => {
        // Base score for owning a Rock
        rockScore += 100
        
        // Reactive rarity score
        const reactive = nft.attributes?.Reactive || nft.attributes?.reactive
        if (reactive) {
          let reactiveValue: string
          if (typeof reactive === 'string') {
            reactiveValue = reactive
          } else if (reactive?.value) {
            reactiveValue = reactive.value
          } else if (Array.isArray(reactive) && reactive.length > 0) {
            reactiveValue = reactive[0]?.value || reactive[0] || reactive
          } else {
            reactiveValue = String(reactive)
          }
          if (reactiveValue) {
            for (const [key, value] of Object.entries(rockReactiveScores)) {
              if (reactiveValue.includes(key)) {
                rockScore += value
                break
              }
            }
          }
        }
        
        // Density rarity score
        const nftDensity = nft.attributes?.Density || nft.attributes?.density
        if (nftDensity) {
          let densityValue: string
          if (typeof nftDensity === 'string') {
            densityValue = nftDensity
          } else if (nftDensity?.value) {
            densityValue = nftDensity.value
          } else if (Array.isArray(nftDensity) && nftDensity.length > 0) {
            densityValue = nftDensity[0]?.value || nftDensity[0] || nftDensity
          } else {
            densityValue = String(nftDensity)
          }
          if (densityValue) {
            for (const [key, value] of Object.entries(rockDensityScores)) {
              if (densityValue.includes(key)) {
                rockScore += value
                break
              }
            }
          }
        }
      })
      
      // Bonus for Rock quantity (diminishing returns)
      if (oldRockNFTs.length > 0) {
        rockScore += Math.min(oldRockNFTs.length * 10, 200) // Max 200 bonus for quantity
      }
      
      rankingScore += rockScore * 1000 // Multiply Rock score by 1000 to prioritize over Goliaths
      
      // Calculate Goliath score
      let goliathScore = 0
      const goliathDensityScores: { [key: string]: number } = {
        "Mystic": 2000,
        "High": 500,
        "Medium": 200,
        "Low": 50,
        "Common": 10,
        "Uninfected": 10,
      }
      
      goliathNFTs.forEach((nft: any) => {
        // Base score for owning a Goliath
        goliathScore += 50
        
        // Density/rarity score
        const density = nft.attributes?.Density || nft.attributes?.density
        if (density) {
          let densityValue: string
          if (typeof density === 'string') {
            densityValue = density
          } else if (density?.value) {
            densityValue = density.value
          } else if (Array.isArray(density) && density.length > 0) {
            densityValue = density[0]?.value || density[0] || density
          } else {
            densityValue = String(density)
          }
          if (densityValue) {
            for (const [key, value] of Object.entries(goliathDensityScores)) {
              if (densityValue.includes(key)) {
                goliathScore += value
                break
              }
            }
          }
        }
        
        // Check for Mystic by name
        const name = nft.name || ""
        const MYSTIC_NAMES = [
          "Agricola Stone", "Kalki", "Bulooma", "Pubian", "Nootau",
          "Sanskai", "Djup", "Sirinan", "Cemi", "Nebu", "Belarang",
        ]
        if (MYSTIC_NAMES.some((mystic) => name.includes(mystic))) {
          goliathScore += 2000 // Mystic bonus
        }
      })
      
      // Bonus for Goliath quantity (diminishing returns)
      if (goliathNFTs.length > 0) {
        goliathScore += Math.min(goliathNFTs.length * 5, 100) // Max 100 bonus for quantity
      }
      
      rankingScore += goliathScore
      
      // Only include users with NFTs or DENSITY balance
      if (!hasOldRock && !hasGoliath && density === 0) {
        return null
      }

      return {
        address: addressLower,
        ensName: ensName || null,
        displayName: ensName || `${address.slice(0, 6)}...${address.slice(-4)}`,
        totalDensity: density,
        unextractedDensity: unextractedDensity,
        hasOldRock,
        hasGoliath,
        rankingScore,
        oldRockCount: oldRockNFTs.length,
        goliathCount: goliathNFTs.length,
      }
    } catch (error) {
      console.error(`Error fetching data for ${address}:`, error)
      return null
    }
  })

  const leaderboardResults = await Promise.all(leaderboardPromises)
  const leaderboard = leaderboardResults
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
    .sort((a, b) => {
      // Sort by ranking score (descending)
      // This prioritizes: $DENSITY > High-density Rocks > Rare Goliaths > Common Goliaths
      return b.rankingScore - a.rankingScore
    })

  return leaderboard
}

/**
 * GET /api/leaderboard
 * Returns cached leaderboard data, refreshing in background if stale
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const forceRefresh = searchParams.get("refresh") === "true"

    // Check cache first
    const cachedData = getCachedData()
    const cacheStale = isCacheStale()

    // If we have fresh cached data and not forcing refresh, return it
    if (cachedData && !cacheStale && !forceRefresh) {
      return NextResponse.json({
        success: true,
        data: cachedData,
        cached: true,
      })
    }

    // If cache is stale or missing, check if refresh is already in progress
    if (isRefreshing()) {
      const refreshPromise = getRefreshPromise()
      if (refreshPromise) {
        // Wait for existing refresh to complete
        try {
          const freshData = await refreshPromise
          return NextResponse.json({
            success: true,
            data: freshData,
            cached: false,
          })
        } catch (error) {
          // If refresh failed, return stale cache if available
          if (cachedData) {
            return NextResponse.json({
              success: true,
              data: cachedData,
              cached: true,
              stale: true,
            })
          }
          throw error
        }
      }
    }

    // Start new refresh (non-blocking if we have stale cache)
    const refreshPromise = fetchLeaderboardData()
      .then((data) => {
        setCachedData(data)
        return data
      })
      .catch((error) => {
        console.error("Error refreshing leaderboard cache:", error)
        throw error
      })

    setRefreshPromise(refreshPromise)

    // If we have stale cache, return it immediately and refresh in background
    if (cachedData && cacheStale) {
      // Don't await - let it refresh in background
      refreshPromise.catch((error) => {
        console.error("Background refresh failed:", error)
      })
      return NextResponse.json({
        success: true,
        data: cachedData,
        cached: true,
        stale: true,
        refreshing: true,
      })
    }

    // No cache available, wait for fresh data
    const freshData = await refreshPromise
    return NextResponse.json({
      success: true,
      data: freshData,
      cached: false,
    })
  } catch (error) {
    console.error("Error fetching leaderboard:", error)
    // Try to return stale cache as fallback
    const cachedData = getCachedData()
    if (cachedData) {
      return NextResponse.json({
        success: true,
        data: cachedData,
        cached: true,
        stale: true,
        error: "Failed to refresh, using cached data",
      })
    }
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

