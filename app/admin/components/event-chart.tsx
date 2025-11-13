"use client"

import { BarChart3 } from "lucide-react"

type EventChartProps = {
  eventCounts: Record<string, number>
}

export function EventChart({ eventCounts }: EventChartProps) {
  const entries = Object.entries(eventCounts).sort((a, b) => b[1] - a[1])
  const maxCount = Math.max(...entries.map(([, count]) => count), 1)

  if (entries.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
        <div className="text-center">
          <BarChart3 className="mx-auto h-12 w-12 text-[var(--color-muted)]" />
          <p className="mt-2 text-sm text-[var(--color-muted)]">No events tracked yet</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6">
      <h2 className="mb-6 text-lg font-semibold">Event Distribution</h2>
      <div className="space-y-4">
        {entries.map(([eventName, count]) => {
          const percentage = (count / maxCount) * 100
          return (
            <div key={eventName}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium">{eventName}</span>
                <span className="text-[var(--color-muted)]">{count}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-surface)]">
                <div
                  className="h-full rounded-full bg-[var(--color-accent-blue)] transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
