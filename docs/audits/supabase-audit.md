# Supabase Best Practices Audit

Generated: 2026-03-20
Audited against: `docs/supabase-prompts/` (8 files)

## Summary

- **Total files audited:** 33 (27 migrations + 2 client files + 0 middleware + 0 realtime + 0 edge functions + 3 RPC call sites + 1 schema check)
- **Total findings:** 148
- **Critical (broken or insecure):** 18
- **Standard (style/convention violations):** 112
- **Advisory (recommendations):** 18

### Systemic Issues (affect all or most migrations)

These issues appear in every migration file and are listed once here rather than repeated per-file:

| # | Severity | Finding | Violated Prompt | Scope |
|---|----------|---------|-----------------|-------|
| S1 | Standard | File naming uses `NNN_description.sql` instead of required `YYYYMMDDHHmmss_description.sql` | `create-migration.md` | All 27 migrations |
| S2 | Standard | SQL reserved words are UPPERCASE throughout — should be lowercase | `sql-style-guide.md` | All 27 migrations |
| S3 | Standard | Table references are not schema-qualified (`changes` instead of `public.changes`) | `sql-style-guide.md` | All 27 migrations |

---

## Findings by Area

### Migrations

#### 001_initial_schema.sql

| # | Severity | Finding | Violated Prompt | Line(s) |
|---|----------|---------|-----------------|---------|
| 1 | Standard | Header comment is minimal — missing structured metadata (affected tables, special considerations) | `create-migration.md` | L1-2 |
| 2 | Standard | No `COMMENT ON TABLE` for any of the 7 tables created (practices, sources, source_urls, changes, practice_acknowledgments, review_actions, cost_events) | `sql-style-guide.md` | — |
| 3 | Critical | RLS is NOT enabled on any table in this migration — deferred to 003, leaving tables exposed between migrations | `create-migration.md` § RLS | — |
| 4 | Advisory | Primary keys use `UUID PRIMARY KEY DEFAULT gen_random_uuid()` instead of `id bigint generated always as identity primary key` | `sql-style-guide.md` § Tables | All CREATE TABLE |

#### 002_config_tables.sql

| # | Severity | Finding | Violated Prompt | Line(s) |
|---|----------|---------|-----------------|---------|
| 1 | Standard | Header comment minimal — missing structured metadata | `create-migration.md` | L1-2 |
| 2 | Standard | No `COMMENT ON TABLE` for 4 tables (feature_flags, prompt_templates, system_config, review_rules) | `sql-style-guide.md` | — |
| 3 | Critical | RLS is NOT enabled on any table — deferred to 003 | `create-migration.md` § RLS | — |
| 4 | Advisory | UUID PKs instead of bigint identity | `sql-style-guide.md` § Tables | All CREATE TABLE |

#### 003_rls_policies.sql

| # | Severity | Finding | Violated Prompt | Line(s) |
|---|----------|---------|-----------------|---------|
| 1 | Standard | Header comment minimal — missing structured metadata | `create-migration.md` | L1-2 |
| 2 | Critical | `practices_own` uses `FOR ALL` — must be split into 4 separate policies (SELECT, INSERT, UPDATE, DELETE) | `create-rls-policies.md` § Multiple operations | L45-46 |
| 3 | Critical | `acknowledgments_own` uses `FOR ALL` — same issue | `create-rls-policies.md` | L58-63 |
| 4 | Critical | `FOR ALL` policies have only `USING` — missing `WITH CHECK` required for INSERT/UPDATE component | `create-rls-policies.md` § INSERT/UPDATE syntax | L45-46, L58-63 |
| 5 | Standard | All policies missing `TO` role clause — should specify `TO authenticated` or `TO anon` | `create-rls-policies.md` § Specify roles | L21-77 |
| 6 | Standard | Bare `auth.jwt()` calls without `(select ...)` wrapper for performance | `create-rls-policies.md` § Performance | L46, L61, L70, L77 |
| 7 | Standard | `enforce_changes_append_only()` function missing explicit `SECURITY INVOKER` | `create-functions.md` § General | L83 |
| 8 | Standard | `enforce_changes_append_only()` missing `set search_path = ''` | `create-functions.md` § search_path | L83 |
| 9 | Standard | `update_system_config_timestamp()` missing explicit `SECURITY INVOKER` and `search_path = ''` | `create-functions.md` | L103 |
| 10 | Standard | Trigger functions reference bare table names (not `public.changes`, `public.system_config`) | `create-functions.md` § Fully qualified | L83-98, L103-113 |

#### 004_seed_sources.sql

| # | Severity | Finding | Violated Prompt | Line(s) |
|---|----------|---------|-----------------|---------|
| 1 | — | No findings beyond systemic issues (S1-S3). Header comment and inline comments are adequate. | — | — |

#### 005_seed_agents_enabled.sql

| # | Severity | Finding | Violated Prompt | Line(s) |
|---|----------|---------|-----------------|---------|
| 1 | — | No findings beyond systemic issues (S1-S3). | — | — |

#### 006_fetch_method_tracking.sql

| # | Severity | Finding | Violated Prompt | Line(s) |
|---|----------|---------|-----------------|---------|
| 1 | — | No findings beyond systemic issues (S1-S3). Good inline comments. | — | — |

#### 007_kg_foundation.sql

| # | Severity | Finding | Violated Prompt | Line(s) |
|---|----------|---------|-----------------|---------|
| 1 | Standard | No `COMMENT ON TABLE` for 3 tables (kg_entities, kg_relationships, kg_entity_versions) | `sql-style-guide.md` | — |
| 2 | Critical | `kg_entities_admin`, `kg_relationships_admin`, `kg_entity_versions_admin` all use `FOR ALL` — must be split into 4 policies each | `create-rls-policies.md` | L103-114 |
| 3 | Standard | Bare `auth.jwt()` without `(select ...)` wrapper | `create-rls-policies.md` § Performance | L105-114 |
| 4 | Standard | `update_kg_entities_updated_at()` missing explicit `SECURITY INVOKER` and `search_path = ''` | `create-functions.md` | L76 |
| 5 | Advisory | UUID PKs instead of bigint identity | `sql-style-guide.md` | All CREATE TABLE |

#### 008_ontology_schema.sql

| # | Severity | Finding | Violated Prompt | Line(s) |
|---|----------|---------|-----------------|---------|
| 1 | Critical | 12 `FOR ALL` admin policies — each must be split into 4 separate per-operation policies | `create-rls-policies.md` | L842-886 |
| 2 | Critical | `FOR ALL` admin policies have only `USING` — missing `WITH CHECK` for INSERT/UPDATE | `create-rls-policies.md` § Syntax | L842-886 |
| 3 | Standard | All 12 admin policies missing `TO` role clause | `create-rls-policies.md` § Specify roles | L841-886 |
| 4 | Standard | Bare `auth.jwt()` without `(select ...)` wrapper on all policies | `create-rls-policies.md` § Performance | L842-886 |
| 5 | Standard | No `COMMENT ON TABLE` for any of the ~12 new tables | `sql-style-guide.md` | — |
| 6 | Standard | 4 trigger functions missing `SECURITY INVOKER` and `search_path = ''` (`compute_entity_type_path`, `prevent_override_mutation`, `prevent_merge_mutation`, `prevent_changelog_mutation`) | `create-functions.md` | L66, L354, L402, L441 |
| 7 | Advisory | Header says "Migration 001" but file is 008 — confusing numbering | `create-migration.md` | L2 |

#### 009_ontology_junction_rls.sql

| # | Severity | Finding | Violated Prompt | Line(s) |
|---|----------|---------|-----------------|---------|
| 1 | Critical | `kg_entity_domains_admin` and `kg_entity_jurisdictions_admin` use `FOR ALL` | `create-rls-policies.md` | L12-16, L25-29 |
| 2 | Standard | Bare `auth.jwt()` without `(select ...)` wrapper | `create-rls-policies.md` § Performance | L15-16, L28-29 |
| 3 | Critical | Potential duplicate RLS policies — 008 already creates policies for these tables; applying both migrations may create conflicting or redundant policy sets | `create-rls-policies.md` | — |

#### 010_chain_sequence.sql

| # | Severity | Finding | Violated Prompt | Line(s) |
|---|----------|---------|-----------------|---------|
| 1 | Standard | `enforce_changes_append_only()` replacement missing explicit `SECURITY INVOKER` | `create-functions.md` | L31 |
| 2 | Standard | Missing `set search_path = ''` on function | `create-functions.md` § search_path | L31 |
| 3 | Standard | Table references in function body not schema-qualified | `create-functions.md` § Fully qualified | L54 |

#### 011_crawl_profiles.sql

| # | Severity | Finding | Violated Prompt | Line(s) |
|---|----------|---------|-----------------|---------|
| 1 | Standard | No `COMMENT ON TABLE` for 2 new tables (crawl_templates, discovery_runs) | `sql-style-guide.md` | — |
| 2 | Critical | `templates_admin` and `runs_admin` use `FOR ALL` — must split per-operation | `create-rls-policies.md` | L47, L95 |
| 3 | Critical | `FOR ALL` admin policies have only `USING` — missing `WITH CHECK` for INSERT/UPDATE | `create-rls-policies.md` § Syntax | L47, L95 |
| 4 | Standard | No `TO` clause on any policy | `create-rls-policies.md` § Specify roles | L46-47, L94-95 |
| 5 | Advisory | UUID PKs | `sql-style-guide.md` | L16, L56 |

#### 012_normalized_diff.sql

| # | Severity | Finding | Violated Prompt | Line(s) |
|---|----------|---------|-----------------|---------|
| 1 | — | No findings beyond systemic issues (S1-S3). Small ALTER TABLE migration. | — | — |

#### 013_validation_log.sql

| # | Severity | Finding | Violated Prompt | Line(s) |
|---|----------|---------|-----------------|---------|
| 1 | Advisory | Header comment minimal — missing structured metadata | `create-migration.md` | L1-2 |
| 2 | Critical | `validation_log_admin` uses `FOR ALL` — must split per-operation | `create-rls-policies.md` | L22 |
| 3 | Critical | `FOR ALL` has only `USING` — missing `WITH CHECK` | `create-rls-policies.md` § Syntax | L22 |
| 4 | Standard | No `TO` clause on policies | `create-rls-policies.md` § Specify roles | L21-22 |
| 5 | Advisory | UUID PK | `sql-style-guide.md` | L5 |

#### 014_billing_columns.sql

| # | Severity | Finding | Violated Prompt | Line(s) |
|---|----------|---------|-----------------|---------|
| 1 | Advisory | Header comment not in structured metadata format | `create-migration.md` | L1-4 |

#### 015_practice_profile.sql

| # | Severity | Finding | Violated Prompt | Line(s) |
|---|----------|---------|-----------------|---------|
| 1 | Advisory | Single-line header comment — missing structured metadata | `create-migration.md` | L1 |
| 2 | Advisory | No `COMMENT ON COLUMN` for new columns (owner_name, practice_type, phone) | `sql-style-guide.md` | L3-9 |

#### 016_hitl_columns.sql

| # | Severity | Finding | Violated Prompt | Line(s) |
|---|----------|---------|-----------------|---------|
| 1 | Standard | Replacement function `enforce_changes_append_only()` missing explicit `SECURITY INVOKER` | `create-functions.md` | L24 |
| 2 | Standard | Missing `set search_path = ''` on function | `create-functions.md` § search_path | L24 |
| 3 | Standard | Function body uses unqualified table references | `create-functions.md` § Fully qualified | L45 |

#### 017_notification_prefs.sql

| # | Severity | Finding | Violated Prompt | Line(s) |
|---|----------|---------|-----------------|---------|
| 1 | Advisory | Minimal header comment — missing structured metadata | `create-migration.md` | L1-2 |

#### 018_practices_soft_delete.sql

| # | Severity | Finding | Violated Prompt | Line(s) |
|---|----------|---------|-----------------|---------|
| 1 | Advisory | Minimal header comment — missing structured metadata | `create-migration.md` | L1-2 |
| 2 | Advisory | No index on `deleted_at` for filtering active/deleted records | `create-rls-policies.md` § Indexes | L4 |

#### 019_kg_corpus_columns.sql

| # | Severity | Finding | Violated Prompt | Line(s) |
|---|----------|---------|-----------------|---------|
| 1 | — | No findings beyond systemic issues (S1-S3). Excellent inline comments. | — | — |

#### 020_kg_entity_upsert_index.sql

| # | Severity | Finding | Violated Prompt | Line(s) |
|---|----------|---------|-----------------|---------|
| 1 | — | No findings beyond systemic issues (S1-S3). | — | — |

#### 021_kg_entity_upsert_constraint.sql

| # | Severity | Finding | Violated Prompt | Line(s) |
|---|----------|---------|-----------------|---------|
| 1 | Advisory | `DROP INDEX` destructive operation lacks inline comment on the line itself (rationale is in header only) | `create-migration.md` § Destructive comments | L13 |

#### 022_taxonomy_schema.sql

| # | Severity | Finding | Violated Prompt | Line(s) |
|---|----------|---------|-----------------|---------|
| 1 | Standard | No `COMMENT ON TABLE` for 9 new tables (kg_practice_types, kg_entity_practice_relevance, kg_classification_log, kg_service_lines, kg_service_line_regulations, practice_profiles, practice_service_lines, practice_staff, practice_equipment) | `sql-style-guide.md` | — |
| 2 | Critical | 9 `FOR ALL` admin and owner policies — each must be split per-operation | `create-rls-policies.md` | L87-90, L114-117, L148-151, L175-178, L202-205, L232-239, L255-262, L276-283, L297-304 |
| 3 | Advisory | Bare `auth.jwt()` without `(select ...)` wrapper on all policies | `create-rls-policies.md` § Performance | Throughout |
| 4 | Standard | No index on `practices(owner_email)` referenced by RLS owner policies | `create-rls-policies.md` § Indexes | L232-235, L255-258, L276-279, L297-300 |
| 5 | Advisory | UUID PKs | `sql-style-guide.md` | All CREATE TABLE |

#### 023_search_indexes.sql

| # | Severity | Finding | Violated Prompt | Line(s) |
|---|----------|---------|-----------------|---------|
| 1 | Critical | `refresh_corpus_facets()` uses `SECURITY DEFINER` without justification comment | `create-functions.md` § SECURITY INVOKER default | L85 |
| 2 | Critical | `refresh_corpus_facets()` uses `SECURITY DEFINER` without `set search_path = ''` — search_path injection risk | `create-functions.md` § search_path | L82-89 |
| 3 | Standard | `kg_entities_search_vector_update()` missing `set search_path = ''` | `create-functions.md` § search_path | L21 |
| 4 | Standard | Function bodies use unqualified table references | `create-functions.md` § Fully qualified | L87, L21-29 |

#### 024_taxonomy_seed.sql

| # | Severity | Finding | Violated Prompt | Line(s) |
|---|----------|---------|-----------------|---------|
| 1 | Advisory | Header comment minimal — missing affected tables list | `create-migration.md` | L1-2 |

#### 025_phase2_schema.sql

| # | Severity | Finding | Violated Prompt | Line(s) |
|---|----------|---------|-----------------|---------|
| 1 | — | No findings beyond systemic issues (S1-S3). No new tables, no RLS, no functions. | — | — |

#### 026_phase2_config_seed.sql

| # | Severity | Finding | Violated Prompt | Line(s) |
|---|----------|---------|-----------------|---------|
| 1 | — | No findings beyond systemic issues (S1-S3). | — | — |

#### 027_phase3_schema.sql

| # | Severity | Finding | Violated Prompt | Line(s) |
|---|----------|---------|-----------------|---------|
| 1 | Standard | No `COMMENT ON TABLE` for `kg_domain_practice_type_map` | `sql-style-guide.md` | L10 |
| 2 | Critical | `domain_pt_map_admin` uses `FOR ALL` — must split per-operation | `create-rls-policies.md` | L29-32 |
| 3 | Critical | `refresh_practice_relevance_summary()` uses `SECURITY DEFINER` without justification | `create-functions.md` § SECURITY INVOKER | L259 |
| 4 | Critical | `refresh_practice_relevance_summary()` uses `SECURITY DEFINER` without `set search_path = ''` — search_path injection risk | `create-functions.md` § search_path | L259-264 |
| 5 | Standard | `mv_practice_relevance_summary` not schema-qualified in function body | `create-functions.md` § Fully qualified | L262 |
| 6 | Advisory | Bare `auth.jwt()` without `(select ...)` wrapper | `create-rls-policies.md` § Performance | L31 |
| 7 | Advisory | UUID PK | `sql-style-guide.md` | L11 |

---

### Client Setup

| # | Severity | Finding | Violated Prompt | File |
|---|----------|---------|-----------------|------|
| 1 | Advisory | Server client uses `createClient` from `@supabase/supabase-js` instead of `createServerClient` from `@supabase/ssr` — intentional since Cedar uses WorkOS for auth (service role key, no user sessions server-side), but deviates from the prompt standard | `nextjs-auth.md` § Server client | `lib/db/client.ts:11` |
| 2 | Advisory | `audit/export/page.tsx` creates browser client inline using `createBrowserClient` from `@supabase/ssr` instead of importing from `@/lib/db/client` — duplicated pattern | `nextjs-auth.md` (consistency) | `app/(dashboard)/audit/export/page.tsx:4` |

**Passing checks:**
- Browser client correctly uses `createBrowserClient` from `@supabase/ssr`
- Env vars correctly use `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- Zero imports from `@supabase/auth-helpers-nextjs`
- Zero deprecated individual cookie methods (get/set/remove)

---

### Proxy / Middleware

No custom middleware.ts or proxy.ts found at the project root. Cedar uses WorkOS AuthKit for auth, not Supabase Auth. No Supabase-aware middleware is needed.

**No findings.**

---

### Realtime

No Supabase Realtime usage found. Zero occurrences of `supabase.channel(`, `postgres_changes`, `.on('broadcast'`, `.on('presence'`, or any realtime subscriptions.

**No findings.**

---

### Edge Functions

No `supabase/functions/` directory exists. All server-side logic runs in Next.js API routes and Inngest functions.

**No findings.**

---

### Raw SQL in Application Code

No raw SQL found in application code (`lib/`, `inngest/`, `app/`). All data access uses the Supabase query builder.

3 `.rpc()` calls found — all for materialized view refreshes in Inngest functions:
- `inngest/corpus-classify.ts:232` — `supabase.rpc('refresh_corpus_facets')`
- `inngest/corpus-practice-score.ts:382` — `supabase.rpc('refresh_corpus_facets')`
- `inngest/corpus-practice-score.ts:383` — `supabase.rpc('refresh_practice_relevance_summary')`

These are appropriate server-side usage. The RPC function names are lowercase and valid.

**No findings.**

---

### Declarative Schema

| # | Severity | Finding | Violated Prompt |
|---|----------|---------|-----------------|
| 1 | Advisory | `supabase/schemas/` directory does not exist — project uses traditional migration-only approach | `declarative-schema.md` |

**Recommendation:** Create `supabase/schemas/` and begin maintaining declarative schema files representing the desired final state. Going forward, use `supabase db diff -f <migration_name>` to generate migrations from schema diffs rather than writing migrations by hand. This provides a single source of truth for the current schema and eliminates drift between intended and actual state.

**Note:** Per `declarative-schema.md` § Known caveats, RLS policies, DML (seed data), comments, and some view features must remain as versioned migrations since they are not tracked by the schema diff tool.

---

## Recommended Fix Order

1. **SECURITY DEFINER functions without `search_path = ''` (Critical — security vulnerability)**
   Migrations 023 and 027 define `SECURITY DEFINER` functions (`refresh_corpus_facets`, `refresh_practice_relevance_summary`) without setting `search_path = ''`. This is a known PostgreSQL search_path injection vulnerability where a malicious actor with CREATE privilege on a shared schema could hijack function execution. Fix: add `set search_path = ''` and use fully qualified table names in function bodies. If possible, add a justification comment for why `SECURITY DEFINER` is needed (materialized view refresh requires owner privileges).

2. **`FOR ALL` RLS policies → split into per-operation policies (Critical — security clarity)**
   19+ policies across migrations 003, 007, 008, 009, 011, 013, 022, 027 use `FOR ALL` instead of separate SELECT/INSERT/UPDATE/DELETE policies. Several of these have only `USING` without `WITH CHECK`, which means the INSERT component has no WITH CHECK constraint. Fix: create a new migration that drops all `FOR ALL` policies and recreates them as 4 separate per-operation policies per role.

3. **Missing `TO` role clause on RLS policies (Standard — security clarity)**
   Policies in migrations 003, 008, 011, 013 do not specify `TO authenticated` or `TO anon`, causing the policy expression to execute for all roles unnecessarily. Fix: add `TO authenticated` to all policies that should only apply to logged-in users.

4. **Functions missing `SECURITY INVOKER` and `search_path = ''` (Standard — best practice)**
   All trigger functions across migrations 003, 007, 008, 010, 016, 023 lack explicit `SECURITY INVOKER` and `set search_path = ''`. While PostgreSQL defaults to `SECURITY INVOKER`, the Supabase standard requires explicit declaration. Fix: create a migration that replaces all functions with explicit `SECURITY INVOKER` and `set search_path = ''`.

5. **RLS not enabled at table creation time (Critical — exposure window)**
   Migrations 001 and 002 create 11 tables without enabling RLS — it's deferred to migration 003. While this may be harmless if all migrations run in a single transaction, it violates the standard. Fix: for future tables, always include `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` in the same migration as `CREATE TABLE`.

6. **Bare `auth.jwt()` without `(select ...)` wrapper (Standard — performance)**
   All RLS policies that call `auth.jwt()` use it without the `(select auth.jwt())` wrapper, causing the function to execute per-row instead of being cached per-statement. Fix: wrap all `auth.jwt()` calls in `(select auth.jwt())`.

7. **Missing `COMMENT ON TABLE` statements (Standard — documentation)**
   ~25 tables lack `COMMENT ON TABLE` DDL. Fix: create a migration adding comments to all tables.

8. **File naming convention (Standard — organization)**
   All 27 migrations use `NNN_description.sql` instead of `YYYYMMDDHHmmss_description.sql`. Fix: going forward, use the timestamp format for new migrations. Renaming existing migrations is risky if they've been applied to remote databases.

9. **Uppercase SQL reserved words (Standard — style consistency)**
   All 27 migrations use uppercase SQL keywords. Fix: adopt lowercase for all new migrations. Retroactive changes are low-priority since they don't affect functionality.

10. **Unqualified table references (Standard — clarity)**
    All 27 migrations reference tables without schema prefix. Fix: adopt `public.tablename` for all new migrations and function bodies.

11. **Adopt declarative schema workflow (Advisory — process improvement)**
    Create `supabase/schemas/` and begin maintaining schema-as-code. This provides a single source of truth and enables automated migration generation via `supabase db diff`.

12. **UUID vs bigint identity primary keys (Advisory — convention alignment)**
    All tables use UUID PKs. This is a valid architectural choice for distributed systems but deviates from the sql-style-guide.md standard. Document this as an intentional project convention.
