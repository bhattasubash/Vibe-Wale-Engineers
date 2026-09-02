import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, ArrowLeft, Check } from 'lucide-react';
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
    <div className="flex flex-col min-h-[calc(100vh-76px)] bg-[#EAEDF0] text-[#212529] justify-between py-6 px-4 sm:px-6 font-sans select-none">
      <main className="max-w-3xl w-full mx-auto flex-1 flex flex-col justify-center items-center text-center">
        
        {/* Bilingual Voice Prompter Bar */}
        <div className="mb-4">
          <AudioSpeaker
            hindiText={audioHindi}
            englishText={audioEnglish}
            bilingual={true}
            autoPlay={true}
          />
        </div>

        {/* Title Badge in ABDM Blue */}
        <div
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[3px] border text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-2.5"
          style={{
            backgroundColor: '#E8F1F8',
            borderColor: 'rgba(11, 95, 165, 0.3)',
            color: '#0B5FA5',
          }}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>भाषा चयन / LANGUAGE SELECTION</span>
        </div>

        {/* Headline in Trust Blue */}
        <h1
          className="text-2xl sm:text-4xl md:text-5xl font-black mb-1.5 tracking-tight"
          style={{ color: '#0B5FA5' }}
        >
          आप किस भाषा में बात करना चाहते हैं?
        </h1>
        <p className="text-sm sm:text-lg text-[#495057] font-semibold mb-6 sm:mb-8">
          Which language would you prefer for your OPD consultation?
        </p>

        {/* 2 Big Language Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full max-w-xl mb-6">
          
          {/* Hindi Card */}
          {(() => {
            const isHoveredOrClicked = hoveredLang === 'hi' || selectedLang === 'hi';

            return (
              <button
                type="button"
                onClick={() => handleSelectLanguage('hi')}
                onMouseEnter={() => setHoveredLang('hi')}
                onMouseLeave={() => setHoveredLang(null)}
                className="group relative p-5 sm:p-6 rounded-[3px] border text-left transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#0B5FA5]/30 cursor-pointer active:scale-[0.99]"
                style={{
                  backgroundColor: isHoveredOrClicked ? '#0B5FA5' : '#FFFFFF',
                  borderColor: isHoveredOrClicked ? '#084B83' : '#CED4DA',
                  color: isHoveredOrClicked ? '#FFFFFF' : '#212529',
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span
                      className="text-2xl sm:text-3xl font-black block mb-0.5 tracking-tight"
                      style={{ color: isHoveredOrClicked ? '#FFFFFF' : '#0B5FA5' }}
                    >
                      हिन्दी
                    </span>
                    <span
                      className="text-sm sm:text-base font-bold"
                      style={{ color: isHoveredOrClicked ? 'rgba(255, 255, 255, 0.9)' : '#495057' }}
                    >
                      (Hindi)
                    </span>
                  </div>
                  
                  {/* Status Indicator Box */}
                  <div
                    className="w-8 h-8 rounded-[2px] border flex items-center justify-center transition-all"
                    style={{
                      backgroundColor: isHoveredOrClicked ? '#FFFFFF' : '#EAEDF0',
                      borderColor: isHoveredOrClicked ? '#FFFFFF' : '#CED4DA',
                      color: isHoveredOrClicked ? '#0B5FA5' : '#495057',
                    }}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                </div>

                <p
                  className="mt-3 text-xs font-semibold leading-relaxed border-t pt-2.5"
                  style={{
                    color: isHoveredOrClicked ? 'rgba(255, 255, 255, 0.95)' : '#495057',
                    borderColor: isHoveredOrClicked ? 'rgba(255, 255, 255, 0.2)' : '#E8F1F8',
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
                className="group relative p-5 sm:p-6 rounded-[3px] border text-left transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#0B5FA5]/30 cursor-pointer active:scale-[0.99]"
                style={{
                  backgroundColor: isHoveredOrClicked ? '#0B5FA5' : '#FFFFFF',
                  borderColor: isHoveredOrClicked ? '#084B83' : '#CED4DA',
                  color: isHoveredOrClicked ? '#FFFFFF' : '#212529',
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span
                      className="text-2xl sm:text-3xl font-black block mb-0.5 tracking-tight"
                      style={{ color: isHoveredOrClicked ? '#FFFFFF' : '#0B5FA5' }}
                    >
                      English
                    </span>
                    <span
                      className="text-sm sm:text-base font-bold"
                      style={{ color: isHoveredOrClicked ? 'rgba(255, 255, 255, 0.9)' : '#495057' }}
                    >
                      (अंग्रेजी)
                    </span>
                  </div>

                  {/* Status Indicator Box */}
                  <div
                    className="w-8 h-8 rounded-[2px] border flex items-center justify-center transition-all"
                    style={{
                      backgroundColor: isHoveredOrClicked ? '#FFFFFF' : '#EAEDF0',
                      borderColor: isHoveredOrClicked ? '#FFFFFF' : '#CED4DA',
                      color: isHoveredOrClicked ? '#0B5FA5' : '#495057',
                    }}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                </div>

                <p
                  className="mt-3 text-xs font-semibold leading-relaxed border-t pt-2.5"
                  style={{
                    color: isHoveredOrClicked ? 'rgba(255, 255, 255, 0.95)' : '#495057',
                    borderColor: isHoveredOrClicked ? 'rgba(255, 255, 255, 0.2)' : '#E8F1F8',
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
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-[3px] border border-[#CED4DA] bg-white hover:border-[#0B5FA5] hover:text-[#0B5FA5] text-xs font-bold text-[#212529] transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>मुख्य पृष्ठ पर वापस जाएं (Back to Welcome)</span>
        </button>

      </main>

      {/* Persistent Single-Line Clean Kiosk Footer */}
      <footer className="w-full bg-white border-t border-[#CED4DA] py-2.5 px-6 text-xs text-[#495057] select-none">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-left">
          <div className="flex items-center gap-2 font-bold" style={{ color: '#0B5FA5' }}>
            <span>अखिल भारतीय आयुर्वेद संस्थान (AIIA)</span>
            <span className="text-[#CED4DA]">|</span>
            <span className="font-semibold text-[#495057]">OPD Terminal #01</span>
          </div>
          <div className="text-[11px] font-semibold text-[#6C757D]">
            <span>राष्ट्रीय आयुष हेल्पलाइन: 1800-11-2233</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
