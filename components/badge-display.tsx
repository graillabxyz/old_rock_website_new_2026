"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, ChevronUp, ChevronDown as ScrollIndicator } from "lucide-react"
import { Badge, getBestBadges } from "@/lib/badge-utils"
import BadgeIconWithTooltip from "@/components/badge-icon-with-tooltip"

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
            <BadgeIconWithTooltip
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
                      <h4 className="text-xs font-pt-mono font-bold text-gray-500 uppercase tracking-wider relative z-10">
                        {category}
                      </h4>
                      <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-4" style={{ overflow: 'visible' }}>
                        {sortedBadges.map((badge) => (
                          <div key={badge.id} className="relative flex items-center justify-center" style={{ overflow: 'visible', minWidth: '40px', minHeight: '40px' }}>
                            <BadgeIconWithTooltip
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
