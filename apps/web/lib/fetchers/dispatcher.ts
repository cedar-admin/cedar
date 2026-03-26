// Module 3: Source Fetching — Auto-escalating dispatcher
// Fetch order: Gov API (direct) | Oxylabs → BrowserBase (on failure or missing creds)
//
// ESCALATION RULES
// ─────────────────────────────────────────────────────────────────────────────
// 1. gov_api sources → always fetch directly, no escalation needed
// 2. oxylabs sources → try Oxylabs first; if creds missing OR request fails,
//    escalate to BrowserBase and log the attempt
// 3. preferredMethod overrides the source's configured method — used when
//    monitor.ts passes the last successfully-used method from source_urls.last_fetch_method
//    (avoids re-trying a method that already failed on a previous run)
// ─────────────────────────────────────────────────────────────────────────────

import type { Database } from '../db/types'
import { fetchFederalRegister, fetchECFRVersions, fetchOpenFDA } from './gov-apis'
import { fetchViaOxylabs } from './oxylabs'
import { fetchViaBrowserBase } from './browserbase'
import { normalizeContent } from '../processing/normalize'
import { trackCost } from '../cost-tracker'

type Source = Database['public']['Tables']['sources']['Row']
type FetchMethod = 'gov_api' | 'oxylabs' | 'browserbase'
type ScrapeConfig = Record<string, unknown>

export interface FetchResult {
  sourceId: string
  sourceUrlId: string
  url: string
  content: string      // normalized, hashable content (full, before monitor.ts truncates)
  fetchedAt: string
  fetchMethod: FetchMethod  // actual method used (may differ from source.fetch_method after escalation)
  mimeType: string
  escalated: boolean   // true if escalation occurred (e.g. oxylabs → browserbase)
  escalationReason?: string
}

export interface DispatchOptions {
  /**
   * Override the source's configured fetch_method.
   * Pass source_url.last_fetch_method to skip directly to the last-known-working method,
   * avoiding wasted retries against a method that already failed.
   */
  preferredMethod?: FetchMethod
}

/**
 * Dispatch a fetch to the appropriate fetcher based on source.fetch_method
 * (or preferredMethod override). Handles escalation automatically.
 *
 * Called inside an Inngest step — DB access and async work are safe.
 */
export async function dispatchFetch(
  source: Source,
  url: string,
  sourceUrlId: string,
  options: DispatchOptions = {}
): Promise<FetchResult> {
  const fetchedAt = new Date().toISOString()
  const config = (source.scrape_config ?? {}) as ScrapeConfig

  // Determine starting method. preferredMethod wins over configured method.
  const startMethod = options.preferredMethod ?? source.fetch_method as FetchMethod

  // ── Gov API ───────────────────────────────────────────────────────────────
  if (startMethod === 'gov_api' || source.fetch_method === 'gov_api') {
    const { raw, mimeType } = await fetchGovApi(source.name, url, config)
    const content = normalizeContent(raw, mimeType)

    await trackCost({
      service: 'gov_api',
      operation: `fetch:${source.name}`,
      cost_usd: 0, // public APIs are free
      context: { sourceId: source.id, sourceUrlId, url, method: 'gov_api' },
    })

    return {
      sourceId: source.id,
      sourceUrlId,
      url,
      content,
      fetchedAt,
      fetchMethod: 'gov_api',
      mimeType,
      escalated: false,
    }
  }

  // ── Oxylabs (with BrowserBase escalation) ────────────────────────────────
  if (startMethod === 'oxylabs') {
    // Try Oxylabs first
    const oxylabsResult = await tryOxylabs(source, url, sourceUrlId, config, fetchedAt)
    if (oxylabsResult.success) return oxylabsResult.result!

    // Oxylabs failed — escalate to BrowserBase
    console.warn(
      `[dispatcher] Oxylabs failed for "${source.name}" — escalating to BrowserBase. ` +
      `Reason: ${oxylabsResult.reason}`
    )
    const browsResult = await tryBrowserBase(source, url, sourceUrlId, config, fetchedAt)
    if (browsResult.success) {
      return {
        ...browsResult.result!,
        escalated: true,
        escalationReason: `oxylabs_failed: ${oxylabsResult.reason}`,
      }
    }

    // Both failed
    throw new Error(
      `All fetch methods failed for "${source.name}". ` +
      `Oxylabs: ${oxylabsResult.reason}. BrowserBase: ${browsResult.reason}`
    )
  }

  // ── BrowserBase direct ───────────────────────────────────────────────────
  if (startMethod === 'browserbase') {
    const browsResult = await tryBrowserBase(source, url, sourceUrlId, config, fetchedAt)
    if (browsResult.success) return browsResult.result!
    throw new Error(`BrowserBase fetch failed for "${source.name}": ${browsResult.reason}`)
  }

  throw new Error(`Unknown fetch_method: ${source.fetch_method}`)
}

// ── Gov API routing ───────────────────────────────────────────────────────

async function fetchGovApi(
  sourceName: string,
  url: string,
  config: ScrapeConfig
): Promise<{ raw: string; mimeType: string }> {
  const apiType = config.api_type as string | undefined

  // Federal Register
  if (apiType === 'federal_register' || url.includes('federalregister.gov')) {
    const queryParams = (config.query_params ?? {}) as Record<string, unknown>
    const agencies = queryParams['agencies[]'] as string[] | undefined
    const raw = await fetchFederalRegister({
      agencies,
      perPage: (queryParams.per_page as number) ?? 20,
      order: (queryParams.order as 'newest') ?? 'newest',
      conditions: {
        publicationDateGte: thirtyDaysAgo(),
        type: ['RULE', 'PROPOSED_RULE', 'NOTICE'],
      },
    })
    return { raw, mimeType: 'application/json' }
  }

  // eCFR
  if (apiType === 'ecfr' || url.includes('ecfr.gov')) {
    const raw = await fetchECFRVersions(21)
    return { raw, mimeType: 'application/json' }
  }

  // openFDA
  if (apiType === 'openfda' || url.includes('api.fda.gov')) {
    const queryParams = (config.query_params ?? {}) as Record<string, unknown>
    const raw = await fetchOpenFDA({
      endpoint: 'drug/enforcement',
      search: (queryParams.search as string) ?? 'status:Ongoing',
      limit: (queryParams.limit as number) ?? 50,
      sort: (queryParams.sort as string) ?? 'report_date:desc',
    })
    return { raw, mimeType: 'application/json' }
  }

  throw new Error(`No gov_api handler matched for source "${sourceName}" (url: ${url})`)
}

// ── Attempt helpers ───────────────────────────────────────────────────────

type AttemptResult =
  | { success: true; result: FetchResult }
  | { success: false; reason: string }

async function tryOxylabs(
  source: Source,
  url: string,
  sourceUrlId: string,
  config: ScrapeConfig,
  fetchedAt: string
): Promise<AttemptResult> {
  // Guard: credentials not configured
  if (!process.env.OXYLABS_USERNAME || !process.env.OXYLABS_PASSWORD) {
    return {
      success: false,
      reason: 'OXYLABS_USERNAME/OXYLABS_PASSWORD not set — credentials required',
    }
  }

  try {
    const selector = config.selector as string | undefined
    const raw = await fetchViaOxylabs(url, { selector })
    const mimeType = 'text/html'
    const content = normalizeContent(raw, mimeType)

    await trackCost({
      service: 'oxylabs',
      operation: `fetch:${source.name}`,
      cost_usd: 0.002, // ~$2 per 1000 requests — approximate
      context: { sourceId: source.id, sourceUrlId, url },
    })

    return {
      success: true,
      result: {
        sourceId: source.id,
        sourceUrlId,
        url,
        content,
        fetchedAt,
        fetchMethod: 'oxylabs',
        mimeType,
        escalated: false,
      },
    }
  } catch (err) {
    return {
      success: false,
      reason: err instanceof Error ? err.message : String(err),
    }
  }
}

async function tryBrowserBase(
  source: Source,
  url: string,
  sourceUrlId: string,
  config: ScrapeConfig,
  fetchedAt: string
): Promise<AttemptResult> {
  // Guard: credentials not configured
  if (!process.env.BROWSERBASE_API_KEY) {
    return {
      success: false,
      reason: 'BROWSERBASE_API_KEY not set — credentials required',
    }
  }

  try {
    const selector = config.selector as string | undefined
    const raw = await fetchViaBrowserBase(url, { selector })
    const mimeType = 'text/html'
    const content = normalizeContent(raw, mimeType)

    await trackCost({
      service: 'browserbase',
      operation: `fetch:${source.name}`,
      cost_usd: 0.010, // ~$10 per 1000 sessions — approximate
      context: { sourceId: source.id, sourceUrlId, url },
    })

    return {
      success: true,
      result: {
        sourceId: source.id,
        sourceUrlId,
        url,
        content,
        fetchedAt,
        fetchMethod: 'browserbase',
        mimeType,
        escalated: false,
      },
    }
  } catch (err) {
    return {
      success: false,
      reason: err instanceof Error ? err.message : String(err),
    }
  }
}

function thirtyDaysAgo(): string {
  const d = new Date()
  d.setDate(d.getDate() - 30)
  return d.toISOString().split('T')[0]
}
