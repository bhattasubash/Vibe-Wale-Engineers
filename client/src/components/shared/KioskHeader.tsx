import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PhoneCall, Check } from 'lucide-react';
import { useSessionStore } from '@/stores/sessionStore';

export const KioskHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage } = useSessionStore();

  const isInitialLanguageRoute =
    location.pathname === '/' ||
    location.pathname === '/kiosk' ||
    location.pathname === '/kiosk/language';

  const toggleLanguage = () => {
    const nextLang = language === 'hi' ? 'en' : 'hi';
    setLanguage(nextLang);
  };

  return (
    <header className="w-full bg-white border-b border-[#CED4DA] select-none sticky top-0 z-40">
      
      {/* 1. Indian National Tricolor Continuous Strip (Saffron, White, Green in Equal Thirds, No Gaps) */}
      <div className="w-full h-1.5 flex flex-row">
        <div className="w-1/3 h-full bg-[#FF9933]" />
        <div className="w-1/3 h-full bg-[#FFFFFF]" />
        <div className="w-1/3 h-full bg-[#138808]" />
      </div>

      {/* 2. Official Government Branding Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between">
        
        {/* Left: Ashoka Lion Capital Emblem + Ministry & Institute Typography */}
        <div
          onClick={() => navigate('/')}
          className="flex items-center gap-3 cursor-pointer group"
          title="Return to Welcome Screen"
        >
          {/* Authentic Ashoka Lion Capital SVG */}
          <div className="shrink-0 flex items-center justify-center">
            <svg
              viewBox="0 0 100 130"
              className="w-7 h-9 text-[#212529] fill-current"
              aria-label="National Emblem of India"
            >
              <path d="M50 5 C42 5 36 12 36 20 C36 24 38 28 41 31 C35 34 30 40 30 48 C30 54 33 59 38 62 C34 66 31 72 31 78 L69 78 C69 72 66 66 62 62 C67 59 70 54 70 48 C70 40 65 34 59 31 C62 28 64 24 64 20 C64 12 58 5 50 5 Z M50 12 C54 12 57 15 57 20 C57 24 54 27 50 27 C46 27 43 24 43 20 C43 15 46 12 50 12 Z" />
              <rect x="25" y="82" width="50" height="10" rx="1" fill="#212529" />
              <circle cx="50" cy="87" r="3.5" fill="#FFFFFF" />
              <path d="M20 96 L80 96 L75 106 L25 106 Z" fill="#212529" />
              <text
                x="50"
                y="120"
                textAnchor="middle"
                fontSize="11"
                fontWeight="900"
                fontFamily="Noto Sans Devanagari, sans-serif"
                fill="#212529"
              >
                सत्यमेव जयते
              </text>
            </svg>
          </div>

          <div className="flex flex-col border-l border-[#CED4DA] pl-2.5 py-0.5">
            <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-[#495057] leading-none">
              भारत सरकार / Government of India
            </span>
            <span
              className="text-xs sm:text-base font-black tracking-tight leading-tight mt-0.5"
              style={{ color: '#0B5FA5' }}
            >
              {language === 'hi' ? 'आयुष मंत्रालय' : 'Ministry of Ayush'}
            </span>
            <span className="text-[9px] sm:text-[10px] font-bold text-[#495057] leading-none mt-0.5">
              {language === 'hi'
                ? 'अखिल भारतीय आयुर्वेद संस्थान (AIIA), नई दिल्ली'
                : 'All India Institute of Ayurveda (AIIA), New Delhi'}
            </span>
          </div>
        </div>

        {/* Right: Conditional Language Switcher (Only on S-01 & S-02) OR Locked Language Badge */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {isInitialLanguageRoute ? (
            /* Switcher Button on Welcome and Language Screens */
            <button
              type="button"
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] border border-[#CED4DA] bg-[#F8FAFC] hover:bg-[#E8F1F8] hover:border-[#0B5FA5] text-xs font-bold transition-transform active:scale-[0.98] cursor-pointer"
              style={{ color: '#0B5FA5' }}
              title="Toggle between Hindi and English"
            >
              <span className="font-extrabold">{language === 'hi' ? 'अ/A' : 'A/अ'}</span>
              <span className="hidden sm:inline">
                {language === 'hi' ? 'Switch to English' : 'हिन्दी में बदलें'}
              </span>
            </button>
          ) : (
            /* Discrete Locked Status Badge after language is selected */
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] bg-[#E8F1F8] border border-[#0B5FA5]/30 text-xs font-bold text-[#0B5FA5]">
              <Check className="w-3.5 h-3.5 text-[#0B5FA5]" />
              <span>{language === 'hi' ? 'भाषा: हिन्दी' : 'Language: English'}</span>
            </div>
          )}

          {/* OPD Helpline Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] border border-[#CED4DA] bg-[#F8FAFC] text-xs font-bold text-[#495057]">
            <PhoneCall className="w-3.5 h-3.5" style={{ color: '#0B5FA5' }} />
            <span className="font-semibold text-[11px]">1800-11-2233</span>
          </div>

        </div>

      </div>

    </header>
  );
};
