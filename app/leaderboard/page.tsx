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
}

export default function LeaderboardPage() {
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [leaderboardUsers, setLeaderboardUsers] = useState<LeaderboardUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"rank" | "totalDensity" | "densityDeck">("rank")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  // Check wallet connection status
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" })
          if (accounts.length > 0) {
            setIsWalletConnected(true)
            const avatarUrl = await fetchENSAvatar(accounts[0])
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

  // Fetch leaderboard data with progress tracking
  useEffect(() => {
    const fetchLeaderboardData = async () => {
      setIsLoading(true)
      setLoadingProgress(0)

      // Simulate progress while loading (slower for longer loads)
      const progressInterval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 95) return prev // Don't go to 100 until data is loaded
          return prev + Math.random() * 3 // Slower increment for longer loads
        })
      }, 500) // Slower update interval

      // Poll progress endpoint
      const progressPollInterval = setInterval(async () => {
        try {
          const progressResponse = await fetch("/api/leaderboard/progress")
          if (progressResponse.ok) {
            const progressData = await progressResponse.json()
            if (progressData.progress !== undefined) {
              setLoadingProgress(progressData.progress)
            }
          }
        } catch (error) {
          // Ignore progress polling errors
        }
      }, 500)

      try {
        const response = await fetch("/api/leaderboard")
        if (!response.ok) {
          throw new Error("Failed to fetch leaderboard data")
        }

        const result = await response.json()
        if (!result.success || !result.data) {
          throw new Error("Invalid leaderboard data")
        }

        setLoadingProgress(100)

        // Fetch NFTs and calculate badges for each user
        const usersWithBadges = await Promise.all(
          result.data.map(async (user: any, index: number) => {
            try {
              // Fetch user NFTs
              const nftResponse = await fetch(
                `${process.env.NEXT_PUBLIC_AMPLIFY_API_URL}/nfts/${user.address}`
              )
              if (!nftResponse.ok) {
                return {
                  ...user,
                  rank: index + 1,
                  badges: [],
                  bestBadges: [],
                  avatar: await fetchENSAvatar(user.address),
                  unextractedDensity: user.unextractedDensity || 0,
                }
              }

              const nftData = await nftResponse.json()
              const oldRockNFTs = nftData?.data?.OldRocks || []
              const goliathNFTs = nftData?.data?.Goliath || []

              // Calculate badges
              const badges = calculateAllBadges({
                totalDensity: user.totalDensity,
                oldRockNFTs,
                goliathNFTs,
              })

              const bestBadges = getBestBadges(badges).slice(0, 4)

              // Fetch avatar
              const avatar = await fetchENSAvatar(user.address)

              return {
                ...user,
                rank: index + 1,
                badges,
                bestBadges,
                avatar,
                unextractedDensity: user.unextractedDensity || 0,
              }
            } catch (error) {
              console.error(`Error processing user ${user.address}:`, error)
              return {
                ...user,
                rank: index + 1,
                badges: [],
                bestBadges: [],
                avatar: await fetchENSAvatar(user.address),
                unextractedDensity: user.unextractedDensity || 0,
              }
            }
          })
        )

        setLeaderboardUsers(usersWithBadges)
      } catch (error) {
        console.error("Error fetching leaderboard data:", error)
        setLeaderboardUsers([])
      } finally {
        clearInterval(progressInterval)
        clearInterval(progressPollInterval)
        setLoadingProgress(100)
        setIsLoading(false)
      }
    }

    fetchLeaderboardData()
  }, [])

  const fetchENSAvatar = async (address: string) => {
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
      return `https://effigy.im/a/${address}.png`
    } catch (error) {
      console.error("Error fetching ENS avatar:", error)
      return "/images/rock-logo.png"
    }
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
        // For now, Density Deck sorting is placeholder (coming soon)
        // Could sort by games played, win rate, etc. when data is available
        comparison = 0 // Keep original order for now
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
          className="relative w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 border border-gray-700 cursor-help overflow-hidden"
          onMouseEnter={() => {
            setShowCustomTooltip(true)
            updateTooltipPosition()
          }}
          onMouseLeave={() => setShowCustomTooltip(false)}
          title={!showCustomTooltip ? `${badge.name}${badge.description ? ` - ${badge.description}` : ""}` : undefined}
        >
          {/* Animation backgrounds for special badges */}
          {/* Pure badge - Uses actual rock color with hexagon shape */}
          {isPureBadge && (
            <motion.div
              className="absolute inset-0"
              style={{
                clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                background: `radial-gradient(circle, ${getRockColorRgba(pureColor, 0.4)} 0%, transparent 70%)`,
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.4, 0.7, 0.4],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}
          
          {/* Polar badge - Uses actual rock color with elliptical shape */}
          {isPolarBadge && (
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(ellipse at center, ${getRockColorRgba(polarColor, 0.4)} 0%, transparent 70%)`,
              }}
              animate={{
                scaleX: [1, 1.3, 1],
                scaleY: [1, 1.1, 1],
                opacity: [0.4, 0.7, 0.4],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}
          
          {/* Recurrent badge - Uses actual rock color with sparkle effect */}
          {isRecurrentBadge && (
            <motion.div
              className="absolute inset-0 rounded-full overflow-hidden"
              style={{
                background: `radial-gradient(circle, ${getRockColorRgba(recurrentColor, 0.3)} 0%, transparent 70%)`,
              }}
            >
              {/* Sparkle effect with actual rock color */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 rounded-full"
                  style={{
                    backgroundColor: getRockColorRgba(recurrentColor, 0.8),
                    left: `${20 + (i * 15)}%`,
                    top: `${20 + (i % 3) * 30}%`,
                  }}
                  animate={{
                    scale: [0, 1.5, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.25,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </motion.div>
          )}
          
          {isSingularityBadge && (
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: "conic-gradient(from 0deg, rgba(139, 92, 246, 0.3), rgba(168, 85, 247, 0.5), rgba(139, 92, 246, 0.3))",
              }}
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          )}
          
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
              <h1 className="text-4xl md:text-5xl font-black font-montserrat text-white mb-4">LEADERBOARD</h1>
              <p className="text-gray-400 font-pt-mono text-lg">Top players ranked by performance • Updated daily</p>
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
              
              {/* Sort Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleSort("totalDensity")}
                  className={`px-4 py-2 rounded-lg font-pt-mono text-sm font-bold transition-colors ${
                    sortBy === "totalDensity"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50"
                  }`}
                >
                  Sort by $DENSITY {sortBy === "totalDensity" && (sortDirection === "asc" ? "↑" : "↓")}
                </button>
                <button
                  onClick={() => handleSort("densityDeck")}
                  className={`px-4 py-2 rounded-lg font-pt-mono text-sm font-bold transition-colors ${
                    sortBy === "densityDeck"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50"
                  }`}
                >
                  Sort by DENSITY DECK {sortBy === "densityDeck" && (sortDirection === "asc" ? "↑" : "↓")}
                </button>
              </div>
            </div>

            {/* Leaderboard Table */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-800">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th
                        className="px-6 py-4 text-left text-sm font-pt-mono text-gray-400 cursor-pointer hover:text-white"
                        onClick={() => handleSort("rank")}
                      >
                        RANK {sortBy === "rank" && (sortDirection === "asc" ? "↑" : "↓")}
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-pt-mono text-gray-400">PLAYER</th>
                      <th
                        className="px-6 py-4 text-left text-sm font-pt-mono text-gray-400 cursor-pointer hover:text-white"
                        onClick={() => handleSort("totalDensity")}
                      >
                        TOTAL DENSITY {sortBy === "totalDensity" && (sortDirection === "asc" ? "↑" : "↓")}
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-pt-mono text-gray-400">
                        <div>DENSITY DECK</div>
                        <div className="text-xs text-gray-500 font-normal mt-1">Coming Soon</div>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-pt-mono text-gray-400">BADGES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12">
                          <div className="flex flex-col items-center justify-center gap-4">
                            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                            <div className="w-full max-w-xs">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-gray-400 font-pt-mono text-sm">Loading leaderboard...</p>
                                <p className="text-purple-400 font-pt-mono text-sm font-bold">
                                  {Math.round(loadingProgress)}%
                                </p>
                              </div>
                              <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                                <motion.div
                                  className="bg-purple-500 h-full rounded-full"
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
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <span className="text-xl font-black font-montserrat">#{user.rank}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-800">
                                <Image
                                  src={user.avatar || "/images/rock-logo.png"}
                                  alt={user.displayName}
                                  width={40}
                                  height={40}
                                  className="object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement
                                    target.src = "/images/rock-logo.png"
                                  }}
                                />
                              </div>
                              <div>
                                <div className="font-bold text-white">{user.displayName}</div>
                                <div className="text-xs text-gray-400 font-mono">
                                  {user.address.slice(0, 6)}...{user.address.slice(-4)}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <div className="flex items-center space-x-2">
                                <Image
                                  src="/images/density-white.svg"
                                  alt="DENSITY"
                                  width={20}
                                  height={20}
                                  className="w-5 h-5"
                                />
                              <span className="font-bold">
                                {Math.round(user.totalDensity).toLocaleString()}
                              </span>
                              </div>
                              {user.unextractedDensity > 0 && (
                                <div className="text-xs text-gray-500 mt-1 ml-7">
                                  {Math.round(user.unextractedDensity).toLocaleString()} unextracted
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-gray-500 text-sm">
                              <div>Wins: <span className="text-gray-400">—</span></div>
                              <div>Win Rate: <span className="text-gray-400">—</span></div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              {user.bestBadges.length > 0 ? (
                                user.bestBadges.map((badge) => (
                                  <BadgeIconWithTooltip key={badge.id} badge={badge} />
                                ))
                              ) : (
                                <span className="text-gray-500 text-sm">—</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                          {searchQuery ? "No players found matching your search." : "No leaderboard data available."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
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
                  <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-2xl">
                    🎮
                  </div>
                  <h3 className="text-xl font-bold font-montserrat text-white">Play Games</h3>
                  <p className="text-gray-400 font-pt-mono">
                    Participate in Density Deck games to earn points and increase your rank. More games = more
                    experience.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-2xl">
                    🏆
                  </div>
                  <h3 className="text-xl font-bold font-montserrat text-white">Win Consistently</h3>
                  <p className="text-gray-400 font-pt-mono">
                    Maintain a high win rate to climb the leaderboard faster. Strategy and skill are key.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-2xl">
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
