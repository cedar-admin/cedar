export type LibraryItemStatus = 'approved' | 'candidate' | 'experimental'
export type LibraryGroupKey = 'getting-started' | 'foundations' | 'atoms' | 'fragments' | 'patterns'

export interface LibraryNavItem {
  referenceId: string
  slug: string
  label: string
  status: LibraryItemStatus
  description: string
  implementationFiles?: string[]
  governingDocs?: Array<{ label: string; file: string }>
  usedIn?: Array<{ label: string; href: string }>
  related?: Array<{ label: string; href: string }>
}

export interface LibraryNavGroup {
  key: LibraryGroupKey
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
        referenceId: 'GST-001',
        slug: 'overview',
        label: 'Overview',
        status: 'approved',
        description: 'What the UI library is, how to use it as a system reference, and how Cedar names and promotes patterns.',
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
        referenceId: 'FDN-001',
        slug: 'typography',
        label: 'Typography',
        status: 'approved',
        description: 'Type scale, weights, and intended usage for page titles, headings, body, and captions.',
        implementationFiles: [
          'docs/design-system/art-direction.md',
          'docs/design-system/frontend-standards.md',
        ],
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
        referenceId: 'FDN-002',
        slug: 'semantic-color',
        label: 'Semantic color and status',
        status: 'approved',
        description: 'Severity, review status, authority level, tier, and confidence badge color mappings. How Cedar separates color-for-information from gray-for-interaction.',
        implementationFiles: [
          'lib/ui-constants.ts',
          'app/globals.css',
        ],
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
        referenceId: 'FDN-003',
        slug: 'surfaces',
        label: 'Surfaces and spacing',
        status: 'approved',
        description: 'Card and table surface variants, the nested surface rule, and section spacing rhythm.',
        implementationFiles: [
          'app/globals.css',
          'components/SidebarShell.tsx',
        ],
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
      {
        referenceId: 'FDN-004',
        slug: 'layout-primitives',
        label: 'Layout primitives',
        status: 'approved',
        description: 'Box, Flex, Grid, Separator, and the Cedar rules for using Radix Themes layout primitives instead of raw utility wrappers.',
        implementationFiles: [
          'components/SidebarShell.tsx',
          'app/(dashboard)/home/page.tsx',
          'app/(dashboard)/settings/page.tsx',
        ],
        governingDocs: [
          { label: 'design-standards.md §3 — Component architecture', file: 'docs/design-system/design-standards.md' },
          { label: 'information-density.md §1 — Density model', file: 'docs/design-system/information-density.md' },
        ],
        usedIn: [
          { label: 'Home', href: '/home' },
          { label: 'Settings', href: '/settings' },
          { label: 'Admin system', href: '/admin/system' },
        ],
        related: [
          { label: 'Page layout', href: '/system/ui/patterns/layout' },
        ],
      },
    ],
  },
  {
    key: 'atoms',
    label: 'Atom components',
    basePath: '/system/ui/atoms',
    items: [
      {
        referenceId: 'ATM-001',
        slug: 'buttons',
        label: 'Button',
        status: 'approved',
        description: 'Primary, secondary, destructive, and icon-only action atoms built from Radix Button and IconButton.',
        implementationFiles: [
          'components/SignOutButton.tsx',
          'components/ThemeToggle.tsx',
          'components/admin/SlideOverPanel.tsx',
        ],
        governingDocs: [
          { label: 'design-standards.md §6 — Buttons & interactive elements', file: 'docs/design-system/design-standards.md' },
          { label: 'content-standards.md §4 — Button and action labels', file: 'docs/design-system/content-standards.md' },
        ],
        usedIn: [
          { label: 'Settings', href: '/settings' },
          { label: 'Pricing', href: '/pricing' },
          { label: 'Admin reviews', href: '/admin/reviews' },
        ],
        related: [
          { label: 'Icon button', href: '/system/ui/atoms/icon-button' },
          { label: 'Dropdown menu', href: '/system/ui/atoms/dropdown-menu' },
          { label: 'Dialog', href: '/system/ui/atoms/dialog' },
        ],
      },
      {
        referenceId: 'ATM-035',
        slug: 'icon-button',
        label: 'Icon Button',
        status: 'approved',
        description: 'Compact icon-only action atom built from Radix IconButton, with Cedar naming and accessibility rules.',
        implementationFiles: [
          'components/ThemeToggle.tsx',
          'components/HashWithCopy.tsx',
          'components/admin/SlideOverPanel.tsx',
        ],
        governingDocs: [
          { label: 'design-standards.md §6 — Buttons & interactive elements', file: 'docs/design-system/design-standards.md' },
          { label: 'frontend-standards.md §8 — Tooltip and aria labels', file: 'docs/design-system/frontend-standards.md' },
        ],
        usedIn: [
          { label: 'Dashboard shell', href: '/home' },
          { label: 'Audit', href: '/audit' },
          { label: 'Admin panels', href: '/admin/reviews' },
        ],
        related: [
          { label: 'Button', href: '/system/ui/atoms/buttons' },
          { label: 'Tooltip', href: '/system/ui/atoms/tooltip' },
        ],
      },
      {
        referenceId: 'ATM-002',
        slug: 'badges',
        label: 'Badge',
        status: 'approved',
        description: 'Raw Radix Badge variants for semantic states, labels, and supporting metadata.',
        implementationFiles: [
          'components/SeverityBadge.tsx',
          'components/StatusBadge.tsx',
          'components/AuthorityBadge.tsx',
        ],
        governingDocs: [
          { label: 'design-standards.md §7 — Badges', file: 'docs/design-system/design-standards.md' },
        ],
        usedIn: [
          { label: 'Changes', href: '/changes' },
          { label: 'Library', href: '/library' },
          { label: 'Admin reviews', href: '/admin/reviews' },
        ],
        related: [
          { label: 'Status and meta fragments', href: '/system/ui/fragments/status-and-meta' },
          { label: 'Semantic color and status', href: '/system/ui/foundations/semantic-color' },
        ],
      },
      {
        referenceId: 'ATM-003',
        slug: 'cards',
        label: 'Card',
        status: 'approved',
        description: 'Surface, classic, and ghost card treatments used as Cedar’s primary containment primitive.',
        implementationFiles: [
          'components/DomainCard.tsx',
          'app/(dashboard)/home/page.tsx',
          'app/(dashboard)/settings/page.tsx',
        ],
        governingDocs: [
          { label: 'design-standards.md §8 — Cards', file: 'docs/design-system/design-standards.md' },
        ],
        usedIn: [
          { label: 'Home', href: '/home' },
          { label: 'Library', href: '/library' },
          { label: 'Settings', href: '/settings' },
        ],
        related: [
          { label: 'Surfaces and spacing', href: '/system/ui/foundations/surfaces' },
        ],
      },
      {
        referenceId: 'ATM-004',
        slug: 'callouts',
        label: 'Callout',
        status: 'approved',
        description: 'Informational, warning, and success messaging using Radix Callout and Cedar copy rules.',
        implementationFiles: [
          'components/LegalDisclaimer.tsx',
          'app/(dashboard)/sources/page.tsx',
          'app/(admin)/reviews/page.tsx',
        ],
        governingDocs: [
          { label: 'design-standards.md §11 — Alerts and feedback', file: 'docs/design-system/design-standards.md' },
          { label: 'content-standards.md §9 — Empty, warning, and error messaging', file: 'docs/design-system/content-standards.md' },
        ],
        usedIn: [
          { label: 'Sources', href: '/sources' },
          { label: 'FAQ detail', href: '/faq' },
          { label: 'Admin reviews', href: '/admin/reviews' },
        ],
      },
      {
        referenceId: 'ATM-005',
        slug: 'tables',
        label: 'Table',
        status: 'approved',
        description: 'Radix Table primitives as Cedar’s core comparison surface before pattern-specific row behavior is applied.',
        implementationFiles: [
          'components/CedarTable.tsx',
          'app/(dashboard)/changes/page.tsx',
          'app/(dashboard)/audit/page.tsx',
          'components/admin/PracticesTable.tsx',
        ],
        governingDocs: [
          { label: 'design-standards.md §9 — Tables', file: 'docs/design-system/design-standards.md' },
          { label: 'information-density.md §4 — Tables, cards, and lists', file: 'docs/design-system/information-density.md' },
        ],
        usedIn: [
          { label: 'Changes', href: '/changes' },
          { label: 'Audit', href: '/audit' },
          { label: 'Admin practices', href: '/admin/practices' },
        ],
        related: [
          { label: 'Pattern: tables', href: '/system/ui/patterns/tables' },
        ],
      },
      {
        referenceId: 'ATM-006',
        slug: 'text-field',
        label: 'Text Field',
        status: 'approved',
        description: 'Single-line text input built from Radix TextField for search, filtering, and simple form capture.',
        implementationFiles: [
          'app/onboarding/OnboardingForm.tsx',
          'components/NotificationsForm.tsx',
          'app/(dashboard)/library/[slug]/page.tsx',
        ],
        governingDocs: [
          { label: 'design-standards.md §10 — Forms and inputs', file: 'docs/design-system/design-standards.md' },
          { label: 'frontend-standards.md §6 — Forms', file: 'docs/design-system/frontend-standards.md' },
        ],
        usedIn: [
          { label: 'Onboarding', href: '/onboarding' },
          { label: 'Library', href: '/library' },
          { label: 'Settings', href: '/settings' },
        ],
      },
      {
        referenceId: 'ATM-007',
        slug: 'textarea',
        label: 'Textarea',
        status: 'approved',
        description: 'Multi-line text input built from Radix TextArea for notes, longer explanations, and freeform capture.',
        implementationFiles: [
          'app/system/ui/atoms/page.tsx',
        ],
        governingDocs: [
          { label: 'design-standards.md §10 — Forms and inputs', file: 'docs/design-system/design-standards.md' },
          { label: 'frontend-standards.md §6 — Forms', file: 'docs/design-system/frontend-standards.md' },
        ],
      },
      {
        referenceId: 'ATM-008',
        slug: 'select',
        label: 'Select',
        status: 'approved',
        description: 'Triggered single-choice control built from Radix Select for filters and bounded form choices.',
        implementationFiles: [
          'components/NotificationsForm.tsx',
          'app/onboarding/OnboardingForm.tsx',
          'components/admin/PracticesTable.tsx',
        ],
        governingDocs: [
          { label: 'design-standards.md §10 — Forms and inputs', file: 'docs/design-system/design-standards.md' },
          { label: 'frontend-standards.md §6 — Forms', file: 'docs/design-system/frontend-standards.md' },
        ],
        usedIn: [
          { label: 'Settings', href: '/settings' },
          { label: 'Onboarding', href: '/onboarding' },
          { label: 'Admin practices', href: '/admin/practices' },
        ],
        related: [
          { label: 'Text field', href: '/system/ui/atoms/text-field' },
        ],
      },
      {
        referenceId: 'ATM-009',
        slug: 'checkbox',
        label: 'Checkbox',
        status: 'approved',
        description: 'Single boolean choice built from Radix Checkbox for opt-ins and binary preferences.',
        implementationFiles: [
          'app/system/ui/atoms/page.tsx',
        ],
        governingDocs: [
          { label: 'design-standards.md §10 — Forms and inputs', file: 'docs/design-system/design-standards.md' },
          { label: 'frontend-standards.md §6 — Forms', file: 'docs/design-system/frontend-standards.md' },
        ],
      },
      {
        referenceId: 'ATM-010',
        slug: 'checkbox-cards',
        label: 'Checkbox Cards',
        status: 'candidate',
        description: 'Card-based multi-select atom for visually scannable choices where each option needs more surface area.',
        governingDocs: [
          { label: 'design-standards.md §10 — Forms and inputs', file: 'docs/design-system/design-standards.md' },
          { label: 'ux-standards.md §1 — Component purpose and intent', file: 'docs/design-system/ux-standards.md' },
        ],
      },
      {
        referenceId: 'ATM-011',
        slug: 'checkbox-group',
        label: 'Checkbox Group',
        status: 'candidate',
        description: 'Stacked multi-select list built from Radix CheckboxGroup when card chrome is unnecessary.',
        governingDocs: [
          { label: 'design-standards.md §10 — Forms and inputs', file: 'docs/design-system/design-standards.md' },
          { label: 'ux-standards.md §1 — Component purpose and intent', file: 'docs/design-system/ux-standards.md' },
        ],
      },
      {
        referenceId: 'ATM-012',
        slug: 'radio',
        label: 'Radio',
        status: 'candidate',
        description: 'Single radio control for inline mutually exclusive choices with short labels.',
        governingDocs: [
          { label: 'design-standards.md §10 — Forms and inputs', file: 'docs/design-system/design-standards.md' },
          { label: 'frontend-standards.md §6 — Forms', file: 'docs/design-system/frontend-standards.md' },
        ],
      },
      {
        referenceId: 'ATM-013',
        slug: 'radio-group',
        label: 'Radio Group',
        status: 'candidate',
        description: 'Grouped radio set for mutually exclusive choices when the set needs an explicit container.',
        governingDocs: [
          { label: 'design-standards.md §10 — Forms and inputs', file: 'docs/design-system/design-standards.md' },
          { label: 'frontend-standards.md §6 — Forms', file: 'docs/design-system/frontend-standards.md' },
        ],
      },
      {
        referenceId: 'ATM-014',
        slug: 'radio-cards',
        label: 'Radio Cards',
        status: 'candidate',
        description: 'Card-based single-choice atom for plan selection, mode selection, and other high-visibility options.',
        governingDocs: [
          { label: 'design-standards.md §10 — Forms and inputs', file: 'docs/design-system/design-standards.md' },
          { label: 'ux-standards.md §1 — Component purpose and intent', file: 'docs/design-system/ux-standards.md' },
        ],
      },
      {
        referenceId: 'ATM-015',
        slug: 'switch',
        label: 'Switch',
        status: 'approved',
        description: 'Immediate on/off toggle atom for settings and small boolean controls.',
        implementationFiles: [
          'components/NotificationsForm.tsx',
        ],
        governingDocs: [
          { label: 'design-standards.md §10 — Forms and inputs', file: 'docs/design-system/design-standards.md' },
          { label: 'frontend-standards.md §6 — Forms', file: 'docs/design-system/frontend-standards.md' },
        ],
        usedIn: [
          { label: 'Settings', href: '/settings' },
        ],
      },
      {
        referenceId: 'ATM-016',
        slug: 'segmented-control',
        label: 'Segmented Control',
        status: 'candidate',
        description: 'Inline segmented chooser for compact mutually exclusive filters and mode toggles.',
        governingDocs: [
          { label: 'design-standards.md §10 — Forms and inputs', file: 'docs/design-system/design-standards.md' },
          { label: 'ux-standards.md §5 — Navigation and URL state', file: 'docs/design-system/ux-standards.md' },
        ],
      },
      {
        referenceId: 'ATM-017',
        slug: 'tabs',
        label: 'Tabs',
        status: 'approved',
        description: 'Tabbed content atom for switching between co-equal sections within the same page context.',
        implementationFiles: [
          'app/(dashboard)/library/[slug]/[id]/RegulationTabs.tsx',
        ],
        governingDocs: [
          { label: 'information-density.md §5 — Progressive disclosure', file: 'docs/design-system/information-density.md' },
          { label: 'frontend-standards.md §8 — Tooltip and aria labels', file: 'docs/design-system/frontend-standards.md' },
        ],
        usedIn: [
          { label: 'Regulation detail', href: '/library' },
        ],
      },
      {
        referenceId: 'ATM-018',
        slug: 'tab-nav',
        label: 'Tab Nav',
        status: 'candidate',
        description: 'Nav-style tab strip for switching routes or sub-views with stronger navigation affordance than content tabs.',
        governingDocs: [
          { label: 'ux-standards.md §5 — Navigation consistency', file: 'docs/design-system/ux-standards.md' },
        ],
      },
      {
        referenceId: 'ATM-019',
        slug: 'tooltip',
        label: 'Tooltip',
        status: 'approved',
        description: 'Hover/focus affordance for terse helper text and icon-only actions.',
        implementationFiles: [
          'components/HashWithCopy.tsx',
        ],
        governingDocs: [
          { label: 'frontend-standards.md §8 — Tooltip and aria labels', file: 'docs/design-system/frontend-standards.md' },
        ],
        usedIn: [
          { label: 'Audit', href: '/audit' },
        ],
      },
      {
        referenceId: 'ATM-020',
        slug: 'avatar',
        label: 'Avatar',
        status: 'candidate',
        description: 'Compact identity atom for people and practices when image-or-initial presence helps scanning.',
        governingDocs: [
          { label: 'design-standards.md §8 — Cards', file: 'docs/design-system/design-standards.md' },
        ],
      },
      {
        referenceId: 'ATM-021',
        slug: 'aspect-ratio',
        label: 'Aspect Ratio',
        status: 'candidate',
        description: 'Media containment atom for screenshots, previews, and image frames that must keep a fixed ratio.',
        governingDocs: [
          { label: 'design-standards.md §8 — Cards', file: 'docs/design-system/design-standards.md' },
        ],
      },
      {
        referenceId: 'ATM-022',
        slug: 'data-list',
        label: 'Data List',
        status: 'approved',
        description: 'Key/value metadata atom for short structured detail clusters.',
        implementationFiles: [
          'components/DataList.tsx',
        ],
        governingDocs: [
          { label: 'information-density.md §2 — Metadata chunking', file: 'docs/design-system/information-density.md' },
        ],
      },
      {
        referenceId: 'ATM-023',
        slug: 'dialog',
        label: 'Dialog',
        status: 'candidate',
        description: 'Modal atom for interruptive confirmation or focused input when the user must resolve a task before continuing.',
        governingDocs: [
          { label: 'design-standards.md §11 — Alerts and feedback', file: 'docs/design-system/design-standards.md' },
          { label: 'frontend-standards.md §2 — Landmarks', file: 'docs/design-system/frontend-standards.md' },
        ],
      },
      {
        referenceId: 'ATM-024',
        slug: 'alert-dialog',
        label: 'Alert Dialog',
        status: 'candidate',
        description: 'High-stakes confirmation atom reserved for destructive or irreversible actions.',
        governingDocs: [
          { label: 'design-standards.md §11 — Alerts and feedback', file: 'docs/design-system/design-standards.md' },
          { label: 'content-standards.md §4 — Button and action labels', file: 'docs/design-system/content-standards.md' },
        ],
      },
      {
        referenceId: 'ATM-025',
        slug: 'dropdown-menu',
        label: 'Dropdown Menu',
        status: 'candidate',
        description: 'Compact action list atom for secondary actions anchored to a trigger button.',
        governingDocs: [
          { label: 'ux-standards.md §5 — Navigation consistency', file: 'docs/design-system/ux-standards.md' },
        ],
      },
      {
        referenceId: 'ATM-026',
        slug: 'context-menu',
        label: 'Context Menu',
        status: 'experimental',
        description: 'Right-click action list atom for power-user surfaces where contextual actions belong to a specific row or region.',
        governingDocs: [
          { label: 'ux-standards.md §1 — Component purpose and intent', file: 'docs/design-system/ux-standards.md' },
        ],
      },
      {
        referenceId: 'ATM-027',
        slug: 'popover',
        label: 'Popover',
        status: 'candidate',
        description: 'Anchored floating surface for lightweight controls and supporting information.',
        governingDocs: [
          { label: 'information-density.md §5 — Progressive disclosure', file: 'docs/design-system/information-density.md' },
        ],
      },
      {
        referenceId: 'ATM-028',
        slug: 'hover-card',
        label: 'Hover Card',
        status: 'experimental',
        description: 'Hover-revealed preview surface for secondary context that should not compete with the primary layout.',
        governingDocs: [
          { label: 'information-density.md §5 — Progressive disclosure', file: 'docs/design-system/information-density.md' },
        ],
      },
      {
        referenceId: 'ATM-029',
        slug: 'progress',
        label: 'Progress',
        status: 'candidate',
        description: 'Progress bar atom for bounded completion and workflow feedback.',
        governingDocs: [
          { label: 'design-standards.md §11 — Alerts and feedback', file: 'docs/design-system/design-standards.md' },
        ],
      },
      {
        referenceId: 'ATM-030',
        slug: 'scroll-area',
        label: 'Scroll Area',
        status: 'candidate',
        description: 'Contained scrolling surface for dense, bounded content where the surrounding layout must remain stable.',
        governingDocs: [
          { label: 'information-density.md §4 — Tables, cards, and lists', file: 'docs/design-system/information-density.md' },
        ],
      },
      {
        referenceId: 'ATM-031',
        slug: 'skeleton',
        label: 'Skeleton',
        status: 'candidate',
        description: 'Loading placeholder atom for preserving layout while content is still being fetched.',
        governingDocs: [
          { label: 'design-standards.md §11 — Alerts and feedback', file: 'docs/design-system/design-standards.md' },
        ],
      },
      {
        referenceId: 'ATM-032',
        slug: 'slider',
        label: 'Slider',
        status: 'candidate',
        description: 'Range input for numeric tuning where direct drag is clearer than a dropdown or text field.',
        implementationFiles: [
          'app/system/ui/atoms/page.tsx',
        ],
        governingDocs: [
          { label: 'design-standards.md §10 — Forms and inputs', file: 'docs/design-system/design-standards.md' },
          { label: 'ux-standards.md §1 — Component purpose and intent', file: 'docs/design-system/ux-standards.md' },
        ],
      },
      {
        referenceId: 'ATM-033',
        slug: 'spinner',
        label: 'Spinner',
        status: 'candidate',
        description: 'Minimal loading atom for short-running background actions and inline wait states.',
        governingDocs: [
          { label: 'design-standards.md §11 — Alerts and feedback', file: 'docs/design-system/design-standards.md' },
        ],
      },
      {
        referenceId: 'ATM-034',
        slug: 'inset',
        label: 'Inset',
        status: 'candidate',
        description: 'Card-bleed helper from Radix Themes for media and preview surfaces that intentionally reach a container edge.',
        implementationFiles: [
          'app/system/ui/_lib/atom-docs.tsx',
        ],
        governingDocs: [
          { label: 'design-standards.md §8 — Cards', file: 'docs/design-system/design-standards.md' },
          { label: 'information-density.md §4 — Tables, cards, and lists', file: 'docs/design-system/information-density.md' },
        ],
        related: [
          { label: 'Card', href: '/system/ui/atoms/cards' },
        ],
      },
      {
        referenceId: 'ATM-036',
        slug: 'separator',
        label: 'Separator',
        status: 'candidate',
        description: 'Horizontal and vertical dividers used to separate content without introducing extra card surfaces.',
        implementationFiles: [
          'app/(admin)/system/page.tsx',
          'components/Sidebar.tsx',
        ],
        governingDocs: [
          { label: 'information-density.md §2 — Metadata chunking', file: 'docs/design-system/information-density.md' },
          { label: 'design-standards.md §5 — Surfaces', file: 'docs/design-system/design-standards.md' },
        ],
        usedIn: [
          { label: 'Admin system', href: '/admin/system' },
          { label: 'Dashboard shell', href: '/home' },
        ],
      },
    ],
  },
  {
    key: 'fragments',
    label: 'Fragment components',
    basePath: '/system/ui/fragments',
    items: [
      {
        referenceId: 'FRG-001',
        slug: 'section-heading',
        label: 'Section heading',
        status: 'approved',
        description: 'Canonical heading fragment for card sections and standalone page sections.',
        implementationFiles: [
          'components/SectionHeading.tsx',
        ],
        governingDocs: [
          { label: 'design-standards.md §2 — Typography', file: 'docs/design-system/design-standards.md' },
          { label: 'art-direction.md §4 — Typography', file: 'docs/design-system/art-direction.md' },
        ],
        usedIn: [
          { label: 'Change detail', href: '/changes' },
          { label: 'Settings', href: '/settings' },
          { label: 'Admin reviews', href: '/admin/reviews' },
        ],
        related: [
          { label: 'Typography', href: '/system/ui/foundations/typography' },
        ],
      },
      {
        referenceId: 'FRG-002',
        slug: 'ai-trust',
        label: 'AI trust',
        status: 'approved',
        description: 'AiBadge and AiDisclaimer — the Cedar trust-signaling fragment applied to every AI-generated surface.',
        implementationFiles: [
          'components/AiBadge.tsx',
        ],
        governingDocs: [
          { label: 'design-standards.md §6 — AI trust signals', file: 'docs/design-system/design-standards.md' },
          { label: 'content-standards.md §5 — AI-generated content', file: 'docs/design-system/content-standards.md' },
        ],
        usedIn: [
          { label: 'Changes', href: '/changes' },
          { label: 'Change detail', href: '/changes' },
        ],
        related: [
          { label: 'Pattern: detail pages', href: '/system/ui/patterns/detail-pages' },
        ],
      },
      {
        referenceId: 'FRG-003',
        slug: 'filter-pills',
        label: 'Filter pills',
        status: 'approved',
        description: 'URL-driven horizontal filter bar for list and browse views.',
        implementationFiles: [
          'components/FilterPills.tsx',
        ],
        governingDocs: [
          { label: 'ux-standards.md §5 — Navigation and URL state', file: 'docs/design-system/ux-standards.md' },
        ],
        usedIn: [
          { label: 'Changes', href: '/changes' },
          { label: 'Library', href: '/library' },
        ],
        related: [
          { label: 'Pattern: collection pages', href: '/system/ui/patterns/collection-pages' },
        ],
      },
      {
        referenceId: 'FRG-004',
        slug: 'status-and-meta',
        label: 'Status and meta fragments',
        status: 'approved',
        description: 'SeverityBadge, StatusBadge, AuthorityBadge, ConfidenceBadge, DeadlineChip, and ServiceLineTag as Cedar’s semantic metadata wrappers.',
        implementationFiles: [
          'components/SeverityBadge.tsx',
          'components/StatusBadge.tsx',
          'components/AuthorityBadge.tsx',
          'components/ConfidenceBadge.tsx',
          'components/DeadlineChip.tsx',
          'components/ServiceLineTag.tsx',
        ],
        governingDocs: [
          { label: 'design-standards.md §7 — Badges and chips', file: 'docs/design-system/design-standards.md' },
          { label: 'information-density.md §2 — Metadata chunking', file: 'docs/design-system/information-density.md' },
        ],
        usedIn: [
          { label: 'Changes', href: '/changes' },
          { label: 'Library detail', href: '/library' },
          { label: 'Audit', href: '/audit' },
        ],
        related: [
          { label: 'Semantic color and status', href: '/system/ui/foundations/semantic-color' },
        ],
      },
      {
        referenceId: 'FRG-005',
        slug: 'hash-empty-upgrade',
        label: 'Hash, empty, and upgrade fragments',
        status: 'approved',
        description: 'Utility fragments for audit hashes, empty states, upgrade nudges, and legal disclaimers.',
        implementationFiles: [
          'components/HashWithCopy.tsx',
          'components/EmptyState.tsx',
          'components/UpgradeBanner.tsx',
          'components/LegalDisclaimer.tsx',
        ],
        governingDocs: [
          { label: 'information-density.md §7 — Truncation and copy', file: 'docs/design-system/information-density.md' },
          { label: 'content-standards.md §9 — Empty states', file: 'docs/design-system/content-standards.md' },
        ],
        usedIn: [
          { label: 'Audit', href: '/audit' },
          { label: 'Changes', href: '/changes' },
          { label: 'Pricing', href: '/pricing' },
        ],
      },
      {
        referenceId: 'FRG-006',
        slug: 'navigation-shell',
        label: 'Navigation shell fragments',
        status: 'approved',
        description: 'SidebarShell, SidebarLink, BreadcrumbNav, ThemeToggle, and SignOutButton as the Cedar shell layer.',
        implementationFiles: [
          'components/SidebarShell.tsx',
          'components/Sidebar.tsx',
          'components/SidebarLink.tsx',
          'components/BreadcrumbNav.tsx',
          'components/ThemeToggle.tsx',
          'components/SignOutButton.tsx',
        ],
        governingDocs: [
          { label: 'ux-standards.md §5 — Navigation consistency', file: 'docs/design-system/ux-standards.md' },
          { label: 'frontend-standards.md §2 — Landmarks', file: 'docs/design-system/frontend-standards.md' },
        ],
        usedIn: [
          { label: 'All dashboard routes', href: '/home' },
          { label: 'Admin routes', href: '/admin/system' },
        ],
      },
      {
        referenceId: 'FRG-007',
        slug: 'regulation-content',
        label: 'Regulation content fragments',
        status: 'candidate',
        description: 'DomainCard, RegulationRow, RelationshipCard, DataList, and ContentReader as the current regulation-library composition layer.',
        implementationFiles: [
          'components/DomainCard.tsx',
          'components/RegulationRow.tsx',
          'components/RelationshipCard.tsx',
          'components/DataList.tsx',
          'components/ContentReader.tsx',
        ],
        governingDocs: [
          { label: 'ux-standards.md §2 — Clickable collections', file: 'docs/design-system/ux-standards.md' },
          { label: 'information-density.md §3 — Summary/context/source', file: 'docs/design-system/information-density.md' },
        ],
        usedIn: [
          { label: 'Library', href: '/library' },
          { label: 'Regulation detail', href: '/library' },
        ],
      },
      {
        referenceId: 'FRG-008',
        slug: 'settings-and-admin',
        label: 'Settings and admin fragments',
        status: 'candidate',
        description: 'NotificationsForm, PracticesTable, and SlideOverPanel as the current Cedar admin/settings composition set.',
        implementationFiles: [
          'components/NotificationsForm.tsx',
          'components/admin/PracticesTable.tsx',
          'components/admin/SlideOverPanel.tsx',
        ],
        governingDocs: [
          { label: 'design-standards.md §10 — Forms and inputs', file: 'docs/design-system/design-standards.md' },
          { label: 'ux-standards.md §7 — Settings and forms', file: 'docs/design-system/ux-standards.md' },
        ],
        usedIn: [
          { label: 'Settings', href: '/settings' },
          { label: 'Admin practices', href: '/admin/practices' },
          { label: 'Admin reviews', href: '/admin/reviews' },
        ],
      },
      {
        referenceId: 'FRG-009',
        slug: 'sheets-and-panels',
        label: 'Sheets and panels',
        status: 'candidate',
        description: 'Slide-over panels and non-modal side sheets used for focused admin inspection without leaving the current page.',
        implementationFiles: [
          'components/admin/SlideOverPanel.tsx',
          'components/Sidebar.tsx',
          'components/SidebarShell.tsx',
        ],
        governingDocs: [
          { label: 'design-standards.md §3 — Component architecture', file: 'docs/design-system/design-standards.md' },
          { label: 'ux-standards.md §5 — Navigation consistency', file: 'docs/design-system/ux-standards.md' },
        ],
        usedIn: [
          { label: 'Admin practices', href: '/admin/practices' },
          { label: 'Admin reviews', href: '/admin/reviews' },
          { label: 'Dashboard shell', href: '/home' },
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
        referenceId: 'PAT-001',
        slug: 'layout',
        label: 'Page layout',
        status: 'approved',
        description: 'The three Cedar page types — collection, detail, and settings — with visual examples of each.',
        implementationFiles: [
          'components/SidebarShell.tsx',
          'app/(dashboard)/home/page.tsx',
          'app/(dashboard)/changes/[id]/page.tsx',
          'app/(dashboard)/settings/page.tsx',
        ],
        governingDocs: [
          { label: 'design-standards.md §3 — Layout', file: 'docs/design-system/design-standards.md' },
          { label: 'information-density.md', file: 'docs/design-system/information-density.md' },
        ],
        usedIn: [
          { label: 'All Cedar routes', href: '/changes' },
        ],
        related: [
          { label: 'Foundations: layout primitives', href: '/system/ui/foundations/layout-primitives' },
          { label: 'Collection pages', href: '/system/ui/patterns/collection-pages' },
          { label: 'Detail pages', href: '/system/ui/patterns/detail-pages' },
        ],
      },
      {
        referenceId: 'PAT-002',
        slug: 'collection-pages',
        label: 'Collection pages',
        status: 'approved',
        description: 'Header, count badge, filter bar, and data region composition for list and browse views.',
        implementationFiles: [
          'app/(dashboard)/changes/page.tsx',
          'app/(dashboard)/sources/page.tsx',
          'app/(dashboard)/library/page.tsx',
          'app/(dashboard)/audit/page.tsx',
        ],
        governingDocs: [
          { label: 'information-density.md §4 — Tables, cards, and lists', file: 'docs/design-system/information-density.md' },
          { label: 'ux-standards.md §2 — Clickable collections', file: 'docs/design-system/ux-standards.md' },
        ],
        usedIn: [
          { label: 'Changes', href: '/changes' },
          { label: 'Sources', href: '/sources' },
          { label: 'Library', href: '/library' },
          { label: 'Audit', href: '/audit' },
        ],
      },
      {
        referenceId: 'PAT-003',
        slug: 'detail-pages',
        label: 'Detail pages',
        status: 'candidate',
        description: 'Header clusters, tabbed content, side metadata, and AI summary placement for detail views.',
        implementationFiles: [
          'app/(dashboard)/changes/[id]/page.tsx',
          'app/(dashboard)/library/[slug]/[id]/page.tsx',
          'app/(dashboard)/library/[slug]/[id]/RegulationTabs.tsx',
        ],
        governingDocs: [
          { label: 'information-density.md §3 — Summary first, source second, detail third', file: 'docs/design-system/information-density.md' },
          { label: 'ux-standards.md §5 — Navigation consistency', file: 'docs/design-system/ux-standards.md' },
        ],
        usedIn: [
          { label: 'Change detail', href: '/changes' },
          { label: 'Regulation detail', href: '/library' },
        ],
      },
      {
        referenceId: 'PAT-004',
        slug: 'settings-pages',
        label: 'Settings pages',
        status: 'approved',
        description: 'Single-column stacked-card settings pages with one concern per card and action discipline.',
        implementationFiles: [
          'app/(dashboard)/settings/page.tsx',
          'app/(admin)/system/page.tsx',
        ],
        governingDocs: [
          { label: 'information-density.md §1 — Density model', file: 'docs/design-system/information-density.md' },
          { label: 'ux-standards.md §7 — Settings and forms', file: 'docs/design-system/ux-standards.md' },
        ],
        usedIn: [
          { label: 'Settings', href: '/settings' },
          { label: 'Admin system', href: '/admin/system' },
        ],
      },
      {
        referenceId: 'PAT-005',
        slug: 'tables',
        label: 'Tables',
        status: 'approved',
        description: 'Clickable-row table behavior, ghost-vs-surface usage, and Cedar’s table-specific affordances.',
        implementationFiles: [
          'app/(dashboard)/changes/ChangeTableRow.tsx',
          'app/(dashboard)/changes/page.tsx',
          'app/(dashboard)/audit/page.tsx',
        ],
        governingDocs: [
          { label: 'ux-standards.md §2 — Table rows as navigation targets', file: 'docs/design-system/ux-standards.md' },
          { label: 'design-standards.md §9 — Tables', file: 'docs/design-system/design-standards.md' },
        ],
        usedIn: [
          { label: 'Changes', href: '/changes' },
          { label: 'Audit', href: '/audit' },
          { label: 'Sources', href: '/sources' },
        ],
      },
      {
        referenceId: 'PAT-006',
        slug: 'review-workflow',
        label: 'Review workflow',
        status: 'candidate',
        description: 'Queue list, decision panel, and approve/edit/reject action cluster for reviewer and admin workflows.',
        implementationFiles: [
          'app/(admin)/reviews/page.tsx',
          'app/(admin)/reviews/[id]/page.tsx',
          'app/(admin)/reviews/ReviewActions.tsx',
        ],
        governingDocs: [
          { label: 'ux-standards.md §1 — Component purpose and intent', file: 'docs/design-system/ux-standards.md' },
          { label: 'content-standards.md §4 — Button and action labels', file: 'docs/design-system/content-standards.md' },
        ],
        usedIn: [
          { label: 'Admin reviews', href: '/admin/reviews' },
        ],
      },
    ],
  },
]

export function getAllSlugs(groupKey: LibraryGroupKey): string[] {
  const group = LIBRARY_NAV.find((g) => g.key === groupKey)
  return group ? group.items.map((i) => i.slug) : []
}

export function getLibraryItem(groupKey: LibraryGroupKey, slug: string): LibraryNavItem | undefined {
  const group = LIBRARY_NAV.find((g) => g.key === groupKey)
  return group?.items.find((i) => i.slug === slug)
}

export function getLibraryGroup(groupKey: LibraryGroupKey): LibraryNavGroup | undefined {
  return LIBRARY_NAV.find((g) => g.key === groupKey)
}
