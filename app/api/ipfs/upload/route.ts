import { NextRequest, NextResponse } from "next/server"
import sharp from "sharp"

const MAX_FILE_SIZE = 500 * 1024 // 500KB for banner uploads

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Require wallet address header to prevent anonymous uploads
    const walletAddress = request.headers.get('x-wallet-address');
    if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return NextResponse.json(
        { success: false, error: "Valid wallet address required for uploads" },
        { status: 401 }
      );
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 })
    }

    // Validate file extension - only images allowed
    const fileName = file.name.toLowerCase()
    const validExtensions = [".png", ".jpg", ".jpeg", ".webp"]
    const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext))

    if (!hasValidExtension) {
      return NextResponse.json(
        { success: false, error: `Unsupported file format. Supported formats: PNG, JPG, WebP` },
        { status: 400 }
      )
    }

    // Validate file type
    const validMimeTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"]
    if (!validMimeTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: `Unsupported file type. Only image files (PNG, JPG, WebP) are allowed.` },
        { status: 400 }
      )
    }

    // Note: We don't check file size here - PNG/JPG files will be converted to WebP
    // which should be much smaller. We only validate the final WebP file size.

    // Use Pinata for IPFS uploads
    const PINATA_JWT = process.env.PINATA_JWT

    if (!PINATA_JWT) {
      console.error("PINATA_JWT is missing from environment variables. Please ensure PINATA_JWT is set in your deployment environment variables.")
      return NextResponse.json(
        { success: false, error: "Upload service is temporarily unavailable. Please try again in a moment. If the issue persists, contact support." },
        { status: 500 }
      )
    }

    try {
      // Convert PNG/JPG to WebP for space savings
      let fileToUpload = file
      let fileName = file.name

      const isPngOrJpg = file.type === "image/png" ||
        file.type === "image/jpeg" ||
        file.type === "image/jpg" ||
        fileName.toLowerCase().endsWith(".png") ||
        fileName.toLowerCase().endsWith(".jpg") ||
        fileName.toLowerCase().endsWith(".jpeg")

      if (isPngOrJpg) {
        // Convert PNG/JPG to WebP for space savings
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // Try multiple quality levels to get under the size limit
        let webpBuffer: Buffer | null = null
        let quality = 85

        for (let attempt = 0; attempt < 3; attempt++) {
          webpBuffer = await sharp(buffer)
            .webp({ quality })
            .toBuffer()

          if (webpBuffer.length <= MAX_FILE_SIZE) {
            break
          }

          // Reduce quality for next attempt
          quality = Math.max(50, quality - 15)
        }

        // Final check - if still too large, reject
        if (!webpBuffer || webpBuffer.length > MAX_FILE_SIZE) {
          return NextResponse.json(
            { success: false, error: `Image is too large. Please try a smaller or less detailed image.` },
            { status: 400 }
          )
        }

        fileToUpload = new File([webpBuffer], fileName.replace(/\.(png|jpg|jpeg)$/i, ".webp"), {
          type: "image/webp",
        })

        console.log(`Converted ${file.name} (${(file.size / 1024).toFixed(2)}KB) to WebP (${(fileToUpload.size / 1024).toFixed(2)}KB)`)
      } else if (file.type === "image/webp") {
        // For WebP files, check size directly
        if (file.size > MAX_FILE_SIZE) {
          return NextResponse.json(
            { success: false, error: `WebP file is too large. Please use a smaller image or convert PNG/JPG files which will be automatically optimized.` },
            { status: 400 }
          )
        }
      }

      // Pinata API endpoint for file uploads
      const uploadFormData = new FormData()
      uploadFormData.append("file", fileToUpload)

      const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PINATA_JWT}`,
        },
        body: uploadFormData,
      })

      if (!response.ok) {
        let errorText: string
        let errorData: any

        try {
          errorText = await response.text()
          try {
            errorData = JSON.parse(errorText)
          } catch {
            errorData = { message: errorText }
          }
        } catch {
          errorText = "Unknown error"
          errorData = {}
        }

        console.error("Pinata upload failed:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
          errorText: errorText,
          tokenLength: PINATA_JWT.length,
          tokenPrefix: PINATA_JWT.substring(0, 15) + "...",
          hasToken: !!PINATA_JWT
        })

        // Provide more specific error messages
        if (response.status === 401 || response.status === 403) {
          const pinataError = errorData?.error?.details || errorData?.error?.reason || errorData?.message || errorText
          throw new Error(`Pinata authentication failed: ${pinataError || "Invalid or expired JWT token. Please check your PINATA_JWT in Railway variables."}`)
        } else if (response.status === 413) {
          throw new Error("File too large for upload service.")
        } else if (response.status >= 500) {
          throw new Error("Upload service is temporarily unavailable. Please try again later.")
        } else {
          throw new Error(`Upload failed: ${errorData?.message || response.statusText}`)
        }
      }

      const data = await response.json()
      // Pinata returns the CID in data.IpfsHash
      const cid = data.IpfsHash

      if (!cid) {
        throw new Error("No CID returned from Pinata")
      }

      return NextResponse.json({ success: true, cid: String(cid) })
    } catch (error: any) {
      console.error("Pinata upload error:", error)
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

