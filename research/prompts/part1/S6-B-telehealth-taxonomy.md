# Cedar Classification Framework — Part 1, Session 6-B of 8
# Deep Taxonomy: Telehealth Branch (L3 through L6)

## About This Session

**Context from prior research sessions has been pre-injected above this prompt by the orchestrator.**
The injected context contains:
- **Session 4 output** — L1/L2 domain codes for all domains, including Telehealth
- **Session 5-B output** — Controlled Substances branch taxonomy, including Telehealth Prescribing of CS nodes
- **Session 6-A output** — FDA Regulation branch taxonomy, including SaMD and RPM device nodes

Read all three injected outputs directly. Cross-classification triggers must be consistent:
- Session 5-B defined CS telehealth prescribing triggers pointing toward the Telehealth branch — mirror them here
- Session 6-A defined SaMD/RPM device triggers pointing toward the Telehealth branch — mirror them here

This is a **sub-session** (6-B of 8). **This session covers Telehealth only.**

---

## Cedar Platform Context

Cedar is an AI-powered regulatory monitoring platform for independent medical practices.

**Target practice types** (14 total):
Functional Medicine, Hormone Optimization/HRT, Compounding Pharmacy, Med Spa/Aesthetic Medicine,
Weight Management, Peptide Therapy, IV Therapy/Infusion, Regenerative Medicine, Telehealth,
Chiropractic, Integrative Medicine, Anti-Aging Medicine, Pain Management, Primary Care (DPC/Concierge).

**Platform purpose:** Cedar monitors regulatory sources, classifies changes through an AI pipeline, and
delivers plain-language alerts. Telehealth regulation is among the most actively changing regulatory areas
for Cedar's target market — GLP-1 prescribing via telehealth, hormone therapy via telehealth, and
controlled substance prescribing via telehealth are all high-velocity regulatory areas.

**Why Telehealth matters for Cedar's target market:** Many Cedar practices offer telehealth as their
primary or a significant delivery channel. Post-COVID regulatory evolution (DEA rules, CMS telehealth
expansions, state parity laws, EPCS mandates) creates a continuous stream of high-priority regulatory
changes. The Ryan Haight Act and its exceptions directly affect whether Cedar practices can prescribe
controlled substances to patients without an in-person visit.

---

## Metadata Requirements

For **every node at every level (L3, L4, L5, L6)**, provide all of the following:

1. **Domain name** — practitioner-facing label
2. **Domain code** — dot-notation extending the L2 code from Session 4
3. **Description** — 1-2 sentences on what regulatory content belongs here and why it matters
4. **Classification signals**:
   - **CFR part/section ranges** — as specific as possible
   - **Agency/sub-agency names** — exact Federal Register names
   - **Keyword phrases** — 5-15 per node, marked Strong / Moderate / Weak, with disambiguation notes
   - **Statutory references** — Ryan Haight Act, Social Security Act telehealth provisions, etc.
5. **Cross-classification triggers** — specific, implementable rules:
   > "If an entity classified in `[this domain code]` contains any of: [term list], also classify in `[target domain code]`"
6. **Practice-type relevance** — compact table (High / Medium / Low; omit None rows):

| Practice Type | Relevance |
|---|---|
| Telehealth | High |
| [etc.] | [weight] |

---

## Deliverable: Telehealth Branch (L3 through L6)

Develop the **full Telehealth taxonomy** for Cedar. Use L1/L2 codes from Session 4.
Target: **30–45 total nodes** across all levels.

**Explicitly define every cross-classification trigger** connecting to:
- Session 5-B's Controlled Substances telehealth prescribing nodes (Ryan Haight, DEA special registration)
- Session 6-A's SaMD and RPM device nodes

### Required coverage areas:

**Prescribing via Telemedicine**
- Ryan Haight Act: 21 U.S.C. § 829(e) in-person examination requirement, "practice of telemedicine" definition
- Ryan Haight exceptions: all seven statutory exceptions — DEA registration telemedicine, hospital/clinic, DEA-specified circumstances, Indian Health Service, public health emergency, Veterans Affairs, state telemedicine law exception
- DEA telemedicine special registration: current status of proposed/final rule, eligibility criteria, application process, scope of authority granted, which schedules covered
- Post-COVID DEA temporary rules: COVID-19 PHE flexibilities for CS prescribing, DEA's interim final rules, extension timeline, DEA's November 2023 / 2024 final telemedicine rules
- Controlled substance prescribing via telehealth: which schedules, which provider types, audio-video requirement (cross-classification with `controlled-substances.telehealth-prescribing.*`)
- Non-controlled substance prescribing via telehealth: standard of care requirements, prescription validity, patient-provider relationship establishment
- Prescribing based on questionnaire only: asynchronous prescribing restrictions, state laws, FTC enforcement against direct-to-consumer telehealth companies
- Prescribing for weight management via telehealth: GLP-1 agonist prescribing (semaglutide, tirzepatide), DEA and state rules for non-controlled GLP-1 agents
- Prescribing hormones via telehealth: testosterone (Schedule III), estradiol (non-scheduled), progesterone (non-scheduled) — different rules for scheduled vs. non-scheduled hormones
- Audio-only vs. audio-video requirements: states requiring video for prescribing, DEA requirements, Medicare requirements for audio-only billing

**State Licensure & Practice Authority**
- Interstate Medical Licensure Compact (IMLC): expedited licensure pathway, member states, eligibility, limitations
- Nurse Licensure Compact (NLC): multistate license, home state vs. remote state, what NPs can do vs. RNs
- Psychology Interjurisdiction Compact (PSYPACT): telepsychology, APIT authorization, member states
- Physical Therapy Licensure Compact: PT/PTA telehealth across state lines
- State-by-state telehealth practice framework: patient location determines applicable law (general principle), which state's laws govern prescribing, corporate structure considerations
- Telehealth-specific state licenses/registrations: states with separate telehealth licenses vs. standard licensure, certificate of telemedicine requirements
- Corporate practice of medicine doctrine and telehealth: how CPOM restrictions affect telehealth company structures, MSO arrangements, physician ownership requirements

**Telehealth Billing & Reimbursement**
- Medicare telehealth billing: place of service codes (POS 02 for telehealth non-home, POS 10 for home), modifiers (95 = synchronous audio-video, GT = Veterans Affairs, FQ = audio-only)
- Geographic and originating site restrictions: pre-COVID restrictions, COVID waivers, permanent changes under CAA 2023 and IRA 2022
- Facility fee billing for telehealth: originating site facility fee (Q3014), distant site billing
- State telehealth parity laws: states requiring commercial payers to cover telehealth at parity with in-person, payment parity vs. coverage parity
- Remote Patient Monitoring (RPM) billing: CPT 99453 (setup), 99454 (device/transmission), 99457 (management 20 min), 99458 (additional 20 min), documentation requirements
- Remote Therapeutic Monitoring (RTM) billing: CPT 98975-98981, musculoskeletal and respiratory conditions, clinical staff vs. physician requirements
- Chronic Care Management (CCM) via telehealth: CPT 99490, 99491, 99437, 99439 — care plan requirements, patient consent
- Principal Care Management (PCM) via telehealth: CPT 99424-99427, single complex chronic condition
- Audio-only billing codes: expanded audio-only coverage post-COVID, restrictions, state parity for audio-only
- E/M code selection for telehealth: 2021 MDM-based coding applies equally, time-based selection for telehealth

**Technology & Platform Requirements**
- HIPAA-compliant telehealth platforms: BAA requirement for platform vendors, acceptable platforms vs. enforcement discretion (COVID era), post-COVID requirements
- Business Associate Agreement requirements: what makes a platform vendor a BA, BAA required elements, HIPAA Security Rule applicability to telehealth platforms
- Encryption and security standards: minimum encryption requirements, data at rest vs. in transit, platform vendor obligations
- Patient consent for telehealth: state-specific informed consent requirements (see also Informed Consent node), platform consent
- Recording and documentation requirements: state laws on recording patient encounters, consent for recording, storage
- Emergency protocols for telehealth encounters: requirements to have emergency procedures, patient location identification, escalation paths
- Bandwidth and technology accessibility standards: ADA considerations for telehealth technology access

**Remote Patient Monitoring (RPM)**
- FDA regulation of RPM devices: 510(k) clearance requirements for RPM devices, General Wellness Policy, enforcement discretion (cross-classification with `fda-regulation.device-regulation.*`)
- RPM program setup requirements: physician order, care plan, patient enrollment criteria
- Patient eligibility for RPM: Medicare eligibility (consent, chronic condition requirements), commercial payer requirements
- Data collection and transmission standards: frequency of data collection, transmission protocols, data security
- Clinical staff requirements for RPM oversight: who can provide RPM services (clinical staff supervision requirements), billing implications
- Wearable device regulatory status: continuous glucose monitors (CGMs), blood pressure monitors, pulse oximeters — clearance status, intended use, prescription vs. OTC

**Telehealth Modalities**
- Synchronous (live video): standard telehealth modality, billing rules, documentation requirements
- Asynchronous (store-and-forward): dermatology, ophthalmology, radiology use cases; billing codes (where available); state coverage requirements
- Audio-only: restrictions, when permitted, documentation requirements, billing implications, state laws
- Remote monitoring: distinct from video visits, billing and coverage rules, clinical integration
- Mobile health (mHealth) applications: FTC regulation of health apps (data privacy, marketing), FDA regulation of mobile medical apps vs. general wellness apps, state health app regulations

**Cross-State & Jurisdiction Issues**
- Patient location determines applicable law: which state's prescribing law governs, choice of law in multi-state encounters
- Multi-state practice compliance strategies: multi-state licensing, using compacts, registered agent structures
- Corporate structure for multi-state telehealth: where to incorporate, CPOM considerations, MSO structures
- Malpractice insurance across state lines: tail coverage, occurrence vs. claims-made, multi-state coverage
- State telehealth registries and special registrations: states requiring out-of-state providers to register

**Informed Consent for Telehealth**
- State-specific informed consent requirements: states with mandatory telehealth-specific consent laws, required disclosures
- Required disclosures: technology limitations, privacy practices, provider credentials, alternative options, emergency procedures
- Written vs. verbal consent requirements: states requiring written consent, states accepting verbal (documented in record)
- Consent documentation and recordkeeping: how to document, retention periods, HIPAA implications

---

## Cross-Classification Requirements

**From Session 5-B (Controlled Substances telehealth prescribing):**
Review Session 5-B's Telehealth Prescribing of Controlled Substances node and its cross-classification
triggers. Define corresponding triggers here pointing back to the CS branch for any telehealth node
that touches controlled substance prescribing. The triggers must use the exact same domain codes
as defined in Session 5-B.

**From Session 6-A (FDA device — SaMD, RPM):**
Review Session 6-A's SaMD and Laboratory Developed Tests nodes. Define cross-classification triggers
here for RPM nodes pointing to `fda-regulation.device-regulation.rpm-devices` (or whatever 6-A named it).

**Key triggers to define:**
- Telehealth prescribing of CS → `controlled-substances.telehealth-prescribing.*`
- RPM devices mentioned in telehealth context → `fda-regulation.device-regulation.*`
- HIPAA-compliant platforms mentioned → `hipaa-privacy.security-rule.*` (to be defined in S7-A)
- Medicare telehealth billing → `medicare-billing.*` (to be defined in S7-A)
- State licensure compact mentions → `practice-operations.professional-licensing.*` (to be defined in S7-B)

---

## Output Format

```
## L1: [Domain Name] (`domain-code`)

### L2: [Subdomain Name] (`domain-code.subdomain`)

#### L3: [Area Name] (`domain-code.subdomain.area`)
- **Description:** ...
- **Classification signals:**
  - CFR: ...
  - Agency: ...
  - Keywords: [term] (Strong), [term] (Moderate), [term] (Weak) — [disambiguation note]
  - Statutes: ...
- **Cross-classification triggers:** ...
- **Practice-type relevance:**
  | Practice Type | Relevance |
  |---|---|
  | ... | ... |

##### L4: [Specific Topic] (`domain-code.subdomain.area.topic`)
[same fields]
```

Include L1/L2 as structural headers. Focus detailed metadata on L3+.

---

## Reference Material

- **Ryan Haight Online Pharmacy Consumer Protection Act:** 21 U.S.C. § 829(e)
- **Social Security Act telehealth provisions:** 42 U.S.C. § 1395m(m), 1395n(e)
- **42 CFR Part 410:** Medicare Part B coverage, including telehealth (§ 410.78)
- **Consolidated Appropriations Act 2023** — telehealth extensions (Division FF)
- **DEA telemedicine regulations:** 21 CFR Parts 1300, 1306 — verify current status of telemedicine rules
- **eCFR:** https://www.ecfr.gov/
- **DEA Diversion Control:** https://www.deadiversion.usdoj.gov/
- **CMS telehealth resources:** https://www.cms.gov/medicare/coverage/telehealth
