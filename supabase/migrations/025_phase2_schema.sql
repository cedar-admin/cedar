-- Migration: 025_phase2_schema.sql
-- Purpose: Phase 2 schema extensions — relationship enrichment, entity version content-hash tracking
-- Tables affected: kg_relationships, kg_entity_versions
-- Special considerations: Adds relationship_type_enum; extends existing columns without breaking Phase 1 data

-- ── 1. Relationship type enum ──────────────────────────────────────────────
-- NOTE: kg_relationships already has relationship_type TEXT column (migration 007).
-- This enum is a NEW column alongside it — old TEXT column stays for backwards compat.
-- When new rows are inserted, set BOTH columns in sync.

do $$ begin
  create type relationship_type_enum as enum (
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
exception when duplicate_object then null;
end $$;

-- ── 2. Extend kg_relationships ─────────────────────────────────────────────
-- Existing columns: relationship_type TEXT, confidence DECIMAL(3,2), notes TEXT, source_change_id

alter table public.kg_relationships
  add column if not exists rel_type         relationship_type_enum,
  add column if not exists effective_date   date,
  add column if not exists end_date         date,
  add column if not exists provenance       text,
    -- 'api_cfr_references' | 'api_correction_of' | 'nlp_extracted' | 'manual'
  add column if not exists fr_citation      text;
    -- e.g. '89 FR 1433'

-- Composite indexes for efficient relationship traversal by type
create index if not exists idx_relationships_source_type
  on public.kg_relationships(source_entity_id, relationship_type);

create index if not exists idx_relationships_target_type
  on public.kg_relationships(target_entity_id, relationship_type);

-- ── 3. Extend kg_entity_versions with content-hash versioning ─────────────
-- Existing columns: version_number INTEGER, snapshot JSONB, change_id
-- Phase 2 adds content-hash based versioning (FRBR Expression model).
-- version_date can be NULL on pre-Phase-2 rows (version_number scheme).

alter table public.kg_entity_versions
  add column if not exists version_date         date,
  add column if not exists content_hash         text,    -- SHA-256 of content_snapshot
  add column if not exists content_snapshot     text,    -- full regulation text at this point
  add column if not exists fr_document_number   text,    -- FR doc that triggered this version
  add column if not exists change_summary       text;    -- AI-generated summary of what changed

-- Unique constraint on (entity_id, version_date) for content-hash versioning.
-- WHERE version_date IS NOT NULL avoids conflict with legacy rows (version_number scheme).
create unique index if not exists idx_kg_entity_versions_date_unique
  on public.kg_entity_versions(entity_id, version_date)
  where version_date is not null;

-- Fast lookup for "most recent version of entity"
create index if not exists idx_kg_entity_versions_date_desc
  on public.kg_entity_versions(entity_id, version_date desc)
  where version_date is not null;
