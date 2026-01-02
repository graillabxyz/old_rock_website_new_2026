/**
 * IPFS Upload Utility
 * Uses web3.storage for IPFS uploads
 */

// Supported file types for IPFS - visual formats only
export const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg", // jpg
  "image/jpg",  // jpg
  "image/png",  // png
  "image/gif",  // gif
  "image/webp", // webp
]

export const SUPPORTED_VIDEO_TYPES = [
  "video/mp4",  // mp4
  "video/webm", // webm
]

export const SUPPORTED_TYPES = [...SUPPORTED_IMAGE_TYPES, ...SUPPORTED_VIDEO_TYPES]

// File extensions for validation
export const SUPPORTED_EXTENSIONS = [".webp", ".webm", ".mp4", ".gif", ".jpg", ".jpeg", ".png"]

export const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB for banner uploads

/**
 * Uploads a file to IPFS via the API route
 * @param file - The file to upload
 * @returns IPFS hash (CID) or null if upload fails
 */
export async function uploadToIPFS(file: File): Promise<string | null> {
  try {
    // Validate file extension
    const fileName = file.name.toLowerCase()
    const hasValidExtension = SUPPORTED_EXTENSIONS.some(ext => fileName.endsWith(ext))
    
    if (!hasValidExtension) {
      throw new Error(`Unsupported file format. Supported formats: ${SUPPORTED_EXTENSIONS.join(", ")}`)
    }

    // Validate file type
    if (!SUPPORTED_TYPES.includes(file.type)) {
      throw new Error(`Unsupported file type: ${file.type}. Supported types: webp, webm, mp4, gif, jpg, png`)
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds maximum of ${MAX_FILE_SIZE / 1024 / 1024}MB`)
    }

    // Upload via API route (server-side handles IPFS upload)
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch("/api/ipfs/upload", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `IPFS upload failed: ${response.statusText}`)
    }

    const data = await response.json()
    return data.cid || null
  } catch (error) {
    console.error("Error uploading to IPFS:", error)
    throw error
  }
}

/**
 * Converts an IPFS hash to a gateway URL
 * @param hash - IPFS hash (CID)
 * @returns Gateway URL
 */
export function getIPFSGatewayURL(hash: string): string {
  if (!hash) return ""
  
  // Remove ipfs:// prefix if present
  const cleanHash = hash.replace(/^ipfs:\/\//, "")
  
  // Use a reliable IPFS gateway
  return `https://ipfs.io/ipfs/${cleanHash}`
}

/**
 * Checks if a URL is an IPFS URL
 */
export function isIPFSURL(url: string): boolean {
  return url.startsWith("ipfs://") || url.includes("ipfs.io") || url.includes("/ipfs/")
}

