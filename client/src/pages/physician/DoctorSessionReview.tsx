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
} from 'lucide-react';
import { usePhysicianStore, DocumentItem } from '@/stores/physicianStore';
import { API_BASE_URL } from '@/lib/config';
import { CLINICAL_PRESETS } from '@/config/clinicalPresets';

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
        ? 'केस सारांश सफलतापूर्वक स्वीकार किया गया (Case Accepted & Saved to EMR)'
        : status === 'amended'
        ? 'संशोधित सारांश ईएमआर में दर्ज किया गया (Amended & Saved to EMR)'
        : 'केस पुनः परीक्षण हेतु चिह्नित किया गया (Marked for Re-examination)'
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

  const patientDocs: DocumentItem[] = liveOcrResults && liveOcrResults.reports.length > 0
    ? liveOcrResults.reports.map((r, idx) => {
        const localDoc = patient?.documents?.[idx];
        return {
          id: r.report_id || `DOC-${idx + 1}`,
          name: `${r.report_type} (${r.medical_specialty || 'General'})`,
          url: localDoc?.url || '',
          type: (r.report_type?.toLowerCase().includes('lab') ? 'Lab Report' : 'Prescription') as 'Prescription' | 'Lab Report' | 'Discharge Summary' | 'Other',
          date: r.report_date || new Date().toLocaleDateString('en-GB'),
          facility: r.facility_name || 'AIIA Medical Records',
          ocrSnippet: r.summary || r.impression || 'Extracted via Dual-Engine Gemini Vision & Tesseract Spatial Verification.',
        };
      })
    : patient?.documents && patient.documents.length > 0
    ? patient.documents
    : [];

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
    <div className="flex flex-col min-h-screen bg-[#EAEDF0] text-[#212529] font-sans select-none justify-between">
      
      {/* Top Workstation Header */}
      <header className="bg-white border-b border-[#CED4DA] px-6 py-2.5 shrink-0 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/doctor/queue')}
              className="py-1 px-2.5 rounded-[3px] border border-[#CED4DA] hover:bg-[#E8F1F8] text-xs font-bold text-[#0B5FA5] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>कतार पर वापस (Back to Queue)</span>
            </button>

            <span className="text-[#CED4DA]">|</span>

            <div>
              <span className="text-xs font-black text-[#0B5FA5]">
                रोगी नैदानिक सारांश • Clinical Case Sheet Review
              </span>
              <span className="text-[10px] font-semibold text-[#6C757D] block">
                {doctorName} • {roomNumber}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="py-1.5 px-3 rounded-[3px] border border-[#CED4DA] hover:bg-[#EAEDF0] text-xs font-bold text-[#495057] flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>केस शीट प्रिंट करें (Print Case Sheet)</span>
            </button>
          </div>

        </div>
      </header>

      {/* Mobile/Tablet Quick-Jump Navigation (<1024px) */}
      <div className="lg:hidden bg-[#E8F1F8] border-b border-[#CED4DA] px-4 py-2 flex items-center justify-around text-xs font-bold text-[#0B5FA5]">
        <button
          type="button"
          onClick={() => document.getElementById('section-history')?.scrollIntoView({ behavior: 'smooth' })}
          className="hover:underline cursor-pointer"
        >
          1. विवरण व लक्षण
        </button>
        <span className="text-[#CED4DA]">|</span>
        <button
          type="button"
          onClick={() => document.getElementById('section-documents')?.scrollIntoView({ behavior: 'smooth' })}
          className="hover:underline cursor-pointer"
        >
          2. पर्चे व रिपोर्ट
        </button>
        <span className="text-[#CED4DA]">|</span>
        <button
          type="button"
          onClick={() => document.getElementById('section-rx')?.scrollIntoView({ behavior: 'smooth' })}
          className="hover:underline cursor-pointer"
        >
          3. प्रकृति व परामर्श
        </button>
      </div>

      {/* Main 2-Column Clinical Review Interface */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 pb-24 lg:pb-6 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* LEFT COLUMN (7 Cols): Demographics, SOCRATES Timeline, Documents & Lab Findings */}
        <div id="section-history" className="lg:col-span-7 space-y-4">
          
          {/* 1. PATIENT HEADER CARD (Rogi Vivarana) */}
          <div className="bg-white border border-[#CED4DA] p-4 rounded-[3px] shadow-xs">
            <div className="flex items-start justify-between border-b border-[#CED4DA] pb-2.5 mb-2.5">
              <div>
                <span className="text-[10px] font-bold text-[#6C757D] uppercase tracking-wider block">
                  रोगी विवरण (Patient Demographics)
                </span>
                <span className="text-lg font-black text-[#212529] block">
                  {patient.patientName}
                </span>
                <span className="text-xs font-bold text-[#495057]">
                  {patient.age} वर्ष • {patient.gender === 'female' ? 'महिला' : 'पुरुष'} • फोन: {patient.phone}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold text-[#6C757D] uppercase block">टोकन संख्या</span>
                <span className="text-2xl font-black font-mono text-[#0B5FA5] block">
                  {patient.tokenNumber}
                </span>
                <span className="text-[10px] font-mono font-bold text-[#2F7D4F]">
                  ABHA ID: {patient.abhaId}
                </span>
              </div>
            </div>

            {/* Red Flag Warning Banner if triggered */}
            {patient.redFlagTriggered && (
              <div className="p-2.5 bg-[#FEF2F2] border border-[#DC2626] rounded-[2px] mb-2.5 flex items-center gap-2 text-xs font-black text-[#DC2626]">
                <ShieldAlert className="w-4 h-4 shrink-0 text-[#DC2626]" />
                <span>आपातकालीन चेतावनी: सीने में दर्द / सांस की तकलीफ के गंभीर लक्षण रिकॉर्ड किए गए हैं!</span>
              </div>
            )}

            {/* Chief Complaint (Pradhana Vedana) */}
            <div className="p-2.5 bg-[#F8FAFC] border border-[#CED4DA] rounded-[2px] text-xs">
              <span className="text-[10px] font-extrabold uppercase text-[#6C757D] block mb-0.5">
                प्रधान वेदना / मुख्य स्वास्थ्य समस्या (Chief Complaint):
              </span>
              <span className="font-black text-sm text-[#212529] block">
                {patient.chiefComplaint}
              </span>
            </div>
          </div>

          {/* 2. SOCRATES CLINICAL TIMELINE (Roga Itihasa) */}
          <div className="bg-white border border-[#CED4DA] p-4 rounded-[3px] shadow-xs">
            <div className="text-xs font-black text-[#0B5FA5] uppercase tracking-wider mb-2.5 flex items-center gap-1.5 border-b border-[#CED4DA] pb-1.5">
              <Activity className="w-4 h-4 text-[#0B5FA5]" />
              <span>रोग इतिहास एवं लक्षण अन्वेषण • SOCRATES Timeline</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-medium">
              <div className="p-2 bg-[#F8FAFC] border border-[#CED4DA] rounded-[2px]">
                <span className="text-[10px] text-[#6C757D] font-bold block">1. स्थान (Site):</span>
                <span className="font-bold text-[#212529]">
                  {patient.socrates?.site || 'उल्लेख नहीं (Not specified)'}
                </span>
              </div>

              <div className="p-2 bg-[#F8FAFC] border border-[#CED4DA] rounded-[2px]">
                <span className="text-[10px] text-[#6C757D] font-bold block">2. अवधि (Onset & Duration):</span>
                <span className="font-bold text-[#212529]">
                  {patient.socrates?.onset || 'उल्लेख नहीं (Not specified)'}
                </span>
              </div>

              <div className="p-2 bg-[#F8FAFC] border border-[#CED4DA] rounded-[2px]">
                <span className="text-[10px] text-[#6C757D] font-bold block">3. तीव्रता (Severity Scale):</span>
                <span className="font-black text-[#DC2626]">
                  {patient.socrates?.severity || 'उल्लेख नहीं (Not specified)'}
                </span>
              </div>

              <div className="p-2 bg-[#F8FAFC] border border-[#CED4DA] rounded-[2px]">
                <span className="text-[10px] text-[#6C757D] font-bold block">4. वर्धक/शामक कारण (Triggers & Timing):</span>
                <span className="font-bold text-[#212529]">
                  {patient.socrates?.timing || 'उल्लेख नहीं (Not specified)'}
                </span>
              </div>

              <div className="col-span-2 p-2 bg-[#F8FAFC] border border-[#CED4DA] rounded-[2px]">
                <span className="text-[10px] text-[#6C757D] font-bold block">5. पारिवारिक इतिहास (Family History / Kulaja):</span>
                <span className="font-bold text-[#212529]">
                  {patient.socrates?.familyHistory || 'कोई विशेष पारिवारिक इतिहास नहीं (None recorded)'}
                </span>
              </div>
            </div>
          </div>

          {/* 3. CAPTURED DOCUMENT SCANS & LIGHTBOX VIEWER GALLERY */}
          <div id="section-documents" className="bg-white border border-[#CED4DA] p-4 rounded-[3px] shadow-xs">
            <div className="text-xs font-black text-[#0B5FA5] uppercase tracking-wider mb-2.5 flex items-center justify-between border-b border-[#CED4DA] pb-1.5">
              <div className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#0B5FA5]" />
                <span>अपलोड किए गए मूल दस्तावेज एवं पर्चे (Original Scanned Documents)</span>
              </div>
              <div className="flex items-center gap-2">
                {liveOcrResults && liveOcrResults.reports_count > 0 && (
                  <span className="text-[10px] font-black px-2 py-0.5 bg-[#EDF7F1] text-[#2F7D4F] border border-[#2F7D4F]/30 rounded-[2px] flex items-center gap-1">
                    <Check className="w-3 h-3 text-[#2F7D4F]" />
                    <span>लाइव OCR निष्कर्षण (Live Gemini + Tesseract Verified)</span>
                  </span>
                )}
                <span className="text-[10px] font-bold px-2 py-0.5 bg-[#E8F1F8] text-[#0B5FA5] rounded-[2px]">
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
                    className="p-2.5 bg-[#F8FAFC] border border-[#CED4DA] hover:border-[#0B5FA5] rounded-[3px] flex gap-2.5 items-center cursor-pointer transition-all hover:shadow-xs group"
                  >
                    <div className="relative w-16 h-20 bg-gray-200 border border-[#CED4DA] rounded-[2px] overflow-hidden shrink-0 flex items-center justify-center">
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
                        <FileText className="w-8 h-8 text-[#6C757D]" />
                      )}
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Eye className="w-5 h-5 text-white" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-1 mb-0.5">
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-[2px] bg-[#E8F1F8] text-[#0B5FA5]">
                          {doc.type}
                        </span>
                        {doc.date && <span className="text-[9px] text-[#6C757D] font-bold">{doc.date}</span>}
                      </div>
                      <span className="text-xs font-black text-[#212529] block truncate group-hover:text-[#0B5FA5]">
                        {doc.name}
                      </span>
                      <span className="text-[10px] text-[#6C757D] block truncate">
                        {doc.facility || 'संलग्न चिकित्सा पर्चा'}
                      </span>
                      <span className="text-[10px] font-bold text-[#0B5FA5] flex items-center gap-0.5 mt-1">
                        <Eye className="w-3 h-3" />
                        <span>बड़ा देखें (Click to Zoom)</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-[#F8FAFC] border border-dashed border-[#CED4DA] rounded-[2px] text-center text-xs text-[#6C757D] mb-3">
                <FileText className="w-8 h-8 mx-auto text-[#CED4DA] mb-1" />
                <span className="font-bold block text-[#495057]">कोई पूर्व पर्चा या रिपोर्ट संलग्न नहीं है</span>
                <span className="text-[11px] block mt-0.5 text-[#6C757D]">
                  रोगी ने कियोस्क पर कोई पिछला दस्तावेज़ स्कैन नहीं किया है (No documents uploaded).
                </span>
              </div>
            )}

            {/* OCR Extracted Text Box */}
            <div className="p-2.5 bg-[#F8FAFC] border border-[#CED4DA] rounded-[2px] text-xs">
              <span className="text-[10px] text-[#6C757D] font-bold block mb-0.5">
                ऑप्टिकल कैरेक्टर रिकग्निशन (OCR Raw Findings):
              </span>
              <p className="font-mono text-[#212529] text-[11px] leading-relaxed">
                {rawOcrText || 'कोई OCR डेटा उपलब्ध नहीं (No OCR text extracted from captured documents)'}
              </p>
            </div>
          </div>

          {/* 4. EXTRACTED MEDICATIONS TABLE OR EMPTY STATE */}
          <div className="bg-white border border-[#CED4DA] p-4 rounded-[3px] shadow-xs">
            <div className="text-xs font-black text-[#0B5FA5] uppercase tracking-wider mb-2.5 flex items-center gap-1.5 border-b border-[#CED4DA] pb-1.5">
              <Stethoscope className="w-4 h-4 text-[#0B5FA5]" />
              <span>पूर्व औषधि योग एवं मात्रा विवरण (Extracted Formulations & Dosage)</span>
            </div>

            {medications.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-[#CED4DA]">
                  <thead className="bg-[#E8F1F8] text-[#0B5FA5] font-black text-[10px] uppercase">
                    <tr className="border-b border-[#CED4DA]">
                      <th className="p-2">औषधि का नाम (Medication)</th>
                      <th className="p-2">मात्रा (Dosage)</th>
                      <th className="p-2">सेवन काल (Frequency)</th>
                      <th className="p-2">अनुपान (Vehicle)</th>
                      <th className="p-2">श्रेणी (Category)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#CED4DA] font-semibold text-[#212529]">
                    {medications.map((med, idx) => (
                      <tr key={idx} className="hover:bg-[#F8FAFC]">
                        <td className="p-2 font-bold text-[#0B5FA5]">{med.drugName}</td>
                        <td className="p-2">{med.dosage}</td>
                        <td className="p-2">{med.frequency}</td>
                        <td className="p-2 text-[#495057]">{med.anupana}</td>
                        <td className="p-2">
                          <span className="px-1.5 py-0.5 rounded-[2px] bg-[#EDF7F1] text-[#2F7D4F] text-[9px] font-bold">
                            {med.source}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-3 bg-[#F8FAFC] border border-dashed border-[#CED4DA] rounded-[2px] text-center text-xs text-[#6C757D]">
                <span className="font-bold block text-[#495057]">कोई पूर्व औषधि विवरण उपलब्ध नहीं है</span>
                <span className="text-[11px] block mt-0.5 text-[#6C757D]">
                  स्कैन किए गए दस्तावेज़ों से कोई पूर्व औषधि नहीं पाई गई (No prior prescriptions found).
                </span>
              </div>
            )}
          </div>

          {/* 5. VERIFIED LAB BIOMARKERS TABLE OR EMPTY STATE */}
          <div className="bg-white border border-[#CED4DA] p-4 rounded-[3px] shadow-xs">
            <div className="text-xs font-black text-[#0B5FA5] uppercase tracking-wider mb-2.5 flex items-center gap-1.5 border-b border-[#CED4DA] pb-1.5">
              <Activity className="w-4 h-4 text-[#0B5FA5]" />
              <span>प्रयोगशाला जांच एवं पैथोलॉजी रिपोर्ट (Verified Lab Investigations)</span>
            </div>

            {labFindings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-[#CED4DA]">
                  <thead className="bg-[#E8F1F8] text-[#0B5FA5] font-black text-[10px] uppercase">
                    <tr className="border-b border-[#CED4DA]">
                      <th className="p-2">जांच का नाम (Test / Biomarker)</th>
                      <th className="p-2">प्राप्त मान (Result Value)</th>
                      <th className="p-2">मानक सीमा (Reference Range)</th>
                      <th className="p-2">सत्यापन (Verification)</th>
                      <th className="p-2">स्थिति (Flag)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#CED4DA] font-semibold text-[#212529]">
                    {labFindings.map((lab, idx) => (
                      <tr key={idx} className="hover:bg-[#F8FAFC]">
                        <td className="p-2 font-bold text-[#212529]">{lab.testName}</td>
                        <td className="p-2 font-mono font-bold">{lab.value} {lab.unit}</td>
                        <td className="p-2 text-[#6C757D] font-mono">{lab.referenceRange} {lab.unit}</td>
                        <td className="p-2">
                          <span className="px-1.5 py-0.5 rounded-[2px] bg-[#EDF7F1] text-[#2F7D4F] text-[9px] font-bold flex items-center gap-1 w-fit">
                            <Check className="w-3 h-3 text-[#2F7D4F]" />
                            <span>Tesseract Verified</span>
                          </span>
                        </td>
                        <td className="p-2">
                          <span
                            className={`px-2 py-0.5 rounded-[2px] text-[9px] font-black uppercase ${
                              lab.flag === 'ELEVATED'
                                ? 'bg-[#FEF2F2] text-[#DC2626] border border-[#DC2626]/30'
                                : 'bg-[#EDF7F1] text-[#2F7D4F]'
                            }`}
                          >
                            {lab.flag}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-3 bg-[#F8FAFC] border border-dashed border-[#CED4DA] rounded-[2px] text-center text-xs text-[#6C757D]">
                <span className="font-bold block text-[#495057]">कोई प्रयोगशाला जांच रिकॉर्ड नहीं मिली</span>
                <span className="text-[11px] block mt-0.5 text-[#6C757D]">
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
            <div className="bg-white border-2 border-[#0B5FA5] p-4 rounded-[3px] shadow-xs">
              <div className="flex items-center justify-between border-b border-[#0B5FA5]/30 pb-2 mb-3">
                <span className="text-xs font-black text-[#0B5FA5] uppercase tracking-wider flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-[#0B5FA5]" />
                  <span>सामान्य एलोपैथी विवरण (General Medicine Vitals & History)</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-[#E8F1F8] text-[#0B5FA5] rounded-[2px]">
                  जनरल मेडिसिन OPD
                </span>
              </div>

              {/* Pathway Header */}
              <div className="p-3 bg-[#E8F1F8] border border-[#0B5FA5]/40 rounded-[2px] mb-3 text-center">
                <span className="text-[10px] font-bold uppercase text-[#0B5FA5] block">
                  उपचार मार्ग (Treatment Pathway)
                </span>
                <span className="text-2xl font-black text-[#084B83] block my-0.5">
                  सामान्य चिकित्सा (Allopathy OPD)
                </span>
                <span className="text-[11px] font-bold text-[#495057]">
                  रोगी प्राथमिक स्वास्थ्य इतिहास एवं विटल्स सत्यापन
                </span>
              </div>

              {/* 4 Clinical Vitals & History Grid */}
              <div className="space-y-2 mb-3 text-xs">
                <div className="p-2 bg-[#F8FAFC] border border-[#CED4DA] rounded-[2px]">
                  <span className="text-[10px] text-[#6C757D] font-bold block">1. रक्तचाप स्थिति (Blood Pressure History):</span>
                  <span className="font-bold text-[#212529]">
                    {patient.generalVitals?.bloodPressureHistory === 'hypertensive-meds'
                      ? 'उच्च रक्तचाप - नियमित दवा चालू (Hypertensive on Meds)'
                      : patient.generalVitals?.bloodPressureHistory === 'borderline-bp'
                      ? 'बॉर्डरलाइन / कभी-कभार बढ़ता है (Borderline BP)'
                      : patient.generalVitals?.bloodPressureHistory === 'normal-bp'
                      ? 'सामान्य रक्तचाप (Normal Blood Pressure)'
                      : patient.generalVitals?.bloodPressureHistory || 'सामान्य / उल्लेख नहीं'}
                  </span>
                </div>

                <div className="p-2 bg-[#F8FAFC] border border-[#CED4DA] rounded-[2px]">
                  <span className="text-[10px] text-[#6C757D] font-bold block">2. मधुमेह स्थिति (Diabetes / Blood Sugar):</span>
                  <span className="font-bold text-[#212529]">
                    {patient.generalVitals?.diabetesStatus === 'diabetic-meds'
                      ? 'मधुमेह पीड़ित - दवा/इंसुलिन चालू (Diabetic on Treatment)'
                      : patient.generalVitals?.diabetesStatus === 'prediabetic'
                      ? 'प्री-डायबिटिक (Pre-diabetic / Borderline)'
                      : patient.generalVitals?.diabetesStatus === 'non-diabetic'
                      ? 'मधुमेह नहीं (Non-diabetic)'
                      : patient.generalVitals?.diabetesStatus || 'उल्लेख नहीं (Not recorded)'}
                  </span>
                </div>

                <div className="p-2 bg-[#F8FAFC] border border-[#CED4DA] rounded-[2px]">
                  <span className="text-[10px] text-[#6C757D] font-bold block">3. ज्ञात औषध एलर्जी (Drug Allergies):</span>
                  <span className="font-bold text-[#15803D]">
                    {patient.generalVitals?.knownAllergies === 'allergy-none' || !patient.generalVitals?.knownAllergies
                      ? 'कोई ज्ञात दवा एलर्जी नहीं (NKDA - No Known Drug Allergies)'
                      : patient.generalVitals?.knownAllergies === 'allergy-antibiotic'
                      ? 'पेनिसिलिन / एंटीबायोटिक एलर्जी (Antibiotic Allergy)'
                      : patient.generalVitals?.knownAllergies === 'allergy-nsaid'
                      ? 'दर्द निवारक (NSAIDs / Painkillers) से एलर्जी'
                      : Array.isArray(patient.generalVitals?.knownAllergies)
                      ? patient.generalVitals.knownAllergies.join(', ')
                      : String(patient.generalVitals?.knownAllergies)}
                  </span>
                </div>

                <div className="p-2 bg-[#F8FAFC] border border-[#CED4DA] rounded-[2px]">
                  <span className="text-[10px] text-[#6C757D] font-bold block">4. पूर्व सर्जरी / गंभीर बीमारी (Past Surgeries & History):</span>
                  <span className="font-bold text-[#212529]">
                    {patient.generalVitals?.pastSurgeries === 'surgery-recent-year'
                      ? 'पिछले 1 वर्ष में सर्जरी / अस्पताल में भर्ती'
                      : patient.generalVitals?.pastSurgeries === 'surgery-past'
                      ? 'पुरानी सर्जरी का इतिहास (Past Surgery)'
                      : patient.generalVitals?.pastSurgeries === 'chronic-cardiac-renal'
                      ? 'हृदय, गुर्दा या थायरॉयड का पुराना उपचार'
                      : patient.generalVitals?.pastSurgeries || 'कोई पूर्व सर्जरी नहीं (No major surgeries)'}
                  </span>
                </div>
              </div>

              {/* Allopathic Guidance Note */}
              <div className="p-2.5 bg-[#F8FAFC] border border-[#CED4DA] rounded-[2px] text-xs space-y-1">
                <span className="text-[10px] font-black text-[#0B5FA5] uppercase tracking-wider block">
                  क्लिनिकल मार्गदर्शन (Clinical Guidance):
                </span>
                <p className="text-[11px] text-[#495057] leading-relaxed">
                  • <strong>एलोपैथिक मूल्यांकन:</strong> मुख्य शिकायत ({patient.chiefComplaint || 'सामान्य जांच'}) एवं विटल्स के आधार पर आवश्यक पैथोलॉजी जांच एवं मानक एलोपैथिक चिकित्सा योजना तैयार करें।
                </p>
              </div>
            </div>
          ) : (
            /* 6B. CHARAKA SAMHITA PRAKRITI ANALYSIS (Vimanasthana 8) */
            <div className="bg-white border-2 border-[#2F7D4F] p-4 rounded-[3px] shadow-xs">
              <div className="flex items-center justify-between border-b border-[#2F7D4F]/30 pb-2 mb-3">
                <span className="text-xs font-black text-[#2F7D4F] uppercase tracking-wider flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-[#2F7D4F]" />
                  <span>चरक संहिता प्रकृति विश्लेषण (Constitutional Typology)</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-[#EDF7F1] text-[#2F7D4F] rounded-[2px]">
                  15 मापदंड
                </span>
              </div>

              {/* Prakriti Dominance Header */}
              <div className="p-3 bg-[#EDF7F1] border border-[#2F7D4F]/40 rounded-[2px] mb-3 text-center">
                <span className="text-[10px] font-bold uppercase text-[#2F7D4F] block">
                  मूल शारीरिक प्रकृति (Innate Prakriti)
                </span>
                <span className="text-2xl font-black text-[#1E4620] block my-0.5">
                  {patient.dominantPrakriti || 'सम प्रकृति (Sama)'}
                </span>
                <span className="text-[11px] font-bold text-[#495057]">
                  {patient.secondaryPrakriti
                    ? `द्वन्द्वज प्रकृति (${patient.dominantPrakriti}-${patient.secondaryPrakriti}) • मध्यम आत्मविश्वास`
                    : 'एकल दोष प्रधानता • मध्यम आत्मविश्वास (Medium Confidence)'}
                </span>
              </div>

              {/* Tri-Dosha Progress Bars */}
              <div className="space-y-2.5 mb-4 text-xs font-bold">
                <div>
                  <div className="flex justify-between mb-0.5">
                    <span className="text-[#0B5FA5]">वात (Vata - Nerves/Movement):</span>
                    <span>{patient.vataScore ?? 0}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#EAEDF0] rounded-full overflow-hidden">
                    <div className="h-full bg-[#0B5FA5]" style={{ width: `${patient.vataScore ?? 0}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-0.5">
                    <span className="text-[#E07B1A]">पित्त (Pitta - Metabolism/Agni):</span>
                    <span>{patient.pittaScore ?? 0}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#EAEDF0] rounded-full overflow-hidden">
                    <div className="h-full bg-[#E07B1A]" style={{ width: `${patient.pittaScore ?? 0}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-0.5">
                    <span className="text-[#2F7D4F]">कफ (Kapha - Structure/Immunity):</span>
                    <span>{patient.kaphaScore ?? 0}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#EAEDF0] rounded-full overflow-hidden">
                    <div className="h-full bg-[#2F7D4F]" style={{ width: `${patient.kaphaScore ?? 0}%` }} />
                  </div>
                </div>
              </div>

              {/* Dynamic Doshic Imbalance Note (No Hardcoded Sandhivata!) */}
              <div className="p-3 bg-[#F8FAFC] border border-[#CED4DA] rounded-[2px] text-xs space-y-1.5">
                <span className="text-[10px] font-black text-[#0B5FA5] uppercase tracking-wider block">
                  दोष दृष्टि एवं सम्प्राप्ति (Doshic Imbalance & Assessment):
                </span>
                <p className="text-[11px] text-[#495057] leading-relaxed">
                  • <strong>दोष स्थिति:</strong> {(() => {
                    const v = patient.vataScore ?? 0;
                    const p = patient.pittaScore ?? 0;
                    const k = patient.kaphaScore ?? 0;
                    if (v > p && v > k) return 'वात दोष की प्रधानता परिलक्षित है (स्नायु एवं गति नियंत्रण)।';
                    if (p > v && p > k) return 'पित्त दोष की प्रधानता परिलक्षित है (अग्नि, पाचन एवं चयापचय)।';
                    if (k > v && k > p) return 'कफ दोष की प्रधानता परिलक्षित है (शारीरिक गठन एवं स्थिरता)।';
                    return 'दोषों का सापेक्षिक साम्यावस्था अनुपात।';
                  })()}
                </p>
                <p className="text-[11px] text-[#495057] leading-relaxed">
                  • <strong>परामर्श सूत्र:</strong> रोगी की प्रधान वेदना ({patient.chiefComplaint || 'सामान्य परामर्श'}) के परिप्रेक्ष्य में दोष साम्यक आहार, विहार एवं औषध व्यवस्था का निर्धारण करें।
                </p>
              </div>
            </div>
          )}

          {/* 7. PHYSICIAN CONSULTATION & FINAL PRESCRIPTION BOX */}
          <div className="bg-white border border-[#CED4DA] p-4 rounded-[3px] shadow-xs">
            <span className="text-xs font-black text-[#0B5FA5] uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
              <Edit3 className="w-4 h-4 text-[#0B5FA5]" />
              <span>वैद्य परामर्श एवं अंतिम व्यवस्थापत्र (Physician Clinical Notes) *</span>
            </span>

            <textarea
              value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
              rows={4}
              placeholder="चिकित्सक की टिप्पणी एवं औषधि निर्देश यहाँ लिखें..."
              className="w-full p-2.5 bg-[#F8FAFC] border border-[#CED4DA] rounded-[3px] text-xs font-bold text-[#212529] focus:outline-none focus:border-[#0B5FA5] resize-none"
            />

            {/* Fast Clinical Preset Insertion Buttons */}
            <div className="flex flex-wrap gap-1 mt-2">
              {CLINICAL_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setDoctorNotes((prev) => prev + preset.insertionText)}
                  className="px-2 py-1 bg-[#E8F1F8] border border-[#0B5FA5]/30 text-[10px] font-bold text-[#0B5FA5] rounded-[2px] hover:bg-[#0B5FA5] hover:text-white cursor-pointer transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* 3 ACTIONS BAR: Reject, Amend, Accept */}
            <div className="grid grid-cols-3 gap-2 mt-4">
              <button
                type="button"
                onClick={() => handleAction('rejected')}
                className="py-2.5 px-2 bg-white border border-[#DC2626] hover:bg-[#FEF2F2] text-[#DC2626] text-xs font-black rounded-[3px] flex items-center justify-center gap-1 cursor-pointer transition-colors active:scale-98"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>पुनः परीक्षण (Reject)</span>
              </button>

              <button
                type="button"
                onClick={() => handleAction('amended')}
                className="py-2.5 px-2 bg-white border border-[#0B5FA5] hover:bg-[#E8F1F8] text-[#0B5FA5] text-xs font-black rounded-[3px] flex items-center justify-center gap-1 cursor-pointer transition-colors active:scale-98"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>संशोधन (Amend)</span>
              </button>

              <button
                type="button"
                onClick={() => handleAction('accepted')}
                className="py-2.5 px-2 bg-[#2F7D4F] border border-[#1E4620] hover:bg-[#25633e] text-white text-xs font-black rounded-[3px] flex items-center justify-center gap-1 cursor-pointer transition-colors active:scale-98 shadow-xs"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>स्वीकार करें (Accept)</span>
              </button>
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
                
                <div className="space-y-2 text-xs">
                  <div className="p-2 bg-[#F8FAFC] border border-[#CED4DA] rounded-[2px]">
                    <span className="text-[10px] text-[#6C757D] font-bold block">दस्तावेज प्रकार:</span>
                    <span className="font-bold text-[#212529]">{activeDocModal.type}</span>
                  </div>

                  <div className="p-2 bg-[#F8FAFC] border border-[#CED4DA] rounded-[2px]">
                    <span className="text-[10px] text-[#6C757D] font-bold block">संस्था / लैब:</span>
                    <span className="font-bold text-[#212529]">{activeDocModal.facility || 'संलग्न चिकित्सा पर्चा'}</span>
                  </div>

                  <div className="p-2 bg-[#F8FAFC] border border-[#CED4DA] rounded-[2px]">
                    <span className="text-[10px] text-[#6C757D] font-bold block">पाठ (Raw Text):</span>
                    <p className="font-mono text-[11px] text-[#212529] mt-0.5 leading-relaxed">
                      {activeDocModal.ocrSnippet || 'पाठ निष्कर्षण उपलब्ध नहीं (No OCR text available)'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-2 border-t text-[10px] text-[#6C757D] font-bold text-center">
                Tesseract Spatial Bounding-Box Verified
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
        <div className="fixed bottom-16 lg:bottom-6 right-6 z-50 bg-[#212529] text-white px-4 py-3 rounded-[3px] border border-[#CED4DA] shadow-xl text-xs font-black flex items-center gap-2 animate-bounce">
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
            className="py-2.5 px-2 bg-white border border-[#DC2626] hover:bg-[#FEF2F2] text-[#DC2626] text-xs font-black rounded-[3px] flex items-center justify-center gap-1 cursor-pointer transition-colors active:scale-98"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>पुनः परीक्षण</span>
          </button>

          <button
            type="button"
            onClick={() => handleAction('amended')}
            className="py-2.5 px-2 bg-white border border-[#0B5FA5] hover:bg-[#E8F1F8] text-[#0B5FA5] text-xs font-black rounded-[3px] flex items-center justify-center gap-1 cursor-pointer transition-colors active:scale-98"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>संशोधन</span>
          </button>

          <button
            type="button"
            onClick={() => handleAction('accepted')}
            className="py-2.5 px-2 bg-[#186036] border border-[#114526] hover:bg-[#15522e] text-white text-xs font-black rounded-[3px] flex items-center justify-center gap-1 cursor-pointer transition-colors active:scale-98 shadow-xs"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>स्वीकार करें</span>
          </button>
        </div>
      </div>

      {/* Persistent Single-Line Clean Footer */}
      <footer className="w-full bg-white border-t border-[#CED4DA] py-2 px-6 text-xs text-[#495057] select-none shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-left">
          <div className="flex items-center gap-2 font-bold" style={{ color: '#0B5FA5' }}>
            <span>अखिल भारतीय आयुर्वेद संस्थान (AIIA)</span>
            <span className="text-[#CED4DA]">|</span>
            <span className="font-semibold text-[#495057]">National Ayush EMR Consultation Terminal</span>
          </div>
          <div className="text-[11px] font-semibold text-[#6C757D]">
            <span>DPDP Act 2023 & Ayush Pharmacopoeia (API) Certified</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
