"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

type FunnelChartEditorProps = {
  config: any
  onChange: (config: any) => void
}

export function FunnelChartEditor({ config, onChange }: FunnelChartEditorProps) {
  const [localConfig, setLocalConfig] = useState(config)

  useEffect(() => {
    onChange(localConfig)
  }, [localConfig])

  const addStep = () => {
    setLocalConfig({
      ...localConfig,
      steps: [...(localConfig.steps || []), ""],
    })
  }

  const updateStep = (index: number, value: string) => {
    const newSteps = [...(localConfig.steps || [])]
    newSteps[index] = value
    setLocalConfig({ ...localConfig, steps: newSteps })
  }

  const removeStep = (index: number) => {
    const newSteps = (localConfig.steps || []).filter((_: any, i: number) => i !== index)
    setLocalConfig({ ...localConfig, steps: newSteps })
  }

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
          Unique: Count each user once per step. Total: Count all events regardless of user
        </p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Funnel Steps</label>
        <div className="space-y-2">
          {(localConfig.steps || []).map((step: string, index: number) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
                placeholder={`Step ${index + 1} event name`}
                value={step}
                onChange={(e) => updateStep(index, e.target.value)}
              />
              <Button variant="ghost" size="sm" onClick={() => removeStep(index)}>
                Remove
              </Button>
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={addStep} className="mt-2">
          Add Step
        </Button>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Time Window (days)</label>
        <input
          type="number"
          className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
          placeholder="7"
          value={localConfig.timeWindow}
          onChange={(e) => setLocalConfig({ ...localConfig, timeWindow: parseInt(e.target.value) })}
        />
        <p className="mt-1 text-xs text-[var(--color-muted)]">
          Users must complete all steps within this time window
        </p>
      </div>
    </div>
  )
}
