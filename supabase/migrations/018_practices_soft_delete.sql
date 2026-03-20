-- Migration: 018_practices_soft_delete.sql
-- Purpose: Add soft delete support (deleted_at column) to practices table
-- Tables affected: practices
-- Special considerations: Add index on deleted_at for filtering active/deleted records

-- Cedar: Add soft delete support to practices table
-- deleted_at IS NULL = active; deleted_at IS NOT NULL = soft-deleted
alter table public.practices
  add column if not exists deleted_at timestamptz null default null;

comment on column public.practices.deleted_at is
  'Soft delete timestamp. NULL = active. Set to now() on admin delete. Row is preserved for audit.';

create index idx_practices_deleted_at on public.practices(deleted_at) where deleted_at is not null;
