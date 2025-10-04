"use client"

import { Header } from "@/components/header"
import { CyberpunkBackground } from "@/components/cyberpunk-background"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer"
import { motion } from "framer-motion"
import Image from "next/image"
import { useState, useEffect } from "react"
import { fetchCollectionStats, fetchOldRockNFTs, fetchGoliathNFTsByDensity } from "@/app/actions/fetch-nfts"
import { RefreshCw } from "lucide-react"

// Complete rock color data with all 11 types and updated rarities
const rockColors = [
  {
    name: "COMMON",
    element: "EARTH",
    color: "#8B4513",
    rarity: "Common",
    positive: "Grounded, reliable, practical, stable, dependable",
    negative: "Boring, predictable, stubborn, unimaginative, rigid",
  },
  {
    name: "YELLOW",
    element: "GAS",
    color: "#FFB000",
    rarity: "Uncommon",
    positive: "Cheerful, adaptable, optimistic, energetic, light-hearted",
    negative: "Unpredictable, inconsistent, superficial, flighty, impulsive",
  },
  {
    name: "TURQUOISE",
    element: "ELECTRICITY",
    color: "#40E0D0",
    rarity: "Uncommon",
    positive: "Quick-witted, adaptable, creative, energetic, inspiring",
    negative: "Unpredictable, impulsive, restless, volatile, erratic",
  },
  {
    name: "BLUE",
    element: "ICE",
    color: "#0F52BA",
    rarity: "Rare",
    positive: "Calm, rational, introspective, patient, stable",
    negative: "Cold, aloof, unemotional, indecisive, detached",
  },
  {
    name: "PURPLE",
    element: "FORCE/MIND",
    color: "#9966CC",
    rarity: "Rare",
    positive: "Wise, intuitive, thoughtful, intellectual, sensitive",
    negative: "Overthinking, secretive, indecisive, overly complex, mysterious",
  },
  {
    name: "RED",
    element: "FIRE",
    color: "#E0115F",
    rarity: "Rare",
    positive: "Passionate, assertive, confident, courageous, energetic",
    negative: "Impulsive, hot-headed, aggressive, domineering, volatile",
  },
  {
    name: "SILVER",
    element: "PHYSICAL ENHANCEMENTS",
    color: "#C0C0C0",
    rarity: "Epic",
    positive: "Agile, resilient, competitive, disciplined, strong",
    negative: "Over-competitive, stubborn, uncompromising, aggressive",
  },
  {
    name: "GOLD",
    element: "WEALTH/PROSPERITY",
    color: "#FFD700",
    rarity: "Epic",
    positive: "Ambitious, successful, confident, charismatic, influential",
    negative: "Greedy, materialistic, arrogant, superficial, selfish",
  },
  {
    name: "AQUAMARINE",
    element: "WATER/HEALING",
    color: "#7FFFD4",
    rarity: "Legendary",
    positive: "Healing, peaceful, empathetic, nurturing, harmonious",
    negative: "Overly emotional, passive, indecisive, escapist, dependent",
  },
  {
    name: "BLACK",
    element: "VOID/SHADOW",
    color: "#000000",
    rarity: "Mythic",
    positive: "Mysterious, powerful, protective, sophisticated, elegant",
    negative: "Dark, pessimistic, secretive, intimidating, destructive",
  },
  {
    name: "WHITE",
    element: "LIGHT/PURITY",
    color: "#FFFFFF",
    rarity: "Mythic",
    positive: "Pure, enlightened, peaceful, spiritual, transcendent",
    negative: "Naive, detached, perfectionist, judgmental, sterile",
  },
]

// Character types with updated rarity levels and new bounties description
const characterTypes = [
  {
    name: "UNINFECTED",
    description: "Pure humans untouched by the Goliath disease, maintaining their original form and consciousness",
    rarity: "Common",
    densityKey: "UNINFECTED",
  },
  {
    name: "LOW DENSITY",
    description: "Early stage infection with minimal symptoms, showing subtle changes in appearance and behavior",
    rarity: "Uncommon",
    densityKey: "LOW DENSITY",
  },
  {
    name: "MEDIUM DENSITY",
    description: "Moderate infection showing clear mutations, with enhanced strength and partial transformation",
    rarity: "Rare",
    densityKey: "MEDIUM DENSITY",
  },
  {
    name: "HIGH DENSITY",
    description: "Advanced infection with severe mutations, exhibiting extreme physical changes and volatile nature",
    rarity: "Epic",
    densityKey: "HIGH DENSITY",
  },
  {
    name: "BOUNTIES",
    description: "Dangerous outlaws with prices on their heads, hunted across the wasteland",
    rarity: "Legendary",
    densityKey: "BOUNTIES",
  },
  {
    name: "MYSTICS",
    description: "Legendary beings with mysterious powers, transcending the limitations of normal Goliath infection",
    rarity: "Mythic",
    densityKey: "MYSTICS",
  },
]

// Rarity color function for rocks
const getRockRarityColor = (rarity: string) => {
  switch (rarity.toLowerCase()) {
    case "common":
      return "bg-gray-500"
    case "uncommon":
      return "bg-green-500"
    case "rare":
      return "bg-blue-500"
    case "epic":
      return "bg-purple-500"
    case "legendary":
      return "bg-orange-500"
    case "mythic":
      return "bg-red-500"
    default:
      return "bg-gray-500"
  }
}

// Rarity color function for Goliath
const getGoliathRarityColor = (rarity: string) => {
  switch (rarity.toLowerCase()) {
    case "common":
      return "bg-gray-500"
    case "uncommon":
      return "bg-green-500"
    case "rare":
      return "bg-blue-500"
    case "epic":
      return "bg-purple-500"
    case "legendary":
      return "bg-orange-500"
    case "mythic":
      return "bg-red-500"
    default:
      return "bg-gray-500"
  }
}

export default function CollectionsPage() {
  const [collectionStats, setCollectionStats] = useState<any>(null)
  const [oldRockNFTs, setOldRockNFTs] = useState<any>({})
  const [goliathNFTs, setGoliathNFTs] = useState<any>({})
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [isLoadingOldRockNFTs, setIsLoadingOldRockNFTs] = useState(true)
  const [isLoadingNFTs, setIsLoadingNFTs] = useState(true)
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [rockDistribution, setRockDistribution] = useState<any>({})
  const [goliathDistribution, setGoliathDistribution] = useState<any>({})

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
  }, [])

  // Fetch collection stats
  useEffect(() => {
    const loadCollectionData = async () => {
      setIsLoadingStats(true)
      try {
        const result = await fetchCollectionStats()
        if (result.success) {
          setCollectionStats(result.stats)
          console.log("Collection data fetched successfully:", result.stats)
        }
      } catch (error) {
        console.error("Error fetching collection data:", error)
      } finally {
        setIsLoadingStats(false)
      }
    }

    loadCollectionData()
  }, [])

  // Fetch Old Rock NFTs
  useEffect(() => {
    console.log("🚀 OLD ROCK useEffect triggered")
    const loadOldRockNFTs = async () => {
      console.log("🚀 Starting to load Old Rock NFTs...")
      setIsLoadingOldRockNFTs(true)
      try {
        console.log("📞 Calling fetchOldRockNFTs...")
        const result = await fetchOldRockNFTs()
        console.log("📞 fetchOldRockNFTs result:", result)
        if (result.success) {
          setOldRockNFTs(result.nfts)
          console.log("✅ Old Rock NFTs set:", result.nfts)
        } else {
          console.error("❌ Old Rock NFTs fetch failed:", result.error)
        }
      } catch (error) {
        console.error("💥 Error in loadOldRockNFTs:", error)
      } finally {
        setIsLoadingOldRockNFTs(false)
        console.log("🏁 Old Rock NFTs loading finished")
      }
    }

    loadOldRockNFTs()
  }, [])

  // Fetch Goliath NFTs
  useEffect(() => {
    console.log("🚀 GOLIATH useEffect triggered")
    const loadGoliathNFTs = async () => {
      console.log("🚀 Starting to load Goliath NFTs...")
      setIsLoadingNFTs(true)
      try {
        console.log("📞 Calling fetchGoliathNFTsByDensity...")
        const result = await fetchGoliathNFTsByDensity()
        console.log("📞 fetchGoliathNFTsByDensity result:", result)
        if (result.success) {
          setGoliathNFTs(result.nfts)
          console.log("✅ Goliath NFTs set:", result.nfts)
        } else {
          console.error("❌ Goliath NFTs fetch failed:", result.error)
        }
      } catch (error) {
        console.error("💥 Error in loadGoliathNFTs:", error)
      } finally {
        setIsLoadingNFTs(false)
        console.log("🏁 Goliath NFTs loading finished")
      }
    }

    loadGoliathNFTs()
  }, [])

  // Refresh Old Rock NFTs
  const refreshOldRockNFTs = async () => {
    setIsLoadingOldRockNFTs(true)
    try {
      const result = await fetchOldRockNFTs()
      if (result.success) {
        setOldRockNFTs(result.nfts)
      }
    } catch (error) {
      console.error("Error refreshing Old Rock NFTs:", error)
    } finally {
      setIsLoadingOldRockNFTs(false)
    }
  }

  // Refresh Goliath NFTs
  const refreshGoliathNFTs = async () => {
    setIsLoadingNFTs(true)
    try {
      const result = await fetchGoliathNFTsByDensity()
      if (result.success) {
        setGoliathNFTs(result.nfts)
      }
    } catch (error) {
      console.error("Error refreshing Goliath NFTs:", error)
    } finally {
      setIsLoadingNFTs(false)
    }
  }

  // Fetch distribution data
  useEffect(() => {
    const loadDistributionData = async () => {
      try {
        // Fetch Old Rock distribution with actual counts
        const oldRockResult = await fetchOldRockNFTs()
        if (oldRockResult.success && oldRockResult.counts) {
          // Use the actual counts returned from the API
          setRockDistribution(oldRockResult.counts)
          console.log("Rock distribution loaded:", oldRockResult.counts)
        }

        // Fetch Goliath distribution with actual counts
        const goliathResult = await fetchGoliathNFTsByDensity()
        if (goliathResult.success && goliathResult.counts) {
          // Use the actual counts returned from the API
          setGoliathDistribution(goliathResult.counts)
          console.log("Goliath distribution loaded:", goliathResult.counts)
        }
      } catch (error) {
        console.error("Error fetching distribution data:", error)
      }
    }

    loadDistributionData()
  }, [])

  return (
    <div className="flex">
      <Sidebar isWalletConnected={isWalletConnected} userProfile={userProfile} />
      <div className="min-h-screen text-white overflow-hidden relative w-full lg:ml-[79px]">
        <CyberpunkBackground />
        <Header />

        <main className="relative z-20 pt-32 pb-20">
          <div className="max-w-7xl mx-auto px-6">
            {/* Page Header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h1 className="text-4xl md:text-5xl font-black font-montserrat mb-4">NFT COLLECTIONS</h1>
              <p className="text-gray-400 font-pt-mono text-lg">
                Explore the Old Rock ecosystem through our NFT collections
              </p>
            </motion.div>

            {/* Collection Stats */}
            {collectionStats && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="grid md:grid-cols-2 gap-6 mb-16"
              >
                <div className="bg-gray-900/50 border border-gray-700 rounded-2xl p-6">
                  <h3 className="text-xl font-black font-montserrat text-purple-400 mb-4">OLD ROCK COLLECTION</h3>
                  <div className="grid grid-cols-2 gap-4 font-pt-mono text-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Supply:</span>
                        <span className="text-white font-bold">{collectionStats.oldRock.totalSupply || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Owners:</span>
                        <span className="text-white font-bold">
                          {collectionStats.oldRock.openSeaMetadata?.numOwners ||
                            collectionStats.oldRock.owners ||
                            "N/A"}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Floor Price:</span>
                        <span className="text-white font-bold">
                          {collectionStats.oldRock.openSeaMetadata?.floorPrice
                            ? `${collectionStats.oldRock.openSeaMetadata.floorPrice} ETH`
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Volume:</span>
                        <span className="text-white font-bold">
                          {collectionStats.oldRock.openSeaMetadata?.totalVolume
                            ? `${collectionStats.oldRock.openSeaMetadata.totalVolume} ETH`
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="text-xs text-gray-400 mb-2">TYPE DISTRIBUTION</div>
                    <div className="grid grid-cols-2 gap-1 text-xs font-pt-mono">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Common:</span>
                        <span className="text-white font-bold">{rockDistribution.COMMON || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-yellow-400">Yellow:</span>
                        <span className="text-white font-bold">{rockDistribution.YELLOW || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-cyan-400">Turquoise:</span>
                        <span className="text-white font-bold">{rockDistribution.TURQUOISE || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-400">Blue:</span>
                        <span className="text-white font-bold">{rockDistribution.BLUE || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-400">Purple:</span>
                        <span className="text-white font-bold">{rockDistribution.PURPLE || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-red-400">Red:</span>
                        <span className="text-white font-bold">{rockDistribution.RED || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Silver:</span>
                        <span className="text-white font-bold">{rockDistribution.SILVER || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-yellow-300">Gold:</span>
                        <span className="text-white font-bold">{rockDistribution.GOLD || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-cyan-300">Aquamarine:</span>
                        <span className="text-white font-bold">{rockDistribution.AQUAMARINE || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-900 bg-white px-1 rounded">Black:</span>
                        <span className="text-white font-bold">{rockDistribution.BLACK || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-900 bg-gray-200 px-1 rounded">White:</span>
                        <span className="text-white font-bold">{rockDistribution.WHITE || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900/50 border border-gray-700 rounded-2xl p-6">
                  <h3 className="text-xl font-black font-montserrat text-purple-400 mb-4">GOLIATH COLLECTION</h3>
                  <div className="grid grid-cols-2 gap-4 font-pt-mono text-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Supply:</span>
                        <span className="text-white font-bold">{collectionStats.goliath.totalSupply || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Owners:</span>
                        <span className="text-white font-bold">
                          {collectionStats.goliath.openSeaMetadata?.numOwners ||
                            collectionStats.goliath.owners ||
                            "N/A"}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Floor Price:</span>
                        <span className="text-white font-bold">
                          {collectionStats.goliath.openSeaMetadata?.floorPrice
                            ? `${collectionStats.goliath.openSeaMetadata.floorPrice} ETH`
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Volume:</span>
                        <span className="text-white font-bold">
                          {collectionStats.goliath.openSeaMetadata?.totalVolume
                            ? `${collectionStats.goliath.openSeaMetadata.totalVolume} ETH`
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="text-xs text-gray-400 mb-2">GOLIATH DISTRIBUTION</div>
                    <div className="grid grid-cols-3 gap-2 text-xs font-pt-mono">
                      <div className="text-center">
                        <div className="text-gray-500 font-bold">Uninfected</div>
                        <div className="text-white">{goliathDistribution.UNINFECTED || 0}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-green-500 font-bold">Low Density</div>
                        <div className="text-white">{goliathDistribution["LOW DENSITY"] || 0}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-blue-500 font-bold">Medium</div>
                        <div className="text-white">{goliathDistribution["MEDIUM DENSITY"] || 0}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-purple-500 font-bold">High</div>
                        <div className="text-white">{goliathDistribution["HIGH DENSITY"] || 0}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-orange-500 font-bold">Mystics</div>
                        <div className="text-white">{goliathDistribution.MYSTICS || 0}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-red-500 font-bold">Bounties</div>
                        <div className="text-white">{goliathDistribution.BOUNTIES || 0}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Old Rock Collection - Now First */}
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="mb-20"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-black font-montserrat text-white mb-2">OLD ROCK COLLECTION</h2>
                  <p className="text-gray-400 font-pt-mono">
                    Ancient stones that cause infection, amplifying one's archetypal traits. Each person exhibits the
                    color that matches their inner archetype.
                  </p>
                </div>
                <button
                  onClick={refreshOldRockNFTs}
                  disabled={isLoadingOldRockNFTs}
                  className="flex items-center space-x-2 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-pt-mono font-bold transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingOldRockNFTs ? "animate-spin" : ""}`} />
                  <span>Refresh</span>
                </button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {rockColors.map((rock, index) => {
                  const nftData = oldRockNFTs[rock.name]
                  return (
                    <motion.div
                      key={rock.name}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.6 }}
                      className="bg-gray-900/50 border border-gray-700 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-colors group"
                    >
                      {/* NFT Image */}
                      <div className="relative aspect-square bg-gray-800 overflow-hidden">
                        {isLoadingOldRockNFTs ? (
                          <div className="w-full h-full bg-gray-700/50 animate-pulse flex items-center justify-center">
                            <span className="text-gray-400 font-pt-mono text-sm">Loading...</span>
                          </div>
                        ) : nftData?.image ? (
                          <Image
                            src={nftData.image || "/placeholder.svg"}
                            alt={`${rock.name} Rock NFT`}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = "/images/nft-placeholder.jpg"
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-700/50 flex items-center justify-center">
                            <span className="text-gray-400 font-pt-mono text-sm">No NFT Found</span>
                          </div>
                        )}

                        {/* Rarity Badge - Moved to top right */}
                        <div className="absolute top-3 right-3">
                          <span
                            className={`${getRockRarityColor(
                              rock.rarity,
                            )} text-white text-xs font-bold px-2 py-1 rounded-full font-pt-mono`}
                          >
                            {rock.rarity.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      {/* Content - Remove token numbers and links */}
                      <div className="p-6">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: rock.color }}></div>
                          <h3 className="text-xl font-black font-montserrat text-white">{rock.name}</h3>
                        </div>

                        <p className="text-purple-400 font-pt-mono text-sm font-bold mb-3">{rock.element}</p>

                        <div className="space-y-3 text-sm font-pt-mono">
                          <div>
                            <span className="text-green-400 font-bold">Positive: </span>
                            <span className="text-gray-300">{rock.positive}</span>
                          </div>
                          <div>
                            <span className="text-red-400 font-bold">Negative: </span>
                            <span className="text-gray-300">{rock.negative}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.section>

            {/* Goliath Collection - Now Second */}
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-black font-montserrat text-white mb-2">GOLIATH COLLECTION</h2>
                  <p className="text-gray-400 font-pt-mono">Character types by density level</p>
                </div>
                <button
                  onClick={refreshGoliathNFTs}
                  disabled={isLoadingNFTs}
                  className="flex items-center space-x-2 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-pt-mono font-bold transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingNFTs ? "animate-spin" : ""}`} />
                  <span>Refresh</span>
                </button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {characterTypes.map((character, index) => {
                  const nftData = goliathNFTs[character.densityKey]
                  return (
                    <motion.div
                      key={character.name}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.6 }}
                      className="bg-gray-900/50 border border-gray-700 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-colors group"
                    >
                      {/* NFT Image */}
                      <div className="relative aspect-square bg-gray-800 overflow-hidden">
                        {isLoadingNFTs ? (
                          <div className="w-full h-full bg-gray-700/50 animate-pulse flex items-center justify-center">
                            <span className="text-gray-400 font-pt-mono text-sm">Loading...</span>
                          </div>
                        ) : nftData?.image ? (
                          <Image
                            src={nftData.image || "/placeholder.svg"}
                            alt={`${character.name} NFT`}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = "/images/nft-placeholder.jpg"
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-700/50 flex items-center justify-center">
                            <span className="text-gray-400 font-pt-mono text-sm">No NFT Found</span>
                          </div>
                        )}

                        {/* Rarity Badge - Moved to top right */}
                        <div className="absolute top-3 right-3">
                          <span
                            className={`${getGoliathRarityColor(
                              character.rarity,
                            )} text-white text-xs font-bold px-2 py-1 rounded-full font-pt-mono`}
                          >
                            {character.rarity.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      {/* Content - Remove token numbers and links */}
                      <div className="p-6">
                        <h3 className="text-xl font-black font-montserrat text-white mb-2">{character.name}</h3>
                        <p className="text-gray-400 font-pt-mono text-sm leading-relaxed">{character.description}</p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.section>
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  )
}
