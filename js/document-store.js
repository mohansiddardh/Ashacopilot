/**
 * ASHA Copilot 2.0+ - Local Document Storage Engine
 * Kalachakra 2K26 Healthcare PS-H02
 * 
 * Local persistence for clinical reports, lab tests, and verification files
 * (PDF, JPG, JPEG, PNG) linked to Person Profiles and Household Encounters.
 */

const STORAGE_KEY = 'asha_db_documents_v2';

// Helper to create synthetic demo document data URLs for prototype viewing/downloading
function createSampleSvgDocument(title, category, date, patientName, status, notes) {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="650" height="850" viewBox="0 0 650 850">
    <rect width="650" height="850" fill="#FFFFFF"/>
    <rect x="25" y="25" width="600" height="800" rx="8" fill="none" stroke="#CBD5E1" stroke-width="2"/>
    
    <!-- Header -->
    <rect x="25" y="25" width="600" height="90" fill="#0D9488"/>
    <text x="50" y="65" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="#FFFFFF">RAMPUR COMMUNITY HEALTH CENTRE</text>
    <text x="50" y="92" font-family="Arial, sans-serif" font-size="13" fill="#CCFBF1">Primary Health Diagnostic Laboratory • DEMO SYNTHETIC REPORT</text>
    
    <!-- Patient Info Box -->
    <rect x="50" y="140" width="550" height="95" rx="6" fill="#F8FAFC" stroke="#E2E8F0"/>
    <text x="70" y="170" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#334155">Patient Name:</text>
    <text x="170" y="170" font-family="Arial, sans-serif" font-size="13" fill="#0F172A">${patientName}</text>
    
    <text x="350" y="170" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#334155">Date:</text>
    <text x="400" y="170" font-family="Arial, sans-serif" font-size="13" fill="#0F172A">${date}</text>
    
    <text x="70" y="205" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#334155">Category:</text>
    <text x="170" y="205" font-family="Arial, sans-serif" font-size="13" fill="#0D9488">${category}</text>
    
    <text x="350" y="205" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#334155">Status:</text>
    <text x="410" y="205" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="${status === 'DOCTOR_VERIFIED' ? '#059669' : '#D97706'}">${status === 'DOCTOR_VERIFIED' ? '✓ VERIFIED' : '🟡 PENDING'}</text>
    
    <!-- Report Title -->
    <text x="50" y="275" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#0F172A">${title}</text>
    <line x1="50" y1="290" x2="600" y2="290" stroke="#0D9488" stroke-width="2"/>
    
    <!-- Content Table -->
    <rect x="50" y="315" width="550" height="35" fill="#F1F5F9"/>
    <text x="70" y="338" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#475569">PARAMETER</text>
    <text x="250" y="338" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#475569">OBSERVED VALUE</text>
    <text x="430" y="338" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#475569">NORMAL RANGE</text>
    
    <text x="70" y="380" font-family="Arial, sans-serif" font-size="13" fill="#1E293B">Clinical Impression</text>
    <text x="250" y="380" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#059669">Normal / Stable</text>
    <text x="430" y="380" font-family="Arial, sans-serif" font-size="13" fill="#64748B">Within Limits</text>
    
    <text x="70" y="420" font-family="Arial, sans-serif" font-size="13" fill="#1E293B">Gestational Fetal Heart</text>
    <text x="250" y="420" font-family="Arial, sans-serif" font-size="13" fill="#0F172A">142 bpm (Regular)</text>
    <text x="430" y="420" font-family="Arial, sans-serif" font-size="13" fill="#64748B">120 - 160 bpm</text>
    
    <text x="70" y="460" font-family="Arial, sans-serif" font-size="13" fill="#1E293B">Hemoglobin (Hb)</text>
    <text x="250" y="460" font-family="Arial, sans-serif" font-size="13" fill="#0F172A">11.4 g/dL</text>
    <text x="430" y="460" font-family="Arial, sans-serif" font-size="13" fill="#64748B">11.0 - 14.0 g/dL</text>
    
    <!-- Clinical Notes -->
    <rect x="50" y="520" width="550" height="120" rx="6" fill="#FEFCE8" stroke="#FEF08A"/>
    <text x="70" y="550" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#854D0E">Physician / Verifier Observation:</text>
    <text x="70" y="580" font-family="Arial, sans-serif" font-size="12" fill="#713F12">${notes}</text>
    <text x="70" y="610" font-family="Arial, sans-serif" font-size="11" fill="#A16207">Regular antenatal supplementation (IFA, Calcium) recommended.</text>
    
    <!-- Footer / Stamp -->
    <rect x="380" y="680" width="220" height="90" rx="6" fill="#F0FDF4" stroke="#86EFAC" stroke-dasharray="4"/>
    <text x="400" y="710" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#166534">MEDICAL OFFICER</text>
    <text x="400" y="730" font-family="Arial, sans-serif" font-size="11" fill="#15803D">Dr. K. V. Sharma (MO-PHC-02)</text>
    <text x="400" y="750" font-family="Arial, sans-serif" font-size="10" fill="#16A34A">Verified: ${date}</text>
    
    <!-- Mandatory Notice -->
    <text x="50" y="805" font-family="Arial, sans-serif" font-size="10" fill="#94A3B8">⚠️ Kalachakra 2K26 Healthcare PS-H02 Prototype: Synthetic demo health record. Not for real clinical diagnosis.</text>
  </svg>
  `;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg.trim());
}

export class DocumentStoreManager {
  constructor() {
    this.seedInitialDocuments();
  }

  seedInitialDocuments() {
    const existing = this.getAllDocuments();
    if (existing.length === 0) {
      const sample1 = {
        id: 'DOC-1001',
        fileName: 'Pregnancy_Ultrasound_Report_20w.pdf',
        fileType: 'application/pdf',
        category: 'Pregnancy Report',
        personId: 'P-SIT-101',
        personName: 'Sita Devi',
        householdId: 'H001',
        encounterId: 'ENC-001',
        uploadDate: '2026-09-05T10:30:00.000Z',
        uploadedBy: 'ASHA001 - Sita Rao',
        verificationStatus: 'DOCTOR_VERIFIED',
        verificationDetails: {
          verifiedBy: 'Dr. K. V. Sharma (Medical Officer)',
          verifiedDate: '2026-09-06T11:00:00.000Z',
          notes: 'Second trimester anomaly scan normal. Single intrauterine fetus in cephalic presentation. Regular follow-up on 02 Oct 2026.'
        },
        fileData: createSampleSvgDocument(
          'Antenatal Ultrasound Surveillance Scan',
          'Pregnancy Report (20 Weeks)',
          '2026-09-05',
          'Sita Devi (H001)',
          'DOCTOR_VERIFIED',
          'Normal gestational parameters. Amniotic fluid index adequate.'
        )
      };

      const sample2 = {
        id: 'DOC-1002',
        fileName: 'Hemoglobin_Blood_Test_Report.pdf',
        fileType: 'application/pdf',
        category: 'Blood Test',
        personId: 'P-SIT-101',
        personName: 'Sita Devi',
        householdId: 'H001',
        encounterId: 'ENC-001',
        uploadDate: '2026-09-05T11:15:00.000Z',
        uploadedBy: 'ASHA001 - Sita Rao',
        verificationStatus: 'DOCTOR_VERIFIED',
        verificationDetails: {
          verifiedBy: 'Dr. K. V. Sharma (Medical Officer)',
          verifiedDate: '2026-09-06T11:10:00.000Z',
          notes: 'Hemoglobin 11.4 g/dL satisfactory. Advised daily iron folic acid compliance.'
        },
        fileData: createSampleSvgDocument(
          'Complete Blood Count & Hemoglobin Profile',
          'Blood Test Report',
          '2026-09-05',
          'Sita Devi (H001)',
          'DOCTOR_VERIFIED',
          'RBC parameters within normal physiological limits for 2nd trimester.'
        )
      };

      const sample3 = {
        id: 'DOC-1003',
        fileName: 'Urine_Routine_Microscopy.pdf',
        fileType: 'application/pdf',
        category: 'Urine Test',
        personId: 'P-SIT-101',
        personName: 'Sita Devi',
        householdId: 'H001',
        encounterId: 'ENC-002',
        uploadDate: '2026-09-18T09:45:00.000Z',
        uploadedBy: 'ASHA001 - Sita Rao',
        verificationStatus: 'PENDING_VERIFICATION',
        verificationDetails: null,
        fileData: createSampleSvgDocument(
          'Urine Analysis & Albumin Screening',
          'Urine Test Report',
          '2026-09-18',
          'Sita Devi (H001)',
          'PENDING_VERIFICATION',
          'Routine ANC urine screening. Albumin absent, sugar nil.'
        )
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify([sample1, sample2, sample3]));
    }
  }

  getAllDocuments() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error fetching documents', e);
      return [];
    }
  }

  getDocumentsForPerson(personId, householdId) {
    const all = this.getAllDocuments();
    return all.filter(doc => {
      if (personId && doc.personId === personId) return true;
      if (householdId && doc.householdId === householdId) return true;
      return false;
    });
  }

  getDocumentById(docId) {
    const all = this.getAllDocuments();
    return all.find(d => d.id === docId) || null;
  }

  saveDocument({
    fileName,
    fileType = 'application/pdf',
    category = 'General Medical Document',
    personId = 'P-SIT-101',
    personName = 'Sita Devi',
    householdId = 'H001',
    encounterId = '',
    uploadedBy = 'ASHA Worker',
    fileData = null,
    verificationStatus = 'PENDING_VERIFICATION',
    verificationDetails = null
  }) {
    const all = this.getAllDocuments();
    const newDoc = {
      id: `DOC-${Date.now().toString().slice(-6)}`,
      fileName: fileName || `Report_${Date.now().toString().slice(-4)}.pdf`,
      fileType: fileType,
      category: category,
      personId: personId,
      personName: personName,
      householdId: householdId,
      encounterId: encounterId,
      uploadDate: new Date().toISOString(),
      uploadedBy: uploadedBy,
      verificationStatus: verificationStatus,
      verificationDetails: verificationDetails,
      fileData: fileData || createSampleSvgDocument(
        fileName,
        category,
        new Date().toISOString().split('T')[0],
        personName,
        verificationStatus,
        'Uploaded by community health worker for clinical review.'
      )
    };

    all.unshift(newDoc);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    return newDoc;
  }

  verifyDocument(docId, { verifiedBy, status = 'DOCTOR_VERIFIED', notes = '' }) {
    const all = this.getAllDocuments();
    const doc = all.find(d => d.id === docId);
    if (!doc) return { success: false, message: 'Document not found' };

    doc.verificationStatus = status;
    doc.verificationDetails = {
      verifiedBy: verifiedBy || 'Doctor / Clinical Verifier',
      verifiedDate: new Date().toISOString(),
      notes: notes || 'Clinical findings reviewed and approved.'
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    return { success: true, doc };
  }

  deleteDocument(docId) {
    let all = this.getAllDocuments();
    const target = all.find(d => d.id === docId);
    all = all.filter(d => d.id !== docId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    return { success: true, deletedDoc: target };
  }

  downloadDocument(docId) {
    const doc = this.getDocumentById(docId);
    if (!doc || !doc.fileData) return false;

    const link = document.createElement('a');
    link.href = doc.fileData;
    link.download = doc.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  }
}

export const documentStore = new DocumentStoreManager();
