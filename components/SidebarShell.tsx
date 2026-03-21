'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Box } from '@radix-ui/themes'
import { Sidebar } from '@/components/Sidebar'
import { BreadcrumbNav } from '@/components/BreadcrumbNav'
import type { UserRole } from '@/lib/layout-data'

// Matches --duration-fast in globals.css
const DURATION_FAST_MS = 150

interface SidebarShellProps {
  user: { email: string; firstName: string | null; lastName: string | null }
  practice: { name: string; tier: string } | null
  role: UserRole
  children: React.ReactNode
}

export function SidebarShell({ user, practice, role, children }: SidebarShellProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const expandTriggerRef = useRef<HTMLButtonElement | null>(null)
  const sidebarRef = useRef<HTMLElement | null>(null)

  const isOverlay = () => typeof window !== 'undefined' && window.innerWidth < 1024

  // Animated close: play scrim-out then collapse
  const handleCollapse = useCallback(() => {
    if (isOverlay()) {
      setIsClosing(true)
      setTimeout(() => {
        setCollapsed(true)
        setIsClosing(false)
        expandTriggerRef.current?.focus()
      }, DURATION_FAST_MS)
    } else {
      setCollapsed(true)
    }
  }, [])

  const handleExpand = useCallback(() => {
    setCollapsed(false)
  }, [])

  // Focus trap: active when sidebar is open in overlay mode (below lg)
  useEffect(() => {
    if (collapsed || !isOverlay()) return

    const sidebar = sidebarRef.current
    if (!sidebar) return

    const getFocusable = () =>
      Array.from(
        sidebar.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      )

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        handleCollapse()
        return
      }

      if (e.key !== 'Tab') return

      const focusable = getFocusable()
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    // Move focus to first focusable element when sidebar opens
    const focusable = getFocusable()
    if (focusable.length > 0) {
      focusable[0].focus()
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [collapsed, handleCollapse])

  const showScrim = !collapsed || isClosing

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--cedar-page-bg)]">
      <Sidebar
        ref={sidebarRef}
        expandTriggerRef={expandTriggerRef}
        user={user}
        practice={practice}
        role={role}
        collapsed={collapsed}
        onCollapse={handleCollapse}
        onExpand={handleExpand}
      />

      {/* Overlay scrim — below lg only, animated in/out */}
      {showScrim && (
        <div
          className={`fixed inset-0 z-[30] bg-[var(--cedar-overlay)] lg:hidden !m-0 ${
            isClosing ? 'animate-scrim-out' : 'animate-scrim-in'
          }`}
          onClick={handleCollapse}
          aria-hidden="true"
        />
      )}

      {/* Content area — NOT a <main>; root layout provides <main id="main-content"> */}
      <div
        className="flex-1 overflow-y-auto"
        style={{
          marginLeft: collapsed ? '0' : 'var(--width-sidebar)',
          transition: 'margin-left var(--duration-base) var(--ease-standard)',
        }}
      >
        <Box p={{ initial: '4', md: '6' }} className="max-w-5xl mx-auto">
          <BreadcrumbNav />
          {children}
        </Box>
      </div>
    </div>
  )
}
