-- ============================================================================
-- Cedar Ontology Schema — Migration 001
-- Foundation for regulatory content classification and knowledge organization
-- ============================================================================
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

CREATE TABLE kg_entity_types (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identity
    slug            TEXT NOT NULL UNIQUE,          -- machine key: 'regulation', 'enforcement_action'
    name            TEXT NOT NULL,                 -- display: 'Regulation', 'Enforcement Action'
    description     TEXT,                          -- one-sentence definition
    
    -- Hierarchy
    parent_id       UUID REFERENCES kg_entity_types(id),
    depth           INT NOT NULL DEFAULT 0,        -- 0 = root, 1 = child, 2 = grandchild
    path            TEXT NOT NULL DEFAULT '',       -- materialized path: 'regulation/final_rule'
    sort_order      INT NOT NULL DEFAULT 0,        -- display ordering within siblings
    
    -- Classification guidance
    distinguishing_criteria TEXT,                  -- what separates this type from similar types
    example_documents       TEXT[],               -- real-world examples for classifier training
    
    -- Lifecycle
    is_active       BOOLEAN NOT NULL DEFAULT true,
    is_system       BOOLEAN NOT NULL DEFAULT false, -- system types can't be deleted, only deactivated
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by      TEXT,                          -- admin user id or 'system'
    
    -- Constraints
    CONSTRAINT depth_limit CHECK (depth <= 3),
    CONSTRAINT slug_format CHECK (slug ~ '^[a-z][a-z0-9_]*$')
);

CREATE INDEX idx_kg_entity_types_parent ON kg_entity_types(parent_id);
CREATE INDEX idx_kg_entity_types_path ON kg_entity_types(path);
CREATE INDEX idx_kg_entity_types_active ON kg_entity_types(is_active) WHERE is_active = true;

-- Trigger to auto-compute path and depth from parent
CREATE OR REPLACE FUNCTION compute_entity_type_path()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.parent_id IS NULL THEN
        NEW.depth := 0;
        NEW.path := NEW.slug;
    ELSE
        SELECT depth + 1, path || '/' || NEW.slug
        INTO NEW.depth, NEW.path
        FROM kg_entity_types WHERE id = NEW.parent_id;
        
        IF NEW.depth > 3 THEN
            RAISE EXCEPTION 'Entity type hierarchy cannot exceed 3 levels deep';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_entity_type_path
    BEFORE INSERT OR UPDATE OF parent_id, slug ON kg_entity_types
    FOR EACH ROW EXECUTE FUNCTION compute_entity_type_path();


-- ============================================================================
-- PART 2: RELATIONSHIP TYPE TAXONOMY
-- ============================================================================

-- Every kg_relationship record references one of these types.
-- Directional: from_entity → to_entity means something specific.

CREATE TABLE kg_relationship_types (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identity
    slug            TEXT NOT NULL UNIQUE,
    name            TEXT NOT NULL,                 -- 'Supersedes', 'Amends'
    description     TEXT,                          -- what this relationship means
    
    -- Directionality
    forward_label   TEXT NOT NULL,                 -- A → B: "supersedes"
    inverse_label   TEXT NOT NULL,                 -- B → A: "superseded by"
    
    -- Constraints on usage
    valid_from_types TEXT[],                       -- entity type slugs allowed as source (null = any)
    valid_to_types   TEXT[],                       -- entity type slugs allowed as target (null = any)
    is_temporal      BOOLEAN NOT NULL DEFAULT false, -- does this relationship have effective dates?
    is_exclusive     BOOLEAN NOT NULL DEFAULT false, -- can an entity have only one of these?
    
    -- Lifecycle
    is_active       BOOLEAN NOT NULL DEFAULT true,
    is_system       BOOLEAN NOT NULL DEFAULT false,
    sort_order      INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by      TEXT,
    
    CONSTRAINT slug_format CHECK (slug ~ '^[a-z][a-z0-9_]*$')
);

CREATE INDEX idx_kg_relationship_types_active ON kg_relationship_types(is_active) WHERE is_active = true;


-- ============================================================================
-- PART 3: DOMAIN TAGS
-- ============================================================================

-- Cross-cutting domain labels that can be applied to any entity.
-- An entity can belong to multiple domains (e.g., a compounding rule touches
-- both "controlled_substances" and "pharmacy_regulation").

CREATE TABLE kg_domains (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug            TEXT NOT NULL UNIQUE,
    name            TEXT NOT NULL,
    description     TEXT,
    parent_id       UUID REFERENCES kg_domains(id),
    color           TEXT,                          -- hex color for UI display
    is_active       BOOLEAN NOT NULL DEFAULT true,
    sort_order      INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT slug_format CHECK (slug ~ '^[a-z][a-z0-9_]*$')
);

-- Junction table: entities ↔ domains (many-to-many)
CREATE TABLE kg_entity_domains (
    entity_id       UUID NOT NULL REFERENCES kg_entities(id) ON DELETE CASCADE,
    domain_id       UUID NOT NULL REFERENCES kg_domains(id) ON DELETE CASCADE,
    confidence      DECIMAL(3,2),                  -- 0.00-1.00, null if manually assigned
    assigned_by     TEXT NOT NULL DEFAULT 'system', -- 'system', 'agent', or admin user id
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (entity_id, domain_id)
);

CREATE INDEX idx_entity_domains_domain ON kg_entity_domains(domain_id);


-- ============================================================================
-- PART 4: JURISDICTION TAGS
-- ============================================================================

-- Separate from the jurisdiction column on kg_entities (which is a default).
-- Some entities span multiple jurisdictions. This table handles that.

CREATE TABLE kg_jurisdictions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            TEXT NOT NULL UNIQUE,           -- 'US', 'FL', 'FL-BOM', 'FL-BOP'
    name            TEXT NOT NULL,
    jurisdiction_type TEXT NOT NULL,                -- 'federal', 'state', 'board', 'local'
    parent_code     TEXT REFERENCES kg_jurisdictions(code),
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE kg_entity_jurisdictions (
    entity_id       UUID NOT NULL REFERENCES kg_entities(id) ON DELETE CASCADE,
    jurisdiction_id UUID NOT NULL REFERENCES kg_jurisdictions(id) ON DELETE CASCADE,
    is_primary      BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (entity_id, jurisdiction_id)
);

CREATE INDEX idx_entity_jurisdictions_jur ON kg_entity_jurisdictions(jurisdiction_id);


-- ============================================================================
-- PART 5: CLASSIFICATION RULES ENGINE
-- ============================================================================

-- Programmatic rules evaluated at ingest time. Rules are stored as database
-- rows and applied in priority order. Editable via admin UI or prompt.

CREATE TABLE classification_rules (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identity
    name            TEXT NOT NULL,
    description     TEXT,
    
    -- Rule definition
    rule_type       TEXT NOT NULL DEFAULT 'assign_entity_type',
    -- 'assign_entity_type' — sets entity_type on matching content
    -- 'assign_domain'      — tags matching content with a domain
    -- 'assign_severity'    — sets severity level
    -- 'flag_for_review'    — routes to HITL review
    -- 'exclude'            — marks content as non-regulatory noise
    
    -- Conditions (evaluated as AND — all must match)
    conditions      JSONB NOT NULL DEFAULT '[]',
    -- Each condition: { "field": "...", "operator": "...", "value": "..." }
    -- Fields: source_id, source_name, source_agency, jurisdiction,
    --         content_keywords, document_structure, url_pattern,
    --         content_length, detected_severity, agent_confidence
    -- Operators: eq, neq, contains, not_contains, gt, lt, gte, lte, 
    --            matches (regex), in, not_in, exists, not_exists
    
    -- Action (what to do when conditions match)
    action          JSONB NOT NULL DEFAULT '{}',
    -- Examples:
    --   { "entity_type_slug": "enforcement_action" }
    --   { "domain_slugs": ["compounding", "controlled_substances"] }
    --   { "severity": "critical", "requires_review": true }
    --   { "exclude": true, "reason": "navigation content" }
    
    -- Execution
    priority        INT NOT NULL DEFAULT 100,       -- lower = evaluated first
    stop_on_match   BOOLEAN NOT NULL DEFAULT false,  -- if true, skip remaining rules
    rule_set_id     UUID,                           -- optional grouping (FK added below)
    
    -- Lifecycle
    is_active       BOOLEAN NOT NULL DEFAULT true,
    version         INT NOT NULL DEFAULT 1,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by      TEXT NOT NULL DEFAULT 'system',
    
    -- Stats
    times_matched   BIGINT NOT NULL DEFAULT 0,
    last_matched_at TIMESTAMPTZ
);

CREATE INDEX idx_classification_rules_active ON classification_rules(is_active, priority) 
    WHERE is_active = true;
CREATE INDEX idx_classification_rules_type ON classification_rules(rule_type);

-- Rule sets: named groups of rules that can be enabled/disabled together
CREATE TABLE classification_rule_sets (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    description     TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by      TEXT NOT NULL DEFAULT 'system'
);

ALTER TABLE classification_rules 
    ADD CONSTRAINT fk_rule_set 
    FOREIGN KEY (rule_set_id) REFERENCES classification_rule_sets(id);


-- ============================================================================
-- PART 6: CLASSIFICATION RESULTS
-- ============================================================================

-- Every classification attempt (programmatic or agent) produces a result record.
-- This is the provenance layer — you can always trace why something was 
-- classified the way it was.

CREATE TABLE classification_results (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- What was classified
    change_id       UUID REFERENCES changes(id),           -- if classifying a change
    entity_id       UUID REFERENCES kg_entities(id),       -- if classifying an entity
    
    -- Classification output
    entity_type_slug    TEXT REFERENCES kg_entity_types(slug),
    domain_slugs        TEXT[],
    severity            TEXT,
    confidence          DECIMAL(3,2),                       -- 0.00-1.00
    
    -- How it was classified
    classification_method TEXT NOT NULL,
    -- 'programmatic' — matched a classification_rule
    -- 'agent'        — classified by intelligence pipeline
    -- 'manual'       — admin override
    
    -- Provenance
    rule_id         UUID REFERENCES classification_rules(id),  -- which rule matched (programmatic)
    agent_name      TEXT,                                       -- which agent (agent)
    agent_version   TEXT,                                       -- agent@version
    model           TEXT,                                       -- claude model used
    reasoning       TEXT,                                       -- agent's reasoning or admin's notes
    raw_output      JSONB,                                      -- full agent response
    
    -- Lifecycle
    is_current      BOOLEAN NOT NULL DEFAULT true,              -- latest classification for this entity
    superseded_by   UUID REFERENCES classification_results(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by      TEXT NOT NULL DEFAULT 'system',
    
    -- At least one target must be set
    CONSTRAINT has_target CHECK (change_id IS NOT NULL OR entity_id IS NOT NULL)
);

CREATE INDEX idx_classification_results_entity ON classification_results(entity_id) 
    WHERE is_current = true;
CREATE INDEX idx_classification_results_change ON classification_results(change_id);
CREATE INDEX idx_classification_results_method ON classification_results(classification_method);
CREATE INDEX idx_classification_results_confidence ON classification_results(confidence) 
    WHERE confidence < 0.7;


-- ============================================================================
-- PART 7: CLASSIFICATION OVERRIDES (MANUAL RECLASSIFICATION)
-- ============================================================================

-- Every manual change to a classification. Immutable audit trail.

CREATE TABLE classification_overrides (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- What was reclassified
    entity_id       UUID REFERENCES kg_entities(id),
    change_id       UUID REFERENCES changes(id),
    
    -- What changed
    field_changed   TEXT NOT NULL,                  -- 'entity_type', 'domains', 'severity', 'metadata'
    old_value       JSONB NOT NULL,
    new_value       JSONB NOT NULL,
    
    -- Who and why
    overridden_by   TEXT NOT NULL,                  -- admin user id
    reason          TEXT NOT NULL,                  -- required: explain every override
    
    -- Context
    previous_result_id UUID REFERENCES classification_results(id),
    new_result_id      UUID REFERENCES classification_results(id),
    
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT has_target CHECK (entity_id IS NOT NULL OR change_id IS NOT NULL)
);

-- Override records are append-only
CREATE OR REPLACE FUNCTION prevent_override_mutation()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'classification_overrides table is append-only.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_override_append_only
    BEFORE UPDATE OR DELETE ON classification_overrides
    FOR EACH ROW EXECUTE FUNCTION prevent_override_mutation();

CREATE INDEX idx_overrides_entity ON classification_overrides(entity_id);
CREATE INDEX idx_overrides_change ON classification_overrides(change_id);
CREATE INDEX idx_overrides_by ON classification_overrides(overridden_by);


-- ============================================================================
-- PART 8: ENTITY MERGE TRACKING
-- ============================================================================

-- When two ingested documents turn out to be the same regulation,
-- they get merged. This table tracks every merge with full provenance.

CREATE TABLE kg_entity_merges (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- The merge
    surviving_entity_id UUID NOT NULL REFERENCES kg_entities(id),
    merged_entity_id    UUID NOT NULL REFERENCES kg_entities(id),
    
    -- Context
    merge_reason    TEXT NOT NULL,
    merge_strategy  TEXT NOT NULL DEFAULT 'keep_surviving',
    -- 'keep_surviving'   — surviving entity's data wins
    -- 'keep_merged'      — merged entity's data wins  
    -- 'combine'          — merge metadata from both
    
    -- Snapshot of merged entity at time of merge (for undo)
    merged_entity_snapshot JSONB NOT NULL,
    
    -- Who
    merged_by       TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT different_entities CHECK (surviving_entity_id != merged_entity_id)
);

-- Merge records are append-only
CREATE OR REPLACE FUNCTION prevent_merge_mutation()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'kg_entity_merges table is append-only.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_merge_append_only
    BEFORE UPDATE OR DELETE ON kg_entity_merges
    FOR EACH ROW EXECUTE FUNCTION prevent_merge_mutation();

CREATE INDEX idx_merges_surviving ON kg_entity_merges(surviving_entity_id);
CREATE INDEX idx_merges_merged ON kg_entity_merges(merged_entity_id);


-- ============================================================================
-- PART 9: TAXONOMY CHANGE LOG
-- ============================================================================

-- Every change to the taxonomy itself (adding types, editing relationships,
-- modifying rules) is logged here. This is distinct from entity classification
-- changes — this tracks changes to the classification system itself.

CREATE TABLE taxonomy_changelog (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    table_name      TEXT NOT NULL,                  -- which taxonomy table changed
    record_id       UUID NOT NULL,                  -- which record changed
    action          TEXT NOT NULL,                  -- 'insert', 'update', 'delete', 'deactivate'
    
    old_values      JSONB,                          -- before (null for inserts)
    new_values      JSONB,                          -- after (null for deletes)
    
    changed_by      TEXT NOT NULL,                  -- admin user id or 'system'
    reason          TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Append-only
CREATE OR REPLACE FUNCTION prevent_changelog_mutation()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'taxonomy_changelog table is append-only.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_changelog_append_only
    BEFORE UPDATE OR DELETE ON taxonomy_changelog
    FOR EACH ROW EXECUTE FUNCTION prevent_changelog_mutation();

CREATE INDEX idx_taxonomy_changelog_table ON taxonomy_changelog(table_name, record_id);
CREATE INDEX idx_taxonomy_changelog_time ON taxonomy_changelog(created_at DESC);


-- ============================================================================
-- PART 10: ALTER EXISTING TABLES
-- ============================================================================

-- Add entity_type_id FK to kg_entities (linking to the new taxonomy)
ALTER TABLE kg_entities 
    ADD COLUMN entity_type_id UUID REFERENCES kg_entity_types(id);

-- Add relationship_type_id FK to kg_relationships
ALTER TABLE kg_relationships
    ADD COLUMN relationship_type_id UUID REFERENCES kg_relationship_types(id);

-- Add classification linkage to kg_entities
ALTER TABLE kg_entities
    ADD COLUMN current_classification_id UUID REFERENCES classification_results(id),
    ADD COLUMN classification_confidence DECIMAL(3,2),
    ADD COLUMN last_classified_at TIMESTAMPTZ;

-- Index the new columns
CREATE INDEX idx_kg_entities_type_id ON kg_entities(entity_type_id);
CREATE INDEX idx_kg_relationships_type_id ON kg_relationships(relationship_type_id);
CREATE INDEX idx_kg_entities_confidence ON kg_entities(classification_confidence) 
    WHERE classification_confidence < 0.7;


-- ============================================================================
-- PART 11: SEED DATA — BASE ENTITY TYPES
-- ============================================================================

-- Root-level entity types (the "buckets")
INSERT INTO kg_entity_types (slug, name, description, is_system, distinguishing_criteria, example_documents, sort_order) VALUES

-- Primary Regulatory Content
('statute', 'Statute', 
 'Legislation enacted by a legislative body (Congress, state legislature) that creates, modifies, or repeals law.',
 true,
 'Originates from a legislature. Has a public law number or statute citation. Requires legislative vote to change.',
 ARRAY['21 USC §353a (FDCA compounding provisions)', 'FL Stat §458 (Medical Practice Act)', 'FL Stat §465 (Pharmacy Act)'],
 10),

('regulation', 'Regulation',
 'Binding rule promulgated by an executive agency under statutory authority, published in a register and codified.',
 true,
 'Issued by an agency under delegated authority. Published in Federal Register or FL Administrative Register. Codified in CFR or FAC.',
 ARRAY['21 CFR Part 216 (compounding)', '64B8 FAC (FL Board of Medicine rules)', 'DEA scheduling rules'],
 20),

('guidance', 'Guidance',
 'Non-binding document issued by an agency explaining its interpretation of law, recommended practices, or compliance expectations.',
 true,
 'Explicitly labeled as guidance, advisory, or non-binding. Reflects agency interpretation. Cannot create new legal obligations.',
 ARRAY['FDA Compounding Guidance Documents', 'CMS MLN Matters articles', 'DEA Practitioner Manual'],
 30),

('enforcement_action', 'Enforcement Action',
 'Formal agency action against a person or entity for alleged violations, including warnings, fines, consent decrees, and license actions.',
 true,
 'Directed at a specific person/entity. Alleges a violation. Imposes or threatens a consequence.',
 ARRAY['FDA Warning Letters', 'FL BOM disciplinary orders', 'DEA registration revocations', 'FTC consent decrees'],
 40),

('court_decision', 'Court Decision',
 'Judicial ruling from any court level that interprets, applies, or invalidates regulatory or statutory provisions.',
 true,
 'Issued by a court (not an agency). Interprets law. May set precedent. Includes orders, opinions, and injunctions.',
 ARRAY['Franck''s Lab v. FDA', 'Loper Bright v. Raimondo (Chevron overrule)', 'FL circuit court injunctions'],
 50),

('notice', 'Notice',
 'Official communication from an agency announcing an action, event, deadline, or information without creating new binding requirements.',
 true,
 'Informational or procedural. Announces meetings, deadlines, availability of documents, or fee changes. Does not itself create binding rules.',
 ARRAY['Federal Register notices of proposed rulemaking', 'FL BOM meeting notices', 'FDA safety communications'],
 60),

('proposed_rule', 'Proposed Rule',
 'Draft regulation published for public comment before potential adoption as a final rule.',
 true,
 'Published for comment. Has a comment period deadline. May or may not become final. Represents agency intent.',
 ARRAY['NPRM in Federal Register', 'FL proposed rule notices in FAR', 'DEA proposed scheduling actions'],
 70),

('license_requirement', 'License Requirement',
 'Specification of credentials, permits, registrations, or authorizations required to perform regulated activities.',
 true,
 'Defines who can do what under which conditions. Specifies education, examination, or application requirements.',
 ARRAY['FL medical license requirements', 'DEA registration for prescribing', 'CLIA lab certification requirements'],
 80),

('penalty_schedule', 'Penalty Schedule',
 'Published schedule of fines, sanctions, or consequences for specific violations.',
 true,
 'Lists specific violations paired with specific consequences. May include ranges, aggravating/mitigating factors.',
 ARRAY['FL BOM fine schedule', 'OSHA penalty tables', 'CMS civil monetary penalty amounts'],
 90),

('standard', 'Standard',
 'Technical or professional standard issued by a standards body or professional association that may be incorporated by reference into regulation.',
 true,
 'Issued by a standards organization or professional body. May be voluntary or incorporated by reference into binding law.',
 ARRAY['USP compounding standards (795, 797, 800)', 'ASTM standards', 'Joint Commission standards'],
 100),

('advisory_opinion', 'Advisory Opinion',
 'Formal opinion issued by an agency or board in response to a specific question about how law applies to a particular situation.',
 true,
 'Responds to a specific factual scenario. Binds only the requester (if at all). Signals agency interpretation.',
 ARRAY['FL BOM declaratory statements', 'FDA advisory opinions', 'OIG advisory opinions'],
 110),

('exemption', 'Exemption',
 'Formal grant of relief from a regulatory requirement, either categorical or case-specific.',
 true,
 'Removes or reduces a regulatory obligation. May be conditional, time-limited, or permanent.',
 ARRAY['503B outsourcing facility exemptions', 'FDA enforcement discretion letters', 'HIPAA exemptions'],
 120);

-- Child entity types (second level — adds granularity where needed)
INSERT INTO kg_entity_types (slug, name, description, parent_id, is_system, distinguishing_criteria, sort_order) VALUES

('final_rule', 'Final Rule', 
 'Regulation that has completed the rulemaking process and is effective or scheduled to become effective.',
 (SELECT id FROM kg_entity_types WHERE slug = 'regulation'), true,
 'Has an effective date. Published as a final rule in the register. No longer open for comment.',
 10),

('interim_final_rule', 'Interim Final Rule',
 'Rule effective immediately upon publication, with post-effective comment period.',
 (SELECT id FROM kg_entity_types WHERE slug = 'regulation'), true,
 'Effective on publication but with a concurrent comment period. Often used for urgent matters.',
 20),

('emergency_rule', 'Emergency Rule',
 'Rule adopted without standard notice-and-comment procedures due to urgent circumstances.',
 (SELECT id FROM kg_entity_types WHERE slug = 'regulation'), true,
 'Bypasses normal rulemaking. Limited duration. Requires finding of imminent danger or emergency.',
 30),

('warning_letter', 'Warning Letter',
 'Formal notice from an agency that a person or entity is in violation, with demand for corrective action.',
 (SELECT id FROM kg_entity_types WHERE slug = 'enforcement_action'), true,
 'Warns of violation. Demands corrective action within a deadline. Public record.',
 10),

('consent_decree', 'Consent Decree',
 'Court-approved agreement between an agency and a regulated entity resolving enforcement action.',
 (SELECT id FROM kg_entity_types WHERE slug = 'enforcement_action'), true,
 'Negotiated settlement. Court-approved. Binding on parties. Often includes ongoing compliance requirements.',
 20),

('license_action', 'License Action',
 'Board action to suspend, revoke, restrict, or place conditions on a professional license.',
 (SELECT id FROM kg_entity_types WHERE slug = 'enforcement_action'), true,
 'Directly affects a practitioner''s ability to practice. Issued by a licensing board.',
 30),

('civil_penalty', 'Civil Penalty',
 'Monetary fine imposed by an agency for regulatory violations.',
 (SELECT id FROM kg_entity_types WHERE slug = 'enforcement_action'), true,
 'Financial penalty. Assessed by agency (not court). May be appealable.',
 40),

('draft_guidance', 'Draft Guidance',
 'Guidance document published for comment before finalization.',
 (SELECT id FROM kg_entity_types WHERE slug = 'guidance'), true,
 'Labeled as draft. Open for comment. Represents current agency thinking but not final position.',
 10),

('compliance_guide', 'Compliance Guide',
 'Guidance document specifically focused on how to comply with a regulation or set of requirements.',
 (SELECT id FROM kg_entity_types WHERE slug = 'guidance'), true,
 'Focused on compliance steps. Often structured as Q&A or checklist. Directed at regulated entities.',
 20),

('injunction', 'Injunction',
 'Court order requiring a party to do or refrain from doing a specific act.',
 (SELECT id FROM kg_entity_types WHERE slug = 'court_decision'), true,
 'Directly commands action or inaction. Can be temporary (TRO/preliminary) or permanent.',
 10),

('stay_order', 'Stay Order',
 'Court or agency order temporarily halting the enforcement or effectiveness of a rule or decision.',
 (SELECT id FROM kg_entity_types WHERE slug = 'court_decision'), true,
 'Pauses enforcement pending further proceedings. Time-limited or until further order.',
 20);


-- ============================================================================
-- PART 12: SEED DATA — BASE RELATIONSHIP TYPES
-- ============================================================================

INSERT INTO kg_relationship_types (slug, name, description, forward_label, inverse_label, is_temporal, is_exclusive, is_system, sort_order) VALUES

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

INSERT INTO kg_domains (slug, name, description, sort_order) VALUES
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

INSERT INTO kg_jurisdictions (code, name, jurisdiction_type) VALUES
('US', 'United States (Federal)', 'federal');

INSERT INTO kg_jurisdictions (code, name, jurisdiction_type, parent_code) VALUES
('FL', 'Florida', 'state', 'US'),
('FL-BOM', 'Florida Board of Medicine', 'board', 'FL'),
('FL-BOP', 'Florida Board of Pharmacy', 'board', 'FL'),
('FL-BOOM', 'Florida Board of Osteopathic Medicine', 'board', 'FL'),
('FL-DOH', 'Florida Department of Health', 'board', 'FL'),
('FL-MQA', 'Florida Medical Quality Assurance', 'board', 'FL');


-- ============================================================================
-- PART 15: SEED DATA — STARTER CLASSIFICATION RULES
-- ============================================================================

INSERT INTO classification_rules (name, description, rule_type, conditions, action, priority, is_active, created_by) VALUES

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
ALTER TABLE kg_entity_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "entity_types_read" ON kg_entity_types FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "entity_types_admin" ON kg_entity_types FOR ALL USING (auth.jwt()->>'role' = 'admin');

ALTER TABLE kg_relationship_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rel_types_read" ON kg_relationship_types FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "rel_types_admin" ON kg_relationship_types FOR ALL USING (auth.jwt()->>'role' = 'admin');

ALTER TABLE kg_domains ENABLE ROW LEVEL SECURITY;
CREATE POLICY "domains_read" ON kg_domains FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "domains_admin" ON kg_domains FOR ALL USING (auth.jwt()->>'role' = 'admin');

ALTER TABLE kg_jurisdictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "jurisdictions_read" ON kg_jurisdictions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "jurisdictions_admin" ON kg_jurisdictions FOR ALL USING (auth.jwt()->>'role' = 'admin');

-- Classification tables: admin-only
ALTER TABLE classification_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rules_admin" ON classification_rules FOR ALL USING (auth.jwt()->>'role' = 'admin');

ALTER TABLE classification_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "results_read" ON classification_results FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "results_admin" ON classification_results FOR ALL USING (auth.jwt()->>'role' = 'admin');

ALTER TABLE classification_overrides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "overrides_admin" ON classification_overrides FOR ALL USING (auth.jwt()->>'role' = 'admin');

-- Audit tables: read by authenticated, write by admin/system
ALTER TABLE taxonomy_changelog ENABLE ROW LEVEL SECURITY;
CREATE POLICY "changelog_read" ON taxonomy_changelog FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "changelog_admin" ON taxonomy_changelog FOR ALL USING (auth.jwt()->>'role' = 'admin');

ALTER TABLE kg_entity_merges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "merges_read" ON kg_entity_merges FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "merges_admin" ON kg_entity_merges FOR ALL USING (auth.jwt()->>'role' = 'admin');

-- Junction tables: readable by all authenticated, writable by admin/service role
ALTER TABLE kg_entity_domains ENABLE ROW LEVEL SECURITY;
CREATE POLICY "entity_domains_read" ON kg_entity_domains FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "entity_domains_admin" ON kg_entity_domains FOR ALL USING (auth.jwt()->>'role' = 'admin');

ALTER TABLE kg_entity_jurisdictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "entity_jurisdictions_read" ON kg_entity_jurisdictions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "entity_jurisdictions_admin" ON kg_entity_jurisdictions FOR ALL USING (auth.jwt()->>'role' = 'admin');

ALTER TABLE classification_rule_sets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rule_sets_admin" ON classification_rule_sets FOR ALL USING (auth.jwt()->>'role' = 'admin');


-- ============================================================================
-- PART 17: HELPER VIEWS
-- ============================================================================

-- Flat view of entity types with full path for easy querying
CREATE VIEW v_entity_types_flat AS
SELECT 
    t.id,
    t.slug,
    t.name,
    t.description,
    t.path,
    t.depth,
    p.slug AS parent_slug,
    p.name AS parent_name,
    t.is_active,
    t.sort_order,
    (SELECT count(*) FROM kg_entities e WHERE e.entity_type_id = t.id) AS entity_count
FROM kg_entity_types t
LEFT JOIN kg_entity_types p ON t.parent_id = p.id
WHERE t.is_active = true
ORDER BY t.path, t.sort_order;

-- Entity detail view with type, domains, and jurisdiction
CREATE VIEW v_entity_details AS
SELECT
    e.id,
    e.name,
    e.description,
    e.status,
    e.effective_date,
    e.jurisdiction,
    et.slug AS entity_type_slug,
    et.name AS entity_type_name,
    et.path AS entity_type_path,
    e.classification_confidence,
    array_agg(DISTINCT d.slug) FILTER (WHERE d.slug IS NOT NULL) AS domain_slugs,
    array_agg(DISTINCT d.name) FILTER (WHERE d.name IS NOT NULL) AS domain_names,
    array_agg(DISTINCT j.code) FILTER (WHERE j.code IS NOT NULL) AS jurisdiction_codes,
    e.created_at,
    e.updated_at
FROM kg_entities e
LEFT JOIN kg_entity_types et ON e.entity_type_id = et.id
LEFT JOIN kg_entity_domains ed ON e.id = ed.entity_id
LEFT JOIN kg_domains d ON ed.domain_id = d.id
LEFT JOIN kg_entity_jurisdictions ej ON e.id = ej.entity_id
LEFT JOIN kg_jurisdictions j ON ej.jurisdiction_id = j.id
GROUP BY e.id, et.slug, et.name, et.path;

-- Classification audit trail for a given entity
CREATE VIEW v_classification_history AS
SELECT
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
FROM classification_results cr
ORDER BY cr.created_at DESC;

-- Active classification rules with match stats
CREATE VIEW v_active_rules AS
SELECT
    r.id,
    r.name,
    r.description,
    r.rule_type,
    r.conditions,
    r.action,
    r.priority,
    r.times_matched,
    r.last_matched_at,
    rs.name AS rule_set_name,
    r.updated_at
FROM classification_rules r
LEFT JOIN classification_rule_sets rs ON r.rule_set_id = rs.id
WHERE r.is_active = true
ORDER BY r.priority;