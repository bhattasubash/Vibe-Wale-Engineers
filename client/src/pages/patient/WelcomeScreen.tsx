import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Scale, FileText, ArrowRight, ShieldCheck } from 'lucide-react';
import { AudioSpeaker } from '@/components/ui/AudioSpeaker';
import { useSessionStore } from '@/stores/sessionStore';

export const WelcomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useSessionStore();

  const handleStart = () => {
    navigate('/kiosk/language');
  };

  const welcomeAudioHindi =
    'नमस्ते। अखिल भारतीय आयुर्वेद संस्थान में आपका स्वागत है। ओपीडी परामर्श से पहले अपना विवरण और प्रकृति दर्ज करने के लिए नीचे दिया गया बड़ा बटन दबाएं।';
  
  const welcomeAudioEnglish =
    'Welcome to All India Institute of Ayurveda. To record your health details and Ayurvedic body constitution before consultation, please tap the start button below.';

  return (
    <div className="flex flex-col min-h-[calc(100vh-76px)] bg-[#EAEDF0] text-[#212529] justify-between font-sans select-none">
      
      {/* Central Focused Walk-Up Kiosk Container (Clean ATM / Airport Kiosk Style) */}
      <main className="max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 flex-1 flex flex-col justify-center items-center text-center">
        
        {/* Government Sub-Badge */}
        <div
          className="inline-block px-3.5 py-1 rounded-[2px] border text-xs font-bold uppercase tracking-wider mb-2.5"
          style={{ backgroundColor: '#E8F3ED', borderColor: 'rgba(27, 94, 63, 0.3)', color: '#1B5E3F' }}
        >
          {language === 'hi'
            ? 'रोगी स्वयं-पंजीकरण एवं प्रकृति परीक्षण केंद्र'
            : 'Patient Intake & Ayurvedic Constitution Kiosk'}
        </div>

        {/* Clear Bold Headline with Secondary Neutral Ink + Primary Green Accent */}
        <h1
          className="text-3xl sm:text-5xl font-black tracking-tight leading-tight max-w-2xl text-[#1F3864]"
        >
          {language === 'hi' ? (
            <>
              नमस्ते! <span style={{ color: '#1B5E3F' }}>आयुष-केयर</span> स्वागत केंद्र
            </>
          ) : (
            <>
              Welcome to <span style={{ color: '#1B5E3F' }}>AYUSH-Care</span> Kiosk
            </>
          )}
        </h1>

        {/* Single Short Subtitle */}
        <p className="mt-2 text-sm sm:text-lg text-[#495057] font-semibold max-w-xl leading-normal">
          {language === 'hi'
            ? 'डॉक्टर से मिलने से पहले अपना स्वास्थ्य विवरण और शारीरिक प्रकृति आसानी से दर्ज करें।'
            : 'Record your health symptoms and Ayurvedic body constitution before your OPD consultation.'}
        </p>

        {/* Audio Prompter Bar */}
        <div className="my-4">
          <AudioSpeaker
            hindiText={welcomeAudioHindi}
            englishText={welcomeAudioEnglish}
            bilingual={true}
            autoPlay={true}
          />
        </div>

        {/* 3-Step Visual Process Card */}
        <div className="w-full max-w-2xl my-2 bg-white rounded-[2px] border border-[#CED4DA] p-4 sm:p-5 text-left">
          
          {/* Warm Saffron / Turmeric Highlight on Section Label */}
          <div className="text-xs font-black uppercase tracking-wider mb-3 border-b border-[#CED4DA] pb-2 flex items-center justify-between">
            <span style={{ color: '#C77A1E' }}>
              {language === 'hi' ? 'कियोस्क प्रक्रिया (3 आसान चरण)' : 'How It Works (3 Easy Steps)'}
            </span>
            <span className="text-[11px] font-semibold text-[#6C757D]">
              {language === 'hi' ? 'समय: ~2 मिनट' : 'Duration: ~2 mins'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            
            {/* Step 1: Deep AYUSH Green Badge & Outline Icon */}
            <div className="flex items-start gap-2.5 p-3 rounded-[2px] bg-white border border-[#CED4DA]">
              <div
                className="w-7 h-7 rounded-[2px] font-black flex items-center justify-center shrink-0 text-xs"
                style={{ backgroundColor: '#1B5E3F', color: '#FFFFFF' }}
              >
                1
              </div>
              <div>
                <div
                  className="flex items-center gap-1.5 font-extrabold text-xs sm:text-sm"
                  style={{ color: '#1B5E3F' }}
                >
                  <Mic className="w-4 h-4" style={{ color: '#1B5E3F' }} strokeWidth={1.75} />
                  <span>{language === 'hi' ? 'बोलकर बताएं' : 'Speak / Select'}</span>
                </div>
                <p className="text-[11px] sm:text-xs text-[#495057] mt-0.5 font-medium leading-tight">
                  {language === 'hi'
                    ? 'टाइप करने की जरूरत नहीं, अपनी भाषा में बोलें।'
                    : 'Share symptoms naturally by voice or touch.'}
                </p>
              </div>
            </div>

            {/* Step 2: Deep AYUSH Green Badge & Outline Icon */}
            <div className="flex items-start gap-2.5 p-3 rounded-[2px] bg-white border border-[#CED4DA]">
              <div
                className="w-7 h-7 rounded-[2px] font-black flex items-center justify-center shrink-0 text-xs"
                style={{ backgroundColor: '#1B5E3F', color: '#FFFFFF' }}
              >
                2
              </div>
              <div>
                <div
                  className="flex items-center gap-1.5 font-extrabold text-xs sm:text-sm"
                  style={{ color: '#1B5E3F' }}
                >
                  <Scale className="w-4 h-4" style={{ color: '#1B5E3F' }} strokeWidth={1.75} />
                  <span>{language === 'hi' ? 'प्रकृति जांच' : 'Prakriti Balance'}</span>
                </div>
                <p className="text-[11px] sm:text-xs text-[#495057] mt-0.5 font-medium leading-tight">
                  {language === 'hi'
                    ? 'चरक संहिता अनुसार वात, पित्त, कफ की गणना।'
                    : '15 classical constitutional balance traits.'}
                </p>
              </div>
            </div>

            {/* Step 3: Deep AYUSH Green Badge & Outline Icon */}
            <div className="flex items-start gap-2.5 p-3 rounded-[2px] bg-white border border-[#CED4DA]">
              <div
                className="w-7 h-7 rounded-[2px] font-black flex items-center justify-center shrink-0 text-xs"
                style={{ backgroundColor: '#1B5E3F', color: '#FFFFFF' }}
              >
                3
              </div>
              <div>
                <div
                  className="flex items-center gap-1.5 font-extrabold text-xs sm:text-sm"
                  style={{ color: '#1B5E3F' }}
                >
                  <FileText className="w-4 h-4" style={{ color: '#1B5E3F' }} strokeWidth={1.75} />
                  <span>{language === 'hi' ? 'डॉक्टर पर्ची' : 'Doctor File'}</span>
                </div>
                <p className="text-[11px] sm:text-xs text-[#495057] mt-0.5 font-medium leading-tight">
                  {language === 'hi'
                    ? 'डॉक्टर के कंप्यूटर पर पूरा विवरण तुरंत पहुंचेगा।'
                    : 'Structured case summary sent to doctor queue.'}
                </p>
              </div>
            </div>

          </div>

        </div>

        {/* Big Tactile Rectangular Start CTA Button in Deep AYUSH Green */}
        <div className="w-full max-w-md mt-4 mb-2">
          <button
            type="button"
            onClick={handleStart}
            className="w-full py-4 px-6 text-lg sm:text-2xl font-black rounded-[2px] border border-[#14462F] text-white flex items-center justify-center gap-2.5 transition-transform active:scale-[0.99] cursor-pointer"
            style={{ backgroundColor: '#1B5E3F', color: '#FFFFFF' }}
          >
            <span>
              {language === 'hi'
                ? 'पंजीकरण आरंभ करें • TAP TO BEGIN'
                : 'BEGIN CASE INTAKE • आरंभ करें'}
            </span>
            <ArrowRight className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Minimal DPDP Act Notice */}
        <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[#495057] mt-1">
          <ShieldCheck className="w-4 h-4 text-[#15803D]" />
          <span>
            {language === 'hi'
              ? 'डिजिटल व्यक्तिगत डेटा संरक्षण (DPDP) अधिनियम 2023 • 100% सुरक्षित एवं गोपनीय'
              : 'Digital Personal Data Protection (DPDP) Act 2023 • 100% Confidential'}
          </span>
        </div>

      </main>

      {/* 1-Line Minimal Clean Kiosk Terminal Footer */}
      <footer className="w-full bg-white border-t border-[#CED4DA] py-2.5 px-6 text-xs text-[#495057] select-none">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-left">
          <div className="flex items-center gap-2 font-bold text-[#1F3864]">
            <span>अखिल भारतीय आयुर्वेद संस्थान (AIIA)</span>
            <span className="text-[#CED4DA]">|</span>
            <span className="font-semibold text-[#495057]">OPD Terminal #01</span>
          </div>
          <div className="text-[11px] font-semibold text-[#6C757D]">
            <span>सहायता हेतु स्वास्थ्य मित्र (Room 04) से संपर्क करें • हेल्पलाइन: 1800-11-2233</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
