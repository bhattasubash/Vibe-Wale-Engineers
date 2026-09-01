import { create } from 'zustand';

export interface PatientInfo {
  id?: string;
  fullName: string;
  age: number | '';
  gender: 'male' | 'female' | 'other' | '';
  phone?: string;
  abhaId?: string;
}

export interface SessionState {
  // Session Identifiers
  sessionId: string | null;
  language: 'hi' | 'en';
  currentStep: string;
  consentGranted: boolean;
  
  // Patient Details
  patient: PatientInfo;
  
  // Clinical Data
  chiefComplaint: string;
  complaintCategory: string;
  redFlagTriggered: boolean;
  
  // Actions
  setLanguage: (lang: 'hi' | 'en') => void;
  setSessionId: (id: string) => void;
  setCurrentStep: (step: string) => void;
  setConsentGranted: (granted: boolean) => void;
  setPatient: (patient: Partial<PatientInfo>) => void;
  setChiefComplaint: (complaint: string, category?: string) => void;
  setRedFlag: (triggered: boolean) => void;
  resetSession: () => void;
}

const initialPatientState: PatientInfo = {
  fullName: '',
  age: '',
  gender: '',
  phone: '',
  abhaId: '',
};

export const useSessionStore = create<SessionState>((set) => ({
  sessionId: null,
  language: 'hi', // Default to Hindi for OPD kiosk
  currentStep: 'welcome',
  consentGranted: false,
  patient: initialPatientState,
  chiefComplaint: '',
  complaintCategory: '',
  redFlagTriggered: false,

  setLanguage: (lang) => set({ language: lang }),
  setSessionId: (id) => set({ sessionId: id }),
  setCurrentStep: (step) => set({ currentStep: step }),
  setConsentGranted: (granted) => set({ consentGranted: granted }),
  setPatient: (patientData) =>
    set((state) => ({ patient: { ...state.patient, ...patientData } })),
  setChiefComplaint: (complaint, category = '') =>
    set({ chiefComplaint: complaint, complaintCategory: category }),
  setRedFlag: (triggered) => set({ redFlagTriggered: triggered }),
  
  // Wipe session memory cleanly on session completion
  resetSession: () =>
    set({
      sessionId: null,
      language: 'hi',
      currentStep: 'welcome',
      consentGranted: false,
      patient: initialPatientState,
      chiefComplaint: '',
      complaintCategory: '',
      redFlagTriggered: false,
    }),
}));
