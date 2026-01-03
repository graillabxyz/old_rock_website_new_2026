# old-rock-website

Marketing presence for Old Rock ecosystem

## Environment variables

### ⚠️ SECURITY WARNING
**NEVER** commit `.env.local` or any `.env*` files to git. They contain sensitive credentials.

### Required Variables

**Server-Side Only (PRIVATE - Never exposed to client):**
```
ALCHEMY_API_KEY                 # Alchemy API key (server-side only)
AMPLIFY_API_CLIENT_SECRET       # Amplify API client secret (server-side only) - HIGHLY SENSITIVE
PINATA_JWT                      # Pinata JWT token for IPFS uploads (server-side only)
DENSITY_DECK_API_TOKEN          # Direct API token for Density Deck API (server-side only) - OPTIONAL, preferred method
DENSITY_DECK_PRIVATE_KEY        # Private key for Density Deck API authentication (server-side only) - HIGHLY SENSITIVE, fallback if token not provided
```

**Client-Side (Public - Safe to expose in browser):**
```
NEXT_PUBLIC_AMPLIFY_API_URL     # URL of Amplify API service (public URL, safe)
NEXT_PUBLIC_METADATA_SERVICE_URL # URL of metadata service (public URL, safe)
NEXT_PUBLIC_DENSITY_DECK_API_URL # URL of Density Deck API service (optional, defaults to https://api.densitydeck.com)
```

### Security Notes
- Variables prefixed with `NEXT_PUBLIC_` are bundled into client-side JavaScript and are publicly visible
- Variables WITHOUT `NEXT_PUBLIC_` prefix are server-side only and never exposed to the browser
- `AMPLIFY_API_CLIENT_SECRET`, `DENSITY_DECK_API_TOKEN`, and `DENSITY_DECK_PRIVATE_KEY` are used ONLY in API routes (`app/api/**`) and are never sent to the client
- `DENSITY_DECK_API_TOKEN` is the preferred method - if set, it will be used directly as the auth token
- `DENSITY_DECK_PRIVATE_KEY` is a fallback - should be a wallet private key (without 0x prefix) used for server-side wallet-based authentication
- Always use server-side API routes when accessing sensitive credentials
