import { notFound } from 'next/navigation'
import { Flex, Text } from '@radix-ui/themes'
import { getAllSlugs, getLibraryItem } from '../../_lib/nav-config'
import { DetailPage, ContentSection } from '../../_lib/DetailPage'

export function generateStaticParams() {
  return getAllSlugs('getting-started').map((slug) => ({ slug }))
}

export default async function GettingStartedPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const item = getLibraryItem('getting-started', slug)
  if (!item) notFound()

  if (slug === 'overview') {
    return (
      <DetailPage item={item}>
        <ContentSection heading="When to use">
          <Text as="p" size="2" color="gray" className="leading-relaxed">
            Reference this library before building any new UI, modifying existing pages, or reviewing
            a PRP that touches the frontend. It documents the approved version of every pattern —
            checking here first prevents drift.
          </Text>
        </ContentSection>

        <ContentSection heading="Usage rules">
          <ul className="flex flex-col gap-2 ml-4 list-disc">
            <li><Text as="span" size="2" color="gray">Always check the approved pattern before building something custom</Text></li>
            <li><Text as="span" size="2" color="gray">Follow the standard content model when adding new pages to this library</Text></li>
            <li><Text as="span" size="2" color="gray">New patterns enter as <code className="font-mono text-xs">candidate</code> first — never directly as <code className="font-mono text-xs">approved</code></Text></li>
            <li><Text as="span" size="2" color="gray">Reference library URLs in PRPs for pattern consistency: &ldquo;Match <code className="font-mono text-xs">/system/ui/patterns/tables</code>&rdquo;</Text></li>
          </ul>
        </ContentSection>

        <ContentSection heading="The content model">
          <Text as="p" size="2" color="gray" className="leading-relaxed">
            Every page in this library follows a consistent structure. This is what makes it useful
            versus a plain component gallery:
          </Text>
          <Flex direction="column" gap="2" mt="2">
            {[
              { label: 'Title + status badge', desc: 'What the pattern is, and whether it is approved for production use' },
              { label: 'Description', desc: '1–2 sentences explaining the pattern\'s purpose' },
              { label: 'When to use', desc: 'Decision criteria — when is this the right choice?' },
              { label: 'Usage rules', desc: 'Required configurations, forbidden patterns, accessibility notes' },
              { label: 'Examples', desc: 'Live rendered examples with realistic sample data and labels' },
              { label: 'Notes (optional)', desc: 'Cross-references, adoption status, future considerations' },
            ].map((item) => (
              <Flex key={item.label} gap="3" align="start">
                <Text as="span" size="2" weight="medium" className="shrink-0 w-40">{item.label}</Text>
                <Text as="span" size="2" color="gray">{item.desc}</Text>
              </Flex>
            ))}
          </Flex>
        </ContentSection>

        <ContentSection heading="Adding new pages">
          <ol className="flex flex-col gap-2 ml-4 list-decimal">
            <li><Text as="span" size="2" color="gray">Add an entry to <code className="font-mono text-xs">_lib/nav-config.ts</code> with <code className="font-mono text-xs">status: &apos;candidate&apos;</code></Text></li>
            <li><Text as="span" size="2" color="gray">Add a render case in the appropriate <code className="font-mono text-xs">[slug]/page.tsx</code></Text></li>
            <li><Text as="span" size="2" color="gray">Write guidance content following the content model above</Text></li>
            <li><Text as="span" size="2" color="gray">After review, update status to <code className="font-mono text-xs">approved</code> in nav-config</Text></li>
          </ol>
          <Text as="p" size="2" color="gray" mt="2" className="leading-relaxed">
            No structural changes are needed — adding a page is always: 1 config entry + 1 render case.
          </Text>
        </ContentSection>
      </DetailPage>
    )
  }

  notFound()
}
