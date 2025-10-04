"use client"

import type React from "react"
import "./globals.css"
import { usePathname } from "next/navigation"

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
