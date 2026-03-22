# Cedar — Build Status
Last updated: March 22, 2026 by Session 27

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
| 9. Dashboard | ⚙️ Partial | 16 pages rendering with real data. Design system Phases 1–4 complete — all 54 UI files compliant. Settings toggles persist. |

## Codebase Stats
- **~15,867 lines** TypeScript/TSX
- **27** Supabase migrations (001-027)
- **16** dashboard routes, **9** API routes
- **0** shadcn/ui components, **21** Radix Themes composite components
- **119** git commits on main
- Build: ✅ Clean (0 errors, 0 warnings)

## Last Session Summary
Session 27 audited and fixed the research orchestrator for internal consistency, operator safety, and provenance.

**Findings (ordered by severity):**

1. **HIGH — P1_S4 prompt claimed Session 2 dependency** — The S4 prompt said "attach Sessions 1, 2, and 3" but the manifest correctly lists only P1_S1 and P1_S3. Session 2 (part-level allowlists) provides granular CFR part data consumed by Session 8, not by the L1/L2 taxonomy design. Fixed: updated prompt to match manifest, added explanatory note.

2. **HIGH — Context pack metadata hallucinations** — P1_S2-B.yaml had `session_id: "P2_S1"` (should be "P1_S2-B"), P1_S2-A.yaml had `session_id: "P1_S2"` (should be "P1_S2-A"), P1_S2-C.yaml had `session_id: "P1_S2"` (should be "P1_S2-C"). Fixed: corrected all three.

3. **MEDIUM — Completed prompt files were one-line placeholders** — S1, S2, S2-A, S2-B, S2-C, S3 prompt files contained only "session complete, see output". Fixed: replaced with provenance-preserving placeholders including session ID, title, output/context-pack paths, completion date, and an explicit note that the original prompt text was replaced.

4. **MEDIUM — runner.ts clipboard path fragile** — Used `path.resolve(process.cwd(), '..', '..')` instead of `resolveFromRoot()`. Functionally correct when CWD is `research/orchestrator/`, but fragile. Fixed: switched to `resolveFromRoot()`.

5. **MEDIUM — Web session operator instructions misleading** — CLI said "Paste into claude.ai → select Extended Research (Opus)" with no mention that context packs are pre-injected. Fixed: replaced with numbered operator steps noting context is already included.

6. **LOW — S5-S8 prompts say "attach files as file uploads"** — The orchestrator pre-injects context packs, so this instruction is redundant for automated runs. Not fixed (scope limit) — flagged as residual risk.

7. **LOW — P3 manifest dependencies don't include P2** — The P3 mega-prompt says it depends on "Session 2 output" (meaning Part 2). The manifest note says "splintered sub-sessions will have refined dependencies." Accepted as intentional — the mega-prompt will be splintered before running.

8. **LOW — saveManifest strips YAML comments** — js-yaml doesn't preserve comments. The `run` command calls saveManifest, which strips all section dividers and inline comments from manifest.yaml. Not fixed (inherent js-yaml limitation) — flagged as residual risk.

**Validation results (all pass):**
- `npm run research -- status`: DAG valid, 5 complete, 1 splintered, 1 blocked, 7 planned, 1 ready (P1_S4)
- `npm run research -- next`: P1_S4 correctly identified as only ready session
- Dry P1_S4 package generation: context includes P1_S1 + P1_S3 packs (correct), no Session 2 content, prompt references "Sessions 1 and 3" (correct)
- Context pack metadata: all 5 packs have correct session_ids after fixes

## Research Pipeline State
```
DAG Status:
  ✅ complete: 5 (P1_S1, P1_S2-A, P1_S2-B, P1_S2-C, P1_S3)
  🔀 splintered: 1 (P1_S2)
  🔴 blocked: 1 (P1_S2-D)
  📋 planned: 7 (P1_S4 through P1_S8, P2, P3)
  🟢 ready: 1 (P1_S4)

Critical path: P1_S4 → P1_S5 → P1_S6 → P1_S7 → P1_S8 → P2
Progress: 6/14 sessions complete/splintered

Next session ready: P1_S4 [WEB] — Domain Taxonomy L1/L2 Structure
  Dependencies: P1_S1 ✅, P1_S3 ✅
  Run: npm run research -- run P1_S4
```

## Next Session Priority
**Research pipeline execution — begin P1_S4:**
1. Run `npm run research -- run P1_S4` to prepare web session package
2. Execute in claude.ai, save output to `research/outputs/part1/P1_S4.md`
3. Run `npm run research -- complete P1_S4` to generate context pack and unlock P1_S5

**Previous priorities (still pending after orchestrator work):**
3. **Trigger Phase 3 scoring pipeline** (in order via Inngest dev dashboard — start dev server first with `env -u ANTHROPIC_API_KEY npx next dev --port 3000`):
   - `cedar/corpus.classify` — populates `kg_entity_domains`
   - `cedar/corpus.authority-classify` — populates `authority_level` + `issuing_agency`
   - `cedar/corpus.practice-score` — populates `kg_entity_practice_relevance`; refreshes views
   - `cedar/corpus.service-line-map` — populates `kg_service_line_regulations`
4. **Verify library UI** after pipeline runs
5. **Visual spot-check** admin pages in dark mode

### Dev Server Startup
```bash
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

## Known Issues
- FAQ page has 8 hardcoded items (intentional — gated to Intelligence tier)
- Zero test files in the project (notable gap for a compliance platform)
- FL Administrative Register URL (`flrules.org`) has an empty `id=` param — likely needs a real rule number
- FR ingest: `PROPOSED_RULE` filter returns 0 results — only Rules and Notices were ingested
- Phase 3 scoring functions not yet triggered — library category counts will show 0 until pipeline runs
- Supabase CLI binary not installed via npm (broken symlink); use cached npx path: `/Users/anthonyrilling/.npm/_npx/b96a6bd565c470ce/node_modules/supabase/bin/supabase` with `SUPABASE_ACCESS_TOKEN` env var set
- Production Supabase instance needs migration reset — all 27 migrations rewritten for best practices audit
- `changes/page.tsx` severity filter tabs use a local `SEVERITY_ACTIVE_CLASS` map (Radix color props can't be used on `<Link>` elements directly) — acceptable but note for future design system audit

## Blockers
- Railway/Docling deployment needed for Module 4 (PDF processing)

## Environment
- Vercel: cedar-beta.vercel.app (auto-deploy from main)
- Credentials configured in Vercel: Oxylabs ✅, Browserbase ✅, Resend ✅, WorkOS ✅, Inngest ✅, Stripe ✅, GITHUB_PAT ✅, SUPABASE_ACCESS_TOKEN ✅, VERCEL_TOKEN ✅, ADMIN_SECRET ✅
- Supabase migrations: 26 applied to production ✅
- Practices in production: 2 (delivery recipients configured)
- kg_entities in production: 98,777 (seeded March 19, 2026)
