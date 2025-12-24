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
  seek: (percentage: number) => void
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

  // Handle seeking to a specific position
  const seek = useCallback((percentage: number) => {
    const audio = audioRef.current
    if (!audio || !audio.duration) return

    // Clamp percentage between 0 and 100
    const clampedPercentage = Math.max(0, Math.min(100, percentage))
    
    // Calculate the new time position
    const newTime = (clampedPercentage / 100) * audio.duration
    
    // Set the audio's currentTime
    audio.currentTime = newTime
    
    // Update progress state immediately for responsive UI
    setProgress(clampedPercentage)
  }, [])

  // Handle track change
  const changeTrack = useCallback(
    (direction: "next" | "prev") => {
      const audio = audioRef.current
      if (!audio) return

      const wasPlaying = isPlaying
      
      setCurrentTrackIndex((prevIndex) => {
        let newIndex = prevIndex
        if (direction === "next") {
          newIndex = (prevIndex + 1) % defaultTracks.length
        } else {
          newIndex = (prevIndex - 1 + defaultTracks.length) % defaultTracks.length
        }
        setProgress(0)
        return newIndex
      })

      // If was playing, wait for the new track to load and then play
      if (wasPlaying) {
        const handleCanPlay = () => {
          audio.removeEventListener("canplay", handleCanPlay)
          audio.play().catch((error) => {
            console.error("Error playing next track:", error)
            setIsPlaying(false)
          })
        }
        audio.addEventListener("canplay", handleCanPlay)
        
        // Fallback: if canplay doesn't fire within 2 seconds, try playing anyway
        const timeout = setTimeout(() => {
          audio.removeEventListener("canplay", handleCanPlay)
          audio.play().catch((error) => {
            console.error("Error playing next track (timeout):", error)
            setIsPlaying(false)
          })
        }, 2000)
        
        // Clear timeout if canplay fires
        audio.addEventListener("canplay", () => clearTimeout(timeout), { once: true })
      }
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
      // Advance to next track and ensure it plays
      setCurrentTrackIndex((prevIndex) => {
        const newIndex = (prevIndex + 1) % defaultTracks.length
        setProgress(0)
        return newIndex
      })
      
      // Wait for the new track to load, then play
      const handleCanPlay = () => {
        audio.removeEventListener("canplay", handleCanPlay)
        audio.play().catch((error) => {
          console.error("Error playing next track after ended:", error)
          setIsPlaying(false)
        })
      }
      audio.addEventListener("canplay", handleCanPlay)
      
      // Fallback: if canplay doesn't fire within 2 seconds, try playing anyway
      const timeout = setTimeout(() => {
        audio.removeEventListener("canplay", handleCanPlay)
        audio.play().catch((error) => {
          console.error("Error playing next track after ended (timeout):", error)
          setIsPlaying(false)
        })
      }, 2000)
      
      // Clear timeout if canplay fires
      audio.addEventListener("canplay", () => clearTimeout(timeout), { once: true })
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
    
    const handleError = (e: Event) => {
      console.error("Audio playback error:", e)
      setIsPlaying(false)
      // Try to recover by loading the track again
      if (audio.src) {
        audio.load()
      }
    }
    
    const handleStalled = () => {
      console.warn("Audio playback stalled, attempting to recover...")
      // Try to resume playback if it was playing
      if (isPlaying) {
        audio.play().catch((error) => {
          console.error("Error resuming after stall:", error)
          setIsPlaying(false)
        })
      }
    }

    audio.addEventListener("play", handlePlay)
    audio.addEventListener("pause", handlePause)
    audio.addEventListener("error", handleError)
    audio.addEventListener("stalled", handleStalled)

    return () => {
      audio.removeEventListener("play", handlePlay)
      audio.removeEventListener("pause", handlePause)
      audio.removeEventListener("error", handleError)
      audio.removeEventListener("stalled", handleStalled)
    }
  }, [volume, isPlaying])

  // Update audio source when track changes
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const wasPlaying = isPlaying
    const newSrc = defaultTracks[currentTrackIndex].src
    
    // Update the source and load the new track
    audio.src = newSrc
    audio.load()

    // If was playing, wait for the track to be ready before playing
    if (wasPlaying) {
      const handleCanPlay = () => {
        audio.removeEventListener("canplay", handleCanPlay)
        audio.removeEventListener("error", handleError)
        audio.play().catch((error) => {
          console.error("Error playing track:", error)
          setIsPlaying(false)
        })
      }
      
      const handleError = () => {
        audio.removeEventListener("canplay", handleCanPlay)
        audio.removeEventListener("error", handleError)
        console.error("Error loading track:", defaultTracks[currentTrackIndex].title)
        setIsPlaying(false)
      }
      
      // If already loaded, play immediately
      if (audio.readyState >= 2) { // HAVE_CURRENT_DATA
        audio.play().catch((error) => {
          console.error("Error playing track (already loaded):", error)
          setIsPlaying(false)
        })
      } else {
        audio.addEventListener("canplay", handleCanPlay, { once: true })
        audio.addEventListener("error", handleError, { once: true })
        
        // Fallback: if canplay doesn't fire within 3 seconds, try playing anyway
        const timeout = setTimeout(() => {
          audio.removeEventListener("canplay", handleCanPlay)
          audio.removeEventListener("error", handleError)
          audio.play().catch((error) => {
            console.error("Error playing track (timeout):", error)
            setIsPlaying(false)
          })
        }, 3000)
        
        // Clear timeout if canplay or error fires
        audio.addEventListener("canplay", () => clearTimeout(timeout), { once: true })
        audio.addEventListener("error", () => clearTimeout(timeout), { once: true })
      }
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
        seek,
        audioRef,
      }}
    >
      {/* Hidden audio element that persists across navigations */}
      <audio 
        ref={audioRef} 
        preload="auto" 
        style={{ display: "none" }}
        crossOrigin="anonymous"
      />
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

