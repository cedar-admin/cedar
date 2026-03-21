# Cedar — Build Status
Last updated: March 21, 2026 by Session 25

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
Session 25 (Session 1 of 2) built the Cedar Research Orchestrator — a standalone TypeScript CLI tool for managing the 100-session regulatory classification research DAG. This session completed Phases 1–3 of the architecture spec.

**Phase 1 — Directory structure and file placement:**
- Created full `research/` directory tree: `orchestrator/`, `prompts/` (templates, part1-3), `outputs/` (part1-3), `context-packs/` (part1-3), `prefetch/`
- Placed 5 completed research outputs into `research/outputs/part1/` (P1_S1, P1_S2-A/B/C, P1_S3)
- Placed 8 research prompts into `research/prompts/part1/`, `part2/`, `part3/` with canonical names matching the manifest
- Created 3 template files: `system-prompt.md`, `compression-prompt.md`, `splintering-prompt.md`
- Initialized orchestrator package (`package.json`, `tsconfig.json`), `npm install` succeeded (86 packages)

**Phase 2 — Manifest initialization:**
- Created `research/manifest.yaml` with all 14 sessions (P1_S1 through P3), correct statuses, dependencies, file paths, and metadata
- DAG validates with no cycles, topological sort succeeds

**Phase 3 — Orchestrator TypeScript modules (8 files, ~800 lines):**
- `types.ts` — Session, Manifest, enums (SessionStatus with 6 stored values, "ready" computed)
- `utils.ts` — File I/O with repo-root resolution, logging helpers
- `manifest.ts` — YAML load/save via js-yaml, session lookup, status updates
- `dag.ts` — Kahn's algorithm topological sort, ready-session computation, critical path, status counts
- `token-counter.ts` — Wraps `anthropic.messages.countTokens()`, `estimateSessionSize()`
- `compressor.ts` — Two-pass compression (remark-parse AST extraction + Haiku AI), validation
- `splinter.ts` — Size estimation, AI-based prompt analysis, sub-session generation
- `runner.ts` — `runApiSession()`, `prepareWebSession()`, `runBatch()`, command guards
- `index.ts` — CLI entry point routing 9 commands: status, next, run, run-batch, complete, compress, splinter, validate, cost

**Verification results:**
- `npm install`: ✅ 86 packages, 0 vulnerabilities
- TypeScript compilation: ✅ 0 errors (one minor type fix: `stop_reason` null → undefined coercion)
- `npm run research -- status`: ✅ Shows 5 complete, 1 splintered, 1 blocked, 7 planned, 1 ready (P1_S4)
- `npm run research -- next`: ✅ Correctly identifies P1_S4 as the only ready session
- Critical path computed: P1_S4 → P1_S5 → P1_S6 → P1_S7 → P1_S8 → P2

**Deviation from spec:** Created stub prompt files for completed sessions (S1, S2, S2-A/B/C, S3) since the original prompts weren't available as separate files — the manifest references them but they're only needed for provenance. Added convenience script `npm run research` to root `package.json`.

## Next Session Priority
**Session 2 of 2 — Research Orchestrator Phases 4–5:**
1. **Phase 4: Generate context packs** — Run `compress` on each of the 5 completed sessions (P1_S1, P1_S2-A, P1_S2-B, P1_S2-C, P1_S3). Run `validate` to confirm all context packs are complete.
2. **Phase 5: Verification** — Run every check in the post-build verification checklist from the architecture spec (V1–V8). Fix any failures and re-run. Run `status` and `next` to display final DAG state.

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
