"use client"

import { useRef, useEffect, useState } from "react"
import { useScroll, useTransform } from "framer-motion"

export function useParallax() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Mark as loaded after a short delay to ensure DOM is ready
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  })

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "200%"])

  return {
    containerRef,
    backgroundY: isLoaded ? backgroundY : "0%",
    textY: isLoaded ? textY : "0%",
    scrollYProgress,
    isLoaded,
  }
}
