"use client"

import { motion } from "framer-motion"
import { useEffect, useState, useMemo } from "react"

export function CyberpunkBackground() {
  const [windowDimensions, setWindowDimensions] = useState({ width: 1920, height: 1080 })
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)

    if (typeof window !== "undefined") {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })

      const handleResize = () => {
        setWindowDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        })
      }

      window.addEventListener("resize", handleResize)
      return () => window.removeEventListener("resize", handleResize)
    }
  }, [])

  // Memoize particles to prevent recreation on every render
  const particles = useMemo(() => {
    return Array.from({ length: 2 }, (_, i) => ({
      id: i,
      initialX: Math.random() * windowDimensions.width,
      initialY: Math.random() * windowDimensions.height,
      duration: Math.random() * 30 + 30, // Slower animations
      delay: Math.random() * 15,
    }))
  }, [windowDimensions.width, windowDimensions.height])

  if (!isClient) {
    return null // Return null on server-side to prevent hydration mismatch
  }

  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>

      {/* Static background pattern instead of video */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="absolute inset-0 bg-repeat opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Subtle TV Scanlines */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[size:100%_4px]"></div>
      </div>

      {/* Reduced Moving Scanlines - Only 2 instead of 3 */}
      {/* Note: disabled due to performance concerns }
      {[...Array(2)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-[0.08]"
          animate={{
            top: ["0%", "100%"],
            opacity: [0.03, 0.12, 0.02, 0.1, 0.05],
            scaleX: [0.7, 1.2, 0.8, 1.1, 0.9],
          }}
          transition={{
            duration: 8 + Math.random() * 6, // Even slower animations
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
            delay: i * 4 + Math.random() * 5,
          }}
        />
      ))}
      {*/}

      {/* Simplified Glitch Interference Lines */}
      {/* Note: disabled due to performance concerns }
      <motion.div
        className="absolute inset-0 opacity-[0.015]"
        animate={{
          transform: ["translateX(0px)", "translateX(4px)", "translateX(-2px)", "translateX(1px)", "translateX(0px)"],
        }}
        transition={{
          duration: 0.3,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
          repeatDelay: 2, // Add delay between glitches
        }}
      >
        <div className="absolute top-[30%] left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/08 to-transparent"></div>
        <div className="absolute top-[60%] left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/06 to-transparent"></div>
      </motion.div>
      {*/}

      {/* Reduced Random Glitch Blocks */}
      {/* Note: disabled due to performance concerns }
      <motion.div
        className="absolute top-[20%] right-[25%] w-2 h-2 bg-purple-500/3"
        animate={{
          opacity: [0, 0.08, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 0.2,
          repeat: Number.POSITIVE_INFINITY,
          repeatDelay: 12, // Much longer delay
        }}
      />
      {*/}

      {/* Reduced Floating particles - Only 2 instead of 4 */}
      {/* Note: disabled due to performance concerns }
      <div className="absolute inset-0">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-1 h-1 bg-purple-400 rounded-full opacity-[0.05]"
            animate={{
              y: [particle.initialY, -20],
              x: [particle.initialX, particle.initialX + Math.random() * 60 - 30],
              opacity: [0, 0.08, 0],
            }}
            transition={{
              duration: particle.duration,
              repeat: Number.POSITIVE_INFINITY,
              delay: particle.delay,
            }}
            style={{
              left: particle.initialX,
              top: particle.initialY,
            }}
          />
        ))}
      </div>
      {*/}

      {/* Simplified TV Signal Distortion */}
      {/* Note: disabled due to performance concerns }
      <motion.div
        className="absolute inset-0 opacity-[0.008]"
        animate={{
          opacity: [0.003, 0.015, 0.003],
          transform: ["scaleX(1)", "scaleX(1.001)", "scaleX(1)"],
        }}
        transition={{
          duration: 6,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      >
        <div className="absolute inset-0 w-full h-full bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,rgba(255,255,255,0.04)_2px,rgba(255,255,255,0.04)_4px)]"></div>
      </motion.div>
      {*/}
    </div>
  )
}
