"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export type AnalyticsFilter = {
  sessionId?: string
  email?: string
}

type AnalyticsFilterProps = {
  filter: AnalyticsFilter
  onChange: (filter: AnalyticsFilter) => void
}

export function AnalyticsFilter({ filter, onChange }: AnalyticsFilterProps) {
  const [localSessionId, setLocalSessionId] = useState(filter.sessionId || "")
  const [localEmail, setLocalEmail] = useState(filter.email || "")
  const [isExpanded, setIsExpanded] = useState(false)

  const handleApply = () => {
    onChange({
      sessionId: localSessionId || undefined,
      email: localEmail || undefined,
    })
    setIsExpanded(false)
  }

  const handleClear = () => {
    setLocalSessionId("")
    setLocalEmail("")
    onChange({})
  }

  const hasActiveFilters = filter.sessionId || filter.email

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-[var(--color-muted)]">Filter Data</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-6 px-2 text-xs"
        >
          {isExpanded ? "Hide" : "Show"}
        </Button>
      </div>

      {!isExpanded && hasActiveFilters && (
        <div className="mt-2 flex flex-wrap gap-1">
          {filter.sessionId && (
            <span className="rounded bg-[var(--color-accent-blue)]/10 px-2 py-0.5 text-xs text-[var(--color-accent-blue)]">
              Session: {filter.sessionId.slice(0, 12)}...
            </span>
          )}
          {filter.email && (
            <span className="rounded bg-[var(--color-accent-green)]/10 px-2 py-0.5 text-xs text-[var(--color-accent-green)]">
              Email: {filter.email}
            </span>
          )}
        </div>
      )}

      {isExpanded && (
        <div className="mt-3 space-y-2">
          <div>
            <label className="mb-1 block text-xs text-[var(--color-muted)]">Session ID</label>
            <Input
              placeholder="Filter by session ID..."
              value={localSessionId}
              onChange={(e) => setLocalSessionId(e.target.value)}
              className="h-7 text-xs"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-[var(--color-muted)]">Email (User ID)</label>
            <Input
              placeholder="Filter by email..."
              value={localEmail}
              onChange={(e) => setLocalEmail(e.target.value)}
              className="h-7 text-xs"
            />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleApply} className="h-7 flex-1 text-xs">
              Apply
            </Button>
            {hasActiveFilters && (
              <Button size="sm" variant="ghost" onClick={handleClear} className="h-7 text-xs">
                Clear
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
