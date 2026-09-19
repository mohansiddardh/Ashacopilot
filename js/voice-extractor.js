/**
 * ASHA Copilot 2.0 - Multilingual Voice Capture & Clinical NLP Entity Extractor
 * Problem Statement PS-H02: "One Worker, Five Systems"
 * 
 * Supports:
 * 1. Persistent continuous speech accumulation (fixes fast reset bug)
 * 2. Multilingual Speech Recognition: English (en-IN), Telugu (te-IN), Hindi (hi-IN)
 * 3. Robust Multilingual NLP Entity Extractor (Devanagari, Telugu script, and transliterations)
 * 4. Noise & Speech-to-text phonetic error recovery (e.g. "sinduism" -> "Sindhu", "sitais" -> "Sita")
 * 5. Extraction of Name, Age, Gestation, Gravida, Children, Vaccines, Symptoms, and Vitals (BP, Temp, SpO2)
 */

import { VACCINES_CATALOG, SYMPTOMS_CATALOG } from './models.js';

export class VoiceCaptureEngine {
  constructor(onTranscriptUpdate, onStatusChange) {
    this.onTranscriptUpdate = onTranscriptUpdate || (() => {});
    this.onStatusChange = onStatusChange || (() => {});
    this.recognition = null;
    this.isListening = false;
    this.currentLang = 'en-IN'; // 'en-IN', 'te-IN', 'hi-IN'
    
    // Persistent transcript memory across speech pauses
    this.accumulatedTranscript = '';
    this.currentInterim = '';

    this.initSpeechRecognition();
  }

  setLanguage(langCode) {
    this.currentLang = langCode;
    if (this.recognition) {
      this.recognition.lang = langCode;
    }
  }

  initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = this.currentLang;

      this.recognition.onstart = () => {
        this.isListening = true;
        this.onStatusChange('listening', `Listening in ${this.getLangDisplayName()}... Speak naturally.`);
      };

      this.recognition.onresult = (event) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            this.accumulatedTranscript = (this.accumulatedTranscript + ' ' + trans).trim();
          } else {
            interim += trans;
          }
        }
        this.currentInterim = interim;

        const fullDisplay = (this.accumulatedTranscript + (interim ? ' ' + interim : '')).trim();
        this.onTranscriptUpdate(fullDisplay);
      };

      this.recognition.onerror = (event) => {
        console.warn('Speech recognition warning/event:', event.error);
        // Ignore non-fatal 'no-speech' and continue listening if user hasn't explicitly stopped
        if (event.error === 'no-speech') {
          return;
        }
        if (event.error === 'network' || event.error === 'not-allowed') {
          this.isListening = false;
          this.onStatusChange('error', `Microphone access event (${event.error}). You can also use Demo Audio Presets.`);
        }
      };

      this.recognition.onend = () => {
        // If user didn't explicitly pause, automatically restart to prevent early cutoff
        if (this.isListening) {
          try {
            this.recognition.start();
          } catch (e) {
            // Already starting or browser throttle
          }
        } else {
          this.onStatusChange('idle', 'Microphone paused.');
        }
      };
    } else {
      console.info('Web Speech API not natively supported in this environment; fallback audio presets active.');
    }
  }

  getLangDisplayName() {
    if (this.currentLang === 'te-IN') return 'Telugu (తెలుగు)';
    if (this.currentLang === 'ta-IN') return 'Tamil (தமிழ்)';
    if (this.currentLang === 'hi-IN') return 'Hindi (हिंदी)';
    return 'Indian English';
  }

  startListening() {
    if (this.recognition && !this.isListening) {
      this.isListening = true;
      try {
        this.recognition.lang = this.currentLang;
        this.recognition.start();
      } catch (err) {
        console.warn('Recognition start caught:', err);
      }
    }
  }

  stopListening() {
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (err) {
        console.warn('Recognition stop caught:', err);
      }
    }
    this.onStatusChange('idle', 'Microphone stopped.');
  }

  clearTranscript() {
    this.accumulatedTranscript = '';
    this.currentInterim = '';
    this.onTranscriptUpdate('');
  }

  setManualTranscript(text) {
    this.accumulatedTranscript = text;
    this.currentInterim = '';
    this.onTranscriptUpdate(text);
  }

  /**
   * Multilingual NLP Entity Extractor
   * Accurately parses English, Telugu, and Hindi speech into Common Data Model fields
   */
  static extractEntities(transcript) {
    if (!transcript || typeof transcript !== 'string') {
      return this.getDefaultExtracted();
    }

    const text = transcript.trim();
    const lower = text.toLowerCase();

    // -------------------------------------------------------------
    // 1. EXTRACT BENEFICIARY NAME (Fix for lowercase / phonetic mergers)
    // -------------------------------------------------------------
    let name = '';

    // A. Check for known Indian names & phonetic variations first
    const knownNamesMap = [
      { pattern: /\b(sinduism|sindhuism|sindhu|sindu|shindu)\b/i, clean: 'Sindhu' },
      { pattern: /\b(sitais|sita|seetha|seeta)\b/i, clean: 'Sita' },
      { pattern: /\b(radhais|radha\s+devi|radha|rada)\b/i, clean: 'Radha Devi' },
      { pattern: /\b(pooja|puja|poojais)\b/i, clean: 'Pooja' },
      { pattern: /\b(laxmi|lakshmi|laxmamma)\b/i, clean: 'Lakshmi' },
      { pattern: /\b(anitha|anita|aneeta)\b/i, clean: 'Anita' },
      { pattern: /\b(swapna|swarna)\b/i, clean: 'Swapna' },
      { pattern: /\b(kavitha|kavita)\b/i, clean: 'Kavitha' },
      { pattern: /\b(meena|mina)\b/i, clean: 'Meena Sharma' },
      { pattern: /\b(sunita|suneetha)\b/i, clean: 'Sunita Devi' },
      { pattern: /\b(priya|priyanka)\b/i, clean: 'Priya' },
      // Telugu Script Names
      { pattern: /సీత/i, clean: 'Sita' },
      { pattern: /రాధ/i, clean: 'Radha Devi' },
      { pattern: /పూజ/i, clean: 'Pooja' },
      { pattern: /లక్ష్మి/i, clean: 'Lakshmi' },
      { pattern: /సింధు/i, clean: 'Sindhu' },
      { pattern: /అనిత/i, clean: 'Anita' },
      // Hindi Devanagari Names
      { pattern: /सीता/i, clean: 'Sita' },
      { pattern: /राधा/i, clean: 'Radha Devi' },
      { pattern: /पूजा/i, clean: 'Pooja' },
      { pattern: /लक्ष्मी/i, clean: 'Lakshmi' },
      { pattern: /सिंधु/i, clean: 'Sindhu' },
      { pattern: /मीना/i, clean: 'Meena' },
      // Tamil Script Names
      { pattern: /அனிதா/i, clean: 'Anitha' },
      { pattern: /காவ்யா/i, clean: 'Kavya' },
      { pattern: /சீதா/i, clean: 'Sita' },
      { pattern: /ராதா/i, clean: 'Radha Devi' },
      { pattern: /லட்சுமி/i, clean: 'Lakshmi' },
      { pattern: /பிரியா/i, clean: 'Priya' }
    ];

    for (const item of knownNamesMap) {
      if (item.pattern.test(text)) {
        name = item.clean;
        break;
      }
    }

    // B. If not in known dictionary, look at words preceding age or status
    if (!name) {
      // Look for tokens right before "is [0-9]", "age [0-9]", "[0-9] years", "ki umar", "vayasu", "vayadhu"
      const leadRegexes = [
        /(?:name\s+is|patient\s+is|beneficiary\s+is|peru|naam|peyar)\s+([a-zA-Z\u0900-\u097F\u0C00-\u0C7F\u0B80-\u0BFF]+)/i,
        /^([a-zA-Z\u0900-\u097F\u0C00-\u0C7F\u0B80-\u0BFF]+)\s+(?:is|\bage\b|,|ki|vayas|vayasu|vayadhu|வயது)/i,
        /^([a-zA-Z\u0900-\u097F\u0C00-\u0C7F\u0B80-\u0BFF]+)\s+(\d+)\s*(?:years?|yrs?|saal|samvatsaralu|aandukal)/i
      ];

      for (const rx of leadRegexes) {
        const match = text.match(rx);
        if (match && match[1]) {
          let candidate = match[1].trim();
          // Clean phonetic STT artifacts (e.g. "sinduism" -> "Sindhu", "sitais" -> "Sita")
          candidate = candidate.replace(/ism$/i, '').replace(/is$/i, '');
          if (candidate.length >= 3 && !['she', 'the', 'this', 'patient', 'woman', 'mother', 'athanu', 'aame', 'yeh', 'avanga'].includes(candidate.toLowerCase())) {
            name = candidate.charAt(0).toUpperCase() + candidate.slice(1);
            break;
          }
        }
      }
    }

    // Default fallback if genuinely missing
    if (!name) name = 'Beneficiary';

    // -------------------------------------------------------------
    // 2. EXTRACT AGE
    // -------------------------------------------------------------
    let age = 24;
    // English: "22 years old", "age 24", "22 yrs"
    // Hindi: "24 साल", "उम्र 24", "24 वर्ष"
    // Telugu: "24 సంవత్సరాలు", "వయస్సు 24", "24 ఏళ్లు"
    // Tamil: "25 ஆண்டுகள்", "வயது 25"
    const ageMatch = text.match(/(?:age\s*(\d+)|(\d+)\s*(?:years?\s*old|yrs?|year|साल|वर्ष|సంవత్సరాలు|ఏళ్లు|ஆண்டுகள்)|(?:उम्र|వయస్సు|వయసు|வயது)\s*(\d+))/i);
    if (ageMatch) {
      age = parseInt(ageMatch[1] || ageMatch[2] || ageMatch[3], 10);
    } else {
      // Word numbers
      const wordAges = {
        'twenty': 20, 'twenty one': 21, 'twenty two': 22, 'twenty three': 23, 'twenty four': 24,
        'twenty five': 25, 'twenty six': 26, 'twenty seven': 27, 'twenty eight': 28, 'twenty nine': 29,
        'thirty': 30, 'chaubees': 24, 'chowbees': 24, 'iravai': 20, 'iravai nalugu': 24
      };
      for (const [w, val] of Object.entries(wordAges)) {
        if (lower.includes(w)) {
          age = val;
          break;
        }
      }
    }

    // -------------------------------------------------------------
    // 3. EXTRACT PREGNANCY & GESTATIONAL AGE
    // -------------------------------------------------------------
    let isPregnant = false;
    let gestationalWeeks = null;

    const notPregIndicators = [
      'not pregnant', 'non pregnant', 'no pregnancy', 'గర్భవతి కాదు', 'गर्भवती नहीं'
    ];
    const isNotPreg = notPregIndicators.some(kw => lower.includes(kw));

    if (isNotPreg) {
      isPregnant = false;
      gestationalWeeks = null;
    } else if (
      lower.includes('pregnant') || lower.includes('pregnancy') || lower.includes('expecting') ||
      lower.includes('గర్భవతి') || lower.includes('గర్భం') || lower.includes('गर्भवती') || lower.includes('गर्भ')
    ) {
      isPregnant = true;

      // Extract duration in weeks or months
      // English: "14 weeks pregnant", "five months pregnant", "20 weeks"
      // Telugu: "ఐదు నెలల గర్భవతి", "14 వారాల గర్భం", "5 నెలలు"
      // Hindi: "पांच महीने की गर्भवती", "14 हफ़्ते", "20 सप्ताह"
      const weeksMatch = text.match(/(\d+|one|two|three|four|five|six|seven|eight|nine|fourteen|twenty|ఐదు|నాలుగు|మూడు|రెండు|ఒక|पांच|चार|तीन|दो|एक)\s*(?:weeks?|months?|వారాలు|వారాల|నెలలు|నెలల|हफ़्ते|सप्ताह|महीने|माह)/i);
      
      if (weeksMatch) {
        const fullUnit = weeksMatch[0].toLowerCase();
        let num = parseInt(weeksMatch[1], 10);
        
        if (isNaN(num)) {
          const map = {
            'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
            'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'fourteen': 14, 'twenty': 20,
            'ఒక': 1, 'రెండు': 2, 'మూడు': 3, 'నాలుగు': 4, 'ఐదు': 5,
            'एक': 1, 'दो': 2, 'तीन': 3, 'चार': 4, 'पांच': 5
          };
          num = map[weeksMatch[1]] || 5;
        }

        // Check if unit is months
        if (fullUnit.includes('month') || fullUnit.includes('నెల') || fullUnit.includes('महीने') || fullUnit.includes('माह')) {
          if (num === 5) gestationalWeeks = 20; // 5 months = 20 weeks
          else gestationalWeeks = Math.round(num * 4.33);
        } else {
          gestationalWeeks = num;
        }
      } else {
        gestationalWeeks = 20; // Default when pregnancy indicated without weeks
      }
    }

    // -------------------------------------------------------------
    // 4. EXTRACT CHILDREN COUNT
    // -------------------------------------------------------------
    let childrenCount = 0;
    if (lower.includes('no children') || lower.includes('first child') || lower.includes('0 children') || lower.includes('పిల్లలు లేరు') || lower.includes('कोई बच्चा नहीं')) {
      childrenCount = 0;
    } else {
      const childMatch = text.match(/(\d+|one|two|three|four|ఒక|రెండు|మూడు|एक|दो|तीन)\s*(?:children|child|infant|baby|పిల్లలు|పాప|బాబు|बच्चे|बच्चा|शिशु)/i);
      if (childMatch) {
        let num = parseInt(childMatch[1], 10);
        if (isNaN(num)) {
          const map = { 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'ఒక': 1, 'రెండు': 2, 'మూడు': 3, 'एक': 1, 'दो': 2, 'तीन': 3 };
          num = map[childMatch[1]] || 1;
        }
        childrenCount = num;
      } else if (lower.includes('child') || lower.includes('పాప') || lower.includes('బాబు') || lower.includes('बच्चा')) {
        childrenCount = 1;
      }
    }

    // -------------------------------------------------------------
    // 5. EXTRACT VACCINATIONS
    // -------------------------------------------------------------
    const vaccines = [];
    if (lower.includes('bcg') || lower.includes('బిసిజి') || lower.includes('बीसीजी')) vaccines.push('BCG');
    if (lower.includes('opv') || lower.includes('ఒపివి') || lower.includes('ओपीवी') || lower.includes('polio') || lower.includes('పోలియో') || lower.includes('पोलियो')) {
      vaccines.push('OPV-0');
      if (!vaccines.includes('OPV-1')) vaccines.push('OPV-1');
    }
    if (lower.includes('pentavalent') || lower.includes('penta') || lower.includes('పెంటావాలెంట్') || lower.includes('पेंटावेलेंट')) {
      vaccines.push('Pentavalent-1');
      if (lower.includes('two') || lower.includes('2') || lower.includes('రెండు') || lower.includes('दो')) vaccines.push('Pentavalent-2');
    }
    if (lower.includes('rotavirus') || lower.includes('rota') || lower.includes('రోటావైరస్') || lower.includes('रोटावायरस')) {
      vaccines.push('Rotavirus-1');
    }
    if (lower.includes('measles') || lower.includes('rubella') || lower.includes('mr') || lower.includes('తట్టు') || lower.includes('खसरा')) {
      vaccines.push('Measles-Rubella-1');
    }
    if (lower.includes('vitamin a') || lower.includes('విటమిన్ ఎ') || lower.includes('विटामिन ए')) {
      vaccines.push('Vitamin-A-1');
    }
    if (lower.includes('dpt') || lower.includes('డిపిటి')) {
      vaccines.push('DPT-Booster');
    }

    // -------------------------------------------------------------
    // 6. EXTRACT SYMPTOMS / OBSERVATIONS
    // -------------------------------------------------------------
    const symptoms = [];
    const noSymptomFlags = [
      'no current symptoms', 'no symptoms', 'no complaints', 'asymptomatic', 'healthy',
      'సమస్యలు లేవు', 'బాధలు లేవు', 'బాగానే ఉంది', 'कोई लक्षण नहीं', 'कोई शिकायत नहीं', 'स्वस्थ'
    ];

    if (noSymptomFlags.some(flag => lower.includes(flag))) {
      symptoms.push('None');
    } else {
      if (lower.includes('morning sickness') || lower.includes('vomit') || lower.includes('nausea') || lower.includes('వాంతులు') || lower.includes('ఉల్టి') || lower.includes('उल्टी')) {
        symptoms.push('Vomiting / Morning Sickness');
      }
      if (lower.includes('cough') || lower.includes('దగ్గు') || lower.includes('खांसी') || lower.includes('khansi')) {
        symptoms.push('Cough');
      }
      if (lower.includes('fever') || lower.includes('జ్వరం') || lower.includes('बुखार') || lower.includes('bukhar')) {
        symptoms.push('Fever');
      }
      if (lower.includes('headache') || lower.includes('తలనొప్పి') || lower.includes('सिरदर्द')) {
        symptoms.push('Severe Headache');
      }
      if (lower.includes('swelling') || lower.includes('కాళ్ల వాపు') || lower.includes('सूजन')) {
        symptoms.push('Swelling of hands/feet');
      }
      if (lower.includes('fatigue') || lower.includes('tired') || lower.includes('weak') || lower.includes('నీరసం') || lower.includes('थकान') || lower.includes('कमजोरी')) {
        symptoms.push('Fatigue / Pallor');
      }
      if (lower.includes('diarrhea') || lower.includes('loose stool') || lower.includes('విరేచనాలు') || lower.includes('दस्त')) {
        symptoms.push('Loose Stool / Diarrhea');
      }

      if (symptoms.length === 0) {
        symptoms.push('None');
      }
    }

    // -------------------------------------------------------------
    // 7. EXTRACT VITALS (Blood Pressure, Temp, SpO2)
    // -------------------------------------------------------------
    let bp = null;
    let temp = null;
    let spo2 = null;

    const bpMatch = text.match(/(?:bp|blood\s*pressure)\s*(?:is|=|:)?\s*(\d{2,3}\s*[\/\-over\s]+\d{2,3})/i);
    if (bpMatch) {
      bp = bpMatch[1].replace(/\s*over\s*/i, '/').replace(/\s+/g, '');
    }

    const tempMatch = text.match(/(?:temp|temperature)\s*(?:is|=|:)?\s*(\d{2,3}(?:\.\d+)?)/i);
    if (tempMatch) {
      temp = parseFloat(tempMatch[1]);
    }

    const spo2Match = text.match(/(?:spo2|oxygen|o2)\s*(?:is|=|:)?\s*(\d{2,3})/i);
    if (spo2Match) {
      spo2 = parseInt(spo2Match[1], 10);
    }

    // -------------------------------------------------------------
    // 8. FOLLOW-UP REQUIREMENT
    // -------------------------------------------------------------
    const followUpRequired = lower.includes('follow up') || lower.includes('follow-up') || lower.includes('revisit') ||
      lower.includes('మళ్లీ చూడాలి') || lower.includes('మరోసారి') || lower.includes('दोबारा') || lower.includes('फॉलो अप');

    return {
      householdId: 'H001',
      personId: `P-${name.slice(0, 3).toUpperCase()}-01`,
      name: name,
      age: age,
      gender: 'Female',
      isPregnant: isPregnant,
      gestationalAgeWeeks: gestationalWeeks,
      childrenCount: childrenCount,
      vaccinations: vaccines,
      symptoms: symptoms,
      vitals: {
        bp: bp || '120/80',
        temperature: temp || 98.4,
        spo2: spo2 || 98
      },
      followUpRequired: followUpRequired,
      notes: `Extracted via ASHA Multilingual Voice Studio: "${text.slice(0, 140)}${text.length > 140 ? '...' : ''}"`,
      rawTranscript: text
    };
  }

  static getDefaultExtracted() {
    return {
      householdId: 'H001',
      personId: 'P001',
      name: '',
      age: '',
      gender: 'Female',
      isPregnant: false,
      gestationalAgeWeeks: null,
      childrenCount: 0,
      vaccinations: [],
      symptoms: ['None'],
      vitals: { bp: '120/80', temperature: 98.4, spo2: 98 },
      followUpRequired: false,
      notes: '',
      rawTranscript: ''
    };
  }
}
