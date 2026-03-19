---
name: "Pipeline Proof-of-Life — First Test Scrape"
---

## Goal

The Cedar monitoring pipeline runs end-to-end against all 10 seed sources, producing real change records in the `changes` table, KG entities in `kg_entities`, cost events in `cost_events`, and delivery emails via Resend. This validates the complete pipeline: Fetch → Hash → Diff → Relevance Filter → Classifier → Record → KG Write → Delivery.

## Why

- The pipeline has never executed against real data. Every module has been built in isolation — this is the integration test.
- Validates that gov APIs return parseable content, Oxylabs/BrowserBase actually scrape the FL board sites, Claude agents produce valid JSON classifications, and the append-only audit trail records correctly.
- Identifies broken selectors, dead URLs, and content normalization issues before any customer sees the product.
- MVP scope — required before any demo or customer conversation.

## Success Criteria

- [ ] 3 gov API sources (Federal Register, eCFR, openFDA) each produce at least 1 change record via manual Inngest trigger
- [ ] At least 3 of 7 Oxylabs sources return substantive content (some FL board URLs may have changed — identify and fix)
- [ ] `changes` table contains records with valid `chain_hash`, `chain_sequence`, `severity`, `summary`, and `agent_version`
- [ ] `kg_entities` table contains at least 1 entity linked to a change record
- [ ] `cost_events` table contains rows for `gov_api`, `claude` (relevance_filter + classifier), and `oxylabs` or `browserbase`
- [ ] At least 1 delivery email arrives (or is logged as sent by Resend) for a detected change
- [ ] Inngest dashboard shows successful function runs for `monitor-source` and `deliver-change-alert`
- [ ] `npm run build` passes with 0 errors, 0 warnings
- [ ] Settings notification toggles persist to database (existing STATUS.md priority — bundle into this session)

## Context

### Files to Read First

```yaml
- file: inngest/monitor.ts
  why: The entire pipeline lives here — 11 steps from fetch to delivery event. This is the function you are testing.

- file: lib/fetchers/dispatcher.ts
  why: Auto-escalating fetch logic. Understand how gov_api / oxylabs / browserbase routing works.

- file: lib/fetchers/gov-apis.ts
  why: Federal Register, eCFR, openFDA client implementations. These should work with zero config.

- file: lib/fetchers/oxylabs.ts
  why: Oxylabs API wrapper. Needs OXYLABS_USERNAME + OXYLABS_PASSWORD in env.

- file: lib/fetchers/browserbase.ts
  why: BrowserBase fallback. Needs BROWSERBASE_API_KEY in env.

- file: lib/intelligence/relevance-filter.ts
  why: Agent 1. Needs ANTHROPIC_API_KEY. Uses claude-sonnet-4-5-20250929.

- file: lib/intelligence/classifier.ts
  why: Agent 2. Same model. Produces severity, summary, raw_classification.

- file: lib/audit/record.ts
  why: Append-only insert into changes table.

- file: inngest/delivery.ts
  why: Email delivery — triggered by cedar/change.deliver event from monitor.ts step 11.

- file: lib/env.ts
  why: Zod schema — Stripe keys are required but may not be set. This will throw at runtime if Stripe vars are missing on any page that calls getEnv().

- file: supabase/migrations/004_seed_sources.sql
  why: The 10 seed sources with their URLs, fetch_methods, and scrape_config selectors.

- file: PRPs/completed/settings-fix.md
  why: Settings persistence PRP — follow this spec exactly for the notification toggle fix.
```

### Current File Tree (relevant subset)

```bash
inngest/
  monitor.ts            # Core pipeline — the function under test
  delivery.ts           # Email alert delivery
  client.ts             # Inngest client
  intelligence.ts       # STUB — throws, not used by monitor.ts (intelligence is inline)
  discovery.ts          # STUB — throws on cron, harmless
  recovery.ts           # STUB — throws on event, harmless
lib/
  fetchers/
    dispatcher.ts       # Auto-escalating fetch router
    gov-apis.ts         # Federal Register, eCFR, openFDA
    oxylabs.ts          # Oxylabs API
    browserbase.ts      # BrowserBase API
  intelligence/
    relevance-filter.ts # Agent 1
    classifier.ts       # Agent 2
    prompts/
      relevance-filter.ts
      classifier.ts
  changes/
    hash.ts             # SHA-256 + chain hash
    diff.ts             # Structured diff generation
  processing/
    normalize.ts        # Content normalization (HTML, JSON, text)
  audit/
    record.ts           # Append-only change insert
  delivery/
    email.ts            # Resend email template
  cost-tracker.ts       # Cost event logging
  env.ts                # Env var validation — CRITICAL: Stripe vars may throw
  features.ts           # Feature flag checker
app/
  actions/
    settings.ts         # DOES NOT EXIST YET — create per settings-fix PRP
  (dashboard)/
    settings/page.tsx   # Needs notification persistence wiring
components/
  NotificationsForm.tsx # DOES NOT EXIST YET — create per settings-fix PRP
supabase/migrations/
  017_notification_prefs.sql  # Already exists — verify applied to production
```

### Files to Create or Modify

```bash
# Settings persistence (from settings-fix PRP)
app/actions/settings.ts                  (+) Server action for notification preferences
components/NotificationsForm.tsx         (+) Client component for notification toggles
app/(dashboard)/settings/page.tsx        (M) Wire NotificationsForm, add notification_preferences to query

# Pipeline fixes (discovered during test execution)
lib/env.ts                               (M) Make Stripe vars optional OR provide fallback — they block getEnv() on any server path
lib/fetchers/dispatcher.ts               (M) Potential selector fixes if FL board sites have changed
supabase/migrations/004_seed_sources.sql (reference only — if URLs are dead, update source_urls rows directly in Supabase, do NOT modify this migration)

# Test infrastructure
scripts/test-pipeline.ts                 (+) Optional: CLI script to trigger monitor for a specific source via Inngest event API
```

### Known Gotchas

```typescript
// 1. STRIPE ENV VARS: lib/env.ts requires STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET,
//    STRIPE_MONITOR_PRICE_ID, STRIPE_INTELLIGENCE_PRICE_ID as non-optional strings.
//    If these are not set in Vercel, ANY page or API route calling getEnv() will throw.
//    FIX: Make Stripe vars optional in the Zod schema (they're only needed for billing routes).
//    This is a prerequisite for the pipeline running in production.

// 2. ANTHROPIC_API_KEY in Claude Code shell: The shell injects ANTHROPIC_API_KEY="" (empty).
//    Next.js prioritizes shell env over .env.local. Start dev server with:
//    env -u ANTHROPIC_API_KEY npx next dev --port 3000

// 3. INNGEST DEV SERVER: For local testing, run `npx inngest-cli@latest dev` in a separate terminal.
//    It provides a dashboard at localhost:8288 where you can manually send events.
//    For production testing, use the Inngest Cloud dashboard to send events directly.

// 4. FIRST RUN = ALL CHANGES: Every source's last_hash is null on first fetch.
//    monitor.ts treats null last_hash as "first seen" and runs the full pipeline.
//    This means ALL 10 sources will produce change records on the first run.
//    This is expected and desired for the test scrape.

// 5. CONTENT CAP: monitor.ts caps content at 200KB for Inngest step payload limits.
//    The hash is computed on full content before truncation — detection is accurate.
//    But content_after in the changes table will be truncated for large pages.

// 6. STUB INNGEST FUNCTIONS: intelligence.ts, discovery.ts, recovery.ts all throw.
//    They're registered and will fail on their cron/event triggers. This is harmless
//    for the test scrape — monitor.ts runs the full pipeline inline.
//    discovery.ts runs weekly (Sunday 2am), so it won't fire during testing.
//    intelligence.ts listens on cedar/change.classify — monitor.ts never fires this event.
//    recovery.ts listens on cedar/source.fetch.failed — monitor.ts never fires this event.

// 7. REVIEW STATUS: monitor.ts step 8 queries review_rules by severity.
//    If no rules exist, changes get review_status = 'auto_approved' and proceed to delivery.
//    This is correct for the test scrape — no HITL gating needed yet.

// 8. OXYLABS SELECTOR FRESHNESS: The CSS selectors in scrape_config were written during
//    planning, not verified against live sites. FL board sites may have changed.
//    If Oxylabs returns empty content with a selector, try without the selector first
//    to see what the page actually returns, then update the selector.
```

## Tasks (execute in order)

### Task 1: Fix Stripe env validation blocking pipeline

**File:** `lib/env.ts`
**Action:** MODIFY

The Stripe vars are required in the Zod schema but may not be set in Vercel. This blocks getEnv() on ANY server path — including Inngest functions that never touch billing. Make them optional.

```typescript
// Change these four from z.string().min(1) to z.string().optional():
STRIPE_SECRET_KEY: z.string().optional(),
STRIPE_WEBHOOK_SECRET: z.string().optional(),
STRIPE_MONITOR_PRICE_ID: z.string().optional(),
STRIPE_INTELLIGENCE_PRICE_ID: z.string().optional(),
```

Verify: `npm run build` still passes. No other files reference these through getEnv() except billing routes, which should guard against undefined.

### Task 2: Settings notification persistence

**Action:** Follow `PRPs/completed/settings-fix.md` exactly.

This is already fully specified. Execute all 4 tasks from that PRP:
1. Migration 017 (verify it's applied — it already exists in the migrations dir)
2. Create `app/actions/settings.ts`
3. Create `components/NotificationsForm.tsx`
4. Modify `app/(dashboard)/settings/page.tsx`

Run the validation steps from that PRP before proceeding.

### Task 3: Verify environment variables are configured

**Action:** CHECK (no code changes)

Before triggering any pipeline runs, verify these are set. Check locally in `.env.local` and in Vercel env vars via the Vercel API.

```bash
# Required for gov API sources (sources 1, 4, 5):
# No env vars needed — public APIs, no auth

# Required for Oxylabs sources (sources 2, 3, 6, 7, 8, 9, 10):
OXYLABS_USERNAME    # Oxylabs dashboard → API credentials
OXYLABS_PASSWORD

# Required for BrowserBase escalation:
BROWSERBASE_API_KEY
BROWSERBASE_PROJECT_ID

# Required for intelligence pipeline:
ANTHROPIC_API_KEY   # Must be non-empty in .env.local AND Vercel

# Required for delivery:
RESEND_API_KEY

# Required for Inngest:
INNGEST_EVENT_KEY
INNGEST_SIGNING_KEY
```

If Oxylabs credentials are not yet configured:
- Log into Oxylabs dashboard, get credentials
- Add to `.env.local` and Vercel env vars
- The dispatcher will auto-escalate to BrowserBase if Oxylabs fails, so BrowserBase creds are the fallback

If any credentials are missing, document which ones and proceed with the sources that CAN run (gov APIs need nothing).

### Task 4: Test gov API sources locally (sources 1, 4, 5)

**Action:** Manual test via Inngest dev server

```bash
# Terminal 1: Start Inngest dev server
npx inngest-cli@latest dev

# Terminal 2: Start Next.js (unset Claude Code's empty ANTHROPIC_API_KEY)
env -u ANTHROPIC_API_KEY npx next dev --port 3000
```

First, get the source IDs and source_url IDs for the 3 gov API sources:

```sql
SELECT s.id as source_id, s.name, su.id as source_url_id, s.fetch_method
FROM sources s
JOIN source_urls su ON su.source_id = s.id
WHERE s.fetch_method = 'gov_api'
ORDER BY s.name;
```

Then, in the Inngest dev dashboard (localhost:8288), send an event for each:

```json
{
  "name": "cedar/source.monitor",
  "data": {
    "sourceId": "<source_id from query>",
    "sourceUrlId": "<source_url_id from query>"
  }
}
```

**Expected result for each:** Inngest shows the `monitor-source` function executing through all 11 steps. The function returns `{ changed: true, relevant: true, changeId: "...", severity: "...", summary: "..." }`.

**Verify in Supabase:**
```sql
-- Change records created
SELECT id, source_id, severity, summary, chain_sequence, agent_version, review_status, created_at
FROM changes ORDER BY created_at DESC LIMIT 10;

-- Source URLs updated with hash
SELECT id, last_hash, last_fetched_at, last_fetch_method
FROM source_urls WHERE last_hash IS NOT NULL;

-- Cost events logged
SELECT service, operation, cost_usd, tokens_in, tokens_out, created_at
FROM cost_events ORDER BY created_at DESC LIMIT 20;

-- KG entities created
SELECT id, name, entity_type, jurisdiction, created_at
FROM kg_entities ORDER BY created_at DESC LIMIT 10;
```

If any gov API source fails, debug the specific error before proceeding. Common issues:
- Federal Register API rate limit (1K/hour) — unlikely for single test
- eCFR API returns large JSON — content cap may truncate, but hash is on full content
- openFDA returns 404 for empty result sets — already handled in gov-apis.ts

### Task 5: Test Oxylabs sources locally (sources 2, 3, 6, 7, 8, 9, 10)

**Action:** Manual test via Inngest dev server (same setup as Task 4)

**Prerequisite:** OXYLABS_USERNAME and OXYLABS_PASSWORD set in `.env.local`.

Get the Oxylabs source IDs:
```sql
SELECT s.id as source_id, s.name, su.id as source_url_id, s.fetch_method
FROM sources s
JOIN source_urls su ON su.source_id = s.id
WHERE s.fetch_method = 'oxylabs'
ORDER BY s.name;
```

Send `cedar/source.monitor` events one at a time. Start with FL Board of Medicine (source 7) — it's the most straightforward HTML page.

**If a source returns empty content:**
1. Check the Oxylabs response in the Inngest step log — is it returning HTML at all?
2. The CSS selector in `scrape_config` may be stale. Query the current selector:
   ```sql
   SELECT su.id, s.name, s.scrape_config->>'selector' as selector
   FROM sources s JOIN source_urls su ON su.source_id = s.id
   WHERE s.name ILIKE '%Board of Medicine%';
   ```
3. Test without the selector first (temporarily set `scrape_config.selector` to null in Supabase) to see what the full page returns
4. Find the correct selector and update `scrape_config` in Supabase directly:
   ```sql
   UPDATE sources SET scrape_config = jsonb_set(scrape_config, '{selector}', '"NEW_SELECTOR"')
   WHERE name = 'FL Board of Medicine';
   ```

**If Oxylabs fails entirely** (credentials issue, blocked, etc.), the dispatcher auto-escalates to BrowserBase. Check if BrowserBase succeeded in the Inngest step log.

**If both fail:** Log the error, note the source as blocked, and continue with the remaining sources. The goal is at least 3 of 7 Oxylabs sources returning data.

### Task 6: Verify delivery pipeline

**Action:** Check that at least one `cedar/change.deliver` event was fired and processed.

After Tasks 4-5, the Inngest dashboard should show `deliver-change-alert` function runs. Check:

1. Did the function execute without errors?
2. Did it find practices to notify? (Requires at least 1 row in `practices` table)
3. Did Resend send an email?

```sql
-- Check practices exist (delivery needs recipients)
SELECT id, name, owner_email, tier FROM practices;

-- Check cost_events for resend
SELECT * FROM cost_events WHERE service = 'resend' ORDER BY created_at DESC;
```

If no practices exist, delivery correctly skips. Create a test practice if needed:
```sql
INSERT INTO practices (name, owner_email, tier)
VALUES ('Test Practice', 'your-email@example.com', 'monitor');
```

Then re-trigger a `cedar/change.deliver` event with a valid changeId to test email delivery.

### Task 7: Run all 10 sources in production (Vercel + Inngest Cloud)

**Action:** After local validation, deploy and run against production.

1. Push all changes (Task 1 env fix + Task 2 settings) to main:
   ```bash
   git add -A
   git commit -m "feat: pipeline proof-of-life — env fix + settings persistence"
   # Push using PAT (see CLAUDE.md for exact procedure)
   ```

2. Verify Vercel deploy succeeds.

3. In Inngest Cloud dashboard, send `cedar/source.monitor` events for all 10 sources (get IDs from production Supabase).

4. Monitor function execution in Inngest Cloud. Verify the same checks as Tasks 4-5 against the production Supabase.

### Task 8: Document results in STATUS.md

**Action:** MODIFY `STATUS.md`

Record:
- Which sources succeeded and which failed (with error type)
- Any selector fixes applied
- Total change records created
- Total cost events logged
- Any dead URLs or unexpected content formats discovered
- Updated module status for Modules 6B, 9 if applicable

## Integration Points

```yaml
DATABASE:
  - Migration 017 (notification_preferences) — verify applied to production
  - source_urls.last_hash populated after first run
  - changes table populated with real records
  - kg_entities populated with real entities
  - cost_events populated with real costs

INNGEST:
  - cedar/source.monitor — manually triggered for each source
  - cedar/change.deliver — automatically fired by monitor.ts step 11
  - monitor-source function runs through all 11 steps

API ROUTES:
  - /api/inngest — already registered, no changes needed

UI:
  - Settings page: notification toggles persist (Task 2)
  - Dashboard should show real change data after test scrape

ENV:
  - OXYLABS_USERNAME + OXYLABS_PASSWORD — verify configured
  - BROWSERBASE_API_KEY + BROWSERBASE_PROJECT_ID — verify configured
  - ANTHROPIC_API_KEY — verify non-empty in Vercel
  - RESEND_API_KEY — verify configured
  - STRIPE_* — made optional (Task 1)
```

## Validation

### Build Check

```bash
npm run build
# Must pass with 0 errors, 0 warnings
```

### Functional Verification

```
1. Gov API test: At least 3 change records from Federal Register, eCFR, openFDA
2. Oxylabs test: At least 3 of 7 scrape sources return content and produce change records
3. Intelligence: Every change record has non-null severity, summary, agent_version
4. Audit trail: Every change record has valid chain_hash, chain_sequence, prev_chain_hash
5. KG: At least 1 kg_entity exists linked to a change_id
6. Cost tracking: cost_events contains rows for gov_api, claude, and at least one of oxylabs/browserbase
7. Delivery: At least 1 email sent (or logged as sent) via Resend
8. Settings: Notification toggles persist across page refresh
```

### Database Verification

```sql
-- Summary of test scrape results
SELECT s.name, s.fetch_method,
       COUNT(c.id) as changes_detected,
       MAX(c.severity) as max_severity,
       MAX(c.created_at) as latest_change
FROM sources s
LEFT JOIN changes c ON c.source_id = s.id
GROUP BY s.id, s.name, s.fetch_method
ORDER BY changes_detected DESC;

-- Audit chain integrity
SELECT source_id, COUNT(*) as records,
       MIN(chain_sequence) as min_seq, MAX(chain_sequence) as max_seq
FROM changes
GROUP BY source_id;

-- Cost summary
SELECT service, COUNT(*) as calls, SUM(cost_usd) as total_cost
FROM cost_events
GROUP BY service
ORDER BY total_cost DESC;
```

## Anti-Patterns

- ❌ Do not modify migration files that are already applied — update data via SQL in Supabase directly
- ❌ Do not mock or stub API calls — this is an integration test against real services
- ❌ Do not run all 10 sources simultaneously on first attempt — start with 1 gov API source, verify, then expand
- ❌ Do not skip cost tracking verification — this is a compliance platform, every API call must be logged
- ❌ Do not ignore failed sources — document every failure with error type for the next session
- ❌ Do not change the append-only trigger or changes table schema
- ❌ Do not modify seed migration 004 — update source data in Supabase directly if URLs are dead
- ❌ Do not proceed to production (Task 7) before local validation passes (Tasks 4-5)
- ❌ Do not forget to start dev server with `env -u ANTHROPIC_API_KEY` prefix
