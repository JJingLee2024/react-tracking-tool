import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { AnalyticsProvider } from "@/sdk/provider"

const geistSans = Geist({
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "React Analytics Tracker",
  description: "Real-time event tracking and analytics dashboard",
    generator: 'v0.app'
}

export const viewport: Viewport = {
  themeColor: "#000000",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.className} ${geistMono.className}`}>
      <body className="antialiased">
        <AnalyticsProvider>{children}</AnalyticsProvider>
      </body>
    </html>
  )
}
