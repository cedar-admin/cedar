-- Cedar MVP: Seed 10 Critical-Tier Florida Regulatory Sources
-- These are the initial sources for the MVP pipeline proof-of-life
-- All sources are Florida medical practice relevant (compounding, prescribing, licensing)

INSERT INTO sources (name, jurisdiction, url, fetch_method, tier, is_active, scrape_config) VALUES

-- 1. FDA Federal Register — federal rulemaking for drugs, compounding, DEA scheduling
(
  'FDA Federal Register',
  'FL',
  'https://api.federalregister.gov/v1/articles.json',
  'gov_api',
  'critical',
  true,
  '{
    "api_type": "federal_register",
    "query_params": {
      "agencies[]": ["food-and-drug-administration", "drug-enforcement-administration"],
      "per_page": 20,
      "order": "newest",
      "fields[]": ["abstract", "action", "agencies", "citation", "dates", "document_number", "effective_on", "html_url", "publication_date", "title", "type"]
    },
    "notes": "Poll for new articles daily. Use document_number as dedup key."
  }'::jsonb
),

-- 2. FDA Compounding Guidance Documents — 503A/503B bulk substance lists, GFI updates
(
  'FDA Compounding Guidance Documents',
  'FL',
  'https://www.fda.gov/drugs/human-drug-compounding/guidance-documents-related-compounding',
  'oxylabs',
  'critical',
  true,
  '{
    "selector": "table.table, .view-content",
    "notes": "Scrape table of guidance documents. Hash the document list. Detect new or updated entries by document title + date."
  }'::jsonb
),

-- 3. DEA Diversion Control Division — controlled substance scheduling, quotas, enforcement
(
  'DEA Diversion Control Division',
  'FL',
  'https://www.deadiversion.usdoj.gov/fed_regs/rules/index.html',
  'oxylabs',
  'critical',
  true,
  '{
    "selector": "#main-content",
    "notes": "Scrape list of DEA rules/final rules. Hash full page content. Flag changes to scheduling rules affecting peptides, GLP-1s, HRT compounds."
  }'::jsonb
),

-- 4. eCFR Title 21 — live Code of Federal Regulations for food/drugs/devices
(
  'eCFR Title 21 (Food & Drugs)',
  'FL',
  'https://www.ecfr.gov/api/versioner/v1/versions/title-21.json',
  'gov_api',
  'critical',
  true,
  '{
    "api_type": "ecfr",
    "notes": "Check versions endpoint for Title 21 changes. Fetch specific part diffs when versions change. Focus on Parts 207 (drug registration), 211 (GMP), 216 (pharmacy compounding), 1301-1308 (DEA scheduling)."
  }'::jsonb
),

-- 5. openFDA Drug Enforcement — recalls, enforcement actions, warning letters
(
  'openFDA Drug Enforcement Reports',
  'FL',
  'https://api.fda.gov/drug/enforcement.json',
  'gov_api',
  'critical',
  true,
  '{
    "api_type": "openfda",
    "query_params": {
      "search": "status:Ongoing",
      "limit": 50,
      "sort": "report_date:desc"
    },
    "notes": "Check for new enforcement actions daily. Use report_number as dedup key. Flag recalls affecting compounded medications or Florida-based distributors."
  }'::jsonb
),

-- 6. Florida Department of Health — MQA (Medical Quality Assurance) bulletins and news
(
  'FL Dept of Health — MQA',
  'FL',
  'https://flhealthsource.gov/mqa',
  'oxylabs',
  'critical',
  true,
  '{
    "selector": ".field-items, .view-content, main",
    "notes": "Scrape MQA news/bulletins page. Hash full content. Flag new bulletins, rule changes, enforcement actions against license holders."
  }'::jsonb
),

-- 7. Florida Board of Medicine — physician licensing rules, practice standards
(
  'FL Board of Medicine',
  'FL',
  'https://flboardofmedicine.gov/news-media/news/',
  'oxylabs',
  'critical',
  true,
  '{
    "selector": ".view-content, .field-items, main",
    "notes": "Scrape news/updates. Also monitor rules page: https://flboardofmedicine.gov/laws-rules/. Hash content list. Flag new rules, guidance, disciplinary changes."
  }'::jsonb
),

-- 8. Florida Board of Pharmacy — compounding rules, dispensing requirements
(
  'FL Board of Pharmacy',
  'FL',
  'https://floridaspharmacy.gov/news-media/news/',
  'oxylabs',
  'critical',
  true,
  '{
    "selector": ".view-content, .field-items, main",
    "notes": "Scrape pharmacy board news. Also monitor rules: https://floridaspharmacy.gov/laws-rules/. Critical for compounding guidance (503A compliance, bulk substances, beyond-use dating)."
  }'::jsonb
),

-- 9. Florida Administrative Register — new/proposed state agency rules
(
  'FL Administrative Register',
  'FL',
  'https://www.flrules.org/gateway/ruleNo.asp?id=',
  'oxylabs',
  'critical',
  true,
  '{
    "selector": "#main",
    "search_url": "https://www.flrules.org/gateway/readFile.asp?sid=&type=1&ID=",
    "notes": "Monitor weekly FAR publications for rule chapters relevant to medical practices: 59-series (DOH), 64B-series (medical/pharmacy boards). Use FAR search API if available, else scrape recent publications page."
  }'::jsonb
),

-- 10. Florida Board of Osteopathic Medicine — osteopathic practice standards
(
  'FL Board of Osteopathic Medicine',
  'FL',
  'https://floridasosteopathicmedicine.gov/news-media/news/',
  'oxylabs',
  'critical',
  true,
  '{
    "selector": ".view-content, .field-items, main",
    "notes": "Scrape osteopathic board news and rules. Many functional/integrative medicine practices are DO-owned. Monitor for changes to prescribing authority, telehealth rules, compounding guidance."
  }'::jsonb
);

-- Create source_url entries for each source (primary URL to monitor)
INSERT INTO source_urls (source_id, url)
SELECT id, url FROM sources WHERE jurisdiction = 'FL' AND tier = 'critical';
