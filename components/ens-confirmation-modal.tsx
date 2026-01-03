"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, AlertCircle } from "lucide-react"

interface ENSConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  nftName?: string
  isLoading?: boolean
}

export function ENSConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  nftName,
  isLoading = false,
}: ENSConfirmationModalProps) {
  if (!isOpen) return null

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
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            className="relative bg-black/90 backdrop-blur-md border border-cyan-400/50 rounded-xl shadow-2xl max-w-md w-full p-6"
            style={{
              boxShadow: '0 0 30px rgba(34, 211, 238, 0.3), 0 0 60px rgba(34, 211, 238, 0.1)',
            }}
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-cyan-400 transition-colors z-10"
              disabled={isLoading}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon */}
            <div className="flex items-center justify-center w-12 h-12 bg-cyan-500/20 rounded-full mb-4 border border-cyan-400/30">
              <AlertCircle className="w-6 h-6 text-cyan-400" />
            </div>

            {/* Title */}
            <h3 className="text-xl font-black text-white mb-3 font-['Montserrat']">{title}</h3>

            {/* Message */}
            <div className="text-gray-300 mb-6 space-y-2 font-['PT_Mono'] text-sm leading-relaxed">
              {message.split("\n").map((line, index) => (
                <p key={index} className={line.trim() === "" ? "h-2" : ""}>{line || "\u00A0"}</p>
              ))}
              {nftName && (
                <p className="text-cyan-400 font-semibold mt-3 pt-3 border-t border-cyan-400/20">
                  NFT: <span className="text-white">{nftName}</span>
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 bg-gray-800/80 hover:bg-gray-700/80 disabled:bg-gray-800/50 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-4 py-2.5 rounded-lg transition-all border border-gray-600/50 hover:border-gray-500/50 font-['PT_Mono'] text-sm"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 disabled:from-cyan-800 disabled:to-cyan-900 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-4 py-2.5 rounded-lg transition-all border border-cyan-400/50 hover:border-cyan-300/50 shadow-lg shadow-cyan-500/20 font-['PT_Mono'] text-sm flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
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
                    Processing...
                  </>
                ) : (
                  "Continue"
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

