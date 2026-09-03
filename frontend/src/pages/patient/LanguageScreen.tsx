import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, ArrowLeft, Check, ChevronRight } from 'lucide-react';
import { AudioSpeaker } from '@/components/ui/AudioSpeaker';
import { useSessionStore, LanguageCode } from '@/stores/sessionStore';

interface LanguageOption {
  code: LanguageCode;
  nativeName: string;
  englishName: string;
  region: string;
}

const TOP_LANGUAGES: LanguageOption[] = [
  { code: 'hi', nativeName: 'हिन्दी', englishName: 'Hindi', region: 'National / North' },
  { code: 'en', nativeName: 'English', englishName: 'English', region: 'National / Global' },
  { code: 'pa', nativeName: 'ਪੰਜਾਬੀ', englishName: 'Punjabi', region: 'North' },
  { code: 'ur', nativeName: 'اردو', englishName: 'Urdu', region: 'North / Deccan' },
];

const OTHER_18_LANGUAGES: LanguageOption[] = [
  { code: 'bn', nativeName: 'বাংলা', englishName: 'Bengali', region: 'East' },
  { code: 'te', nativeName: 'తెలుగు', englishName: 'Telugu', region: 'South' },
  { code: 'mr', nativeName: 'मराठी', englishName: 'Marathi', region: 'West' },
  { code: 'ta', nativeName: 'தமிழ்', englishName: 'Tamil', region: 'South' },
  { code: 'gu', nativeName: 'ગુજરાતી', englishName: 'Gujarati', region: 'West' },
  { code: 'kn', nativeName: 'ಕನ್ನಡ', englishName: 'Kannada', region: 'South' },
  { code: 'ml', nativeName: 'മലയാളം', englishName: 'Malayalam', region: 'South' },
  { code: 'or', nativeName: 'ଓଡ଼ିଆ', englishName: 'Odia', region: 'East' },
  { code: 'as', nativeName: 'অসমীয়া', englishName: 'Assamese', region: 'North-East' },
  { code: 'mai', nativeName: 'मैथिली', englishName: 'Maithili', region: 'East' },
  { code: 'sa', nativeName: 'संस्कृतम्', englishName: 'Sanskrit', region: 'Classical' },
  { code: 'ne', nativeName: 'नेपाली', englishName: 'Nepali', region: 'North' },
  { code: 'doi', nativeName: 'डोगरी', englishName: 'Dogri', region: 'North' },
  { code: 'kok', nativeName: 'कोंकणी', englishName: 'Konkani', region: 'West' },
  { code: 'ks', nativeName: 'کٲشُر', englishName: 'Kashmiri', region: 'North' },
  { code: 'sd', nativeName: 'سنڌي / सिन्धी', englishName: 'Sindhi', region: 'West' },
  { code: 'sat', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ', englishName: 'Santhali', region: 'East' },
  { code: 'brx', nativeName: 'बड़ो', englishName: 'Bodo', region: 'North-East' },
];

export const LanguageScreen: React.FC = () => {
  const navigate = useNavigate();
  const { setLanguage } = useSessionStore();
  const [selectedLang, setSelectedLang] = useState<LanguageCode | null>(null);
  const [showAllLanguages, setShowAllLanguages] = useState(false);

  const handleSelectLanguage = (langCode: LanguageCode) => {
    setSelectedLang(langCode);
    setLanguage(langCode);
    setTimeout(() => {
      navigate('/kiosk/identify');
    }, 150);
  };

  const promptHindi = 'कृपया अपनी पसंदीदा भाषा चुनें। स्क्रीन पर दी गई किसी भी भाषा पर स्पर्श करें।';
  const promptEnglish = 'Please choose your preferred language for consultation.';

  return (
    <div className="flex flex-col h-[calc(100vh-76px)] max-h-[calc(100vh-76px)] bg-[#EAEDF0] text-[#212529] justify-between font-sans select-none overflow-hidden">
      
      {/* Non-Scrollable Centered Main Container */}
      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-2 flex-1 flex flex-col justify-evenly items-center">
        
        {/* Top Prompter */}
        <div className="shrink-0">
          <AudioSpeaker
            hindiText={promptHindi}
            englishText={promptEnglish}
            bilingual={true}
            autoPlay={true}
          />
        </div>

        {/* Title Area */}
        <div className="text-center shrink-0">
          <div
            className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-[3px] border text-[11px] font-bold uppercase tracking-wider mb-1"
            style={{
              backgroundColor: '#E8F1F8',
              borderColor: 'rgba(11, 95, 165, 0.3)',
              color: '#0B5FA5',
            }}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>भाषा चयन / LANGUAGE SELECTION</span>
          </div>

          <h1
            className="text-2xl sm:text-4xl font-black tracking-tight leading-tight"
            style={{ color: '#0B5FA5' }}
          >
            अपनी भाषा चुनें • Select Language
          </h1>
          <p className="text-xs sm:text-sm text-[#495057] font-semibold">
            कियोस्क आपकी चुनी हुई भाषा में बोलेगा और सुनेगा।
          </p>
        </div>

        {/* PRIMARY VIEW: 4 LARGE HIGH-RHYTHM REGIONAL CARDS */}
        {!showAllLanguages ? (
          <div className="w-full max-w-2xl space-y-3 shrink-0">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {TOP_LANGUAGES.map((lang) => {
                const isSelected = selectedLang === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleSelectLanguage(lang.code)}
                    className="h-24 sm:h-28 p-4 rounded-[3px] border text-left transition-transform active:scale-[0.98] cursor-pointer flex flex-col justify-between"
                    style={{
                      backgroundColor: isSelected ? '#0B5FA5' : '#FFFFFF',
                      borderColor: isSelected ? '#084B83' : '#CED4DA',
                      color: isSelected ? '#FFFFFF' : '#212529',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="text-2xl sm:text-3xl font-black tracking-tight"
                        style={{ color: isSelected ? '#FFFFFF' : '#0B5FA5' }}
                      >
                        {lang.nativeName}
                      </span>
                      <div
                        className="w-7 h-7 rounded-[2px] border flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: isSelected ? '#FFFFFF' : '#EAEDF0',
                          borderColor: isSelected ? '#FFFFFF' : '#CED4DA',
                          color: isSelected ? '#0B5FA5' : '#495057',
                        }}
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    </div>
                    <span
                      className="text-xs sm:text-sm font-bold"
                      style={{ color: isSelected ? 'rgba(255,255,255,0.9)' : '#495057' }}
                    >
                      {lang.englishName} ({lang.region})
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Expander Button for other 18 languages */}
            <button
              type="button"
              onClick={() => setShowAllLanguages(true)}
              className="w-full py-3 px-4 rounded-[3px] border border-[#CED4DA] bg-white hover:bg-[#E8F1F8] hover:border-[#0B5FA5] text-xs font-black text-[#0B5FA5] flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <span>अन्य 18 संवैधानिक भाषाएं देखें (View All 22 Scheduled Languages)</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* SECONDARY VIEW: COMPACT 18 CONSTITUTIONAL LANGUAGES */
          <div className="w-full max-w-3xl space-y-2 shrink-0">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {OTHER_18_LANGUAGES.map((lang) => {
                const isSelected = selectedLang === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleSelectLanguage(lang.code)}
                    className="h-16 p-2 rounded-[3px] border text-left transition-transform active:scale-[0.98] cursor-pointer flex flex-col justify-between"
                    style={{
                      backgroundColor: isSelected ? '#0B5FA5' : '#FFFFFF',
                      borderColor: isSelected ? '#084B83' : '#CED4DA',
                      color: isSelected ? '#FFFFFF' : '#212529',
                    }}
                  >
                    <span
                      className="text-sm font-black truncate"
                      style={{ color: isSelected ? '#FFFFFF' : '#0B5FA5' }}
                    >
                      {lang.nativeName}
                    </span>
                    <span
                      className="text-[10px] font-bold truncate"
                      style={{ color: isSelected ? 'rgba(255,255,255,0.9)' : '#6C757D' }}
                    >
                      {lang.englishName}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setShowAllLanguages(false)}
              className="w-full py-2.5 px-4 rounded-[3px] border border-[#CED4DA] bg-white text-xs font-black text-[#495057] hover:bg-[#EAEDF0] flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>← मुख्य 4 भाषाओं पर वापस जाएं (Back to Primary 4 Languages)</span>
            </button>
          </div>
        )}

        {/* Back Button */}
        <div className="shrink-0">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[3px] border border-[#CED4DA] bg-white hover:border-[#0B5FA5] hover:text-[#0B5FA5] text-xs font-bold text-[#212529] transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>मुख्य पृष्ठ पर वापस जाएं (Back to Welcome)</span>
          </button>
        </div>

      </main>

      {/* Persistent Single-Line Clean Footer */}
      <footer className="w-full bg-white border-t border-[#CED4DA] py-2 px-6 text-xs text-[#495057] select-none shrink-0">
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
