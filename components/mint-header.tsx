"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/lib/mint-wallet-context"

export default function MintHeader() {
    const { address, isConnected, connect, disconnect } = useWallet()
    const [mounted, setMounted] = useState(false)

    // Handle hydration mismatch
    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    const displayAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Not connected"

    return (
        <header className="w-full py-4 px-6 flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center gap-2">
                <span className="font-bold text-xl" style={{ fontFamily: "var(--font-montserrat)" }}>
                    OLD ROCK
                </span>
            </div>

            {/* Wallet Connection */}
            {isConnected ? (
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    <span className="text-sm" style={{ fontFamily: "var(--font-pt-mono)" }}>
                        {displayAddress}
                    </span>
                </div>
            ) : (
                <Button
                    onClick={connect}
                    className="bg-white text-black hover:bg-gray-200"
                    style={{ fontFamily: "var(--font-pt-mono)", background: 'rgb(107 196 130)' }}
                >
                    Connect Wallet
                </Button>
            )}
        </header>
    )
}
