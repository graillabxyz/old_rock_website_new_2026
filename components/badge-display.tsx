"use client"

import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, ChevronUp, Award, ChevronDown as ScrollIndicator } from "lucide-react"
import { Badge, getBestBadges } from "@/lib/badge-utils"

interface BadgeDisplayProps {
  badges: Badge[]
  onExpandedChange?: (isExpanded: boolean) => void
}

export function BadgeDisplay({ badges }: BadgeDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showScrollIndicator, setShowScrollIndicator] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)
  const [hasSeenScrollIndicator, setHasSeenScrollIndicator] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const scrollIndicatorTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isExpanded && containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsExpanded(false)
        setHasScrolled(false)
        setShowScrollIndicator(false)
      }
    }

    if (isExpanded) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isExpanded])

  // Handle scroll indicator
  useEffect(() => {
    if (!isExpanded) {
      setShowScrollIndicator(false)
      setHasScrolled(false)
      if (scrollIndicatorTimeoutRef.current) {
        clearTimeout(scrollIndicatorTimeoutRef.current)
      }
      return
    }

    // Reset scroll state when expanded (but keep hasSeenScrollIndicator)
    setHasScrolled(false)
    setShowScrollIndicator(false)

    // Check if user has already seen the indicator in this session
    if (hasSeenScrollIndicator) {
      return
    }

    // Show scroll indicator after delay if user hasn't scrolled
    scrollIndicatorTimeoutRef.current = setTimeout(() => {
      if (!hasScrolled && scrollContainerRef.current) {
        const container = scrollContainerRef.current
        // Only show if content is scrollable AND user is not at the bottom
        const isScrollable = container.scrollHeight > container.clientHeight
        const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 5 // 5px threshold
        
        if (isScrollable && !isAtBottom) {
          setShowScrollIndicator(true)
          setHasSeenScrollIndicator(true) // Mark as seen
        }
      }
    }, 2000) // 2 second delay

    // Handle scroll events
    const handleScroll = () => {
      setHasScrolled(true)
      setShowScrollIndicator(false)
      if (scrollIndicatorTimeoutRef.current) {
        clearTimeout(scrollIndicatorTimeoutRef.current)
      }
      
      // Check if user scrolled to bottom
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current
        const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 5
        if (isAtBottom) {
          setHasSeenScrollIndicator(true) // Mark as seen if they scrolled to bottom
        }
      }
    }

    const scrollContainer = scrollContainerRef.current
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll)
    }

    return () => {
      if (scrollIndicatorTimeoutRef.current) {
        clearTimeout(scrollIndicatorTimeoutRef.current)
      }
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll)
      }
    }
  }, [isExpanded, hasScrolled, hasSeenScrollIndicator])
  
  const bestBadges = getBestBadges(badges)
  
  // Deduplicate badges - prefer unlocked versions, but keep locked for progression display
  const uniqueBadges = new Map<string, Badge>()
  badges.forEach(badge => {
    const baseId = badge.id.replace("-locked", "")
    if (!uniqueBadges.has(baseId)) {
      uniqueBadges.set(baseId, badge)
    } else {
      // Keep unlocked version if available
      const existing = uniqueBadges.get(baseId)!
      if (badge.unlocked && !existing.unlocked) {
        uniqueBadges.set(baseId, badge)
      }
    }
  })
  
  // For expanded view, show all unique badges (unlocked preferred, but show locked if that's all we have)
  const allBadgesForExpanded = Array.from(uniqueBadges.values())
  
  // Group badges by category for better organization
  const badgesByCategory = allBadgesForExpanded.reduce((acc, badge) => {
    if (!acc[badge.category]) {
      acc[badge.category] = []
    }
    acc[badge.category].push(badge)
    return acc
  }, {} as Record<string, Badge[]>)

  return (
    <div ref={containerRef} className="flex flex-col gap-4 relative" style={{ zIndex: 1 }}>
      {/* Best 4 Badges - Always Visible */}
      <div className="flex items-center gap-4 flex-wrap relative z-40">
        {bestBadges.map((badge) => (
          <div key={badge.id} className="flex-shrink-0">
            <BadgeIcon
              badge={badge}
              size="md"
            />
          </div>
        ))}
        
        {/* Expand Button */}
        {allBadgesForExpanded.length > 4 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors text-sm font-pt-mono relative z-40"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                <span>Show Less</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                <span>View All ({allBadgesForExpanded.length})</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Expanded View - Inline expansion below badges */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="relative w-full mt-4"
            style={{ overflow: 'visible' }}
          >
            <div 
              className="pt-4 border-t border-gray-800 relative"
              style={{ 
                width: '100%',
                overflow: 'visible'
              }}
            >
              <div 
                ref={scrollContainerRef}
                className="space-y-6 pr-2 scrollbar-hide"
                style={{ 
                  maxHeight: '350px',
                  overflowY: 'auto',
                  overflowX: 'visible'
                }}
              >
                {Object.entries(badgesByCategory).map(([category, categoryBadges]) => {
                  // Sort badges by tier (highest first), then by unlocked status
                  const sortedBadges = [...categoryBadges].sort((a, b) => {
                    const tierDiff = (b.tier || 0) - (a.tier || 0)
                    if (tierDiff !== 0) return tierDiff
                    return a.unlocked === b.unlocked ? 0 : a.unlocked ? -1 : 1
                  })
                  
                  return (
                    <div key={category} className="space-y-2 relative" style={{ overflow: 'visible' }}>
                      <h4 className="text-xs font-pt-mono font-bold text-gray-500 uppercase tracking-wider">
                        {category}
                      </h4>
                      <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-4" style={{ overflow: 'visible' }}>
                        {sortedBadges.map((badge) => (
                          <div key={badge.id} className="relative flex items-center justify-center" style={{ overflow: 'visible', minWidth: '40px', minHeight: '40px' }}>
                            <BadgeIcon
                              badge={badge}
                              size="sm"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
              
              {/* Scroll Indicator */}
              <AnimatePresence>
                {showScrollIndicator && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute bottom-4 left-1/2 transform -translate-x-1/2 pointer-events-none z-30"
                  >
                    <motion.div
                      animate={{ y: [0, 8, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      className="flex flex-col items-center gap-1"
                    >
                      <span className="text-xs text-gray-400 font-pt-mono">Scroll for more</span>
                      <ScrollIndicator className="w-5 h-5 text-gray-400" />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface BadgeIconProps {
  badge: Badge
  size?: "sm" | "md"
}

function BadgeIcon({ badge, size = "md" }: BadgeIconProps) {
  const sizeClasses = size === "md" ? "w-12 h-12" : "w-10 h-10"
  const opacity = badge.unlocked ? "opacity-100" : "opacity-30"
  const [showCustomTooltip, setShowCustomTooltip] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })
  const badgeRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  
  // Check for special badges that need animations
  const isPureBadge = badge.id === "rock-pure-reactor" && badge.unlocked
  const isPolarBadge = badge.id === "rock-polar-reactor" && badge.unlocked
  const isRecurrentBadge = badge.id === "rock-recurrent-reactor" && badge.unlocked
  const isSingularityBadge = badge.id === "density-singularity" && badge.unlocked
  
  // Get rock color for reactive badges (convert hex to rgba)
  const getRockColorRgba = (hex: string, opacity: number) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${opacity})`
  }
  
  const pureColor = badge.rockColor || "#F8F8FF"
  const polarColor = badge.rockColor || "#0F52BA"
  const recurrentColor = badge.rockColor || "#E0115F"
  
  const updateTooltipPosition = () => {
    if (badgeRef.current) {
      const rect = badgeRef.current.getBoundingClientRect()
      setTooltipPosition({
        top: rect.top - 8, // Position above the badge
        left: rect.left + rect.width / 2 // Center horizontally
      })
    }
  }
  
  useEffect(() => {
    if (showCustomTooltip) {
      updateTooltipPosition()
      const handleScroll = () => updateTooltipPosition()
      const handleResize = () => updateTooltipPosition()
      
      window.addEventListener('scroll', handleScroll, true)
      window.addEventListener('resize', handleResize)
      
      return () => {
        window.removeEventListener('scroll', handleScroll, true)
        window.removeEventListener('resize', handleResize)
      }
    }
  }, [showCustomTooltip])
  
  return (
    <>
      <div
        ref={badgeRef}
        className={`relative ${sizeClasses} ${opacity} transition-opacity group cursor-help flex-shrink-0`}
        onMouseEnter={() => {
          setShowCustomTooltip(true)
          updateTooltipPosition()
        }}
        onMouseLeave={() => setShowCustomTooltip(false)}
        title={!showCustomTooltip ? `${badge.name}${badge.description ? ` - ${badge.description}` : ""}` : undefined}
        aria-label={`${badge.name}${badge.description ? ` - ${badge.description}` : ""}`}
      >
        {/* Badge Icon Placeholder - White icon with semi-transparent background to show animations */}
        <div className="relative w-full h-full rounded-lg bg-gray-800/80 border border-gray-700 flex items-center justify-center z-10 backdrop-blur-sm">
          <Award className="w-6 h-6 text-white z-20 relative" />
        </div>
        
        {/* Animation backgrounds for special badges - Behind the icon but visible */}
        {/* Pure badge - Uses actual rock color with hexagon shape */}
        {isPureBadge && (
          <motion.div
            className="absolute inset-0 z-0"
            style={{
              clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
              background: `radial-gradient(circle, ${getRockColorRgba(pureColor, 0.6)} 0%, ${getRockColorRgba(pureColor, 0.2)} 50%, transparent 80%)`,
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 0.9, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}
        
        {/* Polar badge - Uses actual rock color with elliptical shape */}
        {isPolarBadge && (
          <motion.div
            className="absolute inset-0 rounded-lg z-0"
            style={{
              background: `radial-gradient(ellipse at center, ${getRockColorRgba(polarColor, 0.6)} 0%, ${getRockColorRgba(polarColor, 0.2)} 50%, transparent 80%)`,
            }}
            animate={{
              scaleX: [1, 1.4, 1],
              scaleY: [1, 1.2, 1],
              opacity: [0.5, 0.9, 0.5],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}
        
        {/* Recurrent badge - Uses actual rock color with sparkle effect */}
        {isRecurrentBadge && (
          <>
            <motion.div
              className="absolute inset-0 rounded-lg overflow-hidden z-0"
              style={{
                background: `radial-gradient(circle, ${getRockColorRgba(recurrentColor, 0.4)} 0%, transparent 70%)`,
              }}
            />
            {/* Sparkle effect with actual rock color */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full z-0"
                style={{
                  backgroundColor: getRockColorRgba(recurrentColor, 1),
                  left: `${20 + (i * 15)}%`,
                  top: `${20 + (i % 3) * 30}%`,
                  boxShadow: `0 0 4px ${getRockColorRgba(recurrentColor, 0.8)}`,
                }}
                animate={{
                  scale: [0, 2, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.25,
                  ease: "easeInOut",
                }}
              />
            ))}
          </>
        )}
        
        {/* Singularity badge - Rotating conic gradient */}
        {isSingularityBadge && (
          <motion.div
            className="absolute inset-0 rounded-lg z-0"
            style={{
              background: "conic-gradient(from 0deg, rgba(139, 92, 246, 0.5), rgba(168, 85, 247, 0.7), rgba(139, 92, 246, 0.5))",
            }}
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        )}
        
        {/* Unlocked indicator */}
        {badge.unlocked && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black z-20" />
        )}
      </div>
      
      {/* Custom tooltip on hover - rendered via portal to escape container bounds */}
      {showCustomTooltip && typeof window !== 'undefined' && createPortal(
        <div 
          ref={tooltipRef}
          className="fixed z-[99999] pointer-events-none"
          style={{ 
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
            transform: 'translate(-50%, -100%)',
            marginBottom: '8px'
          }}
        >
          <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap border border-gray-700 shadow-lg">
            <div className="font-semibold">{badge.name}</div>
            {badge.description && (
              <div className="text-gray-400 text-xs mt-0.5">{badge.description}</div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

