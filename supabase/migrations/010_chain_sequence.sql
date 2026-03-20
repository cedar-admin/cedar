-- Migration: 010_chain_sequence.sql
-- Purpose: Add chain sequence columns and replace append-only trigger with column-allowlist version
-- Tables affected: changes
-- Special considerations: Replaces trigger from 003; allows HITL review columns to be updated while blocking all others

-- ── hstore extension (needed for column-level change detection in trigger) ──
create extension if not exists hstore;

-- ── Column additions ──────────────────────────────────────────────────────────
alter table public.changes
  add column if not exists prev_chain_hash text,
  add column if not exists chain_sequence  integer;

create index if not exists idx_changes_source_sequence
  on public.changes(source_id, chain_sequence desc nulls last);

comment on column public.changes.prev_chain_hash is
  'chain_hash of the immediately prior change for this source. NULL on first record.';
comment on column public.changes.chain_sequence is
  'Monotonically increasing sequence number within this source chain (1-based).';

-- ── Replace trigger with column-allowlist version ─────────────────────────────
-- DELETEs: still unconditionally blocked.
-- UPDATEs: only review workflow columns may change; everything else raises.

create or replace function public.enforce_changes_append_only()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  allowed_update_columns constant text[] := array[
    'review_status',
    'reviewed_by',
    'reviewed_at',
    'review_action',
    'review_notes',
    'superseded_by'
  ];
  col      text;
  old_val  text;
  new_val  text;
begin
  if tg_op = 'DELETE' then
    raise exception 'changes table is append-only. Records cannot be deleted.';
  end if;

  if tg_op = 'UPDATE' then
    for col in
      select column_name
      from information_schema.columns
      where table_schema = 'public' and table_name = 'changes'
    loop
      continue when col = any(allowed_update_columns);
      old_val := (hstore(old) -> col);
      new_val := (hstore(new) -> col);
      if old_val is distinct from new_val then
        raise exception
          'changes table is append-only. Column "%" cannot be modified after insert. Use superseded_by to correct a change record.', col;
      end if;
    end loop;
    return new;
  end if;

  return new;
end;
$$;

drop trigger if exists changes_append_only on public.changes;

create trigger changes_append_only
  before update or delete on public.changes
  for each row execute function public.enforce_changes_append_only();
