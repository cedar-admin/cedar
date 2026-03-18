-- Migration 016: Add missing HITL columns to changes table + expand review_status CHECK
--
-- 1. Adds reviewed_by, reviewed_at, review_action, review_notes columns
--    (referenced in CLAUDE.md and the append-only trigger allowlist but never created)
-- 2. Drops old review_status CHECK and replaces with expanded set
--    (adds pending_review and not_required for Module 6B)
-- 3. Updates enforce_changes_append_only trigger to include the new columns

-- ── Column additions ──────────────────────────────────────────────────────────
ALTER TABLE changes
  ADD COLUMN IF NOT EXISTS reviewed_by    TEXT,
  ADD COLUMN IF NOT EXISTS reviewed_at    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS review_action  TEXT,
  ADD COLUMN IF NOT EXISTS review_notes   TEXT;

-- ── Expand review_status CHECK ────────────────────────────────────────────────
-- Drop the existing constraint (name from migration 001)
ALTER TABLE changes DROP CONSTRAINT IF EXISTS changes_review_status_check;

ALTER TABLE changes ADD CONSTRAINT changes_review_status_check
  CHECK (review_status IN ('pending', 'pending_review', 'approved', 'rejected', 'auto_approved', 'not_required'));

-- ── Update append-only trigger to include new columns in allowlist ─────────────
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

COMMENT ON COLUMN changes.reviewed_by IS 'WorkOS user ID of the reviewer who approved/rejected this change.';
COMMENT ON COLUMN changes.reviewed_at IS 'Timestamp when the review decision was made.';
COMMENT ON COLUMN changes.review_action IS 'The review decision: approve, reject, or edit.';
COMMENT ON COLUMN changes.review_notes IS 'Optional notes from the reviewer explaining their decision.';
