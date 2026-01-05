"use client"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { SimpleWalletButton } from "@/components/simple-wallet-button"
import { SearchBar } from "@/components/search-bar"
import { useRouter, usePathname } from "next/navigation"
import { fetchUserDensity } from "@/app/actions/fetch-user-density"

export function Header() {
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [usdcBalance, setUsdcBalance] = useState(0.00)
  const [densityAmount, setDensityAmount] = useState(0.00)
  const [densityWalletAmount, setDensityWalletAmount] = useState(0.00)
  const [densityAllocated, setDensityAllocated] = useState(0.00)
  const [densityLocked, setDensityLocked] = useState(0.00)
  const [densityUnclaimed, setDensityUnclaimed] = useState(0.00)
  const [densityDropdownOpen, setDensityDropdownOpen] = useState(false)
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const [selectedProfileNFT, setSelectedProfileNFT] = useState<any>(null)
  const [isMobile, setIsMobile] = useState(false)

  const router = useRouter()
  const pathname = usePathname()


  // Load saved profile NFT on mount
  useEffect(() => {
    if (walletAddress) {
      const savedProfileNFT = localStorage.getItem(`profile-nft-${walletAddress}`)
      if (savedProfileNFT) {
        setSelectedProfileNFT(JSON.parse(savedProfileNFT))
      }
    }
  }, [walletAddress])

  // Listen for profile NFT changes
  useEffect(() => {
    const handleProfileNFTChange = (event: CustomEvent) => {
      setSelectedProfileNFT(event.detail)
    }

    window.addEventListener("profileNFTChanged", handleProfileNFTChange as EventListener)
    return () => {
      window.removeEventListener("profileNFTChanged", handleProfileNFTChange as EventListener)
    }
  }, [])

  // Listen for sidebar state changes
  useEffect(() => {
    const handleMouseEnter = () => setSidebarExpanded(true)
    const handleMouseLeave = () => setSidebarExpanded(false)

    const sidebar = document.querySelector("[data-sidebar]")
    if (sidebar) {
      sidebar.addEventListener("mouseenter", handleMouseEnter)
      sidebar.addEventListener("mouseleave", handleMouseLeave)

      return () => {
        sidebar.removeEventListener("mouseenter", handleMouseEnter)
        sidebar.removeEventListener("mouseleave", handleMouseLeave)
      }
    }
  }, [])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest(".density-dropdown-container")) {
        setDensityDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Refetch density when wallet is connected (on mount and route changes)
  useEffect(() => {
    const refetchDensity = async () => {
      if (walletAddress && isConnected) {
        try {
          const result = await fetchUserDensity(walletAddress)
          if (result.success && result.data) {
            setDensityAmount(result.data.amount || 0)
            setDensityWalletAmount(0.00)
            setDensityAllocated(result.data.amountAllocated || 0)
            setDensityLocked(result.data.amountLocked || 0)
            setDensityUnclaimed(result.data.amountUnclaimed || 0)
          }
        } catch (error) {
          console.error("Error refetching density:", error)
        }
      }
    }

    refetchDensity()
  }, [walletAddress, isConnected, pathname])

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-40 h-[72px] bg-black/80 backdrop-blur-sm w-full"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <nav className="flex items-center justify-between w-full h-full px-4 md:px-6">
        {/* Left Section - OLD ROCK Text + Search Bar */}
        <motion.div
          className="flex items-center space-x-2 md:space-x-4 ml-[72px] md:ml-[79px]"
          initial={{ opacity: 0, x: -20 }}
          animate={{
            opacity: 1,
            x: !isMobile && sidebarExpanded ? 201 : 0,
          }}
          transition={{
            opacity: { delay: 0.3, duration: 0.8 },
            x: { type: "spring", stiffness: 300, damping: 30 },
          }}
        >
          <button
            onClick={() => router.push("/")}
            className="text-lg md:text-xl font-black tracking-wider font-montserrat text-white hover:text-gray-300 transition-colors cursor-pointer"
          >
            OLD ROCK
          </button>
          <div className="hidden lg:block">
            <SearchBar />
          </div>
        </motion.div>

        {/* Right Section - Token Balances + Wallet */}
        <motion.div
          className="flex items-center space-x-2 md:space-x-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          {/* Token Balances (hidden on small mobile) */}
          {isConnected && (
            <>
              {/* USDC Balance */}
              {/*
              <div className="hidden lg:flex items-center space-x-2 bg-gray-800/60 backdrop-blur-sm border border-gray-600/30 rounded-xl px-3 md:px-4 py-2">
                <Image
                  src="/icons/usdc-icon.png"
                  alt="USDC"
                  width={20}
                  height={20}
                  className="w-4 h-4 md:w-5 md:h-5"
                  loading="lazy"
                  sizes="20px"
                />
                <span className="text-white font-pt-mono text-xs md:text-sm font-bold">{usdcBalance} USDC</span>
              </div>
              */}

              {/* DENSITY Balance - Show on mobile but simplified */}
              <div className="relative density-dropdown-container">
                <div
                  className="flex items-center space-x-1 md:space-x-2 bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 rounded-xl px-2 md:px-4 py-2 cursor-pointer hover:bg-purple-500/30 transition-colors"
                  onMouseEnter={() => !isMobile && setDensityDropdownOpen(true)}
                  onMouseLeave={() => !isMobile && setDensityDropdownOpen(false)}
                  onClick={() => isMobile && setDensityDropdownOpen(!densityDropdownOpen)}
                >
                  <Image
                    src="/images/density-white.svg"
                    alt="DENSITY"
                    width={20}
                    height={20}
                    className="w-4 h-4 md:w-5 md:h-5"
                    loading="lazy"
                    sizes="20px"
                  />
                  <span className="text-white font-pt-mono font-bold text-xs md:text-sm">
                    <span className="hidden sm:inline">{densityAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </span>$DENSITY
                  </span>
                </div>
                {/* Dropdown remains the same but with mobile-specific positioning */}
                <AnimatePresence>
                  {densityDropdownOpen && (
                    <motion.div
                      className="absolute top-full right-0 mt-2 w-64 bg-gray-900/95 backdrop-blur-md border border-gray-700/50 rounded-xl overflow-hidden shadow-2xl"
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      onMouseEnter={() => !isMobile && setDensityDropdownOpen(true)}
                      onMouseLeave={() => !isMobile && setDensityDropdownOpen(false)}
                    >
                      <div className="p-4 space-y-4">
                        {/* Ecosystem Balance */}
                        <div>
                          <div className="text-xs text-gray-400 font-pt-mono font-bold uppercase tracking-wider mb-1">
                            ECOSYSTEM BALANCE
                          </div>
                          <div className="flex items-center space-x-2">
                            <Image
                              src="/images/density-white.svg"
                              alt="DENSITY"
                              width={16}
                              height={16}
                              className="w-4 h-4"
                            />
                            <span className="text-white font-pt-mono font-bold">{densityAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                        </div>

                        {/* Wallet Balance */}
                        <div>
                          <div className="text-xs text-gray-400 font-pt-mono font-bold uppercase tracking-wider mb-1">
                            WALLET BALANCE
                          </div>
                          <div className="flex items-center space-x-2">
                            <Image
                              src="/images/density-white.svg"
                              alt="DENSITY"
                              width={16}
                              height={16}
                              className="w-4 h-4"
                            />
                            <span className="text-white font-pt-mono font-bold">{densityWalletAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                        </div>

                        {/* Unextracted Balance */}
                        <div>
                          <a href="http://amplify.oldrocknft.com" target="_blank">
                            <div className="text-xs text-gray-400 font-pt-mono font-bold uppercase tracking-wider mb-1">
                              UNEXTRACTED BALANCE
                            </div>
                            <div className="flex items-center space-x-2">
                              <Image
                                src="/images/density-white.svg"
                                alt="DENSITY"
                                width={16}
                                height={16}
                                className="w-4 h-4"
                              />
                              <span className="text-white font-pt-mono font-bold">{densityUnclaimed.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}

          {/* Wallet Section */}
          <SimpleWalletButton
            onConnectionChange={async (connected, address, avatar) => {
              setIsConnected(connected)

              if (connected && address) {
                setWalletAddress(address)
              } else {
                setWalletAddress("")
                setDensityAmount(0.00)
                setDensityWalletAmount(0.00)
                setDensityAllocated(0.00)
                setDensityLocked(0.00)
                setDensityUnclaimed(0.00)
              }
            }}
            profileNFT={selectedProfileNFT}
          />
        </motion.div>
      </nav>
    </motion.header>
  )
}
