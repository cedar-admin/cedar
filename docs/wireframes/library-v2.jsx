/**
 * ═══════════════════════════════════════════════════════════════════
 * CEDAR REGULATORY LIBRARY — WIREFRAME v2
 * ═══════════════════════════════════════════════════════════════════
 *
 * PURPOSE: Visual reference for the regulatory library browse experience.
 * This is a WIREFRAME, not production code. All data is hardcoded to
 * demonstrate layout, navigation, and information density decisions. 
 * Do not use any design decisions included in this file, follow Cedar's
 * own design system referenced in Claude.md
 *
 * ─── ARCHITECTURE CONTEXT ──────────────────────────────────────────
 *
 * DATA MODEL (Supabase PostgreSQL):
 *   - kg_entities          → individual regulations, rules, orders, guidance docs
 *   - kg_domains           → hierarchical taxonomy (self-ref via parent_domain_id, arbitrary depth)
 *   - kg_entity_domains    → many-to-many classification with relevance_score + classified_by
 *   - kg_practice_types    → NUCC-based practice type codes
 *   - kg_entity_practice_relevance → which entities matter to which practice types
 *   - kg_relationships     → typed, temporal links between entities (amends, cites, supersedes, etc.)
 *   - kg_entity_versions   → point-in-time snapshots with content_hash for change detection
 *   - kg_service_lines     → clinical workflows (e.g. "Testosterone Pellet Therapy")
 *   - kg_classification_log → audit trail for all classification decisions
 *   - practice_profiles    → user's practice config (type, services, staff, equipment)
 *   - practice_service_lines, practice_staff, practice_equipment → practice profile details
 *
 * CLASSIFICATION ENGINE:
 *   - Inngest functions running rule-based (stage 1), keyword/citation (stage 2),
 *     and Claude API (stage 3) classification passes
 *   - Writes to kg_entity_domains + kg_classification_log
 *   - Items below confidence threshold flagged as needs_review for future HITL
 *
 * ROLE-BASED VIEWS (future):
 *   - Provider (Monitor tier): filtered dashboard based on practice_profile
 *   - Provider (Intelligence tier): + AI summaries, service-line impact tagging
 *   - Attorney: HITL review interface (branch of this library browse experience)
 *   - Admin (Anthony): full platform control panel + all provider views
 *
 * HITL REVIEW (deferred):
 *   - Architecture hooks exist (kg_classification_log.classified_by,
 *     review_rules table, pending_review state)
 *   - Attorney portal will be a separate view branching from this library
 *   - Not built yet — just ensure schema supports it
 *
 * NAVIGATION:
 *   - Currently 3 levels: Grid → Category → Regulation
 *   - kg_domains supports arbitrary depth via parent_domain_id
 *   - Breadcrumbs and drill-down can extend to 4-5 levels without schema changes
 *
 * RAG (deferred):
 *   - "Ask Cedar" endpoint activates at 1.0 Full after sufficient change history
 *   - Classification engine is a prerequisite — entities must be classified,
 *     tagged, and relationship-linked before RAG can answer questions well
 *   - Sidebar shows "Ask Cedar" grayed out as a placeholder
 *
 * INGESTION PIPELINE:
 *   - Sources arrive via: gov APIs (eCFR, FR, openFDA), Oxylabs scraping (Tiers 1-2),
 *     Browserbase+Stagehand (Tier 3 interactive), direct HTTP (Tier 0)
 *   - All sources normalize into kg_entities before classification runs
 *   - Source abstraction layer handles the diversity; taxonomy/classification is source-agnostic
 *
 * ═══════════════════════════════════════════════════════════════════
 */

import { useState } from "react";

// ─── Shared Components ─────────────────────────────────────────────

const SeverityBadge = ({ level, size = "sm" }) => {
  const config = {
    critical: { color: "#DC2626", bg: "#FEE2E2", label: "CRITICAL" },
    high:     { color: "#EA580C", bg: "#FFF7ED", label: "HIGH" },
    medium:   { color: "#CA8A04", bg: "#FEFCE8", label: "MEDIUM" },
    low:      { color: "#2563EB", bg: "#EFF6FF", label: "LOW" },
    info:     { color: "#6B7280", bg: "#F3F4F6", label: "INFO" },
  };
  const c = config[level] || config.info;
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5"
      style={{ backgroundColor: c.bg }}>
      <span className={`font-semibold tracking-wide ${size === "sm" ? "text-[10px]" : "text-xs"}`}
        style={{ color: c.color }}>{c.label}</span>
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const config = {
    active:             { color: "#16A34A", bg: "#DCFCE7", label: "Active" },
    "pending-effective":{ color: "#2563EB", bg: "#DBEAFE", label: "Pending Effective" },
    "comment-period":   { color: "#0891B2", bg: "#ECFEFF", label: "Comment Period" },
    enjoined:           { color: "#DC2626", bg: "#FEE2E2", label: "Enjoined" },
    "under-review":     { color: "#7C3AED", bg: "#F3E8FF", label: "Under Review" },
  };
  const c = config[status] || config.active;
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
      style={{ backgroundColor: c.bg, color: c.color }}>
      {c.label}
    </span>
  );
};

/** Maps to kg_service_lines / kg_practice_types — practice-type relevance tags */
const ServiceLineTag = ({ label }) => {
  const colors = {
    "Hormone Therapy":     { bg: "#FDF4FF", color: "#A21CAF", border: "#F0ABFC" },
    "Compounding":         { bg: "#FFF7ED", color: "#C2410C", border: "#FDBA74" },
    "Functional Medicine": { bg: "#ECFDF5", color: "#047857", border: "#6EE7B7" },
    "Weight Management":   { bg: "#FEFCE8", color: "#A16207", border: "#FDE047" },
    "Peptide Therapy":     { bg: "#FEF2F2", color: "#B91C1C", border: "#FCA5A5" },
  };
  const c = colors[label] || { bg: "#F3F4F6", color: "#4B5563", border: "#D1D5DB" };
  return (
    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium"
      style={{ backgroundColor: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
      {label}
    </span>
  );
};

const DeadlineChip = ({ days }) => {
  if (days == null) return null;
  const color = days < 7 ? "#DC2626" : days < 30 ? "#D97706" : "#16A34A";
  const bg    = days < 7 ? "#FEE2E2" : days < 30 ? "#FEF3C7" : "#DCFCE7";
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
      style={{ color, backgroundColor: bg }}>
      {days}d
    </span>
  );
};

/**
 * Classification confidence indicator.
 * In production: sourced from kg_entity_domains.relevance_score + kg_classification_log.stage
 * Shows whether classification was rule-based (high confidence) or needs review.
 */
const ConfidenceBadge = ({ score, stage }) => {
  if (score == null) return null;
  const isHigh = score >= 0.85;
  return (
    <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium ${
      isHigh ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
    }`}>
      {isHigh ? "✓" : "?"} {stage === "rule" ? "Rule" : stage === "ml" ? "AI" : "Manual"}
      {!isHigh && " · Needs Review"}
    </span>
  );
};

// ─── EXAMPLE DATA ──────────────────────────────────────────────────
// Minimal set — just enough to demonstrate layout patterns.
// In production: all of this comes from Supabase queries against the schema above.

/**
 * Maps to: kg_practice_types (NUCC codes) + kg_service_lines
 * In production: populated from NUCC taxonomy seed + practice_profiles config
 */
const serviceLines = [
  "Compounding", "Hormone Therapy", "Weight Management",
  "Peptide Therapy", "Functional Medicine",
];

/**
 * Maps to: kg_domains at depth 1-2
 * In production: SELECT * FROM kg_domains WHERE depth <= 2 ORDER BY name
 * The regulationCount comes from COUNT on kg_entity_domains joined to this domain + children
 * recentChanges = entities changed in last 14 days
 * highestSeverity = MAX severity of recent changes
 */
const categories = [
  {
    id: "compounding", name: "Compounding & Pharmacy",
    icon: "ri-flask-line",
    description: "FDA compounding guidance (503A/503B), FL Board of Pharmacy rules, USP chapters, outsourcing facilities",
    regulationCount: 31, recentChanges: 5, highestSeverity: "critical",
    serviceLines: ["Compounding", "Hormone Therapy", "Peptide Therapy", "Weight Management"],
  },
  {
    id: "prescribing", name: "Prescribing & Controlled Substances",
    icon: "ri-capsule-line",
    description: "DEA scheduling, PDMP requirements, prescribing limits, telehealth prescribing (Ryan Haight Act)",
    regulationCount: 19, recentChanges: 3, highestSeverity: "high",
    serviceLines: ["Hormone Therapy", "Weight Management", "Peptide Therapy"],
  },
  {
    id: "federal", name: "Federal Agency Actions",
    icon: "ri-flag-line",
    description: "FDA rules/guidance, DEA regulatory actions, FTC enforcement, HHS/CMS changes",
    regulationCount: 28, recentChanges: 4, highestSeverity: "critical",
    serviceLines: ["Compounding", "Hormone Therapy", "Weight Management", "Peptide Therapy"],
  },
  {
    id: "litigation", name: "Active Litigation",
    icon: "ri-scales-3-line",
    description: "Named federal cases, court orders, injunctions/stays affecting compounding and prescribing",
    regulationCount: 8, recentChanges: 2, highestSeverity: "high",
    serviceLines: ["Compounding", "Peptide Therapy", "Weight Management"],
  },
];

/**
 * Maps to: kg_entities joined with kg_entity_domains, kg_entity_practice_relevance
 * Each regulation is a kg_entity. Its category comes from kg_entity_domains (primary domain).
 * severity/status are entity metadata fields.
 * serviceLines come from kg_entity_practice_relevance joined to kg_practice_types.
 * confidence/classifiedBy come from kg_classification_log.
 *
 * sourceType maps to the ingestion tier:
 *   "Federal Agency" → typically Tier 0 (gov API) or Tier 1 (Oxylabs static scrape)
 *   "State Board"    → typically Tier 2 (Oxylabs dynamic) or Tier 3 (Browserbase)
 *   "Litigation"     → typically Tier 1-2 (court docket scraping)
 */
const regulations = [
  {
    id: "reg-1",
    title: "FDA Final Rule: Updated cGMP Requirements for 503B Outsourcing Facilities",
    source: "FDA", sourceType: "Federal Agency", documentType: "Final Rule",
    status: "pending-effective", severity: "critical",
    effectiveDate: "Apr 15, 2026", daysUntilEffective: 27,
    lastChanged: "Mar 8, 2026",
    serviceLines: ["Compounding", "Hormone Therapy", "Peptide Therapy"],
    confidence: 0.97, classifiedBy: "rule",
    summary: "Comprehensive update to cGMP requirements for 503B outsourcing facilities. New quality testing, environmental monitoring, and documentation requirements.",
    changeCount: 3,
    sourceUrl: "#",
    // In production: readerContent fetched from kg_entity_versions.content_snapshot
    readerContent: `Current Good Manufacturing Practice—Outsourcing Facilities\n\nFINAL RULE — Federal Register / Vol. 91, No. 45 / March 8, 2026\n\nAGENCY: Food and Drug Administration, HHS.\n\nACTION: Final rule.\n\nSUMMARY: The FDA is amending its regulations to update cGMP requirements applicable to outsourcing facilities that compound human drug products under section 503B of the FD&C Act. This final rule establishes updated requirements for quality testing, environmental monitoring, personnel qualifications, and documentation.\n\nDATES: This rule is effective April 15, 2026.\n\n[Truncated for wireframe — full document would be rendered from kg_entity_versions.content_snapshot]`,
  },
  {
    id: "reg-2",
    title: "OFA v. FDA — GLP-1 Compounding Exemption Litigation",
    source: "U.S. District Court, W.D. Texas", sourceType: "Litigation", documentType: "Court Order",
    status: "active", severity: "critical",
    effectiveDate: null, daysUntilEffective: null,
    lastChanged: "Mar 3, 2026",
    serviceLines: ["Compounding", "Weight Management"],
    confidence: 0.92, classifiedBy: "ml",
    summary: "OFA challenges FDA's determination that semaglutide and tirzepatide are no longer on the drug shortage list.",
    changeCount: 7,
    sourceUrl: "#",
    readerContent: `Outsourcing Facilities Association v. Food and Drug Administration\n\nCase No. 1:25-cv-01234 (W.D. Tex.)\n\nORDER ON MOTION FOR PRELIMINARY INJUNCTION\n\n[Truncated for wireframe]`,
  },
  {
    id: "reg-3",
    title: "FL Board of Pharmacy: Revised USP <797> Compliance Timeline",
    source: "FL Board of Pharmacy", sourceType: "State Board", documentType: "Board Decision",
    status: "active", severity: "medium",
    effectiveDate: "Jul 1, 2026", daysUntilEffective: 104,
    lastChanged: "Mar 13, 2026",
    serviceLines: ["Compounding"],
    confidence: 0.72, classifiedBy: "ml", // lower confidence — would be flagged for future HITL review
    summary: "Florida Board of Pharmacy extends compliance deadline for updated USP <797> sterile compounding standards to July 1.",
    changeCount: 4,
    sourceUrl: "#",
    readerContent: `Florida Board of Pharmacy\nOrder No. BOP-2026-0312\n\nRE: Revised Compliance Timeline for USP <797>\n\n[Truncated for wireframe]`,
  },
];

/**
 * Maps to: kg_entity_versions + kg_classification_log for a specific entity
 * In production: SELECT * FROM kg_entity_versions WHERE entity_id = ? ORDER BY version_date DESC
 * joined with classification_log entries for the same entity
 */
const exampleTimeline = [
  { date: "Mar 8, 2026", type: "change", title: "Final Rule Published", severity: "critical",
    description: "FDA publishes final rule with April 15 effective date." },
  { date: "Jan 6, 2026", type: "review", title: "Cedar Severity Reclassification",
    description: "Classification engine reclassified severity from HIGH to CRITICAL based on effective date proximity." },
  { date: "Sep 15, 2025", type: "change", title: "Proposed Rule Published", severity: "medium",
    description: "FDA publishes proposed rule for updated outsourcing facility cGMP requirements." },
  { date: "Jul 2, 2025", type: "detection", title: "Initial Detection", severity: "info",
    description: "Cedar detected advance notice of proposed rulemaking in FDA Unified Agenda." },
];


// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

export default function CedarLibrary() {
  const [view, setView] = useState("grid"); // "grid" | "category" | "regulation"
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedRegulation, setSelectedRegulation] = useState(null);
  const [activeRegTab, setActiveRegTab] = useState("overview");
  const [activeServiceLines, setActiveServiceLines] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("severity");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [readerFullscreen, setReaderFullscreen] = useState(false);

  const toggleServiceLine = (sl) =>
    setActiveServiceLines((prev) =>
      prev.includes(sl) ? prev.filter((s) => s !== sl) : [...prev, sl]
    );

  const navigateToCategory = (cat) => {
    setSelectedCategory(cat);
    setSelectedRegulation(null);
    setView("category");
  };
  const navigateToRegulation = (reg) => {
    setSelectedRegulation(reg);
    setActiveRegTab("overview");
    setView("regulation");
  };
  const navigateBack = () => {
    if (view === "regulation") { setView("category"); setSelectedRegulation(null); }
    else if (view === "category") { setView("grid"); setSelectedCategory(null); }
  };

  // Service line filtering — maps to practice_profiles → kg_entity_practice_relevance query
  const filteredCategories = activeServiceLines.length === 0
    ? categories
    : categories.filter((cat) => cat.serviceLines.some((sl) => activeServiceLines.includes(sl)));

  // Regulation filtering + sorting
  let filteredRegs = [...regulations];
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filteredRegs = filteredRegs.filter((r) =>
      r.title.toLowerCase().includes(q) || r.summary.toLowerCase().includes(q)
    );
  }
  if (sortBy === "severity") {
    const order = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
    filteredRegs.sort((a, b) => (order[a.severity] ?? 5) - (order[b.severity] ?? 5));
  } else if (sortBy === "recent") {
    filteredRegs.sort((a, b) => new Date(b.lastChanged) - new Date(a.lastChanged));
  } else if (sortBy === "effective") {
    filteredRegs.sort((a, b) => (a.daysUntilEffective ?? 999) - (b.daysUntilEffective ?? 999));
  }

  // ─── Reader Fullscreen Overlay ───────────────────────────────────
  if (readerFullscreen && selectedRegulation) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col"
        style={{ fontFamily: "'Source Sans 3', system-ui, sans-serif" }}>
        <link href="https://cdn.jsdelivr.net/npm/remixicon@4.1.0/fonts/remixicon.css" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@300;400;500;600;700&family=Source+Serif+4:opsz,wght@8..60,400;8..60,500;8..60,600&display=swap" rel="stylesheet"/>
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-3 bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setReaderFullscreen(false)} className="text-slate-500 hover:text-slate-700">
              <i className="ri-close-line text-xl"/>
            </button>
            <div>
              <p className="text-sm font-semibold text-slate-900">{selectedRegulation.title}</p>
              <p className="text-xs text-slate-400">{selectedRegulation.source} · {selectedRegulation.documentType}</p>
            </div>
          </div>
          <a href={selectedRegulation.sourceUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg px-3 py-1.5 transition-colors">
            <i className="ri-external-link-line"/>View Live Source
          </a>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-6 py-10">
            <pre className="whitespace-pre-wrap text-[15px] leading-[1.8] text-slate-800"
              style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
              {selectedRegulation.readerContent}
            </pre>
          </div>
        </div>
        <div className="border-t border-slate-100 px-6 py-2 bg-slate-50 shrink-0">
          <p className="text-[10px] text-slate-400">
            Source content retrieved by Cedar on {selectedRegulation.lastChanged}. Always verify against the live source.
          </p>
        </div>
      </div>
    );
  }

  // ─── Main Layout ─────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-slate-50"
      style={{ fontFamily: "'Source Sans 3', system-ui, sans-serif" }}>
      <link href="https://cdn.jsdelivr.net/npm/remixicon@4.1.0/fonts/remixicon.css" rel="stylesheet"/>
      <link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@300;400;500;600;700&family=Source+Serif+4:opsz,wght@8..60,400;8..60,500;8..60,600&display=swap" rel="stylesheet"/>

      {/* ═══ SIDEBAR ═══ */}
      <aside className={`hidden md:flex flex-col border-r border-slate-200 bg-white transition-all duration-200 ${
        sidebarCollapsed ? "w-16" : "w-56"
      }`}>
        {/* Logo */}
        <div className={`flex items-center border-b border-slate-100 h-14 ${
          sidebarCollapsed ? "justify-center px-2" : "px-4"
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            {!sidebarCollapsed && (
              <>
                <span className="text-lg font-semibold text-slate-900 tracking-tight">Cedar</span>
                <span className="text-[10px] font-medium bg-emerald-100 text-emerald-700 rounded px-1.5 py-0.5">BETA</span>
              </>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto">
          <div className="px-2">
            {[
              { icon: "ri-home-5-line", label: "Home" },
              { icon: "ri-notification-3-line", label: "What's New", badge: 7 },
              { icon: "ri-calendar-line", label: "Calendar" },
            ].map((item, i) => (
              <button key={i} className={`w-full flex items-center gap-3 rounded-lg py-2 mb-0.5 text-slate-600 hover:bg-slate-50 ${
                sidebarCollapsed ? "justify-center px-2" : "px-3"
              }`}>
                <i className={`${item.icon} text-lg`}/>
                {!sidebarCollapsed && (
                  <>
                    <span className="text-sm font-medium flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <span className="bg-emerald-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            ))}
          </div>

          {/* Intelligence section */}
          <div className="mt-2 pt-2 border-t border-slate-100 px-2">
            {!sidebarCollapsed && (
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-1">Intelligence</p>
            )}
            {/* Library — active */}
            <button className={`w-full flex items-center gap-3 rounded-lg py-2 mb-0.5 bg-emerald-50 text-emerald-800 ${
              sidebarCollapsed ? "justify-center px-2" : "px-3"
            }`}>
              <i className="ri-book-2-fill text-lg"/>
              {!sidebarCollapsed && <span className="text-sm font-medium">Library</span>}
            </button>
            {/* Ask Cedar — deferred, grayed out */}
            <button className={`w-full flex items-center gap-3 rounded-lg py-2 mb-0.5 text-slate-300 cursor-default ${
              sidebarCollapsed ? "justify-center px-2" : "px-3"
            }`} title="Coming in 1.0 — requires RAG activation">
              <i className="ri-robot-2-line text-lg"/>
              {!sidebarCollapsed && (
                <span className="text-sm font-medium flex-1 text-left flex items-center gap-2">
                  Ask Cedar
                  <span className="text-[9px] bg-slate-100 text-slate-400 rounded px-1 py-0.5">SOON</span>
                </span>
              )}
            </button>
          </div>

          {/* Config section */}
          <div className="mt-2 pt-2 border-t border-slate-100 px-2">
            {!sidebarCollapsed && (
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-1">Configure</p>
            )}
            {[
              { icon: "ri-radar-line", label: "Sources" },
              /**
               * Practice Settings — where the user configures:
               * practice type (NUCC code), service lines, staff roster + credentials,
               * equipment/modalities, state(s), DEA registration, 503A vs 503B, payer mix
               * This drives personalized filtering across the entire platform.
               * Maps to: practice_profiles + practice_service_lines + practice_staff + practice_equipment
               */
              { icon: "ri-stethoscope-line", label: "My Practice" },
              { icon: "ri-settings-3-line", label: "Settings" },
            ].map((item, i) => (
              <button key={i} className={`w-full flex items-center gap-3 rounded-lg py-2 mb-0.5 text-slate-600 hover:bg-slate-50 ${
                sidebarCollapsed ? "justify-center px-2" : "px-3"
              }`}>
                <i className={`${item.icon} text-lg`}/>
                {!sidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            ))}
          </div>
        </nav>

        {/* Collapse toggle */}
        <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="border-t border-slate-100 p-3 text-slate-400 hover:text-slate-600">
          <i className={`${sidebarCollapsed ? "ri-arrow-right-s-line" : "ri-arrow-left-s-line"} text-lg`}/>
        </button>
      </aside>

      {/* ═══ MAIN CONTENT ═══ */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <header className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-4 md:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <div className="md:hidden flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-emerald-700 flex items-center justify-center">
                <span className="text-white font-bold text-xs">C</span>
              </div>
              <span className="font-semibold text-slate-900">Cedar</span>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-1.5 w-72">
              <i className="ri-search-line text-slate-400"/>
              <input type="text" placeholder="Search regulations..."
                className="bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none flex-1"/>
              <span className="text-[10px] text-slate-400 border border-slate-300 rounded px-1">⌘K</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2 text-slate-500 hover:text-slate-700">
              <i className="ri-notification-3-line text-xl"/>
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">3</span>
            </button>
            {/* User avatar — role indicator. In production: role from WorkOS + practice_profiles */}
            <div className="flex items-center gap-1.5 ml-1">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold text-sm cursor-pointer">
                A
              </div>
              {/* Admin badge — visible only for admin role */}
              <span className="text-[9px] font-medium bg-slate-800 text-white rounded px-1 py-0.5">ADMIN</span>
            </div>
          </div>
        </header>

        {/* Main scroll area */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-4 md:px-6 py-6">

            {/* ═══ VIEW 1: CATEGORY GRID ═══ */}
            {/* In production: categories fetched from kg_domains WHERE depth <= 2 */}
            {view === "grid" && (
              <>
                <div className="mb-5">
                  <h1 className="text-2xl font-bold text-slate-900">Regulatory Library</h1>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {categories.reduce((a, c) => a + c.regulationCount, 0)} regulations across {categories.length} categories
                  </p>
                </div>

                {/* Service Line Filter — maps to kg_practice_types via practice_profiles */}
                <div className="mb-5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider mr-1">Filter:</span>
                    {serviceLines.map((sl) => (
                      <button key={sl} onClick={() => toggleServiceLine(sl)}
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-all whitespace-nowrap ${
                          activeServiceLines.includes(sl)
                            ? "bg-emerald-700 text-white shadow-sm"
                            : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}>
                        {sl}
                      </button>
                    ))}
                    {activeServiceLines.length > 0 && (
                      <button onClick={() => setActiveServiceLines([])}
                        className="text-xs text-slate-400 hover:text-slate-600 ml-1">Clear</button>
                    )}
                  </div>
                </div>

                {/* Category Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredCategories.sort((a, b) => b.recentChanges - a.recentChanges).map((cat) => (
                    <button key={cat.id} onClick={() => navigateToCategory(cat)}
                      className="text-left rounded-xl border border-slate-200 bg-white px-4 py-3.5 hover:border-emerald-300 hover:shadow-sm transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-emerald-50 group-hover:text-emerald-700 transition-colors shrink-0">
                          <i className={`${cat.icon} text-lg`}/>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-slate-900 group-hover:text-emerald-800 truncate">
                            {cat.name}
                          </h3>
                          <div className="flex items-center gap-2.5 mt-0.5">
                            <span className="text-xs text-slate-400">{cat.regulationCount} regulations</span>
                            {cat.recentChanges > 0 && (
                              <span className="text-xs text-amber-600 font-medium">
                                {cat.recentChanges} new
                              </span>
                            )}
                          </div>
                        </div>
                        {cat.recentChanges > 0 && <SeverityBadge level={cat.highestSeverity}/>}
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* ═══ VIEW 2: CATEGORY DETAIL ═══ */}
            {/* In production: regulations fetched from kg_entities JOIN kg_entity_domains WHERE domain_id = ? */}
            {view === "category" && selectedCategory && (
              <>
                {/* Breadcrumb — extends to deeper levels via kg_domains ancestry */}
                <div className="flex items-center gap-2 text-sm mb-4">
                  <button onClick={() => { setView("grid"); setSelectedCategory(null); }}
                    className="text-emerald-700 hover:text-emerald-800 font-medium">Library</button>
                  <i className="ri-arrow-right-s-line text-slate-400"/>
                  <span className="text-slate-700 font-medium">{selectedCategory.name}</span>
                </div>

                <div className="flex items-start gap-4 mb-5">
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700 shrink-0">
                    <i className={`${selectedCategory.icon} text-xl`}/>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-slate-900">{selectedCategory.name}</h1>
                    <p className="text-sm text-slate-500 mt-0.5">{selectedCategory.description}</p>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3 mb-4 bg-white rounded-xl border border-slate-200 px-4 py-3">
                  <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-1.5 flex-1 min-w-[180px] max-w-xs">
                    <i className="ri-search-line text-slate-400 text-sm"/>
                    <input type="text" placeholder="Search..." value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none flex-1"/>
                  </div>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                    className="text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 bg-white">
                    <option value="severity">Sort: Severity</option>
                    <option value="recent">Sort: Most Recent</option>
                    <option value="effective">Sort: Effective Date</option>
                  </select>
                </div>

                {/* Regulation List */}
                <div className="space-y-2">
                  {filteredRegs.map((reg) => (
                    <button key={reg.id} onClick={() => navigateToRegulation(reg)}
                      className="w-full text-left rounded-xl border border-slate-200 bg-white p-4 hover:border-emerald-300 hover:shadow-sm transition-all group">
                      <div className="flex items-start gap-3">
                        <div className="pt-0.5 shrink-0"><SeverityBadge level={reg.severity}/></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="text-sm font-semibold text-slate-900 group-hover:text-emerald-800 leading-snug">
                                {reg.title}
                              </h3>
                              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                <span className="text-xs text-slate-500">{reg.source}</span>
                                <span className="text-slate-300">·</span>
                                <span className="text-xs text-slate-400">{reg.documentType}</span>
                                <StatusBadge status={reg.status}/>
                                <ConfidenceBadge score={reg.confidence} stage={reg.classifiedBy}/>
                              </div>
                            </div>
                            {reg.effectiveDate && (
                              <div className="shrink-0 flex items-center gap-1.5">
                                <span className="text-xs text-slate-400">{reg.effectiveDate}</span>
                                <DeadlineChip days={reg.daysUntilEffective}/>
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">{reg.summary}</p>
                          <div className="flex items-center gap-3 mt-2.5">
                            <span className="text-[11px] text-slate-400">{reg.changeCount} changes · Last: {reg.lastChanged}</span>
                            <div className="flex gap-1 ml-auto">
                              {reg.serviceLines.map((sl, i) => <ServiceLineTag key={i} label={sl}/>)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* ═══ VIEW 3: REGULATION DETAIL ═══ */}
            {view === "regulation" && selectedRegulation && (
              <>
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm mb-4 flex-wrap">
                  <button onClick={() => { setView("grid"); setSelectedCategory(null); setSelectedRegulation(null); }}
                    className="text-emerald-700 hover:text-emerald-800 font-medium">Library</button>
                  <i className="ri-arrow-right-s-line text-slate-400"/>
                  <button onClick={navigateBack}
                    className="text-emerald-700 hover:text-emerald-800 font-medium">{selectedCategory.name}</button>
                  <i className="ri-arrow-right-s-line text-slate-400"/>
                  <span className="text-slate-700 font-medium truncate max-w-xs">
                    {selectedRegulation.title.length > 50
                      ? selectedRegulation.title.slice(0, 50) + "…"
                      : selectedRegulation.title}
                  </span>
                </div>

                {/* Header Card — always visible regardless of tab */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 mb-4">
                  <div className="flex items-start gap-3">
                    <SeverityBadge level={selectedRegulation.severity} size="lg"/>
                    <div className="flex-1 min-w-0">
                      <h1 className="text-lg font-bold text-slate-900 leading-snug">{selectedRegulation.title}</h1>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className="text-sm text-slate-500">{selectedRegulation.source}</span>
                        <span className="text-slate-300">·</span>
                        <span className="text-sm text-slate-400">{selectedRegulation.documentType}</span>
                        <StatusBadge status={selectedRegulation.status}/>
                        <ConfidenceBadge score={selectedRegulation.confidence} stage={selectedRegulation.classifiedBy}/>
                      </div>
                      {selectedRegulation.effectiveDate && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-sm text-slate-600">Effective: {selectedRegulation.effectiveDate}</span>
                          <DeadlineChip days={selectedRegulation.daysUntilEffective}/>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 flex-wrap gap-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs text-slate-400 mr-1">Affects:</span>
                      {selectedRegulation.serviceLines.map((sl, i) => <ServiceLineTag key={i} label={sl}/>)}
                    </div>
                    <a href={selectedRegulation.sourceUrl} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg px-4 py-2 transition-colors">
                      <i className="ri-external-link-line"/>View Live Source
                    </a>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mb-4 border-b border-slate-200">
                  {[
                    { id: "overview", label: "Overview", icon: "ri-file-text-line" },
                    { id: "reader", label: "Reader", icon: "ri-book-open-line" },
                    { id: "timeline", label: "Timeline", icon: "ri-timeline-view" },
                    { id: "related", label: "Related", icon: "ri-links-line" },
                  ].map((tab) => (
                    <button key={tab.id} onClick={() => setActiveRegTab(tab.id)}
                      className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                        activeRegTab === tab.id
                          ? "border-emerald-600 text-emerald-800"
                          : "border-transparent text-slate-500 hover:text-slate-700"
                      }`}>
                      <i className={tab.icon} style={{ fontSize: 14 }}/>{tab.label}
                    </button>
                  ))}
                </div>

                {/* ── Tab: Overview ── */}
                {activeRegTab === "overview" && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2 space-y-4">
                      <div className="rounded-xl border border-slate-200 bg-white p-5">
                        <h3 className="text-sm font-semibold text-slate-900 mb-2">Summary</h3>
                        <p className="text-sm text-slate-700 leading-relaxed">{selectedRegulation.summary}</p>
                        <div className="bg-slate-50 rounded-lg px-3 py-2 mt-3">
                          <p className="text-[10px] text-slate-400">
                            AI-generated summary — not reviewed by a licensed attorney. This is not legal advice.
                          </p>
                        </div>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white p-5">
                        <h3 className="text-sm font-semibold text-slate-900 mb-3">Key Details</h3>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { label: "Source", value: selectedRegulation.source },
                            { label: "Document Type", value: selectedRegulation.documentType },
                            { label: "Category", value: selectedCategory.name },
                            { label: "Last Changed", value: selectedRegulation.lastChanged },
                          ].map((d, i) => (
                            <div key={i} className="rounded-lg bg-slate-50 px-3 py-2.5">
                              <p className="text-[11px] text-slate-400 mb-0.5">{d.label}</p>
                              <p className="text-sm font-medium text-slate-800">{d.value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="rounded-xl border border-slate-200 bg-white p-4">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Actions</h3>
                        <div className="space-y-2">
                          <button className="w-full flex items-center gap-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-2 text-sm font-medium transition-colors">
                            <i className="ri-notification-3-line"/>Latest Change
                          </button>
                          <button className="w-full flex items-center gap-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 px-3 py-2 text-sm font-medium transition-colors">
                            <i className="ri-share-line"/>Share Summary
                          </button>
                        </div>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white p-4">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Audit Trail</h3>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-500">First Detected</span>
                            <span className="text-slate-700 font-medium">Jul 2, 2025</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Last Updated</span>
                            <span className="text-slate-700 font-medium">{selectedRegulation.lastChanged}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Classification</span>
                            <ConfidenceBadge score={selectedRegulation.confidence} stage={selectedRegulation.classifiedBy}/>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Chain Integrity</span>
                            <span className="text-emerald-600 font-medium">✓ Verified</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Tab: Reader ── */}
                {activeRegTab === "reader" && (
                  <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50">
                      <span className="text-sm font-medium text-slate-700">Source Document</span>
                      <button onClick={() => setReaderFullscreen(true)}
                        className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-lg px-3 py-1.5">
                        <i className="ri-fullscreen-line"/>Full Screen
                      </button>
                    </div>
                    <div className="px-8 py-8 max-h-[400px] overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-[14px] leading-[1.75] text-slate-800"
                        style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                        {selectedRegulation.readerContent}
                      </pre>
                    </div>
                    <div className="border-t border-slate-100 px-5 py-2 bg-slate-50">
                      <p className="text-[10px] text-slate-400">
                        Retrieved by Cedar on {selectedRegulation.lastChanged}. Always verify against the live source.
                      </p>
                    </div>
                  </div>
                )}

                {/* ── Tab: Timeline ── */}
                {/* In production: kg_entity_versions + kg_classification_log for this entity */}
                {activeRegTab === "timeline" && (
                  <div className="rounded-xl border border-slate-200 bg-white p-5">
                    <div className="relative">
                      <div className="absolute left-[15px] top-3 bottom-3 w-px bg-slate-200"/>
                      {exampleTimeline.map((event, i) => (
                        <div key={i} className="relative flex items-start gap-4 py-3">
                          <div className={`relative z-10 w-[31px] h-[31px] rounded-full flex items-center justify-center shrink-0 ${
                            event.type === "change" ? "bg-blue-100" :
                            event.type === "review" ? "bg-emerald-100" : "bg-slate-100"
                          }`}>
                            <i className={`${
                              event.type === "change" ? "ri-notification-3-line text-blue-600" :
                              event.type === "review" ? "ri-shield-check-line text-emerald-600" :
                              "ri-radar-line text-slate-500"
                            }`} style={{ fontSize: 14 }}/>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-semibold text-slate-900">{event.title}</span>
                              {event.severity && <SeverityBadge level={event.severity}/>}
                            </div>
                            <p className="text-xs text-slate-500 mt-1">{event.description}</p>
                            <span className="text-[11px] text-slate-400 mt-1 block">{event.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Tab: Related ── */}
                {/* In production: kg_relationships WHERE source_entity_id = ? OR target_entity_id = ? */}
                {activeRegTab === "related" && (
                  <div className="rounded-xl border border-slate-200 bg-white p-5">
                    <h3 className="text-sm font-semibold text-slate-900 mb-3">Related Regulations</h3>
                    <p className="text-xs text-slate-400 mb-3">
                      Connections from kg_relationships — amends, cites, supersedes, implements, etc.
                    </p>
                    <div className="space-y-2">
                      {regulations.filter((r) => r.id !== selectedRegulation.id).map((reg) => (
                        <button key={reg.id} onClick={() => navigateToRegulation(reg)}
                          className="w-full text-left flex items-center gap-3 rounded-lg hover:bg-slate-50 px-3 py-2.5 transition-colors">
                          <SeverityBadge level={reg.severity}/>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate">{reg.title}</p>
                            <span className="text-xs text-slate-400">{reg.source} · {reg.lastChanged}</span>
                          </div>
                          <StatusBadge status={reg.status}/>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
