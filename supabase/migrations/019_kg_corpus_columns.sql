-- Migration: 019_kg_corpus_columns.sql
-- Purpose: Add corpus ingestion columns to kg_entities (publication_date, document_type, pdf_url, etc.)
-- Tables affected: kg_entities
-- Special considerations: None

-- ============================================================================
-- Cedar Migration 019: KG Entity Columns for Corpus Ingestion
-- ============================================================================
-- Adds columns to kg_entities that are useful across multiple source types.
-- Source-specific data continues to live in the metadata JSONB field.
-- Columns here are promoted because they're filterable, sortable, or joinable.
-- ============================================================================

-- Publication date: when the document was published/posted (distinct from
-- effective_date, which is when it takes legal effect). Nearly every source
-- has this concept — FR publish date, board posting date, enforcement report date.
alter table public.kg_entities add column if not exists
  publication_date date;

-- Document type: more granular than entity_type. entity_type is the broad
-- category (regulation, enforcement_action). document_type is the specific
-- format from the source (RULE, PROPOSED_RULE, NOTICE, GUIDANCE, FINAL_ORDER,
-- BOARD_MINUTES, WARNING_LETTER, RECALL, etc.). Every source has this.
alter table public.kg_entities add column if not exists
  document_type text;

-- PDF URL: many sources provide both an HTML view and a PDF. external_url
-- captures the primary link (usually HTML). This captures the PDF when available.
-- Needed for eventual Docling extraction.
alter table public.kg_entities add column if not exists
  pdf_url text;

-- Comment close date: deadline for public comment on proposed rules.
-- Time-sensitive — proposed rules with upcoming deadlines are high-priority
-- alerts. Applies to Federal Register, FL Administrative Register, and
-- any source that publishes proposed rules.
alter table public.kg_entities add column if not exists
  comment_close_date date;

-- Agencies: JSONB array of agencies associated with this entity.
-- Some documents span multiple agencies (e.g., joint FDA/DEA rules).
-- source_id captures the Cedar source; this captures the actual government
-- agencies named on the document. Format: [{"name": "...", "slug": "...", "url": "..."}]
alter table public.kg_entities add column if not exists
  agencies jsonb;

-- CFR references: which Code of Federal Regulations parts this entity affects.
-- Critical for connecting Federal Register rulemaking to the actual CFR sections
-- they create/modify. Also useful for FL Administrative Code references.
-- Format: [{"title": 21, "part": 216, "section": null}]
alter table public.kg_entities add column if not exists
  cfr_references jsonb;

-- Citation: the official legal citation (e.g., "89 FR 12345", "64B8-9.003 F.A.C.",
-- "Section 503A of the FD&C Act"). Distinct from identifier (which is a dedup key
-- like document_number or report_number). Citation is the string a lawyer would use
-- to reference this document.
alter table public.kg_entities add column if not exists
  citation text;

-- Indexes for the new columns that will be filtered/sorted on
create index if not exists idx_kg_entities_publication_date
  on public.kg_entities(publication_date desc) where publication_date is not null;
create index if not exists idx_kg_entities_document_type
  on public.kg_entities(document_type) where document_type is not null;
create index if not exists idx_kg_entities_comment_close_date
  on public.kg_entities(comment_close_date) where comment_close_date is not null;
create index if not exists idx_kg_entities_citation
  on public.kg_entities(citation) where citation is not null;

-- ============================================================================
-- NOTES:
--
-- Fields that remain in metadata JSONB (query via metadata->>'' or metadata->>''):
--   Federal Register: docket_ids, regulation_id_numbers (RIN), significant (bool),
--     full_text_xml_url, raw_text_url, page_length, start_page, end_page, volume,
--     signing_date, subtype, executive_order_number
--   eCFR: title_number, part_number, subpart, section_number, amendment_date,
--     authority, source_citation
--   openFDA: recall_number, classification (I/II/III), product_description,
--     distribution_pattern, reason_for_recall, recalling_firm, voluntary_mandated
--   FL Board sources: chapter_number, rule_number, board_meeting_date,
--     board_name, agenda_item_number, disciplinary_case_number
--   FL Admin Register: far_volume, far_issue, rule_chapter, proposed_effective_date
--
-- Promotion criteria: if you find yourself writing WHERE metadata->>'field' = '...'
-- in more than 3 queries, add a real column via migration and backfill from JSONB.
-- ============================================================================
