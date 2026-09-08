import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Scale, FileText, ArrowRight, ShieldCheck } from 'lucide-react';
import { AudioSpeaker } from '@/components/ui/AudioSpeaker';
import { useSessionStore } from '@/stores/sessionStore';

export const WelcomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const { language, getOrCreateSessionId } = useSessionStore();

  const handleStart = () => {
    getOrCreateSessionId();
    navigate('/kiosk/language');
  };

  const welcomeAudioHindi =
    'नमस्ते। अखिल भारतीय आयुर्वेद संस्थान में आपका स्वागत है। ओपीडी परामर्श से पहले अपना विवरण और प्रकृति दर्ज करने के लिए नीचे दिया गया बड़ा बटन दबाएं।';
  
  const welcomeAudioEnglish =
    'Welcome to All India Institute of Ayurveda. To record your health details and Ayurvedic body constitution before consultation, please tap the start button below.';

  return (
    <div className="flex flex-col min-h-[calc(100vh-76px)] bg-[#EAEDF0] text-[#212529] justify-between font-sans select-none">
      
      {/* Central Focused Walk-Up Kiosk Container (ABDM / CoWIN Visual Standard) */}
      <main className="max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 flex-1 flex flex-col justify-center items-center text-center">
        
        {/* Sub-Badge in Trust Blue Tint */}
        <div
          className="inline-block px-3.5 py-1 rounded-[3px] border text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-2.5"
          style={{
            backgroundColor: '#E8F1F8',
            borderColor: 'rgba(11, 95, 165, 0.3)',
            color: '#0B5FA5',
          }}
        >
          {language === 'hi'
            ? 'रोगी स्वयं-पंजीकरण एवं प्रकृति परीक्षण केंद्र'
            : 'Patient Intake & Ayurvedic Constitution Kiosk'}
        </div>

        {/* Headline in Trust Blue */}
        <h1
          className="text-3xl sm:text-5xl font-black tracking-tight leading-tight max-w-2xl"
          style={{ color: '#0B5FA5' }}
        >
          {language === 'hi'
            ? 'नमस्ते! आयुष-केयर स्वागत केंद्र'
            : 'Welcome to AYUSH-Care Kiosk'}
        </h1>

        {/* Single Subtitle */}
        <p className="mt-2 text-sm sm:text-lg text-[#495057] font-semibold max-w-xl leading-normal">
          {language === 'hi'
            ? 'डॉक्टर से मिलने से पहले अपना स्वास्थ्य विवरण और शारीरिक प्रकृति आसानी से दर्ज करें।'
            : 'Record your health symptoms and Ayurvedic body constitution before your OPD consultation.'}
        </p>

        {/* Audio Prompter Bar */}
        <div className="my-3.5 sm:my-4">
          <AudioSpeaker
            hindiText={welcomeAudioHindi}
            englishText={welcomeAudioEnglish}
            bilingual={true}
            autoPlay={true}
          />
        </div>

        {/* 3-Step Process Card */}
        <div className="w-full max-w-2xl my-2 bg-white rounded-[3px] border border-[#CED4DA] p-4 sm:p-5 text-left">
          
          <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider mb-3 border-b border-[#CED4DA] pb-2">
            <span style={{ color: '#0B5FA5' }}>
              {language === 'hi' ? 'यह प्रक्रिया आसान है' : 'How It Works (Simple Steps)'}
            </span>
            
            {/* Realistic operational time estimation */}
            <span
              className="px-2 py-0.5 rounded-[2px] text-[11px] font-bold"
              style={{ backgroundColor: '#FFF4EB', color: '#E07B1A', border: '1px solid rgba(224, 123, 26, 0.3)' }}
            >
              {language === 'hi' ? 'समय: लगभग 5–7 मिनट' : 'Time: ~5–7 mins'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            
            {/* Step 1: Speak or Select */}
            <div className="flex items-start gap-2.5 p-3 rounded-[3px] bg-white border border-[#CED4DA]">
              <div
                className="w-7 h-7 rounded-[2px] font-black flex items-center justify-center shrink-0 text-xs text-white"
                style={{ backgroundColor: '#0B5FA5' }}
              >
                1
              </div>
              <div>
                <div
                  className="flex items-center gap-1.5 font-extrabold text-xs sm:text-sm"
                  style={{ color: '#0B5FA5' }}
                >
                  <Mic className="w-4 h-4 text-[#0B5FA5]" strokeWidth={1.75} />
                  <span>{language === 'hi' ? 'अपनी समस्या बताएं' : 'Tell Your Problem'}</span>
                </div>
                <p className="text-[11px] sm:text-xs text-[#495057] mt-0.5 font-medium leading-tight">
                  {language === 'hi'
                    ? 'बोलकर या स्क्रीन छूकर अपनी तकलीफ बताएं।'
                    : 'Speak or tap to describe your symptoms.'}
                </p>
              </div>
            </div>

            {/* Step 2: Answer Simple Questions */}
            <div
              className="flex items-start gap-2.5 p-3 rounded-[3px] bg-white border"
              style={{ borderColor: 'rgba(47, 125, 79, 0.4)' }}
            >
              <div
                className="w-7 h-7 rounded-[2px] font-black flex items-center justify-center shrink-0 text-xs text-white"
                style={{ backgroundColor: '#2F7D4F' }}
              >
                2
              </div>
              <div>
                <div
                  className="flex items-center gap-1.5 font-extrabold text-xs sm:text-sm"
                  style={{ color: '#2F7D4F' }}
                >
                  <Scale className="w-4 h-4 text-[#2F7D4F]" strokeWidth={1.75} />
                  <span>{language === 'hi' ? 'आसान सवालों के जवाब' : 'Simple Questions'}</span>
                </div>
                <p className="text-[11px] sm:text-xs text-[#495057] mt-0.5 font-medium leading-tight">
                  {language === 'hi'
                    ? 'अपनी दिनचर्या और स्वास्थ्य से जुड़े आसान सवाल।'
                    : 'A few simple questions about your routine.'}
                </p>
              </div>
            </div>

            {/* Step 3: Scan or Speak History */}
            <div className="flex items-start gap-2.5 p-3 rounded-[3px] bg-white border border-[#CED4DA]">
              <div
                className="w-7 h-7 rounded-[2px] font-black flex items-center justify-center shrink-0 text-xs text-white"
                style={{ backgroundColor: '#0B5FA5' }}
              >
                3
              </div>
              <div>
                <div
                  className="flex items-center gap-1.5 font-extrabold text-xs sm:text-sm"
                  style={{ color: '#0B5FA5' }}
                >
                  <FileText className="w-4 h-4 text-[#0B5FA5]" strokeWidth={1.75} />
                  <span>{language === 'hi' ? 'दस्तावेज़ या इतिहास' : 'Reports & History'}</span>
                </div>
                <p className="text-[11px] sm:text-xs text-[#495057] mt-0.5 font-medium leading-tight">
                  {language === 'hi'
                    ? 'पुराने पर्चे स्कैन करें या बोलकर बताएं।'
                    : 'Show old reports or share history by voice.'}
                </p>
              </div>
            </div>

          </div>

        </div>

        {/* Primary CTA Button: Dignified Single-Line Action */}
        <div className="w-full max-w-md mt-4 mb-2">
          <button
            type="button"
            onClick={handleStart}
            className="w-full py-4 px-6 text-lg sm:text-2xl font-black rounded-[3px] border border-[#084B83] text-white flex items-center justify-center gap-2.5 transition-transform active:scale-[0.99] cursor-pointer"
            style={{ backgroundColor: '#0B5FA5', color: '#FFFFFF' }}
          >
            <span>
              {language === 'hi'
                ? 'शुरू करें • TAP TO BEGIN'
                : 'BEGIN INTAKE • शुरू करें'}
            </span>
            <ArrowRight className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Honest Security Tag */}
        <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[#495057] mt-1">
          <ShieldCheck className="w-4 h-4 text-[#2F7D4F]" />
          <span>
            {language === 'hi'
              ? 'आपकी जानकारी केवल आपके डॉक्टर के पास सुरक्षित भेजी जाती है।'
              : 'Your information is safely transmitted directly to your doctor.'}
          </span>
        </div>

      </main>

      {/* Persistent Single-Line Clean Kiosk Footer (Without Doctor Link) */}
      <footer className="w-full bg-white border-t border-[#CED4DA] py-2.5 px-6 text-xs text-[#495057] select-none">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-left">
          <div className="flex items-center gap-2 font-bold" style={{ color: '#0B5FA5' }}>
            <span>अखिल भारतीय आयुर्वेद संस्थान (AIIA)</span>
            <span className="text-[#CED4DA]">|</span>
            <span className="font-semibold text-[#495057]">OPD Terminal</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-semibold text-[#6C757D]">
            <span>सहायता डेस्क: Room 04 • हेल्पलाइन: 1800-11-2233</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
