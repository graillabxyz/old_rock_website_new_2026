import { type NextRequest, NextResponse } from "next/server"
import { isCacheStale, isRefreshing, getCacheAge, getProgress } from "@/lib/leaderboard-cache"

export const dynamic = "force-dynamic"

/**
 * GET /api/leaderboard/progress
 * Returns the loading progress status for leaderboard data
 */
export async function GET(request: NextRequest) {
  try {
    const cacheStale = isCacheStale()
    const refreshing = isRefreshing()
    const cacheAge = getCacheAge()

    // Calculate progress based on cache state
    let progress = 0
    let status = "idle"
    const progressData = getProgress()

    if (refreshing && progressData) {
      // Calculate actual progress from batch processing - use batches processed instead of addresses
      // This is more accurate since some addresses might fail
      if (progressData.totalBatches > 0) {
        const batchProgress = (progressData.currentBatch / progressData.totalBatches) * 100
        // If all batches are complete, set to 100%
        if (progressData.currentBatch >= progressData.totalBatches) {
          progress = 100
        } else {
          progress = Math.min(99, Math.floor(batchProgress))
        }
      } else if (progressData.total > 0) {
        // Fallback to address-based progress if batch info not available
        const addressProgress = (progressData.current / progressData.total) * 100
        // If all addresses are processed, set to 100%
        if (progressData.current >= progressData.total) {
          progress = 100
        } else {
          progress = Math.min(99, Math.floor(addressProgress))
        }
      } else {
        progress = 10
      }
      status = "loading"
    } else if (refreshing) {
      // Refreshing but no progress data yet
      progress = 10
      status = "loading"
    } else if (cacheStale) {
      // Cache is stale, will trigger refresh
      progress = 0
      status = "stale"
    } else {
      // Cache is fresh
      progress = 100
      status = "ready"
    }

    return NextResponse.json({
      progress,
      status,
      cacheAge,
      cacheStale,
      refreshing,
    })
  } catch (error) {
    return NextResponse.json(
      {
        progress: 0,
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

