import type React from "react"
export interface SubmenuItem {
  name: string
  href: string
  comingSoon?: boolean
}

export interface MenuItem {
  name: string
  icon: string | React.ReactNode
  href: string
  isExternal?: boolean
  comingSoon?: boolean
  hasArrow?: boolean
  isProfile?: boolean
  hasSubmenu?: boolean
  submenuItems?: SubmenuItem[]
  onClick?: () => void
  iconSize?: number
}
