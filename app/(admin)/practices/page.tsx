import { createServerClient } from '../../../lib/db/client'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDate } from '@/lib/format'
import type { Database } from '@/lib/db/types'

export const dynamic = 'force-dynamic'

type PracticeRow = Database['public']['Tables']['practices']['Row']

// ── Badge helpers ─────────────────────────────────────────────────────────────

function TierBadge({ tier }: { tier: string }) {
  const isIntelligence = tier.toLowerCase() === 'intelligence'
  const label = tier.charAt(0).toUpperCase() + tier.slice(1)
  return (
    <Badge
      variant="outline"
      className={
        isIntelligence
          ? 'text-xs bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-400 dark:border-purple-800'
          : 'text-xs'
      }
    >
      {label}
    </Badge>
  )
}

function SubscriptionBadge({ status }: { status: string | null }) {
  if (!status) {
    return <span className="text-xs text-muted-foreground">—</span>
  }
  const styles: Record<string, string> = {
    active:   'text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800',
    trialing: 'text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800',
    past_due: 'text-xs bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800',
    unpaid:   'text-xs bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800',
    canceled: 'text-xs bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800',
  }
  const cls = styles[status] ?? 'text-xs text-muted-foreground'
  const label = status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  return (
    <Badge variant="outline" className={cls}>
      {label}
    </Badge>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function PracticesPage() {
  const supabase = createServerClient()

  const { data: rows, error } = await supabase
    .from('practices')
    .select('*')
    .order('created_at', { ascending: false })

  const practices = (rows ?? []) as PracticeRow[]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Practices</h1>
        <p className="text-sm text-muted-foreground mt-1">
          All registered practices — {practices.length} total
        </p>
      </div>

      {/* Error state */}
      {error && (
        <Alert variant="destructive">
          <i className="ri-error-warning-line text-base" />
          <AlertDescription>Failed to load practices: {error.message}</AlertDescription>
        </Alert>
      )}

      {/* Empty state */}
      {practices.length === 0 && !error && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <i className="ri-building-line text-3xl text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No practices registered yet.</p>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      {practices.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              All Practices
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Practice</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Period End</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {practices.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <p className="text-sm font-medium text-foreground">{p.name}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-foreground">{p.owner_name ?? '—'}</p>
                      <p className="text-xs text-muted-foreground">{p.owner_email}</p>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {p.practice_type ?? '—'}
                    </TableCell>
                    <TableCell>
                      <TierBadge tier={p.tier} />
                    </TableCell>
                    <TableCell>
                      <SubscriptionBadge status={p.subscription_status} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {p.phone ?? '—'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {p.current_period_end ? formatDate(p.current_period_end) : '—'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(p.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
