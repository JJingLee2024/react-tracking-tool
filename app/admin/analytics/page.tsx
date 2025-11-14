"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Home, GripVertical, Heart, Share2, Settings, ArrowLeft } from 'lucide-react'
import { AddPanelDialog } from "../components/add-panel-dialog"
import { PanelEditor } from "../components/panel-editor"
import { MetricsPanel } from "../components/panels/metrics-panel"
import { BarChartPanel } from "../components/panels/bar-chart-panel"
import { TrendChartPanel } from "../components/panels/trend-chart-panel"
import { FunnelChartPanel } from "../components/panels/funnel-chart-panel"
import { PermissionsDialog } from "../components/permissions-dialog"
import { ShareDialog } from "../components/share-dialog"
import { createClient } from "@/lib/supabase/client"
import { useSearchParams } from 'next/navigation'

export type ChartType = "metrics" | "bar" | "trend" | "funnel"

export type PanelConfig = {
  id: string
  type: ChartType
  title: string
  config: any
  filter?: {
    sessionId?: string
    email?: string
  }
}

const supabase = createClient()

export default function DashboardPage() {
  const searchParams = useSearchParams()
  const dashboardId = searchParams.get('analytics_id')

  const [panels, setPanels] = useState<PanelConfig[]>([])
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingPanel, setEditingPanel] = useState<string | null>(null)
  const [dashboardTitle, setDashboardTitle] = useState("Loading...")
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [draggedPanel, setDraggedPanel] = useState<string | null>(null)
  const [dragOverPanel, setDragOverPanel] = useState<string | null>(null)
  const [showPermissions, setShowPermissions] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  const panelRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  const mainRef = useRef<HTMLDivElement>(null)

  // Permissions
  const [canEdit, setCanEdit] = useState(false)
  const [canView, setCanView] = useState(false)
  const [isCreator, setIsCreator] = useState(false)
  const [creatorId, setCreatorId] = useState<string | null>(null)
  const [visibility, setVisibility] = useState<"private" | "public">("private")
  const [accessDenied, setAccessDenied] = useState(false)
  const [creatorEmail, setCreatorEmail] = useState<string | null>(null)

  useEffect(() => {
    if (!dashboardId) {
      setAccessDenied(true)
      setIsLoading(false)
    }
  }, [dashboardId])

  useEffect(() => {
    if (!dashboardId) return

    const initializeDashboard = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        setUserEmail(user.email || null)
      }

      // Load dashboard
      const { data: dashboard, error } = await supabase
        .from("analytics_dashboards")
        .select("*")
        .eq("id", dashboardId)
        .single()

      if (error || !dashboard) {
        console.error("[v0] Error loading dashboard:", error)
        setAccessDenied(true)
        setIsLoading(false)
        return
      }

      setDashboardTitle(dashboard.title)
      setPanels(dashboard.panels || [])
      setCreatorId(dashboard.creator_id)
      setVisibility(dashboard.visibility || "private")

      // Check permissions
      const isOwner = user && dashboard.creator_id === user.id
      setIsCreator(!!isOwner)

      if (isOwner) {
        setCanEdit(true)
        setCanView(true)
      } else if (dashboard.visibility === "public") {
        setCanView(true)
        setCanEdit(false)
      } else if (user?.email) {
        // Check if user is an editor
        const { data: editors } = await supabase
          .from("dashboard_editors")
          .select("*")
          .eq("dashboard_id", dashboardId)
          .eq("user_email", user.email)

        if (editors && editors.length > 0) {
          setCanEdit(true)
          setCanView(true)
        } else {
          // Check if user is a viewer
          const { data: viewers } = await supabase
            .from("dashboard_viewers")
            .select("*")
            .eq("dashboard_id", dashboardId)
            .eq("user_email", user.email)

          if (viewers && viewers.length > 0) {
            setCanView(true)
            setCanEdit(false)
          } else {
            setAccessDenied(true)
          }
        }
      } else {
        setAccessDenied(true)
      }

      // Load favorite status
      if (user) {
        const { data: fav } = await supabase
          .from("dashboard_favorites")
          .select("*")
          .eq("dashboard_id", dashboardId)
          .eq("user_id", user.id)
          .single()

        setIsFavorite(!!fav)
      }

      setIsLoading(false)
    }

    initializeDashboard()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUserId(session.user.id)
        setUserEmail(session.user.email || null)
      } else {
        setUserId(null)
        setUserEmail(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [dashboardId])

  useEffect(() => {
    if (editingPanel && mainRef.current) {
      const panelElement = panelRefs.current[editingPanel]
      if (!panelElement) return

      if (typeof window === 'undefined') return

      // Get panel position and dimensions
      const panelRect = panelElement.getBoundingClientRect()
      const mainRect = mainRef.current.getBoundingClientRect()
      
      // Calculate the panel's center x position relative to main container
      const panelCenterX = panelRect.left + panelRect.width / 2 - mainRect.left
      
      // Target position: 25% of window width
      const targetX = window.innerWidth * 0.25
      
      // Calculate scroll amount needed
      const scrollAmount = panelCenterX - targetX
      
      // Smooth scroll the main container
      mainRef.current.scrollTo({
        left: mainRef.current.scrollLeft + scrollAmount,
        behavior: 'smooth'
      })
    }
  }, [editingPanel])

  useEffect(() => {
    if (isLoading || !canEdit || !dashboardId) return

    const saveDashboard = async () => {
      setIsSaving(true)
      console.log("[v0] Saving dashboard with", panels.length, "panels")

      const { error } = await supabase
        .from("analytics_dashboards")
        .update({
          panels,
          title: dashboardTitle,
          updated_at: new Date().toISOString(),
        })
        .eq("id", dashboardId)

      if (error) {
        console.error("[v0] Error updating dashboard:", error)
      } else {
        console.log("[v0] Dashboard updated successfully")
      }

      setIsSaving(false)
    }

    const timeoutId = setTimeout(saveDashboard, 1000)
    return () => clearTimeout(timeoutId)
  }, [panels, dashboardTitle, dashboardId, isLoading, canEdit])

  const handleAddPanel = (type: ChartType) => {
    if (!canEdit) return
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

  const handleToggleFavorite = async () => {
    if (!userId || !dashboardId) return

    if (isFavorite) {
      await supabase
        .from("dashboard_favorites")
        .delete()
        .eq("dashboard_id", dashboardId)
        .eq("user_id", userId)
      setIsFavorite(false)
    } else {
      await supabase
        .from("dashboard_favorites")
        .insert({ dashboard_id: dashboardId, user_id: userId })
      setIsFavorite(true)
    }
  }

  const handlePanelUpdate = (id: string, config: any) => {
    setPanels(panels.map((p) => (p.id === id ? { ...p, config } : p)))
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
    if (!canEdit) return
    setDraggedPanel(panelId)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent, panelId: string) => {
    if (!canEdit) return
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverPanel(panelId)
  }

  const handleDragEnd = () => {
    setDraggedPanel(null)
    setDragOverPanel(null)
  }

  const handleDrop = (e: React.DragEvent, targetPanelId: string) => {
    if (!canEdit) return
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

  if (accessDenied) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[var(--color-background)]">
        <div className="text-center">
          <h2 className="mb-2 text-xl font-semibold">Access Denied</h2>
          <p className="mb-4 text-[var(--color-muted)]">
            {!dashboardId ? "No dashboard ID provided." : "You don't have permission to view this dashboard."}
            {creatorEmail && ` Please contact the creator: ${creatorEmail}`}
          </p>
          <Link href="/admin/dashboards">
            <Button className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboards
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboards">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Dashboards
              </Button>
            </Link>
            <div className="h-6 w-px bg-[var(--color-border)]" />
            {isEditingTitle ? (
              <input
                type="text"
                value={dashboardTitle}
                onChange={(e) => setDashboardTitle(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => e.key === "Enter" && setIsEditingTitle(false)}
                className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-xl font-semibold"
                autoFocus
                disabled={!canEdit}
              />
            ) : (
              <h1
                className={`text-xl font-semibold ${canEdit ? "cursor-pointer hover:text-[var(--color-accent-blue)]" : ""}`}
                onClick={() => canEdit && setIsEditingTitle(true)}
              >
                {dashboardTitle}
              </h1>
            )}
            {isSaving && <span className="text-xs text-[var(--color-muted)]">Saving...</span>}
          </div>
          <div className="flex gap-2">
            {userId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleFavorite}
                className="gap-2"
              >
                <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
              </Button>
            )}
            {(visibility === "public" || canEdit) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowShare(true)}
                className="gap-2"
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            )}
            {isCreator && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPermissions(true)}
                className="gap-2"
              >
                <Settings className="h-4 w-4" />
                Permissions
              </Button>
            )}
            {canEdit && (
              <Button onClick={() => setShowAddDialog(true)} size="sm">
                Add Panel
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="relative flex overflow-hidden">
        <main 
          ref={mainRef}
          className={`flex-1 transition-transform duration-300 overflow-x-auto ${editingPanel ? "-translate-x-[25vw]" : ""}`}
          style={{
            minWidth: '100vw',
            width: editingPanel ? 'calc(100vw + 50vw)' : '100vw'
          }}
        >
          <div className={`p-6 ${editingPanel ? 'ml-[25vw]' : ''}`}>
            {!canView ? (
              <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
                <p className="text-[var(--color-muted)]">You don't have permission to view this dashboard.</p>
              </div>
            ) : panels.length === 0 ? (
              <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
                <div className="text-center">
                  <p className="mb-4 text-lg text-[var(--color-muted)]">No panels yet</p>
                  {canEdit && (
                    <Button onClick={() => setShowAddDialog(true)}>Add Your First Panel</Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {panels.map((panel) => (
                  <div
                    key={panel.id}
                    ref={(el) => (panelRefs.current[panel.id] = el)}
                    draggable={canEdit}
                    onDragStart={(e) => handleDragStart(e, panel.id)}
                    onDragOver={(e) => handleDragOver(e, panel.id)}
                    onDragEnd={handleDragEnd}
                    onDrop={(e) => handleDrop(e, panel.id)}
                    className={`rounded-lg border transition-all ${
                      dragOverPanel === panel.id && draggedPanel !== panel.id
                        ? "border-[var(--color-accent-blue)] bg-[var(--color-surface)]/50"
                        : editingPanel === panel.id
                        ? "border-[var(--color-accent-blue)] bg-[var(--color-surface-elevated)] ring-2 ring-[var(--color-accent-blue)] ring-opacity-50"
                        : "border-[var(--color-border)] bg-[var(--color-surface-elevated)] hover:border-[var(--color-border-subtle)]"
                    } ${draggedPanel === panel.id ? "opacity-50" : ""}`}
                  >
                    {canEdit && (
                      <div
                        className="flex items-center gap-2 p-4 pb-0 cursor-move"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <GripVertical className="h-5 w-5 text-[var(--color-muted)]" />
                        <div className="flex-1" />
                      </div>
                    )}
                    <div className={`p-4 ${canEdit ? 'pt-2 cursor-pointer' : ''}`} onClick={() => canEdit && setEditingPanel(panel.id)}>
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="font-semibold">{panel.title}</h3>
                        {canEdit && (
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
                        )}
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
          </div>
        </main>

        {editingPanel && editingPanelData && canEdit && (
          <PanelEditor
            panel={editingPanelData}
            onUpdate={(config) => handlePanelUpdate(editingPanel, config)}
            onUpdateTitle={(title) => handlePanelTitleUpdate(editingPanel, title)}
            onClose={handleEditorClose}
          />
        )}
      </div>

      {canEdit && (
        <AddPanelDialog open={showAddDialog} onClose={() => setShowAddDialog(false)} onSelect={handleAddPanel} />
      )}

      {dashboardId && (isCreator || canEdit || visibility === "public") && (
        <ShareDialog
          open={showShare}
          onClose={() => setShowShare(false)}
          dashboardId={dashboardId}
          visibility={visibility}
        />
      )}
      
      {dashboardId && isCreator && (
        <PermissionsDialog
          open={showPermissions}
          onClose={() => setShowPermissions(false)}
          dashboardId={dashboardId}
          visibility={visibility}
          onVisibilityChange={setVisibility}
        />
      )}
    </div>
  )
}
