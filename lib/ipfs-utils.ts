/**
 * IPFS Upload Utility
 * Uses Pinata for IPFS uploads
 */

// Supported file types for IPFS - images only
export const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg", // jpg
  "image/jpg",  // jpg
  "image/png",  // png
  "image/webp", // webp
]

export const SUPPORTED_TYPES = [...SUPPORTED_IMAGE_TYPES]

// File extensions for validation
export const SUPPORTED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp"]

export const MAX_FILE_SIZE = 500 * 1024 // 500KB for banner uploads

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
      throw new Error(`Unsupported file type: ${file.type}. Supported types: PNG, JPG, WebP`)
    }

    // Note: File size validation happens on the server after conversion
    // Users can upload PNG/JPG files of any size - they'll be converted to WebP

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

