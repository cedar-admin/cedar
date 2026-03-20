-- Migration: 012_normalized_diff.sql
-- Purpose: Add normalized_diff JSONB column to changes table for structured diff rendering
-- Tables affected: changes
-- Special considerations: None

-- Stores structured diff as a JSON array of {type, content} blocks:
--   [{ "type": "added"|"removed"|"unchanged", "content": "..." }, ...]
-- This format makes red/green diff UI trivial to build and avoids parsing
-- unified diff strings in the frontend.

alter table public.changes add column normalized_diff jsonb;

comment on column public.changes.normalized_diff is
  'Structured diff as JSON array of {type, content} blocks. type is one of: added, removed, unchanged.';
