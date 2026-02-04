/**
 * Badge System Utility
 * Calculates all badges based on user's $DENSITY balance and NFT holdings
 */

export interface Badge {
  id: string
  name: string
  category: string
  tier?: number
  unlocked: boolean
  description: string
  icon?: string // Will be icon name for white icons
  rockColor?: string // Color of the rock that gave this badge (for reactive badges)
}

export interface BadgeData {
  totalDensity: number
  oldRockNFTs: any[]
  goliathNFTs: any[]
}

// Mystic names
const MYSTIC_NAMES = [
  "Agricola Stone",
  "Kalki",
  "Bulooma",
  "Pubian",
  "Nootau",
  "Sanskai",
  "Djup",
  "Sirinan",
  "Cemi",
  "Nebu",
  "Belarang",
]

// Bounty names
const BOUNTY_NAMES = [
  "Unknown",
  "Silverstrike",
  "The Siren",
  "The Reaper",
  "The Archon",
]

// Color names
const COLOR_NAMES = [
  "Yellow",
  "Turquoise",
  "Red",
  "Blue",
  "Purple",
  "Silver",
  "Gold",
  "Aquamarine",
  "Black",
  "White",
]

/**
 * Calculate all badges for a user
 */
export function calculateAllBadges(data: BadgeData): Badge[] {
  const badges: Badge[] = []
  const { totalDensity, oldRockNFTs, goliathNFTs } = data

  // I. DENSITY HELD BADGES
  const densityBadges = calculateDensityBadges(totalDensity)
  badges.push(...densityBadges)

  // II. OLD ROCK NFT BADGES
  const rockBadges = calculateRockBadges(oldRockNFTs)
  badges.push(...rockBadges)

  // III. GOLIATH NFT BADGES
  const goliathBadges = calculateGoliathBadges(goliathNFTs)
  badges.push(...goliathBadges)

  // IV. MYSTIC GOLIATH BADGES
  const mysticBadges = calculateMysticBadges(goliathNFTs)
  badges.push(...mysticBadges)

  // V. CROSS-ECOSYSTEM PRESTIGE BADGES
  const prestigeBadges = calculatePrestigeBadges(data)
  badges.push(...prestigeBadges)

  return badges
}

/**
 * I. DENSITY HELD BADGES
 */
function calculateDensityBadges(totalDensity: number): Badge[] {
  const badges: Badge[] = []

  // Show all tiers unlocked (not just highest)
  if (totalDensity >= 100) {
    badges.push({
      id: "density-dust-holder",
      name: "Dust Holder",
      category: "Density",
      tier: 1,
      unlocked: true,
      description: "≥ 100 $DENSITY",
      icon: "dust-holder",
    })
  }
  if (totalDensity >= 1000) {
    badges.push({
      id: "density-weight-bearer",
      name: "Weight Bearer",
      category: "Density",
      tier: 2,
      unlocked: true,
      description: "≥ 1,000 $DENSITY",
      icon: "weight-bearer",
    })
  }
  if (totalDensity >= 10000) {
    badges.push({
      id: "density-mass-builder",
      name: "Mass Builder",
      category: "Density",
      tier: 3,
      unlocked: true,
      description: "≥ 10,000 $DENSITY",
      icon: "mass-builder",
    })
  }
  if (totalDensity >= 50000) {
    badges.push({
      id: "density-gravity-well",
      name: "Gravity Well",
      category: "Density",
      tier: 4,
      unlocked: true,
      description: "≥ 50,000 $DENSITY",
      icon: "gravity-well",
    })
  }
  if (totalDensity >= 100000) {
    badges.push({
      id: "density-singularity",
      name: "Singularity",
      category: "Density",
      tier: 5,
      unlocked: true,
      description: "≥ 100,000 $DENSITY",
      icon: "singularity",
    })
  }

  // Add locked higher tiers
  if (totalDensity < 100000) {
    badges.push({
      id: "density-singularity-locked",
      name: "Singularity",
      category: "Density",
      tier: 5,
      unlocked: false,
      description: "≥ 100,000 $DENSITY",
      icon: "singularity",
    })
  }
  if (totalDensity < 50000) {
    badges.push({
      id: "density-gravity-well-locked",
      name: "Gravity Well",
      category: "Density",
      tier: 4,
      unlocked: false,
      description: "≥ 50,000 $DENSITY",
      icon: "gravity-well",
    })
  }
  if (totalDensity < 10000) {
    badges.push({
      id: "density-mass-builder-locked",
      name: "Mass Builder",
      category: "Density",
      tier: 3,
      unlocked: false,
      description: "≥ 10,000 $DENSITY",
      icon: "mass-builder",
    })
  }
  if (totalDensity < 1000) {
    badges.push({
      id: "density-weight-bearer-locked",
      name: "Weight Bearer",
      category: "Density",
      tier: 2,
      unlocked: false,
      description: "≥ 1,000 $DENSITY",
      icon: "weight-bearer",
    })
  }
  if (totalDensity < 100) {
    badges.push({
      id: "density-dust-holder-locked",
      name: "Dust Holder",
      category: "Density",
      tier: 1,
      unlocked: false,
      description: "≥ 100 $DENSITY",
      icon: "dust-holder",
    })
  }

  return badges
}

/**
 * II. OLD ROCK NFT BADGES
 */
function calculateRockBadges(oldRockNFTs: any[]): Badge[] {
  const badges: Badge[] = []
  const count = oldRockNFTs.length

  // A. Rock Ownership Count - Show all tiers (unlocked and locked)
  if (count >= 1) {
    badges.push({
      id: "rock-pebble-keeper",
      name: "Pebble Keeper",
      category: "Rock Ownership",
      tier: 1,
      unlocked: true,
      description: "1 Rock",
      icon: "pebble-keeper",
    })
  } else {
    badges.push({
      id: "rock-pebble-keeper-locked",
      name: "Pebble Keeper",
      category: "Rock Ownership",
      tier: 1,
      unlocked: false,
      description: "1 Rock",
      icon: "pebble-keeper",
    })
  }
  if (count >= 3) {
    badges.push({
      id: "rock-stonebound",
      name: "Stonebound",
      category: "Rock Ownership",
      tier: 2,
      unlocked: true,
      description: "3 Rocks",
      icon: "stonebound",
    })
  } else {
    badges.push({
      id: "rock-stonebound-locked",
      name: "Stonebound",
      category: "Rock Ownership",
      tier: 2,
      unlocked: false,
      description: "3 Rocks",
      icon: "stonebound",
    })
  }
  if (count >= 5) {
    badges.push({
      id: "rock-collective",
      name: "Rock Collective",
      category: "Rock Ownership",
      tier: 3,
      unlocked: true,
      description: "5 Rocks",
      icon: "rock-collective",
    })
  } else {
    badges.push({
      id: "rock-collective-locked",
      name: "Rock Collective",
      category: "Rock Ownership",
      tier: 3,
      unlocked: false,
      description: "5 Rocks",
      icon: "rock-collective",
    })
  }
  if (count >= 10) {
    badges.push({
      id: "rock-lithic-council",
      name: "Lithic Council",
      category: "Rock Ownership",
      tier: 4,
      unlocked: true,
      description: "10+ Rocks",
      icon: "lithic-council",
    })
  } else {
    badges.push({
      id: "rock-lithic-council-locked",
      name: "Lithic Council",
      category: "Rock Ownership",
      tier: 4,
      unlocked: false,
      description: "10+ Rocks",
      icon: "lithic-council",
    })
  }

  // B. Rock REACTIVE Rarity
  const reactiveTypes = new Set<string>()
  const reactiveToColor: { [key: string]: string } = {} // Map reactive type to rock color

  // Color mapping for Old Rock types
  const colorMap: { [key: string]: string } = {
    Common: "#8B4513",
    Yellow: "#FFB000",
    Turquoise: "#40E0D0",
    Blue: "#0F52BA",
    Purple: "#9966CC",
    Red: "#E0115F",
    Silver: "#C0C0C0",
    Gold: "#FFD700",
    Aquamarine: "#7FFFD4",
    Black: "#000000",
    White: "#F8F8FF",
  }

  // Helper to get rock color from NFT
  const getRockColor = (nft: any): string | null => {
    const typeAttr = nft.attributes?.Type
    if (!typeAttr) return null

    let rockColor: string
    if (typeof typeAttr === 'string') {
      rockColor = typeAttr
    } else if (typeAttr?.value) {
      rockColor = typeAttr.value
    } else if (Array.isArray(typeAttr) && typeAttr.length > 0) {
      rockColor = typeAttr[0]?.value || typeAttr[0] || typeAttr
    } else {
      rockColor = String(typeAttr)
    }

    // Map to hex color
    return colorMap[rockColor] || colorMap[rockColor.toUpperCase()] || null
  }

  oldRockNFTs.forEach((nft) => {
    // Attributes are accessed as object properties (attributes.Reactive)
    // Can be: string, object with .value, or array
    const reactive = nft.attributes?.Reactive || nft.attributes?.reactive
    if (reactive) {
      let reactiveValue: string
      if (typeof reactive === 'string') {
        reactiveValue = reactive
      } else if (reactive?.value) {
        reactiveValue = reactive.value
      } else if (Array.isArray(reactive) && reactive.length > 0) {
        reactiveValue = reactive[0]?.value || reactive[0] || reactive
      } else {
        reactiveValue = String(reactive)
      }
      if (reactiveValue) {
        reactiveTypes.add(reactiveValue)

        // Get the rock's color and store it for this reactive type
        const rockColor = getRockColor(nft)
        if (rockColor) {
          // Store the color for this reactive type (use first one found)
          if (!reactiveToColor[reactiveValue]) {
            reactiveToColor[reactiveValue] = rockColor
          }
        }
      }
    }
  })

  const hasPure = reactiveTypes.has("Pure") || Array.from(reactiveTypes).some(r => r.includes("Pure"))
  const hasPolar = reactiveTypes.has("Polar") || Array.from(reactiveTypes).some(r => r.includes("Polar"))
  const hasRecurrent = reactiveTypes.has("Recurrent") || Array.from(reactiveTypes).some(r => r.includes("Recurrent"))

  // Show all reactive tiers (unlocked and locked)
  // Pure is highest, Polar is second highest, Recurrent is lowest
  if (hasPure) {
    badges.push({
      id: "rock-pure-reactor",
      name: "Pure Reactor",
      category: "Rock Reactive",
      tier: 3,
      unlocked: true,
      description: "Owns Pure reactive",
      icon: "pure-reactor",
      rockColor: reactiveToColor["Pure"] || reactiveToColor[Array.from(reactiveTypes).find(r => r.includes("Pure")) || ""] || "#F8F8FF",
    })
  } else {
    badges.push({
      id: "rock-pure-reactor-locked",
      name: "Pure Reactor",
      category: "Rock Reactive",
      tier: 3,
      unlocked: false,
      description: "Owns Pure reactive",
      icon: "pure-reactor",
    })
  }
  if (hasPolar) {
    badges.push({
      id: "rock-polar-reactor",
      name: "Polar Reactor",
      category: "Rock Reactive",
      tier: 2,
      unlocked: true,
      description: "Owns Polar reactive",
      icon: "polar-reactor",
      rockColor: reactiveToColor["Polar"] || reactiveToColor[Array.from(reactiveTypes).find(r => r.includes("Polar")) || ""] || "#0F52BA",
    })
  } else {
    badges.push({
      id: "rock-polar-reactor-locked",
      name: "Polar Reactor",
      category: "Rock Reactive",
      tier: 2,
      unlocked: false,
      description: "Owns Polar reactive",
      icon: "polar-reactor",
    })
  }
  if (hasRecurrent) {
    badges.push({
      id: "rock-recurrent-reactor",
      name: "Recurrent Reactor",
      category: "Rock Reactive",
      tier: 1,
      unlocked: true,
      description: "Owns Recurrent reactive",
      icon: "recurrent-reactor",
      // Get all Recurrent colors and pick one at random if multiple
      rockColor: (() => {
        const recurrentColors = Array.from(reactiveTypes)
          .filter(r => r.includes("Recurrent"))
          .map(r => reactiveToColor[r])
          .filter(c => c) // Remove undefined

        if (recurrentColors.length > 0) {
          // Pick random color if multiple, otherwise use the first one
          return recurrentColors[Math.floor(Math.random() * recurrentColors.length)]
        } else {
          // Fallback to any reactive color that includes "Recurrent"
          const fallbackColor = reactiveToColor[Array.from(reactiveTypes).find(r => r.includes("Recurrent")) || ""]
          return fallbackColor || "#E0115F"
        }
      })(),
    })
  } else {
    badges.push({
      id: "rock-recurrent-reactor-locked",
      name: "Recurrent Reactor",
      category: "Rock Reactive",
      tier: 1,
      unlocked: false,
      description: "Owns Recurrent reactive",
      icon: "recurrent-reactor",
    })
  }
  if (hasPure && hasPolar && hasRecurrent) {
    badges.push({
      id: "rock-tri-reactive-core",
      name: "Tri-Reactive",
      category: "Rock Reactive",
      tier: 5,
      unlocked: true,
      description: "Owns all three reactive types",
      icon: "tri-reactive-core",
    })
  } else {
    badges.push({
      id: "rock-tri-reactive-core-locked",
      name: "Tri-Reactive",
      category: "Rock Reactive",
      tier: 5,
      unlocked: false,
      description: "Owns all three reactive types",
      icon: "tri-reactive-core",
    })
  }

  // C. Rock DENSITY Rarity
  const densityTypes = new Set<string>()
  const densityToColor: { [key: string]: string } = {} // Map density type to rock color

  oldRockNFTs.forEach((nft) => {
    // Attributes are accessed as object properties (attributes.Density)
    // Can be: string, object with .value, or array
    const density = nft.attributes?.Density || nft.attributes?.density
    if (density) {
      let densityValue: string
      if (typeof density === 'string') {
        densityValue = density
      } else if (density?.value) {
        densityValue = density.value
      } else if (Array.isArray(density) && density.length > 0) {
        densityValue = density[0]?.value || density[0] || density
      } else {
        densityValue = String(density)
      }
      if (densityValue) {
        densityTypes.add(densityValue)

        // Get the rock's color and store it for this density type
        const rockColor = getRockColor(nft)
        if (rockColor && !densityToColor[densityValue]) {
          densityToColor[densityValue] = rockColor
        }
      }
    }
  })

  const hasLow = densityTypes.has("Low") || Array.from(densityTypes).some(d => d.includes("Low"))
  const hasMedium = densityTypes.has("Medium") || Array.from(densityTypes).some(d => d.includes("Medium"))
  const hasHigh = densityTypes.has("High") || Array.from(densityTypes).some(d => d.includes("High"))

  // Show all density tiers (unlocked and locked)
  if (hasLow) {
    const lowDensityColor = densityToColor["Low"] || densityToColor[Array.from(densityTypes).find(d => d.includes("Low")) || ""] || "#8B4513"
    badges.push({
      id: "rock-low-density-core",
      name: "Low Density",
      category: "Rock Density",
      tier: 1,
      unlocked: true,
      description: "Owns Low density",
      icon: "low-density-core",
      rockColor: lowDensityColor,
    })
  } else {
    badges.push({
      id: "rock-low-density-core-locked",
      name: "Low Density",
      category: "Rock Density",
      tier: 1,
      unlocked: false,
      description: "Owns Low density",
      icon: "low-density-core",
    })
  }
  if (hasMedium) {
    const mediumDensityColor = densityToColor["Medium"] || densityToColor[Array.from(densityTypes).find(d => d.includes("Medium")) || ""] || "#FFB000"
    badges.push({
      id: "rock-medium-density-core",
      name: "Medium Density",
      category: "Rock Density",
      tier: 2,
      unlocked: true,
      description: "Owns Medium density",
      icon: "medium-density-core",
      rockColor: mediumDensityColor,
    })
  } else {
    badges.push({
      id: "rock-medium-density-core-locked",
      name: "Medium Density",
      category: "Rock Density",
      tier: 2,
      unlocked: false,
      description: "Owns Medium density",
      icon: "medium-density-core",
    })
  }
  if (hasHigh) {
    const highDensityColor = densityToColor["High"] || densityToColor[Array.from(densityTypes).find(d => d.includes("High")) || ""] || "#3B82F6"
    badges.push({
      id: "rock-high-density-core",
      name: "High Density",
      category: "Rock Density",
      tier: 3,
      unlocked: true,
      description: "Owns High density",
      icon: "high-density-core",
      rockColor: highDensityColor,
    })
  } else {
    badges.push({
      id: "rock-high-density-core-locked",
      name: "High Density",
      category: "Rock Density",
      tier: 3,
      unlocked: false,
      description: "Owns High density",
      icon: "high-density-core",
    })
  }
  if (hasLow && hasMedium && hasHigh) {
    badges.push({
      id: "rock-full-spectrum-core",
      name: "Full Spectrum",
      category: "Rock Density",
      tier: 4,
      unlocked: true,
      description: "LOW + MEDIUM + HIGH",
      icon: "full-spectrum-core",
    })
  } else {
    badges.push({
      id: "rock-full-spectrum-core-locked",
      name: "Full Spectrum",
      category: "Rock Density",
      tier: 4,
      unlocked: false,
      description: "LOW + MEDIUM + HIGH",
      icon: "full-spectrum-core",
    })
  }

  // D. Rock Color Badges
  const rockColors = new Set<string>()
  oldRockNFTs.forEach((nft) => {
    // Attributes are accessed as object properties (attributes.Type)
    // Can be: string, object with .value, or array
    const typeAttr = nft.attributes?.Type
    if (typeAttr) {
      let color: string
      if (typeof typeAttr === 'string') {
        color = typeAttr
      } else if (typeAttr?.value) {
        color = typeAttr.value
      } else if (Array.isArray(typeAttr) && typeAttr.length > 0) {
        color = typeAttr[0]?.value || typeAttr[0] || typeAttr
      } else {
        color = String(typeAttr)
      }
      if (COLOR_NAMES.includes(color)) {
        rockColors.add(color)
      }
    }
  })

  COLOR_NAMES.forEach((color) => {
    if (rockColors.has(color)) {
      badges.push({
        id: `rock-color-${color.toLowerCase()}`,
        name: `${color} Rock`,
        category: "Rock Color",
        unlocked: true,
        description: `Owns ${color} Rock`,
        icon: `rock-${color.toLowerCase()}`,
      })
    } else {
      badges.push({
        id: `rock-color-${color.toLowerCase()}-locked`,
        name: `${color} Rock`,
        category: "Rock Color",
        unlocked: false,
        description: `Owns ${color} Rock`,
        icon: `rock-${color.toLowerCase()}`,
      })
    }
  })

  // Advanced color badges - Show all tiers unlocked
  if (rockColors.size >= 5) {
    badges.push({
      id: "rock-chromatic-rock",
      name: "Chromatic Rock",
      category: "Rock Color",
      tier: 1,
      unlocked: true,
      description: "5+ colors",
      icon: "chromatic-rock",
    })
  }
  if (rockColors.size >= 10) {
    badges.push({
      id: "rock-prismatic-rock",
      name: "Prismatic Rock",
      category: "Rock Color",
      tier: 2,
      unlocked: true,
      description: "All 10 colors",
      icon: "prismatic-rock",
    })
  }

  return badges
}

/**
 * III. GOLIATH NFT BADGES
 */
function calculateGoliathBadges(goliathNFTs: any[]): Badge[] {
  const badges: Badge[] = []
  const count = goliathNFTs.length

  // A. Goliath Ownership Count - Show all tiers (unlocked and locked)
  if (count >= 1) {
    badges.push({
      id: "goliath-first-goliath",
      name: "First Goliath",
      category: "Goliath Ownership",
      tier: 1,
      unlocked: true,
      description: "1 Goliath",
      icon: "first-goliath",
    })
  } else {
    badges.push({
      id: "goliath-first-goliath-locked",
      name: "First Goliath",
      category: "Goliath Ownership",
      tier: 1,
      unlocked: false,
      description: "1 Goliath",
      icon: "first-goliath",
    })
  }
  if (count >= 3) {
    badges.push({
      id: "goliath-goliath-guardian",
      name: "Goliath Guardian",
      category: "Goliath Ownership",
      tier: 2,
      unlocked: true,
      description: "3 Goliaths",
      icon: "goliath-guardian",
    })
  } else {
    badges.push({
      id: "goliath-goliath-guardian-locked",
      name: "Goliath Guardian",
      category: "Goliath Ownership",
      tier: 2,
      unlocked: false,
      description: "3 Goliaths",
      icon: "goliath-guardian",
    })
  }
  if (count >= 5) {
    badges.push({
      id: "goliath-commander",
      name: "Goliath Commander",
      category: "Goliath Ownership",
      tier: 3,
      unlocked: true,
      description: "5 Goliaths",
      icon: "goliath-commander",
    })
  } else {
    badges.push({
      id: "goliath-commander-locked",
      name: "Goliath Commander",
      category: "Goliath Ownership",
      tier: 3,
      unlocked: false,
      description: "5 Goliaths",
      icon: "goliath-commander",
    })
  }
  if (count >= 10) {
    badges.push({
      id: "goliath-legion",
      name: "Goliath Legion",
      category: "Goliath Ownership",
      tier: 4,
      unlocked: true,
      description: "10 Goliaths",
      icon: "goliath-legion",
    })
  } else {
    badges.push({
      id: "goliath-legion-locked",
      name: "Goliath Legion",
      category: "Goliath Ownership",
      tier: 4,
      unlocked: false,
      description: "10 Goliaths",
      icon: "goliath-legion",
    })
  }
  if (count >= 25) {
    badges.push({
      id: "goliath-titan",
      name: "Goliath Titan",
      category: "Goliath Ownership",
      tier: 5,
      unlocked: true,
      description: "25 Goliaths",
      icon: "goliath-titan",
    })
  } else {
    badges.push({
      id: "goliath-titan-locked",
      name: "Goliath Titan",
      category: "Goliath Ownership",
      tier: 5,
      unlocked: false,
      description: "25 Goliaths",
      icon: "goliath-titan",
    })
  }
  if (count >= 50) {
    badges.push({
      id: "goliath-apex",
      name: "Goliath Apex",
      category: "Goliath Ownership",
      tier: 6,
      unlocked: true,
      description: "50 Goliaths",
      icon: "goliath-apex",
    })
  } else {
    badges.push({
      id: "goliath-apex-locked",
      name: "Goliath Apex",
      category: "Goliath Ownership",
      tier: 6,
      unlocked: false,
      description: "50 Goliaths",
      icon: "goliath-apex",
    })
  }

  // Check if user has any Mystics (they override density tier)
  const hasMystic = goliathNFTs.some((nft) => {
    const name = nft.name || ""
    return MYSTIC_NAMES.some((mystic) => name.includes(mystic))
  })

  // B. Goliath DENSITY Tier (only if no Mystics)
  if (!hasMystic) {
    const densityTypes = new Set<string>()
    goliathNFTs.forEach((nft) => {
      // Attributes are accessed as object properties (attributes.Density)
      // Can be: string, object with .value, or array
      const density = nft.attributes?.Density || nft.attributes?.density
      if (density) {
        let densityValue: string
        if (typeof density === 'string') {
          densityValue = density
        } else if (density?.value) {
          densityValue = density.value
        } else if (Array.isArray(density) && density.length > 0) {
          densityValue = density[0]?.value || density[0] || density
        } else {
          densityValue = String(density)
        }
        if (densityValue) densityTypes.add(densityValue)
      }
    })

    // Show all density tiers (unlocked and locked)

    const hasLow = densityTypes.has("Low") || Array.from(densityTypes).some(d => d.includes("Low"))
    const hasMedium = densityTypes.has("Medium") || Array.from(densityTypes).some(d => d.includes("Medium"))
    const hasHigh = densityTypes.has("High") || Array.from(densityTypes).some(d => d.includes("High"))


    if (hasLow) {
      badges.push({
        id: "goliath-low-density",
        name: "Low Density Goliath",
        category: "Goliath Density",
        tier: 2,
        unlocked: true,
        description: "Owns Low density",
        icon: "low-density-goliath",
      })
    } else {
      badges.push({
        id: "goliath-low-density-locked",
        name: "Low Density Goliath",
        category: "Goliath Density",
        tier: 2,
        unlocked: false,
        description: "Owns Low density",
        icon: "low-density-goliath",
      })
    }
    if (hasMedium) {
      badges.push({
        id: "goliath-medium-density",
        name: "Medium Density Goliath",
        category: "Goliath Density",
        tier: 3,
        unlocked: true,
        description: "Owns Medium density",
        icon: "medium-density-goliath",
      })
    } else {
      badges.push({
        id: "goliath-medium-density-locked",
        name: "Medium Density Goliath",
        category: "Goliath Density",
        tier: 3,
        unlocked: false,
        description: "Owns Medium density",
        icon: "medium-density-goliath",
      })
    }
    if (hasHigh) {
      badges.push({
        id: "goliath-high-density",
        name: "High Density Goliath",
        category: "Goliath Density",
        tier: 4,
        unlocked: true,
        description: "Owns High density",
        icon: "high-density-goliath",
      })
    } else {
      badges.push({
        id: "goliath-high-density-locked",
        name: "High Density Goliath",
        category: "Goliath Density",
        tier: 4,
        unlocked: false,
        description: "Owns High density",
        icon: "high-density-goliath",
      })
    }
  }

  // C. Goliath Bounty Badges
  const bountyTypes = new Set<string>()
  goliathNFTs.forEach((nft) => {
    // Attributes are accessed as object properties (attributes.Bounty)
    // Can be: string, object with .value, or array
    const bounty = nft.attributes?.Bounty || nft.attributes?.bounty
    if (bounty) {
      let bountyValue: string
      if (typeof bounty === 'string') {
        bountyValue = bounty
      } else if (bounty?.value) {
        bountyValue = bounty.value
      } else if (Array.isArray(bounty) && bounty.length > 0) {
        bountyValue = bounty[0]?.value || bounty[0] || bounty
      } else {
        bountyValue = String(bounty)
      }
      if (bountyValue) {
        BOUNTY_NAMES.forEach((bountyName) => {
          if (bountyValue.includes(bountyName) || bountyName.includes(bountyValue)) {
            bountyTypes.add(bountyName)
          }
        })
      }
    }
  })

  BOUNTY_NAMES.forEach((bounty) => {
    if (bountyTypes.has(bounty)) {
      badges.push({
        id: `goliath-bounty-${bounty.toLowerCase().replace(/\s+/g, "-")}`,
        name: `Bounty: ${bounty}`,
        category: "Goliath Bounty",
        unlocked: true,
        description: `Owns ${bounty} bounty`,
        icon: `bounty-${bounty.toLowerCase().replace(/\s+/g, "-")}`,
      })
    } else {
      badges.push({
        id: `goliath-bounty-${bounty.toLowerCase().replace(/\s+/g, "-")}-locked`,
        name: `Bounty: ${bounty}`,
        category: "Goliath Bounty",
        unlocked: false,
        description: `Owns ${bounty} bounty`,
        icon: `bounty-${bounty.toLowerCase().replace(/\s+/g, "-")}`,
      })
    }
  })

  // Prestige bounty badges - Show all tiers unlocked
  if (bountyTypes.size >= 3) {
    badges.push({
      id: "goliath-multi-bounty-operator",
      name: "Multi-Bounty Operator",
      category: "Goliath Bounty",
      tier: 1,
      unlocked: true,
      description: "Owns 3+",
      icon: "multi-bounty-operator",
    })
  }
  if (bountyTypes.size >= 5) {
    badges.push({
      id: "goliath-all-bounties-claimed",
      name: "All Bounties Claimed",
      category: "Goliath Bounty",
      tier: 2,
      unlocked: true,
      description: "Owns all 5",
      icon: "all-bounties-claimed",
    })
  }

  // D. Goliath Color Badges
  const goliathColors = new Set<string>()
  goliathNFTs.forEach((nft) => {
    // Attributes can be in different formats:
    // 1. Array format: nft.attributes = [{ trait_type: "Goliath", value: "Yellow" }]
    // 2. Object format: nft.attributes = { Goliath: "Yellow" } or { Goliath: { value: "Yellow" } }
    // 3. Also check Type as fallback

    let colorAttr: any = null

    // Try array format first (most common from API)
    if (Array.isArray(nft.attributes)) {
      // First try "Goliath" attribute (primary)
      const goliathAttrObj = nft.attributes.find((attr: any) =>
        attr && (attr.trait_type === "Goliath" || attr.trait_type === "goliath" || attr.trait_type === "GOLIATH")
      )
      if (goliathAttrObj && goliathAttrObj.value) {
        colorAttr = goliathAttrObj.value
      } else {
        // Fallback to "Type" attribute
        const typeAttrObj = nft.attributes.find((attr: any) =>
          attr && (attr.trait_type === "Type" || attr.trait_type === "type" || attr.trait_type === "TYPE")
        )
        if (typeAttrObj && typeAttrObj.value) {
          colorAttr = typeAttrObj.value
        }
      }
    } else if (nft.attributes) {
      // Try object format - check "Goliath" first, then "Type" as fallback
      colorAttr = nft.attributes.Goliath || nft.attributes.goliath || nft.attributes.GOLIATH ||
        nft.attributes.Type || nft.attributes.type || nft.attributes.TYPE
    }

    if (colorAttr) {
      let color: string
      if (typeof colorAttr === 'string') {
        color = colorAttr
      } else if (colorAttr?.value) {
        color = colorAttr.value
      } else if (Array.isArray(colorAttr) && colorAttr.length > 0) {
        color = colorAttr[0]?.value || colorAttr[0] || String(colorAttr[0])
      } else {
        color = String(colorAttr)
      }
      // Normalize color name (capitalize first letter)
      if (color) {
        color = color.charAt(0).toUpperCase() + color.slice(1).toLowerCase()
        if (COLOR_NAMES.includes(color)) {
          goliathColors.add(color)
        }
      }
    }
  })

  COLOR_NAMES.forEach((color) => {
    if (goliathColors.has(color)) {
      badges.push({
        id: `goliath-color-${color.toLowerCase()}`,
        name: `${color} Goliath`,
        category: "Goliath Color",
        unlocked: true,
        description: `Owns ${color} Goliath`,
        icon: `goliath-${color.toLowerCase()}`,
      })
    } else {
      badges.push({
        id: `goliath-color-${color.toLowerCase()}-locked`,
        name: `${color} Goliath`,
        category: "Goliath Color",
        unlocked: false,
        description: `Owns ${color} Goliath`,
        icon: `goliath-${color.toLowerCase()}`,
      })
    }
  })

  // Advanced color badges - Show all tiers unlocked
  if (goliathColors.size >= 5) {
    badges.push({
      id: "goliath-chromatic-goliath",
      name: "Chromatic Goliath",
      category: "Goliath Color",
      tier: 1,
      unlocked: true,
      description: "5+ colors",
      icon: "chromatic-goliath",
    })
  }
  if (goliathColors.size >= 10) {
    badges.push({
      id: "goliath-primal-spectrum",
      name: "Primal Spectrum",
      category: "Goliath Color",
      tier: 2,
      unlocked: true,
      description: "All 10 colors",
      icon: "primal-spectrum",
    })
  }

  return badges
}

/**
 * IV. MYSTIC GOLIATH BADGES
 */
function calculateMysticBadges(goliathNFTs: any[]): Badge[] {
  const badges: Badge[] = []

  const ownedMystics = new Set<string>()
  const mysticBounties = new Map<string, string>() // mystic name -> bounty name

  goliathNFTs.forEach((nft) => {
    const name = nft.name || ""
    MYSTIC_NAMES.forEach((mystic) => {
      if (name.includes(mystic)) {
        ownedMystics.add(mystic)

        // Check for bounty
        const bounty = nft.attributes?.Bounty || nft.attributes?.bounty
        if (bounty) {
          // Handle string, object with .value, or array
          let bountyValue: string
          if (typeof bounty === 'string') {
            bountyValue = bounty
          } else if (bounty?.value) {
            bountyValue = bounty.value
          } else if (Array.isArray(bounty) && bounty.length > 0) {
            bountyValue = bounty[0]?.value || bounty[0] || bounty
          } else {
            bountyValue = String(bounty)
          }
          if (bountyValue) {
            BOUNTY_NAMES.forEach((bountyName) => {
              if (bountyValue.includes(bountyName) || bountyName.includes(bountyValue)) {
                mysticBounties.set(mystic, bountyName)
              }
            })
          }
        }
      }
    })
  })

  // A. Named Mystic Badges
  MYSTIC_NAMES.forEach((mystic) => {
    if (ownedMystics.has(mystic)) {
      badges.push({
        id: `mystic-${mystic.toLowerCase().replace(/\s+/g, "-")}`,
        name: mystic,
        category: "Mystic",
        unlocked: true,
        description: `Owns ${mystic}`,
        icon: `mystic-${mystic.toLowerCase().replace(/\s+/g, "-")}`,
      })
    } else {
      badges.push({
        id: `mystic-${mystic.toLowerCase().replace(/\s+/g, "-")}-locked`,
        name: mystic,
        category: "Mystic",
        unlocked: false,
        description: `Owns ${mystic}`,
        icon: `mystic-${mystic.toLowerCase().replace(/\s+/g, "-")}`,
      })
    }
  })

  // B. Mystic Base Prestige (always visible if any Mystic owned)
  if (ownedMystics.size > 0) {
    badges.push({
      id: "mystic-one-of-the-mystics",
      name: "One of the Mystics",
      category: "Mystic Prestige",
      tier: 0,
      unlocked: true,
      description: "Automatically granted if any Mystic is owned",
      icon: "one-of-the-mystics",
    })
  }

  // C. Mystic + Bounty Hybrid Badges
  mysticBounties.forEach((bounty, mystic) => {
    badges.push({
      id: `mystic-hybrid-${mystic.toLowerCase().replace(/\s+/g, "-")}-${bounty.toLowerCase().replace(/\s+/g, "-")}`,
      name: `${mystic} — ${bounty}`,
      category: "Mystic Hybrid",
      tier: 10, // Highest tier
      unlocked: true,
      description: `Rarest badges in the ecosystem`,
      icon: `mystic-hybrid-${mystic.toLowerCase().replace(/\s+/g, "-")}`,
    })
  })

  // D. Mystic Color Badges (check for Gold, Black, White Mystics)
  goliathNFTs.forEach((nft) => {
    const name = nft.name || ""
    const isMystic = MYSTIC_NAMES.some((mystic) => name.includes(mystic))
    if (isMystic) {
      const typeAttr = nft.attributes?.Type
      if (typeAttr) {
        // Handle string, object with .value, or array
        let color: string
        if (typeof typeAttr === 'string') {
          color = typeAttr
        } else if (typeAttr?.value) {
          color = typeAttr.value
        } else if (Array.isArray(typeAttr) && typeAttr.length > 0) {
          color = typeAttr[0]?.value || typeAttr[0] || typeAttr
        } else {
          color = String(typeAttr)
        }
        if (["Gold", "Black", "White"].includes(color)) {
          badges.push({
            id: `mystic-color-${color.toLowerCase()}`,
            name: `${color} Mystic`,
            category: "Mystic Color",
            unlocked: true,
            description: `Owns ${color} Mystic`,
            icon: `mystic-${color.toLowerCase()}`,
          })
        }
      }
    }
  })

  return badges
}

/**
 * V. CROSS-ECOSYSTEM PRESTIGE BADGES
 */
function calculatePrestigeBadges(data: BadgeData): Badge[] {
  const badges: Badge[] = []
  const { totalDensity, oldRockNFTs, goliathNFTs } = data

  // A. Density Aligned
  // Requires: Any $DENSITY balance (> 0), at least 1 Rock, and at least 1 Goliath
  if (totalDensity >= 0.01 && oldRockNFTs.length >= 1 && goliathNFTs.length >= 1) {
    badges.push({
      id: "prestige-density-aligned",
      name: "Density Aligned",
      category: "Prestige",
      tier: 1,
      unlocked: true,
      description: "Holds $DENSITY, owns ≥ 1 Rock, owns ≥ 1 Goliath",
      icon: "density-aligned",
    })
  } else {
    badges.push({
      id: "prestige-density-aligned-locked",
      name: "Density Aligned",
      category: "Prestige",
      tier: 1,
      unlocked: false,
      description: "Holds $DENSITY, owns ≥ 1 Rock, owns ≥ 1 Goliath",
      icon: "density-aligned",
    })
  }

  // B. Ecosystem Pillar
  if (totalDensity >= 10000 && oldRockNFTs.length >= 3 && goliathNFTs.length >= 10) {
    badges.push({
      id: "prestige-ecosystem-pillar",
      name: "Ecosystem Pillar",
      category: "Prestige",
      tier: 2,
      unlocked: true,
      description: "≥ 10,000 $DENSITY, ≥ 3 Rocks, ≥ 10 Goliaths",
      icon: "ecosystem-pillar",
    })
  } else {
    badges.push({
      id: "prestige-ecosystem-pillar-locked",
      name: "Ecosystem Pillar",
      category: "Prestige",
      tier: 2,
      unlocked: false,
      description: "≥ 10,000 $DENSITY, ≥ 3 Rocks, ≥ 10 Goliaths",
      icon: "ecosystem-pillar",
    })
  }

  return badges
}

/**
 * Get the best 4 badges to display (prioritizing unlocked, highest tier, Mystics first)
 * Only shows the highest $DENSITY badge (not all density badges)
 */
export function getBestBadges(badges: Badge[]): Badge[] {
  // Explicit priority order from most important (highest number) to least important (lowest number)
  // Based on user-specified hierarchy
  const badgePriority: { [key: string]: number } = {
    // Top tier - Tri-reactive
    "rock-tri-reactive-core": 1000,

    // Mystics (same order as rock colors)
    "mystic-agricola-stone": 990,
    "mystic-kalki": 989,
    "mystic-bulooma": 988,
    "mystic-pubian": 987,
    "mystic-nootau": 986,
    "mystic-sanskai": 985,
    "mystic-djup": 984,
    "mystic-sirinan": 983,
    "mystic-cemi": 982,
    "mystic-nebu": 981,
    "mystic-belarang": 980,

    // Full spectrum
    "rock-full-spectrum-core": 970,

    // Pure reactor
    "rock-pure-reactor": 960,

    // Polar reactor
    "rock-polar-reactor": 950,

    // High density rock
    "rock-high-density-core": 940,

    // Rock colors (white, black first)
    "rock-color-white": 930,
    "rock-color-black": 920,

    // Lithic Council (10+ Rocks)
    "rock-lithic-council": 910,

    // Bounties (Unknown > Archon > Reaper > Siren > Silverstrike)
    "goliath-bounty-unknown": 905,
    "goliath-bounty-the-archon": 904,
    "goliath-bounty-the-reaper": 903,
    "goliath-bounty-the-siren": 902,
    "goliath-bounty-silverstrike": 901,

    // Recurrent reactor
    "rock-recurrent-reactor": 890,

    // Medium density rock
    "rock-medium-density-core": 880,

    // Aquamarine rock
    "rock-color-aquamarine": 870,

    // Ecosystem Pillar
    "prestige-ecosystem-pillar": 860,

    // High density Goliath
    "goliath-high-density": 850,

    // Singularity ($DENSITY)
    "density-singularity": 840,

    // Chromatic rock
    "rock-chromatic-rock": 830,

    // Goliath ownership 50
    "goliath-apex": 820,

    // Rock collective
    "rock-collective": 810,

    // Gold rock
    "rock-color-gold": 800,

    // Silver rock
    "rock-color-silver": 790,

    // Stonebound (3 Rocks)
    "rock-stonebound": 780,

    // Gravity Well ($DENSITY)
    "density-gravity-well": 770,

    // Goliath ownership 25
    "goliath-titan": 760,

    // Density Aligned
    "prestige-density-aligned": 750,

    // Low density rock
    "rock-low-density-core": 740,

    // Remaining rock colors
    "rock-color-purple": 730,
    "rock-color-blue": 720,
    "rock-color-red": 710,
    "rock-color-turquoise": 700,
    "rock-color-yellow": 690,

    // Goliath colors (black, white first)
    "goliath-color-black": 680,
    "goliath-color-white": 670,

    // Mass Builder ($DENSITY)
    "density-mass-builder": 660,

    // Chromatic Goliath
    "goliath-chromatic-goliath": 650,

    // Goliath ownership 10
    "goliath-legion": 640,

    // Goliath ownership 5
    "goliath-commander": 630,

    // Medium Density Goliath
    "goliath-medium-density": 620,

    // Goliath ownership 3
    "goliath-goliath-guardian": 610,

    // Remaining Goliath colors
    "goliath-color-aquamarine": 600,
    "goliath-color-gold": 590,
    "goliath-color-silver": 580,

    // Weight Bearer ($DENSITY)
    "density-weight-bearer": 570,

    // Low Density Goliath
    "goliath-low-density": 560,

    // Remaining Goliath colors
    "goliath-color-purple": 550,
    "goliath-color-blue": 540,
    "goliath-color-red": 530,
    "goliath-color-turquoise": 520,
    "goliath-color-yellow": 510,

    // Goliath ownership 1
    "goliath-first-goliath": 500,

    // Dust Holder ($DENSITY)
    "density-dust-holder": 490,

    // Pebble Keeper (1 Rock) - not in user's list but should be low
    "rock-pebble-keeper": 480,

    // Prismatic badges (all colors collected)
    "rock-prismatic-rock": 475,
    "goliath-primal-spectrum": 470,

    // Multi-bounty badges
    "goliath-all-bounties-claimed": 465,
    "goliath-multi-bounty-operator": 460,
  }

  // Get priority for a badge, returning 0 for unspecified badges
  const getPriority = (badge: Badge): number => {
    return badgePriority[badge.id] || 0
  }

  // Filter to only unlocked badges
  const unlockedBadges = badges.filter(b => b.unlocked)

  // Sort by priority (highest first)
  const sorted = [...unlockedBadges].sort((a, b) => {
    const priorityA = getPriority(a)
    const priorityB = getPriority(b)

    // Higher priority first
    if (priorityA !== priorityB) {
      return priorityB - priorityA
    }

    // Fallback: by tier (higher first)
    const tierA = a.tier || 0
    const tierB = b.tier || 0
    return tierB - tierA
  })

  // Return top 4
  return sorted.slice(0, 4)
}

