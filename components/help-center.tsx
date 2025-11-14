"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Position = "left" | "right"

interface EventGroup {
  page_name: string
  events: Array<{
    event_name: string
    event_type: string
    count: number
  }>
}

export function HelpCenter() {
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [dockPosition, setDockPosition] = useState<Position>("right")
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"events">("events")
  const [searchQuery, setSearchQuery] = useState("")
  const [eventGroups, setEventGroups] = useState<EventGroup[]>([])
  const [loading, setLoading] = useState(false)
  const [hasDragged, setHasDragged] = useState(false)
  const [isClient, setIsClient] = useState(false)
  
  const dragStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const fabRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setIsClient(true)
    if (typeof window !== 'undefined') {
      setPosition({ x: window.innerWidth - 80, y: window.innerHeight / 2 })
    }
  }, [])

  useEffect(() => {
    if (isOpen && activeTab === "events") {
      loadEvents()
    }
  }, [isOpen, activeTab])

  const loadEvents = async () => {
    setLoading(true)
    console.log("[v0] Loading event dictionary...")
    
    const supabase = createClient()
    const { data, error } = await supabase
      .from("tracking_events")
      .select("event_name, event_type, page_name")
      .order("page_name", { ascending: true })
      .order("event_name", { ascending: true })

    if (error) {
      console.error("[v0] Error loading events:", error)
      setLoading(false)
      return
    }

    const groups: Record<string, EventGroup> = {}
    data.forEach((event) => {
      const pageName = event.page_name || "Unknown Page"
      if (!groups[pageName]) {
        groups[pageName] = { page_name: pageName, events: [] }
      }
      
      const existingEvent = groups[pageName].events.find(
        (e) => e.event_name === event.event_name && e.event_type === event.event_type
      )
      
      if (existingEvent) {
        existingEvent.count++
      } else {
        groups[pageName].events.push({
          event_name: event.event_name,
          event_type: event.event_type,
          count: 1,
        })
      }
    })

    const groupsArray = Object.values(groups)
    console.log("[v0] Loaded", groupsArray.length, "page groups with events")
    setEventGroups(groupsArray)
    setLoading(false)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setHasDragged(false)
    setIsDragging(true)
    dragStartPos.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return
    
    setHasDragged(true)
    
    const newX = e.clientX - dragStartPos.current.x
    const newY = e.clientY - dragStartPos.current.y
    
    setPosition({ x: newX, y: newY })
  }

  const handleMouseUp = () => {
    if (!isDragging) return
    setIsDragging(false)
    
    if (!hasDragged) return
    
    if (typeof window === 'undefined') return
    
    const windowWidth = window.innerWidth
    const snapThreshold = windowWidth / 2
    
    const targetX = position.x < snapThreshold ? 20 : windowWidth - 80
    const targetY = position.y
    
    const startX = position.x
    const startY = position.y
    const startTime = Date.now()
    const duration = 1500 // 1.5 seconds
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
      const easedProgress = easeOutCubic(progress)
      
      const currentX = startX + (targetX - startX) * easedProgress
      const currentY = startY + (targetY - startY) * easedProgress
      
      setPosition({ x: currentX, y: currentY })
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setDockPosition(position.x < snapThreshold ? "left" : "right")
      }
    }
    
    requestAnimationFrame(animate)
  }

  const handleClick = () => {
    if (!hasDragged) {
      setIsOpen(!isOpen)
    }
  }

  useEffect(() => {
    if (isDragging && typeof window !== 'undefined') {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
      
      return () => {
        window.removeEventListener("mousemove", handleMouseMove)
        window.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isDragging, position])

  const filteredGroups = eventGroups.filter((group) => {
    if (!searchQuery) return true
    
    const query = searchQuery.toLowerCase()
    const pageMatch = group.page_name.toLowerCase().includes(query)
    const eventMatch = group.events.some((event) =>
      event.event_name.toLowerCase().includes(query) || event.event_type.toLowerCase().includes(query)
    )
    
    return pageMatch || eventMatch
  })

  if (!isClient) return null

  return (
    <>
      {/* Floating Action Button */}
      <button
        ref={fabRef}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        className="fixed z-[100] w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-colors flex items-center justify-center text-xl font-bold"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          cursor: isDragging ? "grabbing" : "grab",
        }}
      >
        ?
      </button>

      {/* Sidebar */}
      {isOpen && (
        <div
          className={`fixed top-0 ${dockPosition === "left" ? "left-0" : "right-0"} h-full w-[25vw] bg-[var(--color-surface-elevated)] border-${dockPosition === "left" ? "r" : "l"} border-[var(--color-border)] z-[95] overflow-y-auto shadow-2xl`}
        >
          {/* Header */}
          <div className="sticky top-0 bg-[var(--color-surface)]/80 backdrop-blur-sm border-b border-[var(--color-border)] p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Help Center</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
              >
                ✕
              </Button>
            </div>
            
            {/* Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("events")}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  activeTab === "events"
                    ? "bg-[var(--color-primary)] text-white"
                    : "text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
                }`}
              >
                Event Dictionary
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {activeTab === "events" && (
              <div className="space-y-4">
                {/* Search */}
                <Input
                  type="text"
                  placeholder="Search events or pages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-foreground)]"
                />

                {/* Loading State */}
                {loading && (
                  <div className="text-center py-8 text-[var(--color-muted)]">
                    Loading events...
                  </div>
                )}

                {/* Event Groups */}
                {!loading && filteredGroups.length === 0 && (
                  <div className="text-center py-8 text-[var(--color-muted)]">
                    No events found
                  </div>
                )}

                {!loading && filteredGroups.map((group) => (
                  <div
                    key={group.page_name}
                    className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3"
                  >
                    <h3 className="font-semibold text-sm mb-2 text-[var(--color-foreground)]">
                      {group.page_name}
                    </h3>
                    <div className="space-y-1">
                      {group.events.map((event, idx) => (
                        <div
                          key={`${event.event_name}-${event.event_type}-${idx}`}
                          className="flex items-center justify-between text-xs py-1.5 px-2 rounded hover:bg-[var(--color-surface-elevated)] transition-colors"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-[var(--color-foreground)]">
                              {event.event_name}
                            </div>
                            <div className="text-[var(--color-muted)] text-[10px]">
                              {event.event_type}
                            </div>
                          </div>
                          <div className="text-[var(--color-muted)] text-[10px]">
                            {event.count}x
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
