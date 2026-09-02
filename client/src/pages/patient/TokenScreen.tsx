import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Printer, ArrowRight, MapPin, User, ShieldCheck } from 'lucide-react';
import { AudioSpeaker } from '@/components/ui/AudioSpeaker';
import { useSessionStore } from '@/stores/sessionStore';

export const TokenScreen: React.FC = () => {
  const navigate = useNavigate();
  const { language, patient, chiefComplaint, prakritiResult, resetSession } = useSessionStore();

  const [countdown, setCountdown] = useState(20);

  const promptHindi =
    'बधाई हो! आपका पंजीकरण और प्रकृति परीक्षण पूरा हो गया है। आपका टोकन नंबर ए-42 है। कृपया कमरा नंबर 104, डॉ. अनन्या शर्मा के पास जाएं।';
  const promptEnglish =
    'Congratulations! Your registration and Prakriti intake are complete. Your token number is A-42. Please proceed to Room 104, Dr. Ananya Sharma.';

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
              backgroundColor: '#F0FDF4',
              borderColor: 'rgba(21, 128, 61, 0.4)',
              color: '#15803D',
            }}
          >
            <CheckCircle className="w-3.5 h-3.5 text-[#15803D]" />
            <span>पंजीकरण सफल • CASE DISPATCHED TO DOCTOR</span>
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
              : 'Your case summary has been sent directly to the physician.'}
          </p>
        </div>

        {/* PRINTED TOKEN SLIP (Non-Scrollable Fitting) */}
        <div className="w-full max-w-2xl bg-white border-2 border-[#0B5FA5] rounded-[3px] p-4 sm:p-5 shadow-sm text-left shrink-0">
          
          {/* Slip Header */}
          <div className="flex items-center justify-between border-b pb-2 mb-2.5">
            <div>
              <span className="text-[10px] font-bold text-[#6C757D] uppercase tracking-wider block">
                अखिल भारतीय आयुर्वेद संस्थान (AIIA), नई दिल्ली
              </span>
              <span className="text-xs sm:text-sm font-black text-[#0B5FA5]">
                आयुष ओपीडी परामर्श पर्ची (OPD Token Slip)
              </span>
            </div>

            <div className="text-right">
              <span className="text-[9px] font-bold text-[#6C757D] uppercase block">टोकन संख्या:</span>
              <span className="text-2xl sm:text-3xl font-black font-mono text-[#0B5FA5]">#AIIA-042</span>
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
                  आवंटित डॉक्टर (Assigned Doctor):
                </span>
                <span className="text-sm sm:text-base font-black text-[#212529] block">
                  डॉ. अनन्या शर्मा (Dr. Ananya Sharma)
                </span>
                <span className="text-[11px] text-[#495057] font-semibold">
                  BAMS, MD • कायचिकित्सा विभाग (Internal Medicine)
                </span>
              </div>
            </div>

            <div className="bg-white border border-[#0B5FA5] px-2.5 py-1 rounded-[2px] text-center shrink-0">
              <div className="flex items-center justify-center gap-0.5 text-[9px] font-bold text-[#0B5FA5]">
                <MapPin className="w-2.5 h-2.5 text-[#0B5FA5]" />
                <span>कमरा नं.:</span>
              </div>
              <span className="text-base font-black text-[#0B5FA5] block leading-none mt-0.5">Room #104</span>
              <span className="text-[8px] text-[#6C757D] font-bold block">Block A</span>
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
              <span className="font-bold text-[#212529]">{patient.age || 62} वर्ष / पुरुष</span>
            </div>
            <div>
              <span className="text-[9px] text-[#6C757D] block">प्रकृति निष्कर्ष:</span>
              <span className="font-bold text-[#2F7D4F]">
                {prakritiResult?.dominantPrakriti || 'PITTA-KAPHA'}
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
