import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Scale, FileText, ArrowRight } from 'lucide-react';
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
    <div className="flex flex-col min-h-[calc(100vh-76px)] bg-[#EAEDF0] text-[#212529] justify-between select-none font-sans">
      
      {/* Central Compact Interactive Kiosk Region */}
      <main className="max-w-4xl w-full mx-auto px-3 sm:px-6 py-3 sm:py-5 flex-1 flex flex-col justify-center items-center text-center">
        
        {/* Government Sub-Badge */}
        <div
          className="inline-block px-3 py-0.5 rounded-[2px] border text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-2"
          style={{ backgroundColor: '#E8EDF5', borderColor: 'rgba(10, 45, 101, 0.25)', color: 'rgb(10, 45, 101)' }}
        >
          {language === 'hi'
            ? 'रोगी स्वयं-पंजीकरण एवं प्रकृति परीक्षण केंद्र'
            : 'Patient Intake & Ayurvedic Constitution Kiosk'}
        </div>

        {/* Crisp Bold Headline */}
        <h1
          className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight max-w-3xl"
          style={{ color: 'rgb(10, 45, 101)' }}
        >
          {language === 'hi' ? (
            <>
              नमस्ते! <span className="underline decoration-[#0066CC] decoration-4">आयुष-केयर</span> स्वागत केंद्र
            </>
          ) : (
            <>
              Welcome to <span className="underline decoration-[#0066CC] decoration-4">AYUSH-Care</span> Kiosk
            </>
          )}
        </h1>

        {/* Tight Subtitle */}
        <p className="mt-1 text-sm sm:text-base md:text-lg text-[#495057] max-w-2xl font-semibold leading-normal">
          {language === 'hi'
            ? 'डॉक्टर से मिलने से पहले अपना स्वास्थ्य विवरण और शारीरिक प्रकृति आसानी से दर्ज करें।'
            : 'Record your health symptoms and Ayurvedic body constitution before your OPD consultation.'}
        </p>

        {/* Compact Sequential Bilingual Voice Prompter Bar */}
        <div className="my-2.5 sm:my-3">
          <AudioSpeaker
            hindiText={welcomeAudioHindi}
            englishText={welcomeAudioEnglish}
            bilingual={true}
            autoPlay={true}
          />
        </div>

        {/* "कियोस्क प्रक्रिया (3 आसान चरण)" Card with Crisp White Step Boxes */}
        <div className="w-full max-w-3xl my-2 bg-white rounded-[2px] border border-[#CED4DA] p-3 sm:p-4 text-left">
          
          <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#495057] mb-2.5 border-b border-[#CED4DA] pb-1.5">
            <span style={{ color: 'rgb(10, 45, 101)' }} className="font-extrabold">
              {language === 'hi' ? 'कियोस्क प्रक्रिया (3 आसान चरण)' : 'How It Works (3 Easy Steps)'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3">
            
            {/* Step 1: Plain White Box with Thin Border (No grey background fill) */}
            <div className="flex items-start gap-2.5 p-2.5 rounded-[2px] bg-white border border-[#CED4DA]">
              <div
                className="w-8 h-8 rounded-[2px] font-black flex items-center justify-center shrink-0 text-sm"
                style={{ backgroundColor: 'rgb(10, 45, 101)', color: 'rgb(255, 255, 255)' }}
              >
                1
              </div>
              <div>
                <div
                  className="flex items-center gap-1 font-extrabold text-xs sm:text-sm"
                  style={{ color: 'rgb(10, 45, 101)' }}
                >
                  <Mic className="w-3.5 h-3.5 text-[#0066CC]" />
                  <span>{language === 'hi' ? 'बोलकर बताएं' : 'Speak / Select'}</span>
                </div>
                <p className="text-[11px] sm:text-xs text-[#495057] mt-0.5 font-medium leading-tight">
                  {language === 'hi'
                    ? 'टाइप करने की जरूरत नहीं, अपनी भाषा में बोलें।'
                    : 'Share symptoms naturally by voice or touch.'}
                </p>
              </div>
            </div>

            {/* Step 2: Plain White Box with Thin Border */}
            <div className="flex items-start gap-2.5 p-2.5 rounded-[2px] bg-white border border-[#CED4DA]">
              <div
                className="w-8 h-8 rounded-[2px] font-black flex items-center justify-center shrink-0 text-sm"
                style={{ backgroundColor: 'rgb(10, 45, 101)', color: 'rgb(255, 255, 255)' }}
              >
                2
              </div>
              <div>
                <div
                  className="flex items-center gap-1 font-extrabold text-xs sm:text-sm"
                  style={{ color: 'rgb(10, 45, 101)' }}
                >
                  <Scale className="w-3.5 h-3.5 text-[#0066CC]" />
                  <span>{language === 'hi' ? 'प्रकृति जांच' : 'Prakriti Balance'}</span>
                </div>
                <p className="text-[11px] sm:text-xs text-[#495057] mt-0.5 font-medium leading-tight">
                  {language === 'hi'
                    ? 'चरक संहिता अनुसार वात, पित्त, कफ की गणना।'
                    : '15 classical constitutional balance traits.'}
                </p>
              </div>
            </div>

            {/* Step 3: Plain White Box with Thin Border */}
            <div className="flex items-start gap-2.5 p-2.5 rounded-[2px] bg-white border border-[#CED4DA]">
              <div
                className="w-8 h-8 rounded-[2px] font-black flex items-center justify-center shrink-0 text-sm"
                style={{ backgroundColor: 'rgb(10, 45, 101)', color: 'rgb(255, 255, 255)' }}
              >
                3
              </div>
              <div>
                <div
                  className="flex items-center gap-1 font-extrabold text-xs sm:text-sm"
                  style={{ color: 'rgb(10, 45, 101)' }}
                >
                  <FileText className="w-3.5 h-3.5 text-[#15803D]" />
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

        {/* Compact Rectangular Primary Start Button */}
        <div className="w-full max-w-md mt-3 mb-1.5">
          <button
            type="button"
            onClick={handleStart}
            className="w-full py-3 sm:py-3.5 px-6 text-base sm:text-xl font-black rounded-[2px] border border-[#071F45] text-white flex items-center justify-center gap-2 transition-transform active:scale-[0.99] cursor-pointer"
            style={{ backgroundColor: 'rgb(10, 45, 101)', color: 'rgb(255, 255, 255)' }}
          >
            <span>{language === 'hi' ? 'पंजीकरण आरंभ करें • TAP TO BEGIN' : 'BEGIN CASE INTAKE • आरंभ करें'}</span>
            <ArrowRight className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Security & Confidentiality Tag */}
        <div className="text-[11px] sm:text-xs font-semibold text-[#495057] mt-1">
          {language === 'hi'
            ? 'डिजिटल व्यक्तिगत डेटा संरक्षण (DPDP) अधिनियम 2023 • 100% सुरक्षित एवं गोपनीय'
            : 'Digital Personal Data Protection (DPDP) Act 2023 • 100% Confidential'}
        </div>

      </main>

      {/* Official Government Footer */}
      <footer className="w-full bg-white border-t border-[#CED4DA] py-2 px-4 sm:px-6 text-xs text-[#495057] select-none">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <span className="font-extrabold" style={{ color: 'rgb(10, 45, 101)' }}>
              {language === 'hi' ? 'अखिल भारतीय आयुर्वेद संस्थान (AIIA)' : 'All India Institute of Ayurveda'}
            </span>
            <span className="text-[#CED4DA] hidden sm:inline">|</span>
            <span className="font-semibold text-[#495057]">
              {language === 'hi' ? 'ओपीडी ब्लॉक A • कियोस्क सं. 01' : 'OPD Block A • Kiosk Terminal 01'}
            </span>
          </div>
          <div className="text-[11px] font-semibold text-[#6C757D]">
            <span>{language === 'hi' ? 'सहायता हेतु स्वास्थ्य मित्र से संपर्क करें' : 'For assistance, ask nearest Swasthya Mitra'}</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
