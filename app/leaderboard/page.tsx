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

interface LeaderboardUser {
  id: string
  name: string
  avatar: string
  address: string
  totalDensity: string
  gamesPlayed: number
  winRate: number
  rank: string
  badges: Badge[]
  selectedBadges: Badge[]
}

interface Badge {
  id: number
  name: string
  description: string
  icon: string
}

export default function LeaderboardPage() {
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [leaderboardUsers, setLeaderboardUsers] = useState<LeaderboardUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"rank" | "totalDensity" | "winRate" | "gamesPlayed">("rank")
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

  // Fetch leaderboard data
  useEffect(() => {
    const fetchLeaderboardData = async () => {
      setIsLoading(true)
      try {
        // In a real app, this would be an API call to your backend
        // For now, we'll use mock data
        const mockUsers: LeaderboardUser[] = [
          {
            id: "1",
            name: "CryptoKing.eth",
            avatar: "/placeholder.svg?height=100&width=100",
            address: "0x1234...5678",
            totalDensity: "143,023.32",
            gamesPlayed: 327,
            winRate: 78.5,
            rank: "#1",
            badges: [
              { id: 1, name: "First Win", description: "Win your first game", icon: "🏆" },
              { id: 2, name: "Streak Master", description: "Win 5 games in a row", icon: "🔥" },
              { id: 3, name: "Collector", description: "Own 10+ NFTs", icon: "💎" },
            ],
            selectedBadges: [
              { id: 1, name: "First Win", description: "Win your first game", icon: "🏆" },
              { id: 2, name: "Streak Master", description: "Win 5 games in a row", icon: "🔥" },
              { id: 3, name: "Collector", description: "Own 10+ NFTs", icon: "💎" },
            ],
          },
          {
            id: "2",
            name: "DensityWhale",
            avatar: "/placeholder.svg?height=100&width=100",
            address: "0xabcd...efgh",
            totalDensity: "98,456.12",
            gamesPlayed: 245,
            winRate: 72.3,
            rank: "#2",
            badges: [
              { id: 2, name: "Streak Master", description: "Win 5 games in a row", icon: "🔥" },
              { id: 4, name: "High Roller", description: "Win a 100+ USDC game", icon: "💰" },
              { id: 7, name: "Mystic Owner", description: "Own a Mystic Goliath", icon: "✨" },
            ],
            selectedBadges: [
              { id: 2, name: "Streak Master", description: "Win 5 games in a row", icon: "🔥" },
              { id: 7, name: "Mystic Owner", description: "Own a Mystic Goliath", icon: "✨" },
            ],
          },
          {
            id: "3",
            name: "GoliathMaster",
            avatar: "/placeholder.svg?height=100&width=100",
            address: "0x9876...5432",
            totalDensity: "87,321.45",
            gamesPlayed: 198,
            winRate: 68.9,
            rank: "#3",
            badges: [
              { id: 3, name: "Collector", description: "Own 10+ NFTs", icon: "💎" },
              { id: 5, name: "Veteran", description: "Play 100+ games", icon: "⚔️" },
              { id: 8, name: "Rainbow Collection", description: "Own all Old Rock colors", icon: "🌈" },
            ],
            selectedBadges: [{ id: 8, name: "Rainbow Collection", description: "Own all Old Rock colors", icon: "🌈" }],
          },
          {
            id: "4",
            name: "RockLegend",
            avatar: "/placeholder.svg?height=100&width=100",
            address: "0xfedc...ba98",
            totalDensity: "76,543.21",
            gamesPlayed: 176,
            winRate: 65.2,
            rank: "#4",
            badges: [
              { id: 1, name: "First Win", description: "Win your first game", icon: "🏆" },
              { id: 4, name: "High Roller", description: "Win a 100+ USDC game", icon: "💰" },
              { id: 6, name: "Legendary", description: "Reach top 100 ranking", icon: "👑" },
            ],
            selectedBadges: [
              { id: 4, name: "High Roller", description: "Win a 100+ USDC game", icon: "💰" },
              { id: 6, name: "Legendary", description: "Reach top 100 ranking", icon: "👑" },
            ],
          },
          {
            id: "5",
            name: "OldRockFan",
            avatar: "/placeholder.svg?height=100&width=100",
            address: "0x7531...9024",
            totalDensity: "65,432.10",
            gamesPlayed: 154,
            winRate: 61.8,
            rank: "#5",
            badges: [
              { id: 2, name: "Streak Master", description: "Win 5 games in a row", icon: "🔥" },
              { id: 3, name: "Collector", description: "Own 10+ NFTs", icon: "💎" },
              { id: 5, name: "Veteran", description: "Play 100+ games", icon: "⚔️" },
            ],
            selectedBadges: [
              { id: 3, name: "Collector", description: "Own 10+ NFTs", icon: "💎" },
              { id: 5, name: "Veteran", description: "Play 100+ games", icon: "⚔️" },
            ],
          },
          {
            id: "6",
            name: "DensityDeckPro",
            avatar: "/placeholder.svg?height=100&width=100",
            address: "0x2468...1357",
            totalDensity: "54,321.98",
            gamesPlayed: 132,
            winRate: 58.4,
            rank: "#6",
            badges: [
              { id: 1, name: "First Win", description: "Win your first game", icon: "🏆" },
              { id: 3, name: "Collector", description: "Own 10+ NFTs", icon: "💎" },
              { id: 7, name: "Mystic Owner", description: "Own a Mystic Goliath", icon: "✨" },
            ],
            selectedBadges: [{ id: 7, name: "Mystic Owner", description: "Own a Mystic Goliath", icon: "✨" }],
          },
          {
            id: "7",
            name: "StoneboundHero",
            avatar: "/placeholder.svg?height=100&width=100",
            address: "0x1357...2468",
            totalDensity: "43,210.87",
            gamesPlayed: 110,
            winRate: 55.1,
            rank: "#7",
            badges: [
              { id: 2, name: "Streak Master", description: "Win 5 games in a row", icon: "🔥" },
              { id: 4, name: "High Roller", description: "Win a 100+ USDC game", icon: "💰" },
              { id: 5, name: "Veteran", description: "Play 100+ games", icon: "⚔️" },
            ],
            selectedBadges: [
              { id: 2, name: "Streak Master", description: "Win 5 games in a row", icon: "🔥" },
              { id: 4, name: "High Roller", description: "Win a 100+ USDC game", icon: "💰" },
            ],
          },
          {
            id: "8",
            name: "AmplifyKing",
            avatar: "/placeholder.svg?height=100&width=100",
            address: "0x8642...9753",
            totalDensity: "32,109.76",
            gamesPlayed: 88,
            winRate: 51.7,
            rank: "#8",
            badges: [
              { id: 1, name: "First Win", description: "Win your first game", icon: "🏆" },
              { id: 3, name: "Collector", description: "Own 10+ NFTs", icon: "💎" },
              { id: 8, name: "Rainbow Collection", description: "Own all Old Rock colors", icon: "🌈" },
            ],
            selectedBadges: [
              { id: 1, name: "First Win", description: "Win your first game", icon: "🏆" },
              { id: 8, name: "Rainbow Collection", description: "Own all Old Rock colors", icon: "🌈" },
            ],
          },
          {
            id: "9",
            name: "BountyHunter",
            avatar: "/placeholder.svg?height=100&width=100",
            address: "0x9753...8642",
            totalDensity: "21,098.65",
            gamesPlayed: 66,
            winRate: 48.3,
            rank: "#9",
            badges: [
              { id: 1, name: "First Win", description: "Win your first game", icon: "🏆" },
              { id: 2, name: "Streak Master", description: "Win 5 games in a row", icon: "🔥" },
              { id: 6, name: "Legendary", description: "Reach top 100 ranking", icon: "👑" },
            ],
            selectedBadges: [{ id: 6, name: "Legendary", description: "Reach top 100 ranking", icon: "👑" }],
          },
          {
            id: "10",
            name: "NFTCollector",
            avatar: "/placeholder.svg?height=100&width=100",
            address: "0x3579...8642",
            totalDensity: "10,987.54",
            gamesPlayed: 44,
            winRate: 45.0,
            rank: "#10",
            badges: [
              { id: 1, name: "First Win", description: "Win your first game", icon: "🏆" },
              { id: 3, name: "Collector", description: "Own 10+ NFTs", icon: "💎" },
              { id: 7, name: "Mystic Owner", description: "Own a Mystic Goliath", icon: "✨" },
            ],
            selectedBadges: [{ id: 3, name: "Collector", description: "Own 10+ NFTs", icon: "💎" }],
          },
        ]

        setLeaderboardUsers(mockUsers)
      } catch (error) {
        console.error("Error fetching leaderboard data:", error)
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
      return (
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.address.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })
    .sort((a, b) => {
      let comparison = 0

      if (sortBy === "rank") {
        // Extract numeric part from rank string (e.g., "#1" -> 1)
        const rankA = Number.parseInt(a.rank.replace(/\D/g, ""))
        const rankB = Number.parseInt(b.rank.replace(/\D/g, ""))
        comparison = rankA - rankB
      } else if (sortBy === "totalDensity") {
        // Remove commas and convert to number
        const densityA = Number.parseFloat(a.totalDensity.replace(/,/g, ""))
        const densityB = Number.parseFloat(b.totalDensity.replace(/,/g, ""))
        comparison = densityA - densityB
      } else if (sortBy === "winRate") {
        comparison = a.winRate - b.winRate
      } else if (sortBy === "gamesPlayed") {
        comparison = a.gamesPlayed - b.gamesPlayed
      }

      return sortDirection === "asc" ? comparison : -comparison
    })

  const handleSort = (column: "rank" | "totalDensity" | "winRate" | "gamesPlayed") => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      // For rank, default to ascending (1, 2, 3...), for others default to descending
      setSortDirection(column === "rank" ? "asc" : "desc")
    }
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
                      <th className="px-6 py-4 text-left text-sm font-pt-mono text-gray-400">RANK</th>
                      <th className="px-6 py-4 text-left text-sm font-pt-mono text-gray-400">PLAYER</th>
                      <th
                        className="px-6 py-4 text-left text-sm font-pt-mono text-gray-400 cursor-pointer hover:text-white"
                        onClick={() => handleSort("totalDensity")}
                      >
                        TOTAL DENSITY {sortBy === "totalDensity" && (sortDirection === "asc" ? "↑" : "↓")}
                      </th>
                      <th
                        className="px-6 py-4 text-left text-sm font-pt-mono text-gray-400 cursor-pointer hover:text-white"
                        onClick={() => handleSort("gamesPlayed")}
                      >
                        GAMES PLAYED {sortBy === "gamesPlayed" && (sortDirection === "asc" ? "↑" : "↓")}
                      </th>
                      <th
                        className="px-6 py-4 text-left text-sm font-pt-mono text-gray-400 cursor-pointer hover:text-white"
                        onClick={() => handleSort("winRate")}
                      >
                        WIN RATE {sortBy === "winRate" && (sortDirection === "asc" ? "↑" : "↓")}
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-pt-mono text-gray-400">BADGES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <tr key={index} className="border-b border-gray-800">
                          <td colSpan={6} className="px-6 py-4">
                            <div className="h-12 bg-gray-800/50 animate-pulse rounded-md"></div>
                          </td>
                        </tr>
                      ))
                    ) : filteredUsers.length > 0 ? (
                      filteredUsers.map((user, index) => (
                        <tr
                          key={user.id}
                          className={`border-b border-gray-800 hover:bg-gray-800/30 transition-colors ${
                            userProfile?.address === user.address ? "bg-purple-900/20" : ""
                          }`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <span className="text-xl font-black font-montserrat">{user.rank}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-800">
                                <Image
                                  src={user.avatar || "/placeholder.svg"}
                                  alt={user.name}
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
                                <div className="font-bold text-white">{user.name}</div>
                                <div className="text-xs text-gray-400">{user.address}</div>
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
                                className="w-5 h-5 text-purple-400"
                              />
                              <span className="font-bold">{user.totalDensity}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-bold">{user.gamesPlayed}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-bold">{user.winRate}%</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              {user.selectedBadges.map((badge) => (
                                <div
                                  key={badge.id}
                                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 text-lg"
                                  title={`${badge.name}: ${badge.description}`}
                                >
                                  {badge.icon}
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                          No players found matching your search.
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
