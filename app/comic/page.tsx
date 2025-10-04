"use client"

import { useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, BookOpen } from "lucide-react"
import { ComicReader } from "@/components/comic-reader"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"

interface Chapter {
  id: number
  title: string
  cover: string
  pages: number
  readTime: string
  description: string
}

const chapters: Chapter[] = [
  {
    id: 1,
    title: "The Discovery",
    cover: "/images/comic/chapter1-cover.avif",
    pages: 16,
    readTime: "30 min",
    description: "AS discovers the mysterious Old Rock and begins his descent into obsession and transformation.",
  },
  {
    id: 2,
    title: "Goliath",
    cover: "/images/comic/chapter2-cover.avif",
    pages: 15,
    readTime: "28 min",
    description: "The jeweler's discovery leads to global catastrophe as the Goliath infection spreads worldwide.",
  },
  {
    id: 3,
    title: "Coming Soon",
    cover: "/images/comic/chapter3-cover.avif",
    pages: 0,
    readTime: "TBA",
    description: "The saga continues...",
  },
]

export default function ComicPage() {
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null)
  const [isReaderOpen, setIsReaderOpen] = useState(false)

  const handleChapterSelect = (chapter: Chapter) => {
    if (chapter.pages > 0) {
      setSelectedChapter(chapter)
      setIsReaderOpen(true)
    }
  }

  const handleCloseReader = () => {
    setIsReaderOpen(false)
    setSelectedChapter(null)
  }

  const totalPages = chapters.reduce((sum, chapter) => sum + chapter.pages, 0)
  const totalReadTime = chapters
    .filter((chapter) => chapter.pages > 0)
    .reduce((sum, chapter) => sum + Number.parseInt(chapter.readTime), 0)

  return (
    <>
      <Sidebar />
      <Header />
      <div className="min-h-screen bg-black text-white relative ml-0 md:ml-20 pt-20">
        {/* Hero Section */}

        {/* Full-width Three Column Layout */}
        <div className="w-full px-4 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {chapters.map((chapter, index) => (
              <motion.div
                key={chapter.id}
                className={`group relative bg-gray-900/50 rounded-2xl overflow-hidden border border-gray-800 hover:border-gray-600 transition-all duration-300 ${
                  chapter.pages > 0 ? "cursor-pointer hover:scale-105" : "opacity-60"
                }`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                onClick={() => handleChapterSelect(chapter)}
              >
                <div className="aspect-[3/4] relative overflow-hidden">
                  <Image
                    src={chapter.cover || "/placeholder.svg"}
                    alt={`Chapter ${chapter.id}: ${chapter.title}`}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                  {chapter.pages === 0 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-2xl font-montserrat font-black text-gray-300">Coming Soon</span>
                    </div>
                  )}

                  {/* Chapter Number Badge */}
                  <div className="absolute top-4 left-4 bg-orange-500 text-white px-3 py-1 rounded-full">
                    <span className="text-sm font-pt-mono font-bold">Chapter {chapter.id}</span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-montserrat font-black mb-2">{chapter.title}</h3>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-4 text-sm text-gray-400 font-pt-mono font-bold">
                      <span>{chapter.pages} pages</span>
                      <span>{chapter.readTime}</span>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed font-pt-mono mb-4">{chapter.description}</p>

                  {chapter.pages > 0 && (
                    <div className="flex items-center justify-center">
                      <div className="flex items-center text-orange-400 text-sm font-pt-mono font-bold group-hover:text-orange-300 transition-colors bg-orange-500/10 px-4 py-2 rounded-lg border border-orange-500/20">
                        <BookOpen className="w-4 h-4 mr-2" />
                        Read Chapter
                        <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Comic Reader Modal */}
        <AnimatePresence>
          {isReaderOpen && selectedChapter && <ComicReader chapter={selectedChapter} onClose={handleCloseReader} />}
        </AnimatePresence>
      </div>
    </>
  )
}
