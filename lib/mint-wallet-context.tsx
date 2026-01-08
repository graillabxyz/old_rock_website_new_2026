"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { ethers } from "ethers"

type WalletContextType = {
    address: string | null
    isConnected: boolean
    provider: ethers.BrowserProvider | null
    signer: ethers.JsonRpcSigner | null
    connect: () => Promise<void>
    disconnect: () => void
}

const WalletContext = createContext<WalletContextType>({
    address: null,
    isConnected: false,
    provider: null,
    signer: null,
    connect: async () => { },
    disconnect: () => { },
})

export const useWallet = () => useContext(WalletContext)

export const MintWalletProvider = ({ children }: { children: ReactNode }) => {
    const [address, setAddress] = useState<string | null>(null)
    const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
    const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null)
    const [isConnected, setIsConnected] = useState(false)

    // Check if wallet is already connected
    useEffect(() => {
        const checkConnection = async () => {
            if (typeof window !== "undefined" && window.ethereum) {
                try {
                    const accounts = await window.ethereum.request({ method: "eth_accounts" })
                    if (accounts.length > 0) {
                        const provider = new ethers.BrowserProvider(window.ethereum)
                        const signer = await provider.getSigner()
                        const address = await signer.getAddress()

                        setProvider(provider)
                        setSigner(signer)
                        setAddress(address)
                        setIsConnected(true)
                    }
                } catch (error) {
                    console.error("Error checking connection:", error)
                }
            }
        }

        if (typeof window !== "undefined") {
            checkConnection()
        }
    }, [])

    // Handle account changes
    useEffect(() => {
        if (typeof window !== "undefined" && window.ethereum) {
            const handleAccountsChanged = (accounts: string[]) => {
                if (accounts.length === 0) {
                    // User disconnected
                    disconnect()
                } else if (accounts[0] !== address) {
                    // Account changed
                    setAddress(accounts[0])
                }
            }

            window.ethereum?.on("accountsChanged", handleAccountsChanged)

            return () => {
                window.ethereum?.removeListener("accountsChanged", handleAccountsChanged)
            }
        }
    }, [address])

    const connect = async () => {
        if (typeof window !== "undefined" && window.ethereum) {
            try {
                // Request account access
                await window.ethereum.request({ method: "eth_requestAccounts" })

                const provider = new ethers.BrowserProvider(window.ethereum)
                const signer = await provider.getSigner()
                const address = await signer.getAddress()

                setProvider(provider)
                setSigner(signer)
                setAddress(address)
                setIsConnected(true)
            } catch (error) {
                console.error("Error connecting wallet:", error)
            }
        } else {
            alert("Please install MetaMask or another Ethereum wallet extension")
        }
    }

    const disconnect = () => {
        setProvider(null)
        setSigner(null)
        setAddress(null)
        setIsConnected(false)
    }

    return (
        <WalletContext.Provider value={{ address, isConnected, provider, signer, connect, disconnect }}>
            {children}
        </WalletContext.Provider>
    )
}
