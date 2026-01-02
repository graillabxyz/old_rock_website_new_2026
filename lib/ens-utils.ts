import { ethers } from "ethers"

// ENS Registry contract address on mainnet
const ENS_REGISTRY_ADDRESS = "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e"

// ENS Public Resolver contract address on mainnet (v3)
const ENS_PUBLIC_RESOLVER_ADDRESS = "0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41"

// Text records interface ID (ERC-165 interface ID for text records)
const TEXT_INTERFACE_ID = "0x59d1d43c"

// ENS Registry ABI - only the functions we need
const ENS_REGISTRY_ABI = [
  "function setResolver(bytes32 node, address resolver) external",
  "function resolver(bytes32 node) external view returns (address)",
]

// Public Resolver ABI - only the functions we need
const PUBLIC_RESOLVER_ABI = [
  "function setText(bytes32 node, string calldata key, string calldata value) external",
  "function text(bytes32 node, string calldata key) external view returns (string memory)",
  "function supportsInterface(bytes4 interfaceID) external pure returns (bool)",
]

/**
 * Checks if a resolver supports text records
 */
async function resolverSupportsText(
  resolver: ethers.Resolver,
  provider: ethers.BrowserProvider
): Promise<boolean> {
  try {
    const resolverAddress = await resolver.getAddress()
    
    // Create a contract instance to check interface support
    const resolverContract = new ethers.Contract(
      resolverAddress,
      PUBLIC_RESOLVER_ABI,
      provider
    )
    
    // Check if the resolver supports the text records interface
    const supportsText = await resolverContract.supportsInterface(TEXT_INTERFACE_ID)
    return supportsText
  } catch (error) {
    console.error("Error checking resolver text support:", error)
    return false
  }
}

/**
 * Upgrades the resolver for an ENS name to the Public Resolver
 * @param provider - The ethers provider (from window.ethereum)
 * @param ensName - The ENS name (e.g., "vitalik.eth")
 * @returns Transaction receipt
 */
export async function upgradeENSResolver(
  provider: any,
  ensName: string
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

  // Create ENS Registry contract instance
  const registry = new ethers.Contract(ENS_REGISTRY_ADDRESS, ENS_REGISTRY_ABI, signer)

  // Upgrade to Public Resolver
  const tx = await registry.setResolver(namehash, ENS_PUBLIC_RESOLVER_ADDRESS)
  
  // Wait for transaction confirmation
  const receipt = await tx.wait()
  
  return receipt
}

/**
 * Sets the ENS avatar for a given ENS name
 * Automatically upgrades resolver if needed
 * @param provider - The ethers provider (from window.ethereum)
 * @param ensName - The ENS name (e.g., "vitalik.eth")
 * @param imageUrl - The URL of the image to set as avatar
 * @param onResolverUpgrade - Optional callback when resolver upgrade is needed
 * @returns Transaction receipt
 */
export async function setENSAvatar(
  provider: any,
  ensName: string,
  imageUrl: string,
  onResolverUpgrade?: (needsUpgrade: boolean) => Promise<boolean>
): Promise<{ receipt: ethers.TransactionReceipt; upgradedResolver: boolean }> {
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
  let resolver = await ethersProvider.getResolver(ensName)
  if (!resolver) {
    throw new Error(`No resolver found for ${ensName}. Make sure you own this ENS name and have a resolver configured.`)
  }

  // Check if resolver supports text records
  const supportsText = await resolverSupportsText(resolver, ethersProvider)
  let upgradedResolver = false

  // If resolver doesn't support text records, upgrade it
  if (!supportsText) {
    // Notify the callback that upgrade is needed
    if (onResolverUpgrade) {
      const shouldUpgrade = await onResolverUpgrade(true)
      if (!shouldUpgrade) {
        throw new Error("Resolver upgrade was cancelled by user.")
      }
    }

    // Upgrade the resolver
    await upgradeENSResolver(provider, ensName)
    upgradedResolver = true

    // Wait a moment for the resolver to be updated
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Re-fetch the resolver
    resolver = await ethersProvider.getResolver(ensName)
    if (!resolver) {
      throw new Error("Failed to get resolver after upgrade. Please try again.")
    }

    // Verify the new resolver supports text records
    const newSupportsText = await resolverSupportsText(resolver, ethersProvider)
    if (!newSupportsText) {
      throw new Error("Resolver upgrade completed but new resolver doesn't support text records. Please try again.")
    }
  }

  // Get the resolver address
  const resolverAddress = await resolver.getAddress()
  
  // Create contract instance with the Public Resolver ABI
  const resolverContract = new ethers.Contract(resolverAddress, PUBLIC_RESOLVER_ABI, signer)

  // Set the avatar text record using namehash
  let tx
  try {
    tx = await resolverContract.setText(namehash, "avatar", imageUrl)
  } catch (error: any) {
    if (error?.code === 4001 || error?.message?.includes("user rejected") || error?.message?.includes("denied")) {
      throw new Error("Transaction was rejected by user.")
    }
    
    if (error?.message?.includes("insufficient funds")) {
      throw new Error("Insufficient funds to complete the transaction.")
    }
    
    throw error
  }
  
  // Wait for transaction confirmation
  const receipt = await tx.wait()
  
  return { receipt, upgradedResolver }
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

/**
 * Checks if an ENS name's resolver supports text records
 * @param provider - The ethers provider
 * @param ensName - The ENS name (e.g., "vitalik.eth")
 * @returns True if resolver supports text records, false otherwise
 */
export async function checkResolverSupportsText(
  provider: any,
  ensName: string
): Promise<boolean> {
  if (!provider || !ensName || !ensName.endsWith(".eth")) {
    return false
  }

  try {
    const ethersProvider = new ethers.BrowserProvider(provider)
    const resolver = await ethersProvider.getResolver(ensName)
    
    if (!resolver) {
      return false
    }

    return await resolverSupportsText(resolver, ethersProvider)
  } catch (error) {
    console.error("Error checking resolver text support:", error)
    return false
  }
}
