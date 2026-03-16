// Module 2: Scheduled monitoring jobs — the core Cedar pipeline
// Fetch → Normalize → Hash → Diff → Relevance → Classify → Record → Alert

import { inngest } from './client'
import { createServerClient } from '../lib/db/client'
import { dispatchFetch } from '../lib/fetchers/dispatcher'
import { hashContent, computeChainHash } from '../lib/changes/hash'
import { generateDiff, changeMagnitude } from '../lib/changes/diff'
import { runRelevanceFilter } from '../lib/intelligence/relevance-filter'
import { runClassifier } from '../lib/intelligence/classifier'
import { recordChange } from '../lib/audit/record'
import { isFeatureEnabled } from '../lib/features'

// Minimum change magnitude to run through the intelligence pipeline.
// Filters out trivial content noise (date updates, counter changes, etc.)
const MIN_CHANGE_MAGNITUDE = 0.02 // 2% of words changed

// ── monitorSource ─────────────────────────────────────────────────────────

export interface MonitorSourceEvent {
  data: {
    sourceId: string
    sourceUrlId: string
  }
}

/**
 * Core monitoring function. Triggered by the scheduler or manually.
 * Full pipeline: Fetch → Detect → Intelligence → Record → Alert
 */
export const monitorSource = inngest.createFunction(
  {
    id: 'monitor-source',
    name: 'Monitor Source',
    retries: 3,
    // Limit concurrent runs to avoid hammering external APIs
    concurrency: { limit: 5 },
  },
  { event: 'cedar/source.monitor' },
  async ({ event, step, logger }) => {
    const { sourceId, sourceUrlId } = (event as MonitorSourceEvent).data
    const supabase = createServerClient()

    // ── Step 1: Load source + source_url from DB ──────────────────────────
    const { source, sourceUrl } = await step.run('load-source', async () => {
      const { data: source, error: srcErr } = await supabase
        .from('sources')
        .select('*')
        .eq('id', sourceId)
        .single()
      if (srcErr || !source) throw new Error(`Source not found: ${sourceId}`)

      const { data: sourceUrl, error: urlErr } = await supabase
        .from('source_urls')
        .select('*')
        .eq('id', sourceUrlId)
        .single()
      if (urlErr || !sourceUrl) throw new Error(`SourceUrl not found: ${sourceUrlId}`)

      return { source, sourceUrl } as {
        source: Record<string, unknown>
        sourceUrl: Record<string, unknown>
      }
    })

    // ── Kill switch: abort if agents are disabled globally ─────────────────
    const agentsEnabled = await step.run('check-kill-switch', async () => {
      return isFeatureEnabled('agents_enabled', 'monitor')
    })
    if (!agentsEnabled) {
      logger.info('[monitor] agents_enabled=false — skipping pipeline (kill switch active)')
      return { skipped: true, reason: 'kill_switch', sourceId }
    }

    // ── Step 2: Fetch current content ────────────────────────────────────
    // Hash is computed on the full content inside the step (before truncation)
    // so detection is accurate. rawContent is dropped and content is capped at
    // 200KB to stay within Inngest's step payload size limit.
    const CONTENT_CAP = 200_000 // 200KB
    const fetchResult = await step.run('fetch-content', async () => {
      const result = await dispatchFetch(
        source as Parameters<typeof dispatchFetch>[0],
        sourceUrl.url as string,
        sourceUrlId
      )
      return {
        sourceId: result.sourceId,
        sourceUrlId: result.sourceUrlId,
        url: result.url,
        content: result.content.slice(0, CONTENT_CAP),
        contentHash: hashContent(result.content), // hash of full content
        fetchedAt: result.fetchedAt,
        fetchMethod: result.fetchMethod,
        mimeType: result.mimeType,
      }
    })

    // ── Step 3: Check hash — skip if content is unchanged ────────────────
    const currentHash = fetchResult.contentHash
    const lastHash = sourceUrl.last_hash as string | null

    if (currentHash === lastHash) {
      logger.info(`[monitor] No change detected for source: ${source.name}`)
      // Update last_fetched_at even when unchanged
      await step.run('update-fetched-at', async () => {
        await supabase
          .from('source_urls')
          .update({ last_fetched_at: new Date().toISOString() })
          .eq('id', sourceUrlId)
      })
      return { changed: false, sourceId, sourceUrlId }
    }

    // ── Step 4: Content changed — look up previous content + generate diff ──
    const diff = await step.run('generate-diff', async () => {
      // Previous content lives in the most recent changes row for this source_url,
      // not on source_urls itself (which has no last_content column).
      let before = ''
      if (lastHash !== null) {
        const { data: lastChange } = await supabase
          .from('changes')
          .select('content_after')
          .eq('source_url_id', sourceUrlId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()
        before = lastChange?.content_after ?? ''
      }
      return {
        diff: generateDiff(before, fetchResult.content),
        magnitude: changeMagnitude(before, fetchResult.content),
        before,
      }
    })

    // Skip trivially small changes (noise filter)
    if (diff.magnitude < MIN_CHANGE_MAGNITUDE && lastHash !== null) {
      logger.info(`[monitor] Change magnitude ${diff.magnitude.toFixed(3)} below threshold — skipping: ${source.name}`)
      await step.run('update-hash-after-skip', async () => {
        await supabase
          .from('source_urls')
          .update({ last_hash: currentHash, last_fetched_at: new Date().toISOString() })
          .eq('id', sourceUrlId)
      })
      return { changed: false, skipped: true, magnitude: diff.magnitude, sourceId }
    }

    // ── Step 5: Run relevance filter (Agent 1) ────────────────────────────
    const relevance = await step.run('relevance-filter', async () => {
      const contentForAgent = diff.diff ?? fetchResult.content.slice(0, 4000)
      return runRelevanceFilter(
        contentForAgent,
        source.name as string,
        fetchResult.url,
        { sourceId, sourceUrlId }
      )
    })

    if (!relevance.isRelevant) {
      logger.info(`[monitor] Not relevant (score: ${relevance.relevanceScore}) — skipping: ${source.name}`)
      await step.run('update-hash-irrelevant', async () => {
        await supabase
          .from('source_urls')
          .update({ last_hash: currentHash, last_fetched_at: new Date().toISOString() })
          .eq('id', sourceUrlId)
      })
      return { changed: true, relevant: false, relevanceScore: relevance.relevanceScore, sourceId }
    }

    // ── Step 6: Run classifier (Agent 2) ─────────────────────────────────
    const classification = await step.run('classify', async () => {
      const contentForAgent = diff.diff ?? fetchResult.content.slice(0, 4000)
      return runClassifier(
        contentForAgent,
        source.name as string,
        relevance.reasoning,
        { sourceId, sourceUrlId }
      )
    })

    // ── Step 7: Get previous chain_hash for tamper-evident chain ──────────
    const chainHash = await step.run('compute-chain-hash', async () => {
      const { data: lastChange } = await supabase
        .from('changes')
        .select('chain_hash')
        .eq('source_id', sourceId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      const previousChainHash = lastChange ? (lastChange as { chain_hash: string | null }).chain_hash : null
      return computeChainHash(previousChainHash, currentHash)
    })

    // ── Step 8: Determine review status from review_rules ─────────────────
    const reviewStatus = await step.run('determine-review-status', async () => {
      const { data: rule } = await supabase
        .from('review_rules')
        .select('auto_approve, route_to_hitl')
        .eq('severity', classification.severity)
        .single()

      if (!rule) return 'pending' as const
      const r = rule as { auto_approve: boolean; route_to_hitl: boolean }
      if (r.auto_approve) return 'auto_approved' as const
      return 'pending' as const
    })

    // ── Step 9: Record change (append-only) ───────────────────────────────
    const changeId = await step.run('record-change', async () => {
      return recordChange({
        source_id: sourceId,
        source_url_id: sourceUrlId,
        jurisdiction: (source.jurisdiction as string) ?? 'FL',
        content_before: diff.before || null,
        content_after: fetchResult.content,
        diff: diff.diff,
        hash: currentHash,
        chain_hash: chainHash,
        agent_version: relevance.agentVersion,
        relevance_score: relevance.relevanceScore,
        severity: classification.severity,
        summary: classification.summary,
        raw_classification: classification.rawClassification as import('../lib/db/types').Json,
        review_status: reviewStatus,
      })
    })

    // ── Step 10: Update source_url with new hash ──────────────────────────
    await step.run('update-source-url', async () => {
      await supabase
        .from('source_urls')
        .update({ last_hash: currentHash, last_fetched_at: new Date().toISOString() })
        .eq('id', sourceUrlId)
    })

    // ── Step 11: Trigger delivery (email alert) ───────────────────────────
    await step.sendEvent('trigger-delivery', {
      name: 'cedar/change.deliver',
      data: { changeId, severity: classification.severity },
    })

    logger.info(
      `[monitor] Change recorded: ${source.name} | severity=${classification.severity} | changeId=${changeId}`
    )

    return {
      changed: true,
      relevant: true,
      changeId,
      severity: classification.severity,
      summary: classification.summary,
      sourceId,
    }
  }
)

// ── scheduledMonitor ──────────────────────────────────────────────────────

/**
 * Cron job: fans out monitorSource events for all active sources.
 * Runs every 6 hours. Critical-tier sources can be added to a more frequent schedule later.
 */
export const scheduledMonitor = inngest.createFunction(
  {
    id: 'scheduled-monitor',
    name: 'Scheduled Monitor — All Active Sources',
  },
  { cron: '0 */6 * * *' }, // Every 6 hours
  async ({ step, logger }) => {
    const supabase = createServerClient()

    // Load all active source_urls (join through sources)
    const activeSourceUrls = await step.run('load-active-sources', async () => {
      const { data, error } = await supabase
        .from('source_urls')
        .select('id, source_id, sources!inner(is_active, fetch_method)')
        .eq('sources.is_active', true)

      if (error) throw new Error(`Failed to load active sources: ${error.message}`)
      return data ?? []
    })

    logger.info(`[scheduled-monitor] Fanning out ${activeSourceUrls.length} source URL jobs`)

    // Fan out one monitorSource event per source_url
    if (activeSourceUrls.length > 0) {
      await step.sendEvent(
        'fan-out-monitor-jobs',
        (activeSourceUrls as unknown as Array<{ id: string; source_id: string }>).map(su => ({
          name: 'cedar/source.monitor' as const,
          data: {
            sourceId: su.source_id,
            sourceUrlId: su.id,
          },
        }))
      )
    }

    return { dispatched: activeSourceUrls.length }
  }
)
