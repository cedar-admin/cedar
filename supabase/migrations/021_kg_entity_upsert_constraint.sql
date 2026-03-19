-- ============================================================================
-- Cedar Migration 021: Replace partial index with named unique constraint
-- ============================================================================
-- The partial index from migration 020 is not recognized by PostgREST's
-- ON CONFLICT clause — upsert fails with "no unique constraint matching
-- the ON CONFLICT specification".
--
-- Fix: drop the partial index, add a named unique constraint.
-- PostgreSQL NULL semantics guarantee NULLs never equal each other, so rows
-- with identifier=NULL still don't conflict under a full unique constraint.
-- ============================================================================

DROP INDEX IF EXISTS idx_kg_entities_identifier_source;

ALTER TABLE kg_entities
  ADD CONSTRAINT kg_entities_identifier_source_key
  UNIQUE (identifier, source_id);
