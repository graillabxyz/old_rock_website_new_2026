import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST() {
  const supabase = createServerSupabaseClient()

  try {
    // Create badges table
    await supabase.rpc("execute_sql", {
      sql_query: `
        CREATE TABLE IF NOT EXISTS badges (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          icon VARCHAR(10),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Insert default badges if table is empty
        INSERT INTO badges (name, description, icon)
        SELECT 'Pioneer', 'Early adopter', '🚀'
        WHERE NOT EXISTS (SELECT 1 FROM badges LIMIT 1)
        UNION ALL
        SELECT 'Collector', 'NFT collector', '💎'
        WHERE NOT EXISTS (SELECT 1 FROM badges LIMIT 1)
        UNION ALL
        SELECT 'Warrior', 'Battle tested', '⚔️'
        WHERE NOT EXISTS (SELECT 1 FROM badges LIMIT 1)
        UNION ALL
        SELECT 'Explorer', 'World explorer', '🗺️'
        WHERE NOT EXISTS (SELECT 1 FROM badges LIMIT 1)
        UNION ALL
        SELECT 'Legend', 'Legendary status', '👑'
        WHERE NOT EXISTS (SELECT 1 FROM badges LIMIT 1);
      `,
    })

    // Create comic_pages table
    await supabase.rpc("execute_sql", {
      sql_query: `
        CREATE TABLE IF NOT EXISTS comic_pages (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          chapter INTEGER NOT NULL,
          page INTEGER NOT NULL,
          filename VARCHAR(255) NOT NULL,
          storage_path TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(chapter, page)
        );
      `,
    })

    // Create storage bucket for comic pages
    const { data: bucketData, error: bucketError } = await supabase.storage.createBucket("comic", {
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    })

    if (bucketError && !bucketError.message.includes("already exists")) {
      throw bucketError
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error setting up Supabase:", error)
    return NextResponse.json({ success: false, error }, { status: 500 })
  }
}
