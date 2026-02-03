'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import {
    getAchievementEventsWalletAddress,
    getAchievementEventsLeaderboard,
    getAchievementsList,
    getAirdropSeasonSummary,
    getAirdropSeasonConfig,
    postAchievementEvent,
    verifyWallet,
    verifyX,
    verifyDiscord,
} from '@/app/actions/airdrop-api';

// ============================================
// Configuration
// ============================================

export const AIRDROP_CONFIG = {
    currentSeason: 3,
    seasonNamespace: 'airdrop-season-3',
    densityDeckStart: '2025-04-14T23:00:00.000+00:00',
    airdropLive: '2025-04-01T01:00:00.000+00:00',
    seasonStart: '2025-11-01T00:00:00.000+00:00',
    seasonEnd: '2026-01-31T23:59:59.000+00:00',
};

// ============================================
// Achievement Events for Wallet
// ============================================

export function useAchievementEventsWalletAddress(namespace: string = AIRDROP_CONFIG.seasonNamespace) {
    const { address } = useAccount();

    return useQuery({
        queryKey: ['achievementEventsWallet', address, namespace],
        queryFn: async () => {
            if (!address) return null;
            const result = await getAchievementEventsWalletAddress(address, namespace);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
        enabled: !!address,
        refetchOnWindowFocus: false,
        staleTime: 30000, // 30 seconds
    });
}

// ============================================
// Leaderboard
// ============================================

export function useAchievementEventsLeaderboard(namespace: string = AIRDROP_CONFIG.seasonNamespace) {
    return useQuery({
        queryKey: ['achievementEventsLeaderboard', namespace],
        queryFn: async () => {
            const result = await getAchievementEventsLeaderboard(namespace);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
        refetchOnWindowFocus: false,
        staleTime: 60000, // 1 minute
    });
}

// ============================================
// Achievements List - Static Fallback for Season 3
// ============================================

// Static achievement definitions for Season 3 (API endpoints returning 404)
const SEASON_3_ACHIEVEMENTS = {
    community: [
        { id: 'wallet-connect', description: '🔗 Connect Your Wallet', value: 10, renewable: false },
        { id: 'discord-join-server', description: '💬 Join the Old Rock Discord server', value: 5, renewable: false },
        { id: 'x-follow-oldrocknft', description: '🐦 Follow @OldRockNFT on X', value: 5, renewable: false },
        { id: 'x-follow-densitydeck', description: '🎴 Follow @DENSITYDECK on X', value: 5, renewable: false },
        { id: 'view-documentation', description: '📖 View the Old Rock documentation', value: 5, renewable: false },
    ],
    amplify: [
        { id: 'amplify-session', description: '📡 Access Amplify', value: 10, renewable: false },
        { id: 'amplify-create-link', description: '🔗 Create a link within Amplify', value: 20, renewable: false },
        { id: 'amplify-claim-1-day', description: '🧲 Extract from Amplify (repeatable per day*)', value: 10, renewable: true },
        { id: 'amplify-claim-3-days', description: '📅 Extract from Amplify 3 days* in a row', value: 70, renewable: false },
    ],
    densityDeck: [
        { id: 'density-deck-play-1-game-daily', description: '🔥 Play a game of Density Deck (repeatable per day*)', value: 10, renewable: true },
        { id: 'density-deck-win-1-game-daily', description: '🤑 Win a game of Density Deck (repeatable per day*)', value: 20, renewable: true },
        { id: 'density-deck-win-3-games-daily', description: '3️⃣ Win 3 games of Density Deck (repeatable per day*)', value: 50, renewable: true },
        { id: 'density-deck-win-5-games-daily', description: '5️⃣ Win 5 games of Density Deck (repeatable per day*)', value: 80, renewable: true },
    ],
    special: [
        { id: 'airdrop-season-2', description: '🪂 Participate in Airdrop Season 2', value: 150, renewable: false },
        { id: 'mint-goliath', description: '🗿 Mint a Goliath NFT', value: 50, renewable: false },
    ],
};

export function useAchievementsList(namespace: string) {
    return useQuery({
        queryKey: ['achievementsList', namespace],
        queryFn: async () => {
            const result = await getAchievementsList(namespace);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
        refetchOnWindowFocus: false,
        staleTime: 300000, // 5 minutes
    });
}

// Convenience hooks for specific achievement categories with static fallback
export function useCommunityAchievements() {
    return useQuery({
        queryKey: ['communityAchievements'],
        queryFn: async () => {
            try {
                const result = await getAchievementsList('airdrop-community');
                if (result.success && result.data) return result.data;
            } catch (e) { /* fallback to static */ }
            return SEASON_3_ACHIEVEMENTS.community;
        },
        refetchOnWindowFocus: false,
        staleTime: 300000,
    });
}

export function useAmplifyAchievements() {
    return useQuery({
        queryKey: ['amplifyAchievements'],
        queryFn: async () => {
            try {
                const result = await getAchievementsList('airdrop-amplify');
                if (result.success && result.data) return result.data;
            } catch (e) { /* fallback to static */ }
            return SEASON_3_ACHIEVEMENTS.amplify;
        },
        refetchOnWindowFocus: false,
        staleTime: 300000,
    });
}

export function useDensityDeckAchievements() {
    return useQuery({
        queryKey: ['densityDeckAchievements'],
        queryFn: async () => {
            try {
                const result = await getAchievementsList('airdrop-density-deck');
                if (result.success && result.data) return result.data;
            } catch (e) { /* fallback to static */ }
            return SEASON_3_ACHIEVEMENTS.densityDeck;
        },
        refetchOnWindowFocus: false,
        staleTime: 300000,
    });
}

export function useSpecialAchievements() {
    return useQuery({
        queryKey: ['specialAchievements'],
        queryFn: async () => {
            try {
                const result = await getAchievementsList('airdrop-special');
                if (result.success && result.data) return result.data;
            } catch (e) { /* fallback to static */ }
            return SEASON_3_ACHIEVEMENTS.special;
        },
        refetchOnWindowFocus: false,
        staleTime: 300000,
    });
}

// ============================================
// Airdrop Season Summary
// ============================================

export function useAirdropSeasonSummary(season: number = 1) {
    const { address } = useAccount();

    return useQuery({
        queryKey: ['airdropSeasonSummary', address, season],
        queryFn: async () => {
            if (!address) return null;
            const result = await getAirdropSeasonSummary(address, season);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
        enabled: !!address,
        refetchOnWindowFocus: false,
        staleTime: 60000, // 1 minute
    });
}

// ============================================
// Airdrop Season Config (dates from API)
// ============================================

export function useAirdropSeasonConfig(namespace: string = AIRDROP_CONFIG.seasonNamespace) {
    return useQuery({
        queryKey: ['airdropSeasonConfig', namespace],
        queryFn: async () => {
            const result = await getAirdropSeasonConfig(namespace);
            // If API returns null or fails, use the fallback config
            if (!result.data) {
                return {
                    seasonStart: AIRDROP_CONFIG.seasonStart,
                    seasonEnd: AIRDROP_CONFIG.seasonEnd,
                    currentSeason: AIRDROP_CONFIG.currentSeason,
                };
            }
            return result.data;
        },
        refetchOnWindowFocus: false,
        staleTime: 300000, // 5 minutes - season config doesn't change often
    });
}

// ============================================
// Achievement Event Mutations
// ============================================

export function usePostAchievementEvent() {
    const queryClient = useQueryClient();
    const { address } = useAccount();

    return useMutation({
        mutationFn: async ({ achievementId, namespace }: { achievementId: string; namespace: string }) => {
            if (!address) throw new Error('Wallet not connected');
            const result = await postAchievementEvent(address, achievementId, namespace);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
        onSuccess: () => {
            // Invalidate achievement events to refetch
            queryClient.invalidateQueries({ queryKey: ['achievementEventsWallet'] });
        },
    });
}

// ============================================
// Verification Mutations
// ============================================

export function useVerifyWallet() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ walletAddress, signature, referralCode }: {
            walletAddress: string;
            signature: string;
            referralCode?: string;
        }) => {
            const result = await verifyWallet(walletAddress, signature, referralCode);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['achievementEventsWallet'] });
        },
    });
}

export function useVerifyX() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ walletAddress, signature, referralCode }: {
            walletAddress: string;
            signature: string;
            referralCode?: string;
        }) => {
            const result = await verifyX(walletAddress, signature, referralCode);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['achievementEventsWallet'] });
        },
    });
}

export function useVerifyDiscord() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ walletAddress, signature, referralCode }: {
            walletAddress: string;
            signature: string;
            referralCode?: string;
        }) => {
            const result = await verifyDiscord(walletAddress, signature, referralCode);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['achievementEventsWallet'] });
        },
    });
}

// ============================================
// Helper Types
// ============================================

export interface AchievementEvent {
    id: string;
    description: string;
    value: number;
    created: string;
    renewable?: boolean;
}

export interface LeaderboardEntry {
    position: number;
    walletAddress: string;
    points: number;
    multiplier: number;
    rarity: string;
}

export interface AchievementEventsData {
    events: AchievementEvent[];
    leaderboard?: {
        position: number;
        multiplier: number;
    };
    referral?: {
        code: string;
    };
}
