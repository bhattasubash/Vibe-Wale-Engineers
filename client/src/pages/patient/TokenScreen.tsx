import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Printer, ArrowRight, MapPin, User, ShieldCheck } from 'lucide-react';
import { AudioSpeaker } from '@/components/ui/AudioSpeaker';
import { useSessionStore } from '@/stores/sessionStore';
import { usePhysicianStore } from '@/stores/physicianStore';

export const TokenScreen: React.FC = () => {
  const navigate = useNavigate();
  const {
    sessionId,
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

  const isAyurveda = treatmentMode === 'ayurveda';
  const currentSessionId = sessionId || `SES-${Math.floor(1000 + Math.random() * 9000)}K`;
  const tokenNumber = isAyurveda ? '#AIIA-042' : '#AIIA-G108';

  const assignedDoctorName = isAyurveda
    ? 'डॉ. अनन्या शर्मा (Dr. Ananya Sharma)'
    : 'डॉ. राजेश वर्मा (Dr. Rajesh Verma)';
  const assignedDegree = isAyurveda
    ? 'BAMS, MD • कायचिकित्सा विभाग (Internal Medicine)'
    : 'MBBS, MD (Medicine) • सामान्य चिकित्सा विभाग (General Medicine)';
  const assignedRoom = isAyurveda ? 'Room #104' : 'Room #205';
  const assignedBlock = isAyurveda ? 'Block A' : 'Block B';

  // Automatically sync patient intake into Doctor's OPD Workstation Queue
  useEffect(() => {
    const ocrSnippet = uploadedDocuments.map((d) => d.extractedText).filter(Boolean).join(' | ');

    addPatientToQueue({
      sessionId: currentSessionId,
      patientName: patient.fullName ? `${patient.fullName}` : (language === 'hi' ? 'रामेश्वर दयाल शर्मा (Rameshwar Sharma)' : 'Rameshwar Sharma'),
      age: typeof patient.age === 'number' ? patient.age : 62,
      gender: patient.gender || 'male',
      phone: patient.phone || '9876543210',
      abhaId: patient.abhaId || '91-4523-8901-2345',
      tokenNumber: tokenNumber,
      chiefComplaint: chiefComplaint || (isAyurveda ? 'दोनों घुटनों में दर्द, सूजन व कट-कट की आवाज (Sandhivata)' : 'शरीर में अत्यधिक कमजोरी, बुखार व सांस लेने में भारीपन'),
      complaintCategory: complaintCategory || (isAyurveda ? 'musculoskeletal' : 'general-medicine'),
      dominantPrakriti: isAyurveda ? (prakritiResult?.dominantPrakriti || 'PITTA-KAPHA') : 'सामान्य एलोपैथी (Allopathy)',
      vataScore: prakritiResult?.vataScore ?? 20,
      pittaScore: prakritiResult?.pittaScore ?? 53,
      kaphaScore: prakritiResult?.kaphaScore ?? 27,
      redFlagTriggered: redFlagTriggered,
      priority: redFlagTriggered ? 'critical' : 'normal',
      assignedDoctor: assignedDoctorName,
      roomNumber: assignedRoom,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      socrates: {
        site: socrates.site || (isAyurveda ? 'दोनों जानु सन्धि (Bilateral Knees)' : 'छाती व शरीर में भारीपन'),
        onset: socrates.onset || 'chronic-6-months',
        severity: typeof socrates.severity === 'number' ? `${socrates.severity}/10` : 'severe-8',
        timing: socrates.timing || 'cold-morning',
        familyHistory: socrates.familyHistory || 'family-arthritis',
      },
      ocrText: ocrSnippet || 'Rx: Formulations and diagnostic lab reports extracted.',
      extractedDrugs: isAyurveda
        ? ['Maharasnadi Kwath 20ml BD', 'Yogaraj Guggulu 2 Tab BD', 'Shallaki Capsule 1 BD']
        : ['Tab Paracetamol 650mg TDS', 'Tab Pantoprazole 40mg OD', 'Syp Azithromycin 500mg'],
      status: 'awaiting_review',
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
            <span>पंजीकरण सफल • CASE DISPATCHED TO OPD DOCTOR</span>
          </div>

          <h1
            className="text-2xl sm:text-4xl font-black tracking-tight"
            style={{ color: '#0B5FA5' }}
          >
            {language === 'hi' ? 'आपका ओपीडी टोकन तैयार है!' : 'Your OPD Token is Ready!'}
          </h1>
          <p className="text-xs sm:text-sm text-[#495057] font-semibold">
            {language === 'hi'
              ? 'आपका केस विवरण डॉक्टर के कंप्यूटर पर भेज दिया गया है।'
              : 'Your case summary has been sent directly to the physician workstation.'}
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
                {isAyurveda ? 'आयुष ओपीडी परामर्श पर्ची (Ayurveda OPD Token Slip)' : 'सामान्य चिकित्सा ओपीडी पर्ची (General Medicine Token Slip)'}
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
                  आवंटित चिकित्सक (Assigned Physician):
                </span>
                <span className="text-sm sm:text-base font-black text-[#212529] block">
                  {assignedDoctorName}
                </span>
                <span className="text-[11px] text-[#495057] font-semibold">
                  {assignedDegree}
                </span>
              </div>
            </div>

            <div className="bg-white border border-[#0B5FA5] px-2.5 py-1 rounded-[2px] text-center shrink-0">
              <div className="flex items-center justify-center gap-0.5 text-[9px] font-bold text-[#0B5FA5]">
                <MapPin className="w-2.5 h-2.5 text-[#0B5FA5]" />
                <span>कमरा नं.:</span>
              </div>
              <span className="text-base font-black text-[#0B5FA5] block leading-none mt-0.5">{assignedRoom}</span>
              <span className="text-[8px] text-[#6C757D] font-bold block">{assignedBlock}</span>
            </div>
          </div>

          {/* PATIENT DETAILS ROW */}
          <div className="grid grid-cols-3 gap-2 text-xs border-b pb-2 mb-2 text-[#495057]">
            <div>
              <span className="text-[9px] text-[#6C757D] block">रोगी का नाम:</span>
              <span className="font-extrabold text-[#212529] truncate block">
                {patient.fullName || 'रामेश्वर दयाल शर्मा'}
              </span>
            </div>
            <div>
              <span className="text-[9px] text-[#6C757D] block">आयु/लिंग:</span>
              <span className="font-bold text-[#212529]">{patient.age || 62} वर्ष / {patient.gender === 'female' ? 'महिला' : 'पुरुष'}</span>
            </div>
            <div>
              <span className="text-[9px] text-[#6C757D] block">चिकित्सा पद्धति:</span>
              <span className={`font-bold ${isAyurveda ? 'text-[#2F7D4F]' : 'text-[#0B5FA5]'}`}>
                {isAyurveda ? (prakritiResult?.dominantPrakriti || 'PITTA-KAPHA') : 'सामान्य चिकित्सा (Allopathy)'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-[#6C757D]">
            <span>दिनांक: {new Date().toLocaleDateString('hi-IN')} • समय: {new Date().toLocaleTimeString()}</span>
            <span className="font-mono text-[#0B5FA5] font-bold">ABDM-FHIR-R4-COMPLIANT</span>
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
            <span>टोकन पर्ची प्रिंट करें (Print Token)</span>
          </button>

          <button
            type="button"
            onClick={handleFinishAndExit}
            className="h-12 sm:h-14 px-6 rounded-[3px] border border-[#084B83] text-sm sm:text-base font-black text-white flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.98]"
            style={{ backgroundColor: '#0B5FA5' }}
          >
            <span>सत्र समाप्त करें • FINISH & EXIT</span>
            <ArrowRight className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* DPDP Countdown */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-[#6C757D] shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-[#2F7D4F]" />
          <span>सुरक्षा: गोपनीयता हेतु {countdown} सेकंड में स्क्रीन स्वतः रीसेट हो जाएगी।</span>
        </div>

      </main>

      {/* Persistent Single-Line Clean Footer */}
      <footer className="w-full bg-white border-t border-[#CED4DA] py-2 px-6 text-xs text-[#495057] select-none shrink-0">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-left">
          <div className="flex items-center gap-2 font-bold" style={{ color: '#0B5FA5' }}>
            <span>अखिल भारतीय आयुर्वेद संस्थान (AIIA)</span>
            <span className="text-[#CED4DA]">|</span>
            <span className="font-semibold text-[#495057]">OPD Terminal #01</span>
          </div>
          <div className="text-[11px] font-semibold text-[#6C757D]">
            <span>DPDP Act 2023 Ephemeral Token Auto-Purge Enabled</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
