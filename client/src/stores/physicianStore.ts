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
  treatmentMode?: 'ayurveda' | 'allopathy';
  generalVitals?: {
    bp_systolic?: number;
    bp_diastolic?: number;
    blood_glucose?: number;
    diabetes_status?: string;
    known_allergies?: string[];
    past_surgeries?: string;
  };
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

const INITIAL_MOCK_QUEUE: DoctorQueuePatient[] = [];

const loadPersistedQueue = (): DoctorQueuePatient[] => {
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('ayush_doctor_queue');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Filter out legacy mock sessions
          return parsed.filter((p) => p && p.sessionId && !p.sessionId.startsWith('SES-892'));
        }
      }
    }
  } catch (err) {
    console.warn('Could not parse persisted queue from localStorage:', err);
  }
  return [];
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
