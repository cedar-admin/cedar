# Cedar — Build Status
Last updated: March 23, 2026 by Session 29

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
Session 30 completed the entire Part 1 research pipeline (25 sessions, ~800KB of output).

**What was built:**
- Ran P1_S4 through P1_S8-C — all remaining Part 1 sessions
- Fixed manifest race condition: `acquireLock`/`releaseLock` refactored to accept path param; `acquireGitLock`/`releaseGitLock` added to serialize git add→pull→commit→push across parallel sessions
- Fixed `git pull --rebase` blocking on unstaged manifest writes: switched to `--autostash`
- Fixed splinter context bloat: `applySplinter` now uses per-child `context_inputs` when AI provides them; splintering prompt now injects context file sizes so the AI can pick a minimal subset; all S8 sub-sessions patched to slim context [S2-F + S4 + S7-C] (~50K tokens vs 178K)
- Fixed orphaned process issue: sessions that were launched with `&` inside a single background task got SIGHUP'd mid-API-call; now always launching each session as a separate background task

**Part 1 outputs produced:**
- S1, S2-A–F: CFR scope + allowlists (which 458 CFR parts across all 50 titles are relevant)
- S3: Non-CFR classification signals (Federal Register, state boards, web sources)
- S4, S5-A/B, S6-A/B, S7-A/B/C: 9-domain taxonomy (L1–L6) organized around practice compliance needs
- S8-A–C: CFR part → domain code mappings, agency → domain, openFDA → domain, SQL seed template

**Key P1 finding:** 458 rule-based classification rules; estimated 85% of eCFR entities coverable by rules, 25% of web-scraped content requires AI fallback. This is the input P2 needs to design the classification pipeline.

## Research Pipeline State
```
DAG Status:
  ✅ complete: 25
  🔀 splintered: 7 (P1_S2, P1_S5, P1_S6, P1_S7, P1_S8, P1_S8-A, P1_S8-B)
  📋 planned: 2 (P2, P3)
  🟢 ready: 0 (P2 and P3 held pending Opus regroup)

Progress: 32/34 sessions complete/splintered
```

## Next Session Priority
**Research pipeline — P2 and P3 are ready but HELD.**
Owner needs to regroup with Opus in claude.ai before running P2 (Classification Pipeline, Embeddings, Cost Model) and P3 (Non-Federal Sources, Authority Levels, Ingestion Protocol). Do not auto-run these.

When ready:
1. Review Part 1 outputs in `research/outputs/part1/` — especially S8-C (implementation reference + SQL seed template) and S4 (taxonomy)
2. Run `npm run research -- run P2` then `npm run research -- run P3`

**Previous priorities (still pending):**
- **Trigger Phase 3 scoring pipeline** (in order via Inngest dev dashboard — start dev server first with `env -u ANTHROPIC_API_KEY npx next dev --port 3000`):
   - `cedar/corpus.classify` — populates `kg_entity_domains`
   - `cedar/corpus.authority-classify` — populates `authority_level` + `issuing_agency`
   - `cedar/corpus.practice-score` — populates `kg_entity_practice_relevance`; refreshes views
   - `cedar/corpus.service-line-map` — populates `kg_service_line_regulations`
- **Verify library UI** after pipeline runs
- **Visual spot-check** admin pages in dark mode

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
