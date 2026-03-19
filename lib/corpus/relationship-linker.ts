import { createServerClient } from '../db/client'
import type { Database } from '../db/types'

type RelationshipTypeEnum = Database['public']['Enums']['relationship_type_enum']

export interface RelationshipRow {
  source_entity_id:  string
  target_entity_id:  string
  relationship_type: string              // TEXT column — always set
  rel_type:          RelationshipTypeEnum // enum column
  effective_date?:   string   // YYYY-MM-DD
  provenance:        string   // 'api_cfr_references' | 'api_correction_of' | 'nlp_extracted' | 'manual'
  fr_citation?:      string   // e.g. '89 FR 12345'
  confidence?:       number   // 0–1, default 1.0 for API-extracted
}

export interface LinkResult {
  linked: number
  errors: string[]
}

/**
 * Bulk upsert relationships. Idempotent via ON CONFLICT DO UPDATE.
 * The unique constraint is (source_entity_id, target_entity_id, relationship_type).
 */
export async function createRelationships(rows: RelationshipRow[]): Promise<LinkResult> {
  if (rows.length === 0) return { linked: 0, errors: [] }
  const supabase = createServerClient()
  const errors: string[] = []
  let linked = 0

  // Batch in groups of 200
  const BATCH = 200
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH)
    const { data, error } = await supabase
      .from('kg_relationships')
      .upsert(
        batch.map(r => ({
          source_entity_id:  r.source_entity_id,
          target_entity_id:  r.target_entity_id,
          relationship_type: r.relationship_type,   // TEXT column
          rel_type:          r.rel_type,            // enum column
          effective_date:    r.effective_date ?? null,
          provenance:        r.provenance,
          fr_citation:       r.fr_citation ?? null,
          confidence:        r.confidence ?? 1.0,
        })),
        { onConflict: 'source_entity_id,target_entity_id,relationship_type' }
      )
      .select('id')

    if (error) {
      errors.push(`Batch ${i}: ${error.message}`)
    } else {
      linked += data?.length ?? batch.length
    }
  }

  return { linked, errors }
}

/**
 * Find kg_entity IDs that match a list of CFR references.
 * Used to find the target entities for "amends" relationships.
 *
 * @param cfrRefs Array of {title, part} objects from FR API cfr_references field
 * @returns Map from "title:part" string to entity ID
 */
export async function matchCFREntitiesToRefs(
  cfrRefs: Array<{ title: number; part: number }>
): Promise<Map<string, string>> {
  if (cfrRefs.length === 0) return new Map()
  const supabase = createServerClient()
  const result = new Map<string, string>()

  // Group by title for efficient JSONB containment queries
  const byTitle = new Map<number, number[]>()
  for (const ref of cfrRefs) {
    const parts = byTitle.get(ref.title) ?? []
    parts.push(ref.part)
    byTitle.set(ref.title, parts)
  }

  for (const [title, parts] of byTitle.entries()) {
    // Build a query that matches any entity whose cfr_references contains title=N
    // We then filter by part in JS to avoid complex JSONB queries
    const { data, error } = await supabase
      .from('kg_entities')
      .select('id, cfr_references')
      .contains('cfr_references', JSON.stringify([{ title }]))  // JSONB containment
      .limit(500)

    if (error || !data) continue

    for (const entity of data) {
      const refs = entity.cfr_references as Array<{ title: number; part: number }> | null
      if (!refs) continue
      for (const ref of refs) {
        if (ref.title === title && parts.includes(ref.part)) {
          result.set(`${title}:${ref.part}`, entity.id)
        }
      }
    }
  }

  return result
}
