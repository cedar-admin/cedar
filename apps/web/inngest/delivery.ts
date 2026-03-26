// Module 8: Notification delivery jobs
// Sends email alerts when a regulatory change clears review

import { inngest } from './client'
import { createServerClient } from '../lib/db/client'
import { sendChangeAlert } from '../lib/delivery/email'
import { trackCost } from '../lib/cost-tracker'
import type { DiffBlock } from '../lib/changes/diff'

export interface DeliverChangeAlertEvent {
  data: {
    changeId: string
    severity: string
  }
}

/**
 * Triggered by monitor.ts after a change is recorded.
 * Loads change + source details, then sends alerts to all active practices.
 * Skips silently if RESEND_API_KEY is not configured (MVP/local dev).
 */
export const deliverChangeAlert = inngest.createFunction(
  {
    id: 'deliver-change-alert',
    name: 'Deliver Change Alert',
    retries: 3,
  },
  { event: 'cedar/change.deliver' },
  async ({ event, step, logger }) => {
    const { changeId, severity } = (event as DeliverChangeAlertEvent).data
    const supabase = createServerClient()

    // ── Step 1: Load change + source details ─────────────────────────────
    const { change, source } = await step.run('load-change', async () => {
      const { data: change, error: chErr } = await supabase
        .from('changes')
        .select('id, source_id, summary, severity, review_status, jurisdiction, normalized_diff')
        .eq('id', changeId)
        .single()
      if (chErr || !change) throw new Error(`Change not found: ${changeId}`)

      const { data: source, error: srcErr } = await supabase
        .from('sources')
        .select('id, name, url')
        .eq('id', change.source_id)
        .single()
      if (srcErr || !source) throw new Error(`Source not found for change: ${changeId}`)

      return { change, source }
    })

    // Only deliver approved or auto-approved changes
    if (change.review_status !== 'approved' && change.review_status !== 'auto_approved') {
      logger.info(
        `[delivery] Change ${changeId} has review_status=${change.review_status} — not delivering yet`
      )
      return { skipped: true, reason: 'awaiting_review', changeId }
    }

    // ── Step 2: Load all active practices to notify ───────────────────────
    const practices = await step.run('load-practices', async () => {
      const { data, error } = await supabase
        .from('practices')
        .select('id, name, owner_email, tier')
      if (error) throw new Error(`Failed to load practices: ${error.message}`)
      return data ?? []
    })

    if (practices.length === 0) {
      logger.info(`[delivery] No active practices — skipping delivery for change ${changeId}`)
      return { skipped: true, reason: 'no_practices', changeId }
    }

    // ── Step 3: Send alert email to each practice ─────────────────────────
    let sent = 0
    let skipped = 0

    for (const practice of practices) {
      const result = await step.run(`send-email-${practice.id}`, async () => {
        return sendChangeAlert({
          to: practice.owner_email,
          practiceName: practice.name,
          practiceId: practice.id,
          changeSummary: change.summary ?? 'A regulatory change was detected.',
          severity: change.severity ?? severity,
          sourceName: source.name,
          sourceUrl: source.url,
          changeId,
          normalizedDiff: (change.normalized_diff as DiffBlock[] | null) ?? null,
        })
      })

      if (result.sent) {
        sent++
        await trackCost({
          service: 'resend',
          operation: 'change_alert_email',
          cost_usd: 0.001, // $1 per 1000 emails (Resend pricing)
          context: { changeId, practiceId: practice.id },
        })
      } else {
        skipped++
        logger.info(`[delivery] Email skipped for practice ${practice.id}: ${result.reason}`)
      }
    }

    logger.info(`[delivery] Change ${changeId} delivered: ${sent} sent, ${skipped} skipped`)
    return { changeId, severity, sent, skipped }
  }
)
