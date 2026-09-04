import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Activity, Check, Volume2 } from 'lucide-react';
import { AudioSpeaker } from '@/components/ui/AudioSpeaker';
import { useSessionStore } from '@/stores/sessionStore';
import { speechEngine } from '@/lib/speech';

export interface SocratesQuestion {
  key: string;
  titleHindi: string;
  titleEnglish: string;
  options: Array<{
    value: string;
    hindi: string;
    english: string;
  }>;
}

const SOCRATES_QUESTIONS: SocratesQuestion[] = [
  {
    key: 'site',
    titleHindi: 'दर्द या तकलीफ शरीर के किस हिस्से में सबसे ज्यादा महसूस हो रही है?',
    titleEnglish: 'Where is the pain or discomfort located?',
    options: [
      { value: 'bilateral-knees', hindi: 'दोनों घुटने व जोड़ (Bilateral Knees)', english: 'Bilateral Knees & Joints' },
      { value: 'epigastrium', hindi: 'पेट का ऊपरी हिस्सा / छाती (Epigastrium)', english: 'Upper Abdomen / Chest' },
      { value: 'lower-back', hindi: 'कमर का निचला हिस्सा (Lumbar/Spine)', english: 'Lower Back & Spine' },
      { value: 'general-body', hindi: 'पूरे शरीर में भारीपन व थकान (Generalized)', english: 'Whole Body / Fatigue' },
    ],
  },
  {
    key: 'onset',
    titleHindi: 'यह तकलीफ कब से शुरू हुई है?',
    titleEnglish: 'When did this problem start?',
    options: [
      { value: 'acute-few-days', hindi: 'कुछ ही दिनों से (Recent / Acute)', english: 'Past few days (Acute)' },
      { value: 'subacute-few-weeks', hindi: '2 से 4 सप्ताह से (Subacute)', english: '2 to 4 weeks' },
      { value: 'chronic-6-months', hindi: '6 महीने या उससे अधिक (Chronic / पुराना)', english: '6+ months (Chronic)' },
      { value: 'years-recurrent', hindi: 'सालों से बार-बार होती है (Recurrent)', english: 'Recurrent for years' },
    ],
  },
  {
    key: 'severity',
    titleHindi: 'तकलीफ की गंभीरता (दर्द का स्तर) 1 से 10 के पैमाने पर कितनी है?',
    titleEnglish: 'How severe is the discomfort on a scale of 1 to 10?',
    options: [
      { value: 'mild-3', hindi: 'हल्का दर्द (1 से 3) - काम में रुकावट नहीं', english: 'Mild (1-3) - Manageable' },
      { value: 'moderate-6', hindi: 'मध्यम दर्द (4 से 6) - उठने-बैठने में कष्ट', english: 'Moderate (4-6) - Affects mobility' },
      { value: 'severe-8', hindi: 'तेज दर्द (7 से 8) - बिना सहारे चलना मुश्किल', english: 'Severe (7-8) - Severe pain' },
      { value: 'unbearable-10', hindi: 'असहनीय दर्द (9 से 10) - तत्काल राहत चाहिए', english: 'Unbearable (9-10) - Critical' },
    ],
  },
  {
    key: 'timing',
    titleHindi: 'यह तकलीफ किस समय या किस स्थिति में ज्यादा बढ़ जाती है?',
    titleEnglish: 'When or in what situation does the problem worsen?',
    options: [
      { value: 'cold-morning', hindi: 'सुबह उठने पर व ठंड के मौसम में (Morning/Cold)', english: 'Morning stiffness / Cold' },
      { value: 'post-meal', hindi: 'भोजन के तुरंत बाद या खाली पेट (Post-Meal)', english: 'After meals / Empty stomach' },
      { value: 'physical-exertion', hindi: 'पैदल चलने व सीढ़ी चढ़ने पर (Exertion)', english: 'Walking / Climbing stairs' },
      { value: 'night-rest', hindi: 'रात को सोते समय (At Night)', english: 'During sleep / Night' },
    ],
  },
  {
    key: 'familyHistory',
    titleHindi: 'क्या परिवार में माता-पिता या भाई-बहन को भी ऐसी समस्या रही है?',
    titleEnglish: 'Is there any family history of this health condition?',
    options: [
      { value: 'family-arthritis', hindi: 'हाँ, माता या पिता को जोड़ों/गठिया का दर्द रहा है', english: 'Yes, family history of arthritis' },
      { value: 'family-digestive', hindi: 'हाँ, परिवार में पेट व पाचन की समस्या रही है', english: 'Yes, family history of digestive issues' },
      { value: 'family-metabolic', hindi: 'हाँ, मधुमेह (शुगर) या उच्च रक्तचाप (BP)', english: 'Yes, diabetes or hypertension' },
      { value: 'family-none', hindi: 'नहीं, परिवार में किसी को ऐसा रोग नहीं है', english: 'No, no such family history' },
    ],
  },
];

export const SocratesScreen: React.FC = () => {
  const navigate = useNavigate();
  const {
    language,
    setSocratesResponse,
    chiefComplaint,
    treatmentMode,
    activeQuestionSet,
  } = useSessionStore();

  const [currentTurn, setCurrentTurn] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const questionsList =
    activeQuestionSet?.questions && activeQuestionSet.questions.length > 0
      ? activeQuestionSet.questions.map((q) => ({
          key: q.key,
          titleHindi: q.titleHindi,
          titleEnglish: q.titleEnglish,
          options: q.options.map((opt) => ({
            value: opt.value,
            hindi: opt.hindi,
            english: opt.english,
          })),
        }))
      : SOCRATES_QUESTIONS;

  const totalQuestions = questionsList.length;
  const question = questionsList[Math.min(currentTurn, totalQuestions - 1)];

  const handleSelectOption = (optValue: string) => {
    speechEngine.stop();
    setSelectedOption(optValue);
    setSocratesResponse(question.key as any, optValue);
  };

  const handleSpeakOption = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    speechEngine.stop();
    speechEngine.speak(text, language);
  };

  const handleNextTurn = () => {
    speechEngine.stop();
    if (currentTurn < totalQuestions - 1) {
      setCurrentTurn((prev) => prev + 1);
      setSelectedOption(null);
    } else {
      if (treatmentMode === 'allopathy') {
        navigate('/kiosk/vitals');
      } else {
        navigate('/kiosk/prakriti');
      }
    }
  };

  const handlePrevTurn = () => {
    speechEngine.stop();
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
              <Activity className="w-3.5 h-3.5" />
              <span>
                {activeQuestionSet?.title
                  ? `${activeQuestionSet.title} • प्रश्न ${currentTurn + 1} / ${totalQuestions}`
                  : `SOCRATES नैदानिक प्रश्न ${currentTurn + 1} / ${totalQuestions}`}
              </span>
            </div>

            <span className="text-xs font-extrabold text-[#495057] truncate max-w-xs">
              लक्षण: {chiefComplaint || 'जोड़ों का दर्द (संधिवात)'}
            </span>
          </div>

          <div className="w-full h-1.5 bg-[#CED4DA] rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${((currentTurn + 1) / totalQuestions) * 100}%`,
                backgroundColor: '#0B5FA5',
              }}
            />
          </div>
        </div>

        {/* Current Question Container */}
        <div className="w-full max-w-2xl bg-white border border-[#CED4DA] rounded-[3px] p-4 sm:p-5 shrink-0">
          
          <div className="text-[10px] font-bold text-[#6C757D] uppercase tracking-wider mb-0.5">
            लक्षण विस्तृत विश्लेषण (Adaptive Clinical Exploration)
          </div>

          <h2
            className="text-lg sm:text-2xl font-black mb-3 leading-tight"
            style={{ color: '#0B5FA5' }}
          >
            {language === 'hi' ? question.titleHindi : question.titleEnglish}
          </h2>

          {/* 4 SPACIOUS TOUCH OPTIONS WITH PER-OPTION AUDIO SPEAKER BUTTONS */}
          <div className="space-y-2">
            {question.options.map((opt, idx) => {
              const isSelected = selectedOption === opt.value;
              const optionText = language === 'hi' ? opt.hindi : opt.english;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelectOption(opt.value)}
                  className="w-full h-14 sm:h-16 px-4 rounded-[3px] border text-left transition-transform active:scale-[0.98] cursor-pointer flex items-center justify-between group"
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
                        color: '#0B5FA5',
                      }}
                    >
                      {idx + 1}
                    </div>
                    <span
                      className="text-xs sm:text-sm font-extrabold"
                      style={{ color: isSelected ? '#FFFFFF' : '#212529' }}
                    >
                      {optionText}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {/* Dedicated Per-Option Speaker Button */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={(e) => handleSpeakOption(e, optionText)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') handleSpeakOption(e as any, optionText);
                      }}
                      className="w-7 h-7 rounded-[2px] border flex items-center justify-center transition-transform active:scale-90 hover:opacity-90 cursor-pointer"
                      style={{
                        backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.2)' : '#F1F5F9',
                        borderColor: isSelected ? 'rgba(255, 255, 255, 0.4)' : '#CBD5E1',
                        color: isSelected ? '#FFFFFF' : '#0B5FA5',
                      }}
                      title="इस विकल्प को आवाज़ में सुनें (Listen aloud)"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </div>

                    {/* Check Indicator */}
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
                  </div>
                </button>
              );
            })}
          </div>

        </div>

        {/* 2 LARGE ACTION BUTTONS */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-2xl shrink-0">
          <button
            type="button"
            onClick={handlePrevTurn}
            className="h-12 sm:h-14 px-4 rounded-[3px] border border-[#CED4DA] bg-white hover:bg-[#EAEDF0] font-black text-xs sm:text-sm text-[#495057] flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.98]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{currentTurn === 0 ? 'शिकायत पर वापस' : 'पिछला सवाल (Previous)'}</span>
          </button>

          <button
            type="button"
            onClick={handleNextTurn}
            disabled={selectedOption === null}
            className="h-12 sm:h-14 px-6 rounded-[3px] border font-black text-sm sm:text-base text-white flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: selectedOption !== null ? '#0B5FA5' : '#6C757D',
              borderColor: selectedOption !== null ? '#084B83' : '#495057',
            }}
          >
            <span>
              {currentTurn === SOCRATES_QUESTIONS.length - 1
                ? (treatmentMode === 'allopathy' ? 'सामान्य जांच शुरू करें • START VITALS' : 'प्रकृति परीक्षण शुरू करें • START PRAKRITI')
                : 'अगला सवाल • NEXT'}
            </span>
            <ArrowRight className="w-5 h-5 text-white" />
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
          <div className="flex items-center gap-1 text-[11px] font-semibold text-[#6C757D]">
            <span>SOCRATES Clinical Protocol • Standard OPD Triage</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
