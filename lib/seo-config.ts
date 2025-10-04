export const defaultMetadata = {
  title: "Old Rock - Web3 Gaming Universe",
  description:
    "Enter the Old Rock universe - a cutting-edge Web3 gaming platform featuring NFT collections, Stonebound Souls RPG, bounty hunting, and blockchain-powered adventures.",
  keywords: [
    "web3",
    "gaming",
    "NFT",
    "blockchain",
    "RPG",
    "Stonebound Souls",
    "bounty hunting",
    "crypto",
    "decentralized",
    "play-to-earn",
  ],
  openGraph: {
    title: "Old Rock - Web3 Gaming Universe",
    description:
      "Enter the Old Rock universe - a cutting-edge Web3 gaming platform featuring NFT collections, Stonebound Souls RPG, bounty hunting, and blockchain-powered adventures.",
    images: ["/images/old-rock-social.jpeg"],
    siteName: "Old Rock",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Old Rock - Web3 Gaming Universe",
    description:
      "Enter the Old Rock universe - a cutting-edge Web3 gaming platform featuring NFT collections, Stonebound Souls RPG, bounty hunting, and blockchain-powered adventures.",
    images: ["/images/old-rock-social.jpeg"],
    creator: "@OldRockWeb3",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google",
    yandex: "yandex",
    yahoo: "yahoo",
    bing: "bing",
  },
}

export const pageMetadata = {
  stoneboundSouls: {
    title: "Stonebound Souls - Old Rock",
    description: "Embark on a thrilling RPG adventure with Stonebound Souls. Play, evolve, and conquer!",
    keywords: ["Stonebound Souls", "RPG", "adventure", "NFT", "game", "play", "evolve"],
  },
  collections: {
    title: "NFT Collections - Old Rock",
    description: "Discover unique NFT collections in the Old Rock universe. Collect, trade, and own!",
    keywords: ["NFT", "collections", "Old Rock", "crypto", "digital assets", "blockchain"],
  },
  bountyCall: {
    title: "Bounty Call - Old Rock",
    description: "Answer the Bounty Call and hunt down dangerous outlaws. Rewards await the brave!",
    keywords: ["Bounty Call", "hunt", "outlaws", "rewards", "missions", "challenges"],
  },
}

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Old Rock",
  url: "https://oldrock.com",
  logo: "https://oldrock.com/images/old-rock-logo.png",
  description:
    "Enter the Old Rock universe - a cutting-edge Web3 gaming platform featuring NFT collections, Stonebound Souls RPG, bounty hunting, and blockchain-powered adventures.",
  sameAs: ["https://twitter.com/OldRockWeb3", "https://discord.gg/oldrocknft"],
}

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Old Rock",
  url: "https://oldrock.com",
  description:
    "Enter the Old Rock universe - a cutting-edge Web3 gaming platform featuring NFT collections, Stonebound Souls RPG, bounty hunting, and blockchain-powered adventures.",
  keywords: [
    "web3",
    "gaming",
    "NFT",
    "blockchain",
    "RPG",
    "Stonebound Souls",
    "bounty hunting",
    "crypto",
    "decentralized",
    "play-to-earn",
  ],
  image: "https://oldrock.com/images/old-rock-social.jpeg",
  author: {
    "@type": "Organization",
    name: "Old Rock",
  },
}

export const gameSchema = {
  "@context": "https://schema.org",
  "@type": "VideoGame",
  name: "Stonebound Souls",
  url: "https://oldrock.com/stonebound-souls",
  description:
    "Embark on a thrilling RPG adventure with Stonebound Souls. Play, evolve, and conquer in a world where your decisions shape your NFT's destiny.",
  keywords: ["Stonebound Souls", "RPG", "adventure", "NFT", "game", "play", "evolve"],
  image: "https://oldrock.com/images/stonebound-souls-hero.jpeg",
  genre: "RPG",
  operatingSystem: "Web",
  applicationCategory: "Game",
  author: {
    "@type": "Organization",
    name: "Old Rock",
  },
}
