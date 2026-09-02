import React from 'react';
import { Volume2, PhoneCall } from 'lucide-react';
import { StateEmblem } from './StateEmblem';
import { useSessionStore } from '@/stores/sessionStore';
import { speechEngine } from '@/lib/speech';

export const KioskHeader: React.FC = () => {
  const { language, setLanguage } = useSessionStore();

  const toggleLanguage = () => {
    setLanguage(language === 'hi' ? 'en' : 'hi');
  };

  const speakHeader = () => {
    const text = language === 'hi'
      ? 'भारत सरकार, आयुष मंत्रालय, अखिल भारतीय आयुर्वेद संस्थान, नई दिल्ली'
      : 'Government of India, Ministry of Ayush, All India Institute of Ayurveda, New Delhi';
    speechEngine.speak(text, language);
  };

  return (
    <header className="w-full bg-white border-b border-[#CED4DA] select-none">
      
      {/* 1. Indian National Tricolor Accent Ribbon */}
      <div className="h-1 w-full flex">
        <div className="w-1/3 bg-[#FF9933]" />
        <div className="w-1/3 bg-white" />
        <div className="w-1/3 bg-[#138808]" />
      </div>

      {/* 2. Official Ministry Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: State Emblem (Ashoka Lion Capital) & Ministry Typography */}
        <div className="flex items-center gap-3.5">
          <div className="text-[#212529] flex items-center justify-center shrink-0">
            <StateEmblem className="w-10 h-13 sm:w-11 sm:h-15" />
          </div>

          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-[#495057] leading-tight">
              {language === 'hi' ? 'भारत सरकार' : 'Government of India'}
            </span>
            <span
              className="text-xl sm:text-2xl font-extrabold tracking-tight leading-tight"
              style={{ color: 'rgb(10, 45, 101)' }}
            >
              {language === 'hi' ? 'आयुष मंत्रालय' : 'Ministry of Ayush'}
            </span>
            <span className="text-[11px] sm:text-xs font-bold text-[#0066CC] mt-0.5">
              {language === 'hi'
                ? 'अखिल भारतीय आयुर्वेद संस्थान (AIIA), नई दिल्ली'
                : 'All India Institute of Ayurveda (AIIA), New Delhi'}
            </span>
          </div>
        </div>

        {/* Right: Inline Language Switcher & OPD Helpdesk */}
        <div className="flex items-center gap-3">
          
          {/* Official Inline Language Toggle */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-[#CED4DA] bg-white hover:bg-gray-50 text-xs sm:text-sm font-bold text-[#212529] transition-colors focus:outline-none cursor-pointer"
            title="Switch Language / भाषा बदलें"
          >
            <span className="font-extrabold" style={{ color: 'rgb(10, 45, 101)' }}>
              {language === 'hi' ? 'अ/A' : 'A/अ'}
            </span>
            <span className="underline">
              {language === 'hi' ? 'Switch to English' : 'हिन्दी में बदलें'}
            </span>
          </button>

          {/* OPD Helpdesk badge */}
          <div className="hidden sm:flex items-center gap-1.5 text-[#495057] bg-[#EAEDF0] px-3 py-1.5 border border-[#CED4DA] text-xs font-bold">
            <PhoneCall className="w-3.5 h-3.5 text-[#0A2D65]" />
            <span>1800-11-2233</span>
          </div>

        </div>

      </div>
    </header>
  );
};
