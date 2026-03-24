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
      className={`flex items-start gap-3 px-3 py-2.5 rounded-lg text-[15px] leading-5 transition-colors ${
        isActive
          ? 'bg-[var(--cedar-interactive-selected)] font-medium text-[var(--cedar-text-primary)]'
          : 'text-[var(--cedar-text-secondary)] hover:bg-[var(--cedar-interactive-hover)] hover:text-[var(--cedar-text-primary)]'
      }`}
    >
      <span className="flex-1 text-balance">{item.label}</span>
      <span className="shrink-0 pt-0.5">
        <StatusIndicator status={item.status} />
      </span>
    </Link>
  )
}

export function LibraryNav() {
  const pathname = usePathname()

  return (
    <nav aria-label="UI library" className="flex flex-col gap-7 py-1">
      {LIBRARY_NAV.map((group) => (
        <div key={group.key} className="flex flex-col gap-1.5">
          <Link
            href={group.basePath}
            className={`flex items-center justify-between px-3 rounded-md transition-colors ${
              pathname === group.basePath
                ? 'text-[var(--cedar-text-primary)]'
                : 'text-[var(--cedar-text-muted)] hover:text-[var(--cedar-text-primary)]'
            }`}
          >
            <Text as="span" size="2" weight="medium" className="uppercase tracking-[0.12em]">
              {group.label}
            </Text>
            <Badge variant="outline" color="gray" size="1">
              {group.items.length}
            </Badge>
          </Link>
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
