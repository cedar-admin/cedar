import Link from 'next/link'
import { Badge, Box, Flex, Heading, Text } from '@radix-ui/themes'
import { LIBRARY_NAV } from './_lib/nav-config'

const V1_INVENTORY = LIBRARY_NAV.flatMap((group) =>
  group.items.map((item) => ({ ...item, groupLabel: group.label, href: `${group.basePath}/${item.slug}` }))
)

const DEFERRED = [
  { label: 'Buttons', reason: 'Documented in design-standards.md §7. Extract when 3+ button-adjacent issues recur.' },
  { label: 'Hash with copy', reason: 'Used only in audit trail. Document when audit UI expands.' },
  { label: 'Domain card', reason: 'Library-specific. Document when the domain browsing grid is redesigned.' },
  { label: 'Navigation', reason: 'Sidebar + breadcrumb rules are stable. Document when nav structure changes.' },
  { label: 'Empty states', reason: 'EmptyState component is self-documenting. Document when variants multiply.' },
  { label: 'Settings section', reason: 'Well-understood composition. Document before adding new settings pages.' },
]

function StatusDot({ status }: { status: 'approved' | 'candidate' | 'experimental' }) {
  if (status === 'approved') return <Badge color="green" variant="soft" size="1">Approved</Badge>
  if (status === 'candidate') return <Badge color="amber" variant="soft" size="1">Candidate</Badge>
  return <Badge color="blue" variant="soft" size="1">Experimental</Badge>
}

export default function UILibraryOverviewPage() {
  return (
    <Flex direction="column" gap="6">
      {/* Page title */}
      <div>
        <Heading as="h1" size="6" weight="bold">UI library</Heading>
        <Text as="p" size="2" color="gray" mt="1">
          Cedar&rsquo;s internal design-ops reference. Use it before building UI, reviewing a PRP, or deciding which component to reach for.
        </Text>
      </div>

      {/* What this is */}
      <Flex direction="column" gap="2">
        <Heading as="h2" size="4" weight="medium">What this is</Heading>
        <Text as="p" size="2" color="gray" className="leading-relaxed">
          A routed design-ops workspace. Each page answers the same set of questions in the same order:
          what is this, when should you use it, what are the hard rules, what does the approved version look like,
          where is it used in Cedar today, and which docs govern it.
        </Text>
        <Text as="p" size="2" color="gray" className="leading-relaxed">
          v1 is intentionally small. Depth over breadth — 11 pages that cover Cedar&rsquo;s highest-risk drift points,
          rather than 16+ thin stubs covering every possible atom.
        </Text>
      </Flex>

      {/* How to choose */}
      <Flex direction="column" gap="2">
        <Heading as="h2" size="4" weight="medium">How to choose</Heading>
        <Flex direction="column" gap="3">
          <Flex gap="3" align="start">
            <Text as="span" size="2" weight="medium" className="shrink-0 w-28">Foundations</Text>
            <Text as="span" size="2" color="gray">Design primitives: typography scale, semantic color mappings, surface and spacing rules. Start here when you need to know what value or variant to use for a specific visual property.</Text>
          </Flex>
          <Flex gap="3" align="start">
            <Text as="span" size="2" weight="medium" className="shrink-0 w-28">Components</Text>
            <Text as="span" size="2" color="gray">Cedar composite components. Start here when you need to render a specific Cedar element — a section heading, an AI badge, a filter bar.</Text>
          </Flex>
          <Flex gap="3" align="start">
            <Text as="span" size="2" weight="medium" className="shrink-0 w-28">UI patterns</Text>
            <Text as="span" size="2" color="gray">Higher-order compositions. Start here when you need to understand how a full page type or section should be assembled from primitives and components.</Text>
          </Flex>
        </Flex>
      </Flex>

      {/* Status lifecycle */}
      <Flex direction="column" gap="2">
        <Heading as="h2" size="4" weight="medium">Status lifecycle</Heading>
        <Flex direction="column" gap="3">
          <Flex align="start" gap="3">
            <Badge color="green" variant="soft" className="shrink-0 mt-0.5">Approved</Badge>
            <Text as="span" size="2" color="gray">Canonical. Use in production. This is the correct implementation for this pattern everywhere in Cedar.</Text>
          </Flex>
          <Flex align="start" gap="3">
            <Badge color="amber" variant="soft" className="shrink-0 mt-0.5">Candidate</Badge>
            <Text as="span" size="2" color="gray">Proposed for adoption. Guidance is written and examples are live, but the pattern may still change before promotion. Use with awareness.</Text>
          </Flex>
          <Flex align="start" gap="3">
            <Badge color="blue" variant="soft" className="shrink-0 mt-0.5">Experimental</Badge>
            <Text as="span" size="2" color="gray">Exploratory. Do not use in production in current form. Present in the library for feedback collection only.</Text>
          </Flex>
        </Flex>
        <Text as="p" size="2" color="gray" mt="1">
          New pages always enter as <code className="font-mono text-xs">candidate</code> first — never directly as approved.
          Promote to approved by changing <code className="font-mono text-xs">status</code> in{' '}
          <code className="font-mono text-xs">_lib/nav-config.ts</code>.
        </Text>
      </Flex>

      {/* v1 inventory */}
      <Flex direction="column" gap="2">
        <Heading as="h2" size="4" weight="medium">v1 inventory ({V1_INVENTORY.length} pages)</Heading>
        <Flex direction="column" gap="1">
          {V1_INVENTORY.map((item) => (
            <Flex key={item.href} align="center" gap="3" className="py-1.5 border-b border-[var(--cedar-border-subtle)] last:border-0">
              <Link href={item.href} className="text-sm font-medium text-[var(--cedar-text-primary)] hover:underline underline-offset-2 w-44 shrink-0">
                {item.label}
              </Link>
              <StatusDot status={item.status} />
              <Text as="span" size="1" color="gray" className="hidden sm:block">{item.description}</Text>
            </Flex>
          ))}
        </Flex>
      </Flex>

      {/* Deferred inventory */}
      <Flex direction="column" gap="2">
        <Heading as="h2" size="4" weight="medium">Deferred from v1</Heading>
        <Text as="p" size="2" color="gray">
          These patterns exist in Cedar but are not yet documented here. They are removed from the active
          library to keep v1 sharp — not lost. Each one has a note on when to add it.
        </Text>
        <Flex direction="column" gap="2" mt="1">
          {DEFERRED.map((item) => (
            <Flex key={item.label} gap="3" align="start" className="py-1.5 border-b border-[var(--cedar-border-subtle)] last:border-0">
              <Text as="span" size="2" weight="medium" className="shrink-0 w-36">{item.label}</Text>
              <Text as="span" size="2" color="gray">{item.reason}</Text>
            </Flex>
          ))}
        </Flex>
      </Flex>

      {/* How to add a page */}
      <Flex direction="column" gap="2">
        <Heading as="h2" size="4" weight="medium">Adding a page</Heading>
        <ol className="flex flex-col gap-2 ml-4 list-decimal">
          <li><Text as="span" size="2" color="gray">Add an entry to <code className="font-mono text-xs">_lib/nav-config.ts</code> with <code className="font-mono text-xs">status: &apos;candidate&apos;</code></Text></li>
          <li><Text as="span" size="2" color="gray">Add a render case in the appropriate <code className="font-mono text-xs">[slug]/page.tsx</code></Text></li>
          <li><Text as="span" size="2" color="gray">Write all seven sections: description, when to use, hard rules, anatomy, live example, used in Cedar, governing docs</Text></li>
          <li><Text as="span" size="2" color="gray">After review, update status to <code className="font-mono text-xs">approved</code> in nav-config</Text></li>
        </ol>
        <Text as="p" size="2" color="gray" mt="1">
          Adding a page is always: one config entry + one render case. No structural changes needed.
        </Text>
      </Flex>

      {/* Reference */}
      <Box>
        <Text as="p" size="2" color="gray">
          Reference this library in PRPs using URLs:{' '}
          <code className="font-mono text-xs">&ldquo;Match /system/ui/patterns/tables&rdquo;</code>. Admin-only. Non-admin users are redirected to <code className="font-mono text-xs">/home</code>.
        </Text>
      </Box>
    </Flex>
  )
}
