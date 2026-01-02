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
import { setENSAvatar, getConnectedWalletENSName } from "@/lib/ens-utils"
import { uploadToIPFS, getIPFSGatewayURL, SUPPORTED_IMAGE_TYPES, SUPPORTED_VIDEO_TYPES, MAX_FILE_SIZE } from "@/lib/ipfs-utils"
import { Upload } from "lucide-react"
import { ENSConfirmationModal } from "@/components/ens-confirmation-modal"

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

  // Header image/video state
  const [headerMedia, setHeaderMedia] = useState<string>("")
  const [headerMediaType, setHeaderMediaType] = useState<"image" | "video" | null>(null)
  const [isUploadingHeader, setIsUploadingHeader] = useState(false)
  const [isEditingHeader, setIsEditingHeader] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)

  // ENS confirmation modal state
  const [showENSConfirm, setShowENSConfirm] = useState(false)
  const [ensConfirmMessage, setEnsConfirmMessage] = useState("")
  const [ensConfirmNFTName, setEnsConfirmNFTName] = useState("")
  const [ensConfirmResolve, setEnsConfirmResolve] = useState<((value: boolean) => void) | null>(null)

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

      // Load saved header media
      const savedHeaderMedia = localStorage.getItem(`header-media-${address}`)
      if (savedHeaderMedia) {
        const headerData = JSON.parse(savedHeaderMedia)
        setHeaderMedia(headerData.hash || "")
        setHeaderMediaType(headerData.type || null)
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

  const handleHeaderMediaUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Reset error state
    setUploadError(null)
    setUploadProgress(0)

    // Validate file extension
    const fileName = file.name.toLowerCase()
    const validExtensions = [".webp", ".webm", ".mp4", ".gif", ".jpg", ".jpeg", ".png"]
    const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext))
    
    if (!hasValidExtension) {
      setUploadError(`Unsupported file format. Please upload: webp, webm, mp4, gif, jpg, or png`)
      return
    }

    // Validate file size (2MB limit)
    if (file.size > MAX_FILE_SIZE) {
      const fileSizeMB = (file.size / 1024 / 1024).toFixed(2)
      setUploadError(`File too large! Current size: ${fileSizeMB}MB. Maximum allowed: 2MB. Please choose a smaller file.`)
      return
    }

    // Validate file type
    const isImage = SUPPORTED_IMAGE_TYPES.includes(file.type)
    const isVideo = SUPPORTED_VIDEO_TYPES.includes(file.type)
    
    if (!isImage && !isVideo) {
      setUploadError(`Unsupported file type. Please upload an image (webp, gif, jpg, png) or video (webm, mp4)`)
      return
    }

    setIsUploadingHeader(true)
    setUploadProgress(10) // Start progress
    
    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) return prev
          return prev + Math.random() * 10
        })
      }, 200)

      // Upload to IPFS
      setUploadProgress(30)
      const ipfsHash = await uploadToIPFS(file)
      
      clearInterval(progressInterval)
      setUploadProgress(90)
      
      if (!ipfsHash) {
        throw new Error("Failed to upload to IPFS - no hash returned")
      }

      setUploadProgress(100)

      // Save to state and localStorage
      setHeaderMedia(ipfsHash)
      setHeaderMediaType(isImage ? "image" : "video")
      
      const headerData = {
        hash: ipfsHash,
        type: isImage ? "image" : "video",
        uploadedAt: new Date().toISOString(),
      }
      
      localStorage.setItem(`header-media-${walletAddress}`, JSON.stringify(headerData))
      
      // Show success message
      setUploadSuccess(true)
      
      // Wait a moment to show completion and success message
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Close edit mode and reset states
      setIsEditingHeader(false)
      setUploadProgress(0)
      setUploadError(null)
      setUploadSuccess(false)
    } catch (error: any) {
      console.error("Error uploading header media:", error)
      
      // Clear progress interval if still running
      setUploadProgress(0)
      setUploadSuccess(false)
      
      // Provide specific, user-friendly error messages
      let errorMessage = "Failed to upload header media."
      
      if (error?.message?.includes("File size exceeds") || error?.message?.includes("too large")) {
        errorMessage = `File too large! Maximum allowed: 2MB. Please choose a smaller file.`
      } else if (error?.message?.includes("Unsupported file format") || error?.message?.includes("Unsupported file type")) {
        errorMessage = `Unsupported file format. Please upload: webp, webm, mp4, gif, jpg, or png`
      } else if (error?.message?.includes("network") || error?.message?.includes("fetch") || error?.message?.includes("Network")) {
        errorMessage = `Network error. Please check your internet connection and try again.`
      } else if (error?.message?.includes("IPFS upload service not configured")) {
        errorMessage = `Upload service is not configured. Please contact support.`
      } else if (error?.message?.includes("Failed to upload to IPFS")) {
        errorMessage = `Upload failed. The file may be corrupted or the service is temporarily unavailable. Please try again.`
      } else if (error?.message) {
        // Clean up technical error messages for users
        errorMessage = error.message.replace(/Error:|Failed|at .*|\(.*\)/g, "").trim()
        if (!errorMessage) {
          errorMessage = "An unexpected error occurred. Please try again."
        }
      } else {
        errorMessage = "An unexpected error occurred. Please try again."
      }
      
      setUploadError(errorMessage)
    } finally {
      setIsUploadingHeader(false)
      // Reset file input
      if (event.target) {
        event.target.value = ""
      }
    }
  }

  const handleRemoveHeaderMedia = () => {
    if (confirm("Are you sure you want to remove your header media?")) {
      setHeaderMedia("")
      setHeaderMediaType(null)
      localStorage.removeItem(`header-media-${walletAddress}`)
      setIsEditingHeader(false)
    }
  }

  const handleSetAsProfilePicture = async (nft: NFT) => {
    if (!window.ethereum) {
      alert("Please connect your wallet to set a profile picture.")
      return
    }

    // Get connected wallet address - must be from wallet, not localStorage
    let connectedAddress: string
    try {
      const accounts = await window.ethereum.request({ method: "eth_accounts" })
      if (!accounts || accounts.length === 0) {
        alert("Please connect your wallet to set a profile picture.")
        return
      }
      connectedAddress = accounts[0]
    } catch (error) {
      alert("Failed to get connected wallet address. Please try again.")
      return
    }

    // Verify the connected address matches the profile owner
    if (connectedAddress.toLowerCase() !== connectedWallet.toLowerCase()) {
      alert("Connected wallet does not match profile owner. Please connect the correct wallet.")
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
      // This function will:
      // 1. Get ENS name from connected wallet (on-chain reverse lookup) - NO localStorage
      // 2. Validate ownership/manager rights (on-chain validation)
      // 3. Fetch resolver and namehash from on-chain data - NO cached values
      // 4. Construct transaction at signing time with fresh on-chain data
      // The transaction shown in wallet will clearly show:
      // - setText("avatar", imageUrl) on the current resolver, OR
      // - setResolver(namehash, publicResolver) if upgrade needed
      const result = await setENSAvatar(
        window.ethereum,
        connectedAddress, // Pass connected wallet address for validation
        imageUrl,
        async (needsUpgrade: boolean) => {
          if (needsUpgrade) {
            // Show custom branded confirmation modal
            return new Promise<boolean>((resolve) => {
              setEnsConfirmMessage(
                `Your ENS resolver needs to be upgraded to support profile pictures.\n\n` +
                `This will change your ENS avatar and requires:\n` +
                `1. Upgrade resolver to Public Resolver (one-time transaction)\n` +
                `2. Set ENS avatar to the selected NFT\n\n` +
                `You'll need to approve two transactions in your wallet.\n\n` +
                `The transaction will be constructed using on-chain ENS data.`
              )
              setEnsConfirmNFTName(nft.name)
              setEnsConfirmResolve(() => resolve)
              setShowENSConfirm(true)
            })
          }
          return true
        }
      )

      // Update local state (for display only, not used for transactions)
      setEnsAvatar(imageUrl)
      setSelectedProfileNFT(nft)
      localStorage.setItem(`profile-nft-${walletAddress}`, JSON.stringify(nft))

      // Update ENS name from on-chain result (for display)
      if (result.ensName) {
        setEnsName(result.ensName)
      }

      // Dispatch event for other components to update
      window.dispatchEvent(
        new CustomEvent("profileNFTChanged", {
          detail: nft,
        })
      )

      // Close overlay
      setIsOverlayOpen(false)
      setSelectedNFT(null)

      // Wait for the new image to load before hiding the loading animation
      const img = new window.Image()
      img.onload = () => {
        // Image loaded successfully, hide loading after a brief moment
        setTimeout(() => {
          setIsSettingAvatar(false)
        }, 500)
      }
      img.onerror = () => {
        // Image failed to load, still hide loading after a delay
        setTimeout(() => {
          setIsSettingAvatar(false)
        }, 2000)
      }
      img.src = imageUrl

      // Fallback: hide loading after max 5 seconds even if image doesn't load
      setTimeout(() => {
        setIsSettingAvatar(false)
      }, 5000)

      if (result.upgradedResolver) {
        alert(`Resolver upgraded and profile picture set successfully for ${result.ensName}! It may take a few minutes to propagate across all services.`)
      } else {
        alert(`Profile picture updated successfully for ${result.ensName}! It may take a few minutes to propagate across all services.`)
      }
    } catch (error: any) {
      console.error("Error setting ENS avatar:", error)
      
      let errorMessage = "Failed to set profile picture. "
      if (error?.message?.includes("user rejected") || error?.code === 4001 || error?.message?.includes("rejected")) {
        errorMessage += "Transaction was rejected."
      } else if (error?.message?.includes("cancelled")) {
        errorMessage += "Operation was cancelled."
      } else if (error?.message?.includes("No ENS name found")) {
        errorMessage += "No ENS name found for your wallet address. Please ensure your wallet has an ENS name."
      } else if (error?.message?.includes("do not own or manage")) {
        errorMessage += error.message
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
        <div className="relative h-[500px] bg-gradient-to-b from-purple-900/20 to-black border-b border-gray-800 overflow-hidden">
          {/* Header Media (Image or Video) */}
          {headerMedia ? (
            <>
              {headerMediaType === "image" ? (
                <Image
                  src={getIPFSGatewayURL(headerMedia)}
                  alt="Profile header"
                  fill
                  className="object-cover opacity-30"
                  unoptimized
                />
              ) : (
                <video
                  src={getIPFSGatewayURL(headerMedia)}
                  className="absolute inset-0 w-full h-full object-cover opacity-30"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              )}
            </>
          ) : (
            <div className="absolute inset-0 bg-[url('/images/stonebound-souls-overview-bg.jpg')] bg-cover bg-center opacity-20" />
          )}
          
          {/* Edit Header Button (only for own profile) */}
          {isOwnProfile && (
            <div className="absolute top-4 right-4 z-10">
              {isEditingHeader ? (
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      {isUploadingHeader ? "Uploading..." : "Upload Header"}
                      <input
                        type="file"
                        accept=".webp,.webm,.mp4,.gif,.jpg,.jpeg,.png"
                        onChange={handleHeaderMediaUpload}
                        className="hidden"
                        disabled={isUploadingHeader}
                      />
                    </label>
                    {headerMedia && !isUploadingHeader && (
                      <button
                        onClick={handleRemoveHeaderMedia}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Remove
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setIsEditingHeader(false)
                        setUploadError(null)
                        setUploadSuccess(false)
                        setUploadProgress(0)
                      }}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                      disabled={isUploadingHeader}
                    >
                      Cancel
                    </button>
                  </div>
                  
                  {/* Upload Progress Bar */}
                  {isUploadingHeader && (
                    <div className="w-full max-w-xs bg-gray-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-purple-600 h-2 transition-all duration-300 ease-out"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}
                  
                  {/* Success Message */}
                  {uploadSuccess && (
                    <div className="bg-green-900/50 border border-green-600 text-green-200 px-3 py-2 rounded-lg text-sm max-w-xs font-pt-mono flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Header uploaded successfully!
                    </div>
                  )}
                  
                  {/* Error Message */}
                  {uploadError && (
                    <div className="bg-red-900/50 border border-red-600 text-red-200 px-3 py-2 rounded-lg text-sm max-w-xs font-pt-mono">
                      <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{uploadError}</span>
                      </div>
                    </div>
                  )}
                  
                  {/* File Size Info */}
                  {!isUploadingHeader && !uploadError && !uploadSuccess && (
                    <p className="text-xs text-gray-400 text-right font-pt-mono max-w-xs">
                      Max file size: 2MB • Supported: webp, webm, mp4, gif, jpg, png
                    </p>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setIsEditingHeader(true)}
                  className="bg-gray-900/80 hover:bg-gray-800/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Header
                </button>
              )}
            </div>
          )}

          <div className="relative container mx-auto px-6 h-full flex items-end pb-12">
            <div className="flex items-end space-x-8">
              {/* Profile NFT */}
              <div className="relative group">
                <div
                  className="w-56 h-56 rounded-xl overflow-hidden shadow-2xl relative"
                  style={{ backgroundColor: selectedProfileNFT?.backgroundColor || "#6B46C1" }}
                >
                  <Image
                    src={ensAvatar}
                    alt="Profile"
                    width={224}
                    height={224}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Loading Overlay */}
                  {isSettingAvatar && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
                      <div className="flex flex-col items-center gap-3">
                        <svg
                          className="animate-spin h-8 w-8 text-purple-400"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <p className="text-white text-sm font-pt-mono">Updating...</p>
                      </div>
                    </div>
                  )}
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

        {/* ENS Confirmation Modal */}
        <ENSConfirmationModal
          isOpen={showENSConfirm}
          onClose={() => {
            setShowENSConfirm(false)
            if (ensConfirmResolve) {
              ensConfirmResolve(false)
              setEnsConfirmResolve(null)
            }
          }}
          onConfirm={() => {
            setShowENSConfirm(false)
            if (ensConfirmResolve) {
              ensConfirmResolve(true)
              setEnsConfirmResolve(null)
            }
          }}
          title="Setting ENS Avatar"
          message={ensConfirmMessage}
          nftName={ensConfirmNFTName}
          isLoading={isSettingAvatar}
        />
      </div>
    </>
  )
}
