# Cedar — Build Status
Last updated: March 19, 2026 by Sonnet Session 14

## Module Status
| Module | Status | Notes |
|--------|--------|-------|
| 1. Data Layer | ✅ Complete | 21 migrations, RLS, config tables, 10 seed sources |
| 2. Orchestration | ✅ Complete | 8 Inngest functions registered (corpus-seed added) |
| 3. Source Fetching | ✅ Complete | Gov APIs + Oxylabs + BrowserBase + auto-escalating dispatcher |
| 4. Doc Processing | 🔲 Blocked | Railway/Docling deploy needed for PDF extraction |
| 5. Change Detection | ✅ Complete | SHA-256, chain hash, structured diff (DiffBlock[] JSONB) |
| 6. Intelligence | ⚙️ MVP Complete | 2-agent pipeline (relevance filter + classifier). Agent 3 (Ontology) deferred to 1.0 Full |
| 6B. HITL Review | ⚙️ Partial | Reviews page + approve/reject API routes work. review_rules table exists but rule-matching logic incomplete. |
| 7. Audit Trail + KG | ⚙️ Partial | Append-only trigger, chain validator, weekly cron all work. KG entity writes inline in monitor.ts. Corpus seed COMPLETE — 98,777 entities in production. audit/snapshot.ts is a stub |
| 8. Delivery | ✅ Complete | HTML/plaintext email, HMAC-signed acknowledge links, AI disclaimer, structured diff rendering |
| 9. Dashboard | ⚙️ Partial | 15 pages rendering with real data. Library page now queries real kg_entities. Settings toggles persist. |

## Codebase Stats
- **~15,282 lines** TypeScript/TSX across ~132 files
- **24** Supabase migrations (001-024)
- **15** dashboard routes, **9** API routes
- **29** shadcn/ui components, **5** custom shared components
- **67** git commits on main
- Build: ✅ Clean (0 errors, 0 warnings)

## Last Session Summary
Session 14 implemented Phase 1 of the taxonomy architecture: schema extensions, full-text search indexes, domain taxonomy seed data, and the rule-based classification Inngest function. Three migrations (022–024) were applied to production Supabase cleanly. Migration 021 had been applied manually in the prior session but not tracked by the CLI — repaired with `supabase migration repair` before pushing 022–024.

**Schema additions (022):** Extended `kg_domains` (depth, domain_code, taxonomy_source), `kg_entity_domains` (relevance_score, classified_by, classified_at, is_primary), `classification_rules` (stage, confidence_threshold); added `authority_level_enum` + `issuing_agency` on `kg_entities`; created 9 new tables: `kg_practice_types`, `kg_entity_practice_relevance`, `kg_classification_log`, `kg_service_lines`, `kg_service_line_regulations`, `practice_profiles`, `practice_service_lines`, `practice_staff`, `practice_equipment`.

**Search indexes (023):** `pg_trgm` extension, `search_vector` tsvector column populated for all 98,777 entities with auto-update trigger, GIN search index, trigram GIN on name, JSONB expression indexes, `mv_corpus_facets` materialized view with `refresh_corpus_facets()` RPC.

**Taxonomy seed (024):** 10 L1 root domains, 55 L2 topic domains, 50 L3 specific requirement areas; 14 practice types (10 Cedar targets, NUCC-coded); 10 service lines (8 Cedar targets) with regulation_domain arrays.

**Classification function:** `inngest/corpus-classify.ts` — event `cedar/corpus.classify`, 22 rules (CFR title/part ranges, agency matching, keyword matching), batches of 500 entities, writes to `kg_entity_domains` (UPSERT) + `kg_classification_log` (INSERT), refreshes `mv_corpus_facets` on completion. Registered in Inngest serve() route. Types regenerated.

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
1. **Run corpus-classify** — trigger `cedar/corpus.classify` from Inngest dev dashboard, watch all batches complete, verify `kg_entity_domains` and `kg_classification_log` have rows. Check classification distribution by domain. This validates Phase 1 end-to-end.
2. **Phase 2: Library UI** — add domain facets sidebar to the library page (query `mv_corpus_facets`), wire full-text search to `search_vector` (`@@` operator), add domain breadcrumb navigation. Phase 2 PRP should be generated from the data-architecture-research.md Phase 2 section.
3. **Pipeline test execution** — trigger all 10 sources via Inngest (`cedar/source.monitor` events), document results, fix any broken selectors or content issues.
4. **HITL rule-matching logic** — `review_rules` table exists but rule-matching is incomplete in the pipeline.
5. **audit/snapshot.ts** — currently a stub; complete the snapshot export for the audit trail page PDF export.

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
- Zero test files in the project (notable gap for a compliance platform)
- FL Administrative Register URL (`flrules.org`) has an empty `id=` param — likely needs a real rule number; may return empty content on first fetch
- FR ingest: `PROPOSED_RULE` filter returns 0 results from the `/documents` endpoint for these agencies — only Rules and Notices were ingested
- Library text search still uses `ilike` (the new `search_vector` column exists but the library page query hasn't been updated to use it yet — Phase 2 work)
- `corpus-classify` not yet triggered — classification data not yet in `kg_entity_domains`; `mv_corpus_facets` will have limited rows until it runs

## Blockers
- Railway/Docling deployment needed for Module 4 (PDF processing)
- Pipeline not yet tested against real data — must run manually via Inngest

## Environment
- Vercel: cedar-beta.vercel.app (auto-deploy from main)
- Credentials configured in Vercel: Oxylabs ✅, Browserbase ✅, Resend ✅, WorkOS ✅, Inngest ✅, Stripe ✅, GITHUB_PAT ✅, SUPABASE_ACCESS_TOKEN ✅, VERCEL_TOKEN ✅, ADMIN_SECRET ✅
- Supabase migrations: 21 applied to production ✅
- Practices in production: 2 (delivery recipients configured)
- kg_entities in production: 98,777 (seeded March 19, 2026)
