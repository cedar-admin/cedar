'use client'

import Link from 'next/link'
import { Link as RadixLink, Text } from '@radix-ui/themes'
import { usePathname } from 'next/navigation'

// Map URL segments to human-readable labels
const SEGMENT_LABELS: Record<string, string> = {
  home:       'Home',
  changes:    'Changes',
  library:    'Regulation Library',
  faq:        'FAQ',
  sources:    'Sources',
  audit:      'Audit Trail',
  settings:   'Settings',
  reviews:    'Review Queue',
  system:     'System Health',
  onboarding: 'Onboarding',
  export:     'Export',
}

interface Crumb {
  label: string
  href: string
  isLast: boolean
}

function buildCrumbs(pathname: string): Crumb[] {
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length === 0) return []

  const crumbs: Crumb[] = []
  let cumPath = ''

  segments.forEach((seg, i) => {
    cumPath += `/${seg}`
    const isLast = i === segments.length - 1

    // Use label map, or prettify dynamic segments (IDs)
    const isId = /^[0-9a-f-]{8,}$/i.test(seg) || seg.length > 20
    const label = SEGMENT_LABELS[seg] ?? (isId ? 'Detail' : seg.charAt(0).toUpperCase() + seg.slice(1))

    crumbs.push({ label, href: cumPath, isLast })
  })

  return crumbs
}

export function BreadcrumbNav() {
  const pathname = usePathname()
  const crumbs = buildCrumbs(pathname)

  // Single-segment paths (e.g. /home) — no breadcrumb needed
  if (crumbs.length <= 1) return null

  // Library sub-pages render their own breadcrumbs with domain names from DB
  if (pathname.startsWith('/library/')) return null

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center gap-1.5 text-sm">
        {crumbs.map((crumb, i) => (
          <li key={crumb.href} className="flex items-center gap-1.5">
            {i > 0 && (
              <i
                className="ri-arrow-right-s-line text-[var(--cedar-text-muted)] text-base leading-none"
                aria-hidden="true"
              />
            )}
            {crumb.isLast ? (
              <Text
                as="span"
                size="2"
                weight="medium"
                className="text-[var(--cedar-text-primary)]"
                aria-current="page"
              >
                {crumb.label}
              </Text>
            ) : (
              <RadixLink asChild color="gray" highContrast underline="hover" size="2">
                <Link href={crumb.href}>{crumb.label}</Link>
              </RadixLink>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
