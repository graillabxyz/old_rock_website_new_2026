"use client"

import { motion } from "framer-motion"
import Image from "next/image"

export function DensitySection() {
  return (
    <section className="relative z-20 min-h-screen py-20 w-full">
      <div className="w-full px-6 relative z-10">
        {/* Section Header with DENSITY Logo */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-center space-x-4 mb-6">
            <motion.div
              className="relative w-16 h-16"
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, type: "spring", bounce: 0.4 }}
              viewport={{ once: true }}
            >
              <motion.div
                className="absolute inset-0"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                transition={{ duration: 2, ease: "easeInOut" }}
                viewport={{ once: true }}
              >
                <svg width="64" height="64" viewBox="0 0 1920 1920" className="absolute inset-0">
                  <motion.path
                    d="M960,74.56c-489.02,0-885.44,396.43-885.44,885.44s396.43,885.44,885.44,885.44,885.44-396.43,885.44-885.44S1449.02,74.56,960,74.56ZM1391.17,1449.35h-862.35v-101.66h862.35v101.66ZM1391.17,1273.94h-862.35v-101.66h862.35v101.66ZM1391.17,1098.53h-862.35v-101.66h862.35v101.66ZM1391.17,923.13h-862.35v-101.66h862.35v101.66ZM1391.17,747.72h-862.35v-101.66h862.35v101.66ZM1391.17,572.31h-862.35v-101.66h862.35v101.66Z"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="8"
                    filter="drop-shadow(0 0 10px #ffffff) drop-shadow(0 0 20px #00ffff)"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 3, ease: "easeInOut" }}
                  />
                </svg>
              </motion.div>
              <Image
                src="/images/density-white.svg"
                alt="Density Logo"
                width={64}
                height={64}
                className="w-full h-full relative z-10"
              />
            </motion.div>
            <h2 className="text-5xl md:text-6xl font-black font-montserrat">DENSITY ECOSYSTEM</h2>
          </div>
          <p className="text-xl font-pt-mono text-gray-400 max-w-3xl mx-auto">
            Explore the interconnected world of Old Rock through our gaming and staking platforms
          </p>
        </motion.div>

        {/* Large Feature Cards - 2x2 Grid */}
        <div className="grid lg:grid-cols-2 gap-8 w-full max-w-6xl mx-auto">
          {/* Amplify Card */}
          <motion.div
            className="relative group"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="relative h-80 rounded-3xl overflow-hidden bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 border border-purple-500/20">
              <Image
                src="/images/amplify-bg.jpg"
                alt="Amplify Background"
                fill
                className="object-cover opacity-60 group-hover:opacity-70 transition-opacity duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

              {/* Top Tags */}
              <div className="absolute top-4 left-4">
                <div className="bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 rounded-full px-3 py-1">
                  <span className="text-purple-300 font-pt-mono text-xs font-bold">NFT SOFT STAKING</span>
                </div>
              </div>
              <div className="absolute top-4 right-4">
                <div className="bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-full px-3 py-1">
                  <span className="text-green-300 font-pt-mono text-xs font-bold">LIVE</span>
                </div>
              </div>

              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <motion.div
                  className="space-y-3"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <h3 className="text-3xl font-black font-montserrat text-white">Amplify Heliosite</h3>
                  <p className="text-base font-pt-mono text-gray-200 leading-relaxed">
                    Combine Old Rock and Goliath NFTs in a gas-free environment to boost your $DENSITY earnings.
                    Customize combinations based on rarity and color.
                  </p>
                  <motion.a
                    href="https://amplify.oldrocknft.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-xl font-pt-mono font-bold transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Launch Amplify →
                  </motion.a>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Density Deck Card */}
          <motion.div
            className="relative group"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="relative h-80 rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 border border-blue-500/20">
              <Image
                src="/images/density-deck-bg.jpg"
                alt="Density Deck Background"
                fill
                className="object-cover opacity-60 group-hover:opacity-70 transition-opacity duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

              {/* Top Tags */}
              <div className="absolute top-4 left-4">
                <div className="bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-full px-3 py-1">
                  <span className="text-blue-300 font-pt-mono text-xs font-bold">MULTIPLAYER CARD GAME</span>
                </div>
              </div>
              <div className="absolute top-4 right-4">
                <div className="bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-full px-3 py-1">
                  <span className="text-green-300 font-pt-mono text-xs font-bold">LIVE</span>
                </div>
              </div>

              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <motion.div
                  className="space-y-3"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <h3 className="text-3xl font-black font-montserrat text-white">Density Deck (BETA)</h3>
                  <p className="text-base font-pt-mono text-gray-200 leading-relaxed">
                    Join games with $USDC, win $DENSITY, climb leaderboards, and unlock streak and tournament rewards.
                  </p>
                  <motion.a
                    href="https://densitydeck.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl font-pt-mono font-bold transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Play Now →
                  </motion.a>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Bounty Call Card */}
          <motion.div
            className="relative group"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="relative h-80 rounded-3xl overflow-hidden bg-gradient-to-br from-purple-900 via-pink-800 to-cyan-900 border border-pink-500/20">
              <Image
                src="/images/bounty-call-bg.png"
                alt="Bounty Call Background"
                fill
                className="object-cover opacity-70 group-hover:opacity-80 transition-opacity duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

              {/* Top Tags */}
              <div className="absolute top-4 left-4">
                <div className="bg-pink-500/20 backdrop-blur-sm border border-pink-400/30 rounded-full px-3 py-1">
                  <span className="text-pink-300 font-pt-mono text-xs font-bold">CHOOSE YOUR ADVENTURE</span>
                </div>
              </div>
              <div className="absolute top-4 right-4">
                <div className="bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-full px-3 py-1">
                  <span className="text-green-300 font-pt-mono text-xs font-bold">LIVE</span>
                </div>
              </div>

              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <motion.div
                  className="space-y-3"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <h3 className="text-3xl font-black font-montserrat text-white">Bounty Call</h3>
                  <p className="text-base font-pt-mono text-gray-200 leading-relaxed">
                    Hunt Goliaths in a Discord-based visual novel. Track down five targets, make pivotal decisions, and
                    climb the leaderboard.
                  </p>
                  <motion.a
                    href="https://discord.gg/oldrocknft"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-xl font-pt-mono font-bold transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Join Discord →
                  </motion.a>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Stonebound Souls Card */}
          <motion.div
            className="relative group"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="relative h-80 rounded-3xl overflow-hidden bg-gradient-to-br from-orange-900 via-yellow-800 to-amber-900 border border-orange-500/20">
              <Image
                src="/images/stonebound-souls-bg.jpg"
                alt="Stonebound Souls Background"
                fill
                className="object-cover opacity-70 group-hover:opacity-80 transition-opacity duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

              {/* Top Tags */}
              <div className="absolute top-4 left-4">
                <div className="bg-orange-500/20 backdrop-blur-sm border border-orange-400/30 rounded-full px-3 py-1">
                  <span className="text-orange-300 font-pt-mono text-xs font-bold">TTRPG X SPACES</span>
                </div>
              </div>
              <div className="absolute top-4 right-4">
                <div className="bg-yellow-500/20 backdrop-blur-sm border border-yellow-400/30 rounded-full px-3 py-1">
                  <span className="text-yellow-300 font-pt-mono text-xs font-bold">COMING SOON</span>
                </div>
              </div>

              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <motion.div
                  className="space-y-3"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <h3 className="text-3xl font-black font-montserrat text-white">Stonebound Souls</h3>
                  <p className="text-base font-pt-mono text-gray-200 leading-relaxed">
                    Live cyberpunk roleplay on X Spaces using custom TTRPG mechanics. Your Goliath NFT evolves as you
                    choose a class and shape your story.
                  </p>
                  <motion.button
                    className="inline-flex items-center bg-gray-600 text-white px-4 py-2 rounded-xl font-pt-mono font-bold cursor-not-allowed opacity-75"
                    disabled
                  >
                    Coming Soon
                  </motion.button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
