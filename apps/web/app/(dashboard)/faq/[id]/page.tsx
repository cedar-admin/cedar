import { notFound } from 'next/navigation'
import Link from 'next/link'
import { LegalDisclaimer } from '@/components/LegalDisclaimer'
import { getLayoutData } from '@/lib/layout-data'

const MOCK_FAQS = [
  { id: 'faq-001', question: 'Can a Florida-licensed physician prescribe controlled substances via telehealth without an in-person visit?', topic: 'Telehealth', subtopic: 'Controlled Substances', jurisdiction: 'Florida / Federal', difficulty: 'Complex', lastReviewed: '2026-02-10', attorneyReviewed: true, reviewedBy: 'Cedar Legal Panel', answer: '**Short Answer**\n\nGenerally no — prescribing Schedule II controlled substances via telehealth without a prior in-person evaluation is prohibited under federal law (Ryan Haight Act).', sourceRegulations: ['reg-002', 'reg-003'], disclaimer: 'This answer is general legal information only.' },
  { id: 'faq-002', question: 'What beyond-use dates (BUDs) apply to non-sterile compounded preparations in Florida?', topic: 'Compounding', subtopic: 'Beyond-Use Dating', jurisdiction: 'Florida / Federal', difficulty: 'Moderate', lastReviewed: '2026-01-15', attorneyReviewed: true, reviewedBy: 'Cedar Legal Panel', answer: '**Short Answer**\n\nFlorida pharmacies must comply with USP <795> (2023 revision) for non-sterile compound beyond-use dating.', sourceRegulations: ['reg-006'], disclaimer: null },
  { id: 'faq-003', question: 'Is a 503B outsourcing facility required to have a Florida pharmacy license?', topic: 'Compounding', subtopic: 'Outsourcing Facilities', jurisdiction: 'Florida', difficulty: 'Moderate', lastReviewed: '2026-01-05', attorneyReviewed: true, reviewedBy: 'Cedar Legal Panel', answer: '**Short Answer**\n\nYes. A 503B outsourcing facility shipping compounded drug products into Florida must hold a Florida Nonresident Pharmacy Permit.', sourceRegulations: ['reg-001', 'reg-006'], disclaimer: null },
  { id: 'faq-004', question: "What are Florida's opioid prescribing limits for acute pain in office settings?", topic: 'Prescribing', subtopic: 'Opioids', jurisdiction: 'Florida', difficulty: 'Straightforward', lastReviewed: '2025-12-20', attorneyReviewed: false, reviewedBy: null, answer: '**Short Answer**\n\nFor acute pain, Florida law generally limits opioid prescriptions to a 3-day supply.', sourceRegulations: ['reg-002', 'reg-005'], disclaimer: null },
  { id: 'faq-005', question: 'Does a Florida physician practicing exclusively telemedicine need a physical office?', topic: 'Telehealth', subtopic: 'Licensing', jurisdiction: 'Florida', difficulty: 'Moderate', lastReviewed: '2025-12-10', attorneyReviewed: false, reviewedBy: null, answer: '**Short Answer**\n\nNo Florida statute explicitly requires a physical office for telemedicine-only practices.', sourceRegulations: ['reg-003', 'reg-005'], disclaimer: 'Structure of your practice entity has significant legal and tax implications.' },
  { id: 'faq-006', question: 'What CME is required for Florida physician license renewal?', topic: 'Medical Practice', subtopic: 'Continuing Education', jurisdiction: 'Florida', difficulty: 'Straightforward', lastReviewed: '2025-11-20', attorneyReviewed: false, reviewedBy: null, answer: '**Short Answer**\n\nFlorida physicians (MD) must complete 40 hours of CME per 2-year renewal cycle.', sourceRegulations: ['reg-005'], disclaimer: null },
  { id: 'faq-007', question: 'Can a Florida pharmacy compound drugs that are commercially available (i.e., essentially a copy)?', topic: 'Compounding', subtopic: 'Copy Restrictions', jurisdiction: 'Florida / Federal', difficulty: 'Complex', lastReviewed: '2025-11-05', attorneyReviewed: true, reviewedBy: 'Cedar Legal Panel', answer: '**Short Answer**\n\nGenerally no. Under federal law (503A and 503B), compounding a drug that is "essentially a copy" is prohibited.', sourceRegulations: ['reg-001', 'reg-006'], disclaimer: 'This is a highly fact-specific area of law.' },
  { id: 'faq-008', question: 'What are the record retention requirements for a Florida pharmacy?', topic: 'Pharmacy', subtopic: 'Recordkeeping', jurisdiction: 'Florida', difficulty: 'Straightforward', lastReviewed: '2025-10-15', attorneyReviewed: false, reviewedBy: null, answer: '**Short Answer**\n\nFlorida requires most pharmacy records to be retained for a minimum of 4 years.', sourceRegulations: ['reg-006'], disclaimer: null },
]

const REG_STUBS: Record<string, { title: string; id: string }> = {
  'reg-001': { id: 'reg-001', title: 'FDA 503B Outsourcing Facility Requirements' },
  'reg-002': { id: 'reg-002', title: 'DEA Schedule II–V Controlled Substance Prescribing' },
  'reg-003': { id: 'reg-003', title: 'Florida Board of Medicine: Telehealth Standards of Practice' },
  'reg-005': { id: 'reg-005', title: 'Florida Administrative Code 64B8 — Medical Practice Act' },
  'reg-006': { id: 'reg-006', title: 'Florida Board of Pharmacy: Compounding Standards' },
}

function renderMarkdown(text: string) {
  const lines = text.split('\n')
  const elements: React.ReactNode[] = []
  let key = 0
  for (const line of lines) {
    if (line.startsWith('**') && line.endsWith('**') && line.slice(2, -2).length > 0) {
      elements.push(<strong key={key++} className="block text-sm font-semibold mt-5 mb-1.5 first:mt-0">{line.slice(2, -2)}</strong>)
    } else if (line.startsWith('- ')) {
      const content = line.slice(2)
      const parts = content.split(/(\*\*[^*]+\*\*)/)
      elements.push(<li key={key++} className="text-sm ml-4 mb-1 list-disc">{parts.map((p, i) => p.startsWith('**') && p.endsWith('**') ? <strong key={i}>{p.slice(2, -2)}</strong> : p)}</li>)
    } else if (line.trim() === '') {
      elements.push(<div key={key++} className="h-1" />)
    } else {
      const parts = line.split(/(\*\*[^*]+\*\*)/)
      elements.push(<p key={key++} className="text-sm leading-relaxed">{parts.map((p, i) => p.startsWith('**') && p.endsWith('**') ? <strong key={i}>{p.slice(2, -2)}</strong> : p)}</p>)
    }
  }
  return <div className="space-y-0.5">{elements}</div>
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  return <span className="inline-flex px-2 py-0.5 text-xs rounded border">{difficulty}</span>
}

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const faq = MOCK_FAQS.find((f) => f.id === id)
  return { title: faq ? `${faq.question.slice(0, 60)}… — Cedar` : 'FAQ — Cedar' }
}

export default async function FaqDetailPage({ params }: Props) {
  const { id } = await params
  await getLayoutData()
  const faq = MOCK_FAQS.find((f) => f.id === id)
  if (!faq) notFound()

  const sourceRegs = faq.sourceRegulations.map((rid) => REG_STUBS[rid]).filter(Boolean)

  return (
    <div style={{ maxWidth: '56rem' }}>
      <Link href="/faq" className="inline-flex items-center gap-1.5 text-sm hover:underline mb-6 transition-colors">&larr; Regulatory FAQ</Link>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="inline-flex px-2 py-0.5 text-xs rounded">{faq.topic}</span>
          <span className="inline-flex px-2 py-0.5 text-xs rounded border">{faq.subtopic}</span>
          <span className="inline-flex px-2 py-0.5 text-xs rounded border">{faq.jurisdiction}</span>
          <DifficultyBadge difficulty={faq.difficulty} />
          {faq.attorneyReviewed && <span className="inline-flex px-2 py-0.5 text-xs rounded">Attorney Reviewed</span>}
        </div>
        <h1 className="text-2xl font-bold">{faq.question}</h1>
        <p className="text-xs mt-2">Last reviewed <time dateTime={faq.lastReviewed}>{new Date(faq.lastReviewed).toLocaleDateString('en-US', { dateStyle: 'medium' })}</time>{faq.reviewedBy && ` · ${faq.reviewedBy}`}</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          <div className="border rounded p-5">{renderMarkdown(faq.answer)}</div>
          {faq.disclaimer && (
            <div className="p-4 border border-amber-300 rounded"><p className="text-xs">{faq.disclaimer}</p></div>
          )}
          <LegalDisclaimer />
        </div>
        <aside className="space-y-4">
          {sourceRegs.length > 0 && (
            <div className="border rounded">
              <div className="px-4 pt-4 pb-3"><h2 className="text-sm font-bold">Source Regulations</h2></div>
              <div className="p-4 pt-0">
                <div className="flex flex-col gap-3">
                  {sourceRegs.map((reg, i) => (
                    <div key={reg.id} className={i > 0 ? 'pt-3 border-t' : ''}>
                      <Link href={`/library/${reg.id}`} className="text-xs font-medium hover:underline transition-colors flex items-start gap-1.5 group">{reg.title}</Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {faq.attorneyReviewed && (
            <div className="border rounded p-4">
              <div className="flex items-center gap-2 mb-1"><h2 className="text-sm font-bold">Attorney Reviewed</h2></div>
              <p className="text-xs">This answer has been reviewed by the Cedar Legal Panel for accuracy and completeness.</p>
            </div>
          )}
          <div className="border rounded p-4">
            <div className="flex items-center gap-2 mb-1"><h2 className="text-sm font-bold">Have a follow-up?</h2></div>
            <p className="text-xs mb-3">Use the FAQ search to find related questions, or ask Cedar&apos;s AI assistant directly.</p>
            <Link href="/faq" className="text-xs font-medium hover:underline transition-colors">Browse all FAQs →</Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
