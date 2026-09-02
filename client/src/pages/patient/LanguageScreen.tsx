import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, ArrowLeft, Check, Search } from 'lucide-react';
import { AudioSpeaker } from '@/components/ui/AudioSpeaker';
import { useSessionStore, LanguageCode } from '@/stores/sessionStore';

interface LanguageOption {
  code: LanguageCode;
  nativeName: string;
  englishName: string;
  script: string;
  region: string;
  sampleGreeting: string;
}

const ALL_22_LANGUAGES: LanguageOption[] = [
  // Top 4 Regional / National Primary
  { code: 'hi', nativeName: 'हिन्दी', englishName: 'Hindi', script: 'Devanagari', region: 'National / North', sampleGreeting: 'नमस्ते' },
  { code: 'en', nativeName: 'English', englishName: 'English', script: 'Latin', region: 'National / Global', sampleGreeting: 'Welcome' },
  { code: 'pa', nativeName: 'ਪੰਜਾਬੀ', englishName: 'Punjabi', script: 'Gurmukhi', region: 'North', sampleGreeting: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ' },
  { code: 'ur', nativeName: 'اردو', englishName: 'Urdu', script: 'Nastaliq', region: 'North / Deccan', sampleGreeting: 'آداب' },

  // Eastern & North-Eastern
  { code: 'bn', nativeName: 'বাংলা', englishName: 'Bengali', script: 'Bengali', region: 'East', sampleGreeting: 'নমস্কার' },
  { code: 'as', nativeName: 'অসমীয়া', englishName: 'Assamese', script: 'Bengali-Assamese', region: 'North-East', sampleGreeting: 'নমস্কাৰ' },
  { code: 'or', nativeName: 'ଓଡ଼ିଆ', englishName: 'Odia', script: 'Odia', region: 'East', sampleGreeting: 'ନମସ୍କାର' },
  { code: 'mai', nativeName: 'मैथिली', englishName: 'Maithili', script: 'Devanagari', region: 'East', sampleGreeting: 'प्रणाम' },
  { code: 'mni', nativeName: 'মৈতৈলোন্ / Manipuri', englishName: 'Manipuri', script: 'Meitei Mayek', region: 'North-East', sampleGreeting: 'Khurumjari' },
  { code: 'brx', nativeName: 'बड़ो / Bodo', englishName: 'Bodo', script: 'Devanagari', region: 'North-East', sampleGreeting: 'Kulumbai' },
  { code: 'sat', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ / Santhali', englishName: 'Santhali', script: 'Ol Chiki', region: 'East', sampleGreeting: 'Johar' },

  // Western & Central
  { code: 'mr', nativeName: 'मराठी', englishName: 'Marathi', script: 'Devanagari', region: 'West', sampleGreeting: 'नमस्कार' },
  { code: 'gu', nativeName: 'ગુજરાતી', englishName: 'Gujarati', script: 'Gujarati', region: 'West', sampleGreeting: 'નમસ્તે' },
  { code: 'kok', nativeName: 'कोंकणी', englishName: 'Konkani', script: 'Devanagari', region: 'West', sampleGreeting: 'नमस्कार' },
  { code: 'sd', nativeName: 'سنڌي / सिन्धी', englishName: 'Sindhi', script: 'Perso-Arabic', region: 'West', sampleGreeting: 'Jai Jhulelal' },

  // Southern
  { code: 'ta', nativeName: 'தமிழ்', englishName: 'Tamil', script: 'Tamil', region: 'South', sampleGreeting: 'வணக்கம்' },
  { code: 'te', nativeName: 'తెలుగు', englishName: 'Telugu', script: 'Telugu', region: 'South', sampleGreeting: 'నమస్కారం' },
  { code: 'kn', nativeName: 'ಕನ್ನಡ', englishName: 'Kannada', script: 'Kannada', region: 'South', sampleGreeting: 'ನಮಸ್ಕಾರ' },
  { code: 'ml', nativeName: 'മലയാളം', englishName: 'Malayalam', script: 'Malayalam', region: 'South', sampleGreeting: 'നമസ്കാരം' },

  // Northern & Himalayan
  { code: 'ks', nativeName: 'کٲشُر / Kashmiri', englishName: 'Kashmiri', script: 'Perso-Arabic', region: 'North', sampleGreeting: 'Salam' },
  { code: 'doi', nativeName: 'डोगरी', englishName: 'Dogri', script: 'Devanagari', region: 'North', sampleGreeting: 'नमस्ते' },
  { code: 'ne', nativeName: 'नेपाली', englishName: 'Nepali', script: 'Devanagari', region: 'North', sampleGreeting: 'नमस्ते' },
  { code: 'sa', nativeName: 'संस्कृतम्', englishName: 'Sanskrit', script: 'Devanagari', region: 'Classical', sampleGreeting: 'नमस्ते' },
];

export const LanguageScreen: React.FC = () => {
  const navigate = useNavigate();
  const { setLanguage } = useSessionStore();
  const [selectedLang, setSelectedLang] = useState<LanguageCode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSelectLanguage = (langCode: LanguageCode) => {
    setSelectedLang(langCode);
    setLanguage(langCode);
    setTimeout(() => {
      navigate('/kiosk/identify');
    }, 200);
  };

  const filteredLanguages = ALL_22_LANGUAGES.filter(
    (l) =>
      l.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const promptHindi = 'कृपया अपनी पसंदीदा भाषा चुनें। स्क्रीन पर दी गई किसी भी भाषा पर स्पर्श करें।';
  const promptEnglish = 'Please select your preferred language for consultation.';

  return (
    <div className="flex flex-col min-h-[calc(100vh-76px)] bg-[#EAEDF0] text-[#212529] justify-between font-sans select-none">
      
      {/* Central Content */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-8 flex-1 flex flex-col items-center">
        
        {/* Top Prompter Bar */}
        <div className="mb-3">
          <AudioSpeaker
            hindiText={promptHindi}
            englishText={promptEnglish}
            bilingual={true}
            autoPlay={true}
          />
        </div>

        {/* Header Badge */}
        <div
          className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-[3px] border text-[11px] font-bold uppercase tracking-wider mb-1.5"
          style={{
            backgroundColor: '#E8F1F8',
            borderColor: 'rgba(11, 95, 165, 0.3)',
            color: '#0B5FA5',
          }}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>भारत की 22 आधिकारिक भाषाएं / 22 SCHEDULED LANGUAGES</span>
        </div>

        <h1
          className="text-2xl sm:text-4xl font-black mb-1 tracking-tight text-center"
          style={{ color: '#0B5FA5' }}
        >
          अपनी भाषा चुनें • Select Your Language
        </h1>
        <p className="text-xs sm:text-sm text-[#495057] font-semibold mb-4 text-center max-w-xl">
          आप जिस भाषा में सहज महसूस करते हैं, उसे चुनें। पूरा कियोस्क उसी भाषा में बोलेगा और सुनेगा।
        </p>

        {/* Quick Search Box for Kiosk Assistant */}
        <div className="w-full max-w-md mb-4 relative">
          <input
            type="text"
            placeholder="भाषा खोजें / Search Language..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3.5 py-2 pl-9 bg-white border border-[#CED4DA] rounded-[3px] text-xs font-semibold text-[#212529] focus:outline-none focus:border-[#0B5FA5]"
          />
          <Search className="w-4 h-4 text-[#6C757D] absolute left-3 top-2.5" />
        </div>

        {/* TOP 4 QUICK PICKS */}
        {!searchQuery && (
          <div className="w-full max-w-4xl mb-3">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#495057] mb-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-[#0B5FA5] rounded-full inline-block"></span>
              <span>प्रमुख भाषाएं / Top Regional Picks</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {ALL_22_LANGUAGES.slice(0, 4).map((lang) => {
                const isSelected = selectedLang === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleSelectLanguage(lang.code)}
                    className="p-3 sm:p-4 rounded-[3px] border text-left transition-colors cursor-pointer active:scale-[0.99]"
                    style={{
                      backgroundColor: isSelected ? '#0B5FA5' : '#FFFFFF',
                      borderColor: isSelected ? '#084B83' : '#CED4DA',
                      color: isSelected ? '#FFFFFF' : '#212529',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span
                          className="text-xl sm:text-2xl font-black block leading-tight"
                          style={{ color: isSelected ? '#FFFFFF' : '#0B5FA5' }}
                        >
                          {lang.nativeName}
                        </span>
                        <span
                          className="text-xs font-bold block"
                          style={{ color: isSelected ? 'rgba(255,255,255,0.9)' : '#495057' }}
                        >
                          {lang.englishName}
                        </span>
                      </div>
                      <div
                        className="w-6 h-6 rounded-[2px] border flex items-center justify-center shrink-0 text-xs"
                        style={{
                          backgroundColor: isSelected ? '#FFFFFF' : '#EAEDF0',
                          borderColor: isSelected ? '#FFFFFF' : '#CED4DA',
                          color: isSelected ? '#0B5FA5' : '#495057',
                        }}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ALL 22 CONSTITUTIONAL LANGUAGES GRID */}
        <div className="w-full max-w-4xl flex-1 mb-4">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#495057] mb-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-[#2F7D4F] rounded-full inline-block"></span>
            <span>सभी 22 संवैधानिक भाषाएं / All 22 Scheduled Languages ({filteredLanguages.length})</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-[42vh] overflow-y-auto pr-1">
            {filteredLanguages.map((lang) => {
              const isSelected = selectedLang === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelectLanguage(lang.code)}
                  className="p-2.5 rounded-[3px] border text-left transition-colors cursor-pointer active:scale-[0.99] flex flex-col justify-between"
                  style={{
                    backgroundColor: isSelected ? '#0B5FA5' : '#FFFFFF',
                    borderColor: isSelected ? '#084B83' : '#CED4DA',
                    color: isSelected ? '#FFFFFF' : '#212529',
                  }}
                >
                  <div className="flex items-start justify-between">
                    <span
                      className="text-base sm:text-lg font-black leading-tight truncate"
                      style={{ color: isSelected ? '#FFFFFF' : '#0B5FA5' }}
                    >
                      {lang.nativeName}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-white stroke-[3] shrink-0" />}
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[11px] font-semibold text-[#495057]">
                    <span style={{ color: isSelected ? 'rgba(255,255,255,0.9)' : '#495057' }}>
                      {lang.englishName}
                    </span>
                    <span
                      className="text-[9px] px-1 py-0.2 rounded-[2px]"
                      style={{
                        backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : '#F1F5F9',
                        color: isSelected ? '#FFFFFF' : '#64748B',
                      }}
                    >
                      {lang.region}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Back Button */}
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[3px] border border-[#CED4DA] bg-white hover:border-[#0B5FA5] hover:text-[#0B5FA5] text-xs font-bold text-[#212529] transition-all cursor-pointer mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>मुख्य पृष्ठ पर वापस जाएं (Back to Welcome)</span>
        </button>

      </main>

      {/* Persistent Single-Line Clean Footer */}
      <footer className="w-full bg-white border-t border-[#CED4DA] py-2 px-6 text-xs text-[#495057] select-none">
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
