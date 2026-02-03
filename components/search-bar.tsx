"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Search, Loader2, FileText, Gamepad2, ImageIcon, Gift, BookOpen, User, Sprout, SatelliteDish } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import NextImage from "next/image"
import { useRouter } from "next/navigation"

interface SearchResult {
  id: string
  type: "profile" | "nft" | "app" | "page" | "feature"
  name: string
  image?: string
  collection?: string
  address?: string
  description?: string
  url?: string
  category?: string
}

interface ContentSuggestion {
  id: string
  type: "page" | "feature" | "app"
  title: string
  description: string
  url: string
  icon: React.ReactNode
  category: string
}

function shortenAddress(address: string, chars = 6) {
  if (!address.startsWith("0x") || address.length < chars * 2 + 2) {
    return address;
  }

  return address.slice(0, 2 + chars) + "..." + address.slice(-chars);
}

function DynamicImage({ id }: { id: string }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    async function fetchImage() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_METADATA_SERVICE_URL}/${id}`);
        if (!res.ok) throw new Error("Failed to fetch image metadata");
        const data = await res.json();
        setImageUrl(data.image.replace('.webp', '-300.webp'));
      } catch (err) {
        console.error(err);
      }
    }

    fetchImage();
  }, [id]);

  return (
    <NextImage
      src={imageUrl || "/placeholder.svg"}
      alt={id}
      width={40}
      height={40}
      className="object-cover"
    />
  );
}

function numbersContaining(input, maximum, limit) {
  const result = [];
  const target = input.toString();

  for (let i = 1; i <= maximum; i++) {
    if (i.toString().includes(target) && i.toString() !== target) {
      result.push(i);
    }
  }

  if (limit) {
    return result.slice(0, limit);
  }

  return result;
}

export function SearchBar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [contentSuggestions, setContentSuggestions] = useState<ContentSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [goliathCollectionLimit, setGoliathCollectionLimit] = useState(3717)
  const [nftOwnersList, setNftOwnersList] = useState<any[]>([])
  const [userWalletData, setUserWalletData] = useState<Map<string, { oldRock: boolean; goliath: boolean; density: number; ensName?: string }>>(new Map())
  const [leaderboardData, setLeaderboardData] = useState<Array<{ address: string; ensName: string | null; displayName: string; totalDensity: number; hasOldRock: boolean; hasGoliath: boolean }>>([])
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Content suggestions database
  const allContentSuggestions: ContentSuggestion[] = [
    {
      id: "airdrop",
      type: "app",
      title: "Airdrop",
      description: "Claim your Old Rock NFT airdrop rewards",
      url: "/airdrop",
      icon: <Gift className="w-4 h-4" />,
      category: "Rewards",
    },
    {
      id: "comic",
      type: "page",
      title: "Old Rock Comic",
      description: "Read the epic Old Rock saga with 37+ pages across 3 chapters",
      url: "/comic",
      icon: <FileText className="w-4 h-4" />,
      category: "Entertainment",
    },
    {
      id: "bounty-call",
      type: "page",
      title: "Bounty Call",
      description: "Hunt the outlaws and join the Discord community",
      url: "/bounty-call",
      icon: <Gamepad2 className="w-4 h-4" />,
      category: "Gaming",
    },
    {
      id: "collections",
      type: "page",
      title: "NFT Collections",
      description: "Explore Old Rock and Goliath NFT collections with detailed stats",
      url: "/collections",
      icon: <ImageIcon className="w-4 h-4" />,
      category: "NFTs",
    },
    {
      id: "density-deck",
      type: "app",
      title: "Density Deck Beta",
      description: "Strategic card game powered by Old Rock NFTs",
      url: "https://densitydeck.com",
      icon: <Gamepad2 className="w-4 h-4" />,
      category: "Gaming",
    },
    {
      id: "amplify",
      type: "app",
      title: "Amplify NFT Staking",
      description: "Soft stake your NFTs to earn rewards",
      url: "/staking",
      icon: <SatelliteDish className="w-4 h-4" />,
      category: "DeFi",
    },
    {
      id: "goliath-mint",
      type: "page",
      title: "Goliath Mint",
      description: "Mint new Goliath NFTs from the collection",
      url: "/mint",
      icon: <Sprout className="w-4 h-4" />,
      category: "NFTs",
    },
    {
      id: "profile",
      type: "feature",
      title: "User Profiles",
      description: "View NFT collections, achievements, and set profile pictures",
      url: "/profile",
      icon: <User className="w-4 h-4" />,
      category: "Profile",
    },
    {
      id: "documentation",
      type: "feature",
      title: "Documentation",
      description: "View Old Rock ecosystem documentation",
      url: "https://docs.oldrocknft.com",
      icon: <BookOpen className="w-4 h-4" />,
      category: "Docs",
    },
  ]

  // Function to fetch user wallet data (cached)
  const fetchUserWalletData = async (address: string): Promise<{ oldRock: boolean; goliath: boolean; density: number; ensName?: string } | null> => {
    const addressLower = address.toLowerCase();

    // Check cache first
    if (userWalletData.has(addressLower)) {
      return userWalletData.get(addressLower)!;
    }

    try {
      // Fetch user NFTs and density through API route to avoid CORS
      let hasOldRock = false;
      let hasGoliath = false;
      let density = 0;

      try {
        const nftResponse = await fetch(`/api/nfts?action=user-data&walletAddress=${address}`);
        if (nftResponse.ok) {
          const nftData = await nftResponse.json();
          if (nftData.success && nftData.data) {
            hasOldRock = (nftData.data.OldRocks?.length || 0) > 0;
            hasGoliath = (nftData.data.Goliath?.length || 0) > 0;
          }
        }
      } catch (e) {
        // Ignore NFT fetch errors
      }

      // Fetch DENSITY balance through API route
      try {
        const densityResponse = await fetch(`/api/nfts?action=user-density&walletAddress=${address}`);
        if (densityResponse.ok) {
          const densityData = await densityResponse.json();
          if (densityData.success && densityData.data) {
            density = parseFloat(densityData.data.amount || "0") || 0;
          }
        }
      } catch (e) {
        // Ignore density fetch errors
      }

      // Fetch ENS name
      let ensName: string | undefined;
      try {
        const ensResponse = await fetch(`https://api.ensideas.com/ens/resolve/${address}`);
        if (ensResponse.ok) {
          const ensData = await ensResponse.json();
          ensName = ensData?.name || undefined;
        }
      } catch (e) {
        // Ignore ENS fetch errors
      }

      const walletData = {
        oldRock: hasOldRock,
        goliath: hasGoliath,
        density,
        ensName,
      };

      // Cache the result
      setUserWalletData(prev => new Map(prev).set(addressLower, walletData));

      return walletData;
    } catch (e) {
      return null;
    }
  };

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Retrieve Goliath collection limit and leaderboard data on mount
  useEffect(() => {
    async function fetchGoliathCollectionLimit() {
      try {
        // Check if metadata service URL is configured
        if (!process.env.NEXT_PUBLIC_METADATA_SERVICE_URL) {
          console.warn("NEXT_PUBLIC_METADATA_SERVICE_URL not configured, skipping Goliath limit fetch");
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_METADATA_SERVICE_URL}/goliath/limit`);

        if (!response.ok) {
          console.warn(`Could not fetch Goliath collection limit: ${response.status}`);
          return;
        }

        const data = await response.json();

        setGoliathCollectionLimit(data.limit);
      } catch (e) {
        // Silently fail - not critical for search functionality
        console.warn("Could not fetch Goliath collection limit:", e);
      }
    }

    async function fetchNftOwnersList() {
      try {
        // Use API route to avoid CORS issues
        const response = await fetch("/api/leaderboard?limit=0"); // Get all users for search index

        if (!response.ok) {
          // If leaderboard fails, try to get from cache or skip
          console.warn("Could not fetch NFT owners list from leaderboard");
          return;
        }

        const result = await response.json();
        if (result.success && result.data) {
          // Extract addresses from leaderboard data
          const addresses = result.data.map((user: any) => user.address);
          setNftOwnersList(addresses);
        }
      } catch (e) {
        // Silently fail - search will still work with leaderboard data
        console.warn("Could not fetch NFT owners list:", e);
      }
    }

    async function fetchLeaderboardData() {
      try {
        const response = await fetch("/api/leaderboard");
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const result = await response.json();
        if (result.success && result.data) {
          setLeaderboardData(result.data);

          // Pre-populate userWalletData cache with leaderboard data
          const walletDataMap = new Map<string, { oldRock: boolean; goliath: boolean; density: number; ensName?: string }>();
          result.data.forEach((user: any) => {
            walletDataMap.set(user.address.toLowerCase(), {
              oldRock: user.hasOldRock,
              goliath: user.hasGoliath,
              density: user.totalDensity,
              ensName: user.ensName || undefined,
            });
          });
          setUserWalletData(prev => new Map([...prev, ...walletDataMap]));
        }
      } catch (e) {
        console.error("Error fetching leaderboard data:", e);
      }
    }

    fetchGoliathCollectionLimit();
    fetchNftOwnersList();
    fetchLeaderboardData();
  }, []);

  // Focus input when search opens
  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isSearchOpen])

  // Search function with content suggestions
  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      if (searchQuery.length >= 1) {
        performSearch(searchQuery)
        generateContentSuggestions(searchQuery)
      } else {
        setSearchResults([])
        setContentSuggestions([])
      }
    }, 200)

    return () => clearTimeout(searchTimeout)
  }, [searchQuery])

  const generateContentSuggestions = (query: string) => {
    const filtered = allContentSuggestions.filter(
      (suggestion) =>
        suggestion.title.toLowerCase().includes(query.toLowerCase()) ||
        suggestion.description.toLowerCase().includes(query.toLowerCase()) ||
        suggestion.category.toLowerCase().includes(query.toLowerCase()),
    )
    setContentSuggestions(filtered.slice(0, 4))
  }

  const performSearch = async (query: string) => {
    setIsLoading(true)

    const originalQuery = query;
    query = query.toLowerCase();

    try {
      const mockResults: SearchResult[] = [];
      const queryTrimmed = query
        .replace(/old rock/i, '')
        .replace(/oldrock/i, '')
        .replace(/goliath/i, '')
        .replace(/#/, '')
        .replace(/0x/i, '')
        .trim()
      const queryTrimmedNumber = +queryTrimmed;

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 300))

      // Search by ENS name - exact match
      if (query.includes('.eth') || (query.length >= 3 && !queryTrimmedNumber)) {
        try {
          // Try to resolve ENS name to address (exact match)
          const ensResponse = await fetch(`https://api.ensideas.com/ens/resolve/${query}`);
          if (ensResponse.ok) {
            const ensData = await ensResponse.json();
            if (ensData?.address) {
              const address = ensData.address.toLowerCase();
              const walletData = await fetchUserWalletData(address);
              if (walletData) {
                const descriptionParts: string[] = [];
                if (walletData.oldRock) descriptionParts.push("Old Rock holder");
                if (walletData.goliath) descriptionParts.push("Goliath holder");
                if (walletData.density > 0) descriptionParts.push(`${walletData.density.toLocaleString()} $DENSITY`);

                mockResults.push({
                  id: address,
                  type: "profile",
                  name: ensData.name || shortenAddress(address),
                  address: address,
                  description: descriptionParts.length > 0 ? descriptionParts.join(" • ") : "Profile",
                  image: "/placeholder.svg?height=100&width=100",
                  collection: "Profile",
                });
              }
            }
          }
        } catch (e) {
          // Ignore ENS resolution errors
        }
      }

      // ENS name suggestions for partial names (3+ characters, no numbers, no .eth, not wallet address)
      // Use leaderboard data as source of truth
      if (query.length >= 3 && !queryTrimmedNumber && !query.includes('.eth') && !query.startsWith('0x')) {
        try {
          const queryLower = query.toLowerCase();
          const matchingENS: Array<{ name: string; address: string; data: any; priority: number }> = [];

          // Search through leaderboard data first (source of truth)
          leaderboardData.forEach((user) => {
            if (user.ensName) {
              const ensNameLower = user.ensName.toLowerCase();

              // Priority: exact match > starts with > contains
              let priority = 3;
              if (ensNameLower === queryLower) {
                priority = 1; // Exact match
              } else if (ensNameLower.startsWith(queryLower)) {
                priority = 2; // Starts with
              } else if (ensNameLower.includes(queryLower)) {
                priority = 3; // Contains
              } else {
                return; // No match
              }

              matchingENS.push({
                name: user.ensName,
                address: user.address.toLowerCase(),
                data: {
                  oldRock: user.hasOldRock,
                  goliath: user.hasGoliath,
                  density: user.totalDensity,
                  ensName: user.ensName,
                },
                priority: priority
              });
            }
          });

          // Also search through cached wallet data for additional matches
          userWalletData.forEach((data, address) => {
            // Skip if already in leaderboard results
            if (matchingENS.some(e => e.address === address)) return;

            if (data.ensName) {
              const ensNameLower = data.ensName.toLowerCase();

              // Priority: exact match > starts with > contains
              let priority = 3;
              if (ensNameLower === queryLower) {
                priority = 1;
              } else if (ensNameLower.startsWith(queryLower)) {
                priority = 2;
              } else if (ensNameLower.includes(queryLower)) {
                priority = 3;
              } else {
                return; // No match
              }

              matchingENS.push({
                name: data.ensName,
                address: address,
                data: data,
                priority: priority
              });
            }
          });

          // Sort by priority (exact > starts with > contains), then limit to 10
          matchingENS
            .sort((a, b) => {
              if (a.priority !== b.priority) return a.priority - b.priority;
              return a.name.localeCompare(b.name);
            })
            .slice(0, 10)
            .forEach(ensMatch => {
              const walletData = ensMatch.data;

              if (walletData) {
                const descriptionParts: string[] = [];
                if (walletData.oldRock) descriptionParts.push("Old Rock holder");
                if (walletData.goliath) descriptionParts.push("Goliath holder");
                if (walletData.density > 0) descriptionParts.push(`${walletData.density.toLocaleString()} $DENSITY`);

                mockResults.push({
                  id: ensMatch.address,
                  type: "profile",
                  name: ensMatch.name,
                  address: ensMatch.address,
                  description: descriptionParts.length > 0 ? descriptionParts.join(" • ") : "Profile",
                  image: "/placeholder.svg?height=100&width=100",
                  collection: "Profile",
                });
              } else {
                // Still show ENS name even if we don't have wallet data
                mockResults.push({
                  id: ensMatch.address,
                  type: "profile",
                  name: ensMatch.name,
                  address: ensMatch.address,
                  description: "ENS Profile",
                  image: "/placeholder.svg?height=100&width=100",
                  collection: "Profile",
                });
              }
            });
        } catch (e) {
          // Ignore ENS suggestion errors
        }
      }

      // Search wallet addresses and filter by NFT holdings and DENSITY balance
      // Use leaderboard data as primary source
      if (queryTrimmed.length >= 3) {
        const queryLower = query.toLowerCase();
        const queryWithoutPrefix = query.replace('0x', '').toLowerCase();

        // Filter based on search criteria
        const searchForOldRock = originalQuery.toLowerCase().includes('old rock') || originalQuery.toLowerCase().includes('oldrock');
        const searchForGoliath = originalQuery.toLowerCase().includes('goliath');
        const searchForDensity = originalQuery.toLowerCase().includes('density') || originalQuery.toLowerCase().includes('$density');

        // Search through leaderboard data first (source of truth)
        leaderboardData.forEach((user) => {
          const addressLower = user.address.toLowerCase();
          const addressWithoutPrefix = user.address.replace('0x', '').toLowerCase();
          const ensNameLower = user.ensName?.toLowerCase() || '';
          const displayNameLower = user.displayName.toLowerCase();

          // Match by address, ENS name, or display name
          const matchesAddress = addressLower.includes(queryLower) || addressWithoutPrefix.includes(queryWithoutPrefix);
          const matchesENS = ensNameLower.includes(queryLower);
          const matchesDisplayName = displayNameLower.includes(queryLower);

          if (matchesAddress || matchesENS || matchesDisplayName) {
            // If specific collection is searched, only show if they have it
            if (searchForOldRock && !user.hasOldRock) return;
            if (searchForGoliath && !user.hasGoliath) return;
            if (searchForDensity && user.totalDensity === 0) return;

            const descriptionParts: string[] = [];
            if (user.hasOldRock) descriptionParts.push("Old Rock holder");
            if (user.hasGoliath) descriptionParts.push("Goliath holder");
            if (user.totalDensity > 0) descriptionParts.push(`${user.totalDensity.toLocaleString()} $DENSITY`);

            mockResults.push({
              id: user.address,
              type: "profile",
              name: user.displayName,
              address: user.address,
              description: descriptionParts.length > 0 ? descriptionParts.join(" • ") : "Profile",
              image: "/placeholder.svg?height=100&width=100",
              collection: "Profile",
            });
          }
        });

        // Also search through cached wallet data for additional matches not in leaderboard
        userWalletData.forEach((data, address) => {
          // Skip if already in leaderboard results
          if (leaderboardData.some(u => u.address.toLowerCase() === address)) return;

          const addressLower = address.toLowerCase();
          const addressWithoutPrefix = address.replace('0x', '').toLowerCase();
          const ensNameLower = data.ensName?.toLowerCase() || '';

          // Match by address or ENS name
          const matchesAddress = addressLower.includes(queryLower) || addressWithoutPrefix.includes(queryWithoutPrefix);
          const matchesENS = ensNameLower.includes(queryLower);

          if (matchesAddress || matchesENS) {
            // If specific collection is searched, only show if they have it
            if (searchForOldRock && !data.oldRock) return;
            if (searchForGoliath && !data.goliath) return;
            if (searchForDensity && data.density === 0) return;

            const descriptionParts: string[] = [];
            if (data.oldRock) descriptionParts.push("Old Rock holder");
            if (data.goliath) descriptionParts.push("Goliath holder");
            if (data.density > 0) descriptionParts.push(`${data.density.toLocaleString()} $DENSITY`);

            mockResults.push({
              id: address,
              type: "profile",
              name: data.ensName || shortenAddress(address),
              address: address,
              description: descriptionParts.length > 0 ? descriptionParts.join(" • ") : "Profile",
              image: "/placeholder.svg?height=100&width=100",
              collection: "Profile",
            });
          }
        });
      }

      // Append results for Old Rock NFT assets
      if (
        queryTrimmedNumber && queryTrimmedNumber > 0
        && queryTrimmedNumber <= goliathCollectionLimit
      ) {
        // Push exact matches to top
        if (queryTrimmedNumber <= 500) {
          mockResults.push({
            id: `oldrock/${queryTrimmedNumber}`,
            type: "nft",
            name: `Old Rock #${queryTrimmedNumber}`,
            image: "/placeholder.svg?height=100&width=100",
            collection: "View on OpenSea",
            url: `https://opensea.io/item/ethereum/0x5c83df384971ef5ba252336f78ad97d26a0ec7df/${queryTrimmedNumber}`
          });
        }

        if (queryTrimmedNumber <= goliathCollectionLimit) {
          mockResults.push({
            id: `goliath/${queryTrimmedNumber}`,
            type: "nft",
            name: `Goliath #${queryTrimmedNumber}`,
            image: "/placeholder.svg?height=100&width=100",
            collection: "View on OpenSea",
            url: `https://opensea.io/item/ethereum/0x05ab5a50f77b9957b51145b259f05e805d84e92e/${queryTrimmedNumber}`
          });
        }

        // Only "search" related NFT numbers for double digit integers to prevent long list
        if (queryTrimmedNumber >= 10) {
          const goliathMatches = numbersContaining(queryTrimmedNumber, goliathCollectionLimit, 3);
          const oldRockMatches = numbersContaining(queryTrimmedNumber, 500, 3);

          oldRockMatches.forEach((match) => {
            mockResults.push({
              id: `oldrock/${+match}`,
              type: "nft",
              name: `Old Rock #${match}`,
              image: "/placeholder.svg?height=100&width=100",
              collection: "View on OpenSea",
              url: `https://opensea.io/item/ethereum/0x5c83df384971ef5ba252336f78ad97d26a0ec7df/${queryTrimmedNumber}`
            });
          });

          goliathMatches.forEach((match) => {
            mockResults.push({
              id: `goliath/${+match}`,
              type: "nft",
              name: `Goliath #${match}`,
              image: "/placeholder.svg?height=100&width=100",
              collection: "View on OpenSea",
              url: `https://opensea.io/item/ethereum/0x05ab5a50f77b9957b51145b259f05e805d84e92e/${queryTrimmedNumber}`
            });
          });
        }
      }

      setSearchResults(mockResults)
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResultClick = (result: SearchResult) => {
    setIsSearchOpen(false)
    setSearchQuery("")

    if (result.type === "profile") {
      router.push(`/profile/${result.id}`)
    } else if (result.type === "nft" && result.url) {
      window.open(result.url, '_blank')
    }
  }

  const handleSuggestionClick = (suggestion: ContentSuggestion) => {
    setIsSearchOpen(false)
    setSearchQuery("")

    if (suggestion.url.startsWith("http")) {
      window.open(suggestion.url, "_blank")
    } else {
      router.push(suggestion.url)
    }
  }

  return (
    <div className="relative" ref={searchRef}>
      <button
        className="flex items-center space-x-2 bg-gray-800/60 backdrop-blur-sm border border-gray-600/30 rounded-xl px-4 py-2 hover:bg-gray-700/60 transition-colors"
        onClick={() => {
          setIsSearchOpen(true);

          if (isSearchOpen && inputRef.current) {
            inputRef.current.focus()
          }
        }}
      >
        <Search className="w-4 h-4 text-gray-400" />
        <span className="text-gray-400 text-sm hidden md:inline whitespace-nowrap">
          Search profiles, apps & NFTs...
        </span>
      </button>

      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            className="absolute top-full left-0 mt-2 w-[320px] md:w-[450px] bg-gray-900/95 backdrop-blur-md border border-gray-700/50 rounded-xl overflow-hidden shadow-2xl z-50"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-3 border-b border-gray-700/50">
              <div className="flex items-center space-x-2">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search profiles, apps & NFTs..."
                  className="bg-transparent border-none outline-none text-white w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="max-h-[500px] overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center p-6">
                  <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                </div>
              ) : (
                <>
                  {/* Content Suggestions */}
                  {contentSuggestions.length > 0 && (
                    <div className="p-2">
                      <div className="text-xs text-gray-400 font-pt-mono uppercase tracking-wider px-2 py-1">
                        Suggestions
                      </div>
                      {contentSuggestions.map((suggestion) => (
                        <div
                          key={suggestion.id}
                          className="flex items-start space-x-3 p-3 hover:bg-gray-800/50 rounded-lg cursor-pointer group"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0 group-hover:bg-gray-700 transition-colors">
                            {suggestion.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <div className="text-white font-medium truncate">{suggestion.title}</div>
                              <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
                                {suggestion.category}
                              </span>
                            </div>
                            <div className="text-gray-400 text-sm mt-1 line-clamp-2">{suggestion.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <div className={contentSuggestions.length > 0 ? "border-t border-gray-700/50" : ""}>
                      {/* Group results by type */}
                      {searchResults.some((result) => result.type === "profile") && (
                        <div className="p-2">
                          <div className="text-xs text-gray-400 font-pt-mono uppercase tracking-wider px-2 py-1">
                            Profiles
                          </div>
                          {searchResults
                            .filter((result) => result.type === "profile")
                            .map((result) => (
                              <div
                                key={result.id}
                                className="flex items-center space-x-3 p-2 hover:bg-gray-800/50 rounded-lg cursor-pointer"
                                onClick={() => handleResultClick(result)}
                              >
                                <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0 group-hover:bg-gray-700 transition-colors">
                                  <User className="w-6 h-6" />
                                </div>
                                <div>
                                  <div className="text-white font-medium">{result.name}</div>
                                  <div className="text-gray-400 text-xs">{result.address}</div>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}

                      {searchResults.some((result) => result.type === "nft") && (
                        <div className="p-2">
                          <div className="text-xs text-gray-400 font-pt-mono uppercase tracking-wider px-2 py-1">
                            NFTs
                          </div>
                          {searchResults
                            .filter((result) => result.type === "nft")
                            .map((result) => (
                              <div
                                key={result.id}
                                className="flex items-center space-x-3 p-2 hover:bg-gray-800/50 rounded-lg cursor-pointer"
                                onClick={() => handleResultClick(result)}
                              >
                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
                                  <DynamicImage
                                    id={result.id}
                                  />
                                </div>
                                <div>
                                  <div className="text-white font-medium whitespace-nowrap">{result.name}</div>
                                  <div className="text-gray-400 text-xs">{result.collection}</div>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* No results state */}
                  {searchQuery.length >= 2 &&
                    searchResults.length === 0 &&
                    contentSuggestions.length === 0 &&
                    !isLoading && <div className="p-6 text-center text-gray-400">No results found</div>}

                  {/* Default suggestions when no query */}
                  {searchQuery.length === 0 && (
                    <div className="p-4 space-y-3">
                      <div className="text-xs text-gray-400 font-pt-mono uppercase tracking-wider px-2">
                        Try searching for
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          className="px-3 py-1 bg-gray-800/80 hover:bg-gray-700/80 rounded-full text-sm text-gray-300 whitespace-nowrap"
                          onClick={() => setSearchQuery("Old Rock")}
                        >
                          Old Rock
                        </button>
                        <button
                          className="px-3 py-1 bg-gray-800/80 hover:bg-gray-700/80 rounded-full text-sm text-gray-300"
                          onClick={() => setSearchQuery("Goliath")}
                        >
                          Goliath
                        </button>
                        <button
                          className="px-3 py-1 bg-gray-800/80 hover:bg-gray-700/80 rounded-full text-sm text-gray-300"
                          onClick={() => setSearchQuery("Comic")}
                        >
                          Comic
                        </button>
                        <button
                          className="px-3 py-1 bg-gray-800/80 hover:bg-gray-700/80 rounded-full text-sm text-gray-300"
                          onClick={() => setSearchQuery("Airdrop")}
                        >
                          Airdrop
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
