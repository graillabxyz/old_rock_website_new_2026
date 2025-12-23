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
    const seenProviders = new Set<string>()

    // Handle case where window.ethereum is an array (multiple providers)
    const providers = Array.isArray(window.ethereum) ? window.ethereum : window.ethereum ? [window.ethereum] : []

    // Also check window.phantom.ethereum if it exists (Phantom EVM)
    if (window.phantom?.ethereum && !providers.includes(window.phantom.ethereum)) {
      providers.push(window.phantom.ethereum)
    }

    // Check each provider for better detection
    providers.forEach((provider: any) => {
      if (!provider || seenProviders.has(provider)) return

      // Check for MetaMask - multiple ways to detect
      if (
        (provider.isMetaMask || 
         provider._metamask ||
         (provider.constructor?.name === "MetamaskInpageProvider") ||
         (typeof provider.isMetaMask !== "undefined" && provider.isMetaMask)) &&
        !seenProviders.has("metamask")
      ) {
        const wallet = popularWallets.find((w) => w.id === "metamask")
        if (wallet) {
          wallet.provider = provider
          wallet.isInstalled = true
          detectedWallets.push(wallet)
          seenProviders.add("metamask")
          seenProviders.add(provider)
        }
        return
      }

      // Check for Coinbase Wallet - multiple ways to detect
      if (
        (provider.isCoinbaseWallet ||
         provider.isCoinbaseBrowser ||
         (provider.constructor?.name === "CoinbaseWalletProvider") ||
         (typeof provider.isCoinbaseWallet !== "undefined" && provider.isCoinbaseWallet)) &&
        !seenProviders.has("coinbase")
      ) {
        const wallet = popularWallets.find((w) => w.id === "coinbase")
        if (wallet) {
          wallet.provider = provider
          wallet.isInstalled = true
          detectedWallets.push(wallet)
          seenProviders.add("coinbase")
          seenProviders.add(provider)
        }
        return
      }

      // Check for Phantom Wallet (EVM)
      if (
        (provider.isPhantom ||
         provider._phantom ||
         (typeof provider.isPhantom !== "undefined" && provider.isPhantom)) &&
        !seenProviders.has("phantom")
      ) {
        const wallet = popularWallets.find((w) => w.id === "phantom")
        if (wallet) {
          wallet.provider = provider
          wallet.isInstalled = true
          detectedWallets.push(wallet)
          seenProviders.add("phantom")
          seenProviders.add(provider)
        }
        return
      }

      // Check for Trust Wallet - multiple detection methods
      const isTrustWallet = 
        provider.isTrust ||
        provider.isTrustWallet ||
        provider.__isTrustWallet ||
        provider.trustwallet ||
        (provider.constructor?.name && provider.constructor.name.includes("Trust")) ||
        (typeof provider.isTrust !== "undefined" && provider.isTrust) ||
        (window.trustwallet === provider)

      if (isTrustWallet && !seenProviders.has("trust")) {
        const wallet = popularWallets.find((w) => w.id === "trust")
        if (wallet) {
          wallet.provider = provider
          wallet.isInstalled = true
          detectedWallets.push(wallet)
          seenProviders.add("trust")
          seenProviders.add(provider)
        }
        return
      }

      // Check for Rainbow Wallet
      if (
        (provider.isRainbow ||
         (typeof provider.isRainbow !== "undefined" && provider.isRainbow)) &&
        !seenProviders.has("rainbow")
      ) {
        const wallet = popularWallets.find((w) => w.id === "rainbow")
        if (wallet) {
          wallet.provider = provider
          wallet.isInstalled = true
          detectedWallets.push(wallet)
          seenProviders.add("rainbow")
          seenProviders.add(provider)
        }
        return
      }

      // Check for Rabby Wallet
      const isRabby = 
        provider.isRabby ||
        provider._rabby ||
        provider.rabby ||
        (provider.constructor?.name && provider.constructor.name.includes("Rabby")) ||
        (typeof provider.isRabby !== "undefined" && provider.isRabby) ||
        (window.rabby === provider)

      if (isRabby && !seenProviders.has("rabby")) {
        const wallet = popularWallets.find((w) => w.id === "rabby")
        if (wallet) {
          wallet.provider = provider
          wallet.isInstalled = true
          detectedWallets.push(wallet)
          seenProviders.add("rabby")
          seenProviders.add(provider)
        }
        return
      }
    })

    // Check for Phantom Wallet separately (it may expose itself on window.phantom.ethereum)
    if (window.phantom?.ethereum && !seenProviders.has("phantom")) {
      const wallet = popularWallets.find((w) => w.id === "phantom")
      if (wallet) {
        wallet.provider = window.phantom.ethereum
        wallet.isInstalled = true
        if (!detectedWallets.find((w) => w.id === "phantom")) {
          detectedWallets.push(wallet)
        }
        seenProviders.add("phantom")
      }
    }

    // Check for Trust Wallet separately (it may expose itself on window.trustwallet)
    if (window.trustwallet && !seenProviders.has("trust")) {
      const wallet = popularWallets.find((w) => w.id === "trust")
      if (wallet) {
        wallet.provider = window.trustwallet
        wallet.isInstalled = true
        if (!detectedWallets.find((w) => w.id === "trust")) {
          detectedWallets.push(wallet)
        }
        seenProviders.add("trust")
      }
    }

    // Check for Coinbase Wallet extension separately
    if (window.coinbaseWalletExtension && !seenProviders.has("coinbase")) {
      const wallet = popularWallets.find((w) => w.id === "coinbase")
      if (wallet) {
        wallet.provider = window.coinbaseWalletExtension
        wallet.isInstalled = true
        if (!detectedWallets.find((w) => w.id === "coinbase")) {
          detectedWallets.push(wallet)
        }
        seenProviders.add("coinbase")
      }
    }

    // Check for Phantom Wallet separately (it may expose itself on window.phantom.ethereum)
    if (window.phantom?.ethereum && !seenProviders.has("phantom")) {
      const wallet = popularWallets.find((w) => w.id === "phantom")
      if (wallet) {
        wallet.provider = window.phantom.ethereum
        wallet.isInstalled = true
        if (!detectedWallets.find((w) => w.id === "phantom")) {
          detectedWallets.push(wallet)
        }
        seenProviders.add("phantom")
      }
    }

    // Check for Trust Wallet separately (it may expose itself on window.trustwallet)
    if (window.trustwallet && !seenProviders.has("trust")) {
      const wallet = popularWallets.find((w) => w.id === "trust")
      if (wallet) {
        wallet.provider = window.trustwallet
        wallet.isInstalled = true
        if (!detectedWallets.find((w) => w.id === "trust")) {
          detectedWallets.push(wallet)
        }
        seenProviders.add("trust")
      }
    }

    // Check for Rabby Wallet separately (it may expose itself on window.rabby)
    if (window.rabby && !seenProviders.has("rabby")) {
      const wallet = popularWallets.find((w) => w.id === "rabby")
      if (wallet) {
        wallet.provider = window.rabby
        wallet.isInstalled = true
        if (!detectedWallets.find((w) => w.id === "rabby")) {
          detectedWallets.push(wallet)
        }
        seenProviders.add("rabby")
      }
    }

    // Additional comprehensive check: Look through all providers again for Trust Wallet
    // Trust Wallet sometimes doesn't set clear identifiers, so we check by exclusion
    providers.forEach((provider: any) => {
      if (!provider || seenProviders.has(provider)) return
      
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

      if (hasTrustCharacteristics && !seenProviders.has("trust") && !detectedWallets.find((w) => w.id === "trust")) {
        const wallet = popularWallets.find((w) => w.id === "trust")
        if (wallet) {
          wallet.provider = provider
          wallet.isInstalled = true
          detectedWallets.push(wallet)
          seenProviders.add("trust")
          seenProviders.add(provider)
        }
      }
    })


    // Update the popular wallets list with installation status
    const finalWallets = popularWallets.map((wallet) => {
      const detected = detectedWallets.find((w) => w.id === wallet.id)
      if (detected) {
        return detected
      }
      return wallet
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

    onSelect(wallet.provider, wallet.name)
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

