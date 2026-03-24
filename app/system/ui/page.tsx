import { Badge, Box, Flex, Heading, Text } from '@radix-ui/themes'

export default function UILibraryOverviewPage() {
  return (
    <Flex direction="column" gap="6">
      {/* Header */}
      <div>
        <Heading as="h1" size="6" weight="bold">UI library</Heading>
        <Text as="p" size="2" color="gray" mt="1">
          Cedar&rsquo;s internal design reference. Approved patterns, components, and foundations rendered in the real app environment.
        </Text>
      </div>

      {/* What this is */}
      <Flex direction="column" gap="3">
        <Heading as="h2" size="4" weight="medium">What this is</Heading>
        <Text as="p" size="2" color="gray" className="leading-relaxed">
          The UI library is a design operations workspace — not a component gallery. Inspired by
          Supabase&rsquo;s design system documentation, every page answers three questions: when should
          you use this pattern, what are the rules, and what does the approved version look like?
          That rigor is what separates a useful reference from a screenshot dump.
        </Text>
        <Text as="p" size="2" color="gray" className="leading-relaxed">
          Use this library before building any new UI, modifying existing pages, or reviewing a PRP
          that touches the frontend. It is the single source of truth for approved Cedar patterns.
        </Text>
      </Flex>

      {/* How to use it */}
      <Flex direction="column" gap="3">
        <Heading as="h2" size="4" weight="medium">How to use it</Heading>
        <ul className="flex flex-col gap-2 ml-4 list-disc">
          <li>
            <Text as="span" size="2" color="gray">Browse the left nav — four sections, 16 pages in v1</Text>
          </li>
          <li>
            <Text as="span" size="2" color="gray">Each page includes guidance on when to use the pattern, the rules, and live examples</Text>
          </li>
          <li>
            <Text as="span" size="2" color="gray">Reference patterns by URL in PRPs: &ldquo;Match <code className="font-mono text-xs">/system/ui/patterns/tables</code>&rdquo;</Text>
          </li>
          <li>
            <Text as="span" size="2" color="gray">New patterns enter as candidates first — never directly as approved</Text>
          </li>
        </ul>
      </Flex>

      {/* Library structure */}
      <Flex direction="column" gap="3">
        <Heading as="h2" size="4" weight="medium">Library structure</Heading>
        <Flex direction="column" gap="2">
          <Box>
            <Text as="p" size="2" weight="medium">Foundations</Text>
            <Text as="p" size="2" color="gray">Design primitives — typography, buttons, badge colors, and surface variants. The building blocks everything else is made from.</Text>
          </Box>
          <Box>
            <Text as="p" size="2" weight="medium">Components</Text>
            <Text as="p" size="2" color="gray">Reusable Cedar composites — section headings, filter pills, AI trust, hash display, and domain cards.</Text>
          </Box>
          <Box>
            <Text as="p" size="2" weight="medium">UI patterns</Text>
            <Text as="p" size="2" color="gray">Higher-order compositions — page layouts, navigation patterns, tables, empty states, and header clusters.</Text>
          </Box>
        </Flex>
      </Flex>

      {/* Status legend */}
      <Flex direction="column" gap="3">
        <Heading as="h2" size="4" weight="medium">Status legend</Heading>
        <Flex direction="column" gap="3">
          <Flex align="start" gap="3">
            <Badge color="green" variant="soft" className="shrink-0 mt-0.5">Approved</Badge>
            <Text as="span" size="2" color="gray">Canonical. Use in production. This is how the pattern looks and behaves everywhere.</Text>
          </Flex>
          <Flex align="start" gap="3">
            <Badge color="amber" variant="soft" className="shrink-0 mt-0.5">Candidate</Badge>
            <Text as="span" size="2" color="gray">Proposed for adoption. Under active review. May change before promotion.</Text>
          </Flex>
          <Flex align="start" gap="3">
            <Badge color="blue" variant="soft" className="shrink-0 mt-0.5">Experimental</Badge>
            <Text as="span" size="2" color="gray">Exploratory. Testing an idea. Not intended for production in current form.</Text>
          </Flex>
        </Flex>
      </Flex>

      {/* Adoption workflow */}
      <Flex direction="column" gap="3">
        <Heading as="h2" size="4" weight="medium">Adoption workflow</Heading>
        <ol className="flex flex-col gap-2 ml-4 list-decimal">
          <li><Text as="span" size="2" color="gray">Implement the pattern in this library as a candidate</Text></li>
          <li><Text as="span" size="2" color="gray">Add guidance content: when to use, rules, examples</Text></li>
          <li><Text as="span" size="2" color="gray">Review in context — check edge cases, dark mode, density</Text></li>
          <li><Text as="span" size="2" color="gray">Promote to approved by changing status in <code className="font-mono text-xs">nav-config.ts</code></Text></li>
          <li><Text as="span" size="2" color="gray">Propagate to production screens via a follow-up PRP</Text></li>
        </ol>
      </Flex>
    </Flex>
  )
}
