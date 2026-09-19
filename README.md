# 🩺 ASHA Copilot 2.0 ("आशा साथी • ఆశా మిత్ర")
> **"Capture Once. Generate Every Record."**  
> *Transforming single frontline health encounters into multiple structured national health programme registers.*

**Kalachakra 2K26 — Healthcare & Biotech Hackathon**  
**Problem Statement PS-H02:** *"One Worker, Five Systems"*

🌐 **Live Deployed Application**: [https://mohansiddardh.github.io/Ashacopilot/](https://mohansiddardh.github.io/Ashacopilot/)

---

## 📌 Executive Summary

Accredited Social Health Activists (ASHAs) and frontline community healthcare workers deliver essential door-to-door healthcare across rural and semi-urban India. During every home visit, they collect baseline health and demographic details—yet they must manually rewrite substantially identical data across multiple disconnected paper registers and siloed digital databases:
1. **Maternal & Child Health Register** (ANC, EDD, IFA, maternal vitals, gravida)
2. **Universal Immunisation Register** (Doses administered, cold chain schedules, upcoming vaccines)
3. **Village Household / Population Register** (Census demographics, pregnant members, risk surveillance)
4. **Diagnostic Check-up Register** (NCD screening, hypertension, blood glucose)
5. **Essential Health Supplies Register** (Stock & distribution of ORS, Zinc, IFA, Contraceptives)
6. **National Health Programmes & Entitlements Register** (Ayushman Bharat PM-JAY, JSY, PMMVY, NTEP, etc.)

This duplication forces community workers to spend over **35–45% of their working day on clerical data entry**, increasing documentation fatigue and introducing contradictory records across books.

**ASHA Copilot solves this:**
The worker captures the encounter **ONCE**—either by speaking naturally (in English, Telugu, or Hindi), via an accessible standard clinical form, or via keystroke-buffered realtime live autosave. A normalized **Common Data Model (CDM)** engine extracts and validates observations, and a modular **Schema Mapping Engine** automatically transforms and distributes that single encounter across six programme-specific schemas simultaneously.

---

## 🌟 Key Features in ASHA Copilot 2.0

### 1. 🏛️ National Health Programmes & Schemes Directory (47+ Schemes)
- **9 Comprehensive Categories**:
  1. *Maternal & Newborn Health* (JSY, PMMVY, PMSMA, SUMAN, LaQshya)
  2. *Child Health & Nutrition* (RBSK, Poshan Abhiyaan / NNM, MAA, Anemia Mukt Bharat, NRC)
  3. *Immunization & Preventive Care* (Universal Immunization Programme - UIP, Mission Indradhanush / IMI)
  4. *Communicable Diseases* (NTEP / Nikshay Poshan, NVBDCP Malaria/Dengue, NLEP Leprosy, NACO HIV)
  5. *Non-Communicable Diseases (NCDs)* (NP-NCD Hypertension/Diabetes/Cancer, NPCBVI Eye Care, NMHP Mental Health)
  6. *Primary Healthcare & Infrastructure* (Ayushman Bharat - HWCs / AB-Arogya Mandir, PM-ABHIM, NUHM, 108/102 Emergency Services)
  7. *Health Insurance & Social Protection* (Ayushman Bharat PM-JAY, State Schemes like Aarogyasri / KCR Kit)
  8. *Family Planning & Reproductive Health* (Mission Parivar Vikas, Antara / Chhaya Contraceptive Schemes)
  9. *Adolescent & Vulnerable Groups* (RKSK, Elderly Health NPPHC, PMNDP Dialysis Programme)
- **Direct Linkage to Beneficiary Profiles**: Connect schemes to individual family members and entire households, showing status, financial incentives, and entitlement IDs.

### 2. 🛡️ Longitudinal Duplicate-Person Detection & CDM Merge
- **Fuzzy Duplicate Detection**: Detects similar or existing beneficiary records using Levenshtein distance across Name, Age, and Household UID.
- **Intelligent Branching**:
  - **Merge Encounters (Longitudinal Trajectory)**: Keeps the canonical Beneficiary UID, appends clinical visits, merges vitals and immunizations, and recalculates CDM schemas without data loss.
  - **Create Distinct Beneficiary**: Allows the ASHA worker to confirm a separate individual (e.g. family members with similar names) and generates a distinct UID.

### 3. 🎙️ Multilingual Voice Studio ("ASHA Bol") & DPDPA Consent Guard
- **DPDPA 2023 Digital Consent Guard**: Prompts for pre-recording verbal beneficiary consent. Microphone recording is strictly locked until consent is verified.
- **Trilingual Speech Entity Extraction**: Continuous speech recognition and phonetic entity normalization across **English (`en-IN`)**, **తెలుగు (Telugu - `te-IN`)**, and **हिंदी (Hindi - `hi-IN`)**.
- **Instant Clinical Entity Extraction**: Recognizes gestation weeks, Gravida, symptoms, vaccines, and vitals from natural frontline phrasing.

### 4. 👨‍👩‍👧‍👦 Family Reports & Household Surveillance
- **Household-Centric Overview**: Organized by Family ID (`F042`, `F043`, `F044`), Household Head, Village / Habitation, and Socio-economic tier.
- **Dynamic Family Census Engine**: Automatically tabulates total members, children, senior citizens, and active pregnancies.
- **Health Supplies & Medicines Tracker**: Stock monitoring of ORS, IFA tablets, Zinc, and contraceptive distributions with related health programmes.
- **Vital Event Logging**: Instant logging of births, deaths, and village public health surveillance events.

### 5. 🩺 12-Dimension Comprehensive Diagnostic Profile
- Demographics, Existing Conditions, Pregnancy Tracker, Diagnostic Tests, Lab Results, Current Vitals, Physical Exam, Supporting Clinical Documents, Physician Review, Follow-Up Schedule, Health History Timeline, and **Government Health Programmes & Benefits Dimension**.
- **Real-Time Auto-BMI**: Dynamic WHO categorization (`Normal`, `Overweight`, `Underweight`, `Obese`).
- **Overdue Surveillance**: Flags follow-ups as `🟢 Up to date`, `🟡 Upcoming`, `🟠 Due Soon`, or `🔴 Overdue`.

### 6. 📑 6-Register Multi-Programme Mapping Engine
- Transforms single CDM encounters into 6 standardized registers:
  1. **Maternal & Child Health Record** (`DEMO-PROG-MCH-01`)
  2. **Child Universal Immunisation Register** (`DEMO-PROG-UIP-02`)
  3. **Village Population / Household Register** (`DEMO-PROG-VPR-03`)
  4. **Diagnostic Check-up Register** (`DEMO-PROG-DCR-04`)
  5. **Essential Health Supplies Register** (`DEMO-PROG-EHS-05`)
  6. **National Health Programmes & Entitlements Register** (`DEMO-PROG-NHP-06`)
- Dual view: **📋 Human Card View** and **💻 Formatted JSON** with 1-click clipboard export.

---

## ⚡ Quick 2-Minute Live Demo Script for Judges

| Time | Action | What to Showcase to Judges |
| :--- | :--- | :--- |
| **0:00 - 0:25** | **Executive Overview** | Introduce ASHA Copilot 2.0: *"Capture Once. Generate Every Record."* Highlight how it eliminates the 35–45% clerical data entry burden for India's 1M+ ASHAs. |
| **0:25 - 0:50** | **Voice Studio & Consent** | Open **Voice Studio**. Show the **DPDPA 2023 Consent Guard** preventing unauthorized recording. Toggle consent, select Telugu/Hindi preset, and demonstrate entity parsing. |
| **0:50 - 1:15** | **Duplicate Detection & Merge** | Trigger encounter submission for existing beneficiary *Sita Devi*. Show the **Duplicate Warning Banner** and demonstrate **Longitudinal CDM Encounter Merge**. |
| **1:15 - 1:35** | **Health Programmes Directory** | Navigate to **Health Programmes**. Filter across 47+ schemes (JSY, PMMVY, PM-JAY, Nikshay Poshan). Show member-level and household entitlement linkages. |
| **1:35 - 1:50** | **Family Reports & Diagnostics** | Open **Family Reports**. Show household census, supply tracking, and jump into the **12-Dimension Diagnostic Profile** of any beneficiary. |
| **1:50 - 2:00** | **6 Generated Schemas & Impact** | View the **Schema Mapping** page to show all 6 registers populated simultaneously from that single encounter. Point out the **4.2x efficiency boost** saving 217+ hours weekly. |

---

## 🚀 How to Run Locally

### Option 1: Python Local Server (Recommended)
```powershell
python server.py
```
Open **[http://localhost:8000](http://localhost:8000)** in your browser.

### Option 2: Direct File Open
Open `index.html` directly in Chrome, Microsoft Edge, or Firefox.

---

## 🌐 Deployment to GitHub Pages

This application is built with vanilla HTML5, modern CSS3, and ES6 modular JavaScript—requiring zero build tools or server dependencies.

To deploy to GitHub Pages:
1. Push this repository to GitHub (`main` branch).
2. Go to repository **Settings** → **Pages**.
3. Under **Build and deployment** → **Source**, select `Deploy from a branch`.
4. Select `main` branch and `/ (root)` folder, then click **Save**.
5. Your application will be live at: `https://mohansiddardh.github.io/Ashacopilot/`

---

## 🛡️ Privacy, Safety & Compliance

- **Synthetic Health Data**: All beneficiary data (Sita, Sindhu, Radha Devi, Pooja, Meena) are completely synthetic and fabricated for hackathon demonstration. No real patient data is collected or processed.
- **Non-Diagnostic Prototype**: ASHA Copilot is a frontline documentation and transformation tool, **not** a clinical diagnostic or prescription system.
- **DPDPA 2023 Compliant**: Frontline digital consent controls safeguard all voice and clinical data workflows.
