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
            Open this library before building any new Cedar UI, modifying an existing page, or reviewing a PRP
            that touches the frontend. The library documents Cedar foundations, atom components, fragments,
            and patterns with live examples and canonical implementation files. Checking here first prevents drift.
          </Text>
        </ContentSection>

        <ContentSection heading="Hard rules">
          <ul className="flex flex-col gap-2 ml-4 list-disc">
            <li><Text as="span" size="2" color="gray">Always check the approved pattern before building something custom</Text></li>
            <li><Text as="span" size="2" color="gray">New patterns enter as <code className="font-mono text-xs">candidate</code> first — never directly as <code className="font-mono text-xs">approved</code></Text></li>
            <li><Text as="span" size="2" color="gray">Every new library page must follow the full seven-section content model</Text></li>
            <li><Text as="span" size="2" color="gray">Every page gets a stable reference ID using the group prefix: <code className="font-mono text-xs">GST</code>, <code className="font-mono text-xs">FDN</code>, <code className="font-mono text-xs">ATM</code>, <code className="font-mono text-xs">FRG</code>, or <code className="font-mono text-xs">PAT</code></Text></li>
            <li><Text as="span" size="2" color="gray">Reference library pages by URL in PRPs: <code className="font-mono text-xs">&ldquo;Match /system/ui/patterns/tables&rdquo;</code></Text></li>
          </ul>
        </ContentSection>

        <ContentSection heading="The seven-section content model">
          <Text as="p" size="2" color="gray">
            Every detail page in this library follows this structure. This ordering is what makes it useful
            as a decision reference rather than a component gallery:
          </Text>
          <Flex direction="column" gap="2" mt="2">
            {[
              { label: '1. Title + status', desc: 'What the pattern is. Whether it is approved for production.' },
              { label: '2. Description', desc: '1–2 sentences on the pattern\'s purpose.' },
              { label: '3. When to use', desc: 'Decision criteria — when is this the right choice?' },
              { label: '4. Hard rules', desc: 'Required configurations and forbidden patterns.' },
              { label: '5. Anatomy / examples', desc: 'Live rendered examples using real Cedar components and tokens.' },
              { label: '6. Implementation files', desc: 'Canonical Cedar files to copy, audit, or update.' },
              { label: '7. Used in Cedar + governing docs', desc: 'Which product routes use this pattern today and which design docs own it.' },
            ].map((row) => (
              <Flex key={row.label} gap="3" align="start">
                <Text as="span" size="2" weight="medium" className="shrink-0 w-36">{row.label}</Text>
                <Text as="span" size="2" color="gray">{row.desc}</Text>
              </Flex>
            ))}
          </Flex>
        </ContentSection>

        <ContentSection heading="Adding a page">
          <ol className="flex flex-col gap-2 ml-4 list-decimal">
            <li><Text as="span" size="2" color="gray">Add an entry to <code className="font-mono text-xs">_lib/nav-config.ts</code> with <code className="font-mono text-xs">status: &apos;candidate&apos;</code></Text></li>
            <li><Text as="span" size="2" color="gray">Add a render case in the appropriate <code className="font-mono text-xs">[slug]/page.tsx</code></Text></li>
            <li><Text as="span" size="2" color="gray">Write all seven sections following the content model above</Text></li>
            <li><Text as="span" size="2" color="gray">After review, update status to <code className="font-mono text-xs">approved</code></Text></li>
          </ol>
          <Text as="p" size="2" color="gray" mt="2">
            One config entry + one render case. No structural changes needed.
          </Text>
        </ContentSection>
      </DetailPage>
    )
  }

  notFound()
}
