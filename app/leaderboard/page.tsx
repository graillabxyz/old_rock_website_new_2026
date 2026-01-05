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
import BadgeIconWithTooltip from "./badge-icon-with-tooltip"

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
  avatarFallbackLetter?: string
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
  const [currentUserRank, setCurrentUserRank] = useState<LeaderboardUser | null>(null)

  // Check wallet connection status
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" })
          if (accounts.length > 0) {
            setIsWalletConnected(true)
            const address = accounts[0]

            // Parallel fetch for profile data
            const [avatarUrl, ensName, rankResponse] = await Promise.all([
              fetchDensityDeckAvatar(address, null).catch(() => null),
              fetchENSName(address),
              // Determine which API to call based on leaderboard type
              leaderboardType === "densityDeck"
                ? Promise.resolve(null) // Density Deck API doesn't support filter yet, skipping for now
                : fetch(`/api/leaderboard?filter=${address}`).then(r => r.ok ? r.json() : null).catch(() => null)
            ])

            setUserProfile({
              name: ensName || "OldRock User",
              avatar: avatarUrl,
              address: address,
            })

            // Process user rank data if found
            if (rankResponse && rankResponse.success && rankResponse.data && rankResponse.data.length > 0) {
              const userData = rankResponse.data[0]

              // Enrich data similar to main list (simplified)
              const oldRockNFTs = userData.oldRockNFTs || []
              const goliathNFTs = userData.goliathNFTs || []

              const badgeData = {
                totalDensity: userData.totalDensity || 0,
                oldRockNFTs,
                goliathNFTs,
              }
              const badges = calculateAllBadges(badgeData)
              const bestBadges = getBestBadges(badges)
              const avatarFallbackLetter = getAvatarFallbackLetter(ensName, address)

              setCurrentUserRank({
                ...userData,
                rank: userData.rank || 0, // Rank might need to be calculated by backend or inferred
                badges,
                bestBadges,
                avatar: avatarUrl || null,
                displayName: ensName || `${address.slice(0, 6)}...${address.slice(-4)}`,
                ensName,
                totalDensity: userData.totalDensity || 0,
                unextractedDensity: userData.unextractedDensity || 0,
                hasOldRock: oldRockNFTs.length > 0,
                hasGoliath: goliathNFTs.length > 0,
              } as LeaderboardUser)
            }
          }
        } catch (error) {
          console.error("Error checking wallet connection:", error)
        }
      }
    }

    checkWalletConnection()
  }, [leaderboardType]) // Re-run when leaderboard type changes to fetch appropriate rank




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

          // Avatar fetch disabled for performance
          const avatar = null
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

          // Avatar fetch disabled for performance
          const avatar = null
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
                  className={`px-4 py-2 rounded-md font-pt-mono text-xs sm:text-sm font-bold transition-all duration-200 ${leaderboardType === "density"
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
                  className={`px-4 py-2 rounded-md font-pt-mono text-xs sm:text-sm font-bold transition-all duration-200 ${leaderboardType === "densityDeck"
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
                    {currentUserRank && leaderboardType === "density" && !searchQuery && (
                      <tr
                        className="bg-purple-900/30 border-b-4 border-purple-500/30 cursor-pointer relative"
                        onClick={() => handleRowClick(currentUserRank.address)}
                      >
                        <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                          <div className="flex items-center">
                            <span className="text-lg sm:text-xl font-black font-montserrat text-purple-400">#{currentUserRank.rank}</span>
                            <span className="ml-2 text-xs font-bold bg-purple-500 text-white px-2 py-0.5 rounded-full">YOU</span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                          <div className="flex items-center space-x-2 sm:space-x-3">

                            <div className="min-w-0">
                              <div className="font-bold text-white text-sm sm:text-base truncate">{currentUserRank.displayName}</div>
                            </div>
                          </div>
                        </td>
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
                                {Math.round(currentUserRank.totalDensity).toLocaleString()}
                              </span>
                            </div>
                            {currentUserRank.unextractedDensity > 0 && (
                              <div className="text-xs text-gray-500 mt-1 ml-5 sm:ml-7">
                                {Math.round(currentUserRank.unextractedDensity).toLocaleString()} unextracted
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                          <div className="flex space-x-1 sm:space-x-2 flex-wrap">
                            {currentUserRank.bestBadges.length > 0 ? (
                              currentUserRank.bestBadges.map((badge) => (
                                <BadgeIconWithTooltip key={badge.id} badge={badge} />
                              ))
                            ) : (
                              <span className="text-gray-500 text-xs sm:text-sm">—</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}

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
                          className={`border-b border-gray-800 hover:bg-gray-800/30 transition-colors cursor-pointer ${userProfile?.address?.toLowerCase() === user.address.toLowerCase()
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
                                  {user.avatar && (
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0 flex items-center justify-center">
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
                                      <div
                                        className="w-full h-full flex items-center justify-center text-white font-bold text-sm sm:text-base hidden"
                                        style={{ backgroundColor: '#1f2937' }}
                                      >
                                        {user.avatarFallbackLetter || getAvatarFallbackLetter(user.ensName, user.address)}
                                      </div>
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <div className="font-bold text-white text-sm sm:text-base truncate">{user.displayName}</div>
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
                {currentUserRank && leaderboardType === "density" && !searchQuery && (
                  <div
                    onClick={() => handleRowClick(currentUserRank.address)}
                    className="bg-purple-900/30 rounded-lg p-4 border-l-4 border-l-purple-500 border-y border-r border-gray-700/50 cursor-pointer relative mb-4"
                  >
                    <div className="absolute top-2 right-2 text-xs font-bold bg-purple-500 text-white px-2 py-0.5 rounded-full">YOU</div>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">

                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-white text-base truncate">
                            {currentUserRank.displayName}
                          </div>
                        </div>
                      </div>
                      <div className="text-lg font-black font-montserrat text-purple-400 flex-shrink-0 ml-2 mt-4">
                        #{currentUserRank.rank}
                      </div>
                    </div>

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
                            {Math.round(currentUserRank.totalDensity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      {currentUserRank.unextractedDensity > 0 && (
                        <div className="text-xs text-gray-500 text-right">
                          {Math.round(currentUserRank.unextractedDensity).toLocaleString()} unextracted
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-700/50">
                        <span className="text-xs text-gray-400 font-pt-mono">BADGES</span>
                        <div className="flex space-x-2">
                          {currentUserRank.bestBadges.length > 0 ? (
                            currentUserRank.bestBadges.map((badge) => (
                              <BadgeIconWithTooltip key={badge.id} badge={badge} />
                            ))
                          ) : (
                            <span className="text-gray-500 text-xs">—</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
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
                        className={`bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 cursor-pointer transition-colors ${userProfile?.address?.toLowerCase() === user.address.toLowerCase()
                          ? "bg-purple-900/20 border-purple-500/50"
                          : "hover:bg-gray-800/70"
                          }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            {(user.avatar || leaderboardType !== 'density') && (
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
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-white text-base truncate">
                                {leaderboardType === "densityDeck"
                                  ? (user.username || user.displayName || "Unknown")
                                  : user.displayName}
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
