# Cedar

Cedar is a regulatory intelligence platform for independent medical practices — starting in Florida, expanding state by state. Cedar monitors federal and state regulatory sources (agencies, boards, legislative activity, enforcement databases, court filings), detects meaningful changes within hours of publication, classifies them through an AI intelligence pipeline, and delivers plain-language alerts with a tamper-evident audit trail.

Cedar shrinks the delay between a regulation being updated and a practice owner knowing about it — from days or weeks down to hours. Every AI summary links back to the original source material and carries a disclaimer. Cedar provides regulatory monitoring, summaries, and FAQs. Cedar does not provide legal advice.

**Target market (current):** Independent functional medicine clinics, hormone optimization practices, med spas, and compounding-adjacent operations in Florida — small practices (1-5 providers) operating in a heavily regulated gray zone without in-house compliance staff.

**Expansion path:** Florida first → California, Texas, New York → all 50 states. The source count grows with each state and as new regulatory sources emerge.

**Long-term vision:** The most reliable third-party legal aggregation and summary service in the medical industry — making law and regulations accessible and understandable in real-time. The go-to platform for regulation compliance, and eventually for all operational guidance for small to mid-size medical practices.

## Session Startup — Read in This Order

0. Run `git pull origin main` to sync local files with the remote before doing anything else
1. Read this file (automatic)
2. Read `STATUS.md` for current build state, last session summary, and next priority
3. If a PRP exists in `PRPs/active/`, read it — that is your task for this session
4. Read relevant source files before modifying them — always verify against the actual codebase

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
- **Monorepo:** pnpm workspaces + Turborepo
- **Design System:** Supabase UI (packages/ui — shadcn/radix primitives, Tailwind v3)
- **Design System Docs:** apps/design-system (Next.js, contentlayer2, MDX, port 3003)

## Monorepo Structure

Cedar is a pnpm monorepo with Turborepo:

| Directory | Purpose |
|-----------|---------|
| `apps/web/` | Cedar's Next.js app (all routes, components, lib, inngest, supabase) |
| `apps/design-system/` | Design system docs app (component reference, live previews, MDX, port 3003) |
| `packages/ui/` | Supabase design system primitives (shadcn components, theme CSS) |
| `packages/config/` | Shared Tailwind v3 config + color generation engine |
| `packages/ui-patterns/` | Complex composed UI patterns (fragments — modals, page layouts, form patterns) |
| `packages/common/` | Utility hooks (useBreakpoint, useDebounce, etc.) |
| `packages/icons/` | SVG product icons |
| `packages/build-icons/` | Icon build tooling |
| `packages/tsconfig/` | Shared TypeScript configs |
| `packages/api-types/` | Stub package (empty — satisfies workspace references) |

**Package manager:** Always use `pnpm` (never npm or yarn). Lockfile: `pnpm-lock.yaml`.
**Commands:** `pnpm dev` (start dev server), `pnpm run dev:design-system` (start design system docs), `pnpm build` (build all), `pnpm typecheck`.
**Env files:** `.env.local` must be symlinked into `apps/web/` (it lives at monorepo root).

## Module Build Order

1. Data Layer (Supabase schema, RLS, WorkOS, Stripe) ✅ DONE
2. Orchestration (Inngest scheduler + monitorSource + delivery) ✅ DONE
3. Source Fetching (auto-escalating dispatcher) ✅ DONE
4. Document Processing (Docling + Whisper) — 🔲 Blocked on Railway deploy
5. Change Detection (hash + diff + chain) ✅ DONE
6. Intelligence Pipeline (3 agents, sequential) — Agents 1+2 DONE, Agent 3 deferred to 1.0 Full
6B. HITL Review Layer — ⚙️ Partial (routes work, rule-matching incomplete)
7. Audit Trail + Knowledge Graph — ⚙️ Partial (chain validator works, KG writes inline, snapshot.ts stub)
8. Delivery (Resend + OneSignal) — ✅ Email DONE, OneSignal deferred to 1.0 Full
9. Dashboard (Next.js) — ⚙️ Partial (settings persist, some pages incomplete)

**Important:** This list reflects last known state. `STATUS.md` has the current ground truth. Always verify against actual files and migrations.

## Session Discipline

### PRP Workflow (Preferred)
When a PRP exists in `PRPs/active/`:
- The PRP defines the scope for this session. Follow it precisely.
- Do not add scope beyond the PRP. Note future work in `STATUS.md`.
- Run all validation gates in the PRP before marking complete.
- When done: update `STATUS.md`, move PRP to `PRPs/completed/`.

### When No PRP Exists
Fall back to module-order progression:
1. Check `STATUS.md` for the next priority
2. Find the first incomplete module in the build order
3. Within that module, identify the first incomplete component from the codebase
4. Build it, then continue to the next piece within the same module

### Session Behavior

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

**Before ending any session:**
- Update `STATUS.md` with: what was built, what's next, any issues discovered
- Stage, commit, and push all changes (see Git Push procedure below)

**After completing any module or subtask that modifies files:**
- Stage all changed files with `git add -A`
- Commit with a descriptive message (e.g., `feat: Module 9 dashboard live data queries`)
- Push to main using the deploy procedure below
- Confirm the push succeeded before continuing

**Platform operations (Vercel, Supabase, GitHub):**
Use available access tokens to perform all platform operations directly via API or CLI — env var updates, deployments, migrations, git pushes. Never ask the user to perform these manually.

## Git Push & Vercel Deploy Procedure

Vercel is connected to the `cedar-admin/cedar` GitHub repo and auto-deploys on every push to `main`. The CLI deploy path (`vercel deploy --prod`) is unreliable on this account — always use the GitHub push path instead.

**Every push to production must follow these exact steps:**

```bash
# 1. Stage and commit (standard)
git add -A
git commit -m "feat: ..."

# 2. Push using PAT (HTTPS auth is not cached — must embed PAT in URL)
# PAT is stored locally — never commit it. Source from env or credential store.
PAT="$GITHUB_PAT"   # set GITHUB_PAT in your shell profile or .env.local
git remote set-url origin "https://${PAT}@github.com/cedar-admin/cedar.git"
git push origin main
git remote set-url origin "https://github.com/cedar-admin/cedar.git"   # reset — never leave PAT in remote URL

# 3. Verify Vercel picked it up (wait ~10s then poll)
# VERCEL_TOKEN is stored locally — never commit it.
sleep 10s && curl -s "https://api.vercel.com/v6/deployments?projectId=prj_YykyqY89BoocNV2xV3MUWcDjpdxv&limit=1" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  | jq '.deployments[0] | {id: .uid, state, url}'

# 4. If state is BUILDING, poll again after 30s until READY or ERROR
# 5. If state is READY — done. cedar-beta.vercel.app is live.
# 6. If state is ERROR — check build logs before retrying
```

**Why the CLI path fails:** `vercel deploy --prod` (CLI) returns "Unexpected error" immediately on this account — builds complete in 0ms with no logs. Root cause is unknown (likely a Vercel Hobby plan + CLI auth combination). The GitHub push → auto-deploy path works reliably every time.

**Author identity must be `cedar-admin`:** The global git config must be set to match the GitHub account. If commits are authored with a different identity, Vercel may not associate them correctly.

```bash
git config --global user.email "cedaradmin@gmail.com"
git config --global user.name "cedar-admin"
```

If the identity ever gets reset, re-amend the last commit before pushing:
```bash
git commit --amend --reset-author --no-edit
# then push with PAT as above (use --force if already pushed)
```

**Vercel project details:**
- Project ID: `prj_YykyqY89BoocNV2xV3MUWcDjpdxv`
- Production URL: `cedar-beta.vercel.app`
- GitHub repo: `cedar-admin/cedar` (main branch → production)
- Root Directory: `apps/web`
- Build Command: `cd ../.. && pnpm turbo build --filter=web`
- Install Command: `pnpm install`

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
- `chain-validator.ts` detects a tampered hash and writes to `validation_log`
- KG entity is written when a change is recorded

**Module 8 — Delivery**
- An approved change triggers an email via Resend
- Email contains: severity badge, AI summary, source link, disclaimer, acknowledge link
- A `pending_review` change is NOT delivered

**Module 9 — Dashboard**
- All pages render without errors
- Change detail page shows AI summary, structured diff, metadata, source link
- Audit trail page shows validation runs and supports PDF export
- Settings page persists notification preferences to database
- Admin pages are not accessible to practice_owner role

## Non-Negotiable Conventions

**Feature gates:** All tier-based feature checks use `isFeatureEnabled(flagName, practiceTier)` from `lib/features.ts`. Never hardcode tier strings in components.

**Agent prompts:** During MVP, prompts live in code files under `lib/intelligence/prompts/`. Each prompt file exports a version string (e.g., `v0.1.0-code`). Store `agent_version` on every change record from day one. Migrate to `prompt_templates` table after stability is confirmed.

**Cost tracking:** Every external API call (Claude, Oxylabs, BrowserBase, Docling, Whisper, Resend) wrapped with `trackCost()` from `lib/cost-tracker.ts`. No exceptions.

**Audit trail:** `changes` table is append-only, enforced by database trigger. Never `UPDATE` or `DELETE` on `changes`. The trigger has one exception: `review_status`, `reviewed_by`, `reviewed_at`, `review_action`, and `review_notes` are updatable to support the HITL workflow — the trigger must explicitly allow updates to these columns only. Reviewer decisions are also written to the `review_actions` table. Use `superseded_by` to correct a change record.

**RLS:** Anon key subject to RLS. Service role key bypasses RLS. Use anon in client components, service role in Inngest functions and API routes only.

**Jurisdiction:** Every source, change, KG entity has `jurisdiction` column defaulting to `'FL'`. Always set explicitly when querying — never assume Florida-only.

**Disclaimer:** Every AI summary must carry:
> "This summary was generated by AI and has not been reviewed by a licensed attorney. This is not legal advice. For decisions specific to your practice, consult your legal counsel."

**Primary keys:** Cedar uses UUID primary keys (`id UUID PRIMARY KEY DEFAULT gen_random_uuid()`). This is an intentional architectural choice. Do not use bigint identity PKs.

**Migration file naming:** New migrations use the timestamp format `YYYYMMDDHHmmss_description.sql`. Existing migrations (001-027) retain their original naming.

**Declarative schema:** `supabase/schemas/` contains the desired final state of the database schema. When making schema changes: (1) update the relevant file in `supabase/schemas/`, (2) generate a migration with `supabase db diff -f <migration_name>`, (3) review the generated migration before applying. RLS policies and DML must still be written as versioned migrations per the declarative-schema.md caveats.

**App components:** Before creating a new component in `apps/web/components/`, check
`apps/web/components/index.ts` for an existing one. After creating a component, add it to
the barrel file with a JSDoc description. For design system components (atoms/fragments
shared across apps), see `apps/design-system/AUTHORING.md` instead.

## Where Things Live

| Thing | Path |
|-------|------|
| Migrations | `apps/web/supabase/migrations/` |
| Declarative schema | `apps/web/supabase/schemas/` |
| Inngest functions | `apps/web/inngest/` |
| Fetchers | `apps/web/lib/fetchers/` |
| Intelligence agents | `apps/web/lib/intelligence/` |
| Agent prompts (MVP) | `apps/web/lib/intelligence/prompts/` |
| Cost tracking | `apps/web/lib/cost-tracker.ts` |
| Feature flags | `apps/web/lib/features.ts` |
| Env validation | `apps/web/lib/env.ts` |
| Supabase types | `apps/web/lib/db/types.ts` (regenerate after schema changes) |
| Dashboard routes | `apps/web/app/(dashboard)/` |
| Admin routes | `apps/web/app/(admin)/` |
| Cedar app components | `apps/web/components/index.ts` (check before creating new ones) |
| Design system packages | `packages/ui/` (atoms), `packages/ui-patterns/` (fragments) |
| Design system docs app | `apps/design-system/` (run with `pnpm run dev:design-system`) |
| Design system authoring | `apps/design-system/AUTHORING.md` |
| Theme CSS (canonical) | `packages/ui/build/css/` |
| Tailwind config | `apps/web/tailwind.config.js` |
| Build status | `STATUS.md` |
| Active PRP | `PRPs/active/` |
| Completed PRPs | `PRPs/completed/` |
| PRP template | `PRPs/templates/prp_base.md` |
| Code pattern examples | `examples/patterns/` |
| Architecture reference | `docs/architecture/architecture.md` |

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

**Information-only platform.** Cedar summarizes what changed and why it matters. Cedar does NOT provide legal advice or practice-specific directives. Every AI-generated summary and analysis carries a disclaimer.

**Core value proposition:** Practice owners currently find out about regulatory changes reactively — through attorney calls, newsletters, social media, or word of mouth. Cedar makes that awareness continuous, automated, and documented. When something changes, the practice knows within the hour, with a plain-language summary, potential impact analysis, a readable view of the source material, and a direct link to the original .gov or board site.

**Tiers (current):**
- Monitor ($99/mo): change feed, email alerts, audit trail, regulation library, source access
- Intelligence ($199/mo): all Monitor + Q&A, knowledge graph, attorney-reviewed content, weekly digest, push notifications

Additional tiers and pricing will evolve. Build the system so tiers are configuration, not code.

**Attorney-reviewed content:** Weekly or biweekly attorney reviews, articles, and FAQ updates addressing the most significant regulatory changes. This is a future component of the Intelligence tier — the review infrastructure (HITL layer, review_rules, reviewer role) exists to support it.

## MVP Scope

10 initial Florida sources (3 gov API, 7 web scrape). Two-agent Claude intelligence pipeline (relevance filter + classifier). Supabase append-only store. Resend email alerts. Dashboard with change feed, source library, regulation library, audit trail. WorkOS auth.

**Current phase:** Initial corpus build — populating the regulation library with the current state of all relevant laws, regulations, and rules from each source, then enabling ongoing change detection against that baseline.

Success criteria: All sources producing real regulatory data, AI summaries accurate and linked to original sources, audit trail correct, alerts delivered within 1 hour of detection.

## Dev Server Startup (Important)

When running inside Claude Code, its shell environment injects `ANTHROPIC_API_KEY=` (empty string). Next.js follows shell env priority over `.env.local`, so the key would be empty in Inngest step callbacks. **Always start the dev server with:**

```bash
pnpm dev
```

This runs `turbo dev --filter=web` which handles the env unset via the launch config.

Or use the explicit form:

```bash
cd apps/web && env -u ANTHROPIC_API_KEY npx next dev --port 3000
```

Without unsetting the shell variable, Claude API calls in intelligence agents will fail with authentication errors.

## Access Tokens and API Keys

All secrets are stored in `.env.local` (local dev) and Vercel environment variables (production). Never commit secrets to this file or any version-controlled file.

- **Supabase Access Token** — set in Supabase dashboard, used by CLI
- **Vercel Access Token (cedar-deploy)** — set in Vercel dashboard
- **ANTHROPIC_API_KEY** — set in .env.local and Vercel env vars
- **BROWSERBASE_PROJECT_ID** — set in .env.local and Vercel env vars
- **BROWSERBASE_API_KEY** — set in .env.local and Vercel env vars
- **RESEND_API_KEY** — set in .env.local and Vercel env vars
- **GitHub PAT (cedar-deploy)** — stored locally, used for git push auth

## Design System

Cedar uses Supabase's open-source design system (packages/ui), with a live documentation app at `apps/design-system/`.

### Key conventions
- Components import from `'ui'` (atoms) and `'ui-patterns/...'` (fragments)
- Styling uses Tailwind v3 utility classes (`tailwindcss: 3.4.1`)
- Theme CSS canonical location is `packages/ui/build/css/` (gitignore negation preserves it)
- Theme switching uses `.dark` class via next-themes (light / dark / classic-dark)
- Brand colors are Supabase green (customize later in `packages/config/default-colors.js`)
- For adding/modifying design system components, see `apps/design-system/AUTHORING.md`

### Semantic color tokens
- `text-foreground`, `text-foreground-light`, `text-foreground-muted`
- `text-brand`, `text-destructive`, `text-warning`
- `bg-background` (page) → `bg-surface-75` (subtle) → `bg-surface-100` (panels) → `bg-surface-200` (cards/hover)
- `border-default`, `border-strong`

### Removed systems (do NOT use)
- `@radix-ui/themes` — gone entirely
- `--cedar-*` CSS tokens — gone entirely
- Tailwind v4 `@import "tailwindcss"` — replaced by v3 `@tailwind` directives
- `remixicon` — replaced by `lucide-react` from packages/ui
- `tw-animate-css` — replaced by `tailwindcss-animate` in packages/config

### Role vs Tier
- **Role** (admin, intelligence, monitor) — determines permissions and nav visibility
- **Tier** (monitor, intelligence) — determines subscription features and billing
- Never conflate these. Admin accounts have no subscription tier.

## Frontend Structure

Before creating new pages, modifying layouts, or changing component hierarchy, read
`docs/design-system/frontend-standards.md` for semantic HTML rules, heading hierarchy,
landmark structure, and accessibility markup. This document complements the design system —
the design system governs visual styling, this document governs HTML structure.

## Reference Documents

- `docs/architecture/data-architecture-research.md` — taxonomy, classification, relationship model, schema additions
- `docs/wireframes/library-v2.jsx` — regulatory library wireframe with architectural context in header comments
- `docs/sources/FL-Cedar_Regulatory_Monitoring_Sources.xlsx` — 71+ monitoring sources across 4 sheets (primary sources, priority matrix, board meetings, additional sources)

## Generating Updated Types

After pushing migrations to Supabase:

```bash
npx supabase gen types typescript --project-id serumeiwrvtwisibuawe > lib/db/types.ts
```

## Supabase Prompt References

Before writing any Supabase-related code — migrations, RLS policies, database functions, Edge Functions, Realtime subscriptions, auth client setup, or raw SQL — read the relevant prompt file(s) in `docs/supabase-prompts/` and follow their conventions:

| When you're writing...                     | Read this file first                          |
| ------------------------------------------ | --------------------------------------------- |
| Any SQL (queries, migrations, schema)      | `docs/supabase-prompts/sql-style-guide.md`    |
| A new migration file                       | `docs/supabase-prompts/create-migration.md`   |
| RLS policies                               | `docs/supabase-prompts/create-rls-policies.md`|
| Database functions or triggers             | `docs/supabase-prompts/create-functions.md`   |
| Declarative schema changes                 | `docs/supabase-prompts/declarative-schema.md` |
| Edge Functions                             | `docs/supabase-prompts/edge-functions.md`     |
| Supabase Auth (client, server, proxy)      | `docs/supabase-prompts/nextjs-auth.md`        |
| Realtime (broadcast, presence, triggers)   | `docs/supabase-prompts/realtime.md`           |
| Adding/modifying a UI component            | `apps/design-system/AUTHORING.md`             |

Multiple files may apply to a single task. For example, writing a migration that adds a table with RLS policies requires reading `sql-style-guide.md`, `create-migration.md`, and `create-rls-policies.md`.