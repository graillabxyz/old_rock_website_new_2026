"use client"

import React, { createContext, useContext, useState, useRef, useEffect, useCallback, ReactNode } from "react"

interface Track {
  title: string
  src: string
}

interface AudioContextType {
  isPlaying: boolean
  volume: number
  isMuted: boolean
  currentTrackIndex: number
  progress: number
  tracks: Track[]
  togglePlay: () => void
  setVolume: (volume: number) => void
  toggleMute: () => void
  changeTrack: (direction: "next" | "prev") => void
  audioRef: React.RefObject<HTMLAudioElement>
}

const AudioContext = createContext<AudioContextType | undefined>(undefined)

// Default tracks
const defaultTracks: Track[] = [
  {
    title: "I Remember Shadows",
    src: "/I Remember Shadows.mp3",
  },
  {
    title: "Heliosite Dream Engine",
    src: "/Heliosite Dream Engine.mp3",
  },
  {
    title: "End-Cycle Drift",
    src: "/End-Cycle Drift.mp3",
  },
  {
    title: "Reapers Shadow",
    src: "/Reapers Shadow.mp3",
  },
  {
    title: "Key Aquamarine",
    src: "/Key Aquamarine.mp3",
  },
  {
    title: "The Siren Song",
    src: "/The Siren Song.mp3",
  },
  {
    title: "Unknown Goes Home",
    src: "/Unknown Goes Home.mp3",
  },
  {
    title: "Kalkis Downfall",
    src: "/Kalkis Downfall.mp3",
  },
]

export function AudioProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolumeState] = useState(0.5)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)
  const previousVolume = useRef(0.5)
  const isMutedRef = useRef(false)

  // Keep isMutedRef in sync with isMuted state
  useEffect(() => {
    isMutedRef.current = isMuted
  }, [isMuted])

  // Initialize volume from localStorage or use default
  useEffect(() => {
    const savedVolume = localStorage.getItem("audioVolume")
    if (savedVolume) {
      const vol = parseFloat(savedVolume)
      setVolumeState(vol)
      previousVolume.current = vol
    }
  }, [])

  // Save volume to localStorage
  const setVolume = (newVolume: number) => {
    setVolumeState(newVolume)
    localStorage.setItem("audioVolume", newVolume.toString())
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
    if (newVolume > 0 && isMutedRef.current) {
      setIsMuted(false)
    }
  }

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

  // Handle mute toggle
  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = previousVolume.current
        setVolumeState(previousVolume.current)
      } else {
        previousVolume.current = volume
        audioRef.current.volume = 0
        setVolumeState(0)
      }
      setIsMuted(!isMuted)
    }
  }

  // Handle track change
  const changeTrack = useCallback(
    (direction: "next" | "prev") => {
      setCurrentTrackIndex((prevIndex) => {
        let newIndex = prevIndex
        if (direction === "next") {
          newIndex = (prevIndex + 1) % defaultTracks.length
        } else {
          newIndex = (prevIndex - 1 + defaultTracks.length) % defaultTracks.length
        }
        setProgress(0)

        // If already playing, play the new track
        if (isPlaying && audioRef.current) {
          setTimeout(() => {
            if (audioRef.current) {
              audioRef.current.play().catch((error) => {
                console.error("Error playing next track:", error)
              })
            }
          }, 100)
        }
        return newIndex
      })
    },
    [isPlaying]
  )

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

  // Handle track ended - automatically play next track
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleEnded = () => {
      // Always advance to next track and continue playing
      setCurrentTrackIndex((prevIndex) => {
        const newIndex = (prevIndex + 1) % defaultTracks.length
        setProgress(0)
        return newIndex
      })
      
      // Play the next track after a brief delay to ensure the new source is loaded
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().catch((error) => {
            console.error("Error playing next track:", error)
          })
        }
      }, 100)
    }

    audio.addEventListener("ended", handleEnded)
    return () => {
      audio.removeEventListener("ended", handleEnded)
    }
  }, [])

  // Set initial volume and handle audio events
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.volume = volume

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    audio.addEventListener("play", handlePlay)
    audio.addEventListener("pause", handlePause)

    return () => {
      audio.removeEventListener("play", handlePlay)
      audio.removeEventListener("pause", handlePause)
    }
  }, [volume])

  // Update audio source when track changes
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const wasPlaying = isPlaying
    audio.src = defaultTracks[currentTrackIndex].src
    audio.load()

    if (wasPlaying) {
      audio.play().catch((error) => {
        console.error("Error playing track:", error)
      })
    }
  }, [currentTrackIndex, isPlaying])

  return (
    <AudioContext.Provider
      value={{
        isPlaying,
        volume,
        isMuted,
        currentTrackIndex,
        progress,
        tracks: defaultTracks,
        togglePlay,
        setVolume,
        toggleMute,
        changeTrack,
        audioRef,
      }}
    >
      {/* Hidden audio element that persists across navigations */}
      <audio ref={audioRef} preload="metadata" style={{ display: "none" }} />
      {children}
    </AudioContext.Provider>
  )
}

export function useAudio() {
  const context = useContext(AudioContext)
  if (context === undefined) {
    throw new Error("useAudio must be used within an AudioProvider")
  }
  return context
}

