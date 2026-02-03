import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Require wallet address header to prevent unauthorized unpinning
    const walletAddress = request.headers.get('x-wallet-address');
    if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return NextResponse.json(
        { success: false, error: "Valid wallet address required" },
        { status: 401 }
      );
    }

    const { cid } = await request.json()

    if (!cid) {
      return NextResponse.json({ success: false, error: "No CID provided" }, { status: 400 })
    }

    const PINATA_JWT = process.env.PINATA_JWT

    if (!PINATA_JWT) {
      return NextResponse.json(
        { success: false, error: "Pinata service not configured" },
        { status: 500 }
      )
    }

    try {
      // Pinata API endpoint for unpinning
      const response = await fetch(`https://api.pinata.cloud/pinning/unpin/${cid}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${PINATA_JWT}`,
        },
      })

      if (!response.ok) {
        // If the file is already unpinned or doesn't exist, that's okay
        if (response.status === 404) {
          console.log(`CID ${cid} not found in Pinata (may already be unpinned)`)
          return NextResponse.json({ success: true, message: "Already unpinned or not found" })
        }

        const errorText = await response.text()
        console.error("Pinata unpin failed:", {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          cid,
        })

        // Don't fail the request if unpin fails - it's not critical
        return NextResponse.json({
          success: false,
          error: `Failed to unpin: ${response.statusText}`,
        })
      }

      return NextResponse.json({ success: true, message: "Successfully unpinned" })
    } catch (error: any) {
      console.error("Pinata unpin error:", error)
      // Don't fail the request if unpin fails - it's not critical
      return NextResponse.json({
        success: false,
        error: error?.message || "Failed to unpin from IPFS",
      })
    }
  } catch (error: any) {
    console.error("Error unpinning from IPFS:", error)
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to process unpin request" },
      { status: 500 }
    )
  }
}

