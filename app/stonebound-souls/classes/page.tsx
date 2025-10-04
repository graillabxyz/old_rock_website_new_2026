"use client"

import { Header } from "@/components/header"
import { CyberpunkBackground } from "@/components/cyberpunk-background"
import { Sidebar } from "@/components/sidebar"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import Image from "next/image"
import {
  ArrowLeft,
  Zap,
  Shield,
  Heart,
  Sword,
  Eye,
  Target,
  Users,
  Clock,
  Skull,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Star,
  Flame,
  Droplets,
} from "lucide-react"
import Link from "next/link"

interface AbilityMechanic {
  title: string
  description: string
  icon: any
  color: string
  type: "damage" | "effect" | "utility" | "defensive"
}

interface CorruptionEffect {
  level: number
  name: string
  description: string
  effect: string
  icon: any
  color: string
}

interface ClassData {
  id: string
  name: string
  description: string
  image: string
  color: string
  gradient: string
  icon: any
  stats: {
    health: number
    damage: number
    speed: number
    defense: number
  }
  abilities: {
    name: string
    type: "active" | "passive"
    cooldown?: number
    description: string
    icon: any
    mechanics: AbilityMechanic[]
  }[]
  corruption: {
    description: string
    effects: CorruptionEffect[]
    resistance: number
  }
  playstyle: string[]
  strengths: string[]
  weaknesses: string[]
}

const classesData: ClassData[] = [
  {
    id: "fighter",
    name: "Fighter",
    description: "Masters of close combat and battlefield control",
    image: "/images/classes/fighter_class_final.webp",
    color: "#DC2626",
    gradient: "from-red-600 to-red-800",
    icon: Sword,
    stats: {
      health: 95,
      damage: 85,
      speed: 60,
      defense: 90,
    },
    abilities: [
      {
        name: "Berserker Rage",
        type: "active",
        cooldown: 45,
        description: "Channel primal fury to devastate enemies",
        icon: Flame,
        mechanics: [
          {
            title: "Damage Amplification",
            description: "+50% damage to all attacks",
            icon: TrendingUp,
            color: "#DC2626",
            type: "damage",
          },
          {
            title: "Defense Reduction",
            description: "-30% damage resistance",
            icon: TrendingDown,
            color: "#EF4444",
            type: "effect",
          },
          {
            title: "Duration",
            description: "15 seconds active time",
            icon: Clock,
            color: "#F97316",
            type: "utility",
          },
          {
            title: "Stacking Effect",
            description: "Each kill extends duration by 3s",
            icon: Star,
            color: "#FBBF24",
            type: "effect",
          },
        ],
      },
      {
        name: "Shield Wall",
        type: "active",
        cooldown: 30,
        description: "Create an impenetrable barrier",
        icon: Shield,
        mechanics: [
          {
            title: "Damage Block",
            description: "Blocks 100% frontal damage",
            icon: Shield,
            color: "#059669",
            type: "defensive",
          },
          {
            title: "Area Protection",
            description: "3m radius behind fighter",
            icon: Users,
            color: "#10B981",
            type: "utility",
          },
          {
            title: "Movement Penalty",
            description: "-75% movement speed",
            icon: TrendingDown,
            color: "#EF4444",
            type: "effect",
          },
          {
            title: "Health Scaling",
            description: "Shield HP = 50% of max health",
            icon: Heart,
            color: "#EC4899",
            type: "defensive",
          },
        ],
      },
      {
        name: "Combat Veteran",
        type: "passive",
        description: "Experience makes you stronger",
        icon: Target,
        mechanics: [
          {
            title: "Damage Reduction",
            description: "+10% per enemy defeated",
            icon: Shield,
            color: "#059669",
            type: "defensive",
          },
          {
            title: "Maximum Stacks",
            description: "Up to 5 stacks (50% reduction)",
            icon: Star,
            color: "#FBBF24",
            type: "effect",
          },
          {
            title: "Stack Duration",
            description: "Permanent until death",
            icon: Clock,
            color: "#8B5CF6",
            type: "utility",
          },
          {
            title: "Reset Condition",
            description: "Stacks lost on respawn",
            icon: Skull,
            color: "#6B7280",
            type: "effect",
          },
        ],
      },
    ],
    corruption: {
      description: "Fighters resist corruption through sheer willpower and physical conditioning",
      resistance: 75,
      effects: [
        {
          level: 25,
          name: "Battle Scars",
          description: "Corruption manifests as visible wounds",
          effect: "-5% max health, +10% intimidation",
          icon: Sword,
          color: "#DC2626",
        },
        {
          level: 50,
          name: "Bloodlust",
          description: "Uncontrollable urge to fight",
          effect: "Cannot retreat from combat, +15% damage",
          icon: Flame,
          color: "#EF4444",
        },
        {
          level: 75,
          name: "Berserker's Curse",
          description: "Rage becomes permanent",
          effect: "Always in berserker state, -50% defense",
          icon: Skull,
          color: "#7F1D1D",
        },
        {
          level: 100,
          name: "Corrupted Warrior",
          description: "Complete loss of humanity",
          effect: "Attacks allies, immune to healing",
          icon: AlertTriangle,
          color: "#450A0A",
        },
      ],
    },
    playstyle: ["Frontline Tank", "Damage Dealer", "Area Control"],
    strengths: ["High survivability", "Strong melee damage", "Crowd control"],
    weaknesses: ["Limited range", "Vulnerable to magic", "Slow movement"],
  },
  {
    id: "caster",
    name: "Caster",
    description: "Wielders of arcane magic and elemental forces",
    image: "/images/classes/caster_class_final.webp",
    color: "#7C3AED",
    gradient: "from-purple-600 to-purple-800",
    icon: Zap,
    stats: {
      health: 60,
      damage: 95,
      speed: 70,
      defense: 45,
    },
    abilities: [
      {
        name: "Arcane Blast",
        type: "active",
        cooldown: 8,
        description: "Launch devastating magical projectiles",
        icon: Zap,
        mechanics: [
          {
            title: "Piercing Damage",
            description: "Hits all enemies in line",
            icon: Target,
            color: "#7C3AED",
            type: "damage",
          },
          {
            title: "Damage Scaling",
            description: "150% spell power + 50 base",
            icon: TrendingUp,
            color: "#8B5CF6",
            type: "damage",
          },
          {
            title: "Mana Cost",
            description: "25 mana per cast",
            icon: Droplets,
            color: "#3B82F6",
            type: "utility",
          },
          {
            title: "Cast Time",
            description: "1.5 second channel",
            icon: Clock,
            color: "#F97316",
            type: "utility",
          },
        ],
      },
      {
        name: "Teleport",
        type: "active",
        cooldown: 20,
        description: "Instantly relocate across the battlefield",
        icon: Eye,
        mechanics: [
          {
            title: "Range",
            description: "15 meter maximum distance",
            icon: Target,
            color: "#7C3AED",
            type: "utility",
          },
          {
            title: "Line of Sight",
            description: "Must see destination clearly",
            icon: Eye,
            color: "#8B5CF6",
            type: "utility",
          },
          {
            title: "Invulnerability",
            description: "0.5s immunity during teleport",
            icon: Shield,
            color: "#059669",
            type: "defensive",
          },
          {
            title: "Mana Cost",
            description: "40 mana per use",
            icon: Droplets,
            color: "#3B82F6",
            type: "utility",
          },
        ],
      },
      {
        name: "Mana Shield",
        type: "passive",
        description: "Convert damage to mana consumption",
        icon: Shield,
        mechanics: [
          {
            title: "Damage Conversion",
            description: "30% damage becomes mana cost",
            icon: Shield,
            color: "#059669",
            type: "defensive",
          },
          {
            title: "Mana Efficiency",
            description: "2 mana per 1 damage absorbed",
            icon: Droplets,
            color: "#3B82F6",
            type: "utility",
          },
          {
            title: "Deactivation",
            description: "Turns off when mana < 20%",
            icon: AlertTriangle,
            color: "#EF4444",
            type: "effect",
          },
          {
            title: "Spell Power Bonus",
            description: "+1% spell power per 10 max mana",
            icon: TrendingUp,
            color: "#8B5CF6",
            type: "damage",
          },
        ],
      },
    ],
    corruption: {
      description: "Magic users are highly susceptible to corruption through their connection to arcane forces",
      resistance: 25,
      effects: [
        {
          level: 25,
          name: "Arcane Whispers",
          description: "Voices from beyond cloud judgment",
          effect: "-10% accuracy, +5% spell power",
          icon: Eye,
          color: "#7C3AED",
        },
        {
          level: 50,
          name: "Unstable Magic",
          description: "Spells become unpredictable",
          effect: "20% chance spells backfire, +20% damage",
          icon: Zap,
          color: "#8B5CF6",
        },
        {
          level: 75,
          name: "Void Touched",
          description: "Body begins to fade from reality",
          effect: "-30% max health, phase through walls",
          icon: Skull,
          color: "#6366F1",
        },
        {
          level: 100,
          name: "Arcane Wraith",
          description: "Become a creature of pure magic",
          effect: "Immune to physical damage, drain ally mana",
          icon: AlertTriangle,
          color: "#4338CA",
        },
      ],
    },
    playstyle: ["Long Range", "Burst Damage", "Mobility"],
    strengths: ["High damage output", "Versatile spells", "Good mobility"],
    weaknesses: ["Low health", "Mana dependent", "Weak in melee"],
  },
  {
    id: "healer",
    name: "Healer",
    description: "Divine support specialists and team sustainers",
    image: "/images/classes/healer_class_final.webp",
    color: "#059669",
    gradient: "from-emerald-600 to-emerald-800",
    icon: Heart,
    stats: {
      health: 75,
      damage: 55,
      speed: 80,
      defense: 70,
    },
    abilities: [
      {
        name: "Greater Heal",
        type: "active",
        cooldown: 12,
        description: "Channel divine energy to restore health",
        icon: Heart,
        mechanics: [
          {
            title: "Healing Amount",
            description: "60% of target's max health",
            icon: Heart,
            color: "#059669",
            type: "utility",
          },
          {
            title: "Cast Time",
            description: "2 second channel (interruptible)",
            icon: Clock,
            color: "#F97316",
            type: "utility",
          },
          {
            title: "Range",
            description: "12 meter maximum distance",
            icon: Target,
            color: "#10B981",
            type: "utility",
          },
          {
            title: "Overheal",
            description: "Excess healing becomes shield",
            icon: Shield,
            color: "#34D399",
            type: "defensive",
          },
        ],
      },
      {
        name: "Divine Protection",
        type: "active",
        cooldown: 60,
        description: "Grant temporary invulnerability",
        icon: Shield,
        mechanics: [
          {
            title: "Immunity Duration",
            description: "5 seconds complete protection",
            icon: Shield,
            color: "#059669",
            type: "defensive",
          },
          {
            title: "Movement Penalty",
            description: "-50% movement speed",
            icon: TrendingDown,
            color: "#EF4444",
            type: "effect",
          },
          {
            title: "Action Restriction",
            description: "Cannot attack while protected",
            icon: Sword,
            color: "#6B7280",
            type: "effect",
          },
          {
            title: "Dispel Vulnerability",
            description: "Can be removed by corruption",
            icon: AlertTriangle,
            color: "#F59E0B",
            type: "effect",
          },
        ],
      },
      {
        name: "Regeneration Aura",
        type: "passive",
        description: "Continuously heal nearby allies",
        icon: Users,
        mechanics: [
          {
            title: "Healing Rate",
            description: "2% max health per second",
            icon: Heart,
            color: "#059669",
            type: "utility",
          },
          {
            title: "Aura Radius",
            description: "8 meter area of effect",
            icon: Users,
            color: "#10B981",
            type: "utility",
          },
          {
            title: "Self Healing",
            description: "Healer receives 50% effect",
            icon: Heart,
            color: "#34D399",
            type: "utility",
          },
          {
            title: "Corruption Cleanse",
            description: "Reduces corruption by 1% per minute",
            icon: Droplets,
            color: "#6EE7B7",
            type: "utility",
          },
        ],
      },
    ],
    corruption: {
      description: "Divine connection provides moderate resistance, but corruption can twist healing into harm",
      resistance: 60,
      effects: [
        {
          level: 25,
          name: "Tainted Light",
          description: "Divine magic becomes unstable",
          effect: "10% chance heals become damage",
          icon: Heart,
          color: "#059669",
        },
        {
          level: 50,
          name: "False Prophet",
          description: "Healing draws from dark sources",
          effect: "Heals corrupt the target (+5 corruption)",
          icon: Skull,
          color: "#10B981",
        },
        {
          level: 75,
          name: "Plague Bearer",
          description: "Presence spreads disease",
          effect: "Aura damages instead of heals",
          icon: AlertTriangle,
          color: "#047857",
        },
        {
          level: 100,
          name: "Corrupted Saint",
          description: "Become an agent of suffering",
          effect: "All abilities harm allies instead",
          icon: Skull,
          color: "#064E3B",
        },
      ],
    },
    playstyle: ["Support", "Team Buffer", "Sustain"],
    strengths: ["Team support", "Damage mitigation", "Utility spells"],
    weaknesses: ["Low damage", "Target priority", "Team dependent"],
  },
  {
    id: "rogue",
    name: "Rogue",
    description: "Stealthy assassins and precision strike experts",
    image: "/images/classes/rogue_class_final.webp",
    color: "#6B7280",
    gradient: "from-gray-700 to-gray-900",
    icon: Target,
    stats: {
      health: 70,
      damage: 90,
      speed: 95,
      defense: 50,
    },
    abilities: [
      {
        name: "Stealth",
        type: "active",
        cooldown: 25,
        description: "Become one with the shadows",
        icon: Eye,
        mechanics: [
          {
            title: "Invisibility",
            description: "8 seconds completely hidden",
            icon: Eye,
            color: "#6B7280",
            type: "utility",
          },
          {
            title: "Critical Strike",
            description: "Next attack deals 200% damage",
            icon: Target,
            color: "#DC2626",
            type: "damage",
          },
          {
            title: "Movement Bonus",
            description: "+50% movement speed",
            icon: TrendingUp,
            color: "#10B981",
            type: "utility",
          },
          {
            title: "Detection Risk",
            description: "Attacking or taking damage breaks stealth",
            icon: AlertTriangle,
            color: "#F59E0B",
            type: "effect",
          },
        ],
      },
      {
        name: "Poison Blade",
        type: "active",
        cooldown: 15,
        description: "Coat weapons with deadly toxins",
        icon: Droplets,
        mechanics: [
          {
            title: "Poison Duration",
            description: "Next 3 attacks apply poison",
            icon: Sword,
            color: "#059669",
            type: "effect",
          },
          {
            title: "Damage Over Time",
            description: "10 damage per second for 8 seconds",
            icon: TrendingDown,
            color: "#DC2626",
            type: "damage",
          },
          {
            title: "Stack Limit",
            description: "Maximum 3 poison stacks per target",
            icon: Star,
            color: "#F59E0B",
            type: "effect",
          },
          {
            title: "Healing Reduction",
            description: "-50% healing received while poisoned",
            icon: Heart,
            color: "#EF4444",
            type: "effect",
          },
        ],
      },
      {
        name: "Evasion",
        type: "passive",
        description: "Supernatural reflexes and agility",
        icon: Zap,
        mechanics: [
          {
            title: "Dodge Chance",
            description: "25% chance to avoid attacks",
            icon: Shield,
            color: "#6B7280",
            type: "defensive",
          },
          {
            title: "Perfect Dodge",
            description: "Dodging grants 2s of +20% damage",
            icon: TrendingUp,
            color: "#10B981",
            type: "damage",
          },
          {
            title: "Area Attacks",
            description: "Cannot dodge explosions or magic",
            icon: AlertTriangle,
            color: "#EF4444",
            type: "effect",
          },
          {
            title: "Stamina Cost",
            description: "Each dodge consumes 10 stamina",
            icon: TrendingDown,
            color: "#F59E0B",
            type: "utility",
          },
        ],
      },
    ],
    corruption: {
      description: "Rogues' exposure to darkness and forbidden knowledge makes them vulnerable to corruption",
      resistance: 40,
      effects: [
        {
          level: 25,
          name: "Shadow Touched",
          description: "Darkness clings to your form",
          effect: "+10% stealth duration, -5% light resistance",
          icon: Eye,
          color: "#6B7280",
        },
        {
          level: 50,
          name: "Poisoned Mind",
          description: "Toxins affect your thoughts",
          effect: "Poison abilities affect allies too",
          icon: Droplets,
          color: "#374151",
        },
        {
          level: 75,
          name: "Assassin's Curse",
          description: "Compelled to kill indiscriminately",
          effect: "Cannot distinguish friend from foe",
          icon: Target,
          color: "#1F2937",
        },
        {
          level: 100,
          name: "Shadow Wraith",
          description: "Become a creature of pure darkness",
          effect: "Permanently invisible, drain life from all nearby",
          icon: Skull,
          color: "#111827",
        },
      ],
    },
    playstyle: ["Stealth", "Burst Damage", "Hit & Run"],
    strengths: ["High mobility", "Critical strikes", "Stealth tactics"],
    weaknesses: ["Low defense", "Positioning crucial", "Cooldown dependent"],
  },
]

export default function ClassesPage() {
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null)
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)

  // Check wallet connection
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" })
          if (accounts.length > 0) {
            setIsWalletConnected(true)
            setUserProfile({ address: accounts[0] })
          }
        } catch (error) {
          console.error("Error checking wallet connection:", error)
        }
      }
    }
    checkWalletConnection()
  }, [])

  const StatBar = ({
    label,
    value,
    max = 100,
    color,
  }: { label: string; value: number; max?: number; color: string }) => (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-300 font-pt-mono">{label}</span>
        <span className="text-white font-pt-mono font-bold">{value}</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div
          className="h-2 rounded-full transition-all duration-500"
          style={{
            width: `${(value / max) * 100}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  )

  const MechanicBox = ({ mechanic }: { mechanic: AbilityMechanic }) => (
    <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700/30 hover:border-gray-600/50 transition-all duration-200">
      <div className="flex items-start space-x-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${mechanic.color}20`, border: `1px solid ${mechanic.color}40` }}
        >
          <mechanic.icon className="w-4 h-4" style={{ color: mechanic.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <h5 className="font-montserrat font-bold text-white text-sm mb-1">{mechanic.title}</h5>
          <p className="text-gray-300 text-xs font-pt-mono leading-relaxed">{mechanic.description}</p>
        </div>
      </div>
    </div>
  )

  const CorruptionBox = ({ effect }: { effect: CorruptionEffect }) => (
    <div className="bg-gray-900/50 rounded-lg p-4 border border-red-900/30 hover:border-red-800/50 transition-all duration-200">
      <div className="flex items-start space-x-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${effect.color}20`, border: `1px solid ${effect.color}40` }}
        >
          <effect.icon className="w-5 h-5" style={{ color: effect.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h5 className="font-montserrat font-bold text-white text-sm">{effect.name}</h5>
            <span className="px-2 py-1 bg-red-500/20 text-red-300 text-xs font-pt-mono rounded">{effect.level}%</span>
          </div>
          <p className="text-gray-300 text-xs font-pt-mono mb-2 leading-relaxed">{effect.description}</p>
          <div className="bg-red-900/20 rounded px-2 py-1">
            <p className="text-red-300 text-xs font-pt-mono font-bold">{effect.effect}</p>
          </div>
        </div>
      </div>
    </div>
  )

  const AbilityCard = ({ ability, classColor }: { ability: any; classColor: string }) => (
    <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-200">
      <div className="flex items-start space-x-4 mb-4">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${classColor}20`, border: `1px solid ${classColor}40` }}
        >
          <ability.icon className="w-6 h-6" style={{ color: classColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-montserrat font-bold text-white text-lg">{ability.name}</h4>
            <div className="flex items-center space-x-2">
              {ability.type === "active" && (
                <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-pt-mono rounded-full">ACTIVE</span>
              )}
              {ability.type === "passive" && (
                <span className="px-3 py-1 bg-green-500/20 text-green-300 text-xs font-pt-mono rounded-full">
                  PASSIVE
                </span>
              )}
            </div>
          </div>
          {ability.cooldown && (
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400 font-pt-mono">{ability.cooldown}s cooldown</span>
            </div>
          )}
          <p className="text-gray-300 text-sm font-pt-mono leading-relaxed mb-4">{ability.description}</p>
        </div>
      </div>

      {/* Mechanics Grid */}
      <div className="space-y-3">
        <h5 className="text-sm font-montserrat font-bold text-white uppercase tracking-wide">Mechanics</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ability.mechanics.map((mechanic: AbilityMechanic, index: number) => (
            <MechanicBox key={index} mechanic={mechanic} />
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex">
      <Sidebar isWalletConnected={isWalletConnected} userProfile={userProfile} />
      <div className="min-h-screen text-white overflow-hidden relative w-full ml-[79px]">
        <CyberpunkBackground />
        <Header />

        {/* Back Button */}
        <div className="absolute top-24 left-6 z-30">
          <Link href="/stonebound-souls">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-2 text-white hover:bg-black/30 transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-pt-mono text-sm">Back to Stonebound Souls</span>
            </motion.button>
          </Link>
        </div>

        <main className="relative z-20 pt-32 pb-20">
          <div className="max-w-7xl mx-auto px-6">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
              <h1 className="text-5xl md:text-6xl font-black font-montserrat mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                CHOOSE YOUR CLASS
              </h1>
              <p className="text-xl text-gray-300 font-pt-mono max-w-2xl mx-auto">
                Master unique abilities and survive the corruption that plagues the Stonebound realm
              </p>
            </motion.div>

            {!selectedClass ? (
              /* Class Selection Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {classesData.map((classData, index) => (
                  <motion.div
                    key={classData.id}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setSelectedClass(classData)}
                    className="group cursor-pointer"
                  >
                    <div className="relative bg-gray-900/50 rounded-2xl overflow-hidden border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:scale-105">
                      {/* Class Image */}
                      <div className="aspect-[3/4] relative overflow-hidden">
                        <Image
                          src={classData.image || "/placeholder.svg"}
                          alt={classData.name}
                          width={300}
                          height={400}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div
                          className={`absolute inset-0 bg-gradient-to-t ${classData.gradient} opacity-20 group-hover:opacity-30 transition-opacity duration-300`}
                        />
                      </div>

                      {/* Class Info */}
                      <div className="p-6">
                        <div className="flex items-center space-x-3 mb-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{
                              backgroundColor: `${classData.color}20`,
                              border: `1px solid ${classData.color}40`,
                            }}
                          >
                            <classData.icon className="w-5 h-5" style={{ color: classData.color }} />
                          </div>
                          <h3 className="text-2xl font-black font-montserrat text-white">{classData.name}</h3>
                        </div>
                        <p className="text-gray-300 font-pt-mono text-sm leading-relaxed mb-4">
                          {classData.description}
                        </p>

                        {/* Quick Stats Preview */}
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          <div className="text-center p-2 bg-gray-800/30 rounded-lg">
                            <div className="text-lg font-bold text-white">{classData.stats.health}</div>
                            <div className="text-xs text-gray-400 font-pt-mono">HEALTH</div>
                          </div>
                          <div className="text-center p-2 bg-gray-800/30 rounded-lg">
                            <div className="text-lg font-bold text-white">{classData.stats.damage}</div>
                            <div className="text-xs text-gray-400 font-pt-mono">DAMAGE</div>
                          </div>
                        </div>

                        {/* Corruption Resistance */}
                        <div className="mb-4">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-400 font-pt-mono">Corruption Resistance</span>
                            <span className="text-white font-pt-mono font-bold">
                              {classData.corruption.resistance}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-1.5">
                            <div
                              className="h-1.5 rounded-full bg-gradient-to-r from-green-500 to-red-500"
                              style={{ width: `${classData.corruption.resistance}%` }}
                            />
                          </div>
                        </div>

                        {/* Hover Indicator */}
                        <div className="text-center">
                          <span className="text-sm font-pt-mono text-gray-400 group-hover:text-white transition-colors duration-200">
                            Click to explore →
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              /* Detailed Class View */
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-8"
                >
                  {/* Class Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div
                        className="w-16 h-16 rounded-xl flex items-center justify-center"
                        style={{
                          backgroundColor: `${selectedClass.color}20`,
                          border: `2px solid ${selectedClass.color}40`,
                        }}
                      >
                        <selectedClass.icon className="w-8 h-8" style={{ color: selectedClass.color }} />
                      </div>
                      <div>
                        <h2 className="text-4xl font-black font-montserrat text-white mb-2">{selectedClass.name}</h2>
                        <p className="text-gray-300 font-pt-mono text-lg">{selectedClass.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedClass(null)}
                      className="bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600/50 rounded-xl px-6 py-3 text-white font-pt-mono transition-all duration-200"
                    >
                      ← Back to Classes
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Class Image & Stats */}
                    <div className="lg:col-span-1 space-y-6">
                      {/* Class Portrait */}
                      <div className="relative rounded-2xl overflow-hidden">
                        <Image
                          src={selectedClass.image || "/placeholder.svg"}
                          alt={selectedClass.name}
                          width={400}
                          height={500}
                          className="w-full h-auto object-cover"
                        />
                        <div className={`absolute inset-0 bg-gradient-to-t ${selectedClass.gradient} opacity-20`} />
                      </div>

                      {/* Stats */}
                      <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-700/50">
                        <h3 className="text-xl font-black font-montserrat text-white mb-4">BASE STATS</h3>
                        <div className="space-y-4">
                          <StatBar label="Health" value={selectedClass.stats.health} color={selectedClass.color} />
                          <StatBar label="Damage" value={selectedClass.stats.damage} color={selectedClass.color} />
                          <StatBar label="Speed" value={selectedClass.stats.speed} color={selectedClass.color} />
                          <StatBar label="Defense" value={selectedClass.stats.defense} color={selectedClass.color} />
                        </div>
                      </div>

                      {/* Strategy Info */}
                      <div className="grid grid-cols-1 gap-4">
                        {/* Playstyle */}
                        <div className="bg-gray-900/50 rounded-2xl p-4 border border-gray-700/50">
                          <h4 className="text-sm font-black font-montserrat text-white mb-3 uppercase tracking-wide">
                            PLAYSTYLE
                          </h4>
                          <div className="space-y-2">
                            {selectedClass.playstyle.map((style, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <div
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: selectedClass.color }}
                                />
                                <span className="text-gray-300 font-pt-mono text-sm">{style}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Strengths */}
                        <div className="bg-gray-900/50 rounded-2xl p-4 border border-gray-700/50">
                          <h4 className="text-sm font-black font-montserrat text-white mb-3 uppercase tracking-wide">
                            STRENGTHS
                          </h4>
                          <div className="space-y-2">
                            {selectedClass.strengths.map((strength, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                <span className="text-gray-300 font-pt-mono text-sm">{strength}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Weaknesses */}
                        <div className="bg-gray-900/50 rounded-2xl p-4 border border-gray-700/50">
                          <h4 className="text-sm font-black font-montserrat text-white mb-3 uppercase tracking-wide">
                            WEAKNESSES
                          </h4>
                          <div className="space-y-2">
                            {selectedClass.weaknesses.map((weakness, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <div className="w-2 h-2 rounded-full bg-red-500" />
                                <span className="text-gray-300 font-pt-mono text-sm">{weakness}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Abilities & Corruption */}
                    <div className="lg:col-span-2 space-y-8">
                      {/* Abilities */}
                      <div>
                        <h3 className="text-2xl font-black font-montserrat text-white mb-6">CLASS ABILITIES</h3>
                        <div className="space-y-6">
                          {selectedClass.abilities.map((ability, index) => (
                            <AbilityCard key={index} ability={ability} classColor={selectedClass.color} />
                          ))}
                        </div>
                      </div>

                      {/* Corruption System */}
                      <div className="bg-gray-900/70 rounded-2xl p-6 border border-red-900/50">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-12 h-12 rounded-lg bg-red-900/30 border border-red-800/50 flex items-center justify-center">
                            <Skull className="w-6 h-6 text-red-400" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-black font-montserrat text-white">CORRUPTION SYSTEM</h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-sm text-gray-400 font-pt-mono">Resistance:</span>
                              <span className="text-lg font-bold text-white font-pt-mono">
                                {selectedClass.corruption.resistance}%
                              </span>
                            </div>
                          </div>
                        </div>

                        <p className="text-gray-300 font-pt-mono text-sm leading-relaxed mb-6">
                          {selectedClass.corruption.description}
                        </p>

                        <div className="space-y-4">
                          <h4 className="text-lg font-black font-montserrat text-white uppercase tracking-wide">
                            Corruption Effects
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {selectedClass.corruption.effects.map((effect, index) => (
                              <CorruptionBox key={index} effect={effect} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
