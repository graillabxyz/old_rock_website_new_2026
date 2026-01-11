'use client';

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, EffectCoverflow } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/effect-coverflow';
import { cn } from '@/lib/utils';
import type { GoliathNFT, OldRocksNFT } from '@/types/staking';
import { useStakingStore } from '@/lib/staking-store';
import { playSound } from '@/lib/staking-sounds';

// Goliath density bars (matching the pill design)
function GoliathDensityBars({ density }: { density: string }) {
    const densityUpper = density?.toUpperCase() || 'LOW';
    let bars = 0;

    if (densityUpper === 'HIGH' || densityUpper === 'MYSTIC') bars = 3;
    else if (densityUpper === 'MEDIUM') bars = 2;
    else if (densityUpper === 'LOW' || densityUpper === 'COMMON') bars = 1;

    return (
        <div className="flex items-center gap-[1px] w-[70px] h-[14px] bg-gray-800/80 rounded-[1px] overflow-hidden border border-white/30">
            {Array.from({ length: 3 }).map((_, i) => (
                <div
                    key={i}
                    className="flex-1 h-full"
                    style={{
                        backgroundColor: i < bars ? '#6BC482' : 'transparent',
                        opacity: i < bars ? 1 : 0.1,
                        borderLeft: i > 0 ? '1px solid rgba(0,0,0,0.5)' : 'none'
                    }}
                />
            ))}
        </div>
    );
}

// Color map and Hex colors for strokes
const COLOR_HEX: Record<string, string> = {
    RED: "#DC4537",
    AQUAMARINE: "#46AA9A",
    BLACK: "#404040",
    SILVER: "#B3B3B3",
    PURPLE: "#8856B9",
    BLUE: "#3182AA",
    YELLOW: "#FEC42A",
    TURQUOISE: "#257875",
    GOLD: "#EDA825",
    WHITE: "#FFFFFF",
};

const COLOR_MAP: Record<string, { bg: string; text: string }> = {
    WHITE: { bg: '#FFFFFF', text: '#000000' },
    SILVER: { bg: '#B3B3B3', text: '#000000' },
    YELLOW: { bg: '#FEC42A', text: '#000000' },
    GOLD: { bg: '#EDA825', text: '#000000' },
    AQUAMARINE: { bg: '#46AA9A', text: '#FFFFFF' },
    TURQUOISE: { bg: '#257875', text: '#FFFFFF' },
    BLUE: { bg: '#3182AA', text: '#FFFFFF' },
    PURPLE: { bg: '#8856B9', text: '#FFFFFF' },
    RED: { bg: '#DC4537', text: '#FFFFFF' },
    BLACK: { bg: '#404040', text: '#FFFFFF' },
    COMMON: { bg: '#808080', text: '#FFFFFF' },
};

// Calculate bonus effect
function calculateEffectBonus(rock: OldRocksNFT, goliath: GoliathNFT) {
    let densityBonus = 0;
    let colorBonus = 0;

    if (goliath.density === 'HIGH' || goliath.density === 'MYSTIC') densityBonus = 40;
    else if (goliath.density === 'MEDIUM') densityBonus = 20;
    else if (goliath.density === 'LOW' || goliath.density === 'COMMON') densityBonus = 10;

    if (rock?.color?.toUpperCase() === goliath?.color?.toUpperCase() &&
        goliath?.color?.toUpperCase() !== 'COMMON' && goliath.color !== 'NONE') {
        colorBonus = 10;
    }

    const total = densityBonus + colorBonus;

    return {
        effect: `+${densityBonus}%`,
        color: `+${colorBonus}%`,
        amplify: `+${total}%`,
        total,
    };
}

interface LinkedGoliathsDisplayProps {
    linkedGoliaths: GoliathNFT[];
    selectedRock: OldRocksNFT | null;
    loadingGoliathId?: string;
    onGoliathClick: (goliath: GoliathNFT) => void;
}

export function LinkedGoliathsDisplay({
    linkedGoliaths,
    selectedRock,
    loadingGoliathId,
    onGoliathClick,
}: LinkedGoliathsDisplayProps) {
    const { activePlanetIndex, setActivePlanetIndex } = useStakingStore();

    const maxSlots = 20;
    const orbitRadius = 370; // Reduced for tighter spacing
    const planetSize = 74;
    const infoPillWidth = 360;

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Rearrange logic to match original's "rearrangeLinkedGoliaths"
    const rearrangedGoliaths = useMemo(() => {
        const result: (GoliathNFT | null)[] = Array(maxSlots).fill(null);
        linkedGoliaths.forEach((g, i) => {
            if (i < maxSlots) {
                // If i is even, place at i/2, if odd place at end
                const index = i % 2 === 0 ? i / 2 : maxSlots - 1 - Math.floor(i / 2);
                result[index] = g;
            }
        });
        return result;
    }, [linkedGoliaths]);

    const visibleSlotIndices = useMemo(() => {
        const capacity = selectedRock?.maxCapacity || 0;
        if (capacity === 0) return [];
        if (capacity === 1) return [0];

        const lowerHalf = Array.from({ length: Math.ceil(capacity / 2) }, (_, i) => i);
        const upperHalf = Array.from({ length: Math.floor(capacity / 2) }, (_, i) => maxSlots - 1 - i);

        return [...lowerHalf, ...upperHalf];
    }, [selectedRock, maxSlots]);

    const selectedGoliath = activePlanetIndex !== null ? rearrangedGoliaths[activePlanetIndex] : null;

    // Calculate angle - creates extra gap around selected goliath for focus box
    // Pushes all nodes slightly based on their distance from selected
    const calculateAngle = (index: number) => {
        const baseStep = (2 * Math.PI) / maxSlots;
        const baseAngle = index * baseStep;

        if (activePlanetIndex === null) {
            return baseAngle;
        }

        if (index === activePlanetIndex) {
            return baseAngle;
        }

        // Calculate circular distance from selected (handles wrap-around)
        let dist = index - activePlanetIndex;
        if (dist > maxSlots / 2) dist -= maxSlots;
        if (dist < -maxSlots / 2) dist += maxSlots;

        // Push amount decreases with distance, all nodes on one side push same direction
        const pushAmount = baseStep * 0.4; // Push by 40% of a slot

        if (dist > 0) {
            return baseAngle + pushAmount;
        } else {
            return baseAngle - pushAmount;
        }
    };

    // Track cumulative rotation for shortest path animation
    const rotationRef = useRef(0);

    // Calculate system rotation with shortest path
    const systemRotation = useMemo(() => {
        if (activePlanetIndex === null) {
            rotationRef.current = 0;
            return 0;
        }

        // Target: bring selected to 90 degrees (right side)
        const targetAngleDeg = (activePlanetIndex / maxSlots) * 360;
        const targetRotation = 90 - targetAngleDeg;

        // Calculate shortest path from current rotation
        let diff = targetRotation - rotationRef.current;

        // Normalize to shortest path (-180 to 180)
        while (diff > 180) diff -= 360;
        while (diff < -180) diff += 360;

        rotationRef.current += diff;
        return rotationRef.current;
    }, [activePlanetIndex]);

    if (!selectedRock) return null;

    // Center Asset (GIF) logic
    const VARIANT_COLORS = ['BLUE', 'RED', 'PURPLE', 'GOLD', 'TURQUOISE', 'AQUAMARINE'];
    let colorName = selectedRock.color?.toUpperCase() || 'COMMON';
    let gifName = colorName;

    if (VARIANT_COLORS.includes(colorName)) {
        if (selectedRock.isPure) gifName += '-PURE';
        else if (selectedRock.isReactive) gifName += '-REACTIVE';
    }

    const centerAsset = `/images/GIFs/${gifName}.gif`;
    const placeholderAsset = `/images/GIFs/${gifName}-PLACEHOLDER.gif`;

    // Check if fully matched (Full Capacity + All Matching Colors)
    const fullyStakedMatching = useMemo(() => {
        if (!selectedRock) return false;
        if (selectedRock.color?.toUpperCase() === 'COMMON') return false;
        if (linkedGoliaths.length !== selectedRock.maxCapacity) return false;
        return linkedGoliaths.every(g =>
            g.color?.toUpperCase() === selectedRock.color?.toUpperCase() &&
            g.color?.toUpperCase() !== 'COMMON'
        );
    }, [selectedRock, linkedGoliaths]);

    const { scrollY } = useScroll();
    const backgroundY = useTransform(scrollY, [0, 1000], [0, 150]);

    if (isMobile) {
        return (
            <div className="w-full flex flex-col items-center py-8 relative z-10 px-4">
                <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-widest text-center" style={{ fontFamily: 'Din-Condensed, sans-serif' }}>
                    CONNECTED GOLIATH ({linkedGoliaths.length})
                </h2>

                {/* Mobile Carousel */}
                <div className="w-full h-[260px] mb-8 relative">
                    <Swiper
                        modules={[Navigation, EffectCoverflow]}
                        effect="coverflow"
                        grabCursor
                        centeredSlides={true}
                        slidesPerView="auto"
                        coverflowEffect={{
                            rotate: 0,
                            stretch: -50,
                            depth: 100,
                            modifier: 1.5,
                            slideShadows: false,
                        }}
                        initialSlide={activePlanetIndex !== null ? activePlanetIndex : 0}
                        onSlideChange={(swiper) => setActivePlanetIndex(swiper.activeIndex)}
                        className="w-full h-full"
                    >
                        {rearrangedGoliaths.map((goliath, i) => {
                            if (!goliath) return null;
                            const isSelected = activePlanetIndex === i;
                            const colorMatches = selectedRock &&
                                goliath.color?.toUpperCase() === selectedRock.color?.toUpperCase() &&
                                goliath.color?.toUpperCase() !== 'COMMON';
                            const matchColor = colorMatches ? COLOR_HEX[goliath.color?.toUpperCase()] : null;

                            return (
                                <SwiperSlide key={`mobile-goliath-${goliath.id}-${i}`} style={{ width: '200px' }}>
                                    <div className={cn(
                                        "w-[180px] h-[180px] rounded-full overflow-hidden border-2 transition-all duration-300 mx-auto mt-7",
                                        isSelected ? "scale-110 z-20 shadow-[0_0_20px_rgba(107,196,130,0.3)]" : "scale-90 opacity-40 z-10"
                                    )}
                                        style={(isSelected && colorMatches) ? {
                                            borderColor: matchColor as any,
                                            boxShadow: `0 0 15px ${matchColor}80`
                                        } : {
                                            borderColor: (isSelected ? '#6BC482' : 'rgba(255,255,255,0.2)') as any
                                        }}>
                                        <img
                                            src={goliath.imageId?.replace('.webp', '-300.webp')}
                                            alt={goliath.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </SwiperSlide>
                            );
                        })}
                    </Swiper>
                </div>

                {/* Mobile Info Pill / Focus Card */}
                {selectedGoliath && (
                    <motion.div
                        key={`mobile-info-${selectedGoliath.id}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="w-full max-w-[400px] bg-[#1a1f23]/90 backdrop-blur-md rounded-[20px] p-6 border border-white/10 shadow-2xl"
                    >
                        {/* Density Row */}
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-lg font-bold text-white uppercase tracking-wider" style={{ fontFamily: 'Din-Condensed, sans-serif' }}>
                                {selectedGoliath.density} DENSITY
                            </span>
                            <div className="flex items-center gap-4">
                                <span className="text-xl font-black text-[#6BC482]" style={{ fontFamily: 'Din-Condensed, sans-serif' }}>
                                    {calculateEffectBonus(selectedRock, selectedGoliath).effect}
                                </span>
                                <GoliathDensityBars density={selectedGoliath.density} />
                            </div>
                        </div>

                        {/* Matching Row */}
                        <div className="flex items-center justify-between mb-8">
                            <span className="text-lg font-bold text-white uppercase tracking-wider" style={{ fontFamily: 'Din-Condensed, sans-serif' }}>
                                MATCHING
                            </span>
                            <div className="flex items-center gap-4">
                                <span className="text-xl font-black text-[#6BC482]" style={{ fontFamily: 'Din-Condensed, sans-serif' }}>
                                    {calculateEffectBonus(selectedRock, selectedGoliath).color}
                                </span>
                                <div
                                    className="px-6 py-1.5 rounded-[4px] text-[13px] font-black uppercase tracking-widest min-w-[100px] text-center"
                                    style={{
                                        backgroundColor: COLOR_MAP[selectedGoliath.color?.toUpperCase()]?.bg || '#333',
                                        color: COLOR_MAP[selectedGoliath.color?.toUpperCase()]?.text || '#fff',
                                        fontFamily: 'Din-Condensed, sans-serif'
                                    }}
                                >
                                    {selectedGoliath.color || 'NONE'}
                                </div>
                            </div>
                        </div>

                        {/* Amplification Section */}
                        <div className="flex flex-col items-center justify-center py-4 mb-6 border-y border-white/5">
                            <div className="flex items-center gap-4">
                                <span className="text-2xl font-black text-white uppercase tracking-widest" style={{ fontFamily: 'Din-Condensed, sans-serif' }}>
                                    AMPLIFICATION
                                </span>
                                <span className="text-4xl font-black text-[#6BC482] drop-shadow-[0_0_12px_rgba(107,196,130,0.4)]" style={{ fontFamily: 'Din-Condensed, sans-serif' }}>
                                    {calculateEffectBonus(selectedRock, selectedGoliath).amplify}
                                </span>
                            </div>
                        </div>

                        {/* Disconnect Button */}
                        <button
                            onClick={() => onGoliathClick(selectedGoliath)}
                            disabled={loadingGoliathId === selectedGoliath.id.toString()}
                            className="w-full py-4 rounded-xl border-2 border-[#DC4537] bg-black text-[#DC4537] font-black uppercase tracking-[0.2em] text-sm hover:bg-[#DC4537] hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ fontFamily: 'Din-Condensed, sans-serif' }}
                        >
                            {loadingGoliathId === selectedGoliath.id.toString() ? (
                                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                            ) : (
                                "DISCONNECT"
                            )}
                        </button>
                    </motion.div>
                )}
            </div>
        );
    }

    return (
        <div className="relative w-full h-[850px] flex items-center justify-center mt-32 mb-24 perspective-1000">
            {/* Background Dynamic Glow (Placeholder GIF) */}
            <motion.div
                className="absolute inset-x-0 -top-[600px] -bottom-[200px] z-[-10] pointer-events-none opacity-50"
                style={{
                    backgroundImage: `url(${placeholderAsset})`,
                    backgroundSize: '150%',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    filter: 'blur(8px)',
                    y: backgroundY,
                }}
            />

            {/* Orbital System */}
            <div
                className="relative w-[740px] h-[740px] transition-transform duration-700 ease-in-out ml-[-300px]"
                style={{ transform: `rotate(${systemRotation}deg)` }}
            >
                {/* Visual Orbit Line */}
                <div className="absolute left-1/2 top-1/2 -ml-[212px] -mt-[212px] w-[424px] h-[424px] rounded-full border border-white/5 opacity-50 z-10" />

                {/* Nodes on Orbit */}
                {Array.from({ length: maxSlots }).map((_, i) => {
                    const goliath = rearrangedGoliaths[i];
                    const angleRad = calculateAngle(i);

                    const nodeSize = 100;
                    const centerOffset = 370;
                    const x = centerOffset + Math.cos(angleRad - Math.PI / 2) * orbitRadius - nodeSize / 2;
                    const y = centerOffset + Math.sin(angleRad - Math.PI / 2) * orbitRadius - nodeSize / 2;

                    const isVisible = visibleSlotIndices.includes(i);
                    if (!isVisible) return null;

                    const hasGoliath = !!goliath;
                    const isSelected = selectedGoliath?.id === goliath?.id;

                    return (
                        <div
                            key={`slot-${i}`}
                            className={cn(
                                "absolute w-[100px] h-[100px] transition-all duration-500 cursor-pointer group",
                                isSelected && hasGoliath
                                    ? "z-40 scale-75 opacity-0 pointer-events-none"
                                    : "z-30 scale-100 hover:scale-110"
                            )}
                            style={{
                                left: `${x}px`,
                                top: `${y}px`,
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (activePlanetIndex !== i) {
                                    setActivePlanetIndex(i);
                                } else if (goliath) {
                                    onGoliathClick(goliath);
                                }
                            }}
                        >
                            <div
                                className="w-full h-full relative"
                                style={{ transform: `rotate(${-systemRotation}deg)` }}
                            >
                                {(() => {
                                    const colorMatches = hasGoliath && selectedRock &&
                                        goliath.color?.toUpperCase() === selectedRock.color?.toUpperCase() &&
                                        goliath.color?.toUpperCase() !== 'COMMON';
                                    const matchColor = colorMatches ? COLOR_HEX[goliath.color?.toUpperCase()] : null;

                                    return (
                                        <div
                                            className={cn(
                                                "w-full h-full rounded-full overflow-hidden transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)]",
                                                hasGoliath
                                                    ? colorMatches
                                                        ? "border-[3px] bg-black"
                                                        : "border-2 border-white/20 group-hover:border-white/60 bg-black"
                                                    : "border-2 border-white/10 bg-white/5 opacity-30"
                                            )}
                                            style={colorMatches ? {
                                                borderColor: matchColor as any,
                                                boxShadow: `0 0 12px ${matchColor}80`
                                            } : {}}
                                        >
                                            {hasGoliath ? (
                                                <img
                                                    src={goliath.imageId?.replace('.webp', '-300.webp')}
                                                    alt={goliath.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full rounded-full bg-white/5" />
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Central Rock */}
            <div className="absolute z-10 w-[550px] h-[550px] flex items-center justify-center pointer-events-none rounded-full overflow-hidden ml-[-300px]">
                <img
                    src={centerAsset}
                    alt="Selected Rock"
                    className="w-full h-full object-contain drop-shadow-[0_0_50px_rgba(0,0,0,0.8)] scale-125"
                    key={`center-rock-${selectedRock.id}`}
                />
            </div>

            {/* SVG Rings */}
            <svg width="740" height="740" className="absolute z-[11] pointer-events-none ml-[-300px]">
                <circle
                    cx="370" cy="370" r="360"
                    stroke={COLOR_HEX[selectedRock.color?.toUpperCase()] || "#fff"}
                    strokeWidth="4"
                    fill="transparent"
                    className="transition-opacity duration-500"
                    opacity={fullyStakedMatching ? 0.8 : 0}
                />
                <circle
                    cx="370" cy="370" r="280"
                    stroke={COLOR_HEX[selectedRock.color?.toUpperCase()] || "#fff"}
                    strokeWidth="7"
                    fill="transparent"
                    opacity={0.3}
                />
            </svg>

            {/* Detailed Info Pill */}
            {selectedGoliath && (
                <motion.div
                    key={`info-pill-${selectedGoliath.id}`}
                    initial={{ opacity: 0, scale: 0.9, x: -20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="absolute z-50 top-[41%] left-[calc(50%+400px)] -translate-y-1/2 flex filter drop-shadow-[0_10px_30px_rgba(0,0,0,0.6)] ml-[-300px]"
                >
                    {/* Left: Image with Disconnect Overlay */}
                    {(() => {
                        const colorMatches = selectedRock &&
                            selectedGoliath.color?.toUpperCase() === selectedRock.color?.toUpperCase() &&
                            selectedGoliath.color?.toUpperCase() !== 'COMMON';
                        const matchColor = colorMatches ? COLOR_HEX[selectedGoliath.color?.toUpperCase()] : '#1a1f23';
                        const shadowColor = colorMatches ? `${COLOR_HEX[selectedGoliath.color?.toUpperCase()]}80` : 'rgba(0,0,0,0.5)';

                        return (
                            <div
                                className="w-[155px] h-[155px] shrink-0 rounded-l-[14px] overflow-hidden bg-gray-900 z-10 shadow-lg relative border-[3px]"
                                style={{
                                    borderColor: matchColor as any,
                                    boxShadow: `0 0 15px ${shadowColor}`
                                }}
                            >
                                {loadingGoliathId === selectedGoliath.id.toString() ? (
                                    <div className="w-full h-full flex items-center justify-center bg-black/60">
                                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                                    </div>
                                ) : (
                                    <img
                                        src={selectedGoliath.imageId?.replace('.webp', '-600.webp')}
                                        alt={selectedGoliath.name}
                                        className="w-full h-full object-cover"
                                    />
                                )}
                                <div
                                    className="absolute inset-0 bg-red-600/80 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer backdrop-blur-[2px]"
                                    onClick={() => onGoliathClick(selectedGoliath)}
                                >
                                    <span className="text-[11px] font-black text-white uppercase tracking-widest" style={{ fontFamily: 'Din-Condensed, sans-serif' }}>
                                        DISCONNECT
                                    </span>
                                </div>
                            </div>
                        );
                    })()}

                    {/* Right: Stats Panel */}
                    <div className="bg-[#1a1f23]/90 backdrop-blur-sm rounded-r-[12px] ml-[-10px] px-8 py-3 flex flex-col justify-center w-[350px] h-[155px]">
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-[13px] font-bold text-white/80 tracking-wider uppercase whitespace-nowrap" style={{ fontFamily: 'Din-Condensed, sans-serif' }}>
                                {selectedGoliath.density} DENSITY
                            </span>
                            <span className="text-[15px] font-black text-[#6BC482]" style={{ fontFamily: 'Din-Condensed, sans-serif' }}>
                                {calculateEffectBonus(selectedRock, selectedGoliath).effect}
                            </span>
                            <GoliathDensityBars density={selectedGoliath.density} />
                        </div>

                        <div className="flex items-center justify-between gap-4 mt-1">
                            <span className="text-[13px] font-bold text-white/80 tracking-wider uppercase" style={{ fontFamily: 'Din-Condensed, sans-serif' }}>
                                MATCHING
                            </span>
                            <span className="text-[15px] font-black text-[#6BC482]" style={{ fontFamily: 'Din-Condensed, sans-serif' }}>
                                {calculateEffectBonus(selectedRock, selectedGoliath).color}
                            </span>
                            <div
                                className="px-3 py-1 rounded-[3px] text-[11px] font-black uppercase tracking-wide leading-none"
                                style={{
                                    backgroundColor: COLOR_MAP[selectedGoliath.color?.toUpperCase()]?.bg || '#555',
                                    color: COLOR_MAP[selectedGoliath.color?.toUpperCase()]?.text || '#fff',
                                    fontFamily: 'Din-Condensed, sans-serif'
                                }}
                            >
                                {selectedGoliath.color || 'NONE'}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 mt-2">
                            <span className="text-[16px] font-black text-white tracking-wider uppercase" style={{ fontFamily: 'Din-Condensed, sans-serif' }}>
                                AMPLIFICATION
                            </span>
                            <span className="text-[18px] font-black text-[#6BC482] drop-shadow-[0_0_8px_rgba(107,196,130,0.4)]" style={{ fontFamily: 'Din-Condensed, sans-serif' }}>
                                {calculateEffectBonus(selectedRock, selectedGoliath).amplify}
                            </span>
                        </div>
                    </div>
                </motion.div>
            )}

            <div className="absolute bottom-[-60px] left-1/2 -translate-x-1/2 text-white/40 text-[10px] font-bold uppercase tracking-[0.3em] pointer-events-none select-none whitespace-nowrap">
                CLICK A GOLIATH TO VIEW STATS & DISCONNECT
            </div>
        </div>
    );
}
