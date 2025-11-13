import { Activity, Users, MousePointerClick } from "lucide-react"

type StatsCardsProps = {
  totalEvents: number
  totalSessions: number
  uniqueUsers: number
}

export function StatsCards({ totalEvents, totalSessions, uniqueUsers }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
      <div className="flex items-center gap-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
          <Activity className="h-6 w-6 text-[var(--color-accent-blue)]" />
        </div>
        <div>
          <p className="text-sm text-[var(--color-muted)]">Total Events</p>
          <p className="text-2xl font-bold">{totalEvents.toLocaleString()}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10">
          <MousePointerClick className="h-6 w-6 text-[var(--color-accent-emerald)]" />
        </div>
        <div>
          <p className="text-sm text-[var(--color-muted)]">Sessions</p>
          <p className="text-2xl font-bold">{totalSessions.toLocaleString()}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/10">
          <Users className="h-6 w-6 text-[var(--color-accent-amber)]" />
        </div>
        <div>
          <p className="text-sm text-[var(--color-muted)]">Unique Users</p>
          <p className="text-2xl font-bold">{uniqueUsers.toLocaleString()}</p>
        </div>
      </div>
    </div>
  )
}
