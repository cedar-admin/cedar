import { getLayoutData } from '@/lib/layout-data'
import { UpgradeBanner } from '@/components/UpgradeBanner'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'FAQ — Cedar' }

const MOCK_FAQS = [
  { id: 'faq-001', question: 'Can a Florida-licensed physician prescribe controlled substances via telehealth without an in-person visit?', topic: 'Telehealth', subtopic: 'Controlled Substances', jurisdiction: 'Florida / Federal', difficulty: 'Complex', lastReviewed: '2026-02-10', attorneyReviewed: true, excerpt: 'Under federal law (Ryan Haight Act) and Florida § 456.47, prescribing Schedule II controlled substances via telehealth generally requires a prior in-person evaluation, with narrow DEA exceptions…' },
  { id: 'faq-002', question: 'What beyond-use dates (BUDs) apply to non-sterile compounded preparations in Florida?', topic: 'Compounding', subtopic: 'Beyond-Use Dating', jurisdiction: 'Florida / Federal', difficulty: 'Moderate', lastReviewed: '2026-01-15', attorneyReviewed: true, excerpt: 'Florida Board of Pharmacy incorporates USP <795> standards for non-sterile compounding BUDs. The default BUDs are: aqueous preparations (14 days refrigerated), non-aqueous preparations (90 days)…' },
  { id: 'faq-003', question: 'Is a 503B outsourcing facility required to have a Florida pharmacy license?', topic: 'Compounding', subtopic: 'Outsourcing Facilities', jurisdiction: 'Florida', difficulty: 'Moderate', lastReviewed: '2026-01-05', attorneyReviewed: true, excerpt: 'Yes. A 503B outsourcing facility shipping product into Florida must hold a Florida nonresident pharmacy permit in addition to its FDA registration…' },
  { id: 'faq-004', question: "What are Florida's opioid prescribing limits for acute pain in office settings?", topic: 'Prescribing', subtopic: 'Opioids', jurisdiction: 'Florida', difficulty: 'Straightforward', lastReviewed: '2025-12-20', attorneyReviewed: false, excerpt: 'Under Fla. Stat. § 456.44, practitioners are limited to a 3-day supply for acute pain in most circumstances…' },
  { id: 'faq-005', question: 'Does a Florida physician practicing exclusively telemedicine need a physical office?', topic: 'Telehealth', subtopic: 'Licensing', jurisdiction: 'Florida', difficulty: 'Moderate', lastReviewed: '2025-12-10', attorneyReviewed: false, excerpt: 'No specific Florida statute requires a physician to maintain a physical office…' },
  { id: 'faq-006', question: 'What CME is required for Florida physician license renewal?', topic: 'Medical Practice', subtopic: 'Continuing Education', jurisdiction: 'Florida', difficulty: 'Straightforward', lastReviewed: '2025-11-20', attorneyReviewed: false, excerpt: 'Florida physicians must complete 40 hours of CME per 2-year renewal cycle…' },
  { id: 'faq-007', question: 'Can a Florida pharmacy compound drugs that are commercially available (i.e., essentially a copy)?', topic: 'Compounding', subtopic: 'Copy Restrictions', jurisdiction: 'Florida / Federal', difficulty: 'Complex', lastReviewed: '2025-11-05', attorneyReviewed: true, excerpt: 'Under 503A, compounding a "essentially a copy" of a commercially available drug is generally prohibited…' },
  { id: 'faq-008', question: 'What are the record retention requirements for a Florida pharmacy?', topic: 'Pharmacy', subtopic: 'Recordkeeping', jurisdiction: 'Florida', difficulty: 'Straightforward', lastReviewed: '2025-10-15', attorneyReviewed: false, excerpt: 'Florida Board of Pharmacy rules require prescription records to be maintained for a minimum of 4 years…' },
]

const TOPICS = [...new Set(MOCK_FAQS.map((f) => f.topic))].sort()

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  return <span className="inline-flex px-2 py-0.5 text-xs rounded border">{difficulty}</span>
}

export default async function FaqPage() {
  const { role } = await getLayoutData()
  const isGated = role === 'monitor'

  const grouped = TOPICS.map((topic) => ({ topic, items: MOCK_FAQS.filter((f) => f.topic === topic) }))

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Regulatory FAQ</h1>
        <p className="text-sm mt-1">Plain-language answers to common Florida &amp; federal healthcare regulatory questions</p>
      </div>

      <div className="flex gap-2">
        <div className="flex-1" style={{ position: 'relative' }}>
          <label htmlFor="faq-search" className="sr-only">Search FAQs</label>
          <input id="faq-search" placeholder="Search questions… (Intelligence plan feature)" disabled={isGated} className="w-full border rounded px-3 py-2 text-sm" style={{ paddingLeft: '2.25rem' }} />
        </div>
      </div>
      {isGated && (
        <span className="text-xs -mt-3">Full FAQ search is available on the Intelligence plan.</span>
      )}

      {isGated && <UpgradeBanner feature="Regulatory FAQ" />}

      {!isGated && (
        <div className="flex flex-col gap-8">
          {grouped.map(({ topic, items }) => (
            <div key={topic}>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-base font-bold">{topic}</h2>
                <span className="text-xs">{items.length} {items.length === 1 ? 'question' : 'questions'}</span>
              </div>
              <div className="flex flex-col gap-2">
                {items.map((faq) => (
                  <Link key={faq.id} href={`/faq/${faq.id}`}>
                    <div className="border rounded hover:bg-gray-50 transition-colors p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="inline-flex px-2 py-0.5 text-xs rounded">{faq.subtopic}</span>
                            <span className="inline-flex px-2 py-0.5 text-xs rounded border">{faq.jurisdiction}</span>
                            <DifficultyBadge difficulty={faq.difficulty} />
                            {faq.attorneyReviewed && (
                              <span className="inline-flex px-2 py-0.5 text-xs rounded">Attorney Reviewed</span>
                            )}
                          </div>
                          <p className="text-sm font-medium">{faq.question}</p>
                          <p className="text-xs mt-1 line-clamp-2">{faq.excerpt}</p>
                        </div>
                        <div className="shrink-0">
                          <span className="text-lg" aria-hidden="true">&rsaquo;</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
