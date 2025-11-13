"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"
import { zhTW } from "date-fns/locale"
import { Play, Pause, RefreshCw } from "lucide-react"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

interface TrackingEvent {
  id: string
  event_type: string
  event_name: string
  page_name: string
  component_name: string | null
  timestamp: string
  refer: string | null
  expose_time: number | null
  user_id: string | null
  session_id: string
  device_type: string | null
  browser: string | null
  os: string | null
  network_type: string | null
  page_url: string
  properties: any
}

const eventTypeColors = {
  view: "bg-blue-50 text-blue-700 border-blue-200",
  click: "bg-emerald-50 text-emerald-700 border-emerald-200",
  expose: "bg-amber-50 text-amber-700 border-amber-200",
  disappear: "bg-rose-50 text-rose-700 border-rose-200",
}

const eventTypeLabels = {
  view: "瀏覽",
  click: "點擊",
  expose: "曝光",
  disappear: "消失",
}

export default function LiveLogPage() {
  const [events, setEvents] = useState<TrackingEvent[]>([])
  const [isLive, setIsLive] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [eventCount, setEventCount] = useState(0)

  // 獲取最新事件
  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from("tracking_events")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(50)

    if (error) {
      console.error("[v0] Error fetching events:", error)
      return
    }

    if (data) {
      setEvents(data)
      setEventCount(data.length)
      setLastUpdate(new Date())
    }
  }

  // 自動刷新（每 2 秒）
  useEffect(() => {
    fetchEvents()

    if (isLive) {
      const interval = setInterval(fetchEvents, 2000)
      return () => clearInterval(interval)
    }
  }, [isLive])

  const toggleLive = () => {
    setIsLive(!isLive)
  }

  const manualRefresh = () => {
    fetchEvents()
  }

  return (
    <div className="min-h-screen bg-[#FBFBFA] p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* 標題和控制 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-balance text-3xl font-bold text-[#37352F]">Live Log 即時日誌</h1>
            <p className="text-sm text-[#37352F]/60 mt-1">
              即時監控追蹤事件
              {isLive && " · 每 2 秒自動刷新"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm text-[#37352F]/50">
              最後更新: {formatDistanceToNow(lastUpdate, { addSuffix: true, locale: zhTW })}
            </div>

            <Button variant="outline" size="sm" onClick={manualRefresh} disabled={isLive}>
              <RefreshCw className="h-4 w-4 mr-2" />
              手動刷新
            </Button>

            <Button variant={isLive ? "default" : "outline"} size="sm" onClick={toggleLive}>
              {isLive ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  暫停
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  開始
                </>
              )}
            </Button>
          </div>
        </div>

        {/* 統計卡片 */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="p-4 bg-white border-[#E9E9E7] shadow-sm">
            <div className="text-sm text-[#37352F]/50">總事件數</div>
            <div className="text-2xl font-bold text-[#37352F] mt-1">{eventCount}</div>
          </Card>

          {Object.entries(eventTypeLabels).map(([type, label]) => {
            const count = events.filter((e) => e.event_type === type).length
            return (
              <Card key={type} className="p-4 bg-white border-[#E9E9E7] shadow-sm">
                <div className="text-sm text-[#37352F]/50">{label}事件</div>
                <div className="text-2xl font-bold text-[#37352F] mt-1">{count}</div>
              </Card>
            )
          })}
        </div>

        {/* 事件流 */}
        <Card className="bg-white border-[#E9E9E7] shadow-sm">
          <div className="p-4 border-b border-[#E9E9E7]">
            <h2 className="text-lg font-semibold text-[#37352F]">事件流</h2>
          </div>

          <div className="divide-y divide-[#E9E9E7]">
            {events.length === 0 ? (
              <div className="p-8 text-center text-[#37352F]/40">沒有事件數據</div>
            ) : (
              events.map((event) => (
                <div key={event.id} className="p-4 hover:bg-[#F7F6F3] transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      {/* 事件類型和名稱 */}
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={eventTypeColors[event.event_type as keyof typeof eventTypeColors]}
                        >
                          {eventTypeLabels[event.event_type as keyof typeof eventTypeLabels]}
                        </Badge>
                        <span className="font-mono text-sm font-semibold text-[#37352F]">{event.event_name}</span>
                      </div>

                      {/* 詳細資訊 */}
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-[#37352F]/60">
                        <div>
                          <span className="font-medium text-[#37352F]/70">頁面:</span> {event.page_name}
                        </div>
                        {event.component_name && (
                          <div>
                            <span className="font-medium text-[#37352F]/70">組件:</span> {event.component_name}
                          </div>
                        )}
                        <div>
                          <span className="font-medium text-[#37352F]/70">Session:</span>{" "}
                          {event.session_id.slice(0, 12)}...
                        </div>
                        {event.user_id && (
                          <div>
                            <span className="font-medium text-[#37352F]/70">用戶:</span> {event.user_id}
                          </div>
                        )}
                        <div>
                          <span className="font-medium text-[#37352F]/70">設備:</span> {event.device_type} ·{" "}
                          {event.browser} · {event.os}
                        </div>
                        {event.network_type && (
                          <div>
                            <span className="font-medium text-[#37352F]/70">網路:</span> {event.network_type}
                          </div>
                        )}
                        {event.refer && (
                          <div>
                            <span className="font-medium text-[#37352F]/70">來源:</span> {event.refer}
                          </div>
                        )}
                        {event.expose_time !== null && (
                          <div>
                            <span className="font-medium text-[#37352F]/70">曝光時長:</span> {event.expose_time}秒
                          </div>
                        )}
                      </div>

                      {/* 自訂屬性 */}
                      {event.properties && Object.keys(event.properties).length > 0 && (
                        <details className="text-xs">
                          <summary className="cursor-pointer text-[#37352F]/60 hover:text-[#37352F] font-medium">
                            自訂屬性
                          </summary>
                          <pre className="mt-2 rounded bg-[#F7F6F3] p-2 text-xs overflow-x-auto text-[#37352F]/70">
                            {JSON.stringify(event.properties, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>

                    {/* 時間戳 */}
                    <div className="text-right">
                      <div className="text-xs text-[#37352F]/60 font-medium">
                        {formatDistanceToNow(new Date(event.timestamp), {
                          addSuffix: true,
                          locale: zhTW,
                        })}
                      </div>
                      <div className="text-xs text-[#37352F]/40 mt-1">
                        {new Date(event.timestamp).toLocaleTimeString("zh-TW")}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
