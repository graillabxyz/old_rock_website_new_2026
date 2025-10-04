"use server"

export async function fetchWalletBalances(walletAddress: string) {
  try {
    const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY

    if (!ALCHEMY_API_KEY) {
      console.warn("Alchemy API key not found")
      return {
        success: false,
        balances: {
          usdc: "0.00",
          density: "0.00",
        },
      }
    }

    // USDC contract address on Ethereum mainnet
    const USDC_CONTRACT_ADDRESS = "0xA0b86a33E6441b8435b662303c0f218C8F8c0c0c"

    // Create AbortController for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    try {
      // Fetch USDC balance using Alchemy's getTokenBalances endpoint
      const response = await fetch(`https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: 1,
          jsonrpc: "2.0",
          method: "alchemy_getTokenBalances",
          params: [walletAddress, [USDC_CONTRACT_ADDRESS]],
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        console.error("API Response not OK:", response.status)
        throw new Error(`API Error: ${response.status}`)
      }

      const data = await response.json()

      let usdcBalance = "0.00"

      if (data.result && data.result.tokenBalances && data.result.tokenBalances.length > 0) {
        const usdcTokenBalance = data.result.tokenBalances[0]

        if (usdcTokenBalance.tokenBalance && usdcTokenBalance.tokenBalance !== "0x0") {
          // Convert hex balance to decimal and format for USDC (6 decimals)
          const balanceHex = usdcTokenBalance.tokenBalance
          const balanceWei = BigInt(balanceHex)
          const balanceDecimal = Number(balanceWei) / Math.pow(10, 6) // USDC has 6 decimals

          // Format with commas and 2 decimal places
          usdcBalance = balanceDecimal.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        }
      }

      return {
        success: true,
        balances: {
          usdc: usdcBalance,
          density: "0.00", // Set to 0 as requested
        },
      }
    } catch (fetchError) {
      clearTimeout(timeoutId)
      if (fetchError.name === "AbortError") {
        console.error("Request timeout")
        throw new Error("Request timeout - please try again")
      }
      throw fetchError
    }
  } catch (error) {
    console.error("Error fetching wallet balances:", error)
    return {
      success: false,
      balances: {
        usdc: "0.00",
        density: "0.00",
      },
      error: error.message || "Failed to fetch balances",
    }
  }
}

// Alternative function to get ETH balance as well if needed
export async function fetchETHBalance(walletAddress: string) {
  try {
    const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY

    if (!ALCHEMY_API_KEY) {
      return { success: false, balance: "0.00" }
    }

    const response = await fetch(`https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: 1,
        jsonrpc: "2.0",
        method: "eth_getBalance",
        params: [walletAddress, "latest"],
      }),
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }

    const data = await response.json()

    if (data.result) {
      // Convert hex balance to decimal and format for ETH (18 decimals)
      const balanceHex = data.result
      const balanceWei = BigInt(balanceHex)
      const balanceEth = Number(balanceWei) / Math.pow(10, 18)

      const formattedBalance = balanceEth.toLocaleString("en-US", {
        minimumFractionDigits: 4,
        maximumFractionDigits: 4,
      })

      return {
        success: true,
        balance: formattedBalance,
      }
    }

    return { success: false, balance: "0.00" }
  } catch (error) {
    console.error("Error fetching ETH balance:", error)
    return { success: false, balance: "0.00" }
  }
}
