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
      // Calculate actual progress from batch processing
      progress = Math.min(95, Math.floor((progressData.current / progressData.total) * 100))
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

