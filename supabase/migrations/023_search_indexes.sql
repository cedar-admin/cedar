-- Migration: 023_search_indexes.sql
-- Purpose: Full-text search, trigram indexes, JSONB indexes, materialized facet view, and search vector trigger
-- Tables affected: kg_entities (alter + indexes), mv_corpus_facets (materialized view)
-- Special considerations: pg_trgm extension; security definer function for materialized view refresh

-- ── 1. pg_trgm extension (fuzzy matching) ─────────────────────────────────
create extension if not exists pg_trgm;

-- ── 2. search_vector column + GIN index ───────────────────────────────────
-- Weighted: name=A (most important), description=B
alter table public.kg_entities
  add column if not exists search_vector tsvector;

update public.kg_entities set search_vector =
  setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(description, '')), 'B');

create index if not exists idx_kg_entities_search on public.kg_entities using gin (search_vector);

-- ── 3. Auto-update trigger for search_vector ──────────────────────────────
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

-- ── 4. Trigram GIN index on name (fuzzy matching) ─────────────────────────
create index if not exists idx_kg_entities_name_trgm
  on public.kg_entities using gin (name gin_trgm_ops);

-- ── 5. JSONB indexes ──────────────────────────────────────────────────────
-- Full JSONB GIN index (jsonb_path_ops = 40% smaller per research doc)
create index if not exists idx_kg_entities_meta
  on public.kg_entities using gin (metadata jsonb_path_ops);

-- Expression indexes for frequently filtered JSONB fields (from research doc)
create index if not exists idx_kg_entities_metadata_jurisdiction
  on public.kg_entities ((metadata->>'jurisdiction'))
  where metadata->>'jurisdiction' is not null;

create index if not exists idx_kg_entities_metadata_agency
  on public.kg_entities ((metadata->>'agency'))
  where metadata->>'agency' is not null;

create index if not exists idx_kg_entities_metadata_cfr_ref
  on public.kg_entities ((metadata->>'cfr_reference'))
  where metadata->>'cfr_reference' is not null;

-- ── 6. Materialized view for faceted navigation ───────────────────────────
-- Design from research doc: LEFT JOINs to get entity_type name + domain name
-- Groups by jurisdiction, agency (from metadata), entity_type, domain

create materialized view if not exists public.mv_corpus_facets as
select
  metadata->>'jurisdiction'  as jurisdiction,
  metadata->>'agency'        as agency,
  t.name                     as entity_type,
  d.name                     as domain,
  count(*)                   as doc_count
from public.kg_entities e
left join public.kg_entity_types t on e.entity_type_id = t.id
left join public.kg_entity_domains ed on e.id = ed.entity_id and ed.is_primary = true
left join public.kg_domains d on ed.domain_id = d.id
group by 1, 2, 3, 4;

-- NULLS NOT DISTINCT requires PostgreSQL 15. Supabase is PG 15 — safe to use.
create unique index if not exists idx_mv_corpus_facets
  on public.mv_corpus_facets (jurisdiction, agency, entity_type, domain)
  nulls not distinct;

-- ── 7. Helper RPC for materialized view refresh ───────────────────────────
-- Called from Inngest corpus-classify at end of each run
-- security definer required: materialized view refresh requires owner privileges
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
