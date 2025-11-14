"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

type BarChartEditorProps = {
  config: any
  onChange: (config: any) => void
}

export function BarChartEditor({ config, onChange }: BarChartEditorProps) {
  const [localConfig, setLocalConfig] = useState(config)

  useEffect(() => {
    onChange(localConfig)
  }, [localConfig])

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <h3 className="mb-3 text-sm font-semibold">Data Filters</h3>
        <div className="space-y-3">
          <div>
            <label className="mb-2 block text-xs text-[var(--color-muted)]">Filter by Email</label>
            <input
              type="text"
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-2 text-sm"
              placeholder="user@example.com"
              value={localConfig.filter?.email || ""}
              onChange={(e) =>
                setLocalConfig({
                  ...localConfig,
                  filter: { ...localConfig.filter, email: e.target.value },
                })
              }
            />
          </div>
          <div>
            <label className="mb-2 block text-xs text-[var(--color-muted)]">Filter by Session ID</label>
            <input
              type="text"
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-2 text-sm"
              placeholder="session_123456789"
              value={localConfig.filter?.sessionId || ""}
              onChange={(e) =>
                setLocalConfig({
                  ...localConfig,
                  filter: { ...localConfig.filter, sessionId: e.target.value },
                })
              }
            />
          </div>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Count Mode</label>
        <select
          className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
          value={localConfig.countMode || "unique"}
          onChange={(e) => setLocalConfig({ ...localConfig, countMode: e.target.value })}
        >
          <option value="unique">Unique User Count</option>
          <option value="total">Total Event Count</option>
        </select>
        <p className="mt-1 text-xs text-[var(--color-muted)]">
          Choose whether to count unique users or total number of events
        </p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Event Names (comma-separated)</label>
        <input
          type="text"
          className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
          placeholder="e.g., Click_Home_Button, View_Home_Page"
          value={localConfig.eventNames?.join(", ") || ""}
          onChange={(e) =>
            setLocalConfig({
              ...localConfig,
              eventNames: e.target.value.split(",").map((s) => s.trim()),
            })
          }
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Time Range</label>
        <select
          className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
          value={localConfig.timeRange}
          onChange={(e) => setLocalConfig({ ...localConfig, timeRange: e.target.value })}
        >
          <option value="1d">Last 24 hours</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>
    </div>
  )
}
