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
```

**Client-Side (Public - Safe to expose in browser):**
```
NEXT_PUBLIC_AMPLIFY_API_URL     # URL of Amplify API service (public URL, safe)
NEXT_PUBLIC_METADATA_SERVICE_URL # URL of metadata service (public URL, safe)
```

### Security Notes
- Variables prefixed with `NEXT_PUBLIC_` are bundled into client-side JavaScript and are publicly visible
- Variables WITHOUT `NEXT_PUBLIC_` prefix are server-side only and never exposed to the browser
- `AMPLIFY_API_CLIENT_SECRET` is used ONLY in API routes (`app/api/**`) and is never sent to the client
- Always use server-side API routes when accessing sensitive credentials
