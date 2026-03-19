// Corpus ingestion: eCFR Title 21 structure
// Wide-and-shallow pass — ingests every part as a kg_entity.
// Full text extraction per section is a separate future pass (requires Docling).

import { fetchECFRStructure } from '../fetchers/gov-apis'
import { trackCost } from '../cost-tracker'
import { upsertEntities, type KGEntityInsert } from './shared'

export interface ECFRIngestStats {
  parts_ingested: number
  errors: string[]
}

// ── eCFR structure types ──────────────────────────────────────────────────

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

// ── Extract parts from the eCFR structure tree ────────────────────────────

function extractParts(node: ECFRNode): ECFRNode[] {
  const parts: ECFRNode[] = []
  if (node.label_level === 'Part' && !node.reserved) {
    parts.push(node)
  }
  for (const child of node.children ?? []) {
    parts.push(...extractParts(child))
  }
  return parts
}

// ── Main ingestion function ───────────────────────────────────────────────

export async function ingestECFR(sourceId: string): Promise<ECFRIngestStats> {
  const TITLE = 21
  const errors: string[] = []

  console.log('[ecfr-ingest] Fetching eCFR Title 21 structure...')

  let raw: string
  try {
    raw = await fetchECFRStructure(TITLE)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { parts_ingested: 0, errors: [`Failed to fetch eCFR structure: ${msg}`] }
  }

  await trackCost({
    service: 'gov_api',
    operation: 'corpus.ecfr_structure',
    cost_usd: 0,
    context: { title: TITLE, source_id: sourceId },
  })

  let structure: ECFRNode
  try {
    structure = JSON.parse(raw) as ECFRNode
  } catch {
    return { parts_ingested: 0, errors: ['Failed to parse eCFR structure JSON'] }
  }

  const parts = extractParts(structure)
  console.log(`[ecfr-ingest] Found ${parts.length} parts in Title 21`)

  if (parts.length === 0) {
    return { parts_ingested: 0, errors: ['No parts found in eCFR structure'] }
  }

  // Build entity rows
  const entities: KGEntityInsert[] = parts.map(part => ({
    name:         part.label,
    entity_type:  'regulation',
    jurisdiction: 'US',
    status:       'active',
    identifier:   `ecfr-title-21-part-${part.identifier}`,
    source_id:    sourceId,
    citation:     `Title 21 CFR Part ${part.identifier}`,
    document_type: 'CFR_PART',
    external_url: `https://www.ecfr.gov/current/title-21/part-${part.identifier}`,
    metadata: {
      title_number:    TITLE,
      part_number:     part.identifier,
      label:           part.label,
      label_level:     part.label_level,
      label_description: part.label_description,
      authority:       part.authority,
      source:          part.source,
      volumes:         part.volumes,
      children_count:  part.children?.length ?? 0,
    },
  }))

  const result = await upsertEntities(entities)
  errors.push(...result.errors)

  console.log(`[ecfr-ingest] Upserted ${result.upserted} eCFR parts`)

  return {
    parts_ingested: result.upserted,
    errors,
  }
}
