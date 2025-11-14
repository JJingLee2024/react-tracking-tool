"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

type BarChartPanelProps = {
  config: any
  filter?: { sessionId?: string; email?: string }
}

export function BarChartPanel({ config, filter }: BarChartPanelProps) {
  const [data, setData] = useState<Record<string, number>>({})

  useEffect(() => {
    const fetchData = async () => {
      const activeFilter = config.filter || filter || {}
      console.log("[v0] BarChartPanel active filter:", activeFilter)
      
      const now = new Date()
      const ranges: Record<string, Date> = {
        "1d": new Date(now.getTime() - 24 * 60 * 60 * 1000),
        "7d": new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        "30d": new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        "90d": new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      }
      const startDate = ranges[config.timeRange] || ranges["7d"]

      let query = supabase
        .from("tracking_events")
        .select("event_name")
        .gte("timestamp", startDate.toISOString())

      if (activeFilter.sessionId) {
        query = query.eq("session_id", activeFilter.sessionId)
        console.log("[v0] BarChartPanel filtering by session_id:", activeFilter.sessionId)
      }
      if (activeFilter.email) {
        query = query.eq("user_id", activeFilter.email)
        console.log("[v0] BarChartPanel filtering by user_id (email):", activeFilter.email)
      }

      const { data: events } = await query
      console.log("[v0] BarChartPanel fetched", events?.length || 0, "events")

      const counts: Record<string, number> = {}
      const eventNames = config.eventNames?.filter((n: string) => n) || []

      if (eventNames.length === 0) {
        events?.forEach((e) => {
          counts[e.event_name] = (counts[e.event_name] || 0) + 1
        })
      } else {
        eventNames.forEach((name: string) => {
          counts[name] = events?.filter((e) => e.event_name === name).length || 0
        })
      }

      setData(counts)
    }

    fetchData()
  }, [config, filter])

  const entries = Object.entries(data).sort((a, b) => b[1] - a[1])
  const maxCount = Math.max(...entries.map(([, count]) => count), 1)

  if (entries.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center">
        <p className="text-sm text-[var(--color-muted)]">No data</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {entries.slice(0, 5).map(([name, count]) => {
        const percentage = (count / maxCount) * 100
        return (
          <div key={name}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="truncate font-medium">{name}</span>
              <span className="text-[var(--color-muted)]">{count}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-surface)]">
              <div
                className="h-full rounded-full bg-[var(--color-accent-blue)] transition-all"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
