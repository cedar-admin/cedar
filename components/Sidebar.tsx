'use client'

import { forwardRef } from 'react'
import Link from 'next/link'
import { SidebarLink } from './SidebarLink'
import { SignOutButton } from './SignOutButton'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Badge, Separator, IconButton, Text } from '@radix-ui/themes'
import type { UserRole } from '@/lib/layout-data'

const MAIN_NAV = [
  { href: '/home',     label: 'Home',               icon: 'ri-home-4-line' },
  { href: '/changes',  label: 'Changes',             icon: 'ri-pulse-line' },
  { href: '/library',  label: 'Regulation Library',  icon: 'ri-book-2-line' },
  { href: '#',         label: 'Ask Cedar',           icon: 'ri-chat-ai-line', disabled: true, badge: 'SOON' },
  { href: '/faq',      label: 'FAQ',                 icon: 'ri-question-answer-line' },
  { href: '/sources',  label: 'Sources',             icon: 'ri-database-2-line' },
  { href: '/audit',    label: 'Audit Trail',         icon: 'ri-shield-check-line' },
  { href: '/settings', label: 'Settings',             icon: 'ri-stethoscope-line' },
]

const ADMIN_NAV = [
  { href: '/practices', label: 'Practices',     icon: 'ri-building-line' },
  { href: '/reviews',   label: 'Review Queue',  icon: 'ri-inbox-line' },
  { href: '/system',    label: 'System Health', icon: 'ri-server-line' },
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
      <Badge color="amber" variant="outline" className="mt-1 text-xs">
        Admin
      </Badge>
    )
  }
  const label = tier ? tier.charAt(0).toUpperCase() + tier.slice(1) : 'Monitor'
  const isIntelligence = tier?.toLowerCase() === 'intelligence'
  return (
    <Badge
      color={isIntelligence ? 'purple' : 'gray'}
      variant="outline"
      className="mt-1 text-xs"
    >
      {label}
    </Badge>
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
      <IconButton
        ref={expandTriggerRef as React.RefObject<HTMLButtonElement>}
        variant="ghost"
        color="gray"
        size="1"
        onClick={onExpand}
        aria-label="Expand sidebar"
        aria-expanded={!collapsed}
        className={`fixed left-0 top-4 z-50 flex items-center justify-center w-5 h-8 rounded-none bg-[var(--cedar-panel-bg)] border-r border-t border-b border-[var(--cedar-border-subtle)] text-[var(--cedar-text-muted)] hover:text-[var(--cedar-text-primary)] hover:bg-[var(--cedar-interactive-hover)] transition-interactive ${
          collapsed ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <i className="ri-arrow-right-s-line text-sm" aria-hidden="true" />
      </IconButton>

      {/* Sidebar — fixed position, slides off-screen with translateX */}
      <aside
        ref={ref}
        className={`fixed inset-y-0 left-0 z-[40] flex flex-col h-screen overflow-y-auto border-r border-[var(--cedar-border-subtle)] bg-[var(--cedar-panel-bg)] ${
          collapsed ? '-translate-x-full' : 'translate-x-0'
        }`}
        style={{
          width: 'var(--width-sidebar)',
          transition: 'translate var(--duration-base) var(--ease-standard)',
        }}
      >

        {/* Logo + collapse button */}
        <div className="flex items-center justify-between px-4 h-14 shrink-0 border-b border-[var(--cedar-border-subtle)]">
          <Link href="/home" className="flex items-center">
            <CedarLogo />
          </Link>
          <IconButton
            variant="ghost"
            color="gray"
            size="1"
            onClick={onCollapse}
            aria-label="Collapse sidebar"
            className="text-[var(--cedar-text-muted)] hover:text-[var(--cedar-text-primary)] hover:bg-[var(--cedar-interactive-hover)]"
          >
            <i className="ri-arrow-left-s-line text-base" aria-hidden="true" />
          </IconButton>
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
                  <Text as="span" size="1" weight="bold" className="uppercase tracking-wider text-[var(--cedar-text-muted)]">
                    Admin
                  </Text>
                </li>
                <li role="presentation">
                  <Separator className="my-1" />
                </li>
                {ADMIN_NAV.map((item) => (
                  <li key={item.href}>
                    <SidebarLink href={item.href} label={item.label} icon={item.icon} />
                  </li>
                ))}
              </>
            )}
          </ul>
        </nav>

        {/* Bottom section */}
        <div className="shrink-0 border-t border-[var(--cedar-border-subtle)]">
          {/* Practice / role info */}
          <div className="px-4 py-3 border-b border-[var(--cedar-border-subtle)]">
            {practice && (
              <Text as="span" size="1" weight="medium" className="text-[var(--cedar-text-primary)] truncate block">
                {practice.name}
              </Text>
            )}
            <RoleBadge role={role} tier={practice?.tier ?? null} />
          </div>

          {/* User row */}
          <div className="px-4 py-2.5 border-b border-[var(--cedar-border-subtle)]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-[var(--cedar-accent-bg)] flex items-center justify-center shrink-0">
                <i className="ri-user-line text-[var(--cedar-accent-text)] text-sm" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <Text as="span" size="1" weight="medium" className="text-[var(--cedar-text-primary)] truncate block">{displayName}</Text>
                <Text as="span" size="1" className="text-[var(--cedar-text-muted)] truncate block">{user.email}</Text>
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
