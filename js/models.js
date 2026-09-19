/**
 * ASHA Copilot 2.0 - Models & Data Structures
 * Problem Statement PS-H02: "One Worker, Five Systems"
 * SYNTHETIC DEMO HEALTH DATA ONLY - No Real Patient Data Collected
 */

// System User Roles & Access Control (RBAC)
export const SYSTEM_ROLES = {
  ASHA: {
    id: 'ASHA',
    title: 'ASHA Worker (Field Level)',
    defaultUser: 'Lata Devi (ASHA-TS-042)',
    subCentre: 'Rampur Sub-Centre',
    canCreate: true,
    canEditOwn: true,
    canVerify: false,
    canViewAggregates: false,
    badgeColor: '#0D9488'
  },
  ANM: {
    id: 'ANM',
    title: 'ANM Supervisor (Clinical Review)',
    defaultUser: 'Sarojini Rao (ANM-SUB-04)',
    subCentre: 'Rampur Sub-Centre Cluster',
    canCreate: false,
    canEditOwn: true,
    canVerify: true,
    canViewAggregates: true,
    badgeColor: '#4F46E5'
  },
  ADMIN: {
    id: 'ADMIN',
    title: 'Medical Officer / Programme Admin',
    defaultUser: 'Dr. K. V. Sharma (MO-PHC-02)',
    subCentre: 'Primary Health Centre HQ',
    canCreate: false,
    canEditOwn: false,
    canVerify: true,
    canViewAggregates: true,
    badgeColor: '#0284C7'
  }
};

// Standard Vaccines Catalog for Child Immunisation
export const VACCINES_CATALOG = [
  { id: 'BCG', name: 'BCG', targetAge: 'At birth', disease: 'Tuberculosis' },
  { id: 'OPV-0', name: 'OPV-0', targetAge: 'At birth', disease: 'Polio' },
  { id: 'OPV-1', name: 'OPV-1', targetAge: '6 weeks', disease: 'Polio' },
  { id: 'OPV-2', name: 'OPV-2', targetAge: '10 weeks', disease: 'Polio' },
  { id: 'OPV-3', name: 'OPV-3', targetAge: '14 weeks', disease: 'Polio' },
  { id: 'Pentavalent-1', name: 'Pentavalent-1', targetAge: '6 weeks', disease: 'DPT, Hep B, Hib' },
  { id: 'Pentavalent-2', name: 'Pentavalent-2', targetAge: '10 weeks', disease: 'DPT, Hep B, Hib' },
  { id: 'Pentavalent-3', name: 'Pentavalent-3', targetAge: '14 weeks', disease: 'DPT, Hep B, Hib' },
  { id: 'Rotavirus-1', name: 'Rotavirus-1', targetAge: '6 weeks', disease: 'Diarrhea' },
  { id: 'Measles-Rubella-1', name: 'MR-1', targetAge: '9-12 months', disease: 'Measles & Rubella' },
  { id: 'Vitamin-A-1', name: 'Vitamin A (Dose 1)', targetAge: '9 months', disease: 'Deficiency / Immunity' },
  { id: 'DPT-Booster', name: 'DPT Booster', targetAge: '16-24 months', disease: 'Diphtheria, Pertussis, Tetanus' }
];

// Common Symptoms Checklist
export const SYMPTOMS_CATALOG = [
  'Vomiting / Morning Sickness',
  'Cough',
  'Fever',
  'Severe Headache',
  'Swelling of hands/feet',
  'Fatigue / Pallor',
  'Loose Stool / Diarrhea',
  'None'
];

/**
 * Creates a normalized Common Data Model (CDM) object
 */
export function createCommonRecord({
  householdId = 'H001',
  personId = '',
  personName = '',
  age = null,
  gender = 'Female',
  phoneNumber = '9848012345 (Synthetic)',
  address = 'House #4-12, Main Street, Village Rampur',
  householdMembers = 4,
  elderlyMembers = 1,
  isPregnant = false,
  gestationalAgeWeeks = null,
  previousPregnancies = 0,
  childName = '',
  childAge = null,
  childrenCount = 0,
  vaccinations = [],
  symptoms = [],
  vitals = { bp: '120/80', temperature: 98.4, spo2: 98 },
  followUpRequired = false,
  followUpDate = null,
  notes = '',
  source = 'FORM', // 'FORM' | 'VOICE' | 'LIVE'
  verificationStatus = 'CONFIRMED',
  syncStatus = 'SYNCED',
  createdBy = 'Lata Devi (ASHA-TS-042)',
  timestamp = new Date().toISOString()
}) {
  const encId = `ENC-${Date.now().toString().slice(-6)}`;
  const pId = personId || `P-${(personName || 'BEN').slice(0, 3).toUpperCase()}-${Math.floor(Math.random() * 899 + 100)}`;

  let edd = null;
  if (isPregnant && gestationalAgeWeeks) {
    const remainingWeeks = Math.max(0, 40 - Number(gestationalAgeWeeks));
    const eddDate = new Date(timestamp);
    eddDate.setDate(eddDate.getDate() + (remainingWeeks * 7));
    edd = eddDate.toISOString().split('T')[0];
  }

  // Calculate pending vaccines
  const pendingVaccines = [];
  const recVaccines = Array.isArray(vaccinations) ? vaccinations : [];
  ['BCG', 'OPV-0', 'OPV-1', 'Pentavalent-1', 'Rotavirus-1', 'Measles-Rubella-1'].forEach(v => {
    if (!recVaccines.includes(v)) pendingVaccines.push(v);
  });

  return {
    encounter_id: encId,
    household_id: householdId.trim().toUpperCase(),
    person_id: pId,
    timestamp: timestamp,
    data_mode: 'SYNTHETIC',
    source: source,
    verification_status: verificationStatus,
    sync_status: syncStatus,
    created_by: createdBy,
    last_modified: timestamp,
    
    person: {
      id: pId,
      name: personName.trim(),
      age: Number(age) || 0,
      gender: gender,
      phone: phoneNumber,
      address: address
    },

    household: {
      id: householdId.trim().toUpperCase(),
      total_members: Number(householdMembers) || 4,
      children_count: Math.max(0, Number(childrenCount) || 0),
      elderly_count: Number(elderlyMembers) || 0,
      pregnant_count: isPregnant ? 1 : 0
    },

    maternal: {
      is_pregnant: Boolean(isPregnant),
      gestational_age_weeks: isPregnant ? (Number(gestationalAgeWeeks) || 0) : null,
      trimester: isPregnant ? calculateTrimester(gestationalAgeWeeks) : null,
      expected_delivery_date: edd,
      previous_pregnancies_gravida: Number(previousPregnancies) || (isPregnant ? 1 : 0),
      ifa_tablets_eligible: isPregnant && (Number(gestationalAgeWeeks) >= 12),
      high_risk_flag: symptoms.some(s => ['Severe Headache', 'Swelling of hands/feet', 'Fever'].includes(s))
    },

    children: {
      child_name: childName || (childrenCount > 0 ? `${personName}'s Child` : 'N/A'),
      child_age: childAge || (childrenCount > 0 ? '1.5 years' : 'N/A'),
      count: Math.max(0, Number(childrenCount) || 0),
      recorded_vaccines: recVaccines,
      pending_vaccines: childrenCount > 0 ? pendingVaccines : []
    },

    observations: {
      reported_symptoms: Array.isArray(symptoms) ? symptoms.filter(s => s !== 'None') : [],
      vitals: {
        bp: vitals.bp || '120/80',
        temperature: Number(vitals.temperature) || 98.4,
        spo2: Number(vitals.spo2) || 98
      },
      has_acute_danger_signs: symptoms.some(s => ['Severe Headache', 'Swelling of hands/feet', 'Fever'].includes(s))
    },

    encounter_meta: {
      follow_up_required: Boolean(followUpRequired),
      follow_up_date: followUpDate || (followUpRequired ? getNextWeekDate() : null),
      notes: notes.trim(),
      consent_recorded: true,
      schema_version: 'CDM-v2.0-synthetic'
    }
  };
}

export function calculateTrimester(weeks) {
  const w = Number(weeks);
  if (!w || w <= 0) return null;
  if (w <= 12) return 1;
  if (w <= 27) return 2;
  return 3;
}

export function getNextWeekDate() {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().split('T')[0];
}

// Multilingual Synthetic Demo Presets (English, Telugu, Hindi)
export const DEMO_HOUSEHOLDS = [
  {
    id: 'demo-sita',
    lang: 'en-IN',
    title: 'Sita (24y, 20 wks pregnant, 1 child)',
    badge: 'English Maternal Demo',
    description: 'Classic maternal & child immunisation visit with BCG and OPV administered.',
    speechTranscript: 'Sita is 24 years old and five months pregnant. She has one child. The child has received BCG and OPV vaccines. There are no current symptoms.',
    formData: {
      householdId: 'H001',
      personName: 'Sita',
      age: 24,
      gender: 'Female',
      isPregnant: true,
      gestationalAgeWeeks: 20,
      previousPregnancies: 1,
      childrenCount: 1,
      childName: 'Aarav',
      vaccinations: ['BCG', 'OPV-0', 'OPV-1'],
      symptoms: ['None'],
      vitals: { bp: '118/76', temperature: 98.4, spo2: 99 },
      followUpRequired: false,
      notes: 'Second ANC checkup completed. Mother reports good fetal movements.'
    }
  },
  {
    id: 'demo-sindhu',
    lang: 'en-IN',
    title: 'Sindhu (22y, 14 wks, morning sickness & cough)',
    badge: 'From User Voice Note',
    description: 'Directly reproduces user voice sample: "sinduism 22 years old and 14 weeks pregnant..."',
    speechTranscript: 'sinduism 22 years old and 14 weeks pregnant. Previous pregnancy 1. Experiencing morning sickness and cough.',
    formData: {
      householdId: 'H003',
      personName: 'Sindhu',
      age: 22,
      gender: 'Female',
      isPregnant: true,
      gestationalAgeWeeks: 14,
      previousPregnancies: 1,
      childrenCount: 0,
      childName: '',
      vaccinations: [],
      symptoms: ['Vomiting / Morning Sickness', 'Cough'],
      vitals: { bp: '114/72', temperature: 98.6, spo2: 98 },
      followUpRequired: true,
      notes: 'IFA tablets advised after nausea subsides. Warm fluids for cough.'
    }
  },
  {
    id: 'demo-telugu-radha',
    lang: 'te-IN',
    title: 'రాధా దేవి (29 సం॥, ఇద్దరు పిల్లలు, టీకాలు)',
    badge: 'తెలుగు / Telugu Voice Demo',
    description: 'పూర్తి తెలుగు వాయిస్ ఎన్‌కౌంటర్ (Full Telugu voice sample).',
    speechTranscript: 'రాధా దేవి వయస్సు 29 సంవత్సరాలు, గర్భవతి కాదు. ఇద్దరు పిల్లలు ఉన్నారు. చిన్న పాపకు పెంటావాలెంట్ మరియు రోటావైరస్ టీకాలు వేయించాము. కొద్దిగా దగ్గు ఉంది, వచ్చే మంగళవారం మళ్లీ చూడాలి.',
    formData: {
      householdId: 'H042',
      personName: 'Radha Devi',
      age: 29,
      gender: 'Female',
      isPregnant: false,
      gestationalAgeWeeks: null,
      previousPregnancies: 2,
      childrenCount: 2,
      childName: 'Rohan',
      vaccinations: ['BCG', 'OPV-0', 'OPV-1', 'Pentavalent-1', 'Rotavirus-1'],
      symptoms: ['Cough'],
      vitals: { bp: '120/80', temperature: 98.8, spo2: 97 },
      followUpRequired: true,
      notes: 'చిన్నారికి దగ్గు పరిశీలన. వచ్చే వారం ఫాలోఅప్ చేయాలి.'
    }
  },
  {
    id: 'demo-hindi-pooja',
    lang: 'hi-IN',
    title: 'पूजा (21 वर्ष, 14 सप्ताह की गर्भवती, पहली गर्भावस्था)',
    badge: 'हिंदी / Hindi Voice Demo',
    description: 'हिंदी वॉयस इनपुट — प्रारंभिक प्रसव पूर्व जांच और पोषण (Hindi voice sample).',
    speechTranscript: 'पूजा की उम्र 21 साल है, चौदह हफ़्ते की गर्भवती है। पहली गर्भावस्था है, कोई पिछला बच्चा नहीं है। सुबह उल्टी और कमजोरी की शिकायत है, फॉलो अप आवश्यक है।',
    formData: {
      householdId: 'H108',
      personName: 'Pooja',
      age: 21,
      gender: 'Female',
      isPregnant: true,
      gestationalAgeWeeks: 14,
      previousPregnancies: 0,
      childrenCount: 0,
      childName: '',
      vaccinations: [],
      symptoms: ['Vomiting / Morning Sickness', 'Fatigue / Pallor'],
      vitals: { bp: '110/70', temperature: 98.4, spo2: 99 },
      followUpRequired: true,
      notes: 'आईएफए गोलियां वितरित की गईं। पोषण परामर्श दिया गया।'
    }
  },
  {
    id: 'demo-tamil-anitha',
    lang: 'ta-IN',
    title: 'அனிதா (25 வயது, 16 வார கர்ப்பிணி, 1 குழந்தை)',
    badge: 'தமிழ் / Tamil Voice Demo',
    description: 'தமிழ் குரல் உள்ளீடு — மகப்பேறு மற்றும் தடுப்பூசி பரிசோதனை (Tamil voice sample).',
    speechTranscript: 'அனிதா வயது 25 ஆண்டுகள், 16 வார கர்ப்பிணி. ஒரு குழந்தை உள்ளது. குழந்தைக்கு பிசிஜி மற்றும் ஓபிவி தடுப்பூசி போடப்பட்டுள்ளது. லேசான தலைவலி உள்ளது, அடுத்த மாதம் பரிசோதனை.',
    formData: {
      householdId: 'H055',
      personName: 'Anitha',
      age: 25,
      gender: 'Female',
      isPregnant: true,
      gestationalAgeWeeks: 16,
      previousPregnancies: 1,
      childrenCount: 1,
      childName: 'Kavya',
      vaccinations: ['BCG', 'OPV-0', 'OPV-1'],
      symptoms: ['Severe Headache'],
      vitals: { bp: '118/76', temperature: 98.4, spo2: 98 },
      followUpRequired: true,
      notes: 'இரண்டாவது கர்ப்ப பரிசோதனை. இரத்த அழுத்தம் சீராக உள்ளது.'
    }
  }
];

// Initial Household Timeline seeds with householdId and personName
export const SEED_TIMELINE_H001 = [
  {
    id: 'TL-01',
    householdId: 'H001',
    personName: 'Sita',
    date: '2026-08-15',
    title: 'Initial Village Survey & ANC Registration',
    author: 'Lata Devi (ASHA)',
    role: 'ASHA',
    summary: 'Beneficiary Sita registered under H001. Confirmed first trimester pregnancy (15 weeks). IFA initiated.',
    badge: 'Maternal Registration'
  },
  {
    id: 'TL-02',
    householdId: 'H001',
    personName: 'Sita',
    date: '2026-09-02',
    title: 'ANC 2nd Trimester & Child Immunisation Check',
    author: 'Lata Devi (ASHA)',
    role: 'ASHA',
    summary: 'Gestational age 18 weeks. Eldest child received booster verification. Vitals BP 118/76.',
    badge: 'ANC Visit #2'
  },
  {
    id: 'TL-03',
    householdId: 'H001',
    personName: 'Sita',
    date: '2026-09-18',
    title: 'Encounter Confirmed & 3 Programme Registers Updated',
    author: 'Lata Devi (ASHA)',
    role: 'ASHA',
    summary: 'Gestation 20 weeks. BCG & OPV verified. Mapped to Maternal, UIP, and Household Registers.',
    badge: 'Multi-System Sync'
  },
  {
    id: 'TL-04',
    householdId: 'H019',
    personName: 'Meena Sharma',
    date: '2026-09-17',
    title: 'Routine 3rd Trimester Home Visit',
    author: 'Lata Devi (ASHA)',
    role: 'ASHA',
    summary: 'Gestation 28 weeks. Blood pressure 122/80 normal. Advised on institutional delivery preparation.',
    badge: 'ANC 3rd Trimester'
  }
];
