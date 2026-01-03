"use client"

import { motion } from "framer-motion"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Play, Trophy, Target, Users, Zap, Heart, Shuffle } from "lucide-react"
import { Footer } from "@/components/footer"

export default function DensityDeckOverview() {
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

        {/* Floating Particles */}
        <div className="absolute inset-0 z-15">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 bg-purple-400/30 rounded-full"
              animate={{
                y: [0, -20, 0],
                x: [0, Math.random() * 10 - 5, 0],
                opacity: [0.2, 0.6, 0.2],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Number.POSITIVE_INFINITY,
                delay: Math.random() * 2,
              }}
              style={{
                left: Math.random() * 100 + "%",
                top: Math.random() * 100 + "%",
              }}
            />
          ))}
        </div>

        {/* Content with proper spacing for header and sidebar */}
        <div className="pt-[72px] pl-0 md:pl-20 relative z-20">
          <div className="px-4 sm:px-6 md:px-[5%] py-8 sm:py-10 md:py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-6xl mx-auto"
            >
              {/* Hero Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center mb-8 sm:mb-10 md:mb-12">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Badge */}
                  <motion.div
                    className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                  >
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs font-pt-mono font-bold text-white">STRATEGIC CARD GAME</span>
                  </motion.div>

                  {/* Main Title */}
                  <motion.div
                    className="space-y-3"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 1 }}
                  >
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight font-montserrat text-white">
                      <span className="block">DENSITY</span>
                      <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                        DECK
                      </span>
                    </h1>
                  </motion.div>

                  {/* Description */}
                  <motion.p
                    className="text-sm sm:text-base md:text-lg font-pt-mono-regular text-gray-300 leading-relaxed"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.8 }}
                  >
                    Master color synergies, hand management, and tactical combat. Every draw matters, every decision
                    shapes your destiny, and every round escalates the stakes.
                  </motion.p>

                  {/* CTA Buttons */}
                  <motion.div
                    className="flex flex-col sm:flex-row gap-4"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9, duration: 0.8 }}
                  >
                    <Button
                      className="group relative overflow-hidden bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-400 hover:via-pink-400 hover:to-orange-400 text-white border-0 px-8 py-4 text-lg font-bold rounded-2xl transition-all duration-300 hover:scale-105 font-pt-mono shadow-2xl shadow-purple-500/25"
                      onClick={() => window.open("https://densitydeck.com", "_blank")}
                    >
                      <span className="relative z-10 flex items-center space-x-2">
                        <Play className="w-5 h-5" />
                        <span>PLAY BETA</span>
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </Button>

                    <Button
                      variant="outline"
                      className="bg-white/10 backdrop-blur-md border border-white/30 text-white hover:bg-white/20 px-8 py-4 text-lg font-bold rounded-2xl transition-all duration-300 hover:scale-105 font-pt-mono"
                      onClick={() => (window.location.href = "/density-deck/tournaments")}
                    >
                      <Trophy className="w-5 h-5 mr-2" />
                      Tournaments
                    </Button>
                  </motion.div>
                </div>

                {/* Right Column */}
                <div className="space-y-4 max-w-sm mx-auto lg:mx-0">
                  <motion.div
                    className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-6"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.1, duration: 0.8 }}
                  >
                    <div className="mb-3 sm:mb-4">
                      <h3 className="text-base sm:text-lg font-black font-montserrat text-white">QUICK OVERVIEW</h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm font-pt-mono text-gray-300">
                      <div className="flex justify-between items-center">
                        <span className="break-words">Players:</span>
                        <span className="text-white font-bold ml-2 flex-shrink-0">2-4</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="break-words">Game Time:</span>
                        <span className="text-white font-bold ml-2 flex-shrink-0">15 min</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="break-words">Deck Size:</span>
                        <span className="text-white font-bold ml-2 flex-shrink-0">50 cards</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="break-words">Skill Level:</span>
                        <span className="text-white font-bold ml-2 flex-shrink-0 text-right">Easy to Master</span>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-6"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.3, duration: 0.8 }}
                  >
                    <div className="mb-3 sm:mb-4">
                      <h3 className="text-base sm:text-lg font-black font-montserrat text-white">KEY FEATURES</h3>
                    </div>
                    <div className="space-y-2 text-xs font-pt-mono text-gray-300">
                      <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full flex-shrink-0"></div>
                        <span className="break-words">Color synergy mechanics</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-pink-400 rounded-full flex-shrink-0"></div>
                        <span className="break-words">Strategic hand management</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-orange-400 rounded-full flex-shrink-0"></div>
                        <span className="break-words">Escalating round complexity</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0"></div>
                        <span className="break-words">Tournament competition</span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Core Gameplay Section */}
              <motion.div
                className="mb-12"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, duration: 0.8 }}
              >
                <div className="text-center mb-8 sm:mb-10">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-black font-montserrat text-white mb-3 sm:mb-4">CORE GAMEPLAY</h2>
                  <p className="text-sm sm:text-base font-pt-mono text-gray-300 max-w-2xl mx-auto leading-relaxed px-4">
                    Strategy, luck, and tactical decisions combine in a dynamic card game where every choice matters.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {/* Hand Building */}
                  <motion.div
                    className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-6 hover:bg-white/15 transition-all duration-300"
                    whileHover={{ scale: 1.02, y: -5 }}
                  >
                    <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Shuffle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-black font-montserrat text-white">HAND BUILDING</h3>
                    </div>
                    <p className="text-gray-300 font-pt-mono text-xs sm:text-sm leading-relaxed mb-2 sm:mb-3">
                      Draw and discard cards strategically to achieve the highest Power Level through color synergies.
                    </p>
                    <div className="text-xs font-pt-mono text-purple-300">
                      • Strategic draw/discard decisions
                      <br />• Build toward focus colors
                      <br />• Optimize Power Level combinations
                    </div>
                  </motion.div>

                  {/* Color System */}
                  <motion.div
                    className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-6 hover:bg-white/15 transition-all duration-300"
                    whileHover={{ scale: 1.02, y: -5 }}
                  >
                    <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-pink-500 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Target className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-black font-montserrat text-white">COLOR SYNERGIES</h3>
                    </div>
                    <p className="text-gray-300 font-pt-mono text-xs sm:text-sm leading-relaxed mb-2 sm:mb-3">
                      Common cards add power, matching colors multiply. Your focus color is your strongest combination.
                    </p>
                    <div className="text-xs font-pt-mono text-orange-300">
                      • Common cards add base power
                      <br />• Matching colors multiply strength
                      <br />• Non-matching colors subtract power
                    </div>
                  </motion.div>

                  {/* Combat Decisions */}
                  <motion.div
                    className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-6 hover:bg-white/15 transition-all duration-300"
                    whileHover={{ scale: 1.02, y: -5 }}
                  >
                    <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-black font-montserrat text-white">TACTICAL COMBAT</h3>
                    </div>
                    <p className="text-gray-300 font-pt-mono text-xs sm:text-sm leading-relaxed mb-2 sm:mb-3">
                      From round 2, choose to fight, draw more cards, or surrender based on your hand and center cards.
                    </p>
                    <div className="text-xs font-pt-mono text-red-300">
                      • Fight when you have advantage
                      <br />• Draw to improve weak hands
                      <br />• Surrender to minimize losses
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Game Progression & Tournament Combined */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                {/* Game Progression */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.3, duration: 0.8 }}
                >
                  <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-6 md:p-8">
                    <div className="text-center mb-4 sm:mb-6">
                      <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-red-400 mx-auto mb-2 sm:mb-3" />
                      <h2 className="text-xl sm:text-2xl font-black font-montserrat text-white mb-2 sm:mb-3">ESCALATING STAKES</h2>
                      <p className="text-xs sm:text-sm font-pt-mono text-gray-300 leading-relaxed px-2">
                        Each round reveals center cards, increasing complexity and stakes.
                      </p>
                    </div>

                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex items-start space-x-2 sm:space-x-3">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white font-bold text-xs">1</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs sm:text-sm font-black font-montserrat text-white mb-1">Round Escalation</h4>
                          <p className="text-gray-300 font-pt-mono text-xs leading-relaxed">
                            More center cards each round create new strategic opportunities and complexity.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-2 sm:space-x-3">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white font-bold text-xs">2</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs sm:text-sm font-black font-montserrat text-white mb-1">Life Management</h4>
                          <p className="text-gray-300 font-pt-mono text-xs leading-relaxed">
                            Lose lives based on choices and fight performance. Strategic risk-taking is crucial.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-2 sm:space-x-3">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white font-bold text-xs">3</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs sm:text-sm font-black font-montserrat text-white mb-1">Adaptive Strategy</h4>
                          <p className="text-gray-300 font-pt-mono text-xs leading-relaxed">
                            Adapt based on hand state, center cards, and opponent behavior for success.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Tournament Section */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.5, duration: 0.8 }}
                >
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-6 md:p-8 flex flex-col justify-center space-y-6 sm:space-y-8 md:space-y-12">
                    <div className="text-center mb-4 sm:mb-6">
                      <Users className="w-8 h-8 sm:w-10 sm:h-10 text-purple-400 mx-auto mb-2 sm:mb-3" />
                      <h2 className="text-xl sm:text-2xl font-black font-montserrat text-white mb-2 sm:mb-3">COMPETITIVE PLAY</h2>
                      <p className="text-xs sm:text-sm font-pt-mono text-gray-300 leading-relaxed px-2">
                        Test your skills in tournaments and earn DENSITY tokens.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 sm:mb-6">
                      <div className="bg-gradient-to-b from-green-900/30 to-green-800/20 rounded-lg p-3 sm:p-4 border border-green-500/30 text-center">
                        <div className="text-base sm:text-lg font-black font-montserrat text-white mb-1">NOVICE</div>
                        <div className="text-green-300 font-pt-mono text-xs sm:text-sm">$10 ENTRY</div>
                      </div>
                      <div className="bg-gradient-to-b from-blue-900/30 to-blue-800/20 rounded-lg p-3 sm:p-4 border border-blue-500/30 text-center">
                        <div className="text-base sm:text-lg font-black font-montserrat text-white mb-1">ADVANCED</div>
                        <div className="text-blue-300 font-pt-mono text-xs sm:text-sm">$20 ENTRY</div>
                      </div>
                      <div className="bg-gradient-to-b from-yellow-900/30 to-yellow-800/20 rounded-lg p-3 sm:p-4 border border-yellow-500/30 text-center">
                        <div className="text-base sm:text-lg font-black font-montserrat text-white mb-1">PRO</div>
                        <div className="text-yellow-300 font-pt-mono text-xs sm:text-sm">$50 ENTRY</div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <Button
                        className="group relative overflow-hidden bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-400 hover:via-pink-400 hover:to-orange-400 text-white border-0 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-bold rounded-xl transition-all duration-300 hover:scale-105 font-pt-mono shadow-xl shadow-purple-500/25 w-full"
                        onClick={() => window.open("https://densitydeck.com", "_blank")}
                      >
                        <span className="relative z-10 flex items-center justify-center space-x-2">
                          <Play className="w-4 h-4" />
                          <span>START PLAYING</span>
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </Button>

                      <Button
                        variant="outline"
                        className="bg-white/10 backdrop-blur-md border border-white/30 text-white hover:bg-white/20 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-bold rounded-xl transition-all duration-300 hover:scale-105 font-pt-mono w-full"
                        onClick={() => (window.location.href = "/density-deck/tournaments")}
                      >
                        <Trophy className="w-4 h-4 mr-2" />
                        View Tournaments
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Floating Elements - Smaller and fewer */}
        {/* Note: disabled due to performance concerns }
        <motion.div
          className="absolute top-32 right-32 w-16 h-16 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-32 left-32 w-12 h-12 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 rounded-full blur-lg"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        {*/}
      </div>
      <Footer />
    </>
  )
}
