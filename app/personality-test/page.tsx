"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Header } from "@/components/header"
import { CyberpunkBackground } from "@/components/cyberpunk-background"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Sparkles, Download, Share2 } from "lucide-react"
import html2canvas from "html2canvas"

// Complete rock color data with all 11 types and updated rarities
const rockColors = [
  {
    name: "COMMON",
    element: "EARTH",
    color: "#8B4513",
    rarity: "Common",
    positive: "Grounded, reliable, practical, stable, dependable",
    negative: "Boring, predictable, stubborn, unimaginative, rigid",
    powers: "Enhanced durability, connection to natural elements, ability to fortify structures.",
  },
  {
    name: "YELLOW",
    element: "GAS",
    color: "#FFB000",
    rarity: "Uncommon",
    positive: "Cheerful, adaptable, optimistic, energetic, light-hearted",
    negative: "Unpredictable, inconsistent, superficial, flighty, impulsive",
    powers: "Gaseous form, enhanced agility, ability to create minor illusions or distractions.",
  },
  {
    name: "TURQUOISE",
    element: "ELECTRICITY",
    color: "#40E0D0",
    rarity: "Uncommon",
    positive: "Quick-witted, adaptable, creative, energetic, inspiring",
    negative: "Unpredictable, impulsive, restless, volatile, erratic",
    powers: "Electrical manipulation, rapid thought processing, ability to interface with technology.",
  },
  {
    name: "BLUE",
    element: "ICE",
    color: "#0F52BA",
    rarity: "Rare",
    positive: "Calm, rational, introspective, patient, stable",
    negative: "Cold, aloof, unemotional, indecisive, detached",
    powers: "Cryokinesis, enhanced mental fortitude, ability to slow down opponents.",
  },
  {
    name: "PURPLE",
    element: "FORCE/MIND",
    color: "#9966CC",
    rarity: "Rare",
    positive: "Wise, intuitive, thoughtful, intellectual, sensitive",
    negative: "Overthinking, secretive, indecisive, overly complex, mysterious",
    powers: "Psionic abilities, telepathy, mind control (minor), enhanced intuition.",
  },
  {
    name: "RED",
    element: "FIRE",
    color: "#E0115F",
    rarity: "Rare",
    positive: "Passionate, assertive, confident, courageous, energetic",
    negative: "Impulsive, hot-headed, aggressive, domineering, volatile",
    powers: "Pyrokinesis, enhanced physical strength, ability to inspire fear or courage.",
  },
  {
    name: "SILVER",
    element: "PHYSICAL ENHANCEMENTS",
    color: "#C0C0C0",
    rarity: "Epic",
    positive: "Agile, resilient, competitive, disciplined, strong",
    negative: "Over-competitive, stubborn, uncompromising, aggressive",
    powers: "Superhuman agility, enhanced reflexes, metallic skin for defense, weapon manifestation.",
  },
  {
    name: "GOLD",
    element: "WEALTH/PROSPERITY",
    color: "#FFD700",
    rarity: "Epic",
    positive: "Ambitious, successful, confident, charismatic, influential",
    negative: "Greedy, materialistic, arrogant, superficial, selfish",
    powers: "Wealth manipulation, enhanced charisma, ability to attract resources, minor reality warping.",
  },
  {
    name: "AQUAMARINE",
    element: "WATER/HEALING",
    color: "#7FFFD4",
    rarity: "Legendary",
    positive: "Healing, peaceful, empathetic, nurturing, harmonious",
    negative: "Overly emotional, passive, indecisive, escapist, dependent",
    powers: "Hydrokinesis, rapid healing, empathy, ability to soothe and calm others.",
  },
  {
    name: "BLACK",
    element: "VOID/SHADOW",
    color: "#000000",
    rarity: "Mythic",
    positive: "Mysterious, powerful, protective, sophisticated, elegant",
    negative: "Dark, pessimistic, secretive, intimidating, destructive",
    powers: "Shadow manipulation, teleportation, void energy blasts, enhanced stealth.",
  },
  {
    name: "WHITE",
    element: "LIGHT/PURITY",
    color: "#FFFFFF",
    rarity: "Mythic",
    positive: "Pure, enlightened, peaceful, spiritual, transcendent",
    negative: "Naive, detached, perfectionist, judgmental, sterile",
    powers: "Light manipulation, purification, energy blasts, enhanced perception.",
  },
]

interface Question {
  id: number
  text: string
  options: {
    text: string
    scores: { [colorName: string]: number } // e.g., { "RED": 2, "YELLOW": 1 }
  }[]
}

const questions: Question[] = [
  {
    id: 1,
    text: "When faced with a difficult challenge, what is your first instinct?",
    options: [
      { text: "Analyze the situation calmly and plan a logical approach.", scores: { BLUE: 2, PURPLE: 1 } },
      { text: "Charge headfirst, relying on my strength and courage.", scores: { RED: 2, SILVER: 1 } },
      { text: "Look for creative, unconventional solutions.", scores: { TURQUOISE: 2, YELLOW: 1 } },
      { text: "Seek guidance from others or a higher power.", scores: { AQUAMARINE: 2, WHITE: 1 } },
      { text: "Observe from the shadows, waiting for the perfect moment to strike.", scores: { BLACK: 2, PURPLE: 1 } },
      { text: "Assess what resources I have and how to best leverage them.", scores: { GOLD: 2, COMMON: 1 } },
    ],
  },
  {
    id: 2,
    text: "What kind of environment do you feel most comfortable in?",
    options: [
      { text: "A bustling city, full of opportunities and connections.", scores: { GOLD: 2, YELLOW: 1 } },
      { text: "A quiet, secluded place where I can think and reflect.", scores: { BLUE: 2, PURPLE: 1 } },
      { text: "A wild, untamed wilderness, where survival is key.", scores: { COMMON: 2, RED: 1 } },
      { text: "A high-tech lab or a network hub, where I can innovate.", scores: { TURQUOISE: 2, SILVER: 1 } },
      { text: "Anywhere I can blend in and remain unnoticed.", scores: { BLACK: 2, PURPLE: 1 } },
      { text: "A serene, natural setting, close to water or lush greenery.", scores: { AQUAMARINE: 2, WHITE: 1 } },
    ],
  },
  {
    id: 3,
    text: "What is your greatest strength?",
    options: [
      { text: "My unwavering loyalty and dependability.", scores: { COMMON: 2, BLUE: 1 } },
      { text: "My ability to adapt and thrive in chaos.", scores: { YELLOW: 2, TURQUOISE: 1 } },
      { text: "My fierce determination and courage.", scores: { RED: 2, SILVER: 1 } },
      { text: "My sharp intellect and strategic thinking.", scores: { PURPLE: 2, BLUE: 1 } },
      { text: "My compassion and ability to heal others.", scores: { AQUAMARINE: 2, WHITE: 1 } },
      { text: "My ambition and drive for success.", scores: { GOLD: 2, BLACK: 1 } },
    ],
  },
  {
    id: 4,
    text: "How do you prefer to resolve conflicts?",
    options: [
      { text: "Directly, confronting the issue head-on.", scores: { RED: 2, SILVER: 1 } },
      { text: "Through careful negotiation and diplomacy.", scores: { GOLD: 2, AQUAMARINE: 1 } },
      { text: "By finding a clever workaround or exploiting a weakness.", scores: { TURQUOISE: 2, BLACK: 1 } },
      { text: "By understanding the root cause and seeking a peaceful resolution.", scores: { BLUE: 2, WHITE: 1 } },
      { text: "I avoid them if possible, or use misdirection.", scores: { YELLOW: 2, PURPLE: 1 } },
      { text: "I stand my ground and protect what's mine.", scores: { COMMON: 2, RED: 1 } },
    ],
  },
  {
    id: 5,
    text: "What kind of legacy do you wish to leave behind?",
    options: [
      { text: "To be remembered as a powerful and influential leader.", scores: { GOLD: 2, RED: 1 } },
      { text: "To have brought peace and healing to the world.", scores: { AQUAMARINE: 2, WHITE: 1 } },
      { text: "To have pushed the boundaries of knowledge and innovation.", scores: { PURPLE: 2, TURQUOISE: 1 } },
      { text: "To have built something lasting and dependable.", scores: { COMMON: 2, BLUE: 1 } },
      { text: "To have lived a life of freedom and adventure.", scores: { YELLOW: 2, SILVER: 1 } },
      { text: "To have left a mysterious and impactful mark.", scores: { BLACK: 2, PURPLE: 1 } },
    ],
  },
  {
    id: 6,
    text: "Which word best describes your ideal self?",
    options: [
      { text: "Unstoppable", scores: { RED: 2, SILVER: 1 } },
      { text: "Enlightened", scores: { WHITE: 2, AQUAMARINE: 1 } },
      { text: "Resourceful", scores: { GOLD: 2, COMMON: 1 } },
      { text: "Insightful", scores: { PURPLE: 2, BLUE: 1 } },
      { text: "Dynamic", scores: { YELLOW: 2, TURQUOISE: 1 } },
      { text: "Stealthy", scores: { BLACK: 2, SILVER: 1 } },
    ],
  },
  {
    id: 7,
    text: "What is your biggest fear?",
    options: [
      { text: "Being trapped or losing my freedom.", scores: { YELLOW: 2, TURQUOISE: 1 } },
      { text: "Failing to protect those I care about.", scores: { COMMON: 2, RED: 1 } },
      { text: "Losing control or being overwhelmed by emotions.", scores: { BLUE: 2, PURPLE: 1 } },
      { text: "Being powerless or insignificant.", scores: { BLACK: 2, GOLD: 1 } },
      { text: "Being misunderstood or isolated.", scores: { AQUAMARINE: 2, WHITE: 1 } },
      { text: "Being weak or unable to compete.", scores: { SILVER: 2, RED: 1 } },
    ],
  },
  {
    id: 8,
    text: "How do you react to unexpected changes?",
    options: [
      { text: "I embrace them as new opportunities.", scores: { YELLOW: 2, TURQUOISE: 1 } },
      { text: "I prefer stability and find them unsettling.", scores: { COMMON: 2, BLUE: 1 } },
      { text: "I quickly adapt and find a way to turn them to my advantage.", scores: { SILVER: 2, BLACK: 1 } },
      { text: "I analyze the potential risks and benefits before acting.", scores: { PURPLE: 2, BLUE: 1 } },
      { text: "I react with passion and intensity.", scores: { RED: 2, GOLD: 1 } },
      { text: "I seek to restore balance and harmony.", scores: { AQUAMARINE: 2, WHITE: 1 } },
    ],
  },
  {
    id: 9,
    text: "What kind of power appeals most to you?",
    options: [
      { text: "The power to inspire and lead others.", scores: { GOLD: 2, RED: 1 } },
      { text: "The power to understand and manipulate the unseen.", scores: { BLACK: 2, PURPLE: 1 } },
      { text: "The power to heal and bring comfort.", scores: { AQUAMARINE: 2, WHITE: 1 } },
      { text: "The power to build and endure.", scores: { COMMON: 2, BLUE: 1 } },
      { text: "The power to move swiftly and strike precisely.", scores: { SILVER: 2, YELLOW: 1 } },
      { text: "The power to innovate and create new solutions.", scores: { TURQUOISE: 2, PURPLE: 1 } },
    ],
  },
  {
    id: 10,
    text: "What is your ideal role in a team?",
    options: [
      { text: "The dependable foundation, keeping everyone grounded.", scores: { COMMON: 2, BLUE: 1 } },
      { text: "The adaptable problem-solver, finding new ways forward.", scores: { YELLOW: 2, TURQUOISE: 1 } },
      { text: "The bold leader, driving action and taking charge.", scores: { RED: 2, GOLD: 1 } },
      { text: "The quiet strategist, providing crucial insights.", scores: { PURPLE: 2, BLACK: 1 } },
      { text: "The supportive healer, ensuring everyone's well-being.", scores: { AQUAMARINE: 2, WHITE: 1 } },
      { text: "The agile specialist, executing complex maneuvers.", scores: { SILVER: 2, YELLOW: 1 } },
    ],
  },
]

// Goliath Augmentations data (copied from stonebound-souls/page.tsx for image lookup)
const goliathAugmentations = [
  {
    name: "Yellow",
    color: "#eab308",
    power: "Gas transformation",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Yellow_Common-Q56IUpvxRxMNDTmqcuBlMr8rkZgThg.webp",
    tiers: [], // Not used here, but kept for data structure consistency
  },
  {
    name: "Turquoise",
    color: "#14b8a6",
    power: "Electrical manipulation",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Turquoise_Common-5hH9B8unfJn9kbmndunLrB5SSHFkCS.webp",
    tiers: [],
  },
  {
    name: "Red",
    color: "#dc2626",
    power: "Fire manipulation",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Red_Common-xVsIzd0vmDw4zd04nZTRhenbd2wh1h.webp",
    tiers: [],
  },
  {
    name: "Blue",
    color: "#2563eb",
    power: "Cold manipulation",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Blue_Common-M7xyDPiR6lZ9VfKtgkn5MjhvYMAi6s.webp",
    tiers: [],
  },
  {
    name: "Purple",
    color: "#9333ea",
    power: "Mind control",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Purple_Common-ynt2C3qgzjkoLM1VNe9yigcGmLR4lx.webp",
    tiers: [],
  },
  {
    name: "Silver",
    color: "#6b7280",
    power: "Blade transformation",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Silver_Common-bm5c4Yr4sk3UqrN0uIscX311VOu2RE.webp",
    tiers: [],
  },
  {
    name: "Gold",
    color: "#f59e0b",
    power: "Wealth-based empowerment",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Gold_Common-jzL5NfIxxCLhtmbXHO6aFb50IuBCZ5.webp",
    tiers: [],
  },
  {
    name: "Aquamarine",
    color: "#06b6d4",
    power: "Time manipulation",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Aquamarine_Common-2RbzijlY57T6EXqzm5eeaEVbNbOjom.webp",
    tiers: [],
  },
  {
    name: "Black",
    color: "#0a0a0a",
    power: "Dark matter manipulation",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Black_Common-DL1UUOpMflUfgoWV7BvfHxKqGphmUo.webp",
    tiers: [],
  },
  {
    name: "White",
    color: "#ffffff",
    power: "Plasma inferno",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/White_Common-UHUY1hevZtZXeL3udqGBOWb4G1eMMp.webp",
    tiers: [],
  },
  // Common (Earth) does not have a specific augmentation image in the provided data,
  // so we'll use a general background for common.
  {
    name: "Common",
    color: "#8B4513",
    power: "Earth manipulation",
    image: "/images/stonebound-souls-overview-bg.jpg",
    tiers: [],
  },
]

export default function PersonalityTestPage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<number[]>([]) // Stores index of selected option for each question
  const [showResults, setShowResults] = useState(false)
  const [resultColor, setResultColor] = useState<(typeof rockColors)[0] | null>(null)
  const [goliathDensity, setGoliathDensity] = useState<string | null>(null)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)

  // Ref for the content area to capture for the image (excluding buttons)
  const contentToCaptureRef = useRef<HTMLDivElement>(null)

  // Calculate augmentation image based on resultColor
  const resultColorAugmentationImage = resultColor
    ? goliathAugmentations.find((aug) => aug.name.toUpperCase() === resultColor.name.toUpperCase())?.image
    : null

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestionIndex] = optionIndex
    setAnswers(newAnswers)
  }

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      calculateResults()
    }
  }

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const calculateResults = () => {
    const scoreMap: { [colorName: string]: number } = {}
    rockColors.forEach((color) => (scoreMap[color.name] = 0))

    answers.forEach((optionIndex, qIndex) => {
      const question = questions[qIndex]
      const selectedOption = question.options[optionIndex]
      for (const colorName in selectedOption.scores) {
        scoreMap[colorName] = (scoreMap[colorName] || 0) + selectedOption.scores[colorName]
      }
    })

    let highestScore = -1
    let determinedColor: (typeof rockColors)[0] | null = null

    // Find the color with the highest score
    for (const color of rockColors) {
      const score = scoreMap[color.name] || 0
      if (score > highestScore) {
        highestScore = score
        determinedColor = color
      } else if (score === highestScore && determinedColor) {
        // Tie-breaking: if scores are equal, prefer rarer colors
        const currentRarityIndex = ["Common", "Uncommon", "Rare", "Epic", "Legendary", "Mythic"].indexOf(
          determinedColor.rarity,
        )
        const newRarityIndex = ["Common", "Uncommon", "Rare", "Epic", "Legendary", "Mythic"].indexOf(color.rarity)

        if (newRarityIndex > currentRarityIndex) {
          determinedColor = color
        }
      }
    }

    setResultColor(determinedColor)

    // Determine Goliath Density
    if (determinedColor) {
      let density: string
      switch (determinedColor.rarity) {
        case "Common":
          density = "UNINFECTED" // Common rocks don't imply Goliath density
          break
        case "Uncommon":
          density = "LOW DENSITY"
          break
        case "Rare":
          density = "MEDIUM DENSITY"
          break
        case "Epic":
        case "Legendary":
        case "Mythic":
          density = "HIGH DENSITY"
          break
        default:
          density = "UNKNOWN"
      }
      setGoliathDensity(density)
    }

    setShowResults(true)
  }

  const retakeTest = () => {
    setCurrentQuestionIndex(0)
    setAnswers([])
    setShowResults(false)
    setResultColor(null)
    setGoliathDensity(null)
  }

  const handleGenerateImage = async () => {
    if (!contentToCaptureRef.current || !resultColor) return

    setIsGeneratingImage(true)

    // Find the corresponding augmentation image for the background
    const augmentationImage = goliathAugmentations.find(
      (aug) => aug.name.toUpperCase() === resultColor.name.toUpperCase(),
    )?.image

    // Store original styles and classes before making changes (accessible in finally block)
    const content = contentToCaptureRef.current
    const originalContentClasses = content?.className || ""
    const originalContentStyle = content?.style.cssText || ""
    let overlayDiv: HTMLElement | null = null

    // Preload the image if it exists
    let imgLoaded = Promise.resolve()
    if (augmentationImage) {
      imgLoaded = new Promise((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = "anonymous" // Important for html2canvas
        img.onload = () => resolve()
        img.onerror = reject
        img.src = augmentationImage
      })
    }

    try {
      await imgLoaded // Wait for the image to load

      // Temporarily hide sidebar and header for capture if they overlap
      const sidebar = document.querySelector("[data-sidebar]") as HTMLElement | null
      const header = document.querySelector("header") as HTMLElement | null
      const originalSidebarDisplay = sidebar?.style.display || ""
      const originalHeaderDisplay = header?.style.display || ""
      
      if (sidebar) sidebar.style.display = "none"
      if (header) header.style.display = "none"

      // Apply temporary styles for capture to contentToCaptureRef
      if (augmentationImage && content) {
        content.style.backgroundImage = `url('${augmentationImage}')`
        content.style.backgroundSize = "cover"
        content.style.backgroundPosition = "center"
        content.style.backgroundColor = "transparent"
        content.style.border = "none"
        content.style.position = "relative"
        content.style.overflow = "hidden"
        content.style.padding = "3rem"
        content.style.minHeight = "600px"
      }

      // Create and append a temporary overlay for readability
      overlayDiv = document.createElement("div")
      overlayDiv.className = "absolute inset-0 bg-black/60 backdrop-blur-sm rounded-2xl"
      overlayDiv.style.zIndex = "1"
      content?.prepend(overlayDiv)

      // Ensure the actual content has z-index
      const contentElements = Array.from(content?.children || []) as HTMLElement[]
      contentElements.forEach((el) => {
        if (el !== overlayDiv) {
          el.style.position = "relative"
          el.style.zIndex = "10"
        }
      })

      // Wait a brief moment for styles to apply
      await new Promise((resolve) => setTimeout(resolve, 100))

      const canvas = await html2canvas(content, {
        backgroundColor: null,
        useCORS: true,
        scale: 2,
        logging: false,
        allowTaint: false,
      })
      const image = canvas.toDataURL("image/webp", 0.9)

      const link = document.createElement("a")
      link.href = image
      link.download = "old-rock-personality-result.webp"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Restore sidebar and header visibility immediately after capture
      if (sidebar) sidebar.style.display = originalSidebarDisplay
      if (header) header.style.display = originalHeaderDisplay
    } catch (error) {
      console.error("Error generating image:", error)
      alert("Failed to generate image. Please try again.")
    } finally {
      setIsGeneratingImage(false)
      
      // Restore original styles and remove temporary elements
      if (content) {
        if (originalContentStyle) {
          content.style.cssText = originalContentStyle
        } else {
          // If no original style, clear all inline styles
          content.removeAttribute("style")
        }
        content.className = originalContentClasses
      }

      // Remove overlay if it exists
      if (overlayDiv && overlayDiv.parentNode) {
        overlayDiv.remove()
      }

      // Reset content element styles
      const contentElements = Array.from(contentToCaptureRef.current?.children || []) as HTMLElement[]
      contentElements.forEach((el) => {
        if (el.style) {
          el.style.position = ""
          el.style.zIndex = ""
        }
      })

      // Ensure sidebar and header are visible
      const sidebar = document.querySelector("[data-sidebar]") as HTMLElement | null
      const header = document.querySelector("header") as HTMLElement | null
      if (sidebar && sidebar.style.display === "none") {
        sidebar.style.display = ""
      }
      if (header && header.style.display === "none") {
        header.style.display = ""
      }
    }
  }

  const handleShareOnX = () => {
    if (!resultColor) return

    // Build the tweet text with powers and @oldrocknft tag, no link or hashtags
    const powersText = resultColor.powers || "Unique abilities aligned with my archetype."
    const tweetText = encodeURIComponent(
      `I just took the Old Rock Personality Test and discovered I'm a ${resultColor.name} Goliath! My powers: ${powersText} @oldrocknft`,
    )
    window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, "_blank")
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  return (
    <div className="flex">
      <Sidebar />
      <div className="min-h-screen text-white overflow-hidden relative w-full lg:ml-[79px]">
        <CyberpunkBackground />
        <Header />

        <main className="relative z-20 pt-32 pb-20">
          <div className="max-w-4xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl md:text-5xl font-black font-montserrat mb-4">PERSONALITY TEST</h1>
              <p className="text-gray-400 font-pt-mono text-lg">
                Discover your true Old Rock archetype and Goliath density.
              </p>
            </motion.div>

            {!showResults ? (
              <motion.div
                key="test-questions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-gray-900/50 border border-gray-700 rounded-2xl p-4"
              >
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold font-montserrat text-white">
                      Question {currentQuestionIndex + 1} of {questions.length}
                    </h2>
                    <div className="text-sm font-pt-mono text-gray-400">{Math.round(progress)}% Complete</div>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <motion.div
                      className="bg-purple-500 h-2.5 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>

                <h3 className="text-xl font-montserrat font-bold text-white mb-4">{currentQuestion.text}</h3>

                <div className="space-y-2">
                  {currentQuestion.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswer(index)}
                      className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                        answers[currentQuestionIndex] === index
                          ? "bg-purple-600/30 border-purple-500 text-white"
                          : "bg-gray-800/50 border-gray-700 hover:bg-gray-700/50 text-gray-300"
                      }`}
                    >
                      <span className="font-pt-mono text-base">{option.text}</span>
                    </button>
                  ))}
                </div>

                <div className="flex justify-between mt-8">
                  <Button
                    onClick={goToPreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    className="bg-gray-700 hover:bg-gray-600 text-white font-pt-mono"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Previous
                  </Button>
                  <Button
                    onClick={goToNextQuestion}
                    disabled={answers[currentQuestionIndex] === undefined}
                    className="bg-purple-500 hover:bg-purple-600 text-white font-pt-mono"
                  >
                    {currentQuestionIndex === questions.length - 1 ? "Submit" : "Next"}
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="test-results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900/50 border border-gray-700 rounded-2xl p-4 text-center"
              >
                {/* This div will be captured by html2canvas */}
                <div
                  ref={contentToCaptureRef}
                  className="p-6 md:p-8 rounded-2xl relative overflow-hidden"
                >
                  <h2 className="text-3xl md:text-4xl font-black font-montserrat text-white mb-6 md:mb-8">
                    YOUR ARCHETYPE REVEALED!
                  </h2>
                  {resultColor ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 items-center">
                      <div className="flex flex-col items-center">
                        <div
                          className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold mb-3 border-4 border-white/20 shadow-lg"
                          style={{
                            backgroundColor: resultColor.color,
                            boxShadow: `0 0 20px ${resultColor.color}80`,
                            backgroundImage: resultColorAugmentationImage
                              ? `url('${resultColorAugmentationImage}')`
                              : "none",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }}
                        >
                          <Sparkles className="w-12 h-12 text-white" />
                        </div>
                        <h3 className="text-3xl font-black font-montserrat text-white mb-1">{resultColor.name}</h3>
                        <p className="text-lg font-pt-mono text-purple-400 mb-3">{resultColor.element}</p>
                        <span
                          className={`text-white text-xs font-bold px-2 py-0.5 rounded-full font-pt-mono`}
                          style={{ backgroundColor: resultColor.color }}
                        >
                          {resultColor.rarity.toUpperCase()}
                        </span>
                      </div>
                      <div className="space-y-3">
                        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-3 text-left">
                          <h4 className="text-lg font-bold font-montserrat text-white mb-1">Your Core Traits:</h4>
                          <p className="text-gray-300 font-pt-mono text-sm leading-relaxed">
                            <span className="text-green-400 font-bold">Positive: </span>
                            {resultColor.positive}
                          </p>
                          <p className="text-gray-300 font-pt-mono text-sm leading-relaxed mt-1">
                            <span className="text-red-400 font-bold">Negative: </span>
                            {resultColor.negative}
                          </p>
                        </div>
                        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-3 text-left">
                          <h4 className="text-lg font-bold font-montserrat text-white mb-1">Potential Powers:</h4>
                          <p className="text-cyan-400 font-pt-mono text-sm leading-relaxed">{resultColor.powers}</p>
                        </div>
                        {goliathDensity && goliathDensity !== "UNINFECTED" && (
                          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-3 text-left">
                            <h4 className="text-lg font-bold font-montserrat text-white mb-1">Your Goliath Density:</h4>
                            <p className="text-yellow-400 font-pt-mono text-sm leading-relaxed">
                              You align with a <span className="font-bold">{goliathDensity}</span> Goliath. This
                              indicates a significant level of transformation and unique abilities within the Goliath
                              ecosystem.
                            </p>
                          </div>
                        )}
                        {goliathDensity && goliathDensity === "UNINFECTED" && (
                          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-3 text-left">
                            <h4 className="text-lg font-bold font-montserrat text-white mb-1">Your Goliath Density:</h4>
                            <p className="text-green-400 font-pt-mono text-sm leading-relaxed">
                              You align with an <span className="font-bold">{goliathDensity}</span> human. You maintain
                              your original form and consciousness, untouched by the Goliath disease.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-400 font-pt-mono text-lg">
                      Unable to determine your archetype. Please try again.
                    </div>
                  )}
                </div>{" "}
                {/* End of content to be captured */}
                <div className="flex flex-col sm:flex-row justify-center gap-3 mt-4">
                  <Button
                    onClick={handleGenerateImage}
                    disabled={isGeneratingImage}
                    className="bg-black hover:bg-gray-800 text-white font-pt-mono border border-white"
                  >
                    {isGeneratingImage ? (
                      "Generating..."
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" /> Download Image
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleShareOnX}
                    disabled={!resultColor}
                    className="bg-gray-700 hover:bg-gray-600 text-white font-pt-mono border border-gray-500"
                  >
                    <Share2 className="w-4 h-4 mr-2" /> Share on X
                  </Button>
                  <Button
                    onClick={retakeTest}
                    className="bg-white hover:bg-gray-200 text-black font-pt-mono border border-black"
                  >
                    Retake Test
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
