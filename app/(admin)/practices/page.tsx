import { createServerClient } from '../../../lib/db/client'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'
import { PracticesTable } from '@/components/admin/PracticesTable'
import type { Database } from '@/lib/db/types'

export const dynamic = 'force-dynamic'

type PracticeRow = Database['public']['Tables']['practices']['Row']

export default async function PracticesPage() {
  const supabase = createServerClient()

  // Fetch active (non-deleted) practices
  const { data: rows, error } = await supabase
    .from('practices')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  const practices = (rows ?? []) as PracticeRow[]

  // Fetch acknowledgment counts for all practices
  const { data: ackRows } = await supabase
    .from('practice_acknowledgments')
    .select('practice_id')

  // Build practice_id → count map
  const ackCounts: Record<string, number> = {}
  for (const row of ackRows ?? []) {
    ackCounts[row.practice_id] = (ackCounts[row.practice_id] ?? 0) + 1
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Practices</h1>
        <p className="text-sm text-muted-foreground mt-1">
          All registered practices — {practices.length} active
        </p>
      </div>

      {/* Error state */}
      {error && (
        <Alert variant="destructive">
          <i className="ri-error-warning-line text-base" />
          <AlertDescription>Failed to load practices: {error.message}</AlertDescription>
        </Alert>
      )}

      {/* Empty state (no practices at all) */}
      {practices.length === 0 && !error && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <i className="ri-building-line text-3xl text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No practices registered yet.</p>
          </CardContent>
        </Card>
      )}

      {/* Table + filter bar (client component) */}
      {practices.length > 0 && (
        <PracticesTable practices={practices} ackCounts={ackCounts} />
      )}
    </div>
  )
}
