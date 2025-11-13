import { formatDistanceToNow } from "date-fns"

type Event = {
  id: string
  event_name: string
  session_id: string
  user_id: string | null
  properties: Record<string, unknown>
  page_url: string | null
  timestamp: string
}

type EventsTableProps = {
  events: Event[]
}

export function EventsTable({ events }: EventsTableProps) {
  if (events.length === 0) {
    return <div className="py-8 text-center text-sm text-[var(--color-muted)]">No events found</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[var(--color-border)] text-left text-sm text-[var(--color-muted)]">
            <th className="pb-3 font-medium">Event</th>
            <th className="pb-3 font-medium">Session ID</th>
            <th className="pb-3 font-medium">Page</th>
            <th className="pb-3 font-medium">Time</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.id} className="border-b border-[var(--color-border-subtle)] text-sm">
              <td className="py-3 font-medium">{event.event_name}</td>
              <td className="py-3 font-mono text-xs text-[var(--color-muted)]">
                {event.session_id.substring(0, 12)}...
              </td>
              <td className="py-3 text-[var(--color-muted)]">
                {event.page_url ? new URL(event.page_url).pathname : "-"}
              </td>
              <td className="py-3 text-[var(--color-muted)]">
                {formatDistanceToNow(new Date(event.timestamp), {
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
