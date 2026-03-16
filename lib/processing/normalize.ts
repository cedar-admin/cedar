// Module 3/5: Content normalization
// Converts raw fetched content (HTML, JSON, plain text) into a stable,
// hashable string by removing dynamic noise (timestamps, CSRF tokens, etc.)

import { parse } from 'node-html-parser'

/**
 * Normalize raw fetched content into a stable string suitable for SHA-256 hashing.
 *
 * For HTML: strips tags, collapses whitespace, removes known dynamic elements
 * For JSON: deterministic re-serialization with sorted keys
 * For plain text: whitespace normalization only
 */
export function normalizeContent(raw: string, mimeType = 'text/html'): string {
  if (!raw || raw.trim().length === 0) return ''

  if (mimeType.includes('json') || isLikelyJson(raw)) {
    return normalizeJson(raw)
  }

  if (mimeType.includes('html') || isLikelyHtml(raw)) {
    return normalizeHtml(raw)
  }

  return normalizeText(raw)
}

// ── HTML normalization ────────────────────────────────────────────────────

function normalizeHtml(html: string): string {
  const root = parse(html)

  // Remove elements that are always dynamic and never contain regulatory content
  const NOISE_SELECTORS = [
    'script', 'style', 'noscript', 'iframe',
    'nav', 'header', 'footer',
    '[class*="cookie"]', '[class*="banner"]', '[class*="popup"]',
    '[class*="nav"]', '[class*="menu"]', '[id*="nav"]', '[id*="menu"]',
    'meta', 'link',
  ]

  for (const selector of NOISE_SELECTORS) {
    try {
      root.querySelectorAll(selector).forEach(el => el.remove())
    } catch {
      // Ignore invalid selector errors from node-html-parser
    }
  }

  return normalizeText(root.text)
}

// ── JSON normalization ────────────────────────────────────────────────────

function normalizeJson(json: string): string {
  try {
    const parsed = JSON.parse(json)
    return JSON.stringify(parsed, sortedReplacer)
  } catch {
    return normalizeText(json)
  }
}

function sortedReplacer(_key: string, value: unknown): unknown {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b))
    )
  }
  return value
}

// ── Text normalization ────────────────────────────────────────────────────

export function normalizeText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/last (updated|modified|checked):?\s*[\w,\s:/-]+/gi, '')
    .replace(/\d{1,2}\/\d{1,2}\/\d{2,4}/g, '')
    .replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[Z\d+:-]*/g, '')
    .replace(/csrf[_-]?token[:\s=]+[\w-]+/gi, '')
    .replace(/session[_-]?id[:\s=]+[\w-]+/gi, '')
    .trim()
}

// ── Helpers ───────────────────────────────────────────────────────────────

function isLikelyJson(content: string): boolean {
  const trimmed = content.trim()
  return (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
         (trimmed.startsWith('[') && trimmed.endsWith(']'))
}

function isLikelyHtml(content: string): boolean {
  return content.includes('<html') || content.includes('<body') ||
         content.includes('<div') || content.includes('<p>')
}
