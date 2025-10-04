interface StructuredDataProps {
  data: any
}

export function StructuredData({ data }: StructuredDataProps) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
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
