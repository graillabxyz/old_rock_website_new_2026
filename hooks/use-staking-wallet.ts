'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAccount, useSignMessage } from 'wagmi';
import { useStakingStore } from '@/lib/staking-store';
import { MESSAGES } from '@/lib/staking-constants';
import * as api from '@/lib/staking-api';
import type { GoliathNFT, OldRocksNFT } from '@/types/staking';

// Hook to get NFTs for the connected wallet
export function useStakingNFTs() {
    const { address } = useAccount();
    const { setAllRocks, setAllGoliaths, setCoordinates } = useStakingStore();

    const query = useQuery({
        queryKey: ['staking-nfts', address],
        queryFn: async () => {
            if (!address) {
                return { goliaths: [], oldRocks: [], totalDailyReward: 0 };
            }

            try {
                const res = await api.getNFTs(address);
                const goliaths: GoliathNFT[] = res.data?.Goliath || [];
                const oldRocks: OldRocksNFT[] = res.data?.OldRocks || [];
                const totalDailyReward: number = res.data?.TotalDailyReward || 0;

                setAllRocks(oldRocks);
                setAllGoliaths(goliaths);

                return { goliaths, oldRocks, totalDailyReward };
            } catch (error) {
                setCoordinates(0, document.body?.scrollTop || document.documentElement?.scrollTop || 0);
                throw error;
            }
        },
        enabled: !!address,
        retry: true,
        retryDelay: (attempt) => attempt * 1000,
        refetchOnWindowFocus: true,
    });

    return {
        allGoliaths: query.data?.goliaths || [],
        allRocks: query.data?.oldRocks || [],
        totalDailyReward: query.data?.totalDailyReward || 0,
        isLoading: query.isLoading,
        isError: query.isError,
        refetch: query.refetch,
    };
}

// Hook to get unclaimed density
export function useUnclaimedDensity() {
    const { address } = useAccount();

    const query = useQuery({
        queryKey: ['unclaimed-density', address],
        queryFn: async () => {
            if (!address) return 0;
            const res = await api.getUnclaimedDensity(address);
            return parseFloat(res.data || '0');
        },
        enabled: !!address,
        retry: true,
        retryDelay: (attempt) => attempt * 1000,
        refetchOnWindowFocus: false,
    });

    return {
        unclaimedDensity: query.data || 0,
        isFetching: query.isFetching,
        refetch: query.refetch,
    };
}

// Hook to get total density
export function useDensity() {
    const { address } = useAccount();

    const query = useQuery({
        queryKey: ['density', address],
        queryFn: async () => {
            if (!address) return null;
            const res = await api.getDensity(address);
            return res.data;
        },
        enabled: !!address,
        retry: true,
        retryDelay: (attempt) => attempt * 1000,
        refetchOnWindowFocus: false,
    });

    return {
        amountDensity: query.data?.amount,
        amountDensityAllocated: query.data?.amountAllocated,
        amountDensityLocked: query.data?.amountLocked,
        fees: query.data?.fees,
        isFetching: query.isFetching,
        refetch: query.refetch,
    };
}

// Hook for wallet signature actions
export function useStakingSignatures() {
    const { signMessageAsync: signCreateLink } = useSignMessage({
        message: MESSAGES.AllowNFTLink,
    });

    const { signMessageAsync: signDeleteLink } = useSignMessage({
        message: MESSAGES.AllowNFTUnlink,
    });

    const { signMessageAsync: signMoveLink } = useSignMessage({
        message: MESSAGES.AllowNFTDeleteAndCreateLink,
    });

    const { signMessageAsync: signClaimDensity } = useSignMessage({
        message: MESSAGES.ClaimDensity,
    });

    const askForSignature = async (
        action: 'createNFTLink' | 'deleteNFTLink' | 'move' | 'claimDensity'
    ): Promise<string | null> => {
        try {
            switch (action) {
                case 'createNFTLink':
                    return await signCreateLink();
                case 'deleteNFTLink':
                    return await signDeleteLink();
                case 'move':
                    return await signMoveLink();
                case 'claimDensity':
                    return await signClaimDensity();
                default:
                    return null;
            }
        } catch (error) {
            console.error('Signature error:', error);
            return null;
        }
    };

    return { askForSignature };
}

// Hook to claim density
export function useClaimDensity() {
    const { address } = useAccount();
    const queryClient = useQueryClient();
    const { askForSignature } = useStakingSignatures();
    const { setCoordinates } = useStakingStore();

    return useMutation({
        mutationFn: async () => {
            const signature = await askForSignature('claimDensity');
            if (!signature) {
                throw new Error('Transaction rejected');
            }

            const res = await api.claimDensity(address || '', signature);
            return res;
        },
        onSuccess: async () => {
            // Wait a bit and then refetch density data
            await new Promise((r) => setTimeout(r, 5000));
            queryClient.invalidateQueries({ queryKey: ['density', address] });
            queryClient.invalidateQueries({ queryKey: ['unclaimed-density', address] });
        },
        onError: (error: any) => {
            setCoordinates(0, document.body?.scrollTop || document.documentElement?.scrollTop || 0);

            if (error?.response?.data?.message?.includes('timeout')) {
                const expiry = error.response.data.data?.expiry;
                throw new Error(`Timeout applied - please try again after ${new Date(expiry).toLocaleString()}`);
            }

            throw error;
        },
    });
}

// Hook to create a link between Rock and Goliath
export function useCreateLink() {
    const { address } = useAccount();
    const queryClient = useQueryClient();
    const { askForSignature } = useStakingSignatures();

    return useMutation({
        mutationFn: async ({ rockId, goliathId }: { rockId: number; goliathId: number }) => {
            const signature = await askForSignature('createNFTLink');
            if (!signature) {
                throw new Error('Transaction rejected');
            }

            return api.createLink(address || '', {
                OldRocksId: rockId?.toString() || '',
                GoliathId: goliathId?.toString() || '',
                signature,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['staking-nfts', address] });
        },
    });
}

// Hook to delete a link
export function useDeleteLink() {
    const { address } = useAccount();
    const queryClient = useQueryClient();
    const { askForSignature } = useStakingSignatures();

    return useMutation({
        mutationFn: async ({ rockId, goliathId }: { rockId: number; goliathId: number }) => {
            const signature = await askForSignature('deleteNFTLink');
            if (!signature) {
                throw new Error('Transaction rejected');
            }

            return api.deleteLink(address || '', {
                OldRocksId: rockId?.toString() || '',
                GoliathId: goliathId?.toString() || '',
                signature,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['staking-nfts', address] });
        },
    });
}

// Hook to move a link (delete and create)
export function useMoveLink() {
    const { address } = useAccount();
    const queryClient = useQueryClient();
    const { askForSignature } = useStakingSignatures();

    return useMutation({
        mutationFn: async ({
            goliathId,
            fromRockId,
            toRockId,
        }: {
            goliathId: number;
            fromRockId: number;
            toRockId: number;
        }) => {
            const signature = await askForSignature('move');
            if (!signature) {
                throw new Error('Transaction rejected');
            }

            return api.deleteAndCreateLink(address || '', {
                OldRocksIdToDelete: fromRockId?.toString() || '',
                OldRocksIdToCreate: toRockId?.toString() || '',
                GoliathId: goliathId?.toString() || '',
                signature,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['staking-nfts', address] });
        },
    });
}

// Hook to check link cooldown
export function useLinkCooldown() {
    const { address } = useAccount();

    const checkCooldown = async (rockId: number, goliathId: number) => {
        if (!address) return null;

        try {
            const res = await api.getLinkCooldown({
                oldRockId: rockId?.toString() || '',
                goliathId: goliathId?.toString() || '',
                walletAddress: address,
            });
            return res.data;
        } catch (error) {
            console.error('Error checking cooldown:', error);
            return null;
        }
    };

    return { checkCooldown };
}
