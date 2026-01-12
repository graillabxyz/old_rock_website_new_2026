'use server';

/**
 * Airdrop API Actions
 * 
 * These server actions handle communication with the Amplify API
 * for the airdrop dashboard functionality.
 */

const API_URL = process.env.NEXT_PUBLIC_AMPLIFY_API_URL || 'https://amplify-api.oldrocknft.com';

// ============================================
// Achievement Events
// ============================================

export async function getAchievementEventsWalletAddress(walletAddress: string, namespace: string) {
    try {
        const response = await fetch(`${API_URL}/achievements/events/${walletAddress}/${namespace}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch achievement events: ${response.statusText}`);
        }

        const data = await response.json();
        return { success: true, data: data.data };
    } catch (error) {
        console.error('Error fetching achievement events:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

export async function getAchievementEventsLeaderboard(namespace: string) {
    try {
        const response = await fetch(`${API_URL}/achievements/events/leaderboard/${namespace}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch leaderboard: ${response.statusText}`);
        }

        const data = await response.json();
        return { success: true, data: data.data };
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

export async function getAchievementsList(namespace: string) {
    try {
        const response = await fetch(`${API_URL}/achievements/${namespace}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch achievements list: ${response.statusText}`);
        }

        const data = await response.json();
        return { success: true, data: data.data };
    } catch (error) {
        console.error('Error fetching achievements list:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

export async function postAchievementEvent(walletAddress: string, achievementId: string, namespace: string) {
    try {
        const response = await fetch(`${API_URL}/achievements/events/${walletAddress}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                achievementId,
                namespace,
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to post achievement event: ${response.statusText}`);
        }

        const data = await response.json();
        return { success: true, data: data.data };
    } catch (error) {
        console.error('Error posting achievement event:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

// ============================================
// Airdrop Summary
// ============================================

export async function getAirdropSeasonSummary(walletAddress: string, season: number) {
    try {
        const response = await fetch(`${API_URL}/airdrop/summary/${walletAddress}/${season}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch airdrop summary: ${response.statusText}`);
        }

        const data = await response.json();
        return { success: true, data: data.data };
    } catch (error) {
        console.error('Error fetching airdrop summary:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

// ============================================
// Verification
// ============================================

export async function verifyWallet(walletAddress: string, signature: string, referralCode?: string) {
    try {
        const response = await fetch(`${API_URL}/verify/${walletAddress}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'signature': signature,
            },
            credentials: 'include',
            body: JSON.stringify({
                referralCode: referralCode || null,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Verification failed: ${response.statusText}`);
        }

        const data = await response.json();
        return { success: true, data: data.data };
    } catch (error) {
        console.error('Error verifying wallet:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

export async function verifyX(walletAddress: string, signature: string, referralCode?: string) {
    try {
        const response = await fetch(`${API_URL}/verify/x/${walletAddress}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'signature': signature,
            },
            credentials: 'include',
            body: JSON.stringify({
                referralCode: referralCode || null,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `X verification failed: ${response.statusText}`);
        }

        const data = await response.json();
        return { success: true, data: data.data };
    } catch (error) {
        console.error('Error verifying X:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

export async function verifyDiscord(walletAddress: string, signature: string, referralCode?: string) {
    try {
        const response = await fetch(`${API_URL}/verify/discord/${walletAddress}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'signature': signature,
            },
            credentials: 'include',
            body: JSON.stringify({
                referralCode: referralCode || null,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Discord verification failed: ${response.statusText}`);
        }

        const data = await response.json();
        return { success: true, data: data.data };
    } catch (error) {
        console.error('Error verifying Discord:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

// ============================================
// Auth URLs (for OAuth flows)
// ============================================

export async function getXAuthUrl() {
    const isProduction = process.env.NODE_ENV === 'production';
    return isProduction
        ? 'https://amplify-api.oldrocknft.com/auth/x?from=airdrop'
        : 'http://api.localhost.com:3000/auth/x?from=airdrop';
}

export async function getDiscordAuthUrl() {
    const isProduction = process.env.NODE_ENV === 'production';
    return isProduction
        ? 'https://amplify-api.oldrocknft.com/auth/discord?from=airdrop'
        : 'http://api.localhost.com:3000/auth/discord?from=airdrop';
}
