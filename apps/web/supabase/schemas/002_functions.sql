-- ============================================================================
-- Cedar Declarative Schema: Functions & Triggers
-- ============================================================================
-- This file represents the desired final state of all database functions
-- and triggers. It is NOT executed as a migration.
--
-- Source: consolidated from migrations 003, 007, 008, 010, 016, 023, 027
-- ============================================================================


-- ============================================================================
-- enforce_changes_append_only()
-- Source: 016_hitl_columns.sql (final version; replaces 003, 010)
-- ============================================================================

create or replace function public.enforce_changes_append_only()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  allowed_update_columns constant text[] := array[
    'review_status',
    'reviewed_by',
    'reviewed_at',
    'review_action',
    'review_notes',
    'superseded_by'
  ];
  col      text;
  old_val  text;
  new_val  text;
begin
  if tg_op = 'DELETE' then
    raise exception 'changes table is append-only. Records cannot be deleted.';
  end if;

  if tg_op = 'UPDATE' then
    for col in
      select column_name
      from information_schema.columns
      where table_schema = 'public' and table_name = 'changes'
    loop
      continue when col = any(allowed_update_columns);
      old_val := (hstore(old) -> col);
      new_val := (hstore(new) -> col);
      if old_val is distinct from new_val then
        raise exception
          'changes table is append-only. Column "%" cannot be modified after insert. Use superseded_by to correct a change record.', col;
      end if;
    end loop;
    return new;
  end if;

  return new;
end;
$$;

drop trigger if exists changes_append_only on public.changes;

create trigger changes_append_only
  before update or delete on public.changes
  for each row execute function public.enforce_changes_append_only();


-- ============================================================================
-- update_system_config_timestamp()
-- Source: 003_rls_policies.sql
-- ============================================================================

create or replace function public.update_system_config_timestamp()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger system_config_updated_at
  before update on public.system_config
  for each row execute function public.update_system_config_timestamp();


-- ============================================================================
-- update_kg_entities_updated_at()
-- Source: 007_kg_foundation.sql
-- ============================================================================

create or replace function public.update_kg_entities_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create trigger trg_kg_entities_updated_at
    before update on public.kg_entities
    for each row execute function public.update_kg_entities_updated_at();


-- ============================================================================
-- compute_entity_type_path()
-- Source: 008_ontology_schema.sql
-- ============================================================================

create or replace function public.compute_entity_type_path()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
    if new.parent_id is null then
        new.depth := 0;
        new.path := new.slug;
    else
        select depth + 1, path || '/' || new.slug
        into new.depth, new.path
        from public.kg_entity_types where id = new.parent_id;

        if new.depth > 3 then
            raise exception 'Entity type hierarchy cannot exceed 3 levels deep';
        end if;
    end if;
    return new;
end;
$$;

create trigger trg_entity_type_path
    before insert or update of parent_id, slug on public.kg_entity_types
    for each row execute function public.compute_entity_type_path();


-- ============================================================================
-- prevent_override_mutation()
-- Source: 008_ontology_schema.sql
-- ============================================================================

create or replace function public.prevent_override_mutation()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
    raise exception 'classification_overrides table is append-only.';
end;
$$;

create trigger enforce_override_append_only
    before update or delete on public.classification_overrides
    for each row execute function public.prevent_override_mutation();


-- ============================================================================
-- prevent_merge_mutation()
-- Source: 008_ontology_schema.sql
-- ============================================================================

create or replace function public.prevent_merge_mutation()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
    raise exception 'kg_entity_merges table is append-only.';
end;
$$;

create trigger enforce_merge_append_only
    before update or delete on public.kg_entity_merges
    for each row execute function public.prevent_merge_mutation();


-- ============================================================================
-- prevent_changelog_mutation()
-- Source: 008_ontology_schema.sql
-- ============================================================================

create or replace function public.prevent_changelog_mutation()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
    raise exception 'taxonomy_changelog table is append-only.';
end;
$$;

create trigger enforce_changelog_append_only
    before update or delete on public.taxonomy_changelog
    for each row execute function public.prevent_changelog_mutation();


-- ============================================================================
-- kg_entities_search_vector_update()
-- Source: 023_search_indexes.sql
-- ============================================================================

create or replace function public.kg_entities_search_vector_update()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.description, '')), 'B');
  return new;
end;
$$;

drop trigger if exists trg_kg_entities_search_vector on public.kg_entities;
create trigger trg_kg_entities_search_vector
  before insert or update of name, description on public.kg_entities
  for each row execute function public.kg_entities_search_vector_update();


-- ============================================================================
-- refresh_corpus_facets()
-- Source: 023_search_indexes.sql
-- ============================================================================

create or replace function public.refresh_corpus_facets()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  refresh materialized view concurrently public.mv_corpus_facets;
end;
$$;


-- ============================================================================
-- refresh_practice_relevance_summary()
-- Source: 027_phase3_schema.sql
-- ============================================================================

create or replace function public.refresh_practice_relevance_summary()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  refresh materialized view concurrently public.mv_practice_relevance_summary;
end;
$$;
