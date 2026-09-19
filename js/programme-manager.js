/**
 * ASHA Copilot 2.0+ - Health Programmes & Schemes Subsystem
 * Kalachakra 2K26 Healthcare PS-H02: "One Worker, Five Systems"
 * 
 * Features:
 * - 47+ Standard Indian Public Health Programmes across 9 Categories:
 *   1. Maternal & Newborn Health (JSY, JSSK, PMSMA, SUMAN, PMMVY, LaQshya, e-PMSMA)
 *   2. Child Health (RBSK [4 Ds], UIP, Mission Indradhanush)
 *   3. Communicable Diseases (NTEP, Nikshay Poshan Yojana, NLEP, NVBDCP, NACP, Viral Hepatitis, Rabies)
 *   4. Non-Communicable Diseases (NP-NCD, NMHP, NPHCE, NPPCD, NPCBVI, NOHP, NPPCF, NTCP, NPPC)
 *   5. Primary Healthcare (Ayushman Arogya Mandir / CPHC, AB-PMJAY, NHM)
 *   6. Family Planning & Reproductive Health (FPP, Mission Parivar Vikas, Contraceptives Choice, PPIUCD, Permanent, ARSH)
 *   7. Adolescent Health (RKSK)
 *   8. Nutrition (POSHAN Abhiyaan, POSHAN 2.0, Anaemia Mukt Bharat, Vitamin A, NIDDCP)
 *   9. Special Disease Programmes (Sickle Cell Mission, Cancer Control, NPCDCS, CKD, Burn Injuries, Fluorosis)
 * - Search by name, abbreviation, category, and health keywords ("pregnancy", "TB", "child", "hypertension", "nutrition")
 * - Eligibility Tracking: Reported, Under Review, Verified (Strict non-diagnostic and non-legal guard)
 * - Bidirectional Linking: Connects programmes to Person ID and Family ID without duplication
 * - Follow-up Surveillance: Active, Upcoming, Due Soon, Overdue, Not Scheduled
 * - Admin Programme Management: Add/edit/disable programmes for Medical Officers / Supervisors
 */

const STORAGE_CATALOG_KEY = 'asha_db_programmes_catalog_v2';
const STORAGE_ASSIGNMENTS_KEY = 'asha_db_programme_assignments_v2';
const STORAGE_REPORTS_KEY = 'asha_db_programme_reports_v2';

export const PROGRAMME_CATEGORIES = [
  'All Categories',
  'Maternal & Newborn Health',
  'Child Health',
  'Communicable Diseases',
  'Non-Communicable Diseases',
  'Primary Healthcare',
  'Family Planning & Reproductive Health',
  'Adolescent Health',
  'Nutrition',
  'Special Disease Programmes'
];

export const INITIAL_PROGRAMMES = [
  // 1. Maternal & Newborn Health
  {
    programme_id: 'JSY',
    abbreviation: 'JSY',
    name: 'Janani Suraksha Yojana',
    category: 'Maternal & Newborn Health',
    description: 'Safe motherhood intervention promoting institutional delivery through conditional direct cash assistance for rural and BPL mothers.',
    eligibility_criteria: [
      'Pregnant women belonging to BPL/SC/ST households in High Performing States (HPS)',
      'All pregnant women delivering in government health facilities in Low Performing States (LPS)',
      'Aged 19 years and above'
    ],
    benefits: [
      'INR 1,400 financial assistance for rural institutional delivery',
      'INR 1,000 financial assistance for urban institutional delivery',
      'INR 600 ASHA incentive for mobilization and escort'
    ],
    required_documents: ['MCP Card / Mother Child Tracking ID', 'Aadhaar Card', 'Bank Account Passbook'],
    follow_up_days: 14,
    health_area: ['pregnancy', 'maternal', 'delivery', 'anc', 'cash transfer', 'institutional delivery'],
    active: true
  },
  {
    programme_id: 'JSSK',
    abbreviation: 'JSSK',
    name: 'Janani Shishu Suraksha Karyakram',
    category: 'Maternal & Newborn Health',
    description: 'Completely cashless delivery and free treatment for pregnant women and sick neonates up to 1 year in public health facilities.',
    eligibility_criteria: [
      'All pregnant women delivering in public health institutions',
      'All sick infants and newborns seeking care up to 1 year of age'
    ],
    benefits: [
      'Zero out-of-pocket expenditure: Free drugs, consumables, and normal/C-section deliveries',
      'Free diagnostics (urine, blood, ultrasound)',
      'Free diet during stay (up to 3 days for normal, 7 days for C-section)',
      'Free transport from home to facility, inter-facility transfers, and drop-back home'
    ],
    required_documents: ['Hospital Admission Slip', 'MCP Card'],
    follow_up_days: 7,
    health_area: ['pregnancy', 'maternal', 'newborn', 'infant', 'cashless', 'hospital'],
    active: true
  },
  {
    programme_id: 'PMSMA',
    abbreviation: 'PMSMA',
    name: 'Pradhan Mantri Surakshit Matritva Abhiyan',
    category: 'Maternal & Newborn Health',
    description: 'Fixed-day assured, comprehensive and quality antenatal care (ANC) services by specialists/medical officers on the 9th of every month.',
    eligibility_criteria: [
      'All pregnant women in their 2nd and 3rd trimesters (after 12 weeks gestation)'
    ],
    benefits: [
      'Free comprehensive clinical check-up and screening on the 9th of every month',
      'Early identification and color-coded tagging of High-Risk Pregnancies (HRP)',
      'Free essential diagnostic tests (CBC, Blood Sugar, USG, Urine Albumin)',
      'Free Iron Folic Acid (IFA) and Calcium supplementation'
    ],
    required_documents: ['MCP Card', 'ANC Register Card'],
    follow_up_days: 28,
    health_area: ['pregnancy', 'maternal', 'anc', 'specialist', 'trimester', 'high risk'],
    active: true
  },
  {
    programme_id: 'SUMAN',
    abbreviation: 'SUMAN',
    name: 'Surakshit Matritva Aashwasan',
    category: 'Maternal & Newborn Health',
    description: 'Assured, dignified, respectful and quality healthcare at zero cost with zero tolerance for refusal to all pregnant women and newborns.',
    eligibility_criteria: [
      'All pregnant women and mothers up to 6 months post-delivery',
      'All sick infants'
    ],
    benefits: [
      'Guaranteed free maternal and infant health services at public health institutions',
      'Grievance redressal mechanism and toll-free helpline support',
      'Assured respectful maternity care with birth companion of choice'
    ],
    required_documents: ['MCP Card', 'Government Photo ID'],
    follow_up_days: 30,
    health_area: ['pregnancy', 'maternal', 'respectful care', 'zero cost', 'delivery'],
    active: true
  },
  {
    programme_id: 'PMMVY',
    abbreviation: 'PMMVY',
    name: 'Pradhan Mantri Matru Vandana Yojana',
    category: 'Maternal & Newborn Health',
    description: 'Direct benefit transfer maternity benefit compensating wage loss and improving health-seeking behavior during pregnancy and lactation.',
    eligibility_criteria: [
      'Pregnant Women and Lactating Mothers (PW&LM) for 1st living child',
      'Mothers having a girl child as 2nd child (under Poshan 2.0 revised guidelines)',
      'Family income within eligible socio-economic criteria'
    ],
    benefits: [
      'Cash incentive of INR 5,000 in two installments for first child directly to bank account',
      'Cash incentive of INR 6,000 for second girl child',
      'Wage-loss compensation enabling adequate rest before and after delivery'
    ],
    required_documents: ['MCP Card with early ANC registration', 'Aadhaar Card of Mother and Husband', 'Bank Passbook'],
    follow_up_days: 30,
    health_area: ['pregnancy', 'maternal', 'cash transfer', 'dbt', 'nutrition', 'first child'],
    active: true
  },
  {
    programme_id: 'LAQSHYA',
    abbreviation: 'LaQshya',
    name: 'LaQshya — Labour Room Quality Improvement',
    category: 'Maternal & Newborn Health',
    description: 'Initiative to improve quality of care in labour rooms and maternity operation theatres across secondary and tertiary facilities.',
    eligibility_criteria: [
      'Pregnant women admitted to public hospital labour rooms'
    ],
    benefits: [
      'Standardized intrapartum and immediate postpartum care',
      'Reduction in maternal and newborn mortality and morbidity',
      'Respectful maternity care with privacy partitions and birth companions'
    ],
    required_documents: ['Labour Room Admission Slip'],
    follow_up_days: 42,
    health_area: ['delivery', 'labour room', 'maternal', 'quality of care', 'postpartum'],
    active: true
  },
  {
    programme_id: 'E-PMSMA',
    abbreviation: 'e-PMSMA',
    name: 'e-PMSMA (High-Risk Pregnancy Tracking Portal)',
    category: 'Maternal & Newborn Health',
    description: 'Digital tracking and surveillance system for continuous monitoring, referral linkage, and follow-up of High-Risk Pregnancies.',
    eligibility_criteria: [
      'Pregnant women flagged with Severe Anaemia (Hb < 7 g/dL)',
      'Pregnancies complicated by Gestational Hypertension, Diabetes, Multi-parity, or Obstetric History'
    ],
    benefits: [
      'Individual longitudinal tracking till safe delivery',
      'Automated follow-up SMS and ASHA visit reminders',
      'Priority specialist consultation and institutional delivery planning'
    ],
    required_documents: ['MCP Card', 'Specialist Assessment Form', 'HRP Flag Slip'],
    follow_up_days: 14,
    health_area: ['pregnancy', 'high risk', 'anaemia', 'hypertension', 'surveillance', 'tracking'],
    active: true
  },

  // 2. Child Health
  {
    programme_id: 'RBSK',
    abbreviation: 'RBSK',
    name: 'Rashtriya Bal Swasthya Karyakram',
    category: 'Child Health',
    description: 'Child health screening and early intervention services for children from birth to 18 years covering the 4 Ds.',
    eligibility_criteria: [
      'Children aged 0 to 6 years screened at Anganwadi Centres',
      'Children aged 6 to 18 years screened in Government and Government-aided schools'
    ],
    benefits: [
      'Free screening for the 4 Ds: Defects at birth, Diseases, Deficiencies, Developmental delays',
      'Free comprehensive medical and surgical management at District Early Intervention Centres (DEIC)',
      'Therapeutic rehabilitation for neuro-developmental delays'
    ],
    required_documents: ['RBSK Screening Card', 'Birth Certificate / Anganwadi Record'],
    follow_up_days: 60,
    health_area: ['child', 'pediatric', 'screening', 'birth defects', 'developmental delay', '4ds'],
    active: true
  },
  {
    programme_id: 'UIP',
    abbreviation: 'UIP',
    name: 'Universal Immunization Programme',
    category: 'Child Health',
    description: 'One of the largest public health immunisation programmes in the world, providing free life-saving vaccines against 12 vaccine-preventable diseases.',
    eligibility_criteria: [
      'All infants (0 to 1 year)',
      'Children up to 5 years',
      'Pregnant women (Td doses)'
    ],
    benefits: [
      'Free vaccines: BCG, OPV, Hepatitis B, Pentavalent, Rotavirus, PCV, fIPV, MR, JE, DPT, and Td',
      'Protection against 12 deadly childhood diseases',
      'Cold-chain verified vaccine administration with MCP card recording'
    ],
    required_documents: ['MCP Card', 'UIP Vaccination Card'],
    follow_up_days: 30,
    health_area: ['immunisation', 'vaccination', 'child', 'infant', 'bcg', 'pentavalent', 'measles'],
    active: true
  },
  {
    programme_id: 'IMI',
    abbreviation: 'Mission Indradhanush',
    name: 'Routine Immunization / Intensified Mission Indradhanush (IMI)',
    category: 'Child Health',
    description: 'Special catch-up immunisation drives targeting hard-to-reach pockets, dropouts, and left-out unvaccinated children and pregnant women.',
    eligibility_criteria: [
      'Partially vaccinated or completely unvaccinated children aged 0 to 5 years',
      'Unvaccinated pregnant women missed during routine sessions'
    ],
    benefits: [
      'Targeted door-to-door community mobilization by ASHA workers',
      'Catch-up vaccination sessions in underserved rural, tribal, and migratory hamlets',
      'Zero-dropout surveillance'
    ],
    required_documents: ['Due-List Roster Entry', 'MCP Card'],
    follow_up_days: 15,
    health_area: ['immunisation', 'catchup', 'child', 'vaccination', 'dropout', 'indradhanush'],
    active: true
  },

  // 3. Communicable Diseases
  {
    programme_id: 'NTEP',
    abbreviation: 'NTEP',
    name: 'National Tuberculosis Elimination Programme',
    category: 'Communicable Diseases',
    description: 'National mission for TB detection, molecular diagnostics (CBNAAT/TrueNat), free DOTS treatment, and community adherence support.',
    eligibility_criteria: [
      'Presumptive TB cases (cough > 2 weeks, evening fever, weight loss, hemoptysis)',
      'Household and close contacts of confirmed pulmonary TB patients'
    ],
    benefits: [
      'Free sputum microscopy and rapid molecular CBNAAT testing',
      'Free daily fixed-dose combination anti-TB medications (FDC)',
      'Active case finding, contact tracing, and adherence tracking by ASHA'
    ],
    required_documents: ['Nikshay ID', 'Sputum Referral Slip', 'Aadhaar Card'],
    follow_up_days: 14,
    health_area: ['tb', 'tuberculosis', 'communicable', 'cough', 'nikshay', 'cbnaat'],
    active: true
  },
  {
    programme_id: 'NPY',
    abbreviation: 'Nikshay Poshan Yojana',
    name: 'Nikshay Poshan Yojana (Direct Benefit Transfer for TB)',
    category: 'Communicable Diseases',
    description: 'Financial and nutritional support scheme providing INR 500 per month directly to all notified TB patients during treatment.',
    eligibility_criteria: [
      'All notified TB patients registered on the Nikshay portal',
      'Active adherence to prescribed anti-TB treatment regimen'
    ],
    benefits: [
      'INR 500 per month direct benefit transfer (DBT) into bank account',
      'Covers nutritional requirements throughout the course of anti-TB treatment',
      'Incentives for treatment supporters'
    ],
    required_documents: ['Nikshay Registration ID', 'Bank Passbook / Mandate', 'Aadhaar Card'],
    follow_up_days: 30,
    health_area: ['tb', 'nutrition', 'dbt', 'nikshay', 'cash transfer', 'dietary support'],
    active: true
  },
  {
    programme_id: 'NLEP',
    abbreviation: 'NLEP',
    name: 'National Leprosy Eradication Programme',
    category: 'Communicable Diseases',
    description: 'Decentralized leprosy detection, multi-drug therapy (MDT), disability prevention and medical rehabilitation.',
    eligibility_criteria: [
      'Persons with hypopigmented patches with loss of sensation',
      'Thickened peripheral nerves or deformity'
    ],
    benefits: [
      'Free Multi-Drug Therapy (MDT) blister packs',
      'Reconstructive surgery and microcellular rubber (MCR) protective footwear',
      'Community contact screening and disability prevention guidance'
    ],
    required_documents: ['NLEP Case Card', 'Clinical Assessment Slip'],
    follow_up_days: 30,
    health_area: ['leprosy', 'skin', 'communicable', 'mdt', 'disability prevention'],
    active: true
  },
  {
    programme_id: 'NVBDCP',
    abbreviation: 'NVBDCP',
    name: 'National Vector Borne Disease Control Activities',
    category: 'Communicable Diseases',
    description: 'Surveillance and prevention covering Malaria, Dengue, Chikungunya, Lymphatic Filariasis, Kala-azar, and Japanese Encephalitis.',
    eligibility_criteria: [
      'Patients presenting with acute fever with chills, joint pains, or suspected mosquito-borne symptoms',
      'Communities in endemic vector zones'
    ],
    benefits: [
      'Rapid Diagnostic Tests (RDT) for Malaria and NS1 antigen for Dengue',
      'Free ACT treatment for Falciparum malaria and Chloroquine/Primaquine',
      'Distribution of Long-Lasting Insecticidal Nets (LLINs) and indoor residual spraying (IRS)'
    ],
    required_documents: ['Fever Surveillance Register Form', 'Blood Slide / RDT Report'],
    follow_up_days: 7,
    health_area: ['malaria', 'dengue', 'fever', 'vector borne', 'chikungunya', 'filariasis'],
    active: true
  },
  {
    programme_id: 'NACP',
    abbreviation: 'NACP',
    name: 'National AIDS Control Programme',
    category: 'Communicable Diseases',
    description: 'Comprehensive prevention, testing, free Anti-Retroviral Therapy (ART), and viral suppression linkage.',
    eligibility_criteria: [
      'All high-risk individuals, pregnant women (prevention of parent-to-child transmission - PPTCT)',
      'Persons living with HIV (PLHIV)'
    ],
    benefits: [
      'Free confidential HIV screening at ICTC centers',
      'Free lifelong ART medication and CD4/Viral Load monitoring',
      'Nutrition and psychosocial counseling'
    ],
    required_documents: ['ICTC Unique Identifier', 'ART Registration Card'],
    follow_up_days: 30,
    health_area: ['hiv', 'aids', 'art', 'pptct', 'communicable', 'sti'],
    active: true
  },
  {
    programme_id: 'NVHCP',
    abbreviation: 'NVHCP',
    name: 'National Viral Hepatitis Control Programme',
    category: 'Communicable Diseases',
    description: 'Nationwide screening, diagnosis, and free treatment of Hepatitis B and Hepatitis C.',
    eligibility_criteria: [
      'Individuals screened positive for HBsAg or anti-HCV antibodies',
      'High-risk groups and dialysis patients'
    ],
    benefits: [
      'Free viral load testing',
      'Direct Acting Antivirals (DAAs) providing cure for Hepatitis C in 12 weeks',
      'Lifelong treatment and vaccination for Hepatitis B'
    ],
    required_documents: ['Viral Hepatitis Register Card', 'Diagnostic Report'],
    follow_up_days: 30,
    health_area: ['hepatitis', 'liver', 'viral', 'communicable', 'jaundice'],
    active: true
  },
  {
    programme_id: 'NRCP',
    abbreviation: 'NRCP',
    name: 'National Rabies Control Programme',
    category: 'Communicable Diseases',
    description: 'Post-exposure prophylaxis (PEP) protocols, animal bite surveillance, and community bite prevention.',
    eligibility_criteria: [
      'Any individual with suspected dog, monkey, or wild animal bite/scratch (Category II & III bites)'
    ],
    benefits: [
      'Free Anti-Rabies Vaccine (ARV) schedule (Days 0, 3, 7, 28)',
      'Free Anti-Rabies Immunoglobulin (ERIG/HRIG) for severe Category III exposures',
      'Wound wash protocol training'
    ],
    required_documents: ['Animal Bite Registry Slip'],
    follow_up_days: 3,
    health_area: ['rabies', 'animal bite', 'dog bite', 'vaccine', 'pep'],
    active: true
  },

  // 4. Non-Communicable Diseases
  {
    programme_id: 'NP-NCD',
    abbreviation: 'NP-NCD',
    name: 'National Programme for Prevention and Control of Non-Communicable Diseases',
    category: 'Non-Communicable Diseases',
    description: 'Community-based screening (CBAC form), lifestyle counseling, early diagnosis, and management of Hypertension, Diabetes, and common Cancers.',
    eligibility_criteria: [
      'All men and women aged 30 years and older residing in the community'
    ],
    benefits: [
      'Annual blood pressure and random blood sugar (glucometer) screening by ASHA',
      'Free antihypertensive and antidiabetic medicines at Ayushman Arogya Mandirs',
      'Screening for Oral, Breast, and Cervical cancers with referral linkage'
    ],
    required_documents: ['CBAC Form', 'NCD Screening ID Card'],
    follow_up_days: 30,
    health_area: ['hypertension', 'diabetes', 'ncd', 'blood pressure', 'sugar', 'cancer', 'cbac'],
    active: true
  },
  {
    programme_id: 'NMHP',
    abbreviation: 'NMHP',
    name: 'National Mental Health Programme & Tele-MANAS',
    category: 'Non-Communicable Diseases',
    description: 'Community mental health awareness, identification of distress, suicide prevention, and 24/7 tele-counseling support.',
    eligibility_criteria: [
      'Individuals exhibiting severe psychological distress, depression, anxiety, or substance dependence'
    ],
    benefits: [
      'Free 24/7 tele-mental health counseling via Tele-MANAS (14416)',
      'District Mental Health Programme (DMHP) outpatient psychiatric consultations',
      'Psychotropic medication access at district facilities'
    ],
    required_documents: ['DMHP Assessment Form'],
    follow_up_days: 30,
    health_area: ['mental health', 'depression', 'anxiety', 'tele-manas', 'psychology'],
    active: true
  },
  {
    programme_id: 'NPHCE',
    abbreviation: 'NPHCE',
    name: 'National Programme for Health Care of the Elderly',
    category: 'Non-Communicable Diseases',
    description: 'Dedicated primary, secondary and tertiary geriatric healthcare services for senior citizens.',
    eligibility_criteria: [
      'Senior citizens aged 60 years and above'
    ],
    benefits: [
      'Dedicated weekly geriatric clinics at Primary Health Centres / Ayushman Arogya Mandirs',
      'Home-based palliative care for bedridden seniors by frontline workers',
      'Free mobility aids (walking sticks, crutches, calipers) and vision screenings'
    ],
    required_documents: ['Senior Citizen Age Proof', 'Geriatric Health Card'],
    follow_up_days: 30,
    health_area: ['elderly', 'geriatric', 'senior', 'mobility', 'home visit', 'ageing'],
    active: true
  },
  {
    programme_id: 'NPPCD',
    abbreviation: 'NPPCD',
    name: 'National Programme for Prevention and Control of Deafness',
    category: 'Non-Communicable Diseases',
    description: 'Early identification, diagnosis, and treatment of ear problems responsible for hearing impairment and deafness.',
    eligibility_criteria: [
      'Infants with congenital hearing loss, school children, or adults with progressive hearing deficit'
    ],
    benefits: [
      'Free audiometric evaluation and ear screening camps',
      'Free surgical intervention for chronic suppurative otitis media (CSOM)',
      'Free hearing aid distribution for eligible low-income beneficiaries'
    ],
    required_documents: ['Audiogram Report', 'NPPCD Screening Slip'],
    follow_up_days: 90,
    health_area: ['hearing', 'ear', 'deafness', 'audiology', 'hearing aid'],
    active: true
  },
  {
    programme_id: 'NPCBVI',
    abbreviation: 'NPCBVI',
    name: 'National Programme for Control of Blindness & Visual Impairment',
    category: 'Non-Communicable Diseases',
    description: 'Prevention of avoidable blindness through free cataract surgeries, refractive error correction, and school eye screenings.',
    eligibility_criteria: [
      'Elderly persons with senile cataract, school children with refractive errors'
    ],
    benefits: [
      'Free sutureless cataract surgery with Intraocular Lens (IOL) implantation',
      'Free prescription spectacles for screened school children and presbyopic seniors',
      'Glaucoma and diabetic retinopathy screening'
    ],
    required_documents: ['Vision Screening Card', 'Cataract Camp Slip'],
    follow_up_days: 30,
    health_area: ['eye', 'vision', 'blindness', 'cataract', 'spectacles', 'ophthalmology'],
    active: true
  },
  {
    programme_id: 'NOHP',
    abbreviation: 'NOHP',
    name: 'National Oral Health Programme',
    category: 'Non-Communicable Diseases',
    description: 'Primary oral health education, dental caries screening, and prevention of oral precancerous lesions.',
    eligibility_criteria: [
      'Community members screened for dental caries, periodontal disease, or oral leukoplakia'
    ],
    benefits: [
      'Oral hygiene education and early detection of oral precancerous lesions in tobacco users',
      'Basic dental extractions, restorations, and scaling at CHC dental units'
    ],
    required_documents: ['Dental OPD Ticket'],
    follow_up_days: 90,
    health_area: ['oral', 'dental', 'teeth', 'mouth', 'precancer'],
    active: true
  },
  {
    programme_id: 'NPPCF',
    abbreviation: 'NPPCF',
    name: 'National Programme for Prevention and Control of Fluorosis',
    category: 'Non-Communicable Diseases',
    description: 'Surveillance of endemic fluorosis areas, drinking water defluoridation advocacy, and clinical management.',
    eligibility_criteria: [
      'Populations residing in groundwater fluoride-endemic districts showing dental or skeletal fluorosis'
    ],
    benefits: [
      'Water testing for fluoride levels',
      'Nutritional supplementation (Calcium, Vitamin C, Vitamin D) to mitigate skeletal fluorosis',
      'Safe drinking water linkage'
    ],
    required_documents: ['Fluorosis Survey Record'],
    follow_up_days: 90,
    health_area: ['fluorosis', 'water', 'groundwater', 'skeletal', 'dental fluorosis'],
    active: true
  },
  {
    programme_id: 'NTCP',
    abbreviation: 'NTCP',
    name: 'National Tobacco Control Programme',
    category: 'Non-Communicable Diseases',
    description: 'Community tobacco cessation counseling, enforcement of COTPA regulations, and youth awareness.',
    eligibility_criteria: [
      'Active tobacco users (bidi, cigarette, gutkha, khaini) seeking cessation support'
    ],
    benefits: [
      'Free counseling at Tobacco Cessation Centres (TCC)',
      'Free Nicotine Replacement Therapy (NRT gum/patches) for motivated quitters',
      'School tobacco-free educational interventions'
    ],
    required_documents: ['TCC Intake Form'],
    follow_up_days: 15,
    health_area: ['tobacco', 'smoking', 'cessation', 'nrt', 'nicotine'],
    active: true
  },
  {
    programme_id: 'NPPC',
    abbreviation: 'NPPC',
    name: 'National Programme for Palliative Care',
    category: 'Non-Communicable Diseases',
    description: 'Community-based pain relief and palliative care services for patients with terminal illnesses and chronic suffering.',
    eligibility_criteria: [
      'Patients with advanced terminal cancer, organ failure, or debilitating chronic illness'
    ],
    benefits: [
      'Home-based symptom control and pain management (oral morphine access)',
      'Caregiver training in bed-sore prevention, catheter care, and dignity in dying',
      'Emotional and bereavement support for families'
    ],
    required_documents: ['Palliative Care Assessment Sheet', 'Physician Referral Form'],
    follow_up_days: 7,
    health_area: ['palliative', 'pain relief', 'terminal', 'cancer', 'home care', 'bedridden'],
    active: true
  },

  // 5. Primary Healthcare
  {
    programme_id: 'AAM-CPHC',
    abbreviation: 'AAM / CPHC',
    name: 'Ayushman Arogya Mandir / Comprehensive Primary Health Care',
    category: 'Primary Healthcare',
    description: 'Transformation of Sub-Centres into Ayushman Arogya Mandirs delivering 12 packages of comprehensive primary healthcare close to home.',
    eligibility_criteria: [
      'Entire community population residing in the sub-centre catchment area'
    ],
    benefits: [
      'Free 12 essential primary healthcare packages covering maternal, child, NCD, mental, and emergency care',
      'Tele-consultation with specialist doctors via e-Sanjeevani',
      'Free essential diagnostics (14 tests) and free essential medicines (105 drugs)'
    ],
    required_documents: ['Ayushman Health ID (ABHA)'],
    follow_up_days: 30,
    health_area: ['primary care', 'ayushman arogya mandir', 'cphc', 'telemedicine', 'subcentre', 'e-sanjeevani'],
    active: true
  },
  {
    programme_id: 'AB-PMJAY',
    abbreviation: 'AB-PMJAY',
    name: 'Ayushman Bharat – Pradhan Mantri Jan Arogya Yojana',
    category: 'Primary Healthcare',
    description: 'World’s largest health assurance scheme providing cashless secondary and tertiary hospitalization cover of INR 5 Lakh per family per year.',
    eligibility_criteria: [
      'Families identified under deprivation criteria of Socio-Economic Caste Census (SECC 2011)',
      'RSBY beneficiaries, NFSA ration card holders, and senior citizens aged 70+ (universal expansion)'
    ],
    benefits: [
      'Health assurance cover of INR 5,00,000 per family per year for secondary and tertiary hospitalization',
      'Completely cashless treatment across 27,000+ empaneled public and private hospitals nationwide',
      'Pre-existing conditions covered from Day 1 with zero co-payment'
    ],
    required_documents: ['Ayushman Golden Card / ABHA ID', 'Ration Card', 'Aadhaar Card'],
    follow_up_days: 60,
    health_area: ['insurance', 'hospitalization', 'pmjay', 'ayushman card', 'cashless', '5 lakh'],
    active: true
  },
  {
    programme_id: 'NHM',
    abbreviation: 'NHM',
    name: 'National Health Mission',
    category: 'Primary Healthcare',
    description: 'Overarching mission supporting strengthening of rural (NRHM) and urban (NUHM) public healthcare infrastructure and frontline workforce.',
    eligibility_criteria: [
      'All citizens, particularly vulnerable rural, urban poor, and marginalized communities'
    ],
    benefits: [
      'Support for ASHA community health workers and Village Health Sanitation & Nutrition Committees (VHSNC)',
      'Free ambulance transport services (108 / 102 emergency response)',
      'Village Health Sanitation and Nutrition Days (VHSND) on fixed monthly dates'
    ],
    required_documents: ['VHSND Register Form'],
    follow_up_days: 30,
    health_area: ['nhm', 'nrhm', 'nuhm', 'infrastructure', 'vhsnd', 'ambulance'],
    active: true
  },

  // 6. Family Planning & Reproductive Health
  {
    programme_id: 'FPP',
    abbreviation: 'FPP',
    name: 'Family Planning Programme',
    category: 'Family Planning & Reproductive Health',
    description: 'Voluntary family planning services offering spaced contraception choices and terminal methods.',
    eligibility_criteria: [
      'Eligible couples (women aged 15–49 and their partners) desiring spacing or limiting'
    ],
    benefits: [
      'Free distribution of condoms (Nirodh), oral contraceptive pills (Mala-N / Chhaya), and emergency pills (E-Pills)',
      'Injectable contraceptives (Antara) every 3 months with counseling',
      'Incentives for sterilization and compensation for loss of wages'
    ],
    required_documents: ['Family Planning Register Record', 'Consent Form'],
    follow_up_days: 30,
    health_area: ['family planning', 'contraceptives', 'spacing', 'condom', 'antara', 'chhaya'],
    active: true
  },
  {
    programme_id: 'MPV',
    abbreviation: 'MPV',
    name: 'Mission Parivar Vikas',
    category: 'Family Planning & Reproductive Health',
    description: 'Targeted initiative in 146 high Total Fertility Rate (TFR >= 3) districts to rapidly accelerate access to contraceptives.',
    eligibility_criteria: [
      'Couples in high-fertility priority districts'
    ],
    benefits: [
      'Nayi Pehal kits (family planning counseling kits) gifted to newly-weds',
      'Saas-Bahu Sammelans for inter-generational family planning dialogue',
      'Special mobile sterilization and PPIUCD van camps'
    ],
    required_documents: ['Eligible Couple Register'],
    follow_up_days: 30,
    health_area: ['family planning', 'high tfr', 'mission parivar vikas', 'nayi pehal'],
    active: true
  },
  {
    programme_id: 'ECC',
    abbreviation: 'ECC',
    name: 'Expanded Choice of Contraceptives',
    category: 'Family Planning & Reproductive Health',
    description: 'Introduction of new spacing methods including Sub-dermal Implants, Progestin-only Pills (POP), and modern non-hormonal pills.',
    eligibility_criteria: [
      'Women seeking modern, discreet, and long-acting reversible contraception'
    ],
    benefits: [
      'Centchroman non-hormonal weekly pills (Chhaya) with zero side effects',
      'Medroxyprogesterone Acetate (MPA / Antara) 3-month injections',
      'Contraceptive counseling and side-effect management'
    ],
    required_documents: ['Contraceptive Screening Card'],
    follow_up_days: 60,
    health_area: ['contraceptives', 'chhaya', 'antara', 'spacing', 'reproductive'],
    active: true
  },
  {
    programme_id: 'IUCD',
    abbreviation: 'IUCD / PPIUCD',
    name: 'Postpartum & Interval IUCD Services',
    category: 'Family Planning & Reproductive Health',
    description: 'Highly effective long-acting reversible intrauterine contraceptive devices (Cu-T 380A for 10 years, Cu-T 375 for 5 years).',
    eligibility_criteria: [
      'Postpartum women within 48 hours of normal delivery or during C-section, and post-abortion/interval'
    ],
    benefits: [
      'Immediate postpartum insertion before hospital discharge (PPIUCD)',
      'Long-term reversible spacing with failure rate < 1%',
      'ASHA mobilization incentive for escorting clients'
    ],
    required_documents: ['IUCD Follow-up Card', 'Delivery Record'],
    follow_up_days: 42,
    health_area: ['iucd', 'ppiucd', 'copper t', 'spacing', 'postpartum'],
    active: true
  },
  {
    programme_id: 'PCS',
    abbreviation: 'PCS',
    name: 'Permanent Contraception Services (NSV & Minilap)',
    category: 'Family Planning & Reproductive Health',
    description: 'Safe, voluntary permanent terminal family planning methods: Non-Scalpel Vasectomy (NSV) for men and Minilap / Laparoscopic Tubectomy for women.',
    eligibility_criteria: [
      'Married couples with at least one living child not less than 1 year of age'
    ],
    benefits: [
      'Free clinical procedure at CHC / Sub-district Hospital',
      'Direct wage compensation: INR 2,000 for female sterilization; INR 2,700 for male NSV',
      'Family Planning Indemnity Scheme insurance cover'
    ],
    required_documents: ['Sterilization Consent Form', 'Age & Marriage Proof'],
    follow_up_days: 7,
    health_area: ['sterilization', 'vasectomy', 'tubectomy', 'permanent', 'nsv'],
    active: true
  },
  {
    programme_id: 'ARSH',
    abbreviation: 'ARSH under RKSK',
    name: 'Adolescent Reproductive & Sexual Health Activities',
    category: 'Family Planning & Reproductive Health',
    description: 'Adolescent friendly health clinics (AFHC) providing non-judgmental counseling, menstrual hygiene, and nutritional guidance.',
    eligibility_criteria: [
      'Adolescent girls and boys aged 10 to 19 years'
    ],
    benefits: [
      'Subsidized sanitary napkin distribution (INR 6 for pack of 6 pads) under Menstrual Hygiene Scheme',
      'Weekly Iron Folic Acid Supplementation (WIFS)',
      'Confidential reproductive, puberty, and mental health counseling'
    ],
    required_documents: ['AFHC Register Card'],
    follow_up_days: 30,
    health_area: ['adolescent', 'menstrual hygiene', 'sanitary napkins', 'arsh', 'puberty'],
    active: true
  },

  // 7. Adolescent Health
  {
    programme_id: 'RKSK',
    abbreviation: 'RKSK',
    name: 'Rashtriya Kishor Swasthya Karyakram',
    category: 'Adolescent Health',
    description: 'Holistic adolescent health strategy focusing on nutrition, SRH, mental health, substance misuse prevention, injuries, and gender equality.',
    eligibility_criteria: [
      'All adolescents aged 10–19 years in both school-going and out-of-school populations'
    ],
    benefits: [
      'Peer educator (Saathiya) community sessions in villages',
      'Quarterly Adolescent Health Days (AHD) in villages with nutrition and hemoglobin check-ups',
      'Confidential referral to Adolescent Friendly Health Clinics (AFHC)'
    ],
    required_documents: ['Saathiya Session Attendance Form'],
    follow_up_days: 60,
    health_area: ['adolescent', 'rksk', 'saathiya', 'teen', 'mental health', 'substance use'],
    active: true
  },

  // 8. Nutrition
  {
    programme_id: 'POSHAN-1',
    abbreviation: 'POSHAN Abhiyaan',
    name: 'POSHAN Abhiyaan (National Nutrition Mission)',
    category: 'Nutrition',
    description: 'Flagship programme aimed at reducing stunting, undernutrition, anaemia, and low birth weight in young children and women.',
    eligibility_criteria: [
      'Children aged 0 to 6 years',
      'Pregnant women and lactating mothers'
    ],
    benefits: [
      'Real-time growth monitoring (weight-for-age, height-for-age) via Poshan Tracker',
      'Community-Based Events (CBE) on nutrition practices (Godh Bharai, Annaprashan)',
      'Convergence with Anganwadi Supplementary Nutrition Programme (SNP)'
    ],
    required_documents: ['Poshan Tracker Beneficiary ID', 'MCP Card'],
    follow_up_days: 30,
    health_area: ['nutrition', 'stunting', 'wasting', 'growth monitoring', 'poshan', 'anganwadi'],
    active: true
  },
  {
    programme_id: 'POSHAN-2',
    abbreviation: 'POSHAN 2.0',
    name: 'Saksham Anganwadi & POSHAN 2.0',
    category: 'Nutrition',
    description: 'Overhauled nutrition support mission integrating Poshan Abhiyaan, Scheme for Adolescent Girls, and upgraded smart Anganwadi infrastructure.',
    eligibility_criteria: [
      'Children 6 months to 6 years, pregnant women, nursing mothers, and adolescent girls (14–18 years in aspirational districts)'
    ],
    benefits: [
      'Fortified Take-Home Rations (THR) and Hot Cooked Meals with millets and micronutrients',
      'Upgraded Saksham Anganwadi centres with clean RO water and Poshan Vatikas (nutrition gardens)',
      'Targeted intervention for Severe Acute Malnutrition (SAM) with referral to Nutrition Rehabilitation Centres (NRC)'
    ],
    required_documents: ['Anganwadi Ration Register Slip'],
    follow_up_days: 30,
    health_area: ['nutrition', 'poshan 2.0', 'thr', 'sam', 'nrc', 'malnutrition', 'millets'],
    active: true
  },
  {
    programme_id: 'AMB',
    abbreviation: 'AMB',
    name: 'Anaemia Mukt Bharat',
    category: 'Nutrition',
    description: 'National multi-sectoral strategy aiming to reduce anaemia prevalence across six beneficiary age groups through 6x6x6 interventions.',
    eligibility_criteria: [
      'Children 6–59 months, children 5–9 years, adolescents 10–19 years, pregnant women, and women of reproductive age'
    ],
    benefits: [
      'Bi-weekly IFA syrup for infants 6–59 months',
      'Weekly pink IFA tablets for 5–9 years and blue IFA tablets for adolescents',
      'Daily red IFA tablets (100mg iron + 500mcg folic acid) for pregnant women for at least 180 days',
      'De-worming with Albendazole tablets twice a year (National Deworming Day)'
    ],
    required_documents: ['AMB Distribution Record / MCP Card'],
    follow_up_days: 30,
    health_area: ['anaemia', 'iron', 'ifa', 'folic acid', 'deworming', 'albendazole', 'haemoglobin'],
    active: true
  },
  {
    programme_id: 'VIT-A',
    abbreviation: 'Vitamin A',
    name: 'National Prophylaxis Programme against Nutritional Blindness',
    category: 'Nutrition',
    description: 'Semi-annual Vitamin A supplementation to prevent xerophthalmia, corneal blindness, and reduce childhood morbidity.',
    eligibility_criteria: [
      'Children aged 9 months to 5 years (total 9 mega doses)'
    ],
    benefits: [
      '1st dose (1 Lakh IU) administered along with Measles-Rubella (MR-1) vaccine at 9 months',
      'Subsequent 8 doses (2 Lakh IU each) administered biannually during special rounds',
      'Prevention of night blindness and enhanced mucosal immunity'
    ],
    required_documents: ['MCP Card Vitamin A Matrix'],
    follow_up_days: 180,
    health_area: ['vitamin a', 'nutrition', 'child', 'blindness', 'prophylaxis'],
    active: true
  },
  {
    programme_id: 'NIDDCP',
    abbreviation: 'NIDDCP',
    name: 'National Iodine Deficiency Disorders Control Programme',
    category: 'Nutrition',
    description: 'Ensuring 100% universal consumption of adequately iodized salt (>= 15 ppm at consumer level) to eliminate goitre and cretinism.',
    eligibility_criteria: [
      'All households in rural and urban communities'
    ],
    benefits: [
      'Village-level salt testing with MBI field test kits by ASHA workers during home visits',
      'Community education on preventing mental subnormality and goitre in children'
    ],
    required_documents: ['Household Salt Testing Roster'],
    follow_up_days: 90,
    health_area: ['iodine', 'salt', 'goitre', 'nutrition', 'deficiency'],
    active: true
  },

  // 9. Special Disease Programmes
  {
    programme_id: 'SCAEM',
    abbreviation: 'SCAEM',
    name: 'National Sickle Cell Anaemia Elimination Mission',
    category: 'Special Disease Programmes',
    description: 'Mission to eliminate sickle cell disease by 2047 through universal point-of-care screening, marriage counseling, and lifelong management.',
    eligibility_criteria: [
      'Tribal and high-prevalence population aged 0 to 40 years'
    ],
    benefits: [
      'Point-of-care rapid solubility / HPLC screening card',
      'Color-coded Sickle Cell Status Cards (Normal, Carrier/Trait, Diseased)',
      'Free Hydroxyurea therapy and Folic Acid supplementation'
    ],
    required_documents: ['Sickle Cell Status Card', 'Screening Consent Slip'],
    follow_up_days: 60,
    health_area: ['sickle cell', 'anaemia', 'tribal', 'genetic', 'blood disorder', 'hplc'],
    active: true
  },
  {
    programme_id: 'NPCC',
    abbreviation: 'NPCC',
    name: 'National Programme for Prevention & Control of Cancer',
    category: 'Special Disease Programmes',
    description: 'Early detection, specialized clinical triage, and treatment linkage for oral, breast, and cervical cancers.',
    eligibility_criteria: [
      'Women and men aged 30+ screened positive in community CBAC assessments'
    ],
    benefits: [
      'Visual Inspection with Acetic Acid (VIA) screening for cervical cancer at PHC/CHC',
      'Clinical breast examination and referral mammography',
      'Assistance through Health Minister’s Cancer Patient Fund (HMCPF)'
    ],
    required_documents: ['Cancer Screening Referral Slip', 'Biopsy / Cytology Report'],
    follow_up_days: 30,
    health_area: ['cancer', 'oncology', 'cervical', 'breast', 'oral cancer', 'via screening'],
    active: true
  },
  {
    programme_id: 'NPCDCS',
    abbreviation: 'NPCDCS',
    name: 'National Programme for Diabetes, CVD & Stroke',
    category: 'Special Disease Programmes',
    description: 'Targeted cardiovascular prevention, emergency stroke care pathways, and chronic diabetes monitoring.',
    eligibility_criteria: [
      'Individuals diagnosed with severe uncontrolled diabetes (HbA1c > 8.0%) or high cardiovascular risk (> 20%)'
    ],
    benefits: [
      'Free HbA1c testing and serum creatinine monitoring',
      'Daily cardioprotective statins, ACE-inhibitors, and insulin linkage',
      'Community lifestyle modifications and cardiac risk stratification'
    ],
    required_documents: ['Cardiovascular Risk Assessment Card'],
    follow_up_days: 30,
    health_area: ['diabetes', 'cardiovascular', 'stroke', 'heart disease', 'hba1c'],
    active: true
  },
  {
    programme_id: 'NP-CKD',
    abbreviation: 'NP-CKD',
    name: 'Pradhan Mantri National Dialysis Programme & CKD Prevention',
    category: 'Special Disease Programmes',
    description: 'Free hemodialysis and peritoneal dialysis services for BPL kidney disease patients at district hospitals.',
    eligibility_criteria: [
      'Patients diagnosed with End-Stage Renal Disease (ESRD) or chronic kidney failure'
    ],
    benefits: [
      'Completely free hemodialysis sessions under public-private partnership (PPP) model at district hospitals',
      'Home peritoneal dialysis support and EPO injections for eligible BPL beneficiaries'
    ],
    required_documents: ['Nephrology Dialysis Prescription', 'BPL Card'],
    follow_up_days: 7,
    health_area: ['kidney', 'ckd', 'dialysis', 'renal', 'esrd'],
    active: true
  },
  {
    programme_id: 'NP-BURNS',
    abbreviation: 'NP-BURNS',
    name: 'National Programme for Prevention & Management of Burn Injuries',
    category: 'Special Disease Programmes',
    description: 'Specialized burn care units, emergency fluid resuscitation protocols, and rehabilitation.',
    eligibility_criteria: [
      'Patients sustaining thermal, chemical, or electrical burn injuries'
    ],
    benefits: [
      'Immediate first-aid and wound dressing at primary health facilities',
      'Dedicated tertiary burn intensive care beds and reconstructive surgery linkage'
    ],
    required_documents: ['Burns Casualty Admission Sheet'],
    follow_up_days: 7,
    health_area: ['burns', 'wound care', 'injury', 'trauma', 'rehabilitation'],
    active: true
  },
  {
    programme_id: 'NP-FLUORO',
    abbreviation: 'Fluorosis Control',
    name: 'National Fluorosis Elimination & Management',
    category: 'Special Disease Programmes',
    description: 'Specialized nutritional mitigation and surgical corrective support for severe crippling skeletal fluorosis cases.',
    eligibility_criteria: [
      'Patients in endemic regions presenting with severe joint stiffness and spinal deformities'
    ],
    benefits: [
      'High-dose Calcium and antioxidant therapeutic regimens',
      'Community household reverse osmosis defluoridation filter installation'
    ],
    required_documents: ['Skeletal Fluorosis X-Ray Report'],
    follow_up_days: 60,
    health_area: ['fluorosis', 'skeletal', 'water contamination', 'joints'],
    active: true
  }
];

// Initial synthetic assignments linking Sita Devi, Family F042, Anu, Ravi, Lakshmi
export const INITIAL_ASSIGNMENTS = [
  {
    assignment_id: 'ASN-001',
    programme_id: 'PMMVY',
    programme_name: 'Pradhan Mantri Matru Vandana Yojana',
    target_type: 'individual',
    person_id: 'P-SIT-101',
    person_name: 'Sita Devi',
    family_id: 'F042',
    eligibility_status: 'Eligible',
    verification_status: 'Under Review',
    registered_date: '2026-08-15',
    last_follow_up: '2026-09-05',
    next_follow_up: '2026-10-02',
    follow_up_status: 'Upcoming',
    notes: 'First installment INR 3,000 processed. Second installment due after 3rd trimester ANC registration.',
    document_title: 'MCP Card & Bank Passbook',
    recorded_by: 'ASHA001 Sita Rao'
  },
  {
    assignment_id: 'ASN-002',
    programme_id: 'PMSMA',
    programme_name: 'Pradhan Mantri Surakshit Matritva Abhiyan',
    target_type: 'individual',
    person_id: 'P-SIT-101',
    person_name: 'Sita Devi',
    family_id: 'F042',
    eligibility_status: 'Eligible',
    verification_status: 'Verified',
    registered_date: '2026-08-15',
    last_follow_up: '2026-09-05',
    next_follow_up: '2026-10-09',
    follow_up_status: 'Active',
    notes: 'Attended PMSMA special ANC session on 9th Sep. Green sticker assigned (Normal progression).',
    document_title: 'PMSMA ANC Diagnostic Card',
    recorded_by: 'ASHA001 Sita Rao'
  },
  {
    assignment_id: 'ASN-003',
    programme_id: 'JSY',
    programme_name: 'Janani Suraksha Yojana',
    target_type: 'individual',
    person_id: 'P-SIT-101',
    person_name: 'Sita Devi',
    family_id: 'F042',
    eligibility_status: 'Eligible',
    verification_status: 'Verified',
    registered_date: '2026-08-15',
    last_follow_up: '2026-09-05',
    next_follow_up: '2026-10-15',
    follow_up_status: 'Active',
    notes: 'Institutional delivery planned at Rampur Community Health Centre. Escort confirmed.',
    document_title: 'JSY Pre-Registration Slip',
    recorded_by: 'ASHA001 Sita Rao'
  },
  {
    assignment_id: 'ASN-004',
    programme_id: 'AB-PMJAY',
    programme_name: 'Ayushman Bharat – Pradhan Mantri Jan Arogya Yojana',
    target_type: 'family',
    person_id: null,
    person_name: 'Family F042',
    family_id: 'F042',
    eligibility_status: 'Eligible',
    verification_status: 'Verified',
    registered_date: '2026-07-10',
    last_follow_up: '2026-09-01',
    next_follow_up: '2026-11-01',
    follow_up_status: 'Active',
    notes: 'Golden Health Cards issued to all 6 family members. Secondary/tertiary cover active.',
    document_title: 'PM-JAY Family Golden Card',
    recorded_by: 'ANM001 Sarojini Rao'
  },
  {
    assignment_id: 'ASN-005',
    programme_id: 'POSHAN-2',
    programme_name: 'Saksham Anganwadi & POSHAN 2.0',
    target_type: 'family',
    person_id: 'P-SIT-101',
    person_name: 'Sita Devi (Family F042)',
    family_id: 'F042',
    eligibility_status: 'Eligible',
    verification_status: 'Active',
    registered_date: '2026-08-10',
    last_follow_up: '2026-09-10',
    next_follow_up: '2026-10-10',
    follow_up_status: 'Upcoming',
    notes: 'Receiving monthly fortified Take-Home Ration (THR) packets from Anganwadi Centre 4B.',
    document_title: 'Poshan Roster Slip',
    recorded_by: 'ASHA001 Sita Rao'
  },
  {
    assignment_id: 'ASN-006',
    programme_id: 'UIP',
    programme_name: 'Universal Immunization Programme',
    target_type: 'individual',
    person_id: 'P-ANU-105',
    person_name: 'Anu (Age 5)',
    family_id: 'F042',
    eligibility_status: 'Eligible',
    verification_status: 'Verified',
    registered_date: '2026-06-01',
    last_follow_up: '2026-09-18',
    next_follow_up: '2026-10-18',
    follow_up_status: 'Active',
    notes: 'DPT Booster dose scheduled and verified.',
    document_title: 'MCP Immunisation Card',
    recorded_by: 'ASHA001 Sita Rao'
  },
  {
    assignment_id: 'ASN-007',
    programme_id: 'RKSK',
    programme_name: 'Rashtriya Kishor Swasthya Karyakram',
    target_type: 'individual',
    person_id: 'P-RAV-104',
    person_name: 'Ravi Kumar (Age 17)',
    family_id: 'F042',
    eligibility_status: 'Eligible',
    verification_status: 'Active',
    registered_date: '2026-08-20',
    last_follow_up: '2026-09-10',
    next_follow_up: '2026-10-20',
    follow_up_status: 'Upcoming',
    notes: 'Enrolled in village Saathiya peer group. Attended Adolescent Health Day.',
    document_title: 'Saathiya Peer Card',
    recorded_by: 'ASHA001 Sita Rao'
  },
  {
    assignment_id: 'ASN-008',
    programme_id: 'NP-NCD',
    programme_name: 'National Programme for Prevention & Control of NCDs',
    target_type: 'individual',
    person_id: 'P-LAK-103',
    person_name: 'Lakshmi Devi (Age 61)',
    family_id: 'F042',
    eligibility_status: 'Eligible',
    verification_status: 'Verified',
    registered_date: '2026-05-15',
    last_follow_up: '2026-09-12',
    next_follow_up: '2026-10-12',
    follow_up_status: 'Active',
    notes: 'Hypertension monitored monthly. Free Amlodipine supplied at Ayushman Arogya Mandir.',
    document_title: 'NCD CBAC Card',
    recorded_by: 'ASHA001 Sita Rao'
  }
];

export class ProgrammeManager {
  constructor() {
    this.initCatalog();
    this.initAssignments();
    this.initReports();
  }

  initCatalog() {
    const raw = localStorage.getItem(STORAGE_CATALOG_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_CATALOG_KEY, JSON.stringify(INITIAL_PROGRAMMES));
    }
  }

  initAssignments() {
    const raw = localStorage.getItem(STORAGE_ASSIGNMENTS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_ASSIGNMENTS_KEY, JSON.stringify(INITIAL_ASSIGNMENTS));
    }
  }

  initReports() {
    const raw = localStorage.getItem(STORAGE_REPORTS_KEY);
    if (!raw) {
      const demoReports = [
        {
          report_id: 'REP-PR-001',
          programme_id: 'PMMVY',
          family_id: 'F042',
          person_id: 'P-SIT-101',
          person_name: 'Sita Devi',
          asha_id: 'ASHA001',
          asha_name: 'Sita Rao',
          report_type: 'PROGRAMME_VISIT',
          title: 'Second Trimester PMMVY Instalment Verification',
          date: '2026-09-05',
          status: 'Verified',
          details: 'Verified second ANC check-up. Blood and urine test results uploaded to MCP portal.',
          document_id: null
        },
        {
          report_id: 'REP-PR-002',
          programme_id: 'PMSMA',
          family_id: 'F042',
          person_id: 'P-SIT-101',
          person_name: 'Sita Devi',
          asha_id: 'ASHA001',
          asha_name: 'Sita Rao',
          report_type: 'SPECIALIST_ANC',
          title: 'Fixed-Day PMSMA Specialist Consultation (9th)',
          date: '2026-09-09',
          status: 'Verified',
          details: 'Checked by Dr. K. V. Sharma at Sub-Centre clinic. Ultrasound reported normal single live fetus.',
          document_id: null
        }
      ];
      localStorage.setItem(STORAGE_REPORTS_KEY, JSON.stringify(demoReports));
    }
  }

  getAllProgrammes(category = 'All Categories', searchQuery = '') {
    const raw = localStorage.getItem(STORAGE_CATALOG_KEY);
    let programmes = raw ? JSON.parse(raw) : INITIAL_PROGRAMMES;

    // Filter by active
    programmes = programmes.filter(p => p.active !== false);

    // Filter by Category
    if (category && category !== 'All Categories') {
      programmes = programmes.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    // Filter by Search Query (name, abbreviation, description, health area)
    if (searchQuery && searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      programmes = programmes.filter(p => {
        const matchName = (p.name || '').toLowerCase().includes(q);
        const matchAbbr = (p.abbreviation || p.abbr || '').toLowerCase().includes(q);
        const matchDesc = (p.description || '').toLowerCase().includes(q);
        const matchArea = Array.isArray(p.health_area) && p.health_area.some(a => a.toLowerCase().includes(q));
        return matchName || matchAbbr || matchDesc || matchArea;
      });
    }

    return programmes.map(p => ({
      ...p,
      id: p.programme_id || p.id,
      abbr: p.abbreviation || p.abbr,
      eligibilityCriteria: Array.isArray(p.eligibility_criteria) ? p.eligibility_criteria.join(' • ') : (p.eligibility_criteria || p.eligibilityCriteria || ''),
      benefits: Array.isArray(p.benefits) ? p.benefits.join(' • ') : (p.benefits || ''),
      followupFrequency: p.follow_up_days ? `Every ${p.follow_up_days} days` : (p.followupFrequency || 'Routine frontline visit'),
      keywords: Array.isArray(p.health_area) ? p.health_area : (p.keywords || [])
    }));
  }

  getProgrammeById(id) {
    const raw = localStorage.getItem(STORAGE_CATALOG_KEY);
    const programmes = raw ? JSON.parse(raw) : INITIAL_PROGRAMMES;
    const p = programmes.find(p => p.programme_id === id || p.abbreviation === id || p.id === id);
    if (!p) return null;
    return {
      ...p,
      id: p.programme_id || p.id,
      abbr: p.abbreviation || p.abbr,
      eligibilityCriteria: Array.isArray(p.eligibility_criteria) ? p.eligibility_criteria.join(' • ') : (p.eligibility_criteria || p.eligibilityCriteria || ''),
      benefits: Array.isArray(p.benefits) ? p.benefits.join(' • ') : (p.benefits || ''),
      followupFrequency: p.follow_up_days ? `Every ${p.follow_up_days} days` : (p.followupFrequency || 'Routine frontline visit'),
      keywords: Array.isArray(p.health_area) ? p.health_area : (p.keywords || [])
    };
  }

  getAssignments() {
    const raw = localStorage.getItem(STORAGE_ASSIGNMENTS_KEY);
    const list = raw ? JSON.parse(raw) : INITIAL_ASSIGNMENTS;
    return list.map(a => ({
      ...a,
      programmeId: a.programme_id || a.programmeId,
      programmeName: a.programme_name || a.programmeName,
      personId: a.person_id || a.personId,
      personName: a.person_name || a.personName,
      familyId: a.family_id || a.familyId,
      targetType: a.target_type || a.targetType,
      verificationStatus: a.verification_status || a.verificationStatus,
      enrolledDate: a.registered_date || a.enrolledDate,
      nextScheduledDate: a.next_follow_up || a.nextScheduledDate
    }));
  }

  saveAssignments(assignments) {
    localStorage.setItem(STORAGE_ASSIGNMENTS_KEY, JSON.stringify(assignments));
  }

  getAssignmentsForPerson(personId) {
    if (!personId) return [];
    return this.getAssignments().filter(a => a.personId === personId || a.person_id === personId);
  }

  getAssignmentsForFamily(familyId) {
    if (!familyId) return [];
    return this.getAssignments().filter(a => a.familyId === familyId || a.family_id === familyId);
  }

  getAssignmentsForProgramme(programmeId) {
    if (!programmeId) return [];
    return this.getAssignments().filter(a => a.programmeId === programmeId || a.programme_id === programmeId);
  }

  recordEligibility({
    programmeId,
    programmeName,
    targetType,
    personId = null,
    personName = '',
    familyId,
    eligibilityStatus = 'Eligible',
    verificationStatus = 'Under Review',
    notes = '',
    documentTitle = 'Attached Verification Proof',
    recordedBy = 'ASHA Worker'
  }) {
    const assignments = this.getAssignments();
    
    // Check if an existing assignment exists for this programme + beneficiary
    const existingIndex = assignments.findIndex(a => {
      if (a.programme_id !== programmeId) return false;
      if (targetType === 'individual') {
        return a.person_id === personId;
      } else {
        return a.family_id === familyId && a.target_type === 'family';
      }
    });

    const today = new Date().toISOString().split('T')[0];
    const prog = this.getProgrammeById(programmeId);
    const followUpDays = (prog && prog.follow_up_days) || 30;
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + followUpDays);
    const nextFollowUpStr = nextDate.toISOString().split('T')[0];

    const newRecord = {
      assignment_id: `ASN-${Date.now().toString().slice(-6)}`,
      programme_id: programmeId,
      programme_name: programmeName || (prog ? prog.name : programmeId),
      target_type: targetType,
      person_id: targetType === 'individual' ? personId : null,
      person_name: targetType === 'individual' ? personName : `Family ${familyId}`,
      family_id: familyId,
      eligibility_status: eligibilityStatus,
      verification_status: verificationStatus,
      registered_date: today,
      last_follow_up: today,
      next_follow_up: nextFollowUpStr,
      follow_up_status: verificationStatus === 'Verified' ? 'Active' : 'Upcoming',
      notes: notes,
      document_title: documentTitle,
      recorded_by: recordedBy
    };

    if (existingIndex >= 0) {
      assignments[existingIndex] = { ...assignments[existingIndex], ...newRecord, assignment_id: assignments[existingIndex].assignment_id };
    } else {
      assignments.unshift(newRecord);
    }

    this.saveAssignments(assignments);
    return newRecord;
  }

  getReports() {
    const raw = localStorage.getItem(STORAGE_REPORTS_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  saveReports(reports) {
    localStorage.setItem(STORAGE_REPORTS_KEY, JSON.stringify(reports));
  }

  addProgrammeReport(report) {
    const reports = this.getReports();
    const newReport = {
      report_id: `REP-PR-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString().split('T')[0],
      status: 'Reported',
      ...report
    };
    reports.unshift(newReport);
    this.saveReports(reports);
    return newReport;
  }

  getProgrammeDashboardMetrics() {
    const programmes = this.getAllProgrammes();
    const assignments = this.getAssignments();
    const reports = this.getReports();

    const uniquePeople = new Set(assignments.filter(a => a.person_id).map(a => a.person_id));
    const uniqueFamilies = new Set(assignments.filter(a => a.family_id).map(a => a.family_id));

    const pendingEligibility = assignments.filter(a => a.eligibility_status === 'Under Review').length;
    const pendingVerification = assignments.filter(a => a.verification_status === 'Under Review' || a.verification_status === 'Reported').length;
    
    // Follow-up evaluation against fixed reference date
    const refDate = new Date('2026-09-19');
    let followUpsDue = 0;
    let overdue = 0;

    assignments.forEach(a => {
      if (a.next_follow_up) {
        const nextD = new Date(a.next_follow_up);
        const diffDays = Math.ceil((nextD - refDate) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) {
          overdue++;
        } else if (diffDays <= 7) {
          followUpsDue++;
        }
      }
    });

    return {
      totalProgrammes: programmes.length,
      activeProgrammes: programmes.filter(p => p.active !== false).length,
      peopleAssigned: uniquePeople.size,
      familiesAssigned: uniqueFamilies.size,
      pendingEligibility,
      pendingVerification,
      followUpsDue,
      overdue,
      totalReports: reports.length
    };
  }

  adminSaveProgramme(programme) {
    const raw = localStorage.getItem(STORAGE_CATALOG_KEY);
    const programmes = raw ? JSON.parse(raw) : INITIAL_PROGRAMMES;
    const idx = programmes.findIndex(p => p.programme_id === programme.programme_id);
    if (idx >= 0) {
      programmes[idx] = { ...programmes[idx], ...programme };
    } else {
      programmes.push(programme);
    }
    localStorage.setItem(STORAGE_CATALOG_KEY, JSON.stringify(programmes));
    return programme;
  }

  adminToggleProgramme(programmeId, active) {
    const raw = localStorage.getItem(STORAGE_CATALOG_KEY);
    const programmes = raw ? JSON.parse(raw) : INITIAL_PROGRAMMES;
    const item = programmes.find(p => p.programme_id === programmeId);
    if (item) {
      item.active = active;
      localStorage.setItem(STORAGE_CATALOG_KEY, JSON.stringify(programmes));
    }
  }

  getStats() {
    const progs = this.getAllProgrammes();
    const assignments = this.getAssignments();
    const verified = assignments.filter(a => a.verificationStatus === 'Verified' || a.verification_status === 'Active').length;
    const pending = assignments.filter(a => a.verificationStatus === 'Under Review' || a.verificationStatus === 'Reported').length;
    const activeFUs = assignments.filter(a => a.follow_up_status === 'Active' || a.follow_up_status === 'Upcoming').length;

    return {
      totalProgrammes: progs.length,
      totalCategories: 9,
      totalAssignments: assignments.length,
      verifiedAssignments: verified,
      pendingReview: pending,
      activeFollowUps: activeFUs || 4
    };
  }

  getAllReports() {
    return this.getReports();
  }

  getReportsForProgramme(progId) {
    return this.getReports().filter(r => r.programme_id === progId || r.programmeId === progId);
  }

  getFollowUps() {
    const assignments = this.getAssignments();
    return assignments.map(a => ({
      programmeId: a.programmeId,
      programmeName: a.programmeName,
      beneficiaryName: a.personName || `Family ${a.familyId}`,
      interval: `Every 30 days`,
      nextScheduledDate: a.nextScheduledDate || '2026-10-15',
      actionRequired: a.notes || 'Routine follow-up visit'
    }));
  }

  assignBeneficiary({
    programmeId,
    programmeName,
    targetType,
    targetId,
    targetName,
    familyId,
    verificationStatus = 'Reported',
    notes = '',
    docRef = ''
  }) {
    return this.recordEligibility({
      programmeId,
      programmeName,
      targetType,
      personId: targetType === 'individual' ? targetId : null,
      personName: targetType === 'individual' ? targetName : '',
      familyId,
      eligibilityStatus: 'Eligible',
      verificationStatus,
      notes,
      documentTitle: docRef || 'Frontline Proof',
      recordedBy: 'ASHA Worker'
    });
  }

  addReport(reportData) {
    return this.addProgrammeReport({
      programme_id: reportData.programmeId,
      family_id: reportData.familyId,
      person_id: reportData.targetType === 'individual' ? reportData.targetId : null,
      person_name: reportData.targetName,
      report_type: reportData.reportType,
      title: reportData.title,
      details: reportData.details,
      date: reportData.date,
      reportedBy: reportData.reportedBy
    });
  }

  upsertProgramme(data) {
    return this.adminSaveProgramme({
      programme_id: data.id,
      abbreviation: data.abbr,
      name: data.name,
      category: data.category,
      description: data.description,
      eligibility_criteria: [data.eligibilityCriteria],
      benefits: [data.benefits],
      followupFrequency: data.followupFrequency,
      active: true
    });
  }
}

export const programmeManager = new ProgrammeManager();
