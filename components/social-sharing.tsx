"use client"

import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
} from "next-share"
import { useState, useRef } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Copy, MoreHorizontal } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SocialSharingProps {
  title: string
  description: string
  imageUrl?: string
}

const SocialSharing = ({ title, description, imageUrl }: SocialSharingProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const { toast } = useToast()

  const currentURL = typeof window !== "undefined" ? window.location.href : ""

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentURL)
    toast({
      title: "Copied to clipboard!",
      description: "Share the link with your friends.",
    })
  }

  return (
    <div className="flex items-center space-x-4">
      <FacebookShareButton url={currentURL} quote={description} hashtag={"#OldRockWeb3"}>
        <FacebookIcon size={32} round />
      </FacebookShareButton>
      <TwitterShareButton url={currentURL} title={title}>
        <TwitterIcon size={32} round />
      </TwitterShareButton>
      <LinkedinShareButton url={currentURL} title={title} summary={description} source={currentURL}>
        <LinkedinIcon size={32} round />
      </LinkedinShareButton>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger ref={dropdownRef} asChild>
          <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[180px]">
          <DropdownMenuItem onClick={handleCopyLink}>
            <Copy className="h-4 w-4 mr-2" /> Copy link
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default SocialSharing
