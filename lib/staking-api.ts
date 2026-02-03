// Staking API Service - migrated from old-rock-amplify-client
// Uses Next.js API proxy to avoid CORS issues

import type { NFTsResponse, DensityResponse, CooldownResponse } from '@/types/staking';

// Use local API proxy to avoid CORS issues
const API_URL = '/api/amplify/';

interface ApiResponse<T> {
    data: T;
    message?: string;
}

async function fetchApi<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    const url = `${API_URL}${endpoint}`;

    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw {
            response: {
                status: response.status,
                data: errorData,
            },
        };
    }

    return response.json();
}

export async function getNFTs(walletAddress: string) {
    return fetchApi<NFTsResponse>(`nfts/${walletAddress}`);
}

export async function getUnclaimedDensity(walletAddress: string) {
    return fetchApi<string>(`density/unclaimed/${walletAddress}`);
}

export async function getDensity(walletAddress: string) {
    return fetchApi<DensityResponse>(`density/${walletAddress}`);
}

export async function claimDensity(walletAddress: string, signature: string) {
    return fetchApi<{ unclaimedDensity: string; signature: string }>(
        `density/claim/${walletAddress}`,
        {
            method: 'POST',
            headers: {
                signature,
            },
        }
    );
}

export async function withdrawDensity(
    walletAddress: string,
    amount: number,
    signature: string
) {
    return fetchApi<void>(`density/withdraw/${walletAddress}`, {
        method: 'POST',
        headers: {
            signature,
        },
        body: JSON.stringify({ amount }),
    });
}

export async function createLink(
    walletAddress: string,
    data: {
        OldRocksId: string;
        GoliathId: string;
        signature: string;
    }
) {
    return fetchApi<void>(`link/${walletAddress}`, {
        method: 'POST',
        headers: {
            signature: data.signature,
        },
        body: JSON.stringify({
            oldRockId: data.OldRocksId,
            goliathId: data.GoliathId,
        }),
    });
}

export async function deleteLink(
    walletAddress: string,
    data: {
        OldRocksId: string;
        GoliathId: string;
        signature: string;
    }
) {
    return fetchApi<void>(
        `link/${walletAddress}?oldRockId=${data.OldRocksId}&goliathId=${data.GoliathId}`,
        {
            method: 'DELETE',
            headers: {
                signature: data.signature,
            },
        }
    );
}

export async function deleteAndCreateLink(
    walletAddress: string,
    data: {
        OldRocksIdToDelete: string;
        OldRocksIdToCreate: string;
        GoliathId: string;
        signature: string;
    }
) {
    return fetchApi<void>(`link/${walletAddress}`, {
        method: 'PUT',
        headers: {
            signature: data.signature,
        },
        body: JSON.stringify({
            oldRockIdFrom: data.OldRocksIdToDelete,
            oldRockIdTo: data.OldRocksIdToCreate,
            goliathId: data.GoliathId,
        }),
    });
}

export async function getLinkCooldown(params: {
    oldRockId: string;
    goliathId: string;
    walletAddress: string;
}) {
    return fetchApi<CooldownResponse>(
        `link/cooldown/${params.walletAddress}?oldRockId=${params.oldRockId}&goliathId=${params.goliathId}`
    );
}
