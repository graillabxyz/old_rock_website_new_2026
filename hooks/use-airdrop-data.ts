'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import {
    getAchievementEventsWalletAddress,
    getAchievementEventsLeaderboard,
    getAchievementsList,
    getAirdropSeasonSummary,
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
// Achievements List
// ============================================

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

// Convenience hooks for specific achievement categories
export function useCommunityAchievements() {
    return useAchievementsList('airdrop-community');
}

export function useAmplifyAchievements() {
    return useAchievementsList('airdrop-amplify');
}

export function useDensityDeckAchievements() {
    return useAchievementsList('airdrop-density-deck');
}

export function useSpecialAchievements() {
    return useAchievementsList('airdrop-special');
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
