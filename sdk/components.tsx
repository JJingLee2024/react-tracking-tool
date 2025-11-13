"use client"

import type React from "react"

import { forwardRef, type ReactNode } from "react"
import { useAutoClick, useAutoExpose, useAutoTracking } from "./hooks"
import { Button as UIButton } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// 自動追蹤的按鈕組件
interface TrackedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  trackingName: string
  children: ReactNode
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

export const TrackedButton = forwardRef<HTMLButtonElement, TrackedButtonProps>(
  ({ trackingName, children, onClick, variant, size, ...props }, ref) => {
    const { onClick: trackClick } = useAutoClick(trackingName)

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      trackClick()
      onClick?.(e)
    }

    return (
      <UIButton ref={ref} variant={variant} size={size} onClick={handleClick} {...props}>
        {children}
      </UIButton>
    )
  },
)

TrackedButton.displayName = "TrackedButton"

// 自動追蹤曝光的容器組件
interface TrackedElementProps {
  trackingName: string
  children: ReactNode
  className?: string
  as?: React.ElementType
}

export const TrackedElement = forwardRef<HTMLElement, TrackedElementProps>(
  ({ trackingName, children, className, as: Component = "div" }, forwardedRef) => {
    const ref = useAutoExpose(trackingName)

    // 合併 refs
    const setRefs = (el: HTMLElement | null) => {
      ;(ref as any).current = el
      if (typeof forwardedRef === "function") {
        forwardedRef(el)
      } else if (forwardedRef) {
        ;(forwardedRef as any).current = el
      }
    }

    const ElementComponent = Component as any

    return (
      <ElementComponent ref={setRefs} className={className}>
        {children}
      </ElementComponent>
    )
  },
)

TrackedElement.displayName = "TrackedElement"

// 同時追蹤點擊和曝光的組件
interface TrackedInteractiveProps {
  trackingName: string
  children: ReactNode
  className?: string
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
}

export const TrackedInteractive = forwardRef<HTMLDivElement, TrackedInteractiveProps>(
  ({ trackingName, children, className, onClick: onClickProp }, forwardedRef) => {
    const { ref, onClick } = useAutoTracking(trackingName)

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      onClick()
      onClickProp?.(e)
    }

    // 合併 refs
    const setRefs = (el: HTMLDivElement | null) => {
      ;(ref as any).current = el
      if (typeof forwardedRef === "function") {
        forwardedRef(el)
      } else if (forwardedRef) {
        ;(forwardedRef as any).current = el
      }
    }

    return (
      <div ref={setRefs} className={cn("cursor-pointer", className)} onClick={handleClick}>
        {children}
      </div>
    )
  },
)

TrackedInteractive.displayName = "TrackedInteractive"
