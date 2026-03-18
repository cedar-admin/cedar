# Cedar — Build Status
Last updated: March 17, 2026 by Opus Session 3

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
| 9. Dashboard | ⚙️ Partial | 13 pages rendering with real data. Settings page toggles don't persist. Sidebar role/tier badges not updated |

## Codebase Stats
- **12,717 lines** TypeScript across 119 files
- **16** Supabase migrations (001-016)
- **13** dashboard routes, **6** API routes
- **29** shadcn/ui components, **4** custom shared components
- **20** git commits on main
- Build: ✅ Clean (0 errors, 0 warnings)

## Last Session Summary
Session 3 (Opus) performed a comprehensive codebase audit across 8 categories, applied 8 targeted fixes (HITL migration, unsafe JSON parsing, ADMIN_SECRET validation, admin role enforcement, HMAC token signing, env access cleanup, type cast removal, secret stripping from CLAUDE.md), and began a systematic UI overhaul. Created shared components (SeverityBadge, StatusBadge, EmptyState, DataList) and rewrote 6 pages to use them, eliminating ~300 lines of duplication. Added reviews page with filter tabs and detail page.

## Next Session Priority
1. **Settings page persistence** — notification toggles render but don't save to database
2. **HITL rule-matching logic** — review_rules table exists but rules aren't evaluated in the pipeline
3. **Sidebar role/tier badges** — admin vs practice owner distinction
4. **Visual consistency pass** — interrupted during Session 3

## Known Issues
- Settings page notification toggles render but don't persist (user-visible broken behavior)
- Admin accounts still see subscription-related fields in settings (should show "Role: Admin" only)
- FAQ page has 8 hardcoded items (intentional — gated to Intelligence tier)
- Library page has 6 hardcoded regulations (intentional — gated to Intelligence tier)
- Zero test files in the project (notable gap for a compliance platform)

## Blockers
- Railway/Docling deployment needed for Module 4 (PDF processing)
- Stripe env vars (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_MONITOR_PRICE_ID, STRIPE_INTELLIGENCE_PRICE_ID) may not be set in Vercel — any page calling getEnv() could throw
- Confirm all 16 migrations applied to production Supabase instance

## Environment
- Vercel: cedar-beta.vercel.app (auto-deploy from main)
- Credentials configured: Oxylabs ✅, Browserbase ✅, Resend ✅, WorkOS ✅, ADMIN_SECRET ✅
- Credentials pending verification: Stripe env vars, Inngest keys in Vercel
- Supabase migrations: 16 in repo (verify all applied to production)
