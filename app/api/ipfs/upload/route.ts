import { NextRequest, NextResponse } from "next/server"

const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 })
    }

    // Validate file extension
    const fileName = file.name.toLowerCase()
    const validExtensions = [".webp", ".webm", ".mp4", ".gif", ".jpg", ".jpeg", ".png"]
    const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext))
    
    if (!hasValidExtension) {
      return NextResponse.json(
        { success: false, error: `Unsupported file format. Supported formats: ${validExtensions.join(", ")}` },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: `File size exceeds maximum of ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      )
    }

    // Try web3.storage first
    const WEB3_STORAGE_TOKEN = process.env.WEB3_STORAGE_TOKEN
    if (WEB3_STORAGE_TOKEN) {
      try {
        const uploadFormData = new FormData()
        uploadFormData.append("file", file)

        const response = await fetch("https://api.web3.storage/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${WEB3_STORAGE_TOKEN}`,
          },
          body: uploadFormData,
        })

        if (response.ok) {
          const data = await response.json()
          return NextResponse.json({ success: true, cid: data.cid })
        }
      } catch (error) {
        console.error("Web3.storage upload failed:", error)
      }
    }

    // Fallback to Pinata
    const PINATA_API_KEY = process.env.PINATA_API_KEY
    const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY

    if (PINATA_API_KEY && PINATA_SECRET_KEY) {
      try {
        const uploadFormData = new FormData()
        uploadFormData.append("file", file)

        const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
          method: "POST",
          headers: {
            pinata_api_key: PINATA_API_KEY,
            pinata_secret_api_key: PINATA_SECRET_KEY,
          },
          body: uploadFormData,
        })

        if (response.ok) {
          const data = await response.json()
          return NextResponse.json({ success: true, cid: data.IpfsHash })
        }
      } catch (error) {
        console.error("Pinata upload failed:", error)
      }
    }

    return NextResponse.json(
      { success: false, error: "IPFS upload service not configured. Please set WEB3_STORAGE_TOKEN or Pinata credentials." },
      { status: 500 }
    )
  } catch (error: any) {
    console.error("Error uploading to IPFS:", error)
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to upload file" },
      { status: 500 }
    )
  }
}

