# Cedar Classification Framework — Part 1, Session 5-B of 8
# Deep Taxonomy: Controlled Substances Branch (L3 through L6)

## About This Session

**Context from prior research sessions has been pre-injected above this prompt by the orchestrator.**
The injected context contains:
- **Session 4 output** — L1/L2 domain taxonomy codes for all domains, including Controlled Substances
- **Session 5-A output** — Compounding branch taxonomy (L3-L6), including all cross-classification triggers defined there

Read both injected outputs directly. The cross-classification triggers in Session 5-A that reference
the Controlled Substances branch must be made consistent here — define Controlled Substances triggers
that mirror the 5-A triggers exactly.

This is a **sub-session** (5-B of 8). Session 5 was split because Compounding + Controlled Substances
together exceeded output quality thresholds. **This session covers Controlled Substances only.**

---

## Cedar Platform Context

Cedar is an AI-powered regulatory monitoring platform for independent medical practices.

**Target practice types** (14 total):
Functional Medicine, Hormone Optimization/HRT, Compounding Pharmacy, Med Spa/Aesthetic Medicine,
Weight Management, Peptide Therapy, IV Therapy/Infusion, Regenerative Medicine, Telehealth,
Chiropractic, Integrative Medicine, Anti-Aging Medicine, Pain Management, Primary Care (DPC/Concierge).

**Platform purpose:** Cedar monitors federal and state regulatory sources, detects changes within hours,
classifies them through an AI pipeline, and delivers plain-language alerts. The taxonomy determines what
domain(s) each regulatory entity belongs to, which practices it's relevant for, and how it gets routed.

**Why Controlled Substances matters for Cedar's target market:** Cedar's practices (functional medicine,
hormone optimization, weight management, pain management, integrative medicine, peptide therapy) prescribe
DEA-scheduled substances routinely — testosterone (Schedule III), ketamine (Schedule III), buprenorphine
(Schedule III), stimulants (Schedule II), GHB (Schedule I/III), etc. DEA regulatory changes, PDMP mandates,
EPCS requirements, and prescribing rule updates are among the highest-priority alerts for these practices.

---

## Metadata Requirements

For **every node at every level (L3, L4, L5, L6)**, provide all of the following:

1. **Domain name** — practitioner-facing label
2. **Domain code** — dot-notation extending the L2 code from Session 4
3. **Description** — 1-2 sentences: what regulatory content belongs here and why it matters
4. **Classification signals**:
   - **CFR part/section ranges** — as specific as possible
   - **Agency/sub-agency names** — exact Federal Register agency names
   - **Keyword phrases** — 5-15 per node, marked Strong / Moderate / Weak. Disambiguation notes for homonyms.
   - **Statutory references** — specific CSA sections (21 U.S.C. §§ 801-971) or other federal statutes
5. **Cross-classification triggers** — specific, implementable rules:
   > "If an entity classified in `[this domain code]` contains any of: [term list], also classify in `[target domain code]`"
6. **Practice-type relevance** — compact table (High / Medium / Low; omit None rows):

| Practice Type | Relevance |
|---|---|
| Pain Management | High |
| [etc.] | [weight] |

---

## Deliverable: Controlled Substances Branch (L3 through L6)

Develop the **full Controlled Substances taxonomy** for Cedar. Use the L1/L2 codes from Session 4.
Target: **40–60 total nodes** across all levels.

Organize the tree as the regulatory structure demands. The areas below are required content.

### Required coverage areas:

**DEA Registration**
- Practitioner registration: individual DEA numbers by provider type (MD, DO, DDS, DVM, etc.)
- Mid-level practitioner (MLP) registration: NP, PA, CRNA — prescriptive authority by state, separate DEA number requirement
- Institutional registration: hospitals, clinics, dispensaries — vs. individual practitioner
- Registration renewal: timing, fees, online renewal via DEA.gov, failure-to-renew consequences
- Registration modification: change of address, business activity changes
- State license prerequisite: DEA registration requires valid state license — impact of state board action on federal registration
- Multiple location registrations: when required, exemptions, one registration per principal place of business rule

**Prescribing**
- Prescribing authority by provider type: physician vs. NP vs. PA vs. CRNA (varies by state/federal law)
- Schedule II prescribing rules: no refills, 30-day supply limit, written prescription requirements, emergency oral prescriptions
- Schedule III-V prescribing rules: refill rules (5 refills, 6 months for III-IV; unlimited for V), oral prescriptions permitted
- Prescription format requirements: required elements (patient name/address, date, drug name/strength/quantity, directions, prescriber info/DEA number)
- Oral prescriptions for controlled substances: when permitted, reduction to writing requirements
- Emergency dispensing: oral authorization for Schedule II, pharmacist obligations
- Corresponding responsibility: pharmacist's duty to refuse suspicious prescriptions, red flag indicators
- Prescribing to self or family members: restrictions, state prohibitions

**Electronic Prescribing for Controlled Substances (EPCS)**
- Federal EPCS standards: DEA EPCS final rule (21 CFR Parts 1300, 1304, 1306, 1311)
- EPCS mandate requirements: states with mandatory EPCS laws, Medicare Part D EPCS mandate (effective 2023/2025)
- Identity proofing requirements: in-person or remote identity proofing, credential service provider requirements
- Two-factor authentication: logical access controls, hard token vs. biometric vs. knowledge factor
- Certified EPCS applications: DEA certification, audit requirements for software vendors
- Audit trail requirements: what must be logged, retention periods, tamper-evident requirements

**Prescription Drug Monitoring Programs (PDMP)**
- State PDMP query requirements: mandatory vs. voluntary states, which prescribers must query, when
- Interstate data sharing: PMP InterConnect (NABP), PMPInterConnect network, real-time vs. batch
- Delegate access: who can query on behalf of a prescriber, documentation requirements
- Prescriber obligations: frequency of querying, documentation in patient record, exceptions
- Dispenser obligations: reporting timeframes (real-time vs. 24-hour vs. 7-day varies by state)
- Integration with EHR systems: direct EHR integration requirements, workflow implications

**Schedule Classifications**
- Schedule I: high abuse potential, no accepted medical use, lack of accepted safety — examples, DEA petitions
- Schedule II: high abuse potential, severe dependence liability, accepted medical use — examples relevant to practices
- Schedule III-V: decreasing abuse potential, accepted medical uses — examples with practice relevance (testosterone = III, anabolic steroids = III, buprenorphine = III, stimulants = II, benzodiazepines = IV)
- Scheduling actions: how drugs get added, removed, or rescheduled — DEA administrative process, notice and comment
- Temporary scheduling: emergency scheduling authority (21 U.S.C. § 811(h)), duration, extension
- State-level scheduling differences: states that schedule substances not federally scheduled, states with stricter scheduling

**Dispensing (Physician/Practitioner)**
- Dispensing at point of care: physician dispensing authority, distinction from prescribing
- State dispensing permits: which states require separate permits for in-office dispensing
- Labeling requirements for dispensed controlled substances: required label elements
- Automated dispensing systems: Pyxis, Omnicell — DEA requirements for security and records
- Dispensing vs. administering distinction: in-office administration vs. dispensing for patient take-home

**Opioid-Specific Regulations**
- Medications for Opioid Use Disorder (MOUD): current regulatory framework post-X-waiver elimination
- X-waiver history and elimination: Consolidated Appropriations Act 2023, no waiver required for buprenorphine as of January 2023
- Buprenorphine prescribing: current requirements, patient limits (none since X-waiver elimination), training requirements, SAMHSA notifications
- Methadone treatment: Opioid Treatment Programs (OTPs), 42 CFR Part 8, SAMHSA certification, daily dispensing requirements
- Opioid prescribing limits: state MME (morphine milligram equivalent) thresholds, acute vs. chronic prescribing limits
- Naloxone co-prescribing: state mandatory co-prescribing requirements, standing orders, OTC naloxone status

**Recordkeeping & Inventory**
- Biennial inventory: timing, what to count, method (exact vs estimated), Schedule II vs III-V distinctions
- Ongoing records: receipts (DEA Form 222/CSOS), dispensing records, administration records, retention periods (2 years federal minimum, state variations)
- DEA Form 222: Schedule I and II ordering, paper form requirements, 3-copy system
- CSOS (Controlled Substance Ordering System): electronic equivalent of Form 222, PKI certificates, audit trail
- Records retention and format: paper vs electronic, accessibility requirements, 2-year minimum

**Security & Storage**
- Physical security requirements by schedule: Schedule I/II vs III-V storage distinctions
- Safe and vault specifications: DEA-compliant safes, weight requirements, anchoring, UL ratings
- Employee access controls: who can access controlled substance storage, key management, access logs
- Theft/loss reporting: DEA Form 106, significant loss vs. theft vs. disappearance distinctions, timing requirements, state reporting obligations
- Diversion prevention: internal controls, dual-control procedures, employee screening

**Disposal & Reverse Distribution**
- DEA-authorized collector programs: registered collector requirements, collection receptacles, mail-back programs
- Take-back programs: National Prescription Drug Take Back Day, year-round options
- Reverse distributor process: reverse distributor registration, Form 222/CSOS for returns, records
- In-house destruction methods: authorized for non-retrievable disposal, witnesses, documentation
- Environmental disposal considerations: not permitted under RCRA for controlled substances, DEA-specific rules

**Telehealth Prescribing of Controlled Substances**
- Ryan Haight Act: in-person examination requirement before prescribing via internet, 21 U.S.C. § 829(e)
- Ryan Haight exceptions: seven statutory exceptions (DEA telemedicine registration, public health emergency, Veterans Affairs, DEA-specified circumstances, etc.)
- DEA telemedicine special registration: proposed and final rule status, eligibility, application process
- Post-COVID DEA temporary rules: DEA COVID-era flexibilities, extension timeline, final telemedicine rules
- Audio-only vs. audio-video: DEA and state requirements for video vs. audio-only encounters for CS prescribing
- State-specific telehealth CS prescribing rules: state laws stricter than federal (note as state-regulated scaffolding)
- **(Cross-classification with Telehealth branch — see triggers below)**

---

## Cross-Classification Requirements

**Consistency with Session 5-A (Compounding):**
Review Session 5-A's cross-classification triggers. Any trigger in 5-A that points toward a
Controlled Substances domain code must have a matching trigger here pointing back, using the same
domain codes. For example, if 5-A says "entities mentioning [peptide] + [schedule] → also classify
in `controlled-substances.schedule-classifications`", then the Schedule Classifications node here
should include the reciprocal trigger.

**Telehealth cross-classification:**
The Telehealth branch (Session 6-B) covers telehealth prescribing in depth. For the Telehealth
Prescribing of Controlled Substances node here, define explicit triggers in this format:
> "If an entity in `controlled-substances.telehealth-prescribing.*` mentions [telehealth platform],
> [telemedicine], [audio-only], or [remote prescribing], also classify in `telehealth.prescribing.*`"

And the reverse:
> "If an entity in `telehealth.prescribing.*` mentions [Ryan Haight], [DEA registration], [Schedule II/III],
> or [controlled substance], also classify in `controlled-substances.telehealth-prescribing.*`"

---

## Output Format

Organize as a navigable markdown tree:

```
## L1: [Domain Name] (`domain-code`)

### L2: [Subdomain Name] (`domain-code.subdomain`)

#### L3: [Area Name] (`domain-code.subdomain.area`)
- **Description:** ...
- **Classification signals:**
  - CFR: ...
  - Agency: ...
  - Keywords: [term] (Strong), [term] (Moderate), [term] (Weak) — [disambiguation if needed]
  - Statutes: ...
- **Cross-classification triggers:** ...
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | ... | ... |

##### L4: [Specific Topic] (`domain-code.subdomain.area.topic`)
[same fields]
```

Include L1 and L2 as structural headers. Focus detailed metadata on L3+.
Go to L5/L6 where regulatory complexity genuinely warrants it.

---

## Reference Material

- **21 CFR Chapter II (DEA):** Parts 1300–1321 — verify current text at eCFR
- **Controlled Substances Act (CSA):** 21 U.S.C. §§ 801–971
- **21 CFR Part 1311:** Electronic prescriptions for controlled substances (EPCS)
- **42 CFR Part 8:** Opioid treatment programs (methadone)
- **Ryan Haight Act:** 21 U.S.C. § 829(e)
- **Consolidated Appropriations Act 2023** — X-waiver elimination (Section 1262)
- **eCFR:** https://www.ecfr.gov/
- **DEA Diversion Control Division:** https://www.deadiversion.usdoj.gov/
