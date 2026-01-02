"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation";
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Edit2, X, Plus, Trash2 } from "lucide-react"
import { fetchUserNFTs, fetchUserStats } from "@/app/actions/fetch-user-nfts"
import { saveProfileNFT } from "@/app/actions/save-profile-nft"
import { UserBadge } from "@/components/user-badge"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { NFTOverlay } from "@/components/nft-overlay"
import { setENSAvatar } from "@/lib/ens-utils"

interface NFT {
  tokenId: string
  name: string
  image: string
  collection: string
  contractAddress: string
  attributes?: any[]
  backgroundColor?: string
}

interface UserStats {
  totalDensity: string
  gamesPlayed: number
  winRate: number
  rank: string
  achievements: any[]
  nftBadgeUnlocks?: any[]
}

export default function ProfilePage() {
  const { targetAddress } = useParams();
  const [isLoading, setIsLoading] = useState(true)
  const [walletAddress, setWalletAddress] = useState<string>("")
  const [connectedWallet, setConnectedWallet] = useState<string>("")
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  const [ensName, setEnsName] = useState<string>("")
  const [ensAvatar, setEnsAvatar] = useState<string>("")
  const [oldRockNFTs, setOldRockNFTs] = useState<NFT[]>([])
  const [goliathNFTs, setGoliathNFTs] = useState<NFT[]>([])
  const [selectedProfileNFT, setSelectedProfileNFT] = useState<NFT | null>(null)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isSelectingProfileNFT, setIsSelectingProfileNFT] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Featured NFTs state
  const [featuredNFTs, setFeaturedNFTs] = useState<NFT[]>([])
  const [isEditingFeatured, setIsEditingFeatured] = useState(false)
  const [nftBackstories, setNftBackstories] = useState<{ [key: string]: string }>({})
  const [editingBackstory, setEditingBackstory] = useState<string | null>(null)
  const [featuredNFTNames, setFeaturedNFTNames] = useState<{ [key: string]: string }>({})

  // Social connections state
  const [discordUsername, setDiscordUsername] = useState("")
  const [twitterUsername, setTwitterUsername] = useState("")
  const [isEditingSocials, setIsEditingSocials] = useState(false)

  // Badges state
  const [selectedBadges, setSelectedBadges] = useState<number[]>([])
  const [isEditingBadges, setIsEditingBadges] = useState(false)

  // Filter state
  const [selectedFilter, setSelectedFilter] = useState<"all" | "oldrock" | "goliath">("all")

  // NFT Overlay state
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null)
  const [isOverlayOpen, setIsOverlayOpen] = useState(false)
  const [isSettingAvatar, setIsSettingAvatar] = useState(false)

  useEffect(() => {
    // Suppress harmless wallet extension errors in console
    const originalError = console.error
    console.error = (...args: any[]) => {
      const message = args[0]?.toString() || ""
      // Filter out wallet extension errors about window.ethereum
      if (
        message.includes("Cannot set property ethereum") ||
        message.includes("Cannot redefine property: ethereum") ||
        message.includes("MetaMask encountered an error setting the global Ethereum provider")
      ) {
        // Suppress these errors - they're harmless and come from wallet extensions
        return
      }
      originalError.apply(console, args)
    }

    const checkWallet = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" })
          if (accounts.length > 0) {
            setConnectedWallet(accounts[0])
          }
        } catch (error) {
          console.error("Error checking wallet:", error)
        }
      }
    }

    checkWallet()

    // Restore original console.error on cleanup
    return () => {
      console.error = originalError
    }

    const handleWalletConnected = (event: CustomEvent) => {
      if (event.detail.address) {
        setConnectedWallet(event.detail.address)
      }
    }

    const handleWalletDisconnected = () => {
      setConnectedWallet("")
    }

    window.addEventListener("walletConnected", handleWalletConnected as EventListener)
    window.addEventListener("walletDisconnected", handleWalletDisconnected as EventListener)

    return () => {
      window.removeEventListener("walletConnected", handleWalletConnected as EventListener)
      window.removeEventListener("walletDisconnected", handleWalletDisconnected as EventListener)
    }
  }, [])

  useEffect(() => {
    const targetWallet = targetAddress || connectedWallet

    if (targetWallet) {
      setWalletAddress(targetWallet)
      setIsOwnProfile(targetWallet.toLowerCase() === connectedWallet.toLowerCase())
      loadProfileData(targetWallet)
    }
  }, [targetAddress, connectedWallet])

  const loadProfileData = async (address: string) => {
    setIsLoading(true)
    try {
      // Fetch ENS name
      const name = await fetchENSName(address)
      setEnsName(name)

      // Fetch ENS avatar
      const avatar = await fetchENSAvatar(address)
      setEnsAvatar(avatar)

      // Fetch NFTs
      const nftResult = await fetchUserNFTs(address)
      if (nftResult.success) {
        setOldRockNFTs(nftResult.oldRockNFTs || [])
        setGoliathNFTs(nftResult.goliathNFTs || [])

        // Fetch user stats with NFT data
        const statsResult = await fetchUserStats(address, nftResult.oldRockNFTs, nftResult.goliathNFTs)
        if (statsResult.success) {
          setUserStats(statsResult.stats)
        }
      }

      // Load saved profile NFT
      const savedProfileNFT = localStorage.getItem(`profile-nft-${address}`)
      if (savedProfileNFT) {
        setSelectedProfileNFT(JSON.parse(savedProfileNFT))
      }

      // Load saved social accounts
      const savedSocials = localStorage.getItem(`social-accounts-${address}`)
      if (savedSocials) {
        const socials = JSON.parse(savedSocials)
        setDiscordUsername(socials.discord || "")
        setTwitterUsername(socials.twitter || "")
      }

      // Load featured NFTs
      const savedFeaturedNFTs = localStorage.getItem(`featured-nfts-${address}`)
      if (savedFeaturedNFTs) {
        setFeaturedNFTs(JSON.parse(savedFeaturedNFTs))
      }

      // Load NFT backstories
      const savedBackstories = localStorage.getItem(`nft-backstories-${address}`)
      if (savedBackstories) {
        setNftBackstories(JSON.parse(savedBackstories))
      }

      // Load featured NFT names
      const savedNames = localStorage.getItem(`featured-nft-names-${address}`)
      if (savedNames) {
        setFeaturedNFTNames(JSON.parse(savedNames))
      }

      // Load selected badges
      const savedBadges = localStorage.getItem(`selected-badges-${address}`)
      if (savedBadges) {
        setSelectedBadges(JSON.parse(savedBadges))
      }
    } catch (error) {
      console.error("Error loading profile data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchENSName = async (address: string): Promise<string> => {
    try {
      const response = await fetch(`https://api.ensideas.com/ens/resolve/${address}`)
      if (response.ok) {
        const data = await response.json()
        return data.name || `${address.slice(0, 6)}...${address.slice(-4)}`
      }
    } catch (error) {
      console.error("Error fetching ENS name:", error)
    }
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const fetchENSAvatar = async (address: string): Promise<string> => {
    try {
      const ensResponse = await fetch(`https://api.ensideas.com/ens/resolve/${address}`)
      if (ensResponse.ok) {
        const ensData = await ensResponse.json()
        if (ensData.name) {
          const avatarResponse = await fetch(`https://metadata.ens.domains/mainnet/avatar/${ensData.name}`)
          if (avatarResponse.ok) {
            const avatarUrl = avatarResponse.url
            if (avatarUrl && !avatarUrl.includes("404")) {
              return avatarUrl
            }
          }
        }
      }
      return "/images/rock-logo.png"
    } catch (error) {
      console.error("Error fetching ENS avatar:", error)
      return "/images/rock-logo.png"
    }
  }

  const handleSelectProfileNFT = async (nft: NFT) => {
    setSelectedProfileNFT(nft)
    setIsSelectingProfileNFT(false)

    // Save to localStorage
    localStorage.setItem(`profile-nft-${walletAddress}`, JSON.stringify(nft))

    // Save to database (optional)
    await saveProfileNFT(walletAddress, nft)

    // Dispatch event for header to update
    window.dispatchEvent(
      new CustomEvent("profileNFTChanged", {
        detail: nft,
      }),
    )
  }

  const handleSaveSocials = () => {
    const socials = {
      discord: discordUsername,
      twitter: twitterUsername,
    }
    localStorage.setItem(`social-accounts-${walletAddress}`, JSON.stringify(socials))
    setIsEditingSocials(false)
  }

  const handleAddFeaturedNFT = (nft: NFT) => {
    if (featuredNFTs.length < 3 && !featuredNFTs.find((f) => f.tokenId === nft.tokenId)) {
      const updatedFeatured = [...featuredNFTs, nft]
      setFeaturedNFTs(updatedFeatured)
      localStorage.setItem(`featured-nfts-${walletAddress}`, JSON.stringify(updatedFeatured))
    }
  }

  const handleRemoveFeaturedNFT = (tokenId: string) => {
    const updatedFeatured = featuredNFTs.filter((nft) => nft.tokenId !== tokenId)
    setFeaturedNFTs(updatedFeatured)
    localStorage.setItem(`featured-nfts-${walletAddress}`, JSON.stringify(updatedFeatured))
  }

  const handleSaveBackstory = (tokenId: string, backstory: string) => {
    const updatedBackstories = { ...nftBackstories, [tokenId]: backstory }
    setNftBackstories(updatedBackstories)
    localStorage.setItem(`nft-backstories-${walletAddress}`, JSON.stringify(updatedBackstories))
    setEditingBackstory(null)
  }

  const handleSaveFeaturedName = (tokenId: string, name: string) => {
    const updatedNames = { ...featuredNFTNames, [tokenId]: name }
    setFeaturedNFTNames(updatedNames)
    localStorage.setItem(`featured-nft-names-${walletAddress}`, JSON.stringify(updatedNames))
  }

  const handleToggleBadge = (badgeId: number) => {
    const updatedBadges = selectedBadges.includes(badgeId)
      ? selectedBadges.filter((id) => id !== badgeId)
      : selectedBadges.length < 5
        ? [...selectedBadges, badgeId]
        : selectedBadges

    setSelectedBadges(updatedBadges)
  }

  const handleSaveBadges = () => {
    localStorage.setItem(`selected-badges-${walletAddress}`, JSON.stringify(selectedBadges))
    setIsEditingBadges(false)
  }

  const handleNFTClick = (nft: NFT) => {
    if (isOwnProfile) {
      setSelectedNFT(nft)
      setIsOverlayOpen(true)
    }
  }

  const handleSetAsProfilePicture = async (nft: NFT) => {
    if (!window.ethereum) {
      alert("Please connect your wallet to set a profile picture.")
      return
    }

    // Check if user has a valid ENS name
    if (!ensName || !ensName.endsWith(".eth") || ensName.includes("...")) {
      alert("You need to have an ENS name (ending in .eth) to set a profile picture. Please ensure you own an ENS domain.")
      return
    }

    setIsSettingAvatar(true)
    try {
      // Use the NFT image URL - convert .webp to full resolution if needed
      let imageUrl = nft.image
      
      // If it's a -300.webp thumbnail, try to get the full resolution version
      if (imageUrl.includes("-300.webp")) {
        imageUrl = imageUrl.replace("-300.webp", ".webp")
      }

      // Call the ENS setText function to set the avatar
      await setENSAvatar(window.ethereum, ensName, imageUrl)

      // Update local state
      setEnsAvatar(imageUrl)
      setSelectedProfileNFT(nft)
      localStorage.setItem(`profile-nft-${walletAddress}`, JSON.stringify(nft))

      // Dispatch event for other components to update
      window.dispatchEvent(
        new CustomEvent("profileNFTChanged", {
          detail: nft,
        })
      )

      // Close overlay
      setIsOverlayOpen(false)
      setSelectedNFT(null)

      alert("Profile picture updated successfully! It may take a few minutes to propagate across all services.")
    } catch (error: any) {
      console.error("Error setting ENS avatar:", error)
      
      let errorMessage = "Failed to set profile picture. "
      if (error?.message?.includes("user rejected") || error?.code === 4001) {
        errorMessage += "Transaction was rejected."
      } else if (error?.message?.includes("No resolver")) {
        errorMessage += "You must own this ENS name and have a resolver set."
      } else if (error?.message) {
        errorMessage += error.message
      } else {
        errorMessage += "Please try again."
      }
      
      alert(errorMessage)
    } finally {
      setIsSettingAvatar(false)
    }
  }

  const allNFTs = [...oldRockNFTs, ...goliathNFTs]
  const filteredNFTs = selectedFilter === "all" ? allNFTs : selectedFilter === "oldrock" ? oldRockNFTs : goliathNFTs

  if (isLoading) {
    return (
      <>
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="min-h-screen bg-black flex items-center justify-center pt-[72px]">
          <div className="text-white text-xl">Loading profile...</div>
        </div>
      </>
    )
  }

  if (!walletAddress) {
    return (
      <>
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="min-h-screen bg-black flex items-center justify-center pt-[72px]">
          <div className="text-center">
            <h1 className="text-white text-2xl mb-4">No wallet connected</h1>
            <p className="text-gray-400">Please connect your wallet to view your profile</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header onMenuClick={() => setIsSidebarOpen(true)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="min-h-screen bg-black pt-[72px]">
        {/* Hero Section with Profile Info */}
        <div className="relative h-[400px] bg-gradient-to-b from-purple-900/20 to-black border-b border-gray-800">
          <div className="absolute inset-0 bg-[url('/images/stonebound-souls-overview-bg.jpg')] bg-cover bg-center opacity-20" />

          <div className="relative container mx-auto px-6 h-full flex items-end pb-12">
            <div className="flex items-end space-x-8">
              {/* Profile NFT */}
              <div className="relative group">
                <div
                  className="w-48 h-48 rounded-xl overflow-hidden border-4 border-purple-500 shadow-2xl"
                  style={{ backgroundColor: selectedProfileNFT?.backgroundColor || "#6B46C1" }}
                >
                  <Image
                    src={ensAvatar}
                    alt="Profile"
                    width={192}
                    height={192}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/*}
                  {isOwnProfile && (
                    <button
                      onClick={() => setIsSelectingProfileNFT(true)}
                      className="absolute bottom-2 right-2 bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                {*/}
              </div>

              {/* User Info */}
              <div className="pb-4">
                <h1 className="text-4xl font-bold text-white mb-2">{ensName}</h1>
                <p className="text-gray-400 font-mono mb-4">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </p>

                {/* Social Connections */}
                {/*}
                <div className="flex items-center space-x-4">
                  {discordUsername && (
                    <div className="flex items-center space-x-2 bg-gray-800/50 rounded-lg px-3 py-1">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.2 6.4c-.7-.5-1.5-1-2.4-1.3-.6-.2-1.2-.3-1.8-.4-.8-.1-1.6-.1-2.4 0-1.7.3-3.4 1-4.8 2-1.4 1-2.7 2.3-3.9 3.8-1.2 1.5-2.2 3.1-2.9 4.8-.6 1.7-.9 3.5-.8 5.3v.1c0 .2.1.4.2.5s.4.1.6 0l1.3-.6c.2-.1.3-.2.4-.3s.2-.2.3-.3c.7.4 1.5.7 2.3.9 1 .2 2 .2 3 0 1-.2 2-.5 2.9-1.1.9-.6 1.7-1.3 2.4-2.2.7-1 1.2-2.1 1.6-3.3.4-1.2.6-2.5.6-3.8V7.5c0-.4-.1-.8-.2-1.1zM9.7 15.6c-.7 0-1.2-.5-1.2-1.2s.5-1.2 1.2-1.2c.7 0 1.2.5 1.2 1.2s-.5 1.2-1.2 1.2zm4.6 0c-.7 0-1.2-.5-1.2-1.2s.5-1.2 1.2-1.2c.7 0 1.2.5 1.2 1.2s-.5 1.2-1.2 1.2z" />
                      </svg>
                      <span className="text-sm text-white">{discordUsername}</span>
                    </div>
                  )}
                  {twitterUsername && (
                    <div className="flex items-center space-x-2 bg-gray-800/50 rounded-lg px-3 py-1">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.901 1.153h3.68l-8.042 9.167L24 22.847h-7.406l-5.8-6.797L6.11 22.847H0l8.603-9.813L0 1.153h7.501l5.278 6.17L18.901 1.153Zm-1.051 19.492h2.268L5.93 3.477H3.508l14.342 17.168Z" />
                      </svg>
                      <span className="text-sm text-white">@{twitterUsername}</span>
                    </div>
                  )}
                  {isOwnProfile && (
                    <button
                      onClick={() => setIsEditingSocials(true)}
                      className="bg-gray-800/50 hover:bg-gray-700/50 text-white p-2 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {*/}
              </div>
            </div>

            {/* Stats */}
            <div className="ml-auto flex items-end space-x-8 pb-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{oldRockNFTs.length + goliathNFTs.length}</div>
                <div className="text-sm text-gray-400">NFTs</div>
              </div>
              {/*}
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">{userStats?.totalDensity || "0"}</div>
                <div className="text-sm text-gray-400">DENSITY</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{userStats?.rank || "Unranked"}</div>
                <div className="text-sm text-gray-400">Rank</div>
              </div>
              {*/}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-6 py-12">
          {/* Featured NFTs Section */}
          {featuredNFTs.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Featured NFTs</h2>
                {isOwnProfile && (
                  <button
                    onClick={() => setIsEditingFeatured(!isEditingFeatured)}
                    className="text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    {isEditingFeatured ? "Done" : "Edit Featured"}
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredNFTs.map((nft) => (
                  <div key={nft.tokenId} className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
                    <div className="relative aspect-square" style={{ backgroundColor: nft.backgroundColor }}>
                      <Image src={nft.image || "/placeholder.svg"} alt={nft.name} fill className="object-cover" />
                      {isEditingFeatured && (
                        <button
                          onClick={() => handleRemoveFeaturedNFT(nft.tokenId)}
                          className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="p-4">
                      {isOwnProfile ? (
                        <input
                          type="text"
                          value={featuredNFTNames[nft.tokenId] || nft.name}
                          onChange={(e) => handleSaveFeaturedName(nft.tokenId, e.target.value)}
                          className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg mb-2 font-semibold"
                          placeholder="NFT Name"
                        />
                      ) : (
                        <h3 className="text-lg font-semibold text-white mb-2">
                          {featuredNFTNames[nft.tokenId] || nft.name}
                        </h3>
                      )}
                      <p className="text-sm text-gray-400 mb-3">{nft.collection}</p>
                      {editingBackstory === nft.tokenId ? (
                        <div>
                          <textarea
                            value={nftBackstories[nft.tokenId] || ""}
                            onChange={(e) => setNftBackstories({ ...nftBackstories, [nft.tokenId]: e.target.value })}
                            className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg mb-2 resize-none"
                            rows={3}
                            placeholder="Add a backstory for this NFT..."
                          />
                          <button
                            onClick={() => handleSaveBackstory(nft.tokenId, nftBackstories[nft.tokenId] || "")}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1 rounded-lg text-sm"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm text-gray-300">{nftBackstories[nft.tokenId] || "No backstory yet"}</p>
                          {isOwnProfile && (
                            <button
                              onClick={() => setEditingBackstory(nft.tokenId)}
                              className="text-purple-400 hover:text-purple-300 text-sm mt-2"
                            >
                              {nftBackstories[nft.tokenId] ? "Edit backstory" : "Add backstory"}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Badges Section */}
          {/*}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Badges</h2>
              {isOwnProfile && (
                <button
                  onClick={() => {
                    if (isEditingBadges) {
                      handleSaveBadges()
                    } else {
                      setIsEditingBadges(true)
                    }
                  }}
                  className="text-purple-400 hover:text-purple-300 transition-colors"
                >
                  {isEditingBadges ? "Save Badges" : "Edit Badges"}
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-4">
              {isEditingBadges ? (
                <>
                  {userStats?.nftBadgeUnlocks?.map((badge) => (
                    <button
                      key={badge.id}
                      onClick={() => handleToggleBadge(badge.id)}
                      className={`transition-all ${selectedBadges.includes(badge.id) ? "scale-110" : "opacity-50"}`}
                    >
                      <UserBadge badgeId={badge.id} unlocked={true} size="lg" />
                    </button>
                  ))}
                </>
              ) : (
                <>
                  {selectedBadges.slice(0, 5).map((badgeId) => (
                    <UserBadge key={badgeId} badgeId={badgeId} unlocked={true} size="lg" />
                  ))}
                </>
              )}
            </div>
          </div>
          {*/}

          {/* NFT Collection */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">NFT Collection</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedFilter("all")}
                  className={`px-4 py-2 rounded-lg transition-colors ${selectedFilter === "all" ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-400"
                    }`}
                >
                  All ({allNFTs.length})
                </button>
                <button
                  onClick={() => setSelectedFilter("oldrock")}
                  className={`px-4 py-2 rounded-lg transition-colors ${selectedFilter === "oldrock" ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-400"
                    }`}
                >
                  Old Rock ({oldRockNFTs.length})
                </button>
                <button
                  onClick={() => setSelectedFilter("goliath")}
                  className={`px-4 py-2 rounded-lg transition-colors ${selectedFilter === "goliath" ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-400"
                    }`}
                >
                  Goliath ({goliathNFTs.length})
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredNFTs.map((nft) => (
                <div
                  key={`${nft.collection}-${nft.tokenId}`}
                  className={`bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-purple-500 transition-all group ${
                    isOwnProfile ? "cursor-pointer" : ""
                  } relative`}
                  onClick={() => isOwnProfile && handleNFTClick(nft)}
                >
                  <div className="relative aspect-square" style={{ backgroundColor: nft.backgroundColor }}>
                    <Image src={nft.image || "/placeholder.svg"} alt={nft.name} fill className="object-cover" />
                    {/*}
                    {isOwnProfile && featuredNFTs.length < 3 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAddFeaturedNFT(nft)
                        }}
                        className="absolute top-2 right-2 bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-20"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    )}
                    {*/}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(nft.image?.replace('.webp', '.gif'), '_blank')
                      }}
                      className="absolute top-2 right-2 bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-xs z-20"
                      title="View GIF asset for sharing on social"
                    >
                      GIF
                    </button>
                    {/* Inline overlay menu - only show when this NFT is selected */}
                    {isOwnProfile && selectedNFT?.tokenId === nft.tokenId && selectedNFT?.collection === nft.collection && isOverlayOpen && (
                      <NFTOverlay
                        nft={selectedNFT}
                        isOpen={isOverlayOpen}
                        onClose={() => {
                          setIsOverlayOpen(false)
                          setSelectedNFT(null)
                        }}
                        onSetAsProfilePicture={handleSetAsProfilePicture}
                        isSettingAvatar={isSettingAvatar}
                      />
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-white truncate">{nft.name}</h3>
                    <p className="text-xs text-gray-400">{nft.collection}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Profile NFT Selection Modal */}
        <AnimatePresence>
          {isSelectingProfileNFT && (
            <motion.div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSelectingProfileNFT(false)}
            >
              <motion.div
                className="bg-gray-900 rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Select Profile NFT</h2>
                  <button
                    onClick={() => setIsSelectingProfileNFT(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {allNFTs.map((nft) => (
                    <button
                      key={`${nft.collection}-${nft.tokenId}`}
                      onClick={() => handleSelectProfileNFT(nft)}
                      className="bg-gray-800 rounded-xl overflow-hidden border-2 border-transparent hover:border-purple-500 transition-all"
                    >
                      <div className="relative aspect-square" style={{ backgroundColor: nft.backgroundColor }}>
                        <Image src={nft.image || "/placeholder.svg"} alt={nft.name} fill className="object-cover" />
                      </div>
                      <div className="p-3">
                        <h3 className="text-sm font-semibold text-white truncate">{nft.name}</h3>
                        <p className="text-xs text-gray-400">{nft.collection}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Social Editing Modal */}
        <AnimatePresence>
          {isEditingSocials && (
            <motion.div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditingSocials(false)}
            >
              <motion.div
                className="bg-gray-900 rounded-2xl p-6 max-w-md w-full"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Edit Social Accounts</h2>
                  <button
                    onClick={() => setIsEditingSocials(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Discord Username</label>
                    <input
                      type="text"
                      value={discordUsername}
                      onChange={(e) => setDiscordUsername(e.target.value)}
                      className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg"
                      placeholder="username#0000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">X (Twitter) Username</label>
                    <input
                      type="text"
                      value={twitterUsername}
                      onChange={(e) => setTwitterUsername(e.target.value)}
                      className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg"
                      placeholder="username"
                    />
                  </div>
                  <button
                    onClick={handleSaveSocials}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </>
  )
}
