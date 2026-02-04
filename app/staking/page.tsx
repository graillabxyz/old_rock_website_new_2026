'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Loader2, AlertCircle, Wallet } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './staking.css';

import { Header } from '@/components/header';
import { Sidebar } from '@/components/sidebar';
import { Footer } from '@/components/footer';
import { RocksCarousel } from '@/components/staking/rocks-carousel';
import { GoliathGallery } from '@/components/staking/goliath-gallery';
import { DensityDisplay } from '@/components/staking/density-display';
import { LinkedGoliathsDisplay } from '@/components/staking/linked-goliaths-display';

import { useStakingStore } from '@/lib/staking-store';
import {
    useStakingNFTs,
    useUnclaimedDensity,
    useClaimDensity,
    useCreateLink,
    useDeleteLink,
    useMoveLink,
    useLinkCooldown,
} from '@/hooks/use-staking-wallet';

import type { GoliathNFT } from '@/types/staking';
import { playSound } from '@/lib/staking-sounds';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// Wrapper component to handle Suspense boundary for useSearchParams
export default function StakingPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-[#08131B]">
                <Loader2 className="w-12 h-12 animate-spin text-green-500" />
            </div>
        }>
            <StakingPageContent />
        </Suspense>
    );
}

function StakingPageContent() {
    const { address, isConnected } = useAccount();

    // For sidebar
    const [isWalletConnected, setIsWalletConnected] = useState(false);
    const [userProfile, setUserProfile] = useState<any>(null);

    // Store state
    const {
        swiperIndex,
        allRocks,
        allGoliaths,
        nftLoading,
        setNFTLoading,
        updateGoliath,
        setGoliathToMove,
        goliathToMove,
        setSwiperIndex,
    } = useStakingStore();

    // Hooks
    const { isLoading: nftsLoading, isError: nftsError, refetch: refetchNFTs } = useStakingNFTs();
    const { unclaimedDensity, isFetching: densityFetching, refetch: refetchDensity } = useUnclaimedDensity();
    const claimDensity = useClaimDensity();
    const createLink = useCreateLink();
    const deleteLink = useDeleteLink();
    const moveLink = useMoveLink();
    const { checkCooldown } = useLinkCooldown();

    // Local state
    const [selectedGoliath, setSelectedGoliath] = useState<GoliathNFT | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    const selectedRock = allRocks[swiperIndex.oldrocks] || null;

    // Sync wallet state for sidebar
    useEffect(() => {
        if (isConnected && address) {
            setIsWalletConnected(true);
            setUserProfile({
                name: `${address.slice(0, 6)}...${address.slice(-4)}`,
                address: address,
            });
        } else {
            setIsWalletConnected(false);
            setUserProfile(null);
        }
    }, [isConnected, address]);

    // Auto-refresh density every 10 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            if (document.hasFocus() && isConnected && !claimDensity.isLoading) {
                refetchDensity();
            }
        }, 10000);
        return () => clearInterval(interval);
    }, [isConnected, claimDensity.isLoading, refetchDensity]);

    // Format: Search params for auto-selecting NFT
    const searchParams = useSearchParams();

    // Auto-select NFT from URL params
    useEffect(() => {
        const tokenId = searchParams.get('tokenId');
        const collection = searchParams.get('collection');

        if (tokenId && collection === 'Old Rock' && allRocks.length > 0) {
            const index = allRocks.findIndex(r => r.id.toString() === tokenId);
            if (index !== -1) {
                // Short timeout to ensure store state is settled / swiper is ready
                setTimeout(() => {
                    setSwiperIndex('oldrocks', index);
                }, 100);
            }
        }
    }, [searchParams, allRocks, setSwiperIndex]);

    // Handle goliath click (from gallery - for linking)
    const handleGoliathClick = useCallback(async (goliath: GoliathNFT) => {
        if (!selectedRock) return;

        const isLinkedToCurrentRock = goliath.linkedRock === selectedRock.id;
        const isLinkedToOtherRock = goliath.linkedRock !== null && !isLinkedToCurrentRock;

        // Check cooldown first
        const cooldownData = await checkCooldown(selectedRock.id, goliath.id);
        if (cooldownData && cooldownData.cooldownUntil > 0) {
            toast.error(`This asset is on cooldown until ${new Date(cooldownData.formattedCooldownUntil).toLocaleString()}`);
            return;
        }

        setSelectedGoliath(goliath);
        setActionLoading(true);
        setNFTLoading(goliath.id.toString());
        updateGoliath(goliath.id, { status: 'linking' });

        try {
            if (isLinkedToOtherRock) {
                setGoliathToMove(goliath);
                await moveLink.mutateAsync({
                    goliathId: goliath.id,
                    fromRockId: goliath.linkedRock!,
                    toRockId: selectedRock.id,
                });
                toast.success('Goliath moved successfully!');
            } else if (!isLinkedToCurrentRock) {
                await createLink.mutateAsync({
                    rockId: selectedRock.id,
                    goliathId: goliath.id,
                });
                playSound('connectGoliathSuccess');
                toast.success('Goliath linked successfully!');
            }

            updateGoliath(goliath.id, { status: 'linked', linkedRock: selectedRock.id });
            await refetchNFTs();
        } catch (error: any) {
            console.error('Link error:', error);
            updateGoliath(goliath.id, { status: 'failed' });

            if (error.message === 'Transaction rejected') {
                toast.error('Transaction rejected');
            } else {
                toast.error(error?.response?.data?.message || 'Failed to link Goliath');
            }
        } finally {
            setActionLoading(false);
            setNFTLoading('');
            setSelectedGoliath(null);
            setGoliathToMove(null);
        }
    }, [selectedRock, checkCooldown, setGoliathToMove, moveLink, createLink, updateGoliath, setNFTLoading, refetchNFTs]);

    // Handle linked goliath click (from planetary display - for unlinking)
    const handleLinkedGoliathClick = useCallback(async (goliath: GoliathNFT) => {
        if (!selectedRock) return;

        setSelectedGoliath(goliath);
        setActionLoading(true);
        setNFTLoading(goliath.id.toString());
        updateGoliath(goliath.id, { status: 'unlinking' });

        try {
            await deleteLink.mutateAsync({
                rockId: selectedRock.id,
                goliathId: goliath.id,
            });

            playSound('disconnectGoliath');
            toast.success('Goliath unlinked successfully!');
            updateGoliath(goliath.id, { status: 'free', linkedRock: null });
            await refetchNFTs();
        } catch (error: any) {
            console.error('Unlink error:', error);
            updateGoliath(goliath.id, { status: 'failed' });

            if (error.message === 'Transaction rejected') {
                toast.error('Transaction rejected');
            } else {
                toast.error(error?.response?.data?.message || 'Failed to unlink Goliath');
            }
        } finally {
            setActionLoading(false);
            setNFTLoading('');
            setSelectedGoliath(null);
        }
    }, [selectedRock, deleteLink, updateGoliath, setNFTLoading, refetchNFTs]);

    // Handle claim density
    const handleClaimDensity = async () => {
        try {
            playSound('claimDensity');
            await claimDensity.mutateAsync();
            playSound('claimDensitySuccess');
            toast.success('Density extracted successfully!');
        } catch (error: any) {
            console.error('Claim error:', error);
            if (error.message === 'Transaction rejected') {
                toast.error('Transaction rejected');
            } else if (error.message.includes('No rewards')) {
                toast.error('No rewards to claim');
            } else {
                toast.error(error.message || 'Failed to extract density');
            }
        }
    };

    const linkedFromRock = goliathToMove?.linkedRock
        ? allRocks.find(r => r.id === goliathToMove.linkedRock)
        : null;

    // Calculate linked goliaths for current rock
    const linkedGoliaths = selectedRock
        ? allGoliaths.filter(g => g.linkedRock === selectedRock.id)
        : [];

    const unlinkedGoliaths = allGoliaths.filter(g => g.linkedRock !== selectedRock?.id);

    // Calculate total daily rate across all rocks
    const totalDailyRate = allRocks.reduce((acc, rock) => {
        const rockLinkedGoliaths = allGoliaths.filter(g => g.linkedRock === rock.id);
        const multiplier = 100 + (rockLinkedGoliaths.length * 10);
        return acc + Math.round(rock.dailyReward * (multiplier / 100));
    }, 0);


    // Mounted check to prevent hydration mismatch
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="flex">
            <Sidebar isWalletConnected={isWalletConnected} userProfile={userProfile} />

            <div className="min-h-screen text-white overflow-hidden relative w-full lg:ml-[79px]">
                {/* Dark Amplify Background */}
                <div
                    className="fixed inset-0 z-0"
                    style={{ backgroundColor: '#08131B' }}
                />

                <Header />

                <ToastContainer
                    position="bottom-right"
                    theme="dark"
                    autoClose={5000}
                />

                <main className="relative z-10 pt-24 pb-20">
                    {!isConnected ? (
                        // Not connected state
                        <div className="flex flex-col items-center justify-center min-h-[60vh]">
                            <div className="w-24 h-24 rounded-full bg-gray-800/50 flex items-center justify-center mb-6 border-2 border-gray-700">
                                <Wallet className="w-12 h-12 text-green-400" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
                            <p className="text-gray-400 mb-6 text-center max-w-md">
                                Connect your wallet to view your Old Rock and Goliath NFTs and start earning $DENSITY
                            </p>
                            <ConnectButton />
                        </div>
                    ) : nftsLoading ? (
                        // Loading state
                        <div className="flex flex-col items-center justify-center min-h-[60vh]">
                            <Loader2 className="w-12 h-12 animate-spin text-green-500 mb-4" />
                            <p className="text-gray-400">Loading your NFTs...</p>
                        </div>
                    ) : nftsError ? (
                        // Error state
                        <div className="flex flex-col items-center justify-center min-h-[60vh]">
                            <div className="w-16 h-16 rounded-full bg-red-600/20 flex items-center justify-center mb-4">
                                <AlertCircle className="w-8 h-8 text-red-400" />
                            </div>
                            <h2 className="text-xl font-bold mb-2">Error Loading NFTs</h2>
                            <p className="text-gray-400 mb-4">There was an error loading your NFTs. Please try again.</p>
                            <button
                                onClick={() => refetchNFTs()}
                                className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                    ) : allRocks.length === 0 ? (
                        // No NFTs state
                        <div className="flex flex-col items-center justify-center min-h-[60vh]">
                            <div className="text-6xl mb-6">🪨</div>
                            <h2 className="text-2xl font-bold mb-2">No Old Rocks Found</h2>
                            <p className="text-gray-400 text-center max-w-md mb-6">
                                You need Old Rock NFTs to participate in staking. Visit our collections page to learn more.
                            </p>
                            <Link
                                href="/collections"
                                className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                            >
                                View Collections
                            </Link>
                        </div>
                    ) : (
                        // Main staking UI - matching original layout
                        <div className="flex flex-col items-center relative">
                            {/* Top Section Wrapper (Density + Carousel) */}
                            {/* Wraps both to provide a unified background that stops before the notch */}
                            <div className="w-full relative z-30 flex flex-col items-center">
                                {/* Top Section Background - Stops 40px from bottom to allow Carousel Notch transparency */}
                                <div className="absolute inset-x-0 top-24 bottom-[40px] bg-[#08131B] z-0" />

                                {/* Density Display - z-10 above bg */}
                                <div className="relative z-10">
                                    <DensityDisplay
                                        unclaimedDensity={unclaimedDensity}
                                        isFetching={densityFetching}
                                        isClaimLoading={claimDensity.isLoading}
                                        onClaim={handleClaimDensity}
                                        totalDailyRate={totalDailyRate}
                                    />
                                </div>

                                {/* Rock Carousel - z-20 above Density */}
                                <div className="w-full mt-[-100px] relative z-20">
                                    <RocksCarousel
                                        rocks={allRocks}
                                    />
                                </div>
                            </div>

                            {/* Linked Goliaths - Planetary Display - z-10 (Parallax layer) */}
                            {mounted && selectedRock && (
                                <LinkedGoliathsDisplay
                                    linkedGoliaths={linkedGoliaths}
                                    selectedRock={selectedRock}
                                    loadingGoliathId={nftLoading}
                                    onGoliathClick={handleLinkedGoliathClick}
                                />
                            )}

                            {/* Goliath Gallery - Unlinked */}
                            <div className="w-full mt-8 bg-[#08131B] relative z-20" id="goliathGallery">
                                <GoliathGallery
                                    goliaths={unlinkedGoliaths}
                                    selectedRock={selectedRock}
                                    loadingGoliathId={nftLoading}
                                    onGoliathClick={handleGoliathClick}
                                />
                            </div>
                        </div>
                    )}
                </main>

                <Footer />
            </div>

        </div>
    );
}
