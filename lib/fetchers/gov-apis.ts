// Module 3: Government API fetchers — no auth required, free public APIs
// Handles: Federal Register API, eCFR versioner API, openFDA enforcement API

const USER_AGENT = 'Cedar Regulatory Intelligence / contact@cedarintel.io'
const FETCH_TIMEOUT_MS = 15_000

// ── Federal Register API ──────────────────────────────────────────────────

export interface FederalRegisterParams {
  agencies?: string[]     // e.g. ['food-and-drug-administration', 'drug-enforcement-administration']
  perPage?: number        // max 1000
  order?: 'newest' | 'oldest' | 'relevance'
  conditions?: {
    term?: string         // full-text search
    type?: string[]       // e.g. ['RULE', 'PROPOSED_RULE', 'NOTICE']
    publicationDateGte?: string // YYYY-MM-DD
  }
}

/**
 * Fetch recent articles from the Federal Register API.
 * Returns the raw JSON response as a string for normalization + hashing.
 * Docs: https://www.federalregister.gov/developers/api/v1
 */
export async function fetchFederalRegister(params: FederalRegisterParams = {}): Promise<string> {
  const url = new URL('https://api.federalregister.gov/v1/articles.json')

  if (params.agencies?.length) {
    params.agencies.forEach(a => url.searchParams.append('agencies[]', a))
  }
  url.searchParams.set('per_page', String(params.perPage ?? 20))
  url.searchParams.set('order', params.order ?? 'newest')
  url.searchParams.set('fields[]', 'document_number')
  url.searchParams.append('fields[]', 'title')
  url.searchParams.append('fields[]', 'abstract')
  url.searchParams.append('fields[]', 'action')
  url.searchParams.append('fields[]', 'agencies')
  url.searchParams.append('fields[]', 'publication_date')
  url.searchParams.append('fields[]', 'effective_on')
  url.searchParams.append('fields[]', 'html_url')
  url.searchParams.append('fields[]', 'type')
  url.searchParams.append('fields[]', 'citation')

  if (params.conditions?.type?.length) {
    params.conditions.type.forEach(t => url.searchParams.append('conditions[type][]', t))
  }
  if (params.conditions?.term) {
    url.searchParams.set('conditions[term]', params.conditions.term)
  }
  if (params.conditions?.publicationDateGte) {
    url.searchParams.set('conditions[publication_date][gte]', params.conditions.publicationDateGte)
  }

  const res = await fetchWithTimeout(url.toString())
  if (!res.ok) {
    throw new Error(`Federal Register API error: ${res.status} ${res.statusText}`)
  }
  return res.text()
}

// ── eCFR API ──────────────────────────────────────────────────────────────

/**
 * Fetch the version history for a given CFR title from the eCFR versioner API.
 * Used to detect when Title 21 (Food & Drugs) receives an update.
 * Docs: https://www.ecfr.gov/developers/documentation/api/v1
 */
export async function fetchECFRVersions(titleNumber: number): Promise<string> {
  const url = `https://www.ecfr.gov/api/versioner/v1/versions/title-${titleNumber}.json`
  const res = await fetchWithTimeout(url)
  if (!res.ok) {
    throw new Error(`eCFR API error: ${res.status} ${res.statusText}`)
  }
  return res.text()
}

/**
 * Fetch a specific CFR title/part from the eCFR full-text API.
 * Use this to get the actual regulation text after detecting a version change.
 */
export async function fetchECFRPart(titleNumber: number, part: string): Promise<string> {
  const url = `https://www.ecfr.gov/api/versioner/v1/full/${new Date().toISOString().split('T')[0]}/title-${titleNumber}.json?part=${part}`
  const res = await fetchWithTimeout(url)
  if (!res.ok) {
    throw new Error(`eCFR part fetch error: ${res.status} ${res.statusText}`)
  }
  return res.text()
}

// ── openFDA API ───────────────────────────────────────────────────────────

export interface OpenFDAParams {
  endpoint: 'drug/enforcement' | 'drug/event' | 'device/recall'
  search?: string    // openFDA search syntax, e.g. 'status:Ongoing'
  limit?: number     // max 1000
  sort?: string      // e.g. 'report_date:desc'
  skip?: number
}

/**
 * Fetch from the openFDA API.
 * Returns raw JSON response as a string.
 * Docs: https://open.fda.gov/apis/
 */
export async function fetchOpenFDA(params: OpenFDAParams): Promise<string> {
  const url = new URL(`https://api.fda.gov/${params.endpoint}.json`)

  if (params.search) url.searchParams.set('search', params.search)
  if (params.limit) url.searchParams.set('limit', String(params.limit))
  if (params.sort) url.searchParams.set('sort', params.sort)
  if (params.skip) url.searchParams.set('skip', String(params.skip))

  const res = await fetchWithTimeout(url.toString())

  // openFDA returns 404 when no results — treat as empty, not error
  if (res.status === 404) return JSON.stringify({ results: [], meta: { results: { total: 0 } } })
  if (!res.ok) {
    throw new Error(`openFDA API error: ${res.status} ${res.statusText}`)
  }
  return res.text()
}

// ── Shared helpers ────────────────────────────────────────────────────────

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    return await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timer)
  }
}
