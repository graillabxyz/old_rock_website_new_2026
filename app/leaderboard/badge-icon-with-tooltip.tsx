"use client"

import { useState, useEffect, useRef } from "react"
import { Badge as BadgeType } from "@/lib/badge-utils"
import { Award } from "lucide-react"
import { createPortal } from "react-dom"

export default function BadgeIconWithTooltip({ badge }: { badge: BadgeType }) {
  const [showCustomTooltip, setShowCustomTooltip] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })
  const badgeRef = useRef<HTMLDivElement>(null)

  // Check for special badges that need animations
  const isPureBadge = badge.id === "rock-pure-reactor" && badge.unlocked
  const isPolarBadge = badge.id === "rock-polar-reactor" && badge.unlocked
  const isRecurrentBadge = badge.id === "rock-recurrent-reactor" && badge.unlocked
  const isSingularityBadge = badge.id === "density-singularity" && badge.unlocked
  const isGravityWellBadge = badge.id === "density-gravity-well" && badge.unlocked
  const isHighDensityCoreBadge = badge.id === "rock-high-density-core" && badge.unlocked
  const highDensityColor = badge.rockColor || "#3B82F6"
  const isMediumDensityCoreBadge = badge.id === "rock-medium-density-core" && badge.unlocked
  const mediumDensityColor = badge.rockColor || "#FFB000"
  const isLowDensityCoreBadge = badge.id === "rock-low-density-core" && badge.unlocked
  const lowDensityColor = badge.rockColor || "#8B4513"
  const isFullSpectrumCoreBadge = badge.id === "rock-full-spectrum-core" && badge.unlocked
  const isLithicCouncilBadge = badge.id === "rock-lithic-council" && badge.unlocked
  const isTitanHostBadge = badge.id === "goliath-titan-host" && badge.unlocked
  const isFirstGoliathBadge = badge.id === "goliath-first-goliath" && badge.unlocked
  const isGoliathGuardianBadge = badge.id === "goliath-goliath-guardian" && badge.unlocked
  const isLegionHolderBadge = badge.id === "goliath-legion-holder" && badge.unlocked
  const isMysticBadge = badge.id?.startsWith("mystic-") && !badge.id.includes("-locked") && badge.unlocked
  const isMassBuilderBadge = badge.id === "density-mass-builder" && badge.unlocked
  const isWeightBearerBadge = badge.id === "density-weight-bearer" && badge.unlocked
  const isStoneboundBadge = badge.id === "rock-stonebound" && badge.unlocked
  const isRockCollectiveBadge = badge.id === "rock-collective" && badge.unlocked

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
        className="relative w-8 h-8 flex items-center justify-center rounded-lg bg-gray-800/80 border border-gray-700 cursor-help overflow-visible backdrop-blur-sm"
        onMouseEnter={() => {
          setShowCustomTooltip(true)
          updateTooltipPosition()
        }}
        onMouseLeave={() => setShowCustomTooltip(false)}
        title={!showCustomTooltip ? `${badge.name}${badge.description ? ` - ${badge.description}` : ""}` : undefined}
      >
        {/* Badge Icon Container - Background */}
        <div className="absolute inset-0 rounded-lg bg-gray-800/80 border border-gray-700 z-0 backdrop-blur-sm" />

        {/* Animation backgrounds for special badges - Between container and icon */}
        {/* Pure badge - Uses actual rock color with soft hexagon-like shape */}
        {isPureBadge && (
          <>
            {/* Main pulsing hexagon */}
            <div
              className="absolute inset-0 z-[5] rounded-lg pure-pulse"
              style={{
                background: `radial-gradient(ellipse 80% 100% at 50% 50%, ${getRockColorRgba(pureColor, 1)} 0%, ${getRockColorRgba(pureColor, 0.8)} 20%, ${getRockColorRgba(pureColor, 0.6)} 40%, ${getRockColorRgba(pureColor, 0.4)} 60%, ${getRockColorRgba(pureColor, 0.2)} 80%, transparent 100%)`,
                filter: 'blur(0.5px)',
              }}
            />
            {/* Additional soft layers */}
            {[...Array(3)].map((_, i) => {
              const angle = (i * 60) * (Math.PI / 180)
              const radius = 35
              return (
                <div
                  key={i}
                  className="absolute inset-0 z-[5] rounded-lg pure-pulse"
                  style={{
                    background: `radial-gradient(ellipse at ${50 + Math.cos(angle) * radius}% ${50 + Math.sin(angle) * radius}%, ${getRockColorRgba(pureColor, 0.6 - i * 0.15)} 0%, ${getRockColorRgba(pureColor, 0.4 - i * 0.1)} 50%, transparent 100%)`,
                    filter: 'blur(1px)',
                    animationDelay: `${i * 0.3}s`
                  }}
                />
              )
            })}
            {/* Secondary glow */}
            <div
              className="absolute inset-0 z-[4] rounded-lg pure-pulse delay-300"
              style={{
                background: `radial-gradient(circle, ${getRockColorRgba(pureColor, 0.5)} 0%, ${getRockColorRgba(pureColor, 0.3)} 40%, ${getRockColorRgba(pureColor, 0.1)} 70%, transparent 100%)`,
                filter: 'blur(3px)',
              }}
            />
          </>
        )}

        {/* Polar badge */}
        {isPolarBadge && (
          <>
            {polarColor === "#F8F8FF" || polarColor === "#FFFFFF" || polarColor.toLowerCase() === "#ffffff" || polarColor.toLowerCase() === "#f8f8ff" ? (
              // White Fire Effect
              <>
                <div
                  className="absolute inset-0 rounded-lg z-[5] animate-flicker"
                  style={{
                    background: `radial-gradient(ellipse at center bottom, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.7) 25%, rgba(255, 255, 255, 0.4) 50%, rgba(255, 255, 255, 0.2) 75%, transparent 100%)`,
                  }}
                />
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute bottom-0 z-[5] fire-flame"
                    style={{
                      left: `${20 + i * 15}%`,
                      width: '15%',
                      height: '60%',
                      background: `radial-gradient(ellipse at center top, rgba(255, 255, 255, 0.8) 0%, transparent 100%)`,
                      borderRadius: '50% 50% 0 0',
                      filter: 'blur(1px)',
                      animationDelay: `${i * 0.2}s`,
                      animationDuration: `${1 + i * 0.2}s`
                    }}
                  />
                ))}
              </>
            ) : polarColor === "#000000" || polarColor.toLowerCase() === "#000000" ? (
              // Black Hole Effect
              <>
                <div
                  className="absolute inset-0 rounded-lg z-[5] black-hole-pulse"
                  style={{
                    background: `radial-gradient(circle at center, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.8) 25%, rgba(0, 0, 0, 0.5) 50%, rgba(0, 0, 0, 0.2) 75%, transparent 100%)`,
                  }}
                />
                <div
                  className="absolute inset-0 rounded-lg z-[5] black-hole-spin"
                  style={{
                    background: `conic-gradient(from 0deg, transparent 0%, rgba(0, 0, 0, 0.8) 15%, rgba(0, 0, 0, 0.6) 30%, transparent 45%, rgba(0, 0, 0, 0.5) 60%, rgba(0, 0, 0, 0.3) 75%, transparent 90%, rgba(0, 0, 0, 0.2) 100%)`,
                  }}
                />
              </>
            ) : (
              // Default Polar
              <div
                className="absolute inset-0 rounded-lg z-[5] animate-pulse-scale"
                style={{
                  background: `radial-gradient(ellipse at center, ${getRockColorRgba(polarColor, 1)} 0%, ${getRockColorRgba(polarColor, 0.7)} 30%, ${getRockColorRgba(polarColor, 0.4)} 60%, ${getRockColorRgba(polarColor, 0.1)} 85%, transparent 100%)`,
                }}
              />
            )}
          </>
        )}

        {/* Recurrent badge */}
        {isRecurrentBadge && (
          <>
            <div
              className="absolute inset-0 rounded-lg z-[5] bg-opacity-80 animate-pulse-slow"
              style={{
                background: `radial-gradient(circle, ${getRockColorRgba(recurrentColor, 1)} 0%, ${getRockColorRgba(recurrentColor, 0.7)} 40%, ${getRockColorRgba(recurrentColor, 0.4)} 70%, transparent 100%)`,
              }}
            />
            {/* Sparkles */}
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute z-[5] recurrent-sparkle"
                style={{
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  background: 'white',
                  top: `${20 + Math.random() * 60}%`,
                  left: `${20 + Math.random() * 60}%`,
                  boxShadow: `0 0 4px ${getRockColorRgba(recurrentColor, 0.8)}`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              />
            ))}
          </>
        )}

        {/* Singularity badge */}
        {isSingularityBadge && (
          <>
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className="absolute inset-0 rounded-lg z-[5] singularity-ring"
                style={{
                  background: `radial-gradient(circle at ${50 + i * 10}% ${50 + i * 10}%, rgba(139, 92, 246, ${0.8 - i * 0.2}) 0%, transparent 70%)`,
                  animationDuration: `${8 + i * 2}s`,
                  animationDirection: i % 2 === 0 ? 'normal' : 'reverse'
                }}
              />
            ))}
            <div
              className="absolute inset-0 rounded-lg z-[5] singularity-core"
              style={{
                background: "radial-gradient(circle, rgba(139, 92, 246, 1) 0%, rgba(168, 85, 247, 0.7) 40%, transparent 100%)",
              }}
            />
          </>
        )}

        {/* Gravity Well badge */}
        {isGravityWellBadge && (
          <>
            <div
              className="absolute inset-0 rounded-lg z-[5] gravity-ring"
              style={{
                border: `2px dashed rgba(139, 92, 246, 0.6)`,
                borderRadius: '50%',
              }}
            />
            <div
              className="absolute inset-0 rounded-lg z-[5] gravity-ring delay-500"
              style={{
                border: `2px dashed rgba(139, 92, 246, 0.4)`,
                borderRadius: '50%',
              }}
            />
            <div
              className="absolute inset-0 rounded-lg z-[5] animate-pulse-slow"
              style={{
                background: "radial-gradient(circle, rgba(139, 92, 246, 1) 0%, rgba(168, 85, 247, 0.8) 40%, transparent 100%)",
              }}
            />
          </>
        )}

        {/* High Density Core badge */}
        {isHighDensityCoreBadge && (
          <>
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className="absolute inset-0 rounded-lg z-[5] density-ring"
                style={{
                  background: `radial-gradient(circle, transparent 45%, ${getRockColorRgba(highDensityColor, 0.5)} 50%, transparent 55%)`,
                  borderRadius: '50%',
                  animationDelay: `${i * 1}s`
                }}
              />
            ))}
            <div className="absolute inset-0 z-[5] animate-spin-slow">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full"
                  style={{
                    backgroundColor: highDensityColor,
                    transform: `rotate(${i * 120}deg) translate(25px) rotate(-${i * 120}deg)`,
                    boxShadow: `0 0 5px ${highDensityColor}`
                  }}
                />
              ))}
            </div>
            <div
              className="absolute inset-0 rounded-lg z-[5] density-core"
              style={{
                background: `radial-gradient(circle, ${getRockColorRgba(highDensityColor, 1)} 0%, ${getRockColorRgba(highDensityColor, 0.5)} 70%, transparent 100%)`,
              }}
            />
          </>
        )}

        {/* Low Density Core badge */}
        {isLowDensityCoreBadge && (
          <>
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className="absolute inset-0 rounded-lg z-[5] density-ring"
                style={{
                  background: `radial-gradient(circle, transparent 45%, ${getRockColorRgba(lowDensityColor, 0.5)} 50%, transparent 55%)`,
                  borderRadius: '50%',
                  animationDelay: `${i * 1.5}s`
                }}
              />
            ))}
            <div
              className="absolute inset-0 rounded-lg z-[5] density-core"
              style={{
                background: `radial-gradient(circle, ${getRockColorRgba(lowDensityColor, 1)} 0%, ${getRockColorRgba(lowDensityColor, 0.5)} 70%, transparent 100%)`,
              }}
            />
          </>
        )}

        {/* Medium Density Core badge */}
        {isMediumDensityCoreBadge && (
          <>
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className="absolute inset-0 rounded-lg z-[5] density-ring"
                style={{
                  background: `radial-gradient(circle, transparent 45%, ${getRockColorRgba(mediumDensityColor, 0.5)} 50%, transparent 55%)`,
                  borderRadius: '50%',
                  animationDelay: `${i * 1.2}s`
                }}
              />
            ))}
            <div className="absolute inset-0 z-[5] animate-spin-slow" style={{ animationDuration: '6s' }}>
              {[...Array(2)].map((_, i) => (
                <div
                  key={i}
                  className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full"
                  style={{
                    backgroundColor: mediumDensityColor,
                    transform: `rotate(${i * 180}deg) translate(22px) rotate(-${i * 180}deg)`,
                    boxShadow: `0 0 5px ${mediumDensityColor}`
                  }}
                />
              ))}
            </div>
            <div
              className="absolute inset-0 rounded-lg z-[5] density-core"
              style={{
                background: `radial-gradient(circle, ${getRockColorRgba(mediumDensityColor, 1)} 0%, ${getRockColorRgba(mediumDensityColor, 0.5)} 70%, transparent 100%)`,
              }}
            />
          </>
        )}

        {/* Full Spectrum Core badge */}
        {isFullSpectrumCoreBadge && (
          <>
            <div
              className="absolute inset-0 rounded-lg z-[5] rainbow-spin"
              style={{
                background: "radial-gradient(circle, transparent 38%, rgba(255, 0, 0, 0.3) 42%, rgba(255, 127, 0, 0.4) 45%, rgba(255, 255, 0, 0.5) 48%, rgba(0, 255, 0, 0.4) 51%, rgba(0, 0, 255, 0.3) 54%, rgba(75, 0, 130, 0.4) 57%, rgba(148, 0, 211, 0.3) 60%, transparent 63%)",
                filter: 'blur(2px)',
              }}
            />
            {/* Pulsing rainbow core */}
            <div
              className="absolute inset-0 rounded-lg z-[5] animate-pulse-opacity"
              style={{
                background: "radial-gradient(circle, rgba(255, 0, 0, 0.9) 0%, rgba(0, 255, 0, 0.6) 60%, rgba(0, 0, 255, 0.5) 80%, transparent 100%)",
              }}
            />
          </>
        )}

        {/* Lithic Council badge */}
        {isLithicCouncilBadge && (
          <>
            <div className="absolute inset-0 z-[5] lithic-spin">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="absolute top-1/2 left-1/2 w-1 h-1 rounded-full bg-yellow-400"
                  style={{
                    transform: `rotate(${i * 72}deg) translate(28px) rotate(-${i * 72}deg)`,
                    boxShadow: `0 0 4px gold`
                  }}
                />
              ))}
            </div>
            <div
              className="absolute inset-0 rounded-lg z-[5]"
              style={{
                background: "radial-gradient(circle, rgba(250, 204, 21, 0.8) 0%, rgba(234, 179, 8, 0.5) 50%, transparent 100%)",
              }}
            />
          </>
        )}
        {/* Titan Host Badge */}
        {isTitanHostBadge && (
          <>
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className="absolute inset-0 rounded-lg z-[5] density-ring"
                style={{
                  background: `radial-gradient(circle, transparent 45%, rgba(139, 92, 246, 0.5) 50%, transparent 55%)`,
                  borderRadius: '50%',
                  animationDelay: `${i * 1.5}s`
                }}
              />
            ))}
            <div
              className="absolute inset-0 rounded-lg z-[5] density-core"
              style={{
                background: "radial-gradient(circle, rgba(139, 92, 246, 1) 0%, rgba(124, 58, 237, 0.5) 70%, transparent 100%)",
              }}
            />
          </>
        )}

        {/* First Goliath Badge */}
        {isFirstGoliathBadge && (
          <>
            <div className="absolute inset-0 z-[5] animate-pulse-slow">
              <div className="absolute inset-0 rounded-lg border-2 border-red-500 opacity-50" />
            </div>
            <div
              className="absolute inset-0 rounded-lg z-[5]"
              style={{
                background: "radial-gradient(circle, rgba(239, 68, 68, 0.4) 0%, transparent 70%)"
              }}
            />
          </>
        )}

        {/* Goliath Guardian Badge */}
        {isGoliathGuardianBadge && (
          <>
            <div className="absolute inset-0 z-[5] animate-spin-slow">
              <div className="absolute inset-0 rounded-lg border border-blue-500 opacity-40 transform rotate-45" />
            </div>
            <div className="absolute inset-0 z-[5] animate-reverse-spin-slow">
              <div className="absolute inset-0 rounded-lg border border-blue-400 opacity-40 transform -rotate-45" />
            </div>
          </>
        )}

        {/* Legion Holder Badge */}
        {isLegionHolderBadge && (
          <>
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="absolute inset-0 z-[5] animate-spin-slow"
                style={{ animationDuration: `${4 + i}s`, animationDirection: i % 2 ? 'reverse' : 'normal' }}
              >
                <div
                  className="absolute top-0 left-1/2 w-1 h-1 bg-purple-400 rounded-full"
                  style={{ transform: 'translateX(-50%)' }}
                />
              </div>
            ))}
            <div
              className="absolute inset-0 rounded-lg z-[5] animate-pulse-opacity"
              style={{
                background: "radial-gradient(circle, rgba(168, 85, 247, 0.6) 0%, transparent 70%)",
              }}
            />
          </>
        )}

        {/* Mystic Badge */}
        {isMysticBadge && (
          <>
            <div
              className="absolute inset-0 rounded-lg z-[5] animate-pulse-slow"
              style={{
                background: "linear-gradient(45deg, rgba(236, 72, 153, 0.3), rgba(139, 92, 246, 0.3))",
                filter: 'blur(2px)'
              }}
            />
            <div className="absolute inset-0 z-[5] recurrent-sparkle">
              <div className="absolute top-1/2 left-1/2 w-full h-full transform -translate-x-1/2 -translate-y-1/2 bg-white opacity-10 blur-md rounded-full" />
            </div>
          </>
        )}

        {/* Mass Builder Badge */}
        {isMassBuilderBadge && (
          <div
            className="absolute inset-0 rounded-lg z-[5] density-core"
            style={{
              background: "radial-gradient(circle, rgba(34, 197, 94, 0.6) 0%, transparent 70%)",
            }}
          />
        )}

        {/* Weight Bearer Badge */}
        {isWeightBearerBadge && (
          <div
            className="absolute inset-0 rounded-lg z-[5] density-core"
            style={{
              background: "radial-gradient(circle, rgba(234, 179, 8, 0.6) 0%, transparent 70%)",
            }}
          />
        )}

        {/* Stonebound Badge */}
        {isStoneboundBadge && (
          <div
            className="absolute inset-0 rounded-lg z-[5] animate-pulse-slow border border-stone-500 opacity-50"
          />
        )}

        {/* Rock Collective Badge */}
        {isRockCollectiveBadge && (
          <>
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="absolute inset-0 z-[5] animate-spin-slow"
                style={{ animationDelay: `${i * 0.5}s` }}
              >
                <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-stone-400 rounded-full opacity-60" />
              </div>
            ))}
          </>
        )}

        {/* Badge Icon - On top of everything */}
        <div className="relative z-10">
          <Award
            className={`w-5 h-5 ${badge.unlocked ? "text-white opacity-100" : "text-gray-600 opacity-30"
              }`}
          />
        </div>
      </div >

      {/* Custom tooltip on hover - rendered via portal to escape container bounds */}
      {
        showCustomTooltip && typeof window !== 'undefined' && createPortal(
          <div
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
        )
      }
    </>
  )
}

