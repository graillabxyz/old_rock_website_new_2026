// Staking Constants - migrated from old-rock-amplify-client

// Always use production for live site
const isProduction = true; // Force production mode for staking

export const DENSITY_CONTRACT_DECIMALS = 10 ** 18;

// Ensure API URL always has a trailing slash
const rawApiUrl = process.env.NEXT_PUBLIC_AMPLIFY_API_URL || 'https://amplify-api.oldrocknft.com';
export const API_URL = rawApiUrl.endsWith('/') ? rawApiUrl : `${rawApiUrl}/`;

export const NETWORK = "base"; // Always use mainnet

export const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || (
    isProduction
        ? "Ye7GeVT1saZM0zwQur3Tma9QCsSwGkYL"
        : "OPrH488SYtSHo0X8qZ7sTCscTe8Q1IcU"
);

export const DENSITY_CONTRACT_ADDRESS = isProduction
    ? "0x9f0fC9e10Be382840bD905e42800EE9007598FE8"
    : "0x7d91c1fa6089ce4d2e1f84f9bf07acac1d0cd442";

export const WALLETCONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "99f0b0697424f8d42662b26a30e80575";

// Wallet signature messages
export const MESSAGES = {
    AllowNFTLink:
        "Old Rock / Amplify / Create link\n\nBy signing this message, I allow Old Rock NFT to verify ownership of my wallet address and create a link between my Old Rock and Goliath assets.\n\nAsset linking happens entirely off-chain - your wallet and its contents will not be modified.",
    AllowNFTUnlink:
        "Old Rock / Amplify / Remove link\n\nBy signing this message, I allow Old Rock NFT to verify ownership of my wallet address and remove a link between my Old Rock and Goliath assets.\n\nAsset linking happens entirely off-chain - your wallet and its contents will not be modified.",
    AllowNFTDeleteAndCreateLink:
        "Old Rock / Amplify / Update link\n\nBy signing this message, I allow Old Rock NFT to verify ownership of my wallet address and update a link between my Old Rock and Goliath assets.\n\nAsset linking happens entirely off-chain - your wallet and its contents will not be modified.",
    ClaimDensity:
        "Old Rock / Amplify / Extract\n\nBy signing this message, I allow Old Rock NFT to verify ownership of my wallet address and move available $DENSITY from Amplify to my Old Rock ecosystem balance.\n\nAny $DENSITY extracted will not be transferred in the future with Old Rock assets on ownership change.\n\nExtraction happens entirely off-chain - your wallet and its contents will not be modified.",
    WithdrawDensity:
        "Old Rock / Amplify / Withdraw\n\nBy signing this message, I allow Old Rock NFT to verify ownership of my wallet address and withdraw available $DENSITY from my Old Rock ecosystem balance to my on-chain Ethereum wallet in the form of $DENSITY token.",
} as const;
