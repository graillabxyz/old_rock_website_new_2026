import { type NextRequest, NextResponse } from "next/server"
import { isCacheStale, isRefreshing, getCacheAge } from "@/lib/leaderboard-cache"

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

    if (refreshing) {
      // If refreshing, estimate progress (this is a simple simulation)
      // In a real implementation, you'd track actual progress
      progress = 50 // Mid-way through refresh
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

