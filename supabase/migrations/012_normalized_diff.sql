-- ============================================================================
-- Cedar — Migration 012
-- Add normalized_diff JSONB column to changes table
-- ============================================================================
-- Stores structured diff as a JSON array of {type, content} blocks:
--   [{ "type": "added"|"removed"|"unchanged", "content": "..." }, ...]
-- This format makes red/green diff UI trivial to build and avoids parsing
-- unified diff strings in the frontend.
-- ============================================================================

ALTER TABLE changes ADD COLUMN normalized_diff JSONB;

COMMENT ON COLUMN changes.normalized_diff IS
  'Structured diff as JSON array of {type, content} blocks. type is one of: added, removed, unchanged.';
