import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")

    // Only use server-side environment variable
    const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY

    if (!ALCHEMY_API_KEY) {
      console.error("❌ No server-side Alchemy API key found")
      return NextResponse.json({ success: false, error: "No server-side API key configured" }, { status: 500 })
    }

    switch (action) {
      case "goliath":
        return await fetchGoliathNFTs(ALCHEMY_API_KEY)
      case "goliath-density":
        return await fetchGoliathNFTsByDensity(ALCHEMY_API_KEY)
      case "old-rock":
        return await fetchOldRockNFTs(ALCHEMY_API_KEY)
      case "collection-stats":
        return await fetchCollectionStats(ALCHEMY_API_KEY)
      default:
        return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("💥 Error in NFT API route:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

async function fetchGoliathNFTs() {
  try {
    const response = await fetch(
      `https://metadata.oldrocknft.com/goliath/random`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      },
    )

    if (!response.ok) {
      console.error(`❌ Metadata service API error: ${response.status} ${response.statusText}`)
      return NextResponse.json({ success: false, error: `API Error: ${response.status}` }, { status: response.status })
    }

    const data = await response.json()
    console.log("✅ Metadata service API response received, processing NFTs...")

    if (!data || data.length === 0) {
      console.warn("⚠️ No Goliath NFTs found in collection");
      return NextResponse.json({ success: false, error: "No NFTs found" })
    }

    const processedImages = []

    for (const nft of data) {
      processedImages.push(nft.image.replace('.webp', '-300.webp'));

      if (processedImages.length >= 16) {
        break
      }
    }

    const shuffledImages = processedImages.sort(() => Math.random() - 0.5)

    return NextResponse.json({
      success: true,
      images: shuffledImages,
    })
  } catch (error) {
    console.error("💥 Error fetching Goliath NFTs:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error occurred" },
      { status: 500 },
    )
  }
}

async function fetchCollectionStats(ALCHEMY_API_KEY: string) {
  try {
    console.log("📊 Fetching collection stats...")

    const [oldRockResponse, goliathResponse] = await Promise.all([
      fetch(
        `https://eth-mainnet.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}/getContractMetadata?contractAddress=0x5c83df384971ef5ba252336f78ad97d26a0ec7df`,
        {
          method: "GET",
          headers: { Accept: "application/json" },
          cache: "no-store",
        },
      ),
      fetch(
        `https://eth-mainnet.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}/getContractMetadata?contractAddress=0x05ab5a50f77b9957b51145b259f05e805d84e92e`,
        {
          method: "GET",
          headers: { Accept: "application/json" },
          cache: "no-store",
        },
      ),
    ])

    if (!oldRockResponse.ok || !goliathResponse.ok) {
      console.error("❌ Failed to fetch collection stats")
      return NextResponse.json({ success: false, error: "Failed to fetch collection metadata" }, { status: 500 })
    }

    const [oldRockData, goliathData] = await Promise.all([oldRockResponse.json(), goliathResponse.json()])

    console.log("✅ Collection stats fetched successfully")

    return NextResponse.json({
      success: true,
      stats: {
        oldRock: oldRockData,
        goliath: goliathData,
      },
    })
  } catch (error) {
    console.error("💥 Error fetching collection stats:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error occurred" },
      { status: 500 },
    )
  }
}

async function fetchOldRockNFTs(ALCHEMY_API_KEY: string) {
  console.log("=== FETCHING OLD ROCK NFTs FROM ALCHEMY ===")
  try {
    console.log("✅ Using Alchemy API key:", ALCHEMY_API_KEY.substring(0, 10) + "...")

    const nftsByColor: any = {}
    const colorCounts: any = {}
    let allNFTs: any[] = []

    const pagesToFetch = 5
    let pageKey = ""

    console.log(`🔄 Fetching ${pagesToFetch} pages of Old Rock NFTs to find rare colors...`)

    for (let page = 0; page < pagesToFetch; page++) {
      console.log(`📄 Fetching page ${page + 1}/${pagesToFetch}...`)

      const url = pageKey
        ? `https://eth-mainnet.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}/getNFTsForCollection?contractAddress=0x5c83df384971ef5ba252336f78ad97d26a0ec7df&withMetadata=true&limit=100&pageKey=${pageKey}`
        : `https://eth-mainnet.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}/getNFTsForCollection?contractAddress=0x5c83df384971ef5ba252336f78ad97d26a0ec7df&withMetadata=true&limit=100`

      const response = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      })

      if (!response.ok) {
        console.error(`❌ Alchemy API error on page ${page + 1}: ${response.status} ${response.statusText}`)
        break
      }

      const data = await response.json()
      console.log(`📊 Page ${page + 1} returned ${data.nfts?.length || 0} NFTs`)

      if (!data.nfts || data.nfts.length === 0) {
        console.log(`⚠️ No more NFTs found on page ${page + 1}, stopping pagination`)
        break
      }

      allNFTs = allNFTs.concat(data.nfts)
      pageKey = data.pageKey

      if (!pageKey) {
        console.log(`✅ Reached end of collection on page ${page + 1}`)
        break
      }
    }

    console.log(`📊 Total NFTs fetched: ${allNFTs.length}`)

    for (const nft of allNFTs) {
      const attributes = nft.raw?.metadata?.attributes || []

      if (attributes.length === 0) {
        continue
      }

      let typeAttr = attributes.find((attr: any) => attr.trait_type && attr.trait_type.toLowerCase() === "type")

      if (!typeAttr) {
        typeAttr = attributes.find(
          (attr: any) =>
            attr.trait_type &&
            (attr.trait_type.toLowerCase().includes("color") ||
              attr.trait_type.toLowerCase().includes("element") ||
              attr.trait_type.toLowerCase().includes("rock") ||
              attr.trait_type.toLowerCase().includes("stone")),
        )
      }

      if (typeAttr && typeAttr.value) {
        let color = typeAttr.value.toString().toUpperCase()

        if (color.includes("BROWN") || color.includes("EARTH") || color === "COMMON") {
          color = "COMMON"
        } else if (color.includes("WHITE") || color.includes("LIGHT")) {
          color = "WHITE"
        } else if (color.includes("BLACK") || color.includes("DARK") || color.includes("VOID")) {
          color = "BLACK"
        }

        if (!nftsByColor[color]) {
          let imageUrl = null

          if (nft.image?.originalUrl && !nft.image.originalUrl.includes("undefined")) {
            imageUrl = nft.image.originalUrl
          } else if (nft.image?.cachedUrl && !nft.image.cachedUrl.includes("undefined")) {
            imageUrl = nft.image.cachedUrl
          } else if (nft.image?.thumbnailUrl && !nft.image.thumbnailUrl.includes("undefined")) {
            imageUrl = nft.image.thumbnailUrl
          } else if (nft.raw?.metadata?.image && !nft.raw.metadata.image.includes("undefined")) {
            imageUrl = nft.raw.metadata.image
            if (imageUrl.startsWith("ipfs://")) {
              imageUrl = imageUrl.replace("ipfs://", "https://ipfs.io/ipfs/")
            }
          }

          if (imageUrl && (imageUrl.startsWith("http://") || imageUrl.startsWith("https://"))) {
            nftsByColor[color] = {
              image: imageUrl,
              tokenId: nft.tokenId,
            }
            colorCounts[color] = 0
            console.log(`✅ Found first ${color} NFT: Token ${nft.tokenId}`)
          }
        }

        colorCounts[color] = (colorCounts[color] || 0) + 1
      }
    }

    console.log(`\n📊 FINAL OLD ROCK RESULTS:`)
    console.log(`Colors found:`, Object.keys(nftsByColor))
    console.log(`Color counts:`, colorCounts)

    return NextResponse.json({
      success: true,
      nfts: nftsByColor,
      counts: colorCounts,
    })
  } catch (error) {
    console.error("💥 Error fetching Old Rock NFTs:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error occurred" },
      { status: 500 },
    )
  }
}

async function fetchGoliathNFTsByDensity(ALCHEMY_API_KEY: string) {
  console.log("=== FETCHING GOLIATH NFTs FROM ALCHEMY ===")
  try {
    console.log("✅ Using Alchemy API key:", ALCHEMY_API_KEY.substring(0, 10) + "...")

    const nftsByDensity: any = {}
    const densityCounts: any = {}
    let allNFTs: any[] = []

    let mysticsFound = 0
    const maxMysticsExpected = 4
    const pagesToFetch = 50
    let pageKey = ""

    console.log(`🔄 Fetching ${pagesToFetch} pages of Goliath NFTs to find rare types...`)

    for (let page = 0; page < pagesToFetch; page++) {
      console.log(`📄 Fetching page ${page + 1}/${pagesToFetch}...`)

      const url = pageKey
        ? `https://eth-mainnet.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}/getNFTsForCollection?contractAddress=0x05ab5a50f77b9957b51145b259f05e805d84e92e&withMetadata=true&limit=100&pageKey=${pageKey}`
        : `https://eth-mainnet.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}/getNFTsForCollection?contractAddress=0x05ab5a50f77b9957b51145b259f05e805d84e92e&withMetadata=true&limit=100`

      const response = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      })

      if (!response.ok) {
        console.error(`❌ Alchemy API error on page ${page + 1}: ${response.status} ${response.statusText}`)
        break
      }

      const data = await response.json()
      console.log(`📊 Page ${page + 1} returned ${data.nfts?.length || 0} NFTs`)

      if (!data.nfts || data.nfts.length === 0) {
        console.log(`⚠️ No more NFTs found on page ${page + 1}, stopping pagination`)
        break
      }

      allNFTs = allNFTs.concat(data.nfts)
      pageKey = data.pageKey

      if (!pageKey) {
        console.log(`✅ Reached end of collection on page ${page + 1}`)
        break
      }
    }

    console.log(`📊 Total Goliath NFTs fetched: ${allNFTs.length}`)

    for (const nft of allNFTs) {
      const attributes = nft.raw?.metadata?.attributes || []

      if (attributes.length === 0) {
        continue
      }

      const densityAttr = attributes.find((attr: any) => attr.trait_type && attr.trait_type.toLowerCase() === "density")
      const bountyAttr = attributes.find((attr: any) => attr.trait_type && attr.trait_type.toLowerCase() === "bounty")
      const rarityAttr = attributes.find((attr: any) => attr.trait_type && attr.trait_type.toLowerCase() === "rarity")
      const typeAttr = attributes.find((attr: any) => attr.trait_type && attr.trait_type.toLowerCase() === "type")
      const classAttr = attributes.find((attr: any) => attr.trait_type && attr.trait_type.toLowerCase() === "class")

      let category = null

      if (bountyAttr && bountyAttr.value !== "None") {
        category = "BOUNTIES"
        console.log(`🎯 Found BOUNTY NFT: Token ${nft.tokenId}, Bounty: ${bountyAttr.value}`)
      } else if (densityAttr && densityAttr.value) {
        const densityValue = densityAttr.value.toString().toLowerCase()

        if (densityValue === "common") {
          category = "UNINFECTED"
        } else if (densityValue === "mystic" || densityValue.includes("mystic")) {
          category = "MYSTICS"
          console.log(`🔮 Found MYSTIC NFT via density: Token ${nft.tokenId}`)
        } else if (densityValue.includes("low")) {
          category = "LOW DENSITY"
        } else if (densityValue.includes("medium")) {
          category = "MEDIUM DENSITY"
        } else if (densityValue.includes("high")) {
          category = "HIGH DENSITY"
        }
      }

      if (!category) {
        if (rarityAttr && rarityAttr.value && rarityAttr.value.toString().toLowerCase().includes("mystic")) {
          category = "MYSTICS"
          console.log(`🔮 Found MYSTIC NFT via rarity: Token ${nft.tokenId}, Rarity: ${rarityAttr.value}`)
        } else if (typeAttr && typeAttr.value && typeAttr.value.toString().toLowerCase().includes("mystic")) {
          category = "MYSTICS"
          console.log(`🔮 Found MYSTIC NFT via type: Token ${nft.tokenId}, Type: ${typeAttr.value}`)
        } else if (classAttr && classAttr.value && classAttr.value.toString().toLowerCase().includes("mystic")) {
          category = "MYSTICS"
          console.log(`🔮 Found MYSTIC NFT via class: Token ${nft.tokenId}, Class: ${classAttr.value}`)
        }
      }

      if (!category) {
        const mysticAttr = attributes.find(
          (attr: any) => attr.value && attr.value.toString().toLowerCase().includes("mystic"),
        )
        if (mysticAttr) {
          category = "MYSTICS"
          console.log(
            `🔮 Found MYSTIC NFT via keyword search: Token ${nft.tokenId}, ${mysticAttr.trait_type}: ${mysticAttr.value}`,
          )
        }
      }

      if (category === "MYSTICS") {
        mysticsFound++
        console.log(`🔮 Found MYSTIC NFT ${mysticsFound}/${maxMysticsExpected}: Token ${nft.tokenId}`)

        if (mysticsFound >= maxMysticsExpected) {
          console.log(`🎉 SUCCESS: Found all ${maxMysticsExpected} Mystic NFTs!`)
        }
      }

      if (category) {
        if (!nftsByDensity[category]) {
          let imageUrl = null

          if (nft.image?.originalUrl && !nft.image.originalUrl.includes("undefined")) {
            imageUrl = nft.image.originalUrl
          } else if (nft.image?.cachedUrl && !nft.image.cachedUrl.includes("undefined")) {
            imageUrl = nft.image.cachedUrl
          } else if (nft.image?.thumbnailUrl && !nft.image.thumbnailUrl.includes("undefined")) {
            imageUrl = nft.image.thumbnailUrl
          } else if (nft.raw?.metadata?.image && !nft.raw.metadata.image.includes("undefined")) {
            imageUrl = nft.raw.metadata.image
            if (imageUrl.startsWith("ipfs://")) {
              imageUrl = imageUrl.replace("ipfs://", "https://ipfs.io/ipfs/")
            }
          }

          if (imageUrl && (imageUrl.startsWith("http://") || imageUrl.startsWith("https://"))) {
            nftsByDensity[category] = {
              image: imageUrl,
              tokenId: nft.tokenId,
            }
            densityCounts[category] = 0
            console.log(`✅ Found first ${category} NFT: Token ${nft.tokenId}`)
          }
        }

        densityCounts[category] = (densityCounts[category] || 0) + 1
      }
    }

    console.log(`\n📊 FINAL GOLIATH RESULTS:`)
    console.log(`Categories found:`, Object.keys(nftsByDensity))
    console.log(`Category counts:`, densityCounts)

    return NextResponse.json({
      success: true,
      nfts: nftsByDensity,
      counts: densityCounts,
    })
  } catch (error) {
    console.error("💥 Error fetching Goliath NFTs by Density:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error occurred" },
      { status: 500 },
    )
  }
}
