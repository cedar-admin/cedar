export type LibraryItemStatus = 'approved' | 'candidate' | 'experimental'

export interface LibraryNavItem {
  slug: string
  label: string
  status: LibraryItemStatus
  description: string
  filePath?: string
  governingDocs?: Array<{ label: string; file: string }>
  usedIn?: Array<{ label: string; href: string }>
  related?: Array<{ label: string; href: string }>
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
        description: 'What the UI library is, how to use it as a design-ops reference, and how new pages enter v1.',
        governingDocs: [
          { label: 'design-standards.md', file: 'docs/design-system/design-standards.md' },
          { label: 'frontend-standards.md', file: 'docs/design-system/frontend-standards.md' },
        ],
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
        governingDocs: [
          { label: 'design-standards.md §2 — Typography', file: 'docs/design-system/design-standards.md' },
          { label: 'frontend-standards.md §3 — Heading hierarchy', file: 'docs/design-system/frontend-standards.md' },
          { label: 'art-direction.md §4 — Section headings', file: 'docs/design-system/art-direction.md' },
        ],
        usedIn: [
          { label: 'Every Cedar page', href: '/changes' },
        ],
        related: [
          { label: 'Section heading', href: '/system/ui/components/section-heading' },
        ],
      },
      {
        slug: 'semantic-color',
        label: 'Semantic color and status',
        status: 'approved',
        description: 'Severity, review status, authority level, tier, and confidence badge color mappings. How Cedar separates color-for-information from gray-for-interaction.',
        governingDocs: [
          { label: 'design-standards.md §4 — Semantic color', file: 'docs/design-system/design-standards.md' },
        ],
        usedIn: [
          { label: 'Changes feed', href: '/changes' },
          { label: 'Change detail', href: '/changes' },
          { label: 'Regulation library', href: '/library' },
          { label: 'Audit trail', href: '/audit' },
        ],
        related: [
          { label: 'AI trust', href: '/system/ui/components/ai-trust' },
        ],
      },
      {
        slug: 'surfaces',
        label: 'Surfaces and spacing',
        status: 'approved',
        description: 'Card and table surface variants, the nested surface rule, and section spacing rhythm.',
        governingDocs: [
          { label: 'design-standards.md §5 — Surfaces', file: 'docs/design-system/design-standards.md' },
          { label: 'information-density.md §2 — Section spacing', file: 'docs/design-system/information-density.md' },
        ],
        usedIn: [
          { label: 'Changes feed', href: '/changes' },
          { label: 'Sources', href: '/sources' },
          { label: 'Settings', href: '/settings' },
        ],
        related: [
          { label: 'Tables', href: '/system/ui/patterns/tables' },
          { label: 'Page layout', href: '/system/ui/patterns/layout' },
        ],
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
        description: 'Canonical heading component for card sections and standalone page sections.',
        filePath: 'components/SectionHeading.tsx',
        governingDocs: [
          { label: 'design-standards.md §2 — Typography', file: 'docs/design-system/design-standards.md' },
          { label: 'art-direction.md §4 — Section headings', file: 'docs/design-system/art-direction.md' },
        ],
        usedIn: [
          { label: 'Change detail tabs', href: '/changes' },
          { label: 'Settings cards', href: '/settings' },
          { label: 'Admin review queue', href: '/admin/review' },
        ],
        related: [
          { label: 'Typography', href: '/system/ui/foundations/typography' },
          { label: 'Surfaces and spacing', href: '/system/ui/foundations/surfaces' },
        ],
      },
      {
        slug: 'ai-trust',
        label: 'AI trust',
        status: 'approved',
        description: 'AiBadge and AiDisclaimer — required on every AI-generated content surface.',
        filePath: 'components/AiBadge.tsx',
        governingDocs: [
          { label: 'design-standards.md §6 — AI trust signals', file: 'docs/design-system/design-standards.md' },
          { label: 'content-standards.md §5 — Disclaimer copy', file: 'docs/design-system/content-standards.md' },
        ],
        usedIn: [
          { label: 'Change detail — AI summary card', href: '/changes' },
          { label: 'Changes feed row badges', href: '/changes' },
        ],
        related: [
          { label: 'Semantic color and status', href: '/system/ui/foundations/semantic-color' },
          { label: 'Detail pages', href: '/system/ui/patterns/detail-pages' },
        ],
      },
      {
        slug: 'filter-pills',
        label: 'Filter pills',
        status: 'approved',
        description: 'URL-driven horizontal pill bar for collection page filtering.',
        filePath: 'components/FilterPills.tsx',
        governingDocs: [
          { label: 'ux-standards.md §3 — URL state', file: 'docs/design-system/ux-standards.md' },
        ],
        usedIn: [
          { label: 'Changes feed', href: '/changes' },
          { label: 'Regulation library', href: '/library' },
        ],
        related: [
          { label: 'Collection pages', href: '/system/ui/patterns/collection-pages' },
        ],
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
        label: 'Page layout',
        status: 'approved',
        description: 'The three Cedar page types — collection, detail, and settings — and their structural anatomy.',
        governingDocs: [
          { label: 'design-standards.md §3 — Layout', file: 'docs/design-system/design-standards.md' },
          { label: 'information-density.md', file: 'docs/design-system/information-density.md' },
        ],
        usedIn: [
          { label: 'All Cedar routes', href: '/changes' },
        ],
        related: [
          { label: 'Collection pages', href: '/system/ui/patterns/collection-pages' },
          { label: 'Detail pages', href: '/system/ui/patterns/detail-pages' },
          { label: 'Surfaces and spacing', href: '/system/ui/foundations/surfaces' },
        ],
      },
      {
        slug: 'collection-pages',
        label: 'Collection pages',
        status: 'approved',
        description: 'Title, count badge, filter pills, and table composition for list views.',
        governingDocs: [
          { label: 'design-standards.md §3 — Layout', file: 'docs/design-system/design-standards.md' },
          { label: 'information-density.md §3 — Collection density', file: 'docs/design-system/information-density.md' },
        ],
        usedIn: [
          { label: 'Changes feed', href: '/changes' },
          { label: 'Sources', href: '/sources' },
          { label: 'Regulation library', href: '/library' },
          { label: 'Audit trail', href: '/audit' },
        ],
        related: [
          { label: 'Filter pills', href: '/system/ui/components/filter-pills' },
          { label: 'Tables', href: '/system/ui/patterns/tables' },
          { label: 'Page layout', href: '/system/ui/patterns/layout' },
        ],
      },
      {
        slug: 'detail-pages',
        label: 'Detail pages',
        status: 'candidate',
        description: 'Identity cluster, metadata cluster, tabbed content, and AI summary placement for item detail views.',
        governingDocs: [
          { label: 'design-standards.md §3 — Layout', file: 'docs/design-system/design-standards.md' },
          { label: 'information-density.md §4 — Detail density', file: 'docs/design-system/information-density.md' },
        ],
        usedIn: [
          { label: 'Change detail', href: '/changes' },
          { label: 'Regulation detail', href: '/library' },
        ],
        related: [
          { label: 'AI trust', href: '/system/ui/components/ai-trust' },
          { label: 'Semantic color and status', href: '/system/ui/foundations/semantic-color' },
          { label: 'Page layout', href: '/system/ui/patterns/layout' },
        ],
      },
      {
        slug: 'tables',
        label: 'Tables',
        status: 'approved',
        description: 'Surface vs ghost, clickable rows, column ordering, and the nested surface rule for data tables.',
        governingDocs: [
          { label: 'design-standards.md §5 — Surfaces', file: 'docs/design-system/design-standards.md' },
          { label: 'ux-standards.md §2 — Clickable rows', file: 'docs/design-system/ux-standards.md' },
        ],
        usedIn: [
          { label: 'Changes feed', href: '/changes' },
          { label: 'Sources', href: '/sources' },
          { label: 'Audit trail', href: '/audit' },
          { label: 'Admin review queue', href: '/admin/review' },
        ],
        related: [
          { label: 'Surfaces and spacing', href: '/system/ui/foundations/surfaces' },
          { label: 'Collection pages', href: '/system/ui/patterns/collection-pages' },
        ],
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
