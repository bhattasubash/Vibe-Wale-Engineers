import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, ArrowRight, XCircle, CheckCircle, Lock, Mic } from 'lucide-react';
import { AudioSpeaker } from '@/components/ui/AudioSpeaker';
import { useSessionStore } from '@/stores/sessionStore';

export const ConsentScreen: React.FC = () => {
  const navigate = useNavigate();
  const { language, setConsentGranted, patient } = useSessionStore();
  const [showDeclineModal, setShowDeclineModal] = useState(false);

  const promptHindi =
    'डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम 2023। हम आपसे आपके स्वास्थ्य और प्रकृति के बारे में प्रश्न पूछेंगे। यह जानकारी केवल आपके डॉक्टर को दी जाएगी। यदि आप सहमत हैं, तो नीचे दिए गए नीले बटन को दबाएं।';
  const promptEnglish =
    'Digital Personal Data Protection Act 2023 Consent. We will ask questions regarding your symptoms and body constitution. This data is strictly shared with your doctor. If you agree, tap the blue button below.';

  const handleAgree = () => {
    setConsentGranted(true);
    navigate('/kiosk/complaint');
  };

  const handleDecline = () => {
    setShowDeclineModal(true);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-76px)] bg-[#EAEDF0] text-[#212529] justify-between font-sans select-none">
      
      {/* Central Consent Card */}
      <main className="max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 flex-1 flex flex-col items-center">
        
        {/* Voice Prompter */}
        <div className="mb-4">
          <AudioSpeaker
            hindiText={promptHindi}
            englishText={promptEnglish}
            bilingual={language === 'hi'}
            autoPlay={true}
          />
        </div>

        {/* DPDP Legal Badge */}
        <div
          className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-[3px] border text-[11px] font-bold uppercase tracking-wider mb-2"
          style={{
            backgroundColor: '#E8F1F8',
            borderColor: 'rgba(11, 95, 165, 0.3)',
            color: '#0B5FA5',
          }}
        >
          <ShieldCheck className="w-4 h-4 text-[#0B5FA5]" />
          <span>डिजिटल व्यक्तिगत डेटा संरक्षण (DPDP) अधिनियम 2023</span>
        </div>

        <h1
          className="text-2xl sm:text-4xl font-black mb-1.5 tracking-tight text-center"
          style={{ color: '#0B5FA5' }}
        >
          {language === 'hi'
            ? 'स्वास्थ्य विवरण एवं प्रकृति परीक्षण हेतु सहमति'
            : 'Audio Consent & Data Protection Notice'}
        </h1>

        <p className="text-xs sm:text-sm text-[#495057] font-semibold mb-5 text-center max-w-xl">
          {language === 'hi'
            ? `रोगी: ${patient.fullName || 'नागरिक'} • परामर्श पूर्व विवरण संग्रह`
            : `Patient: ${patient.fullName || 'Citizen'} • Pre-consultation intake`}
        </p>

        {/* Content Box */}
        <div className="w-full bg-white border border-[#CED4DA] rounded-[3px] p-5 sm:p-6 mb-6 space-y-4 text-xs sm:text-sm text-[#212529]">
          
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[#E8F1F8] text-[#0B5FA5] flex items-center justify-center font-black shrink-0 text-xs">
              1
            </div>
            <p className="font-semibold leading-relaxed">
              {language === 'hi'
                ? 'हम आपसे आपके मुख्य स्वास्थ्य लक्षण (Chief Complaints), बीमारी का इतिहास और 15 आयुर्वेदिक प्रकृति प्रश्न पूछेंगे।'
                : 'We will ask questions about your symptoms, medical history, and 15 Ayurvedic body constitution traits.'}
            </p>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[#E8F1F8] text-[#0B5FA5] flex items-center justify-center font-black shrink-0 text-xs">
              2
            </div>
            <p className="font-semibold leading-relaxed">
              {language === 'hi'
                ? 'यह विवरण पूरी तरह सुरक्षित एवं गोपनीय है। यह जानकारी केवल आपके परामर्श कक्ष के अधिकृत BAMS डॉक्टर के कंप्यूटर पर पहुंचेगी।'
                : 'All information is 100% confidential and transmitted directly to your assigned BAMS doctor’s EMR terminal.'}
            </p>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[#E8F1F8] text-[#0B5FA5] flex items-center justify-center font-black shrink-0 text-xs">
              3
            </div>
            <p className="font-semibold leading-relaxed">
              {language === 'hi'
                ? 'डॉक्टर पर्ची (Token Slip) जारी होते ही इस कियोस्क टर्मिनल से आपका अस्थायी डेटा स्वतः मिटा दिया जाएगा।'
                : 'Your ephemeral session data is automatically purged from this kiosk terminal once your token is generated.'}
            </p>
          </div>

          {/* Voice Input Precision Tip */}
          <div className="mt-4 p-3 bg-[#FFF4EB] border border-[#E07B1A]/40 rounded-[2px] flex items-start gap-2.5 text-xs text-[#212529]">
            <Mic className="w-4 h-4 text-[#E07B1A] shrink-0 mt-0.5" />
            <p className="font-bold text-[#E07B1A]">
              {language === 'hi'
                ? 'महत्वपूर्ण: बोलते समय अपनी चुनी हुई भाषा में स्पष्ट रूप से बोलें ताकि आपकी आवाज़ सही रूप से पहचानी जा सके।'
                : 'Voice Note: Please speak clearly in your chosen language for accurate voice transcription.'}
            </p>
          </div>

        </div>

        {/* 2 Big Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl mb-4">
          
          {/* Decline Button */}
          <button
            type="button"
            onClick={handleDecline}
            className="py-4 px-6 rounded-[3px] border border-[#DC2626] bg-white text-[#DC2626] hover:bg-[#FEF2F2] font-black text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <XCircle className="w-5 h-5 text-[#DC2626]" />
            <span>{language === 'hi' ? 'असहमत • DECLINE' : 'DECLINE'}</span>
          </button>

          {/* Agree & Proceed Button */}
          <button
            type="button"
            onClick={handleAgree}
            className="py-4 px-6 rounded-[3px] border border-[#084B83] text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.99]"
            style={{ backgroundColor: '#0B5FA5' }}
          >
            <span>{language === 'hi' ? 'सहमत हैं • I AGREE' : 'I AGREE & PROCEED'}</span>
            <ArrowRight className="w-5 h-5 text-white" />
          </button>

        </div>

        {/* Back Button */}
        <button
          type="button"
          onClick={() => navigate('/kiosk/identify')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[3px] border border-[#CED4DA] bg-white hover:border-[#0B5FA5] hover:text-[#0B5FA5] text-xs font-bold text-[#212529] transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>पहचान पृष्ठ पर वापस जाएं (Back to Identify)</span>
        </button>

      </main>

      {/* Decline Dialog Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 rounded-[3px] border border-[#CED4DA] text-center">
            <XCircle className="w-12 h-12 text-[#DC2626] mx-auto mb-3" />
            <h2 className="text-xl font-black text-[#212529] mb-2">
              {language === 'hi' ? 'सहमति के बिना आगे नहीं बढ़ सकते' : 'Consent is Required'}
            </h2>
            <p className="text-xs text-[#495057] font-semibold mb-6">
              {language === 'hi'
                ? 'आयुष-केयर कियोस्क पर स्वास्थ्य विवरण दर्ज करने के लिए DPDP अधिनियम के तहत आपकी सहमति अनिवार्य है। यदि आप सहमत नहीं हैं, तो सीधे ओपीडी काउंटर नंबर 01 पर जाएं।'
                : 'Under the DPDP Act 2023, patient consent is mandatory to record symptoms on this kiosk. You may proceed directly to OPD Counter #01 for manual intake.'}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex-1 py-2.5 rounded-[3px] border border-[#CED4DA] text-xs font-bold text-[#495057] hover:bg-[#EAEDF0] cursor-pointer"
              >
                मुख्य पृष्ठ पर जाएं (Exit to Welcome)
              </button>
              <button
                type="button"
                onClick={() => setShowDeclineModal(false)}
                className="flex-1 py-2.5 rounded-[3px] border border-[#084B83] text-xs font-black text-white cursor-pointer"
                style={{ backgroundColor: '#0B5FA5' }}
              >
                पुनः विचार करें (Review Consent)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Single-Line Clean Footer */}
      <footer className="w-full bg-white border-t border-[#CED4DA] py-2 px-6 text-xs text-[#495057] select-none">
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
