'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
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
        <div className="flex items-center gap-[1px] w-[50px] h-[10px] bg-gray-800/80 rounded-[1px] overflow-hidden border border-white/10">
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
    const orbitRadius = 365; // Increased to clear the scaled rock (550px * 1.25 / 2 = ~344px)
    const planetSize = 74;
    const infoPillWidth = 360;

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

    // Standard evenly distributed angle logic
    const calculateAngle = (index: number) => {
        return (index / maxSlots) * 2 * Math.PI;
    };

    // Overall system rotation to bring selected to the focus area (Top)
    const systemRotation = useMemo(() => {
        if (activePlanetIndex === null) return 0;

        // Rotate so the active planet is at the Right (0 degrees)
        const angleDeg = (activePlanetIndex / maxSlots) * 360;
        return -angleDeg;
    }, [activePlanetIndex]);

    if (!selectedRock) return null;

    // Center Asset (GIF)
    // Colors that have PURE/REACTIVE variants
    const VARIANT_COLORS = ['BLUE', 'RED', 'PURPLE', 'GOLD', 'TURQUOISE', 'AQUAMARINE'];

    // Center Asset (GIF)
    let colorName = selectedRock.color?.toUpperCase() || 'COMMON';
    let gifName = colorName;

    // Only append variants if the color supports them
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

        // Must be at full capacity
        if (linkedGoliaths.length !== selectedRock.maxCapacity) return false;

        // All linked Goliaths must match Rock color
        return linkedGoliaths.every(g =>
            g.color?.toUpperCase() === selectedRock.color?.toUpperCase() &&
            g.color?.toUpperCase() !== 'COMMON'
        );
    }, [selectedRock, linkedGoliaths]);

    // Parallax effect (Framer Motion)
    const { scrollY } = useScroll();
    const backgroundY = useTransform(scrollY, [0, 1000], [0, 150]); // Move 150px down per 1000px scroll (0.15x speed)

    return (
        <div className="relative w-full h-[850px] flex items-center justify-center mt-32 perspective-1000">
            {/* Background Dynamic Glow (Placeholder GIF) - Extended Upwards for Notch Visibility */}
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

            {/* Orbital System (Expanded Size to Match Radius) */}
            <div
                className="relative w-[740px] h-[740px] transition-transform duration-700 ease-in-out"
                style={{ transform: `rotate(${systemRotation}deg)` }}
            >
                {/* Visual Orbit Line */}
                {/* Visual Orbit Line - Slightly smaller than orbit path to avoid overlap */}
                <div className="absolute left-1/2 top-1/2 -ml-[330px] -mt-[330px] w-[660px] h-[660px] rounded-full border border-white/5 opacity-50 z-10" />

                {/* Nodes on Orbit (Fixed Slots Logic) */}
                {Array.from({ length: maxSlots }).map((_, i) => {
                    // Use rearrangedGoliaths logic for proper slot distribution (Even/Odd spread)
                    const goliath = rearrangedGoliaths[i];

                    // FIXED: Use calculateAngle (Rotary Phone logic) instead of linear 360/maxSlots
                    const angleRad = calculateAngle(i);
                    const angleDeg = (angleRad * 180) / Math.PI;

                    const isActive = activePlanetIndex === i;

                    // Only show if we have a goliath here OR if it's a visible slot in the pattern
                    // But visibleSlotIndices logic in original was complex. 
                    // Let's just render ALL slots but empty ones are placeholders.

                    // Actually, original used `visibleSlotIndices`.
                    const isVisible = visibleSlotIndices.includes(i);
                    if (!isVisible) return null;

                    const hasGoliath = !!goliath;
                    const isSelected = selectedGoliath?.id === goliath?.id;

                    return (
                        <div
                            key={`slot-${i}`}
                            className={cn(
                                "absolute top-0 left-1/2 -ml-[45px] -mt-[45px] w-[90px] h-[90px] transition-all duration-300 cursor-pointer group",
                                isSelected ? "z-40 scale-125" : "z-30 scale-100 hover:scale-110"
                            )}
                            style={{
                                transformOrigin: `50% ${orbitRadius + 45}px`, // Dynamic radius based on calculation
                                transform: `rotate(${angleDeg}deg)`,
                                opacity: 1
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
                            {/* Counter-rotate content to keep upright */}
                            <div
                                className="w-full h-full relative"
                                style={{ transform: `rotate(${-angleDeg - systemRotation}deg)` }}
                            >
                                <div className={cn(
                                    "w-full h-full rounded-full border-2 overflow-hidden transition-colors shadow-[0_0_15px_rgba(0,0,0,0.5)]",
                                    hasGoliath
                                        ? (isSelected ? "border-[#6BC482] shadow-[0_0_20px_rgba(107,196,130,0.4)] bg-black" : "border-white/20 group-hover:border-white/60 bg-black")
                                        : "border-white/10 bg-white/5 opacity-30"
                                )}>
                                    {hasGoliath ? (
                                        <img
                                            src={goliath.imageId?.replace('.webp', '-300.webp')}
                                            alt={goliath.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        // Empty Slot Placeholder
                                        <div className="w-full h-full rounded-full bg-white/5" />
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Central Rock (Large GIF) */}
            <div className="absolute z-10 w-[550px] h-[550px] flex items-center justify-center pointer-events-none rounded-full overflow-hidden">
                <img
                    src={centerAsset}
                    alt="Selected Rock"
                    className="w-full h-full object-contain drop-shadow-[0_0_50px_rgba(0,0,0,0.8)] scale-125"
                    key={`center-rock-${selectedRock.id}`}
                />
            </div>

            {/* SVG Rings - Moved outside to prevent clipping - Updated for larger radius */}
            <svg width="740" height="740" className="absolute z-[11] pointer-events-none">
                {/* Outer Ring - Activates on Full Match (Slightly larger than container) */}
                <circle
                    cx="370" cy="370" r="360"
                    stroke={COLOR_HEX[selectedRock.color?.toUpperCase()] || "#fff"}
                    strokeWidth="4"
                    fill="transparent"
                    className="transition-opacity duration-500"
                    opacity={fullyStakedMatching ? 0.8 : 0}
                />
                {/* Inner Ring - Sits on the edge (Matches container radius) */}
                <circle
                    cx="370" cy="370" r="350"
                    stroke={COLOR_HEX[selectedRock.color?.toUpperCase()] || "#fff"}
                    strokeWidth="7"
                    fill="transparent"
                    opacity={0.3}
                />
            </svg>

            {/* Detailed Info Pill */}
            {selectedGoliath && (
                <div
                    className="absolute z-20 top-1/2 left-[calc(50%+350px)] -translate-y-1/2 w-[410px] flex filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
                    style={{ opacity: 1 }}
                >
                    {/* Left: Image */}
                    <div className="w-[140px] h-[140px] shrink-0 rounded-[20px] border-4 border-[#1a1f23] overflow-hidden bg-gray-900 z-10 ml-[-90px] shadow-lg relative">
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
                        {/* Disconnect Overlay */}
                        <div
                            className="absolute inset-0 bg-red-600/80 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer backdrop-blur-[2px]"
                            onClick={() => onGoliathClick(selectedGoliath)}
                        >
                            <span className="text-[12px] font-black text-white uppercase tracking-widest" style={{ fontFamily: 'Din-Condensed, sans-serif' }}>
                                DISCONNECT
                            </span>
                        </div>
                    </div>

                    {/* Right: Stats Detail - Split Backgrounds */}
                    <div className="flex-1 flex flex-col min-w-0">

                        {/* Top Section (Density & Matching) - Own Background */}
                        <div className="bg-white/5 px-6 py-4 rounded-tr-[20px]">
                            <div className="flex flex-col gap-0.5 mb-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-[12px] font-bold text-white/60 tracking-widest uppercase" style={{ fontFamily: 'Din-Condensed, sans-serif' }}>
                                        {selectedGoliath.density} DENSITY
                                    </span>
                                    <GoliathDensityBars density={selectedGoliath.density} />
                                </div>
                                <div className="text-[20px] font-black text-[#6BC482] leading-none" style={{ fontFamily: 'Din-Condensed, sans-serif' }}>
                                    {calculateEffectBonus(selectedRock, selectedGoliath).effect}
                                </div>
                            </div>

                            <div className="flex flex-col gap-0.5">
                                <div className="flex items-center justify-between">
                                    <span className="text-[12px] font-bold text-white/60 tracking-widest uppercase" style={{ fontFamily: 'Din-Condensed, sans-serif' }}>
                                        MATCHING
                                    </span>
                                    <div
                                        className="px-2 py-0.5 rounded-[2px] text-[10px] font-black uppercase tracking-widest leading-none flex items-center justify-center h-[20px] min-w-[60px]"
                                        style={{
                                            backgroundColor: COLOR_MAP[selectedGoliath.color?.toUpperCase()]?.bg || '#333',
                                            color: COLOR_MAP[selectedGoliath.color?.toUpperCase()]?.text || '#fff',
                                            fontFamily: 'Din-Condensed, sans-serif'
                                        }}
                                    >
                                        {selectedGoliath.color}
                                    </div>
                                </div>
                                <div className="text-[20px] font-black text-[#6BC482] leading-none" style={{ fontFamily: 'Din-Condensed, sans-serif' }}>
                                    {calculateEffectBonus(selectedRock, selectedGoliath).color}
                                </div>
                            </div>
                        </div>

                        {/* Separator - Flush with backgrounds */}
                        <div className="h-[1px] bg-white/10 w-full" />

                        {/* Bottom Section (Amplification) - Own Background */}
                        <div className="bg-white/5 px-6 py-4 rounded-br-[20px] flex items-baseline justify-between">
                            <span className="text-[20px] font-black text-white tracking-widest uppercase" style={{ fontFamily: 'Din-Condensed, sans-serif' }}>
                                AMPLIFICATION
                            </span>
                            <span className="text-[24px] font-black text-[#6BC482] drop-shadow-[0_0_10px_rgba(107,196,130,0.3)]" style={{ fontFamily: 'Din-Condensed, sans-serif' }}>
                                {calculateEffectBonus(selectedRock, selectedGoliath).amplify}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
