'use client'

import { forwardRef } from 'react'
import Link from 'next/link'
import { SidebarLink } from './SidebarLink'
import { SignOutButton } from './SignOutButton'
import { ThemeToggle } from '@/components/ThemeToggle'
import type { UserRole } from '@/lib/layout-data'

const MAIN_NAV = [
  { href: '/home',     label: 'Home',               icon: 'home' },
  { href: '/changes',  label: 'Changes',             icon: 'pulse' },
  { href: '/library',  label: 'Regulation Library',  icon: 'book' },
  { href: '#',         label: 'Ask Cedar',           icon: 'chat', disabled: true, badge: 'SOON' },
  { href: '/faq',      label: 'FAQ',                 icon: 'question' },
  { href: '/sources',  label: 'Sources',             icon: 'database' },
  { href: '/audit',    label: 'Audit Trail',         icon: 'shield' },
  { href: '/settings', label: 'Settings',             icon: 'settings' },
]

const ADMIN_NAV = [
  { href: '/practices', label: 'Practices',     icon: 'building' },
  { href: '/reviews',   label: 'Review Queue',  icon: 'inbox' },
  { href: '/system',    label: 'System Health', icon: 'server' },
]

interface SidebarProps {
  expandTriggerRef?: React.RefObject<HTMLButtonElement | null>
  user: { email: string; firstName: string | null; lastName: string | null }
  practice: { name: string; tier: string } | null
  role: UserRole
  collapsed: boolean
  onCollapse: () => void
  onExpand: () => void
}

function RoleBadge({ role, tier }: { role: UserRole; tier: string | null }) {
  if (role === 'admin') {
    return (
      <span className="mt-1 text-xs inline-flex px-2 py-0.5 rounded border">
        Admin
      </span>
    )
  }
  const label = tier ? tier.charAt(0).toUpperCase() + tier.slice(1) : 'Monitor'
  return (
    <span className="mt-1 text-xs inline-flex px-2 py-0.5 rounded border">
      {label}
    </span>
  )
}

// CSS-based dark/light switch — avoids useTheme() hydration flash
function CedarLogo() {
  return (
    <>
      <img src="/cedar-logo-light.svg" alt="Cedar" className="logo-light h-6 w-auto" />
      <img src="/cedar-logo-dark.svg"  alt="Cedar" className="logo-dark h-6 w-auto" />
    </>
  )
}

export const Sidebar = forwardRef<HTMLElement, SidebarProps>(function Sidebar(
  { user, practice, role, collapsed, onCollapse, onExpand, expandTriggerRef },
  ref
) {
  const displayName =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.firstName ?? user.email.split('@')[0]

  return (
    <>
      {/* Expand trigger — visible only when collapsed, hugs left edge */}
      {collapsed && (
        <button
          ref={expandTriggerRef as React.RefObject<HTMLButtonElement>}
          onClick={onExpand}
          aria-label="Expand sidebar"
          aria-expanded={false}
          className="fixed left-2 top-3 z-50 flex items-center justify-center w-7 h-7 rounded-md border transition-all"
        >
          <span aria-hidden="true">&rarr;</span>
        </button>
      )}

      {/* Sidebar — fixed position, slides off-screen with translateX */}
      <aside
        ref={ref}
        className={`fixed inset-y-0 left-0 z-[40] flex flex-col h-screen overflow-y-auto border-r ${
          collapsed ? '-translate-x-full' : 'translate-x-0'
        }`}
        style={{
          width: 'var(--width-sidebar)',
          transition: 'translate var(--duration-base) var(--ease-standard)',
        }}
      >

        {/* Logo + collapse button */}
        <div className="flex items-center justify-between px-4 h-14 shrink-0 border-b">
          <Link href="/home" className="flex items-center">
            <CedarLogo />
          </Link>
          <button
            onClick={onCollapse}
            aria-label="Collapse sidebar"
            className="text-sm"
          >
            <span aria-hidden="true">&larr;</span>
          </button>
        </div>

        {/* Main nav */}
        <nav aria-label="Main navigation" className="flex-1 px-2 py-3">
          <ul className="space-y-0.5">
            {MAIN_NAV.map((item) => (
              <li key={item.label}>
                <SidebarLink
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  disabled={'disabled' in item ? item.disabled : undefined}
                  badge={'badge' in item ? item.badge : undefined}
                />
              </li>
            ))}

            {/* Admin section */}
            {role === 'admin' && (
              <>
                <li role="presentation" className="pt-4 pb-1 px-3">
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Admin
                  </span>
                </li>
                <li role="presentation">
                  <hr className="my-1" />
                </li>
                {ADMIN_NAV.map((item) => (
                  <li key={item.href}>
                    <SidebarLink href={item.href} label={item.label} icon={item.icon} />
                  </li>
                ))}
                <li className="pt-1">
                  <Link
                    href="/system/ui"
                    className="flex items-center justify-between gap-2 px-3 py-2 rounded-md text-sm border hover:border-current transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <span aria-hidden="true" />
                      UI library
                    </span>
                    <span className="text-xs" aria-hidden="true">&nearr;</span>
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>

        {/* Bottom section */}
        <div className="shrink-0 border-t">
          {/* Practice / role info */}
          <div className="px-4 py-3 border-b">
            {practice && (
              <span className="text-xs font-medium truncate block">
                {practice.name}
              </span>
            )}
            <RoleBadge role={role} tier={practice?.tier ?? null} />
          </div>

          {/* User row */}
          <div className="px-4 py-2.5 border-b">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 flex items-center justify-center shrink-0">
                <span aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-medium truncate block">{displayName}</span>
                <span className="text-xs truncate block">{user.email}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between px-3 py-2">
            <ThemeToggle />
            <SignOutButton />
          </div>
        </div>
      </aside>
    </>
  )
})
