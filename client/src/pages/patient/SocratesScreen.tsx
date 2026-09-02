import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { AudioSpeaker } from '@/components/ui/AudioSpeaker';
import { useSessionStore } from '@/stores/sessionStore';

interface SocratesQuestion {
  id: string;
  key: string;
  category: string;
  titleHindi: string;
  titleEnglish: string;
  options: Array<{ hindi: string; english: string; value: string }>;
}

const SOCRATES_QUESTIONS: SocratesQuestion[] = [
  {
    id: 'turn-1-site',
    key: 'site',
    category: 'स्थान (Site & Location)',
    titleHindi: 'यह दर्द या समस्या शरीर के किस हिस्से में सबसे ज्यादा महसूस होती है?',
    titleEnglish: 'Where exactly is this trouble located in your body?',
    options: [
      { hindi: 'दोनों घुटने / पैर (Both Knees / Legs)', english: 'Both Knees / Legs', value: 'bilateral-knees' },
      { hindi: 'कमर / रीढ़ की हड्डी (Lower Back / Spine)', english: 'Lower Back / Spine', value: 'lower-back' },
      { hindi: 'पेट / छाती में जलन (Abdomen / Chest Burning)', english: 'Abdomen / Chest Burning', value: 'abdomen-chest' },
      { hindi: 'गर्दन / कंधे / सिर (Neck / Shoulders / Head)', english: 'Neck / Shoulders / Head', value: 'neck-head' },
    ],
  },
  {
    id: 'turn-2-onset',
    key: 'onset',
    category: 'अवधि (Onset & Duration)',
    titleHindi: 'आपको यह तकलीफ कितने समय से परेशान कर रही है?',
    titleEnglish: 'How long have you been suffering from this trouble?',
    options: [
      { hindi: 'हाल ही में (पिछले 1-2 हफ्तों से)', english: 'Recent (Last 1-2 weeks)', value: 'acute-2-weeks' },
      { hindi: '1 से 3 महीने से (Moderate Duration)', english: '1 to 3 months', value: 'subacute-3-months' },
      { hindi: '6 महीने से अधिक समय से (Chronic / पुराना)', english: 'More than 6 months (Chronic)', value: 'chronic-6-months' },
      { hindi: 'कई सालों से बार-बार होता है (Recurrent)', english: 'Recurrent for years', value: 'recurrent-years' },
    ],
  },
  {
    id: 'turn-3-severity',
    key: 'severity',
    category: 'तीव्रता (Severity Scale 1-10)',
    titleHindi: 'तकलीफ या दर्द की तीव्रता 1 से 10 के पैमाने पर कितनी है?',
    titleEnglish: 'On a scale of 1 to 10, how severe is your discomfort?',
    options: [
      { hindi: 'हल्का दर्द (1 से 3) • रोज़मर्रा का काम हो जाता है', english: 'Mild (1 to 3) • Manageable', value: 'mild-3' },
      { hindi: 'मध्यम दर्द (4 से 6) • काम करने में परेशानी', english: 'Moderate (4 to 6) • Hinders routine', value: 'moderate-6' },
      { hindi: 'तेज दर्द (7 से 8) • बैठना-उठना मुश्किल', english: 'Severe (7 to 8) • Significant distress', value: 'severe-8' },
      { hindi: 'असहनीय दर्द (9 से 10) • तुरंत राहत चाहिए', english: 'Very Severe (9 to 10) • Urgent', value: 'unbearable-10' },
    ],
  },
  {
    id: 'turn-4-triggers',
    key: 'timing',
    category: 'घटने-बढ़ने का कारण (Triggers)',
    titleHindi: 'यह दर्द किस समय या किस स्थिति में ज्यादा बढ़ता है?',
    titleEnglish: 'When or under what conditions does this pain worsen?',
    options: [
      { hindi: 'सुबह उठने पर और ठंड के मौसम में', english: 'Morning stiffness & cold weather', value: 'cold-morning' },
      { hindi: 'खाने के तुरंत बाद या खाली पेट', english: 'After food or on empty stomach', value: 'post-meal-empty' },
      { hindi: 'ज्यादा चलने-फिरने या काम करने के बाद', english: 'After physical exertion / walking', value: 'exertion' },
      { hindi: 'रात को सोते समय या आराम करने पर', english: 'During night time / resting', value: 'night-rest' },
    ],
  },
  {
    id: 'turn-5-family',
    key: 'familyHistory',
    category: 'पारिवारिक इतिहास (Family History)',
    titleHindi: 'क्या आपके परिवार में माता-पिता को गठिया, शुगर या सांस की बीमारी रही है?',
    titleEnglish: 'Does anyone in your family have a history of arthritis, diabetes, or asthma?',
    options: [
      { hindi: 'हाँ, माता या पिता को जोड़ों का दर्द / गठिया था', english: 'Yes, family history of arthritis', value: 'family-arthritis' },
      { hindi: 'हाँ, परिवार में शुगर (Diabetes) का इतिहास है', english: 'Yes, family history of diabetes', value: 'family-diabetes' },
      { hindi: 'नहीं, परिवार में ऐसी कोई पुरानी बीमारी नहीं है', english: 'No chronic disease in family', value: 'family-none' },
      { hindi: 'मुझे इस बारे में निश्चित जानकारी नहीं है', english: 'Not sure / Unknown', value: 'family-unknown' },
    ],
  },
];

export const SocratesScreen: React.FC = () => {
  const navigate = useNavigate();
  const { language, setSocratesResponse, chiefComplaint } = useSessionStore();

  const [currentTurn, setCurrentTurn] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const question = SOCRATES_QUESTIONS[currentTurn];

  const handleSelectOption = (optValue: string) => {
    setSelectedOption(optValue);
    setSocratesResponse(question.key as any, optValue);
  };

  const handleNextTurn = () => {
    if (currentTurn < SOCRATES_QUESTIONS.length - 1) {
      setCurrentTurn((prev) => prev + 1);
      setSelectedOption(null);
    } else {
      navigate('/kiosk/prakriti');
    }
  };

  const handlePrevTurn = () => {
    if (currentTurn > 0) {
      setCurrentTurn((prev) => prev - 1);
      setSelectedOption(null);
    } else {
      navigate('/kiosk/complaint');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-76px)] max-h-[calc(100vh-76px)] bg-[#EAEDF0] text-[#212529] justify-between font-sans select-none overflow-hidden">
      
      {/* Non-Scrollable Centered Main Container */}
      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-2 flex-1 flex flex-col justify-evenly items-center">
        
        {/* Top Prompter */}
        <div className="shrink-0">
          <AudioSpeaker
            hindiText={question.titleHindi}
            englishText={question.titleEnglish}
            bilingual={language === 'hi'}
            autoPlay={true}
          />
        </div>

        {/* Progress & Category Header */}
        <div className="w-full max-w-2xl shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <div
              className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-[3px] border text-[11px] font-bold uppercase tracking-wider"
              style={{
                backgroundColor: '#E8F1F8',
                borderColor: 'rgba(11, 95, 165, 0.3)',
                color: '#0B5FA5',
              }}
            >
              <span>SOCRATES विश्लेषण • चरण {currentTurn + 1} / 5</span>
            </div>

            <span className="text-xs font-extrabold text-[#E07B1A]">
              {question.category}
            </span>
          </div>

          <div className="w-full h-1.5 bg-[#CED4DA] rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${((currentTurn + 1) / 5) * 100}%`,
                backgroundColor: '#0B5FA5',
              }}
            />
          </div>
        </div>

        {/* Current Question Container */}
        <div className="w-full max-w-2xl bg-white border border-[#CED4DA] rounded-[3px] p-4 sm:p-5 shrink-0">
          
          <div className="text-[10px] font-extrabold text-[#495057] uppercase tracking-wider mb-0.5">
            मुख्य शिकायत: {chiefComplaint || 'सामान्य परामर्श'}
          </div>

          <h2
            className="text-lg sm:text-2xl font-black mb-3 leading-tight"
            style={{ color: '#0B5FA5' }}
          >
            {language === 'hi' ? question.titleHindi : question.titleEnglish}
          </h2>

          {/* 4 SPACIOUS TOUCH OPTIONS (64px Target Height) */}
          <div className="space-y-2">
            {question.options.map((opt, idx) => {
              const isSelected = selectedOption === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelectOption(opt.value)}
                  className="w-full h-14 sm:h-16 px-4 rounded-[3px] border text-left transition-transform active:scale-[0.98] cursor-pointer flex items-center justify-between"
                  style={{
                    backgroundColor: isSelected ? '#0B5FA5' : '#FFFFFF',
                    borderColor: isSelected ? '#084B83' : '#CED4DA',
                    color: isSelected ? '#FFFFFF' : '#212529',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-7 h-7 rounded-[2px] font-black flex items-center justify-center shrink-0 text-xs"
                      style={{
                        backgroundColor: isSelected ? '#FFFFFF' : '#E8F1F8',
                        color: isSelected ? '#0B5FA5' : '#0B5FA5',
                      }}
                    >
                      {idx + 1}
                    </div>
                    <span
                      className="text-xs sm:text-sm font-extrabold"
                      style={{ color: isSelected ? '#FFFFFF' : '#212529' }}
                    >
                      {language === 'hi' ? opt.hindi : opt.english}
                    </span>
                  </div>

                  <div
                    className="w-5 h-5 rounded-[2px] border flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: isSelected ? '#FFFFFF' : '#EAEDF0',
                      borderColor: isSelected ? '#FFFFFF' : '#CED4DA',
                      color: isSelected ? '#0B5FA5' : '#495057',
                    }}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </button>
              );
            })}
          </div>

        </div>

        {/* Bottom Navigation Buttons */}
        <div className="w-full max-w-2xl flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handlePrevTurn}
            className="py-3 px-5 rounded-[3px] border border-[#CED4DA] bg-white hover:border-[#0B5FA5] hover:text-[#0B5FA5] text-xs font-bold text-[#212529] flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{currentTurn === 0 ? 'शिकायत बदलें' : 'पिछला प्रश्न'}</span>
          </button>

          <button
            type="button"
            onClick={handleNextTurn}
            disabled={!selectedOption}
            className="py-3 px-6 rounded-[3px] border border-[#084B83] text-sm font-black text-white flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-transform active:scale-[0.98]"
            style={{ backgroundColor: '#0B5FA5' }}
          >
            <span>
              {currentTurn === SOCRATES_QUESTIONS.length - 1
                ? 'प्रकृति परीक्षण आरंभ करें • PROCEED TO PRAKRITI'
                : 'अगला प्रश्न • NEXT QUESTION'}
            </span>
            <ArrowRight className="w-4 h-4 text-white" />
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
            <span>SOCRATES Clinical History Protocol</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
