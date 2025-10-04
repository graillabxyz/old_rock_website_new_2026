"use server"

export async function fetchBountyNFTs() {
  try {
    const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY

    if (!ALCHEMY_API_KEY) {
      console.warn("Alchemy API key not found")
      return { success: false, bounties: [] }
    }

    // Fetch NFTs from the Goliath collection
    const response = await fetch(
      `https://eth-mainnet.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}/getNFTsForCollection?contractAddress=0x05ab5a50f77b9957b51145b259f05e805d84e92e&limit=100&withMetadata=true`,
    )

    if (!response.ok) {
      throw new Error("Failed to fetch Goliath NFTs")
    }

    const data = await response.json()
    const nfts = data.nfts || []

    // Filter for bounty NFTs specifically
    const bountyNFTs = nfts.filter((nft: any) => {
      if (nft.raw?.metadata?.attributes) {
        // Check for bounty attribute
        const bountyAttribute = nft.raw.metadata.attributes.find(
          (attr: any) =>
            attr.trait_type === "Bounty" ||
            attr.trait_type === "BOUNTY" ||
            attr.trait_type === "bounty" ||
            attr.trait_type === "Bounties" ||
            attr.trait_type === "BOUNTIES" ||
            attr.trait_type === "bounties",
        )

        if (bountyAttribute && bountyAttribute.value) {
          return true
        }

        // Also check by name for bounty keywords
        const name = nft.raw?.metadata?.name || ""
        return (
          name.toLowerCase().includes("bounty") ||
          name.toLowerCase().includes("archon") ||
          name.toLowerCase().includes("reaper") ||
          name.toLowerCase().includes("siren") ||
          name.toLowerCase().includes("silverstrike") ||
          name.toLowerCase().includes("unknown")
        )
      }
      return false
    })

    // Group bounties by type
    const bountyTypes = {
      "The Archon": [],
      "The Reaper": [],
      Silverstrike: [],
      Unknown: [],
      "The Siren": [],
    }

    bountyNFTs.forEach((nft: any) => {
      const bountyAttribute = nft.raw?.metadata?.attributes?.find(
        (attr: any) => attr.trait_type === "Bounty" || attr.trait_type === "BOUNTY" || attr.trait_type === "bounty",
      )

      if (bountyAttribute && bountyAttribute.value) {
        const bountyValue = bountyAttribute.value.trim()

        // Direct matching with the exact bounty names
        if (bountyTypes[bountyValue]) {
          bountyTypes[bountyValue].push(nft)
          console.log(`Added NFT ${nft.tokenId} to ${bountyValue} category`)
        } else {
          console.log(`Unknown bounty type: ${bountyValue} for NFT ${nft.tokenId}`)
        }
      }
    })

    // Select one representative NFT for each bounty type
    const selectedBounties = Object.entries(bountyTypes)
      .map(([bountyName, nfts]) => {
        if (nfts.length > 0) {
          const randomNFT = nfts[Math.floor(Math.random() * nfts.length)]
          return {
            name: bountyName,
            image: randomNFT.image?.originalUrl || randomNFT.image?.cachedUrl || randomNFT.image?.thumbnailUrl,
            tokenId: randomNFT.tokenId,
            description: getBounteDescription(bountyName),
            rarity: "Legendary",
            status: "WANTED",
          }
        }
        return null
      })
      .filter(Boolean)

    return { success: true, bounties: selectedBounties }
  } catch (error) {
    console.error("Error fetching bounty NFTs:", error)
    return { success: false, bounties: [] }
  }
}

function getBounteDescription(bountyName: string): string {
  const descriptions = {
    "The Siren":
      "Our sources report the appearance of The Siren to be a young woman, around 5'8 with a slender build, often seen wearing a black leather jacket and boots or heavy armor. She seems to have contracted Goliath, as aquamarine stones grow from her face and neck. She was last spotted around a small town 20 miles north along the coastline. She is know to be seductive and tricky, and will use your curiosity against you! Her allure seems to have an effect on men and women alike! Good luck bounty hunter!",
    Silverstrike:
      "Our sources report that the infamous marauder, Silverstrike, is on the move again. He's known for his ruthless tactics and his addiction to the silver rocks growing on him. He's been spotted in a small mining town 50 miles south of the city. This nefarious character is violence incarnate. His brute strength seems to surpass that of a man five times is size. Be careful, bounty hunter. This one won't go down without a fight.",
    "The Archon":
      "This man, once an ordinary citizen, has become the epitome of suffering and anguish, as his body is now covered in red rocks that burn with an insatiable fire from within. The only reprieve from his torment is to release the fire that courses through his veins, a destructive force so overwhelming that it pushes him to the fringes of society. He is now the epicenter of an elite cabal of fire-attuned red-rock individuals. His followers are said to be so devout that they are well known for sacrificing themselves to his throne, increasing his connection with the all consuming fire...",
    "The Reaper":
      "Enveloped in a heavy cloak that whispers stories of countless storms, he stands tall in the shadows. The Reaper, a land pirate who transcends space and time, possesses the astonishing powers of black rocks sprouting from his skin, like volcanic eruptions on a barren moon. These rocks grant him the ability to teleport short distances, vanishing and reappearing like a phantom in the night, and to manipulate dark matter, bending the fabric of the universe to his sinister will. The Reaper, a specter with a thousand faces, was last spotted in a city 120 km north, where the whispers of his presence echo like distant thunder.",
    Unknown:
      'You might feel the peculiar sensation of deja vu upon encountering the elusive bounty, "Unknown." Shrouded in a veil of darkness, she slinks through the shadows, her power over dark matter bending reality to her whims. When you stand on the precipice of time, watching her teleport with an otherworldly grace, a lingering question takes root in your mind: is she a force of nature or a carefully crafted enigma? Tread lightly, for in the pursuit of this dangerous enigma, you must dance on the razor\'s edge.',
  }
  return descriptions[bountyName as keyof typeof descriptions] || "A dangerous bounty with unknown capabilities."
}
