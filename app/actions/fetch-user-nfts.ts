"use server"

// Remove this import
// import { fetchWalletBalances } from "./fetch-wallet-balances"

export async function fetchUserNFTs(walletAddress: string) {
  try {
    // Create AbortController for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    try {
      // Fetch NFTs for the user
      const nftResponse = await fetch(
        `${process.env.NEXT_PUBLIC_AMPLIFY_API_URL}/nfts/${walletAddress}`,
        {
          signal: controller.signal,
          cache: "no-store",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        },
      )

      clearTimeout(timeoutId)

      if (!nftResponse.ok) {
        console.error(`API Response not OK: ${nftResponse.status}`);
        throw new Error(`API Error: get NFTs for user ${nftResponse.status}`)
      }

      const nftData = await nftResponse.json()

      // Process Old Rock NFTs
      const oldRockNFTs =
        nftData?.data.OldRocks?.map((nft: any) => ({
          tokenId: nft.id,
          name: nft.name,
          image: nft.imageId?.replace('.webp', '-300.webp'),
          collection: "Old Rock",
          contractAddress: "0x5c83df384971eF5bA252336f78Ad97D26a0EC7DF",
          attributes: nft.attributes,
          backgroundColor: getBackgroundColor(nft.attributes, "oldrock"),
        })) || []

      // Process Goliath NFTs
      const goliathNFTs =
        nftData?.data.Goliath?.map((nft: any) => ({
          tokenId: nft.id,
          name: nft.name,
          image: nft.imageId?.replace('.webp', '-300.webp'),
          collection: "Goliath",
          contractAddress: "0x05ab5a50f77b9957b51145b259f05e805d84e92e",
          attributes: nft.attributes,
          backgroundColor: getBackgroundColor(nft.attributes, "goliath"),
          linkedRock: nft.linkedRock || null,
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
    const typeAttribute = attributes.Type;

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
      return colorMap[typeAttribute] || "#6B46C1"
    }
  } else if (collection === "goliath") {
    // Map Goliath density to background colors
    const densityAttribute = attributes.Density

    if (densityAttribute) {
      const densityMap: { [key: string]: string } = {
        Uninfected: "#10B981",
        Low: "#3B82F6",
        Medium: "#8B5CF6",
        High: "#EF4444",
        Mystic: "#F59E0B",
        Bounty: "#EC4899",
      }

      return densityMap[densityAttribute] || "#6B46C1"
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
    const colorAttr = nft.attributes?.Type;
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
    const densityAttr = nft.attributes?.Density;
    if (densityAttr) {
      goliathDensities.add(densityAttr)
    }
  })
  const requiredDensities = ["Common", "Low", "Medium", "High", "Mystic"]
  const hasAllDensities = requiredDensities.every((density) =>
    Array.from(goliathDensities).some((userDensity) => userDensity?.includes(density)),
  )
  if (hasAllDensities) {
    badges.push({ id: 50, unlocked: true })
  }

  // Mystic Holder
  const hasMysticRock = oldRockNFTs.some((nft) => !!nft?.attributes?.Mystic)
  if (hasMysticRock) {
    badges.push({ id: 51, unlocked: true })
  }

  // Bounty Hunter
  const hasBountyGoliath = goliathNFTs.some((nft) => !!nft?.attributes?.Bounty)
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
