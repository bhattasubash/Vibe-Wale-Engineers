import { create } from 'zustand';

export interface DocumentItem {
  id: string;
  name: string;
  url: string;
  type: 'Prescription' | 'Lab Report' | 'Discharge Summary' | 'Other';
  date?: string;
  facility?: string;
  ocrSnippet?: string;
}

export interface ExtractedMedication {
  drugName: string;
  dosage: string;
  frequency: string; // e.g., '1-0-1 (BD)'
  anupana: string; // e.g., 'Warm Water / Koshna Jala'
  duration?: string;
  source: 'Ayurvedic Formulations' | 'Allopathic Medication';
}

export interface ExtractedLabFinding {
  testName: string;
  value: string;
  unit: string;
  referenceRange: string;
  flag: 'NORMAL' | 'ELEVATED' | 'LOW';
  verifiedStatus: 'verified' | 'unclear' | 'mismatch';
}

export interface PulseHistoryItem {
  date: string;
  bpm: number;
  source: string;
  rhythm?: string;
  notes?: string;
  facility?: string;
}

export interface DoctorQueuePatient {
  sessionId: string;
  patientName: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  phone: string;
  abhaId: string;
  tokenNumber: string;
  chiefComplaint: string;
  complaintCategory: string;
  dominantPrakriti: string;
  secondaryPrakriti?: string | null;
  vataScore: number;
  pittaScore: number;
  kaphaScore: number;
  redFlagTriggered: boolean;
  priority: 'critical' | 'high' | 'normal';
  assignedDoctor: string;
  roomNumber: string;
  createdAt: string;
  socrates: {
    site?: string;
    onset?: string;
    severity?: string;
    timing?: string;
    familyHistory?: string;
  };
  documents?: DocumentItem[];
  extractedMedications?: ExtractedMedication[];
  extractedLabFindings?: ExtractedLabFinding[];
  ocrText?: string;
  extractedDrugs?: string[];
  status: 'awaiting_review' | 'accepted' | 'amended' | 'rejected';
  doctorNotes?: string;
  treatmentMode?: 'ayurveda' | 'allopathy';
  generalVitals?: {
    bp_systolic?: number;
    bp_diastolic?: number;
    blood_glucose?: number;
    diabetes_status?: string;
    known_allergies?: string[];
    past_surgeries?: string;
  };
  pulseHistory?: PulseHistoryItem[];
}

interface PhysicianState {
  isAuthenticated: boolean;
  authToken: string | null;
  doctorId: string;
  doctorName: string;
  department: string;
  roomNumber: string;
  queue: DoctorQueuePatient[];
  activePatient: DoctorQueuePatient | null;
  filterPriority: 'all' | 'critical' | 'normal';
  searchQuery: string;

  // Actions
  loginDoctor: (doctorId: string, doctorName: string, room: string, token?: string) => void;
  logoutDoctor: () => void;
  setActivePatient: (sessionId: string) => void;
  setFilterPriority: (priority: 'all' | 'critical' | 'normal') => void;
  setSearchQuery: (query: string) => void;
  reviewSession: (sessionId: string, status: 'accepted' | 'amended' | 'rejected', notes?: string) => void;
  addPatientToQueue: (patient: DoctorQueuePatient) => void;
}

const INITIAL_MOCK_QUEUE: DoctorQueuePatient[] = [
  {
    sessionId: 'SES-CRIT-01',
    tokenNumber: 'AIIA-EMG-01',
    patientName: 'Suresh Chander',
    age: 64,
    gender: 'male',
    phone: '7689441234',
    abhaId: '7689-4412-3401',
    chiefComplaint: 'सीने में तेज दर्द और पसीना आ रहा है',
    complaintCategory: 'general',
    dominantPrakriti: 'General',
    vataScore: 0,
    pittaScore: 0,
    kaphaScore: 0,
    redFlagTriggered: true,
    priority: 'critical',
    assignedDoctor: 'डॉ. अनन्या शर्मा (Dr. Ananya Sharma)',
    roomNumber: 'Room #104 (Block A)',
    createdAt: '2026-09-10T04:13:00.733151+00:00',
    socrates: {
      site: 'Chest / Precordium',
      onset: '1 hour acute',
      severity: '9/10',
      timing: 'Sudden onset with diaphoresis',
      familyHistory: 'CAD positive',
    },
    status: 'awaiting_review',
    treatmentMode: 'ayurveda',
  },
  {
    sessionId: 'SES-CRIT-02',
    tokenNumber: 'AIIA-EMG-01',
    patientName: 'Suresh Chander',
    age: 64,
    gender: 'male',
    phone: '7689441234',
    abhaId: '7689-4412-3401',
    chiefComplaint: 'सीने में तेज दर्द और पसीना आ रहा है',
    complaintCategory: 'general',
    dominantPrakriti: 'General',
    vataScore: 0,
    pittaScore: 0,
    kaphaScore: 0,
    redFlagTriggered: true,
    priority: 'critical',
    assignedDoctor: 'डॉ. अनन्या शर्मा (Dr. Ananya Sharma)',
    roomNumber: 'Room #104 (Block A)',
    createdAt: '2026-09-10T04:20:06.993657+00:00',
    socrates: {
      site: 'Chest / Precordium',
      onset: '1 hour acute',
      severity: '9/10',
      timing: 'Sudden onset with diaphoresis',
      familyHistory: 'CAD positive',
    },
    status: 'awaiting_review',
    treatmentMode: 'ayurveda',
  },
  {
    sessionId: 'SES-CRIT-03',
    tokenNumber: 'AIIA-EMG-01',
    patientName: 'Suresh Chander',
    age: 64,
    gender: 'male',
    phone: '7689441234',
    abhaId: '7689-4412-3401',
    chiefComplaint: 'सीने में तेज दर्द और पसीना आ रहा है',
    complaintCategory: 'general',
    dominantPrakriti: 'General',
    vataScore: 0,
    pittaScore: 0,
    kaphaScore: 0,
    redFlagTriggered: true,
    priority: 'critical',
    assignedDoctor: 'डॉ. अनन्या शर्मा (Dr. Ananya Sharma)',
    roomNumber: 'Room #104 (Block A)',
    createdAt: '2026-09-10T04:23:40.413443+00:00',
    socrates: {
      site: 'Chest / Precordium',
      onset: '1 hour acute',
      severity: '9/10',
      timing: 'Sudden onset with diaphoresis',
      familyHistory: 'CAD positive',
    },
    status: 'awaiting_review',
    treatmentMode: 'ayurveda',
  },
  {
    sessionId: 'SES-CRIT-04',
    tokenNumber: 'AIIA-EMG-01',
    patientName: 'Suresh Chander',
    age: 64,
    gender: 'male',
    phone: '7689441234',
    abhaId: '7689-4412-3401',
    chiefComplaint: 'सीने में तेज दर्द और पसीना आ रहा है',
    complaintCategory: 'general',
    dominantPrakriti: 'General',
    vataScore: 0,
    pittaScore: 0,
    kaphaScore: 0,
    redFlagTriggered: true,
    priority: 'critical',
    assignedDoctor: 'डॉ. अनन्या शर्मा (Dr. Ananya Sharma)',
    roomNumber: 'Room #104 (Block A)',
    createdAt: '2026-09-10T04:26:35.540924+00:00',
    socrates: {
      site: 'Chest / Precordium',
      onset: '1 hour acute',
      severity: '9/10',
      timing: 'Sudden onset with diaphoresis',
      familyHistory: 'CAD positive',
    },
    status: 'awaiting_review',
    treatmentMode: 'ayurveda',
  },
  {
    sessionId: 'SES-AIIA-108',
    tokenNumber: 'AIIA-108',
    patientName: 'Raghunath Varma',
    age: 58,
    gender: 'male',
    phone: '9876543210',
    abhaId: '9876-543210',
    chiefComplaint: 'दोनों घुटनों में दर्द एवं सूजन से सर्वाधिक समस्या',
    complaintCategory: 'joint_pain',
    dominantPrakriti: 'Vata',
    vataScore: 80,
    pittaScore: 20,
    kaphaScore: 0,
    redFlagTriggered: false,
    priority: 'normal',
    assignedDoctor: 'डॉ. अनन्या शर्मा (Dr. Ananya Sharma)',
    roomNumber: 'Room #104 (Block A)',
    createdAt: '2026-09-10T04:15:00+00:00',
    socrates: {
      site: 'Both Knees joints (Janu Sandhi)',
      onset: '4 months, progressive',
      severity: '8/10',
      timing: 'Aggravated in morning and cold',
      familyHistory: 'No family history of arthritis',
    },
    status: 'awaiting_review',
    treatmentMode: 'ayurveda',
    pulseHistory: [
      { date: '15 Oct 2025', bpm: 72, source: 'AIIA OPD Record #8421', rhythm: 'Regular (सम गति)', notes: 'Resting pulse normal, balanced vata-pitta', facility: 'AIIA OPD Block B' },
      { date: '28 Nov 2025', bpm: 84, source: 'Civil Hospital Knee Clinic', rhythm: 'Slight Elevation (तीव्र)', notes: 'Mild sinus tachycardia during joint flare', facility: 'Civil Hospital Ayodhya' },
      { date: '14 Jan 2026', bpm: 78, source: 'Ayush Wellness Center', rhythm: 'Regular (सम)', notes: 'Post-Maharasnadi Kwath review', facility: 'Ayush AYUSH Dispensary' },
      { date: '02 Feb 2026', bpm: 92, source: 'Emergency Triage Note', rhythm: 'Elevated (वात प्रकोप)', notes: 'Cold weather arthritis exacerbation', facility: 'District Hospital Triage' },
      { date: '22 Feb 2026', bpm: 74, source: 'Cardiology OPD Vitals', rhythm: 'Regular Sinus (स्थिर)', notes: 'Vitals stable, normal ECG rhythm', facility: 'AIIA Cardiology OPD' },
      { date: '10 Sep 2026', bpm: 76, source: 'Current MediKiosk Intake', rhythm: 'Normal (प्राकृत नाड़ी)', notes: 'Current baseline vitals check', facility: 'MediKiosk Terminal 01' },
    ],
    documents: [
      {
        id: 'DOC-108-1',
        name: 'विटल्स एवं नाड़ी परीक्षा पर्चा (Vital Signs & Nadi Pariksha)',
        url: '',
        type: 'Prescription',
        date: '22 Feb 2026',
        facility: 'AIIA Medical Records, New Delhi',
        ocrSnippet: 'Vitals: Pulse 74 bpm regular, BP 126/80 mmHg, SpO2 98%. Patient reports knee pain.',
      },
      {
        id: 'DOC-108-2',
        name: 'पैथोलॉजी एवं बायोमार्कर रिपोर्ट (Biomarker & Lab Panel)',
        url: '',
        type: 'Lab Report',
        date: '14 Jan 2026',
        facility: 'AIIA Clinical Pathology Laboratory',
        ocrSnippet: 'Serum Uric Acid: 7.2 mg/dL (Elevated), ESR: 28 mm/hr, Pulse Rate: 78 bpm.',
      },
      {
        id: 'DOC-108-3',
        name: 'पूर्व ऑर्थोपेडिक परामर्श पर्ची (Past Joint Consultation)',
        url: '',
        type: 'Prescription',
        date: '15 Oct 2025',
        facility: 'Civil Hospital Ayodhya',
        ocrSnippet: 'Bilateral knee crepitus, OA Grade II. Pulse: 72 bpm, regular.',
      },
    ],
    extractedLabFindings: [
      { testName: 'Pulse Rate (नाड़ी गति)', value: '76', unit: 'bpm', referenceRange: '60 - 100', flag: 'NORMAL', verifiedStatus: 'verified' },
      { testName: 'Blood Pressure (रक्तचाप)', value: '128/82', unit: 'mmHg', referenceRange: '120/80', flag: 'NORMAL', verifiedStatus: 'verified' },
      { testName: 'Serum Uric Acid (यूरिक एसिड)', value: '7.2', unit: 'mg/dL', referenceRange: '3.5 - 7.0', flag: 'ELEVATED', verifiedStatus: 'verified' },
      { testName: 'Erythrocyte Sedimentation Rate (ESR)', value: '28', unit: 'mm/hr', referenceRange: '0 - 20', flag: 'ELEVATED', verifiedStatus: 'verified' },
    ],
  },
  {
    sessionId: 'SES-PULSE-01',
    tokenNumber: 'AIIA-PULSE-01',
    patientName: 'Anil Kumar Sharma (अनिल कुमार शर्मा)',
    age: 52,
    gender: 'male',
    phone: '9845123980',
    abhaId: '9845-1239-8012',
    chiefComplaint: 'धड़कन तेज होना एवं घुटनों में दर्द (Palpitations, Knee Pain & Fatigue)',
    complaintCategory: 'general',
    dominantPrakriti: 'Pitta-Vata',
    vataScore: 45,
    pittaScore: 50,
    kaphaScore: 5,
    redFlagTriggered: false,
    priority: 'normal',
    assignedDoctor: 'डॉ. अनन्या शर्मा (Dr. Ananya Sharma)',
    roomNumber: 'Room #104 (Block A)',
    createdAt: '2026-09-10T04:30:00+00:00',
    socrates: {
      site: 'Precordium / Knees',
      onset: '3 months, episodic palpitations',
      severity: '6/10',
      timing: 'More pronounced in evening & stress',
      familyHistory: 'Hypertension in father',
    },
    status: 'awaiting_review',
    treatmentMode: 'ayurveda',
    pulseHistory: [
      { date: '12 Aug 2025', bpm: 74, source: 'Routine Health Checkup', rhythm: 'Regular Sinus', notes: 'Normal resting vitals', facility: 'Primary Health Center' },
      { date: '15 Oct 2025', bpm: 86, source: 'Post-Viral Follow-up', rhythm: 'Slight Tachycardia', notes: 'Mild sinus tachycardia after viral fever', facility: 'District Hospital Ayodhya' },
      { date: '04 Dec 2025', bpm: 104, source: 'Hypertension Clinic', rhythm: 'Elevated (तीव्र पित्त नाड़ी)', notes: 'Stress induced sinus tachycardia', facility: 'Civil Hospital' },
      { date: '18 Jan 2026', bpm: 92, source: 'Cardiology Review', rhythm: 'Borderline High', notes: 'Initiated Ayurvedic Sarpagandha & Arjuna', facility: 'AIIA Kayachikitsa' },
      { date: '14 Feb 2026', bpm: 80, source: 'OPD Follow-up', rhythm: 'Normalized (सम)', notes: 'Significant symptomatic improvement', facility: 'AIIA OPD' },
      { date: '10 Sep 2026', bpm: 75, source: 'Current MediKiosk Intake', rhythm: 'Normal Sinus (स्थिर नाड़ी)', notes: 'Stable sinus rhythm on present intake', facility: 'MediKiosk Terminal 01' },
    ],
    documents: [
      {
        id: 'DOC-PULSE-1',
        name: 'हृदय एवं नाड़ी दर परीक्षण रिपोर्ट (Cardiac & Pulse Vitals Record)',
        url: '',
        type: 'Prescription',
        date: '14 Feb 2026',
        facility: 'AIIA Kayachikitsa Cardiology OPD',
        ocrSnippet: 'Pulse Rate: 80 bpm regular, BP: 130/84 mmHg. Arjuna Kshirapaka 50ml BD.',
      },
      {
        id: 'DOC-PULSE-2',
        name: 'ईसीजी एवं बायोकेमिकल रिपोर्ट (ECG & Pathology Report)',
        url: '',
        type: 'Lab Report',
        date: '04 Dec 2025',
        facility: 'District Hospital Pathology',
        ocrSnippet: 'Sinus Tachycardia, HR: 104 bpm. Normal axis, no ST elevation.',
      },
    ],
    extractedLabFindings: [
      { testName: 'Pulse Rate (हृदय/नाड़ी गति)', value: '75', unit: 'bpm', referenceRange: '60 - 100', flag: 'NORMAL', verifiedStatus: 'verified' },
      { testName: 'Blood Pressure (रक्तचाप)', value: '124/80', unit: 'mmHg', referenceRange: '120/80', flag: 'NORMAL', verifiedStatus: 'verified' },
      { testName: 'Fasting Blood Sugar', value: '94', unit: 'mg/dL', referenceRange: '70 - 100', flag: 'NORMAL', verifiedStatus: 'verified' },
    ],
  },
];

const loadPersistedQueue = (): DoctorQueuePatient[] => {
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('ayush_doctor_queue');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const cleaned = parsed.filter((p) => p && p.sessionId && !p.sessionId.startsWith('SES-892'));
          // Ensure every patient has pulseHistory populated from mock if missing
          return cleaned.map((p) => {
            const defaultMatch = INITIAL_MOCK_QUEUE.find((m) => m.sessionId === p.sessionId);
            if (!p.pulseHistory || p.pulseHistory.length === 0) {
              return {
                ...p,
                pulseHistory: defaultMatch?.pulseHistory || INITIAL_MOCK_QUEUE.find((m) => m.sessionId === 'SES-AIIA-108')?.pulseHistory,
                documents: p.documents?.length ? p.documents : defaultMatch?.documents,
                extractedLabFindings: p.extractedLabFindings?.length ? p.extractedLabFindings : defaultMatch?.extractedLabFindings,
              };
            }
            return p;
          });
        }
      }
    }
  } catch (err) {
    console.warn('Could not parse persisted queue from localStorage:', err);
  }
  return INITIAL_MOCK_QUEUE;
};

const savePersistedQueue = (queue: DoctorQueuePatient[]) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ayush_doctor_queue', JSON.stringify(queue));
    }
  } catch (err) {
    console.warn('Could not save queue to localStorage:', err);
  }
};

export const usePhysicianStore = create<PhysicianState>((set, get) => {
  const initialQueue = loadPersistedQueue();

  return {
    isAuthenticated: true,
    authToken: null,
    doctorId: 'DOC-AIIA-104',
    doctorName: 'डॉ. अनन्या शर्मा (Dr. Ananya Sharma)',
    department: 'कायचिकित्सा विभाग (Internal Medicine)',
    roomNumber: 'Room #104 (Block A)',
    queue: initialQueue,
    activePatient: initialQueue[0] || null,
    filterPriority: 'all',
    searchQuery: '',

    loginDoctor: (doctorId, doctorName, room, token) =>
      set({
        isAuthenticated: true,
        authToken: token || null,
        doctorId,
        doctorName,
        roomNumber: room,
      }),

    logoutDoctor: () => set({ isAuthenticated: false, authToken: null }),

    setActivePatient: (sessionId) => {
      const patient = get().queue.find((p) => p.sessionId === sessionId) || null;
      set({ activePatient: patient });
    },

    setFilterPriority: (priority) => set({ filterPriority: priority }),

    setSearchQuery: (query) => set({ searchQuery: query }),

    reviewSession: (sessionId, status, notes) =>
      set((state) => {
        const updatedQueue = state.queue.map((p) =>
          p.sessionId === sessionId ? { ...p, status, doctorNotes: notes } : p
        );
        savePersistedQueue(updatedQueue);
        return {
          queue: updatedQueue,
          activePatient:
            state.activePatient?.sessionId === sessionId
              ? { ...state.activePatient, status, doctorNotes: notes }
              : state.activePatient,
        };
      }),

    addPatientToQueue: (newPatient) =>
      set((state) => {
        const filtered = state.queue.filter((p) => p.sessionId !== newPatient.sessionId);
        const updatedQueue = [newPatient, ...filtered];
        savePersistedQueue(updatedQueue);
        return {
          queue: updatedQueue,
          activePatient: newPatient,
        };
      }),
  };
});
