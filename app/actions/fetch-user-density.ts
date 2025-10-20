export async function fetchUserDensity(walletAddress: string) {
  try {
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
