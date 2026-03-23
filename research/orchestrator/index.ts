#!/usr/bin/env node
// Cedar Research Orchestrator — CLI entry point

import { loadManifest, getSession, saveManifest, updateSessionStatus } from './manifest.js';
import { topologicalSort, getReadySessions, getStatusCounts, getCriticalPath, checkDependencies } from './dag.js';
import { estimateSessionSize } from './token-counter.js';
import { generateContextPack, validateAllContextPacks } from './compressor.js';
import { proposeSplinter, applySplinter, displayProposal } from './splinter.js';
import { runApiSession, prepareWebSession, runBatch, validateRunnable } from './runner.js';
import { log, warn, error as logError, success, fileExists } from './utils.js';
import { SessionStatus } from './types.js';
import type { Manifest } from './types.js';

const COMMANDS = ['status', 'next', 'run', 'run-batch', 'complete', 'compress', 'splinter', 'validate', 'cost'];

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || !COMMANDS.includes(command)) {
    log('Cedar Research Orchestrator');
    log('');
    log('Usage: npm run research -- <command> [args]');
    log('');
    log('Commands:');
    log('  status              Show DAG state and progress');
    log('  next                Show sessions ready to run');
    log('  run <id>            Execute a session (API) or prepare package (web)');
    log('  run-batch           Submit all ready API sessions as a batch (50% off)');
    log('  complete <id>       Mark a web-route session as complete');
    log('  compress <id>       Generate/regenerate context pack for a session');
    log('  splinter <id>       Propose splitting a session into sub-sessions');
    log('  validate            Validate all context packs against raw outputs');
    log('  cost                Estimate remaining cost');
    process.exit(command ? 1 : 0);
  }

  const manifest = await loadManifest();

  switch (command) {
    case 'status':
      await cmdStatus(manifest);
      break;
    case 'next':
      await cmdNext(manifest);
      break;
    case 'run':
      await cmdRun(args[1], manifest);
      break;
    case 'run-batch':
      await cmdRunBatch(manifest);
      break;
    case 'complete':
      await cmdComplete(args[1], manifest);
      break;
    case 'compress':
      await cmdCompress(args[1], manifest);
      break;
    case 'splinter':
      await cmdSplinter(args[1], manifest);
      break;
    case 'validate':
      await cmdValidate(manifest);
      break;
    case 'cost':
      await cmdCost(manifest);
      break;
  }
}

// ─── status ───────────────────────────────────────────────────────────────────

async function cmdStatus(manifest: Manifest): Promise<void> {
  log('Cedar Research Orchestrator — DAG Status\n');

  // Verify DAG is valid
  try {
    topologicalSort(manifest);
    success('DAG is valid (no cycles)\n');
  } catch (err) {
    logError(`DAG error: ${err instanceof Error ? err.message : String(err)}\n`);
  }

  // Status counts
  const counts = getStatusCounts(manifest);
  log('Session counts:');
  for (const [status, count] of Object.entries(counts)) {
    const icon = status === 'complete' ? '✅' :
                 status === 'splintered' ? '🔀' :
                 status === 'blocked' ? '🔴' :
                 status === 'failed' ? '❌' :
                 status === 'running' ? '🔄' :
                 status === 'ready' ? '🟢' :
                 status === 'planned' ? '📋' : '❓';
    log(`  ${icon} ${status}: ${count}`);
  }

  // Group sessions by status
  log('\n── Sessions by status ──\n');

  const statusOrder: SessionStatus[] = [
    SessionStatus.Complete,
    SessionStatus.Splintered,
    SessionStatus.Running,
    SessionStatus.Blocked,
    SessionStatus.Failed,
    SessionStatus.Planned,
  ];

  for (const status of statusOrder) {
    const sessions = manifest.sessions.filter(s => s.status === status);
    if (sessions.length === 0) continue;

    log(`${status.toUpperCase()}:`);
    for (const s of sessions) {
      const route = s.execution_route === 'api' ? '[API]' : '[WEB]';
      log(`  ${s.id} ${route} — ${s.title}`);
    }
    log('');
  }

  // Ready sessions (computed)
  const ready = getReadySessions(manifest);
  if (ready.length > 0) {
    log('READY (computed):');
    for (const s of ready) {
      const route = s.execution_route === 'api' ? '[API]' : '[WEB]';
      log(`  ${s.id} ${route} — ${s.title}`);
    }
    log('');
  }

  // Critical path
  const criticalPath = getCriticalPath(manifest);
  if (criticalPath.length > 0) {
    log(`Critical path (${criticalPath.length} sessions): ${criticalPath.join(' → ')}`);
  }

  // Total progress
  const total = manifest.sessions.length;
  const done = manifest.sessions.filter(
    s => s.status === SessionStatus.Complete || s.status === SessionStatus.Splintered
  ).length;
  log(`\nProgress: ${done}/${total} sessions complete/splintered`);
}

// ─── next ─────────────────────────────────────────────────────────────────────

async function cmdNext(manifest: Manifest): Promise<void> {
  const ready = getReadySessions(manifest);

  if (ready.length === 0) {
    log('No sessions are ready. Check blocked/planned sessions with: npm run research -- status');
    return;
  }

  log(`${ready.length} session(s) ready to run:\n`);

  for (const session of ready) {
    const route = session.execution_route === 'api' ? '[API]' : '[WEB]';
    log(`  ${session.id} ${route} — ${session.title}`);
    log(`    Dependencies: ${session.dependencies.length === 0 ? 'none' : session.dependencies.join(', ')}`);
    log(`    Run: npm run research -- run ${session.id}`);
    log('');
  }
}

// ─── run ──────────────────────────────────────────────────────────────────────

async function cmdRun(sessionId: string | undefined, manifest: Manifest): Promise<void> {
  if (!sessionId) {
    logError('Usage: npm run research -- run <session_id>');
    process.exit(1);
  }

  const session = getSession(manifest, sessionId);
  validateRunnable(session, manifest);

  log(`Running session ${session.id}: "${session.title}" [${session.execution_route.toUpperCase()}]\n`);

  if (session.execution_route === 'api') {
    await runApiSession(session, manifest);
  } else {
    await prepareWebSession(session, manifest);
  }
}

// ─── run-batch ────────────────────────────────────────────────────────────────

async function cmdRunBatch(manifest: Manifest): Promise<void> {
  const ready = getReadySessions(manifest);
  const apiReady = ready.filter(s => s.execution_route === 'api');

  if (apiReady.length === 0) {
    log('No API-route sessions are ready for batch execution.');
    const webReady = ready.filter(s => s.execution_route === 'web');
    if (webReady.length > 0) {
      log(`${webReady.length} web-route session(s) ready — run them individually with: npm run research -- run <id>`);
    }
    return;
  }

  log(`Found ${apiReady.length} API-route session(s) ready for batch execution:`);
  for (const s of apiReady) {
    log(`  ${s.id} — ${s.title}`);
  }
  log('');

  await runBatch(apiReady, manifest);
}

// ─── complete ─────────────────────────────────────────────────────────────────

async function cmdComplete(sessionId: string | undefined, manifest: Manifest): Promise<void> {
  if (!sessionId) {
    logError('Usage: npm run research -- complete <session_id>');
    process.exit(1);
  }

  const session = getSession(manifest, sessionId);

  // Guards
  if (session.status === SessionStatus.Splintered) {
    throw new Error(
      `Session ${sessionId} is splintered (output_file is null). ` +
      `Complete its children instead: ${session.splinter_children.join(', ')}`
    );
  }

  if (session.status !== SessionStatus.Running && session.status !== SessionStatus.Planned) {
    throw new Error(
      `Session ${sessionId} has status "${session.status}" — expected "running" or "planned"`
    );
  }

  if (!session.output_file) {
    throw new Error(`Session ${sessionId} has no output_file defined`);
  }

  if (!fileExists(session.output_file)) {
    throw new Error(
      `Output file not found: ${session.output_file}\n` +
      `Save the research output there first, then re-run this command.`
    );
  }

  log(`Completing session ${sessionId}...`);

  // Context pack generation is no longer automatic.
  // Run `npm run research -- compress <id>` manually if needed.

  // Update status
  updateSessionStatus(manifest, sessionId, SessionStatus.Complete);
  session.completed_at = new Date().toISOString();
  await saveManifest(manifest);

  success(`Session ${sessionId} marked complete`);

  // Check if this completes a splintered parent
  if (session.splinter_parent) {
    const parent = getSession(manifest, session.splinter_parent);
    const allChildrenComplete = parent.splinter_children.every(childId => {
      const child = getSession(manifest, childId);
      return child.status === SessionStatus.Complete;
    });

    if (allChildrenComplete) {
      log(`\nAll children of ${parent.id} are complete.`);
      log(`  To generate a combined context pack: npm run research -- compress ${parent.id}`);
    } else {
      const remaining = parent.splinter_children.filter(childId => {
        const child = getSession(manifest, childId);
        return child.status !== SessionStatus.Complete;
      });
      log(`\nRemaining children for ${parent.id}: ${remaining.join(', ')}`);
    }
  }

  // Show what's now ready
  const ready = getReadySessions(manifest);
  if (ready.length > 0) {
    log(`\nNewly ready sessions:`);
    for (const s of ready) {
      log(`  ${s.id} — ${s.title}`);
    }
  }
}

/**
 * Generate a combined context pack from all children's packs.
 */
async function generateCombinedContextPack(
  parent: import('./types.js').Session,
  manifest: Manifest
): Promise<void> {
  if (!parent.context_pack_file) return;

  const parts: string[] = [];
  for (const childId of parent.splinter_children) {
    const child = getSession(manifest, childId);
    if (child.context_pack_file && fileExists(child.context_pack_file)) {
      const content = await import('./utils.js').then(u => u.readFile(child.context_pack_file!));
      parts.push(`# ${child.id}: ${child.title}\n\n${content}`);
    }
  }

  const combined = parts.join('\n\n---\n\n');
  const { writeFile: wf } = await import('./utils.js');
  await wf(parent.context_pack_file, combined);
  success(`Combined context pack written to ${parent.context_pack_file}`);
}

// ─── compress ─────────────────────────────────────────────────────────────────

async function cmdCompress(sessionId: string | undefined, manifest: Manifest): Promise<void> {
  if (!sessionId) {
    logError('Usage: npm run research -- compress <session_id>');
    process.exit(1);
  }

  const session = getSession(manifest, sessionId);

  if (session.status !== SessionStatus.Complete) {
    throw new Error(`Session ${sessionId} is not complete (status: ${session.status})`);
  }
  if (!session.output_file) {
    throw new Error(`Session ${sessionId} has no output_file`);
  }
  if (!session.context_pack_file) {
    throw new Error(`Session ${sessionId} has no context_pack_file`);
  }

  await generateContextPack(session, manifest);
}

// ─── splinter ─────────────────────────────────────────────────────────────────

async function cmdSplinter(sessionId: string | undefined, manifest: Manifest): Promise<void> {
  if (!sessionId) {
    logError('Usage: npm run research -- splinter <session_id>');
    process.exit(1);
  }

  const session = getSession(manifest, sessionId);
  log(`Analyzing session ${sessionId} for splintering...\n`);

  const proposals = await proposeSplinter(sessionId, manifest);
  displayProposal(sessionId, proposals);

  // Auto-apply (in a real CLI, you'd prompt for confirmation)
  log('Applying splintering plan...\n');
  await applySplinter(sessionId, proposals, manifest);
}

// ─── validate ─────────────────────────────────────────────────────────────────

async function cmdValidate(manifest: Manifest): Promise<void> {
  await validateAllContextPacks(manifest);
}

// ─── cost ─────────────────────────────────────────────────────────────────────

async function cmdCost(manifest: Manifest): Promise<void> {
  log('Cedar Research Orchestrator — Cost Estimate\n');

  // Model pricing (per million tokens)
  const pricing: Record<string, { input: number; output: number }> = {
    'claude-opus-4-20250514': { input: 15, output: 75 },
    'claude-haiku-4-5-20251001': { input: 1, output: 5 },
  };

  const planned = manifest.sessions.filter(
    s => s.status === SessionStatus.Planned || s.status === SessionStatus.Blocked
  );

  if (planned.length === 0) {
    log('No planned or blocked sessions remaining.');
    return;
  }

  let totalCost = 0;
  let batchEligible = 0;

  log(`Remaining sessions (${planned.length}):\n`);

  for (const session of planned) {
    const model = session.model ?? manifest.meta.synthesis_model;
    const price = pricing[model] ?? pricing['claude-opus-4-20250514'];
    const estimatedInput = session.metadata?.estimated_tokens ?? 30000;
    const estimatedOutput = session.max_output_tokens ?? manifest.meta.default_max_output_tokens;

    const inputCost = (estimatedInput / 1_000_000) * price.input;
    const outputCost = (estimatedOutput / 1_000_000) * price.output;
    const sessionCost = inputCost + outputCost;
    totalCost += sessionCost;

    if (session.execution_route === 'api') batchEligible++;

    log(`  ${session.id} [${session.execution_route.toUpperCase()}] — $${sessionCost.toFixed(2)}`);
  }

  log(`\nEstimated total: $${totalCost.toFixed(2)}`);
  if (batchEligible > 0) {
    log(`With Batch API (${batchEligible} API sessions at 50% off): ~$${(totalCost * 0.7).toFixed(2)}`);
  }

  // Add compression costs
  const completedNeedingPacks = manifest.sessions.filter(
    s => s.status === SessionStatus.Complete && s.context_pack_file && !fileExists(s.context_pack_file)
  );
  if (completedNeedingPacks.length > 0) {
    log(`\nCompression (${completedNeedingPacks.length} sessions × ~$0.02): ~$${(completedNeedingPacks.length * 0.02).toFixed(2)}`);
  }
}

// ─── main ─────────────────────────────────────────────────────────────────────

main().catch(err => {
  logError(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
