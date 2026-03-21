'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Badge, Text } from '@radix-ui/themes'

interface SidebarLinkProps {
  href: string
  label: string
  icon: string
  disabled?: boolean
  badge?: string
}

export function SidebarLink({ href, label, icon, disabled, badge }: SidebarLinkProps) {
  const pathname = usePathname()
  const isActive = !disabled && (pathname === href || (href !== '/home' && pathname.startsWith(href)))

  if (disabled) {
    return (
      <span
        className="flex items-center gap-3 px-3 py-2.5 text-sm text-[var(--cedar-text-muted)] cursor-not-allowed min-h-[44px]"
        aria-disabled="true"
      >
        <i className={`${icon} text-base shrink-0`} aria-hidden="true" />
        <Text as="span" size="2" className="flex-1">{label}</Text>
        {badge && (
          <Badge variant="outline" size="1" color="gray">
            {badge}
          </Badge>
        )}
      </span>
    )
  }

  return (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-2)] min-h-[44px] transition-interactive ${
        isActive
          ? 'bg-[var(--cedar-interactive-selected)] text-[var(--cedar-text-primary)] font-medium'
          : 'text-[var(--cedar-text-secondary)] hover:bg-[var(--cedar-interactive-hover)] hover:text-[var(--cedar-text-primary)]'
      }`}
    >
      <i className={`${icon} text-base shrink-0`} aria-hidden="true" />
      <Text as="span" size="2">{label}</Text>
    </Link>
  )
}
