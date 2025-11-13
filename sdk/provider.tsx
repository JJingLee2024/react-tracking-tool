"use client"

import { useEffect, type ReactNode } from "react"
import { Page, configure } from "./track"

interface AnalyticsProviderProps {
  children: ReactNode
  userId?: string
  companyId?: string
}

export function AnalyticsProvider({ children, userId, companyId }: AnalyticsProviderProps) {
  useEffect(() => {
    configure({ userId, companyId })

    Page().view()

    const handleRouteChange = () => {
      Page().view()
    }

    window.addEventListener("pushstate", handleRouteChange)
    window.addEventListener("popstate", handleRouteChange)
    window.addEventListener("replacestate", handleRouteChange)

    return () => {
      window.removeEventListener("pushstate", handleRouteChange)
      window.removeEventListener("popstate", handleRouteChange)
      window.removeEventListener("replacestate", handleRouteChange)
    }
  }, [userId, companyId])

  return <>{children}</>
}
