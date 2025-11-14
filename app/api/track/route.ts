import { createClient } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'

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
    console.log('[v0] API /api/track called')

    const body = await request.json()
    console.log('[v0] Request body parsed:', body)

    const { events } = body

    if (!events || !Array.isArray(events)) {
      console.error('[v0] Invalid request: events not an array')
      return NextResponse.json({ error: 'Invalid request: events array is required' }, { status: 400 })
    }

    console.log('[v0] API received batch events:', events.length)

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    console.log('[v0] Supabase client created')

    const dbEvents = events.map(convertEventToSnakeCase)

    console.log('[v0] Inserting events into database...')

    const { data, error } = await supabase.from('tracking_events').insert(dbEvents).select()

    if (error) {
      console.error('[v0] Supabase insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('[v0] Events inserted successfully:', data?.length)

    try {
      const sessionIds = [...new Set(events.map((e: any) => e.sessionId))]

      for (const sessionId of sessionIds) {
        const sessionEvents = events.filter((e: any) => e.sessionId === sessionId)
        const firstEvent = sessionEvents[0]

        const views = sessionEvents.filter((e: any) => e.eventType === 'view').length
        const clicks = sessionEvents.filter((e: any) => e.eventType === 'click').length
        const exposes = sessionEvents.filter((e: any) => e.eventType === 'expose').length
        const disappears = sessionEvents.filter((e: any) => e.eventType === 'disappear').length

        const { error: sessionError } = await supabase.from('tracking_sessions').upsert(
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
            onConflict: 'id',
            ignoreDuplicates: false,
          }
        )

        if (sessionError) {
          console.error('[v0] Session upsert error:', sessionError)
        }
      }
    } catch (sessionError) {
      console.error('[v0] Error updating sessions:', sessionError)
    }

    console.log('[v0] Successfully saved', events.length, 'events')

    return NextResponse.json({
      success: true,
      count: events.length,
      data,
    })
  } catch (error: any) {
    console.error('[v0] Unexpected error in /api/track:', error)
    console.error('[v0] Error stack:', error.stack)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
