'use client'

import Link from 'next/link'
import { SidebarLink } from './SidebarLink'
import { SignOutButton } from './SignOutButton'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Badge, Separator, Button, IconButton } from '@radix-ui/themes'
import type { UserRole } from '@/lib/layout-data'

const MAIN_NAV = [
  { href: '/home',     label: 'Home',               icon: 'ri-home-4-line' },
  { href: '/changes',  label: 'Changes',             icon: 'ri-pulse-line' },
  { href: '/library',  label: 'Regulation Library',  icon: 'ri-book-2-line' },
  { href: '#',         label: 'Ask Cedar',           icon: 'ri-chat-ai-line', disabled: true, badge: 'SOON' },
  { href: '/faq',      label: 'FAQ',                 icon: 'ri-question-answer-line' },
  { href: '/sources',  label: 'Sources',             icon: 'ri-database-2-line' },
  { href: '/audit',    label: 'Audit Trail',         icon: 'ri-shield-check-line' },
  { href: '/settings', label: 'My Practice',         icon: 'ri-stethoscope-line' },
]

const ADMIN_NAV = [
  { href: '/practices', label: 'Practices',     icon: 'ri-building-line' },
  { href: '/reviews',   label: 'Review Queue',  icon: 'ri-inbox-line' },
  { href: '/system',    label: 'System Health', icon: 'ri-server-line' },
]

interface SidebarProps {
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
      <Badge
        variant="outline"
        className="mt-1 text-xs bg-[var(--amber-a3)] text-[var(--amber-11)] border-[var(--amber-6)]"
      >
        Admin
      </Badge>
    )
  }
  const label = tier ? tier.charAt(0).toUpperCase() + tier.slice(1) : 'Monitor'
  const isIntelligence = tier?.toLowerCase() === 'intelligence'
  return (
    <Badge
      variant="outline"
      className={`mt-1 text-xs ${
        isIntelligence
          ? 'bg-[var(--purple-a3)] text-[var(--purple-11)] border-[var(--purple-6)]'
          : 'text-[var(--gray-11)] border-[var(--gray-6)]'
      }`}
    >
      {label}
    </Badge>
  )
}

// CSS-based dark/light switch — avoids useTheme() hydration flash
function CedarLogo() {
  return (
    <>
      <img src="/cedar-logo-light.svg" alt="Cedar" className="h-6 w-auto dark:hidden" />
      <img src="/cedar-logo-dark.svg"  alt="Cedar" className="h-6 w-auto hidden dark:block" />
    </>
  )
}

export function Sidebar({ user, practice, role, collapsed, onCollapse, onExpand }: SidebarProps) {
  const displayName =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.firstName ?? user.email.split('@')[0]

  return (
    <>
      {/* Expand trigger — visible only when collapsed, hugs left edge */}
      <IconButton
        variant="ghost"
        size="1"
        onClick={onExpand}
        aria-label="Expand sidebar"
        className={`fixed left-0 top-4 z-50 flex items-center justify-center w-5 h-8 rounded-none bg-[var(--color-panel-translucent)] border-r border-t border-b border-[var(--gray-6)] text-[var(--gray-9)] hover:text-[var(--gray-12)] hover:bg-[var(--gray-a3)] transition-interactive ${
          collapsed ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <i className="ri-arrow-right-s-line text-sm" />
      </IconButton>

      {/* Sidebar — fixed position, slides off-screen with translateX */}
      <aside
        className={`fixed inset-y-0 left-0 z-[40] flex flex-col w-60 h-screen overflow-y-auto border-r border-[var(--gray-6)] bg-[var(--color-panel-translucent)] ${
          collapsed ? '-translate-x-full' : 'translate-x-0'
        }`}
        style={{ transition: 'translate var(--duration-base) var(--ease-standard)' }}
      >

      {/* Logo + collapse button */}
      <div className="flex items-center justify-between px-4 h-14 shrink-0 border-b border-[var(--gray-6)]">
        <Link href="/home" className="flex items-center">
          <CedarLogo />
        </Link>
        <IconButton
          variant="ghost"
          size="1"
          onClick={onCollapse}
          aria-label="Collapse sidebar"
          className="text-[var(--gray-9)] hover:text-[var(--gray-12)] hover:bg-[var(--gray-a3)]"
        >
          <i className="ri-arrow-left-s-line text-base" />
        </IconButton>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {MAIN_NAV.map((item) => (
          <SidebarLink
            key={item.label}
            href={item.href}
            label={item.label}
            icon={item.icon}
            disabled={'disabled' in item ? item.disabled : undefined}
            badge={'badge' in item ? item.badge : undefined}
          />
        ))}

        {/* Admin section */}
        {role === 'admin' && (
          <>
            <div className="pt-4 pb-1 px-3">
              <p className="text-xs font-semibold text-[var(--gray-9)] uppercase tracking-wider">
                Admin
              </p>
            </div>
            <Separator className="my-1" />
            {ADMIN_NAV.map((item) => (
              <SidebarLink key={item.href} href={item.href} label={item.label} icon={item.icon} />
            ))}
          </>
        )}
      </nav>

      {/* Bottom section */}
      <div className="shrink-0 border-t border-[var(--gray-6)]">
        {/* Practice / role info */}
        <div className="px-4 py-3 border-b border-[var(--gray-6)]">
          {practice && (
            <p className="text-xs font-medium text-[var(--gray-12)] truncate">
              {practice.name}
            </p>
          )}
          <RoleBadge role={role} tier={practice?.tier ?? null} />
        </div>

        {/* User row */}
        <div className="px-4 py-2.5 border-b border-[var(--gray-6)]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[var(--accent-a3)] flex items-center justify-center shrink-0">
              <i className="ri-user-line text-[var(--accent-11)] text-sm" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[var(--gray-12)] truncate">{displayName}</p>
              <p className="text-xs text-[var(--gray-9)] truncate">{user.email}</p>
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
}
