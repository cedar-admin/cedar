// Module 3: BrowserBase headless browser fetcher (escalation fallback)
//
// BLOCKED: Requires BROWSERBASE_API_KEY credential.
// Used as automatic escalation fallback when Oxylabs fails or is not configured.
// The dispatcher guards credential presence before calling these functions.
//
// BrowserBase docs: https://docs.browserbase.com
// Stagehand (AI-assisted extraction): https://docs.browserbase.com/stagehand
//
// To activate: add BROWSERBASE_API_KEY to .env.local and Vercel environment
// variables. The dispatcher will escalate to this automatically when Oxylabs fails.

const BROWSERBASE_API_URL = 'https://www.browserbase.com/v1'
const SESSION_TIMEOUT_MS = 120_000 // BrowserBase sessions can take up to 2 minutes

export interface BrowserBaseOptions {
  /** CSS selector to extract — if omitted, returns full page HTML */
  selector?: string
  /** Wait for a specific selector before extracting (useful for SPAs) */
  waitForSelector?: string
  /** Extra time to wait after page load (ms) for dynamic content */
  waitMs?: number
}

/**
 * Fetch a URL via BrowserBase's headless Chromium service.
 * Handles JavaScript-rendered pages that Oxylabs can't scrape reliably.
 *
 * Blocked until BROWSERBASE_API_KEY is configured.
 */
export async function fetchViaBrowserBase(
  url: string,
  options: BrowserBaseOptions = {}
): Promise<string> {
  const apiKey = process.env.BROWSERBASE_API_KEY

  if (!apiKey) {
    throw new Error(
      '[browserbase] BLOCKED: BROWSERBASE_API_KEY is required. ' +
      'Add it to .env.local and Vercel env vars to activate BrowserBase fetching.'
    )
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), SESSION_TIMEOUT_MS)

  try {
    // Step 1: Create a session
    const sessionRes = await fetch(`${BROWSERBASE_API_URL}/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-bb-api-key': apiKey,
      },
      body: JSON.stringify({
        projectId: process.env.BROWSERBASE_PROJECT_ID, // optional
        browserSettings: { viewport: { width: 1280, height: 800 } },
      }),
      signal: controller.signal,
    })

    if (!sessionRes.ok) {
      const errorText = await sessionRes.text().catch(() => sessionRes.statusText)
      throw new Error(`BrowserBase session creation failed ${sessionRes.status}: ${errorText}`)
    }

    const session = await sessionRes.json() as { id: string; connectUrl?: string }
    const sessionId = session.id

    // Step 2: Navigate and extract content via the BrowserBase REST API
    // (Simplified REST-based approach; production upgrade: use Playwright/Stagehand SDK)
    const pageRes = await fetch(`${BROWSERBASE_API_URL}/sessions/${sessionId}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-bb-api-key': apiKey,
      },
      body: JSON.stringify({
        commands: [
          { type: 'navigate', url },
          ...(options.waitForSelector
            ? [{ type: 'waitForSelector', selector: options.waitForSelector, timeout: 10_000 }]
            : []),
          ...(options.waitMs
            ? [{ type: 'wait', duration: options.waitMs }]
            : []),
          {
            type: 'evaluate',
            expression: options.selector
              ? `document.querySelector(${JSON.stringify(options.selector)})?.innerText ?? ''`
              : 'document.documentElement.outerHTML',
          },
        ],
      }),
      signal: controller.signal,
    })

    if (!pageRes.ok) {
      const errorText = await pageRes.text().catch(() => pageRes.statusText)
      throw new Error(`BrowserBase execute failed ${pageRes.status}: ${errorText}`)
    }

    const result = await pageRes.json() as { result?: string }

    // Step 3: Clean up session
    await fetch(`${BROWSERBASE_API_URL}/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: { 'x-bb-api-key': apiKey },
    }).catch(() => {
      // Session cleanup failure is non-fatal — BrowserBase auto-cleans after TTL
      console.warn(`[browserbase] Failed to clean up session ${sessionId}`)
    })

    if (!result.result) {
      throw new Error('BrowserBase returned empty page content')
    }

    return result.result
  } finally {
    clearTimeout(timer)
  }
}
