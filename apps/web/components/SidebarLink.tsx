'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

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
        className="flex items-center gap-3 px-3 py-2.5 text-sm cursor-not-allowed min-h-[44px] opacity-50"
        aria-disabled="true"
      >
        <span className="text-base shrink-0" aria-hidden="true" />
        <span className="flex-1">{label}</span>
        {badge && (
          <span className="inline-flex px-2 py-0.5 text-xs rounded border">
            {badge}
          </span>
        )}
      </span>
    )
  }

  return (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      className={`flex items-center gap-3 px-3 py-2.5 rounded min-h-[44px] transition-all ${
        isActive
          ? 'font-medium'
          : ''
      }`}
    >
      <span className="text-base shrink-0" aria-hidden="true" />
      <span className="text-sm">{label}</span>
    </Link>
  )
}
