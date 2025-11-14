import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from 'next/font/google'
import "./globals.css"
import { ClientOnly } from "@/components/client-only"
import dynamic from 'next/dynamic'

const AnalyticsProvider = dynamic(
  () => import("@/sdk/provider").then(mod => ({ default: mod.AnalyticsProvider })),
  { ssr: false }
)

const AccountMenu = dynamic(
  () => import("@/components/account-menu").then(mod => ({ default: mod.AccountMenu })),
  { ssr: false }
)

const HelpCenter = dynamic(
  () => import("@/components/help-center").then(mod => ({ default: mod.HelpCenter })),
  { ssr: false }
)

const AuthRefreshHandler = dynamic(
  () => import("@/components/auth-refresh-handler").then(mod => ({ default: mod.AuthRefreshHandler })),
  { ssr: false }
)

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
        <ClientOnly>
          <div className="fixed top-4 right-4 z-50">
            <AccountMenu />
          </div>
          <HelpCenter />
          <AuthRefreshHandler />
          <AnalyticsProvider>{children}</AnalyticsProvider>
        </ClientOnly>
      </body>
    </html>
  )
}
