import type { Metadata } from 'next'
import { createServerClient } from '../../../lib/db/client'
import { PracticesTable } from '@/components/admin/PracticesTable'
import type { Database } from '@/lib/db/types'

export const metadata: Metadata = { title: 'Practices — Cedar Admin' }
export const dynamic = 'force-dynamic'

type PracticeRow = Database['public']['Tables']['practices']['Row']

export default async function PracticesPage() {
  const supabase = createServerClient()
  const { data: rows, error } = await supabase.from('practices').select('*').is('deleted_at', null).order('created_at', { ascending: false })
  const practices = (rows ?? []) as PracticeRow[]

  const { data: ackRows } = await supabase.from('practice_acknowledgments').select('practice_id')
  const ackCounts: Record<string, number> = {}
  for (const row of ackRows ?? []) { ackCounts[row.practice_id] = (ackCounts[row.practice_id] ?? 0) + 1 }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Practices</h1>
        <span className="text-sm mt-1 block">All registered practices — {practices.length} active</span>
      </div>

      {error && <div className="p-4 border border-red-300 rounded"><p className="text-sm">Failed to load practices: {error.message}</p></div>}

      {practices.length === 0 && !error && (
        <div className="border rounded p-4">
          <div className="flex flex-col items-center justify-center py-9 text-center">
            <span className="text-3xl mb-2" aria-hidden="true" />
            <span className="text-sm">No practices registered yet.</span>
          </div>
        </div>
      )}

      {practices.length > 0 && <PracticesTable practices={practices} ackCounts={ackCounts} />}
    </div>
  )
}
