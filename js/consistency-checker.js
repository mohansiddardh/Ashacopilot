/**
 * ASHA Copilot 2.0 - Data Consistency & Quality Engine
 * Problem Statement PS-H02: "One Worker, Five Systems"
 * 
 * Lightweight rule-based validation detecting contradictory or incomplete demo data.
 * SAFETY RULE: This is a data-quality verification system, NOT a medical diagnosis system.
 */

export class ConsistencyChecker {
  /**
   * Evaluates an encounter record and returns data-quality verification flags.
   */
  static validate(data, existingProfiles = []) {
    const issues = [];

    const person = data.person || data;
    const name = person.name || person.personName || '';
    const age = Number(person.age);
    const isPregnant = Boolean(person.pregnancy_status ?? person.isPregnant ?? data.maternal?.is_pregnant);
    const weeks = Number(person.gestational_age_weeks ?? person.gestationalAgeWeeks ?? data.maternal?.gestational_age_weeks) || 0;
    const childrenCount = Number(data.children?.count ?? data.childrenCount ?? data.household?.children_count) || 0;
    const vaccines = data.children?.recorded_vaccines ?? data.vaccinations ?? [];
    const symptoms = data.observations?.reported_symptoms ?? data.symptoms ?? [];
    const vitals = data.observations?.vitals ?? data.vitals ?? {};

    // 1. Missing Required Beneficiary Name
    if (!name.trim()) {
      issues.push({
        id: 'missing-name',
        field: 'name',
        severity: 'error',
        title: 'Missing Beneficiary Name',
        message: 'Please provide the person\'s name before submitting.',
        action: 'Enter name'
      });
    }

    // 2. Invalid or Out of Range Age
    if (isNaN(age) || age <= 0 || age > 115) {
      issues.push({
        id: 'invalid-age',
        field: 'age',
        severity: 'error',
        title: 'Unusual Age Value',
        message: 'Age must be a valid positive number between 1 and 115. Please verify this information.',
        action: 'Review age'
      });
    }

    // 3. Pregnancy Contradiction: Marked "Not Pregnant" but Gestation > 0
    if (!isPregnant && weeks > 0) {
      issues.push({
        id: 'contradictory-pregnancy-weeks',
        field: 'gestational_age_weeks',
        severity: 'warning',
        title: 'Contradictory Pregnancy Data',
        message: `Beneficiary is marked "Not Pregnant", but gestational duration of ${weeks} weeks was entered. Please verify this information.`,
        action: 'Ensure pregnancy toggle matches gestational weeks'
      });
    }

    // 4. Pregnancy Marked "Yes" but Gestation Missing
    if (isPregnant && weeks <= 0) {
      issues.push({
        id: 'missing-gestational-weeks',
        field: 'gestational_age_weeks',
        severity: 'info',
        title: 'Gestational Age Incomplete',
        message: 'Pregnancy status is marked YES, but gestational weeks are unrecorded. Please check LMP date with the mother.',
        action: 'Add gestational weeks'
      });
    }

    // 5. Prolonged Gestation (> 42 weeks)
    if (isPregnant && weeks > 42) {
      issues.push({
        id: 'gestational-over-term',
        field: 'gestational_age_weeks',
        severity: 'warning',
        title: 'Prolonged Gestational Duration',
        message: `Gestational age of ${weeks} weeks exceeds typical human gestation (37-42 weeks). Please verify this information.`,
        action: 'Confirm estimated delivery calculation'
      });
    }

    // 6. Maternal Age Parameters (Outside standard 15-49)
    if (isPregnant && (age < 15 || age > 50)) {
      issues.push({
        id: 'unusual-maternal-age',
        field: 'age',
        severity: 'warning',
        title: 'Unusual Maternal Age Entry',
        message: `Beneficiary age of ${age} years is outside standard reproductive parameters (15-49). Please verify this information.`,
        action: 'Verify birth year on official records'
      });
    }

    // 7. Child Vaccines Selected when Child Count is Zero
    if (childrenCount === 0 && vaccines.length > 0) {
      issues.push({
        id: 'vaccines-zero-children',
        field: 'childrenCount',
        severity: 'warning',
        title: 'Contradictory Immunisation Entry',
        message: `Child vaccines (${vaccines.join(', ')}) are selected, but total children count is recorded as 0. Please verify dependent count.`,
        action: 'Update child count or clear vaccine selections'
      });
    }

    // 8. Vitals Quality Check
    if (vitals.spo2 && (vitals.spo2 > 100 || vitals.spo2 < 50)) {
      issues.push({
        id: 'invalid-spo2',
        field: 'spo2',
        severity: 'warning',
        title: 'SpO2 Measurement Out of Range',
        message: `Entered SpO2 value of ${vitals.spo2}% is invalid. Normal pulse oximeter range is 50-100%.`,
        action: 'Re-enter SpO2 value'
      });
    }

    // 9. Severe Symptoms Without Follow-up Flag
    const hasSevereSymptoms = symptoms.some(s => ['Severe Headache', 'Swelling of hands/feet', 'Fever'].includes(s));
    const followUp = Boolean(data.encounter_meta?.follow_up_required ?? data.followUpRequired);
    if (hasSevereSymptoms && !followUp) {
      issues.push({
        id: 'symptoms-no-followup',
        field: 'followUpRequired',
        severity: 'info',
        title: 'Follow-up Recommended',
        message: 'Observations noted acute symptoms, but follow-up is not marked. Consider scheduling a revisit.',
        action: 'Enable follow-up toggle'
      });
    }

    // 10. Duplicate-Person Detection (Name + Age + Household Fuzzy Match)
    let duplicateMatch = null;
    if (Array.isArray(existingProfiles) && existingProfiles.length > 0) {
      duplicateMatch = this.detectDuplicateBeneficiary(data, existingProfiles);
      if (duplicateMatch) {
        issues.push({
          id: 'potential-duplicate-person',
          field: 'name',
          severity: 'warning',
          title: `Potential Duplicate Beneficiary (${duplicateMatch.matchScore}% Match)`,
          message: `Beneficiary "${duplicateMatch.existingName}" matches existing record in Household ${duplicateMatch.existingHouseholdId} (${duplicateMatch.existingPersonId}) captured previously by ${duplicateMatch.lastAsha}. Select whether the CDM merges this into the existing longitudinal timeline or creates a distinct record.`,
          action: 'Select CDM Merge or Distinct resolution',
          duplicateData: duplicateMatch
        });
      }
    }

    return {
      isValid: issues.filter(i => i.severity === 'error').length === 0,
      hasWarnings: issues.some(i => i.severity === 'warning'),
      issues: issues,
      duplicateMatch: duplicateMatch,
      disclaimer: 'Prototype quality check only. This system detects conflicting documentation inputs and does NOT provide clinical diagnosis or medical treatment.'
    };
  }

  /**
   * Normalizes a name by stripping Indian titles/honorifics and non-alphanumeric chars.
   */
  static normalizeName(name) {
    if (!name) return { rawClean: '', stemmed: '', tokens: [] };
    const clean = String(name).toLowerCase()
      .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Strip common Indian titles / honorific suffixes
    const honorifics = ['devi', 'bai', 'kumari', 'ben', 'sharma', 'rao', 'reddy', 'singh', 'kaur', 'patel', 'begum', 'khatun', 'mrs', 'miss', 'smt', 'sri'];
    const words = clean.split(' ').filter(w => w && !honorifics.includes(w));
    return {
      rawClean: clean,
      stemmed: words.join(' ') || clean,
      tokens: words.length > 0 ? words : clean.split(' ')
    };
  }

  /**
   * Computes Levenshtein distance between two strings
   */
  static levenshtein(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }

  /**
   * Compares candidate beneficiary against existing registry profiles to detect duplicate captures
   * across different ASHAs or visits.
   */
  static detectDuplicateBeneficiary(candidate, existingProfiles = []) {
    if (!candidate || !Array.isArray(existingProfiles) || existingProfiles.length === 0) return null;

    const candName = (candidate.name || candidate.personName || candidate.person?.name || '').trim();
    if (!candName || candName.length < 2) return null;

    const candNorm = this.normalizeName(candName);
    const candAge = Number(candidate.age ?? candidate.person?.age);
    const candHh = (candidate.householdId || candidate.household_id || candidate.household?.id || '').trim().toUpperCase();

    let bestMatch = null;
    let highestScore = 0;

    for (const profile of existingProfiles) {
      const profName = (profile.name || '').trim();
      const profNorm = this.normalizeName(profName);
      const profAge = Number(profile.age);
      const profHh = (profile.householdId || '').trim().toUpperCase();

      // 1. Name Match Score
      let nameScore = 0;
      const reasons = [];

      if (candNorm.rawClean === profNorm.rawClean) {
        nameScore = 1.0;
        reasons.push(`Exact name match ("${profName}")`);
      } else if (candNorm.stemmed === profNorm.stemmed && candNorm.stemmed.length >= 3) {
        nameScore = 0.95;
        reasons.push(`Core name stem match ("${candNorm.stemmed}")`);
      } else {
        // Check token intersection (e.g. "Sita" in "Sita Devi")
        const tokenOverlap = candNorm.tokens.filter(t => profNorm.tokens.includes(t));
        if (tokenOverlap.length > 0) {
          nameScore = 0.90;
          reasons.push(`Name token overlap ("${tokenOverlap.join(', ')}")`);
        } else if (candNorm.rawClean.includes(profNorm.rawClean) || profNorm.rawClean.includes(candNorm.rawClean)) {
          nameScore = 0.85;
          reasons.push(`Name substring inclusion ("${profName}")`);
        } else {
          // Levenshtein fuzzy test
          const dist = this.levenshtein(candNorm.stemmed, profNorm.stemmed);
          const maxLen = Math.max(candNorm.stemmed.length, profNorm.stemmed.length);
          if (maxLen >= 4 && dist <= 2) {
            nameScore = Math.max(0.70, 1 - (dist / maxLen));
            reasons.push(`Fuzzy phonetics / typo tolerance (~${Math.round(nameScore * 100)}% match)`);
          }
        }
      }

      if (nameScore < 0.65) continue; // Not a plausible name match

      // 2. Age Match Score
      let ageScore = 0.5; // neutral if age not provided
      if (!isNaN(candAge) && candAge > 0 && !isNaN(profAge) && profAge > 0) {
        const ageDiff = Math.abs(candAge - profAge);
        if (ageDiff === 0) {
          ageScore = 1.0;
          reasons.push(`Exact age match (${profAge} yrs)`);
        } else if (ageDiff <= 1) {
          ageScore = 0.90;
          reasons.push(`Age matched within 1 year (${candAge} vs ${profAge} yrs)`);
        } else if (ageDiff <= 2) {
          ageScore = 0.75;
          reasons.push(`Age within ±2 yrs tolerance (${candAge} vs ${profAge} yrs)`);
        } else {
          ageScore = 0.15; // notable age discrepancy
        }
      }

      // 3. Household Match Score
      let hhScore = 0.35; // neutral default
      if (candHh && profHh) {
        if (candHh === profHh) {
          hhScore = 1.0;
          reasons.push(`Same household record (${profHh})`);
        } else {
          hhScore = 0.20; // cross-household / relocation
        }
      }

      // Composite Score: Name (55%), Age (25%), Household (20%)
      const totalScore = (nameScore * 0.55) + (ageScore * 0.25) + (hhScore * 0.20);
      const matchPercentage = Math.round(totalScore * 100);

      // Require high confidence or strong name + (age or household)
      if (matchPercentage >= 70 && matchPercentage > highestScore) {
        highestScore = matchPercentage;
        bestMatch = {
          isDuplicate: true,
          matchScore: matchPercentage,
          matchedProfile: profile,
          reasons: reasons,
          existingPersonId: profile.personId,
          existingName: profile.name,
          existingAge: profile.age,
          existingHouseholdId: profile.householdId,
          lastAsha: profile.healthTimeline?.[0]?.actor || 'Lata Devi (ASHA-TS-042)',
          lastEncounterDate: profile.healthTimeline?.[0]?.date || '2026-09-05',
          encounterCount: (profile.healthTimeline?.length || 1)
        };
      }
    }

    return bestMatch;
  }
}
