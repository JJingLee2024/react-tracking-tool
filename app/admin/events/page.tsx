import { createClient } from "@supabase/supabase-js"
import { EventsFilter } from "../components/events-filter"
import { EventsTable } from "../components/events-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Home } from 'lucide-react'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

type SearchParams = Promise<{
  event?: string
  session?: string
  user?: string
  page?: string
}>

async function getFilteredEvents(params: Awaited<SearchParams>) {
  let query = supabase.from("tracking_events").select("*").order("timestamp", { ascending: false }).limit(100)

  if (params.event) {
    query = query.eq("event_name", params.event)
  }

  if (params.session) {
    query = query.eq("session_id", params.session)
  }

  if (params.user) {
    query = query.eq("user_id", params.user)
  }

  const { data: events } = await query

  // Get unique event names for filter
  const { data: allEvents } = await supabase.from("tracking_events").select("event_name").limit(1000)

  const uniqueEventNames = [...new Set(allEvents?.map((e) => e.event_name) || [])].sort()

  return {
    events: events || [],
    uniqueEventNames,
  }
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams
  const { events, uniqueEventNames } = await getFilteredEvents(params)

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <Home className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/admin">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-xl font-semibold">All Events</h1>
          </div>
          <span className="text-sm text-[var(--color-muted)]">{events.length} events</span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="space-y-6">
          {/* Filters */}
          <EventsFilter eventNames={uniqueEventNames} currentFilters={params} />

          {/* Events Table */}
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6">
            <EventsTable events={events} />
          </div>
        </div>
      </main>
    </div>
  )
}
