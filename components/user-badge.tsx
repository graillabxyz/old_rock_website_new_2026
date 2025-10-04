"use client"

import { motion } from "framer-motion"

interface Badge {
  id: number
  name: string
  description: string
  icon: string
}

interface UserBadgeProps {
  badge: Badge
  isSelected: boolean
  isUnlocked: boolean
  onClick: () => void
  size?: "small" | "medium" | "large"
}

export function UserBadge({ badge, isSelected, isUnlocked, onClick, size = "medium" }: UserBadgeProps) {
  const sizeClasses = {
    small: {
      container: "w-16 h-16",
      text: "text-lg",
      nameText: "text-xs",
      descText: "text-xs",
      maxWidth: "max-w-[80px]",
      glow: "60%",
      glowOpacity: "0.25",
    },
    medium: {
      container: "w-20 h-20",
      text: "text-2xl",
      nameText: "text-xs",
      descText: "text-xs",
      maxWidth: "max-w-[100px]",
      glow: "70%",
      glowOpacity: "0.3",
    },
    large: {
      container: "w-24 h-24",
      text: "text-3xl",
      nameText: "text-sm",
      descText: "text-xs",
      maxWidth: "max-w-[120px]",
      glow: "80%",
      glowOpacity: "0.4",
    },
  }

  const currentSize = sizeClasses[size]

  return (
    <motion.div
      className={`relative cursor-pointer ${isUnlocked ? "" : "opacity-50 cursor-not-allowed"}`}
      onClick={() => isUnlocked && onClick()}
      whileHover={isUnlocked ? { scale: 1.05 } : {}}
    >
      {isSelected && (
        <div
          className="absolute inset-0 rounded-full animate-pulse"
          style={{
            background: `radial-gradient(circle, rgba(255,215,0,${currentSize.glowOpacity}) 0%, rgba(255,215,0,0) ${currentSize.glow})`,
            zIndex: 0,
          }}
        ></div>
      )}
      <div
        className={`relative z-10 ${currentSize.container} rounded-full flex items-center justify-center ${currentSize.text} ${
          isSelected
            ? `bg-gradient-to-br from-yellow-400 to-amber-600 border-2 border-yellow-300 ${
                size === "large"
                  ? "shadow-lg shadow-yellow-400/50"
                  : size === "medium"
                    ? "shadow-md shadow-yellow-400/30"
                    : "shadow-sm shadow-yellow-400/20"
              }`
            : isUnlocked
              ? "bg-gray-700/80 border border-gray-600"
              : "bg-gray-800/80 border border-gray-700"
        }`}
      >
        <span className="text-white">{badge.icon}</span>
      </div>
      <div className={`mt-2 text-center ${currentSize.maxWidth}`}>
        <div className={`${currentSize.nameText} font-bold ${isSelected ? "text-yellow-300" : "text-white"}`}>
          {badge.name}
        </div>
        <div className={`${currentSize.descText} text-gray-400 mt-1 leading-tight`}>{badge.description}</div>
      </div>
    </motion.div>
  )
}
