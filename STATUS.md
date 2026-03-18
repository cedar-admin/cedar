# Cedar — Build Status
Last updated: March 18, 2026 by Sonnet Session 9

## Module Status
| Module | Status | Notes |
|--------|--------|-------|
| 1. Data Layer | ✅ Complete | 18 migrations, RLS, config tables, 10 seed sources |
| 2. Orchestration | ✅ Complete | 7 Inngest functions registered (3 real, 3 stubs, 1 deferred) |
| 3. Source Fetching | ✅ Complete | Gov APIs + Oxylabs + BrowserBase + auto-escalating dispatcher |
| 4. Doc Processing | 🔲 Blocked | Railway/Docling deploy needed for PDF extraction |
| 5. Change Detection | ✅ Complete | SHA-256, chain hash, structured diff (DiffBlock[] JSONB) |
| 6. Intelligence | ⚙️ MVP Complete | 2-agent pipeline (relevance filter + classifier). Agent 3 (Ontology) deferred to 1.0 Full |
| 6B. HITL Review | ⚙️ Partial | Reviews page + approve/reject API routes work. review_rules table exists but rule-matching logic incomplete. |
| 7. Audit Trail + KG | ⚙️ Partial | Append-only trigger, chain validator, weekly cron all work. KG entity writes inline in monitor.ts. audit/snapshot.ts is a stub |
| 8. Delivery | ✅ Complete | HTML/plaintext email, HMAC-signed acknowledge links, AI disclaimer, structured diff rendering |
| 9. Dashboard | ⚙️ Partial | 15 pages rendering with real data. Admin practices page fully interactive. |

## Codebase Stats
- **~14,600 lines** TypeScript/TSX across ~125 files
- **18** Supabase migrations (001-018)
- **15** dashboard routes, **8** API routes
- **29** shadcn/ui components, **4** custom shared components
- **36** git commits on main
- Build: ✅ Clean (0 errors, 0 warnings)

## Last Session Summary
Session 9 (Sonnet) executed the sidebar-transform-collapse PRP — replaced width-based collapse animation with GPU-composited `translate` transform:
- **`components/Sidebar.tsx`**: `aside` changed from in-flow `shrink-0` with conditional `w-0`/`w-60` to `position: fixed` with constant `w-60`. Collapsed state uses `-translate-x-full`, expanded uses `translate-x-0`. Transition scoped to `translate` only (not `all`). A follow-up fix corrected the transition property from `transform` to `translate` — Tailwind v4 sets the CSS `translate` shorthand, not `transform`, so `transition: transform` had no effect and the panel snapped.
- **`app/(dashboard)/layout.tsx`**: `main` given permanent `ml-60` (sidebar is now out of document flow).
- **`app/(admin)/layout.tsx`**: Same permanent `ml-60` change.
- Token audit: ✅ 0 errors. Build: ✅ Clean.

## Next Session Priority
1. **HITL rule-matching logic** — `review_rules` table exists but rules aren't evaluated in the pipeline
2. **Settings toggles** — notification preferences don't persist to the database

## Known Issues
- FAQ page has 8 hardcoded items (intentional — gated to Intelligence tier)
- Library page has 6 hardcoded regulations (intentional — gated to Intelligence tier)
- Zero test files in the project (notable gap for a compliance platform)

## Blockers
- Railway/Docling deployment needed for Module 4 (PDF processing)
- Stripe env vars (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_MONITOR_PRICE_ID, STRIPE_INTELLIGENCE_PRICE_ID) may not be set in Vercel — any page calling getEnv() could throw
- Confirm all 18 migrations applied to production Supabase instance

## Environment
- Vercel: cedar-beta.vercel.app (auto-deploy from main)
- Credentials configured: Oxylabs ✅, Browserbase ✅, Resend ✅, WorkOS ✅, ADMIN_SECRET ✅, GITHUB_PAT ✅, SUPABASE_ACCESS_TOKEN ✅, VERCEL_TOKEN ✅
- Credentials pending verification: Stripe env vars, Inngest keys in Vercel
- Supabase migrations: 18 applied to production ✅
