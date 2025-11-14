"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

type FunnelChartPanelProps = {
  config: any
  filter?: { sessionId?: string; email?: string }
}

export function FunnelChartPanel({ config, filter }: FunnelChartPanelProps) {
  const [funnelData, setFunnelData] = useState<{ step: string; count: number; rate: number }[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const activeFilter = config.filter || filter || {}
      console.log("[v0] FunnelPanel fetching data with config:", config, "active filter:", activeFilter)
      
      if (!config.steps || config.steps.length === 0) {
        setFunnelData([])
        return
      }

      const countMode = config.countMode || "unique" // default to unique users

      let query = supabase
        .from("tracking_events")
        .select("user_id, event_name, timestamp, session_id, refer, page_name")
        .order("timestamp", { ascending: true })

      if (activeFilter.sessionId) {
        query = query.eq("session_id", activeFilter.sessionId)
        console.log("[v0] FunnelPanel filtering by session_id:", activeFilter.sessionId)
      }
      if (activeFilter.email) {
        query = query.eq("user_id", activeFilter.email)
        console.log("[v0] FunnelPanel filtering by user_id (email):", activeFilter.email)
      }

      const { data: events } = await query
      console.log("[v0] FunnelPanel fetched", events?.length || 0, "events")

      if (!events) {
        setFunnelData([])
        return
      }

      const userEvents: Record<string, any[]> = {}
      events.forEach((e) => {
        const userId = e.user_id || e.session_id
        if (!userEvents[userId]) userEvents[userId] = []
        userEvents[userId].push(e)
      })

      console.log("[v0] FunnelPanel tracking", Object.keys(userEvents).length, "unique users")
      console.log("[v0] FunnelPanel count mode:", countMode)

      const timeWindowMs = (config.timeWindow || 7) * 24 * 60 * 60 * 1000
      const stepCounts: number[] = []
      const stepDetails: any[] = []

      config.steps.forEach((stepName: string, stepIndex: number) => {
        let count = 0
        const usersCompleted = new Set<string>()

        Object.entries(userEvents).forEach(([userId, userEventList]) => {
          const stepEvents = userEventList.filter((e) => e.event_name === stepName)

          if (stepIndex === 0) {
            // First step
            if (stepEvents.length > 0) {
              if (countMode === "total") {
                count += stepEvents.length // Count all events
              } else {
                count++ // Count unique users only
              }
              usersCompleted.add(userId)
            }
          } else {
            // Subsequent steps
            const prevStepName = config.steps[stepIndex - 1]
            const prevStepEvents = userEventList.filter((e) => e.event_name === prevStepName)

            if (prevStepEvents.length === 0) return // No previous step, skip this user

            // Find the earliest time of the previous step
            const earliestPrevTime = Math.min(...prevStepEvents.map(e => new Date(e.timestamp).getTime()))

            // Extract pageName from previous step event name (e.g., "View_Home" -> "Home")
            const prevPageName = prevStepName.replace(/^View_/, '')
            
            // Count valid current step events (after earliest prev step, within time window, and refer matches OR refer is null)
            const validStepEvents = stepEvents.filter((currEvent) => {
              const currTime = new Date(currEvent.timestamp).getTime()
              const isAfterPrev = currTime > earliestPrevTime
              const isWithinWindow = currTime - earliestPrevTime <= timeWindowMs
              // Accept if refer matches previous page OR if refer is null/undefined (old data without refer)
              const hasValidRefer = currEvent.refer === prevPageName || !currEvent.refer
              
              return isAfterPrev && isWithinWindow && hasValidRefer
            })

            if (validStepEvents.length > 0) {
              if (countMode === "total") {
                count += validStepEvents.length // Count all valid events
              } else {
                count++ // Count unique users only
              }
              usersCompleted.add(userId)
            }
          }
        })

        stepCounts.push(count)
        stepDetails.push({ step: stepName, count, users: Array.from(usersCompleted) })
        console.log(`[v0] FunnelPanel step ${stepIndex + 1} (${stepName}):`, count, countMode === "total" ? "events" : "users")
      })

      const result = config.steps.map((step: string, index: number) => ({
        step,
        count: stepCounts[index],
        rate: index === 0 ? 100 : stepCounts[0] > 0 ? (stepCounts[index] / stepCounts[0]) * 100 : 0,
      }))

      console.log("[v0] FunnelPanel result:", result)
      setFunnelData(result)
    }

    fetchData()
  }, [config, filter])

  if (funnelData.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center">
        <p className="text-sm text-[var(--color-muted)]">Configure funnel steps</p>
      </div>
    )
  }

  const maxCount = funnelData[0]?.count || 1

  return (
    <div className="space-y-2">
      {funnelData.map((step, index) => {
        const width = (step.count / maxCount) * 100
        return (
          <div key={index}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="truncate font-medium">
                {index + 1}. {step.step}
              </span>
              <span className="text-[var(--color-muted)]">
                {step.count} ({step.rate.toFixed(1)}%)
              </span>
            </div>
            <div className="h-6 w-full overflow-hidden rounded bg-[var(--color-surface)]">
              <div
                className="flex h-full items-center justify-center rounded bg-[var(--color-accent-emerald)] text-xs font-medium transition-all"
                style={{ width: `${width}%` }}
              >
                {width > 20 && `${step.rate.toFixed(0)}%`}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
