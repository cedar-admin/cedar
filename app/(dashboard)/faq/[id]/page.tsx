import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LegalDisclaimer } from '@/components/LegalDisclaimer'
import { getLayoutData } from '@/lib/layout-data'

// ── Mock data ─────────────────────────────────────────────────────────────────

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
    reviewedBy: 'Cedar Legal Panel',
    answer: `**Short Answer**\n\nGenerally no — prescribing Schedule II controlled substances via telehealth without a prior in-person evaluation is prohibited under federal law (Ryan Haight Act). Limited DEA-registered "special registrant" exceptions exist as of 2026.\n\n**Federal Law (Ryan Haight Act — 21 U.S.C. § 831)**\n\nThe Ryan Haight Online Pharmacy Consumer Protection Act of 2008 prohibits prescribing Schedule II–V controlled substances via the internet without conducting at least one in-person evaluation, except in narrow circumstances:\n\n- The patient is being treated by and is physically located at a DEA-registered hospital or clinic\n- The patient is being treated in the physical presence of a DEA-registered practitioner\n- The prescriber holds a DEA "special registration" (established by 2026 final rule)\n- Public health emergency exceptions (COVID-era flexibilities expired as of 2024)\n\n**DEA Special Registrant Pathway (2026)**\n\nDEA finalized rules in February 2026 establishing a Special Registrant category. Practitioners who apply for and receive this designation may prescribe Schedule III–V (not Schedule II) via telehealth to established patients without an in-person evaluation, subject to:\n\n- Patient must have an existing treatment relationship\n- Prescription is for Schedule III–V only\n- State law must also permit telemedicine prescribing\n- DEA special registration application required (separate from standard DEA registration)\n\n**Florida Law (§ 456.47)**\n\nFlorida independently prohibits prescribing Schedule II controlled substances via telehealth without a prior in-person examination. This aligns with federal law and is not superseded by any DEA exception.\n\n**Practical Implication**\n\nA Florida telehealth-only practice cannot prescribe Schedule II substances (oxycodone, Adderall, etc.) without an in-person visit. For Schedule III–V (e.g., buprenorphine, testosterone, benzodiazepines), a DEA special registrant may do so under the 2026 rules — but check Florida Board of Medicine guidance before relying on this pathway.`,
    sourceRegulations: ['reg-002', 'reg-003'],
    disclaimer: 'This answer is general legal information only. Prescribing decisions require review of the patient-specific clinical context and consultation with your legal counsel and DEA compliance officer.',
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
    reviewedBy: 'Cedar Legal Panel',
    answer: `**Short Answer**\n\nFlorida pharmacies must comply with USP <795> (2023 revision) for non-sterile compound beyond-use dating. Default BUDs are based on preparation type and storage conditions.\n\n**USP <795> Default BUDs (2023 Revision)**\n\nFor non-sterile preparations where no stability data is available:\n\n- **Aqueous (water-containing) preparations**: 35 days at controlled room temperature, 14 days refrigerated\n- **Non-aqueous preparations**: 90 days at controlled room temperature\n- **Solid dosage forms**: 180 days at controlled room temperature\n\n**Florida-Specific Requirements**\n\nFlorida Board of Pharmacy (FAC 64B16-27) adopted the USP <795> 2023 revision effective January 1, 2026. Key Florida additions:\n\n- Extended BUDs beyond USP defaults require documented stability testing or peer-reviewed literature support\n- Pharmacies must maintain stability data in the master formulation record\n- The BUD must be clearly labeled on the final preparation\n\n**Hormone Compounding Note**\n\nFor compounded bioidentical hormones (common in Florida practices), the default BUDs apply. Many pharmacies seek to extend BUDs for these preparations — this requires USP-compliant stability studies.\n\n**Practical Checklist**\n\n- Verify your master formulation record includes BUD rationale\n- Confirm staff are trained on the 2023 USP <795> updates\n- Ensure labels reflect BUD and storage conditions clearly`,
    sourceRegulations: ['reg-006'],
    disclaimer: null,
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
    reviewedBy: 'Cedar Legal Panel',
    answer: `**Short Answer**\n\nYes. A 503B outsourcing facility shipping compounded drug products into Florida must hold a Florida Nonresident Pharmacy Permit in addition to its FDA registration.\n\n**Dual Regulatory Framework**\n\n503B outsourcing facilities are subject to both:\n\n1. **Federal FDA oversight**: CGMP compliance, biannual registration, product reporting, adverse event reporting\n2. **State pharmacy board oversight**: Each state where products are shipped may require a nonresident pharmacy permit or equivalent\n\n**Florida Nonresident Pharmacy Permit**\n\nThe Florida Board of Pharmacy requires out-of-state pharmacies that ship into Florida — including 503B facilities — to hold a nonresident pharmacy permit under Fla. Stat. § 465.0156. Requirements include:\n\n- Active pharmacy license in the home state\n- Designated pharmacist-in-charge\n- Compliance with Florida labeling and recordkeeping requirements\n- Subject to Florida Board of Pharmacy inspection authority\n\n**For Florida-Based 503B Facilities**\n\nIn-state 503B outsourcing facilities hold a standard Florida pharmacy license (not nonresident) and are inspected by the Florida Board of Pharmacy for state compliance in addition to FDA CGMP inspections.`,
    sourceRegulations: ['reg-001', 'reg-006'],
    disclaimer: null,
  },
  {
    id: 'faq-004',
    question: "What are Florida's opioid prescribing limits for acute pain in office settings?",
    topic: 'Prescribing',
    subtopic: 'Opioids',
    jurisdiction: 'Florida',
    difficulty: 'Straightforward',
    lastReviewed: '2025-12-20',
    attorneyReviewed: false,
    reviewedBy: null,
    answer: `**Short Answer**\n\nFor acute pain, Florida law generally limits opioid prescriptions to a 3-day supply. A 7-day supply is permitted with documented medical necessity.\n\n**Fla. Stat. § 456.44 — Acute Pain Prescribing**\n\n- **Standard Limit**: 3-day supply for Schedule II–IV opioids for acute pain\n- **Extended Limit**: Up to 7 days if the prescriber: (1) documents in the medical record that a 3-day supply is insufficient, and (2) documents the condition requiring additional medication\n- **Exceptions**: The 3-day limit does not apply to: cancer pain, palliative care, chronic pain management, or inpatient hospital settings\n\n**Electronic Prescribing Requirement**\n\nFlorida requires electronic prescribing for all controlled substances (EPCS) as of January 1, 2021, except for documented hardship exemptions.\n\n**Documentation Best Practices**\n\n- Document the acute pain diagnosis and clinical rationale\n- For any supply exceeding 3 days, include explicit documentation that 3 days is insufficient\n- Maintain documentation of PDMP (Prescription Drug Monitoring Program) check prior to prescribing\n- Check the Florida PDMP (E-FORCSE®) for every Schedule II–IV prescription`,
    sourceRegulations: ['reg-002', 'reg-005'],
    disclaimer: null,
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
    reviewedBy: null,
    answer: `**Short Answer**\n\nNo Florida statute explicitly requires a physical office for telemedicine-only practices, but several practical and regulatory requirements effectively require a physical presence or registered location.\n\n**What Florida Law Requires**\n\n- **License**: A valid Florida medical license under Chapter 458 (or 459 for osteopathic physicians)\n- **Agent for Process**: A designated registered agent with a physical Florida address\n- **DEA Registration**: If prescribing controlled substances, DEA registration requires a physical practice address\n- **Medical Records**: Must be maintained in a manner accessible for patient or regulatory review\n\n**Practical Considerations**\n\n- Many malpractice insurers require a disclosed practice address\n- Florida Board of Medicine may conduct onsite inspections — a virtual-only practice should confirm inspection protocols in advance\n- If you employ or supervise staff in Florida, a physical location may be required under labor and employment law\n\n**Recommendation**\n\nConsult with a Florida healthcare attorney to structure a telehealth-only practice correctly, particularly regarding DEA registration address, malpractice coverage, and business entity registration.`,
    sourceRegulations: ['reg-003', 'reg-005'],
    disclaimer: 'Structure of your practice entity has significant legal and tax implications. Consult both a healthcare attorney and a CPA.',
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
    reviewedBy: null,
    answer: `**Short Answer**\n\nFlorida physicians (MD) must complete 40 hours of CME per 2-year renewal cycle with specific mandatory topic requirements.\n\n**Total CME Requirement: 40 Hours / 2-Year Cycle**\n\nMandatory topics within the 40 hours:\n\n- **Medical Errors**: 2 hours (Florida Patient Safety Act requirement)\n- **Human Trafficking**: 1 hour (required for all health professionals)\n- **Prescribing Opioids**: 2 hours for new DEA registrants; 1 hour for renewing with DEA registration\n- **HIV/AIDS**: 1 hour (for first renewal only)\n- **Domestic Violence**: 2 hours (for first renewal only)\n- **AI in Medicine**: 1 hour (effective January 2026, per updated 64B8 rules)\n\n**Renewal Deadlines**\n\nFlorida physician licenses expire on the last day of the birth month in odd-numbered years. CME must be completed by the renewal deadline.\n\n**Documentation**\n\n- Retain certificates of completion for a minimum of 4 years\n- Florida does not require pre-approval of CME providers; AMA PRA Category 1 credits are generally accepted\n- Report CME completion through the Florida DOH MQA Services Portal`,
    sourceRegulations: ['reg-005'],
    disclaimer: null,
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
    reviewedBy: 'Cedar Legal Panel',
    answer: `**Short Answer**\n\nGenerally no. Under federal law (503A and 503B), compounding a drug that is "essentially a copy" of a commercially available product is prohibited — with clinical difference exceptions.\n\n**Federal 503A Prohibition (Patient-Specific Compounding)**\n\nUnder 21 U.S.C. § 353a, a compounding pharmacy may not compound a drug that is "essentially a copy" of a commercially available product unless:\n\n1. The prescriber documents a clinical difference (e.g., different dosage form, strength, excipient) necessary for the individual patient\n2. The change produces a significant difference in the patient's therapy\n\n**FDA Interpretation: "Significant Difference"**\n\nFDA considers a "significant difference" to include:\n- A different route of administration (e.g., topical vs. oral)\n- A different dosage form (e.g., troche vs. tablet)\n- Exclusion of a non-active ingredient (e.g., dye allergy)\n- Different strength not commercially available\n\nMere patient preference or cost are not considered significant differences.\n\n**503B (Outsourcing Facilities)**\n\n503B facilities face an additional prohibition: they may not compound a commercially available drug product unless it appears on FDA's "shortage list" or the prescriber has documented a clinical difference.\n\n**Practical Guidance**\n\n- Ensure prescriptions include the clinical difference documentation\n- Train prescribers on proper prescriber attestation language\n- Consult pharmacy counsel before launching any new compound that mirrors a commercially available product`,
    sourceRegulations: ['reg-001', 'reg-006'],
    disclaimer: 'This is a highly fact-specific area of law. FDA enforcement has been active in this space. Consult pharmacy legal counsel before making compounding formulary decisions.',
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
    reviewedBy: null,
    answer: `**Short Answer**\n\nFlorida requires most pharmacy records to be retained for a minimum of 4 years. Federal DEA requirements for controlled substances also apply.\n\n**Florida Board of Pharmacy (FAC 64B16)**\n\n- **Prescription Records**: 4 years from date of dispensing\n- **Compounding Records**: 4 years (master formulation record + individual compounding record)\n- **Inventory Records**: 4 years\n- **Employee Records**: 4 years (pharmacist-in-charge must maintain)\n\n**Federal DEA Requirements (21 CFR Part 1304)**\n\n- **Controlled Substance Records**: 2 years minimum — but Florida's 4-year requirement is more stringent and controls\n- **DEA 222 Forms**: Maintained at the registered location, 2 years\n- **ARCOS Reporting**: Maintained per DEA schedule\n\n**Electronic Records**\n\nElectronic records are permissible and must be:\n- Readily retrievable (within 48 hours of DEA request)\n- Backed up regularly\n- Protected against unauthorized modification\n\n**Best Practices**\n\n- Maintain a record retention schedule document\n- Designate a record custodian\n- For cloud-based systems, ensure SLA guarantees data availability for the full retention period\n- At end of retention period, use a HIPAA-compliant destruction method`,
    sourceRegulations: ['reg-006'],
    disclaimer: null,
  },
]

const REG_STUBS: Record<string, { title: string; id: string }> = {
  'reg-001': { id: 'reg-001', title: 'FDA 503B Outsourcing Facility Requirements' },
  'reg-002': { id: 'reg-002', title: 'DEA Schedule II–V Controlled Substance Prescribing' },
  'reg-003': { id: 'reg-003', title: 'Florida Board of Medicine: Telehealth Standards of Practice' },
  'reg-004': { id: 'reg-004', title: 'eCFR Title 21 Part 211 — Current Good Manufacturing Practice' },
  'reg-005': { id: 'reg-005', title: 'Florida Administrative Code 64B8 — Medical Practice Act' },
  'reg-006': { id: 'reg-006', title: 'Florida Board of Pharmacy: Compounding Standards' },
}

// ── Markdown renderer ─────────────────────────────────────────────────────────

function renderMarkdown(text: string) {
  const lines = text.split('\n')
  const elements: React.ReactNode[] = []
  let key = 0

  for (const line of lines) {
    if (line.startsWith('**') && line.endsWith('**') && line.slice(2, -2).length > 0) {
      elements.push(
        <h4 key={key++} className="text-sm font-semibold text-foreground mt-5 mb-1.5 first:mt-0">
          {line.slice(2, -2)}
        </h4>
      )
    } else if (line.startsWith('- ')) {
      const content = line.slice(2)
      const parts = content.split(/(\*\*[^*]+\*\*)/)
      elements.push(
        <li key={key++} className="text-sm text-foreground ml-4 mb-1 list-disc">
          {parts.map((p, i) =>
            p.startsWith('**') && p.endsWith('**') ? (
              <strong key={i}>{p.slice(2, -2)}</strong>
            ) : p
          )}
        </li>
      )
    } else if (line.trim() === '') {
      elements.push(<div key={key++} className="h-1" />)
    } else {
      const parts = line.split(/(\*\*[^*]+\*\*)/)
      elements.push(
        <p key={key++} className="text-sm text-foreground leading-relaxed">
          {parts.map((p, i) =>
            p.startsWith('**') && p.endsWith('**') ? (
              <strong key={i}>{p.slice(2, -2)}</strong>
            ) : p
          )}
        </p>
      )
    }
  }

  return <div className="space-y-0.5">{elements}</div>
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const map: Record<string, string> = {
    Straightforward: 'text-green-700 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950 dark:border-green-800',
    Moderate: 'text-yellow-700 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-950 dark:border-yellow-800',
    Complex: 'text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950 dark:border-red-800',
  }
  return (
    <Badge variant="outline" className={`text-xs ${map[difficulty] ?? ''}`}>
      {difficulty}
    </Badge>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

interface Props {
  params: Promise<{ id: string }>
}

export default async function FaqDetailPage({ params }: Props) {
  const { id } = await params
  await getLayoutData() // auth guard

  const faq = MOCK_FAQS.find((f) => f.id === id)
  if (!faq) notFound()

  const sourceRegs = faq.sourceRegulations
    .map((rid) => REG_STUBS[rid])
    .filter(Boolean)

  return (
    <div className="max-w-4xl">
      {/* Back */}
      <Link
        href="/faq"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <i className="ri-arrow-left-line" />
        Regulatory FAQ
      </Link>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <Badge variant="secondary" className="text-xs">{faq.topic}</Badge>
          <Badge variant="outline" className="text-xs text-muted-foreground">{faq.subtopic}</Badge>
          <Badge variant="outline" className="text-xs text-muted-foreground">{faq.jurisdiction}</Badge>
          <DifficultyBadge difficulty={faq.difficulty} />
          {faq.attorneyReviewed && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 px-2 py-0.5">
              <i className="ri-shield-check-fill text-xs" />
              Attorney Reviewed
            </span>
          )}
        </div>
        <h1 className="text-xl font-semibold text-foreground">{faq.question}</h1>
        <p className="text-xs text-muted-foreground mt-2">
          Last reviewed{' '}
          {new Date(faq.lastReviewed).toLocaleDateString('en-US', { dateStyle: 'medium' })}
          {faq.reviewedBy && ` · ${faq.reviewedBy}`}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Answer */}
        <div className="col-span-2 space-y-4">
          <Card>
            <CardContent className="pt-5 pb-5">
              {renderMarkdown(faq.answer)}
            </CardContent>
          </Card>

          {/* Custom disclaimer if present */}
          {faq.disclaimer && (
            <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40">
              <i className="ri-error-warning-line text-amber-600 dark:text-amber-400 text-base" />
              <AlertDescription className="text-amber-800 dark:text-amber-300 text-xs">
                {faq.disclaimer}
              </AlertDescription>
            </Alert>
          )}

          <LegalDisclaimer />
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          {/* Source regulations */}
          {sourceRegs.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Source Regulations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {sourceRegs.map((reg, i) => (
                  <div key={reg.id} className={i > 0 ? 'pt-3 border-t border-border' : ''}>
                    <Link
                      href={`/library/${reg.id}`}
                      className="text-xs font-medium text-foreground hover:text-primary transition-colors flex items-start gap-1.5 group"
                    >
                      <i className="ri-book-open-line text-muted-foreground group-hover:text-primary shrink-0 mt-0.5 transition-colors" />
                      {reg.title}
                    </Link>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Attorney reviewed card */}
          {faq.attorneyReviewed && (
            <Card className="border-purple-200 dark:border-purple-800">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <i className="ri-shield-check-fill text-purple-600 dark:text-purple-400 text-base" />
                  <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                    Attorney Reviewed
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  This answer has been reviewed by the Cedar Legal Panel for accuracy and completeness.
                  It reflects the regulatory landscape as of the review date.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Ask a question prompt */}
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-1.5">
                <i className="ri-question-answer-line text-primary text-base" />
                <span className="text-xs font-semibold text-foreground">Have a follow-up?</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Use the FAQ search to find related questions, or ask Cedar's AI assistant directly.
              </p>
              <Link
                href="/faq"
                className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Browse all FAQs →
              </Link>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
