// Module 7: Audit Trail — append-only change record creation
// Built in Phase: MVP (Months 0-2)

import { createServerClient } from '../db/client'
import type { Json } from '../db/types'

export interface ChangeInsert {
  source_id: string
  source_url_id?: string | null
  jurisdiction?: string
  content_before?: string | null
  content_after?: string | null
  diff?: string | null
  hash: string
  chain_hash?: string | null
  agent_version?: string | null
  relevance_score?: number | null
  severity?: string | null
  summary?: string | null
  raw_classification?: Json | null
  review_status?: string
  superseded_by?: string | null
}

/**
 * Write a new change record to the append-only changes table.
 * Never UPDATE or DELETE — use superseded_by to correct a record.
 */
export async function recordChange(data: ChangeInsert): Promise<string> {
  const supabase = createServerClient()
  const { data: inserted, error } = await supabase
    .from('changes')
    .insert(data)
    .select('id')
    .single()

  if (error) {
    throw new Error(`Failed to record change: ${error.message}`)
  }

  return inserted.id
}
