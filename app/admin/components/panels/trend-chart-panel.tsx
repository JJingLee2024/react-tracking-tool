"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

type TrendChartPanelProps = {
  config: any
  filter?: { sessionId?: string; email?: string }
}

type SeriesData = {
  eventName: string
  data: { label: string; value: number }[]
  color: string
}

const COLORS = [
  "#60a5fa", // bright blue
  "#34d399", // bright emerald
  "#fbbf24", // bright amber
  "#fb7185", // bright rose
  "#a78bfa", // bright purple
  "#f472b6", // bright pink
  "#fb923c", // bright orange
  "#22d3ee", // bright cyan
]

export function TrendChartPanel({ config, filter }: TrendChartPanelProps) {
  const [series, setSeries] = useState<SeriesData[]>([])
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; label: string; value: number; eventName: string } | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const activeFilter = config.filter || filter || {}
      console.log("[v0] TrendPanel fetching data with config:", config, "active filter:", activeFilter)
      
      const now = new Date()
      const ranges: Record<string, Date> = {
        "7d": new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        "30d": new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        "90d": new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      }
      const startDate = ranges[config.timeRange] || ranges["7d"]

      const eventNames = config.eventNames && config.eventNames.length > 0 && config.eventNames[0] !== "" 
        ? config.eventNames 
        : ["all"]

      const metricType = config.metricType || "count"
      const propertyName = config.propertyName

      const seriesData: SeriesData[] = []

      for (let i = 0; i < eventNames.length; i++) {
        const eventName = eventNames[i]
        
        let query = supabase
          .from("tracking_events")
          .select("event_name, timestamp, properties")
          .gte("timestamp", startDate.toISOString())
        
        if (eventName !== "all") {
          query = query.eq("event_name", eventName)
        }

        if (activeFilter.sessionId) {
          query = query.eq("session_id", activeFilter.sessionId)
          console.log("[v0] TrendPanel filtering by session_id:", activeFilter.sessionId)
        }
        if (activeFilter.email) {
          query = query.eq("user_id", activeFilter.email)
          console.log("[v0] TrendPanel filtering by user_id (email):", activeFilter.email)
        }
        
        const { data: events, error } = await query.order("timestamp", { ascending: true })

        if (error) {
          console.log("[v0] TrendPanel fetch error:", error)
          continue
        }

        console.log("[v0] TrendPanel fetched", events?.length || 0, "events for", eventName)

        const grouped: Record<string, { sum: number; count: number }> = {}
        
        events?.forEach((e) => {
          const date = new Date(e.timestamp)
          let key = ""
          if (config.interval === "hour") {
            key = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:00`
          } else if (config.interval === "day") {
            key = `${date.getMonth() + 1}/${date.getDate()}`
          } else {
            const weekStart = new Date(date)
            weekStart.setDate(date.getDate() - date.getDay())
            key = `Week of ${weekStart.getMonth() + 1}/${weekStart.getDate()}`
          }

          if (!grouped[key]) {
            grouped[key] = { sum: 0, count: 0 }
          }

          if (metricType === "count") {
            grouped[key].count += 1
          } else if (metricType === "sum" || metricType === "average") {
            const propValue = e.properties?.[propertyName]
            if (typeof propValue === "number") {
              grouped[key].sum += propValue
              grouped[key].count += 1
            }
          }
        })

        const chartData = Object.entries(grouped).map(([label, data]) => {
          let value = 0
          if (metricType === "count") {
            value = data.count
          } else if (metricType === "sum") {
            value = data.sum
          } else if (metricType === "average") {
            value = data.count > 0 ? data.sum / data.count : 0
          }
          return { label, value }
        })

        seriesData.push({
          eventName,
          data: chartData,
          color: COLORS[i % COLORS.length]
        })
      }

      console.log("[v0] TrendPanel created", seriesData.length, "series")
      setSeries(seriesData)
    }

    fetchData()
  }, [config, filter])

  const maxValue = Math.max(
    ...series.flatMap(s => s.data.map(d => d.value)),
    1
  )
  const metricType = config.metricType || "count"

  if (series.length === 0 || series.every(s => s.data.length === 0)) {
    return (
      <div className="flex h-32 items-center justify-center">
        <p className="text-sm text-[var(--color-muted)]">No data available</p>
      </div>
    )
  }

  const allLabels = Array.from(new Set(series.flatMap(s => s.data.map(d => d.label)))).sort()

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-[var(--color-muted)]">
        <span>
          {metricType === "count" && "Event Count"}
          {metricType === "average" && `Average ${config.propertyName || "value"}`}
          {metricType === "sum" && `Total ${config.propertyName || "value"}`}
        </span>
        <span>Max: {maxValue.toFixed(2)}</span>
      </div>
      
      <div className="flex flex-wrap gap-3 text-xs">
        {series.map((s, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 rounded" style={{ backgroundColor: s.color }} />
            <span className="text-[var(--color-text)]">{s.eventName}</span>
          </div>
        ))}
      </div>

      <div className="relative h-32 w-full">
        <svg className="w-full h-full" viewBox="0 0 400 128" preserveAspectRatio="none">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
            <line
              key={ratio}
              x1="0"
              y1={128 * (1 - ratio)}
              x2="400"
              y2={128 * (1 - ratio)}
              stroke="var(--color-border)"
              strokeWidth="0.5"
              opacity="0.3"
            />
          ))}
          
          {/* Layer 1: Area fills */}
          {series.map((s, seriesIndex) => {
            const displayData = s.data.slice(-20)
            if (displayData.length === 0) return null

            return (
              <path
                key={`area-${seriesIndex}`}
                d={(() => {
                  const points = displayData.map((d, i, arr) => {
                    const x = (i / (arr.length - 1)) * 400
                    const y = 128 - (d.value / maxValue) * 128
                    return `${x},${y}`
                  })
                  const firstX = 0
                  const lastX = 400
                  return `M ${firstX},128 L ${points[0]} ${points.map((p, i) => (i === 0 ? `L ${p}` : `L ${p}`)).join(" ")} L ${lastX},128 Z`
                })()}
                fill={s.color}
                opacity="0.1"
              />
            )
          })}
          
          {/* Layer 2: Lines */}
          {series.map((s, seriesIndex) => {
            const displayData = s.data.slice(-20)
            if (displayData.length === 0) return null

            return (
              <polyline
                key={`line-${seriesIndex}`}
                points={displayData
                  .map((d, i, arr) => {
                    const x = (i / (arr.length - 1)) * 400
                    const y = 128 - (d.value / maxValue) * 128
                    return `${x},${y}`
                  })
                  .join(" ")}
                fill="none"
                stroke={s.color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )
          })}
          
          {/* Layer 3: Data points (rendered last so they're on top) */}
          {series.map((s, seriesIndex) => {
            const displayData = s.data.slice(-20)
            if (displayData.length === 0) return null

            return (
              <g key={`points-${seriesIndex}`}>
                {displayData.map((d, i, arr) => {
                  const x = (i / (arr.length - 1)) * 400
                  const y = 128 - (d.value / maxValue) * 128
                  return (
                    <g key={`${seriesIndex}-${i}`}>
                      <circle
                        cx={x}
                        cy={y}
                        r="8"
                        fill="transparent"
                        style={{ cursor: "pointer" }}
                        onMouseEnter={() => setHoveredPoint({ x, y, label: d.label, value: d.value, eventName: s.eventName })}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                      <circle
                        cx={x}
                        cy={y}
                        r={hoveredPoint?.x === x && hoveredPoint?.y === y && hoveredPoint?.eventName === s.eventName ? "4" : "3"}
                        fill={s.color}
                        stroke="var(--color-bg)"
                        strokeWidth="1.5"
                        style={{ pointerEvents: "none" }}
                      />
                    </g>
                  )
                })}
              </g>
            )
          })}
        </svg>
        
        {/* Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute bg-[var(--color-surface)] border border-[var(--color-border)] rounded px-2 py-1 text-xs shadow-lg pointer-events-none z-10"
            style={{
              left: `${(hoveredPoint.x / 400) * 100}%`,
              top: `${(hoveredPoint.y / 128) * 100}%`,
              transform: "translate(-50%, -120%)",
            }}
          >
            <div className="font-medium text-[var(--color-muted)] text-[10px]">{hoveredPoint.eventName}</div>
            <div className="font-medium text-[var(--color-text)]">{hoveredPoint.label}</div>
            <div className="text-[var(--color-accent-blue)]">{hoveredPoint.value.toFixed(2)}</div>
          </div>
        )}
        
        {/* X-axis labels */}
        <div className="flex justify-between mt-1">
          {allLabels.slice(-20).filter((_, i, arr) => i % Math.ceil(arr.length / 5) === 0).map((label, i) => (
            <span key={i} className="text-[10px] text-[var(--color-muted)]">
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
