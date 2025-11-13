"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Page, Button as TrackButton, Element } from "@/sdk/track"
import { TrackedButton, TrackedElement } from "@/sdk/components"
import Link from "next/link"
import { ArrowLeft, Zap, MousePointer, Eye, EyeOff, KeyboardIcon } from "lucide-react"

export default function TestPage() {
  const [customEventName, setCustomEventName] = useState("")
  const [eventLog, setEventLog] = useState<Array<{ name: string; type: string; time: string }>>([])
  const [showExposeTarget, setShowExposeTarget] = useState(true)

  useEffect(() => {
    Page().name("TestPage").view()
  }, [])

  const logEvent = (name: string, type: string) => {
    setEventLog((prev) => [
      { name, type, time: new Date().toLocaleTimeString() },
      ...prev.slice(0, 19), // Keep last 20 events
    ])
  }

  const handleManualClick = () => {
    TrackButton().name("ManualClickButton").click({ test: "manual" })
    logEvent("Click_TestPage_ManualClickButton", "click")
  }

  const handleExposeTest = () => {
    Element().name("ExposeTestCard").expose()
    logEvent("Expose_TestPage_ExposeTestCard", "expose")
  }

  const handleDisappearTest = () => {
    Element().name("DisappearTestCard").disappear(5000)
    logEvent("Disappear_TestPage_DisappearTestCard", "disappear")
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (customEventName.trim()) {
      TrackButton().name(customEventName).click({ source: "custom_form" })
      logEvent(`Click_TestPage_${customEventName}`, "click")
      setCustomEventName("")
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)]">
      <div className="mx-auto max-w-5xl px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)] mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            返回首頁
          </Link>
          <h1 className="text-3xl font-bold text-balance">埋點測試頁面</h1>
          <p className="mt-2 text-[var(--color-muted)] leading-relaxed">
            測試所有四種埋點類型：View（頁面瀏覽）、Click（點擊）、Expose（曝光）、Disappear（消失）
          </p>
        </div>

        {/* Event Types Documentation */}
        <Card className="border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6 mb-8">
          <h3 className="font-semibold mb-4 text-lg">埋點規格說明</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <code className="text-sm bg-[var(--color-background)] px-2 py-1 rounded">
                Page().name("PageName").view()
              </code>
              <p className="text-sm text-[var(--color-muted)]">頁面瀏覽事件</p>
            </div>
            <div className="space-y-2">
              <code className="text-sm bg-[var(--color-background)] px-2 py-1 rounded">
                Button().name("BtnName").click()
              </code>
              <p className="text-sm text-[var(--color-muted)]">按鈕點擊事件</p>
            </div>
            <div className="space-y-2">
              <code className="text-sm bg-[var(--color-background)] px-2 py-1 rounded">
                Element().name("ElName").expose()
              </code>
              <p className="text-sm text-[var(--color-muted)]">元素曝光事件</p>
            </div>
            <div className="space-y-2">
              <code className="text-sm bg-[var(--color-background)] px-2 py-1 rounded">
                Element().name("ElName").disappear()
              </code>
              <p className="text-sm text-[var(--color-muted)]">元素消失事件</p>
            </div>
          </div>
        </Card>

        {/* Test Actions Grid */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {/* Manual Click Event */}
          <Card className="border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <MousePointer className="h-5 w-5 text-[var(--color-accent-blue)]" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2">手動點擊事件</h3>
                <p className="text-sm text-[var(--color-muted)] mb-4 leading-relaxed">
                  使用 Button().name().click() API
                </p>
                <Button
                  onClick={handleManualClick}
                  className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  手動點擊
                </Button>
              </div>
            </div>
          </Card>

          {/* Auto-tracked Click */}
          <Card className="border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                <Zap className="h-5 w-5 text-[var(--color-accent-emerald)]" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2">自動追蹤點擊</h3>
                <p className="text-sm text-[var(--color-muted)] mb-4 leading-relaxed">使用 TrackedButton 組件</p>
                <TrackedButton
                  trackingName="AutoClickButton"
                  onClick={() => logEvent("Click_TestPage_AutoClickButton", "click")}
                  className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  自動追蹤點擊
                </TrackedButton>
              </div>
            </div>
          </Card>

          {/* Expose Event */}
          <Card className="border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                <Eye className="h-5 w-5 text-[var(--color-accent-amber)]" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2">曝光事件</h3>
                <p className="text-sm text-[var(--color-muted)] mb-4 leading-relaxed">手動觸發 Element().expose()</p>
                <Button
                  onClick={handleExposeTest}
                  variant="outline"
                  className="border-[var(--color-border)] bg-transparent"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  觸發曝光
                </Button>
              </div>
            </div>
          </Card>

          {/* Disappear Event */}
          <Card className="border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/10">
                <EyeOff className="h-5 w-5 text-[var(--color-accent-rose)]" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2">消失事件</h3>
                <p className="text-sm text-[var(--color-muted)] mb-4 leading-relaxed">手動觸發 Element().disappear()</p>
                <Button
                  onClick={handleDisappearTest}
                  variant="outline"
                  className="border-[var(--color-border)] bg-transparent"
                >
                  <EyeOff className="h-4 w-4 mr-2" />
                  觸發消失
                </Button>
              </div>
            </div>
          </Card>

          {/* Custom Event */}
          <Card className="border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6 md:col-span-2">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
                <KeyboardIcon className="h-5 w-5 text-violet-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2">自訂事件名稱</h3>
                <p className="text-sm text-[var(--color-muted)] mb-4 leading-relaxed">
                  輸入自訂元件名稱，將生成格式: Click_TestPage_[YourName]
                </p>
                <form onSubmit={handleFormSubmit} className="flex gap-2 max-w-md">
                  <Input
                    value={customEventName}
                    onChange={(e) => setCustomEventName(e.target.value)}
                    placeholder="ComponentName"
                    className="flex-1 bg-[var(--color-background)] border-[var(--color-border)]"
                  />
                  <Button type="submit">Send</Button>
                </form>
              </div>
            </div>
          </Card>
        </div>

        {/* Auto Expose/Disappear Demo */}
        <Card className="border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">自動曝光/消失追蹤示範</h3>
            <Button onClick={() => setShowExposeTarget(!showExposeTarget)} variant="outline" size="sm">
              {showExposeTarget ? "隱藏元素" : "顯示元素"}
            </Button>
          </div>
          <p className="text-sm text-[var(--color-muted)] mb-4 leading-relaxed">
            使用 TrackedElement 組件自動追蹤元素的曝光和消失事件（基於 Intersection Observer）
          </p>
          {showExposeTarget && (
            <TrackedElement
              trackingName="AutoExposeCard"
              className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20"
            >
              <div className="flex items-center gap-3">
                <Eye className="h-5 w-5 text-blue-400" />
                <div>
                  <p className="font-medium">自動追蹤卡片</p>
                  <p className="text-sm text-[var(--color-muted)]">
                    當此卡片 50% 可見時會觸發 Expose 事件，完全消失時觸發 Disappear 事件
                  </p>
                </div>
              </div>
            </TrackedElement>
          )}
        </Card>

        {/* Event Log */}
        <Card className="border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6">
          <h3 className="font-semibold mb-4">最近事件記錄（Client-side Log）</h3>
          {eventLog.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)]">還沒有事件記錄，試試上面的互動功能</p>
          ) : (
            <div className="space-y-2">
              {eventLog.map((event, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-md bg-[var(--color-background)] px-3 py-2 text-sm"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className="font-mono text-xs text-[var(--color-accent-blue)] bg-blue-500/10 px-2 py-1 rounded">
                      {event.type}
                    </span>
                    <span className="font-mono text-sm">{event.name}</span>
                  </div>
                  <span className="text-[var(--color-muted)] text-xs">{event.time}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* View Dashboard Link */}
        <div className="mt-8 text-center space-y-3">
          <div className="flex gap-3 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]">
                查看儀表板
              </Button>
            </Link>
            <Link href="/dashboard/live-log">
              <Button size="lg" variant="outline" className="border-[var(--color-border)] bg-transparent">
                查看即時 Log
              </Button>
            </Link>
          </div>
          <p className="text-sm text-[var(--color-muted)]">
            查看儀表板或即時 Log 以檢視所有追蹤的事件（即時 Log 每 2 秒自動刷新）
          </p>
        </div>
      </div>
    </div>
  )
}
