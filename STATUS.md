# Cedar — Build Status
Last updated: March 19, 2026 by Sonnet Session 15

## Module Status
| Module | Status | Notes |
|--------|--------|-------|
| 1. Data Layer | ✅ Complete | 26 migrations, RLS, config tables, 10 seed sources |
| 2. Orchestration | ✅ Complete | 10 Inngest functions registered (fr-daily-poll + ecfr-daily-check added) |
| 3. Source Fetching | ✅ Complete | Gov APIs + Oxylabs + BrowserBase + auto-escalating dispatcher |
| 4. Doc Processing | 🔲 Blocked | Railway/Docling deploy needed for PDF extraction |
| 5. Change Detection | ✅ Complete | SHA-256, chain hash, structured diff (DiffBlock[] JSONB) |
| 6. Intelligence | ⚙️ MVP Complete | 2-agent pipeline (relevance filter + classifier). Agent 3 (Ontology) deferred to 1.0 Full |
| 6B. HITL Review | ⚙️ Partial | Reviews page + approve/reject API routes work. review_rules table exists but rule-matching logic incomplete. |
| 7. Audit Trail + KG | ⚙️ Partial | Append-only trigger, chain validator, weekly cron all work. KG entity writes inline in monitor.ts. Corpus seed COMPLETE — 98,777 entities. Phase 2 relationship enrichment + daily pipelines complete. audit/snapshot.ts is a stub |
| 8. Delivery | ✅ Complete | HTML/plaintext email, HMAC-signed acknowledge links, AI disclaimer, structured diff rendering |
| 9. Dashboard | ⚙️ Partial | 15 pages rendering with real data. Library page now queries real kg_entities. Settings toggles persist. |

## Codebase Stats
- **~17,032 lines** TypeScript/TSX across ~136 files
- **26** Supabase migrations (001-026)
- **15** dashboard routes, **9** API routes
- **29** shadcn/ui components, **5** custom shared components
- **69** git commits on main
- Build: ✅ Clean (0 errors, 0 warnings)

## Last Session Summary
Session 15 implemented Phase 2 of the taxonomy/knowledge-graph architecture: relationship enrichment schema, entity version content-hashing, and two automated daily ingestion pipelines. Migrations 025–026 were applied directly via the Supabase Management API (Supabase CLI binary was not installed; resolved with a downloaded binary for type regeneration only). The `relationship_type_enum` Postgres type (16 values) and 5 new columns on `kg_relationships` (rel_type, effective_date, end_date, provenance, fr_citation) are live. Five new columns on `kg_entity_versions` (version_date, content_hash, content_snapshot, fr_document_number, change_summary) with a partial unique index on (entity_id, version_date) are live. `system_config` now holds `fr_last_poll_date` (initialized to 2026-03-17) and `ecfr_last_checked_date` (2026-03-16). `lib/corpus/relationship-linker.ts` provides `createRelationships()` and `matchCFREntitiesToRefs()`. `lib/corpus/cascade-detect.ts` provides `detectCascades()` (BFS depth-5, writes `kg_classification_log` with `needs_review=true`). `inngest/fr-daily-poll.ts` polls CFR titles 21/29/42/45 daily at 7 AM ET; `inngest/ecfr-daily-check.ts` detects per-part SHA-256 changes at 7:30 AM ET. Both registered in Inngest serve() route. Build clean, Vercel deployed.

## Next Session Priority
1. **Test FR daily poll** — trigger `cedar/corpus.fr-daily-poll` from Inngest dev dashboard, verify all 6 steps complete, check `kg_entities` for new rows and `kg_relationships` for `provenance='api_cfr_references'` rows.
2. **Test eCFR daily check** — trigger `cedar/corpus.ecfr-daily-check`, verify `kg_entity_versions` gets rows with `version_date IS NOT NULL`, verify `ecfr_last_checked_date` updated to today.
3. **Run corpus-classify** — trigger `cedar/corpus.classify` to populate `kg_entity_domains` and `kg_classification_log`. This validates Phase 1 end-to-end.
4. **Phase 3: Library UI** — add domain facets sidebar to the library page (query `mv_corpus_facets`), wire full-text search to `search_vector` (`@@` operator), add domain breadcrumb navigation. Generate a PRP from `docs/architecture/data-architecture-research.md` Phase 3 section.
5. **Pipeline test execution** — trigger all 10 sources via Inngest, document results, fix any broken selectors.

### Pipeline Test Setup
```bash
# Terminal 1: Inngest dev server
npx inngest-cli@latest dev

# Terminal 2: Next.js (unset Claude Code's empty key)
env -u ANTHROPIC_API_KEY npx next dev --port 3000
```

### Verification SQL (run after pipeline tests)
```sql
-- FR poll: new entities
SELECT COUNT(*) FROM kg_entities WHERE created_at > NOW() - INTERVAL '10 minutes' AND document_type = 'Rule';

-- FR poll: amends relationships
SELECT COUNT(*), provenance FROM kg_relationships
WHERE provenance IN ('api_cfr_references', 'api_correction_of') GROUP BY provenance;

-- eCFR check: new versions
SELECT COUNT(*) FROM kg_entity_versions WHERE version_date IS NOT NULL;

-- System config state
SELECT key, value FROM system_config WHERE key IN ('fr_last_poll_date', 'ecfr_last_checked_date');

-- corpus-classify: domain assignments
SELECT COUNT(*) FROM kg_entity_domains;
SELECT COUNT(*) FROM kg_classification_log;
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

## Known Issues
- FAQ page has 8 hardcoded items (intentional — gated to Intelligence tier)
- Zero test files in the project (notable gap for a compliance platform)
- FL Administrative Register URL (`flrules.org`) has an empty `id=` param — likely needs a real rule number; may return empty content on first fetch
- FR ingest: `PROPOSED_RULE` filter returns 0 results from the `/documents` endpoint for these agencies — only Rules and Notices were ingested
- Library text search still uses `ilike` (the new `search_vector` column exists but the library page query hasn't been updated to use it yet — Phase 3 work)
- `corpus-classify` not yet triggered — classification data not yet in `kg_entity_domains`; `mv_corpus_facets` will have limited rows until it runs
- Supabase CLI binary not installed via npm (broken symlink in node_modules/.bin); used downloaded binary for type gen this session. Consider `brew install supabase/tap/supabase` for future sessions.

## Blockers
- Railway/Docling deployment needed for Module 4 (PDF processing)
- FR daily poll and eCFR daily check not yet tested against live data — must run manually via Inngest

## Environment
- Vercel: cedar-beta.vercel.app (auto-deploy from main)
- Credentials configured in Vercel: Oxylabs ✅, Browserbase ✅, Resend ✅, WorkOS ✅, Inngest ✅, Stripe ✅, GITHUB_PAT ✅, SUPABASE_ACCESS_TOKEN ✅, VERCEL_TOKEN ✅, ADMIN_SECRET ✅
- Supabase migrations: 26 applied to production ✅
- Practices in production: 2 (delivery recipients configured)
- kg_entities in production: 98,777 (seeded March 19, 2026)
