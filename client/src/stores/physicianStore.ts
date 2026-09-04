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
    sessionId: 'SES-8921A',
    patientName: 'कमला देवी (Kamla Devi)',
    age: 68,
    gender: 'female',
    phone: '9811223344',
    abhaId: '91-8821-4432-1109',
    tokenNumber: '#AIIA-041',
    chiefComplaint: 'सीने में भारीपन, सांस लेने में तकलीफ व घबराहट (Chest Heaviness & Dyspnea)',
    complaintCategory: 'cardiovascular',
    dominantPrakriti: 'VATA-PITTA',
    secondaryPrakriti: 'Pitta',
    vataScore: 60,
    pittaScore: 30,
    kaphaScore: 10,
    redFlagTriggered: true,
    priority: 'critical',
    assignedDoctor: 'डॉ. अनन्या शर्मा (Dr. Ananya Sharma)',
    roomNumber: 'Room 104',
    createdAt: '10:15 AM',
    socrates: {
      site: 'हृदय प्रदेश / बायाँ हाथ (Chest radiating to left arm)',
      onset: '2 घंटे पूर्व (Acute 2-hours)',
      severity: '8 / 10 (Severe Pain)',
      timing: 'शारीरिक श्रम एवं मानसिक तनाव (Exertion / Stress)',
      familyHistory: 'माता को उच्च रक्तचाप एवं हृदय रोग (Hypertension)',
    },
    documents: [
      {
        id: 'DOC-01',
        name: 'कार्डियोलॉजी पर्चा (Cardiology OPD Slip)',
        url: './sample_reports/CamScanner 09-03-2026 01.07 (3)_page-0001.jpg',
        type: 'Prescription',
        date: '14-Aug-2026',
        facility: 'AIIMS New Delhi - Cardiology OPD',
        ocrSnippet: 'Rx: Tab Amlodipine 5mg OD, Syp Arjuna Kwath 20ml BD. BP: 154/96 mmHg. Sinus tachycardia.',
      },
      {
        id: 'DOC-02',
        name: 'ईसीजी जांच रिपोर्ट (ECG Strip Scan)',
        url: './sample_reports/CamScanner 09-03-2026 01.07 (1)_page-0001.jpg',
        type: 'Lab Report',
        date: '14-Aug-2026',
        facility: 'City Diagnostics Center',
        ocrSnippet: 'ECG: Sinus Tachycardia (HR 104 bpm), Mild ST elevation in Lead V2-V4. Urgent evaluation advised.',
      },
    ],
    extractedMedications: [
      {
        drugName: 'अर्जुनारिष्ट / अर्जुन क्वाथ (Arjuna Kwath)',
        dosage: '20 ml',
        frequency: '1-0-1 (सुबह-शाम भोजनोपरांत)',
        anupana: 'समान भाग गुनगुना जल (Equal Warm Water)',
        duration: '15 दिन',
        source: 'Ayurvedic Formulations',
      },
      {
        drugName: 'प्रभाकर वटी (Prabhakar Vati)',
        dosage: '1 वटी (250mg)',
        frequency: '1-0-1 (BD)',
        anupana: 'अर्जुन क्वाथ / जल',
        duration: '15 दिन',
        source: 'Ayurvedic Formulations',
      },
      {
        drugName: 'Tab. Amlodipine',
        dosage: '5 mg',
        frequency: '1-0-0 (Morning OD)',
        anupana: 'Water',
        duration: 'Ongoing',
        source: 'Allopathic Medication',
      },
    ],
    extractedLabFindings: [
      {
        testName: 'रक्तचाप (Blood Pressure)',
        value: '154/96',
        unit: 'mmHg',
        referenceRange: '120/80',
        flag: 'ELEVATED',
        verifiedStatus: 'verified',
      },
      {
        testName: 'हृदय गति (Heart Rate / Pulse)',
        value: '104',
        unit: 'bpm',
        referenceRange: '60-100',
        flag: 'ELEVATED',
        verifiedStatus: 'verified',
      },
      {
        testName: 'सीरम पोटेशियम (Serum Potassium)',
        value: '4.2',
        unit: 'mEq/L',
        referenceRange: '3.5-5.0',
        flag: 'NORMAL',
        verifiedStatus: 'verified',
      },
    ],
    ocrText: 'Prior ECG shows sinus tachycardia. Known hypertensive for 8 years.',
    extractedDrugs: ['Arjuna Kwath 20ml BD', 'Prabhakar Vati 1 BD', 'Amlodipine 5mg OD'],
    status: 'awaiting_review',
  },
  {
    sessionId: 'SES-8922B',
    patientName: 'रामेश्वर दयाल शर्मा (Rameshwar Sharma)',
    age: 62,
    gender: 'male',
    phone: '9876543210',
    abhaId: '91-4523-8901-2345',
    tokenNumber: '#AIIA-042',
    chiefComplaint: 'दोनों घुटनों में कट-कट की आवाज, सूजन व तेज दर्द (Sandhivata - OA Knee)',
    complaintCategory: 'musculoskeletal',
    dominantPrakriti: 'PITTA-KAPHA',
    secondaryPrakriti: 'Kapha',
    vataScore: 20,
    pittaScore: 53,
    kaphaScore: 27,
    redFlagTriggered: false,
    priority: 'normal',
    assignedDoctor: 'डॉ. अनन्या शर्मा (Dr. Ananya Sharma)',
    roomNumber: 'Room 104',
    createdAt: '10:22 AM',
    socrates: {
      site: 'दोनों जानु सन्धि (Bilateral Knees)',
      onset: '6 महीने से अधिक (Chronic 6+ Months)',
      severity: '7 / 10 (Moderate to Severe)',
      timing: 'प्रातःकाल सोकर उठने पर व शीत ऋतु में (Morning stiffness & Cold)',
      familyHistory: 'माता को संधिवात का इतिहास (Positive Maternal Arthritis)',
    },
    documents: [
      {
        id: 'DOC-03',
        name: 'आयुष ओपीडी पर्चा (Prior Ayurvedic Prescription)',
        url: './sample_reports/CamScanner 09-03-2026 01.07 (2)_page-0001.jpg',
        type: 'Prescription',
        date: '28-Jul-2026',
        facility: 'All India Institute of Ayurveda (AIIA)',
        ocrSnippet: 'Rx: Maharasnadi Kwath 20ml BD, Yogaraj Guggulu 2 Tab BD, Shallaki 1 Cap BD. Local Janu Basti.',
      },
      {
        id: 'DOC-04',
        name: 'बायोकेमिस्ट्री जांच रिपोर्ट (Serum Uric Acid & ESR)',
        url: './sample_reports/CamScanner 09-03-2026 01.07_page-0001.jpg',
        type: 'Lab Report',
        date: '02-Aug-2026',
        facility: 'Central Clinical Laboratory',
        ocrSnippet: 'Hemoglobin: 13.2 g/dL, Serum Uric Acid: 6.4 mg/dL, ESR: 28 mm/hr (Elevated). Joint space narrowing.',
      },
    ],
    extractedMedications: [
      {
        drugName: 'महारास्नादि क्वाथ (Maharasnadi Kwath)',
        dosage: '20 ml',
        frequency: '1-0-1 (भोजनोपरांत BD)',
        anupana: 'समान भाग कोष्ण जल (Warm Water)',
        duration: '1 माह',
        source: 'Ayurvedic Formulations',
      },
      {
        drugName: 'योगराज गुग्गुलु (Yogaraj Guggulu)',
        dosage: '2 वटी (500mg)',
        frequency: '1-0-1 (BD)',
        anupana: 'गुनगुना जल (Koshna Jala)',
        duration: '1 माह',
        source: 'Ayurvedic Formulations',
      },
      {
        drugName: 'शल्लाकी कैप्सूल (Shallaki Capsule)',
        dosage: '1 कैप्सूल (400mg)',
        frequency: '1-0-1 (BD)',
        anupana: 'दुग्ध / जल',
        duration: '1 माह',
        source: 'Ayurvedic Formulations',
      },
    ],
    extractedLabFindings: [
      {
        testName: 'हीमोग्लोबिन (Hemoglobin)',
        value: '13.2',
        unit: 'g/dL',
        referenceRange: '12.0 - 16.0',
        flag: 'NORMAL',
        verifiedStatus: 'verified',
      },
      {
        testName: 'सीरम यूरिक एसिड (Serum Uric Acid)',
        value: '6.4',
        unit: 'mg/dL',
        referenceRange: '3.5 - 7.2',
        flag: 'NORMAL',
        verifiedStatus: 'verified',
      },
      {
        testName: 'ईएसआर (ESR 1st Hour)',
        value: '28',
        unit: 'mm/hr',
        referenceRange: '0 - 20',
        flag: 'ELEVATED',
        verifiedStatus: 'verified',
      },
    ],
    ocrText: 'Rx: Maharasnadi Kwath 20ml BD, Yogaraj Guggulu 2 Tab BD. Diagnosed: Sandhivata (OA Knee).',
    extractedDrugs: ['Maharasnadi Kwath 20ml BD', 'Yogaraj Guggulu 2 Tab BD', 'Shallaki Capsule 1 BD'],
    status: 'awaiting_review',
  },
  {
    sessionId: 'SES-8923C',
    patientName: 'सुरेश चंद्र जोशी (Suresh Joshi)',
    age: 54,
    gender: 'male',
    phone: '9711884422',
    abhaId: '91-2234-9988-5541',
    tokenNumber: '#AIIA-043',
    chiefComplaint: 'अम्लपित्त, पेट में खट्टी डकार व सीने के निचले भाग में जलन (Amlapitta & Hyperacidity)',
    complaintCategory: 'digestive',
    dominantPrakriti: 'PITTA',
    secondaryPrakriti: null,
    vataScore: 13,
    pittaScore: 74,
    kaphaScore: 13,
    redFlagTriggered: false,
    priority: 'normal',
    assignedDoctor: 'डॉ. अनन्या शर्मा (Dr. Ananya Sharma)',
    roomNumber: 'Room 104',
    createdAt: '10:28 AM',
    socrates: {
      site: 'अधिजठर प्रदेश (Epigastrium & Retro-sternal)',
      onset: '3 महीने से (Subacute 3 Months)',
      severity: '6 / 10 (Moderate Burning)',
      timing: 'भोजनोपरांत एवं खाली पेट (Post-Meal & Empty Stomach)',
      familyHistory: 'कोई विशेष पारिवारिक इतिहास नहीं (Negative)',
    },
    documents: [
      {
        id: 'DOC-05',
        name: 'अपर जीआई एंडोस्कोपी (Upper GI Endoscopy)',
        url: './sample_reports/CamScanner 09-03-2026 01.07 (3)_page-0001.jpg',
        type: 'Lab Report',
        date: '10-Jul-2026',
        facility: 'Gastroenterology Diagnostic Wing',
        ocrSnippet: 'Impression: Mild Antral Gastritis with Bile Reflux. Rapid Urease Test: Negative.',
      },
    ],
    extractedMedications: [
      {
        drugName: 'अविपत्तिकर चूर्ण (Avipattikar Churna)',
        dosage: '3 ग्राम',
        frequency: '1-0-1 (प्रातः-सायं भोजन से पूर्व)',
        anupana: 'घृत / शीतल जल',
        duration: '15 दिन',
        source: 'Ayurvedic Formulations',
      },
      {
        drugName: 'कामदुधा रस (Kamadudha Ras Moti Yukta)',
        dosage: '1 वटी (125mg)',
        frequency: '1-0-1 (BD)',
        anupana: 'दूध / मिश्री युक्त जल',
        duration: '15 दिन',
        source: 'Ayurvedic Formulations',
      },
      {
        drugName: 'सूतशेखर रस (Sutshekhar Ras)',
        dosage: '1 वटी (250mg)',
        frequency: '0-0-1 (Night)',
        anupana: 'जल',
        duration: '15 दिन',
        source: 'Ayurvedic Formulations',
      },
    ],
    extractedLabFindings: [
      {
        testName: 'फास्टिंग ब्लड शुगर (FBS Glucose)',
        value: '98',
        unit: 'mg/dL',
        referenceRange: '70 - 100',
        flag: 'NORMAL',
        verifiedStatus: 'verified',
      },
      {
        testName: 'सीरम बिलीरुबिन (Total Bilirubin)',
        value: '0.8',
        unit: 'mg/dL',
        referenceRange: '0.2 - 1.2',
        flag: 'NORMAL',
        verifiedStatus: 'verified',
      },
    ],
    ocrText: 'Previous Endoscopy: Mild antral gastritis. Prescribed: Avipattikar Churna 3g BD with ghee.',
    extractedDrugs: ['Avipattikar Churna 3g BD', 'Kamadudha Ras 1 Tab BD', 'Sutshekhar Ras 1 HS'],
    status: 'awaiting_review',
  },
];

const loadPersistedQueue = (): DoctorQueuePatient[] => {
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('ayush_doctor_queue');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
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
    activePatient: initialQueue[1] || initialQueue[0] || null,
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
