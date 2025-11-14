"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

type MetricsEditorProps = {
  config: any
  onChange: (config: any) => void
}

export function MetricsEditor({ config, onChange }: MetricsEditorProps) {
  const [localConfig, setLocalConfig] = useState(config)

  useEffect(() => {
    onChange(localConfig)
  }, [localConfig])

  const metrics = [
    { value: "count", label: "Event Count" },
    { value: "property", label: "Property Value" },
    { value: "change", label: "Change Amount" },
    { value: "change_percent", label: "Change Percentage" },
    { value: "avg", label: "Average Value" },
    { value: "sum", label: "Sum Value" },
  ]

  const timeRanges = [
    { value: "1d", label: "Last 24 hours" },
    { value: "7d", label: "Last 7 days" },
    { value: "30d", label: "Last 30 days" },
    { value: "90d", label: "Last 90 days" },
  ]

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
          Only applies when Metric Type is "Event Count"
        </p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Metric Type</label>
        <select
          className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
          value={localConfig.metric}
          onChange={(e) => setLocalConfig({ ...localConfig, metric: e.target.value })}
        >
          {metrics.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Event Name (optional)</label>
        <input
          type="text"
          className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
          placeholder="e.g., Click_Home_Button"
          value={localConfig.eventName}
          onChange={(e) => setLocalConfig({ ...localConfig, eventName: e.target.value })}
        />
      </div>

      {(localConfig.metric === "property" || localConfig.metric === "avg" || localConfig.metric === "sum") && (
        <div>
          <label className="mb-2 block text-sm font-medium">Property Name</label>
          <input
            type="text"
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
            placeholder="e.g., price"
            value={localConfig.propertyName || ""}
            onChange={(e) => setLocalConfig({ ...localConfig, propertyName: e.target.value })}
          />
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-medium">Time Range</label>
        <select
          className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
          value={localConfig.timeRange}
          onChange={(e) => setLocalConfig({ ...localConfig, timeRange: e.target.value })}
        >
          {timeRanges.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
