import { getLayoutData } from '@/lib/layout-data'
import { UpgradeBanner } from '@/components/UpgradeBanner'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export const dynamic = 'force-dynamic'

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

      {/* Chat interface bar (shell only) */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <i className="ri-search-ai-line absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-base" />
          <Input
            placeholder="Ask a regulatory question… (Intelligence plan feature)"
            className="pl-9"
            disabled={isGated}
          />
        </div>
        <button
          disabled
          className="px-4 py-2 text-sm font-medium border border-border bg-muted text-muted-foreground cursor-not-allowed"
        >
          <i className="ri-send-plane-line" />
        </button>
      </div>
      {isGated && (
        <p className="text-xs text-muted-foreground -mt-4">
          <i className="ri-lock-2-line mr-1" />
          AI Q&amp;A is available on the Intelligence plan.
        </p>
      )}

      {/* Upgrade banner for monitor users */}
      {isGated && <UpgradeBanner feature="Regulation Library" />}

      {!isGated && (
        <>
          {/* Filter bar */}
          <div className="flex items-center gap-2 flex-wrap">
            <Select>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Agency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All agencies</SelectItem>
                <SelectItem value="fda">FDA</SelectItem>
                <SelectItem value="dea">DEA</SelectItem>
                <SelectItem value="fl-doh">FL DOH</SelectItem>
                <SelectItem value="fl-board-medicine">FL Board of Medicine</SelectItem>
                <SelectItem value="fl-board-pharmacy">FL Board of Pharmacy</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Topic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All topics</SelectItem>
                <SelectItem value="compounding">Compounding</SelectItem>
                <SelectItem value="telehealth">Telehealth</SelectItem>
                <SelectItem value="prescribing">Prescribing</SelectItem>
                <SelectItem value="manufacturing">Manufacturing</SelectItem>
                <SelectItem value="medical-practice">Medical Practice</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Jurisdiction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="federal">Federal</SelectItem>
                <SelectItem value="florida">Florida</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="superseded">Superseded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results */}
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">{MOCK_REGULATIONS.length} results</p>
            {MOCK_REGULATIONS.map((reg) => (
              <Link key={reg.id} href={`/library/${reg.id}`}>
                <Card className="hover:bg-muted/30 transition-colors cursor-pointer">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <Badge variant="outline" className="text-xs">{reg.agency}</Badge>
                          <Badge variant="secondary" className="text-xs">{reg.topic}</Badge>
                          <Badge variant="outline" className="text-xs text-muted-foreground">{reg.jurisdiction}</Badge>
                        </div>
                        <h3 className="text-sm font-semibold text-foreground">{reg.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{reg.summary}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-muted-foreground">Updated</p>
                        <p className="text-xs font-medium text-foreground">
                          {new Date(reg.lastUpdated).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
