"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Pause, Volume2, VolumeX, Music, ChevronDown } from "lucide-react"

interface AudioPlayerProps {
  tracks?: {
    title: string
    src: string
  }[]
  inSidebar?: boolean
  sidebarExpanded?: boolean
}

export function AudioPlayer({ tracks = [], inSidebar = false, sidebarExpanded = false }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.5)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [isExpanded, setIsExpanded] = useState(false)
  const [progress, setProgress] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)
  const previousVolume = useRef(volume)

  // Default tracks if none provided
  const defaultTracks = [
    {
      title: "I Remember Shadows",
      src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/I%20Remember%20Shadows-cF7MxC9ixplUa3YGUiKiOWJfCUDQKC.mp3",
    },
    {
      title: "Cyberpunk Ambient",
      src: "https://cdn.pixabay.com/download/audio/2022/11/22/audio_febc508520.mp3?filename=cyberpunk-2099-172285.mp3",
    },
    {
      title: "Neon Nights",
      src: "https://cdn.pixabay.com/download/audio/2022/10/25/audio_946b0939c9.mp3?filename=futuristic-beat-146661.mp3",
    },
  ]

  const actualTracks = tracks.length > 0 ? tracks : defaultTracks
  const currentTrack = actualTracks[currentTrackIndex]

  // Handle play/pause
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play().catch((error) => {
          console.error("Error playing audio:", error)
        })
      }
      setIsPlaying(!isPlaying)
    }
  }

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number.parseFloat(e.target.value)
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
    if (newVolume > 0 && isMuted) {
      setIsMuted(false)
    }
  }

  // Handle mute toggle
  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = previousVolume.current
        setVolume(previousVolume.current)
      } else {
        previousVolume.current = volume
        audioRef.current.volume = 0
        setVolume(0)
      }
      setIsMuted(!isMuted)
    }
  }

  // Handle track change
  const changeTrack = (direction: "next" | "prev") => {
    let newIndex = currentTrackIndex
    if (direction === "next") {
      newIndex = (currentTrackIndex + 1) % actualTracks.length
    } else {
      newIndex = (currentTrackIndex - 1 + actualTracks.length) % actualTracks.length
    }
    setCurrentTrackIndex(newIndex)
    setProgress(0)

    // If already playing, play the new track
    if (isPlaying && audioRef.current) {
      // We need to set a small timeout to allow the src to update
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().catch((error) => {
            console.error("Error playing next track:", error)
          })
        }
      }, 100)
    }
  }

  // Update progress
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100)
      }
    }

    audio.addEventListener("timeupdate", updateProgress)
    return () => {
      audio.removeEventListener("timeupdate", updateProgress)
    }
  }, [currentTrackIndex])

  // Handle track ended
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleEnded = () => {
      changeTrack("next")
    }

    audio.addEventListener("ended", handleEnded)
    return () => {
      audio.removeEventListener("ended", handleEnded)
    }
  }, [currentTrackIndex])

  // Set initial volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [])

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
          <audio
            ref={audioRef}
            src={currentTrack.src}
            preload="metadata"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />

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
            <div className="border-t border-white/10 py-3 px-2">
              {/* Track Info */}
              <div className="mb-2 px-2">
                <p className="text-white font-pt-mono text-xs truncate">{currentTrack.title}</p>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1 bg-gray-700 rounded-full mb-2 overflow-hidden mx-2">
                <div className="h-full bg-white rounded-full" style={{ width: `${progress}%` }}></div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between px-2">
                {/* Play/Pause */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => changeTrack("prev")}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 20L9 12L19 4V20Z" fill="currentColor" />
                      <rect x="7" y="4" width="2" height="16" fill="currentColor" />
                    </svg>
                  </button>

                  <button
                    onClick={togglePlay}
                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4 text-white" />
                    ) : (
                      <Play className="w-4 h-4 text-white ml-0.5" />
                    )}
                  </button>

                  <button
                    onClick={() => changeTrack("next")}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 4L15 12L5 20V4Z" fill="currentColor" />
                      <rect x="17" y="4" width="2" height="16" fill="currentColor" />
                    </svg>
                  </button>
                </div>

                {/* Volume */}
                <div className="flex items-center space-x-1">
                  <button onClick={toggleMute} className="text-gray-400 hover:text-white transition-colors">
                    {isMuted || volume === 0 ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-12 h-1 bg-gray-700 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Floating version
        <div className="fixed bottom-6 right-6 z-50">
          <audio
            ref={audioRef}
            src={currentTrack.src}
            preload="metadata"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />

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
                  <p className="text-white font-pt-mono text-xs truncate">{currentTrack.title}</p>
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
