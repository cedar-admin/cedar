# Cedar — Build Status
Last updated: March 24, 2026 by Session 46

## Module Status
| Module | Status | Notes |
|--------|--------|-------|
| 1. Data Layer | ✅ Complete | 28 migrations (028 adds cfr_allowlist + classification foundation), RLS, config tables, 10 seed sources |
| 2. Orchestration | ✅ Complete | 11 Inngest functions registered (classified-seed added) |
| 3. Source Fetching | ✅ Complete | Gov APIs + Oxylabs + BrowserBase + auto-escalating dispatcher |
| 4. Doc Processing | 🔲 Blocked | Railway/Docling deploy needed for PDF extraction |
| 5. Change Detection | ✅ Complete | SHA-256, chain hash, structured diff (DiffBlock[] JSONB) |
| 6. Intelligence | ⚙️ MVP Complete | 2-agent pipeline (relevance filter + classifier). Agent 3 (Ontology) deferred to 1.0 Full |
| 6B. HITL Review | ⚙️ Partial | Reviews page + approve/reject API routes work. review_rules table exists but rule-matching logic incomplete. |
| 7. Audit Trail + KG | ⚙️ Partial | Append-only trigger, chain validator, weekly cron all work. KG entity writes inline in monitor.ts. Corpus seed COMPLETE — 98,777 entities. Phase 2 relationship enrichment + daily pipelines complete. Phase 3 scoring functions built (not yet triggered). audit/snapshot.ts is a stub. **PRP-02 classification engine built** — lib/classification/ module (7 files, pure function, 487 DB rules). **PRP-03 classified corpus seed built** — cedar/corpus.classified-seed Inngest function; pipeline not yet triggered. |
| 8. Delivery | ✅ Complete | HTML/plaintext email, HMAC-signed acknowledge links, AI disclaimer, structured diff rendering |
| 9. Dashboard | ⚙️ Partial | 16 pages rendering with real data. Design system Phases 1–4 complete + UX normalization pass. Settings toggles persist. UI Library at /system/ui now includes denser Supabase-style navigation, 36 documented atom detail pages matching the current Radix Themes component catalog, interactive Radix-faithful menu/overlay demos, and broader live reference coverage across foundations, fragments, and patterns with collapsible implementation blocks and shared `CedarTable` usage on real product tables. |

## Codebase Stats
- **~25,083 lines** TypeScript/TSX
- **28** Supabase migrations (001-028)
- **16** dashboard routes, **9** API routes, **56** UI library detail pages (+ group landing pages for atoms, foundations, fragments, patterns)
- **0** shadcn/ui components, **26** Cedar/Radix composite components (5 new: SectionHeading, AiBadge, HashWithCopy, FilterPills, CedarTable)
- **192** git commits on main
- Build: ✅ Clean (0 errors, 0 warnings)

## Last Session Summary
Session 46 executed PRP-03 (Classified Corpus Seed). Built `inngest/classified-seed.ts` — the `cedar/corpus.classified-seed` Inngest function that fetches, filters, classifies, and stores the full regulatory corpus baseline in a single retriable pipeline. eCFR ingestion was generalized from Title 21 only to all 15 allowlist titles via a new `lib/corpus/classified-ecfr-ingest.ts` module; only parts present in `cfr_allowlist` are ingested (~407 parts total). Federal Register ingest was expanded with a `cfrTitles` filter to narrow results to healthcare-relevant documents across all 15 titles. openFDA was expanded from 2 enforcement endpoints to all 15 dataset-rule endpoints (drug/enforcement, drug/event, drug/label, drug/ndc, drug/drugsfda, device/enforcement, device/event, device/recall, device/510k, device/pma, device/registrationlisting, device/udi, food/enforcement, food/event, other/nsde), with date filters applied to high-volume event endpoints. Every ingested entity is classified inline using the PRP-02 `classify()` engine — domain assignments written to `kg_entity_domains`, audit trail to `kg_classification_log`, denormalized `domain_codes` + `classification_stage` + `authority_level` updated on `kg_entities`. Entities matching zero rules are flagged `needs_review=true` for HITL pickup. Pipeline is fully idempotent (upsert on identifier+source_id; existing enforcement entities match old corpus-seed identifiers). `classifiedSeed` registered in the Inngest route handler. **Pipeline has not yet been triggered** — must be run manually from the Inngest dashboard to populate classified corpus data for the Library page.

Session 45 executed PRP-02 (Classification Engine). Built `lib/classification/` — a 7-file, pure-function Stage 1 classification module that reads the 487 database rules seeded by PRP-01 and classifies any Cedar corpus entity: eCFR regulations (structural matching via CFR title+part), Federal Register notices (agency matching via 20-agency slug→pattern map), openFDA reports (dataset matching via endpoint normalization), and FL board content (authority rules + sourceName fallback). The engine is stateless — `classify(entity, context)` takes pre-loaded rules and returns a `ClassificationResult` with deduplicated `DomainAssignment[]`, an `AuthorityAssignment`, and `domainCodes`. `loadClassificationContext()` loads rules, 407-row allowlist, domain slug→UUID map, and source map in parallel. The CFR allowlist gates structural matching only; agency, dataset, and authority rules fire regardless of CFR citations. Supabase generated types were regenerated to include the 028 migration columns. Build passes clean (0 errors, 0 warnings). PRP-02 moved to completed.

Session 44 tightened three UI-library fidelity issues in `/system/ui`. First, the nested table contract was hardened in `globals.css` so `CedarTable surface="nested"` strips remaining container chrome instead of still reading as a card-inside-a-card. Second, the surfaces foundation page now lets inline code wrap inside its rule lists, preventing the forbidden-pattern bullets from generating ugly overflow artifacts. Third, the interactive menu demos were corrected to explicitly opt into neutral gray at the menu-content level, preventing Radix’s accent green from leaking into Cedar’s interaction examples.

Session 43 corrected a design-system styling leak in the new interactive atom demos. The `Context Menu` and `Dropdown Menu` examples in `/system/ui` were inheriting Radix’s accent color because the menu content surfaces did not explicitly set `color="gray"`. The demos now set neutral gray at the menu-content layer so Cedar’s “gray for interaction, color for information” rule stays intact and submenu highlight states no longer render as green.

Session 42 closed the remaining gap between Cedar’s atom registry and the current Radix Themes component catalog. `/system/ui/atoms` now documents 36 atom detail pages instead of 34 by adding `Icon Button` and `Inset` as first-class atoms, bringing the Cedar registry in line with the components listed in the live Radix Themes docs. The `Context Menu` page was also rebuilt from a static mock into a real interactive Radix demo with a right-click trigger zone, submenu, separators, and destructive action treatment, and the dropdown menu, popover, and hover card examples now use real interactive demos as well.

This session kept the Cedar-specific naming layer intact while making the docs more faithful to the underlying primitives. The shared atom docs source now exposes explicit Cedar shorthand references for the new atoms and richer menu contracts, while the left-nav atom count and route generation automatically pick up the expanded registry. Build verification passed cleanly after the changes.

Session 41 turned the atoms section of `/system/ui` from a small curated subset into a much broader actual build catalog. The atom nav now documents 34 atom detail pages instead of 10, covering the Radix Themes surface Cedar can build with: buttons, badges, cards, callouts, tables, text fields, textarea, select, checkbox family, radio family, switch, segmented control, tabs, tab nav, tooltip, avatar, aspect ratio, data list, dialog, alert dialog, dropdown menu, context menu, popover, hover card, progress, scroll area, skeleton, slider, spinner, and separator. The old broad-bucket model was replaced with a more Supabase-like atom inventory where each page has a clearer singular component identity.

This session also rebuilt the atom documentation model itself. A new shared atom-docs source now drives the atom index and atom detail pages together so the library can stay internally consistent. Each documented atom page now includes a Cedar registry table with shorthand references such as `BTN-CLASSIC`, `BTN-SOFT`, `BTN-GHOST`, `BTN-ICON`, `BTN-DESTRUCT`, `TBL-NESTED`, `SEL-DEFAULT`, and related atom contracts, plus live visual examples and collapsed implementation snippets. The UI library nav was compressed to read more like a real docs system and less like an oversized admin menu, and the sidebar width was reduced slightly to keep the left rail denser.

Session 39 executed PRP-01 (classification-foundation). Migration 028 was written, verified, and applied to production. Deliverables:
- **`cfr_allowlist` table created and seeded** — 407 rows (all relevant CFR parts from P1-S2F `RELEVANT_PARTS` dict) acting as the relevance gate before classification
- **`classification_rules` schema extended** — 6 new columns: `jurisdiction`, `domain_code`, `secondary_domain_codes`, `rule_config`, `ai_refinement_needed`, `notes`; unique index on `name` for idempotent seeding
- **`kg_entities` schema extended** — 2 new columns: `domain_codes` (JSONB), `classification_stage` (text)
- **417 structural rules seeded** — one per CFR allowlist part with section-level splits for 8 high-complexity parts (Stark Law, HIPAA subparts, CLIA, MIPS, etc.); all `rule_config` JSONB includes title/part/sections/confidence
- **20 agency rules seeded** — covering all major healthcare regulatory agencies (FDA, CMS, DEA, OSHA, OIG, HHS/OCR, CDC, EPA, etc.) with tier and A-score metadata
- **15 dataset rules seeded** — covering all major openFDA endpoints (drug/event, drug/label, device/event, device/recall, etc.)
- **26 authority level rules seeded** — binding_federal through informational tiers with rule_config encoding source_type, document_subtype, authority_level, confidence
- **All domain slugs validated** — 17 invalid slugs corrected against 024_taxonomy_seed.sql before push
- **Build passes clean** — 0 errors, 0 warnings; migration applied via `npx supabase db push`
- **Verification counts**: cfr_allowlist=407, structural=417, agency=20, dataset=15, authority_level=26, total classification_rules=487
- **PRP-01 moved to completed**

Session 38 expanded the admin-only UI Library from a small curated index into a much more operational design workspace modeled more closely on the usefulness of Supabase/Radix docs while staying Cedar-native. The IA now splits cleanly into `Foundations`, `Atom components`, `Fragment components`, and `UI patterns`; `nav-config` gained stable reference IDs plus canonical implementation-file metadata surfaced in every page header; and the overview/getting-started pages now explain the naming system and how to use the library as a build/audit reference. New routed documentation was added for 7 atom pages and 8 fragment pages, with live examples for Cedar’s actual buttons, badges, cards, callouts, tables, form controls, tabs/tooltips, trust fragments, metadata fragments, shell fragments, regulation fragments, and settings/admin fragments.

This session also fixed the lingering table double-border issue by introducing `components/CedarTable.tsx` as the canonical wrapper around Radix `Table.Root`. Real product tables on `/changes`, `/sources`, `/audit`, `/admin/practices`, `/admin/system`, and the regulation detail audit table now use the wrapper, and the UI library’s table/foundation/pattern pages document `surface="nested"` as the standard nested-table contract. Legacy `/system/ui/components/*` routes now redirect to `/system/ui/fragments/*` so old links still work while the IA evolves.

Session 37 (previous): executed the `admin-ui-library-curation-v1` PRP — narrowing the UI library from 16 broad pages to 11 curated pages with a consistent seven-section content model. The overview was redesigned as a true design-ops index. `nav-config` was extended with `governingDocs`, `usedIn`, and `related` metadata that now surfaces in every detail page header. The foundations section dropped `buttons` (deferred) and added `semantic-color` (replaces the thin `badges` page with full color system guidance). The patterns section dropped `navigation`, `empty-states`, `collection-header`, `detail-header`, and `settings-section`; added `collection-pages` and `detail-pages` as stronger replacements. `detail-pages` is explicitly marked `candidate` so the status lifecycle is real. The nav's status indicator was redesigned from a colored dot to compact `C`/`E` badge tokens.

**What was produced:**
- `research/outputs/part3/P3_S1.md` — FL FAC board/agency chapter-to-domain mapping (150+ chapters, 9 boards/agencies), FL-specific keyword additions (47 phrases), FAC citation parser spec. Reconciled: 47 domain code fixes, workforce.* gap resolved, FL-XC-10 updated.
- `research/outputs/part3/P3_S2.md` — FL legislative committee→domain mapping, omnibus bill handling (Option C hybrid), amendment tracking, board minutes classification strategy (60–70% L2 accuracy target, 45–55% in HITL band), board-specific extraction rules (Board of Pharmacy has separate Probable Cause Panel meeting type). Reconciled: clean, committee signals renamed to C-score.
- `research/outputs/part3/P3_S3.md` — CMS transmittals (4 manuals, all chapter→domain mappings), NCD/LCD (FL MAC coverage matrix, lcd jurisdiction via mac_id in JSONB), MLN articles (informational-only flag), 7 professional associations with A-scores and D-scores, 20+ classification_rules INSERTs.
- `research/outputs/part3/P3_S4.md` — Complete authority_level enum resolution (all "?" cells), within-source disambiguation rules (FR document type codes, DEA scheduling notice detection), hierarchy table (ranks 100–20), conflict resolution approach, proposed entity protocol (status modifier, not enum expansion), SQL seed data.
- `research/outputs/part3/P3_S5.md` — NormalizedCitation interface, StateCitationParser abstract base class, CitationParserRegistry singleton, state onboarding checklist (39 items, ~50hr/state, 72% config transfers from FL+federal base), supabase/seeds/states/[state-code]/ directory structure.
- `research/outputs/part3/P3_S6.md` — Real-time single-entity pipeline adaptation (4-tier short-circuit), taxonomy gap detection (4 signals + SQL), taxonomy versioning DDL, ANOM_NEW_PAIR source×domain frequency matrix, CONF_CONFLICT citation adjacency check, z-score spike detection, 5 new metrics (M11–M15). Source-authority override threshold confirmed at 0.65.
- `research/outputs/part3/P3_S7.md` — Audit trail schema extensions (7 new kg_classification_log columns, authority_level_transitions table), 20-metric suite (M1–M20, no overlap), bulk re-classification Inngest fan-out architecture (coordinator + worker functions, 900 entities/hour ceiling, 4-step transactional rollback). 11-hour estimate for 10K entity job.

## Research Pipeline State
```
DAG Status:
  ✅ complete: 37 (all P1 + P2_S1–P2_S5 + P3_S1–P3_S7)
  🔀 splintered: 8 (P1_S2, P1_S5, P1_S6, P1_S7, P1_S8, P1_S8-A, P1_S8-B, P2)

Progress: ALL SESSIONS COMPLETE — full research pipeline done

Notes:
- P3-S1 and P3-S2 ran via deep research (web route, no upstream context injected)
  → Both reconciled post-run against P1-S3, P1-S4, P2-S1, P2-S2 via Opus API pass
  → P3-S1: 47 domain code corrections (privacy-security.* → hipaa-privacy.*, billing-reimbursement.* → medicare-billing.*); workforce.* taxonomy gap resolved (remapped to state-regulations.licensure + clinical-operations.scope-of-practice); FL-XC-10 updated
  → P3-S2: clean (no domain drift); committee signal values renamed A-score → C-score to avoid ambiguity
- Source-authority override threshold set to 0.65 (high-relevance sources at confidence ≥0.65 appear in Library with "pending review"; <0.65 → HITL regardless)
```

## Next Session Priority

**1. Trigger cedar/corpus.classified-seed** — run the pipeline from the Inngest dashboard:
   - Start dev server: `env -u ANTHROPIC_API_KEY npx next dev --port 3000`
   - Open Inngest dashboard (http://localhost:8288), trigger `cedar/corpus.classified-seed`
   - Monitor all 21 steps; watch for errors in FR pagination or openFDA endpoints
   - Verify in Supabase: `SELECT count(*) FROM kg_entity_domains` (expect >0), `SELECT count(*) FROM kg_classification_log`, eCFR entities by title distribution
   - Spot-check: Title 21 Part 1306 entity → should have `cs_prescribing` domain + `federal_regulation` authority

**2. PRP-04: Library Wiring** — wire the Library page to display classified corpus data:
   - `/library` page currently shows no domain breakdown because `kg_entity_domains` is empty
   - After corpus seed runs, the Library page should show classified entities grouped by domain
   - Generate PRP-04 from the library wireframe in `docs/wireframes/library-v2.jsx`

**3. secondary-path-polish-v1 PRP** (UX sprint — ready to execute):
   Based on `research/ui-audit/design-audit-delta.md §6`:
   - Apply `SectionHeading` to all tab section headings in `RegulationTabs.tsx`
   - Fix stat card metric values on `/home` to use `<Text size="5" weight="bold">` / `<Text size="1">`
   - Suppress false click affordance on `/sources` table rows
   - Fix FAQ page card link wrapper (pseudo-element pattern, same as `DomainCard`)
   - Update Playwright spec selectors

**3. UI library follow-up** (design-ops/product UX support):
   - Split large fragment buckets into explicit Cedar composites so built components are as browseable as atoms (`DomainCard`, `RegulationRow`, `RelationshipCard`, `Sidebar`, `SidebarShell`, `SlideOverPanel`, etc.)
   - Add a docs-first view for Cedar custom primitives that fill Radix Themes gaps (accordion, sheet/slide-over, breadcrumb, pagination, command palette, toast)
   - Add local design-doc links/group at the top of `/system/ui` once the library IA stabilizes
   - Keep `/system/ui` aligned with the 6 design-system docs and the actual product implementation

**4. Research synthesis → implementation PRPs** (research pipeline complete, ready to build):
   All P1+P2+P3 outputs are in `research/outputs/`. Next step is generating implementation PRPs from the research. Likely first PRPs:
   - `classification-pipeline-v1` — Stage 1–4 pipeline, classification_rules seed data, authority_level schema (draws from P2-S1, P2-S2, P2-S3, P2-S4, P3-S4)
   - `kg-entity-schema-v1` — taxonomy versioning, authority_level_transitions table, kg_classification_log extensions (draws from P3-S6, P3-S7)
   - `fl-fac-ingestion-v1` — FAC citation parser, board chapter→domain mapping, FL keyword set (draws from P3-S1, P3-S5)
   - `state-onboarding-framework-v1` — CitationParserRegistry, NormalizedCitation interface, seeds directory structure (draws from P3-S5)

**5. Phase 3 scoring pipeline** (still pending — library category counts show 0 until triggered):
   - `cedar/corpus.classify` → `cedar/corpus.authority-classify` → `cedar/corpus.practice-score` → `cedar/corpus.service-line-map`
   - Start dev server: `env -u ANTHROPIC_API_KEY npx next dev --port 3000`, trigger via Inngest dashboard

**Open items from P2:**
- P2_S2 Research Objective 5 incomplete (SQL seed data only covers 5 representative domains).

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
- Playwright spec `table_row_click` selector (`table a[href^="/changes/"]`) no longer matches `ChangeTableRow` — now uses `onClick tr`. Update selector in `tests/ui-audit.spec.ts`
- Playwright spec `settings_email_threshold_select` selector (`[data-radix-select-trigger]`) does not match Radix rendered attribute — needs investigation
- `RegulationTabs.tsx` tab section headings still use `size="2"` (12px) — `SectionHeading` not applied; deferred to secondary-path-polish PRP

## Blockers
- Railway/Docling deployment needed for Module 4 (PDF processing)

## Environment
- Vercel: cedar-beta.vercel.app (auto-deploy from main)
- Credentials configured in Vercel: Oxylabs ✅, Browserbase ✅, Resend ✅, WorkOS ✅, Inngest ✅, Stripe ✅, GITHUB_PAT ✅, SUPABASE_ACCESS_TOKEN ✅, VERCEL_TOKEN ✅, ADMIN_SECRET ✅
- Supabase migrations: 28 applied to production ✅
- Practices in production: 2 (delivery recipients configured)
- kg_entities in production: 98,777 (seeded March 19, 2026)
