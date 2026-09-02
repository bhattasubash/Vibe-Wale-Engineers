import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PhoneCall } from 'lucide-react';
import { StateEmblem } from '@/components/ui/StateEmblem';
import { useSessionStore } from '@/stores/sessionStore';

export const KioskHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage } = useSessionStore();

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between">
        
        {/* Left: Ashoka Lion Capital Emblem + Ministry & Institute Typography */}
        <div
          onClick={() => navigate('/')}
          className="flex items-center gap-3 cursor-pointer group"
          title="Return to Welcome Screen"
        >
          {/* Authentic Ashoka Lion Capital (Emblem with सत्यमेव जयते) */}
          <div className="shrink-0 flex items-center justify-center">
            <StateEmblem className="w-9 h-11 text-[#212529]" />
          </div>

          <div className="flex flex-col border-l border-[#CED4DA] pl-3 py-0.5">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#495057] leading-none">
              भारत सरकार / Government of India
            </span>
            <span
              className="text-sm sm:text-lg font-black tracking-tight leading-tight mt-0.5"
              style={{ color: '#0B5FA5' }}
            >
              {language === 'hi' ? 'आयुष मंत्रालय' : 'Ministry of Ayush'}
            </span>
            <span className="text-[10px] sm:text-xs font-bold text-[#495057] leading-none mt-0.5">
              {language === 'hi'
                ? 'अखिल भारतीय आयुर्वेद संस्थान (AIIA), नई दिल्ली'
                : 'All India Institute of Ayurveda (AIIA), New Delhi'}
            </span>
          </div>
        </div>

        {/* Right: Quick Accessibility Tools (Inline Language Switcher & Helpline) */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Inline Language Toggle Button */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] border border-[#CED4DA] bg-[#F8FAFC] hover:bg-[#E8F1F8] hover:border-[#0B5FA5] text-xs font-bold transition-colors cursor-pointer"
            style={{ color: '#0B5FA5' }}
            title="Toggle between Hindi and English"
          >
            <span className="font-extrabold">{language === 'hi' ? 'अ/A' : 'A/अ'}</span>
            <span className="hidden sm:inline">
              {language === 'hi' ? 'Switch to English' : 'हिन्दी में बदलें'}
            </span>
          </button>

          {/* OPD Helpline Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] border border-[#CED4DA] bg-[#F8FAFC] text-xs font-bold text-[#495057]">
            <PhoneCall className="w-3.5 h-3.5" style={{ color: '#0B5FA5' }} />
            <span className="font-semibold text-[11px] sm:text-xs">1800-11-2233</span>
          </div>

        </div>

      </div>

    </header>
  );
};
