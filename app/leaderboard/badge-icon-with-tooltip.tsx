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
    if (!badge.unlocked) return { dna: "", color: "rgba(75, 85, 99, 0.5)", subType: "" }

    let dna = ""
    let color = badge.rockColor || "#ffffff"
    let subType = ""

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
        if (badge.id.includes("pure-reactor")) {
          subType = "pure"
        } else if (badge.id.includes("recurrent-reactor")) {
          subType = "recurrent"
        } else if (badge.id.includes("polar-reactor")) {
          subType = "polar"
        } else if (badge.id.includes("tri-reactive")) {
          subType = "tri"
        }
        break
      case "Rock Density":
        dna = "dna-density"
        if (badge.id.includes("full-spectrum-core")) {
          subType = "spectrum"
        }
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

    return { dna, color, subType }
  }

  const { dna, color, subType } = getDnaConfig(badge)
  const tierClass = badge.tier ? `tier-${badge.tier}` : "tier-1"
  const isSpecial = dna !== "" && badge.unlocked

  // Extract count from badge description for count-based animations
  const getCount = () => {
    if (badge.category === "Goliath Ownership") {
      if (badge.id.includes("first-goliath")) return 1
      if (badge.id.includes("goliath-guardian")) return 3
      if (badge.id.includes("titan-host")) return 5
      if (badge.id.includes("legion-holder")) return 10
    }
    if (badge.category === "Rock Density") {
      if (badge.id.includes("low-density-core")) return 1
      if (badge.id.includes("medium-density-core")) return 2
      if (badge.id.includes("high-density-core")) return 3
    }
    if (badge.category === "Rock Ownership") {
      if (badge.id.includes("pebble-keeper")) return 1
      if (badge.id.includes("stonebound")) return 3
      if (badge.id.includes("rock-collective")) return 5
      if (badge.id.includes("lithic-council")) return 10
    }
    return 1
  }

  const count = getCount()

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
            className="absolute inset-0 z-0 overflow-visible rounded-lg pointer-events-none"
            style={{ "--badge-color": color } as any}
          >
            {/* 1. Specific Reactive Overrides */}
            {subType === "pure" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  viewBox="0 0 100 100"
                  className="w-[130%] h-[130%] opacity-70 animate-pulse"
                  style={{ overflow: 'visible' }}
                >
                  <polygon
                    points="50,5 95,38 78,92 22,92 5,38"
                    fill="none"
                    stroke={color}
                    strokeWidth="4"
                    strokeLinejoin="round"
                    style={{ animation: 'hive-pulse 4s infinite ease-in-out' }}
                  />
                </svg>
              </div>
            )}

            {subType === "recurrent" && (
              <div className="absolute inset-0">
                {[
                  { x: '20%', y: '30%', s: '4px', d: '0s', dur: '2s' },
                  { x: '70%', y: '20%', s: '3px', d: '0.5s', dur: '1.5s' },
                  { x: '40%', y: '70%', s: '5px', d: '1s', dur: '2.5s' },
                  { x: '80%', y: '60%', s: '2px', d: '1.5s', dur: '1.2s' },
                  { x: '10%', y: '80%', s: '3px', d: '0.2s', dur: '1.8s' },
                ].map((dot, i) => (
                  <div
                    key={i}
                    className="flux-dot"
                    style={{
                      '--x': dot.x,
                      '--y': dot.y,
                      '--size': dot.s,
                      '--delay': dot.d,
                      '--duration': dot.dur,
                      '--dot-scale': 1.2,
                      '--dot-opacity': 0.6
                    } as any}
                  />
                ))}
              </div>
            )}

            {subType === "tri" && (
              <div className="absolute inset-0 flex items-center justify-center">
                {Array.from({ length: 20 }).map((_, i) => {
                  const angle = (360 / 20) * i
                  const distance = 20
                  const startX = Math.cos((angle * Math.PI) / 180) * distance
                  const startY = Math.sin((angle * Math.PI) / 180) * distance
                  return (
                    <div
                      key={i}
                      className="tri-particle"
                      style={{
                        '--start-x': `${startX}px`,
                        '--start-y': `${startY}px`,
                        '--delay': `${i * 0.1}s`,
                        '--duration': '2s'
                      } as any}
                    />
                  )
                })}
              </div>
            )}

            {subType === "polar" && (
              <div className="absolute inset-0 flex items-center justify-center">
                {(color.toUpperCase() === "#F8F8FF" || color.toUpperCase() === "#FFFFFF") ? (
                  /* White Polar: Rising Embers Fire Animation */
                  <div className="absolute inset-0">
                    <div className="fire-core" />
                    {Array.from({ length: 8 }).map((_, i) => {
                      const duration = 2 + Math.random() * 2
                      const delay = Math.random() * -4
                      const startX = (Math.random() - 0.5) * 15 // Float within bounds
                      const sway = (Math.random() - 0.5) * 10
                      return (
                        <div
                          key={i}
                          className="fire-ember"
                          style={{
                            '--duration': `${duration}s`,
                            '--delay': `${delay}s`,
                            '--start-x': `${startX}px`,
                            '--sway': `${sway}px`
                          } as any}
                        />
                      )
                    })}
                  </div>
                ) : (color.toUpperCase() === "#000000" || color.toUpperCase() === "#000") ? (
                  /* Black Polar: Black Hole Animation */
                  <div className="relative w-full h-full flex items-center justify-center">
                    <div className="absolute w-6 h-6 void-disk" />
                    <div className="absolute w-8 h-8 void-disk" style={{ animationDelay: '-1.5s', opacity: 0.3 }} />
                    <div className="w-3 h-3 void-core z-10" />
                  </div>
                ) : (
                  /* Fallback for other Polar colors: default spin */
                  <div className={`absolute inset-0 ${dna} ${tierClass}`} />
                )}
              </div>
            )}

            {subType === "spectrum" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="spectrum-triangle spectrum-triangle-1" />
                <div className="spectrum-triangle spectrum-triangle-2" />
                <div className="spectrum-triangle spectrum-triangle-3" />
              </div>
            )}

            {/* 2. Goliath Count-Based Squares */}
            {dna === "dna-goliath" && (
              <div className="absolute inset-0 flex items-center justify-center">
                {Array.from({ length: Math.min(count, 10) }).map((_, i) => {
                  const angle = (360 / Math.min(count, 10)) * i
                  const radius = count === 1 ? 0 : 12
                  const x = Math.cos((angle * Math.PI) / 180) * radius
                  const y = Math.sin((angle * Math.PI) / 180) * radius
                  const size = count === 1 ? 16 : 8
                  return (
                    <div
                      key={i}
                      className="goliath-square"
                      style={{
                        left: `calc(50% + ${x}px)`,
                        top: `calc(50% + ${y}px)`,
                        width: `${size}px`,
                        height: `${size}px`,
                        '--delay': `${i * 0.2}s`
                      } as any}
                    />
                  )
                })}
              </div>
            )}

            {/* 3. Density Count-Based Circles */}
            {(badge.category === "Rock Density" && badge.id.includes("-density-core")) && (
              <div className="absolute inset-0 flex items-center justify-center">
                {Array.from({ length: count }).map((_, i) => (
                  <div
                    key={i}
                    className="density-circle"
                    style={{
                      width: '80%',
                      height: '80%',
                      '--delay': `${i * 0.8}s`
                    } as any}
                  />
                ))}
              </div>
            )}

            {/* 4. Rock Ownership Orbital Nodes */}
            {badge.category === "Rock Ownership" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="ownership-core" />
                {Array.from({ length: count }).map((_, i) => {
                  const orbitDuration = 4 - (count * 0.2) // Faster with more nodes
                  return (
                    <div
                      key={i}
                      className="ownership-node"
                      style={{
                        '--delay': `${-(i * (orbitDuration / count))}s`,
                        '--orbit-duration': `${orbitDuration}s`
                      } as any}
                    />
                  )
                })}
              </div>
            )}

            {/* 5. $DENSITY Category Tier-Specific Animations */}
            {badge.category === "Density" && badge.tier && (
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Tier 1: Dust Holder - Single spiral arm */}
                {badge.tier === 1 && (
                  <div className="density-vortex">
                    <div
                      className="density-dust"
                      style={{
                        '--delay': '0s'
                      } as any}
                    />
                  </div>
                )}

                {/* Tier 2: Weight Bearer - Dual spiral arms */}
                {badge.tier === 2 && (
                  <div className="density-vortex">
                    {[0, 1].map((i) => (
                      <div
                        key={i}
                        className="density-weight-arm"
                        style={{
                          transform: `rotate(${i * 180}deg)`,
                          '--delay': `${i * 1}s`
                        } as any}
                      />
                    ))}
                  </div>
                )}

                {/* Tier 3: Mass Builder - 3 vortex arms */}
                {badge.tier === 3 && (
                  <div className="density-vortex">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="vortex-arm"
                        style={{
                          '--rotation-offset': `${i * (360 / 3)}deg`
                        } as any}
                      />
                    ))}
                  </div>
                )}

                {/* Tier 4: Gravity Well - 5 vortex arms */}
                {badge.tier === 4 && (
                  <div className="density-vortex">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="vortex-arm"
                        style={{
                          '--rotation-offset': `${i * (360 / 5)}deg`
                        } as any}
                      />
                    ))}
                  </div>
                )}

                {/* Tier 5: Singularity - 11 vortex arms */}
                {badge.tier === 5 && (
                  <>
                    <div className="singularity-core" />
                    <div className="density-vortex">
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                        <div
                          key={i}
                          className="vortex-arm"
                          style={{
                            '--rotation-offset': `${i * (360 / 11)}deg`
                          } as any}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* 6. Standard DNA Layer (if not specifically overridden) */}
            {(!subType && dna !== "dna-goliath" && !(badge.category === "Rock Density" && badge.id.includes("-density-core")) && badge.category !== "Rock Ownership" && badge.category !== "Density") && (
              <div className={`absolute inset-0 ${dna} ${tierClass}`} />
            )}

            {/* 5. Global Evolution: Tier 3+ adds complexity (only for non-count-based) */}
            {(badge.tier ?? 0) >= 3 && !subType && dna !== "dna-goliath" && !(badge.category === "Rock Density") && (
              <div className={`absolute inset-0 ${dna} ${tierClass} opacity-50`} style={{ animationDelay: '-1s', filter: 'blur(4px)' }} />
            )}

            {/* 7. Global Evolution: Tier 5 adds a core singularity pulse */}
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
