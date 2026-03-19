-- ============================================================================
-- Cedar Migration 025: Phase 2 Schema — Relationship Enrichment + Versioning
-- Based on: docs/architecture/data-architecture-research.md (Phase 2)
-- ============================================================================

-- ── 1. Relationship type enum ──────────────────────────────────────────────
-- NOTE: kg_relationships already has relationship_type TEXT column (migration 007).
-- This enum is a NEW column alongside it — old TEXT column stays for backwards compat.
-- When new rows are inserted, set BOTH columns in sync.

DO $$ BEGIN
  CREATE TYPE relationship_type_enum AS ENUM (
    'amends',           -- FR document modifies CFR section
    'amended_by',       -- inverse
    'supersedes',       -- new regulation replaces old
    'superseded_by',    -- inverse
    'implements',       -- regulation implements a statute
    'interprets',       -- guidance/notice interprets regulation
    'cites',            -- document references another
    'cited_by',         -- inverse
    'corrects',         -- correction of another document
    'part_of',          -- section → part → chapter hierarchy
    'has_legal_basis',  -- regulation → authorizing statute
    'conflicts_with',   -- identified regulatory conflict
    'related_to',       -- general association
    'delegates_to',     -- authority delegation
    'enables',          -- permits an activity
    'restricts'         -- constrains an activity
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── 2. Extend kg_relationships ─────────────────────────────────────────────
-- Existing columns: relationship_type TEXT, confidence DECIMAL(3,2), notes TEXT, source_change_id

ALTER TABLE kg_relationships
  ADD COLUMN IF NOT EXISTS rel_type         relationship_type_enum,
  ADD COLUMN IF NOT EXISTS effective_date   DATE,
  ADD COLUMN IF NOT EXISTS end_date         DATE,
  ADD COLUMN IF NOT EXISTS provenance       TEXT,
    -- 'api_cfr_references' | 'api_correction_of' | 'nlp_extracted' | 'manual'
  ADD COLUMN IF NOT EXISTS fr_citation      TEXT;
    -- e.g. '89 FR 1433'

-- Composite indexes for efficient relationship traversal by type
CREATE INDEX IF NOT EXISTS idx_relationships_source_type
  ON kg_relationships(source_entity_id, relationship_type);

CREATE INDEX IF NOT EXISTS idx_relationships_target_type
  ON kg_relationships(target_entity_id, relationship_type);

-- ── 3. Extend kg_entity_versions with content-hash versioning ─────────────
-- Existing columns: version_number INTEGER, snapshot JSONB, change_id
-- Phase 2 adds content-hash based versioning (FRBR Expression model).
-- version_date can be NULL on pre-Phase-2 rows (version_number scheme).

ALTER TABLE kg_entity_versions
  ADD COLUMN IF NOT EXISTS version_date         DATE,
  ADD COLUMN IF NOT EXISTS content_hash         TEXT,    -- SHA-256 of content_snapshot
  ADD COLUMN IF NOT EXISTS content_snapshot     TEXT,    -- full regulation text at this point
  ADD COLUMN IF NOT EXISTS fr_document_number   TEXT,    -- FR doc that triggered this version
  ADD COLUMN IF NOT EXISTS change_summary       TEXT;    -- AI-generated summary of what changed

-- Unique constraint on (entity_id, version_date) for content-hash versioning.
-- WHERE version_date IS NOT NULL avoids conflict with legacy rows (version_number scheme).
CREATE UNIQUE INDEX IF NOT EXISTS idx_kg_entity_versions_date_unique
  ON kg_entity_versions(entity_id, version_date)
  WHERE version_date IS NOT NULL;

-- Fast lookup for "most recent version of entity"
CREATE INDEX IF NOT EXISTS idx_kg_entity_versions_date_desc
  ON kg_entity_versions(entity_id, version_date DESC)
  WHERE version_date IS NOT NULL;
