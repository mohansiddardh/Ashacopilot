/**
 * ASHA Copilot 2.0 - Offline Storage, Realtime Autosave & Multi-Entity Database
 * Problem Statement PS-H02: "One Worker, Five Systems"
 * 
 * Manages:
 * - Encounters, Households, Timeline, Audit Logs, and Sync Queue
 * - Realtime debounced autosave with visual status transitions:
 *   ● Saving... -> ✓ Saved locally -> ☁ Synced
 * - Offline-first caching with central cloud sync simulation
 * - Role-Based Access Control (ASHA, ANM, Admin)
 */

import { DEMO_HOUSEHOLDS, SEED_TIMELINE_H001, SYSTEM_ROLES, createCommonRecord } from './models.js';
import { SchemaMappingEngine } from './schema-mapper.js';

const STORAGE_KEYS = {
  ENCOUNTERS: 'asha_db_encounters_v2',
  TIMELINE: 'asha_db_timeline_v2',
  AUDIT_LOGS: 'asha_db_audit_logs_v2',
  SYNC_QUEUE: 'asha_db_sync_queue_v2',
  ACTIVE_ROLE: 'asha_db_active_role_v2',
  IS_ONLINE: 'asha_db_is_online_v2',
  DRAFT_LIVE: 'asha_db_draft_live_v2'
};

export class StorageSyncManager {
  constructor(onStateChanged) {
    this.onStateChanged = onStateChanged || (() => {});
    
    // Online/Offline status
    const savedStatus = localStorage.getItem(STORAGE_KEYS.IS_ONLINE);
    this.isOnline = savedStatus !== null ? JSON.parse(savedStatus) : true;

    // Active Role
    const savedRole = localStorage.getItem(STORAGE_KEYS.ACTIVE_ROLE);
    this.activeRole = savedRole || 'ASHA';

    // Autosave debouncer timer
    this.autosaveTimer = null;
    this.onAutosaveStatusChange = () => {};

    this.seedDatabaseIfEmpty();
  }

  setRole(roleKey) {
    if (SYSTEM_ROLES[roleKey]) {
      this.activeRole = roleKey;
      localStorage.setItem(STORAGE_KEYS.ACTIVE_ROLE, roleKey);
      this.logAudit('ROLE_SWITCH', `Switched active session to ${SYSTEM_ROLES[roleKey].title}`);
      this.notify();
    }
  }

  getCurrentUser() {
    return SYSTEM_ROLES[this.activeRole] || SYSTEM_ROLES.ASHA;
  }

  seedDatabaseIfEmpty() {
    const existing = this.getAllEncounters();
    if (existing.length === 0) {
      // 1. Seed Initial Encounters
      const sample1 = createCommonRecord({
        householdId: 'H001',
        personName: 'Sita',
        age: 24,
        isPregnant: true,
        gestationalAgeWeeks: 20,
        childrenCount: 1,
        childName: 'Aarav',
        vaccinations: ['BCG', 'OPV-0', 'OPV-1'],
        symptoms: ['None'],
        vitals: { bp: '118/76', temperature: 98.4, spo2: 99 },
        followUpRequired: false,
        source: 'VOICE',
        notes: 'Second routine ANC. Fetal heart sounds audible. Child up to date with birth doses.',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        createdBy: 'Lata Devi (ASHA)'
      });
      const outputs1 = SchemaMappingEngine.transformAll(sample1);

      const sample2 = createCommonRecord({
        householdId: 'H019',
        personName: 'Meena Sharma',
        age: 26,
        isPregnant: true,
        gestationalAgeWeeks: 28,
        childrenCount: 1,
        vaccinations: ['BCG', 'OPV-0', 'OPV-1', 'Pentavalent-1'],
        symptoms: ['None'],
        vitals: { bp: '122/80', temperature: 98.6, spo2: 98 },
        followUpRequired: false,
        source: 'FORM',
        notes: 'Routine 3rd trimester check. Blood pressure stable.',
        timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
        createdBy: 'Lata Devi (ASHA)'
      });
      const outputs2 = SchemaMappingEngine.transformAll(sample2);

      const seeded = [
        { id: sample1.encounter_id, commonRecord: sample1, outputs: outputs1, syncStatus: 'synced', savedAt: sample1.timestamp },
        { id: sample2.encounter_id, commonRecord: sample2, outputs: outputs2, syncStatus: 'synced', savedAt: sample2.timestamp }
      ];

      localStorage.setItem(STORAGE_KEYS.ENCOUNTERS, JSON.stringify(seeded));
      localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify([]));

      // 2. Seed Timeline
      localStorage.setItem(STORAGE_KEYS.TIMELINE, JSON.stringify(SEED_TIMELINE_H001));

      // 3. Seed Audit Logs
      const initialLogs = [
        { id: 'LOG-01', timestamp: new Date(Date.now() - 3600000 * 24).toISOString(), user: 'Lata Devi (ASHA)', role: 'ASHA', action: 'SESSION_START', details: 'Field login at Rampur Sub-Centre' },
        { id: 'LOG-02', timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), user: 'Lata Devi (ASHA)', role: 'ASHA', action: 'ENCOUNTER_SAVED', details: 'Created encounter ENC-001 for Sita (H001) via Voice Mode' },
        { id: 'LOG-03', timestamp: new Date(Date.now() - 3600000 * 1).toISOString(), user: 'Sarojini Rao (ANM)', role: 'ANM', action: 'RECORD_VERIFIED', details: 'Verified Maternal & UIP Register entries for H001' }
      ];
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(initialLogs));
    }
  }

  setOnlineStatus(status) {
    this.isOnline = Boolean(status);
    localStorage.setItem(STORAGE_KEYS.IS_ONLINE, JSON.stringify(this.isOnline));
    this.logAudit('NETWORK_CHANGE', this.isOnline ? 'Switched to Online mode (Central Sync connected)' : 'Switched to Offline mode (Local buffer active)');
    this.notify();
    return this.isOnline;
  }

  toggleOnlineStatus() {
    return this.setOnlineStatus(!this.isOnline);
  }

  getAllEncounters() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ENCOUNTERS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading encounters', e);
      return [];
    }
  }

  getSyncQueue() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading sync queue', e);
      return [];
    }
  }

  getTimeline(householdId = 'ALL') {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TIMELINE);
      const list = data ? JSON.parse(data) : [];
      if (!householdId || householdId === 'ALL') {
        return list;
      }
      return list.filter(e => e.householdId === householdId);
    } catch (e) {
      console.error('Error reading timeline', e);
      return [];
    }
  }

  /**
   * Returns unique household profiles aggregated from encounters and timeline records
   */
  getHouseholdsList() {
    const encounters = this.getAllEncounters();
    const map = new Map();

    // Scan all encounters
    encounters.forEach(enc => {
      const cdm = enc.commonRecord;
      const hid = cdm.household_id || 'H001';
      if (!map.has(hid)) {
        map.set(hid, {
          householdId: hid,
          personName: cdm.person.name,
          age: cdm.person.age,
          gender: cdm.person.gender,
          phone: cdm.person.phone,
          address: cdm.person.address,
          isPregnant: cdm.maternal?.is_pregnant ?? cdm.person.pregnancy_status,
          gestationalAgeWeeks: cdm.maternal?.gestational_age_weeks ?? cdm.person.gestational_age_weeks,
          childrenCount: cdm.household?.children_count ?? cdm.children?.count ?? 0,
          encountersCount: 1,
          latestDate: enc.savedAt,
          encounters: [enc]
        });
      } else {
        const item = map.get(hid);
        item.encountersCount += 1;
        item.encounters.push(enc);
      }
    });

    // Also scan timeline records to ensure seeded profiles exist
    const timeline = this.getTimeline('ALL');
    timeline.forEach(tl => {
      const hid = tl.householdId;
      if (hid && !map.has(hid)) {
        map.set(hid, {
          householdId: hid,
          personName: tl.personName || 'Beneficiary',
          age: 24,
          gender: 'Female',
          phone: '9848012345 (Synthetic)',
          address: 'Village Rampur',
          isPregnant: true,
          gestationalAgeWeeks: 20,
          childrenCount: 1,
          encountersCount: 1,
          latestDate: tl.date,
          encounters: []
        });
      }
    });

    return Array.from(map.values());
  }

  getAuditLogs() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading audit logs', e);
      return [];
    }
  }

  logAudit(action, details) {
    return this.logAuditEvent({ action, details });
  }

  logAuditEvent(eventObj) {
    try {
      if (typeof eventObj === 'string') {
        return this.logAuditEvent({ action: eventObj, details: arguments[1] || '' });
      }
      const logs = this.getAuditLogs();
      const currentUser = this.getCurrentUser();
      const entry = {
        id: `LOG-${Date.now().toString().slice(-5)}`,
        timestamp: new Date().toISOString(),
        user: eventObj.user || currentUser.defaultUser,
        role: eventObj.role || currentUser.id,
        action: eventObj.action || 'SYSTEM_ACTION',
        details: eventObj.details || ''
      };
      logs.unshift(entry);
      if (logs.length > 50) logs.pop();
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
      this.notify();
    } catch (e) {
      console.error('Error writing audit log', e);
    }
  }

  /**
   * Deletes an individual encounter registration
   */
  deleteEncounter(encounterId) {
    let encounters = this.getAllEncounters();
    const target = encounters.find(e => e.id === encounterId);
    if (!target) return { success: false, message: 'Encounter not found' };

    const personName = target.commonRecord?.person?.name || 'Beneficiary';
    const householdId = target.commonRecord?.household_id || 'H001';

    encounters = encounters.filter(e => e.id !== encounterId);
    localStorage.setItem(STORAGE_KEYS.ENCOUNTERS, JSON.stringify(encounters));

    let queue = this.getSyncQueue();
    queue = queue.filter(e => e.id !== encounterId);
    localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));

    let timeline = this.getTimeline('ALL');
    timeline = timeline.filter(t => t.encounterId !== encounterId);
    localStorage.setItem(STORAGE_KEYS.TIMELINE, JSON.stringify(timeline));

    this.logAudit('ENCOUNTER_DELETED', `Deleted encounter ${encounterId} for ${personName} (${householdId})`);
    this.notify();
    return { success: true, personName, householdId };
  }

  /**
   * Deletes an entire household profile registration and all its records
   */
  deleteHouseholdProfile(householdId) {
    let encounters = this.getAllEncounters();
    const removedEncounters = encounters.filter(e => e.commonRecord?.household_id === householdId);
    encounters = encounters.filter(e => e.commonRecord?.household_id !== householdId);
    localStorage.setItem(STORAGE_KEYS.ENCOUNTERS, JSON.stringify(encounters));

    let queue = this.getSyncQueue();
    queue = queue.filter(e => e.commonRecord?.household_id !== householdId);
    localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));

    let timeline = this.getTimeline('ALL');
    timeline = timeline.filter(t => t.householdId !== householdId);
    localStorage.setItem(STORAGE_KEYS.TIMELINE, JSON.stringify(timeline));

    this.logAudit('PROFILE_DELETED', `Deleted complete household profile registration for ${householdId} (${removedEncounters.length} encounters removed)`);
    this.notify();
    return { success: true, householdId, removedCount: removedEncounters.length };
  }

  /**
   * Saves a new or finalized encounter
   */
  saveEncounter(commonRecord, outputs) {
    const encounters = this.getAllEncounters();
    const queue = this.getSyncQueue();

    const isCurrentlyOnline = this.isOnline;
    const syncStatus = isCurrentlyOnline ? 'SYNCED' : 'PENDING_SYNC';
    commonRecord.sync_status = syncStatus;

    const newEntry = {
      id: commonRecord.encounter_id,
      commonRecord: commonRecord,
      outputs: outputs,
      syncStatus: isCurrentlyOnline ? 'synced' : 'pending_sync',
      savedAt: new Date().toISOString()
    };

    encounters.unshift(newEntry);
    localStorage.setItem(STORAGE_KEYS.ENCOUNTERS, JSON.stringify(encounters));

    if (!isCurrentlyOnline) {
      queue.unshift(newEntry);
      localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
    }

    // Append to household timeline with explicit householdId, personName, and encounterId
    const isPreg = commonRecord.maternal?.is_pregnant ?? commonRecord.person.pregnancy_status;
    const weeks = commonRecord.maternal?.gestational_age_weeks ?? commonRecord.person.gestational_age_weeks;
    const pregDetail = isPreg ? `Gestation: ${weeks || 0} weeks` : 'Non-pregnant';
    const childDetail = commonRecord.children?.count > 0 ? `${commonRecord.children.count} Child (${commonRecord.children.recorded_vaccines?.join(', ') || 'None'})` : '0 Children';

    this.addTimelineEvent({
      householdId: commonRecord.household_id,
      personName: commonRecord.person.name,
      encounterId: commonRecord.encounter_id,
      title: `Household Encounter: ${commonRecord.person.name}`,
      author: commonRecord.created_by,
      role: this.activeRole,
      summary: `Encounter captured via ${commonRecord.source}. Generated 3 Programme Schemas (Maternal, UIP, Household Register). ${pregDetail} • ${childDetail}.`,
      badge: isPreg ? 'Maternal & Child' : 'Household Surveillance'
    });

    this.logAudit('ENCOUNTER_SAVED', `Encounter ${commonRecord.encounter_id} for ${commonRecord.person.name} (${commonRecord.household_id}) via ${commonRecord.source}`);

    this.notify();
    return {
      entry: newEntry,
      savedOffline: !isCurrentlyOnline,
      queueCount: queue.length
    };
  }

  addTimelineEvent({ householdId = 'H001', personName = '', encounterId = '', title, author, role, summary, badge }) {
    try {
      const timeline = this.getTimeline('ALL');
      const event = {
        id: `TL-${Date.now().toString().slice(-4)}`,
        householdId: householdId,
        personName: personName,
        encounterId: encounterId,
        date: new Date().toISOString().split('T')[0],
        title: title,
        author: author || this.getCurrentUser().defaultUser,
        role: role || this.activeRole,
        summary: summary,
        badge: badge || 'Home Visit'
      };
      timeline.unshift(event);
      localStorage.setItem(STORAGE_KEYS.TIMELINE, JSON.stringify(timeline));
    } catch (e) {
      console.error('Error adding timeline event', e);
    }
  }

  /**
   * Realtime Debounced Autosave (for Live Capture mode)
   * Status transitions: saving -> saved_local -> synced
   */
  triggerLiveAutosave(draftData, onStatusChange) {
    if (this.autosaveTimer) {
      clearTimeout(this.autosaveTimer);
    }

    if (onStatusChange) {
      onStatusChange('saving', '● Saving...');
    }

    this.autosaveTimer = setTimeout(() => {
      // 1. Save draft to local storage
      localStorage.setItem(STORAGE_KEYS.DRAFT_LIVE, JSON.stringify({
        data: draftData,
        lastSaved: new Date().toISOString()
      }));

      // 2. Status transition: saved locally
      if (onStatusChange) {
        onStatusChange('saved_local', '✓ Saved locally');
      }

      // 3. If online, simulate fast background sync to cloud
      if (this.isOnline) {
        setTimeout(() => {
          if (onStatusChange) {
            onStatusChange('synced', '☁ Synced');
          }
        }, 500);
      } else {
        if (onStatusChange) {
          onStatusChange('offline_saved', '⚠ Offline - Saved locally');
        }
      }
    }, 400); // 400ms debounce
  }

  getLiveDraft() {
    try {
      const d = localStorage.getItem(STORAGE_KEYS.DRAFT_LIVE);
      return d ? JSON.parse(d) : null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Simulates synchronizing pending offline records
   */
  async syncPendingRecords(onProgress) {
    const queue = this.getSyncQueue();
    if (queue.length === 0) {
      return { count: 0, message: 'All encounters already synchronized.' };
    }

    if (onProgress) onProgress('Connecting to Primary Health Centre sync gateway...');
    await new Promise(r => setTimeout(r, 600));

    if (onProgress) onProgress(`Transferring ${queue.length} buffered encounters to central database...`);
    await new Promise(r => setTimeout(r, 900));

    const encounters = this.getAllEncounters();
    const syncedIds = new Set(queue.map(q => q.id));

    const updatedEncounters = encounters.map(item => {
      if (syncedIds.has(item.id)) {
        return {
          ...item,
          syncStatus: 'synced',
          syncedAt: new Date().toISOString()
        };
      }
      return item;
    });

    localStorage.setItem(STORAGE_KEYS.ENCOUNTERS, JSON.stringify(updatedEncounters));
    localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify([]));

    this.logAudit('SYNC_COMPLETED', `Synchronized ${queue.length} pending offline encounters to Central Registry`);

    if (onProgress) onProgress('Synchronization complete.');

    this.notify();
    return {
      count: queue.length,
      syncedIds: Array.from(syncedIds),
      message: `${queue.length} encounter${queue.length > 1 ? 's' : ''} synchronized successfully.`
    };
  }

  notify() {
    this.onStateChanged({
      isOnline: this.isOnline,
      activeRole: this.activeRole,
      currentUser: this.getCurrentUser(),
      totalEncounters: this.getAllEncounters().length,
      pendingSyncCount: this.getSyncQueue().length,
      timeline: this.getTimeline(),
      auditLogs: this.getAuditLogs()
    });
  }
}
