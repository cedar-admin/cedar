## Context from prior research sessions:

session_id: "P1_S1"
title: "CFR Title Classification for Florida Independent Medical Practices"
summary: |
  Comprehensive classification of all 50 CFR titles for relevance to Florida independent medical practices. 
  35 titles classified as IRRELEVANT (fully excludable at title level); 15 titles classified as MIXED 
  (requiring chapter-level analysis); zero titles fully RELEVANT. Title-level filtering projected to eliminate 
  55–65% of ~99K entities; subsequent part-level analysis of mixed titles expected to eliminate additional 
  10–15%, achieving 70–80% total elimination.

key_decisions:
  - decision: "35 CFR titles classified IRRELEVANT"
    value: [1, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15, 17, 18, 19, 22, 23, 24, 25, 27, 30, 31, 33, 34, 35, 36, 37, 39, 41, 43, 44, 46, 48, 50]
  
  - decision: "15 CFR titles classified MIXED"
    value: [2, 10, 16, 20, 21, 26, 28, 29, 32, 38, 40, 42, 45, 47, 49]
  
  - decision: "0 CFR titles classified RELEVANT"
    value: []
  
  - decision: "No title is 100% healthcare content"
    rationale: "Even high-relevance titles (21, 42, 45) contain irrelevant chapters (food labeling, welfare programs, research grants)"
  
  - decision: "High-value mixed titles (Tier 1)"
    value: 
      - "Title 21 (Food and Drugs)"
      - "Title 42 (Public Health and Welfare)"
      - "Title 45 (Public Welfare)"
    rationale: "FDA compliance, CMS participation, HIPAA, OIG enforcement"
  
  - decision: "Title-level filtering impact"
    estimated_elimination_percent: "55–65%"
    estimated_entities_eliminated: "55,000–64,000"
    baseline_corpus: "~99,000 entities"

data_structures:
  
  cfr_title_classification_master_table:
    metadata:
      total_titles: 50
      classification_date: "2024"
      scope: "Florida independent medical practices"
      irrelevant_count: 35
      mixed_count: 15
      relevant_count: 0
    
    classifications:
      
      - title_number: 1
        title_name: "General Provisions"
        classification: "IRRELEVANT"
        relevance: null
        rationale: "Governs Federal Register publication procedures and CFR administration. No healthcare content."
      
      - title_number: 2
        title_name: "Grants and Agreements"
        classification: "MIXED"
        relevance: "Low"
        rationale: "Chapter III contains HHS grant administration rules; 2 CFR Part 200 (Uniform Guidance) applies if a practice receives federal grants (e.g., HRSA). Most independent practices do not."
      
      - title_number: 3
        title_name: "The President"
        classification: "IRRELEVANT"
        relevance: null
        rationale: "Executive orders and presidential documents. No operational healthcare regulation."
      
      - title_number: 4
        title_name: "Accounts"
        classification: "IRRELEVANT"
        relevance: null
        rationale: "GAO operations and government accounting standards. No healthcare content."
      
      - title_number: 5
        title_name: "Administrative Personnel"
        classification: "IRRELEVANT"
        relevance: null
        rationale: "Entirely governs federal civil service employees. Even the EEOC chapter (LXII) only covers EEOC staff ethics; private-sector EEOC rules are in 29 CFR."
      
      - title_number: 6
        title_name: "Domestic Security"
        classification: "IRRELEVANT"
        relevance: null
        rationale: "DHS regulations (FOIA, chemical facilities, classified info). No healthcare or emergency health provisions found."
      
      - title_number: 7
        title_name: "Agriculture"
        classification: "IRRELEVANT"
        relevance: null
        rationale: "USDA programs including food stamps, school nutrition, organic labeling. Tangentially related to nutrition but does not regulate medical practices."
      
      - title_number: 8
        title_name: "Aliens and Nationality"
        classification: "IRRELEVANT"
        relevance: null
        rationale: "USCIS/ICE immigration regulations. I-9 employment verification is a universal employer requirement, not healthcare-specific."
      
      - title_number: 9
        title_name: "Animals and Animal Products"
        classification: "IRRELEVANT"
        relevance: null
        rationale: "APHIS animal welfare, FSIS meat inspection, veterinary biologics. All animal/veterinary regulation; human biological products are under 21 CFR."
      
      - title_number: 10
        title_name: "Energy"
        classification: "MIXED"
        relevance: "Low"
        rationale: "Parts 20 and 35 regulate medical use of radioactive materials and radiation safety. Florida is an NRC Agreement State. Relevant only to practices using radioactive isotopes (rare among target practice types)."
        relevant_parts:
          - part: 20
            name: "Standards for Protection Against Radiation"
            status: "RELEVANT"
          - part: 35
            name: "Medical Use of Byproduct Material"
            status: "RELEVANT"
      
      - title_number: 11
        title_name: "Federal Elections"
        classification: "IRRELEVANT"
        relevance: null
        rationale: "FEC campaign finance regulations. Zero healthcare relevance."
      
      - title_number: 12
        title_name: "Banks and Banking"
        classification: "IRRELEVANT"
        relevance: null
        rationale: "Banking and financial institution regulations. 12 CFR 1022 Subpart D (medical information in credit decisions) regulates banks, not medical practices."
      
      - title_number: 13
        title_name: "Business Credit and Assistance"
        classification: "IRRELEVANT"
        relevance: null
        rationale: "SBA loan programs and size standards. Applicable to all small businesses equally; no healthcare-specific compliance obligations."
      
      - title_number: 14
        title_name: "Aeronautics and Space"
        classification: "IRRELEVANT"
        relevance: null
        rationale: "FAA aviation regulations and NASA. No medical practice content."
      
      - title_number: 15
        title_name: "Commerce and Foreign Trade"
        classification: "IRRELEVANT"
        relevance: null
        rationale: "Census, NIST, export controls, foreign trade. NIST cybersecurity framework is referenced in HIPAA guidance but is not itself a regulatory requirement in Title 15."
      
      - title_number: 16
        title_name: "Commercial Practices"
        classification: "MIXED"
        relevance: "Moderate"
        rationale: "FTC Chapter I contains advertising/endorsement guides, telemarketing rules, health breach notification, subscription/negative-option rules, and debt collection practices directly applicable to medical practice marketing and billing. CPSC Chapter II is irrelevant."
      
      - title_number: 17
        title_name: "Commodity and Securities Exchanges"
        classification: "IRRELEVANT"
        relevance: null
        rationale: "SEC and CFTC securities/commodities regulation. No healthcare applicability."
      
      - title_number: 18
        title_name: "Conservation of Power and Water Resources"
        classification: "IRRELEVANT"
        relevance: null
        rationale: "FERC utility regulations. No healthcare content."
      
      - title_number: 19
        title_name: "Customs Duties"
        classification: "IRRELEVANT"
        relevance: null
        rationale: "Import/export tariff and customs regulations."
      
      - title_number: 20
        title_name: "Employees' Benefits"
        classification: "MIXED"
        relevance: "Low"
        rationale: "Chapter III (SSA) contains disability determination rules (relevant to practices performing disability evaluations) and Medicare subsidy provisions. Chapters I, II, IV–IX cover federal workers' comp, railroad retirement, and other programs irrelevant to private practices."
      
      - title_number: 21
        title_name: "Food and Drugs"
        classification: "MIXED"
        relevance: "High"
        rationale: "Core regulatory title. FDA drug regulation, DEA controlled substances, medical devices, biologics, compounding pharmacy rules, HCT/Ps (regenerative medicine). Also contains irrelevant chapters on food standards, animal drugs, tobacco products, and mammography."
      
      - title_number: 22
        title_name: "Foreign Relations"
        classification: "IRRELEVANT"
        relevance: null
        rationale: "State Department diplomatic and foreign service regulations."
      
      - title_number: 23
        title_name: "Highways"
        classification: "IRRELEVANT"
        relevance: null
        rationale: "Federal highway administration and road construction standards."
      
      - title_number: 24
        title_name: "Housing and Urban Development"
        classification: "IRRELEVANT"
        relevance: null
        rationale: "HUD programs. Parts 232/242 cover mortgage insurance for hospitals/nursing homes, but these regulate institutional facilities, not independent practices."
      
      - title_number: 25
        title_name: "Indians"
        classification: "IRRELEVANT"
        relevance: null
        rationale: "Bureau of Indian Affairs. Tribal health programs are governed under Title 42 IHS provisions, not here."
      
      - title_number: 26
        title_name: "Internal Revenue"
        classification: "MIXED"
        relevance: "Moderate"
        rationale: "Subchapter A contains healthcare-critical provisions: §199A QBI deduction for pass-through medical practices, §223 HSA rules, §105/106 employer health plans, §4980H ACA employer mandate, retirement plan rules. Subchapter C contains employment tax and worker classification rules (critical for 1099 providers). Estate/gift taxes, international treaties, and IRS internal operations are irrelevant."
      
      - title_number: 27
        title_name: "Alcohol, Tobacco Products and Firearms"
        classification: "IRRELEVANT"
        relevance: null
        rationale: "ATF/TTB regulations for alcohol, tobacco commerce, and firearms. All DEA/controlled substance regulations are in Title 21, not here. Confirmed zero healthcare overlap."
      
      - title_number: 28
        title_name: "Judicial Administration"
        classification: "MIXED"
        relevance: "Low"
        rationale: "Chapter I, Parts 35–36 implement ADA Title II (government services) and ADA Title III (public accommodations) — directly mandates accessibility for medical offices, patient communications, and telehealth platforms. All other chapters (prisons, courts, independent counsel) are irrelevant."
      
      - title_number: 29
        title_name: "Labor"
        classification: "MIXED"
        relevance: "High"
        rationale: "Four critically relevant chapters: Ch. V (FLSA wage/hour, FMLA), Ch. XIV (EEOC — ADA, GINA, anti-discrimination), Ch. XVII (OSHA — bloodborne pathogens §1910.1030, hazard communication, PPE), Ch. XXV (ERISA, COBRA, group health plans). Railroad, maritime, mining chapters are irrelevant."
      
      - title_number: 30
        title_name: "Mineral Resources"
        classification: "IRRELEVANT"
        relevance: null
        rationale: "MSHA mining regulations. No healthcare content."
      
      - title_number: 31
        title_name: "Money and Finance"
        classification: "IRRELEVANT"
        relevance: null
        rationale: "Treasury/FinCEN regulations. BSA/AML reporting is a general business obligation, not healthcare-specific."
      
      - title_number: 32
        title_name: "National Defense"
        classification: "MIXED"
        relevance: "Low–Moderate"
        rationale: "Part 199 (TRICARE/CHAMPUS) governs military healthcare program participation, provider eligibility, and reimbursement. Florida's substantial military population (MacDill AFB, NAS Jacksonville, Eglin AFB, Pensacola NAS) makes this relevant for practices accepting TRICARE. Most of the title (military operations, security) is irrelevant."
      
      - title_number: 33
        title_name: "Navigation and Navigable Waters"
        classification: "IRRELEVANT"
        relevance: null
        rationale: "Army Corps of Engineers and Coast Guard waterway regulations."
      
      - title_number: 34
        title_name: "Education"
        classification: "IRRELEVANT"
        relevance: null
        rationale: "K-12, higher education, FERPA, student loans, special education. All chapters govern educational institutions. No medical practice regulation."
      
      - title_number: 35
        title_name: "Panama Canal [Reserved]"
        classification: "IRRELEVANT"
        relevance: null
        rationale: "Entirely reserved; no content."
      
      - title_number: 36
        title_name: "Parks, Forests, and Public Property"
        classification: "IRRELEVANT"
        relevance: null
        rationale: "National Park Service, Forest Service, public property management."
      
      - title_number: 37
        title_name: "Patents, Trademarks, and Copyrights"
        classification: "IRRELEVANT"
        relevance: null
        rationale: "USPTO procedural regulations for IP filings."
      
      - title_number: 38
        title_name: "Pensions, Bonuses, and Veterans' Relief"
        classification: "MIXED"
        relevance: "Low"
        rationale: "Chapter I, Part 17 governs VA healthcare delivery and the Veterans Community Care Program (MISSION Act), which allows veterans to receive care from private providers. Part 2 adds supplemental privacy rules for veteran patient records. Chapter II (Armed Forces Retirement Home) is irrelevant."
      
      - title_number: 39
        title_name: "Postal Service"
        classification: "IRRELEVANT"
        relevance: null
        rationale: "USPS regulations for mail service operations."
      
      - title_number: 40
        title_name: "Protection of Environment"
        classification: "MIXED"
        relevance: "Low–Moderate"
        rationale: "Subchapter I (RCRA, Parts 239–299) governs hazardous waste management including pharmaceutical waste disposal, chemical waste from compounding, and universal waste rules. Subchapter J (Parts 300–399) covers emergency planning and chemical inventory reporting. All other subchapters (air, water, pesticides, noise, ocean dumping) are irrelevant."
      
      - title_number: 41
        title_name: "Public Contracts and Property Management"
        classification: "IRRELEVANT"
        relevance: null
        rationale: "Federal procurement and property management. Independent practices are not typically government contractors."
      
      - title_number: 42
        title_name: "Public Health and Welfare"
        classification: "MIXED"
        relevance: "High"
        rationale: "Core regulatory title. CMS Medicare/Medicaid (Ch. IV), CLIA laboratory requirements (Part 493), OIG anti-kickback/exclusions (Ch. V), substance use disorder confidentiality (Part 2), telemedicine flexibilities. Also contains irrelevant chapters: PHS Corps personnel, Indian Health Service, grants programs, public health research, facility construction."
      
      - title_number: 43
        title_name: "Public Lands: Interior"
        classification: "IRRELEVANT"
        relevance: null
        rationale: "Bureau of Land Management, Bureau of Reclamation."
      
      - title_number: 44
        title_name: "Emergency Management and Assistance"
        classification: "IRRELEVANT"
        relevance: null
        rationale: "FEMA disaster relief, flood insurance, fire prevention. No routine medical practice regulatory content. Temporary emergency waivers exist but are not standing compliance obligations."
      
      - title_number: 45
        title_name: "Public Welfare"
        classification: "MIXED"
        relevance: "High"
        rationale: "Subtitle A is critically relevant: HIPAA Privacy/Security/Breach Notification (Parts 160–164), No Surprises Act (Part 149), ONC Health IT/information blocking (Parts 170–171), Section 1557 nondiscrimination (Part 92), price transparency. Subtitle B is entirely irrelevant: welfare programs (TANF), refugee assistance, child support, arts/humanities, scholarships."
      
      - title_number: 46
        title_name: "Shipping"
        classification: "IRRELEVANT"
        relevance: null
        rationale: "Maritime vessel and shipping regulations. No healthcare content."
      
      - title_number: 47
        title_name: "Telecommunication"
        classification: "MIXED"
        relevance: "Low–Moderate"
        rationale: "Chapter I, Subchapter B contains TCPA implementation rules (Part 64, §64.1200) governing robocalls, autodialers, and text messaging — directly regulates patient outreach. Part 54 funds Rural Health Care telehealth infrastructure. Accessibility requirements (Parts 6–7) affect telehealth platforms. All other chapters (broadcast, safety radio, spectrum management) are irrelevant."
      
      - title_number: 48
        title_name: "Federal Acquisition Regulations System"
        classification: "IRRELEVANT"
        relevance: null
        rationale: "FAR for government procurement. Only relevant for federal contractors, which independent practices are not."
      
      - title_number: 49
        title_name: "Transportation"
        classification: "MIXED"
        relevance: "Low"
        rationale: "Part 173.197 specifically regulates packaging and transport of regulated medical waste. Parts 171–180 (Hazardous Materials Regulations) apply to transport of medical gases and sharps. Most practices contract with licensed waste haulers, but practices bear shipper responsibility."
      
      - title_number: 50
        title_name: "Wildlife and Fisheries"
        classification: "IRRELEVANT"
        relevance: null
        rationale: "Fish & Wildlife Service and NOAA Fisheries regulations."

  title_21_food_and_drugs_chapter_breakdown:
    title: "Title 21 — Food and Drugs (High relevance)"
    classification_summary: "MIXED / High"
    subchapters:
      
      - subchapter: "A"
        name: "General (Parts 1–99)"
        status: "RELEVANT"
        notes: "Part 11 (electronic records/signatures) critical for EHR compliance. Administrative procedures apply to all regulated entities."
      
      - subchapter: "B"
        name: "Food for Human Consumption (Parts 100–199)"
        status: "IRRELEVANT"
        notes: "Food labeling, nutritional quality, infant formula, food additives. Does not regulate dietary supplements marketed as such."
      
      - subchapter: "C"
        name: "Drugs: General (Parts 200–299)"
        status: "RELEVANT"
        notes: "Drug labeling, establishment registration, cGMP, prescription drug advertising. Affects all prescribing/dispensing practices."
      
      - subchapter: "D"
        name: "Drugs for Human Use (Parts 300–499)"
        status: "RELEVANT"
        notes: "NDAs, INDs, drug compounding rules (503A/503B). Critical for compounding pharmacy, HRT, peptide therapy, weight management."
      
      - subchapter: "E"
        name: "Animal Drugs, Feeds (Parts 500–599)"
        status: "IRRELEVANT"
        notes: "Veterinary drugs and animal feed."
      
      - subchapter: "F"
        name: "Biologics (Parts 600–680)"
        status: "RELEVANT"
        notes: "Blood products, vaccines, allergenic products, cellular/gene therapy. Critical for regenerative medicine (PRP, stem cells, exosomes)."
      
      - subchapter: "G"
        name: "Cosmetics (Parts 700–799)"
        status: "AMBIGUOUS"
        notes: "MoCRA expanded cosmetic regulation. Relevant to med spas selling/using cosmetic products. Drug/cosmetic boundary is key for aesthetic practices."
      
      - subchapter: "H"
        name: "Medical Devices (Parts 800–898)"
        status: "RELEVANT"
        notes: "Device classification, 510(k), QSR, labeling. Covers lasers, RF devices, infusion pumps, microneedling, body contouring equipment. Critical for med spas, IV therapy, pain management."
      
      - subchapter: "I"
        name: "Mammography (Part 900)"
        status: "IRRELEVANT"
        notes: "MQSA — not relevant to target practice types."
      
      - subchapter: "J"
        name: "Radiological Health (Parts 1000–1040)"
        status: "AMBIGUOUS"
        notes: "Performance standards for radiation-emitting products (lasers, X-ray). Relevant to med spas using laser devices and chiropractic X-ray."
      
      - subchapter: "K"
        name: "Tobacco Products (Parts 1100–1150)"
        status: "IRRELEVANT"
        notes: "Tobacco regulation."
      
      - subchapter: "L"
        name: "Other Acts (Parts 1210–1299)"
        status: "RELEVANT"
        notes: "Part 1271 (HCT/Ps) is critical for regenerative medicine — governs human tissue establishments, donor eligibility, cGTP. Part 1210 covers communicable disease regulations."
    
    chapter_ii_dea:
      name: "Chapter II — DEA, DOJ (Parts 1300–1399)"
      status: "RELEVANT"
      notes: "Controlled substance scheduling, prescriber registration, prescription requirements, record-keeping. Critical for HRT (testosterone = Schedule III), pain management, weight management, ketamine infusions."
    
    chapter_iii_ondcp:
      name: "Chapter III — Office of National Drug Control Policy (Parts 1400–1499)"
      status: "IRRELEVANT"
      notes: "HIDTA program administration; no direct provider-facing regulation."

  title_42_public_health_and_welfare_chapter_breakdown:
    title: "Title 42 — Public Health and Welfare (High relevance)"
    classification_summary: "MIXED / High"
    
    chapter_i_phs:
      name: "Chapter I — Public Health Service, HHS (Parts 2–399)"
      subchapters:
        
        - subchapter: "A"
          name: "General Provisions (Parts 2–12)"
          status: "RELEVANT"
          notes: "Part 2: SUD patient record confidentiality. Part 3: Patient Safety Organizations. Part 8: Opioid treatment programs. Part 10: 340B Drug Pricing. Part 11: Clinical trials registration. Part 12: Telemedicine flexibilities."
        
        - subchapter: "B"
          name: "Personnel (Parts 21–24)"
          status: "IRRELEVANT"
          notes: "PHS Commissioned Corps internal staffing."
        
        - subchapter: "C"
          name: "Medical Care and Examinations (Parts 31–37)"
          status: "IRRELEVANT"
          notes: "Medical care for PHS beneficiaries and federal employees."
        
        - subchapter: "D"
          name: "Grants (Parts 50–67)"
          status: "IRRELEVANT"
          notes: "Federal grant programs (maternal/child health, community health, NIH grants)."
        
        - subchapter: "E"
          name: "Fellowships, Internships (Part 68)"
          status: "IRRELEVANT"
          notes: "Federal training programs."
        
        - subchapter: "F"
          name: "Quarantine, Inspection, Licensing (Parts 70–80)"
          status: "AMBIGUOUS"
          notes: "Part 73 (Select Agents and Toxins) potentially relevant to regenerative medicine labs. Parts 70–71 (quarantine) are background."
        
        - subchapter: "G"
          name: "Occupational Safety Research (Parts 82–88)"
          status: "IRRELEVANT"
          notes: "NIOSH research activities, coal mine health."
        
        - subchapter: "H"
          name: "Health Assessments (Parts 90–93)"
          status: "IRRELEVANT"
          notes: "ATSDR Superfund site assessments."
        
        - subchapter: "I"
          name: "[Reserved]"
          status: "IRRELEVANT"
          notes: "Empty."
        
        - subchapter: "J"
          name: "Vaccines (Part 100)"
          status: "AMBIGUOUS"
          notes: "National Vaccine Injury Compensation Program. Relevant to practices administering vaccines."
        
        - subchapter: "K"
          name: "Health Resources Development (Parts 121–124)"
          status: "IRRELEVANT"
          notes: "Hill-Burton facility construction. Historical/administrative."
        
        - subchapter: "L"
          name: "Compassionate Payments (Part 130)"
          status: "IRRELEVANT"
          notes: "Ricky Ray Hemophilia Relief Fund."
        
        - subchapter: "M"
          name: "Indian Health Service (Parts 136–140)"
          status: "IRRELEVANT"
          notes: "IHS tribal health programs."
    
    chapter_iv_cms:
      name: "Chapter IV — CMS (Parts 400–600+)"
      subchapters:
        
        - subchapter: "A"
          name: "General Provisions (Parts 400–403)"
          status: "RELEVANT"
          notes: "CMS definitions, ACA provisions, federal/state relationships."
        
        - subchapter: "B"
          name: "Medicare Program (Parts 405–429)"
          status: "RELEVANT"
          notes: "Most critical subchapter for billing practices. Physician services (Part 410), physician fee schedule (Part 414), enrollment/billing (Part 424), telehealth, Medicare Advantage (Part 422), Part D (Part 423), ACOs (Part 425)."
        
        - subchapter: "C"
          name: "Medicaid (Parts 430–456)"
          status: "RELEVANT"
          notes: "State plan requirements, eligibility, managed care (Part 438), program integrity."
        
        - subchapter: "D"
          name: "CHIP (Part 457)"
          status: "AMBIGUOUS"
          notes: "Relevant only to pediatric-oriented practices."
        
        - subchapter: "E"
          name: "PACE (Part 460)"
          status: "IRRELEVANT"
          notes: "Program of All-Inclusive Care for the Elderly. Specialized program."
        
        - subchapter: "F"
          name: "Quality Improvement Organizations (Parts 475–480)"
          status: "AMBIGUOUS"
          notes: "Indirect quality oversight."
        
        - subchapter: "G"
          name: "Standards and Certification (Parts 482–498)"
          status: "RELEVANT"
          notes: "Part 493 (CLIA) is critical for in-house lab work (blood draws, hormone panels, point-of-care testing). Also covers hospital CoPs, ASC conditions, provider agreements, EHR incentive programs."
        
        - subchapter: "H"
          name: "Infrastructure and Models (Parts 505–512)"
          status: "AMBIGUOUS"
          notes: "CMS innovation models, APMs. Relevant to DPC practices in CMS models."
        
        - subchapter: "I"
          name: "Basic Health Program (Part 600)"
          status: "IRRELEVANT"
          notes: "State BHP administration."
    
    chapter_v_oig:
      name: "Chapter V — OIG–Health Care (Parts 1000–1008)"
      status: "RELEVANT"
      notes: "OIG exclusion authorities, Civil Monetary Penalties, Anti-Kickback Statute safe harbors (Part 1001) — critical for all medical practice referral relationships, marketing, and business arrangements."

  title_45_public_welfare_chapter_breakdown:
    title: "Title 45 — Public Welfare (High relevance)"
    classification_summary: "MIXED / High"
    
    subtitle_a_hhs:
      name: "Subtitle A — HHS (Parts 1–199)"
      subchapters:
        
        - subchapter: "A"
          name: "General Administration (Parts 1–99)"
          status: "AMBIGUOUS"
          notes: "Most is HHS internal administration. Part 46 (Common Rule — human subjects protections) matters for research practices. Part 92 (Section 1557 ACA nondiscrimination) applies to all providers receiving federal funds."
        
        - subchapter: "B"
          name: "Health Care Access (Parts 144–150)"
          status: "RELEVANT"
          notes: "HIPAA portability, insurance reform. Part 149 (No Surprises Act) is critical — balance billing prohibitions, good faith estimates for self-pay patients, price transparency."
        
        - subchapter: "C"
          name: "HIPAA Administrative Data Standards (Parts 160–164)"
          status: "RELEVANT"
          notes: "The HIPAA regulations. Part 160 (general requirements, enforcement, penalties). Part 162 (transaction standards, NPI). Part 164 (Privacy Rule, Security Rule, Breach Notification Rule). Universal applicability to every medical practice."
        
        - subchapter: "D"
          name: "Health Information Technology (Parts 170–171)"
          status: "RELEVANT"
          notes: "ONC Health IT Certification (Part 170). Part 171 (information blocking) applies to all healthcare providers."
        
        - subchapter: "E"
          name: "Price Transparency (Part 180+)"
          status: "RELEVANT"
          notes: "Hospital price transparency; principles extend to all providers."
    
    subtitle_b_public_welfare:
      name: "Subtitle B — Public Welfare (Chapters II–XXV)"
      status: "IRRELEVANT"
      notes: "All chapters cover welfare programs (TANF), refugee assistance, child support enforcement, National Science Foundation, arts/humanities, Corporation for National Service, scholarships, and similar non-healthcare programs. No chapters in Subtitle B are relevant."

  title_29_labor_chapter_breakdown:
    title: "Title 29 — Labor (High relevance)"
    classification_summary: "MIXED / High"
    chapters:
      
      - chapter: "Subtitle A"
        name: "Office of the Secretary (Parts 0–99)"
        status: "IRRELEVANT"
        notes: "DOL administrative rules, nondiscrimination for DOL grantees. Not applicable to private practices."
      
      - chapter: "I"
        name: "NLRB (Parts 100–199)"
        status: "RELEVANT"
        notes: "NLRA applies to all private-sector employers. Employee Section 7 rights (wage discussions, working conditions)."
      
      - chapter: "II"
        name: "Office of Labor-Management Standards (Parts 200–299)"
        status: "IRRELEVANT"
        notes: "Labor organization reporting."
      
      - chapter: "III"
        name: "National Railroad Adjustment Board (Parts 300–399)"
        status: "IRRELEVANT"
        notes: "Railroad industry."
      
      - chapter: "IV"
        name: "Labor-Management Standards (Parts 400–499)"
        status: "IRRELEVANT"
        notes: "Union reporting/disclosure."
      
      - chapter: "V"
        name: "Wage and Hour Division (Parts 500–899)"
        status: "RELEVANT"
        notes: "FLSA minimum wage, overtime, recordkeeping. Part 541 (exempt employee classification) is critical for determining NP/PA/office manager exemptions. Part 825 (FMLA) for practices with 50+ employees. Equal Pay Act. Employee Polygraph Protection Act."
      
      - chapter: "IX"
        name: "Construction Industry (Parts 900–999)"
        status: "IRRELEVANT"
        notes: "Construction industry collective bargaining."
      
      - chapter: "X"
        name: "National Mediation Board (Parts 1200–1299)"
        status: "IRRELEVANT"
        notes: "Railroad/airline labor disputes."
      
      - chapter: "XII"
        name: "Federal Mediation (Parts 1400–1499)"
        status: "IRRELEVANT"
        notes: "Labor dispute mediation."
      
      - chapter: "XIV"
        name: "EEOC (Parts 1600–1899)"
        status: "RELEVANT"
        notes: "Part 1630 (ADA) is critical for employee accommodation and office accessibility. Part 1635 (GINA) especially relevant for functional medicine/genetic testing practices. Parts 1604–1606 (sex, religious, national origin discrimination). Part 1636 (Pregnant Workers Fairness Act)."
      
      - chapter: "XVII"
        name: "OSHA (Parts 1900–1999)"
        status: "RELEVANT"
        notes: "§1910.1030 (Bloodborne Pathogens Standard) is the most critical OSHA standard for medical practices — exposure control plans, PPE, sharps disposal, Hep B vaccination. §1910.1200 (Hazard Communication/GHS) for chemical labeling. Part 1904 (injury/illness recordkeeping). §1910.134 (respiratory protection)."
      
      - chapter: "XX"
        name: "OSHRC (Parts 2000–2499)"
        status: "IRRELEVANT"
        notes: "OSHA citation appeals commission."
      
      - chapter: "XXV"
        name: "EBSA/ERISA (Parts 2500+)"
        status: "RELEVANT"
        notes: "ERISA compliance for practices offering employee benefits. COBRA (20+ employees). Part 2590 (group health plan rules) including ACA provisions, mental health parity, No Surprises Act provisions. Fiduciary duties for retirement plan administration."
      
      - chapter: "XXVII"
        name: "Mine Safety Review Commission (Parts 2700–2799)"
        status: "IRRELEVANT"
        notes: "Mining industry."
      
      - chapter: "XL"
        name: "PBGC (Parts 4000–4999)"
        status: "IRRELEVANT"
        notes: "Defined benefit pension insurance. Rare for small medical practices."

  title_26_internal_revenue_chapter_breakdown:
    title: "Title 26 — Internal Revenue (Moderate relevance)"
    classification_summary: "MIXED / Moderate"
    subchapters:
      
      - subchapter: "A"
        name: "Income Tax (Sections 1–18)"
        status: "RELEVANT"
        notes: "Section 199A (QBI deduction) critical for pass-through medical practices (SSTBs have income thresholds). Section 223 (HSA rules) directly relevant to DPC/concierge practices. Sections 105/106 (employer health plans). Section 125 (cafeteria plans/FSAs). Sections 401–420 (retirement plans). Section 501(c)(3) (tax-exempt healthcare entities). Section 4980H (ACA employer mandate) for 50+ FTE practices."
      
      - subchapter: "B"
        name: "Estate and Gift Taxes (Sections 20–29)"
        status: "IRRELEVANT"
        notes: "No healthcare-specific provisions."
      
      - subchapter: "C"
        name: "Employment Taxes (Sections 30–39)"
        status: "RELEVANT"
        notes: "FICA, FUTA, income tax withholding. Worker classification rules (employee vs. independent contractor) critical for practices using 1099 providers."
      
      - subchapter: "D"
        name: "Miscellaneous Excise Taxes (Sections 40–169)"
        status: "AMBIGUOUS"
        notes: "Part 54 (pension plan excise taxes) relevant for practices with retirement plans. Medical device excise tax largely suspended."
      
      - subchapter: "E"
        name: "[Reserved]"
        status: "N/A"
        notes: "Empty."
      
      - subchapter: "F"
        name: "Procedure and Administration (Sections 300–499)"
        status: "IRRELEVANT"
        notes: "General IRS procedural rules. Not healthcare-specific."
      
      - subchapter: "G"
        name: "Tax Conventions (Sections 500–599)"
        status: "IRRELEVANT"
        notes: "International tax treaties."
      
      - subchapter: "H"
        name: "Internal Revenue Practice (Sections 600–899)"
        status: "IRRELEVANT"
        notes: "IRS internal operations."

  title_16_commercial_practices_chapter_breakdown:
    title: "Title 16 — Commercial Practices (Moderate relevance)"
    classification_summary: "MIXED / Moderate"
    
    chapter_i_ftc:
      name: "Chapter I — FTC (Parts 0–999)"
      subchapters:
        
        - subchapter: "A"
          name: "Organization, Procedures (Parts 0–16)"
          status: "IRRELEVANT"
          notes: "FTC procedural framework. Background only."
        
        - subchapter: "B"
          name: "Guides and Trade Practice Rules (Parts 17–259)"
          status: "RELEVANT"
          notes: "Part 255 (Endorsement and Testimonial Guides) directly governs patient testimonials, influencer marketing, social media endorsements. Critical for med spa, weight management, anti-aging marketing."
        
        - subchapter: "C"
          name: "Consumer Protection Rules (Parts 300–399)"
          status: "RELEVANT"
          notes: "Part 310 (Telemarketing Sales Rule). Part 314 (Safeguards Rule) for financial data protection. Part 318 (Health Breach Notification Rule) for health apps/digital records not covered by HIPAA."
        
        - subchapter: "D"
          name: "Trade Regulation Rules (Parts 400–499)"
          status: "RELEVANT"
          notes: "Part 425 (Negative Option/Recurring Subscription Rule) directly affects DPC/concierge memberships, med spa memberships, weight management subscriptions. Part 435 (mail/internet order merchandise) for online supplement sales."
        
        - subchapter: "E"
          name: "Fair Packaging and Labeling (Parts 500–503)"
          status: "AMBIGUOUS"
          notes: "Marginally relevant for practices selling labeled products (supplements, skincare)."
        
        - subchapter: "F"
          name: "Fair Credit Reporting Act (Parts 600–698)"
          status: "AMBIGUOUS"
          notes: "Relevant if practices report unpaid bills to credit bureaus."
        
        - subchapter: "G"
          name: "Magnuson-Moss Warranty (Parts 700–703)"
          status: "IRRELEVANT"
          notes: "Product warranty disclosures."
        
        - subchapter: "H"
          name: "Hart-Scott-Rodino (Parts 801–803)"
          status: "IRRELEVANT"
          notes: "Pre-merger notification for large acquisitions."
        
        - subchapter: "I"
          name: "Fair Debt Collection (Parts 901–909)"
          status: "RELEVANT"
          notes: "Governs third-party debt collection for medical bills. Affects all practices using collection agencies."
        
        - subchapter: "J"
          name: "Unfair Competition Rules (Parts 910–999)"
          status: "AMBIGUOUS"
          notes: "FTC non-compete rule (if in effect) could affect physician employment agreements."
    
    chapter_ii_cpsc:
      name: "Chapter II — CPSC (Parts 1000+)"
      status: "IRRELEVANT"
      notes: "Consumer product safety standards; medical devices are FDA-regulated under Title 21."

  title_40_protection_of_environment_chapter_breakdown:
    title: "Title 40 — Protection of Environment (Low–Moderate relevance)"
    classification_summary: "MIXED / Low–Moderate"
    subchapters:
      
      - subchapter: "A"
        name: "General (Parts 1–31)"
        status: "IRRELEVANT"
        notes: "EPA administration."
      
      - subchapter: "B"
        name: "Grants (Parts 33–49)"
        status: "IRRELEVANT"
        notes: "EPA grant programs."
      
      - subchapter: "C"
        name: "Air Programs (Parts 50–99)"
        status: "IRRELEVANT"
        notes: "Air quality. Part 82 (refrigerants) marginally relevant for HVAC."
      
      - subchapter: "D"
        name: "Water Programs (Parts 100–149)"
        status: "IRRELEVANT"
        notes: "Clean Water Act."
      
      - subchapter: "E"
        name: "Pesticide Programs (Parts 150–189)"
        status: "IRRELEVANT"
        notes: "FIFRA."
      
      - subchapter: "F"
        name: "Radiation Protection (Parts 190–197)"
        status: "IRRELEVANT"
        notes: "Environmental radiation standards; medical radiation is in Title 10/21."
      
      - subchapter: "G"
        name: "Noise (Parts 201–211)"
        status: "IRRELEVANT"
        notes: "Noise standards."
      
      - subchapter: "H"
        name: "Ocean Dumping (Parts 220–238)"
        status: "IRRELEVANT"
        notes: "Marine disposal."
      
      - subchapter: "I"
        name: "Solid Wastes (Parts 239–299)"
        status: "RELEVANT"
        notes: "RCRA hazardous waste management. Parts 260–265 govern pharmaceutical waste disposal, chemical waste from compounding/IV prep, universal waste (Part 273 — batteries, mercury thermometers, pharmaceutical waste). Critical for compounding pharmacy, IV therapy, all practices generating pharma waste."
      
      - subchapter: "J"
        name: "Superfund/EPCRA (Parts 300–399)"
        status: "RELEVANT"
        notes: "Parts 355/370 (emergency planning, chemical inventory reporting). Applies if practices store threshold quantities of hazardous chemicals. Most relevant for compounding pharmacies with significant chemical inventories."
      
      - subchapter: "N–U"
        name: "Remaining subchapters"
        status: "IRRELEVANT"
        notes: "Industrial wastewater, sewage, fuel economy, mobile emissions."
    
    chapters_iv_vii_viii_ix:
      name: "Chapters IV, VII, VIII, IX"
      status: "IRRELEVANT"
      notes: "EPA enforcement coordination, military vessel discharges, Gulf restoration, federal permitting."

  title_47_telecommunication_chapter_breakdown:
    title: "Title 47 — Telecommunication (Low–Moderate relevance)"
    classification_summary: "MIXED / Low–Moderate"
    
    chapter_i_fcc:
      name: "Chapter I — FCC"
      subchapters:
        
        - subchapter: "A"
          name: "General (Parts 0–19)"
          status: "AMBIGUOUS"
          notes: "Parts 6–7 (accessibility for persons with disabilities) affect telehealth platforms."
        
        - subchapter: "B"
          name: "Common Carrier (Parts 20–69)"
          status: "RELEVANT"
          notes: "Part 64, §64.1200 (TCPA implementation) directly regulates robocalls, autodialed calls, prerecorded messages, and text messages — governs how ALL practices contact patients for appointments, marketing, and recalls. Part 54 (Universal Service, Rural Health Care Program) subsidizes broadband for rural healthcare providers. Part 52 (number portability) affects practice phone systems."
        
        - subchapter: "C"
          name: "Broadcast (Parts 70–79)"
          status: "IRRELEVANT"
          notes: "Radio/TV broadcasting."
        
        - subchapter: "D"
          name: "Safety/Special Radio (Parts 80–199)"
          status: "IRRELEVANT"
          notes: "Maritime, aviation, amateur radio."
    
    chapters_ii_v:
      name: "Chapters II–V"
      status: "IRRELEVANT"
      notes: "NTIA spectrum management, FirstNet, 911 grants."

  title_28_judicial_administration_chapter_breakdown:
    title: "Title 28 — Judicial Administration (Low relevance)"
    classification_summary: "MIXED / Low"
    
    chapter_i_doj:
      name: "Chapter I — DOJ (Parts 0–299)"
      status: "MIXED"
      notes: "Parts 35–36 (ADA implementation) are directly relevant — Part 36 mandates accessibility for medical offices (physical accessibility, communication accessibility for deaf/blind patients, website accessibility). Part 85 (civil monetary penalties/False Claims Act adjustments) provides enforcement context. All other parts (foreign agents, prisons, FOIA, classified info) are irrelevant."
    
    other_chapters:
      name: "Chapters III, V–IX, XI"
      status: "IRRELEVANT"
      notes: "Federal prisons, courts, independent counsel, DC probation."

  title_32_national_defense_chapter_breakdown:
    title: "Title 32 — National Defense (Low–Moderate relevance)"
    classification_summary: "MIXED / Low–Moderate"
    note: "Part 199 (TRICARE/CHAMPUS) is the sole relevant content. Governs provider eligibility, reimbursement rates, coverage determinations, preauthorization, and network participation for the military healthcare program. Florida's large military footprint makes this moderately relevant. All other parts (military operations, classified information, defense procurement) are irrelevant."
    part_199_tricare_champus:
      status: "RELEVANT"
      notes: "Military healthcare program participation, provider eligibility, reimbursement. Relevant to practices in areas with significant military presence (MacDill AFB, NAS Jacksonville, Eglin AFB, Pensacola NAS)."

  title_38_pensions_and_veterans_relief_chapter_breakdown:
    title: "Title 38 — Pensions, Bonuses, and Veterans' Relief (Low relevance)"
    classification_summary: "MIXED / Low"
    
    chapter_i_va:
      name: "Chapter I — VA"
      part_17_status: "RELEVANT"
      part_17_notes: "Governs VA healthcare delivery and Veterans Community Care Program (MISSION Act), which authorizes veterans to receive care from private providers with VA payment. Part 2 adds supplemental privacy rules for veteran records."
      other_parts_status: "IRRELEVANT"
      other_parts_notes: "Disability ratings, legal services, pensions are irrelevant."
    
    chapter_ii_armed_forces_retirement:
      name: "Chapter II — Armed Forces Retirement Home"
      status: "IRRELEVANT"
      notes: "No relevance to private medical practices."

  title_20_employees_benefits_chapter_breakdown:
    title: "Title 20 — Employees' Benefits (Low relevance)"
    classification_summary: "MIXED / Low"
    
    chapter_iii_ssa:
      name: "Chapter III (SSA, Parts 400–499)"
      status: "LIMITED RELEVANT"
      notes: "Disability determination rules (Parts 404, 416) affect practices performing disability evaluations. Part 498 covers civil monetary penalties for SSA fraud. Limited relevance only."
    
    chapter_v_unemployment:
      name: "Chapter V (Unemployment Insurance, H-1B)"
      status: "LIMITED RELEVANT"
      notes: "Minor relevance through unemployment insurance (all employers) and H-1B visa programs."
    
    other_chapters:
      name: "All other chapters"
      status: "IRRELEVANT"
      notes: "Workers' comp, railroad retirement, actuaries, veterans' employment. Note: Medicare provider enrollment/billing rules are in Title 42, not Title 20."

  filtering_algorithm:
    phase_1_title_level:
      name: "Title-level exclusion"
      logic: "IF entity.cfr_title IN irrelevant_titles THEN mark entity.relevance = 'IRRELEVANT'"
      irrelevant_titles: [1, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15, 17, 18, 19, 22, 23, 24, 25, 27, 30, 31, 33, 34, 35, 36, 37, 39, 41, 43, 44, 46, 48, 50]
      expected_elimination: "55–65% of entities (~55,000–64,000 of ~99,000)"
    
    phase_2_chapter_level:
      name: "Chapter/subchapter-level filtering within mixed titles"
      logic: "FOR each entity in MIXED titles: IF entity.chapter/subchapter matches irrelevant_segment THEN mark entity.relevance = 'IRRELEVANT' ELSE mark entity.relevance = 'REVIEW' or 'RELEVANT'"
      expected_elimination: "10–15% of remaining entities (~10,000–15,000 of ~35,000–44,000)"
      note: "Requires Session 2 part-level mapping data"

  entity_elimination_estimates:
    baseline_corpus: "~99,000 entities"
    data_sources:
      - source: "eCFR"
        estimated_irrelevant_portion: "60–70%"
        reason: "35 irrelevant titles include large-volume regulatory bodies (Agriculture, Banking, HUD, Parks, Shipping, etc.)"
      - source: "Federal Register"
        estimated_irrelevant_portion: "55–65%"
        reason: "Documents from non-healthcare agencies (DOT, DOD, DOI, EPA non-waste, USDA, banking regulators, FCC non-TCPA)"
      - source: "openFDA"
        estimated_irrelevant_portion: "0%"
        reason: "Entirely FDA-specific data (drug labels, adverse events, device recalls), maps to Title 21 content"
    
    phase_1_impact:
      entities_eliminated: "~55,000–64,000 (55–65%)"
      entities_remaining: "~35,000–44,000 (35–45%)"
    
    phase_2_impact:
      entities_eliminated: "~10,000–15,000 (10–15% of remaining)"
      entities_remaining: "~20,000–29,000 (20–29% of baseline)"
    
    combined_impact:
      total_eliminated: "~70,000–79,000 (70–80% of baseline)"
      total_remaining: "~20,000–29,000 (20–30% of baseline)"
      note: "Surviving entities represent genuinely healthcare-relevant regulatory corpus for independent medical practices"

  relevance_tier_stratification:
    purpose: "For engineering prioritization of the 15 mixed titles"
    
    tier_1_high_relevance_high_volume:
      name: "High relevance, large volume, immediate ROI"
      titles:
        - "Title 21 (Food and Drugs)"
        - "Title 42 (Public Health and Welfare)"
        - "Title 45 (Public Welfare)"
      notes: "FDA, DEA, biologics, devices, compounding. CMS, CLIA, OIG, telemedicine. HIPAA, No Surprises Act, Health IT."
    
    tier_2_moderate_relevance:
      name: "Moderate relevance, significant for practice operations"
      titles:
        - "Title 29 (Labor)"
        - "Title 26 (Internal Revenue)"
        - "Title 16 (Commercial Practices)"
        - "Title 40 (Protection of Environment)"
      notes: "OSHA, EEOC, FMLA, ERISA. QBI, HSA, ACA employer mandate, worker classification. FTC advertising, telemarketing, subscriptions. RCRA waste management."
    
    tier_3_low_relevance:
      name: "Low relevance, narrow applicability"
      titles:
        - "Title 47 (Telecommunication)"
        - "Title 28 (Judicial Administration)"
        - "Title 32 (National Defense)"
        - "Title 38 (Pensions/Veterans)"
        - "Title 20 (Employees' Benefits)"
        - "Title 49 (Transportation)"
        - "Title 10 (Energy)"
        - "Title 2 (Grants and Agreements)"
      notes: "TCPA patient communication. ADA accessibility. TRICARE participation. VA community care. SSA disability evaluations. Medical waste transport. Medical radiation safety. Federal grant administration."

cross_references:
  - references_session: "P1_S2"
    context: "Part-level filtering depends critically on this title classification. Session 2 will map irrelevant chapters/parts within the 15 MIXED titles to enable phase 2 entity elimination (~10–15% additional)."
  
  - references_session: "P1_S3"
    context: "Practice-type-specific filtering (e.g., med spa vs. primary care vs. DPC) will further refine relevance for Tier 2 and Tier 3 mixed titles based on which regulations apply to each practice model."
  
  - references_session: "Cedar_Engineering"
    context: "Implementation of phase 1 (title-level filtering) and phase 2 (chapter-level filtering) algorithms using the data structures and irrelevant_titles/irrelevant_chapters lists provided in this context pack."

implementation_notes:
  
  key_edge_cases:
    - case: "Cross-title healthcare references in irrelevant titles"
      example: "12 CFR 1022 Subpart D references medical information in credit decisions"
      handling: "Exclude — regulation targets banking industry, not medical practices"
    
    - case: "Federal Register documents from relevant agencies but unexpected title mapping"
      example: "FDA document appearing under unexpected title number"
      handling: "Match on issuing agency (FDA, CMS, OSHA, FTC, DEA, OIG) in addition to title number"
    
    - case: "openFDA entities"
      example: "Drug labels, adverse event reports, device recall data"
      handling: "Presume all relevant — map primarily to Title 21 content"
    
    - case: "Practice-type-specific regulations in mixed titles"
      example: "Title 10 radiation rules only relevant to rare practices; Title 32 TRICARE only if accepting military patients"
      handling: "Implement secondary relevance tag by practice type for granular filtering in future sessions"
  
  data_validation_checks:
    - "No entities from Title 21 Ch. II (DEA controlled substances) are excluded"
    - "No entities from 42 CFR Part 493 (CLIA laboratory requirements) are excluded"
    - "No entities from 45 CFR Parts 160–164 (HIPAA Privacy/Security/Breach Notification) are excluded"
    - "All entities from Title 36 (Parks and Forests) are excluded"
    - "All entities from Title 50 (Wildlife and Fisheries) are excluded"
    - "Federal Register documents from FDA, CMS, OSHA, FTC, DEA, and OIG are retained regardless of title mapping issues"
  
  performance_considerations:
    - "Phase 1 (title-level filtering) is extremely fast: single integer comparison per entity"
    - "Phase 2 (chapter-level filtering) requires mapping lookup: benchmark performance on full corpus before deployment"
    - "openFDA data source can be pre-filtered by FDA agency tag; eCFR and Federal Register require full filtering logic"
    - "Consider caching filtered results by data source to avoid re-filtering on subsequent runs"

quality_assurance:
  - "Manual spot-check of 10–20 entities from each irrelevant title to confirm exclusion correctness"
  - "Manual spot-check of 10–20 entities from each mixed title to confirm chapter-level classification"
  - "Verify that no critical healthcare regulation (HIPAA, CLIA, DEA, Medicare, OSHA bloodborne pathogens) is incorrectly filtered"
  - "Cross-reference against Cedar's known relevant entity corpus to ensure no false negatives"
```

---

## Summary of Critical Data Preserved

**Title-level classification (all 50 titles):** Complete table with classification, relevance tier, and rationale — verbatim.

**Chapter-level breakdowns (7 highest-value mixed titles):** Complete subchapter mappings with status tags (RELEVANT / IRRELEVANT / AMBIGUOUS) and domain-specific notes.

**Filtering algorithm:** Two-phase logic with irrelevant_titles list and expected elimination percentages.

**Entity elimination estimate:** Blended calculation across three data sources (eCFR, Federal Register, openFDA) with baseline, phase 1, and phase 2 impact.

**Relevance tier stratification:** Tier 1 (3 titles), Tier 2 (4 titles), Tier 3 (8 titles) for engineering prioritization.

**Cross-references:** Dependencies on Session 2 (part-level mapping) and Session 3 (practice-type refinement).

**Edge cases & validation:** Data validation checks and cross-title reference handling rules.
---
session_id: "P1_S3"
title: "Non-CFR Relevance Signals for Federal Register and openFDA Classification"
summary: "Delivered five interlocking components for classifying ~99K unclassified Federal Register and openFDA entities lacking clean CFR references: agency relevance map, keyword signal library (210 phrases), document type classifier, openFDA dataset map, and combined scoring model. Core finding: agency identity resolves ~60% of decisions, keywords handle ~25%, document type and openFDA filters close remaining gap. Composite model achieves 90%+ recall at threshold 0.50 (calibration) tightening to 0.60 (production) with 85-90% precision."

key_decisions:
  - decision: "6 High-relevance agencies identified"
    value:
      - food-and-drug-administration
      - centers-for-medicare-medicaid-services
      - drug-enforcement-administration
      - health-and-human-services-department
      - inspector-general-office-health-and-human-services-department
      - federal-trade-commission
  - decision: "10 Medium-relevance agencies identified"
    value:
      - occupational-safety-and-health-administration
      - centers-for-disease-control-and-prevention
      - health-resources-and-services-administration
      - substance-abuse-and-mental-health-services-administration
      - civil-rights-office-health-and-human-services-department
      - veterans-affairs-department
      - internal-revenue-service
      - national-institutes-of-health
      - federal-communications-commission
      - employee-benefits-security-administration
  - decision: "10 Low-relevance agencies identified"
    value:
      - environmental-protection-agency
      - justice-department
      - small-business-administration
      - management-and-budget-office
      - consumer-financial-protection-bureau
      - national-coordinator-for-health-information-technology-office
      - agency-for-healthcare-research-and-quality
      - labor-department
      - office-of-national-drug-control-policy
      - education-department
  - decision: "~345 agencies excluded from evaluation"
    rationale: "Defense, Energy, Interior, Transportation, Agriculture, State, Financial, Space, Government Operations, Intelligence, Housing, Courts, Arts, Defunct commissions, DOJ sub-agencies (except DEA), and borderline agencies"
  - decision: "210 keyword phrases classified into 12 domain areas plus 27 cross-domain specialty phrases"
    signal_distribution:
      - strong_signals: 154
      - moderate_signals: 56
      - homonym_risk_phrases: 42
  - decision: "42 keyword phrases flagged for homonym risk requiring disambiguation"
    rationale: "Risk of non-healthcare matches; require co-occurrence with healthcare context terms (patient, clinical, medical, healthcare, physician, pharmacy, drug, device, hospital, practitioner, health plan) or agency identifiers (FDA, DEA, CMS, OSHA, FTC, HHS, ONC, OCR, SAMHSA, AHRQ)"
  - decision: "Federal Register document type signal uses 4 API type enum values"
    api_types: [RULE, PRORULE, NOTICE, PRESDOCU]
    rationale: "Action field is free text; pipeline must use contains-matching not exact comparison"
  - decision: "RULE type documents always evaluated"
    value: "All subtypes (Final rule, Interim final, Direct final, Temporary final, etc.)"
  - decision: "NOTICE type documents classified into 3 tiers"
    tier_1_always_evaluated:
      - "Notice of proposed national coverage determination"
      - "Drug scheduling action"
      - "Notice of civil money penalty"
      - "Notice of exclusion"
      - "Notice of availability; final guidance"
    tier_2_if_relevant_agency:
      - "Notice of availability; draft guidance"
      - "Notice of determination"
      - "Request for comments"
      - "Notice of intent"
      - "Agency information collection activities"
      - "Notice of petition"
    tier_3_always_excluded:
      - "Notice of meeting / Meeting notice"
      - "Request for nominations"
      - "Grant/cooperative agreement funding"
      - "Delegation of authority"
      - "Privacy Act; System of Records Notice"
  - decision: "openFDA scoring uses separate classification path"
    rationale: "Apply dataset-specific field filters rather than composite scoring model; all openFDA data from High-relevance agency (FDA)"
  - decision: "Drug endpoints included in openFDA monitoring"
    value:
      - api.fda.gov/drug/label.json (High relevance)
      - api.fda.gov/drug/drugsfda.json (High relevance)
      - api.fda.gov/drug/enforcement.json (High relevance)
      - api.fda.gov/drug/event.json (Medium relevance)
      - api.fda.gov/drug/ndc.json (Medium relevance)
      - api.fda.gov/drug/shortages.json (High relevance)
  - decision: "Device endpoints included in openFDA monitoring"
    value:
      - api.fda.gov/device/510k.json (High relevance)
      - api.fda.gov/device/classification.json (Medium relevance)
      - api.fda.gov/device/event.json (Medium relevance)
      - api.fda.gov/device/enforcement.json (High relevance)
      - api.fda.gov/device/recall.json (Medium relevance)
      - api.fda.gov/device/pma.json (Low relevance)
  - decision: "Food/Other endpoints included in openFDA monitoring"
    value:
      - api.fda.gov/food/event.json (Medium relevance - dietary supplements, cosmetics only)
      - api.fda.gov/food/enforcement.json (Low relevance - dietary supplement recalls only)
      - api.fda.gov/other/substance.json (Low relevance - reference data)
      - api.fda.gov/other/unii.json (Low relevance - reference data)
  - decision: "Excluded openFDA endpoints"
    value:
      - api.fda.gov/device/registrationlisting.json
      - api.fda.gov/device/udi.json
      - api.fda.gov/device/covid19serology.json
      - api.fda.gov/other/historicaldocument.json
      - api.fda.gov/other/nsde.json
      - api.fda.gov/animalandveterinary/event.json
      - api.fda.gov/tobacco/problem.json
  - decision: "Composite relevance scoring model weights defined"
    agency_signal_weight: "0.0-0.45"
    keyword_signal_weight: "0.0-0.40"
    document_type_signal_weight: "0.0-0.15"
    bonus_modifiers_weight: "0.0-0.10"
    total_range: "0.0-1.0 (capped)"
  - decision: "Recommended scoring thresholds"
    threshold_0_60_production:
      classification: "Relevant"
      precision: "85-90%"
      recall: "75-80%"
      recommendation: "Production deployment"
    threshold_0_50_calibration:
      classification: "Default calibration"
      precision: "70-75%"
      recall: "90-95%"
      recommendation: "Initial data collection and model calibration"
    threshold_0_40_discovery:
      classification: "Permissive for discovery"
      precision: "55-60%"
      recall: "95%+"
      recommendation: "Training data collection only"
  - decision: "Special handling rules defined"
    cfr_override: "Documents with CFR references matching Session 1-2 filters bypass scoring model; route to CFR pipeline; add bonus B=0.10"
    excluded_agency_override: "If excluded agency scores ≥0.55 on K+D alone, flag for review rather than auto-exclude"
    openfda_override: "Use dataset endpoint + field filters, not keyword model"
    meeting_grant_exclusion_floor: "D=0.00 documents excluded unless K≥0.40"
    practice_type_assignment: "Based on keyword domain triggers and cross-domain specialty phrase matches"

data_structures:
  high_relevance_agencies:
    - agency_name: "Food and Drug Administration"
      api_slug: "food-and-drug-administration"
      parent: "HHS"
      relevance: "High"
      content_produced:
        - "Drug approvals"
        - "Compounding rules (503A/503B)"
        - "Biologics regulation"
        - "Device clearances"
        - "Enforcement actions"
        - "Guidance documents"
        - "Shortage determinations"
      practice_types_affected:
        - "Compounding Pharmacy"
        - "Peptide Therapy"
        - "Weight Management"
        - "HRT"
        - "Regenerative Medicine"
        - "Med Spa"
        - "IV Therapy"
        - "Anti-Aging"
        - "Functional Medicine"
    
    - agency_name: "Centers for Medicare & Medicaid Services"
      api_slug: "centers-for-medicare-medicaid-services"
      parent: "HHS"
      relevance: "High"
      content_produced:
        - "Physician Fee Schedule"
        - "Billing codes"
        - "Telehealth coverage"
        - "Quality programs (MIPS)"
        - "Coverage determinations"
        - "Payment models"
      practice_types_affected:
        - "Primary Care (DPC/Concierge)"
        - "Pain Management"
        - "Chiropractic"
        - "Telehealth"
        - "Integrative Medicine"
        - "All billing practices"
    
    - agency_name: "Drug Enforcement Administration"
      api_slug: "drug-enforcement-administration"
      parent: "DOJ"
      relevance: "High"
      content_produced:
        - "Controlled substance scheduling"
        - "DEA registration"
        - "Telemedicine prescribing rules"
        - "PDMP requirements"
        - "Ryan Haight Act enforcement"
      practice_types_affected:
        - "Telehealth"
        - "Pain Management"
        - "Weight Management"
        - "HRT (testosterone Schedule III)"
        - "Peptide Therapy"
        - "Functional Medicine"
    
    - agency_name: "Health and Human Services Department"
      api_slug: "health-and-human-services-department"
      parent: null
      relevance: "High"
      content_produced:
        - "Cross-cutting healthcare policy"
        - "HIPAA rules"
        - "No Surprises Act implementation"
        - "Broad rulemaking affecting all HHS sub-agencies"
      practice_types_affected:
        - "ALL 14 practice types"
    
    - agency_name: "Inspector General Office, HHS"
      api_slug: "inspector-general-office-health-and-human-services-department"
      parent: "HHS"
      relevance: "High"
      content_produced:
        - "Fraud enforcement"
        - "Anti-Kickback Statute advisory opinions"
        - "Exclusion actions (LEIE)"
        - "Compliance guidance"
        - "OIG Work Plan"
      practice_types_affected:
        - "ALL practice types billing federal programs"
        - "Telehealth"
        - "Weight Management"
        - "IV Therapy"
        - "Pain Management"
    
    - agency_name: "Federal Trade Commission"
      api_slug: "federal-trade-commission"
      parent: null
      relevance: "High"
      content_produced:
        - "Health advertising enforcement"
        - "Endorsement Guides"
        - "Health Breach Notification Rule"
        - "Click-to-cancel rules"
        - "Deceptive practice actions"
      practice_types_affected:
        - "Weight Management"
        - "Med Spa"
        - "Regenerative Medicine"
        - "Peptide Therapy"
        - "Anti-Aging"
        - "Functional Medicine"
        - "Telehealth"

  medium_relevance_agencies:
    - agency_name: "Occupational Safety and Health Administration"
      api_slug: "occupational-safety-and-health-administration"
      parent: "DOL"
      relevance: "Medium"
      content_produced:
        - "Bloodborne Pathogens Standard"
        - "PPE"
        - "Exposure control plans"
        - "Sharps safety"
        - "Workplace safety inspections"
      practice_types_affected:
        - "IV Therapy"
        - "Regenerative Medicine"
        - "Med Spa"
        - "Pain Management"
        - "Primary Care"
        - "Chiropractic"
    
    - agency_name: "Centers for Disease Control and Prevention"
      api_slug: "centers-for-disease-control-and-prevention"
      parent: "HHS"
      relevance: "Medium"
      content_produced:
        - "Clinical practice guidelines (opioid prescribing)"
        - "Immunization schedules"
        - "Infection control guidance"
      practice_types_affected:
        - "Primary Care"
        - "Pain Management"
        - "IV Therapy"
        - "Integrative Medicine"
        - "Functional Medicine"
    
    - agency_name: "Health Resources and Services Administration"
      api_slug: "health-resources-and-services-administration"
      parent: "HHS"
      relevance: "Medium"
      content_produced:
        - "340B Drug Pricing Program"
        - "Health workforce programs"
        - "NHSC loan repayment"
      practice_types_affected:
        - "Primary Care"
        - "Compounding Pharmacy"
        - "Integrative Medicine"
    
    - agency_name: "Substance Abuse and Mental Health Services Administration"
      api_slug: "substance-abuse-and-mental-health-services-administration"
      parent: "HHS"
      relevance: "Medium"
      content_produced:
        - "42 CFR Part 2 (SUD record confidentiality)"
        - "Buprenorphine prescribing"
        - "Mental health parity"
      practice_types_affected:
        - "Pain Management"
        - "Functional Medicine"
        - "Integrative Medicine"
        - "Telehealth"
    
    - agency_name: "Office for Civil Rights, HHS"
      api_slug: "civil-rights-office-health-and-human-services-department"
      parent: "HHS"
      relevance: "Medium"
      content_produced:
        - "HIPAA Privacy/Security Rule enforcement"
        - "Breach notification"
        - "Right of Access"
        - "Risk analysis requirements"
      practice_types_affected:
        - "ALL 14 practice types (any handling PHI)"
    
    - agency_name: "Veterans Affairs Department"
      api_slug: "veterans-affairs-department"
      parent: null
      relevance: "Medium"
      content_produced:
        - "Community Care Network participation"
        - "MISSION Act community care"
        - "VA scope-of-practice preemption"
      practice_types_affected:
        - "Primary Care"
        - "Pain Management"
        - "Chiropractic"
        - "Integrative Medicine"
        - "Telehealth"
        - "Weight Management"
    
    - agency_name: "Internal Revenue Service"
      api_slug: "internal-revenue-service"
      parent: "Treasury"
      relevance: "Medium"
      content_produced:
        - "HSA/HRA/FSA rules"
        - "ACA provisions"
        - "Medical expense deductions"
        - "Practice entity tax structure"
      practice_types_affected:
        - "Primary Care (DPC/Concierge)"
        - "Weight Management"
        - "ALL practice types (as businesses)"
    
    - agency_name: "National Institutes of Health"
      api_slug: "national-institutes-of-health"
      parent: "HHS"
      relevance: "Medium"
      content_produced:
        - "Research guidelines shaping evidence base"
        - "Institutes: NCCIH (integrative), NIA (anti-aging), NIDDK (weight), NIAMS (regenerative/pain)"
      practice_types_affected:
        - "Functional Medicine"
        - "Integrative Medicine"
        - "Anti-Aging"
        - "Weight Management"
        - "Regenerative Medicine"
        - "Pain Management"
    
    - agency_name: "Federal Communications Commission"
      api_slug: "federal-communications-commission"
      parent: null
      relevance: "Medium"
      content_produced:
        - "TCPA consent/revocation rules for patient communications"
        - "Telehealth broadband"
        - "AI-generated voice call rules"
      practice_types_affected:
        - "Telehealth"
        - "ALL practice types (patient communications/marketing)"
    
    - agency_name: "Employee Benefits Security Administration"
      api_slug: "employee-benefits-security-administration"
      parent: "DOL"
      relevance: "Medium"
      content_produced:
        - "ERISA health plan requirements"
        - "No Surprises Act implementation (joint with HHS/Treasury)"
      practice_types_affected:
        - "ALL practice types (as employers and providers billing health plans)"

  low_relevance_agencies:
    - agency_name: "Environmental Protection Agency"
      api_slug: "environmental-protection-agency"
      parent: null
      relevance: "Low"
      content_produced:
        - "RCRA hazardous pharmaceutical waste rules"
        - "Medical waste disposal"
      practice_types_affected:
        - "Compounding Pharmacy"
        - "IV Therapy"
        - "Med Spa"
    
    - agency_name: "Justice Department"
      api_slug: "justice-department"
      parent: null
      relevance: "Low"
      content_produced:
        - "ADA Title III enforcement (facility accessibility)"
        - "Healthcare fraud prosecution"
        - "False Claims Act"
      practice_types_affected:
        - "ALL practice types (fraud enforcement)"
        - "Med Spa"
        - "Primary Care (ADA)"
    
    - agency_name: "Small Business Administration"
      api_slug: "small-business-administration"
      parent: null
      relevance: "Low"
      content_produced:
        - "SBA loan programs"
        - "Small business size standards"
        - "Regulatory Flexibility Act reviews"
      practice_types_affected:
        - "ALL practice types (as small businesses)"
    
    - agency_name: "Office of Management and Budget"
      api_slug: "management-and-budget-office"
      parent: "EOP"
      relevance: "Low"
      content_produced:
        - "PRA information collection approvals"
        - "OIRA regulatory review of significant rules"
      practice_types_affected:
        - "ALL practice types (indirectly)"
    
    - agency_name: "Consumer Financial Protection Bureau"
      api_slug: "consumer-financial-protection-bureau"
      parent: null
      relevance: "Low"
      content_produced:
        - "Medical debt collection rules"
        - "Patient financing regulation"
        - "Medical credit card oversight"
      practice_types_affected:
        - "Med Spa"
        - "Weight Management"
        - "ALL cash-pay practices"
    
    - agency_name: "Office of the National Coordinator for Health IT"
      api_slug: "national-coordinator-for-health-information-technology-office"
      parent: "HHS"
      relevance: "Low"
      content_produced:
        - "EHR certification"
        - "Interoperability rules (HTI-1 through HTI-4)"
        - "Information blocking"
        - "TEFCA"
      practice_types_affected:
        - "ALL practice types using EHR"
        - "Telehealth"
        - "Primary Care"
    
    - agency_name: "Agency for Healthcare Research and Quality"
      api_slug: "agency-for-healthcare-research-and-quality"
      parent: "HHS"
      relevance: "Low"
      content_produced:
        - "Quality measures"
        - "Patient safety indicators"
        - "Evidence reviews"
        - "Comparative effectiveness"
      practice_types_affected:
        - "Primary Care"
        - "Pain Management"
        - "Integrative Medicine"
    
    - agency_name: "Labor Department"
      api_slug: "labor-department"
      parent: null
      relevance: "Low"
      content_produced:
        - "FMLA"
        - "Wage/hour for practice employees"
        - "Independent contractor classification"
      practice_types_affected:
        - "ALL practice types (as employers)"
    
    - agency_name: "Office of National Drug Control Policy"
      api_slug: "office-of-national-drug-control-policy"
      parent: "EOP"
      relevance: "Low"
      content_produced:
        - "National drug control strategy"
        - "Opioid policy"
      practice_types_affected:
        - "Pain Management"
        - "Functional Medicine"
    
    - agency_name: "Education Department"
      api_slug: "education-department"
      parent: null
      relevance: "Low"
      content_produced:
        - "Student loan forgiveness for healthcare providers"
        - "FERPA intersections"
      practice_types_affected:
        - "ALL practice types (provider loan programs)"

  excluded_agency_categories:
    defense_military:
      category: "Defense/Military (~20 agencies)"
      representative_slugs:
        - "defense-department"
        - "air-force-department"
        - "army-department"
        - "navy-department"
        - "defense-acquisition-regulations-system"
        - "defense-logistics-agency"
        - "engineers-corps"
        - "national-geospatial-intelligence-agency"
        - "national-security-agency-central-security-service"
    
    energy_nuclear:
      category: "Energy/Nuclear (~16 agencies)"
      representative_slugs:
        - "energy-department"
        - "federal-energy-regulatory-commission"
        - "nuclear-regulatory-commission"
        - "bonneville-power-administration"
        - "national-nuclear-security-administration"
    
    interior_land_natural_resources:
      category: "Interior/Land/Natural Resources (~21 agencies)"
      representative_slugs:
        - "interior-department"
        - "fish-and-wildlife-service"
        - "geological-survey"
        - "land-management-bureau"
        - "national-park-service"
        - "reclamation-bureau"
    
    transportation:
      category: "Transportation (~20 agencies)"
      representative_slugs:
        - "transportation-department"
        - "federal-aviation-administration"
        - "federal-highway-administration"
        - "federal-railroad-administration"
        - "national-highway-traffic-safety-administration"
        - "surface-transportation-board"
        - "national-transportation-safety-board"
    
    agriculture:
      category: "Agriculture (~30 agencies, excluding food safety borderline)"
      representative_slugs:
        - "agriculture-department"
        - "agricultural-marketing-service"
        - "farm-service-agency"
        - "forest-service"
        - "natural-resources-conservation-service"
    
    state_foreign_affairs_international:
      category: "State/Foreign Affairs/International (~17 agencies)"
      representative_slugs:
        - "state-department"
        - "agency-for-international-development"
        - "export-import-bank"
        - "international-trade-commission"
        - "trade-representative-office-of-united-states"
    
    financial_banking_securities:
      category: "Financial/Banking/Securities (~18 agencies)"
      representative_slugs:
        - "securities-and-exchange-commission"
        - "federal-deposit-insurance-corporation"
        - "federal-reserve-system"
        - "commodity-futures-trading-commission"
        - "national-credit-union-administration"
    
    space_science:
      category: "Space/Science (~5 agencies)"
      representative_slugs:
        - "national-aeronautics-and-space-administration"
        - "national-science-foundation"
    
    government_operations_administrative:
      category: "Government Operations/Administrative (~30 agencies)"
      representative_slugs:
        - "general-services-administration"
        - "government-accountability-office"
        - "national-archives-and-records-administration"
        - "government-publishing-office"
    
    intelligence:
      category: "Intelligence (~5 agencies)"
      representative_slugs:
        - "central-intelligence-agency"
        - "national-intelligence-office-of-the-national-director"
    
    housing:
      category: "Housing (~5 agencies)"
      representative_slugs:
        - "housing-and-urban-development-department"
        - "government-national-mortgage-association"
    
    courts_legal_elections:
      category: "Courts/Legal/Elections (~7 agencies)"
      representative_slugs:
        - "federal-election-commission"
        - "legal-services-corporation"
        - "judicial-conference-of-the-united-states"
    
    arts_humanities_library:
      category: "Arts/Humanities/Library (~10 agencies)"
      representative_slugs:
        - "library-of-congress"
        - "national-endowment-for-the-arts"
        - "smithsonian-institution"
    
    defunct_historical_commissions:
      category: "Defunct/Historical Commissions (~80+ agencies)"
      description: "Numerous historical commissions that remain indexed but no longer publish"
    
    justice_sub_agencies:
      category: "Justice sub-agencies (excludable)"
      representative_slugs:
        - "alcohol-tobacco-firearms-and-explosives-bureau"
        - "federal-bureau-of-investigation"
        - "immigration-and-naturalization-service"
        - "united-states-marshals-service"
      note: "Keep DOJ parent and DEA"
    
    borderline_agencies_to_monitor_with_keyword_filters:
      category: "Borderline agencies (not excluded, but Low relevance)"
      representative_slugs:
        - "federal-emergency-management-agency"
        - "u-s-citizenship-and-immigration-services"
        - "patent-and-trademark-office"
        - "national-institute-of-standards-and-technology"
        - "consumer-product-safety-commission"
        - "food-and-nutrition-service"
        - "national-labor-relations-board"
        - "architectural-and-transportation-barriers-compliance-board"

  keyword_phrases_domain_1_prescribing_controlled_substances:
    total_phrases: 18
    signal_breakdown:
      strong: 16
      moderate: 2
    phrases:
      - phrase: "controlled substance"
        signal: "Strong"
        homonym_risk: false
      - phrase: "prescription drug monitoring"
        signal: "Strong"
        homonym_risk: false
      - phrase: "telemedicine prescribing"
        signal: "Strong"
        homonym_risk: false
      - phrase: "drug scheduling"
        signal: "Moderate"
        homonym_risk: true
        disambiguation: "Require co-occurrence with DEA, schedule II-V, controlled, or CSA"
      - phrase: "opioid prescribing"
        signal: "Strong"
        homonym_risk: false
      - phrase: "Ryan Haight Act"
        signal: "Strong"
        homonym_risk: false
      - phrase: "DEA registration"
        signal: "Strong"
        homonym_risk: false
      - phrase: "schedule II controlled"
        signal: "Strong"
        homonym_risk: false
      - phrase: "telemedicine flexibilities"
        signal: "Strong"
        homonym_risk: false
      - phrase: "in-person medical evaluation"
        signal: "Strong"
        homonym_risk: false
      - phrase: "special registration for telemedicine"
        signal: "Strong"
        homonym_risk: false
      - phrase: "prescribing practitioner"
        signal: "Strong"
        homonym_risk: false
      - phrase: "controlled medication"
        signal: "Strong"
        homonym_risk: false
      - phrase: "prescription drug user fee"
        signal: "Strong"
        homonym_risk: false
      - phrase: "drug diversion"
        signal: "Strong"
        homonym_risk: true
        disambiguation: "Require DEA, controlled, pharmacy, or substance"
      - phrase: "buprenorphine treatment"
        signal: "Strong"
        homonym_risk: false
      - phrase: "substance use disorder"
        signal: "Strong"
        homonym_risk: false
      - phrase: "practitioner-patient relationship"
        signal: "Strong"
        homonym_risk: false

  keyword_phrases_domain_2_compounding_pharmacy:
    total_phrases: 20
    signal_breakdown:
      strong: 17
      moderate: 3
    phrases:
      - phrase: "compounding pharmacy"
        signal: "Strong"
        homonym_risk: false
      - phrase: "outsourcing facility"
        signal: "Strong"
        homonym_risk: false
      - phrase: "bulk drug substance"
        signal: "Strong"
        homonym_risk: false
      - phrase: "503A pharmacy"
        signal: "Strong"
        homonym_risk: false
      - phrase: "503B outsourcing"
        signal: "Strong"
        homonym_risk: false
      - phrase: "drug compounding"
        signal: "Strong"
        homonym_risk: false
      - phrase: "compounding quality"
        signal: "Strong"
        homonym_risk: false
      - phrase: "essentially a copy"
        signal: "Strong"
        homonym_risk: false
        note: "FDA legal term for compounded drug copying approved product"
      - phrase: "current good manufacturing practice"
        signal: "Strong"
        homonym_risk: false
      - phrase: "drug shortage list"
        signal: "Strong"
        homonym_risk: false
      - phrase: "sterile compounding"
        signal: "Strong"
        homonym_risk: false
      - phrase: "active pharmaceutical ingredient"
        signal: "Strong"
        homonym_risk: false
      - phrase: "clinical need determination"
        signal: "Strong"
        homonym_risk: false
      - phrase: "insanitary conditions"
        signal: "Strong"
        homonym_risk: false
        note: "FDA enforcement term"
      - phrase: "compounded drug product"
        signal: "Strong"
        homonym_risk: false
      - phrase: "drug quality and security"
        signal: "Strong"
        homonym_risk: false
        note: "DQSA reference"
      - phrase: "adverse event report"
        signal: "Strong"
        homonym_risk: false
      - phrase: "certificate of analysis"
        signal: "Moderate"
        homonym_risk: true
        disambiguation: "Require drug, pharmaceutical, compounding, or FDA"
      - phrase: "enforcement discretion"
        signal: "Moderate"
        homonym_risk: true
        disambiguation: "Require healthcare/FDA/DEA context"
      - phrase: "GLP-1 compounding"
        signal: "Strong"
        homonym_risk: false

  keyword_phrases_domain_3_medical_devices:
    total_phrases: 13
    signal_breakdown:
      strong: 13
      moderate: 0
    phrases:
      - phrase: "510(k) clearance"
        signal: "Strong"
        homonym_risk: false
      - phrase: "premarket approval"
        signal: "Strong"
        homonym_risk: false
      - phrase: "medical device classification"
        signal: "Strong"
        homonym_risk: false
      - phrase: "device adverse event"
        signal: "Strong"
        homonym_risk: false
      - phrase: "substantial equivalence"
        signal: "Strong"
        homonym_risk: false
      - phrase: "premarket notification"
        signal: "Strong"
        homonym_risk: false
      - phrase: "de novo classification"
        signal: "Strong"
        homonym_risk: false
      - phrase: "device recall"
        signal: "Strong"
        homonym_risk: false
      - phrase: "class II medical device"
        signal: "Strong"
        homonym_risk: false
      - phrase: "quality system regulation"
        signal: "Strong"
        homonym_risk: false
      - phrase: "medical device reporting"
        signal: "Strong"
        homonym_risk: false
      - phrase: "predicate device"
        signal: "Strong"
        homonym_risk: false
      - phrase: "postmarket surveillance"
        signal: "Strong"
        homonym_risk: false

  keyword_phrases_domain_4_billing_reimbursement:
    total_phrases: 18
    signal_breakdown:
      strong: 12
      moderate: 6
    phrases:
      - phrase: "physician fee schedule"
        signal: "Strong"
        homonym_risk: false
      - phrase: "conversion factor"
        signal: "Moderate"
        homonym_risk: true
        disambiguation: "Require Medicare, CMS, physician, or payment"
      - phrase: "relative value unit"
        signal: "Strong"
        homonym_risk: false
      - phrase: "evaluation and management"
        signal: "Strong"
        homonym_risk: false
      - phrase: "telehealth reimbursement"
        signal: "Strong"
        homonym_risk: false
      - phrase: "Medicare payment"
        signal: "Strong"
        homonym_risk: false
      - phrase: "quality payment program"
        signal: "Strong"
        homonym_risk: false
      - phrase: "merit-based incentive payment"
        signal: "Strong"
        homonym_risk: false
      - phrase: "practice expense"
        signal: "Moderate"
        homonym_risk: true
        disambiguation: "Require Medicare, RVU, or fee schedule"
      - phrase: "Medicare telehealth services"
        signal: "Strong"
        homonym_risk: false
      - phrase: "direct supervision"
        signal: "Moderate"
        homonym_risk: true
        disambiguation: "Require CMS, Medicare, physician, billing, or medical"
      - phrase: "originating site facility fee"
        signal: "Strong"
        homonym_risk: false
      - phrase: "incident-to services"
        signal: "Strong"
        homonym_risk: false
      - phrase: "CPT code"
        signal: "Strong"
        homonym_risk: false
      - phrase: "HCPCS code"
        signal: "Strong"
        homonym_risk: false
      - phrase: "Medicare Part B"
        signal: "Strong"
        homonym_risk: false
      - phrase: "split/shared visit"
        signal: "Strong"
        homonym_risk: false
      - phrase: "promoting interoperability"
        signal: "Strong"
        homonym_risk: false

  keyword_phrases_domain_5_privacy_security:
    total_phrases: 14
    signal_breakdown:
      strong: 10
      moderate: 4
    phrases:
      - phrase: "protected health information"
        signal: "Strong"
        homonym_risk: false
      - phrase: "HIPAA privacy rule"
        signal: "Strong"
        homonym_risk: false
      - phrase: "security risk analysis"
        signal: "Moderate"
        homonym_risk: true
        disambiguation: "Require HIPAA, health, covered entity, or ePHI"
      - phrase: "breach notification rule"
        signal: "Strong"
        homonym_risk: false
      - phrase: "health information exchange"
        signal: "Strong"
        homonym_risk: false
      - phrase: "information blocking"
        signal: "Strong"
        homonym_risk: false
      - phrase: "electronic health information"
        signal: "Strong"
        homonym_risk: false
      - phrase: "business associate agreement"
        signal: "Strong"
        homonym_risk: false
      - phrase: "electronic protected health information"
        signal: "Strong"
        homonym_risk: false
      - phrase: "covered entity"
        signal: "Moderate"
        homonym_risk: true
        disambiguation: "Require HIPAA, health, privacy, or PHI"
      - phrase: "health breach notification"
        signal: "Strong"
        homonym_risk: false
      - phrase: "cybersecurity safeguard"
        signal: "Moderate"
        homonym_risk: true
        disambiguation: "Require HIPAA, health, OCR, or covered entity"
      - phrase: "minimum necessary standard"
        signal: "Strong"
        homonym_risk: false
      - phrase: "personal health record"
        signal: "Strong"
        homonym_risk: false

  keyword_phrases_domain_6_telehealth:
    total_phrases: 14
    signal_breakdown:
      strong: 11
      moderate: 3
    phrases:
      - phrase: "telehealth service"
        signal: "Strong"
        homonym_risk: false
      - phrase: "audio-only telehealth"
        signal: "Strong"
        homonym_risk: false
      - phrase: "remote patient monitoring"
        signal: "Strong"
        homonym_risk: false
      - phrase: "virtual supervision"
        signal: "Moderate"
        homonym_risk: false
      - phrase: "interstate medical licensure"
        signal: "Strong"
        homonym_risk: false
      - phrase: "telemedicine encounter"
        signal: "Strong"
        homonym_risk: false
      - phrase: "telecommunications system"
        signal: "Moderate"
        homonym_risk: true
        disambiguation: "Require Medicare, telehealth, interactive, or health"
      - phrase: "telehealth originating site"
        signal: "Strong"
        homonym_risk: false
      - phrase: "distant site practitioner"
        signal: "Strong"
        homonym_risk: false
      - phrase: "geographic restriction"
        signal: "Moderate"
        homonym_risk: true
        disambiguation: "Require telehealth, Medicare, or originating site"
      - phrase: "telemedicine cliff"
        signal: "Strong"
        homonym_risk: false
      - phrase: "audio-video communication technology"
        signal: "Strong"
        homonym_risk: false
      - phrase: "telehealth services list"
        signal: "Strong"
        homonym_risk: false
      - phrase: "place of service"
        signal: "Moderate"
        homonym_risk: true
        disambiguation: "Require telehealth, Medicare, or CMS"

  keyword_phrases_domain_7_practice_licensing_scope:
    total_phrases: 14
    signal_breakdown:
      strong: 9
      moderate: 5
    phrases:
      - phrase: "scope of practice"
        signal: "Strong"
        homonym_risk: false
      - phrase: "physician supervision"
        signal: "Strong"
        homonym_risk: false
      - phrase: "nurse practitioner"
        signal: "Strong"
        homonym_risk: false
      - phrase: "collaborative practice agreement"
        signal: "Strong"
        homonym_risk: false
      - phrase: "independent practice authority"
        signal: "Strong"
        homonym_risk: false
      - phrase: "full practice authority"
        signal: "Strong"
        homonym_risk: false
      - phrase: "physician assistant"
        signal: "Strong"
        homonym_risk: false
      - phrase: "advanced practice registered nurse"
        signal: "Strong"
        homonym_risk: false
      - phrase: "prescriptive authority"
        signal: "Strong"
        homonym_risk: false
      - phrase: "state licensure requirement"
        signal: "Moderate"
        homonym_risk: true
        disambiguation: "Require healthcare/medical context"
      - phrase: "transition to practice"
        signal: "Moderate"
        homonym_risk: true
        disambiguation: "Require NP, APRN, nurse practitioner, or supervision"
      - phrase: "standard of care"
        signal: "Moderate"
        homonym_risk: true
        disambiguation: "Require medical/healthcare context"
      - phrase: "medical practice act"
        signal: "Strong"
        homonym_risk: false
      - phrase: "credentialing requirement"
        signal: "Moderate"
        homonym_risk: false

  keyword_phrases_domain_8_patient_safety:
    total_phrases: 13
    signal_breakdown:
      strong: 8
      moderate: 5
    phrases:
      - phrase: "adverse event reporting"
        signal: "Strong"
        homonym_risk: false
      - phrase: "patient safety organization"
        signal: "Strong"
        homonym_risk: false
      - phrase: "sentinel event"
        signal: "Strong"
        homonym_risk: false
      - phrase: "quality improvement program"
        signal: "Moderate"
        homonym_risk: true
        disambiguation: "Require patient, healthcare, clinical, or safety"
      - phrase: "serious reportable event"
        signal: "Strong"
        homonym_risk: false
      - phrase: "root cause analysis"
        signal: "Moderate"
        homonym_risk: true
        disambiguation: "Require healthcare/patient safety context"
      - phrase: "patient safety event"
        signal: "Strong"
        homonym_risk: false
      - phrase: "medication error"
        signal: "Strong"
        homonym_risk: false
      - phrase: "quality measure reporting"
        signal: "Strong"
        homonym_risk: false
      - phrase: "clinical quality measure"
        signal: "Strong"
        homonym_risk: false
      - phrase: "informed consent"
        signal: "Moderate"
        homonym_risk: true
        disambiguation: "Require clinical/medical/procedure context"
      - phrase: "never event"
        signal: "Strong"
        homonym_risk: false
      - phrase: "patient safety work product"
        signal: "Strong"
        homonym_risk: false

  keyword_phrases_domain_9_fda_regulatory_action:
    total_phrases: 18
    signal_breakdown:
      strong: 14
      moderate: 4
    phrases:
      - phrase: "new drug application"
        signal: "Strong"
        homonym_risk: false
      - phrase: "abbreviated new drug application"
        signal: "Strong"
        homonym_risk: false
      - phrase: "biologics license application"
        signal: "Strong"
        homonym_risk: false
      - phrase: "emergency use authorization"
        signal: "Strong"
        homonym_risk: false
      - phrase: "FDA warning letter"
        signal: "Strong"
        homonym_risk: false
      - phrase: "accelerated approval"
        signal: "Strong"
        homonym_risk: false
      - phrase: "drug safety communication"
        signal: "Strong"
        homonym_risk: false
      - phrase: "risk evaluation and mitigation"
        signal: "Strong"
        homonym_risk: false
      - phrase: "import alert"
        signal: "Moderate"
        homonym_risk: false
      - phrase: "consent decree"
        signal: "Moderate"
        homonym_risk: true
        disambiguation: "Require FDA, compounding, pharmacy, or drug"
      - phrase: "clinical investigation"
        signal: "Moderate"
        homonym_risk: true
        disambiguation: "Require FDA, IND, drug, device, or IRB"
      - phrase: "investigational new drug"
        signal: "Strong"
        homonym_risk: false
      - phrase: "safety labeling change"
        signal: "Strong"
        homonym_risk: false
      - phrase: "drug shortage"
        signal: "Strong"
        homonym_risk: false
      - phrase: "unapproved drug"
        signal: "Strong"
        homonym_risk: false
      - phrase: "postmarket drug safety"
        signal: "Strong"
        homonym_risk: false
      - phrase: "refuse to file"
        signal: "Strong"
        homonym_risk: false
      - phrase: "dietary supplement"
        signal: "Moderate"
        homonym_risk: false

  keyword_phrases_domain_10_employment_workplace_safety:
    total_phrases: 12
    signal_breakdown:
      strong: 6
      moderate: 6
    phrases:
      - phrase: "bloodborne pathogen"
        signal: "Strong"
        homonym_risk: false
      - phrase: "exposure control plan"
        signal: "Strong"
        homonym_risk: false
      - phrase: "workplace safety standard"
        signal: "Moderate"
        homonym_risk: true
        disambiguation: "Require healthcare, medical, bloodborne, or OSHA"
      - phrase: "sharps injury prevention"
        signal: "Strong"
        homonym_risk: false
      - phrase: "occupational exposure"
        signal: "Moderate"
        homonym_risk: true
        disambiguation: "Require blood, pathogen, needlestick, or healthcare"
      - phrase: "personal protective equipment"
        signal: "Moderate"
        homonym_risk: true
        disambiguation: "Require healthcare, OSHA, medical, bloodborne"
      - phrase: "hazard communication standard"
        signal: "Moderate"
        homonym_risk: true
        disambiguation: "Require healthcare or medical context"
      - phrase: "infection control"
        signal: "Moderate"
        homonym_risk: true
        disambiguation: "Could be agricultural; require healthcare, patient, clinical, hospital"
      - phrase: "needlestick safety"
        signal: "Strong"
        homonym_risk: false
      - phrase: "respiratory protection standard"
        signal: "Moderate"
        homonym_risk: true
        disambiguation: "Require healthcare, medical, or clinical"
      - phrase: "employer vaccination requirement"
        signal: "Moderate"
        homonym_risk: false
      - phrase: "radiation safety officer"
        signal: "Strong"
        homonym_risk: false

  keyword_phrases_domain_11_advertising_marketing:
    total_phrases: 14
    signal_breakdown:
      strong: 5
      moderate: 9
    phrases:
      - phrase: "health claim substantiation"
        signal: "Strong"
        homonym_risk: false
      - phrase: "deceptive advertising"
        signal: "Moderate"
        homonym_risk: true
        disambiguation: "Require health, medical, drug, supplement, or device"
      - phrase: "testimonial endorsement"
        signal: "Moderate"
        homonym_risk: true
        disambiguation: "Require health, medical, FTC"
      - phrase: "substantiation requirement"
        signal: "Moderate"
        homonym_risk: true
        disambiguation: "Require health, medical, FTC"
      - phrase: "direct-to-consumer advertising"
        signal: "Moderate"
        homonym_risk: true
        disambiguation: "Require drug, medical, health, or FDA"
      - phrase: "health-related product claim"
        signal: "Strong"
        homonym_risk: false
      - phrase: "off-label promotion"
        signal: "Strong"
        homonym_risk: false
      - phrase: "unfair or deceptive practice"
        signal: "Moderate"
        homonym_risk: true
        disambiguation: "Require health, medical, drug, or device"
      - phrase: "FDA-approved claim"
        signal: "Strong"
        homonym_risk: false
      - phrase: "advertising substantiation"
        signal: "Moderate"
        homonym_risk: true
        disambiguation: "Require health or medical"
      - phrase: "truth-in-advertising"
        signal: "Moderate"
        homonym_risk: true
        disambiguation: "Require health, drug, supplement, medical"
      - phrase: "structure/function claim"
        signal: "Strong"
        homonym_risk: false
      - phrase: "dietary supplement advertising"
        signal: "Strong"
        homonym_risk: false
      - phrase: "corrective advertising"
        signal: "Moderate"
        homonym_risk: true
        disambiguation: "Require health, drug, or supplement"

  keyword_phrases_domain_12_insurance_coverage:
    total_phrases: 15
    signal_breakdown:
      strong: 8
      moderate: 7
    phrases:
      - phrase: "prior authorization"
        signal: "Strong"
        homonym_risk: false
      - phrase: "network adequacy"
        signal: "Strong"
        homonym_risk: false
      - phrase: "surprise billing"
        signal: "Strong"
        homonym_risk: false
      - phrase: "balance billing"
        signal: "Strong"
        homonym_risk: false
      - phrase: "No Surprises Act"
        signal: "Strong"
        homonym_risk: false
      - phrase: "independent dispute resolution"
        signal: "Moderate"
        homonym_risk: true
        disambiguation: "Require medical, health, billing, No Surprises"
      - phrase: "qualifying payment amount"
        signal: "Strong"
        homonym_risk: false
      - phrase: "out-of-network rate"
        signal: "Strong"
        homonym_risk: false
      - phrase: "essential health benefit"
        signal: "Strong"
        homonym_risk: false
      - phrase: "good faith estimate"
        signal: "Moderate"
        homonym_risk: true
        disambiguation: "Require medical, health, uninsured, No Surprises"
      - phrase: "price transparency"
        signal: "Moderate"
        homonym_risk: true
        disambiguation: "Require hospital, health, medical, CMS"
      - phrase: "mental health parity"
        signal: "Strong"
        homonym_risk: false
      - phrase: "insurance coverage mandate"
        signal: "Strong"
        homonym_risk: false
      - phrase: "continuity of care"
        signal: "Moderate"
        homonym_risk: true
        disambiguation: "Require insurance, network, coverage, plan"
      - phrase: "cost-sharing requirement"
        signal: "Moderate"
        homonym_risk: true
        disambiguation: "Require health, medical, plan, ACA"

  cross_domain_specialty_phrases:
    total_phrases: 27
    phrases:
      - phrase: "semaglutide compounding"
        signal: "Strong"
        primary_domains: ["Compounding", "FDA"]
        homonym_risk: false
        note: "GLP-1 compounding controversy"
        practice_types: ["Weight Management", "Compounding Pharmacy"]
      
      - phrase: "tirzepatide shortage"
        signal: "Strong"
        primary_domains: ["FDA", "Compounding"]
        homonym_risk: false
        practice_types: ["Weight Management", "Compounding Pharmacy"]
      
      - phrase: "weight management drug"
        signal: "Strong"
        primary_domains: ["FDA", "Billing"]
        homonym_risk: false
        practice_types: ["Weight Management"]
      
      - phrase: "hormone replacement therapy"
        signal: "Strong"
        primary_domains: ["Compounding", "Prescribing"]
        homonym_risk: false
        practice_types: ["HRT", "Anti-Aging"]
      
      - phrase: "bioidentical hormone"
        signal: "Strong"
        primary_domains: ["Compounding", "FDA"]
        homonym_risk: false
        note: "Compounded BHRT"
        practice_types: ["HRT", "Anti-Aging"]
      
      - phrase: "aesthetic medical device"
        signal: "Strong"
        primary_domains: ["Devices", "Licensing"]
        homonym_risk: false
        practice_types: ["Med Spa", "Anti-Aging"]
      
      - phrase: "regenerative medicine product"
        signal: "Strong"
        primary_domains: ["FDA", "Devices"]
        homonym_risk: false
        practice_types: ["Regenerative Medicine"]
      
      - phrase: "human cells tissues"
        signal: "Strong"
        primary_domains: ["FDA"]
        homonym_risk: false
        note: "HCT/P framework (21 CFR 1271)"
        practice_types: ["Regenerative Medicine"]
      
      - phrase: "platelet-rich plasma"
        signal: "Strong"
        primary_domains: ["FDA", "Devices"]
        homonym_risk: false
        practice_types: ["Regenerative Medicine", "Pain Management"]
      
      - phrase: "IV nutrient therapy"
        signal: "Moderate"
        primary_domains: ["Compounding", "Patient Safety"]
        homonym_risk: false
        practice_types: ["IV Therapy", "Functional Medicine"]
      
      - phrase: "compounded injectable"
        signal: "Strong"
        primary_domains: ["Compounding"]
        homonym_risk: false
        practice_types: ["IV Therapy", "Peptide Therapy", "HRT"]
      
      - phrase: "testosterone prescribing"
        signal: "Strong"
        primary_domains: ["Prescribing", "Compounding"]
        homonym_risk: false
        note: "Schedule III"
        practice_types: ["HRT", "Anti-Aging", "Functional Medicine"]
      
      - phrase: "peptide compounding"
        signal: "Strong"
        primary_domains: ["Compounding", "FDA"]
        homonym_risk: false
        practice_types: ["Peptide Therapy"]
      
      - phrase: "drug shortage database"
        signal: "Strong"
        primary_domains: ["FDA", "Compounding"]
        homonym_risk: false
        practice_types: ["Compounding Pharmacy"]
      
      - phrase: "telehealth platform"
        signal: "Moderate"
        primary_domains: ["Telehealth"]
        homonym_risk: true
        disambiguation: "Require prescribing, DEA, medical, health"
        practice_types: ["Telehealth"]
      
      - phrase: "direct primary care"
        signal: "Moderate"
        primary_domains: ["Billing", "Licensing"]
        homonym_risk: false
        note: "DPC model"
        practice_types: ["Primary Care"]
      
      - phrase: "concierge medicine"
        signal: "Moderate"
        primary_domains: ["Billing", "Licensing"]
        homonym_risk: false
        practice_types: ["Primary Care"]
      
      - phrase: "anti-aging claim"
        signal: "Moderate"
        primary_domains: ["Advertising", "FDA"]
        homonym_risk: false
        practice_types: ["Anti-Aging"]
      
      - phrase: "medical spa regulation"
        signal: "Strong"
        primary_domains: ["Licensing", "Devices"]
        homonym_risk: false
        practice_types: ["Med Spa"]
      
      - phrase: "laser safety standard"
        signal: "Moderate"
        primary_domains: ["Devices", "Patient Safety"]
        homonym_risk: true
        disambiguation: "Require medical, aesthetic, dermatology"
        note: "Also industrial laser"
        practice_types: ["Med Spa"]
      
      - phrase: "chiropractic scope"
        signal: "Strong"
        primary_domains: ["Licensing"]
        homonym_risk: false
        practice_types: ["Chiropractic"]
      
      - phrase: "integrative medicine practice"
        signal: "Moderate"
        primary_domains: ["Licensing"]
        homonym_risk: false
        practice_types: ["Integrative Medicine"]
      
      - phrase: "functional medicine claim"
        signal: "Moderate"
        primary_domains: ["Advertising", "FDA"]
        homonym_risk: false
        practice_types: ["Functional Medicine"]
      
      - phrase: "pain management prescribing"
        signal: "Strong"
        primary_domains: ["Prescribing"]
        homonym_risk: false
        practice_types: ["Pain Management"]
      
      - phrase: "drug product labeling"
        signal: "Strong"
        primary_domains: ["FDA", "Compounding"]
        homonym_risk: false
        practice_types: ["Compounding Pharmacy", "Weight Management"]
      
      - phrase: "public health emergency"
        signal: "Moderate"
        primary_domains: ["Cross-cutting"]
        homonym_risk: true
        disambiguation: "Require DEA, FDA, telemedicine, controlled substance, or EUA"
        practice_types: ["ALL"]
      
      - phrase: "consumer protection enforcement"
        signal: "Moderate"
        primary_domains: ["Advertising"]
        homonym_risk: true
        disambiguation: "Require health, medical, FTC"
        practice_types: ["ALL"]

  homonym_risk_phrases_requiring_disambiguation:
    total_count: 42
    context_terms_required:
      agency_identifiers:
        - "FDA"
        - "DEA"
        - "CMS"
        - "OSHA"
        - "FTC"
        - "HHS"
        - "ONC"
        - "OCR"
        - "SAMHSA"
        - "AHRQ"
      healthcare_context_words:
        - "patient"
        - "clinical"
        - "medical"
        - "healthcare"
        - "physician"
        - "pharmacy"
        - "drug"
        - "device"
        - "hospital"
        - "practitioner"
        - "health plan"
      regulatory_document_markers:
        - "CFR"
        - "USC"
        - "Public Law"
        - "final rule"
        - "proposed rule"

  fr_document_type_rule:
    type_value: "RULE"
    action_values:
      - action: "Final rule"
        relevance_likelihood: "Very High"
        creates_obligations: true
        urgency: "High (compliance deadline stated)"
        handling: "Always evaluated"
      
      - action: "Interim final rule"
        relevance_likelihood: "Very High"
        creates_obligations: true
        urgency: "Critical (effective immediately)"
        handling: "Always evaluated"
      
      - action: "Interim final rule with request for comments"
        relevance_likelihood: "Very High"
        creates_obligations: true
        urgency: "Critical"
        handling: "Always evaluated"
      
      - action: "Direct final rule"
        relevance_likelihood: "High"
        creates_obligations: "Conditional (binding unless adverse comments)"
        urgency: "Moderate"
        handling: "Always evaluated"
      
      - action: "Temporary final rule"
        relevance_likelihood: "High"
        creates_obligations: "Yes — time-bounded"
        urgency: "High"
        handling: "Always evaluated"
      
      - action: "Final rule; delay of effective date"
        relevance_likelihood: "High"
        creates_obligations: "Modifies timeline"
        urgency: "High (changes compliance dates)"
        handling: "Always evaluated"
      
      - action: "Final rule; request for comments"
        relevance_likelihood: "High"
        creates_obligations: true
        urgency: "High"
        handling: "Always evaluated"
      
      - action: "Affirmation of final rule"
        relevance_likelihood: "Moderate"
        creates_obligations: "Confirms existing"
        urgency: "Moderate"
        handling: "Evaluated if from relevant agency"
      
      - action: "Withdrawal of final rule"
        relevance_likelihood: "Moderate"
        creates_obligations: "Removes obligations"
        urgency: "High (changes regulatory landscape)"
        handling: "Always evaluated"
      
      - action: "Final rule; correction"
        relevance_likelihood: "Moderate"
        creates_obligations: "May change compliance details"
        urgency: "Moderate"
        handling: "Evaluated if from relevant agency"

  fr_document_type_prorule:
    type_value: "PRORULE"
    action_values:
      - action: "Proposed rule"
        relevance_likelihood: "High"
        creates_obligations: false
        signals: "Future obligations"
        urgency: "Moderate (planning + commenting)"
        handling: "Always evaluated"
      
      - action: "Advance notice of proposed rulemaking"
        relevance_likelihood: "Moderate"
        creates_obligations: false
        signals: "Earliest signal"
        urgency: "Low (long-term planning)"
        handling: "Evaluated if from relevant agency"
      
      - action: "Supplemental notice of proposed rulemaking"
        relevance_likelihood: "Moderate"
        creates_obligations: false
        signals: "Revised proposal"
        urgency: "Moderate"
        handling: "Evaluated if from relevant agency"
      
      - action: "Request for information"
        relevance_likelihood: "Low-Moderate"
        creates_obligations: false
        signals: "Information gathering"
        urgency: "Low"
        handling: "Evaluated only if from relevant agency"
      
      - action: "Proposed rule; extension of comment period"
        relevance_likelihood: "Low"
        creates_obligations: false
        urgency: "Low"
        handling: "Evaluated only if from relevant agency"
      
      - action: "Proposed rule; withdrawal"
        relevance_likelihood: "Moderate"
        creates_obligations: "Removes proposed obligations"
        urgency: "Moderate"
        handling: "Evaluated if from relevant agency"
      
      - action: "Proposed rule; correction"
        relevance_likelihood: "Low"
        creates_obligations: false
        urgency: "Low"
        handling: "Evaluated only if from relevant agency"
      
      - action: "Proposed rule; reopening of comment period"
        relevance_likelihood: "Low"
        creates_obligations: false
        urgency: "Low"
        handling: "Evaluated only if from relevant agency"

  fr_document_type_notice_tier_1:
    tier: "Tier 1 — Always evaluated"
    actions:
      - "Notice of proposed national coverage determination (CMS coverage decisions — major practice impact)"
      - "Drug scheduling action (DEA controlled substance scheduling)"
      - "Notice of civil money penalty (enforcement actions)"
      - "Notice of exclusion (OIG program exclusions)"
      - "Notice of availability; final guidance (FDA/CMS guidance — shapes enforcement policy)"

  fr_document_type_notice_tier_2:
    tier: "Tier 2 — Evaluated if from relevant agency"
    actions:
      - "Notice of availability; draft guidance (FDA guidance under development)"
      - "Notice of determination (agency determinations on specific matters)"
      - "Request for comments (non-rulemaking public input)"
      - "Notice of intent (signals upcoming agency action)"
      - "Agency information collection activities; proposed collection (PRA notices — signals data collection)"
      - "Agency information collection activities; submission for OMB review (PRA 30-day notice)"
      - "Notice of petition / receipt of petition (citizen/industry petitions)"

  fr_document_type_notice_tier_3:
    tier: "Tier 3 — Always excluded (unless keyword match)"
    actions:
      - "Notice of meeting / Meeting notice / Sunshine Act meeting (advisory committee meetings)"
      - "Request for nominations / Solicitation of nominations (committee membership)"
      - "Grant/cooperative agreement funding opportunity (NIH, HRSA grants)"
      - "Delegation of authority (internal agency delegations)"
      - "Privacy Act; System of Records Notice (data system notices)"
      - "Notice of establishment / Notice of renewal (advisory committees)"

  fr_document_type_presdocu:
    type_value: "PRESDOCU"
    subtypes:
      - subtype: "Executive Order"
        subtype_code: "executive_order"
        relevance_likelihood: "High — can reshape healthcare policy (drug pricing, ACA, telehealth)"
        handling: "Always evaluated"
      
      - subtype: "Presidential Memorandum"
        subtype_code: "memorandum"
        relevance_likelihood: "Moderate-High — often directs HHS/FDA action"
        handling: "Evaluated if healthcare keywords present"
      
      - subtype: "Presidential Determination"
        subtype_code: "determination"
        relevance_likelihood: "Low-Moderate — unless health emergency"
        handling: "Evaluated only if healthcare keywords present"
      
      - subtype: "Presidential Notice"
        subtype_code: "notice"
        relevance_likelihood: "Low — emergency continuations"
        handling: "Evaluated only if healthcare keywords present"
      
      - subtype: "Proclamation"
        subtype_code: "proclamation"
        relevance_likelihood: "Low — usually ceremonial"
        handling: "Always excluded

---

## Research task:

# Cedar Classification Framework — Part 1, Session 4 of 8

# Domain Taxonomy: Level 1 and Level 2 Structure with Full Metadata

## Context

Cedar is an AI-powered regulatory monitoring platform for independent medical practices in Florida (expanding to all 50 states). Target practice types: Functional Medicine, Hormone Optimization/HRT, Compounding Pharmacy, Med Spa/Aesthetic Medicine, Weight Management, Peptide Therapy, IV Therapy/Infusion, Regenerative Medicine, Telehealth, Chiropractic, Integrative Medicine, Anti-Aging Medicine, Pain Management, and Primary Care (DPC/Concierge).

Cedar has a PostgreSQL knowledge graph with `kg_domains` (hierarchical taxonomy via `parent_domain_id`, supports arbitrary depth), `kg_entity_domains` (many-to-many classification with `relevance_score` and `classified_by`), and `kg_practice_types` (14 NUCC-based practice types).

This is **Session 4 of 8**. Sessions 1 and 3 produced relevance filters (CFR title classification and non-CFR signals). This session designs the **top two levels** of the domain taxonomy — the L1 domains visible on Cedar's Library home screen and the L2 subdomains that appear when you drill into any L1. Later sessions (5-7) develop L3+ branches.

Session 2 (part-level allowlists) provides granular CFR-part-level filtering data that is consumed by Session 8 (CFR-to-domain mapping), not by this session. The L1/L2 taxonomy design needs to know *which regulatory areas exist* (Session 1's title classifications) and *what non-CFR signals matter* (Session 3), not the part-level detail.

The combined output of all 8 sessions will be read by Claude Opus to produce an engineering implementation plan. The taxonomy must be designed so that the domain codes are stable — L3+ development in Sessions 5-7 extends the tree without changing L1/L2 codes.

### Required Context (Sessions 1 and 3)

The context from Sessions 1 and 3 is provided above (injected by the orchestrator). If running manually, attach these files:

- Session 1 output (CFR title classification — which titles are relevant/mixed/irrelevant)
- Session 3 output (non-CFR signals — agency relevance map, keyword clusters, openFDA mapping)

The research agent should use both to ground the taxonomy design in the actual regulatory content that exists in Cedar's corpus.

---

## Taxonomy Design Requirements

### Structural Rules

1. **Practice-owner mental model**: Categories use language that practice owners think in. "Controlled Substances" is the right label. "21 CFR Chapter II Subchapter D" is wrong.
2. **Cross-classification support**: A single entity can belong to multiple domains. The taxonomy identifies where cross-classification is common.
3. **State-agnostic structure**: Must work for all 50 states. State-specific content slots into the same tree — "Telehealth > State Licensure Requirements" applies everywhere, the entities underneath are state-specific.
4. **State-expansion scaffolding**: The taxonomy currently classifies federal content, but Cedar will expand to ingest state-level regulatory sources (state medical boards, boards of pharmacy, state administrative codes, state legislation) across all 50 states. The taxonomy must include domain nodes for regulatory areas that are primarily or exclusively state-governed, even though this research won't populate them with federal content. Key state-governed areas that need scaffolding nodes include: scope of practice by provider type, state facility licensing, state-specific controlled substance schedules, state compounding permits, state telehealth practice requirements, state privacy laws exceeding HIPAA, state advertising restrictions, state corporate practice of medicine rules, and state board disciplinary processes. These nodes should be created with descriptions and classification signal placeholders noting "primarily state-regulated — federal content limited."
5. **Future-proof**: Accommodate source types Cedar hasn't ingested yet — board meeting minutes, professional association guidelines, insurance carrier policies, accreditation standards.
6. **Stable codes**: L1 and L2 codes defined here will be referenced by all subsequent sessions. They must be well-considered and unlikely to need renaming.

### Target Sizes

| Level | Target Count |
| --- | --- |
| L1 | 10-12 domains |
| L2 | 50-80 subdomains (5-8 per L1 on average, with variation) |

---

## Deliverable 1: Level 1 Domains

Produce 10-12 top-level domains. For **each L1 domain**, provide:

### 1. Domain Name

The practitioner-facing label as it would appear in Cedar's Library UI.

### 2. Domain Code

Machine-readable slug, lowercase, hyphenated. Examples: `controlled-substances`, `hipaa-privacy`, `fda-regulation`, `medicare-billing`.

### 3. Description

2-3 sentences explaining the scope of this domain — what types of regulatory content belong here.

### 4. Classification Signals

- **CFR title/chapter ranges** that primarily feed this domain
- **Key agencies** that produce content for this domain
- **High-level keyword themes** (detailed keyword clusters will come in L3+ sessions)
- **Statutory anchors** — the key federal statutes that create this regulatory area (e.g., Controlled Substances Act → `controlled-substances`; HIPAA → `hipaa-privacy`; Social Security Act Title XVIII → `medicare-billing`)

### 5. Cross-Classification Notes

Which other L1 domains does this one frequently overlap with? Describe the overlap pattern at a high level. (Specific cross-classification triggers come at L3+ in Sessions 5-7.)

### 6. Practice-Type Relevance

For **each of Cedar's 14 practice types**, assign a relevance weight:

- **High**: Core regulatory area for this practice type (they need to monitor this actively)
- **Medium**: Frequently relevant (they should be aware of changes)
- **Low**: Occasionally relevant (nice to have visibility)
- **None**: Not relevant to this practice type

Present this as a compact table per L1 domain:

| Practice Type | Relevance |
| --- | --- |
| Functional Medicine | High |
| Hormone Optimization/HRT | High |
| Compounding Pharmacy | Medium |
| ... | ... |

### 7. Estimated Entity Volume

Rough estimate of what percentage of the relevant corpus (post-filtering) would land in this L1 domain. This helps prioritize which branches need the most granular taxonomy.

---

## Deliverable 2: Level 2 Subdomains

For **each L1 domain**, produce its L2 subdomains (targeting 5-8 per L1, more for complex domains). For each L2 subdomain, provide:

### 1. Domain Name

Practitioner-facing label.

### 2. Domain Code

Dot-notation extending the L1 code. Examples: `controlled-substances.prescribing`, `controlled-substances.registration`, `controlled-substances.scheduling`.

### 3. Description

1-2 sentences on scope.

### 4. Classification Signals

- **CFR part ranges** (more specific than L1)
- **Agencies/sub-agencies** specific to this subdomain
- **Key keyword phrases** (5-10 high-signal phrases per L2)
- **Statutory references** specific to this subdomain

### 5. Cross-Classification Notes

Specific overlaps with L2 domains in other L1 branches. Example: `controlled-substances.prescribing` overlaps with `telehealth.prescribing` when content involves telemedicine prescribing of controlled substances.

### 6. Practice-Type Relevance

Same compact table format as L1 — which practice types care about this specific subdomain?

### 7. Depth Indicator

Flag how deep this L2 branch needs to go:

- **Deep (L4-L5)**: High-activity area needing granular taxonomy. Sessions 5-7 will develop these.
- **Standard (L3-L4)**: Moderate depth needed.
- **Shallow (L3 only)**: A few L3 nodes will suffice.

---

## Deliverable 3: Branch Depth Plan

Produce a summary table showing which L2 branches need deep development and which are shallow:

| L2 Domain Code | Depth Indicator | Estimated L3+ Node Count | Assigned Session |
| --- | --- | --- | --- |
| `controlled-substances.prescribing` | Deep (L5) | 15-20 | Session 5 |
| `compounding.503a` | Deep (L5) | 12-15 | Session 5 |
| `fda-regulation.drugs` | Deep (L5) | 15-20 | Session 6 |
| `telehealth.prescribing` | Deep (L4) | 8-12 | Session 6 |
| `hipaa-privacy.privacy-rule` | Standard (L4) | 6-10 | Session 7 |
| `workplace-safety.osha` | Shallow (L3) | 4-6 | Session 7 |
| ... | ... | ... | ... |

Assign each L2 branch to one of Sessions 5, 6, or 7, balancing the workload across sessions. The assignment should consider:

- **Session 5**: Compounding + Controlled Substances deep branches (highest priority for Cedar's users)
- **Session 6**: FDA Regulation + Telehealth deep branches
- **Session 7**: All remaining branches (HIPAA, Medicare/Billing, Operations, Workplace Safety, etc.)

---

## Reference Material

- Cedar repo: https://github.com/cedar-admin/cedar — read `CLAUDE.md` and `docs/architecture/data-architecture-research.md`
- eCFR API: https://www.ecfr.gov/api/versioner/v1/
- NUCC Healthcare Provider Taxonomy: https://www.nucc.org/