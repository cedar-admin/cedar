-- ============================================================================
-- Cedar Declarative Schema: Indexes
-- ============================================================================
-- This file represents the desired final state of all database indexes.
-- It is NOT executed as a migration.
--
-- Source: consolidated from migrations 001-027
-- ============================================================================


-- ============================================================================
-- 1. practices indexes (from 001, 014, 018)
-- ============================================================================

create index idx_practices_owner_email on public.practices(owner_email);

-- Index for webhook handler lookups by stripe_customer_id
create index idx_practices_stripe_customer_id on public.practices(stripe_customer_id)
  where stripe_customer_id is not null;

create index idx_practices_deleted_at on public.practices(deleted_at) where deleted_at is not null;


-- ============================================================================
-- 2. sources indexes
-- ============================================================================

-- (no standalone indexes — PK only)


-- ============================================================================
-- 3. source_urls indexes (from 001, 006, 011)
-- ============================================================================

create index idx_source_urls_source_id on public.source_urls(source_id);

-- Index for quickly finding all source_urls currently using a given method
-- (useful for rollups and debugging escalation state)
create index if not exists idx_source_urls_last_fetch_method
  on public.source_urls(last_fetch_method)
  where last_fetch_method is not null;

create index if not exists idx_source_urls_scrape_config on public.source_urls using gin (scrape_config);


-- ============================================================================
-- 4. changes indexes (from 001, 010)
-- ============================================================================

create index idx_changes_source_id on public.changes(source_id);
create index idx_changes_detected_at on public.changes(detected_at desc);
create index idx_changes_severity on public.changes(severity);
create index idx_changes_jurisdiction on public.changes(jurisdiction);
create index idx_changes_review_status on public.changes(review_status);

create index if not exists idx_changes_source_sequence
  on public.changes(source_id, chain_sequence desc nulls last);


-- ============================================================================
-- 5. practice_acknowledgments indexes (from 001)
-- ============================================================================

create index idx_practice_acknowledgments_practice_id on public.practice_acknowledgments(practice_id);


-- ============================================================================
-- 6. cost_events indexes (from 001)
-- ============================================================================

create index idx_cost_events_service on public.cost_events(service);
create index idx_cost_events_created_at on public.cost_events(created_at desc);


-- ============================================================================
-- 7. kg_entities indexes (from 007, 008, 019, 022, 023)
-- ============================================================================

-- From 007
create index idx_kg_entities_entity_type   on public.kg_entities(entity_type);
create index idx_kg_entities_jurisdiction  on public.kg_entities(jurisdiction);
create index idx_kg_entities_source_id     on public.kg_entities(source_id);
create index idx_kg_entities_change_id     on public.kg_entities(change_id);
create index idx_kg_entities_identifier    on public.kg_entities(identifier) where identifier is not null;

-- From 008
create index idx_kg_entities_type_id on public.kg_entities(entity_type_id);
create index idx_kg_entities_confidence on public.kg_entities(classification_confidence)
    where classification_confidence < 0.7;

-- From 019
create index if not exists idx_kg_entities_publication_date
  on public.kg_entities(publication_date desc) where publication_date is not null;
create index if not exists idx_kg_entities_document_type
  on public.kg_entities(document_type) where document_type is not null;
create index if not exists idx_kg_entities_comment_close_date
  on public.kg_entities(comment_close_date) where comment_close_date is not null;
create index if not exists idx_kg_entities_citation
  on public.kg_entities(citation) where citation is not null;

-- From 022
create index if not exists idx_kg_entities_authority_level
  on public.kg_entities(authority_level) where authority_level is not null;
create index if not exists idx_kg_entities_issuing_agency
  on public.kg_entities(issuing_agency) where issuing_agency is not null;

-- From 023 (full-text search)
create index if not exists idx_kg_entities_search on public.kg_entities using gin (search_vector);

-- From 023 (trigram fuzzy matching)
create index if not exists idx_kg_entities_name_trgm
  on public.kg_entities using gin (name gin_trgm_ops);

-- From 023 (JSONB indexes)
create index if not exists idx_kg_entities_meta
  on public.kg_entities using gin (metadata jsonb_path_ops);

create index if not exists idx_kg_entities_metadata_jurisdiction
  on public.kg_entities ((metadata->>'jurisdiction'))
  where metadata->>'jurisdiction' is not null;

create index if not exists idx_kg_entities_metadata_agency
  on public.kg_entities ((metadata->>'agency'))
  where metadata->>'agency' is not null;

create index if not exists idx_kg_entities_metadata_cfr_ref
  on public.kg_entities ((metadata->>'cfr_reference'))
  where metadata->>'cfr_reference' is not null;

-- Note: idx_kg_entities_identifier_source (from 020) was dropped in 021 and replaced with a constraint.
-- Note: this is a unique constraint, not an index, but included for completeness
-- alter table public.kg_entities add constraint kg_entities_identifier_source_key unique (identifier, source_id);


-- ============================================================================
-- 8. kg_relationships indexes (from 007, 008, 025)
-- ============================================================================

-- From 007
create index idx_kg_relationships_source    on public.kg_relationships(source_entity_id);
create index idx_kg_relationships_target    on public.kg_relationships(target_entity_id);
create index idx_kg_relationships_type      on public.kg_relationships(relationship_type);
-- Prevent duplicate directed edges of the same type
create unique index idx_kg_relationships_unique
    on public.kg_relationships(source_entity_id, target_entity_id, relationship_type);

-- From 008
create index idx_kg_relationships_type_id on public.kg_relationships(relationship_type_id);

-- From 025 (composite indexes for efficient relationship traversal by type)
create index if not exists idx_relationships_source_type
  on public.kg_relationships(source_entity_id, relationship_type);

create index if not exists idx_relationships_target_type
  on public.kg_relationships(target_entity_id, relationship_type);


-- ============================================================================
-- 9. kg_entity_versions indexes (from 007, 025)
-- ============================================================================

-- From 007
create index idx_kg_entity_versions_entity_id on public.kg_entity_versions(entity_id);

-- From 025
-- Unique constraint on (entity_id, version_date) for content-hash versioning.
-- WHERE version_date IS NOT NULL avoids conflict with legacy rows (version_number scheme).
create unique index if not exists idx_kg_entity_versions_date_unique
  on public.kg_entity_versions(entity_id, version_date)
  where version_date is not null;

-- Fast lookup for "most recent version of entity"
create index if not exists idx_kg_entity_versions_date_desc
  on public.kg_entity_versions(entity_id, version_date desc)
  where version_date is not null;


-- ============================================================================
-- 10. kg_entity_types indexes (from 008)
-- ============================================================================

create index idx_kg_entity_types_parent on public.kg_entity_types(parent_id);
create index idx_kg_entity_types_path on public.kg_entity_types(path);
create index idx_kg_entity_types_active on public.kg_entity_types(is_active) where is_active = true;


-- ============================================================================
-- 11. kg_relationship_types indexes (from 008)
-- ============================================================================

create index idx_kg_relationship_types_active on public.kg_relationship_types(is_active) where is_active = true;


-- ============================================================================
-- 12. kg_domains indexes (from 008, 022)
-- ============================================================================

-- From 022
create index if not exists idx_kg_domains_depth on public.kg_domains(depth);
create index if not exists idx_kg_domains_code on public.kg_domains(domain_code) where domain_code is not null;


-- ============================================================================
-- 13. kg_entity_domains indexes (from 008, 022)
-- ============================================================================

-- From 008
create index idx_entity_domains_domain on public.kg_entity_domains(domain_id);

-- From 022
create index if not exists idx_entity_domains_primary
  on public.kg_entity_domains(entity_id) where is_primary;


-- ============================================================================
-- 14. kg_entity_jurisdictions indexes (from 008)
-- ============================================================================

create index idx_entity_jurisdictions_jur on public.kg_entity_jurisdictions(jurisdiction_id);


-- ============================================================================
-- 15. classification_rules indexes (from 008, 022)
-- ============================================================================

-- From 008
create index idx_classification_rules_active on public.classification_rules(is_active, priority)
    where is_active = true;
create index idx_classification_rules_type on public.classification_rules(rule_type);

-- From 022
create index if not exists idx_classification_rules_stage
  on public.classification_rules(stage, is_active) where is_active = true;


-- ============================================================================
-- 16. classification_results indexes (from 008)
-- ============================================================================

create index idx_classification_results_entity on public.classification_results(entity_id)
    where is_current = true;
create index idx_classification_results_change on public.classification_results(change_id);
create index idx_classification_results_method on public.classification_results(classification_method);
create index idx_classification_results_confidence on public.classification_results(confidence)
    where confidence < 0.7;


-- ============================================================================
-- 17. classification_overrides indexes (from 008)
-- ============================================================================

create index idx_overrides_entity on public.classification_overrides(entity_id);
create index idx_overrides_change on public.classification_overrides(change_id);
create index idx_overrides_by on public.classification_overrides(overridden_by);


-- ============================================================================
-- 18. kg_entity_merges indexes (from 008)
-- ============================================================================

create index idx_merges_surviving on public.kg_entity_merges(surviving_entity_id);
create index idx_merges_merged on public.kg_entity_merges(merged_entity_id);


-- ============================================================================
-- 19. taxonomy_changelog indexes (from 008)
-- ============================================================================

create index idx_taxonomy_changelog_table on public.taxonomy_changelog(table_name, record_id);
create index idx_taxonomy_changelog_time on public.taxonomy_changelog(created_at desc);


-- ============================================================================
-- 20. crawl_templates indexes (from 011)
-- ============================================================================

create index idx_crawl_templates_active on public.crawl_templates(is_active) where is_active = true;


-- ============================================================================
-- 21. discovery_runs indexes (from 011)
-- ============================================================================

create index idx_discovery_runs_source on public.discovery_runs(source_url_id, created_at desc);
create index idx_discovery_runs_status on public.discovery_runs(status) where status != 'completed';


-- ============================================================================
-- 22. validation_log indexes (from 013)
-- ============================================================================

create index idx_validation_log_run_at on public.validation_log(run_at desc);


-- ============================================================================
-- 23. kg_practice_types indexes (from 022)
-- ============================================================================

-- (no standalone indexes — PK + unique constraints only)


-- ============================================================================
-- 24. kg_entity_practice_relevance indexes (from 022)
-- ============================================================================

create index if not exists idx_entity_practice_relevance_entity
  on public.kg_entity_practice_relevance(entity_id);
create index if not exists idx_entity_practice_relevance_type
  on public.kg_entity_practice_relevance(practice_type_id);
create index if not exists idx_entity_practice_relevance_score
  on public.kg_entity_practice_relevance(relevance_score desc);


-- ============================================================================
-- 25. kg_classification_log indexes (from 022)
-- ============================================================================

create index if not exists idx_classification_log_entity
  on public.kg_classification_log(entity_id);
create index if not exists idx_classification_log_stage
  on public.kg_classification_log(stage);
create index if not exists idx_classification_log_needs_review
  on public.kg_classification_log(needs_review) where needs_review = true;
create index if not exists idx_classification_log_created
  on public.kg_classification_log(classified_at desc);


-- ============================================================================
-- 26. kg_service_lines indexes (from 022)
-- ============================================================================

-- (no standalone indexes — PK + unique constraints only)


-- ============================================================================
-- 27. kg_service_line_regulations indexes (from 022)
-- ============================================================================

create index if not exists idx_service_line_regs_service
  on public.kg_service_line_regulations(service_line_id);
create index if not exists idx_service_line_regs_entity
  on public.kg_service_line_regulations(entity_id);


-- ============================================================================
-- 28. kg_domain_practice_type_map indexes (from 027)
-- ============================================================================

create index if not exists idx_domain_pt_map_domain
  on public.kg_domain_practice_type_map(domain_slug);
create index if not exists idx_domain_pt_map_all
  on public.kg_domain_practice_type_map(applies_to_all_types) where applies_to_all_types = true;
