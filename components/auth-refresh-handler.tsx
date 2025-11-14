"use client"

import { useEffect } from "react"
import { useRouter } from 'next/navigation'
import { createClient } from "@/lib/supabase/client"

export function AuthRefreshHandler() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[v0] Auth event:", event)
      
      // Refresh page on sign in or sign out
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
        console.log("[v0] Auth state changed, refreshing page...")
        router.refresh()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  return null
}
