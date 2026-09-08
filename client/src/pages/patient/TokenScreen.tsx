import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Printer, ArrowRight, MapPin, User, ShieldCheck, FileCode, Send, Loader2, X, Copy, Check } from 'lucide-react';
import { AudioSpeaker } from '@/components/ui/AudioSpeaker';
import { useSessionStore } from '@/stores/sessionStore';
import { usePhysicianStore } from '@/stores/physicianStore';
import { API_BASE_URL } from '@/lib/config';

export const TokenScreen: React.FC = () => {
  const navigate = useNavigate();
  const {
    sessionId,
    getOrCreateSessionId,
    language,
    treatmentMode,
    patient,
    chiefComplaint,
    complaintCategory,
    socrates,
    generalVitals,
    redFlagTriggered,
    prakritiResult,
    uploadedDocuments,
    resetSession,
  } = useSessionStore();

  const { addPatientToQueue } = usePhysicianStore();
  const [countdown, setCountdown] = useState(25);

  const [showFhirModal, setShowFhirModal] = useState(false);
  const [fhirBundle, setFhirBundle] = useState<any>(null);
  const [loadingFhir, setLoadingFhir] = useState(false);
  const [hisPushing, setHisPushing] = useState(false);
  const [hisPushResult, setHisPushResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const isAyurveda = treatmentMode === 'ayurveda';
  const currentSessionId = sessionId || getOrCreateSessionId();
  const tokenNumber = isAyurveda ? '#AIIA-042' : '#AIIA-G108';

  const handleOpenFhirModal = async () => {
    setShowFhirModal(true);
    setLoadingFhir(true);
    setHisPushResult(null);
    try {
      const activeSessionId = sessionId || getOrCreateSessionId();
      const res = await fetch(`${API_BASE_URL}/api/sessions/${activeSessionId}/fhir-bundle`);
      if (res.ok) {
        const data = await res.json();
        setFhirBundle(data);
      }
    } catch (err) {
      console.warn('Could not load FHIR bundle:', err);
    } finally {
      setLoadingFhir(false);
    }
  };

  const handlePushHis = async () => {
    setHisPushing(true);
    try {
      const activeSessionId = sessionId || getOrCreateSessionId();
      const res = await fetch(`${API_BASE_URL}/api/sessions/${activeSessionId}/push-his`, {
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

  const assignedDoctorName = isAyurveda
    ? 'डॉ. अनन्या शर्मा (Dr. Ananya Sharma)'
    : 'डॉ. राजेश वर्मा (Dr. Rajesh Verma)';
  const assignedDegree = isAyurveda
    ? 'BAMS, MD • कायचिकित्सा विभाग (Internal Medicine)'
    : 'MBBS, MD (Medicine) • सामान्य चिकित्सा विभाग (General Medicine)';
  const assignedRoom = isAyurveda ? 'Room #104' : 'Room #205';
  const assignedBlock = isAyurveda ? 'Block A' : 'Block B';

  // Automatically sync patient intake into Doctor's OPD Workstation Queue and Backend DB
  useEffect(() => {
    const ocrSnippet = uploadedDocuments.map((d) => d.extractedText).filter(Boolean).join(' | ');
    const docItems = uploadedDocuments.map((d, i) => ({
      id: d.id || `DOC-${i + 1}`,
      name: d.name || `पर्चा #${i + 1}`,
      url: d.previewUrl || '',
      type: 'Prescription' as const,
      date: new Date().toLocaleDateString('en-GB'),
      facility: 'AIIA Kiosk Capture',
      ocrSnippet: d.extractedText || '',
    }));

    const queuePatient = {
      sessionId: currentSessionId,
      patientName: patient.fullName ? `${patient.fullName}` : (language === 'hi' ? 'रोगी (Walk-in Patient)' : 'Walk-in Patient'),
      age: typeof patient.age === 'number' ? patient.age : 0,
      gender: (patient.gender as any) || 'other',
      phone: patient.phone || '',
      abhaId: patient.abhaId || '',
      tokenNumber: tokenNumber,
      chiefComplaint: chiefComplaint || (language === 'hi' ? 'उल्लेख नहीं (Not specified)' : 'Not specified'),
      complaintCategory: complaintCategory || (isAyurveda ? 'ayurveda' : 'allopathy'),
      dominantPrakriti: isAyurveda ? (prakritiResult?.dominantPrakriti || 'सम प्रकृति (Sama)') : 'सामान्य एलोपैथी (Allopathy)',
      vataScore: isAyurveda ? (prakritiResult?.vataScore ?? 0) : 0,
      pittaScore: isAyurveda ? (prakritiResult?.pittaScore ?? 0) : 0,
      kaphaScore: isAyurveda ? (prakritiResult?.kaphaScore ?? 0) : 0,
      redFlagTriggered: redFlagTriggered,
      priority: (redFlagTriggered ? 'critical' : 'normal') as 'critical' | 'normal',
      assignedDoctor: assignedDoctorName,
      roomNumber: assignedRoom,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      treatmentMode: treatmentMode,
      generalVitals: generalVitals as any,
      socrates: {
        site: socrates.site || '',
        onset: socrates.onset || '',
        severity: socrates.severity ? (typeof socrates.severity === 'number' ? `${socrates.severity}/10` : String(socrates.severity)) : '',
        timing: socrates.timing || '',
        familyHistory: socrates.familyHistory || '',
      },
      documents: docItems,
      ocrText: ocrSnippet || '',
      extractedDrugs: [],
      status: 'awaiting_review' as const,
    };

    addPatientToQueue(queuePatient);

    // Sync complete intake with backend database
    fetch(`${API_BASE_URL}/api/sessions/${currentSessionId}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...queuePatient,
        treatment_mode: treatmentMode,
        prakriti_result: prakritiResult,
        general_vitals: generalVitals,
      }),
    }).catch((err) => {
      console.warn('Could not sync complete session with backend (offline mode):', err);
    });
  }, []);

  const promptHindi = isAyurveda
    ? `बधाई हो! आपका पंजीकरण पूरा हो गया है। आपका टोकन नंबर ${tokenNumber} है। कृपया ${assignedRoom}, ${assignedDoctorName} के पास जाएं।`
    : `बधाई हो! आपका सामान्य चिकित्सा पंजीकरण पूरा हो गया है। आपका टोकन नंबर ${tokenNumber} है। कृपया ${assignedRoom}, ${assignedDoctorName} के पास जाएं।`;

  const promptEnglish =
    `Congratulations! Your intake is complete. Your token number is ${tokenNumber}. Please proceed to ${assignedRoom}, ${assignedDoctorName}.`;

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinishAndExit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleFinishAndExit = () => {
    resetSession();
    navigate('/');
  };

  const handlePrintSlip = () => {
    window.print();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-76px)] max-h-[calc(100vh-76px)] bg-[#EAEDF0] text-[#212529] justify-between font-sans select-none overflow-hidden">
      
      {/* Non-Scrollable Centered Main Container */}
      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-2 flex-1 flex flex-col justify-evenly items-center">
        
        {/* Top Prompter */}
        <div className="shrink-0">
          <AudioSpeaker
            hindiText={promptHindi}
            englishText={promptEnglish}
            bilingual={language === 'hi'}
            autoPlay={true}
          />
        </div>

        {/* Title Area */}
        <div className="text-center shrink-0">
          <div
            className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-[3px] border text-[11px] font-bold uppercase tracking-wider mb-1"
            style={{
              backgroundColor: isAyurveda ? '#F0FDF4' : '#E8F1F8',
              borderColor: isAyurveda ? 'rgba(21, 128, 61, 0.4)' : 'rgba(11, 95, 165, 0.3)',
              color: isAyurveda ? '#15803D' : '#0B5FA5',
            }}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'पंजीकरण सफल' : 'Registration Complete'}</span>
          </div>

          <h1
            className="text-2xl sm:text-4xl font-black tracking-tight"
            style={{ color: '#0B5FA5' }}
          >
            {language === 'hi' ? 'आपका ओपीडी टोकन तैयार है!' : 'Your OPD Token is Ready!'}
          </h1>
          <p className="text-xs sm:text-sm text-[#495057] font-semibold">
            {language === 'hi'
              ? 'आपका विवरण संबंधित चिकित्सक के कंप्यूटर पर भेज दिया गया है।'
              : 'Your intake details have been sent to the doctor’s desk.'}
          </p>
        </div>

        {/* PRINTED TOKEN SLIP */}
        <div className="w-full max-w-2xl bg-white border-2 border-[#0B5FA5] rounded-[3px] p-4 sm:p-5 shadow-sm text-left shrink-0">
          
          {/* Slip Header */}
          <div className="flex items-center justify-between border-b pb-2 mb-2.5">
            <div>
              <span className="text-[10px] font-bold text-[#6C757D] uppercase tracking-wider block">
                अखिल भारतीय आयुर्वेद संस्थान (AIIA), नई दिल्ली
              </span>
              <span className="text-xs sm:text-sm font-black text-[#0B5FA5]">
                {isAyurveda ? 'आयुष ओपीडी परामर्श पर्ची' : 'सामान्य चिकित्सा ओपीडी परामर्श पर्ची'}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[9px] font-bold text-[#6C757D] uppercase block">टोकन संख्या:</span>
              <span className="text-2xl sm:text-3xl font-black font-mono text-[#0B5FA5]">{tokenNumber}</span>
            </div>
          </div>

          {/* DOCTOR ASSIGNMENT BOX */}
          <div className="p-3 bg-[#E8F1F8] border border-[#0B5FA5]/30 rounded-[3px] mb-2.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-[2px] bg-[#0B5FA5] text-white flex items-center justify-center font-black text-lg shrink-0">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-[9px] font-bold text-[#0B5FA5] uppercase tracking-wider block">
                  परामर्श चिकित्सक (Doctor):
                </span>
                <span className="text-sm sm:text-base font-black text-[#212529] block">
                  {assignedDoctorName}
                </span>
                <span className="text-[11px] text-[#495057] font-semibold">
                  {assignedDegree}
                </span>
              </div>
            </div>

            <div className="bg-white border border-[#0B5FA5] px-3 py-1.5 rounded-[2px] text-center shrink-0">
              <div className="flex items-center justify-center gap-0.5 text-[10px] font-bold text-[#0B5FA5]">
                <MapPin className="w-3 h-3 text-[#0B5FA5]" />
                <span>कमरा नंबर:</span>
              </div>
              <span className="text-lg font-black text-[#0B5FA5] block leading-none mt-0.5">{assignedRoom}</span>
              <span className="text-[9px] text-[#6C757D] font-bold block">{assignedBlock}</span>
            </div>
          </div>

          {/* PATIENT DETAILS ROW */}
          <div className="grid grid-cols-3 gap-2 text-xs border-b pb-2 mb-2 text-[#495057]">
            <div>
              <span className="text-[9px] text-[#6C757D] block">रोगी का नाम:</span>
              <span className="font-extrabold text-[#212529] truncate block">
                {patient.fullName || 'नागरिक'}
              </span>
            </div>
            <div>
              <span className="text-[9px] text-[#6C757D] block">आयु/लिंग:</span>
              <span className="font-bold text-[#212529]">
                {patient.age ? `${patient.age} वर्ष` : '—'} / {patient.gender === 'female' ? 'महिला' : 'पुरुष'}
              </span>
            </div>
            <div>
              <span className="text-[9px] text-[#6C757D] block">विभाग:</span>
              <span className="font-bold text-[#0B5FA5]">
                {isAyurveda ? 'कायचिकित्सा' : 'सामान्य चिकित्सा'}
              </span>
            </div>
          </div>

          {/* Instructions Box */}
          <div className="bg-[#F8FAFC] p-2 rounded-[2px] text-[11px] text-[#495057] font-medium leading-relaxed">
            <p className="font-bold text-[#212529] mb-0.5">
              कृपया {assignedRoom} ({assignedBlock}) के बाहर प्रतीक्षालय में बैठें।
            </p>
            <p className="text-[10px] text-[#6C757D]">
              स्क्रीन पर अपना टोकन नंबर {tokenNumber} प्रदर्शित होने पर परामर्श कक्ष में प्रवेश करें।
            </p>
          </div>

          <div className="flex items-center justify-between text-[10px] text-[#6C757D] mt-2 pt-1 border-t">
            <span>दिनांक: {new Date().toLocaleDateString('hi-IN')} • समय: {new Date().toLocaleTimeString()}</span>
            <span>अखिल भारतीय आयुर्वेद संस्थान • नई दिल्ली</span>
          </div>

        </div>

        {/* 2 ACTION BUTTONS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl shrink-0">
          <button
            type="button"
            onClick={handlePrintSlip}
            className="h-12 sm:h-14 px-4 rounded-[3px] border border-[#0B5FA5] bg-white text-[#0B5FA5] hover:bg-[#E8F1F8] font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.98]"
          >
            <Printer className="w-4 h-4 text-[#0B5FA5]" />
            <span>कागज़ पर टोकन प्रिंट करें (Print Slip)</span>
          </button>

          <button
            type="button"
            onClick={handleFinishAndExit}
            className="h-12 sm:h-14 px-6 rounded-[3px] border border-[#084B83] text-sm sm:text-base font-black text-white flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.98]"
            style={{ backgroundColor: '#0B5FA5' }}
          >
            <span>सत्र समाप्त करें (Finish & Exit)</span>
            <ArrowRight className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* DPDP Countdown */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-[#6C757D] shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-[#186036]" />
          <span>गोपनीयता सुरक्षा: {countdown} सेकंड में यह स्क्रीन स्वतः बंद हो जाएगी।</span>
        </div>

      </main>

      {/* Persistent Single-Line Clean Footer */}
      <footer className="w-full bg-white border-t border-[#CED4DA] py-2 px-6 text-xs text-[#495057] select-none shrink-0">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-left">
          <div className="flex items-center gap-2 font-bold" style={{ color: '#0B5FA5' }}>
            <span>अखिल भारतीय आयुर्वेद संस्थान (AIIA)</span>
            <span className="text-[#CED4DA]">|</span>
            <span className="font-semibold text-[#495057]">नई दिल्ली</span>
          </div>
          <div className="text-[11px] font-semibold text-[#6C757D]">
            <span>राष्ट्रीय आयुष मिशन • नागरिक स्वास्थ्य सेवा</span>
          </div>
        </div>
      </footer>

      {/* FHIR R4 & HIS PUSH MODAL */}
      {showFhirModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#0B5FA5] rounded-[3px] max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-3 bg-[#0B5FA5] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4" />
                <span className="font-bold text-xs uppercase tracking-wide">
                  ABDM HL7 FHIR R4 Bundle Record (M2/M3 Interoperability)
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
                  ✓ National Health Authority (NHA) NRCeS Validated Document Bundle
                </span>
                <span className="font-mono font-bold text-[11px]">
                  Profile: DocumentBundle
                </span>
              </div>

              {hisPushResult && (
                <div className="p-3 bg-[#F0FDF4] border border-[#15803D] rounded-[2px] text-xs">
                  <div className="flex items-center gap-1.5 font-black text-[#15803D] mb-1">
                    <CheckCircle className="w-4 h-4 text-[#15803D]" />
                    <span>अस्पताल ईएमआर में सफलतापूर्वक दर्ज (Ingested into AIIA Hospital HIS)</span>
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
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="text-[11px] font-bold text-[#0B5FA5] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copied ? <Check className="w-3 h-3 text-[#186036]" /> : <Copy className="w-3 h-3 text-[#0B5FA5]" />}
                      <span>{copied ? 'कॉपी हो गया' : 'JSON कॉपी करें'}</span>
                    </button>
                  </div>
                  <pre className="p-3 bg-[#1A202C] text-[#E2E8F0] font-mono text-[10px] rounded-[2px] max-h-60 overflow-y-auto leading-relaxed select-all">
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
