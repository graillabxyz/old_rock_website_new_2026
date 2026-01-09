"use client"

import { useState, useEffect, useRef } from "react"
import { Badge as BadgeType } from "@/lib/badge-utils"
import { Award } from "lucide-react"
import { createPortal } from "react-dom"

interface BadgeIconWithTooltipProps {
    badge: BadgeType
    size?: "xs" | "sm" | "md" | "lg"
    className?: string
}

export default function BadgeIconWithTooltip({ badge, size = "xs", className = "" }: BadgeIconWithTooltipProps) {
    const [showCustomTooltip, setShowCustomTooltip] = useState(false)
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })
    const badgeRef = useRef<HTMLDivElement>(null)

    // Map sizes to dimensions
    const sizeClasses = {
        xs: "w-8 h-8",      // Leaderboard default (32px)
        sm: "w-10 h-10",    // Profile list (40px)
        md: "w-12 h-12",    // Profile featured (48px)
        lg: "w-16 h-16",    // Large (64px)
    }

    const currentSizeClass = sizeClasses[size] || sizeClasses.xs

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
                dna = "dna-goliath"
                color = "#F97316" // Goliath orange
                break
            case "Goliath Density":
                dna = "dna-goliath"
                color = "#F97316" // Goliath orange
                subType = "nested"
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
                dna = "dna-reactive" // Use reactive base but override with diamond
                subType = "diamond-colored" // New subtype for colored diamond
                break
            case "Goliath Bounty":
                dna = "dna-bounty"
                color = "#EF4444" // Red for bounty
                break
            case "Goliath Color":
                dna = "dna-goliath" // Use standard goliath square shape but with color
                break
            case "Mystic Prestige":
                dna = "dna-mystic-prestige"
                color = "#FFD700" // Gold
                break
            case "Mystic Hybrid":
                dna = "dna-mystic-hybrid"
                color = "#8B5CF6" // Violet
                break
            case "Mystic Color":
                dna = "dna-reactive" // Reuse reactive vibe
                break
            case "Prestige":
                dna = "dna-prestige"
                color = "#10B981" // Emerald
                break
            default:
                if (badge.id?.startsWith("mystic-")) {
                    dna = "dna-reactive"
                    color = "#ffffff"
                }
        }

        // Fallback for color if it's a "Color" badge but no specific color set
        if ((badge.category === "Goliath Color" || badge.category === "Rock Color" || badge.category === "Mystic Color") && !badge.rockColor) {
            const lowerName = badge.name.toLowerCase()
            if (lowerName.includes("yellow")) color = "#FFB000"
            else if (lowerName.includes("turquoise")) color = "#40E0D0"
            else if (lowerName.includes("blue")) color = "#0F52BA"
            else if (lowerName.includes("purple")) color = "#9966CC"
            else if (lowerName.includes("red")) color = "#E0115F"
            else if (lowerName.includes("silver")) color = "#C0C0C0"
            else if (lowerName.includes("gold")) color = "#FFD700"
            else if (lowerName.includes("aquamarine")) color = "#7FFFD4"
            else if (lowerName.includes("black")) color = "#000000"
            else if (lowerName.includes("white")) color = "#FFFFFF"
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
                className={`relative ${currentSizeClass} flex items-center justify-center rounded-lg bg-gray-800/80 border border-gray-700 cursor-help overflow-visible backdrop-blur-sm ${className}`}
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

                        {subType === "diamond-colored" && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <svg
                                    viewBox="0 0 100 100"
                                    className="w-[100%] h-[100%] opacity-90"
                                    style={{ overflow: 'visible' }}
                                >
                                    {/* Main Diamond Stroke */}
                                    <polygon
                                        points="50,10 90,50 50,90 10,50"
                                        fill="none"
                                        stroke={color}
                                        strokeWidth="3"
                                        strokeLinejoin="round"
                                        className="animate-pulse"
                                        style={{ animation: 'hive-pulse 3s infinite ease-in-out' }}
                                    />
                                    {/* Inner Faint Filled Diamond */}
                                    <polygon
                                        points="50,15 85,50 50,85 15,50"
                                        fill={color}
                                        fillOpacity="0.1"
                                        stroke="none"
                                        className="animate-pulse"
                                        style={{ animation: 'hive-pulse 3s infinite ease-in-out', animationDelay: '0.1s' }}
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

                        {/* 2. Goliath Count-Based Squares (Ownership & Color) */}
                        {dna === "dna-goliath" && subType !== "nested" && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                {Array.from({ length: Math.min(count, 10) }).map((_, i) => {
                                    const angle = (360 / Math.min(count, 10)) * i
                                    const radius = count === 1 ? 0 : 12
                                    const x = Math.cos((angle * Math.PI) / 180) * radius
                                    const y = Math.sin((angle * Math.PI) / 180) * radius
                                    // Make Goliath Color (or single Goliaths) larger as requested
                                    const isColorBadge = badge.category === "Goliath Color"
                                    const size = count === 1 ? (isColorBadge ? 24 : 16) : 8

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

                        {/* 2b. Goliath Density Nested Squares */}
                        {dna === "dna-goliath" && subType === "nested" && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                {(() => {
                                    // Determine nesting level based on badge ID (Low=2, Med=3, High=4)
                                    // Tier 2=Low, 3=Med, 4=High usually, but let's check ID to be sure or use tiers if reliable.
                                    // Based on badge-utils: Low=Tier 2, Med=Tier 3, High=Tier 4. Uninfected was Tier 1 (removed).
                                    // Let's use ID checking for robustness.
                                    let levels = 2
                                    if (badge.id.includes("medium-density")) levels = 3
                                    if (badge.id.includes("high-density")) levels = 4

                                    return Array.from({ length: levels }).map((_, i) => {
                                        // Outer to inner squares
                                        // Base size 70%, decreasing
                                        const size = 65 - (i * 14)
                                        const duration = 8 - i
                                        const reverse = i % 2 === 1
                                        return (
                                            <div
                                                key={i}
                                                className="absolute border border-current"
                                                style={{
                                                    width: `${size}%`,
                                                    height: `${size}%`,
                                                    color: color,
                                                    borderColor: color,
                                                    opacity: 0.9 - (i * 0.15),
                                                    // Rotating squares
                                                    animation: `spin ${duration}s ${reverse ? 'reverse' : 'linear'} infinite`,
                                                    // Glow effect
                                                    boxShadow: `0 0 ${5 + i * 2}px ${color}40`
                                                }}
                                            />
                                        )
                                    })
                                })()}
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

                        {/* NEW ANIMATIONS */}
                        {/* Goliath Bounty: Target Reticule */}
                        {dna === "dna-bounty" && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="absolute w-[80%] h-[80%] border-2 border-dashed rounded-full animate-[spin_10s_linear_infinite]"
                                    style={{ borderColor: color, opacity: 0.5 }} />
                                <div className="absolute w-[60%] h-[60%] border border-solid rounded-full animate-[ping_3s_ease-out_infinite]"
                                    style={{ borderColor: color, opacity: 0.3 }} />
                                <div className="absolute w-1 h-full bg-current opacity-30 rotate-45" style={{ backgroundColor: color }} />
                                <div className="absolute w-1 h-full bg-current opacity-30 -rotate-45" style={{ backgroundColor: color }} />
                            </div>
                        )}

                        {/* Mystic Prestige/Hybrid: Mystical Pulse */}
                        {(dna === "dna-mystic-prestige" || dna === "dna-mystic-hybrid") && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="absolute w-full h-full rounded-full animate-pulse opacity-20"
                                    style={{ background: `radial-gradient(circle, ${color} 0%, transparent 70%)` }} />
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="absolute w-2 h-2 rounded-full animate-[spin_4s_linear_infinite]"
                                        style={{
                                            backgroundColor: color,
                                            top: '50%',
                                            left: '50%',
                                            transformOrigin: `${15 + i * 2}px ${0}px`, // Spiral out
                                            animationDelay: `-${i * 0.5}s`,
                                            opacity: 0.6
                                        }}
                                    />
                                ))}
                                {dna === "dna-mystic-prestige" && (
                                    <div className="absolute w-4 h-4 rotate-45 border-2 border-white opacity-80 animate-[spin_3s_reverse_infinite]" />
                                )}
                            </div>
                        )}

                        {/* Prestige: Ecosystem Pillar / Density Aligned */}
                        {dna === "dna-prestige" && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                {badge.id.includes("density-aligned") ? (
                                    /* Triangle connecting points */
                                    <div className="relative w-full h-full">
                                        <div className="absolute top-[20%] left-[50%] w-2 h-2 rounded-full bg-white -translate-x-1/2 shadow-[0_0_5px_white]" />
                                        <div className="absolute bottom-[20%] left-[20%] w-2 h-2 rounded-full bg-white -translate-x-1/2 shadow-[0_0_5px_white]" />
                                        <div className="absolute bottom-[20%] right-[20%] w-2 h-2 rounded-full bg-white translate-x-1/2 shadow-[0_0_5px_white]" />
                                        <svg className="absolute inset-0 w-full h-full opacity-50">
                                            <polygon points="50,25 25,75 75,75" fill="none" stroke={color} strokeWidth="2" />
                                        </svg>
                                    </div>
                                ) : (
                                    /* Pillar effect */
                                    <div className="flex gap-1 items-end h-[60%]">
                                        <div className="w-1.5 h-[60%] bg-current animate-[pulse_2s_ease-in-out_infinite]" style={{ backgroundColor: color, animationDelay: '0s' }} />
                                        <div className="w-1.5 h-[100%] bg-current animate-[pulse_2s_ease-in-out_infinite]" style={{ backgroundColor: color, animationDelay: '0.5s' }} />
                                        <div className="w-1.5 h-[60%] bg-current animate-[pulse_2s_ease-in-out_infinite]" style={{ backgroundColor: color, animationDelay: '1s' }} />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 5. $DENSITY Category Tier-Specific Animations */}
                        {badge.category === "Density" && badge.tier && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                {/* Tier 1: Dust Holder - 2 arms */}
                                {badge.tier === 1 && (
                                    <div className="density-vortex">
                                        {[0, 1].map((i) => (
                                            <div
                                                key={i}
                                                className="vortex-arm"
                                                style={{
                                                    '--rotation-offset': `${i * (360 / 2)}deg`
                                                } as any}
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Tier 2: Weight Bearer - 3 spiral arms (Switched to vortex-arm for symmetry) */}
                                {badge.tier === 2 && (
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

                                {/* Tier 3: Mass Builder - 4 vortex arms */}
                                {(badge.tier === 3 || badge.name === "Mass Builder") && (
                                    <div className="density-vortex">
                                        {[0, 1, 2, 3].map((i) => (
                                            <div
                                                key={i}
                                                className="vortex-arm"
                                                style={{
                                                    '--rotation-offset': `${i * (360 / 4)}deg`
                                                } as any}
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Tier 4: Gravity Well - 8 vortex arms */}
                                {(badge.tier === 4 || badge.name === "Gravity Well") && (
                                    <div className="density-vortex">
                                        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                                            <div
                                                key={i}
                                                className="vortex-arm"
                                                style={{
                                                    '--rotation-offset': `${i * (360 / 8)}deg`
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
                        {/* 6. Standard DNA Layer (if not specifically overridden) */}
                        {(!subType && dna !== "dna-goliath" && dna !== "dna-bounty" && dna !== "dna-mystic-prestige" && dna !== "dna-mystic-hybrid" && dna !== "dna-prestige" && !(badge.category === "Rock Density" && badge.id.includes("-density-core")) && badge.category !== "Rock Ownership" && badge.category !== "Density") && (
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

                {/* Icon Layer Removed */}
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
