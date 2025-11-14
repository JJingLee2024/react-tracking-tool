"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Copy, Check } from 'lucide-react'
import { useState } from "react"

type ShareDialogProps = {
  open: boolean
  onClose: () => void
  dashboardId: string
  visibility: "private" | "public"
}

export function ShareDialog({ open, onClose, dashboardId, visibility }: ShareDialogProps) {
  const [copied, setCopied] = useState(false)
  const shareUrl = `${window.location.origin}/admin/analytics?analytics_id=${dashboardId}`

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Share Dashboard</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {visibility === "public" ? (
          <>
            <p className="mb-4 text-sm text-[var(--color-muted)]">
              Anyone with this link can view the dashboard
            </p>
            <div className="flex gap-2">
              <Input value={shareUrl} readOnly />
              <Button onClick={handleCopy} size="sm" className="gap-2">
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <p className="text-sm text-[var(--color-muted)]">
            This dashboard is private. Change visibility to "Public" in Permissions to enable sharing.
          </p>
        )}
      </div>
    </div>
  )
}
