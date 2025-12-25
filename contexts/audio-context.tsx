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
  // Wait for duration to be available (loadedmetadata event)
  const seek = useCallback((percentage: number) => {
    const audio = audioRef.current
    if (!audio) return

    // If duration is not available yet, wait for loadedmetadata
    if (!audio.duration || isNaN(audio.duration) || !isFinite(audio.duration)) {
      const handleLoadedMetadata = () => {
        audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
        // Now duration should be available
        if (audio.duration && isFinite(audio.duration)) {
          const clampedPercentage = Math.max(0, Math.min(100, percentage))
          const newTime = (clampedPercentage / 100) * audio.duration
          audio.currentTime = newTime
          setProgress(clampedPercentage)
        }
      }
      audio.addEventListener("loadedmetadata", handleLoadedMetadata, { once: true })
      // Force load if needed
      if (audio.readyState === 0) {
        audio.load()
      }
      return
    }

    // Duration is available, seek immediately
    const clampedPercentage = Math.max(0, Math.min(100, percentage))
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

      // Mark that we should auto-play if currently playing
      shouldAutoPlayRef.current = isPlayingRef.current
      
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

      // The useEffect that handles currentTrackIndex changes will update the source
      // and check shouldAutoPlayRef to auto-play
    },
    []
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

  // Track if we should auto-play after track change
  // Used for both manual track changes and automatic next track after ended
  const shouldAutoPlayRef = useRef(false)
  const isPlayingRef = useRef(false)

  // Keep isPlayingRef in sync with isPlaying state
  useEffect(() => {
    isPlayingRef.current = isPlaying
  }, [isPlaying])

  // Handle track ended - automatically play next track
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleEnded = () => {
      console.log("[AudioContext] Track ended, advancing to next track")
      // Mark that we should auto-play the next track
      shouldAutoPlayRef.current = true
      // Advance to next track
      setCurrentTrackIndex((prevIndex) => {
        const newIndex = (prevIndex + 1) % defaultTracks.length
        setProgress(0)
        return newIndex
      })
      // The useEffect that handles currentTrackIndex changes will update the source
      // and check shouldAutoPlayRef to auto-play
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

    const handleLoadedMetadata = () => {
      // Metadata loaded, duration should now be available
      console.log("[AudioContext] Metadata loaded, duration:", audio.duration)
    }

    audio.addEventListener("play", handlePlay)
    audio.addEventListener("pause", handlePause)
    audio.addEventListener("error", handleError)
    audio.addEventListener("stalled", handleStalled)
    audio.addEventListener("loadedmetadata", handleLoadedMetadata)

    return () => {
      audio.removeEventListener("play", handlePlay)
      audio.removeEventListener("pause", handlePause)
      audio.removeEventListener("error", handleError)
      audio.removeEventListener("stalled", handleStalled)
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
    }
  }, [volume, isPlaying])

  // Update audio source when track changes
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const newSrc = defaultTracks[currentTrackIndex].src
    const shouldAutoPlay = shouldAutoPlayRef.current
    
    console.log("[AudioContext] Track changed to:", defaultTracks[currentTrackIndex].title, "shouldAutoPlay:", shouldAutoPlay)
    
    // Reset the auto-play flag
    shouldAutoPlayRef.current = false
    
    // Update the source and load the new track
    audio.src = newSrc
    audio.load()

    // If we should play (either was playing or track ended), wait for the track to be ready
    if (shouldAutoPlay) {
      const handleCanPlay = () => {
        audio.removeEventListener("canplay", handleCanPlay)
        audio.removeEventListener("loadeddata", handleCanPlay)
        audio.removeEventListener("error", handleError)
        audio.play()
          .then(() => {
            console.log("[AudioContext] Successfully started playing:", defaultTracks[currentTrackIndex].title)
            setIsPlaying(true)
          })
          .catch((error) => {
            console.error("Error playing track:", error)
            setIsPlaying(false)
          })
      }
      
      const handleError = () => {
        audio.removeEventListener("canplay", handleCanPlay)
        audio.removeEventListener("loadeddata", handleCanPlay)
        audio.removeEventListener("error", handleError)
        console.error("Error loading track:", defaultTracks[currentTrackIndex].title)
        setIsPlaying(false)
      }
      
      // Try multiple events for better compatibility
      audio.addEventListener("canplay", handleCanPlay, { once: true })
      audio.addEventListener("loadeddata", handleCanPlay, { once: true })
      audio.addEventListener("error", handleError, { once: true })
      
      // If already loaded, play immediately
      if (audio.readyState >= 2) { // HAVE_CURRENT_DATA
        audio.play()
          .then(() => {
            console.log("[AudioContext] Track already loaded, playing immediately")
            setIsPlaying(true)
          })
          .catch((error) => {
            console.error("Error playing track (already loaded):", error)
            setIsPlaying(false)
          })
      } else {
        // Fallback: if events don't fire within 3 seconds, try playing anyway
        const timeout = setTimeout(() => {
          audio.removeEventListener("canplay", handleCanPlay)
          audio.removeEventListener("loadeddata", handleCanPlay)
          audio.removeEventListener("error", handleError)
          if (audio.readyState >= 1) { // HAVE_METADATA at least
            audio.play()
              .then(() => {
                console.log("[AudioContext] Playing after timeout fallback")
                setIsPlaying(true)
              })
              .catch((error) => {
                console.error("Error playing track (timeout):", error)
                setIsPlaying(false)
              })
          } else {
            console.warn("[AudioContext] Track not ready after timeout, readyState:", audio.readyState)
          }
        }, 3000)
        
        // Clear timeout if any event fires
        audio.addEventListener("canplay", () => clearTimeout(timeout), { once: true })
        audio.addEventListener("loadeddata", () => clearTimeout(timeout), { once: true })
        audio.addEventListener("error", () => clearTimeout(timeout), { once: true })
      }
    } else {
      // Not playing, just ensure state is correct
      setIsPlaying(false)
    }
  }, [currentTrackIndex])

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

