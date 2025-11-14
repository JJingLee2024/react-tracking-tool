// React 追蹤 SDK - 符合新規格
// 支援鏈式 API: Page().name("xx").view(), Button().name("xx").click()

type EventType = "view" | "click" | "expose" | "disappear"

interface TrackingConfig {
  userId?: string
  companyId?: string
  apiEndpoint?: string
}

interface TrackingEvent {
  eventType: EventType
  eventName: string
  pageName: string
  componentName?: string
  timestamp: string
  refer?: string
  exposeTime?: number
  userId?: string
  companyId?: string
  sessionId: string
  deviceType?: string
  deviceModel?: string
  os?: string
  osVersion?: string
  browser?: string
  browserVersion?: string
  networkType?: string
  networkEffectiveType?: string
  pageUrl: string
  pageTitle: string
  viewportWidth: number
  viewportHeight: number
  properties?: Record<string, any>
}

class Tracker {
  private static instance: Tracker
  private config: TrackingConfig = {}
  private sessionId: string
  private eventQueue: TrackingEvent[] = []
  private queueTimer: NodeJS.Timeout | null = null
  private currentPage = ""
  private referPage = ""

  private constructor() {
    this.sessionId = this.getOrCreateSessionId()
    this.initAutoTracking()
    this.startQueueTimer()
  }

  static getInstance(): Tracker {
    if (!Tracker.instance) {
      Tracker.instance = new Tracker()
    }
    return Tracker.instance
  }

  // 配置全局參數
  configure(config: TrackingConfig) {
    this.config = { ...this.config, ...config }
  }

  // 獲取或創建 Session ID
  private getOrCreateSessionId(): string {
    if (typeof window === "undefined") return ""

    let sessionId = sessionStorage.getItem("tracker_session_id")
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem("tracker_session_id", sessionId)
    }
    return sessionId
  }

  // 初始化自動追蹤
  private initAutoTracking() {
    if (typeof window === "undefined") return

    // 自動追蹤頁面切換
    this.trackPageChange()

    // 監聽頁面關閉事件
    window.addEventListener("beforeunload", () => {
      this.flush()
    })

    // 監聽頁面可見性變化
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.flush()
      }
    })
  }

  // 追蹤頁面變化
  private trackPageChange() {
    if (typeof window === "undefined") return

    const updatePage = () => {
      const newPage = window.location.pathname
      
      // 只有當頁面真的改變時才更新
      if (newPage !== this.currentPage) {
        this.referPage = this.currentPage // 將當前頁面記錄為上一頁
        this.currentPage = newPage // 更新當前頁面
        
        console.log("[v0] Page changed from", this.referPage, "to", this.currentPage)
      }
    }

    // 初始化當前頁面（首次載入時沒有 refer）
    this.currentPage = window.location.pathname

    // 監聽路由變化（針對 SPA）
    const originalPushState = history.pushState
    const originalReplaceState = history.replaceState

    history.pushState = function (...args) {
      originalPushState.apply(this, args)
      updatePage()
      window.dispatchEvent(new Event("pushstate"))
    }

    history.replaceState = function (...args) {
      originalReplaceState.apply(this, args)
      updatePage()
      window.dispatchEvent(new Event("replacestate"))
    }

    window.addEventListener("popstate", updatePage)
    window.addEventListener("pushstate", updatePage)
    window.addEventListener("replacestate", updatePage)
  }

  // 啟動隊列定時器（每 15 秒發送一次）
  private startQueueTimer() {
    if (typeof window === "undefined") return

    this.queueTimer = setInterval(() => {
      if (this.eventQueue.length > 0) {
        this.flush()
      }
    }, 15000)
  }

  // 收集設備資訊
  private getDeviceInfo() {
    if (typeof window === "undefined") return {}

    const ua = navigator.userAgent

    // 檢測設備類型
    const isMobile = /Mobile|Android|iPhone/i.test(ua)
    const isTablet = /iPad|Tablet/i.test(ua)
    const deviceType = isMobile ? "mobile" : isTablet ? "tablet" : "desktop"

    // 檢測作業系統
    let os = "unknown"
    let osVersion = ""
    if (/Windows NT (\d+\.\d+)/.test(ua)) {
      os = "Windows"
      osVersion = RegExp.$1
    } else if (/Mac OS X (\d+[._]\d+)/.test(ua)) {
      os = "macOS"
      osVersion = RegExp.$1.replace("_", ".")
    } else if (/Android (\d+\.\d+)/.test(ua)) {
      os = "Android"
      osVersion = RegExp.$1
    } else if (/iPhone OS (\d+_\d+)/.test(ua)) {
      os = "iOS"
      osVersion = RegExp.$1.replace("_", ".")
    }

    // 檢測瀏覽器
    let browser = "unknown"
    let browserVersion = ""
    if (/Chrome\/(\d+)/.test(ua) && !/Edg/.test(ua)) {
      browser = "Chrome"
      browserVersion = RegExp.$1
    } else if (/Firefox\/(\d+)/.test(ua)) {
      browser = "Firefox"
      browserVersion = RegExp.$1
    } else if (/Safari\/(\d+)/.test(ua) && !/Chrome/.test(ua)) {
      browser = "Safari"
      browserVersion = RegExp.$1
    } else if (/Edg\/(\d+)/.test(ua)) {
      browser = "Edge"
      browserVersion = RegExp.$1
    }

    return {
      deviceType,
      deviceModel: deviceType,
      os,
      osVersion,
      browser,
      browserVersion,
    }
  }

  // 獲取網路資訊
  private getNetworkInfo() {
    if (typeof window === "undefined" || !("connection" in navigator)) {
      return {}
    }

    const connection =
      (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection

    if (!connection) return {}

    return {
      networkType: connection.type || "unknown",
      networkEffectiveType: connection.effectiveType || "unknown",
    }
  }

  // 添加事件到隊列
  private addToQueue(event: TrackingEvent) {
    this.eventQueue.push(event)
    console.log("[v0] Event queued:", event.eventName, "Queue size:", this.eventQueue.length)
  }

  // 發送隊列中的所有事件
  async flush() {
    if (this.eventQueue.length === 0) return

    const events = [...this.eventQueue]
    this.eventQueue = []

    console.log("[v0] Flushing events:", events.length)

    try {
      const endpoint = this.config.apiEndpoint || "/api/track"
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] Failed to send events:", response.status, response.statusText, errorText)
        // 失敗時重新加入隊列
        this.eventQueue.unshift(...events)
      } else {
        console.log("[v0] Events sent successfully")
      }
    } catch (error) {
      console.error("[v0] Error sending events:", error instanceof Error ? error.message : String(error), error)
      // 失敗時重新加入隊列
      this.eventQueue.unshift(...events)
    }
  }

  // 創建追蹤事件
  private createEvent(
    eventType: EventType,
    eventName: string,
    pageName: string,
    componentName?: string,
    properties?: Record<string, any>,
  ): TrackingEvent {
    const deviceInfo = this.getDeviceInfo()
    const networkInfo = this.getNetworkInfo()

    return {
      eventType,
      eventName,
      pageName,
      componentName,
      timestamp: new Date().toISOString(),
      refer: this.referPage || undefined,
      userId: this.config.userId,
      companyId: this.config.companyId,
      sessionId: this.sessionId,
      ...deviceInfo,
      ...networkInfo,
      pageUrl: typeof window !== "undefined" ? window.location.href : "",
      pageTitle: typeof document !== "undefined" ? document.title : "",
      viewportWidth: typeof window !== "undefined" ? window.innerWidth : 0,
      viewportHeight: typeof window !== "undefined" ? window.innerHeight : 0,
      properties,
    }
  }

  private cleanPageName(pathname: string): string {
    // 移除開頭的斜線並分割路徑
    const parts = pathname.replace(/^\//, "").split("/").filter(Boolean)

    // 如果是根路徑，返回 "Home"
    if (parts.length === 0) {
      return "Home"
    }

    // 將路徑轉換為駝峰式命名，例如 "/test/page" -> "TestPage"
    return parts.map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("")
  }

  // 鏈式 API 建構器
  Page(pageName?: string) {
    const currentPageName =
      pageName || (typeof window !== "undefined" ? this.cleanPageName(window.location.pathname) : "")
    return {
      name: (name: string) => ({
        view: (properties?: Record<string, any>) => {
          const event = this.createEvent("view", `View_${name}`, name, undefined, properties)
          this.addToQueue(event)
        },
      }),
      view: (properties?: Record<string, any>) => {
        const event = this.createEvent("view", `View_${currentPageName}`, currentPageName, undefined, properties)
        this.addToQueue(event)
      },
    }
  }

  Button(buttonName?: string) {
    return {
      name: (name: string) => ({
        click: (properties?: Record<string, any>) => {
          const pageName = typeof window !== "undefined" ? this.cleanPageName(window.location.pathname) : ""
          const eventName = `Click_${pageName}_${name}`
          const event = this.createEvent("click", eventName, pageName, name, properties)
          this.addToQueue(event)
        },
      }),
      click: (properties?: Record<string, any>) => {
        const pageName = typeof window !== "undefined" ? this.cleanPageName(window.location.pathname) : ""
        const eventName = buttonName ? `Click_${pageName}_${buttonName}` : `Click_${pageName}_Button`
        const event = this.createEvent("click", eventName, pageName, buttonName, properties)
        this.addToQueue(event)
      },
    }
  }

  Element(elementName?: string) {
    return {
      name: (name: string) => ({
        expose: (properties?: Record<string, any>) => {
          const pageName = typeof window !== "undefined" ? this.cleanPageName(window.location.pathname) : ""
          const eventName = `Expose_${pageName}_${name}`
          const event = this.createEvent("expose", eventName, pageName, name, properties)
          this.addToQueue(event)
        },
        disappear: (exposeTime: number, properties?: Record<string, any>) => {
          const pageName = typeof window !== "undefined" ? this.cleanPageName(window.location.pathname) : ""
          const eventName = `Disappear_${pageName}_${name}`
          const event = this.createEvent("disappear", eventName, pageName, name, properties)
          event.exposeTime = exposeTime
          this.addToQueue(event)
        },
      }),
      expose: (properties?: Record<string, any>) => {
        const pageName = typeof window !== "undefined" ? this.cleanPageName(window.location.pathname) : ""
        const eventName = elementName ? `Expose_${pageName}_${elementName}` : `Expose_${pageName}_Element`
        const event = this.createEvent("expose", eventName, pageName, elementName, properties)
        this.addToQueue(event)
      },
      disappear: (exposeTime: number, properties?: Record<string, any>) => {
        const pageName = typeof window !== "undefined" ? this.cleanPageName(window.location.pathname) : ""
        const eventName = elementName ? `Disappear_${pageName}_${elementName}` : `Disappear_${pageName}_Element`
        const event = this.createEvent("disappear", eventName, pageName, elementName, properties)
        event.exposeTime = exposeTime
        this.addToQueue(event)
      },
    }
  }

  // 直接發送事件（不使用鏈式 API）
  track(eventType: EventType, eventName: string, properties?: Record<string, any>) {
    const pageName = typeof window !== "undefined" ? this.cleanPageName(window.location.pathname) : ""
    const event = this.createEvent(eventType, eventName, pageName, undefined, properties)
    this.addToQueue(event)
  }
}

// 導出單例實例
const tracker = typeof window !== "undefined" ? Tracker.getInstance() : null

// 導出便捷函數
export const configure = (config: TrackingConfig) => {
  tracker?.configure(config)
}

export const Page = (pageName?: string) => {
  return tracker?.Page(pageName) || { view: () => {}, name: () => ({ view: () => {} }) }
}

export const Button = (buttonName?: string) => {
  return tracker?.Button(buttonName) || { click: () => {}, name: () => ({ click: () => {} }) }
}

export const Element = (elementName?: string) => {
  return (
    tracker?.Element(elementName) || {
      expose: () => {},
      disappear: () => {},
      name: () => ({ expose: () => {}, disappear: () => {} }),
    }
  )
}

export const track = (eventType: EventType, eventName: string, properties?: Record<string, any>) => {
  tracker?.track(eventType, eventName, properties)
}

export const flush = () => {
  tracker?.flush()
}

export default tracker
