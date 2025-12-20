"use client"

import type React from "react"
import "./globals.css"
import { usePathname } from "next/navigation"
import { AudioProvider } from "@/contexts/audio-context"

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  return (
    <html lang="en" style={{ overscrollBehavior: 'none' }}>
      <body style={{ overscrollBehavior: 'none' }}>
        <AudioProvider>{children}</AudioProvider>
      </body>
    </html>
  )
}