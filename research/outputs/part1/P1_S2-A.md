# Title 21 (Food and Drugs) part-level allowlist for Cedar's classification pipeline

**Cedar's ~99K unclassified regulatory entities require precise part-level filtering.** Of Title 21's approximately 300 active parts spanning three chapters, **roughly 95 parts are relevant or conditionally relevant** to Cedar's 14 target practice types, while the remainder — primarily food standards, animal drugs, and tobacco — can be excluded. This allowlist resolves all Session 1 ambiguities and provides definitive classifications for every part, structured for direct consumption by the engineering implementation pipeline.

**Practice type abbreviations used throughout:** FM (Functional Medicine), HRT (Hormone Optimization/HRT), CP (Compounding Pharmacy), MS (Med Spa/Aesthetic Medicine), WM (Weight Management), PT (Peptide Therapy), IV (IV Therapy/Infusion), RM (Regenerative Medicine), TH (Telehealth), CH (Chiropractic), IM (Integrative Medicine), AA (Anti-Aging Medicine), PM (Pain Management), PC (Primary Care DPC/Concierge).

---

## Chapter I — FDA (Parts 1–1299)

### Subchapter A: General (Parts 1–99)

| Chapter | Subchapter | Part | Part Description | Relevant? | Relevance Level | Cedar Practice Types Affected | Notes |
|---------|-----------|------|-----------------|-----------|-----------------|-------------------------------|-------|
| I | A | 1 | General Enforcement Regulations | YES | MODERATE | ALL 14 | Foundational enforcement provisions; labeling requirements (§§1.20–1.24); import/export rules; administrative detention authority. Applies to any practice handling FDA-regulated products. |
| I | A | 2 | General Administrative Rulings and Decisions | YES | LOW | CP, PT, IV, HRT, RM, MS | Administrative interpretations; §2.125 addresses criteria for "significant risk" devices. Relevant when products straddle regulatory categories. |
| I | A | 3 | Product Jurisdiction | YES | MODERATE | CP, PT, RM, MS, IV, HRT, PM | Rules for determining FDA center jurisdiction over combination products (drug/device, drug/biologic). Critical for PRP kits, drug-eluting devices, peptide delivery systems. |
| I | A | 4 | Regulation of Combination Products | YES | MODERATE | CP, PT, RM, MS, IV, HRT, PM | GMP and postmarket reporting for combination products. Extends Part 3 framework. |
| I | A | 5 | Organization | NO | — | — | Internal FDA organizational structure only. |
| I | A | 6–9 | [Reserved] | NO | — | — | No content. |
| I | A | 7 | Enforcement Policy | YES | HIGH | ALL 14 | **Recall procedures (Class I/II/III)** and FDA enforcement discretion framework. All practices using FDA-regulated products must understand recall response obligations. |
| I | A | 10 | Administrative Practices and Procedures | YES | LOW | ALL (if engaging FDA) | Citizen petitions, advisory opinions, guidance documents. Relevant if practice faces FDA action. |
| I | A | 11 | Electronic Records; Electronic Signatures | YES | **CRITICAL** | ALL 14, esp. CP, TH, PT, IV | **Criteria for trustworthy electronic records/signatures.** Applies to any FDA-required records maintained electronically. Audit trails, system validation, identity verification. Essential for e-prescribing, compounding batch records, EHR documentation. |
| I | A | 12–15 | Formal/Public Hearings (various) | NO | — | — | Procedural rules for FDA hearings; no practical relevance to clinical practices. |
| I | A | 16 | Regulatory Hearing Before FDA | YES | LOW | CP, RM, PT, MS, ALL (if enforcement) | Governs hearing rights before FDA enforcement actions. Relevant if practice faces regulatory action. |
| I | A | 17 | Civil Money Penalties Hearings | YES | LOW | ALL (if enforcement) | Hearing procedures for civil money penalties. Relevant as consequence awareness. |
| I | A | 18–24 | [Reserved] / Standards of Conduct (19) / Public Info (20) / Privacy (21) | NO | — | — | Parts 19 (FDA employee conduct), 20 (FOIA), 21 (Privacy Act) — minimal direct relevance; Parts 18, 22–24 reserved. |
| I | A | 25–49 | Environmental Impact (25) / Mutual Recognition (26) / [Reserved 27–49] | NO | — | — | Part 25 (NEPA compliance), Part 26 (US-EU agreements) — not applicable to clinical practices. Parts 27–49 reserved. |
| I | A | 50 | Protection of Human Subjects | YES | **CRITICAL** | ALL prescribing, esp. RM, PT, FM, HRT, AA, IM | **Informed consent requirements for FDA-regulated clinical investigations.** Applies when practices conduct trials, use INDs/IDEs, or participate in any FDA-regulated research. Many regenerative/peptide therapies are investigational. |
| I | A | 51–53 | [Reserved] | NO | — | — | No content. |
| I | A | 54 | Financial Disclosure by Clinical Investigators | YES | HIGH | RM, PT, FM, HRT, MS, AA, IM, PM | Required when practice physicians serve as clinical investigators for FDA-regulated studies. Financial interest disclosure obligations. |
| I | A | 55 | [Reserved] | NO | — | — | No content. |
| I | A | 56 | Institutional Review Boards | YES | **CRITICAL** | RM, PT, FM, HRT, MS, AA, IM, PM, PC | **IRB requirements for FDA-regulated research.** Any clinical investigation subject to FDA regs requires IRB review. Practices must use central/commercial IRB if conducting research. |
| I | A | 57 | [Reserved] | NO | — | — | No content. |
| I | A | 58 | Good Laboratory Practice for Nonclinical Studies | YES | LOW | CP, RM, PT | GLP standards for nonclinical safety studies submitted to FDA. Primarily affects labs, not clinical practices, but relevant if practice sponsors preclinical work. |
| I | A | 59–69 | [Reserved] / Patent Term Restoration (60) | NO | — | — | Part 60 (patent restoration) applies to patent holders, not practices. All others reserved. |
| I | A | 70 | Color Additives | YES | LOW | CP, MS | General color additive provisions. Relevant to compounding pharmacies using colorants and med spas with cosmetic products. |
| I | A | 71–82 | Color Additive Petitions/Listings/Certification | NO | — | CP, MS (marginal) | Parts 73–74 (color additive listings) marginally relevant to CP and MS. Parts 71, 72, 75–80 procedural/reserved. Parts 81–82 (provisional colors) very low relevance. Exclude from allowlist. |
| I | A | 83–98 | [Reserved] | NO | — | — | No content. |
| I | A | 99 | Dissemination of Info on Unapproved/New Uses for Marketed Drugs, Biologics, and Devices | YES | HIGH | ALL 14, esp. FM, HRT, PT, RM, WM, AA, IM, PM | Governs manufacturer dissemination of **off-label use information**. Critical context for practices relying heavily on off-label therapies (HRT, weight loss, peptides, pain management). |

### Subchapter B: Food for Human Consumption (Parts 100–199)

| Chapter | Subchapter | Part | Part Description | Relevant? | Relevance Level | Cedar Practice Types Affected | Notes |
|---------|-----------|------|-----------------|-----------|-----------------|-------------------------------|-------|
| I | B | 100 | General | NO | — | — | Administrative food labeling provisions. |
| I | B | 101 | Food Labeling | YES | HIGH | FM, WM, IM, AA, PT, HRT | **Supplement Facts panel (§101.36)**, structure/function claim disclaimers (§101.93), health claims. Any practice selling/private-labeling dietary supplements must comply. |
| I | B | 102–110 | Food standards, infant formula, emergency permits, contaminants, food cGMP | NO | — | — | Food manufacturing standards. Parts 102, 104–110 irrelevant. Part 103 reserved. |
| I | B | 111 | Current Good Manufacturing Practice for Dietary Supplements | YES | **CRITICAL** | FM, IM, AA, WM, HRT, PT, CP | **Dietary supplement cGMP.** Any practice manufacturing, private-labeling, repackaging, or holding supplements for distribution must comply. Covers personnel, facilities, production controls, lab ops, records. |
| I | B | 112–118 | Produce safety, canned foods, acidified foods, shell eggs, food preventive controls | NO | — | — | FSMA and food manufacturing standards. |
| I | B | 119 | Dietary Supplements That Present a Significant or Unreasonable Risk | YES | MODERATE | FM, WM, IM, AA, PT, HRT | Authorizes FDA to declare supplements adulterated. Practices should monitor for banned ingredients. |
| I | B | 120–129 | HACCP, food defense, fish/shellfish, bottled water | NO | — | — | Food manufacturing standards. |
| I | B | 130–169 | Food Standards of Identity (milk, cheese, frozen desserts, bakery, cereals, pasta, fruits, vegetables, eggs, fish, cacao, nuts, beverages, margarine, sweeteners, dressings) | NO | — | — | **33 parts, all IRRELEVANT.** Standards of identity for conventional food products. No application to medical practices. |
| I | B | 170–181 | Food Additives (general, petitions, permitted additives, indirect additives, irradiation, interim additives, prior-sanctioned) | NO | — | — | **12 parts, all IRRELEVANT.** Food additive regulations for food manufacturing. |
| I | B | 182 | Substances Generally Recognized as Safe (GRAS) | NO | — | — | GRAS listings for food. Background relevance only. |
| I | B | 184 | Direct Food Substances Affirmed as GRAS | NO | — | — | Affirmed GRAS substances. |
| I | B | 186 | Indirect Food Substances Affirmed as GRAS | NO | — | — | Indirect food contact GRAS substances. |
| I | B | 189 | Substances Prohibited from Use in Human Food | YES | LOW | FM, IM, AA | Lists banned food/supplement substances (calamus, coumarin, etc.). Practices should ensure supplements don't contain prohibited substances. |
| I | B | 190 | Dietary Supplements | YES | **CRITICAL** | FM, IM, AA, WM, PT, HRT, CP | **New Dietary Ingredient (NDI) notifications (§190.6).** 75-day premarket notification for supplements with novel ingredients. Critical for practices formulating/introducing novel supplement products. |
| I | B | 191–199 | [Reserved] | NO | — | — | No content. |

### Subchapter C: Drugs — General (Parts 200–299)

| Chapter | Subchapter | Part | Part Description | Relevant? | Relevance Level | Cedar Practice Types Affected | Notes |
|---------|-----------|------|-----------------|-----------|-----------------|-------------------------------|-------|
| I | C | 200 | General | YES | MODERATE | ALL prescribing practices | General drug provisions including sterility requirements (§200.50), manufacturer/pharmacist communications. |
| I | C | 201 | Labeling | YES | **CRITICAL** | ALL prescribing, esp. CP | **Comprehensive drug labeling rules.** OTC Drug Facts, Rx labeling, adequate directions for use, prescription legend. Critical for any practice dispensing or relabeling drugs. |
| I | C | 202 | Prescription Drug Advertising | YES | HIGH | ALL prescribing, esp. MS, WM, AA, HRT | **Rx drug advertising rules** (fair balance, risk disclosure). Directly relevant to practices advertising prescription treatments (weight loss drugs, HRT, aesthetics). |
| I | C | 203 | Prescription Drug Marketing | YES | HIGH | CP, ALL prescribing | **PDMA implementation:** drug sample distribution, wholesale distribution, reimportation. Governs sample handling at practices. |
| I | C | 205 | Guidelines for State Licensing of Wholesale Rx Drug Distributors | YES | LOW | CP | Federal minimum standards for wholesale distribution licensing. Relevant if practice engages in wholesale distribution. |
| I | C | 206 | Imprinting of Solid Oral Dosage Forms | YES | LOW | CP | Imprint code requirements on tablets/capsules. Relevant to compounding pharmacies producing solid orals. |
| I | C | 207 | Establishment Registration and Listing / NDC | YES | **CRITICAL** | CP, IV | **FDA establishment registration and NDC requirements.** 503B outsourcing facilities must register. Practices producing IV admixtures may be affected. |
| I | C | 208 | Medication Guides | YES | HIGH | ALL prescribing/dispensing | Requires distribution of Medication Guides with certain Rx drugs. Compliance obligation for all dispensing practices. |
| I | C | 209 | Side Effects Statements for Dispensers/Pharmacies | YES | HIGH | ALL dispensing, CP | Side effects statement distribution requirement for dispensing practices. |
| I | C | 210 | Drug cGMP — General | YES | **CRITICAL** | CP, IV | **General cGMP framework for drug manufacturing.** Core regulation for 503A and 503B compounding pharmacies. IV therapy practices preparing admixtures should be aware. |
| I | C | 211 | Drug cGMP for Finished Pharmaceuticals | YES | **CRITICAL** | CP, IV | **Detailed cGMP for finished drugs.** Core regulation for 503B outsourcing facilities; quality benchmark for 503A. |
| I | C | 212 | cGMP for Positron Emission Tomography Drugs | NO | — | — | PET drug manufacturing; nuclear pharmacy only. |
| I | C | 213 | cGMP for Medical Gases | NO | — | — | Medical gas manufacturing. New rule effective 12/18/2025. Manufacturer-side only. |
| I | C | 216 | Human Drug Compounding | YES | **CRITICAL** | CP, HRT, PT, AA, FM, IM, RM, WM | **Lists bulk substances that may NOT be compounded** (withdrawn/removed list). References 503A/503B framework. Essential for any practice using compounded medications. |
| I | C | 225–226 | cGMP for Medicated Feeds / Type A Medicated Articles | NO | — | — | Animal feed manufacturing. |
| I | C | 230 | Certification for Designated Medical Gases | NO | — | — | Medical gas certification. New rule effective 12/18/2025. Manufacturer-side only. |
| I | C | 250 | Special Requirements for Specific Human Drugs | YES | LOW | CP, IV, PM | Special requirements for hexachlorophene and certain drugs. Limited relevance. |
| I | C | 251 | Section 804 Importation Program | YES | LOW | CP, ALL practices | **Drug importation from Canada.** Florida has pursued a state importation program. Could affect drug pricing/availability. |
| I | C | 290 | Controlled Drugs | YES | HIGH | PM, WM, HRT, PC, ALL prescribing | **Controlled substance prescribing/dispensing rules** bridging to DEA regs. Relevant to any practice prescribing Schedule II–V drugs. |
| I | C | 299 | Drugs; Official Names and Established Names | YES | LOW | CP, ALL prescribing | Drug naming rules for labeling compliance. |

### Subchapter D: Drugs for Human Use (Parts 300–499)

| Chapter | Subchapter | Part | Part Description | Relevant? | Relevance Level | Cedar Practice Types Affected | Notes |
|---------|-----------|------|-----------------|-----------|-----------------|-------------------------------|-------|
| I | D | 300 | General | YES | MODERATE | ALL prescribing | Fixed-combination drug policy; CFC prohibition; **Right to Try provisions (§300.200)** relevant to practices exploring experimental treatments. |
| I | D | 310 | New Drugs | YES | HIGH | ALL prescribing, esp. CP, PT, WM | Defines "new drug" status; lists drugs **removed from market** for safety/efficacy. Critical for determining which ingredients may be compounded. |
| I | D | 312 | Investigational New Drug Application (IND) | YES | HIGH | RM, PT, AA, IM, FM | **IND requirements.** Relevant if practices participate in clinical trials, use expanded access/compassionate use, or investigate novel therapies (stem cells, peptides). |
| I | D | 314 | Applications for FDA Approval (NDA/ANDA) | YES | LOW | CP | NDA/ANDA process. Background for understanding drug approval status; relevant to compounding pharmacies. |
| I | D | 315 | Diagnostic Radiopharmaceuticals | NO | — | — | Nuclear medicine only. |
| I | D | 316 | Orphan Drugs | YES | LOW | RM, PT, IM | Orphan drug designation. Relevant if practices treat rare diseases or use orphan-designated products. |
| I | D | 317 | Qualifying Pathogens | NO | — | — | GAIN Act pathogen designation for antibiotics. |
| I | D | 320 | Bioavailability and Bioequivalence | YES | LOW | CP | BA/BE requirements. Relevant to compounding pharmacies understanding equivalence of compounded vs. approved products. |
| I | D | 328 | OTC Drug Products Containing Alcohol | YES | LOW | PC, FM, IM | Labeling for OTC products with alcohol. |
| I | D | 329 | Nonprescription Drug Products Subject to Section 760 | YES | LOW | ALL (if selling OTC) | Newer provision for certain nonprescription products. |
| I | D | 330 | OTC Human Drugs — GRASE Framework | YES | MODERATE | MS, PC, FM, IM, PM, WM | **General OTC drug monograph framework.** Important for practices recommending, selling, or private-labeling OTC products. |
| I | D | 331 | Antacid Products for OTC Use | NO | — | — | OTC antacid monograph. Minimal relevance. |
| I | D | 332 | Antiflatulent Products for OTC Use | NO | — | — | OTC antiflatulent monograph. |
| I | D | 333 | Topical Antimicrobial Drug Products for OTC Use | YES | LOW | MS, PC | OTC antiseptic monograph. Relevant to med spas using antiseptic products. |
| I | D | 335–336 | Antidiarrheal / Antiemetic OTC | NO | — | — | OTC monographs. Minimal relevance. |
| I | D | 338 | Nighttime Sleep-Aid OTC Products | YES | LOW | FM, IM, AA, PC | OTC sleep aid monograph. Relevant if practices sell/recommend. |
| I | D | 340 | Stimulant Drug Products OTC | YES | LOW | WM, FM | OTC stimulant (caffeine) monograph. Relevant to weight management. |
| I | D | 341 | Cold, Cough, Allergy, Bronchodilator OTC | YES | LOW | PC, FM, IM | OTC cold/allergy monograph. |
| I | D | 343 | Internal Analgesic, Antipyretic, Antirheumatic OTC | YES | MODERATE | PM, PC, FM, IM | **OTC analgesic monograph** (aspirin, acetaminophen, ibuprofen, naproxen). Relevant to pain management and primary care. |
| I | D | 344 | Topical Otic OTC | NO | — | — | OTC ear drops. |
| I | D | 346 | Anorectal Drug Products OTC | NO | — | — | OTC hemorrhoidal products. |
| I | D | 347 | Skin Protectant Drug Products OTC | YES | MODERATE | MS, AA | OTC skin protectant monograph (dimethicone, petrolatum). Relevant to med spas and aesthetic practices. |
| I | D | 348 | External Analgesic Drug Products OTC | YES | MODERATE | PM, CH, RM, PC | **OTC topical analgesic monograph** (menthol, capsaicin, lidocaine, methyl salicylate). Directly relevant to pain management and chiropractic. |
| I | D | 349 | Ophthalmic OTC | NO | — | — | OTC eye care. |
| I | D | 350 | Antiperspirant OTC | NO | — | — | OTC antiperspirant. |
| I | D | 352 | Sunscreen Drug Products OTC [STAYED] | YES | LOW | MS, AA | OTC sunscreen monograph (stayed indefinitely). Relevant to med spas selling sunscreen. Regulatory status in flux under OTC monograph reform. |
| I | D | 355 | Anticaries OTC | NO | — | — | Fluoride products. |
| I | D | 357 | Miscellaneous Internal OTC Products | YES | LOW | WM, FM | Includes certain weight control OTC products. |
| I | D | 358 | Miscellaneous External Drug Products OTC | YES | MODERATE | MS, PM, CH, PC | **Miscellaneous external OTC** (dandruff, acne, corn/callus removers). Relevant to med spas and skin care practices. |
| I | D | 361 | Prescription Drugs in Research | YES | LOW | RM, PT | Radioactive drugs for research. Narrow scope. |
| I | D | 369 | Interpretative Statements Re Warnings on OTC Drugs/Devices | YES | MODERATE | ALL (if selling OTC) | FDA interpretive warning statements for OTC products. |
| I | D | 370–499 | [Reserved] | NO | — | — | No regulations codified. |

### Subchapter E: Animal Drugs, Feeds, and Related Products (Parts 500–599)

| Chapter | Subchapter | Part Range | Part Description | Relevant? | Relevance Level | Cedar Practice Types Affected | Notes |
|---------|-----------|-----------|-----------------|-----------|-----------------|-------------------------------|-------|
| I | E | 500–529 | Animal drug general provisions, labeling, new animal drugs (investigational, applications, licensing), dosage form approvals | NO | — | — | **Entire range IRRELEVANT.** Animal drug manufacturing, labeling, approval. No application to human medical practices. Includes Parts 500, 501, 502, 507, 509, 510, 511, 514, 515, 516, 520, 522, 524, 526, 528, 529. |
| I | E | 530 | Extralabel Drug Use in Animals | NO | — | — | Governs off-label use of human drugs in animals. Does NOT authorize animal drugs in humans. Irrelevant to clinical practice. |
| I | E | 556–589 | Animal drug residue tolerances, medicated feeds, animal food additives, GRAS for animal food, prohibited substances | NO | — | — | **Entire range IRRELEVANT.** Includes Parts 556, 558, 570, 571, 573, 579, 582, 584, 589. Animal food chain safety. |
| I | E | 590–599 | [Reserved] | NO | — | — | No content. |

### Subchapter F: Biologics (Parts 600–680)

| Chapter | Subchapter | Part | Part Description | Relevant? | Relevance Level | Cedar Practice Types Affected | Notes |
|---------|-----------|------|-----------------|-----------|-----------------|-------------------------------|-------|
| I | F | 600 | Biological Products: General | YES | **CRITICAL** | RM, PT, IV, HRT, AA, MS | **Foundational biologic regulation.** Defines "biological product," safety, purity, potency, sterility. Establishment standards, inspection requirements, **adverse experience reporting (§600.80).** Any practice using PRP, stem cells, blood products, growth factors, or biologic-classified peptides must understand this. |
| I | F | 601 | Licensing | YES | **CRITICAL** | RM, PT, IV, HRT, AA | **Biologics License Application (BLA) process.** §601.2(c) specifically covers **therapeutic synthetic peptide products** (≤40 amino acids), recombinant DNA-derived products, monoclonal antibodies. Accelerated approval (Subpart E) relevant to regenerative therapies. Essential for understanding which biologic products are legally marketed. |
| I | F | 606 | cGMP for Blood and Blood Components | YES | **CRITICAL** | IV, RM, MS | **cGMP for blood establishments.** Personnel, facilities, equipment, production controls, testing, labeling (§606.121), adverse reaction reporting (§606.170), product deviation reporting (§606.171). Directly relevant to PRP preparation, autologous blood processing, blood-derived therapies. |
| I | F | 607 | Establishment Registration for Blood Products | YES | HIGH | IV, RM | **Registration for blood product establishments.** Facilities manufacturing blood products (including PRP) may need to register. |
| I | F | 610 | General Biological Products Standards | YES | **CRITICAL** | RM, PT, IV, HRT, AA, MS | **Core quality standards for ALL biologics.** Potency (§610.10), sterility (§610.12), purity (§610.13), identity (§610.14). Testing for transfusion-transmitted infections (§610.40: HIV, HBV, HCV, HTLV, syphilis). Dating periods. Labeling standards. Essential for any practice handling biologic products. |
| I | F | 630 | Requirements for Blood and Blood Components | YES | **CRITICAL** | IV, RM, MS | **Donor/collection requirements.** Donor eligibility (§630.10), medical supervision (§630.5), donor questionnaire, donor notification. Directly relevant to **PRP preparation** (autologous blood collection) and blood-derived regenerative therapies. |
| I | F | 640 | Additional Standards for Human Blood and Blood Products | YES | **CRITICAL** | IV, RM, HRT, MS, AA | **Product-by-product blood standards.** Subpart C (Platelets) — **directly relevant to PRP.** Subpart D (Plasma), Subpart H (Albumin) — relevant to IV infusion. Subpart J (Immune Globulin) — IVIG therapies. Subpart G (Source Plasma) — plasma-derived therapies. |
| I | F | 660 | Additional Standards for Diagnostic Substances | YES | LOW | All (diagnostic support) | Blood typing reagents, diagnostic substance standards. Indirectly relevant for practices relying on blood testing (pre-PRP screening, infectious disease testing). |
| I | F | 680 | Additional Standards for Miscellaneous Products | YES | MODERATE | RM, AA, MS | **Allergenic products and miscellaneous biologics.** Source material controls, potency requirements. Relevant for growth factors and tissue-derived products used in regenerative/aesthetic medicine. |

### Subchapter G: Cosmetics (Parts 700–799) — Session 1 AMBIGUOUS → resolved RELEVANT

| Chapter | Subchapter | Part | Part Description | Relevant? | Relevance Level | Cedar Practice Types Affected | Notes |
|---------|-----------|------|-----------------|-----------|-----------------|-------------------------------|-------|
| I | G | 700 | General | YES | HIGH | MS, CP | **Prohibited cosmetic ingredients** (mercury, vinyl chloride, chloroform, methylene chloride, cattle-derived materials). Critical for practices private-labeling or compounding topicals. Defines cosmetic product scope. |
| I | G | 701 | Cosmetic Labeling | YES | HIGH | MS | **Labeling requirements for cosmetic products.** MoCRA added contact-info requirements (effective Dec 2024). Applies to products sold/distributed by med spas. |
| I | G | 710 | Voluntary Registration of Cosmetic Establishments | YES | MODERATE | MS | **Superseded by MoCRA mandatory facility registration** (enforced July 1, 2024). Part remains in CFR but inactive; MoCRA mandatory registration is the current requirement. |
| I | G | 720 | Voluntary Filing of Cosmetic Product Ingredient Statements | YES | MODERATE | MS | **Superseded by MoCRA mandatory product listing.** Same status as Part 710 — replaced by statutory requirements. |
| I | G | 740 | Cosmetic Product Warning Statements | YES | HIGH | MS | Warning requirements for cosmetic products (pressurized containers, coal tar dyes, feminine deodorant sprays). Applicable to products used/sold by practices. |
| I | G | 741–799 | [Reserved] | NO | — | — | Reserved. MoCRA rulemaking (cosmetic GMPs, fragrance allergen disclosure, asbestos/talc testing) may populate these when finalized (~2025–2026). **Monitor for new rules.** |

**Session 1 ambiguity resolution:** Subchapter G is definitively **RELEVANT** for Med Spa/Aesthetic Medicine. MoCRA (enacted Dec 2022) imposed mandatory facility registration, product listing, serious adverse event reporting (15-day window), safety substantiation, and upcoming GMP requirements. Med spas routinely use, sell, and sometimes private-label cosmetic products. The cosmetic-vs-drug distinction is fundamental to aesthetic practice compliance.

### Subchapter H: Medical Devices (Parts 800–898)

| Chapter | Subchapter | Part | Part Description | Relevant? | Relevance Level | Cedar Practice Types Affected | Notes |
|---------|-----------|------|-----------------|-----------|-----------------|-------------------------------|-------|
| I | H | 800 | General | YES | MODERATE | ALL device-using | General device provisions, exemptions, specific requirements. |
| I | H | 801 | Labeling | YES | MODERATE | ALL device-using | Comprehensive device labeling. Important for practices distributing/reselling devices. |
| I | H | 803 | Medical Device Reporting (MDR) | YES | **CRITICAL** | ALL device-using | **Mandatory reporting of device-related deaths, serious injuries, malfunctions.** User facilities (clinics) must report deaths to FDA+manufacturer and serious injuries to manufacturer within **10 work days.** |
| I | H | 806 | Reports of Corrections and Removals | YES | LOW | MS, PM, RM | Primarily manufacturers/importers. Practices affected when receiving recall notices. |
| I | H | 807 | Establishment Registration / Device Listing / 510(k) | YES | HIGH | CP, MS, RM | **Includes premarket notification (510(k)) in Subpart E.** Critical for understanding device clearance status. Relevant if practice modifies/reprocesses devices. |
| I | H | 808 | Exemptions from Federal Preemption | YES | LOW | ALL | Interplay of federal device regulation with Florida state requirements. |
| I | H | 809 | In Vitro Diagnostic Products | YES | MODERATE | PC, IV, RM | **IVD regulation for point-of-care and lab tests.** Relevant to practices with in-house diagnostics. |
| I | H | 810 | Medical Device Recall Authority | YES | HIGH | ALL device-using | **FDA mandatory recall authority.** All practices must understand recall procedures and response obligations. |
| I | H | 812 | Investigational Device Exemptions (IDE) | YES | HIGH | RM, MS, PM | **Critical for practices in clinical trials** for investigational devices (PRP devices, novel energy devices, neuromodulation). |
| I | H | 814 | Premarket Approval (PMA) | YES | MODERATE | ALL device-using | PMA for Class III devices. Includes Humanitarian Device Exemptions (HDE). Relevant for verifying legal marketing status of high-risk devices. |
| I | H | 820 | Quality System Regulation (QSR) | YES | MODERATE | CP, MS, RM | **Device cGMP.** Updated QMSR harmonized with ISO 13485, effective Feb 2026. Primarily manufacturers, but practices servicing/reprocessing devices must be aware. |
| I | H | 821 | Medical Device Tracking | YES | MODERATE | PM, RM | Tracking for life-sustaining/implantable devices. Relevant to practices implanting tracked devices (spinal cord stimulators). |
| I | H | 822 | Postmarket Surveillance | YES | LOW | ALL device-using | May require practice cooperation with manufacturer postmarket studies. |
| I | H | 830 | Unique Device Identification (UDI) | YES | MODERATE | ALL device-using | **UDI system for device identification.** Practices should maintain UDI records, especially for implantables. EHR integration increasingly expected. |
| I | H | 860 | Medical Device Classification Procedures | YES | MODERATE | ALL device-using | **Class I/II/III classification framework.** Critical for understanding regulatory requirements for devices used in practice. |
| I | H | 861 | Procedures for Performance Standards Development | NO | — | — | Internal FDA procedural rules. |
| I | H | 862 | Clinical Chemistry and Clinical Toxicology Devices | YES | MODERATE | PC, IV, RM, FM | Blood chemistry analyzers, glucose monitors, toxicology screening. Relevant for in-house labs and point-of-care testing. |
| I | H | 864 | Hematology and Pathology Devices | YES | HIGH | PC, RM, IV | Blood cell counters, coagulation instruments, **centrifuges (including PRP preparation devices).** Critical for regenerative medicine practices using PRP. |
| I | H | 866 | Immunology and Microbiology Devices | YES | LOW | PC | Immunoassay systems, rapid test kits. Relevant if practice performs immunological testing. |
| I | H | 868 | Anesthesiology Devices | YES | HIGH | PM, MS, IV | Anesthesia machines, pulse oximeters, capnography, oxygen delivery. **Critical for any practice performing procedures under sedation** including med spa deep sedation. |
| I | H | 870 | Cardiovascular Devices | YES | HIGH | PC, PM, IV | BP monitors, ECG, cardiac monitors, defibrillators, **infusion pumps.** IV therapy infusion pumps classified here. |
| I | H | 872 | Dental Devices | NO | — | — | Dental-specific. Not relevant to Cedar's practice types. |
| I | H | 874 | Ear, Nose, and Throat Devices | NO | — | — | ENT-specific. Not relevant. |
| I | H | 876 | Gastroenterology-Urology Devices | YES | LOW | PC | Endoscopes, catheters. Limited relevance unless practice includes GI/urology. |
| I | H | 878 | General and Plastic Surgery Devices | YES | **CRITICAL** | MS, RM | **Most important device part for med spas.** Surgical lasers, liposuction devices, tissue expanders, electrosurgical devices, dermabrasion, RF/ultrasound aesthetic devices. Many energy-based aesthetic devices classified here. |
| I | H | 880 | General Hospital and Personal Use Devices | YES | HIGH | ALL | Examination gloves, surgical masks, scales, thermometers, sterilization equipment, syringes, needles, sharps containers. **Essential for all clinical settings.** |
| I | H | 882 | Neurological Devices | YES | **CRITICAL** | PM, CH | **TENS units, spinal cord stimulators, nerve stimulators, cranial electrotherapy, biofeedback.** Critical for pain management and chiropractic. |
| I | H | 884 | Obstetrical and Gynecological Devices | NO | — | — | OB/GYN-specific. Not relevant. |
| I | H | 886 | Ophthalmic Devices | NO | — | — | Ophthalmology-specific. Not relevant. |
| I | H | 888 | Orthopedic Devices | YES | MODERATE | PM, CH | Orthopedic implants, joint replacements, spinal devices, braces. Relevant for pain management and chiropractic. |
| I | H | 890 | Physical Medicine Devices | YES | **CRITICAL** | PM, CH, RM, MS | **Therapeutic ultrasound, diathermy, traction, iontophoresis, muscle stimulators, infrared/UV lamps, compression devices.** Critical for chiropractic, pain management, and physical-therapy-adjacent practices. |
| I | H | 892 | Radiology Devices | YES | MODERATE | PC, PM, CH | X-ray systems, fluoroscopy, CT, MRI, ultrasound imaging. Relevant for practices with diagnostic imaging (chiropractic X-ray, pain management fluoroscopy). |
| I | H | 895 | Banned Devices | YES | MODERATE | ALL device-using | **Devices banned by FDA** (prosthetic hair fibers, powdered surgical/exam gloves). All practices must ensure no banned devices in use. |
| I | H | 898 | Performance Standard for Electrode Lead Wires | YES | LOW | PM, CH | Performance standard for electrode leads/cables. Relevant for electrotherapy and neurostimulation practices. |

### Subchapter I: Mammography Quality Standards Act (Part 900)

| Chapter | Subchapter | Part | Part Description | Relevant? | Relevance Level | Cedar Practice Types Affected | Notes |
|---------|-----------|------|-----------------|-----------|-----------------|-------------------------------|-------|
| I | I | 900 | Mammography | NO | — | — | **CONFIRMED IRRELEVANT.** MQSA accreditation/certification for mammography facilities. None of Cedar's 14 practice types perform mammography. |

### Subchapter J: Radiological Health (Parts 1000–1050) — Session 1 AMBIGUOUS → resolved RELEVANT

| Chapter | Subchapter | Part | Part Description | Relevant? | Relevance Level | Cedar Practice Types Affected | Notes |
|---------|-----------|------|-----------------|-----------|-----------------|-------------------------------|-------|
| I | J | 1000 | General | YES | LOW | MS, CH, PC | General provisions, definitions, radiation protection recommendations. Framework for any practice using radiation-emitting electronic products. |
| I | J | 1002 | Records and Reports | YES | LOW | MS, CH, PC | Manufacturer reporting requirements. Practices should confirm purchased devices comply; they are notification recipients, not obligated filers. |
| I | J | 1003 | Notification of Defects or Failure to Comply | NO | — | — | Manufacturer obligation only. |
| I | J | 1004 | Repurchase, Repairs, or Replacement | NO | — | — | Manufacturer obligation only. |
| I | J | 1005 | Importation of Electronic Products | YES | LOW | MS (if importing) | Relevant only if practice directly imports laser/electronic devices from foreign manufacturers. |
| I | J | 1010 | Performance Standards — General | YES | MODERATE | MS, CH, PC | **Certification (§1010.2), identification (§1010.3), variances (§1010.4).** Practices using laser/X-ray devices should verify proper FDA certification labels. |
| I | J | 1020 | Performance Standards for Ionizing Radiation Emitting Products | YES | **CRITICAL** | CH, PC, PM | **Diagnostic X-ray standards.** §1020.30 (diagnostic X-ray systems), §1020.31 (radiographic equipment), §1020.32 (fluoroscopic equipment), §1020.33 (CT). **Chiropractic practices with X-ray must comply.** Primary care and pain management with in-office imaging also subject. |
| I | J | 1030 | Performance Standards for Microwave/RF Emitting Products | YES | LOW | PM, IM | Covers microwave ovens (§1030.10). Low practical relevance; therapeutic RF devices regulated under Subchapter H. |
| I | J | 1040 | Performance Standards for Light-Emitting Products | YES | **CRITICAL** | MS, AA, PM, IM | **Laser product standards (§1040.10, §1040.11).** Med spas extensively use Class III/IV lasers for hair removal, skin resurfacing, tattoo removal, photofacials. All laser devices must comply. §1040.20 covers sunlamp/UV tanning products. |
| I | J | 1050 | Performance Standards for Sonic/Ultrasonic Products | YES | LOW | PM, CH, RM | Placeholder; no specific standards codified. If promulgated, would affect therapeutic ultrasound. |

**Session 1 ambiguity resolution:** Subchapter J is definitively **RELEVANT**. Part 1020 (X-ray standards) applies to chiropractic and primary care; Part 1040 (laser standards) applies directly to med spas and aesthetic practices. These are not optional — they are mandatory performance standards for devices already in wide use by Cedar's target practices.

### Subchapter K: Tobacco Products (Parts 1100–1150)

| Chapter | Subchapter | Part Range | Part Description | Relevant? | Relevance Level | Cedar Practice Types Affected | Notes |
|---------|-----------|-----------|-----------------|-----------|-----------------|-------------------------------|-------|
| I | K | 1100–1150 | Tobacco product general provisions, premarket submissions, SE reports, PMTAs, sale/distribution restrictions, warning requirements, user fees | NO | — | — | **CONFIRMED IRRELEVANT.** 8 parts (1100, 1105, 1107, 1114, 1140, 1141, 1143, 1150). None of Cedar's practice types manufacture, distribute, or retail tobacco products. Entire subchapter excluded. |

### Subchapter L: Regulations Under Certain Other Acts (Parts 1210–1299)

| Chapter | Subchapter | Part | Part Description | Relevant? | Relevance Level | Cedar Practice Types Affected | Notes |
|---------|-----------|------|-----------------|-----------|-----------------|-------------------------------|-------|
| I | L | 1210 | Regulations Under the Federal Import Milk Act | NO | — | — | Milk importation permits. |
| I | L | 1230 | Regulations Under the Federal Caustic Poison Act | NO | — | — | Caustic/corrosive substance labeling. Household chemicals. |
| I | L | 1240 | Control of Communicable Diseases | YES | LOW | PC, IM, ALL clinical | PHS Act communicable disease control authority. General framework; primarily targets interstate conveyances and public health infrastructure. Low practical impact for most Cedar practices but provides FDA authority over communicable disease measures. |
| I | L | 1250 | Interstate Conveyance Sanitation | NO | — | — | Sanitation for airlines, trains, buses, ships. |
| I | L | 1251–1270 | [Reserved] | NO | — | — | **Part 1270 (Human Tissue for Transplantation) has been REVOKED** (consolidated into Part 1271). All parts in range now reserved. |
| I | L | 1271 | Human Cells, Tissues, and Cellular and Tissue-Based Products (HCT/Ps) | YES | **CRITICAL** | RM, MS, AA, PM, IM, FM, CP | **Among the most important parts in all of Title 21 for Cedar.** Comprehensive HCT/P regulatory framework. **§1271.10** defines "361 HCT/Ps" (minimally manipulated, homologous use, not combined, no systemic effect). **§1271.15** exceptions (autologous use in same surgical procedure). §1271.20 addresses non-compliant HCT/Ps (regulated as drugs/devices/biologics). Subparts B (registration), C (donor eligibility), D (Current Good Tissue Practice), E (adverse event reporting, labeling), F (inspection/enforcement). Directly governs stem cell therapies, amniotic tissue, exosomes, umbilical cord products, PRP when more than minimally manipulated. |
| I | L | 1272–1299 | [Reserved] | NO | — | — | No content. |

---

## Chapter II — DEA (Parts 1300–1321)

| Chapter | Subchapter | Part | Part Description | Relevant? | Relevance Level | Cedar Practice Types Affected | Notes |
|---------|-----------|------|-----------------|-----------|-----------------|-------------------------------|-------|
| II | — | 1300 | Definitions | YES | HIGH | ALL prescribing | Foundational definitions for controlled substance regulation. Required context for all subsequent DEA parts. |
| II | — | 1301 | Registration of Manufacturers, Distributors, and Dispensers of Controlled Substances | YES | **CRITICAL** | ALL prescribing, esp. PM, WM, HRT, PC, CP | **DEA registration requirements.** Every practice prescribing/dispensing controlled substances must register. Includes security requirements, employee screening, modification/transfer provisions. |
| II | — | 1302 | Labeling and Packaging Requirements for Controlled Substances | YES | HIGH | CP, ALL dispensing | **Labeling/packaging for controlled substances.** Relevant to compounding pharmacies and any practice dispensing (not just prescribing) controlled substances. |
| II | — | 1303 | Quotas | NO | — | — | Manufacturing/procurement quotas for Schedule I/II substances. Applies to manufacturers, not prescribers/dispensers. |
| II | — | 1304 | Records and Reports of Registrants | YES | **CRITICAL** | ALL prescribing, esp. PM, WM, HRT, PC, CP | **Recordkeeping requirements for controlled substances.** Inventory requirements, continuing records, dispensing records, reporting theft/loss. All DEA-registered practices must comply. |
| II | — | 1305 | Orders for Schedule I and II Controlled Substances | YES | HIGH | CP, PM, PC | **DEA Form 222 / CSOS requirements** for ordering Schedule I/II substances. Relevant to any practice/pharmacy that orders Schedule I/II drugs. |
| II | — | 1306 | Prescriptions | YES | **CRITICAL** | ALL prescribing (PM, WM, HRT, PC, FM, IM, AA, PT, MS, CH, TH) | **Core prescribing rules for controlled substances.** Schedule II prescriptions (§1306.11–1306.15), Schedule III–V prescriptions (§1306.21–1306.27), including refill limits, partial fills, emergency dispensing, facsimile prescriptions. Applies to every practice that prescribes controlled substances. **Telehealth prescribing** of controlled substances has special considerations here. |
| II | — | 1307 | Miscellaneous | YES | MODERATE | ALL prescribing | Miscellaneous provisions including status of scheduled substances, exempted chemical preparations, disposal procedures. |
| II | — | 1308 | Schedules of Controlled Substances | YES | **CRITICAL** | ALL prescribing | **The actual drug schedules (I–V).** Lists every controlled substance by schedule. Essential reference for all prescribing practices. Weight management drugs (phentermine — Sch. IV), pain medications (opioids — Sch. II), testosterone (Sch. III — relevant to HRT), benzodiazepines (Sch. IV), and others. |
| II | — | 1309 | Registration of Manufacturers, Distributors, Importers and Exporters of List I Chemicals | NO | — | — | List I chemical precursor registration. Applies to chemical suppliers, not medical practices. |
| II | — | 1310 | Records and Reports of Listed Chemicals and Certain Machines | NO | — | — | Precursor chemical records/reports. Not applicable to medical practices. |
| II | — | 1311 | Requirements for Electronic Orders and Prescriptions | YES | **CRITICAL** | ALL prescribing, esp. TH, PM, PC, WM, HRT | **Electronic prescribing of controlled substances (EPCS).** Application provider requirements, pharmacist responsibilities, identity verification, digital signatures. **Critical for telehealth** practices prescribing controlled substances electronically. Florida's EPCS mandate makes this directly applicable. |
| II | — | 1312 | Importation and Exportation of Controlled Substances | NO | — | — | Import/export of controlled substances. Not applicable to domestic medical practices. |
| II | — | 1313 | Importation and Exportation of List I and List II Chemicals | NO | — | — | Chemical precursor import/export. |
| II | — | 1314 | Retail Sale of Scheduled Listed Chemical Products | YES | LOW | PC, CP | **Combat Methamphetamine Epidemic Act (CMEA)** requirements for behind-the-counter pseudoephedrine sales. Relevant if pharmacy/practice sells scheduled listed chemical products. |
| II | — | 1315 | Importation and Production Quotas for Ephedrine, Pseudoephedrine, and Phenylpropanolamine | NO | — | — | Manufacturing quotas for specific chemicals. |
| II | — | 1316 | Administrative Functions, Practices, and Procedures | YES | LOW | ALL (if enforcement) | DEA administrative procedures including inspection authority, hearings, and subpoenas. Background awareness. |
| II | — | 1317 | Disposal | YES | HIGH | ALL prescribing, CP | **Controlled substance disposal requirements.** Reverse distributors, take-back events, on-site destruction. All practices maintaining controlled substance inventories must understand disposal obligations. |
| II | — | 1318 | Controls for Manufacturing of Marihuana | NO | — | — | Cannabis manufacturing controls. Not applicable to medical practices. |
| II | — | 1321 | DEA Mailing Addresses | NO | — | — | Administrative reference only. |
| II | — | 1322–1399 | [Reserved] | NO | — | — | No content. |

---

## Chapter III — ONDCP (Parts 1400–1499)

| Chapter | Subchapter | Part | Part Description | Relevant? | Relevance Level | Cedar Practice Types Affected | Notes |
|---------|-----------|------|-----------------|-----------|-----------------|-------------------------------|-------|
| III | — | 1400 | [Reserved] | NO | — | — | No content. |
| III | — | 1401 | Public Availability of Information | NO | — | — | ONDCP FOIA regulations. No application to medical practices. |
| III | — | 1402 | Mandatory Declassification Review | NO | — | — | ONDCP classification review procedures. |
| III | — | 1403–1499 | [Reserved] | NO | — | — | No content. |

**CONFIRMED IRRELEVANT.** ONDCP administrative housekeeping only. No regulatory impact on medical practices.

---

## The 30 highest-priority parts for Cedar's pipeline

For rapid implementation, these are the parts where Cedar should invest the deepest regulatory monitoring, ranked by breadth of practice-type impact and regulatory consequence:

| Rank | Part | Description | Tier | Practice Types |
|------|------|------------|------|----------------|
| 1 | **1271** | HCT/Ps (Human Cells, Tissues) | CRITICAL | RM, MS, AA, PM, IM, FM, CP |
| 2 | **1306** | Prescriptions (Controlled Substances) | CRITICAL | All 11 prescribing types + TH |
| 3 | **1308** | Schedules of Controlled Substances | CRITICAL | All prescribing |
| 4 | **1301** | DEA Registration | CRITICAL | All prescribing, CP |
| 5 | **1304** | DEA Records and Reports | CRITICAL | All prescribing, CP |
| 6 | **1311** | Electronic Orders and Prescriptions (EPCS) | CRITICAL | All prescribing, TH |
| 7 | **11** | Electronic Records / Electronic Signatures | CRITICAL | All 14 |
| 8 | **201** | Drug Labeling | CRITICAL | All prescribing, CP |
| 9 | **216** | Human Drug Compounding | CRITICAL | CP, HRT, PT, AA, FM, IM, RM, WM |
| 10 | **210–211** | Drug cGMP (General + Finished) | CRITICAL | CP, IV |
| 11 | **803** | Medical Device Reporting (MDR) | CRITICAL | All device-using |
| 12 | **50** | Protection of Human Subjects | CRITICAL | All research-active, esp. RM, PT |
| 13 | **56** | Institutional Review Boards | CRITICAL | All research-active |
| 14 | **600** | Biological Products: General | CRITICAL | RM, PT, IV, HRT, AA, MS |
| 15 | **601** | Biologics Licensing (BLA) | CRITICAL | RM, PT, IV, HRT, AA |
| 16 | **606** | Blood cGMP | CRITICAL | IV, RM, MS |
| 17 | **610** | General Biological Products Standards | CRITICAL | RM, PT, IV, HRT, AA, MS |
| 18 | **630** | Blood/Blood Component Requirements | CRITICAL | IV, RM, MS |
| 19 | **640** | Blood Product Standards (Platelets, Plasma) | CRITICAL | IV, RM, HRT, MS, AA |
| 20 | **878** | General/Plastic Surgery Devices | CRITICAL | MS, RM |
| 21 | **882** | Neurological Devices | CRITICAL | PM, CH |
| 22 | **890** | Physical Medicine Devices | CRITICAL | PM, CH, RM, MS |
| 23 | **1040** | Laser Product Standards | CRITICAL | MS, AA, PM |
| 24 | **1020** | X-ray Equipment Standards | CRITICAL | CH, PC, PM |
| 25 | **202** | Prescription Drug Advertising | HIGH | All prescribing, MS, WM, AA |
| 26 | **290** | Controlled Drugs | HIGH | PM, WM, HRT, PC |
| 27 | **111** | Dietary Supplement cGMP | CRITICAL | FM, IM, AA, WM, HRT, PT, CP |
| 28 | **190** | Dietary Supplements (NDI) | CRITICAL | FM, IM, AA, WM, PT, HRT, CP |
| 29 | **700–701** | Cosmetics General + Labeling | HIGH | MS |
| 30 | **1317** | Controlled Substance Disposal | HIGH | All prescribing, CP |

---

## How each practice type maps to regulatory exposure

The following summarizes the approximate number of directly relevant parts for each of Cedar's 14 target practice types, enabling engineering teams to weight monitoring intensity:

**Compounding Pharmacy** leads with approximately **55–60 relevant parts**, spanning drug cGMP, compounding rules, DEA registration, biologics (if compounding biologic-adjacent products), device regulations for compounding equipment, and supplement cGMP if producing supplements.

**Regenerative Medicine** follows closely at **50–55 parts**, driven by the biologics subchapter (600–680), HCT/P regulation (1271), device classification (864 for PRP centrifuges, 878 for surgical devices, 890), DEA parts (if using controlled substances), and human subjects research protections.

**Med Spa/Aesthetic Medicine** maps to **45–50 parts** across cosmetics (700–740 under MoCRA), devices (878 laser/energy devices, 890, 868 for sedation), biologics (PRP-related 606, 630, 640), radiological health (1040 lasers), HCT/Ps (1271 for amniotic tissue), and DEA parts if prescribing controlled substances.

**Pain Management** touches **40–45 parts**, concentrated in neurological devices (882), physical medicine devices (890), orthopedic devices (888), anesthesiology devices (868), radiological health (1020 for fluoroscopy), DEA controlled substance parts (1300–1317), and the OTC external analgesic monograph (348).

**All prescribing practice types** (HRT, FM, WM, PT, IV, IM, AA, PC, TH) share a common baseline of approximately **25–30 parts** covering drug labeling (201), advertising (202), PDMA (203), medication guides (208–209), controlled substances (DEA parts 1300–1317), electronic records (11), and enforcement (1, 7).

**Chiropractic** has the narrowest exposure at roughly **20–25 parts**, focused on device classification (882 neurological, 890 physical medicine, 888 orthopedic, 892 radiology), X-ray performance standards (1020), general enforcement, and DEA parts if prescribing.

**Telehealth** has a distinctive profile of approximately **20–25 parts**, uniquely weighted toward electronic records/signatures (Part 11), electronic prescribing of controlled substances (1311), prescribing rules (1306), and remote monitoring device classifications.

---

## Engineering implementation notes

**False-negative prevention strategy.** The table above errs toward inclusion per the task specification. Parts classified YES with LOW relevance can be assigned a lower monitoring priority in Cedar's pipeline but should not be excluded entirely. The CRITICAL and HIGH parts should trigger real-time Federal Register monitoring for proposed and final rules.

**Subchapter B optimization.** Of 100 part numbers (100–199), only **5 parts warrant inclusion** (101, 111, 119, 189, 190). The remaining 95 can be filtered at the subchapter+part level. This alone eliminates a significant volume of irrelevant entities from Cedar's 99K unclassified pool.

**Subchapter E and K full exclusion.** Both subchapters (animal drugs 500–599 and tobacco 1100–1150) can be excluded in their entirety at the subchapter level, requiring no part-level evaluation. Chapter III (ONDCP, 1400–1499) is similarly excludable at the chapter level.

**MoCRA monitoring imperative.** Subchapter G (Parts 700–799) has substantial reserved part numbers (741–799) that may be populated by upcoming MoCRA rulemakings for cosmetic GMPs, fragrance allergen disclosure, and talc/asbestos testing. Cedar should monitor Federal Register for proposed rules under these part numbers through 2026–2027.

**Part 1270 status update.** Part 1270 (Human Tissue Intended for Transplantation) has been **revoked and consolidated into Part 1271.** The 2025 published CFR shows Parts 1251–1270 as entirely reserved. All HCT/P classification logic should reference Part 1271 exclusively.

**OTC monograph reform.** Several OTC drug parts in Subchapter D (328–358) are undergoing reform under the OTC Monograph Reform Act provisions. Part 352 (sunscreen) is stayed indefinitely. Engineering should flag these parts for status monitoring rather than assuming static content.

**Newly effective rules.** Parts 213 (medical gas cGMP) and 230 (medical gas certification) became effective December 18, 2025, but are irrelevant to Cedar's practices. The QMSR update to Part 820 (effective February 2026) is relevant and should be tracked.

This allowlist provides the definitive part-level filtering logic for Title 21. When combined with Session 1's title-level and chapter-level classifications for the other 49 CFR titles, Cedar's classification pipeline can reduce the ~99K entity corpus to only the regulatory content that materially affects its 14 target Florida practice types.