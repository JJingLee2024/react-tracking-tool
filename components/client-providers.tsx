'use client'

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

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AnalyticsProvider>
      <AuthRefreshHandler />
      <AccountMenu />
      <HelpCenter />
      {children}
    </AnalyticsProvider>
  )
}
