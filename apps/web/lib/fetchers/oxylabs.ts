// Module 3: Oxylabs web scraping fetcher
//
// BLOCKED: Requires OXYLABS_USERNAME + OXYLABS_PASSWORD credentials.
// The dispatcher guards credential presence before calling these functions,
// so the guard here is a defence-in-depth safety net only.
//
// Oxylabs Web Scraper API docs:
//   https://developers.oxylabs.io/scraper-apis/web-scraper-api
//
// To activate: add OXYLABS_USERNAME and OXYLABS_PASSWORD to .env.local
// and to Vercel environment variables, then the dispatcher will call this
// automatically for all sources with fetch_method = 'oxylabs'.

const OXYLABS_API_URL = 'https://realtime.oxylabs.io/v1/queries'
const TIMEOUT_MS = 60_000 // Oxylabs can take up to 60s for complex pages

export interface OxylabsOptions {
  /** CSS selector to extract — if omitted, returns full page HTML */
  selector?: string
  /** Country for geo-targeted requests (default: 'us') */
  country?: string
  /** Render JavaScript before extracting content */
  render?: boolean
}

/**
 * Fetch a URL via the Oxylabs Realtime Web Scraper API.
 * Returns the rendered HTML (or selected content) as a string.
 *
 * Blocked until OXYLABS_USERNAME and OXYLABS_PASSWORD are configured.
 */
export async function fetchViaOxylabs(
  url: string,
  options: OxylabsOptions = {}
): Promise<string> {
  const username = process.env.OXYLABS_USERNAME
  const password = process.env.OXYLABS_PASSWORD

  if (!username || !password) {
    throw new Error(
      '[oxylabs] BLOCKED: OXYLABS_USERNAME and OXYLABS_PASSWORD are required. ' +
      'Add them to .env.local and Vercel env vars to activate Oxylabs fetching.'
    )
  }

  const body: Record<string, unknown> = {
    source: 'universal',
    url,
    geo_location: options.country ?? 'United States',
    render: options.render !== false ? 'html' : undefined, // default: render JS
    parse: false, // return raw HTML, normalization handled by normalize.ts
  }

  if (options.selector) {
    body.parse = true
    body.parsing_instructions = {
      content: { _fns: [{ _fn: 'css', _args: [options.selector, 'text'] }] },
    }
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const res = await fetch(OXYLABS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })

    if (!res.ok) {
      const errorText = await res.text().catch(() => res.statusText)
      throw new Error(`Oxylabs API error ${res.status}: ${errorText}`)
    }

    const json = await res.json() as {
      results?: Array<{ content?: string }>
      status?: string
    }

    if (!json.results?.length || !json.results[0].content) {
      throw new Error('Oxylabs returned empty results')
    }

    return json.results[0].content
  } finally {
    clearTimeout(timer)
  }
}
