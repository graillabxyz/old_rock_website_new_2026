"use client"

import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Zap,
  Dice6,
  Users,
  Trophy,
  Brain,
  Gamepad2,
  Skull,
  Sparkles,
  Lock,
  BookOpen,
  Shield,
  Target,
} from "lucide-react"
import Image from "next/image"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { CyberpunkBackground } from "@/components/cyberpunk-background"

// Types
interface Augmentation {
  id: string
  name: string
  color: string
  gradient: string
  description: string
  abilities: {
    low: string
    medium: string
    high: string
  }
}

interface Subclass {
  id: string
  name: string
  icon: React.ReactNode
  description: string
  focusAbility: string
  augmentations: Augmentation[]
}

interface Class {
  id: string
  name: string
  description: string
  image: string
  dice: string
  subclasses: Subclass[]
}

// Augmentations data - shared across all subclasses
const augmentations: Augmentation[] = [
  {
    id: "yellow",
    name: "Yellow",
    color: "#eab308",
    gradient: "from-yellow-500 to-yellow-700",
    description: "Gas transformation abilities",
    abilities: {
      low: "Gaseous Form (Low): Transform your entire body into a toxic gas cloud for up to 3 rounds. While gaseous, you become immune to all physical damage (slashing, piercing, bludgeoning) and can move through any opening larger than 1 inch. You gain +5 to all stealth rolls as you become nearly invisible as a wispy cloud. You can still be affected by magical attacks and area-of-effect spells. The gas form has a faint yellow-green tint and emits a subtle acrid smell that trained noses can detect within 10 feet.",
      medium:
        "Enhanced Gaseous Form (Medium): Your gaseous transformation becomes more refined and versatile. Duration increases to 5 rounds, and you can now compress yourself to fit through openings as small as a keyhole. The +5 stealth bonus remains, but you also gain the ability to seep under doors and through ventilation systems. Your gas form can now carry small objects (up to 1 pound) dissolved within your molecular structure. You can partially solidify specific body parts while maintaining overall gaseous form, allowing for limited interaction with objects.",
      high: "Toxic Gaseous Form (High): Your ultimate gaseous state becomes a weapon of biological warfare. Duration extends to 7 rounds, and your gas cloud now carries potent neurotoxins. Any living creature that comes within 5 feet of your gaseous form or breathes the same air must make a FORT save DC 10 + your level or become poisoned for 2 turns, suffering -2 to all rolls and taking 1d4 poison damage per turn. The +5 stealth bonus increases to +7, and you can now split your consciousness into multiple gas pockets, effectively being in several places at once within a 30-foot radius.",
    },
  },
  {
    id: "turquoise",
    name: "Turquoise",
    color: "#14b8a6",
    gradient: "from-teal-500 to-cyan-600",
    description: "Electrical manipulation",
    abilities: {
      low: "Bioelectric Charge (Low): Your nervous system becomes a living electrical generator. Once per combat, you can channel bioelectric energy through your attacks, adding crackling electricity that can stun opponents. When you successfully hit an enemy with any attack, you can choose to discharge this energy, forcing the target to make a FORT save DC 10 + your level or be stunned for 1 turn as their nervous system is temporarily overloaded. The electrical discharge creates visible blue-white arcs between your fingers and the target, and nearby metal objects may spark or become briefly magnetized.",
      medium:
        "Chain Lightning Surge (Medium): Your bioelectric mastery evolves to affect multiple targets through electrical conduction. Your stunning attack now creates a chain lightning effect that can jump to a second enemy within 30 feet of your primary target. Both the original target and the secondary target must make FORT saves DC 10 + your level or be stunned for 1 turn. The electrical energy seeks out the path of least resistance, preferring targets wearing metal armor or standing in water. The chain lightning appears as a brilliant turquoise arc that illuminates the battlefield.",
      high: "Electromagnetic Storm (High): You become a living tesla coil capable of generating devastating electrical fields. Your chain lightning can now affect up to 2 additional targets within 30 feet, and the stun duration increases to 2 turns for all affected enemies. The electrical discharge is so powerful that it can short-circuit electronic devices within 20 feet, disable magical items for 1 round, and cause metal weapons to become red-hot (dealing 1d4 fire damage to wielders). Your body constantly crackles with electrical energy, providing dim light in a 10-foot radius and making you immune to electrical attacks.",
    },
  },
  {
    id: "red",
    name: "Red",
    color: "#dc2626",
    gradient: "from-red-600 to-red-800",
    description: "Fire manipulation",
    abilities: {
      low: "Thermal Weapon Enhancement (Low): Your body generates intense heat that you can channel into your weapons and attacks. You can imbue any weapon you wield with thermal energy, causing it to glow with red-hot intensity. This adds 1d4 fire damage to all successful attacks, and the heat is so intense that targets must make a FORT save DC 10 + your level or take half the fire damage even if they successfully defend or dodge. The weapon becomes uncomfortably hot for anyone else to handle, and it can ignite flammable materials on contact. The thermal enhancement lasts for the entire combat encounter.",
      medium:
        "Ignition Mastery (Medium): Your control over thermal energy intensifies, allowing you to create actual flames rather than just heat. Your weapon enhancement now adds 2d4 fire damage to successful attacks, and the flames spread beyond the initial impact. The fire damage affects the target regardless of armor, as the heat conducts through metal and ignites clothing. Targets hit by your flaming weapons have a 25% chance of catching fire, taking an additional 1d4 fire damage for the next 2 rounds unless they spend an action to extinguish the flames. Your weapons leave trails of fire in the air as you swing them.",
      high: "Inferno Weaponry (High): You achieve mastery over combustion itself, turning your weapons into conduits of devastating fire. Your thermal enhancement now adds 3d4 fire damage to all successful attacks, and the flames are so intense they can melt metal and stone. The fire damage bypasses all armor and resistance, as the heat reaches temperatures comparable to a forge. Any target hit by your inferno-enhanced weapons automatically catches fire for 3 rounds, taking 1d6 fire damage per round. Additionally, your weapons can ignite the surrounding area, creating a 5-foot radius of burning ground that damages anyone who enters or starts their turn there.",
    },
  },
  {
    id: "blue",
    name: "Blue",
    color: "#2563eb",
    gradient: "from-blue-600 to-blue-800",
    description: "Cold manipulation",
    abilities: {
      low: "Cryogenic Weapon Enhancement (Low): Your body can generate extreme cold, allowing you to freeze the moisture in the air and channel sub-zero temperatures through your attacks. When you successfully hit a target with any weapon, the intense cold slows their molecular movement, causing them to become sluggish and slow. The target must make a FORT save DC 10 + your level or be slowed for 1 turn, reducing their movement speed by half and giving them -2 to all attack rolls and AC. Ice crystals form on the target's body and equipment, and their breath becomes visible in the suddenly frigid air around them.",
      medium:
        "Frost Bite Enhancement (Medium): Your cryogenic mastery deepens, allowing you to cause actual tissue damage through flash-freezing. Your cold-enhanced attacks now add 1d4 cold damage in addition to the slowing effect. The extreme cold causes frostbite on contact, and targets must make a FORT save DC 10 + your level or be slowed for 1 turn as their blood begins to freeze in their veins. Ice forms on their weapons and armor, making them brittle and less effective. The cold is so intense that it can freeze liquids instantly and make metal objects painful to touch.",
      high: "Absolute Zero Mastery (High): You can generate temperatures approaching absolute zero, creating devastating cryogenic effects that can stop molecular motion entirely. Your enhanced attacks now deal 2d4 cold damage and slow targets for 2 turns on a failed FORT save DC 10 + your level. The cold is so extreme that it can shatter frozen objects, cause metal to become brittle and break, and freeze the air itself into visible ice crystals. Targets affected by your absolute zero attacks may have limbs temporarily frozen solid, and any water or other liquids within 10 feet of your attacks instantly freeze into solid ice.",
    },
  },
  {
    id: "purple",
    name: "Purple",
    color: "#9333ea",
    gradient: "from-purple-600 to-purple-800",
    description: "Mind control",
    abilities: {
      low: "Telepathic Intrusion (Low): Your mind develops powerful psionic abilities that allow you to breach the mental defenses of others. Once per combat, you can focus your psychic energy on a single target within 30 feet and attempt to read their surface thoughts and immediate intentions. The target must make a WILL save DC 10 + your level or have their mind temporarily opened to your intrusion for 1 turn. During this time, you learn their next intended action, any immediate fears or concerns, and can sense their general emotional state. The target experiences this as a strange tingling sensation in their head and may hear faint whispers of your mental voice.",
      medium:
        "Mental Domination (Medium): Your psionic powers evolve to allow direct manipulation of another's actions and thoughts. You can implant a simple, one-sentence command into a target's mind within 30 feet. The target must make a WILL save DC 10 + your level or be compelled to follow your mental command for 1 turn, as long as the command doesn't directly harm them or go against their core nature. Examples include 'drop your weapon,' 'move away from your allies,' or 'attack the person to your left.' The target is aware that their actions are not entirely their own but feels compelled to comply. Purple energy briefly flickers in their eyes during the domination.",
      high: "Complete Mental Control (High): You achieve mastery over the minds of others, capable of overriding their free will entirely. Your mental domination can now force a target to take any action you desire for 2 turns, even if it would harm them or their allies. The target must make a WILL save DC 10 + your level or become a puppet under your complete control. During this time, you can make them attack their friends, reveal secrets, use their abilities against their own side, or perform any action within their capabilities. The dominated target's eyes glow with purple energy, and other characters can clearly see they are under external control. This level of mental violation is considered deeply disturbing by most civilized societies.",
    },
  },
  {
    id: "silver",
    name: "Silver",
    color: "#6b7280",
    gradient: "from-gray-500 to-gray-700",
    description: "Blade transformation",
    abilities: {
      low: "Morphic Blade Arm (Low): Your dominant hand and forearm can transform into a razor-sharp metallic blade at will. The transformation takes one round to complete, during which your arm becomes liquid metal before solidifying into a gleaming silver blade approximately 2 feet long. This blade is considered a +1 magical weapon and deals 1d8 + 1 piercing damage. When you perform a charge attack (moving at least 20 feet before attacking), you can strike at double speed, gaining an additional +1 to damage. The blade is perfectly balanced and feels like a natural extension of your body. You can maintain this form for up to 10 minutes before needing to rest.",
      medium:
        "Dual Blade Transformation (Medium): Both of your hands and forearms can now transform into deadly silver blades simultaneously. Each blade deals 1d8 + 1 piercing damage, and when you perform a charge attack, you can make two attacks at double speed, adding +1 piercing damage to each strike. The transformation is faster now, taking only a free action to complete. Your blades can extend up to 3 feet in length and can change their shape slightly - becoming broader for slashing, narrower for piercing, or developing serrated edges for sawing through materials. The metallic transformation spreads up to your elbows, giving your arms a distinctive silver sheen.",
      high: "Living Weapon Mastery (High): Your entire body becomes a shapeshifting arsenal of bladed weapons. Both arms can transform into any bladed weapon you can imagine - swords, spears, axes, or even exotic weapons like blade whips or spinning saw discs. When performing a charge attack (moving at least 20 feet before attacking), you can strike at double speed, adding +2 piercing damage to each strike. Your blades can extend up to 5 feet in length and can split into multiple smaller blades for attacking multiple targets. The silver transformation can spread across your entire body, allowing you to sprout defensive spikes, create blade barriers, or even transform your legs into spring-loaded blade stilts for enhanced mobility.",
    },
  },
  {
    id: "gold",
    name: "Gold",
    color: "#f59e0b",
    gradient: "from-yellow-500 to-yellow-700",
    description: "Wealth-based empowerment",
    abilities: {
      low: "Monetary Empowerment (Low): Your power is directly tied to your material wealth, creating a supernatural connection between your financial status and your physical capabilities. If you have gained credits equal to at least 2 times your maximum hit points within the last hour (through combat loot, successful negotiations, gambling, or other means), you become empowered by the flow of wealth. This empowerment grants you a +1 modifier to all dice rolls - attacks, saves, skill checks, and damage rolls. Additionally, your keen eye for valuable items allows you to find 25% more credits than normal when looting or searching. Your equipment takes on a subtle golden sheen when you're empowered, and coins seem to gravitate toward your hands.",
      medium:
        "Golden Prosperity (Medium): Your connection to wealth deepens, requiring greater financial success but providing more substantial benefits. You must gain credits equal to 5 times your maximum hit points within the last hour to maintain your empowered state. When empowered, you receive a +2 modifier to all rolls, making you significantly more effective in all endeavors. Your supernatural affinity for wealth increases your credit findings by 50%, and you can sense valuable items within 30 feet, even if they're hidden or disguised. Your golden aura becomes more pronounced, and other people instinctively recognize your prosperity, treating you with a mixture of respect and envy.",
      high: "Midas Touch Mastery (High): You achieve the legendary power of King Midas himself, though in a more controlled form. You must accumulate credits equal to 10 times your maximum hit points within the last hour to maintain your ultimate empowered state. When active, you gain a +3 modifier to all rolls, making you extraordinarily capable in all situations. Your credit-finding ability doubles (100% increase), and you can literally smell gold and precious metals within 100 feet. Your golden empowerment is so strong that you can temporarily transmute small objects into gold (lasting 1 hour), and your mere presence makes business deals more favorable and negotiations more successful. Your entire body radiates a golden glow that marks you as someone of immense wealth and power.",
    },
  },
  {
    id: "aquamarine",
    name: "Aquamarine",
    color: "#06b6d4",
    gradient: "from-cyan-500 to-blue-600",
    description: "Time manipulation",
    abilities: {
      low: "Temporal Dodge (Low): Your body develops the ability to manipulate your personal timeline, allowing you to briefly step backward through time to avoid danger. Once per combat, when an enemy makes a successful attack against you, you can activate your temporal abilities as a free action to dodge the attack by rewinding your position by a fraction of a second. This allows you to avoid the attack entirely, as if you had never been in that position when the strike occurred. The temporal manipulation creates a brief shimmer around your body, like heat waves rising from hot pavement, and observers might notice a slight echo or afterimage of your movement. This ability represents minor time manipulation that only affects your immediate personal timeline.",
      medium:
        "Enhanced Temporal Control (Medium): Your mastery over time expands, allowing you to rewind several seconds and take additional actions within the temporal bubble you create. When you activate your temporal abilities, you can dodge one attack as before, but you also gain one free action that you can use immediately - this could be moving to a better position, drawing a weapon, activating an item, or making a quick attack. The temporal distortion is more pronounced, creating visible ripples in the air around you, and your movements appear to blur and stutter as you exist slightly out of sync with normal time. Other characters might hear faint echoes of sounds you made in the rewound timeline.",
      high: "Temporal Mastery (High): You achieve true control over your personal timestream, able to rewind several seconds of time and take multiple actions within your temporal pocket. When activated, you can dodge one attack and perform up to 2 free actions of your choice. These actions occur in a temporal bubble where you can move, attack, use items, or cast abilities while everyone else is frozen in time. The temporal manipulation is so advanced that you can even undo minor mistakes or poor tactical decisions made in the last few seconds. Your body becomes surrounded by a visible aura of swirling temporal energy, with clock-like symbols and hourglasses appearing and disappearing in the air around you. The sound of ticking clocks follows your movements during temporal manipulation.",
    },
  },
  {
    id: "black",
    name: "Black",
    color: "#0a0a0a",
    gradient: "from-gray-800 to-black",
    description: "Dark matter manipulation",
    abilities: {
      low: "Shadow Duplicate (Low): You can manipulate dark matter and void energy to create a semi-solid shadow version of yourself that confuses and distracts enemies. This shadow duplicate appears within 5 feet of you and lasts for 2 turns. The duplicate mimics your general movements and appearance but is clearly made of shifting darkness and shadow. Enemies attacking you have a 50% chance of targeting the shadow instead of you - if they attack the shadow, their attack automatically misses as their weapon passes harmlessly through the dark matter construct. The shadow duplicate cannot attack or interact with objects, but it can move independently within 30 feet of you. Attackers must make a WILL save DC 10 + your level to focus on the real you instead of being drawn to attack the more obvious shadow target.",
      medium:
        "Dark Matter Mimic (Medium): Your control over dark matter evolves to create a perfect duplicate that can actually interact with the physical world. Your shadow duplicate now appears identical to you in every way, except for a slight translucent quality and the absence of a shadow itself. For 2 turns, this mimic performs exactly the same actions you do at the same strength and effectiveness - if you attack, it attacks the same target; if you move, it mirrors your movement; if you use an ability, it uses the same ability. The mimic deals the same damage you do and has the same AC and hit points. There is no save to distinguish between you and the mimic, as it is a perfect copy. The mimic exists in a state of quantum superposition with you, making it impossible for enemies to determine which is real until one of you is destroyed.",
      high: "Void Sentience Creation (High): You achieve mastery over dark matter, creating two completely independent and sentient versions of yourself from the void between realities. These void duplicates last for 3 turns and possess their own consciousness, memories, and decision-making abilities. For the first 2 turns, you have some control over their actions and can coordinate strategies, but in the final turn, they become completely autonomous and may act according to their own interpretation of your goals and personality. Each duplicate has your full abilities, stats, and equipment (created from dark matter), and they can make their own tactical decisions. However, being born from the void, they may have slightly different personalities or motivations than you - they might be more aggressive, more cautious, or interpret your objectives differently. When the ability ends, the duplicates don't simply disappear - they return to the void carrying knowledge of your world, potentially alerting other void entities to reality's existence.",
    },
  },
  {
    id: "white",
    name: "White",
    color: "#ffffff",
    gradient: "from-gray-100 to-gray-300",
    description: "Plasma inferno",
    abilities: {
      low: "Plasma Burst (Low): You can generate and release pure plasma energy in a devastating short-range explosion that affects all enemies within 5 feet of you. This plasma burst deals 1d4 plasma damage to all creatures in the area and has a chance to stun them as the superheated gas disrupts their nervous systems. All affected enemies must make a FORT save DC 10 + your level or be stunned for 1 turn as the plasma interferes with their bioelectric functions. The plasma appears as a brilliant white-hot flash that briefly illuminates the entire battlefield, followed by waves of superheated air that can singe hair and clothing. The intense light can temporarily blind anyone looking directly at the burst, and the heat is so extreme that it can ignite flammable materials and melt small metal objects.",
      medium:
        "Enhanced Plasma Field (Medium): Your plasma generation capabilities expand, allowing you to create a larger and more intense field of superheated gas. The plasma burst now affects all enemies within 10 feet and deals 2d4 plasma damage. The stunning effect remains the same, but the plasma field lingers for a few seconds after the initial burst, creating a zone of extreme heat that continues to affect the area. The plasma energy is so intense that it can vaporize moisture in the air, creating a brief vacuum effect that can knock smaller creatures off balance. Metal armor becomes painfully hot to wear for several minutes after exposure, and the ground itself may be scorched or melted where the plasma touched it.",
      high: "Stellar Plasma Inferno (High): You become capable of generating plasma at temperatures comparable to the core of a star, creating a devastating inferno that can affect a wide area. Your plasma burst now reaches all enemies within 15 feet and deals 3d4 plasma damage. The stunning effect lasts for 1 turn, but the plasma is so intense that it can actually break down matter at the molecular level. The stellar plasma can melt through most materials, vaporize organic matter, and create a brief miniature sun that provides intense light and heat for several rounds after activation. The plasma field is so energetic that it creates its own weather patterns - generating wind, ionizing the air, and potentially causing electrical discharges. Anyone caught in the full effect of the stellar plasma may be permanently marked by the experience, with their equipment fused or transformed by the extreme energy.",
    },
  },
]

// Corruption effects for each augmentation color
const augmentationCorruption = {
  yellow: {
    low: "Atmospheric Vulnerability (Low): Your body's adaptation to gaseous states makes you extremely vulnerable to wind-based attacks and adverse atmospheric conditions. Any wind stronger than a light breeze causes you discomfort and disorientation. Wind-based attacks, air magic, or even strong gusts from fans or ventilation systems deal an additional 1d6 wind damage to you. You suffer -2 to all rolls when in windy conditions, and you cannot maintain gaseous form in areas with strong air currents. Your respiratory system becomes hypersensitive to air quality - smoke, dust, or polluted air causes you to cough uncontrollably and suffer -1 to all actions until you reach clean air. You must spend extra time each day in meditation to maintain your molecular cohesion, or risk spontaneously dispersing into gas at inconvenient moments.",
    medium:
      "Severe Wind Sensitivity (Medium): Your vulnerability to atmospheric disturbances intensifies dramatically. Wind-based attacks and adverse conditions now deal 2d6 wind damage, and even moderate breezes cause significant distress. You suffer -3 to all rolls in windy conditions, and strong winds can actually disperse parts of your molecular structure, causing you to lose 1 hit point per round until you find shelter. Your gaseous form becomes unstable in any air movement, making stealth impossible in windy areas as you visibly swirl and eddy. You develop an obsessive need to check weather conditions and avoid outdoor areas during storms. Your breathing becomes labored and wheezy even in calm conditions, and you require special breathing apparatus in dusty or polluted environments.",
    high: "Catastrophic Atmospheric Disruption (High): Your molecular structure becomes so unstable that any significant air movement threatens your very existence. Wind-based attacks deal 3d6 wind damage and can potentially scatter your consciousness across a wide area. Even gentle breezes cause you physical pain and mental confusion. In windy conditions, you must make Constitution saves every round or begin to involuntarily disperse, losing control of your physical form. Your gaseous transformations become unpredictable - you might spontaneously turn to gas during emotional stress, physical exertion, or even while sleeping. You develop severe agoraphobia related to open spaces where wind might catch you, and you compulsively seek enclosed, still-air environments. Your very presence can disrupt local air currents, creating small whirlwinds or dead-air zones that make others uncomfortable around you.",
  },
  turquoise: {
    low: "Bioelectric Feedback (Low): Your nervous system's adaptation to generating electrical energy makes it prone to dangerous feedback loops and self-inflicted paralysis. When you use your electrical abilities, there's a 10% chance that the bioelectric energy will backfire through your own nervous system instead of reaching your intended target. When this occurs, you become stunned for 1 turn as your own electrical discharge overwhelms your neural pathways. You experience muscle twitches and minor spasms throughout the day, and electronic devices malfunction or produce static when you're nearby. Your sleep is often disrupted by electrical dreams and phantom sensations of being shocked. You must be careful around water, as your bioelectric field can cause painful feedback when wet, and you cannot safely use most electronic devices without special insulation.",
    medium:
      "Severe Neural Instability (Medium): The electrical modifications to your nervous system create increasingly dangerous feedback patterns that can cause significant self-harm. The chance of stunning yourself when using electrical abilities increases to 20%, and the duration extends to 1 full turn of complete paralysis. Your bioelectric field becomes strong enough to interfere with pacemakers, hearing aids, and other medical devices, making you a danger to people with electronic implants. You develop chronic muscle pain from constant minor electrical discharges, and your reflexes become unpredictable - sometimes lightning-fast, sometimes completely delayed. Electronic equipment fails more frequently around you, and you cannot use computers, phones, or other sensitive devices without causing permanent damage. Your emotional state directly affects your electrical output, causing lights to flicker when you're angry or electronics to short out when you're stressed.",
    high: "Critical Bioelectric Cascade (High): Your nervous system becomes a barely-controlled electrical storm that threatens both you and everyone around you. The self-stunning chance increases to 30%, and when it occurs, you're paralyzed for 2 full turns while dangerous electrical arcs dance across your body. These electrical cascades can damage your own tissue, causing 1d4 electrical damage to yourself each time you suffer feedback. Your bioelectric field is so strong that it can stop electronic pacemakers within 20 feet, potentially killing people with certain medical conditions. You cannot touch other people safely without risking electrocution, making normal social interaction nearly impossible. Your electrical aura is visible as constant small lightning bolts playing across your skin, and your hair stands permanently on end. During emotional extremes, you may involuntarily discharge massive electrical bursts that can black out entire city blocks or fry every electronic device in a building.",
  },
  red: {
    low: "Thermal Buildup Syndrome (Low): Your body's adaptation to generating extreme heat comes with the dangerous side effect of thermal energy accumulation that must be regularly released or it will harm you from within. Each day that you do not use your fire-based abilities, superheated energy builds up in your cellular structure, eventually reaching dangerous levels. If you go a full day without using your thermal powers, you suffer 1d4 fire damage with no save as your own body temperature spikes uncontrollably. This internal heat buildup causes constant discomfort - you sweat profusely even in cold weather, you cannot sleep comfortably without cooling systems, and you must consume large amounts of water to prevent dehydration. Your touch becomes uncomfortably warm to others, making casual physical contact unpleasant. You develop an obsessive need to use your abilities daily, leading to potentially destructive behavior as you seek outlets for your thermal energy.",
    medium:
      "Combustion Pressure (Medium): The thermal energy your body generates becomes more intense and harder to contain, requiring more frequent release to prevent dangerous internal combustion. You must use your fire abilities at least once per day or suffer 2d4 fire damage as your cellular structure begins to literally cook from within. The heat buildup is so intense that it can cause spontaneous combustion of your clothing, hair, or nearby flammable materials. You cannot tolerate warm environments at all, requiring constant air conditioning or cooling magic to remain comfortable. Your body temperature runs dangerously high, making you prone to heat stroke and dehydration. Others cannot touch you for more than a few seconds without risking burns, and you leave scorch marks on furniture, bedding, and anything else you contact for extended periods. You develop an addiction-like compulsion to use your fire powers, and going without them causes withdrawal-like symptoms including fever, hallucinations, and violent mood swings.",
    high: "Infernal Immolation Risk (High): Your body becomes a barely-contained inferno that constantly threatens to consume you from within if not regularly vented through your fire abilities. Missing even a single day of using your thermal powers results in 3d4 fire damage as your internal temperature reaches levels that would normally be fatal. Your core body temperature is so high that you can no longer tolerate any warm environment - even room temperature feels like a furnace to you. You require constant cooling just to survive, and you cannot wear normal clothing as it immediately ignites. Your breath is literally hot enough to cause burns, and you cannot eat hot food or drink warm liquids without causing internal damage. You leave a trail of small fires wherever you go, and you cannot sleep in normal beds as you will set them ablaze. The psychological pressure of containing such destructive force drives many to madness, and you may develop pyromania or an obsessive fear of your own power. In extreme cases, failure to release thermal energy can result in spontaneous human combustion.",
  },
  blue: {
    low: "Cryogenic Stasis Syndrome (Low): Your body's adaptation to generating extreme cold creates a dangerous condition where thermal energy builds up in reverse - instead of overheating, you risk freezing from within if you don't regularly release the accumulated cold energy. Each day you don't use your cryogenic abilities, your core body temperature drops dangerously low, and you become sluggish and slow as your metabolism slows down. If you go a full day without using your cold powers, you become slowed (half movement speed, -2 to all rolls) until you use your abilities to release the built-up cold energy. Your body temperature runs abnormally low, making you constantly cold even in warm weather. You cannot tolerate cold environments at all, as they exacerbate your condition. Others find your touch uncomfortably cold, and you may accidentally cause frostbite during prolonged contact. You develop an obsessive need to use your abilities regularly to maintain normal body function.",
    medium:
      "Hypothermic Cascade (Medium): The cryogenic energy in your system becomes more dangerous and harder to control, threatening to freeze your blood and organs if not properly managed. Going a day without using your cold abilities causes you to suffer 1d4 cold damage and become slowed until you release the energy. Your body temperature is so low that your breath is visible even in warm weather, and moisture in the air freezes around you, creating a thin layer of frost on nearby surfaces. You cannot safely touch others without causing frostbite, and you require heated clothing and environments just to function normally. Your blood flows sluggishly, making you prone to circulation problems and making healing more difficult. You may spontaneously freeze small amounts of liquid around you, and your emotional state affects the local temperature - anger might cause ice to form, while sadness could freeze your tears before they fall.",
    high: "Absolute Zero Cascade (High): Your cryogenic systems become so powerful that they threaten to freeze you solid from within, creating a cascade effect that could turn your entire body into ice. Missing a day of using your cold abilities results in 2d4 cold damage and being slowed until you release the energy, but the cold buildup is so severe that it can cause permanent tissue damage. Your core temperature is so low that you're technically in a state of suspended animation - your heart beats only a few times per minute, your breathing is barely perceptible, and your metabolism has slowed to near-death levels. You cannot survive in any environment warmer than freezing without constant magical or technological cooling. Your touch instantly freezes liquids and can cause severe frostbite or even freeze limbs solid. Ice forms constantly around you, creating treacherous conditions wherever you go. The psychological effects of existing in a near-death state can cause severe depression, dissociation, and a gradual loss of emotional warmth that mirrors your physical condition.",
  },
  purple: {
    low: "Psychic Strain Syndrome (Low): Your mind develops powerful psionic abilities that allow you to breach the mental defenses of others. Once per combat, you can focus your psychic energy on a single target within 30 feet and attempt to read their surface thoughts and immediate intentions. The target must make a WILL save DC 10 + your level or have their mind temporarily opened to your intrusion for 1 turn. During this time, you learn their next intended action, any immediate fears or concerns, and can sense their general emotional state. The target experiences this as a strange tingling sensation in their head and may hear faint whispers of your mental voice.",
    medium:
      "Cognitive Overload (Medium): The psychic strain of mental domination becomes more severe, with a 30% chance of losing your next turn due to mental exhaustion after using your abilities. The cognitive overload is so intense that you may temporarily forget who you are, where you are, or what you were doing. You begin to absorb personality traits, memories, and emotional patterns from the minds you invade, slowly losing your own identity as it becomes contaminated with fragments of other consciousnesses. Your sleep is plagued by nightmares that may actually be memories from other people's minds, and you wake up exhausted and confused. You develop multiple personality-like symptoms as different mental fragments compete for control of your consciousness. Your empathy becomes overwhelming - you feel every emotion of every person around you, making it difficult to function in crowds or social situations.",
    high: "Psychic Fragmentation (High): Your mind becomes so fractured from constant mental intrusion and domination that you risk complete psychological breakdown. The chance of losing your next turn increases to 40%, and during these episodes, you may temporarily take on the personality, memories, or even the voice of someone whose mind you've invaded. Your own identity becomes increasingly unstable as you absorb more and more mental fragments from your victims. You may wake up with memories of lives you've never lived, skills you've never learned, or emotions toward people you've never met. In severe cases, you might temporarily believe you ARE someone else entirely, acting on their memories and motivations instead of your own. Your dreams become a chaotic mixture of everyone's memories you've ever touched, making restful sleep impossible. The psychological trauma of experiencing multiple deaths, betrayals, and tragedies from other people's memories can drive you to complete madness, and you may develop multiple distinct personalities that represent the strongest mental fragments you've absorbed.",
  },
  silver: {
    low: "Weapon Dependency Syndrome (Low): Your body's adaptation to blade transformation creates a dangerous psychological and physical dependency on your morphic abilities that can leave you vulnerable in combat. When you activate your blade transformation for a charge attack, you become so focused on the target and the sensation of being a living weapon that you lose awareness of everything else. You automatically drop any weapons you were holding before the transformation, as your body rejects external tools in favor of becoming the weapon itself. During and immediately after the charge attack, you suffer -1 AC for 1 full turn as your hyper-focused state makes you oblivious to other threats. Additionally, your next action must be another hand-to-hand attack against the same target, even if that target is already dead or no longer poses a threat - your weapon-mind cannot easily shift focus once locked onto prey. This compulsive behavior can lead to tactical mistakes and leave you exposed to other enemies.",
    medium:
      "Morphic Weapon Obsession (Medium): Your psychological dependency on blade transformation intensifies, and your body begins to reject all external weapons as inferior to your own morphic capabilities. Before any charge attack, you compulsively drop ALL weapons and equipment you're carrying, not just handheld items, as your body prepares for total weapon transformation. Your AC penalty increases to -2 for 1 full turn as you become completely absorbed in the predatory mindset of a living weapon. Your compulsive follow-up attack becomes more intense - you must continue making hand-to-hand attacks against the same target until either you or the target is dead, unable to switch targets or use any other abilities. This berserker-like state makes you extremely dangerous but also tactically inflexible. You begin to view normal weapons as crude and primitive, developing contempt for those who rely on external tools rather than becoming weapons themselves.",
    high: "Living Weapon Psychosis (High): Your mind becomes completely consumed by the weapon transformation, creating a dangerous split personality between your human consciousness and your weapon-self. The compulsive weapon dropping becomes total - you cannot bear to carry any equipment at all, as your body constantly prepares for transformation. Your AC penalty increases to -2 for 2 full turns, and your compulsive attacking becomes a true berserker rage - you must continue attacking the same target with hand-to-hand combat until either you or the target is completely destroyed, regardless of tactical considerations or the safety of your allies. During these episodes, you may not recognize friends from foes, seeing only prey to be cut down. Your weapon-personality begins to emerge even outside of combat, making you view all problems as things to be cut, stabbed, or sliced. You develop a disturbing fascination with sharp objects and may compulsively sharpen your transformed blades for hours at a time. In extreme cases, you may attempt to remain in blade form permanently, losing your human identity entirely to become a living weapon with only the most basic predatory instincts.",
  },
  gold: {
    low: "Economic Dependency Syndrome (Low): Your supernatural connection to wealth creates a dangerous psychological and physiological dependency on maintaining a constant flow of money that can cripple you when your finances are low. You receive a -1 reaction penalty from all merchants, shopkeepers, and traders, as your golden aura and obvious wealth-based power makes them suspicious that you might be using supernatural means to manipulate prices or steal from them. More critically, your body and mind have become addicted to the flow of wealth - if your current credits ever drop below 2 times your maximum hit points, you begin to suffer withdrawal-like symptoms. You take a -1 penalty to all rolls as your confidence, physical coordination, and mental acuity all decline without the empowering flow of money. You become obsessed with checking your credit balance, counting money, and seeking new sources of income. The psychological pressure of maintaining your wealth can lead to increasingly desperate or unethical behavior as you prioritize money over relationships, morals, or personal safety.",
    medium:
      "Wealth Addiction Syndrome (Medium): Your dependency on wealth becomes more severe, requiring larger amounts of money to maintain your enhanced state and causing more serious withdrawal symptoms when your finances decline. The reaction penalty from merchants increases to -2, as your golden aura becomes more pronounced and your obvious supernatural wealth makes normal people deeply uncomfortable. Your credit threshold increases to 5 times your maximum hit points - falling below this level causes a -2 penalty to all rolls as your body and mind begin to shut down without sufficient monetary energy. You develop compulsive spending and hoarding behaviors, unable to enjoy money unless you're constantly acquiring more. Your relationships suffer as you begin to view other people primarily in terms of their economic value to you. You may become paranoid about theft or economic loss, obsessively checking your accounts and becoming violent toward anyone who threatens your financial security.",
    high: "Midas Curse Manifestation (High): Your connection to wealth becomes so complete that you lose the ability to function as a normal human being, becoming more of a living embodiment of greed than a person. Merchants and traders react to you with a -3 penalty, and many refuse to deal with you at all, as your presence makes them feel like their money is being drained away. Your credit requirement increases to 10 times your maximum hit points, and falling below this threshold causes a -3 penalty to all rolls as your body begins to literally shut down without sufficient wealth energy. You cannot form meaningful relationships with anyone, as you compulsively evaluate everyone and everything in terms of monetary value. You may begin to see people as walking credit amounts rather than individuals, and you might attempt to 'collect' people who are wealthy or valuable. Your touch may begin to actually transmute objects into gold against your will, destroying useful items and making normal life impossible. In the final stages, you risk becoming a living statue of gold, wealthy beyond measure but unable to enjoy or use any of it, trapped forever in a prison of your own greed.",
  },
  aquamarine: {
    low: "Temporal Displacement Syndrome (Low): Your manipulation of personal time creates dangerous instabilities in your connection to the normal timestream, leaving you vulnerable to temporal displacement and chronological confusion. Each time you use your time manipulation abilities, there's a 20% chance that you'll become temporarily lost in time, losing your next turn as your consciousness struggles to resynchronize with the present moment. During these episodes, you may experience brief flashes of possible futures, alternate timelines, or echoes of past events, making it difficult to distinguish between what has happened, what is happening, and what might happen. You develop chronic temporal disorientation - you frequently arrive late or early to appointments, age at an inconsistent rate, and may sometimes remember events that haven't happened yet or forget things that just occurred. Your circadian rhythms become completely disrupted, as your body can no longer properly track the passage of time, leading to severe insomnia and metabolic problems.",
    medium:
      "Chronological Instability (Medium): Your temporal manipulation abilities create more severe disruptions in your personal timeline, with a 30% chance of losing your next turn due to temporal displacement. These episodes become more intense and disorienting - you may briefly exist in multiple time periods simultaneously, experiencing past traumas, future possibilities, and present reality all at once. Your aging becomes erratic and unpredictable - you might age several years in a day, or remain unchanged for months at a time. Your memories become unreliable as they become contaminated with experiences from alternate timelines where you made different choices. You begin to suffer from temporal vertigo, a condition where you feel like you're constantly falling through time, making it difficult to maintain balance or coordination. Your relationships suffer as you sometimes remember versions of people from timelines where your interactions went differently, leading to confusion and conflict when your memories don't match reality.",
    high: "Temporal Fragmentation Crisis (High): Your consciousness becomes scattered across multiple timelines simultaneously, with a 40% chance of losing your next turn as different versions of yourself from various timelines compete for control of your actions. During these episodes, you may act according to the memories, personality, or motivations of alternate timeline versions of yourself, making decisions that seem completely out of character or irrational to others. Your physical form becomes unstable as it tries to exist in multiple time periods at once - you may appear translucent, flicker in and out of existence, or cast shadows from different time periods. Your memories become a chaotic jumble of experiences from countless alternate timelines, making it impossible to determine which life you actually lived and which are temporal echoes. You may begin to age and die repeatedly as your consciousness experiences the deaths of alternate selves, only to snap back to life when your timeline reasserts itself. In the most severe cases, you risk becoming completely unstuck in time, existing as a temporal ghost who can observe all possible timelines but can never again fully exist in any single one.",
  },
  black: {
    low: "Void Exposure Syndrome (Low): Your manipulation of dark matter and void energy creates a dangerous connection to the space between realities, leaving you vulnerable to being pulled into the emptiness between dimensions. Each time you use your dark matter abilities, there's a 20% chance that you'll accidentally slip into the void for 1 turn, a nightmarish space of absolute nothingness where you lose all magical buffs, cannot perform any actions except basic movement, and experience the terrifying sensation of existing in complete sensory deprivation. While in the void, you can see the normal world as if through dark glass, but you cannot interact with it or be seen by others. The psychological trauma of experiencing true nothingness - no light, no sound, no sensation except your own thoughts - can be devastating. You develop an irrational fear of darkness and empty spaces, as they remind you of the void. Your shadow begins to behave strangely, sometimes moving independently or appearing to reach toward dark corners as if trying to pull you back into the emptiness.",
    medium:
      "Dimensional Instability (Medium): Your connection to the void becomes stronger and more dangerous, with the same 20% chance of void displacement, but the experience becomes more traumatic and disorienting. While in the void, you begin to encounter other things that exist in the space between realities - shadowy entities, lost souls, and fragments of destroyed dimensions that may try to communicate with you or follow you back to reality. You start to lose pieces of yourself in the void - memories, emotions, or even physical sensations that don't return when you do. Your reflection begins to show your void-touched nature, appearing darker, more translucent, or sometimes showing the emptiness behind your eyes. You develop an obsessive need to avoid being alone, as solitude reminds you too much of the void's isolation. Your presence begins to create small dead zones where technology fails, plants wither, and people feel inexplicably depressed or anxious.",
    high: "Void Consciousness Fragmentation (High): Your repeated exposure to the void has fundamentally changed your nature, making you as much a creature of emptiness as of reality. Your sentient dark matter duplicates represent this change - in their final turn of existence, they may choose to drag you back into the void with them, or they might decide that reality would be better off empty and work to unmake everything around them. These duplicates have experienced the void's perspective on existence and may view the material world as a painful illusion that should be dissolved. They could be more powerful than you because they're not limited by physical laws, existing partially in the void where normal rules don't apply. When they fade away, they don't simply disappear - they return to the void carrying knowledge of your world, potentially alerting other void entities to reality's existence. You begin to question whether you're real or just another void duplicate that has forgotten its true nature. Your very presence starts to weaken the barriers between dimensions, creating permanent tears in reality that leak void energy and attract dangerous extra-dimensional attention.",
  },
  white: {
    low: "Plasma Radiation Syndrome (Low): Your ability to generate stellar-level plasma creates dangerous radiation and energy feedback that affects both you and everyone around you in unpredictable ways. The plasma you generate is so energetic and unstable that you cannot fully control its area of effect - there's a 20% individual chance that you and each of your allies within range of your plasma abilities must make the same FORT save DC 10 + your level or suffer the same stunning and damage effects as your enemies. This friendly fire effect occurs because plasma at stellar temperatures doesn't distinguish between friend and foe - it simply burns everything with equal intensity. You begin to emit low-level radiation constantly, causing electronic devices to malfunction around you and making photographic film fog when you're nearby. Your body temperature runs dangerously high, and you require constant hydration to prevent heat stroke. People who spend extended time around you may develop radiation sickness symptoms like nausea, fatigue, and hair loss.",
    medium:
      "Stellar Energy Cascade (Medium): Your plasma generation becomes more powerful but also more dangerous and unpredictable, with the same 20% friendly fire chance affecting you and all allies in range. The plasma energy you generate is so intense that it begins to affect the local environment in permanent ways - metal objects become radioactive, organic materials may spontaneously combust, and the ground itself becomes scorched and barren where you've used your abilities. You develop a visible aura of heat distortion around your body at all times, making you appear to shimmer like a mirage. Your core body temperature is so high that you cannot safely touch other people without causing burns, and you cannot wear normal clothing or armor as it will melt or catch fire. The radiation you emit becomes strong enough to cause cancer and genetic mutations in people who are exposed to you for extended periods, making you a danger to anyone you care about.",
    high: "Miniature Star Syndrome (High): Your plasma abilities have reached the point where you're essentially carrying a piece of stellar core within your body, making you incredibly dangerous to everyone around you, including yourself. The 20% friendly fire chance remains, but the effects are now so devastating that even your allies may prefer to stay far away from you during combat. Your body has become a barely-contained fusion reactor that constantly threatens to go critical - you emit deadly radiation in a wide radius, your surface temperature can melt steel, and your very presence can ignite the atmosphere in oxygen-rich environments. You cannot maintain any normal relationships as prolonged exposure to you is fatal to unprotected humans. Your plasma abilities may begin to activate involuntarily during emotional stress, potentially vaporizing everything around you in moments of anger or fear. In the final stages, you risk becoming a living nuclear explosion, capable of devastating entire city blocks but unable to control when or where your stellar energy will be released. The psychological isolation of being too dangerous to be near other living beings can drive you to complete madness, making you see yourself as a god of destruction who must either rule over others from a distance or destroy everything to end your own suffering.",
  },
}

const levelingData = [
  { level: 0, xp: "0–999", title: "Beginner", reward: "+ Focus Ability" },
  { level: 1, xp: "1,000–2,999", title: "Novice", reward: "+ Class Ability, +1 Feat" },
  { level: 2, xp: "3,000–5,999", title: "Apprentice", reward: "+ Class Ability" },
  { level: 3, xp: "6,000–9,999", title: "Advanced", reward: "+ Class Ability, +1 Feat" },
  { level: 4, xp: "10,000–14,999", title: "Expert", reward: "+1 Ability Score, + Class Ability" },
  { level: 5, xp: "15,000–22,999", title: "Veteran", reward: "+ Class Ability, +1 Feat" },
  { level: 6, xp: "23,000–34,999", title: "Adept", reward: "+ Class Ability" },
  { level: 7, xp: "35,000–50,999", title: "Skilled", reward: "+ Class Ability, +1 Feat" },
  { level: 8, xp: "51,000–74,999", title: "Master", reward: "+1 Ability Score, + Class Ability" },
  { level: 9, xp: "75,000–104,999", title: "Elite", reward: "+ Class Ability, +1 Feat" },
  { level: 10, xp: "105,000–154,999", title: "Paragon", reward: "+ Class Ability" },
  { level: 11, xp: "155,000–219,999", title: "Champion", reward: "+ Class Ability, +1 Feat" },
  { level: 12, xp: "220,000–314,999", title: "Hero", reward: "+1 Ability Score, + Class Ability" },
  { level: 13, xp: "315,000–444,999", title: "Legendary", reward: "+ Class Ability, +1 Feat" },
  { level: 14, xp: "445,000–634,999", title: "Mythic", reward: "+ Class Ability" },
  { level: 15, xp: "635,000–889,999", title: "Epic", reward: "+ Class Ability, +1 Feat" },
  { level: 16, xp: "890,000–1,299,999", title: "Transcendent", reward: "+1 Ability Score, + Class Ability" },
  { level: 17, xp: "1,300,000–1,799,999", title: "Divine", reward: "+ Class Ability, +1 Feat" },
  { level: 18, xp: "1,800,000–2,599,999", title: "Immortal", reward: "+ Class Ability" },
  { level: 19, xp: "2,600,000–3,599,999", title: "Ascendant", reward: "+ Class Ability, +1 Feat" },
  { level: 20, xp: "3,600,000+", title: "Godbound", reward: "+1 Ability Score, + Class Ability, + Epic Feat" },
]

// Helper function to extract mechanical details from text with context
const extractMechanics = (text: string, level: 'Low' | 'Medium' | 'High' = 'Low') => {
  const mechanics: {
    damage?: Array<{ value: string; context: string; requirement?: string }>
    saves?: Array<{ value: string; context: string; requirement?: string }>
    durations?: Array<{ value: string; context: string; requirement?: string }>
    ranges?: Array<{ value: string; context: string; requirement?: string }>
    modifiers?: Array<{ value: string; context: string; requirement?: string }>
    percentages?: Array<{ value: string; context: string; requirement?: string }>
    actions?: Array<{ value: string; context: string; requirement?: string }>
    other?: Array<{ value: string; context: string; requirement?: string }>
  } = {}

  // The requirement is the augmentation level needed
  const requirement = `${level} Level Augmentation`

  // Extract damage dice with context (look for surrounding text)
  const damageRegex = /([^.]{0,150})(\d+d\d+)\s+(fire|cold|poison|plasma|electrical|wind|damage|piercing|slashing|bludgeoning)([^.]{0,150})/gi
  let match
  const damageItems: Array<{ value: string; context: string; requirement?: string }> = []
  while ((match = damageRegex.exec(text)) !== null) {
    const fullContext = (match[1] + match[2] + ' ' + match[3] + match[4]).trim().replace(/\s+/g, ' ')
    // Extract a meaningful context window around the mechanic
    const startIdx = Math.max(0, fullContext.indexOf(match[2]) - 60)
    const endIdx = Math.min(fullContext.length, fullContext.indexOf(match[2]) + match[2].length + match[3].length + 60)
    const context = fullContext.substring(startIdx, endIdx).trim()
    damageItems.push({ value: `${match[2]} ${match[3]}`, context: context || fullContext, requirement })
  }
  if (damageItems.length > 0) {
    mechanics.damage = damageItems
  }

  // Extract save DCs with context - make it more succinct
  const saveRegex = /([^.]{0,200})(FORT|WILL|DEX|STR|INT|CHA|WIS|Constitution|Fortitude)\s+save\s+DC\s+(\d+\s*\+\s*your\s+level|\d+)([^.]{0,200})/gi
  const saveItems: Array<{ value: string; context: string; requirement?: string }> = []
  while ((match = saveRegex.exec(text)) !== null) {
    const beforeText = match[1].trim()
    const afterText = match[4].trim()
    
    // Extract who/what must make the save - look for complete phrases
    let trigger = ''
    const triggerPatterns = [
      /(?:any|all|each|every)\s+(?:living\s+)?(?:creature|enemy|target|character|ally|player|person|being|individual|one|someone|anyone|those|they)\s+(?:that|who|which)\s+(?:comes|enters|touches|breathes|is|are|within|near)\s+([^.]{0,60})/i,
      /(?:creature|enemy|target|character|ally|player|enemies|targets|creatures|those|they|who|that)\s+(?:that|who|which|within|near|comes|enters|touches|breathes)\s+([^.]{0,60})/i,
    ]
    
    for (const pattern of triggerPatterns) {
      const triggerMatch = beforeText.match(pattern)
      if (triggerMatch && triggerMatch[1]) {
        trigger = triggerMatch[1].trim()
        // Clean up - remove trailing words that don't make sense
        trigger = trigger.replace(/\s+(must|make|or|to|and|the|a|an)\s*$/i, '').trim()
        if (trigger.length > 5 && trigger.length < 80) break
      }
    }
    
    // Extract consequence - look for complete phrases after "or"
    let consequence = ''
    const consequenceMatch = afterText.match(/(?:or|to)\s+(?:become|suffer|take|be|gain|lose|are|is)\s+([^.]{0,100})/i)
    if (consequenceMatch && consequenceMatch[1]) {
      consequence = consequenceMatch[1].trim()
      // Stop at sentence boundaries, commas with conjunctions, or incomplete words
      const sentenceEnd = consequence.search(/[.!?]\s|,\s+(?:and|or|but|then|after|when|while|as|until|The|You|Your|their|they)/i)
      if (sentenceEnd > 10) {
        consequence = consequence.substring(0, sentenceEnd).trim()
      }
      // Remove incomplete words at the end (1-2 character words)
      consequence = consequence.replace(/\s+\w{1,2}$/, '').trim()
      // Limit length
      if (consequence.length > 80) {
        consequence = consequence.substring(0, 77).trim() + '...'
      }
    }
    
    // Clean up trigger - remove "must make" if already present
    if (trigger) {
      trigger = trigger.replace(/\s+(must\s+make|make)\s*$/i, '').trim()
      // Remove "make a" or "make" at the end
      trigger = trigger.replace(/\s+(make\s+a|make)\s*$/i, '').trim()
    }
    
    // Build clean, succinct context - ensure complete sentences
    let context = ''
    if (trigger && consequence) {
      // Ensure complete sentence
      if (!consequence.endsWith('.') && !consequence.endsWith('!') && !consequence.endsWith('?')) {
        consequence = consequence + '.'
      }
      context = `${trigger} must make ${match[2]} save DC ${match[3]} or ${consequence}`
    } else if (trigger) {
      context = `${trigger} must make ${match[2]} save DC ${match[3]}.`
    } else if (consequence) {
      if (!consequence.endsWith('.') && !consequence.endsWith('!') && !consequence.endsWith('?')) {
        consequence = consequence + '.'
      }
      context = `Targets must make ${match[2]} save DC ${match[3]} or ${consequence}`
    } else {
      // Fallback - use a clean, simple description
      context = `Requires ${match[2]} save DC ${match[3]}.`
    }
    
    // Clean up any double spaces or awkward phrases
    context = context.replace(/\s+/g, ' ')
      .replace(/\b(make\s+a\s+must\s+make|must\s+make\s+must\s+make|make\s+a\s+make)\b/gi, 'must make')
      .replace(/\b(make\s+a|make)\s+must\s+make\b/gi, 'must make')
      .replace(/\s+([.,!?])/g, '$1')
      .trim()
    
    // Remove incomplete words at the end (words with 1-2 characters)
    context = context.replace(/\s+\w{1,2}\s*$/, '').trim()
    
    saveItems.push({ value: `${match[2]} save DC ${match[3]}`, context, requirement })
  }
  if (saveItems.length > 0) {
    mechanics.saves = saveItems
  }

  // Extract durations with context - make it more succinct and clean
  const durationRegex = /([^.]{0,200})(\d+)\s+(rounds?|turns?|minutes?|hours?|seconds?)([^.]{0,200})/gi
  const durationItems: Array<{ value: string; context: string; requirement?: string }> = []
  while ((match = durationRegex.exec(text)) !== null) {
    const beforeText = match[1].trim()
    const afterText = match[4].trim()
    const durationValue = `${match[2]} ${match[3]}`
    
    // Look for what the duration applies to - look for ability/effect names before "for" or "lasts"
    let abilityName = ''
    const abilityPatterns = [
      /(?:gaseous\s+form|transformation|state|ability|effect|power|duplicate|shadow|mimic|form|aura|field|cloud|gas)\s+(?:lasts?|for|duration|extends?|increases?|to)\s+(?:up\s+to\s+)?\d+/i,
      /(?:for|up\s+to|lasts?|duration|extends?|increases?|to)\s+(?:up\s+to\s+)?\d+/i,
    ]
    
    for (const pattern of abilityPatterns) {
      const abilityMatch = beforeText.match(pattern)
      if (abilityMatch) {
        // Extract the ability name before the match
        const matchIndex = abilityMatch.index || 0
        const beforeMatch = beforeText.substring(Math.max(0, matchIndex - 50), matchIndex).trim()
        // Look for the actual ability name
        const nameMatch = beforeMatch.match(/(?:gaseous\s+form|transformation|state|ability|effect|power|duplicate|shadow|mimic|form|aura|field|cloud|gas|ability|power)\s*$/i)
        if (nameMatch) {
          abilityName = nameMatch[0].trim()
          break
        } else if (beforeMatch.length > 10) {
          // Use the last meaningful phrase
          const words = beforeMatch.split(/\s+/)
          if (words.length >= 2) {
            abilityName = words.slice(-2).join(' ')
            break
          }
        }
      }
    }
    
    // Look for what happens during/after duration - but only complete phrases
    let effect = ''
    const effectMatch = afterText.match(/(?:\.|,|and|or|while|during|when|as|until|then|after)\s+([^.]{0,80})/i)
    if (effectMatch && effectMatch[1]) {
      effect = effectMatch[1].trim()
      // Clean up - remove trailing incomplete words
      effect = effect.replace(/\s+\w{1,2}$/, '').trim()
      // Stop at sentence endings or common conjunctions
      const sentenceEnd = effect.search(/[.!?]\s|,\s+(?:and|or|but|then|after|when|while|as|until|The|You|Your)/i)
      if (sentenceEnd > 15) {
        effect = effect.substring(0, sentenceEnd).trim()
      }
      // Limit length
      if (effect.length > 100) {
        effect = effect.substring(0, 100).trim()
      }
    }
    
    // Build clean, succinct context - ensure complete sentences
    let context = ''
    if (abilityName && effect) {
      // Clean up ability name
      abilityName = abilityName.replace(/^(the|a|an|your|this|that)\s+/i, '').trim()
      // Ensure effect ends with punctuation
      if (!effect.endsWith('.') && !effect.endsWith('!') && !effect.endsWith('?')) {
        effect = effect + '.'
      }
      context = `${abilityName} lasts ${durationValue}. ${effect}`
    } else if (abilityName) {
      abilityName = abilityName.replace(/^(the|a|an|your|this|that)\s+/i, '').trim()
      context = `${abilityName} lasts ${durationValue}.`
    } else if (effect) {
      if (!effect.endsWith('.') && !effect.endsWith('!') && !effect.endsWith('?')) {
        effect = effect + '.'
      }
      context = `Effect lasts ${durationValue}. ${effect}`
    } else {
      // Fallback - use a simple description
      context = `Duration: ${durationValue}.`
    }
    
    // Final cleanup
    context = context.replace(/\s+/g, ' ')
      .replace(/\s+([.,!?])/g, '$1')
      .trim()
    
    // Remove incomplete words at the end (words with 1-2 characters)
    context = context.replace(/\s+\w{1,2}\s*$/, '').trim()
    
    durationItems.push({ value: durationValue, context, requirement })
  }
  if (durationItems.length > 0) {
    mechanics.durations = durationItems
  }

  // Extract ranges with context
  const rangeRegex = /([^.]{0,150})(\d+)\s+feet|within\s+(\d+)\s+feet|(\d+)\s+foot\s+radius|(\d+)\s+foot\s+area([^.]{0,150})/gi
  const rangeItems: Array<{ value: string; context: string; requirement?: string }> = []
  while ((match = rangeRegex.exec(text)) !== null) {
    const range = match[2] || match[3] || match[4] || match[5]
    const fullContext = (match[1] + range + ' feet' + (match[6] || '')).trim().replace(/\s+/g, ' ')
    const startIdx = Math.max(0, fullContext.indexOf(range) - 60)
    const endIdx = Math.min(fullContext.length, fullContext.indexOf(range) + range.length + 10 + 60)
    const context = fullContext.substring(startIdx, endIdx).trim()
    rangeItems.push({ value: `${range} feet`, context: context || fullContext, requirement })
  }
  if (rangeItems.length > 0) {
    mechanics.ranges = rangeItems
  }

  // Extract modifiers with context
  const modifierRegex = /([^.]{0,150})([+-]\d+)\s+(to|damage|AC|rolls?|stealth|initiative|tactics|HP|hit\s+points|movement|speed|attack|defense)([^.]{0,150})/gi
  const modifierItems: Array<{ value: string; context: string; requirement?: string }> = []
  while ((match = modifierRegex.exec(text)) !== null) {
    const fullContext = (match[1] + match[2] + ' ' + match[3] + match[4]).trim().replace(/\s+/g, ' ')
    const startIdx = Math.max(0, fullContext.indexOf(match[2]) - 60)
    const endIdx = Math.min(fullContext.length, fullContext.indexOf(match[2] + ' ' + match[3]) + match[2].length + match[3].length + 60)
    const context = fullContext.substring(startIdx, endIdx).trim()
    modifierItems.push({ value: `${match[2]} ${match[3]}`, context: context || fullContext, requirement })
  }
  if (modifierItems.length > 0) {
    mechanics.modifiers = modifierItems
  }

  // Extract percentages with context
  const percentageRegex = /([^.]{0,150})(\d+%)([^.]{0,150})/gi
  const percentageItems: Array<{ value: string; context: string; requirement?: string }> = []
  while ((match = percentageRegex.exec(text)) !== null) {
    const fullContext = (match[1] + match[2] + match[3]).trim().replace(/\s+/g, ' ')
    const startIdx = Math.max(0, fullContext.indexOf(match[2]) - 60)
    const endIdx = Math.min(fullContext.length, fullContext.indexOf(match[2]) + match[2].length + 60)
    const context = fullContext.substring(startIdx, endIdx).trim()
    percentageItems.push({ value: match[2], context: context || fullContext, requirement })
  }
  if (percentageItems.length > 0) {
    mechanics.percentages = percentageItems
  }

  // Extract action types with context
  const actionRegex = /([^.]{0,150})(once\s+per\s+combat|free\s+action|per\s+turn|per\s+round|once\s+per\s+day|once\s+per\s+encounter)([^.]{0,150})/gi
  const actionItems: Array<{ value: string; context: string; requirement?: string }> = []
  while ((match = actionRegex.exec(text)) !== null) {
    const fullContext = (match[1] + match[2] + match[3]).trim().replace(/\s+/g, ' ')
    const startIdx = Math.max(0, fullContext.indexOf(match[2]) - 60)
    const endIdx = Math.min(fullContext.length, fullContext.indexOf(match[2]) + match[2].length + 60)
    const context = fullContext.substring(startIdx, endIdx).trim()
    actionItems.push({ value: match[2], context: context || fullContext, requirement })
  }
  if (actionItems.length > 0) {
    mechanics.actions = actionItems
  }

  // Extract other key mechanics with context
  const otherRegex = /([^.]{0,150})(immune\s+to|resistance|resistant\s+to|proficiency|proficient|immunity|vulnerable|vulnerability)([^.]{0,150})/gi
  const otherItems: Array<{ value: string; context: string; requirement?: string }> = []
  while ((match = otherRegex.exec(text)) !== null) {
    const fullContext = (match[1] + match[2] + match[3]).trim().replace(/\s+/g, ' ')
    const startIdx = Math.max(0, fullContext.indexOf(match[2]) - 60)
    const endIdx = Math.min(fullContext.length, fullContext.indexOf(match[2]) + match[2].length + 60)
    const context = fullContext.substring(startIdx, endIdx).trim()
    otherItems.push({ value: match[2], context: context || fullContext, requirement })
  }
  if (otherItems.length > 0) {
    mechanics.other = otherItems
  }

  return mechanics
}

export default function StoneboundSoulsPage() {
  const [activeSection, setActiveSection] = useState("overview")
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)
  const [selectedSubclass, setSelectedSubclass] = useState<Subclass | null>(null)
  const [selectedAugmentation, setSelectedAugmentation] = useState<Augmentation | null>(null)
  const [activeRulesTab, setActiveRulesTab] = useState("core")
  const [mainTab, setMainTab] = useState<"basic" | "augmentation">("basic")
  const [augmentationTab, setAugmentationTab] = useState<"abilities" | "corruption">("abilities")
  const [selectedProgressionIndex, setSelectedProgressionIndex] = useState<number | null>(null)

  // Get detailed mechanics for a progression ability
  const getProgressionMechanics = (
    subclassId: string,
    abilityIndex: number,
    abilityName: string,
    augmentationId?: string
  ) => {
    const level = abilityIndex + 1
    const baseDC = 10 + level
    const baseDamage = Math.floor(level / 2) + 1
    
    // Base mechanics structure
    const mechanics: {
      type: string
      action: string
      range?: string
      duration?: string
      save?: string
      damage?: string
      effects: string[]
      augmentationBonus?: string
    } = {
      type: "Active",
      action: "Standard Action",
      effects: [],
    }

    // Contextual mechanics based on subclass and augmentation
    if (subclassId === "berserker") {
      if (abilityName.includes("Rage") || abilityName.includes("Fury")) {
        mechanics.type = "Rage Ability"
        mechanics.action = "Free Action (once per combat)"
        mechanics.duration = `${2 + Math.floor(level / 3)} rounds`
        mechanics.effects.push(`+${Math.floor(level / 2) + 1} damage to all attacks`)
        mechanics.effects.push("Resistance to fear effects")
        if (augmentationId === "red") {
          mechanics.augmentationBonus = "Fire damage added to all attacks while raging"
          mechanics.effects.push("+1d4 fire damage per attack")
        } else if (augmentationId === "yellow") {
          mechanics.augmentationBonus = "Can enter gaseous form while raging"
          mechanics.effects.push("Gaseous form duration extended by rage duration")
        } else if (augmentationId === "blue") {
          mechanics.augmentationBonus = "Cold rage slows enemies on contact"
          mechanics.effects.push("Enemies must make FORT save DC " + baseDC + " or be slowed")
        } else if (augmentationId === "black") {
          mechanics.augmentationBonus = "Shadow rage creates dark matter aura"
          mechanics.effects.push("50% miss chance from ranged attacks")
        } else if (augmentationId === "white") {
          mechanics.augmentationBonus = "Plasma rage adds fire damage"
          mechanics.effects.push("+1d4 plasma damage to all attacks")
        }
      } else if (abilityName.includes("Intimidat")) {
        mechanics.type = "Intimidation"
        mechanics.action = "Standard Action"
        mechanics.range = "30 feet"
        mechanics.save = `WILL DC ${baseDC}`
        mechanics.effects.push("Targets become frightened on failed save")
        mechanics.effects.push(`Affects up to ${Math.floor(level / 3) + 1} targets`)
      } else if (abilityName.includes("Leap")) {
        mechanics.type = "Movement Attack"
        mechanics.action = "Move Action"
        mechanics.range = "30 feet"
        mechanics.damage = `${baseDamage}d6 + STR modifier`
        mechanics.effects.push("Can move through enemy spaces")
        mechanics.effects.push("Targets must make DEX save DC " + baseDC + " or be knocked prone")
      }
    } else if (subclassId === "guardian") {
      if (abilityName.includes("Aegis") || abilityName.includes("Protocol")) {
        mechanics.type = "Protective Ability"
        mechanics.action = "Standard Action"
        mechanics.range = "30 feet"
        mechanics.duration = `${3 + Math.floor(level / 2)} rounds`
        mechanics.effects.push(`Grant +${Math.floor(level / 3) + 2} shield bonus to AC to all allies within range`)
        mechanics.effects.push(`Allies gain damage reduction ${Math.floor(level / 4) + 1}/- (reduces all damage by this amount)`)
        mechanics.effects.push("Allies gain +" + Math.floor(level / 5) + 1 + " to all saves")
        if (augmentationId === "blue") {
          mechanics.augmentationBonus = "Ice barriers provide additional protection"
          mechanics.effects.push("+2 AC from ice barriers (deflection bonus)")
          mechanics.effects.push("Enemies that attack protected allies take 1d4 cold damage")
        } else if (augmentationId === "turquoise") {
          mechanics.augmentationBonus = "Electrical field deflects projectiles"
          mechanics.effects.push("Ranged attacks against protected allies have 25% miss chance (concealment)")
          mechanics.effects.push("Ranged attackers take 1d4 electrical damage")
        } else if (augmentationId === "white") {
          mechanics.augmentationBonus = "Plasma barriers provide additional protection"
          mechanics.effects.push("+1 AC from plasma shields")
          mechanics.effects.push("Enemies within 5 feet of protected allies take 1d4 plasma damage per round")
        } else if (augmentationId === "black") {
          mechanics.augmentationBonus = "Shadow barriers absorb attacks"
          mechanics.effects.push("Damage reduction +1")
          mechanics.effects.push("Protected allies gain 20% concealment")
        }
      } else if (abilityName.includes("Shield") || abilityName.includes("Wall")) {
        mechanics.type = "Area Protection"
        mechanics.action = "Standard Action"
        mechanics.range = "30 feet"
        mechanics.duration = `${2 + Math.floor(level / 3)} rounds`
        mechanics.effects.push(`Create protective barrier covering ${5 + level * 2} square feet`)
        mechanics.effects.push("Barrier has AC " + (15 + level) + " and " + (level * 5) + " HP")
        mechanics.effects.push("Allies behind barrier gain +" + (Math.floor(level / 2) + 2) + " cover bonus to AC")
        mechanics.effects.push("Barrier blocks line of sight for enemies")
      } else if (abilityName.includes("Resolve") || abilityName.includes("Guardian's Resolve")) {
        mechanics.type = "Passive Ability"
        mechanics.action = "Passive"
        mechanics.effects.push("Immunity to fear effects and shaken condition")
        mechanics.effects.push(`+${Math.floor(level / 3) + 1} morale bonus to all saves`)
        mechanics.effects.push("Cannot be intimidated or demoralized")
      } else if (abilityName.includes("Augmented Defense")) {
        mechanics.type = "Augmentation Synergy"
        mechanics.action = "Free Action (while protecting)"
        mechanics.duration = "While protecting"
        mechanics.effects.push("All augmentation abilities gain +1 to DCs when used defensively")
        mechanics.effects.push("Augmentation durations extended by 1 round when protecting")
        mechanics.effects.push("Can use augmentation abilities as immediate actions to protect allies")
      } else if (abilityName.includes("Aura") || abilityName.includes("Protective Aura")) {
        mechanics.type = "Aura Ability"
        mechanics.action = "Free Action"
        mechanics.range = "10 feet radius"
        mechanics.duration = `${2 + Math.floor(level / 2)} rounds`
        mechanics.effects.push(`Allies within 10 feet gain damage resistance ${Math.floor(level / 3) + 1}`)
        mechanics.effects.push("Allies gain +" + Math.floor(level / 4) + 1 + " to all saves")
        mechanics.effects.push("Aura moves with you")
      } else if (abilityName.includes("Stalwart") || abilityName.includes("Intercept")) {
        mechanics.type = "Reactive Ability"
        mechanics.action = "Immediate Action"
        mechanics.range = "10 feet"
        mechanics.effects.push("Intercept one attack meant for an ally within range")
        mechanics.effects.push("Take damage instead of ally")
        mechanics.effects.push("Reduce damage taken by " + Math.floor(level / 2))
        mechanics.effects.push("Can be used " + (1 + Math.floor(level / 5)) + " times per round")
      } else if (abilityName.includes("Sacrifice") || abilityName.includes("Guardian's Sacrifice")) {
        mechanics.type = "Reactive Ability"
        mechanics.action = "Immediate Action"
        mechanics.range = "15 feet"
        mechanics.effects.push("Intercept attack meant for ally within range")
        mechanics.effects.push("Take all damage instead of ally")
        mechanics.effects.push("Reduce damage taken by " + Math.floor(level / 2))
        mechanics.effects.push("If damage would reduce you to 0 HP, make FORT save DC 15 or be staggered for 1 round")
      } else if (abilityName.includes("Fortress") || abilityName.includes("Stance")) {
        mechanics.type = "Defensive Stance"
        mechanics.action = "Move Action"
        mechanics.duration = `${1 + Math.floor(level / 3)} rounds`
        mechanics.effects.push("Cannot move from your space")
        mechanics.effects.push("Double all protection bonuses granted to allies")
        mechanics.effects.push("+" + Math.floor(level / 2) + 2 + " to your own AC")
        mechanics.effects.push("Allies within 30 feet gain +" + Math.floor(level / 3) + 2 + " to AC")
      } else if (abilityName.includes("Shield Master") || abilityName.includes("Reflect")) {
        mechanics.type = "Reactive Ability"
        mechanics.action = "Immediate Action"
        mechanics.range = "Melee"
        mechanics.effects.push("When an enemy attacks you or an adjacent ally, make attack roll")
        mechanics.effects.push("If your attack roll exceeds enemy's AC, reflect attack back at them")
        mechanics.effects.push("Reflected attack deals " + baseDamage + "d6 damage")
        mechanics.effects.push("Can be used " + (1 + Math.floor(level / 5)) + " times per round")
      } else if (abilityName.includes("Ultimate") || abilityName.includes("Entire Party")) {
        mechanics.type = "Mass Protection"
        mechanics.action = "Standard Action"
        mechanics.range = "60 feet"
        mechanics.duration = `${2 + Math.floor(level / 2)} rounds`
        mechanics.effects.push("Protect all allies within range simultaneously")
        mechanics.effects.push(`Each ally gains +${Math.floor(level / 3) + 3} AC`)
        mechanics.effects.push(`Each ally gains damage reduction ${Math.floor(level / 4) + 2}/-`)
        mechanics.effects.push("Can be used once per combat")
      } else if (abilityName.includes("Legendary") || abilityName.includes("Area Effect")) {
        mechanics.type = "Area Protection"
        mechanics.action = "Standard Action"
        mechanics.range = "30 feet radius"
        mechanics.duration = `${2 + Math.floor(level / 2)} rounds`
        mechanics.effects.push("Create protective field covering 30-foot radius")
        mechanics.effects.push("All allies in field gain +" + (Math.floor(level / 3) + 3) + " AC")
        mechanics.effects.push("All allies in field gain damage reduction " + (Math.floor(level / 4) + 2) + "/-")
      } else if (abilityName.includes("Angel") || abilityName.includes("Teleport")) {
        mechanics.type = "Teleportation"
        mechanics.action = "Immediate Action"
        mechanics.range = "100 feet"
        mechanics.effects.push("Instantly teleport to any ally within range")
        mechanics.effects.push("Intercept attack meant for that ally")
        mechanics.effects.push("Can be used " + (1 + Math.floor(level / 5)) + " times per combat")
      } else if (abilityName.includes("Field") || abilityName.includes("Dome")) {
        mechanics.type = "Area Protection"
        mechanics.action = "Full Round Action"
        mechanics.range = "50 feet radius"
        mechanics.duration = `${3 + Math.floor(level / 2)} rounds`
        mechanics.effects.push("Create dome of protection covering 50-foot radius")
        mechanics.effects.push("Dome has AC " + (20 + level) + " and " + (level * 10) + " HP")
        mechanics.effects.push("All allies inside gain +" + (Math.floor(level / 2) + 3) + " AC")
        mechanics.effects.push("Enemies cannot enter dome (STR save DC " + (baseDC + 5) + " to break through)")
      }
    } else if (subclassId === "weaponmaster") {
      if (abilityName.includes("Arsenal") || abilityName.includes("Mastery")) {
        mechanics.type = "Combat Ability"
        mechanics.action = "Passive"
        mechanics.effects.push("Proficiency with all weapons (simple, martial, and exotic)")
        mechanics.effects.push(`+${Math.floor(level / 3) + 1} competence bonus to attack rolls with all weapons`)
        mechanics.effects.push(`+${Math.floor(level / 2) + 1} competence bonus to damage with all weapons`)
        mechanics.effects.push("Can use any weapon as if you had Weapon Focus with it")
        if (augmentationId === "red") {
          mechanics.augmentationBonus = "All weapons deal additional fire damage"
          mechanics.effects.push("All weapon attacks deal +1d4 fire damage")
        } else if (augmentationId === "turquoise") {
          mechanics.augmentationBonus = "All weapons conduct electrical energy"
          mechanics.effects.push("All weapon attacks deal +1d4 electrical damage")
          mechanics.effects.push("Targets must make FORT save DC " + baseDC + " or be stunned 1 round")
        } else if (augmentationId === "blue") {
          mechanics.augmentationBonus = "All weapons freeze on impact"
          mechanics.effects.push("All weapon attacks deal +1d4 cold damage")
          mechanics.effects.push("Targets must make FORT save DC " + baseDC + " or be slowed (half speed, -1 attack/AC) for 1 round")
        } else if (augmentationId === "silver") {
          mechanics.augmentationBonus = "All weapons transform into living blades"
          mechanics.effects.push("All weapons gain +1d4 damage from morphic properties")
          mechanics.effects.push("Weapons can change shape as free action")
        } else if (augmentationId === "white") {
          mechanics.augmentationBonus = "All weapons generate plasma energy"
          mechanics.effects.push("All weapon attacks deal +1d4 plasma damage")
        }
      } else if (abilityName.includes("Bond") || abilityName.includes("Weapon Bond")) {
        mechanics.type = "Weapon Bond"
        mechanics.action = "1 hour ritual"
        mechanics.duration = "Permanent"
        mechanics.effects.push("Choose one weapon to bond with permanently")
        mechanics.effects.push("Bonded weapon becomes +" + Math.floor(level / 5) + 1 + " magical weapon")
        mechanics.effects.push("Bonded weapon returns to your hand if thrown (free action)")
        mechanics.effects.push("Bonded weapon cannot be disarmed")
        mechanics.effects.push("+2 bonus to attack and damage with bonded weapon")
        if (augmentationId === "silver") {
          mechanics.effects.push("Bonded weapon can transform into any weapon type")
        }
      } else if (abilityName.includes("Expertise") || abilityName.includes("Combat Expertise")) {
        mechanics.type = "Combat Ability"
        mechanics.action = "Standard Action"
        mechanics.effects.push("Make one additional attack at highest attack bonus")
        mechanics.effects.push(`+${Math.floor(level / 3) + 1} bonus to attack roll`)
        mechanics.effects.push(`+${Math.floor(level / 2) + 1} bonus to damage`)
        mechanics.effects.push("Can be used " + (1 + Math.floor(level / 5)) + " times per round")
      } else if (abilityName.includes("Augmented Arsenal")) {
        mechanics.type = "Augmentation Synergy"
        mechanics.action = "Free Action"
        mechanics.duration = "Permanent"
        mechanics.effects.push("All weapons you wield gain augmentation properties")
        mechanics.effects.push("Augmentation damage applies to all weapon attacks")
        mechanics.effects.push("Augmentation DCs increased by +2 for weapon attacks")
      } else if (abilityName.includes("Throw") || abilityName.includes("Weapon Throw")) {
        mechanics.type = "Ranged Attack"
        mechanics.action = "Standard Action"
        mechanics.range = "30 feet"
        mechanics.damage = `${baseDamage + 1}d6 + STR modifier`
        mechanics.effects.push("Throw any weapon as ranged attack")
        mechanics.effects.push("Weapon automatically returns to your hand after attack")
        mechanics.effects.push("Weapon deals damage as if melee attack")
        mechanics.effects.push("Can make multiple throws as full attack")
      } else if (abilityName.includes("Precision") || abilityName.includes("Master's Precision")) {
        mechanics.type = "Critical Hit Ability"
        mechanics.action = "Passive"
        mechanics.effects.push("Critical threat range increases by 1 (19-20 becomes 18-20, etc.)")
        mechanics.effects.push("Critical multiplier increases by 1 (x2 becomes x3, etc.)")
        mechanics.effects.push("+" + Math.floor(level / 2) + " bonus to confirm critical hits")
      } else if (abilityName.includes("Dance") || abilityName.includes("Weapon Dance")) {
        mechanics.type = "Full Attack"
        mechanics.action = "Full Round Action"
        mechanics.effects.push("Make attacks with multiple weapons in sequence")
        mechanics.effects.push("Gain +" + Math.floor(level / 3) + 1 + " attacks with off-hand weapon")
        mechanics.effects.push("No penalty for two-weapon fighting")
        mechanics.effects.push("All attacks gain +" + Math.floor(level / 4) + 1 + " to damage")
      } else if (abilityName.includes("Lord") || abilityName.includes("Summon")) {
        mechanics.type = "Weapon Summoning"
        mechanics.action = "Standard Action"
        mechanics.range = "30 feet"
        mechanics.effects.push("Summon any weapon you've mastered to your hand")
        mechanics.effects.push("Weapon appears in your hand instantly")
        mechanics.effects.push("Can summon " + (1 + Math.floor(level / 5)) + " weapons per round")
        mechanics.effects.push("Summoned weapons last until dismissed")
      } else if (abilityName.includes("Strike") || abilityName.includes("Perfect Strike")) {
        mechanics.type = "Special Attack"
        mechanics.action = "Standard Action"
        mechanics.range = "Melee"
        mechanics.damage = `${baseDamage + 2}d8 + STR modifier`
        mechanics.effects.push("Ignore target's armor and natural armor bonuses to AC")
        mechanics.effects.push("Deal damage directly to target's hit points")
        mechanics.effects.push("Can be used " + (1 + Math.floor(level / 5)) + " times per combat")
      } else if (abilityName.includes("Legendary") || abilityName.includes("Magical")) {
        mechanics.type = "Weapon Enhancement"
        mechanics.action = "Passive"
        mechanics.effects.push("All weapons you wield become +" + Math.floor(level / 5) + 1 + " magical weapons")
        mechanics.effects.push("All weapons bypass damage reduction")
        mechanics.effects.push("All weapons deal +" + Math.floor(level / 3) + 1 + "d6 damage")
      } else if (abilityName.includes("Storm") || abilityName.includes("Weapon Storm")) {
        mechanics.type = "Area Attack"
        mechanics.action = "Full Round Action"
        mechanics.range = "All enemies within reach"
        mechanics.damage = `${baseDamage}d6 + STR modifier`
        mechanics.effects.push("Attack all enemies within your reach simultaneously")
        mechanics.effects.push("Make one attack roll against each enemy")
        mechanics.effects.push("Each enemy takes full damage if hit")
        mechanics.effects.push("Can be used once per combat")
      } else if (abilityName.includes("Master of Arms") || abilityName.includes("Multiple")) {
        mechanics.type = "Multi-Weapon Fighting"
        mechanics.action = "Full Round Action"
        mechanics.effects.push("Wield any number of weapons simultaneously")
        mechanics.effects.push("Make attacks with all weapons in one full attack")
        mechanics.effects.push("No penalty for multiple weapons")
        mechanics.effects.push("Gain +" + Math.floor(level / 3) + 1 + " attacks per additional weapon")
      } else if (abilityName.includes("Incarnate") || abilityName.includes("Living Weapon")) {
        mechanics.type = "Transformation"
        mechanics.action = "Standard Action"
        mechanics.duration = `${2 + Math.floor(level / 2)} rounds`
        mechanics.effects.push("Your body becomes a collection of weapons")
        mechanics.effects.push("Gain +" + (Math.floor(level / 3) + 2) + " natural armor")
        mechanics.effects.push("All unarmed attacks deal " + baseDamage + "d6 damage")
        mechanics.effects.push("Can sprout weapons from any part of your body")
      } else if (abilityName.includes("Eternal") || abilityName.includes("Never Break")) {
        mechanics.type = "Passive Ability"
        mechanics.action = "Passive"
        mechanics.effects.push("All weapons you wield are indestructible")
        mechanics.effects.push("Weapons never dull or break")
        mechanics.effects.push("Weapons automatically repair themselves")
      } else if (abilityName.includes("Perfect Arsenal") || abilityName.includes("Legendary Status")) {
        mechanics.type = "Weapon Mastery"
        mechanics.action = "Passive"
        mechanics.effects.push("All weapons you wield become legendary (+5 equivalent)")
        mechanics.effects.push("All weapons gain special properties (flaming, shocking, etc.)")
        mechanics.effects.push("All weapons deal +" + Math.floor(level / 2) + 1 + "d6 damage")
      } else if (abilityName.includes("God") || abilityName.includes("Create")) {
        mechanics.type = "Divine Ability"
        mechanics.action = "Standard Action"
        mechanics.range = "Touch"
        mechanics.duration = "Permanent"
        mechanics.effects.push("Create new weapon types through will")
        mechanics.effects.push("Created weapons are +" + Math.floor(level / 3) + 1 + " magical")
        mechanics.effects.push("Created weapons have unique properties you design")
      }
    } else if (subclassId === "tactician") {
      if (abilityName.includes("Analysis") || abilityName.includes("Combat Analysis")) {
        mechanics.type = "Tactical Ability"
        mechanics.action = "Standard Action"
        mechanics.range = "60 feet"
        mechanics.duration = `${3 + Math.floor(level / 2)} rounds`
        mechanics.effects.push(`Gain +${Math.floor(level / 3) + 2} insight bonus to initiative`)
        mechanics.effects.push(`All allies within range gain +${Math.floor(level / 4) + 1} insight bonus to attack rolls`)
        mechanics.effects.push("Learn enemy AC, HP, and current conditions")
        mechanics.effects.push("Can identify enemy weaknesses and resistances")
        if (augmentationId === "black") {
          mechanics.augmentationBonus = "Shadow duplicates provide tactical advantage"
          mechanics.effects.push("Create shadow duplicate for flanking (grants +2 to attack)")
        } else if (augmentationId === "aquamarine") {
          mechanics.augmentationBonus = "Temporal analysis predicts enemy actions"
          mechanics.effects.push("+2 to initiative and reaction speed")
          mechanics.effects.push("Can act in surprise round even if surprised")
        } else if (augmentationId === "purple") {
          mechanics.augmentationBonus = "Mental link coordinates allies"
          mechanics.effects.push("Allies gain +1 insight bonus to all rolls")
          mechanics.effects.push("Allies can communicate telepathically")
        }
      } else if (abilityName.includes("Strategic") || abilityName.includes("Strategic Mind")) {
        mechanics.type = "Tactical Ability"
        mechanics.action = "Standard Action"
        mechanics.range = "60 feet"
        mechanics.duration = `${2 + Math.floor(level / 2)} rounds`
        mechanics.effects.push("Grant allies bonus actions through planning")
        mechanics.effects.push("Each ally can take one additional move action per round")
        mechanics.effects.push("Allies gain +" + Math.floor(level / 4) + 1 + " to attack rolls when following your plan")
        mechanics.effects.push("Can issue tactical commands as free action")
      } else if (abilityName.includes("Coordination") || abilityName.includes("Battle Coordination")) {
        mechanics.type = "Tactical Ability"
        mechanics.action = "Standard Action"
        mechanics.range = "60 feet"
        mechanics.duration = `${2 + Math.floor(level / 2)} rounds`
        mechanics.effects.push(`Allies gain +${Math.floor(level / 4) + 1} competence bonus to attack rolls when following your plan`)
        mechanics.effects.push("Allies gain +" + Math.floor(level / 5) + 1 + " to damage when coordinating attacks")
        mechanics.effects.push("Allies can share movement actions")
      } else if (abilityName.includes("Augmented Tactics")) {
        mechanics.type = "Augmentation Synergy"
        mechanics.action = "Free Action"
        mechanics.duration = "While using tactical abilities"
        mechanics.effects.push("All augmentation abilities gain +1 to DCs when used tactically")
        mechanics.effects.push("Augmentation durations extended by 1 round when coordinated")
        mechanics.effects.push("Can use augmentation abilities to enhance tactical plans")
      } else if (abilityName.includes("Advantage") || abilityName.includes("Tactical Advantage")) {
        mechanics.type = "Movement Ability"
        mechanics.action = "Free Action"
        mechanics.range = "30 feet"
        mechanics.effects.push("Reposition one ally within range as free action")
        mechanics.effects.push("Ally can move up to " + (10 + level * 5) + " feet")
        mechanics.effects.push("Ally does not provoke attacks of opportunity")
        mechanics.effects.push("Can be used " + (1 + Math.floor(level / 3)) + " times per round")
      } else if (abilityName.includes("Strategist") || abilityName.includes("Master Strategist")) {
        mechanics.type = "Predictive Ability"
        mechanics.action = "Standard Action"
        mechanics.range = "60 feet"
        mechanics.duration = `${1 + Math.floor(level / 3)} rounds`
        mechanics.effects.push("Predict enemy actions for next round")
        mechanics.effects.push("Automatically counter predicted enemy actions")
        mechanics.effects.push("Gain +" + (Math.floor(level / 2) + 2) + " to AC against predicted attacks")
        mechanics.effects.push("Gain +" + (Math.floor(level / 2) + 2) + " to attack rolls against predicted targets")
      } else if (abilityName.includes("Commander") || abilityName.includes("Battle Commander")) {
        mechanics.type = "Command Ability"
        mechanics.action = "Standard Action"
        mechanics.range = "60 feet"
        mechanics.save = `WILL DC ${baseDC} (harmless for allies)`
        mechanics.duration = `${1 + Math.floor(level / 3)} rounds`
        mechanics.effects.push("Issue commands that allies must follow")
        mechanics.effects.push("Allies gain +" + (Math.floor(level / 3) + 2) + " to attack and damage when following commands")
        mechanics.effects.push("Allies can act out of turn to follow commands")
        mechanics.effects.push("Can issue " + (1 + Math.floor(level / 5)) + " commands per round")
      } else if (abilityName.includes("Supremacy") || abilityName.includes("Tactical Supremacy")) {
        mechanics.type = "Battlefield Control"
        mechanics.action = "Full Round Action"
        mechanics.range = "60 feet radius"
        mechanics.duration = `${2 + Math.floor(level / 2)} rounds`
        mechanics.effects.push("Control battlefield positioning completely")
        mechanics.effects.push("Allies can move as free action within range")
        mechanics.effects.push("Enemies must make DEX save DC " + baseDC + " or be repositioned")
        mechanics.effects.push("Allies gain +" + (Math.floor(level / 3) + 2) + " to AC from positioning")
      } else if (abilityName.includes("Genius") || abilityName.includes("Strategic Genius")) {
        mechanics.type = "Planning Ability"
        mechanics.action = "Full Round Action"
        mechanics.range = "Self"
        mechanics.duration = `${1 + Math.floor(level / 2)} rounds`
        mechanics.effects.push("Plan multiple contingencies simultaneously")
        mechanics.effects.push("Can activate " + (1 + Math.floor(level / 3)) + " contingency plans per round")
        mechanics.effects.push("Each contingency grants +" + (Math.floor(level / 4) + 1) + " to specific actions")
        mechanics.effects.push("Contingencies can be: attack bonus, AC bonus, save bonus, or movement bonus")
      } else if (abilityName.includes("Legendary") || abilityName.includes("Battlefield Law")) {
        mechanics.type = "Area Effect"
        mechanics.action = "Standard Action"
        mechanics.range = "100 feet radius"
        mechanics.duration = `${2 + Math.floor(level / 2)} rounds`
        mechanics.effects.push("Your strategies become battlefield law")
        mechanics.effects.push("All allies within range gain +" + (Math.floor(level / 3) + 3) + " to all rolls")
        mechanics.effects.push("Enemies must make WILL save DC " + (baseDC + 2) + " or suffer -" + (Math.floor(level / 4) + 1) + " to all rolls")
      } else if (abilityName.includes("Omniscience") || abilityName.includes("Tactical Omniscience")) {
        mechanics.type = "Divination"
        mechanics.action = "Standard Action"
        mechanics.range = "100 feet"
        mechanics.duration = `${1 + Math.floor(level / 2)} rounds`
        mechanics.effects.push("See all possible battle outcomes")
        mechanics.effects.push("Know enemy actions before they happen")
        mechanics.effects.push("Gain +" + (Math.floor(level / 2) + 5) + " to initiative")
        mechanics.effects.push("Can act in surprise round and interrupt enemy actions")
      } else if (abilityName.includes("Master Commander") || abilityName.includes("Multiple Battlefields")) {
        mechanics.type = "Multi-Battlefield Control"
        mechanics.action = "Standard Action"
        mechanics.range = "Unlimited"
        mechanics.duration = `${2 + Math.floor(level / 2)} rounds`
        mechanics.effects.push("Control multiple battlefields at once")
        mechanics.effects.push("Can coordinate allies across any distance")
        mechanics.effects.push("All allies gain +" + (Math.floor(level / 3) + 2) + " to all rolls")
        mechanics.effects.push("Can issue commands to " + (level * 2) + " allies simultaneously")
      } else if (abilityName.includes("Incarnate") || abilityName.includes("Strategy Incarnate")) {
        mechanics.type = "Transformation"
        mechanics.action = "Standard Action"
        mechanics.duration = `${2 + Math.floor(level / 2)} rounds`
        mechanics.effects.push("Become living embodiment of tactics")
        mechanics.effects.push("All tactical abilities become free actions")
        mechanics.effects.push("Gain +" + (Math.floor(level / 2) + 3) + " to all mental ability scores")
        mechanics.effects.push("Can use multiple tactical abilities simultaneously")
      } else if (abilityName.includes("Eternal") || abilityName.includes("General")) {
        mechanics.type = "Legacy Ability"
        mechanics.action = "Passive"
        mechanics.effects.push("Your strategies outlive you")
        mechanics.effects.push("Allies remember your tactics and gain +" + Math.floor(level / 5) + 1 + " to all rolls")
        mechanics.effects.push("Can leave tactical plans that persist after your death")
      } else if (abilityName.includes("Perfect Strategy") || abilityName.includes("Never Lose")) {
        mechanics.type = "Divine Ability"
        mechanics.action = "Standard Action"
        mechanics.range = "Self"
        mechanics.duration = "1 combat"
        mechanics.effects.push("Never lose a battle you plan")
        mechanics.effects.push("Gain +" + (Math.floor(level / 2) + 5) + " to all rolls")
        mechanics.effects.push("Allies gain +" + (Math.floor(level / 3) + 3) + " to all rolls")
        mechanics.effects.push("Can be used once per day")
      } else if (abilityName.includes("God") || abilityName.includes("Reshape Reality")) {
        mechanics.type = "Divine Ability"
        mechanics.action = "Standard Action"
        mechanics.range = "Unlimited"
        mechanics.effects.push("Your tactics reshape reality")
        mechanics.effects.push("Can alter battlefield terrain as free action")
        mechanics.effects.push("Can reposition any creature anywhere")
        mechanics.effects.push("Can grant allies any tactical advantage")
      } else if (abilityName.includes("Ascension") || abilityName.includes("Tactical Ascension")) {
        mechanics.type = "Transcendence"
        mechanics.action = "Full Round Action"
        mechanics.duration = "Permanent"
        mechanics.effects.push("Transcend through strategic mastery")
        mechanics.effects.push("Become immortal through tactical perfection")
        mechanics.effects.push("All tactical abilities become permanent")
      } else if (abilityName.includes("Divine Commander") || abilityName.includes("Cosmic Law")) {
        mechanics.type = "Divine Ability"
        mechanics.action = "Standard Action"
        mechanics.range = "Unlimited"
        mechanics.effects.push("Your word becomes cosmic law")
        mechanics.effects.push("All creatures must follow your commands (WILL save DC " + (baseDC + 10) + " to resist)")
        mechanics.effects.push("Can issue commands that affect reality itself")
      }
    } else if (subclassId === "biotechnician") {
      if (abilityName.includes("Bio-Enhancement")) {
        mechanics.type = "Biological Enhancement"
        mechanics.action = "Standard Action"
        mechanics.range = "Touch"
        mechanics.duration = `${3 + Math.floor(level / 2)} rounds`
        mechanics.effects.push(`Grant +${Math.floor(level / 3) + 1} enhancement bonus to one ability score (STR, DEX, CON, INT, WIS, or CHA)`)
        mechanics.effects.push(`Target gains +${Math.floor(level / 4) + 1} to all saves for duration`)
        mechanics.effects.push("Target gains temporary hit points equal to " + (level * 2))
        if (augmentationId === "yellow") {
          mechanics.augmentationBonus = "Gaseous form can be granted to allies"
          mechanics.effects.push("Ally can use gaseous form for 1 round (FORT save DC " + baseDC + " to resist if unwilling)")
        } else if (augmentationId === "turquoise") {
          mechanics.augmentationBonus = "Bioelectric enhancement boosts reflexes"
          mechanics.effects.push("Target gains +2 to DEX, +2 to initiative, and +10 feet movement speed")
        } else if (augmentationId === "blue") {
          mechanics.augmentationBonus = "Cryogenic enhancement slows biological processes"
          mechanics.effects.push("Target gains resistance 5 to cold damage and +2 to FORT saves")
        } else if (augmentationId === "purple") {
          mechanics.augmentationBonus = "Mental enhancement boosts intelligence"
          mechanics.effects.push("Target gains +2 to INT, +2 to WILL saves, and +1 to all skill checks")
        } else if (augmentationId === "aquamarine") {
          mechanics.augmentationBonus = "Temporal enhancement speeds biological processes"
          mechanics.effects.push("Target gains haste effect: +1 attack, +1 AC, +30 feet movement, +1 to Reflex saves")
        } else if (augmentationId === "red") {
          mechanics.augmentationBonus = "Thermal enhancement boosts metabolism"
          mechanics.effects.push("Target gains +2 to CON, +1 HP per level, and fast healing 1")
        }
      } else if (abilityName.includes("Genetic") || abilityName.includes("Analysis")) {
        mechanics.type = "Genetic Analysis"
        mechanics.action = "Full Round Action"
        mechanics.range = "Touch"
        mechanics.duration = "Instant"
        mechanics.effects.push("Learn target's exact HP, ability scores, and current conditions")
        mechanics.effects.push("Identify all diseases, poisons, and curses affecting target")
        mechanics.effects.push("Determine target's weaknesses and resistances")
        mechanics.effects.push("Gain +" + Math.floor(level / 2) + " bonus to next attack or ability used against this target")
      } else if (abilityName.includes("Biological") || abilityName.includes("Adaptation")) {
        mechanics.type = "Biological Adaptation"
        mechanics.action = "Standard Action"
        mechanics.range = "Touch"
        mechanics.duration = `${2 + Math.floor(level / 3)} rounds`
        mechanics.save = `FORT DC ${baseDC} (harmless)`
        mechanics.effects.push(`Grant damage resistance ${Math.floor(level / 3) + 1} to one damage type`)
        mechanics.effects.push("Target gains immunity to one disease or poison")
        if (augmentationId === "blue") {
          mechanics.effects.push("Grant resistance 10 to cold damage")
        } else if (augmentationId === "red") {
          mechanics.effects.push("Grant resistance 10 to fire damage")
        }
      } else if (abilityName.includes("Evolutionary") || abilityName.includes("Leap")) {
        mechanics.type = "Permanent Enhancement"
        mechanics.action = "1 hour (ritual)"
        mechanics.range = "Touch"
        mechanics.duration = "Permanent"
        mechanics.effects.push(`Permanently increase target's one ability score by +${Math.floor(level / 5) + 1}`)
        mechanics.effects.push("Target gains one permanent special ability (chosen from available list)")
        mechanics.effects.push("Can only be used once per target per level")
      } else if (abilityName.includes("Mastery") || abilityName.includes("Control")) {
        mechanics.type = "Biological Control"
        mechanics.action = "Standard Action"
        mechanics.range = "30 feet"
        mechanics.save = `FORT DC ${baseDC}`
        mechanics.duration = `${1 + Math.floor(level / 3)} rounds`
        mechanics.effects.push("Control target's biological functions remotely")
        mechanics.effects.push("Can cause target to be slowed, sickened, or nauseated")
        mechanics.effects.push("Can grant target temporary bonuses to physical abilities")
      } else if (abilityName.includes("Engineering") || abilityName.includes("Create")) {
        mechanics.type = "Biological Creation"
        mechanics.action = "Full Round Action"
        mechanics.range = "Touch"
        mechanics.duration = `${Math.floor(level / 2) + 2} rounds`
        mechanics.effects.push("Create temporary biological ability in target")
        mechanics.effects.push("Examples: temporary wings (fly speed 30), gills (breathe underwater), enhanced senses (+5 Perception)")
        mechanics.effects.push("Target gains one special ability from augmentation list for duration")
      } else if (abilityName.includes("Weapon") || abilityName.includes("Bio-Weapon")) {
        mechanics.type = "Biological Weapon"
        mechanics.action = "Standard Action"
        mechanics.range = "30 feet"
        mechanics.damage = `${baseDamage}d6 + CON modifier`
        mechanics.save = `FORT DC ${baseDC}`
        mechanics.effects.push("Create biological weapon that deals " + baseDamage + "d6 damage")
        mechanics.effects.push("Target must make FORT save or be poisoned (1d4 CON damage)")
        if (augmentationId === "yellow") {
          mechanics.effects.push("Weapon releases toxic gas (5-foot radius, FORT save DC " + baseDC + " or be nauseated)")
        }
      }
    } else if (subclassId === "nanotechnician") {
      if (abilityName.includes("Nano") || abilityName.includes("Swarm") || abilityName.includes("Deploy")) {
        mechanics.type = "Nanobot Deployment"
        mechanics.action = "Standard Action"
        mechanics.range = "60 feet"
        mechanics.duration = `${2 + Math.floor(level / 2)} rounds`
        mechanics.save = `FORT DC ${baseDC}`
        mechanics.effects.push("Deploy nanobot swarm to target creature")
        mechanics.effects.push(`Target takes ${baseDamage}d4 damage per round (automatic, no save)`)
        mechanics.effects.push("Target must make FORT save DC " + baseDC + " each round or be sickened (-2 to all rolls)")
        mechanics.effects.push("Nanobots can be removed with remove disease or similar effect")
        if (augmentationId === "turquoise") {
          mechanics.augmentationBonus = "Nanobots conduct electrical energy"
          mechanics.effects.push("+1d4 electrical damage per round")
          mechanics.effects.push("Target must make FORT save DC " + baseDC + " or be stunned 1 round")
        } else if (augmentationId === "red") {
          mechanics.augmentationBonus = "Nanobots generate heat"
          mechanics.effects.push("+1d4 fire damage per round")
          mechanics.effects.push("Target's equipment may be damaged (1% chance per round)")
        } else if (augmentationId === "blue") {
          mechanics.augmentationBonus = "Nanobots freeze targets from within"
          mechanics.effects.push("+1d4 cold damage per round")
          mechanics.effects.push("Target must make FORT save DC " + baseDC + " or be slowed (half speed)")
        } else if (augmentationId === "white") {
          mechanics.augmentationBonus = "Nanobots generate plasma"
          mechanics.effects.push("+1d4 plasma damage per round")
          mechanics.effects.push("Target's armor may be damaged (2% chance per round)")
        } else if (augmentationId === "black") {
          mechanics.augmentationBonus = "Nanobots create void pockets"
          mechanics.effects.push("Target has 25% miss chance (concealment)")
          mechanics.effects.push("Target's attacks have 25% chance to fail")
        }
      } else if (abilityName.includes("Repair") || abilityName.includes("Enhance")) {
        mechanics.type = "Nanobot Enhancement"
        mechanics.action = "Standard Action"
        mechanics.range = "Touch"
        mechanics.duration = `${3 + Math.floor(level / 2)} rounds`
        mechanics.effects.push("Deploy nanobots to enhance target's equipment")
        mechanics.effects.push("Target's weapon gains +" + Math.floor(level / 3) + 1 + " enhancement bonus")
        mechanics.effects.push("Target's armor gains +" + Math.floor(level / 4) + 1 + " enhancement bonus")
        mechanics.effects.push("Target gains fast healing " + Math.floor(level / 5) + 1)
      } else if (abilityName.includes("Control") || abilityName.includes("Hack")) {
        mechanics.type = "Nanobot Control"
        mechanics.action = "Standard Action"
        mechanics.range = "60 feet"
        mechanics.save = `WILL DC ${baseDC}`
        mechanics.duration = `${1 + Math.floor(level / 3)} rounds`
        mechanics.effects.push("Deploy nanobots to control target's cybernetic implants")
        mechanics.effects.push("Target must make WILL save DC " + baseDC + " or lose control of cybernetics")
        mechanics.effects.push("Can force target to use cybernetics against themselves")
        mechanics.effects.push("Can disable target's cybernetic abilities")
      } else if (abilityName.includes("Cloud") || abilityName.includes("Area")) {
        mechanics.type = "Area Nanobot Deployment"
        mechanics.action = "Standard Action"
        mechanics.range = "30 feet radius"
        mechanics.save = `FORT DC ${baseDC}`
        mechanics.duration = `${2 + Math.floor(level / 2)} rounds`
        mechanics.effects.push("Deploy nanobot cloud covering 30-foot radius")
        mechanics.effects.push("All creatures in area take " + baseDamage + "d4 damage per round")
        mechanics.effects.push("Creatures must make FORT save DC " + baseDC + " each round or be sickened")
        mechanics.effects.push("Cloud moves 10 feet per round in direction you choose")
      } else if (abilityName.includes("Master") || abilityName.includes("Advanced")) {
        mechanics.type = "Advanced Nanobots"
        mechanics.action = "Standard Action"
        mechanics.range = "100 feet"
        mechanics.duration = `${3 + Math.floor(level / 2)} rounds`
        mechanics.effects.push("Deploy advanced nanobots with enhanced capabilities")
        mechanics.effects.push("Nanobots deal " + (baseDamage + 1) + "d4 damage per round")
        mechanics.effects.push("Nanobots can repair your equipment automatically")
        mechanics.effects.push("Nanobots can create temporary equipment")
      }
    } else if (subclassId === "spheremaster") {
      if (abilityName.includes("Sphere") || abilityName.includes("Control")) {
        mechanics.type = "Sphere Control"
        mechanics.action = "Standard Action"
        mechanics.range = "60 feet"
        mechanics.duration = "Concentration (up to " + (Math.floor(level / 2) + 3) + " rounds)"
        mechanics.damage = `${baseDamage}d6`
        mechanics.save = `DEX DC ${baseDC} for half`
        mechanics.effects.push("Create and control " + (Math.floor(level / 3) + 1) + " spheres")
        mechanics.effects.push("Each sphere can move 30 feet per round as move action")
        mechanics.effects.push("Each sphere can attack one target per round (standard action)")
        mechanics.effects.push("Spheres can change properties as free action")
        mechanics.effects.push("Spheres have AC " + (10 + level) + " and " + (level * 2) + " HP")
        if (augmentationId === "blue") {
          mechanics.augmentationBonus = "Spheres can become ice or water"
          mechanics.effects.push("Spheres deal cold damage")
          mechanics.effects.push("Spheres can freeze targets (FORT save DC " + baseDC + " or be slowed)")
        } else if (augmentationId === "red") {
          mechanics.augmentationBonus = "Spheres can become fire or plasma"
          mechanics.effects.push("Spheres deal fire damage")
          mechanics.effects.push("Spheres can ignite targets (1d4 fire damage per round)")
        } else if (augmentationId === "white") {
          mechanics.augmentationBonus = "Spheres can become pure plasma"
          mechanics.effects.push("Spheres deal plasma damage")
          mechanics.effects.push("Spheres can stun targets (FORT save DC " + baseDC + " or be stunned)")
        } else if (augmentationId === "turquoise") {
          mechanics.augmentationBonus = "Spheres can conduct electricity"
          mechanics.effects.push("Spheres deal electrical damage")
          mechanics.effects.push("Spheres can chain to nearby targets (within 10 feet)")
        } else if (augmentationId === "black") {
          mechanics.augmentationBonus = "Spheres can become void matter"
          mechanics.effects.push("Spheres create shadow duplicates when destroyed")
          mechanics.effects.push("Shadow duplicates last 1 round and attack enemies")
        }
      } else if (abilityName.includes("Master") || abilityName.includes("Advanced")) {
        mechanics.type = "Advanced Sphere Control"
        mechanics.action = "Standard Action"
        mechanics.range = "100 feet"
        mechanics.duration = "Concentration (up to " + (Math.floor(level / 2) + 4) + " rounds)"
        mechanics.effects.push("Control " + (Math.floor(level / 2) + 2) + " spheres")
        mechanics.effects.push("Spheres can combine into larger spheres (2x damage)")
        mechanics.effects.push("Spheres can split into smaller spheres (more attacks)")
        mechanics.effects.push("Spheres gain +" + Math.floor(level / 3) + 1 + " to attack and damage")
      } else if (abilityName.includes("Storm") || abilityName.includes("Multiple")) {
        mechanics.type = "Sphere Storm"
        mechanics.action = "Full Round Action"
        mechanics.range = "60 feet radius"
        mechanics.damage = `${baseDamage + 1}d6`
        mechanics.save = `DEX DC ${baseDC} for half`
        mechanics.effects.push("Create sphere storm covering 60-foot radius")
        mechanics.effects.push("All creatures in area take " + (baseDamage + 1) + "d6 damage")
        mechanics.effects.push("Spheres continue to attack for " + (1 + Math.floor(level / 3)) + " rounds")
        mechanics.effects.push("Can be used once per combat")
      }
    } else if (subclassId === "dronecommander") {
      if (abilityName.includes("Drone") || abilityName.includes("Swarm") || abilityName.includes("Deploy")) {
        mechanics.type = "Drone Command"
        mechanics.action = "Standard Action"
        mechanics.range = "100 feet"
        mechanics.duration = "Permanent (until destroyed or dismissed)"
        mechanics.effects.push("Deploy and command " + (Math.floor(level / 2) + 2) + " combat drones")
        mechanics.effects.push("Each drone has AC " + (12 + level) + ", " + (level * 3) + " HP, and fly speed 40")
        mechanics.effects.push(`Each drone can attack once per round, dealing ${Math.floor(baseDamage / 2) + 1}d4 damage`)
        mechanics.effects.push("Drones act on your turn and follow your commands")
        mechanics.effects.push("Drones can be commanded as free action")
        mechanics.effects.push("Drones can be dismissed and redeployed as standard action")
        if (augmentationId === "turquoise") {
          mechanics.augmentationBonus = "Drones can discharge electrical energy"
          mechanics.effects.push("Drones deal +1d4 electrical damage")
          mechanics.effects.push("Drones can stun targets (FORT save DC " + baseDC + " or be stunned 1 round)")
        } else if (augmentationId === "blue") {
          mechanics.augmentationBonus = "Drones can freeze targets"
          mechanics.effects.push("Drones deal +1d4 cold damage")
          mechanics.effects.push("Drones can slow targets (FORT save DC " + baseDC + " or be slowed)")
        } else if (augmentationId === "red") {
          mechanics.augmentationBonus = "Drones can generate heat"
          mechanics.effects.push("Drones deal +1d4 fire damage")
          mechanics.effects.push("Drones can ignite targets (1d4 fire damage per round)")
        } else if (augmentationId === "white") {
          mechanics.augmentationBonus = "Drones can generate plasma"
          mechanics.effects.push("Drones deal +1d4 plasma damage")
          mechanics.effects.push("Drones can stun targets (FORT save DC " + baseDC + " or be stunned)")
        } else if (augmentationId === "black") {
          mechanics.augmentationBonus = "Drones can create void fields"
          mechanics.effects.push("Drones grant 20% concealment to nearby allies")
        }
      } else if (abilityName.includes("Network") || abilityName.includes("Swarm Intelligence")) {
        mechanics.type = "Drone Network"
        mechanics.action = "Standard Action"
        mechanics.range = "Unlimited"
        mechanics.duration = "Permanent"
        mechanics.effects.push("All drones share information and coordinate attacks")
        mechanics.effects.push("Drones gain +" + Math.floor(level / 3) + 1 + " to attack and damage when coordinating")
        mechanics.effects.push("Drones can share damage (distribute damage among all drones)")
        mechanics.effects.push("Can command drones across any distance")
      } else if (abilityName.includes("Master") || abilityName.includes("Advanced")) {
        mechanics.type = "Advanced Drones"
        mechanics.action = "Standard Action"
        mechanics.range = "100 feet"
        mechanics.effects.push("Deploy " + (Math.floor(level / 2) + 3) + " advanced drones")
        mechanics.effects.push("Advanced drones have AC " + (14 + level) + " and " + (level * 4) + " HP")
        mechanics.effects.push("Advanced drones deal " + (Math.floor(baseDamage / 2) + 2) + "d4 damage")
        mechanics.effects.push("Advanced drones can use special abilities (heal, shield, etc.)")
      } else if (abilityName.includes("Army") || abilityName.includes("Legion")) {
        mechanics.type = "Drone Army"
        mechanics.action = "Full Round Action"
        mechanics.range = "100 feet"
        mechanics.duration = "Permanent"
        mechanics.effects.push("Deploy " + (level * 2) + " drones")
        mechanics.effects.push("Drones form coordinated attack patterns")
        mechanics.effects.push("All drones gain +" + Math.floor(level / 3) + 1 + " to attack and damage")
        mechanics.effects.push("Can be used once per day")
      }
    } else if (subclassId === "armortech") {
      if (abilityName.includes("Armor") || abilityName.includes("Enhancement") || abilityName.includes("Upgrade")) {
        mechanics.type = "Armor Enhancement"
        mechanics.action = "Free Action"
        mechanics.duration = "Permanent (until dismissed)"
        mechanics.effects.push(`Gain +${Math.floor(level / 3) + 2} enhancement bonus to AC`)
        mechanics.effects.push(`Gain damage reduction ${Math.floor(level / 4) + 1}/-`)
        mechanics.effects.push("Armor cannot be removed against your will")
        mechanics.effects.push("Armor repairs itself at rate of " + Math.floor(level / 5) + 1 + " HP per round")
        if (augmentationId === "blue") {
          mechanics.augmentationBonus = "Armor generates ice barriers"
          mechanics.effects.push("+1 deflection bonus to AC from ice barriers")
          mechanics.effects.push("Resistance 5 to cold damage")
          mechanics.effects.push("Enemies that hit you with melee attacks take 1d4 cold damage")
        } else if (augmentationId === "red") {
          mechanics.augmentationBonus = "Armor generates heat shields"
          mechanics.effects.push("Resistance 10 to fire damage")
          mechanics.effects.push("Enemies within 5 feet take 1d4 fire damage per round")
        } else if (augmentationId === "white") {
          mechanics.augmentationBonus = "Armor generates plasma barriers"
          mechanics.effects.push("Resistance 10 to energy damage (fire, cold, electrical, plasma)")
          mechanics.effects.push("+1 deflection bonus to AC from plasma barriers")
        } else if (augmentationId === "black") {
          mechanics.augmentationBonus = "Armor creates shadow barriers"
          mechanics.effects.push("25% concealment (miss chance) from all attacks")
          mechanics.effects.push("Enemies have 25% chance to miss you")
        } else if (augmentationId === "turquoise") {
          mechanics.augmentationBonus = "Armor generates electrical fields"
          mechanics.effects.push("Melee attackers take 1d4 electrical damage")
          mechanics.effects.push("Ranged attacks have 25% miss chance (electrical interference)")
        } else if (augmentationId === "yellow") {
          mechanics.augmentationBonus = "Armor can become gaseous"
          mechanics.effects.push("Can enter gaseous form while wearing armor")
          mechanics.effects.push("Armor becomes part of gaseous form")
        }
      } else if (abilityName.includes("Master") || abilityName.includes("Advanced")) {
        mechanics.type = "Advanced Armor"
        mechanics.action = "Free Action"
        mechanics.duration = "Permanent"
        mechanics.effects.push("Armor gains +" + (Math.floor(level / 3) + 3) + " enhancement bonus to AC")
        mechanics.effects.push("Armor gains damage reduction " + (Math.floor(level / 4) + 2) + "/-")
        mechanics.effects.push("Armor grants fast healing " + Math.floor(level / 5) + 1)
        mechanics.effects.push("Armor can generate temporary weapons")
      } else if (abilityName.includes("Adaptive") || abilityName.includes("Reactive")) {
        mechanics.type = "Reactive Armor"
        mechanics.action = "Immediate Action"
        mechanics.effects.push("Armor automatically adapts to incoming attacks")
        mechanics.effects.push("Gain resistance 10 to last damage type that hit you")
        mechanics.effects.push("Resistance lasts for " + (1 + Math.floor(level / 3)) + " rounds")
        mechanics.effects.push("Can be used " + (1 + Math.floor(level / 5)) + " times per combat")
      } else if (abilityName.includes("Living") || abilityName.includes("Organic")) {
        mechanics.type = "Living Armor"
        mechanics.action = "Standard Action"
        mechanics.duration = `${2 + Math.floor(level / 2)} rounds`
        mechanics.effects.push("Armor becomes living and can regenerate")
        mechanics.effects.push("Gain fast healing " + (Math.floor(level / 3) + 2))
        mechanics.effects.push("Armor can grow additional protective layers")
        mechanics.effects.push("+2 additional AC from living armor")
      }
    } else if (subclassId === "medic") {
      if (abilityName.includes("Heal") || abilityName.includes("Medical") || abilityName.includes("Treatment")) {
        mechanics.type = "Healing Ability"
        mechanics.action = "Standard Action"
        mechanics.range = "Touch"
        mechanics.effects.push(`Heal ${baseDamage * 2}d4 + ${level} HP`)
        mechanics.effects.push("Cure all diseases and poisons")
        mechanics.effects.push("Remove one condition (sickened, nauseated, etc.)")
        if (level >= 5) {
          mechanics.effects.push("Can revive recently deceased (within 1 round of death)")
        }
        if (level >= 10) {
          mechanics.effects.push("Can restore lost limbs and organs")
        }
        if (augmentationId === "turquoise") {
          mechanics.augmentationBonus = "Bioelectric healing accelerates recovery"
          mechanics.effects.push("+1d4 additional healing")
          mechanics.effects.push("Target gains +2 to initiative for " + (1 + Math.floor(level / 3)) + " rounds")
        } else if (augmentationId === "yellow") {
          mechanics.augmentationBonus = "Gaseous form allows healing through barriers"
          mechanics.effects.push("Can heal through walls and obstacles (range increases to 30 feet)")
        } else if (augmentationId === "blue") {
          mechanics.augmentationBonus = "Cryogenic healing preserves life"
          mechanics.effects.push("Target gains resistance 5 to cold damage")
          mechanics.effects.push("Target cannot die from massive damage for " + (1 + Math.floor(level / 3)) + " rounds")
        }
      } else if (abilityName.includes("Emergency") || abilityName.includes("Response")) {
        mechanics.type = "Reactive Healing"
        mechanics.action = "Immediate Action"
        mechanics.range = "30 feet"
        mechanics.effects.push(`Instant heal ${baseDamage * 2}d4 HP`)
        mechanics.effects.push("Stabilize dying allies automatically (no save needed)")
        mechanics.effects.push("Can be used " + (1 + Math.floor(level / 3)) + " times per round")
        mechanics.effects.push("Target gains temporary hit points equal to " + level)
      } else if (abilityName.includes("Field") || abilityName.includes("Medicine")) {
        mechanics.type = "Field Medicine"
        mechanics.action = "Standard Action"
        mechanics.range = "Touch"
        mechanics.duration = `${1 + Math.floor(level / 2)} rounds`
        mechanics.effects.push("Heal during combat without penalty")
        mechanics.effects.push("Heal " + (baseDamage * 2) + "d4 HP per round")
        mechanics.effects.push("Can move and heal simultaneously")
        mechanics.effects.push("No attacks of opportunity for healing")
      } else if (abilityName.includes("Expertise") || abilityName.includes("Medical Expertise")) {
        mechanics.type = "Medical Analysis"
        mechanics.action = "Standard Action"
        mechanics.range = "Touch"
        mechanics.duration = "Instant"
        mechanics.effects.push("Diagnose all conditions affecting target")
        mechanics.effects.push("Identify all diseases, poisons, and curses")
        mechanics.effects.push("Learn target's exact HP and ability scores")
        mechanics.effects.push("Gain +" + (Math.floor(level / 2) + 2) + " to next healing check on this target")
      } else if (abilityName.includes("Augmented") || abilityName.includes("Augmented Healing")) {
        mechanics.type = "Augmentation Synergy"
        mechanics.action = "Free Action"
        mechanics.duration = "While healing"
        mechanics.effects.push("All augmentation abilities enhance healing")
        mechanics.effects.push("Healing gains +1d4 HP per augmentation level")
        mechanics.effects.push("Can use augmentation abilities to heal")
      } else if (abilityName.includes("Combat") || abilityName.includes("Combat Medic")) {
        mechanics.type = "Combat Healing"
        mechanics.action = "Full Round Action"
        mechanics.range = "Touch"
        mechanics.effects.push("Heal and fight simultaneously")
        mechanics.effects.push("Make one attack and heal " + (baseDamage * 2) + "d4 HP")
        mechanics.effects.push("No penalty to attack or healing")
        mechanics.effects.push("Can be used " + (1 + Math.floor(level / 5)) + " times per round")
      } else if (abilityName.includes("Advanced") || abilityName.includes("Advanced Treatment")) {
        mechanics.type = "Advanced Healing"
        mechanics.action = "Standard Action"
        mechanics.range = "Touch"
        mechanics.effects.push("Cure poisons, diseases, and curses")
        mechanics.effects.push("Restore ability score damage")
        mechanics.effects.push("Remove negative levels")
        mechanics.effects.push("Heal " + (baseDamage * 3) + "d4 + " + (level * 2) + " HP")
      } else if (abilityName.includes("Miracle") || abilityName.includes("Medical Miracle")) {
        mechanics.type = "Resurrection"
        mechanics.action = "Full Round Action"
        mechanics.range = "Touch"
        mechanics.effects.push("Bring back recently deceased (within " + (1 + Math.floor(level / 3)) + " rounds)")
        mechanics.effects.push("Target returns with full HP and no negative levels")
        mechanics.effects.push("Can be used once per day")
        mechanics.effects.push("Requires material components worth " + (level * 100) + " credits")
      } else if (abilityName.includes("Surgeon") || abilityName.includes("Battlefield Surgeon")) {
        mechanics.type = "Surgical Healing"
        mechanics.action = "Full Round Action"
        mechanics.range = "Touch"
        mechanics.effects.push("Perform surgery during combat")
        mechanics.effects.push("Heal " + (baseDamage * 4) + "d4 + " + (level * 2) + " HP")
        mechanics.effects.push("Restore lost limbs and organs")
        mechanics.effects.push("Remove all conditions and negative effects")
        mechanics.effects.push("Can be used once per combat")
      }
    }
    
    // Additional mechanics for movement/positioning abilities
    if (abilityName.includes("Leap") || abilityName.includes("Jump") || abilityName.includes("Move")) {
      if (!mechanics.range) mechanics.range = `${10 + level * 2} feet`
      mechanics.effects.push("Can move through difficult terrain")
      if (level >= 5) {
        mechanics.effects.push("Can move through enemy spaces")
      }
    }
    
    // Additional mechanics for area effects
    if (abilityName.includes("Area") || abilityName.includes("Storm") || abilityName.includes("Field") || abilityName.includes("Aura")) {
      if (!mechanics.range) mechanics.range = `${5 + Math.floor(level / 2) * 5} feet radius`
      mechanics.effects.push("Affects all targets in area")
      if (level >= 10) {
        mechanics.effects.push("Can exclude allies from effect")
      }
    }
    
    // Additional mechanics for multi-target abilities
    if (abilityName.includes("Multiple") || abilityName.includes("All") || abilityName.includes("Swarm") || abilityName.includes("Network")) {
      mechanics.effects.push(`Affects up to ${Math.floor(level / 2) + 2} targets`)
      if (level >= 10) {
        mechanics.effects.push("Can affect unlimited targets")
      }
    }
    
    // Additional mechanics for defensive abilities
    if (abilityName.includes("Resist") || abilityName.includes("Immune") || abilityName.includes("Defense") || abilityName.includes("Resilience")) {
      mechanics.type = "Defensive Ability"
      mechanics.action = "Free Action"
      if (!mechanics.duration) mechanics.duration = `${Math.floor(level / 2) + 2} rounds`
      mechanics.effects.push(`Damage resistance ${Math.floor(level / 3) + 1}`)
      if (level >= 10) {
        mechanics.effects.push("Immunity to specific damage types")
      }
    }
    
    // Additional mechanics for offensive abilities
    if (abilityName.includes("Strike") || abilityName.includes("Attack") || abilityName.includes("Damage") || abilityName.includes("Weapon")) {
      if (!mechanics.damage) {
        mechanics.damage = `${baseDamage}d6 + STR modifier`
      }
      if (level >= 5) {
        mechanics.effects.push("Can make additional attacks")
      }
    }

    // Additional mechanics for specific abilities
    if (abilityName.includes("Master") || abilityName.includes("Legendary") || abilityName.includes("Ultimate")) {
      mechanics.effects.push("All previous abilities in this path are enhanced")
      mechanics.effects.push("Can use multiple abilities simultaneously")
    }
    
    if (abilityName.includes("God") || abilityName.includes("Divine") || abilityName.includes("Ascension")) {
      mechanics.type = "Divine Ability"
      mechanics.effects.push("Transcends normal limitations")
      mechanics.effects.push("Effects become permanent or near-permanent")
    }

    // Add mechanics for remaining subclasses
    if (subclassId === "spiritualist") {
      if (abilityName.includes("Spirit") || abilityName.includes("Channel") || abilityName.includes("Channeling")) {
        mechanics.type = "Spiritual Ability"
        mechanics.action = "Standard Action"
        mechanics.range = "60 feet"
        mechanics.duration = `${2 + Math.floor(level / 2)} rounds`
        mechanics.effects.push("Commune with spirits for guidance and power")
        mechanics.effects.push("Gain +" + (Math.floor(level / 3) + 2) + " insight bonus to all rolls")
        mechanics.effects.push("Spirits provide information about enemies (AC, HP, weaknesses)")
        if (augmentationId === "black") {
          mechanics.augmentationBonus = "Shadow spirits enhance abilities"
          mechanics.effects.push("Spirits can create shadow duplicates")
        } else if (augmentationId === "purple") {
          mechanics.augmentationBonus = "Mental spirits enhance communication"
          mechanics.effects.push("Can communicate with spirits telepathically")
        }
      } else if (abilityName.includes("Healing") || abilityName.includes("Spiritual Healing")) {
        mechanics.type = "Spiritual Healing"
        mechanics.action = "Standard Action"
        mechanics.range = "Touch"
        mechanics.effects.push("Channel spirit energy to heal " + (baseDamage * 2) + "d4 + " + level + " HP")
        mechanics.effects.push("Cure diseases and remove curses")
        mechanics.effects.push("Restore ability score damage")
      } else if (abilityName.includes("Guide") || abilityName.includes("Spirit Guide")) {
        mechanics.type = "Spirit Companion"
        mechanics.action = "1 hour ritual"
        mechanics.duration = "Permanent"
        mechanics.effects.push("Gain permanent spirit companion")
        mechanics.effects.push("Spirit provides +" + Math.floor(level / 3) + 1 + " to all rolls")
        mechanics.effects.push("Spirit can scout and provide information")
        mechanics.effects.push("Spirit has " + (level * 5) + " HP and AC " + (10 + level))
      } else if (abilityName.includes("Army") || abilityName.includes("Spirit Army")) {
        mechanics.type = "Spirit Summoning"
        mechanics.action = "Full Round Action"
        mechanics.range = "60 feet"
        mechanics.duration = `${2 + Math.floor(level / 2)} rounds`
        mechanics.effects.push("Summon " + (Math.floor(level / 2) + 2) + " spirits to aid you")
        mechanics.effects.push("Each spirit can attack (1d6 damage) or provide bonuses")
        mechanics.effects.push("Spirits have AC " + (12 + level) + " and " + (level * 3) + " HP")
      } else if (abilityName.includes("Transcendence") || abilityName.includes("Spiritual Transcendence")) {
        mechanics.type = "Transformation"
        mechanics.action = "Standard Action"
        mechanics.duration = `${2 + Math.floor(level / 2)} rounds`
        mechanics.effects.push("Partially exist in spirit realm")
        mechanics.effects.push("Gain 50% incorporeal (half damage from physical attacks)")
        mechanics.effects.push("Can move through walls and obstacles")
      } else if (abilityName.includes("Mastery") || abilityName.includes("Spirit Mastery")) {
        mechanics.type = "Spirit Control"
        mechanics.action = "Standard Action"
        mechanics.range = "60 feet"
        mechanics.save = `WILL DC ${baseDC}`
        mechanics.effects.push("Command spirits instead of just communing")
        mechanics.effects.push("Spirits must follow your commands (WILL save to resist)")
        mechanics.effects.push("Can control " + (Math.floor(level / 3) + 1) + " spirits simultaneously")
      } else if (abilityName.includes("Fusion") || abilityName.includes("Spiritual Fusion")) {
        mechanics.type = "Spirit Merge"
        mechanics.action = "Full Round Action"
        mechanics.duration = `${3 + Math.floor(level / 2)} rounds`
        mechanics.effects.push("Merge with spirits for increased power")
        mechanics.effects.push("Gain +" + (Math.floor(level / 2) + 3) + " to all ability scores")
        mechanics.effects.push("Gain spirit abilities and resistances")
      }
    } else if (subclassId === "lifeguard") {
      if (abilityName.includes("Life") || abilityName.includes("Preservation")) {
        mechanics.type = "Life Protection"
        mechanics.action = "Immediate Action"
        mechanics.range = "30 feet"
        mechanics.effects.push("Prevent death for one ally within range")
        mechanics.effects.push("Ally cannot be reduced below 1 HP for " + (1 + Math.floor(level / 3)) + " rounds")
        mechanics.effects.push("Can be used " + (1 + Math.floor(level / 5)) + " times per combat")
        if (augmentationId === "turquoise") {
          mechanics.augmentationBonus = "Bioelectric preservation enhances life force"
          mechanics.effects.push("Ally gains fast healing 1")
        }
      } else if (abilityName.includes("Shield") || abilityName.includes("Life Shield")) {
        mechanics.type = "Protective Barrier"
        mechanics.action = "Standard Action"
        mechanics.range = "Touch"
        mechanics.duration = `${2 + Math.floor(level / 2)} rounds`
        mechanics.effects.push("Create barrier that absorbs lethal damage")
        mechanics.effects.push("Barrier has " + (level * 10) + " HP")
        mechanics.effects.push("Barrier prevents death while active")
      } else if (abilityName.includes("Sanctuary") || abilityName.includes("Life Sanctuary")) {
        mechanics.type = "Area Protection"
        mechanics.action = "Full Round Action"
        mechanics.range = "30 feet radius"
        mechanics.duration = `${3 + Math.floor(level / 2)} rounds`
        mechanics.effects.push("Create zone where death cannot occur")
        mechanics.effects.push("All allies in zone cannot be reduced below 1 HP")
        mechanics.effects.push("Allies gain fast healing " + Math.floor(level / 3) + 1)
      } else if (abilityName.includes("Instinct") || abilityName.includes("Protective Instinct")) {
        mechanics.type = "Threat Detection"
        mechanics.action = "Passive"
        mechanics.effects.push("Sense threats to allies instantly")
        mechanics.effects.push("Gain +" + (Math.floor(level / 2) + 5) + " to Perception checks")
        mechanics.effects.push("Can detect threats before they occur")
      } else if (abilityName.includes("Mastery") || abilityName.includes("Life Force Mastery")) {
        mechanics.type = "Life Manipulation"
        mechanics.action = "Standard Action"
        mechanics.range = "Touch"
        mechanics.effects.push("Manipulate life energy directly")
        mechanics.effects.push("Can transfer HP between allies")
        mechanics.effects.push("Can extend life force (prevent aging, disease)")
      } else if (abilityName.includes("Immortal") || abilityName.includes("Immortal Guardian")) {
        mechanics.type = "Defensive Ability"
        mechanics.action = "Passive"
        mechanics.effects.push("Cannot be killed while protecting others")
        mechanics.effects.push("Gain damage reduction " + (Math.floor(level / 3) + 2) + "/-")
        mechanics.effects.push("If reduced to 0 HP while protecting, make FORT save DC 15 or be staggered")
      }
    } else if (subclassId === "assassin") {
      if (abilityName.includes("Mark") || abilityName.includes("Death Mark")) {
        mechanics.type = "Target Marking"
        mechanics.action = "Standard Action"
        mechanics.range = "60 feet"
        mechanics.duration = "Permanent (until target dies)"
        mechanics.effects.push("Mark target for assassination")
        mechanics.effects.push("Track marked target anywhere (no range limit)")
        mechanics.effects.push("Gain +" + (Math.floor(level / 2) + 2) + " to attack and damage against marked target")
        mechanics.effects.push("Can mark " + (1 + Math.floor(level / 5)) + " targets simultaneously")
      } else if (abilityName.includes("Strike") || abilityName.includes("Silent Strike")) {
        mechanics.type = "Stealth Attack"
        mechanics.action = "Standard Action"
        mechanics.range = "Melee"
        mechanics.damage = `${baseDamage + 2}d6 + DEX modifier`
        mechanics.effects.push("Attack from stealth deals massive damage")
        mechanics.effects.push("If target is unaware, deal " + (baseDamage + 2) + "x damage")
        mechanics.effects.push("Target must make FORT save DC " + baseDC + " or be stunned 1 round")
      } else if (abilityName.includes("Step") || abilityName.includes("Shadow Step")) {
        mechanics.type = "Teleportation"
        mechanics.action = "Move Action"
        mechanics.range = "Unlimited (to marked targets)"
        mechanics.effects.push("Teleport to any marked target instantly")
        mechanics.effects.push("Can make attack immediately after teleporting")
        mechanics.effects.push("Can be used " + (1 + Math.floor(level / 3)) + " times per combat")
      } else if (abilityName.includes("Touch") || abilityName.includes("Death's Touch")) {
        mechanics.type = "Instant Kill"
        mechanics.action = "Standard Action"
        mechanics.range = "Touch"
        mechanics.save = `FORT DC ${baseDC + 5}`
        mechanics.effects.push("If target is below 50% HP, kill instantly on failed save")
        mechanics.effects.push("If target is above 50% HP, deal " + (level * 2) + "d6 damage")
        mechanics.effects.push("Can be used once per combat")
      } else if (abilityName.includes("Techniques") || abilityName.includes("Assassination Techniques")) {
        mechanics.type = "Critical Hit Ability"
        mechanics.action = "Passive"
        mechanics.effects.push("Instant kill on critical hits against marked targets")
        mechanics.effects.push("Critical threat range increases by 1")
        mechanics.effects.push("Critical multiplier increases by 1")
      } else if (abilityName.includes("Inevitable") || abilityName.includes("Inevitable Death")) {
        mechanics.type = "Fate Ability"
        mechanics.action = "Standard Action"
        mechanics.range = "Unlimited"
        mechanics.effects.push("Marked targets cannot escape fate")
        mechanics.effects.push("Targets automatically fail saves against your attacks")
        mechanics.effects.push("Targets cannot be healed above 50% HP")
      }
    } else if (subclassId === "infiltrator") {
      if (abilityName.includes("Stealth") || abilityName.includes("Infiltrate")) {
        mechanics.type = "Stealth Ability"
        mechanics.action = "Standard Action"
        mechanics.duration = `${2 + Math.floor(level / 2)} rounds`
        mechanics.effects.push("Become invisible (as per invisibility spell)")
        mechanics.effects.push("Gain +" + (Math.floor(level / 2) + 5) + " to Stealth checks")
        mechanics.effects.push("Can move through security systems undetected")
        if (augmentationId === "black") {
          mechanics.augmentationBonus = "Shadow form enhances stealth"
          mechanics.effects.push("Gain 50% concealment even when visible")
        } else if (augmentationId === "yellow") {
          mechanics.augmentationBonus = "Gaseous form allows infiltration anywhere"
          mechanics.effects.push("Can pass through any opening")
        }
      } else if (abilityName.includes("Hack") || abilityName.includes("System")) {
        mechanics.type = "Hacking Ability"
        mechanics.action = "Standard Action"
        mechanics.range = "Touch or 30 feet (wireless)"
        mechanics.effects.push("Hack into any computer or security system")
        mechanics.effects.push("Gain +" + (Math.floor(level / 2) + 5) + " to hacking checks")
        mechanics.effects.push("Can disable security systems, unlock doors, etc.")
      }
    } else if (subclassId === "hacker") {
      if (abilityName.includes("Hack") || abilityName.includes("System") || abilityName.includes("Code")) {
        mechanics.type = "Hacking Ability"
        mechanics.action = "Standard Action"
        mechanics.range = "Touch or 60 feet (wireless)"
        mechanics.effects.push("Hack into any computer or security system")
        mechanics.effects.push("Gain +" + (Math.floor(level / 2) + 5) + " to hacking checks")
        mechanics.effects.push("Can disable security, unlock systems, access data")
        if (augmentationId === "turquoise") {
          mechanics.augmentationBonus = "Electrical augmentation enhances hacking"
          mechanics.effects.push("Can hack wirelessly through electrical interference")
        }
      } else if (abilityName.includes("Virus") || abilityName.includes("Malware")) {
        mechanics.type = "Digital Attack"
        mechanics.action = "Standard Action"
        mechanics.range = "60 feet"
        mechanics.save = `WILL DC ${baseDC}`
        mechanics.damage = `${baseDamage}d4`
        mechanics.effects.push("Deploy digital virus to target's cybernetics")
        mechanics.effects.push("Deal " + baseDamage + "d4 damage to cybernetic systems")
        mechanics.effects.push("Target must make WILL save or lose control of cybernetics")
      }
    }

    // Default fallback if no specific mechanics found
    if (mechanics.effects.length === 0) {
      // Provide meaningful default mechanics based on ability name patterns
      if (!mechanics.action) mechanics.action = "Standard Action"
      if (!mechanics.range) mechanics.range = `${10 + level * 5} feet`
      if (!mechanics.duration) mechanics.duration = `${1 + Math.floor(level / 2)} rounds`
      
      mechanics.effects.push(`Ability effect scales with level (Level ${level})`)
      mechanics.effects.push(`DC: ${baseDC} (10 + level)`)
      mechanics.effects.push("Effect improves as you gain levels")
      
      if (level >= 5) {
        mechanics.effects.push("Can be used multiple times per combat")
      }
      if (level >= 10) {
        mechanics.effects.push("Effect duration and range increase significantly")
      }
      if (level >= 15) {
        mechanics.effects.push("Ability becomes more powerful and versatile")
      }
      
      // Add augmentation bonus if available
      if (augmentationId) {
        mechanics.augmentationBonus = "Augmentation enhances this ability's effectiveness"
        mechanics.effects.push("Gain +1 to DCs and +1d4 to damage/effects from augmentation")
      }
    }

    return mechanics
  }

  // Subclass progression data
  const getSubclassProgression = (subclassId: string): string[] => {
    const progressions: Record<string, string[]> = {
      berserker: [
        "Rage Amplification: Enter berserker state, +2 damage, resist fear",
        "Fury Strike: Extra attack when raging, +1 to hit",
        "Berserker's Resilience: +1 HP per level, ignore pain penalties",
        "Augmented Rage: Augmentation effects enhanced during rage",
        "Intimidating Presence: Enemies must save or be frightened",
        "Relentless Fury: Rage lasts longer, harder to break concentration",
        "Berserker's Leap: Jump attack deals extra damage",
        "Unstoppable Force: Move through enemies, knock them prone",
        "Rage Beyond Death: Continue fighting at 0 HP for 1 round",
        "Master Berserker: Rage twice per combat, stack effects",
        "Legendary Fury: Rage effects spread to nearby allies",
        "Berserker's Dominance: Intimidate multiple enemies at once",
        "Apocalyptic Rage: Area damage around you while raging",
        "Eternal Warrior: Rage doesn't end until combat ends",
        "Berserker Lord: Command other berserkers, share rage",
        "Fury Incarnate: Become living embodiment of rage",
        "Rage Storm: Create whirlwind of destruction around you",
        "Berserker's Ascension: Transcend mortality through fury",
        "God of War: Your rage inspires legends and fear",
        "Ultimate Berserker: Perfect fusion of rage and augmentation",
      ],
      guardian: [
        "Aegis Protocol: Create protective barriers, +2 AC to allies",
        "Shield Wall: Extend protection to multiple allies",
        "Guardian's Resolve: Immunity to fear, +1 to all saves",
        "Augmented Defense: Augmentation enhances protective abilities",
        "Protective Aura: Allies within 10ft gain damage resistance",
        "Stalwart Defense: Intercept attacks meant for allies",
        "Guardian's Sacrifice: Take damage for allies within range",
        "Fortress Stance: Become immovable, double protection bonus",
        "Shield Master: Reflect attacks back at enemies",
        "Ultimate Guardian: Protect entire party simultaneously",
        "Legendary Protector: Your protection becomes area effect",
        "Guardian Angel: Instantly teleport to protect any ally",
        "Aegis Field: Create dome of protection around battlefield",
        "Eternal Sentinel: Never tire, always vigilant",
        "Guardian Lord: Command other guardians, coordinate defense",
        "Protection Incarnate: Become living shield for others",
        "Aegis Storm: Your protection actively attacks threats",
        "Guardian's Ascension: Transcend to become eternal protector",
        "God of Protection: Your legend shields the innocent",
        "Ultimate Guardian: Perfect fusion of protection and augmentation",
      ],
      weaponmaster: [
        "Arsenal Mastery: Proficiency with all weapons, +1 damage",
        "Weapon Bond: Choose signature weapon, enhanced effects",
        "Combat Expertise: Extra attack when raging, +1 to hit",
        "Augmented Arsenal: Augmentation enhances all weapons",
        "Weapon Throw: Thrown weapons return, deal extra damage",
        "Master's Precision: Critical hits on 19-20 with bonded weapon",
        "Weapon Dance: Attack with multiple weapons in sequence",
        "Arsenal Lord: Summon any weapon you've mastered",
        "Perfect Strike: Ignore armor with bonded weapon",
        "Legendary Weaponmaster: All weapons become magical in your hands",
        "Weapon Storm: Attack all enemies within reach simultaneously",
        "Master of Arms: Wield any number of weapons at once",
        "Arsenal Incarnate: Become living weapon collection",
        "Eternal Warrior: Your weapons never break or dull",
        "Weaponmaster Lord: Teach mastery to others instantly",
        "Perfect Arsenal: All weapons reach legendary status",
        "Weapon God: Create new weapon types through will",
        "Master's Ascension: Transcend through weapon mastery",
        "God of War: Your weapon skills become divine",
        "Ultimate Weaponmaster: Perfect fusion of skill and augmentation",
      ],
      tactician: [
        "Combat Analysis: Read battlefield, +2 to initiative and tactics",
        "Strategic Mind: Grant allies bonus actions through planning",
        "Battle Coordination: Allies gain +1 to hit when following your plan",
        "Augmented Tactics: Augmentation enhances battlefield analysis",
        "Tactical Advantage: Reposition allies as free action",
        "Master Strategist: Predict enemy actions, counter automatically",
        "Battle Commander: Issue commands that allies must follow",
        "Tactical Supremacy: Control battlefield positioning completely",
        "Strategic Genius: Plan multiple contingencies simultaneously",
        "Legendary Tactician: Your strategies become battlefield law",
        "Tactical Omniscience: See all possible battle outcomes",
        "Master Commander: Control multiple battlefields at once",
        "Strategy Incarnate: Become living embodiment of tactics",
        "Eternal General: Your strategies outlive you",
        "Tactical Lord: Command armies through pure strategy",
        "Perfect Strategy: Never lose a battle you plan",
        "God of War: Your tactics reshape reality",
        "Tactical Ascension: Transcend through strategic mastery",
        "Divine Commander: Your word becomes cosmic law",
        "Ultimate Tactician: Perfect fusion of mind and augmentation",
      ],
      medic: [
        "Emergency Response: Instant healing, stabilize dying allies",
        "Field Medicine: Heal during combat without penalty",
        "Medical Expertise: Diagnose conditions, cure diseases",
        "Augmented Healing: Augmentation enhances medical abilities",
        "Combat Medic: Heal and fight simultaneously",
        "Advanced Treatment: Cure poisons, remove curses",
        "Medical Miracle: Bring back recently deceased",
        "Battlefield Surgeon: Perform surgery during combat",
        "Healing Aura: Passive regeneration for nearby allies",
        "Master Medic: Heal multiple allies simultaneously",
        "Legendary Healer: Your touch cures any ailment",
        "Medical Genius: Invent new treatments instantly",
        "Healing Incarnate: Become living source of restoration",
        "Eternal Physician: Never lose a patient",
        "Medical Lord: Teach healing to others instantly",
        "Perfect Medicine: Cure anything, even death",
        "God of Healing: Your touch grants immortality",
        "Medical Ascension: Transcend through healing mastery",
        "Divine Physician: Your healing becomes cosmic force",
        "Ultimate Medic: Perfect fusion of medicine and augmentation",
      ],
      biotechnician: [
        "Bio-Enhancement: Modify ally biology, grant temporary abilities",
        "Genetic Analysis: Understand biological systems instantly",
        "Biological Adaptation: Grant resistances through modification",
        "Augmented Biology: Augmentation enhances bio-modifications",
        "Evolutionary Leap: Permanently enhance ally capabilities",
        "Biological Mastery: Control biological functions remotely",
        "Genetic Engineering: Create new biological abilities",
        "Bio-Weapon Creation: Turn biology into weapons",
        "Biological Transcendence: Enhance beyond natural limits",
        "Master Biotechnician: Modify multiple subjects simultaneously",
        "Legendary Enhancer: Your modifications become hereditary",
        "Biological God: Create new forms of life",
        "Evolution Incarnate: Become master of biological change",
        "Eternal Scientist: Your research never ends",
        "Bio-Tech Lord: Command all biological systems",
        "Perfect Evolution: Guide species to perfection",
        "God of Life: Your will shapes all biology",
        "Biological Ascension: Transcend through bio-mastery",
        "Divine Creator: Your touch creates new life",
        "Ultimate Biotechnician: Perfect fusion of science and augmentation",
      ],
      spiritualist: [
        "Spirit Channeling: Commune with spirits, gain guidance",
        "Spiritual Healing: Channel spirit energy for restoration",
        "Spirit Guide: Permanent spiritual companion",
        "Augmented Channeling: Augmentation enhances spirit connection",
        "Spirit Army: Call multiple spirits to aid you",
        "Spiritual Transcendence: Partially exist in spirit realm",
        "Spirit Mastery: Command spirits, don't just commune",
        "Spiritual Fusion: Merge with spirits for power",
        "Spirit Lord: Rule over spiritual realm",
        "Master Spiritualist: Bridge physical and spirit worlds",
        "Legendary Medium: Spirits seek you out for aid",
        "Spiritual Incarnate: Become living spirit bridge",
        "Eternal Soul: Your spirit becomes immortal",
        "Spirit God: Command all spiritual entities",
        "Perfect Harmony: Balance all spiritual forces",
        "Divine Medium: Your word is law in spirit realm",
        "Spiritual Ascension: Transcend physical existence",
        "God of Spirits: Rule both worlds simultaneously",
        "Ultimate Spiritualist: Perfect fusion of flesh and spirit",
        "Cosmic Consciousness: Become one with universal spirit",
      ],
      lifeguard: [
        "Life Preservation: Prevent death, extend life force",
        "Protective Instinct: Sense threats to allies instantly",
        "Life Shield: Create barriers that absorb lethal damage",
        "Augmented Preservation: Augmentation enhances life protection",
        "Guardian Angel: Instantly appear to save allies",
        "Life Force Mastery: Manipulate life energy directly",
        "Preservation Field: Area effect life protection",
        "Immortal Guardian: Cannot be killed while protecting others",
        "Life Sanctuary: Create zones where death cannot occur",
        "Master Lifeguard: Protect multiple lives simultaneously",
        "Legendary Protector: Your protection transcends death",
        "Life Incarnate: Become living embodiment of preservation",
        "Eternal Guardian: Your protection lasts beyond death",
        "Life God: Command the forces of life and death",
        "Perfect Preservation: Nothing dies in your presence",
        "Divine Guardian: Your protection becomes cosmic law",
        "Life Ascension: Transcend through preservation mastery",
        "God of Life: Your will determines who lives",
        "Ultimate Lifeguard: Perfect fusion of life and augmentation",
      ],
      assassin: [
        "Death Mark: Mark targets for assassination, track anywhere",
        "Silent Strike: Attacks from stealth deal massive damage",
        "Assassination Techniques: Instant kill on critical hits",
        "Augmented Lethality: Augmentation enhances killing methods",
        "Shadow Step: Teleport to marked targets instantly",
        "Death's Touch: Kill with a touch if target is weakened",
        "Assassination Mastery: Multiple death marks simultaneously",
        "Inevitable Death: Marked targets cannot escape fate",
        "Death Incarnate: Become living embodiment of assassination",
        "Master Assassin: Kill multiple targets with one strike",
        "Legendary Killer: Your reputation precedes you",
        "Death God: Command the forces of death",
        "Perfect Assassination: Never miss, never fail",
        "Eternal Hunter: Hunt targets across dimensions",
        "Assassination Lord: Command network of assassins",
        "Divine Killer: Your touch brings certain death",
        "Death Ascension: Transcend through mastery of death",
        "God of Death: Your will determines who dies",
        "Ultimate Assassin: Perfect fusion of death and augmentation",
        "Cosmic Reaper: Harvest souls across all realities",
      ],
      infiltrator: [
        "Ghost Protocol: Become undetectable, bypass security",
        "Infiltration Mastery: Access any location undetected",
        "Electronic Warfare: Hack any system instantly",
        "Augmented Stealth: Augmentation enhances infiltration",
        "Phase Walk: Move through solid objects briefly",
        "Information Extraction: Learn any secret through infiltration",
        "Master Infiltrator: Infiltrate multiple locations simultaneously",
        "Invisible Presence: Cannot be detected by any means",
        "Infiltration Network: Command spy network globally",
        "Legendary Spy: Your infiltrations become legend",
        "Ghost Incarnate: Become living embodiment of stealth",
        "Eternal Shadow: Your presence is never detected",
        "Infiltration God: Access any information anywhere",
        "Perfect Stealth: Exist between reality and shadow",
        "Divine Spy: Your infiltration transcends dimensions",
        "Stealth Ascension: Transcend through mastery of stealth",
        "God of Secrets: All hidden knowledge belongs to you",
        "Ultimate Infiltrator: Perfect fusion of stealth and augmentation",
        "Cosmic Ghost: Infiltrate across all realities",
        "Universal Spy: Know all secrets in existence",
      ],
      trickster: [
        "Chaos Theory: Create unpredictable effects in combat",
        "Misdirection: Confuse enemies, redirect attacks",
        "Chaotic Luck: Random beneficial effects occur",
        "Augmented Chaos: Augmentation adds to chaotic effects",
        "Reality Glitch: Temporarily alter local reality",
        "Chaos Mastery: Control randomness to your advantage",
        "Trickster's Gambit: High risk, high reward abilities",
        "Chaotic Aura: Random effects constantly occur around you",
        "Master Trickster: Your chaos affects entire battlefield",
        "Legendary Prankster: Your tricks become reality",
        "Chaos Incarnate: Become living embodiment of randomness",
        "Eternal Jester: Your chaos transcends death",
        "Chaos God: Command all random forces",
        "Perfect Unpredictability: No one can predict your actions",
        "Divine Trickster: Your chaos reshapes reality",
        "Chaos Ascension: Transcend through mastery of randomness",
        "God of Chance: Your will controls all probability",
        "Ultimate Trickster: Perfect fusion of chaos and augmentation",
        "Cosmic Joker: Spread chaos across all realities",
        "Universal Wildcard: Your presence makes anything possible",
      ],
      scout: [
        "Tactical Intel: Gather perfect information about enemies",
        "Reconnaissance Mastery: Map any area instantly",
        "Enemy Analysis: Learn weaknesses through observation",
        "Augmented Senses: Augmentation enhances information gathering",
        "Battlefield Awareness: Know position of all combatants",
        "Intelligence Network: Access information from anywhere",
        "Master Scout: Gather intel on multiple targets simultaneously",
        "Omniscient Observer: See through any concealment",
        "Information Broker: Trade knowledge for power",
        "Legendary Scout: Your intel shapes battles",
        "Intel Incarnate: Become living source of information",
        "Eternal Watcher: Your observation transcends time",
        "Information God: Know everything about anything",
        "Perfect Awareness: Nothing escapes your notice",
        "Divine Observer: Your sight transcends dimensions",
        "Intel Ascension: Transcend through mastery of knowledge",
        "God of Knowledge: All information flows to you",
        "Ultimate Scout: Perfect fusion of awareness and augmentation",
        "Cosmic Observer: Watch all realities simultaneously",
        "Universal Intelligence: Know all that was, is, and will be",
      ],
      nanotechnician: [
        "Nano-Tech Integration: Deploy microscopic technology",
        "Nanobotic Healing: Repair damage at cellular level",
        "Tech Enhancement: Upgrade allies with nanotechnology",
        "Augmented Nanobots: Augmentation enhances nano-tech",
        "Nano Swarm: Control millions of nanobots simultaneously",
        "Technological Mastery: Interface with any technology",
        "Nano Reconstruction: Rebuild anything at molecular level",
        "Tech Transcendence: Merge biology with technology",
        "Master Nanotechnician: Your nanobots evolve independently",
        "Legendary Engineer: Your technology becomes self-aware",
        "Tech Incarnate: Become living nanotechnology",
        "Eternal Innovation: Your technology never becomes obsolete",
        "Technology God: Command all technological systems",
        "Perfect Integration: Seamlessly merge tech and biology",
        "Divine Engineer: Your creations transcend physics",
        "Tech Ascension: Transcend through technological mastery",
        "God of Progress: Your will drives technological evolution",
        "Ultimate Nanotechnician: Perfect fusion of tech and augmentation",
        "Cosmic Engineer: Build technology across all realities",
        "Universal Constructor: Create anything through nanotechnology",
      ],
      spheremaster: [
        "Sphere Integration: Control adaptive projectile spheres",
        "Sphere Mastery: Spheres change properties at will",
        "Multi-Sphere: Control multiple spheres simultaneously",
        "Augmented Spheres: Augmentation enhances sphere abilities",
        "Sphere Network: Spheres coordinate and communicate",
        "Orbital Control: Spheres orbit you, providing constant protection",
        "Sphere Evolution: Spheres develop new abilities over time",
        "Master Spheremaster: Your spheres achieve sentience",
        "Legendary Controller: Your spheres inspire awe and fear",
        "Sphere Incarnate: Become one with your spheres",
        "Eternal Orbiter: Your spheres transcend physical laws",
        "Sphere God: Command all spherical forces in universe",
        "Perfect Harmony: You and spheres move as one entity",
        "Divine Controller: Your spheres reshape reality",
        "Sphere Ascension: Transcend through spherical mastery",
        "God of Geometry: Your will controls all shapes",
        "Ultimate Spheremaster: Perfect fusion of mind and sphere",
        "Cosmic Orbiter: Control spheres across all dimensions",
        "Universal Controller: Command all circular forces in existence",
      ],
      dronecommander: [
        "Drone Integration: Command swarms of micro-drones",
        "Tactical Coordination: Drones work in perfect harmony",
        "Drone Evolution: Drones adapt and improve over time",
        "Augmented Command: Augmentation enhances drone control",
        "Swarm Intelligence: Drones develop collective consciousness",
        "Drone Network: Connect to global drone infrastructure",
        "Master Commander: Control unlimited numbers of drones",
        "Legendary General: Your drone armies are unstoppable",
        "Swarm Incarnate: Become one with the drone collective",
        "Eternal Commander: Your drones outlive you",
        "Drone God: Command all artificial intelligences",
        "Perfect Synchronization: You and drones share consciousness",
        "Divine General: Your drone armies transcend reality",
        "Swarm Ascension: Transcend through collective mastery",
        "God of Machines: Your will controls all artificial life",
        "Ultimate Commander: Perfect fusion of mind and machine",
        "Cosmic General: Command drones across all realities",
        "Universal Swarm: Control all artificial intelligence in existence",
      ],
      armortech: [
        "Armor Integration: Merge with advanced exoskeleton",
        "Adaptive Protection: Armor changes to counter threats",
        "System Enhancement: Armor boosts all abilities",
        "Augmented Armor: Augmentation enhances armor systems",
        "Living Armor: Armor develops its own intelligence",
        "Armor Mastery: Perfect fusion of flesh and metal",
        "System Evolution: Armor continuously upgrades itself",
        "Master Armortech: Your armor transcends technology",
        "Legendary Warrior: Your armor becomes mythical",
        "Armor Incarnate: Become living suit of armor",
        "Eternal Guardian: Your armor protects beyond death",
        "Armor God: Command all protective systems",
        "Perfect Integration: No distinction between you and armor",
        "Divine Protector: Your armor transcends physical laws",
        "Armor Ascension: Transcend through technological fusion",
        "God of Defense: Your will shapes all protection",
        "Ultimate Armortech: Perfect fusion of flesh and augmentation",
        "Cosmic Guardian: Protect across all realities",
        "Universal Armor: Your protection extends to all existence",
      ],
    }

    return progressions[subclassId] || Array(20).fill("Progression not defined")
  }

  const sections = [
    { id: "overview", name: "Overview", icon: <BookOpen className="w-5 h-5" /> },
    { id: "requirements", name: "Requirements", icon: <Lock className="w-5 h-5" /> },
    { id: "classes", name: "Classes", icon: <Users className="w-5 h-5" /> },
    { id: "rules", name: "Rules", icon: <Dice6 className="w-5 h-5" /> },
    { id: "progression", name: "Progression", icon: <Trophy className="w-5 h-5" /> },
  ]

  const handleClassSelect = (classData: Class) => {
    setSelectedClass(classData)
    setSelectedSubclass(null)
    setSelectedAugmentation(null)
    setSelectedProgressionIndex(null)
  }

  const handleSubclassSelect = (subclass: Subclass) => {
    setSelectedSubclass(subclass)
    setSelectedAugmentation(null)
    setSelectedProgressionIndex(null)
  }

  const handleAugmentationSelect = (augmentation: Augmentation) => {
    setSelectedAugmentation(augmentation)
    setSelectedProgressionIndex(null)
  }

  const resetSelection = () => {
    setSelectedClass(null)
    setSelectedSubclass(null)
    setSelectedAugmentation(null)
    setActiveSection("classes")
  }

  // Render the current view based on selection state
  const renderCurrentView = () => {
    // If we're in the classes section and have selections, show the progression
    if (activeSection === "classes") {
      if (selectedAugmentation && selectedSubclass) {
        // Show augmentation details
        return (
          <div className="max-w-6xl mx-auto w-full h-full flex flex-col px-4 sm:px-6 md:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6 flex-shrink-0">
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white font-['Montserrat'] break-words">
                  {selectedSubclass.name} - {selectedAugmentation.name}
                </h2>
                <p className="text-gray-300 text-sm sm:text-base md:text-lg font-['PT_Mono']">{selectedAugmentation.description}</p>
              </div>
              <button
                className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-3 sm:px-4 rounded focus:outline-none focus:shadow-outline font-['Montserrat'] text-xs sm:text-sm whitespace-nowrap"
                onClick={() => setSelectedAugmentation(null)}
              >
                Back to Augmentations
              </button>
            </div>

            {/* Main Tabs */}
            <div className="flex space-x-4 mb-6 flex-shrink-0">
              <button
                className={`px-4 py-2 rounded-md ${
                  mainTab === "basic" ? "bg-cyan-500 text-white" : "bg-gray-800 hover:bg-gray-700 text-gray-300"
                } font-['Montserrat']`}
                onClick={() => {
                  setMainTab("basic")
                  setSelectedProgressionIndex(null)
                }}
              >
                Basic Information
              </button>
              <button
                className={`px-4 py-2 rounded-md ${
                  mainTab === "augmentation" ? "bg-cyan-500 text-white" : "bg-gray-800 hover:bg-gray-700 text-gray-300"
                } font-['Montserrat']`}
                onClick={() => {
                  setMainTab("augmentation")
                  setSelectedProgressionIndex(null)
                }}
              >
                Augmentation Details
              </button>
            </div>

            {/* Content based on active tab */}
            <div className="flex-1 overflow-y-auto space-y-6 pb-4 overflow-x-hidden">
              {mainTab === "basic" && (
                <div className="grid gap-6">
                  {/* Subclass Focus Ability Card */}
                  <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-sm p-6 rounded-xl border border-cyan-400/30">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center">
                        {selectedSubclass.icon}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white font-['Montserrat']">Focus Ability</h3>
                        <p className="text-cyan-300 text-sm font-['PT_Mono']">Core subclass mechanic</p>
                      </div>
                    </div>
                    <div className="bg-black/40 p-4 rounded-lg border border-cyan-400/20">
                      <p className="text-lg text-gray-200 font-['PT_Mono'] leading-relaxed">
                        {selectedSubclass.focusAbility}
                      </p>
                    </div>
                  </div>

                  {/* Subclass Progression Grid */}
                  <div className="bg-black/60 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-2xl font-bold text-white font-['Montserrat'] flex items-center space-x-2">
                      <Trophy className="w-6 h-6 text-yellow-400" />
                      <span>Progression Path</span>
                    </h3>
                      {selectedProgressionIndex !== null && (
                        <button
                          onClick={() => setSelectedProgressionIndex(null)}
                          className="text-cyan-400 hover:text-cyan-300 text-sm font-['Montserrat'] flex items-center space-x-1 transition-colors"
                        >
                          <span>← Back to List</span>
                        </button>
                      )}
                    </div>
                    
                    {selectedProgressionIndex === null ? (
                      <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                      {getSubclassProgression(selectedSubclass.id)
                        .slice(0, 12)
                            .map((progression, index) => {
                              const abilityName = progression.split(":")[0]
                              const abilityDescription = progression.split(":").slice(1).join(":").trim()
                              return (
                                <motion.div
                            key={index}
                                  className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 p-4 rounded-lg border border-gray-600/50 hover:border-cyan-400/50 transition-all cursor-pointer"
                                  onClick={() => setSelectedProgressionIndex(index)}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                          >
                            <div className="flex items-center space-x-3 mb-2">
                                    <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                {index + 1}
                              </div>
                                    <div className="flex-1 min-w-0">
                                <h4 className="text-cyan-400 font-bold text-sm font-['Montserrat']">
                                        {abilityName}
                                </h4>
                              </div>
                            </div>
                            <p className="text-gray-300 text-xs leading-relaxed font-['PT_Mono']">
                                    {abilityDescription}
                            </p>
                                </motion.div>
                              )
                            })}
                    </div>
                    {getSubclassProgression(selectedSubclass.id).length > 12 && (
                      <div className="mt-4 text-center">
                        <p className="text-gray-400 text-sm font-['PT_Mono']">
                          +{getSubclassProgression(selectedSubclass.id).length - 12} more abilities unlock as you
                          progress
                        </p>
                      </div>
                    )}
                      </>
                    ) : (
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={selectedProgressionIndex}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3 }}
                          className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 p-6 rounded-lg border-2 border-cyan-400/50"
                        >
                          {(() => {
                            const progression = getSubclassProgression(selectedSubclass.id)[selectedProgressionIndex]
                            const abilityName = progression.split(":")[0]
                            const abilityDescription = progression.split(":").slice(1).join(":").trim()
                            const mechanics = getProgressionMechanics(
                              selectedSubclass.id,
                              selectedProgressionIndex,
                              abilityName,
                              selectedAugmentation?.id
                            )
                            return (
                              <>
                                <div className="flex items-center space-x-4 mb-4">
                                  <div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                    {selectedProgressionIndex + 1}
                  </div>
                                  <div className="flex-1">
                                    <h4 className="text-cyan-400 font-bold text-xl font-['Montserrat'] mb-1">
                                      {abilityName}
                                    </h4>
                                    <p className="text-gray-400 text-sm font-['PT_Mono']">
                                      Level {selectedProgressionIndex + 1} Ability • {mechanics.type}
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="border-t border-gray-600/50 pt-4 mb-4">
                                  <h5 className="text-white font-bold text-sm font-['Montserrat'] mb-2">Description</h5>
                                  <p className="text-gray-300 text-sm leading-relaxed font-['PT_Mono']">
                                    {abilityDescription}
                                  </p>
                                </div>

                                {/* Game Mechanics Section */}
                                <div className="border-t border-gray-600/50 pt-4 mb-4">
                                  <h5 className="text-white font-bold text-sm font-['Montserrat'] mb-3 flex items-center space-x-2">
                                    <Target className="w-4 h-4 text-cyan-400" />
                                    <span>Game Mechanics</span>
                                  </h5>
                                  <div className="bg-black/40 p-4 rounded-lg border border-cyan-400/20 space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                      <div>
                                        <p className="text-cyan-400 text-xs font-bold font-['Montserrat'] mb-1">Action Type</p>
                                        <p className="text-gray-300 text-xs font-['PT_Mono']">{mechanics.action}</p>
                                      </div>
                                      {mechanics.range && (
                                        <div>
                                          <p className="text-cyan-400 text-xs font-bold font-['Montserrat'] mb-1">Range</p>
                                          <p className="text-gray-300 text-xs font-['PT_Mono']">{mechanics.range}</p>
                                        </div>
                                      )}
                                      {mechanics.duration && (
                                        <div>
                                          <p className="text-cyan-400 text-xs font-bold font-['Montserrat'] mb-1">Duration</p>
                                          <p className="text-gray-300 text-xs font-['PT_Mono']">{mechanics.duration}</p>
                                        </div>
                                      )}
                                      {mechanics.save && (
                                        <div>
                                          <p className="text-cyan-400 text-xs font-bold font-['Montserrat'] mb-1">Saving Throw</p>
                                          <p className="text-gray-300 text-xs font-['PT_Mono']">{mechanics.save}</p>
                                        </div>
                                      )}
                                      {mechanics.damage && (
                                        <div>
                                          <p className="text-cyan-400 text-xs font-bold font-['Montserrat'] mb-1">Damage</p>
                                          <p className="text-gray-300 text-xs font-['PT_Mono']">{mechanics.damage}</p>
                                        </div>
                                      )}
                                    </div>
                                    
                                    <div className="mt-3 pt-3 border-t border-gray-600/30">
                                      <p className="text-cyan-400 text-xs font-bold font-['Montserrat'] mb-2">Effects</p>
                                      <ul className="space-y-1">
                                        {mechanics.effects.map((effect, idx) => (
                                          <li key={idx} className="flex items-start space-x-2">
                                            <span className="text-cyan-400/50 mt-1">•</span>
                                            <p className="text-gray-300 text-xs font-['PT_Mono'] leading-relaxed flex-1">
                                              {effect}
                                            </p>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>

                                    {mechanics.augmentationBonus && selectedAugmentation && (
                                      <div className="mt-3 pt-3 border-t border-gray-600/30">
                                        <p className="text-yellow-400 text-xs font-bold font-['Montserrat'] mb-2">
                                          {selectedAugmentation.name} Augmentation Bonus
                                        </p>
                                        <p className="text-yellow-300/80 text-xs font-['PT_Mono'] leading-relaxed">
                                          {mechanics.augmentationBonus}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Navigation */}
                                {(selectedProgressionIndex > 0 || selectedProgressionIndex < getSubclassProgression(selectedSubclass.id).length - 1) && (
                                  <div className="border-t border-gray-600/50 pt-4">
                                    <div className="flex justify-between items-center">
                                      {selectedProgressionIndex > 0 && (
                                        <button
                                          onClick={() => setSelectedProgressionIndex(selectedProgressionIndex - 1)}
                                          className="text-cyan-400 hover:text-cyan-300 text-xs font-['Montserrat'] flex items-center space-x-1 transition-colors"
                                        >
                                          <span>←</span>
                                          <span>{getSubclassProgression(selectedSubclass.id)[selectedProgressionIndex - 1].split(":")[0]}</span>
                                        </button>
                                      )}
                                      {selectedProgressionIndex < getSubclassProgression(selectedSubclass.id).length - 1 && (
                                        <button
                                          onClick={() => setSelectedProgressionIndex(selectedProgressionIndex + 1)}
                                          className="text-cyan-400 hover:text-cyan-300 text-xs font-['Montserrat'] flex items-center space-x-1 transition-colors ml-auto"
                                        >
                                          <span>{getSubclassProgression(selectedSubclass.id)[selectedProgressionIndex + 1].split(":")[0]}</span>
                                          <span>→</span>
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </>
                            )
                          })()}
                        </motion.div>
                      </AnimatePresence>
                    )}
                  </div>
                </div>
              )}

              {mainTab === "augmentation" && (
                <div className="space-y-6">
                  {/* Game Mechanics Summary - Most Important */}
                  <div className="bg-gradient-to-r from-cyan-500/30 to-blue-500/30 backdrop-blur-sm p-6 rounded-xl border-2 border-cyan-400/50">
                    <div className="flex items-center space-x-3 mb-6">
                      <Target className="w-8 h-8 text-cyan-400" />
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white font-['Montserrat']">Game Mechanics</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {(() => {
                        const lowMech = extractMechanics(selectedAugmentation.abilities.low, 'Low')
                        const mediumMech = extractMechanics(selectedAugmentation.abilities.medium, 'Medium')
                        const highMech = extractMechanics(selectedAugmentation.abilities.high, 'High')
                        const allMechanics = {
                          damage: [...(lowMech.damage || []), ...(mediumMech.damage || []), ...(highMech.damage || [])],
                          saves: [...(lowMech.saves || []), ...(mediumMech.saves || []), ...(highMech.saves || [])],
                          durations: [...(lowMech.durations || []), ...(mediumMech.durations || []), ...(highMech.durations || [])],
                          ranges: [...(lowMech.ranges || []), ...(mediumMech.ranges || []), ...(highMech.ranges || [])],
                          modifiers: [...(lowMech.modifiers || []), ...(mediumMech.modifiers || []), ...(highMech.modifiers || [])],
                          percentages: [...(lowMech.percentages || []), ...(mediumMech.percentages || []), ...(highMech.percentages || [])],
                          actions: [...(lowMech.actions || []), ...(mediumMech.actions || []), ...(highMech.actions || [])],
                          other: [...(lowMech.other || []), ...(mediumMech.other || []), ...(highMech.other || [])],
                        }
                        
                        // Helper to deduplicate by value while keeping unique contexts and requirements
                        // Also merges similar contexts to avoid repetition
                        const deduplicateMechanics = (items: Array<{ value: string; context: string; requirement?: string }>) => {
                          const seen = new Map<string, { contexts: string[]; requirements: string[] }>()
                          items.forEach(item => {
                            if (!seen.has(item.value)) {
                              seen.set(item.value, { contexts: [], requirements: [] })
                            }
                            const data = seen.get(item.value)!
                            
                            // Check if context is similar to existing ones (avoid repetition)
                            const isSimilar = data.contexts.some(existing => {
                              const similarity = existing.toLowerCase().includes(item.context.toLowerCase().substring(0, 20)) ||
                                                item.context.toLowerCase().includes(existing.toLowerCase().substring(0, 20))
                              return similarity
                            })
                            
                            if (!isSimilar && item.context.trim().length > 0) {
                              data.contexts.push(item.context)
                            }
                            
                            if (item.requirement && !data.requirements.includes(item.requirement)) {
                              data.requirements.push(item.requirement)
                            }
                          })
                          
                          // Return with only the most complete/clear context for each value
                          return Array.from(seen.entries()).map(([value, data]) => {
                            // If multiple contexts, prefer the longest complete one
                            const bestContext = data.contexts.length > 0 
                              ? data.contexts.reduce((best, current) => 
                                  current.length > best.length && current.endsWith('.') ? current : best,
                                  data.contexts[0]
                                )
                              : data.contexts[0] || ''
                            
                            return { 
                              value, 
                              contexts: bestContext ? [bestContext] : [], 
                              requirements: data.requirements 
                            }
                          })
                        }

                        return (
                          <>
                            {allMechanics.damage && allMechanics.damage.length > 0 && (
                              <div className="bg-black/40 p-4 rounded-lg border border-cyan-400/30">
                                <h4 className="text-cyan-400 font-bold text-sm font-['Montserrat'] mb-3">Damage</h4>
                                <div className="space-y-3">
                                  {deduplicateMechanics(allMechanics.damage).map((item, idx) => (
                                    <div key={idx} className="border-l-2 border-cyan-400/30 pl-3">
                                      <p className="text-cyan-300 font-bold text-sm font-['Montserrat'] mb-1">{item.value}</p>
                                      {item.requirements.length > 0 && (
                                        <div className="mb-2">
                                          <p className="text-yellow-400 text-xs font-bold font-['Montserrat'] mb-1">Requirement:</p>
                                          {item.requirements.map((req, reqIdx) => (
                                            <p key={reqIdx} className="text-yellow-300/80 text-xs font-['PT_Mono'] leading-relaxed">
                                              {req}
                                            </p>
                                          ))}
                                        </div>
                                      )}
                                      {item.contexts.map((ctx, ctxIdx) => (
                                        <p key={ctxIdx} className="text-gray-300 text-xs font-['PT_Mono'] leading-relaxed italic">
                                          {ctx}
                                        </p>
                                      ))}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {allMechanics.saves && allMechanics.saves.length > 0 && (
                              <div className="bg-black/40 p-4 rounded-lg border border-cyan-400/30">
                                <h4 className="text-cyan-400 font-bold text-sm font-['Montserrat'] mb-3">Saving Throws</h4>
                                <div className="space-y-3">
                                  {deduplicateMechanics(allMechanics.saves).map((item, idx) => (
                                    <div key={idx} className="border-l-2 border-cyan-400/30 pl-3">
                                      <p className="text-cyan-300 font-bold text-sm font-['Montserrat'] mb-1">{item.value}</p>
                                      {item.requirements.length > 0 && (
                                        <div className="mb-2">
                                          <p className="text-yellow-400 text-xs font-bold font-['Montserrat'] mb-1">Requirement:</p>
                                          {item.requirements.map((req, reqIdx) => (
                                            <p key={reqIdx} className="text-yellow-300/80 text-xs font-['PT_Mono'] leading-relaxed">
                                              {req}
                                            </p>
                                          ))}
                                        </div>
                                      )}
                                      {item.contexts.map((ctx, ctxIdx) => (
                                        <p key={ctxIdx} className="text-gray-300 text-xs font-['PT_Mono'] leading-relaxed italic">
                                          {ctx}
                                        </p>
                                      ))}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {allMechanics.durations && allMechanics.durations.length > 0 && (
                              <div className="bg-black/40 p-4 rounded-lg border border-cyan-400/30">
                                <h4 className="text-cyan-400 font-bold text-sm font-['Montserrat'] mb-3">Duration</h4>
                                <div className="space-y-3">
                                  {deduplicateMechanics(allMechanics.durations).map((item, idx) => (
                                    <div key={idx} className="border-l-2 border-cyan-400/30 pl-3">
                                      <p className="text-cyan-300 font-bold text-sm font-['Montserrat'] mb-1">{item.value}</p>
                                      {item.requirements.length > 0 && (
                                        <div className="mb-2">
                                          <p className="text-yellow-400 text-xs font-bold font-['Montserrat'] mb-1">Requirement:</p>
                                          {item.requirements.map((req, reqIdx) => (
                                            <p key={reqIdx} className="text-yellow-300/80 text-xs font-['PT_Mono'] leading-relaxed">
                                              {req}
                                            </p>
                                          ))}
                                        </div>
                                      )}
                                      {item.contexts.map((ctx, ctxIdx) => (
                                        <p key={ctxIdx} className="text-gray-300 text-xs font-['PT_Mono'] leading-relaxed italic">
                                          {ctx}
                                        </p>
                                      ))}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {allMechanics.percentages && allMechanics.percentages.length > 0 && (
                              <div className="bg-black/40 p-4 rounded-lg border border-cyan-400/30">
                                <h4 className="text-cyan-400 font-bold text-sm font-['PT_Mono'] mb-3">Chance/Percentage</h4>
                                <div className="space-y-3">
                                  {deduplicateMechanics(allMechanics.percentages).map((item, idx) => (
                                    <div key={idx} className="border-l-2 border-cyan-400/30 pl-3">
                                      <p className="text-cyan-300 font-bold text-sm font-['Montserrat'] mb-1">{item.value}</p>
                                      {item.requirements.length > 0 && (
                                        <div className="mb-2">
                                          <p className="text-yellow-400 text-xs font-bold font-['Montserrat'] mb-1">Requirement:</p>
                                          {item.requirements.map((req, reqIdx) => (
                                            <p key={reqIdx} className="text-yellow-300/80 text-xs font-['PT_Mono'] leading-relaxed">
                                              {req}
                                            </p>
                                          ))}
                                        </div>
                                      )}
                                      {item.contexts.map((ctx, ctxIdx) => (
                                        <p key={ctxIdx} className="text-gray-300 text-xs font-['PT_Mono'] leading-relaxed italic">
                                          {ctx}
                                        </p>
                                      ))}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {allMechanics.actions && allMechanics.actions.length > 0 && (
                              <div className="bg-black/40 p-4 rounded-lg border border-cyan-400/30">
                                <h4 className="text-cyan-400 font-bold text-sm font-['Montserrat'] mb-3">Action Type</h4>
                                <div className="space-y-3">
                                  {deduplicateMechanics(allMechanics.actions).map((item, idx) => (
                                    <div key={idx} className="border-l-2 border-cyan-400/30 pl-3">
                                      <p className="text-cyan-300 font-bold text-sm font-['Montserrat'] mb-1">{item.value}</p>
                                      {item.requirements.length > 0 && (
                                        <div className="mb-2">
                                          <p className="text-yellow-400 text-xs font-bold font-['Montserrat'] mb-1">Requirement:</p>
                                          {item.requirements.map((req, reqIdx) => (
                                            <p key={reqIdx} className="text-yellow-300/80 text-xs font-['PT_Mono'] leading-relaxed">
                                              {req}
                                            </p>
                                          ))}
                                        </div>
                                      )}
                                      {item.contexts.map((ctx, ctxIdx) => (
                                        <p key={ctxIdx} className="text-gray-300 text-xs font-['PT_Mono'] leading-relaxed italic">
                                          {ctx}
                                        </p>
                                      ))}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {allMechanics.other && allMechanics.other.length > 0 && (
                              <div className="bg-black/40 p-4 rounded-lg border border-cyan-400/30">
                                <h4 className="text-cyan-400 font-bold text-sm font-['Montserrat'] mb-3">Special Effects</h4>
                                <div className="space-y-3">
                                  {deduplicateMechanics(allMechanics.other).map((item, idx) => (
                                    <div key={idx} className="border-l-2 border-cyan-400/30 pl-3">
                                      <p className="text-cyan-300 font-bold text-sm font-['Montserrat'] mb-1">{item.value}</p>
                                      {item.requirements.length > 0 && (
                                        <div className="mb-2">
                                          <p className="text-yellow-400 text-xs font-bold font-['Montserrat'] mb-1">Requirement:</p>
                                          {item.requirements.map((req, reqIdx) => (
                                            <p key={reqIdx} className="text-yellow-300/80 text-xs font-['PT_Mono'] leading-relaxed">
                                              {req}
                                            </p>
                                          ))}
                                        </div>
                                      )}
                                      {item.contexts.map((ctx, ctxIdx) => (
                                        <p key={ctxIdx} className="text-gray-300 text-xs font-['PT_Mono'] leading-relaxed italic">
                                          {ctx}
                                        </p>
                                      ))}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        )
                      })()}
                    </div>
                  </div>

                  {/* Augmentation Tabs */}
                  <div className="flex space-x-4 mb-4">
                    <button
                      className={`px-6 py-3 rounded-lg font-bold transition-all ${
                        augmentationTab === "abilities"
                          ? "bg-green-500 text-white shadow-lg"
                          : "bg-gray-800 hover:bg-gray-700 text-gray-300"
                      } font-['Montserrat']`}
                      onClick={() => setAugmentationTab("abilities")}
                    >
                      <Zap className="w-5 h-5 inline mr-2" />
                      Abilities
                    </button>
                    <button
                      className={`px-6 py-3 rounded-lg font-bold transition-all ${
                        augmentationTab === "corruption"
                          ? "bg-red-500 text-white shadow-lg"
                          : "bg-gray-800 hover:bg-gray-700 text-gray-300"
                      } font-['Montserrat']`}
                      onClick={() => setAugmentationTab("corruption")}
                    >
                      <Skull className="w-5 h-5 inline mr-2" />
                      Corruption
                    </button>
                  </div>

                  {/* Abilities Content */}
                  {augmentationTab === "abilities" && (
                    <div className="grid gap-6">
                      {/* Low Level Ability */}
                      <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 backdrop-blur-sm p-6 rounded-xl border border-green-500/30">
                        <div className="flex items-center space-x-3 mb-6">
                          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-lg">1</span>
                          </div>
                          <div>
                          <h4 className="text-2xl font-bold text-green-400 font-['Montserrat']">Low Level</h4>
                            <p className="text-green-300/70 text-sm font-['PT_Mono']">Basic augmentation power</p>
                        </div>
                        </div>
                        <div className="bg-black/40 p-6 rounded-lg border border-green-500/20">
                          <div className="space-y-4">
                            {(() => {
                              const text = selectedAugmentation.abilities.low;
                              const abilityName = text.match(/^([^:]+):/)?.[1] || '';
                              const description = text.replace(/^[^:]+:\s*/, '');
                              return (
                                <>
                                  {abilityName && (
                                    <div className="pb-3 border-b border-green-500/20">
                                      <h5 className="text-green-400 font-bold text-base font-['Montserrat'] mb-2">{abilityName}</h5>
                                    </div>
                                  )}
                                  <div className="space-y-3">
                                    {description.split(/(?<=[.:])\s+(?=[A-Z])/).map((sentence, idx) => (
                                      <div key={idx} className="flex items-start space-x-2">
                                        <span className="text-green-400/50 mt-1.5">•</span>
                                        <p className="text-gray-200 font-['PT_Mono'] text-sm leading-relaxed flex-1">
                                          {sentence.trim()}
                          </p>
                                      </div>
                                    ))}
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      </div>

                      {/* Medium Level Ability */}
                      <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm p-6 rounded-xl border border-yellow-500/30">
                        <div className="flex items-center space-x-3 mb-6">
                          <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-lg">2</span>
                          </div>
                          <div>
                          <h4 className="text-2xl font-bold text-yellow-400 font-['Montserrat']">Medium Level</h4>
                            <p className="text-yellow-300/70 text-sm font-['PT_Mono']">Enhanced augmentation power</p>
                        </div>
                        </div>
                        <div className="bg-black/40 p-6 rounded-lg border border-yellow-500/20">
                          <div className="space-y-4">
                            {(() => {
                              const text = selectedAugmentation.abilities.medium;
                              const abilityName = text.match(/^([^:]+):/)?.[1] || '';
                              const description = text.replace(/^[^:]+:\s*/, '');
                              return (
                                <>
                                  {abilityName && (
                                    <div className="pb-3 border-b border-yellow-500/20">
                                      <h5 className="text-yellow-400 font-bold text-base font-['Montserrat'] mb-2">{abilityName}</h5>
                                    </div>
                                  )}
                                  <div className="space-y-3">
                                    {description.split(/(?<=[.:])\s+(?=[A-Z])/).map((sentence, idx) => (
                                      <div key={idx} className="flex items-start space-x-2">
                                        <span className="text-yellow-400/50 mt-1.5">•</span>
                                        <p className="text-gray-200 font-['PT_Mono'] text-sm leading-relaxed flex-1">
                                          {sentence.trim()}
                          </p>
                                      </div>
                                    ))}
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      </div>

                      {/* High Level Ability */}
                      <div className="bg-gradient-to-r from-red-500/20 to-red-600/20 backdrop-blur-sm p-6 rounded-xl border border-red-500/30">
                        <div className="flex items-center space-x-3 mb-6">
                          <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-lg">3</span>
                          </div>
                          <div>
                          <h4 className="text-2xl font-bold text-red-400 font-['Montserrat']">High Level</h4>
                            <p className="text-red-300/70 text-sm font-['PT_Mono']">Master-level augmentation power</p>
                        </div>
                        </div>
                        <div className="bg-black/40 p-6 rounded-lg border border-red-500/20">
                          <div className="space-y-4">
                            {(() => {
                              const text = selectedAugmentation.abilities.high;
                              const abilityName = text.match(/^([^:]+):/)?.[1] || '';
                              const description = text.replace(/^[^:]+:\s*/, '');
                              return (
                                <>
                                  {abilityName && (
                                    <div className="pb-3 border-b border-red-500/20">
                                      <h5 className="text-red-400 font-bold text-base font-['Montserrat'] mb-2">{abilityName}</h5>
                                    </div>
                                  )}
                                  <div className="space-y-3">
                                    {description.split(/(?<=[.:])\s+(?=[A-Z])/).map((sentence, idx) => (
                                      <div key={idx} className="flex items-start space-x-2">
                                        <span className="text-red-400/50 mt-1.5">•</span>
                                        <p className="text-gray-200 font-['PT_Mono'] text-sm leading-relaxed flex-1">
                                          {sentence.trim()}
                          </p>
                        </div>
                                    ))}
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Corruption Content */}
                  {augmentationTab === "corruption" && (
                    <div className="grid gap-6">
                      {selectedAugmentation && augmentationCorruption[selectedAugmentation.id as keyof typeof augmentationCorruption] && (
                        <>
                          {/* Low Corruption */}
                          <div className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 backdrop-blur-sm p-6 rounded-xl border border-purple-500/30">
                            <div className="flex items-center justify-between mb-6">
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                                  <Skull className="w-6 h-6 text-white" />
                              </div>
                                <div>
                              <h4 className="text-2xl font-bold text-purple-400 font-['Montserrat']">Low Corruption</h4>
                                  <p className="text-purple-300/70 text-sm font-['PT_Mono']">Early warning signs</p>
                              </div>
                            </div>
                              <span className="bg-purple-500/20 text-purple-300 px-4 py-2 rounded-full text-sm font-bold font-['PT_Mono']">
                                25%
                              </span>
                            </div>
                            <div className="bg-black/40 p-6 rounded-lg border border-purple-500/20">
                              <div className="space-y-3">
                                {augmentationCorruption[selectedAugmentation.id as keyof typeof augmentationCorruption].low.split(/(?<=[.:])\s+(?=[A-Z])/).map((sentence: string, idx: number) => (
                                  <div key={idx} className="flex items-start space-x-2">
                                    <span className="text-purple-400/50 mt-1.5">•</span>
                                    <p className="text-gray-200 font-['PT_Mono'] text-sm leading-relaxed flex-1">
                                      {sentence.trim()}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Medium Corruption */}
                          <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-sm p-6 rounded-xl border border-orange-500/30">
                            <div className="flex items-center justify-between mb-6">
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                                  <Skull className="w-6 h-6 text-white" />
                              </div>
                                <div>
                              <h4 className="text-2xl font-bold text-orange-400 font-['Montserrat']">
                                Medium Corruption
                              </h4>
                                  <p className="text-orange-300/70 text-sm font-['PT_Mono']">Significant side effects</p>
                              </div>
                            </div>
                              <span className="bg-orange-500/20 text-orange-300 px-4 py-2 rounded-full text-sm font-bold font-['PT_Mono']">
                                50%
                              </span>
                            </div>
                            <div className="bg-black/40 p-6 rounded-lg border border-orange-500/20">
                              <div className="space-y-3">
                                {augmentationCorruption[selectedAugmentation.id as keyof typeof augmentationCorruption].medium.split(/(?<=[.:])\s+(?=[A-Z])/).map((sentence: string, idx: number) => (
                                  <div key={idx} className="flex items-start space-x-2">
                                    <span className="text-orange-400/50 mt-1.5">•</span>
                                    <p className="text-gray-200 font-['PT_Mono'] text-sm leading-relaxed flex-1">
                                      {sentence.trim()}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* High Corruption */}
                          <div className="bg-gradient-to-r from-red-500/20 to-red-800/20 backdrop-blur-sm p-6 rounded-xl border border-red-500/30">
                            <div className="flex items-center justify-between mb-6">
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                                  <Skull className="w-6 h-6 text-white" />
                              </div>
                                <div>
                              <h4 className="text-2xl font-bold text-red-400 font-['Montserrat']">High Corruption</h4>
                                  <p className="text-red-300/70 text-sm font-['PT_Mono']">Severe consequences</p>
                              </div>
                            </div>
                              <span className="bg-red-500/20 text-red-300 px-4 py-2 rounded-full text-sm font-bold font-['PT_Mono']">
                                75%+
                              </span>
                            </div>
                            <div className="bg-black/40 p-6 rounded-lg border border-red-500/20">
                              <div className="space-y-3">
                                {augmentationCorruption[selectedAugmentation.id as keyof typeof augmentationCorruption].high.split(/(?<=[.:])\s+(?=[A-Z])/).map((sentence: string, idx: number) => (
                                  <div key={idx} className="flex items-start space-x-2">
                                    <span className="text-red-400/50 mt-1.5">•</span>
                                    <p className="text-gray-200 font-['PT_Mono'] text-sm leading-relaxed flex-1">
                                      {sentence.trim()}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      } else if (selectedSubclass) {
        // Show augmentation selection
        return (
          <div className="w-full flex flex-col" style={{ height: '100%' }}>
            <div className="max-w-6xl mx-auto w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6 flex-shrink-0 px-4 sm:px-6 md:px-8">
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white font-['Montserrat']">
                  {selectedSubclass.name} - Choose Augmentation
                </h2>
                <p className="text-gray-300 text-lg font-['PT_Mono']">
                  Select an augmentation color to view its abilities and corruption effects.
                </p>
              </div>
              <button
                className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline font-['Montserrat']"
                onClick={() => setSelectedSubclass(null)}
              >
                Back to Subclasses
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 grid-rows-auto flex-1 w-full gap-2 sm:gap-3 md:gap-0" style={{ minHeight: 0, height: '100%' }}>
              {selectedSubclass.augmentations.map((augmentation) => (
                <motion.div
                  key={augmentation.id}
                  className="relative transition-all duration-300 cursor-pointer flex flex-col justify-end items-center p-2 sm:p-3 md:p-4 overflow-hidden"
                  onClick={() => handleAugmentationSelect(augmentation)}
                  whileHover={{ scale: 1.05, zIndex: 50 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    backgroundImage: `url(/${augmentation.name.charAt(0).toUpperCase() + augmentation.name.slice(1)}_${(selectedClass?.id ?? "common") === "hacker" ? "Hacker" : "Common"}.webp)`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                  }}
                >
                  {/* Gradient overlay for text readability - extends to all edges */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" style={{ top: 0, right: 0, bottom: 0, left: 0 }} />
                  
                  {/* Content positioned at bottom */}
                  <div className="relative z-10 flex flex-col items-center text-center w-full">
                    <h3 className="text-lg md:text-xl font-bold text-white mb-1 md:mb-2 font-['Montserrat'] drop-shadow-lg">
                      {augmentation.name}
                    </h3>
                    <p className="text-white text-xs md:text-sm leading-relaxed font-['PT_Mono'] drop-shadow-md">
                      {augmentation.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )
      } else if (selectedClass) {
        // Show subclass selection
        return (
          <div className="max-w-6xl mx-auto w-full h-full flex flex-col px-4 sm:px-6 md:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6 flex-shrink-0">
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white font-['Montserrat']">
                  {selectedClass.name} - Choose Subclass
                </h2>
                <p className="text-gray-300 text-lg font-['PT_Mono']">
                  Select a subclass to view augmentation options.
                </p>
              </div>
              <button
                className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline font-['Montserrat']"
                onClick={() => setSelectedClass(null)}
              >
                Back to Classes
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 flex-1" style={{ minHeight: 0 }}>
              {selectedClass.subclasses.map((subclass) => (
                <motion.div
                  key={subclass.id}
                  className="bg-black/60 backdrop-blur-sm p-6 md:p-8 lg:p-10 xl:p-12 rounded-xl border border-white/20 hover:border-cyan-400/50 transition-all duration-300 cursor-pointer flex flex-col h-full group relative overflow-hidden"
                  onClick={() => handleSubclassSelect(subclass)}
                  whileHover={{ scale: 1.02, zIndex: 10 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Subtle gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-cyan-500/0 group-hover:from-cyan-500/5 group-hover:to-cyan-500/10 transition-all duration-300 pointer-events-none" />
                  
                  {/* Header Section */}
                  <div className="flex items-center space-x-4 md:space-x-5 mb-5 md:mb-6 relative z-10">
                    <div className="flex-shrink-0 p-3 md:p-4 bg-white/5 rounded-lg group-hover:bg-cyan-500/20 transition-colors duration-300 flex items-center justify-center">
                      <div className="text-cyan-400 group-hover:text-cyan-300 transition-colors">
                    {subclass.icon}
                  </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl md:text-2xl lg:text-2xl xl:text-3xl font-bold text-white font-['Montserrat'] leading-tight">
                        {subclass.name}
                      </h3>
                    </div>
                  </div>
                  
                  {/* Description Section */}
                  <div className="flex-1 mb-5 md:mb-6 relative z-10">
                    <p className="text-gray-300 text-sm md:text-sm lg:text-base xl:text-base leading-relaxed font-['PT_Mono']">
                      {subclass.description}
                    </p>
                  </div>
                  
                  {/* Focus Ability Section */}
                  <div className="border-t border-gray-600/50 group-hover:border-cyan-400/30 transition-colors duration-300 pt-5 md:pt-6 relative z-10">
                    <div className="flex items-center space-x-2 mb-2 md:mb-3">
                      <div className="w-1 h-5 md:h-6 bg-cyan-400 rounded-full" />
                      <h4 className="text-cyan-400 font-bold text-sm md:text-base lg:text-lg xl:text-xl font-['Montserrat']">
                        Focus Ability
                      </h4>
                    </div>
                    <p className="text-gray-300 text-xs md:text-sm lg:text-base xl:text-base font-['PT_Mono'] leading-relaxed pl-3 md:pl-4">
                      {subclass.focusAbility}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )
      } else {
        // Show class selection
        return (
          <div className="max-w-6xl mx-auto w-full min-h-full flex flex-col px-4 sm:px-6 md:px-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6 font-['Montserrat'] px-4 sm:px-0">Choose Your Class</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 flex-1">
              {classesData.map((classData) => (
                <motion.div
                  key={classData.id}
                  className="relative rounded-xl border border-white/20 hover:border-cyan-400/50 transition-all duration-300 cursor-pointer overflow-hidden h-full min-h-[300px] md:min-h-[400px] lg:h-[calc(100vh-280px)] xl:h-[calc(100vh-300px)]"
                  onClick={() => handleClassSelect(classData)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Background Image */}
                  <img
                    src={classData.image || "/placeholder.svg"}
                    alt={classData.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  
                  {/* Gradient Overlay - 50% opacity at bottom to 0% at top */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/25 to-transparent" />
                  
                  {/* Content - Positioned at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 z-10">
                    <h3 className="text-lg md:text-xl font-bold text-white mb-2 font-['Montserrat'] drop-shadow-lg">
                      {classData.name}
                    </h3>
                    <p className="text-white text-xs md:text-sm leading-relaxed font-['PT_Mono'] drop-shadow-md">
                      {classData.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )
      }
    }

    // Other sections
    switch (activeSection) {
      case "overview":
        return (
          <div className="max-w-6xl mx-auto w-full space-y-6 px-4 sm:px-6 md:px-8">
            {/* Title Section */}
            <div className="text-center mb-8">
              <motion.h1
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-white drop-shadow-2xl font-['Montserrat'] mb-0"
              >
                Stonebound Souls
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg md:text-xl text-cyan-300 italic font-bold drop-shadow-lg font-['PT_Mono']"
              >
                What happens in the game affects your NFT metadata
              </motion.p>
            </div>

            {/* Core Features Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid md:grid-cols-3 gap-6 mb-8"
            >
              <div className="bg-black/60 backdrop-blur-sm p-6 rounded-xl border border-cyan-400/30 text-center">
                <Gamepad2 className="w-12 h-12 text-cyan-400 mb-4 mx-auto" />
                <h3 className="text-xl font-bold mb-3 text-cyan-400 font-['Montserrat']">Live RPG Experience</h3>
                <p className="text-gray-300 text-sm leading-relaxed font-['PT_Mono']">
                  D20-based tabletop RPG played weekly over X Spaces with real-time dice rolling and evolving NFT
                  characters.
                </p>
              </div>
              <div className="bg-black/60 backdrop-blur-sm p-6 rounded-xl border border-purple-400/30 text-center">
                <Skull className="w-12 h-12 text-purple-400 mb-4 mx-auto" />
                <h3 className="text-xl font-bold mb-3 text-purple-400 font-['Montserrat']">High Stakes Gameplay</h3>
                <p className="text-gray-300 text-sm leading-relaxed font-['PT_Mono']">
                  Miss a session and your character dies permanently. Every choice has lasting consequences on your NFT.
                </p>
              </div>
              <div className="bg-black/60 backdrop-blur-sm p-6 rounded-xl border border-pink-400/30 text-center">
                <Sparkles className="w-12 h-12 text-pink-400 mb-4 mx-auto" />
                <h3 className="text-xl font-bold mb-3 text-pink-400 font-['Montserrat']">NFT Evolution</h3>
                <p className="text-gray-300 text-sm leading-relaxed font-['PT_Mono']">
                  Your Goliath NFT evolves based on gameplay decisions, creating permanent on-chain lore and value.
                </p>
              </div>
            </motion.div>

            {/* Game Format Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid md:grid-cols-2 gap-6"
            >
              <div className="bg-black/60 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent font-['Montserrat']">
                  Monthly Story Arcs
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed font-['PT_Mono'] mb-4">
                  Each month features a complete 4-session story arc for only four players. Tickets are limited and go
                  fast, so secure your spot early.
                </p>
                <ul className="space-y-2 text-sm text-gray-400 font-['PT_Mono']">
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                    <span>4 weekly sessions per story</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                    <span>Only 4 players per campaign</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                    <span>Curated narrative experience</span>
                  </li>
                </ul>
              </div>
              <div className="bg-black/60 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent font-['Montserrat']">
                  Live Transparency
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed mb-4 font-['PT_Mono']">
                  All gameplay happens live on X Spaces with public dice rolling via the SBS LIVE webapp. The community
                  can watch your journey unfold in real-time.
                </p>
                <ul className="space-y-2 text-sm text-gray-400 font-['PT_Mono']">
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                    <span>Public dice rolling system</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                    <span>Community spectating on X</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                    <span>Real-time NFT metadata updates</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        )

      case "requirements":
        return (
          <div className="max-w-4xl mx-auto w-full space-y-6 px-4 sm:px-6 md:px-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center font-['Montserrat'] px-4 sm:px-0">Entry Requirements</h2>
            <p className="text-gray-300 text-lg leading-relaxed text-center font-['PT_Mono']">
              To participate in Stonebound Souls, you must meet the following criteria:
            </p>
            <div className="bg-black/60 backdrop-blur-sm p-8 rounded-xl border border-white/20">
              <ul className="space-y-4 text-gray-300 text-lg font-['PT_Mono']">
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mt-3 flex-shrink-0" />
                  <span>Own a Stonebound Souls NFT (Goliath or Soulbound).</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mt-3 flex-shrink-0" />
                  <span>Have a Twitter (X) account to participate in voice sessions.</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mt-3 flex-shrink-0" />
                  <span>Be available during the scheduled weekly session times.</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mt-3 flex-shrink-0" />
                  <span>Agree to abide by the game rules and community guidelines.</span>
                </li>
              </ul>
            </div>
            <p className="text-gray-300 text-lg leading-relaxed text-center font-['PT_Mono']">
              Failure to meet these requirements will result in exclusion from the game.
            </p>
          </div>
        )

      case "rules":
        return (
          <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 md:px-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6 font-['Montserrat'] px-4 sm:px-0">Game Rules</h2>

            {/* Rules Navigation Tabs */}
            <div className="flex space-x-4 mb-6">
              <button
                className={`px-4 py-2 rounded-md ${
                  activeRulesTab === "core" ? "bg-gray-600 text-white" : "bg-gray-800 hover:bg-gray-700 text-gray-300"
                } font-['Montserrat']`}
                onClick={() => setActiveRulesTab("core")}
              >
                Core
              </button>
              <button
                className={`px-4 py-2 rounded-md ${
                  activeRulesTab === "combat" ? "bg-blue-500 text-white" : "bg-gray-800 hover:bg-gray-700 text-gray-300"
                } font-['Montserrat']`}
                onClick={() => setActiveRulesTab("combat")}
              >
                Combat
              </button>
              <button
                className={`px-4 py-2 rounded-md ${
                  activeRulesTab === "skills" ? "bg-blue-400 text-white" : "bg-gray-800 hover:bg-gray-700 text-gray-300"
                } font-['Montserrat']`}
                onClick={() => setActiveRulesTab("skills")}
              >
                Skills
              </button>
              <button
                className={`px-4 py-2 rounded-md ${
                  activeRulesTab === "live" ? "bg-gray-600 text-white" : "bg-gray-800 hover:bg-gray-700 text-gray-300"
                } font-['Montserrat']`}
                onClick={() => setActiveRulesTab("live")}
              >
                Live
              </button>
            </div>

            {/* Core Rules Content */}
            {activeRulesTab === "core" && (
              <div className="bg-black/60 backdrop-blur-sm p-8 rounded-xl border border-white/20">
                <div className="space-y-4 text-gray-300 font-['PT_Mono']">
                  <h3 className="text-2xl font-bold text-white font-['Montserrat'] mb-4">Core Game Rules</h3>
                  <p>Stonebound Souls is a D20-based tabletop RPG played live on X Spaces.</p>
                  <p>Players roll dice using the SBS LIVE webapp, and the results are visible to everyone.</p>
                  <p>The Dungeon Master (DM) guides the story and adjudicates the rules.</p>
                  <p>Character creation involves selecting a class, subclass, and augmentation color.</p>
                  <p>All actions are resolved using standard D20 mechanics with class-specific modifiers.</p>
                </div>
              </div>
            )}

            {/* Combat Rules Content */}
            {activeRulesTab === "combat" && (
              <div className="space-y-6">
                {/* Initiative & Combat Order */}
                <div className="bg-black/60 backdrop-blur-sm p-6 rounded-xl border border-red-500/30">
                  <div className="flex items-center space-x-2 mb-4">
                    <Target className="w-5 h-5 text-red-400" />
                    <h3 className="text-xl font-bold text-red-400 font-['Montserrat']">Initiative & Combat Order</h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-white font-bold mb-2 font-['Montserrat']">Initiative Roll</h4>
                      <p className="text-cyan-400 font-['PT_Mono'] mb-2">1d20 + DEX</p>
                      <p className="text-gray-300 text-sm font-['PT_Mono']">
                        At the start of combat, all participants roll initiative to determine the order of turns. The
                        highest roll goes first.
                      </p>
                    </div>
                    <div>
                      <h4 className="text-white font-bold mb-2 font-['Montserrat']">Actions Per Turn</h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-white font-['PT_Mono']">Movement</span>
                          <span className="text-gray-400 text-sm font-['PT_Mono']">Up to your speed in feet</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span className="text-white font-['PT_Mono']">Action</span>
                          <span className="text-gray-400 text-sm font-['PT_Mono']">Attack, cast, use item, etc.</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <span className="text-white font-['PT_Mono']">Bonus Action</span>
                          <span className="text-gray-400 text-sm font-['PT_Mono']">Quick additional action</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                          <span className="text-white font-['PT_Mono']">Reaction</span>
                          <span className="text-gray-400 text-sm font-['PT_Mono']">Response to triggers</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Health & Damage */}
                <div className="bg-black/60 backdrop-blur-sm p-6 rounded-xl border border-yellow-500/30">
                  <div className="flex items-center space-x-2 mb-4">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <h3 className="text-xl font-bold text-yellow-400 font-['Montserrat']">Health & Damage</h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-white font-bold mb-2 font-['Montserrat']">Hit Points</h4>
                      <p className="text-gray-300 text-sm font-['PT_Mono'] mb-3">Class Die + CON modifier per level</p>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-gray-300 text-sm font-['PT_Mono']">
                            Above 0 HP = Conscious & active
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <span className="text-gray-300 text-sm font-['PT_Mono']">
                            At 0 HP = Unconscious, death saves
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <span className="text-gray-300 text-sm font-['PT_Mono']">
                            Negative HP = Death risk increases
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-red-900/30 p-4 rounded-lg border border-red-500/50">
                      <div className="flex items-center space-x-2 mb-3">
                        <Skull className="w-4 h-4 text-red-400" />
                        <h4 className="text-red-400 font-bold font-['Montserrat']">Death Saving Throws</h4>
                      </div>
                      <p className="text-gray-300 text-sm font-['PT_Mono'] mb-2">
                        When at 0 HP, roll a d20 at the start of your turn:
                      </p>
                      <div className="space-y-1 text-sm font-['PT_Mono']">
                        <div className="flex justify-between">
                          <span className="text-gray-300">1-9:</span>
                          <span className="text-red-400">One failure</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">10-19:</span>
                          <span className="text-green-400">One success</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">20:</span>
                          <span className="text-cyan-400">Regain 1 HP</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Natural 1:</span>
                          <span className="text-red-400">Two failures</span>
                        </div>
                      </div>
                      <div className="mt-3 p-2 bg-red-800/50 rounded border border-red-500/30">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                          <span className="text-yellow-300 text-xs font-bold font-['PT_Mono']">
                            Three failures = Permanent character death
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Attack & Defense */}
                <div className="bg-black/60 backdrop-blur-sm p-6 rounded-xl border border-green-500/30">
                  <div className="flex items-center space-x-2 mb-4">
                    <Shield className="w-5 h-5 text-green-400" />
                    <h3 className="text-xl font-bold text-green-400 font-['Montserrat']">Attack & Defense</h3>
                  </div>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="text-white font-bold mb-2 font-['Montserrat']">Attack Roll</h4>
                      <p className="text-cyan-400 font-['PT_Mono'] mb-2">1d20 + Ability + Prof vs AC</p>
                      <p className="text-gray-300 text-sm font-['PT_Mono']">
                        STR for melee weapons, DEX for ranged and finesse weapons
                      </p>
                    </div>
                    <div>
                      <h4 className="text-white font-bold mb-2 font-['Montserrat']">Damage</h4>
                      <p className="text-cyan-400 font-['PT_Mono'] mb-2">Weapon Die + Ability</p>
                      <p className="text-gray-300 text-sm font-['PT_Mono']">
                        Different weapons deal different types and amounts of damage
                      </p>
                    </div>
                    <div>
                      <h4 className="text-white font-bold mb-2 font-['Montserrat']">Armor Class</h4>
                      <p className="text-cyan-400 font-['PT_Mono'] mb-2">10 + DEX + Armor</p>
                      <p className="text-gray-300 text-sm font-['PT_Mono']">
                        Higher AC makes you harder to hit with attacks
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-yellow-900/30 rounded-lg border border-yellow-500/50">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-yellow-400" />
                      <h4 className="text-yellow-400 font-bold font-['Montserrat']">Critical Hit (Natural 20)</h4>
                    </div>
                    <p className="text-gray-300 text-sm font-['PT_Mono'] mt-1">Double all damage dice for the attack</p>
                  </div>
                </div>
              </div>
            )}

            {/* Skills Content */}
            {activeRulesTab === "skills" && (
              <div className="space-y-6">
                {/* Skills Overview */}
                <div className="bg-black/60 backdrop-blur-sm p-6 rounded-xl border border-green-500/30">
                  <div className="flex items-center space-x-2 mb-4">
                    <Target className="w-5 h-5 text-green-400" />
                    <h3 className="text-xl font-bold text-green-400 font-['Montserrat']">Skills Overview</h3>
                  </div>
                  <div className="mb-4">
                    <h4 className="text-white font-bold mb-2 font-['Montserrat']">Skill Checks</h4>
                    <p className="text-cyan-400 font-['PT_Mono'] mb-2">1d20 + Ability + Proficiency</p>
                    <p className="text-gray-300 text-sm font-['PT_Mono']">
                      Skills represent specific areas of expertise. When you attempt an action that requires a
                      particular skill, you make a skill check by rolling a d20 and adding your ability modifier and
                      proficiency bonus if you're proficient in that skill.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="bg-red-900/30 p-3 rounded border border-red-500/50">
                      <h4 className="text-red-400 font-bold text-sm font-['Montserrat'] mb-2">STR Skills</h4>
                      <ul className="text-xs text-gray-300 font-['PT_Mono'] space-y-1">
                        <li>• Athletics</li>
                      </ul>
                    </div>
                    <div className="bg-yellow-900/30 p-3 rounded border border-yellow-500/50">
                      <h4 className="text-yellow-400 font-bold text-sm font-['Montserrat'] mb-2">DEX Skills</h4>
                      <ul className="text-xs text-gray-300 font-['PT_Mono'] space-y-1">
                        <li>• Acrobatics</li>
                        <li>• Sleight of Hand</li>
                        <li>• Stealth</li>
                      </ul>
                    </div>
                    <div className="bg-green-900/30 p-3 rounded border border-green-500/50">
                      <h4 className="text-green-400 font-bold text-sm font-['Montserrat'] mb-2">INT Skills</h4>
                      <ul className="text-xs text-gray-300 font-['PT_Mono'] space-y-1">
                        <li>• Arcana</li>
                        <li>• History</li>
                        <li>• Investigation</li>
                        <li>• Nature</li>
                      </ul>
                    </div>
                    <div className="bg-blue-900/30 p-3 rounded border border-blue-500/50">
                      <h4 className="text-blue-400 font-bold text-sm font-['Montserrat'] mb-2">WIS Skills</h4>
                      <ul className="text-xs text-gray-300 font-['PT_Mono'] space-y-1">
                        <li>• Animal Handling</li>
                        <li>• Insight</li>
                        <li>• Medicine</li>
                        <li>• Perception</li>
                        <li>• Survival</li>
                      </ul>
                    </div>
                    <div className="bg-purple-900/30 p-3 rounded border border-purple-500/50">
                      <h4 className="text-purple-400 font-bold text-sm font-['Montserrat'] mb-2">CHA Skills</h4>
                      <ul className="text-xs text-gray-300 font-['PT_Mono'] space-y-1">
                        <li>• Deception</li>
                        <li>• Intimidation</li>
                        <li>• Performance</li>
                        <li>• Persuasion</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Skills List */}
                <div className="bg-black/60 backdrop-blur-sm p-6 rounded-xl border border-blue-500/30">
                  <div className="flex items-center space-x-2 mb-4">
                    <Brain className="w-5 h-5 text-blue-400" />
                    <h3 className="text-xl font-bold text-blue-400 font-['Montserrat']">Skills List</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { name: "Acrobatics", desc: "Balance, tumble, flip", ability: "DEX", color: "text-yellow-400" },
                      { name: "Athletics", desc: "Climb, jump, swim", ability: "STR", color: "text-red-400" },
                      { name: "Arcana", desc: "Magic knowledge", ability: "INT", color: "text-green-400" },
                      { name: "Deception", desc: "Lie, mislead", ability: "CHA", color: "text-purple-400" },
                      { name: "History", desc: "Lore, events", ability: "INT", color: "text-green-400" },
                      { name: "Insight", desc: "Read intentions", ability: "WIS", color: "text-blue-400" },
                      { name: "Investigation", desc: "Search, deduce", ability: "INT", color: "text-green-400" },
                      { name: "Intimidation", desc: "Threaten, scare", ability: "CHA", color: "text-purple-400" },
                      { name: "Medicine", desc: "Treat wounds", ability: "WIS", color: "text-blue-400" },
                      { name: "Nature", desc: "Environment knowledge", ability: "INT", color: "text-green-400" },
                      { name: "Perception", desc: "Notice things", ability: "WIS", color: "text-blue-400" },
                      { name: "Performance", desc: "Entertain", ability: "CHA", color: "text-purple-400" },
                      { name: "Persuasion", desc: "Influence", ability: "CHA", color: "text-purple-400" },
                      { name: "Sleight of Hand", desc: "Manual tricks", ability: "DEX", color: "text-yellow-400" },
                      { name: "Stealth", desc: "Hide, sneak", ability: "DEX", color: "text-yellow-400" },
                      { name: "Survival", desc: "Track, forage", ability: "WIS", color: "text-blue-400" },
                    ].map((skill, index) => (
                      <div key={index} className="bg-gray-900/50 p-3 rounded border border-gray-600/50">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="text-white font-bold text-sm font-['Montserrat']">{skill.name}</h4>
                          <span className={`text-xs font-bold font-['PT_Mono'] ${skill.color}`}>{skill.ability}</span>
                        </div>
                        <p className="text-gray-400 text-xs font-['PT_Mono']">{skill.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Live Rules Content */}
            {activeRulesTab === "live" && (
              <div className="bg-black/60 backdrop-blur-sm p-8 rounded-xl border border-white/20">
                <div className="space-y-4 text-gray-300 font-['PT_Mono']">
                  <h3 className="text-2xl font-bold text-white font-['Montserrat'] mb-4">Live Play Rules</h3>
                  <p>All gameplay happens live on X Spaces with public dice rolling via the SBS LIVE webapp.</p>
                  <p>The community can watch your journey unfold in real-time.</p>
                  <p>Missing a session results in permanent character death.</p>
                  <p>All dice rolls are transparent and visible to spectators.</p>
                  <p>Real-time NFT metadata updates occur based on gameplay events.</p>
                </div>
              </div>
            )}
          </div>
        )

      case "progression":
        return (
          <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 md:px-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6 font-['Montserrat'] px-4 sm:px-0">Leveling and Progression</h2>
            <p className="text-gray-300 text-lg leading-relaxed font-['PT_Mono'] mb-6">
              As you play Stonebound Souls, your character gains experience points (XP) and levels up.
            </p>
            <div className="bg-black/60 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider font-['Montserrat']">
                        Level
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider font-['Montserrat']">
                        XP Range
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider font-['Montserrat']">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider font-['Montserrat']">
                        Reward
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-900 divide-y divide-gray-700">
                    {levelingData.map((level) => (
                      <tr key={level.level} className="hover:bg-gray-800/50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-['PT_Mono']">
                          {level.level}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-['PT_Mono']">
                          {level.xp}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-['PT_Mono']">
                          {level.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-['PT_Mono']">
                          {level.reward}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-y-auto">
      <CyberpunkBackground />
      <Sidebar />
      <Header />

      <div className="ml-0 md:ml-20 min-h-screen flex flex-col pt-[72px]">
        {/* Main Content Area */}
        <div className="flex-1 relative overflow-y-auto">
          {/* Conditional Background Image - Show for overview and requirements */}
          {(activeSection === "overview" || activeSection === "requirements") && (
            <>
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url('/images/stonebound-souls-overview-bg.jpg')`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />
            </>
          )}

          {/* Solid background for other sections */}
          {activeSection !== "overview" && activeSection !== "requirements" && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900" />
          )}

          {/* Dynamic Content Overlay */}
          <div className="relative z-10 w-full p-4 sm:p-6 md:p-8 flex flex-col min-h-[calc(100vh-72px-80px)] pb-20 sm:pb-24 md:pb-28">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeSection}-${selectedClass?.id}-${selectedSubclass?.id}-${selectedAugmentation?.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex-1 flex flex-col h-full"
              >
                {renderCurrentView()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom Navigation - Fixed to bottom of screen */}
        <div className="fixed bottom-0 left-0 right-0 md:left-20 bg-black/80 backdrop-blur-md p-2 sm:p-4 md:p-6 border-t border-white/10 z-50">
          <div className="max-w-6xl mx-auto flex items-center justify-center overflow-x-auto">
            <div className="flex items-center space-x-2 sm:space-x-4">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => {
                    setActiveSection(section.id)
                    if (section.id !== "classes") {
                      setSelectedClass(null)
                      setSelectedSubclass(null)
                      setSelectedAugmentation(null)
                    }
                  }}
                  className={`flex items-center space-x-2 px-2 sm:px-4 py-2 rounded-lg transition-colors ${
                    activeSection === section.id
                      ? "bg-cyan-500 text-white shadow-lg"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  {section.icon}
                  <span className="hidden sm:inline">{section.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Section - Fixed to bottom */}
      </div>
    </div>
  )
}

const classesData: Class[] = [
  {
    id: "fighter",
    name: "Fighter",
    description: "A versatile warrior skilled in combat tactics and battlefield strategy.",
    image: "/images/classes/fighter_class_final.webp",
    dice: "D10",
    subclasses: [
      {
        id: "berserker",
        name: "Berserker",
        icon: <Skull className="w-6 h-6" />,
        description: "Unleash your inner fury to devastate enemies.",
        focusAbility: "Rage: Enter berserker state, +2 damage, resist fear",
        augmentations: augmentations,
      },
      {
        id: "guardian",
        name: "Guardian",
        icon: <Shield className="w-6 h-6" />,
        description: "Protect your allies at all costs.",
        focusAbility: "Aegis: Create protective barriers, +2 AC to allies",
        augmentations: augmentations,
      },
      {
        id: "weaponmaster",
        name: "Weaponmaster",
        icon: <Target className="w-6 h-6" />,
        description: "Master of all weapons and combat techniques.",
        focusAbility: "Arsenal: Proficiency with all weapons, +1 damage",
        augmentations: augmentations,
      },
      {
        id: "tactician",
        name: "Tactician",
        icon: <Brain className="w-6 h-6" />,
        description: "A master strategist who plans every move.",
        focusAbility: "Strategy: Read battlefield, +2 to initiative and tactics",
        augmentations: augmentations,
      },
    ],
  },
  {
    id: "healer",
    name: "Healer",
    description: "A support specialist focused on healing allies and providing protection.",
    image: "/images/classes/healer_class_final.webp",
    dice: "D8",
    subclasses: [
      {
        id: "medic",
        name: "Medic",
        icon: <Zap className="w-6 h-6" />,
        description: "Heal allies and mend wounds with medical expertise.",
        focusAbility: "Triage: Instant healing, stabilize dying allies",
        augmentations: augmentations,
      },
      {
        id: "biotechnician",
        name: "Biotechnician",
        icon: <Brain className="w-6 h-6" />,
        description: "Modify biology to enhance allies and create bio-weapons.",
        focusAbility: "Bio-Enhancement: Modify ally biology, grant temporary abilities",
        augmentations: augmentations,
      },
      {
        id: "spiritualist",
        name: "Spiritualist",
        icon: <Sparkles className="w-6 h-6" />,
        description: "Channel spirits for healing and guidance.",
        focusAbility: "Spirit Channeling: Commune with spirits, gain guidance",
        augmentations: augmentations,
      },
      {
        id: "lifeguard",
        name: "Lifeguard",
        icon: <Shield className="w-6 h-6" />,
        description: "Prevent death and extend life force.",
        focusAbility: "Life Preservation: Prevent death, extend life force",
        augmentations: augmentations,
      },
    ],
  },
  {
    id: "rogue",
    name: "Rogue",
    description: "A stealthy assassin skilled in infiltration and silent deception.",
    image: "/images/classes/rogue_class_final.webp",
    dice: "D6",
    subclasses: [
      {
        id: "assassin",
        name: "Assassin",
        icon: <Skull className="w-6 h-6" />,
        description: "Mark targets for assassination and track them anywhere.",
        focusAbility: "Death Mark: Mark targets for assassination, track anywhere",
        augmentations: augmentations,
      },
      {
        id: "infiltrator",
        name: "Infiltrator",
        icon: <Lock className="w-6 h-6" />,
        description: "Become undetectable and bypass security.",
        focusAbility: "Ghost Protocol: Become undetectable, bypass security",
        augmentations: augmentations,
      },
      {
        id: "trickster",
        name: "Trickster",
        icon: <Dice6 className="w-6 h-6" />,
        description: "Create unpredictable effects in combat.",
        focusAbility: "Chaos Theory: Create unpredictable effects in combat",
        augmentations: augmentations,
      },
      {
        id: "scout",
        name: "Scout",
        icon: <Target className="w-6 h-6" />,
        description: "Gather perfect information about enemies.",
        focusAbility: "Tactical Intel: Gather perfect information about enemies",
        augmentations: augmentations,
      },
    ],
  },
  {
    id: "hacker",
    name: "Hacker",
    description: "A master of the digital world, skilled in hacking and cyber warfare.",
    image: "/images/classes/caster_class_final.webp",
    dice: "D8",
    subclasses: [
      {
        id: "nanotechnician",
        name: "Nanotechnician",
        icon: <Brain className="w-6 h-6" />,
        description: "Deploy microscopic technology.",
        focusAbility: "Nano-Tech Integration: Deploy microscopic technology",
        augmentations: augmentations,
      },
      {
        id: "spheremaster",
        name: "Spheremaster",
        icon: <Zap className="w-6 h-6" />,
        description: "Control adaptive projectile spheres.",
        focusAbility: "Sphere Integration: Control adaptive projectile spheres",
        augmentations: augmentations,
      },
      {
        id: "dronecommander",
        name: "Dronecommander",
        icon: <Users className="w-6 h-6" />,
        description: "Command swarms of micro-drones.",
        focusAbility: "Drone Integration: Command swarms of micro-drones",
        augmentations: augmentations,
      },
      {
        id: "armortech",
        name: "Armortech",
        icon: <Shield className="w-6 h-6" />,
        description: "Merge with advanced exoskeleton.",
        focusAbility: "Armor Integration: Merge with advanced exoskeleton",
        augmentations: augmentations,
      },
    ],
  },
]
