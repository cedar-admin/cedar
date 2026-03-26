// Module 7: Audit Trail — hash chain integrity validation
// Walks each source's change records in chain_sequence order and verifies
// that the tamper-evident chain hasn't been broken or modified.

import { createServerClient } from '../db/client'
import { computeChainHash } from '../changes/hash'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ChainError {
  change_id: string
  chain_sequence: number
  /** hash_mismatch: stored chain_hash doesn't match recomputed value
   *  broken_link:   prev_chain_hash doesn't match the prior record's chain_hash */
  type: 'hash_mismatch' | 'broken_link'
  expected: string
  actual: string
}

export interface ChainValidationResult {
  sourceId: string
  changesChecked: number
  valid: boolean
  errors: ChainError[]
}

// ── validateChain ─────────────────────────────────────────────────────────────

/**
 * Validate the full hash chain for a single source.
 *
 * Accepts the Supabase client as a parameter so the Inngest job can reuse one
 * client across all sources without re-instantiating per call.
 *
 * Skips rows where chain_sequence IS NULL (pre-migration 010 records).
 */
export async function validateChain(
  sourceId: string,
  supabase: ReturnType<typeof createServerClient>
): Promise<ChainValidationResult> {
  const { data, error } = await supabase
    .from('changes')
    .select('id, hash, chain_hash, prev_chain_hash, chain_sequence')
    .eq('source_id', sourceId)
    .not('chain_sequence', 'is', null)
    .order('chain_sequence', { ascending: true })

  if (error) {
    throw new Error(`[chain-validator] Failed to load changes for source ${sourceId}: ${error.message}`)
  }

  const rows = (data ?? []) as Array<{
    id: string
    hash: string
    chain_hash: string | null
    prev_chain_hash: string | null
    chain_sequence: number
  }>

  const errors: ChainError[] = []

  for (let i = 0; i < rows.length; i++) {
    const c = rows[i]

    // ── Check 1: stored chain_hash matches recomputed value ──────────────────
    const recomputed = computeChainHash(c.prev_chain_hash, c.hash)
    if (recomputed !== c.chain_hash) {
      errors.push({
        change_id:      c.id,
        chain_sequence: c.chain_sequence,
        type:           'hash_mismatch',
        expected:       recomputed,
        actual:         c.chain_hash ?? '(null)',
      })
    }

    // ── Check 2: prev_chain_hash correctly references the prior record ───────
    if (i > 0) {
      const prev = rows[i - 1]
      if (c.prev_chain_hash !== prev.chain_hash) {
        errors.push({
          change_id:      c.id,
          chain_sequence: c.chain_sequence,
          type:           'broken_link',
          expected:       prev.chain_hash ?? '(null)',
          actual:         c.prev_chain_hash ?? '(null)',
        })
      }
    }
  }

  return {
    sourceId,
    changesChecked: rows.length,
    valid: errors.length === 0,
    errors,
  }
}
