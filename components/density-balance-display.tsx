"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Wallet } from "lucide-react"
import { fetchUserDensity } from "@/app/actions/fetch-user-density"

interface DensityBalanceDisplayProps {
    onConnectWallet?: () => void
}

export function DensityBalanceDisplay({ onConnectWallet }: DensityBalanceDisplayProps) {
    const [isConnected, setIsConnected] = useState(false)
    const [walletAddress, setWalletAddress] = useState("")
    const [ecosystemBalance, setEcosystemBalance] = useState(0)
    const [unextractedBalance, setUnextractedBalance] = useState(0)
    const [isLoading, setIsLoading] = useState(false)

    // Check wallet connection on mount
    useEffect(() => {
        const checkConnection = async () => {
            if (typeof window !== "undefined" && window.ethereum) {
                try {
                    const accounts = await window.ethereum.request({ method: "eth_accounts" })
                    if (accounts.length > 0) {
                        setWalletAddress(accounts[0])
                        setIsConnected(true)
                        await fetchBalances(accounts[0])
                    }
                } catch (error) {
                    console.error("Error checking wallet connection:", error)
                }
            }
        }

        checkConnection()

        // Listen for wallet connection events
        const handleWalletConnected = async (event: CustomEvent) => {
            if (event.detail?.connected && event.detail?.address) {
                setWalletAddress(event.detail.address)
                setIsConnected(true)
                await fetchBalances(event.detail.address)
            }
        }

        const handleWalletDisconnected = () => {
            setIsConnected(false)
            setWalletAddress("")
            setEcosystemBalance(0)
            setUnextractedBalance(0)
        }

        window.addEventListener("walletConnected", handleWalletConnected as EventListener)
        window.addEventListener("walletDisconnected", handleWalletDisconnected as EventListener)

        return () => {
            window.removeEventListener("walletConnected", handleWalletConnected as EventListener)
            window.removeEventListener("walletDisconnected", handleWalletDisconnected as EventListener)
        }
    }, [])

    const fetchBalances = async (address: string) => {
        setIsLoading(true)
        try {
            const result = await fetchUserDensity(address)
            if (result.success && result.data) {
                setEcosystemBalance(result.data.amount || 0)
                setUnextractedBalance(result.data.amountUnclaimed || 0)
            }
        } catch (error) {
            console.error("Error fetching density balances:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleConnectWallet = async () => {
        if (typeof window !== "undefined" && window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
                if (accounts.length > 0) {
                    setWalletAddress(accounts[0])
                    setIsConnected(true)
                    await fetchBalances(accounts[0])

                    // Dispatch event for other components
                    window.dispatchEvent(
                        new CustomEvent("walletConnected", {
                            detail: { connected: true, address: accounts[0], avatar: null },
                        })
                    )
                }
            } catch (error) {
                console.error("Error connecting wallet:", error)
            }
        } else {
            onConnectWallet?.()
        }
    }

    const formatBalance = (value: number) => {
        return value.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })
    }

    return (
        <motion.div
            className="bg-gray-900/95 backdrop-blur-md border border-gray-700/50 rounded-2xl overflow-hidden shadow-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            {isConnected ? (
                // Connected State - Show balances
                <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-pt-mono text-gray-400 uppercase tracking-wider">
                            Your $DENSITY Balance
                        </h3>
                        <div className="flex items-center space-x-2 text-xs text-gray-500 font-pt-mono">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            <span>{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Ecosystem Balance */}
                        <div className="bg-purple-500/10 border border-purple-400/30 rounded-xl p-4">
                            <div className="text-xs text-gray-400 font-pt-mono font-bold uppercase tracking-wider mb-2">
                                ECOSYSTEM BALANCE
                            </div>
                            <div className="flex items-center space-x-3">
                                <Image
                                    src="/images/density-white.svg"
                                    alt="DENSITY"
                                    width={24}
                                    height={24}
                                    className="w-6 h-6"
                                />
                                <span className="text-2xl text-white font-pt-mono font-bold">
                                    {isLoading ? "..." : formatBalance(ecosystemBalance)}
                                </span>
                            </div>
                        </div>

                        {/* Unextracted Balance */}
                        <a
                            href="https://amplify.oldrocknft.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-orange-500/10 border border-orange-400/30 rounded-xl p-4 transition-colors group cursor-pointer relative overflow-hidden"
                        >
                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-orange-950/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
                                <span className="text-orange-400 font-pt-mono font-bold tracking-widest uppercase text-sm flex items-center space-x-2">
                                    <span>Extract</span>
                                    <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                                </span>
                            </div>

                            <div className="text-xs text-gray-400 font-pt-mono font-bold uppercase tracking-wider mb-2 group-hover:text-orange-300 transition-colors">
                                UNEXTRACTED BALANCE
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <Image
                                        src="/images/density-white.svg"
                                        alt="DENSITY"
                                        width={24}
                                        height={24}
                                        className="w-6 h-6"
                                    />
                                    <span className="text-2xl text-white font-pt-mono font-bold">
                                        {isLoading ? "..." : formatBalance(unextractedBalance)}
                                    </span>
                                </div>
                            </div>
                        </a>
                    </div>
                </div>
            ) : (
                // Disconnected State - Show placeholder
                <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-pt-mono text-gray-400 uppercase tracking-wider">
                            Your $DENSITY Balance
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Ecosystem Balance Placeholder */}
                        <div className="bg-purple-500/5 border border-purple-400/20 rounded-xl p-4 opacity-60">
                            <div className="text-xs text-gray-400 font-pt-mono font-bold uppercase tracking-wider mb-2">
                                ECOSYSTEM BALANCE
                            </div>
                            <div className="flex items-center space-x-3">
                                <Image
                                    src="/images/density-white.svg"
                                    alt="DENSITY"
                                    width={24}
                                    height={24}
                                    className="w-6 h-6 opacity-50"
                                />
                                <span className="text-2xl text-gray-500 font-pt-mono font-bold">
                                    1,234.56
                                </span>
                            </div>
                        </div>

                        {/* Unextracted Balance Placeholder */}
                        <div className="bg-orange-500/5 border border-orange-400/20 rounded-xl p-4 opacity-60">
                            <div className="text-xs text-gray-400 font-pt-mono font-bold uppercase tracking-wider mb-2">
                                UNEXTRACTED BALANCE
                            </div>
                            <div className="flex items-center space-x-3">
                                <Image
                                    src="/images/density-white.svg"
                                    alt="DENSITY"
                                    width={24}
                                    height={24}
                                    className="w-6 h-6 opacity-50"
                                />
                                <span className="text-2xl text-gray-500 font-pt-mono font-bold">
                                    567.89
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Connect Wallet Button */}
                    <button
                        onClick={handleConnectWallet}
                        className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-pt-mono font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
                    >
                        <Wallet className="w-5 h-5" />
                        <span>Connect Wallet to View Balance</span>
                    </button>
                </div>
            )}
        </motion.div>
    )
}
