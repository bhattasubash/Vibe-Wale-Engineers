import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Printer, ArrowRight, Clock, MapPin, User, ShieldCheck, QrCode } from 'lucide-react';
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

  // 20-second automatic memory purge for DPDP 2023 compliance
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
    <div className="flex flex-col min-h-[calc(100vh-76px)] bg-[#EAEDF0] text-[#212529] justify-between font-sans select-none">
      
      {/* Central Token Container */}
      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-8 flex-1 flex flex-col items-center">
        
        {/* Prompter */}
        <div className="mb-3">
          <AudioSpeaker
            hindiText={promptHindi}
            englishText={promptEnglish}
            bilingual={language === 'hi'}
            autoPlay={true}
          />
        </div>

        {/* Top Success Badge */}
        <div
          className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-[3px] border text-[11px] font-bold uppercase tracking-wider mb-1"
          style={{
            backgroundColor: '#F0FDF4',
            borderColor: 'rgba(21, 128, 61, 0.4)',
            color: '#15803D',
          }}
        >
          <CheckCircle className="w-3.5 h-3.5 text-[#15803D]" />
          <span>पंजीकरण सफल • INTAKE DISPATCHED TO DOCTOR</span>
        </div>

        <h1
          className="text-2xl sm:text-4xl font-black mb-1 tracking-tight text-center"
          style={{ color: '#0B5FA5' }}
        >
          {language === 'hi' ? 'आपका टोकन तैयार है!' : 'Your OPD Token is Ready!'}
        </h1>
        <p className="text-xs sm:text-sm text-[#495057] font-semibold mb-4 text-center max-w-xl">
          {language === 'hi'
            ? 'आपका स्वास्थ्य विवरण एवं प्रकृति रिपोर्ट संबंधित डॉक्टर के कंप्यूटर पर भेज दी गई है।'
            : 'Your clinical case summary has been securely routed to your assigned BAMS doctor.'}
        </p>

        {/* PRINTED TOKEN SLIP & DOCTOR ASSIGNMENT CARD */}
        <div className="w-full max-w-2xl bg-white border-2 border-[#0B5FA5] rounded-[3px] p-5 sm:p-6 mb-4 shadow-sm text-left">
          
          {/* Header Strip */}
          <div className="flex items-center justify-between border-b pb-3 mb-3">
            <div>
              <span className="text-[10px] font-bold text-[#6C757D] uppercase tracking-wider block">
                अखिल भारतीय आयुर्वेद संस्थान (AIIA), नई दिल्ली
              </span>
              <span className="text-sm font-black text-[#0B5FA5]">
                आयुष ओपीडी पंजीकरण पर्ची (OPD Consultation Token)
              </span>
            </div>

            {/* Giant Token Number */}
            <div className="text-right">
              <span className="text-[10px] font-bold text-[#6C757D] uppercase block">टोकन संख्या (Token):</span>
              <span className="text-3xl sm:text-4xl font-black font-mono text-[#0B5FA5]">#AIIA-042</span>
            </div>
          </div>

          {/* ASSIGNED DOCTOR HIGHLIGHT BOX */}
          <div className="p-3.5 bg-[#E8F1F8] border border-[#0B5FA5]/30 rounded-[3px] mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-[2px] bg-[#0B5FA5] text-white flex items-center justify-center font-black text-xl shrink-0">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#0B5FA5] uppercase tracking-wider block">
                  आवंटित डॉक्टर (Assigned Physician):
                </span>
                <span className="text-base font-black text-[#212529] block">
                  डॉ. अनन्या शर्मा (Dr. Ananya Sharma)
                </span>
                <span className="text-xs text-[#495057] font-semibold">
                  BAMS, MD (Ayurveda) • कायचिकित्सा (Internal Medicine)
                </span>
              </div>
            </div>

            {/* Room Number Indicator */}
            <div className="bg-white border border-[#0B5FA5] px-3 py-1.5 rounded-[2px] text-center shrink-0 w-full sm:w-auto">
              <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-[#0B5FA5]">
                <MapPin className="w-3 h-3 text-[#0B5FA5]" />
                <span>कमरा संख्या (Room):</span>
              </div>
              <span className="text-lg font-black text-[#0B5FA5] block">Room #104</span>
              <span className="text-[9px] text-[#6C757D] font-bold block">First Floor, Block A</span>
            </div>

          </div>

          {/* PATIENT & CLINICAL SUMMARY ROW */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs border-b pb-3 mb-3 text-[#495057]">
            <div>
              <span className="text-[10px] text-[#6C757D] block">रोगी का नाम:</span>
              <span className="font-extrabold text-[#212529] text-sm">
                {patient.fullName || 'रामेश्वर दयाल शर्मा'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#6C757D] block">आयु / लिंग:</span>
              <span className="font-bold text-[#212529]">
                {patient.age || 62} वर्ष / {patient.gender === 'female' ? 'महिला' : 'पुरुष'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#6C757D] block">आभा संख्या (ABHA):</span>
              <span className="font-mono font-bold text-[#0B5FA5]">
                {patient.abhaId || '91-4523-8901-2345'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#6C757D] block">मुख्य लक्षण:</span>
              <span className="font-bold text-[#212529]">
                {chiefComplaint || 'संधिवात (Joint Pain)'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#6C757D] block">प्रकृति निष्कर्ष:</span>
              <span className="font-bold text-[#2F7D4F]">
                {prakritiResult?.dominantPrakriti || 'PITTA-KAPHA'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#6C757D] block">अनुमानित प्रतीक्षा:</span>
              <span className="font-bold text-[#E07B1A]">~10 मिनट (3 मरीज आगे)</span>
            </div>
          </div>

          {/* Footer of the Slip */}
          <div className="flex items-center justify-between text-[11px] text-[#6C757D]">
            <span>दिनांक: {new Date().toLocaleDateString('hi-IN')} • समय: {new Date().toLocaleTimeString()}</span>
            <span className="font-mono text-[#0B5FA5] font-bold">ABDM-FHIR-R4-COMPLIANT</span>
          </div>

        </div>

        {/* 2 ACTION BUTTONS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl mb-4">
          
          {/* Print Slip */}
          <button
            type="button"
            onClick={handlePrintSlip}
            className="py-3.5 px-4 rounded-[3px] border border-[#0B5FA5] bg-white text-[#0B5FA5] hover:bg-[#E8F1F8] font-black text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Printer className="w-4 h-4 text-[#0B5FA5]" />
            <span>टोकन पर्ची प्रिंट करें (Print Token)</span>
          </button>

          {/* Finish & Exit */}
          <button
            type="button"
            onClick={handleFinishAndExit}
            className="py-3.5 px-6 rounded-[3px] border border-[#084B83] text-sm sm:text-base font-black text-white flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.99]"
            style={{ backgroundColor: '#0B5FA5' }}
          >
            <span>सत्र समाप्त करें • FINISH & EXIT</span>
            <ArrowRight className="w-5 h-5 text-white" />
          </button>

        </div>

        {/* DPDP Act 2023 Auto-Purge Countdown Indicator */}
        <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[#6C757D] mt-1">
          <ShieldCheck className="w-4 h-4 text-[#2F7D4F]" />
          <span>
            सुरक्षा सूचना: गोपनीयता हेतु {countdown} सेकंड में यह स्क्रीन स्वतः बंद हो जाएगी। (Auto-Purge in {countdown}s)
          </span>
        </div>

      </main>

      {/* Persistent Single-Line Clean Footer */}
      <footer className="w-full bg-white border-t border-[#CED4DA] py-2 px-6 text-xs text-[#495057] select-none">
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
