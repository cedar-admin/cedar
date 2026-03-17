import { getLayoutData } from '@/lib/layout-data'
import { UpgradeBanner } from '@/components/UpgradeBanner'
import { LibraryBrowser, type Regulation } from '@/components/LibraryBrowser'

export const dynamic = 'force-dynamic'

const MOCK_REGULATIONS: Regulation[] = [
  {
    id: 'reg-001',
    title: 'FDA 503B Outsourcing Facility Requirements',
    agency: 'FDA',
    topic: 'Compounding',
    subtopic: 'Outsourcing Facilities',
    status: 'Active',
    jurisdiction: 'Federal',
    lastUpdated: '2026-03-10',
    summary: 'Regulations governing 503B outsourcing facilities including GMP compliance, registration, and product reporting requirements.',
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
    summary: 'Federal requirements for prescribing, dispensing, and recordkeeping of Schedule II through V controlled substances.',
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
    summary: 'Standards governing telehealth practice in Florida including patient consent, prescribing limitations, and documentation requirements.',
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
    summary: 'Current Good Manufacturing Practice regulations for finished pharmaceuticals, including facilities, controls, and production standards.',
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
    summary: 'Florida Medical Practice Act provisions covering physician licensing, discipline, and scope of practice requirements.',
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
    summary: 'Florida-specific compounding regulations including beyond-use dating, labeling, and recordkeeping for compounded preparations.',
  },
]

export default async function LibraryPage() {
  const { role } = await getLayoutData()
  const isGated = role === 'monitor'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Regulation Library</h1>
        <p className="text-sm text-muted-foreground mt-1">
          AI-curated summaries of Florida and federal healthcare regulations
        </p>
      </div>

      {/* Upgrade banner for monitor users */}
      {isGated && <UpgradeBanner feature="Regulation Library" />}

      {/* Browser (client component — handles filters + search shell) */}
      <LibraryBrowser regulations={isGated ? [] : MOCK_REGULATIONS} isGated={isGated} />
    </div>
  )
}
