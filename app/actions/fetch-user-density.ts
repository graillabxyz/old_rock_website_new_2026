export async function fetchUserDensity(walletAddress: string) {
  try {
    // 1. Try fetching from Leaderboard API (Cached, Reliable)
    // This solves the issue of "often not loading" by using the stable cached dataset
    const leaderboardResponse = await fetch(`/api/leaderboard?filter=${encodeURIComponent(walletAddress)}`, {
      method: "GET",
      cache: "no-store",
    })

    if (leaderboardResponse.ok) {
      const leaderboardResult = await leaderboardResponse.json()
      if (leaderboardResult.success && leaderboardResult.data && leaderboardResult.data.length > 0) {
        const user = leaderboardResult.data[0]
        return {
          success: true,
          data: {
            amount: user.totalDensity || 0,
            amountUnclaimed: user.unextractedDensity || 0,
            amountAllocated: 0, // Not available in leaderboard cache
            amountLocked: 0, // Not available in leaderboard cache
          }
        }
      }
    }

    // 2. Fallback: If user not in leaderboard (new user) or API failed, try Direct API
    console.log("⚠️ User not found in leaderboard cache, falling back to direct fetch...")
    const response = await fetch(`/api/nfts?action=user-density&walletAddress=${encodeURIComponent(walletAddress)}`, {
      method: "GET",
      cache: "no-store",
    })

    if (!response.ok) {
      console.error(`❌ API error: ${response.status} ${response.statusText}`)
      return { success: false, data: null, error: `API Error: ${response.status}` }
    }

    const result = await response.json()
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
