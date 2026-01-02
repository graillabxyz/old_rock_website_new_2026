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
  const resolverContract = new ethers.Contract(resolverAddress, PUBLIC_RESOLVER_ABI, signer)

  // Check if the resolver supports setText by checking if the function exists
  // We'll try to call it and handle the error if it doesn't exist
  let tx
  try {
    // First, verify the resolver supports text records by checking if we can read
    try {
      await resolver.getText("avatar")
    } catch (readError) {
      // If we can't read, the resolver might not support text records
      // But we'll still try to write in case it's a write-only resolver
    }

    // Try to set the avatar text record using namehash
    tx = await resolverContract.setText(namehash, "avatar", imageUrl)
  } catch (error: any) {
    // Provide more helpful error messages based on the error type
    if (error?.code === "CALL_EXCEPTION" || error?.message?.includes("function") || error?.message?.includes("not supported")) {
      const publicResolverAddress = ENS_PUBLIC_RESOLVER_ADDRESS.toLowerCase()
      const currentResolverAddress = resolverAddress.toLowerCase()
      
      if (currentResolverAddress !== publicResolverAddress) {
        throw new Error(
          `Your ENS name "${ensName}" is using a resolver that doesn't support text records. ` +
          `Please update your resolver to the Public Resolver using the ENS Manager app: ` +
          `https://app.ens.domains/name/${ensName}/details`
        )
      } else {
        throw new Error(
          `Failed to set avatar. The resolver may not support text records. ` +
          `Please try again or contact support if the issue persists.`
        )
      }
    }
    
    if (error?.code === 4001 || error?.message?.includes("user rejected") || error?.message?.includes("denied")) {
      throw new Error("Transaction was rejected by user.")
    }
    
    if (error?.message?.includes("insufficient funds")) {
      throw new Error("Insufficient funds to complete the transaction.")
    }
    
    // Re-throw with original message if it's a different error
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

