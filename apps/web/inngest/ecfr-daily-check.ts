// Daily eCFR change detection — polls eCFR titles for amendments, computes
// SHA-256 content hashes, creates new kg_entity_versions when content changes.
// Cron: 7:30 AM ET weekdays (30 minutes after FR poll)
// Event: 'cedar/corpus.ecfr-daily-check'

import { createHash } from 'crypto'
import { inngest } from './client'
import { createServerClient } from '../lib/db/client'
import { fetchECFRTitles, fetchECFRPart, fetchECFRStructure } from '../lib/fetchers/gov-apis'
import { trackCost } from '../lib/cost-tracker'
import { detectCascades } from '../lib/corpus/cascade-detect'

// Titles to monitor: 21 (FDA), 29 (OSHA), 42 (Medicare/Medicaid), 45 (HIPAA/HHS)
const MONITORED_TITLES = [21, 29, 42, 45]

export const ecfrDailyCheck = inngest.createFunction(
  {
    id: 'ecfr-daily-check',
    name: 'eCFR Daily Check — Detect Amendment Changes',
    retries: 2,
    concurrency: { limit: 1 },
    timeouts: { finish: '45m' },
  },
  [
    { event: 'cedar/corpus.ecfr-daily-check' },
    { cron: '30 12 * * 1-5' },  // 7:30 AM ET weekdays
  ],
  async ({ step, logger, runId }) => {

    // ── Step 1: Load last checked date ─────────────────────────────────────
    const lastCheckedDate = await step.run('load-last-checked-date', async () => {
      const supabase = createServerClient()
      const { data, error } = await supabase
        .from('system_config')
        .select('value')
        .eq('key', 'ecfr_last_checked_date')
        .single()
      if (error) throw new Error(`system_config read failed: ${error.message}`)
      return data?.value ?? new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0]
    })

    logger.info(`[ecfr-daily-check] Checking eCFR titles changed since ${lastCheckedDate}`)

    // ── Step 2: Fetch eCFR titles metadata ─────────────────────────────────
    const changedTitles = await step.run('check-ecfr-titles', async () => {
      const titles = await fetchECFRTitles()
      await trackCost({ service: 'gov_api', operation: 'ecfr_titles_check', cost_usd: 0,
        context: { run_id: runId, last_checked: lastCheckedDate } })

      return titles
        .filter(t => MONITORED_TITLES.includes(t.number))
        .filter(t => t.latest_amended_on > lastCheckedDate)
        .map(t => ({ number: t.number, amendedOn: t.latest_amended_on, asOf: t.up_to_date_as_of }))
    })

    if (changedTitles.length === 0) {
      logger.info('[ecfr-daily-check] No titles changed since last check')
      await updateLastCheckedDate()
      return { titles_changed: 0, versions_created: 0, cascade_entities: 0 }
    }

    logger.info(`[ecfr-daily-check] Changed titles: ${changedTitles.map(t => t.number).join(', ')}`)

    // ── Step 3: For each changed title, detect changed parts ───────────────
    let totalVersions = 0
    let totalCascades = 0

    for (const title of changedTitles) {
      const versionStats = await step.run(`process-title-${title.number}`, async () => {
        const supabase = createServerClient()
        let versionsCreated = 0
        let cascadesDetected = 0

        // Fetch structure to get list of parts
        const rawStructure = await fetchECFRStructure(title.number)
        await trackCost({ service: 'gov_api', operation: 'ecfr_structure_fetch', cost_usd: 0,
          context: { title: title.number, run_id: runId } })

        const structure = JSON.parse(rawStructure)
        const parts = extractPartNumbers(structure)

        logger.info(`[ecfr-daily-check] Title ${title.number}: ${parts.length} parts to check`)

        // Check each part for content changes
        for (const partNum of parts) {
          try {
            const rawContent = await fetchECFRPart(title.number, partNum)
            await trackCost({ service: 'gov_api', operation: 'ecfr_part_fetch', cost_usd: 0,
              context: { title: title.number, part: partNum, run_id: runId } })

            const contentHash = createHash('sha256').update(rawContent).digest('hex')
            const contentSnippet = rawContent.substring(0, 5000)  // first 5KB for snapshot

            // Find the kg_entity for this CFR part
            const { data: entity } = await supabase
              .from('kg_entities')
              .select('id')
              .contains('cfr_references', JSON.stringify([{ title: title.number, part: parseInt(partNum) }]))
              .limit(1)
              .single()

            if (!entity) continue

            // Get most recent content_hash for this entity
            const { data: latestVersion } = await supabase
              .from('kg_entity_versions')
              .select('content_hash')
              .eq('entity_id', entity.id)
              .not('version_date', 'is', null)
              .order('version_date', { ascending: false })
              .limit(1)
              .single()

            // Only create new version if content actually changed
            if (latestVersion?.content_hash === contentHash) continue

            const versionDate = title.asOf
            const { error: vErr } = await supabase
              .from('kg_entity_versions')
              .upsert({
                entity_id:        entity.id,
                version_number:   0,     // not used for Phase 2 versioning — set 0
                snapshot:         {},    // not used for Phase 2 — set empty JSONB
                version_date:     versionDate,
                content_hash:     contentHash,
                content_snapshot: contentSnippet,
              }, { onConflict: 'entity_id,version_date' })

            if (vErr) {
              logger.warn(`[ecfr-daily-check] Version insert error for ${entity.id}: ${vErr.message}`)
              continue
            }

            versionsCreated++

            // Cascade detection for changed entity
            const cascadeIds = await detectCascades(entity.id, runId ?? 'unknown')
            cascadesDetected += cascadeIds.length

            logger.info(`[ecfr-daily-check] New version for entity ${entity.id} (title ${title.number} part ${partNum}) — ${cascadeIds.length} cascade entities`)
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err)
            logger.warn(`[ecfr-daily-check] Title ${title.number} part ${partNum} error: ${msg}`)
          }
        }

        return { versionsCreated, cascadesDetected }
      })

      totalVersions += versionStats.versionsCreated
      totalCascades += versionStats.cascadesDetected
    }

    // ── Step 4: Update last checked date ───────────────────────────────────
    await step.run('update-checked-date', async () => {
      await updateLastCheckedDate()
    })

    logger.info(`[ecfr-daily-check] Done — ${changedTitles.length} titles, ${totalVersions} versions, ${totalCascades} cascades`)
    return {
      titles_changed:   changedTitles.length,
      versions_created: totalVersions,
      cascade_entities: totalCascades,
    }

    async function updateLastCheckedDate() {
      const supabase = createServerClient()
      const today = new Date().toISOString().split('T')[0]
      await supabase.from('system_config').update({ value: today }).eq('key', 'ecfr_last_checked_date')
    }
  }
)

// Extract part numbers as strings from eCFR structure tree
function extractPartNumbers(node: { label_level?: string; reserved?: boolean; children?: unknown[] }): string[] {
  const parts: string[] = []
  if (node.label_level?.startsWith('Part ') && !node.reserved) {
    const match = node.label_level.match(/Part (\d+)/)
    if (match) parts.push(match[1])
  }
  for (const child of (node.children ?? []) as typeof node[]) {
    parts.push(...extractPartNumbers(child))
  }
  return parts
}
