'use client';

import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Navigation } from 'swiper';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/navigation';

import { cn } from '@/lib/utils';
import type { OldRocksNFT } from '@/types/staking';
import { useStakingStore } from '@/lib/staking-store';
import { playSound } from '@/lib/staking-sounds';

// Color map for color buttons
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

function DensityBars({ density }: { density: string }) {
    const densityUpper = density?.toUpperCase() || 'COMMON';
    let bars = 0;

    if (densityUpper === 'PURE') bars = 3;
    else if (densityUpper === 'HIGH') bars = 3;
    else if (densityUpper === 'MEDIUM') bars = 2;
    else if (densityUpper === 'LOW') bars = 1;

    return (
        <div className="flex items-center gap-[2px] h-[16px] w-[80px] rounded-[2px] overflow-hidden">
            {Array.from({ length: 3 }).map((_, i) => (
                <div
                    key={i}
                    className="flex-1 h-full rounded-[1px]"
                    style={{
                        backgroundColor: i < bars ? (densityUpper === 'PURE' ? '#f2d94e' : '#fff') : 'rgba(255,255,255,0.2)',
                        opacity: i < bars ? 1 : 0.2
                    }}
                />
            ))}
        </div>
    );
}

interface RocksCarouselProps {
    rocks: OldRocksNFT[];
    onRockSelect?: (rock: OldRocksNFT, index: number) => void;
}

export function RocksCarousel({ rocks, onRockSelect }: RocksCarouselProps) {
    const [swiper, setSwiper] = useState<SwiperType | null>(null);
    const [isFirstRender, setIsFirstRender] = useState(true);
    const { swiperIndex, setSwiperIndex, allGoliaths, setActivePlanetIndex } = useStakingStore();

    useEffect(() => {
        if (isFirstRender) {
            setIsFirstRender(false);
            return;
        }
    }, [isFirstRender]);

    useEffect(() => {
        if (swiper) {
            swiper.slideTo(swiperIndex.oldrocks, 100);
        }
    }, [swiperIndex, swiper]);

    if (rocks.length === 0) {
        return <div className="w-full py-12 text-center text-gray-500">No Old Rocks found</div>;
    }

    return (
        <div className="w-full relative">
            <style jsx global>{`
                .rocks-swiper {
                    padding: 30px 0 20px 0;
                }
                .rocks-swiper .swiper-slide {
                    width: 320px;
                    height: 320px;
                    border-radius: 20px;
                    overflow: hidden;
                    background: #fff;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.4);
                }
                .rocks-swiper .swiper-slide-active {
                    transform: scale(1.1);
                    z-index: 20;
                    box-shadow: 0 15px 45px rgba(0,0,0,0.6);
                }
                .rocks-swiper .swiper-slide:not(.swiper-slide-active) {
                    filter: brightness(0.4) saturate(0.8);
                    transform: scale(0.9);
                }
            `}</style>

            <Swiper
                onSwiper={setSwiper}
                onActiveIndexChange={(swiperCore) => {
                    if (!isFirstRender) playSound('changeRock');
                    setSwiperIndex('oldrocks', swiperCore.activeIndex);
                    const rock = rocks[swiperCore.activeIndex];
                    const linkedGoliaths = allGoliaths.filter(g => g.linkedRock === rock?.id);
                    setActivePlanetIndex(linkedGoliaths.length === 0 ? null : 0);
                    onRockSelect?.(rock, swiperCore.activeIndex);
                }}
                slideToClickedSlide
                effect="coverflow"
                grabCursor
                centeredSlides
                slidesPerView="auto"
                coverflowEffect={{
                    rotate: 0,
                    stretch: -30,
                    depth: 400,
                    modifier: 1.2,
                    slideShadows: true,
                }}
                initialSlide={swiperIndex.oldrocks}
                modules={[EffectCoverflow, Navigation]}
                className="rocks-swiper relative z-10"
            >
                {rocks.map((rock) => {
                    const linkedGoliaths = allGoliaths.filter(g => g.linkedRock === rock.id);
                    const linkedCount = linkedGoliaths.length;
                    const totalMultiplier = 100 + (linkedCount * 10);
                    const formattedMultiplier = (totalMultiplier / 100).toFixed(1) + '×';
                    const capacityPercent = rock.maxCapacity ? Math.round((linkedCount / rock.maxCapacity) * 100) : 0;
                    const dailyRate = Math.round(rock.dailyReward * (totalMultiplier / 100));
                    const colorData = COLOR_MAP[rock.color?.toUpperCase()] || COLOR_MAP.COMMON;

                    return (
                        <SwiperSlide key={rock.id}>
                            <div
                                className="relative w-full h-full bg-white flex flex-col overflow-hidden rounded-[20px] transform-gpu"
                                style={{
                                    fontFamily: 'Din-Condensed, sans-serif',
                                    clipPath: 'inset(0 round 20px)',
                                    WebkitMaskImage: '-webkit-radial-gradient(white, black)' // Helps with clipping on Safari
                                }}
                            >
                                {/* Rock Image */}
                                <img
                                    src={rock.imageId?.replace('.webp', '-600.webp')}
                                    alt={rock.name}
                                    className="absolute inset-0 w-full h-full object-cover z-0"
                                />

                                {/* Transparent Dark Bottom Overlay - Gradient Reverted & Clipped */}
                                <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-black/90 to-transparent z-10 pointer-events-none" />

                                {/* Bottom Info Content */}
                                <div className="absolute bottom-0 left-0 right-0 z-20 p-4 pb-6 flex items-end justify-between">
                                    <div className="flex flex-col gap-0.5 mb-1.5 ml-2">
                                        <DensityBars density={rock.isPure ? 'PURE' : rock.density} />
                                        <div
                                            className="h-[16px] w-[80px] rounded-[1px] flex items-center justify-center uppercase text-[11px] font-black tracking-widest"
                                            style={{ backgroundColor: colorData.bg, color: colorData.text, fontFamily: 'Din-Condensed, sans-serif' }}
                                        >
                                            {rock.color}
                                        </div>
                                    </div>

                                    <div className="flex gap-4 mb-0.5 mr-2">
                                        <div className="flex flex-col items-center gap-0">
                                            <span className="text-[30px] font-black text-white leading-none drop-shadow-sm uppercase" style={{ fontFamily: 'var(--font-barlow), sans-serif' }}>
                                                {dailyRate}
                                            </span>
                                            <span className="text-[8px] font-bold text-[#6BC482] uppercase tracking-wider text-center" style={{ fontFamily: 'var(--font-barlow), sans-serif' }}>
                                                DAILY RATE
                                            </span>
                                        </div>

                                        <div className="flex flex-col items-center gap-0">
                                            <span className="text-[30px] font-black text-white leading-none drop-shadow-sm uppercase" style={{ fontFamily: 'var(--font-barlow), sans-serif' }}>
                                                {formattedMultiplier}
                                            </span>
                                            <span className="text-[8px] font-bold text-[#6BC482] uppercase tracking-wider text-center" style={{ fontFamily: 'var(--font-barlow), sans-serif' }}>
                                                AMPLIFICATION
                                            </span>
                                        </div>

                                        <div className="flex flex-col items-center gap-0">
                                            <span className="text-[30px] font-black text-white leading-none drop-shadow-sm uppercase" style={{ fontFamily: 'var(--font-barlow), sans-serif' }}>
                                                {capacityPercent}
                                            </span>
                                            <span className="text-[8px] font-bold text-[#6BC482] uppercase tracking-wider text-center" style={{ fontFamily: 'var(--font-barlow), sans-serif' }}>
                                                % FULL
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Top Labels */}
                                <div className="absolute top-0 left-0 right-0 p-5 flex justify-between items-start z-10">
                                    <div className="flex flex-col items-center gap-0">
                                        <span className="text-[30px] font-black text-black leading-none uppercase" style={{ fontFamily: 'var(--font-barlow), sans-serif' }}>
                                            {rock.dailyReward}
                                        </span>
                                        <span className="text-[10px] font-bold text-[#6BC482] tracking-widest mt-[-2px] uppercase" style={{ fontFamily: 'var(--font-barlow), sans-serif' }}>
                                            BASE RATE
                                        </span>
                                    </div>

                                    <div className="flex flex-col items-center mt-3">
                                        <span className="text-[15px] font-bold text-black uppercase tracking-tight whitespace-nowrap" style={{ fontFamily: 'var(--font-barlow), sans-serif' }}>
                                            OLD ROCK #{rock.id}
                                        </span>
                                    </div>

                                    <div className="flex flex-col items-center gap-0">
                                        <span className="text-[30px] font-black text-black leading-none uppercase" style={{ fontFamily: 'var(--font-barlow), sans-serif' }}>
                                            {rock.maxCapacity}
                                        </span>
                                        <span className="text-[10px] font-bold text-[#6BC482] tracking-widest mt-[-2px] uppercase" style={{ fontFamily: 'var(--font-barlow), sans-serif' }}>
                                            CAPACITY
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>
                    );
                })}
            </Swiper>

            {/* Notched Layout Shape - Seamless transition logic from original UI */}
            <div className="absolute bottom-0 left-0 right-0 pointer-events-none z-0 translate-y-1/2">
                <div className="flex justify-center items-center h-[80px]">
                    <div className="flex-grow h-full bg-[#08131B] rounded-br-[40px]" />
                    <div className="w-[220px] h-full" />
                    <div className="flex-grow h-full bg-[#08131B] rounded-bl-[40px]" />
                </div>
            </div>
        </div>
    );
}
