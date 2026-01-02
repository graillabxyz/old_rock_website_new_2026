"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, ChevronUp, Award, ChevronDown as ScrollIndicator } from "lucide-react"
import { Badge, getBestBadges } from "@/lib/badge-utils"

interface BadgeDisplayProps {
  badges: Badge[]
}

export function BadgeDisplay({ badges }: BadgeDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showScrollIndicator, setShowScrollIndicator] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)
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

    // Reset scroll state when expanded
    setHasScrolled(false)
    setShowScrollIndicator(false)

    // Show scroll indicator after delay if user hasn't scrolled
    scrollIndicatorTimeoutRef.current = setTimeout(() => {
      if (!hasScrolled && scrollContainerRef.current) {
        const container = scrollContainerRef.current
        // Only show if content is scrollable
        if (container.scrollHeight > container.clientHeight) {
          setShowScrollIndicator(true)
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
  }, [isExpanded, hasScrolled])
  
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
    <div ref={containerRef} className="flex flex-col gap-4 relative">
      {/* Best 4 Badges - Always Visible */}
      <div className="flex items-center gap-4 flex-wrap">
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
            className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors text-sm font-pt-mono"
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

      {/* Expanded View - Inline but overlays content below */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="relative"
          >
            <div className="pt-4 border-t border-gray-800 relative z-20 bg-gray-900/95 backdrop-blur-sm rounded-lg border border-gray-700/50 shadow-2xl mt-2 p-4">
              <div 
                ref={scrollContainerRef}
                className="max-h-96 overflow-y-auto space-y-6 pr-2 scrollbar-hide"
              >
                {Object.entries(badgesByCategory).map(([category, categoryBadges]) => {
                  // Sort badges by tier (highest first), then by unlocked status
                  const sortedBadges = [...categoryBadges].sort((a, b) => {
                    const tierDiff = (b.tier || 0) - (a.tier || 0)
                    if (tierDiff !== 0) return tierDiff
                    return a.unlocked === b.unlocked ? 0 : a.unlocked ? -1 : 1
                  })
                  
                  return (
                    <div key={category} className="space-y-2 relative">
                      <h4 className="text-xs font-pt-mono font-bold text-gray-500 uppercase tracking-wider">
                        {category}
                      </h4>
                      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4">
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
  
  return (
    <div
      className={`relative ${sizeClasses} ${opacity} transition-opacity group cursor-help flex-shrink-0`}
      onMouseEnter={() => setShowCustomTooltip(true)}
      onMouseLeave={() => setShowCustomTooltip(false)}
      title={!showCustomTooltip ? `${badge.name}${badge.description ? ` - ${badge.description}` : ""}` : undefined}
      aria-label={`${badge.name}${badge.description ? ` - ${badge.description}` : ""}`}
    >
      {/* Badge Icon Placeholder - White icon */}
      <div className="w-full h-full rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center">
        <Award className="w-6 h-6 text-white" />
      </div>
      
      {/* Unlocked indicator */}
      {badge.unlocked && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black" />
      )}
      
      {/* Custom tooltip on hover - only show if custom tooltip is working */}
      {showCustomTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-[9999] pointer-events-none">
          <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap border border-gray-700 shadow-lg">
            <div className="font-semibold">{badge.name}</div>
            {badge.description && (
              <div className="text-gray-400 text-xs mt-0.5">{badge.description}</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

