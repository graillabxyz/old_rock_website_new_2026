export async function verifySocial(platform: string, walletAddress: string, signature: string) {
    try {
        const response = await fetch(`/api/nfts?action=verify-social`, {
            method: "POST",
            cache: "no-store",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                platform,
                walletAddress,
                signature,
            }),
        })

        if (!response.ok) {
            console.error(`❌ API error: ${response.status} ${response.statusText}`)
            return { success: false, data: null, error: `API Error: ${response.status}` }
        }

        const result = await response.json()
        return result
    } catch (error) {
        console.error("💥 Error verifying social:", error)
        return {
            success: false,
            data: null,
            error: error instanceof Error ? error.message : "Unknown error occurred",
        }
    }
}
