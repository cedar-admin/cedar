// Cedar Research Orchestrator — DAG operations (Kahn's algorithm)

import { SessionStatus } from './types.js';
import type { Manifest, Session } from './types.js';
import { buildSessionMap } from './manifest.js';
import { fileExists } from './utils.js';

/**
 * Topological sort using Kahn's algorithm.
 * Returns sessions in dependency order, or throws on cycle detection.
 */
export function topologicalSort(manifest: Manifest): Session[] {
  const sessionMap = buildSessionMap(manifest);
  const inDegree = new Map<string, number>();
  const adjacency = new Map<string, string[]>();

  // Initialize
  for (const session of manifest.sessions) {
    inDegree.set(session.id, 0);
    adjacency.set(session.id, []);
  }

  // Build edges: dependency → dependent
  for (const session of manifest.sessions) {
    for (const depId of session.dependencies) {
      if (!sessionMap.has(depId)) continue; // skip missing deps
      adjacency.get(depId)!.push(session.id);
      inDegree.set(session.id, (inDegree.get(session.id) ?? 0) + 1);
    }
  }

  // Seed the queue with nodes that have zero in-degree
  const queue: string[] = [];
  for (const [id, degree] of inDegree) {
    if (degree === 0) queue.push(id);
  }

  const sorted: Session[] = [];
  while (queue.length > 0) {
    const id = queue.shift()!;
    sorted.push(sessionMap.get(id)!);

    for (const neighbor of adjacency.get(id) ?? []) {
      const newDegree = (inDegree.get(neighbor) ?? 1) - 1;
      inDegree.set(neighbor, newDegree);
      if (newDegree === 0) queue.push(neighbor);
    }
  }

  if (sorted.length !== manifest.sessions.length) {
    const remaining = manifest.sessions
      .filter(s => !sorted.find(r => r.id === s.id))
      .map(s => s.id);
    throw new Error(`Cycle detected in DAG. Sessions involved: ${remaining.join(', ')}`);
  }

  return sorted;
}

/**
 * Check if a dependency is satisfied:
 * - complete → always satisfied
 * - splintered → satisfied if all children are complete and have output files
 */
function isDependencySatisfied(dep: Session, manifest: Manifest): boolean {
  if (dep.status === SessionStatus.Complete) return true;
  if (dep.status === SessionStatus.Splintered) {
    const sessionMap = buildSessionMap(manifest);
    return dep.splinter_children.every(childId => {
      const child = sessionMap.get(childId);
      return child?.status === SessionStatus.Complete &&
             child.output_file != null && fileExists(child.output_file);
    });
  }
  return false;
}

/**
 * Compute which sessions are "ready" to run:
 * status === planned AND all dependencies satisfied
 */
export function getReadySessions(manifest: Manifest): Session[] {
  const sessionMap = buildSessionMap(manifest);

  return manifest.sessions.filter(session => {
    if (session.status !== SessionStatus.Planned) return false;

    return session.dependencies.every(depId => {
      const dep = sessionMap.get(depId);
      if (!dep) return false;
      return isDependencySatisfied(dep, manifest);
    });
  });
}

/**
 * Check if all dependencies for a session are met.
 * Returns { met: boolean, unmet: string[] }
 */
export function checkDependencies(
  manifest: Manifest,
  sessionId: string
): { met: boolean; unmet: string[] } {
  const sessionMap = buildSessionMap(manifest);
  const session = sessionMap.get(sessionId);
  if (!session) return { met: false, unmet: [`Session ${sessionId} not found`] };

  const unmet: string[] = [];
  for (const depId of session.dependencies) {
    const dep = sessionMap.get(depId);
    if (!dep) {
      unmet.push(`${depId} (not found)`);
      continue;
    }
    if (!isDependencySatisfied(dep, manifest)) {
      unmet.push(`${depId} (status: ${dep.status})`);
    }
  }

  return { met: unmet.length === 0, unmet };
}

/**
 * Compute the critical path — longest chain of incomplete sessions to terminal nodes.
 */
export function getCriticalPath(manifest: Manifest): string[] {
  const sessionMap = buildSessionMap(manifest);
  const memo = new Map<string, string[]>();

  function longestPath(id: string): string[] {
    if (memo.has(id)) return memo.get(id)!;

    const session = sessionMap.get(id);
    if (!session) return [];

    // If already done, it contributes nothing to the critical path
    if (session.status === SessionStatus.Complete ||
        (session.status === SessionStatus.Splintered &&
         isDependencySatisfied(session, manifest))) {
      memo.set(id, []);
      return [];
    }

    // Find the longest path through dependencies
    let longest: string[] = [];
    for (const depId of session.dependencies) {
      const depPath = longestPath(depId);
      if (depPath.length > longest.length) {
        longest = depPath;
      }
    }

    const path = [...longest, id];
    memo.set(id, path);
    return path;
  }

  // Find terminal nodes (sessions that nothing else depends on)
  const depTargets = new Set<string>();
  for (const s of manifest.sessions) {
    for (const d of s.dependencies) depTargets.add(d);
  }
  const terminals = manifest.sessions.filter(s => !depTargets.has(s.id));

  let criticalPath: string[] = [];
  for (const terminal of terminals) {
    const path = longestPath(terminal.id);
    if (path.length > criticalPath.length) {
      criticalPath = path;
    }
  }

  return criticalPath;
}

/**
 * Get status counts for display
 */
export function getStatusCounts(manifest: Manifest): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const session of manifest.sessions) {
    counts[session.status] = (counts[session.status] ?? 0) + 1;
  }
  // Add computed "ready" count
  counts['ready'] = getReadySessions(manifest).length;
  return counts;
}
