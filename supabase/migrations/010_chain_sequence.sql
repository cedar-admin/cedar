-- Migration 010: Chain sequence + prev_chain_hash + trigger fix
--
-- 1. Adds prev_chain_hash and chain_sequence to changes table.
-- 2. Replaces the total-block append-only trigger with a column-allowlist
--    version that still enforces append-only semantics but permits updates
--    to the review workflow columns (review_status, reviewed_by, etc.).
--    Required by both Module 6B (HITL review) and the Module 5 chain test.
--
-- Existing rows are left with NULL chain_sequence / prev_chain_hash.

-- ── hstore extension (needed for column-level change detection in trigger) ──
CREATE EXTENSION IF NOT EXISTS hstore;

-- ── Column additions ──────────────────────────────────────────────────────────
ALTER TABLE changes
  ADD COLUMN IF NOT EXISTS prev_chain_hash TEXT,
  ADD COLUMN IF NOT EXISTS chain_sequence  INTEGER;

CREATE INDEX IF NOT EXISTS idx_changes_source_sequence
  ON changes(source_id, chain_sequence DESC NULLS LAST);

COMMENT ON COLUMN changes.prev_chain_hash IS
  'chain_hash of the immediately prior change for this source. NULL on first record.';
COMMENT ON COLUMN changes.chain_sequence IS
  'Monotonically increasing sequence number within this source chain (1-based).';

-- ── Replace trigger with column-allowlist version ─────────────────────────────
-- DELETEs: still unconditionally blocked.
-- UPDATEs: only review workflow columns may change; everything else raises.

CREATE OR REPLACE FUNCTION enforce_changes_append_only()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  ALLOWED_UPDATE_COLUMNS CONSTANT TEXT[] := ARRAY[
    'review_status',
    'reviewed_by',
    'reviewed_at',
    'review_action',
    'review_notes',
    'superseded_by'
  ];
  col      TEXT;
  old_val  TEXT;
  new_val  TEXT;
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'changes table is append-only. Records cannot be deleted.';
  END IF;

  IF TG_OP = 'UPDATE' THEN
    FOR col IN
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'changes'
    LOOP
      CONTINUE WHEN col = ANY(ALLOWED_UPDATE_COLUMNS);
      old_val := (hstore(OLD) -> col);
      new_val := (hstore(NEW) -> col);
      IF old_val IS DISTINCT FROM new_val THEN
        RAISE EXCEPTION
          'changes table is append-only. Column "%" cannot be modified after insert. Use superseded_by to correct a change record.', col;
      END IF;
    END LOOP;
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS changes_append_only ON changes;

CREATE TRIGGER changes_append_only
  BEFORE UPDATE OR DELETE ON changes
  FOR EACH ROW EXECUTE FUNCTION enforce_changes_append_only();
