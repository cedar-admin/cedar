'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SidebarLinkProps {
  href: string
  label: string
  icon: string
}

export function SidebarLink({ href, label, icon }: SidebarLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href || (href !== '/home' && pathname.startsWith(href))

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
