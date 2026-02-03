"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { Header } from "@/components/header"
import { CyberpunkBackground } from "@/components/cyberpunk-background"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import {
  Shield,
  Plus,
  Trash2,
  Upload,
  X,
  Edit,
  Save,
  FileImage,
  AlertCircle,
  Users,
  Award,
  Search,
  UserCheck,
} from "lucide-react"
import Image from "next/image"
import {
  getBadges,
  addBadge,
  updateBadge,
  deleteBadge,
  getComicPages,
  uploadComicPage,
  deleteComicPage,
  getUsers,
  getUserBadges,
  assignBadgeToUser,
  removeBadgeFromUser,
  assignMultipleBadges,
  getUserStats,
  type Badge,
  type ComicPage,
  type User,
  type UserBadge,
} from "../actions/admin-actions"

const ADMIN_ADDRESS = "0xb6585310D9546C6dFc5C1dcfA5eF92919f96D194"

export default function AdminPage() {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [badges, setBadges] = useState<Badge[]>([])
  const [comicPages, setComicPages] = useState<ComicPage[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [userBadges, setUserBadges] = useState<UserBadge[]>([])
  const [userStats, setUserStats] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<"users" | "badges" | "comics">("users")
  const [selectedChapter, setSelectedChapter] = useState(1)
  const [editingBadge, setEditingBadge] = useState<Badge | null>(null)
  const [newBadge, setNewBadge] = useState({
    name: "",
    description: "",
    icon: "",
    category: "COMMUNITY" as "DENSITY" | "GAMING" | "NFT_COLLECTING" | "COMMUNITY",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBadgeCategory, setSelectedBadgeCategory] = useState<string>("ALL")
  const [selectedBadges, setSelectedBadges] = useState<number[]>([])
  const [isAssigningBadges, setIsAssigningBadges] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Check wallet connection and authorization
  useEffect(() => {
    const checkAuth = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" })
          if (accounts.length > 0) {
            setIsWalletConnected(true)
            setUserProfile({
              name: "Admin User",
              avatar: "/images/rock-logo.png",
              address: accounts[0],
            })

            if (accounts[0].toLowerCase() === ADMIN_ADDRESS.toLowerCase()) {
              setIsAuthorized(true)
            }
          }
        } catch (error) {
          console.error("Error checking wallet connection:", error)
        }
      }
      setIsLoading(false)
    }

    checkAuth()
    loadData()
  }, [])

  // Filter users based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredUsers(users)
    } else {
      const filtered = users.filter(
        (user) =>
          user.wallet_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.ens_name?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredUsers(filtered)
    }
  }, [users, searchTerm])

  const loadData = async () => {
    try {
      const [badgesResult, pagesResult, usersResult] = await Promise.all([getBadges(), getComicPages(), getUsers()])

      if (badgesResult.success) {
        setBadges(badgesResult.badges)
      }

      if (pagesResult.success) {
        setComicPages(pagesResult.pages)
      }

      if (usersResult.success) {
        setUsers(usersResult.users)
        setFilteredUsers(usersResult.users)
      }
    } catch (err) {
      console.error("Error loading data:", err)
      setError("Failed to load data. Please try again.")
    }
  }

  const loadUserBadges = async (user: User) => {
    try {
      const [badgesResult, statsResult] = await Promise.all([
        getUserBadges(user.wallet_address),
        getUserStats(user.wallet_address),
      ])

      if (badgesResult.success) {
        setUserBadges(badgesResult.userBadges)
      }

      if (statsResult.success) {
        setUserStats(statsResult.stats)
      }
    } catch (err) {
      console.error("Error loading user badges:", err)
    }
  }

  const handleUserSelect = (user: User) => {
    setSelectedUser(user)
    setSelectedBadges([])
    loadUserBadges(user)
  }

  const handleAssignBadge = async (badgeId: number) => {
    if (!selectedUser || !userProfile?.address) return

    try {
      const result = await assignBadgeToUser(selectedUser.wallet_address, badgeId, userProfile.address)
      if (result.success) {
        setSuccess("Badge assigned successfully!")
        loadUserBadges(selectedUser)
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(result.error || "Failed to assign badge")
        setTimeout(() => setError(null), 3000)
      }
    } catch (err) {
      console.error("Error assigning badge:", err)
      setError("Failed to assign badge")
      setTimeout(() => setError(null), 3000)
    }
  }

  const handleRemoveBadge = async (badgeId: number) => {
    if (!selectedUser) return

    try {
      const result = await removeBadgeFromUser(selectedUser.wallet_address, badgeId, userProfile?.address)
      if (result.success) {
        setSuccess("Badge removed successfully!")
        loadUserBadges(selectedUser)
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError("Failed to remove badge")
        setTimeout(() => setError(null), 3000)
      }
    } catch (err) {
      console.error("Error removing badge:", err)
      setError("Failed to remove badge")
      setTimeout(() => setError(null), 3000)
    }
  }

  const handleBulkAssignBadges = async () => {
    if (!selectedUser || !userProfile?.address || selectedBadges.length === 0) return

    setIsAssigningBadges(true)
    try {
      const result = await assignMultipleBadges(selectedUser.wallet_address, selectedBadges, userProfile.address)
      if (result.success) {
        setSuccess(`${selectedBadges.length} badges assigned successfully!`)
        setSelectedBadges([])
        loadUserBadges(selectedUser)
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError("Failed to assign badges")
        setTimeout(() => setError(null), 3000)
      }
    } catch (err) {
      console.error("Error assigning badges:", err)
      setError("Failed to assign badges")
      setTimeout(() => setError(null), 3000)
    } finally {
      setIsAssigningBadges(false)
    }
  }

  const toggleBadgeSelection = (badgeId: number) => {
    setSelectedBadges((prev) => (prev.includes(badgeId) ? prev.filter((id) => id !== badgeId) : [...prev, badgeId]))
  }

  // Badge management functions
  const handleAddBadge = async () => {
    if (newBadge.name && newBadge.description && newBadge.icon) {
      try {
        const result = await addBadge(newBadge, userProfile?.address)
        if (result.success) {
          setBadges([...badges, result.badge as Badge])
          setNewBadge({ name: "", description: "", icon: "", category: "COMMUNITY" })
          setSuccess("Badge created successfully!")
          setTimeout(() => setSuccess(null), 3000)
        } else {
          setError("Failed to add badge")
          setTimeout(() => setError(null), 3000)
        }
      } catch (err) {
        console.error("Error adding badge:", err)
        setError("Failed to add badge")
        setTimeout(() => setError(null), 3000)
      }
    }
  }

  const handleEditBadge = (badge: Badge) => {
    setEditingBadge({ ...badge })
  }

  const handleSaveBadge = async () => {
    if (editingBadge) {
      try {
        const result = await updateBadge(editingBadge, userProfile?.address)
        if (result.success) {
          setBadges(badges.map((b) => (b.id === editingBadge.id ? editingBadge : b)))
          setEditingBadge(null)
          setSuccess("Badge updated successfully!")
          setTimeout(() => setSuccess(null), 3000)
        } else {
          setError("Failed to update badge")
          setTimeout(() => setError(null), 3000)
        }
      } catch (err) {
        console.error("Error updating badge:", err)
        setError("Failed to update badge")
        setTimeout(() => setError(null), 3000)
      }
    }
  }

  const handleDeleteBadge = async (id: number) => {
    if (!confirm("Are you sure you want to delete this badge? This will remove it from all users.")) return

    try {
      const result = await deleteBadge(id, userProfile?.address)
      if (result.success) {
        setBadges(badges.filter((b) => b.id !== id))
        setSuccess("Badge deleted successfully!")
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError("Failed to delete badge")
        setTimeout(() => setError(null), 3000)
      }
    } catch (err) {
      console.error("Error deleting badge:", err)
      setError("Failed to delete badge")
      setTimeout(() => setError(null), 3000)
    }
  }

  // Comic management functions
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const existingPages = comicPages.filter((p) => p.chapter === selectedChapter)
      const nextPageNumber = existingPages.length > 0 ? Math.max(...existingPages.map((p) => p.page)) + 1 : 1

      const result = await uploadComicPage(selectedChapter, nextPageNumber, file)
      if (result.success) {
        const pagesResult = await getComicPages()
        if (pagesResult.success) {
          setComicPages(pagesResult.pages)
        }
        setSuccess("Comic page uploaded successfully!")
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError("Failed to upload comic page")
        setTimeout(() => setError(null), 3000)
      }
    } catch (err) {
      console.error("Error uploading comic page:", err)
      setError("Failed to upload comic page")
      setTimeout(() => setError(null), 3000)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleDeletePage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this comic page?")) return

    try {
      const result = await deleteComicPage(id)
      if (result.success) {
        setComicPages(comicPages.filter((p) => p.id !== id))
        setSuccess("Comic page deleted successfully!")
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError("Failed to delete comic page")
        setTimeout(() => setError(null), 3000)
      }
    } catch (err) {
      console.error("Error deleting comic page:", err)
      setError("Failed to delete comic page")
      setTimeout(() => setError(null), 3000)
    }
  }

  const clearMessages = useCallback(() => {
    setError(null)
    setSuccess(null)
  }, [])

  const getFilteredBadges = () => {
    if (selectedBadgeCategory === "ALL") return badges
    return badges.filter((badge) => badge.category === selectedBadgeCategory)
  }

  const getAvailableBadges = () => {
    const userBadgeIds = userBadges.map((ub) => ub.badge_id)
    return getFilteredBadges().filter((badge) => !userBadgeIds.includes(badge.id))
  }

  if (isLoading) {
    return (
      <div className="flex">
        <Sidebar isWalletConnected={isWalletConnected} userProfile={userProfile} />
        <div className="min-h-screen text-white overflow-hidden relative w-full lg:ml-[79px]">
          <CyberpunkBackground />
          <Header />
          <div className="flex items-center justify-center min-h-[80vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-gray-400 font-pt-mono">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isWalletConnected || !isAuthorized) {
    return (
      <div className="flex">
        <Sidebar isWalletConnected={isWalletConnected} userProfile={userProfile} />
        <div className="min-h-screen text-white overflow-hidden relative w-full lg:ml-[79px]">
          <CyberpunkBackground />
          <Header />
          <div className="flex items-center justify-center min-h-[80vh]">
            <motion.div
              className="text-center max-w-md mx-auto p-8 bg-red-900/20 border border-red-500/30 rounded-2xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-black font-montserrat text-white mb-4">ACCESS DENIED</h2>
              <p className="text-gray-400 font-pt-mono text-sm">
                {!isWalletConnected
                  ? "Please connect your wallet to access the admin panel."
                  : "You are not authorized to access this admin panel."}
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex">
      <Sidebar isWalletConnected={isWalletConnected} userProfile={userProfile} />
      <div className="min-h-screen text-white overflow-hidden relative w-full lg:ml-[79px]">
        <CyberpunkBackground />
        <Header />

        <div className="relative z-20 py-20 px-6">
          <div className="max-w-7xl mx-auto">
            {/* Messages */}
            {(error || success) && (
              <motion.div
                className={`${error ? "bg-red-900/50 border-red-500" : "bg-green-900/50 border-green-500"} border rounded-lg p-4 mb-6 flex items-center justify-between`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center">
                  <AlertCircle className={`w-5 h-5 ${error ? "text-red-400" : "text-green-400"} mr-2`} />
                  <p className={`${error ? "text-red-200" : "text-green-200"} font-pt-mono text-sm`}>
                    {error || success}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={clearMessages}>
                  <X className="w-4 h-4" />
                </Button>
              </motion.div>
            )}

            {/* Header */}
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-5xl font-black font-montserrat text-white mb-4">ADMIN PANEL</h1>
              <p className="text-purple-400 font-pt-mono text-lg">Manage users, badges, and content</p>
            </motion.div>

            {/* Tab Navigation */}
            <div className="flex justify-center mb-8">
              <div className="bg-gray-900/50 border border-purple-500/30 rounded-2xl p-2 flex space-x-2">
                <button
                  onClick={() => setActiveTab("users")}
                  className={`px-6 py-3 rounded-xl font-pt-mono text-sm transition-all ${activeTab === "users"
                      ? "bg-purple-600 text-white"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                    }`}
                >
                  <Users className="w-4 h-4 inline mr-2" />
                  Users ({users.length})
                </button>
                <button
                  onClick={() => setActiveTab("badges")}
                  className={`px-6 py-3 rounded-xl font-pt-mono text-sm transition-all ${activeTab === "badges"
                      ? "bg-purple-600 text-white"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                    }`}
                >
                  <Award className="w-4 h-4 inline mr-2" />
                  Badges ({badges.length})
                </button>
                <button
                  onClick={() => setActiveTab("comics")}
                  className={`px-6 py-3 rounded-xl font-pt-mono text-sm transition-all ${activeTab === "comics"
                      ? "bg-purple-600 text-white"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                    }`}
                >
                  <FileImage className="w-4 h-4 inline mr-2" />
                  Comics ({comicPages.length})
                </button>
              </div>
            </div>

            {/* User Management Tab */}
            {activeTab === "users" && (
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                <div className="grid lg:grid-cols-3 gap-8">
                  {/* Users List */}
                  <div className="lg:col-span-1">
                    <div className="bg-gray-900/50 border border-purple-500/30 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold font-montserrat text-white">Connected Users</h3>
                        <span className="text-purple-400 font-pt-mono text-sm">{filteredUsers.length}</span>
                      </div>

                      {/* Search */}
                      <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Search users..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 bg-gray-800 border-gray-700 text-white"
                        />
                      </div>

                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {filteredUsers.map((user) => (
                          <div
                            key={user.id}
                            onClick={() => handleUserSelect(user)}
                            className={`p-4 rounded-xl cursor-pointer transition-all ${selectedUser?.id === user.id
                                ? "bg-purple-600/30 border border-purple-500"
                                : "bg-gray-800 hover:bg-gray-700"
                              }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-sm">
                                  {user.ens_name ? user.ens_name[0].toUpperCase() : user.wallet_address.slice(2, 4)}
                                </span>
                              </div>
                              <div className="flex-1">
                                <div className="text-white font-bold text-sm">
                                  {user.ens_name ||
                                    `${user.wallet_address.slice(0, 6)}...${user.wallet_address.slice(-4)}`}
                                </div>
                                <div className="text-gray-400 text-xs">
                                  Last seen: {new Date(user.last_seen).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* User Details & Badge Management */}
                  <div className="lg:col-span-2">
                    {selectedUser ? (
                      <div className="space-y-6">
                        {/* User Info */}
                        <div className="bg-gray-900/50 border border-purple-500/30 rounded-2xl p-6">
                          <div className="flex items-center space-x-4 mb-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-lg">
                                {selectedUser.ens_name
                                  ? selectedUser.ens_name[0].toUpperCase()
                                  : selectedUser.wallet_address.slice(2, 4)}
                              </span>
                            </div>
                            <div>
                              <h3 className="text-xl font-bold font-montserrat text-white">
                                {selectedUser.ens_name ||
                                  `${selectedUser.wallet_address.slice(0, 6)}...${selectedUser.wallet_address.slice(-4)}`}
                              </h3>
                              <p className="text-gray-400 font-pt-mono text-sm">{selectedUser.wallet_address}</p>
                              <p className="text-gray-500 font-pt-mono text-xs">
                                Joined: {new Date(selectedUser.first_seen).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          {/* User Stats */}
                          {userStats && (
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                              <div className="text-center">
                                <div className="text-2xl font-black font-montserrat text-white">
                                  {userStats.totalBadges}
                                </div>
                                <div className="text-xs font-pt-mono text-gray-400">Total Badges</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-black font-montserrat text-purple-400">
                                  {userStats.categoryStats.DENSITY}
                                </div>
                                <div className="text-xs font-pt-mono text-gray-400">Density</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-black font-montserrat text-green-400">
                                  {userStats.categoryStats.GAMING}
                                </div>
                                <div className="text-xs font-pt-mono text-gray-400">Gaming</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-black font-montserrat text-blue-400">
                                  {userStats.categoryStats.NFT_COLLECTING}
                                </div>
                                <div className="text-xs font-pt-mono text-gray-400">NFT</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-black font-montserrat text-yellow-400">
                                  {userStats.categoryStats.COMMUNITY}
                                </div>
                                <div className="text-xs font-pt-mono text-gray-400">Community</div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Current Badges */}
                        <div className="bg-gray-900/50 border border-purple-500/30 rounded-2xl p-6">
                          <h4 className="text-white font-bold mb-4">Current Badges ({userBadges.length})</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {userBadges.map((userBadge) => (
                              <div
                                key={userBadge.id}
                                className="bg-green-600/20 border border-green-500 rounded-lg p-3 text-center relative group"
                              >
                                <div className="text-2xl mb-2">{userBadge.badge?.icon}</div>
                                <div className="text-white text-xs font-bold">{userBadge.badge?.name}</div>
                                <div className="text-gray-400 text-xs">{userBadge.badge?.category}</div>
                                <button
                                  onClick={() => handleRemoveBadge(userBadge.badge_id)}
                                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 hover:bg-red-700 rounded-full w-5 h-5 flex items-center justify-center"
                                >
                                  <X className="w-3 h-3 text-white" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Badge Assignment */}
                        <div className="bg-gray-900/50 border border-purple-500/30 rounded-2xl p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-white font-bold">Assign Badges</h4>
                            <div className="flex items-center gap-3">
                              <select
                                value={selectedBadgeCategory}
                                onChange={(e) => setSelectedBadgeCategory(e.target.value)}
                                className="bg-gray-800 border border-gray-700 text-white rounded px-3 py-1 text-sm"
                              >
                                <option value="ALL">All Categories</option>
                                <option value="DENSITY">Density</option>
                                <option value="GAMING">Gaming</option>
                                <option value="NFT_COLLECTING">NFT Collecting</option>
                                <option value="COMMUNITY">Community</option>
                              </select>
                              {selectedBadges.length > 0 && (
                                <Button
                                  onClick={handleBulkAssignBadges}
                                  disabled={isAssigningBadges}
                                  className="bg-purple-600 hover:bg-purple-700"
                                >
                                  {isAssigningBadges ? "Assigning..." : `Assign ${selectedBadges.length} Badges`}
                                </Button>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-64 overflow-y-auto">
                            {getAvailableBadges().map((badge) => (
                              <div
                                key={badge.id}
                                className={`border rounded-lg p-3 text-center cursor-pointer transition-all ${selectedBadges.includes(badge.id)
                                    ? "bg-purple-600/30 border-purple-500"
                                    : "bg-gray-800 hover:bg-gray-700 border-gray-600"
                                  }`}
                                onClick={() => toggleBadgeSelection(badge.id)}
                              >
                                <div className="text-2xl mb-2">{badge.icon}</div>
                                <div className="text-white text-xs font-bold">{badge.name}</div>
                                <div className="text-gray-400 text-xs">{badge.category}</div>
                                {selectedBadges.includes(badge.id) && (
                                  <div className="absolute top-1 right-1 bg-purple-600 rounded-full w-5 h-5 flex items-center justify-center">
                                    <UserCheck className="w-3 h-3 text-white" />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-900/50 border border-purple-500/30 rounded-2xl p-12 text-center">
                        <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Select a User</h3>
                        <p className="text-gray-400 font-pt-mono">Choose a user from the list to manage their badges</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Badge Management Tab */}
            {activeTab === "badges" && (
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                <h2 className="text-3xl font-black font-montserrat text-white mb-8">Badge Management</h2>

                {/* Add New Badge */}
                <div className="bg-gray-900/50 border border-purple-500/30 rounded-2xl p-6 mb-8">
                  <h3 className="text-xl font-bold font-montserrat text-white mb-4">Create New Badge</h3>
                  <div className="grid md:grid-cols-5 gap-4">
                    <Input
                      placeholder="Badge Name"
                      value={newBadge.name}
                      onChange={(e) => setNewBadge({ ...newBadge, name: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                    <Input
                      placeholder="Description"
                      value={newBadge.description}
                      onChange={(e) => setNewBadge({ ...newBadge, description: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                    <Input
                      placeholder="Icon (emoji)"
                      value={newBadge.icon}
                      onChange={(e) => setNewBadge({ ...newBadge, icon: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                    <select
                      value={newBadge.category}
                      onChange={(e) => setNewBadge({ ...newBadge, category: e.target.value as any })}
                      className="bg-gray-800 border border-gray-700 text-white rounded px-3 py-2"
                    >
                      <option value="COMMUNITY">Community</option>
                      <option value="DENSITY">Density</option>
                      <option value="GAMING">Gaming</option>
                      <option value="NFT_COLLECTING">NFT Collecting</option>
                    </select>
                    <Button onClick={handleAddBadge} className="bg-purple-600 hover:bg-purple-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Badge
                    </Button>
                  </div>
                </div>

                {/* Badges Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {badges.map((badge) => (
                    <div key={badge.id} className="bg-gray-900/50 border border-gray-700 rounded-2xl p-6">
                      {editingBadge?.id === badge.id ? (
                        <div className="space-y-4">
                          <Input
                            value={editingBadge.name}
                            onChange={(e) => setEditingBadge({ ...editingBadge, name: e.target.value })}
                            className="bg-gray-800 border-gray-700 text-white"
                          />
                          <Input
                            value={editingBadge.description}
                            onChange={(e) => setEditingBadge({ ...editingBadge, description: e.target.value })}
                            className="bg-gray-800 border-gray-700 text-white"
                          />
                          <Input
                            value={editingBadge.icon}
                            onChange={(e) => setEditingBadge({ ...editingBadge, icon: e.target.value })}
                            className="bg-gray-800 border-gray-700 text-white"
                          />
                          <select
                            value={editingBadge.category}
                            onChange={(e) => setEditingBadge({ ...editingBadge, category: e.target.value as any })}
                            className="w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2"
                          >
                            <option value="COMMUNITY">Community</option>
                            <option value="DENSITY">Density</option>
                            <option value="GAMING">Gaming</option>
                            <option value="NFT_COLLECTING">NFT Collecting</option>
                          </select>
                          <div className="flex gap-2">
                            <Button onClick={handleSaveBadge} size="sm" className="bg-green-600 hover:bg-green-700">
                              <Save className="w-4 h-4" />
                            </Button>
                            <Button onClick={() => setEditingBadge(null)} size="sm" variant="outline">
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <div className="text-3xl">{badge.icon}</div>
                            <div className="flex gap-2">
                              <Button onClick={() => handleEditBadge(badge)} size="sm" variant="outline">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button onClick={() => handleDeleteBadge(badge.id)} size="sm" variant="destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <h4 className="font-bold text-white mb-2">{badge.name}</h4>
                          <p className="text-gray-400 text-sm mb-2">{badge.description}</p>
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs font-pt-mono ${badge.category === "DENSITY"
                                ? "bg-purple-600/20 text-purple-400"
                                : badge.category === "GAMING"
                                  ? "bg-green-600/20 text-green-400"
                                  : badge.category === "NFT_COLLECTING"
                                    ? "bg-blue-600/20 text-blue-400"
                                    : "bg-yellow-600/20 text-yellow-400"
                              }`}
                          >
                            {badge.category}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Comic Management Tab */}
            {activeTab === "comics" && (
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                <h2 className="text-3xl font-black font-montserrat text-white mb-8">Comic Management</h2>

                {/* Chapter Selection and Upload */}
                <div className="bg-gray-900/50 border border-purple-500/30 rounded-2xl p-6 mb-8">
                  <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1">
                      <label className="block text-white font-pt-mono text-sm mb-2">Chapter</label>
                      <select
                        value={selectedChapter}
                        onChange={(e) => setSelectedChapter(Number(e.target.value))}
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2"
                      >
                        {[1, 2, 3, 4, 5].map((chapter) => (
                          <option key={chapter} value={chapter}>
                            Chapter {chapter}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-white font-pt-mono text-sm mb-2">Upload Page</label>
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="file-upload"
                          ref={fileInputRef}
                          disabled={isUploading}
                        />
                        <label
                          htmlFor="file-upload"
                          className={`flex items-center justify-center w-full ${isUploading
                              ? "bg-gray-700 cursor-not-allowed"
                              : "bg-purple-600 hover:bg-purple-700 cursor-pointer"
                            } text-white rounded-lg px-4 py-2 transition-colors`}
                        >
                          {isUploading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 mr-2" />
                              Upload Page
                            </>
                          )}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comic Pages Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {comicPages
                    .filter((page) => page.chapter === selectedChapter)
                    .sort((a, b) => a.page - b.page)
                    .map((page) => (
                      <div key={page.id} className="bg-gray-900/50 border border-gray-700 rounded-2xl overflow-hidden">
                        <div className="relative aspect-[3/4] bg-gray-800">
                          <Image
                            src={page.url || "/placeholder.svg"}
                            alt={`Chapter ${page.chapter} Page ${page.page}`}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute top-2 right-2">
                            <Button
                              onClick={() => handleDeletePage(page.id)}
                              size="sm"
                              variant="destructive"
                              className="bg-red-600/80 hover:bg-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="p-4">
                          <h4 className="font-bold text-white mb-1">Page {page.page}</h4>
                          <p className="text-gray-400 text-sm font-pt-mono">{page.filename}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        <Footer />
      </div>
    </div>
  )
}
