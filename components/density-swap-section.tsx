"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ChevronDown, ArrowUpDown, TrendingUp, Lock } from "lucide-react"

export function DensitySwapSection() {
  return (
    <section className="relative z-20 min-h-screen py-12 md:py-20 w-full">
      <div className="w-full px-6 lg:px-12 xl:px-16 relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black font-montserrat mb-4">$DENSITY PROTOCOL</h2>
          <p className="text-lg md:text-xl font-pt-mono text-gray-400 max-w-3xl mx-auto px-4">
            The native token powering the Old Rock ecosystem
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start w-full max-w-7xl mx-auto">
          {/* Left Content */}
          <motion.div
            className="space-y-6 md:space-y-8"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            {/* Protocol Info Cards */}
            <div className="space-y-4 md:space-y-6">
              <motion.div
                className="bg-gray-900/50 border border-gray-700 rounded-2xl p-4 lg:p-6 xl:p-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center space-x-3 mb-3 md:mb-4">
                  <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
                  <h3 className="text-lg md:text-xl font-black font-montserrat text-purple-400">Staking Rewards</h3>
                </div>
                <div className="space-y-2 md:space-y-3 font-pt-mono">
                  <div className="flex justify-between items-center text-sm md:text-base">
                    <span className="text-gray-300">Arcade Games ($0.50)</span>
                    <span className="text-purple-400 font-bold">40% Revenue Share</span>
                  </div>
                  <div className="flex justify-between items-center text-sm md:text-base">
                    <span className="text-gray-300">Classic Games ($5.00)</span>
                    <span className="text-purple-400 font-bold">15% Revenue Share</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="bg-gray-900/50 border border-gray-700 rounded-2xl p-4 lg:p-6 xl:p-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center space-x-3 mb-3 md:mb-4">
                  <Lock className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
                  <h3 className="text-lg md:text-xl font-black font-montserrat text-purple-400">Protocol Features</h3>
                </div>
                <ul className="space-y-2 font-pt-mono text-sm md:text-base text-gray-300">
                  <li>• Decentralized trading & staking</li>
                  <li>• Gas-optimized transactions</li>
                  <li>• Cross-platform rewards</li>
                  <li>• Governance participation</li>
                </ul>
              </motion.div>
            </div>
          </motion.div>

          {/* Right Swap Interface */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            <div className="bg-gray-900/90 backdrop-blur-sm rounded-3xl p-6 lg:p-8 xl:p-10 border border-gray-700 shadow-2xl">
              {/* Interface Header */}
              <div className="flex items-center justify-between mb-6 md:mb-8">
                <h3 className="text-xl md:text-2xl font-black font-montserrat">Trade $DENSITY</h3>
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </div>

              {/* Swap/Stake Tabs */}
              <div className="flex mb-6 md:mb-8 bg-gray-800 rounded-xl p-1">
                <button className="flex-1 py-2 md:py-3 px-4 md:px-6 rounded-lg bg-purple-500 text-white font-pt-mono font-bold text-sm md:text-base transition-all">
                  Swap
                </button>
                <button className="flex-1 py-2 md:py-3 px-4 md:px-6 rounded-lg text-gray-400 font-pt-mono font-bold text-sm md:text-base hover:text-white transition-colors">
                  Stake
                </button>
              </div>

              {/* Trading Interface */}
              <div className="space-y-3 md:space-y-4">
                {/* Sell Section */}
                <div className="bg-gray-800/80 rounded-2xl p-4 md:p-6 border border-gray-600/50">
                  <div className="flex justify-between items-center mb-2 md:mb-3">
                    <span className="text-gray-400 font-pt-mono font-bold text-sm md:text-base">From</span>
                    <span className="text-gray-400 font-pt-mono text-xs md:text-sm">Balance: 0.012 ETH</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <input
                      type="text"
                      placeholder="0.0"
                      className="bg-transparent text-2xl md:text-3xl font-bold text-white outline-none flex-1 min-w-0"
                      disabled
                    />
                    <button className="flex items-center space-x-2 md:space-x-3 bg-gray-700 rounded-xl px-3 md:px-4 py-2 md:py-3 hover:bg-gray-600 transition-colors flex-shrink-0">
                      <div className="w-5 h-5 md:w-6 md:h-6 bg-blue-500 rounded-full"></div>
                      <span className="font-pt-mono font-bold text-sm md:text-base">ETH</span>
                      <ChevronDown className="w-3 h-3 md:w-4 md:h-4" />
                    </button>
                  </div>
                </div>

                {/* Swap Arrow */}
                <div className="flex justify-center">
                  <button className="bg-gray-700 p-3 md:p-4 rounded-xl hover:bg-gray-600 transition-colors border border-gray-600">
                    <ArrowUpDown className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                </div>

                {/* Buy Section */}
                <div className="bg-gray-800/80 rounded-2xl p-4 md:p-6 border border-gray-600/50">
                  <div className="flex justify-between items-center mb-2 md:mb-3">
                    <span className="text-gray-400 font-pt-mono font-bold text-sm md:text-base">To</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <input
                      type="text"
                      placeholder="0.0"
                      className="bg-transparent text-2xl md:text-3xl font-bold text-white outline-none flex-1 min-w-0"
                      disabled
                    />
                    <button className="flex items-center space-x-2 md:space-x-3 bg-purple-500 rounded-xl px-3 md:px-4 py-2 md:py-3 hover:bg-purple-600 transition-colors flex-shrink-0">
                      <span className="font-pt-mono font-bold text-sm md:text-base">$DENSITY</span>
                      <ChevronDown className="w-3 h-3 md:w-4 md:h-4" />
                    </button>
                  </div>
                </div>

                {/* Action Button */}
                <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 md:py-4 text-base md:text-lg font-bold rounded-xl font-pt-mono">
                  Connect Wallet
                </Button>
              </div>
            </div>

            {/* Coming Soon Overlay */}
            <motion.div
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px] rounded-3xl flex items-center justify-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              viewport={{ once: true }}
            >
              <motion.div
                className="text-center px-4"
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.6, type: "spring" }}
                viewport={{ once: true }}
              >
                <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 md:mb-6 bg-purple-500 rounded-full flex items-center justify-center">
                  <Lock className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <h3 className="text-2xl md:text-4xl font-black font-montserrat mb-2 text-white">COMING SOON</h3>
                <p className="text-gray-300 font-pt-mono text-base md:text-lg">Protocol in development</p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
