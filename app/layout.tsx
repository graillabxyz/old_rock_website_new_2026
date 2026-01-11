import type React from "react"
import type { Metadata } from "next"
import ClientLayout from "./client-layout"
import { defaultMetadata } from "@/lib/seo-config"
import { StructuredData, organizationSchema, websiteSchema } from "@/components/structured-data"
import { Barlow_Condensed, PT_Mono } from 'next/font/google'
import "@/app/globals.css"

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-barlow',
})

const ptMono = PT_Mono({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-pt-mono',
})

export const metadata: Metadata = {
  ...defaultMetadata,
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.ico",
  },
  other: {
    "theme-color": "#1a1a1a",
    "color-scheme": "dark light",
    "twitter:image": "/images/old-rock-social.jpeg",
    "twitter:image:alt": "Old Rock - Web3 Gaming Universe",
    "og:image": "/images/old-rock-social.jpeg",
    "og:image:alt": "Old Rock - Web3 Gaming Universe",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "Old Rock",
    "application-name": "Old Rock",
    "msapplication-TileColor": "#1a1a1a",
    "msapplication-config": "/browserconfig.xml",
  },
  generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" style={{ overscrollBehavior: 'none' }}>
      <body className={`${barlowCondensed.variable} ${ptMono.variable}`} style={{ overscrollBehavior: 'none' }}>
        <StructuredData data={organizationSchema} />
        <StructuredData data={websiteSchema} />
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
