"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { X, Wallet } from "lucide-react"
import Image from "next/image"

// Extend Window interface for wallet providers
declare global {
  interface Window {
    ethereum?: any
    coinbaseWalletExtension?: any
    phantom?: {
      ethereum?: any
      solana?: any
    }
    trustwallet?: any
    rabby?: any
  }
}

interface WalletOption {
  id: string
  name: string
  icon: string
  iconUrl?: string
  provider: any
  isInstalled: boolean
  installUrl?: string
}

interface WalletSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (provider: any, walletName: string) => void
}

export function WalletSelector({ isOpen, onClose, onSelect }: WalletSelectorProps) {
  const [availableWallets, setAvailableWallets] = useState<WalletOption[]>([])

  // Early return only for SSR - on client, always allow rendering when isOpen is true
  if (typeof window === "undefined") return null

  // Function to detect wallets
  const detectWallets = () => {
    if (typeof window === "undefined") return

    // Define the 6 most popular wallets with logo URLs
    const popularWallets: WalletOption[] = [
      {
        id: "metamask",
        name: "MetaMask",
        icon: "🦊",
        iconUrl: "https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/metamask-fox.svg",
        provider: null,
        isInstalled: false,
        installUrl: "https://metamask.io/download/",
      },
      {
        id: "coinbase",
        name: "Coinbase Wallet",
        icon: "🔷",
        iconUrl: "https://wallet-assets.coinbase.com/img/coinbase-wallet-logo.svg",
        provider: null,
        isInstalled: false,
        installUrl: "https://www.coinbase.com/wallet",
      },
      {
        id: "phantom",
        name: "Phantom",
        icon: "👻",
        iconUrl: "https://phantom.app/img/phantom-icon-purple.svg",
        provider: null,
        isInstalled: false,
        installUrl: "https://phantom.app/",
      },
      {
        id: "trust",
        name: "Trust Wallet",
        icon: "🛡️",
        iconUrl: "https://trustwallet.com/assets/images/media/assets/TWT.png",
        provider: null,
        isInstalled: false,
        installUrl: "https://trustwallet.com/",
      },
      {
        id: "rainbow",
        name: "Rainbow",
        icon: "🌈",
        iconUrl: "https://rainbow.me/rainbow.svg",
        provider: null,
        isInstalled: false,
        installUrl: "https://rainbow.me/",
      },
      {
        id: "rabby",
        name: "Rabby Wallet",
        icon: "🐰",
        iconUrl: "https://rabby.io/assets/logo.png",
        provider: null,
        isInstalled: false,
        installUrl: "https://rabby.io/",
      },
    ]

    // Check for installed wallets and update the list
    const detectedWallets: WalletOption[] = []
    const seenWalletTypes = new Set<string>() // Track which wallet types we've detected
    const seenProviderObjects = new Set<any>() // Track which provider objects we've processed

    // Handle case where window.ethereum is an array (multiple providers)
    const providers: any[] = []
    if (Array.isArray(window.ethereum)) {
      providers.push(...window.ethereum)
    } else if (window.ethereum) {
      providers.push(window.ethereum)
    }

    // Also check window.phantom.ethereum if it exists (Phantom EVM)
    if (window.phantom?.ethereum && !providers.includes(window.phantom.ethereum)) {
      providers.push(window.phantom.ethereum)
    }

    // FIRST: Check for MetaMask - prioritize it
    // Check both array and single provider cases
    let metamaskProvider: any = null
    
    // Debug logging
    if (window.ethereum) {
      const eth = window.ethereum as any
      console.log("[WalletSelector] window.ethereum detected:", {
        isArray: Array.isArray(window.ethereum),
        isMetaMask: eth?.isMetaMask,
        _metamask: eth?._metamask,
        isRabby: eth?.isRabby,
        isPhantom: eth?.isPhantom,
        isCoinbaseWallet: eth?.isCoinbaseWallet,
        isRainbow: eth?.isRainbow,
        isTrust: eth?.isTrust,
        keys: Object.keys(eth || {}).slice(0, 15)
      })
    }

    // Helper function to check if a provider is MetaMask (and not another wallet)
    const isMetaMaskProvider = (p: any): boolean => {
      if (!p) return false
      
      // The _metamask property is a strong indicator of MetaMask
      // If it exists, it's likely MetaMask even if other wallets set isMetaMask=true
      const hasMetamaskProperty = p._metamask !== undefined
      
      // Check for MetaMask-specific properties
      const hasMetaMaskFlag = p.isMetaMask === true
      
      if (!hasMetaMaskFlag && !hasMetamaskProperty) {
        return false
      }
      
      // If _metamask property exists, it's almost certainly MetaMask
      // (Rabby and other wallets don't set this)
      if (hasMetamaskProperty) {
        return true
      }
      
      // If only isMetaMask is true, exclude if it's explicitly another wallet
      // (these take priority over the generic isMetaMask flag)
      if (p.isRabby === true) return false
      if (p.isPhantom === true) return false
      if (p.isCoinbaseWallet === true) return false
      if (p.isRainbow === true) return false
      if (p.isTrust === true || p.isTrustWallet === true || p.__isTrustWallet === true) return false
      
      // If it has isMetaMask and none of the other wallet flags, it's MetaMask
      return true
    }

    // Check for MetaMask in providers array or single provider
    if (Array.isArray(window.ethereum)) {
      console.log("[WalletSelector] Checking providers array, length:", window.ethereum.length)
      for (const provider of window.ethereum) {
        if (isMetaMaskProvider(provider)) {
          metamaskProvider = provider
          console.log("[WalletSelector] MetaMask found in providers array")
          break
        }
      }
    } else if (window.ethereum) {
      const eth = window.ethereum as any
      if (isMetaMaskProvider(eth)) {
        metamaskProvider = window.ethereum
        console.log("[WalletSelector] MetaMask found as single provider")
      } else {
        console.log("[WalletSelector] Single provider is not MetaMask:", {
          isMetaMask: eth.isMetaMask,
          isRabby: eth.isRabby,
          isPhantom: eth.isPhantom
        })
      }
    }

    if (metamaskProvider && !seenWalletTypes.has("metamask")) {
      const wallet = popularWallets.find((w) => w.id === "metamask")
      if (wallet) {
        const detectedWallet = {
          ...wallet,
          provider: metamaskProvider,
          isInstalled: true,
        }
        detectedWallets.push(detectedWallet)
        seenWalletTypes.add("metamask")
        seenProviderObjects.add(metamaskProvider)
        console.log("[WalletSelector] MetaMask added to detected wallets")
      }
    } else if (!metamaskProvider) {
      console.log("[WalletSelector] MetaMask not detected yet")
    }

    // Check each provider for other wallets (MetaMask already checked above)
    // Order: Check wallets with more specific identifiers FIRST
    providers.forEach((provider: any) => {
      if (!provider || seenProviderObjects.has(provider)) return
      
      // Skip if this is the MetaMask provider we already detected
      if (provider === metamaskProvider) return
      
      // Check for Rabby Wallet - must have isRabby flag
      // BUT exclude if it has _metamask property (that's MetaMask, not Rabby)
      if (provider.isRabby === true && provider._metamask === undefined && !seenWalletTypes.has("rabby")) {
        const wallet = popularWallets.find((w) => w.id === "rabby")
        if (wallet) {
          detectedWallets.push({ ...wallet, provider, isInstalled: true })
          seenWalletTypes.add("rabby")
          seenProviderObjects.add(provider)
          return
        }
      }

      // Check for Phantom Wallet - must have isPhantom flag
      if (provider.isPhantom === true && !seenWalletTypes.has("phantom")) {
        const wallet = popularWallets.find((w) => w.id === "phantom")
        if (wallet) {
          detectedWallets.push({ ...wallet, provider, isInstalled: true })
          seenWalletTypes.add("phantom")
          seenProviderObjects.add(provider)
          return
        }
      }

      // Check for Coinbase Wallet - must have isCoinbaseWallet flag
      if (provider.isCoinbaseWallet === true && !seenWalletTypes.has("coinbase")) {
        const wallet = popularWallets.find((w) => w.id === "coinbase")
        if (wallet) {
          detectedWallets.push({ ...wallet, provider, isInstalled: true })
          seenWalletTypes.add("coinbase")
          seenProviderObjects.add(provider)
          return
        }
      }

      // Check for Rainbow Wallet - must have isRainbow flag
      if (provider.isRainbow === true && !seenWalletTypes.has("rainbow")) {
        const wallet = popularWallets.find((w) => w.id === "rainbow")
        if (wallet) {
          detectedWallets.push({ ...wallet, provider, isInstalled: true })
          seenWalletTypes.add("rainbow")
          seenProviderObjects.add(provider)
          return
        }
      }

      // Check for Trust Wallet - must have Trust-specific flags
      const isTrustWallet = 
        (provider.isTrust === true || provider.isTrustWallet === true || provider.__isTrustWallet === true) &&
        !provider.isRabby &&
        !provider.isPhantom &&
        !provider.isCoinbaseWallet &&
        !provider.isRainbow &&
        !provider.isMetaMask

      if (isTrustWallet && !seenWalletTypes.has("trust")) {
        const wallet = popularWallets.find((w) => w.id === "trust")
        if (wallet) {
          detectedWallets.push({ ...wallet, provider, isInstalled: true })
          seenWalletTypes.add("trust")
          seenProviderObjects.add(provider)
          return
        }
      }
    })

    // Check for wallets that expose themselves on window properties
    // Phantom Wallet (EVM)
    if (window.phantom?.ethereum && !seenWalletTypes.has("phantom")) {
      const wallet = popularWallets.find((w) => w.id === "phantom")
      if (wallet) {
        detectedWallets.push({ ...wallet, provider: window.phantom.ethereum, isInstalled: true })
        seenWalletTypes.add("phantom")
        seenProviderObjects.add(window.phantom.ethereum)
      }
    }

    // Trust Wallet
    if (window.trustwallet && !seenWalletTypes.has("trust")) {
      const wallet = popularWallets.find((w) => w.id === "trust")
      if (wallet) {
        detectedWallets.push({ ...wallet, provider: window.trustwallet, isInstalled: true })
        seenWalletTypes.add("trust")
        seenProviderObjects.add(window.trustwallet)
      }
    }

    // Coinbase Wallet extension
    if (window.coinbaseWalletExtension && !seenWalletTypes.has("coinbase")) {
      const wallet = popularWallets.find((w) => w.id === "coinbase")
      if (wallet) {
        detectedWallets.push({ ...wallet, provider: window.coinbaseWalletExtension, isInstalled: true })
        seenWalletTypes.add("coinbase")
        seenProviderObjects.add(window.coinbaseWalletExtension)
      }
    }

    // Rabby Wallet
    if (window.rabby && !seenWalletTypes.has("rabby")) {
      const wallet = popularWallets.find((w) => w.id === "rabby")
      if (wallet) {
        detectedWallets.push({ ...wallet, provider: window.rabby, isInstalled: true })
        seenWalletTypes.add("rabby")
        seenProviderObjects.add(window.rabby)
      }
    }

    // Final fallback for MetaMask - if still not detected, do a simple check
    // This handles edge cases where MetaMask wasn't caught by the earlier logic
    if (!seenWalletTypes.has("metamask") && window.ethereum) {
      console.log("[WalletSelector] Running final fallback for MetaMask")
      const providersToCheck = Array.isArray(window.ethereum) ? window.ethereum : [window.ethereum]
      
      for (const provider of providersToCheck) {
        if (provider && typeof provider === "object") {
          console.log("[WalletSelector] Checking provider in fallback:", {
            isMetaMask: provider.isMetaMask,
            _metamask: provider._metamask,
            isRabby: provider.isRabby,
            isPhantom: provider.isPhantom,
            isCoinbaseWallet: provider.isCoinbaseWallet
          })
          
          // Check for MetaMask - prioritize _metamask property as strongest indicator
          const hasMetamaskProperty = provider._metamask !== undefined
          const hasMetaMaskFlag = provider.isMetaMask === true
          
          if (hasMetaMaskFlag || hasMetamaskProperty) {
            // If _metamask property exists, it's definitely MetaMask (other wallets don't set this)
            const isDefinitelyMetaMask = hasMetamaskProperty
            
            // If not definitely MetaMask, check for other wallet flags
            const hasOtherWalletFlag = 
              provider.isRabby === true ||
              provider.isPhantom === true ||
              provider.isCoinbaseWallet === true ||
              provider.isRainbow === true ||
              provider.isTrust === true ||
              provider.isTrustWallet === true ||
              provider.__isTrustWallet === true
            
            // If it's definitely MetaMask (has _metamask) OR has isMetaMask without other wallet flags
            if ((isDefinitelyMetaMask || !hasOtherWalletFlag) && !seenProviderObjects.has(provider)) {
              const wallet = popularWallets.find((w) => w.id === "metamask")
              if (wallet) {
                detectedWallets.push({ ...wallet, provider, isInstalled: true })
                seenWalletTypes.add("metamask")
                seenProviderObjects.add(provider)
                console.log("[WalletSelector] MetaMask detected in fallback!")
                break
              }
            } else {
              console.log("[WalletSelector] Provider has other wallet flag or already seen:", hasOtherWalletFlag, seenProviderObjects.has(provider))
            }
          }
        }
      }
    }

    // Update the popular wallets list with installation status
    // Create a new object for each wallet to avoid reference issues
    const finalWallets = popularWallets.map((wallet) => {
      const detected = detectedWallets.find((w) => w.id === wallet.id)
      if (detected) {
        // Return a new object with the detected provider to ensure correct reference
        return {
          ...detected,
          provider: detected.provider, // Explicitly use the detected provider
        }
      }
      return { ...wallet }
    })

    // Sort wallets: installed first, then uninstalled
    const sortedWallets = finalWallets.sort((a, b) => {
      if (a.isInstalled && !b.isInstalled) return -1
      if (!a.isInstalled && b.isInstalled) return 1
      return 0
    })

    setAvailableWallets(sortedWallets)
  }

  // Run detection on mount and when wallets become available
  useEffect(() => {
    detectWallets()

    // Listen for when window.ethereum becomes available (e.g., MetaMask loads after page load)
    const checkInterval = setInterval(() => {
      if (window.ethereum) {
        detectWallets()
        clearInterval(checkInterval)
      }
    }, 500)

    // Also listen for the ethereum#initialized event
    const handleEthereumInitialized = () => {
      detectWallets()
    }
    window.addEventListener("ethereum#initialized", handleEthereumInitialized as EventListener)

    // Cleanup
    return () => {
      clearInterval(checkInterval)
      window.removeEventListener("ethereum#initialized", handleEthereumInitialized as EventListener)
    }
  }, [])

  // Re-detect wallets when modal opens
  useEffect(() => {
    if (isOpen) {
      console.log("[WalletSelector] Modal opened, re-detecting wallets")
      detectWallets()
    }
  }, [isOpen])

  const handleWalletSelect = async (wallet: WalletOption) => {
    if (!wallet.isInstalled) {
      // Open install page
      if (wallet.installUrl) {
        window.open(wallet.installUrl, "_blank")
      }
      return
    }

    // Always re-detect the provider when clicking to ensure we have the correct one
    // This is especially important when multiple wallets are installed
    let provider: any = null
    
    if (typeof window !== "undefined") {
      const providers = Array.isArray(window.ethereum) ? window.ethereum : window.ethereum ? [window.ethereum] : []
      
      if (wallet.id === "metamask") {
        // Use the stored provider from detection - it's already validated to be MetaMask
        // The detection logic ensures it has _metamask property or isMetaMask without other wallet flags
        if (wallet.provider) {
          provider = wallet.provider
          console.log("[WalletSelector] Using stored MetaMask provider:", {
            has_metamask: provider._metamask !== undefined,
            isMetaMask: provider.isMetaMask,
            isRabby: provider.isRabby
          })
        } else {
          // Re-detect only if stored provider is not available
          // For MetaMask, prioritize _metamask property (strongest indicator)
          if (Array.isArray(window.ethereum)) {
            provider = window.ethereum.find((p: any) => p?._metamask !== undefined)
          } else if (window.ethereum) {
            const eth = window.ethereum as any
            if (eth?._metamask !== undefined) {
              provider = window.ethereum
            }
          }
          console.log("[WalletSelector] Re-detected MetaMask provider:", provider ? "found" : "not found")
        }
      } else if (wallet.id === "coinbase") {
        // Coinbase can be in window.coinbaseWalletExtension OR in providers array
        provider = window.coinbaseWalletExtension || providers.find((p: any) => p?.isCoinbaseWallet === true)
        // Fallback to stored provider if re-detection didn't find one
        if (!provider && wallet.provider) {
          provider = wallet.provider
        }
      } else if (wallet.id === "phantom") {
        const phantomProvider = window.phantom?.ethereum || providers.find((p: any) => p?.isPhantom === true)
        if (phantomProvider) {
          provider = phantomProvider
        }
      } else if (wallet.id === "trust") {
        const trustProvider = window.trustwallet || providers.find((p: any) => 
          (p?.isTrust === true || p?.isTrustWallet === true || p?.__isTrustWallet === true) &&
          !p?.isMetaMask &&
          !p?.isRabby &&
          !p?.isPhantom
        )
        if (trustProvider) {
          provider = trustProvider
        }
      } else if (wallet.id === "rainbow") {
        const rainbowProvider = providers.find((p: any) => p?.isRainbow === true)
        if (rainbowProvider) {
          provider = rainbowProvider
        }
      } else if (wallet.id === "rabby") {
        const rabbyProvider = window.rabby || providers.find((p: any) => 
          p?.isRabby === true
        )
        if (rabbyProvider) {
          provider = rabbyProvider
        }
      }
    }

    if (!provider) {
      console.error(`Could not find provider for ${wallet.name}`)
      alert(`Could not find ${wallet.name} provider. Please ensure the wallet extension is installed and unlocked.`)
      return
    }

    // Validate provider before passing it
    if (typeof provider.request !== "function") {
      console.error(`Invalid provider for ${wallet.name}: missing request method`)
      alert(`${wallet.name} provider is not ready. Please try again in a moment.`)
      return
    }

    // Add a small delay to ensure provider is fully ready
    // This helps with wallets that load asynchronously
    await new Promise(resolve => setTimeout(resolve, 50))

    // Re-validate provider after delay (some wallets might change their provider object)
    if (typeof provider.request !== "function") {
      console.error(`Provider for ${wallet.name} became invalid after delay`)
      alert(`${wallet.name} provider is not ready. Please try again in a moment.`)
      return
    }

    try {
      onSelect(provider, wallet.name)
      onClose()
    } catch (error) {
      console.error(`Error selecting ${wallet.name}:`, error)
      // Don't close modal on error so user can try again
    }
  }

  // Render to document body using portal to ensure proper positioning
  // Always render when isOpen is true (we're on client side with "use client")
  if (typeof window === "undefined") return null

  // Ensure document.body exists before creating portal
  if (!document.body) {
    console.warn("[WalletSelector] document.body not available yet")
    return null
  }

  // Debug logging to help diagnose issues
  useEffect(() => {
    if (isOpen) {
      console.log("[WalletSelector] Modal opened, isOpen:", isOpen, "availableWallets:", availableWallets.length)
    }
  }, [isOpen, availableWallets.length])

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] cursor-pointer"
          />

          {/* Modal - Centered */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-md w-full shadow-2xl pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black font-montserrat text-white">Connect Wallet</h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Wallet Options */}
              <div className="space-y-3">
                {availableWallets.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 font-pt-mono">
                    <p>Detecting wallets...</p>
                  </div>
                ) : (
                  availableWallets.map((wallet) => (
                    <button
                      key={wallet.id}
                      onClick={() => handleWalletSelect(wallet)}
                      className={`w-full p-4 rounded-xl border transition-all duration-200 ${
                        wallet.isInstalled
                          ? "bg-gray-800/50 border-gray-700 hover:bg-gray-800 hover:border-gray-600 text-white cursor-pointer"
                          : "bg-gray-800/30 border-gray-700/50 text-gray-500 cursor-pointer"
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-lg bg-white/5 p-1.5">
                          {wallet.iconUrl ? (
                            <Image
                              src={wallet.iconUrl}
                              alt={`${wallet.name} logo`}
                              width={32}
                              height={32}
                              className="w-full h-full object-contain"
                              unoptimized
                              onError={(e) => {
                                // Fallback to emoji if image fails to load
                                const target = e.target as HTMLImageElement
                                target.style.display = "none"
                                const parent = target.parentElement
                                if (parent && !parent.querySelector(".fallback-icon")) {
                                  const fallback = document.createElement("span")
                                  fallback.className = "fallback-icon text-2xl"
                                  fallback.textContent = wallet.icon
                                  parent.appendChild(fallback)
                                }
                              }}
                            />
                          ) : (
                            <span className="text-2xl">{wallet.icon}</span>
                          )}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-bold font-pt-mono text-lg">{wallet.name}</div>
                        </div>
                        {wallet.isInstalled && (
                          <Wallet className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>

              {/* Footer */}
              <p className="text-xs text-gray-500 text-center mt-6 font-pt-mono">
                By connecting, you agree to our Terms of Service
              </p>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )

  // Ensure document.body exists before creating portal
  if (!document.body) return null
  
  return createPortal(modalContent, document.body)
}

