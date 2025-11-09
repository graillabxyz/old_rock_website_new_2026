"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Search, Loader2, FileText, Gamepad2, ImageIcon, Gift } from "lucide-react"
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

function numbersContaining(input, maximum) {
  const result = [];
  const target = input.toString();

  for (let i = 1; i <= maximum; i++) {
    if (i.toString().includes(target) && i.toString() !== target) {
      result.push(i);
    }
  }

  return result;
}

export function SearchBar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [contentSuggestions, setContentSuggestions] = useState<ContentSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
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
      url: "https://airdrop.oldrocknft.com",
      icon: <Gift className="w-4 h-4" />,
      category: "Rewards",
    },
    {
      id: "comic",
      type: "page",
      title: "Old Rock Comic",
      description: "Read the epic Old Rock saga with 31+ pages across 2 chapters",
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
      url: "https://amplify.oldrocknft.com",
      icon: <ImageIcon className="w-4 h-4" />,
      category: "DeFi",
    },
    {
      id: "goliath-mint",
      type: "app",
      title: "Goliath Mint",
      description: "Mint new Goliath NFTs from the collection",
      url: "https://mint.oldrocknft.com",
      icon: <ImageIcon className="w-4 h-4" />,
      category: "NFTs",
    },
    {
      id: "profile",
      type: "feature",
      title: "User Profiles",
      description: "View NFT collections, achievements, and set profile pictures",
      url: "/profile",
      icon: <ImageIcon className="w-4 h-4" />,
      category: "Profile",
    },
  ]

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

    try {
      const mockResults: SearchResult[] = [];
      const queryTrimmedNumber = +(query
        .replace(/old rock/i, '')
        .replace(/oldrock/i, '')  
        .replace(/goliath/i, '')
        .trim()
      );

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 300))

      // Append results for Old Rock NFT assets
      if (queryTrimmedNumber && queryTrimmedNumber > 0 && queryTrimmedNumber <= 5000) {
        // Push exact matches to top
        if (queryTrimmedNumber <= 500) {
          mockResults.push({
            id: `old-rock-${queryTrimmedNumber}`,
            type: "nft",
            name: `Old Rock #${queryTrimmedNumber}`,
            image: "/placeholder.svg?height=100&width=100",
            collection: "Old Rock",
          });
        }

        if (queryTrimmedNumber <= 5000) {
          mockResults.push({
            id: `goliath-${queryTrimmedNumber}`,
            type: "nft",
            name: `Goliath #${queryTrimmedNumber}`,
            image: "/placeholder.svg?height=100&width=100",
            collection: "Goliath",
          });
        }

        // Only "search" related NFT numbers for double digit integers to prevent long list
        if (queryTrimmedNumber >= 10) {
          const goliathMatches = numbersContaining(queryTrimmedNumber, 5000);
          const oldRockMatches = numbersContaining(queryTrimmedNumber, 500);

          oldRockMatches.forEach((match) => {
            mockResults.push({
              id: `old-rock-${+match}`,
              type: "nft",
              name: `Old Rock #${match}`,
              image: "/placeholder.svg?height=100&width=100",
              collection: "Old Rock",
            });
          });

          goliathMatches.forEach((match) => {
            mockResults.push({
              id: `goliath-${+match}`,
              type: "nft",
              name: `Goliath #${match}`,
              image: "/placeholder.svg?height=100&width=100",
              collection: "Goliath",
            });
          });
        }
      }

      // Filter results based on query
      /*
      const filteredResults = mockResults.filter(
        (result) =>
          result.name.toLowerCase().includes(query.toLowerCase()) ||
          (result.collection && result.collection.toLowerCase().includes(query.toLowerCase())) ||
          (result.address && result.address.toLowerCase().includes(query.toLowerCase())),
      )*/

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
      router.push(`/profile/${result.address}`)
    } else if (result.type === "nft") {
      router.push(`/collections/${result.collection?.toLowerCase()}/${result.id}`)
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
        onClick={() => setIsSearchOpen(true)}
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
                                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-800 flex-shrink-0">
                                  <NextImage
                                    src={result.image || "/placeholder.svg"}
                                    alt={result.name}
                                    width={40}
                                    height={40}
                                    className="object-cover"
                                  />
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
                                  <NextImage
                                    src={result.image || "/placeholder.svg"}
                                    alt={result.name}
                                    width={40}
                                    height={40}
                                    className="object-cover"
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
