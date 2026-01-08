"use client"

import { Header } from "@/components/header"
import { CyberpunkBackground } from "@/components/cyberpunk-background"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer"
import MintSection from "@/components/mint-section"
import CollectionGallery from "@/components/collection-gallery"
import { useState, useEffect } from "react"

export default function MintPage() {
    const [isWalletConnected, setIsWalletConnected] = useState(false)
    const [userProfile, setUserProfile] = useState<any>(null)

    // Check wallet connection status
    useEffect(() => {
        const checkWalletConnection = async () => {
            if (typeof window !== "undefined" && window.ethereum) {
                try {
                    const accounts = await window.ethereum.request({ method: "eth_accounts" })
                    if (accounts.length > 0) {
                        setIsWalletConnected(true)
                        setUserProfile({
                            name: "OldRock User",
                            avatar: "/images/rock-logo.png",
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

    return (
        <div className="flex">
            <Sidebar isWalletConnected={isWalletConnected} userProfile={userProfile} />
            <div className="min-h-screen text-white overflow-hidden relative w-full lg:ml-[79px]">
                <CyberpunkBackground />
                <Header />

                <main className="relative z-20 pt-32 pb-20">
                    <div className="w-full px-6 md:px-10 lg:px-12 max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                            {/* Collection Gallery - Takes up 2/3 of the space on desktop */}
                            <div className="lg:col-span-2">
                                <CollectionGallery />
                            </div>

                            {/* Mint Section - Takes up 1/3 of the space on desktop */}
                            <div className="lg:col-span-1">
                                <MintSection />
                            </div>
                        </div>
                    </div>
                </main>

                <Footer />
            </div>
        </div>
    )
}
