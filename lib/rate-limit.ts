/**
 * Rate limiting utility for API routes
 * Uses in-memory storage - for production, consider Redis
 */

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore) {
        if (entry.resetTime < now) {
            rateLimitStore.delete(key);
        }
    }
}, 60000); // Clean up every minute

interface RateLimitOptions {
    /** Maximum number of requests allowed in the window */
    limit: number;
    /** Time window in milliseconds */
    windowMs: number;
}

interface RateLimitResult {
    success: boolean;
    remaining: number;
    resetTime: number;
}

/**
 * Check if request should be rate limited
 * @param identifier - Unique identifier (IP address, wallet address, etc.)
 * @param options - Rate limit configuration
 * @returns RateLimitResult indicating if request is allowed
 */
export function checkRateLimit(
    identifier: string,
    options: RateLimitOptions
): RateLimitResult {
    const now = Date.now();
    const key = identifier;

    let entry = rateLimitStore.get(key);

    // If no entry or window expired, create new entry
    if (!entry || entry.resetTime < now) {
        entry = {
            count: 1,
            resetTime: now + options.windowMs,
        };
        rateLimitStore.set(key, entry);

        return {
            success: true,
            remaining: options.limit - 1,
            resetTime: entry.resetTime,
        };
    }

    // Increment count
    entry.count++;

    // Check if over limit
    if (entry.count > options.limit) {
        return {
            success: false,
            remaining: 0,
            resetTime: entry.resetTime,
        };
    }

    return {
        success: true,
        remaining: options.limit - entry.count,
        resetTime: entry.resetTime,
    };
}

/**
 * Get client IP from request headers
 */
export function getClientIP(request: Request): string {
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }

    const realIP = request.headers.get('x-real-ip');
    if (realIP) {
        return realIP;
    }

    return 'unknown';
}

// Pre-configured rate limiters for different use cases
export const RATE_LIMITS = {
    /** General API: 60 requests per minute */
    API_GENERAL: { limit: 60, windowMs: 60000 },

    /** Leaderboard: 10 requests per minute (expensive query) */
    LEADERBOARD: { limit: 10, windowMs: 60000 },

    /** IPFS Upload: 5 uploads per hour per wallet */
    IPFS_UPLOAD: { limit: 5, windowMs: 3600000 },

    /** IPFS Unpin: 10 unpins per hour per wallet */
    IPFS_UNPIN: { limit: 10, windowMs: 3600000 },

    /** Strict: 5 requests per minute (for sensitive endpoints) */
    STRICT: { limit: 5, windowMs: 60000 },
} as const;
