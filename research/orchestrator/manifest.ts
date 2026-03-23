// Cedar Research Orchestrator — Manifest read/write/validate

import yaml from 'js-yaml';
import { openSync, closeSync, unlinkSync } from 'node:fs';
import { readFile, writeFile, resolveFromRoot } from './utils.js';
import type { Manifest, Session, SessionStatus } from './types.js';

const MANIFEST_PATH = 'research/manifest.yaml';
const LOCK_PATH = 'research/manifest.lock';

async function acquireLock(timeoutMs = 15000): Promise<void> {
  const lockPath = resolveFromRoot(LOCK_PATH);
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      // O_EXCL + O_CREAT is atomic — fails if file already exists
      const fd = openSync(lockPath, 'wx');
      closeSync(fd);
      return;
    } catch {
      await new Promise(r => setTimeout(r, 50 + Math.random() * 100));
    }
  }
  throw new Error('Could not acquire manifest lock after 15s — stale lock file?');
}

function releaseLock(): void {
  try { unlinkSync(resolveFromRoot(LOCK_PATH)); } catch {}
}

/**
 * Read-modify-write the manifest under an exclusive file lock.
 * The updater receives a freshly loaded manifest and mutates it in place.
 * Always use this instead of bare saveManifest() when running parallel sessions.
 */
export async function updateManifest(updater: (manifest: Manifest) => void): Promise<Manifest> {
  await acquireLock();
  try {
    const manifest = await loadManifest();
    updater(manifest);
    await saveManifest(manifest);
    return manifest;
  } finally {
    releaseLock();
  }
}

/** Load and parse the manifest */
export async function loadManifest(): Promise<Manifest> {
  const content = await readFile(MANIFEST_PATH);
  const raw = yaml.load(content) as Manifest;

  // Normalize sessions — ensure arrays default to []
  for (const session of raw.sessions) {
    session.dependencies ??= [];
    session.context_inputs ??= [];
    session.splinter_children ??= [];
    session.prefetch ??= [];
  }

  return raw;
}

/** Save the manifest back to YAML */
export async function saveManifest(manifest: Manifest): Promise<void> {
  const content = yaml.dump(manifest, {
    lineWidth: 120,
    noRefs: true,
    sortKeys: false,
    quotingType: '"',
    forceQuotes: false,
  });
  await writeFile(MANIFEST_PATH, content);
}

/** Find a session by ID */
export function findSession(manifest: Manifest, id: string): Session | undefined {
  return manifest.sessions.find(s => s.id === id);
}

/** Find a session by ID, throwing if not found */
export function getSession(manifest: Manifest, id: string): Session {
  const session = findSession(manifest, id);
  if (!session) {
    throw new Error(`Session "${id}" not found in manifest`);
  }
  return session;
}

/** Update a session's status */
export function updateSessionStatus(
  manifest: Manifest,
  id: string,
  status: SessionStatus
): void {
  const session = getSession(manifest, id);
  session.status = status;
}

/** Get all sessions with a given status */
export function getSessionsByStatus(manifest: Manifest, status: SessionStatus): Session[] {
  return manifest.sessions.filter(s => s.status === status);
}

/** Build a map of session ID → Session for fast lookup */
export function buildSessionMap(manifest: Manifest): Map<string, Session> {
  const map = new Map<string, Session>();
  for (const session of manifest.sessions) {
    map.set(session.id, session);
  }
  return map;
}
