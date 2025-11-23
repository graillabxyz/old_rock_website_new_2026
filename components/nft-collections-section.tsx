"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useState, useEffect } from "react"
import { fetchRandomGoliathNFTs, fetchRandomOldRockNFTs } from "@/app/actions/fetch-nfts"

export function NFTCollectionsSection() {
  // Create array for 4x4 grid
  const gridItems = Array.from({ length: 16 }, (_, i) => i)

  const [nftImages, setNftImages] = useState<string[]>([])
  const [isLoadingNFTs, setIsLoadingNFTs] = useState(true)
  const [loadErrors, setLoadErrors] = useState<Record<number, boolean>>({})
  const [activeCollection, setActiveCollection] = useState<"GOLIATH" | "OLD_ROCK">("GOLIATH")

  // Fetch NFTs for the active collection
  useEffect(() => {
    const loadImages = async () => {
      setIsLoadingNFTs(true)
      setLoadErrors({})
      try {
        const result =
          activeCollection === "GOLIATH" ? await fetchRandomGoliathNFTs() : await fetchRandomOldRockNFTs()
        if (result.success) {
          const images = result.images as string[]
          while (images.length < 16) {
            images.push("/images/nft-placeholder.jpg")
          }
          setNftImages(images)
        } else {
          setNftImages(Array(16).fill("/images/nft-placeholder.jpg"))
        }
      } catch (error) {
        console.error("Error loading NFT images:", error)
        setNftImages(Array(16).fill("/images/nft-placeholder.jpg"))
      } finally {
        setIsLoadingNFTs(false)
      }
    }

    loadImages()
  }, [activeCollection])

  // Handle image load error
  const handleImageError = (index: number) => {
    setLoadErrors((prev) => ({
      ...prev,
      [index]: true,
    }))
    console.error(`Failed to load NFT image at index ${index}:`, nftImages[index])
  }

  return (
    <section className="relative z-20 min-h-screen flex items-center justify-center py-20 w-full">
      <div className="w-full px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left Content */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <motion.h2
            className="text-4xl md:text-5xl font-black mb-6 font-montserrat text-center lg:text-left"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            viewport={{ once: true }}
          >
            NFT COLLECTIONS
          </motion.h2>

          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div>
              <p className="text-purple-400 text-sm font-bold font-pt-mono mb-1">CHAPTER 1 • THE GENESIS COLLECTION</p>
              <button
                type="button"
                onClick={() => setActiveCollection("OLD_ROCK")}
                className={`text-3xl md:text-4xl font-black font-montserrat transition-colors cursor-pointer ${
                  activeCollection === "OLD_ROCK" ? "text-white hover:text-purple-400" : "text-purple-400"
                }`}
              >
                OLD ROCK
              </button>
            </div>

            <div>
              <p className="text-purple-400 text-sm font-bold font-pt-mono mb-1">CHAPTER 2 • THE GAME PIECES</p>
              <button
                type="button"
                onClick={() => setActiveCollection("GOLIATH")}
                className={`text-3xl md:text-4xl font-black font-montserrat transition-colors cursor-pointer ${
                  activeCollection === "GOLIATH" ? "text-white hover:text-purple-300" : "text-purple-400"
                }`}
              >
                GOLIATH
              </button>
            </div>

            {activeCollection === "GOLIATH" ? (
              <h4 className="text-xl font-black font-montserrat mt-6 text-white">PUBLIC MINT</h4>
            ) : (
              <h4 className="text-xl font-black font-montserrat mt-6 text-white">MINT COMPLETE</h4>
            )}

            <div className="space-y-4 font-pt-mono text-sm leading-relaxed text-gray-300">
              {activeCollection === "GOLIATH" ? (
                <>
                  <p>
                    Goliath is a collection of the individuals that live within the fictional world of Old Rock. Some are
                    unaffected by the Goliath disease, and some are not as lucky.
                  </p>
                  <p>
                    Each Goliath NFT is your pass to future gaming experiences in the Old Rock ecosystem, as well as an
                    integral element to our unique rarity & combination based staking platform.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    An enigmatic world exists among these Old Rocks... and the path to enter this world is at your fingertips.
                  </p>
                  <p>
                    Old Rock is the genesis collection of the Old Rock ecosystem and the foundation of the Amplify Rewards Program.
                  </p>
                </>
              )}
              <p>If you have any questions please join our Discord and open a ticket.</p>
            </div>

            <div className="flex items-center gap-4">
              {activeCollection === "GOLIATH" && (
                <Button
                  className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-3 text-lg font-bold rounded-lg font-pt-mono transition-colors duration-300"
                  onClick={() => window.open("https://mint.oldrocknft.com", "_blank")}
                >
                  GO TO MINT PAGE
                </Button>
              )}
              <a
                href={activeCollection === "GOLIATH" ? "https://opensea.io/collection/oldrock-goliath" : "https://opensea.io/collection/oldrock"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-pt-mono text-gray-400 hover:text-gray-200 underline underline-offset-4"
              >
                View on OpenSea
              </a>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Grid */}
        <motion.div
          className="grid grid-cols-4 gap-2"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          {gridItems.map((index) => (
            <motion.div
              key={index}
              className="aspect-square relative overflow-hidden rounded-lg bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 cursor-pointer"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{
                delay: index * 0.02,
                duration: 0.5,
                type: "spring",
                bounce: 0.3,
              }}
              whileHover={{
                scale: 1.05,
                zIndex: 10,
                transition: { duration: 0.2 },
              }}
              viewport={{ once: true }}
              onClick={() => window.open("https://mint.oldrocknft.com", "_blank")}
            >
              {isLoadingNFTs ? (
                <div className="w-full h-full bg-gray-700/50 animate-pulse flex items-center justify-center">
                  <div className="text-gray-400 font-pt-mono text-xs">Loading...</div>
                </div>
              ) : loadErrors[index] ? (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                  <div className="text-gray-400 font-pt-mono text-xs text-center p-2">NFT Image Unavailable</div>
                </div>
              ) : (
                <Image
                  src={nftImages[index] || "/images/nft-placeholder.jpg"}
                  alt={`${activeCollection === "GOLIATH" ? "Goliath" : "Old Rock"} NFT ${index + 1}`}
                  fill
                  loading="lazy"
                  className="object-cover"
                  sizes="(max-width: 768px) 25vw, 12.5vw"
                  onError={() => handleImageError(index)}
                  unoptimized={true} // Skip Next.js image optimization for external NFT images
                />
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
