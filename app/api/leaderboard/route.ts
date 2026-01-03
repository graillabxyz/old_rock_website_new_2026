import { type NextRequest, NextResponse } from "next/server"
import { getCachedData, getCachedDataIncludingStale, setCachedData, isCacheStale, isRefreshing, getRefreshPromise, setRefreshPromise, setProgress } from "@/lib/leaderboard-cache"

export const dynamic = "force-dynamic"

/**
 * Process a batch of addresses in parallel
 */
async function processBatch(
  addresses: string[],
  amplifyApiUrl: string,
  batchNum: number,
  totalBatches: number
): Promise<any[]> {
  const batchPromises = addresses.map(async (address: string) => {
    try {
      const addressLower = address.toLowerCase()

      // Fetch NFTs
      const nftResponse = await fetch(`${amplifyApiUrl}/nfts/${address}`)
      if (!nftResponse.ok) return null

      const nftData = await nftResponse.json()
      const oldRockNFTs = nftData?.data?.OldRocks || []
      const goliathNFTs = nftData?.data?.Goliath || []
      const hasOldRock = oldRockNFTs.length > 0
      const hasGoliath = goliathNFTs.length > 0

          // Fetch DENSITY balance with retry logic to handle rate limiting and 500 errors
          let density = 0
          let unextractedDensity = 0
          const maxRetries = 3
          let retryCount = 0
          let lastError: Error | null = null
          
          while (retryCount < maxRetries) {
            try {
              // Add exponential backoff delay to avoid rate limiting
              if (retryCount > 0) {
                const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 5000) // 1s, 2s, 4s max
                await new Promise((resolve) => setTimeout(resolve, delay))
              }
              
              const densityResponse = await fetch(`${amplifyApiUrl}/density/${address}`, {
                cache: "no-store",
                headers: {
                  "Accept": "application/json",
                },
                // Add timeout to prevent hanging
                signal: AbortSignal.timeout(10000), // 10 second timeout
              })
              
              if (densityResponse.ok) {
                const densityData = await densityResponse.json()
                density = parseFloat(densityData?.data?.amount || "0") || 0
                unextractedDensity = parseFloat(densityData?.data?.amountUnclaimed || "0") || 0
                break // Success, exit retry loop
              } else if (densityResponse.status === 429 || densityResponse.status === 503 || densityResponse.status === 500) {
                // Rate limited, service unavailable, or server error - retry
                retryCount++
                lastError = new Error(`API error (${densityResponse.status})`)
                if (retryCount < maxRetries) {
                  continue
                }
              } else if (densityResponse.status === 404) {
                // Address not found - not an error, just no density
                break
              } else {
                // Other error (4xx except 404) - log but don't retry
                console.warn(`DENSITY query failed for ${address}: ${densityResponse.status}`)
                break
              }
            } catch (e) {
              retryCount++
              // Handle timeout and network errors
              if (e instanceof Error && (e.name === 'AbortError' || e.name === 'TimeoutError')) {
                lastError = new Error(`Request timeout for ${address}`)
              } else {
                lastError = e instanceof Error ? e : new Error(String(e))
              }
              if (retryCount >= maxRetries) {
                // Silently fail - we'll use 0 density which is fine
                // Don't log every failure to avoid spam
                if (retryCount === maxRetries && Math.random() < 0.1) { // Log 10% of failures
                  console.warn(`DENSITY query failed after ${maxRetries} retries for ${address}:`, lastError.message)
                }
              }
            }
          }
          
          // If all retries failed, use 0 density (user still appears if they have NFTs)

      // Fetch ENS name
      let ensName: string | undefined
      try {
        const ensResponse = await fetch(`https://api.ensideas.com/ens/resolve/${address}`)
        if (ensResponse.ok) {
          const ensData = await ensResponse.json()
          ensName = ensData?.name || undefined
        }
      } catch (e) {
        // Ignore ENS fetch errors
      }

      // Calculate ranking score based on:
      // 1. $DENSITY balance (highest priority - multiply by 1,000,000)
      // 2. Old Rock rarity and quantity
      // 3. Goliath rarity and quantity
      // 4. Old Rock prioritized over Goliath
      
      let rankingScore = density * 1000000 // $DENSITY is highest priority
      
      // Calculate Old Rock score
      let rockScore = 0
      const rockReactiveScores: { [key: string]: number } = {
        "Pure": 1000,
        "Polar": 500,
        "Recurrent": 200,
      }
      const rockDensityScores: { [key: string]: number } = {
        "High": 500,
        "Medium": 200,
        "Low": 50,
      }
      
      oldRockNFTs.forEach((nft: any) => {
        // Base score for owning a Rock
        rockScore += 100
        
        // Reactive rarity score
        const reactive = nft.attributes?.Reactive || nft.attributes?.reactive
        if (reactive) {
          let reactiveValue: string
          if (typeof reactive === 'string') {
            reactiveValue = reactive
          } else if (reactive?.value) {
            reactiveValue = reactive.value
          } else if (Array.isArray(reactive) && reactive.length > 0) {
            reactiveValue = reactive[0]?.value || reactive[0] || reactive
          } else {
            reactiveValue = String(reactive)
          }
          if (reactiveValue) {
            for (const [key, value] of Object.entries(rockReactiveScores)) {
              if (reactiveValue.includes(key)) {
                rockScore += value
                break
              }
            }
          }
        }
        
        // Density rarity score
        const nftDensity = nft.attributes?.Density || nft.attributes?.density
        if (nftDensity) {
          let densityValue: string
          if (typeof nftDensity === 'string') {
            densityValue = nftDensity
          } else if (nftDensity?.value) {
            densityValue = nftDensity.value
          } else if (Array.isArray(nftDensity) && nftDensity.length > 0) {
            densityValue = nftDensity[0]?.value || nftDensity[0] || nftDensity
          } else {
            densityValue = String(nftDensity)
          }
          if (densityValue) {
            for (const [key, value] of Object.entries(rockDensityScores)) {
              if (densityValue.includes(key)) {
                rockScore += value
                break
              }
            }
          }
        }
      })
      
      // Bonus for Rock quantity (diminishing returns)
      if (oldRockNFTs.length > 0) {
        rockScore += Math.min(oldRockNFTs.length * 10, 200) // Max 200 bonus for quantity
      }
      
      rankingScore += rockScore * 1000 // Multiply Rock score by 1000 to prioritize over Goliaths
      
      // Calculate Goliath score
      let goliathScore = 0
      const goliathDensityScores: { [key: string]: number } = {
        "Mystic": 2000,
        "High": 500,
        "Medium": 200,
        "Low": 50,
        "Common": 10,
        "Uninfected": 10,
      }
      
      goliathNFTs.forEach((nft: any) => {
        // Base score for owning a Goliath
        goliathScore += 50
        
        // Density/rarity score
        const density = nft.attributes?.Density || nft.attributes?.density
        if (density) {
          let densityValue: string
          if (typeof density === 'string') {
            densityValue = density
          } else if (density?.value) {
            densityValue = density.value
          } else if (Array.isArray(density) && density.length > 0) {
            densityValue = density[0]?.value || density[0] || density
          } else {
            densityValue = String(density)
          }
          if (densityValue) {
            for (const [key, value] of Object.entries(goliathDensityScores)) {
              if (densityValue.includes(key)) {
                goliathScore += value
                break
              }
            }
          }
        }
        
        // Check for Mystic by name
        const name = nft.name || ""
        const MYSTIC_NAMES = [
          "Agricola Stone", "Kalki", "Bulooma", "Pubian", "Nootau",
          "Sanskai", "Djup", "Sirinan", "Cemi", "Nebu", "Belarang",
        ]
        if (MYSTIC_NAMES.some((mystic) => name.includes(mystic))) {
          goliathScore += 2000 // Mystic bonus
        }
      })
      
      // Bonus for Goliath quantity (diminishing returns)
      if (goliathNFTs.length > 0) {
        goliathScore += Math.min(goliathNFTs.length * 5, 100) // Max 100 bonus for quantity
      }
      
      rankingScore += goliathScore
      
      // Only include users with NFTs or DENSITY balance
      if (!hasOldRock && !hasGoliath && density === 0) {
        return null
      }

      return {
        address: addressLower,
        ensName: ensName || null,
        displayName: ensName || `${address.slice(0, 6)}...${address.slice(-4)}`,
        totalDensity: density,
        unextractedDensity: unextractedDensity,
        hasOldRock,
        hasGoliath,
        rankingScore,
        oldRockCount: oldRockNFTs.length,
        goliathCount: goliathNFTs.length,
        // Include NFT data to avoid duplicate queries on frontend
        oldRockNFTs: oldRockNFTs.map((nft: any) => ({
          tokenId: nft.tokenId || nft.token_id,
          name: nft.name,
          image: nft.image,
          attributes: nft.attributes,
        })),
        goliathNFTs: goliathNFTs.map((nft: any) => ({
          tokenId: nft.tokenId || nft.token_id,
          name: nft.name,
          image: nft.image,
          attributes: nft.attributes,
        })),
      }
    } catch (error) {
      console.error(`Error fetching data for ${address}:`, error)
      return null
    }
  })

  const batchResults = await Promise.allSettled(batchPromises)
  const validResults = batchResults
    .map((result) => (result.status === "fulfilled" ? result.value : null))
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)

  console.log(`✅ Batch ${batchNum}/${totalBatches} completed: ${validResults.length}/${addresses.length} valid entries`)
  return validResults
}

/**
 * Fast query for top N users - prioritizes $DENSITY holders and high-value NFTs
 * This is optimized to quickly get the top 50 without processing all addresses
 */
async function fetchTopUsersFast(limit: number, amplifyApiUrl: string): Promise<any[]> {
  console.log(`🚀 Fast query for top ${limit} users...`)
  
  // Strategy: Query DENSITY holders first (they're likely top ranked)
  // Then supplement with high-value NFT owners if needed
  
  const topUsers: Map<string, any> = new Map()
  
  // Step 1: Try to get DENSITY holders list (if endpoint exists)
  let densityHolders: string[] = []
  try {
    console.log(`📡 Fetching DENSITY holders from ${amplifyApiUrl}/density/holders`)
    const densityHoldersResponse = await fetch(`${amplifyApiUrl}/density/holders`, {
      cache: "no-store",
    })
    if (densityHoldersResponse.ok) {
      const densityData = await densityHoldersResponse.json()
      densityHolders = densityData?.data || densityData?.holders || []
      console.log(`✅ Found ${densityHolders.length} DENSITY holders`)
    } else {
      console.warn(`⚠️ DENSITY holders endpoint returned ${densityHoldersResponse.status}`)
    }
  } catch (error) {
    console.warn("ℹ️ DENSITY holders endpoint not available:", error instanceof Error ? error.message : error)
  }
  
  // Step 2: Process DENSITY holders first (they're most likely to be top ranked)
  // Process in smaller batches for speed
  const densityBatchSize = 20
  const densityBatches: string[][] = []
  const maxDensityHoldersToProcess = Math.min(densityHolders.length, limit * 2)
  for (let i = 0; i < maxDensityHoldersToProcess; i += densityBatchSize) {
    densityBatches.push(densityHolders.slice(i, i + densityBatchSize))
  }
  
  console.log(`🔄 Processing ${densityBatches.length} batches of DENSITY holders (max ${maxDensityHoldersToProcess} addresses)`)
  
  for (const batch of densityBatches) {
    const batchResults = await Promise.allSettled(
      batch.map(async (address: string) => {
        try {
          const addressLower = address.toLowerCase()
          
          // Quick parallel fetch of NFTs and DENSITY with retry for DENSITY
          const nftResponse = await fetch(`${amplifyApiUrl}/nfts/${address}`)
          if (!nftResponse.ok) return null
          
          const nftData = await nftResponse.json()
          const oldRockNFTs = nftData?.data?.OldRocks || []
          const goliathNFTs = nftData?.data?.Goliath || []
          
          // Fetch DENSITY with retry logic (important for accuracy)
          let density = 0
          let unextractedDensity = 0
          const maxRetries = 2
          for (let retry = 0; retry < maxRetries; retry++) {
            try {
              if (retry > 0) {
                await new Promise((resolve) => setTimeout(resolve, 500 * retry))
              }
              const densityResponse = await fetch(`${amplifyApiUrl}/density/${address}`, { 
                cache: "no-store",
                headers: { "Accept": "application/json" },
              })
              if (densityResponse.ok) {
                const densityData = await densityResponse.json()
                density = parseFloat(densityData?.data?.amount || "0") || 0
                unextractedDensity = parseFloat(densityData?.data?.amountUnclaimed || "0") || 0
                break
              } else if (densityResponse.status === 404) {
                // No density for this address
                break
              } else if (densityResponse.status === 429 || densityResponse.status === 503) {
                // Rate limited - retry
                if (retry < maxRetries - 1) continue
              }
            } catch (e) {
              // Retry on error
              if (retry < maxRetries - 1) continue
            }
          }
          
          // Quick ranking score calculation
          let rankingScore = density * 1000000
          
          // Quick Rock score (simplified)
          let rockScore = oldRockNFTs.length * 100
          oldRockNFTs.forEach((nft: any) => {
            const reactive = nft.attributes?.Reactive || nft.attributes?.reactive
            if (reactive) {
              const reactiveValue = typeof reactive === 'string' ? reactive : reactive?.value || String(reactive)
              if (reactiveValue.includes("Pure")) rockScore += 1000
              else if (reactiveValue.includes("Polar")) rockScore += 500
              else if (reactiveValue.includes("Recurrent")) rockScore += 200
            }
            const nftDensity = nft.attributes?.Density || nft.attributes?.density
            const densityValue = typeof nftDensity === 'string' ? nftDensity : nftDensity?.value || String(nftDensity)
            if (densityValue.includes("High")) rockScore += 500
            else if (densityValue.includes("Medium")) rockScore += 200
            else if (densityValue.includes("Low")) rockScore += 50
          })
          rankingScore += rockScore * 1000
          
          // Quick Goliath score (simplified)
          let goliathScore = goliathNFTs.length * 50
          goliathNFTs.forEach((nft: any) => {
            const density = nft.attributes?.Density || nft.attributes?.density
            const densityValue = typeof density === 'string' ? density : density?.value || String(density)
            if (densityValue.includes("Mystic")) goliathScore += 2000
            else if (densityValue.includes("High")) goliathScore += 500
            else if (densityValue.includes("Medium")) goliathScore += 200
          })
          rankingScore += goliathScore
          
          if (density === 0 && oldRockNFTs.length === 0 && goliathNFTs.length === 0) {
            return null
          }
          
          return {
            address: addressLower,
            totalDensity: density,
            unextractedDensity: unextractedDensity,
            hasOldRock: oldRockNFTs.length > 0,
            hasGoliath: goliathNFTs.length > 0,
            rankingScore,
            oldRockCount: oldRockNFTs.length,
            goliathCount: goliathNFTs.length,
            // Include NFT data to avoid duplicate queries on frontend
            oldRockNFTs: oldRockNFTs.map((nft: any) => ({
              tokenId: nft.tokenId || nft.token_id,
              name: nft.name,
              image: nft.image,
              attributes: nft.attributes,
            })),
            goliathNFTs: goliathNFTs.map((nft: any) => ({
              tokenId: nft.tokenId || nft.token_id,
              name: nft.name,
              image: nft.image,
              attributes: nft.attributes,
            })),
          }
        } catch (error) {
          return null
        }
      })
    )
    
    batchResults.forEach((result) => {
      if (result.status === "fulfilled" && result.value) {
        const existing = topUsers.get(result.value.address)
        // Keep the entry with higher ranking score if duplicate
        if (!existing || result.value.rankingScore > existing.rankingScore) {
          topUsers.set(result.value.address, result.value)
        }
      }
    })
    
    // If we have enough high-scoring users, we can stop early
    if (topUsers.size >= limit * 1.5) {
      break
    }
  }
  
  // Step 3: Sort and return top N (deduplicated)
  const sorted = Array.from(topUsers.values()).sort((a, b) => b.rankingScore - a.rankingScore)
  console.log(`✅ Fast query returned ${sorted.length} unique users`)
  return sorted.slice(0, limit)
}

/**
 * Fetch fresh leaderboard data from APIs
 */
async function fetchLeaderboardData(): Promise<any[]> {
  const amplifyApiUrl = process.env.NEXT_PUBLIC_AMPLIFY_API_URL

  if (!amplifyApiUrl) {
    console.error("❌ NEXT_PUBLIC_AMPLIFY_API_URL environment variable is not set")
    console.error("Available env vars:", Object.keys(process.env).filter(k => k.includes('AMPLIFY')).join(', ') || 'none')
    console.error("Please set NEXT_PUBLIC_AMPLIFY_API_URL in your .env.local file")
    throw new Error("Amplify API URL not configured. Please set NEXT_PUBLIC_AMPLIFY_API_URL environment variable.")
  }
  
  console.log("✅ Using Amplify API URL:", amplifyApiUrl.replace(/\/$/, '')) // Log without trailing slash

  console.log("🔄 Starting leaderboard data fetch...")

  // Fetch all NFT owners to build leaderboard
  let owners: string[] = []
  try {
    console.log("📡 Fetching NFT owners from Amplify API...")
    const ownersResponse = await fetch(`${amplifyApiUrl}/nfts/owners`, {
      cache: "no-store",
    })
    if (ownersResponse.ok) {
      const ownersData = await ownersResponse.json()
      owners = ownersData?.data || []
      console.log(`✅ Found ${owners.length} NFT owners`)
    } else {
      console.error(`❌ Failed to fetch NFT owners: ${ownersResponse.status}`)
    }
  } catch (error) {
    console.error("❌ Error fetching NFT owners:", error)
    // Continue with empty owners list
  }

  // Try to fetch DENSITY holders (if endpoint exists)
  let densityHolders: string[] = []
  try {
    console.log("📡 Attempting to fetch DENSITY holders...")
    const densityHoldersResponse = await fetch(`${amplifyApiUrl}/density/holders`, {
      cache: "no-store",
    })
    if (densityHoldersResponse.ok) {
      const densityData = await densityHoldersResponse.json()
      densityHolders = densityData?.data || densityData?.holders || []
      console.log(`✅ Found ${densityHolders.length} DENSITY holders`)
    } else if (densityHoldersResponse.status !== 404) {
      console.warn(`⚠️ DENSITY holders endpoint returned ${densityHoldersResponse.status}`)
    }
  } catch (error) {
    // Endpoint might not exist, that's okay
    console.log("ℹ️ DENSITY holders endpoint not available, continuing with NFT owners only")
  }

  // Combine and deduplicate addresses
  const allAddresses = new Set<string>()
  owners.forEach((addr) => allAddresses.add(addr.toLowerCase()))
  densityHolders.forEach((addr) => allAddresses.add(addr.toLowerCase()))

  const uniqueAddresses = Array.from(allAddresses)
  console.log(`📊 Total unique addresses to process: ${uniqueAddresses.length} (${owners.length} NFT owners + ${densityHolders.length} DENSITY holders)`)

  // Process in smaller batches to avoid rate limiting on DENSITY queries
  const BATCH_SIZE = 25 // Reduced from 50 to 25 to avoid rate limiting
  const batches: string[][] = []
  for (let i = 0; i < uniqueAddresses.length; i += BATCH_SIZE) {
    batches.push(uniqueAddresses.slice(i, i + BATCH_SIZE))
  }

  console.log(`🔄 Processing ${batches.length} batches of up to ${BATCH_SIZE} addresses each...`)

  // Process batches sequentially to avoid rate limiting, but parallelize within each batch
  // Use smaller batches and longer delays to avoid rate limiting on DENSITY queries
  const allResults: any[] = []
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i]
    
    const batchResults = await processBatch(batch, amplifyApiUrl, i + 1, batches.length)
    allResults.push(...batchResults)
    
    // Update progress after batch completes - calculate based on batches processed
    const progressPercent = Math.min(95, Math.round(((i + 1) / batches.length) * 100))
    setProgress(allResults.length, uniqueAddresses.length, i + 1, batches.length)
    
    // Longer delay between batches to avoid rate limiting on DENSITY queries
    // Increase delay as we process more batches to be more conservative
    if (i < batches.length - 1) {
      const delay = Math.min(500 + (i * 50), 2000) // Start at 500ms, increase up to 2s
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }
  
  // Count addresses with successful DENSITY queries
  const addressesWithDensity = allResults.filter(r => r.totalDensity > 0).length
  const addressesWithNFTs = allResults.filter(r => r.hasOldRock || r.hasGoliath).length
  
  console.log(`✅ Processed ${allResults.length} valid leaderboard entries from ${uniqueAddresses.length} addresses`)
  console.log(`📊 Summary: ${addressesWithDensity} with $DENSITY, ${addressesWithNFTs} with NFTs`)
  
  // Final progress update - set to 100% when complete (after sorting)
  setProgress(allResults.length, uniqueAddresses.length, batches.length, batches.length)

  // Sort by ranking score
  const leaderboard = allResults.sort((a, b) => {
    // Sort by ranking score (descending)
    // This prioritizes: $DENSITY > High-density Rocks > Rare Goliaths > Common Goliaths
    return b.rankingScore - a.rankingScore
  })

  console.log(`🎯 Leaderboard sorted: ${leaderboard.length} entries ready`)
  return leaderboard
}

/**
 * GET /api/leaderboard
 * Returns cached leaderboard data, refreshing in background if stale
 * Supports pagination: ?limit=50&offset=0
 * Supports fast mode: ?fast=true (uses optimized top-N query)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const forceRefresh = searchParams.get("refresh") === "true"
    const limit = parseInt(searchParams.get("limit") || "0")
    const offset = parseInt(searchParams.get("offset") || "0")
    const fastMode = searchParams.get("fast") === "true"

    // Fast mode: Use optimized query for top N users
    if (fastMode && limit > 0) {
      try {
        const amplifyApiUrl = process.env.NEXT_PUBLIC_AMPLIFY_API_URL
        if (!amplifyApiUrl) {
          console.error("❌ NEXT_PUBLIC_AMPLIFY_API_URL environment variable is not set")
          console.error("Available env vars:", Object.keys(process.env).filter(k => k.includes('AMPLIFY')).join(', ') || 'none')
          console.error("Please set NEXT_PUBLIC_AMPLIFY_API_URL in your .env.local file")
          // Return empty array instead of throwing to allow graceful degradation
          return NextResponse.json({
            success: true,
            data: [],
            cached: false,
            fast: true,
            total: 0,
            error: "Amplify API URL not configured. Please set NEXT_PUBLIC_AMPLIFY_API_URL environment variable.",
          })
        }
        
        console.log("✅ Fast mode using Amplify API URL:", amplifyApiUrl.replace(/\/$/, ''))
        
        console.log(`🚀 Fast mode: Fetching top ${limit} users...`)
        const topUsers = await fetchTopUsersFast(limit, amplifyApiUrl)
        console.log(`✅ Fast mode: Got ${topUsers.length} users`)
        
        if (topUsers.length === 0) {
          console.warn("⚠️ Fast mode returned 0 users, checking cache and falling back to full query")
          // Check if we have cached data first
          const cachedData = getCachedDataIncludingStale()
          if (cachedData && cachedData.length > 0) {
            console.log(`✅ Using ${cachedData.length} cached entries instead`)
            const paginatedCached = limit > 0 ? cachedData.slice(offset, offset + limit) : cachedData
            return NextResponse.json({
              success: true,
              data: paginatedCached,
              cached: true,
              stale: isCacheStale(),
              paginated: limit > 0,
              offset: limit > 0 ? offset : undefined,
              limit: limit > 0 ? limit : undefined,
              total: cachedData.length,
              fast: true,
            })
          }
          // Fall through to regular query
        } else {
          // Add rank, ENS names, and badges (lightweight)
          const enrichedUsers = await Promise.all(
            topUsers.map(async (user, index) => {
              // Fetch ENS name (lightweight)
              let ensName: string | undefined
              try {
                const ensResponse = await fetch(`https://api.ensideas.com/ens/resolve/${user.address}`)
                if (ensResponse.ok) {
                  const ensData = await ensResponse.json()
                  ensName = ensData?.name || undefined
                }
              } catch (e) {
                // Ignore ENS errors
              }
              
              return {
                ...user,
                rank: index + 1,
                ensName: ensName || null,
                displayName: ensName || `${user.address.slice(0, 6)}...${user.address.slice(-4)}`,
                badges: [], // Will be calculated on frontend if needed
                bestBadges: [],
                avatar: null,
              }
            })
          )
          
          return NextResponse.json({
            success: true,
            data: enrichedUsers,
            cached: false,
            fast: true,
            total: enrichedUsers.length,
          })
        }
      } catch (error) {
        console.error("❌ Fast mode error:", error)
        // Fall through to regular query if fast mode fails
      }
    }
    
    // Check cache first (including stale cache as fallback)
    const cachedData = getCachedData()
    const cacheStale = isCacheStale()
    const staleCachedData = getCachedDataIncludingStale()
    
    console.log(`📦 Cache status: fresh=${!!cachedData}, stale=${cacheStale}, staleData=${!!staleCachedData}, staleDataLength=${staleCachedData?.length || 0}`)

    // If we have fresh cached data and not forcing refresh, return it
    if (cachedData && !cacheStale && !forceRefresh) {
      // Apply pagination if requested
      if (limit > 0) {
        const paginatedData = cachedData.slice(offset, offset + limit)
        return NextResponse.json({
          success: true,
          data: paginatedData,
          cached: true,
          paginated: true,
          offset,
          limit,
          total: cachedData.length,
        })
      }
      
      return NextResponse.json({
        success: true,
        data: cachedData,
        cached: true,
      })
    }

    // If cache is stale or missing, check if refresh is already in progress
    if (isRefreshing()) {
      const refreshPromise = getRefreshPromise()
      if (refreshPromise) {
        // Wait for existing refresh to complete (with timeout)
        try {
          const freshData = await Promise.race([
            refreshPromise,
            new Promise<any[]>((_, reject) => 
              setTimeout(() => reject(new Error("Refresh timeout")), 30000) // 30s timeout - return stale cache if refresh takes too long
            )
          ])
          
          // Apply pagination if requested
          if (limit > 0) {
            const paginatedData = freshData.slice(offset, offset + limit)
            return NextResponse.json({
              success: true,
              data: paginatedData,
              cached: false,
              paginated: true,
              offset,
              limit,
              total: freshData.length,
            })
          }
          
          return NextResponse.json({
            success: true,
            data: freshData,
            cached: false,
          })
        } catch (error) {
          // If refresh failed or timed out, return stale cache if available
          const staleData = getCachedDataIncludingStale()
          if (staleData && staleData.length > 0) {
            const paginatedStale = limit > 0 ? staleData.slice(offset, offset + limit) : staleData
            console.log(`⚠️ Refresh failed/timed out, returning ${paginatedStale.length} stale entries`)
            return NextResponse.json({
              success: true,
              data: paginatedStale,
              cached: true,
              stale: true,
              paginated: limit > 0,
              offset: limit > 0 ? offset : undefined,
              limit: limit > 0 ? limit : undefined,
              total: staleData.length,
            })
          }
          // If no stale cache, return empty array instead of throwing
          console.error("❌ No cache available and refresh failed:", error instanceof Error ? error.message : error)
          return NextResponse.json({
            success: true,
            data: [],
            cached: false,
            error: error instanceof Error ? error.message : "Failed to load leaderboard",
            total: 0,
          })
        }
      }
    }

    // Start new refresh
    const refreshPromise = fetchLeaderboardData()
      .then(async (data) => {
        await setCachedData(data)
        return data
      })
      .catch((error) => {
        console.error("Error refreshing leaderboard cache:", error)
        throw error
      })

    setRefreshPromise(refreshPromise)

    // If we have stale cache, return it immediately and refresh in background
    if (cachedData && cacheStale) {
      // Don't await - let it refresh in background
      refreshPromise.catch((error) => {
        console.error("Background refresh failed:", error)
        // Keep stale cache on error
      })
      
      const staleData = limit > 0 ? staleCachedData.slice(offset, offset + limit) : staleCachedData
      console.log(`✅ Returning ${staleData.length} stale entries while refreshing in background`)
      return NextResponse.json({
        success: true,
        data: staleData,
        cached: true,
        stale: true,
        refreshing: true,
        paginated: limit > 0,
        offset: limit > 0 ? offset : undefined,
        limit: limit > 0 ? limit : undefined,
        total: staleCachedData.length,
      })
    }

    // No cache available, wait for fresh data (with shorter timeout for initial load)
    try {
      const freshData = await Promise.race([
        refreshPromise,
        new Promise<any[]>((_, reject) => 
          setTimeout(() => reject(new Error("Request timeout - leaderboard data fetch took too long")), 30000) // 30s timeout for initial load
        )
      ])
      
      // Apply pagination if requested
      if (limit > 0) {
        const paginatedData = freshData.slice(offset, offset + limit)
        return NextResponse.json({
          success: true,
          data: paginatedData,
          cached: false,
          paginated: true,
          offset,
          limit,
          total: freshData.length,
        })
      }
      
      return NextResponse.json({
        success: true,
        data: freshData,
        cached: false,
      })
    } catch (timeoutError) {
      // Timeout occurred - return empty array instead of failing
      console.error("⚠️ Leaderboard fetch timed out, returning empty result")
      return NextResponse.json({
        success: true,
        data: [],
        cached: false,
        error: "Request timeout - please try again",
        total: 0,
      })
    }
  } catch (error) {
    console.error("Error fetching leaderboard:", error)
    // Try to return stale cache as fallback (even if stale)
    const staleData = getCachedDataIncludingStale()
    if (staleData) {
      const paginatedStale = limit > 0 ? staleData.slice(offset, offset + limit) : staleData
      return NextResponse.json({
        success: true,
        data: paginatedStale,
        cached: true,
        stale: true,
        error: "Failed to refresh, using cached data",
        paginated: limit > 0,
        offset: limit > 0 ? offset : undefined,
        limit: limit > 0 ? limit : undefined,
        total: staleData.length,
      })
    }
    // Last resort: return empty array instead of 500 error to prevent page from getting stuck
    console.error("❌ All fallbacks failed, returning empty leaderboard")
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({
      success: true,
      data: [],
      cached: false,
      error: errorMessage,
      total: 0,
    })
  }
}

