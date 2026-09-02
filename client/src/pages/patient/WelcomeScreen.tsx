import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Scale, FileText, ArrowRight } from 'lucide-react';
import { KioskButton } from '@/components/ui/KioskButton';
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
    <div className="flex flex-col min-h-[calc(100vh-80px)] bg-[#EAEDF0] text-[#212529] justify-between select-none font-sans">
      
      {/* Central Interactive Kiosk Region (Exactly matching Image 1) */}
      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 flex-1 flex flex-col justify-center items-center text-center">
        
        {/* Government Sub-Badge */}
        <div
          className="inline-block px-3.5 py-1 rounded-[4px] border text-xs font-bold uppercase tracking-wider mb-3"
          style={{ backgroundColor: '#E8EDF5', borderColor: 'rgba(10, 45, 101, 0.25)', color: 'rgb(10, 45, 101)' }}
        >
          {language === 'hi'
            ? 'रोगी स्वयं-पंजीकरण एवं प्रकृति परीक्षण केंद्र'
            : 'Patient Intake & Ayurvedic Constitution Kiosk'}
        </div>

        {/* Crisp Bold Headline */}
        <h1
          className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight max-w-4xl"
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

        {/* Subtitle */}
        <p className="mt-2 text-base sm:text-lg md:text-xl text-[#495057] max-w-2xl font-semibold leading-normal">
          {language === 'hi'
            ? 'डॉक्टर से मिलने से पहले अपना स्वास्थ्य विवरण और शारीरिक प्रकृति आसानी से दर्ज करें।'
            : 'Record your health symptoms and Ayurvedic body constitution before your OPD consultation.'}
        </p>

        {/* Sequential Bilingual Voice Prompter Bar */}
        <div className="my-4 sm:my-5">
          <AudioSpeaker
            hindiText={welcomeAudioHindi}
            englishText={welcomeAudioEnglish}
            bilingual={true}
            autoPlay={true}
          />
        </div>

        {/* "कियोस्क प्रक्रिया (3 आसान चरण)" Card (Image 1) */}
        <div className="w-full max-w-4xl my-3 sm:my-4 bg-white rounded-[4px] border border-[#CED4DA] p-4 sm:p-6 shadow-sm text-left">
          
          <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#495057] mb-4 border-b border-[#CED4DA] pb-2.5">
            <span style={{ color: 'rgb(10, 45, 101)' }} className="font-extrabold text-sm sm:text-base">
              {language === 'hi' ? 'कियोस्क प्रक्रिया (3 आसान चरण)' : 'How It Works (3 Easy Steps)'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            
            {/* Step 1: Speak / Touch */}
            <div className="flex items-start gap-3 p-3.5 rounded-[4px] bg-[#EAEDF0] border border-[#CED4DA]">
              <div
                className="w-10 h-10 rounded-[4px] font-black flex items-center justify-center shrink-0 text-lg shadow-sm"
                style={{ backgroundColor: 'rgb(10, 45, 101)', color: 'rgb(255, 255, 255)' }}
              >
                1
              </div>
              <div>
                <div
                  className="flex items-center gap-1.5 font-extrabold text-sm sm:text-base"
                  style={{ color: 'rgb(10, 45, 101)' }}
                >
                  <Mic className="w-4 h-4 text-[#0066CC]" />
                  <span>{language === 'hi' ? 'बोलकर बताएं' : 'Speak / Select'}</span>
                </div>
                <p className="text-xs sm:text-sm text-[#495057] mt-1 font-medium leading-normal">
                  {language === 'hi'
                    ? 'टाइप करने की जरूरत नहीं, अपनी भाषा में बोलें।'
                    : 'Share symptoms naturally by voice or touch.'}
                </p>
              </div>
            </div>

            {/* Step 2: Prakriti */}
            <div className="flex items-start gap-3 p-3.5 rounded-[4px] bg-[#EAEDF0] border border-[#CED4DA]">
              <div
                className="w-10 h-10 rounded-[4px] font-black flex items-center justify-center shrink-0 text-lg shadow-sm"
                style={{ backgroundColor: 'rgb(10, 45, 101)', color: 'rgb(255, 255, 255)' }}
              >
                2
              </div>
              <div>
                <div
                  className="flex items-center gap-1.5 font-extrabold text-sm sm:text-base"
                  style={{ color: 'rgb(10, 45, 101)' }}
                >
                  <Scale className="w-4 h-4 text-[#0066CC]" />
                  <span>{language === 'hi' ? 'प्रकृति जांच' : 'Prakriti Balance'}</span>
                </div>
                <p className="text-xs sm:text-sm text-[#495057] mt-1 font-medium leading-normal">
                  {language === 'hi'
                    ? 'चरक संहिता अनुसार वात, पित्त, कफ की गणना।'
                    : '15 classical constitutional balance traits.'}
                </p>
              </div>
            </div>

            {/* Step 3: Doctor File */}
            <div className="flex items-start gap-3 p-3.5 rounded-[4px] bg-[#EAEDF0] border border-[#CED4DA]">
              <div
                className="w-10 h-10 rounded-[4px] font-black flex items-center justify-center shrink-0 text-lg shadow-sm"
                style={{ backgroundColor: 'rgb(10, 45, 101)', color: 'rgb(255, 255, 255)' }}
              >
                3
              </div>
              <div>
                <div
                  className="flex items-center gap-1.5 font-extrabold text-sm sm:text-base"
                  style={{ color: 'rgb(10, 45, 101)' }}
                >
                  <FileText className="w-4 h-4 text-[#15803D]" />
                  <span>{language === 'hi' ? 'डॉक्टर पर्ची' : 'Doctor File'}</span>
                </div>
                <p className="text-xs sm:text-sm text-[#495057] mt-1 font-medium leading-normal">
                  {language === 'hi'
                    ? 'डॉक्टर के कंप्यूटर पर पूरा विवरण तुरंत पहुंचेगा।'
                    : 'Structured case summary sent to doctor queue.'}
                </p>
              </div>
            </div>

          </div>

        </div>

        {/* Giant Primary Start Button (Exact styling from Image 1) */}
        <div className="w-full max-w-lg mt-4 mb-2">
          <button
            type="button"
            onClick={handleStart}
            className="w-full py-4 sm:py-5 px-8 text-lg sm:text-2xl font-black rounded-[4px] border border-[#071F45] text-white flex items-center justify-center gap-3 transition-transform active:scale-[0.99] cursor-pointer shadow-md"
            style={{ backgroundColor: 'rgb(10, 45, 101)', color: 'rgb(255, 255, 255)' }}
          >
            <span>{language === 'hi' ? 'पंजीकरण आरंभ करें • TAP TO BEGIN' : 'BEGIN CASE INTAKE • आरंभ करें'}</span>
            <ArrowRight className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Security & Confidentiality Tag */}
        <div className="text-xs sm:text-sm font-semibold text-[#495057] mt-2">
          {language === 'hi'
            ? 'डिजिटल व्यक्तिगत डेटा संरक्षण (DPDP) अधिनियम 2023 • 100% सुरक्षित एवं गोपनीय'
            : 'Digital Personal Data Protection (DPDP) Act 2023 • 100% Confidential'}
        </div>

      </main>

      {/* Official Government Footer */}
      <footer className="w-full bg-white border-t border-[#CED4DA] py-3 px-4 sm:px-6 text-xs sm:text-sm text-[#495057] select-none">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <span className="font-extrabold" style={{ color: 'rgb(10, 45, 101)' }}>
              {language === 'hi' ? 'अखिल भारतीय आयुर्वेद संस्थान (AIIA)' : 'All India Institute of Ayurveda'}
            </span>
            <span className="text-[#CED4DA] hidden sm:inline">|</span>
            <span className="font-semibold text-[#495057]">
              {language === 'hi' ? 'ओपीडी ब्लॉक A • कियोस्क सं. 01' : 'OPD Block A • Kiosk Terminal 01'}
            </span>
          </div>
          <div className="text-xs font-semibold text-[#6C757D]">
            <span>{language === 'hi' ? 'सहायता हेतु स्वास्थ्य मित्र से संपर्क करें' : 'For assistance, ask nearest Swasthya Mitra'}</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
