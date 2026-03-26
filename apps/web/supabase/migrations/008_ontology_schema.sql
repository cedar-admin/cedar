-- Migration: 008_ontology_schema.sql
-- Purpose: Ontology infrastructure — entity types, relationship types, domains, jurisdictions, classification rules/results/overrides, merge tracking, taxonomy changelog
-- Tables affected: kg_entity_types, kg_relationship_types, kg_domains, kg_entity_domains, kg_jurisdictions, kg_entity_jurisdictions, classification_rules, classification_rule_sets, classification_results, classification_overrides, kg_entity_merges, taxonomy_changelog (creates); kg_entities, kg_relationships (alters)
-- Special considerations: Hierarchical taxonomy with depth limit; 4 append-only trigger functions; seed data for entity types, relationship types, domains, jurisdictions, and classification rules

--
-- This migration creates the taxonomy, classification, and reclassification
-- infrastructure that sits on top of the existing kg_entities, kg_relationships,
-- and kg_entity_versions tables defined in the build guide.
--
-- Design principles:
--   1. Taxonomy is data, not code. Entity types, relationship types, and
--      classification rules are all database rows, editable without deploys.
--   2. Hierarchical with controlled depth. Entity types support parent/child
--      nesting, but depth is soft-capped at 3 levels to prevent over-specification.
--   3. Every mutation is auditable. Classification changes, taxonomy edits,
--      and merge operations all produce immutable audit records.
--   4. Domain-agnostic core with domain-specific overlays. The base taxonomy
--      works for any regulated industry. Domain tags add healthcare specificity
--      without coupling the schema to a single vertical.
-- ============================================================================


-- ============================================================================
-- PART 1: ENTITY TYPE TAXONOMY
-- ============================================================================

-- The master registry of entity types. Every kg_entity record references one
-- of these types. Types are hierarchical: a "Final Rule" is a child of
-- "Regulation," which lets you query at whatever granularity you need.

create table public.kg_entity_types (
    id              uuid primary key default gen_random_uuid(),

    -- Identity
    slug            text not null unique,          -- machine key: 'regulation', 'enforcement_action'
    name            text not null,                 -- display: 'Regulation', 'Enforcement Action'
    description     text,                          -- one-sentence definition

    -- Hierarchy
    parent_id       uuid references public.kg_entity_types(id),
    depth           int not null default 0,        -- 0 = root, 1 = child, 2 = grandchild
    path            text not null default '',       -- materialized path: 'regulation/final_rule'
    sort_order      int not null default 0,        -- display ordering within siblings

    -- Classification guidance
    distinguishing_criteria text,                  -- what separates this type from similar types
    example_documents       text[],               -- real-world examples for classifier training

    -- Lifecycle
    is_active       boolean not null default true,
    is_system       boolean not null default false, -- system types can't be deleted, only deactivated
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now(),
    created_by      text,                          -- admin user id or 'system'

    -- Constraints
    constraint depth_limit check (depth <= 3),
    constraint slug_format check (slug ~ '^[a-z][a-z0-9_]*$')
);

comment on table public.kg_entity_types is 'Hierarchical registry of entity types — every kg_entity references one type.';

create index idx_kg_entity_types_parent on public.kg_entity_types(parent_id);
create index idx_kg_entity_types_path on public.kg_entity_types(path);
create index idx_kg_entity_types_active on public.kg_entity_types(is_active) where is_active = true;

-- Trigger to auto-compute path and depth from parent
create or replace function public.compute_entity_type_path()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
    if new.parent_id is null then
        new.depth := 0;
        new.path := new.slug;
    else
        select depth + 1, path || '/' || new.slug
        into new.depth, new.path
        from public.kg_entity_types where id = new.parent_id;

        if new.depth > 3 then
            raise exception 'Entity type hierarchy cannot exceed 3 levels deep';
        end if;
    end if;
    return new;
end;
$$;

create trigger trg_entity_type_path
    before insert or update of parent_id, slug on public.kg_entity_types
    for each row execute function public.compute_entity_type_path();


-- ============================================================================
-- PART 2: RELATIONSHIP TYPE TAXONOMY
-- ============================================================================

-- Every kg_relationship record references one of these types.
-- Directional: from_entity → to_entity means something specific.

create table public.kg_relationship_types (
    id              uuid primary key default gen_random_uuid(),

    -- Identity
    slug            text not null unique,
    name            text not null,                 -- 'Supersedes', 'Amends'
    description     text,                          -- what this relationship means

    -- Directionality
    forward_label   text not null,                 -- A → B: "supersedes"
    inverse_label   text not null,                 -- B → A: "superseded by"

    -- Constraints on usage
    valid_from_types text[],                       -- entity type slugs allowed as source (null = any)
    valid_to_types   text[],                       -- entity type slugs allowed as target (null = any)
    is_temporal      boolean not null default false, -- does this relationship have effective dates?
    is_exclusive     boolean not null default false, -- can an entity have only one of these?

    -- Lifecycle
    is_active       boolean not null default true,
    is_system       boolean not null default false,
    sort_order      int not null default 0,
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now(),
    created_by      text,

    constraint slug_format check (slug ~ '^[a-z][a-z0-9_]*$')
);

comment on table public.kg_relationship_types is 'Typed directed relationships between entities with directionality labels.';

create index idx_kg_relationship_types_active on public.kg_relationship_types(is_active) where is_active = true;


-- ============================================================================
-- PART 3: DOMAIN TAGS
-- ============================================================================

-- Cross-cutting domain labels that can be applied to any entity.
-- An entity can belong to multiple domains (e.g., a compounding rule touches
-- both "controlled_substances" and "pharmacy_regulation").

create table public.kg_domains (
    id              uuid primary key default gen_random_uuid(),
    slug            text not null unique,
    name            text not null,
    description     text,
    parent_id       uuid references public.kg_domains(id),
    color           text,                          -- hex color for UI display
    is_active       boolean not null default true,
    sort_order      int not null default 0,
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now(),

    constraint slug_format check (slug ~ '^[a-z][a-z0-9_]*$')
);

comment on table public.kg_domains is 'Cross-cutting domain labels applied to entities (many-to-many via kg_entity_domains).';

-- Junction table: entities ↔ domains (many-to-many)
create table public.kg_entity_domains (
    entity_id       uuid not null references public.kg_entities(id) on delete cascade,
    domain_id       uuid not null references public.kg_domains(id) on delete cascade,
    confidence      decimal(3,2),                  -- 0.00-1.00, null if manually assigned
    assigned_by     text not null default 'system', -- 'system', 'agent', or admin user id
    created_at      timestamptz not null default now(),
    primary key (entity_id, domain_id)
);

comment on table public.kg_entity_domains is 'Junction table mapping entities to domains with confidence scores.';

create index idx_entity_domains_domain on public.kg_entity_domains(domain_id);


-- ============================================================================
-- PART 4: JURISDICTION TAGS
-- ============================================================================

-- Separate from the jurisdiction column on kg_entities (which is a default).
-- Some entities span multiple jurisdictions. This table handles that.

create table public.kg_jurisdictions (
    id              uuid primary key default gen_random_uuid(),
    code            text not null unique,           -- 'US', 'FL', 'FL-BOM', 'FL-BOP'
    name            text not null,
    jurisdiction_type text not null,                -- 'federal', 'state', 'board', 'local'
    parent_code     text references public.kg_jurisdictions(code),
    is_active       boolean not null default true,
    created_at      timestamptz not null default now()
);

comment on table public.kg_jurisdictions is 'Hierarchical jurisdiction registry — federal, state, board, local.';

create table public.kg_entity_jurisdictions (
    entity_id       uuid not null references public.kg_entities(id) on delete cascade,
    jurisdiction_id uuid not null references public.kg_jurisdictions(id) on delete cascade,
    is_primary      boolean not null default false,
    created_at      timestamptz not null default now(),
    primary key (entity_id, jurisdiction_id)
);

comment on table public.kg_entity_jurisdictions is 'Junction table mapping entities to multiple jurisdictions.';

create index idx_entity_jurisdictions_jur on public.kg_entity_jurisdictions(jurisdiction_id);


-- ============================================================================
-- PART 5: CLASSIFICATION RULES ENGINE
-- ============================================================================

-- Programmatic rules evaluated at ingest time. Rules are stored as database
-- rows and applied in priority order. Editable via admin UI or prompt.

create table public.classification_rules (
    id              uuid primary key default gen_random_uuid(),

    -- Identity
    name            text not null,
    description     text,

    -- Rule definition
    rule_type       text not null default 'assign_entity_type',
    -- 'assign_entity_type' — sets entity_type on matching content
    -- 'assign_domain'      — tags matching content with a domain
    -- 'assign_severity'    — sets severity level
    -- 'flag_for_review'    — routes to HITL review
    -- 'exclude'            — marks content as non-regulatory noise

    -- Conditions (evaluated as AND — all must match)
    conditions      jsonb not null default '[]',
    -- Each condition: { "field": "...", "operator": "...", "value": "..." }
    -- Fields: source_id, source_name, source_agency, jurisdiction,
    --         content_keywords, document_structure, url_pattern,
    --         content_length, detected_severity, agent_confidence
    -- Operators: eq, neq, contains, not_contains, gt, lt, gte, lte,
    --            matches (regex), in, not_in, exists, not_exists

    -- Action (what to do when conditions match)
    action          jsonb not null default '{}',
    -- Examples:
    --   { "entity_type_slug": "enforcement_action" }
    --   { "domain_slugs": ["compounding", "controlled_substances"] }
    --   { "severity": "critical", "requires_review": true }
    --   { "exclude": true, "reason": "navigation content" }

    -- Execution
    priority        int not null default 100,       -- lower = evaluated first
    stop_on_match   boolean not null default false,  -- if true, skip remaining rules
    rule_set_id     uuid,                           -- optional grouping (FK added below)

    -- Lifecycle
    is_active       boolean not null default true,
    version         int not null default 1,
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now(),
    created_by      text not null default 'system',

    -- Stats
    times_matched   bigint not null default 0,
    last_matched_at timestamptz
);

comment on table public.classification_rules is 'Programmatic rules evaluated at ingest time for entity classification.';

create index idx_classification_rules_active on public.classification_rules(is_active, priority)
    where is_active = true;
create index idx_classification_rules_type on public.classification_rules(rule_type);

-- Rule sets: named groups of rules that can be enabled/disabled together
create table public.classification_rule_sets (
    id              uuid primary key default gen_random_uuid(),
    name            text not null,
    description     text,
    is_active       boolean not null default true,
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now(),
    created_by      text not null default 'system'
);

comment on table public.classification_rule_sets is 'Named groups of classification rules that can be toggled together.';

alter table public.classification_rules
    add constraint fk_rule_set
    foreign key (rule_set_id) references public.classification_rule_sets(id);


-- ============================================================================
-- PART 6: CLASSIFICATION RESULTS
-- ============================================================================

-- Every classification attempt (programmatic or agent) produces a result record.
-- This is the provenance layer — you can always trace why something was
-- classified the way it was.

create table public.classification_results (
    id              uuid primary key default gen_random_uuid(),

    -- What was classified
    change_id       uuid references public.changes(id),           -- if classifying a change
    entity_id       uuid references public.kg_entities(id),       -- if classifying an entity

    -- Classification output
    entity_type_slug    text references public.kg_entity_types(slug),
    domain_slugs        text[],
    severity            text,
    confidence          decimal(3,2),                       -- 0.00-1.00

    -- How it was classified
    classification_method text not null,
    -- 'programmatic' — matched a classification_rule
    -- 'agent'        — classified by intelligence pipeline
    -- 'manual'       — admin override

    -- Provenance
    rule_id         uuid references public.classification_rules(id),  -- which rule matched (programmatic)
    agent_name      text,                                       -- which agent (agent)
    agent_version   text,                                       -- agent@version
    model           text,                                       -- claude model used
    reasoning       text,                                       -- agent's reasoning or admin's notes
    raw_output      jsonb,                                      -- full agent response

    -- Lifecycle
    is_current      boolean not null default true,              -- latest classification for this entity
    superseded_by   uuid references public.classification_results(id),
    created_at      timestamptz not null default now(),
    created_by      text not null default 'system',

    -- At least one target must be set
    constraint has_target check (change_id is not null or entity_id is not null)
);

comment on table public.classification_results is 'Provenance records for every classification attempt — programmatic, agent, or manual.';

create index idx_classification_results_entity on public.classification_results(entity_id)
    where is_current = true;
create index idx_classification_results_change on public.classification_results(change_id);
create index idx_classification_results_method on public.classification_results(classification_method);
create index idx_classification_results_confidence on public.classification_results(confidence)
    where confidence < 0.7;


-- ============================================================================
-- PART 7: CLASSIFICATION OVERRIDES (MANUAL RECLASSIFICATION)
-- ============================================================================

-- Every manual change to a classification. Immutable audit trail.

create table public.classification_overrides (
    id              uuid primary key default gen_random_uuid(),

    -- What was reclassified
    entity_id       uuid references public.kg_entities(id),
    change_id       uuid references public.changes(id),

    -- What changed
    field_changed   text not null,                  -- 'entity_type', 'domains', 'severity', 'metadata'
    old_value       jsonb not null,
    new_value       jsonb not null,

    -- Who and why
    overridden_by   text not null,                  -- admin user id
    reason          text not null,                  -- required: explain every override

    -- Context
    previous_result_id uuid references public.classification_results(id),
    new_result_id      uuid references public.classification_results(id),

    created_at      timestamptz not null default now(),

    constraint has_target check (entity_id is not null or change_id is not null)
);

comment on table public.classification_overrides is 'Append-only audit trail of manual reclassification decisions.';

-- Override records are append-only
create or replace function public.prevent_override_mutation()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
    raise exception 'classification_overrides table is append-only.';
end;
$$;

create trigger enforce_override_append_only
    before update or delete on public.classification_overrides
    for each row execute function public.prevent_override_mutation();

create index idx_overrides_entity on public.classification_overrides(entity_id);
create index idx_overrides_change on public.classification_overrides(change_id);
create index idx_overrides_by on public.classification_overrides(overridden_by);


-- ============================================================================
-- PART 8: ENTITY MERGE TRACKING
-- ============================================================================

-- When two ingested documents turn out to be the same regulation,
-- they get merged. This table tracks every merge with full provenance.

create table public.kg_entity_merges (
    id              uuid primary key default gen_random_uuid(),

    -- The merge
    surviving_entity_id uuid not null references public.kg_entities(id),
    merged_entity_id    uuid not null references public.kg_entities(id),

    -- Context
    merge_reason    text not null,
    merge_strategy  text not null default 'keep_surviving',
    -- 'keep_surviving'   — surviving entity's data wins
    -- 'keep_merged'      — merged entity's data wins
    -- 'combine'          — merge metadata from both

    -- Snapshot of merged entity at time of merge (for undo)
    merged_entity_snapshot jsonb not null,

    -- Who
    merged_by       text not null,
    created_at      timestamptz not null default now(),

    constraint different_entities check (surviving_entity_id != merged_entity_id)
);

comment on table public.kg_entity_merges is 'Append-only records of entity merge operations with full snapshots for undo.';

-- Merge records are append-only
create or replace function public.prevent_merge_mutation()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
    raise exception 'kg_entity_merges table is append-only.';
end;
$$;

create trigger enforce_merge_append_only
    before update or delete on public.kg_entity_merges
    for each row execute function public.prevent_merge_mutation();

create index idx_merges_surviving on public.kg_entity_merges(surviving_entity_id);
create index idx_merges_merged on public.kg_entity_merges(merged_entity_id);


-- ============================================================================
-- PART 9: TAXONOMY CHANGE LOG
-- ============================================================================

-- Every change to the taxonomy itself (adding types, editing relationships,
-- modifying rules) is logged here. This is distinct from entity classification
-- changes — this tracks changes to the classification system itself.

create table public.taxonomy_changelog (
    id              uuid primary key default gen_random_uuid(),

    table_name      text not null,                  -- which taxonomy table changed
    record_id       uuid not null,                  -- which record changed
    action          text not null,                  -- 'insert', 'update', 'delete', 'deactivate'

    old_values      jsonb,                          -- before (null for inserts)
    new_values      jsonb,                          -- after (null for deletes)

    changed_by      text not null,                  -- admin user id or 'system'
    reason          text,
    created_at      timestamptz not null default now()
);

comment on table public.taxonomy_changelog is 'Append-only audit log of changes to the taxonomy system itself.';

-- Append-only
create or replace function public.prevent_changelog_mutation()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
    raise exception 'taxonomy_changelog table is append-only.';
end;
$$;

create trigger enforce_changelog_append_only
    before update or delete on public.taxonomy_changelog
    for each row execute function public.prevent_changelog_mutation();

create index idx_taxonomy_changelog_table on public.taxonomy_changelog(table_name, record_id);
create index idx_taxonomy_changelog_time on public.taxonomy_changelog(created_at desc);


-- ============================================================================
-- PART 10: ALTER EXISTING TABLES
-- ============================================================================

-- Add entity_type_id FK to kg_entities (linking to the new taxonomy)
alter table public.kg_entities
    add column entity_type_id uuid references public.kg_entity_types(id);

-- Add relationship_type_id FK to kg_relationships
alter table public.kg_relationships
    add column relationship_type_id uuid references public.kg_relationship_types(id);

-- Add classification linkage to kg_entities
alter table public.kg_entities
    add column current_classification_id uuid references public.classification_results(id),
    add column classification_confidence decimal(3,2),
    add column last_classified_at timestamptz;

-- Index the new columns
create index idx_kg_entities_type_id on public.kg_entities(entity_type_id);
create index idx_kg_relationships_type_id on public.kg_relationships(relationship_type_id);
create index idx_kg_entities_confidence on public.kg_entities(classification_confidence)
    where classification_confidence < 0.7;


-- ============================================================================
-- PART 11: SEED DATA — BASE ENTITY TYPES
-- ============================================================================

-- Root-level entity types (the "buckets")
insert into public.kg_entity_types (slug, name, description, is_system, distinguishing_criteria, example_documents, sort_order) values

-- Primary Regulatory Content
('statute', 'Statute',
 'Legislation enacted by a legislative body (Congress, state legislature) that creates, modifies, or repeals law.',
 true,
 'Originates from a legislature. Has a public law number or statute citation. Requires legislative vote to change.',
 array['21 USC §353a (FDCA compounding provisions)', 'FL Stat §458 (Medical Practice Act)', 'FL Stat §465 (Pharmacy Act)'],
 10),

('regulation', 'Regulation',
 'Binding rule promulgated by an executive agency under statutory authority, published in a register and codified.',
 true,
 'Issued by an agency under delegated authority. Published in Federal Register or FL Administrative Register. Codified in CFR or FAC.',
 array['21 CFR Part 216 (compounding)', '64B8 FAC (FL Board of Medicine rules)', 'DEA scheduling rules'],
 20),

('guidance', 'Guidance',
 'Non-binding document issued by an agency explaining its interpretation of law, recommended practices, or compliance expectations.',
 true,
 'Explicitly labeled as guidance, advisory, or non-binding. Reflects agency interpretation. Cannot create new legal obligations.',
 array['FDA Compounding Guidance Documents', 'CMS MLN Matters articles', 'DEA Practitioner Manual'],
 30),

('enforcement_action', 'Enforcement Action',
 'Formal agency action against a person or entity for alleged violations, including warnings, fines, consent decrees, and license actions.',
 true,
 'Directed at a specific person/entity. Alleges a violation. Imposes or threatens a consequence.',
 array['FDA Warning Letters', 'FL BOM disciplinary orders', 'DEA registration revocations', 'FTC consent decrees'],
 40),

('court_decision', 'Court Decision',
 'Judicial ruling from any court level that interprets, applies, or invalidates regulatory or statutory provisions.',
 true,
 'Issued by a court (not an agency). Interprets law. May set precedent. Includes orders, opinions, and injunctions.',
 array['Franck''s Lab v. FDA', 'Loper Bright v. Raimondo (Chevron overrule)', 'FL circuit court injunctions'],
 50),

('notice', 'Notice',
 'Official communication from an agency announcing an action, event, deadline, or information without creating new binding requirements.',
 true,
 'Informational or procedural. Announces meetings, deadlines, availability of documents, or fee changes. Does not itself create binding rules.',
 array['Federal Register notices of proposed rulemaking', 'FL BOM meeting notices', 'FDA safety communications'],
 60),

('proposed_rule', 'Proposed Rule',
 'Draft regulation published for public comment before potential adoption as a final rule.',
 true,
 'Published for comment. Has a comment period deadline. May or may not become final. Represents agency intent.',
 array['NPRM in Federal Register', 'FL proposed rule notices in FAR', 'DEA proposed scheduling actions'],
 70),

('license_requirement', 'License Requirement',
 'Specification of credentials, permits, registrations, or authorizations required to perform regulated activities.',
 true,
 'Defines who can do what under which conditions. Specifies education, examination, or application requirements.',
 array['FL medical license requirements', 'DEA registration for prescribing', 'CLIA lab certification requirements'],
 80),

('penalty_schedule', 'Penalty Schedule',
 'Published schedule of fines, sanctions, or consequences for specific violations.',
 true,
 'Lists specific violations paired with specific consequences. May include ranges, aggravating/mitigating factors.',
 array['FL BOM fine schedule', 'OSHA penalty tables', 'CMS civil monetary penalty amounts'],
 90),

('standard', 'Standard',
 'Technical or professional standard issued by a standards body or professional association that may be incorporated by reference into regulation.',
 true,
 'Issued by a standards organization or professional body. May be voluntary or incorporated by reference into binding law.',
 array['USP compounding standards (795, 797, 800)', 'ASTM standards', 'Joint Commission standards'],
 100),

('advisory_opinion', 'Advisory Opinion',
 'Formal opinion issued by an agency or board in response to a specific question about how law applies to a particular situation.',
 true,
 'Responds to a specific factual scenario. Binds only the requester (if at all). Signals agency interpretation.',
 array['FL BOM declaratory statements', 'FDA advisory opinions', 'OIG advisory opinions'],
 110),

('exemption', 'Exemption',
 'Formal grant of relief from a regulatory requirement, either categorical or case-specific.',
 true,
 'Removes or reduces a regulatory obligation. May be conditional, time-limited, or permanent.',
 array['503B outsourcing facility exemptions', 'FDA enforcement discretion letters', 'HIPAA exemptions'],
 120);

-- Child entity types (second level — adds granularity where needed)
insert into public.kg_entity_types (slug, name, description, parent_id, is_system, distinguishing_criteria, sort_order) values

('final_rule', 'Final Rule',
 'Regulation that has completed the rulemaking process and is effective or scheduled to become effective.',
 (select id from public.kg_entity_types where slug = 'regulation'), true,
 'Has an effective date. Published as a final rule in the register. No longer open for comment.',
 10),

('interim_final_rule', 'Interim Final Rule',
 'Rule effective immediately upon publication, with post-effective comment period.',
 (select id from public.kg_entity_types where slug = 'regulation'), true,
 'Effective on publication but with a concurrent comment period. Often used for urgent matters.',
 20),

('emergency_rule', 'Emergency Rule',
 'Rule adopted without standard notice-and-comment procedures due to urgent circumstances.',
 (select id from public.kg_entity_types where slug = 'regulation'), true,
 'Bypasses normal rulemaking. Limited duration. Requires finding of imminent danger or emergency.',
 30),

('warning_letter', 'Warning Letter',
 'Formal notice from an agency that a person or entity is in violation, with demand for corrective action.',
 (select id from public.kg_entity_types where slug = 'enforcement_action'), true,
 'Warns of violation. Demands corrective action within a deadline. Public record.',
 10),

('consent_decree', 'Consent Decree',
 'Court-approved agreement between an agency and a regulated entity resolving enforcement action.',
 (select id from public.kg_entity_types where slug = 'enforcement_action'), true,
 'Negotiated settlement. Court-approved. Binding on parties. Often includes ongoing compliance requirements.',
 20),

('license_action', 'License Action',
 'Board action to suspend, revoke, restrict, or place conditions on a professional license.',
 (select id from public.kg_entity_types where slug = 'enforcement_action'), true,
 'Directly affects a practitioner''s ability to practice. Issued by a licensing board.',
 30),

('civil_penalty', 'Civil Penalty',
 'Monetary fine imposed by an agency for regulatory violations.',
 (select id from public.kg_entity_types where slug = 'enforcement_action'), true,
 'Financial penalty. Assessed by agency (not court). May be appealable.',
 40),

('draft_guidance', 'Draft Guidance',
 'Guidance document published for comment before finalization.',
 (select id from public.kg_entity_types where slug = 'guidance'), true,
 'Labeled as draft. Open for comment. Represents current agency thinking but not final position.',
 10),

('compliance_guide', 'Compliance Guide',
 'Guidance document specifically focused on how to comply with a regulation or set of requirements.',
 (select id from public.kg_entity_types where slug = 'guidance'), true,
 'Focused on compliance steps. Often structured as Q&A or checklist. Directed at regulated entities.',
 20),

('injunction', 'Injunction',
 'Court order requiring a party to do or refrain from doing a specific act.',
 (select id from public.kg_entity_types where slug = 'court_decision'), true,
 'Directly commands action or inaction. Can be temporary (TRO/preliminary) or permanent.',
 10),

('stay_order', 'Stay Order',
 'Court or agency order temporarily halting the enforcement or effectiveness of a rule or decision.',
 (select id from public.kg_entity_types where slug = 'court_decision'), true,
 'Pauses enforcement pending further proceedings. Time-limited or until further order.',
 20);


-- ============================================================================
-- PART 12: SEED DATA — BASE RELATIONSHIP TYPES
-- ============================================================================

insert into public.kg_relationship_types (slug, name, description, forward_label, inverse_label, is_temporal, is_exclusive, is_system, sort_order) values

('supersedes', 'Supersedes',
 'The source entity replaces the target entity as the current authority.',
 'supersedes', 'superseded by',
 true, false, true, 10),

('amends', 'Amends',
 'The source entity modifies specific provisions of the target entity without fully replacing it.',
 'amends', 'amended by',
 true, false, true, 20),

('implements', 'Implements',
 'The source entity carries out or gives effect to the target entity (e.g., regulation implementing a statute).',
 'implements', 'implemented by',
 false, false, true, 30),

('derives_authority_from', 'Derives Authority From',
 'The source entity''s legal authority comes from the target entity.',
 'derives authority from', 'grants authority to',
 false, false, true, 40),

('references', 'References',
 'The source entity cites or refers to the target entity without modifying it.',
 'references', 'referenced by',
 false, false, true, 50),

('conflicts_with', 'Conflicts With',
 'The source and target entities contain contradictory requirements or interpretations.',
 'conflicts with', 'conflicts with',
 false, false, true, 60),

('restricts', 'Restricts',
 'The source entity narrows the scope, applicability, or permissions granted by the target entity.',
 'restricts', 'restricted by',
 false, false, true, 70),

('exempts_from', 'Exempts From',
 'The source entity grants relief from requirements imposed by the target entity.',
 'exempts from', 'has exemption in',
 true, false, true, 80),

('stayed_by', 'Stayed By',
 'The source entity''s enforcement is temporarily halted by the target entity (usually a court order).',
 'stayed by', 'stays',
 true, true, true, 90),

('proposed_replacement_for', 'Proposed Replacement For',
 'The source entity is a proposed rule intended to replace the target entity if finalized.',
 'proposed replacement for', 'has proposed replacement',
 false, true, true, 100),

('penalizes_violation_of', 'Penalizes Violation Of',
 'The source entity (enforcement action) is a consequence of violating the target entity.',
 'penalizes violation of', 'violated in',
 false, false, true, 110),

('interprets', 'Interprets',
 'The source entity provides an interpretation of the target entity (e.g., guidance interpreting a regulation).',
 'interprets', 'interpreted by',
 false, false, true, 120),

('incorporates_by_reference', 'Incorporates By Reference',
 'The source entity legally adopts the target entity''s requirements by reference rather than restating them.',
 'incorporates by reference', 'incorporated by reference in',
 false, false, true, 130),

('repeals', 'Repeals',
 'The source entity eliminates the target entity entirely.',
 'repeals', 'repealed by',
 true, false, true, 140),

('preempts', 'Preempts',
 'The source entity (typically federal) overrides the target entity (typically state) due to supremacy.',
 'preempts', 'preempted by',
 false, false, true, 150);


-- ============================================================================
-- PART 13: SEED DATA — BASE DOMAINS (Healthcare / Medical Practice)
-- ============================================================================

insert into public.kg_domains (slug, name, description, sort_order) values
('compounding', 'Compounding', 'Drug compounding regulations including 503A/503B, USP standards, and state pharmacy board rules.', 10),
('controlled_substances', 'Controlled Substances', 'DEA scheduling, prescribing requirements, PDMP rules, and state-level controlled substance regulations.', 20),
('telehealth', 'Telehealth', 'Telehealth prescribing, interstate licensure, platform requirements, and remote patient monitoring rules.', 30),
('scope_of_practice', 'Scope of Practice', 'Which practitioners can perform which procedures, delegation rules, and supervision requirements.', 40),
('licensing', 'Licensing', 'Professional licensure requirements, renewal, continuing education, and interstate compacts.', 50),
('advertising', 'Advertising', 'Healthcare advertising restrictions, testimonial rules, FTC enforcement, and state-specific ad regulations.', 60),
('billing_coding', 'Billing & Coding', 'CPT/ICD coding updates, reimbursement policy, and fraud/abuse enforcement.', 70),
('hipaa_privacy', 'HIPAA & Privacy', 'Patient data protection, breach notification, and state privacy law requirements.', 80),
('informed_consent', 'Informed Consent', 'Requirements for patient consent documentation, disclosure, and special consent situations.', 90),
('medical_devices', 'Medical Devices', 'FDA device regulation, state device requirements, and aesthetic device-specific rules.', 100),
('biologics_regenerative', 'Biologics & Regenerative', 'PRP, stem cell, exosome regulations, FDA enforcement, and state-level restrictions.', 110),
('peptides_hormones', 'Peptides & Hormones', 'GLP-1, growth hormone, testosterone, and other hormone/peptide prescribing and compounding rules.', 120),
('medical_aesthetics', 'Medical Aesthetics', 'Botox, fillers, laser, and other aesthetic procedure regulations and delegation rules.', 130),
('pharmacy_regulation', 'Pharmacy Regulation', 'State board of pharmacy rules, dispensing requirements, and pharmacy operations standards.', 140),
('lab_testing', 'Lab & Testing', 'CLIA certification, point-of-care testing, lab ordering requirements, and direct-to-consumer testing rules.', 150),
('employment_safety', 'Employment & Safety', 'OSHA, workplace safety, employment law intersections with medical practice.', 160),
('corporate_practice', 'Corporate Practice', 'Corporate practice of medicine doctrine, management services organizations, and practice ownership rules.', 170);


-- ============================================================================
-- PART 14: SEED DATA — BASE JURISDICTIONS
-- ============================================================================

insert into public.kg_jurisdictions (code, name, jurisdiction_type) values
('US', 'United States (Federal)', 'federal');

insert into public.kg_jurisdictions (code, name, jurisdiction_type, parent_code) values
('FL', 'Florida', 'state', 'US'),
('FL-BOM', 'Florida Board of Medicine', 'board', 'FL'),
('FL-BOP', 'Florida Board of Pharmacy', 'board', 'FL'),
('FL-BOOM', 'Florida Board of Osteopathic Medicine', 'board', 'FL'),
('FL-DOH', 'Florida Department of Health', 'board', 'FL'),
('FL-MQA', 'Florida Medical Quality Assurance', 'board', 'FL');


-- ============================================================================
-- PART 15: SEED DATA — STARTER CLASSIFICATION RULES
-- ============================================================================

insert into public.classification_rules (name, description, rule_type, conditions, action, priority, is_active, created_by) values

('FDA Warning Letters → Enforcement Action',
 'All content from FDA warning letter pages classified as enforcement actions.',
 'assign_entity_type',
 '[{"field": "url_pattern", "operator": "contains", "value": "warning-letters"}, {"field": "source_agency", "operator": "eq", "value": "FDA"}]'::jsonb,
 '{"entity_type_slug": "warning_letter"}'::jsonb,
 10, true, 'system'),

('Federal Register Final Rules → Final Rule',
 'Federal Register documents tagged as final rules.',
 'assign_entity_type',
 '[{"field": "source_name", "operator": "eq", "value": "FDA Federal Register"}, {"field": "content_keywords", "operator": "contains", "value": "final rule"}]'::jsonb,
 '{"entity_type_slug": "final_rule"}'::jsonb,
 20, true, 'system'),

('FL Board Disciplinary → License Action',
 'Florida board disciplinary orders classified as license actions.',
 'assign_entity_type',
 '[{"field": "source_agency", "operator": "in", "value": ["FL Board of Medicine", "FL Board of Osteopathic Medicine"]}, {"field": "content_keywords", "operator": "contains", "value": "disciplinary"}]'::jsonb,
 '{"entity_type_slug": "license_action"}'::jsonb,
 30, true, 'system'),

('eCFR Content → Regulation',
 'All eCFR title 21 content classified as regulation by default.',
 'assign_entity_type',
 '[{"field": "source_name", "operator": "eq", "value": "eCFR Title 21"}]'::jsonb,
 '{"entity_type_slug": "regulation"}'::jsonb,
 50, true, 'system'),

('Low Confidence → Flag for Review',
 'Any agent classification with confidence below 0.7 gets flagged for human review.',
 'flag_for_review',
 '[{"field": "agent_confidence", "operator": "lt", "value": 0.7}]'::jsonb,
 '{"requires_review": true, "review_reason": "Low classification confidence"}'::jsonb,
 200, true, 'system'),

('Compounding Keywords → Domain Tag',
 'Content containing compounding-related keywords tagged with compounding domain.',
 'assign_domain',
 '[{"field": "content_keywords", "operator": "contains", "value": "compounding|503A|503B|outsourcing facility|USP 795|USP 797"}]'::jsonb,
 '{"domain_slugs": ["compounding"]}'::jsonb,
 300, true, 'system'),

('Controlled Substance Keywords → Domain Tag',
 'Content containing controlled substance keywords tagged appropriately.',
 'assign_domain',
 '[{"field": "content_keywords", "operator": "contains", "value": "schedule II|schedule III|controlled substance|DEA|PDMP|opioid"}]'::jsonb,
 '{"domain_slugs": ["controlled_substances"]}'::jsonb,
 310, true, 'system'),

('Telehealth Keywords → Domain Tag',
 'Content containing telehealth keywords tagged appropriately.',
 'assign_domain',
 '[{"field": "content_keywords", "operator": "contains", "value": "telehealth|telemedicine|remote prescribing|interstate|Ryan Haight"}]'::jsonb,
 '{"domain_slugs": ["telehealth"]}'::jsonb,
 320, true, 'system'),

('GLP-1/Peptide Keywords → Domain Tag',
 'Content containing peptide and hormone therapy keywords tagged appropriately.',
 'assign_domain',
 '[{"field": "content_keywords", "operator": "contains", "value": "GLP-1|semaglutide|tirzepatide|peptide|ipamorelin|BPC-157|testosterone|hormone therapy"}]'::jsonb,
 '{"domain_slugs": ["peptides_hormones"]}'::jsonb,
 330, true, 'system');


-- ============================================================================
-- PART 16: ROW LEVEL SECURITY
-- ============================================================================

-- Taxonomy tables: readable by all authenticated users, writable by admin only

alter table public.kg_entity_types enable row level security;

create policy "entity_types_select_authenticated" on public.kg_entity_types
  for select to authenticated
  using (true);

create policy "entity_types_insert_admin" on public.kg_entity_types
  for insert to authenticated
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "entity_types_update_admin" on public.kg_entity_types
  for update to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin')
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "entity_types_delete_admin" on public.kg_entity_types
  for delete to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin');


alter table public.kg_relationship_types enable row level security;

create policy "rel_types_select_authenticated" on public.kg_relationship_types
  for select to authenticated
  using (true);

create policy "rel_types_insert_admin" on public.kg_relationship_types
  for insert to authenticated
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "rel_types_update_admin" on public.kg_relationship_types
  for update to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin')
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "rel_types_delete_admin" on public.kg_relationship_types
  for delete to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin');


alter table public.kg_domains enable row level security;

create policy "domains_select_authenticated" on public.kg_domains
  for select to authenticated
  using (true);

create policy "domains_insert_admin" on public.kg_domains
  for insert to authenticated
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "domains_update_admin" on public.kg_domains
  for update to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin')
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "domains_delete_admin" on public.kg_domains
  for delete to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin');


alter table public.kg_jurisdictions enable row level security;

create policy "jurisdictions_select_authenticated" on public.kg_jurisdictions
  for select to authenticated
  using (true);

create policy "jurisdictions_insert_admin" on public.kg_jurisdictions
  for insert to authenticated
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "jurisdictions_update_admin" on public.kg_jurisdictions
  for update to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin')
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "jurisdictions_delete_admin" on public.kg_jurisdictions
  for delete to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin');


-- Classification tables: admin-only

alter table public.classification_rules enable row level security;

create policy "rules_select_admin" on public.classification_rules
  for select to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin');

create policy "rules_insert_admin" on public.classification_rules
  for insert to authenticated
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "rules_update_admin" on public.classification_rules
  for update to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin')
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "rules_delete_admin" on public.classification_rules
  for delete to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin');


alter table public.classification_results enable row level security;

create policy "results_select_authenticated" on public.classification_results
  for select to authenticated
  using (true);

create policy "results_insert_admin" on public.classification_results
  for insert to authenticated
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "results_update_admin" on public.classification_results
  for update to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin')
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "results_delete_admin" on public.classification_results
  for delete to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin');


alter table public.classification_overrides enable row level security;

create policy "overrides_select_admin" on public.classification_overrides
  for select to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin');

create policy "overrides_insert_admin" on public.classification_overrides
  for insert to authenticated
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "overrides_update_admin" on public.classification_overrides
  for update to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin')
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "overrides_delete_admin" on public.classification_overrides
  for delete to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin');


-- Audit tables: read by authenticated, write by admin/system

alter table public.taxonomy_changelog enable row level security;

create policy "changelog_select_authenticated" on public.taxonomy_changelog
  for select to authenticated
  using (true);

create policy "changelog_insert_admin" on public.taxonomy_changelog
  for insert to authenticated
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "changelog_update_admin" on public.taxonomy_changelog
  for update to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin')
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "changelog_delete_admin" on public.taxonomy_changelog
  for delete to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin');


alter table public.kg_entity_merges enable row level security;

create policy "merges_select_authenticated" on public.kg_entity_merges
  for select to authenticated
  using (true);

create policy "merges_insert_admin" on public.kg_entity_merges
  for insert to authenticated
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "merges_update_admin" on public.kg_entity_merges
  for update to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin')
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "merges_delete_admin" on public.kg_entity_merges
  for delete to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin');


-- Junction tables: readable by all authenticated, writable by admin/service role

alter table public.kg_entity_domains enable row level security;

create policy "entity_domains_select_authenticated" on public.kg_entity_domains
  for select to authenticated
  using (true);

create policy "entity_domains_insert_admin" on public.kg_entity_domains
  for insert to authenticated
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "entity_domains_update_admin" on public.kg_entity_domains
  for update to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin')
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "entity_domains_delete_admin" on public.kg_entity_domains
  for delete to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin');


alter table public.kg_entity_jurisdictions enable row level security;

create policy "entity_jurisdictions_select_authenticated" on public.kg_entity_jurisdictions
  for select to authenticated
  using (true);

create policy "entity_jurisdictions_insert_admin" on public.kg_entity_jurisdictions
  for insert to authenticated
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "entity_jurisdictions_update_admin" on public.kg_entity_jurisdictions
  for update to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin')
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "entity_jurisdictions_delete_admin" on public.kg_entity_jurisdictions
  for delete to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin');


alter table public.classification_rule_sets enable row level security;

create policy "rule_sets_select_admin" on public.classification_rule_sets
  for select to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin');

create policy "rule_sets_insert_admin" on public.classification_rule_sets
  for insert to authenticated
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "rule_sets_update_admin" on public.classification_rule_sets
  for update to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin')
  with check (((select auth.jwt()) ->> 'role') = 'admin');

create policy "rule_sets_delete_admin" on public.classification_rule_sets
  for delete to authenticated
  using (((select auth.jwt()) ->> 'role') = 'admin');


-- ============================================================================
-- PART 17: HELPER VIEWS
-- ============================================================================

-- Flat view of entity types with full path for easy querying
create view public.v_entity_types_flat as
select
    t.id,
    t.slug,
    t.name,
    t.description,
    t.path,
    t.depth,
    p.slug as parent_slug,
    p.name as parent_name,
    t.is_active,
    t.sort_order,
    (select count(*) from public.kg_entities e where e.entity_type_id = t.id) as entity_count
from public.kg_entity_types t
left join public.kg_entity_types p on t.parent_id = p.id
where t.is_active = true
order by t.path, t.sort_order;

-- Entity detail view with type, domains, and jurisdiction
create view public.v_entity_details as
select
    e.id,
    e.name,
    e.description,
    e.status,
    e.effective_date,
    e.jurisdiction,
    et.slug as entity_type_slug,
    et.name as entity_type_name,
    et.path as entity_type_path,
    e.classification_confidence,
    array_agg(distinct d.slug) filter (where d.slug is not null) as domain_slugs,
    array_agg(distinct d.name) filter (where d.name is not null) as domain_names,
    array_agg(distinct j.code) filter (where j.code is not null) as jurisdiction_codes,
    e.created_at,
    e.updated_at
from public.kg_entities e
left join public.kg_entity_types et on e.entity_type_id = et.id
left join public.kg_entity_domains ed on e.id = ed.entity_id
left join public.kg_domains d on ed.domain_id = d.id
left join public.kg_entity_jurisdictions ej on e.id = ej.entity_id
left join public.kg_jurisdictions j on ej.jurisdiction_id = j.id
group by e.id, et.slug, et.name, et.path;

-- Classification audit trail for a given entity
create view public.v_classification_history as
select
    cr.id,
    cr.entity_id,
    cr.change_id,
    cr.entity_type_slug,
    cr.domain_slugs,
    cr.severity,
    cr.confidence,
    cr.classification_method,
    cr.agent_name,
    cr.agent_version,
    cr.reasoning,
    cr.is_current,
    cr.created_at,
    cr.created_by
from public.classification_results cr
order by cr.created_at desc;

-- Active classification rules with match stats
create view public.v_active_rules as
select
    r.id,
    r.name,
    r.description,
    r.rule_type,
    r.conditions,
    r.action,
    r.priority,
    r.times_matched,
    r.last_matched_at,
    rs.name as rule_set_name,
    r.updated_at
from public.classification_rules r
left join public.classification_rule_sets rs on r.rule_set_id = rs.id
where r.is_active = true
order by r.priority;
