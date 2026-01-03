"use client"

import { Header } from "@/components/header"
import { CyberpunkBackground } from "@/components/cyberpunk-background"
import { Sidebar } from "@/components/sidebar"
import { motion } from "framer-motion"
import { useState, useEffect, useRef } from "react"
import { Footer } from "@/components/footer"
import Image from "next/image"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { calculateAllBadges, getBestBadges, Badge as BadgeType } from "@/lib/badge-utils"
import { Award, Loader2 } from "lucide-react"
import { createPortal } from "react-dom"

interface LeaderboardUser {
  address: string
  ensName: string | null
  displayName: string
  totalDensity: number
  unextractedDensity: number
  hasOldRock: boolean
  hasGoliath: boolean
  rank: number
  badges: BadgeType[]
  bestBadges: BadgeType[]
  avatar: string
  // Density Deck specific fields
  username?: string | null
  wins?: number
  winrate?: number
}

export default function LeaderboardPage() {
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [leaderboardUsers, setLeaderboardUsers] = useState<LeaderboardUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"rank" | "totalDensity" | "densityDeck">("rank")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [currentOffset, setCurrentOffset] = useState(0)
  const [totalUsers, setTotalUsers] = useState(0)
  const [leaderboardType, setLeaderboardType] = useState<"density" | "densityDeck">("density")

  // Check wallet connection status
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" })
          if (accounts.length > 0) {
            setIsWalletConnected(true)
            const avatarUrl = await fetchDensityDeckAvatar(accounts[0], null).catch(() => null)
            const ensName = await fetchENSName(accounts[0])
            setUserProfile({
              name: ensName || "OldRock User",
              avatar: avatarUrl,
              address: accounts[0],
            })
          }
        } catch (error) {
          console.error("Error checking wallet connection:", error)
        }
      }
    }

    checkWalletConnection()
  }, [])

  const router = useRouter()

  // Fetch initial top 50 leaderboard data (fast mode)
  const fetchInitialLeaderboard = async () => {
      setIsLoading(true)
      setLoadingProgress(0)
      setError(null)
      setCurrentOffset(0)

      // Poll progress endpoint for real-time updates
      const progressInterval = setInterval(async () => {
        try {
          const progressResponse = await fetch("/api/leaderboard/progress")
          if (progressResponse.ok) {
            const progressData = await progressResponse.json()
            if (progressData.progress !== undefined) {
              setLoadingProgress(progressData.progress)
              // If progress is 100% or status is ready, stop polling
              if (progressData.progress >= 100 || progressData.status === "ready") {
                clearInterval(progressInterval)
              }
            }
          }
        } catch (error) {
          // Silently fail - progress is not critical
        }
      }, 500) // Poll every 500ms

      try {
        // Use fast mode to get top 50 quickly
        const response = await fetch("/api/leaderboard?fast=true&limit=50")
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error("Leaderboard API error:", response.status, errorData)
          
          // Check if it's a configuration error
          if (errorData.error && errorData.error.includes("Amplify API URL not configured")) {
            throw new Error(`Configuration Error: ${errorData.error}${errorData.help ? ` ${errorData.help}` : ""}`)
          }
          
          throw new Error(`Failed to fetch leaderboard data: ${response.status} - ${errorData.error || "Unknown error"}`)
        }

        const result = await response.json()
        console.log("Leaderboard API response:", { success: result.success, dataLength: result.data?.length, total: result.total })
        
        if (!result.success) {
          // If there's an error but we got data, log it but continue
          if (result.error) {
            console.warn("Leaderboard API warning:", result.error)
          }
          // If no data, throw error
          if (!result.data) {
            throw new Error(result.error || "Invalid leaderboard data")
          }
        }
        
        if (!result.data) {
          console.error("Invalid leaderboard data:", result)
          throw new Error("Invalid leaderboard data")
        }
        
        if (result.data.length === 0) {
          console.warn("Leaderboard API returned empty data")
        }

        // Deduplicate by address to prevent doubles
        const seenAddresses = new Set<string>()
        const uniqueData = result.data.filter((user: any) => {
          const addr = user.address?.toLowerCase()
          if (!addr || seenAddresses.has(addr)) {
            return false
          }
          seenAddresses.add(addr)
          return true
        })

        // Process and enrich user data - use NFT data from API response (no additional queries!)
        const processedUsers: LeaderboardUser[] = await Promise.all(
          uniqueData.map(async (user: any, index: number) => {
            // Use NFT data from API response - no need to fetch again!
            const oldRockNFTs = user.oldRockNFTs || []
            const goliathNFTs = user.goliathNFTs || []

            // Calculate badges using the NFT data from API response
            const badgeData = {
              totalDensity: user.totalDensity || 0,
              oldRockNFTs,
              goliathNFTs,
            }
            const badges = calculateAllBadges(badgeData)
            const bestBadges = getBestBadges(badges)

            // Fetch Density Deck avatar (non-blocking, can fail silently)
            const avatar = await fetchDensityDeckAvatar(user.address, user.ensName).catch(() => null)
            const avatarFallbackLetter = getAvatarFallbackLetter(user.ensName, user.address)

            return {
              ...user,
              rank: index + 1,
              badges,
              bestBadges,
              avatar: avatar || null,
              avatarFallbackLetter,
              totalDensity: user.totalDensity || 0,
              unextractedDensity: user.unextractedDensity || 0,
            }
          })
        )

        setLeaderboardUsers(processedUsers)
        setCurrentOffset(50)
        setTotalUsers(result.total || processedUsers.length)
        setHasMore(result.total > processedUsers.length || !result.fast)
        setLoadingProgress(100)
      } catch (error) {
        console.error("Error fetching leaderboard:", error)
        setLeaderboardUsers([])
      } finally {
        clearInterval(progressInterval)
        setIsLoading(false)
      }
    }

  // Fetch Density Deck leaderboard data
  const fetchDensityDeckLeaderboard = async () => {
    setIsLoading(true)
    setLoadingProgress(0)
    setError(null)
    setCurrentOffset(0)

    try {
      const response = await fetch("/api/density-deck-leaderboard")
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ Density Deck leaderboard error response:", errorData)
        
        // Log API response structure if available
        if (errorData.apiResponse) {
          console.error("❌ API Response Structure:", JSON.stringify(errorData.apiResponse, null, 2))
        }
        
        const errorMessage = errorData.details || errorData.error || "Unknown error"
        const debugInfo = errorData.debug ? ` (Debug: ${JSON.stringify(errorData.debug)})` : ""
        throw new Error(`Failed to fetch Density Deck leaderboard: ${response.status} - ${errorMessage}${debugInfo}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch Density Deck leaderboard")
      }

      if (!result.data || !Array.isArray(result.data)) {
        throw new Error("Invalid Density Deck leaderboard data")
      }

      // Process Density Deck leaderboard data
      const processedUsers: LeaderboardUser[] = result.data.map((entry: any) => ({
        address: entry.address || "",
        ensName: null,
        displayName: entry.username || `${entry.address?.slice(0, 6)}...${entry.address?.slice(-4)}` || "Unknown",
        totalDensity: 0,
        unextractedDensity: 0,
        hasOldRock: false,
        hasGoliath: false,
        rank: entry.rank || 0,
        badges: [],
        bestBadges: [],
        avatar: entry.avatar || `https://effigy.im/a/${entry.address}.png`,
        username: entry.username || null,
        wins: entry.wins || 0,
        winrate: entry.winrate || 0,
      }))

      setLeaderboardUsers(processedUsers)
      setCurrentOffset(processedUsers.length)
      setTotalUsers(result.total || processedUsers.length)
      setHasMore(false) // Density Deck API returns all data at once
      setLoadingProgress(100)
    } catch (error) {
      console.error("Error fetching Density Deck leaderboard:", error)
      setError(error instanceof Error ? error.message : "Failed to load Density Deck leaderboard")
      setLeaderboardUsers([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (leaderboardType === "density") {
      fetchInitialLeaderboard()
    } else {
      fetchDensityDeckLeaderboard()
    }
  }, [leaderboardType])

  // Removed IntersectionObserver - using button instead

  const loadMoreUsers = async () => {
    if (isLoadingMore || !hasMore) return

    setIsLoadingMore(true)
    try {
      // Load next 50 from cache (or full query if cache is stale)
      const response = await fetch(`/api/leaderboard?limit=50&offset=${currentOffset}`)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("Error loading more users:", response.status, errorData)
        throw new Error(`Failed to fetch more leaderboard data: ${response.status}`)
      }

      const result = await response.json()
      if (!result.success) {
        console.warn("Load more API returned unsuccessful:", result.error || "Unknown error")
        setHasMore(false)
        return
      }
      
      if (!result.data || result.data.length === 0) {
        setHasMore(false)
        return
      }

      // Deduplicate by address to prevent doubles BEFORE processing
      const existingAddresses = new Set(leaderboardUsers.map(u => u.address.toLowerCase()))
      const newData = result.data.filter((user: any) => {
        const addr = user.address?.toLowerCase()
        return addr && !existingAddresses.has(addr)
      })

      // Process and enrich new user data - use NFT data from API response (no additional queries!)
      const processedUsers: LeaderboardUser[] = await Promise.all(
        newData.map(async (user: any, index: number) => {
          // Use NFT data from API response - no need to fetch again!
          const oldRockNFTs = user.oldRockNFTs || []
          const goliathNFTs = user.goliathNFTs || []

          // Calculate badges using the NFT data from API response
          const badgeData = {
            totalDensity: user.totalDensity || 0,
            oldRockNFTs,
            goliathNFTs,
          }
          const badges = calculateAllBadges(badgeData)
          const bestBadges = getBestBadges(badges)

          // Fetch Density Deck avatar (non-blocking, can fail silently)
          const avatar = await fetchDensityDeckAvatar(user.address, user.ensName).catch(() => null)
          const avatarFallbackLetter = getAvatarFallbackLetter(user.ensName, user.address)

          return {
            ...user,
            rank: currentOffset + index + 1,
            badges,
            bestBadges,
            avatar: avatar || null,
            avatarFallbackLetter,
            totalDensity: user.totalDensity || 0,
            unextractedDensity: user.unextractedDensity || 0,
          }
        })
      )
      
      setLeaderboardUsers((prev) => [...prev, ...processedUsers])
      
      // Update offset and check if there are more users to load
      const newOffset = currentOffset + processedUsers.length
      setCurrentOffset(newOffset)
      
      // Check if there are more users: either we got a full batch (50) and total is greater than new offset
      // or if total is not available, check if we got a full batch
      const hasMoreData = result.total 
        ? newOffset < result.total 
        : processedUsers.length === 50
      setHasMore(hasMoreData)
    } catch (error) {
      console.error("Error loading more users:", error)
      setHasMore(false)
    } finally {
      setIsLoadingMore(false)
    }
  }

  // Fetch Density Deck avatar for a user
  const fetchDensityDeckAvatar = async (address: string, username?: string | null) => {
    try {
      const densityDeckApiUrl = process.env.NEXT_PUBLIC_DENSITY_DECK_API_URL || "https://api.densitydeck.com"
      
      // First, try to get user data to get their avatar
      const userResponse = await fetch(`${densityDeckApiUrl}/user/${address}`, {
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(5000),
      })

      if (userResponse.ok) {
        const userData = await userResponse.json()
        const avatar = userData.avatar || ""
        
        if (avatar) {
          // Build avatar URL
          const avatarUrl = avatar.startsWith("http") 
            ? avatar 
            : `https://densitydeck.com/avatar/${avatar}`
          
          // Verify the avatar exists
          const avatarCheck = await fetch(avatarUrl, { method: "HEAD", signal: AbortSignal.timeout(3000) })
          if (avatarCheck.ok) {
            return avatarUrl
          }
        }
      }
    } catch (error) {
      // Silently handle errors - avatar is optional
    }
    return null
  }

  // Get fallback letter for avatar (first letter of username or first letter character from address)
  const getAvatarFallbackLetter = (username?: string | null, address?: string) => {
    // Try username first
    if (username && username.length > 0) {
      const firstLetter = username[0].toUpperCase()
      if (/[A-Za-z]/.test(firstLetter)) {
        return firstLetter
      }
    }
    
    // Fallback to address - find first letter character that is not 'x'
    if (address) {
      for (const char of address) {
        if (/[A-Za-z]/.test(char) && char.toLowerCase() !== 'x') {
          return char.toUpperCase()
        }
      }
      // If no letter found, use first character
      return address[0]?.toUpperCase() || "?"
    }
    
    return "?"
  }

  const fetchENSName = async (address: string) => {
    try {
      const ensResponse = await fetch(`https://api.ensideas.com/ens/resolve/${address}`)
      if (ensResponse.ok) {
        const ensData = await ensResponse.json()
        if (ensData.name) {
          return ensData.name
        }
      }
      return `${address.slice(0, 6)}...${address.slice(-4)}`
    } catch (error) {
      console.error("Error fetching ENS name:", error)
      return `${address.slice(0, 6)}...${address.slice(-4)}`
    }
  }

  // Filter and sort users
  const filteredUsers = leaderboardUsers
    .filter((user) => {
      if (!searchQuery) return true
      const queryLower = searchQuery.toLowerCase()
      return (
        user.displayName.toLowerCase().includes(queryLower) ||
        user.address.toLowerCase().includes(queryLower) ||
        (user.ensName && user.ensName.toLowerCase().includes(queryLower))
      )
    })
    .sort((a, b) => {
      let comparison = 0

      if (sortBy === "rank") {
        comparison = a.rank - b.rank
      } else if (sortBy === "totalDensity") {
        comparison = a.totalDensity - b.totalDensity
      } else if (sortBy === "densityDeck") {
        // Sort by wins (score) for Density Deck
        comparison = (a.wins || 0) - (b.wins || 0)
      }

      return sortDirection === "asc" ? comparison : -comparison
    })

  const handleSort = (column: "rank" | "totalDensity" | "densityDeck") => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortDirection(column === "rank" ? "asc" : "desc")
    }
  }

  const handleRowClick = (address: string) => {
    router.push(`/profile/${address}`)
  }

  // Badge Icon Component with Tooltip (like profile page)
  function BadgeIconWithTooltip({ badge }: { badge: BadgeType }) {
    const [showCustomTooltip, setShowCustomTooltip] = useState(false)
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })
    const badgeRef = useRef<HTMLDivElement>(null)
    
    // Check for special badges that need animations
    const isPureBadge = badge.id === "rock-pure-reactor" && badge.unlocked
    const isPolarBadge = badge.id === "rock-polar-reactor" && badge.unlocked
    const isRecurrentBadge = badge.id === "rock-recurrent-reactor" && badge.unlocked
    const isSingularityBadge = badge.id === "density-singularity" && badge.unlocked
    const isGravityWellBadge = badge.id === "density-gravity-well" && badge.unlocked
    const isHighDensityCoreBadge = badge.id === "rock-high-density-core" && badge.unlocked
    const highDensityColor = badge.rockColor || "#3B82F6"
    const isMediumDensityCoreBadge = badge.id === "rock-medium-density-core" && badge.unlocked
    const mediumDensityColor = badge.rockColor || "#FFB000"
    const isLowDensityCoreBadge = badge.id === "rock-low-density-core" && badge.unlocked
    const lowDensityColor = badge.rockColor || "#8B4513"
    const isFullSpectrumCoreBadge = badge.id === "rock-full-spectrum-core" && badge.unlocked
    const isLithicCouncilBadge = badge.id === "rock-lithic-council" && badge.unlocked
    const isTitanHostBadge = badge.id === "goliath-titan-host" && badge.unlocked
    const isFirstGoliathBadge = badge.id === "goliath-first-goliath" && badge.unlocked
    const isGoliathGuardianBadge = badge.id === "goliath-goliath-guardian" && badge.unlocked
    const isLegionHolderBadge = badge.id === "goliath-legion-holder" && badge.unlocked
    const isMysticBadge = badge.id?.startsWith("mystic-") && !badge.id.includes("-locked") && badge.unlocked
    const isMassBuilderBadge = badge.id === "density-mass-builder" && badge.unlocked
    const isWeightBearerBadge = badge.id === "density-weight-bearer" && badge.unlocked
    const isStoneboundBadge = badge.id === "rock-stonebound" && badge.unlocked
    const isRockCollectiveBadge = badge.id === "rock-collective" && badge.unlocked
    
    // Get rock color for reactive badges (convert hex to rgba)
    const getRockColorRgba = (hex: string, opacity: number) => {
      const r = parseInt(hex.slice(1, 3), 16)
      const g = parseInt(hex.slice(3, 5), 16)
      const b = parseInt(hex.slice(5, 7), 16)
      return `rgba(${r}, ${g}, ${b}, ${opacity})`
    }
    
    const pureColor = badge.rockColor || "#F8F8FF"
    const polarColor = badge.rockColor || "#0F52BA"
    const recurrentColor = badge.rockColor || "#E0115F"
    
    const updateTooltipPosition = () => {
      if (badgeRef.current) {
        const rect = badgeRef.current.getBoundingClientRect()
        setTooltipPosition({
          top: rect.top - 8, // Position above the badge
          left: rect.left + rect.width / 2 // Center horizontally
        })
      }
    }
    
    useEffect(() => {
      if (showCustomTooltip) {
        updateTooltipPosition()
        const handleScroll = () => updateTooltipPosition()
        const handleResize = () => updateTooltipPosition()
        
        window.addEventListener('scroll', handleScroll, true)
        window.addEventListener('resize', handleResize)
        
        return () => {
          window.removeEventListener('scroll', handleScroll, true)
          window.removeEventListener('resize', handleResize)
        }
      }
    }, [showCustomTooltip])
    
    return (
      <>
        <div
          ref={badgeRef}
          className="relative w-8 h-8 flex items-center justify-center rounded-lg bg-gray-800/80 border border-gray-700 cursor-help overflow-visible backdrop-blur-sm"
          onMouseEnter={() => {
            setShowCustomTooltip(true)
            updateTooltipPosition()
          }}
          onMouseLeave={() => setShowCustomTooltip(false)}
          title={!showCustomTooltip ? `${badge.name}${badge.description ? ` - ${badge.description}` : ""}` : undefined}
        >
          {/* Badge Icon Container - Background */}
          <div className="absolute inset-0 rounded-lg bg-gray-800/80 border border-gray-700 z-0 backdrop-blur-sm" />
          
          {/* Animation backgrounds for special badges - Between container and icon */}
          {/* Pure badge - Uses actual rock color with soft hexagon-like shape */}
          {isPureBadge && (
            <>
              {/* Main pulsing hexagon - soft edges with multiple radial gradients */}
              <motion.div
                className="absolute inset-0 z-[5] rounded-lg"
                style={{
                  background: `radial-gradient(ellipse 80% 100% at 50% 50%, ${getRockColorRgba(pureColor, 1)} 0%, ${getRockColorRgba(pureColor, 0.8)} 20%, ${getRockColorRgba(pureColor, 0.6)} 40%, ${getRockColorRgba(pureColor, 0.4)} 60%, ${getRockColorRgba(pureColor, 0.2)} 80%, transparent 100%)`,
                  filter: 'blur(0.5px)',
                }}
                animate={{
                  scale: [1, 1.15, 1.3, 1.15, 1],
                  opacity: [0.7, 0.9, 1, 0.9, 0.7],
                  rotate: [0, 5, 0, -5, 0],
                }}
                transition={{
                  duration: 4 * 1.5,
                  repeat: Infinity,
                  ease: [0.4, 0, 0.6, 1], // Custom easing for smoother, more dynamic feel
                }}
              />
              {/* Additional soft layers for hexagon-like shape */}
              {[...Array(3)].map((_, i) => {
                const angle = (i * 60) * (Math.PI / 180)
                const radius = 35
                return (
                  <motion.div
                    key={i}
                    className="absolute inset-0 z-[5] rounded-lg"
                    style={{
                      background: `radial-gradient(ellipse at ${50 + Math.cos(angle) * radius}% ${50 + Math.sin(angle) * radius}%, ${getRockColorRgba(pureColor, 0.6 - i * 0.15)} 0%, ${getRockColorRgba(pureColor, 0.4 - i * 0.1)} 50%, transparent 100%)`,
                      filter: 'blur(1px)',
                    }}
                    animate={{
                      scale: [1, 1.1 + i * 0.05, 1],
                      opacity: [0.4, 0.7 - i * 0.1, 0.4],
                    }}
                    transition={{
                      duration: (4 + i * 0.5) * 1.5,
                      repeat: Infinity,
                      ease: [0.4, 0, 0.6, 1],
                      delay: i * 0.2 * 1.5,
                    }}
                  />
                )
              })}
              {/* Secondary outer glow layer for more depth */}
              <motion.div
                className="absolute inset-0 z-[4] rounded-lg"
                style={{
                  background: `radial-gradient(circle, ${getRockColorRgba(pureColor, 0.5)} 0%, ${getRockColorRgba(pureColor, 0.3)} 40%, ${getRockColorRgba(pureColor, 0.1)} 70%, transparent 100%)`,
                  filter: 'blur(3px)',
                }}
                animate={{
                  scale: [1.1, 1.25, 1.4, 1.25, 1.1],
                  opacity: [0.4, 0.6, 0.8, 0.6, 0.4],
                }}
                transition={{
                  duration: 4 * 1.5,
                  repeat: Infinity,
                  ease: [0.4, 0, 0.6, 1],
                  delay: 0.2 * 1.5, // Slight offset for more dynamic effect
                }}
              />
            </>
          )}
          
          {/* Polar badge - White fire or black hole effect based on color */}
          {isPolarBadge && (
            <>
              {/* Check if white or black */}
              {polarColor === "#F8F8FF" || polarColor === "#FFFFFF" || polarColor.toLowerCase() === "#ffffff" || polarColor.toLowerCase() === "#f8f8ff" ? (
                // White Fire Effect - Multiple flickering flames
                <>
                  {/* Base fire glow - no scaling, just flickering */}
                  <motion.div
                    className="absolute inset-0 rounded-lg z-[5]"
                    style={{
                      background: `radial-gradient(ellipse at center bottom, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.7) 25%, rgba(255, 255, 255, 0.4) 50%, rgba(255, 255, 255, 0.2) 75%, transparent 100%)`,
                    }}
                    animate={{
                      opacity: [0.7, 1, 0.8, 0.9, 0.7],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  {/* Individual flame tongues - more fire-like flickering, less bouncing */}
                  {[...Array(7)].map((_, i) => {
                    const baseX = 30 + (i * 6) // Spread flames across more evenly
                    const baseHeight = 60 + (i % 3) * 8 // Vary heights more
                    const randomOffset = (i * 7) % 5 // Random-like offset
                    return (
                      <motion.div
                        key={i}
                        className="absolute bottom-0 z-[5]"
                        style={{
                          left: `${baseX}%`,
                          width: `${12 + (i % 3) * 4}%`,
                          height: `${baseHeight}%`,
                          transform: 'translateX(-50%)',
                          background: `radial-gradient(ellipse at center top, rgba(255, 255, 255, ${0.95 - i * 0.08}) 0%, rgba(255, 255, 255, ${0.7 - i * 0.08}) 25%, rgba(255, 255, 255, ${0.4 - i * 0.08}) 50%, transparent 100%)`,
                          borderRadius: '50% 50% 0 0',
                          filter: 'blur(1.5px)',
                        }}
                        animate={{
                          x: [0, (i % 2 === 0 ? 1 : -1) * (2 + (i % 2)), 0, (i % 2 === 0 ? -1 : 1) * (1 + (i % 3)), 0],
                          scaleX: [1, 1.15 + (i % 2) * 0.05, 0.95, 1.1, 1],
                          scaleY: [1, 1.4 + (i % 3) * 0.1, 0.9, 1.3, 1],
                          opacity: [0.5, 1, 0.6, 0.9, 0.5],
                        }}
                        transition={{
                          duration: (0.8 + (i % 3) * 0.2) * 1.5,
                          repeat: Infinity,
                          delay: i * 0.1 * 1.5,
                          ease: [0.4, 0, 0.6, 1], // More natural fire-like easing
                        }}
                      />
                    )
                  })}
                  {/* Additional smaller flickering flames */}
                  {[...Array(5)].map((_, i) => {
                    const randomPos = 25 + (i * 12) + (i % 2) * 3
                    return (
                      <motion.div
                        key={`small-${i}`}
                        className="absolute bottom-0 z-[5]"
                        style={{
                          left: `${randomPos}%`,
                          width: `${6 + (i % 2) * 3}%`,
                          height: `${20 + (i % 3) * 5}%`,
                          transform: 'translateX(-50%)',
                          background: `radial-gradient(ellipse 120% 100% at center top, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.6) 30%, rgba(255, 255, 255, 0.3) 60%, transparent 100%)`,
                          filter: 'blur(1.5px)',
                          borderRadius: '50% 50% 0 0',
                        }}
                        animate={{
                          x: [0, (i % 2 === 0 ? -1 : 1) * (1.5 + (i % 2)), 0],
                          scaleY: [1, 1.5 + (i % 2) * 0.2, 0.8, 1],
                          opacity: [0.4, 0.95, 0.3, 0.4],
                        }}
                        transition={{
                          duration: (0.6 + (i % 2) * 0.3) * 1.5,
                          repeat: Infinity,
                          delay: i * 0.15 * 1.5,
                          ease: [0.4, 0, 0.6, 1],
                        }}
                      />
                    )
                  })}
                </>
              ) : polarColor === "#000000" || polarColor.toLowerCase() === "#000000" ? (
                // Black Hole Effect
                <>
                  <motion.div
                    className="absolute inset-0 rounded-lg z-[5]"
                    style={{
                      background: `radial-gradient(circle at center, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.8) 25%, rgba(0, 0, 0, 0.5) 50%, rgba(0, 0, 0, 0.2) 75%, transparent 100%)`,
                    }}
                    animate={{
                      scale: [1, 0.95, 1],
                      opacity: [0.8, 1, 0.8],
                    }}
                    transition={{
                      duration: 3 * 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  {/* Swirling effect */}
                  <motion.div
                    className="absolute inset-0 rounded-lg z-[5]"
                    style={{
                      background: `conic-gradient(from 0deg, transparent 0%, rgba(0, 0, 0, 0.8) 15%, rgba(0, 0, 0, 0.6) 30%, transparent 45%, rgba(0, 0, 0, 0.5) 60%, rgba(0, 0, 0, 0.3) 75%, transparent 90%, rgba(0, 0, 0, 0.2) 100%)`,
                    }}
                    animate={{
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: 8 * 1.5,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                  {/* Inner dark core */}
                  <motion.div
                    className="absolute inset-0 rounded-lg z-[5]"
                    style={{
                      background: `radial-gradient(circle at center, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.7) 30%, rgba(0, 0, 0, 0.4) 60%, transparent 100%)`,
                    }}
                    animate={{
                      scale: [0.8, 0.9, 0.8],
                      opacity: [0.7, 1, 0.7],
                    }}
                    transition={{
                      duration: 2 * 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </>
              ) : (
                // Default elliptical shape for other colors
                <motion.div
                  className="absolute inset-0 rounded-lg z-[5]"
                  style={{
                    background: `radial-gradient(ellipse at center, ${getRockColorRgba(polarColor, 1)} 0%, ${getRockColorRgba(polarColor, 0.7)} 30%, ${getRockColorRgba(polarColor, 0.4)} 60%, ${getRockColorRgba(polarColor, 0.1)} 85%, transparent 100%)`,
                  }}
                  animate={{
                    scaleX: [1, 1.3, 1],
                    scaleY: [1, 1.15, 1],
                    opacity: [0.8, 1, 0.8],
                  }}
                  transition={{
                    duration: 2.5 * 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              )}
            </>
          )}
          
          {/* Recurrent badge - Uses actual rock color with sparkle effect */}
          {isRecurrentBadge && (
            <>
              <motion.div
                className="absolute inset-0 rounded-lg z-[5] overflow-visible"
                style={{
                  background: `radial-gradient(circle, ${getRockColorRgba(recurrentColor, 1)} 0%, ${getRockColorRgba(recurrentColor, 0.7)} 40%, ${getRockColorRgba(recurrentColor, 0.4)} 70%, transparent 100%)`,
                }}
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.8, 1, 0.8],
                }}
                transition={{
                  duration: 3 * 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              {/* Sparkle effect with actual rock color - slower, more random positioning and size */}
              {[...Array(12)].map((_, i) => {
                // More random positioning
                const randomX = 10 + (i * 7.5) + ((i * 13) % 8) - 4
                const randomY = 10 + ((i * 11) % 70) + ((i * 7) % 12) - 6
                // Random size variation
                const randomSize = 1 + (i % 3) * 0.5 + ((i * 5) % 3) * 0.3
                return (
                  <motion.div
                    key={i}
                    className="absolute z-[5]"
                    style={{
                      width: `${randomSize * 4}px`,
                      height: `${randomSize * 4}px`,
                      borderRadius: '50%',
                      background: `radial-gradient(circle, ${getRockColorRgba(recurrentColor, 1)} 0%, ${getRockColorRgba(recurrentColor, 0.8)} 30%, ${getRockColorRgba(recurrentColor, 0.5)} 50%, ${getRockColorRgba(recurrentColor, 0.2)} 70%, transparent 100%)`,
                      left: `${Math.max(5, Math.min(95, randomX))}%`,
                      top: `${Math.max(5, Math.min(95, randomY))}%`,
                      boxShadow: `0 0 ${randomSize * 4}px ${getRockColorRgba(recurrentColor, 0.9)}, 0 0 ${randomSize * 8}px ${getRockColorRgba(recurrentColor, 0.6)}`,
                      filter: 'blur(0.5px)',
                    }}
                    animate={{
                      scale: [0, randomSize * 1.5, 0],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: (2.5 + (i % 3) * 0.5) * 1.5,
                      repeat: Infinity,
                      delay: i * 0.3 * 1.5,
                      ease: "easeInOut",
                    }}
                  />
                )
              })}
            </>
          )}
          
          {/* Singularity badge - Slow swirling vortex effect */}
          {isSingularityBadge && (
            <>
              {/* Outer swirling rings */}
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-lg z-[5]"
                  style={{
                    background: `radial-gradient(circle at ${50 + i * 10}% ${50 + i * 10}%, rgba(139, 92, 246, ${0.8 - i * 0.2}) 0%, rgba(168, 85, 247, ${0.6 - i * 0.15}) 30%, transparent 70%)`,
                    borderRadius: '50%',
                  }}
                  animate={{
                    rotate: [0, 360],
                    scale: [1 - i * 0.1, 1.1 - i * 0.1, 1 - i * 0.1],
                    x: [0, (i % 2 === 0 ? 1 : -1) * 5, 0],
                    y: [0, (i % 2 === 0 ? -1 : 1) * 5, 0],
                  }}
                  transition={{
                    duration: (8 + i * 2) * 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.5 * 1.5,
                  }}
                />
              ))}
              {/* Pulsing core */}
              <motion.div
                className="absolute inset-0 rounded-lg z-[5]"
                style={{
                  background: "radial-gradient(circle, rgba(139, 92, 246, 1) 0%, rgba(168, 85, 247, 0.7) 40%, rgba(192, 132, 252, 0.4) 70%, transparent 100%)",
                }}
                animate={{
                  scale: [1, 1.15, 0.95, 1],
                  opacity: [0.8, 1, 0.9, 0.8],
                }}
                transition={{
                  duration: 3 * 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </>
          )}
          
          {/* Gravity Well badge - Slow gravitational pull effect */}
          {isGravityWellBadge && (
            <>
              {/* Outer rings being pulled in */}
              {[...Array(2)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-lg z-[5]"
                  style={{
                    border: `2px solid rgba(139, 92, 246, ${0.6 - i * 0.2})`,
                    borderRadius: '50%',
                    borderStyle: 'dashed',
                  }}
                  animate={{
                    scale: [1 + i * 0.2, 0.8, 1 + i * 0.2],
                    opacity: [0.5, 0.9, 0.5],
                  }}
                  transition={{
                    duration: 3 + i * 0.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.4,
                  }}
                />
              ))}
              {/* Pulsing core */}
              <motion.div
                className="absolute inset-0 rounded-lg z-[5]"
                style={{
                  background: "radial-gradient(circle, rgba(139, 92, 246, 1) 0%, rgba(168, 85, 247, 0.8) 40%, rgba(192, 132, 252, 0.5) 70%, transparent 100%)",
                }}
                animate={{
                  scale: [1, 1.1, 0.95, 1],
                  opacity: [0.8, 1, 0.9, 0.8],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </>
          )}
          
          {/* High Density Core badge - Uses actual rock color with expanding energy rings */}
          {isHighDensityCoreBadge && (
            <>
              {/* Expanding energy rings */}
              {[...Array(2)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-lg z-[5]"
                  style={{
                    background: `radial-gradient(circle, transparent 45%, ${getRockColorRgba(highDensityColor, 0.4 - i * 0.15)} 48%, ${getRockColorRgba(highDensityColor, 0.6 - i * 0.2)} 50%, ${getRockColorRgba(highDensityColor, 0.4 - i * 0.15)} 52%, transparent 55%)`,
                    borderRadius: '50%',
                  }}
                  animate={{
                    scale: [1 + i * 0.1, 1.4 - i * 0.1, 1 + i * 0.1],
                    opacity: [0.5, 0.9, 0.5],
                  }}
                  transition={{
                    duration: (3 + i * 0.5) * 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.4 * 1.5,
                  }}
                />
              ))}
              {/* Orbiting particles */}
              {[...Array(4)].map((_, i) => {
                const angle = (i * 90) * (Math.PI / 180)
                const radius = 30
                return (
                  <motion.div
                    key={i}
                    className="absolute inset-0 rounded-lg z-[5]"
                    style={{
                      background: `radial-gradient(circle at ${50 + Math.cos(angle) * radius}% ${50 + Math.sin(angle) * radius}%, ${getRockColorRgba(highDensityColor, 0.9)} 0%, ${getRockColorRgba(highDensityColor, 0.5)} 30%, transparent 60%)`,
                  }}
                  animate={{
                    x: [0, Math.cos(angle) * 8, 0],
                    y: [0, Math.sin(angle) * 8, 0],
                    scale: [0.5, 1.2, 0.5],
                    opacity: [0.4, 1, 0.4],
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: (4 + i * 0.3) * 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.2 * 1.5,
                  }}
                  />
                )
              })}
              {/* Pulsing core with rock color */}
              <motion.div
                className="absolute inset-0 rounded-lg z-[5]"
                style={{
                  background: `radial-gradient(circle, ${getRockColorRgba(highDensityColor, 1)} 0%, ${getRockColorRgba(highDensityColor, 0.8)} 40%, ${getRockColorRgba(highDensityColor, 0.5)} 70%, transparent 100%)`,
                }}
                animate={{
                  scale: [1, 1.15, 0.95, 1],
                  opacity: [0.8, 1, 0.85, 0.8],
                }}
                transition={{
                  duration: 3 * 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </>
          )}
          
          {/* Low Density Core badge - Uses actual rock color */}
          {isLowDensityCoreBadge && (
            <>
              {/* Expanding energy rings - soft gradient instead of hard border */}
              {[...Array(2)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-lg z-[5]"
                  style={{
                    background: `radial-gradient(circle, transparent 45%, ${getRockColorRgba(lowDensityColor, 0.4 - i * 0.15)} 48%, ${getRockColorRgba(lowDensityColor, 0.6 - i * 0.2)} 50%, ${getRockColorRgba(lowDensityColor, 0.4 - i * 0.15)} 52%, transparent 55%)`,
                    borderRadius: '50%',
                  }}
                  animate={{
                    scale: [1 + i * 0.1, 1.3 - i * 0.1, 1 + i * 0.1],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: (3 + i * 0.5) * 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.4 * 1.5,
                  }}
                />
              ))}
              {/* Pulsing core with rock color */}
              <motion.div
                className="absolute inset-0 rounded-lg z-[5]"
                style={{
                  background: `radial-gradient(circle, ${getRockColorRgba(lowDensityColor, 1)} 0%, ${getRockColorRgba(lowDensityColor, 0.8)} 40%, ${getRockColorRgba(lowDensityColor, 0.5)} 70%, transparent 100%)`,
                }}
                animate={{
                  scale: [1, 1.1, 0.95, 1],
                  opacity: [0.8, 1, 0.85, 0.8],
                }}
                transition={{
                  duration: 3 * 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </>
          )}
          
          {/* Medium Density Core badge - Uses actual rock color */}
          {isMediumDensityCoreBadge && (
            <>
              {/* Expanding energy rings - soft gradient instead of hard border */}
              {[...Array(2)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-lg z-[5]"
                  style={{
                    background: `radial-gradient(circle, transparent 45%, ${getRockColorRgba(mediumDensityColor, 0.4 - i * 0.15)} 48%, ${getRockColorRgba(mediumDensityColor, 0.6 - i * 0.2)} 50%, ${getRockColorRgba(mediumDensityColor, 0.4 - i * 0.15)} 52%, transparent 55%)`,
                    borderRadius: '50%',
                  }}
                  animate={{
                    scale: [1 + i * 0.1, 1.3 - i * 0.1, 1 + i * 0.1],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: (3 + i * 0.5) * 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.4 * 1.5,
                  }}
                />
              ))}
              {/* Orbiting particles */}
              {[...Array(3)].map((_, i) => {
                const angle = (i * 120) * (Math.PI / 180)
                const radius = 28
                return (
                  <motion.div
                    key={i}
                    className="absolute inset-0 rounded-lg z-[5]"
                    style={{
                      background: `radial-gradient(circle at ${50 + Math.cos(angle) * radius}% ${50 + Math.sin(angle) * radius}%, ${getRockColorRgba(mediumDensityColor, 0.9)} 0%, ${getRockColorRgba(mediumDensityColor, 0.5)} 30%, transparent 60%)`,
                    }}
                    animate={{
                      x: [0, Math.cos(angle) * 7, 0],
                      y: [0, Math.sin(angle) * 7, 0],
                      scale: [0.5, 1.1, 0.5],
                      opacity: [0.4, 0.9, 0.4],
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: (4 + i * 0.3) * 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.2 * 1.5,
                    }}
                  />
                )
              })}
              {/* Pulsing core with rock color */}
              <motion.div
                className="absolute inset-0 rounded-lg z-[5]"
                style={{
                  background: `radial-gradient(circle, ${getRockColorRgba(mediumDensityColor, 1)} 0%, ${getRockColorRgba(mediumDensityColor, 0.8)} 40%, ${getRockColorRgba(mediumDensityColor, 0.5)} 70%, transparent 100%)`,
                }}
                animate={{
                  scale: [1, 1.12, 0.95, 1],
                  opacity: [0.8, 1, 0.85, 0.8],
                }}
                transition={{
                  duration: 3 * 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </>
          )}
          
          {/* Full Spectrum Core badge - Rainbow circling animation */}
          {isFullSpectrumCoreBadge && (
            <>
              {/* Rotating rainbow ring - soft edges with blur and smooth mask */}
              <motion.div
                className="absolute inset-0 rounded-lg z-[5]"
                style={{
                  background: "radial-gradient(circle, transparent 38%, rgba(255, 0, 0, 0.3) 42%, rgba(255, 127, 0, 0.4) 45%, rgba(255, 255, 0, 0.5) 48%, rgba(0, 255, 0, 0.4) 51%, rgba(0, 0, 255, 0.3) 54%, rgba(75, 0, 130, 0.4) 57%, rgba(148, 0, 211, 0.3) 60%, transparent 63%)",
                  filter: 'blur(2px)',
                }}
                animate={{
                  rotate: [0, 360],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 4 * 1.5,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
              {/* Additional soft rainbow layers for smoother effect */}
              {[...Array(3)].map((_, i) => {
                const colors = [
                  ['rgba(255, 0, 0, 0.4)', 'rgba(255, 127, 0, 0.3)', 'rgba(255, 255, 0, 0.2)'],
                  ['rgba(0, 255, 0, 0.4)', 'rgba(0, 0, 255, 0.3)', 'rgba(75, 0, 130, 0.2)'],
                  ['rgba(148, 0, 211, 0.4)', 'rgba(255, 0, 0, 0.3)', 'rgba(255, 127, 0, 0.2)'],
                ]
                const colorSet = colors[i]
                return (
                  <motion.div
                    key={i}
                    className="absolute inset-0 rounded-lg z-[5]"
                    style={{
                      background: `radial-gradient(circle, transparent ${40 + i * 5}%, ${colorSet[0]} ${45 + i * 5}%, ${colorSet[1]} ${50 + i * 5}%, ${colorSet[2]} ${55 + i * 5}%, transparent ${60 + i * 5}%)`,
                      filter: `blur(${1 + i * 0.5}px)`,
                    }}
                    animate={{
                      rotate: [0, 360 * (i % 2 === 0 ? 1 : -1)],
                      opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{
                      duration: (4 + i * 0.5) * 1.5,
                      repeat: Infinity,
                      ease: "linear",
                      delay: i * 0.3 * 1.5,
                    }}
                  />
                )
              })}
              {/* Additional rainbow particles orbiting - soft edges */}
              {[...Array(6)].map((_, i) => {
                const angle = (i * 60) * (Math.PI / 180)
                const colors = ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#9400d3']
                const color = colors[i % colors.length]
                const radius = 32
                return (
                  <motion.div
                    key={i}
                    className="absolute inset-0 rounded-lg z-[5]"
                    style={{
                      background: `radial-gradient(circle at ${50 + Math.cos(angle) * radius}% ${50 + Math.sin(angle) * radius}%, ${color} 0%, ${color}80 20%, ${color}40 40%, transparent 70%)`,
                      filter: 'blur(1px)',
                    }}
                    animate={{
                      x: [0, Math.cos(angle) * 10, 0],
                      y: [0, Math.sin(angle) * 10, 0],
                      scale: [0.6, 1.3, 0.6],
                      opacity: [0.5, 1, 0.5],
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: (5 + i * 0.2) * 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.15 * 1.5,
                    }}
                  />
                )
              })}
              {/* Pulsing rainbow core */}
              <motion.div
                className="absolute inset-0 rounded-lg z-[5]"
                style={{
                  background: "radial-gradient(circle, rgba(255, 0, 0, 0.9) 0%, rgba(255, 127, 0, 0.8) 20%, rgba(255, 255, 0, 0.7) 40%, rgba(0, 255, 0, 0.6) 60%, rgba(0, 0, 255, 0.5) 80%, transparent 100%)",
                }}
                animate={{
                  scale: [1, 1.15, 0.95, 1],
                  opacity: [0.8, 1, 0.85, 0.8],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 3 * 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </>
          )}
          
          {/* Lithic Council badge - Modern golden energy with rotating particles */}
          {isLithicCouncilBadge && (
            <>
              {/* Rotating golden particles - soft edges */}
              {[...Array(6)].map((_, i) => {
                const angle = (i * 60) * (Math.PI / 180)
                const radius = 35
                return (
                  <motion.div
                    key={i}
                    className="absolute inset-0 rounded-lg z-[5]"
                    style={{
                      background: `radial-gradient(circle at ${50 + Math.cos(angle) * radius}% ${50 + Math.sin(angle) * radius}%, rgba(250, 204, 21, 0.9) 0%, rgba(234, 179, 8, 0.7) 30%, rgba(234, 179, 8, 0.4) 50%, rgba(250, 204, 21, 0.2) 70%, transparent 100%)`,
                      filter: 'blur(1px)',
                    }}
                    animate={{
                      x: [0, Math.cos(angle) * 8, 0],
                      y: [0, Math.sin(angle) * 8, 0],
                      scale: [0.6, 1.1, 0.6],
                      opacity: [0.4, 1, 0.4],
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: (4 + i * 0.3) * 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.2 * 1.5,
                    }}
                  />
                )
              })}
              {/* Rotating outer ring - soft gradient */}
              <motion.div
                className="absolute inset-0 rounded-lg z-[5]"
                style={{
                  background: `radial-gradient(circle, transparent 43%, rgba(250, 204, 21, 0.2) 46%, rgba(250, 204, 21, 0.5) 48%, rgba(250, 204, 21, 0.7) 50%, rgba(250, 204, 21, 0.5) 52%, rgba(250, 204, 21, 0.2) 54%, transparent 57%)`,
                  filter: 'blur(1px)',
                }}
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.1, 1],
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{
                  duration: 5 * 1.5,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
              {/* Pulsing center core */}
              <motion.div
                className="absolute inset-0 rounded-lg z-[5]"
                style={{
                  background: "radial-gradient(circle, rgba(250, 204, 21, 1) 0%, rgba(234, 179, 8, 0.8) 40%, rgba(217, 119, 6, 0.5) 70%, transparent 100%)",
                }}
                animate={{
                  scale: [1, 1.15, 0.95, 1],
                  opacity: [0.8, 1, 0.85, 0.8],
                }}
                transition={{
                  duration: 3 * 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              {/* Inner rotating gradient - soft with blur */}
              <motion.div
                className="absolute inset-0 rounded-lg z-[5]"
                style={{
                  background: `radial-gradient(circle, transparent 30%, rgba(250, 204, 21, 0.3) 40%, rgba(234, 179, 8, 0.5) 50%, rgba(250, 204, 21, 0.3) 60%, transparent 70%)`,
                  filter: 'blur(2px)',
                }}
                animate={{
                  rotate: [0, -360],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 6 * 1.5,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            </>
          )}
          
          {/* Titan Host badge - Slow expanding energy waves */}
          {isTitanHostBadge && (
            <>
              {/* Expanding energy rings - soft gradient instead of hard border */}
              {[...Array(2)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-lg z-[5]"
                  style={{
                    background: `radial-gradient(circle, transparent 45%, rgba(249, 115, 22, ${0.4 - i * 0.15}) 48%, rgba(249, 115, 22, ${0.7 - i * 0.3}) 50%, rgba(249, 115, 22, ${0.4 - i * 0.15}) 52%, transparent 55%)`,
                    borderRadius: '50%',
                  }}
                  animate={{
                    scale: [0.8 + i * 0.1, 1.3, 0.8 + i * 0.1],
                    opacity: [0.6, 1, 0.6],
                  }}
                  transition={{
                    duration: (4 + i * 0.8) * 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.6 * 1.5,
                  }}
                />
              ))}
              {/* Pulsing core */}
              <motion.div
                className="absolute inset-0 rounded-lg z-[5]"
                style={{
                  background: "radial-gradient(circle, rgba(249, 115, 22, 1) 0%, rgba(251, 146, 60, 0.8) 40%, rgba(253, 186, 116, 0.5) 70%, transparent 100%)",
                }}
                animate={{
                  scale: [1, 1.12, 1],
                  opacity: [0.8, 1, 0.8],
                }}
                transition={{
                  duration: 3 * 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </>
          )}
          
          {/* Mystic badges - Slow flowing rainbow waves */}
          {isMysticBadge && (
            <>
              {/* Multiple rainbow wave layers flowing in different directions */}
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-lg z-[5] overflow-visible"
                  style={{
                    background: `linear-gradient(${i * 60}deg, 
                      rgba(239, 68, 68, ${0.7 - i * 0.15}) 0%, 
                      rgba(251, 146, 60, ${0.7 - i * 0.15}) 14%, 
                      rgba(234, 179, 8, ${0.7 - i * 0.15}) 28%, 
                      rgba(34, 197, 94, ${0.7 - i * 0.15}) 42%, 
                      rgba(59, 130, 246, ${0.7 - i * 0.15}) 57%, 
                      rgba(139, 92, 246, ${0.7 - i * 0.15}) 71%, 
                      rgba(236, 72, 153, ${0.7 - i * 0.15}) 85%, 
                      rgba(239, 68, 68, ${0.7 - i * 0.15}) 100%)`,
                  }}
                  animate={{
                    x: [0, (i % 2 === 0 ? 1 : -1) * 8, 0],
                    y: [0, (i % 2 === 0 ? -1 : 1) * 8, 0],
                    scale: [1, 1.05, 1],
                    opacity: [0.6, 0.9, 0.6],
                  }}
                  transition={{
                    duration: 5 + i * 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.6,
                  }}
                />
              ))}
              {/* Pulsing center glow */}
              <motion.div
                className="absolute inset-0 rounded-lg z-[5]"
                style={{
                  background: "radial-gradient(circle, rgba(139, 92, 246, 0.6) 0%, rgba(236, 72, 153, 0.4) 50%, transparent 100%)",
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </>
          )}
          
          {/* Gravity Well badge - Slow gravitational pull effect */}
          {isGravityWellBadge && (
            <>
              {/* Outer rings being pulled in */}
              {[...Array(2)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-lg z-[5]"
                  style={{
                    border: `2px solid rgba(139, 92, 246, ${0.6 - i * 0.2})`,
                    borderRadius: '50%',
                    borderStyle: 'dashed',
                  }}
                  animate={{
                    scale: [1 + i * 0.2, 0.8, 1 + i * 0.2],
                    opacity: [0.5, 0.9, 0.5],
                  }}
                  transition={{
                    duration: 3 + i * 0.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.4,
                  }}
                />
              ))}
              {/* Pulsing core */}
              <motion.div
                className="absolute inset-0 rounded-lg z-[5]"
                style={{
                  background: "radial-gradient(circle, rgba(139, 92, 246, 1) 0%, rgba(168, 85, 247, 0.8) 40%, rgba(192, 132, 252, 0.5) 70%, transparent 100%)",
                }}
                animate={{
                  scale: [1, 1.1, 0.95, 1],
                  opacity: [0.8, 1, 0.9, 0.8],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </>
          )}
          
          {/* Mass Builder badge - Slow building energy effect */}
          {isMassBuilderBadge && (
            <>
              {/* Layered energy building up */}
              {[...Array(2)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-lg z-[5]"
                  style={{
                    background: `radial-gradient(circle at ${50 + (i % 2 === 0 ? -10 : 10)}% ${50 + (i % 2 === 0 ? 10 : -10)}%, rgba(147, 51, 234, ${0.8 - i * 0.3}) 0%, rgba(168, 85, 247, ${0.6 - i * 0.2}) 50%, transparent 100%)`,
                  }}
                  animate={{
                    scale: [1, 1.1 + i * 0.05, 1],
                    opacity: [0.6, 1, 0.6],
                  }}
                  transition={{
                duration: (3.5 + i * 0.5) * 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.5 * 1.5,
              }}
            />
          ))}
        </>
      )}
      
      {/* Weight Bearer badge - Slow balancing effect */}
      {isWeightBearerBadge && (
        <motion.div
          className="absolute inset-0 rounded-lg z-[5]"
          style={{
            background: "radial-gradient(ellipse at center, rgba(168, 85, 247, 1) 0%, rgba(147, 51, 234, 0.7) 50%, transparent 100%)",
          }}
          animate={{
            scaleX: [1, 1.1, 0.95, 1],
            scaleY: [1, 0.95, 1.1, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 4 * 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
      
      {/* Stonebound badge - Slow earth-like pulsing */}
      {isStoneboundBadge && (
        <>
          {/* Earth-like layers */}
          {[...Array(2)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-lg z-[5]"
              style={{
                background: `radial-gradient(circle, rgba(139, 69, 19, ${0.8 - i * 0.3}) 0%, rgba(160, 82, 45, ${0.6 - i * 0.2}) 50%, transparent 100%)`,
              }}
              animate={{
                scale: [1, 1.08 + i * 0.02, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: (3.5 + i * 0.8) * 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.4 * 1.5,
              }}
            />
          ))}
        </>
      )}
          
          {/* Rock Collective badge - Slow gathering effect */}
          {isRockCollectiveBadge && (
            <>
              {/* Multiple gathering points */}
              {[...Array(3)].map((_, i) => {
                const angle = (i * 120) * (Math.PI / 180)
                const radius = 30
                return (
                  <motion.div
                    key={i}
                    className="absolute inset-0 rounded-lg z-[5]"
                    style={{
                      background: `radial-gradient(circle at ${50 + Math.cos(angle) * radius}% ${50 + Math.sin(angle) * radius}%, rgba(139, 69, 19, 0.8) 0%, transparent 60%)`,
                    }}
                    animate={{
                      scale: [0.8, 1.2, 0.8],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 4 + i * 0.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.6,
                    }}
                  />
                )
              })}
            </>
          )}
          
          {/* First Goliath badge - Subtle initial awakening glow */}
          {isFirstGoliathBadge && (
            <motion.div
              className="absolute inset-0 rounded-lg z-[5]"
              style={{
                background: "radial-gradient(circle, rgba(139, 92, 246, 0.9) 0%, rgba(124, 58, 237, 0.6) 40%, rgba(139, 92, 246, 0.3) 70%, transparent 100%)",
              }}
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.7, 0.95, 0.7],
              }}
              transition={{
                duration: 3 * 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}
          
          {/* Goliath Guardian badge - Subtle protective energy waves */}
          {isGoliathGuardianBadge && (
            <>
              {/* Protective energy rings */}
              {[...Array(2)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-lg z-[5]"
                  style={{
                    background: `radial-gradient(ellipse, transparent 40%, rgba(168, 85, 247, ${0.4 - i * 0.15}) 45%, rgba(168, 85, 247, ${0.6 - i * 0.2}) 50%, rgba(168, 85, 247, ${0.4 - i * 0.15}) 55%, transparent 60%)`,
                    borderRadius: '50%',
                  }}
                  animate={{
                    scale: [1 + i * 0.1, 1.15 + i * 0.1, 1 + i * 0.1],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: (3.5 + i * 0.5) * 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.4 * 1.5,
                  }}
                />
              ))}
              {/* Pulsing core */}
              <motion.div
                className="absolute inset-0 rounded-lg z-[5]"
                style={{
                  background: "radial-gradient(circle, rgba(168, 85, 247, 0.8) 0%, rgba(139, 92, 246, 0.5) 50%, transparent 100%)",
                }}
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 3 * 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </>
          )}
          
          {/* Legion Holder badge - Similar to Titan Host but with different color and pattern */}
          {isLegionHolderBadge && (
            <>
              {/* Expanding energy rings - similar to Titan Host but with purple/orange mix */}
              {[...Array(2)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-lg z-[5]"
                  style={{
                background: `radial-gradient(circle, transparent 45%, rgba(168, 85, 247, ${0.4 - i * 0.15}) 48%, rgba(168, 85, 247, ${0.7 - i * 0.3}) 50%, rgba(168, 85, 247, ${0.4 - i * 0.15}) 52%, transparent 55%)`,
                borderRadius: '50%',
                  }}
                  animate={{
                    scale: [0.8 + i * 0.1, 1.35, 0.8 + i * 0.1],
                    opacity: [0.6, 1, 0.6],
                    rotate: [0, i % 2 === 0 ? 180 : -180, 360],
                  }}
                  transition={{
                    duration: (4.5 + i * 0.8) * 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.6 * 1.5,
                  }}
                />
              ))}
              {/* Pulsing core with purple gradient */}
              <motion.div
                className="absolute inset-0 rounded-lg z-[5]"
                style={{
                  background: "radial-gradient(circle, rgba(168, 85, 247, 1) 0%, rgba(147, 51, 234, 0.8) 40%, rgba(192, 132, 252, 0.5) 70%, transparent 100%)",
                }}
                animate={{
                  scale: [1, 1.12, 1],
                  opacity: [0.8, 1, 0.8],
                }}
                transition={{
                  duration: 3 * 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              {/* Additional orbiting particles for distinction from Titan Host */}
              {[...Array(3)].map((_, i) => {
                const angle = (i * 120) * (Math.PI / 180)
                const radius = 35
                return (
                  <motion.div
                    key={`particle-${i}`}
                    className="absolute inset-0 rounded-lg z-[5]"
                    style={{
                      background: `radial-gradient(circle at ${50 + Math.cos(angle) * radius}% ${50 + Math.sin(angle) * radius}%, rgba(192, 132, 252, 0.8) 0%, rgba(192, 132, 252, 0.4) 40%, transparent 60%)`,
                    }}
                    animate={{
                      x: [0, Math.cos(angle) * 6, 0],
                      y: [0, Math.sin(angle) * 6, 0],
                      scale: [0.4, 1, 0.4],
                      opacity: [0.3, 0.8, 0.3],
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: (5 + i * 0.5) * 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.4 * 1.5,
                    }}
                  />
                )
              })}
            </>
          )}
          
          {/* Badge Icon - On top of everything */}
          <div className="relative z-10">
            <Award
              className={`w-5 h-5 ${
                badge.unlocked ? "text-white opacity-100" : "text-gray-600 opacity-30"
              }`}
            />
          </div>
        </div>
        
        {/* Custom tooltip on hover - rendered via portal to escape container bounds */}
        {showCustomTooltip && typeof window !== 'undefined' && createPortal(
          <div 
            className="fixed z-[99999] pointer-events-none"
            style={{ 
              top: `${tooltipPosition.top}px`,
              left: `${tooltipPosition.left}px`,
              transform: 'translate(-50%, -100%)',
              marginBottom: '8px'
            }}
          >
            <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap border border-gray-700 shadow-lg">
              <div className="font-semibold">{badge.name}</div>
              {badge.description && (
                <div className="text-gray-400 text-xs mt-0.5">{badge.description}</div>
              )}
            </div>
          </div>,
          document.body
        )}
      </>
    )
  }

  return (
    <div className="flex">
      <Sidebar isWalletConnected={isWalletConnected} userProfile={userProfile} />
      <div className="min-h-screen text-white overflow-hidden relative w-full lg:ml-[79px]">
        <CyberpunkBackground />
        <Header />

        <main className="relative z-20 pt-32 pb-20">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-montserrat text-white mb-3 sm:mb-4">LEADERBOARD</h1>
              <p className="text-gray-400 font-pt-mono text-sm sm:text-base md:text-lg">Top players ranked by performance • Updated daily</p>
            </motion.div>

            {/* Search and Filter */}
            <div className="mb-8 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="relative flex-1 md:max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by name or address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 w-full"
                />
              </div>
              
              {/* Leaderboard Type Toggle - Segmented Control Style */}
              <div className="flex items-center gap-1 bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-1">
                <button
                  onClick={() => {
                    setLeaderboardType("density")
                  }}
                  className={`px-4 py-2 rounded-md font-pt-mono text-xs sm:text-sm font-bold transition-all duration-200 ${
                    leaderboardType === "density"
                      ? "bg-cyan-600 text-white shadow-lg shadow-cyan-600/20"
                      : "text-gray-400 hover:text-gray-300"
                  }`}
                >
                  $DENSITY
                </button>
                <button
                  onClick={() => {
                    setLeaderboardType("densityDeck")
                  }}
                  className={`px-4 py-2 rounded-md font-pt-mono text-xs sm:text-sm font-bold transition-all duration-200 ${
                    leaderboardType === "densityDeck"
                      ? "bg-cyan-600 text-white shadow-lg shadow-cyan-600/20"
                      : "text-gray-400 hover:text-gray-300"
                  }`}
                >
                  DENSITY DECK
                </button>
              </div>
            </div>

            {/* Leaderboard Table - Desktop */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-800">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th
                        className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-pt-mono text-gray-400 cursor-pointer hover:text-white"
                        onClick={() => handleSort("rank")}
                      >
                        RANK {sortBy === "rank" && (sortDirection === "asc" ? "↑" : "↓")}
                      </th>
                      {leaderboardType === "density" ? (
                        <>
                          <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-pt-mono text-gray-400">PLAYER</th>
                          <th
                            className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-pt-mono text-gray-400 cursor-pointer hover:text-white"
                            onClick={() => handleSort("totalDensity")}
                          >
                            TOTAL DENSITY {sortBy === "totalDensity" && (sortDirection === "asc" ? "↑" : "↓")}
                          </th>
                          <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-pt-mono text-gray-400">BADGES</th>
                        </>
                      ) : (
                        <>
                          <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-pt-mono text-gray-400">USERNAME</th>
                          <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-pt-mono text-gray-400">AVATAR</th>
                          <th
                            className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-pt-mono text-gray-400 cursor-pointer hover:text-white"
                            onClick={() => handleSort("densityDeck")}
                          >
                            WINS {sortBy === "densityDeck" && (sortDirection === "asc" ? "↑" : "↓")}
                          </th>
                          <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-pt-mono text-gray-400">WIN RATE</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {error ? (
                      <tr>
                        <td colSpan={leaderboardType === "density" ? 4 : 5} className="px-4 sm:px-6 py-8 sm:py-12">
                          <div className="flex flex-col items-center justify-center gap-4">
                            <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6 max-w-2xl w-full">
                              <h3 className="text-red-400 text-xl font-bold mb-2">Configuration Error</h3>
                              <p className="text-gray-300 mb-4">{error}</p>
                              {error.includes("NEXT_PUBLIC_AMPLIFY_API_URL") && (
                                <div className="text-left bg-gray-900/50 rounded p-4 mt-4">
                                  <p className="text-sm text-gray-400 mb-2">To fix this, add the following to your <code className="text-purple-400">.env.local</code> file:</p>
                                  <code className="text-green-400 text-sm block">NEXT_PUBLIC_AMPLIFY_API_URL=your_api_url_here</code>
                                  <p className="text-xs text-gray-500 mt-2">After adding the variable, restart your development server.</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : isLoading ? (
                      <tr>
                        <td colSpan={leaderboardType === "density" ? 4 : 5} className="px-4 sm:px-6 py-8 sm:py-12">
                          <div className="flex flex-col items-center justify-center gap-4">
                            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                            <div className="w-full max-w-xs">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-gray-400 font-pt-mono text-sm">Loading leaderboard...</p>
                                <p className="text-purple-400 font-pt-mono text-sm font-bold">
                                  {Math.round(loadingProgress)}%
                                </p>
                              </div>
                              <div className="w-full bg-gray-800 rounded-lg h-2 overflow-hidden">
                                <motion.div
                                  className="bg-purple-500 h-full rounded-lg"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${loadingProgress}%` }}
                                  transition={{ duration: 0.3, ease: "easeOut" }}
                                />
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <tr
                          key={user.address}
                          className={`border-b border-gray-800 hover:bg-gray-800/30 transition-colors cursor-pointer ${
                            userProfile?.address?.toLowerCase() === user.address.toLowerCase()
                              ? "bg-purple-900/20"
                              : ""
                          }`}
                          onClick={() => handleRowClick(user.address)}
                        >
                          <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                            <div className="flex items-center">
                              <span className="text-lg sm:text-xl font-black font-montserrat">#{user.rank}</span>
                            </div>
                          </td>
                          {leaderboardType === "density" ? (
                            <>
                              <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                                <div className="flex items-center space-x-2 sm:space-x-3">
                                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0 flex items-center justify-center">
                                    {user.avatar ? (
                                      <Image
                                        src={user.avatar}
                                        alt={user.displayName}
                                        width={40}
                                        height={40}
                                        className="object-cover w-full h-full"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement
                                          target.style.display = 'none'
                                          const fallback = target.nextElementSibling as HTMLElement
                                          if (fallback) fallback.style.display = 'flex'
                                        }}
                                      />
                                    ) : null}
                                    <div 
                                      className={`w-full h-full flex items-center justify-center text-white font-bold text-sm sm:text-base ${user.avatar ? 'hidden' : 'flex'}`}
                                      style={{ backgroundColor: '#1f2937' }}
                                    >
                                      {user.avatarFallbackLetter || getAvatarFallbackLetter(user.ensName, user.address)}
                                    </div>
                                  </div>
                                  <div className="min-w-0">
                                    <div className="font-bold text-white text-sm sm:text-base truncate">{user.displayName}</div>
                                    <div className="text-xs text-gray-400 font-mono">
                                      {user.address.slice(0, 6)}...{user.address.slice(-4)}
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                                <div className="font-bold text-white text-sm sm:text-base">
                                  {user.username || user.displayName || "Unknown"}
                                </div>
                                <div className="text-xs text-gray-400 font-mono">
                                  {user.address.slice(0, 6)}...{user.address.slice(-4)}
                                </div>
                              </td>
                              <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
                                  <Image
                                    src={user.avatar || "/images/rock-logo.png"}
                                    alt={user.username || user.displayName || "User"}
                                    width={48}
                                    height={48}
                                    className="object-cover w-full h-full"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement
                                      target.src = "/images/rock-logo.png"
                                    }}
                                  />
                                </div>
                              </td>
                            </>
                          )}
                          {leaderboardType === "density" ? (
                            <>
                              <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                                <div className="flex flex-col">
                                  <div className="flex items-center space-x-1 sm:space-x-2">
                                    <Image
                                      src="/images/density-white.svg"
                                      alt="DENSITY"
                                      width={20}
                                      height={20}
                                      className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
                                    />
                                    <span className="font-bold text-sm sm:text-base">
                                      {Math.round(user.totalDensity).toLocaleString()}
                                    </span>
                                  </div>
                                  {user.unextractedDensity > 0 && (
                                    <div className="text-xs text-gray-500 mt-1 ml-5 sm:ml-7">
                                      {Math.round(user.unextractedDensity).toLocaleString()} unextracted
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                                <div className="flex space-x-1 sm:space-x-2 flex-wrap">
                                  {user.bestBadges.length > 0 ? (
                                    user.bestBadges.map((badge) => (
                                      <BadgeIconWithTooltip key={badge.id} badge={badge} />
                                    ))
                                  ) : (
                                    <span className="text-gray-500 text-xs sm:text-sm">—</span>
                                  )}
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                                <div className="font-bold text-white text-sm sm:text-base">
                                  {user.wins !== undefined ? user.wins.toLocaleString() : <span className="text-gray-400">—</span>}
                                </div>
                              </td>
                              <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                                <div className="font-bold text-white text-sm sm:text-base">
                                  {user.winrate !== undefined && user.winrate > 0 
                                    ? `${user.winrate.toFixed(1)}%` 
                                    : <span className="text-gray-400">—</span>}
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={leaderboardType === "density" ? 4 : 5} className="px-4 sm:px-6 py-6 sm:py-8 text-center text-gray-400 text-sm">
                          {searchQuery ? "No players found matching your search." : "No leaderboard data available."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3 p-4">
                {error ? (
                  <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6">
                    <h3 className="text-red-400 text-lg font-bold mb-2">Configuration Error</h3>
                    <p className="text-gray-300 text-sm mb-4">{error}</p>
                    {error.includes("NEXT_PUBLIC_AMPLIFY_API_URL") && (
                      <div className="text-left bg-gray-900/50 rounded p-4 mt-4">
                        <p className="text-xs text-gray-400 mb-2">To fix this, add the following to your <code className="text-purple-400">.env.local</code> file:</p>
                        <code className="text-green-400 text-xs block break-all">NEXT_PUBLIC_AMPLIFY_API_URL=your_api_url_here</code>
                        <p className="text-xs text-gray-500 mt-2">After adding the variable, restart your development server.</p>
                      </div>
                    )}
                  </div>
                ) : isLoading ? (
                  <div className="flex flex-col items-center justify-center gap-4 py-12">
                    <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                    <div className="w-full max-w-xs">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-gray-400 font-pt-mono text-xs">Loading leaderboard...</p>
                        <p className="text-purple-400 font-pt-mono text-xs font-bold">
                          {Math.round(loadingProgress)}%
                        </p>
                      </div>
                      <div className="w-full bg-gray-800 rounded-lg h-2 overflow-hidden">
                        <motion.div
                          className="bg-purple-500 h-full rounded-lg"
                          initial={{ width: 0 }}
                          animate={{ width: `${loadingProgress}%` }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  </div>
                ) : filteredUsers.length > 0 ? (
                  <>
                    {filteredUsers.map((user) => (
                      <div
                        key={user.address}
                        onClick={() => handleRowClick(user.address)}
                        className={`bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 cursor-pointer transition-colors ${
                          userProfile?.address?.toLowerCase() === user.address.toLowerCase()
                            ? "bg-purple-900/20 border-purple-500/50"
                            : "hover:bg-gray-800/70"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0 flex items-center justify-center">
                              {user.avatar ? (
                                <Image
                                  src={user.avatar}
                                  alt={user.displayName}
                                  width={48}
                                  height={48}
                                  className="object-cover w-full h-full"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement
                                    target.style.display = 'none'
                                    const fallback = target.nextElementSibling as HTMLElement
                                    if (fallback) fallback.style.display = 'flex'
                                  }}
                                />
                              ) : null}
                              <div 
                                className={`w-full h-full flex items-center justify-center text-white font-bold text-base ${user.avatar ? 'hidden' : 'flex'}`}
                                style={{ backgroundColor: '#1f2937' }}
                              >
                                {user.avatarFallbackLetter || getAvatarFallbackLetter(user.ensName, user.address)}
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-white text-base truncate">
                                {leaderboardType === "densityDeck" 
                                  ? (user.username || user.displayName || "Unknown")
                                  : user.displayName}
                              </div>
                              <div className="text-xs text-gray-400 font-mono">
                                {user.address.slice(0, 6)}...{user.address.slice(-4)}
                              </div>
                            </div>
                          </div>
                          <div className="text-lg font-black font-montserrat text-cyan-400 flex-shrink-0 ml-2">
                            #{user.rank}
                          </div>
                        </div>
                        
                        {leaderboardType === "density" ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-400 font-pt-mono">TOTAL DENSITY</span>
                              <div className="flex items-center space-x-2">
                                <Image
                                  src="/images/density-white.svg"
                                  alt="DENSITY"
                                  width={16}
                                  height={16}
                                  className="w-4 h-4"
                                />
                                <span className="font-bold text-white">
                                  {Math.round(user.totalDensity).toLocaleString()}
                                </span>
                              </div>
                            </div>
                            {user.unextractedDensity > 0 && (
                              <div className="text-xs text-gray-500 text-right">
                                {Math.round(user.unextractedDensity).toLocaleString()} unextracted
                              </div>
                            )}
                            <div className="flex items-center justify-between pt-2 border-t border-gray-700/50">
                              <span className="text-xs text-gray-400 font-pt-mono">BADGES</span>
                              <div className="flex space-x-2">
                                {user.bestBadges.length > 0 ? (
                                  user.bestBadges.map((badge) => (
                                    <BadgeIconWithTooltip key={badge.id} badge={badge} />
                                  ))
                                ) : (
                                  <span className="text-gray-500 text-xs">—</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-400 font-pt-mono">WINS</span>
                              <span className="font-bold text-white">
                                {user.wins !== undefined ? user.wins.toLocaleString() : <span className="text-gray-400">—</span>}
                              </span>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-gray-700/50">
                              <span className="text-xs text-gray-400 font-pt-mono">WIN RATE</span>
                              <span className="font-bold text-white">
                                {user.winrate !== undefined && user.winrate > 0 
                                  ? `${user.winrate.toFixed(1)}%` 
                                  : <span className="text-gray-400">—</span>}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    {searchQuery ? "No players found matching your search." : "No leaderboard data available."}
                  </div>
                )}
              </div>
                
              {/* Load More Button - Only show after initial load is complete */}
              {!isLoading && hasMore && !searchQuery && (
                <div className="py-6 md:py-8 text-center border-t border-gray-800">
                  <button
                    onClick={loadMoreUsers}
                    disabled={isLoadingMore}
                    className="px-6 sm:px-8 py-2 sm:py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 text-white text-sm sm:text-base font-medium font-pt-mono rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                        <span>Loading more...</span>
                      </>
                    ) : (
                      <span>Load More</span>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* How to Rank Up */}
            <motion.div
              className="mt-16 bg-gray-900/50 backdrop-blur-sm rounded-xl p-8 border border-gray-800"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl md:text-3xl font-black font-montserrat text-white mb-6">HOW TO RANK UP</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 text-2xl">
                    🎮
                  </div>
                  <h3 className="text-xl font-bold font-montserrat text-white">Play Games</h3>
                  <p className="text-gray-400 font-pt-mono">
                    Participate in Density Deck games to earn points and increase your rank. More games = more
                    experience.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 text-2xl">
                    🏆
                  </div>
                  <h3 className="text-xl font-bold font-montserrat text-white">Win Consistently</h3>
                  <p className="text-gray-400 font-pt-mono">
                    Maintain a high win rate to climb the leaderboard faster. Strategy and skill are key.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 text-2xl">
                    💎
                  </div>
                  <h3 className="text-xl font-bold font-montserrat text-white">Collect NFTs</h3>
                  <p className="text-gray-400 font-pt-mono">
                    Expand your Old Rock and Goliath collections to unlock special badges and boost your profile.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  )
}
