"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { ChevronDown, Copy, ExternalLink, LogOut, Wallet, Plus, Settings, Check } from "lucide-react"
import Link from "next/link"

interface Props {
  className?: string
  onConnectionChange?: (connected: boolean, address?: string, avatar?: string) => void
  profileNFT?: any
}

const SimpleWalletButton: React.FC<Props> = ({ className, onConnectionChange, profileNFT }) => {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState("")
  const [ensName, setEnsName] = useState("")
  const [avatar, setAvatar] = useState("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectedAccounts, setConnectedAccounts] = useState<string[]>([])
  const [selectedAccount, setSelectedAccount] = useState<string>("")

  // New states for social connections
  const [isDiscordConnected, setIsDiscordConnected] = useState(false)
  const [isTwitterConnected, setIsTwitterConnected] = useState(false)

  // Check connection on mount
  useEffect(() => {
    checkConnection()
    loadSocialConnections()
  }, [])

  // Listen for account changes
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect()
        } else {
          handleConnection(accounts)
        }
      }

      window.ethereum.on("accountsChanged", handleAccountsChanged)
      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
      }
    }
  }, [])

  // Listen for profile NFT changes
  useEffect(() => {
    const handleProfileNFTChange = (event: CustomEvent) => {
      if (event.detail?.image) {
        console.log("Wallet button: Profile NFT changed, updating avatar")
        setAvatar(event.detail.image)
      }
    }

    window.addEventListener("profileNFTChanged", handleProfileNFTChange as EventListener)
    return () => {
      window.removeEventListener("profileNFTChanged", handleProfileNFTChange as EventListener)
    }
  }, [])

  const checkConnection = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" })
        if (accounts.length > 0) {
          await handleConnection(accounts)
        }
      } catch (error) {
        console.error("Error checking connection:", error)
      }
    }
  }

  const loadSocialConnections = () => {
    const savedDiscord = localStorage.getItem("discordConnected") === "true"
    const savedTwitter = localStorage.getItem("twitterConnected") === "true"
    setIsDiscordConnected(savedDiscord)
    setIsTwitterConnected(savedTwitter)
  }

  const handleConnection = async (accounts: string[]) => {
    setConnectedAccounts(accounts)
    const userAddress = accounts[0]
    setSelectedAccount(userAddress)
    setAddress(userAddress)
    setIsConnected(true)

    // Store connected accounts in localStorage
    localStorage.setItem("connectedAccounts", JSON.stringify(accounts))
    localStorage.setItem("selectedAccount", userAddress)

    // Fetch ENS name and avatar for the selected account
    try {
      const name = await fetchENSName(userAddress)
      let avatarUrl = await fetchENSAvatar(userAddress)

      // Check if user has a saved profile NFT
      const savedProfileNFT = localStorage.getItem(`profile-nft-${userAddress}`)
      if (savedProfileNFT) {
        const nft = JSON.parse(savedProfileNFT)
        console.log("Using saved profile NFT in wallet button:", nft)
        avatarUrl = nft.image || avatarUrl
      }

      setEnsName(name)
      setAvatar(avatarUrl)

      onConnectionChange?.(true, userAddress, avatarUrl)
    } catch (error) {
      console.error("Error fetching ENS data:", error)
      onConnectionChange?.(true, userAddress, avatar)
    }

    window.dispatchEvent(
      new CustomEvent("walletConnected", {
        detail: { connected: true, address: userAddress, avatar: avatar },
      }),
    )
  }

  const fetchENSName = async (address: string): Promise<string> => {
    try {
      const response = await fetch(`https://api.ensideas.com/ens/resolve/${address}`)
      if (response.ok) {
        const data = await response.json()
        return data.name || `${address.slice(0, 6)}...${address.slice(-4)}`
      }
    } catch (error) {
      console.error("Error fetching ENS name:", error)
    }
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const fetchENSAvatar = async (address: string): Promise<string> => {
    try {
      const ensResponse = await fetch(`https://api.ensideas.com/ens/resolve/${address}`)
      if (ensResponse.ok) {
        const ensData = await ensResponse.json()
        if (ensData.name) {
          const avatarResponse = await fetch(`https://metadata.ens.domains/mainnet/avatar/${ensData.name}`)
          if (avatarResponse.ok) {
            const avatarUrl = avatarResponse.url
            if (avatarUrl && !avatarUrl.includes("404")) {
              return avatarUrl
            }
          }
        }
      }
      return `https://effigy.im/a/${address}.png`
    } catch (error) {
      console.error("Error fetching ENS avatar:", error)
      return "/images/rock-logo.png"
    }
  }

  const connectWallet = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      setIsConnecting(true)
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
        if (accounts.length > 0) {
          await handleConnection(accounts)
        }
      } catch (error) {
        console.error("Failed to connect wallet:", error)
      } finally {
        setIsConnecting(false)
      }
    }
  }

  const connectAnotherWallet = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      setIsConnecting(true)
      try {
        // Force metamask to show the account selection screen
        await window.ethereum.request({
          method: "wallet_requestPermissions",
          params: [{ eth_accounts: {} }],
        })

        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
        if (accounts.length > 0) {
          // Get all previously connected accounts
          const previousAccounts = [...connectedAccounts]

          // Add new accounts that aren't already in our list
          const newAccounts = accounts.filter((acc) => !previousAccounts.includes(acc))
          const allAccounts = [...previousAccounts, ...newAccounts]

          // Update state with all accounts
          setConnectedAccounts(allAccounts)
          localStorage.setItem("connectedAccounts", JSON.stringify(allAccounts))

          // If we have new accounts, select the first new one
          if (newAccounts.length > 0) {
            const newAccount = newAccounts[0]
            setSelectedAccount(newAccount)
            setAddress(newAccount)
            localStorage.setItem("selectedAccount", newAccount)

            // Update ENS and avatar for the new account
            const name = await fetchENSName(newAccount)
            const avatarUrl = await fetchENSAvatar(newAccount)
            setEnsName(name)
            setAvatar(avatarUrl)

            onConnectionChange?.(true, newAccount, avatarUrl)
          }
        }
      } catch (error) {
        console.error("Failed to connect additional wallet:", error)
      } finally {
        setIsConnecting(false)
        setIsDropdownOpen(false)
      }
    }
  }

  const disconnect = () => {
    // Clear all wallet state
    setIsConnected(false)
    setAddress("")
    setEnsName("")
    setAvatar("")
    setIsDropdownOpen(false)

    // Store the accounts before clearing for cleanup
    const accountsToClean = [...connectedAccounts]

    setConnectedAccounts([])
    setSelectedAccount("")

    // Clear localStorage
    localStorage.removeItem("connectedAccounts")
    localStorage.removeItem("selectedAccount")
    localStorage.removeItem("discordConnected")
    localStorage.removeItem("twitterConnected")
    setIsDiscordConnected(false)
    setIsTwitterConnected(false)

    // Clear any saved profile NFT data for all accounts
    accountsToClean.forEach((account) => {
      localStorage.removeItem(`profile-nft-${account}`)
      localStorage.removeItem(`social-accounts-${account}`)
      localStorage.removeItem(`featured-nfts-${account}`)
      localStorage.removeItem(`nft-backstories-${account}`)
      localStorage.removeItem(`featured-nft-names-${account}`)
      localStorage.removeItem(`selected-badges-${account}`)
    })

    // Notify parent components
    onConnectionChange?.(false)

    // Dispatch disconnect event for other components
    window.dispatchEvent(new CustomEvent("walletDisconnected"))
  }

  const copyAddress = async () => {
    await navigator.clipboard.writeText(address)
    setIsDropdownOpen(false)
  }

  const openEtherscan = () => {
    window.open(`https://etherscan.io/address/${address}`, "_blank")
    setIsDropdownOpen(false)
  }

  const switchAccount = async (account: string) => {
    setSelectedAccount(account)
    setAddress(account)
    localStorage.setItem("selectedAccount", account)

    try {
      const name = await fetchENSName(account)
      let avatarUrl = await fetchENSAvatar(account)

      // Check if user has a saved profile NFT for this account
      const savedProfileNFT = localStorage.getItem(`profile-nft-${account}`)
      if (savedProfileNFT) {
        const nft = JSON.parse(savedProfileNFT)
        avatarUrl = nft.image || avatarUrl
      }

      setEnsName(name)
      setAvatar(avatarUrl)

      onConnectionChange?.(true, account, avatarUrl)
    } catch (error) {
      console.error("Error switching account:", error)
    }

    setIsDropdownOpen(false)
  }

  const connectDiscord = () => {
    // Simulate Discord connection
    setTimeout(() => {
      setIsDiscordConnected(true)
      localStorage.setItem("discordConnected", "true")
      setIsDropdownOpen(false)
      alert("Discord connected successfully!") // Provide feedback
    }, 1000)
  }

  const connectTwitter = () => {
    // Simulate Twitter connection
    setTimeout(() => {
      setIsTwitterConnected(true)
      localStorage.setItem("twitterConnected", "true")
      setIsDropdownOpen(false)
      alert("X connected successfully!") // Provide feedback
    }, 1000)
  }

  if (!isConnected) {
    return (
      <button
        onClick={connectWallet}
        disabled={isConnecting}
        className="flex items-center space-x-2 bg-transparent border-2 border-white text-white hover:bg-white/10 px-3 py-1.5 rounded-full font-pt-mono font-bold transition-all duration-300 hover:scale-105 text-sm disabled:opacity-50 min-h-[44px]"
      >
        <Wallet className="w-3.5 h-3.5" />
        <span>{isConnecting ? "Connecting..." : "Connect Wallet"}</span>
      </button>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-2 md:space-x-3 pl-4 md:pl-6 py-3 md:py-4 hover:bg-white/5 transition-colors relative min-h-[44px]"
      >
        {/* Separator line */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-px h-6 md:h-8 bg-white/30"></div>

        <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg overflow-hidden">
          <Image
            src={profileNFT?.image || avatar || "/placeholder.svg"}
            alt="Profile"
            width={32}
            height={32}
            className={`w-full h-full object-cover ${profileNFT ? "" : "rounded-full"}`}
          />
        </div>
        <div className="text-left">
          <span className="text-white font-pt-mono font-bold block text-xs md:text-sm">{ensName}</span>
          <span className="text-gray-400 font-pt-mono text-xs">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            className="absolute top-full right-0 mt-2 w-64 bg-gray-900/95 backdrop-blur-md border border-gray-700/50 rounded-xl overflow-hidden shadow-2xl z-50"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 rounded-lg overflow-hidden">
                  <Image
                    src={profileNFT?.image || avatar || "/placeholder.svg"}
                    alt="Profile"
                    width={48}
                    height={48}
                    className={`w-full h-full object-cover ${profileNFT ? "" : "rounded-full"}`}
                  />
                </div>
                <div>
                  <div className="text-white font-pt-mono font-bold">{ensName}</div>
                  <div className="text-gray-400 font-pt-mono text-sm">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {connectedAccounts.length > 1 && (
                  <>
                    <div className="text-xs text-gray-400 px-3 py-1">Switch Account</div>
                    {connectedAccounts.map((account) => (
                      <button
                        key={account}
                        onClick={() => switchAccount(account)}
                        className={`w-full flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors font-pt-mono text-sm ${
                          account === selectedAccount ? "bg-gray-800/50 text-white" : ""
                        }`}
                      >
                        <span>
                          {account.slice(0, 6)}...{account.slice(-4)}
                        </span>
                        {account === selectedAccount && <span className="text-green-400">✓</span>}
                      </button>
                    ))}
                    <div className="border-t border-gray-700 my-2"></div>
                  </>
                )}

                <button
                  onClick={connectAnotherWallet}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors font-pt-mono text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Connect Another Wallet</span>
                </button>

                <div className="border-t border-gray-700 my-2"></div>

                {/* Discord Connection */}
                <button
                  onClick={connectDiscord}
                  disabled={isDiscordConnected}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors font-pt-mono text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4 text-white"
                  >
                    <path d="M20.2 6.4c-.7-.5-1.5-1-2.4-1.3-.6-.2-1.2-.3-1.8-.4-.8-.1-1.6-.1-2.4 0-1.7.3-3.4 1-4.8 2-1.4 1-2.7 2.3-3.9 3.8-1.2 1.5-2.2 3.1-2.9 4.8-.6 1.7-.9 3.5-.8 5.3v.1c0 .2.1.4.2.5s.4.1.6 0l1.3-.6c.2-.1.3-.2.4-.3s.2-.2.3-.3c.7.4 1.5.7 2.3.9 1 .2 2 .2 3 0 1-.2 2-.5 2.9-1.1.9-.6 1.7-1.3 2.4-2.2.7-1 1.2-2.1 1.6-3.3.4-1.2.6-2.5.6-3.8V7.5c0-.4-.1-.8-.2-1.1zM9.7 15.6c-.7 0-1.2-.5-1.2-1.2s.5-1.2 1.2-1.2c.7 0 1.2.5 1.2 1.2s-.5 1.2-1.2 1.2zm4.6 0c-.7 0-1.2-.5-1.2-1.2s.5-1.2 1.2-1.2c.7 0 1.2.5 1.2 1.2s-.5 1.2-1.2 1.2z" />
                  </svg>
                  <span>{isDiscordConnected ? "Discord Connected" : "Connect Discord"}</span>
                  {isDiscordConnected && <Check className="w-4 h-4 text-green-400 ml-auto" />}
                </button>

                {/* X Connection */}
                <button
                  onClick={connectTwitter}
                  disabled={isTwitterConnected}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors font-pt-mono text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4 text-white"
                  >
                    <path d="M18.901 1.153h3.68l-8.042 9.167L24 22.847h-7.406l-5.8-6.797L6.11 22.847H0l8.603-9.813L0 1.153h7.501l5.278 6.17L18.901 1.153Zm-1.051 19.492h2.268L5.93 3.477H3.508l14.342 17.168Z" />
                  </svg>
                  <span>{isTwitterConnected ? "X Connected" : "Connect X"}</span>
                  {isTwitterConnected && <Check className="w-4 h-4 text-green-400 ml-auto" />}
                </button>

                {/* Admin Link for authorized users */}
                {isConnected &&
                  address &&
                  address.toLowerCase() === "0xb6585310D9546C6dFc5C1dcfA5eF92919f96D194".toLowerCase() && (
                    <>
                      <div className="border-t border-gray-700 my-2"></div>
                      <Link
                        href="/admin"
                        className="w-full flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors font-pt-mono text-sm"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        <span>Admin</span>
                      </Link>
                    </>
                  )}

                <button
                  onClick={copyAddress}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors font-pt-mono text-sm"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy Address</span>
                </button>

                <button
                  onClick={openEtherscan}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors font-pt-mono text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>View on Etherscan</span>
                </button>

                <button
                  onClick={disconnect}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors font-pt-mono text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Disconnect</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export { SimpleWalletButton }
