-- ============================================================================
-- Cedar Migration 023: Full-Text Search, Trigram, JSONB Indexes + Facet View
-- Source: docs/architecture/data-architecture-research.md
-- ============================================================================

-- ── 1. pg_trgm extension (fuzzy matching) ─────────────────────────────────
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ── 2. search_vector column + GIN index ───────────────────────────────────
-- Weighted: name=A (most important), description=B
ALTER TABLE kg_entities
  ADD COLUMN IF NOT EXISTS search_vector tsvector;

UPDATE kg_entities SET search_vector =
  setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(description, '')), 'B');

CREATE INDEX IF NOT EXISTS idx_kg_entities_search ON kg_entities USING GIN (search_vector);

-- ── 3. Auto-update trigger for search_vector ──────────────────────────────
CREATE OR REPLACE FUNCTION kg_entities_search_vector_update()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_kg_entities_search_vector ON kg_entities;
CREATE TRIGGER trg_kg_entities_search_vector
  BEFORE INSERT OR UPDATE OF name, description ON kg_entities
  FOR EACH ROW EXECUTE FUNCTION kg_entities_search_vector_update();

-- ── 4. Trigram GIN index on name (fuzzy matching) ─────────────────────────
CREATE INDEX IF NOT EXISTS idx_kg_entities_name_trgm
  ON kg_entities USING GIN (name gin_trgm_ops);

-- ── 5. JSONB indexes ──────────────────────────────────────────────────────
-- Full JSONB GIN index (jsonb_path_ops = 40% smaller per research doc)
CREATE INDEX IF NOT EXISTS idx_kg_entities_meta
  ON kg_entities USING GIN (metadata jsonb_path_ops);

-- Expression indexes for frequently filtered JSONB fields (from research doc)
CREATE INDEX IF NOT EXISTS idx_kg_entities_metadata_jurisdiction
  ON kg_entities ((metadata->>'jurisdiction'))
  WHERE metadata->>'jurisdiction' IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_kg_entities_metadata_agency
  ON kg_entities ((metadata->>'agency'))
  WHERE metadata->>'agency' IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_kg_entities_metadata_cfr_ref
  ON kg_entities ((metadata->>'cfr_reference'))
  WHERE metadata->>'cfr_reference' IS NOT NULL;

-- ── 6. Materialized view for faceted navigation ───────────────────────────
-- Design from research doc: LEFT JOINs to get entity_type name + domain name
-- Groups by jurisdiction, agency (from metadata), entity_type, domain

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_corpus_facets AS
SELECT
  metadata->>'jurisdiction'  AS jurisdiction,
  metadata->>'agency'        AS agency,
  t.name                     AS entity_type,
  d.name                     AS domain,
  COUNT(*)                   AS doc_count
FROM kg_entities e
LEFT JOIN kg_entity_types t ON e.entity_type_id = t.id
LEFT JOIN kg_entity_domains ed ON e.id = ed.entity_id AND ed.is_primary = true
LEFT JOIN kg_domains d ON ed.domain_id = d.id
GROUP BY 1, 2, 3, 4;

-- NULLS NOT DISTINCT requires PostgreSQL 15. Supabase is PG 15 — safe to use.
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_corpus_facets
  ON mv_corpus_facets (jurisdiction, agency, entity_type, domain)
  NULLS NOT DISTINCT;

-- ── 7. Helper RPC for materialized view refresh ───────────────────────────
-- Called from Inngest corpus-classify at end of each run
CREATE OR REPLACE FUNCTION refresh_corpus_facets()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_corpus_facets;
END;
$$;
