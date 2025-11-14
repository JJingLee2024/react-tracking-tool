"use client"

import { ChartType } from "../analytics/page"
import { Button } from "@/components/ui/button"

type AddPanelDialogProps = {
  open: boolean
  onClose: () => void
  onSelect: (type: ChartType) => void
}

export function AddPanelDialog({ open, onClose, onSelect }: AddPanelDialogProps) {
  if (!open) return null

  const chartTypes: { type: ChartType; title: string; description: string }[] = [
    { type: "metrics", title: "Metrics Dashboard", description: "Display single metric values like total events or averages" },
    { type: "bar", title: "Bar Chart", description: "Compare multiple metrics across different dimensions" },
    { type: "trend", title: "Trend Chart", description: "Show how metrics change over time" },
    { type: "funnel", title: "Funnel Chart", description: "Track conversion rates through event sequences" },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="w-full max-w-2xl rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-6 text-xl font-semibold">Select Chart Type</h2>
        <div className="grid grid-cols-2 gap-4">
          {chartTypes.map((chart) => (
            <button
              key={chart.type}
              className="rounded-lg border border-[var(--color-border)] p-4 text-left transition-all hover:border-[var(--color-accent-blue)] hover:bg-[var(--color-surface)]"
              onClick={() => onSelect(chart.type)}
            >
              <h3 className="mb-2 font-semibold">{chart.title}</h3>
              <p className="text-sm text-[var(--color-muted)]">{chart.description}</p>
            </button>
          ))}
        </div>
        <div className="mt-6 flex justify-end">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
