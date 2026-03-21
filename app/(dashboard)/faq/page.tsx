import { getLayoutData } from '@/lib/layout-data'
import { UpgradeBanner } from '@/components/UpgradeBanner'
import Link from 'next/link'
import { Card, Box, Flex, Heading, Text, Badge } from '@radix-ui/themes'
import { TextField } from '@radix-ui/themes'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'FAQ — Cedar' }

const MOCK_FAQS = [
  {
    id: 'faq-001',
    question: 'Can a Florida-licensed physician prescribe controlled substances via telehealth without an in-person visit?',
    topic: 'Telehealth',
    subtopic: 'Controlled Substances',
    jurisdiction: 'Florida / Federal',
    difficulty: 'Complex',
    lastReviewed: '2026-02-10',
    attorneyReviewed: true,
    excerpt: 'Under federal law (Ryan Haight Act) and Florida § 456.47, prescribing Schedule II controlled substances via telehealth generally requires a prior in-person evaluation, with narrow DEA exceptions…',
  },
  {
    id: 'faq-002',
    question: 'What beyond-use dates (BUDs) apply to non-sterile compounded preparations in Florida?',
    topic: 'Compounding',
    subtopic: 'Beyond-Use Dating',
    jurisdiction: 'Florida / Federal',
    difficulty: 'Moderate',
    lastReviewed: '2026-01-15',
    attorneyReviewed: true,
    excerpt: 'Florida Board of Pharmacy incorporates USP <795> standards for non-sterile compounding BUDs. The default BUDs are: aqueous preparations (14 days refrigerated), non-aqueous preparations (90 days)…',
  },
  {
    id: 'faq-003',
    question: 'Is a 503B outsourcing facility required to have a Florida pharmacy license?',
    topic: 'Compounding',
    subtopic: 'Outsourcing Facilities',
    jurisdiction: 'Florida',
    difficulty: 'Moderate',
    lastReviewed: '2026-01-05',
    attorneyReviewed: true,
    excerpt: 'Yes. A 503B outsourcing facility shipping product into Florida must hold a Florida nonresident pharmacy permit in addition to its FDA registration. The FL Board of Pharmacy inspects these facilities…',
  },
  {
    id: 'faq-004',
    question: 'What are Florida\'s opioid prescribing limits for acute pain in office settings?',
    topic: 'Prescribing',
    subtopic: 'Opioids',
    jurisdiction: 'Florida',
    difficulty: 'Straightforward',
    lastReviewed: '2025-12-20',
    attorneyReviewed: false,
    excerpt: 'Under Fla. Stat. § 456.44, practitioners are limited to a 3-day supply for acute pain in most circumstances. A 7-day supply may be dispensed if the practitioner documents medical necessity…',
  },
  {
    id: 'faq-005',
    question: 'Does a Florida physician practicing exclusively telemedicine need a physical office?',
    topic: 'Telehealth',
    subtopic: 'Licensing',
    jurisdiction: 'Florida',
    difficulty: 'Moderate',
    lastReviewed: '2025-12-10',
    attorneyReviewed: false,
    excerpt: 'No specific Florida statute requires a physician to maintain a physical office; however, the physician must maintain a valid Florida medical license (64B8) and must have a designated agent for service of process…',
  },
  {
    id: 'faq-006',
    question: 'What CME is required for Florida physician license renewal?',
    topic: 'Medical Practice',
    subtopic: 'Continuing Education',
    jurisdiction: 'Florida',
    difficulty: 'Straightforward',
    lastReviewed: '2025-11-20',
    attorneyReviewed: false,
    excerpt: 'Florida physicians must complete 40 hours of CME per 2-year renewal cycle, including: 2 hours on medical errors, 2 hours on human trafficking, 1 hour on prescribing opioids, and (effective 2026) 1 hour on AI in medicine…',
  },
  {
    id: 'faq-007',
    question: 'Can a Florida pharmacy compound drugs that are commercially available (i.e., essentially a copy)?',
    topic: 'Compounding',
    subtopic: 'Copy Restrictions',
    jurisdiction: 'Florida / Federal',
    difficulty: 'Complex',
    lastReviewed: '2025-11-05',
    attorneyReviewed: true,
    excerpt: 'Under 503A, compounding a "essentially a copy" of a commercially available drug is generally prohibited. Exceptions apply where the prescriber documents a clinical difference (e.g., different dosage form, excipient allergy)…',
  },
  {
    id: 'faq-008',
    question: 'What are the record retention requirements for a Florida pharmacy?',
    topic: 'Pharmacy',
    subtopic: 'Recordkeeping',
    jurisdiction: 'Florida',
    difficulty: 'Straightforward',
    lastReviewed: '2025-10-15',
    attorneyReviewed: false,
    excerpt: 'Florida Board of Pharmacy rules require prescription records to be maintained for a minimum of 4 years. Controlled substance records must be maintained separately and available for DEA inspection…',
  },
]

const TOPICS = [...new Set(MOCK_FAQS.map((f) => f.topic))].sort()

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const colorMap: Record<string, 'green' | 'yellow' | 'red'> = {
    Straightforward: 'green',
    Moderate: 'yellow',
    Complex: 'red',
  }
  return (
    <Badge variant="outline" color={colorMap[difficulty] ?? 'gray'}>
      {difficulty}
    </Badge>
  )
}

export default async function FaqPage() {
  const { role } = await getLayoutData()
  const isGated = role === 'monitor'

  const grouped = TOPICS.map((topic) => ({
    topic,
    items: MOCK_FAQS.filter((f) => f.topic === topic),
  }))

  return (
    <Flex direction="column" gap="6">
      {/* Header */}
      <Box>
        <Heading as="h1" size="6" weight="bold">Regulatory FAQ</Heading>
        <Text size="2" color="gray" as="p" mt="1">
          Plain-language answers to common Florida &amp; federal healthcare regulatory questions
        </Text>
      </Box>

      {/* Search shell */}
      <Flex gap="2">
        <Box flexGrow="1" style={{ position: 'relative' }}>
          <i className="ri-search-line" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--cedar-text-secondary)' }} aria-hidden="true" />
          <label htmlFor="faq-search" className="sr-only">Search FAQs</label>
          <TextField.Root
            id="faq-search"
            placeholder="Search questions… (Intelligence plan feature)"
            disabled={isGated}
            style={{ paddingLeft: '2.25rem' }}
          />
        </Box>
      </Flex>
      {isGated && (
        <Text size="1" color="gray" mt="-3">
          <i className="ri-lock-2-line mr-1" aria-hidden="true" />
          Full FAQ search is available on the Intelligence plan.
        </Text>
      )}

      {/* Upgrade banner for monitor users */}
      {isGated && <UpgradeBanner feature="Regulatory FAQ" />}

      {!isGated && (
        <Flex direction="column" gap="8">
          {grouped.map(({ topic, items }) => (
            <Box key={topic}>
              <Flex align="center" gap="2" mb="3">
                <Heading as="h2" size="3" weight="bold">{topic}</Heading>
                <Text size="1" color="gray">
                  {items.length} {items.length === 1 ? 'question' : 'questions'}
                </Text>
              </Flex>
              <Flex direction="column" gap="2">
                {items.map((faq) => (
                  <Link key={faq.id} href={`/faq/${faq.id}`}>
                    <Card variant="surface" className="hover:bg-[var(--cedar-card-hover)] transition-colors">
                      <Box p="4">
                        <Flex align="start" justify="between" gap="4">
                          <Box flexGrow="1" style={{ minWidth: 0 }}>
                            <Flex align="center" gap="2" mb="1" wrap="wrap">
                              <Badge variant="soft" color="gray" className="text-xs">{faq.subtopic}</Badge>
                              <Badge variant="outline" color="gray" className="text-xs">{faq.jurisdiction}</Badge>
                              <DifficultyBadge difficulty={faq.difficulty} />
                              {faq.attorneyReviewed && (
                                <Badge variant="soft" color="purple" className="text-xs">
                                  <i className="ri-shield-check-line" aria-hidden="true" />
                                  Attorney Reviewed
                                </Badge>
                              )}
                            </Flex>
                            <Text size="2" weight="medium" as="p">{faq.question}</Text>
                            <Text size="1" color="gray" as="p" mt="1" className="line-clamp-2">{faq.excerpt}</Text>
                          </Box>
                          <Box flexShrink="0">
                            <i className="ri-arrow-right-s-line text-[var(--cedar-text-secondary)] text-lg" aria-hidden="true" />
                          </Box>
                        </Flex>
                      </Box>
                    </Card>
                  </Link>
                ))}
              </Flex>
            </Box>
          ))}
        </Flex>
      )}
    </Flex>
  )
}
