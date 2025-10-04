"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export interface Badge {
  id: number
  name: string
  description: string
  icon: string
  category: "DENSITY" | "GAMING" | "NFT_COLLECTING" | "COMMUNITY"
}

export interface ComicPage {
  id: string
  chapter: number
  page: number
  url: string
  filename: string
}

export interface User {
  id: string
  wallet_address: string
  ens_name?: string
  avatar_url?: string
  first_seen: string
  last_seen: string
}

export interface UserBadge {
  id: string
  user_id: string
  badge_id: number
  assigned_by: string
  assigned_at: string
  badge?: Badge
}

// Initialize database tables
export async function initializeAdminTables() {
  const supabase = createServerSupabaseClient()

  try {
    // Create badges table
    await supabase.rpc("create_badges_table", {})

    // Create comic_pages table
    await supabase.rpc("create_comic_pages_table", {})

    // Create users table
    await supabase.rpc("create_users_table", {})

    // Create user_badges table
    await supabase.rpc("create_user_badges_table", {})

    return { success: true }
  } catch (error) {
    console.error("Error initializing admin tables:", error)
    return { success: false, error }
  }
}

// User management actions
export async function getUsers() {
  const supabase = createServerSupabaseClient()

  try {
    const { data, error } = await supabase.from("users").select("*").order("last_seen", { ascending: false })

    if (error) throw error

    return { success: true, users: data || [] }
  } catch (error) {
    console.error("Error fetching users:", error)
    return { success: false, users: [], error }
  }
}

export async function trackUser(walletAddress: string, ensName?: string, avatarUrl?: string) {
  const supabase = createServerSupabaseClient()

  try {
    const { data, error } = await supabase
      .from("users")
      .upsert(
        {
          wallet_address: walletAddress.toLowerCase(),
          ens_name: ensName,
          avatar_url: avatarUrl,
          last_seen: new Date().toISOString(),
        },
        {
          onConflict: "wallet_address",
        },
      )
      .select()

    if (error) throw error

    return { success: true, user: data?.[0] }
  } catch (error) {
    console.error("Error tracking user:", error)
    return { success: false, error }
  }
}

export async function getUserBadges(walletAddress: string) {
  const supabase = createServerSupabaseClient()

  try {
    const { data, error } = await supabase
      .from("user_badges")
      .select(`
        *,
        badge:badges(*)
      `)
      .eq("wallet_address", walletAddress.toLowerCase())

    if (error) throw error

    return { success: true, userBadges: data || [] }
  } catch (error) {
    console.error("Error fetching user badges:", error)
    return { success: false, userBadges: [], error }
  }
}

export async function assignBadgeToUser(walletAddress: string, badgeId: number, assignedBy: string) {
  const supabase = createServerSupabaseClient()

  try {
    // Check if user already has this badge
    const { data: existingBadge } = await supabase
      .from("user_badges")
      .select("id")
      .eq("wallet_address", walletAddress.toLowerCase())
      .eq("badge_id", badgeId)
      .single()

    if (existingBadge) {
      return { success: false, error: "User already has this badge" }
    }

    const { data, error } = await supabase
      .from("user_badges")
      .insert([
        {
          wallet_address: walletAddress.toLowerCase(),
          badge_id: badgeId,
          assigned_by: assignedBy,
          assigned_at: new Date().toISOString(),
        },
      ])
      .select()

    if (error) throw error

    revalidatePath("/admin")
    return { success: true, userBadge: data?.[0] }
  } catch (error) {
    console.error("Error assigning badge to user:", error)
    return { success: false, error }
  }
}

export async function removeBadgeFromUser(walletAddress: string, badgeId: number) {
  const supabase = createServerSupabaseClient()

  try {
    const { error } = await supabase
      .from("user_badges")
      .delete()
      .eq("wallet_address", walletAddress.toLowerCase())
      .eq("badge_id", badgeId)

    if (error) throw error

    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    console.error("Error removing badge from user:", error)
    return { success: false, error }
  }
}

// Badge actions
export async function getBadges() {
  const supabase = createServerSupabaseClient()

  try {
    const { data, error } = await supabase.from("badges").select("*").order("category").order("id")

    if (error) throw error

    return { success: true, badges: data || [] }
  } catch (error) {
    console.error("Error fetching badges:", error)
    return { success: false, badges: [], error }
  }
}

export async function addBadge(badge: Omit<Badge, "id">) {
  const supabase = createServerSupabaseClient()

  try {
    const { data, error } = await supabase.from("badges").insert([badge]).select()

    if (error) throw error

    revalidatePath("/admin")
    return { success: true, badge: data?.[0] }
  } catch (error) {
    console.error("Error adding badge:", error)
    return { success: false, error }
  }
}

export async function updateBadge(badge: Badge) {
  const supabase = createServerSupabaseClient()

  try {
    const { error } = await supabase
      .from("badges")
      .update({
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        category: badge.category,
      })
      .eq("id", badge.id)

    if (error) throw error

    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    console.error("Error updating badge:", error)
    return { success: false, error }
  }
}

export async function deleteBadge(id: number) {
  const supabase = createServerSupabaseClient()

  try {
    // First remove all user assignments of this badge
    await supabase.from("user_badges").delete().eq("badge_id", id)

    // Then delete the badge
    const { error } = await supabase.from("badges").delete().eq("id", id)

    if (error) throw error

    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    console.error("Error deleting badge:", error)
    return { success: false, error }
  }
}

// Bulk badge operations
export async function assignMultipleBadges(walletAddress: string, badgeIds: number[], assignedBy: string) {
  const supabase = createServerSupabaseClient()

  try {
    const assignments = badgeIds.map((badgeId) => ({
      wallet_address: walletAddress.toLowerCase(),
      badge_id: badgeId,
      assigned_by: assignedBy,
      assigned_at: new Date().toISOString(),
    }))

    const { data, error } = await supabase
      .from("user_badges")
      .upsert(assignments, { onConflict: "wallet_address,badge_id" })
      .select()

    if (error) throw error

    revalidatePath("/admin")
    return { success: true, assignments: data }
  } catch (error) {
    console.error("Error assigning multiple badges:", error)
    return { success: false, error }
  }
}

export async function getUserStats(walletAddress: string) {
  const supabase = createServerSupabaseClient()

  try {
    // Get user badges count by category
    const { data: badgeStats, error: badgeError } = await supabase
      .from("user_badges")
      .select(`
        badge:badges(category)
      `)
      .eq("wallet_address", walletAddress.toLowerCase())

    if (badgeError) throw badgeError

    // Count badges by category
    const categoryStats = {
      DENSITY: 0,
      GAMING: 0,
      NFT_COLLECTING: 0,
      COMMUNITY: 0,
    }

    badgeStats?.forEach((userBadge: any) => {
      if (userBadge.badge?.category) {
        categoryStats[userBadge.badge.category as keyof typeof categoryStats]++
      }
    })

    return {
      success: true,
      stats: {
        totalBadges: badgeStats?.length || 0,
        categoryStats,
        lastSeen: new Date().toISOString(),
      },
    }
  } catch (error) {
    console.error("Error fetching user stats:", error)
    return { success: false, error }
  }
}

// Comic page actions (keeping existing functionality)
export async function getComicPages() {
  const supabase = createServerSupabaseClient()

  try {
    const { data, error } = await supabase.from("comic_pages").select("*").order("chapter").order("page")

    if (error) throw error

    const pagesWithUrls =
      data?.map((page) => ({
        ...page,
        url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/comic/${page.storage_path}`,
      })) || []

    return { success: true, pages: pagesWithUrls }
  } catch (error) {
    console.error("Error fetching comic pages:", error)
    return { success: false, pages: [], error }
  }
}

export async function uploadComicPage(chapter: number, page: number, file: File) {
  const supabase = createServerSupabaseClient()

  try {
    const { data: bucketData, error: bucketError } = await supabase.storage.createBucket("comic", {
      public: true,
      fileSizeLimit: 10485760,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    })

    if (bucketError && !bucketError.message.includes("already exists")) {
      throw bucketError
    }

    const filename = `chapter${chapter}_page${page}_${Date.now()}.${file.name.split(".").pop()}`
    const storagePath = `chapter${chapter}/${filename}`

    const { error: uploadError } = await supabase.storage.from("comic").upload(storagePath, file)

    if (uploadError) throw uploadError

    const { error: dbError } = await supabase.from("comic_pages").insert([
      {
        chapter,
        page,
        filename,
        storage_path: storagePath,
      },
    ])

    if (dbError) throw dbError

    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    console.error("Error uploading comic page:", error)
    return { success: false, error }
  }
}

export async function deleteComicPage(id: string) {
  const supabase = createServerSupabaseClient()

  try {
    const { data, error: fetchError } = await supabase.from("comic_pages").select("storage_path").eq("id", id).single()

    if (fetchError) throw fetchError

    if (data?.storage_path) {
      const { error: storageError } = await supabase.storage.from("comic").remove([data.storage_path])

      if (storageError) throw storageError
    }

    const { error: dbError } = await supabase.from("comic_pages").delete().eq("id", id)

    if (dbError) throw dbError

    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    console.error("Error deleting comic page:", error)
    return { success: false, error }
  }
}
