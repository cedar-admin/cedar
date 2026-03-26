// Corpus ingestion: shared types and bulk upsert helper

import { createServerClient } from '../db/client'
import type { Json } from '../db/types'

// ── Types ─────────────────────────────────────────────────────────────────

export interface KGEntityInsert {
  name: string
  description?: string
  entity_type: string
  jurisdiction: string
  status?: string
  identifier: string          // dedup key — required for corpus entities
  effective_date?: string
  source_id: string
  change_id?: string
  external_url?: string
  metadata: Record<string, unknown>  // FULL API response — nothing dropped
  // Migration 019 columns
  publication_date?: string
  document_type?: string
  pdf_url?: string
  comment_close_date?: string
  agencies?: unknown[]
  cfr_references?: unknown[]
  citation?: string
}

export interface UpsertResult {
  upserted: number
  errors: string[]
}

// ── Bulk upsert ───────────────────────────────────────────────────────────

const BATCH_SIZE = 100

/**
 * Bulk upsert kg_entities with dedup on (identifier, source_id).
 * Relies on migration 020's unique partial index for conflict detection.
 * Processes entities in batches of 100 to stay within Supabase request limits.
 */
export async function upsertEntities(entities: KGEntityInsert[]): Promise<UpsertResult> {
  if (entities.length === 0) return { upserted: 0, errors: [] }

  const supabase = createServerClient()
  let upserted = 0
  const errors: string[] = []

  for (let i = 0; i < entities.length; i += BATCH_SIZE) {
    const batch = entities.slice(i, i + BATCH_SIZE)

    const rows = batch.map(e => ({
      name:               e.name,
      description:        e.description ?? null,
      entity_type:        e.entity_type,
      jurisdiction:       e.jurisdiction,
      status:             e.status ?? null,
      identifier:         e.identifier,
      effective_date:     e.effective_date ?? null,
      source_id:          e.source_id,
      change_id:          e.change_id ?? null,
      external_url:       e.external_url ?? null,
      metadata:           e.metadata as Json,
      publication_date:   e.publication_date ?? null,
      document_type:      e.document_type ?? null,
      pdf_url:            e.pdf_url ?? null,
      comment_close_date: e.comment_close_date ?? null,
      agencies:           e.agencies ? (e.agencies as Json) : null,
      cfr_references:     e.cfr_references ? (e.cfr_references as Json) : null,
      citation:           e.citation ?? null,
    }))

    const { data, error } = await supabase
      .from('kg_entities')
      .upsert(rows, { onConflict: 'identifier,source_id', ignoreDuplicates: false })
      .select('id')

    if (error) {
      errors.push(`Batch ${i}–${i + batch.length - 1}: ${error.message}`)
      console.error('[corpus/shared] Upsert batch error:', error.message)
    } else {
      upserted += data?.length ?? batch.length
    }
  }

  return { upserted, errors }
}
