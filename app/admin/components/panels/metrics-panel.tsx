"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

const supabase = createClient()

type MetricsPanelProps = {
  config: any
  filter?: { sessionId?: string; email?: string }
}

export function MetricsPanel({ config, filter }: MetricsPanelProps) {
  const [value, setValue] = useState<number | string>("Loading...")

  useEffect(() => {
    const fetchData = async () => {
      console.log("[v0] MetricsPanel fetching data with config:", config, "filter:", filter)
      
      // Calculate time range
      const now = new Date()
      const ranges: Record<string, Date> = {
        "1d": new Date(now.getTime() - 24 * 60 * 60 * 1000),
        "7d": new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        "30d": new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        "90d": new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      }
      const startDate = ranges[config.timeRange] || ranges["7d"]

      let query = supabase.from("tracking_events").select("*").gte("timestamp", startDate.toISOString())

      if (config.eventName) {
        query = query.eq("event_name", config.eventName)
      }

      const activeFilter = config.filter || filter || {}
      console.log("[v0] MetricsPanel active filter:", activeFilter)
      
      let hasFilters = false
      
      if (activeFilter?.sessionId && activeFilter.sessionId.trim()) {
        console.log("[v0] MetricsPanel filtering by session_id:", activeFilter.sessionId)
        query = query.eq("session_id", activeFilter.sessionId)
        hasFilters = true
      }
      if (activeFilter?.email && activeFilter.email.trim()) {
        console.log("[v0] MetricsPanel filtering by user_id (email):", activeFilter.email)
        query = query.eq("user_id", activeFilter.email)
        hasFilters = true
      }
      
      console.log("[v0] MetricsPanel has active filters:", hasFilters)

      const { data, error } = await query

      if (error) {
        console.error("[v0] MetricsPanel error:", error)
        setValue("Error")
        return
      }

      console.log("[v0] MetricsPanel fetched", data?.length, "events")
      if (data && data.length > 0) {
        console.log("[v0] MetricsPanel sample event:", {
          event_name: data[0].event_name,
          session_id: data[0].session_id,
          user_id: data[0].user_id,
          timestamp: data[0].timestamp
        })
      }

      // Calculate metric based on type
      switch (config.metric) {
        case "count":
          setValue(data?.length || 0)
          break
        case "property":
          if (config.propertyName && data) {
            const values = data.map((e) => e.properties?.[config.propertyName]).filter(Boolean)
            setValue(values[0] || "N/A")
          } else {
            setValue("N/A")
          }
          break
        case "avg":
          if (config.propertyName && data) {
            const values = data.map((e) => parseFloat(e.properties?.[config.propertyName])).filter((v) => !isNaN(v))
            const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0
            setValue(avg.toFixed(2))
          } else {
            setValue("N/A")
          }
          break
        case "sum":
          if (config.propertyName && data) {
            const values = data.map((e) => parseFloat(e.properties?.[config.propertyName])).filter((v) => !isNaN(v))
            const sum = values.reduce((a, b) => a + b, 0)
            setValue(sum.toFixed(2))
          } else {
            setValue("N/A")
          }
          break
        default:
          setValue("N/A")
      }
    }

    fetchData()
  }, [config, filter])

  return (
    <div className="flex h-32 items-center justify-center">
      <div className="text-center">
        <div className="text-4xl font-bold">{value}</div>
        <div className="mt-2 text-sm text-[var(--color-muted)]">{config.eventName || "All Events"}</div>
      </div>
    </div>
  )
}
