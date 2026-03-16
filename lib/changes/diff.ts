// Module 5: Diff generation between normalized content versions

import { createPatch, diffWords } from 'diff'

/**
 * Generate a unified diff between old and new normalized content.
 * Returns null if content is identical.
 * Used for: storing in changes.diff, sending to AI agents as context
 */
export function generateDiff(before: string, after: string): string | null {
  if (before === after) return null

  const patch = createPatch(
    'content',
    before,
    after,
    'previous',
    'current',
    { context: 3 }
  )

  // createPatch always returns something — return null if there are no real changes
  const hasChanges = patch.includes('\n+') || patch.includes('\n-')
  return hasChanges ? patch : null
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
