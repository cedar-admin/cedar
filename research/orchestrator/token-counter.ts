// Cedar Research Orchestrator — Token counting

import Anthropic from '@anthropic-ai/sdk';
import { readFile } from './utils.js';
import type { Manifest, Session, TokenEstimate } from './types.js';
import path from 'node:path';

let _client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!_client) _client = new Anthropic();
  return _client;
}

/**
 * Estimate total token usage for a session (input + estimated output).
 * Uses the Anthropic countTokens API (free, exact for input).
 */
export async function estimateSessionSize(
  session: Session,
  manifest: Manifest
): Promise<TokenEstimate> {
  const client = getClient();

  // Load the system prompt (shared template)
  const systemPromptPath = path.join(
    manifest.meta.prompt_dir,
    'templates/system-prompt.md'
  );
  const systemPrompt = await readFile(systemPromptPath);

  // Load all required context packs
  const contextParts: string[] = [];
  for (const packPath of session.context_inputs) {
    try {
      const content = await readFile(packPath);
      contextParts.push(content);
    } catch {
      // Context pack may not exist yet for planned sessions
      contextParts.push(`[Context pack not yet generated: ${packPath}]`);
    }
  }
  const contextContent = contextParts.join('\n---\n');

  // Load the task prompt
  const taskPrompt = await readFile(session.prompt_file);

  // Assemble the full user message
  const userMessage = contextContent
    ? `## Context from prior sessions:\n\n${contextContent}\n\n---\n\n## Research task:\n\n${taskPrompt}`
    : `## Research task:\n\n${taskPrompt}`;

  // Count tokens using the Anthropic API (free, exact)
  const result = await client.messages.countTokens({
    model: session.model ?? manifest.meta.synthesis_model,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });

  const inputTokens = result.input_tokens;
  const estimatedOutput = session.max_output_tokens
    ?? manifest.meta.default_max_output_tokens;
  const total = inputTokens + estimatedOutput;

  return {
    session_id: session.id,
    input_tokens: inputTokens,
    estimated_output_tokens: estimatedOutput,
    total,
    exceeds_budget: inputTokens > manifest.meta.max_context_budget,
    exceeds_splintering_threshold: inputTokens > manifest.meta.splintering_threshold,
  };
}
