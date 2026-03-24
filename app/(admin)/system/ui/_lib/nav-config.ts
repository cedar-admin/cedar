export type LibraryItemStatus = 'approved' | 'candidate' | 'experimental'

export interface LibraryNavItem {
  slug: string
  label: string
  status: LibraryItemStatus
  description: string
  filePath?: string
}

export interface LibraryNavGroup {
  key: 'getting-started' | 'foundations' | 'components' | 'patterns'
  label: string
  basePath: string
  items: LibraryNavItem[]
}

export const LIBRARY_NAV: LibraryNavGroup[] = [
  {
    key: 'getting-started',
    label: 'Getting started',
    basePath: '/system/ui/getting-started',
    items: [
      {
        slug: 'overview',
        label: 'Overview',
        status: 'approved',
        description: 'What the UI Library is, who it serves, and how to use it effectively.',
      },
    ],
  },
  {
    key: 'foundations',
    label: 'Foundations',
    basePath: '/system/ui/foundations',
    items: [
      {
        slug: 'typography',
        label: 'Typography',
        status: 'approved',
        description: 'Type scale, weights, and intended usage for page titles, headings, body, and captions.',
      },
      {
        slug: 'buttons',
        label: 'Buttons',
        status: 'approved',
        description: 'Primary, secondary, tertiary, destructive, and icon-only button variants with selection guidance.',
      },
      {
        slug: 'badges',
        label: 'Badges and semantic color',
        status: 'approved',
        description: 'Severity, status, authority, role/tier, and confidence badge color mappings. The complete Cedar semantic color system.',
      },
      {
        slug: 'surfaces',
        label: 'Surfaces',
        status: 'approved',
        description: 'Card and table surface variants, including the nested surface rule and when to use ghost vs surface.',
      },
    ],
  },
  {
    key: 'components',
    label: 'Components',
    basePath: '/system/ui/components',
    items: [
      {
        slug: 'section-heading',
        label: 'Section heading',
        status: 'approved',
        description: 'Card and standalone section heading variants for consistent labeling.',
        filePath: 'components/SectionHeading.tsx',
      },
      {
        slug: 'filter-pills',
        label: 'Filter pills',
        status: 'approved',
        description: 'URL-driven horizontal pill bar for collection filtering.',
        filePath: 'components/FilterPills.tsx',
      },
      {
        slug: 'ai-trust',
        label: 'AI trust',
        status: 'approved',
        description: 'AI-generated badge and legal disclaimer pattern for all AI-produced content.',
        filePath: 'components/AiBadge.tsx',
      },
      {
        slug: 'hash-with-copy',
        label: 'Hash with copy',
        status: 'approved',
        description: 'Truncated hash display with clipboard copy action for audit trail references.',
        filePath: 'components/HashWithCopy.tsx',
      },
      {
        slug: 'domain-card',
        label: 'Domain card',
        status: 'approved',
        description: 'Clickable domain card with severity indicator, regulation count, and full-surface click target.',
        filePath: 'components/DomainCard.tsx',
      },
    ],
  },
  {
    key: 'patterns',
    label: 'UI patterns',
    basePath: '/system/ui/patterns',
    items: [
      {
        slug: 'layout',
        label: 'Layout',
        status: 'approved',
        description: 'Page anatomy, container sizing, section spacing, and the three Cedar page types.',
      },
      {
        slug: 'navigation',
        label: 'Navigation',
        status: 'approved',
        description: 'Sidebar structure, breadcrumbs, page titles, URL state encoding, and wayfinding rules.',
      },
      {
        slug: 'tables',
        label: 'Tables',
        status: 'approved',
        description: 'Data table patterns: surface vs ghost, clickable rows, column ordering, and pagination.',
      },
      {
        slug: 'empty-states',
        label: 'Empty states',
        status: 'approved',
        description: 'Three empty state types: first use, no filter results, and error loading.',
      },
      {
        slug: 'collection-header',
        label: 'Collection header',
        status: 'approved',
        description: 'Standard page header composition with title, count badge, and filter pill bar.',
      },
      {
        slug: 'detail-header',
        label: 'Detail header',
        status: 'approved',
        description: 'Detail page metadata cluster: title, badges, source info, and effective dates.',
      },
      {
        slug: 'settings-section',
        label: 'Settings section',
        status: 'approved',
        description: 'Settings card composition with heading, description, and form control.',
      },
    ],
  },
]

export function getAllSlugs(groupKey: string): string[] {
  const group = LIBRARY_NAV.find((g) => g.key === groupKey)
  return group ? group.items.map((i) => i.slug) : []
}

export function getLibraryItem(groupKey: string, slug: string): LibraryNavItem | undefined {
  const group = LIBRARY_NAV.find((g) => g.key === groupKey)
  return group?.items.find((i) => i.slug === slug)
}
