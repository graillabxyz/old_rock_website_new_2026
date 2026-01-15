"use client"

import { Header } from "@/components/header"
import { CyberpunkBackground } from "@/components/cyberpunk-background"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer"
import { motion } from "framer-motion"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Target, AlertTriangle, ExternalLink, Zap, Flame, Droplets, SpaceIcon as Void } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Bounty {
  name: string
  image: string
  description: string
  rarity: string
  status: string
  element: string
  abilities: string[]
  lastSeen: string
  bountyAmount: string
  dangerLevel: number
}

// Update the bountyData array with shorter descriptions
const bountyData: Bounty[] = [
  {
    name: "Unknown",
    image: "/images/bounties/unknown.jpeg",
    description:
      "A mysterious figure who manipulates dark matter and bends reality. Can teleport short distances and disappear into shadows, making her nearly impossible to track or capture.",
    rarity: "Mythic",
    status: "WANTED DEAD OR ALIVE",
    element: "Void/Shadow",
    abilities: ["Dark Matter Manipulation", "Short-Range Teleportation", "Reality Distortion", "Shadow Stealth"],
    lastSeen: "Sector 7 Industrial District",
    bountyAmount: "500,000 Credits",
    dangerLevel: 10,
  },
  {
    name: "Silverstrike",
    image: "/images/bounties/silverstrike.jpeg",
    description:
      "Infamous marauder with silver rocks growing from his body, granting superhuman strength. Known for ruthless tactics and berserker rage when threatened. Approach with extreme caution.",
    rarity: "Epic",
    status: "WANTED DEAD OR ALIVE",
    element: "Physical Enhancement",
    abilities: [
      "Superhuman Strength",
      "Enhanced Durability",
      "Berserker Rage",
      "Tactical Combat",
      "Silver Rock Addiction",
    ],
    lastSeen: "Mining Town - 50 miles South",
    bountyAmount: "250,000 Credits",
    dangerLevel: 8,
  },
  {
    name: "The Archon",
    image: "/images/bounties/archon.jpeg",
    description:
      "Cult leader covered in burning red rocks. Commands a fanatical following of fire-attuned disciples who sacrifice themselves to increase his power. Can generate and control devastating flames.",
    rarity: "Legendary",
    status: "EXTREMELY DANGEROUS",
    element: "Fire",
    abilities: [
      "Pyrokinesis",
      "Fire Immunity",
      "Cult Leadership",
      "Flame Projection",
      "Heat Aura",
      "Follower Sacrifice Ritual",
    ],
    lastSeen: "Abandoned Cathedral - Northern Wastes",
    bountyAmount: "750,000 Credits",
    dangerLevel: 9,
  },
  {
    name: "The Reaper",
    image: "/images/bounties/reaper.gif",
    description:
      "Land pirate with black rocks that grant teleportation and dark matter control. Can phase through solid objects and manipulate shadows. Appears and vanishes like a phantom.",
    rarity: "Legendary",
    status: "KILL ON SIGHT",
    element: "Void/Shadow",
    abilities: [
      "Short-Range Teleportation",
      "Dark Matter Control",
      "Phase Shifting",
      "Shadow Manipulation",
      "Dimensional Travel",
    ],
    lastSeen: "Northern City - 120km North",
    bountyAmount: "1,000,000 Credits",
    dangerLevel: 10,
  },
  {
    name: "The Siren",
    image: "/images/bounties/siren.gif",
    description:
      "Seductive woman with aquamarine stones granting temporal powers. Can manipulate time perception and charm victims. Uses precognition to anticipate attacks and escape capture.",
    rarity: "Epic",
    status: "WANTED ALIVE",
    element: "Temporal/Psychic",
    abilities: [
      "Temporal Manipulation",
      "Psychic Influence",
      "Charm/Seduction",
      "Time Distortion",
      "Precognitive Flashes",
    ],
    lastSeen: "Coastal Town - 20 miles North",
    bountyAmount: "400,000 Credits",
    dangerLevel: 7,
  },
]

export default function BountyCallPage() {
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)

  // Check wallet connection status
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" })
          if (accounts.length > 0) {
            setIsWalletConnected(true)
            setUserProfile({
              name: "OldRock User",
              avatar: "/images/rock-logo.png",
              address: accounts[0],
            })
          }
        } catch (error) {
          console.error("Error checking wallet connection:", error)
        }
      }
    }

    checkWalletConnection()

    // Listen for wallet connection events
    const handleWalletConnection = (event: CustomEvent) => {
      if (event.detail?.connected && event.detail?.address) {
        setIsWalletConnected(true)
        setUserProfile({
          name: "OldRock User",
          avatar: event.detail.avatar || "/images/rock-logo.png",
          address: event.detail.address,
        })
      }
    }

    const handleWalletDisconnection = () => {
      setIsWalletConnected(false)
      setUserProfile(null)
    }

    window.addEventListener("walletConnected", handleWalletConnection as EventListener)
    window.addEventListener("walletDisconnected", handleWalletDisconnection as EventListener)

    return () => {
      window.removeEventListener("walletConnected", handleWalletConnection as EventListener)
      window.removeEventListener("walletDisconnected", handleWalletDisconnection as EventListener)
    }
  }, [])

  // Update the getElementIcon function to handle the new temporal element:

  const getElementIcon = (element: string) => {
    switch (element.toLowerCase()) {
      case "fire":
        return <Flame className="w-4 h-4 text-red-400" />
      case "void/shadow":
        return <Void className="w-4 h-4 text-purple-400" />
      case "temporal/psychic":
        return <Droplets className="w-4 h-4 text-cyan-400" />
      case "physical enhancement":
        return <Zap className="w-4 h-4 text-yellow-400" />
      default:
        return <Target className="w-4 h-4 text-gray-400" />
    }
  }

  const getDangerColor = (level: number) => {
    if (level >= 9) return "text-red-500"
    if (level >= 7) return "text-orange-500"
    if (level >= 5) return "text-yellow-500"
    return "text-green-500"
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case "mythic":
        return "bg-red-500"
      case "legendary":
        return "bg-orange-500"
      case "epic":
        return "bg-purple-500"
      case "rare":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="flex">
      <Sidebar
        isWalletConnected={isWalletConnected}
        userProfile={userProfile}
        setIsWalletConnected={setIsWalletConnected}
        setUserProfile={setUserProfile}
      />
      <div className="min-h-screen text-white overflow-hidden relative w-full lg:ml-[79px]">
        <CyberpunkBackground />
        <Header />

        {/* Hero Section with Background */}
        <section className="relative min-h-[85vh] md:h-screen flex flex-col items-center justify-center overflow-hidden">
          {/* Background Image with Gradient Fade */}
          <div className="absolute inset-0 w-full h-full">
            <Image src="/images/bounty-bg.webp" alt="Bounty Call Background" fill className="object-cover" priority />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/60 to-black/90" />
          </div>

          {/* Hero Content */}
          <div className="relative z-20 w-full max-w-6xl mx-auto px-6 flex flex-col items-center justify-center h-full pb-16 pt-24 md:pt-0">
            {/* Title Image - Optimized for Mobile */}
            <motion.div
              className="mb-0 w-full flex justify-center relative z-10"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <Image
                src="/images/bounty-call-title.avif"
                alt="Bounty Call"
                width={1350}
                height={337}
                className="w-auto h-auto max-w-[95%] md:max-w-[110%] max-h-none transform scale-100 md:scale-[1.125] object-cover"
                style={{
                  clipPath: "inset(15% 15% 15% 15%)", // Reduced inset for mobile visibility
                }}
                priority
              />
            </motion.div>

            {/* Centered Content - Reduced top margin for less space */}
            <div className="max-w-4xl mx-auto text-center relative z-20 mt-6">
              {" "}
              {/* Reduced from mt-12 to mt-6 */}
              {/* Main Heading and Description */}
              <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                <h2 className="text-2xl md:text-4xl font-black font-montserrat text-white mb-4">HUNT THE OUTLAWS</h2>
                <p className="text-base md:text-lg font-pt-mono text-gray-300 leading-relaxed mb-6">
                  Track down the most dangerous outlaws in the Old Rock universe. These legendary bounties have prices
                  on their heads and are wanted across the wasteland.
                </p>
              </motion.div>
              {/* Discord CTA */}
              <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.8 }}
              >
                <Button
                  className="group relative overflow-hidden bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-400 hover:via-pink-400 hover:to-orange-400 text-white border-0 px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-bold rounded-2xl transition-all duration-300 hover:scale-105 font-pt-mono shadow-2xl shadow-purple-500/25"
                  onClick={() => window.open("https://discord.gg/oldrocknft", "_blank")}
                >
                  <span className="relative z-10 flex items-center space-x-2">
                    <Target className="w-4 h-4 md:w-5 md:h-5" />
                    <span>JOIN THE HUNT ON DISCORD</span>
                    <ExternalLink className="w-3 h-3 md:w-4 md:h-4" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Button>
              </motion.div>
              {/* Discord description text */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.8 }}
                className="mb-10"
              >
                <p className="text-gray-400 font-pt-mono text-sm leading-relaxed">
                  Join our Discord server to participate in the Bounty Call visual novel experience
                </p>
              </motion.div>
            </div>
          </div>

          {/* Glitch Warning Overlay */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 1, 0.8, 1, 0.9, 1, 0.7, 1, 0],
              scale: [0.8, 1.1, 0.95, 1.05, 0.98, 1.02, 0.99, 1, 0.95],
            }}
            transition={{
              duration: 3,
              times: [0, 0.1, 0.15, 0.25, 0.3, 0.4, 0.45, 0.8, 1],
              ease: "easeInOut",
            }}
          >
            <div className="bg-red-500/90 border-2 border-red-400 rounded-2xl p-8 backdrop-blur-sm max-w-md w-full mx-4 relative overflow-hidden">
              {/* Glitch effect overlay */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-red-600/50 to-transparent"
                animate={{
                  x: [-100, 100, -50, 50, 0],
                  opacity: [0, 0.8, 0, 0.6, 0],
                }}
                transition={{
                  duration: 3,
                  times: [0, 0.2, 0.4, 0.6, 1],
                  repeat: 0,
                }}
              />

              {/* Flickering border effect */}
              <motion.div
                className="absolute inset-0 border-2 border-white/50 rounded-2xl"
                animate={{
                  opacity: [0, 1, 0, 1, 0, 1, 0],
                }}
                transition={{
                  duration: 0.5,
                  repeat: 5,
                  ease: "linear",
                }}
              />

              <div className="relative z-10">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <AlertTriangle className="w-8 h-8 text-white animate-pulse" />
                  <h3 className="text-2xl font-black font-montserrat text-white">DANGER WARNING</h3>
                  <AlertTriangle className="w-8 h-8 text-white animate-pulse" />
                </div>
                <p className="font-pt-mono text-white text-lg text-center font-bold">
                  These bounties are extremely dangerous. Approach with caution and be prepared for anything.
                </p>
              </div>

              {/* Static noise effect */}
              <motion.div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
                animate={{
                  opacity: [0.1, 0.3, 0.1, 0.4, 0.1],
                }}
                transition={{
                  duration: 0.2,
                  repeat: 10,
                  ease: "linear",
                }}
              />
            </div>
          </motion.div>
        </section>

        {/* Bounties Section */}
        <section className="relative z-20 py-20 px-6">
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-black font-montserrat text-white mb-4">WANTED BOUNTIES</h2>
              <p className="text-gray-400 font-pt-mono text-lg">
                Track down these dangerous individuals for glory and rewards
              </p>
            </motion.div>

            {/* Bounties Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {bountyData.map((bounty, index) => (
                <motion.div
                  key={bounty.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  viewport={{ once: true }}
                  className="bg-gray-900/50 border border-red-500/30 rounded-2xl overflow-hidden hover:border-red-500/70 transition-all duration-300 group hover:scale-105"
                >
                  {/* NFT Image */}
                  <div className="relative aspect-square bg-gray-800 overflow-hidden">
                    <Image
                      src={bounty.image || "/placeholder.svg"}
                      alt={`${bounty.name} Bounty`}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full font-pt-mono">
                        {bounty.status}
                      </span>
                    </div>

                    {/* Rarity Badge */}
                    <div className="absolute top-3 right-3">
                      <span
                        className={`${getRarityColor(bounty.rarity)} text-white text-xs font-bold px-3 py-1 rounded-full font-pt-mono`}
                      >
                        {bounty.rarity}
                      </span>
                    </div>

                    {/* Danger Level */}
                    <div className="absolute bottom-3 right-3">
                      <div className="bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1">
                        <span className={`font-pt-mono text-xs font-bold ${getDangerColor(bounty.dangerLevel)}`}>
                          DANGER: {bounty.dangerLevel}/10
                        </span>
                      </div>
                    </div>

                    {/* Danger Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-red-900/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-2xl font-black font-montserrat text-white group-hover:text-red-400 transition-colors">
                        {bounty.name}
                      </h3>
                      {getElementIcon(bounty.element)}
                    </div>

                    {/* Element & Bounty Amount */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-purple-400 font-pt-mono text-sm font-bold">{bounty.element}</span>
                      <span className="text-green-400 font-pt-mono text-sm font-bold">{bounty.bountyAmount}</span>
                    </div>

                    {/* Abilities */}
                    <div className="mb-4">
                      <h4 className="text-xs text-gray-400 font-pt-mono font-bold uppercase tracking-wider mb-2">
                        ABILITIES
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {bounty.abilities.map((ability, idx) => (
                          <span
                            key={idx}
                            className="bg-gray-700/50 text-gray-300 text-xs px-2 py-1 rounded font-pt-mono"
                          >
                            {ability}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Last Seen */}
                    <div className="mb-4">
                      <h4 className="text-xs text-gray-400 font-pt-mono font-bold uppercase tracking-wider mb-1">
                        LAST SEEN
                      </h4>
                      <p className="text-gray-300 font-pt-mono text-sm">{bounty.lastSeen}</p>
                    </div>

                    {/* Description - Remove line-clamp-3 to show full description */}
                    <p className="text-gray-300 font-pt-mono text-sm leading-relaxed">{bounty.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Game Info Section */}
            <motion.div
              className="mt-20 bg-gradient-to-r from-purple-900/30 via-pink-900/30 to-orange-900/30 border border-purple-500/30 rounded-3xl p-8"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="text-center max-w-4xl mx-auto">
                <h3 className="text-3xl font-black font-montserrat text-white mb-6">ABOUT BOUNTY CALL</h3>
                <p className="text-gray-300 font-pt-mono text-lg leading-relaxed mb-8">
                  Bounty Call is a Discord-based visual novel experience where you hunt down five dangerous Goliath
                  targets. Make pivotal decisions, track your progress, and climb the leaderboard as you navigate
                  through this choose-your-own-adventure story in the Old Rock universe.
                </p>
                <div className="grid md:grid-cols-3 gap-4">{/* Placeholder for additional content */}</div>
              </div>
            </motion.div>
          </div>
        </section>
        <Footer />
      </div>
    </div>
  )
}
