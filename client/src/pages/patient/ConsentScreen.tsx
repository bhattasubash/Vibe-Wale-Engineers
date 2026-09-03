import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, ArrowRight, XCircle, Lock, Mic } from 'lucide-react';
import { AudioSpeaker } from '@/components/ui/AudioSpeaker';
import { useSessionStore } from '@/stores/sessionStore';

export const ConsentScreen: React.FC = () => {
  const navigate = useNavigate();
  const { language, setConsentGranted, patient } = useSessionStore();
  const [showDeclineModal, setShowDeclineModal] = useState(false);

  const promptHindi =
    'डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम 2023। हम आपसे आपके स्वास्थ्य और प्रकृति के बारे में प्रश्न पूछेंगे। यह जानकारी केवल आपके डॉक्टर को दी जाएगी। यदि आप सहमत हैं, तो नीचे दिए गए नीले बटन को दबाएं।';
  const promptEnglish =
    'Digital Personal Data Protection Act 2023 Consent. We will collect symptoms and Prakriti details for your treating doctor. Tap Agree to continue.';

  const handleAgree = () => {
    setConsentGranted(true);
    navigate('/kiosk/complaint');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-76px)] max-h-[calc(100vh-76px)] bg-[#EAEDF0] text-[#212529] justify-between font-sans select-none overflow-hidden">
      
      {/* Non-Scrollable Centered Main Container */}
      <main className="max-w-3xl w-full mx-auto px-4 sm:px-6 py-2 flex-1 flex flex-col justify-evenly items-center">
        
        {/* Top Prompter */}
        <div className="shrink-0">
          <AudioSpeaker
            hindiText={promptHindi}
            englishText={promptEnglish}
            bilingual={language === 'hi'}
            autoPlay={true}
          />
        </div>

        {/* Header Badge */}
        <div className="text-center shrink-0">
          <div
            className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-[3px] border text-[11px] font-bold uppercase tracking-wider mb-1"
            style={{
              backgroundColor: '#E8F1F8',
              borderColor: 'rgba(11, 95, 165, 0.3)',
              color: '#0B5FA5',
            }}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>डिजिटल व्यक्तिगत डेटा संरक्षण (DPDP) अधिनियम 2023</span>
          </div>

          <h1
            className="text-2xl sm:text-3xl font-black tracking-tight"
            style={{ color: '#0B5FA5' }}
          >
            {language === 'hi'
              ? 'स्वास्थ्य विवरण एवं प्रकृति परीक्षण सहमति'
              : 'Patient Intake & DPDP Consent Notice'}
          </h1>
          <p className="text-xs sm:text-sm text-[#495057] font-semibold">
            {language === 'hi'
              ? `रोगी: ${patient.fullName || 'नागरिक'} • डॉक्टर परामर्श पूर्व विवरण संग्रह`
              : `Patient: ${patient.fullName || 'Citizen'} • Pre-consultation case intake`}
          </p>
        </div>

        {/* Spacious 3-Point DPDP Card */}
        <div className="w-full bg-white border border-[#CED4DA] rounded-[3px] p-4 sm:p-5 space-y-3 text-xs sm:text-sm text-[#212529] shrink-0">
          
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[#E8F1F8] text-[#0B5FA5] flex items-center justify-center font-black shrink-0 text-xs">
              1
            </div>
            <p className="font-semibold leading-relaxed">
              {language === 'hi'
                ? 'हम आपसे आपके मुख्य स्वास्थ्य लक्षण (Chief Complaints), बीमारी का इतिहास और 15 शारीरिक प्रकृति प्रश्न पूछेंगे।'
                : 'We will record your health symptoms, medical history, and 15 classical Ayurvedic constitution traits.'}
            </p>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[#E8F1F8] text-[#0B5FA5] flex items-center justify-center font-black shrink-0 text-xs">
              2
            </div>
            <p className="font-semibold leading-relaxed">
              {language === 'hi'
                ? 'यह विवरण 100% सुरक्षित एवं गोपनीय है और केवल आपके परामर्श कक्ष के अधिकृत BAMS डॉक्टर के कंप्यूटर पर पहुंचेगा।'
                : 'All information is strictly confidential and transmitted directly to your assigned BAMS physician’s EMR.'}
            </p>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[#E8F1F8] text-[#0B5FA5] flex items-center justify-center font-black shrink-0 text-xs">
              3
            </div>
            <p className="font-semibold leading-relaxed">
              {language === 'hi'
                ? 'पर्ची जारी होते ही कियोस्क टर्मिनल से आपका अस्थायी विवरण स्वतः मिटा दिया जाएगा।'
                : 'Your ephemeral session data is automatically purged from this terminal upon token generation.'}
            </p>
          </div>

          <div className="p-2.5 bg-[#FFF4EB] border border-[#E07B1A]/40 rounded-[2px] flex items-center gap-2 text-xs font-bold text-[#E07B1A]">
            <Mic className="w-4 h-4 shrink-0" />
            <span>
              {language === 'hi'
                ? 'आवाज़ निर्देश: बोलते समय अपनी चुनी हुई भाषा में स्पष्ट रूप से बोलें।'
                : 'Voice Note: Please speak clearly in your selected language for accurate transcription.'}
            </span>
          </div>

        </div>

        {/* 2 GIANT 64px ACTION BUTTONS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl shrink-0">
          
          <button
            type="button"
            onClick={() => setShowDeclineModal(true)}
            className="h-14 sm:h-16 px-6 rounded-[3px] border border-[#DC2626] bg-white text-[#DC2626] hover:bg-[#FEF2F2] font-black text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.98]"
          >
            <XCircle className="w-5 h-5 text-[#DC2626]" />
            <span>{language === 'hi' ? 'असहमत • DECLINE' : 'DECLINE'}</span>
          </button>

          <button
            type="button"
            onClick={handleAgree}
            className="h-14 sm:h-16 px-6 rounded-[3px] border border-[#084B83] text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.98]"
            style={{ backgroundColor: '#0B5FA5' }}
          >
            <span>{language === 'hi' ? 'सहमत हैं • I AGREE' : 'I AGREE & PROCEED'}</span>
            <ArrowRight className="w-5 h-5 text-white" />
          </button>

        </div>

        {/* Back Button */}
        <div className="shrink-0">
          <button
            type="button"
            onClick={() => navigate('/kiosk/department')}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-[3px] border border-[#CED4DA] bg-white hover:border-[#0B5FA5] hover:text-[#0B5FA5] text-xs font-bold text-[#212529] transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>विभाग चयन पर वापस जाएं (Back)</span>
          </button>
        </div>

      </main>

      {/* Decline Dialog Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 rounded-[3px] border border-[#CED4DA] text-center">
            <XCircle className="w-12 h-12 text-[#DC2626] mx-auto mb-2" />
            <h2 className="text-xl font-black text-[#212529] mb-1">
              {language === 'hi' ? 'सहमति के बिना आगे नहीं बढ़ सकते' : 'Consent is Required'}
            </h2>
            <p className="text-xs text-[#495057] font-semibold mb-4">
              {language === 'hi'
                ? 'DPDP अधिनियम के तहत आपकी सहमति अनिवार्य है। सीधे ओपीडी काउंटर नंबर 01 पर जाएं।'
                : 'Patient consent is mandatory under DPDP Act 2023. Please proceed to OPD Counter #01.'}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex-1 py-2 rounded-[3px] border border-[#CED4DA] text-xs font-bold text-[#495057] hover:bg-[#EAEDF0] cursor-pointer"
              >
                मुख्य पृष्ठ (Exit)
              </button>
              <button
                type="button"
                onClick={() => setShowDeclineModal(false)}
                className="flex-1 py-2 rounded-[3px] border border-[#084B83] text-xs font-black text-white cursor-pointer"
                style={{ backgroundColor: '#0B5FA5' }}
              >
                पुनः विचार करें (Review)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Single-Line Clean Footer */}
      <footer className="w-full bg-white border-t border-[#CED4DA] py-2 px-6 text-xs text-[#495057] select-none shrink-0">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-left">
          <div className="flex items-center gap-2 font-bold" style={{ color: '#0B5FA5' }}>
            <span>अखिल भारतीय आयुर्वेद संस्थान (AIIA)</span>
            <span className="text-[#CED4DA]">|</span>
            <span className="font-semibold text-[#495057]">OPD Terminal #01</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#6C757D]">
            <Lock className="w-3.5 h-3.5 text-[#0B5FA5]" />
            <span>256-Bit Encrypted Healthcare Session</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
