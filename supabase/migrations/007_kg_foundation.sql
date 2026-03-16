-- ============================================================================
-- Migration 007: Knowledge Graph Foundation Tables
-- Creates kg_entities, kg_relationships, and kg_entity_versions.
-- These are the base tables that migration 008 (ontology schema) extends
-- with entity_type_id, relationship_type_id, and classification columns.
-- ============================================================================

-- ── kg_entities ──────────────────────────────────────────────────────────────
-- Each row is a discrete regulatory artifact: a statute, rule, guidance doc,
-- enforcement action, etc. Entity type is stored as TEXT here and upgraded to
-- a FK in migration 008 when kg_entity_types is available.

CREATE TABLE kg_entities (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    description     TEXT,
    entity_type     TEXT NOT NULL,           -- human-readable slug, e.g. 'regulation'
    jurisdiction    TEXT NOT NULL DEFAULT 'FL',
    status          TEXT,                    -- e.g. 'active', 'proposed', 'superseded'
    identifier      TEXT,                    -- official document number or citation
    effective_date  DATE,
    source_id       UUID REFERENCES sources(id),
    change_id       UUID REFERENCES changes(id),
    external_url    TEXT,
    metadata        JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_kg_entities_entity_type   ON kg_entities(entity_type);
CREATE INDEX idx_kg_entities_jurisdiction  ON kg_entities(jurisdiction);
CREATE INDEX idx_kg_entities_source_id     ON kg_entities(source_id);
CREATE INDEX idx_kg_entities_change_id     ON kg_entities(change_id);
CREATE INDEX idx_kg_entities_identifier    ON kg_entities(identifier) WHERE identifier IS NOT NULL;

-- ── kg_relationships ──────────────────────────────────────────────────────────
-- Directed edges between entities. relationship_type is stored as TEXT here
-- and upgraded to a FK in migration 008.

CREATE TABLE kg_relationships (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_entity_id    UUID NOT NULL REFERENCES kg_entities(id) ON DELETE CASCADE,
    target_entity_id    UUID NOT NULL REFERENCES kg_entities(id) ON DELETE CASCADE,
    relationship_type   TEXT NOT NULL,       -- e.g. 'supersedes', 'amends', 'implements'
    confidence          DECIMAL(3,2),        -- 0.00-1.00, null = manually asserted (certain)
    notes               TEXT,
    source_change_id    UUID REFERENCES changes(id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_kg_relationships_source    ON kg_relationships(source_entity_id);
CREATE INDEX idx_kg_relationships_target    ON kg_relationships(target_entity_id);
CREATE INDEX idx_kg_relationships_type      ON kg_relationships(relationship_type);
-- Prevent duplicate directed edges of the same type
CREATE UNIQUE INDEX idx_kg_relationships_unique
    ON kg_relationships(source_entity_id, target_entity_id, relationship_type);

-- ── kg_entity_versions ───────────────────────────────────────────────────────
-- Immutable snapshots of entity state over time.
-- Linked to the changes that caused each version to be created.

CREATE TABLE kg_entity_versions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id       UUID NOT NULL REFERENCES kg_entities(id) ON DELETE CASCADE,
    version_number  INTEGER NOT NULL,
    snapshot        JSONB NOT NULL,          -- full entity state at this version
    change_id       UUID REFERENCES changes(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (entity_id, version_number)
);

CREATE INDEX idx_kg_entity_versions_entity_id ON kg_entity_versions(entity_id);

-- ── updated_at trigger ───────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_kg_entities_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_kg_entities_updated_at
    BEFORE UPDATE ON kg_entities
    FOR EACH ROW EXECUTE FUNCTION update_kg_entities_updated_at();

-- ── RLS ──────────────────────────────────────────────────────────────────────

ALTER TABLE kg_entities          ENABLE ROW LEVEL SECURITY;
ALTER TABLE kg_relationships     ENABLE ROW LEVEL SECURITY;
ALTER TABLE kg_entity_versions   ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read all KG data (no practice-scoping needed — KG is shared)
CREATE POLICY "kg_entities_select" ON kg_entities
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "kg_relationships_select" ON kg_relationships
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "kg_entity_versions_select" ON kg_entity_versions
    FOR SELECT TO authenticated USING (true);

-- Admin role has full write access
CREATE POLICY "kg_entities_admin" ON kg_entities
    FOR ALL TO authenticated
    USING  ((auth.jwt() ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() ->> 'role') = 'admin');
CREATE POLICY "kg_relationships_admin" ON kg_relationships
    FOR ALL TO authenticated
    USING  ((auth.jwt() ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() ->> 'role') = 'admin');
CREATE POLICY "kg_entity_versions_admin" ON kg_entity_versions
    FOR ALL TO authenticated
    USING  ((auth.jwt() ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- Service role bypasses RLS (Inngest pipeline writes use service role)
