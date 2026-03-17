import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { LegalDisclaimer } from '@/components/LegalDisclaimer'
import { getLayoutData } from '@/lib/layout-data'

// ── Mock data (matches library/page.tsx) ──────────────────────────────────────

const MOCK_REGULATIONS = [
  {
    id: 'reg-001',
    title: 'FDA 503B Outsourcing Facility Requirements',
    agency: 'FDA',
    topic: 'Compounding',
    subtopic: 'Outsourcing Facilities',
    status: 'Active',
    jurisdiction: 'Federal',
    lastUpdated: '2026-03-10',
    effectiveDate: '2024-07-01',
    sourceUrl: 'https://www.fda.gov/drugs/human-drug-compounding/503b-outsourcing-facilities',
    citationCode: '21 U.S.C. § 353b',
    summary:
      'Regulations governing 503B outsourcing facilities including GMP compliance, registration, and product reporting requirements.',
    cedarSummary: `**Overview**\n\nSection 503B of the Federal Food, Drug, and Cosmetic Act (FD&C Act) establishes a voluntary registration pathway for outsourcing facilities — entities that compound sterile drug products without patient-specific prescriptions.\n\n**Key Requirements**\n\n- **Registration**: Outsourcing facilities must register with FDA biannually and pay applicable fees.\n- **GMP Compliance**: All compounding must comply with Current Good Manufacturing Practice (CGMP) under 21 CFR Part 211.\n- **Adverse Event Reporting**: MedWatch submissions required for serious adverse drug experiences.\n- **Product Reporting**: Must submit drug product lists to FDA every six months, including lot numbers and beyond-use dates.\n- **Labeling**: Products must bear the statement "This is a compounded drug" and must not be commercially available elsewhere without FDA approval.\n\n**Florida-Specific Implications**\n\nFlorida pharmacies registered as 503B outsourcing facilities remain subject to FL Board of Pharmacy oversight in addition to federal GMP requirements. Dual compliance is required.\n\n**Recent Changes (March 2026)**\n\nFDA clarified guidance on bulk drug substance nominations, narrowing the list of permissible substances for 503B compounding. Facilities must review their formularies for compliance.`,
    versions: [
      { date: '2026-03-10', description: 'FDA bulk substance nomination guidance update' },
      { date: '2025-08-15', description: 'GMP compliance FAQ updated' },
      { date: '2024-07-01', description: 'Original 503B final rule implementation' },
    ],
    related: ['reg-004', 'reg-006'],
  },
  {
    id: 'reg-002',
    title: 'DEA Schedule II–V Controlled Substance Prescribing',
    agency: 'DEA',
    topic: 'Prescribing',
    subtopic: 'Controlled Substances',
    status: 'Active',
    jurisdiction: 'Federal',
    lastUpdated: '2026-02-15',
    effectiveDate: '2023-03-01',
    sourceUrl: 'https://www.deadiversion.usdoj.gov/drugreg/index.html',
    citationCode: '21 CFR Part 1306',
    summary:
      'Federal requirements for prescribing, dispensing, and recordkeeping of Schedule II through V controlled substances.',
    cedarSummary: `**Overview**\n\n21 CFR Part 1306 governs how practitioners may prescribe controlled substances in Schedules II through V. DEA registration is required for all prescribers who administer, dispense, or prescribe controlled substances.\n\n**Key Requirements**\n\n- **Schedule II**: Written prescriptions only (no refills). Electronic prescriptions for controlled substances (EPCS) are permitted under 21 CFR Part 1311.\n- **Schedule III–V**: May be refilled per DEA limits (Schedule III–IV: up to 5 refills in 6 months; Schedule V: as authorized).\n- **Telehealth Prescribing**: Ryan Haight Act requires an in-person evaluation before prescribing Schedule II–V via telemedicine, with limited DEA exceptions for registered special registrants.\n- **Recordkeeping**: All dispensing records must be maintained for a minimum of 2 years and be available for DEA inspection.\n\n**Recent Changes (February 2026)**\n\nDEA finalized rules on telemedicine prescribing exceptions post-COVID, establishing a special registrant pathway that allows limited telehealth prescribing of Schedule III–V without an initial in-person visit.`,
    versions: [
      { date: '2026-02-15', description: 'Telehealth prescribing exception rule finalized' },
      { date: '2023-03-01', description: 'EPCS rules updated for Schedule II' },
    ],
    related: ['reg-003'],
  },
  {
    id: 'reg-003',
    title: 'Florida Board of Medicine: Telehealth Standards of Practice',
    agency: 'FL Board of Medicine',
    topic: 'Telehealth',
    subtopic: 'Standards of Care',
    status: 'Active',
    jurisdiction: 'Florida',
    lastUpdated: '2026-01-20',
    effectiveDate: '2023-01-01',
    sourceUrl: 'https://flboardofmedicine.gov/information-for-licensees/telehealth/',
    citationCode: 'Fla. Stat. § 456.47',
    summary:
      'Standards governing telehealth practice in Florida including patient consent, prescribing limitations, and documentation requirements.',
    cedarSummary: `**Overview**\n\nFlorida Statute § 456.47 and implementing rules establish the framework for telehealth practice by Florida-licensed health professionals. Florida also permits out-of-state telehealth providers to register with DOH to serve Florida patients.\n\n**Key Requirements**\n\n- **Patient Consent**: Must obtain and document patient consent for telehealth services.\n- **Standard of Care**: The standard of care for telehealth is identical to in-person care.\n- **Prescribing Limitations**: Practitioners may not prescribe Schedule II controlled substances via telehealth for a patient without a prior in-person examination, per Florida law.\n- **Documentation**: Records must meet the same requirements as in-person visits (SOAP notes, medical necessity, etc.).\n- **Out-of-State Providers**: Must register with Florida DOH as telehealth providers before treating Florida patients.\n\n**Recent Changes (January 2026)**\n\nFlorida Board of Medicine updated telehealth guidance to address AI-assisted diagnostic tools, requiring that all AI-generated recommendations be reviewed and documented by a licensed practitioner before use in clinical decision-making.`,
    versions: [
      { date: '2026-01-20', description: 'AI-assisted diagnostics guidance added' },
      { date: '2023-01-01', description: 'Telehealth statute recodified under § 456.47' },
    ],
    related: ['reg-002', 'reg-005'],
  },
  {
    id: 'reg-004',
    title: 'eCFR Title 21 Part 211 — Current Good Manufacturing Practice',
    agency: 'FDA',
    topic: 'Manufacturing',
    subtopic: 'CGMP',
    status: 'Active',
    jurisdiction: 'Federal',
    lastUpdated: '2025-12-01',
    effectiveDate: '1978-09-29',
    sourceUrl: 'https://www.ecfr.gov/current/title-21/chapter-I/subchapter-C/part-211',
    citationCode: '21 CFR Part 211',
    summary:
      'Current Good Manufacturing Practice regulations for finished pharmaceuticals, including facilities, controls, and production standards.',
    cedarSummary: `**Overview**\n\n21 CFR Part 211 establishes the minimum current good manufacturing practice (CGMP) for finished pharmaceuticals intended for human use. These regulations apply to any establishment engaged in manufacturing, processing, packing, or holding of drug products.\n\n**Key Requirements**\n\n- **Personnel**: Qualified personnel with appropriate education, training, and experience (Subpart B)\n- **Buildings & Facilities**: Adequate size, construction, and location to facilitate cleaning and maintenance (Subpart C)\n- **Equipment**: Appropriate design, adequate size, suitably located; calibration required (Subpart D)\n- **Production Controls**: Written procedures for all production steps; deviation investigations mandatory (Subpart F)\n- **Laboratory Controls**: Stability testing, out-of-specification investigations, reference standards maintenance (Subpart I)\n- **Records & Reports**: Batch production records, distribution records, 1-year retention minimum (Subpart J)\n\n**Florida Relevance**\n\n503B outsourcing facilities in Florida must comply with Part 211 CGMP. FL Board of Pharmacy inspections reference CGMP compliance as part of licensure.`,
    versions: [
      { date: '2025-12-01', description: 'Laboratory controls section updated' },
      { date: '2022-06-15', description: 'Electronic records guidance clarified' },
    ],
    related: ['reg-001', 'reg-006'],
  },
  {
    id: 'reg-005',
    title: 'Florida Administrative Code 64B8 — Medical Practice Act',
    agency: 'FL DOH',
    topic: 'Medical Practice',
    subtopic: 'Licensing & Standards',
    status: 'Active',
    jurisdiction: 'Florida',
    lastUpdated: '2025-11-15',
    effectiveDate: '2020-01-01',
    sourceUrl: 'https://www.flrules.org/gateway/ChapterHome.asp?Chapter=64B8',
    citationCode: 'Fla. Admin. Code 64B8',
    summary:
      'Florida Medical Practice Act provisions covering physician licensing, discipline, and scope of practice requirements.',
    cedarSummary: `**Overview**\n\nChapter 64B8 of the Florida Administrative Code contains the rules promulgated by the Florida Board of Medicine implementing the Medical Practice Act (Chapter 458, Florida Statutes).\n\n**Key Areas**\n\n- **Licensure**: Application requirements, examination, continuing medical education (CME) — 40 hours per 2-year cycle including 2 hours of medical errors\n- **Prescribing**: Controlled substance prescribing, pain management clinic registration, opioid prescribing limits (3-day limit for acute pain in most cases)\n- **Discipline**: Grounds for discipline include sexual misconduct, substance abuse, fraudulent billing, and practicing beyond scope\n- **Telemedicine**: Board-specific telemedicine standards cross-reference § 456.47\n- **Aesthetic Procedures**: Rules governing non-surgical cosmetic procedures in office settings\n\n**Recent Changes (November 2025)**\n\nFlorida Board of Medicine updated CME requirements to include 1 hour on artificial intelligence in medical practice, effective for renewal cycles beginning January 2026.`,
    versions: [
      { date: '2025-11-15', description: 'AI in medicine CME requirement added' },
      { date: '2023-07-01', description: 'Opioid prescribing rules updated' },
    ],
    related: ['reg-003'],
  },
  {
    id: 'reg-006',
    title: 'Florida Board of Pharmacy: Compounding Standards',
    agency: 'FL Board of Pharmacy',
    topic: 'Compounding',
    subtopic: 'Pharmacy Standards',
    status: 'Active',
    jurisdiction: 'Florida',
    lastUpdated: '2025-10-30',
    effectiveDate: '2021-07-01',
    sourceUrl: 'https://floridapharmacy.gov/pharmacy/compounding.shtml',
    citationCode: 'Fla. Admin. Code 64B16-27',
    summary:
      'Florida-specific compounding regulations including beyond-use dating, labeling, and recordkeeping for compounded preparations.',
    cedarSummary: `**Overview**\n\nChapter 64B16-27 of the Florida Administrative Code governs the compounding of drug products by Florida-licensed pharmacies. These rules implement federal USP standards (USP <795>, <797>, <800>) and add Florida-specific requirements.\n\n**Key Requirements**\n\n- **Beyond-Use Dates (BUD)**: Must follow USP <797> for sterile compounding and USP <795> for non-sterile; Florida allows BUD extensions only with documented stability testing\n- **Labeling**: Compounded preparations must bear the pharmacy name, patient name (if patient-specific), ingredients, BUD, storage conditions, and "Compounded Preparation — Not for Resale" if applicable\n- **Recordkeeping**: Master formulation records and compounding records must be maintained for 4 years\n- **Sterile Compounding**: ISO classification, environmental monitoring, personnel garbing, and media fill testing required per USP <797>\n- **Hazardous Drugs**: Pharmacies handling chemotherapy or hormones must comply with USP <800>\n\n**Recent Changes (October 2025)**\n\nFlorida Board of Pharmacy adopted updated USP <797> (2023 revision) standards, requiring pharmacies to implement new sterility testing and BUD protocols by January 1, 2026.`,
    versions: [
      { date: '2025-10-30', description: 'USP <797> 2023 revision adopted' },
      { date: '2023-04-01', description: 'Hazardous drug handling requirements updated' },
      { date: '2021-07-01', description: 'Initial compounding standards promulgated' },
    ],
    related: ['reg-001', 'reg-004'],
  },
]

const RELATED_MAP = Object.fromEntries(MOCK_REGULATIONS.map((r) => [r.id, r]))

// ── Active tab state — client component wrapper ───────────────────────────────

import { LibraryDetailTabs } from './LibraryDetailTabs'

// ── Page ──────────────────────────────────────────────────────────────────────

interface Props {
  params: Promise<{ id: string }>
}

export default async function LibraryDetailPage({ params }: Props) {
  const { id } = await params
  const { role } = await getLayoutData()

  const reg = MOCK_REGULATIONS.find((r) => r.id === id)
  if (!reg) notFound()

  const relatedRegs = reg.related
    .map((rid) => RELATED_MAP[rid])
    .filter(Boolean)

  return (
    <div className="max-w-4xl">
      {/* Back */}
      <Link
        href="/library"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <i className="ri-arrow-left-line" />
        Regulation Library
      </Link>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <Badge variant="outline" className="text-xs">{reg.agency}</Badge>
          <Badge variant="secondary" className="text-xs">{reg.topic}</Badge>
          <Badge variant="outline" className="text-xs text-muted-foreground">{reg.jurisdiction}</Badge>
          <Badge
            variant="outline"
            className="text-xs text-green-700 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950 dark:border-green-800"
          >
            {reg.status}
          </Badge>
        </div>
        <h1 className="text-xl font-semibold text-foreground mb-1">{reg.title}</h1>
        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
          <span>
            <span className="font-medium text-foreground">{reg.citationCode}</span>
          </span>
          <span>·</span>
          <span>
            Effective{' '}
            {new Date(reg.effectiveDate).toLocaleDateString('en-US', { dateStyle: 'medium' })}
          </span>
          <span>·</span>
          <span>
            Updated{' '}
            {new Date(reg.lastUpdated).toLocaleDateString('en-US', { dateStyle: 'medium' })}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main: tabs */}
        <div className="col-span-2">
          <LibraryDetailTabs reg={reg} role={role} />
          <LegalDisclaimer />
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          {/* Version history */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Version History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {reg.versions.map((v, i) => (
                <div key={i} className={i > 0 ? 'pt-3 border-t border-border' : ''}>
                  <p className="text-xs font-medium text-foreground">
                    {new Date(v.date).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{v.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Related regulations */}
          {relatedRegs.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Related Regulations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {relatedRegs.map((related, i) => (
                  <div key={related.id} className={i > 0 ? 'pt-3 border-t border-border' : ''}>
                    <Link
                      href={`/library/${related.id}`}
                      className="text-xs font-medium text-foreground hover:text-primary transition-colors"
                    >
                      {related.title}
                    </Link>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <Badge variant="outline" className="text-xs py-0">{related.agency}</Badge>
                      <Badge variant="secondary" className="text-xs py-0">{related.topic}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Source link */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Source
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <a href={reg.sourceUrl} target="_blank" rel="noopener noreferrer">
                  <i className="ri-external-link-line" />
                  View Live Source
                </a>
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
