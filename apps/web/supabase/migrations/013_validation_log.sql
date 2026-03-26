-- Migration: 013_validation_log.sql
-- Purpose: Create validation_log table for weekly audit chain validation results
-- Tables affected: validation_log
-- Special considerations: None

create table public.validation_log (
  id              uuid primary key default gen_random_uuid(),
  run_at          timestamptz not null default now(),
  run_type        text not null default 'weekly_chain_validation',
  sources_checked int not null default 0,
  chains_valid    int not null default 0,
  chains_broken   int not null default 0,
  total_changes   int not null default 0,
  -- Array of { change_id, chain_sequence, type, expected, actual, source_id } objects
  errors          jsonb not null default '[]',
  summary         text,
  created_at      timestamptz not null default now()
);

create index idx_validation_log_run_at on public.validation_log(run_at desc);

alter table public.validation_log enable row level security;

-- Authenticated users can read validation logs
create policy "validation_log_select_authenticated" on public.validation_log
  for select to authenticated
  using (true);

-- Admin role has full access
create policy "validation_log_select_admin" on public.validation_log
  for select to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin');

create policy "validation_log_insert_admin" on public.validation_log
  for insert to authenticated
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "validation_log_update_admin" on public.validation_log
  for update to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin')
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "validation_log_delete_admin" on public.validation_log
  for delete to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin');

comment on table public.validation_log is
  'One row per weekly audit chain validation run. chains_broken > 0 indicates tamper detection.';
