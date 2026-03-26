-- Migration: 007_kg_foundation.sql
-- Purpose: Create knowledge graph foundation tables — entities, relationships, and entity versions
-- Tables affected: kg_entities, kg_relationships, kg_entity_versions
-- Special considerations: Base tables extended by 008 (ontology schema); entity_type upgraded to FK in 008

-- ── kg_entities ──────────────────────────────────────────────────────────────

create table public.kg_entities (
    id              uuid primary key default gen_random_uuid(),
    name            text not null,
    description     text,
    entity_type     text not null,           -- human-readable slug, e.g. 'regulation'
    jurisdiction    text not null default 'FL',
    status          text,                    -- e.g. 'active', 'proposed', 'superseded'
    identifier      text,                    -- official document number or citation
    effective_date  date,
    source_id       uuid references public.sources(id),
    change_id       uuid references public.changes(id),
    external_url    text,
    metadata        jsonb,
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now()
);

comment on table public.kg_entities is
  'Discrete regulatory artifacts — statutes, rules, guidance, enforcement actions — forming the knowledge graph.';

create index idx_kg_entities_entity_type   on public.kg_entities(entity_type);
create index idx_kg_entities_jurisdiction  on public.kg_entities(jurisdiction);
create index idx_kg_entities_source_id     on public.kg_entities(source_id);
create index idx_kg_entities_change_id     on public.kg_entities(change_id);
create index idx_kg_entities_identifier    on public.kg_entities(identifier) where identifier is not null;

-- ── kg_relationships ──────────────────────────────────────────────────────────

create table public.kg_relationships (
    id                  uuid primary key default gen_random_uuid(),
    source_entity_id    uuid not null references public.kg_entities(id) on delete cascade,
    target_entity_id    uuid not null references public.kg_entities(id) on delete cascade,
    relationship_type   text not null,       -- e.g. 'supersedes', 'amends', 'implements'
    confidence          decimal(3,2),        -- 0.00-1.00, null = manually asserted (certain)
    notes               text,
    source_change_id    uuid references public.changes(id),
    created_at          timestamptz not null default now()
);

comment on table public.kg_relationships is
  'Directed edges between KG entities with typed relationships and provenance.';

create index idx_kg_relationships_source    on public.kg_relationships(source_entity_id);
create index idx_kg_relationships_target    on public.kg_relationships(target_entity_id);
create index idx_kg_relationships_type      on public.kg_relationships(relationship_type);
-- Prevent duplicate directed edges of the same type
create unique index idx_kg_relationships_unique
    on public.kg_relationships(source_entity_id, target_entity_id, relationship_type);

-- ── kg_entity_versions ───────────────────────────────────────────────────────

create table public.kg_entity_versions (
    id              uuid primary key default gen_random_uuid(),
    entity_id       uuid not null references public.kg_entities(id) on delete cascade,
    version_number  integer not null,
    snapshot        jsonb not null,          -- full entity state at this version
    change_id       uuid references public.changes(id),
    created_at      timestamptz not null default now(),
    unique (entity_id, version_number)
);

comment on table public.kg_entity_versions is
  'Immutable snapshots of entity state over time, linked to triggering changes.';

create index idx_kg_entity_versions_entity_id on public.kg_entity_versions(entity_id);

-- ── updated_at trigger ───────────────────────────────────────────────────────

create or replace function public.update_kg_entities_updated_at()
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

create trigger trg_kg_entities_updated_at
    before update on public.kg_entities
    for each row execute function public.update_kg_entities_updated_at();

-- ── RLS ──────────────────────────────────────────────────────────────────────

alter table public.kg_entities          enable row level security;
alter table public.kg_relationships     enable row level security;
alter table public.kg_entity_versions   enable row level security;

-- Authenticated users can read all KG data (no practice-scoping needed — KG is shared)
create policy "kg_entities_select" on public.kg_entities
    for select to authenticated using (true);
create policy "kg_relationships_select" on public.kg_relationships
    for select to authenticated using (true);
create policy "kg_entity_versions_select" on public.kg_entity_versions
    for select to authenticated using (true);

-- Admin role has full write access — kg_entities
create policy "kg_entities_select_admin" on public.kg_entities
    for select to authenticated
    using (((select auth.jwt()) ->> 'role') = 'admin');

create policy "kg_entities_insert_admin" on public.kg_entities
    for insert to authenticated
    with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "kg_entities_update_admin" on public.kg_entities
    for update to authenticated
    using (((select auth.jwt()) ->> 'role') = 'admin')
    with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "kg_entities_delete_admin" on public.kg_entities
    for delete to authenticated
    using (((select auth.jwt()) ->> 'role') = 'admin');

-- Admin role has full write access — kg_relationships
create policy "kg_relationships_select_admin" on public.kg_relationships
    for select to authenticated
    using (((select auth.jwt()) ->> 'role') = 'admin');

create policy "kg_relationships_insert_admin" on public.kg_relationships
    for insert to authenticated
    with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "kg_relationships_update_admin" on public.kg_relationships
    for update to authenticated
    using (((select auth.jwt()) ->> 'role') = 'admin')
    with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "kg_relationships_delete_admin" on public.kg_relationships
    for delete to authenticated
    using (((select auth.jwt()) ->> 'role') = 'admin');

-- Admin role has full write access — kg_entity_versions
create policy "kg_entity_versions_select_admin" on public.kg_entity_versions
    for select to authenticated
    using (((select auth.jwt()) ->> 'role') = 'admin');

create policy "kg_entity_versions_insert_admin" on public.kg_entity_versions
    for insert to authenticated
    with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "kg_entity_versions_update_admin" on public.kg_entity_versions
    for update to authenticated
    using (((select auth.jwt()) ->> 'role') = 'admin')
    with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "kg_entity_versions_delete_admin" on public.kg_entity_versions
    for delete to authenticated
    using (((select auth.jwt()) ->> 'role') = 'admin');

-- Service role bypasses RLS (Inngest pipeline writes use service role)
