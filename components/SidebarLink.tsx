'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Badge } from '@radix-ui/themes'

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
        className="flex items-center gap-3 px-3 py-2 text-sm text-[var(--gray-9)] cursor-not-allowed"
        aria-disabled="true"
      >
        <i className={`${icon} text-base shrink-0`} />
        <span className="flex-1">{label}</span>
        {badge && (
          <Badge variant="outline" size="1" className="text-[var(--gray-9)] border-[var(--gray-6)]">
            {badge}
          </Badge>
        )}
      </span>
    )
  }

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2 text-sm transition-colors rounded-[var(--radius-2)] ${
        isActive
          ? 'bg-[var(--accent-a3)] text-[var(--accent-11)] font-medium'
          : 'text-[var(--gray-11)] hover:bg-[var(--gray-a3)] hover:text-[var(--gray-12)]'
      }`}
    >
      <i className={`${icon} text-base shrink-0`} />
      {label}
    </Link>
  )
}
