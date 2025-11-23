"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { useState } from "react"

export default function ProfileLoading() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <>
      <Header onMenuClick={() => setIsSidebarOpen(true)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="min-h-screen bg-black pt-[72px]">
        <div className="relative h-[400px] bg-gradient-to-b from-purple-900/20 to-black border-b border-gray-800 animate-pulse">
          <div className="relative container mx-auto px-6 h-full flex items-end pb-12">
            <div className="flex items-end space-x-8">
              <div className="w-48 h-48 rounded-xl bg-gray-800"></div>
              <div className="pb-4 space-y-4">
                <div className="h-10 w-64 bg-gray-800 rounded"></div>
                <div className="h-6 w-48 bg-gray-800 rounded"></div>
                <div className="flex space-x-2">
                  <div className="h-8 w-32 bg-gray-800 rounded"></div>
                  <div className="h-8 w-32 bg-gray-800 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-gray-900 rounded-xl overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-800"></div>
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-gray-800 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-800 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
