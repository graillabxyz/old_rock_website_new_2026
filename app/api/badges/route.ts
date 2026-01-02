import { type NextRequest, NextResponse } from "next/server"
import { calculateAllBadges, getBestBadges } from "@/lib/badge-utils"

export const dynamic = "force-dynamic"

/**
 * GET /api/badges?address=0x...
 * Returns all badges and best badges for a user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get("address")

    if (!address) {
      return NextResponse.json({ success: false, error: "Address required" }, { status: 400 })
    }

    // Fetch user density
    let totalDensity = 0
    try {
      const amplifyApiUrl = process.env.NEXT_PUBLIC_AMPLIFY_API_URL
      if (amplifyApiUrl) {
        const densityResponse = await fetch(`${amplifyApiUrl}/density/${address}`, {
          cache: "no-store",
          headers: { Accept: "application/json" },
          signal: AbortSignal.timeout(5000),
        })
        if (densityResponse.ok) {
          const densityData = await densityResponse.json()
          totalDensity = parseFloat(densityData?.data?.amount || "0") || 0
        }
      }
    } catch (error) {
      console.warn(`Failed to fetch density for ${address}:`, error)
    }

    // Fetch NFT data
    let oldRockNFTs: any[] = []
    let goliathNFTs: any[] = []
    try {
      const amplifyApiUrl = process.env.NEXT_PUBLIC_AMPLIFY_API_URL
      if (amplifyApiUrl) {
        const nftResponse = await fetch(`${amplifyApiUrl}/nfts/${address}`, {
          cache: "no-store",
          headers: { Accept: "application/json" },
          signal: AbortSignal.timeout(5000),
        })
        if (nftResponse.ok) {
          const nftData = await nftResponse.json()
          oldRockNFTs = nftData?.data?.OldRocks || []
          goliathNFTs = nftData?.data?.Goliath || []
        }
      }
    } catch (error) {
      console.warn(`Failed to fetch NFTs for ${address}:`, error)
    }

    // Calculate badges
    const badgeData = {
      totalDensity,
      oldRockNFTs,
      goliathNFTs,
    }

    const allBadges = calculateAllBadges(badgeData)
    const bestBadges = getBestBadges(allBadges)

    return NextResponse.json({
      success: true,
      data: {
        allBadges,
        bestBadges,
        totalDensity,
        oldRockCount: oldRockNFTs.length,
        goliathCount: goliathNFTs.length,
      },
    })
  } catch (error) {
    console.error("Error calculating badges:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

