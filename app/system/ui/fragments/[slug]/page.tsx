import { notFound } from 'next/navigation'
import { Badge, Box, Button, Card, Flex, Text } from '@radix-ui/themes'
import { getAllSlugs, getLibraryItem } from '../../_lib/nav-config'
import { DetailPage, ContentSection } from '../../_lib/DetailPage'
import { ExampleBlock } from '../../_lib/ExampleBlock'
import { SAMPLE_COPY, SAMPLE_DOMAIN, SAMPLE_FILTER_PILLS, SAMPLE_HASHES } from '../../_lib/demo-data'
import { AiBadge, AiDisclaimer } from '@/components/AiBadge'
import { AuthorityBadge } from '@/components/AuthorityBadge'
import { BreadcrumbNav } from '@/components/BreadcrumbNav'
import { ConfidenceBadge } from '@/components/ConfidenceBadge'
import { ContentReader } from '@/components/ContentReader'
import { DataList } from '@/components/DataList'
import { DeadlineChip } from '@/components/DeadlineChip'
import { DomainCard } from '@/components/DomainCard'
import { EmptyState } from '@/components/EmptyState'
import { FilterPills } from '@/components/FilterPills'
import { HashWithCopy } from '@/components/HashWithCopy'
import { LegalDisclaimer } from '@/components/LegalDisclaimer'
import { NotificationsForm } from '@/components/NotificationsForm'
import { SectionHeading } from '@/components/SectionHeading'
import { ServiceLineTag } from '@/components/ServiceLineTag'
import { SeverityBadge } from '@/components/SeverityBadge'
import { SidebarLink } from '@/components/SidebarLink'
import { StatusBadge } from '@/components/StatusBadge'
import { ThemeToggle } from '@/components/ThemeToggle'
import { UpgradeBanner } from '@/components/UpgradeBanner'

export function generateStaticParams() {
  return getAllSlugs('fragments').map((slug) => ({ slug }))
}

export default async function FragmentsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const item = getLibraryItem('fragments', slug)
  if (!item) notFound()

  if (slug === 'section-heading') {
    return (
      <DetailPage item={item}>
        <ContentSection heading="When to use">
          <Text as="p" size="2" color="gray">
            Use <code className="font-mono text-xs">SectionHeading</code> for section labels inside cards and for
            standalone page sections. It is Cedar&rsquo;s canonical answer to &ldquo;what heading size should this be?&rdquo;
          </Text>
        </ContentSection>

        <ContentSection heading="Examples">
          <ExampleBlock
            title="Card and standalone variants"
            size="full-width"
            code={`<SectionHeading as="h3" variant="card">AI summary</SectionHeading>
<SectionHeading as="h2" variant="standalone">Recent changes</SectionHeading>`}
          >
            <Flex direction="column" gap="4">
              <Card variant="surface">
                <Box p="4">
                  <SectionHeading as="h3" variant="card">AI summary</SectionHeading>
                  <Text as="p" size="2" color="gray" mt="2">{SAMPLE_COPY.aiSummary}</Text>
                </Box>
              </Card>
              <Flex direction="column" gap="2">
                <SectionHeading as="h2" variant="standalone">Recent changes</SectionHeading>
                <Text as="p" size="2" color="gray">Standalone sections use the larger variant.</Text>
              </Flex>
            </Flex>
          </ExampleBlock>
        </ContentSection>
      </DetailPage>
    )
  }

  if (slug === 'ai-trust') {
    return (
      <DetailPage item={item}>
        <ContentSection heading="When to use">
          <Text as="p" size="2" color="gray">
            Every AI-generated surface in Cedar gets <code className="font-mono text-xs">AiBadge</code>. Detail views
            additionally get <code className="font-mono text-xs">AiDisclaimer</code> inside the AI content block.
          </Text>
        </ContentSection>

        <ContentSection heading="Examples">
          <ExampleBlock
            title="Complete AI summary composition"
            size="contained"
            code={`<Card variant="surface">
  <Box p="4">
    <Flex align="center" gap="2">
      <SectionHeading as="h3" variant="card">AI summary</SectionHeading>
      <AiBadge />
    </Flex>
    <Text as="p" size="2">{summary}</Text>
    <AiDisclaimer />
  </Box>
</Card>`}
          >
            <Card variant="surface">
              <Box p="4">
                <Flex align="center" gap="2" mb="3">
                  <SectionHeading as="h3" variant="card">AI summary</SectionHeading>
                  <AiBadge />
                </Flex>
                <Text as="p" size="2" color="gray">{SAMPLE_COPY.aiSummary}</Text>
                <AiDisclaimer />
              </Box>
            </Card>
          </ExampleBlock>
        </ContentSection>
      </DetailPage>
    )
  }

  if (slug === 'filter-pills') {
    return (
      <DetailPage item={item}>
        <ContentSection heading="When to use">
          <Text as="p" size="2" color="gray">
            Use <code className="font-mono text-xs">FilterPills</code> for shareable URL-driven collection filters.
            They are not a local-state tab substitute.
          </Text>
        </ContentSection>

        <ContentSection heading="Examples">
          <ExampleBlock
            title="Severity filtering"
            size="full-width"
            code={`<FilterPills pills={[
  { label: 'All', href: '/changes', isActive: true },
  { label: 'Critical', href: '/changes?severity=critical', isActive: false },
]} />`}
          >
            <FilterPills pills={SAMPLE_FILTER_PILLS} />
          </ExampleBlock>
        </ContentSection>
      </DetailPage>
    )
  }

  if (slug === 'status-and-meta') {
    return (
      <DetailPage item={item}>
        <ContentSection heading="When to use">
          <Text as="p" size="2" color="gray">
            These fragments wrap raw badge primitives into Cedar-specific meaning. Use them anywhere the same
            data needs to render the same way every time.
          </Text>
        </ContentSection>

        <ContentSection heading="Examples">
          <ExampleBlock title="Severity, status, authority, and confidence" size="full-width">
            <Flex wrap="wrap" gap="2">
              <SeverityBadge severity="critical" />
              <SeverityBadge severity="high" />
              <StatusBadge status="pending_review" />
              <AuthorityBadge level="state_board_rule" />
              <ConfidenceBadge confidence={0.87} />
              <DeadlineChip date="2026-04-15" />
              <ServiceLineTag name="Hormone optimization" />
            </Flex>
          </ExampleBlock>
        </ContentSection>
      </DetailPage>
    )
  }

  if (slug === 'hash-empty-upgrade') {
    return (
      <DetailPage item={item}>
        <ContentSection heading="When to use">
          <Text as="p" size="2" color="gray">
            These are utility fragments: audit hashes, empty states, upgrade prompts, and disclaimers.
            They keep repetitive product messaging and framing consistent.
          </Text>
        </ContentSection>

        <ContentSection heading="Examples">
          <ExampleBlock title="Hash with copy" size="inline">
            <HashWithCopy hash={SAMPLE_HASHES.sha256} />
          </ExampleBlock>

          <ExampleBlock title="Empty state" size="contained">
            <EmptyState
              icon="ri-inbox-line"
              title="No changes detected"
              description="Cedar will surface detected changes here as sources are monitored."
            />
          </ExampleBlock>

          <ExampleBlock title="Upgrade and legal disclaimer" size="full-width">
            <Flex direction="column" gap="4">
              <UpgradeBanner feature="Guidance" />
              <LegalDisclaimer />
            </Flex>
          </ExampleBlock>
        </ContentSection>
      </DetailPage>
    )
  }

  if (slug === 'navigation-shell') {
    return (
      <DetailPage item={item}>
        <ContentSection heading="When to use">
          <Text as="p" size="2" color="gray">
            These fragments make up Cedar&rsquo;s application shell. Use the real shell fragments instead of inventing
            one-off nav links, breadcrumbs, or chrome controls.
          </Text>
        </ContentSection>

        <ContentSection heading="Examples">
          <ExampleBlock title="Sidebar link states" size="contained">
            <Flex direction="column" gap="1">
              <SidebarLink href="/home" label="Home" icon="ri-home-line" />
              <SidebarLink href="/changes" label="Changes" icon="ri-notification-3-line" />
              <SidebarLink href="/library" label="Library" icon="ri-book-open-line" />
            </Flex>
          </ExampleBlock>

          <ExampleBlock title="Theme toggle and breadcrumb implementation" size="full-width">
            <Flex align="center" justify="between" wrap="wrap" gap="4">
              <BreadcrumbNav />
              <ThemeToggle />
            </Flex>
          </ExampleBlock>
        </ContentSection>
      </DetailPage>
    )
  }

  if (slug === 'regulation-content') {
    return (
      <DetailPage item={item}>
        <ContentSection heading="When to use">
          <Text as="p" size="2" color="gray">
            These fragments compose the library and detail-reading experience: browsing domains, scanning rows,
            reading related items, and opening content snapshots.
          </Text>
        </ContentSection>

        <ContentSection heading="Examples">
          <ExampleBlock title="Domain card" size="contained">
            <DomainCard
              domain={SAMPLE_DOMAIN}
              regulationCount={24}
              recentChangeCount={3}
              highestSeverity="high"
              headingLevel="h3"
            />
          </ExampleBlock>

          <ExampleBlock title="Data list and reader excerpt" size="full-width">
            <Flex direction="column" gap="4">
              <DataList
                items={[
                  {
                    id: 'chg-1',
                    href: '#',
                    severity: 'high',
                    title: 'Telehealth prescribing requirements updated',
                    subtitle: 'FL Board of Medicine',
                    timestamp: '2026-03-20T14:30:00Z',
                    trailing: <Badge variant="soft" color="gray">AI</Badge>,
                  },
                ]}
              />
              <ContentReader title="Source snapshot" content={'Section 1.\n\nRule text excerpt.\n\nSection 2.\n\nAdditional language.'} />
            </Flex>
          </ExampleBlock>
        </ContentSection>
      </DetailPage>
    )
  }

  if (slug === 'settings-and-admin') {
    return (
      <DetailPage item={item}>
        <ContentSection heading="When to use">
          <Text as="p" size="2" color="gray">
            These fragments are used in settings and admin workflows where the UI is more operational and form-heavy.
            Prefer live excerpts plus file references over fake mockups.
          </Text>
        </ContentSection>

        <ContentSection heading="Examples">
          <ExampleBlock title="Notifications form excerpt" size="contained">
            <NotificationsForm
              initial={{
                email_alerts: true,
                email_threshold: 'high',
                weekly_digest: false,
              }}
            />
          </ExampleBlock>

          <ExampleBlock
            title="Admin fragment implementation references"
            size="full-width"
            code={`// Table management
components/admin/PracticesTable.tsx

// Slide-over review/admin detail panel
components/admin/SlideOverPanel.tsx`}
          >
            <Card variant="surface">
              <Box p="4">
                <Text as="p" size="2" color="gray">
                  Practices table and slide-over panel are documented here as canonical implementation files.
                  They are too stateful to fake convincingly in the library without building a mini admin app inside the docs.
                </Text>
                <Flex gap="2" mt="3" wrap="wrap">
                  <Badge variant="outline" color="gray">PracticesTable</Badge>
                  <Badge variant="outline" color="gray">SlideOverPanel</Badge>
                </Flex>
              </Box>
            </Card>
          </ExampleBlock>
        </ContentSection>
      </DetailPage>
    )
  }

  if (slug === 'sheets-and-panels') {
    return (
      <DetailPage item={item}>
        <ContentSection heading="When to use">
          <Text as="p" size="2" color="gray">
            Use sheets and side panels when the user needs focused detail or an action cluster without losing the current page context.
            In Cedar these are Cedar composites, not raw Radix Themes atoms.
          </Text>
        </ContentSection>

        <ContentSection heading="Examples">
          <ExampleBlock
            title="Non-modal side panel composition"
            size="full-width"
            code={`<div className="ml-auto w-[400px] border-l ...">
  <Heading as="h2" size="4">Log details</Heading>
  ...
</div>`}
          >
            <Flex justify="end">
              <Box className="w-full max-w-[360px] rounded-l-xl border-l border-[var(--cedar-border-subtle)] bg-[var(--cedar-panel-bg-solid)] px-5 py-5 shadow-[var(--shadow-4)]">
                <Flex direction="column" gap="4">
                  <Flex align="center" justify="between">
                    <Text as="span" size="3" weight="medium">Log details</Text>
                    <Button variant="ghost" color="gray" size="1">Close</Button>
                  </Flex>
                  <Text as="p" size="2" color="gray">
                    This sheet does not block the underlying content, but it does overlap it. Cedar uses this pattern
                    for admin drill-in and side inspection workflows.
                  </Text>
                </Flex>
              </Box>
            </Flex>
          </ExampleBlock>
        </ContentSection>
      </DetailPage>
    )
  }

  notFound()
}
