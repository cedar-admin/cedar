-- ============================================================================
-- Cedar Crawl Profile System — Migration 011
-- Template table, discovery agent state, and seed data for 10 sources
-- ============================================================================
--
-- Depends on: source_urls table (Module 1), kg_entity_types (Migration 001)
-- Creates: crawl_templates table, discovery_runs log, seed templates
-- ============================================================================


-- ============================================================================
-- PART 1: CRAWL TEMPLATES TABLE
-- ============================================================================

CREATE TABLE crawl_templates (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug            TEXT NOT NULL UNIQUE,
    name            TEXT NOT NULL,
    description     TEXT,
    
    -- The template scrape_config — sources inherit from this
    -- Source-level scrape_config fields override template fields (shallow merge per top-level key)
    default_config  JSONB NOT NULL DEFAULT '{}',
    
    -- Which sources use this template
    -- (denormalized count for admin UI — computed, not authoritative)
    source_count    INT NOT NULL DEFAULT 0,
    
    -- Template versioning
    version         INT NOT NULL DEFAULT 1,
    changelog       JSONB DEFAULT '[]',
    
    -- Lifecycle
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by      TEXT NOT NULL DEFAULT 'system',
    
    CONSTRAINT slug_format CHECK (slug ~ '^[a-z][a-z0-9_]*$')
);

CREATE INDEX idx_crawl_templates_active ON crawl_templates(is_active) WHERE is_active = true;

-- RLS
ALTER TABLE crawl_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "templates_read" ON crawl_templates FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "templates_admin" ON crawl_templates FOR ALL USING (auth.jwt()->>'role' = 'admin');


-- ============================================================================
-- PART 2: DISCOVERY RUNS LOG
-- ============================================================================
-- Every monitoring pass (Job 2) logs its results here for observability

CREATE TABLE discovery_runs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_url_id   UUID NOT NULL REFERENCES source_urls(id),
    
    -- Run details
    run_type        TEXT NOT NULL,  -- 'pass_1_skim', 'pass_2_extract', 'initial_crawl', 'workflow'
    started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at    TIMESTAMPTZ,
    status          TEXT NOT NULL DEFAULT 'running',  -- running, completed, failed, partial
    
    -- Pass 1 results
    items_scanned   INT DEFAULT 0,
    items_changed   INT DEFAULT 0,
    items_new       INT DEFAULT 0,
    items_queued    INT DEFAULT 0,         -- queued for pass 2
    nav_changed     BOOLEAN DEFAULT false,  -- structural navigation change detected
    
    -- Pass 2 results
    items_extracted INT DEFAULT 0,
    items_classified INT DEFAULT 0,
    entities_created INT DEFAULT 0,
    
    -- Cost
    fetch_cost_usd  DECIMAL(10,6) DEFAULT 0,
    agent_cost_usd  DECIMAL(10,6) DEFAULT 0,
    
    -- Learned patterns this run
    patterns_discovered JSONB DEFAULT '[]',
    
    -- Errors
    errors          JSONB DEFAULT '[]',
    
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_discovery_runs_source ON discovery_runs(source_url_id, created_at DESC);
CREATE INDEX idx_discovery_runs_status ON discovery_runs(status) WHERE status != 'completed';

ALTER TABLE discovery_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "runs_read" ON discovery_runs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "runs_admin" ON discovery_runs FOR ALL USING (auth.jwt()->>'role' = 'admin');


-- ============================================================================
-- PART 3: SEED TEMPLATES
-- ============================================================================

INSERT INTO crawl_templates (slug, name, description, default_config, created_by) VALUES

-- Template: FL Board Site
('fl_board_site', 'Florida Board Site', 
 'Template for FL professional licensing board websites (Board of Medicine, Pharmacy, Nursing, Osteopathic Medicine). Handles laws/rules pages, meeting agendas, audio recordings, and disciplinary actions.',
 '{
   "schema_version": "1.0",
   "initial_crawl": {
     "strategy": "full_crawl",
     "depth_limit": 3,
     "page_limit": 200,
     "follow_external": true,
     "external_domains_allowed": ["www.flrules.org", "flrules.org"]
   },
   "monitoring": {
     "schedule": { "cron": "0 8 * * 1,3,5", "timezone": "America/New_York" },
     "pass_1_skim": {
       "method": "page_scan",
       "interactive_elements": [
         { "type": "accordion", "selector": ".meeting-accordion, .expandable-section", "stagehand_instruction": "Expand all accordion sections to reveal links", "expand_all": true }
       ]
     },
     "pass_2_extract": {
       "relevance_threshold": 0.2,
       "relevance_signals": [
         { "signal": "keyword_match", "weight": 0.3, "config": { "keywords": ["rule", "rulemaking", "amendment", "proposed", "emergency", "standard of care", "prescribing", "disciplinary", "final order"] } },
         { "signal": "document_type", "weight": 0.25, "config": { "types": ["pdf", "audio"], "boost": 0.3 } },
         { "signal": "date_recency", "weight": 0.2, "config": { "max_age_days": 90 } },
         { "signal": "structural_prominence", "weight": 0.15 },
         { "signal": "regulatory_language", "weight": 0.1 }
       ],
       "max_items_per_run": 15
     }
   },
   "extraction": {
     "content_selectors": {
       "main_content": "main .content-area, article, .page-content",
       "title": "h1, .page-title",
       "date": ".date, .meeting-date, time[datetime]",
       "body": ".entry-content, .field-content"
     },
     "document_handlers": [
       { "file_type": "pdf", "action": "download_and_process", "processor": "docling", "max_size_mb": 50, "url_pattern": ".*\\\\.pdf$" },
       { "file_type": "audio", "action": "download_and_process", "processor": "whisper", "max_size_mb": 500, "url_pattern": ".*(mp3|wav|m4a|wma)$" }
     ],
     "ignore_patterns": [
       { "type": "url_pattern", "pattern": "/staff-directory/", "reason": "Staff pages" },
       { "type": "url_pattern", "pattern": "/contact/", "reason": "Contact page" },
       { "type": "css_selector", "pattern": "nav, footer, .sidebar, .cookie-banner", "reason": "Chrome" }
     ],
     "normalization": { "strip_selectors": ["nav", "footer", ".sidebar", ".cookie-banner", "#breadcrumbs"], "date_format": "MM/DD/YYYY" }
   },
   "fetcher": {
     "preferred_method": "browserbase",
     "requires_javascript": true,
     "requires_interaction": true,
     "rate_limit": { "requests_per_minute": 5, "concurrent_requests": 1, "delay_between_requests_ms": 2000 }
   }
 }'::jsonb, 'system'),

-- Template: Federal Register API
('federal_register_api', 'Federal Register API',
 'Template for Federal Register API-backed sources. Uses structured JSON API with date-range queries. Zero scraping cost.',
 '{
   "schema_version": "1.0",
   "initial_crawl": {
     "strategy": "api_backfill",
     "api_config": {
       "base_url": "https://www.federalregister.gov/api/v1/documents.json",
       "pagination_type": "page_number",
       "page_size": 100,
       "date_filter_param": "conditions[publication_date][gte]",
       "backfill_from": "2024-01-01",
       "rate_limit_rpm": 500
     },
     "page_limit": 5000
   },
   "monitoring": {
     "schedule": { "cron": "0 7 * * 1-5", "timezone": "America/New_York" },
     "pass_1_skim": {
       "method": "api_poll",
       "scan_targets": [
         { "label": "Latest documents", "url": "https://www.federalregister.gov/api/v1/documents.json?per_page=20&order=newest", "watch_for": "new_links" }
       ]
     },
     "pass_2_extract": {
       "relevance_threshold": 0.1,
       "relevance_signals": [
         { "signal": "keyword_match", "weight": 0.3 },
         { "signal": "document_type", "weight": 0.25 },
         { "signal": "date_recency", "weight": 0.2 },
         { "signal": "domain_match", "weight": 0.25 }
       ],
       "max_items_per_run": 50
     }
   },
   "extraction": {
     "content_selectors": {},
     "document_handlers": [
       { "file_type": "pdf", "action": "download_and_process", "processor": "docling", "max_size_mb": 50, "url_pattern": ".*\\\\.pdf$" }
     ],
     "ignore_patterns": [],
     "normalization": { "date_format": "YYYY-MM-DD" }
   },
   "fetcher": {
     "preferred_method": "gov_api",
     "requires_javascript": false,
     "requires_interaction": false,
     "rate_limit": { "requests_per_minute": 500, "concurrent_requests": 5, "delay_between_requests_ms": 100 }
   }
 }'::jsonb, 'system'),

-- Template: Federal Agency Guidance
('federal_agency_guidance', 'Federal Agency Guidance Site',
 'Template for federal agency guidance/publication pages (FDA guidance docs, DEA practitioner guidance). Typically Oxylabs-fetched HTML with linked PDFs.',
 '{
   "schema_version": "1.0",
   "initial_crawl": {
     "strategy": "full_crawl",
     "depth_limit": 2,
     "page_limit": 300,
     "follow_external": false
   },
   "monitoring": {
     "schedule": { "cron": "0 9 * * 1,4", "timezone": "America/New_York" },
     "pass_1_skim": {
       "method": "page_scan",
       "interactive_elements": [
         { "type": "search_form", "selector": "form[action*=search], .search-form", "stagehand_instruction": "Submit search form to load results", "expand_all": false },
         { "type": "pagination", "selector": ".pagination a, a[rel=next]", "stagehand_instruction": "Click next page to load more results", "expand_all": false }
       ]
     },
     "pass_2_extract": {
       "relevance_threshold": 0.25,
       "relevance_signals": [
         { "signal": "keyword_match", "weight": 0.35 },
         { "signal": "date_recency", "weight": 0.25 },
         { "signal": "document_type", "weight": 0.2 },
         { "signal": "regulatory_language", "weight": 0.2 }
       ],
       "max_items_per_run": 20
     }
   },
   "extraction": {
     "content_selectors": {
       "main_content": "main, article, #content, .content-area",
       "title": "h1, .document-title",
       "date": ".date-published, .date, time",
       "body": ".field-content, .document-body"
     },
     "document_handlers": [
       { "file_type": "pdf", "action": "download_and_process", "processor": "docling", "max_size_mb": 50, "url_pattern": ".*\\\\.pdf$" }
     ],
     "ignore_patterns": [
       { "type": "url_pattern", "pattern": "/about/|/contact/|/careers/", "reason": "Administrative pages" },
       { "type": "css_selector", "pattern": "nav, footer, .sidebar", "reason": "Chrome" }
     ],
     "normalization": { "strip_selectors": ["nav", "footer", ".sidebar", "#breadcrumbs"], "date_format": "MM/DD/YYYY" }
   },
   "fetcher": {
     "preferred_method": "oxylabs",
     "requires_javascript": false,
     "requires_interaction": false,
     "rate_limit": { "requests_per_minute": 10, "concurrent_requests": 2, "delay_between_requests_ms": 1000 }
   }
 }'::jsonb, 'system'),

-- Template: State Administrative Register
('state_administrative_register', 'State Administrative Register',
 'Template for state administrative register / rulemaking publications (FL Administrative Register). Published on a weekly cycle.',
 '{
   "schema_version": "1.0",
   "initial_crawl": {
     "strategy": "full_crawl",
     "depth_limit": 2,
     "page_limit": 500,
     "follow_external": false
   },
   "monitoring": {
     "schedule": { "cron": "0 10 * * 5", "timezone": "America/New_York" },
     "pass_1_skim": {
       "method": "page_scan",
       "interactive_elements": [
         { "type": "dropdown", "selector": "select[name*=volume], select[name*=year]", "stagehand_instruction": "Select the most recent volume/year from the dropdown", "expand_all": false }
       ]
     },
     "pass_2_extract": {
       "relevance_threshold": 0.15,
       "relevance_signals": [
         { "signal": "keyword_match", "weight": 0.3 },
         { "signal": "date_recency", "weight": 0.3 },
         { "signal": "domain_match", "weight": 0.2 },
         { "signal": "regulatory_language", "weight": 0.2 }
       ],
       "max_items_per_run": 30
     }
   },
   "extraction": {
     "content_selectors": {
       "main_content": "#content, .content-area, main",
       "title": "h1, .rule-title",
       "date": ".date, .publication-date"
     },
     "document_handlers": [
       { "file_type": "pdf", "action": "download_and_process", "processor": "docling", "max_size_mb": 50, "url_pattern": ".*\\\\.pdf$" }
     ],
     "ignore_patterns": [],
     "normalization": { "strip_selectors": ["nav", "footer"], "date_format": "MM/DD/YYYY" }
   },
   "fetcher": {
     "preferred_method": "oxylabs",
     "requires_javascript": true,
     "requires_interaction": true,
     "rate_limit": { "requests_per_minute": 5, "concurrent_requests": 1, "delay_between_requests_ms": 2000 }
   }
 }'::jsonb, 'system'),

-- Template: Gov API (eCFR / openFDA style)
('gov_api_structured', 'Government Structured API',
 'Template for government APIs returning structured JSON/XML (eCFR, openFDA). Direct API consumption, zero scraping.',
 '{
   "schema_version": "1.0",
   "initial_crawl": {
     "strategy": "api_backfill",
     "page_limit": 10000
   },
   "monitoring": {
     "schedule": { "cron": "0 6 * * 1-5", "timezone": "America/New_York" },
     "pass_1_skim": { "method": "api_poll" },
     "pass_2_extract": {
       "relevance_threshold": 0.1,
       "relevance_signals": [
         { "signal": "keyword_match", "weight": 0.3 },
         { "signal": "date_recency", "weight": 0.3 },
         { "signal": "domain_match", "weight": 0.4 }
       ],
       "max_items_per_run": 100
     }
   },
   "extraction": {
     "content_selectors": {},
     "document_handlers": [],
     "ignore_patterns": [],
     "normalization": { "date_format": "YYYY-MM-DD" }
   },
   "fetcher": {
     "preferred_method": "gov_api",
     "requires_javascript": false,
     "requires_interaction": false,
     "rate_limit": { "requests_per_minute": 500, "concurrent_requests": 5, "delay_between_requests_ms": 100 }
   }
 }'::jsonb, 'system'),

-- Template: FL DOH Hub
('fl_doh_hub', 'FL DOH Central Hub',
 'Template for FL Department of Health hub pages that aggregate across multiple boards and programs.',
 '{
   "schema_version": "1.0",
   "initial_crawl": {
     "strategy": "full_crawl",
     "depth_limit": 2,
     "page_limit": 300,
     "follow_external": false
   },
   "monitoring": {
     "schedule": { "cron": "0 9 * * 2,5", "timezone": "America/New_York" },
     "pass_1_skim": { "method": "page_scan" },
     "pass_2_extract": {
       "relevance_threshold": 0.25,
       "relevance_signals": [
         { "signal": "keyword_match", "weight": 0.35 },
         { "signal": "date_recency", "weight": 0.25 },
         { "signal": "domain_match", "weight": 0.2 },
         { "signal": "structural_prominence", "weight": 0.2 }
       ],
       "max_items_per_run": 20
     }
   },
   "extraction": {
     "content_selectors": {
       "main_content": "#content, main, .content-area",
       "title": "h1, .page-title",
       "date": ".date, time"
     },
     "document_handlers": [
       { "file_type": "pdf", "action": "download_and_process", "processor": "docling", "max_size_mb": 50, "url_pattern": ".*\\\\.pdf$" }
     ],
     "ignore_patterns": [
       { "type": "url_pattern", "pattern": "/about/|/contact/|/careers/", "reason": "Administrative" }
     ],
     "normalization": { "strip_selectors": ["nav", "footer", ".sidebar"], "date_format": "MM/DD/YYYY" }
   },
   "fetcher": {
     "preferred_method": "oxylabs",
     "requires_javascript": false,
     "requires_interaction": false,
     "rate_limit": { "requests_per_minute": 10, "concurrent_requests": 2, "delay_between_requests_ms": 1000 }
   }
 }'::jsonb, 'system');


-- ============================================================================
-- PART 4: SCRAPE_CONFIG FOR ALL 10 SOURCES
-- ============================================================================
-- These UPDATE statements assume source_urls rows already exist from Module 1/3.
-- If inserting fresh rows, adapt to INSERT.

-- Add scrape_config column to source_urls (per-URL config, overrides sources.scrape_config)
ALTER TABLE source_urls ADD COLUMN IF NOT EXISTS scrape_config JSONB;
CREATE INDEX IF NOT EXISTS idx_source_urls_scrape_config ON source_urls USING GIN (scrape_config);

COMMENT ON COLUMN source_urls.scrape_config IS
  'Per-URL crawl configuration. Shallow-merged with crawl_templates.default_config at runtime. Top-level keys override template.';

-- 1. FDA Federal Register (Gov API)
UPDATE source_urls su SET scrape_config = '{
  "schema_version": "1.0",
  "template_ref": "federal_register_api",
  "source_meta": {
    "display_name": "FDA Federal Register",
    "agency": "FDA",
    "jurisdiction": "US",
    "domains": ["compounding", "biologics_regenerative", "medical_devices", "peptides_hormones"],
    "priority": "critical",
    "notes": "All FDA rulemaking: drug approvals, compounding policy, device clearances, biologics. Watch for 503A/503B final rules and GLP-1 shortage status changes."
  },
  "initial_crawl": {
    "strategy": "api_backfill",
    "status": "pending",
    "api_config": {
      "base_url": "https://www.federalregister.gov/api/v1/documents.json",
      "pagination_type": "page_number",
      "page_size": 100,
      "date_filter_param": "conditions[publication_date][gte]",
      "backfill_from": "2024-01-01",
      "headers": {},
      "rate_limit_rpm": 500
    }
  },
  "monitoring": {
    "enabled": true,
    "schedule": { "cron": "0 7 * * 1-5", "timezone": "America/New_York" },
    "pass_1_skim": {
      "method": "api_poll",
      "scan_targets": [
        { "label": "FDA latest documents", "url": "https://www.federalregister.gov/api/v1/documents.json?conditions[agencies][]=food-and-drug-administration&per_page=20&order=newest", "watch_for": "new_links", "baseline_hash": null }
      ]
    },
    "pass_2_extract": {
      "relevance_threshold": 0.15,
      "relevance_signals": [
        { "signal": "keyword_match", "weight": 0.3, "config": { "keywords": ["compounding", "503A", "503B", "outsourcing", "GLP-1", "semaglutide", "tirzepatide", "peptide", "shortage", "biologics", "device"] } },
        { "signal": "document_type", "weight": 0.2, "config": { "types": ["Rule", "Proposed Rule", "Notice"], "boost": 0.2 } },
        { "signal": "date_recency", "weight": 0.2, "config": { "max_age_days": 30 } },
        { "signal": "domain_match", "weight": 0.3, "config": { "domains": ["compounding", "peptides_hormones", "biologics_regenerative"] } }
      ],
      "max_items_per_run": 30
    }
  },
  "entity_mapping": {
    "default_entity_type": "regulation",
    "default_domains": ["compounding"],
    "default_jurisdiction": "US",
    "entity_type_rules": [
      { "pattern": "final.*rule", "entity_type": "final_rule", "confidence_boost": 0.3 },
      { "pattern": "proposed.*rule|NPRM", "entity_type": "proposed_rule", "confidence_boost": 0.3 },
      { "pattern": "interim.*final", "entity_type": "interim_final_rule", "confidence_boost": 0.3 },
      { "pattern": "notice", "entity_type": "notice", "confidence_boost": 0.1 }
    ]
  },
  "fetcher": { "preferred_method": "gov_api" },
  "learned_patterns": { "url_patterns": [], "content_patterns": [], "link_patterns": [], "last_learning_run": null, "pattern_version": 0 }
}'::jsonb
FROM sources s WHERE su.source_id = s.id AND s.name ILIKE '%FDA Federal Register%';


-- 2. FDA Compounding Guidance (Oxylabs)
UPDATE source_urls su SET scrape_config = '{
  "schema_version": "1.0",
  "template_ref": "federal_agency_guidance",
  "source_meta": {
    "display_name": "FDA Compounding Guidance",
    "agency": "FDA",
    "jurisdiction": "US",
    "domains": ["compounding", "peptides_hormones", "pharmacy_regulation"],
    "priority": "critical",
    "notes": "FDA guidance documents on compounding: interim policies, enforcement discretion, 503A/503B bulk substance lists. Guidance signals enforcement posture."
  },
  "initial_crawl": {
    "strategy": "full_crawl",
    "status": "pending",
    "seed_urls": [
      "https://www.fda.gov/drugs/human-drug-compounding",
      "https://www.fda.gov/drugs/human-drug-compounding/bulk-drug-substances-used-compounding-under-section-503a-federal-food-drug-and-cosmetic-act",
      "https://www.fda.gov/drugs/human-drug-compounding/bulk-drug-substances-used-compounding-under-section-503b-federal-food-drug-and-cosmetic-act"
    ],
    "depth_limit": 2,
    "page_limit": 100
  },
  "monitoring": {
    "enabled": true,
    "schedule": { "cron": "0 8 * * 1,3,5", "timezone": "America/New_York" },
    "pass_1_skim": {
      "method": "page_scan",
      "scan_targets": [
        { "label": "503A bulk substances", "url": "https://www.fda.gov/drugs/human-drug-compounding/bulk-drug-substances-used-compounding-under-section-503a-federal-food-drug-and-cosmetic-act", "selector": "main .col-md-8, #content", "watch_for": "text_change", "baseline_hash": null },
        { "label": "503B bulk substances", "url": "https://www.fda.gov/drugs/human-drug-compounding/bulk-drug-substances-used-compounding-under-section-503b-federal-food-drug-and-cosmetic-act", "selector": "main .col-md-8, #content", "watch_for": "text_change", "baseline_hash": null },
        { "label": "Compounding hub", "url": "https://www.fda.gov/drugs/human-drug-compounding", "selector": "main .col-md-8", "watch_for": "new_links", "baseline_hash": null }
      ]
    },
    "pass_2_extract": {
      "relevance_threshold": 0.15,
      "relevance_signals": [
        { "signal": "keyword_match", "weight": 0.35, "config": { "keywords": ["compounding", "503A", "503B", "bulk substance", "outsourcing", "BPC-157", "semaglutide", "tirzepatide", "GLP-1", "peptide", "shortage", "enforcement discretion", "PCAC"] } },
        { "signal": "date_recency", "weight": 0.25, "config": { "max_age_days": 60 } },
        { "signal": "document_type", "weight": 0.2, "config": { "types": ["pdf"], "boost": 0.3 } },
        { "signal": "regulatory_language", "weight": 0.2 }
      ],
      "max_items_per_run": 15
    }
  },
  "entity_mapping": {
    "default_entity_type": "guidance",
    "default_domains": ["compounding", "peptides_hormones"],
    "default_jurisdiction": "US",
    "entity_type_rules": [
      { "pattern": "draft.*guidance", "entity_type": "draft_guidance", "confidence_boost": 0.2 },
      { "pattern": "compliance.*guide|small entity", "entity_type": "compliance_guide", "confidence_boost": 0.2 },
      { "pattern": "bulk.*substance.*list|nomination", "entity_type": "standard", "confidence_boost": 0.1 }
    ]
  },
  "fetcher": { "preferred_method": "oxylabs" },
  "learned_patterns": { "url_patterns": [], "content_patterns": [], "link_patterns": [], "last_learning_run": null, "pattern_version": 0 }
}'::jsonb
FROM sources s WHERE su.source_id = s.id AND s.name ILIKE '%FDA Compounding%';


-- 3. DEA Diversion Control (Oxylabs)
UPDATE source_urls su SET scrape_config = '{
  "schema_version": "1.0",
  "template_ref": "federal_agency_guidance",
  "source_meta": {
    "display_name": "DEA Diversion Control",
    "agency": "DEA",
    "jurisdiction": "US",
    "domains": ["controlled_substances", "telehealth"],
    "priority": "critical",
    "notes": "Practitioner guidance, telehealth prescribing policy, registration requirements. 4th telehealth extension expires Dec 31 2026.",
    "active_risks": ["4th telehealth temporary extension expiring Dec 31 2026"]
  },
  "initial_crawl": {
    "strategy": "full_crawl",
    "status": "pending",
    "seed_urls": [
      "https://www.deadiversion.usdoj.gov",
      "https://www.deadiversion.usdoj.gov/telemedicine.html",
      "https://www.deadiversion.usdoj.gov/schedules/"
    ],
    "depth_limit": 2,
    "page_limit": 150
  },
  "monitoring": {
    "enabled": true,
    "schedule": { "cron": "0 8 * * 1,3,5", "timezone": "America/New_York" },
    "pass_1_skim": {
      "method": "page_scan",
      "scan_targets": [
        { "label": "Telehealth hub", "url": "https://www.deadiversion.usdoj.gov/telemedicine.html", "selector": "body", "watch_for": "text_change", "baseline_hash": null },
        { "label": "Schedules", "url": "https://www.deadiversion.usdoj.gov/schedules/", "selector": "body", "watch_for": "text_change", "baseline_hash": null },
        { "label": "Main page", "url": "https://www.deadiversion.usdoj.gov", "selector": "body", "watch_for": "new_links", "baseline_hash": null }
      ]
    },
    "pass_2_extract": {
      "relevance_threshold": 0.2,
      "relevance_signals": [
        { "signal": "keyword_match", "weight": 0.35, "config": { "keywords": ["telehealth", "telemedicine", "prescribing", "schedule", "registration", "controlled substance", "extension", "temporary", "permanent rule", "testosterone", "phentermine"] } },
        { "signal": "date_recency", "weight": 0.25, "config": { "max_age_days": 60 } },
        { "signal": "document_type", "weight": 0.2, "config": { "types": ["pdf"], "boost": 0.3 } },
        { "signal": "regulatory_language", "weight": 0.2 }
      ],
      "max_items_per_run": 10
    }
  },
  "entity_mapping": {
    "default_entity_type": "guidance",
    "default_domains": ["controlled_substances", "telehealth"],
    "default_jurisdiction": "US",
    "entity_type_rules": [
      { "pattern": "schedule.*change|scheduling", "entity_type": "regulation", "confidence_boost": 0.2 },
      { "pattern": "registration|practitioner.*manual", "entity_type": "license_requirement", "confidence_boost": 0.2 },
      { "pattern": "extension|temporary|telehealth.*rule", "entity_type": "regulation", "confidence_boost": 0.3 }
    ]
  },
  "fetcher": { "preferred_method": "oxylabs" },
  "learned_patterns": { "url_patterns": [], "content_patterns": [], "link_patterns": [], "last_learning_run": null, "pattern_version": 0 }
}'::jsonb
FROM sources s WHERE su.source_id = s.id AND s.name ILIKE '%DEA Diversion%';


-- 4. eCFR Title 21 (Gov API)
UPDATE source_urls su SET scrape_config = '{
  "schema_version": "1.0",
  "template_ref": "gov_api_structured",
  "source_meta": {
    "display_name": "eCFR Title 21",
    "agency": "eCFR / NARA",
    "jurisdiction": "US",
    "domains": ["compounding", "controlled_substances", "medical_devices", "pharmacy_regulation"],
    "priority": "critical",
    "notes": "Living, continuously updated CFR. Every static CFR citation resolves here. Cross-reference against Federal Register for effective dates."
  },
  "initial_crawl": {
    "strategy": "api_backfill",
    "status": "pending",
    "api_config": {
      "base_url": "https://www.ecfr.gov/api/versioner/v1/versions/title-21",
      "pagination_type": "next_link",
      "page_size": 100,
      "date_filter_param": "date",
      "backfill_from": "2024-01-01",
      "rate_limit_rpm": 100
    }
  },
  "monitoring": {
    "enabled": true,
    "schedule": { "cron": "0 6 * * 1-5", "timezone": "America/New_York" },
    "pass_1_skim": {
      "method": "api_poll",
      "scan_targets": [
        { "label": "Title 21 versions", "url": "https://www.ecfr.gov/api/versioner/v1/versions/title-21?order=newest", "watch_for": "new_links", "baseline_hash": null }
      ]
    },
    "pass_2_extract": {
      "relevance_threshold": 0.1,
      "relevance_signals": [
        { "signal": "keyword_match", "weight": 0.3, "config": { "keywords": ["compounding", "503", "part 216", "part 1300", "part 1301", "schedule", "controlled", "device"] } },
        { "signal": "date_recency", "weight": 0.3 },
        { "signal": "domain_match", "weight": 0.4 }
      ],
      "max_items_per_run": 50
    }
  },
  "entity_mapping": {
    "default_entity_type": "regulation",
    "default_domains": ["compounding", "controlled_substances"],
    "default_jurisdiction": "US"
  },
  "fetcher": { "preferred_method": "gov_api" },
  "learned_patterns": { "url_patterns": [], "content_patterns": [], "link_patterns": [], "last_learning_run": null, "pattern_version": 0 }
}'::jsonb
FROM sources s WHERE su.source_id = s.id AND s.name ILIKE '%eCFR%';


-- 5. openFDA Drug Enforcement (Gov API)
UPDATE source_urls su SET scrape_config = '{
  "schema_version": "1.0",
  "template_ref": "gov_api_structured",
  "source_meta": {
    "display_name": "openFDA Drug Enforcement",
    "agency": "FDA",
    "jurisdiction": "US",
    "domains": ["compounding", "peptides_hormones"],
    "priority": "critical",
    "notes": "Drug enforcement reports via openFDA API. Tracks recalls, market withdrawals, and enforcement actions."
  },
  "initial_crawl": {
    "strategy": "api_backfill",
    "status": "pending",
    "api_config": {
      "base_url": "https://api.fda.gov/drug/enforcement.json",
      "pagination_type": "offset",
      "page_size": 100,
      "date_filter_param": "search=report_date:[20240101+TO+{today}]",
      "backfill_from": "2024-01-01",
      "rate_limit_rpm": 240
    }
  },
  "monitoring": {
    "enabled": true,
    "schedule": { "cron": "0 6 * * 1-5", "timezone": "America/New_York" },
    "pass_1_skim": {
      "method": "api_poll",
      "scan_targets": [
        { "label": "Latest enforcement reports", "url": "https://api.fda.gov/drug/enforcement.json?limit=20&sort=report_date:desc", "watch_for": "new_links", "baseline_hash": null }
      ]
    },
    "pass_2_extract": {
      "relevance_threshold": 0.15,
      "relevance_signals": [
        { "signal": "keyword_match", "weight": 0.4, "config": { "keywords": ["compounding", "compounded", "semaglutide", "tirzepatide", "GLP-1", "peptide", "hormone", "testosterone", "sterile"] } },
        { "signal": "date_recency", "weight": 0.3 },
        { "signal": "domain_match", "weight": 0.3 }
      ],
      "max_items_per_run": 30
    }
  },
  "entity_mapping": {
    "default_entity_type": "enforcement_action",
    "default_domains": ["compounding"],
    "default_jurisdiction": "US"
  },
  "fetcher": { "preferred_method": "gov_api" },
  "learned_patterns": { "url_patterns": [], "content_patterns": [], "link_patterns": [], "last_learning_run": null, "pattern_version": 0 }
}'::jsonb
FROM sources s WHERE su.source_id = s.id AND s.name ILIKE '%openFDA%';


-- 6. FL Dept of Health — MQA (Oxylabs)
UPDATE source_urls su SET scrape_config = '{
  "schema_version": "1.0",
  "template_ref": "fl_doh_hub",
  "source_meta": {
    "display_name": "FL Dept of Health — MQA",
    "agency": "FL DOH MQA",
    "jurisdiction": "FL",
    "domains": ["licensing", "scope_of_practice"],
    "priority": "critical",
    "notes": "Centralized portal for all 40+ FL health profession boards: licensing news, rulemaking alerts, board meeting schedules."
  },
  "initial_crawl": {
    "strategy": "full_crawl",
    "status": "pending",
    "seed_urls": [
      "http://www.floridahealth.gov/licensing-and-regulation/boards-and-councils.html",
      "https://www.floridahealth.gov/about-us/laws-and-rules/index.html"
    ],
    "depth_limit": 2,
    "page_limit": 200
  },
  "monitoring": {
    "enabled": true,
    "schedule": { "cron": "0 9 * * 2,5", "timezone": "America/New_York" },
    "pass_1_skim": {
      "method": "page_scan",
      "scan_targets": [
        { "label": "Boards and councils hub", "url": "http://www.floridahealth.gov/licensing-and-regulation/boards-and-councils.html", "selector": "#content, main, .content-area", "watch_for": "new_links", "baseline_hash": null },
        { "label": "Laws and rules", "url": "https://www.floridahealth.gov/about-us/laws-and-rules/index.html", "selector": "#content, main", "watch_for": "text_change", "baseline_hash": null }
      ]
    },
    "pass_2_extract": {
      "relevance_threshold": 0.25,
      "relevance_signals": [
        { "signal": "keyword_match", "weight": 0.35, "config": { "keywords": ["rulemaking", "rule", "board", "licensing", "scope of practice", "64B", "medicine", "pharmacy", "nursing", "osteopathic"] } },
        { "signal": "date_recency", "weight": 0.25 },
        { "signal": "domain_match", "weight": 0.2 },
        { "signal": "structural_prominence", "weight": 0.2 }
      ],
      "max_items_per_run": 20
    }
  },
  "entity_mapping": {
    "default_entity_type": "notice",
    "default_domains": ["licensing", "scope_of_practice"],
    "default_jurisdiction": "FL"
  },
  "fetcher": { "preferred_method": "oxylabs" },
  "learned_patterns": { "url_patterns": [], "content_patterns": [], "link_patterns": [], "last_learning_run": null, "pattern_version": 0 }
}'::jsonb
FROM sources s WHERE su.source_id = s.id AND s.name ILIKE '%Dept of Health%MQA%';


-- 7. FL Board of Medicine (Oxylabs/BrowserBase)
UPDATE source_urls su SET scrape_config = '{
  "schema_version": "1.0",
  "template_ref": "fl_board_site",
  "source_meta": {
    "display_name": "FL Board of Medicine",
    "agency": "FL Board of Medicine",
    "jurisdiction": "FL-BOM",
    "domains": ["scope_of_practice", "licensing", "medical_aesthetics", "advertising"],
    "priority": "critical",
    "notes": "Primary source for physician-specific compliance obligations in Florida. Ch. 64B8 F.A.C. Board meets ~6x/year."
  },
  "initial_crawl": {
    "strategy": "full_crawl",
    "status": "pending",
    "seed_urls": [
      "https://flboardofmedicine.gov/laws-rules/",
      "https://flboardofmedicine.gov/meeting-information/past-meetings/",
      "https://flboardofmedicine.gov/meeting-information/upcoming-meetings/"
    ],
    "depth_limit": 3,
    "page_limit": 200,
    "follow_external": true,
    "external_domains_allowed": ["www.flrules.org", "flrules.org"]
  },
  "monitoring": {
    "enabled": true,
    "schedule": { "cron": "0 8 * * 1,3,5", "timezone": "America/New_York" },
    "pass_1_skim": {
      "method": "page_scan",
      "scan_targets": [
        { "label": "Laws & Rules page", "url": "https://flboardofmedicine.gov/laws-rules/", "selector": "main .content-area, #content", "watch_for": "text_change", "baseline_hash": null },
        { "label": "Upcoming meetings", "url": "https://flboardofmedicine.gov/meeting-information/upcoming-meetings/", "selector": ".meeting-list, .event-list, main", "watch_for": "new_links", "baseline_hash": null },
        { "label": "Past meetings (minutes/audio)", "url": "https://flboardofmedicine.gov/meeting-information/past-meetings/", "selector": ".meeting-list, .event-list, main", "watch_for": "new_document", "baseline_hash": null }
      ],
      "interactive_elements": [
        { "type": "accordion", "selector": ".meeting-accordion, .expandable-section", "stagehand_instruction": "Expand all meeting accordion sections to reveal agenda and audio links", "expand_all": true }
      ]
    },
    "pass_2_extract": {
      "relevance_threshold": 0.2,
      "relevance_signals": [
        { "signal": "keyword_match", "weight": 0.3, "config": { "keywords": ["64B8", "rule", "rulemaking", "amendment", "proposed", "emergency", "standard of care", "prescribing", "office surgery", "advertising", "disciplinary", "final order"] } },
        { "signal": "document_type", "weight": 0.25, "config": { "types": ["pdf", "audio"], "boost": 0.3 } },
        { "signal": "date_recency", "weight": 0.2, "config": { "max_age_days": 90 } },
        { "signal": "structural_prominence", "weight": 0.15 },
        { "signal": "regulatory_language", "weight": 0.1 }
      ],
      "max_items_per_run": 15
    }
  },
  "entity_mapping": {
    "default_entity_type": "regulation",
    "default_domains": ["scope_of_practice", "licensing"],
    "default_jurisdiction": "FL-BOM",
    "entity_type_rules": [
      { "pattern": "64B8.*proposed|proposed.*rule|rule development", "entity_type": "proposed_rule", "confidence_boost": 0.2 },
      { "pattern": "final.*order|disciplinary|consent.*agreement", "entity_type": "enforcement_action", "confidence_boost": 0.2 },
      { "pattern": "emergency.*rule|emergency.*order", "entity_type": "emergency_rule", "confidence_boost": 0.3 },
      { "pattern": "declaratory.*statement", "entity_type": "advisory_opinion", "confidence_boost": 0.2 },
      { "pattern": "meeting.*notice|agenda|board.*meeting", "entity_type": "notice", "confidence_boost": 0.1 }
    ]
  },
  "workflows": [
    {
      "id": "board_meeting_pipeline",
      "name": "Board Meeting Intelligence Pipeline",
      "description": "Detects meeting notices, retrieves agendas, downloads audio, transcribes, and creates linked KG entities.",
      "enabled": true,
      "trigger": {
        "type": "content_detected",
        "conditions": [
          { "field": "link_text", "operator": "matches", "value": "(?i)(meeting.*notice|upcoming.*meeting|agenda|board.*meeting)" },
          { "field": "source_section", "operator": "equals", "value": "upcoming-meetings" }
        ]
      },
      "steps": [
        { "id": "detect_meeting", "name": "Detect meeting notice", "action": "extract_content", "config": { "extract_fields": ["meeting_date", "meeting_type", "location", "agenda_url"], "date_selector": ".meeting-date, time[datetime]", "agenda_link_pattern": "(?i)agenda.*\\\\.pdf|.*agenda.*" }, "on_failure": "flag_for_review" },
        { "id": "download_agenda", "name": "Download agenda PDF", "action": "download_document", "input_from": "detect_meeting", "config": { "url_field": "agenda_url", "processor": "docling", "output_format": "markdown" }, "on_failure": "retry", "retry_config": { "max_attempts": 3, "delay_seconds": 3600 } },
        { "id": "create_meeting_entity", "name": "Create meeting entity", "action": "create_entity", "input_from": "detect_meeting", "config": { "entity_type": "notice", "name_template": "{meeting_type} — {meeting_date}", "domains": ["scope_of_practice", "licensing"], "status": "active" } },
        { "id": "create_agenda_entity", "name": "Create agenda entity", "action": "create_entity", "input_from": "download_agenda", "config": { "entity_type": "notice", "name_template": "Agenda — {meeting_type} — {meeting_date}", "link_to_step": "create_meeting_entity", "relationship_type": "references" } },
        { "id": "wait_for_audio", "name": "Watch for audio recording", "action": "wait_for_content", "input_from": "detect_meeting", "config": { "watch_url": "https://flboardofmedicine.gov/meeting-information/past-meetings/", "watch_for": "new_document", "file_types": ["mp3", "wav", "m4a"], "link_text_pattern": "(?i)(audio|recording|listen)", "start_watching_after": "meeting_date", "max_watch_days": 30, "check_interval_hours": 24 }, "on_failure": "skip", "timeout_seconds": 2592000 },
        { "id": "download_audio", "name": "Download audio", "action": "download_document", "input_from": "wait_for_audio", "config": { "processor": "none", "max_size_mb": 500 }, "on_failure": "retry", "retry_config": { "max_attempts": 3, "delay_seconds": 86400 } },
        { "id": "transcribe_audio", "name": "Transcribe via Whisper", "action": "transcribe_audio", "input_from": "download_audio", "config": { "model": "whisper-1", "language": "en", "diarize": true, "chunk_duration_minutes": 30 }, "on_failure": "flag_for_review" },
        { "id": "classify_transcript", "name": "Classify transcript segments", "action": "run_agent", "input_from": "transcribe_audio", "config": { "agent": "classifier", "segment_by": "topic", "extract_action_items": true, "extract_rulemaking_signals": true } },
        { "id": "create_transcript_entity", "name": "Create transcript entity", "action": "create_entity", "input_from": "transcribe_audio", "config": { "entity_type": "notice", "name_template": "Transcript — {meeting_type} — {meeting_date}", "link_to_step": "create_meeting_entity", "relationship_type": "references" } }
      ],
      "outputs": { "entity_types": ["notice"], "relationship_types": ["references"] }
    }
  ],
  "fetcher": { "preferred_method": "browserbase", "requires_javascript": true, "requires_interaction": true },
  "learned_patterns": { "url_patterns": [], "content_patterns": [], "link_patterns": [], "last_learning_run": null, "pattern_version": 0 }
}'::jsonb
FROM sources s WHERE su.source_id = s.id AND s.name ILIKE '%Board of Medicine%' AND s.name NOT ILIKE '%Osteopathic%';


-- 8. FL Board of Pharmacy (Oxylabs/BrowserBase)
UPDATE source_urls su SET scrape_config = '{
  "schema_version": "1.0",
  "template_ref": "fl_board_site",
  "source_meta": {
    "display_name": "FL Board of Pharmacy",
    "agency": "FL Board of Pharmacy",
    "jurisdiction": "FL-BOP",
    "domains": ["compounding", "pharmacy_regulation", "controlled_substances"],
    "priority": "critical",
    "notes": "Ch. 64B16 F.A.C.: compounding, in-office dispensing, pharmacist scope. In-office dispensing by physicians governed by Rule 64B8-4.029."
  },
  "initial_crawl": {
    "strategy": "full_crawl",
    "status": "pending",
    "seed_urls": [
      "https://floridaspharmacy.gov/laws-rules/",
      "https://floridaspharmacy.gov/meeting-information/past-meetings/",
      "https://floridaspharmacy.gov/meeting-information/upcoming-meetings/"
    ],
    "depth_limit": 3,
    "page_limit": 150,
    "follow_external": true,
    "external_domains_allowed": ["www.flrules.org", "flrules.org"]
  },
  "monitoring": {
    "enabled": true,
    "schedule": { "cron": "0 8 * * 1,3,5", "timezone": "America/New_York" },
    "pass_1_skim": {
      "method": "page_scan",
      "scan_targets": [
        { "label": "Laws & Rules", "url": "https://floridaspharmacy.gov/laws-rules/", "selector": "main, #content", "watch_for": "text_change", "baseline_hash": null },
        { "label": "Upcoming meetings", "url": "https://floridaspharmacy.gov/meeting-information/upcoming-meetings/", "selector": "main", "watch_for": "new_links", "baseline_hash": null },
        { "label": "Past meetings", "url": "https://floridaspharmacy.gov/meeting-information/past-meetings/", "selector": "main", "watch_for": "new_document", "baseline_hash": null }
      ]
    },
    "pass_2_extract": {
      "relevance_threshold": 0.2,
      "relevance_signals": [
        { "signal": "keyword_match", "weight": 0.3, "config": { "keywords": ["64B16", "compounding", "dispensing", "pharmacist", "rule", "rulemaking", "proposed", "amendment"] } },
        { "signal": "document_type", "weight": 0.25 },
        { "signal": "date_recency", "weight": 0.25 },
        { "signal": "regulatory_language", "weight": 0.2 }
      ],
      "max_items_per_run": 15
    }
  },
  "entity_mapping": {
    "default_entity_type": "regulation",
    "default_domains": ["compounding", "pharmacy_regulation"],
    "default_jurisdiction": "FL-BOP",
    "entity_type_rules": [
      { "pattern": "64B16.*proposed|proposed.*rule", "entity_type": "proposed_rule", "confidence_boost": 0.2 },
      { "pattern": "disciplinary|final.*order", "entity_type": "enforcement_action", "confidence_boost": 0.2 },
      { "pattern": "meeting|agenda", "entity_type": "notice", "confidence_boost": 0.1 }
    ]
  },
  "workflows": [
    {
      "id": "board_meeting_pipeline",
      "name": "Board Meeting Intelligence Pipeline",
      "description": "Same workflow as FL Board of Medicine — inherited from fl_board_site template.",
      "enabled": true,
      "trigger": { "type": "content_detected", "conditions": [{ "field": "link_text", "operator": "matches", "value": "(?i)(meeting.*notice|agenda|board.*meeting)" }] },
      "steps": [
        { "id": "detect_meeting", "name": "Detect meeting notice", "action": "extract_content", "config": { "extract_fields": ["meeting_date", "meeting_type", "agenda_url"] }, "on_failure": "flag_for_review" },
        { "id": "download_agenda", "name": "Download agenda PDF", "action": "download_document", "input_from": "detect_meeting", "config": { "url_field": "agenda_url", "processor": "docling" }, "on_failure": "retry" },
        { "id": "create_meeting_entity", "name": "Create meeting entity", "action": "create_entity", "input_from": "detect_meeting", "config": { "entity_type": "notice", "name_template": "FL BOP Meeting — {meeting_date}" } },
        { "id": "wait_for_audio", "name": "Watch for audio", "action": "wait_for_content", "input_from": "detect_meeting", "config": { "watch_url": "https://floridaspharmacy.gov/meeting-information/past-meetings/", "file_types": ["mp3", "wav"], "max_watch_days": 30 }, "on_failure": "skip" },
        { "id": "download_audio", "name": "Download audio", "action": "download_document", "input_from": "wait_for_audio", "config": { "max_size_mb": 500 }, "on_failure": "retry" },
        { "id": "transcribe_audio", "name": "Transcribe", "action": "transcribe_audio", "input_from": "download_audio", "config": { "model": "whisper-1", "language": "en" }, "on_failure": "flag_for_review" }
      ],
      "outputs": { "entity_types": ["notice"], "relationship_types": ["references"] }
    }
  ],
  "fetcher": { "preferred_method": "browserbase", "requires_javascript": true, "requires_interaction": true },
  "learned_patterns": { "url_patterns": [], "content_patterns": [], "link_patterns": [], "last_learning_run": null, "pattern_version": 0 }
}'::jsonb
FROM sources s WHERE su.source_id = s.id AND s.name ILIKE '%Board of Pharmacy%';


-- 9. FL Administrative Register (Oxylabs/BrowserBase)
UPDATE source_urls su SET scrape_config = '{
  "schema_version": "1.0",
  "template_ref": "state_administrative_register",
  "source_meta": {
    "display_name": "FL Administrative Register",
    "agency": "FL Division of Administrative Rules",
    "jurisdiction": "FL",
    "domains": ["scope_of_practice", "licensing", "compounding", "controlled_substances", "telehealth", "pharmacy_regulation"],
    "priority": "critical",
    "notes": "Every FL rule change publishes here before it takes effect. Primary Cedar monitoring point for state-level rule changes. Published every Friday."
  },
  "initial_crawl": {
    "strategy": "full_crawl",
    "status": "pending",
    "seed_urls": [
      "https://www.flrules.org/gateway/FlARuleVol.asp",
      "https://www.flrules.org/gateway/FlARuleDev.asp"
    ],
    "depth_limit": 2,
    "page_limit": 500
  },
  "monitoring": {
    "enabled": true,
    "schedule": { "cron": "0 10 * * 5", "timezone": "America/New_York" },
    "pass_1_skim": {
      "method": "page_scan",
      "scan_targets": [
        { "label": "Current volume", "url": "https://www.flrules.org/gateway/FlARuleVol.asp", "selector": "#content, main, body table", "watch_for": "new_links", "baseline_hash": null },
        { "label": "Rule development notices", "url": "https://www.flrules.org/gateway/FlARuleDev.asp", "selector": "#content, main, body table", "watch_for": "new_links", "baseline_hash": null }
      ],
      "interactive_elements": [
        { "type": "dropdown", "selector": "select[name*=volume], select[name*=year], select", "stagehand_instruction": "Select the most recent volume from the dropdown and click Go/Submit", "expand_all": false }
      ]
    },
    "pass_2_extract": {
      "relevance_threshold": 0.15,
      "relevance_signals": [
        { "signal": "keyword_match", "weight": 0.3, "config": { "keywords": ["64B8", "64B9", "64B15", "64B16", "medicine", "pharmacy", "nursing", "osteopathic", "health", "compounding", "prescribing", "scope", "office surgery", "MQA"] } },
        { "signal": "date_recency", "weight": 0.3, "config": { "max_age_days": 14 } },
        { "signal": "domain_match", "weight": 0.2 },
        { "signal": "regulatory_language", "weight": 0.2 }
      ],
      "max_items_per_run": 30
    }
  },
  "entity_mapping": {
    "default_entity_type": "proposed_rule",
    "default_domains": ["scope_of_practice", "licensing"],
    "default_jurisdiction": "FL",
    "entity_type_rules": [
      { "pattern": "proposed.*rule|rule.*proposed", "entity_type": "proposed_rule", "confidence_boost": 0.2 },
      { "pattern": "emergency.*rule", "entity_type": "emergency_rule", "confidence_boost": 0.3 },
      { "pattern": "rule.*amendment|amended", "entity_type": "regulation", "confidence_boost": 0.2 },
      { "pattern": "rule.*repeal|repealed", "entity_type": "regulation", "confidence_boost": 0.2 },
      { "pattern": "rule.*development|workshop", "entity_type": "notice", "confidence_boost": 0.1 }
    ]
  },
  "fetcher": { "preferred_method": "browserbase", "requires_javascript": true, "requires_interaction": true },
  "learned_patterns": { "url_patterns": [], "content_patterns": [], "link_patterns": [], "last_learning_run": null, "pattern_version": 0 }
}'::jsonb
FROM sources s WHERE su.source_id = s.id AND s.name ILIKE '%Administrative Register%';


-- 10. FL Board of Osteopathic Medicine (Oxylabs/BrowserBase)
UPDATE source_urls su SET scrape_config = '{
  "schema_version": "1.0",
  "template_ref": "fl_board_site",
  "source_meta": {
    "display_name": "FL Board of Osteopathic Medicine",
    "agency": "FL Board of Osteopathic Medicine",
    "jurisdiction": "FL-BOOM",
    "domains": ["scope_of_practice", "licensing"],
    "priority": "critical",
    "notes": "DO-specific scope and prescribing via Ch. 64B15 F.A.C. Watch for divergence from MD Board of Medicine positions."
  },
  "initial_crawl": {
    "strategy": "full_crawl",
    "status": "pending",
    "seed_urls": [
      "https://floridasosteopathicmedicine.gov/laws-rules/",
      "https://floridasosteopathicmedicine.gov/meeting-information/past-meetings/",
      "https://floridasosteopathicmedicine.gov/meeting-information/upcoming-meetings/"
    ],
    "depth_limit": 3,
    "page_limit": 150,
    "follow_external": true,
    "external_domains_allowed": ["www.flrules.org", "flrules.org"]
  },
  "monitoring": {
    "enabled": true,
    "schedule": { "cron": "0 8 * * 1,3,5", "timezone": "America/New_York" },
    "pass_1_skim": {
      "method": "page_scan",
      "scan_targets": [
        { "label": "Laws & Rules", "url": "https://floridasosteopathicmedicine.gov/laws-rules/", "selector": "main, #content", "watch_for": "text_change", "baseline_hash": null },
        { "label": "Upcoming meetings", "url": "https://floridasosteopathicmedicine.gov/meeting-information/upcoming-meetings/", "selector": "main", "watch_for": "new_links", "baseline_hash": null },
        { "label": "Past meetings", "url": "https://floridasosteopathicmedicine.gov/meeting-information/past-meetings/", "selector": "main", "watch_for": "new_document", "baseline_hash": null }
      ]
    },
    "pass_2_extract": {
      "relevance_threshold": 0.2,
      "relevance_signals": [
        { "signal": "keyword_match", "weight": 0.3, "config": { "keywords": ["64B15", "osteopathic", "DO", "rule", "rulemaking", "proposed", "amendment", "prescribing", "standard of care"] } },
        { "signal": "document_type", "weight": 0.25 },
        { "signal": "date_recency", "weight": 0.25 },
        { "signal": "regulatory_language", "weight": 0.2 }
      ],
      "max_items_per_run": 10
    }
  },
  "entity_mapping": {
    "default_entity_type": "regulation",
    "default_domains": ["scope_of_practice", "licensing"],
    "default_jurisdiction": "FL-BOOM",
    "entity_type_rules": [
      { "pattern": "64B15.*proposed|proposed.*rule", "entity_type": "proposed_rule", "confidence_boost": 0.2 },
      { "pattern": "disciplinary|final.*order", "entity_type": "enforcement_action", "confidence_boost": 0.2 },
      { "pattern": "meeting|agenda", "entity_type": "notice", "confidence_boost": 0.1 }
    ]
  },
  "workflows": [
    {
      "id": "board_meeting_pipeline",
      "name": "Board Meeting Intelligence Pipeline",
      "enabled": true,
      "trigger": { "type": "content_detected", "conditions": [{ "field": "link_text", "operator": "matches", "value": "(?i)(meeting.*notice|agenda|board.*meeting)" }] },
      "steps": [
        { "id": "detect_meeting", "name": "Detect meeting notice", "action": "extract_content", "config": { "extract_fields": ["meeting_date", "meeting_type", "agenda_url"] }, "on_failure": "flag_for_review" },
        { "id": "download_agenda", "name": "Download agenda PDF", "action": "download_document", "input_from": "detect_meeting", "config": { "url_field": "agenda_url", "processor": "docling" }, "on_failure": "retry" },
        { "id": "create_meeting_entity", "name": "Create meeting entity", "action": "create_entity", "input_from": "detect_meeting", "config": { "entity_type": "notice", "name_template": "FL BOOM Meeting — {meeting_date}" } },
        { "id": "wait_for_audio", "name": "Watch for audio", "action": "wait_for_content", "input_from": "detect_meeting", "config": { "watch_url": "https://floridasosteopathicmedicine.gov/meeting-information/past-meetings/", "file_types": ["mp3", "wav"], "max_watch_days": 30 }, "on_failure": "skip" },
        { "id": "download_audio", "name": "Download audio", "action": "download_document", "input_from": "wait_for_audio", "config": { "max_size_mb": 500 }, "on_failure": "retry" },
        { "id": "transcribe_audio", "name": "Transcribe", "action": "transcribe_audio", "input_from": "download_audio", "config": { "model": "whisper-1", "language": "en" }, "on_failure": "flag_for_review" }
      ],
      "outputs": { "entity_types": ["notice"], "relationship_types": ["references"] }
    }
  ],
  "fetcher": { "preferred_method": "browserbase", "requires_javascript": true, "requires_interaction": true },
  "learned_patterns": { "url_patterns": [], "content_patterns": [], "link_patterns": [], "last_learning_run": null, "pattern_version": 0 }
}'::jsonb
FROM sources s WHERE su.source_id = s.id AND s.name ILIKE '%Osteopathic%';
