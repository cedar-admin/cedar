import { createServerClient } from '../db/client'

/**
 * Find all entities that transitively cite, implement, or interpret a changed entity.
 * Uses iterative BFS with depth limit 5 to prevent runaway traversal.
 *
 * Writes flagged entities to kg_classification_log with needs_review=true.
 * Only propagates through 'cites', 'implements', 'interprets' relationship types.
 *
 * @param entityId  The entity that changed
 * @param runId     Inngest run ID for tracing
 * @returns         Array of downstream entity IDs flagged for re-evaluation
 */
export async function detectCascades(entityId: string, runId: string): Promise<string[]> {
  const supabase = createServerClient()

  const PROPAGATION_TYPES = ['cites', 'implements', 'interprets']
  const visited = new Set<string>([entityId])
  const cascade: string[] = []
  let frontier = [entityId]

  for (let depth = 0; depth < 5 && frontier.length > 0; depth++) {
    const { data, error } = await supabase
      .from('kg_relationships')
      .select('source_entity_id')
      .in('target_entity_id', frontier)
      .in('relationship_type', PROPAGATION_TYPES)

    if (error || !data) break

    const next: string[] = []
    for (const row of data) {
      if (!visited.has(row.source_entity_id)) {
        visited.add(row.source_entity_id)
        cascade.push(row.source_entity_id)
        next.push(row.source_entity_id)
      }
    }
    frontier = next
  }

  // Write cascade candidates to kg_classification_log
  if (cascade.length > 0) {
    const logRows = cascade.map(id => ({
      entity_id:      id,
      stage:          'rule' as const,
      confidence:     null,
      classified_by:  `cascade:${entityId}`,
      needs_review:   true,
      review_reason:  `Downstream dependency of changed entity ${entityId}`,
      run_id:         runId,
    }))

    // Insert in batches of 200
    const BATCH = 200
    for (let i = 0; i < logRows.length; i += BATCH) {
      await supabase
        .from('kg_classification_log')
        .insert(logRows.slice(i, i + BATCH))
    }
  }

  return cascade
}
