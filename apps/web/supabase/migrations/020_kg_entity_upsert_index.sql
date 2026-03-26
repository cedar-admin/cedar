-- Migration: 020_kg_entity_upsert_index.sql
-- Purpose: Create unique partial index on kg_entities(identifier, source_id) for corpus upsert dedup
-- Tables affected: kg_entities
-- Special considerations: Partial index excludes NULL identifiers; replaced by constraint in 021

-- Enables ON CONFLICT upsert: same identifier from the same source = same entity.
-- Partial index so NULL identifiers (e.g. inline KG entities from monitor.ts)
-- are excluded and do not conflict with each other.

create unique index if not exists idx_kg_entities_identifier_source
  on public.kg_entities(identifier, source_id)
  where identifier is not null and source_id is not null;
