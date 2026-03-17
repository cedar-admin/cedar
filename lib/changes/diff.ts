// Module 5: Diff generation between normalized content versions

import { diffLines, diffWords } from 'diff'

/**
 * A single block in a structured diff.
 * Stored as JSONB in changes.normalized_diff for red/green UI rendering.
 */
export type DiffBlock = {
  type: 'added' | 'removed' | 'unchanged'
  content: string
}

/**
 * Generate a structured diff between old and new normalized content.
 * Returns an array of DiffBlock objects, or null if content is identical.
 * Stored in changes.normalized_diff as JSONB.
 */
export function generateStructuredDiff(before: string, after: string): DiffBlock[] | null {
  if (before === after) return null

  const parts = diffLines(before, after)
  const blocks: DiffBlock[] = parts.map(part => ({
    type: part.added ? 'added' : part.removed ? 'removed' : 'unchanged',
    content: part.value.replace(/\n$/, ''),
  }))

  const hasRealChange = blocks.some(b => b.type !== 'unchanged')
  return hasRealChange ? blocks : null
}

/**
 * Generate a word-level diff summary for display in the dashboard.
 * Returns an array of { value, added?, removed? } parts.
 */
export function generateWordDiff(before: string, after: string) {
  return diffWords(before, after)
}

/**
 * Estimate the magnitude of a change as a ratio of changed words.
 * Used to filter out trivial changes (e.g. a single date update).
 * Returns 0.0 (no change) to 1.0 (completely different).
 */
export function changeMagnitude(before: string, after: string): number {
  if (before === after) return 0
  if (!before || !after) return 1

  const parts = diffWords(before, after)
  const totalWords = parts.reduce((sum, part) => sum + part.value.split(/\s+/).length, 0)
  const changedWords = parts
    .filter(p => p.added || p.removed)
    .reduce((sum, part) => sum + part.value.split(/\s+/).length, 0)

  return totalWords > 0 ? changedWords / totalWords : 0
}
