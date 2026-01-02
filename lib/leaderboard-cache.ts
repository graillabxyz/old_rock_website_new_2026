/**
 * Leaderboard Cache Utility
 * Stores leaderboard data in memory with automatic refresh
 */

interface LeaderboardCache {
  data: any[]
  timestamp: number
  isRefreshing: boolean
  refreshPromise: Promise<any[]> | null
}

const CACHE_TTL = 60 * 60 * 1000 // 1 hour in milliseconds
let cache: LeaderboardCache = {
  data: [],
  timestamp: 0,
  isRefreshing: false,
  refreshPromise: null,
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
 * Set cached data
 */
export function setCachedData(data: any[]): void {
  cache.data = data
  cache.timestamp = Date.now()
  cache.isRefreshing = false
  cache.refreshPromise = null
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

