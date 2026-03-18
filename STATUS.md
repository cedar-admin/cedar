# Cedar — Build Status
Last updated: March 18, 2026 by Sonnet Session 8

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
- **~13,600 lines** TypeScript/TSX across ~125 files
- **18** Supabase migrations (001-018)
- **15** dashboard routes, **8** API routes
- **29** shadcn/ui components, **4** custom shared components
- **34** git commits on main
- Build: ✅ Clean (0 errors, 0 warnings)

## Last Session Summary
Session 8 (Sonnet) executed the design-system-refactor PRP — pure token/class migration, no logic or layout changes:
- **`components/admin/SlideOverPanel.tsx`** (RENAMED from `PracticeSlideOver.tsx`): Component and props interface renamed to `SlideOverPanel` / `SlideOverPanelProps`. Import updated in `PracticesTable.tsx`.
- **`components/admin/SlideOverPanel.tsx`**: Scrim `bg-black/50 dark:bg-black/70` → `bg-scrim animate-scrim-in !m-0`. Panel: `+animate-panel-in-right !m-0`. Close `<button>` → `<Button variant="ghost" size="icon">`. `!m-0` added to both fixed-position elements to override parent `space-y-6` margin inheritance.
- **`components/Sidebar.tsx`**: Added `Button` import. Expand/collapse `<button>` → `<Button variant="ghost" size="icon" rounded-none>`. `<aside>` hardcoded `transition-all duration-200 ease-in-out` → inline `style={{ transition: 'all var(--duration-base) var(--ease-standard)' }}`.
- **`app/onboarding/OnboardingForm.tsx`**: Both plan-selector `<button>` → `<Button variant="ghost" h-auto rounded-none w-full justify-start transition-interactive>`.
- **`app/(dashboard)/library/[id]/LibraryDetailTabs.tsx`**: Tab `<button>` → `<Button variant="ghost" h-auto rounded-none hover:bg-transparent transition-interactive>`.
- Token audit: ✅ 0 errors. Build: ✅ Clean.

## Next Session Priority
1. **HITL rule-matching logic** — `review_rules` table exists but rules aren't evaluated in the pipeline

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
