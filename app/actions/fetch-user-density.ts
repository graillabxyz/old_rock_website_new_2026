export async function fetchUserDensity(walletAddress: string) {
  if (!walletAddress) return { success: false, error: "No wallet address provided" };

  try {
    console.log(`🔍 Fetching DENSITY for ${walletAddress}...`)

    // 1. Try fetching from Leaderboard API (Cached, Reliable for general use)
    const leaderboardResponse = await fetch(`/api/leaderboard?filter=${encodeURIComponent(walletAddress)}`, {
      method: "GET",
      cache: "no-store",
    })

    if (leaderboardResponse.ok) {
      const leaderboardResult = await leaderboardResponse.json()
      if (leaderboardResult.success && leaderboardResult.data && leaderboardResult.data.length > 0) {
        const user = leaderboardResult.data[0]

        // If leaderboard has non-zero density, use it
        if (user.totalDensity > 0) {
          console.log(`✅ Found density in leaderboard cache: ${user.totalDensity}`)
          return {
            success: true,
            data: {
              amount: user.totalDensity || 0,
              amountUnclaimed: user.unextractedDensity || 0,
              amountAllocated: 0,
              amountLocked: 0,
            }
          }
        }
      }
    }

    // 2. Fallback or Deep Fetch: If user not in leaderboard or shows 0, try Direct API
    console.log("⚠️ User not found or has 0 density in cache, performing deep fetch...")
    const response = await fetch(`/api/nfts?action=user-density&walletAddress=${encodeURIComponent(walletAddress)}`, {
      method: "GET",
      cache: "no-store",
    })

    if (!response.ok) {
      console.error(`❌ Direct API error: ${response.status} ${response.statusText}`)
      return { success: false, data: null, error: `API Error: ${response.status}` }
    }

    const result = await response.json()
    console.log(`✅ Deep fetch result: ${result?.data?.amount || 0}`)
    return result
  } catch (error) {
    console.error("💥 Error fetching user DENSITY data:", error)
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}
