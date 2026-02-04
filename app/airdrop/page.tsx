'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Wallet,
    Trophy,
    Star,
    ExternalLink,
    Copy,
    Check,
    Loader2,
    Info,
    ChevronDown,
    ChevronUp,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import Image from 'next/image';

import { Header } from '@/components/header';
import { Sidebar } from '@/components/sidebar';
import { Footer } from '@/components/footer';
import { StakingProvider } from '@/components/staking/staking-provider';

import {
    useAchievementEventsWalletAddress,
    useAchievementEventsLeaderboard,
    useCommunityAchievements,
    useAmplifyAchievements,
    useDensityDeckAchievements,
    useSpecialAchievements,
    useAirdropSeasonSummary,
    useAirdropSeasonConfig,
    usePostAchievementEvent,
    useVerifyWallet,
    AIRDROP_CONFIG,
    type AchievementEvent,
} from '@/hooks/use-airdrop-data';

// ============================================
// Constants
// ============================================

const LEADERBOARD_RARITY_CLASSES: Record<string, string> = {
    'black': 'text-[#777777]',
    'white': 'text-[#FFFFFF]',
    'aquamarine': 'text-[#46AA9A]',
    'gold': 'text-[#EDA825]',
    'silver': 'text-[#B3B3B3]',
    'purple': 'text-[#8856B9]',
    'blue': 'text-[#3182AA]',
    'red': 'text-[#DC4537]',
    'turquoise': 'text-[#40E0D0]',
    'yellow': 'text-[#FEC42A]',
    'common': 'text-gray-500',
};

const LEADERBOARD_POSITION_FLAIR = [null, '👑', '🎖️', '🏅'];

const ACHIEVEMENT_LINKS: Record<string, { url: string; newTab: boolean }> = {
    // Community achievements
    'wallet-connect': { url: '#', newTab: false }, // Handled by RainbowKit connect button
    'wallet-verify': { url: '#verify', newTab: false }, // Triggers wallet verification
    'x-follow-oldrocknft': { url: 'https://twitter.com/intent/follow?screen_name=OldRockNft', newTab: true },
    'x-follow-densitydeck': { url: 'https://twitter.com/intent/follow?screen_name=DENSITYDECK', newTab: true },
    'x-link': { url: 'https://api.oldrocknft.com/oauth/x', newTab: true }, // Twitter OAuth link
    'discord-join-server': { url: 'https://discord.com/invite/oldrocknft', newTab: true },
    'discord-link': { url: 'https://api.oldrocknft.com/oauth/discord', newTab: true }, // Discord OAuth link
    'view-documentation': { url: 'https://docs.oldrocknft.com', newTab: true },
    // Amplify achievements
    'amplify-session': { url: '/staking', newTab: false },
    'amplify-create-link': { url: '/staking', newTab: false },
    'amplify-claim-1-day': { url: '/staking', newTab: false },
    'amplify-claim-3-days': { url: '/staking', newTab: false },
    // Density Deck achievements
    'density-deck-alpha': { url: 'https://densitydeck.com', newTab: true },
    'density-deck-play-1-game-daily': { url: 'https://densitydeck.com', newTab: true },
    'density-deck-win-1-game-daily': { url: 'https://densitydeck.com', newTab: true },
    'density-deck-win-3-games-daily': { url: 'https://densitydeck.com', newTab: true },
    'density-deck-win-5-games-daily': { url: 'https://densitydeck.com', newTab: true },
    // Special achievements
    'mint-goliath': { url: 'https://mint.oldrocknft.com/', newTab: true },
    'referral': { url: '#referral', newTab: false }, // Points to referral section on same page
    'airdrop-season-2': { url: '#', newTab: false }, // Historical achievement, no action needed
};

// ============================================
// Helper Functions
// ============================================

function truncateAddress(address: string, length: number = 6): string {
    return `${address.slice(0, length)}...${address.slice(-length)}`;
}

function formatCountdown(endDate: string): string {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${days}d ${hours}h ${minutes}m`;
}

// ============================================
// Sub-Components
// ============================================

interface AchievementCardProps {
    achievement: {
        id: string;
        description: string;
        value: number;
        renewable?: boolean;
    };
    isAchieved: boolean;
    achievedCount?: number;
    isConnected: boolean;
    onClick?: () => void;
}

function AchievementCard({ achievement, isAchieved, achievedCount, isConnected, onClick }: AchievementCardProps) {
    const emoji = achievement.description.split(' ')[0];
    const text = achievement.description
        .substring(achievement.description.indexOf(' ') + 1)
        .replace(/yellow goliath/gi, 'turquoise goliath')
        .replace(/neural /gi, '');

    const link = ACHIEVEMENT_LINKS[achievement.id];

    // Special handling for wallet-connect achievement
    // It should always be visible and show as completed when connected
    const isWalletConnectAchievement = achievement.id === 'wallet-connect';
    const showUnlocked = isConnected || isWalletConnectAchievement;
    const isWalletConnectCompleted = isWalletConnectAchievement && isConnected;

    const cardContent = (
        <div
            className={`
        relative rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer group flex flex-col h-full
        ${(isAchieved || isWalletConnectCompleted) && !achievement.renewable
                    ? 'bg-gray-900/40 border-white/5 opacity-60 grayscale'
                    : 'bg-gray-900/60 backdrop-blur-xl border border-white/10 hover:border-[#40E0D0]/40 hover:bg-gray-800/60 shadow-xl'
                }
        ${!showUnlocked ? 'grayscale opacity-50' : ''}
      `}
            onClick={onClick}
        >
            {/* Top Bar / Status */}
            <div className={`
                h-1 w-full
                ${(isAchieved || isWalletConnectCompleted) && !achievement.renewable ? 'bg-gray-800' : 'bg-gradient-to-r from-[#40E0D0] to-purple-500'}
            `} />

            <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-start gap-4 mb-4">
                    <div className="text-3xl flex-shrink-0 w-12 h-12 flex items-center justify-center bg-white/5 rounded-xl border border-white/5 group-hover:bg-[#40E0D0]/10 group-hover:border-[#40E0D0]/20 transition-all">
                        {showUnlocked ? emoji : '🔒'}
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                        <h4 className="text-white font-black text-sm leading-tight mb-1 group-hover:text-[#40E0D0] transition-colors font-montserrat tracking-tight">
                            {showUnlocked ? text.replace(/\(repeatable.*\)/, '') : 'Authorization Locked'}
                        </h4>
                        {isConnected && achievement.renewable && (
                            <span className="inline-block px-1.5 py-0.5 rounded bg-[#40E0D0]/10 text-[#40E0D0] text-[9px] font-black tracking-widest uppercase mb-2">RECURRING</span>
                        )}
                        {/* Remove manual Verify Mint button - backend handles automatically */}
                    </div>
                </div>

                <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex flex-col">
                        <span className="text-gray-500 text-[9px] font-black tracking-widest uppercase">Allocation</span>
                        <div className="flex items-baseline gap-1">
                            <span className={`text-lg font-black font-montserrat ${(isAchieved || isWalletConnectCompleted) && !achievement.renewable ? 'text-gray-500' : 'text-[#40E0D0] group-hover:drop-shadow-[0_0_8px_rgba(64,224,208,0.6)]'}`}>
                                {showUnlocked ? achievement.value.toLocaleString() : '??'}
                            </span>
                            <span className="text-[10px] font-bold text-gray-600 uppercase">PTS</span>
                        </div>
                    </div>

                    <div className="text-right">
                        <span className="text-gray-500 text-[9px] font-black tracking-widest uppercase block">Status</span>
                        {(isAchieved || isWalletConnectCompleted) ? (
                            <div className="flex items-center gap-1.5 text-[#40E0D0]">
                                <Check className="w-3 h-3" />
                                <span className="text-[10px] font-black font-montserrat uppercase">SYNCED {achievedCount && achievedCount > 1 ? `x${achievedCount}` : ''}</span>
                            </div>
                        ) : (
                            <span className="text-[10px] font-black font-montserrat text-gray-600 uppercase tracking-wider">AVAILABLE</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Hover Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#40E0D0]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </div>
    );

    if (link && isConnected) {
        return (
            <a
                href={link.url}
                target={link.newTab ? '_blank' : '_self'}
                rel={link.newTab ? 'noopener noreferrer' : undefined}
                className="block"
            >
                {cardContent}
            </a>
        );
    }

    return cardContent;
}

interface LeaderboardRowProps {
    entry: {
        position: number;
        walletAddress: string;
        ensName?: string | null;
        total?: number;
        points?: number; // legacy field
        rarity: string | { color: string; multiplier: number } | null | undefined;
    };
    isCurrentUser: boolean;
}

function LeaderboardRow({ entry, isCurrentUser }: LeaderboardRowProps) {
    // Display name: ENS name if available, otherwise truncated address
    const displayName = entry.ensName || truncateAddress(entry.walletAddress);

    return (
        <div className={`
      flex items-center justify-between p-4 rounded-xl border transition-all duration-300 group
      ${isCurrentUser
                ? 'bg-[#40E0D0]/10 border-[#40E0D0]/40 shadow-[0_0_20px_rgba(64,224,208,0.1)]'
                : 'bg-gray-900/40 border-white/5 hover:bg-gray-800/40 hover:border-white/10'
            }
    `}>
            <div className="flex items-center gap-6">
                <span className={`text-xl font-black w-10 font-montserrat tracking-tight ${entry.position <= 3 ? 'text-[#40E0D0]' : 'text-gray-500'}`}>
                    #{entry.position}
                </span>
                <div className="flex flex-col">
                    <span className="text-white font-pt-mono text-sm font-bold flex items-center gap-2">
                        {displayName}
                        {isCurrentUser && <span className="text-[10px] bg-[#40E0D0]/20 text-[#40E0D0] px-1.5 py-0.5 rounded uppercase leading-none">You</span>}
                    </span>
                </div>
            </div>
            <div className="text-right">
                <span className="text-white font-black font-montserrat tracking-tight text-xl">
                    {(entry.total ?? entry.points ?? 0).toLocaleString()}
                </span>
                <span className="text-[10px] text-gray-500 font-bold block -mt-1 uppercase">PTS</span>
            </div>
        </div>
    );
}

// ============================================
// Main Component
// ============================================

function AirdropDashboardContent() {
    const { address, isConnected } = useAccount();
    const [clipboardCopied, setClipboardCopied] = useState(false);
    const [expandedSection, setExpandedSection] = useState<string | null>('community');
    const [leaderboardSeason, setLeaderboardSeason] = useState(AIRDROP_CONFIG.currentSeason);
    const [visibleLeaderboardCount, setVisibleLeaderboardCount] = useState(20);

    // Generate namespace for the selected leaderboard season
    const leaderboardNamespace = `airdrop-season-${leaderboardSeason}`;

    // Data hooks
    const { data: walletEvents, isLoading: loadingWalletEvents, refetch: refetchWalletEvents } = useAchievementEventsWalletAddress();
    const { data: leaderboard, isLoading: loadingLeaderboard } = useAchievementEventsLeaderboard(leaderboardNamespace);
    const { data: communityAchievements, isLoading: loadingCommunity } = useCommunityAchievements();
    const { data: amplifyAchievements, isLoading: loadingAmplify } = useAmplifyAchievements();
    const { data: densityDeckAchievements, isLoading: loadingDensityDeck } = useDensityDeckAchievements();
    const { data: specialAchievements, isLoading: loadingSpecial } = useSpecialAchievements();
    const { data: seasonSummary } = useAirdropSeasonSummary(1);
    const { data: seasonConfig } = useAirdropSeasonConfig();

    const postAchievement = usePostAchievementEvent();
    const verifyWallet = useVerifyWallet();

    // Wallet verification message
    const { signMessageAsync } = useSignMessage();

    // Get season end date from API - only use if API provides one
    // seasonConfig.seasonEnd will be from API if available, or null if endpoint doesn't exist
    const hasApiEndDate = seasonConfig?.seasonEnd && seasonConfig.seasonEnd !== AIRDROP_CONFIG.seasonEnd;
    const [countdown, setCountdown] = useState<string>('TBA');

    // Countdown timer - only calculate if we have a valid API end date
    useEffect(() => {
        if (hasApiEndDate && seasonConfig?.seasonEnd) {
            setCountdown(formatCountdown(seasonConfig.seasonEnd));
            const timer = setInterval(() => {
                setCountdown(formatCountdown(seasonConfig.seasonEnd));
            }, 60000);
            return () => clearInterval(timer);
        } else {
            // No API date available - show ???
            setCountdown('TBA');
        }
    }, [hasApiEndDate, seasonConfig?.seasonEnd]);

    // Build achieved map
    const achievedMap = useMemo(() => {
        const map: Record<string, { count: number; created: string }> = {};
        walletEvents?.events?.forEach((event: AchievementEvent) => {
            if (!map[event.id]) {
                map[event.id] = { count: 1, created: event.created };
            } else {
                map[event.id].count += 1;
            }
        });
        return map;
    }, [walletEvents]);

    // Calculate user rank - priority: walletEvents.leaderboard.position > find in leaderboard array
    const userRank = useMemo(() => {
        // First try the direct position from walletEvents
        if (walletEvents?.leaderboard?.position) {
            return walletEvents.leaderboard.position;
        }

        // Fallback: find user's position in the leaderboard data
        // Note: leaderboard is an array directly, not an object with entries
        if (address && Array.isArray(leaderboard)) {
            const userIndex = leaderboard.findIndex(
                (entry: { walletAddress?: string }) => entry.walletAddress?.toLowerCase() === address.toLowerCase()
            );
            if (userIndex !== -1) {
                return userIndex + 1; // Convert 0-based index to 1-based rank
            }
        }

        return null;
    }, [walletEvents, leaderboard, address]);

    // Check social links
    const hasLinkedX = useMemo(() => achievedMap['x-link'], [achievedMap]);
    const hasLinkedDiscord = useMemo(() => achievedMap['discord-link'], [achievedMap]);
    const isSociallyVerified = hasLinkedX && hasLinkedDiscord;

    // Referral link
    const referralLink = walletEvents?.referral?.code
        ? `${typeof window !== 'undefined' ? window.location.origin : ''}/airdrop?from=${walletEvents.referral.code}`
        : null;

    // Copy referral link
    const handleCopyReferral = useCallback(() => {
        if (referralLink) {
            navigator.clipboard.writeText(referralLink);
            setClipboardCopied(true);
            setTimeout(() => setClipboardCopied(false), 2000);
        }
    }, [referralLink]);

    // Handle wallet verification
    const handleVerifyWallet = useCallback(async () => {
        if (!address) return;

        try {
            const signature = await signMessageAsync({ message: 'Verify wallet for Old Rock Airdrop' });
            await verifyWallet.mutateAsync({ walletAddress: address, signature });
            refetchWalletEvents();
        } catch (error) {
            console.error('Verification failed:', error);
        }
    }, [address, signMessageAsync, verifyWallet, refetchWalletEvents]);

    // Handle achievement click
    const handleAchievementClick = useCallback(async (achievementId: string) => {
        if (!isConnected) return;

        // Track certain achievements and handle blockchain verification
        if ([
            'x-follow-oldrocknft',
            'x-follow-densitydeck',
            'view-documentation',
            'mint-goliath',
            'mint-goliath-color-match-low',
            'mint-goliath-color-match-medium',
            'mint-goliath-color-match-high'
        ].includes(achievementId)) {
            postAchievement.mutate({
                achievementId,
                namespace: AIRDROP_CONFIG.seasonNamespace
            });
        }
    }, [isConnected, postAchievement]);

    // Check if season is live
    const seasonLive = new Date() > new Date(AIRDROP_CONFIG.seasonStart) &&
        new Date() < new Date(AIRDROP_CONFIG.seasonEnd);

    // Sidebar state
    const [isWalletConnected, setIsWalletConnected] = useState(false);
    const [userProfile, setUserProfile] = useState<any>(null);

    useEffect(() => {
        if (isConnected && address) {
            setIsWalletConnected(true);
            setUserProfile({
                name: truncateAddress(address),
                address,
            });
        } else {
            setIsWalletConnected(false);
            setUserProfile(null);
        }
    }, [isConnected, address]);

    // Section toggle
    const toggleSection = (section: string) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    const renderAchievementSection = (
        title: string,
        sectionId: string,
        achievements: any[] | undefined,
        isLoading: boolean
    ) => {
        const isExpanded = expandedSection === sectionId;

        return (
            <div className="mb-12">
                <div className="flex items-center gap-4 mb-6">
                    <h3 className="text-3xl font-black text-white uppercase tracking-tight font-montserrat">
                        {title}
                    </h3>
                    <div className="h-[1px] flex-1 bg-gradient-to-r from-gray-800 to-transparent" />
                    <button
                        onClick={() => toggleSection(sectionId)}
                        className="text-gray-500 hover:text-white transition-colors flex items-center gap-2 text-sm font-bold font-pt-mono uppercase"
                    >
                        {isExpanded ? 'Hide' : 'Show'}
                        {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                        ) : (
                            <ChevronDown className="w-4 h-4" />
                        )}
                    </button>
                </div>

                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.4, ease: "circOut" }}
                            className="overflow-hidden"
                        >
                            {isLoading ? (
                                <div className="flex justify-center py-12">
                                    <Loader2 className="w-10 h-10 animate-spin text-[#40E0D0]" />
                                </div>
                            ) : achievements?.length ? (
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    {achievements.map((achievement: any, idx: number) => (
                                        <AchievementCard
                                            key={`${sectionId}-${idx}`}
                                            achievement={achievement}
                                            isAchieved={!!achievedMap[achievement.id]}
                                            achievedCount={achievedMap[achievement.id]?.count}
                                            isConnected={isConnected}
                                            onClick={() => handleAchievementClick(achievement.id)}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-gray-900/20 rounded-2xl border border-white/5 py-12 text-center">
                                    <p className="text-gray-600 italic font-pt-mono">No assignments detected in this quadrant</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    return (
        <div className="flex">
            <Sidebar isWalletConnected={isWalletConnected} userProfile={userProfile} />

            <div className="min-h-screen text-white overflow-hidden relative w-full lg:ml-[79px]">
                {/* Custom Airdrop Background */}
                <div className="fixed inset-0 z-0">
                    <Image
                        src="/turquoisebgairdrop.webp"
                        alt="Airdrop Background"
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
                </div>

                <Header />

                <main className="relative z-10 pt-32 pb-20 px-[5%] max-w-[1600px] mx-auto">
                    {/* Hero Section */}
                    <div className="flex flex-col lg:flex-row gap-12 items-center justify-between mb-16 px-4">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-left lg:max-w-2xl"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <span className="w-12 h-[2px] bg-[#40E0D0]" />
                                <span className="text-[#40E0D0] text-sm font-bold font-pt-mono tracking-widest uppercase">
                                    Old Rock Amplify Rewards
                                </span>
                            </div>
                            <h1 className="text-6xl md:text-8xl font-black uppercase mb-4 font-montserrat tracking-tight relative">
                                <span className="text-[#40E0D0] drop-shadow-[0_0_20px_rgba(64,224,208,0.6)]">
                                    $DENSITY
                                </span>
                                <br />
                                <span className="text-white">AIRDROP</span>
                            </h1>
                            <p className="text-gray-400 text-lg md:text-xl font-pt-mono leading-relaxed max-w-lg">
                                Participate in the ecosystem, complete achievements, and climb the leaderboard to earn your share of the $DENSITY airdrop in Season {AIRDROP_CONFIG.currentSeason}.
                            </p>

                            <div className="mt-8 flex flex-wrap gap-6 items-center">
                                <div className="flex flex-col">
                                    <span className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Season Duration</span>
                                    <div className="flex items-center gap-2 text-white font-montserrat font-black text-xl tracking-tight">
                                        {countdown} <span className="text-gray-500 text-sm font-normal">REMAINING</span>
                                    </div>
                                </div>
                                <div className="w-[1px] h-10 bg-gray-800 hidden sm:block" />
                                <div className="flex flex-col">
                                    <span className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Active Season</span>
                                    <span className="text-[#40E0D0] font-montserrat font-black text-xl uppercase italic tracking-tight">Season {AIRDROP_CONFIG.currentSeason} / Turquoise</span>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="relative w-full max-w-[200px] lg:max-w-[250px] aspect-square"
                        >
                            <div className="relative h-full w-full bg-gray-900/40 backdrop-blur-xl rounded-3xl border border-white/5 overflow-hidden flex items-center justify-center p-6 group">
                                <div className="relative z-10 w-full h-full">
                                    <Image
                                        src="/images/density-white.svg"
                                        alt="Density Logo"
                                        fill
                                        className="object-contain opacity-80 group-hover:opacity-100 transition-opacity drop-shadow-[0_0_20px_rgba(64,224,208,0.3)]"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Stats Bar */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                        {/* Current Season */}
                        <div className="group bg-gray-900/40 backdrop-blur-md rounded-2xl p-6 border border-white/5 hover:border-[#40E0D0]/30 transition-all duration-300">
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Current Season</p>
                            <p className="text-3xl font-black text-[#40E0D0] font-montserrat tracking-tight uppercase">
                                SEASON {AIRDROP_CONFIG.currentSeason}
                            </p>
                            <p className="text-xs text-gray-600 mt-2 font-pt-mono uppercase">Phase: Turquoise</p>
                        </div>

                        {/* Rank */}
                        <div className="group bg-gray-900/40 backdrop-blur-md rounded-2xl p-6 border border-white/5 hover:border-[#40E0D0]/30 transition-all duration-300">
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Your Rank</p>
                            {isConnected ? (
                                (loadingWalletEvents || loadingLeaderboard) ? (
                                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <p className="text-4xl font-black text-white font-montserrat tracking-tight">
                                            #{userRank || '-'}
                                        </p>
                                        {userRank && userRank <= 3 && (
                                            <span className="text-2xl">{LEADERBOARD_POSITION_FLAIR[userRank]}</span>
                                        )}
                                    </div>
                                )
                            ) : (
                                <p className="text-gray-600 italic font-pt-mono text-sm mt-1">Wallet restricted</p>
                            )}
                        </div>

                        {/* Points */}
                        <div className="group bg-gray-900/40 backdrop-blur-md rounded-2xl p-6 border border-white/5 hover:border-[#40E0D0]/30 transition-all duration-300">
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Total Points</p>
                            {isConnected ? (
                                loadingWalletEvents ? (
                                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                                ) : (
                                    <p className="text-4xl font-black text-white font-montserrat tracking-tight">
                                        {walletEvents?.events?.reduce((sum: number, e: AchievementEvent) => sum + e.value, 0)?.toLocaleString() || '0'}
                                    </p>
                                )
                            ) : (
                                <p className="text-gray-600 italic font-pt-mono text-sm mt-1">Wallet restricted</p>
                            )}
                        </div>
                    </div>

                    {/* Connect Wallet CTA (if not connected) */}
                    {!isConnected && (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-br from-gray-900/60 to-black/40 backdrop-blur-xl rounded-[2.5rem] p-12 mb-20 text-center border border-white/5 relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-[#40E0D0]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative z-10 flex flex-col items-center">
                                <div className="w-20 h-20 rounded-2xl bg-[#40E0D0]/10 flex items-center justify-center mb-6 border border-[#40E0D0]/20 shadow-[0_0_30px_rgba(64,224,208,0.1)]">
                                    <Wallet className="w-10 h-10 text-[#40E0D0]" />
                                </div>
                                <h2 className="text-4xl font-black mb-4 font-montserrat uppercase tracking-tight">Initialize Connection</h2>
                                <p className="text-gray-400 mb-8 max-w-md mx-auto font-pt-mono leading-relaxed">
                                    Authenticate your connection to access the Old Rock Rewards network. Climb the rankings and secure your $DENSITY allocation.
                                </p>
                                <div className="flex justify-center scale-110">
                                    <ConnectButton />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Referral Link (if connected) */}
                    {isConnected && referralLink && (
                        <div className="bg-gray-900/40 backdrop-blur-md rounded-3xl p-8 mb-20 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 group">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <Star className="w-4 h-4 text-[#40E0D0]" />
                                    <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">Referral Link</span>
                                </div>
                                <p className="text-white font-mono text-sm break-all bg-black/40 p-4 rounded-xl border border-white/5 selection:bg-[#40E0D0]/30">
                                    {referralLink}
                                </p>
                            </div>
                            <button
                                onClick={handleCopyReferral}
                                className="flex-shrink-0 flex items-center gap-3 bg-[#40E0D0] hover:bg-[#36c1b3] text-black px-8 py-4 rounded-2xl font-black font-montserrat tracking-tight transition-all shadow-[0_0_30px_rgba(64,224,208,0.2)] hover:shadow-[0_0_40px_rgba(64,224,208,0.4)] hover:scale-105 active:scale-95 text-lg uppercase"
                            >
                                {clipboardCopied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                {clipboardCopied ? 'Copied' : 'Copy Link'}
                            </button>
                        </div>
                    )}

                    {/* Achievement Sections */}
                    {renderAchievementSection('Community Achievements', 'community', communityAchievements, loadingCommunity)}
                    {renderAchievementSection('Amplify Achievements', 'amplify', amplifyAchievements, loadingAmplify)}
                    {renderAchievementSection('Density Deck Achievements', 'densitydeck', densityDeckAchievements, loadingDensityDeck)}
                    {renderAchievementSection('Special Achievements', 'special', specialAchievements, loadingSpecial)}

                    {/* Leaderboard */}
                    <div className="mb-20">
                        <div className="flex items-center gap-4 mb-8">
                            <h3 className="text-3xl font-black text-white uppercase tracking-tight font-montserrat flex items-center gap-3">
                                <Trophy className="w-10 h-10 text-[#40E0D0] drop-shadow-[0_0_10px_rgba(64,224,208,0.4)]" />
                                Rankings
                            </h3>
                            <div className="h-[1px] flex-1 bg-gradient-to-r from-gray-800 to-transparent" />

                            {/* Season Navigation */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setLeaderboardSeason(prev => Math.max(1, prev - 1))}
                                    disabled={leaderboardSeason <= 1 || loadingLeaderboard}
                                    className="p-2 rounded-lg bg-gray-800/60 border border-gray-700 hover:bg-gray-700/60 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                    title="Previous season"
                                >
                                    <ChevronLeft className="w-5 h-5 text-white" />
                                </button>
                                <div className="px-4 py-2 bg-gray-800/60 border border-gray-700 rounded-lg min-w-[120px] text-center">
                                    <span className="text-[#40E0D0] font-bold font-pt-mono text-sm">
                                        Season {leaderboardSeason}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setLeaderboardSeason(prev => Math.min(AIRDROP_CONFIG.currentSeason, prev + 1))}
                                    disabled={leaderboardSeason >= AIRDROP_CONFIG.currentSeason || loadingLeaderboard}
                                    className="p-2 rounded-lg bg-gray-800/60 border border-gray-700 hover:bg-gray-700/60 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                    title="Next season"
                                >
                                    <ChevronRight className="w-5 h-5 text-white" />
                                </button>
                            </div>
                        </div>

                        {loadingLeaderboard ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="w-10 h-10 animate-spin text-[#40E0D0]" />
                            </div>
                        ) : leaderboard?.length ? (
                            <div className="space-y-4">
                                {leaderboard.slice(0, visibleLeaderboardCount).map((entry: any, idx: number) => (
                                    <LeaderboardRow
                                        key={idx}
                                        entry={{ ...entry, position: idx + 1 }}
                                        isCurrentUser={entry.walletAddress?.toLowerCase() === address?.toLowerCase()}
                                    />
                                ))}
                                {visibleLeaderboardCount < leaderboard.length && (
                                    <div className="flex justify-center pt-4">
                                        <button
                                            onClick={() => setVisibleLeaderboardCount(prev => Math.min(prev + 20, leaderboard.length))}
                                            className="px-6 py-3 bg-gray-800/60 hover:bg-gray-700/60 border border-gray-700 rounded-lg text-white font-pt-mono text-sm transition-all"
                                        >
                                            Load More ({Math.min(20, leaderboard.length - visibleLeaderboardCount)} remaining)
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-gray-900/20 rounded-2xl border border-white/5 py-12 text-center">
                                <p className="text-gray-600 italic font-pt-mono">No network ranking data found</p>
                            </div>
                        )}
                    </div>
                </main>

                <Footer />
            </div>
        </div>
    );
}

export default function AirdropPage() {
    return (
        <StakingProvider>
            <AirdropDashboardContent />
        </StakingProvider>
    );
}
