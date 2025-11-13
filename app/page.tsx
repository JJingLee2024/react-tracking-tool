import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Activity, BarChart3, Users, TrendingUp } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent" />

        <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-6xl">React Analytics Tracker</h1>
            <p className="mt-6 text-lg leading-relaxed text-[var(--color-muted)]">
              Track every interaction, understand your users, and make data-driven decisions with real-time analytics
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link href="/demo">
                <Button size="lg" variant="outline" className="border-[var(--color-border)] bg-transparent">
                  Try Demo
                </Button>
              </Link>
              <Link href="/admin/live-log">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                  Live Log
                </Button>
              </Link>
              <Link href="/admin">
                <Button size="lg" className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]">
                  View Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
              <Activity className="h-6 w-6 text-[var(--color-accent-blue)]" />
            </div>
            <h3 className="text-lg font-semibold">Real-time Events</h3>
            <p className="text-sm text-[var(--color-muted)] leading-relaxed">
              Track user interactions as they happen with automatic event capture
            </p>
          </div>

          <div className="flex flex-col gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10">
              <Users className="h-6 w-6 text-[var(--color-accent-emerald)]" />
            </div>
            <h3 className="text-lg font-semibold">Session Tracking</h3>
            <p className="text-sm text-[var(--color-muted)] leading-relaxed">
              Understand user journeys with comprehensive session analytics
            </p>
          </div>

          <div className="flex flex-col gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/10">
              <BarChart3 className="h-6 w-6 text-[var(--color-accent-amber)]" />
            </div>
            <h3 className="text-lg font-semibold">Data Visualization</h3>
            <p className="text-sm text-[var(--color-muted)] leading-relaxed">
              Beautiful charts and graphs to visualize your analytics data
            </p>
          </div>

          <div className="flex flex-col gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-rose-500/10">
              <TrendingUp className="h-6 w-6 text-[var(--color-accent-rose)]" />
            </div>
            <h3 className="text-lg font-semibold">Insights & Trends</h3>
            <p className="text-sm text-[var(--color-muted)] leading-relaxed">
              Discover patterns and trends to optimize your application
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
