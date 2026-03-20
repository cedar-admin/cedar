-- Migration: 016_hitl_columns.sql
-- Purpose: Add HITL review columns to changes table, expand review_status CHECK, update append-only trigger
-- Tables affected: changes
-- Special considerations: Replaces trigger from 010; adds reviewed_by, reviewed_at, review_action, review_notes columns

-- ── Column additions ──────────────────────────────────────────────────────────
alter table public.changes
  add column if not exists reviewed_by    text,
  add column if not exists reviewed_at    timestamptz,
  add column if not exists review_action  text,
  add column if not exists review_notes   text;

-- ── Expand review_status CHECK ────────────────────────────────────────────────
-- Drop the existing constraint (name from migration 001)
alter table public.changes drop constraint if exists changes_review_status_check;

alter table public.changes add constraint changes_review_status_check
  check (review_status in ('pending', 'pending_review', 'approved', 'rejected', 'auto_approved', 'not_required'));

-- ── Update append-only trigger to include new columns in allowlist ─────────────
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

comment on column public.changes.reviewed_by is 'WorkOS user ID of the reviewer who approved/rejected this change.';
comment on column public.changes.reviewed_at is 'Timestamp when the review decision was made.';
comment on column public.changes.review_action is 'The review decision: approve, reject, or edit.';
comment on column public.changes.review_notes is 'Optional notes from the reviewer explaining their decision.';
