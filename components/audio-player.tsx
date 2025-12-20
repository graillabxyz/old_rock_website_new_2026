"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Pause, Volume2, VolumeX, Music, ChevronDown } from "lucide-react"
import { useAudio } from "@/contexts/audio-context"

interface AudioPlayerProps {
  tracks?: {
    title: string
    src: string
  }[]
  inSidebar?: boolean
  sidebarExpanded?: boolean
}

export function AudioPlayer({ tracks = [], inSidebar = false, sidebarExpanded = false }: AudioPlayerProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const {
    isPlaying,
    volume,
    isMuted,
    currentTrackIndex,
    progress,
    tracks: contextTracks,
    togglePlay,
    setVolume,
    toggleMute,
    changeTrack,
    audioRef,
  } = useAudio()

  const actualTracks = tracks.length > 0 ? tracks : contextTracks
  const currentTrack = actualTracks[currentTrackIndex]

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number.parseFloat(e.target.value)
    setVolume(newVolume)
  }

  // Auto-expand when sidebar opens
  useEffect(() => {
    if (inSidebar && sidebarExpanded) {
      setIsExpanded(true)
    } else if (inSidebar && !sidebarExpanded) {
      setIsExpanded(false)
    }
  }, [sidebarExpanded, inSidebar])

  return (
    <>
      {inSidebar ? (
        // Sidebar version
        <div className="w-full">

          {/* Minimized Player */}
          {!isExpanded && (
            <div className="border-t border-white/10 py-3">
              <button
                className="w-full h-10 flex items-center justify-center hover:bg-white/5 transition-colors rounded-lg"
                onClick={() => setIsExpanded(true)}
              >
                <Music className="w-4 h-4 text-white" />
              </button>
            </div>
          )}

          {/* Expanded Player */}
          {isExpanded && (
            <div className="border-t border-white/10 py-3 px-2 w-full">
              {/* Track Info */}
              <div className="mb-2 px-2">
                <p className="text-white font-pt-mono text-xs truncate">{currentTrack?.title || "No track"}</p>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1 bg-gray-700 rounded-full mb-2 overflow-hidden mx-2">
                <div className="h-full bg-white rounded-full" style={{ width: `${progress}%` }}></div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between px-2 w-full">
                {/* Play/Pause */}
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <button
                    onClick={() => changeTrack("prev")}
                    className="text-white hover:text-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={false}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 20L9 12L19 4V20Z" fill="currentColor" />
                      <rect x="7" y="4" width="2" height="16" fill="currentColor" />
                    </svg>
                  </button>

                  <button
                    onClick={togglePlay}
                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={false}
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4 text-white" />
                    ) : (
                      <Play className="w-4 h-4 text-white ml-0.5" />
                    )}
                  </button>

                  <button
                    onClick={() => changeTrack("next")}
                    className="text-white hover:text-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={false}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 4L15 12L5 20V4Z" fill="currentColor" />
                      <rect x="17" y="4" width="2" height="16" fill="currentColor" />
                    </svg>
                  </button>
                </div>

                {/* Volume */}
                <div className="flex items-center space-x-1 flex-shrink-0">
                  <button 
                    onClick={toggleMute} 
                    className="text-white hover:text-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={false}
                  >
                    {isMuted || volume === 0 ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-12 h-1 bg-gray-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={false}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Floating version
        <div className="fixed bottom-6 right-6 z-50">

          {/* Minimized Player */}
          {!isExpanded && (
            <motion.button
              className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center shadow-lg hover:bg-white/20 transition-colors"
              onClick={() => setIsExpanded(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Music className="w-5 h-5 text-white" />
            </motion.button>
          )}

          {/* Expanded Player */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                className="bg-gray-900/60 backdrop-blur-md rounded-2xl p-4 shadow-2xl w-72"
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div></div>
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Track Info */}
                <div className="mb-3">
                  <p className="text-white font-pt-mono text-xs truncate">{currentTrack?.title || "No track"}</p>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1 bg-gray-700 rounded-full mb-3 overflow-hidden">
                  <div className="h-full bg-white rounded-full" style={{ width: `${progress}%` }}></div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between">
                  {/* Play/Pause */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => changeTrack("prev")}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 20L9 12L19 4V20Z" fill="currentColor" />
                        <rect x="7" y="4" width="2" height="16" fill="currentColor" />
                      </svg>
                    </button>

                    <button
                      onClick={togglePlay}
                      className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5 text-white" />
                      ) : (
                        <Play className="w-5 h-5 text-white ml-0.5" />
                      )}
                    </button>

                    <button
                      onClick={() => changeTrack("next")}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 4L15 12L5 20V4Z" fill="currentColor" />
                        <rect x="17" y="4" width="2" height="16" fill="currentColor" />
                      </svg>
                    </button>
                  </div>

                  {/* Volume */}
                  <div className="flex items-center space-x-2">
                    <button onClick={toggleMute} className="text-gray-400 hover:text-white transition-colors">
                      {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-16 h-1 bg-gray-700 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </>
  )
}
