// Module 7: Weekly hash chain validation job
// Walks every active source's change chain and verifies tamper-evident integrity.
// Writes one validation_log row per run. Surfaces broken chains via logger.error().

import { inngest } from './client'
import { createServerClient } from '../lib/db/client'
import { validateChain, type ChainValidationResult } from '../lib/audit/chain-validator'

export const weeklyAuditValidation = inngest.createFunction(
  {
    id: 'weekly-audit-validation',
    name: 'Weekly Audit Chain Validation',
  },
  { cron: '0 3 * * 0' }, // Every Sunday at 3 AM UTC
  async ({ step, logger }) => {
    const supabase = createServerClient()

    // ── Step 1: Load all active sources ───────────────────────────────────────
    const sources = await step.run('load-sources', async () => {
      const { data, error } = await supabase
        .from('sources')
        .select('id, name')
        .eq('is_active', true)
      if (error) throw new Error(`[audit-validation] Failed to load sources: ${error.message}`)
      return (data ?? []) as Array<{ id: string; name: string }>
    })

    logger.info(`[audit-validation] Validating chain integrity for ${sources.length} sources`)

    // ── Step 2: Validate each source's chain ──────────────────────────────────
    const results = await step.run('validate-chains', async () => {
      const out: Array<ChainValidationResult & { sourceName: string }> = []
      for (const source of sources) {
        const result = await validateChain(source.id, supabase)
        out.push({ ...result, sourceName: source.name })
      }
      return out
    })

    // ── Aggregate ─────────────────────────────────────────────────────────────
    const chainsValid   = results.filter(r => r.valid).length
    const chainsBroken  = results.filter(r => !r.valid).length
    const totalChanges  = results.reduce((sum, r) => sum + r.changesChecked, 0)
    const allErrors     = results.flatMap(r =>
      r.errors.map(e => ({ ...e, source_id: r.sourceId, source_name: r.sourceName }))
    )

    // ── Step 3: Write validation_log ──────────────────────────────────────────
    await step.run('write-validation-log', async () => {
      const summary =
        `Validated ${totalChanges} change${totalChanges !== 1 ? 's' : ''} across ` +
        `${sources.length} source${sources.length !== 1 ? 's' : ''}. ` +
        `${chainsValid} clean, ${chainsBroken} with integrity errors.`

      const { error } = await supabase.from('validation_log').insert({
        run_type:        'weekly_chain_validation',
        sources_checked: sources.length,
        chains_valid:    chainsValid,
        chains_broken:   chainsBroken,
        total_changes:   totalChanges,
        errors:          allErrors,
        summary,
      })
      if (error) throw new Error(`[audit-validation] Failed to write validation_log: ${error.message}`)
      return summary
    })

    // Surface integrity failures prominently in the Inngest dashboard
    if (chainsBroken > 0) {
      logger.error(
        `[audit-validation] INTEGRITY ALERT: ${chainsBroken} source${chainsBroken !== 1 ? 's have' : ' has'} broken chains`,
        { broken_sources: allErrors.map(e => e.source_name).filter((v, i, a) => a.indexOf(v) === i), errors: allErrors }
      )
    } else {
      logger.info('[audit-validation] All chains verified clean.')
    }

    return { sourcesChecked: sources.length, chainsValid, chainsBroken, totalChanges }
  }
)
