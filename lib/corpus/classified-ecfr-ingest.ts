// eCFR ingest generalized to any title, filtered by cfr_allowlist.
// Fetches structure for a single title, extracts parts, filters to only
// parts in the allowlist, builds entities, and returns them for upsert.
//
// This module does NOT call classify() — the Inngest function handles
// classification after upsert so it has entity IDs.

import { fetchECFRStructure } from '../fetchers/gov-apis'
import { trackCost } from '../cost-tracker'
import type { KGEntityInsert } from './shared'

// ── eCFR structure types ─────────────────────────────────────────────────

interface ECFRNode {
  identifier: string
  label: string
  label_level: string
  label_description?: string
  reserved?: boolean
  children?: ECFRNode[]
  volumes?: string[]
  authority?: string
  source?: string
}

// ── Result shape ─────────────────────────────────────────────────────────

export interface ECFRTitleIngestResult {
  entities: KGEntityInsert[]
  totalPartsInTitle: number
  partsAfterFilter: number
  errors: string[]
}

// ── Extract all Parts from the eCFR structure tree ────────────────────────

function extractParts(node: ECFRNode): ECFRNode[] {
  const parts: ECFRNode[] = []
  if (node.label_level?.startsWith('Part ') && !node.reserved) {
    parts.push(node)
  }
  for (const child of node.children ?? []) {
    parts.push(...extractParts(child))
  }
  return parts
}

// ── Main ingest function ─────────────────────────────────────────────────

/**
 * Fetch and filter eCFR structure for one title.
 * Returns only parts present in the allowlist (keyed "title:part").
 * Does NOT call upsertEntities — caller handles that after getting IDs.
 */
export async function ingestECFRTitle(
  titleNumber: number,
  sourceId: string,
  allowlist: Set<string>  // "title:part" keys, e.g., "21:1306"
): Promise<ECFRTitleIngestResult> {
  const errors: string[] = []

  let raw: string
  try {
    raw = await fetchECFRStructure(titleNumber)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return {
      entities: [],
      totalPartsInTitle: 0,
      partsAfterFilter: 0,
      errors: [`Failed to fetch eCFR title ${titleNumber}: ${msg}`],
    }
  }

  await trackCost({
    service: 'gov_api',
    operation: 'corpus.ecfr_structure',
    cost_usd: 0,
    context: { title: titleNumber, source_id: sourceId },
  })

  let structure: ECFRNode
  try {
    structure = JSON.parse(raw) as ECFRNode
  } catch {
    return {
      entities: [],
      totalPartsInTitle: 0,
      partsAfterFilter: 0,
      errors: [`Failed to parse eCFR title ${titleNumber} JSON`],
    }
  }

  const allParts = extractParts(structure)
  const allowedParts = allParts.filter(p =>
    allowlist.has(`${titleNumber}:${p.identifier}`)
  )

  const entities: KGEntityInsert[] = allowedParts.map(part => ({
    name:         part.label,
    entity_type:  'regulation',
    jurisdiction: 'US',
    status:       'active',
    identifier:   `ecfr-title-${titleNumber}-part-${part.identifier}`,
    source_id:    sourceId,
    citation:     `Title ${titleNumber} CFR Part ${part.identifier}`,
    document_type: 'CFR_PART',
    external_url: `https://www.ecfr.gov/current/title-${titleNumber}/part-${part.identifier}`,
    metadata: {
      title_number:      titleNumber,
      part_number:       part.identifier,
      label:             part.label,
      label_level:       part.label_level,
      label_description: part.label_description,
      authority:         part.authority,
      source:            part.source,
      volumes:           part.volumes,
      children_count:    part.children?.length ?? 0,
    },
  }))

  return {
    entities,
    totalPartsInTitle: allParts.length,
    partsAfterFilter:  allowedParts.length,
    errors,
  }
}
