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

const CACHE_TTL = 30 * 60 * 1000 // 30 minutes in milliseconds (refresh more frequently for accuracy)
const CACHE_FILE_PATH = join(process.cwd(), ".next", "cache", "leaderboard.json")

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
    // Ensure cache directory exists
    const cacheDir = join(process.cwd(), ".next", "cache")
    await fs.mkdir(cacheDir, { recursive: true })
    
    // Try to load existing cache
    try {
      const cacheFile = await fs.readFile(CACHE_FILE_PATH, "utf-8")
      const persistedCache = JSON.parse(cacheFile)
      
      // Check if cache has valid data
      if (persistedCache && persistedCache.data && Array.isArray(persistedCache.data)) {
        // Use persisted cache even if stale (as fallback), but prefer fresh cache
        const cacheAge = persistedCache.timestamp ? Date.now() - persistedCache.timestamp : Infinity
        
        if (cacheAge < CACHE_TTL) {
          // Cache is fresh
          cache.data = persistedCache.data
          cache.timestamp = persistedCache.timestamp || 0
          console.log(`✅ Loaded ${cache.data.length} leaderboard entries from persistent cache (fresh, age: ${Math.floor(cacheAge / 1000)}s)`)
        } else {
          // Cache is stale but use it as fallback
          cache.data = persistedCache.data
          cache.timestamp = persistedCache.timestamp || 0
          console.log(`⚠️ Loaded ${cache.data.length} leaderboard entries from persistent cache (stale, age: ${Math.floor(cacheAge / 1000)}s) - will refresh on next request`)
        }
      } else {
        console.log("ℹ️ Persistent cache file exists but has invalid data, will refresh on next request")
      }
    } catch (error: any) {
      // Cache file doesn't exist yet or is corrupted, that's okay
      if (error.code === 'ENOENT') {
        console.log("ℹ️ No persistent cache found, will create on first load")
      } else {
        console.log(`ℹ️ Could not read persistent cache (${error.message}), will create on first load`)
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
    // Ensure cache directory exists
    const cacheDir = join(process.cwd(), ".next", "cache")
    await fs.mkdir(cacheDir, { recursive: true })
    
    // Only persist if we have data
    if (!cache.data || cache.data.length === 0) {
      console.log("ℹ️ Skipping cache persistence - no data to persist")
      return
    }
    
    // Write cache to disk (only data and timestamp, not runtime state)
    const cacheToPersist = {
      data: cache.data,
      timestamp: cache.timestamp,
    }
    
    // Write to a temporary file first, then rename (atomic write)
    const tempFilePath = `${CACHE_FILE_PATH}.tmp`
    await fs.writeFile(tempFilePath, JSON.stringify(cacheToPersist, null, 2), "utf-8")
    await fs.rename(tempFilePath, CACHE_FILE_PATH)
    
    console.log(`💾 Persisted ${cache.data.length} leaderboard entries to disk (${CACHE_FILE_PATH})`)
  } catch (error) {
    console.error("⚠️ Error persisting cache to disk:", error)
    // Don't throw - cache persistence failure shouldn't break the app
    // But log it so we know if there's a persistent issue
  }
}

// Initialize cache on module load (server-side only)
// This ensures cache is loaded when the server starts
if (typeof window === "undefined") {
  // Start initialization immediately (non-blocking)
  // Use Promise.resolve().then() to ensure it runs asynchronously but as soon as possible
  Promise.resolve().then(() => {
    initializeCache().catch((error) => {
      console.error("Failed to initialize leaderboard cache:", error)
    })
  }).catch(() => {
    // Fallback if Promise.resolve fails (shouldn't happen, but just in case)
    setImmediate(() => {
      initializeCache().catch((error) => {
        console.error("Failed to initialize leaderboard cache:", error)
      })
    })
  })
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

