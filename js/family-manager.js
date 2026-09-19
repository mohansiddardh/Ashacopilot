/**
 * ASHA Copilot 2.0+ - Family Report & ASHA Workload Manager
 * Problem Statement PS-H02: "One Worker, Five Systems"
 * 
 * Features:
 * - Household / Family Records (Family ID, Head, House Number, Address, Assigned ASHA)
 * - Dynamic Member Census (Total, Female, Male, Children, Elderly)
 * - Schemes & Benefits Eligibility (Family-wide vs Individual beneficiary)
 * - Essential Health Supplies (ORS, IFA, Zinc, etc.)
 * - Documented Medicines Provided (Provider/ASHA, quantity, recipient)
 * - Life Events: Birth reporting, Death reporting (safe non-deletion), Health Events (non-diagnostic), Programme reporting
 * - Family Event Timeline
 * - ASHA Workload Targets: Allocated, Completed, Remaining, Progress % (Configurable by Supervisor)
 * - Household Completion Status: Not Started, In Progress, Completed, Follow-up Required, Pending Verification
 */

import { userManager } from './user-manager.js';
import { diagnosticManager } from './diagnostic-profile.js';

const STORAGE_FAMILIES_KEY = 'asha_db_families_v2';
const STORAGE_TARGETS_KEY = 'asha_db_asha_targets_v2';

export const DEFAULT_FAMILIES = [
  {
    familyId: 'F042',
    houseNumber: 'H-042',
    familyHead: 'Harsh Kumar',
    address: 'House #42, Sector 4B, Rampur Village',
    assignedAsha: 'ASHA001',
    assignedAshaName: 'Sita Rao',
    status: 'COMPLETED',
    lastVisit: '2026-09-18',
    nextScheduledVisit: '2026-10-02',
    members: [
      {
        personId: 'P-SIT-101',
        name: 'Sita Devi',
        gender: 'Female',
        age: 24,
        role: 'Daughter-in-law',
        pregnancyStatus: 'Pregnant (20 Weeks Gestation)',
        status: 'Pregnant — Follow-up Up to Date',
        isPregnant: true,
        phone: '9848012345 (Synthetic)'
      },
      {
        personId: 'P-HAR-102',
        name: 'Harsh Kumar',
        gender: 'Male',
        age: 42,
        role: 'Family Head',
        pregnancyStatus: 'Non-pregnant',
        status: 'Active',
        isPregnant: false,
        phone: '9848012346 (Synthetic)'
      },
      {
        personId: 'P-LAK-103',
        name: 'Lakshmi Devi',
        gender: 'Female',
        age: 61,
        role: 'Mother',
        pregnancyStatus: 'Non-pregnant',
        status: 'Chronic BP Follow-up',
        isPregnant: false,
        phone: '9848012347 (Synthetic)'
      },
      {
        personId: 'P-RAV-104',
        name: 'Ravi Kumar',
        gender: 'Male',
        age: 17,
        role: 'Brother',
        pregnancyStatus: 'Non-pregnant',
        status: 'Adolescent Health Checked',
        isPregnant: false,
        phone: '9848012348 (Synthetic)'
      },
      {
        personId: 'P-ANU-105',
        name: 'Anu',
        gender: 'Female',
        age: 5,
        role: 'Daughter',
        pregnancyStatus: 'Non-pregnant',
        status: 'Immunisation Up-to-date',
        isPregnant: false,
        phone: 'N/A'
      },
      {
        personId: 'P-AAR-106',
        name: 'Aarav',
        gender: 'Male',
        age: 1,
        role: 'Son',
        pregnancyStatus: 'Non-pregnant',
        status: 'Birth Doses (BCG, OPV-0) Completed',
        isPregnant: false,
        phone: 'N/A'
      }
    ],
    schemes: [
      {
        id: 'SCH-01',
        name: 'Pradhan Mantri Matru Vandana Yojana (PMMVY)',
        eligibility: 'Eligible',
        eligibleFor: 'Individual',
        beneficiaryId: 'P-SIT-101',
        beneficiaryName: 'Sita Devi',
        status: 'Approved',
        date: '2026-08-15',
        notes: 'First installment of INR 3,000 processed after second ANC check-up.'
      },
      {
        id: 'SCH-02',
        name: 'Ayushman Bharat PM-JAY (Golden Health Card)',
        eligibility: 'Eligible',
        eligibleFor: 'Family',
        beneficiaryId: null,
        beneficiaryName: 'Family F042',
        status: 'Provided',
        date: '2026-07-10',
        notes: 'Family e-card issued with INR 5 Lakh annual secondary/tertiary coverage.'
      },
      {
        id: 'SCH-03',
        name: 'POSHAN Abhiyaan (National Nutrition Mission)',
        eligibility: 'Eligible',
        eligibleFor: 'Individual',
        beneficiaryId: 'P-SIT-101',
        beneficiaryName: 'Sita Devi',
        status: 'Applied',
        date: '2026-09-05',
        notes: 'Nutritional supplementary ration allocated through local Anganwadi Centre.'
      }
    ],
    essentialHealthSupplies: [
      {
        id: 'SUP-01',
        name: 'Oral Rehydration Salts (ORS) Sachets',
        quantity: 5,
        providedTo: 'Family',
        beneficiaryId: null,
        beneficiaryName: 'Family F042',
        date: '2026-09-18',
        providedBy: 'Sita Rao (ASHA001)',
        notes: 'Monsoon diarrheal surveillance & preventive buffer stock.'
      },
      {
        id: 'SUP-02',
        name: 'Iron & Folic Acid (IFA) Tablets',
        quantity: 30,
        providedTo: 'Individual',
        beneficiaryId: 'P-SIT-101',
        beneficiaryName: 'Sita Devi',
        date: '2026-09-18',
        providedBy: 'Sita Rao (ASHA001)',
        notes: 'Daily prenatal anemia prevention (Trimester 2 regimen).'
      },
      {
        id: 'SUP-03',
        name: 'Zinc Sulfate Dispensable Tablets (20mg)',
        quantity: 14,
        providedTo: 'Individual',
        beneficiaryId: 'P-ANU-105',
        beneficiaryName: 'Anu',
        date: '2026-09-10',
        providedBy: 'Sita Rao (ASHA001)',
        notes: 'Childhood immunity and diarrheal adjunct therapy.'
      },
      {
        id: 'SUP-04',
        name: 'Sanitary Napkin Pack (Suvidha / Menstrual Hygiene)',
        quantity: 2,
        providedTo: 'Individual',
        beneficiaryId: 'P-SIT-101',
        beneficiaryName: 'Sita Devi',
        date: '2026-09-02',
        providedBy: 'Sita Rao (ASHA001)',
        notes: 'Subsidized community health scheme distribution.'
      },
      {
        id: 'SUP-05',
        name: 'Chlorine Water Purification Tablets',
        quantity: 20,
        providedTo: 'Family',
        beneficiaryId: null,
        beneficiaryName: 'Family F042',
        date: '2026-08-25',
        providedBy: 'Sita Rao (ASHA001)',
        notes: 'Drinking water pot disinfection for village sector 4.'
      }
    ],
    medicinesProvided: [
      {
        id: 'MED-01',
        name: 'Paracetamol Tablets IP (500mg)',
        quantity: 10,
        recipient: 'Harsh Kumar',
        personId: 'P-HAR-102',
        date: '2026-09-14',
        provider: 'ASHA001 - Sita Rao',
        notes: 'Symptomatic relief for mild seasonal body ache. Documented per standing protocol.'
      },
      {
        id: 'MED-02',
        name: 'Calcium & Vitamin D3 Tablets (500mg/250IU)',
        quantity: 30,
        recipient: 'Sita Devi',
        personId: 'P-SIT-101',
        date: '2026-09-05',
        provider: 'ANM001 - Sarojini Rao',
        notes: 'Antenatal bone and fetal skeletal health supplementation.'
      },
      {
        id: 'MED-03',
        name: 'Albendazole Chewable Tablet (400mg)',
        quantity: 2,
        recipient: 'Anu & Ravi Kumar',
        personId: 'P-ANU-105',
        date: '2026-08-10',
        provider: 'ASHA001 - Sita Rao',
        notes: 'National Deworming Day biannual prophylactic dose administered.'
      },
      {
        id: 'MED-04',
        name: 'Oral Rehydration Solution (WHO Formula)',
        quantity: 4,
        recipient: 'Family F042',
        personId: null,
        date: '2026-09-18',
        provider: 'ASHA001 - Sita Rao',
        notes: 'Emergency rehydration pack placed in household first-aid kit.'
      }
    ],
    events: [
      {
        id: 'EVT-01',
        type: 'BIRTH',
        title: 'Birth Recorded: Baby Aarav',
        date: '2025-09-02',
        actor: 'Sarojini Rao (ANM)',
        description: 'Institutional delivery at Community Health Centre Rampur. Male child, 2.9 kg birth weight. Zero doses BCG, OPV-0, Hep-B administered.',
        verified: true,
        documentTitle: 'Birth_Certificate_Aarav.pdf'
      },
      {
        id: 'EVT-02',
        type: 'HEALTH_EVENT',
        title: 'Reported health event: Mild seasonal conjunctivitis cluster',
        date: '2026-09-12',
        actor: 'Sita Rao (ASHA001)',
        description: 'Reported 2 individuals experiencing mild eye irritation and watering in sector 4. Clean water washing advised. Non-outbreak observation; under PHC surveillance.',
        verified: false,
        documentTitle: null
      },
      {
        id: 'EVT-03',
        type: 'PROGRAMME',
        title: 'Programme Activity: Village Health, Sanitation & Nutrition Day (VHSND)',
        date: '2026-09-15',
        actor: 'Sita Rao (ASHA001)',
        description: 'Family attended VHSND session at Anganwadi-4. Sita Devi ANC weight documented; Anu received growth monitoring; IFA stock distributed.',
        verified: true,
        documentTitle: 'VHSND_Register_Sep2026.pdf'
      },
      {
        id: 'EVT-04',
        type: 'VISIT',
        title: 'Routine Household Health Encounter Completed',
        date: '2026-09-18',
        actor: 'Sita Rao (ASHA001)',
        description: 'Frontline visit completed. Vitals checked for Sita Devi (BP 120/80). Health supplies and ORS distributed.',
        verified: true,
        documentTitle: null
      }
    ]
  },
  {
    familyId: 'F043',
    houseNumber: 'H-043',
    familyHead: 'Ravi Kumar',
    address: 'House #43, Sector 2, Rampur Village',
    assignedAsha: 'ASHA001',
    assignedAshaName: 'Sita Rao',
    status: 'FOLLOW_UP_REQUIRED',
    lastVisit: '2026-08-10',
    nextScheduledVisit: '2026-09-07', // Overdue relative to 2026-09-18!
    members: [
      {
        personId: 'P-MEE-119',
        name: 'Meena Sharma',
        gender: 'Female',
        age: 26,
        role: 'Daughter-in-law',
        pregnancyStatus: 'Pregnant (28 Weeks Gestation)',
        status: '🔴 ANC Follow-up Overdue',
        isPregnant: true,
        phone: '9848022333 (Synthetic)'
      },
      {
        personId: 'P-RAV-201',
        name: 'Ravi Kumar',
        gender: 'Male',
        age: 48,
        role: 'Family Head',
        pregnancyStatus: 'Non-pregnant',
        status: 'Active',
        isPregnant: false,
        phone: '9848022334 (Synthetic)'
      },
      {
        personId: 'P-SUN-202',
        name: 'Sunita Sharma',
        gender: 'Female',
        age: 22,
        role: 'Daughter',
        pregnancyStatus: 'Non-pregnant',
        status: 'Active',
        isPregnant: false,
        phone: '9848022335 (Synthetic)'
      },
      {
        personId: 'P-KAR-203',
        name: 'Karan Kumar',
        gender: 'Male',
        age: 8,
        role: 'Son',
        pregnancyStatus: 'Non-pregnant',
        status: 'School Health Screened',
        isPregnant: false,
        phone: 'N/A'
      }
    ],
    schemes: [
      {
        id: 'SCH-04',
        name: 'Pradhan Mantri Surakshit Matritva Abhiyan (PMSMA)',
        eligibility: 'Eligible',
        eligibleFor: 'Individual',
        beneficiaryId: 'P-MEE-119',
        beneficiaryName: 'Meena Sharma',
        status: 'Pending',
        date: '2026-08-01',
        notes: 'Specialist obstetric examination scheduled on 9th of every month.'
      },
      {
        id: 'SCH-05',
        name: 'Ayushman Bharat PM-JAY',
        eligibility: 'Eligible',
        eligibleFor: 'Family',
        beneficiaryId: null,
        beneficiaryName: 'Family F043',
        status: 'Provided',
        date: '2026-06-20',
        notes: 'Family health coverage active.'
      }
    ],
    essentialHealthSupplies: [
      {
        id: 'SUP-06',
        name: 'IFA High-Dose Prenatal Tablets',
        quantity: 30,
        providedTo: 'Individual',
        beneficiaryId: 'P-MEE-119',
        beneficiaryName: 'Meena Sharma',
        date: '2026-08-10',
        providedBy: 'Sita Rao (ASHA001)',
        notes: 'Prescribed daily regimen for 3rd trimester surveillance.'
      },
      {
        id: 'SUP-07',
        name: 'ORS Packets',
        quantity: 3,
        providedTo: 'Family',
        beneficiaryId: null,
        beneficiaryName: 'Family F043',
        date: '2026-08-10',
        providedBy: 'Sita Rao (ASHA001)',
        notes: 'Standard household rehydration packet.'
      }
    ],
    medicinesProvided: [
      {
        id: 'MED-05',
        name: 'Folic Acid 5mg Tablets',
        quantity: 30,
        recipient: 'Meena Sharma',
        personId: 'P-MEE-119',
        date: '2026-08-10',
        provider: 'ASHA001 - Sita Rao',
        notes: 'Prenatal neural tube and blood count support.'
      }
    ],
    events: [
      {
        id: 'EVT-05',
        type: 'ALERT',
        title: '⚠️ Safety Flag: Scheduled Revisit Overdue (7 Sep 2026)',
        date: '2026-09-07',
        actor: 'ASHA Copilot Surveillance',
        description: 'Third trimester antenatal visit date elapsed without documented contact. Frontline outreach prioritised.',
        verified: false,
        documentTitle: null
      }
    ]
  },
  {
    familyId: 'F044',
    houseNumber: 'H-044',
    familyHead: 'Lakshmi Devi',
    address: 'House #44, Ganesh Nagar Ward 3',
    assignedAsha: 'ASHA002',
    assignedAshaName: 'Priya Kumar',
    status: 'IN_PROGRESS',
    lastVisit: '2026-09-10',
    nextScheduledVisit: '2026-09-24',
    members: [
      {
        personId: 'P-LAK-301',
        name: 'Lakshmi Devi',
        gender: 'Female',
        age: 58,
        role: 'Family Head',
        pregnancyStatus: 'Non-pregnant',
        status: 'Elderly Hypertension Monitored',
        isPregnant: false,
        phone: '9848033441 (Synthetic)'
      },
      {
        personId: 'P-RAJ-302',
        name: 'Rajesh Devi',
        gender: 'Male',
        age: 32,
        role: 'Son',
        pregnancyStatus: 'Non-pregnant',
        status: 'Active',
        isPregnant: false,
        phone: '9848033442 (Synthetic)'
      },
      {
        personId: 'P-REK-303',
        name: 'Rekha Devi',
        gender: 'Female',
        age: 29,
        role: 'Daughter-in-law',
        pregnancyStatus: 'Non-pregnant',
        status: 'Non-pregnant',
        isPregnant: false,
        phone: '9848033443 (Synthetic)'
      },
      {
        personId: 'P-PRI-304',
        name: 'Priya',
        gender: 'Female',
        age: 4,
        role: 'Granddaughter',
        pregnancyStatus: 'Non-pregnant',
        status: 'DPT Booster Due',
        isPregnant: false,
        phone: 'N/A'
      },
      {
        personId: 'P-ROH-305',
        name: 'Rohan',
        gender: 'Male',
        age: 2,
        role: 'Grandson',
        pregnancyStatus: 'Non-pregnant',
        status: 'MR Vaccine D-1 Given',
        isPregnant: false,
        phone: 'N/A'
      }
    ],
    schemes: [
      {
        id: 'SCH-06',
        name: 'Ayushman Bharat PM-JAY',
        eligibility: 'Eligible',
        eligibleFor: 'Family',
        beneficiaryId: null,
        beneficiaryName: 'Family F044',
        status: 'Provided',
        date: '2026-05-18',
        notes: 'Senior citizen health benefit verified.'
      }
    ],
    essentialHealthSupplies: [
      {
        id: 'SUP-08',
        name: 'Vitamin A Solution',
        quantity: 2,
        providedTo: 'Individual',
        beneficiaryId: 'P-ROH-305',
        beneficiaryName: 'Rohan',
        date: '2026-09-10',
        providedBy: 'Priya Kumar (ASHA002)',
        notes: 'Biannual Vitamin A prophylactic dose.'
      }
    ],
    medicinesProvided: [
      {
        id: 'MED-06',
        name: 'Amlodipine 5mg (BP Maintenance)',
        quantity: 30,
        recipient: 'Lakshmi Devi',
        personId: 'P-LAK-301',
        date: '2026-09-01',
        provider: 'Medical Officer Dr. K. V. Sharma',
        notes: 'Dispensed through Sub-Centre NCD refill protocol.'
      }
    ],
    events: [
      {
        id: 'EVT-06',
        type: 'VISIT',
        title: 'NCD & Child Immunisation Screening',
        date: '2026-09-10',
        actor: 'Priya Kumar (ASHA002)',
        description: 'Screened Lakshmi Devi BP (134/86). Priya scheduled for upcoming DPT booster camp.',
        verified: true,
        documentTitle: null
      }
    ]
  }
];

export const DEFAULT_ASHA_TARGETS = {
  ASHA001: {
    ashaUserId: 'ASHA001',
    ashaName: 'Sita Rao',
    allocatedHouseholds: 45,
    completedHouseholds: 32,
    subCentre: 'Rampur Sub-Centre North (Sector 4)',
    lastUpdated: '2026-09-18'
  },
  ASHA002: {
    ashaUserId: 'ASHA002',
    ashaName: 'Priya Kumar',
    allocatedHouseholds: 40,
    completedHouseholds: 28,
    subCentre: 'Rampur Sub-Centre South (Sector 2)',
    lastUpdated: '2026-09-18'
  },
  ASHA003: {
    ashaUserId: 'ASHA003',
    ashaName: 'Lakshmi Devi',
    allocatedHouseholds: 50,
    completedHouseholds: 36,
    subCentre: 'Ganesh Nagar Ward 3',
    lastUpdated: '2026-09-18'
  }
};

export class FamilyManager {
  constructor() {
    this.seedFamiliesIfEmpty();
    this.seedTargetsIfEmpty();
  }

  seedFamiliesIfEmpty() {
    try {
      const existing = localStorage.getItem(STORAGE_FAMILIES_KEY);
      if (!existing) {
        localStorage.setItem(STORAGE_FAMILIES_KEY, JSON.stringify(DEFAULT_FAMILIES));
      }
    } catch (e) {
      console.error('Error seeding families', e);
    }
  }

  seedTargetsIfEmpty() {
    try {
      const existing = localStorage.getItem(STORAGE_TARGETS_KEY);
      if (!existing) {
        localStorage.setItem(STORAGE_TARGETS_KEY, JSON.stringify(DEFAULT_ASHA_TARGETS));
      }
    } catch (e) {
      console.error('Error seeding targets', e);
    }
  }

  getAllFamilies() {
    try {
      const data = localStorage.getItem(STORAGE_FAMILIES_KEY);
      return data ? JSON.parse(data) : DEFAULT_FAMILIES;
    } catch (e) {
      console.error('Error reading families', e);
      return DEFAULT_FAMILIES;
    }
  }

  getFamilyById(familyId) {
    if (!familyId) return null;
    const all = this.getAllFamilies();
    return all.find(f => f.familyId.toUpperCase() === familyId.toUpperCase() || f.houseNumber.toUpperCase().includes(familyId.toUpperCase())) || null;
  }

  getFamilyByPersonId(personId) {
    if (!personId) return null;
    const all = this.getAllFamilies();
    return all.find(f => (f.members || []).some(m => m.personId === personId)) || null;
  }

  saveFamily(family) {
    const all = this.getAllFamilies();
    const idx = all.findIndex(f => f.familyId === family.familyId);
    if (idx >= 0) {
      all[idx] = family;
    } else {
      all.unshift(family);
    }
    localStorage.setItem(STORAGE_FAMILIES_KEY, JSON.stringify(all));
  }

  /**
   * Calculates dynamic statistics directly from family members
   */
  calculateFamilyStats(family) {
    const members = family.members || [];
    const total = members.length;
    const female = members.filter(m => (m.gender || '').toLowerCase() === 'female').length;
    const male = members.filter(m => (m.gender || '').toLowerCase() === 'male').length;
    const children = members.filter(m => Number(m.age) < 18).length;
    const elderly = members.filter(m => Number(m.age) >= 60).length;
    const pregnant = members.filter(m => m.isPregnant || (m.pregnancyStatus || '').toLowerCase().includes('pregnant')).length;

    return {
      totalMembers: total,
      femaleCount: female,
      maleCount: male,
      childrenCount: children,
      elderlyCount: elderly,
      pregnantCount: pregnant
    };
  }

  /**
   * Adds a new member to an existing family and dynamically registers their health profile
   */
  addFamilyMember(familyId, { name, gender, age, role = 'Member', isPregnant = false, phone = '9848012345 (Synthetic)' }) {
    const family = this.getFamilyById(familyId);
    if (!family) return { success: false, message: 'Family not found' };

    const prefix = (name || 'BEN').slice(0, 3).toUpperCase();
    const personId = `P-${prefix}-${Math.floor(Math.random() * 899 + 100)}`;
    const newMember = {
      personId,
      name,
      gender,
      age: Number(age) || 20,
      role,
      pregnancyStatus: isPregnant ? 'Pregnant' : 'Non-pregnant',
      status: isPregnant ? 'Antenatal Tracking Registered' : 'Active Beneficiary',
      isPregnant: Boolean(isPregnant),
      phone
    };

    family.members.push(newMember);

    // Register their individual clinical profile in diagnostic manager so they are immediately accessible
    diagnosticManager.ensureProfileExists(name, family.houseNumber, Number(age), gender);

    // Add timeline event
    family.events.unshift({
      id: `EVT-${Date.now().toString().slice(-4)}`,
      type: 'MEMBER_ADDED',
      title: `Family Member Registered: ${name} (${gender}, ${age}y)`,
      date: new Date().toISOString().split('T')[0],
      actor: userManager.getCurrentUser().fullName,
      description: `New member added to Family ${family.familyId}. Assigned Person ID: ${personId}.`,
      verified: true,
      documentTitle: null
    });

    this.saveFamily(family);
    return { success: true, member: newMember, family };
  }

  /**
   * Adds a scheme benefit to the family or individual member
   */
  addScheme(familyId, { name, eligibility = 'Eligible', eligibleFor = 'Family', personId = null, personName = null, status = 'Applied', date = null, notes = '' }) {
    const family = this.getFamilyById(familyId);
    if (!family) return { success: false, message: 'Family not found' };

    const newScheme = {
      id: `SCH-${Date.now().toString().slice(-4)}`,
      name,
      eligibility,
      eligibleFor,
      beneficiaryId: eligibleFor === 'Individual' ? personId : null,
      beneficiaryName: eligibleFor === 'Individual' ? (personName || 'Beneficiary') : `Family ${family.familyId}`,
      status,
      date: date || new Date().toISOString().split('T')[0],
      notes
    };

    family.schemes.unshift(newScheme);
    family.events.unshift({
      id: `EVT-${Date.now().toString().slice(-4)}`,
      type: 'SCHEME_ENROLLED',
      title: `Scheme Added: ${name} (${status})`,
      date: newScheme.date,
      actor: userManager.getCurrentUser().fullName,
      description: `Enrolled for ${newScheme.beneficiaryName}. Eligibility: ${eligibility}. Notes: ${notes}`,
      verified: status === 'Approved' || status === 'Provided',
      documentTitle: null
    });

    this.saveFamily(family);
    return { success: true, scheme: newScheme };
  }

  /**
   * Records essential health supplies distributed to a family or individual
   */
  addSupply(familyId, { name, quantity = 1, providedTo = 'Family', personId = null, personName = null, relatedProgramme = '', date = null, notes = '' }) {
    const family = this.getFamilyById(familyId);
    if (!family) return { success: false, message: 'Family not found' };

    const user = userManager.getCurrentUser();
    const newSupply = {
      id: `SUP-${Date.now().toString().slice(-4)}`,
      name,
      quantity: Number(quantity) || 1,
      providedTo,
      beneficiaryId: providedTo === 'Individual' ? personId : null,
      beneficiaryName: providedTo === 'Individual' ? (personName || 'Beneficiary') : `Family ${family.familyId}`,
      relatedProgramme: relatedProgramme || '',
      date: date || new Date().toISOString().split('T')[0],
      providedBy: `${user.fullName} (${user.id})`,
      notes
    };

    family.essentialHealthSupplies.unshift(newSupply);
    family.events.unshift({
      id: `EVT-${Date.now().toString().slice(-4)}`,
      type: 'SUPPLY_DISTRIBUTED',
      title: `Essential Supply Provided: ${quantity}x ${name}${relatedProgramme ? ` (${relatedProgramme})` : ''}`,
      date: newSupply.date,
      actor: user.fullName,
      description: `Distributed to ${newSupply.beneficiaryName}.${relatedProgramme ? ` Linked to ${relatedProgramme}.` : ''} Notes: ${notes}`,
      verified: true,
      documentTitle: null
    });

    this.saveFamily(family);
    return { success: true, supply: newSupply };
  }

  /**
   * Records documented medicines provided per standing authorized guidelines (Non-AI prescription)
   */
  addMedicine(familyId, { name, quantity = 1, recipient = 'Beneficiary', personId = null, relatedProgramme = '', date = null, notes = '' }) {
    const family = this.getFamilyById(familyId);
    if (!family) return { success: false, message: 'Family not found' };

    const user = userManager.getCurrentUser();
    const newMed = {
      id: `MED-${Date.now().toString().slice(-4)}`,
      name,
      quantity: Number(quantity) || 1,
      recipient,
      personId,
      relatedProgramme: relatedProgramme || '',
      date: date || new Date().toISOString().split('T')[0],
      provider: `${user.fullName} (${user.id})`,
      notes
    };

    family.medicinesProvided.unshift(newMed);
    family.events.unshift({
      id: `EVT-${Date.now().toString().slice(-4)}`,
      type: 'MEDICINE_DOCUMENTED',
      title: `Medicine Provided: ${name} (Qty: ${quantity})${relatedProgramme ? ` (${relatedProgramme})` : ''}`,
      date: newMed.date,
      actor: user.fullName,
      description: `Documented administration for ${recipient}.${relatedProgramme ? ` Linked to ${relatedProgramme}.` : ''} Notes: ${notes}`,
      verified: true,
      documentTitle: null
    });

    this.saveFamily(family);
    return { success: true, medicine: newMed };
  }

  /**
   * Reports a birth event and integrates new child into family members
   */
  reportBirth(familyId, { motherName, childName, dob, gender, placeOfBirth, notes = '', documentTitle = null }) {
    const family = this.getFamilyById(familyId);
    if (!family) return { success: false, message: 'Family not found' };

    const childPid = `P-${(childName || 'BAB').slice(0, 3).toUpperCase()}-${Math.floor(Math.random() * 899 + 100)}`;
    const newChild = {
      personId: childPid,
      name: childName || `${motherName}'s Infant`,
      gender: gender || 'Female',
      age: 0,
      role: 'Son/Daughter',
      pregnancyStatus: 'Non-pregnant',
      status: 'Birth Registration Logged',
      isPregnant: false,
      phone: 'N/A'
    };

    family.members.push(newChild);

    const event = {
      id: `EVT-${Date.now().toString().slice(-4)}`,
      type: 'BIRTH',
      title: `Birth Reported: ${newChild.name} (${gender})`,
      date: dob || new Date().toISOString().split('T')[0],
      actor: userManager.getCurrentUser().fullName,
      description: `Mother: ${motherName}. Place: ${placeOfBirth || 'PHC Rampur'}. Child registered with ID ${childPid}. Notes: ${notes}`,
      verified: true,
      documentTitle: documentTitle || 'Birth_Registration_Slip.pdf'
    };

    family.events.unshift(event);
    this.saveFamily(family);
    return { success: true, child: newChild, event };
  }

  /**
   * Reports a death event, preserving historical clinical profile without deleting person
   */
  reportDeath(familyId, { personId, personName, dateOfDeath, cause = 'Cause not recorded', notes = '' }) {
    const family = this.getFamilyById(familyId);
    if (!family) return { success: false, message: 'Family not found' };

    // Update member status rather than deleting them
    const member = (family.members || []).find(m => m.personId === personId);
    if (member) {
      member.status = 'Deceased (Historical Profile Preserved)';
    }

    const event = {
      id: `EVT-${Date.now().toString().slice(-4)}`,
      type: 'DEATH',
      title: `Vital Event: Death Reported (${personName})`,
      date: dateOfDeath || new Date().toISOString().split('T')[0],
      actor: userManager.getCurrentUser().fullName,
      description: `Beneficiary: ${personName} (${personId}). Cause: ${cause || 'Cause not recorded'}. Historical health profile preserved in permanent records. Notes: ${notes}`,
      verified: false,
      documentTitle: null
    };

    family.events.unshift(event);
    this.saveFamily(family);
    return { success: true, event };
  }

  /**
   * Reports an outbreak / health cluster event with safe non-diagnostic terminology
   */
  reportHealthEvent(familyId, { symptoms, affectedCount = 1, description = '', date = null }) {
    const family = this.getFamilyById(familyId);
    if (!family) return { success: false, message: 'Family not found' };

    const event = {
      id: `EVT-${Date.now().toString().slice(-4)}`,
      type: 'HEALTH_EVENT',
      title: `Reported health event: ${symptoms || 'Cluster observation'}`,
      date: date || new Date().toISOString().split('T')[0],
      actor: userManager.getCurrentUser().fullName,
      description: `Cluster of ${affectedCount} affected members in house ${family.houseNumber}. Symptoms: ${symptoms}. Status: Reported — Under Review (Awaiting Medical Officer verification). Details: ${description}`,
      verified: false,
      documentTitle: null
    };

    family.events.unshift(event);
    this.saveFamily(family);
    return { success: true, event };
  }

  /**
   * Records a community programme activity
   */
  reportProgramme(familyId, { programmeType = 'VHSND', activityDetails = '', date = null, notes = '' }) {
    const family = this.getFamilyById(familyId);
    if (!family) return { success: false, message: 'Family not found' };

    const event = {
      id: `EVT-${Date.now().toString().slice(-4)}`,
      type: 'PROGRAMME',
      title: `Programme Report: ${programmeType}`,
      date: date || new Date().toISOString().split('T')[0],
      actor: userManager.getCurrentUser().fullName,
      description: `Activity: ${activityDetails}. Conducted for Family ${family.familyId}. Notes: ${notes}`,
      verified: true,
      documentTitle: null
    };

    family.events.unshift(event);
    this.saveFamily(family);
    return { success: true, event };
  }

  // =========================================================================
  // ASHA Workload Targets & Progress Calculations (Requirements 14-16)
  // =========================================================================
  getAshaTarget(ashaUserId) {
    try {
      const data = localStorage.getItem(STORAGE_TARGETS_KEY);
      const targets = data ? JSON.parse(data) : DEFAULT_ASHA_TARGETS;
      const target = targets[ashaUserId] || targets['ASHA001'] || {
        ashaUserId: ashaUserId || 'ASHA001',
        ashaName: 'Sita Rao',
        allocatedHouseholds: 45,
        completedHouseholds: 32,
        subCentre: 'Rampur Sub-Centre North (Sector 4)',
        lastUpdated: '2026-09-18'
      };

      const allocated = Number(target.allocatedHouseholds) || 45;
      const completed = Number(target.completedHouseholds) || 32;
      const remaining = Math.max(0, allocated - completed);
      const progressPercent = Math.min(100, Math.round((completed / allocated) * 100));

      return {
        ...target,
        allocated,
        completed,
        remaining,
        progressPercent
      };
    } catch (e) {
      console.error('Error fetching target', e);
      return {
        ashaUserId: 'ASHA001',
        ashaName: 'Sita Rao',
        allocated: 45,
        completed: 32,
        remaining: 13,
        progressPercent: 71
      };
    }
  }

  setAshaTarget(ashaUserId, newTargetCount) {
    try {
      const data = localStorage.getItem(STORAGE_TARGETS_KEY);
      const targets = data ? JSON.parse(data) : DEFAULT_ASHA_TARGETS;
      const t = targets[ashaUserId] || { ashaUserId, ashaName: 'ASHA Worker', completedHouseholds: 30 };
      t.allocatedHouseholds = Number(newTargetCount) || 45;
      t.lastUpdated = new Date().toISOString().split('T')[0];
      targets[ashaUserId] = t;
      localStorage.setItem(STORAGE_TARGETS_KEY, JSON.stringify(targets));
      return this.getAshaTarget(ashaUserId);
    } catch (e) {
      console.error('Error saving target', e);
      return null;
    }
  }

  assignFamilyToAsha(familyId, ashaUserId, ashaName) {
    const family = this.getFamilyById(familyId);
    if (!family) return false;
    family.assignedAsha = ashaUserId;
    family.assignedAshaName = ashaName;
    this.saveFamily(family);
    return true;
  }
}

export const familyManager = new FamilyManager();
