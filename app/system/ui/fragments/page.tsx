import { Badge, Box, Card, Flex, Grid, Heading, Text } from '@radix-ui/themes'
import { getLibraryGroup } from '../_lib/nav-config'
import { LibraryIndexCard } from '../_lib/LibraryIndexCard'
import { SAMPLE_COPY, SAMPLE_DOMAIN, SAMPLE_FILTER_PILLS, SAMPLE_HASHES } from '../_lib/demo-data'
import { AiBadge } from '@/components/AiBadge'
import { AuthorityBadge } from '@/components/AuthorityBadge'
import { ConfidenceBadge } from '@/components/ConfidenceBadge'
import { DomainCard } from '@/components/DomainCard'
import { FilterPills } from '@/components/FilterPills'
import { HashWithCopy } from '@/components/HashWithCopy'
import { NotificationsForm } from '@/components/NotificationsForm'
import { SectionHeading } from '@/components/SectionHeading'
import { ServiceLineTag } from '@/components/ServiceLineTag'
import { SeverityBadge } from '@/components/SeverityBadge'
import { SidebarLink } from '@/components/SidebarLink'
import { StatusBadge } from '@/components/StatusBadge'

export default function FragmentsIndexPage() {
  const group = getLibraryGroup('fragments')
  if (!group) return null

  const hrefFor = (slug: string) => `${group.basePath}/${slug}`
  const items = Object.fromEntries(group.items.map((item) => [item.slug, item]))

  return (
    <Flex direction="column" gap="8">
      <Flex direction="column" gap="3">
        <Heading as="h1" size="6" weight="bold">Fragment components</Heading>
        <Text as="p" size="3" color="gray" className="max-w-4xl leading-relaxed">
          Fragments are Cedar&rsquo;s reusable composites: small but meaningful building blocks assembled from atoms to solve
          recurring product needs like trust signaling, metadata, content browsing, shell navigation, and settings workflows.
        </Text>
      </Flex>

      <Grid columns={{ initial: '1', md: '2' }} gap="5">
        <LibraryIndexCard
          href={hrefFor('section-heading')}
          label={items['section-heading'].label}
          referenceId={items['section-heading'].referenceId}
          description={items['section-heading'].description}
          status={items['section-heading'].status}
          preview={
            <Flex direction="column" gap="2">
              <SectionHeading as="h2" variant="standalone">Recent changes</SectionHeading>
              <SectionHeading as="h3" variant="card">AI summary</SectionHeading>
            </Flex>
          }
        />

        <LibraryIndexCard
          href={hrefFor('ai-trust')}
          label={items['ai-trust'].label}
          referenceId={items['ai-trust'].referenceId}
          description={items['ai-trust'].description}
          status={items['ai-trust'].status}
          preview={
            <Flex direction="column" gap="2">
              <Flex gap="2" align="center">
                <SectionHeading as="h3" variant="card">AI summary</SectionHeading>
                <AiBadge />
              </Flex>
              <Text as="p" size="2" color="gray">{SAMPLE_COPY.aiSummary}</Text>
            </Flex>
          }
        />

        <LibraryIndexCard
          href={hrefFor('filter-pills')}
          label={items['filter-pills'].label}
          referenceId={items['filter-pills'].referenceId}
          description={items['filter-pills'].description}
          status={items['filter-pills'].status}
          preview={<FilterPills pills={SAMPLE_FILTER_PILLS} />}
        />

        <LibraryIndexCard
          href={hrefFor('status-and-meta')}
          label={items['status-and-meta'].label}
          referenceId={items['status-and-meta'].referenceId}
          description={items['status-and-meta'].description}
          status={items['status-and-meta'].status}
          preview={
            <Flex wrap="wrap" gap="2">
              <SeverityBadge severity="high" />
              <StatusBadge status="pending_review" />
              <AuthorityBadge level="state_board_rule" />
              <ConfidenceBadge confidence={0.81} />
              <ServiceLineTag name="Med spa" />
            </Flex>
          }
        />

        <LibraryIndexCard
          href={hrefFor('hash-empty-upgrade')}
          label={items['hash-empty-upgrade'].label}
          referenceId={items['hash-empty-upgrade'].referenceId}
          description={items['hash-empty-upgrade'].description}
          status={items['hash-empty-upgrade'].status}
          preview={<HashWithCopy hash={SAMPLE_HASHES.sha256} />}
        />

        <LibraryIndexCard
          href={hrefFor('navigation-shell')}
          label={items['navigation-shell'].label}
          referenceId={items['navigation-shell'].referenceId}
          description={items['navigation-shell'].description}
          status={items['navigation-shell'].status}
          preview={
            <Flex direction="column" gap="1">
              <SidebarLink href="/home" label="Home" icon="ri-home-4-line" />
              <SidebarLink href="/changes" label="Changes" icon="ri-pulse-line" />
              <SidebarLink href="/library" label="Regulation Library" icon="ri-book-2-line" />
            </Flex>
          }
        />

        <LibraryIndexCard
          href={hrefFor('regulation-content')}
          label={items['regulation-content'].label}
          referenceId={items['regulation-content'].referenceId}
          description={items['regulation-content'].description}
          status={items['regulation-content'].status}
          preview={
            <DomainCard
              domain={SAMPLE_DOMAIN}
              regulationCount={24}
              recentChangeCount={3}
              highestSeverity="high"
            />
          }
        />

        <LibraryIndexCard
          href={hrefFor('settings-and-admin')}
          label={items['settings-and-admin'].label}
          referenceId={items['settings-and-admin'].referenceId}
          description={items['settings-and-admin'].description}
          status={items['settings-and-admin'].status}
          preview={
            <Flex direction="column" gap="3">
              <NotificationsForm
                initial={{
                  email_alerts: true,
                  email_threshold: 'high',
                  weekly_digest: false,
                }}
              />
              <Flex wrap="wrap" gap="2">
                <Badge variant="outline" color="gray">PracticesTable</Badge>
                <Badge variant="outline" color="gray">SlideOverPanel</Badge>
              </Flex>
            </Flex>
            }
          />

        <LibraryIndexCard
          href={hrefFor('sheets-and-panels')}
          label={items['sheets-and-panels'].label}
          referenceId={items['sheets-and-panels'].referenceId}
          description={items['sheets-and-panels'].description}
          status={items['sheets-and-panels'].status}
          preview={
            <Flex justify="end">
              <Box className="w-44 rounded-l-xl border-l border-[var(--cedar-border-subtle)] bg-[var(--cedar-panel-bg-solid)] px-4 py-5 shadow-[var(--shadow-3)]">
                <Flex direction="column" gap="2">
                  <Text as="span" size="2" weight="medium">Log details</Text>
                  <Text as="p" size="2" color="gray">Non-modal detail panel layered over the current screen.</Text>
                </Flex>
              </Box>
            </Flex>
          }
        />
      </Grid>
    </Flex>
  )
}
