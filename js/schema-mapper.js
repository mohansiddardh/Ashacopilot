/**
 * ASHA Copilot 2.0 - Schema Mapping Engine
 * Problem Statement PS-H02: "One Worker, Five Systems"
 * Transforms a single Common Data Model (CDM) record into multiple distinct programme schemas.
 * 
 * NOTE: All schemas are clearly labeled "Demo Programme Schema" for prototype demonstration.
 */

export class SchemaMappingEngine {
  /**
   * Transforms a normalized Common Data Model record into 3 distinct programme schemas
   */
  static transformAll(commonRecord) {
    if (!commonRecord) return null;

    const maternal = this.mapToMaternalHealthRecord(commonRecord);
    const immunisation = this.mapToImmunisationRecord(commonRecord);
    const household = this.mapToHouseholdRegister(commonRecord);
    const diagnostic = this.mapToDiagnosticRecord(commonRecord);
    const supplies = this.mapToSuppliesRecord(commonRecord);
    const programmeReporting = this.mapToProgrammeReportingRecord(commonRecord);

    return {
      source_cdm: commonRecord,
      generated_at: new Date().toISOString(),
      outputs: [
        {
          id: 'maternal',
          name: 'Maternal Health Record',
          schema_label: 'Demo Programme Schema A: Maternal & Child Health (MCH) Register',
          code: 'DEMO-PROG-MCH-01',
          status: 'Generated Successfully',
          icon: '🤰',
          description: 'Specialized register for antenatal care, gestational monitoring, gravida tracking, and maternal nutrition.',
          data: maternal
        },
        {
          id: 'immunisation',
          name: 'Immunisation Record',
          schema_label: 'Demo Programme Schema B: Universal Immunisation Programme (UIP) Register',
          code: 'DEMO-PROG-UIP-02',
          status: 'Generated Successfully',
          icon: '💉',
          description: 'Tracks early childhood immunization doses, cold-chain schedules, and overdue vaccination alerts.',
          data: immunisation
        },
        {
          id: 'household',
          name: 'Household Register',
          schema_label: 'Demo Programme Schema C: Village Household & Population Register',
          code: 'DEMO-PROG-VPR-03',
          status: 'Generated Successfully',
          icon: '🏠',
          description: 'Community demographic census survey tracking pregnant members, children under five, and health flags.',
          data: household
        },
        {
          id: 'diagnostic',
          name: 'Diagnostic & Health Check-up',
          schema_label: 'Demo Programme Schema D: Frontline Diagnostic & Vitals Register',
          code: 'DEMO-PROG-DCR-04',
          status: 'Generated Successfully',
          icon: '🩺',
          description: 'Surveillance register for non-communicable disease risk, vitals (BP, SpO2, BMI), and clinical alerts.',
          data: diagnostic
        },
        {
          id: 'supplies',
          name: 'Essential Health Supplies',
          schema_label: 'Demo Programme Schema E: Essential Health Supplies Register',
          code: 'DEMO-PROG-EHS-05',
          status: 'Generated Successfully',
          icon: '📦',
          description: 'Tracks distribution of frontline life-saving supplies: ORS, Zinc, IFA tablets, chlorine tablets, and hygiene kits.',
          data: supplies
        },
        {
          id: 'programme_reporting',
          name: 'Programme Reporting & Schemes',
          schema_label: 'Demo Programme Schema F: Public Health Schemes & Welfare Register',
          code: 'DEMO-PROG-PR-06',
          status: 'Generated Successfully',
          icon: '🏛️',
          description: 'Tracks multi-programme scheme eligibility, benefit delivery, follow-up schedules, and welfare linkages.',
          data: programmeReporting
        }
      ]
    };
  }

  /**
   * PROGRAMME SCHEMA A: Maternal Health Record
   */
  static mapToMaternalHealthRecord(cdm) {
    const isPreg = cdm.maternal?.is_pregnant ?? cdm.person?.pregnancy_status;
    const weeks = cdm.maternal?.gestational_age_weeks ?? cdm.person?.gestational_age_weeks;

    let eddEstimate = cdm.maternal?.expected_delivery_date || 'N/A - Non Pregnant Beneficiary';
    if (!cdm.maternal?.expected_delivery_date && isPreg && weeks) {
      const remainingWeeks = Math.max(0, 40 - weeks);
      const edd = new Date(cdm.timestamp || Date.now());
      edd.setDate(edd.getDate() + (remainingWeeks * 7));
      eddEstimate = edd.toISOString().split('T')[0];
    }

    const trimesterLabel = weeks 
      ? (weeks <= 12 ? '1st Trimester (Early ANC)' : weeks <= 27 ? '2nd Trimester (Routine ANC)' : '3rd Trimester (Pre-Delivery Monitoring)')
      : 'Not Applicable';

    const vitalsStr = cdm.observations?.vitals 
      ? `BP: ${cdm.observations.vitals.bp || '120/80'}, Temp: ${cdm.observations.vitals.temperature || 98.4}°F, SpO2: ${cdm.observations.vitals.spo2 || 98}%`
      : 'Vitals within normal baseline';

    return {
      schema_type: 'Demo Programme Schema - MCH Register',
      disclaimer: 'Synthetic demonstration format only. Not affiliated with any official government portal.',
      mch_beneficiary_id: `MCH-${cdm.household_id}-${cdm.person.name.toUpperCase().slice(0, 3)}`,
      mother_full_name: cdm.person.name || 'Unnamed Beneficiary',
      age_in_years: cdm.person.age || 'Unknown',
      pregnancy_confirmed: isPreg ? 'YES' : 'NO',
      gestation: isPreg ? `${weeks || 0} weeks` : '0 weeks (Non-pregnant)',
      anc_trimester: trimesterLabel,
      estimated_delivery_date: eddEstimate,
      gravida_previous_pregnancies: cdm.maternal?.previous_pregnancies_gravida ?? (isPreg ? 1 : 0),
      ifa_tablets_eligible: Boolean(isPreg && (weeks >= 12)),
      tetanus_toxoid_due: Boolean(isPreg && (weeks >= 14 && weeks <= 36)),
      maternal_vitals: vitalsStr,
      high_risk_pregnancy_flag: Boolean(cdm.maternal?.high_risk_flag),
      anc_observations: cdm.observations?.reported_symptoms?.length > 0 
        ? cdm.observations.reported_symptoms.join(', ') 
        : 'Normal physical state reported',
      reporting_subcentre: 'Rampur Sub-Centre Cluster',
      field_worker_signature: cdm.created_by || 'Lata Devi (ASHA-TS-042)',
      verification_status: cdm.verification_status || 'CONFIRMED',
      entry_timestamp: cdm.timestamp
    };
  }

  /**
   * PROGRAMME SCHEMA B: Universal Immunisation Programme (UIP) Register
   */
  static mapToImmunisationRecord(cdm) {
    const childCount = cdm.children?.count || 0;
    const recordedVaccines = cdm.children?.recorded_vaccines || [];
    
    // Determine upcoming vaccines
    const dueVaccines = [];
    if (!recordedVaccines.includes('BCG')) dueVaccines.push('BCG (At Birth)');
    if (!recordedVaccines.includes('OPV-0')) dueVaccines.push('OPV-0 (At Birth)');
    if (recordedVaccines.includes('BCG') && !recordedVaccines.includes('Pentavalent-1')) {
      dueVaccines.push('Pentavalent-1', 'Rotavirus-1');
    }
    if (recordedVaccines.includes('Pentavalent-1') && !recordedVaccines.includes('Pentavalent-2')) {
      dueVaccines.push('Pentavalent-2');
    }
    if (recordedVaccines.includes('Pentavalent-2') && !recordedVaccines.includes('Pentavalent-3')) {
      dueVaccines.push('Pentavalent-3', 'Measles-Rubella-1');
    }

    let status = 'No Dependent Children';
    if (childCount > 0) {
      if (recordedVaccines.length === 0) {
        status = 'Unimmunised - Immediate Outreach Required';
      } else if (dueVaccines.length === 0) {
        status = 'Age-Appropriate Full Immunisation Achieved';
      } else {
        status = 'Partially Immunised - On Schedule';
      }
    }

    return {
      schema_type: 'Demo Programme Schema - UIP Register',
      disclaimer: 'Synthetic demonstration format only. Not affiliated with any official government portal.',
      uip_register_id: `UIP-${cdm.household_id}-C${childCount}`,
      guardian_name: cdm.person.name,
      child_name: cdm.children?.child_name || (childCount > 0 ? `${cdm.person.name}'s Child` : 'N/A'),
      child_age: cdm.children?.child_age || (childCount > 0 ? '1.5 years' : 'N/A'),
      dependent_children_registered: childCount,
      completed_antigens: recordedVaccines.length > 0 ? recordedVaccines : ['None reported yet'],
      due_vaccine_schedule: dueVaccines.length > 0 ? dueVaccines : ['None immediate (Up to date)'],
      immunisation_compliance_status: status,
      session_site: 'Village Anganwadi Centre 3',
      next_vaccination_session_day: 'Every Wednesday / Monthly VHND',
      adverse_events_following_immunisation: 'None reported during home visit',
      audit_source: cdm.source || 'VOICE',
      data_verification_flag: recordedVaccines.length > 0 && childCount === 0 
        ? 'DATA CONFLICT: Vaccines recorded with 0 children' 
        : 'VERIFIED'
    };
  }

  /**
   * PROGRAMME SCHEMA C: Village Household & Population Register
   */
  static mapToHouseholdRegister(cdm) {
    const isPreg = cdm.maternal?.is_pregnant ?? cdm.person?.pregnancy_status;

    return {
      schema_type: 'Demo Programme Schema - Household Census Register',
      disclaimer: 'Synthetic demonstration format only. Not affiliated with any official government portal.',
      census_hh_code: cdm.household_id,
      survey_date: (cdm.timestamp || '').split('T')[0] || new Date().toISOString().split('T')[0],
      primary_informant_name: cdm.person.name,
      informant_age: cdm.person.age,
      informant_gender: cdm.person.gender,
      contact_phone: cdm.person.phone || '9848012345 (Synthetic)',
      residential_address: cdm.person.address || 'Village Rampur, Sector 4B',
      total_household_members: cdm.household?.total_members || 4,
      eligible_couple_reproductive_age: (cdm.person.age >= 15 && cdm.person.age <= 49),
      pregnant_member: Boolean(isPreg),
      under_five_children: cdm.household?.children_count ?? cdm.children?.count ?? 0,
      elderly_members_count: cdm.household?.elderly_count || 1,
      sanitation_and_health_risk: cdm.observations?.reported_symptoms?.length > 0
        ? `Active symptoms recorded: ${cdm.observations.reported_symptoms.join(', ')}`
        : 'No acute epidemiological danger signs',
      sub_centre_revisit_mandated: Boolean(cdm.encounter_meta?.follow_up_required),
      follow_up_action_date: cdm.encounter_meta?.follow_up_date || 'N/A',
      capture_source_mode: cdm.source || 'FORM',
      data_mode: 'SYNTHETIC',
      system_sync_status: cdm.sync_status || 'SYNCED'
    };
  }

  /**
   * PROGRAMME SCHEMA D: Frontline Diagnostic & Clinical Check-up Register
   */
  static mapToDiagnosticRecord(cdm) {
    const isPreg = cdm.maternal?.is_pregnant ?? cdm.person?.pregnancy_status;
    const bp = cdm.observations?.vitals?.bp || '120/80';
    const temp = cdm.observations?.vitals?.temperature || 98.4;
    const spo2 = cdm.observations?.vitals?.spo2 || 98;
    const heartRate = 74;
    const height = 160;
    const weight = isPreg ? 58 : 54;
    const bmi = (weight / ((height / 100) * (height / 100))).toFixed(1);

    return {
      schema_type: 'Demo Programme Schema - Diagnostic Check-up Register',
      disclaimer: 'Synthetic demonstration format only. Not affiliated with any official government portal.',
      diagnostic_register_id: `DCR-${cdm.household_id}-${(cdm.person.name || 'BEN').toUpperCase().slice(0, 3)}`,
      beneficiary_name: cdm.person.name,
      examination_date: (cdm.timestamp || '').split('T')[0] || new Date().toISOString().split('T')[0],
      blood_pressure_systolic_diastolic: bp,
      pulse_heart_rate_bpm: heartRate,
      oxygen_saturation_spo2: `${spo2}%`,
      body_temperature_f: `${temp}°F`,
      height_in_cm: height,
      weight_in_kg: weight,
      calculated_body_mass_index: `${bmi} kg/m² (Normal weight)`,
      clinical_danger_signs_detected: cdm.observations?.has_acute_danger_signs ? 'YES - CLINICAL ATTENTION NEEDED' : 'NONE DETECTED',
      reported_symptoms_list: (cdm.observations?.reported_symptoms || []).join(', ') || 'No active acute complaints',
      supervisory_review_status: 'Reported — Awaiting Medical Officer Verification',
      frontline_examiner: cdm.created_by || 'Lata Devi (ASHA-TS-042)'
    };
  }

  /**
   * PROGRAMME SCHEMA E: Community Essential Health Supplies Register
   */
  static mapToSuppliesRecord(cdm) {
    const isPreg = cdm.maternal?.is_pregnant ?? cdm.person?.pregnancy_status;
    const childCount = cdm.household?.children_count ?? cdm.children?.count ?? 0;

    return {
      schema_type: 'Demo Programme Schema - Essential Health Supplies Register',
      disclaimer: 'Synthetic demonstration format only. Not affiliated with any official government portal.',
      supply_register_id: `EHS-${cdm.household_id}-${new Date().getFullYear()}`,
      recipient_household_code: cdm.household_id,
      primary_contact_person: cdm.person.name,
      distribution_date: (cdm.timestamp || '').split('T')[0] || new Date().toISOString().split('T')[0],
      oral_rehydration_salts_packets: 5,
      iron_folic_acid_tablets: isPreg ? 30 : 0,
      zinc_sulfate_dispensable_tablets: childCount > 0 ? 14 : 0,
      chlorine_water_disinfection_tablets: 10,
      sanitary_hygiene_packs: cdm.person?.gender === 'Female' ? 2 : 0,
      emergency_first_aid_buffer_provided: 'YES',
      distributing_worker_id: cdm.created_by || 'ASHA Worker',
      health_programme_alignment: 'National Anemia Mukt Bharat & Diarrhea Control Initiative'
    };
  }

  /**
   * PROGRAMME SCHEMA F: Public Health Schemes & Welfare Register
   */
  static mapToProgrammeReportingRecord(cdm) {
    const isPreg = cdm.maternal?.is_pregnant ?? cdm.person?.pregnancy_status;
    const childCount = cdm.household?.children_count ?? cdm.children?.count ?? 0;
    
    // Determine linked programmes dynamically based on CDM observations
    const programmes = [];
    if (isPreg) {
      programmes.push('PMMVY (Maternity Benefit)', 'PMSMA (Fixed-Day ANC)', 'JSY (Safe Motherhood)', 'POSHAN 2.0 (Supplementary Nutrition)');
    }
    if (childCount > 0) {
      programmes.push('UIP (Childhood Immunization)', 'RBSK (Child Screening 4Ds)');
    }
    programmes.push('AB-PMJAY (INR 5 Lakh Secondary/Tertiary Cover)', 'AAM-CPHC (Comprehensive Primary Care)');

    return {
      schema_type: 'Demo Programme Schema - Public Health Schemes & Welfare Register',
      disclaimer: 'Synthetic demonstration format only. Not affiliated with any official government portal.',
      programme_report_code: `PR-REP-${cdm.household_id}-${new Date().getFullYear()}`,
      household_id: cdm.household_id,
      beneficiary_name: cdm.person.name,
      beneficiary_role: isPreg ? 'Maternal Beneficiary' : 'Household Member',
      linked_national_programmes: programmes,
      eligibility_determination: 'Reported — Awaiting Formal Administrative Verification',
      benefit_delivery_status: isPreg ? 'Instalment 1 Processed; Nutritious Rations Active' : 'Universal Primary Healthcare Active',
      essential_supplies_linked: isPreg ? 'Red IFA Tablets (AMB), Calcium Supplements' : 'ORS & Zinc, First Aid Buffer',
      scheduled_programme_followup: cdm.encounter_meta?.follow_up_date || '2026-10-02',
      supervisory_signoff_status: 'PENDING_ANM_REVIEW',
      frontline_reporting_asha: cdm.created_by || 'Lata Devi (ASHA-TS-042)',
      legal_safety_notice: 'Non-diagnostic frontline record. Scheme benefits subject to competent government authority review.'
    };
  }
}

