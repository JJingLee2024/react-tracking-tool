"use client"

import { useEffect, type ReactNode } from "react"
import { Page, configure } from "./track"
import { createClient } from "@/lib/supabase/client"

interface AnalyticsProviderProps {
  children: ReactNode
  userId?: string
  companyId?: string
}

export function AnalyticsProvider({ children, userId, companyId }: AnalyticsProviderProps) {
  useEffect(() => {
    if (typeof window === "undefined") return
    
    const supabase = createClient()
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user
      const effectiveUserId = userId || user?.email || undefined
      
      console.log("[v0] Analytics Provider - Session:", session ? "exists" : "null")
      console.log("[v0] Analytics Provider - User:", user ? user.email : "null")
      console.log("[v0] Analytics configured with userId:", effectiveUserId)
      
      configure({ 
        userId: effectiveUserId, 
        companyId 
      })
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user
      const effectiveUserId = userId || user?.email || undefined
      
      console.log("[v0] Auth state changed - Event:", _event)
      console.log("[v0] Auth state changed - User:", user ? user.email : "null")
      console.log("[v0] Auth state changed, updating userId:", effectiveUserId)
      
      configure({ 
        userId: effectiveUserId, 
        companyId 
      })
    })

    Page().view()

    const handleRouteChange = () => {
      Page().view()
    }

    window.addEventListener("pushstate", handleRouteChange)
    window.addEventListener("popstate", handleRouteChange)
    window.addEventListener("replacestate", handleRouteChange)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener("pushstate", handleRouteChange)
      window.removeEventListener("popstate", handleRouteChange)
      window.removeEventListener("replacestate", handleRouteChange)
    }
  }, [userId, companyId])

  return <>{children}</>
}
