import { createServerClient } from './db/client'
import type { Json } from './db/types'

export type CostService =
  | 'claude'
  | 'gov_api'      // free public APIs — tracked at $0 for audit/rate-limit visibility
  | 'oxylabs'
  | 'browserbase'
  | 'docling'
  | 'whisper'
  | 'resend'
  | 'onesignal'

export interface TrackCostParams {
  service: CostService
  operation: string
  cost_usd: number
  tokens_in?: number
  tokens_out?: number
  context?: Record<string, unknown>
}

/**
 * Log a cost event to the cost_events table.
 * Every external API call MUST be wrapped with this function — no exceptions.
 * Failures are logged but never throw — cost tracking must never break the pipeline.
 *
 * @example
 * await trackCost({
 *   service: 'claude',
 *   operation: 'relevance_filter',
 *   cost_usd: 0.0012,
 *   tokens_in: 800,
 *   tokens_out: 150,
 *   context: { change_id: '...', source_id: '...' }
 * })
 */
export async function trackCost(params: TrackCostParams): Promise<void> {
  try {
    const supabase = createServerClient()
    const { error } = await supabase.from('cost_events').insert({
      service: params.service,
      operation: params.operation,
      cost_usd: params.cost_usd,
      tokens_in: params.tokens_in ?? null,
      tokens_out: params.tokens_out ?? null,
      context: (params.context ?? null) as Json | null,
    })
    if (error) {
      console.error('[cost-tracker] Failed to log cost event:', error.message, params)
    }
  } catch (err) {
    // Never throw — cost tracking failure must not break the pipeline
    console.error('[cost-tracker] Unexpected error logging cost event:', err, params)
  }
}

/**
 * Calculate Claude API cost from token counts.
 * Uses claude-3-5-sonnet-20241022 pricing (update if model changes).
 */
export function calculateClaudeCost(tokensIn: number, tokensOut: number): number {
  // claude-sonnet-4-5-20250929 pricing (per million tokens)
  const INPUT_COST_PER_M = 3.0   // $3.00 per 1M input tokens
  const OUTPUT_COST_PER_M = 15.0 // $15.00 per 1M output tokens
  return (tokensIn / 1_000_000) * INPUT_COST_PER_M + (tokensOut / 1_000_000) * OUTPUT_COST_PER_M
}
