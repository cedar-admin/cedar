# Cedar

Regulatory intelligence platform for Florida medical practices. Monitors 71 regulatory sources, detects changes, classifies them through an AI pipeline, and delivers plain-language alerts with a tamper-evident audit trail.

## Stack

- **Framework:** Next.js 16 App Router, TypeScript
- **Database:** Supabase (PostgreSQL + RLS + Storage)
- **Scheduling:** Inngest
- **Hosting:** Vercel (main app) + Railway (Docling microservice)
- **Auth:** WorkOS AuthKit (roles: practice_owner, reviewer, admin)
- **Email:** Resend
- **Billing:** Stripe
- **Fetching:** Gov APIs → Oxylabs → BrowserBase (auto-escalating)
- **AI:** Anthropic Claude API (`claude-sonnet-4-5-20250929`)
- **Push:** OneSignal (1.0 Full, Intelligence tier only)

## Module Build Order

1. Data Layer (Supabase schema, RLS, WorkOS, Stripe) ✅ DONE
2. Orchestration (Inngest scheduler + monitorSource + delivery) ✅ DONE
3. Source Fetching (auto-escalating dispatcher) — gov_api fetcher DONE, oxylabs/browserbase TODO
4. Document Processing (Docling + Whisper) — stub in `/lib/processing/`
5. Change Detection (hash + diff + chain) — DONE
6. Intelligence Pipeline (3 agents, sequential) — Agents 1+2 DONE, Agent 3 deferred (see below)
6B. HITL Review Layer — stub in `(admin)/reviews/`
7. Audit Trail + Knowledge Graph — record.ts DONE, rest TODO
8. Delivery (Resend + OneSignal) — email.ts DONE, OneSignal TODO
9. Dashboard (Next.js — built progressively) — shell DONE

## How to Determine What to Build Next

At the start of every session, read this file and the actual codebase to determine current state. Do not rely on what CLAUDE.md says is done — verify against the actual files and migrations. The module list above reflects last known state but the codebase is the source of truth.

To determine the next task:
1. Find the first module in the list above that is not fully complete
2. Within that module, identify the first incomplete component based on what exists in the codebase
3. Build that component
4. Repeat until the module is complete, then move to the next

Never stop at the end of a subtask and wait silently. Always continue to the next logical piece of work within the current module unless you hit a blocker.

## Session Behavior

**When you complete a subtask within a module:**
- State what you just built in 2-3 sentences
- State what comes next within the module
- Continue immediately unless there is a blocker

**When you complete a full module:**
- Summarize what was built across the whole module
- List any decisions made and why
- List any open questions or items deferred
- State which module is next and what it entails
- Ask: "Ready to continue to Module X: [name]?"
- Wait for confirmation before starting the next module

**When you hit a blocker:**
- Describe the blocker clearly
- State what you need to resolve it (a decision, a credential, a clarification)
- Do not proceed past the blocker — ask for what you need

**After completing any module or subtask that modifies files:**
- Stage all changed files with `git add -A`
- Commit with a descriptive message (e.g., `feat: Module 9 dashboard live data queries`)
- Push to main with `git push`
- Confirm the push succeeded before continuing

## Module Test Criteria

A module is not complete until its test criteria pass.

**Module 2 — Orchestration**
- Inngest dashboard shows Cedar functions registered
- A manually triggered `monitor.check` event executes without error
- Kill switch: set `agents_enabled = false` in `feature_flags`, trigger a job, confirm it exits early and logs the skip

**Module 3 — Source Fetching**
- 3 sources fetch successfully and log cost events to `cost_events`
- Dispatcher correctly stores `fetch_method` on first fetch and reuses it on second fetch
- A source that fails Oxylabs escalates to BrowserBase (or logs escalation attempt)

**Module 4 — Document Processing**
- Railway Docling service is live and returns structured Markdown for a test PDF POST
- `docling.ts` client successfully calls the Railway endpoint and returns content
- Whisper transcribes a short audio clip and returns text

**Module 5 — Change Detection**
- Manually modify `last_hash` on a source_url row; confirm a change record is written with correct `chain_hash` and `chain_sequence`
- Confirm `prev_chain_hash` on the new record matches the `chain_hash` of the prior record
- Confirm unmodified sources do not generate change records

**Module 6 — Intelligence Pipeline**
- Agent 1 correctly filters an irrelevant diff (returns `relevant: false`)
- Agent 2 produces valid JSON with all required fields on a real regulatory diff
- `agent_version` is stored on the change record
- Cost event is logged per agent call

**Module 6B — HITL Review Layer**
- A change matching a `review_rules` condition enters `pending_review` and is not delivered
- A change matching no rule gets `review_status = not_required` and proceeds to delivery
- Reviewer can approve/edit/reject from the admin queue; action writes to `review_actions`

**Module 7 — Audit Trail & Knowledge Graph**
- Attempt to UPDATE a `changes` row via SQL — confirm trigger throws
- Attempt to DELETE a `changes` row — confirm trigger throws
- KG entity is written correctly for a classified change
- Weekly `audit.validate-chain` cron completes and writes to `validation_log`

**Module 8 — Delivery**
- Alert email arrives in inbox with summary, severity badge, source link, and disclaimer
- Delivery is logged to `cost_events`
- `practice_acknowledgments` row is written when "Mark as Reviewed" is clicked

**Module 9 — Dashboard**
- Practice owner sees only their own changes (RLS enforced)
- Admin sees all changes
- Change detail page renders diff, AI summary, disclaimer, and source link
- Audit trail export generates a valid PDF

## Key Conventions

**Secrets:** All server-side secrets from `lib/env.ts` only. Never import from `process.env` directly. Never prefix server secrets with `NEXT_PUBLIC_`.

**Feature gates:** All tier-based feature checks use `isFeatureEnabled(flagName, practiceTier)` from `lib/features.ts`. Never hardcode tier strings in components.

**Agent prompts:** During MVP, prompts live in code files under `lib/intelligence/prompts/`. Each prompt file exports a version string (e.g., `v0.1.0-code`). Store `agent_version` on every change record from day one. Migrate to `prompt_templates` table after stability is confirmed.

**Cost tracking:** Every external API call (Claude, Oxylabs, BrowserBase, Docling, Whisper, Resend) wrapped with `trackCost()` from `lib/cost-tracker.ts`. No exceptions.

**Audit trail:** `changes` table is append-only, enforced by database trigger. Never `UPDATE` or `DELETE` on `changes`. The trigger has one exception: `review_status`, `reviewed_by`, `reviewed_at`, `review_action`, and `review_notes` are updatable to support the HITL workflow — the trigger must explicitly allow updates to these columns only. Reviewer decisions are also written to the `review_actions` table. Use `superseded_by` to correct a change record.

**RLS:** Anon key subject to RLS. Service role key bypasses RLS. Use anon in client components, service role in Inngest functions and API routes only.

**Jurisdiction:** Every source, change, KG entity has `jurisdiction` column defaulting to `'FL'`. Always set explicitly when querying — never assume Florida-only.

## Where Things Live

| Thing | Path |
|-------|------|
| Migrations | `supabase/migrations/` |
| Inngest functions | `inngest/` |
| Fetchers | `lib/fetchers/` |
| Intelligence agents | `lib/intelligence/` |
| Agent prompts (MVP) | `lib/intelligence/prompts/` |
| Cost tracking | `lib/cost-tracker.ts` |
| Feature flags | `lib/features.ts` |
| Env validation | `lib/env.ts` |
| Supabase types | `lib/db/types.ts` (regenerate after schema changes) |
| Dashboard routes | `app/(dashboard)/` |
| Admin routes | `app/(admin)/` |

## Configuration Tables (read from DB, not code)

- `feature_flags` — what features are enabled per tier
- `prompt_templates` — active agent prompts (post-MVP)
- `system_config` — operational thresholds (cost limits, cron schedules, confidence thresholds, retry limits)
- `review_rules` — HITL routing rules

## Agent 3 Deferral

Agent 3 (Ontology Mapper) is deferred to 1.0 Full. Do not stub or build it during MVP. It activates when:
1. The knowledge graph has been bootstrapped with a one-time seeding workflow
2. The changes table has accumulated sufficient history for meaningful retrieval
3. RAG is activated over the `changes` table and `kg_entities`

Until those conditions are met, `ontology_mapping` on change records stays null.

## Module 4 Prerequisites

Module 4 (Document Processing) requires a live Railway deployment of the Docling microservice before `docling.ts` can be wired. If Railway is not yet deployed when Module 4 is reached, flag this as a blocker and ask for confirmation that Railway is live before proceeding. Do not mock the Docling client — build it against the real endpoint.

## Product Rules

**Information-only platform.** Cedar summarizes what changed. It does NOT provide legal advice or practice-specific directives.

Every AI summary must carry this disclaimer:
> "This summary was generated by AI and has not been reviewed by a licensed attorney. This is not legal advice. For decisions specific to your practice, consult your legal counsel."

**Two tiers:**
- Monitor ($99/mo): change feed, email alerts, audit trail
- Intelligence ($199/mo): all Monitor + Q&A, knowledge graph, attorney-reviewed content, weekly digest, push notifications

## MVP Scope

10 Critical-tier sources. Single Claude agent (relevance filter + classifier combined). Supabase append-only store. Resend email alert. Minimal dashboard. WorkOS auth.

Success criteria: 3+ sources detect real regulatory changes within 24 hours, AI summary accuracy verified, audit trail correct, alert email arrives.

## Dev Server Startup (Important)

When running inside Claude Code, its shell environment injects `ANTHROPIC_API_KEY=` (empty string). Next.js follows shell env priority over `.env.local`, so the key would be empty in Inngest step callbacks. **Always start the dev server with:**

```bash
env -u ANTHROPIC_API_KEY npx next dev --port 3000
```

This unsets the shell variable so `.env.local` takes precedence. Without this, Claude API calls in intelligence agents will fail with authentication errors.

## Access Tokens and API Keys

Supabase Access Token (CLAUDE) = sbp_2451d7e72db7e49fab1b6591dd7bbceb821ed564
Vercel Access Token (cedar-deploy) = vcp_3ZBv8xhuHEFpY9VOOQmG0WpRMZkvH7J9iUkd4c6XpxKHM9XhgX1KYbv9
Anthropic API Key (CEDAR-MVP) = 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
Browserbase Project ID = f3895e24-ee71-4558-9e37-d94d72234b11
Browserbase API Key = bb_live_WE66ONapM9mUipx6IdgI5Sv1WWQ
Resend API Key = re_NdX9vJ3S_718fyKUvaXWzvu3pbD2ERTtX


## Generating Updated Types

After pushing migrations to Supabase:

```bash
npx supabase gen types typescript --project-id serumeiwrvtwisibuawe > lib/db/types.ts
```