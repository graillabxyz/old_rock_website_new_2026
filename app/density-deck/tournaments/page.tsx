"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

interface Tournament {
  id: string
  name: string
  class: "Novice" | "Intermediate" | "Pro"
  price: number
  startTime: Date
  maxPlayers: number
  currentPlayers: number
  prizePool: number
}

interface LeaderboardEntry {
  rank: number
  player: string
  wins: number
  tournaments: number
  winRate: number
  earnings: number
}

const mockTournaments: Tournament[] = [
  {
    id: "1",
    name: "Weekly Novice Championship",
    class: "Novice",
    price: 10,
    startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    maxPlayers: 32,
    currentPlayers: 18,
    prizePool: 250,
  },
  {
    id: "2",
    name: "Intermediate Showdown",
    class: "Intermediate",
    price: 25,
    startTime: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
    maxPlayers: 16,
    currentPlayers: 12,
    prizePool: 350,
  },
  {
    id: "3",
    name: "Pro League Finals",
    class: "Pro",
    price: 50,
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    maxPlayers: 8,
    currentPlayers: 6,
    prizePool: 500,
  },
  {
    id: "4",
    name: "Daily Novice Rush",
    class: "Novice",
    price: 10,
    startTime: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours from now
    maxPlayers: 64,
    currentPlayers: 23,
    prizePool: 400,
  },
]

const mockPreviousLeaderboard: LeaderboardEntry[] = [
  { rank: 1, player: "DensityMaster", wins: 15, tournaments: 18, winRate: 83.3, earnings: 1250 },
  { rank: 2, player: "CardShark", wins: 12, tournaments: 16, winRate: 75.0, earnings: 980 },
  { rank: 3, player: "StrategyKing", wins: 10, tournaments: 14, winRate: 71.4, earnings: 750 },
  { rank: 4, player: "DeckBuilder", wins: 8, tournaments: 12, winRate: 66.7, earnings: 620 },
  { rank: 5, player: "ProPlayer", wins: 7, tournaments: 11, winRate: 63.6, earnings: 540 },
]

const mockAllTimeLeaderboard: LeaderboardEntry[] = [
  { rank: 1, player: "LegendaryPlayer", wins: 45, tournaments: 52, winRate: 86.5, earnings: 4250 },
  { rank: 2, player: "DensityMaster", wins: 38, tournaments: 48, winRate: 79.2, earnings: 3680 },
  { rank: 3, player: "CardShark", wins: 32, tournaments: 42, winRate: 76.2, earnings: 2940 },
  { rank: 4, player: "StrategyKing", wins: 28, tournaments: 38, winRate: 73.7, earnings: 2580 },
  { rank: 5, player: "ProPlayer", wins: 25, tournaments: 35, winRate: 71.4, earnings: 2250 },
]

export default function DensityDeckTournaments() {
  const [selectedTournament, setSelectedTournament] = useState<Tournament>(mockTournaments[0])
  const [activeTab, setActiveTab] = useState<"previous" | "alltime">("previous")
  const [userTimezone, setUserTimezone] = useState<string>("")

  useEffect(() => {
    setUserTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone)
  }, [])

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    }).format(date)
  }

  const getClassColor = (tournamentClass: string) => {
    switch (tournamentClass) {
      case "Novice":
        return "from-green-500 to-green-600"
      case "Intermediate":
        return "from-yellow-500 to-orange-500"
      case "Pro":
        return "from-red-500 to-purple-600"
      default:
        return "from-gray-500 to-gray-600"
    }
  }

  const getClassBorder = (tournamentClass: string) => {
    switch (tournamentClass) {
      case "Novice":
        return "border-green-500/50"
      case "Intermediate":
        return "border-yellow-500/50"
      case "Pro":
        return "border-red-500/50"
      default:
        return "border-gray-500/50"
    }
  }

  return (
    <>
      <Header />
      <Sidebar />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-10 blur-sm">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/images/static.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/30" />

        {/* Coming Soon Overlay */}
        <div className="absolute inset-0 pt-[72px] bg-black/40 backdrop-blur-sm z-30 flex items-center justify-center pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center pointer-events-auto"
          >
            <h2 className="text-6xl md:text-8xl font-black text-white font-['Montserrat'] mb-4 tracking-wider drop-shadow-2xl">
              COMING SOON
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 font-['PT_Mono'] drop-shadow-lg">
              Tournaments are under development
            </p>
          </motion.div>
        </div>

        {/* Content with proper spacing for header and sidebar */}
        <div className="pt-[72px] pl-20 relative z-10">
          <div className="container mx-auto px-6 py-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-7xl mx-auto"
            >
              {/* Header */}

              <div className="grid lg:grid-cols-4 gap-8">
                {/* Tournament Sidebar */}
                <div className="lg:col-span-1">
                  <h3 className="text-xl font-semibold text-white mb-4">Upcoming Tournaments</h3>
                  <div className="space-y-3">
                    {mockTournaments.map((tournament) => (
                      <motion.button
                        key={tournament.id}
                        onClick={() => setSelectedTournament(tournament)}
                        className={`w-full text-left p-4 rounded-xl border transition-all duration-300 ${
                          selectedTournament.id === tournament.id
                            ? `bg-gradient-to-r ${getClassColor(tournament.class)} text-white border-white/30`
                            : `bg-black/40 backdrop-blur-md text-gray-300 hover:text-white ${getClassBorder(tournament.class)} hover:bg-black/60`
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="font-semibold text-sm mb-1">{tournament.name}</div>
                        <div className="text-xs opacity-80">
                          {tournament.class} • ${tournament.price}
                        </div>
                        <div className="text-xs opacity-60 mt-1">
                          {formatDateTime(tournament.startTime).split(",")[1]}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Main Tournament Display */}
                <div className="lg:col-span-3">
                  {/* Tournament Signup Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className={`bg-black/60 backdrop-blur-md rounded-2xl p-8 border-2 ${getClassBorder(selectedTournament.class)} mb-8`}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-3xl font-bold text-white mb-2">{selectedTournament.name}</h2>
                        <div className="flex items-center space-x-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r ${getClassColor(selectedTournament.class)} text-white`}
                          >
                            {selectedTournament.class}
                          </span>
                          <span className="text-gray-300">
                            {selectedTournament.currentPlayers}/{selectedTournament.maxPlayers} players
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-white">${selectedTournament.price}</div>
                        <div className="text-sm text-gray-400">Entry Fee</div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                      <div className="bg-black/40 rounded-xl p-4">
                        <div className="text-sm text-gray-400 mb-1">Start Time</div>
                        <div className="text-white font-semibold">{formatDateTime(selectedTournament.startTime)}</div>
                        <div className="text-xs text-gray-500 mt-1">Your timezone: {userTimezone}</div>
                      </div>
                      <div className="bg-black/40 rounded-xl p-4">
                        <div className="text-sm text-gray-400 mb-1">Prize Pool</div>
                        <div className="text-white font-semibold text-2xl">${selectedTournament.prizePool}</div>
                      </div>
                      <div className="bg-black/40 rounded-xl p-4">
                        <div className="text-sm text-gray-400 mb-1">Players</div>
                        <div className="text-white font-semibold">
                          {selectedTournament.currentPlayers}/{selectedTournament.maxPlayers}
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                          <div
                            className={`h-2 rounded-full bg-gradient-to-r ${getClassColor(selectedTournament.class)}`}
                            style={{
                              width: `${(selectedTournament.currentPlayers / selectedTournament.maxPlayers) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <motion.button
                      className={`w-full py-4 rounded-xl font-semibold text-white bg-gradient-to-r ${getClassColor(selectedTournament.class)} hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Join Tournament - ${selectedTournament.price}
                    </motion.button>
                  </motion.div>

                  {/* Leaderboards */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="bg-black/40 backdrop-blur-md rounded-2xl p-8 border border-white/10"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold text-white">Leaderboards</h3>
                      <div className="flex bg-black/40 rounded-lg p-1">
                        <button
                          onClick={() => setActiveTab("previous")}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                            activeTab === "previous" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
                          }`}
                        >
                          Previous Tournaments
                        </button>
                        <button
                          onClick={() => setActiveTab("alltime")}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                            activeTab === "alltime" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
                          }`}
                        >
                          All Time
                        </button>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="text-left py-3 px-4 text-gray-400 font-medium">Rank</th>
                            <th className="text-left py-3 px-4 text-gray-400 font-medium">Player</th>
                            <th className="text-left py-3 px-4 text-gray-400 font-medium">Wins</th>
                            <th className="text-left py-3 px-4 text-gray-400 font-medium">Tournaments</th>
                            <th className="text-left py-3 px-4 text-gray-400 font-medium">Win Rate</th>
                            <th className="text-left py-3 px-4 text-gray-400 font-medium">Earnings</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(activeTab === "previous" ? mockPreviousLeaderboard : mockAllTimeLeaderboard).map(
                            (entry, index) => (
                              <motion.tr
                                key={entry.player}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200"
                              >
                                <td className="py-4 px-4">
                                  <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                      entry.rank === 1
                                        ? "bg-yellow-500 text-black"
                                        : entry.rank === 2
                                          ? "bg-gray-400 text-black"
                                          : entry.rank === 3
                                            ? "bg-orange-600 text-white"
                                            : "bg-gray-700 text-white"
                                    }`}
                                  >
                                    {entry.rank}
                                  </div>
                                </td>
                                <td className="py-4 px-4 text-white font-medium">{entry.player}</td>
                                <td className="py-4 px-4 text-green-400 font-semibold">{entry.wins}</td>
                                <td className="py-4 px-4 text-gray-300">{entry.tournaments}</td>
                                <td className="py-4 px-4 text-blue-400 font-semibold">{entry.winRate}%</td>
                                <td className="py-4 px-4 text-yellow-400 font-semibold">${entry.earnings}</td>
                              </motion.tr>
                            ),
                          )}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
