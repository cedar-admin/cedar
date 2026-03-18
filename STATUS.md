# Cedar — Build Status
Last updated: March 18, 2026 by Sonnet Session 6

## Module Status
| Module | Status | Notes |
|--------|--------|-------|
| 1. Data Layer | ✅ Complete | 16 migrations, RLS, config tables, 10 seed sources |
| 2. Orchestration | ✅ Complete | 7 Inngest functions registered (3 real, 3 stubs, 1 deferred) |
| 3. Source Fetching | ✅ Complete | Gov APIs + Oxylabs + BrowserBase + auto-escalating dispatcher |
| 4. Doc Processing | 🔲 Blocked | Railway/Docling deploy needed for PDF extraction |
| 5. Change Detection | ✅ Complete | SHA-256, chain hash, structured diff (DiffBlock[] JSONB) |
| 6. Intelligence | ⚙️ MVP Complete | 2-agent pipeline (relevance filter + classifier). Agent 3 (Ontology) deferred to 1.0 Full |
| 6B. HITL Review | ⚙️ Partial | Reviews page + approve/reject API routes work. review_rules table exists but rule-matching logic incomplete. Settings toggles don't persist |
| 7. Audit Trail + KG | ⚙️ Partial | Append-only trigger, chain validator, weekly cron all work. KG entity writes inline in monitor.ts. audit/snapshot.ts is a stub |
| 8. Delivery | ✅ Complete | HTML/plaintext email, HMAC-signed acknowledge links, AI disclaimer, structured diff rendering |
| 9. Dashboard | ⚙️ Partial | 13 pages rendering with real data. Settings notification toggles now persist. Sidebar role/tier badges updated. |

## Codebase Stats
- **12,990 lines** TypeScript/TSX across 120 files
- **17** Supabase migrations (001-017)
- **14** dashboard routes, **6** API routes
- **29** shadcn/ui components, **4** custom shared components
- **30** git commits on main
- Build: ✅ Clean (0 errors, 0 warnings)

## Last Session Summary
Session 6 (Sonnet) built the admin practices management page. Created `app/(admin)/practices/page.tsx` — a read-only server component that queries all rows from the `practices` table using `createServerClient()` (service role, bypasses RLS) and renders them in a shadcn/ui Table. Displays: practice name, owner name + email, practice type, tier (styled badge — purple for Intelligence), subscription status (color-coded badge), phone, billing period end, and created date. Null fields render as em dashes. Added "Practices" (`ri-building-line`) as the first entry in `ADMIN_NAV` in `components/Sidebar.tsx`. Build: ✅ Clean.

## Next Session Priority
1. **HITL rule-matching logic** — `review_rules` table exists but rules aren't evaluated in the pipeline
2. **Visual consistency pass** — interrupted during Session 3

## Known Issues
- FAQ page has 8 hardcoded items (intentional — gated to Intelligence tier)
- Library page has 6 hardcoded regulations (intentional — gated to Intelligence tier)
- Zero test files in the project (notable gap for a compliance platform)

## Blockers
- Railway/Docling deployment needed for Module 4 (PDF processing)
- Stripe env vars (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_MONITOR_PRICE_ID, STRIPE_INTELLIGENCE_PRICE_ID) may not be set in Vercel — any page calling getEnv() could throw
- Confirm all 16 migrations applied to production Supabase instance

## Environment
- Vercel: cedar-beta.vercel.app (auto-deploy from main)
- Credentials configured: Oxylabs ✅, Browserbase ✅, Resend ✅, WorkOS ✅, ADMIN_SECRET ✅, GITHUB_PAT ✅, SUPABASE_ACCESS_TOKEN ✅, VERCEL_TOKEN ✅
- Credentials pending verification: Stripe env vars, Inngest keys in Vercel
- Supabase migrations: 17 applied to production ✅
