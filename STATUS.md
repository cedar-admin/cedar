# Cedar — Build Status
Last updated: March 18, 2026 by Sonnet Session 11

## Module Status
| Module | Status | Notes |
|--------|--------|-------|
| 1. Data Layer | ✅ Complete | 19 migrations, RLS, config tables, 10 seed sources |
| 2. Orchestration | ✅ Complete | 7 Inngest functions registered (3 real, 3 stubs, 1 deferred) |
| 3. Source Fetching | ✅ Complete | Gov APIs + Oxylabs + BrowserBase + auto-escalating dispatcher |
| 4. Doc Processing | 🔲 Blocked | Railway/Docling deploy needed for PDF extraction |
| 5. Change Detection | ✅ Complete | SHA-256, chain hash, structured diff (DiffBlock[] JSONB) |
| 6. Intelligence | ⚙️ MVP Complete | 2-agent pipeline (relevance filter + classifier). Agent 3 (Ontology) deferred to 1.0 Full |
| 6B. HITL Review | ⚙️ Partial | Reviews page + approve/reject API routes work. review_rules table exists but rule-matching logic incomplete. |
| 7. Audit Trail + KG | ⚙️ Partial | Append-only trigger, chain validator, weekly cron all work. KG entity writes inline in monitor.ts. audit/snapshot.ts is a stub |
| 8. Delivery | ✅ Complete | HTML/plaintext email, HMAC-signed acknowledge links, AI disclaimer, structured diff rendering |
| 9. Dashboard | ⚙️ Partial | 15 pages rendering with real data. Settings notification toggles now persist. |

## Codebase Stats
- **~14,700 lines** TypeScript/TSX across ~126 files
- **19** Supabase migrations (001-019)
- **15** dashboard routes, **8** API routes
- **29** shadcn/ui components, **5** custom shared components
- **48** git commits on main
- Build: ✅ Clean (0 errors, 0 warnings)

## Last Session Summary
Session 11 (Sonnet) executed the pipeline-proof-of-life PRP — code and infrastructure prep for the first end-to-end pipeline test:

**Code changes (committed + deployed):**
- **`lib/env.ts`**: Made `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_MONITOR_PRICE_ID`, `STRIPE_INTELLIGENCE_PRICE_ID` optional in Zod schema. These were blocking `getEnv()` on any server path (including Inngest functions) when Stripe isn't configured.
- **`lib/stripe.ts`**: Added explicit guard in `getStripe()` — throws clear error if key is missing instead of silently passing `undefined` to Stripe constructor.
- **`app/api/webhooks/stripe/route.ts`**: Guard `STRIPE_WEBHOOK_SECRET` before constructEvent — returns 503 if not configured.
- **`app/pricing/page.tsx`**: Use `?? ''` fallback for price IDs passed to `bind()` to satisfy TypeScript.
- **Settings persistence** (previously completed, verified): Migration 017, `app/actions/settings.ts`, `components/NotificationsForm.tsx`, `app/(dashboard)/settings/page.tsx` all in place and wired.

**Infrastructure verified:**
- All critical env vars confirmed in Vercel: Oxylabs ✅, BrowserBase ✅, Anthropic ✅, Resend ✅, Inngest ✅, Stripe ✅
- Migration `notification_prefs` (017) confirmed applied to production Supabase
- 2 practices configured in production (delivery recipients ready): `amrilling721@gmail.com` (monitor), `cedaradmin@gmail.com` (intelligence)
- `ADMIN_SECRET` missing from Vercel env vars (add if admin API routes need it)

**Pipeline NOT yet tested** — requires manual Inngest triggers (see pipeline test instructions below).

## Pipeline Test Instructions (Next Step)

The pipeline is code-complete and infrastructure-ready. The next step is to trigger it manually via the Inngest dashboard and observe results.

### Setup
```bash
# Terminal 1: Inngest dev server
npx inngest-cli@latest dev

# Terminal 2: Next.js (unset Claude Code's empty key)
env -u ANTHROPIC_API_KEY npx next dev --port 3000
```

### Source IDs (production Supabase)

**Gov API sources — test these first:**
| Source | source_id | source_url_id |
|--------|-----------|---------------|
| FDA Federal Register | `60e1eabf-7118-493d-b104-c058ba432332` | `4fef5fa7-9e35-4d08-8c59-fdc9b8a2b3d8` |
| eCFR Title 21 | `c902164d-a758-45fb-aae4-5a77b09a0115` | `77a3cf0f-f7de-4b8b-9fe8-30c4ed2449c3` |
| openFDA Drug Enforcement | `b4630a3f-417b-46c1-92b8-db9b5ba07a71` | `cd975b65-2f8e-4e89-a40c-6c84f82a62b7` |

**Oxylabs sources:**
| Source | source_id | source_url_id |
|--------|-----------|---------------|
| FL Board of Medicine | `d6cdaef7-49ba-4eef-abab-358b2b7ddb3e` | `9c3aa5ce-4a76-487f-83b7-3dff20bd8b4c` |
| FL Board of Pharmacy | `ed3464fe-2fe5-480a-8902-7c257a9891d6` | `a81107e8-566e-4b9a-8dda-2ff9bc66889f` |
| FL Dept of Health MQA | `32d376a3-f18c-48d3-bc0a-bfc90958901f` | `3a87e19a-dadc-4169-9441-af4e5a7b8777` |
| FL Board of Osteopathic Medicine | `9fa2ea15-01c0-47a4-a5b3-9eeef3ca6847` | `a527e1fb-d5f8-4277-b92f-2939ec4475a9` |
| FL Administrative Register | `668bdf11-8c00-47fa-a2e7-5151ec62bda9` | `9682c107-36b6-4d82-8b1f-c6994e8a84fa` |
| DEA Diversion Control | `0d7bbcaa-9da2-435b-85c0-e49fdffd489d` | `6832b2f9-5807-4c07-b9ad-7430217c8764` |
| FDA Compounding Guidance | `08770aca-1aad-4f2e-abe8-3ed90ab9f630` | `227eebd4-aae3-4bde-a0a8-1a38b883a59c` |

### Event payload (send in Inngest dashboard at localhost:8288)
```json
{
  "name": "cedar/source.monitor",
  "data": {
    "sourceId": "<source_id>",
    "sourceUrlId": "<source_url_id>"
  }
}
```

### Start with one gov API source, verify before expanding:
1. Send event for FDA Federal Register
2. Watch monitor-source execute all 11 steps in Inngest dashboard
3. Verify in Supabase: changes table has a record, cost_events has entries
4. Check kg_entities for a linked entity
5. Check that deliver-change-alert fired and Resend logged a send

### Verification SQL (run in Supabase SQL editor)
```sql
-- Change records
SELECT id, source_id, severity, summary, chain_sequence, agent_version, review_status, created_at
FROM changes ORDER BY created_at DESC LIMIT 10;

-- Cost events
SELECT service, operation, cost_usd, created_at
FROM cost_events ORDER BY created_at DESC LIMIT 20;

-- KG entities
SELECT id, name, entity_type, change_id, created_at
FROM kg_entities ORDER BY created_at DESC LIMIT 10;
```

## Next Session Priority
1. **Pipeline test execution** — trigger all 10 sources via Inngest, document results, fix any broken selectors or content issues
2. **HITL rule-matching logic** — `review_rules` table exists but rules aren't evaluated in the pipeline (rule query fires but only checks by severity, no complex rule matching)

## Known Issues
- FAQ page has 8 hardcoded items (intentional — gated to Intelligence tier)
- Library page has 6 hardcoded regulations (intentional — gated to Intelligence tier)
- Zero test files in the project (notable gap for a compliance platform)
- FL Administrative Register URL (`flrules.org`) has an empty `id=` param — likely needs a real rule number; may return empty content on first fetch

## Blockers
- Railway/Docling deployment needed for Module 4 (PDF processing)
- Pipeline not yet tested against real data — must run manually via Inngest

## Environment
- Vercel: cedar-beta.vercel.app (auto-deploy from main)
- Credentials configured in Vercel: Oxylabs ✅, Browserbase ✅, Resend ✅, WorkOS ✅, Inngest ✅, Stripe ✅, GITHUB_PAT ✅, SUPABASE_ACCESS_TOKEN ✅, VERCEL_TOKEN ✅
- ADMIN_SECRET: in .env.local but not confirmed in Vercel (add if admin API routes fail in production)
- Supabase migrations: 19 applied to production ✅
- Practices in production: 2 (delivery recipients configured)
