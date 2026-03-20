-- Migration: 021_kg_entity_upsert_constraint.sql
-- Purpose: Replace partial index with named unique constraint for PostgREST ON CONFLICT compatibility
-- Tables affected: kg_entities
-- Special considerations: Drops index from 020 — PostgREST cannot use partial indexes for ON CONFLICT

-- The partial index from migration 020 is not recognized by PostgREST's
-- ON CONFLICT clause — upsert fails with "no unique constraint matching
-- the ON CONFLICT specification".
--
-- Fix: drop the partial index, add a named unique constraint.
-- PostgreSQL NULL semantics guarantee NULLs never equal each other, so rows
-- with identifier=NULL still don't conflict under a full unique constraint.

drop index if exists public.idx_kg_entities_identifier_source; -- dropping partial index: PostgREST does not recognize partial indexes for ON CONFLICT upsert

alter table public.kg_entities
  add constraint kg_entities_identifier_source_key
  unique (identifier, source_id);
