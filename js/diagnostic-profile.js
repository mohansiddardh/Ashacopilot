/**
 * ASHA Copilot 2.0+ - Person Health Profile & Diagnostic Reports Engine
 * Kalachakra 2K26 Healthcare PS-H02
 * 
 * Manages:
 * - 11 Profile dimensions (Personal info, conditions, check-ups, diagnostics, labs, vitals,
 *   physical examination, clinical reports, doctor verification, follow-ups, timeline)
 * - Automatic Follow-up Status Tracker (🟢 Up to date, 🟡 Upcoming, 🟠 Due Soon, 🔴 Overdue)
 * - Missed Check-up Warnings (Non-diagnostic documentation reminders)
 * - Auto-calculated BMI from Height & Weight
 * - New / Undocumented Health Findings workflow (labeled "Reported — Awaiting Verification")
 * - Doctor Verification with clear origin attribution (ASHA ENTERED, AI EXTRACTED, PERSON REPORTED, DOCTOR VERIFIED)
 */

import { documentStore } from './document-store.js';
import { userManager } from './user-manager.js';
import { i18n } from './i18n.js';

const STORAGE_KEY_PROFILES = 'asha_db_diagnostic_profiles_v2';
const STORAGE_KEY_CHECKUPS = 'asha_db_checkups_v2';

export class DiagnosticProfileManager {
  constructor() {
    this.seedProfilesIfEmpty();
  }

  seedProfilesIfEmpty() {
    const existing = this.getAllProfiles();
    if (existing.length === 0) {
      // Seed Sita Devi (H001)
      const sitaProfile = {
        personId: 'P-SIT-101',
        householdId: 'H001',
        name: 'Sita Devi',
        age: 24,
        gender: 'Female',
        phone: '9848012345 (Synthetic)',
        address: 'House #4-12, Sector 4B, Rampur',
        conditions: [
          {
            id: 'COND-01',
            title: 'Pregnancy (20 Weeks Gestation)',
            type: 'Maternal',
            recordedDate: '2026-08-15',
            status: 'DOCTOR_VERIFIED',
            verifiedBy: 'Dr. K. V. Sharma',
            notes: 'Antenatal care registered. Second trimester normal progression.'
          }
        ],
        followUp: {
          condition: 'Pregnancy Care (ANC Trimester 2)',
          verificationStatus: 'DOCTOR_VERIFIED',
          lastCheckupDate: '2026-09-05',
          lastReportDate: '2026-09-05',
          nextScheduledDate: '2026-10-02', // upcoming
          notes: 'Routine ANC checkup scheduled at Rampur Sub-Centre.'
        },
        vitalsHistory: [
          { date: '2026-09-05', bp: '118/76', heartRate: 74, spo2: 99, temp: 98.4, height: 158, weight: 56, bmi: 22.4 },
          { date: '2026-08-15', bp: '120/78', heartRate: 72, spo2: 98, temp: 98.6, height: 158, weight: 54, bmi: 21.6 }
        ],
        findings: [
          {
            id: 'FIND-01',
            title: 'Morning Nausea (First Trimester)',
            source: 'PERSON_REPORTED',
            date: '2026-08-15',
            status: 'DOCTOR_VERIFIED',
            verifiedBy: 'Dr. K. V. Sharma',
            verifiedDate: '2026-08-16',
            notes: 'Dietary guidance provided. Resolved in 2nd trimester.'
          }
        ],
        physicalExams: [
          {
            date: '2026-09-05',
            lungs: 'Normal',
            skin: 'Normal',
            throat: 'Normal',
            eyes: 'Normal (No pallor)',
            ears: 'Normal',
            notes: 'Pedal edema absent. Uterine fundal height corresponds to 20 weeks.'
          }
        ],
        healthTimeline: [
          {
            date: '2026-09-05',
            type: 'CHECK_UP',
            title: 'ANC 2nd Trimester Physical & Ultrasound',
            description: 'BP 118/76, BMI 22.4. Ultrasound Scan and CBC Blood Test uploaded. Doctor verified.',
            status: 'DOCTOR_VERIFIED',
            actor: 'Lata Devi (ASHA) & Dr. K. V. Sharma'
          },
          {
            date: '2026-08-15',
            type: 'ENCOUNTER',
            title: 'Initial Home Visit & Registration',
            description: 'Pregnancy registered at 15 weeks gestation. IFA supplementation initiated.',
            status: 'DOCTOR_VERIFIED',
            actor: 'Lata Devi (ASHA)'
          }
        ]
      };

      // Seed Meena Sharma (H019) with an OVERDUE follow-up to demonstrate missed check-up warnings
      const meenaProfile = {
        personId: 'P-MEE-119',
        householdId: 'H019',
        name: 'Meena Sharma',
        age: 26,
        gender: 'Female',
        phone: '9848098765 (Synthetic)',
        address: 'House #7-3, Sector 2, Rampur',
        conditions: [
          {
            id: 'COND-02',
            title: 'Pregnancy (28 Weeks Gestation)',
            type: 'Maternal',
            recordedDate: '2026-07-20',
            status: 'DOCTOR_VERIFIED',
            verifiedBy: 'Dr. K. V. Sharma',
            notes: '3rd trimester ANC tracking.'
          }
        ],
        followUp: {
          condition: 'Pregnancy Follow-up (ANC Trimester 3)',
          verificationStatus: 'DOCTOR_VERIFIED',
          lastCheckupDate: '2026-08-10',
          lastReportDate: '2026-08-10',
          nextScheduledDate: '2026-09-07', // Overdue relative to 18 Sep 2026!
          notes: 'High risk gestational surveillance. BP monitoring required.'
        },
        vitalsHistory: [
          { date: '2026-08-10', bp: '122/80', heartRate: 78, spo2: 98, temp: 98.6, height: 162, weight: 64, bmi: 24.4 }
        ],
        findings: [
          {
            id: 'FIND-02',
            title: 'Mild Pedal Swelling',
            source: 'ASHA_ENTERED',
            date: '2026-08-10',
            status: 'REPORTED',
            verifiedBy: null,
            notes: 'Reported during home visit. Awaiting supervisor clinical review.'
          }
        ],
        physicalExams: [
          {
            date: '2026-08-10',
            lungs: 'Normal',
            skin: 'Normal',
            throat: 'Normal',
            eyes: 'Normal',
            ears: 'Normal',
            notes: 'Slight ankle swelling in evenings.'
          }
        ],
        healthTimeline: [
          {
            date: '2026-08-10',
            type: 'CHECK_UP',
            title: 'ANC 2nd Visit',
            description: 'BP 122/80. Fetal heart sounds regular. Blood pressure surveillance advised.',
            status: 'DOCTOR_VERIFIED',
            actor: 'Lata Devi (ASHA)'
          }
        ]
      };

      localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify([sitaProfile, meenaProfile]));
    }
  }

  getAllProfiles() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_PROFILES);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading diagnostic profiles', e);
      return [];
    }
  }

  getProfile(personIdOrHouseholdId) {
    const all = this.getAllProfiles();
    return all.find(p => p.personId === personIdOrHouseholdId || p.householdId === personIdOrHouseholdId) || null;
  }

  saveProfile(profile) {
    const all = this.getAllProfiles();
    const idx = all.findIndex(p => p.personId === profile.personId);
    if (idx >= 0) {
      all[idx] = profile;
    } else {
      all.unshift(profile);
    }
    localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(all));
  }

  ensureProfileExists(personName, householdId, age = 24, gender = 'Female') {
    let profile = this.getProfile(householdId);
    if (!profile) {
      const pid = `P-${(personName || 'BEN').slice(0, 3).toUpperCase()}-${Math.floor(Math.random() * 899 + 100)}`;
      profile = {
        personId: pid,
        householdId: householdId,
        name: personName || 'Beneficiary',
        age: age,
        gender: gender,
        phone: '9848012345 (Synthetic)',
        address: `Village Rampur (${householdId})`,
        conditions: [],
        followUp: null,
        vitalsHistory: [],
        findings: [],
        physicalExams: [],
        healthTimeline: []
      };
      this.saveProfile(profile);
    }
    return profile;
  }

  /**
   * Calculates follow-up status based on current date vs next scheduled check-up date
   * Current Reference Date: 2026-09-18
   * Statuses:
   * - 🟢 Up to date (next date is > 14 days in future)
   * - 🟡 Upcoming (next date is 4 - 14 days in future)
   * - 🟠 Due Soon (next date is 0 - 3 days in future)
   * - 🔴 Overdue (next date has passed)
   */
  evaluateFollowUpStatus(followUp) {
    if (!followUp || !followUp.nextScheduledDate) {
      return {
        badge: '🟢 Up to date',
        cssClass: 'status-up-to-date',
        isOverdue: false,
        daysRemaining: null,
        text: 'No pending follow-ups'
      };
    }

    const today = new Date('2026-09-18T12:00:00Z');
    const scheduled = new Date(`${followUp.nextScheduledDate}T12:00:00Z`);
    const diffTime = scheduled.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        badge: '🔴 Overdue',
        cssClass: 'status-overdue',
        isOverdue: true,
        daysRemaining: diffDays,
        text: `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''}`
      };
    } else if (diffDays <= 3) {
      return {
        badge: '🟠 Due Soon',
        cssClass: 'status-due-soon',
        isOverdue: false,
        daysRemaining: diffDays,
        text: `Due in ${diffDays} day${diffDays > 1 ? 's' : ''}`
      };
    } else if (diffDays <= 14) {
      return {
        badge: '🟡 Upcoming',
        cssClass: 'status-upcoming',
        isOverdue: false,
        daysRemaining: diffDays,
        text: `Upcoming in ${diffDays} days`
      };
    } else {
      return {
        badge: '🟢 Up to date',
        cssClass: 'status-up-to-date',
        isOverdue: false,
        daysRemaining: diffDays,
        text: `Scheduled in ${diffDays} days`
      };
    }
  }

  /**
   * Evaluates if a recent supporting clinical report exists within 30 days
   */
  evaluateRecentReportRequirement(followUp) {
    if (!followUp || !followUp.lastReportDate) {
      return { hasRecentReport: false, message: 'No clinical report uploaded yet.' };
    }

    const today = new Date('2026-09-18T12:00:00Z');
    const lastReport = new Date(`${followUp.lastReportDate}T12:00:00Z`);
    const diffDays = Math.floor((today.getTime() - lastReport.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays > 30) {
      return {
        hasRecentReport: false,
        daysOld: diffDays,
        message: 'NEW FOLLOW-UP INFORMATION MAY BE REQUIRED: Last supporting report is older than 30 days.'
      };
    }

    return {
      hasRecentReport: true,
      daysOld: diffDays,
      message: 'Recent clinical report available (verified).'
    };
  }

  /**
   * Computes BMI: Weight (kg) / (Height (m) ^ 2)
   */
  calculateBMI(heightCm, weightKg) {
    const h = Number(heightCm);
    const w = Number(weightKg);
    if (!h || !w || h <= 0 || w <= 0) return null;
    const heightM = h / 100;
    const bmi = (w / (heightM * heightM)).toFixed(1);
    let category = 'Normal weight';
    let color = '#059669';

    if (bmi < 18.5) {
      category = 'Underweight';
      color = '#D97706';
    } else if (bmi >= 25 && bmi < 29.9) {
      category = 'Overweight';
      color = '#EA580C';
    } else if (bmi >= 30) {
      category = 'Obese';
      color = '#DC2626';
    }

    return { value: bmi, category, color };
  }

  /**
   * Adds a new check-up record to person profile and logs timeline
   */
  addCheckup(personId, {
    date = '2026-09-18',
    conductedBy = 'ASHA Worker',
    vitals = {},
    labTests = {},
    physicalExam = {},
    observations = '',
    newFinding = '',
    attachedReport = null
  }) {
    const profile = this.getProfile(personId);
    if (!profile) return { success: false, message: 'Person not found' };

    const currentUser = userManager.getCurrentUser();
    const stamp = userManager.getAttributionStamp();

    // 1. Record vitals
    if (vitals.bp || vitals.weight) {
      profile.vitalsHistory.unshift({
        date: date,
        bp: vitals.bp || '120/80',
        heartRate: Number(vitals.heartRate) || 72,
        spo2: Number(vitals.spo2) || 98,
        temp: Number(vitals.temp) || 98.4,
        height: Number(vitals.height) || 160,
        weight: Number(vitals.weight) || 55,
        bmi: vitals.bmi || '21.5'
      });
    }

    // 2. Record physical exam
    profile.physicalExams.unshift({
      date: date,
      lungs: physicalExam.lungs || 'Normal',
      skin: physicalExam.skin || 'Normal',
      throat: physicalExam.throat || 'Normal',
      eyes: physicalExam.eyes || 'Normal',
      ears: physicalExam.ears || 'Normal',
      notes: observations || 'Routine clinical assessment.'
    });

    // 3. If new finding was entered, label it "Reported — Awaiting Verification"
    if (newFinding && newFinding.trim()) {
      profile.findings.unshift({
        id: `FIND-${Date.now().toString().slice(-4)}`,
        title: newFinding.trim(),
        source: 'ASHA_ENTERED',
        date: date,
        status: 'REPORTED',
        verifiedBy: null,
        notes: `Recorded during check-up by ${currentUser.fullName} (${currentUser.id}). Awaiting doctor verification.`
      });
    }

    // 4. Update follow-up record
    const nextCheckupDate = new Date(date);
    nextCheckupDate.setDate(nextCheckupDate.getDate() + 28); // 4 weeks later
    const nextDateStr = nextCheckupDate.toISOString().split('T')[0];

    if (!profile.followUp) {
      profile.followUp = {
        condition: 'Routine Health Surveillance',
        verificationStatus: 'PENDING_VERIFICATION',
        lastCheckupDate: date,
        lastReportDate: attachedReport ? date : null,
        nextScheduledDate: nextDateStr,
        notes: observations || 'Scheduled periodic follow-up.'
      };
    } else {
      profile.followUp.lastCheckupDate = date;
      if (attachedReport) profile.followUp.lastReportDate = date;
      profile.followUp.nextScheduledDate = nextDateStr;
    }

    // 5. Add to health timeline
    profile.healthTimeline.unshift({
      date: date,
      type: 'CHECK_UP',
      title: `Clinical Check-Up (${conductedBy})`,
      description: `Vitals recorded: BP ${vitals.bp || '120/80'}, BMI ${vitals.bmi || '21.5'}. ${newFinding ? `Finding noted: "${newFinding}". ` : ''}${observations ? `Observation: ${observations}` : ''}`,
      status: 'PENDING_VERIFICATION',
      actor: `${currentUser.fullName} (${currentUser.role})`,
      attribution: stamp
    });

    this.saveProfile(profile);
    return { success: true, profile };
  }

  /**
   * Doctor Verification Action
   */
  verifyFinding(personId, findingId, { status = 'DOCTOR_VERIFIED', verifiedBy, notes = '' }) {
    const profile = this.getProfile(personId);
    if (!profile) return { success: false, message: 'Person not found' };

    const finding = profile.findings.find(f => f.id === findingId);
    if (!finding) return { success: false, message: 'Finding not found' };

    finding.status = status;
    finding.verifiedBy = verifiedBy || 'Dr. K. V. Sharma (Medical Officer)';
    finding.verifiedDate = new Date().toISOString().split('T')[0];
    finding.notes = notes || 'Clinical assessment confirmed by physician.';

    profile.healthTimeline.unshift({
      date: new Date().toISOString().split('T')[0],
      type: 'VERIFICATION',
      title: `Finding Verification: ${finding.title}`,
      description: `Condition updated to ${status}. Verified by ${finding.verifiedBy}. Notes: ${finding.notes}`,
      status: status,
      actor: finding.verifiedBy
    });

    this.saveProfile(profile);
    return { success: true, profile };
  }

  getProfileByPersonOrHousehold(personIdOrHouseholdId) {
    if (!personIdOrHouseholdId) return this.getAllProfiles()[0] || null;
    const all = this.getAllProfiles();
    const pid = personIdOrHouseholdId.trim().toUpperCase();
    return all.find(p => 
      (p.personId && p.personId.toUpperCase() === pid) ||
      (p.householdId && p.householdId.toUpperCase() === pid) ||
      (p.name && p.name.toLowerCase().includes(personIdOrHouseholdId.toLowerCase())) ||
      (p.personId && p.personId.toUpperCase().includes(pid))
    ) || all[0] || null;
  }

  searchProfiles(query) {
    if (!query) return this.getAllProfiles();
    const q = query.trim().toLowerCase();
    return this.getAllProfiles().filter(p =>
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.personId && p.personId.toLowerCase().includes(q)) ||
      (p.householdId && p.householdId.toLowerCase().includes(q))
    );
  }

  upsertProfileFromEncounter(cdm, options = {}) {
    const personName = cdm.person?.name || 'Beneficiary';
    const householdId = cdm.household_id || 'H001';
    const age = cdm.person?.age || 24;
    const gender = cdm.person?.gender || 'Female';
    const isPregnant = cdm.maternal?.is_pregnant ?? cdm.person?.pregnancy_status;
    const weeks = cdm.maternal?.gestational_age_weeks ?? cdm.person?.gestational_age_weeks;
    const cdmPersonId = cdm.person_id || cdm.person?.id;
    const action = options.action || 'MERGE'; // 'MERGE' | 'DISTINCT'
    const matchedPersonId = options.matchedPersonId || cdmPersonId;

    let profile = null;

    if (action === 'DISTINCT') {
      // Force creation of a brand-new distinct profile
      const newPid = `P-${(personName || 'BEN').slice(0, 3).toUpperCase()}-${Math.floor(Math.random() * 899 + 100)}`;
      profile = {
        personId: newPid,
        householdId: householdId,
        name: personName,
        age: age,
        gender: gender,
        phone: cdm.person?.phone || '9848012345 (Synthetic)',
        address: cdm.person?.address || `Village Rampur (${householdId})`,
        conditions: [],
        followUp: null,
        vitalsHistory: [],
        findings: [],
        physicalExams: [],
        healthTimeline: []
      };
    } else {
      // MERGE action: search by matchedPersonId, cdmPersonId, householdId, or personName
      if (matchedPersonId) {
        profile = this.getProfile(matchedPersonId);
      }
      if (!profile) {
        profile = this.getProfile(householdId) || this.getProfile(personName);
      }
      if (!profile) {
        profile = this.ensureProfileExists(personName, householdId, age, gender);
      }
    }

    const todayStr = (cdm.timestamp || new Date().toISOString()).split('T')[0];
    const createdBy = cdm.created_by || 'Lata Devi (ASHA)';

    // Update vitals history if available
    const vitals = cdm.observations?.vitals || cdm.vitals;
    if (vitals && (vitals.bp || vitals.weight || vitals.spo2)) {
      profile.vitalsHistory = profile.vitalsHistory || [];
      profile.vitalsHistory.unshift({
        date: todayStr,
        bp: vitals.bp || '120/80',
        heartRate: Number(vitals.heartRate) || 72,
        spo2: Number(vitals.spo2) || 98,
        temp: Number(vitals.temperature || vitals.temp) || 98.4,
        height: 158,
        weight: Number(vitals.weight) || 55,
        bmi: vitals.bmi || '22.0'
      });
    }

    if (isPregnant) {
      if (!profile.conditions) profile.conditions = [];
      const existingCond = profile.conditions.find(c => c.type === 'Maternal');
      if (!existingCond) {
        profile.conditions.push({
          id: `COND-${Date.now().toString().slice(-4)}`,
          title: `Pregnancy (${weeks || 20} Weeks Gestation)`,
          type: 'Maternal',
          recordedDate: todayStr,
          status: 'DOCTOR_VERIFIED',
          verifiedBy: 'Dr. K. V. Sharma',
          notes: 'Antenatal care registered.'
        });
      } else {
        existingCond.title = `Pregnancy (${weeks || 20} Weeks Gestation)`;
        existingCond.notes = `Updated on ${todayStr} during longitudinal follow-up encounter.`;
      }
      if (!profile.followUp) {
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + 21);
        profile.followUp = {
          condition: 'Pregnancy Care (ANC)',
          verificationStatus: 'DOCTOR_VERIFIED',
          lastCheckupDate: todayStr,
          lastReportDate: todayStr,
          nextScheduledDate: nextDate.toISOString().split('T')[0],
          notes: 'Routine ANC visit schedule.'
        };
      } else {
        profile.followUp.lastCheckupDate = todayStr;
      }
    }

    // Add longitudinal encounter to health timeline
    if (!profile.healthTimeline) profile.healthTimeline = [];
    const visitNumber = profile.healthTimeline.filter(t => t.type === 'ENCOUNTER' || t.type === 'CHECK_UP').length + 1;
    const isMerged = (action === 'MERGE' && profile.healthTimeline.length > 0);

    profile.healthTimeline.unshift({
      date: todayStr,
      type: 'ENCOUNTER',
      title: isMerged ? `Longitudinal Follow-up Visit #${visitNumber} (Merged CDM)` : `Field Encounter #${visitNumber} (${cdm.source || 'FORM'})`,
      description: isMerged 
        ? `Repeat encounter captured by ${createdBy}. Vitals and clinical indicators merged into Single Source of Truth CDM profile (${profile.personId}) without duplicating record.`
        : `Encounter captured by ${createdBy}. Beneficiary profile established in primary community registry.`,
      status: 'DOCTOR_VERIFIED',
      actor: createdBy
    });

    this.saveProfile(profile);
    return profile;
  }

  calculateBmi(arg1, arg2) {
    let w = Number(arg1);
    let h = Number(arg2);
    if (w > 100 && h < 100) {
      const temp = w; w = h; h = temp;
    }
    const res = this.calculateBMI(h, w);
    return {
      bmi: res ? res.value : '--',
      category: res ? res.category : 'Enter height & weight',
      color: res ? res.color : '#6B7280'
    };
  }

  hasOldReport(documents) {
    if (!documents || documents.length === 0) return true;
    const today = new Date('2026-09-18T12:00:00Z');
    return documents.some(d => {
      const dDate = new Date(`${d.date}T12:00:00Z`);
      const diffDays = Math.floor((today.getTime() - dDate.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays > 30;
    });
  }
}

export const diagnosticManager = new DiagnosticProfileManager();
