-- Cedar: Add soft delete support to practices table
-- deleted_at IS NULL = active; deleted_at IS NOT NULL = soft-deleted
ALTER TABLE practices
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL DEFAULT NULL;

COMMENT ON COLUMN practices.deleted_at IS
  'Soft delete timestamp. NULL = active. Set to now() on admin delete. Row is preserved for audit.';
