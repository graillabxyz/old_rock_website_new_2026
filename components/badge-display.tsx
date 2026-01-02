"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, ChevronUp, Award } from "lucide-react"
import { Badge, getBestBadges } from "@/lib/badge-utils"

interface BadgeDisplayProps {
  badges: Badge[]
}

export function BadgeDisplay({ badges }: BadgeDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
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
    <div className="flex flex-col gap-4">
      {/* Best 4 Badges - Always Visible */}
      <div className="flex items-center gap-3 flex-wrap">
        {bestBadges.map((badge) => (
          <BadgeIcon
            key={badge.id}
            badge={badge}
            size="md"
          />
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

      {/* Expanded View */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4 border-t border-gray-800 space-y-6">
              {Object.entries(badgesByCategory).map(([category, categoryBadges]) => (
                <div key={category} className="space-y-2">
                  <h4 className="text-xs font-pt-mono font-bold text-gray-500 uppercase tracking-wider">
                    {category}
                  </h4>
                  <div className="flex items-center gap-3 flex-wrap">
                    {categoryBadges.map((badge) => (
                      <BadgeIcon
                        key={badge.id}
                        badge={badge}
                        size="sm"
                      />
                    ))}
                  </div>
                </div>
              ))}
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
  
  return (
    <div
      className={`relative ${sizeClasses} ${opacity} transition-opacity group cursor-help`}
      title={`${badge.name}${badge.description ? ` - ${badge.description}` : ""}`}
    >
      {/* Badge Icon Placeholder - White icon */}
      <div className="w-full h-full rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center">
        <Award className="w-6 h-6 text-white" />
      </div>
      
      {/* Unlocked indicator */}
      {badge.unlocked && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black" />
      )}
      
      {/* Tooltip on hover */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-50">
        <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap border border-gray-700">
          <div className="font-semibold">{badge.name}</div>
          {badge.description && (
            <div className="text-gray-400 text-xs mt-0.5">{badge.description}</div>
          )}
        </div>
      </div>
    </div>
  )
}

