"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"

interface TVTransitionProps {
  isTransitioning: boolean
  onComplete?: () => void
}

export function TVTransition({ isTransitioning, onComplete }: TVTransitionProps) {
  const [showStatic, setShowStatic] = useState(false)

  useEffect(() => {
    if (isTransitioning) {
      setShowStatic(true)
      const timer = setTimeout(() => {
        setShowStatic(false)
        onComplete?.()
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [isTransitioning, onComplete])

  return (
    <AnimatePresence>
      {showStatic && (
        <motion.div
          className="fixed inset-0 z-[9999] pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
        >
          {/* TV Static Background */}
          <div className="absolute inset-0 bg-black">
            {/* Static noise pattern */}
            <div
              className="absolute inset-0 opacity-80"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                backgroundSize: "256px 256px",
              }}
            />

            {/* Animated static lines */}
            <motion.div
              className="absolute inset-0"
              animate={{
                backgroundPosition: ["0% 0%", "100% 100%"],
              }}
              transition={{
                duration: 0.1,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)",
                backgroundSize: "4px 4px",
              }}
            />

            {/* Horizontal scan lines */}
            <motion.div
              className="absolute inset-0"
              animate={{
                backgroundPosition: ["0% 0%", "0% 100%"],
              }}
              transition={{
                duration: 0.05,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(255,255,255,0.05) 1px, rgba(255,255,255,0.05) 2px)",
                backgroundSize: "100% 2px",
              }}
            />

            {/* Flickering effect */}
            <motion.div
              className="absolute inset-0 bg-white"
              animate={{
                opacity: [0, 0.1, 0, 0.05, 0, 0.15, 0],
              }}
              transition={{
                duration: 0.2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />

            {/* Channel change flash */}
            <motion.div
              className="absolute inset-0 bg-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.8, 0] }}
              transition={{ duration: 0.3, times: [0, 0.1, 1] }}
            />

            {/* Distortion bars */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute left-0 right-0 bg-white/20"
                style={{
                  height: "2px",
                  top: `${20 + i * 15}%`,
                }}
                animate={{
                  scaleX: [1, 0.8, 1.2, 1],
                  x: [0, -10, 10, 0],
                }}
                transition={{
                  duration: 0.3,
                  delay: i * 0.05,
                  repeat: Number.POSITIVE_INFINITY,
                }}
              />
            ))}
          </div>

          {/* TV Frame Effect */}
          <div className="absolute inset-0 border-8 border-gray-800 rounded-lg shadow-2xl" />

          {/* Screen curvature effect */}
          <div
            className="absolute inset-4 rounded-lg"
            style={{
              background: "radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.3) 100%)",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
