"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, BookOpen, BarChart3, Menu, X, Settings, User, Boxes, Package } from "lucide-react"
import { AudioPlayer } from "@/components/audio-player"
import { WalletSelector } from "@/components/wallet-selector"

type MenuItem = {
  name: string
  icon: string | React.ReactNode
  href: string
  isExternal?: boolean
  disabled?: boolean
  disabledText?: string
  hasArrow?: boolean
  isProfile?: boolean
  onClick?: () => void
  iconSize?: number
  hasSubmenu?: boolean
  submenuItems?: { name: string; href: string; disabled?: boolean, disabledText?: string }[]
}

export function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [selectedProfileNFT, setSelectedProfileNFT] = useState<any>(null)
  const [expandedSubmenu, setExpandedSubmenu] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showWalletSelector, setShowWalletSelector] = useState(false)

  // Local state for wallet connection
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [userProfile, setUserProfile] = useState<{ name: string; avatar: string; address: string } | null>(null)

  // Load saved profile NFT on mount
  useEffect(() => {
    if (userProfile?.address) {
      const savedProfileNFT = localStorage.getItem(`profile-nft-${userProfile.address}`)
      if (savedProfileNFT) {
        const nft = JSON.parse(savedProfileNFT)
        console.log("Sidebar: Loading saved profile NFT:", nft)
        setSelectedProfileNFT(nft)
      }
    }
  }, [userProfile?.address])

  // Listen for profile NFT changes
  useEffect(() => {
    const handleProfileNFTChange = (event: CustomEvent) => {
      console.log("Sidebar: Profile NFT changed:", event.detail)
      setSelectedProfileNFT(event.detail)
    }

    window.addEventListener("profileNFTChanged", handleProfileNFTChange as EventListener)
    return () => {
      window.removeEventListener("profileNFTChanged", handleProfileNFTChange as EventListener)
    }
  }, [])

  // Update the connectWallet function to show wallet selector
  // CRITICAL: Never call ethereum.request() before showing modal
  // This can throw errors and prevent the modal from appearing
  const connectWallet = () => {
    // Show wallet selector modal immediately
    // No async operations, no ethereum.request() calls
    // The modal will handle wallet detection and connection
    setShowWalletSelector(true)
  }

  // Handle wallet selection from modal
  const handleWalletSelect = async (provider: any, walletName: string) => {
      try {
        // Check if there's already a pending request
      const accounts = await provider.request({ method: "eth_accounts" })
        if (accounts.length > 0) {
          // Already connected, just update state
          await handleConnection(accounts)
          return
        }

        // Request new connection
      const newAccounts = await provider.request({ method: "eth_requestAccounts" })
        if (newAccounts.length > 0) {
          await handleConnection(newAccounts)
        }
      } catch (error: any) {
        if (error.code === 4001) {
          console.log("User rejected the request")
        } else if (error.message?.includes("already pending")) {
          console.log("Connection request already pending")
          // Try to get current accounts instead
          try {
          const accounts = await provider.request({ method: "eth_accounts" })
            if (accounts.length > 0) {
              await handleConnection(accounts)
            }
          } catch (secondError) {
            console.error("Failed to get accounts:", secondError)
          }
        } else {
          console.error("Failed to connect wallet:", error)
      }
    }
  }

  // Add this function to handle connection updates
  const handleConnection = async (accounts: string[]) => {
    if (accounts.length > 0) {
      const userAddress = accounts[0]
      const newUserProfile = {
        name: `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`,
        avatar: null,
        address: userAddress,
      }

      // Update local state immediately
      setIsWalletConnected(true)
      setUserProfile(newUserProfile)

      console.log("Sidebar: Updated user profile:", newUserProfile)

      // Dispatch event for other components
      window.dispatchEvent(
        new CustomEvent("walletConnected", {
          detail: { connected: true, address: userAddress, avatar: null },
        }),
      )
    }
  }

  useEffect(() => {
    const checkMobile = () => {
      const newIsMobile = window.innerWidth < 768
      setIsMobile(newIsMobile)

      if (newIsMobile) {
        setIsExpanded(false)
        setIsHovering(false)
      } else {
        setMobileMenuOpen(false)
      }
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    window.addEventListener("orientationchange", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
      window.removeEventListener("orientationchange", checkMobile)
    }
  }, [])

  useEffect(() => {
    if (!isMobile) {
      setIsExpanded(isHovering)
    }
  }, [isHovering, isMobile])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [])

  const mainMenuItems: MenuItem[] = [
    {
      name: "Airdrop",
      icon: <Package className="w-5 h-5" />,
      href: "https://airdrop.oldrocknft.com",
      isExternal: true,
    },
    {
      name: "Density Deck Beta",
      icon: "/icons/density-deck-icon.png",
      href: "#",
      hasSubmenu: true,
      submenuItems: [
        {
          name: "Game Overview",
          href: "/density-deck/overview",
        },
        {
          name: "Tournaments",
          href: "/density-deck/tournaments",
        },
      ],
    },
    {
      name: "Amplify NFT Soft Staking",
      icon: "/icons/amplify-icon.png",
      href: "https://amplify.oldrocknft.com",
      isExternal: true,
    },
    {
      name: "Goliath Mint",
      icon: "/icons/goliath-icon.png",
      href: "https://mint.oldrocknft.com",
      isExternal: true,
    },
    {
      name: "Stonebound Souls",
      icon: "/icons/stonebound-souls-icon.png",
      href: "#",
      hasSubmenu: true,
      submenuItems: [
        {
          name: "SBS LIVE",
          href: "#",
          disabled: true,
        },
        {
          name: "Game Overview",
          href: "/stonebound-souls",
        },
        {
          name: "Personality Test",
          href: "/personality-test",
        },
      ],
    },
    {
      name: "Density",
      icon: "/icons/density-icon.png",
      href: "#",
      disabled: true,
    },
    {
      name: "Leaderboard",
      icon: <BarChart3 className="w-5 h-5" />,
      href: "/leaderboard",
    },
    {
      name: "Comic",
      icon: <BookOpen className="w-5 h-5" />,
      href: "/comic",
      isExternal: false,
    },
    {
      name: "NFT Collections",
      icon: <Boxes className="w-5 h-5" />,
      href: "/collections",
    },
    {
      name: "BountyCall",
      icon: "/icons/bc.png",
      href: "/bounty-call",
      iconSize: 34,
    },
  ]

  // Update the getMenuItems function to use local state
  const getMenuItems = () => {
    const items = [...mainMenuItems]

    // Add profile item for connected users
    if (
      isWalletConnected &&
      userProfile?.address
    ) {
      const profileItem = {
        name: "Profile",
        icon: <User className="w-5 h-5" />,
        href: `/profile/${userProfile?.address}`,
        hasArrow: true,
        isProfile: true,
      };

      items.splice(6, 0, profileItem) // Insert profile after Density (index 5 + 1)
    }

    // Add admin item for authorized users
    if (
      isWalletConnected &&
      userProfile?.address &&
      userProfile.address.toLowerCase() === "0xb6585310D9546C6dFc5C1dcfA5eF92919f96D194".toLowerCase()
    ) {
      items.push({
        name: "Admin",
        icon: <Settings className="w-5 h-5" />,
        href: "/admin",
        isExternal: false,
      })
    }

    return items
  }

  const handleSubmenuToggle = (itemName: string) => {
    setExpandedSubmenu(expandedSubmenu === itemName ? null : itemName)
  }

  // Add this function to handle mobile menu item clicks
  const handleMobileMenuItemClick = (callback?: () => void) => {
    if (isMobile) {
      setMobileMenuOpen(false)
    }
    if (callback) {
      callback()
    }
  }

  const renderMenuItem = (item: MenuItem, index: number) => {
    const isProfileItem = item.isProfile
    const iconSize = item.iconSize || 28

    const content = (
      <div
        className={`relative w-full flex items-center group ${isProfileItem
          ? `h-20 border-t border-b border-white/10 bg-gray-800/30 rounded-none mx-0 ${isMobile ? "my-6" : "my-5"}`
          : `${isMobile ? "h-16" : "h-12"}`
          } ${isMobile ? "px-4" : ""}`}
      >
        <div
          className={`absolute ${isMobile ? "left-8" : "left-6"} top-1/2 transform -translate-y-1/2 w-7 h-7 flex items-center justify-center z-10`}
        >
          {typeof item.icon === "string" ? (
            <Image
              src={item.icon || "/placeholder.svg"}
              alt={item.name}
              width={iconSize}
              height={iconSize}
              className={`object-contain relative z-10 ${isProfileItem && selectedProfileNFT ? "rounded-lg" : ""}`}
              style={{ width: `${iconSize}px`, height: `${iconSize}px` }}
              loading="lazy"
              sizes={`${iconSize}px`}
            />
          ) : (
            <div className="text-white">{item.icon}</div>
          )}
          {isProfileItem && selectedProfileNFT && (
            <div
              className="absolute inset-0 rounded-lg opacity-30 blur-sm"
              style={{
                background: `radial-gradient(circle, ${selectedProfileNFT.backgroundColor || "#6B46C1"} 0%, transparent 70%)`,
              }}
            />
          )}
        </div>

        <AnimatePresence>
          {(isExpanded || (isMobile && mobileMenuOpen)) && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className={`absolute ${isMobile ? "left-20" : "left-16"} top-[calc(50%-10px)] transform -translate-y-1/2 pr-4 flex items-center justify-between ${isMobile ? "w-[calc(100%-100px)]" : "w-[calc(100%-80px)]"}`}
            >
              <div>
                <span
                  className={`text-white whitespace-nowrap ${isMobile ? "text-lg" : "text-sm"} font-medium block leading-tight mb-1`}
                >
                  {item.name}
                </span>
                {item.disabled && (
                  <span
                    className={`${isMobile ? "text-sm" : "text-xs"} text-gray-400 block leading-tight opacity-80 -translate-y-[3.5px]`}
                  >
                    {item.disabledText || 'coming soon'}
                  </span>
                )}
              </div>
              {item.hasArrow && (
                <ChevronRight
                  className={`${isMobile ? "w-6 h-6" : "w-4 h-4"} text-gray-400 flex-shrink-0 -translate-y-[5px]`}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {!isProfileItem && (
          <div
            className={`absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg ${isMobile ? "mx-4" : "mx-2"}`}
          />
        )}
      </div>
    )

    const baseClasses = "transition-colors relative block"

    if (item.disabled) {
      return <div className={`${baseClasses} cursor-not-allowed opacity-70`}>{content}</div>
    }

    if (item.hasSubmenu) {
      return (
        <button
          onClick={() => {
            handleSubmenuToggle(item.name)
            // Don't close mobile menu when opening submenu - only when clicking submenu items
            if (isMobile && expandedSubmenu === item.name) {
              // If submenu is already open and we're closing it, don't close the mobile menu
              // The submenu toggle will handle closing it
            }
          }}
          className={`${baseClasses} cursor-pointer w-full text-left`}
        >
          {content}
        </button>
      )
    }

    if (item.onClick) {
      return (
        <button
          onClick={() => {
            item.onClick()
            handleMobileMenuItemClick()
          }}
          className={`${baseClasses} cursor-pointer w-full text-left`}
        >
          {content}
        </button>
      )
    }

    if (item.isExternal) {
      return (
        <a
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`${baseClasses}`}
          onClick={() => handleMobileMenuItemClick()}
        >
          {content}
        </a>
      )
    }

    return (
      <Link href={item.href} className={`${baseClasses}`} onClick={() => handleMobileMenuItemClick()}>
        {content}
      </Link>
    )
  }

  // Add this effect to check connection status on mount and listen for wallet events
  useEffect(() => {
    // Check if wallet is already connected
    const checkInitialConnection = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" })
          if (accounts.length > 0) {
            await handleConnection(accounts)
          }
        } catch (error) {
          console.error("Error checking initial connection:", error)
        }
      }
    }

    checkInitialConnection()

    // Listen for wallet connection events from other components
    const handleWalletConnection = (event: CustomEvent) => {
      console.log("Sidebar: Wallet connection event received:", event.detail)
      if (event.detail?.connected && event.detail?.address) {
        const newUserProfile = {
          name: `${event.detail.address.slice(0, 6)}...${event.detail.address.slice(-4)}`,
          avatar: event.detail.avatar || `https://effigy.im/a/${event.detail.address}.png`,
          address: event.detail.address,
        }

        setIsWalletConnected(true)
        setUserProfile(newUserProfile)
        console.log("Sidebar: Updated profile from wallet event:", newUserProfile)
      }
    }

    const handleWalletDisconnection = () => {
      setIsWalletConnected(false)
      setUserProfile(null)
      setSelectedProfileNFT(null)
    }

    window.addEventListener("walletConnected", handleWalletConnection as EventListener)
    window.addEventListener("walletDisconnected", handleWalletDisconnection as EventListener)

    return () => {
      window.removeEventListener("walletConnected", handleWalletConnection as EventListener)
      window.removeEventListener("walletDisconnected", handleWalletDisconnection as EventListener)
    }
  }, [])

  return (
    <>
      <AnimatePresence>
        {(isExpanded || mobileMenuOpen) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={() => {
              if (isMobile) {
                setMobileMenuOpen(false)
              } else if (isExpanded) {
                setIsExpanded(false)
              }
            }}
          />
        )}
      </AnimatePresence>

      {isMobile && (
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="fixed top-[36px] left-4 -translate-y-1/2 z-[70] p-3 bg-black/80 backdrop-blur-md rounded-lg border border-white/30 shadow-lg transition-all duration-200 hover:bg-black/90"
          aria-label="Toggle menu"
        >
          <motion.div animate={{ rotate: mobileMenuOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
            {mobileMenuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
          </motion.div>
        </button>
      )}

      <motion.div
        data-sidebar
        className={`fixed left-0 top-0 bottom-0 z-[60] bg-black/95 backdrop-blur-md border-r border-white/20 flex flex-col overflow-hidden shadow-2xl ${isMobile ? "w-full" : ""
          }`}
        initial={{ width: isMobile ? 0 : 79 }}
        animate={{
          width: isMobile ? (mobileMenuOpen ? "100vw" : 0) : isExpanded ? 280 : 79,
          x: isMobile && !mobileMenuOpen ? "-100%" : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 40,
          mass: 0.8,
        }}
        onMouseEnter={() => {
          if (!isMobile) {
            // Clear any pending timeout
            if (hoverTimeoutRef.current) {
              clearTimeout(hoverTimeoutRef.current)
              hoverTimeoutRef.current = null
            }
            setIsHovering(true)
          }
        }}
        onMouseLeave={() => {
          if (!isMobile) {
            // Add a small delay before collapsing to handle quick movements within the sidebar
            hoverTimeoutRef.current = setTimeout(() => {
              setIsHovering(false)
              hoverTimeoutRef.current = null
            }, 200) // 200ms delay
          }
        }}
        onClick={() => isMobile && setIsExpanded(true)}
      >
        <div className="h-[72px] border-b border-white/20 flex items-center relative">
          <Link
            href="/"
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 flex-shrink-0 transition-transform hover:scale-110"
          >
            <Image
              src="/images/rock-logo.png"
              alt="Old Rock Logo"
              width={40}
              height={40}
              className="w-full h-full"
              priority
              sizes="40px"
            />
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <div className="space-y-0">
            {getMenuItems().map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: isExpanded ? index * 0.05 + 0.2 : 0, duration: 0.3 }}
              >
                {renderMenuItem(item, index)}
                {item.hasSubmenu && expandedSubmenu === item.name && (isExpanded || (isMobile && mobileMenuOpen)) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-black/40 border-l-2 border-white/20 ml-6"
                  >
                    {item.submenuItems?.map((subItem, subIndex) => (
                      <div key={subIndex} className="pl-8 py-2">
                        {subItem.disabled ? (
                          <div className="flex items-center justify-between text-sm text-gray-400 cursor-not-allowed">
                            <span>{subItem.name}</span>
                            <span className="text-xs bg-gray-700 px-2 py-1 rounded-l">{subItem.disabledText || 'Coming Soon'}</span>
                          </div>
                        ) : (
                          <Link
                            href={subItem.href}
                            className="text-sm text-white hover:text-gray-300 transition-colors"
                            onClick={() => handleMobileMenuItemClick()}
                          >
                            {subItem.name}
                          </Link>
                        )}
                      </div>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        <div
          className="px-2 pb-2 pt-2 flex justify-center w-full"
          onMouseEnter={() => {
            if (!isMobile) {
              // Clear any pending timeout when entering audio player area
              if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current)
                hoverTimeoutRef.current = null
              }
              setIsHovering(true)
            }
          }}
          onMouseLeave={(e) => {
            if (!isMobile) {
              // Check if we're moving to another part of the sidebar
              const relatedTarget = e.relatedTarget as HTMLElement
              if (relatedTarget && relatedTarget.closest('[data-sidebar]')) {
                // Still within sidebar, don't collapse
                return
              }
              // Add a longer delay before collapsing to handle control interactions
              hoverTimeoutRef.current = setTimeout(() => {
                setIsHovering(false)
                hoverTimeoutRef.current = null
              }, 500) // Increased delay to 500ms
            }
          }}
        >
          <div className="w-full" onMouseEnter={() => {
            if (!isMobile && hoverTimeoutRef.current) {
              clearTimeout(hoverTimeoutRef.current)
              hoverTimeoutRef.current = null
            }
          }}>
            <AudioPlayer inSidebar={true} sidebarExpanded={isExpanded || (isMobile && mobileMenuOpen)} />
          </div>
        </div>

        <div className="h-8 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
      </motion.div>

      {/* Wallet Selector Modal */}
      <WalletSelector
        isOpen={showWalletSelector}
        onClose={() => setShowWalletSelector(false)}
        onSelect={handleWalletSelect}
      />
    </>
  )
}
