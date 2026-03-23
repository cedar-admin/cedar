// Cedar Research Orchestrator — Session execution

import Anthropic from '@anthropic-ai/sdk';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { readFile, writeFile, resolveFromRoot, log, warn, success, error as logError } from './utils.js';
import { getSession, saveManifest, updateSessionStatus } from './manifest.js';
import { checkDependencies } from './dag.js';
import { estimateSessionSize } from './token-counter.js';
import { SessionStatus } from './types.js';
import type { Manifest, Session } from './types.js';

let _client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!_client) _client = new Anthropic();
  return _client;
}

/**
 * Run an API-route session end-to-end.
 */
export async function runApiSession(
  session: Session,
  manifest: Manifest
): Promise<void> {
  const client = getClient();

  // 1. Load system prompt
  const systemPromptPath = path.join(
    manifest.meta.prompt_dir,
    'templates/system-prompt.md'
  );
  const systemPrompt = await readFile(systemPromptPath);

  // 2. Assemble context packs
  const contextParts: string[] = [];
  for (const packPath of session.context_inputs) {
    const content = await readFile(packPath);
    contextParts.push(content);
  }
  const contextContent = contextParts.join('\n---\n');

  // 3. Load task prompt
  const taskPrompt = await readFile(session.prompt_file);

  // 4. Pre-flight token check
  const estimate = await estimateSessionSize(session, manifest);
  if (estimate.input_tokens > manifest.meta.splintering_threshold) {
    throw new Error(
      `Session ${session.id} estimated at ${estimate.input_tokens.toLocaleString()} tokens ` +
      `(threshold: ${manifest.meta.splintering_threshold.toLocaleString()}). ` +
      `Run: npm run research -- splinter ${session.id}`
    );
  }

  // 5. Pre-fetch any required web data
  if (session.prefetch?.length) {
    for (const pf of session.prefetch) {
      const response = await fetch(pf.url);
      const data = await response.text();
      await writeFile(pf.save_as, data);
      contextParts.push(`\n---\n## Pre-fetched data from ${pf.url}:\n${data}`);
    }
  }

  // 6. Update status
  updateSessionStatus(manifest, session.id, SessionStatus.Running);
  await saveManifest(manifest);

  // 7. Execute API call (streaming to support long responses)
  const maxTokens = session.max_output_tokens ?? manifest.meta.default_max_output_tokens;
  const stream = await client.messages.stream({
    model: session.model ?? manifest.meta.synthesis_model,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{
      role: 'user',
      content: `## Context from prior research sessions:\n\n${contextContent}\n\n---\n\n## Research task:\n\n${taskPrompt}`,
    }],
  });

  const response = await stream.finalMessage();

  // 8. Check for truncation
  if (response.stop_reason === 'max_tokens') {
    warn(
      `Session ${session.id} output was TRUNCATED (hit max_tokens=${maxTokens}). ` +
      `Consider increasing max_output_tokens or splintering this session.`
    );
  }

  // 9. Capture output
  const output = response.content
    .filter(block => block.type === 'text')
    .map(block => block.text)
    .join('\n');
  await writeFile(session.output_file!, output);

  // 10. Record actual token usage
  if (!session.metadata) session.metadata = {};
  session.metadata.actual_tokens = {
    input: response.usage.input_tokens,
    output: response.usage.output_tokens,
  };
  session.metadata.stop_reason = response.stop_reason ?? undefined;

  // 11. Update status (context pack generation is manual via `compress` command)
  updateSessionStatus(manifest, session.id, SessionStatus.Complete);
  session.completed_at = new Date().toISOString();
  await saveManifest(manifest);

  success(`Session ${session.id} complete (${response.usage.input_tokens} in, ${response.usage.output_tokens} out)`);

  // 12. Auto-commit and push output + manifest
  try {
    const manifestPath = resolveFromRoot('research/manifest.yaml');
    const outputPath = resolveFromRoot(session.output_file!);
    execSync(`git add "${manifestPath}" "${outputPath}"`, { stdio: 'pipe' });
    execSync(
      `git commit -m "research: ${session.id} complete (${response.usage.input_tokens}in/${response.usage.output_tokens}out)"`,
      { stdio: 'pipe' }
    );
    const pat = process.env.GITHUB_PAT;
    if (pat) {
      execSync(`git remote set-url origin "https://${pat}@github.com/cedar-admin/cedar.git"`, { stdio: 'pipe' });
      execSync('git push origin main', { stdio: 'pipe' });
      execSync('git remote set-url origin "https://github.com/cedar-admin/cedar.git"', { stdio: 'pipe' });
      log(`📤 Pushed ${session.id} output to GitHub`);
    } else {
      warn(`GITHUB_PAT not set — skipping push (committed locally)`);
    }
  } catch (e: any) {
    warn(`Auto-commit failed: ${e.message}`);
  }
}

/**
 * Prepare a web-route session: assemble package, copy to clipboard.
 */
export async function prepareWebSession(
  session: Session,
  manifest: Manifest
): Promise<string> {
  // 1. Assemble context packs
  const contextParts: string[] = [];
  for (const packPath of session.context_inputs) {
    try {
      const content = await readFile(packPath);
      contextParts.push(content);
    } catch {
      warn(`Context pack not found: ${packPath} — session may need upstream completion first`);
    }
  }
  const contextContent = contextParts.join('\n---\n');

  // 2. Load task prompt
  const taskPrompt = await readFile(session.prompt_file);

  // 3. Build the session package
  const parts = [];
  if (contextContent.trim()) {
    parts.push('## Context from prior research sessions:\n');
    parts.push(contextContent);
    parts.push('\n---\n');
  }
  parts.push('## Research task:\n');
  parts.push(taskPrompt);
  const sessionPackage = parts.join('\n');

  // 4. Write to file
  const packagePath = path.join(
    manifest.meta.output_dir,
    `part${session.part}`,
    `${session.id}-package.md`
  );
  await writeFile(packagePath, sessionPackage);

  // 5. Copy to clipboard (macOS)
  try {
    execSync(`cat "${resolveFromRoot(packagePath)}" | pbcopy`);
    log(`\n📋 Copied to clipboard.`);
  } catch {
    log(`\n📄 Session package written to: ${packagePath}`);
    log(`   (Clipboard copy failed — copy the file contents manually)`);
  }

  log(`\nOperator steps:`);
  log(`  1. Paste into claude.ai → select Opus model`);
  log(`     (Context from prior sessions is already included in the pasted text)`);
  log(`  2. When complete, save the output to: ${session.output_file}`);
  log(`  3. Run: npm run research -- complete ${session.id}\n`);

  // 6. Update status
  updateSessionStatus(manifest, session.id, SessionStatus.Running);
  await saveManifest(manifest);
  return packagePath;
}

/**
 * Submit all ready API-route sessions as a Batch API request (50% discount).
 */
export async function runBatch(
  readySessions: Session[],
  manifest: Manifest
): Promise<void> {
  const client = getClient();
  const systemPromptPath = path.join(
    manifest.meta.prompt_dir,
    'templates/system-prompt.md'
  );
  const systemPrompt = await readFile(systemPromptPath);

  const requests = await Promise.all(readySessions.map(async (session) => {
    const contextParts = await Promise.all(
      session.context_inputs.map(p => readFile(p))
    );
    const taskPrompt = await readFile(session.prompt_file);

    return {
      custom_id: session.id,
      params: {
        model: session.model ?? manifest.meta.synthesis_model,
        max_tokens: session.max_output_tokens ?? manifest.meta.default_max_output_tokens,
        system: systemPrompt,
        messages: [{
          role: 'user' as const,
          content: `## Context:\n\n${contextParts.join('\n---\n')}\n\n---\n\n## Task:\n\n${taskPrompt}`,
        }],
      },
    };
  }));

  log(`📦 Submitting batch of ${requests.length} sessions...`);

  const batch = await client.messages.batches.create({ requests });
  log(`   Batch ID: ${batch.id} — processing (up to 24h, usually much faster)`);

  // Poll for completion
  let status = batch.processing_status;
  while (status !== 'ended') {
    await new Promise(resolve => setTimeout(resolve, 30000));
    const updated = await client.messages.batches.retrieve(batch.id);
    status = updated.processing_status;
    log(`   Status: ${status} (${JSON.stringify(updated.request_counts)})`);
  }

  // Retrieve results
  const results = await client.messages.batches.results(batch.id);
  for await (const entry of results) {
    const session = readySessions.find(s => s.id === entry.custom_id);
    if (!session) continue;

    if (entry.result.type === 'succeeded') {
      const output = entry.result.message.content
        .filter((b: any) => b.type === 'text')
        .map((b: any) => b.text)
        .join('\n');
      await writeFile(session.output_file!, output);
      updateSessionStatus(manifest, session.id, SessionStatus.Complete);
      session.completed_at = new Date().toISOString();
      success(`${session.id} complete`);
    } else {
      updateSessionStatus(manifest, session.id, SessionStatus.Failed);
      session.metadata = { ...session.metadata, error: JSON.stringify(entry.result) };
      logError(`${session.id} failed: ${entry.result.type}`);
    }
  }

  await saveManifest(manifest);
}

/**
 * Guard: refuse to run sessions that shouldn't be run.
 */
export function validateRunnable(session: Session, manifest: Manifest): void {
  if (session.status === SessionStatus.Splintered) {
    throw new Error(
      `Session ${session.id} is splintered. Run its children instead: ${session.splinter_children.join(', ')}`
    );
  }
  if (session.status === SessionStatus.Complete) {
    throw new Error(`Session ${session.id} is already complete`);
  }
  if (session.status === SessionStatus.Running) {
    throw new Error(`Session ${session.id} is already running`);
  }

  const depCheck = checkDependencies(manifest, session.id);
  if (!depCheck.met) {
    throw new Error(
      `Session ${session.id} has unmet dependencies: ${depCheck.unmet.join(', ')}`
    );
  }
}
