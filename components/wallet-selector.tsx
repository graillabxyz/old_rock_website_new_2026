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
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
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
    const providers = Array.isArray(window.ethereum) ? window.ethereum : window.ethereum ? [window.ethereum] : []

    // Also check window.phantom.ethereum if it exists (Phantom EVM)
    if (window.phantom?.ethereum && !providers.includes(window.phantom.ethereum)) {
      providers.push(window.phantom.ethereum)
    }

    // Check each provider for better detection
    // IMPORTANT: Check wallets with more specific identifiers FIRST
    // Order: Rabby -> Phantom -> Coinbase -> MetaMask (last because many wallets set isMetaMask=true)
    providers.forEach((provider: any) => {
      if (!provider) return
      
      // Check for Rabby Wallet FIRST - must have isRabby flag
      // Rabby sometimes sets isMetaMask=true, so we need to check isRabby first
      if (
        provider.isRabby === true &&
        !seenWalletTypes.has("rabby")
      ) {
        const wallet = popularWallets.find((w) => w.id === "rabby")
        if (wallet) {
          const detectedWallet = {
            ...wallet,
            provider: provider,
            isInstalled: true,
          }
          detectedWallets.push(detectedWallet)
          seenWalletTypes.add("rabby")
          seenProviderObjects.add(provider)
        }
      }

      // Check for Phantom Wallet BEFORE MetaMask
      // Phantom may also set isMetaMask=true for compatibility
      if (
        provider.isPhantom === true &&
        !seenWalletTypes.has("phantom")
      ) {
        const wallet = popularWallets.find((w) => w.id === "phantom")
        if (wallet) {
          const detectedWallet = {
            ...wallet,
            provider: provider,
            isInstalled: true,
          }
          detectedWallets.push(detectedWallet)
          seenWalletTypes.add("phantom")
          seenProviderObjects.add(provider)
        }
      }

      // Check for Coinbase Wallet BEFORE MetaMask
      if (
        provider.isCoinbaseWallet === true &&
        !seenWalletTypes.has("coinbase")
      ) {
        const wallet = popularWallets.find((w) => w.id === "coinbase")
        if (wallet) {
          const detectedWallet = {
            ...wallet,
            provider: provider,
            isInstalled: true,
          }
          detectedWallets.push(detectedWallet)
          seenWalletTypes.add("coinbase")
          seenProviderObjects.add(provider)
        }
      }

      // Check for MetaMask LAST - must have isMetaMask flag AND NOT be other wallets
      // This prevents other wallets from being detected as MetaMask
      // Many wallets set isMetaMask=true for compatibility, so we check it last
      if (
        provider.isMetaMask === true &&
        !provider.isRabby &&
        !provider.isPhantom &&
        !provider.isCoinbaseWallet &&
        !provider.isRainbow &&
        !provider.isTrust &&
        !provider.isTrustWallet &&
        !seenWalletTypes.has("metamask")
      ) {
        const wallet = popularWallets.find((w) => w.id === "metamask")
        if (wallet) {
          // Create a new wallet object to avoid reference issues
          const detectedWallet = {
            ...wallet,
            provider: provider,
            isInstalled: true,
          }
          detectedWallets.push(detectedWallet)
          seenWalletTypes.add("metamask")
          seenProviderObjects.add(provider)
        }
      }


      // Check for Phantom Wallet (EVM) - must have isPhantom flag
      if (
        provider.isPhantom === true &&
        !seenWalletTypes.has("phantom")
      ) {
        const wallet = popularWallets.find((w) => w.id === "phantom")
        if (wallet) {
          const detectedWallet = {
            ...wallet,
            provider: provider,
            isInstalled: true,
          }
          detectedWallets.push(detectedWallet)
          seenWalletTypes.add("phantom")
          seenProviderObjects.add(provider)
        }
      }

      // Check for Trust Wallet - must have isTrust or isTrustWallet flag
      // Only check if not already identified as another wallet
      const isTrustWallet = 
        (provider.isTrust === true || provider.isTrustWallet === true || provider.__isTrustWallet === true) &&
        !provider.isMetaMask &&
        !provider.isCoinbaseWallet &&
        !provider.isPhantom &&
        !provider.isRainbow &&
        !provider.isRabby

      if (isTrustWallet && !seenWalletTypes.has("trust")) {
        const wallet = popularWallets.find((w) => w.id === "trust")
        if (wallet) {
          const detectedWallet = {
            ...wallet,
            provider: provider,
            isInstalled: true,
          }
          detectedWallets.push(detectedWallet)
          seenWalletTypes.add("trust")
          seenProviderObjects.add(provider)
        }
      }

      // Check for Rainbow Wallet - must have isRainbow flag
      if (
        provider.isRainbow === true &&
        !seenWalletTypes.has("rainbow")
      ) {
        const wallet = popularWallets.find((w) => w.id === "rainbow")
        if (wallet) {
          const detectedWallet = {
            ...wallet,
            provider: provider,
            isInstalled: true,
          }
          detectedWallets.push(detectedWallet)
          seenWalletTypes.add("rainbow")
          seenProviderObjects.add(provider)
        }
      }

    })

    // Check for Phantom Wallet separately (it may expose itself on window.phantom.ethereum)
    if (window.phantom?.ethereum && !seenWalletTypes.has("phantom")) {
      const wallet = popularWallets.find((w) => w.id === "phantom")
      if (wallet) {
        const detectedWallet = {
          ...wallet,
          provider: window.phantom.ethereum,
          isInstalled: true,
        }
        if (!detectedWallets.find((w) => w.id === "phantom")) {
          detectedWallets.push(detectedWallet)
        }
        seenWalletTypes.add("phantom")
        seenProviderObjects.add(window.phantom.ethereum)
      }
    }

    // Check for Trust Wallet separately (it may expose itself on window.trustwallet)
    if (window.trustwallet && !seenWalletTypes.has("trust")) {
      const wallet = popularWallets.find((w) => w.id === "trust")
      if (wallet) {
        const detectedWallet = {
          ...wallet,
          provider: window.trustwallet,
          isInstalled: true,
        }
        if (!detectedWallets.find((w) => w.id === "trust")) {
          detectedWallets.push(detectedWallet)
        }
        seenWalletTypes.add("trust")
        seenProviderObjects.add(window.trustwallet)
      }
    }

    // Check for Coinbase Wallet extension separately
    if (window.coinbaseWalletExtension && !seenWalletTypes.has("coinbase")) {
      const wallet = popularWallets.find((w) => w.id === "coinbase")
      if (wallet) {
        const detectedWallet = {
          ...wallet,
          provider: window.coinbaseWalletExtension,
          isInstalled: true,
        }
        if (!detectedWallets.find((w) => w.id === "coinbase")) {
          detectedWallets.push(detectedWallet)
        }
        seenWalletTypes.add("coinbase")
        seenProviderObjects.add(window.coinbaseWalletExtension)
      }
    }

    // Check for Rabby Wallet separately (it may expose itself on window.rabby)
    if (window.rabby && !seenWalletTypes.has("rabby")) {
      const wallet = popularWallets.find((w) => w.id === "rabby")
      if (wallet) {
        const detectedWallet = {
          ...wallet,
          provider: window.rabby,
          isInstalled: true,
        }
        if (!detectedWallets.find((w) => w.id === "rabby")) {
          detectedWallets.push(detectedWallet)
        }
        seenWalletTypes.add("rabby")
        seenProviderObjects.add(window.rabby)
      }
    }

    // Additional comprehensive check: Look through all providers again for Trust Wallet
    // Trust Wallet sometimes doesn't set clear identifiers, so we check by exclusion
    providers.forEach((provider: any) => {
      if (!provider || seenProviderObjects.has(provider)) return
      
      // If we've already detected this provider, skip
      const alreadyDetected = detectedWallets.some(w => w.provider === provider)
      if (alreadyDetected) return

      // Trust Wallet detection - check if it's not MetaMask, Coinbase, Phantom, Rainbow, or Rabby
      // and has the standard ethereum provider interface
      const isNotOtherWallet = 
        !provider.isMetaMask && 
        !provider.isCoinbaseWallet && 
        !provider.isPhantom && 
        !provider.isRainbow &&
        !provider.isRabby &&
        !provider._metamask &&
        !provider.isCoinbaseBrowser &&
        provider !== window.phantom?.ethereum &&
        provider !== window.rabby

      // Trust Wallet often has these characteristics
      const hasTrustCharacteristics = 
        provider.__isTrustWallet ||
        provider.isTrust ||
        provider.isTrustWallet ||
        provider.trustwallet ||
        (isNotOtherWallet && provider.request && typeof provider.request === "function")

      if (hasTrustCharacteristics && !seenWalletTypes.has("trust") && !detectedWallets.find((w) => w.id === "trust")) {
        const wallet = popularWallets.find((w) => w.id === "trust")
        if (wallet) {
          const detectedWallet = {
            ...wallet,
            provider: provider,
            isInstalled: true,
          }
          detectedWallets.push(detectedWallet)
          seenWalletTypes.add("trust")
          seenProviderObjects.add(provider)
        }
      }
    })


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
  }, [])

  const handleWalletSelect = async (wallet: WalletOption) => {
    if (!wallet.isInstalled) {
      // Open install page
      if (wallet.installUrl) {
        window.open(wallet.installUrl, "_blank")
      }
      return
    }

    // Ensure we're using the correct provider for this specific wallet
    let provider = wallet.provider

    // Always re-validate the provider when clicking to ensure we have the correct one
    // This is especially important when multiple wallets are installed
    if (typeof window !== "undefined") {
      const providers = Array.isArray(window.ethereum) ? window.ethereum : window.ethereum ? [window.ethereum] : []
      
      if (wallet.id === "metamask") {
        // For MetaMask, be very strict - must have isMetaMask and NOT be other wallets
        const metamaskProvider = providers.find((p: any) => 
          p?.isMetaMask === true && 
          !p?.isRabby && 
          !p?.isPhantom &&
          !p?.isCoinbaseWallet && 
          !p?.isRainbow &&
          !p?.isTrust &&
          !p?.isTrustWallet
        )
        if (metamaskProvider) {
          provider = metamaskProvider
        }
      } else if (wallet.id === "coinbase") {
        const coinbaseProvider = providers.find((p: any) => p?.isCoinbaseWallet === true) || window.coinbaseWalletExtension
        if (coinbaseProvider) {
          provider = coinbaseProvider
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
      return
    }

    onSelect(provider, wallet.name)
    onClose()
  }

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
                {availableWallets.map((wallet) => (
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
                ))}
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

  // Render to document body using portal to ensure proper positioning
  if (!mounted) return null

  return typeof window !== "undefined" ? createPortal(modalContent, document.body) : null
}

