import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { AudioSpeaker } from '@/components/ui/AudioSpeaker';
import { useSessionStore } from '@/stores/sessionStore';

export const LanguageScreen: React.FC = () => {
  const navigate = useNavigate();
  const { setLanguage } = useSessionStore();
  const [selectedLang, setSelectedLang] = useState<'hi' | 'en' | null>(null);
  const [hoveredLang, setHoveredLang] = useState<'hi' | 'en' | null>(null);

  const handleSelectLanguage = (lang: 'hi' | 'en') => {
    setSelectedLang(lang);
    setLanguage(lang);
    setTimeout(() => {
      navigate('/kiosk/identify');
    }, 200);
  };

  const audioHindi = 'कृपया अपनी पसंदीदा भाषा चुनें।';
  const audioEnglish = 'Please choose your preferred language for consultation.';

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] bg-[#EAEDF0] text-[#212529] justify-between py-6 px-4 sm:px-6 font-sans select-none">
      <main className="max-w-4xl w-full mx-auto flex-1 flex flex-col justify-center items-center text-center">
        
        {/* Bilingual Voice Prompter Bar */}
        <div className="mb-4 sm:mb-6">
          <AudioSpeaker
            hindiText={audioHindi}
            englishText={audioEnglish}
            bilingual={true}
            autoPlay={true}
          />
        </div>

        {/* Title Badge */}
        <div
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[4px] border text-xs sm:text-sm font-bold uppercase tracking-wider mb-3"
          style={{ backgroundColor: '#E8EDF5', borderColor: 'rgba(10, 45, 101, 0.25)', color: 'rgb(10, 45, 101)' }}
        >
          <Globe className="w-4 h-4" />
          <span>भाषा चयन / LANGUAGE SELECTION</span>
        </div>

        {/* Headline */}
        <h1
          className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-2 tracking-tight"
          style={{ color: 'rgb(10, 45, 101)' }}
        >
          आप किस भाषा में बात करना चाहते हैं?
        </h1>
        <p className="text-base sm:text-xl text-[#495057] font-semibold mb-8 sm:mb-10">
          Which language would you prefer for your OPD consultation?
        </p>

        {/* 2 Big Language Cards (Exact match to Image 2) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 w-full max-w-2xl mb-8">
          
          {/* Hindi Card */}
          {(() => {
            const isHoveredOrClicked = hoveredLang === 'hi' || selectedLang === 'hi';

            return (
              <button
                type="button"
                onClick={() => handleSelectLanguage('hi')}
                onMouseEnter={() => setHoveredLang('hi')}
                onMouseLeave={() => setHoveredLang(null)}
                className="group relative p-6 sm:p-8 rounded-[4px] border text-left transition-all duration-150 focus:outline-none focus:ring-4 focus:ring-[#0A2D65]/20 cursor-pointer shadow-sm active:scale-[0.99]"
                style={{
                  backgroundColor: isHoveredOrClicked ? 'rgb(10, 45, 101)' : 'rgb(255, 255, 255)',
                  borderColor: isHoveredOrClicked ? 'rgb(7, 31, 69)' : '#CED4DA',
                  color: isHoveredOrClicked ? 'rgb(255, 255, 255)' : '#212529',
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span
                      className="text-3xl sm:text-4xl font-black block mb-1 tracking-tight"
                      style={{ color: isHoveredOrClicked ? 'rgb(255, 255, 255)' : 'rgb(10, 45, 101)' }}
                    >
                      हिन्दी
                    </span>
                    <span
                      className="text-base sm:text-lg font-bold"
                      style={{ color: isHoveredOrClicked ? 'rgba(255, 255, 255, 0.9)' : '#495057' }}
                    >
                      (Hindi)
                    </span>
                  </div>
                  
                  {/* Status Indicator Box */}
                  <div
                    className="w-11 h-11 rounded-[4px] flex items-center justify-center transition-all"
                    style={{
                      backgroundColor: isHoveredOrClicked ? 'rgb(255, 255, 255)' : '#EAEDF0',
                      color: isHoveredOrClicked ? 'rgb(10, 45, 101)' : '#495057',
                    }}
                  >
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                </div>

                <p
                  className="mt-4 text-xs sm:text-sm font-semibold leading-relaxed border-t pt-3"
                  style={{
                    color: isHoveredOrClicked ? 'rgba(255, 255, 255, 0.95)' : '#495057',
                    borderColor: isHoveredOrClicked ? 'rgba(255, 255, 255, 0.2)' : '#E8EDF5',
                  }}
                >
                  स्क्रीन के सभी प्रश्न एवं आवाज़ हिन्दी में उपलब्ध होंगे।
                </p>
              </button>
            );
          })()}

          {/* English Card */}
          {(() => {
            const isHoveredOrClicked = hoveredLang === 'en' || selectedLang === 'en';

            return (
              <button
                type="button"
                onClick={() => handleSelectLanguage('en')}
                onMouseEnter={() => setHoveredLang('en')}
                onMouseLeave={() => setHoveredLang(null)}
                className="group relative p-6 sm:p-8 rounded-[4px] border text-left transition-all duration-150 focus:outline-none focus:ring-4 focus:ring-[#0A2D65]/20 cursor-pointer shadow-sm active:scale-[0.99]"
                style={{
                  backgroundColor: isHoveredOrClicked ? 'rgb(10, 45, 101)' : 'rgb(255, 255, 255)',
                  borderColor: isHoveredOrClicked ? 'rgb(7, 31, 69)' : '#CED4DA',
                  color: isHoveredOrClicked ? 'rgb(255, 255, 255)' : '#212529',
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span
                      className="text-3xl sm:text-4xl font-black block mb-1 tracking-tight"
                      style={{ color: isHoveredOrClicked ? 'rgb(255, 255, 255)' : 'rgb(10, 45, 101)' }}
                    >
                      English
                    </span>
                    <span
                      className="text-base sm:text-lg font-bold"
                      style={{ color: isHoveredOrClicked ? 'rgba(255, 255, 255, 0.9)' : '#495057' }}
                    >
                      (अंग्रेजी)
                    </span>
                  </div>

                  {/* Status Indicator Box */}
                  <div
                    className="w-11 h-11 rounded-[4px] flex items-center justify-center transition-all"
                    style={{
                      backgroundColor: isHoveredOrClicked ? 'rgb(255, 255, 255)' : '#EAEDF0',
                      color: isHoveredOrClicked ? 'rgb(10, 45, 101)' : '#495057',
                    }}
                  >
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                </div>

                <p
                  className="mt-4 text-xs sm:text-sm font-semibold leading-relaxed border-t pt-3"
                  style={{
                    color: isHoveredOrClicked ? 'rgba(255, 255, 255, 0.95)' : '#495057',
                    borderColor: isHoveredOrClicked ? 'rgba(255, 255, 255, 0.2)' : '#E8EDF5',
                  }}
                >
                  All questionnaire prompts and voice will be in English.
                </p>
              </button>
            );
          })()}

        </div>

        {/* Back Button */}
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-[4px] border border-[#CED4DA] bg-white hover:border-[#0A2D65] hover:text-[#0A2D65] text-xs sm:text-sm font-bold text-[#212529] transition-all cursor-pointer shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>मुख्य पृष्ठ पर वापस जाएं (Back to Welcome)</span>
        </button>

      </main>
    </div>
  );
};
