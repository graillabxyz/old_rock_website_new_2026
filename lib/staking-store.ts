// Staking Store - migrated from old-rock-amplify-client

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { GoliathNFT, OldRocksNFT, InvalidatedGoliath, GoliathStatuses } from '@/types/staking';

export interface StakingStoreState {
    // NFT State
    allGoliaths: GoliathNFT[];
    allRocks: OldRocksNFT[];
    invalidatedGoliaths: InvalidatedGoliath[];

    // UI State
    activePlanetIndex: number | null;
    claimingRewards: 'pending' | 'failed' | 'normal';
    isAssociated: boolean;
    swiperIndex: {
        oldrocks: number;
        linked: number;
        goliaths: number;
    };
    openConnectWalletModal: boolean;
    openConnectGoliathModal: boolean;
    openSortByModal: boolean;
    openFilterByModal: boolean;
    goliathToMove: GoliathNFT | null;
    coordinates: {
        x: number;
        y: number;
    };
    nftLoading: string;

    // Actions
    setNFTLoading: (value: string) => void;
    setCoordinates: (x: number, y: number) => void;
    setGoliathStatus: (id: number, status: GoliathStatuses) => void;
    setAllRocks: (rocks: OldRocksNFT[]) => void;
    addHashToInvalidatedGoliath: (id: number, hash: string) => void;
    removeInvalidatedGoliath: (id: number) => void;
    setAllGoliaths: (goliaths: GoliathNFT[]) => void;
    resetActiveGoliath: () => void;
    setClaimingRewards: (value: 'pending' | 'failed' | 'normal') => void;
    setActivePlanetIndex: (index: number | null) => void;
    setIsAssociated: (value: boolean) => void;
    updateGoliath: (id: number, goliath: Partial<GoliathNFT>) => void;
    updateRock: (id: number, rock: Partial<OldRocksNFT>) => void;
    setSwiperIndex: (key: keyof StakingStoreState['swiperIndex'], index: number) => void;
    clearStore: () => void;
    setOpenConnectWalletModal: (value: boolean) => void;
    setOpenConnectGoliathModal: (value: boolean) => void;
    setOpenSortByModal: (value: boolean) => void;
    setOpenFilterByModal: (value: boolean) => void;
    setGoliathToMove: (value: GoliathNFT | null) => void;
}

export const useStakingStore = create<StakingStoreState>()(
    persist(
        (set, get) => ({
            // Initial State
            allGoliaths: [],
            allRocks: [],
            invalidatedGoliaths: [],
            claimingRewards: 'normal',
            activePlanetIndex: null,
            isAssociated: false,
            swiperIndex: {
                oldrocks: 0,
                linked: 0,
                goliaths: 0,
            },
            openConnectWalletModal: false,
            openConnectGoliathModal: false,
            openSortByModal: false,
            openFilterByModal: false,
            goliathToMove: null,
            coordinates: { x: 0, y: 0 },
            nftLoading: '',

            // Actions
            setNFTLoading: (value) => set({ nftLoading: value }),

            setCoordinates: (x, y) => set({ coordinates: { x, y } }),

            setGoliathStatus: (id, status) => {
                set({
                    allGoliaths: get().allGoliaths.map((g) =>
                        g.id === id ? { ...g, status } : g
                    ),
                });
            },

            setAllRocks: (rocks) => set({ allRocks: rocks }),

            addHashToInvalidatedGoliath: (id, hash) => {
                set({
                    invalidatedGoliaths: get().invalidatedGoliaths.map((x) =>
                        x.goliath.id === id ? { ...x, hash } : x
                    ),
                });
            },

            removeInvalidatedGoliath: (id) =>
                set({
                    invalidatedGoliaths: get().invalidatedGoliaths.filter(
                        (x) => x.goliath.id !== id
                    ),
                }),

            setAllGoliaths: (goliaths) => set({ allGoliaths: goliaths }),

            resetActiveGoliath: () =>
                set({
                    allGoliaths: get().allGoliaths.map((g) => ({ ...g, active: false })),
                }),

            setClaimingRewards: (value) => set({ claimingRewards: value }),

            setActivePlanetIndex: (value) => set({ activePlanetIndex: value }),

            setIsAssociated: (value) => set({ isAssociated: value }),

            updateGoliath: (id, value) => {
                set({
                    allGoliaths: get().allGoliaths.map((g) =>
                        g.id === id ? { ...g, ...value } : g
                    ),
                });
            },

            updateRock: (id, value) => {
                set({
                    allRocks: get().allRocks.map((r) =>
                        r.id === id ? { ...r, ...value } : r
                    ),
                });
            },

            setSwiperIndex: (key, value) => {
                set({
                    swiperIndex: {
                        ...get().swiperIndex,
                        [key]: value,
                    },
                });
            },

            clearStore: () =>
                set({
                    allGoliaths: [],
                    allRocks: [],
                    swiperIndex: { oldrocks: 0, linked: 0, goliaths: 0 },
                }),

            setOpenConnectWalletModal: (value) => set({ openConnectWalletModal: value }),
            setOpenConnectGoliathModal: (value) => set({ openConnectGoliathModal: value }),
            setOpenSortByModal: (value) => set({ openSortByModal: value }),
            setOpenFilterByModal: (value) => set({ openFilterByModal: value }),
            setGoliathToMove: (value) => set({ goliathToMove: value }),
        }),
        {
            name: 'staking-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                swiperIndex: state.swiperIndex,
            }),
        }
    )
);
