/**
 * Leaderboard Cache Utility
 * Stores leaderboard data in memory with automatic refresh
 * Also persists to disk for server restarts
 */

import { promises as fs } from "fs"
import { join } from "path"

interface LeaderboardCache {
  data: any[]
  timestamp: number
  isRefreshing: boolean
  refreshPromise: Promise<any[]> | null
  progress: {
    current: number
    total: number
    currentBatch: number
    totalBatches: number
  } | null
}

const CACHE_TTL = 30 * 60 * 1000 // 30 minutes in milliseconds
// Use /tmp which is writable in most serverless environments (like Lambda/Vercel/Railway)
// Note: On some platforms /tmp is ephemeral per request or per instance, but it's the best option request-to-request
const CACHE_FILE_PATH = "/tmp/leaderboard_cache.json"

let cache: LeaderboardCache = {
  data: [],
  timestamp: 0,
  isRefreshing: false,
  refreshPromise: null,
  progress: null,
}

// Initialize: Load cache from disk on server startup
let cacheInitialized = false
async function initializeCache() {
  if (cacheInitialized) return

  try {
    // Try to load existing cache
    try {
      const cacheFile = await fs.readFile(CACHE_FILE_PATH, "utf-8")
      const persistedCache = JSON.parse(cacheFile)

      // Check if cache has valid data
      if (persistedCache && persistedCache.data && Array.isArray(persistedCache.data)) {
        const cacheAge = persistedCache.timestamp ? Date.now() - persistedCache.timestamp : Infinity

        // Always load data as fallback, but mark timestamp
        cache.data = persistedCache.data
        cache.timestamp = persistedCache.timestamp || 0

        if (cacheAge < CACHE_TTL) {
          console.log(`✅ Loaded ${cache.data.length} leaderboard entries from ${CACHE_FILE_PATH} (fresh, age: ${Math.floor(cacheAge / 1000)}s)`)
        } else {
          console.log(`⚠️ Loaded ${cache.data.length} leaderboard entries from ${CACHE_FILE_PATH} (stale, age: ${Math.floor(cacheAge / 1000)}s) - will refresh on next request`)
        }
      } else {
        console.log("ℹ️ Cache file exists but has invalid data structure")
      }
    } catch (error: any) {
      // Cache file doesn't exist yet, that's normal for first run
      if (error.code !== 'ENOENT') {
        console.log(`ℹ️ Could not read cache file: ${error.message}`)
      }
    }
  } catch (error) {
    console.error("⚠️ Error initializing cache:", error)
  } finally {
    cacheInitialized = true
  }
}

// Persist cache to disk
async function persistCache() {
  try {
    // Only persist if we have data
    if (!cache.data || cache.data.length === 0) {
      return
    }

    // Write cache to disk
    const cacheToPersist = {
      data: cache.data,
      timestamp: cache.timestamp,
    }

    // Write to a temporary file first, then rename (atomic write)
    const tempFilePath = `${CACHE_FILE_PATH}.tmp`
    await fs.writeFile(tempFilePath, JSON.stringify(cacheToPersist), "utf-8")
    await fs.rename(tempFilePath, CACHE_FILE_PATH)

    console.log(`💾 Persisted ${cache.data.length} leaderboard entries to ${CACHE_FILE_PATH}`)
  } catch (error) {
    console.error("⚠️ Error persisting cache to disk:", error)
  }
}

// Initialize cache immediately (non-blocking)
if (typeof window === "undefined") {
  initializeCache().catch(console.error)
}

/**
 * Check if cache is stale (older than TTL)
 */
export function isCacheStale(): boolean {
  if (cache.timestamp === 0) return true
  return Date.now() - cache.timestamp > CACHE_TTL
}

/**
 * Get cached data if available and fresh
 */
export function getCachedData(): any[] | null {
  if (!isCacheStale() && cache.data.length > 0) {
    return cache.data
  }
  return null
}

/**
 * Get cached data even if stale (for fallback scenarios)
 */
export function getCachedDataIncludingStale(): any[] | null {
  if (cache.data.length > 0) {
    return cache.data
  }
  return null
}

/**
 * Set cached data
 */
export async function setCachedData(data: any[]): Promise<void> {
  cache.data = data
  cache.timestamp = Date.now()
  cache.isRefreshing = false
  cache.refreshPromise = null
  cache.progress = null

  // Persist to disk (server-side only)
  if (typeof window === "undefined") {
    await persistCache()
  }
}

/**
 * Update progress during refresh
 */
export function setProgress(current: number, total: number, currentBatch: number, totalBatches: number): void {
  cache.progress = {
    current,
    total,
    currentBatch,
    totalBatches,
  }
}

/**
 * Get current progress
 */
export function getProgress(): { current: number; total: number; currentBatch: number; totalBatches: number } | null {
  return cache.progress
}

/**
 * Check if a refresh is in progress
 */
export function isRefreshing(): boolean {
  return cache.isRefreshing
}

/**
 * Get the current refresh promise (if any)
 */
export function getRefreshPromise(): Promise<any[]> | null {
  return cache.refreshPromise
}

/**
 * Set refresh promise
 */
export function setRefreshPromise(promise: Promise<any[]>): void {
  cache.isRefreshing = true
  cache.refreshPromise = promise
}

/**
 * Get cache age in seconds
 */
export function getCacheAge(): number {
  if (cache.timestamp === 0) return Infinity
  return Math.floor((Date.now() - cache.timestamp) / 1000)
}

