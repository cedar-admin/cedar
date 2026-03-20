'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Badge } from '@/components/ui/badge'

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
        className="flex items-center gap-3 px-3 py-2 text-sm text-sidebar-foreground/40 cursor-not-allowed"
        aria-disabled="true"
      >
        <i className={`${icon} text-base shrink-0`} />
        <span className="flex-1">{label}</span>
        {badge && (
          <Badge variant="outline" className="text-xs px-1.5 py-0 border-sidebar-border text-sidebar-foreground/40">
            {badge}
          </Badge>
        )}
      </span>
    )
  }

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2 text-sm transition-colors ${
        isActive
          ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
          : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
      }`}
    >
      <i className={`${icon} text-base shrink-0`} />
      {label}
    </Link>
  )
}
