"use client"

import { motion, type MotionValue } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ScrollIndicator } from "./scroll-indicator"
import { useRef, useEffect, useState } from "react"
import { Play, Gamepad2, Coins, Swords } from "lucide-react"

interface HeroSectionProps {
  backgroundY: MotionValue<string>
  textY: MotionValue<string>
}

export function HeroSection({ backgroundY, textY }: HeroSectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoFailed, setVideoFailed] = useState(true)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleCanPlay = () => {
      console.log("Video can play now")
      setVideoFailed(false)
    }

    const handleError = (e: Event) => {
      console.error("Video failed to load:", e)
      setVideoFailed(true)
    }

    video.addEventListener("canplay", handleCanPlay)
    video.addEventListener("error", handleError)

    // Check if video is already loaded
    if (video.readyState >= 3) {
      setVideoFailed(false)
    }

    return () => {
      video.removeEventListener("canplay", handleCanPlay)
      video.removeEventListener("error", handleError)
    }
  }, [])

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden py-20 md:py-0 w-full">
      {/* Video Background with Parallax */}
      <motion.div className="absolute inset-0 w-screen h-[120%] overflow-hidden left-0" style={{ y: backgroundY }}>
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-purple-900/30 to-black/70 z-10"></div>
        <div className="absolute w-full h-full">
          {/* Fallback Image - Always render but conditionally show/hide */}
          <img
            src="/images/hero-bg.jpeg"
            alt="Hero Background"
            loading="eager"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ display: videoFailed ? "block" : "none" }}
          />

          {/* Video - Hidden until successfully loaded */}
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ display: videoFailed ? "none" : "block" }}
          >
            <source src="/videos/heroloop.mp4" type="video/mp4" />
          </video>
        </div>
      </motion.div>

      {/* Floating Particles */}
      <div className="absolute inset-0 z-15">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-purple-400/30 rounded-full"
            animate={{
              y: [0, -20, 0],
              x: [0, Math.random() * 10 - 5, 0],
              opacity: [0.3, 0.8, 0.3],
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

      {/* Main Content with Parallax */}
      <motion.div className="relative z-20 w-full px-[5%]" style={{ y: textY }}>
        <div className="grid lg:grid-cols-2 gap-16 items-center justify-center w-full max-w-7xl mx-auto">
          {/* Left Column - Main Content */}
          <div className="space-y-8">
            {/* Badge */}
            <motion.div
              className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-pt-mono font-bold text-white">LIVE BETA</span>
            </motion.div>

            {/* Main Title */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 1 }}
            >
              <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tight font-montserrat text-white font-montserrat">
                <span className="block">DENSITY</span>
                <span className="block">DECK</span>
              </h1>
            </motion.div>

            {/* Description */}
            <motion.p
              className="text-base sm:text-lg md:text-xl font-pt-mono-regular text-gray-300 leading-relaxed max-w-2xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              Experience the ultimate multiplayer card game where strategy meets blockchain rewards. Battle opponents,
              climb leaderboards, and earn real prizes in the Old Rock universe.
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
                  <span>PLAY NOW</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Button>

              <Button
                variant="outline"
                className="bg-white/10 backdrop-blur-md border border-white/30 text-white hover:bg-white/20 px-8 py-4 text-lg font-bold rounded-2xl transition-all duration-300 hover:scale-105 font-pt-mono"
                onClick={() => (window.location.href = "/density-deck/overview")}
              >
                Learn More
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="flex flex-wrap gap-6 pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.8 }}
            >
              <div className="text-center">
                <div className="text-2xl font-black font-montserrat text-white">4</div>
                <div className="text-sm font-pt-mono text-gray-400">Players</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black font-montserrat text-white">50</div>
                <div className="text-sm font-pt-mono text-gray-400">Card Deck</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black font-montserrat text-white">3</div>
                <div className="text-sm font-pt-mono text-gray-400">Game Modes</div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Feature Cards */}
          <div className="space-y-6 hidden md:block max-w-md">
            {/* Game Modes Card */}
            <motion.div
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 hover:bg-white/15 transition-all duration-300"
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-transparent border border-white/50 rounded-2xl flex items-center justify-center">
                  <Gamepad2 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-black font-montserrat text-white">Multiple Game Modes</h3>
              </div>
              <p className="text-gray-300 font-pt-mono text-sm leading-relaxed">
                Choose from Classic high-stakes games, quick Arcade matches, or competitive Tournament play.
              </p>
            </motion.div>

            {/* Rewards Card */}
            <motion.div
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 hover:bg-white/15 transition-all duration-300"
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-transparent border border-white/50 rounded-2xl flex items-center justify-center">
                  <Coins className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-black font-montserrat text-white">Real Rewards</h3>
              </div>
              <p className="text-gray-300 font-pt-mono text-sm leading-relaxed">
                Earn $USDC prizes and $DENSITY tokens. Finish Quests and Tasks for free games. Build winning streaks for
                multiplied rewards.
              </p>
            </motion.div>

            {/* Strategy Card */}
            <motion.div
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 hover:bg-white/15 transition-all duration-300"
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-transparent border border-white/50 rounded-2xl flex items-center justify-center">
                  <Swords className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-black font-montserrat text-white">Strategic Gameplay</h3>
              </div>
              <p className="text-gray-300 font-pt-mono text-sm leading-relaxed">
                A fast, secure multiplayer webapp. Master hand combinations, manage life resources, and outlast
                opponents. Earn $USDC and risk it on streaks for bigger rewards.
              </p>
            </motion.div>
          </div>

          {/* Mobile Feature Cards - Only visible on mobile */}
          <div className="space-y-4 md:hidden max-w-md mx-auto">
            {/* Game Modes Card */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-transparent border border-white/50 rounded-xl flex items-center justify-center">
                  <Gamepad2 className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-black font-montserrat text-white">Multiple Game Modes</h3>
              </div>
              <p className="text-gray-300 font-pt-mono text-xs leading-relaxed">
                Choose from Classic high-stakes games, quick Arcade matches, or competitive Tournament play.
              </p>
            </div>

            {/* Rewards Card */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-transparent border border-white/50 rounded-xl flex items-center justify-center">
                  <Coins className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-black font-montserrat text-white">Real Rewards</h3>
              </div>
              <p className="text-gray-300 font-pt-mono text-xs leading-relaxed">
                Earn $USDC prizes and $DENSITY tokens. Finish Quests and Tasks for free games. Build winning streaks for
                multiplied rewards.
              </p>
            </div>

            {/* Strategy Card */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-transparent border border-white/50 rounded-xl flex items-center justify-center">
                  <Swords className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-black font-montserrat text-white">Strategic Gameplay</h3>
              </div>
              <p className="text-gray-300 font-pt-mono text-xs leading-relaxed">
                A fast, secure multiplayer webapp. Master hand combinations, manage life resources, and outlast
                opponents. Earn $USDC and risk it on streaks for bigger rewards.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating Elements */}
      <motion.div
        className="absolute top-20 right-20 w-20 h-20 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-xl"
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
        className="absolute bottom-40 left-20 w-16 h-16 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 rounded-full blur-xl"
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

      <ScrollIndicator />
    </section>
  )
}
