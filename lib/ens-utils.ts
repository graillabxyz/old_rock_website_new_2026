import { ethers } from "ethers"

// ENS Public Resolver contract address on mainnet
const ENS_PUBLIC_RESOLVER_ADDRESS = "0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41"

// Public Resolver ABI - only the functions we need
const PUBLIC_RESOLVER_ABI = [
  "function setText(bytes32 node, string calldata key, string calldata value) external",
  "function text(bytes32 node, string calldata key) external view returns (string memory)",
]

/**
 * Sets the ENS avatar for a given ENS name
 * @param provider - The ethers provider (from window.ethereum)
 * @param ensName - The ENS name (e.g., "vitalik.eth")
 * @param imageUrl - The URL of the image to set as avatar
 * @returns Transaction receipt
 */
export async function setENSAvatar(
  provider: any,
  ensName: string,
  imageUrl: string
): Promise<ethers.TransactionReceipt> {
  if (!provider) {
    throw new Error("Provider is required")
  }

  if (!ensName || !ensName.endsWith(".eth")) {
    throw new Error("Valid ENS name required (must end with .eth)")
  }

  // Create ethers provider and signer
  const ethersProvider = new ethers.BrowserProvider(provider)
  const signer = await ethersProvider.getSigner()

  // Get the namehash of the ENS name
  const namehash = ethers.namehash(ensName)

  // Get the resolver for this name
  const resolver = await ethersProvider.getResolver(ensName)
  if (!resolver) {
    throw new Error(`No resolver found for ${ensName}. Make sure you own this ENS name and have a resolver configured.`)
  }

  // Get the resolver address
  const resolverAddress = await resolver.getAddress()
  
  // Create contract instance with the Public Resolver ABI
  // Note: This will work even if the resolver is not the Public Resolver,
  // as long as it implements the setText function
  const resolverContract = new ethers.Contract(resolverAddress, PUBLIC_RESOLVER_ABI, signer)

  // Set the avatar text record
  // The namehash is already computed, but we can also use the resolver's setText directly
  // Some resolvers might require the namehash, others might accept the name
  let tx
  try {
    // Try with namehash first (most common)
    tx = await resolverContract.setText(namehash, "avatar", imageUrl)
  } catch (error: any) {
    // If that fails, try using the resolver's setText method directly
    // Some resolvers might handle this differently
    if (error?.code === "CALL_EXCEPTION" || error?.message?.includes("function")) {
      throw new Error(`The resolver for ${ensName} does not support setting text records. Please ensure you're using a compatible resolver.`)
    }
    throw error
  }
  
  // Wait for transaction confirmation
  const receipt = await tx.wait()
  
  return receipt
}

/**
 * Gets the current ENS avatar for a given ENS name
 * @param provider - The ethers provider
 * @param ensName - The ENS name (e.g., "vitalik.eth")
 * @returns The avatar URL or null if not set
 */
export async function getENSAvatar(
  provider: any,
  ensName: string
): Promise<string | null> {
  if (!provider || !ensName || !ensName.endsWith(".eth")) {
    return null
  }

  try {
    const ethersProvider = new ethers.BrowserProvider(provider)
    const resolver = await ethersProvider.getResolver(ensName)
    
    if (!resolver) {
      return null
    }

    const avatar = await resolver.getText("avatar")
    return avatar || null
  } catch (error) {
    console.error("Error getting ENS avatar:", error)
    return null
  }
}

