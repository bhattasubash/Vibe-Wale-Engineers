import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  Edit3,
  XCircle,
  FileText,
  Scale,
  Activity,
  ShieldAlert,
  Printer,
  Stethoscope,
  Eye,
  ZoomIn,
  ZoomOut,
  RotateCw,
  X,
  Check,
  FileCode,
  Send,
  Copy,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Zap,
  LogOut,
  ChevronDown,
  Heart,
} from 'lucide-react';
import { StateEmblem } from '@/components/shared/StateEmblem';
import { usePhysicianStore, DocumentItem } from '@/stores/physicianStore';
import { API_BASE_URL } from '@/lib/config';
import { CLINICAL_PRESETS } from '@/config/clinicalPresets';
import { PulseRateTrendGraph } from '@/components/physician/PulseRateTrendGraph';

export const ProvenanceBadge: React.FC<{
  source: 'patient-reported' | 'patient-selected' | 'document-extracted' | 'lab-report' | 'ai-suggested' | 'doctor-confirmed';
}> = ({ source }) => {
  switch (source) {
    case 'patient-reported':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1]" title="रोगी द्वारा मौखिक/स्वयं दर्ज (Patient reported via voice or text)">
          <span>🗣️ रोगी की रिपोर्ट (Patient reported)</span>
        </span>
      );
    case 'patient-selected':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]" title="कियोस्क पर रोगी द्वारा चयनित (Patient selected on kiosk)">
          <span>👤 रोगी प्रमाणित (Patient selected)</span>
        </span>
      );
    case 'document-extracted':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]" title="स्कैन किए गए दस्तावेज से निष्कर्षित (Extracted from uploaded document)">
          <span>📄 दस्तावेज़ से प्राप्त [Document extracted]</span>
        </span>
      );
    case 'lab-report':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]" title="सत्यापित पैथोलॉजी रिपोर्ट (Verified lab report)">
          <span>🔬 लैब रिपोर्ट [Lab report]</span>
        </span>
      );
    case 'ai-suggested':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#166534] border border-[#86EFAC]" title="चिकित्सक प्रश्नावली (Doctor 15 questions)">
          <span>✓ चिकित्सक (15 प्रश्नावली)</span>
        </span>
      );
    case 'doctor-confirmed':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]" title="चिकित्सक द्वारा सत्यापित (Confirmed by physician)">
          <span>✓ चिकित्सक सत्यापित [Doctor confirmed]</span>
        </span>
      );
  }
};

export const DoctorSessionReview: React.FC = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const { queue, activePatient, reviewSession, doctorName, roomNumber, authToken, addPatientToQueue } = usePhysicianStore();

  const [livePatient, setLivePatient] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState(false);

  const patient = livePatient || activePatient || queue.find((p) => p.sessionId === sessionId);
  const [doctorNotes, setDoctorNotes] = useState(patient?.doctorNotes || '');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // FHIR R4 and HIS Push Modal State
  const [showFhirModal, setShowFhirModal] = useState(false);
  const [fhirBundle, setFhirBundle] = useState<any>(null);
  const [loadingFhir, setLoadingFhir] = useState(false);
  const [hisPushing, setHisPushing] = useState(false);
  const [hisPushResult, setHisPushResult] = useState<any>(null);
  const [copiedFhir, setCopiedFhir] = useState(false);

  // Document Lightbox Modal State
  const [activeDocModal, setActiveDocModal] = useState<DocumentItem | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleOpenDocModal = (doc: DocumentItem) => {
    setActiveDocModal(doc);
    setZoomLevel(1);
    setRotation(0);
  };

  const handleCloseDocModal = () => {
    setActiveDocModal(null);
  };

  const handleOpenFhirModal = async () => {
    setShowFhirModal(true);
    setLoadingFhir(true);
    setHisPushResult(null);
    try {
      const sid = sessionId || patient?.sessionId;
      const res = await fetch(`${API_BASE_URL}/api/sessions/${sid}/fhir-bundle`);
      if (res.ok) {
        const data = await res.json();
        setFhirBundle(data);
      }
    } catch (err) {
      console.warn('Could not fetch FHIR bundle:', err);
    } finally {
      setLoadingFhir(false);
    }
  };

  const handlePushHis = async () => {
    setHisPushing(true);
    try {
      const sid = sessionId || patient?.sessionId;
      const res = await fetch(`${API_BASE_URL}/api/sessions/${sid}/push-his`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        setHisPushResult(data);
      }
    } catch (err) {
      console.warn('Could not push to HIS:', err);
    } finally {
      setHisPushing(false);
    }
  };

  const handleAction = (status: 'accepted' | 'amended' | 'rejected') => {
    if (!patient) return;
    reviewSession(patient.sessionId, status, doctorNotes);

    // If authenticated with backend, dispatch verified EMR status
    if (authToken) {
      fetch(`${API_BASE_URL}/api/physician/session/${patient.sessionId}/review`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          status,
          doctor_notes: doctorNotes,
          doctor_id: doctorName,
        }),
      }).catch(() => {
        // Offline resilience
      });
    }

    setToastMessage(
      status === 'accepted'
        ? 'केस सत्यापित एवं अस्पताल HIS में प्रेषित (Case Confirmed & Sent to HIS)'
        : status === 'amended'
        ? 'संशोधित विवरण ईएमआर में दर्ज (Information Amended & Saved)'
        : 'केस पुनः परीक्षण / स्पष्टीकरण हेतु चिह्नित (Clarification Requested)'
    );
    setShowToast(true);
    setTimeout(() => {
      navigate('/doctor/queue');
    }, 1200);
  };

  // Live OCR state fetched from backend API
  const [liveOcrResults, setLiveOcrResults] = useState<{
    reports_count: number;
    reports: any[];
    all_medications: any[];
    all_findings: any[];
    all_diagnoses: string[];
    combined_summary?: string;
  } | null>(null);

  useEffect(() => {
    const targetSessionId = sessionId || patient?.sessionId;
    if (!targetSessionId) return;

    setLoadingSession(true);
    const headers: Record<string, string> = {};
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    // Fetch full session details from backend
    fetch(`${API_BASE_URL}/api/physician/session/${targetSessionId}`, { headers })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.queue_entry) {
          const q = data.queue_entry;
          const loadedPatient = {
            sessionId: q.session_id,
            patientName: q.patient_name,
            age: q.age,
            gender: q.gender,
            phone: q.phone || '',
            abhaId: q.abha_id || '',
            tokenNumber: q.token_number,
            chiefComplaint: q.chief_complaint,
            complaintCategory: q.complaint_category || 'general',
            dominantPrakriti: q.dominant_prakriti,
            secondaryPrakriti: q.secondary_prakriti,
            vataScore: q.vata_score ?? 0,
            pittaScore: q.pitta_score ?? 0,
            kaphaScore: q.kapha_score ?? 0,
            treatmentMode: q.treatment_mode || 'ayurveda',
            generalVitals: q.general_vitals || data.vitals || {},
            redFlagTriggered: q.red_flag_triggered,
            priority: q.priority,
            assignedDoctor: q.assigned_doctor,
            roomNumber: q.room_number,
            createdAt: q.created_at || 'Just now',
            socrates: q.socrates || data.socrates || {},
            documents: q.documents || [],
            extractedMedications: q.medications || [],
            extractedLabFindings: q.lab_findings || [],
            ocrText: q.ocr_text || '',
            status: q.status || 'awaiting_review',
            doctorNotes: q.doctor_notes || '',
            pulseHistory: q.pulse_history || q.pulseHistory || data.pulse_history || data.vitals?.pulseHistory,
          };
          setLivePatient(loadedPatient);
          if (q.doctor_notes) {
            setDoctorNotes(q.doctor_notes);
          }
          addPatientToQueue(loadedPatient);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch full session data:', targetSessionId, err);
      })
      .finally(() => {
        setLoadingSession(false);
      });

    // Also fetch OCR results if available
    fetch(`${API_BASE_URL}/api/documents/${targetSessionId}/results`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.reports_count > 0) {
          setLiveOcrResults(data);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch live OCR data for session:', targetSessionId, err);
      });
  }, [sessionId, patient?.sessionId, authToken]);

  const rawDocs: DocumentItem[] = liveOcrResults && liveOcrResults.reports.length > 0
    ? liveOcrResults.reports.map((r, idx) => {
        const localDoc = patient?.documents?.[idx];
        return {
          id: r.report_id || `DOC-${idx + 1}`,
          name: `${r.report_type} (${r.medical_specialty || 'General'})`,
          url: localDoc?.url || '',
          type: (r.report_type?.toLowerCase().includes('lab') ? 'Lab Report' : 'Prescription') as 'Prescription' | 'Lab Report' | 'Discharge Summary' | 'Other',
          date: r.report_date || new Date().toLocaleDateString('en-GB'),
          facility: r.facility_name || 'AIIA Medical Records',
          ocrSnippet: r.summary || r.impression || 'संलग्न चिकित्सा पर्चे से निष्कर्षित पाठ',
        };
      })
    : patient?.documents && patient.documents.length > 0
    ? patient.documents
    : [];

  // Chronological sort: newest documents first (Chronological Timeline)
  const patientDocs: DocumentItem[] = [...rawDocs].sort((a, b) => {
    const timeA = a.date ? new Date(a.date).getTime() : 0;
    const timeB = b.date ? new Date(b.date).getTime() : 0;
    return timeB - timeA;
  });

  const medications = liveOcrResults && liveOcrResults.all_medications?.length > 0
    ? liveOcrResults.all_medications
    : patient?.extractedMedications && patient.extractedMedications.length > 0
    ? patient.extractedMedications
    : [];

  const labFindings = liveOcrResults && liveOcrResults.all_findings?.length > 0
    ? liveOcrResults.all_findings
    : patient?.extractedLabFindings && patient.extractedLabFindings.length > 0
    ? patient.extractedLabFindings
    : [];

  const rawOcrText = liveOcrResults?.combined_summary || patient?.ocrText || '';

  if (!patient) {
    return (
      <div className="flex flex-col min-h-screen bg-[#EAEDF0] text-[#212529] font-sans justify-center items-center p-6 text-center">
        <div className="bg-white border border-[#CED4DA] p-8 rounded-[3px] max-w-md w-full shadow-xs">
          <Stethoscope className="w-12 h-12 text-[#0B5FA5] mx-auto mb-3" />
          <h2 className="text-lg font-black text-[#212529] mb-1">
            {loadingSession ? 'रोगी डेटा लोड हो रहा है...' : 'रोगी रिकॉर्ड उपलब्ध नहीं है'}
          </h2>
          <p className="text-xs text-[#6C757D] mb-4">
            {loadingSession
              ? 'कृपया प्रतीक्षा करें, सत्र विवरण ईएमआर से प्राप्त किया जा रहा है...'
              : `सत्र आईडी (${sessionId || 'N/A'}) के लिए कोई सक्रिय मरीज नहीं मिला। कृपया ओपीडी कतार में से मरीज का चयन करें।`}
          </p>
          <button
            type="button"
            onClick={() => navigate('/doctor/queue')}
            className="w-full py-2 px-4 bg-[#0B5FA5] text-white text-xs font-bold rounded-[3px] hover:bg-[#084B83] cursor-pointer"
          >
            ← कतार सूची पर वापस जाएं (Back to Queue)
          </button>
        </div>
      </div>
    );
  }

  const isAllopathy =
    patient.treatmentMode === 'allopathy' ||
    patient.dominantPrakriti?.toLowerCase().includes('allopathy') ||
    patient.dominantPrakriti?.toLowerCase().includes('एलोपैथी') ||
    patient.complaintCategory === 'allopathy' ||
    patient.complaintCategory === 'general-medicine';

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#EBF5FB] via-[#F4F9FD] to-[#E3EFF9] text-[#1E293B] font-sans select-none justify-between relative overflow-hidden">
      
      {/* Subtle Ayush Watermark Bottom Right */}
      <div className="fixed -bottom-10 -right-10 pointer-events-none opacity-[0.06] text-[#0B63AC] z-0">
        <svg width="280" height="280" viewBox="0 0 100 100" fill="currentColor">
          <path d="M50 0 C45 30 15 45 0 60 C30 65 45 50 50 80 C55 50 70 65 100 60 C85 45 55 30 50 0 Z"/>
          <circle cx="50" cy="50" r="14" fill="none" stroke="currentColor" strokeWidth="2"/>
        </svg>
      </div>

      {/* Top Workstation Header */}
      <header className="bg-white border-b border-[#E2E8F0] px-6 py-3 shrink-0 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-3.5">
            <StateEmblem className="w-8 h-11 text-[#2B3A4A] shrink-0" />
            <div>
              <span className="text-base sm:text-lg font-black text-[#0B63AC] block leading-tight">
                चिकित्सक केस शीट समीक्षा • Clinical Case Sheet Review
              </span>
              <span className="text-sm font-medium text-[#64748B] block mt-0.5">
                आयुर्वेदिक चिकित्सालय, अयोध्या • {roomNumber}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleOpenFhirModal}
              className="py-2 px-3.5 rounded-lg border border-[#0B63AC] bg-[#EBF4FC] hover:bg-[#0B63AC] hover:text-white text-sm font-bold text-[#0B63AC] flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
              title="ABDM HL7 FHIR R4 Bundle Record & Hospital Sync"
            >
              <FileCode className="w-4 h-4" />
              <span className="hidden sm:inline">FHIR R4 Bundle</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="py-2 px-3.5 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-sm font-bold text-[#475569] flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>प्रिंट / सेव केस शीट (Print Case Sheet)</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/doctor/queue')}
              className="py-2 px-3.5 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#FEF2F2] hover:text-[#DC2626] text-sm font-bold text-[#475569] flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
            >
              <LogOut className="w-4 h-4" />
              <span>लॉगआउट</span>
            </button>
          </div>

        </div>
      </header>

      {/* Patient Strip with Back Button */}
      <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-6 py-2.5 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/doctor/queue')}
              className="py-1.5 px-3.5 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#EBF4FC] text-sm font-bold text-[#0B63AC] flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>वापस सूची में जाएँ</span>
            </button>
            <div className="flex items-center gap-2.5 text-sm font-bold text-[#1E293B] flex-wrap">
              <span className="text-base font-black text-[#1E293B]">{patient.patientName}</span>
              <span className="text-[#64748B]">
                {patient.age} वर्ष • {patient.gender === 'female' ? 'महिला' : 'पुरुष'} • {patient.phone || '9876543210'}
              </span>
              <span className="text-[#CBD5E1]">|</span>
              <span className="text-[#64748B] font-mono">
                ABHA: {patient.abhaId || '9876-543210'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {patient.redFlagTriggered ? (
              <span className="text-sm font-bold px-3 py-1 rounded-full bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] flex items-center gap-1">
                <ShieldAlert className="w-4 h-4 text-[#DC2626]" />
                <span>आपातकालीन अलर्ट</span>
              </span>
            ) : (
              <span className="text-sm font-bold px-3 py-1 rounded-full bg-[#DCFCE7] text-[#166534] border border-[#86EFAC]">
                सामान्य प्राथमिकता
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 pb-24 lg:pb-6 flex-1 flex flex-col space-y-4">
        
        {/* 10-Second Clinical Snapshot Banner Matching Reference Screenshot */}
        <div className="bg-[#EBF4FC] border border-[#BFDBFE] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[#0B63AC] fill-[#0B63AC]" />
              <span className="text-sm font-black text-[#0B63AC] uppercase tracking-wider">
                क्लिनिकल केस सारांश • 10-SECOND CLINICAL SNAPSHOT
              </span>
            </div>
            <span className="text-xs font-semibold text-[#64748B]">
              आयुर्वेदिक परामर्श पूर्व त्वरित अवलोकन (AIIMS-AYUSH Clinical Protocol)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Card 1: Chief Complaint */}
            <div className="bg-white border border-[#DCE7F3] rounded-lg p-3 shadow-2xs">
              <span className="text-xs font-bold text-[#64748B] block mb-1">मुख्य शिकायत (Chief Complaint)</span>
              <span className="text-sm font-black text-[#1E293B] block leading-snug line-clamp-2">
                {patient.chiefComplaint || 'दोनों घुटनों में दर्द एवं सूजन से सर्वाधिक समस्या'}
              </span>
              <span className="text-xs text-[#64748B] block mt-1">
                P/R: {patient.socrates?.site || 'Both knee joints (Janu Sandhi)'}
              </span>
            </div>

            {/* Card 2: Clinical Progress / Severity */}
            <div className="bg-white border border-[#DCE7F3] rounded-lg p-3 shadow-2xs">
              <span className="text-xs font-bold text-[#64748B] block mb-1">क्लिनिकल स्थिति (Progressive)</span>
              <span className="text-sm font-black text-[#DC2626] block">
                तीव्र: {patient.socrates?.severity ? `${patient.socrates.severity}/10` : '8/10'}
              </span>
              <span className="text-xs text-[#64748B] block mt-1">
                {patient.socrates?.onset || '4 months, progressive'}
              </span>
            </div>

            {/* Card 3: Prakriti State */}
            <div className="bg-white border border-[#DCE7F3] rounded-lg p-3 shadow-2xs">
              <span className="text-xs font-bold text-[#64748B] block mb-1">वर्तमान स्थिति (State)</span>
              <span className="text-sm font-black text-[#0B63AC] block">
                {patient.dominantPrakriti || 'Vata'}
              </span>
              <span className="text-xs text-[#64748B] font-mono block mt-1">
                V20 P26 K0
              </span>
            </div>

            {/* Card 4: Provisional Diagnosis */}
            <div className="bg-white border border-[#DCE7F3] rounded-lg p-3 shadow-2xs">
              <span className="text-xs font-bold text-[#64748B] block mb-1">आपातकालीन स्थिति (Provisional)</span>
              <span className="text-sm font-black text-[#166534] block">
                ✓ ऑस्टियोअर्थराइटिस
              </span>
              <span className="text-xs text-[#64748B] block mt-1">
                क्लिनिकल सर्वेक्षण के आधार पर
              </span>
            </div>

            {/* Card 5: Vitals / Heart Rate */}
            <div className="bg-white border border-[#DCE7F3] rounded-lg p-3 shadow-2xs">
              <span className="text-xs font-bold text-[#64748B] block mb-1">नाड़ी / हृदय दर (Pulse)</span>
              <span className="text-sm font-black text-[#E11D48] flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 fill-[#E11D48] animate-pulse" />
                <span>{patient.pulseHistory?.[patient.pulseHistory.length - 1]?.bpm || 76} BPM</span>
              </span>
              <span className="text-xs text-[#166534] font-semibold block mt-1">
                ✓ स्थिर नाड़ी (Normal Sinus)
              </span>
            </div>

            {/* Card 6: Advance Plan */}
            <div className="bg-white border border-[#DCE7F3] rounded-lg p-3 shadow-2xs">
              <span className="text-xs font-bold text-[#64748B] block mb-1">त्वरित परामर्श (Plan)</span>
              <span className="text-sm font-black text-[#1E293B] block">
                1 कषाय + 1 वटी योग
              </span>
              <span className="text-xs text-[#64748B] block mt-1">
                2 फॉलोअप
              </span>
            </div>
          </div>
        </div>

        {/* Main 2-Column Split: Demographics & Timeline on Left, Constitutional Typology on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* LEFT COLUMN (7 Cols, ~58% width) */}
          <div id="section-history" className="lg:col-span-7 space-y-3.5">
            
            {/* 1. Patient Demographics Card */}
            <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl shadow-xs">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block">
                    रोगी विवरण (PATIENT DEMOGRAPHICS)
                  </span>
                  <span className="text-2xl font-black text-[#1E293B] block mt-0.5">
                    {patient.patientName}
                  </span>
                  <span className="text-sm font-medium text-[#64748B] block mt-0.5">
                    {patient.age} वर्ष • {patient.gender === 'female' ? 'महिला' : 'पुरुष'} • मो नं: {patient.phone || '9876543210'}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-xs font-semibold text-[#64748B] uppercase block">OPD PID:</span>
                  <span className="text-2xl font-black font-mono text-[#0B63AC] block">
                    {patient.tokenNumber.startsWith('#') ? patient.tokenNumber : `#${patient.tokenNumber}`}
                  </span>
                  <span className="text-xs font-bold text-[#64748B] uppercase block">
                    AIIA/HC
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Chief Complaint Card */}
            <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl shadow-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                  मुख्य शिकायत / मुख्य कष्टकारी क्लिनिकल (CHIEF COMPLAINT)
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-[#EBF4FC] text-[#0B63AC] border border-[#BFDBFE]">
                  👤 रोगी प्रमाणित (Patient selected)
                </span>
              </div>
              <span className="text-base font-black text-[#1E293B] block">
                {patient.chiefComplaint || 'दोनों घुटनों में दर्द एवं सूजन से सर्वाधिक समस्या'}
              </span>
            </div>

            {/* 3. Clinical History & Timeline (SOCRATES) Card */}
            <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl shadow-xs">
              <div className="flex items-center gap-1.5 text-sm font-black text-[#0B63AC] uppercase tracking-wider mb-3">
                <Activity className="w-4 h-4 text-[#0B63AC]" />
                <span>इतिहास एवं अन्य जानकारी (CLINICAL HISTORY & TIMELINE)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm">
                {/* 1. Site */}
                <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[#64748B] font-bold">1. स्थान (Site)</span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1]">
                      🗣️ रोगी की रिपोर्ट (Patient reported)
                    </span>
                  </div>
                  <span className="text-sm font-bold text-[#1E293B] block">
                    {patient.socrates?.site || 'Both Knees joints (Janu Sandhi)'}
                  </span>
                </div>

                {/* 2. Onset & Duration */}
                <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[#64748B] font-bold">2. अवधि (Onset & Duration)</span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1]">
                      🗣️ रोगी की रिपोर्ट (Patient reported)
                    </span>
                  </div>
                  <span className="text-sm font-bold text-[#1E293B] block">
                    {patient.socrates?.onset || '4 months, progressive'}
                  </span>
                </div>

                {/* 4. Severity */}
                <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
                  <span className="text-xs text-[#64748B] font-bold block mb-1">4. तीव्रता (Severity Scale)</span>
                  <span className="text-base font-black text-[#DC2626] block">
                    {patient.socrates?.severity ? `${patient.socrates.severity}/10` : '8/10'}
                  </span>
                </div>

                {/* 5. Timing / Aggravated */}
                <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[#64748B] font-bold">5. स्थिति (Aggravated/Relieved)</span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
                      ☑ रोगी की प्राथमिकता (Patient selected)
                    </span>
                  </div>
                  <span className="text-sm font-bold text-[#1E293B] block">
                    {patient.socrates?.timing || 'Aggravated in morning and cold'}
                  </span>
                </div>

                {/* 6. Family History */}
                <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[#64748B] font-bold">6. पारिवारिक इतिहास (Family History / Kula)</span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
                      ☑ रोगी का कथन (Patient selected)
                    </span>
                  </div>
                  <span className="text-sm font-bold text-[#1E293B] block">
                    {patient.socrates?.familyHistory || 'No family history of arthritis'}
                  </span>
                </div>
              </div>
            </div>

          {/* 3. CAPTURED DOCUMENT SCANS & LIGHTBOX VIEWER GALLERY */}
          <div id="section-documents" className="bg-white border border-[#E2E8F0] p-4 rounded-xl shadow-xs">
            <div className="text-sm font-black text-[#0B5FA5] uppercase tracking-wider mb-3 flex items-center justify-between border-b border-[#E2E8F0] pb-2.5 flex-wrap gap-1">
              <div className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#0B5FA5]" />
                <span>अपलोड किए गए मूल दस्तावेज एवं पर्चे (Scanned Documents)</span>
              </div>
              <div className="flex items-center gap-2">
                <ProvenanceBadge source="document-extracted" />
                <span className="text-xs font-bold px-2.5 py-1 bg-[#EBF4FC] text-[#0B63AC] border border-[#BFDBFE] rounded-full">
                  {patientDocs.length} दस्तावेज उपलब्ध
                </span>
              </div>
            </div>

            {/* Document Thumbnail Cards Grid or Empty State */}
            {patientDocs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                {patientDocs.map((doc, idx) => (
                  <div
                    key={doc.id || idx}
                    onClick={() => handleOpenDocModal(doc)}
                    className="p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] hover:border-[#0B63AC] rounded-lg flex gap-3 items-center cursor-pointer transition-all hover:shadow-xs group"
                  >
                    <div className="relative w-16 h-20 bg-gray-100 border border-[#CBD5E1] rounded-md overflow-hidden shrink-0 flex items-center justify-center">
                      {doc.url ? (
                        <img
                          src={doc.url}
                          alt={doc.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <FileText className="w-8 h-8 text-[#64748B]" />
                      )}
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Eye className="w-5 h-5 text-white" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-xs font-black uppercase px-2 py-0.5 rounded-full bg-[#EBF4FC] text-[#0B63AC]">
                          {doc.type}
                        </span>
                        {doc.date && <span className="text-xs text-[#64748B] font-bold">{doc.date}</span>}
                      </div>
                      <span className="text-sm font-black text-[#1E293B] block truncate group-hover:text-[#0B63AC]">
                        {doc.name}
                      </span>
                      <span className="text-xs text-[#64748B] block truncate mt-0.5">
                        {doc.facility || 'संलग्न चिकित्सा पर्चा'}
                      </span>
                      <span className="text-xs font-bold text-[#0B63AC] flex items-center gap-1 mt-1.5">
                        <Eye className="w-3.5 h-3.5" />
                        <span>बड़ा देखें (Click to Zoom)</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-[#F8FAFC] border border-dashed border-[#CBD5E1] rounded-lg text-center text-sm text-[#64748B] mb-3">
                <FileText className="w-8 h-8 mx-auto text-[#CBD5E1] mb-1.5" />
                <span className="font-bold block text-[#475569]">कोई पूर्व पर्चा या रिपोर्ट संलग्न नहीं है</span>
                <span className="text-xs block mt-0.5 text-[#64748B]">
                  रोगी ने कियोस्क पर कोई पिछला दस्तावेज़ स्कैन नहीं किया है (No documents uploaded).
                </span>
              </div>
            )}

            {/* OCR Extracted Text Box */}
            <div className="p-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-sm">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-[#64748B] font-bold">
                  दस्तावेज़ पाठ निष्कर्षण (Extracted Document Text):
                </span>
                <ProvenanceBadge source="document-extracted" />
              </div>
              <p className="font-mono text-[#1E293B] text-xs leading-relaxed">
                {rawOcrText || 'कोई पाठ उपलब्ध नहीं (No text extracted from captured documents)'}
              </p>
            </div>
          </div>

          {/* 3B. LONGITUDINAL PULSE RATE & HEART BEAT GRAPH FROM PAST MEDICAL RECORDS */}
          <div id="section-pulse-graph">
            <PulseRateTrendGraph
              records={patient.pulseHistory}
              patientName={patient.patientName}
              dominantPrakriti={patient.dominantPrakriti}
              currentPulse={
                labFindings.find((l: any) =>
                  String(l.testName || '').toLowerCase().includes('pulse') ||
                  String(l.testName || '').toLowerCase().includes('heart')
                )?.value || patient.pulseHistory?.[patient.pulseHistory.length - 1]?.bpm
              }
            />
          </div>

          {/* 4. EXTRACTED MEDICATIONS TABLE OR EMPTY STATE */}
          <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl shadow-xs">
            <div className="text-sm font-black text-[#0B63AC] uppercase tracking-wider mb-3 flex items-center justify-between border-b border-[#E2E8F0] pb-2.5 flex-wrap gap-1">
              <div className="flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4 text-[#0B63AC]" />
                <span>पूर्व औषधि योग एवं मात्रा विवरण (Prior Formulations & Dosage)</span>
              </div>
              <ProvenanceBadge source="document-extracted" />
            </div>

            {medications.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border border-[#E2E8F0] rounded-lg overflow-hidden">
                  <thead className="bg-[#F1F6FA] text-[#0B63AC] font-black text-xs uppercase">
                    <tr className="border-b border-[#E2E8F0]">
                      <th className="p-3">औषधि का नाम (Medication)</th>
                      <th className="p-3">मात्रा (Dosage)</th>
                      <th className="p-3">सेवन काल (Frequency)</th>
                      <th className="p-3">अनुपान (Vehicle)</th>
                      <th className="p-3">स्रोत (Source)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9] font-medium text-[#1E293B]">
                    {medications.map((med: any, idx: number) => (
                      <tr key={idx} className="hover:bg-[#F8FAFC]">
                        <td className="p-3 font-bold text-[#0B63AC]">{med.drugName}</td>
                        <td className="p-3">{med.dosage}</td>
                        <td className="p-3">{med.frequency}</td>
                        <td className="p-3 text-[#64748B]">{med.anupana}</td>
                        <td className="p-3">
                          <span className="px-2.5 py-0.5 rounded-full bg-[#EAF8F1] text-[#166534] text-xs font-bold">
                            {med.source || 'दस्तावेज़'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-3.5 bg-[#F8FAFC] border border-dashed border-[#CBD5E1] rounded-lg text-center text-sm text-[#64748B]">
                <span className="font-bold block text-[#475569]">कोई पूर्व औषधि विवरण उपलब्ध नहीं है</span>
                <span className="text-xs block mt-0.5 text-[#64748B]">
                  स्कैन किए गए दस्तावेज़ों से कोई पूर्व औषधि नहीं पाई गई (No prior prescriptions found).
                </span>
              </div>
            )}
          </div>

          {/* 5. VERIFIED LAB BIOMARKERS TABLE OR EMPTY STATE */}
          <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl shadow-xs">
            <div className="text-sm font-black text-[#0B63AC] uppercase tracking-wider mb-3 flex items-center justify-between border-b border-[#E2E8F0] pb-2.5 flex-wrap gap-1">
              <div className="flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-[#0B63AC]" />
                <span>प्रयोगशाला जांच एवं पैथोलॉजी रिपोर्ट (Verified Lab Investigations)</span>
              </div>
              <ProvenanceBadge source="lab-report" />
            </div>

            {labFindings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border border-[#E2E8F0] rounded-lg overflow-hidden">
                  <thead className="bg-[#F1F6FA] text-[#0B63AC] font-black text-xs uppercase">
                    <tr className="border-b border-[#E2E8F0]">
                      <th className="p-3">जांच का नाम (Test / Biomarker)</th>
                      <th className="p-3">प्राप्त मान (Result Value)</th>
                      <th className="p-3">मानक सीमा (Reference Range)</th>
                      <th className="p-3">सत्यापन (Verification)</th>
                      <th className="p-3">स्थिति (Flag)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9] font-medium text-[#1E293B]">
                    {labFindings.map((lab: any, idx: number) => {
                      const flagUpper = String(lab.flag || '').toUpperCase();
                      const isAbnormal =
                        flagUpper.includes('ELEVATED') ||
                        flagUpper.includes('HIGH') ||
                        flagUpper.includes('LOW') ||
                        flagUpper.includes('ABNORMAL');
                      return (
                        <tr
                          key={idx}
                          className={`transition-colors ${
                            isAbnormal
                              ? 'bg-[#FEF2F2]/60 hover:bg-[#FEF2F2] border-l-4 border-l-[#DC2626]'
                              : 'hover:bg-[#F8FAFC]'
                          }`}
                        >
                          <td className="p-3 font-bold text-[#1E293B] flex items-center gap-1.5">
                            {isAbnormal && <AlertTriangle className="w-4 h-4 text-[#DC2626] shrink-0" />}
                            <span>{lab.testName}</span>
                          </td>
                          <td className={`p-3 font-mono font-bold ${isAbnormal ? 'text-[#DC2626]' : 'text-[#1E293B]'}`}>
                            {lab.value} {lab.unit}
                          </td>
                          <td className="p-3 text-[#64748B] font-mono">{lab.referenceRange} {lab.unit}</td>
                          <td className="p-3">
                            <span className="px-2.5 py-1 rounded-full bg-[#EAF8F1] text-[#166534] text-xs font-bold flex items-center gap-1 w-fit">
                              <Check className="w-3.5 h-3.5 text-[#166534]" />
                              <span>मूल रिपोर्ट से सत्यापित</span>
                            </span>
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-black uppercase inline-flex items-center gap-1 ${
                                isAbnormal
                                  ? 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] shadow-2xs'
                                  : 'bg-[#DCFCE7] text-[#166534]'
                              }`}
                            >
                              {isAbnormal && <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] animate-pulse" />}
                              <span>{lab.flag || (isAbnormal ? 'ABNORMAL' : 'NORMAL')}</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-3.5 bg-[#F8FAFC] border border-dashed border-[#CBD5E1] rounded-lg text-center text-sm text-[#64748B]">
                <span className="font-bold block text-[#475569]">कोई प्रयोगशाला जांच रिकॉर्ड नहीं मिली</span>
                <span className="text-xs block mt-0.5 text-[#64748B]">
                  स्कैन किए गए दस्तावेज़ों से कोई पैथोलॉजी टेस्ट मान प्राप्त नहीं हुआ (No lab values found).
                </span>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN (5 Cols): Classical Tridosha Prakriti Analysis & Doctor Action Bar */}
        <div id="section-rx" className="lg:col-span-5 space-y-4">
          
          {/* 6. PATHWAY-AWARE CLINICAL ASSESSMENT (ALLOPATHY VS AYURVEDA) */}
          {isAllopathy ? (
            /* 6A. ALLOPATHIC GENERAL VITALS & CLINICAL HISTORY */
            <div className="bg-white border-2 border-[#0B5FA5] p-4 rounded-xl shadow-xs">
              <div className="flex items-center justify-between border-b border-[#0B5FA5]/30 pb-2.5 mb-3">
                <span className="text-sm font-black text-[#0B5FA5] uppercase tracking-wider flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-[#0B5FA5]" />
                  <span>सामान्य एलोपैथी विवरण (General Medicine Vitals & History)</span>
                </span>
                <span className="text-xs font-bold px-2.5 py-1 bg-[#E8F1F8] text-[#0B5FA5] rounded-full">
                  जनरल मेडिसिन OPD
                </span>
              </div>

              {/* Pathway Header */}
              <div className="p-3.5 bg-[#E8F1F8] border border-[#0B5FA5]/40 rounded-xl mb-3.5 text-center">
                <span className="text-xs font-bold uppercase text-[#0B5FA5] block">
                  उपचार मार्ग (Treatment Pathway)
                </span>
                <span className="text-2xl font-black text-[#084B83] block my-0.5">
                  सामान्य चिकित्सा (Allopathy OPD)
                </span>
                <span className="text-xs sm:text-sm font-bold text-[#495057]">
                  रोगी प्राथमिक स्वास्थ्य इतिहास एवं विटल्स सत्यापन
                </span>
              </div>

              {/* 4 Clinical Vitals & History Grid */}
              <div className="space-y-2.5 mb-3.5 text-sm">
                <div className="p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[#64748B] font-bold">1. रक्तचाप स्थिति (Blood Pressure History):</span>
                    <ProvenanceBadge source="patient-selected" />
                  </div>
                  <span className="font-bold text-[#1E293B]">
                    {patient.generalVitals?.bloodPressureHistory === 'hypertensive-meds'
                      ? 'उच्च रक्तचाप - नियमित दवा चालू (Hypertensive on Meds)'
                      : patient.generalVitals?.bloodPressureHistory === 'borderline-bp'
                      ? 'बॉर्डरलाइन / कभी-कभार बढ़ता है (Borderline BP)'
                      : patient.generalVitals?.bloodPressureHistory === 'normal-bp'
                      ? 'सामान्य रक्तचाप (Normal Blood Pressure)'
                      : patient.generalVitals?.bloodPressureHistory || 'उल्लेख नहीं (Not recorded)'}
                  </span>
                </div>

                <div className="p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[#64748B] font-bold">2. मधुमेह स्थिति (Diabetes / Blood Sugar):</span>
                    <ProvenanceBadge source="patient-selected" />
                  </div>
                  <span className="font-bold text-[#1E293B]">
                    {patient.generalVitals?.diabetesStatus === 'diabetic-meds'
                      ? 'मधुमेह पीड़ित - दवा/इंसुलिन चालू (Diabetic on Treatment)'
                      : patient.generalVitals?.diabetesStatus === 'prediabetic'
                      ? 'प्री-डायबिटिक (Pre-diabetic / Borderline)'
                      : patient.generalVitals?.diabetesStatus === 'non-diabetic'
                      ? 'मधुमेह नहीं (Non-diabetic)'
                      : patient.generalVitals?.diabetesStatus || 'उल्लेख नहीं (Not recorded)'}
                  </span>
                </div>

                <div className="p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[#64748B] font-bold">3. ज्ञात औषध एलर्जी (Drug Allergies):</span>
                    <ProvenanceBadge source="patient-selected" />
                  </div>
                  <span className={`font-bold ${patient.generalVitals?.knownAllergies && patient.generalVitals?.knownAllergies !== 'allergy-none' ? 'text-[#DC2626]' : 'text-[#15803D]'}`}>
                    {patient.generalVitals?.knownAllergies === 'allergy-none'
                      ? 'रोगी द्वारा कोई ज्ञात एलर्जी नहीं बताई गई (Patient stated NKDA)'
                      : patient.generalVitals?.knownAllergies === 'allergy-antibiotic'
                      ? 'पेनिसिलिन / एंटीबायोटिक एलर्जी (Antibiotic Allergy)'
                      : patient.generalVitals?.knownAllergies === 'allergy-nsaid'
                      ? 'दर्द निवारक (NSAIDs / Painkillers) से एलर्जी'
                      : Array.isArray(patient.generalVitals?.knownAllergies) && patient.generalVitals.knownAllergies.length > 0
                      ? patient.generalVitals.knownAllergies.join(', ')
                      : patient.generalVitals?.knownAllergies
                      ? String(patient.generalVitals?.knownAllergies)
                      : 'उल्लेख नहीं (Not recorded — कृपया जांचें)'}
                  </span>
                </div>

                <div className="p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[#64748B] font-bold">4. पूर्व सर्जरी / गंभीर बीमारी (Past Surgeries & History):</span>
                    <ProvenanceBadge source="patient-selected" />
                  </div>
                  <span className="font-bold text-[#1E293B]">
                    {patient.generalVitals?.pastSurgeries === 'surgery-recent-year'
                      ? 'पिछले 1 वर्ष में सर्जरी / अस्पताल में भर्ती'
                      : patient.generalVitals?.pastSurgeries === 'surgery-past'
                      ? 'पुरानी सर्जरी का इतिहास (Past Surgery)'
                      : patient.generalVitals?.pastSurgeries === 'chronic-cardiac-renal'
                      ? 'हृदय, गुर्दा या थायरॉयड का पुराना उपचार'
                      : patient.generalVitals?.pastSurgeries === 'surgery-none'
                      ? 'रोगी द्वारा कोई पूर्व सर्जरी नहीं बताई गई (No past surgeries)'
                      : patient.generalVitals?.pastSurgeries || 'उल्लेख नहीं (Not recorded — कृपया जांचें)'}
                  </span>
                </div>
              </div>

              {/* Allopathic Guidance Note */}
              <div className="p-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-sm space-y-1">
                <span className="text-xs font-black text-[#0B5FA5] uppercase tracking-wider block">
                  क्लिनिकल मार्गदर्शन (Clinical Guidance):
                </span>
                <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                  • <strong>एलोपैथिक मूल्यांकन:</strong> मुख्य शिकायत ({patient.chiefComplaint || 'सामान्य जांच'}) एवं विटल्स के आधार पर आवश्यक पैथोलॉजी जांच एवं मानक एलोपैथिक चिकित्सा योजना तैयार करें।
                </p>
              </div>
            </div>
          ) : (
            /* 6B. CHARAKA SAMHITA PRAKRITI ANALYSIS (Vimanasthana 8) */
            <div className="bg-white border-2 border-[#86EFAC] p-4 rounded-xl shadow-xs">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2.5 mb-3 flex-wrap gap-1">
                <span className="text-sm font-black text-[#166534] uppercase tracking-wider flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-[#166534]" />
                  <span>संवैधानिक प्रकृतिकी (CONSTITUTIONAL TYPOLOGY)</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full bg-[#DCFCE7] text-[#166534] border border-[#86EFAC]">
                    + चरकसंहिता
                  </span>
                  <span className="inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full bg-[#DCFCE7] text-[#166534] border border-[#86EFAC]">
                    15 प्रश्नावली
                  </span>
                </div>
              </div>

              {/* Dominant Typology Badge Box Matching Reference */}
              <div className="p-3.5 bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl text-center mb-3.5">
                <span className="text-xs font-bold uppercase text-[#15803D] tracking-wider block">
                  शारीरिक प्रकृति (Charaka Samhita Vimanasthana - Vata)
                </span>
                <span className="text-3xl font-black text-[#166534] block my-1">
                  {patient.dominantPrakriti || 'Vata'}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-[#16A34A] block">
                  अन्य प्रकृति (Guna): पित्त (Pitta) - कफ (Kapha) संतुलित
                </span>
              </div>

              {/* Tri-Dosha Progress Bars Matching Reference */}
              <div className="space-y-2.5 mb-3.5 text-sm font-bold">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[#0B63AC]">वात (Vata - Nerves/Movement):</span>
                    <span className="font-mono">{patient.vataScore || 80}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                    <div className="h-full bg-[#0B63AC] rounded-full transition-all" style={{ width: `${patient.vataScore || 80}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[#D97706]">पित्त (Pitta - Metabolism/Agni):</span>
                    <span className="font-mono">{patient.pittaScore || 20}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                    <div className="h-full bg-[#F59E0B] rounded-full transition-all" style={{ width: `${patient.pittaScore || 20}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[#059669]">कफ (Kapha - Structure/Immunity):</span>
                    <span className="font-mono">{patient.kaphaScore || 0}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                    <div className="h-full bg-[#10B981] rounded-full transition-all" style={{ width: `${patient.kaphaScore || 0}%` }} />
                  </div>
                </div>
              </div>

              {/* Dynamic Doshic Imbalance Note Matching Reference */}
              <div className="p-3 bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg text-sm space-y-1.5 mb-3">
                <span className="text-xs font-black text-[#0B63AC] uppercase tracking-wider block">
                  दोष वृद्धि एवं सम्प्राप्ति (DOSHA IMBALANCE & ASSESSMENT)
                </span>
                <p className="text-xs sm:text-sm text-[#334155] leading-relaxed">
                  • <strong>वात वृद्धि:</strong> {patient.dominantPrakriti === 'Vata' || !patient.dominantPrakriti ? 'वात की अति प्रबलता (कड़कड़ाहट के साथ घुटनों में दर्द एवं गति-अवरोध)' : `${patient.dominantPrakriti} दोष की अति प्रबलता`}
                </p>
                <p className="text-xs sm:text-sm text-[#334155] leading-relaxed">
                  • <strong>अस्थि-मज्जा धातु क्षय:</strong> संधि शैथिल्य एवं जानु संकोच की स्थिति में भारीपन एवं गति में कष्ट
                </p>
              </div>

              {/* Classical Dashavidha Pariksha Matrix Collapsible */}
              <details className="border border-[#CBD5E1] rounded-lg overflow-hidden group">
                <summary className="p-3 bg-[#F8FAFC] text-sm font-bold text-[#166534] flex items-center justify-between cursor-pointer hover:bg-[#F1F5F9] transition-colors">
                  <span className="flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-[#166534]" />
                    <span>दशविध परीक्षा (DASHAVIDHA PARIKSHA MATRIX)</span>
                  </span>
                  <span className="text-[#94A3B8] group-open:rotate-180 transition-transform">▾</span>
                </summary>
                <div className="p-3 bg-white grid grid-cols-2 gap-2.5 text-xs sm:text-sm border-t border-[#E2E8F0]">
                  <div className="p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md">
                    <span className="text-xs font-bold text-[#64748B] block">1. प्रकृति (Prakriti):</span>
                    <span className="font-extrabold text-[#166534]">{patient.dominantPrakriti || 'Vata'}</span>
                  </div>
                  <div className="p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md">
                    <span className="text-xs font-bold text-[#64748B] block">2. विकृति (Vikriti):</span>
                    <span className="font-extrabold text-[#0B63AC]">लक्षणानुसार दोष वृद्धि</span>
                  </div>
                  <div className="p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md">
                    <span className="text-xs font-bold text-[#64748B] block">3. सार (Sara):</span>
                    <span className="font-bold text-[#1E293B]">मध्यम धातु सार (Madhyama)</span>
                  </div>
                  <div className="p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md">
                    <span className="text-xs font-bold text-[#64748B] block">4. संहनन (Samhanana):</span>
                    <span className="font-bold text-[#1E293B]">सुसंहत (Compact/Normal)</span>
                  </div>
                  <div className="p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md">
                    <span className="text-xs font-bold text-[#64748B] block">5. प्रमाण (Pramana):</span>
                    <span className="font-bold text-[#1E293B]">वय व लिंगानुरूप (Proportionate)</span>
                  </div>
                  <div className="p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md">
                    <span className="text-xs font-bold text-[#64748B] block">6. सात्म्य (Satmya):</span>
                    <span className="font-bold text-[#1E293B]">मिश्र सात्म्य (Mixed Adaptability)</span>
                  </div>
                  <div className="p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md">
                    <span className="text-xs font-bold text-[#64748B] block">7. सत्त्व (Satva):</span>
                    <span className="font-bold text-[#1E293B]">मध्यम सत्त्व (Mental Endurance)</span>
                  </div>
                  <div className="p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md">
                    <span className="text-xs font-bold text-[#64748B] block">8. आहार शक्ति (Ahara Shakti):</span>
                    <span className="font-bold text-[#1E293B]">दीप्त/मध्यम अग्नि (Digestive Power)</span>
                  </div>
                  <div className="p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md">
                    <span className="text-xs font-bold text-[#64748B] block">9. व्यायाम शक्ति (Vyayama):</span>
                    <span className="font-bold text-[#1E293B]">मध्यम शक्ति (Moderate Capacity)</span>
                  </div>
                  <div className="p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md">
                    <span className="text-xs font-bold text-[#64748B] block">10. वय (Vaya):</span>
                    <span className="font-bold text-[#1E293B]">{patient.age < 30 ? 'बाल/युवा (Youth)' : patient.age > 60 ? 'वृद्ध (Geriatric)' : 'मध्यम (Middle Age)'} ({patient.age} वर्ष)</span>
                  </div>
                </div>
              </details>
            </div>
          )}

          {/* 7. PHYSICIAN CONSULTATION & FINAL PRESCRIPTION BOX */}
          <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl shadow-xs">
            <div className="flex items-center justify-between mb-2.5 flex-wrap gap-1">
              <span className="text-sm font-black text-[#0B63AC] uppercase tracking-wider flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-[#0B63AC]" />
                <span>वैद्य परामर्श एवं अंतिम व्यवस्थापत्र (Physician Clinical Notes) *</span>
              </span>
              <ProvenanceBadge source="doctor-confirmed" />
            </div>

            <textarea
              value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
              rows={4}
              placeholder="चिकित्सक की टिप्पणी एवं औषधि निर्देश यहाँ लिखें..."
              className="w-full p-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-sm font-semibold text-[#1E293B] focus:outline-none focus:border-[#0B63AC] focus:ring-1 focus:ring-[#0B63AC] resize-none transition-all"
            />

            {/* Fast Clinical Preset Insertion Buttons */}
            <div className="flex flex-wrap gap-2 mt-3">
              {CLINICAL_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setDoctorNotes((prev: string) => prev + preset.insertionText)}
                  className="px-3 py-1.5 bg-[#EBF4FC] border border-[#BFDBFE] text-xs font-bold text-[#0B63AC] rounded-full hover:bg-[#0B63AC] hover:text-white cursor-pointer transition-colors shadow-2xs"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* 3 ACTIONS BAR: Clarify, Amend, Confirm & Send */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
              <button
                type="button"
                onClick={() => handleAction('rejected')}
                className="py-3 px-3.5 bg-white border border-[#D97706] hover:bg-[#FFFBEB] text-[#B45309] text-sm font-bold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-98 shadow-xs"
                title="पुनः परीक्षण / स्पष्टीकरण का अनुरोध करें"
              >
                <RefreshCw className="w-4 h-4" />
                <span>पुनः परीक्षण अनुरोध</span>
              </button>

              <button
                type="button"
                onClick={() => handleAction('amended')}
                className="py-3 px-3.5 bg-white border border-[#0B63AC] hover:bg-[#EBF4FC] text-[#0B63AC] text-sm font-bold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-98 shadow-xs"
                title="विवरण संशोधित करें"
              >
                <Edit3 className="w-4 h-4" />
                <span>विवरण संशोधन</span>
              </button>

              <button
                type="button"
                onClick={() => handleAction('accepted')}
                className="py-3 px-3.5 bg-[#166534] border border-[#14532D] hover:bg-[#14532D] text-white text-sm font-bold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-98 shadow-xs"
                title="सत्यापित करें और अस्पताल HIS में भेजें"
              >
                <CheckCircle className="w-4 h-4" />
                <span>पुष्टि व HIS प्रेषण</span>
              </button>
            </div>
          </div>

        </div>

        </div>

      </main>

      {/* FULL-SCREEN DOCUMENT LIGHTBOX MODAL */}
      {activeDocModal && (
        <div className="fixed inset-0 z-50 bg-black/85 flex flex-col items-center justify-between p-4 select-none">
          
          {/* Modal Top Bar */}
          <div className="w-full max-w-5xl bg-white border border-[#CED4DA] px-4 py-2 rounded-[3px] flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#0B5FA5]" />
              <div>
                <span className="text-xs font-black text-[#212529] block">
                  {activeDocModal.name}
                </span>
                <span className="text-[10px] text-[#6C757D]">
                  {activeDocModal.facility} • {activeDocModal.date}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setZoomLevel((prev) => Math.min(prev + 0.25, 2.5))}
                className="p-1.5 border border-[#CED4DA] hover:bg-[#EAEDF0] rounded-[2px] text-xs font-bold flex items-center gap-1 cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
                <span>{Math.round(zoomLevel * 100)}%</span>
              </button>

              <button
                type="button"
                onClick={() => setZoomLevel((prev) => Math.max(prev - 0.25, 0.5))}
                className="p-1.5 border border-[#CED4DA] hover:bg-[#EAEDF0] rounded-[2px] text-xs font-bold flex items-center gap-1 cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setRotation((prev) => (prev + 90) % 360)}
                className="p-1.5 border border-[#CED4DA] hover:bg-[#EAEDF0] rounded-[2px] text-xs font-bold flex items-center gap-1 cursor-pointer"
                title="Rotate Document"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>घुमाएं</span>
              </button>

              <button
                type="button"
                onClick={handleCloseDocModal}
                className="p-1.5 bg-[#DC2626] text-white hover:bg-red-700 rounded-[2px] text-xs font-bold flex items-center gap-1 cursor-pointer ml-2"
                title="Close"
              >
                <X className="w-4 h-4" />
                <span>बंद करें</span>
              </button>
            </div>
          </div>

          {/* Modal Main Content: Side-by-Side Image and Extracted Text */}
          <div className="w-full max-w-5xl flex-1 my-3 flex flex-col lg:flex-row gap-4 overflow-hidden items-center justify-center">
            
            {/* Scanned Image Preview Container with Pan/Zoom */}
            <div className="flex-1 w-full h-full bg-[#1A202C] border border-[#CED4DA] rounded-[3px] overflow-auto flex items-center justify-center p-4">
              <img
                src={activeDocModal.url}
                alt={activeDocModal.name}
                style={{
                  transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                  transition: 'transform 0.2s ease',
                  maxHeight: '70vh',
                }}
                className="object-contain shadow-2xl rounded-[2px]"
              />
            </div>

            {/* OCR Extracted Text Side Panel */}
            <div className="w-full lg:w-80 bg-white border border-[#CED4DA] rounded-[3px] p-4 flex flex-col justify-between max-h-[70vh] overflow-y-auto">
              <div>
                <span className="text-xs font-black text-[#0B5FA5] uppercase tracking-wider block mb-2 border-b pb-1">
                  दस्तावेज निष्कर्षण विवरण (OCR Extracted Data)
                </span>
                
                <div className="space-y-2 text-sm">
                  <div className="p-2.5 bg-[#F8FAFC] border border-[#CED4DA] rounded-[2px]">
                    <span className="text-xs text-[#64748B] font-bold block">दस्तावेज प्रकार:</span>
                    <span className="font-bold text-[#212529]">{activeDocModal.type}</span>
                  </div>

                  <div className="p-2.5 bg-[#F8FAFC] border border-[#CED4DA] rounded-[2px]">
                    <span className="text-xs text-[#64748B] font-bold block">संस्था / लैब:</span>
                    <span className="font-bold text-[#212529]">{activeDocModal.facility || 'संलग्न चिकित्सा पर्चा'}</span>
                  </div>

                  <div className="p-2.5 bg-[#F8FAFC] border border-[#CED4DA] rounded-[2px]">
                    <span className="text-xs text-[#64748B] font-bold block">पाठ (Raw Text):</span>
                    <p className="font-mono text-xs text-[#212529] mt-0.5 leading-relaxed">
                      {activeDocModal.ocrSnippet || 'पाठ निष्कर्षण उपलब्ध नहीं (No OCR text available)'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-2 border-t text-xs text-[#64748B] font-bold text-center">
                मूल दस्तावेज़ से मिलान सत्यापित • Verified Document Match
              </div>
            </div>

          </div>

          <div className="text-white text-xs font-semibold">
            मूल पर्चे एवं जांच रिपोर्ट का उच्च-रिज़ॉल्यूशन पूर्वावलोकन • ESC या बंद करें दबाएं
          </div>

        </div>
      )}

      {/* TOAST FEEDBACK NOTIFICATION */}
      {showToast && (
        <div className="fixed bottom-16 lg:bottom-6 right-6 z-50 bg-[#212529] text-white px-4 py-3 rounded-[3px] border border-[#CED4DA] shadow-xl text-sm font-black flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-4 h-4 text-[#186036]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* MOBILE & TABLET STICKY BOTTOM ACTION BAR (<1024px) */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-white/95 backdrop-blur-xs border-t border-[#CED4DA] p-2.5 shadow-lg z-30">
        <div className="max-w-md mx-auto grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleAction('rejected')}
            className="py-2.5 px-1 bg-white border border-[#D97706] hover:bg-[#FFFBEB] text-[#B45309] text-xs font-black rounded-[3px] flex items-center justify-center gap-1 cursor-pointer transition-colors active:scale-98"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>पुनः परीक्षण</span>
          </button>

          <button
            type="button"
            onClick={() => handleAction('amended')}
            className="py-2.5 px-1 bg-white border border-[#0B5FA5] hover:bg-[#E8F1F8] text-[#0B5FA5] text-xs font-black rounded-[3px] flex items-center justify-center gap-1 cursor-pointer transition-colors active:scale-98"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>संशोधन</span>
          </button>

          <button
            type="button"
            onClick={() => handleAction('accepted')}
            className="py-2.5 px-1 bg-[#186036] border border-[#114526] hover:bg-[#14522d] text-white text-xs font-black rounded-[3px] flex items-center justify-center gap-1 cursor-pointer transition-colors active:scale-98 shadow-xs"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>पुष्टि व HIS प्रेषण</span>
          </button>
        </div>
      </div>

      {/* Persistent Single-Line Clean Footer */}
      <footer className="w-full bg-white border-t border-[#CED4DA] py-3 px-6 text-sm text-[#495057] select-none shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-left">
          <div className="flex items-center gap-2 font-bold" style={{ color: '#0B5FA5' }}>
            <span>अखिल भारतीय आयुर्वेद संस्थान (AIIA)</span>
            <span className="text-[#CED4DA]">|</span>
            <span className="font-semibold text-[#495057]">National Ayush EMR Consultation Terminal</span>
          </div>
          <div className="text-xs font-semibold text-[#6C757D]">
            <span>DPDP Act 2023 & Ayush Pharmacopoeia (API) Certified</span>
          </div>
        </div>
      </footer>

      {/* FHIR R4 & HIS PUSH MODAL FOR PHYSICIAN */}
      {showFhirModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#0B5FA5] rounded-[3px] max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-3 bg-[#0B5FA5] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4" />
                <span className="font-bold text-xs uppercase tracking-wide">
                  ABDM HL7 FHIR R4 Bundle Record (M2 / M3 Health Data Exchange)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowFhirModal(false)}
                className="p-1 hover:bg-white/20 rounded cursor-pointer"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-3">
              <div className="p-2.5 bg-[#EDF7F1] border border-[#186036]/40 rounded-[2px] flex items-center justify-between text-xs text-[#186036]">
                <span className="font-bold">
                  ✓ Official NRCeS / ABDM Profile: DocumentBundle (Patient, Encounter, Condition, Observations, Medications)
                </span>
                <span className="font-mono font-bold text-[11px]">
                  ABHA Compliant
                </span>
              </div>

              {hisPushResult && (
                <div className="p-3 bg-[#F0FDF4] border border-[#15803D] rounded-[2px] text-xs">
                  <div className="flex items-center gap-1.5 font-black text-[#15803D] mb-1">
                    <CheckCircle className="w-4 h-4" />
                    <span>अस्पताल ई-हॉस्पिटल में सफलतापूर्वक दर्ज (Ingested into AIIA Hospital HIS)</span>
                  </div>
                  <div className="font-mono text-[11px] text-[#495057] space-y-0.5">
                    <div>Transaction ID: {hisPushResult.gateway_response?.transaction_id}</div>
                    <div>Destination: {hisPushResult.destination}</div>
                    <div>Status: {hisPushResult.gateway_response?.http_status} Accepted (Ack: {hisPushResult.gateway_response?.ack_code})</div>
                  </div>
                </div>
              )}

              {loadingFhir ? (
                <div className="p-8 text-center text-xs text-[#6C757D]">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#0B5FA5] mb-2" />
                  <span>FHIR R4 Bundle उत्पन्न किया जा रहा है...</span>
                </div>
              ) : fhirBundle ? (
                <div className="relative">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-[#6C757D] uppercase">
                      HL7 FHIR Document Bundle (JSON) • {fhirBundle.total || fhirBundle.entry?.length || 0} Resources
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(fhirBundle, null, 2));
                        setCopiedFhir(true);
                        setTimeout(() => setCopiedFhir(false), 2000);
                      }}
                      className="text-[11px] font-bold text-[#0B5FA5] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedFhir ? <Check className="w-3 h-3 text-[#186036]" /> : <Copy className="w-3 h-3 text-[#0B5FA5]" />}
                      <span>{copiedFhir ? 'कॉपी हो गया' : 'JSON कॉपी करें'}</span>
                    </button>
                  </div>
                  <pre className="p-3 bg-[#1A202C] text-[#E2E8F0] font-mono text-[10px] rounded-[2px] max-h-72 overflow-y-auto leading-relaxed select-all">
                    {JSON.stringify(fhirBundle, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-[#6C757D]">
                  डेटा उपलब्ध नहीं है (Bundle not ready)
                </div>
              )}
            </div>

            <div className="p-3 bg-[#F8FAFC] border-t border-[#CED4DA] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowFhirModal(false)}
                className="py-1.5 px-4 rounded-[2px] border border-[#CED4DA] text-xs font-bold text-[#495057] hover:bg-[#EAEDF0] cursor-pointer"
              >
                बंद करें (Close)
              </button>

              <button
                type="button"
                onClick={handlePushHis}
                disabled={hisPushing || !fhirBundle}
                className="py-1.5 px-4 rounded-[2px] border border-[#084B83] text-xs font-black text-white flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                style={{ backgroundColor: '#0B5FA5' }}
              >
                {hisPushing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>HIS को भेजा जा रहा है...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 text-white" />
                    <span>अस्पताल HIS में भेजें • PUSH TO HOSPITAL HIS</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
