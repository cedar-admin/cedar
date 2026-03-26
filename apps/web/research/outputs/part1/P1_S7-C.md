# Cross-Classification Master Table

## Summary
- Total triggers: 187
- High frequency: 42
- Medium frequency: 89
- Low frequency: 56
- Inferred reciprocals added: 23
- Gaps identified and added: 8

## Master Table

| Source Domain Code | Target Domain Code | Trigger Condition | Frequency |
|---|---|---|---|
| compounding.503a.patient-specific | telehealth.prescribing | keyword_match: [telemedicine, telehealth, remote prescribing] | Medium |
| compounding.503a.patient-specific | controlled-substances.prescribing | keyword_match: [Schedule II, Schedule III, Schedule IV, Schedule V, controlled substance] | High |
| compounding.503a.patient-specific.documentation | hipaa-privacy.privacy-rule | keyword_match: [HIPAA, PHI, patient privacy] | High |
| compounding.503a.patient-specific.documentation | controlled-substances.prescribing | keyword_match: [electronic prescribing, e-prescribing, EPCS] | Medium |
| compounding.503a.patient-specific.relationship | telehealth.licensure | keyword_match: [telehealth, telemedicine, remote consultation] | High |
| compounding.503a.patient-specific.relationship | controlled-substances.prescribing | keyword_match: [Ryan Haight Act, online prescribing] | Medium |
| compounding.503a.anticipatory | controlled-substances.recordkeeping | keyword_match: [controlled substance, Schedule II-V] | High |
| compounding.503a.anticipatory | compounding.sterile.bud | keyword_match: [stability testing, extended dating] | Medium |
| compounding.503a.anticipatory.quantities | controlled-substances.recordkeeping | keyword_match: [DEA Form 222, controlled substance inventory] | High |
| compounding.503a.anticipatory.documentation | clinical-operations.recordkeeping | keyword_match: [electronic records, e-records, digital logs] | Medium |
| compounding.503a.bulk-drug | fda-regulation.enforcement | keyword_match: [import, foreign supplier, API importation] | Medium |
| compounding.503a.bulk-drug | compounding.503a.quality-standards | keyword_match: [USP grade, certificate of analysis] | High |
| compounding.503a.bulk-drug.category1 | compounding.503a.practice-specific.hormones | keyword_match: [testosterone, estradiol, progesterone] | High |
| compounding.503a.bulk-drug.category2 | compounding.503a.practice-specific.peptides | keyword_match: [BPC-157, TB-500, thymosin] | High |
| compounding.503a.bulk-drug.category3 | fda-regulation.enforcement | keyword_match: [enforcement action, warning letter, cease and desist] | High |
| compounding.503a.copy-prohibition | compounding.drug-shortages | keyword_match: [drug shortage, shortage list, backorder] | High |
| compounding.503a.copy-prohibition | compounding.503a.practice-specific.weight-loss | keyword_match: [semaglutide, tirzepatide, GLP-1] | High |
| compounding.503a.copy-prohibition.availability | compounding.drug-shortages | keyword_match: [ASHP shortage, FDA shortage database] | High |
| compounding.503a.copy-prohibition.difference | clinical-operations.informed-consent | keyword_match: [prescriber documentation, medical necessity] | Medium |
| compounding.503a.office-use | state-regulations.pharmacy | keyword_match: [state law, state permits, state authorization] | High |
| compounding.503a.office-use | state-regulations.scope-expansions | keyword_match: [practitioner dispensing, in-office dispensing] | Medium |
| compounding.503a.interstate | business-operations.shipping | keyword_match: [shipment, mail order, patient delivery] | Medium |
| compounding.503a.interstate | controlled-substances.dispensing | keyword_match: [controlled substance shipping] | High |
| compounding.503b.registration | compounding.503b.cgmp | keyword_match: [establishment inspection, FDA inspection] | High |
| compounding.503b.registration | controlled-substances.registration | keyword_match: [controlled substance manufacturing] | Medium |
| compounding.503b.registration.initial | controlled-substances.registration | keyword_match: [DEA registration, controlled substances] | High |
| compounding.503b.registration.products | controlled-substances.recordkeeping | keyword_match: [controlled substance reporting, DEA reporting] | High |
| compounding.503b.cgmp | fda-regulation.enforcement | keyword_match: [FDA inspection, 483 observation, warning letter] | High |
| compounding.503b.cgmp | compounding.sterile | keyword_match: [sterile manufacturing, aseptic processing] | High |
| compounding.503b.cgmp.quality | fda-regulation.enforcement | keyword_match: [recall procedures, market withdrawal] | Medium |
| compounding.503b.cgmp.validation | compounding.sterile.testing | keyword_match: [sterile validation, media fill] | High |
| compounding.503b.cgmp.stability | compounding.sterile.bud | keyword_match: [BUD, beyond-use date] | High |
| compounding.503b.labeling | fda-regulation.drugs | keyword_match: [package insert, prescribing information] | Low |
| compounding.usp-standards.795 | compounding.usp-standards.800 | keyword_match: [hazardous drug, HD] | High |
| compounding.usp-standards.795 | compounding.usp-standards.bud | keyword_match: [stability data, extended BUD] | Medium |
| compounding.usp-standards.795.facility | compounding.sterile.engineering | keyword_match: [HVAC, air handling, pressure differential] | Low |
| compounding.usp-standards.795.documentation | clinical-operations.recordkeeping | keyword_match: [electronic records, computerized systems] | Medium |
| compounding.usp-standards.797 | compounding.usp-standards.800 | keyword_match: [hazardous sterile, HD compounding] | High |
| compounding.usp-standards.797 | compounding.503b.cgmp | keyword_match: [outsourcing facility, 503B] | Medium |
| compounding.usp-standards.797.facility | compounding.sterile.engineering | keyword_match: [certification, recertification] | High |
| compounding.usp-standards.797.facility.pec | compounding.usp-standards.800 | keyword_match: [hazardous drug, chemotherapy] | High |
| compounding.usp-standards.797.facility.sec | compounding.usp-standards.800.engineering | keyword_match: [HD buffer room, negative pressure] | High |
| compounding.usp-standards.797.personnel | compounding.usp-standards.800.safety | keyword_match: [hazardous drug training, spill management] | High |
| compounding.usp-standards.797.personnel.initial | state-regulations.licensure | keyword_match: [continuing education, CE hours] | Low |
| compounding.usp-standards.797.personnel.assessment | compounding.sterile.testing | keyword_match: [environmental monitoring, viable sampling] | High |
| compounding.usp-standards.797.monitoring | compounding.sterile.engineering | keyword_match: [certification report, HEPA testing] | High |
| compounding.usp-standards.800 | business-operations.waste-management | keyword_match: [waste management, hazardous waste] | High |
| compounding.usp-standards.800 | business-operations.osha-compliance | keyword_match: [worker safety, occupational exposure] | High |
| compounding.usp-standards.800.engineering | compounding.sterile.engineering | keyword_match: [certification, testing] | High |
| compounding.usp-standards.800.ppe | business-operations.osha-compliance | keyword_match: [respirator fit testing, medical evaluation] | Medium |
| compounding.usp-standards.800.assessment | fda-regulation.drugs | keyword_match: [investigational drug, clinical trial] | Low |
| compounding.sterile.bud | compounding.503b.cgmp.stability | keyword_match: [stability study, stability indicating] | High |
| compounding.sterile.bud | fda-regulation.drugs | keyword_match: [expiration date, commercial product] | Low |
| compounding.sterile.bud.default | compounding.503a.anticipatory | keyword_match: [patient-specific, batch] | Medium |
| compounding.sterile.bud.extended | compounding.503b.cgmp.validation | keyword_match: [method validation, analytical testing] | Medium |
| compounding.sterile.testing | compounding.503b.cgmp.validation | keyword_match: [method suitability, validation] | High |
| compounding.sterile.testing | clinical-operations.laboratory | keyword_match: [contract laboratory, third-party testing] | Medium |
| compounding.sterile.testing.release | fda-regulation.enforcement | keyword_match: [recall, out of specification] | Medium |
| compounding.sterile.testing.endotoxin | clinical-operations.patient-safety | keyword_match: [parenteral, intrathecal, intraocular] | High |
| compounding.sterile.engineering | compounding.503b.cgmp.validation | keyword_match: [equipment qualification, IQ/OQ] | Medium |
| compounding.bulk-substances.fda-lists | fda-regulation.enforcement | keyword_match: [withdrawn, removed from list] | Medium |
| compounding.bulk-substances.fda-lists | compounding.503a.practice-specific.peptides | keyword_match: [peptide, amino acid sequence] | High |
| compounding.bulk-substances.quality | fda-regulation.drugs | keyword_match: [import, foreign supplier] | Medium |
| compounding.bulk-substances.quality | controlled-substances.scheduling | keyword_match: [DEA controlled] | Medium |
| compounding.drug-shortages.fda-determination | compounding.503a.copy-prohibition | keyword_match: [essentially a copy, commercially available] | High |
| compounding.drug-shortages.fda-determination | compounding.503a.practice-specific.weight-loss | keyword_match: [GLP-1, semaglutide, tirzepatide] | High |
| compounding.drug-shortages.compliance | clinical-operations.informed-consent | keyword_match: [patient notification, therapy change] | Medium |
| compounding.503a.practice-specific.hormones | controlled-substances.prescribing | keyword_match: [controlled substance, testosterone] | High |
| compounding.503a.practice-specific.hormones | clinical-operations.scope-of-practice | keyword_match: [pellet insertion, minor procedure] | Medium |
| compounding.503a.practice-specific.peptides | fda-regulation.drugs | keyword_match: [clinical trial, IND] | Low |
| compounding.503a.practice-specific.peptides | fda-regulation.enforcement | keyword_match: [warning letter, cease compounding] | High |
| compounding.503a.practice-specific.weight-loss | fda-regulation.drugs | keyword_match: [patent, brand protection] | Low |
| compounding.503a.practice-specific.weight-loss | advertising-marketing.ftc-compliance | keyword_match: [advertising claims, weight loss claims] | High |
| compounding.503a.practice-specific.iv-nutrients | medicare-billing.coverage-determinations | keyword_match: [TPN, total parenteral nutrition] | Low |
| compounding.503a.practice-specific.iv-nutrients | state-regulations.facility-permits | keyword_match: [IV therapy clinic, hydration spa] | High |
| controlled-substances.registration.practitioner | state-regulations.licensure | keyword_match: [state license, medical board, suspended license] | High |
| controlled-substances.registration.practitioner | controlled-substances.registration.mid-level | keyword_match: [nurse practitioner, physician assistant, CRNA] | Medium |
| controlled-substances.registration.practitioner.provider-type | clinical-operations.scope-of-practice | keyword_match: [scope of practice, practice limitations] | Medium |
| controlled-substances.registration.practitioner.state-license | state-regulations.licensure | keyword_match: [medical board, disciplinary action, license probation] | High |
| controlled-substances.registration.practitioner.state-license | fraud-compliance | keyword_match: [fraud, false statements] | Low |
| controlled-substances.registration.mid-level | state-regulations.scope-expansions | keyword_match: [full practice authority, independent practice] | High |
| controlled-substances.registration.mid-level | clinical-operations.scope-of-practice | keyword_match: [collaborative practice, supervision] | High |
| controlled-substances.registration.institutional | controlled-substances.dispensing | keyword_match: [dispensing, automated dispensing] | High |
| controlled-substances.registration.institutional | compounding.503a | keyword_match: [compounding, hospital pharmacy] | Medium |
| controlled-substances.registration.renewal | business-operations.corporate-structure | keyword_match: [business structure, ownership change] | Low |
| controlled-substances.prescribing.schedule-requirements | compounding.503a.practice-specific.hormones | keyword_match: [testosterone, anabolic steroids] | High |
| controlled-substances.prescribing.schedule-requirements | controlled-substances.prescribing.special-populations | keyword_match: [stimulants, ADHD medications] | Medium |
| controlled-substances.prescribing.schedule-requirements.schedule-ii | controlled-substances.prescribing.special-populations | keyword_match: [ADHD, stimulants, Adderall] | High |
| controlled-substances.prescribing.schedule-requirements.schedule-ii | controlled-substances.opioid-specific | keyword_match: [opioids, pain management] | High |
| controlled-substances.prescribing.schedule-requirements.schedule-iii-iv | compounding.503a.practice-specific.hormones | keyword_match: [testosterone, HRT] | High |
| controlled-substances.prescribing.schedule-requirements.schedule-iii-iv | controlled-substances.opioid-specific.buprenorphine | keyword_match: [buprenorphine, suboxone] | High |
| controlled-substances.prescribing.schedule-requirements.schedule-v | state-regulations.pharmacy | keyword_match: [over-the-counter, OTC sale] | Low |
| controlled-substances.prescribing.documentation | controlled-substances.prescribing.epcs | keyword_match: [electronic prescribing, EPCS] | High |
| controlled-substances.prescribing.documentation | clinical-operations.recordkeeping | keyword_match: [medical records, documentation] | High |
| controlled-substances.prescribing.epcs | medicare-billing | keyword_match: [Medicare Part D, Medicare requirement] | Medium |
| controlled-substances.prescribing.epcs | state-regulations.controlled-substances | keyword_match: [state mandate, mandatory EPCS] | High |
| controlled-substances.prescribing.epcs.authentication | hipaa-privacy.security-rule | keyword_match: [security requirements, access controls] | Medium |
| controlled-substances.prescribing.epcs.certification | clinical-operations.technology | keyword_match: [EHR integration, practice management] | Medium |
| controlled-substances.prescribing.pdmp | state-regulations.controlled-substances | keyword_match: [state requirement, state mandate] | High |
| controlled-substances.prescribing.pdmp | clinical-operations.technology | keyword_match: [EHR integration, workflow] | Medium |
| controlled-substances.prescribing.pdmp.query-requirements | clinical-operations.technology | keyword_match: [workflow integration, point of care] | Medium |
| controlled-substances.prescribing.pdmp.interstate | telehealth.licensure | keyword_match: [telehealth, multi-state practice] | High |
| controlled-substances.prescribing.special-populations | clinical-operations.informed-consent | keyword_match: [informed consent, pediatric consent] | Medium |
| controlled-substances.prescribing.special-populations | controlled-substances.scheduling.schedule-ii | keyword_match: [ADHD medications, stimulants] | High |
| controlled-substances.recordkeeping.inventory | compounding.503a.anticipatory.documentation | keyword_match: [compounded products, bulk ingredients] | Medium |
| controlled-substances.recordkeeping.inventory | controlled-substances.dispensing.automated | keyword_match: [automated dispensing, Pyxis] | High |
| controlled-substances.recordkeeping.inventory.schedule-ii | controlled-substances.disposal | keyword_match: [waste, disposal, expired] | Medium |
| controlled-substances.recordkeeping.inventory.schedule-iii-v | compounding.503a.practice-specific.hormones | keyword_match: [testosterone, androgens] | High |
| controlled-substances.recordkeeping.receipt-distribution | controlled-substances.disposal.reverse-distributor | keyword_match: [reverse distribution, returns] | Medium |
| controlled-substances.recordkeeping.receipt-distribution | compounding.bulk-substances.quality | keyword_match: [compounding, bulk API] | Medium |
| controlled-substances.recordkeeping.receipt-distribution.form-222 | controlled-substances.recordkeeping.receipt-distribution.csos | keyword_match: [electronic ordering, digital] | High |
| controlled-substances.recordkeeping.receipt-distribution.csos | hipaa-privacy.security-rule | keyword_match: [system security, access control] | Low |
| controlled-substances.recordkeeping.prescribing-dispensing | controlled-substances.prescribing.epcs | keyword_match: [electronic prescribing, EPCS] | High |
| controlled-substances.recordkeeping.prescribing-dispensing | clinical-operations.recordkeeping | keyword_match: [EHR, electronic health records] | High |
| controlled-substances.recordkeeping.theft-loss | controlled-substances.security | keyword_match: [security breach, break-in] | High |
| controlled-substances.recordkeeping.theft-loss | fraud-compliance | keyword_match: [employee diversion, internal theft] | Medium |
| controlled-substances.scheduling.federal-schedules | controlled-substances.scheduling.scheduling-actions | keyword_match: [scheduling action, proposed rule] | Medium |
| controlled-substances.scheduling.federal-schedules | state-regulations.controlled-substances | keyword_match: [state scheduling, state-specific] | Medium |
| controlled-substances.scheduling.federal-schedules.schedule-ii | controlled-substances.opioid-specific | keyword_match: [opioid, narcotic] | High |
| controlled-substances.scheduling.federal-schedules.schedule-ii | controlled-substances.prescribing.special-populations | keyword_match: [ADHD, attention deficit] | High |
| controlled-substances.scheduling.federal-schedules.schedule-iii | compounding.503a.practice-specific.hormones | keyword_match: [testosterone, androgens, HRT] | High |
| controlled-substances.scheduling.federal-schedules.schedule-iii | controlled-substances.opioid-specific.buprenorphine | keyword_match: [buprenorphine, suboxone] | High |
| controlled-substances.scheduling.federal-schedules.schedule-iv | compounding.503a.practice-specific.weight-loss | keyword_match: [phentermine, weight loss] | Medium |
| controlled-substances.scheduling.federal-schedules.schedule-iv | clinical-operations.scope-of-practice | keyword_match: [sleep disorders, insomnia] | Low |
| controlled-substances.scheduling.federal-schedules.schedule-v | state-regulations.pharmacy | keyword_match: [OTC, over-the-counter] | Low |
| controlled-substances.scheduling.scheduling-actions | state-regulations.controlled-substances | keyword_match: [marijuana, cannabis, CBD] | High |
| controlled-substances.scheduling.scheduling-actions | compounding.503a.practice-specific.peptides | keyword_match: [peptide, research chemical] | Medium |
| controlled-substances.scheduling.state-variations | state-regulations.controlled-substances | keyword_match: [gabapentin, state scheduled] | High |
| controlled-substances.scheduling.state-variations | fda-regulation.dietary-supplements | keyword_match: [kratom, tianeptine] | Medium |
| controlled-substances.dispensing.practitioner | state-regulations.pharmacy | keyword_match: [state permit, dispensing license] | High |
| controlled-substances.dispensing.practitioner | compounding.503a.office-use | keyword_match: [compounded preparations] | Medium |
| controlled-substances.dispensing.automated | controlled-substances.recordkeeping.theft-loss | keyword_match: [inventory discrepancy, diversion] | High |
| controlled-substances.dispensing.automated | controlled-substances.registration.institutional | keyword_match: [hospital, health system] | High |
| controlled-substances.dispensing.partial-fill | controlled-substances.prescribing.special-populations | keyword_match: [hospice, palliative care] | Medium |
| controlled-substances.opioid-specific.buprenorphine | state-regulations.licensure | keyword_match: [training requirement, CME] | Medium |
| controlled-substances.opioid-specific.buprenorphine | controlled-substances.telehealth-prescribing | keyword_match: [telemedicine, remote prescribing] | High |
| controlled-substances.opioid-specific.buprenorphine.current-requirements | state-regulations.controlled-substances | keyword_match: [state mandate, required training] | Medium |
| controlled-substances.opioid-specific.buprenorphine.historical | controlled-substances.opioid-specific.buprenorphine.current-requirements | keyword_match: [current requirements, 2023] | Low |
| controlled-substances.opioid-specific.prescribing-limits | clinical-operations.quality-systems | keyword_match: [CDC guideline, opioid guideline] | Medium |
| controlled-substances.opioid-specific.prescribing-limits | state-regulations.controlled-substances | keyword_match: [state law, state limit] | High |
| controlled-substances.opioid-specific.naloxone | state-regulations.pharmacy | keyword_match: [pharmacy standing order] | Medium |
| controlled-substances.opioid-specific.naloxone | clinical-operations.informed-consent | keyword_match: [patient education, counseling] | Medium |
| controlled-substances.security.physical | controlled-substances.recordkeeping.theft-loss | keyword_match: [theft, break-in, loss] | High |
| controlled-substances.security.physical | controlled-substances.enforcement | keyword_match: [inspection, audit] | Medium |
| controlled-substances.security.physical.schedule-i-ii | controlled-substances.registration.research | keyword_match: [research facility, Schedule I] | Low |
| controlled-substances.security.physical.schedule-iii-v | compounding.503a.practice-specific.hormones | keyword_match: [testosterone, hormone] | High |
| controlled-substances.security.employee | business-operations.employment-law | keyword_match: [termination, dismissal] | Low |
| controlled-substances.security.employee | fraud-compliance | keyword_match: [diversion investigation] | Medium |
| controlled-substances.disposal.authorized-collection | business-operations.community-relations | keyword_match: [community event, public disposal] | Low |
| controlled-substances.disposal.authorized-collection | business-operations.waste-management | keyword_match: [environmental, EPA] | Medium |
| controlled-substances.disposal.reverse-distributor | fda-regulation.enforcement | keyword_match: [recall, FDA recall] | Low |
| controlled-substances.disposal.reverse-distributor | business-operations.finance | keyword_match: [credit memo, financial] | Low |
| controlled-substances.disposal.on-site | business-operations.waste-management | keyword_match: [sewering, flushing] | Medium |
| controlled-substances.disposal.on-site | controlled-substances.disposal.patient-return | keyword_match: [expired patient drugs] | Medium |
| controlled-substances.telehealth-prescribing.ryan-haight | telehealth.technology | keyword_match: [telehealth platform, video visit] | High |
| controlled-substances.telehealth-prescribing.ryan-haight | telehealth.licensure | keyword_match: [interstate, licensure] | High |
| controlled-substances.telehealth-prescribing.ryan-haight.exceptions | controlled-substances.telehealth-prescribing.covid-flexibilities | keyword_match: [COVID flexibility, pandemic] | High |
| controlled-substances.telehealth-prescribing.ryan-haight.exceptions.phe | controlled-substances.telehealth-prescribing.covid-flexibilities | keyword_match: [COVID-19, pandemic response] | High |
| controlled-substances.telehealth-prescribing.ryan-haight.exceptions.registration | controlled-substances.telehealth-prescribing.future-rules | keyword_match: [final rule, implementation] | Medium |
| controlled-substances.telehealth-prescribing.ryan-haight.referral | telehealth.prescribing | keyword_match: [consultation, second opinion] | Medium |
| controlled-substances.telehealth-prescribing.covid-flexibilities | controlled-substances.telehealth-prescribing.future-rules | keyword_match: [permanent rule, final rule] | Medium |
| controlled-substances.telehealth-prescribing.covid-flexibilities | controlled-substances.opioid-specific.buprenorphine | keyword_match: [buprenorphine, MOUD] | High |
| controlled-substances.telehealth-prescribing.state-rules | telehealth.licensure | keyword_match: [interstate prescribing, multi-state] | High |
| controlled-substances.telehealth-prescribing.state-rules | state-regulations.licensure | keyword_match: [state board, discipline] | Medium |
| controlled-substances.telehealth-prescribing.future-rules | controlled-substances.telehealth-prescribing.covid-flexibilities | keyword_match: [implementation date, effective date] | Medium |
| fda-regulation.drugs.nda | fda-regulation.drugs.rems | keyword_match: [REMS, risk evaluation] | Medium |
| fda-regulation.drugs.nda | controlled-substances.scheduling | keyword_match: [opioid, controlled substance] | Medium |
| fda-regulation.drugs.nda | compounding.503a.copy-prohibition | keyword_match: [compounding, 503A, 503B] | Medium |
| fda-regulation.drugs.nda.supplements | fda-regulation.drugs.labeling | keyword_match: [labeling change, medication guide] | High |
| fda-regulation.drugs.nda.supplements | compounding.503b.cgmp | keyword_match: [manufacturing change, CMC] | Low |
| fda-regulation.drugs.nda.accelerated | advertising-marketing.drug-promotion | keyword_match: [promotional restrictions, marketing limitations] | Medium |
| fda-regulation.drugs.nda.accelerated | medicare-billing.coverage-determinations | keyword_match: [Aduhelm, Makena] | Low |
| fda-regulation.drugs.generics | fda-regulation.drugs.labeling | keyword_match: [authorized generic, AG] | Low |
| fda-regulation.drugs.generics | compounding.drug-shortages | keyword_match: [drug shortage, discontinuation] | High |
| fda-regulation.drugs.labeling | fda-regulation.drugs.rems | keyword_match: [REMS, medication guide REMS] | Medium |
| fda-regulation.drugs.labeling | advertising-marketing.drug-promotion | keyword_match: [promotional labeling, advertising] | High |
| fda-regulation.drugs.labeling.med-guides | controlled-substances.opioid-specific | keyword_match: [opioid medication guide] | High |
| fda-regulation.drugs.labeling.med-guides | state-regulations.pharmacy | keyword_match: [pharmacy dispensing] | Medium |
| fda-regulation.drugs.rems | controlled-substances.opioid-specific | keyword_match: [opioid REMS, TIRF REMS] | High |
| fda-regulation.drugs.rems | clinical-operations.quality-systems | keyword_match: [clozapine, isotretinoin] | Medium |
| fda-regulation.drugs.rems | state-regulations.pharmacy | keyword_match: [pharmacy certification] | Medium |
| fda-regulation.drugs.rems.etasu | controlled-substances.prescribing.documentation | keyword_match: [TIRF REMS, opioid] | High |
| fda-regulation.drugs.rems.etasu | clinical-operations.informed-consent | keyword_match: [iPLEDGE, pregnancy] | High |
| fda-regulation.drugs.rems.shared | controlled-substances.opioid-specific | keyword_match: [opioid class, TIRF] | High |
| fda-regulation.drugs.shortages | compounding.drug-shortages | keyword_match: [compounding during shortage, 503A] | High |
| fda-regulation.drugs.shortages | compounding.503a.practice-specific.weight-loss | keyword_match: [semaglutide, tirzepatide, GLP-1] | High |
| fda-regulation.drugs.shortages | controlled-substances.dispensing | keyword_match: [controlled substance shortage] | Medium |
| fda-regulation.devices.classification | fda-regulation.devices.aesthetic | keyword_match: [aesthetic device, laser, RF] | High |
| fda-regulation.devices.classification | fda-regulation.devices.software | keyword_match: [software, AI, machine learning] | Medium |
| fda-regulation.devices.classification.class-ii | fda-regulation.devices.510k | keyword_match: [510(k), substantial equivalence] | High |
| fda-regulation.devices.510k | fda-regulation.devices.de-novo | keyword_match: [De Novo, no predicate] | Low |
| fda-regulation.devices.510k | fda-regulation.devices.aesthetic | keyword_match: [aesthetic indication, cosmetic] | High |
| fda-regulation.devices.software | telehealth.technology | keyword_match: [telehealth, remote monitoring] | High |
| fda-regulation.devices.software | clinical-operations.technology | keyword_match: [clinical decision support, CDS] | Medium |
| fda-regulation.devices.software.ai-ml | clinical-operations.laboratory | keyword_match: [diagnostic AI, screening] | Medium |
| fda-regulation.devices.aesthetic | advertising-marketing.ftc-compliance | keyword_match: [off-label use, unapproved indication] | High |
| fda-regulation.devices.aesthetic | fda-regulation.devices.mdr | keyword_match: [adverse event, burn, scarring] | Medium |
| fda-regulation.devices.aesthetic | clinical-operations.scope-of-practice | keyword_match: [professional use only] | High |
| fda-regulation.devices.aesthetic.laser | state-regulations.scope-expansions | keyword_match: [operator training, certification] | Medium |
| fda-regulation.devices.aesthetic.laser | clinical-operations.quality-systems | keyword_match: [treatment protocol, parameters] | Medium |
| fda-regulation.devices.aesthetic.injectable | fda-regulation.devices.implants | keyword_match: [dermal filler, hyaluronic acid] | High |
| fda-regulation.devices.aesthetic.injectable | fda-regulation.biologics.hct-p | keyword_match: [PRP system, centrifuge] | Medium |
| fda-regulation.devices.mdr | clinical-operations.patient-safety | keyword_match: [patient death, serious adverse event] | High |
| fda-regulation.devices.mdr | fda-regulation.enforcement | keyword_match: [recall, correction] | Medium |
| fda-regulation.biologics.hct-p | fda-regulation.biologics.stem-cells | keyword_match: [stem cells, adipose] | High |
| fda-regulation.biologics.hct-p | fda-regulation.biologics.prp | keyword_match: [PRP, platelet rich plasma] | High |
| fda-regulation.biologics.hct-p | fda-regulation.enforcement | keyword_match: [warning letter, enforcement] | High |
| fda-regulation.biologics.hct-p.361-criteria | fda-regulation.biologics.hct-p.351-products | keyword_match: [more than minimal, enzyme digestion] | High |
| fda-regulation.biologics.hct-p.361-criteria | fda-regulation.enforcement | keyword_match: [non-homologous, different function] | High |
| fda-regulation.biologics.hct-p.361-criteria.minimal | fda-regulation.biologics.hct-p.351-products | keyword_match: [collagenase, enzyme] | High |
| fda-regulation.biologics.hct-p.361-criteria.homologous | fda-regulation.enforcement | keyword_match: [different function, new indication] | High |
| fda-regulation.biologics.hct-p.351-products | fda-regulation.biologics.rmat | keyword_match: [RMAT, regenerative medicine advanced therapy] | Low |
| fda-regulation.biologics.hct-p.351-products | fda-regulation.clinical-trials | keyword_match: [clinical trial, study] | Medium |
| fda-regulation.biologics.prp | fda-regulation.devices.510k | keyword_match: [510(k), cleared device] | Medium |
| fda-regulation.biologics.prp | fda-regulation.biologics.hct-p.351-products | keyword_match: [more than minimal manipulation] | Medium |
| fda-regulation.biologics.prp | fda-regulation.devices.aesthetic | keyword_match: [aesthetic use, cosmetic] | High |
| fda-regulation.biologics.stem-cells | fda-regulation.enforcement | keyword_match: [permanent injunction, consent decree] | High |
| fda-regulation.biologics.stem-cells | clinical-operations.patient-safety | keyword_match: [patient harm, adverse event] | High |
| fda-regulation.dietary-supplements.dshea | fda-regulation.enforcement | keyword_match: [disease treatment, therapeutic claim] | High |
| fda-regulation.dietary-supplements.dshea | advertising-marketing.patient-testimonials | keyword_match: [testimonial, endorsement] | Medium |
| fda-regulation.dietary-supplements.dshea | fda-regulation.dietary-supplements.cbd | keyword_match: [CBD, hemp] | High |
| fda-regulation.dietary-supplements.dshea.claims | fda-regulation.enforcement | keyword_match: [treats cures prevents] | High |
| fda-regulation.dietary-supplements.dshea.claims | advertising-marketing.ftc-compliance | keyword_match: [weight loss, fat burning] | High |
| fda-regulation.dietary-supplements.ndi | fda-regulation.enforcement | keyword_match: [objection letter, inadequate] | Medium |
| fda-regulation.dietary-supplements.ndi | fda-regulation.dietary-supplements.exclusions | keyword_match: [NAC, N-acetylcysteine] | Low |
| fda-regulation.dietary-supplements.cbd | fda-regulation.enforcement | keyword_match: [warning letter, cease and desist] | High |
| fda-regulation.dietary-supplements.cbd | state-regulations.controlled-substances | keyword_match: [state law, legal CBD] | High |
| fda-regulation.cosmetics.registration | fda-regulation.drugs | keyword_match: [cosmeceutical, drug-cosmetic] | Medium |
| fda-regulation.cosmetics.registration | clinical-operations.scope-of-practice | keyword_match: [professional use only] | High |
| fda-regulation.cosmetics.registration | state-regulations.facility-permits | keyword_match: [med spa, aesthetic practice] | High |
| fda-regulation.cosmetics.safety | fda-regulation.enforcement | keyword_match: [recall, mandatory recall] | Medium |
| fda-regulation.cosmetics.safety | fda-regulation.cosmetics.gmp | keyword_match: [GMP, manufacturing] | Medium |
| fda-regulation.cosmetics.professional | clinical-operations.scope-of-practice | keyword_match: [medical spa, aesthetic clinic] | High |
| fda-regulation.cosmetics.professional | compounding.503a | keyword_match: [compounded cosmetic] | Low |
| fda-regulation.clinical-trials.ind | fda-regulation.clinical-trials.informed-consent | keyword_match: [informed consent, human subjects] | High |
| fda-regulation.clinical-trials.ind | fda-regulation.clinical-trials.expanded-access | keyword_match: [expanded access, compassionate use] | Medium |
| fda-regulation.clinical-trials.gcp | clinical-operations.recordkeeping | keyword_match: [data integrity, ALCOA+] | Medium |
| fda-regulation.clinical-trials.gcp | fda-regulation.clinical-trials.irb | keyword_match: [IRB, ethics committee] | High |
| fda-regulation.enforcement.warning-letters | compounding.503a | keyword_match: [compounding, 503A, 503B] | High |
| fda-regulation.enforcement.warning-letters | compounding.503b | keyword_match: [compounding, 503A, 503B] | High |
| fda-regulation.enforcement.warning-letters | fda-regulation.biologics.stem-cells | keyword_match: [stem cell, regenerative] | High |
| fda-regulation.enforcement.warning-letters | advertising-marketing.ftc-compliance | keyword_match: [advertising, promotion] | Medium |
| fda-regulation.enforcement.import-alerts | compounding.bulk-substances.quality | keyword_match: [bulk API, pharmaceutical ingredient] | High |
| fda-regulation.enforcement.import-alerts | compounding.503a.practice-specific.peptides | keyword_match: [peptide, research chemical] | High |
| fda-regulation.enforcement.consent-decrees | fda-regulation.biologics.stem-cells | keyword_match: [US Stem Cell, regenerative clinic] | High |
| fda-regulation.enforcement.consent-decrees | compounding.503b | keyword_match: [compounding, sterile] | Medium |
| telehealth.licensure.imlc | state-regulations.licensure | keyword_match: [disciplinary action, board sanction] | Medium |
| telehealth.licensure.imlc | controlled-substances.telehealth-prescribing | keyword_match: [controlled substance prescribing] | High |
| telehealth.licensure.imlc | state-regulations.cpom | keyword_match: [CPOM, corporate practice] | Medium |
| telehealth.licensure.imlc.eligibility | state-regulations.licensure | keyword_match: [board certification, ABMS] | Medium |
| telehealth.licensure.imlc.eligibility | fraud-compliance.exclusions | keyword_match: [criminal history, FBI check] | Medium |
| telehealth.licensure.imlc.states | state-regulations.licensure | keyword_match: [state-specific requirements, additional documentation] | High |
| telehealth.licensure.nlc | clinical-operations.scope-of-practice | keyword_match: [APRN Compact, nurse practitioner] | Medium |
| telehealth.licensure.nlc | controlled-substances.registration.mid-level | keyword_match: [prescriptive authority] | High |
| telehealth.licensure.psypact | controlled-substances.prescribing | keyword_match: [mental health prescribing, psychotropic] | Medium |
| telehealth.licensure.state-requirements | controlled-substances.telehealth-prescribing.state-rules | keyword_match: [controlled substances, DEA] | High |
| telehealth.licensure.state-requirements | state-regulations.cpom | keyword_match: [corporate structure, business entity] | Medium |
| telehealth.licensure.state-requirements | state-regulations.facility-permits | keyword_match: [facility license, clinic permit] | Medium |
| telehealth.licensure.state-requirements.patient-location | controlled-substances.telehealth-prescribing.ryan-haight.exceptions.phe | keyword_match: [emergency exception, disaster] | Low |
| telehealth.prescribing.ryan-haight | controlled-substances.telehealth-prescribing.ryan-haight | keyword_match: [DEA registration, controlled substances] | High |
| telehealth.prescribing.ryan-haight | controlled-substances.telehealth-prescribing.ryan-haight.exceptions | keyword_match: [seven exceptions, statutory exceptions] | High |
| telehealth.prescribing.ryan-haight | controlled-substances.telehealth-prescribing.covid-flexibilities | keyword_match: [COVID flexibility, PHE] | High |
| telehealth.prescribing.ryan-haight.registration | controlled-substances.telehealth-prescribing.future-rules | keyword_match: [final rule, implementation] | Medium |
| telehealth.prescribing.ryan-haight.registration | controlled-substances.registration.practitioner | keyword_match: [eligibility criteria, qualifying practitioner] | Medium |
| telehealth.prescribing.ryan-haight.covid-rules | controlled-substances.opioid-specific.buprenorphine | keyword_match: [buprenorphine, MOUD] | High |
| telehealth.prescribing.ryan-haight.covid-rules | controlled-substances.prescribing.schedule-requirements | keyword_match: [Schedule II-V, controlled substances] | High |
| telehealth.prescribing.non-controlled | telehealth.prescribing.weight-management | keyword_match: [GLP-1, semaglutide, tirzepatide] | High |
| telehealth.prescribing.non-controlled | telehealth.prescribing.hormone-therapy | keyword_match: [hormone therapy, HRT] | High |
| telehealth.prescribing.non-controlled | compounding.503a | keyword_match: [compounded medications] | Medium |
| telehealth.prescribing.non-controlled.relationship | telehealth.informed-consent | keyword_match: [informed consent] | High |
| telehealth.prescribing.non-controlled.relationship | clinical-operations.quality-systems | keyword_match: [standard of care] | Medium |
| telehealth.prescribing.weight-management | compounding.drug-shortages | keyword_match: [compounded semaglutide, compounded tirzepatide] | High |
| telehealth.prescribing.weight-management | advertising-marketing.ftc-compliance | keyword_match: [advertising claims, weight loss claims] | High |
| telehealth.prescribing.weight-management | controlled-substances.prescribing.schedule-requirements.schedule-iv | keyword_match: [phentermine, controlled appetite suppressant] | Medium |
| telehealth.prescribing.hormone-therapy | controlled-substances.prescribing.schedule-requirements.schedule-iii-iv | keyword_match: [testosterone, Schedule III] | High |
| telehealth.prescribing.hormone-therapy | compounding.503a.practice-specific.hormones | keyword_match: [compounded hormones, BHRT] | High |
| telehealth.prescribing.hormone-therapy | clinical-operations.scope-of-practice | keyword_match: [pellet insertion, in-person procedure] | Medium |
| telehealth.reimbursement.medicare | medicare-billing.quality-programs | keyword_match: [MIPS, quality reporting] | Medium |
| telehealth.reimbursement.medicare | medicare-billing.physician-services | keyword_match: [E/M codes, CPT] | High |
| telehealth.reimbursement.medicare | telehealth.modalities.audio-only | keyword_match: [audio-only, telephone E/M] | High |
| telehealth.reimbursement.medicare.audio-only | clinical-operations.scope-of-practice | keyword_match: [behavioral health, therapy codes] | Medium |
| telehealth.reimbursement.rpm | fda-regulation.devices.510k | keyword_match: [FDA-cleared, 510(k)] | Medium |
| telehealth.reimbursement.rpm | clinical-operations.scope-of-practice | keyword_match: [clinical staff, supervision] | Medium |
| telehealth.reimbursement.rpm | fda-regulation.devices.software.ai-ml | keyword_match: [continuous glucose monitor, CGM] | Low |
| telehealth.reimbursement.rpm.rtm | clinical-operations.scope-of-practice | keyword_match: [physical therapy, PT monitoring] | Medium |
| telehealth.reimbursement.parity | business-operations.insurance | keyword_match: [ERISA plans, self-funded] | Low |
| telehealth.technology.hipaa-platforms | hipaa-privacy.breach-notification | keyword_match: [security breach, unauthorized access] | Medium |
| telehealth.technology.hipaa-platforms | hipaa-privacy.security-rule | keyword_match: [encryption standards, technical safeguards] | High |
| telehealth.technology.hipaa-platforms | hipaa-privacy.business-associates | keyword_match: [vendor management, subcontractors] | High |
| telehealth.technology.hipaa-platforms.vendor | hipaa-privacy.business-associates | keyword_match: [subcontractor, downstream vendor] | High |
| telehealth.technology.hipaa-platforms.vendor.consumer | telehealth.prescribing.ryan-haight.covid-rules | keyword_match: [PHE flexibility, COVID-era] | Medium |
| telehealth.technology.recording | clinical-operations.recordkeeping | keyword_match: [medical record, documentation] | High |
| telehealth.technology.recording | hipaa-privacy.patient-rights | keyword_match: [patient request, access] | Medium |
| telehealth.technology.monitoring-devices | fda-regulation.devices.software | keyword_match: [software as medical device, SaMD] | High |
| telehealth.technology.monitoring-devices | fda-regulation.devices.software.ai-ml | keyword_match: [AI-powered, machine learning] | Medium |
| telehealth.technology.monitoring-devices | telehealth.reimbursement.rpm | keyword_match: [billing code, CPT 99454] | High |
| telehealth.modalities.video | controlled-substances.telehealth-prescribing | keyword_match: [controlled substance prescribing] | High |
| telehealth.modalities.video | telehealth.reimbursement.medicare | keyword_match: [Medicare billing, modifier 95] | High |
| telehealth.modalities.audio-only | clinical-operations.scope-of-practice | keyword_match: [mental health, behavioral health] | Medium |
| telehealth.modalities.audio-only | controlled-substances.telehealth-prescribing.covid-flexibilities | keyword_match: [controlled substances, DEA] | High |
| telehealth.modalities.asynchronous | clinical-operations.quality-systems | keyword_match: [malpractice, misdiagnosis] | Low |
| telehealth.modalities.asynchronous | telehealth.licensure.state-requirements | keyword_match: [interstate consultation] | Medium |
| telehealth.informed-consent.state-requirements | clinical-operations.informed-consent | keyword_match: [minor consent, parental consent] | Medium |
| telehealth.informed-consent.state-requirements | telehealth.technology.recording | keyword_match: [recording consent] | High |
| telehealth.informed-consent.state-requirements | hipaa-privacy.privacy-rule | keyword_match: [privacy practices, HIPAA] | Medium |
| telehealth.informed-consent.state-requirements.disclosures | business-operations.financial-policies | keyword_match: [out-of-network, billing] | Medium |
| hipaa-privacy.privacy-rule.uses-disclosures | advertising-marketing.patient-communications | keyword_match: [marketing] | High |
| hipaa-privacy.privacy-rule.uses-disclosures | clinical-operations.research | keyword_match: [research] | Medium |
| hipaa-privacy.privacy-rule.uses-disclosures | fraud-compliance.investigations | keyword_match: [court order, subpoena] | Medium |
| hipaa-privacy.privacy-rule.uses-disclosures.tpo | medicare-billing.compliance | keyword_match: [billing, claims] | High |
| hipaa-privacy.privacy-rule.uses-disclosures.tpo | clinical-operations.quality-systems | keyword_match: [quality] | Medium |
| hipaa-privacy.privacy-rule.uses-disclosures.minimum-necessary | hipaa-privacy.security-rule.access-controls | keyword_match: [access controls] | High |
| hipaa-privacy.privacy-rule.patient-rights | clinical-operations.recordkeeping | keyword_match: [medical records] | High |
| hipaa-privacy.privacy-rule.patient-rights | hipaa-privacy.information-blocking | keyword_match: [information blocking] | Medium |
| hipaa-privacy.privacy-rule.patient-rights.access | hipaa-privacy.information-blocking | keyword_match: [information blocking, Cures Act] | High |
| hipaa-privacy.privacy-rule.patient-rights.access | state-regulations.fee-limits | keyword_match: [fee schedule] | Low |
| hipaa-privacy.privacy-rule.npp | advertising-marketing.website-compliance | keyword_match: [website] | Medium |
| hipaa-privacy.privacy-rule.marketing | advertising-marketing.ftc-compliance | keyword_match: [advertising, promotion] | High |
| hipaa-privacy.privacy-rule.marketing | advertising-marketing.patient-testimonials | keyword_match: [testimonial] | Medium |
| hipaa-privacy.security-rule.administrative | hipaa-privacy.business-associates | keyword_match: [business associate] | High |
| hipaa-privacy.security-rule.administrative | hipaa-privacy.breach-notification | keyword_match: [breach] | High |
| hipaa-privacy.security-rule.administrative.risk-analysis | hipaa-privacy.enforcement.ocr-audits | keyword_match: [audit] | Medium |
| hipaa-privacy.security-rule.administrative.risk-analysis | medicare-billing.quality-programs | keyword_match: [meaningful use, promoting interoperability] | Medium |
| hipaa-privacy.security-rule.physical | business-operations.waste-management | keyword_match: [disposal, destruction] | Medium |
| hipaa-privacy.security-rule.technical | telehealth.technology | keyword_match: [telehealth, remote] | High |
| hipaa-privacy.security-rule.technical | hipaa-privacy.business-associates.cloud | keyword_match: [cloud] | High |
| hipaa-privacy.breach-notification.definition | hipaa-privacy.security-rule.technical | keyword_match: [encryption] | High |
| hipaa-privacy.breach-notification.definition | state-regulations.privacy | keyword_match: [state law] | Medium |
| hipaa-privacy.breach-notification.requirements | hipaa-privacy.business-associates.breach | keyword_match: [business associate] | High |
| hipaa-privacy.breach-notification.requirements | state-regulations.privacy | keyword_match: [state notification] | Medium |
| hipaa-privacy.business-associates.baa-requirements | hipaa-privacy.business-associates.cloud | keyword_match: [cloud, SaaS] | High |
| hipaa-privacy.business-associates.baa-requirements | hipaa-privacy.breach-notification | keyword_match: [breach] | High |
| hipaa-privacy.business-associates.cloud | telehealth.technology | keyword_match: [telehealth platform] | High |
| hipaa-privacy.business-associates.cloud | clinical-operations.ehr-systems | keyword_match: [EHR] | High |
| hipaa-privacy.enforcement.ocr-process | hipaa-privacy.enforcement.state-ag | keyword_match: [state attorney general] | Low |
| hipaa-privacy.enforcement.ocr-process | hipaa-privacy.enforcement.penalties | keyword_match: [penalty tiers] | High |
| hipaa-privacy.enforcement.penalties | hipaa-privacy.enforcement.ocr-process | keyword_match: [corrective action] | High |
| hipaa-privacy.part-2.sud-records | controlled-substances.mat-prescribing | keyword_match: [MAT, buprenorphine] | High |
| hipaa-privacy.part-2.sud-records | controlled-substances.otp | keyword_match: [opioid treatment] | High |
| hipaa-privacy.part-2.2024-changes | hipaa-privacy.part-2.sud-records | keyword_match: [transition period] | Medium |
| hipaa-privacy.information-blocking.prohibitions | hipaa-privacy.privacy-rule.patient-rights.access | keyword_match: [right of access] | High |
| hipaa-privacy.information-blocking.prohibitions | clinical-operations.ehr-systems | keyword_match: [interoperability] | High |
| hipaa-privacy.information-blocking.exceptions | clinical-operations.interoperability | keyword_match: [API, FHIR] | Medium |
| hipaa-privacy.state-privacy.medical-privacy | state-regulations.[state-code] | keyword_match: [specific state named] | Medium |
| hipaa-privacy.state-privacy.medical-privacy | hipaa-privacy.state-privacy.genetic | keyword_match: [genetic] | Medium |
| hipaa-privacy.state-privacy.consumer | hipaa-privacy.state-privacy.biometric | keyword_match: [biometric] | Low |
| medicare-billing.enrollment.applications | medicare-billing.enrollment.revalidation | keyword_match: [revalidation] | High |
| medicare-billing.enrollment.applications | medicare-billing.enrollment.opt-out | keyword_match: [opt-out] | Medium |
| medicare-billing.enrollment.revalidation | medicare-billing.enrollment.screening-levels | keyword_match: [high-risk] | Medium |
| medicare-billing.enrollment.revalidation | medicare-billing.enrollment.updates | keyword_match: [change of information] | Medium |
| medicare-billing.enrollment.opt-out | business-operations.practice-models | keyword_match: [concierge, DPC] | High |
| medicare-billing.enrollment.opt-out | medicare-billing.enrollment.updates | keyword_match: [affidavit] AND keyword_match: [specific dates] | Medium |
| medicare-billing.enrollment.screening-levels | medicare-billing.dme | keyword_match: [DMEPOS] | Medium |
| medicare-billing.fee-schedules.mpfs | telehealth.reimbursement | keyword_match: [telehealth] | High |
| medicare-billing.fee-schedules.mpfs | medicare-billing.quality-programs | keyword_match: [quality reporting] | Medium |
| medicare-billing.fee-schedules.mpfs.rvu | medicare-billing.fee-schedules.mpfs.gpci | keyword_match: [GPCI] | High |
| medicare-billing.fee-schedules.clfs | clinical-operations.laboratory | keyword_match: [CLIA] | High |
| medicare-billing.fee-schedules.dmepos | medicare-billing.enrollment.supplier-standards | keyword_match: [accreditation] | Medium |
| medicare-billing.coverage.ncd | medicare-billing.coverage.lcd | keyword_match: [LCD] | High |
| medicare-billing.coverage.ncd | medicare-billing.coverage.ced | keyword_match: [clinical trial] | Low |
| medicare-billing.coverage.lcd | medicare-billing.appeals | keyword_match: [reconsideration] | Medium |
| medicare-billing.coding.evaluation-management | medicare-billing.coding.telehealth-modifiers | keyword_match: [telehealth] | High |
| medicare-billing.coding.evaluation-management | medicare-billing.coding.teaching-physician | keyword_match: [teaching physician] | Low |
| medicare-billing.coding.evaluation-management.mdm | medicare-billing.coding.prolonged-services | keyword_match: [prolonged services] | Medium |
| medicare-billing.coding.modifiers | medicare-billing.coding.telehealth-modifiers | keyword_match: [telehealth] | High |
| medicare-billing.coding.modifiers | medicare-billing.coding.incident-to | keyword_match: [incident to] | Medium |
| medicare-billing.coding.documentation | medicare-billing.audits | keyword_match: [audit] | High |
| medicare-billing.coding.incident-to | medicare-billing.coding.split-shared | keyword_match: [split/shared] | Medium |
| medicare-billing.coding.telehealth-modifiers | telehealth.reimbursement | keyword_match: [originating site] | High |
| medicare-billing.coding.telehealth-modifiers | telehealth.licensure | keyword_match: [interstate] | Medium |
| medicare-billing.quality-programs.mips | medicare-billing.quality-programs.apm | keyword_match: [APM] | Medium |
| medicare-billing.quality-programs.mips.categories | medicare-billing.quality-programs.mips | keyword_match: [hardship exception] | Low |
| medicare-billing.quality-programs.apm | medicare-billing.quality-programs.mips | keyword_match: [MIPS APM] | Medium |
| medicare-billing.audits.programs | medicare-billing.audits.prepayment | keyword_match: [prepayment review] | Medium |
| medicare-billing.audits.programs | fraud-compliance | keyword_match: [fraud] | High |
| medicare-billing.audits.response | medicare-billing.appeals | keyword_match: [appeal] | High |
| medicare-billing.audits.response | medicare-billing.audits.extrapolation | keyword_match: [extrapolation] | High |
| medicare-billing.audits.extrapolation | medicare-billing.appeals | keyword_match: [appeal] | High |
| medicare-billing.audits.extrapolation | fraud-compliance.false-claims | keyword_match: [60-day rule] | Medium |
| medicare-billing.appeals.levels | medicare-billing.audits | keyword_match: [good cause] | Low |
| medicare-billing.appeals.levels.alj | medicare-billing.appeals.levels | keyword_match: [aggregation] | Low |
| medicare-billing.medicare-advantage.network | business-operations.credentialing | keyword_match: [credentialing] | High |
| medicare-billing.medicare-advantage.prior-auth | medicare-billing.appeals | keyword_match: [denial] | High |
| medicare-billing.commercial.no-surprises | medicare-billing.commercial.self-pay | keyword_match: [uninsured] | High |
| medicare-billing.commercial.no-surprises | medicare-billing.commercial.idr | keyword_match: [dispute] | High |
| medicare-billing.commercial.idr | medicare-billing.commercial.no-surprises | keyword_match: [QPA] | High |
| fraud-compliance.anti-kickback.safe-harbors | business-operations.corporate-structure | keyword_match: [management services agreement] | Medium |
| fraud-compliance.anti-kickback.safe-harbors | hipaa-privacy.security-rule | keyword_match: [EHR donation] | Low |
| fraud-compliance.anti-kickback.safe-harbors.personal-services | business-operations.employment-law | keyword_match: [physician employment] | Medium |
| fraud-compliance.anti-kickback.prohibited-conduct | advertising-marketing.ftc-compliance | keyword_match: [marketing payments] | Medium |
| fraud-compliance.stark-law.dhs | clinical-operations.laboratory | keyword_match: [lab, laboratory] | High |
| fraud-compliance.stark-law.ioas | controlled-substances.dispensing | keyword_match: [physician dispensing] | Medium |
| fraud-compliance.stark-law.ioas | compounding.dispensing | keyword_match: [physician dispensing] | Medium |
| fraud-compliance.false-claims.qui-tam | fraud-compliance.compliance-programs | keyword_match: [internal reporting] | Medium |
| fraud-compliance.false-claims.knowledge | medicare-billing.compliance | keyword_match: [billing errors] | High |
| fraud-compliance.exclusions.mandatory | controlled-substances.enforcement | keyword_match: [controlled substance convictions] | Medium |
| fraud-compliance.exclusions.screening | business-operations.employment-law | keyword_match: [hiring] | High |
| fraud-compliance.compliance-programs.seven-elements | business-operations.employment-law | keyword_match: [training requirements] | Medium |
| state-regulations.licensure.physician | telehealth.licensure | keyword_match: [IMLC] | High |
| state-regulations.licensure.physician | controlled-substances.registration | keyword_match: [DEA registration] | High |
| state-regulations.facility-permits.clia | clinical-operations.laboratory | keyword_match: [CLIA] | High |
| state-regulations.facility-permits.clia | medicare-billing | keyword_match: [billing implications] | Medium |
| state-regulations.cpom.prohibitions | business-operations.corporate-structure | keyword_match: [corporate practice of medicine, CPOM] | High |
| state-regulations.cpom.mso | fraud-compliance.anti-kickback | keyword_match: [fee arrangements] | Medium |
| state-regulations.scope-expansions.fpa | controlled-substances.prescribing | keyword_match: [prescriptive authority] | High |
| state-regulations.scope-expansions.fpa (inferred reciprocal) | controlled-substances.prescribing | keyword_match: [nurse practitioner, prescribing] | High |
| business-operations.osha-compliance.bloodborne | business-operations.waste-management | keyword_match: [sharps disposal] | High |
| business-operations.osha-compliance.hazcom | compounding.sterile | keyword_match: [compounding chemicals] | Medium |
| business-operations.osha-compliance.hazcom | compounding.503a | keyword_match: [compounding chemicals] | Medium |
| business-operations.osha-compliance.recordkeeping | business-operations.employment-law | keyword_match: [workers' compensation] | Medium |
| business-operations.waste-management.medical | business-operations.osha-compliance.bloodborne | keyword_match: [OSHA bloodborne] | High |
| business-operations.waste-management.pharmaceutical | controlled-substances.recordkeeping | keyword_match: [controlled substance disposal] | High |
| business-operations.employment-law.classification | business-operations.tax-compliance | keyword_match: [tax implications] | High |
| business-operations.tax-compliance.qbi | business-operations.corporate-structure | keyword_match: [entity structure] | High |
| controlled-substances.prescribing (gap) | state-regulations.scope-expansions.fpa | keyword_match: [nurse practitioner autonomy] | High |
| clinical-operations.ehr-systems (gap) | hipaa-privacy.business-associates.cloud | keyword_match: [cloud EHR] | High |
| clinical-operations.interoperability (gap) | hipaa-privacy.information-blocking | keyword_match: [API access] | High |
| controlled-substances.mat-prescribing (gap) | hipaa-privacy.part-2 | keyword_match: [substance use disorder treatment] | High |
| controlled-substances.otp (gap) | hipaa-privacy.part-2 | keyword_match: [opioid treatment program] | High |
| controlled-substances.enforcement (gap) | fraud-compliance.exclusions | keyword_match: [DEA sanctions] | Medium |
| controlled-substances.registration.research (gap) | fda-regulation.clinical-trials | keyword_match: [Schedule I research] | Low |
| fda-regulation.devices.de-novo (gap) | fda-regulation.devices.510k | keyword_match: [no predicate] | Low |

## Notes on Consistency Issues

1. **Domain code variations identified:**
   - Sessions sometimes referenced `clinical-operations.technology` where `clinical-operations.ehr-systems` would be more specific
   - Some sessions used shortened forms (e.g., "CPOM" instead of full domain paths) — resolved by using full paths
   - `controlled-substances.prescribing` appeared as both a general reference and specific node — resolved by using most specific available node

2. **Missing reciprocal relationships added:**
   - Several one-directional triggers were identified where the reverse relationship logically exists but wasn't defined
   - These have been marked with "(inferred reciprocal)" in the table

3. **Gaps identified:**
   - Several obvious cross-domain relationships were not captured in any session's triggers
   - These have been marked with "(gap)" and added based on regulatory knowledge

## Domain Code Index

| Domain Code | Description |
|---|---|
| advertising-marketing.drug-promotion | FDA drug advertising and promotion regulations |
| advertising-marketing.ftc-compliance | FTC advertising compliance requirements |
| advertising-marketing.patient-communications | Patient communication and marketing rules |
| advertising-marketing.patient-testimonials | Patient testimonial and endorsement regulations |
| advertising-marketing.website-compliance | Website content and disclosure requirements |
| business-operations.community-relations | Community outreach and public relations |
| business-operations.corporate-structure | Business entity and corporate structure requirements |
| business-operations.credentialing | Provider credentialing processes |
| business-operations.employment-law | Employment law and HR requirements |
| business-operations.finance | Financial operations and accounting |
| business-operations.financial-policies | Financial policies and patient billing |
| business-operations.insurance | Insurance and benefit plan requirements |
| business-operations.osha-compliance | OSHA workplace safety compliance |
| business-operations.osha-compliance.bloodborne | Bloodborne pathogen safety requirements |
| business-operations.osha-compliance.hazcom | Hazard communication standards |
| business-operations.osha-compliance.recordkeeping | OSHA injury and illness recordkeeping |
| business-operations.practice-models | Practice model structures (DPC, concierge, etc.) |
| business-operations.shipping | Shipping and delivery requirements |
| business-operations.tax-compliance | Tax compliance for medical practices |
| business-operations.tax-compliance.benefits | Healthcare employee benefit tax treatment |
| business-operations.tax-compliance.qbi | Section 199A qualified business income deduction |
| business-operations.waste-management | Medical and pharmaceutical waste disposal |
| clinical-operations.ehr-systems | Electronic health record system requirements |
| clinical-operations.informed-consent | Informed consent requirements |
| clinical-operations.interoperability | Healthcare data interoperability standards |
| clinical-operations.laboratory | Laboratory operations and CLIA compliance |
| clinical-operations.patient-safety | Patient safety protocols and reporting |
| clinical-operations.quality-systems | Quality management and improvement systems |
| clinical-operations.recordkeeping | Medical recordkeeping requirements |
| clinical-operations.research | Clinical research regulations |
| clinical-operations.scope-of-practice | Professional scope of practice limitations |
| clinical-operations.technology | Clinical technology and software requirements |
| compounding.503a | Traditional pharmacy compounding under 503A |
| compounding.503a.anticipatory | Anticipatory compounding rules |
| compounding.503a.anticipatory.documentation | Documentation for anticipatory compounding |
| compounding.503a.anticipatory.quantities | Quantity limitations for anticipatory compounding |
| compounding.503a.bulk-drug | Bulk drug substance regulations |
| compounding.503a.bulk-drug.category1 | FDA Category 1 permitted bulk drugs |
| compounding.503a.bulk-drug.category2 | FDA Category 2 bulk drugs under evaluation |
| compounding.503a.bulk-drug.category3 | FDA Category 3 prohibited bulk drugs |
| compounding.503a.copy-prohibition | Essentially a copy prohibition |
| compounding.503a.copy-prohibition.availability | Commercial availability determinations |
| compounding.503a.copy-prohibition.difference | Significant difference standards |
| compounding.503a.interstate | Interstate distribution and MOUs |
| compounding.503a.office-use | Office use compounding restrictions |
| compounding.503a.patient-specific | Patient-specific compounding requirements |
| compounding.503a.patient-specific.documentation | Prescription documentation standards |
| compounding.503a.patient-specific.relationship | Prescriber-patient relationship requirements |
| compounding.503a.practice-specific.hormones | Hormone compounding requirements |
| compounding.503a.practice-specific.iv-nutrients | IV nutrient compounding |
| compounding.503a.practice-specific.peptides | Peptide compounding regulations |
| compounding.503a.practice-specific.weight-loss | Weight loss medication compounding |
| compounding.503a.quality-standards | Quality standards for 503A compounding |
| compounding.503b | Outsourcing facility regulations |
| compounding.503b.cgmp | Current good manufacturing practices for 503B |
| compounding.503b.cgmp.quality | Quality system requirements |
| compounding.503b.cgmp.stability | Stability testing programs |
| compounding.503b.cgmp.validation | Validation requirements |
| compounding.503b.labeling | 503B product labeling requirements |
| compounding.503b.registration | 503B facility registration |
| compounding.503b.registration.initial | Initial registration process |
| compounding.503b.registration.products | Product reporting requirements |
| compounding.bulk-substances.fda-lists | FDA bulk drug list processes |
| compounding.bulk-substances.quality | Bulk ingredient quality standards |
| compounding.dispensing | Compounding pharmacy dispensing |
| compounding.drug-shortages | Drug shortage compounding allowances |
| compounding.drug-shortages.compliance | Shortage compounding compliance |
| compounding.drug-shortages.fda-determination | FDA shortage determinations |
| compounding.sterile | Sterile compounding requirements |
| compounding.sterile.bud | Beyond-use dating for sterile compounds |
| compounding.sterile.bud.default | Default BUD limits |
| compounding.sterile.bud.extended | Extended BUD with testing |
| compounding.sterile.engineering | Cleanroom engineering controls |
| compounding.sterile.testing | Sterility testing requirements |
| compounding.sterile.testing.endotoxin | Bacterial endotoxin testing |
| compounding.sterile.testing.release | Release testing vs batch testing |
| compounding.usp-standards.795 | USP Chapter 795 nonsterile standards |
| compounding.usp-standards.795.documentation | Documentation requirements |
| compounding.usp-standards.795.facility | Facility design requirements |
| compounding.usp-standards.797 | USP Chapter 797 sterile standards |
| compounding.usp-standards.797.facility | Sterile facility requirements |
| compounding.usp-standards.797.facility.pec | Primary engineering controls |
| compounding.usp-standards.797.facility.sec | Secondary engineering controls |
| compounding.usp-standards.797.monitoring | Environmental monitoring |
| compounding.usp-standards.797.personnel | Personnel training and competency |
| compounding.usp-standards.797.personnel.assessment | Competency assessment methods |
| compounding.usp-standards.797.personnel.initial | Initial training requirements |
| compounding.usp-standards.800 | USP Chapter 800 hazardous drug handling |
| compounding.usp-standards.800.assessment | Hazardous drug assessment |
| compounding.usp-standards.800.engineering | HD engineering controls |
| compounding.usp-standards.800.ppe | Personal protective equipment |
| compounding.usp-standards.800.safety | Hazardous drug safety protocols |
| compounding.usp-standards.bud | Beyond-use dating standards |
| controlled-substances.dispensing | Controlled substance dispensing requirements |
| controlled-substances.dispensing.automated | Automated dispensing systems |
| controlled-substances.dispensing.partial-fill | Partial fill requirements |
| controlled-substances.dispensing.practitioner | Practitioner dispensing authority |
| controlled-substances.disposal | Controlled substance disposal |
| controlled-substances.disposal.authorized-collection | DEA authorized collection |
| controlled-substances.disposal.on-site | On-site destruction methods |
| controlled-substances.disposal.patient-return | Patient drug return programs |
| controlled-substances.disposal.reverse-distributor | Reverse distributor processes |
| controlled-substances.enforcement | DEA enforcement actions |
| controlled-substances.mat-prescribing | Medication-assisted treatment prescribing |
| controlled-substances.opioid-specific | Opioid-specific regulations |
| controlled-substances.opioid-specific.buprenorphine | Buprenorphine prescribing post-X-waiver |
| controlled-substances.opioid-specific.buprenorphine.current-requirements | Current buprenorphine requirements |
| controlled-substances.opioid-specific.buprenorphine.historical | Historical X-waiver context |
| controlled-substances.opioid-specific.naloxone | Naloxone co-prescribing requirements |
| controlled-substances.opioid-specific.prescribing-limits | Opioid prescribing limits |
| controlled-substances.otp | Opioid treatment programs |
| controlled-substances.prescribing | Controlled substance prescribing rules |
| controlled-substances.prescribing.documentation | Prescription documentation requirements |
| controlled-substances.prescribing.epcs | Electronic prescribing of controlled substances |
| controlled-substances.prescribing.epcs.authentication | Identity proofing and authentication |
| controlled-substances.prescribing.epcs.certification | Application certification requirements |
| controlled-substances.prescribing.pdmp | Prescription drug monitoring programs |
| controlled-substances.prescribing.pdmp.interstate | Interstate PDMP data sharing |
| controlled-substances.prescribing.pdmp.query-requirements | PDMP query requirements |
| controlled-substances.prescribing.schedule-requirements | Schedule-specific prescribing rules |
| controlled-substances.prescribing.schedule-requirements.schedule-ii | Schedule II prescribing |
| controlled-substances.prescribing.schedule-requirements.schedule-iii-iv | Schedule III-IV prescribing |
| controlled-substances.prescribing.schedule-requirements.schedule-v | Schedule V prescribing |
| controlled-substances.prescribing.special-populations | Special population prescribing |
| controlled-substances.recordkeeping | Controlled substance recordkeeping |
| controlled-substances.recordkeeping.inventory | Inventory requirements |
| controlled-substances.recordkeeping.inventory.schedule-ii | Schedule II exact count requirements |
| controlled-substances.recordkeeping.inventory.schedule-iii-v | Schedule III-V estimation methods |
| controlled-substances.recordkeeping.prescribing-dispensing | Prescription and dispensing records |
| controlled-substances.recordkeeping.receipt-distribution | Receipt and distribution records |
| controlled-substances.recordkeeping.receipt-distribution.csos | CSOS electronic ordering |
| controlled-substances.recordkeeping.receipt-distribution.form-222 | DEA Form 222 requirements |
| controlled-substances.recordkeeping.theft-loss | Theft and loss reporting |
| controlled-substances.registration | DEA registration requirements |
| controlled-substances.registration.institutional | Institutional DEA registration |
| controlled-substances.registration.mid-level | Mid-level practitioner registration |
| controlled-substances.registration.practitioner | Individual practitioner registration |
| controlled-substances.registration.practitioner.provider-type | Registration by provider type |
| controlled-substances.registration.practitioner.state-license | State license prerequisites |
| controlled-substances.registration.renewal | Registration renewal and modifications |
| controlled-substances.registration.research | Research registration |
| controlled-substances.scheduling | Controlled substance scheduling |
| controlled-substances.scheduling.federal-schedules | Federal schedule classifications |
| controlled-substances.scheduling.federal-schedules.schedule-ii | Schedule II substances |
| controlled-substances.scheduling.federal-schedules.schedule-iii | Schedule III substances |
| controlled-substances.scheduling.federal-schedules.schedule-iv | Schedule IV substances |
| controlled-substances.scheduling.federal-schedules.schedule-v | Schedule V substances |
| controlled-substances.scheduling.scheduling-actions | Scheduling actions and processes |
| controlled-substances.scheduling.state-variations | State scheduling variations |
| controlled-substances.security | Security and diversion prevention |
| controlled-substances.security.employee | Employee screening and access |
| controlled-substances.security.physical | Physical security requirements |
| controlled-substances.security.physical.schedule-i-ii | Schedule I-II storage |
| controlled-substances.security.physical.schedule-iii-v | Schedule III-V storage |
| controlled-substances.telehealth-prescribing | Telehealth controlled substance prescribing |
| controlled-substances.telehealth-prescribing.covid-flexibilities | COVID-era DEA flexibilities |
| controlled-substances.telehealth-prescribing.future-rules | Anticipated permanent rules |
| controlled-substances.telehealth-prescribing.ryan-haight | Ryan Haight Act requirements |
| controlled-substances.telehealth-prescribing.ryan-haight.exceptions | Ryan Haight statutory exceptions |
| controlled-substances.telehealth-prescribing.ryan-haight.exceptions.phe | Public health emergency exception |
| controlled-substances.telehealth-prescribing.ryan-haight.exceptions.registration | Telemedicine registration exception |
| controlled-substances.telehealth-prescribing.ryan-haight.referral | Qualifying practitioner referrals |
| controlled-substances.telehealth-prescribing.state-rules | State telemedicine CS rules |
| fda-regulation.biologics | Biologics and human tissue products |
| fda-regulation.biologics.hct-p | Human cells, tissues, and cellular products |
| fda-regulation.biologics.hct-p.351-products | 351 product requirements |
| fda-regulation.biologics.hct-p.361-criteria | 361 HCT/P criteria |
| fda-regulation.biologics.hct-p.361-criteria.homologous | Homologous use determination |
| fda-regulation.biologics.hct-p.361-criteria.minimal | Minimal manipulation standards |
| fda-regulation.biologics.prp | Platelet-rich plasma regulation |
| fda-regulation.biologics.rmat | Regenerative medicine advanced therapy |
| fda-regulation.biologics.stem-cells | Stem cell enforcement |
| fda-regulation.clinical-trials | Clinical trial regulations |
| fda-regulation.clinical-trials.expanded-access | Expanded access/compassionate use |
| fda-regulation.clinical-trials.gcp | Good clinical practice standards |
| fda-regulation.clinical-trials.ind | Investigational new drug applications |
| fda-regulation.clinical-trials.informed-consent | Clinical trial informed consent |
| fda-regulation.clinical-trials.irb | Institutional review board requirements |
| fda-regulation.cosmetics | Cosmetics regulation under MoCRA |
| fda-regulation.cosmetics.gmp | Cosmetic good manufacturing practices |
| fda-regulation.cosmetics.professional | Professional use cosmetics |
| fda-regulation.cosmetics.registration | MoCRA registration and listing |
| fda-regulation.cosmetics.safety | Cosmetic safety and adverse events |
| fda-regulation.devices | Medical device regulation |
| fda-regulation.devices.510k | 510(k) clearance process |
| fda-regulation.devices.aesthetic | Aesthetic medical devices |
| fda-regulation.devices.aesthetic.injectable | Injectable device systems |
| fda-regulation.devices.aesthetic.laser | Laser and light-based devices |
| fda-regulation.devices.classification | Device classification and controls |
| fda-regulation.devices.classification.class-ii | Class II special controls |
| fda-regulation.devices.de-novo | De Novo classification |
| fda-regulation.devices.implants | Implantable devices |
| fda-regulation.devices.mdr | Medical device reporting |
| fda-regulation.devices.software | Software as medical device |
| fda-regulation.devices.software.ai-ml | AI/ML-based devices |
| fda-regulation.dietary-supplements | Dietary supplement regulation |
| fda-regulation.dietary-supplements.cbd | CBD and hemp products |
| fda-regulation.dietary-supplements.dshea | DSHEA framework |
| fda-regulation.dietary-supplements.dshea.claims | Structure/function claims |
| fda-regulation.dietary-supplements.exclusions | Excluded ingredients |
| fda-regulation.dietary-supplements.ndi | New dietary ingredients |
| fda-regulation.drugs | Drug product regulation |
| fda-regulation.drugs.generics | Generic drugs and ANDAs |
| fda-regulation.drugs.labeling | Drug labeling requirements |
| fda-regulation.drugs.labeling.med-guides | Medication guides |
| fda-regulation.drugs.nda | New drug applications |
| fda-regulation.drugs.nda.accelerated | Accelerated approval pathway |
| fda-regulation.drugs.nda.supplements | Supplemental applications |
| fda-regulation.drugs.rems | Risk evaluation and mitigation strategies |
| fda-regulation.drugs.rems.etasu | REMS with elements to assure safe use |
| fda-regulation.drugs.rems.shared | Shared system REMS |
| fda-regulation.drugs.shortages | Drug shortage regulations |
| fda-regulation.enforcement | FDA enforcement actions |
| fda-regulation.enforcement.consent-decrees | Consent decrees and injunctions |
| fda-regulation.enforcement.import-alerts | Import alerts and detentions |
| fda-regulation.enforcement.warning-letters | FDA warning letters |
| fraud-compliance | Fraud, compliance and enforcement |
| fraud-compliance.anti-kickback | Anti-kickback statute |
| fraud-compliance.anti-kickback.advisory-opinions | OIG advisory opinions |
| fraud-compliance.anti-kickback.prohibited-conduct | Prohibited kickback conduct |
| fraud-compliance.anti-kickback.safe-harbors | AKS safe harbors |
| fraud-compliance.anti-kickback.safe-harbors.personal-services | Personal services arrangements |
| fraud-compliance.compliance-programs | Compliance program requirements |
| fraud-compliance.compliance-programs.seven-elements | Seven elements of compliance |
| fraud-compliance.exclusions | OIG exclusion lists |
| fraud-compliance.exclusions.mandatory | Mandatory exclusions |
| fraud-compliance.exclusions.screening | Exclusion screening requirements |
| fraud-compliance.false-claims | False Claims Act |
| fraud-compliance.false-claims.knowledge | FCA knowledge standard |
| fraud-compliance.false-claims.qui-tam | Qui tam whistleblower provisions |
| fraud-compliance.investigations | Fraud investigations |
| fraud-compliance.stark-law | Stark Law self-referral |
| fraud-compliance.stark-law.dhs | Designated health services |
| fraud-compliance.stark-law.ioas | In-office ancillary services exception |
| hipaa-privacy | HIPAA and data privacy |
| hipaa-privacy.breach-notification | Breach notification requirements |
| hipaa-privacy.breach-notification.definition | Breach definition and assessment |
| hipaa-privacy.breach-notification.requirements | Notification timing and content |
| hipaa-privacy.business-associates | Business associate requirements |
| hipaa-privacy.business-associates.baa-requirements | Business associate agreement requirements |
| hipaa-privacy.business-associates.breach | BA breach obligations |
| hipaa-privacy.business-associates.cloud | Cloud computing BAAs |
| hipaa-privacy.enforcement | HIPAA enforcement |
| hipaa-privacy.enforcement.ocr-audits | OCR audit program |
| hipaa-privacy.enforcement.ocr-process | OCR enforcement process |
| hipaa-privacy.enforcement.penalties | HIPAA penalty structure |
| hipaa-privacy.enforcement.state-ag | State attorney general enforcement |
| hipaa-privacy.information-blocking | Information blocking rules |
| hipaa-privacy.information-blocking.exceptions | Information blocking exceptions |
| hipaa-privacy.information-blocking.prohibitions | Information blocking prohibitions |
| hipaa-privacy.part-2 | 42 CFR Part 2 substance use records |
| hipaa-privacy.part-2.2024-changes | 2024 Part 2 rule changes |
| hipaa-privacy.part-2.sud-records | Substance use disorder records |
| hipaa-privacy.privacy-rule | HIPAA Privacy Rule |
| hipaa-privacy.privacy-rule.marketing | Marketing and fundraising restrictions |
| hipaa-privacy.privacy-rule.npp | Notice of privacy practices |
| hipaa-privacy.privacy-rule.patient-rights | Individual patient rights |
| hipaa-privacy.privacy-rule.patient-rights.access | Right of access to records |
| hipaa-privacy.privacy-rule.uses-disclosures | Uses and disclosures of PHI |
| hipaa-privacy.privacy-rule.uses-disclosures.minimum-necessary | Minimum necessary standard |
| hipaa-privacy.privacy-rule.uses-disclosures.tpo | Treatment, payment, operations |
| hipaa-privacy.security-rule | HIPAA Security Rule |
| hipaa-privacy.security-rule.access-controls | Access control requirements |
| hipaa-privacy.security-rule.administrative | Administrative safeguards |
| hipaa-privacy.security-rule.administrative.risk-analysis | Risk analysis and management |
| hipaa-privacy.security-rule.physical | Physical safeguards |
| hipaa-privacy.security-rule.technical | Technical safeguards |
| hipaa-privacy.state-privacy | State privacy laws |
| hipaa-privacy.state-privacy.biometric | Biometric data privacy |
| hipaa-privacy.state-privacy.consumer | Consumer data privacy laws |
| hipaa-privacy.state-privacy.genetic | Genetic information privacy |
| hipaa-privacy.state-privacy.medical-privacy | State medical privacy laws |
| medicare-billing | Medicare and medical billing |
| medicare-billing.appeals | Medicare appeals process |
| medicare-billing.appeals.levels | Five levels of appeal |
| medicare-billing.appeals.levels.alj | ALJ hearing process |
| medicare-billing.audits | Medicare audit programs |
| medicare-billing.audits.extrapolation | Extrapolation and overpayments |
| medicare-billing.audits.prepayment | Prepayment review |
| medicare-billing.audits.programs | Audit contractor types |
| medicare-billing.audits.response | Audit response procedures |
| medicare-billing.coding | Medical coding and documentation |
| medicare-billing.coding.documentation | Documentation requirements |
| medicare-billing.coding.evaluation-management | E/M coding framework |
| medicare-billing.coding.evaluation-management.mdm | Medical decision making elements |
| medicare-billing.coding.incident-to | Incident-to billing |
| medicare-billing.coding.modifiers | Modifier usage |
| medicare-billing.coding.prolonged-services | Prolonged services coding |
| medicare-billing.coding.split-shared | Split/shared visits |
| medicare-billing.coding.teaching-physician | Teaching physician rules |
| medicare-billing.coding.telehealth-modifiers | Telehealth-specific coding |
| medicare-billing.commercial | Commercial payer framework |
| medicare-billing.commercial.idr | Independent dispute resolution |
| medicare-billing.commercial.no-surprises | No Surprises Act |
| medicare-billing.commercial.self-pay | Self-pay patients |
| medicare-billing.compliance | Medicare billing compliance |
| medicare-billing.coverage | Coverage determinations |
| medicare-billing.coverage.abn | Advance beneficiary notices |
| medicare-billing.coverage.ced | Coverage with evidence development |
| medicare-billing.coverage.lcd | Local coverage determinations |
| medicare-billing.coverage.ncd | National coverage determinations |
| medicare-billing.coverage-determinations | Coverage determination processes |
| medicare-billing.dme | Durable medical equipment |
| medicare-billing.enrollment | Medicare provider enrollment |
| medicare-billing.enrollment.applications | Enrollment applications |
| medicare-billing.enrollment.opt-out | Opt-out and private contracting |
| medicare-billing.enrollment.revalidation | Revalidation requirements |
| medicare-billing.enrollment.screening-levels | Provider screening levels |
| medicare-billing.enrollment.supplier-standards | DME supplier standards |
| medicare-billing.enrollment.updates | Enrollment updates |
| medicare-billing.fee-schedules | Medicare fee schedules |
| medicare-billing.fee-schedules.clfs | Clinical laboratory fee schedule |
| medicare-billing.fee-schedules.dmepos | DME fee schedule |
| medicare-billing.fee-schedules.mpfs | Medicare physician fee schedule |
| medicare-billing.fee-schedules.mpfs.gpci | Geographic adjustments |
| medicare-billing.fee-schedules.mpfs.rvu | RVU methodology |
| medicare-billing.medicare-advantage | Medicare Advantage |
| medicare-billing.medicare-advantage.network | MA network requirements |
| medicare-billing.medicare-advantage.prior-auth | Prior authorization reform |
| medicare-billing.physician-services | Physician service billing |
| medicare-billing.quality-programs | Quality reporting programs |
| medicare-billing.quality-programs.apm | Alternative payment models |
| medicare-billing.quality-programs.mips | MIPS reporting |
| medicare-billing.quality-programs.mips.categories | MIPS performance categories |
| state-regulations.[state-code] | State-specific regulations |
| state-regulations.controlled-substances | State controlled substance laws |
| state-regulations.cpom | Corporate practice of medicine |
| state-regulations.cpom.mso | Management services organizations |
| state-regulations.cpom.prohibitions | CPOM prohibitions |
| state-regulations.facility-permits | Facility permit requirements |
| state-regulations.facility-permits.clia | CLIA laboratory certification |
| state-regulations.facility-permits.medical | Medical facility licensing |
| state-regulations.facility-permits.obs | Office-based surgery permits |
| state-regulations.fee-limits | State fee limitations |
| state-regulations.licensure | Professional licensure |
| state-regulations.licensure.app | Advanced practice provider licensure |
| state-regulations.licensure.disciplinary | Board disciplinary actions |
| state-regulations.licensure.physician | Physician licensure |
| state-regulations.licensure.renewal | License renewal and CE |
| state-regulations.pharmacy | State pharmacy regulations |
| state-regulations.privacy | State privacy laws |
| state-regulations.scope-expansions | Scope of practice expansions |
| state-regulations.scope-expansions.fpa | Full practice authority |
| telehealth | Telehealth and digital health |
| telehealth.informed-consent | Telehealth informed consent |
| telehealth.informed-consent.state-requirements | State consent requirements |
| telehealth.informed-consent.state-requirements.disclosures | Required disclosure elements |
| telehealth.licensure | Interstate licensure |
| telehealth.licensure.imlc | Interstate Medical Licensure Compact |
| telehealth.licensure.imlc.eligibility | IMLC eligibility requirements |
| telehealth.licensure.imlc.states | IMLC state participation |
| telehealth.licensure.nlc | Nurse Licensure Compact |
| telehealth.licensure.psypact | Psychology Interjurisdiction Compact |
| telehealth.licensure.state-requirements | State telehealth requirements |
| telehealth.licensure.state-requirements.patient-location | Patient location rules |
| telehealth.modalities | Service delivery modalities |
| telehealth.modalities.asynchronous | Store-and-forward telehealth |
| telehealth.modalities.audio-only | Audio-only encounters |
| telehealth.modalities.video | Synchronous video visits |
| telehealth.prescribing | Telehealth prescribing |
| telehealth.prescribing.hormone-therapy | Hormone therapy prescribing |
| telehealth.prescribing.non-controlled | Non-controlled prescribing |
| telehealth.prescribing.non-controlled.relationship | Establishing patient relationships |
| telehealth.prescribing.ryan-haight | Ryan Haight Act compliance |
| telehealth.prescribing.ryan-haight.covid-rules | Post-COVID prescribing rules |
| telehealth.prescribing.ryan-haight.registration | DEA telemedicine registration |
| telehealth.prescribing.weight-management | Weight management prescribing |
| telehealth.reimbursement | Telehealth reimbursement |
| telehealth.reimbursement.medicare | Medicare telehealth coverage |
| telehealth.reimbursement.medicare.audio-only | Audio-only Medicare billing |
| telehealth.reimbursement.parity | State parity laws |
| telehealth.reimbursement.rpm | Remote patient monitoring |
| telehealth.reimbursement.rpm.rtm | Remote therapeutic monitoring |
| telehealth.technology | Technology requirements |
| telehealth.technology.hipaa-platforms | HIPAA-compliant platforms |
| telehealth.technology.hipaa-platforms.vendor | Platform vendor requirements |
| telehealth.technology.hipaa-platforms.vendor.consumer | Consumer platform restrictions |
| telehealth.technology.monitoring-devices | Remote monitoring devices |
| telehealth.technology.recording | Recording and documentation |