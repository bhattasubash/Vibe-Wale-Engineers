import { create } from 'zustand';

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
  ocrText?: string;
  extractedDrugs?: string[];
  status: 'awaiting_review' | 'accepted' | 'amended' | 'rejected';
  doctorNotes?: string;
}

interface PhysicianState {
  isAuthenticated: boolean;
  doctorId: string;
  doctorName: string;
  department: string;
  roomNumber: string;
  queue: DoctorQueuePatient[];
  activePatient: DoctorQueuePatient | null;
  filterPriority: 'all' | 'critical' | 'normal';
  searchQuery: string;

  // Actions
  loginDoctor: (doctorId: string, doctorName: string, room: string) => void;
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
    chiefComplaint: 'सीने में भारीपन, सांस लेने में तकलीफ व घबराहट (Chest Discomfort)',
    complaintCategory: 'cardiovascular',
    dominantPrakriti: 'VATA-PITTA',
    vataScore: 60,
    pittaScore: 30,
    kaphaScore: 10,
    redFlagTriggered: true,
    priority: 'critical',
    assignedDoctor: 'डॉ. अनन्या शर्मा (Dr. Ananya Sharma)',
    roomNumber: 'Room 104',
    createdAt: '10:15 AM',
    socrates: {
      site: 'chest-left-arm',
      onset: 'acute-2-hours',
      severity: 'severe-8',
      timing: 'exertion-stress',
      familyHistory: 'family-cardiac',
    },
    ocrText: 'Prior ECG shows sinus tachycardia. Known hypertensive for 8 years.',
    extractedDrugs: ['Amlodipine 5mg OD', 'Arjuna Kwath 20ml BD'],
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
    chiefComplaint: 'दोनों घुटनों में कट-कट की आवाज, सूजन व तेज दर्द (Sandhivata)',
    complaintCategory: 'musculoskeletal',
    dominantPrakriti: 'PITTA-KAPHA',
    vataScore: 20,
    pittaScore: 53,
    kaphaScore: 27,
    redFlagTriggered: false,
    priority: 'normal',
    assignedDoctor: 'डॉ. अनन्या शर्मा (Dr. Ananya Sharma)',
    roomNumber: 'Room 104',
    createdAt: '10:22 AM',
    socrates: {
      site: 'bilateral-knees',
      onset: 'chronic-6-months',
      severity: 'severe-8',
      timing: 'cold-morning',
      familyHistory: 'family-arthritis',
    },
    ocrText: 'Rx: Maharasnadi Kwath 20ml BD, Yogaraj Guggulu 2 Tab BD. Diagnosed: Sandhivata (OA Knee).',
    extractedDrugs: ['Maharasnadi Kwath', 'Yogaraj Guggulu', 'Shallaki Capsule 1 BD'],
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
    chiefComplaint: 'अम्लपित्त, पेट में खट्टी डकार व सीने के निचले भाग में जलन (Amlapitta)',
    complaintCategory: 'digestive',
    dominantPrakriti: 'Predominantly PITTA',
    vataScore: 13,
    pittaScore: 74,
    kaphaScore: 13,
    redFlagTriggered: false,
    priority: 'normal',
    assignedDoctor: 'डॉ. अनन्या शर्मा (Dr. Ananya Sharma)',
    roomNumber: 'Room 104',
    createdAt: '10:28 AM',
    socrates: {
      site: 'epigastrium-chest',
      onset: 'subacute-3-months',
      severity: 'moderate-6',
      timing: 'post-meal-empty',
      familyHistory: 'family-none',
    },
    ocrText: 'Previous Endoscopy: Mild antral gastritis. Prescribed: Avipattikar Churna 3g BD with ghee.',
    extractedDrugs: ['Avipattikar Churna', 'Kamadudha Ras 1 Tab BD', 'Sutshekhar Ras'],
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
    doctorId: 'DOC-AIIA-104',
    doctorName: 'डॉ. अनन्या शर्मा (Dr. Ananya Sharma)',
    department: 'कायचिकित्सा विभाग (Internal Medicine)',
    roomNumber: 'Room #104 (Block A)',
    queue: initialQueue,
    activePatient: initialQueue[0] || null,
    filterPriority: 'all',
    searchQuery: '',

    loginDoctor: (doctorId, doctorName, room) =>
      set({ isAuthenticated: true, doctorId, doctorName, roomNumber: room }),

    logoutDoctor: () => set({ isAuthenticated: false }),

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
        // Prevent duplicates
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
