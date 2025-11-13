import { formatDistanceToNow } from "date-fns"

type Session = {
  id: string
  user_id: string | null
  started_at: string
  last_seen_at: string
  page_views: number
  events_count: number
  device_type: string | null
  browser: string | null
  os: string | null
}

type SessionsTableProps = {
  sessions: Session[]
}

export function SessionsTable({ sessions }: SessionsTableProps) {
  if (sessions.length === 0) {
    return <div className="py-8 text-center text-sm text-[var(--color-muted)]">No sessions found</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[var(--color-border)] text-left text-sm text-[var(--color-muted)]">
            <th className="pb-3 font-medium">Session ID</th>
            <th className="pb-3 font-medium">Device</th>
            <th className="pb-3 font-medium">Page Views</th>
            <th className="pb-3 font-medium">Events</th>
            <th className="pb-3 font-medium">Started</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((session) => (
            <tr key={session.id} className="border-b border-[var(--color-border-subtle)] text-sm">
              <td className="py-3 font-mono text-xs">{session.id.substring(0, 16)}...</td>
              <td className="py-3 text-[var(--color-muted)]">
                {session.device_type || "Unknown"} • {session.browser || "Unknown"}
              </td>
              <td className="py-3">{session.page_views}</td>
              <td className="py-3">{session.events_count}</td>
              <td className="py-3 text-[var(--color-muted)]">
                {formatDistanceToNow(new Date(session.started_at), {
                  addSuffix: true,
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
