import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, ArrowRight, XCircle, Lock } from 'lucide-react';
import { AudioSpeaker } from '@/components/ui/AudioSpeaker';
import { useSessionStore } from '@/stores/sessionStore';

export const ConsentScreen: React.FC = () => {
  const navigate = useNavigate();
  const { language, setConsentGranted, patient } = useSessionStore();
  const [showDeclineModal, setShowDeclineModal] = useState(false);

  const promptHindi =
    'नमस्ते। हम आपसे आपके स्वास्थ्य के बारे में कुछ सरल प्रश्न पूछेंगे। यह जानकारी केवल आपके डॉक्टर को दी जाएगी। आगे बढ़ने के लिए "सहमत हैं" बटन दबाएं।';
  const promptEnglish =
    'Welcome. We will ask simple questions about your health for your treating physician. Please tap I Agree to proceed.';

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
            <span>{language === 'hi' ? 'आपकी जानकारी की गोपनीयता एवं सुरक्षा' : 'Patient Privacy & Consent'}</span>
          </div>

          <h1
            className="text-2xl sm:text-3xl font-black tracking-tight"
            style={{ color: '#0B5FA5' }}
          >
            {language === 'hi'
              ? 'आपकी जानकारी की गोपनीयता'
              : 'Your Information & Privacy'}
          </h1>
          <p className="text-xs sm:text-sm text-[#495057] font-semibold">
            {language === 'hi'
              ? `रोगी: ${patient.fullName || 'नागरिक'} • डॉक्टर से मिलने से पूर्व जानकारी`
              : `Patient: ${patient.fullName || 'Citizen'} • Pre-consultation information`}
          </p>
        </div>

        {/* Spacious 3-Point Card */}
        <div className="w-full bg-white border border-[#CED4DA] rounded-[3px] p-5 space-y-3.5 text-sm sm:text-base text-[#212529] shrink-0 shadow-xs">
          
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[#E8F1F8] text-[#0B5FA5] flex items-center justify-center font-black shrink-0 text-xs mt-0.5">
              1
            </div>
            <p className="font-medium leading-normal">
              {language === 'hi' ? (
                <>
                  <strong className="text-[#0B5FA5]">स्वास्थ्य के बारे में:</strong> हम आपकी बीमारी, पुराने पर्चे और स्वास्थ्य से जुड़े कुछ आसान सवाल पूछेंगे।
                </>
              ) : (
                <>
                  <strong className="text-[#0B5FA5]">About Your Health:</strong> We will ask simple questions about your symptoms, prior prescriptions, and body health.
                </>
              )}
            </p>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[#E8F1F8] text-[#0B5FA5] flex items-center justify-center font-black shrink-0 text-xs mt-0.5">
              2
            </div>
            <p className="font-medium leading-normal">
              {language === 'hi' ? (
                <>
                  <strong className="text-[#0B5FA5]">सीधे आपके डॉक्टर के पास:</strong> यह जानकारी पूरी तरह सुरक्षित है और केवल आपके डॉक्टर को परामर्श कक्ष में दिखेगी।
                </>
              ) : (
                <>
                  <strong className="text-[#0B5FA5]">Directly to Your Doctor:</strong> All information is confidential and visible exclusively to your consulting physician.
                </>
              )}
            </p>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[#E8F1F8] text-[#0B5FA5] flex items-center justify-center font-black shrink-0 text-xs mt-0.5">
              3
            </div>
            <p className="font-medium leading-normal">
              {language === 'hi' ? (
                <>
                  <strong className="text-[#0B5FA5]">स्क्रीन से डेटा सुरक्षा:</strong> टोकन पर्ची जारी होने के बाद इस मशीन से आपका विवरण सुरक्षित रूप से हटा दिया जाता है।
                </>
              ) : (
                <>
                  <strong className="text-[#0B5FA5]">Data Privacy:</strong> Your temporary session information is safely cleared from this kiosk after your token is issued.
                </>
              )}
            </p>
          </div>

        </div>

        {/* 2 GIANT 64px ACTION BUTTONS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl shrink-0">
          
          <button
            type="button"
            onClick={() => setShowDeclineModal(true)}
            className="h-14 sm:h-16 px-6 rounded-[3px] border border-[#CED4DA] bg-white text-[#495057] hover:bg-[#F8F9FA] hover:text-[#212529] font-bold text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.98]"
          >
            <span>{language === 'hi' ? 'असहमत (नहीं पूछना)' : 'Do Not Agree'}</span>
          </button>

          <button
            type="button"
            onClick={handleAgree}
            className="h-14 sm:h-16 px-6 rounded-[3px] border border-[#084B83] text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.98]"
            style={{ backgroundColor: '#0B5FA5' }}
          >
            <span>{language === 'hi' ? 'सहमत हूँ और आगे बढ़ें' : 'I Agree & Proceed'}</span>
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
            <XCircle className="w-12 h-12 text-[#495057] mx-auto mb-2" />
            <h2 className="text-xl font-black text-[#212529] mb-1">
              {language === 'hi' ? 'सहमति के बिना आगे नहीं बढ़ सकते' : 'Consent is Required'}
            </h2>
            <p className="text-xs text-[#495057] font-semibold mb-4">
              {language === 'hi'
                ? 'यदि आप कियोस्क पर जानकारी नहीं देना चाहते, तो सीधे ओपीडी पंजीकरण काउंटर नंबर 01 पर जाएं।'
                : 'If you prefer not to enter details at the kiosk, please proceed directly to OPD Registration Counter #01.'}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex-1 py-2.5 rounded-[3px] border border-[#CED4DA] text-xs font-bold text-[#495057] hover:bg-[#EAEDF0] cursor-pointer"
              >
                मुख्य पृष्ठ (Exit)
              </button>
              <button
                type="button"
                onClick={() => setShowDeclineModal(false)}
                className="flex-1 py-2.5 rounded-[3px] border border-[#084B83] text-xs font-black text-white cursor-pointer"
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
            <span className="font-semibold text-[#495057]">नई दिल्ली</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#6C757D]">
            <Lock className="w-3.5 h-3.5 text-[#0B5FA5]" />
            <span>सुरक्षित परामर्श सत्र (Confidential)</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
