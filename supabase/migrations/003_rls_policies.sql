-- Migration: 003_rls_policies.sql
-- Purpose: RLS policies for core tables, append-only trigger on changes, auto-update timestamp on system_config
-- Tables affected: sources, source_urls, feature_flags, review_rules, system_config, prompt_templates, practices, changes, practice_acknowledgments, review_actions, cost_events
-- Special considerations: RLS enablement moved to 001/002; practices_own and acknowledgments_own split into per-operation policies

-- ============================================================
-- Sources: readable by all authenticated users, writable by service role only
-- ============================================================
create policy "sources_select_authenticated" on public.sources
  for select to authenticated
  using (true);

create policy "source_urls_select_authenticated" on public.source_urls
  for select to authenticated
  using (true);

-- ============================================================
-- Config tables: readable by all authenticated users
-- ============================================================
create policy "feature_flags_select_authenticated" on public.feature_flags
  for select to authenticated
  using (true);

create policy "review_rules_select_authenticated" on public.review_rules
  for select to authenticated
  using (true);

create policy "system_config_select_authenticated" on public.system_config
  for select to authenticated
  using (true);

create policy "prompt_templates_select_authenticated" on public.prompt_templates
  for select to authenticated
  using (is_active = true);

-- ============================================================
-- Practices: owners see only their own practice (split into per-operation policies)
-- ============================================================
create policy "practices_select_owner" on public.practices
  for select to authenticated
  using (owner_email = ((select auth.jwt()) ->> 'email'));

create policy "practices_insert_owner" on public.practices
  for insert to authenticated
  with check (owner_email = ((select auth.jwt()) ->> 'email'));

create policy "practices_update_owner" on public.practices
  for update to authenticated
  using (owner_email = ((select auth.jwt()) ->> 'email'))
  with check (owner_email = ((select auth.jwt()) ->> 'email'));

create policy "practices_delete_owner" on public.practices
  for delete to authenticated
  using (owner_email = ((select auth.jwt()) ->> 'email'));

-- ============================================================
-- Changes: readable by all authenticated practices (shared resource)
-- Writable only by service role (Inngest pipeline)
-- ============================================================
create policy "changes_select_authenticated" on public.changes
  for select to authenticated
  using (true);

-- ============================================================
-- Practice acknowledgments: practice sees only their own acknowledgments (split into per-operation policies)
-- ============================================================
create policy "acknowledgments_select_owner" on public.practice_acknowledgments
  for select to authenticated
  using (
    practice_id = (
      select id from public.practices where owner_email = ((select auth.jwt()) ->> 'email')
    )
  );

create policy "acknowledgments_insert_owner" on public.practice_acknowledgments
  for insert to authenticated
  with check (
    practice_id = (
      select id from public.practices where owner_email = ((select auth.jwt()) ->> 'email')
    )
  );

create policy "acknowledgments_update_owner" on public.practice_acknowledgments
  for update to authenticated
  using (
    practice_id = (
      select id from public.practices where owner_email = ((select auth.jwt()) ->> 'email')
    )
  )
  with check (
    practice_id = (
      select id from public.practices where owner_email = ((select auth.jwt()) ->> 'email')
    )
  );

create policy "acknowledgments_delete_owner" on public.practice_acknowledgments
  for delete to authenticated
  using (
    practice_id = (
      select id from public.practices where owner_email = ((select auth.jwt()) ->> 'email')
    )
  );

-- ============================================================
-- Review actions: reviewers and admins only
-- ============================================================
create policy "review_actions_select_reviewer" on public.review_actions
  for select to authenticated
  using (
    ((select auth.jwt()) ->> 'role') in ('reviewer', 'admin')
  );

-- ============================================================
-- Cost events: admin only
-- ============================================================
create policy "cost_events_select_admin" on public.cost_events
  for select to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin');

-- ============================================================
-- APPEND-ONLY enforcement on changes table
-- Blocks UPDATE and DELETE at the database level — no exceptions
-- ============================================================
create or replace function public.enforce_changes_append_only()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' then
    raise exception 'changes table is append-only. Use superseded_by to correct a change record.';
  end if;
  if tg_op = 'DELETE' then
    raise exception 'changes table is append-only. Records cannot be deleted.';
  end if;
  return null;
end;
$$;

create trigger changes_append_only
  before update or delete on public.changes
  for each row execute function public.enforce_changes_append_only();

-- ============================================================
-- Auto-update updated_at on system_config
-- ============================================================
create or replace function public.update_system_config_timestamp()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger system_config_updated_at
  before update on public.system_config
  for each row execute function public.update_system_config_timestamp();
