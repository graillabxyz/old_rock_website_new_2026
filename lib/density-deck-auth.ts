import { ethers } from "ethers"

// Cache for the access token
let cachedToken: string | null = null
let tokenExpiry: number = 0
const TOKEN_CACHE_DURATION = 55 * 60 * 1000 // 55 minutes (tokens typically last 1 hour)

/**
 * Gets or creates an authenticated access token for Density Deck API
 * First tries to use DENSITY_DECK_API_TOKEN if provided (direct token)
 * Otherwise uses wallet-based authentication with DENSITY_DECK_PRIVATE_KEY
 */
export async function getDensityDeckAuthToken(): Promise<string> {
  // Check if we have a valid cached token
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken
  }

  // First, check if a direct API token is provided (simpler method)
  const directToken = process.env.DENSITY_DECK_API_TOKEN
  if (directToken) {
    console.log("🔐 Using direct API token from DENSITY_DECK_API_TOKEN")
    cachedToken = directToken
    tokenExpiry = Date.now() + TOKEN_CACHE_DURATION
    return cachedToken
  }

  // Fallback to wallet-based authentication
  const privateKey = process.env.DENSITY_DECK_PRIVATE_KEY
  if (!privateKey) {
    throw new Error("Either DENSITY_DECK_API_TOKEN or DENSITY_DECK_PRIVATE_KEY environment variable must be set")
  }

  const densityDeckApiUrl = process.env.NEXT_PUBLIC_DENSITY_DECK_API_URL || "https://api.densitydeck.com"

  try {
    // Normalize private key (handle with or without 0x prefix)
    // Also handle base64 or other encoded formats
    let normalizedPrivateKey: string
    let wallet: ethers.Wallet
    
    try {
      // First, try as hex (standard Ethereum private key)
      if (privateKey.startsWith("0x")) {
        normalizedPrivateKey = privateKey
      } else if (/^[0-9a-fA-F]{64}$/.test(privateKey)) {
        // 64 hex characters without 0x
        normalizedPrivateKey = `0x${privateKey}`
      } else {
        // Try different decoding methods
        let decoded: string | null = null
        
        // Method 1: Try base64 decode
        try {
          const base64Decoded = Buffer.from(privateKey, 'base64').toString('hex')
          console.log(`🔐 Base64 decoded length: ${base64Decoded.length} hex chars`)
          // A private key should be 32 bytes = 64 hex characters
          // If decoded is longer, take the first 64 chars (might be padded)
          // If decoded is shorter, it's not a valid private key
          if (base64Decoded.length >= 64) {
            decoded = base64Decoded.substring(0, 64)
            console.log("🔐 Detected base64 private key, decoded to hex (truncated to 64 chars)")
          } else if (base64Decoded.length === 64) {
            decoded = base64Decoded
            console.log("🔐 Detected base64 private key, decoded to hex")
          } else {
            console.log(`🔐 Base64 decoded too short (${base64Decoded.length} chars), not a valid private key`)
          }
        } catch (e) {
          console.log("🔐 Base64 decode failed, trying other methods...")
        }
        
        // Method 2: If base64 didn't work, try treating it as raw hex (might be missing 0x)
        if (!decoded) {
          // Remove any non-hex characters and see if we have 64 hex chars
          const hexOnly = privateKey.replace(/[^0-9a-fA-F]/g, '')
          if (hexOnly.length === 64) {
            decoded = hexOnly
            console.log("🔐 Detected hex private key (cleaned)")
          }
        }
        
        // Method 3: Try base64url decode (uses - and _ instead of + and /)
        if (!decoded) {
          try {
            const base64urlKey = privateKey.replace(/-/g, '+').replace(/_/g, '/')
            const base64urlDecoded = Buffer.from(base64urlKey, 'base64').toString('hex')
            if (/^[0-9a-fA-F]{64}$/.test(base64urlDecoded)) {
              decoded = base64urlDecoded
              console.log("🔐 Detected base64url private key, decoded to hex")
            }
          } catch (e) {
            // Ignore
          }
        }
        
        if (!decoded) {
          throw new Error("Could not decode private key. Expected: 64 hex characters (with or without 0x), or base64/base64url encoded key")
        }
        
        normalizedPrivateKey = `0x${decoded}`
      }
      
      // Validate the normalized key length
      if (normalizedPrivateKey.length !== 66 || !normalizedPrivateKey.startsWith("0x")) {
        throw new Error(`Invalid private key length: expected 66 characters (0x + 64 hex), got ${normalizedPrivateKey.length}`)
      }
      
      // Create a wallet from the private key to validate it
      wallet = new ethers.Wallet(normalizedPrivateKey)
      console.log(`🔐 Private key validated. Wallet address: ${wallet.address}`)
    } catch (keyError) {
      console.error("❌ Error creating wallet from private key:", keyError)
      console.error("❌ Private key length:", privateKey.length)
      console.error("❌ Private key starts with 0x:", privateKey.startsWith("0x"))
      console.error("❌ Private key first 10 chars:", privateKey.substring(0, 10))
      throw new Error(`Invalid private key format: ${keyError instanceof Error ? keyError.message : "Unknown error"}`)
    }
    const walletAddress = wallet.address

    console.log(`🔐 Authenticating with Density Deck API using wallet: ${walletAddress}`)

    // First, try to register/login - the API will create a user if one doesn't exist
    // We need to sign a message for authentication
    // Try SIWE (Sign-In with Ethereum) format which is commonly used
    const domain = "densitydeck.com"
    const origin = "https://densitydeck.com"
    const statement = "Sign in with Ethereum to Density Deck"
    const nonce = Date.now().toString()
    
    // SIWE message format (EIP-4361)
    const siweMessage = `${domain} wants you to sign in with your Ethereum account:\n${walletAddress}\n\n${statement}\n\nURI: ${origin}\nVersion: 1\nChain ID: 1\nNonce: ${nonce}\nIssued At: ${new Date().toISOString()}`
    
    // Also try simpler formats as fallback
    const simpleMessage = `Sign in to Density Deck`
    
    // Try SIWE format first
    let message = siweMessage
    let signature = await wallet.signMessage(message)
    
    console.log(`🔐 Authentication request:`, {
      address: walletAddress,
      message: message,
      signatureLength: signature.length,
      signaturePrefix: signature.substring(0, 10),
    })

    // Attempt to sign in
    const signinPayload = {
      address: walletAddress,
      signature: signature,
      message: message,
    }
    
    console.log(`🔐 Signin request to: ${densityDeckApiUrl}/auth/signin`)
    console.log(`🔐 Signin payload:`, {
      address: walletAddress,
      message: message,
      signatureLength: signature.length,
    })
    
    const signinResponse = await fetch(`${densityDeckApiUrl}/auth/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(signinPayload),
      signal: AbortSignal.timeout(10000),
    })

    // Log the signin response for debugging
    const signinStatus = signinResponse.status
    const signinText = await signinResponse.text()
    let signinData: any = {}
    
    try {
      signinData = JSON.parse(signinText)
    } catch {
      console.error("❌ Signin response is not JSON:", signinText.substring(0, 200))
    }
    
    console.log(`📡 Signin response: ${signinStatus}`, signinData)

    // Declare register variables outside the if block for error handling
    let registerStatus: number | undefined
    let registerData: any = {}

    // Check if signin failed - either HTTP error or response body indicates failure
    const signinFailed = !signinResponse.ok || signinData?.status === false || signinData?.success === false

    if (signinFailed) {
      // If signin fails, try register first
      console.log("🔄 Signin failed, attempting registration...")
      const registerResponse = await fetch(`${densityDeckApiUrl}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          address: walletAddress,
          signature: signature,
          message: message,
        }),
        signal: AbortSignal.timeout(10000),
      })

      registerStatus = registerResponse.status
      const registerText = await registerResponse.text()
      
      try {
        registerData = JSON.parse(registerText)
      } catch {
        console.error("❌ Register response is not JSON:", registerText.substring(0, 200))
      }
      
      console.log(`📡 Register response: ${registerStatus}`, registerData)

      // Check if register failed - either HTTP error or response body indicates failure
      const registerFailed = !registerResponse.ok || registerData?.status === false || registerData?.success === false
      
      if (registerFailed) {
        const signinError = signinData?.message || signinResponse.statusText
        const registerError = registerData?.message || registerResponse.statusText
        throw new Error(
          `Failed to register/signin to Density Deck API. Signin: ${signinStatus} (${signinError}), Register: ${registerStatus} (${registerError})`
        )
      }

      // Try multiple possible token locations in the response
      const registerToken = registerData?.data?.token || 
                            registerData?.data?.accessToken ||
                            registerData?.token || 
                            registerData?.accessToken ||
                            registerData?.data?.access_token ||
                            registerData?.access_token
      
      if (registerToken) {
        cachedToken = registerToken
        tokenExpiry = Date.now() + TOKEN_CACHE_DURATION
        console.log("✅ Successfully registered and authenticated with Density Deck API")
        return cachedToken
      } else {
        console.error("❌ Register response structure:", JSON.stringify(registerData, null, 2))
      }
    } else {
      // Try multiple possible token locations in the response
      const signinToken = signinData?.data?.token || 
                         signinData?.data?.accessToken ||
                         signinData?.token || 
                         signinData?.accessToken ||
                         signinData?.data?.access_token ||
                         signinData?.access_token
      
      if (signinToken) {
        cachedToken = signinToken
        tokenExpiry = Date.now() + TOKEN_CACHE_DURATION
        console.log("✅ Successfully authenticated with Density Deck API")
        return cachedToken
      } else {
        console.error("❌ Signin response structure:", JSON.stringify(signinData, null, 2))
      }
    }

    // Include response data in error for debugging
    const errorDetails = {
      signinStatus,
      signinData,
      registerStatus: !signinResponse.ok ? registerStatus : undefined,
      registerData: !signinResponse.ok ? registerData : undefined,
    }
    console.error("❌ Full authentication response details:", JSON.stringify(errorDetails, null, 2))
    
    // Create error with response structure included
    const error = new Error(`No access token received from Density Deck API. Signin: ${signinStatus}, Register: ${registerStatus || 'N/A'}.`)
    ;(error as any).responseData = errorDetails
    throw error
  } catch (error) {
    console.error("❌ Error authenticating with Density Deck API:", error)
    throw error
  }
}

/**
 * Clears the cached token (useful for testing or forced refresh)
 */
export function clearDensityDeckAuthToken() {
  cachedToken = null
  tokenExpiry = 0
}

