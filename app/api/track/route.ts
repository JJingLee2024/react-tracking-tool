import { createClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

function convertEventToSnakeCase(event: any) {
  return {
    event_type: event.eventType,
    event_name: event.eventName,
    page_name: event.pageName,
    component_name: event.componentName,
    timestamp: event.timestamp,
    session_id: event.sessionId,
    user_id: event.userId,
    company_id: event.companyId,
    device_type: event.deviceType,
    device_model: event.deviceModel,
    os: event.os,
    os_version: event.osVersion,
    browser: event.browser,
    browser_version: event.browserVersion,
    network_type: event.networkType,
    network_effective_type: event.networkEffectiveType,
    page_url: event.pageUrl,
    page_title: event.pageTitle,
    viewport_width: event.viewportWidth,
    viewport_height: event.viewportHeight,
    refer: event.refer,
    expose_time: event.exposeTime,
    properties: event.properties,
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { events } = body

    if (!events || !Array.isArray(events)) {
      return NextResponse.json({ error: "Invalid request: events array is required" }, { status: 400 })
    }

    console.log("[v0] Received batch events:", events.length)

    const dbEvents = events.map(convertEventToSnakeCase)

    // 批次插入所有事件
    const { data, error } = await supabase.from("tracking_events").insert(dbEvents).select()

    if (error) {
      console.error("[v0] Supabase error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // 更新 session 統計
    const sessionIds = [...new Set(events.map((e: any) => e.sessionId))]

    for (const sessionId of sessionIds) {
      const sessionEvents = events.filter((e: any) => e.sessionId === sessionId)
      const firstEvent = sessionEvents[0]

      // 計算各類型事件數量
      const views = sessionEvents.filter((e: any) => e.eventType === "view").length
      const clicks = sessionEvents.filter((e: any) => e.eventType === "click").length
      const exposes = sessionEvents.filter((e: any) => e.eventType === "expose").length
      const disappears = sessionEvents.filter((e: any) => e.eventType === "disappear").length

      await supabase.from("tracking_sessions").upsert(
        {
          id: sessionId,
          user_id: firstEvent.userId,
          company_id: firstEvent.companyId,
          last_activity_at: new Date().toISOString(),
          total_events: sessionEvents.length,
          total_views: views,
          total_clicks: clicks,
          total_exposes: exposes,
          total_disappears: disappears,
          device_type: firstEvent.deviceType,
          device_model: firstEvent.deviceModel,
          os: firstEvent.os,
          browser: firstEvent.browser,
          entry_page: firstEvent.pageName,
        },
        {
          onConflict: "id",
          ignoreDuplicates: false,
        },
      )
    }

    console.log("[v0] Successfully saved", events.length, "events")

    return NextResponse.json({
      success: true,
      count: events.length,
      data,
    })
  } catch (error: any) {
    console.error("[v0] Unexpected error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
