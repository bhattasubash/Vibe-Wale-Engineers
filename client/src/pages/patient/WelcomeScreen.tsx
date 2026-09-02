import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Scale, FileText, ArrowRight, Info, PhoneCall, Clock, ShieldCheck, HelpCircle } from 'lucide-react';
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
      
      {/* Main Utilitarian Grid (2-Column Dense Portal Layout) */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-6 flex-1">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* ========================================================= */}
          {/* LEFT COLUMN: Primary Kiosk Intake Action (8 of 12 cols)   */}
          {/* ========================================================= */}
          <div className="lg:col-span-8 bg-white border border-[#CED4DA] p-5 sm:p-7 rounded-[2px] text-left">
            
            {/* Government Sub-Badge */}
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[2px] border text-xs font-bold uppercase tracking-wider mb-2"
              style={{ backgroundColor: '#E8EDF5', borderColor: 'rgba(10, 45, 101, 0.25)', color: 'rgb(10, 45, 101)' }}
            >
              <Info className="w-3.5 h-3.5" />
              <span>
                {language === 'hi'
                  ? 'रोगी स्वयं-पंजीकरण एवं प्रकृति परीक्षण केंद्र'
                  : 'Patient Intake & Ayurvedic Constitution Kiosk'}
              </span>
            </div>

            {/* Headline - No misleading blue underline */}
            <h1
              className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight"
              style={{ color: 'rgb(10, 45, 101)' }}
            >
              {language === 'hi'
                ? 'नमस्ते! आयुष-केयर स्वागत केंद्र'
                : 'Welcome to AYUSH-Care Kiosk'}
            </h1>

            {/* Subtitle */}
            <p className="mt-1 text-sm sm:text-base text-[#495057] font-semibold leading-normal">
              {language === 'hi'
                ? 'डॉक्टर से मिलने से पहले अपना स्वास्थ्य विवरण और शारीरिक प्रकृति आसानी से दर्ज करें।'
                : 'Record your health symptoms and Ayurvedic body constitution before your OPD consultation.'}
            </p>

            {/* Compact Sequential Bilingual Voice Prompter Bar */}
            <div className="my-3">
              <AudioSpeaker
                hindiText={welcomeAudioHindi}
                englishText={welcomeAudioEnglish}
                bilingual={true}
                autoPlay={true}
              />
            </div>

            {/* "कियोस्क प्रक्रिया (3 आसान चरण)" Box */}
            <div className="w-full my-3 border-t border-b border-[#CED4DA] py-3.5">
              
              <div className="text-xs font-extrabold uppercase tracking-wider text-[#495057] mb-2.5">
                <span style={{ color: 'rgb(10, 45, 101)' }}>
                  {language === 'hi' ? 'कियोस्क प्रक्रिया (3 आसान चरण)' : 'How It Works (3 Easy Steps)'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                
                {/* Step 1: Uniform Navy Outline Icon */}
                <div className="flex items-start gap-2.5 p-3 rounded-[2px] bg-white border border-[#CED4DA]">
                  <div
                    className="w-7 h-7 rounded-[2px] font-black flex items-center justify-center shrink-0 text-xs"
                    style={{ backgroundColor: 'rgb(10, 45, 101)', color: 'rgb(255, 255, 255)' }}
                  >
                    1
                  </div>
                  <div>
                    <div
                      className="flex items-center gap-1.5 font-extrabold text-xs sm:text-sm"
                      style={{ color: 'rgb(10, 45, 101)' }}
                    >
                      <Mic className="w-4 h-4 text-[#0A2D65]" strokeWidth={1.75} />
                      <span>{language === 'hi' ? 'बोलकर बताएं' : 'Speak / Select'}</span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-[#495057] mt-0.5 font-medium leading-tight">
                      {language === 'hi'
                        ? 'टाइप करने की जरूरत नहीं, अपनी भाषा में बोलें।'
                        : 'Share symptoms naturally by voice or touch.'}
                    </p>
                  </div>
                </div>

                {/* Step 2: Uniform Navy Outline Icon */}
                <div className="flex items-start gap-2.5 p-3 rounded-[2px] bg-white border border-[#CED4DA]">
                  <div
                    className="w-7 h-7 rounded-[2px] font-black flex items-center justify-center shrink-0 text-xs"
                    style={{ backgroundColor: 'rgb(10, 45, 101)', color: 'rgb(255, 255, 255)' }}
                  >
                    2
                  </div>
                  <div>
                    <div
                      className="flex items-center gap-1.5 font-extrabold text-xs sm:text-sm"
                      style={{ color: 'rgb(10, 45, 101)' }}
                    >
                      <Scale className="w-4 h-4 text-[#0A2D65]" strokeWidth={1.75} />
                      <span>{language === 'hi' ? 'प्रकृति जांच' : 'Prakriti Balance'}</span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-[#495057] mt-0.5 font-medium leading-tight">
                      {language === 'hi'
                        ? 'चरक संहिता अनुसार वात, पित्त, कफ की गणना।'
                        : '15 classical constitutional balance traits.'}
                    </p>
                  </div>
                </div>

                {/* Step 3: Uniform Navy Outline Icon */}
                <div className="flex items-start gap-2.5 p-3 rounded-[2px] bg-white border border-[#CED4DA]">
                  <div
                    className="w-7 h-7 rounded-[2px] font-black flex items-center justify-center shrink-0 text-xs"
                    style={{ backgroundColor: 'rgb(10, 45, 101)', color: 'rgb(255, 255, 255)' }}
                  >
                    3
                  </div>
                  <div>
                    <div
                      className="flex items-center gap-1.5 font-extrabold text-xs sm:text-sm"
                      style={{ color: 'rgb(10, 45, 101)' }}
                    >
                      <FileText className="w-4 h-4 text-[#0A2D65]" strokeWidth={1.75} />
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

            {/* Primary Rectangular Start CTA Button */}
            <div className="w-full mt-4 mb-2">
              <button
                type="button"
                onClick={handleStart}
                className="w-full py-4 px-6 text-base sm:text-xl font-black rounded-[2px] border border-[#071F45] text-white flex items-center justify-center gap-2.5 transition-transform active:scale-[0.99] cursor-pointer"
                style={{ backgroundColor: 'rgb(10, 45, 101)', color: 'rgb(255, 255, 255)' }}
              >
                <span>
                  {language === 'hi'
                    ? 'पंजीकरण आरंभ करें • TAP TO BEGIN'
                    : 'BEGIN CASE INTAKE • आरंभ करें'}
                </span>
                <ArrowRight className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* DPDP Act 2023 Security Tag */}
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#495057] mt-2">
              <ShieldCheck className="w-4 h-4 text-[#15803D]" />
              <span>
                {language === 'hi'
                  ? 'डिजिटल व्यक्तिगत डेटा संरक्षण (DPDP) अधिनियम 2023 • 100% सुरक्षित एवं गोपनीय'
                  : 'Digital Personal Data Protection (DPDP) Act 2023 • 100% Confidential'}
              </span>
            </div>

          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: Official Hospital Info & Help (4 of 12 cols)*/}
          {/* ========================================================= */}
          <div className="lg:col-span-4 flex flex-col gap-3.5 text-left">
            
            {/* Box 1: Important OPD Instructions */}
            <div className="bg-white border border-[#CED4DA] p-4 rounded-[2px]">
              <div
                className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider pb-2 border-b border-[#CED4DA]"
                style={{ color: 'rgb(10, 45, 101)' }}
              >
                <Info className="w-4 h-4 text-[#0A2D65]" />
                <span>{language === 'hi' ? 'महत्वपूर्ण ओपीडी निर्देश' : 'Important OPD Guidelines'}</span>
              </div>
              <ul className="mt-2.5 space-y-2 text-xs font-semibold text-[#495057]">
                <li className="flex items-start gap-1.5">
                  <span className="text-[#0A2D65] font-black">•</span>
                  <span>
                    {language === 'hi'
                      ? 'अपना ABHA कार्ड या पुराना पर्चा साथ रखें।'
                      : 'Keep your ABHA Card or old prescription handy.'}
                  </span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#0A2D65] font-black">•</span>
                  <span>
                    {language === 'hi'
                      ? 'कियोस्क प्रक्रिया में मात्र 2-3 मिनट का समय लगता है।'
                      : 'Intake process takes only 2 to 3 minutes.'}
                  </span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#0A2D65] font-black">•</span>
                  <span>
                    {language === 'hi'
                      ? 'टोकन पर्ची प्राप्त कर संबंधित कक्ष के बाहर प्रतीक्षा करें।'
                      : 'Collect your token slip and proceed to assigned OPD room.'}
                  </span>
                </li>
              </ul>
            </div>

            {/* Box 2: Swasthya Mitra Helpdesk */}
            <div className="bg-white border border-[#CED4DA] p-4 rounded-[2px]">
              <div
                className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider pb-2 border-b border-[#CED4DA]"
                style={{ color: 'rgb(10, 45, 101)' }}
              >
                <PhoneCall className="w-4 h-4 text-[#0A2D65]" />
                <span>{language === 'hi' ? 'सहायता केंद्र / Swasthya Mitra' : 'Helpdesk & Assistance'}</span>
              </div>
              <div className="mt-2.5 text-xs text-[#495057] font-semibold space-y-1">
                <p>
                  {language === 'hi'
                    ? 'यदि कियोस्क उपयोग में कठिनाई हो, तो निकटतम स्वास्थ्य मित्र से संपर्क करें।'
                    : 'For assistance, approach the nearest Swasthya Mitra counter.'}
                </p>
                <div className="pt-2 flex items-center justify-between border-t border-[#E8EDF5] font-bold">
                  <span className="text-[#212529]">
                    {language === 'hi' ? 'कियोस्क सहायता कक्ष:' : 'Kiosk Help Desk:'}
                  </span>
                  <span style={{ color: 'rgb(10, 45, 101)' }}>Room No. 04</span>
                </div>
                <div className="flex items-center justify-between font-bold">
                  <span className="text-[#212529]">
                    {language === 'hi' ? 'राष्ट्रीय आयुष हेल्पलाइन:' : 'AYUSH Helpline:'}
                  </span>
                  <span style={{ color: 'rgb(10, 45, 101)' }}>1800-11-2233</span>
                </div>
              </div>
            </div>

            {/* Box 3: Daily OPD Timings */}
            <div className="bg-white border border-[#CED4DA] p-3.5 rounded-[2px]">
              <div className="flex items-center justify-between text-xs font-extrabold">
                <div className="flex items-center gap-1.5" style={{ color: 'rgb(10, 45, 101)' }}>
                  <Clock className="w-4 h-4 text-[#0A2D65]" />
                  <span>{language === 'hi' ? 'ओपीडी समय:' : 'OPD Timings:'}</span>
                </div>
                <span className="text-[#212529]">08:00 AM - 02:00 PM</span>
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* ========================================================= */}
      {/* OFFICIAL GOVERNMENT FOOTER (GIGW Compliant)               */}
      {/* ========================================================= */}
      <footer className="w-full bg-white border-t border-[#CED4DA] mt-6 py-4 px-4 sm:px-8 text-xs text-[#495057] select-none">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
          
          {/* Ministry / Hospital Information */}
          <div>
            <p className="font-extrabold text-sm" style={{ color: 'rgb(10, 45, 101)' }}>
              {language === 'hi'
                ? 'अखिल भारतीय आयुर्वेद संस्थान (AIIA), नई दिल्ली'
                : 'All India Institute of Ayurveda (AIIA), New Delhi'}
            </p>
            <p className="text-[11px] text-[#6C757D] font-medium mt-0.5">
              गौतमपुरी, सरिता विहार, मथुरा रोड, नई दिल्ली - 110076 | National Informatics Centre (NIC)
            </p>
          </div>

          {/* Standard Government Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] font-bold text-[#495057]">
            <span className="hover:underline cursor-pointer">
              {language === 'hi' ? 'गोपनीयता नीति' : 'Privacy Policy'}
            </span>
            <span>|</span>
            <span className="hover:underline cursor-pointer">
              {language === 'hi' ? 'सुलभता विवरण' : 'Accessibility'}
            </span>
            <span>|</span>
            <span className="hover:underline cursor-pointer">
              {language === 'hi' ? 'उपयोग की शर्तें' : 'Terms of Use'}
            </span>
            <span>|</span>
            <span className="hover:underline cursor-pointer">
              {language === 'hi' ? 'हाइपरलिंक नीति' : 'Hyperlink Policy'}
            </span>
          </div>

          {/* Version & Security Tag */}
          <div className="text-[11px] font-semibold text-[#6C757D] text-center md:text-right">
            <div>
              {language === 'hi' ? 'अंतिम अद्यतन: 02 सितम्बर 2026' : 'Last Updated: 02 Sep 2026'}
            </div>
            <div className="font-bold" style={{ color: 'rgb(10, 45, 101)' }}>
              Portal Version: 2.4.0 (NIC Compliant)
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
};
