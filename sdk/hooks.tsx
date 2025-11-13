"use client"

import { useEffect, useRef, useState } from "react"
import { Button, Element } from "./track"

// 自動追蹤按鈕點擊
export function useAutoClick(elementName: string, enabled = true) {
  const handleClick = () => {
    if (enabled) {
      Button().name(elementName).click()
    }
  }

  return { onClick: handleClick }
}

// 自動追蹤元素曝光和消失
export function useAutoExpose(elementName: string, enabled = true) {
  const ref = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const exposeStartTime = useRef<number>(0)

  useEffect(() => {
    if (!enabled || !ref.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            // 元素曝光
            setIsVisible(true)
            exposeStartTime.current = Date.now()
            Element().name(elementName).expose()
          } else if (!entry.isIntersecting && isVisible) {
            // 元素消失
            setIsVisible(false)
            const exposeTime = Math.floor((Date.now() - exposeStartTime.current) / 1000)
            Element().name(elementName).disappear(exposeTime)
            exposeStartTime.current = 0
          }
        })
      },
      {
        threshold: 0.5, // 50% 可見時觸發
      },
    )

    observer.observe(ref.current)

    return () => {
      // 清理時如果元素還在曝光狀態，發送消失事件
      if (isVisible && exposeStartTime.current > 0) {
        const exposeTime = Math.floor((Date.now() - exposeStartTime.current) / 1000)
        Element().name(elementName).disappear(exposeTime)
      }
      observer.disconnect()
    }
  }, [elementName, enabled, isVisible])

  return ref
}

// 組合 Hook：同時追蹤點擊和曝光
export function useAutoTracking(elementName: string, options = { click: true, expose: true }) {
  const exposeRef = useAutoExpose(elementName, options.expose)
  const { onClick } = useAutoClick(elementName, options.click)

  return {
    ref: exposeRef,
    onClick,
  }
}
