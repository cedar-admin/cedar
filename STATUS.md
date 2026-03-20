# Cedar — Build Status
Last updated: March 19, 2026 by Opus Session 17

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
| 7. Audit Trail + KG | ⚙️ Partial | Append-only trigger, chain validator, weekly cron all work. KG entity writes inline in monitor.ts. Corpus seed COMPLETE — 98,777 entities. Phase 2 relationship enrichment + daily pipelines complete. Phase 3 scoring functions built (not yet triggered). audit/snapshot.ts is a stub |
| 8. Delivery | ✅ Complete | HTML/plaintext email, HMAC-signed acknowledge links, AI disclaimer, structured diff rendering |
| 9. Dashboard | ⚙️ Partial | 16 pages rendering with real data. Library rewritten as hierarchical category grid → regulation list → 4-tab detail view. Settings toggles persist. |

## Codebase Stats
- **~18,529 lines** TypeScript/TSX across ~152 files
- **27** Supabase migrations (001-027)
- **16** dashboard routes, **9** API routes
- **29** shadcn/ui components, **13** custom shared components
- **79** git commits on main
- Build: ✅ Clean (0 errors, 0 warnings)

## Last Session Summary
Session 17 implemented the Phase 4 Regulatory Library Dashboard (PRP: `phase-4-regulatory-library-dashboard.md`). Replaced the flat-list library page with a hierarchical, category-driven experience: category grid landing → regulation list → 4-tab detail view (Overview, Reader, Timeline, Related). Created 8 new shared components (ConfidenceBadge, AuthorityBadge, ServiceLineTag, DeadlineChip, DomainCard, RegulationRow, ContentReader, RelationshipCard). Added practice-type filter pills to the landing page using `kg_domain_practice_type_map`. Category detail page uses full-text search via `search_vector` (@@) replacing old `ilike` pattern, with sub-domain navigation badges and pagination. Regulation detail page fetches all tab data in parallel (classification log, versions, relationships, service lines, domains, practice relevance). Sidebar updated with "Ask Cedar" (disabled, SOON badge) and "My Practice". BreadcrumbNav suppressed on library sub-pages (custom DB-powered breadcrumbs instead). Token audit and build both pass clean. **Note: Phase 3 scoring pipelines have NOT been triggered yet — `kg_entity_domains`, `kg_entity_practice_relevance`, `kg_service_line_regulations`, and `authority_level` are all empty. The library UI handles this gracefully with empty states but will not show categorized data until the pipelines run.**

## Next Session Priority
1. **Trigger Phase 3 scoring pipeline** (in order via Inngest dev dashboard) — this is the critical prerequisite for the library to show real categorized data:
   - `cedar/corpus.classify` — populates `kg_entity_domains` (assigns ~99K entities to taxonomy domains)
   - `cedar/corpus.authority-classify` — populates `authority_level` + `issuing_agency`
   - `cedar/corpus.practice-score` — populates `kg_entity_practice_relevance`; refreshes both views
   - `cedar/corpus.service-line-map` — populates `kg_service_line_regulations`
2. **Verify scoring results** and confirm library UI populates: category grid shows regulation counts, practice-type filter pills filter domains, category detail lists entities with badges, detail page shows classification audit trail
3. **LibraryBrowser cleanup** — `components/LibraryBrowser.tsx` is no longer imported by any page (replaced by inline search/filter in category detail); consider removing or repurposing

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
- `components/LibraryBrowser.tsx` is now orphaned — no longer imported after library page rewrite; can be removed
- Phase 3 scoring functions not yet triggered — `kg_entity_practice_relevance`, `kg_service_line_regulations`, `authority_level` are all empty until the pipeline runs; `mv_practice_relevance_summary` will show 0 `total_regulations` for all rows
- Supabase CLI binary not installed via npm (broken symlink in node_modules/.bin); use cached npx path: `/Users/anthonyrilling/.npm/_npx/b96a6bd565c470ce/node_modules/supabase/bin/supabase` with `SUPABASE_ACCESS_TOKEN` env var set

## Blockers
- Railway/Docling deployment needed for Module 4 (PDF processing)
- FR daily poll and eCFR daily check not yet tested against live data — must run manually via Inngest

## Environment
- Vercel: cedar-beta.vercel.app (auto-deploy from main)
- Credentials configured in Vercel: Oxylabs ✅, Browserbase ✅, Resend ✅, WorkOS ✅, Inngest ✅, Stripe ✅, GITHUB_PAT ✅, SUPABASE_ACCESS_TOKEN ✅, VERCEL_TOKEN ✅, ADMIN_SECRET ✅
- Supabase migrations: 26 applied to production ✅
- Practices in production: 2 (delivery recipients configured)
- kg_entities in production: 98,777 (seeded March 19, 2026)
