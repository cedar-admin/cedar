// Module 6: Agent 1 — Relevance Filter
// Determines if a detected content change is relevant to FL medical practices
// Built in Phase: MVP (Months 0-2)

import Anthropic from '@anthropic-ai/sdk'
import { trackCost, calculateClaudeCost } from '../cost-tracker'
import { RELEVANCE_FILTER_VERSION, RELEVANCE_FILTER_PROMPT } from './prompts/relevance-filter'

const MODEL = 'claude-sonnet-4-5-20250929'

export interface RelevanceResult {
  isRelevant: boolean
  relevanceScore: number
  reasoning: string
  agentVersion: string
}

/**
 * Agent 1: Determine if a content diff is relevant to FL medical practices.
 * Returns relevance score and reasoning for the audit trail.
 * TODO: Implement in Module 6 (MVP)
 */
export async function runRelevanceFilter(
  contentDiff: string,
  sourceName: string,
  sourceUrl: string,
  context: { sourceId: string; sourceUrlId?: string }
): Promise<RelevanceResult> {
  // Use process.env directly — same pattern as db/client.ts.
  // getEnv() Zod validation has an issue with Turbopack inlining ANTHROPIC_API_KEY
  // in step callback contexts; direct access is guaranteed runtime resolution.
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set')
  const client = new Anthropic({ apiKey })

  const prompt = RELEVANCE_FILTER_PROMPT
    .replace('{CONTENT_DIFF}', contentDiff)
    .replace('{SOURCE_NAME}', sourceName)
    .replace('{SOURCE_URL}', sourceUrl)

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 512,
    messages: [{ role: 'user', content: prompt }],
  })

  const tokensIn = response.usage.input_tokens
  const tokensOut = response.usage.output_tokens

  await trackCost({
    service: 'claude',
    operation: 'relevance_filter',
    cost_usd: calculateClaudeCost(tokensIn, tokensOut),
    tokens_in: tokensIn,
    tokens_out: tokensOut,
    context,
  })

  if (!response.content?.[0]) {
    throw new Error('Relevance filter returned empty content array')
  }
  const text = response.content[0].type === 'text' ? response.content[0].text : ''

  // Parse JSON from response — try direct parse first, fall back to regex extraction
  let parsed: { is_relevant: boolean; relevance_score: number; reasoning: string }
  try {
    parsed = JSON.parse(text)
  } catch {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error(`Relevance filter returned unparseable response: ${text.slice(0, 500)}`)
    }
    try {
      parsed = JSON.parse(jsonMatch[0])
    } catch (parseErr) {
      throw new Error(
        `Relevance filter JSON parse failed: ${parseErr instanceof Error ? parseErr.message : 'unknown'}. Raw: ${text.slice(0, 500)}`
      )
    }
  }

  return {
    isRelevant: parsed.is_relevant,
    relevanceScore: parsed.relevance_score,
    reasoning: parsed.reasoning,
    agentVersion: RELEVANCE_FILTER_VERSION,
  }
}
