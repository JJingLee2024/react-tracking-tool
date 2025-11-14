"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Home, GripVertical } from 'lucide-react'
import { AddPanelDialog } from "../components/add-panel-dialog"
import { PanelEditor } from "../components/panel-editor"
import { MetricsPanel } from "../components/panels/metrics-panel"
import { BarChartPanel } from "../components/panels/bar-chart-panel"
import { TrendChartPanel } from "../components/panels/trend-chart-panel"
import { FunnelChartPanel } from "../components/panels/funnel-chart-panel"
import { AnalyticsFilter, type AnalyticsFilter as FilterType } from "../components/analytics-filter"
import { createClient } from "@/lib/supabase/client"

export type ChartType = "metrics" | "bar" | "trend" | "funnel"

export type PanelConfig = {
  id: string
  type: ChartType
  title: string
  config: any
  filter?: FilterType
}

const supabase = createClient()

export default function AdvancedAnalyticsPage() {
  const [panels, setPanels] = useState<PanelConfig[]>([])
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingPanel, setEditingPanel] = useState<string | null>(null)
  const [dashboardId, setDashboardId] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string>("")
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [draggedPanel, setDraggedPanel] = useState<string | null>(null)
  const [dragOverPanel, setDragOverPanel] = useState<string | null>(null)

  useEffect(() => {
    const initializeDashboard = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
      }

      // Get or create session ID
      let sid = localStorage.getItem("analytics_session_id")
      if (!sid) {
        sid = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        localStorage.setItem("analytics_session_id", sid)
      }
      setSessionId(sid)

      let query = supabase
        .from("analytics_dashboards")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(1)

      if (user) {
        query = query.eq("creator_id", user.id)
      } else {
        query = query.eq("session_id", sid)
      }

      const { data, error } = await query.single()

      if (data && !error) {
        console.log("[v0] Loaded dashboard:", data.id)
        setDashboardId(data.id)
        setPanels(data.panels || [])
      } else {
        console.log("[v0] No existing dashboard, will create on first panel")
      }

      setIsLoading(false)
    }

    initializeDashboard()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUserId(session.user.id)
        // Update existing dashboards with user ID
        const sid = localStorage.getItem("analytics_session_id")
        if (sid) {
          await supabase
            .from("analytics_dashboards")
            .update({ creator_id: session.user.id })
            .eq("session_id", sid)
            .is("creator_id", null)
        }
      } else {
        setUserId(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (isLoading || !sessionId) return

    const saveDashboard = async () => {
      setIsSaving(true)
      console.log("[v0] Saving dashboard with", panels.length, "panels")

      if (dashboardId) {
        // Update existing dashboard
        const { error } = await supabase
          .from("analytics_dashboards")
          .update({
            panels,
            updated_at: new Date().toISOString(),
          })
          .eq("id", dashboardId)

        if (error) {
          console.error("[v0] Error updating dashboard:", error)
        } else {
          console.log("[v0] Dashboard updated successfully")
        }
      } else if (panels.length > 0) {
        const { data, error } = await supabase
          .from("analytics_dashboards")
          .insert({
            session_id: sessionId,
            creator_id: userId,
            title: "My Dashboard",
            panels,
          })
          .select()
          .single()

        if (error) {
          console.error("[v0] Error creating dashboard:", error)
        } else {
          console.log("[v0] Dashboard created:", data.id)
          setDashboardId(data.id)
        }
      }

      setIsSaving(false)
    }

    // Debounce save by 1 second
    const timeoutId = setTimeout(saveDashboard, 1000)
    return () => clearTimeout(timeoutId)
  }, [panels, dashboardId, sessionId, userId, isLoading])

  const handleAddPanel = (type: ChartType) => {
    const newPanel: PanelConfig = {
      id: `panel-${Date.now()}`,
      type,
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Panel`,
      config: getDefaultConfig(type),
    }
    setPanels([...panels, newPanel])
    setShowAddDialog(false)
    setEditingPanel(newPanel.id)
  }

  const getDefaultConfig = (type: ChartType) => {
    switch (type) {
      case "metrics":
        return { metric: "count", eventName: "", timeRange: "7d" }
      case "bar":
        return { metrics: [], eventNames: [], timeRange: "7d" }
      case "trend":
        return { metrics: [], eventNames: [], timeRange: "30d", interval: "day" }
      case "funnel":
        return { steps: [], timeWindow: 7 }
      default:
        return {}
    }
  }

  const handlePanelUpdate = (id: string, config: any) => {
    setPanels(panels.map((p) => (p.id === id ? { ...p, config } : p)))
  }

  const handlePanelFilterUpdate = (id: string, filter: FilterType) => {
    setPanels(panels.map((p) => (p.id === id ? { ...p, filter } : p)))
  }

  const handlePanelDelete = (id: string) => {
    setPanels(panels.filter((p) => p.id !== id))
    if (editingPanel === id) setEditingPanel(null)
  }

  const handleEditorClose = () => {
    setEditingPanel(null)
  }

  const handlePanelTitleUpdate = (id: string, title: string) => {
    setPanels(panels.map((p) => (p.id === id ? { ...p, title } : p)))
  }

  const handleDragStart = (e: React.DragEvent, panelId: string) => {
    setDraggedPanel(panelId)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent, panelId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverPanel(panelId)
  }

  const handleDragEnd = () => {
    setDraggedPanel(null)
    setDragOverPanel(null)
  }

  const handleDrop = (e: React.DragEvent, targetPanelId: string) => {
    e.preventDefault()
    
    if (!draggedPanel || draggedPanel === targetPanelId) {
      setDraggedPanel(null)
      setDragOverPanel(null)
      return
    }

    const draggedIndex = panels.findIndex((p) => p.id === draggedPanel)
    const targetIndex = panels.findIndex((p) => p.id === targetPanelId)

    if (draggedIndex === -1 || targetIndex === -1) return

    const newPanels = [...panels]
    const [removed] = newPanels.splice(draggedIndex, 1)
    newPanels.splice(targetIndex, 0, removed)

    setPanels(newPanels)
    setDraggedPanel(null)
    setDragOverPanel(null)
  }

  const editingPanelData = panels.find((p) => p.id === editingPanel)

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--color-background)]">
        <p className="text-[var(--color-muted)]">Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <Home className="h-4 w-4" />
                Home
              </Button>
            </Link>
            <div className="h-6 w-px bg-[var(--color-border)]" />
            <h1 className="text-xl font-semibold">Advanced Analytics</h1>
            {isSaving && <span className="text-xs text-[var(--color-muted)]">Saving...</span>}
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowAddDialog(true)} size="sm">
              Add Panel
            </Button>
            <Link href="/admin">
              <Button variant="ghost" size="sm">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="relative flex">
        {/* Main content area */}
        <main className={`flex-1 p-6 transition-all ${editingPanel ? "mr-[75vw]" : ""}`}>
          {panels.length === 0 ? (
            <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
              <div className="text-center">
                <p className="mb-4 text-lg text-[var(--color-muted)]">No panels yet</p>
                <Button onClick={() => setShowAddDialog(true)}>Add Your First Panel</Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {panels.map((panel) => (
                <div
                  key={panel.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, panel.id)}
                  onDragOver={(e) => handleDragOver(e, panel.id)}
                  onDragEnd={handleDragEnd}
                  onDrop={(e) => handleDrop(e, panel.id)}
                  className={`rounded-lg border transition-all ${
                    dragOverPanel === panel.id && draggedPanel !== panel.id
                      ? "border-[var(--color-accent-blue)] bg-[var(--color-surface)]/50"
                      : editingPanel === panel.id
                      ? "border-[var(--color-accent-blue)] bg-[var(--color-surface-elevated)]"
                      : "border-[var(--color-border)] bg-[var(--color-surface-elevated)] hover:border-[var(--color-border-subtle)]"
                  } ${draggedPanel === panel.id ? "opacity-50" : ""}`}
                >
                  <div
                    className="flex items-center gap-2 p-4 pb-0 cursor-move"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <GripVertical className="h-5 w-5 text-[var(--color-muted)]" />
                    <div className="flex-1" />
                  </div>
                  <div className="p-4 pt-2 cursor-pointer" onClick={() => setEditingPanel(panel.id)}>
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="font-semibold">{panel.title}</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handlePanelDelete(panel.id)
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                    {panel.type === "metrics" && <MetricsPanel config={panel.config} filter={panel.filter} />}
                    {panel.type === "bar" && <BarChartPanel config={panel.config} filter={panel.filter} />}
                    {panel.type === "trend" && <TrendChartPanel config={panel.config} filter={panel.filter} />}
                    {panel.type === "funnel" && <FunnelChartPanel config={panel.config} filter={panel.filter} />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Side editor */}
        {editingPanel && editingPanelData && (
          <PanelEditor
            panel={editingPanelData}
            onUpdate={(config) => handlePanelUpdate(editingPanel, config)}
            onUpdateTitle={(title) => handlePanelTitleUpdate(editingPanel, title)}
            onClose={handleEditorClose}
          />
        )}
      </div>

      {/* Add panel dialog */}
      <AddPanelDialog open={showAddDialog} onClose={() => setShowAddDialog(false)} onSelect={handleAddPanel} />
    </div>
  )
}
