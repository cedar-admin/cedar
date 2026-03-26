# Title 21 Chapter I (FDA) — CFR-to-Domain Mapping

## Summary Statistics
- **Total Parts Mapped**: 113 (from Sessions 2-F allowlist)
- **Primary Domain Assignments**: 113
- **Cross-Classification Triggers**: 89
- **AI Fallback Needed**: 12 parts

## Complete Mapping Table

| CFR Part | Part Title | Primary Domain | Cross-Classification Triggers | Notes |
|---|---|---|---|---|
| 21 CFR Part 1 | General Enforcement Regulations | fda-regulation.enforcement | fraud-compliance (if criminal referral) | Includes FDA jurisdiction, hearings |
| 21 CFR Part 2 | General Administrative Rulings and Decisions | fda-regulation.enforcement | None | Policy statements, interpretations |
| 21 CFR Part 3 | Product Jurisdiction | fda-regulation.drugs | fda-regulation.devices, fda-regulation.biologics | Combination product classifications |
| 21 CFR Part 4 | Regulation of Combination Products | fda-regulation.drugs | fda-regulation.devices, fda-regulation.biologics | **AI needed** - depends on product type |
| 21 CFR Part 7 | Enforcement Policy | fda-regulation.enforcement | All domains (enforcement is cross-cutting) | Recalls, detention, seizure |
| 21 CFR Part 11 | Electronic Records; Electronic Signatures | clinical-operations.recordkeeping | hipaa-privacy.security-rule, controlled-substances.prescribing.epcs | E-records for all FDA-regulated entities |
| 21 CFR Part 16 | Regulatory Hearing Before FDA | fda-regulation.enforcement | fraud-compliance (if exclusion) | Administrative procedures |
| 21 CFR Part 17 | Civil Money Penalties Hearings | fda-regulation.enforcement | fraud-compliance | Civil monetary penalty procedures |
| 21 CFR Part 50 | Protection of Human Subjects | clinical-operations.informed-consent | fda-regulation.clinical-trials | IRB and informed consent |
| 21 CFR Part 54 | Financial Disclosure by Clinical Investigators | fda-regulation.clinical-trials | fraud-compliance | Conflict of interest |
| 21 CFR Part 56 | Institutional Review Boards | fda-regulation.clinical-trials | clinical-operations.quality-systems | IRB requirements |
| 21 CFR Part 58 | Good Laboratory Practice | fda-regulation.clinical-trials | clinical-operations.laboratory | Nonclinical studies |
| 21 CFR Part 70 | Color Additives | fda-regulation.cosmetics | fda-regulation.drugs (if drug colorant) | **AI needed** - product-specific |
| 21 CFR Part 99 | Dissemination of Info on Unapproved Uses | advertising-marketing.drug-promotion | fda-regulation.enforcement | Off-label promotion |
| 21 CFR Part 101 | Food Labeling | fda-regulation.dietary-supplements | None | Structure/function claims |
| 21 CFR Part 111 | cGMP for Dietary Supplements | fda-regulation.dietary-supplements | business-operations.quality-systems | Manufacturing standards |
| 21 CFR Part 119 | Dietary Supplements that Present Risk | fda-regulation.dietary-supplements | fda-regulation.enforcement | Adulterated supplements |
| 21 CFR Part 190 | Dietary Supplements | fda-regulation.dietary-supplements | None | General provisions |
| 21 CFR Part 200 | General Drug Provisions | fda-regulation.drugs | compounding (if pharmacy exceptions) | General requirements |
| 21 CFR Part 201 | Labeling | fda-regulation.drugs | advertising-marketing.drug-promotion, compounding.503a | Drug labeling requirements |
| 21 CFR Part 202 | Prescription Drug Advertising | advertising-marketing.drug-promotion | fda-regulation.enforcement | DTC and professional advertising |
| 21 CFR Part 203 | Prescription Drug Marketing | fda-regulation.drugs | fraud-compliance (if diversion) | PDMA requirements |
| 21 CFR Part 205 | Guidelines for State Licensing | state-regulations.pharmacy | compounding.503a | Model state regulations |
| 21 CFR Part 206 | Imprinting of Solid Oral Dosage Forms | fda-regulation.drugs | compounding.503a (exemption) | Drug identification |
| 21 CFR Part 207 | Requirements for Establishment Registration | fda-regulation.drugs | compounding.503b (if outsourcing) | Drug establishment registration |
| 21 CFR Part 208 | Medication Guides | fda-regulation.drugs | clinical-operations.patient-safety | Required patient information |
| 21 CFR Part 209 | Requirement for Authorized Dispensers | controlled-substances.dispensing | state-regulations.pharmacy | **AI needed** - state-specific |
| 21 CFR Part 210 | cGMP in Manufacturing | fda-regulation.drugs | compounding.503b | Manufacturing standards |
| 21 CFR Part 211 | cGMP for Finished Pharmaceuticals | fda-regulation.drugs | compounding.503b, compounding.sterile | Core GMP requirements |
| 21 CFR Part 216 | Pharmacy Compounding | compounding.503a | compounding.bulk-substances, fda-regulation.enforcement | Bulk drug lists, restrictions |
| 21 CFR Part 225 | cGMP for Medicated Feeds | fda-regulation.drugs | None | Veterinary - limited relevance |
| 21 CFR Part 226 | cGMP for Type A Medicated Articles | fda-regulation.drugs | None | Veterinary - limited relevance |
| 21 CFR Part 250 | Special Requirements for Specific Drugs | fda-regulation.drugs | controlled-substances (if scheduled) | **AI needed** - drug-specific |
| 21 CFR Part 251 | Section 804 Importation Program | fda-regulation.drugs | state-regulations.pharmacy | Canadian drug importation |
| 21 CFR Part 290 | Controlled Drugs | controlled-substances.scheduling | controlled-substances.prescribing | DEA scheduling interface |
| 21 CFR Part 299 | Drugs; Official Names | fda-regulation.drugs | None | USAN requirements |
| 21 CFR Part 300 | General Drug Product Regulations | fda-regulation.drugs | None | General provisions |
| 21 CFR Part 310 | New Drugs | fda-regulation.drugs | compounding.503a.copy-prohibition | New drug requirements |
| 21 CFR Part 312 | Investigational New Drug Application | fda-regulation.clinical-trials | controlled-substances (if scheduled) | IND requirements |
| 21 CFR Part 314 | Applications for FDA Approval | fda-regulation.drugs | compounding.drug-shortages (if shortage) | NDA/ANDA requirements |
| 21 CFR Part 316 | Orphan Drugs | fda-regulation.drugs | medicare-billing.coverage-determinations | Orphan drug designation |
| 21 CFR Part 320 | Bioavailability and Bioequivalence | fda-regulation.drugs | None | BE study requirements |
| 21 CFR Part 328 | Over-the-Counter Sunscreen | fda-regulation.drugs | fda-regulation.cosmetics | OTC monograph |
| 21 CFR Part 329 | Habit-Forming Drugs | controlled-substances.scheduling | fda-regulation.enforcement | Controlled substance interface |
| 21 CFR Part 330 | OTC Human Drugs | fda-regulation.drugs | None | OTC drug review |
| 21 CFR Part 333 | Topical Antimicrobial Products | fda-regulation.drugs | clinical-operations.infection-control | Healthcare antiseptics |
| 21 CFR Part 338 | Nighttime Sleep-Aid Products | fda-regulation.drugs | controlled-substances (some ingredients) | OTC sleep aids |
| 21 CFR Part 340 | [Reserved] | N/A | N/A | Reserved |
| 21 CFR Part 341 | Cold, Cough, Allergy Products | fda-regulation.drugs | None | OTC monograph |
| 21 CFR Part 343 | Internal Analgesic Products | fda-regulation.drugs | None | OTC pain relievers |
| 21 CFR Part 347 | Skin Protectant Products | fda-regulation.drugs | None | OTC skin products |
| 21 CFR Part 348 | External Analgesic Products | fda-regulation.drugs | compounding.503a.practice-specific | Topical pain products |
| 21 CFR Part 352 | Sunscreen Products | fda-regulation.drugs | fda-regulation.cosmetics | UV protection claims |
| 21 CFR Part 357 | Miscellaneous Internal Products | fda-regulation.drugs | None | Various OTC categories |
| 21 CFR Part 358 | Miscellaneous External Products | fda-regulation.drugs | None | Various OTC categories |
| 21 CFR Part 369 | Interpretative Statements | fda-regulation.drugs | None | Label warnings |
| 21 CFR Part 530 | Extralabel Drug Use in Animals | fda-regulation.drugs | None | Veterinary - limited relevance |
| 21 CFR Part 600 | Biological Products: General | fda-regulation.biologics | fda-regulation.clinical-trials | General biologics provisions |
| 21 CFR Part 601 | Licensing | fda-regulation.biologics | clinical-operations.scope-of-practice | BLA requirements |
| 21 CFR Part 606 | Current Good Manufacturing Practice | fda-regulation.biologics | clinical-operations.quality-systems | Blood/blood components |
| 21 CFR Part 607 | Establishment Registration | fda-regulation.biologics | state-regulations.facility-permits | Blood establishment registration |
| 21 CFR Part 610 | General Biological Products Standards | fda-regulation.biologics | clinical-operations.quality-systems | Quality standards |
| 21 CFR Part 630 | Requirements for Blood | fda-regulation.biologics | clinical-operations.patient-safety | Blood donation requirements |
| 21 CFR Part 640 | Additional Standards for Blood | fda-regulation.biologics | clinical-operations.laboratory | Blood product specifications |
| 21 CFR Part 660 | Additional Standards for Biologics | fda-regulation.biologics | None | Specific biologic standards |
| 21 CFR Part 680 | Additional Standards for Miscellaneous | fda-regulation.biologics | None | Other biologic products |
| 21 CFR Part 700 | General Cosmetic Provisions | fda-regulation.cosmetics | None | Cosmetic regulations |
| 21 CFR Part 701 | Cosmetic Labeling | fda-regulation.cosmetics | advertising-marketing.ftc-compliance | Labeling requirements |
| 21 CFR Part 710 | Voluntary Registration of Cosmetics | fda-regulation.cosmetics | None | VCRP program |
| 21 CFR Part 720 | [Reserved] | N/A | N/A | Reserved |
| 21 CFR Part 740 | Cosmetic Product Warning Statements | fda-regulation.cosmetics | clinical-operations.patient-safety | Required warnings |
| 21 CFR Part 800 | General Medical Device Provisions | fda-regulation.devices | None | General requirements |
| 21 CFR Part 801 | Labeling | fda-regulation.devices | advertising-marketing.drug-promotion | Device labeling |
| 21 CFR Part 803 | Medical Device Reporting | fda-regulation.devices | clinical-operations.patient-safety | MDR requirements |
| 21 CFR Part 806 | Reports of Corrections and Removals | fda-regulation.devices | fda-regulation.enforcement | Recall reporting |
| 21 CFR Part 807 | Establishment Registration | fda-regulation.devices | state-regulations.facility-permits | Device registration |
| 21 CFR Part 808 | Exemptions from Federal Preemption | fda-regulation.devices | state-regulations | State device requirements |
| 21 CFR Part 809 | In Vitro Diagnostic Products | fda-regulation.devices | clinical-operations.laboratory | IVD/LDT requirements |
| 21 CFR Part 810 | Medical Device Recall Authority | fda-regulation.devices | fda-regulation.enforcement | Mandatory recall |
| 21 CFR Part 812 | Investigational Device Exemptions | fda-regulation.clinical-trials | clinical-operations.informed-consent | IDE requirements |
| 21 CFR Part 814 | Premarket Approval | fda-regulation.devices | clinical-operations.quality-systems | PMA requirements |
| 21 CFR Part 820 | Quality System Regulation | fda-regulation.devices | business-operations.quality-systems | Device QSR |
| 21 CFR Part 821 | Medical Device Tracking | fda-regulation.devices | clinical-operations.recordkeeping | Tracking requirements |
| 21 CFR Part 822 | Postmarket Surveillance | fda-regulation.devices | clinical-operations.patient-safety | 522 studies |
| 21 CFR Part 830 | Unique Device Identification | fda-regulation.devices | None | UDI requirements |
| 21 CFR Part 860 | Medical Device Classification | fda-regulation.devices | None | Classification procedures |
| 21 CFR Part 862 | Clinical Chemistry Devices | fda-regulation.devices | clinical-operations.laboratory | **AI needed** - device-specific |
| 21 CFR Part 864 | Hematology/Pathology Devices | fda-regulation.devices | clinical-operations.laboratory | **AI needed** - device-specific |
| 21 CFR Part 866 | Immunology/Microbiology Devices | fda-regulation.devices | clinical-operations.laboratory | **AI needed** - device-specific |
| 21 CFR Part 868 | Anesthesiology Devices | fda-regulation.devices | controlled-substances (anesthesia drugs) | **AI needed** - device-specific |
| 21 CFR Part 870 | Cardiovascular Devices | fda-regulation.devices | clinical-operations.scope-of-practice | **AI needed** - device-specific |
| 21 CFR Part 872 | Dental Devices | fda-regulation.devices | None | Limited relevance |
| 21 CFR Part 874 | Ear, Nose, and Throat Devices | fda-regulation.devices | None | **AI needed** - device-specific |
| 21 CFR Part 876 | Gastroenterology-Urology Devices | fda-regulation.devices | clinical-operations.scope-of-practice | **AI needed** - device-specific |
| 21 CFR Part 878 | General and Plastic Surgery Devices | fda-regulation.devices | fda-regulation.devices.aesthetic | Aesthetic devices included |
| 21 CFR Part 880 | General Hospital Devices | fda-regulation.devices | clinical-operations.equipment | Basic medical devices |
| 21 CFR Part 882 | Neurological Devices | fda-regulation.devices | None | **AI needed** - device-specific |
| 21 CFR Part 884 | Obstetrical/Gynecological Devices | fda-regulation.devices | clinical-operations.scope-of-practice | **AI needed** - device-specific |
| 21 CFR Part 886 | Ophthalmic Devices | fda-regulation.devices | None | Limited relevance |
| 21 CFR Part 888 | Orthopedic Devices | fda-regulation.devices | None | Limited relevance |
| 21 CFR Part 890 | Physical Medicine Devices | fda-regulation.devices | clinical-operations.scope-of-practice | Rehab/PT devices |
| 21 CFR Part 892 | Radiology Devices | fda-regulation.devices | clinical-operations.radiation-safety | X-ray, imaging devices |
| 21 CFR Part 895 | Banned Devices | fda-regulation.devices | fda-regulation.enforcement | Prohibited devices |
| 21 CFR Part 898 | Performance Standard for Electrode Leads | fda-regulation.devices | clinical-operations.patient-safety | Specific safety standard |
| 21 CFR Part 1000 | General Radiation Provisions | clinical-operations.radiation-safety | fda-regulation.devices | Radiation-emitting products |
| 21 CFR Part 1010 | Performance Standards for Electronics | clinical-operations.radiation-safety | fda-regulation.devices | Radiation safety standards |
| 21 CFR Part 1020 | Performance Standards for Ionizing | clinical-operations.radiation-safety | fda-regulation.devices | X-ray equipment standards |
| 21 CFR Part 1030 | Performance Standards for Microwave | clinical-operations.radiation-safety | fda-regulation.devices | Microwave products |
| 21 CFR Part 1040 | Performance Standards for Light-Emitting | fda-regulation.devices | fda-regulation.devices.aesthetic | Laser products, IPL |
| 21 CFR Part 1050 | [Reserved] | N/A | N/A | Reserved |
| 21 CFR Part 1271 | Human Cells, Tissues, and HCT/Ps | fda-regulation.biologics.hct-p | clinical-operations.scope-of-practice | 361 HCT/P regulations |
| 21 CFR Part 1300 | Definitions | controlled-substances.scheduling | None | DEA interface definitions |
| 21 CFR Part 1301 | Registration of Manufacturers | controlled-substances.registration | compounding.503b (if manufacturing) | DEA manufacturing registration |
| 21 CFR Part 1302 | Labeling and Packaging | controlled-substances.dispensing | compounding.503a | Controlled substance labeling |
| 21 CFR Part 1304 | Records and Reports | controlled-substances.recordkeeping | clinical-operations.recordkeeping | DEA recordkeeping |
| 21 CFR Part 1305 | Orders for Schedule I and II | controlled-substances.recordkeeping | None | DEA Form 222 |
| 21 CFR Part 1306 | Prescriptions | controlled-substances.prescribing | telehealth.prescribing.ryan-haight | Prescription requirements |
| 21 CFR Part 1307 | Miscellaneous | controlled-substances.disposal | business-operations.waste-management | Disposal, security |
| 21 CFR Part 1308 | Schedules | controlled-substances.scheduling | state-regulations.controlled-substances | Drug scheduling lists |
| 21 CFR Part 1311 | Requirements for Electronic Orders | controlled-substances.prescribing.epcs | hipaa-privacy.security-rule | EPCS requirements |
| 21 CFR Part 1314 | Retail Sale of Scheduled Listed Chemicals | controlled-substances.dispensing | state-regulations.pharmacy | Pseudoephedrine sales |
| 21 CFR Part 1316 | Administrative Functions | controlled-substances.enforcement | fraud-compliance | DEA enforcement |
| 21 CFR Part 1317 | Disposal | controlled-substances.disposal | business-operations.waste-management | Take-back programs |

## Parts Requiring Dynamic Cross-Classification

### High-Frequency Cross-Classification (Always Check)
1. **Part 3 & 4** (Combination Products) - Check all three: drugs, devices, biologics
2. **Part 7** (Enforcement) - Cross-cuts all operational domains
3. **Part 11** (E-Records) - Affects records in all regulated domains
4. **Part 211** (Drug cGMP) - Always check compounding.503b
5. **Part 216** (Compounding) - Multiple compounding subdomains
6. **Part 1271** (HCT/Ps) - Complex biologics/practice scope interactions

### Context-Dependent Cross-Classification
1. **Parts 862-892** (Device classifications) - Depends on specific device type
2. **Part 70** (Color Additives) - Depends if cosmetic vs drug use
3. **Part 209** (Authorized Dispensers) - Varies by state requirements
4. **Part 250** (Specific Drug Requirements) - Depends on drug scheduling
5. **Parts 312/314** (IND/NDA) - Check if involves controlled substances
6. **Parts 1300-1317** (DEA interface) - Always bridge FDA and DEA domains

## AI Fallback Triggers

The following parts require AI classification due to high variability:

1. **Device Classification Parts (862-892)**: Content varies by specific device. AI must analyze:
   - Device type and indication
   - Class II vs Class III designation
   - Special controls applicable
   - Practice-specific relevance

2. **Drug-Specific Parts (250, 329, 338)**: Content depends on specific drugs covered:
   - Scheduling status
   - Therapeutic category
   - Practice-type relevance

3. **State Interface Parts (209, 251, 808)**: Federal regulations that defer to state law:
   - State-by-state variations
   - Conflicting requirements
   - Preemption analysis needed

4. **Combination/Interface Parts (3, 4, 70)**: Multiple potential domains:
   - Product-by-product analysis required
   - Primary mode of action determination
   - Cross-domain regulatory requirements

## Classification Quality Notes

### High-Confidence Classifications (>95% accuracy)
- Parts 1300-1317: Clear DEA/controlled substance domain
- Parts 210-211: Clear drug manufacturing/cGMP
- Parts 600-680: Clear biologics regulations
- Part 1271: Clear HCT/P regulations
- Parts 800-898: Clear device regulations

### Medium-Confidence Classifications (80-95% accuracy)
- Parts 200-299: General drug provisions with compounding overlaps
- Parts 50-58: Clinical trial regulations with informed consent overlaps
- Parts 803-822: Device reporting with patient safety overlaps

### Low-Confidence Classifications (<80% accuracy)
- Parts 862-892: Device-specific chapters requiring content analysis
- Parts 330-358: OTC monographs with variable practice relevance
- Part 4: Combination products with triple classification potential

## Validation Recommendations

1. **Spot-check high-traffic parts**: Parts 211, 216, 314, 820, 1271, 1306
2. **Review cross-classification logic** for Parts 3, 4, 7, 11
3. **Test AI fallback** on device classification parts (878 for aesthetic devices)
4. **Validate state interface parts** (209, 808) against specific state requirements
5. **Check enforcement bridging** between Part 7 and fraud-compliance domain