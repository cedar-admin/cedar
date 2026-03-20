'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { BreadcrumbNav } from '@/components/BreadcrumbNav'
import type { UserRole } from '@/lib/layout-data'

interface SidebarShellProps {
  user: { email: string; firstName: string | null; lastName: string | null }
  practice: { name: string; tier: string } | null
  role: UserRole
  children: React.ReactNode
}

export function SidebarShell({ user, practice, role, children }: SidebarShellProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-background)]">
      <Sidebar
        user={user}
        practice={practice}
        role={role}
        collapsed={collapsed}
        onCollapse={() => setCollapsed(true)}
        onExpand={() => setCollapsed(false)}
      />

      {/* Tablet scrim: visible only below lg, only when sidebar is open */}
      {!collapsed && (
        <div
          className="fixed inset-0 z-[30] bg-[var(--scrim)] animate-scrim-in lg:hidden !m-0"
          onClick={() => setCollapsed(true)}
          aria-hidden="true"
        />
      )}

      {/* Main content: margin-left responds to collapsed state on desktop only */}
      <main
        className={`flex-1 overflow-y-auto${collapsed ? '' : ' lg:ml-60'}`}
        style={{ transition: 'margin-left var(--duration-base) var(--ease-standard)' }}
      >
        <div className="max-w-5xl mx-auto px-8 py-8">
          <BreadcrumbNav />
          {children}
        </div>
      </main>
    </div>
  )
}
