"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation";
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Edit2, X, Plus, Trash2, CheckCircle, AlertCircle, Link as LinkIcon } from "lucide-react"
import { fetchUserNFTs, fetchUserStats } from "@/app/actions/fetch-user-nfts"
import { fetchUserDensity } from "@/app/actions/fetch-user-density"
import { saveProfileNFT } from "@/app/actions/save-profile-nft"
import { UserBadge } from "@/components/user-badge"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import Link from "next/link"
import { setENSAvatar, getConnectedWalletENSName } from "@/lib/ens-utils"
import { uploadToIPFS, getIPFSGatewayURL, SUPPORTED_IMAGE_TYPES, MAX_FILE_SIZE } from "@/lib/ipfs-utils"
import { Upload } from "lucide-react"
import { ENSConfirmationModal } from "@/components/ens-confirmation-modal"
import { BadgeDisplay } from "@/components/badge-display"
import { calculateAllBadges, Badge } from "@/lib/badge-utils"
import { getDensityDeckRank, RankInfo } from "@/lib/rank-utils"
import { Shield, ShieldCheck, Award, Trophy, Crown } from "lucide-react"
import { Footer } from "@/components/footer"
import { InlineSVG } from "@/components/inline-svg"

interface NFT {
  tokenId: string
  name: string
  image: string
  collection: string
  contractAddress: string
  attributes?: any
  backgroundColor?: string
  linkedRock?: number | null
  // Density data from Amplify API (Old Rocks only)
  unclaimedDensity?: number
  amplificationPercentage?: number
  stakingSlots?: number
  maxCapacity?: number
  dailyReward?: number
}

interface UserStats {
  totalDensity: string
  gamesPlayed: number
  winRate: number
  rank: string
  wins?: number
  achievements: any[]
  nftBadgeUnlocks?: any[]
  rankInfo?: RankInfo
}

export default function ProfilePage() {
  const params = useParams();
  const targetAddress = params?.targetAddress as string;
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
  const [userBadges, setUserBadges] = useState<Badge[]>([])
  const [isBadgeExpanded, setIsBadgeExpanded] = useState(false)

  // Filter state
  const [selectedFilter, setSelectedFilter] = useState<"all" | "oldrock" | "goliath">("all")

  // NFT Overlay state
  // NFT Overlay state - Removed selectedNFT and isOverlayOpen as they are no longer needed for hover interaction
  // const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null) 
  // const [isOverlayOpen, setIsOverlayOpen] = useState(false)
  const [isSettingAvatar, setIsSettingAvatar] = useState(false)

  // Header image/video state
  const [headerMedia, setHeaderMedia] = useState<string>("")
  const [headerMediaType, setHeaderMediaType] = useState<"image" | null>(null)
  const [isUploadingHeader, setIsUploadingHeader] = useState(false)
  const [isEditingHeader, setIsEditingHeader] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [rankImgError, setRankImgError] = useState(false)

  // ENS confirmation modal state

  const [showENSConfirm, setShowENSConfirm] = useState(false)
  const [ensConfirmMessage, setEnsConfirmMessage] = useState("")
  const [ensConfirmNFTName, setEnsConfirmNFTName] = useState("")
  const [ensConfirmResolve, setEnsConfirmResolve] = useState<((value: boolean) => void) | null>(null)

  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null)
  const lastLoadedAddress = useState<string>("") // Track this to prevent redundant loads

  useEffect(() => {
    // Suppress harmless wallet extension errors in console
    const originalError = console.error
    console.error = (...args: any[]) => {
      const message = args[0]?.toString() || ""
      if (
        message.includes("Cannot set property ethereum") ||
        message.includes("Cannot redefine property: ethereum") ||
        message.includes("MetaMask encountered an error setting the global Ethereum provider") ||
        message.includes("getter-only")
      ) {
        return
      }
      originalError.apply(console, args)
    }

    const checkWallet = async () => {
      // Use a brief delay to allow multiple extensions to settle if they are competing
      await new Promise(resolve => setTimeout(resolve, 100));

      if (typeof window !== "undefined" && window.ethereum) {
        try {
          // Check for eth_accounts without triggering a pop-up
          const accounts = await window.ethereum.request({ method: "eth_accounts" })
          if (accounts && accounts.length > 0) {
            setConnectedWallet(accounts[0].toLowerCase())
          }
        } catch (error) {
          // Non-critical error
        }
      }
    }

    checkWallet()

    const handleWalletConnected = (event: CustomEvent) => {
      if (event.detail.address) {
        setConnectedWallet(event.detail.address.toLowerCase())
      }
    }

    const handleWalletDisconnected = () => {
      setConnectedWallet("")
    }

    window.addEventListener("walletConnected", handleWalletConnected as EventListener)
    window.addEventListener("walletDisconnected", handleWalletDisconnected as EventListener)

    return () => {
      console.error = originalError
      window.removeEventListener("walletConnected", handleWalletConnected as EventListener)
      window.removeEventListener("walletDisconnected", handleWalletDisconnected as EventListener)
    }
  }, [])

  useEffect(() => {
    const targetWallet = ((targetAddress as string) || connectedWallet)?.toLowerCase()

    if (targetWallet && targetWallet !== lastLoadedAddress[0]) {
      setWalletAddress(targetWallet)
      setIsOwnProfile(targetWallet === connectedWallet)
      lastLoadedAddress[1](targetWallet)
      loadProfileData(targetWallet)
    }
  }, [targetAddress, connectedWallet])

  const loadProfileData = async (address: string) => {
    if (!address) return;
    setIsLoading(true)

    try {
      // Parallelize ALL initial data fetching for max speed
      const [ensNameResult, ensAvatarResult, nftResult, densityResult] = await Promise.allSettled([
        fetchENSName(address),
        fetchENSAvatar(address),
        fetchUserNFTs(address),
        fetchUserDensity(address)
      ]);

      // Handle ENS Name
      if (ensNameResult.status === 'fulfilled') setEnsName(ensNameResult.value);

      // Handle Avatar
      if (ensAvatarResult.status === 'fulfilled') setEnsAvatar(ensAvatarResult.value);

      // Handle NFTs
      let finalOldRocks: NFT[] = [];
      let finalGoliaths: NFT[] = [];
      if (nftResult.status === 'fulfilled' && nftResult.value.success) {
        finalOldRocks = nftResult.value.oldRockNFTs || [];
        finalGoliaths = nftResult.value.goliathNFTs || [];
        setOldRockNFTs(finalOldRocks);
        setGoliathNFTs(finalGoliaths);
      }

      // Start fetching stats and badges in parallel using the NFT results
      console.log('🔄 Calling fetchUserStats for:', address);
      const statsPromise = fetchUserStats(address, finalOldRocks, finalGoliaths);

      // Calculate Density local fallback while waiting for API
      let totalDensityValue = 0;
      if (densityResult.status === 'fulfilled' && densityResult.value.success && densityResult.value.data) {
        totalDensityValue = parseFloat(densityResult.value.data.amount?.toString() || "0") || 0;
      }

      const badgePromise = fetch(`/api/badges?address=${address}`).then(r => r.ok ? r.json() : null).catch(() => null);

      const [statsRes, badgeData] = await Promise.all([statsPromise, badgePromise]);

      console.log('📊 Stats result:', { success: statsRes?.success, wins: statsRes?.stats?.wins, gamesPlayed: statsRes?.stats?.gamesPlayed });

      // Handle Stats
      if (statsRes.success) {
        console.log('📊 Profile received stats:', { wins: statsRes.stats.wins, gamesPlayed: statsRes.stats.gamesPlayed });
        setUserStats(statsRes.stats);
      } else {
        setUserStats({
          totalDensity: totalDensityValue.toString(),
          gamesPlayed: 0,
          winRate: 0,
          rank: "Unranked",
          wins: 0,
          achievements: [],
          rankInfo: getDensityDeckRank(0)
        });
      }

      // Handle Badges
      if (badgeData?.success && badgeData?.data) {
        setUserBadges(badgeData.data.allBadges || []);
      } else {
        const badges = calculateAllBadges({
          totalDensity: totalDensityValue,
          oldRockNFTs: finalOldRocks,
          goliathNFTs: finalGoliaths,
        });
        setUserBadges(badges);
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

  // handleNFTClick removed as part of refactor to hover menu

  const handleHeaderMediaUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Reset error state
    setUploadError(null)
    setUploadProgress(0)

    // Validate file extension
    const fileName = file.name.toLowerCase()
    const validExtensions = [".png", ".jpg", ".jpeg", ".webp"]
    const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext))

    if (!hasValidExtension) {
      setUploadError(`Unsupported file format. Please upload: PNG, JPG, or WebP`)
      return
    }

    // Validate file type - only images allowed
    const isImage = SUPPORTED_IMAGE_TYPES.includes(file.type)

    if (!isImage) {
      setUploadError(`Unsupported file type. Please upload an image file (PNG, JPG, or WebP)`)
      return
    }

    // Note: File size validation happens on the server
    // PNG/JPG files will be automatically converted to WebP for optimal storage

    // Get old banner CID before uploading new one
    const oldHeaderData = localStorage.getItem(`header-media-${walletAddress}`)
    const oldCid = oldHeaderData ? JSON.parse(oldHeaderData).hash : null

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

      // Unpin old banner from IPFS (non-blocking - don't fail if this errors)
      if (oldCid && oldCid !== ipfsHash) {
        try {
          await fetch("/api/ipfs/unpin", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ cid: oldCid }),
          })
          console.log(`Unpinned old banner: ${oldCid}`)
        } catch (unpinError) {
          // Non-critical error - log but don't fail the upload
          console.warn("Failed to unpin old banner (non-critical):", unpinError)
        }
      }

      setUploadProgress(100)

      // Save to state and localStorage
      setHeaderMedia(ipfsHash)
      setHeaderMediaType("image")

      const headerData = {
        hash: ipfsHash,
        type: "image",
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

      if (error?.message?.includes("too large") || error?.message?.includes("Image is too large")) {
        errorMessage = `Image is too large. Please try a smaller or less detailed image. PNG and JPG files are automatically converted to WebP for optimal storage.`
      } else if (error?.message?.includes("Unsupported file format") || error?.message?.includes("Unsupported file type")) {
        errorMessage = `Unsupported file format. Please upload: PNG, JPG, or WebP`
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

  const handleRemoveHeaderMedia = async () => {
    if (confirm("Are you sure you want to remove your header media?")) {
      // Get the current banner CID before removing
      const currentHeaderData = localStorage.getItem(`header-media-${walletAddress}`)
      const currentCid = currentHeaderData ? JSON.parse(currentHeaderData).hash : null

      // Remove from UI and localStorage
      setHeaderMedia("")
      setHeaderMediaType(null)
      localStorage.removeItem(`header-media-${walletAddress}`)
      setIsEditingHeader(false)

      // Unpin from IPFS (non-blocking)
      if (currentCid) {
        try {
          await fetch("/api/ipfs/unpin", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ cid: currentCid }),
          })
          console.log(`Unpinned removed banner: ${currentCid}`)
        } catch (unpinError) {
          // Non-critical error - log but don't fail
          console.warn("Failed to unpin removed banner (non-critical):", unpinError)
        }
      }
    }
  }

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 5000)
  }

  const handleSetAsProfilePicture = async (nft: NFT) => {
    if (!window.ethereum) {
      showNotification("Please connect your wallet to set a profile picture.", "error")
      return
    }

    // Get connected wallet address - must be from wallet, not localStorage
    let connectedAddress: string
    try {
      const accounts = await window.ethereum.request({ method: "eth_accounts" })
      if (!accounts || accounts.length === 0) {
        showNotification("Please connect your wallet to set a profile picture.", "error")
        return
      }
      connectedAddress = accounts[0]
    } catch (error) {
      showNotification("Failed to get connected wallet address. Please try again.", "error")
      return
    }

    // Verify the connected address matches the profile owner
    if (connectedAddress.toLowerCase() !== connectedWallet.toLowerCase()) {
      showNotification("Connected wallet does not match profile owner. Please connect the correct wallet.", "error")
      return
    }

    // Check if user has an ENS name before attempting to set avatar
    try {
      const ensName = await getConnectedWalletENSName(window.ethereum, connectedAddress)
      if (!ensName || !ensName.endsWith(".eth")) {
        showNotification("You need an ENS name to set a profile picture. Please ensure your wallet has an ENS name registered.", "error")
        return
      }
    } catch (error) {
      console.error("Error checking ENS name:", error)
      showNotification("Failed to verify ENS name. Please try again.", "error")
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
      // setIsOverlayOpen(false) - Removed
      // setSelectedNFT(null) - Removed

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
        showNotification(`Resolver upgraded and profile picture set successfully for ${result.ensName}! It may take a few minutes to propagate across all services.`, "success")
      } else {
        showNotification(`Profile picture updated successfully for ${result.ensName}! It may take a few minutes to propagate across all services.`, "success")
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

      showNotification(errorMessage, "error")
    } finally {
      setIsSettingAvatar(false)
    }
  }

  const allNFTs = [...oldRockNFTs, ...goliathNFTs]
  const filteredNFTs = selectedFilter === "all" ? allNFTs : selectedFilter === "oldrock" ? oldRockNFTs : goliathNFTs

  if (isLoading) {
    return (
      <>
        <Header />
        <Sidebar />
        <div className="min-h-screen bg-black flex items-center justify-center pt-[72px]">
          <div className="text-white text-xl">Loading profile...</div>
        </div>
      </>
    )
  }

  if (!walletAddress) {
    return (
      <>
        <Header />
        <Sidebar />
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
      <Header />
      <Sidebar />

      <div className="min-h-screen bg-black pt-[72px]">
        {/* Hero Section with Profile Info */}
        <div className="relative h-auto min-h-[300px] md:h-[500px] bg-gradient-to-b from-purple-900/20 to-black border-b border-gray-800 overflow-hidden pb-6 md:pb-0">
          {/* Header Media (Image) */}
          {headerMedia ? (
            <Image
              src={getIPFSGatewayURL(headerMedia)}
              alt="Profile header"
              fill
              className="object-cover opacity-30"
              unoptimized
            />
          ) : (
            <Image
              src="/BG_black.webp"
              alt="Profile header placeholder"
              fill
              className="object-cover opacity-30"
              unoptimized
            />
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

                  {/* File Info */}
                  {!isUploadingHeader && !uploadError && !uploadSuccess && (
                    <p className="text-xs text-gray-400 text-right font-pt-mono max-w-xs">
                      Supported: PNG, JPG, WebP • PNG/JPG files are automatically converted to WebP for optimal storage
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

          <div className="relative container mx-auto px-4 md:px-6 h-full flex flex-col md:flex-row md:items-end pb-6 md:pb-12 pt-6 md:pt-0">
            <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-0 md:space-x-8 w-full">
              {/* Profile NFT */}
              <div className="relative group flex-shrink-0 mx-auto md:mx-0">
                <div
                  className="w-28 h-28 md:w-56 md:h-56 rounded-xl overflow-hidden shadow-2xl relative"
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
                          className="animate-spin h-6 w-6 md:h-8 md:w-8 text-purple-400"
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
                        <p className="text-white text-xs md:text-sm font-pt-mono">Updating...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* User Info */}
              <div className="pb-0 md:pb-4 flex-1 text-center md:text-left">
                <div className={isBadgeExpanded ? 'opacity-0 pointer-events-none' : ''}>
                  <h1 className="text-2xl md:text-4xl font-bold text-white mb-1 md:mb-2">{ensName}</h1>
                  <p className="text-gray-400 font-mono text-sm md:text-base mb-2 md:mb-4">
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </p>

                  {/* Badges Display */}
                  {userBadges.length > 0 && (
                    <div className="mt-6">
                      <BadgeDisplay badges={userBadges} onExpandedChange={setIsBadgeExpanded} />
                    </div>
                  )}
                </div>
              </div>

              {/* Stats/Rank Section - Right Side */}
              <div className="md:ml-auto flex flex-col items-center md:items-end justify-end gap-8 pb-0 md:pb-4 mt-4 md:mt-0 min-h-[100px]">
                {userStats && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="flex flex-col items-center relative"
                  >
                    {/* Lighting/Glow Effect - Static */}
                    <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full scale-150 pointer-events-none" />

                    {/* Rank Asset Image */}
                    <div className="relative group/rank-container rank-card-trigger flex flex-col items-center cursor-default">
                      {/* Subtle Static Glow underneath */}
                      <div className="absolute inset-x-[-20%] inset-y-[-20%] bg-white/5 blur-[100px] rounded-full scale-150 pointer-events-none" />

                      {/* Container with negative margin to cut off empty artboard space at bottom of SVG (SVG has 500x500 viewBox but art ends at ~365) */}
                      <div className="relative w-64 h-64 md:w-96 md:h-96 flex items-center justify-center overflow-hidden mb-[-15%]">
                        {/* Rank Image - Static */}
                        <div className="relative w-full h-full flex items-center justify-center">
                          {!rankImgError ? (() => {
                            const rankTitle = userStats.rankInfo?.title || getDensityDeckRank(userStats.wins || 0).title;
                            const rankFileMap: { [key: string]: string } = {
                              "Acolyte": "acolyte1",
                              "Disciple": "Disciple2",
                              "Champion": "Champion3",
                              "Guardian": "Guardian4",
                              "Ascendant": "Ascendant5",
                              "Paragon": "Paragon6"
                            };
                            const fileName = rankFileMap[rankTitle] || "acolyte1";
                            const svgUrl = `/Density Deck Ranks/${fileName}.svg`;
                            return (
                              <InlineSVG
                                src={svgUrl}
                                alt={rankTitle}
                                width={384}
                                height={384}
                                className="w-full h-full"
                                parentTriggerClass="rank-card-trigger"
                                scaleGroup="rank-container"
                                onError={() => setRankImgError(true)}
                              />
                            );
                          })() : (

                            <div className="flex items-center justify-center w-full h-full text-white/40">
                              {(userStats.rankInfo?.title || getDensityDeckRank(userStats.wins || 0).title) === "Acolyte" && <Shield className="w-32 h-32 md:w-48 md:h-48" />}
                              {(userStats.rankInfo?.title || getDensityDeckRank(userStats.wins || 0).title) === "Disciple" && <ShieldCheck className="w-32 h-32 md:w-48 md:h-48" />}
                              {(userStats.rankInfo?.title || getDensityDeckRank(userStats.wins || 0).title) === "Champion" && <Award className="w-32 h-32 md:w-48 md:h-48" />}
                              {(userStats.rankInfo?.title || getDensityDeckRank(userStats.wins || 0).title) === "Guardian" && <ShieldCheck className="w-32 h-32 md:w-48 md:h-48 text-emerald-500" />}
                              {(userStats.rankInfo?.title || getDensityDeckRank(userStats.wins || 0).title) === "Ascendant" && <Trophy className="w-32 h-32 md:w-48 md:h-48" />}
                              {(userStats.rankInfo?.title || getDensityDeckRank(userStats.wins || 0).title) === "Paragon" && <Crown className="w-32 h-32 md:w-48 md:h-48" />}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Density Deck Branding - Above Rank */}
                      <span className="text-white/50 font-black font-montserrat text-[10px] md:text-xs uppercase tracking-[0.15em] mb-1">
                        Density Deck
                      </span>

                      {/* Rank Title Box - Centered */}
                      <div className="bg-white px-6 py-1.5 min-w-[180px] text-center mb-1 shadow-[4px_4px_0_rgba(0,0,0,0.3)] border border-black/10 relative z-10">
                        <span className="text-black font-black font-montserrat text-sm md:text-base uppercase tracking-[0.2em]">
                          {userStats.rankInfo?.tier || getDensityDeckRank(userStats.wins || 0).tier}
                        </span>
                      </div>

                      {/* Win Count Box - Centered */}
                      <div className="bg-white px-4 py-0.5 min-w-[80px] text-center shadow-[3px_3px_0_rgba(0,0,0,0.3)] border border-black/10 relative z-10">
                        <span className="text-black font-black font-montserrat text-[10px] md:text-xs uppercase tracking-wider">
                          {userStats.wins || 0} WINS
                        </span>
                      </div>
                    </div>

                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div id="collection-section" className="container mx-auto px-6 py-12">
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
                      {isOwnProfile && isEditingFeatured && (
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-white">NFT Collection</h2>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
                <button
                  onClick={() => setSelectedFilter("all")}
                  className={`px-3 md:px-4 py-2 rounded-lg transition-colors whitespace-nowrap text-sm md:text-base flex-shrink-0 ${selectedFilter === "all" ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-400"
                    }`}
                >
                  All ({allNFTs.length})
                </button>
                <button
                  onClick={() => setSelectedFilter("oldrock")}
                  className={`px-3 md:px-4 py-2 rounded-lg transition-colors whitespace-nowrap text-sm md:text-base flex-shrink-0 ${selectedFilter === "oldrock" ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-400"
                    }`}
                >
                  Old Rock ({oldRockNFTs.length})
                </button>
                <button
                  onClick={() => setSelectedFilter("goliath")}
                  className={`px-3 md:px-4 py-2 rounded-lg transition-colors whitespace-nowrap text-sm md:text-base flex-shrink-0 ${selectedFilter === "goliath" ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-400"
                    }`}
                >
                  Goliath ({goliathNFTs.length})
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">

              {filteredNFTs.map((nft) => (
                <div
                  key={`${nft.collection}-${nft.tokenId}`}
                  className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-purple-500 transition-all group relative"
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
                    {/* Hover Menu Overlay */}
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center p-4 gap-2 z-30 pointer-events-none group-hover:pointer-events-auto">
                      {/* GIF Download Link */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          window.open(nft.image?.replace('.webp', '.gif'), '_blank')
                        }}
                        className="w-full bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 font-semibold px-3 py-2 text-xs rounded-lg border border-purple-500/20 transition-colors text-center"
                        title="View GIF asset for sharing on social"
                      >
                        DOWNLOAD GIF
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          if (isOwnProfile) handleSetAsProfilePicture(nft)
                        }}
                        disabled={isSettingAvatar || !isOwnProfile}
                        className={`w-full font-semibold px-3 py-2 text-xs rounded-lg border transition-colors flex items-center justify-center ${isOwnProfile
                          ? "bg-white/10 hover:bg-white/20 text-white border-white/10"
                          : "bg-gray-800/50 text-gray-500 border-gray-700 cursor-not-allowed"
                          }`}
                      >
                        {isSettingAvatar ? "Setting..." : "MAKE PROFILE IMAGE"}
                      </button>

                      <Link
                        href={{
                          pathname: "/staking",
                          query: {
                            tokenId: nft.tokenId,
                            collection: nft.collection
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 font-semibold px-3 py-2 text-xs rounded-lg border border-cyan-500/20 transition-colors text-center"
                      >
                        VIEW IN AMPLIFY
                      </Link>

                      <a
                        href={`https://opensea.io/assets/ethereum/${nft.contractAddress}/${nft.tokenId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="w-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-semibold px-3 py-2 text-xs rounded-lg border border-blue-500/20 transition-colors text-center"
                      >
                        OPENSEA
                      </a>
                    </div>

                  </div>
                  <div className="p-3">
                    <div className="flex justify-between items-start">
                      <h3 className="text-sm font-semibold text-white truncate flex-1">{nft.name}</h3>
                    </div>
                    <div className="flex justify-between items-end mt-1">
                      <p className="text-xs text-gray-400">{nft.collection}</p>
                      {nft.collection === "Old Rock" && (
                        <div className="text-[10px] text-[#6BC482] font-black">
                          {typeof nft.unclaimedDensity === 'number' ? nft.unclaimedDensity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"} $DENSITY
                        </div>
                      )}
                      {nft.collection === "Goliath" && nft.linkedRock && (
                        <div
                          className="flex items-center gap-1 text-[10px] text-cyan-400 font-black hover:text-cyan-300 transition-colors cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = "/staking";
                          }}
                        >
                          <LinkIcon className="w-2.5 h-2.5" />
                          <span>LINKED TO #{nft.linkedRock}</span>
                        </div>
                      )}
                    </div>
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

        {/* Click-outside backdrop for NFT Overlay */}
        {/* Click-outside backdrop removed as overlay is now hover-based */}

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

        {/* Styled Notification Toast */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -50, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: -50, x: "-50%" }}
              className={`fixed top-20 left-1/2 z-[100] max-w-md w-full mx-4 ${notification.type === "success"
                ? "bg-black/90 backdrop-blur-md border border-cyan-400/50 shadow-lg shadow-cyan-500/20"
                : "bg-black/90 backdrop-blur-md border border-red-400/50 shadow-lg shadow-red-500/20"
                } rounded-xl p-4`}
              style={{
                boxShadow: notification.type === "success"
                  ? '0 0 30px rgba(34, 211, 238, 0.3), 0 0 60px rgba(34, 211, 238, 0.1)'
                  : '0 0 30px rgba(239, 68, 68, 0.3), 0 0 60px rgba(239, 68, 68, 0.1)',
              }}
            >
              <div className="flex items-start gap-3">
                {notification.type === "success" ? (
                  <CheckCircle className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                )}
                <p className={`flex-1 text-sm font-['PT_Mono'] ${notification.type === "success" ? "text-cyan-100" : "text-red-100"
                  } leading-relaxed`}>
                  {notification.message}
                </p>
                <button
                  onClick={() => setNotification(null)}
                  className={`flex-shrink-0 ${notification.type === "success" ? "text-cyan-400 hover:text-cyan-300" : "text-red-400 hover:text-red-300"
                    } transition-colors`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Footer />
      </div>
    </>
  )
}
