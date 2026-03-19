-- ============================================================================
-- Cedar Migration 020: Unique Index on kg_entities for Corpus Upsert Dedup
-- ============================================================================
-- Enables ON CONFLICT upsert: same identifier from the same source = same entity.
-- Partial index so NULL identifiers (e.g. inline KG entities from monitor.ts)
-- are excluded and do not conflict with each other.
-- ============================================================================

CREATE UNIQUE INDEX IF NOT EXISTS idx_kg_entities_identifier_source
  ON kg_entities(identifier, source_id)
  WHERE identifier IS NOT NULL AND source_id IS NOT NULL;
