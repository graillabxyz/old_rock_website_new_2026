"use client"

import { Header } from "@/components/header"
import { CyberpunkBackground } from "@/components/cyberpunk-background"
import { Sidebar } from "@/components/sidebar"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { Footer } from "@/components/footer"
import Image from "next/image"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { calculateAllBadges, getBestBadges, Badge as BadgeType } from "@/lib/badge-utils"
import { Award } from "lucide-react"

interface LeaderboardUser {
  address: string
  ensName: string | null
  displayName: string
  totalDensity: number
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
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"rank" | "totalDensity">("rank")
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

  // Fetch leaderboard data
  useEffect(() => {
    const fetchLeaderboardData = async () => {
      setIsLoading(true)
      try {
        const response = await fetch("/api/leaderboard")
        if (!response.ok) {
          throw new Error("Failed to fetch leaderboard data")
        }

        const result = await response.json()
        if (!result.success || !result.data) {
          throw new Error("Invalid leaderboard data")
        }

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
              }
            } catch (error) {
              console.error(`Error processing user ${user.address}:`, error)
              return {
                ...user,
                rank: index + 1,
                badges: [],
                bestBadges: [],
                avatar: await fetchENSAvatar(user.address),
              }
            }
          })
        )

        setLeaderboardUsers(usersWithBadges)
      } catch (error) {
        console.error("Error fetching leaderboard data:", error)
        setLeaderboardUsers([])
      } finally {
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
      }

      return sortDirection === "asc" ? comparison : -comparison
    })

  const handleSort = (column: "rank" | "totalDensity") => {
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
            <div className="mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by name or address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 w-full md:w-96"
                />
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
                        DENSITY DECK <span className="text-xs text-gray-500">(Coming Soon)</span>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-pt-mono text-gray-400">BADGES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <tr key={index} className="border-b border-gray-800">
                          <td colSpan={5} className="px-6 py-4">
                            <div className="h-12 bg-gray-800/50 animate-pulse rounded-md"></div>
                          </td>
                        </tr>
                      ))
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
                            <div className="flex items-center space-x-2">
                              <Image
                                src="/images/density-white.svg"
                                alt="DENSITY"
                                width={20}
                                height={20}
                                className="w-5 h-5"
                              />
                              <span className="font-bold">
                                {user.totalDensity.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </span>
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
                                  <div
                                    key={badge.id}
                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 border border-gray-700"
                                    title={`${badge.name}: ${badge.description}`}
                                  >
                                    <Award
                                      className={`w-5 h-5 ${
                                        badge.unlocked ? "text-white opacity-100" : "text-gray-600 opacity-30"
                                      }`}
                                    />
                                  </div>
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
