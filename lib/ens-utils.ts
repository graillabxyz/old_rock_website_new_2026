import { ethers } from "ethers"

// ENS Registry contract address on mainnet
const ENS_REGISTRY_ADDRESS = "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e"

// ENS Public Resolver contract address on mainnet (v3)
const ENS_PUBLIC_RESOLVER_ADDRESS = "0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41"

// Text records interface ID (ERC-165 interface ID for text records)
const TEXT_INTERFACE_ID = "0x59d1d43c"

// ENS Registry ABI - functions we need
const ENS_REGISTRY_ABI = [
  "function setResolver(bytes32 node, address resolver) external",
  "function resolver(bytes32 node) external view returns (address)",
  "function owner(bytes32 node) external view returns (address)",
  "function setSubnodeOwner(bytes32 node, bytes32 label, address owner) external",
]

// Public Resolver ABI - functions we need
const PUBLIC_RESOLVER_ABI = [
  "function setText(bytes32 node, string calldata key, string calldata value) external",
  "function text(bytes32 node, string calldata key) external view returns (string memory)",
  "function supportsInterface(bytes4 interfaceID) external pure returns (bool)",
]

/**
 * Gets the ENS name for a given address (reverse lookup) - on-chain only
 */
export async function getENSNameFromAddress(
  provider: ethers.BrowserProvider,
  address: string
): Promise<string | null> {
  try {
    // Use reverse resolver to get ENS name from address
    const name = await provider.lookupAddress(address)
    return name || null
  } catch (error) {
    console.error("Error getting ENS name from address:", error)
    return null
  }
}

/**
 * Validates that the connected wallet owns or manages the ENS name
 * This is done on-chain and cannot be tampered with
 */
async function validateENSOwnership(
  provider: ethers.BrowserProvider,
  signer: ethers.JsonRpcSigner,
  ensName: string
): Promise<{ isOwner: boolean; isManager: boolean }> {
  try {
    const namehash = ethers.namehash(ensName)
    const signerAddress = await signer.getAddress()
    
    // Create ENS Registry contract instance
    const registry = new ethers.Contract(ENS_REGISTRY_ADDRESS, ENS_REGISTRY_ABI, provider)
    
    // Check owner on-chain
    const owner = await registry.owner(namehash)
    const isOwner = owner.toLowerCase() === signerAddress.toLowerCase()
    
    // For now, we'll consider manager = owner
    // In ENS, managers are set via the registry's setSubnodeOwner or via a resolver
    // For simplicity, we check if the signer is the owner
    const isManager = isOwner
    
    return { isOwner, isManager }
  } catch (error) {
    console.error("Error validating ENS ownership:", error)
    throw new Error("Failed to validate ENS ownership. Please ensure you own this ENS name.")
  }
}

/**
 * Checks if a resolver supports text records - on-chain check
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
 * All data is fetched on-chain at transaction time
 */
export async function upgradeENSResolver(
  provider: any,
  ensName: string,
  signerAddress: string
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
  
  // Verify signer matches the provided address
  const actualSignerAddress = await signer.getAddress()
  if (actualSignerAddress.toLowerCase() !== signerAddress.toLowerCase()) {
    throw new Error("Signer address does not match connected wallet")
  }

  // Get the namehash of the ENS name - computed fresh
  const namehash = ethers.namehash(ensName)

  // Validate ownership on-chain before proceeding
  const { isOwner, isManager } = await validateENSOwnership(ethersProvider, signer, ensName)
  if (!isOwner && !isManager) {
    throw new Error(`You do not own or manage ${ensName}. Only the owner or manager can upgrade the resolver.`)
  }

  // Get current resolver on-chain
  const registry = new ethers.Contract(ENS_REGISTRY_ADDRESS, ENS_REGISTRY_ABI, provider)
  const currentResolver = await registry.resolver(namehash)
  
  // Verify we're not already using the Public Resolver
  if (currentResolver.toLowerCase() === ENS_PUBLIC_RESOLVER_ADDRESS.toLowerCase()) {
    throw new Error("Resolver is already set to Public Resolver")
  }

  // Create ENS Registry contract instance with signer
  const registryWithSigner = new ethers.Contract(ENS_REGISTRY_ADDRESS, ENS_REGISTRY_ABI, signer)

  // Upgrade to Public Resolver - transaction constructed at signing time
  const tx = await registryWithSigner.setResolver(namehash, ENS_PUBLIC_RESOLVER_ADDRESS)
  
  // Wait for transaction confirmation
  const receipt = await tx.wait()
  
  return receipt
}

/**
 * Sets the ENS avatar for a given ENS name
 * All data is fetched on-chain at transaction time - no localStorage or cached values
 * @param provider - The ethers provider (from window.ethereum)
 * @param signerAddress - The address of the connected wallet (for validation)
 * @param imageUrl - The URL of the image to set as avatar
 * @param onResolverUpgrade - Optional callback when resolver upgrade is needed
 * @returns Transaction receipt
 */
export async function setENSAvatar(
  provider: any,
  signerAddress: string,
  imageUrl: string,
  onResolverUpgrade?: (needsUpgrade: boolean) => Promise<boolean>
): Promise<{ receipt: ethers.TransactionReceipt; upgradedResolver: boolean; ensName: string }> {
  if (!provider) {
    throw new Error("Provider is required")
  }

  if (!signerAddress) {
    throw new Error("Signer address is required")
  }

  // Create ethers provider and signer
  const ethersProvider = new ethers.BrowserProvider(provider)
  const signer = await ethersProvider.getSigner()
  
  // Verify signer matches the provided address
  const actualSignerAddress = await signer.getAddress()
  if (actualSignerAddress.toLowerCase() !== signerAddress.toLowerCase()) {
    throw new Error("Signer address does not match connected wallet")
  }

  // Get ENS name from connected wallet address - on-chain reverse lookup
  // NEVER use localStorage, query params, or client-side state for ENS name
  const ensName = await getENSNameFromAddress(ethersProvider, signerAddress)
  
  if (!ensName || !ensName.endsWith(".eth")) {
    throw new Error("No ENS name found for connected wallet address. Please ensure your wallet has an ENS name.")
  }

  // Get the namehash of the ENS name - computed fresh from on-chain data
  const namehash = ethers.namehash(ensName)

  // Validate ownership/manager rights on-chain before proceeding
  const { isOwner, isManager } = await validateENSOwnership(ethersProvider, signer, ensName)
  if (!isOwner && !isManager) {
    throw new Error(`You do not own or manage ${ensName}. Only the owner or manager can set the avatar.`)
  }

  // Get the resolver for this name - fetched fresh from on-chain
  let resolver = await ethersProvider.getResolver(ensName)
  if (!resolver) {
    throw new Error(`No resolver found for ${ensName}. Make sure you own this ENS name and have a resolver configured.`)
  }

  // Get resolver address - on-chain
  let resolverAddress = await resolver.getAddress()

  // Check if resolver supports text records - on-chain check
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

    // Upgrade the resolver - all data fetched on-chain
    await upgradeENSResolver(provider, ensName, signerAddress)
    upgradedResolver = true

    // Wait a moment for the resolver to be updated on-chain
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Re-fetch the resolver from on-chain (fresh data)
    resolver = await ethersProvider.getResolver(ensName)
    if (!resolver) {
      throw new Error("Failed to get resolver after upgrade. Please try again.")
    }

    // Get fresh resolver address
    resolverAddress = await resolver.getAddress()

    // Verify the new resolver supports text records - on-chain check
    const newSupportsText = await resolverSupportsText(resolver, ethersProvider)
    if (!newSupportsText) {
      throw new Error("Resolver upgrade completed but new resolver doesn't support text records. Please try again.")
    }
  }

  // Create contract instance with the Public Resolver ABI
  // Resolver address is from on-chain data, not localStorage
  const resolverContract = new ethers.Contract(resolverAddress, PUBLIC_RESOLVER_ABI, signer)

  // Set the avatar text record using namehash
  // namehash is computed from on-chain ENS name, not from localStorage
  // imageUrl is the only parameter that comes from user input (NFT selection)
  let tx
  try {
    // Transaction is constructed at signing time with fresh on-chain data
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
  
  return { receipt, upgradedResolver, ensName }
}

/**
 * Gets the current ENS avatar for a given ENS name - on-chain only
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
 * Checks if an ENS name's resolver supports text records - on-chain only
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

/**
 * Gets ENS name for a connected wallet address - on-chain reverse lookup
 * Use this instead of localStorage or API calls
 */
export async function getConnectedWalletENSName(
  provider: any,
  walletAddress: string
): Promise<string | null> {
  if (!provider || !walletAddress) {
    return null
  }

  try {
    const ethersProvider = new ethers.BrowserProvider(provider)
    return await getENSNameFromAddress(ethersProvider, walletAddress)
  } catch (error) {
    console.error("Error getting ENS name for wallet:", error)
    return null
  }
}
