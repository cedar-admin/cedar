# Cedar — Build Status
Last updated: March 19, 2026 by Sonnet Session 13

## Module Status
| Module | Status | Notes |
|--------|--------|-------|
| 1. Data Layer | ✅ Complete | 20 migrations, RLS, config tables, 10 seed sources |
| 2. Orchestration | ✅ Complete | 8 Inngest functions registered (corpus-seed added) |
| 3. Source Fetching | ✅ Complete | Gov APIs + Oxylabs + BrowserBase + auto-escalating dispatcher |
| 4. Doc Processing | 🔲 Blocked | Railway/Docling deploy needed for PDF extraction |
| 5. Change Detection | ✅ Complete | SHA-256, chain hash, structured diff (DiffBlock[] JSONB) |
| 6. Intelligence | ⚙️ MVP Complete | 2-agent pipeline (relevance filter + classifier). Agent 3 (Ontology) deferred to 1.0 Full |
| 6B. HITL Review | ⚙️ Partial | Reviews page + approve/reject API routes work. review_rules table exists but rule-matching logic incomplete. |
| 7. Audit Trail + KG | ⚙️ Partial | Append-only trigger, chain validator, weekly cron all work. KG entity writes inline in monitor.ts. Corpus seed COMPLETE — 98,777 entities in production. audit/snapshot.ts is a stub |
| 8. Delivery | ✅ Complete | HTML/plaintext email, HMAC-signed acknowledge links, AI disclaimer, structured diff rendering |
| 9. Dashboard | ⚙️ Partial | 15 pages rendering with real data. Settings notification toggles now persist. |

## Codebase Stats
- **~14,573 lines** TypeScript/TSX across ~131 files
- **20** Supabase migrations (001-020)
- **15** dashboard routes, **9** API routes
- **29** shadcn/ui components, **5** custom shared components
- **54** git commits on main
- Build: ✅ Clean (0 errors, 0 warnings)

## Last Session Summary
Session 13 (Sonnet) debugged and fixed 5 bugs in the corpus seed pipeline, applied a database migration, and successfully populated 98,777 kg_entities in production.

**Root causes found and fixed:**
1. **Federal Register blocked by anti-bot redirect** — `api.federalregister.gov` redirects cloud IPs to `unblock.federalregister.gov`, returning HTML. Fixed: changed to `www.federalregister.gov/api/v1/documents` which works from Vercel. Both `fetchFederalRegister` and `searchFederalRegister` in `lib/fetchers/gov-apis.ts` updated.
2. **eCFR date error** — `fetchECFRStructure` used today's date but eCFR lags 1-3 days. Fixed: added `getECFRLatestDate()` helper that queries `/api/versioner/v1/titles.json` for `up_to_date_as_of` before fetching structure.
3. **eCFR Part detection** — `extractParts` checked `label_level === 'Part'` but actual values are `"Part 1"`, `"Part 2"` etc. Fixed: use `startsWith('Part ')`.
4. **openFDA wrong identifier fields** — code used `report_number` / `res_event_number` which don't exist; actual field is `recall_number` for both drug and device enforcement.
5. **Upsert constraint unrecognizable** — Migration 020 partial index (`WHERE identifier IS NOT NULL`) is not recognized by PostgREST's `ON CONFLICT` clause. Fixed: Migration 021 drops the partial index and adds a named unique constraint `kg_entities_identifier_source_key` on `(identifier, source_id)`. Applied to production.

**Corpus seed results (production):**
| Source | Entities |
|--------|----------|
| eCFR Title 21 | 264 CFR parts |
| Federal Register (FDA/DEA/FTC/HHS/CMS, 2021–2026) | 6,437 rules + 48,556 notices |
| openFDA drug enforcement | 17,520 actions |
| openFDA device enforcement | 26,000 actions (25k skip cap) |
| **TOTAL** | **98,777** |

**Files changed (committed + deployed):**
- `lib/fetchers/gov-apis.ts` — FR URL fix + eCFR date helper
- `lib/corpus/ecfr-ingest.ts` — Part detection fix
- `lib/corpus/federal-register-ingest.ts` — type mapping for title-case response values
- `lib/corpus/openfda-ingest.ts` — recall_number field fix for both endpoints
- `supabase/migrations/021_kg_entity_upsert_constraint.sql` — named unique constraint

## Pipeline Test Instructions (Next Step)

### Setup
```bash
# Terminal 1: Inngest dev server
npx inngest-cli@latest dev

# Terminal 2: Next.js (unset Claude Code's empty key)
env -u ANTHROPIC_API_KEY npx next dev --port 3000
```

### Source IDs (production Supabase)

**Gov API sources:**
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

## Next Session Priority
1. **Pipeline test execution** — corpus is seeded. Trigger all 10 sources via Inngest (`cedar/source.monitor` events), document results, fix any broken selectors or content issues. Start with one gov API source. Source IDs are in the table below.
2. **Regulation library page** — wire the Library page to show real kg_entities from Supabase (currently shows 6 hardcoded items).
3. **HITL rule-matching logic** — `review_rules` table exists but rules aren't evaluated fully in the pipeline (only severity-based lookup, no complex rule matching logic).

### Corpus Seed Verification SQL
```sql
-- Entity counts by source
SELECT s.name, COUNT(e.id) as entities
FROM kg_entities e JOIN sources s ON s.id = e.source_id
GROUP BY s.name ORDER BY entities DESC;

-- Entity counts by type
SELECT entity_type, document_type, COUNT(*) as count
FROM kg_entities GROUP BY entity_type, document_type ORDER BY count DESC;

-- Verify no duplicates
SELECT identifier, source_id, COUNT(*) as dupes
FROM kg_entities WHERE identifier IS NOT NULL
GROUP BY identifier, source_id HAVING COUNT(*) > 1;
```

## Known Issues
- FAQ page has 8 hardcoded items (intentional — gated to Intelligence tier)
- Library page has 6 hardcoded regulations — **now has real data in kg_entities, needs to be wired up**
- Zero test files in the project (notable gap for a compliance platform)
- FL Administrative Register URL (`flrules.org`) has an empty `id=` param — likely needs a real rule number; may return empty content on first fetch
- FR ingest: `PROPOSED_RULE` filter returns 0 results from the `/documents` endpoint for these agencies (confirmed via API test) — only Rules and Notices ingested

## Blockers
- Railway/Docling deployment needed for Module 4 (PDF processing)
- Pipeline not yet tested against real data — must run manually via Inngest

## Environment
- Vercel: cedar-beta.vercel.app (auto-deploy from main)
- Credentials configured in Vercel: Oxylabs ✅, Browserbase ✅, Resend ✅, WorkOS ✅, Inngest ✅, Stripe ✅, GITHUB_PAT ✅, SUPABASE_ACCESS_TOKEN ✅, VERCEL_TOKEN ✅
- ADMIN_SECRET: in .env.local but not confirmed in Vercel (add if admin API routes fail in production)
- Supabase migrations: 20 applied to production ✅
- Practices in production: 2 (delivery recipients configured)
