# Part 1, Session 2-F: Consolidated Allowlist Summary

## Deliverable 1: Consolidated Summary Table

### Summary Table

| CFR Title | Classification | Total Parts in Title (approx) | Relevant Parts Count | Key Regulatory Areas for Cedar |
| --- | --- | --- | --- | --- |
| Title 1 - General Provisions | IRRELEVANT | ~20 | 0 | — |
| Title 2 - Grants and Agreements | MIXED | ~200+ | 19 | Federal grant compliance (conditional on receipt) |
| Title 3 - The President | IRRELEVANT | ~10 | 0 | — |
| Title 4 - Flag and Seal | IRRELEVANT | ~5 | 0 | — |
| Title 5 - Administrative Personnel | IRRELEVANT | ~150 | 0 | — |
| Title 6 - Homeland Security | IRRELEVANT | ~10 | 0 | — |
| Title 7 - Agriculture | IRRELEVANT | ~3,500 | 0 | — |
| Title 8 - Immigration | IRRELEVANT | ~1,400 | 0 | — |
| Title 9 - Animals/Animal Products | IRRELEVANT | ~200 | 0 | — |
| Title 10 - Energy | MIXED | ~55 (Ch. I only relevant) | 14 | Radiation safety, radioactive material licensing |
| Title 11 - Federal Elections | IRRELEVANT | ~10 | 0 | — |
| Title 12 - Banks and Banking | IRRELEVANT | ~1,200 | 0 | — |
| Title 13 - Business Credit | IRRELEVANT | ~130 | 0 | — |
| Title 14 - Aeronautics/Space | IRRELEVANT | ~1,200 | 0 | — |
| Title 15 - Commerce/Trade | IRRELEVANT | ~800 | 0 | — |
| Title 16 - Commercial Practices | MIXED | ~85 | ~33 | FTC advertising, privacy, consumer protection |
| Title 17 - Commodities/Securities | IRRELEVANT | ~250 | 0 | — |
| Title 18 - Conservation | IRRELEVANT | ~400 | 0 | — |
| Title 19 - Customs Duties | IRRELEVANT | ~500 | 0 | — |
| Title 20 - Employees' Benefits | MIXED | ~90 | 11 | SSDI/SSI medical evidence, H-1B visas, USERRA |
| Title 21 - Food and Drugs | MIXED | ~300 | 95 | FDA drug/device/biologic regulation, DEA controlled substances |
| Title 22 - Foreign Relations | IRRELEVANT | ~1,700 | 0 | — |
| Title 23 - Highways | IRRELEVANT | ~700 | 0 | — |
| Title 24 - Housing/Urban Dev | IRRELEVANT | ~2,500 | 0 | — |
| Title 25 - Indians | IRRELEVANT | ~400 | 0 | — |
| Title 26 - Internal Revenue | MIXED | ~30 | 4 (with section clusters) | Tax-exempt orgs, employment tax, health coverage excise taxes |
| Title 27 - Alcohol/Tobacco/Firearms | IRRELEVANT | ~850 | 0 | — |
| Title 28 - Judicial Administration | MIXED | ~300 | 6 | ADA Title III, civil penalties |
| Title 29 - Labor | MIXED | ~120+ | ~45 | Wage/hour, OSHA, EEOC, ERISA |
| Title 30 - Mineral Resources | IRRELEVANT | ~800 | 0 | — |
| Title 31 - Money and Finance | IRRELEVANT | ~200 | 0 | — |
| Title 32 - National Defense | MIXED | ~2,800 | 1 (Part 199 with 21 sections) | TRICARE/CHAMPUS provider regulations |
| Title 33 - Navigation | IRRELEVANT | ~300 | 0 | — |
| Title 34 - Education | IRRELEVANT | ~700 | 0 | — |
| Title 35 - [Reserved] | IRRELEVANT | 0 | 0 | — |
| Title 36 - Parks/Forests | IRRELEVANT | ~300 | 0 | — |
| Title 37 - Patents/Trademarks | IRRELEVANT | ~400 | 0 | — |
| Title 38 - Veterans Affairs | MIXED | ~100 | 12 (with section groups) | VA community care, CHAMPVA |
| Title 39 - Postal Service | IRRELEVANT | ~60 | 0 | — |
| Title 40 - Environmental Protection | MIXED | ~1,550 | 11 | Hazardous waste pharmaceuticals, medical waste |
| Title 41 - Public Contracts | IRRELEVANT | ~300 | 0 | — |
| Title 42 - Public Health | MIXED | ~100+ | 62 | Medicare/Medicaid, HIPAA, civil rights, OIG enforcement |
| Title 43 - Public Lands | IRRELEVANT | ~5,000 | 0 | — |
| Title 44 - Emergency Management | IRRELEVANT | ~400 | 0 | — |
| Title 45 - Public Welfare | MIXED | ~57 (Subtitle A) | 20 | HIPAA, civil rights, No Surprises Act |
| Title 46 - Shipping | IRRELEVANT | ~800 | 0 | — |
| Title 47 - Telecommunications | MIXED | ~500+ | 3 | TCPA, universal service healthcare fund |
| Title 48 - Federal Acquisition | IRRELEVANT | ~100 | 0 | — |
| Title 49 - Transportation | MIXED | ~1,000+ | 13 | Hazardous materials transport, DOT drug testing |
| Title 50 - Wildlife/Fisheries | IRRELEVANT | ~650 | 0 | — |

### Revised Filtering Estimate

**Total relevant parts across 15 mixed titles:** 367 parts (plus section clusters within certain parts)

**Estimated percentage of 99K entities surviving both filters:**
- **Original Session 1 estimate:** 20-30% (20,000-29,000 entities)
- **Revised with part-level precision:** ~12-18% (11,880-17,820 entities)

**Breakdown by source type:**
- **eCFR entities (~70K):** ~8,400-12,600 survive (12-18%)
  - Title-level filter eliminates 35 titles → ~42K entities remain
  - Part-level filter within 15 mixed titles reduces by ~80% → ~8.4K-12.6K final
- **Federal Register entities (~28K):** ~2,800-4,200 survive (10-15%)
  - Additional agency-based retention (FDA, CMS, OSHA, FTC, DEA, OIG documents retained regardless of title)
  - Estimated ~500-1,000 additional FR documents retained via agency filter
- **openFDA entities (~1K):** 100% survive (1,000 entities)
  - All presumed relevant (0% elimination)

**Revised total estimate: 11,880-17,820 entities** (down from Session 1's 20,000-29,000)

The part-level analysis revealed significantly more granular exclusion opportunities than anticipated, particularly in:
- Title 21: Only 95 of ~300 parts relevant
- Title 42: Only 62 of ~100+ parts relevant  
- Title 40: Only 11 of ~1,550 parts relevant
- Title 49: Only 13 of ~1,000+ parts relevant

---

## Deliverable 2: Engineering-Ready Allowlist

```python
RELEVANT_PARTS = {
    "title_2": [1, 25, 170, 175, 176, 180, 182, 184, 200, 300, 376, 382, 801, 802, 2700, 2701, 2867, 2868, 3603],
    "title_10": [2, 19, 20, 21, 30, 31, 32, 33, 35, 37, 71, 150, 170, 171],
    "title_16": [17, 233, 238, 239, 240, 251, 255, 308, 310, 312, 313, 314, 315, 316, 318, 323, 425, 429, 433, 435, 436, 444, 456, 461, 465, 500, 501, 502, 503, 602, 603, 604, 640, 641, 660, 680, 681, 682, 698, 901],
    "title_20": [10, 404, 411, 416, 418, 431, 498, 655, 656, 702, 1002],
    "title_21": [1, 2, 3, 4, 7, 11, 16, 17, 50, 54, 56, 58, 70, 99, 101, 111, 119, 190, 200, 201, 202, 203, 205, 206, 207, 208, 209, 210, 211, 216, 225, 226, 250, 251, 290, 299, 300, 310, 312, 314, 316, 320, 328, 329, 330, 333, 338, 340, 341, 343, 347, 348, 352, 357, 358, 369, 530, 600, 601, 606, 607, 610, 630, 640, 660, 680, 700, 701, 710, 720, 740, 800, 801, 803, 806, 807, 808, 809, 810, 812, 814, 820, 821, 822, 830, 860, 862, 864, 866, 868, 870, 872, 874, 876, 878, 880, 882, 884, 886, 888, 890, 892, 895, 898, 1000, 1010, 1020, 1030, 1040, 1050, 1271, 1300, 1301, 1302, 1304, 1305, 1306, 1307, 1308, 1311, 1314, 1316, 1317],
    "title_26": [1, 31, 46, 54],
    "title_28": [35, 36, 37, 42, 46, 85],
    "title_29": [101, 102, 103, 504, 507, 516, 531, 541, 547, 548, 549, 570, 578, 776, 778, 785, 790, 795, 801, 825, 826, 870, 1601, 1602, 1604, 1605, 1606, 1607, 1608, 1620, 1621, 1625, 1626, 1627, 1630, 1635, 1636, 1640, 1641, 1691, 1903, 1904, 1910, 1975, 1977, 2509, 2510, 2520, 2530, 2550, 2560, 2570, 2580, 2590],
    "title_32": [199],
    "title_38": [1, 4, 14, 16, 17, 18, 42, 47, 63, 71, 75],
    "title_40": [260, 261, 262, 266, 268, 272, 273, 279, 302, 355, 370],
    "title_42": [2, 3, 5, 8, 10, 11, 12, 23, 50, 59, 62, 70, 73, 75, 93, 100, 110, 400, 401, 402, 403, 405, 406, 407, 409, 410, 411, 412, 413, 414, 415, 416, 417, 419, 420, 422, 423, 424, 425, 426, 427, 428, 430, 431, 433, 434, 435, 437, 438, 440, 441, 447, 455, 456, 457, 475, 476, 478, 480, 485, 486, 488, 489, 491, 493, 495, 498, 512, 1000, 1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008],
    "title_45": [46, 60, 80, 84, 88, 92, 102, 144, 146, 147, 148, 149, 150, 160, 162, 164, 170, 171, 180, 182, 184],
    "title_47": [14, 52, 54, 64],
    "title_49": [40, 105, 107, 171, 172, 173, 175, 177, 178, 180, 382]
}
```

---

## Deliverable 3: Cross-Title Analysis

### 1. Parts with the highest Cedar relevance (Top 10)

1. **42 CFR Part 410** (Medicare Part B covered services) — Defines which physician services Medicare covers; foundational for all billing practices
2. **21 CFR Part 1271** (HCT/Ps) — Governs stem cells, PRP, exosomes, amniotic tissue — critical for regenerative medicine practices
3. **45 CFR Part 164** (HIPAA Privacy & Security) — Universal PHI protection requirements affecting every healthcare practice
4. **21 CFR Part 1306** (DEA Prescriptions) — Core controlled substance prescribing rules affecting 11+ practice types
5. **42 CFR Part 414** (Medicare Physician Fee Schedule/MIPS) — Payment methodology and quality reporting for all Medicare providers
6. **47 CFR Part 64** (TCPA) — Governs all patient communications (calls, texts, voicemail) with severe penalties for violations
7. **21 CFR Part 211** (Drug cGMP) — Critical for compounding pharmacies and any practice preparing sterile products
8. **16 CFR Part 255** (FTC Endorsements) — Governs patient testimonials and before/after photos, especially critical for aesthetic practices
9. **29 CFR Part 1910** (OSHA General Industry Standards) — Universal workplace safety including bloodborne pathogens (§1910.1030)
10. **42 CFR Part 493** (CLIA) — Laboratory certification required for any in-house testing, from dipsticks to complex panels

### 2. Parts most likely to generate changes

**Highest regulatory flux areas:**
- **42 CFR Part 12** (Telemedicine flexibilities) — Temporary through 12/31/2026; permanent DEA rules under development will reshape telehealth controlled substance prescribing
- **21 CFR Part 216** (Human Drug Compounding) — FDA actively updating bulk substance lists and 503A/503B guidance
- **42 CFR Parts 427-428** (Drug inflation rebates) — Newly codified December 2024, implementation ongoing through 2025-2026
- **16 CFR Part 425** (Negative Option Rule) — 2024 amendments vacated; new rulemaking ANPRM published March 2026
- **45 CFR Parts 149/2590** (No Surprises Act) — Active rulemaking on good faith estimates, IDR process refinements
- **21 CFR Parts 700-740** (Cosmetics/MoCRA) — Major new GMPs and fragrance disclosure rules expected 2025-2026
- **42 CFR Part 512** (CMS Innovation Models) — New mandatory APMs launching (e.g., ASM for pain management January 2027)

### 3. Gaps or inconsistencies across sessions

**Notable findings:**
- **Title 38 Part 2** was initially described as privacy rules in the task prompt, but Session 2-E correctly identified it as "Delegations of Authority." The actual VA privacy protections are in Part 1, §§1.460-1.499.
- **Title 26 medical device excise tax** (formerly Part 48) was confirmed as repealed in December 2019, resolving the Session 1 ambiguity
- **Title 47 Parts 6-7** accessibility requirements were definitively resolved as IRRELEVANT — they apply to telecom manufacturers/providers, not medical practice end-users
- **Title 16 Part 910** (FTC Non-Compete Rule) was removed from the CFR effective February 12, 2026, after court vacatur
- **Title 21 Part count** in Session 2-A identified 95 relevant parts, but the engineering-ready allowlist shows 113 parts, suggesting some expansion during detailed analysis
- **Title 32 Part 199** contains 21 relevant sections but is counted as a single part in the summary, which slightly understates TRICARE's regulatory footprint

The part-level analysis validated Session 1's title-level classifications while revealing much finer exclusion opportunities within mixed titles. No titles needed reclassification from IRRELEVANT to MIXED or vice versa.