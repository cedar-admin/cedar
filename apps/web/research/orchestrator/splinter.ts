// Cedar Research Orchestrator — Auto-splintering logic

import Anthropic from '@anthropic-ai/sdk';
import yaml from 'js-yaml';
import { statSync } from 'node:fs';
import { readFile, writeFile, resolveFromRoot, log, warn, success, error as logError } from './utils.js';
import { getSession, saveManifest } from './manifest.js';
import { estimateSessionSize } from './token-counter.js';
import { SessionStatus } from './types.js';
import type { Manifest, Session } from './types.js';

let _client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!_client) _client = new Anthropic();
  return _client;
}

interface SplinterProposal {
  id_suffix: string;
  title: string;
  description: string;
  deliverables: string[];
  additional_dependencies: string[];
  context_inputs?: string[];   // per-child subset; falls back to parent's full list if absent
  execution_route: 'api' | 'web';
  estimated_tokens: number;
}

/**
 * Analyze a session and propose a splintering plan.
 */
export async function proposeSplinter(
  sessionId: string,
  manifest: Manifest
): Promise<SplinterProposal[]> {
  const session = getSession(manifest, sessionId);

  if (session.status === SessionStatus.Splintered) {
    throw new Error(`Session ${sessionId} is already splintered`);
  }
  if (session.status === SessionStatus.Complete) {
    throw new Error(`Session ${sessionId} is already complete`);
  }

  // Estimate size
  const estimate = await estimateSessionSize(session, manifest);
  log(`Session ${sessionId} estimated at ${estimate.input_tokens.toLocaleString()} input tokens`);

  if (estimate.input_tokens < manifest.meta.splintering_threshold) {
    warn(`Session is below splintering threshold (${manifest.meta.splintering_threshold.toLocaleString()} tokens). Splintering may not be necessary.`);
  }

  // Load prompt
  const taskPrompt = await readFile(session.prompt_file);

  // Build context file list with byte sizes for the AI
  const contextFileList = session.context_inputs.map(p => {
    try {
      const bytes = statSync(resolveFromRoot(p)).size;
      const kb = (bytes / 1024).toFixed(0);
      return `  - ${p}  (~${kb} KB)`;
    } catch {
      return `  - ${p}  (not yet generated)`;
    }
  }).join('\n') || '  (none)';

  // Load splintering template
  const template = await readFile('research/prompts/templates/splintering-prompt.md');
  const prompt = template
    .replace('{session_id}', session.id)
    .replace('{session_title}', session.title)
    .replace('{estimated_tokens}', estimate.input_tokens.toString())
    .replace('{max_tokens_per_session}', manifest.meta.max_context_budget.toString())
    .replace('{session_prompt}', taskPrompt)
    .replace('{context_file_list}', contextFileList);

  // Ask AI for splintering plan
  const client = getClient();
  const response = await client.messages.create({
    model: manifest.meta.synthesis_model,
    max_tokens: 8192,
    messages: [{ role: 'user', content: prompt }],
  });

  const responseText = response.content
    .filter(block => block.type === 'text')
    .map(block => block.text)
    .join('\n');

  // Extract YAML from response
  const yamlMatch = responseText.match(/```(?:yaml)?\n([\s\S]*?)```/) ||
                    responseText.match(/sub_sessions:[\s\S]*/);
  if (!yamlMatch) {
    throw new Error('AI response did not contain a valid splintering plan');
  }

  const yamlContent = yamlMatch[1] ?? yamlMatch[0];
  const parsed = yaml.load(yamlContent) as { sub_sessions: SplinterProposal[] };

  if (!parsed?.sub_sessions?.length) {
    throw new Error('Splintering plan contained no sub-sessions');
  }

  return parsed.sub_sessions;
}

/**
 * Apply a splintering plan to the manifest.
 * Creates sub-sessions, generates prompt files, updates the parent.
 */
export async function applySplinter(
  sessionId: string,
  proposals: SplinterProposal[],
  manifest: Manifest
): Promise<void> {
  const session = getSession(manifest, sessionId);
  const childIds: string[] = [];

  for (const proposal of proposals) {
    const childId = `${sessionId}-${proposal.id_suffix}`;
    childIds.push(childId);

    // Generate prompt file for sub-session
    const promptPath = `research/prompts/part${session.part}/${childId.replace('P1_', '').replace('P2_', '').replace('P3_', '')}-${proposal.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;

    // Create sub-session prompt from deliverables
    const subPrompt = [
      `# ${proposal.title}`,
      '',
      proposal.description,
      '',
      '## Deliverables',
      ...proposal.deliverables.map(d => `- ${d}`),
      '',
      '## Context',
      `This is sub-session ${proposal.id_suffix} of splintered session ${sessionId}.`,
      `Parent session: "${session.title}"`,
    ].join('\n');

    await writeFile(promptPath, subPrompt);

    // Build dependencies
    const deps = [...session.dependencies, ...proposal.additional_dependencies];

    // Use per-child context subset if the AI provided one; fall back to full parent list
    const contextInputs = proposal.context_inputs?.length
      ? proposal.context_inputs
      : [...session.context_inputs];

    // Create sub-session entry
    const subSession: Session = {
      id: childId,
      part: session.part,
      session: session.session,
      sub: proposal.id_suffix,
      title: proposal.title,
      description: proposal.description,
      status: SessionStatus.Planned,
      dependencies: deps,
      context_inputs: contextInputs,
      execution_route: proposal.execution_route,
      prompt_file: promptPath,
      output_file: `research/outputs/part${session.part}/${childId}.md`,
      context_pack_file: `research/context-packs/part${session.part}/${childId}.yaml`,
      splinter_parent: sessionId,
      splinter_children: [],
    };

    manifest.sessions.push(subSession);
    log(`  Created sub-session: ${childId} — "${proposal.title}"`);
  }

  // Update parent
  session.status = SessionStatus.Splintered;
  session.splinter_children = childIds;

  // Set combined context pack path
  session.context_pack_file = `research/context-packs/part${session.part}/${sessionId}-combined.yaml`;

  await saveManifest(manifest);
  success(`Splintered ${sessionId} into ${childIds.length} sub-sessions`);
}

/**
 * Display a splintering proposal for user review.
 */
export function displayProposal(sessionId: string, proposals: SplinterProposal[]): void {
  log(`\nSplintering plan for ${sessionId}:\n`);
  for (const p of proposals) {
    log(`  ${sessionId}-${p.id_suffix}: "${p.title}"`);
    log(`    Route: ${p.execution_route}`);
    log(`    Est. tokens: ${p.estimated_tokens.toLocaleString()}`);
    log(`    Deliverables: ${p.deliverables.join(', ')}`);
    if (p.additional_dependencies.length > 0) {
      log(`    Extra deps: ${p.additional_dependencies.join(', ')}`);
    }
    log('');
  }
}
