export async function fetchGoliathNFTs() {
  try {
    const response = await fetch("/api/nfts?action=goliath", {
      method: "GET",
      cache: "no-store",
    })

    if (!response.ok) {
      console.error(`❌ API error: ${response.status} ${response.statusText}`)
      return { success: false, images: [], error: `API Error: ${response.status}` }
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("💥 Error fetching Goliath NFTs:", error)
    return {
      success: false,
      images: [],
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

export async function fetchCollectionStats() {
  try {
    const response = await fetch("/api/nfts?action=collection-stats", {
      method: "GET",
      cache: "no-store",
    })

    if (!response.ok) {
      console.error(`❌ API error: ${response.status} ${response.statusText}`)
      return { success: false, stats: null, error: `API Error: ${response.status}` }
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("💥 Error fetching collection stats:", error)
    return {
      success: false,
      stats: null,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

export async function fetchOldRockNFTs() {
  try {
    const response = await fetch("/api/nfts?action=old-rock", {
      method: "GET",
      cache: "no-store",
    })

    if (!response.ok) {
      console.error(`❌ API error: ${response.status} ${response.statusText}`)
      return { success: false, nfts: {}, counts: {}, error: `API Error: ${response.status}` }
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("💥 Error fetching Old Rock NFTs:", error)
    return {
      success: false,
      nfts: {},
      counts: {},
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

export async function fetchGoliathNFTsByDensity() {
  try {
    const response = await fetch("/api/nfts?action=goliath-density", {
      method: "GET",
      cache: "no-store",
    })

    if (!response.ok) {
      console.error(`❌ API error: ${response.status} ${response.statusText}`)
      return { success: false, nfts: {}, counts: {}, error: `API Error: ${response.status}` }
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("💥 Error fetching Goliath NFTs by Density:", error)
    return {
      success: false,
      nfts: {},
      counts: {},
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}
