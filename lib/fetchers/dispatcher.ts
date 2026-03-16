// Module 3: Source Fetching — Auto-escalating dispatcher
// Fetch order: Gov API → Oxylabs → BrowserBase (escalation on failure)

import type { Database } from '../db/types'
import { fetchFederalRegister, fetchECFRVersions, fetchOpenFDA } from './gov-apis'
import { normalizeContent } from '../processing/normalize'

type Source = Database['public']['Tables']['sources']['Row']
type ScrapeConfig = Record<string, unknown>

export interface FetchResult {
  sourceId: string
  sourceUrlId: string
  url: string
  content: string        // normalized, hashable content
  rawContent: string     // raw response for storage
  fetchedAt: string
  fetchMethod: 'gov_api' | 'oxylabs' | 'browserbase'
  mimeType: string
}

/**
 * Dispatch a fetch to the appropriate fetcher based on source.fetch_method.
 * Gov API sources are handled directly.
 * Oxylabs sources fall back to BrowserBase if Oxylabs fails or key is unavailable.
 */
export async function dispatchFetch(
  source: Source,
  url: string,
  sourceUrlId: string
): Promise<FetchResult> {
  const config = (source.scrape_config ?? {}) as ScrapeConfig
  const fetchedAt = new Date().toISOString()

  if (source.fetch_method === 'gov_api') {
    const { raw, mimeType } = await fetchGovApi(source.name, url, config)
    return {
      sourceId: source.id,
      sourceUrlId,
      url,
      rawContent: raw,
      content: normalizeContent(raw, mimeType),
      fetchedAt,
      fetchMethod: 'gov_api',
      mimeType,
    }
  }

  if (source.fetch_method === 'oxylabs') {
    // Oxylabs not yet implemented — stub with error until key is configured
    throw new Error(
      `Oxylabs fetcher not yet implemented. Source "${source.name}" requires Oxylabs. ` +
      `Set OXYLABS_USERNAME and OXYLABS_PASSWORD in .env.local.`
    )
  }

  if (source.fetch_method === 'browserbase') {
    throw new Error(
      `BrowserBase fetcher not yet implemented. Source "${source.name}" requires BrowserBase. ` +
      `Set BROWSERBASE_API_KEY in .env.local.`
    )
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
        // Only fetch last 30 days to keep payload manageable
        publicationDateGte: thirtyDaysAgo(),
        type: ['RULE', 'PROPOSED_RULE', 'NOTICE'],
      },
    })
    return { raw, mimeType: 'application/json' }
  }

  // eCFR
  if (apiType === 'ecfr' || url.includes('ecfr.gov')) {
    // Check version history for Title 21
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

function thirtyDaysAgo(): string {
  const d = new Date()
  d.setDate(d.getDate() - 30)
  return d.toISOString().split('T')[0]
}
