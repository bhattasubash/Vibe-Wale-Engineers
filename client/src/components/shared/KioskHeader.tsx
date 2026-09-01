import React from 'react';
import { Search, Mic, ChevronDown, Volume2, PhoneCall } from 'lucide-react';
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
      
      {/* 1. Indian National Tricolor Accent Bar */}
      <div className="h-1 w-full flex">
        <div className="w-1/3 bg-[#FF9933]" />
        <div className="w-1/3 bg-white" />
        <div className="w-1/3 bg-[#138808]" />
      </div>

      {/* 2. Official Ministry Header Row */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: State Emblem & Ministry Title */}
        <div className="flex items-center gap-3">
          <div className="text-[#212529] flex items-center justify-center shrink-0">
            <StateEmblem className="w-9 h-12 sm:w-10 sm:h-14" />
          </div>

          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-[#495057] leading-tight">
              {language === 'hi' ? 'भारत सरकार' : 'Government of India'}
            </span>
            <span
              className="text-lg sm:text-2xl font-extrabold tracking-tight leading-tight"
              style={{ color: 'rgb(10, 45, 101)' }}
            >
              {language === 'hi' ? 'आयुष मंत्रालय' : 'Ministry of Ayush'}
            </span>
            <span className="text-[11px] sm:text-xs font-bold text-[#0066CC] leading-tight mt-0.5">
              {language === 'hi'
                ? 'अखिल भारतीय आयुर्वेद संस्थान (AIIA), नई दिल्ली'
                : 'All India Institute of Ayurveda (AIIA), New Delhi'}
            </span>
          </div>
        </div>

        {/* Right: Search + Minimal Inline Language Switcher */}
        <div className="flex items-center gap-3 flex-wrap">
          
          {/* Flat Search Bar */}
          <div className="hidden lg:flex items-center border border-[#CED4DA] bg-white">
            <input
              type="text"
              readOnly
              placeholder={
                language === 'hi'
                  ? 'हिंदी में टाइप करें (namaste → नमस्ते)'
                  : 'Search services...'
              }
              className="px-2.5 py-1 text-xs text-[#212529] placeholder:text-[#6C757D] w-52 focus:outline-none bg-transparent"
            />
            <button
              type="button"
              onClick={speakHeader}
              className="px-2 py-1 border-l border-[#CED4DA] bg-gray-50 text-[#495057]"
              title="Voice Prompt"
            >
              <Mic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              className="px-2.5 py-1 text-white bg-[#0066CC] hover:bg-[#0052A3]"
              title="Search"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Minimal Inline Language Toggle (Matching Real Gov Portal) */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="flex items-center gap-1 text-xs sm:text-sm font-bold text-[#212529] px-2.5 py-1 border border-[#CED4DA] bg-gray-50 hover:bg-gray-100"
            title="Switch Language / भाषा बदलें"
          >
            <span className="font-extrabold">{language === 'hi' ? 'अ/A' : 'A/अ'}</span>
            <span className="underline" style={{ color: 'rgb(10, 45, 101)' }}>
              {language === 'hi' ? 'Switch to English' : 'हिन्दी में बदलें'}
            </span>
          </button>

          {/* Audio Assist */}
          <button
            type="button"
            onClick={speakHeader}
            className="p-1 text-[#495057] hover:text-[#0A2D65]"
            title="Audio Assistance"
          >
            <Volume2 className="w-4 h-4" />
          </button>

          {/* OPD Helpdesk */}
          <div className="hidden sm:flex items-center gap-1.5 text-[#495057] bg-[#EAEDF0] px-2.5 py-1 border border-[#CED4DA] text-xs font-bold">
            <PhoneCall className="w-3.5 h-3.5 text-[#0A2D65]" />
            <span>1800-11-2233</span>
          </div>

        </div>

      </div>

      {/* 3. Utilitarian Government Menu Bar */}
      <nav className="w-full border-t border-[#CED4DA] bg-white text-xs font-bold text-[#212529]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center justify-between overflow-x-auto py-1.5">
          <div className="flex items-center gap-5 sm:gap-7 whitespace-nowrap">
            
            <span
              className="font-extrabold border-b-2 pb-0.5 cursor-pointer"
              style={{ color: 'rgb(10, 45, 101)', borderColor: 'rgb(10, 45, 101)' }}
            >
              {language === 'hi' ? 'मुख्य पृष्ठ' : 'Home'}
            </span>

            <span className="flex items-center gap-1 text-[#495057] hover:text-[#0A2D65] cursor-pointer">
              <span>{language === 'hi' ? 'मंत्रालय के बारे में' : 'About Us'}</span>
              <ChevronDown className="w-3 h-3 text-[#6C757D]" />
            </span>

            <span className="flex items-center gap-1 text-[#495057] hover:text-[#0A2D65] cursor-pointer">
              <span>{language === 'hi' ? 'ओपीडी केस-टेकिंग' : 'OPD Case-Taking'}</span>
              <ChevronDown className="w-3 h-3 text-[#6C757D]" />
            </span>

            <span className="flex items-center gap-1 text-[#495057] hover:text-[#0A2D65] cursor-pointer">
              <span>{language === 'hi' ? 'प्रकृति परीक्षण' : 'Prakriti Assessment'}</span>
              <ChevronDown className="w-3 h-3 text-[#6C757D]" />
            </span>

            <span className="flex items-center gap-1 text-[#495057] hover:text-[#0A2D65] cursor-pointer">
              <span>{language === 'hi' ? 'दस्तावेज़' : 'Documents'}</span>
              <ChevronDown className="w-3 h-3 text-[#6C757D]" />
            </span>

            <span className="flex items-center gap-1 text-[#495057] hover:text-[#0A2D65] cursor-pointer">
              <span>{language === 'hi' ? 'हमसे संपर्क करें' : 'Contact Us'}</span>
              <ChevronDown className="w-3 h-3 text-[#6C757D]" />
            </span>

          </div>

          <div className="hidden md:flex items-center gap-2 text-xs font-bold text-[#0A2D65] bg-[#EAEDF0] px-2 py-0.5 border border-[#CED4DA]">
            <span>{language === 'hi' ? 'कियोस्क टर्मिनल 01' : 'Kiosk Terminal 01'}</span>
          </div>
        </div>
      </nav>

    </header>
  );
};
