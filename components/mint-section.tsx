"use client"

import { Button } from "@/components/ui/button"
import { ExternalLink, FileText, EclipseIcon as Ethereum } from "lucide-react"
import { XIcon } from "@/components/x-icon"
import { DiscordIcon } from "@/components/discord-icon"
import { OpenseaIcon } from "@/components/opensea-icon"
import Image from "next/image"
import { useState, useEffect } from "react"
import { ethers } from "ethers"

// Actual contract address
const CONTRACT_ADDRESS = "0x05ab5a50f77b9957b51145b259f05e805d84e92e"

// Social links
const SOCIAL_LINKS = {
  x: "https://x.com/OldRockNFT",
  discord: "https://discord.com/invite/oldrocknft",
  opensea: "https://opensea.io/collection/oldrock-goliath",
  docs: "https://docs.oldrocknft.com/",
}

// Fallback values in case contract calls fail
const FALLBACK_TOTAL_SUPPLY = 5000
const FALLBACK_MINTED_COUNT = 3602
const FALLBACK_MINT_PRICE = 0.015

export const toFixed = (number: any) => Number((number).toFixed(2));

export const useReloadOnNetworkChange = () => {
  useEffect(() => {
    const { ethereum } = window;
    if (!ethereum || !ethereum.on) return;

    const handleChainChanged = () => {
      window.location.reload();
    };

    ethereum.on('chainChanged', handleChainChanged);

    return () => {
      ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, []);
};

export default function MintSection() {
  const [mounted, setMounted] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null)

  const [totalSupply, setTotalSupply] = useState(FALLBACK_TOTAL_SUPPLY)
  const [mintedCount, setMintedCount] = useState(FALLBACK_MINTED_COUNT)
  const [mintCount, setMintCount] = useState(1);
  const [mintPrice, setMintPrice] = useState(FALLBACK_MINT_PRICE)
  const [isLoading, setIsLoading] = useState(true)
  const [isMinting, setIsMinting] = useState(false)
  const [invalidNetwork, setInvalidNetwork] = useState(false);
  const [isCheckingBalance, setIsCheckingBalance] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [mintSuccess, setMintSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userBalance, setUserBalance] = useState<string | null>(null)
  const [count, setCount] = useState(1);
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false);

  useReloadOnNetworkChange();

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

  // Handle hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch contract data
  useEffect(() => {
    const fetchContractData = async () => {
      if (!provider) {
        return;
      }

      const network = await provider.getNetwork();

      // Ensure network is set to Ethereum mainnet
      if (Number(network.chainId) !== 1) {
        setInvalidNetwork(true);

        return;
      }

      setIsLoading(true)

      try {
        // Create a read-only contract instance
        const readOnlyProvider = new ethers.JsonRpcProvider('https://eth-mainnet.g.alchemy.com/v2/AeSXXz_CAywHzl9o2XGd5');

        // Try different common function names for getting data
        const possibleFunctions = [
          // For minted count
          "totalSupply()",

          // For mint price
          "publicPrice()",
        ]

        // Create a minimal ABI with all possible functions
        const minimalABI = possibleFunctions.map((func) => {
          const isView = true
          const name = func.split("(")[0]
          return {
            name,
            type: "function",
            stateMutability: isView ? "view" : "nonpayable",
            inputs: [],
            outputs: [{ type: "uint256", name: "" }],
          }
        })

        const contract = new ethers.Contract(CONTRACT_ADDRESS, minimalABI, readOnlyProvider)

        // Try to get minted count
        for (const funcName of ["totalSupply"]) {
          if (funcName in contract) {
            try {
              const result = await contract[funcName]()
              setMintedCount(Number(result))
              console.log(`Found minted count using ${funcName}: ${Number(result)}`)
              break
            } catch (e) {
              console.log(`Failed to call ${funcName}`)
            }
          }
        }

        // Try to get mint price
        for (const funcName of ["publicPrice"]) {
          if (funcName in contract) {
            try {
              const result = await contract[funcName]()
              setMintPrice(Number(ethers.formatEther(result)))
              console.log(`Found mint price using ${funcName}: ${Number(ethers.formatEther(result))} ETH`)
              break
            } catch (e) {
              console.log(`Failed to call ${funcName}`)
            }
          }
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

  // Format error message
  const formatErrorMessage = (error: any): string => {
    const errorMessage = error?.message || String(error)

    if (errorMessage.includes("insufficient funds")) {
      return "Insufficient funds. You don't have enough ETH to cover the mint price and gas fees."
    }

    if (errorMessage.includes("user rejected")) {
      return "Transaction was rejected."
    }

    return "Failed to mint. Please try again."
  }

  // Check if user has enough balance
  const hasEnoughBalance = (): boolean => {
    if (!userBalance) return false;

    // Add buffer for gas (roughly 0.0025 ETH)
    const requiredAmount = (mintPrice * mintCount) + 0.0025;

    return Number.parseFloat(userBalance) >= requiredAmount;
  }

  // Wallet connect function
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
      // The page will reload due to useReloadOnNetworkChange hook
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

  // Handle mint button click
  const handleMint = async () => {
    if (!isConnected) {
      connect()
      return
    }

    if (!signer) return

    // Check balance first
    setIsCheckingBalance(true)
    setError(null)

    try {
      if (!hasEnoughBalance()) {
        setError(`Insufficient funds. You need at least ${toFixed((mintPrice * mintCount) + 0.005)} ETH (mint price + gas).`)
        return
      }

      setIsMinting(true)

      // Create a simple interface for the mint function
      const mintInterface = new ethers.Interface(["function mint(uint256 numTokens) payable"])

      // Create contract instance with minimal interface
      const contract = new ethers.Contract(CONTRACT_ADDRESS, mintInterface, signer)

      // Convert price to wei
      const priceInWei = ethers.parseEther(mintPrice.toString()); // e.g. 0.015 ETH
      const quantity = mintCount || 1;

      // Calculate total value = price * quantity
      const totalValue = priceInWei * BigInt(quantity);

      const gasEstimate = await contract.mint.estimateGas(quantity, {
        value: totalValue,
      });

      // Send transaction
      const tx = await contract.mint(quantity, {
        value: totalValue,
        gasLimit: gasEstimate + gasEstimate / BigInt(5), // add 20% buffer
      });

      setTxHash(tx.hash)

      // Wait for transaction to be mined
      await tx.wait()
      setMintSuccess(true)

      // Refresh minted count after successful mint
      const updatedCount = mintedCount + 1
      setMintedCount(updatedCount)
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
    <div className="space-y-8">
      {/* Collection Title */}
      <div>
        <h1 className="text-4xl font-bold">GOLIATH</h1>
        <h1 className="text-3xl font-bold text-gray-400">GAME PIECES</h1>
      </div>

      {/* Creator Info */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg overflow-hidden relative">
          <Image src="https://static.wixstatic.com/media/15a12e_bd62f2a43897432494b330488f8cc7a1~mv2.png/v1/fill/w_48,h_48,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/GEM1_For_Dark%202.png" alt="Creator Avatar" width={48} height={48} />
        </div>
        <div>
          <div className="text-sm text-gray-400">Created by</div>
          <div className="font-bold">OLD ROCK NFT</div>
          <div className="text-sm text-gray-400">{totalSupply} NFTs</div>
        </div>
        <div className="ml-auto flex gap-3">
          {/* Social Links */}
          <a href={SOCIAL_LINKS.x} target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)">
            <XIcon className="w-5 h-5 hover:text-gray-300 transition-colors" />
          </a>
          <a href={SOCIAL_LINKS.discord} target="_blank" rel="noopener noreferrer" aria-label="Discord">
            <DiscordIcon className="w-5 h-5 hover:text-gray-300 transition-colors" />
          </a>
          <a href={SOCIAL_LINKS.opensea} target="_blank" rel="noopener noreferrer" aria-label="OpenSea">
            <OpenseaIcon className="w-5 h-5 hover:text-gray-300 transition-colors" />
          </a>
          <a href={SOCIAL_LINKS.docs} target="_blank" rel="noopener noreferrer" aria-label="Documentation">
            <FileText className="w-5 h-5 hover:text-gray-300 transition-colors" />
          </a>
        </div>
      </div>

      {/* Mint Info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-sm text-gray-400">MINT PRICE</div>
          <div className="text-2xl font-bold">
            {isLoading ? <span className="text-gray-500">Loading...</span> : `${mintPrice} ETH`}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-400">TOKENS MINTED</div>
          <div className="text-2xl font-bold">
            {isLoading ? <span className="text-gray-500">Loading...</span> : `${mintedCount} / ${totalSupply}`}
          </div>
        </div>
      </div>

      {/* User Balance and incrementer (if connected) */}
      {isConnected && userBalance && (
        <>
          <div className="bg-gray-900 p-3 rounded-lg">
            <div className="text-sm text-gray-400">YOUR BALANCE</div>
            <div className="text-lg">
              {Number.parseFloat(userBalance).toFixed(4)} ETH
              {!hasEnoughBalance() && <span className="text-red-500 text-sm ml-2">(Insufficient for minting)</span>}
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 p-2">
            Amount (max 5):
            <button
              onClick={() => setMintCount((prev) => Math.max(1, prev - 1))}
              className="p-1 rounded-full border border-2 border-solid border-gray-500 hover:border-white transition w-[30px]"
            >
              -
            </button>
            <span className="text-xl font-medium w-6 text-center">{mintCount}</span>
            <button
              onClick={() => setMintCount((prev) => Math.min(5, prev + 1))}
              className="p-1 rounded-full border border-2 border-solid border-gray-500 hover:border-white transition w-[30px]"
            >
              +
            </button>
          </div>
        </>
      )}

      {/* Mint Button */}
      <Button
        className="w-full py-6 text-lg font-bold bg-white text-black hover:bg-gray-200 disabled:opacity-50"
        onClick={handleMint}
        disabled={isMinting || isCheckingBalance || isLoading}
      >
        {isMinting
          ? "MINTING..."
          : isCheckingBalance
            ? "CHECKING BALANCE..."
            : isLoading
              ? "WAITING FOR WALLET..."
              : mintSuccess
                ? "MINT SUCCESS"
                : "MINT NOW"}
      </Button>

      {invalidNetwork ? (
        <div className="text-center p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg space-y-3">
          <div className="text-amber-500 font-medium">Wrong network detected</div>
          <Button
            onClick={switchToEthereum}
            disabled={isSwitchingNetwork}
            className="w-full py-3 text-md font-bold bg-amber-500 hover:bg-amber-600 text-black disabled:opacity-50 transition-colors"
          >
            {isSwitchingNetwork ? "SWITCHING..." : "SWITCH TO ETHEREUM MAINNET"}
          </Button>
        </div>
      ) : null}

      {/* Error Message */}
      {error && <div className="text-center text-red-500 p-3 bg-red-500/10 rounded-lg">{error}</div>}

      {/* Transaction Status */}
      {txHash && (
        <div className="text-center">
          <a
            href={`https://etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            View transaction
          </a>
        </div>
      )}

      {/* Description */}
      <div>
        <h2 className="text-sm text-gray-400 mb-2">DESCRIPTION</h2>
        <p className="mb-4">
          5,000 PFP game pieces
          <br />
          Token-gated access to the Old Rock ecosystem
        </p>

        <p className="mb-4">
          Those who contracted the disease suffered strange and terrifying symptoms, and soon the contagion spread
          beyond the confines of the base camp. Some succumbed to the illness and perished, while others exhibited
          inhuman abilities brought about by their connection to the strange mineral.
        </p>

        <p>It was as if Goliath had unlocked something deep within them, something both powerful and dangerous.</p>
      </div>

      {/* Blockchain Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-900 p-4 rounded-lg">
          <div className="text-sm text-gray-400 mb-2">BLOCKCHAIN</div>
          <div className="flex items-center gap-2">
            <Ethereum className="w-5 h-5" />
            <span>ETHEREUM</span>
          </div>
        </div>
        <div className="bg-gray-900 p-4 rounded-lg">
          <div className="text-sm text-gray-400 mb-2">ADDRESS</div>
          <div className="flex items-center justify-between">
            <span className="text-sm truncate">
              {CONTRACT_ADDRESS.slice(0, 8)}...{CONTRACT_ADDRESS.slice(-6)}
            </span>
            <a href={`https://etherscan.io/address/${CONTRACT_ADDRESS}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
