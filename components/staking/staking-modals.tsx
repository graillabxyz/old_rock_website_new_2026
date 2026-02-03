'use client';

import React from 'react';
import { X, AlertTriangle, Loader2, Link as LinkIcon, Unlink } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GoliathNFT, OldRocksNFT } from '@/types/staking';
import { NFTCard } from './nft-card';

interface ConfirmLinkModalProps {
    isOpen: boolean;
    onClose: () => void;
    goliath: GoliathNFT | null;
    fromRock: OldRocksNFT | null;
    toRock: OldRocksNFT | null;
    onConfirm: () => void;
    isLoading?: boolean;
}

export function ConfirmLinkModal({
    isOpen,
    onClose,
    goliath,
    fromRock,
    toRock,
    onConfirm,
    isLoading = false,
}: ConfirmLinkModalProps) {
    if (!isOpen || !goliath) return null;

    const isMove = fromRock !== null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-gray-900 border border-gray-700 rounded-xl shadow-2xl max-w-md w-full p-6">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="text-center mb-6">
                    <div className="w-12 h-12 rounded-full bg-purple-600/20 flex items-center justify-center mx-auto mb-3">
                        {isMove ? (
                            <LinkIcon className="w-6 h-6 text-purple-400" />
                        ) : (
                            <LinkIcon className="w-6 h-6 text-green-400" />
                        )}
                    </div>
                    <h3 className="text-xl font-bold text-white">
                        {isMove ? 'Move Goliath Link?' : 'Link Goliath?'}
                    </h3>
                </div>

                {/* NFT Preview */}
                <div className="flex items-center justify-center gap-4 mb-6">
                    <div className="text-center">
                        <NFTCard nft={goliath} type="goliath" size="md" />
                        <div className="text-sm text-gray-400 mt-2">Goliath #{goliath.id}</div>
                    </div>

                    {isMove && fromRock && (
                        <>
                            <div className="flex flex-col items-center text-gray-500">
                                <div className="text-xs uppercase mb-1">From</div>
                                <NFTCard nft={fromRock} type="rock" size="sm" />
                            </div>

                            <div className="text-gray-400">→</div>
                        </>
                    )}

                    {toRock && (
                        <div className="flex flex-col items-center">
                            <div className="text-xs uppercase mb-1 text-green-400">To</div>
                            <NFTCard nft={toRock} type="rock" size="sm" />
                        </div>
                    )}
                </div>

                {/* Warning */}
                {isMove && (
                    <div className="flex items-start gap-3 p-3 bg-yellow-900/20 border border-yellow-700/50 rounded-lg mb-6">
                        <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <div className="text-sm font-medium text-yellow-400">Moving Link</div>
                            <div className="text-xs text-gray-400 mt-1">
                                This will unlink the Goliath from Rock #{fromRock?.id} and link it to Rock #{toRock?.id}.
                            </div>
                        </div>
                    </div>
                )}

                {/* Info */}
                <p className="text-sm text-gray-400 text-center mb-6">
                    You will be asked to sign a message to verify ownership. This action is off-chain and doesn&apos;t modify your wallet.
                </p>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 px-4 py-3 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={cn(
                            'flex-1 px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50',
                            'bg-purple-600 text-white hover:bg-purple-500',
                            'flex items-center justify-center gap-2'
                        )}
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <LinkIcon className="w-4 h-4" />
                                {isMove ? 'Move Link' : 'Confirm Link'}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

interface UnlinkModalProps {
    isOpen: boolean;
    onClose: () => void;
    goliath: GoliathNFT | null;
    rock: OldRocksNFT | null;
    onConfirm: () => void;
    isLoading?: boolean;
}

export function UnlinkModal({
    isOpen,
    onClose,
    goliath,
    rock,
    onConfirm,
    isLoading = false,
}: UnlinkModalProps) {
    if (!isOpen || !goliath || !rock) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-gray-900 border border-gray-700 rounded-xl shadow-2xl max-w-md w-full p-6">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="text-center mb-6">
                    <div className="w-12 h-12 rounded-full bg-red-600/20 flex items-center justify-center mx-auto mb-3">
                        <Unlink className="w-6 h-6 text-red-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Unlink Goliath?</h3>
                </div>

                {/* NFT Preview */}
                <div className="flex items-center justify-center gap-6 mb-6">
                    <div className="text-center">
                        <NFTCard nft={goliath} type="goliath" size="md" />
                        <div className="text-sm text-gray-400 mt-2">Goliath #{goliath.id}</div>
                    </div>

                    <div className="text-red-400 text-2xl">✕</div>

                    <div className="text-center">
                        <NFTCard nft={rock} type="rock" size="md" />
                        <div className="text-sm text-gray-400 mt-2">Rock #{rock.id}</div>
                    </div>
                </div>

                {/* Warning */}
                <div className="flex items-start gap-3 p-3 bg-red-900/20 border border-red-700/50 rounded-lg mb-6">
                    <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <div className="text-sm font-medium text-red-400">Warning</div>
                        <div className="text-xs text-gray-400 mt-1">
                            Unlinking will stop density accumulation from this Goliath. You can re-link it later.
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 px-4 py-3 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={cn(
                            'flex-1 px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50',
                            'bg-red-600 text-white hover:bg-red-500',
                            'flex items-center justify-center gap-2'
                        )}
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <Unlink className="w-4 h-4" />
                                Confirm Unlink
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
