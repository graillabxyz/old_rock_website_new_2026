"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="relative z-20 flex flex-col min-h-[60vh] w-full">
      <div className="flex-grow"></div>
      <div className="w-full relative z-10">
        {/* CAN YOU DIG? Section - Added more top margin */}
        <motion.div
          className="text-center mb-12 px-6 mt-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-montserrat text-white mb-4">CAN YOU DIG?</h2>
          <p className="text-purple-400 font-pt-mono text-base md:text-lg">
            Join the Old Rock ecosystem and start your adventure
          </p>
        </motion.div>

        {/* Main Footer Content - Full Width Container */}
        <div className="w-full bg-gray-900/30 border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="grid md:grid-cols-3 gap-12 w-full">
              {/* Left Column - Logo and Description */}
              <motion.div
                className="space-y-6 flex flex-col items-center md:items-start text-center md:text-left"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <div>
                  <h3 className="text-xl md:text-2xl font-black font-montserrat text-white mb-2">OLD ROCK</h3>
                  <p className="text-purple-400 font-pt-mono text-sm">NFT Gaming Ecosystem</p>
                </div>
                <p className="text-gray-400 font-pt-mono text-sm leading-relaxed max-w-md">
                  Enter the world of Old Rock - where NFTs meet strategic gaming. Stake, play, and earn in our
                  interconnected ecosystem of games and experiences.
                </p>

                {/* Social Links */}
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <motion.a
                    href="https://x.com/OldRockNFT"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </motion.a>
                  <motion.a
                    href="https://discord.gg/OldRockNFT"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                    </svg>
                  </motion.a>
                  <motion.a
                    href="https://t.me/densitydeck"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                    </svg>
                  </motion.a>
                  <motion.a
                    href="https://opensea.io/collection/oldrock"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Image
                      src="/images/opensea-logo-white.png"
                      alt="OpenSea"
                      width={20}
                      height={20}
                      className="w-5 h-5"
                    />
                  </motion.a>
                </div>
              </motion.div>

              {/* Middle Column - Games */}
              <motion.div
                className="space-y-6 flex flex-col items-center md:items-start text-center md:text-left"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h4 className="text-lg font-black font-montserrat text-white">Games & Platforms</h4>
                <div className="space-y-3 font-pt-mono text-sm">
                  <a
                    href="https://densitydeck.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-gray-400 hover:text-purple-400 transition-colors"
                  >
                    Density Deck (Beta)
                  </a>
                  <a
                    href="https://amplify.oldrocknft.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-gray-400 hover:text-purple-400 transition-colors"
                  >
                    Amplify Heliosite
                  </a>
                  <a
                    href="https://discord.gg/oldrocknft"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-gray-400 hover:text-purple-400 transition-colors"
                  >
                    Bounty Call
                  </a>
                  <span className="block text-gray-600">Stonebound Souls (Coming Soon)</span>
                </div>
              </motion.div>

              {/* Right Column - Resources */}
              <motion.div
                className="space-y-6 flex flex-col items-center md:items-start text-center md:text-left"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h4 className="text-lg font-black font-montserrat text-white">Resources</h4>
                <div className="space-y-3 font-pt-mono text-sm">
                  <a
                    href="https://docs.oldrocknft.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-gray-400 hover:text-purple-400 transition-colors"
                  >
                    Documentation
                  </a>
                  <a
                    href="https://airdrop.oldrocknft.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-gray-400 hover:text-purple-400 transition-colors"
                  >
                    Airdrop
                  </a>
                  <Link href="/collections" className="block text-gray-400 hover:text-purple-400 transition-colors">
                    Collections
                  </Link>
                  <Link href="/comic" className="block text-gray-400 hover:text-purple-400 transition-colors">
                    Comic
                  </Link>
                  <Link href="/leaderboard" className="block text-gray-400 hover:text-purple-400 transition-colors">
                    Leaderboard
                  </Link>
                  <a
                    href="https://opensea.io/collection/oldrock"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-gray-400 hover:text-purple-400 transition-colors"
                  >
                    Old Rock Collection
                  </a>
                  <a
                    href="https://opensea.io/collection/oldrock-goliath"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-gray-400 hover:text-purple-400 transition-colors"
                  >
                    Goliath Collection
                  </a>
                  <Link href="/mint" className="block text-gray-400 hover:text-purple-400 transition-colors">
                    Mint Page
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Bottom Legal Links - Only Privacy, Terms, Cookie Policy */}
          <motion.div
            className="border-t border-gray-800 py-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <p className="text-gray-400 font-pt-mono text-sm">© 2025 Old Rock NFT. All rights reserved.</p>
                <div className="flex flex-wrap gap-4 md:gap-6 font-pt-mono text-xs text-gray-500 justify-center">
                  <Link href="/privacy-policy" className="hover:text-purple-400 transition-colors">
                    Privacy Policy
                  </Link>
                  <Link href="/terms-of-service" className="hover:text-purple-400 transition-colors">
                    Terms of Service
                  </Link>
                  <Link href="/cookie-policy" className="hover:text-purple-400 transition-colors">
                    Cookie Policy
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  )
}
