// Module 5: SHA-256 hashing and hash chain computation
// Built in Phase: MVP (Months 0-2)

import { createHash } from 'crypto'

/**
 * Compute SHA-256 hash of normalized content.
 * Used to detect changes between monitoring runs.
 */
export function hashContent(content: string): string {
  return createHash('sha256').update(content, 'utf8').digest('hex')
}

/**
 * Compute the chain hash for a new change record.
 * Links this change to the previous hash to form a tamper-evident chain.
 * chain_hash = SHA-256(previous_chain_hash + current_hash)
 */
export function computeChainHash(previousChainHash: string | null, currentHash: string): string {
  const input = (previousChainHash ?? '') + currentHash
  return createHash('sha256').update(input, 'utf8').digest('hex')
}

/**
 * Check whether content has changed by comparing to the last known hash.
 */
export function hasChanged(currentContent: string, lastHash: string | null): boolean {
  if (!lastHash) return true // First fetch — always treated as a change
  return hashContent(currentContent) !== lastHash
}
