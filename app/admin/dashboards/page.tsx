"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Heart, Plus, User, Home } from 'lucide-react'

type Dashboard = {
  id: string
  title: string
  created_at: string
  updated_at: string
  creator_id: string | null
  creator_email?: string | null
  panels: any[]
  visibility: string
  is_favorite?: boolean
}

type Tab = "created" | "shared" | "favorites" | "explore"

const supabase = createClient()

export default function DashboardsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("created")
  const [dashboards, setDashboards] = useState<Dashboard[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setUserId(user.id)
        setUserEmail(user.email || null)
      }
    }
    init()
  }, [])

  useEffect(() => {
    if (userId !== null) {
      loadDashboards(activeTab)
    } else {
      setIsLoading(false)
    }
  }, [userId, userEmail, activeTab])

  const loadDashboards = async (tab: Tab) => {
    setIsLoading(true)
    
    if (!userId && tab !== "explore") {
      setDashboards([])
      setIsLoading(false)
      return
    }

    let query

    if (tab === "created") {
      if (!userId) {
        setDashboards([])
        setIsLoading(false)
        return
      }

      query = supabase
        .from("analytics_dashboards")
        .select("*")
        .eq("creator_id", userId)
        .order("updated_at", { ascending: false })
    } else if (tab === "shared") {
      if (!userEmail) {
        setDashboards([])
        setIsLoading(false)
        return
      }

      const { data: editorDashboards } = await supabase
        .from("dashboard_editors")
        .select("dashboard_id")
        .eq("user_email", userEmail)

      const { data: viewerDashboards } = await supabase
        .from("dashboard_viewers")
        .select("dashboard_id")
        .eq("user_email", userEmail)
      
      const editorIds = editorDashboards?.map((e) => e.dashboard_id) || []
      const viewerIds = viewerDashboards?.map((v) => v.dashboard_id) || []
      const dashboardIds = [...new Set([...editorIds, ...viewerIds])]

      if (dashboardIds.length === 0) {
        setDashboards([])
        setIsLoading(false)
        return
      }

      query = supabase
        .from("analytics_dashboards")
        .select("*")
        .in("id", dashboardIds)
        .order("updated_at", { ascending: false })
    } else if (tab === "favorites") {
      if (!userId) {
        setDashboards([])
        setIsLoading(false)
        return
      }

      const { data: favs } = await supabase
        .from("dashboard_favorites")
        .select("dashboard_id")
        .eq("user_id", userId)

      const dashboardIds = favs?.map((f) => f.dashboard_id) || []

      if (dashboardIds.length === 0) {
        setDashboards([])
        setIsLoading(false)
        return
      }

      query = supabase
        .from("analytics_dashboards")
        .select("*")
        .in("id", dashboardIds)
        .order("updated_at", { ascending: false })
    } else {
      query = supabase
        .from("analytics_dashboards")
        .select("*")
        .eq("visibility", "public")
        .order("updated_at", { ascending: false })
    }

    const { data, error } = await query

    if (error) {
      console.error("[v0] Error loading dashboards:", error)
      setDashboards([])
    } else {
      if (userId) {
        const { data: favs } = await supabase
          .from("dashboard_favorites")
          .select("dashboard_id")
          .eq("user_id", userId)
          .in("dashboard_id", (data || []).map((d) => d.id))

        const favSet = new Set(favs?.map((f) => f.dashboard_id) || [])
        setDashboards(
          (data || []).map((d) => ({
            ...d,
            is_favorite: favSet.has(d.id),
          }))
        )
      } else {
        setDashboards(data || [])
      }
    }
    setIsLoading(false)
  }

  const handleTabChange = async (tab: Tab) => {
    setActiveTab(tab)
  }

  const handleCreateDashboard = async () => {
    if (!userId) {
      alert("Please log in to create a dashboard")
      return
    }

    const { data, error } = await supabase
      .from("analytics_dashboards")
      .insert({
        session_id: null,
        creator_id: userId,
        creator_email: userEmail,
        title: `New Dashboard ${dashboards.length + 1}`,
        panels: [],
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating dashboard:", error.message || error)
      alert(`Failed to create dashboard: ${error.message || 'Unknown error'}`)
    } else {
      window.location.href = `/admin/analytics?analytics_id=${data.id}`
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Dashboard Management</h1>
            <div className="flex gap-2">
              <Button onClick={handleCreateDashboard} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Dashboard
              </Button>
              <Link href="/">
                <Button variant="ghost" size="icon">
                  <Home className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/admin">
                <Button variant="ghost">Admin</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex gap-4 border-b">
          <button
            onClick={() => handleTabChange("created")}
            className={`pb-3 text-sm font-medium transition-colors ${
              activeTab === "created"
                ? "border-b-2 border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Your Dashboards
          </button>
          <button
            onClick={() => handleTabChange("shared")}
            className={`pb-3 text-sm font-medium transition-colors ${
              activeTab === "shared"
                ? "border-b-2 border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Co-work with You
          </button>
          <button
            onClick={() => handleTabChange("favorites")}
            className={`pb-3 text-sm font-medium transition-colors ${
              activeTab === "favorites"
                ? "border-b-2 border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Favorites
          </button>
          <button
            onClick={() => handleTabChange("explore")}
            className={`pb-3 text-sm font-medium transition-colors ${
              activeTab === "explore"
                ? "border-b-2 border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Explore
          </button>
        </div>

        {dashboards.length === 0 ? (
          <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
            <div className="text-center">
              <p className="mb-2 text-muted-foreground">
                {activeTab === "created"
                  ? "No dashboards yet"
                  : activeTab === "shared"
                  ? "No dashboards co-worked with you"
                  : activeTab === "favorites"
                  ? "No favorite dashboards"
                  : "No public dashboards available"}
              </p>
              {activeTab === "created" && (
                <Button onClick={handleCreateDashboard} size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Your First Dashboard
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {dashboards.map((dashboard) => (
              <Link
                key={dashboard.id}
                href={`/admin/analytics?analytics_id=${dashboard.id}`}
                className="group block"
              >
                <div className="rounded-lg border bg-card p-4 transition-all hover:border-primary hover:shadow-lg">
                  <div className="mb-3 flex items-start justify-between">
                    <h3 className="font-semibold group-hover:text-primary">
                      {dashboard.title}
                    </h3>
                    {dashboard.is_favorite && (
                      <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                    )}
                  </div>
                  {dashboard.creator_email && (
                    <div className="mb-2 flex items-center gap-1 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>{dashboard.creator_email}</span>
                    </div>
                  )}
                  <p className="mb-2 text-xs text-muted-foreground">
                    {dashboard.panels?.length || 0} panels
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Updated {new Date(dashboard.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
