"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PanelConfig } from "../analytics/page"
import { MetricsEditor } from "./editors/metrics-editor"
import { BarChartEditor } from "./editors/bar-chart-editor"
import { TrendChartEditor } from "./editors/trend-chart-editor"
import { FunnelChartEditor } from "./editors/funnel-chart-editor"

type PanelEditorProps = {
  panel: PanelConfig
  onUpdate: (config: any) => void
  onUpdateTitle: (title: string) => void
  onClose: () => void
}

export function PanelEditor({ panel, onUpdate, onUpdateTitle, onClose }: PanelEditorProps) {
  const [pendingConfig, setPendingConfig] = useState<any>(null)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [localTitle, setLocalTitle] = useState(panel.title)

  const handleApply = () => {
    if (pendingConfig) {
      onUpdate(pendingConfig)
      setPendingConfig(null)
    }
    if (localTitle !== panel.title) {
      onUpdateTitle(localTitle)
    }
  }

  const hasChanges = pendingConfig !== null || localTitle !== panel.title

  return (
    <div className="fixed right-0 top-0 h-screen w-[50vw] border-l border-[var(--color-border)] bg-[var(--color-surface-elevated)] overflow-y-auto z-[60]">
      <div className="sticky top-0 z-10 border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            {isEditingTitle ? (
              <input
                type="text"
                className="flex-1 max-w-md rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-lg font-semibold"
                value={localTitle}
                onChange={(e) => setLocalTitle(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setIsEditingTitle(false)
                }}
                autoFocus
              />
            ) : (
              <h2
                className="text-lg font-semibold cursor-pointer hover:text-[var(--color-accent-blue)]"
                onClick={() => setIsEditingTitle(true)}
              >
                {localTitle}
              </h2>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={handleApply} size="sm" disabled={!hasChanges}>
              {hasChanges ? "Apply Changes" : "No Changes"}
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {panel.type === "metrics" && (
          <MetricsEditor
            config={panel.config}
            onChange={(config) => setPendingConfig(config)}
          />
        )}
        {panel.type === "bar" && (
          <BarChartEditor
            config={panel.config}
            onChange={(config) => setPendingConfig(config)}
          />
        )}
        {panel.type === "trend" && (
          <TrendChartEditor
            config={panel.config}
            onChange={(config) => setPendingConfig(config)}
          />
        )}
        {panel.type === "funnel" && (
          <FunnelChartEditor
            config={panel.config}
            onChange={(config) => setPendingConfig(config)}
          />
        )}
      </div>
    </div>
  )
}
