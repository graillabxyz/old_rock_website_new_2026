"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, RotateCcw, Search } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ComicChapter {
  id: number
  title: string
  cover: string
  pages: string[]
  readTime: string
}

interface ComicReaderProps {
  chapter: {
    id: number
    title: string
    cover: string
    pages: number
    readTime: string
    description: string
  }
  onClose: () => void
}

const comicChapters: ComicChapter[] = [
  {
    id: 1,
    title: "The Discovery",
    cover: "/images/comic/chapter1-cover.avif",
    pages: [
      "/images/comic/chapter1-page1.jpeg",
      "/images/comic/chapter1-page2.jpeg",
      "/images/comic/chapter1-page3.jpeg",
      "/images/comic/chapter1-page4.jpeg",
      "/images/comic/chapter1-page5.jpeg",
      "/images/comic/chapter1-page6.jpeg",
      "/images/comic/chapter1-page7.jpeg",
      "/images/comic/chapter1-page8.jpeg",
      "/images/comic/chapter1-page9.jpeg",
      "/images/comic/chapter1-page10.jpeg",
      "/images/comic/chapter1-page11.jpeg",
      "/images/comic/chapter1-page12.jpeg",
      "/images/comic/chapter1-page13.jpeg",
      "/images/comic/chapter1-page14.jpeg",
      "/images/comic/chapter1-page15.jpeg",
      "/images/comic/chapter1-page16.jpeg",
    ],
    readTime: "30 min",
  },
  {
    id: 2,
    title: "Goliath",
    cover: "/images/comic/chapter2-cover.avif",
    pages: [
      "/images/comic/chapter2-page1.jpeg",
      "/images/comic/chapter2-page2.jpeg",
      "/images/comic/chapter2-page3.jpeg",
      "/images/comic/chapter2-page4.jpeg",
      "/images/comic/chapter2-page5.jpeg",
      "/images/comic/chapter2-page6.jpeg",
      "/images/comic/chapter2-page7.jpeg",
      "/images/comic/chapter2-page8.jpeg",
      "/images/comic/chapter2-page9.jpeg",
      "/images/comic/chapter2-page10.jpeg",
      "/images/comic/chapter2-page11.jpeg",
      "/images/comic/chapter2-page12.jpeg",
      "/images/comic/chapter2-page13.jpeg",
      "/images/comic/chapter2-page14.jpeg",
      "/images/comic/chapter2-page15.jpeg",
    ],
    readTime: "28 min",
  },
  {
    id: 3,
    title: "The Awakening",
    cover: "/images/comic/chapter3-cover.avif",
    pages: [
      "/images/comic/chapter3-page1.jpeg",
      "/images/comic/chapter3-page2.jpeg",
      "/images/comic/chapter3-page3.jpeg",
      "/images/comic/chapter3-page4.jpeg",
      "/images/comic/chapter3-page5.jpeg",
      "/images/comic/chapter3-page6.jpeg",
    ],
    readTime: "12 min",
  },
]

export function ComicReader({ chapter, onClose }: ComicReaderProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [isMagnified, setIsMagnified] = useState(false)
  const [magnifyPosition, setMagnifyPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })
  const imageRef = useRef<HTMLDivElement>(null)
  const imgElementRef = useRef<HTMLImageElement>(null)
  const magnifierRef = useRef<HTMLDivElement>(null)

  const selectedChapter = comicChapters.find((c) => c.id === chapter.id)

  const handleNextPage = () => {
    if (selectedChapter && currentPage < selectedChapter.pages.length - 1) {
      setCurrentPage(currentPage + 1)
      setIsMagnified(false)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
      setIsMagnified(false)
    }
  }

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 0.25, 3))
  }

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 0.25, 0.5))
  }

  const handleResetZoom = () => {
    setZoom(1)
  }

  // Update image size when image loads
  const handleImageLoad = () => {
    if (imgElementRef.current) {
      const rect = imgElementRef.current.getBoundingClientRect()
      setImageSize({ width: rect.width, height: rect.height })
    }
  }

  const handleImageClick = (e: React.MouseEvent) => {
    // If magnified, always exit magnification regardless of where clicked
    if (isMagnified) {
      setIsMagnified(false)
      return
    }

    if (!imgElementRef.current) return

    const rect = imgElementRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Ensure click is within image bounds
    if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
      setMagnifyPosition({ x, y })
      setIsMagnified(true)
    }
  }

  // Add throttling function
  const throttle = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout
    let lastExecTime = 0
    return function (this: any, ...args: any[]) {
      const currentTime = Date.now()

      if (currentTime - lastExecTime > delay) {
        func.apply(this, args)
        lastExecTime = currentTime
      } else {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(
          () => {
            func.apply(this, args)
            lastExecTime = Date.now()
          },
          delay - (currentTime - lastExecTime),
        )
      }
    }
  }

  // Optimize mouse move handler
  const handleMouseMove = useCallback(
    throttle((e: React.MouseEvent) => {
      if (isMagnified && !isDragging && imgElementRef.current) {
        const rect = imgElementRef.current.getBoundingClientRect()
        const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left))
        const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top))
        setMagnifyPosition({ x, y })
      }
    }, 16), // ~60fps
    [isMagnified, isDragging],
  )

  const handleMagnifierMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    setDragStart({ x: e.clientX - magnifyPosition.x, y: e.clientY - magnifyPosition.y })
  }

  const handleMagnifierMouseUp = () => {
    setIsDragging(false)
  }

  // Optimize magnifier mouse move
  const handleMagnifierMouseMove = useCallback(
    throttle((e: MouseEvent) => {
      if (isDragging && imgElementRef.current) {
        const rect = imgElementRef.current.getBoundingClientRect()
        const newX = Math.max(0, Math.min(rect.width, e.clientX - dragStart.x))
        const newY = Math.max(0, Math.min(rect.height, e.clientY - dragStart.y))
        setMagnifyPosition({ x: newX, y: newY })
      }
    }, 16), // ~60fps
    [isDragging, dragStart],
  )

  const handleKeyPress = (e: KeyboardEvent) => {
    if (!selectedChapter) return

    switch (e.key) {
      case "ArrowLeft":
        handlePrevPage()
        break
      case "ArrowRight":
        handleNextPage()
        break
      case "Escape":
        if (isMagnified) {
          setIsMagnified(false)
        } else if (isFullscreen) {
          setIsFullscreen(false)
        } else {
          onClose()
        }
        break
      case "f":
      case "F":
        setIsFullscreen(!isFullscreen)
        break
    }
  }

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [selectedChapter, currentPage, isFullscreen, isMagnified])

  useEffect(() => {
    if (isDragging) {
      const handleMouseMove = (e: MouseEvent) => handleMagnifierMouseMove(e)
      const handleMouseUp = () => handleMagnifierMouseUp()

      document.addEventListener("mousemove", handleMouseMove, { passive: true })
      document.addEventListener("mouseup", handleMouseUp)

      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isDragging, handleMagnifierMouseMove])

  // Calculate magnifier position and background position
  const magnifierSize = 256 // 256px diameter
  const magnifierRadius = magnifierSize / 2
  const magnificationLevel = 2

  // Calculate the position of the magnifier circle
  const magnifierLeft = Math.max(magnifierRadius, Math.min(imageSize.width - magnifierRadius, magnifyPosition.x))
  const magnifierTop = Math.max(magnifierRadius, Math.min(imageSize.height - magnifierRadius, magnifyPosition.y))

  // Calculate background position for the magnified image
  const backgroundX = -magnifyPosition.x * magnificationLevel + magnifierRadius
  const backgroundY = -magnifyPosition.y * magnificationLevel + magnifierRadius

  if (!selectedChapter) {
    return null
  }

  return (
    <div className={`${isFullscreen ? "fixed inset-0 z-50" : "fixed inset-0 z-50"} bg-black`}>
      {/* Header Controls */}
      <div className="relative z-10 bg-black/90 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button onClick={onClose} variant="ghost" size="sm" className="text-white hover:bg-white/10">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Chapters
            </Button>
            <div className="text-white">
              <h2 className="font-montserrat font-black">
                Chapter {selectedChapter.id}: {selectedChapter.title}
              </h2>
              <p className="text-sm text-gray-400 font-pt-mono font-bold">
                Page {currentPage + 1} of {selectedChapter.pages.length}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button onClick={handleZoomOut} variant="ghost" size="sm" className="text-white hover:bg-white/10">
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-white font-pt-mono text-sm min-w-[60px] text-center">{Math.round(zoom * 100)}%</span>
            <Button onClick={handleZoomIn} variant="ghost" size="sm" className="text-white hover:bg-white/10">
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button onClick={handleResetZoom} variant="ghost" size="sm" className="text-white hover:bg-white/10">
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setIsFullscreen(!isFullscreen)}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
            >
              {isFullscreen ? <X className="w-4 h-4" /> : "Fullscreen"}
            </Button>
          </div>
        </div>
      </div>

      {/* Comic Page Display */}
      <div
        className="relative flex-1 flex items-center justify-center p-4 overflow-hidden"
        onClick={(e) => {
          if (isMagnified) {
            setIsMagnified(false)
          }
        }}
      >
        <div className="relative max-w-4xl mx-auto">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="relative cursor-pointer"
            style={{ transform: `scale(${zoom})` }}
            ref={imageRef}
            onClick={handleImageClick}
            onMouseMove={handleMouseMove}
          >
            <Image
              ref={imgElementRef}
              src={selectedChapter.pages[currentPage] || "/placeholder.svg"}
              alt={`Page ${currentPage + 1}`}
              width={800}
              height={1200}
              className="w-full h-auto rounded-lg shadow-2xl"
              priority
              onLoad={handleImageLoad}
            />

            {/* Magnification Indicator */}
            {!isMagnified && (
              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg p-2 opacity-0 hover:opacity-100 transition-opacity">
                <Search className="w-5 h-5 text-white" />
              </div>
            )}
          </motion.div>

          {/* Fixed Magnifier */}
          <AnimatePresence>
            {isMagnified && selectedChapter && imageSize.width > 0 && (
              <motion.div
                ref={magnifierRef}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute border-4 border-white rounded-full overflow-hidden shadow-2xl cursor-move z-20 will-change-transform"
                style={{
                  width: `${magnifierSize}px`,
                  height: `${magnifierSize}px`,
                  left: `${magnifierLeft - magnifierRadius}px`,
                  top: `${magnifierTop - magnifierRadius}px`,
                  pointerEvents: isDragging ? "none" : "auto",
                }}
                onMouseDown={handleMagnifierMouseDown}
              >
                <div
                  className="w-full h-full bg-no-repeat will-change-transform"
                  style={{
                    backgroundImage: `url(${selectedChapter.pages[currentPage]})`,
                    backgroundSize: `${imageSize.width * magnificationLevel}px ${imageSize.height * magnificationLevel}px`,
                    backgroundPosition: `${backgroundX}px ${backgroundY}px`,
                  }}
                />
                <div className="absolute inset-0 border-2 border-orange-400 rounded-full pointer-events-none" />
                {/* Center crosshair */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-4 h-0.5 bg-orange-400 opacity-50"></div>
                  <div className="absolute w-0.5 h-4 bg-orange-400 opacity-50"></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Arrows */}
        <AnimatePresence>
          {currentPage > 0 && (
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onClick={handlePrevPage}
              className="fixed left-4 top-1/2 transform -translate-y-1/2 bg-black/80 hover:bg-black/90 text-white p-3 rounded-full backdrop-blur-sm transition-colors z-10"
            >
              <ChevronLeft className="w-6 h-6" />
            </motion.button>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {currentPage < selectedChapter.pages.length - 1 && (
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onClick={handleNextPage}
              className="fixed right-4 top-1/2 transform -translate-y-1/2 bg-black/80 hover:bg-black/90 text-white p-3 rounded-full backdrop-blur-sm transition-colors z-10"
            >
              <ChevronRight className="w-6 h-6" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Page Navigation Dots */}
      <div className="relative z-10 bg-black/90 backdrop-blur-sm border-t border-gray-800 py-4">
        <div className="flex justify-center space-x-2 overflow-x-auto px-4">
          {selectedChapter.pages.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentPage(index)
                setIsMagnified(false)
              }}
              className={`w-3 h-3 rounded-full transition-colors flex-shrink-0 ${
                index === currentPage ? "bg-orange-500" : "bg-gray-600 hover:bg-gray-500"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Instructions */}
      {isMagnified && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-pt-mono text-sm z-30">
          Click and drag to move • Click anywhere to exit magnification
        </div>
      )}
    </div>
  )
}
