/**
 * ASHA Copilot 2.0 - Central Application Orchestrator
 * Problem Statement PS-H02: "One Worker, Five Systems"
 * 
 * Manages:
 * - 3 Input Capture Modes: Standard Form, Voice Studio ("ASHA Bol"), Realtime Live Autosave
 * - Multilingual Voice Recognition & Entity Extractor (English, Telugu, Hindi)
 * - Household Timeline & Audit Governance Trail
 * - Role-Based Access Control (ASHA, ANM, Admin)
 * - Schema Transformation Engine & Offline Sync
 */

import { VACCINES_CATALOG, SYMPTOMS_CATALOG, DEMO_HOUSEHOLDS, SYSTEM_ROLES, createCommonRecord } from './models.js';
import { SchemaMappingEngine } from './schema-mapper.js';
import { ConsistencyChecker } from './consistency-checker.js';
import { VoiceCaptureEngine } from './voice-extractor.js';
import { StorageSyncManager } from './storage-sync.js';
import { i18n } from './i18n.js';
import { documentStore } from './document-store.js';
import { userManager } from './user-manager.js';
import { diagnosticManager } from './diagnostic-profile.js';
import { familyManager } from './family-manager.js';
import { programmeManager, PROGRAMME_CATEGORIES } from './programme-manager.js';

class AshaCopilotApp {
  constructor() {
    this.currentView = 'dashboard';
    this.currentCaptureMode = 'voice'; // 'form' | 'voice' | 'live'
    this.currentOutputData = null;
    this.activeSchemaTab = 'maternal';
    this.outputViewMode = 'card';
    this.isRecording = false;

    // Selected pills state for form mode
    this.selectedVaccines = new Set();
    this.selectedSymptoms = new Set();

    // Diagnostic & Document State
    this.activeDiagnosticPersonId = 'P-SIT-101';
    this.formAttachedFiles = [];
    this.checkupAttachedFiles = { blood: null, urine: null, other: null };
    this.activeDocViewerId = null;
    this.activeDoctorVerifTarget = null;

    // Family & Workload State
    this.activeFamilyId = 'F042';
    this.activeFamilyFilter = 'ALL';
    this.familySearchQuery = '';

    // Health Programmes & Schemes State
    this.selectedProgrammeCategory = 'All Categories';
    this.programmeSearchQuery = '';

    // Duplicate Beneficiary Detection & CDM Resolution State
    this.formSelectedDuplicateResolution = 'MERGE';
    this.formMatchedDuplicateProfileId = null;
    this.voiceSelectedDuplicateResolution = 'MERGE';
    this.voiceMatchedDuplicateProfileId = null;

    // Storage & Voice Subsystems
    this.storage = new StorageSyncManager((state) => this.onStorageStateChanged(state));
    this.voiceEngine = new VoiceCaptureEngine(
      (transcript) => this.onTranscriptUpdate(transcript),
      (status, message) => this.onVoiceStatusChange(status, message)
    );

    this.initDOM();
    this.bindEvents();
    this.renderInitialState();
  }

  initDOM() {
    // Header & Navigation
    this.appLanguageSelector = document.getElementById('appLanguageSelector');
    this.btnUserSessionTrigger = document.getElementById('btnUserSessionTrigger');
    this.sessionUserAvatar = document.getElementById('sessionUserAvatar');
    this.sessionUserName = document.getElementById('sessionUserName');
    this.roleSelector = document.getElementById('roleSelector');
    this.networkToggleBtn = document.getElementById('networkToggleBtn');
    this.networkDot = document.getElementById('networkDot');
    this.networkStatusLabel = document.getElementById('networkStatusLabel');
    this.offlineAlertBanner = document.getElementById('offlineAlertBanner');
    this.offlineQueueText = document.getElementById('offlineQueueText');
    this.triggerManualSyncBtn = document.getElementById('triggerManualSyncBtn');
    this.quickDemoBtn = document.getElementById('quickDemoBtn');
    this.brandHomeLink = document.getElementById('brandHomeLink');
    this.navTabBtns = document.querySelectorAll('.nav-tab-btn');
    this.tabViews = document.querySelectorAll('.tab-view');

    // Dashboard
    this.metricVisitsCount = document.getElementById('metricVisitsCount');
    this.metricRecordsCount = document.getElementById('metricRecordsCount');
    this.metricSyncCount = document.getElementById('metricSyncCount');
    this.metricSyncStatus = document.getElementById('metricSyncStatus');
    this.recentEncountersContainer = document.getElementById('recentEncountersContainer');
    this.heroVoiceBtn = document.getElementById('heroVoiceBtn');
    this.heroLiveBtn = document.getElementById('heroLiveBtn');
    this.heroFormBtn = document.getElementById('heroFormBtn');
    this.heroDemoLoadBtn = document.getElementById('heroDemoLoadBtn');

    // Capture Mode Tabs
    this.captureModeBtns = document.querySelectorAll('.capture-mode-btn');
    this.subviews = {
      form: document.getElementById('subview-form'),
      voice: document.getElementById('subview-voice'),
      live: document.getElementById('subview-live')
    };
    this.globalAutosaveStatus = document.getElementById('globalAutosaveStatus');

    // Voice Studio Elements & Pre-recording Consent Safeguard
    this.voiceLangSelect = document.getElementById('voiceLangSelect');
    this.voicePreRecordConsentToggle = document.getElementById('voicePreRecordConsentToggle');
    this.voiceConsentGuardBox = document.getElementById('voiceConsentGuardBox');
    this.micRecordBtn = document.getElementById('micRecordBtn');
    this.micStatusTitle = document.getElementById('micStatusTitle');
    this.micStatusHint = document.getElementById('micStatusHint');
    this.audioVisualizer = document.getElementById('audioVisualizer');
    this.voiceTranscriptInput = document.getElementById('voiceTranscriptInput');
    this.btnExtractEntities = document.getElementById('btnExtractEntities');
    this.btnClearVoice = document.getElementById('btnClearVoice');
    this.presetCards = document.querySelectorAll('.preset-card');

    // Confirmation Review Card
    this.extractionReviewCard = document.getElementById('extractionReviewCard');
    this.voiceConsistencyAlertContainer = document.getElementById('voiceConsistencyAlertContainer');
    this.revHouseholdId = document.getElementById('revHouseholdId');
    this.revName = document.getElementById('revName');
    this.revAge = document.getElementById('revAge');
    this.revPregnant = document.getElementById('revPregnant');
    this.revGestation = document.getElementById('revGestation');
    this.revChildren = document.getElementById('revChildren');
    this.revVaccines = document.getElementById('revVaccines');
    this.revSymptoms = document.getElementById('revSymptoms');
    this.revVitals = document.getElementById('revVitals');
    this.revFollowUp = document.getElementById('revFollowUp');
    this.voiceConsentCheckbox = document.getElementById('voiceConsentCheckbox');
    this.btnEditExtracted = document.getElementById('btnEditExtracted');
    this.btnConfirmExtracted = document.getElementById('btnConfirmExtracted');

    // Standard Form Elements
    this.formHouseholdId = document.getElementById('formHouseholdId');
    this.formPersonName = document.getElementById('formPersonName');
    this.formAge = document.getElementById('formAge');
    this.formGender = document.getElementById('formGender');
    this.formPhone = document.getElementById('formPhone');
    this.formHouseholdMembers = document.getElementById('formHouseholdMembers');
    this.formChildrenCount = document.getElementById('formChildrenCount');
    this.formElderlyCount = document.getElementById('formElderlyCount');
    this.formIsPregnant = document.getElementById('formIsPregnant');
    this.pregnantToggleLabel = document.getElementById('pregnantToggleLabel');
    this.gestationalGroup = document.getElementById('gestationalGroup');
    this.gravidaGroup = document.getElementById('gravidaGroup');
    this.formGestationalWeeks = document.getElementById('formGestationalWeeks');
    this.formGravida = document.getElementById('formGravida');
    this.formChildName = document.getElementById('formChildName');
    this.formChildAge = document.getElementById('formChildAge');
    this.vaccinesPillsCatalog = document.getElementById('vaccinesPillsCatalog');
    this.symptomsPillsCatalog = document.getElementById('symptomsPillsCatalog');
    this.formBp = document.getElementById('formBp');
    this.formTemp = document.getElementById('formTemp');
    this.formSpo2 = document.getElementById('formSpo2');
    this.formFollowUp = document.getElementById('formFollowUp');
    this.followUpToggleLabel = document.getElementById('followUpToggleLabel');
    this.formNotes = document.getElementById('formNotes');
    this.formConsentCheckbox = document.getElementById('formConsentCheckbox');
    this.formConsistencyAlertContainer = document.getElementById('formConsistencyAlertContainer');
    this.btnSubmitForm = document.getElementById('btnSubmitForm');
    this.formLoadSampleBtn = document.getElementById('formLoadSampleBtn');

    // Safety Verification & Supporting Documents Upload in Encounter Form
    this.formVerificationCard = document.getElementById('formVerificationCard');
    this.formDocCategory = document.getElementById('formDocCategory');
    this.formUploadFileInput = document.getElementById('formUploadFileInput');
    this.btnTriggerDocUpload = document.getElementById('btnTriggerDocUpload');
    this.formUploadFileLabel = document.getElementById('formUploadFileLabel');
    this.formAttachedFilesList = document.getElementById('formAttachedFilesList');

    // Live Autosave Mode Elements
    this.liveHouseholdId = document.getElementById('liveHouseholdId');
    this.liveHouseholdHeading = document.getElementById('liveHouseholdHeading');
    this.liveName = document.getElementById('liveName');
    this.liveAge = document.getElementById('liveAge');
    this.livePreg = document.getElementById('livePreg');
    this.liveGestation = document.getElementById('liveGestation');
    this.liveVaccines = document.getElementById('liveVaccines');
    this.liveSymptoms = document.getElementById('liveSymptoms');
    this.liveRealtimeBadge = document.getElementById('liveRealtimeBadge');
    this.btnFinalizeLive = document.getElementById('btnFinalizeLive');
    this.btnLiveLoadSindhu = document.getElementById('btnLiveLoadSindhu');
    this.liveFields = document.querySelectorAll('.live-field');

    // Output View Elements
    this.outputEncounterTitle = document.getElementById('outputEncounterTitle');
    this.schemaTabBtns = document.querySelectorAll('.schema-tab-btn');
    this.viewModeCardBtn = document.getElementById('viewModeCardBtn');
    this.viewModeJsonBtn = document.getElementById('viewModeJsonBtn');
    this.schemaCardView = document.getElementById('schemaCardView');
    this.schemaJsonView = document.getElementById('schemaJsonView');
    this.dispSchemaTitle = document.getElementById('dispSchemaTitle');
    this.dispSchemaCode = document.getElementById('dispSchemaCode');
    this.dispSchemaDesc = document.getElementById('dispSchemaDesc');
    this.dispFieldsTableBody = document.getElementById('dispFieldsTableBody');
    this.dispJsonCode = document.getElementById('dispJsonCode');
    this.btnCopyJson = document.getElementById('btnCopyJson');
    this.btnDownloadAllJson = document.getElementById('btnDownloadAllJson');
    this.btnNewEncounterFromOutput = document.getElementById('btnNewEncounterFromOutput');

    // Diagnostic Reports View Elements (Requirements 8-15)
    this.btnRefreshDiagnosticView = document.getElementById('btnRefreshDiagnosticView');
    this.personSearchInput = document.getElementById('personSearchInput');
    this.quickPersonSelect = document.getElementById('quickPersonSelect');
    this.btnOpenPersonProfile = document.getElementById('btnOpenPersonProfile');
    this.personProfileContentArea = document.getElementById('personProfileContentArea');
    this.btnTriggerAddAction = document.getElementById('btnTriggerAddAction');

    // Timeline & Audit Elements
    this.householdTimelineContainer = document.getElementById('householdTimelineContainer');
    this.btnRefreshTimeline = document.getElementById('btnRefreshTimeline');
    this.auditLogsTableBody = document.getElementById('auditLogsTableBody');
    this.timelineHouseholdSelect = document.getElementById('timelineHouseholdSelect');
    this.timelineProfileSummaryCard = document.getElementById('timelineProfileSummaryCard');
    this.profHeadIcon = document.getElementById('profHeadIcon');
    this.profHeadName = document.getElementById('profHeadName');
    this.profHeadStatus = document.getElementById('profHeadStatus');
    this.profHeadDetails = document.getElementById('profHeadDetails');
    this.btnTimelineNewVisit = document.getElementById('btnTimelineNewVisit');
    this.btnDeleteSelectedProfile = document.getElementById('btnDeleteSelectedProfile');
    this.btnDeleteCurrentProfileBtn = document.getElementById('btnDeleteCurrentProfileBtn');
    this.btnDeleteCurrentOutputRecord = document.getElementById('btnDeleteCurrentOutputRecord');
    this.selectedTimelineHousehold = 'ALL';

    // In-App Deletion Modal Elements
    this.deleteModalBackdrop = document.getElementById('deleteModalBackdrop');
    this.deleteModalTitle = document.getElementById('deleteModalTitle');
    this.deleteModalSubtitle = document.getElementById('deleteModalSubtitle');
    this.deleteModalBody = document.getElementById('deleteModalBody');
    this.btnConfirmDelete = document.getElementById('btnConfirmDelete');
    this.btnCancelDelete = document.getElementById('btnCancelDelete');
    this.btnCancelDeleteX = document.getElementById('btnCancelDeleteX');

    // Action Sheet Modal Elements (Requirement 10)
    this.addRecordModal = document.getElementById('addRecordModal');
    this.btnCloseAddRecordModal = document.getElementById('btnCloseAddRecordModal');
    this.actNewCheckup = document.getElementById('actNewCheckup');
    this.actDiagnosticResult = document.getElementById('actDiagnosticResult');
    this.actLabReport = document.getElementById('actLabReport');
    this.actClinicalReport = document.getElementById('actClinicalReport');
    this.actNewHealthFinding = document.getElementById('actNewHealthFinding');
    this.actFollowUp = document.getElementById('actFollowUp');
    this.actDocument = document.getElementById('actDocument');
    this.actObservation = document.getElementById('actObservation');

    // New Check-Up Form Modal Elements (Requirements 11-12)
    this.checkupFormModal = document.getElementById('checkupFormModal');
    this.btnCloseCheckupModal = document.getElementById('btnCloseCheckupModal');
    this.checkupPersonHeader = document.getElementById('checkupPersonHeader');
    this.checkupDate = document.getElementById('checkupDate');
    this.checkupConductedBy = document.getElementById('checkupConductedBy');
    this.checkupBp = document.getElementById('checkupBp');
    this.checkupHeartRate = document.getElementById('checkupHeartRate');
    this.checkupSpo2 = document.getElementById('checkupSpo2');
    this.checkupTemp = document.getElementById('checkupTemp');
    this.checkupHeight = document.getElementById('checkupHeight');
    this.checkupWeight = document.getElementById('checkupWeight');
    this.checkupBmiVal = document.getElementById('checkupBmiVal');
    this.checkupBmiCategory = document.getElementById('checkupBmiCategory');
    this.checkupBloodResult = document.getElementById('checkupBloodResult');
    this.checkupBloodFileInput = document.getElementById('checkupBloodFileInput');
    this.btnUploadBloodFile = document.getElementById('btnUploadBloodFile');
    this.checkupBloodFileLabel = document.getElementById('checkupBloodFileLabel');
    this.checkupUrineResult = document.getElementById('checkupUrineResult');
    this.checkupUrineFileInput = document.getElementById('checkupUrineFileInput');
    this.btnUploadUrineFile = document.getElementById('btnUploadUrineFile');
    this.checkupUrineFileLabel = document.getElementById('checkupUrineFileLabel');
    this.checkupOtherResult = document.getElementById('checkupOtherResult');
    this.checkupOtherFileInput = document.getElementById('checkupOtherFileInput');
    this.btnUploadOtherFile = document.getElementById('btnUploadOtherFile');
    this.checkupOtherFileLabel = document.getElementById('checkupOtherFileLabel');
    this.examLungs = document.getElementById('examLungs');
    this.examSkin = document.getElementById('examSkin');
    this.examThroat = document.getElementById('examThroat');
    this.examEyes = document.getElementById('examEyes');
    this.examEars = document.getElementById('examEars');
    this.examOther = document.getElementById('examOther');
    this.checkupObservations = document.getElementById('checkupObservations');
    this.checkupNewFinding = document.getElementById('checkupNewFinding');
    this.btnCancelCheckup = document.getElementById('btnCancelCheckup');
    this.btnSaveCheckup = document.getElementById('btnSaveCheckup');

    // Document Viewer Modal Elements (Requirement 15)
    this.documentViewerModal = document.getElementById('documentViewerModal');
    this.docViewerTitle = document.getElementById('docViewerTitle');
    this.docViewerMeta = document.getElementById('docViewerMeta');
    this.btnCloseDocViewer = document.getElementById('btnCloseDocViewer');
    this.docViewerContentContainer = document.getElementById('docViewerContentContainer');
    this.docViewerImage = document.getElementById('docViewerImage');
    this.docViewerStatusChip = document.getElementById('docViewerStatusChip');
    this.btnCloseDocViewerBtn = document.getElementById('btnCloseDocViewerBtn');
    this.btnDownloadCurrentDoc = document.getElementById('btnDownloadCurrentDoc');

    // Doctor Verification Modal Elements (Requirement 13)
    this.doctorVerificationModal = document.getElementById('doctorVerificationModal');
    this.btnCloseDoctorVerifModal = document.getElementById('btnCloseDoctorVerifModal');
    this.verifTargetTitle = document.getElementById('verifTargetTitle');
    this.verifTargetMeta = document.getElementById('verifTargetMeta');
    this.verifDoctorName = document.getElementById('verifDoctorName');
    this.verifDoctorNotes = document.getElementById('verifDoctorNotes');
    this.btnVerifClarify = document.getElementById('btnVerifClarify');
    this.btnVerifReject = document.getElementById('btnVerifReject');
    this.btnVerifApprove = document.getElementById('btnVerifApprove');

    // ASHA User Accounts Modal Elements (Requirements 16-18)
    this.userAuthModal = document.getElementById('userAuthModal');
    this.btnCloseUserAuthModal = document.getElementById('btnCloseUserAuthModal');
    this.tabUserSwitchBtn = document.getElementById('tabUserSwitchBtn');
    this.tabUserCreateBtn = document.getElementById('tabUserCreateBtn');
    this.panelUserSwitch = document.getElementById('panelUserSwitch');
    this.panelUserCreate = document.getElementById('panelUserCreate');
    this.usersListContainer = document.getElementById('usersListContainer');
    this.newFullName = document.getElementById('newFullName');
    this.newUsername = document.getElementById('newUsername');
    this.newPhone = document.getElementById('newPhone');
    this.newPassword = document.getElementById('newPassword');
    this.newRole = document.getElementById('newRole');
    this.newArea = document.getElementById('newArea');
    this.btnSubmitCreateUser = document.getElementById('btnSubmitCreateUser');

    // Calculator Elements
    this.sliderVisits = document.getElementById('sliderVisits');
    this.sliderAshas = document.getElementById('sliderAshas');
    this.sliderVisitsVal = document.getElementById('sliderVisitsVal');
    this.sliderAshasVal = document.getElementById('sliderAshasVal');
    this.calcHoursSaved = document.getElementById('calcHoursSaved');
    this.calcEntriesEliminated = document.getElementById('calcEntriesEliminated');

    // Family Report & Workload DOM Elements
    this.familyListContainer = document.getElementById('familyListContainer');
    this.familyDetailContainer = document.getElementById('familyDetailContainer');
    this.familySearchInput = document.getElementById('familySearchInput');
    this.familyFilterGroup = document.getElementById('familyFilterGroup');
    this.familyCardsGrid = document.getElementById('familyCardsGrid');
    this.familyDetailContentArea = document.getElementById('familyDetailContentArea');
    this.btnBackToFamilyList = document.getElementById('btnBackToFamilyList');
    this.btnOpenRegisterFamilyModal = document.getElementById('btnOpenRegisterFamilyModal');
    this.btnRefreshFamilyView = document.getElementById('btnRefreshFamilyView');
    this.progressContentArea = document.getElementById('progressContentArea');
    this.btnOpenEditTargetModal = document.getElementById('btnOpenEditTargetModal');
    this.btnOpenAssignFamilyModal = document.getElementById('btnOpenAssignFamilyModal');

    // Family & Target Modals (11 Modals)
    this.registerFamilyModal = document.getElementById('registerFamilyModal');
    this.btnCloseRegisterFamilyModal = document.getElementById('btnCloseRegisterFamilyModal');
    this.btnCancelRegisterFamily = document.getElementById('btnCancelRegisterFamily');
    this.btnSubmitRegisterFamily = document.getElementById('btnSubmitRegisterFamily');

    this.addFamilyMemberModal = document.getElementById('addFamilyMemberModal');
    this.btnCloseAddFamilyMemberModal = document.getElementById('btnCloseAddFamilyMemberModal');
    this.btnCancelAddFamilyMember = document.getElementById('btnCancelAddFamilyMember');
    this.btnSubmitAddFamilyMember = document.getElementById('btnSubmitAddFamilyMember');
    this.addMemberFamilySubtitle = document.getElementById('addMemberFamilySubtitle');

    this.addSchemeModal = document.getElementById('addSchemeModal');
    this.btnCloseAddSchemeModal = document.getElementById('btnCloseAddSchemeModal');
    this.btnCancelAddScheme = document.getElementById('btnCancelAddScheme');
    this.btnSubmitAddScheme = document.getElementById('btnSubmitAddScheme');
    this.schemeEligibleFor = document.getElementById('schemeEligibleFor');
    this.schemePersonSelectGroup = document.getElementById('schemePersonSelectGroup');
    this.schemeBeneficiaryPersonSelect = document.getElementById('schemeBeneficiaryPersonSelect');

    this.addSupplyModal = document.getElementById('addSupplyModal');
    this.btnCloseAddSupplyModal = document.getElementById('btnCloseAddSupplyModal');
    this.btnCancelAddSupply = document.getElementById('btnCancelAddSupply');
    this.btnSubmitAddSupply = document.getElementById('btnSubmitAddSupply');
    this.supplyProvidedTo = document.getElementById('supplyProvidedTo');
    this.supplyPersonSelectGroup = document.getElementById('supplyPersonSelectGroup');
    this.supplyBeneficiaryPersonSelect = document.getElementById('supplyBeneficiaryPersonSelect');

    this.addMedicineModal = document.getElementById('addMedicineModal');
    this.btnCloseAddMedicineModal = document.getElementById('btnCloseAddMedicineModal');
    this.btnCancelAddMedicine = document.getElementById('btnCancelAddMedicine');
    this.btnSubmitAddMedicine = document.getElementById('btnSubmitAddMedicine');
    this.medRecipientSelect = document.getElementById('medRecipientSelect');

    this.reportBirthModal = document.getElementById('reportBirthModal');
    this.btnCloseReportBirthModal = document.getElementById('btnCloseReportBirthModal');
    this.btnCancelReportBirth = document.getElementById('btnCancelReportBirth');
    this.btnSubmitReportBirth = document.getElementById('btnSubmitReportBirth');
    this.birthMotherSelect = document.getElementById('birthMotherSelect');

    this.reportDeathModal = document.getElementById('reportDeathModal');
    this.btnCloseReportDeathModal = document.getElementById('btnCloseReportDeathModal');
    this.btnCancelReportDeath = document.getElementById('btnCancelReportDeath');
    this.btnSubmitReportDeath = document.getElementById('btnSubmitReportDeath');
    this.deathPersonSelect = document.getElementById('deathPersonSelect');

    this.reportHealthEventModal = document.getElementById('reportHealthEventModal');
    this.btnCloseReportHealthEventModal = document.getElementById('btnCloseReportHealthEventModal');
    this.btnCancelReportHealthEvent = document.getElementById('btnCancelReportHealthEvent');
    this.btnSubmitReportHealthEvent = document.getElementById('btnSubmitReportHealthEvent');

    this.reportProgrammeModal = document.getElementById('reportProgrammeModal');
    this.btnCloseReportProgrammeModal = document.getElementById('btnCloseReportProgrammeModal');
    this.btnCancelReportProgramme = document.getElementById('btnCancelReportProgramme');
    this.btnSubmitReportProgramme = document.getElementById('btnSubmitReportProgramme');

    this.editTargetModal = document.getElementById('editTargetModal');
    this.btnCloseEditTargetModal = document.getElementById('btnCloseEditTargetModal');
    this.btnCancelEditTarget = document.getElementById('btnCancelEditTarget');
    this.btnSubmitEditTarget = document.getElementById('btnSubmitEditTarget');
    this.targetAllocatedInput = document.getElementById('targetAllocatedInput');

    this.assignFamilyModal = document.getElementById('assignFamilyModal');
    this.btnCloseAssignFamilyModal = document.getElementById('btnCloseAssignFamilyModal');
    this.btnCancelAssignFamily = document.getElementById('btnCancelAssignFamily');
    this.btnSubmitAssignFamily = document.getElementById('btnSubmitAssignFamily');
    this.assignFamilySelect = document.getElementById('assignFamilySelect');
    this.assignAshaSelect = document.getElementById('assignAshaSelect');

    // Health Programmes & Schemes Elements
    this.navTabProgrammes = document.getElementById('navTabProgrammes');
    this.viewProgrammes = document.getElementById('view-programmes');
    this.programmeSearchInput = document.getElementById('programmeSearchInput');
    this.programmeCategoryFilters = document.getElementById('programmeCategoryFilters');
    this.programmesCardsGrid = document.getElementById('programmesCardsGrid');
    this.programmeKpiGrid = document.getElementById('programmeKpiGrid');
    this.btnAdminAddProgramme = document.getElementById('btnAdminAddProgramme');
    this.btnRefreshProgrammesView = document.getElementById('btnRefreshProgrammesView');

    // Programme Modals
    this.programmeDetailModal = document.getElementById('programmeDetailModal');
    this.btnCloseProgrammeDetailModal = document.getElementById('btnCloseProgrammeDetailModal');
    this.btnCloseProgDetailFooter = document.getElementById('btnCloseProgDetailFooter');
    this.btnProgDetailCheckEligibility = document.getElementById('btnProgDetailCheckEligibility');
    this.btnProgDetailAddReport = document.getElementById('btnProgDetailAddReport');
    this.progDetailName = document.getElementById('progDetailName');
    this.progDetailAbbr = document.getElementById('progDetailAbbr');
    this.progDetailCategory = document.getElementById('progDetailCategory');
    this.progDetailBody = document.getElementById('progDetailBody');

    this.programmeEligibilityModal = document.getElementById('programmeEligibilityModal');
    this.btnCloseProgrammeEligibilityModal = document.getElementById('btnCloseProgrammeEligibilityModal');
    this.btnCancelProgrammeEligibility = document.getElementById('btnCancelProgrammeEligibility');
    this.btnSubmitProgrammeEligibility = document.getElementById('btnSubmitProgrammeEligibility');
    this.eligibilityProgrammeSelect = document.getElementById('eligibilityProgrammeSelect');
    this.radioEligIndividual = document.getElementById('radioEligIndividual');
    this.radioEligFamily = document.getElementById('radioEligFamily');
    this.eligibilityPersonGroup = document.getElementById('eligibilityPersonGroup');
    this.eligibilityFamilyGroup = document.getElementById('eligibilityFamilyGroup');
    this.eligibilityPersonSelect = document.getElementById('eligibilityPersonSelect');
    this.eligibilityFamilySelect = document.getElementById('eligibilityFamilySelect');
    this.eligibilityVerificationStatusSelect = document.getElementById('eligibilityVerificationStatusSelect');
    this.eligibilityNotesInput = document.getElementById('eligibilityNotesInput');
    this.eligibilityDocInput = document.getElementById('eligibilityDocInput');

    this.addProgrammeReportModal = document.getElementById('addProgrammeReportModal');
    this.btnCloseAddProgrammeReportModal = document.getElementById('btnCloseAddProgrammeReportModal');
    this.btnCancelAddProgrammeReport = document.getElementById('btnCancelAddProgrammeReport');
    this.btnSubmitAddProgrammeReport = document.getElementById('btnSubmitAddProgrammeReport');
    this.reportProgProgrammeSelect = document.getElementById('reportProgProgrammeSelect');
    this.reportProgTargetSelect = document.getElementById('reportProgTargetSelect');
    this.reportProgTypeSelect = document.getElementById('reportProgTypeSelect');
    this.reportProgTitleInput = document.getElementById('reportProgTitleInput');
    this.reportProgDetailsInput = document.getElementById('reportProgDetailsInput');
    this.reportProgDateInput = document.getElementById('reportProgDateInput');

    this.adminProgrammeModal = document.getElementById('adminProgrammeModal');
    this.btnCloseAdminProgrammeModal = document.getElementById('btnCloseAdminProgrammeModal');
    this.btnCancelAdminProgramme = document.getElementById('btnCancelAdminProgramme');
    this.btnSubmitAdminProgramme = document.getElementById('btnSubmitAdminProgramme');
    this.adminProgIdInput = document.getElementById('adminProgIdInput');
    this.adminProgAbbrInput = document.getElementById('adminProgAbbrInput');
    this.adminProgNameInput = document.getElementById('adminProgNameInput');
    this.adminProgCategorySelect = document.getElementById('adminProgCategorySelect');
    this.adminProgDescInput = document.getElementById('adminProgDescInput');
    this.adminProgCriteriaInput = document.getElementById('adminProgCriteriaInput');
    this.adminProgBenefitsInput = document.getElementById('adminProgBenefitsInput');
    this.adminProgFollowupInput = document.getElementById('adminProgFollowupInput');

    this.supplyRelatedProgrammeSelect = document.getElementById('supplyRelatedProgrammeSelect');
    this.medRelatedProgrammeSelect = document.getElementById('medRelatedProgrammeSelect');

    // Toast Container
    this.toastContainer = document.getElementById('toastContainer');
  }

  bindEvents() {
    // Navigation
    this.navTabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        this.switchView(tab);
      });
    });

    if (this.brandHomeLink) {
      this.brandHomeLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchView('dashboard');
      });
    }

    // Role Selection
    if (this.roleSelector) {
      this.roleSelector.addEventListener('change', () => {
        const selected = this.roleSelector.value;
        this.storage.setRole(selected);
        const user = this.storage.getCurrentUser();
        this.showToast(`Active Session Role: ${user.title} (${user.defaultUser})`, 'info');
      });
    }

    // Network Toggle
    if (this.networkToggleBtn) {
      this.networkToggleBtn.addEventListener('click', () => {
        const newStatus = this.storage.toggleOnlineStatus();
        this.updateNetworkUI(newStatus);
        if (newStatus) {
          this.showToast('Online: Central Cloud Gateway Connected', 'success');
        } else {
          this.showToast('Offline Mode: Saving Locally to Sync Queue', 'warning');
        }
      });
    }

    if (this.triggerManualSyncBtn) {
      this.triggerManualSyncBtn.addEventListener('click', () => this.executeSync());
    }

    // 1-Click Fast Demo Buttons
    if (this.quickDemoBtn) {
      this.quickDemoBtn.addEventListener('click', () => this.runFullDemoSita());
    }
    if (this.heroDemoLoadBtn) {
      this.heroDemoLoadBtn.addEventListener('click', () => this.runFullDemoSita());
    }

    // Hero buttons
    if (this.heroVoiceBtn) {
      this.heroVoiceBtn.addEventListener('click', () => {
        this.switchView('capture');
        this.switchCaptureMode('voice');
      });
    }
    if (this.heroLiveBtn) {
      this.heroLiveBtn.addEventListener('click', () => {
        this.switchView('capture');
        this.switchCaptureMode('live');
      });
    }
    if (this.heroFormBtn) {
      this.heroFormBtn.addEventListener('click', () => {
        this.switchView('capture');
        this.switchCaptureMode('form');
      });
    }

    // Capture Mode Switcher (Form / Voice / Live)
    if (this.captureModeBtns) {
      this.captureModeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const mode = btn.getAttribute('data-mode');
          this.switchCaptureMode(mode);
        });
      });
    }

    // Voice Studio Events
    if (this.voiceLangSelect) {
      this.voiceLangSelect.addEventListener('change', () => {
        const lang = this.voiceLangSelect.value;
        this.voiceEngine.setLanguage(lang);
        this.showToast(`Voice recognition switched to: ${this.voiceEngine.getLangDisplayName()}`, 'info');
      });
    }

    // Pre-recording Verbal Consent & PII Privacy Safeguard Listener
    if (this.voicePreRecordConsentToggle) {
      this.voicePreRecordConsentToggle.addEventListener('change', () => {
        const isChecked = this.voicePreRecordConsentToggle.checked;
        if (this.voiceConsentGuardBox) {
          if (isChecked) {
            this.voiceConsentGuardBox.classList.remove('consent-revoked');
          } else {
            this.voiceConsentGuardBox.classList.add('consent-revoked');
          }
        }
        if (!isChecked && this.isRecording) {
          this.toggleMicrophone();
          this.showToast('Microphone recording stopped: Consent was revoked/unchecked.', 'warning');
        }
      });
    }

    if (this.micRecordBtn) {
      this.micRecordBtn.addEventListener('click', () => this.toggleMicrophone());
    }
    if (this.btnExtractEntities) {
      this.btnExtractEntities.addEventListener('click', () => this.extractFromVoiceTranscript());
    }
    if (this.btnClearVoice) {
      this.btnClearVoice.addEventListener('click', () => {
        this.voiceEngine.clearTranscript();
        if (this.voiceTranscriptInput) this.voiceTranscriptInput.value = '';
        if (this.extractionReviewCard) this.extractionReviewCard.style.display = 'none';
        this.showToast('Transcript cleared', 'info');
      });
    }

    // Multilingual Voice Preset Cards
    this.presetCards.forEach(card => {
      card.addEventListener('click', () => {
        const presetKey = card.getAttribute('data-preset');
        const item = DEMO_HOUSEHOLDS.find(d => d.id === `demo-${presetKey}`);
        if (item) {
          // Set language dropdown to match preset
          if (item.lang) {
            this.voiceLangSelect.value = item.lang;
            this.voiceEngine.setLanguage(item.lang);
          }
          if (item.formData && item.formData.householdId) {
            this.activePresetHouseholdId = item.formData.householdId;
            if (this.revHouseholdId) this.revHouseholdId.value = item.formData.householdId;
          }
          this.voiceEngine.setManualTranscript(item.speechTranscript);
          this.voiceTranscriptInput.value = item.speechTranscript;
          this.showToast(`Loaded audio transcript for ${item.title}`, 'info');
          // Automatically extract fields
          this.extractFromVoiceTranscript();
        }
      });
    });

    // Confirmation Review Card Buttons
    if (this.btnEditExtracted) {
      this.btnEditExtracted.addEventListener('click', () => {
        if (this.revName) this.revName.focus();
        this.showToast('You can now edit any misheard field before confirming.', 'info');
      });
    }
    if (this.btnConfirmExtracted) {
      this.btnConfirmExtracted.addEventListener('click', () => this.commitConfirmedVoiceEncounter());
    }

    // Live validation on extracted fields in review card
    [this.revName, this.revAge, this.revHouseholdId].forEach(el => {
      if (el) {
        el.addEventListener('input', () => {
          const candidate = {
            name: this.revName ? this.revName.value : '',
            age: this.revAge ? this.revAge.value : '',
            householdId: this.revHouseholdId ? this.revHouseholdId.value : 'H001',
            isPregnant: this.revPregnant ? this.revPregnant.value === 'true' : false,
            gestationalAgeWeeks: this.revGestation ? this.revGestation.value : ''
          };
          const allProfiles = diagnosticManager.getAllProfiles();
          const check = ConsistencyChecker.validate(candidate, allProfiles);
          this.renderConsistencyAlert(check, this.voiceConsistencyAlertContainer, 'voice');
        });
      }
    });

    // Standard Form Events
    if (this.formIsPregnant) {
      this.formIsPregnant.addEventListener('change', () => this.onPregnancyToggleChanged());
    }
    if (this.formFollowUp) {
      this.formFollowUp.addEventListener('change', () => {
        if (this.followUpToggleLabel) {
          this.followUpToggleLabel.textContent = this.formFollowUp.checked ? 'YES - Priority Revisit' : 'No - Routine Visit';
        }
      });
    }
    if (this.formLoadSampleBtn) {
      this.formLoadSampleBtn.addEventListener('click', () => this.loadFormSampleSita());
    }
    if (this.btnSubmitForm) {
      this.btnSubmitForm.addEventListener('click', () => this.handleStandardFormSubmit());
    }

    // Form live consistency validation listeners (including householdId for duplicate check)
    [this.formPersonName, this.formAge, this.formHouseholdId, this.formGestationalWeeks, this.formChildrenCount, this.formSpo2].forEach(el => {
      if (el) el.addEventListener('input', () => this.validateLiveFormConsistency());
      if (el) el.addEventListener('change', () => this.validateLiveFormConsistency());
    });

    // Live Autosave Mode Events
    this.liveFields.forEach(field => {
      if (field) {
        field.addEventListener('input', () => this.handleLiveFieldInput(field));
        field.addEventListener('change', () => this.handleLiveFieldInput(field));
      }
    });
    if (this.btnLiveLoadSindhu) {
      this.btnLiveLoadSindhu.addEventListener('click', () => this.loadSindhuInLiveMode());
    }
    if (this.btnFinalizeLive) {
      this.btnFinalizeLive.addEventListener('click', () => this.finalizeLiveEncounter());
    }

    // Output View Tabs
    this.schemaTabBtns.forEach(btn => {
      if (btn) {
        btn.addEventListener('click', () => {
          const schema = btn.getAttribute('data-schema');
          this.switchSchemaTab(schema);
        });
      }
    });

    if (this.viewModeCardBtn) {
      this.viewModeCardBtn.addEventListener('click', () => this.setOutputViewMode('card'));
    }
    if (this.viewModeJsonBtn) {
      this.viewModeJsonBtn.addEventListener('click', () => this.setOutputViewMode('json'));
    }
    if (this.btnCopyJson) {
      this.btnCopyJson.addEventListener('click', () => this.copyJsonToClipboard());
    }
    if (this.btnDownloadAllJson) {
      this.btnDownloadAllJson.addEventListener('click', () => this.downloadAllSchemasJson());
    }
    if (this.btnNewEncounterFromOutput) {
      this.btnNewEncounterFromOutput.addEventListener('click', () => {
        this.switchView('capture');
        this.switchCaptureMode('voice');
      });
    }

    // Timeline Refresh
    if (this.btnRefreshTimeline) {
      this.btnRefreshTimeline.addEventListener('click', () => {
        this.renderTimeline();
        this.showToast('Household H001 timeline refreshed', 'info');
      });
    }

    // Timeline Profile Selector & Actions
    if (this.timelineHouseholdSelect) {
      this.timelineHouseholdSelect.addEventListener('change', () => {
        this.selectedTimelineHousehold = this.timelineHouseholdSelect.value;
        this.renderTimeline();
      });
    }

    if (this.btnTimelineNewVisit) {
      this.btnTimelineNewVisit.addEventListener('click', () => {
        const hid = (this.selectedTimelineHousehold && this.selectedTimelineHousehold !== 'ALL') ? this.selectedTimelineHousehold : 'H001';
        if (this.formHouseholdId) this.formHouseholdId.value = hid;
        if (this.revHouseholdId) this.revHouseholdId.value = hid;
        if (this.liveHouseholdId) {
          this.liveHouseholdId.value = hid;
          if (this.liveHouseholdHeading) this.liveHouseholdHeading.textContent = `HOUSEHOLD RECORD (${hid})`;
        }
        this.activePresetHouseholdId = hid;
        this.switchView('capture');
        this.switchCaptureMode('voice');
        this.showToast(`Starting new encounter for Household Profile ${hid}`, 'info');
      });
    }

    if (this.btnDeleteSelectedProfile) {
      this.btnDeleteSelectedProfile.addEventListener('click', () => this.handleDeleteSelectedProfile());
    }
    if (this.btnDeleteCurrentProfileBtn) {
      this.btnDeleteCurrentProfileBtn.addEventListener('click', () => this.handleDeleteSelectedProfile());
    }

    if (this.btnDeleteCurrentOutputRecord) {
      this.btnDeleteCurrentOutputRecord.addEventListener('click', () => this.handleDeleteCurrentOutputRecord());
    }

    // Impact Calculator Sliders
    if (this.sliderVisits) {
      this.sliderVisits.addEventListener('input', () => this.updateCalculator());
    }
    if (this.sliderAshas) {
      this.sliderAshas.addEventListener('input', () => this.updateCalculator());
    }

    // Language Selector Event
    if (this.appLanguageSelector) {
      this.appLanguageSelector.addEventListener('change', () => {
        const lang = this.appLanguageSelector.value;
        i18n.setLanguage(lang);
        this.updateUILanguage();
        this.showToast(`Language switched to: ${i18n.getLanguageName(lang)}`, 'info');
      });
    }

    // ASHA User Accounts & Switcher
    if (this.btnUserSessionTrigger) {
      this.btnUserSessionTrigger.addEventListener('click', () => {
        this.openUserAuthModal();
      });
    }
    if (this.btnCloseUserAuthModal) {
      this.btnCloseUserAuthModal.addEventListener('click', () => {
        this.userAuthModal.style.display = 'none';
      });
    }
    if (this.tabUserSwitchBtn && this.tabUserCreateBtn) {
      this.tabUserSwitchBtn.addEventListener('click', () => {
        this.tabUserSwitchBtn.classList.add('active');
        this.tabUserCreateBtn.classList.remove('active');
        this.panelUserSwitch.style.display = 'block';
        this.panelUserCreate.style.display = 'none';
      });
      this.tabUserCreateBtn.addEventListener('click', () => {
        this.tabUserCreateBtn.classList.add('active');
        this.tabUserSwitchBtn.classList.remove('active');
        this.panelUserSwitch.style.display = 'none';
        this.panelUserCreate.style.display = 'block';
      });
    }
    if (this.btnSubmitCreateUser) {
      this.btnSubmitCreateUser.addEventListener('click', () => this.handleCreateNewUser());
    }

    // Encounter Form Supporting Document Upload (Requirements 2 & 3)
    if (this.btnTriggerDocUpload && this.formUploadFileInput) {
      this.btnTriggerDocUpload.addEventListener('click', () => {
        this.formUploadFileInput.click();
      });
      this.formUploadFileInput.addEventListener('change', (e) => this.handleEncounterDocUpload(e));
    }

    // Diagnostic Reports View Events (Requirements 8-15)
    if (this.btnRefreshDiagnosticView) {
      this.btnRefreshDiagnosticView.addEventListener('click', () => {
        this.renderDiagnosticPersonProfile(this.activeDiagnosticPersonId);
        this.showToast('Person Health Profile refreshed', 'info');
      });
    }
    if (this.quickPersonSelect) {
      this.quickPersonSelect.addEventListener('change', () => {
        this.activeDiagnosticPersonId = this.quickPersonSelect.value;
        this.renderDiagnosticPersonProfile(this.activeDiagnosticPersonId);
      });
    }
    if (this.btnOpenPersonProfile) {
      this.btnOpenPersonProfile.addEventListener('click', () => {
        if (this.quickPersonSelect && this.quickPersonSelect.value) {
          this.activeDiagnosticPersonId = this.quickPersonSelect.value;
          this.renderDiagnosticPersonProfile(this.activeDiagnosticPersonId);
        }
      });
    }
    if (this.personSearchInput) {
      this.personSearchInput.addEventListener('input', () => {
        const query = this.personSearchInput.value.trim();
        if (!query) return;
        const results = diagnosticManager.searchProfiles(query);
        if (results.length > 0) {
          this.quickPersonSelect.value = results[0].personId;
          this.activeDiagnosticPersonId = results[0].personId;
          this.renderDiagnosticPersonProfile(this.activeDiagnosticPersonId);
        }
      });
    }
    if (this.btnTriggerAddAction) {
      this.btnTriggerAddAction.addEventListener('click', () => {
        if (this.addRecordModal) this.addRecordModal.style.display = 'flex';
      });
    }

    // Action Sheet Modal Handlers (Requirement 10)
    if (this.btnCloseAddRecordModal) {
      this.btnCloseAddRecordModal.addEventListener('click', () => {
        this.addRecordModal.style.display = 'none';
      });
    }
    const bindActionSheet = (btn, section) => {
      if (btn) {
        btn.addEventListener('click', () => {
          if (this.addRecordModal) this.addRecordModal.style.display = 'none';
          this.openCheckupModal(section);
        });
      }
    };
    bindActionSheet(this.actNewCheckup, 'all');
    bindActionSheet(this.actDiagnosticResult, 'diagnostic');
    bindActionSheet(this.actLabReport, 'lab');
    bindActionSheet(this.actClinicalReport, 'clinical');
    bindActionSheet(this.actNewHealthFinding, 'finding');
    bindActionSheet(this.actFollowUp, 'followup');
    bindActionSheet(this.actDocument, 'doc');
    bindActionSheet(this.actObservation, 'observation');

    // New Check-Up Modal Realtime BMI & File Uploads (Requirements 11-12)
    if (this.btnCloseCheckupModal) {
      this.btnCloseCheckupModal.addEventListener('click', () => {
        this.checkupFormModal.style.display = 'none';
      });
    }
    if (this.btnCancelCheckup) {
      this.btnCancelCheckup.addEventListener('click', () => {
        this.checkupFormModal.style.display = 'none';
      });
    }
    const updateCheckupBmi = () => {
      const h = parseFloat(this.checkupHeight?.value || 0);
      const w = parseFloat(this.checkupWeight?.value || 0);
      const res = diagnosticManager.calculateBmi(w, h);
      if (this.checkupBmiVal) this.checkupBmiVal.textContent = res.bmi;
      if (this.checkupBmiCategory) this.checkupBmiCategory.textContent = `(${res.category})`;
    };
    if (this.checkupHeight) this.checkupHeight.addEventListener('input', updateCheckupBmi);
    if (this.checkupWeight) this.checkupWeight.addEventListener('input', updateCheckupBmi);

    const bindCheckupUpload = (btn, input, labelEl, key) => {
      if (btn && input) {
        btn.addEventListener('click', () => input.click());
        input.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = () => {
              this.checkupAttachedFiles[key] = {
                title: file.name,
                dataUrl: reader.result,
                fileType: file.type || 'application/pdf',
                fileSize: `${Math.round(file.size / 1024)} KB`
              };
              if (labelEl) labelEl.textContent = `✓ Attached: ${file.name} (${Math.round(file.size / 1024)} KB)`;
            };
            reader.readAsDataURL(file);
          }
        });
      }
    };
    bindCheckupUpload(this.btnUploadBloodFile, this.checkupBloodFileInput, this.checkupBloodFileLabel, 'blood');
    bindCheckupUpload(this.btnUploadUrineFile, this.checkupUrineFileInput, this.checkupUrineFileLabel, 'urine');
    bindCheckupUpload(this.btnUploadOtherFile, this.checkupOtherFileInput, this.checkupOtherFileLabel, 'other');

    if (this.btnSaveCheckup) {
      this.btnSaveCheckup.addEventListener('click', () => this.handleSaveCheckup());
    }

    // Document Viewer Modal Handlers (Requirement 15)
    if (this.btnCloseDocViewer) {
      this.btnCloseDocViewer.addEventListener('click', () => {
        this.documentViewerModal.style.display = 'none';
      });
    }
    if (this.btnCloseDocViewerBtn) {
      this.btnCloseDocViewerBtn.addEventListener('click', () => {
        this.documentViewerModal.style.display = 'none';
      });
    }
    if (this.btnDownloadCurrentDoc) {
      this.btnDownloadCurrentDoc.addEventListener('click', () => {
        if (this.activeDocViewerId) {
          documentStore.downloadDocument(this.activeDocViewerId);
          this.showToast('Document download started', 'success');
        }
      });
    }

    // Doctor Verification Modal Handlers (Requirement 13)
    if (this.btnCloseDoctorVerifModal) {
      this.btnCloseDoctorVerifModal.addEventListener('click', () => {
        this.doctorVerificationModal.style.display = 'none';
      });
    }
    if (this.btnVerifApprove) {
      this.btnVerifApprove.addEventListener('click', () => this.handleDoctorVerificationAction('APPROVE'));
    }
    if (this.btnVerifClarify) {
      this.btnVerifClarify.addEventListener('click', () => this.handleDoctorVerificationAction('CLARIFY'));
    }
    if (this.btnVerifReject) {
      this.btnVerifReject.addEventListener('click', () => this.handleDoctorVerificationAction('REJECT'));
    }

    // Family Search & Filter Events
    if (this.familyFilterGroup) {
      this.familyFilterGroup.querySelectorAll('.btn-filter-pill').forEach(btn => {
        btn.addEventListener('click', () => {
          this.familyFilterGroup.querySelectorAll('.btn-filter-pill').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.activeFamilyFilter = btn.getAttribute('data-filter') || 'ALL';
          this.renderFamilyList(this.activeFamilyFilter, this.familySearchQuery);
        });
      });
    }

    if (this.familySearchInput) {
      this.familySearchInput.addEventListener('input', (e) => {
        this.familySearchQuery = e.target.value.trim().toLowerCase();
        this.renderFamilyList(this.activeFamilyFilter, this.familySearchQuery);
      });
    }

    if (this.btnBackToFamilyList) {
      this.btnBackToFamilyList.addEventListener('click', () => {
        if (this.familyDetailContainer) this.familyDetailContainer.style.display = 'none';
        if (this.familyListContainer) this.familyListContainer.style.display = 'block';
        this.renderFamilyList(this.activeFamilyFilter, this.familySearchQuery);
      });
    }

    if (this.btnRefreshFamilyView) {
      this.btnRefreshFamilyView.addEventListener('click', () => {
        this.renderFamilyList(this.activeFamilyFilter, this.familySearchQuery);
        this.showToast('Family Reports refreshed', 'info');
      });
    }

    // Modal Triggers: Register Family
    if (this.btnOpenRegisterFamilyModal) {
      this.btnOpenRegisterFamilyModal.addEventListener('click', () => {
        const nextNum = (familyManager.getAllFamilies().length + 42);
        const autoId = `F0${nextNum}`;
        const autoHouse = `H-0${nextNum}`;
        const hid = document.getElementById('regFamilyId');
        const hhouse = document.getElementById('regFamilyHouseNumber');
        if (hid) hid.value = autoId;
        if (hhouse && !hhouse.value) hhouse.value = autoHouse;
        if (this.registerFamilyModal) this.registerFamilyModal.style.display = 'flex';
      });
    }

    const bindCloseModal = (modal, closeBtn, cancelBtn) => {
      if (closeBtn) closeBtn.addEventListener('click', () => { if (modal) modal.style.display = 'none'; });
      if (cancelBtn) cancelBtn.addEventListener('click', () => { if (modal) modal.style.display = 'none'; });
    };
    bindCloseModal(this.registerFamilyModal, this.btnCloseRegisterFamilyModal, this.btnCancelRegisterFamily);
    bindCloseModal(this.addFamilyMemberModal, this.btnCloseAddFamilyMemberModal, this.btnCancelAddFamilyMember);
    bindCloseModal(this.addSchemeModal, this.btnCloseAddSchemeModal, this.btnCancelAddScheme);
    bindCloseModal(this.addSupplyModal, this.btnCloseAddSupplyModal, this.btnCancelAddSupply);
    bindCloseModal(this.addMedicineModal, this.btnCloseAddMedicineModal, this.btnCancelAddMedicine);
    bindCloseModal(this.reportBirthModal, this.btnCloseReportBirthModal, this.btnCancelReportBirth);
    bindCloseModal(this.reportDeathModal, this.btnCloseReportDeathModal, this.btnCancelReportDeath);
    bindCloseModal(this.reportHealthEventModal, this.btnCloseReportHealthEventModal, this.btnCancelReportHealthEvent);
    bindCloseModal(this.reportProgrammeModal, this.btnCloseReportProgrammeModal, this.btnCancelReportProgramme);
    bindCloseModal(this.editTargetModal, this.btnCloseEditTargetModal, this.btnCancelEditTarget);
    bindCloseModal(this.assignFamilyModal, this.btnCloseAssignFamilyModal, this.btnCancelAssignFamily);

    // Conditional dropdown toggle for Scheme (Family vs Individual)
    if (this.schemeEligibleFor && this.schemePersonSelectGroup) {
      this.schemeEligibleFor.addEventListener('change', () => {
        this.schemePersonSelectGroup.style.display = this.schemeEligibleFor.value === 'Individual' ? 'block' : 'none';
      });
    }

    // Conditional dropdown toggle for Supply (Family vs Individual)
    if (this.supplyProvidedTo && this.supplyPersonSelectGroup) {
      this.supplyProvidedTo.addEventListener('change', () => {
        this.supplyPersonSelectGroup.style.display = this.supplyProvidedTo.value === 'Individual' ? 'block' : 'none';
      });
    }

    // Target modal triggers
    if (this.btnOpenEditTargetModal) {
      this.btnOpenEditTargetModal.addEventListener('click', () => {
        const user = userManager.getCurrentUser();
        const t = familyManager.getAshaTarget(user.id);
        if (this.targetAllocatedInput) this.targetAllocatedInput.value = t.allocated;
        if (this.editTargetModal) this.editTargetModal.style.display = 'flex';
      });
    }

    if (this.btnOpenAssignFamilyModal) {
      this.btnOpenAssignFamilyModal.addEventListener('click', () => {
        this.populateAssignFamilyModal();
        if (this.assignFamilyModal) this.assignFamilyModal.style.display = 'flex';
      });
    }

    // Modal Submits
    if (this.btnSubmitRegisterFamily) {
      this.btnSubmitRegisterFamily.addEventListener('click', () => this.handleRegisterFamily());
    }
    if (this.btnSubmitAddFamilyMember) {
      this.btnSubmitAddFamilyMember.addEventListener('click', () => this.handleAddFamilyMember());
    }
    if (this.btnSubmitAddScheme) {
      this.btnSubmitAddScheme.addEventListener('click', () => this.handleAddScheme());
    }
    if (this.btnSubmitAddSupply) {
      this.btnSubmitAddSupply.addEventListener('click', () => this.handleAddSupply());
    }
    if (this.btnSubmitAddMedicine) {
      this.btnSubmitAddMedicine.addEventListener('click', () => this.handleAddMedicine());
    }
    if (this.btnSubmitReportBirth) {
      this.btnSubmitReportBirth.addEventListener('click', () => this.handleReportBirth());
    }
    if (this.btnSubmitReportDeath) {
      this.btnSubmitReportDeath.addEventListener('click', () => this.handleReportDeath());
    }
    if (this.btnSubmitReportHealthEvent) {
      this.btnSubmitReportHealthEvent.addEventListener('click', () => this.handleReportHealthEvent());
    }
    if (this.btnSubmitReportProgramme) {
      this.btnSubmitReportProgramme.addEventListener('click', () => this.handleReportProgramme());
    }
    if (this.btnSubmitEditTarget) {
      this.btnSubmitEditTarget.addEventListener('click', () => this.handleEditTarget());
    }
    if (this.btnSubmitAssignFamily) {
      this.btnSubmitAssignFamily.addEventListener('click', () => this.handleAssignFamily());
    }

    // Health Programmes View & Search Events
    if (this.btnRefreshProgrammesView) {
      this.btnRefreshProgrammesView.addEventListener('click', () => {
        this.renderProgrammesView();
        this.showToast('Health Programmes directory refreshed', 'info');
      });
    }

    if (this.programmeSearchInput) {
      this.programmeSearchInput.addEventListener('input', () => {
        this.programmeSearchQuery = this.programmeSearchInput.value.trim();
        this.renderProgrammesCards();
      });
    }

    if (this.btnAdminAddProgramme) {
      this.btnAdminAddProgramme.addEventListener('click', () => {
        this.openAdminProgrammeModal();
      });
    }

    // Programme Modals Closing
    bindCloseModal(this.programmeDetailModal, this.btnCloseProgrammeDetailModal, this.btnCloseProgDetailFooter);
    bindCloseModal(this.programmeEligibilityModal, this.btnCloseProgrammeEligibilityModal, this.btnCancelProgrammeEligibility);
    bindCloseModal(this.addProgrammeReportModal, this.btnCloseAddProgrammeReportModal, this.btnCancelAddProgrammeReport);
    bindCloseModal(this.adminProgrammeModal, this.btnCloseAdminProgrammeModal, this.btnCancelAdminProgramme);

    if (this.btnProgDetailCheckEligibility) {
      this.btnProgDetailCheckEligibility.addEventListener('click', () => {
        if (this.activeViewingProgId) {
          if (this.programmeDetailModal) this.programmeDetailModal.style.display = 'none';
          this.openProgrammeEligibilityModal(this.activeViewingProgId);
        }
      });
    }

    if (this.btnProgDetailAddReport) {
      this.btnProgDetailAddReport.addEventListener('click', () => {
        if (this.activeViewingProgId) {
          if (this.programmeDetailModal) this.programmeDetailModal.style.display = 'none';
          this.openAddProgrammeReportModal(this.activeViewingProgId);
        }
      });
    }

    // Toggle Beneficiary Scope in Eligibility modal
    if (this.radioEligIndividual && this.radioEligFamily) {
      this.radioEligIndividual.addEventListener('change', () => {
        if (this.eligibilityPersonGroup) this.eligibilityPersonGroup.style.display = 'block';
        if (this.eligibilityFamilyGroup) this.eligibilityFamilyGroup.style.display = 'none';
      });
      this.radioEligFamily.addEventListener('change', () => {
        if (this.eligibilityPersonGroup) this.eligibilityPersonGroup.style.display = 'none';
        if (this.eligibilityFamilyGroup) this.eligibilityFamilyGroup.style.display = 'block';
      });
    }

    if (this.btnSubmitProgrammeEligibility) {
      this.btnSubmitProgrammeEligibility.addEventListener('click', () => this.handleSaveProgrammeEligibility());
    }

    if (this.btnSubmitAddProgrammeReport) {
      this.btnSubmitAddProgrammeReport.addEventListener('click', () => this.handleSaveProgrammeReport());
    }

    if (this.btnSubmitAdminProgramme) {
      this.btnSubmitAdminProgramme.addEventListener('click', () => this.handleSaveAdminProgramme());
    }
  }

  renderInitialState() {
    this.updateUserSessionDisplay();
    this.populateQuickPersonSelect();
    this.renderVaccinesCatalog();
    this.renderSymptomsCatalog();
    this.updateNetworkUI(this.storage.isOnline);
    this.renderEncountersList();
    this.renderTimeline();
    this.renderAuditLogs();
    this.updateCalculator();
    this.renderDiagnosticPersonProfile(this.activeDiagnosticPersonId);
    this.renderFamilyList(this.activeFamilyFilter, this.familySearchQuery);
    this.renderProgressView();
    this.renderProgrammesView();

    // Default seed for output view
    const encounters = this.storage.getAllEncounters();
    if (encounters.length > 0) {
      this.currentOutputData = encounters[0].outputs;
      this.renderOutputView();
    }
  }

  switchView(tabId) {
    this.currentView = tabId;

    this.navTabBtns.forEach(btn => {
      if (btn.getAttribute('data-tab') === tabId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    this.tabViews.forEach(view => {
      if (view.id === `view-${tabId}`) {
        view.classList.add('active');
      } else {
        view.classList.remove('active');
      }
    });

    if (tabId === 'timeline') this.renderTimeline();
    if (tabId === 'audit') this.renderAuditLogs();
    if (tabId === 'diagnostic') this.renderDiagnosticPersonProfile(this.activeDiagnosticPersonId);
    if (tabId === 'family') this.renderFamilyList(this.activeFamilyFilter, this.familySearchQuery);
    if (tabId === 'progress') this.renderProgressView();
    if (tabId === 'programmes') this.renderProgrammesView();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  switchCaptureMode(mode) {
    this.currentCaptureMode = mode;

    this.captureModeBtns.forEach(btn => {
      if (btn.getAttribute('data-mode') === mode) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    Object.keys(this.subviews).forEach(key => {
      if (key === mode) {
        this.subviews[key].style.display = 'block';
      } else {
        this.subviews[key].style.display = 'none';
      }
    });
  }

  // =========================================================================
  // Network & Storage State
  // =========================================================================
  updateNetworkUI(isOnline) {
    if (isOnline) {
      this.networkDot.className = 'status-dot';
      this.networkStatusLabel.textContent = 'Online (Central Sync)';
      this.offlineAlertBanner.classList.add('hidden');
      this.setAutosaveStatusChip('synced', '☁ Synced');
    } else {
      this.networkDot.className = 'status-dot offline';
      this.networkStatusLabel.textContent = 'Offline (Local Buffer)';
      this.offlineAlertBanner.classList.remove('hidden');
      this.setAutosaveStatusChip('offline', '⚠ Offline - Saved locally');
    }
    this.updateDashboardMetrics();
  }

  onStorageStateChanged() {
    this.updateDashboardMetrics();
    this.renderEncountersList();
    this.renderTimeline();
    this.renderAuditLogs();
  }

  async executeSync() {
    const queue = this.storage.getSyncQueue();
    if (queue.length === 0) {
      this.showToast('Local queue is already in sync with Central Registry.', 'info');
      return;
    }

    this.showToast(`Syncing ${queue.length} buffered encounters to primary registry...`, 'info');

    await this.storage.syncPendingRecords((msg) => {
      this.showToast(msg, 'info');
    });

    this.storage.setOnlineStatus(true);
    this.updateNetworkUI(true);
    this.showToast(`${queue.length} encounters synchronized successfully!`, 'success');
  }

  // =========================================================================
  // Voice Encounter ("ASHA Bol") Logic
  // =========================================================================
  toggleMicrophone() {
    if (!this.isRecording) {
      // DPDPA 2023 / Synthetic Health Privacy Guard
      if (this.voicePreRecordConsentToggle && !this.voicePreRecordConsentToggle.checked) {
        this.showToast('⚠️ Beneficiary verbal consent must be confirmed before recording audio (DPDPA 2023 safeguard).', 'warning');
        if (this.voiceConsentGuardBox) {
          this.voiceConsentGuardBox.classList.remove('consent-error-shake');
          void this.voiceConsentGuardBox.offsetWidth; // force reflow
          this.voiceConsentGuardBox.classList.add('consent-error-shake');
        }
        return;
      }

      this.voiceEngine.startListening();
      this.isRecording = true;
      this.micRecordBtn.classList.add('recording');
      this.micStatusTitle.textContent = `Listening (${this.voiceEngine.getLangDisplayName()})...`;
      this.micStatusHint.textContent = 'Speak naturally. Say: "Sindhu is 22 years old and 14 weeks pregnant..."';
      this.setVisualizerActive(true);
    } else {
      this.voiceEngine.stopListening();
      this.isRecording = false;
      this.micRecordBtn.classList.remove('recording');
      this.micStatusTitle.textContent = 'Microphone Paused';
      this.micStatusHint.textContent = 'Tap microphone to resume, or click Extract Information.';
      this.setVisualizerActive(false);
    }
  }

  setVisualizerActive(isActive) {
    const bars = this.audioVisualizer.querySelectorAll('.wave-bar');
    bars.forEach((bar, idx) => {
      if (isActive) {
        bar.classList.add('active');
        bar.style.animationDelay = `${(idx % 4) * 0.15}s`;
      } else {
        bar.classList.remove('active');
      }
    });
  }

  onTranscriptUpdate(transcript) {
    if (this.voiceTranscriptInput) {
      this.voiceTranscriptInput.value = transcript;
    }
  }

  onVoiceStatusChange(status, message) {
    if (status === 'error') {
      this.showToast(message, 'warning');
      this.isRecording = false;
      this.micRecordBtn.classList.remove('recording');
      this.micStatusTitle.textContent = 'Tap to Speak';
      this.micStatusHint.textContent = message;
      this.setVisualizerActive(false);
    }
  }

  extractFromVoiceTranscript() {
    const text = this.voiceTranscriptInput.value.trim();
    if (!text) {
      this.showToast('Please speak into the mic or pick a sample preset above.', 'warning');
      return;
    }

    const extracted = VoiceCaptureEngine.extractEntities(text);

    // Populate confirmation card
    if (this.revHouseholdId) {
      this.revHouseholdId.value = this.activePresetHouseholdId || (this.selectedTimelineHousehold && this.selectedTimelineHousehold !== 'ALL' ? this.selectedTimelineHousehold : 'H001');
    }
    this.revName.value = extracted.name;
    this.revAge.value = extracted.age;
    this.revPregnant.value = extracted.isPregnant ? 'true' : 'false';
    this.revGestation.value = extracted.gestationalAgeWeeks !== null ? extracted.gestationalAgeWeeks : '';
    this.revChildren.value = extracted.childrenCount;
    this.revVaccines.value = extracted.vaccinations.join(', ');
    this.revSymptoms.value = extracted.symptoms.join(', ');
    this.revVitals.value = `BP: ${extracted.vitals.bp}, Temp: ${extracted.vitals.temperature}°F, SpO2: ${extracted.vitals.spo2}%`;
    this.revFollowUp.value = extracted.followUpRequired ? 'true' : 'false';

    // Show review card
    this.extractionReviewCard.style.display = 'block';

    // Check consistency & fuzzy duplicate beneficiary detection
    const candidateData = {
      ...extracted,
      householdId: this.revHouseholdId ? this.revHouseholdId.value.trim().toUpperCase() : 'H001'
    };
    const allProfiles = diagnosticManager.getAllProfiles();
    const check = ConsistencyChecker.validate(candidateData, allProfiles);
    this.renderConsistencyAlert(check, this.voiceConsistencyAlertContainer, 'voice');

    this.showToast(`Extracted fields for "${extracted.name}". Please verify before saving.`, 'success');
    this.extractionReviewCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  commitConfirmedVoiceEncounter() {
    if (!this.voiceConsentCheckbox.checked) {
      this.showToast('Please verify patient consent before finalizing documentation.', 'warning');
      return;
    }

    const rawVaccines = this.revVaccines.value.split(',').map(s => s.trim()).filter(Boolean);
    const rawSymptoms = this.revSymptoms.value.split(',').map(s => s.trim()).filter(Boolean);

    const isPreg = this.revPregnant.value === 'true';
    const weeks = isPreg ? Number(this.revGestation.value) || 0 : null;

    const user = this.storage.getCurrentUser();
    const targetHouseholdId = (this.revHouseholdId ? this.revHouseholdId.value.trim().toUpperCase() : '') || this.activePresetHouseholdId || 'H001';

    // CDM Duplicate Resolution: If MERGE is selected with a matched profile, retain existing Person UID
    const isMerge = (this.voiceSelectedDuplicateResolution === 'MERGE' && this.voiceMatchedDuplicateProfileId);
    const targetPersonId = isMerge ? this.voiceMatchedDuplicateProfileId : '';

    const commonRecord = createCommonRecord({
      householdId: targetHouseholdId,
      personId: targetPersonId,
      personName: this.revName.value,
      age: Number(this.revAge.value) || 24,
      gender: 'Female',
      isPregnant: isPreg,
      gestationalAgeWeeks: weeks,
      childrenCount: Number(this.revChildren.value) || 0,
      vaccinations: rawVaccines,
      symptoms: rawSymptoms.length > 0 ? rawSymptoms : ['None'],
      followUpRequired: this.revFollowUp.value === 'true',
      source: 'VOICE',
      createdBy: user.defaultUser,
      notes: `Captured via ASHA Multilingual Voice Studio (${this.voiceLangSelect.value}). Verified by ${user.defaultUser}.`
    });

    const outputs = SchemaMappingEngine.transformAll(commonRecord);
    const saveResult = this.storage.saveEncounter(commonRecord, outputs);

    // Sync into diagnostic profile registry with duplicate resolution options
    const diagProf = diagnosticManager.upsertProfileFromEncounter(commonRecord, {
      action: this.voiceSelectedDuplicateResolution || 'MERGE',
      matchedPersonId: this.voiceMatchedDuplicateProfileId
    });
    this.populateQuickPersonSelect();
    if (diagProf) this.activeDiagnosticPersonId = diagProf.personId;

    this.currentOutputData = outputs;
    this.renderOutputView();

    if (isMerge) {
      this.showToast(`🔄 CDM Merged: Encounter added to existing longitudinal trajectory for ${diagProf.name} (${diagProf.personId})!`, 'success');
    } else if (saveResult.savedOffline) {
      this.showToast('Voice Encounter saved offline! (Sync pending)', 'warning');
    } else {
      this.showToast('Voice Encounter saved: Generated 3 programme records!', 'success');
    }

    this.switchView('output');
  }

  // =========================================================================
  // Live Realtime Autosave Capture Mode
  // =========================================================================
  handleLiveFieldInput(fieldEl) {
    const fieldId = fieldEl.id;
    const badgeId = `badge${fieldId.charAt(0).toUpperCase() + fieldId.slice(1)}`;
    const badgeEl = document.getElementById(badgeId);

    if (badgeEl) {
      badgeEl.textContent = '● Saving...';
      badgeEl.style.color = 'var(--accent-amber)';
    }

    if (fieldEl === this.liveHouseholdId && this.liveHouseholdHeading) {
      this.liveHouseholdHeading.textContent = `HOUSEHOLD RECORD (${this.liveHouseholdId.value.trim().toUpperCase() || 'H001'})`;
    }

    const draft = {
      householdId: this.liveHouseholdId ? this.liveHouseholdId.value.trim().toUpperCase() : 'H001',
      name: this.liveName.value,
      age: this.liveAge.value,
      isPregnant: this.livePreg.value === 'true',
      gestationalAgeWeeks: this.liveGestation.value,
      vaccinations: this.liveVaccines.value,
      symptoms: this.liveSymptoms.value
    };

    this.storage.triggerLiveAutosave(draft, (status, label) => {
      this.setAutosaveStatusChip(status, label);
      if (badgeEl) {
        badgeEl.textContent = '✓ Saved';
        badgeEl.style.color = 'var(--accent-emerald)';
      }
    });
  }

  setAutosaveStatusChip(statusClass, label) {
    if (!this.globalAutosaveStatus) return;
    this.globalAutosaveStatus.className = `autosave-pill ${statusClass}`;
    this.globalAutosaveStatus.textContent = label;

    if (this.liveRealtimeBadge) {
      this.liveRealtimeBadge.className = `autosave-pill ${statusClass}`;
      this.liveRealtimeBadge.textContent = label;
    }
  }

  loadSindhuInLiveMode() {
    if (this.liveHouseholdId) this.liveHouseholdId.value = 'H003';
    if (this.liveHouseholdHeading) this.liveHouseholdHeading.textContent = 'HOUSEHOLD RECORD (H003)';
    this.liveName.value = 'Sindhu';
    this.liveAge.value = 22;
    this.livePreg.value = 'true';
    this.liveGestation.value = '14 weeks';
    this.liveVaccines.value = 'None (1st Pregnancy)';
    this.liveSymptoms.value = 'Vomiting / Morning Sickness, Cough';

    document.querySelectorAll('.field-autosave-badge').forEach(b => {
      b.textContent = '✓ Saved';
      b.style.color = 'var(--accent-emerald)';
    });

    this.setAutosaveStatusChip('synced', '☁ Synced');
    this.showToast('Loaded Sindhu encounter in Live Autosave Mode', 'info');
  }

  finalizeLiveEncounter() {
    const isPreg = this.livePreg.value === 'true';
    const weeksMatch = this.liveGestation.value.match(/\d+/);
    const weeks = weeksMatch ? parseInt(weeksMatch[0], 10) : (isPreg ? 20 : null);
    const vaccines = this.liveVaccines.value.split(',').map(s => s.trim()).filter(Boolean);
    const symptoms = this.liveSymptoms.value.split(',').map(s => s.trim()).filter(Boolean);

    const user = this.storage.getCurrentUser();
    const targetHouseholdId = (this.liveHouseholdId ? this.liveHouseholdId.value.trim().toUpperCase() : '') || 'H001';

    const commonRecord = createCommonRecord({
      householdId: targetHouseholdId,
      personName: this.liveName.value || 'Sindhu',
      age: Number(this.liveAge.value) || 22,
      gender: 'Female',
      isPregnant: isPreg,
      gestationalAgeWeeks: weeks,
      childrenCount: 0,
      vaccinations: vaccines,
      symptoms: symptoms.length > 0 ? symptoms : ['None'],
      vitals: { bp: '116/74', temperature: 98.6, spo2: 98 },
      followUpRequired: true,
      source: 'LIVE',
      createdBy: user.defaultUser,
      notes: `Captured via Live Realtime Autosave Mode by ${user.defaultUser}.`
    });

    const outputs = SchemaMappingEngine.transformAll(commonRecord);
    const saveResult = this.storage.saveEncounter(commonRecord, outputs);

    this.currentOutputData = outputs;
    this.renderOutputView();

    if (saveResult.savedOffline) {
      this.showToast('Encounter saved offline to queue! (Sync pending)', 'warning');
    } else {
      this.showToast('Live encounter finalized: Generated 3 programme records!', 'success');
    }

    this.switchView('output');
  }

  // =========================================================================
  // Standard Form Mode Logic
  // =========================================================================
  renderVaccinesCatalog() {
    this.vaccinesPillsCatalog.innerHTML = '';
    VACCINES_CATALOG.forEach(v => {
      const pill = document.createElement('div');
      pill.className = 'pill-option';
      pill.textContent = v.name;
      pill.title = `${v.targetAge} - ${v.disease}`;
      pill.addEventListener('click', () => {
        if (this.selectedVaccines.has(v.id)) {
          this.selectedVaccines.delete(v.id);
          pill.classList.remove('selected');
        } else {
          this.selectedVaccines.add(v.id);
          pill.classList.add('selected');
        }
        this.validateLiveFormConsistency();
      });
      this.vaccinesPillsCatalog.appendChild(pill);
    });
  }

  renderSymptomsCatalog() {
    this.symptomsPillsCatalog.innerHTML = '';
    SYMPTOMS_CATALOG.forEach(sym => {
      const pill = document.createElement('div');
      pill.className = 'pill-option';
      pill.textContent = sym;
      pill.addEventListener('click', () => {
        if (sym === 'None') {
          this.selectedSymptoms.clear();
          this.selectedSymptoms.add('None');
          this.symptomsPillsCatalog.querySelectorAll('.pill-option').forEach(p => p.classList.remove('selected'));
          pill.classList.add('selected');
        } else {
          this.selectedSymptoms.delete('None');
          this.symptomsPillsCatalog.querySelectorAll('.pill-option').forEach(p => {
            if (p.textContent === 'None') p.classList.remove('selected');
          });

          if (this.selectedSymptoms.has(sym)) {
            this.selectedSymptoms.delete(sym);
            pill.classList.remove('selected');
          } else {
            this.selectedSymptoms.add(sym);
            pill.classList.add('selected');
          }
        }
        this.validateLiveFormConsistency();
      });
      this.symptomsPillsCatalog.appendChild(pill);
    });
  }

  onPregnancyToggleChanged() {
    const isChecked = this.formIsPregnant.checked;
    this.pregnantToggleLabel.textContent = isChecked ? 'YES (Pregnant Beneficiary)' : 'No (Not Pregnant)';
    if (isChecked) {
      this.gestationalGroup.style.opacity = '1';
      this.gestationalGroup.style.pointerEvents = 'auto';
      this.gravidaGroup.style.opacity = '1';
      this.gravidaGroup.style.pointerEvents = 'auto';
      if (!this.formGestationalWeeks.value) this.formGestationalWeeks.value = '20';
    } else {
      this.gestationalGroup.style.opacity = '0.5';
      this.gestationalGroup.style.pointerEvents = 'none';
      this.gravidaGroup.style.opacity = '0.5';
      this.gravidaGroup.style.pointerEvents = 'none';
      this.formGestationalWeeks.value = '';
    }
    this.validateLiveFormConsistency();
  }

  loadFormSampleSita() {
    const sita = DEMO_HOUSEHOLDS[0].formData;
    this.formHouseholdId.value = sita.householdId;
    this.formPersonName.value = sita.personName;
    this.formAge.value = sita.age;
    this.formGender.value = sita.gender;
    this.formIsPregnant.checked = sita.isPregnant;
    this.onPregnancyToggleChanged();
    this.formGestationalWeeks.value = sita.gestationalAgeWeeks;
    this.formGravida.value = sita.previousPregnancies || 1;
    this.formChildrenCount.value = sita.childrenCount;
    this.formChildName.value = sita.childName || '';
    this.formFollowUp.checked = sita.followUpRequired;
    this.formNotes.value = sita.notes;

    this.selectedVaccines.clear();
    sita.vaccinations.forEach(v => this.selectedVaccines.add(v));
    this.vaccinesPillsCatalog.querySelectorAll('.pill-option').forEach(pill => {
      if (sita.vaccinations.includes(pill.textContent)) pill.classList.add('selected');
      else pill.classList.remove('selected');
    });

    this.selectedSymptoms.clear();
    this.selectedSymptoms.add('None');
    this.symptomsPillsCatalog.querySelectorAll('.pill-option').forEach(pill => {
      if (pill.textContent === 'None') pill.classList.add('selected');
      else pill.classList.remove('selected');
    });

    this.validateLiveFormConsistency();
    this.showToast('Loaded demo sample data for Sita (H001)', 'info');
  }

  validateLiveFormConsistency() {
    const formData = {
      householdId: this.formHouseholdId ? this.formHouseholdId.value.trim().toUpperCase() : 'H001',
      name: this.formPersonName.value,
      age: this.formAge.value,
      isPregnant: this.formIsPregnant.checked,
      gestationalAgeWeeks: this.formGestationalWeeks.value,
      childrenCount: this.formChildrenCount.value,
      vaccinations: Array.from(this.selectedVaccines),
      symptoms: Array.from(this.selectedSymptoms),
      vitals: { bp: this.formBp.value, temperature: this.formTemp.value, spo2: this.formSpo2.value },
      followUpRequired: this.formFollowUp.checked
    };

    const allProfiles = diagnosticManager.getAllProfiles();
    const check = ConsistencyChecker.validate(formData, allProfiles);
    this.renderConsistencyAlert(check, this.formConsistencyAlertContainer, 'form');
    return check;
  }

  renderConsistencyAlert(checkResult, targetContainer, context = 'form') {
    if (!targetContainer) return;
    targetContainer.innerHTML = '';

    if (!checkResult) return;

    const hasIssues = checkResult.issues && checkResult.issues.length > 0;
    const dup = checkResult.duplicateMatch;

    if (!hasIssues && !dup) return;

    // 1. If duplicate detected, render the rich CDM Duplicate Resolution Box
    if (dup && dup.isDuplicate) {
      const user = this.storage.getCurrentUser();
      const currentVisitingAsha = user.defaultUser;
      const matchedProfile = dup.matchedProfile;

      if (context === 'form') {
        this.formMatchedDuplicateProfileId = matchedProfile.personId;
        if (!this.formSelectedDuplicateResolution) this.formSelectedDuplicateResolution = 'MERGE';
      } else {
        this.voiceMatchedDuplicateProfileId = matchedProfile.personId;
        if (!this.voiceSelectedDuplicateResolution) this.voiceSelectedDuplicateResolution = 'MERGE';
      }

      const activeRes = context === 'form' ? this.formSelectedDuplicateResolution : this.voiceSelectedDuplicateResolution;

      const dupBox = document.createElement('div');
      dupBox.className = 'duplicate-beneficiary-alert-box';
      dupBox.innerHTML = `
        <div class="dup-alert-top">
          <div class="dup-alert-badge">
            <span class="dup-pulse-dot"></span>
            <span>⚠️ Potential Duplicate Beneficiary Detected (${dup.matchScore}% Match)</span>
          </div>
          <span class="dup-cdm-pill">CDM Single Source of Truth Safeguard</span>
        </div>

        <div class="dup-alert-summary">
          <div class="dup-match-reasons">
            <span style="font-weight: 700;">Match indicators:</span>
            ${dup.reasons.map(r => `<span class="dup-reason-tag">✓ ${r}</span>`).join(' ')}
          </div>
          <div class="dup-existing-card">
            <div class="dup-person-avatar">👩</div>
            <div class="dup-person-meta">
              <div class="dup-person-name">
                <strong>${matchedProfile.name}</strong>
                <span class="dup-pid-badge">${matchedProfile.personId}</span>
                <span class="dup-hh-badge">Household ${matchedProfile.householdId}</span>
              </div>
              <div class="dup-person-sub">
                Age: ${matchedProfile.age} yrs • Last visit: ${dup.lastEncounterDate} by ${dup.lastAsha} • ${dup.encounterCount} encounter(s) in longitudinal record
              </div>
            </div>
          </div>
        </div>

        <div class="dup-resolution-prompt">
          <div class="dup-prompt-title">How should the Common Data Model (CDM) handle this encounter?</div>
          <div class="dup-choices-grid">
            <label class="dup-choice-card ${activeRes === 'MERGE' ? 'selected' : ''}" data-action="MERGE">
              <input type="radio" name="dupResolution_${context}" value="MERGE" ${activeRes === 'MERGE' ? 'checked' : ''}>
              <div class="dup-choice-content">
                <div class="dup-choice-header">
                  <strong>🔄 Merge into Existing Profile</strong>
                  <span class="dup-recom-badge">Recommended</span>
                </div>
                <p class="dup-choice-desc">
                  Retains <strong>${matchedProfile.personId}</strong> as Single Source of Truth. Logs Visit #${dup.encounterCount + 1} to longitudinal timeline, updates vitals, and attributes ${currentVisitingAsha}. Eliminates duplicate ghost entries across all 6 national schemas.
                </p>
              </div>
            </label>

            <label class="dup-choice-card ${activeRes === 'DISTINCT' ? 'selected' : ''}" data-action="DISTINCT">
              <input type="radio" name="dupResolution_${context}" value="DISTINCT" ${activeRes === 'DISTINCT' ? 'checked' : ''}>
              <div class="dup-choice-content">
                <div class="dup-choice-header">
                  <strong>➕ Save as Distinct Person</strong>
                  <span class="dup-distinct-badge">New Beneficiary UID</span>
                </div>
                <p class="dup-choice-desc">
                  Generates a new distinct person ID if this is a different individual with a coincidental name match in the same household.
                </p>
              </div>
            </label>
          </div>
        </div>
      `;

      // Bind choice changes
      const cards = dupBox.querySelectorAll('.dup-choice-card');
      cards.forEach(card => {
        card.addEventListener('click', () => {
          const action = card.getAttribute('data-action');
          cards.forEach(c => {
            c.classList.remove('selected');
            const radio = c.querySelector('input[type="radio"]');
            if (radio) radio.checked = (c === card);
          });
          card.classList.add('selected');

          if (context === 'form') {
            this.formSelectedDuplicateResolution = action;
          } else {
            this.voiceSelectedDuplicateResolution = action;
          }

          if (action === 'MERGE') {
            this.showToast(`CDM Resolution: Will merge into existing longitudinal profile (${matchedProfile.personId})`, 'info');
          } else {
            this.showToast(`CDM Resolution: Will generate new distinct person UID`, 'info');
          }
        });
      });

      targetContainer.appendChild(dupBox);
    }

    // 2. Render other standard data consistency verification flags (excluding duplicate flag which is rendered above)
    const standardIssues = checkResult.issues.filter(i => i.id !== 'potential-duplicate-person');
    if (standardIssues.length > 0) {
      const panel = document.createElement('div');
      const isError = standardIssues.some(i => i.severity === 'error');
      panel.className = `consistency-panel ${isError ? 'error' : ''}`;

      let html = `
        <div class="consistency-header">
          <span>${isError ? '⚠️' : 'ℹ️'}</span>
          <span>Data Consistency Check: ${standardIssues.length} Verification Flag${standardIssues.length > 1 ? 's' : ''}</span>
        </div>
        <ul style="padding-left: 1.25rem; font-size: 0.86rem; color: #78350F;">
      `;

      standardIssues.forEach(issue => {
        html += `<li><strong>${issue.title}:</strong> ${issue.message}</li>`;
      });

      html += `
        </ul>
        <div class="consistency-disclaimer">${checkResult.disclaimer}</div>
      `;

      panel.innerHTML = html;
      targetContainer.appendChild(panel);
    }
  }

  handleStandardFormSubmit() {
    const name = this.formPersonName.value.trim();
    const age = Number(this.formAge.value);

    if (!name) {
      this.showToast('Please enter the Beneficiary Name.', 'warning');
      this.formPersonName.focus();
      return;
    }

    if (!age || age <= 0) {
      this.showToast('Please enter a valid age.', 'warning');
      this.formAge.focus();
      return;
    }

    if (!this.formConsentCheckbox.checked) {
      this.showToast('Please record verbal consent before finalizing documentation.', 'warning');
      return;
    }

    const isPreg = this.formIsPregnant.checked;
    const weeks = isPreg ? Number(this.formGestationalWeeks.value) || 0 : null;
    const user = this.storage.getCurrentUser();

    // CDM Duplicate Resolution: If MERGE is selected with a matched profile, retain existing Person UID
    const isMerge = (this.formSelectedDuplicateResolution === 'MERGE' && this.formMatchedDuplicateProfileId);
    const targetPersonId = isMerge ? this.formMatchedDuplicateProfileId : '';

    const commonRecord = createCommonRecord({
      householdId: this.formHouseholdId.value || 'H001',
      personId: targetPersonId,
      personName: name,
      age: age,
      gender: this.formGender.value,
      phoneNumber: this.formPhone.value,
      householdMembers: Number(this.formHouseholdMembers.value) || 4,
      childrenCount: Number(this.formChildrenCount.value) || 0,
      elderlyMembers: Number(this.formElderlyCount.value) || 0,
      isPregnant: isPreg,
      gestationalAgeWeeks: weeks,
      previousPregnancies: Number(this.formGravida.value) || (isPreg ? 1 : 0),
      childName: this.formChildName.value,
      childAge: this.formChildAge.value,
      vaccinations: Array.from(this.selectedVaccines),
      symptoms: this.selectedSymptoms.size > 0 ? Array.from(this.selectedSymptoms) : ['None'],
      vitals: { bp: this.formBp.value, temperature: Number(this.formTemp.value) || 98.4, spo2: Number(this.formSpo2.value) || 98 },
      followUpRequired: this.formFollowUp.checked,
      notes: this.formNotes.value,
      source: 'FORM',
      createdBy: user.defaultUser
    });

    const outputs = SchemaMappingEngine.transformAll(commonRecord);
    const saveResult = this.storage.saveEncounter(commonRecord, outputs);

    // Save attached supporting verification files to document store
    if (this.formAttachedFiles && this.formAttachedFiles.length > 0) {
      const pid = targetPersonId || (commonRecord.household_id === 'H001' ? 'P001' : (commonRecord.household_id === 'H002' ? 'P002' : `P-${commonRecord.person.name.substring(0, 3).toUpperCase()}`));
      this.formAttachedFiles.forEach(fileObj => {
        documentStore.addDocument({
          title: fileObj.name,
          category: fileObj.category || 'Clinical Report',
          personId: pid,
          personName: commonRecord.person.name,
          householdId: commonRecord.household_id,
          date: new Date().toISOString().split('T')[0],
          fileType: fileObj.fileType || 'application/pdf',
          fileSize: fileObj.fileSize || '120 KB',
          dataUrl: fileObj.dataUrl,
          verified: false,
          origin: 'ASHA ENTERED'
        });
      });
      this.formAttachedFiles = [];
      if (this.formAttachedFilesList) this.formAttachedFilesList.innerHTML = '';
      if (this.formUploadFileLabel) this.formUploadFileLabel.textContent = 'Supported: PDF, JPG, JPEG, PNG (Saved locally to Person Health Profile)';
    }

    // Sync into diagnostic profile registry with duplicate resolution options
    const diagProf = diagnosticManager.upsertProfileFromEncounter(commonRecord, {
      action: this.formSelectedDuplicateResolution || 'MERGE',
      matchedPersonId: this.formMatchedDuplicateProfileId
    });
    this.populateQuickPersonSelect();
    if (diagProf) this.activeDiagnosticPersonId = diagProf.personId;

    this.currentOutputData = outputs;
    this.renderOutputView();

    if (isMerge) {
      this.showToast(`🔄 CDM Merged: Encounter added to existing longitudinal trajectory for ${diagProf.name} (${diagProf.personId})!`, 'success');
    } else if (saveResult.savedOffline) {
      this.showToast('Form saved offline to local queue! (Sync pending)', 'warning');
    } else {
      this.showToast('Form submitted: Generated 3 programme records!', 'success');
    }

    this.switchView('output');
  }

  // =========================================================================
  // Output Screen & Multi-Schema Rendering
  // =========================================================================
  renderOutputView() {
    if (!this.currentOutputData) return;

    const cdm = this.currentOutputData.source_cdm;
    this.outputEncounterTitle.textContent = `Household Encounter: ${cdm.person.name} (${cdm.household_id})`;

    this.switchSchemaTab(this.activeSchemaTab);
  }

  switchSchemaTab(schemaKey) {
    this.activeSchemaTab = schemaKey;

    this.schemaTabBtns.forEach(btn => {
      if (btn.getAttribute('data-schema') === schemaKey) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    if (!this.currentOutputData) return;

    let targetData = null;
    let title = '';
    let code = '';
    let desc = '';
    let originMap = {};

    if (schemaKey === 'cdm') {
      targetData = this.currentOutputData.source_cdm;
      title = 'Common Data Model (Normalized Source of Truth)';
      code = 'CDM-v2.0-NORMALIZED';
      desc = 'Single normalized master record capturing all household observations.';
      originMap = {
        'encounter_id': 'Generated UID',
        'person.name': 'Captured Once',
        'person.age': 'Captured Once',
        'maternal.gestational_age_weeks': 'Captured Once',
        'children.recorded_vaccines': 'Captured Once'
      };
    } else {
      const outputObj = this.currentOutputData.outputs.find(o => o.id === schemaKey);
      if (outputObj) {
        targetData = outputObj.data;
        title = outputObj.schema_label;
        code = outputObj.code;
        desc = outputObj.description;
        originMap = this.getOriginMappingForSchema(schemaKey);
      }
    }

    this.dispSchemaTitle.textContent = title;
    this.dispSchemaCode.textContent = code;
    this.dispSchemaDesc.textContent = desc;

    // Render Human Table
    this.dispFieldsTableBody.innerHTML = '';
    for (const [k, v] of Object.entries(targetData || {})) {
      if (k === 'disclaimer' || k === 'schema_type') continue;

      const row = document.createElement('tr');
      const origin = originMap[k] || 'Mapped from CDM';

      let valText = typeof v === 'object' ? JSON.stringify(v) : String(v);
      if (typeof v === 'boolean') {
        valText = v ? '✅ TRUE' : '❌ FALSE';
      }

      row.innerHTML = `
        <td class="field-key-name">${k}</td>
        <td><strong>${valText}</strong></td>
        <td><span class="programme-tag" style="font-size: 0.72rem;">${origin}</span></td>
      `;
      this.dispFieldsTableBody.appendChild(row);
    }

    // Render Raw JSON
    this.dispJsonCode.textContent = JSON.stringify(targetData, null, 2);
  }

  getOriginMappingForSchema(schemaKey) {
    if (schemaKey === 'maternal') {
      return {
        'mother_full_name': 'Mapped from cdm.person.name',
        'gestation': 'Formatted from cdm.maternal.gestational_age_weeks',
        'anc_trimester': 'Computed from weeks',
        'estimated_delivery_date': 'Computed EDD algorithm',
        'gravida_previous_pregnancies': 'Mapped from cdm.maternal',
        'ifa_tablets_eligible': 'Rule: gestation >= 12 wks',
        'high_risk_pregnancy_flag': 'Observation rule evaluator'
      };
    } else if (schemaKey === 'immunisation') {
      return {
        'guardian_name': 'Mapped from cdm.person.name',
        'child_name': 'Mapped from cdm.children.child_name',
        'child_age': 'Mapped from cdm.children.child_age',
        'completed_antigens': 'Mapped from cdm.children.recorded_vaccines',
        'due_vaccine_schedule': 'UIP Schedule logic engine',
        'immunisation_compliance_status': 'UIP compliance evaluator'
      };
    } else if (schemaKey === 'household') {
      return {
        'census_hh_code': 'Mapped from cdm.household_id',
        'primary_informant_name': 'Mapped from cdm.person.name',
        'pregnant_member': 'Mapped from cdm.maternal.is_pregnant',
        'under_five_children': 'Mapped from cdm.children.count',
        'total_household_members': 'Mapped from cdm.household.total_members',
        'sanitation_and_health_risk': 'Aggregated symptoms surveillance'
      };
    } else if (schemaKey === 'diagnostic') {
      return {
        'register_id': 'Clinical register ID generator',
        'beneficiary_id': 'Mapped from cdm.person.id',
        'beneficiary_name': 'Mapped from cdm.person.name',
        'blood_pressure': 'Mapped from vitals.bp',
        'systolic_status': 'Evaluated clinical standard range',
        'body_temperature_f': 'Mapped from vitals.temp',
        'pulse_oximetry_spo2': 'Mapped from vitals.spo2',
        'reported_symptoms_count': 'Aggregated symptoms count',
        'clinical_action_mandated': 'Follow-up safety requirement'
      };
    } else if (schemaKey === 'supplies') {
      return {
        'distribution_code': 'Household supply distribution index',
        'household_id': 'Mapped from cdm.household_id',
        'recipient_name': 'Mapped from cdm.person.name',
        'ifa_tablets_dispensed': 'Maternal ANC supply protocol',
        'ors_sachets_provided': 'Household diarrhea buffer stock',
        'zinc_tablets_provided': 'Child health supplement',
        'distribution_date': 'Encounter date',
        'inventory_batch_verified': 'ASHA field kit protocol'
      };
    } else if (schemaKey === 'programme_reporting') {
      return {
        'reporting_register_code': 'Public Health Scheme tracking register index',
        'person_id': 'Beneficiary UID mapped from cdm.person',
        'beneficiary_name': 'Mapped from cdm.person.name',
        'family_id': 'Household cluster mapped from cdm.household_id',
        'active_schemes_enrolled': 'Total linked public health programmes',
        'primary_programme_applied': 'Identified clinical priority scheme',
        'verification_status': 'Frontline validation triage status',
        'cash_transfer_status': 'Direct Benefit Transfer (DBT) progress flag',
        'follow_up_mandated': 'Longitudinal welfare compliance surveillance'
      };
    } else {
      return {};
    }
  }

  setOutputViewMode(mode) {
    this.outputViewMode = mode;
    if (mode === 'card') {
      this.viewModeCardBtn.classList.add('active');
      this.viewModeJsonBtn.classList.remove('active');
      this.schemaCardView.style.display = 'block';
      this.schemaJsonView.style.display = 'none';
    } else {
      this.viewModeCardBtn.classList.remove('active');
      this.viewModeJsonBtn.classList.add('active');
      this.schemaCardView.style.display = 'none';
      this.schemaJsonView.style.display = 'block';
    }
  }

  copyJsonToClipboard() {
    const text = this.dispJsonCode.textContent;
    navigator.clipboard.writeText(text).then(() => {
      this.showToast('Schema JSON copied to clipboard!', 'success');
    }).catch(() => {
      this.showToast('Failed to copy to clipboard', 'warning');
    });
  }

  downloadAllSchemasJson() {
    if (!this.currentOutputData) return;
    const blob = new Blob([JSON.stringify(this.currentOutputData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ASHA_Encounter_${this.currentOutputData.source_cdm.household_id}_AllSchemas.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.showToast('Exported all 3 programme schemas to JSON!', 'success');
  }

  // =========================================================================
  // =========================================================================
  // Timeline & Audit Views (Multi-Profile Dynamic Timeline)
  // =========================================================================
  renderTimeline() {
    if (!this.householdTimelineContainer) return;

    const households = this.storage.getHouseholdsList();
    const currentSelected = this.selectedTimelineHousehold || 'ALL';

    // Populate timeline household dropdown
    if (this.timelineHouseholdSelect) {
      this.timelineHouseholdSelect.innerHTML = `
        <option value="ALL" ${currentSelected === 'ALL' ? 'selected' : ''}>Show All Registered Profiles (Cluster Overview)</option>
      `;
      households.forEach(h => {
        const pregStr = h.isPregnant ? `Pregnant (${h.gestationalAgeWeeks || 0}w)` : 'Non-pregnant';
        const opt = document.createElement('option');
        opt.value = h.householdId;
        opt.textContent = `${h.householdId} - ${h.personName} (${pregStr}, ${h.encountersCount} visit${h.encountersCount > 1 ? 's' : ''})`;
        if (h.householdId === currentSelected) opt.selected = true;
        this.timelineHouseholdSelect.appendChild(opt);
      });
    }

    // Profile summary card handling
    if (currentSelected !== 'ALL') {
      const hProfile = households.find(h => h.householdId === currentSelected);
      if (hProfile && this.timelineProfileSummaryCard) {
        this.timelineProfileSummaryCard.style.display = 'flex';
        this.profHeadIcon.textContent = hProfile.isPregnant ? '🤰' : '🏠';
        this.profHeadName.textContent = `${hProfile.personName} (Household ${hProfile.householdId})`;
        this.profHeadStatus.textContent = hProfile.isPregnant ? `Pregnant (${hProfile.gestationalAgeWeeks || 0}w)` : `Family Head (${hProfile.childrenCount} children)`;
        this.profHeadDetails.textContent = `Age: ${hProfile.age} yrs • ${hProfile.gender} • Address: ${hProfile.address || 'Village Rampur'} • Phone: ${hProfile.phone || '9848012345'} • ${hProfile.encountersCount} Historical Encounters Recorded`;
        if (this.btnDeleteSelectedProfile) this.btnDeleteSelectedProfile.style.display = 'inline-flex';
      }
    } else {
      if (this.timelineProfileSummaryCard) this.timelineProfileSummaryCard.style.display = 'none';
      if (this.btnDeleteSelectedProfile) this.btnDeleteSelectedProfile.style.display = 'none';
    }

    // Fetch timeline events
    const timeline = this.storage.getTimeline(currentSelected);
    this.householdTimelineContainer.innerHTML = '';

    if (timeline.length === 0) {
      this.householdTimelineContainer.innerHTML = `
        <div style="padding: 2.5rem; text-align: center; color: var(--text-muted); background: #F8FAFC; border-radius: var(--radius-lg); border: 1px dashed var(--border-medium);">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">📋</div>
          <strong>No timeline events recorded for this profile yet.</strong>
          <p style="font-size: 0.85rem; margin-top: 0.25rem;">Start an encounter from Voice Studio or Standard Form.</p>
        </div>
      `;
      return;
    }

    const allEncounters = this.storage.getAllEncounters();

    timeline.forEach(event => {
      const item = document.createElement('div');
      item.className = 'timeline-item';

      const matchedEnc = allEncounters.find(e => e.id === event.encounterId || (e.commonRecord?.household_id === event.householdId && (e.commonRecord?.timestamp || '').startsWith(event.date)));

      let schemaBtnHtml = '';
      if (matchedEnc) {
        schemaBtnHtml = `<button type="button" class="btn-inspect-enc btn-view-schemas" style="font-size: 0.78rem; padding: 0.35rem 0.75rem;">Inspect 3 Registers →</button>`;
      }

      let deleteEncBtnHtml = '';
      if (matchedEnc) {
        deleteEncBtnHtml = `<button type="button" class="btn-delete-enc btn-delete-visit" style="font-size: 0.78rem; padding: 0.35rem 0.75rem;">🗑️ Delete Visit</button>`;
      }

      item.innerHTML = `
        <div class="timeline-card">
          <div class="timeline-header">
            <span class="timeline-title">${event.title} <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 500;">(${event.householdId || 'H001'})</span></span>
            <span class="timeline-date">📅 ${event.date}</span>
          </div>
          <div class="timeline-author">Recorded by: <strong>${event.author}</strong> • <span class="programme-tag">${event.badge}</span></div>
          <p style="font-size: 0.88rem; color: var(--text-main); margin: 0;">${event.summary}</p>
          ${(schemaBtnHtml || deleteEncBtnHtml) ? `
            <div class="timeline-actions-row">
              ${schemaBtnHtml}
              ${deleteEncBtnHtml}
            </div>
          ` : ''}
        </div>
      `;

      if (matchedEnc) {
        const viewBtn = item.querySelector('.btn-view-schemas');
        if (viewBtn) {
          viewBtn.addEventListener('click', () => {
            this.currentOutputData = matchedEnc.outputs;
            this.renderOutputView();
            this.switchView('output');
          });
        }

        const delBtn = item.querySelector('.btn-delete-visit');
        if (delBtn) {
          delBtn.addEventListener('click', () => {
            this.handleDeleteEncounter(matchedEnc.id);
          });
        }
      }

      this.householdTimelineContainer.appendChild(item);
    });
  }

  showConfirmDialog({ title, subtitle, message, confirmText = '🗑️ Permanently Delete' }) {
    return new Promise((resolve) => {
      if (!this.deleteModalBackdrop) {
        resolve(window.confirm(message.replace(/<[^>]+>/g, '')));
        return;
      }

      this.deleteModalTitle.textContent = title;
      this.deleteModalSubtitle.textContent = subtitle || 'Kalachakra 2K26 Healthcare PS-H02 Storage Action';
      this.deleteModalBody.innerHTML = message;
      this.btnConfirmDelete.textContent = confirmText;
      this.deleteModalBackdrop.style.display = 'flex';

      const cleanup = (confirmed) => {
        this.deleteModalBackdrop.style.display = 'none';
        this.btnConfirmDelete.onclick = null;
        this.btnCancelDelete.onclick = null;
        this.btnCancelDeleteX.onclick = null;
        resolve(confirmed);
      };

      this.btnConfirmDelete.onclick = () => cleanup(true);
      this.btnCancelDelete.onclick = () => cleanup(false);
      this.btnCancelDeleteX.onclick = () => cleanup(false);
    });
  }

  async handleDeleteSelectedProfile() {
    const hid = this.selectedTimelineHousehold;
    if (!hid || hid === 'ALL') {
      this.showToast('Please select a specific household profile to delete.', 'warning');
      return;
    }

    const confirmed = await this.showConfirmDialog({
      title: `Delete Profile Registration: ${hid}`,
      subtitle: 'Kalachakra 2K26 PS-H02 Household Longitudinal Timeline',
      message: `Are you sure you want to permanently delete the profile registration for <strong>Household ${hid}</strong>?<br><br>All longitudinal visit history, immunisation records, and programme register outputs for this family will be removed from local storage and sync queue.`
    });

    if (confirmed) {
      const res = this.storage.deleteHouseholdProfile(hid);
      this.selectedTimelineHousehold = 'ALL';
      this.renderTimeline();
      this.renderEncountersList();
      this.showToast(`Profile registration ${hid} deleted successfully (${res.removedCount} records removed).`, 'warning');
    }
  }

  async handleDeleteEncounter(encounterId) {
    const target = this.storage.getAllEncounters().find(e => e.id === encounterId);
    const personName = target?.commonRecord?.person?.name || 'Beneficiary';
    const hid = target?.commonRecord?.household_id || 'H001';

    const confirmed = await this.showConfirmDialog({
      title: `Delete Encounter Record`,
      subtitle: `Encounter UID: ${encounterId}`,
      message: `Are you sure you want to delete the encounter registration for <strong>${personName} (${hid})</strong>?<br><br>The generated programme registers (Maternal, UIP, Household) and longitudinal visit entry will be removed.`
    });

    if (confirmed) {
      const res = this.storage.deleteEncounter(encounterId);
      if (res.success) {
        this.renderEncountersList();
        this.renderTimeline();
        this.showToast(`Encounter registration for ${res.personName} (${res.householdId}) deleted.`, 'warning');
      }
    }
  }

  async handleDeleteCurrentOutputRecord() {
    if (!this.currentOutputData) return;
    const cdm = this.currentOutputData.source_cdm;

    const confirmed = await this.showConfirmDialog({
      title: `Delete Record from Registers`,
      subtitle: `Encounter UID: ${cdm.encounter_id}`,
      message: `Are you sure you want to delete the current encounter registration for <strong>${cdm.person.name} (${cdm.household_id})</strong>?`
    });

    if (confirmed) {
      const res = this.storage.deleteEncounter(cdm.encounter_id);
      if (res.success) {
        this.showToast(`Record for ${res.personName} (${res.householdId}) deleted.`, 'warning');
        const remaining = this.storage.getAllEncounters();
        if (remaining.length > 0) {
          this.currentOutputData = remaining[0].outputs;
          this.renderOutputView();
        } else {
          this.currentOutputData = null;
          this.switchView('dashboard');
        }
        this.renderEncountersList();
        this.renderTimeline();
      }
    }
  }

  renderAuditLogs() {
    const logs = this.storage.getAuditLogs();
    if (!this.auditLogsTableBody) return;

    this.auditLogsTableBody.innerHTML = '';
    logs.forEach(log => {
      const row = document.createElement('tr');
      const timeFormatted = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      row.innerHTML = `
        <td style="font-family: var(--font-mono); font-size: 0.8rem;">${timeFormatted}</td>
        <td><strong>${log.user}</strong> <span class="programme-tag" style="font-size: 0.68rem;">${log.role}</span></td>
        <td><span class="field-key-name">${log.action}</span></td>
        <td style="font-size: 0.85rem;">${log.details}</td>
      `;
      this.auditLogsTableBody.appendChild(row);
    });
  }

  // =========================================================================
  // Fast 1-Click Demo Runner (For Hackathon Judges)
  // =========================================================================
  runFullDemoSita() {
    const sitaDemo = DEMO_HOUSEHOLDS[0];
    this.voiceTranscriptInput.value = sitaDemo.speechTranscript;
    this.extractFromVoiceTranscript();

    setTimeout(() => {
      this.commitConfirmedVoiceEncounter();
      this.showToast('⚡ Fast Demo Executed: 1 encounter mapped to 3 schemas!', 'success');
    }, 450);
  }

  // =========================================================================
  // Dashboard & Impact Calculator
  // =========================================================================
  updateDashboardMetrics() {
    const encounters = this.storage.getAllEncounters();
    const queue = this.storage.getSyncQueue();

    this.metricVisitsCount.textContent = encounters.length;
    this.metricRecordsCount.textContent = encounters.length * 3;
    this.metricSyncCount.textContent = queue.length;

    if (queue.length > 0) {
      this.metricSyncStatus.textContent = `${queue.length} Pending Sync`;
      this.offlineQueueText.textContent = `${queue.length} pending`;
    } else {
      this.metricSyncStatus.textContent = 'Local Cache In Sync';
      this.offlineQueueText.textContent = '0 pending';
    }
  }

  renderEncountersList() {
    const encounters = this.storage.getAllEncounters();
    this.recentEncountersContainer.innerHTML = '';

    if (encounters.length === 0) {
      this.recentEncountersContainer.innerHTML = `
        <div style="padding: 2rem; text-align: center; color: var(--text-muted);">
          No encounters recorded yet. Start with Voice Studio or New Visit.
        </div>
      `;
      return;
    }

    encounters.forEach(item => {
      const cdm = item.commonRecord;
      const row = document.createElement('div');
      row.className = 'encounter-item';

      const isPreg = cdm.maternal?.is_pregnant ?? cdm.person.pregnancy_status;
      const pregWeeks = cdm.maternal?.gestational_age_weeks ?? cdm.person.gestational_age_weeks;
      const pregLabel = isPreg ? `🤰 Pregnant (${pregWeeks || 0}w)` : 'Not pregnant';
      const childCount = cdm.household?.children_count ?? cdm.children?.count ?? 0;
      const childLabel = childCount > 0 ? `👶 ${childCount} child` : 'No children';

      row.innerHTML = `
        <div class="enc-person-info">
          <div class="enc-avatar">${isPreg ? '🤰' : '👩'}</div>
          <div class="enc-name-block">
            <span class="enc-name">${cdm.person.name} <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 500;">(HH: ${cdm.household_id})</span></span>
            <span class="enc-meta">${cdm.person.age} yrs • ${pregLabel} • ${childLabel} • <span class="field-key-name" style="font-size: 0.75rem;">${cdm.source}</span></span>
          </div>
        </div>

        <div class="enc-programme-tags">
          <span class="programme-tag maternal">Maternal Record</span>
          <span class="programme-tag uip">Immunisation Register</span>
          <span class="programme-tag household">Household Census</span>
        </div>

        <div style="display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap;">
          <span class="sync-badge ${item.syncStatus === 'synced' ? 'synced' : 'pending'}">
            ${item.syncStatus === 'synced' ? '● Central Synced' : '● Offline Cached'}
          </span>
          <button type="button" class="btn-inspect-enc inspect-btn">
            Inspect Schemas →
          </button>
          <button type="button" class="btn-inspect-enc timeline-btn" style="background: #F1F5F9; border-color: #CBD5E1;">
            🕒 Timeline
          </button>
          <button type="button" class="btn-delete-enc delete-btn" title="Delete profile registration">
            🗑️ Delete
          </button>
        </div>
      `;

      row.querySelector('.inspect-btn').addEventListener('click', () => {
        this.currentOutputData = item.outputs;
        this.renderOutputView();
        this.switchView('output');
      });

      row.querySelector('.timeline-btn').addEventListener('click', () => {
        this.selectedTimelineHousehold = cdm.household_id;
        this.switchView('timeline');
        this.renderTimeline();
      });

      row.querySelector('.delete-btn').addEventListener('click', () => {
        this.handleDeleteEncounter(item.id);
      });

      this.recentEncountersContainer.appendChild(row);
    });
  }

  updateCalculator() {
    const visits = Number(this.sliderVisits.value);
    const ashas = Number(this.sliderAshas.value);

    this.sliderVisitsVal.textContent = `${visits} visits`;
    this.sliderAshasVal.textContent = `${ashas} workers`;

    // Calculation Model:
    // Legacy: 18 mins per visit (repeated forms across 3 books)
    // ASHA Copilot: 3.5 mins per visit
    // Time saved per visit = 14.5 minutes = 0.2416 hours
    const weeklyHours = Math.round(visits * ashas * 0.2416 * 6);
    // Duplicate fields eliminated: 16 duplicate fields saved per visit
    const monthlyFields = (visits * ashas * 16 * 25).toLocaleString();

    this.calcHoursSaved.textContent = `${weeklyHours} Hours`;
    this.calcEntriesEliminated.textContent = `${monthlyFields} Fields`;
  }

  // =========================================================================
  // Multilingual UI Translation & Dynamic i18n
  // =========================================================================
  updateUILanguage() {
    const lang = i18n.getCurrentLanguage();

    // Translate any elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translation = i18n.t(key);
      if (translation && translation !== key) {
        el.textContent = translation;
      }
    });

    // Translate placeholder attributes with data-i18n-placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const translation = i18n.t(key);
      if (translation && translation !== key) {
        el.placeholder = translation;
      }
    });

    // Re-render diagnostic profile with new language
    this.renderDiagnosticPersonProfile(this.activeDiagnosticPersonId);
  }

  // =========================================================================
  // ASHA User Account Management & Record Attribution (Requirements 16-18)
  // =========================================================================
  updateUserSessionDisplay() {
    const user = userManager.getCurrentUser();
    if (!user) return;

    if (this.sessionUserName) {
      this.sessionUserName.textContent = `${user.userId} - ${user.fullName}`;
    }
    if (this.sessionUserAvatar) {
      this.sessionUserAvatar.textContent = user.role === 'ADMIN' ? '👨‍⚕️' : (user.role === 'ANM' ? '👩‍🔬' : '👩‍⚕️');
    }
    if (this.verifDoctorName && (user.role === 'ADMIN' || user.role === 'DOCTOR')) {
      this.verifDoctorName.value = `Dr. ${user.fullName} (${user.userId})`;
    }
  }

  openUserAuthModal() {
    if (!this.userAuthModal) return;
    const users = userManager.getAllUsers();
    const currentUser = userManager.getCurrentUser();

    if (this.usersListContainer) {
      this.usersListContainer.innerHTML = '';
      users.forEach(u => {
        const isActive = u.userId === currentUser.userId;
        const avatar = u.role === 'ADMIN' ? '👨‍⚕️' : (u.role === 'ANM' ? '👩‍🔬' : '👩‍⚕️');
        const card = document.createElement('div');
        card.className = `user-account-card ${isActive ? 'active' : ''}`;
        card.innerHTML = `
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span style="font-size: 1.5rem;">${avatar}</span>
            <div>
              <div style="font-weight: 800; font-size: 0.92rem; color: var(--text-main);">
                ${u.fullName} <span style="font-size: 0.75rem; color: var(--text-muted);">(${u.userId})</span>
              </div>
              <div style="font-size: 0.78rem; color: var(--text-muted);">
                ${u.role} • ${u.area} • Attributed records: ${u.recordsCreated || 0}
              </div>
            </div>
          </div>
          <div>
            ${isActive
            ? '<span class="brand-tag-pill" style="background:#D1FAE5; color:#065F46; font-weight:700;">ACTIVE</span>'
            : `<button type="button" class="btn-inspect-enc btn-switch-user" data-uid="${u.userId}" style="font-size:0.78rem; padding:0.3rem 0.75rem;">Switch</button>`
          }
          </div>
        `;

        const switchBtn = card.querySelector('.btn-switch-user');
        if (switchBtn) {
          switchBtn.addEventListener('click', () => {
            const uid = switchBtn.getAttribute('data-uid');
            const switched = userManager.switchUser(uid);
            if (switched) {
              this.updateUserSessionDisplay();
              this.userAuthModal.style.display = 'none';
              this.storage.logAuditEvent({
                action: 'USER_SWITCH',
                user: switched.fullName,
                role: switched.role,
                details: `Active ASHA account switched to ${switched.fullName} (${switched.userId}) for area ${switched.area}`
              });
              this.showToast(`Switched active user to: ${switched.fullName} (${switched.userId})`, 'success');
              this.renderAuditLogs();
            }
          });
        }

        this.usersListContainer.appendChild(card);
      });
    }

    if (this.panelUserSwitch) this.panelUserSwitch.style.display = 'block';
    if (this.panelUserCreate) this.panelUserCreate.style.display = 'none';
    if (this.tabUserSwitchBtn) this.tabUserSwitchBtn.classList.add('active');
    if (this.tabUserCreateBtn) this.tabUserCreateBtn.classList.remove('active');

    this.userAuthModal.style.display = 'flex';
  }

  handleCreateNewUser() {
    const fullName = (this.newFullName?.value || '').trim();
    const username = (this.newUsername?.value || '').trim();
    const phone = (this.newPhone?.value || '').trim() || '9848011111';
    const role = this.newRole?.value || 'ASHA';
    const area = (this.newArea?.value || '').trim() || 'Rampur Primary Sub-centre';

    if (!fullName) {
      this.showToast('Please enter the worker full name.', 'warning');
      this.newFullName?.focus();
      return;
    }
    if (!username) {
      this.showToast('Please enter a username or worker ID.', 'warning');
      this.newUsername?.focus();
      return;
    }

    const newUser = userManager.createUser({ fullName, username, phone, role, area });
    this.updateUserSessionDisplay();
    this.openUserAuthModal();

    if (this.newFullName) this.newFullName.value = '';
    if (this.newUsername) this.newUsername.value = '';
    if (this.newArea) this.newArea.value = '';

    this.storage.logAuditEvent({
      action: 'USER_CREATED',
      user: newUser.fullName,
      role: newUser.role,
      details: `New ${newUser.role} user created: ${newUser.fullName} (${newUser.userId}) for ${newUser.area}`
    });

    this.showToast(`Account created and activated for ${newUser.fullName} (${newUser.userId})`, 'success');
    this.renderAuditLogs();
  }

  // =========================================================================
  // Supporting Documents Handling (Requirements 2 & 3)
  // =========================================================================
  handleEncounterDocUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      this.showToast('File size exceeds 5MB limit.', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const docObj = {
        id: `DOC-ENC-${Date.now()}`,
        name: file.name,
        category: this.formDocCategory?.value || 'Clinical Report',
        dataUrl: reader.result,
        fileSize: `${Math.round(file.size / 1024)} KB`,
        fileType: file.type || 'application/pdf',
        date: new Date().toISOString().split('T')[0]
      };
      this.formAttachedFiles.push(docObj);
      this.renderFormAttachedFiles();
      if (this.formUploadFileLabel) {
        this.formUploadFileLabel.textContent = `✓ Attached ${this.formAttachedFiles.length} document(s)`;
      }
      this.showToast(`Document "${file.name}" attached for verification`, 'info');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  renderFormAttachedFiles() {
    if (!this.formAttachedFilesList) return;
    this.formAttachedFilesList.innerHTML = '';

    this.formAttachedFiles.forEach((doc, idx) => {
      const item = document.createElement('div');
      item.className = 'attached-doc-pill';
      item.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span>📎</span>
          <strong>${doc.name}</strong>
          <span class="brand-tag-pill" style="background: #E0E7FF; color: #3730A3;">${doc.category}</span>
          <span style="font-size: 0.74rem; color: var(--text-muted);">(${doc.fileSize})</span>
        </div>
        <button type="button" class="btn-close-modal btn-remove-doc" style="font-size: 1rem; color: #EF4444; padding: 0.2rem 0.5rem;" title="Remove file">✕</button>
      `;

      item.querySelector('.btn-remove-doc').addEventListener('click', () => {
        this.formAttachedFiles.splice(idx, 1);
        this.renderFormAttachedFiles();
        if (this.formUploadFileLabel) {
          this.formUploadFileLabel.textContent = this.formAttachedFiles.length > 0
            ? `✓ Attached ${this.formAttachedFiles.length} document(s)`
            : 'Supported: PDF, JPG, JPEG, PNG (Saved locally to Person Health Profile)';
        }
      });

      this.formAttachedFilesList.appendChild(item);
    });
  }

  // =========================================================================
  // Diagnostic Reports & Person Health Profile (Requirements 8-15)
  // =========================================================================
  populateQuickPersonSelect() {
    if (!this.quickPersonSelect) return;
    const profiles = diagnosticManager.getAllProfiles();
    this.quickPersonSelect.innerHTML = '';

    profiles.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.personId;
      const pName = p.name || p.personName || 'Beneficiary';
      opt.textContent = `${pName} (${p.personId} • ${p.householdId})`;
      if (p.personId === this.activeDiagnosticPersonId) opt.selected = true;
      this.quickPersonSelect.appendChild(opt);
    });
  }

  renderDiagnosticPersonProfile(personIdOrHhid) {
    if (!this.personProfileContentArea) return;
    const profile = diagnosticManager.getProfileByPersonOrHousehold(personIdOrHhid) || diagnosticManager.getAllProfiles()[0];
    if (!profile) return;

    this.activeDiagnosticPersonId = profile.personId;
    if (this.quickPersonSelect) this.quickPersonSelect.value = profile.personId;

    // Normalize property access
    const pName = profile.name || profile.personName || 'Beneficiary';
    const pAge = profile.age ?? profile.demographics?.age ?? 24;
    const pGender = profile.gender || profile.demographics?.gender || 'Female';
    const pPhone = profile.phone || profile.demographics?.phone || '9848012345 (Synthetic)';
    const pAddress = profile.address || profile.demographics?.address || 'House #4-12, Sector 4B, Rampur';
    const pCreatedBy = profile.attribution?.createdBy || 'ASHA001 - Lata Devi';
    const pCreatedDate = profile.attribution?.createdDate || '2026-08-15';
    const pModifiedBy = profile.attribution?.modifiedBy || 'ASHA001 - Lata Devi';
    const pModifiedDate = profile.attribution?.modifiedDate || '2026-09-05';

    const isPregnant = (profile.conditions || []).some(c => (c.type === 'Maternal' || (c.title || c.name || '').includes('Pregnancy'))) || profile.demographics?.isPregnant;
    const gestWeeks = profile.demographics?.gestationalAgeWeeks || 20;
    const avatar = isPregnant ? '🤰' : (pGender === 'Female' ? '👩' : '👨');
    const gestText = isPregnant ? `Pregnant (${gestWeeks} weeks)` : 'Non-pregnant';

    // Follow-up evaluation
    const followUp = profile.followUp || {
      condition: 'Routine Health Surveillance',
      verificationStatus: 'DOCTOR_VERIFIED',
      lastCheckupDate: '2026-09-05',
      lastReportDate: '2026-09-05',
      nextScheduledDate: '2026-10-02',
      notes: 'Routine checkup.'
    };
    const followUpEval = diagnosticManager.evaluateFollowUpStatus(followUp);

    // Stored documents
    const storedDocs = documentStore.getDocumentsForPerson(profile.personId);
    const allDocs = [...(profile.documents || [])];
    storedDocs.forEach(sd => {
      if (!allDocs.some(d => d.id === sd.id)) allDocs.push(sd);
    });
    if (allDocs.length === 0) {
      const allStored = documentStore.getAllDocuments();
      allStored.forEach(d => {
        if (d.personId === profile.personId || d.householdId === profile.householdId) allDocs.push(d);
      });
    }

    const hasOldReport = diagnosticManager.hasOldReport(allDocs);
    const personProgrammes = programmeManager.getAssignmentsForPerson(profile.personId);

    // Follow-up status badge
    const followUpBadgeClass = followUpEval.cssClass || 'status-up-to-date';
    const followUpBadgeText = followUpEval.badge || '🟢 Up to date';

    // Overdue Alert Banner HTML (Requirement 6)
    let overdueAlertHtml = '';
    if (followUpEval.isOverdue) {
      overdueAlertHtml = `
        <div class="overdue-alert-banner">
          <span style="font-size: 1.6rem;">⚠️</span>
          <div>
            <strong style="color: #991B1B; font-size: 1rem;">FOLLOW-UP OVERDUE (Safety Flag)</strong>
            <p style="margin: 0.25rem 0 0 0; font-size: 0.85rem; color: #B91C1C;">
              The scheduled follow-up date for this beneficiary (<strong>${followUp.nextScheduledDate || followUp.scheduledDate}</strong>) has passed without a documented check-up. Immediate frontline household contact recommended.
            </p>
          </div>
        </div>
      `;
    }

    // 30-Day Supporting Report Alert HTML (Requirement 7)
    let oldReportAlertHtml = '';
    if (hasOldReport) {
      oldReportAlertHtml = `
        <div class="recent-report-notice">
          <span>⚠️</span>
          <span><strong>Recent Clinical Report Required:</strong> Latest diagnostic report is older than 30 days. Recommend scheduling a fresh lab test or ultrasound review.</span>
        </div>
      `;
    }

    // Previous checkups & Vitals
    const checkups = profile.previousCheckups || (profile.vitalsHistory || []).map(v => ({
      date: v.date,
      conductedBy: 'ASHA Worker & MO',
      summary: 'Routine health assessment & vitals capture',
      vitals: v
    }));
    const currentVitals = (profile.vitalsHistory && profile.vitalsHistory[0]) || {
      bp: '118/76', heartRate: 74, spo2: 99, temp: 98.4, height: 158, weight: 56, bmi: '22.4'
    };
    const physicalExam = (profile.physicalExams && profile.physicalExams[0]) || profile.physicalExam || {
      lungs: 'Normal', skin: 'Normal', throat: 'Normal', eyes: 'Normal (No pallor)', ears: 'Normal', notes: 'Normal clinical state'
    };
    const timelineEvents = profile.healthTimeline || profile.timeline || [];
    const conditions = profile.conditions || [];
    const findings = profile.findings || [];
    const diagnosticResults = profile.diagnosticResults || [
      { testName: 'Obstetric Ultrasound (20w)', result: 'Normal fetal anatomy, single live intrauterine pregnancy', date: '2026-09-02', verified: true, origin: 'DOCTOR VERIFIED' }
    ];
    const labResults = profile.labResults || {
      hemoglobin: { value: '11.4 g/dL', unit: '11.0 - 15.0 g/dL', status: 'Normal' },
      bloodSugar: { value: '88 mg/dL', unit: '70 - 100 mg/dL', status: 'Normal' },
      urineProtein: { value: 'Nil / Absent', unit: 'Negative', status: 'Normal' }
    };

    // Linked Family Record for Bidirectional Navigation
    const linkedFamily = familyManager.getFamilyByPersonId(profile.personId) || familyManager.getFamilyById(profile.householdId) || familyManager.getAllFamilies()[0];
    const famId = linkedFamily ? linkedFamily.familyId : 'F042';
    const famHead = linkedFamily ? linkedFamily.familyHead : 'Harsh Kumar';
    const famHouse = linkedFamily ? linkedFamily.houseNumber : profile.householdId;

    // Build Full 11 Dimensions HTML
    this.personProfileContentArea.innerHTML = `
      <div class="person-profile-card">
        <!-- Bidirectional Link: Jump to Family Report (PS-H02 Requirement) -->
        <div class="diagnostic-family-banner">
          <div>
            <strong style="color: #1E3A8A; font-size: 0.95rem;">👨‍👩‍👧‍👦 Family Record Linked: Family ${famId} (${famHead})</strong>
            <div class="diagnostic-family-banner-text">
              House ${famHouse} • Household Census, Maternal/Child Schemes, Health Supplies & Family Vital Events
            </div>
          </div>
          <button type="button" class="btn-jump-family" id="btnJumpToFamilyReport" data-family-id="${famId}">
            <span>👨‍👩‍👧‍👦</span> VIEW FAMILY REPORT
          </button>
        </div>

        <!-- Hero Banner: Personal Info & Demographics -->
        <div class="profile-hero-banner">
          <div class="profile-hero-info">
            <div class="profile-hero-avatar">${avatar}</div>
            <div>
              <h3 class="profile-hero-name">${pName}</h3>
              <div class="profile-hero-sub">
                Person ID: <strong>${profile.personId}</strong> • Household ID: <strong>${profile.householdId}</strong> • Age: <strong>${pAge} yrs</strong> • ${gestText}
              </div>
              <div style="font-size: 0.78rem; color: #CCFBF1; margin-top: 0.35rem;">
                Attribution: Created by <strong>${pCreatedBy}</strong> on ${pCreatedDate} • Modified by <strong>${pModifiedBy}</strong> (${pModifiedDate})
              </div>
            </div>
          </div>
          <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 0.4rem;">
            <span class="status-badge-lg ${followUpBadgeClass}">${followUpBadgeText}</span>
            <span style="font-size: 0.78rem; color: #CCFBF1;">Next Visit: <strong>${followUp.nextScheduledDate || followUp.scheduledDate}</strong></span>
            <button type="button" class="btn-hero-add-trigger" style="margin-top: 0.45rem; padding: 0.45rem 1rem; font-size: 0.85rem; box-shadow: 0 2px 8px rgba(0,0,0,0.2); background: #F59E0B; color: #1E293B; font-weight: 800; border: none; border-radius: var(--radius-sm); cursor: pointer; display: flex; align-items: center; gap: 0.4rem;">
              <span>➕</span> + ADD TO HEALTH PROFILE
            </button>
          </div>
        </div>

        <!-- Quick Stats Grid -->
        <div class="profile-stats-grid">
          <div class="profile-stat-box">
            <div class="profile-stat-val">${checkups.length}</div>
            <div class="profile-stat-lbl">Check-ups</div>
          </div>
          <div class="profile-stat-box">
            <div class="profile-stat-val">${diagnosticResults.length}</div>
            <div class="profile-stat-lbl">Diagnostic Tests</div>
          </div>
          <div class="profile-stat-box">
            <div class="profile-stat-val">${allDocs.length}</div>
            <div class="profile-stat-lbl">Stored Documents</div>
          </div>
          <div class="profile-stat-box">
            <div class="profile-stat-val">${conditions.length}</div>
            <div class="profile-stat-lbl">Active Conditions</div>
          </div>
        </div>

        <!-- Follow-up Surveillance Monitoring Card (Requirement 5, 6, 7) -->
        <div class="followup-monitoring-card">
          <div class="followup-header">
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <span style="font-size: 1.3rem;">📅</span>
              <strong style="font-size: 1rem; color: var(--text-main);">Pregnancy & Confirmed Condition Follow-Up Tracker</strong>
            </div>
            <span class="status-badge-lg ${followUpBadgeClass}">${followUpBadgeText}</span>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; font-size: 0.86rem;">
            <div>
              <span style="color: var(--text-muted); font-size: 0.76rem; text-transform: uppercase; font-weight: 700;">Condition:</span>
              <div style="font-weight: 800; color: var(--text-main);">${followUp.condition}</div>
            </div>
            <div>
              <span style="color: var(--text-muted); font-size: 0.76rem; text-transform: uppercase; font-weight: 700;">Verification Status:</span>
              <div><span class="brand-tag-pill" style="background: #D1FAE5; color: #065F46; font-weight: 700;">${followUp.verificationStatus}</span></div>
            </div>
            <div>
              <span style="color: var(--text-muted); font-size: 0.76rem; text-transform: uppercase; font-weight: 700;">Last Check-up:</span>
              <div style="font-weight: 700; color: var(--text-main);">${followUp.lastCheckupDate}</div>
            </div>
            <div>
              <span style="color: var(--text-muted); font-size: 0.76rem; text-transform: uppercase; font-weight: 700;">Next Scheduled Date:</span>
              <div style="font-weight: 800; color: #0D9488;">${followUp.nextScheduledDate || followUp.scheduledDate}</div>
            </div>
          </div>
          ${overdueAlertHtml}
          ${oldReportAlertHtml}
        </div>

        <!-- 11 CLINICAL DIMENSIONS SECTIONS -->

        <!-- Dimension 1: Personal Information -->
        <div class="profile-section-block">
          <div class="profile-section-title">
            <span>👤</span> Dimension 1: Personal & Demographic Information
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem; font-size: 0.88rem;">
            <div><strong>Full Name:</strong> ${pName}</div>
            <div><strong>Person ID:</strong> ${profile.personId}</div>
            <div><strong>Household ID:</strong> ${profile.householdId}</div>
            <div><strong>Age & Gender:</strong> ${pAge} yrs • ${pGender}</div>
            <div><strong>Phone (Synthetic):</strong> ${pPhone}</div>
            <div><strong>Address:</strong> ${pAddress}</div>
          </div>
        </div>

        <!-- Dimension 2: Confirmed & Reported Conditions -->
        <div class="profile-section-block">
          <div class="profile-section-title">
            <span>🏷️</span> Dimension 2: Confirmed & Reported Conditions
          </div>
          <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
            ${conditions.length > 0 ? conditions.map(c => `
              <div style="background: #F8FAFC; border: 1.5px solid var(--border-medium); border-radius: var(--radius-md); padding: 0.75rem 1rem; display: flex; align-items: center; gap: 0.75rem;">
                <span style="font-size: 1.2rem;">${(c.title || c.name || '').includes('Pregnancy') ? '🤰' : '🩺'}</span>
                <div>
                  <div style="font-weight: 800; color: var(--text-main); font-size: 0.92rem;">${c.title || c.name}</div>
                  <div style="font-size: 0.76rem; color: var(--text-muted);">Status: <span class="brand-tag-pill" style="background:#D1FAE5; color:#065F46;">${c.status || 'DOCTOR_VERIFIED'}</span> • Since: ${c.recordedDate || c.diagnosedDate || '2026-08-15'}</div>
                </div>
              </div>
            `).join('') : '<div style="color: var(--text-muted); font-size: 0.85rem;">No active conditions recorded.</div>'}
          </div>
        </div>

        <!-- Dimension 3: Previous Check-ups -->
        <div class="profile-section-block">
          <div class="profile-section-title">
            <span>🩺</span> Dimension 3: Previous Clinical Check-ups
          </div>
          <table class="fields-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Conducted By</th>
                <th>Summary / Notes</th>
                <th>Vitals Captured</th>
              </tr>
            </thead>
            <tbody>
              ${checkups.map(ck => `
                <tr>
                  <td><strong>${ck.date}</strong></td>
                  <td>${ck.conductedBy || 'ASHA Worker'}</td>
                  <td>${ck.summary || 'Routine clinical assessment'}</td>
                  <td><span class="programme-tag">${ck.vitals ? `BP: ${ck.vitals.bp || '120/80'}, BMI: ${ck.vitals.bmi || '22.0'}` : 'Vitals logged'}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Dimension 4: Diagnostic Results -->
        <div class="profile-section-block">
          <div class="profile-section-title">
            <span>🔬</span> Dimension 4: Diagnostic Imaging & Test Results
          </div>
          <div style="display: flex; flex-direction: column; gap: 0.6rem;">
            ${diagnosticResults.map(dr => `
              <div style="background: #F8FAFC; border: 1px solid var(--border-medium); border-radius: var(--radius-sm); padding: 0.75rem 1rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
                <div>
                  <strong>${dr.testName || dr.title}</strong> — <span style="color: var(--text-muted); font-size: 0.85rem;">Result: ${dr.result || 'Normal'}</span>
                  <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.2rem;">Conducted: ${dr.date} • Origin: <span class="programme-tag" style="font-size: 0.68rem;">${dr.origin || 'DOCTOR VERIFIED'}</span></div>
                </div>
                <div>
                  <span class="brand-tag-pill" style="background: ${dr.verified ? '#D1FAE5' : '#FEF3C7'}; color: ${dr.verified ? '#065F46' : '#92400E'}; font-weight: 700;">
                    ${dr.verified ? '✓ VERIFIED' : 'PENDING REVIEW'}
                  </span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Dimension 5: Lab Test Results -->
        <div class="profile-section-block">
          <div class="profile-section-title">
            <span>🧪</span> Dimension 5: Laboratory Results
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
            ${Object.entries(labResults).map(([key, lab]) => `
              <div style="background: #F8FAFC; border: 1px solid var(--border-medium); border-radius: var(--radius-md); padding: 0.85rem;">
                <div style="font-size: 0.78rem; text-transform: uppercase; font-weight: 700; color: var(--text-muted);">${key}</div>
                <div style="font-size: 1.25rem; font-weight: 900; color: var(--text-main); margin: 0.25rem 0;">${lab.value}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">Normal: ${lab.unit} • Status: <strong style="color: #059669;">${lab.status}</strong></div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Dimension 6: Vitals History -->
        <div class="profile-section-block">
          <div class="profile-section-title">
            <span>📊</span> Dimension 6: Current Vitals & Measurements
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 0.75rem;">
            <div class="profile-stat-box">
              <div class="profile-stat-val" style="color: #0D9488;">${currentVitals.bp || '120/80'}</div>
              <div class="profile-stat-lbl">Blood Pressure</div>
            </div>
            <div class="profile-stat-box">
              <div class="profile-stat-val" style="color: #4F46E5;">${currentVitals.heartRate || '74'}</div>
              <div class="profile-stat-lbl">Pulse (bpm)</div>
            </div>
            <div class="profile-stat-box">
              <div class="profile-stat-val" style="color: #059669;">${currentVitals.spo2 || '98'}%</div>
              <div class="profile-stat-lbl">SpO2</div>
            </div>
            <div class="profile-stat-box">
              <div class="profile-stat-val" style="color: #D97706;">${currentVitals.temp || '98.4'}°F</div>
              <div class="profile-stat-lbl">Temperature</div>
            </div>
            <div class="profile-stat-box">
              <div class="profile-stat-val" style="color: #047857;">${currentVitals.bmi || '21.9'}</div>
              <div class="profile-stat-lbl">BMI (Normal)</div>
            </div>
          </div>
        </div>

        <!-- Dimension 7: Physical Examination -->
        <div class="profile-section-block">
          <div class="profile-section-title">
            <span>🩺</span> Dimension 7: Physical Examination Findings
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.75rem; font-size: 0.86rem;">
            <div style="background: #F8FAFC; padding: 0.6rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
              <strong>Lungs:</strong> ${physicalExam.lungs || 'Normal'}
            </div>
            <div style="background: #F8FAFC; padding: 0.6rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
              <strong>Skin:</strong> ${physicalExam.skin || 'Normal'}
            </div>
            <div style="background: #F8FAFC; padding: 0.6rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
              <strong>Throat:</strong> ${physicalExam.throat || 'Normal'}
            </div>
            <div style="background: #F8FAFC; padding: 0.6rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
              <strong>Eyes (Pallor):</strong> ${physicalExam.eyes || 'Normal (No Pallor)'}
            </div>
            <div style="background: #F8FAFC; padding: 0.6rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
              <strong>Ears:</strong> ${physicalExam.ears || 'Normal'}
            </div>
            <div style="background: #F8FAFC; padding: 0.6rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
              <strong>Other Findings:</strong> ${physicalExam.notes || physicalExam.other || 'Normal clinical state'}
            </div>
          </div>
        </div>

        <!-- Dimension 8: Supporting Clinical Reports & Documents (Requirements 3, 4, 15) -->
        <div class="profile-section-block">
          <div class="profile-section-title">
            <span>📁</span> Dimension 8: Supporting Clinical Reports & Stored Documents (${allDocs.length})
          </div>
          <div class="documents-grid">
            ${allDocs.map(doc => {
      const icon = doc.category?.includes('Ultrasound') ? '🩻' : (doc.category?.includes('Blood') ? '🩸' : '📄');
      const isVerif = doc.verified;
      return `
                <div class="doc-card-item">
                  <div class="doc-card-header">
                    <span class="doc-type-icon">${icon}</span>
                    <div style="flex: 1;">
                      <div class="doc-name">${doc.title || doc.name}</div>
                      <div class="doc-meta">
                        <span class="brand-tag-pill" style="font-size: 0.68rem; background: #E0E7FF; color: #3730A3;">${doc.category}</span>
                        • ${doc.date} • ${doc.fileSize || '120 KB'}
                      </div>
                    </div>
                  </div>
                  <div class="doc-actions-row">
                    <span class="brand-tag-pill" style="background: ${isVerif ? '#D1FAE5' : '#FEF3C7'}; color: ${isVerif ? '#065F46' : '#92400E'}; font-weight: 700; font-size: 0.7rem;">
                      ${isVerif ? '✓ VERIFIED' : 'PENDING'}
                    </span>
                    <div style="display: flex; gap: 0.4rem;">
                      <button type="button" class="btn-inspect-enc btn-view-doc" data-doc-id="${doc.id}" style="padding: 0.3rem 0.65rem; font-size: 0.78rem;">
                        👁️ VIEW
                      </button>
                      <button type="button" class="btn-hero-primary btn-download-doc" data-doc-id="${doc.id}" style="padding: 0.3rem 0.65rem; font-size: 0.78rem; background: var(--primary); color: white;">
                        📥 DOWNLOAD
                      </button>
                    </div>
                  </div>
                </div>
              `;
    }).join('')}
          </div>
        </div>

        <!-- Dimension 9: Doctor Verification Workflow Status (Requirement 13) -->
        <div class="profile-section-block">
          <div class="profile-section-title">
            <span>👨‍⚕️</span> Dimension 9: Doctor Review & Clinical Verification
          </div>
          <div style="background: #F0FDF4; border: 1.5px solid #BBF7D0; border-radius: var(--radius-md); padding: 1.25rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
            <div>
              <div style="display: flex; align-items: center; gap: 0.6rem;">
                <span class="brand-tag-pill" style="background: #059669; color: white; font-weight: 800; font-size: 0.8rem;">
                  ✓ ${profile.doctorVerification?.status || 'DOCTOR VERIFIED'}
                </span>
                <span style="font-weight: 800; color: #166534; font-size: 0.95rem;">
                  Verified by: ${profile.doctorVerification?.verifiedBy || 'Dr. Anita Sen, MBBS (PHC Rampur)'}
                </span>
              </div>
              <div style="font-size: 0.82rem; color: #15803D; margin-top: 0.4rem;">
                Verification Date: <strong>${profile.doctorVerification?.date || '2026-09-02'}</strong>
              </div>
              <div style="font-size: 0.82rem; color: #166534; margin-top: 0.3rem; font-style: italic;">
                "${profile.doctorVerification?.notes || 'Ultrasound parameters verified. ANC protocol followed. Eligible for IFA tablets.'}"
              </div>
            </div>
            <button type="button" class="btn-hero-primary btn-open-doctor-verif" style="background: #0D9488; color: white; padding: 0.5rem 1.2rem; font-size: 0.88rem;">
              🩺 Physician Review Modal
            </button>
          </div>
        </div>

        <!-- Dimension 10: Pregnancy & Follow-up Tracker Detail -->
        <div class="profile-section-block">
          <div class="profile-section-title">
            <span>🗓️</span> Dimension 10: Longitudinal Follow-Up Schedule
          </div>
          <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
            <div style="flex: 1;">
              <strong>Scheduled Reason:</strong> ${followUp.condition} routine check-up & growth surveillance.<br>
              <span style="font-size: 0.84rem; color: var(--text-muted);">
                Auto-assigned next visit interval based on clinical guidelines (28 days post ANC-2).
              </span>
            </div>
            <button type="button" class="btn-inspect-enc btn-schedule-followup" style="border-color: #0D9488; color: #0D9488; font-weight: 700;">
              + Update Next Revisit Date
            </button>
          </div>
        </div>

        <!-- Dimension 11: Health History Timeline (Requirement 14) -->
        <div class="profile-section-block">
          <div class="profile-section-title">
            <span>🕒</span> Dimension 11: Health History Longitudinal Timeline (Permanent History)
          </div>
          <div class="timeline-list">
            ${timelineEvents.map(ev => `
              <div class="timeline-item">
                <div class="timeline-card">
                  <div class="timeline-header">
                    <span class="timeline-title">${ev.title}</span>
                    <span class="timeline-date">📅 ${ev.date}</span>
                  </div>
                  <div class="timeline-author">Recorded by: <strong>${ev.actor || ev.author || 'ASHA Worker'}</strong> • <span class="programme-tag">${ev.type || ev.badge || 'SURVEILLANCE'}</span></div>
                  <p style="font-size: 0.88rem; color: var(--text-main); margin: 0;">${ev.description || ev.summary || ''}</p>
                </div>
              </div>
            `).join('')}
          </div>
        <!-- Dimension 12: Eligible / Assigned Public Health Programmes (Schemes & Welfare) -->
        <div class="profile-section-block">
          <div class="profile-section-title" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span>🏛️</span> Dimension 12: Eligible / Assigned Public Health Programmes (${personProgrammes.length})
            </div>
            <button type="button" class="btn-inspect-enc btn-profile-enroll-prog" style="font-size: 0.78rem; font-weight: 700; border-color: #4F46E5; color: #4F46E5; padding: 0.35rem 0.8rem;">
              + Check / Enroll Scheme
            </button>
          </div>

          ${personProgrammes.length > 0 ? `
            <div class="schemes-grid">
              ${personProgrammes.map(pa => {
                const prog = programmeManager.getProgrammeById(pa.programmeId) || {};
                let statusBadge = '<span class="brand-tag-pill" style="background:#FEF3C7; color:#92400E; font-size:0.7rem; font-weight:700;">🟡 Under Review</span>';
                if (pa.verificationStatus === 'Verified') {
                  statusBadge = '<span class="brand-tag-pill" style="background:#D1FAE5; color:#065F46; font-size:0.7rem; font-weight:700;">✓ Verified</span>';
                } else if (pa.verificationStatus === 'Reported') {
                  statusBadge = '<span class="brand-tag-pill" style="background:#E0F2FE; color:#0369A1; font-size:0.7rem; font-weight:700;">📋 Reported</span>';
                }

                return `
                  <div class="scheme-card-item ${pa.verificationStatus === 'Verified' ? 'status-active' : ''}">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem;">
                      <div>
                        <div class="scheme-title">${prog.name || pa.programmeName}</div>
                        <span class="programme-tag" style="font-size: 0.68rem;">${pa.category || prog.category}</span>
                      </div>
                      ${statusBadge}
                    </div>

                    <div style="font-size: 0.8rem; color: var(--text-main); margin-top: 0.4rem;">
                      <strong>Benefits:</strong> ${prog.benefits || pa.benefits || 'Clinical care, nutrition, cash assistance'}
                    </div>

                    <div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 0.3rem;">
                      Enrolled: <strong>${pa.enrolledDate}</strong> • Verification Level: <strong>${pa.verificationStatus}</strong>
                      ${pa.notes ? `<br><em>"${pa.notes}"</em>` : ''}
                    </div>

                    <div style="display: flex; justify-content: flex-end; gap: 0.4rem; margin-top: 0.6rem;">
                      <button type="button" class="btn-inspect-enc btn-view-prog-from-profile" data-prog-id="${pa.programmeId}" style="padding: 0.25rem 0.55rem; font-size: 0.74rem;">
                        👁️ Programme Details
                      </button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          ` : `
            <div style="background: #F8FAFC; border: 1.5px dashed var(--border-subtle); border-radius: var(--radius-sm); padding: 1.25rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
              No public health programmes linked to this individual yet. Click <strong>+ Check / Enroll Scheme</strong> to verify eligibility for PMMVY, PMSMA, UIP, or AB-PMJAY.
            </div>
          `}
        </div>
      </div>
    `;

    // Wire newly rendered buttons
    const btnJumpFam = this.personProfileContentArea.querySelector('#btnJumpToFamilyReport');
    if (btnJumpFam) {
      btnJumpFam.addEventListener('click', () => {
        const fid = btnJumpFam.getAttribute('data-family-id');
        this.switchView('family');
        this.renderFamilyDetail(fid);
        this.showToast(`Switched to Family Report for ${fid}`, 'info');
      });
    }

    this.personProfileContentArea.querySelectorAll('.btn-view-doc').forEach(btn => {
      btn.addEventListener('click', () => {
        const docId = btn.getAttribute('data-doc-id');
        this.openDocumentViewer(docId);
      });
    });

    this.personProfileContentArea.querySelectorAll('.btn-download-doc').forEach(btn => {
      btn.addEventListener('click', () => {
        const docId = btn.getAttribute('data-doc-id');
        documentStore.downloadDocument(docId);
        this.showToast('File download started', 'success');
      });
    });

    const docVerifBtn = this.personProfileContentArea.querySelector('.btn-open-doctor-verif');
    if (docVerifBtn) {
      docVerifBtn.addEventListener('click', () => {
        this.openDoctorVerificationModal({
          title: `Beneficiary Clinical Record: ${pName} (${profile.householdId})`,
          condition: followUp.condition
        }, 'clinical-profile');
      });
    }

    const schedBtn = this.personProfileContentArea.querySelector('.btn-schedule-followup');
    if (schedBtn) {
      schedBtn.addEventListener('click', () => {
        this.openCheckupModal('followup');
      });
    }

    const heroAddBtn = this.personProfileContentArea.querySelector('.btn-hero-add-trigger');
    if (heroAddBtn) {
      heroAddBtn.addEventListener('click', () => {
        if (this.addRecordModal) this.addRecordModal.style.display = 'flex';
      });
    }

    const btnProfileEnroll = this.personProfileContentArea.querySelector('.btn-profile-enroll-prog');
    if (btnProfileEnroll) {
      btnProfileEnroll.addEventListener('click', () => {
        this.openProgrammeEligibilityModal(null, 'individual', profile.personId);
      });
    }

    this.personProfileContentArea.querySelectorAll('.btn-view-prog-from-profile').forEach(btn => {
      btn.addEventListener('click', () => {
        const progId = btn.getAttribute('data-prog-id');
        this.openProgrammeDetails(progId);
      });
    });
  }

  // =========================================================================
  // Document Viewer & Exact Download (Requirement 15)
  // =========================================================================
  openDocumentViewer(docId) {
    const doc = documentStore.getDocumentById(docId);
    if (!doc || !this.documentViewerModal) return;

    this.activeDocViewerId = docId;
    if (this.docViewerTitle) this.docViewerTitle.textContent = doc.title;
    if (this.docViewerMeta) this.docViewerMeta.textContent = `${doc.category} • Uploaded ${doc.date} • Beneficiary: ${doc.personName || doc.personId} (${doc.householdId})`;
    if (this.docViewerImage) this.docViewerImage.src = doc.dataUrl;

    if (this.docViewerStatusChip) {
      this.docViewerStatusChip.textContent = doc.verified ? '✓ DOCTOR VERIFIED' : '🟡 PENDING REVIEW';
      this.docViewerStatusChip.className = doc.verified ? 'sync-badge synced' : 'sync-badge pending';
    }

    this.documentViewerModal.style.display = 'flex';
  }

  // =========================================================================
  // Doctor Verification Workflow (Requirement 13)
  // =========================================================================
  openDoctorVerificationModal(targetItem, type = 'finding') {
    if (!this.doctorVerificationModal) return;
    this.activeDoctorVerifTarget = { item: targetItem, type };

    if (this.verifTargetTitle) {
      this.verifTargetTitle.textContent = targetItem.title || targetItem.finding || 'Clinical Finding / Diagnostic Item';
    }
    if (this.verifTargetMeta) {
      this.verifTargetMeta.textContent = `Target Category: ${type} • Beneficiary ID: ${this.activeDiagnosticPersonId}`;
    }

    const currentUser = userManager.getCurrentUser();
    if (this.verifDoctorName) {
      this.verifDoctorName.value = currentUser.role === 'ADMIN' ? `Dr. ${currentUser.fullName} (${currentUser.userId})` : 'Dr. Anita Sen, MBBS (PHC Rampur)';
    }
    if (this.verifDoctorNotes) {
      this.verifDoctorNotes.value = 'Reviewed and verified in accordance with national health surveillance protocols.';
    }

    this.doctorVerificationModal.style.display = 'flex';
  }

  handleDoctorVerificationAction(action) {
    const doctorName = (this.verifDoctorName?.value || '').trim() || 'Dr. Anita Sen, MBBS';
    const notes = (this.verifDoctorNotes?.value || '').trim();

    let statusText = 'Verified';
    if (action === 'CLARIFY') statusText = 'Clarification Requested';
    if (action === 'REJECT') statusText = 'Rejected';

    if (this.activeDoctorVerifTarget) {
      const { item, type } = this.activeDoctorVerifTarget;
      if (item && item.id) {
        documentStore.verifyDocument(item.id, doctorName, notes);
      }
    }

    // Update diagnostic manager verification
    diagnosticManager.verifyFinding(this.activeDiagnosticPersonId, 0, doctorName, notes, statusText);

    this.storage.logAuditEvent({
      action: `DOCTOR_${action}`,
      user: doctorName,
      role: 'ADMIN',
      details: `Physician action [${action}] executed for ${this.activeDiagnosticPersonId}. Notes: ${notes}`
    });

    if (this.doctorVerificationModal) this.doctorVerificationModal.style.display = 'none';
    this.renderDiagnosticPersonProfile(this.activeDiagnosticPersonId);
    this.renderAuditLogs();
    this.showToast(`Doctor verification action [${action}] recorded successfully!`, 'success');
  }

  // =========================================================================
  // Check-Up Form Modal & Undocumented Findings (Requirements 11-12)
  // =========================================================================
  openCheckupModal(presetSection = 'all') {
    if (!this.checkupFormModal) return;
    const profile = diagnosticManager.getProfileByPersonOrHousehold(this.activeDiagnosticPersonId) || diagnosticManager.getAllProfiles()[0];
    const pName = profile.name || profile.personName || 'Beneficiary';

    if (this.checkupPersonHeader) {
      this.checkupPersonHeader.textContent = `${pName} (${profile.householdId})`;
    }
    if (this.checkupDate) {
      this.checkupDate.value = new Date().toISOString().split('T')[0];
    }

    // Reset attached files
    this.checkupAttachedFiles = { blood: null, urine: null, other: null };
    if (this.checkupBloodFileLabel) this.checkupBloodFileLabel.textContent = '';
    if (this.checkupUrineFileLabel) this.checkupUrineFileLabel.textContent = '';
    if (this.checkupOtherFileLabel) this.checkupOtherFileLabel.textContent = '';
    if (this.checkupNewFinding) this.checkupNewFinding.value = '';

    // Auto calculate initial BMI
    const h = parseFloat(this.checkupHeight?.value || 160);
    const w = parseFloat(this.checkupWeight?.value || 56);
    const bmiRes = diagnosticManager.calculateBmi(w, h);
    if (this.checkupBmiVal) this.checkupBmiVal.textContent = bmiRes.bmi;
    if (this.checkupBmiCategory) this.checkupBmiCategory.textContent = `(${bmiRes.category})`;

    this.checkupFormModal.style.display = 'flex';

    if (presetSection === 'finding' && this.checkupNewFinding) {
      setTimeout(() => this.checkupNewFinding.focus(), 200);
    }
  }

  handleSaveCheckup() {
    const profile = diagnosticManager.getProfileByPersonOrHousehold(this.activeDiagnosticPersonId);
    if (!profile) return;

    const date = this.checkupDate?.value || new Date().toISOString().split('T')[0];
    const conductedBy = this.checkupConductedBy?.value || 'ASHA Worker';
    const bp = this.checkupBp?.value || '120/80';
    const heartRate = Number(this.checkupHeartRate?.value) || 74;
    const spo2 = Number(this.checkupSpo2?.value) || 98;
    const temp = Number(this.checkupTemp?.value) || 98.4;
    const height = Number(this.checkupHeight?.value) || 160;
    const weight = Number(this.checkupWeight?.value) || 56;
    const observations = this.checkupObservations?.value || 'Routine prenatal surveillance.';
    const newFinding = (this.checkupNewFinding?.value || '').trim();

    // Calculate BMI
    const bmiRes = diagnosticManager.calculateBmi(weight, height);

    const checkupData = {
      date,
      conductedBy,
      summary: observations,
      vitals: {
        bp,
        heartRate,
        spo2,
        temperature: temp,
        height,
        weight,
        bmi: bmiRes.bmi,
        bmiCategory: bmiRes.category
      },
      labs: {
        blood: this.checkupBloodResult?.value || 'Normal',
        urine: this.checkupUrineResult?.value || 'Normal',
        other: this.checkupOtherResult?.value || ''
      },
      physicalExam: {
        lungs: this.examLungs?.value || 'Normal',
        skin: this.examSkin?.value || 'Normal',
        throat: this.examThroat?.value || 'Normal',
        eyes: this.examEyes?.value || 'Normal',
        ears: this.examEars?.value || 'Normal',
        other: this.examOther?.value || ''
      },
      newFinding: newFinding || null
    };

    const pName = profile.name || profile.personName || 'Beneficiary';
    diagnosticManager.addCheckup(profile.personId, checkupData);

    // Save attached lab files into document store
    Object.entries(this.checkupAttachedFiles).forEach(([key, fileObj]) => {
      if (fileObj) {
        documentStore.addDocument({
          title: fileObj.title,
          category: key === 'blood' ? 'Blood Test' : (key === 'urine' ? 'Urine Test' : 'Diagnostic Report'),
          personId: profile.personId,
          personName: pName,
          householdId: profile.householdId,
          date,
          fileType: fileObj.fileType,
          fileSize: fileObj.fileSize,
          dataUrl: fileObj.dataUrl,
          verified: false,
          origin: 'ASHA ENTERED'
        });
      }
    });

    const user = userManager.getCurrentUser();
    this.storage.logAuditEvent({
      action: 'CHECKUP_RECORDED',
      user: user.fullName,
      role: user.role,
      details: `Clinical check-up documented for ${pName} (${profile.personId}). BMI: ${bmiRes.bmi}.`
    });

    this.checkupFormModal.style.display = 'none';
    this.renderDiagnosticPersonProfile(profile.personId);
    this.renderTimeline();
    this.renderAuditLogs();
    this.showToast(`Check-up and vitals saved for ${pName}!`, 'success');
  }

  // =========================================================================
  // Family Reports & Household Surveillance (PS-H02 Requirement)
  // =========================================================================
  renderFamilyList(filter = 'ALL', searchQuery = '') {
    if (!this.familyCardsGrid) return;

    let families = familyManager.getAllFamilies();

    // Apply Filter
    if (filter === 'COMPLETED') {
      families = families.filter(f => f.status === 'COMPLETED');
    } else if (filter === 'IN_PROGRESS') {
      families = families.filter(f => f.status === 'IN_PROGRESS');
    } else if (filter === 'FOLLOW_UP_REQUIRED') {
      families = families.filter(f => f.status === 'FOLLOW_UP_REQUIRED');
    } else if (filter === 'SCHEMES') {
      families = families.filter(f => (f.schemes || []).length > 0);
    } else if (filter === 'SUPPLIES') {
      families = families.filter(f => (f.essentialHealthSupplies || []).length > 0);
    }

    // Apply Search Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      families = families.filter(f => 
        f.familyHead.toLowerCase().includes(q) ||
        f.familyId.toLowerCase().includes(q) ||
        f.houseNumber.toLowerCase().includes(q) ||
        f.address.toLowerCase().includes(q) ||
        (f.members || []).some(m => m.name.toLowerCase().includes(q))
      );
    }

    if (families.length === 0) {
      this.familyCardsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 2.5rem; text-align: center; background: white; border-radius: var(--radius-lg); border: 1.5px dashed var(--border-medium);">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🔍</div>
          <strong style="font-size: 1.1rem; color: var(--text-main);">No Families Found</strong>
          <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 0.25rem;">Try adjusting your filter or search query.</p>
        </div>
      `;
      return;
    }

    this.familyCardsGrid.innerHTML = families.map(f => {
      const stats = familyManager.calculateFamilyStats(f);
      let statusClass = 'status-progress';
      let statusBadge = '<span class="census-pill" style="background:#E0F2FE; color:#0369A1;">🟡 In Progress</span>';
      if (f.status === 'COMPLETED') {
        statusClass = 'status-completed';
        statusBadge = '<span class="census-pill" style="background:#D1FAE5; color:#065F46;">✓ Completed</span>';
      } else if (f.status === 'FOLLOW_UP_REQUIRED') {
        statusClass = 'status-followup';
        statusBadge = '<span class="census-pill" style="background:#FEF3C7; color:#92400E;">🟠 Follow-up Due</span>';
      }

      const schemesCount = (f.schemes || []).length;
      const suppliesCount = (f.essentialHealthSupplies || []).length;
      const medsCount = (f.medicinesProvided || []).length;

      return `
        <div class="family-card-item ${statusClass}" data-family-id="${f.familyId}">
          <div class="family-card-header">
            <div>
              <span class="family-id-tag">${f.familyId}</span>
              <h3 class="family-card-title">${f.familyHead}'s Household</h3>
            </div>
            ${statusBadge}
          </div>

          <div class="family-card-meta">
            <span>🏠 House ${f.houseNumber}</span>
            <span>•</span>
            <span>${f.address}</span>
          </div>

          <!-- Dynamic Census Breakdown -->
          <div class="family-census-bar">
            <span class="census-pill female" title="Female Beneficiaries">👩 Female: ${stats.femaleCount}</span>
            <span class="census-pill male" title="Male Beneficiaries">👨 Male: ${stats.maleCount}</span>
            <span class="census-pill child" title="Children Under 18">👶 Children: ${stats.childrenCount}</span>
            <span class="census-pill elderly" title="Elderly Over 60">👵 Elderly: ${stats.elderlyCount}</span>
            <span class="census-pill total" title="Total Members">👥 Total: ${stats.totalMembers}</span>
          </div>

          <div class="family-card-summary">
            <div>
              <span>📑 Schemes: <strong>${schemesCount}</strong></span> • 
              <span>📦 Supplies: <strong>${suppliesCount}</strong></span> • 
              <span>💊 Meds: <strong>${medsCount}</strong></span>
            </div>
            <div style="color: #0D9488; font-weight: 700; display: inline-flex; align-items: center; gap: 0.2rem;">
              Open Record →
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Wire clicks on family cards
    this.familyCardsGrid.querySelectorAll('.family-card-item').forEach(card => {
      card.addEventListener('click', () => {
        const fid = card.getAttribute('data-family-id');
        this.renderFamilyDetail(fid);
      });
    });
  }

  renderFamilyDetail(familyId) {
    this.activeFamilyId = familyId;
    const family = familyManager.getFamilyById(familyId);
    if (!family) {
      this.showToast('Family record not found', 'warning');
      return;
    }

    if (this.familyListContainer) this.familyListContainer.style.display = 'none';
    if (this.familyDetailContainer) this.familyDetailContainer.style.display = 'block';

    const stats = familyManager.calculateFamilyStats(family);
    const familyProgrammes = programmeManager.getAssignmentsForFamily(family.familyId);

    let statusBadge = '<span class="census-pill" style="background:#E0F2FE; color:#0369A1; font-size: 0.85rem;">🟡 In Progress</span>';
    if (family.status === 'COMPLETED') {
      statusBadge = '<span class="census-pill" style="background:#D1FAE5; color:#065F46; font-size: 0.85rem;">✓ Completed</span>';
    } else if (family.status === 'FOLLOW_UP_REQUIRED') {
      statusBadge = '<span class="census-pill" style="background:#FEF3C7; color:#92400E; font-size: 0.85rem;">🟠 Follow-up Due</span>';
    }

    this.familyDetailContentArea.innerHTML = `
      <div class="family-detail-container">
        <!-- Family Record Top Header -->
        <div class="family-detail-header-card">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;">
            <div>
              <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.35rem;">
                <span class="family-id-tag" style="font-size: 0.95rem; padding: 0.3rem 0.8rem;">${family.familyId}</span>
                <h2 style="font-size: 1.6rem; font-weight: 800; color: var(--text-main); margin: 0;">
                  ${family.familyHead}'s Family Record
                </h2>
                ${statusBadge}
              </div>
              <div style="font-size: 0.88rem; color: var(--text-muted);">
                House Number: <strong>${family.houseNumber}</strong> • Locality: <strong>${family.address}</strong> • Assigned ASHA: <strong>${family.assignedAshaName || 'Sita Rao'} (${family.assignedAsha})</strong>
              </div>
              <div style="font-size: 0.8rem; color: #0D9488; margin-top: 0.35rem; font-weight: 600;">
                📅 Last Encounter: ${family.lastVisit || '2026-09-18'} • Next Scheduled Revisit: ${family.nextScheduledVisit || '2026-10-02'}
              </div>
            </div>

            <!-- Dynamic Census Summary Tag -->
            <div class="family-census-bar" style="background: #F1F5F9; margin-bottom: 0;">
              <span class="census-pill female">👩 Female: ${stats.femaleCount}</span>
              <span class="census-pill male">👨 Male: ${stats.maleCount}</span>
              <span class="census-pill child">👶 Children: ${stats.childrenCount}</span>
              <span class="census-pill elderly">👵 Elderly: ${stats.elderlyCount}</span>
              <span class="census-pill total">👥 Total: ${stats.totalMembers}</span>
            </div>
          </div>

          <!-- Quick Action Buttons -->
          <div class="family-quick-actions-bar">
            <button type="button" class="btn-inspect-enc" id="btnDetailAddMember" style="background: #F0FDF4; border-color: #10B981; color: #065F46; font-weight: 700;">
              <span>👤</span> + Add Member
            </button>
            <button type="button" class="btn-inspect-enc" id="btnDetailAddScheme" style="background: #EFF6FF; border-color: #3B82F6; color: #1D4ED8; font-weight: 700;">
              <span>📑</span> + Add Scheme
            </button>
            <button type="button" class="btn-inspect-enc" id="btnDetailAddSupply" style="background: #FDF4FF; border-color: #C084FC; color: #7E22CE; font-weight: 700;">
              <span>📦</span> + Add Supply
            </button>
            <button type="button" class="btn-inspect-enc" id="btnDetailAddMedicine" style="background: #FEF3C7; border-color: #F59E0B; color: #B45309; font-weight: 700;">
              <span>💊</span> + Add Medicine
            </button>
            <button type="button" class="btn-inspect-enc" id="btnDetailReportBirth" style="font-weight: 700;">
              <span>👶</span> + Report Birth
            </button>
            <button type="button" class="btn-inspect-enc" id="btnDetailReportDeath" style="font-weight: 700;">
              <span>🕊️</span> + Report Death
            </button>
            <button type="button" class="btn-inspect-enc" id="btnDetailReportHealthEvent" style="font-weight: 700; border-color: #EF4444; color: #B91C1C;">
              <span>🚨</span> + Health Event
            </button>
            <button type="button" class="btn-inspect-enc" id="btnDetailReportProgramme" style="font-weight: 700;">
              <span>📋</span> + Programme Activity
            </button>
          </div>
        </div>

        <!-- SECTION 1: FAMILY MEMBER ROSTER & BIDIRECTIONAL DIAGNOSTIC REPORT JUMPS -->
        <div class="family-section-card">
          <div class="family-section-header">
            <div class="family-section-title">
              <span>👥</span> Family Members & Clinical Surveillance Roster (${family.members.length} Registered)
            </div>
            <span style="font-size: 0.8rem; color: var(--text-muted);">
              Click <strong>DIAGNOSTIC REPORT</strong> on any member to open their complete 11-dimension clinical profile.
            </span>
          </div>

          <div class="family-members-grid">
            ${family.members.map(m => {
              const isDeceased = (m.status || '').includes('Deceased');
              const isPreg = m.isPregnant || (m.pregnancyStatus || '').toLowerCase().includes('pregnant');
              const cardClass = isDeceased ? 'is-deceased' : '';

              return `
                <div class="family-member-card ${cardClass}">
                  <div class="member-card-header">
                    <div>
                      <div class="member-name-tag">
                        <span>${m.gender === 'Female' ? (isPreg ? '🤰' : '👩') : (m.age < 18 ? '👶' : '👨')}</span>
                        <span>${m.name}</span>
                      </div>
                      <div class="member-subtext">
                        ID: <strong>${m.personId}</strong> • Age: <strong>${m.age} yrs</strong> • ${m.gender}
                      </div>
                    </div>
                    <span class="badge-role">${m.role || 'Member'}</span>
                  </div>

                  <div style="font-size: 0.8rem;">
                    ${isPreg ? `<span class="census-pill female" style="font-size: 0.72rem;">${m.pregnancyStatus}</span>` : ''}
                    <span class="member-vitals-chip" style="margin-top: 0.35rem; display: inline-block;">
                      Status: <strong>${m.status || 'Active'}</strong>
                    </span>
                  </div>

                  <div class="member-card-actions">
                    <button type="button" class="btn-jump-diagnostic" data-person-id="${m.personId}">
                      <span>🩺</span> DIAGNOSTIC REPORT
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- SECTION 2: GOVERNMENT SCHEMES & HEALTH BENEFITS -->
        <div class="family-section-card">
          <div class="family-section-header">
            <div class="family-section-title">
              <span>🏛️</span> Government Schemes & Health Benefit Coverage (${(family.schemes || []).length + familyProgrammes.length})
            </div>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
              <button type="button" class="btn-inspect-enc btn-family-enroll-prog" style="font-size: 0.78rem; font-weight: 700; border-color: #4F46E5; color: #4F46E5;">
                + Check / Enroll Scheme
              </button>
              <button type="button" class="btn-inspect-enc btn-quick-add-scheme" style="font-size: 0.78rem; font-weight: 700;">
                + Add Custom Scheme
              </button>
            </div>
          </div>

          ${((family.schemes && family.schemes.length > 0) || familyProgrammes.length > 0) ? `
            <div class="schemes-grid">
              ${familyProgrammes.map(pa => {
                const prog = programmeManager.getProgrammeById(pa.programmeId) || {};
                let statusBadge = '<span class="brand-tag-pill" style="background:#FEF3C7; color:#92400E; font-size:0.7rem; font-weight:700;">🟡 Under Review</span>';
                if (pa.verificationStatus === 'Verified') {
                  statusBadge = '<span class="brand-tag-pill" style="background:#D1FAE5; color:#065F46; font-size:0.7rem; font-weight:700;">✓ Verified</span>';
                } else if (pa.verificationStatus === 'Reported') {
                  statusBadge = '<span class="brand-tag-pill" style="background:#E0F2FE; color:#0369A1; font-size:0.7rem; font-weight:700;">📋 Reported</span>';
                }

                return `
                  <div class="scheme-card-item ${pa.verificationStatus === 'Verified' ? 'status-active' : ''}">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem;">
                      <div>
                        <div class="scheme-title">${prog.name || pa.programmeName}</div>
                        <span class="programme-tag" style="font-size: 0.68rem;">${pa.category || prog.category}</span>
                      </div>
                      ${statusBadge}
                    </div>
                    <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.35rem;">
                      Target: <strong>${pa.targetType === 'family' ? `Entire Household (${pa.familyId})` : (pa.personName || pa.personId)}</strong>
                    </div>
                    <div style="font-size: 0.78rem; color: var(--text-main); margin-top: 0.25rem;">
                      <strong>Benefits:</strong> ${prog.benefits || pa.benefits || 'Financial & healthcare coverage'}
                    </div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem;">
                      Enrolled: ${pa.enrolledDate} ${pa.notes ? `• "${pa.notes}"` : ''}
                    </div>
                    <div style="display: flex; justify-content: flex-end; gap: 0.4rem; margin-top: 0.5rem;">
                      <button type="button" class="btn-inspect-enc btn-view-prog-from-family" data-prog-id="${pa.programmeId}" style="padding: 0.25rem 0.55rem; font-size: 0.74rem;">
                        👁️ View Details
                      </button>
                    </div>
                  </div>
                `;
              }).join('')}

              ${(family.schemes || []).map(s => `
                <div class="scheme-card-item ${s.status === 'Approved' || s.status === 'Provided' ? 'status-active' : ''}">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div class="scheme-title">${s.name}</div>
                    <span class="brand-tag-pill" style="background: ${s.status === 'Approved' ? '#D1FAE5' : '#FEF3C7'}; color: ${s.status === 'Approved' ? '#065F46' : '#92400E'}; font-size: 0.7rem; font-weight: 700;">
                      ${s.status}
                    </span>
                  </div>
                  <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.35rem;">
                    Beneficiary: <strong>${s.beneficiaryName}</strong> (${s.eligibleFor}) • Eligibility: <strong>${s.eligibility}</strong>
                  </div>
                  <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem;">
                    Recorded: ${s.date} ${s.notes ? `• "${s.notes}"` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          ` : `
            <div style="text-align: center; padding: 1.5rem; color: var(--text-muted); font-size: 0.85rem;">
              No government schemes documented for this household yet. Click <strong>+ Check / Enroll Scheme</strong> to verify eligibility.
            </div>
          `}
        </div>

        <!-- SECTION 3: ESSENTIAL HEALTH SUPPLIES DISTRIBUTED -->
        <div class="family-section-card">
          <div class="family-section-header">
            <div class="family-section-title">
              <span>📦</span> Essential Health Supplies Distributed (${(family.essentialHealthSupplies || []).length})
            </div>
            <button type="button" class="btn-inspect-enc btn-quick-add-supply" style="font-size: 0.78rem; font-weight: 700;">
              + Record Supply
            </button>
          </div>

          ${(family.essentialHealthSupplies && family.essentialHealthSupplies.length > 0) ? `
            <table class="family-data-table">
              <thead>
                <tr>
                  <th>Supply Item</th>
                  <th>Quantity</th>
                  <th>Provided To</th>
                  <th>Related Programme</th>
                  <th>Date</th>
                  <th>Provided By</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                ${family.essentialHealthSupplies.map(sup => `
                  <tr>
                    <td><strong>${sup.name}</strong></td>
                    <td><span class="census-pill total">${sup.quantity}</span></td>
                    <td>${sup.beneficiaryName || sup.providedTo}</td>
                    <td>${sup.relatedProgramme ? `<span class="programme-tag" style="font-size:0.72rem;">${sup.relatedProgramme}</span>` : '<span style="color:var(--text-muted);">-</span>'}</td>
                    <td>${sup.date}</td>
                    <td><span style="font-size: 0.78rem; color: var(--text-muted);">${sup.providedBy || 'ASHA Worker'}</span></td>
                    <td><span style="font-size: 0.78rem;">${sup.notes || 'Routine distribution'}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : `
            <div style="text-align: center; padding: 1.5rem; color: var(--text-muted); font-size: 0.85rem;">
              No essential supplies logged. Click <strong>+ Record Supply</strong> to document ORS, IFA, or zinc distribution.
            </div>
          `}
        </div>

        <!-- SECTION 4: DOCUMENTED MEDICINES PROVIDED -->
        <div class="family-section-card">
          <div class="family-section-header">
            <div class="family-section-title">
              <span>💊</span> Documented Medicines Provided (${(family.medicinesProvided || []).length})
            </div>
            <button type="button" class="btn-inspect-enc btn-quick-add-med" style="font-size: 0.78rem; font-weight: 700;">
              + Record Medicine
            </button>
          </div>

          <div class="alert-box alert-info" style="margin-bottom: 0.85rem; font-size: 0.78rem;">
            ℹ️ <strong>Clinical Safety Notice:</strong> Documented medicines reflect medications dispensed per authorized Primary Health Centre standing protocols or Medical Officer prescription. AI does not autonomously prescribe or modify drug dosages.
          </div>

          ${(family.medicinesProvided && family.medicinesProvided.length > 0) ? `
            <table class="family-data-table">
              <thead>
                <tr>
                  <th>Medicine Name</th>
                  <th>Quantity</th>
                  <th>Recipient</th>
                  <th>Related Programme</th>
                  <th>Date</th>
                  <th>Authorized Provider</th>
                  <th>Clinical Notes / Protocol</th>
                </tr>
              </thead>
              <tbody>
                ${family.medicinesProvided.map(med => `
                  <tr>
                    <td><strong>${med.name}</strong></td>
                    <td><span class="census-pill total">${med.quantity} tabs</span></td>
                    <td>${med.recipient}</td>
                    <td>${med.relatedProgramme ? `<span class="programme-tag" style="font-size:0.72rem;">${med.relatedProgramme}</span>` : '<span style="color:var(--text-muted);">-</span>'}</td>
                    <td>${med.date}</td>
                    <td><span style="font-size: 0.78rem; color: var(--text-muted);">${med.provider || 'ASHA Worker'}</span></td>
                    <td><span style="font-size: 0.78rem;">${med.notes || 'Standing protocol'}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : `
            <div style="text-align: center; padding: 1.5rem; color: var(--text-muted); font-size: 0.85rem;">
              No dispensed medicines documented.
            </div>
          `}
        </div>

        <!-- SECTION 5: FAMILY VITAL EVENTS & LONGITUDINAL TIMELINE -->
        <div class="family-section-card">
          <div class="family-section-header">
            <div class="family-section-title">
              <span>🕒</span> Family Vital Events & Community Surveillance Timeline (${(family.events || []).length})
            </div>
          </div>

          ${(family.events && family.events.length > 0) ? `
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              ${family.events.map(ev => {
                let icon = '📅';
                let typeColor = '#0D9488';
                if (ev.type === 'BIRTH') { icon = '👶'; typeColor = '#059669'; }
                if (ev.type === 'DEATH') { icon = '🕊️'; typeColor = '#64748B'; }
                if (ev.type === 'HEALTH_EVENT') { icon = '🚨'; typeColor = '#D97706'; }
                if (ev.type === 'PROGRAMME') { icon = '📋'; typeColor = '#2563EB'; }

                return `
                  <div style="background: #F8FAFC; border: 1.5px solid var(--border-subtle); border-left: 4px solid ${typeColor}; border-radius: var(--radius-sm); padding: 0.85rem 1rem;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 0.4rem;">
                      <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span style="font-size: 1.2rem;">${icon}</span>
                        <strong style="color: var(--text-main); font-size: 0.95rem;">${ev.title}</strong>
                      </div>
                      <span style="font-size: 0.76rem; color: var(--text-muted); font-family: var(--font-mono);">${ev.date}</span>
                    </div>
                    <p style="margin: 0.35rem 0 0 0; font-size: 0.84rem; color: #334155;">
                      ${ev.description}
                    </p>
                    <div style="font-size: 0.74rem; color: var(--text-muted); margin-top: 0.3rem;">
                      Documented by: <strong>${ev.actor || 'ASHA Worker'}</strong> ${ev.documentTitle ? `• 📎 Document: ${ev.documentTitle}` : ''}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          ` : `
            <div style="text-align: center; padding: 1.5rem; color: var(--text-muted); font-size: 0.85rem;">
              No vital events recorded yet.
            </div>
          `}
        </div>
      </div>
    `;

    // Bind Jump to Diagnostic Report buttons
    this.familyDetailContentArea.querySelectorAll('.btn-jump-diagnostic').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const pid = btn.getAttribute('data-person-id');
        this.openDiagnosticForMember(pid);
      });
    });

    // Bind Quick Modal Buttons
    const openModalWithFamily = (modal) => {
      this.populateModalBeneficiaries(family);
      if (modal) modal.style.display = 'flex';
    };

    const qAddMem = this.familyDetailContentArea.querySelector('#btnDetailAddMember');
    if (qAddMem) qAddMem.addEventListener('click', () => {
      if (this.addMemberFamilySubtitle) {
        this.addMemberFamilySubtitle.textContent = `Family ${family.familyId} (${family.familyHead}) • Member census auto-updates`;
      }
      if (this.addFamilyMemberModal) this.addFamilyMemberModal.style.display = 'flex';
    });

    const qAddScheme = this.familyDetailContentArea.querySelector('#btnDetailAddScheme');
    const qAddSchemeAlt = this.familyDetailContentArea.querySelector('.btn-quick-add-scheme');
    [qAddScheme, qAddSchemeAlt].forEach(btn => {
      if (btn) btn.addEventListener('click', () => openModalWithFamily(this.addSchemeModal));
    });

    const qAddSup = this.familyDetailContentArea.querySelector('#btnDetailAddSupply');
    const qAddSupAlt = this.familyDetailContentArea.querySelector('.btn-quick-add-supply');
    [qAddSup, qAddSupAlt].forEach(btn => {
      if (btn) btn.addEventListener('click', () => openModalWithFamily(this.addSupplyModal));
    });

    const qAddMed = this.familyDetailContentArea.querySelector('#btnDetailAddMedicine');
    const qAddMedAlt = this.familyDetailContentArea.querySelector('.btn-quick-add-med');
    [qAddMed, qAddMedAlt].forEach(btn => {
      if (btn) btn.addEventListener('click', () => openModalWithFamily(this.addMedicineModal));
    });

    const qReportBirth = this.familyDetailContentArea.querySelector('#btnDetailReportBirth');
    if (qReportBirth) qReportBirth.addEventListener('click', () => openModalWithFamily(this.reportBirthModal));

    const qReportDeath = this.familyDetailContentArea.querySelector('#btnDetailReportDeath');
    if (qReportDeath) qReportDeath.addEventListener('click', () => openModalWithFamily(this.reportDeathModal));

    const qReportEvent = this.familyDetailContentArea.querySelector('#btnDetailReportHealthEvent');
    if (qReportEvent) qReportEvent.addEventListener('click', () => {
      const dInput = document.getElementById('eventDate');
      if (dInput && !dInput.value) dInput.value = new Date().toISOString().split('T')[0];
      if (this.reportHealthEventModal) this.reportHealthEventModal.style.display = 'flex';
    });

    const qReportProg = this.familyDetailContentArea.querySelector('#btnDetailReportProgramme');
    if (qReportProg) qReportProg.addEventListener('click', () => {
      const pInput = document.getElementById('progDate');
      if (pInput && !pInput.value) pInput.value = new Date().toISOString().split('T')[0];
      if (this.reportProgrammeModal) this.reportProgrammeModal.style.display = 'flex';
    });

    const qEnrollProg = this.familyDetailContentArea.querySelector('.btn-family-enroll-prog');
    if (qEnrollProg) {
      qEnrollProg.addEventListener('click', () => {
        this.openProgrammeEligibilityModal(null, 'family', family.familyId);
      });
    }

    this.familyDetailContentArea.querySelectorAll('.btn-view-prog-from-family').forEach(btn => {
      btn.addEventListener('click', () => {
        const progId = btn.getAttribute('data-prog-id');
        this.openProgrammeDetails(progId);
      });
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  openDiagnosticForMember(personId) {
    this.activeDiagnosticPersonId = personId;
    if (this.quickPersonSelect) {
      this.quickPersonSelect.value = personId;
    }
    this.switchView('diagnostic');
    this.renderDiagnosticPersonProfile(personId);
    this.showToast(`Switched to Clinical Diagnostic Report for ${personId}`, 'info');
  }

  populateModalBeneficiaries(family) {
    const members = family.members || [];

    // Scheme beneficiary
    if (this.schemeBeneficiaryPersonSelect) {
      this.schemeBeneficiaryPersonSelect.innerHTML = members.map(m => `
        <option value="${m.personId}">${m.name} (${m.role || 'Member'}, ${m.gender}, ${m.age}y)</option>
      `).join('');
    }

    // Supply beneficiary
    if (this.supplyBeneficiaryPersonSelect) {
      this.supplyBeneficiaryPersonSelect.innerHTML = members.map(m => `
        <option value="${m.personId}">${m.name} (${m.role || 'Member'}, ${m.gender}, ${m.age}y)</option>
      `).join('');
    }

    // Medicine recipient
    if (this.medRecipientSelect) {
      this.medRecipientSelect.innerHTML = `
        <option value="${family.familyHead}">${family.familyHead} (Head)</option>
        ${members.map(m => `<option value="${m.name}">${m.name} (${m.role || 'Member'}, ${m.age}y)</option>`).join('')}
        <option value="Family ${family.familyId}">Family Buffer (Household First-Aid)</option>
      `;
    }

    // Birth mother select (females >= 15y)
    if (this.birthMotherSelect) {
      const mothers = members.filter(m => m.gender === 'Female' && m.age >= 15);
      this.birthMotherSelect.innerHTML = (mothers.length > 0 ? mothers : members).map(m => `
        <option value="${m.name}">${m.name} (${m.role || 'Mother'}, ${m.age}y)</option>
      `).join('');
    }

    // Death member select
    if (this.deathPersonSelect) {
      this.deathPersonSelect.innerHTML = members.map(m => `
        <option value="${m.personId}">${m.name} (${m.role || 'Member'}, ${m.age}y, ${m.gender})</option>
      `).join('');
    }
  }

  // =========================================================================
  // ASHA Workload Targets & Progress View (Requirements 14-16)
  // =========================================================================
  renderProgressView() {
    if (!this.progressContentArea) return;

    const user = userManager.getCurrentUser();
    const target = familyManager.getAshaTarget(user.id);
    const allFamilies = familyManager.getAllFamilies();
    const myFamilies = allFamilies.filter(f => f.assignedAsha === user.id || f.assignedAsha === 'ASHA001');
    const followUps = programmeManager.getFollowUps();
    const progReports = programmeManager.getAllReports();

    this.progressContentArea.innerHTML = `
      <div class="progress-kpis-grid">
        <div class="progress-kpi-card">
          <div class="progress-kpi-val" style="color: #0284C7;">${target.allocated}</div>
          <div class="progress-kpi-label">Allocated Household Target</div>
          <span style="font-size: 0.74rem; color: var(--text-muted);">Assigned by Medical Officer / Supervisor</span>
        </div>

        <div class="progress-kpi-card">
          <div class="progress-kpi-val" style="color: #059669;">${target.completed}</div>
          <div class="progress-kpi-label">Completed Encounters</div>
          <span style="font-size: 0.74rem; color: #059669; font-weight: 700;">✓ Target Progress</span>
        </div>

        <div class="progress-kpi-card">
          <div class="progress-kpi-val" style="color: #D97706;">${target.remaining}</div>
          <div class="progress-kpi-label">Remaining Households</div>
          <span style="font-size: 0.74rem; color: var(--text-muted);">Due for this surveillance cycle</span>
        </div>

        <div class="progress-kpi-card">
          <div class="progress-kpi-val" style="color: #0D9488;">${target.progressPercent}%</div>
          <div class="progress-kpi-label">Workload Completion Rate</div>
          <span style="font-size: 0.74rem; color: #0D9488; font-weight: 700;">Goal: 100% Coverage</span>
        </div>
      </div>

      <!-- Graphical Workload Gauge Progress Bar -->
      <div class="family-section-card" style="margin-bottom: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong style="font-size: 1rem; color: var(--text-main);">Cycle Workload Completion Gauge</strong>
            <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.15rem;">
              Frontline worker: <strong>${target.ashaName}</strong> (${target.ashaUserId}) • Area: <strong>${target.subCentre}</strong>
            </div>
          </div>
          <span class="brand-tag-pill" style="background: #D1FAE5; color: #065F46; font-weight: 800; font-size: 0.85rem;">
            ${target.completed} / ${target.allocated} Households (${target.progressPercent}%)
          </span>
        </div>

        <div class="progress-bar-container">
          <div class="progress-bar-fill" style="width: ${target.progressPercent}%;">
            ${target.progressPercent}%
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; font-size: 0.76rem; color: var(--text-muted);">
          <span>0 Households</span>
          <span>Target: ${target.allocated} Households (Cycle ends Oct 15)</span>
        </div>
      </div>

      <!-- Allocated Households Table -->
      <div class="family-section-card" style="margin-bottom: 1.5rem;">
        <div class="family-section-header">
          <div class="family-section-title">
            <span>🏘️</span> Allocated Household Files (${myFamilies.length} Assigned)
          </div>
          <button type="button" class="btn-inspect-enc" id="btnProgressAssignTrigger" style="font-weight: 700; font-size: 0.8rem;">
            <span>👥</span> Assign Another Family
          </button>
        </div>

        <table class="family-data-table">
          <thead>
            <tr>
              <th>Family ID</th>
              <th>Head of Household</th>
              <th>House No & Locality</th>
              <th>Member Census</th>
              <th>Status</th>
              <th>Last Contact</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${myFamilies.map(f => {
              const stats = familyManager.calculateFamilyStats(f);
              let statusPill = '<span class="census-pill" style="background:#E0F2FE; color:#0369A1;">🟡 In Progress</span>';
              if (f.status === 'COMPLETED') statusPill = '<span class="census-pill" style="background:#D1FAE5; color:#065F46;">✓ Completed</span>';
              if (f.status === 'FOLLOW_UP_REQUIRED') statusPill = '<span class="census-pill" style="background:#FEF3C7; color:#92400E;">🟠 Follow-up Due</span>';

              return `
                <tr>
                  <td><span class="family-id-tag">${f.familyId}</span></td>
                  <td><strong>${f.familyHead}</strong></td>
                  <td>${f.houseNumber}, ${f.address}</td>
                  <td>
                    <span class="census-pill total">${stats.totalMembers} members</span>
                    <span class="census-pill female">${stats.femaleCount}F</span>
                    <span class="census-pill male">${stats.maleCount}M</span>
                    ${stats.pregnantCount > 0 ? `<span class="census-pill female">🤰 ${stats.pregnantCount}</span>` : ''}
                  </td>
                  <td>${statusPill}</td>
                  <td>${f.lastVisit || '2026-09-18'}</td>
                  <td>
                    <button type="button" class="btn-inspect-enc btn-open-assigned-family" data-family-id="${f.familyId}" style="padding: 0.3rem 0.65rem; font-size: 0.78rem; font-weight: 700;">
                      Open Family →
                    </button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- Public Health Schemes Surveillance & Follow-Up Tracker -->
      <div class="family-section-card">
        <div class="family-section-header">
          <div class="family-section-title">
            <span>🏛️</span> Public Health Schemes Surveillance & Follow-Up Tracker (${followUps.length} Pending)
          </div>
          <span class="brand-tag-pill" style="background: #EEF2FF; color: #4338CA; font-weight: 700;">
            ${progReports.length} Reports Filed
          </span>
        </div>

        <table class="family-data-table">
          <thead>
            <tr>
              <th>Scheme / Programme</th>
              <th>Beneficiary / Target</th>
              <th>Interval</th>
              <th>Next Visit Due</th>
              <th>Action Needed</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${followUps.map(fu => `
              <tr>
                <td><strong>${fu.programmeName}</strong></td>
                <td>${fu.beneficiaryName}</td>
                <td><span class="programme-tag" style="font-size:0.72rem;">${fu.interval}</span></td>
                <td><strong style="color: #0D9488;">📅 ${fu.nextScheduledDate}</strong></td>
                <td><span style="font-size: 0.8rem;">${fu.actionRequired}</span></td>
                <td>
                  <button type="button" class="btn-inspect-enc btn-fu-view-prog" data-prog-id="${fu.programmeId}" style="padding: 0.25rem 0.6rem; font-size: 0.74rem;">
                    👁️ Programme
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    // Wire clicks on assigned family rows
    this.progressContentArea.querySelectorAll('.btn-open-assigned-family').forEach(btn => {
      btn.addEventListener('click', () => {
        const fid = btn.getAttribute('data-family-id');
        this.switchView('family');
        this.renderFamilyDetail(fid);
      });
    });

    const assignTrig = this.progressContentArea.querySelector('#btnProgressAssignTrigger');
    if (assignTrig) {
      assignTrig.addEventListener('click', () => {
        this.populateAssignFamilyModal();
        if (this.assignFamilyModal) this.assignFamilyModal.style.display = 'flex';
      });
    }

    this.progressContentArea.querySelectorAll('.btn-fu-view-prog').forEach(btn => {
      btn.addEventListener('click', () => {
        const progId = btn.getAttribute('data-prog-id');
        this.openProgrammeDetails(progId);
      });
    });
  }

  populateAssignFamilyModal() {
    if (!this.assignFamilySelect) return;
    const families = familyManager.getAllFamilies();
    this.assignFamilySelect.innerHTML = families.map(f => `
      <option value="${f.familyId}">${f.familyId} — ${f.familyHead} (${f.houseNumber})</option>
    `).join('');
  }

  // =========================================================================
  // Modal Submit Handlers
  // =========================================================================
  handleRegisterFamily() {
    const headName = document.getElementById('regFamilyHeadName')?.value.trim();
    const houseNo = document.getElementById('regFamilyHouseNumber')?.value.trim();
    const address = document.getElementById('regFamilyAddress')?.value.trim();
    const ashaUserId = document.getElementById('regFamilyAssignedAsha')?.value || 'ASHA001';

    if (!headName || !houseNo || !address) {
      this.showToast('Please fill in Family Head, House Number, and Address', 'warning');
      return;
    }

    const nextNum = (familyManager.getAllFamilies().length + 42);
    const familyId = `F0${nextNum}`;
    const ashaName = ashaUserId === 'ASHA001' ? 'Sita Rao' : (ashaUserId === 'ASHA002' ? 'Priya Kumar' : 'Lakshmi Devi');

    const newFam = {
      familyId,
      houseNumber: houseNo,
      familyHead: headName,
      address,
      assignedAsha: ashaUserId,
      assignedAshaName: ashaName,
      status: 'IN_PROGRESS',
      lastVisit: new Date().toISOString().split('T')[0],
      nextScheduledVisit: '2026-10-15',
      members: [
        {
          personId: `P-${headName.slice(0,3).toUpperCase()}-101`,
          name: headName,
          gender: 'Male',
          age: 40,
          role: 'Family Head',
          pregnancyStatus: 'Non-pregnant',
          status: 'Active Beneficiary',
          isPregnant: false,
          phone: '9848012345 (Synthetic)'
        }
      ],
      schemes: [],
      essentialHealthSupplies: [],
      medicinesProvided: [],
      events: [
        {
          id: `EVT-${Date.now().toString().slice(-4)}`,
          type: 'VISIT',
          title: 'New Family Registered in Surveillance Area',
          date: new Date().toISOString().split('T')[0],
          actor: userManager.getCurrentUser().fullName,
          description: `Family ${familyId} registered for House ${houseNo}. Family Head: ${headName}.`,
          verified: true,
          documentTitle: null
        }
      ]
    };

    familyManager.saveFamily(newFam);

    // Also register head in clinical profiles
    diagnosticManager.ensureProfileExists(headName, houseNo, 40, 'Male');

    this.registerFamilyModal.style.display = 'none';
    this.renderFamilyList(this.activeFamilyFilter, this.familySearchQuery);
    this.renderProgressView();
    this.showToast(`Family ${familyId} registered successfully!`, 'success');
  }

  handleAddFamilyMember() {
    const name = document.getElementById('familyMemberName')?.value.trim();
    const gender = document.getElementById('familyMemberGender')?.value || 'Female';
    const age = parseInt(document.getElementById('familyMemberAge')?.value || '20', 10);
    const role = document.getElementById('familyMemberRole')?.value.trim() || 'Member';
    const phone = document.getElementById('familyMemberPhone')?.value.trim() || '9848012345 (Synthetic)';
    const isPregnant = Boolean(document.getElementById('familyMemberIsPregnant')?.checked);

    if (!name) {
      this.showToast('Please enter member name', 'warning');
      return;
    }

    const res = familyManager.addFamilyMember(this.activeFamilyId, {
      name,
      gender,
      age,
      role,
      isPregnant,
      phone
    });

    if (res.success) {
      this.addFamilyMemberModal.style.display = 'none';
      this.renderFamilyDetail(this.activeFamilyId);
      this.showToast(`Added ${name} to Family ${this.activeFamilyId}!`, 'success');
    }
  }

  handleAddScheme() {
    const name = document.getElementById('schemeName')?.value.trim();
    const eligibility = document.getElementById('schemeEligibility')?.value || 'Eligible';
    const eligibleFor = document.getElementById('schemeEligibleFor')?.value || 'Family';
    const personId = this.schemeBeneficiaryPersonSelect?.value;
    const personName = this.schemeBeneficiaryPersonSelect?.selectedOptions[0]?.text || null;
    const status = document.getElementById('schemeStatus')?.value || 'Applied';
    const date = document.getElementById('schemeDate')?.value || new Date().toISOString().split('T')[0];
    const notes = document.getElementById('schemeNotes')?.value.trim();

    if (!name) {
      this.showToast('Please enter scheme name', 'warning');
      return;
    }

    familyManager.addScheme(this.activeFamilyId, {
      name,
      eligibility,
      eligibleFor,
      personId,
      personName,
      status,
      date,
      notes
    });

    this.addSchemeModal.style.display = 'none';
    this.renderFamilyDetail(this.activeFamilyId);
    this.showToast(`Enrolled in ${name}!`, 'success');
  }

  handleAddSupply() {
    const name = document.getElementById('supplyName')?.value;
    const quantity = parseInt(document.getElementById('supplyQuantity')?.value || '1', 10);
    const providedTo = document.getElementById('supplyProvidedTo')?.value || 'Family';
    const personId = this.supplyBeneficiaryPersonSelect?.value;
    const personName = this.supplyBeneficiaryPersonSelect?.selectedOptions[0]?.text || null;
    const date = document.getElementById('supplyDate')?.value || new Date().toISOString().split('T')[0];
    const notes = document.getElementById('supplyNotes')?.value.trim();

    familyManager.addSupply(this.activeFamilyId, {
      name,
      quantity,
      providedTo,
      personId,
      personName,
      date,
      notes
    });

    this.addSupplyModal.style.display = 'none';
    this.renderFamilyDetail(this.activeFamilyId);
    this.showToast(`Recorded ${quantity}x ${name}!`, 'success');
  }

  handleAddMedicine() {
    const name = document.getElementById('medName')?.value.trim();
    const quantity = parseInt(document.getElementById('medQuantity')?.value || '10', 10);
    const recipient = document.getElementById('medRecipientSelect')?.value || 'Beneficiary';
    const date = document.getElementById('medDate')?.value || new Date().toISOString().split('T')[0];
    const notes = document.getElementById('medNotes')?.value.trim();

    if (!name) {
      this.showToast('Please enter medicine name', 'warning');
      return;
    }

    familyManager.addMedicine(this.activeFamilyId, {
      name,
      quantity,
      recipient,
      date,
      notes
    });

    this.addMedicineModal.style.display = 'none';
    this.renderFamilyDetail(this.activeFamilyId);
    this.showToast(`Documented ${name} for ${recipient}!`, 'success');
  }

  handleReportBirth() {
    const motherName = document.getElementById('birthMotherSelect')?.value || 'Mother';
    const childName = document.getElementById('birthChildName')?.value.trim() || 'Newborn';
    const gender = document.getElementById('birthGender')?.value || 'Female';
    const dob = document.getElementById('birthDob')?.value || new Date().toISOString().split('T')[0];
    const placeOfBirth = document.getElementById('birthPlace')?.value.trim() || 'PHC Rampur';
    const notes = document.getElementById('birthNotes')?.value.trim();

    familyManager.reportBirth(this.activeFamilyId, {
      motherName,
      childName,
      gender,
      dob,
      placeOfBirth,
      notes
    });

    this.reportBirthModal.style.display = 'none';
    this.renderFamilyDetail(this.activeFamilyId);
    this.showToast(`Birth reported: Welcome ${childName}! Added to family roster.`, 'success');
  }

  handleReportDeath() {
    const personId = document.getElementById('deathPersonSelect')?.value;
    const personName = document.getElementById('deathPersonSelect')?.selectedOptions[0]?.text || 'Member';
    const dateOfDeath = document.getElementById('deathDate')?.value || new Date().toISOString().split('T')[0];
    const cause = document.getElementById('deathCause')?.value.trim() || 'Cause not recorded';
    const notes = document.getElementById('deathNotes')?.value.trim();

    familyManager.reportDeath(this.activeFamilyId, {
      personId,
      personName,
      dateOfDeath,
      cause,
      notes
    });

    this.reportDeathModal.style.display = 'none';
    this.renderFamilyDetail(this.activeFamilyId);
    this.showToast(`Death event recorded. Historical profile for ${personName} preserved.`, 'info');
  }

  handleReportHealthEvent() {
    const symptoms = document.getElementById('eventSymptoms')?.value.trim();
    const affectedCount = parseInt(document.getElementById('eventAffectedCount')?.value || '2', 10);
    const date = document.getElementById('eventDate')?.value || new Date().toISOString().split('T')[0];
    const description = document.getElementById('eventDescription')?.value.trim();

    if (!symptoms) {
      this.showToast('Please enter reported symptoms', 'warning');
      return;
    }

    familyManager.reportHealthEvent(this.activeFamilyId, {
      symptoms,
      affectedCount,
      date,
      description
    });

    this.reportHealthEventModal.style.display = 'none';
    this.renderFamilyDetail(this.activeFamilyId);
    this.showToast('Health event flag submitted for Medical Officer review!', 'warning');
  }

  handleReportProgramme() {
    const programmeType = document.getElementById('progType')?.value;
    const date = document.getElementById('progDate')?.value || new Date().toISOString().split('T')[0];
    const activityDetails = document.getElementById('progDetails')?.value.trim();
    const notes = document.getElementById('progNotes')?.value.trim();

    if (!activityDetails) {
      this.showToast('Please enter activity details', 'warning');
      return;
    }

    familyManager.reportProgramme(this.activeFamilyId, {
      programmeType,
      date,
      activityDetails,
      notes
    });

    this.reportProgrammeModal.style.display = 'none';
    this.renderFamilyDetail(this.activeFamilyId);
    this.showToast(`Programme report saved: ${programmeType}`, 'success');
  }

  handleEditTarget() {
    const newTarget = parseInt(this.targetAllocatedInput?.value || '45', 10);
    const user = userManager.getCurrentUser();
    familyManager.setAshaTarget(user.id, newTarget);

    this.editTargetModal.style.display = 'none';
    this.renderProgressView();
    this.showToast(`Household target updated to ${newTarget}!`, 'success');
  }

  handleAssignFamily() {
    const familyId = this.assignFamilySelect?.value;
    const ashaUserId = this.assignAshaSelect?.value || 'ASHA001';
    const ashaName = this.assignAshaSelect?.selectedOptions[0]?.text.split(' - ')[1]?.split(' (')[0] || 'ASHA Worker';

    familyManager.assignFamilyToAsha(familyId, ashaUserId, ashaName);

    this.assignFamilyModal.style.display = 'none';
    this.renderFamilyList(this.activeFamilyFilter, this.familySearchQuery);
    this.renderProgressView();
    this.showToast(`Family ${familyId} assigned to ${ashaName}!`, 'success');
  }

  // =========================================================================
  // Health Programmes & Schemes Subsystem (47+ National Programmes)
  // =========================================================================
  renderProgrammesView() {
    if (!this.viewProgrammes) return;

    const stats = programmeManager.getStats();

    // Render KPI Cards
    if (this.programmeKpiGrid) {
      this.programmeKpiGrid.innerHTML = `
        <div class="programme-kpi-card">
          <div class="kpi-val" style="color: #4F46E5;">${stats.totalProgrammes}</div>
          <div class="kpi-label">Total Programmes & Schemes</div>
          <span style="font-size: 0.72rem; color: var(--text-muted);">Covering National Health Mission Portfolio</span>
        </div>

        <div class="programme-kpi-card">
          <div class="kpi-val" style="color: #0D9488;">${stats.totalCategories}</div>
          <div class="kpi-label">Health Categories</div>
          <span style="font-size: 0.72rem; color: #0D9488; font-weight: 700;">Maternal, Child, NCD, TB, etc.</span>
        </div>

        <div class="programme-kpi-card">
          <div class="kpi-val" style="color: #059669;">${stats.totalAssignments}</div>
          <div class="kpi-label">Enrolled Beneficiaries / Families</div>
          <span style="font-size: 0.72rem; color: #059669; font-weight: 700;">✓ Community Linkage</span>
        </div>

        <div class="programme-kpi-card">
          <div class="kpi-val" style="color: #2563EB;">${stats.verifiedAssignments}</div>
          <div class="kpi-label">Doctor / Officer Verified</div>
          <span style="font-size: 0.72rem; color: #2563EB; font-weight: 700;">Validated Records</span>
        </div>

        <div class="programme-kpi-card">
          <div class="kpi-val" style="color: #D97706;">${stats.pendingReview}</div>
          <div class="kpi-label">Pending / Under Review</div>
          <span style="font-size: 0.72rem; color: #D97706; font-weight: 700;">Awaiting Validation</span>
        </div>

        <div class="programme-kpi-card">
          <div class="kpi-val" style="color: #DC2626;">${stats.activeFollowUps}</div>
          <div class="kpi-label">Active Programme Follow-Ups</div>
          <span style="font-size: 0.72rem; color: #DC2626; font-weight: 700;">Scheduled Visits Due</span>
        </div>
      `;
    }

    // Render Category Filter Pills
    if (this.programmeCategoryFilters) {
      const allProgs = programmeManager.getAllProgrammes();
      const categories = Array.from(new Set(PROGRAMME_CATEGORIES));

      this.programmeCategoryFilters.innerHTML = categories.map(cat => {
        const isActive = (cat === this.selectedProgrammeCategory);
        const count = cat === 'All Categories' 
          ? allProgs.length 
          : allProgs.filter(p => p.category === cat).length;

        return `
          <button type="button" class="btn-category-pill ${isActive ? 'active' : ''}" data-category="${cat}">
            <span>${cat}</span>
            <span class="pill-count">${count}</span>
          </button>
        `;
      }).join('');

      this.programmeCategoryFilters.querySelectorAll('.btn-category-pill').forEach(btn => {
        btn.addEventListener('click', () => {
          this.programmeCategoryFilters.querySelectorAll('.btn-category-pill').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.selectedProgrammeCategory = btn.getAttribute('data-category');
          this.renderProgrammesCards();
        });
      });
    }

    // Populate Modal Dropdowns
    this.populateProgrammeModalDropdowns();

    // Render the grid of cards
    this.renderProgrammesCards();
  }

  populateProgrammeModalDropdowns() {
    const allProgs = programmeManager.getAllProgrammes();
    const allProfiles = diagnosticManager.getAllProfiles();
    const allFamilies = familyManager.getAllFamilies();

    // Populate Eligibility Programme Select
    if (this.eligibilityProgrammeSelect) {
      this.eligibilityProgrammeSelect.innerHTML = allProgs.map(p => `
        <option value="${p.id}">[${p.abbr}] ${p.name} (${p.category})</option>
      `).join('');
    }

    // Populate Eligibility Person Select
    if (this.eligibilityPersonSelect) {
      this.eligibilityPersonSelect.innerHTML = allProfiles.map(p => `
        <option value="${p.personId}">${p.name || p.personName} (${p.personId} • Household ${p.householdId})</option>
      `).join('');
    }

    // Populate Eligibility Family Select
    if (this.eligibilityFamilySelect) {
      this.eligibilityFamilySelect.innerHTML = allFamilies.map(f => `
        <option value="${f.familyId}">${f.familyId} — ${f.familyHead} (${f.houseNumber}, ${f.address})</option>
      `).join('');
    }

    // Populate Report Programme Select
    if (this.reportProgProgrammeSelect) {
      this.reportProgProgrammeSelect.innerHTML = allProgs.map(p => `
        <option value="${p.id}">[${p.abbr}] ${p.name}</option>
      `).join('');
    }

    // Populate Report Target Select
    if (this.reportProgTargetSelect) {
      let targetOpts = '<optgroup label="Individuals">';
      allProfiles.forEach(p => {
        targetOpts += `<option value="PERSON:${p.personId}:${p.householdId}">${p.name || p.personName} (${p.personId})</option>`;
      });
      targetOpts += '</optgroup><optgroup label="Households">';
      allFamilies.forEach(f => {
        targetOpts += `<option value="FAMILY:${f.familyId}">${f.familyId} — ${f.familyHead}'s Family</option>`;
      });
      targetOpts += '</optgroup>';
      this.reportProgTargetSelect.innerHTML = targetOpts;
    }

    // Populate Supply & Medicine Related Programme Selects
    if (this.supplyRelatedProgrammeSelect) {
      this.supplyRelatedProgrammeSelect.innerHTML = '<option value="">None / Routine Frontline Distribution</option>' +
        allProgs.map(p => `<option value="${p.abbr}">${p.abbr} — ${p.name}</option>`).join('');
    }

    if (this.medRelatedProgrammeSelect) {
      this.medRelatedProgrammeSelect.innerHTML = '<option value="">None / PHC Standing Protocol</option>' +
        allProgs.map(p => `<option value="${p.abbr}">${p.abbr} — ${p.name}</option>`).join('');
    }

    // Populate Admin Programme Category Select
    if (this.adminProgCategorySelect) {
      this.adminProgCategorySelect.innerHTML = PROGRAMME_CATEGORIES.filter(c => c !== 'All Categories').map(c => `
        <option value="${c}">${c}</option>
      `).join('');
    }
  }

  renderProgrammesCards() {
    if (!this.programmesCardsGrid) return;

    let progs = programmeManager.getAllProgrammes();

    // Category Filter
    if (this.selectedProgrammeCategory && this.selectedProgrammeCategory !== 'All Categories') {
      progs = progs.filter(p => p.category === this.selectedProgrammeCategory);
    }

    // Search Query Filter
    if (this.programmeSearchQuery) {
      const q = this.programmeSearchQuery.toLowerCase();
      progs = progs.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.abbr.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.eligibilityCriteria && p.eligibilityCriteria.toLowerCase().includes(q)) ||
        (p.benefits && p.benefits.toLowerCase().includes(q)) ||
        (p.keywords && p.keywords.some(k => k.toLowerCase().includes(q)))
      );
    }

    if (progs.length === 0) {
      this.programmesCardsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; background: #F8FAFC; border: 1.5px dashed var(--border-subtle); border-radius: var(--radius-md); padding: 3rem 1.5rem; text-align: center;">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🔍</div>
          <h3 style="color: var(--text-main); font-weight: 700; margin-bottom: 0.5rem;">No Health Programmes Found</h3>
          <p style="color: var(--text-muted); font-size: 0.9rem; max-width: 480px; margin: 0 auto 1.25rem auto;">
            No public health schemes match the query "<strong>${this.programmeSearchQuery}</strong>" in category "${this.selectedProgrammeCategory}".
          </p>
          <button type="button" class="btn-inspect-enc" id="btnClearProgSearch" style="padding: 0.45rem 1rem; font-weight: 700;">
            Clear Search & Filters
          </button>
        </div>
      `;

      const btnClear = this.programmesCardsGrid.querySelector('#btnClearProgSearch');
      if (btnClear) {
        btnClear.addEventListener('click', () => {
          this.programmeSearchQuery = '';
          if (this.programmeSearchInput) this.programmeSearchInput.value = '';
          this.selectedProgrammeCategory = 'All Categories';
          this.renderProgrammesView();
        });
      }
      return;
    }

    this.programmesCardsGrid.innerHTML = progs.map(p => {
      const assignments = programmeManager.getAssignmentsForProgramme(p.id);
      const reports = programmeManager.getReportsForProgramme(p.id);

      return `
        <div class="programme-card-item">
          <div class="prog-card-header">
            <div style="display: flex; align-items: center; gap: 0.6rem; flex: 1;">
              <span class="prog-icon">${p.icon || '🏛️'}</span>
              <div>
                <span class="prog-abbr-tag">${p.abbr}</span>
                <div class="prog-category-badge">${p.category}</div>
              </div>
            </div>
            <span class="brand-tag-pill" style="background: #E0E7FF; color: #3730A3; font-weight: 700; font-size: 0.72rem;">
              👥 ${assignments.length} Enrolled
            </span>
          </div>

          <h3 class="prog-name-title">${p.name}</h3>

          <p class="prog-desc-snippet">${p.description}</p>

          <div class="prog-meta-block">
            <div style="margin-bottom: 0.35rem;">
              <strong style="color: var(--text-main); font-size: 0.78rem;">Target / Criteria:</strong>
              <span style="font-size: 0.78rem; color: var(--text-muted);">${p.eligibilityCriteria}</span>
            </div>
            <div>
              <strong style="color: #059669; font-size: 0.78rem;">Key Benefit:</strong>
              <span style="font-size: 0.78rem; color: var(--text-main);">${p.benefits}</span>
            </div>
          </div>

          <div class="prog-card-actions">
            <button type="button" class="btn-inspect-enc btn-prog-card-detail" data-prog-id="${p.id}" title="View Complete Scheme Profile & Beneficiaries">
              👁️ Details
            </button>
            <button type="button" class="btn-inspect-enc btn-prog-card-elig" data-prog-id="${p.id}" style="border-color: #4F46E5; color: #4F46E5; font-weight: 700;" title="Enroll Person or Family">
              👤 Check / Enroll
            </button>
            <button type="button" class="btn-inspect-enc btn-prog-card-report" data-prog-id="${p.id}" title="Log Field Report">
              📝 Add Report
            </button>
            <button type="button" class="btn-inspect-enc btn-prog-card-edit" data-prog-id="${p.id}" style="padding: 0.3rem 0.5rem;" title="Admin Edit">
              ✏️
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Wire Card Action Buttons
    this.programmesCardsGrid.querySelectorAll('.btn-prog-card-detail').forEach(btn => {
      btn.addEventListener('click', () => {
        const progId = btn.getAttribute('data-prog-id');
        this.openProgrammeDetails(progId);
      });
    });

    this.programmesCardsGrid.querySelectorAll('.btn-prog-card-elig').forEach(btn => {
      btn.addEventListener('click', () => {
        const progId = btn.getAttribute('data-prog-id');
        this.openProgrammeEligibilityModal(progId);
      });
    });

    this.programmesCardsGrid.querySelectorAll('.btn-prog-card-report').forEach(btn => {
      btn.addEventListener('click', () => {
        const progId = btn.getAttribute('data-prog-id');
        this.openAddProgrammeReportModal(progId);
      });
    });

    this.programmesCardsGrid.querySelectorAll('.btn-prog-card-edit').forEach(btn => {
      btn.addEventListener('click', () => {
        const progId = btn.getAttribute('data-prog-id');
        this.openAdminProgrammeModal(progId);
      });
    });
  }

  openProgrammeDetails(progId) {
    const prog = programmeManager.getProgrammeById(progId);
    if (!prog || !this.programmeDetailModal) return;

    this.activeViewingProgId = progId;

    if (this.progDetailName) this.progDetailName.textContent = prog.name;
    if (this.progDetailAbbr) this.progDetailAbbr.textContent = prog.abbr;
    if (this.progDetailCategory) this.progDetailCategory.textContent = prog.category;

    const assignments = programmeManager.getAssignmentsForProgramme(progId);
    const reports = programmeManager.getReportsForProgramme(progId);

    if (this.progDetailBody) {
      this.progDetailBody.innerHTML = `
        <!-- Overview & Description -->
        <div class="prog-detail-section">
          <div class="section-heading"><span>📋</span> Programme Overview</div>
          <p style="font-size: 0.9rem; line-height: 1.6; color: var(--text-main); margin: 0;">
            ${prog.description}
          </p>
        </div>

        <!-- Target Beneficiaries & Eligibility -->
        <div class="prog-detail-section">
          <div class="section-heading"><span>🎯</span> Target Beneficiaries & Eligibility Criteria</div>
          <div style="background: #F0FDF4; border: 1.5px solid #BBF7D0; border-radius: var(--radius-sm); padding: 1rem;">
            <p style="font-size: 0.88rem; color: #166534; margin: 0; line-height: 1.5;">
              <strong>Criteria:</strong> ${prog.eligibilityCriteria}
            </p>
          </div>
        </div>

        <!-- Benefits & Financial Entitlements -->
        <div class="prog-detail-section">
          <div class="section-heading"><span>💰</span> Benefits & Services Provided</div>
          <div style="background: #EEF2FF; border: 1.5px solid #C7D2FE; border-radius: var(--radius-sm); padding: 1rem;">
            <p style="font-size: 0.88rem; color: #3730A3; margin: 0; line-height: 1.5;">
              <strong>Entitlements:</strong> ${prog.benefits}
            </p>
          </div>
        </div>

        <!-- Follow-up Surveillance Protocol -->
        <div class="prog-detail-section">
          <div class="section-heading"><span>🗓️</span> Frontline Surveillance & Follow-Up Protocol</div>
          <div style="background: #F8FAFC; border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 1rem;">
            <p style="font-size: 0.88rem; color: var(--text-main); margin: 0; line-height: 1.5;">
              <strong>Protocol:</strong> ${prog.followupFrequency || 'Routine monthly community follow-up and surveillance visit.'}
            </p>
          </div>
        </div>

        <!-- Connected Beneficiaries / Households -->
        <div class="prog-detail-section">
          <div class="section-heading" style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span>👥</span> Connected Beneficiaries & Families (${assignments.length})
            </div>
            <button type="button" class="btn-inspect-enc" id="btnDetailModalEnrollTrigger" style="font-size: 0.76rem; font-weight: 700;">
              + Enroll New Beneficiary
            </button>
          </div>

          ${assignments.length > 0 ? `
            <table class="family-data-table" style="margin-top: 0.5rem;">
              <thead>
                <tr>
                  <th>Beneficiary / Family</th>
                  <th>Target Type</th>
                  <th>Enrolment Date</th>
                  <th>Verification Status</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                ${assignments.map(a => {
                  let badge = '<span class="brand-tag-pill" style="background:#FEF3C7; color:#92400E; font-size:0.7rem; font-weight:700;">🟡 Under Review</span>';
                  if (a.verificationStatus === 'Verified') {
                    badge = '<span class="brand-tag-pill" style="background:#D1FAE5; color:#065F46; font-size:0.7rem; font-weight:700;">✓ Verified</span>';
                  } else if (a.verificationStatus === 'Reported') {
                    badge = '<span class="brand-tag-pill" style="background:#E0F2FE; color:#0369A1; font-size:0.7rem; font-weight:700;">📋 Reported</span>';
                  }

                  const targetLabel = a.targetType === 'family' 
                    ? `Family: <strong>${a.familyId}</strong>` 
                    : `Person: <strong>${a.personName || a.personId}</strong> (${a.familyId})`;

                  return `
                    <tr>
                      <td>${targetLabel}</td>
                      <td><span class="census-pill" style="font-size:0.72rem;">${a.targetType.toUpperCase()}</span></td>
                      <td>${a.enrolledDate}</td>
                      <td>${badge}</td>
                      <td><span style="font-size: 0.78rem;">${a.notes || 'Routine enrolment'}</span></td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          ` : `
            <div style="background: #F8FAFC; border: 1.5px dashed var(--border-subtle); border-radius: var(--radius-sm); padding: 1.25rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
              No community members or households currently assigned to this programme.
            </div>
          `}
        </div>

        <!-- Field Reports Logged -->
        <div class="prog-detail-section">
          <div class="section-heading" style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span>📝</span> Field Reports & Activities (${reports.length})
            </div>
            <button type="button" class="btn-inspect-enc" id="btnDetailModalReportTrigger" style="font-size: 0.76rem; font-weight: 700;">
              + File Activity Report
            </button>
          </div>

          ${reports.length > 0 ? `
            <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-top: 0.5rem;">
              ${reports.map(r => `
                <div style="background: #F8FAFC; border: 1px solid var(--border-subtle); border-left: 4px solid #4F46E5; border-radius: var(--radius-sm); padding: 0.75rem 1rem;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <strong style="color: var(--text-main); font-size: 0.88rem;">${r.title}</strong>
                    <span style="font-size: 0.75rem; color: var(--text-muted);">📅 ${r.date}</span>
                  </div>
                  <div style="font-size: 0.78rem; color: var(--text-muted); margin: 0.25rem 0;">
                    Target: <strong>${r.targetName || r.targetId}</strong> • Type: <span class="programme-tag" style="font-size:0.68rem;">${r.reportType}</span> • By: <strong>${r.reportedBy}</strong>
                  </div>
                  <p style="font-size: 0.84rem; color: var(--text-main); margin: 0.35rem 0 0 0;">${r.details}</p>
                </div>
              `).join('')}
            </div>
          ` : `
            <div style="background: #F8FAFC; border: 1.5px dashed var(--border-subtle); border-radius: var(--radius-sm); padding: 1.25rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
              No field activity reports documented for this scheme yet.
            </div>
          `}
        </div>

        <!-- Disclaimer Banner -->
        <div class="alert-box alert-info" style="font-size: 0.78rem; margin-top: 1rem;">
          ℹ️ <strong>Demonstration Notice:</strong> National Health Programme profiles are compiled from standard NHM, MoHFW, and Ayushman Bharat operational guidelines for demonstration and simulation purposes. The system assists frontline workflow coordination and does not autonomously approve government entitlement disbursements or replace official DBT/PFMS verification gateways.
        </div>
      `;

      const btnEnr = this.progDetailBody.querySelector('#btnDetailModalEnrollTrigger');
      if (btnEnr) {
        btnEnr.addEventListener('click', () => {
          this.programmeDetailModal.style.display = 'none';
          this.openProgrammeEligibilityModal(progId);
        });
      }

      const btnRep = this.progDetailBody.querySelector('#btnDetailModalReportTrigger');
      if (btnRep) {
        btnRep.addEventListener('click', () => {
          this.programmeDetailModal.style.display = 'none';
          this.openAddProgrammeReportModal(progId);
        });
      }
    }

    this.programmeDetailModal.style.display = 'flex';
  }

  openProgrammeEligibilityModal(progId = null, targetType = 'individual', targetId = null) {
    if (!this.programmeEligibilityModal) return;

    this.populateProgrammeModalDropdowns();

    if (progId && this.eligibilityProgrammeSelect) {
      this.eligibilityProgrammeSelect.value = progId;
    }

    if (targetType === 'individual') {
      if (this.radioEligIndividual) this.radioEligIndividual.checked = true;
      if (this.eligibilityPersonGroup) this.eligibilityPersonGroup.style.display = 'block';
      if (this.eligibilityFamilyGroup) this.eligibilityFamilyGroup.style.display = 'none';
      if (targetId && this.eligibilityPersonSelect) this.eligibilityPersonSelect.value = targetId;
    } else {
      if (this.radioEligFamily) this.radioEligFamily.checked = true;
      if (this.eligibilityPersonGroup) this.eligibilityPersonGroup.style.display = 'none';
      if (this.eligibilityFamilyGroup) this.eligibilityFamilyGroup.style.display = 'block';
      if (targetId && this.eligibilityFamilySelect) this.eligibilityFamilySelect.value = targetId;
    }

    if (this.eligibilityVerificationStatusSelect) this.eligibilityVerificationStatusSelect.value = 'Reported';
    if (this.eligibilityNotesInput) this.eligibilityNotesInput.value = '';
    if (this.eligibilityDocInput) this.eligibilityDocInput.value = '';

    this.programmeEligibilityModal.style.display = 'flex';
  }

  handleSaveProgrammeEligibility() {
    const progId = this.eligibilityProgrammeSelect?.value;
    if (!progId) {
      this.showToast('Please select a health programme', 'warning');
      return;
    }

    const isIndividual = this.radioEligIndividual?.checked;
    const targetType = isIndividual ? 'individual' : 'family';
    let targetId = '';
    let targetName = '';
    let familyId = '';

    if (isIndividual) {
      targetId = this.eligibilityPersonSelect?.value;
      const profile = diagnosticManager.getProfileByPersonOrHousehold(targetId);
      targetName = profile ? (profile.name || profile.personName) : targetId;
      familyId = profile ? (profile.householdId || 'F042') : 'F042';
    } else {
      targetId = this.eligibilityFamilySelect?.value;
      const family = familyManager.getFamilyById(targetId);
      targetName = family ? `${family.familyHead}'s Family` : targetId;
      familyId = targetId;
    }

    const verificationStatus = this.eligibilityVerificationStatusSelect?.value || 'Reported';
    const notes = this.eligibilityNotesInput?.value.trim() || 'Frontline eligibility documented';
    const docRef = this.eligibilityDocInput?.value.trim() || '';

    const res = programmeManager.assignBeneficiary({
      programmeId: progId,
      targetType,
      targetId,
      targetName,
      familyId,
      verificationStatus,
      notes,
      docRef
    });

    this.programmeEligibilityModal.style.display = 'none';
    this.renderProgrammesView();

    if (this.currentView === 'diagnostic') {
      this.renderDiagnosticPersonProfile(this.activeDiagnosticPersonId);
    } else if (this.currentView === 'family') {
      this.renderFamilyDetail(this.activeFamilyId);
    } else if (this.currentView === 'progress') {
      this.renderProgressView();
    }

    const prog = programmeManager.getProgrammeById(progId);
    this.showToast(`Enrolled ${targetName} into ${prog ? prog.abbr : progId}!`, 'success');
  }

  openAddProgrammeReportModal(progId = null, targetId = null) {
    if (!this.addProgrammeReportModal) return;

    this.populateProgrammeModalDropdowns();

    if (progId && this.reportProgProgrammeSelect) {
      this.reportProgProgrammeSelect.value = progId;
    }

    if (targetId && this.reportProgTargetSelect) {
      this.reportProgTargetSelect.value = targetId;
    }

    if (this.reportProgDateInput) {
      this.reportProgDateInput.value = new Date().toISOString().split('T')[0];
    }

    if (this.reportProgTitleInput) this.reportProgTitleInput.value = '';
    if (this.reportProgDetailsInput) this.reportProgDetailsInput.value = '';

    this.addProgrammeReportModal.style.display = 'flex';
  }

  handleSaveProgrammeReport() {
    const progId = this.reportProgProgrammeSelect?.value;
    const targetVal = this.reportProgTargetSelect?.value || 'PERSON:P-SIT-101:F042';
    const reportType = this.reportProgTypeSelect?.value || 'FIELD_VISIT';
    const title = this.reportProgTitleInput?.value.trim();
    const details = this.reportProgDetailsInput?.value.trim();
    const date = this.reportProgDateInput?.value || new Date().toISOString().split('T')[0];

    if (!title || !details) {
      this.showToast('Please enter report title and activity details', 'warning');
      return;
    }

    const parts = targetVal.split(':');
    let targetType = 'individual';
    let targetId = parts[1] || 'P-SIT-101';
    let familyId = parts[2] || 'F042';
    let targetName = targetId;

    if (parts[0] === 'FAMILY') {
      targetType = 'family';
      targetId = parts[1];
      familyId = parts[1];
      const fam = familyManager.getFamilyById(familyId);
      targetName = fam ? `${fam.familyHead}'s Family` : familyId;
    } else {
      const prof = diagnosticManager.getProfileByPersonOrHousehold(targetId);
      targetName = prof ? (prof.name || prof.personName) : targetId;
    }

    programmeManager.addReport({
      programmeId: progId,
      targetType,
      targetId,
      targetName,
      familyId,
      reportType,
      title,
      details,
      date,
      reportedBy: 'ASHA Worker (Sita Rao)'
    });

    this.addProgrammeReportModal.style.display = 'none';
    this.renderProgrammesView();

    if (this.currentView === 'progress') {
      this.renderProgressView();
    }

    this.showToast('Programme field report logged successfully!', 'success');
  }

  openAdminProgrammeModal(progId = null) {
    if (!this.adminProgrammeModal) return;

    this.populateProgrammeModalDropdowns();

    const titleEl = document.getElementById('adminProgrammeModalTitle');

    if (progId) {
      const prog = programmeManager.getProgrammeById(progId);
      if (prog) {
        if (titleEl) titleEl.textContent = `Edit Health Programme: [${prog.abbr}]`;
        if (this.adminProgIdInput) {
          this.adminProgIdInput.value = prog.id;
          this.adminProgIdInput.readOnly = true;
        }
        if (this.adminProgAbbrInput) this.adminProgAbbrInput.value = prog.abbr;
        if (this.adminProgNameInput) this.adminProgNameInput.value = prog.name;
        if (this.adminProgCategorySelect) this.adminProgCategorySelect.value = prog.category;
        if (this.adminProgDescInput) this.adminProgDescInput.value = prog.description;
        if (this.adminProgCriteriaInput) this.adminProgCriteriaInput.value = prog.eligibilityCriteria;
        if (this.adminProgBenefitsInput) this.adminProgBenefitsInput.value = prog.benefits;
        if (this.adminProgFollowupInput) this.adminProgFollowupInput.value = prog.followupFrequency;
      }
    } else {
      if (titleEl) titleEl.textContent = 'Add New Public Health Programme (Admin)';
      const autoId = `PROG-CUSTOM-${Date.now().toString().slice(-4)}`;
      if (this.adminProgIdInput) {
        this.adminProgIdInput.value = autoId;
        this.adminProgIdInput.readOnly = false;
      }
      if (this.adminProgAbbrInput) this.adminProgAbbrInput.value = '';
      if (this.adminProgNameInput) this.adminProgNameInput.value = '';
      if (this.adminProgCategorySelect) this.adminProgCategorySelect.value = 'Primary Healthcare';
      if (this.adminProgDescInput) this.adminProgDescInput.value = '';
      if (this.adminProgCriteriaInput) this.adminProgCriteriaInput.value = '';
      if (this.adminProgBenefitsInput) this.adminProgBenefitsInput.value = '';
      if (this.adminProgFollowupInput) this.adminProgFollowupInput.value = 'Monthly follow-up visit and surveillance';
    }

    this.adminProgrammeModal.style.display = 'flex';
  }

  handleSaveAdminProgramme() {
    const id = this.adminProgIdInput?.value.trim();
    const abbr = this.adminProgAbbrInput?.value.trim();
    const name = this.adminProgNameInput?.value.trim();
    const category = this.adminProgCategorySelect?.value || 'Primary Healthcare';
    const description = this.adminProgDescInput?.value.trim();
    const eligibilityCriteria = this.adminProgCriteriaInput?.value.trim();
    const benefits = this.adminProgBenefitsInput?.value.trim();
    const followupFrequency = this.adminProgFollowupInput?.value.trim();

    if (!id || !abbr || !name) {
      this.showToast('Please provide Programme ID, Code/Abbreviation, and Full Name', 'warning');
      return;
    }

    programmeManager.upsertProgramme({
      id,
      abbr,
      name,
      category,
      description: description || 'National Public Health Initiative',
      eligibilityCriteria: eligibilityCriteria || 'Community population',
      benefits: benefits || 'Essential healthcare services',
      followupFrequency: followupFrequency || 'Monthly follow-up visit and surveillance'
    });

    this.adminProgrammeModal.style.display = 'none';
    this.renderProgrammesView();
    this.showToast(`Health Programme ${abbr} saved!`, 'success');
  }

  // =========================================================================
  // Toast Notification System
  // =========================================================================
  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'warning') icon = '⚠️';

    toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(15px)';
      toast.style.transition = '0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4200);
  }
}

// Initialize Application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.ashaApp = new AshaCopilotApp();
  });
} else {
  window.ashaApp = new AshaCopilotApp();
}
