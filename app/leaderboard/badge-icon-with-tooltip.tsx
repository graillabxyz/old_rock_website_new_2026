"use client"

import { useState, useEffect, useRef } from "react"
import { Badge as BadgeType } from "@/lib/badge-utils"
import { Award } from "lucide-react"
import { createPortal } from "react-dom"

export default function BadgeIconWithTooltip({ badge }: { badge: BadgeType }) {
  const [showCustomTooltip, setShowCustomTooltip] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })
  const badgeRef = useRef<HTMLDivElement>(null)

  // Systemic Animation Mapping
  const getDnaConfig = (badge: BadgeType) => {
    if (!badge.unlocked) return { dna: "", color: "rgba(75, 85, 99, 0.5)" }

    let dna = ""
    let color = badge.rockColor || "#ffffff"

    switch (badge.category) {
      case "Density":
        dna = "dna-density"
        color = "#A855F7" // Density purple
        break
      case "Rock Ownership":
        dna = "dna-ownership"
        color = "#60A5FA" // Ownership blue
        break
      case "Goliath Ownership":
      case "Goliath Density":
        dna = "dna-goliath"
        color = "#F97316" // Goliath orange
        break
      case "Rock Reactive":
        dna = "dna-reactive"
        break
      case "Rock Density":
        dna = "dna-density"
        break
      case "Rock Color":
        dna = "dna-ownership"
        break
      default:
        if (badge.id?.startsWith("mystic-")) {
          dna = "dna-reactive"
          color = "#ffffff"
        }
    }

    return { dna, color }
  }

  const { dna, color } = getDnaConfig(badge)
  const tierClass = badge.tier ? `tier-${badge.tier}` : "tier-1"
  const isSpecial = dna !== "" && badge.unlocked

  const updateTooltipPosition = () => {
    if (badgeRef.current) {
      const rect = badgeRef.current.getBoundingClientRect()
      setTooltipPosition({
        top: rect.top - 8,
        left: rect.left + rect.width / 2
      })
    }
  }

  useEffect(() => {
    if (showCustomTooltip) {
      updateTooltipPosition()
      window.addEventListener('scroll', updateTooltipPosition, true)
      window.addEventListener('resize', updateTooltipPosition)
      return () => {
        window.removeEventListener('scroll', updateTooltipPosition, true)
        window.removeEventListener('resize', updateTooltipPosition)
      }
    }
  }, [showCustomTooltip])

  return (
    <>
      <div
        ref={badgeRef}
        className="relative w-8 h-8 flex items-center justify-center rounded-lg bg-gray-800/80 border border-gray-700 cursor-help overflow-visible backdrop-blur-sm"
        onMouseEnter={() => {
          setShowCustomTooltip(true)
          updateTooltipPosition()
        }}
        onMouseLeave={() => setShowCustomTooltip(false)}
      >
        {/* DNA Animation Layers */}
        {isSpecial && (
          <div
            className="absolute inset-0 z-0 overflow-hidden rounded-lg pointer-events-none"
            style={{ "--badge-color": color } as any}
          >
            {/* Base DNA Layer */}
            <div className={`absolute inset-0 ${dna} ${tierClass}`} />

            {/* Evolution: Tier 3+ adds complexity */}
            {(badge.tier ?? 0) >= 3 && (
              <div className={`absolute inset-0 ${dna} ${tierClass} opacity-50`} style={{ animationDelay: '-1s', filter: 'blur(4px)' }} />
            )}

            {/* Evolution: Tier 4+ adds energy rings */}
            {(badge.tier ?? 0) >= 4 && dna === "dna-goliath" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`w-full h-full dna-goliath-ring ${tierClass}`} />
                <div className={`w-full h-full dna-goliath-ring ${tierClass}`} style={{ animationDelay: '1.5s' }} />
              </div>
            )}

            {/* Evolution: Tier 5 (Singularity/Tri-Reactive) adds a core pulse */}
            {(badge.tier ?? 0) >= 5 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_10px_white] animate-pulse" />
              </div>
            )}
          </div>
        )}

        {/* Icon Layer */}
        <div className={`relative z-10 flex items-center justify-center ${!badge.unlocked ? "opacity-30 grayscale" : ""}`}>
          {badge.icon ? (
            <img
              src={`/images/badges/${badge.icon}.svg`}
              alt={badge.name}
              className="w-5 h-5 drop-shadow-[0_0_3px_rgba(0,0,0,0.5)]"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                const fallback = target.nextElementSibling as HTMLElement
                if (fallback) fallback.style.display = 'flex'
              }}
            />
          ) : (
            <Award className="w-5 h-5 text-gray-400" />
          )}
          <Award className="w-5 h-5 text-gray-400 hidden" />
        </div>
      </div>

      {showCustomTooltip && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className="bg-gray-900/95 border border-purple-500/50 rounded-lg p-3 shadow-2xl backdrop-blur-md min-w-[180px] mb-2 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center space-x-2 mb-1">
              <div
                className={`w-2 h-2 rounded-full ${isSpecial ? "animate-pulse" : ""}`}
                style={{ backgroundColor: color }}
              />
              <span className="font-bold text-white text-sm font-montserrat">{badge.name}</span>
            </div>
            {badge.description && (
              <p className="text-gray-400 text-xs font-pt-mono leading-relaxed">{badge.description}</p>
            )}
            {!badge.unlocked && (
              <div className="mt-2 text-[10px] font-bold text-red-400 uppercase tracking-tighter">
                Locked
              </div>
            )}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-8 border-transparent border-t-gray-900/95" />
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
