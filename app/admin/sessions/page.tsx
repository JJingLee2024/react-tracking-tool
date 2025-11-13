import { createClient } from "@supabase/supabase-js"
import { SessionsTable } from "../components/sessions-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

async function getAllSessions() {
  const { data: sessions } = await supabase
    .from("tracking_sessions")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(100)

  return sessions || []
}

export default async function SessionsPage() {
  const sessions = await getAllSessions()

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-xl font-semibold">All Sessions</h1>
          </div>
          <span className="text-sm text-[var(--color-muted)]">{sessions.length} sessions</span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6">
          <SessionsTable sessions={sessions} />
        </div>
      </main>
    </div>
  )
}
