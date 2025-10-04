"use server"

// Remove this import
// import { fetchWalletBalances } from "./fetch-wallet-balances"

export async function fetchUserNFTs(walletAddress: string) {
  try {
    const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY

    if (!ALCHEMY_API_KEY) {
      console.warn("Alchemy API key not found")
      return { success: false, oldRockNFTs: [], goliathNFTs: [] }
    }

    // Create AbortController for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    try {
      // Fetch Old Rock NFTs for the user
      const oldRockResponse = await fetch(
        `https://eth-mainnet.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}/getNFTsForOwner?owner=${walletAddress}&contractAddresses[]=0x5c83df384971eF5bA252336f78Ad97D26a0EC7DF&withMetadata=true&limit=100`,
        {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        },
      )

      // Fetch Goliath NFTs for the user
      const goliathResponse = await fetch(
        `https://eth-mainnet.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}/getNFTsForOwner?owner=${walletAddress}&contractAddresses[]=0x05ab5a50f77b9957b51145b259f05e805d84e92e&withMetadata=true&limit=100`,
        {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        },
      )

      clearTimeout(timeoutId)

      if (!oldRockResponse.ok || !goliathResponse.ok) {
        console.error("API Response not OK:", {
          oldRock: oldRockResponse.status,
          goliath: goliathResponse.status,
        })
        throw new Error(`API Error: Old Rock ${oldRockResponse.status}, Goliath ${goliathResponse.status}`)
      }

      const oldRockData = await oldRockResponse.json()
      const goliathData = await goliathResponse.json()

      // Process Old Rock NFTs
      const oldRockNFTs =
        oldRockData.ownedNfts?.map((nft: any) => ({
          tokenId: nft.tokenId,
          name: nft.raw?.metadata?.name || `Old Rock #${nft.tokenId}`,
          image: nft.image?.originalUrl || nft.image?.cachedUrl || nft.image?.thumbnailUrl,
          collection: "Old Rock",
          contractAddress: "0x5c83df384971eF5bA252336f78Ad97D26a0EC7DF",
          attributes: nft.raw?.metadata?.attributes || [],
          backgroundColor: getBackgroundColor(nft.raw?.metadata?.attributes, "oldrock"),
        })) || []

      // Process Goliath NFTs
      const goliathNFTs =
        goliathData.ownedNfts?.map((nft: any) => ({
          tokenId: nft.tokenId,
          name: nft.raw?.metadata?.name || `Goliath #${nft.tokenId}`,
          image: nft.image?.originalUrl || nft.image?.cachedUrl || nft.image?.thumbnailUrl,
          collection: "Goliath",
          contractAddress: "0x05ab5a50f77b9957b51145b259f05e805d84e92e",
          attributes: nft.raw?.metadata?.attributes || [],
          backgroundColor: getBackgroundColor(nft.raw?.metadata?.attributes, "goliath"),
        })) || []

      return {
        success: true,
        oldRockNFTs,
        goliathNFTs,
        totalNFTs: oldRockNFTs.length + goliathNFTs.length,
      }
    } catch (fetchError) {
      clearTimeout(timeoutId)
      if (fetchError.name === "AbortError") {
        console.error("Request timeout")
        throw new Error("Request timeout - please try again")
      }
      throw fetchError
    }
  } catch (error) {
    console.error("Error fetching user NFTs:", error)
    return {
      success: false,
      oldRockNFTs: [],
      goliathNFTs: [],
      error: error.message || "Failed to fetch NFTs",
    }
  }
}

function getBackgroundColor(attributes: any[], collection: string): string {
  if (!attributes) return "#6B46C1" // Default purple

  if (collection === "oldrock") {
    // Map Old Rock colors to background colors
    const typeAttribute = attributes.find(
      (attr: any) => attr.trait_type === "Type" || attr.trait_type === "COLOR" || attr.trait_type === "color",
    )

    if (typeAttribute) {
      const colorMap: { [key: string]: string } = {
        Common: "#8B4513",
        Yellow: "#FFB000",
        Turquoise: "#40E0D0",
        Blue: "#0F52BA",
        Purple: "#9966CC",
        Red: "#E0115F",
        Silver: "#C0C0C0",
        Gold: "#FFD700",
        Aquamarine: "#7FFFD4",
        Black: "#1F1F1F",
        White: "#F8F8FF",
      }
      return colorMap[typeAttribute.value] || "#6B46C1"
    }
  } else if (collection === "goliath") {
    // Map Goliath density to background colors
    const densityAttribute = attributes.find(
      (attr: any) => attr.trait_type === "DENSITY" || attr.trait_type === "Density",
    )

    if (densityAttribute) {
      const densityMap: { [key: string]: string } = {
        Uninfected: "#10B981",
        "Low Density": "#3B82F6",
        "Medium Density": "#8B5CF6",
        "High Density": "#EF4444",
        Mystic: "#F59E0B",
        Bounty: "#EC4899",
      }

      const densityValue = densityAttribute.value.toLowerCase()
      for (const [key, color] of Object.entries(densityMap)) {
        if (densityValue.includes(key.toLowerCase())) {
          return color
        }
      }
    }
  }

  return "#6B46C1" // Default purple
}

// Add this function after the getBackgroundColor function
function calculateNFTBadges(oldRockNFTs: any[], goliathNFTs: any[], walletAddress: string): any[] {
  const badges = []

  // First Rock
  if (oldRockNFTs.length > 0) {
    badges.push({ id: 41, unlocked: true })
  }

  // Rock Collector (5+ Old Rocks)
  if (oldRockNFTs.length >= 5) {
    badges.push({ id: 42, unlocked: true })
  }

  // Rock Hoarder (10+ Old Rocks)
  if (oldRockNFTs.length >= 10) {
    badges.push({ id: 43, unlocked: true })
  }

  // Rock Whale (25+ Old Rocks)
  if (oldRockNFTs.length >= 25) {
    badges.push({ id: 44, unlocked: true })
  }

  // First Goliath
  if (goliathNFTs.length > 0) {
    badges.push({ id: 45, unlocked: true })
  }

  // Goliath Guardian (5+ Goliaths)
  if (goliathNFTs.length >= 5) {
    badges.push({ id: 46, unlocked: true })
  }

  // Goliath Army (10+ Goliaths)
  if (goliathNFTs.length >= 10) {
    badges.push({ id: 47, unlocked: true })
  }

  // Goliath Commander (25+ Goliaths)
  if (goliathNFTs.length >= 25) {
    badges.push({ id: 48, unlocked: true })
  }

  // Color Wheel - check if user owns every color of Old Rocks
  const oldRockColors = new Set()
  oldRockNFTs.forEach((nft) => {
    const colorAttr = nft.attributes?.find(
      (attr) => attr.trait_type === "Type" || attr.trait_type === "COLOR" || attr.trait_type === "color",
    )
    if (colorAttr) {
      oldRockColors.add(colorAttr.value)
    }
  })
  const requiredColors = [
    "Common",
    "Yellow",
    "Turquoise",
    "Blue",
    "Purple",
    "Red",
    "Silver",
    "Gold",
    "Aquamarine",
    "Black",
    "White",
  ]
  const hasAllColors = requiredColors.every((color) => oldRockColors.has(color))
  if (hasAllColors) {
    badges.push({ id: 49, unlocked: true })
  }

  // Density Spectrum - check if user owns every density of Goliaths
  const goliathDensities = new Set()
  goliathNFTs.forEach((nft) => {
    const densityAttr = nft.attributes?.find((attr) => attr.trait_type === "DENSITY" || attr.trait_type === "Density")
    if (densityAttr) {
      goliathDensities.add(densityAttr.value)
    }
  })
  const requiredDensities = ["Uninfected", "Low Density", "Medium Density", "High Density", "Mystic", "Bounty"]
  const hasAllDensities = requiredDensities.every((density) =>
    Array.from(goliathDensities).some((userDensity) => userDensity.toLowerCase().includes(density.toLowerCase())),
  )
  if (hasAllDensities) {
    badges.push({ id: 50, unlocked: true })
  }

  // Mystic Holder
  const hasMysticRock = oldRockNFTs.some((nft) =>
    nft.attributes?.some((attr) => attr.value && attr.value.toString().toLowerCase().includes("mystic")),
  )
  if (hasMysticRock) {
    badges.push({ id: 51, unlocked: true })
  }

  // Bounty Hunter
  const hasBountyGoliath = goliathNFTs.some((nft) =>
    nft.attributes?.some((attr) => attr.value && attr.value.toString().toLowerCase().includes("bounty")),
  )
  if (hasBountyGoliath) {
    badges.push({ id: 52, unlocked: true })
  }

  // Dual Collector
  if (oldRockNFTs.length > 0 && goliathNFTs.length > 0) {
    badges.push({ id: 53, unlocked: true })
  }

  // Genesis Collector (same as dual collector for now)
  if (oldRockNFTs.length > 0 && goliathNFTs.length > 0) {
    badges.push({ id: 54, unlocked: true })
  }

  // Diamond Hands - assume true for now (would need transaction history)
  if (oldRockNFTs.length > 0 || goliathNFTs.length > 0) {
    badges.push({ id: 55, unlocked: true })
  }

  // Staking Pioneer - assume true if they have Old Rocks (would need staking data)
  if (oldRockNFTs.length > 0) {
    badges.push({ id: 56, unlocked: true })
  }

  // Collection Master (50+ total NFTs)
  const totalNFTs = oldRockNFTs.length + goliathNFTs.length
  if (totalNFTs >= 50) {
    badges.push({ id: 57, unlocked: true })
  }

  // Legendary Blend
  if (hasMysticRock && hasBountyGoliath) {
    badges.push({ id: 58, unlocked: true })
  }

  // OG Wallet - check if wallet was created in 2021 or earlier
  // This would require additional API call to check first transaction date
  // For now, we'll use a simple heuristic based on wallet address patterns
  const addressNum = Number.parseInt(walletAddress.slice(2, 10), 16)
  const isOGWallet = addressNum < 0x10000000 // Simple heuristic
  if (isOGWallet) {
    badges.push({ id: 59, unlocked: true })
  }

  // Complete Set - very rare achievement
  if (hasAllColors && hasAllDensities && hasMysticRock && hasBountyGoliath) {
    badges.push({ id: 60, unlocked: true })
  }

  return badges
}

// Update the fetchUserStats function to remove USDC balance fetching
export async function fetchUserStats(walletAddress: string, oldRockNFTs?: any[], goliathNFTs?: any[]) {
  try {
    const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY

    if (!ALCHEMY_API_KEY) {
      return {
        success: false,
        stats: {
          totalDensity: "43,023.32",
          gamesPlayed: 0,
          winRate: 0,
          rank: "Unranked",
          achievements: [],
        },
      }
    }

    // If NFT data wasn't passed, fetch it
    let userOldRockNFTs = oldRockNFTs || []
    let userGoliathNFTs = goliathNFTs || []

    if (!oldRockNFTs || !goliathNFTs) {
      const nftResult = await fetchUserNFTs(walletAddress)
      if (nftResult.success) {
        userOldRockNFTs = nftResult.oldRockNFTs || []
        userGoliathNFTs = nftResult.goliathNFTs || []
      }
    }

    // Calculate NFT-related badges based on actual collection
    const nftBadgeUnlocks = calculateNFTBadges(userOldRockNFTs, userGoliathNFTs, walletAddress)

    // Mock data for other achievements (gaming, density, community) - these would be calculated from real data
    const mockStats = {
      totalDensity: "43,023.32", // restored to original mock value
      gamesPlayed: 127,
      winRate: 68.5,
      rank: "#342",
      achievements: [], // This will be populated in the frontend with the actual badge data
      nftBadgeUnlocks, // Pass the NFT badge unlock data to the frontend
    }

    return { success: true, stats: mockStats }
  } catch (error) {
    console.error("Error fetching user stats:", error)
    return {
      success: false,
      stats: {
        totalDensity: "43,023.32",
        gamesPlayed: 0,
        winRate: 0,
        rank: "Unranked",
        achievements: [],
        nftBadgeUnlocks: [],
      },
    }
  }
}
