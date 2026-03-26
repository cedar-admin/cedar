// Module 6: Agent 2 — Classifier
// Assigns severity and generates plain-language summary
// Built in Phase: MVP (Months 0-2)

import Anthropic from '@anthropic-ai/sdk'
import { trackCost, calculateClaudeCost } from '../cost-tracker'
import { CLASSIFIER_VERSION, CLASSIFIER_PROMPT } from './prompts/classifier'

const MODEL = 'claude-sonnet-4-5-20250929'

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'informational'

export interface ClassificationResult {
  severity: Severity
  summary: string
  affectedPracticeTypes: string[]
  regulatoryDomains: string[]
  effectiveDate: string | null
  actionItems: string[]
  rawClassification: Record<string, unknown>
  agentVersion: string
}

/**
 * Agent 2: Classify severity and generate plain-language summary.
 * TODO: Implement in Module 6 (MVP)
 */
export async function runClassifier(
  contentDiff: string,
  sourceName: string,
  relevanceReasoning: string,
  context: { sourceId: string; sourceUrlId?: string }
): Promise<ClassificationResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set')
  const client = new Anthropic({ apiKey })

  const prompt = CLASSIFIER_PROMPT
    .replace('{CONTENT_DIFF}', contentDiff)
    .replace('{SOURCE_NAME}', sourceName)
    .replace('{RELEVANCE_REASONING}', relevanceReasoning)

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const tokensIn = response.usage.input_tokens
  const tokensOut = response.usage.output_tokens

  await trackCost({
    service: 'claude',
    operation: 'classifier',
    cost_usd: calculateClaudeCost(tokensIn, tokensOut),
    tokens_in: tokensIn,
    tokens_out: tokensOut,
    context,
  })

  if (!response.content?.[0]) {
    throw new Error('Classifier returned empty content array')
  }
  const text = response.content[0].type === 'text' ? response.content[0].text : ''

  // Parse JSON from response — try direct parse first, fall back to regex extraction
  let parsed: {
    severity: Severity
    summary: string
    affected_practice_types: string[]
    regulatory_domains: string[]
    effective_date: string | null
    action_items: string[]
  }
  try {
    parsed = JSON.parse(text)
  } catch {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error(`Classifier returned unparseable response: ${text.slice(0, 500)}`)
    }
    try {
      parsed = JSON.parse(jsonMatch[0])
    } catch (parseErr) {
      throw new Error(
        `Classifier JSON parse failed: ${parseErr instanceof Error ? parseErr.message : 'unknown'}. Raw: ${text.slice(0, 500)}`
      )
    }
  }

  return {
    severity: parsed.severity,
    summary: parsed.summary,
    affectedPracticeTypes: parsed.affected_practice_types,
    regulatoryDomains: parsed.regulatory_domains,
    effectiveDate: parsed.effective_date,
    actionItems: parsed.action_items,
    rawClassification: parsed as Record<string, unknown>,
    agentVersion: CLASSIFIER_VERSION,
  }
}
