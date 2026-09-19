/**
 * ASHA Copilot 2.0+ - Multilingual Translation Engine
 * Kalachakra 2K26 Healthcare & Biotech PS-H02
 * 
 * Supported Languages:
 * - English (en)
 * - Telugu (te - తెలుగు)
 * - Tamil (ta - தமிழ்)
 * - Hindi (hi - हिंदी)
 * 
 * Safety Principle:
 * Numerical values, blood pressure, dates, vitals, measurements, names, and IDs
 * are strictly preserved without corruptive translation.
 */

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
  { code: 'hi', name: 'Hindi', native: 'हिंदी', flag: '🇮🇳' }
];

export const TRANSLATIONS = {
  en: {
    // Navigation Tabs
    'tab.dashboard': 'Dashboard',
    'tab.capture': 'Encounter Capture',
    'tab.output': 'Generated Schemas',
    'tab.diagnostic': 'Diagnostic Reports',
    'tab.timeline': 'Household Timeline',
    'tab.impact': 'Before vs After Impact',
    'tab.architecture': 'System Architecture',
    'tab.audit': 'Audit & Security',

    // Header & Badges
    'app.tagline': 'One Worker, Five Systems',
    'app.subtitle': 'Capture Once. Generate Every Record.',
    'app.demo_banner': 'DEMO ONLY — SYNTHETIC HEALTH DATA',
    'app.demo_sub': 'No real patient health information is collected or processed. Not for clinical diagnosis.',
    'app.role': 'Role:',
    'app.quick_demo': 'Quick Demo (Sita)',
    'app.user': 'ASHA User:',

    // Capture Modes
    'mode.voice': 'Voice Studio (ASHA Bol)',
    'mode.form': 'Standard Form Entry',
    'mode.live': 'Live Realtime Autosave',
    'mode.extract': 'Extract & Structure Information',
    'mode.clear': 'Clear',
    'mode.listening': 'Listening...',
    'mode.mic_paused': 'Microphone Paused',

    // Form Labels
    'field.household_id': 'Household Profile ID',
    'field.beneficiary_name': 'Beneficiary Name',
    'field.age': 'Age (Years)',
    'field.gender': 'Gender',
    'field.phone': 'Contact Phone (Synthetic)',
    'field.pregnancy_status': 'Pregnancy Status',
    'field.gestation': 'Gestational Age (Weeks)',
    'field.children_count': 'Children Count (<5 yrs)',
    'field.vaccines': 'Child Vaccinations',
    'field.symptoms': 'Reported Symptoms',
    'field.bp': 'Blood Pressure (BP)',
    'field.temp': 'Temperature (°F)',
    'field.spo2': 'SpO2 (%)',
    'field.heart_rate': 'Heart Rate (bpm)',
    'field.height': 'Height (cm)',
    'field.weight': 'Weight (kg)',
    'field.bmi': 'BMI',
    'field.followup': 'Follow-up Revisit Mandated?',
    'field.notes': 'Field Notes / Observations',
    'field.verbal_consent': 'Beneficiary verbal consent verified',

    // Buttons
    'btn.save_records': 'Save & Generate 3 Programme Records',
    'btn.verify_finalize': 'Verify & Finalize Documentation',
    'btn.delete_profile': 'Delete Profile Registration',
    'btn.delete_visit': 'Delete Visit',
    'btn.inspect_registers': 'Inspect 3 Registers →',
    'btn.view_file': 'View',
    'btn.download_file': 'Download',
    'btn.verify_doc': 'Verify Report',
    'btn.add_record': '+ ADD TO HEALTH PROFILE',
    'btn.new_checkup': '+ NEW CHECK-UP',
    'btn.upload_file': '+ UPLOAD FILE',

    // Follow-up & Verification Statuses
    'status.up_to_date': 'Up to date',
    'status.upcoming': 'Upcoming',
    'status.due_soon': 'Due Soon',
    'status.overdue': 'Follow-up Overdue',
    'status.pending_verification': 'Pending Verification',
    'status.doctor_verified': 'Doctor Verified',
    'status.reported': 'Reported — Awaiting Verification',
    'status.rejected': 'Rejected',

    // Warnings & Disclaimers
    'warning.overdue_title': 'FOLLOW-UP OVERDUE',
    'warning.overdue_desc': 'No recent follow-up has been recorded for this person. Please verify whether the scheduled check-up has been completed. This is a documentation tracking reminder, not a medical diagnosis.',
    'warning.recent_report_needed': 'NEW FOLLOW-UP INFORMATION MAY BE REQUIRED: Please verify whether the person has completed the required follow-up check-up.'
  },

  te: {
    // Navigation Tabs
    'tab.dashboard': 'డాష్‌బోర్డ్ (Dashboard)',
    'tab.capture': 'ఎన్‌కౌంటర్ రికార్డింగ్ (Capture)',
    'tab.output': 'రూపొందించిన రికార్డులు (Registers)',
    'tab.diagnostic': 'డయాగ్నస్టిక్ నివేదికలు (Diagnostic Reports)',
    'tab.timeline': 'కుటుంబ కాలక్రమం (Timeline)',
    'tab.impact': 'సమయ ఆదా & ప్రభావం (Impact)',
    'tab.architecture': 'సిస్టమ్ ఆర్కిటెక్చర్ (Architecture)',
    'tab.audit': 'ఆడిట్ & భద్రత (Audit)',

    // Header & Badges
    'app.tagline': 'ఒక్క కార్యకర్త, ఐదు వ్యవస్థలు',
    'app.subtitle': 'ఒక్కసారి నమోదు చేయండి. అన్ని రికార్డులు రూపొందించండి.',
    'app.demo_banner': 'డెమో మాత్రమే — కృత్రిమ ఆరోగ్య డేటా (SYNTHETIC DATA)',
    'app.demo_sub': 'ఏ నిజమైన రోగి ఆరోగ్య సమాచారం సేకరించబడదు లేదా ప్రాసెస్ చేయబడదు. రోగ నిర్ధారణ కోసం కాదు.',
    'app.role': 'పాత్ర (Role):',
    'app.quick_demo': 'త్వరిత డెమో (సీత)',
    'app.user': 'ఆశా కార్యకర్త:',

    // Capture Modes
    'mode.voice': 'వాయిస్ స్టూడియో (ఆశా బోల్)',
    'mode.form': 'స్టాండర్డ్ ఫారమ్ ఎంట్రీ',
    'mode.live': 'లైవ్ రియల్-టైమ్ ఆటోసేవ్',
    'mode.extract': 'సమాచారాన్ని సంగ్రహించండి (Extract)',
    'mode.clear': 'ఖాళీ చేయండి',
    'mode.listening': 'వినబడుతోంది...',
    'mode.mic_paused': 'మైక్రోఫోన్ నిలిపివేయబడింది',

    // Form Labels
    'field.household_id': 'కుటుంబ ప్రొఫైల్ ID (Household ID)',
    'field.beneficiary_name': 'లబ్ధిదారుని పేరు (Beneficiary Name)',
    'field.age': 'వయస్సు (సంవత్సరాలు)',
    'field.gender': 'లింగం (Gender)',
    'field.phone': 'సంప్రదింపు నంబర్ (Synthetic Phone)',
    'field.pregnancy_status': 'గర్భధారణ స్థితి (Pregnancy Status)',
    'field.gestation': 'గర్భధారణ కాలం (వారాలు)',
    'field.children_count': 'పిల్లల సంఖ్య (<5 సం॥)',
    'field.vaccines': 'పిల్లల టీకాలు (Vaccinations)',
    'field.symptoms': 'లక్షణాలు / సమస్యలు (Symptoms)',
    'field.bp': 'రక్తపోటు (BP)',
    'field.temp': 'ఉష్ణోగ్రత (°F)',
    'field.spo2': 'ఆక్సిజన్ శాతం (SpO2 %)',
    'field.heart_rate': 'గుండె స్పందన (bpm)',
    'field.height': 'ఎత్తు (సెం.మీ)',
    'field.weight': 'బరువు (కిలోలు)',
    'field.bmi': 'శరీర ద్రవ్యరాశి సూచిక (BMI)',
    'field.followup': 'ఫాలో-అప్ అవసరమా?',
    'field.notes': 'ఫీల్డ్ గమనికలు (Notes)',
    'field.verbal_consent': 'లబ్ధిదారుని మౌఖిక సమ్మతి నిర్ధారించబడింది',

    // Buttons
    'btn.save_records': 'సేవ్ చేయండి & 3 రికార్డులను సృష్టించండి',
    'btn.verify_finalize': 'ధృవీకరించి ఖరారు చేయండి',
    'btn.delete_profile': 'ప్రొఫైల్ నమోదు తొలగించు',
    'btn.delete_visit': 'సందర్శనను తొలగించు',
    'btn.inspect_registers': '3 రిజిస్టర్లను పరిశీలించండి →',
    'btn.view_file': 'వీక్షించండి (View)',
    'btn.download_file': 'డౌన్‌లోడ్ (Download)',
    'btn.verify_doc': 'రిపోర్ట్‌ను ధృవీకరించండి',
    'btn.add_record': '+ ప్రొఫైల్‌కు జోడించండి',
    'btn.new_checkup': '+ కొత్త పరీక్ష (New Check-up)',
    'btn.upload_file': '+ ఫైల్ అప్‌లోడ్ చేయండి',

    // Follow-up & Verification Statuses
    'status.up_to_date': 'సరిగ్గా ఉంది (Up to date)',
    'status.upcoming': 'రాబోయేది (Upcoming)',
    'status.due_soon': 'త్వరలో గడువు (Due Soon)',
    'status.overdue': 'ఫాలో-అప్ గడువు ముగిసింది (Overdue)',
    'status.pending_verification': 'ధృవీకరణ పెండింగ్‌లో ఉంది',
    'status.doctor_verified': 'వైద్యులు ధృవీకరించారు (Doctor Verified)',
    'status.reported': 'నివేదించబడింది — పరిశీలనలో ఉంది',
    'status.rejected': 'తిరస్కరించబడింది',

    // Warnings & Disclaimers
    'warning.overdue_title': 'ఫాలో-అప్ గడువు ముగిసింది (FOLLOW-UP OVERDUE)',
    'warning.overdue_desc': 'ఈ వ్యక్తికి ఇటీవలి ఫాలో-అప్ రికార్డు నమోదు కాలేదు. దయచేసి షెడ్యూల్ చేసిన తనిఖీ పూర్తయిందో లేదో ధృవీకరించండి. ఇది డాక్యుమెంటేషన్ హెచ్చరిక మాత్రమే, వైద్య నిర్ధారణ కాదు.',
    'warning.recent_report_needed': 'కొత్త ఫాలో-అప్ సమాచారం అవసరం కావచ్చు: లబ్ధిదారుడు నిర్దేశిత తనిఖీని పూర్తి చేశారో లేదో నిర్ధారించండి.'
  },

  ta: {
    // Navigation Tabs
    'tab.dashboard': 'டாஷ்போர்டு (Dashboard)',
    'tab.capture': 'பதிவு செய்தல் (Encounter Capture)',
    'tab.output': 'உருவாக்கப்பட்ட பதிவேடுகள் (Registers)',
    'tab.diagnostic': 'பரிசோதனை அறிக்கைகள் (Diagnostic Reports)',
    'tab.timeline': 'குடும்ப காலவரிசை (Timeline)',
    'tab.impact': 'தாக்கம் & நேர சேமிப்பு (Impact)',
    'tab.architecture': 'கட்டமைப்பு (Architecture)',
    'tab.audit': 'தணிக்கை & பாதுகாப்பு (Audit)',

    // Header & Badges
    'app.tagline': 'ஒரு களப்பணியாளர், ஐந்து அமைப்புகள்',
    'app.subtitle': 'ஒரு முறை பதிவு செய்யுங்கள். அனைத்து பதிவேடுகளையும் பெறுங்கள்.',
    'app.demo_banner': 'மாதிரி மட்டுமே — செயற்கை சுகாதாரத் தரவு (SYNTHETIC DATA)',
    'app.demo_sub': 'உண்மையான நோயாளியின் சுகாதாரத் தகவல்கள் எதுவும் சேகரிக்கப்படவில்லை அல்லது செயலாக்கப்படவில்லை.',
    'app.role': 'பணிப் பொறுப்பு (Role):',
    'app.quick_demo': 'விரைவு மாதிரி (சீதா)',
    'app.user': 'ஆஷா பணியாளர்:',

    // Capture Modes
    'mode.voice': 'குரல் பதிவு (Voice Studio)',
    'mode.form': 'படிவ உள்ளீடு (Form Entry)',
    'mode.live': 'நேரலை சேமிப்பு (Live Autosave)',
    'mode.extract': 'தகவலைப் பிரித்தெடு (Extract)',
    'mode.clear': 'அழி',
    'mode.listening': 'கேட்கிறது...',
    'mode.mic_paused': 'மைக் இடைநிறுத்தப்பட்டது',

    // Form Labels
    'field.household_id': 'குடும்ப சுயவிவர எண் (Household ID)',
    'field.beneficiary_name': 'பயனாளியின் பெயர் (Name)',
    'field.age': 'வயது (ஆண்டுகள்)',
    'field.gender': 'பாலினம் (Gender)',
    'field.phone': 'தொடர்பு எண் (Synthetic Phone)',
    'field.pregnancy_status': 'கர்ப்ப நிலை (Pregnancy Status)',
    'field.gestation': 'கர்ப்ப காலம் (வாரங்கள்)',
    'field.children_count': 'குழந்தைகள் எண்ணிக்கை (<5 வயது)',
    'field.vaccines': 'தடுப்பூசிகள் (Vaccinations)',
    'field.symptoms': 'அறிகுறிகள் (Symptoms)',
    'field.bp': 'இரத்த அழுத்தம் (BP)',
    'field.temp': 'உடல் வெப்பநிலை (°F)',
    'field.spo2': 'ஆக்ஸிஜன் அளவு (SpO2 %)',
    'field.heart_rate': 'இதய துடிப்பு (bpm)',
    'field.height': 'உயரம் (செ.மீ)',
    'field.weight': 'எடை (கிலோ)',
    'field.bmi': 'உடல் நிறை குறியீடு (BMI)',
    'field.followup': 'மறுபரிசோதனை தேவையா?',
    'field.notes': 'களக் குறிப்புகள் (Notes)',
    'field.verbal_consent': 'பயனாளியின் வாய்மொழி ஒப்புதல் பெறப்பட்டது',

    // Buttons
    'btn.save_records': 'சேமித்து 3 பதிவேடுகளை உருவாக்கு',
    'btn.verify_finalize': 'சரிபார்த்து உறுதி செய்',
    'btn.delete_profile': 'சுயவிவரப் பதிவை நீக்கு',
    'btn.delete_visit': 'சந்திப்பை நீக்கு',
    'btn.inspect_registers': '3 பதிவேடுகளைப் பார் →',
    'btn.view_file': 'பார்வையிடு (View)',
    'btn.download_file': 'பதிவிறக்கு (Download)',
    'btn.verify_doc': 'அறிக்கையைச் சரிபார்',
    'btn.add_record': '+ சுயவிவரத்தில் சேர்',
    'btn.new_checkup': '+ புதிய பரிசோதனை (New Check-up)',
    'btn.upload_file': '+ கோப்பைப் பதிவேற்று',

    // Follow-up & Verification Statuses
    'status.up_to_date': 'சரியாக உள்ளது (Up to date)',
    'status.upcoming': 'வரவிருப்பது (Upcoming)',
    'status.due_soon': 'விரைவில் (Due Soon)',
    'status.overdue': 'காலக்கெடு முடிந்தது (Overdue)',
    'status.pending_verification': 'சரிபார்ப்பு நிலுவையில் உள்ளது',
    'status.doctor_verified': 'மருத்துவர் சரிபார்த்தார் (Doctor Verified)',
    'status.reported': 'பதிவு செய்யப்பட்டது — மதிப்பாய்வில்',
    'status.rejected': 'நிராகரிக்கப்பட்டது',

    // Warnings & Disclaimers
    'warning.overdue_title': 'மறுபரிசோதனை காலக்கெடு முடிந்தது (FOLLOW-UP OVERDUE)',
    'warning.overdue_desc': 'இந்த நபருக்கு சமீபத்திய மறுபரிசோதனை பதிவு செய்யப்படவில்லை. திட்டமிடப்பட்ட பரிசோதனை முடிந்துவிட்டதா என்பதை சரிபார்க்கவும். இது ஆவண நினைவூட்டல் மட்டுமே, மருத்துவ நோயறிதல் அல்ல.',
    'warning.recent_report_needed': 'புதிய மறுபரிசோதனை தகவல் தேவைப்படலாம்: பயனாளி தேவையான பரிசோதனையை முடித்துள்ளாரா என்பதை சரிபார்க்கவும்.'
  },

  hi: {
    // Navigation Tabs
    'tab.dashboard': 'डैशबोर्ड (Dashboard)',
    'tab.capture': 'दौरा प्रविष्टि (Encounter Capture)',
    'tab.output': 'जनरेटेड रजिस्टर (Registers)',
    'tab.diagnostic': 'डायग्नोस्टिक रिपोर्ट (Diagnostic Reports)',
    'tab.timeline': 'परिवार समयरेखा (Timeline)',
    'tab.impact': 'समय बचत एवं प्रभाव (Impact)',
    'tab.architecture': 'सिस्टम वास्तुकला (Architecture)',
    'tab.audit': 'ऑडिट एवं सुरक्षा (Audit)',

    // Header & Badges
    'app.tagline': 'एक कार्यकर्ता, पांच प्रणालियां',
    'app.subtitle': 'एक बार दर्ज करें। प्रत्येक रजिस्टर तैयार करें।',
    'app.demo_banner': 'केवल डेमो — सिंथेटिक स्वास्थ्य डेटा (SYNTHETIC DATA)',
    'app.demo_sub': 'किसी भी वास्तविक मरीज का स्वास्थ्य डेटा एकत्र या संसाधित नहीं किया जाता है। चिकित्सीय निदान के लिए नहीं।',
    'app.role': 'भूमिका (Role):',
    'app.quick_demo': 'त्वरित डेमो (सीता)',
    'app.user': 'आशा कार्यकर्ता:',

    // Capture Modes
    'mode.voice': 'आवाज स्टूडियो (आशा बोल)',
    'mode.form': 'मानक फॉर्म प्रविष्टि',
    'mode.live': 'लाइव रियल-टाइम ऑटोसेव',
    'mode.extract': 'जानकारी निकालें (Extract)',
    'mode.clear': 'साफ करें',
    'mode.listening': 'सुन रहे हैं...',
    'mode.mic_paused': 'माइक रोका गया',

    // Form Labels
    'field.household_id': 'परिवार प्रोफाइल आईडी (Household ID)',
    'field.beneficiary_name': 'लाभार्थी का नाम (Beneficiary Name)',
    'field.age': 'आयु (वर्ष)',
    'field.gender': 'लिंग (Gender)',
    'field.phone': 'संपर्क फोन (Synthetic Phone)',
    'field.pregnancy_status': 'गर्भावस्था की स्थिति',
    'field.gestation': 'गर्भकालीन आयु (सप्ताह)',
    'field.children_count': 'बच्चों की संख्या (<5 वर्ष)',
    'field.vaccines': 'बाल टीकाकरण (Vaccinations)',
    'field.symptoms': 'लक्षण / समस्याएं (Symptoms)',
    'field.bp': 'रक्तचाप (BP)',
    'field.temp': 'तापमान (°F)',
    'field.spo2': 'ऑक्सीजन संतृप्ति (SpO2 %)',
    'field.heart_rate': 'हृदय गति (bpm)',
    'field.height': 'ऊंचाई (सेमी)',
    'field.weight': 'वजन (किलो)',
    'field.bmi': 'बॉडी मास इंडेक्स (BMI)',
    'field.followup': 'फॉलो-अप आवश्यक है?',
    'field.notes': 'फील्ड नोट्स / अवलोकन',
    'field.verbal_consent': 'लाभार्थी की मौखिक सहमति सत्यापित की गई',

    // Buttons
    'btn.save_records': 'सुरक्षित करें और 3 रजिस्टर जनरेट करें',
    'btn.verify_finalize': 'सत्यापित और अंतिम रूप दें',
    'btn.delete_profile': 'प्रोफाइल पंजीकरण हटाएं',
    'btn.delete_visit': 'दौरा रिकॉर्ड हटाएं',
    'btn.inspect_registers': '3 रजिस्टरों का निरीक्षण करें →',
    'btn.view_file': 'देखें (View)',
    'btn.download_file': 'डाउनलोड करें (Download)',
    'btn.verify_doc': 'रिपोर्ट सत्यापित करें',
    'btn.add_record': '+ प्रोफाइल में जोड़ें',
    'btn.new_checkup': '+ नई जांच (New Check-up)',
    'btn.upload_file': '+ फाइल अपलोड करें',

    // Follow-up & Verification Statuses
    'status.up_to_date': 'अद्यतन है (Up to date)',
    'status.upcoming': 'आगामी (Upcoming)',
    'status.due_soon': 'शीघ्र देय (Due Soon)',
    'status.overdue': 'फॉलो-अप बकाया (Overdue)',
    'status.pending_verification': 'सत्यापन लंबित है',
    'status.doctor_verified': 'डॉक्टर द्वारा सत्यापित (Doctor Verified)',
    'status.reported': 'सूचित — समीक्षाधीन',
    'status.rejected': 'अस्वीकृत',

    // Warnings & Disclaimers
    'warning.overdue_title': 'फॉलो-अप बकाया (FOLLOW-UP OVERDUE)',
    'warning.overdue_desc': 'इस व्यक्ति के लिए हाल ही में कोई फॉलो-अप दर्ज नहीं किया गया है। कृपया जांचें कि निर्धारित जांच पूरी हो गई है या नहीं। यह केवल प्रलेखन अनुस्मारक है, कोई चिकित्सा निदान नहीं।',
    'warning.recent_report_needed': 'नई फॉलो-अप जानकारी आवश्यक हो सकती है: कृपया जांचें कि लाभार्थी ने आवश्यक जांच पूरी की है या नहीं।'
  }
};

class TranslationEngine {
  constructor() {
    const saved = localStorage.getItem('asha_app_language');
    this.currentLang = saved && TRANSLATIONS[saved] ? saved : 'en';
  }

  getLanguage() {
    return this.currentLang;
  }

  setLanguage(langCode) {
    if (TRANSLATIONS[langCode]) {
      this.currentLang = langCode;
      localStorage.setItem('asha_app_language', langCode);
      return true;
    }
    return false;
  }

  t(key, fallback = '') {
    const dict = TRANSLATIONS[this.currentLang] || TRANSLATIONS.en;
    if (dict[key]) return dict[key];
    if (TRANSLATIONS.en[key]) return TRANSLATIONS.en[key];
    return fallback || key;
  }

  /**
   * Translates free-text clinical summaries across languages while strictly
   * preserving:
   * - Blood Pressure (e.g. 120/80, 118/76)
   * - Temperatures (e.g. 98.4°F)
   * - SpO2 percentages (e.g. 98%)
   * - Numerical dates and IDs (e.g. H001, 18 Sep 2026, 24 yrs)
   * - Vaccine and Antigen names
   */
  translateClinicalText(text, targetLang = this.currentLang) {
    if (!text || typeof text !== 'string') return '';
    if (targetLang === 'en') return text;

    let translated = text;

    if (targetLang === 'te') {
      translated = translated
        .replace(/Blood Pressure\s*(is|:)?/gi, 'రక్తపోటు:')
        .replace(/Normal recovery/gi, 'సాధారణ కోలుకోవడం')
        .replace(/Pregnant/gi, 'గర్భవతి')
        .replace(/Not pregnant/gi, 'గర్భవతి కాదు')
        .replace(/Morning sickness/gi, 'ఉదయం వికారం')
        .replace(/Cough/gi, 'దగ్గు')
        .replace(/Fever/gi, 'జ్వరం')
        .replace(/Routine ANC/gi, 'సాధారణ ప్రసవపూర్వ తనిఖీ')
        .replace(/Follow-up required/gi, 'ఫాలో-అప్ అవసరం')
        .replace(/Doctor Verified/gi, 'వైద్యులు ధృవీకరించారు');
    } else if (targetLang === 'ta') {
      translated = translated
        .replace(/Blood Pressure\s*(is|:)?/gi, 'இரத்த அழுத்தம்:')
        .replace(/Normal recovery/gi, 'இயல்பான நலம்')
        .replace(/Pregnant/gi, 'கர்ப்பிணி')
        .replace(/Not pregnant/gi, 'கர்ப்பிணி அல்ல')
        .replace(/Morning sickness/gi, 'காலை மயக்கம்/வாந்தி')
        .replace(/Cough/gi, 'இருமல்')
        .replace(/Fever/gi, 'காய்ச்சல்')
        .replace(/Routine ANC/gi, 'வழக்கமான கர்ப்ப பரிசோதனை')
        .replace(/Follow-up required/gi, 'மறுபரிசோதனை தேவை')
        .replace(/Doctor Verified/gi, 'மருத்துவர் சரிபார்த்தார்');
    } else if (targetLang === 'hi') {
      translated = translated
        .replace(/Blood Pressure\s*(is|:)?/gi, 'रक्तचाप:')
        .replace(/Normal recovery/gi, 'सामान्य स्वास्थ्य लाभ')
        .replace(/Pregnant/gi, 'गर्भवती')
        .replace(/Not pregnant/gi, 'गर्भवती नहीं')
        .replace(/Morning sickness/gi, 'सुबह की उल्टी')
        .replace(/Cough/gi, 'खांसी')
        .replace(/Fever/gi, 'बुखार')
        .replace(/Routine ANC/gi, 'नियमित प्रसवपूर्व जांच')
        .replace(/Follow-up required/gi, 'फॉलो-अप आवश्यक')
        .replace(/Doctor Verified/gi, 'डॉक्टर द्वारा सत्यापित');
    }

    return translated;
  }
}

export const i18n = new TranslationEngine();
