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
  const url = new URL('https://www.federalregister.gov/api/v1/documents')

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

// ── Corpus bulk fetch functions ───────────────────────────────────────────

/**
 * Fetch the latest available date for a CFR title from the eCFR titles endpoint.
 * The eCFR versioner lags 1-3 days behind the current date — using today fails.
 */
async function getECFRLatestDate(titleNumber: number): Promise<string> {
  const res = await fetchWithTimeout('https://www.ecfr.gov/api/versioner/v1/titles.json')
  if (!res.ok) {
    // Fall back to 3 days ago if the titles endpoint fails
    const d = new Date()
    d.setDate(d.getDate() - 3)
    return d.toISOString().split('T')[0]
  }
  const data = await res.json() as { titles: Array<{ number: number; up_to_date_as_of: string }> }
  const title = data.titles?.find(t => t.number === titleNumber)
  if (title?.up_to_date_as_of) return title.up_to_date_as_of
  // Fall back to 3 days ago
  const d = new Date()
  d.setDate(d.getDate() - 3)
  return d.toISOString().split('T')[0]
}

/**
 * Fetch the full structural hierarchy of a CFR title from the eCFR versioner API.
 * Returns raw JSON — the hierarchy of chapters, parts, subparts, and sections
 * WITHOUT full text (wide-and-shallow pass for corpus seeding).
 */
export async function fetchECFRStructure(titleNumber: number): Promise<string> {
  const date = await getECFRLatestDate(titleNumber)
  const url = `https://www.ecfr.gov/api/versioner/v1/structure/${date}/title-${titleNumber}.json`
  const res = await fetchWithTimeout(url)
  if (!res.ok) {
    throw new Error(`eCFR structure error: ${res.status} ${res.statusText}`)
  }
  return res.text()
}

export interface ECFRTitleInfo {
  number:            number
  name:              string
  latest_amended_on: string   // YYYY-MM-DD — last actual text amendment
  up_to_date_as_of:  string   // YYYY-MM-DD — safe date for content fetch
}

/**
 * Fetch all eCFR titles metadata including latest_amended_on.
 * Used by ecfr-daily-check to determine which titles changed since last poll.
 * Endpoint: https://www.ecfr.gov/api/versioner/v1/titles.json
 */
export async function fetchECFRTitles(): Promise<ECFRTitleInfo[]> {
  const res = await fetchWithTimeout('https://www.ecfr.gov/api/versioner/v1/titles.json')
  if (!res.ok) throw new Error(`eCFR titles error: ${res.status} ${res.statusText}`)
  const data = await res.json() as { titles: ECFRTitleInfo[] }
  return data.titles ?? []
}

export interface FederalRegisterSearchParams {
  agencies: string[]
  types: string[]       // ['RULE', 'PROPOSED_RULE', 'NOTICE']
  dateGte: string       // YYYY-MM-DD
  dateLte: string       // YYYY-MM-DD
  cfrTitles?: number[]  // e.g. [21, 29, 42, 45] — filters by CFR title
  perPage?: number      // max 1000
  page?: number
  fields: string[]
}

/**
 * Paginated Federal Register search for bulk corpus ingestion.
 * Supports full date-range filtering and field selection.
 */
export async function searchFederalRegister(params: FederalRegisterSearchParams): Promise<string> {
  const url = new URL('https://www.federalregister.gov/api/v1/documents')

  params.agencies.forEach(a => url.searchParams.append('agencies[]', a))
  url.searchParams.set('per_page', String(params.perPage ?? 1000))
  url.searchParams.set('order', 'oldest')
  if (params.page && params.page > 1) url.searchParams.set('page', String(params.page))
  params.types.forEach(t => url.searchParams.append('conditions[type][]', t))
  url.searchParams.set('conditions[publication_date][gte]', params.dateGte)
  url.searchParams.set('conditions[publication_date][lte]', params.dateLte)
  if (params.cfrTitles?.length) {
    params.cfrTitles.forEach(t =>
      url.searchParams.append('conditions[cfr][title][]', String(t))
    )
  }
  params.fields.forEach(f => url.searchParams.append('fields[]', f))

  const res = await fetchWithTimeout(url.toString())
  if (!res.ok) {
    throw new Error(`Federal Register search error: ${res.status} ${res.statusText}`)
  }
  return res.text()
}

export interface OpenFDAPaginatedParams {
  endpoint: string    // 'drug/enforcement', 'device/enforcement', etc.
  search?: string
  limit?: number      // max 1000
  skip?: number
}

/**
 * Single-page openFDA fetch with skip-based pagination support.
 * Use in a loop (skip += limit) to paginate through large datasets.
 * Returns empty results on 404 (no results found).
 */
export async function fetchOpenFDAPaginated(params: OpenFDAPaginatedParams): Promise<string> {
  const url = new URL(`https://api.fda.gov/${params.endpoint}.json`)
  if (params.search) url.searchParams.set('search', params.search)
  if (params.limit)  url.searchParams.set('limit', String(params.limit))
  if (params.skip)   url.searchParams.set('skip', String(params.skip))

  const res = await fetchWithTimeout(url.toString())
  if (res.status === 404) {
    return JSON.stringify({ results: [], meta: { results: { total: 0 } } })
  }
  if (!res.ok) {
    throw new Error(`openFDA error: ${res.status} ${res.statusText}`)
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
