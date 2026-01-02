"use client"

import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

interface NFT {
  tokenId: string
  name: string
  image: string
  collection: string
  contractAddress: string
  attributes?: any[]
  backgroundColor?: string
}

interface NFTOverlayProps {
  nft: NFT | null
  isOpen: boolean
  onClose: () => void
  onSetAsProfilePicture: (nft: NFT) => Promise<void>
  isSettingAvatar: boolean
}

export function NFTOverlay({ nft, isOpen, onClose, onSetAsProfilePicture, isSettingAvatar }: NFTOverlayProps) {
  if (!nft) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="absolute inset-0 z-10 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          {/* Blurred background with NFT image */}
          <div className="absolute inset-0 overflow-hidden rounded-xl">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <Image
              src={nft.image || "/placeholder.svg"}
              alt={nft.name}
              fill
              className="object-cover opacity-40"
              unoptimized
            />
          </div>

          {/* Menu overlay */}
          <motion.div
            className="relative p-4 mx-2 w-full max-w-[90%]"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Menu Actions */}
            <div className="space-y-2">
              <button
                onClick={() => onSetAsProfilePicture(nft)}
                disabled={isSettingAvatar}
                className="w-full text-white font-semibold px-4 py-2 transition-opacity flex items-center justify-center text-sm hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSettingAvatar ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Setting...
                  </span>
                ) : (
                  "Set as Profile Picture"
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
