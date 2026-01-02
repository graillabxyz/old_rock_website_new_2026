"use client"

import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { NFTCollectionsSection } from "@/components/nft-collections-section"
import { DensitySection } from "@/components/density-section"
import { DensitySwapSection } from "@/components/density-swap-section"
import { Footer } from "@/components/footer"
import { CyberpunkBackground } from "@/components/cyberpunk-background"
import { useParallax } from "@/hooks/use-parallax"
import { Sidebar } from "@/components/sidebar"
import { useState, useEffect } from "react"

export default function OldRockSite() {
  const { containerRef, backgroundY, textY } = useParallax()
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [userProfile, setUserProfile] = useState<{
    name: string
    avatar: string
    address: string
  } | null>(null)

  // Check wallet connection status
  useEffect(() => {
    const checkWalletConnection = async () => {
      // Check for legacy wallet connection first
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" })
          if (accounts.length > 0) {
            setIsWalletConnected(true)
            const avatarUrl = await fetchENSAvatar(accounts[0])
            setUserProfile({
              name: "OldRock User",
              avatar: avatarUrl,
              address: accounts[0],
            })
          }
        } catch (error) {
          console.error("Error checking wallet connection:", error)
        }
      }
    }

    checkWalletConnection()
  }, [])

  const fetchENSAvatar = async (address: string) => {
    try {
      const ensResponse = await fetch(`https://api.ensideas.com/ens/resolve/${address}`)
      if (ensResponse.ok) {
        const ensData = await ensResponse.json()
        if (ensData.name) {
          try {
            // Create timeout controller for 5 second timeout
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 5000)
            
            try {
              const avatarResponse = await fetch(`https://metadata.ens.domains/mainnet/avatar/${ensData.name}`, {
                // Don't throw on 404 - it's expected for ENS names without avatars
                signal: controller.signal,
              })
              clearTimeout(timeoutId)
              if (avatarResponse.ok && avatarResponse.status !== 404) {
                const avatarUrl = avatarResponse.url
                if (avatarUrl && !avatarUrl.includes("404")) {
                  return avatarUrl
                }
              }
            } catch (fetchError: any) {
              clearTimeout(timeoutId)
              // Silently handle 404s and timeouts - these are expected
              if (fetchError.name !== "AbortError" && fetchError.name !== "TypeError") {
                // Only log unexpected errors
              }
            }
          } catch (avatarError: any) {
            // Silently handle 404s and timeouts - these are expected
            if (avatarError.name !== "AbortError" && avatarError.name !== "TypeError") {
              // Only log unexpected errors
            }
          }
        }
      }
      return `https://effigy.im/a/${address}.png`
    } catch (error: any) {
      // Silently handle network errors - fallback to effigy
      if (error.name !== "AbortError" && error.name !== "TypeError") {
        // Only log unexpected errors
      }
      return `https://effigy.im/a/${address}.png`
    }
  }

  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const handleAccountsChanged = async (accounts: string[]) => {
        if (accounts.length === 0) {
          setIsWalletConnected(false)
          setUserProfile(null)
        } else {
          setIsWalletConnected(true)
          const avatarUrl = await fetchENSAvatar(accounts[0])
          setUserProfile({
            name: "OldRock User",
            avatar: avatarUrl,
            address: accounts[0],
          })
        }
      }

      window.ethereum.on("accountsChanged", handleAccountsChanged)

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
      }
    }
  }, [])

  return (
    <div className="flex">
      <Sidebar isWalletConnected={isWalletConnected} userProfile={userProfile} />
      <div ref={containerRef} className="min-h-screen flex flex-col text-white overflow-hidden relative w-full ml-0 md:ml-[79px]">
        <CyberpunkBackground />
        <Header />
        <HeroSection backgroundY={backgroundY} textY={textY} />
        <div className="px-[5%]">
          <NFTCollectionsSection />
          <DensitySection />
          <DensitySwapSection />
        </div>
        {/* Footer outside of px-[5%] to be full width */}
        <div className="w-full">
          <Footer />
        </div>
      </div>
    </div>
  )
}

