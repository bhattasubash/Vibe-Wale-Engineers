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
      
      {/* Central Focused Walk-Up Kiosk Container (Matching Exact Uploaded Image) */}
      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 flex-1 flex flex-col justify-center items-center text-center">
        
        {/* Soft Green Government Sub-Badge */}
        <div
          className="inline-block px-3.5 py-1 rounded-[2px] border text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-2"
          style={{
            backgroundColor: '#E6F4EA',
            borderColor: 'rgba(30, 126, 52, 0.35)',
            color: '#1E7E34',
          }}
        >
          {language === 'hi'
            ? 'रोगी स्वयं-पंजीकरण एवं प्रकृति परीक्षण केंद्र'
            : 'Patient Intake & Ayurvedic Constitution Kiosk'}
        </div>

        {/* Clear Bold Headline in Deep Navy */}
        <h1
          className="text-3xl sm:text-5xl font-black tracking-tight leading-tight max-w-3xl"
          style={{ color: 'rgb(10, 45, 101)' }}
        >
          {language === 'hi'
            ? 'नमस्ते! आयुष-केयर स्वागत केंद्र'
            : 'Welcome to AYUSH-Care Kiosk'}
        </h1>

        {/* Subtitle */}
        <p className="mt-1.5 text-sm sm:text-base md:text-lg text-[#4A5568] font-semibold max-w-2xl leading-normal">
          {language === 'hi'
            ? 'डॉक्टर से मिलने से पहले अपना स्वास्थ्य विवरण और शारीरिक प्रकृति आसानी से दर्ज करें।'
            : 'Record your health symptoms and Ayurvedic body constitution before your OPD consultation.'}
        </p>

        {/* Audio Prompter Bar */}
        <div className="my-3 sm:my-4">
          <AudioSpeaker
            hindiText={welcomeAudioHindi}
            englishText={welcomeAudioEnglish}
            bilingual={true}
            autoPlay={true}
          />
        </div>

        {/* 3-Step Process Card */}
        <div className="w-full max-w-3xl my-2 bg-white rounded-[2px] border border-[#CED4DA] p-4 sm:p-5 text-left">
          
          <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider mb-3 border-b border-[#E2E8F0] pb-2">
            <span style={{ color: '#C05621' }}>
              {language === 'hi' ? 'कियोस्क प्रक्रिया (3 आसान चरण)' : 'How It Works (3 Easy Steps)'}
            </span>
            <span className="text-[#718096] font-semibold lowercase">
              {language === 'hi' ? 'समय: ~2 मिनट' : 'time: ~2 mins'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            
            {/* Step 1 */}
            <div className="flex items-start gap-2.5 p-3 rounded-[2px] bg-white border border-[#CED4DA]">
              <div
                className="w-7 h-7 rounded-[2px] font-black flex items-center justify-center shrink-0 text-xs text-white"
                style={{ backgroundColor: '#1E7E34' }}
              >
                1
              </div>
              <div>
                <div
                  className="flex items-center gap-1.5 font-extrabold text-xs sm:text-sm"
                  style={{ color: '#1E7E34' }}
                >
                  <Mic className="w-4 h-4 text-[#1E7E34]" strokeWidth={2} />
                  <span>{language === 'hi' ? 'बोलकर बताएं' : 'Speak / Select'}</span>
                </div>
                <p className="text-[11px] sm:text-xs text-[#4A5568] mt-0.5 font-medium leading-tight">
                  {language === 'hi'
                    ? 'टाइप करने की जरूरत नहीं, अपनी भाषा में बोलें।'
                    : 'Share symptoms naturally by voice or touch.'}
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-2.5 p-3 rounded-[2px] bg-white border border-[#CED4DA]">
              <div
                className="w-7 h-7 rounded-[2px] font-black flex items-center justify-center shrink-0 text-xs text-white"
                style={{ backgroundColor: '#1E7E34' }}
              >
                2
              </div>
              <div>
                <div
                  className="flex items-center gap-1.5 font-extrabold text-xs sm:text-sm"
                  style={{ color: '#1E7E34' }}
                >
                  <Scale className="w-4 h-4 text-[#1E7E34]" strokeWidth={2} />
                  <span>{language === 'hi' ? 'प्रकृति जांच' : 'Prakriti Balance'}</span>
                </div>
                <p className="text-[11px] sm:text-xs text-[#4A5568] mt-0.5 font-medium leading-tight">
                  {language === 'hi'
                    ? 'चरक संहिता अनुसार वात, पित्त, कफ की गणना।'
                    : '15 classical constitutional balance traits.'}
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-2.5 p-3 rounded-[2px] bg-white border border-[#CED4DA]">
              <div
                className="w-7 h-7 rounded-[2px] font-black flex items-center justify-center shrink-0 text-xs text-white"
                style={{ backgroundColor: '#1E7E34' }}
              >
                3
              </div>
              <div>
                <div
                  className="flex items-center gap-1.5 font-extrabold text-xs sm:text-sm"
                  style={{ color: '#1E7E34' }}
                >
                  <FileText className="w-4 h-4 text-[#1E7E34]" strokeWidth={2} />
                  <span>{language === 'hi' ? 'डॉक्टर पर्ची' : 'Doctor File'}</span>
                </div>
                <p className="text-[11px] sm:text-xs text-[#4A5568] mt-0.5 font-medium leading-tight">
                  {language === 'hi'
                    ? 'डॉक्टर के कंप्यूटर पर पूरा विवरण तुरंत पहुंचेगा।'
                    : 'Structured case summary sent to doctor queue.'}
                </p>
              </div>
            </div>

          </div>

        </div>

        {/* Solid Forest Green Start CTA Button (Matching Target Image) */}
        <div className="w-full max-w-lg mt-4 mb-2">
          <button
            type="button"
            onClick={handleStart}
            className="w-full py-4 px-6 text-lg sm:text-2xl font-black rounded-[2px] border text-white flex items-center justify-center gap-3 transition-transform active:scale-[0.99] cursor-pointer"
            style={{
              backgroundColor: '#1E6F3E',
              borderColor: '#155724',
              color: '#FFFFFF',
            }}
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-center">
              <span>
                {language === 'hi'
                  ? 'पंजीकरण आरंभ करें • TAP TO BEGIN'
                  : 'BEGIN CASE INTAKE • आरंभ करें'}
              </span>
            </div>
            <ArrowRight className="w-6 h-6 text-white shrink-0" />
          </button>
        </div>

        {/* Minimal DPDP Act Security Tag */}
        <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[#4A5568] mt-1.5">
          <ShieldCheck className="w-4 h-4 text-[#1E7E34]" />
          <span>
            {language === 'hi'
              ? 'डिजिटल व्यक्तिगत डेटा संरक्षण (DPDP) अधिनियम 2023 • 100% सुरक्षित एवं गोपनीय'
              : 'Digital Personal Data Protection (DPDP) Act 2023 • 100% Confidential'}
          </span>
        </div>

      </main>

    </div>
  );
};
