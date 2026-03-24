'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Badge, Text } from '@radix-ui/themes'
import { LIBRARY_NAV } from './nav-config'
import type { LibraryNavItem, LibraryItemStatus } from './nav-config'

function StatusIndicator({ status }: { status: LibraryItemStatus }) {
  if (status === 'candidate') {
    return <Badge color="amber" variant="soft" size="1">C</Badge>
  }
  if (status === 'experimental') {
    return <Badge color="blue" variant="soft" size="1">E</Badge>
  }
  return null
}

function NavItem({ href, item, isActive }: { href: string; item: LibraryNavItem; isActive: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 px-3 min-h-[32px] rounded-md text-sm transition-colors ${
        isActive
          ? 'bg-[var(--cedar-interactive-selected)] font-medium text-[var(--cedar-text-primary)]'
          : 'text-[var(--cedar-text-secondary)] hover:bg-[var(--cedar-interactive-hover)] hover:text-[var(--cedar-text-primary)]'
      }`}
    >
      <span className="flex-1 truncate">{item.label}</span>
      <StatusIndicator status={item.status} />
    </Link>
  )
}

export function LibraryNav() {
  const pathname = usePathname()

  return (
    <nav aria-label="UI library" className="flex flex-col gap-5 py-1">
      {LIBRARY_NAV.map((group) => (
        <div key={group.key} className="flex flex-col gap-0.5">
          <div className="px-3 pb-1.5">
            <Text as="span" size="1" weight="bold" className="uppercase tracking-wider text-[var(--cedar-text-muted)]">
              {group.label}
            </Text>
          </div>
          {group.items.map((item) => {
            const href = `${group.basePath}/${item.slug}`
            const isActive = pathname === href
            return (
              <NavItem key={item.slug} href={href} item={item} isActive={isActive} />
            )
          })}
        </div>
      ))}
    </nav>
  )
}
