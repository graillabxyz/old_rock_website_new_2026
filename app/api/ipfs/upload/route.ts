import { NextRequest, NextResponse } from "next/server"

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB for banner uploads

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

    // Use NFT.Storage for IPFS uploads
    const NFT_STORAGE_TOKEN = process.env.NFT_STORAGE_TOKEN
    
    // Debug logging (remove in production)
    console.log("NFT_STORAGE_TOKEN exists:", !!NFT_STORAGE_TOKEN)
    console.log("NFT_STORAGE_TOKEN length:", NFT_STORAGE_TOKEN?.length || 0)
    
    if (!NFT_STORAGE_TOKEN) {
      console.error("NFT_STORAGE_TOKEN is missing from environment variables. Please ensure .env.local contains NFT_STORAGE_TOKEN and restart the Next.js server.")
      return NextResponse.json(
        { success: false, error: "Upload service is temporarily unavailable. Please try again in a moment. If the issue persists, contact support." },
        { status: 500 }
      )
    }

    try {
      // NFT.Storage API endpoint
      // The API key format is: {key}.{secret}
      // We'll use it directly as the bearer token
      const uploadFormData = new FormData()
      uploadFormData.append("file", file)

      const response = await fetch("https://api.nft.storage/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${NFT_STORAGE_TOKEN}`,
        },
        body: uploadFormData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("NFT.Storage upload failed:", {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          tokenLength: NFT_STORAGE_TOKEN.length,
          tokenPrefix: NFT_STORAGE_TOKEN.substring(0, 10) + "..."
        })
        
        // Provide more specific error messages
        if (response.status === 401 || response.status === 403) {
          throw new Error("Authentication failed. Please check the API key configuration.")
        } else if (response.status === 413) {
          throw new Error("File too large for upload service.")
        } else if (response.status >= 500) {
          throw new Error("Upload service is temporarily unavailable. Please try again later.")
        } else {
          throw new Error(`Upload failed: ${response.statusText}`)
        }
      }

      const data = await response.json()
      // NFT.Storage returns the CID in data.value.cid (v1 format)
      // or directly as data.cid (v0 format)
      let cid = data.value?.cid || data.cid
      
      // If cid is an object, extract the string value
      if (cid && typeof cid === 'object') {
        cid = cid['/'] || cid.toString()
      }
      
      if (!cid) {
        throw new Error("No CID returned from NFT.Storage")
      }

      return NextResponse.json({ success: true, cid: String(cid) })
    } catch (error: any) {
      console.error("NFT.Storage upload error:", error)
      return NextResponse.json(
        { success: false, error: error?.message || "Failed to upload to IPFS" },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error("Error uploading to IPFS:", error)
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to upload file" },
      { status: 500 }
    )
  }
}

