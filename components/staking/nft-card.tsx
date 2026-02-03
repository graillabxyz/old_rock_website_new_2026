'use client';

import React from 'react';
import Image from 'next/image';
import type { GoliathNFT, OldRocksNFT, GoliathStatuses } from '@/types/staking';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

// Density badge colors
const DENSITY_CLASSES: Record<string, string> = {
    COMMON: 'bg-gray-400 text-black',
    LOW: 'bg-green-500 text-white',
    MEDIUM: 'bg-cyan-400 text-black',
    HIGH: 'bg-purple-500 text-white',
    PURE: 'bg-amber-500 text-black',
    MYSTIC: 'bg-pink-500 text-white',
};

// Color indicator colors
const COLOR_MAP: Record<string, string> = {
    WHITE: '#FFFFFF',
    SILVER: '#B3B3B3',
    YELLOW: '#FEC42A',
    GOLD: '#EDA825',
    AQUAMARINE: '#46AA9A',
    TURQUOISE: '#257875',
    BLUE: '#3182AA',
    PURPLE: '#8856B9',
    RED: '#DC4537',
    BLACK: '#404040',
    NONE: '#808080',
};

interface NFTCardProps {
    nft: GoliathNFT | OldRocksNFT;
    type: 'rock' | 'goliath';
    isSelected?: boolean;
    isLinked?: boolean;
    isLoading?: boolean;
    status?: GoliathStatuses;
    onClick?: () => void;
    size?: 'sm' | 'md' | 'lg';
    showStatus?: boolean;
}

export function NFTCard({
    nft,
    type,
    isSelected = false,
    isLinked = false,
    isLoading = false,
    status,
    onClick,
    size = 'md',
    showStatus = true,
}: NFTCardProps) {
    const sizeClasses = {
        sm: 'w-20 h-20',
        md: 'w-32 h-32',
        lg: 'w-40 h-40',
    };

    const color = COLOR_MAP[nft.color?.toUpperCase()] || '#808080';
    const densityClass = DENSITY_CLASSES[nft.density] || DENSITY_CLASSES.COMMON;

    const getStatusLabel = (status?: GoliathStatuses) => {
        switch (status) {
            case 'linking':
                return 'Linking...';
            case 'unlinking':
                return 'Unlinking...';
            case 'moving':
                return 'Moving...';
            case 'checking':
                return 'Checking...';
            case 'failed':
                return 'Failed';
            case 'linked':
                return 'Linked';
            default:
                return null;
        }
    };

    const currentStatus = type === 'goliath' ? (nft as GoliathNFT).status || status : status;
    const statusLabel = getStatusLabel(currentStatus);
    const isProcessing = ['linking', 'unlinking', 'moving', 'checking'].includes(currentStatus || '');

    // Build image URL - API returns full URLs for imageId
    const imageUrl = nft.imageId
        ? nft.imageId.replace('.webp', '-600.webp')
        : '/images/placeholder-nft.png';

    return (
        <div
            onClick={!isLoading && !isProcessing ? onClick : undefined}
            className={cn(
                'relative rounded-xl overflow-hidden cursor-pointer transition-all duration-200',
                sizeClasses[size],
                isSelected && 'ring-2 ring-green-400 ring-offset-2 ring-offset-[#0B121B]',
                isLinked && !isSelected && 'ring-2 ring-green-400/40',
                isLoading || isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105',
                'bg-[#1F282E]'
            )}
            style={{
                boxShadow: isSelected
                    ? `0 0 25px ${color}60`
                    : isLinked
                        ? '0 0 15px rgba(107, 196, 130, 0.3)'
                        : 'none',
            }}
        >
            {/* NFT Image */}
            <div className="relative w-full h-full">
                <Image
                    src={imageUrl}
                    alt={nft.name || `#${nft.id}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 80px, 160px"
                    unoptimized
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                {/* Density badge */}
                <div
                    className={cn(
                        'absolute top-1 right-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase',
                        densityClass
                    )}
                >
                    {nft.density}
                </div>

                {/* Color indicator */}
                <div
                    className="absolute top-1 left-1 w-3 h-3 rounded-full border border-white/50"
                    style={{ backgroundColor: color }}
                />

                {/* Status indicator */}
                {showStatus && statusLabel && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/80 py-1 px-2 text-center">
                        <span className={cn(
                            'text-[10px] font-medium',
                            currentStatus === 'failed' ? 'text-red-400' :
                                currentStatus === 'linked' ? 'text-green-400' :
                                    'text-yellow-400'
                        )}>
                            {statusLabel}
                        </span>
                    </div>
                )}

                {/* Loading overlay */}
                {(isLoading || isProcessing) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                )}

                {/* NFT ID */}
                {!statusLabel && (
                    <div className="absolute bottom-1 left-1 text-[10px] text-white/90 font-mono font-bold">
                        #{nft.id}
                    </div>
                )}
            </div>
        </div>
    );
}

// Larger rock card for carousel
interface RockCardLargeProps {
    rock: OldRocksNFT;
    isSelected?: boolean;
    onClick?: () => void;
}

export function RockCardLarge({ rock, isSelected, onClick }: RockCardLargeProps) {
    const linkedCount = rock.linkedGoliaths?.length || 0;
    const color = COLOR_MAP[rock.color?.toUpperCase()] || '#808080';
    const densityClass = DENSITY_CLASSES[rock.density] || DENSITY_CLASSES.COMMON;
    const capacityPercent = Math.round((linkedCount / rock.maxCapacity) * 100);

    // Build image URL
    const imageUrl = rock.imageId
        ? rock.imageId.replace('.webp', '-600.webp')
        : '/images/placeholder-nft.png';

    return (
        <div
            onClick={onClick}
            className={cn(
                'relative w-[320px] h-[320px] rounded-[20px] overflow-hidden cursor-pointer transition-all',
                isSelected && 'ring-4 ring-green-400'
            )}
            style={{
                boxShadow: isSelected ? `0 0 40px ${color}50` : 'none',
            }}
        >
            <Image
                src={imageUrl}
                alt={rock.name || `Old Rock #${rock.id}`}
                fill
                className="object-cover"
                sizes="320px"
                unoptimized
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Top info bar */}
            <div className="absolute top-2 left-3 right-3 flex justify-between items-start">
                <div className="text-center">
                    <div className="text-2xl font-bold text-white" style={{ fontFamily: 'Din-Condensed, sans-serif' }}>
                        {rock.dailyReward.toFixed(1)}
                    </div>
                    <div className="text-[10px] text-green-400 uppercase">Base Rate</div>
                </div>

                <div className="text-center">
                    <div className="text-sm font-bold text-white">{rock.name}</div>
                </div>

                <div className="text-center">
                    <div className="text-2xl font-bold text-white" style={{ fontFamily: 'Din-Condensed, sans-serif' }}>
                        {rock.maxCapacity}
                    </div>
                    <div className="text-[10px] text-green-400 uppercase">Capacity</div>
                </div>
            </div>

            {/* Bottom info bar */}
            <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                <div className="flex flex-col gap-1">
                    <div className={cn('px-2 py-0.5 rounded text-xs font-bold uppercase', densityClass)}>
                        {rock.isPure ? 'PURE' : rock.density}
                    </div>
                    <div
                        className="px-2 py-0.5 rounded text-xs font-bold uppercase"
                        style={{
                            backgroundColor: color,
                            color: ['WHITE', 'SILVER', 'YELLOW', 'GOLD'].includes(rock.color?.toUpperCase()) ? '#000' : '#fff'
                        }}
                    >
                        {rock.color}
                    </div>
                </div>

                <div className="text-center">
                    <div className="text-2xl font-bold text-white" style={{ fontFamily: 'Din-Condensed, sans-serif' }}>
                        {linkedCount > 0 ? (rock.dailyReward * (1 + linkedCount * 0.1)).toFixed(2) : rock.dailyReward.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-green-400 uppercase">Daily Rate</div>
                </div>

                <div className="text-center">
                    <div className="text-2xl font-bold text-white" style={{ fontFamily: 'Din-Condensed, sans-serif' }}>
                        {linkedCount}/{rock.maxCapacity}
                    </div>
                    <div className="text-[10px] text-green-400 uppercase">Linked</div>
                </div>

                <div className="text-center">
                    <div className="text-2xl font-bold text-white" style={{ fontFamily: 'Din-Condensed, sans-serif' }}>
                        {capacityPercent}
                    </div>
                    <div className="text-[10px] text-green-400 uppercase">% Full</div>
                </div>
            </div>
        </div>
    );
}
