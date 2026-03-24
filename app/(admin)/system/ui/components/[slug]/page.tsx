import { notFound } from 'next/navigation'
import { Box, Card, Flex, Text } from '@radix-ui/themes'
import { getAllSlugs, getLibraryItem } from '../../_lib/nav-config'
import { DetailPage, ContentSection } from '../../_lib/DetailPage'
import { PreviewFrame } from '../../_lib/PreviewFrame'
import { SAMPLE_DOMAIN, SAMPLE_FILTER_PILLS, SAMPLE_HASHES } from '../../_lib/demo-data'
import { SectionHeading } from '@/components/SectionHeading'
import { FilterPills } from '@/components/FilterPills'
import { AiBadge, AiDisclaimer } from '@/components/AiBadge'
import { HashWithCopy } from '@/components/HashWithCopy'
import { DomainCard } from '@/components/DomainCard'

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
            Use <code className="font-mono text-xs">SectionHeading</code> for all section labels inside cards and standalone
            page sections. Never use a raw <code className="font-mono text-xs">{'<Heading>'}</code> with an ad-hoc size for
            section labeling — SectionHeading encodes the approved size and weight for each context.
          </Text>
        </ContentSection>

        <ContentSection heading="Usage rules">
          <ul className="flex flex-col gap-2 ml-4 list-disc">
            <li><Text as="span" size="2" color="gray"><code className="font-mono text-xs">variant=&quot;card&quot;</code> (default) — inside Card surfaces. Renders at size 3 (14px medium)</Text></li>
            <li><Text as="span" size="2" color="gray"><code className="font-mono text-xs">variant=&quot;standalone&quot;</code> — page-level sections outside cards. Renders at size 4 (16px medium)</Text></li>
            <li><Text as="span" size="2" color="gray">Always set <code className="font-mono text-xs">as</code> prop matching the semantic heading level in the page hierarchy</Text></li>
            <li><Text as="span" size="2" color="gray">Use <code className="font-mono text-xs">id</code> prop for anchor-linkable sections</Text></li>
          </ul>
        </ContentSection>

        <ContentSection heading="Examples">
          <PreviewFrame size="full-width" label="variant=&quot;card&quot; (inside a card)">
            <Card variant="surface">
              <Box p="4">
                <SectionHeading as="h3" variant="card">AI summary</SectionHeading>
                <Text as="p" size="2" color="gray" mt="2">Section content follows here.</Text>
              </Box>
            </Card>
          </PreviewFrame>

          <PreviewFrame size="full-width" label="variant=&quot;standalone&quot; (page section)">
            <Flex direction="column" gap="2">
              <SectionHeading as="h2" variant="standalone">Regulatory updates</SectionHeading>
              <Text as="p" size="2" color="gray">Section content follows here.</Text>
            </Flex>
          </PreviewFrame>
        </ContentSection>
      </DetailPage>
    )
  }

  if (slug === 'filter-pills') {
    return (
      <DetailPage item={item}>
        <ContentSection heading="When to use">
          <Text as="p" size="2" color="gray" className="leading-relaxed">
            Use FilterPills on any collection page (changes, sources, library) for category or severity
            filtering. Always URL-driven — never local state. The active filter is encoded in the URL
            so that the page is shareable and the back button works correctly.
          </Text>
        </ContentSection>

        <ContentSection heading="Usage rules">
          <ul className="flex flex-col gap-2 ml-4 list-disc">
            <li><Text as="span" size="2" color="gray">Each pill is a <code className="font-mono text-xs">{'<Link>'}</code> with an <code className="font-mono text-xs">href</code> — no <code className="font-mono text-xs">onClick</code> state management</Text></li>
            <li><Text as="span" size="2" color="gray">One pill is always active — the &ldquo;All&rdquo; pill resets to the unfiltered state</Text></li>
            <li><Text as="span" size="2" color="gray">Pill labels use sentence case — &ldquo;Critical&rdquo; not &ldquo;CRITICAL&rdquo;</Text></li>
            <li><Text as="span" size="2" color="gray">The &ldquo;All&rdquo; pill is always first</Text></li>
            <li><Text as="span" size="2" color="gray">Custom active colors use the <code className="font-mono text-xs">activeClass</code> prop (for severity-specific colors)</Text></li>
          </ul>
        </ContentSection>

        <ContentSection heading="Examples">
          <PreviewFrame size="full-width" label="Standard filter pills">
            <FilterPills pills={SAMPLE_FILTER_PILLS} />
          </PreviewFrame>
        </ContentSection>

        <ContentSection heading="Notes">
          <Text as="p" size="2" color="gray" className="leading-relaxed">
            Active state tokens: <code className="font-mono text-xs">--cedar-filter-active-bg</code>,{' '}
            <code className="font-mono text-xs">--cedar-filter-active-text</code>,{' '}
            <code className="font-mono text-xs">--cedar-filter-active-border</code>. These are defined in{' '}
            <code className="font-mono text-xs">app/globals.css</code>.
          </Text>
        </ContentSection>
      </DetailPage>
    )
  }

  if (slug === 'ai-trust') {
    return (
      <DetailPage item={item}>
        <ContentSection heading="When to use">
          <Text as="p" size="2" color="gray" className="leading-relaxed">
            <code className="font-mono text-xs">AiBadge</code> appears on every AI-generated content item at every tier —
            on collection views and detail views. <code className="font-mono text-xs">AiDisclaimer</code> appears on detail
            views only, inside the AI content card, as the last element.
          </Text>
        </ContentSection>

        <ContentSection heading="Usage rules">
          <ul className="flex flex-col gap-2 ml-4 list-disc">
            <li><Text as="span" size="2" color="gray">AiBadge renders inline with other metadata badges using <code className="font-mono text-xs">{'<Flex align="center" gap="2">'}</code></Text></li>
            <li><Text as="span" size="2" color="gray">AiDisclaimer renders as the last element inside AI content containers — never omit it on detail views</Text></li>
            <li><Text as="span" size="2" color="gray">Neither component accepts props — appearance is fixed</Text></li>
            <li><Text as="span" size="2" color="gray">Cedar&rsquo;s credibility depends on transparent AI labeling. Never omit either component on AI surfaces</Text></li>
          </ul>
        </ContentSection>

        <ContentSection heading="Examples">
          <PreviewFrame size="inline" label="AiBadge (inline context)">
            <AiBadge />
          </PreviewFrame>

          <PreviewFrame size="contained" label="AI content card with AiDisclaimer">
            <Card variant="surface">
              <Box p="4">
                <Flex align="center" gap="2" mb="3">
                  <Text as="span" size="2" weight="medium">AI summary</Text>
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
      </DetailPage>
    )
  }

  if (slug === 'hash-with-copy') {
    return (
      <DetailPage item={item}>
        <ContentSection heading="When to use">
          <Text as="p" size="2" color="gray" className="leading-relaxed">
            Use HashWithCopy for any hash value in audit trail views, chain validation displays, and
            change record metadata. Truncating to 8 characters keeps audit tables readable while the
            copy action gives access to the full value.
          </Text>
        </ContentSection>

        <ContentSection heading="Usage rules">
          <ul className="flex flex-col gap-2 ml-4 list-disc">
            <li><Text as="span" size="2" color="gray">Default <code className="font-mono text-xs">displayLength</code> is 8 characters — sufficient for visual identification</Text></li>
            <li><Text as="span" size="2" color="gray">Copy action uses <code className="font-mono text-xs">navigator.clipboard</code> — fails silently if unavailable</Text></li>
            <li><Text as="span" size="2" color="gray">Truncation uses ellipsis character (…) — not three dots</Text></li>
            <li><Text as="span" size="2" color="gray">Never show the full 64-character SHA-256 inline — only in dedicated audit views</Text></li>
          </ul>
        </ContentSection>

        <ContentSection heading="Examples">
          <PreviewFrame size="inline" label="Default displayLength (8 chars)">
            <HashWithCopy hash={SAMPLE_HASHES.sha256} />
          </PreviewFrame>

          <PreviewFrame size="inline" label="Extended displayLength (12 chars)">
            <HashWithCopy hash={SAMPLE_HASHES.sha256} displayLength={12} />
          </PreviewFrame>
        </ContentSection>
      </DetailPage>
    )
  }

  if (slug === 'domain-card') {
    return (
      <DetailPage item={item}>
        <ContentSection heading="When to use">
          <Text as="p" size="2" color="gray" className="leading-relaxed">
            Use DomainCard for the domain/category browsing grid on the regulation library page.
            Each card represents a regulatory domain (Board of Medicine, Board of Pharmacy, etc.)
            and links to its filtered regulation list.
          </Text>
        </ContentSection>

        <ContentSection heading="Usage rules">
          <ul className="flex flex-col gap-2 ml-4 list-disc">
            <li><Text as="span" size="2" color="gray">Full-card click via <code className="font-mono text-xs">::after</code> pseudo-element on the heading link — no wrapper <code className="font-mono text-xs">{'<Link>'}</code></Text></li>
            <li><Text as="span" size="2" color="gray">SeverityBadge renders above the pseudo-element using <code className="font-mono text-xs">relative z-10</code> — so it remains clickable independently</Text></li>
            <li><Text as="span" size="2" color="gray">Description truncated at 2 lines with <code className="font-mono text-xs">line-clamp-2</code></Text></li>
            <li><Text as="span" size="2" color="gray">Set <code className="font-mono text-xs">headingLevel</code> based on page hierarchy — default is <code className="font-mono text-xs">h3</code></Text></li>
          </ul>
        </ContentSection>

        <ContentSection heading="Examples">
          <PreviewFrame size="contained" label="DomainCard with severity">
            <DomainCard
              domain={SAMPLE_DOMAIN}
              regulationCount={24}
              recentChangeCount={3}
              highestSeverity="high"
              headingLevel="h3"
            />
          </PreviewFrame>

          <PreviewFrame size="contained" label="DomainCard without severity">
            <DomainCard
              domain={{ ...SAMPLE_DOMAIN, name: 'Board of Pharmacy', slug: 'board-of-pharmacy' }}
              regulationCount={18}
              recentChangeCount={0}
              highestSeverity={null}
              headingLevel="h3"
            />
          </PreviewFrame>
        </ContentSection>
      </DetailPage>
    )
  }

  notFound()
}
