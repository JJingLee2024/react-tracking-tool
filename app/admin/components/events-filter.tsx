"use client"

import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { X } from 'lucide-react'

type EventsFilterProps = {
  eventNames: string[]
  currentFilters: {
    event?: string
    session?: string
    user?: string
    page?: string
  }
}

export function EventsFilter({ eventNames, currentFilters }: EventsFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== "all") {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/admin/events?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push("/admin/events")
  }

  const hasFilters = currentFilters.event || currentFilters.session || currentFilters.user || currentFilters.page

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Filters</h2>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Event Name Filter */}
        <div className="space-y-2">
          <Label htmlFor="event-filter">Event Name</Label>
          <Select value={currentFilters.event || "all"} onValueChange={(value) => handleFilterChange("event", value)}>
            <SelectTrigger id="event-filter">
              <SelectValue placeholder="All events" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All events</SelectItem>
              {eventNames.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Session ID Filter */}
        <div className="space-y-2">
          <Label htmlFor="session-filter">Session ID</Label>
          <Input
            id="session-filter"
            placeholder="Enter session ID"
            value={currentFilters.session || ""}
            onChange={(e) => handleFilterChange("session", e.target.value)}
          />
        </div>

        {/* User ID Filter */}
        <div className="space-y-2">
          <Label htmlFor="user-filter">User ID</Label>
          <Input
            id="user-filter"
            placeholder="Enter user ID"
            value={currentFilters.user || ""}
            onChange={(e) => handleFilterChange("user", e.target.value)}
          />
        </div>

        {/* Page URL Filter */}
        <div className="space-y-2">
          <Label htmlFor="page-filter">Page URL</Label>
          <Input
            id="page-filter"
            placeholder="Enter page URL"
            value={currentFilters.page || ""}
            onChange={(e) => handleFilterChange("page", e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}
