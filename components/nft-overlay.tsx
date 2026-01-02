"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

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
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          {/* Blurred background with NFT image */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <Image
              src={nft.image || "/placeholder.svg"}
              alt={nft.name}
              fill
              className="object-cover opacity-30"
              unoptimized
            />
          </div>

          {/* Menu overlay */}
          <motion.div
            className="relative bg-gray-900/95 backdrop-blur-lg rounded-2xl border border-purple-500/50 shadow-2xl max-w-md w-full p-6"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>

            {/* NFT Preview */}
            <div className="mb-6">
              <div
                className="relative aspect-square rounded-xl overflow-hidden border-2 border-purple-500 mb-4"
                style={{ backgroundColor: nft.backgroundColor }}
              >
                <Image
                  src={nft.image || "/placeholder.svg"}
                  alt={nft.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">{nft.name}</h3>
              <p className="text-sm text-gray-400">{nft.collection}</p>
            </div>

            {/* Menu Actions */}
            <div className="space-y-3">
              <button
                onClick={() => onSetAsProfilePicture(nft)}
                disabled={isSettingAvatar}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center justify-center"
              >
                {isSettingAvatar ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5"
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
                    Setting Avatar...
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

