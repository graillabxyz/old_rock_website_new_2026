"use client"

import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { ethers } from "ethers"

// Actual contract address
const CONTRACT_ADDRESS = "0x05ab5a50f77b9957b51145b259f05e805d84e92e"

// Fallback values in case contract calls fail
const FALLBACK_TOTAL_SUPPLY = 5000
const FALLBACK_MINTED_COUNT = 3602
const FALLBACK_MINT_PRICE = 0.015

const toFixed = (number: any) => Number((number).toFixed(2));

export default function MintWidget() {
    const [mounted, setMounted] = useState(false)
    const [address, setAddress] = useState<string | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
    const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null)

    const [totalSupply, setTotalSupply] = useState(FALLBACK_TOTAL_SUPPLY)
    const [mintedCount, setMintedCount] = useState(FALLBACK_MINTED_COUNT)
    const [mintCount, setMintCount] = useState(1)
    const [mintPrice, setMintPrice] = useState(FALLBACK_MINT_PRICE)
    const [isLoading, setIsLoading] = useState(true)
    const [isMinting, setIsMinting] = useState(false)
    const [invalidNetwork, setInvalidNetwork] = useState(false)
    const [isCheckingBalance, setIsCheckingBalance] = useState(false)
    const [txHash, setTxHash] = useState<string | null>(null)
    const [mintSuccess, setMintSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [userBalance, setUserBalance] = useState<string | null>(null)
    const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false)

    // Handle hydration mismatch
    useEffect(() => {
        setMounted(true)
    }, [])

    // Check wallet connection on mount
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

        checkConnection()
    }, [])

    // Fetch contract data
    useEffect(() => {
        const fetchContractData = async () => {
            if (!provider) {
                return
            }

            const network = await provider.getNetwork()

            if (Number(network.chainId) !== 1) {
                setInvalidNetwork(true)
                return
            }

            setIsLoading(true)

            try {
                const readOnlyProvider = new ethers.JsonRpcProvider('https://eth-mainnet.g.alchemy.com/v2/AeSXXz_CAywHzl9o2XGd5')

                const minimalABI = [
                    { name: "totalSupply", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint256", name: "" }] },
                    { name: "publicPrice", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint256", name: "" }] }
                ]

                const contract = new ethers.Contract(CONTRACT_ADDRESS, minimalABI, readOnlyProvider)

                try {
                    const result = await contract.totalSupply()
                    setMintedCount(Number(result))
                } catch (e) {
                    console.log("Failed to call totalSupply")
                }

                try {
                    const result = await contract.publicPrice()
                    setMintPrice(Number(ethers.formatEther(result)))
                } catch (e) {
                    console.log("Failed to call publicPrice")
                }
            } catch (error) {
                console.error("Error fetching contract data:", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchContractData()
    }, [provider])

    // Check user balance when connected
    useEffect(() => {
        const checkBalance = async () => {
            if (isConnected && provider && address) {
                try {
                    const balance = await provider.getBalance(address)
                    setUserBalance(ethers.formatEther(balance))
                } catch (error) {
                    console.error("Error checking balance:", error)
                }
            }
        }

        checkBalance()
    }, [isConnected, provider, address])

    const formatErrorMessage = (error: any): string => {
        const errorMessage = error?.message || String(error)
        if (errorMessage.includes("insufficient funds")) {
            return "Insufficient funds for mint + gas."
        }
        if (errorMessage.includes("user rejected")) {
            return "Transaction was rejected."
        }
        return "Failed to mint. Please try again."
    }

    const hasEnoughBalance = (): boolean => {
        if (!userBalance) return false
        const requiredAmount = (mintPrice * mintCount) + 0.0025
        return Number.parseFloat(userBalance) >= requiredAmount
    }

    const connect = async () => {
        if (typeof window !== "undefined" && window.ethereum) {
            try {
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

    // Switch to Ethereum mainnet
    const switchToEthereum = async () => {
        if (typeof window === "undefined" || !window.ethereum) {
            alert("Please install MetaMask or another Ethereum wallet extension")
            return
        }

        setIsSwitchingNetwork(true)
        try {
            await window.ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: "0x1" }], // 0x1 is Ethereum mainnet
            })
            // Reload to re-check network
            window.location.reload()
        } catch (error: any) {
            // Error code 4902 means the chain hasn't been added to MetaMask
            if (error.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: "wallet_addEthereumChain",
                        params: [
                            {
                                chainId: "0x1",
                                chainName: "Ethereum Mainnet",
                                nativeCurrency: {
                                    name: "Ether",
                                    symbol: "ETH",
                                    decimals: 18,
                                },
                                rpcUrls: ["https://mainnet.infura.io/v3/"],
                                blockExplorerUrls: ["https://etherscan.io"],
                            },
                        ],
                    })
                } catch (addError) {
                    console.error("Error adding Ethereum mainnet:", addError)
                }
            } else {
                console.error("Error switching network:", error)
            }
        } finally {
            setIsSwitchingNetwork(false)
        }
    }

    const handleMint = async () => {
        if (!isConnected) {
            connect()
            return
        }

        if (!signer) return

        setIsCheckingBalance(true)
        setError(null)

        try {
            if (!hasEnoughBalance()) {
                setError(`Insufficient funds. Need ${toFixed((mintPrice * mintCount) + 0.005)} ETH.`)
                return
            }

            setIsMinting(true)

            const mintInterface = new ethers.Interface(["function mint(uint256 numTokens) payable"])
            const contract = new ethers.Contract(CONTRACT_ADDRESS, mintInterface, signer)

            const priceInWei = ethers.parseEther(mintPrice.toString())
            const quantity = mintCount || 1
            const totalValue = priceInWei * BigInt(quantity)

            const gasEstimate = await contract.mint.estimateGas(quantity, {
                value: totalValue,
            })

            const tx = await contract.mint(quantity, {
                value: totalValue,
                gasLimit: gasEstimate + gasEstimate / BigInt(5),
            })

            setTxHash(tx.hash)
            await tx.wait()
            setMintSuccess(true)
            setMintedCount(mintedCount + 1)
        } catch (error: any) {
            console.error("Error minting:", error)
            setError(formatErrorMessage(error))
        } finally {
            setIsMinting(false)
            setIsCheckingBalance(false)
        }
    }

    if (!mounted) return null

    return (
        <div className="space-y-4 mt-6">
            {/* Mint Info */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900/50 p-3 rounded-lg">
                    <div className="text-xs text-gray-400 font-pt-mono">MINT PRICE</div>
                    <div className="text-lg font-bold text-white">
                        {isLoading ? <span className="text-gray-500">...</span> : `${mintPrice} ETH`}
                    </div>
                </div>
                <div className="bg-gray-900/50 p-3 rounded-lg">
                    <div className="text-xs text-gray-400 font-pt-mono">MINTED</div>
                    <div className="text-lg font-bold text-white">
                        {isLoading ? <span className="text-gray-500">...</span> : `${mintedCount} / ${totalSupply}`}
                    </div>
                </div>
            </div>

            {/* User Balance and Incrementer (if connected) */}
            {isConnected && userBalance && (
                <div className="space-y-3">
                    <div className="bg-gray-900/50 p-3 rounded-lg">
                        <div className="text-xs text-gray-400 font-pt-mono">YOUR BALANCE</div>
                        <div className="text-base text-white">
                            {Number.parseFloat(userBalance).toFixed(4)} ETH
                            {!hasEnoughBalance() && <span className="text-red-500 text-xs ml-2">(Insufficient)</span>}
                        </div>
                    </div>
                    <div className="flex items-center justify-center gap-4 font-pt-mono text-sm">
                        <span className="text-gray-400">Amount (max 5):</span>
                        <button
                            onClick={() => setMintCount((prev) => Math.max(1, prev - 1))}
                            className="w-8 h-8 rounded-full border border-gray-500 hover:border-white transition text-white flex items-center justify-center"
                        >
                            -
                        </button>
                        <span className="text-xl font-medium w-6 text-center text-white">{mintCount}</span>
                        <button
                            onClick={() => setMintCount((prev) => Math.min(5, prev + 1))}
                            className="w-8 h-8 rounded-full border border-gray-500 hover:border-white transition text-white flex items-center justify-center"
                        >
                            +
                        </button>
                    </div>
                </div>
            )}

            {/* Mint Button */}
            <Button
                className="w-full py-4 text-lg font-bold bg-purple-500 hover:bg-purple-600 text-white disabled:opacity-50 transition-colors rounded-lg"
                onClick={handleMint}
                disabled={isMinting || isCheckingBalance || invalidNetwork}
            >
                {isMinting
                    ? "MINTING..."
                    : isCheckingBalance
                        ? "CHECKING..."
                        : !isConnected
                            ? "CONNECT & MINT"
                            : mintSuccess
                                ? "MINT SUCCESS!"
                                : "MINT NOW"}
            </Button>

            {/* Network Switch */}
            {invalidNetwork && (
                <div className="text-center p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg space-y-2">
                    <div className="text-amber-500 text-xs font-pt-mono">Wrong network detected</div>
                    <Button
                        onClick={switchToEthereum}
                        disabled={isSwitchingNetwork}
                        className="w-full py-2 text-sm font-bold bg-amber-500 hover:bg-amber-600 text-black disabled:opacity-50 transition-colors rounded-lg"
                    >
                        {isSwitchingNetwork ? "SWITCHING..." : "SWITCH TO ETHEREUM"}
                    </Button>
                </div>
            )}

            {error && (
                <div className="text-center text-red-500 text-xs p-2 bg-red-500/10 rounded-lg font-pt-mono">
                    {error}
                </div>
            )}

            {/* Transaction Status */}
            {txHash && (
                <div className="text-center">
                    <a
                        href={`https://etherscan.io/tx/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline text-sm font-pt-mono"
                    >
                        View transaction
                    </a>
                </div>
            )}
        </div>
    )
}
