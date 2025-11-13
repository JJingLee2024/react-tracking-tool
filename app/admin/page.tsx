import { createClient } from "@supabase/supabase-js"
import { EventsTable } from "./components/events-table"
import { SessionsTable } from "./components/sessions-table"
import { StatsCards } from "./components/stats-cards"
import { EventChart } from "./components/event-chart"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

async function getAnalyticsData() {
  // Get total events
  const { count: totalEvents } = await supabase.from("tracking_events").select("*", { count: "exact", head: true })

  // Get total sessions
  const { count: totalSessions } = await supabase.from("tracking_sessions").select("*", { count: "exact", head: true })

  // Get unique users (count distinct user_ids that are not null)
  const { data: uniqueUsersData } = await supabase.from("tracking_events").select("user_id").not("user_id", "is", null)

  const uniqueUsers = new Set(uniqueUsersData?.map((e) => e.user_id) || []).size

  // Get recent events
  const { data: recentEvents } = await supabase
    .from("tracking_events")
    .select("*")
    .order("timestamp", { ascending: false })
    .limit(10)

  // Get recent sessions
  const { data: recentSessions } = await supabase
    .from("tracking_sessions")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(10)

  // Get event counts by name for chart
  const { data: eventCounts } = await supabase
    .from("tracking_events")
    .select("event_name")
    .order("created_at", { ascending: false })
    .limit(100)

  const eventCountMap: Record<string, number> = {}
  eventCounts?.forEach((event) => {
    eventCountMap[event.event_name] = (eventCountMap[event.event_name] || 0) + 1
  })

  return {
    totalEvents: totalEvents || 0,
    totalSessions: totalSessions || 0,
    uniqueUsers,
    recentEvents: recentEvents || [],
    recentSessions: recentSessions || [],
    eventCounts: eventCountMap,
  }
}

export default async function DashboardPage() {
  const analyticsData = await getAnalyticsData()

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <h1 className="text-xl font-semibold">Analytics Dashboard</h1>
          <Link href="/">
            <Button variant="ghost" size="sm">
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="space-y-8">
          {/* Stats Cards */}
          <StatsCards
            totalEvents={analyticsData.totalEvents}
            totalSessions={analyticsData.totalSessions}
            uniqueUsers={analyticsData.uniqueUsers}
          />

          {/* Event Chart */}
          <EventChart eventCounts={analyticsData.eventCounts} />

          {/* Recent Events */}
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent Events</h2>
              <Link href="/dashboard/events">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </div>
            <EventsTable events={analyticsData.recentEvents} />
          </div>

          {/* Recent Sessions */}
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent Sessions</h2>
              <Link href="/dashboard/sessions">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </div>
            <SessionsTable sessions={analyticsData.recentSessions} />
          </div>
        </div>
      </main>
    </div>
  )
}
