import { create } from 'zustand';

export type LanguageCode =
  | 'hi' // Hindi
  | 'en' // English
  | 'pa' // Punjabi
  | 'ur' // Urdu
  | 'bn' // Bengali
  | 'te' // Telugu
  | 'mr' // Marathi
  | 'ta' // Tamil
  | 'gu' // Gujarati
  | 'kn' // Kannada
  | 'ml' // Malayalam
  | 'or' // Odia
  | 'as' // Assamese
  | 'mai' // Maithili
  | 'sa' // Sanskrit
  | 'ne' // Nepali
  | 'doi' // Dogri
  | 'kok' // Konkani
  | 'ks' // Kashmiri
  | 'sd' // Sindhi
  | 'sat' // Santhali
  | 'brx' // Bodo
  | 'mni'; // Manipuri

export type TreatmentMode = 'ayurveda' | 'allopathy';

export interface PatientInfo {
  id?: string;
  fullName: string;
  age: number | '';
  gender: 'male' | 'female' | 'other' | '';
  phone?: string;
  abhaId?: string;
  abhaAddress?: string;
  isReturning?: boolean;
  lastVisitDate?: string;
}

export interface DoctorAssignment {
  name: string;
  degree: string;
  roomNo: string;
  block: string;
  department: string;
  tokenNo: string;
  slotTime: string;
}

export interface SocratesResponses {
  site?: string;
  onset?: string;
  character?: string;
  radiation?: string;
  associated?: string;
  timing?: string;
  exacerbating?: string;
  severity?: number | string;
  familyHistory?: string;
}

export interface GeneralVitals {
  bloodPressureHistory?: string;
  diabetesStatus?: string;
  knownAllergies?: string;
  pastSurgeries?: string;
  lifestyleFactors?: string;
}

export interface DynamicQuestionOption {
  hindi: string;
  english: string;
  value: string;
}

export interface DynamicSocratesQuestion {
  id: string;
  key: string;
  category: string;
  titleHindi: string;
  titleEnglish: string;
  options: DynamicQuestionOption[];
}

export interface ActiveQuestionSet {
  id?: string;
  title: string;
  source: 'question_set' | 'gemini_general' | 'fallback' | 'static';
  questions: DynamicSocratesQuestion[];
}


export interface SessionState {
  // Session Identifiers
  sessionId: string | null;
  language: LanguageCode;
  treatmentMode: TreatmentMode;
  currentStep: string;
  consentGranted: boolean;
  consentTimestamp: string | null;

  // Patient Record
  patient: PatientInfo;

  // Clinical Workflow
  chiefComplaint: string;
  complaintCategory: string;
  socrates: SocratesResponses;
  generalVitals: GeneralVitals;
  redFlagTriggered: boolean;
  redFlagReason: string | null;

  // Prakriti & Pariksha (Ayurveda specific)
  prakritiAnswers: Record<string, { optionIndex: number; doshaTag: 'vata' | 'pitta' | 'kapha' }>;
  prakritiResult: {
    vataScore: number;
    pittaScore: number;
    kaphaScore: number;
    dominantPrakriti: string;
    secondaryPrakriti: string | null;
    confidence: 'high' | 'medium' | 'low';
  } | null;

  // Documents
  uploadedDocuments: Array<{
    id: string;
    name: string;
    previewUrl: string;
    extractedText?: string;
  }>;

  // Final Routing
  assignedDoctor: DoctorAssignment | null;

  // Dynamic Adaptive Socratic Questions
  activeQuestionSet: ActiveQuestionSet | null;
  dynamicQuestions: DynamicSocratesQuestion[];

  // Actions
  setLanguage: (lang: LanguageCode) => void;
  setTreatmentMode: (mode: TreatmentMode) => void;
  setSessionId: (id: string) => void;
  setCurrentStep: (step: string) => void;
  setConsentGranted: (granted: boolean) => void;
  setPatient: (patientData: Partial<PatientInfo>) => void;
  setChiefComplaint: (complaint: string, category?: string) => void;
  setSocratesResponse: (key: keyof SocratesResponses, value: any) => void;
  setGeneralVitals: (vitals: Partial<GeneralVitals>) => void;
  setRedFlag: (triggered: boolean, reason?: string | null) => void;
  setActiveQuestionSet: (set: ActiveQuestionSet | null) => void;
  setDynamicQuestions: (
    questions: DynamicSocratesQuestion[],
    setId?: string,
    setTitle?: string,
    source?: 'question_set' | 'gemini_general' | 'fallback' | 'static'
  ) => void;
  setPrakritiAnswer: (questionId: string, answer: { optionIndex: number; doshaTag: 'vata' | 'pitta' | 'kapha' }) => void;
  setPrakritiResult: (result: SessionState['prakritiResult']) => void;
  addUploadedDocument: (doc: SessionState['uploadedDocuments'][0]) => void;
  setAssignedDoctor: (doc: DoctorAssignment) => void;
  resetSession: () => void;
}

const initialPatientState: PatientInfo = {
  fullName: '',
  age: '',
  gender: '',
  phone: '',
  abhaId: '',
  abhaAddress: '',
  isReturning: false,
};

export const useSessionStore = create<SessionState>((set) => ({
  sessionId: null,
  language: 'hi',
  treatmentMode: 'ayurveda',
  currentStep: 'welcome',
  consentGranted: false,
  consentTimestamp: null,
  patient: initialPatientState,
  chiefComplaint: '',
  complaintCategory: '',
  socrates: {},
  generalVitals: {},
  redFlagTriggered: false,
  redFlagReason: null,
  prakritiAnswers: {},
  prakritiResult: null,
  uploadedDocuments: [],
  assignedDoctor: null,
  activeQuestionSet: null,
  dynamicQuestions: [],

  setLanguage: (lang) => set({ language: lang }),
  setTreatmentMode: (mode) => set({ treatmentMode: mode }),
  setSessionId: (id) => set({ sessionId: id }),
  setCurrentStep: (step) => set({ currentStep: step }),
  setConsentGranted: (granted) =>
    set({
      consentGranted: granted,
      consentTimestamp: granted ? new Date().toISOString() : null,
    }),
  setPatient: (patientData) =>
    set((state) => ({ patient: { ...state.patient, ...patientData } })),
  setChiefComplaint: (complaint, category = '') =>
    set({ chiefComplaint: complaint, complaintCategory: category }),
  setSocratesResponse: (key, value) =>
    set((state) => ({ socrates: { ...state.socrates, [key]: value } })),
  setGeneralVitals: (vitals) =>
    set((state) => ({ generalVitals: { ...state.generalVitals, ...vitals } })),
  setRedFlag: (triggered, reason = null) =>
    set({ redFlagTriggered: triggered, redFlagReason: reason }),
  setActiveQuestionSet: (setVal) => set({ activeQuestionSet: setVal }),
  setDynamicQuestions: (
    questions,
    setId,
    setTitle = 'Adaptive Assessment',
    source = 'question_set'
  ) =>
    set({
      dynamicQuestions: questions,
      activeQuestionSet: {
        id: setId,
        title: setTitle,
        source,
        questions,
      },
    }),
  setPrakritiAnswer: (questionId, answer) =>
    set((state) => ({
      prakritiAnswers: { ...state.prakritiAnswers, [questionId]: answer },
    })),
  setPrakritiResult: (result) => set({ prakritiResult: result }),
  addUploadedDocument: (doc) =>
    set((state) => ({
      uploadedDocuments: [...state.uploadedDocuments, doc],
    })),
  setAssignedDoctor: (doc) => set({ assignedDoctor: doc }),

  // Full DPDP Act 2023 memory wipe
  resetSession: () =>
    set({
      sessionId: null,
      language: 'hi',
      treatmentMode: 'ayurveda',
      currentStep: 'welcome',
      consentGranted: false,
      consentTimestamp: null,
      patient: initialPatientState,
      chiefComplaint: '',
      complaintCategory: '',
      socrates: {},
      generalVitals: {},
      redFlagTriggered: false,
      redFlagReason: null,
      prakritiAnswers: {},
      prakritiResult: null,
      uploadedDocuments: [],
      assignedDoctor: null,
      activeQuestionSet: null,
      dynamicQuestions: [],
    }),
}));
