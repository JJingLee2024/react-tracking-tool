"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { X, UserPlus, Trash2 } from 'lucide-react'

type PermissionsDialogProps = {
  open: boolean
  onClose: () => void
  dashboardId: string
  visibility: "private" | "public"
  onVisibilityChange: (visibility: "private" | "public") => void
}

const supabase = createClient()

export function PermissionsDialog({
  open,
  onClose,
  dashboardId,
  visibility,
  onVisibilityChange,
}: PermissionsDialogProps) {
  const [editors, setEditors] = useState<{ id: string; user_email: string }[]>([])
  const [viewers, setViewers] = useState<{ id: string; user_email: string }[]>([])
  const [newEditorEmail, setNewEditorEmail] = useState("")
  const [newViewerEmail, setNewViewerEmail] = useState("")
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      loadPermissions()
      loadUserId()
    }
  }, [open, dashboardId])

  const loadUserId = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setUserId(user.id)
    }
  }

  const loadPermissions = async () => {
    console.log("[v0] Loading permissions for dashboard:", dashboardId)
    const [{ data: editorsData }, { data: viewersData }] = await Promise.all([
      supabase.from("dashboard_editors").select("*").eq("dashboard_id", dashboardId),
      supabase.from("dashboard_viewers").select("*").eq("dashboard_id", dashboardId),
    ])

    console.log("[v0] Loaded editors:", editorsData?.length || 0, editorsData)
    console.log("[v0] Loaded viewers:", viewersData?.length || 0, viewersData)
    
    setEditors(editorsData || [])
    setViewers(viewersData || [])
  }

  const handleAddEditor = async () => {
    if (!newEditorEmail.trim() || !userId) {
      console.log("[v0] Cannot add editor - email:", newEditorEmail, "userId:", userId)
      return
    }

    console.log("[v0] Adding editor:", newEditorEmail, "to dashboard:", dashboardId, "by user:", userId)
    
    const { data, error } = await supabase.from("dashboard_editors").insert({
      dashboard_id: dashboardId,
      user_email: newEditorEmail.trim(),
      added_by: userId,
    }).select()

    console.log("[v0] Add editor result - data:", data, "error:", error)

    if (error) {
      console.error("[v0] Failed to add editor:", error)
      alert("Failed to add editor: " + error.message)
    } else {
      console.log("[v0] Editor added successfully:", data)
      alert(`Editor ${newEditorEmail} added successfully!`)
      setNewEditorEmail("")
      loadPermissions()
    }
  }

  const handleRemoveEditor = async (id: string) => {
    await supabase.from("dashboard_editors").delete().eq("id", id)
    loadPermissions()
  }

  const handleAddViewer = async () => {
    if (!newViewerEmail.trim() || !userId) {
      console.log("[v0] Cannot add viewer - email:", newViewerEmail, "userId:", userId)
      return
    }

    console.log("[v0] Adding viewer:", newViewerEmail, "to dashboard:", dashboardId, "by user:", userId)
    
    const { data, error } = await supabase.from("dashboard_viewers").insert({
      dashboard_id: dashboardId,
      user_email: newViewerEmail.trim(),
      added_by: userId,
    }).select()

    console.log("[v0] Add viewer result - data:", data, "error:", error)

    if (error) {
      console.error("[v0] Failed to add viewer:", error)
      alert("Failed to add viewer: " + error.message)
    } else {
      console.log("[v0] Viewer added successfully:", data)
      alert(`Viewer ${newViewerEmail} added successfully!`)
      setNewViewerEmail("")
      loadPermissions()
    }
  }

  const handleRemoveViewer = async (id: string) => {
    await supabase.from("dashboard_viewers").delete().eq("id", id)
    loadPermissions()
  }

  const handleVisibilityChange = async (newVisibility: "private" | "public") => {
    const { error } = await supabase
      .from("analytics_dashboards")
      .update({ visibility: newVisibility })
      .eq("id", dashboardId)

    if (error) {
      alert("Failed to update visibility")
    } else {
      onVisibilityChange(newVisibility)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Dashboard Permissions</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Visibility Settings */}
        <div className="mb-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4">
          <h3 className="mb-3 font-semibold">Visibility</h3>
          <div className="flex gap-3">
            <Button
              variant={visibility === "private" ? "default" : "ghost"}
              onClick={() => handleVisibilityChange("private")}
              size="sm"
            >
              Private
            </Button>
            <Button
              variant={visibility === "public" ? "default" : "ghost"}
              onClick={() => handleVisibilityChange("public")}
              size="sm"
            >
              Public (Anyone with link)
            </Button>
          </div>
          <p className="mt-2 text-xs text-[var(--color-muted)]">
            {visibility === "private"
              ? "Only you, editors, and viewers can access this dashboard"
              : "Anyone with the link can view this dashboard"}
          </p>
        </div>

        {/* Editors */}
        <div className="mb-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4">
          <h3 className="mb-3 font-semibold">Editors (Can edit panels)</h3>
          <div className="mb-3 flex gap-2">
            <Input
              placeholder="Enter email to add editor"
              value={newEditorEmail}
              onChange={(e) => setNewEditorEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddEditor()}
            />
            <Button onClick={handleAddEditor} size="sm" className="gap-2">
              <UserPlus className="h-4 w-4" />
              Add
            </Button>
          </div>
          <div className="space-y-2">
            {editors.length === 0 ? (
              <p className="text-sm text-[var(--color-muted)]">No editors added</p>
            ) : (
              editors.map((editor) => (
                <div key={editor.id} className="flex items-center justify-between rounded bg-[var(--color-surface)] px-3 py-2">
                  <span className="text-sm">{editor.user_email}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveEditor(editor.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Viewers (only shown for private dashboards) */}
        {visibility === "private" && (
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4">
            <h3 className="mb-3 font-semibold">Viewers (Can only view)</h3>
            <div className="mb-3 flex gap-2">
              <Input
                placeholder="Enter email to add viewer"
                value={newViewerEmail}
                onChange={(e) => setNewViewerEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddViewer()}
              />
              <Button onClick={handleAddViewer} size="sm" className="gap-2">
                <UserPlus className="h-4 w-4" />
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {viewers.length === 0 ? (
                <p className="text-sm text-[var(--color-muted)]">No viewers added</p>
              ) : (
                viewers.map((viewer) => (
                  <div key={viewer.id} className="flex items-center justify-between rounded bg-[var(--color-surface)] px-3 py-2">
                    <span className="text-sm">{viewer.user_email}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveViewer(viewer.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
