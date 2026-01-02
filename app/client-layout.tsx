"use client"

import type React from "react"
import { useEffect } from "react"
import "./globals.css"
import { usePathname } from "next/navigation"
import { AudioProvider } from "@/contexts/audio-context"

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()

  // Suppress harmless wallet extension errors globally
  useEffect(() => {
    if (typeof window === "undefined") return

    // Suppress console errors from wallet extensions
    const originalError = console.error
    console.error = (...args: any[]) => {
      const message = args[0]?.toString() || ""
      // Filter out wallet extension errors about window.ethereum
      // These are harmless and occur when multiple wallet extensions try to set the same property
      if (
        message.includes("Cannot set property ethereum") ||
        message.includes("Cannot redefine property: ethereum") ||
        message.includes("MetaMask encountered an error setting the global Ethereum provider") ||
        message.includes("which has only a getter")
      ) {
        // Suppress these errors - they're harmless and come from wallet extensions
        return
      }
      originalError.apply(console, args)
    }

    // Suppress uncaught errors from wallet extensions
    const handleError = (event: ErrorEvent) => {
      const message = event.message || ""
      if (
        message.includes("Cannot set property ethereum") ||
        message.includes("Cannot redefine property: ethereum") ||
        message.includes("MetaMask encountered an error") ||
        message.includes("which has only a getter")
      ) {
        event.preventDefault()
        return false
      }
    }

    window.addEventListener("error", handleError)

    return () => {
      console.error = originalError
      window.removeEventListener("error", handleError)
    }
  }, [])

  return (
    <html lang="en" style={{ overscrollBehavior: 'none' }}>
      <body style={{ overscrollBehavior: 'none' }}>
        <AudioProvider>{children}</AudioProvider>
      </body>
    </html>
  )
}