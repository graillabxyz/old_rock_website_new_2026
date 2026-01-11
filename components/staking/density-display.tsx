'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DensityDisplayProps {
    unclaimedDensity: string | number;
    isFetching?: boolean;
    isClaimLoading: boolean;
    onClaim: () => void;
}

export function DensityDisplay({ unclaimedDensity, isFetching, isClaimLoading, onClaim }: DensityDisplayProps) {
    // Ensure unclaimedDensity is formatted nicely
    const densityNum = typeof unclaimedDensity === 'string'
        ? parseFloat(unclaimedDensity.replace(/,/g, ''))
        : unclaimedDensity;

    const formattedDensity = densityNum.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    // Animation opacity based on value
    const animationOpacity = densityNum > 0 ? Math.min(0.2 + (densityNum / 10000) * 0.8, 1) : 0;

    return (
        <div className="flex flex-col items-center justify-center pt-20 pb-4">
            <div className="relative w-[1200px] h-[280px] flex items-center justify-center">

                {/* 1. Animated Density Effect (Base Layer - Colored) - z-0 */}
                <div
                    className="absolute w-[40%] h-[40%] top-[-5%] left-[30%] z-0 pointer-events-none overflow-hidden rounded-[80px]"
                    style={{ opacity: animationOpacity }}
                >
                    <img
                        src="/images/amplify-density.webp"
                        alt="Density Animation"
                        className="w-full h-full object-cover scale-150 rotate-180"
                    />
                </div>

                {/* 2. Dark Background Shadow/Glow (Overlaying the color) - z-0 but visually effectively z-1 due to DOM order if same z is used, or explicit z-1 */}
                <div className="absolute inset-x-0 h-[240px] top-[20px] bg-black/40 blur-[80px] rounded-full z-[1]" />

                {/* 3. Vessel (on top of background) - z-10 */}
                <img
                    src="/images/amplify-vessel.png"
                    alt="Density Vessel"
                    className="absolute inset-0 w-full h-full object-contain z-10 scale-[1.5]"
                />

                <div className="absolute inset-x-0 top-[2%] h-[40%] z-20 flex items-center justify-center gap-2">
                    <span
                        className="text-[17px] font-bold text-white/90 tracking-widest drop-shadow-lg font-pt-mono"
                    >
                        $DENSITY
                    </span>
                    <span
                        className="text-[24px] font-bold drop-shadow-[0_0_15px_rgba(107,196,130,0.5)] font-pt-mono"
                        style={{
                            color: '#6BC482'
                        }}
                    >
                        {formattedDensity}
                    </span>
                </div>

                {/* Extract Button - Scaled down slightly to not compete with vial */}
                <button
                    onClick={onClaim}
                    disabled={isClaimLoading || densityNum <= 0}
                    className={cn(
                        "absolute bottom-[125px] left-1/2 -translate-x-1/2 text-[13px] font-bold uppercase tracking-[0.2em] transition-all z-50",
                        "hover:scale-105 active:scale-95",
                        densityNum <= 0 ? "text-white/5 cursor-not-allowed" : "text-white/80 hover:text-[#6BC482]"
                    )}
                    style={{ fontFamily: 'var(--font-barlow), sans-serif' }}
                >
                    {isClaimLoading ? (
                        <div className="flex items-center gap-3">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            EXTRACTING...
                        </div>
                    ) : (
                        "EXTRACT FROM AMPLIFY"
                    )}
                </button>
            </div>
        </div>
    );
}
