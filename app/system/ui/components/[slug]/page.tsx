import { notFound } from 'next/navigation'
import { Box, Card, Flex, Text } from '@radix-ui/themes'
import { getAllSlugs, getLibraryItem } from '../../_lib/nav-config'
import { DetailPage, ContentSection } from '../../_lib/DetailPage'
import { PreviewFrame } from '../../_lib/PreviewFrame'
import { SAMPLE_FILTER_PILLS } from '../../_lib/demo-data'
import { SectionHeading } from '@/components/SectionHeading'
import { FilterPills } from '@/components/FilterPills'
import { AiBadge, AiDisclaimer } from '@/components/AiBadge'

export function generateStaticParams() {
  return getAllSlugs('components').map((slug) => ({ slug }))
}

export default async function ComponentsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const item = getLibraryItem('components', slug)
  if (!item) notFound()

  if (slug === 'section-heading') {
    return (
      <DetailPage item={item}>
        <ContentSection heading="When to use">
          <Text as="p" size="2" color="gray" className="leading-relaxed">
            Use <code className="font-mono text-xs">SectionHeading</code> for all section labels inside cards and for
            standalone page sections. Never use a raw <code className="font-mono text-xs">{'<Heading>'}</code> with an
            ad-hoc size for section labeling — SectionHeading encodes the approved size and weight for each context
            and is the single source of truth for that decision.
          </Text>
        </ContentSection>

        <ContentSection heading="Hard rules">
          <ul className="flex flex-col gap-2 ml-4 list-disc">
            <li><Text as="span" size="2" color="gray"><code className="font-mono text-xs">variant=&quot;card&quot;</code> (default) — inside Card surfaces. Renders at <code className="font-mono text-xs">size=&quot;3&quot; weight=&quot;medium&quot;</code> (14px)</Text></li>
            <li><Text as="span" size="2" color="gray"><code className="font-mono text-xs">variant=&quot;standalone&quot;</code> — page-level sections outside cards. Renders at <code className="font-mono text-xs">size=&quot;4&quot; weight=&quot;medium&quot;</code> (16px)</Text></li>
            <li><Text as="span" size="2" color="gray">Always set the <code className="font-mono text-xs">as</code> prop to match the semantic heading level in the page hierarchy</Text></li>
            <li><Text as="span" size="2" color="gray">Never use <code className="font-mono text-xs">weight=&quot;bold&quot;</code> on a section heading — that is reserved for page titles and stat values only</Text></li>
          </ul>
        </ContentSection>

        <ContentSection heading="Anatomy">
          <PreviewFrame size="full-width" label="variant=&quot;card&quot; — inside a Card surface">
            <Card variant="surface">
              <Box p="4">
                <SectionHeading as="h3" variant="card">AI summary</SectionHeading>
                <Text as="p" size="2" color="gray" mt="2">Section content follows here. The heading sits flush at card padding with no extra margin above.</Text>
              </Box>
            </Card>
          </PreviewFrame>

          <PreviewFrame size="full-width" label="variant=&quot;standalone&quot; — page section outside a card">
            <Flex direction="column" gap="3">
              <SectionHeading as="h2" variant="standalone">Regulatory updates</SectionHeading>
              <Text as="p" size="2" color="gray">Section content follows here. Standalone sections use gap=&quot;3&quot; between heading and body.</Text>
            </Flex>
          </PreviewFrame>
        </ContentSection>

        <ContentSection heading="Forbidden patterns">
          <ul className="flex flex-col gap-2 ml-4 list-disc">
            <li><Text as="span" size="2" color="gray">Raw <code className="font-mono text-xs">{'<Heading size="3" weight="medium">'}</code> in place of <code className="font-mono text-xs">SectionHeading</code></Text></li>
            <li><Text as="span" size="2" color="gray"><code className="font-mono text-xs">variant=&quot;standalone&quot;</code> inside a card — use <code className="font-mono text-xs">variant=&quot;card&quot;</code> instead</Text></li>
            <li><Text as="span" size="2" color="gray">Missing <code className="font-mono text-xs">as</code> prop — always set the semantic heading level</Text></li>
          </ul>
        </ContentSection>
      </DetailPage>
    )
  }

  if (slug === 'ai-trust') {
    return (
      <DetailPage item={item}>
        <ContentSection heading="When to use">
          <Text as="p" size="2" color="gray" className="leading-relaxed">
            <code className="font-mono text-xs">AiBadge</code> appears on every AI-generated content item — on collection
            rows and detail views, at every tier. <code className="font-mono text-xs">AiDisclaimer</code> appears on detail
            views only, as the last element inside the AI content card. Both are required, non-configurable, and not optional.
          </Text>
          <Text as="p" size="2" color="gray" className="leading-relaxed" mt="2">
            Cedar&rsquo;s credibility depends on transparent AI labeling. Omitting either component on an AI surface
            is a product defect, not a design choice.
          </Text>
        </ContentSection>

        <ContentSection heading="Hard rules">
          <ul className="flex flex-col gap-2 ml-4 list-disc">
            <li><Text as="span" size="2" color="gray">AiBadge renders inline with other metadata badges using <code className="font-mono text-xs">{'<Flex align="center" gap="2">'}</code></Text></li>
            <li><Text as="span" size="2" color="gray">AiDisclaimer renders as the last element inside AI content cards on detail views — never omit it</Text></li>
            <li><Text as="span" size="2" color="gray">Neither component accepts props — appearance is intentionally fixed</Text></li>
            <li><Text as="span" size="2" color="gray">Do not substitute with a generic Badge — use only these named components</Text></li>
          </ul>
        </ContentSection>

        <ContentSection heading="Anatomy">
          <PreviewFrame size="inline" label="AiBadge — inline with metadata badges">
            <AiBadge />
          </PreviewFrame>

          <PreviewFrame size="contained" label="AI content card with AiDisclaimer — complete composition">
            <Card variant="surface">
              <Box p="4">
                <Flex align="center" gap="2" mb="3">
                  <SectionHeading as="h3" variant="card">AI summary</SectionHeading>
                  <AiBadge />
                </Flex>
                <Text as="p" size="2" color="gray" className="leading-relaxed">
                  This amendment updates telehealth prescribing requirements for Schedule III–V controlled
                  substances, requiring a prior in-person examination before remote prescribing. Practices
                  offering hormone optimization or weight management via telehealth are directly affected.
                </Text>
                <AiDisclaimer />
              </Box>
            </Card>
          </PreviewFrame>
        </ContentSection>

        <ContentSection heading="Disclaimer text">
          <Text as="p" size="2" color="gray" className="leading-relaxed italic">
            &ldquo;This summary was generated by AI and has not been reviewed by a licensed attorney. This is not legal advice. For decisions specific to your practice, consult your legal counsel.&rdquo;
          </Text>
          <Text as="p" size="2" color="gray" mt="2">
            This exact copy is baked into <code className="font-mono text-xs">AiDisclaimer</code>. Do not paraphrase or shorten it.
          </Text>
        </ContentSection>
      </DetailPage>
    )
  }

  if (slug === 'filter-pills') {
    return (
      <DetailPage item={item}>
        <ContentSection heading="When to use">
          <Text as="p" size="2" color="gray" className="leading-relaxed">
            Use FilterPills on any collection page (changes, sources, library) for category or severity filtering.
            Always URL-driven — never local React state. The active filter is encoded in the URL so the page
            is shareable and the browser back button works correctly.
          </Text>
        </ContentSection>

        <ContentSection heading="Hard rules">
          <ul className="flex flex-col gap-2 ml-4 list-disc">
            <li><Text as="span" size="2" color="gray">Each pill is a <code className="font-mono text-xs">{'<Link>'}</code> with an <code className="font-mono text-xs">href</code> — no <code className="font-mono text-xs">onClick</code> or local state</Text></li>
            <li><Text as="span" size="2" color="gray">One pill is always active — &ldquo;All&rdquo; resets to the unfiltered state</Text></li>
            <li><Text as="span" size="2" color="gray">The &ldquo;All&rdquo; pill is always first</Text></li>
            <li><Text as="span" size="2" color="gray">Pill labels are sentence case — &ldquo;Critical&rdquo; not &ldquo;CRITICAL&rdquo;</Text></li>
            <li><Text as="span" size="2" color="gray">Custom active styling uses the <code className="font-mono text-xs">activeClass</code> prop only — never ad-hoc className overrides</Text></li>
          </ul>
        </ContentSection>

        <ContentSection heading="Anatomy">
          <PreviewFrame size="full-width" label="Standard filter pills — All + four severity levels">
            <FilterPills pills={SAMPLE_FILTER_PILLS} />
          </PreviewFrame>
        </ContentSection>

        <ContentSection heading="Token reference">
          <Text as="p" size="2" color="gray">
            Active state tokens are defined in <code className="font-mono text-xs">app/globals.css</code>:
          </Text>
          <ul className="flex flex-col gap-1 ml-4 list-disc mt-2">
            <li><Text as="span" size="2" className="font-mono text-xs text-[var(--cedar-text-secondary)]">--cedar-filter-active-bg</Text></li>
            <li><Text as="span" size="2" className="font-mono text-xs text-[var(--cedar-text-secondary)]">--cedar-filter-active-text</Text></li>
            <li><Text as="span" size="2" className="font-mono text-xs text-[var(--cedar-text-secondary)]">--cedar-filter-active-border</Text></li>
          </ul>
        </ContentSection>
      </DetailPage>
    )
  }

  notFound()
}
