-- ============================================================================
-- Cedar Declarative Schema: RLS Policies
-- ============================================================================
-- This file represents the desired final state of all RLS policies.
-- It is NOT executed as a migration. Per declarative-schema.md caveats,
-- RLS policies are not tracked by the schema diff tool and must be
-- maintained as versioned migrations.
--
-- Source: consolidated from migrations 003, 007, 008, 011, 013, 022, 027
-- ============================================================================


-- ############################################################################
-- CORE TABLES (from 003)
-- ############################################################################

-- ── practices ──────────────────────────────────────────────────────────────

create policy "practices_select_owner" on public.practices
  for select to authenticated
  using (owner_email = ((select auth.jwt()) ->> 'email'));

create policy "practices_insert_owner" on public.practices
  for insert to authenticated
  with check (owner_email = ((select auth.jwt()) ->> 'email'));

create policy "practices_update_owner" on public.practices
  for update to authenticated
  using (owner_email = ((select auth.jwt()) ->> 'email'))
  with check (owner_email = ((select auth.jwt()) ->> 'email'));

create policy "practices_delete_owner" on public.practices
  for delete to authenticated
  using (owner_email = ((select auth.jwt()) ->> 'email'));

-- ── sources ────────────────────────────────────────────────────────────────

create policy "sources_select_authenticated" on public.sources
  for select to authenticated
  using (true);

-- ── source_urls ────────────────────────────────────────────────────────────

create policy "source_urls_select_authenticated" on public.source_urls
  for select to authenticated
  using (true);

-- ── changes ────────────────────────────────────────────────────────────────

create policy "changes_select_authenticated" on public.changes
  for select to authenticated
  using (true);

-- ── practice_acknowledgments ───────────────────────────────────────────────

create policy "acknowledgments_select_owner" on public.practice_acknowledgments
  for select to authenticated
  using (
    practice_id = (
      select id from public.practices where owner_email = ((select auth.jwt()) ->> 'email')
    )
  );

create policy "acknowledgments_insert_owner" on public.practice_acknowledgments
  for insert to authenticated
  with check (
    practice_id = (
      select id from public.practices where owner_email = ((select auth.jwt()) ->> 'email')
    )
  );

create policy "acknowledgments_update_owner" on public.practice_acknowledgments
  for update to authenticated
  using (
    practice_id = (
      select id from public.practices where owner_email = ((select auth.jwt()) ->> 'email')
    )
  )
  with check (
    practice_id = (
      select id from public.practices where owner_email = ((select auth.jwt()) ->> 'email')
    )
  );

create policy "acknowledgments_delete_owner" on public.practice_acknowledgments
  for delete to authenticated
  using (
    practice_id = (
      select id from public.practices where owner_email = ((select auth.jwt()) ->> 'email')
    )
  );

-- ── review_actions ─────────────────────────────────────────────────────────

create policy "review_actions_select_reviewer" on public.review_actions
  for select to authenticated
  using (
    ((select auth.jwt()) ->> 'role') in ('reviewer', 'admin')
  );

-- ── cost_events ────────────────────────────────────────────────────────────

create policy "cost_events_select_admin" on public.cost_events
  for select to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin');

-- ── feature_flags ──────────────────────────────────────────────────────────

create policy "feature_flags_select_authenticated" on public.feature_flags
  for select to authenticated
  using (true);

-- ── review_rules ───────────────────────────────────────────────────────────

create policy "review_rules_select_authenticated" on public.review_rules
  for select to authenticated
  using (true);

-- ── system_config ──────────────────────────────────────────────────────────

create policy "system_config_select_authenticated" on public.system_config
  for select to authenticated
  using (true);

-- ── prompt_templates ───────────────────────────────────────────────────────

create policy "prompt_templates_select_authenticated" on public.prompt_templates
  for select to authenticated
  using (is_active = true);


-- ############################################################################
-- KG FOUNDATION (from 007)
-- ############################################################################

-- ── kg_entities ────────────────────────────────────────────────────────────

create policy "kg_entities_select" on public.kg_entities
    for select to authenticated using (true);

create policy "kg_entities_select_admin" on public.kg_entities
    for select to authenticated
    using (((select auth.jwt()) ->> 'role') = 'admin');

create policy "kg_entities_insert_admin" on public.kg_entities
    for insert to authenticated
    with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "kg_entities_update_admin" on public.kg_entities
    for update to authenticated
    using (((select auth.jwt()) ->> 'role') = 'admin')
    with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "kg_entities_delete_admin" on public.kg_entities
    for delete to authenticated
    using (((select auth.jwt()) ->> 'role') = 'admin');

-- ── kg_relationships ───────────────────────────────────────────────────────

create policy "kg_relationships_select" on public.kg_relationships
    for select to authenticated using (true);

create policy "kg_relationships_select_admin" on public.kg_relationships
    for select to authenticated
    using (((select auth.jwt()) ->> 'role') = 'admin');

create policy "kg_relationships_insert_admin" on public.kg_relationships
    for insert to authenticated
    with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "kg_relationships_update_admin" on public.kg_relationships
    for update to authenticated
    using (((select auth.jwt()) ->> 'role') = 'admin')
    with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "kg_relationships_delete_admin" on public.kg_relationships
    for delete to authenticated
    using (((select auth.jwt()) ->> 'role') = 'admin');

-- ── kg_entity_versions ─────────────────────────────────────────────────────

create policy "kg_entity_versions_select" on public.kg_entity_versions
    for select to authenticated using (true);

create policy "kg_entity_versions_select_admin" on public.kg_entity_versions
    for select to authenticated
    using (((select auth.jwt()) ->> 'role') = 'admin');

create policy "kg_entity_versions_insert_admin" on public.kg_entity_versions
    for insert to authenticated
    with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "kg_entity_versions_update_admin" on public.kg_entity_versions
    for update to authenticated
    using (((select auth.jwt()) ->> 'role') = 'admin')
    with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "kg_entity_versions_delete_admin" on public.kg_entity_versions
    for delete to authenticated
    using (((select auth.jwt()) ->> 'role') = 'admin');


-- ############################################################################
-- ONTOLOGY (from 008)
-- ############################################################################

-- ── kg_entity_types ────────────────────────────────────────────────────────

create policy "entity_types_select_authenticated" on public.kg_entity_types
  for select to authenticated
  using (true);

create policy "entity_types_insert_admin" on public.kg_entity_types
  for insert to authenticated
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "entity_types_update_admin" on public.kg_entity_types
  for update to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin')
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "entity_types_delete_admin" on public.kg_entity_types
  for delete to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin');

-- ── kg_relationship_types ──────────────────────────────────────────────────

create policy "rel_types_select_authenticated" on public.kg_relationship_types
  for select to authenticated
  using (true);

create policy "rel_types_insert_admin" on public.kg_relationship_types
  for insert to authenticated
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "rel_types_update_admin" on public.kg_relationship_types
  for update to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin')
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "rel_types_delete_admin" on public.kg_relationship_types
  for delete to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin');

-- ── kg_domains ─────────────────────────────────────────────────────────────

create policy "domains_select_authenticated" on public.kg_domains
  for select to authenticated
  using (true);

create policy "domains_insert_admin" on public.kg_domains
  for insert to authenticated
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "domains_update_admin" on public.kg_domains
  for update to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin')
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "domains_delete_admin" on public.kg_domains
  for delete to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin');

-- ── kg_entity_domains ──────────────────────────────────────────────────────

create policy "entity_domains_select_authenticated" on public.kg_entity_domains
  for select to authenticated
  using (true);

create policy "entity_domains_insert_admin" on public.kg_entity_domains
  for insert to authenticated
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "entity_domains_update_admin" on public.kg_entity_domains
  for update to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin')
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "entity_domains_delete_admin" on public.kg_entity_domains
  for delete to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin');

-- ── kg_jurisdictions ───────────────────────────────────────────────────────

create policy "jurisdictions_select_authenticated" on public.kg_jurisdictions
  for select to authenticated
  using (true);

create policy "jurisdictions_insert_admin" on public.kg_jurisdictions
  for insert to authenticated
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "jurisdictions_update_admin" on public.kg_jurisdictions
  for update to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin')
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "jurisdictions_delete_admin" on public.kg_jurisdictions
  for delete to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin');

-- ── kg_entity_jurisdictions ────────────────────────────────────────────────

create policy "entity_jurisdictions_select_authenticated" on public.kg_entity_jurisdictions
  for select to authenticated
  using (true);

create policy "entity_jurisdictions_insert_admin" on public.kg_entity_jurisdictions
  for insert to authenticated
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "entity_jurisdictions_update_admin" on public.kg_entity_jurisdictions
  for update to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin')
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "entity_jurisdictions_delete_admin" on public.kg_entity_jurisdictions
  for delete to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin');

-- ── classification_rules ───────────────────────────────────────────────────

create policy "rules_select_admin" on public.classification_rules
  for select to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin');

create policy "rules_insert_admin" on public.classification_rules
  for insert to authenticated
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "rules_update_admin" on public.classification_rules
  for update to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin')
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "rules_delete_admin" on public.classification_rules
  for delete to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin');

-- ── classification_rule_sets ───────────────────────────────────────────────

create policy "rule_sets_select_admin" on public.classification_rule_sets
  for select to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin');

create policy "rule_sets_insert_admin" on public.classification_rule_sets
  for insert to authenticated
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "rule_sets_update_admin" on public.classification_rule_sets
  for update to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin')
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "rule_sets_delete_admin" on public.classification_rule_sets
  for delete to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin');

-- ── classification_results ─────────────────────────────────────────────────

create policy "results_select_authenticated" on public.classification_results
  for select to authenticated
  using (true);

create policy "results_insert_admin" on public.classification_results
  for insert to authenticated
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "results_update_admin" on public.classification_results
  for update to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin')
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "results_delete_admin" on public.classification_results
  for delete to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin');

-- ── classification_overrides ───────────────────────────────────────────────

create policy "overrides_select_admin" on public.classification_overrides
  for select to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin');

create policy "overrides_insert_admin" on public.classification_overrides
  for insert to authenticated
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "overrides_update_admin" on public.classification_overrides
  for update to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin')
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "overrides_delete_admin" on public.classification_overrides
  for delete to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin');

-- ── taxonomy_changelog ─────────────────────────────────────────────────────

create policy "changelog_select_authenticated" on public.taxonomy_changelog
  for select to authenticated
  using (true);

create policy "changelog_insert_admin" on public.taxonomy_changelog
  for insert to authenticated
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "changelog_update_admin" on public.taxonomy_changelog
  for update to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin')
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "changelog_delete_admin" on public.taxonomy_changelog
  for delete to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin');

-- ── kg_entity_merges ───────────────────────────────────────────────────────

create policy "merges_select_authenticated" on public.kg_entity_merges
  for select to authenticated
  using (true);

create policy "merges_insert_admin" on public.kg_entity_merges
  for insert to authenticated
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "merges_update_admin" on public.kg_entity_merges
  for update to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin')
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "merges_delete_admin" on public.kg_entity_merges
  for delete to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin');


-- ############################################################################
-- CRAWL PROFILES (from 011)
-- ############################################################################

-- ── crawl_templates ────────────────────────────────────────────────────────

create policy "templates_select_authenticated" on public.crawl_templates
  for select to authenticated using (true);

create policy "templates_insert_admin" on public.crawl_templates
  for insert to authenticated
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "templates_update_admin" on public.crawl_templates
  for update to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin')
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "templates_delete_admin" on public.crawl_templates
  for delete to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin');

-- ── discovery_runs ─────────────────────────────────────────────────────────

create policy "runs_select_authenticated" on public.discovery_runs
  for select to authenticated using (true);

create policy "runs_insert_admin" on public.discovery_runs
  for insert to authenticated
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "runs_update_admin" on public.discovery_runs
  for update to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin')
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "runs_delete_admin" on public.discovery_runs
  for delete to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin');


-- ############################################################################
-- VALIDATION (from 013)
-- ############################################################################

-- ── validation_log ─────────────────────────────────────────────────────────

create policy "validation_log_select_authenticated" on public.validation_log
  for select to authenticated
  using (true);

create policy "validation_log_select_admin" on public.validation_log
  for select to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin');

create policy "validation_log_insert_admin" on public.validation_log
  for insert to authenticated
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "validation_log_update_admin" on public.validation_log
  for update to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin')
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "validation_log_delete_admin" on public.validation_log
  for delete to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin');


-- ############################################################################
-- TAXONOMY EXTENSIONS (from 022)
-- ############################################################################

-- ── kg_practice_types ──────────────────────────────────────────────────────

create policy "practice_types_select_authenticated" on public.kg_practice_types
  for select to authenticated using (true);

create policy "practice_types_insert_admin" on public.kg_practice_types
  for insert to authenticated
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "practice_types_update_admin" on public.kg_practice_types
  for update to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin')
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "practice_types_delete_admin" on public.kg_practice_types
  for delete to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin');

-- ── kg_entity_practice_relevance ───────────────────────────────────────────

create policy "entity_practice_relevance_select_authenticated" on public.kg_entity_practice_relevance
  for select to authenticated using (true);

create policy "entity_practice_relevance_insert_admin" on public.kg_entity_practice_relevance
  for insert to authenticated
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "entity_practice_relevance_update_admin" on public.kg_entity_practice_relevance
  for update to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin')
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "entity_practice_relevance_delete_admin" on public.kg_entity_practice_relevance
  for delete to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin');

-- ── kg_classification_log ──────────────────────────────────────────────────

create policy "classification_log_select_authenticated" on public.kg_classification_log
  for select to authenticated using (true);

create policy "classification_log_insert_admin" on public.kg_classification_log
  for insert to authenticated
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "classification_log_update_admin" on public.kg_classification_log
  for update to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin')
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "classification_log_delete_admin" on public.kg_classification_log
  for delete to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin');

-- ── kg_service_lines ───────────────────────────────────────────────────────

create policy "service_lines_select_authenticated" on public.kg_service_lines
  for select to authenticated using (true);

create policy "service_lines_insert_admin" on public.kg_service_lines
  for insert to authenticated
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "service_lines_update_admin" on public.kg_service_lines
  for update to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin')
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "service_lines_delete_admin" on public.kg_service_lines
  for delete to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin');

-- ── kg_service_line_regulations ────────────────────────────────────────────

create policy "service_line_regs_select_authenticated" on public.kg_service_line_regulations
  for select to authenticated using (true);

create policy "service_line_regs_insert_admin" on public.kg_service_line_regulations
  for insert to authenticated
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "service_line_regs_update_admin" on public.kg_service_line_regulations
  for update to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin')
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "service_line_regs_delete_admin" on public.kg_service_line_regulations
  for delete to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin');

-- ── practice_profiles ──────────────────────────────────────────────────────

create policy "practice_profiles_select_owner" on public.practice_profiles
  for select to authenticated
  using (practice_id in (select id from public.practices where owner_email = ((select auth.jwt()) ->> 'email')));

create policy "practice_profiles_insert_owner" on public.practice_profiles
  for insert to authenticated
  with check (practice_id in (select id from public.practices where owner_email = ((select auth.jwt()) ->> 'email')));

create policy "practice_profiles_update_owner" on public.practice_profiles
  for update to authenticated
  using (practice_id in (select id from public.practices where owner_email = ((select auth.jwt()) ->> 'email')))
  with check (practice_id in (select id from public.practices where owner_email = ((select auth.jwt()) ->> 'email')));

create policy "practice_profiles_delete_owner" on public.practice_profiles
  for delete to authenticated
  using (practice_id in (select id from public.practices where owner_email = ((select auth.jwt()) ->> 'email')));

create policy "practice_profiles_select_admin" on public.practice_profiles
  for select to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin');

create policy "practice_profiles_insert_admin" on public.practice_profiles
  for insert to authenticated
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "practice_profiles_update_admin" on public.practice_profiles
  for update to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin')
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "practice_profiles_delete_admin" on public.practice_profiles
  for delete to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin');

-- ── practice_service_lines ─────────────────────────────────────────────────

create policy "practice_service_lines_select_owner" on public.practice_service_lines
  for select to authenticated
  using (practice_id in (select id from public.practices where owner_email = ((select auth.jwt()) ->> 'email')));

create policy "practice_service_lines_insert_owner" on public.practice_service_lines
  for insert to authenticated
  with check (practice_id in (select id from public.practices where owner_email = ((select auth.jwt()) ->> 'email')));

create policy "practice_service_lines_update_owner" on public.practice_service_lines
  for update to authenticated
  using (practice_id in (select id from public.practices where owner_email = ((select auth.jwt()) ->> 'email')))
  with check (practice_id in (select id from public.practices where owner_email = ((select auth.jwt()) ->> 'email')));

create policy "practice_service_lines_delete_owner" on public.practice_service_lines
  for delete to authenticated
  using (practice_id in (select id from public.practices where owner_email = ((select auth.jwt()) ->> 'email')));

create policy "practice_service_lines_select_admin" on public.practice_service_lines
  for select to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin');

create policy "practice_service_lines_insert_admin" on public.practice_service_lines
  for insert to authenticated
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "practice_service_lines_update_admin" on public.practice_service_lines
  for update to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin')
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "practice_service_lines_delete_admin" on public.practice_service_lines
  for delete to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin');

-- ── practice_staff ─────────────────────────────────────────────────────────

create policy "practice_staff_select_owner" on public.practice_staff
  for select to authenticated
  using (practice_id in (select id from public.practices where owner_email = ((select auth.jwt()) ->> 'email')));

create policy "practice_staff_insert_owner" on public.practice_staff
  for insert to authenticated
  with check (practice_id in (select id from public.practices where owner_email = ((select auth.jwt()) ->> 'email')));

create policy "practice_staff_update_owner" on public.practice_staff
  for update to authenticated
  using (practice_id in (select id from public.practices where owner_email = ((select auth.jwt()) ->> 'email')))
  with check (practice_id in (select id from public.practices where owner_email = ((select auth.jwt()) ->> 'email')));

create policy "practice_staff_delete_owner" on public.practice_staff
  for delete to authenticated
  using (practice_id in (select id from public.practices where owner_email = ((select auth.jwt()) ->> 'email')));

create policy "practice_staff_select_admin" on public.practice_staff
  for select to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin');

create policy "practice_staff_insert_admin" on public.practice_staff
  for insert to authenticated
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "practice_staff_update_admin" on public.practice_staff
  for update to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin')
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "practice_staff_delete_admin" on public.practice_staff
  for delete to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin');

-- ── practice_equipment ─────────────────────────────────────────────────────

create policy "practice_equipment_select_owner" on public.practice_equipment
  for select to authenticated
  using (practice_id in (select id from public.practices where owner_email = ((select auth.jwt()) ->> 'email')));

create policy "practice_equipment_insert_owner" on public.practice_equipment
  for insert to authenticated
  with check (practice_id in (select id from public.practices where owner_email = ((select auth.jwt()) ->> 'email')));

create policy "practice_equipment_update_owner" on public.practice_equipment
  for update to authenticated
  using (practice_id in (select id from public.practices where owner_email = ((select auth.jwt()) ->> 'email')))
  with check (practice_id in (select id from public.practices where owner_email = ((select auth.jwt()) ->> 'email')));

create policy "practice_equipment_delete_owner" on public.practice_equipment
  for delete to authenticated
  using (practice_id in (select id from public.practices where owner_email = ((select auth.jwt()) ->> 'email')));

create policy "practice_equipment_select_admin" on public.practice_equipment
  for select to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin');

create policy "practice_equipment_insert_admin" on public.practice_equipment
  for insert to authenticated
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "practice_equipment_update_admin" on public.practice_equipment
  for update to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin')
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "practice_equipment_delete_admin" on public.practice_equipment
  for delete to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin');


-- ############################################################################
-- PHASE 3 (from 027)
-- ############################################################################

-- ── kg_domain_practice_type_map ────────────────────────────────────────────

create policy "domain_pt_map_select_authenticated" on public.kg_domain_practice_type_map
  for select to authenticated using (true);

create policy "domain_pt_map_insert_admin" on public.kg_domain_practice_type_map
  for insert to authenticated
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "domain_pt_map_update_admin" on public.kg_domain_practice_type_map
  for update to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin')
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "domain_pt_map_delete_admin" on public.kg_domain_practice_type_map
  for delete to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin');
