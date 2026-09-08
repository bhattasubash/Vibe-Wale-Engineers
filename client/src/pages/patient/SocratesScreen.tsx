import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Activity, Check, Volume2 } from 'lucide-react';
import { AudioSpeaker } from '@/components/ui/AudioSpeaker';
import { VoiceAnswerButton } from '@/components/ui/VoiceAnswerButton';
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
    titleHindi: 'दर्द या परेशानी शरीर के किस हिस्से में सबसे ज्यादा महसूस हो रही है?',
    titleEnglish: 'Where in your body is the discomfort primarily located?',
    options: [
      { value: 'head-neck', hindi: 'सिर / गर्दन / गला', english: 'Head, Neck & Throat' },
      { value: 'chest-abdomen', hindi: 'छाती / पेट का ऊपरी हिस्सा', english: 'Chest & Upper Abdomen' },
      { value: 'back-spine', hindi: 'कमर / पीठ / पेट का निचला हिस्सा', english: 'Lower Back, Spine & Pelvis' },
      { value: 'limbs-joints', hindi: 'हाथ / पैर / घुटने व जोड़', english: 'Arms, Legs, Knees & Joints' },
      { value: 'general-skin', hindi: 'पूरे शरीर में / त्वचा पर', english: 'Generalized / Skin / Whole Body' },
    ],
  },
  {
    key: 'onset',
    titleHindi: 'यह तकलीफ कब से शुरू हुई है?',
    titleEnglish: 'When did this problem start?',
    options: [
      { value: 'acute-few-days', hindi: 'कुछ ही दिनों से (1 से 7 दिन)', english: 'Past few days (1 to 7 days)' },
      { value: 'subacute-few-weeks', hindi: '2 से 4 सप्ताह से', english: '2 to 4 weeks' },
      { value: 'chronic-6-months', hindi: '6 महीने या उससे अधिक (पुराना रोग)', english: '6+ months (Chronic)' },
      { value: 'years-recurrent', hindi: 'सालों से बार-बार होती है', english: 'Recurrent for years' },
    ],
  },
  {
    key: 'severity',
    titleHindi: 'तकलीफ की तीव्रता (दर्द का स्तर) 1 से 10 के पैमाने पर कितनी है?',
    titleEnglish: 'How severe is the discomfort on a scale of 1 to 10?',
    options: [
      { value: 'mild-3', hindi: 'हल्का (1–3): दैनिक कार्य सामान्य रूप से संभव हैं', english: 'Mild (1-3): Normal activities manageable' },
      { value: 'moderate-6', hindi: 'मध्यम (4–6): काम करने या उठने-बैठने में कष्ट', english: 'Moderate (4-6): Interferes with work or movement' },
      { value: 'severe-8', hindi: 'तेज (7–8): बिना सहारे चलना या बैठना मुश्किल', english: 'Severe (7-8): Severe pain, restricts mobility' },
      { value: 'unbearable-10', hindi: 'असहनीय (9–10): अत्यधिक कष्ट, तत्काल राहत चाहिए', english: 'Very Severe (9-10): Unbearable, urgent relief needed' },
    ],
  },
  {
    key: 'timing',
    titleHindi: 'यह तकलीफ किस समय या किस स्थिति में अधिक महसूस होती है?',
    titleEnglish: 'When or in what situation is this trouble most noticeable?',
    options: [
      { value: 'morning-cold', hindi: 'सुबह उठने पर या ठंड के मौसम में', english: 'Morning time or in cold weather' },
      { value: 'meals', hindi: 'भोजन के बाद या खाली पेट', english: 'After meals or on an empty stomach' },
      { value: 'exertion', hindi: 'काम करने, चलने या सीढ़ी चढ़ने पर', english: 'During physical work, walking or stairs' },
      { value: 'night-rest', hindi: 'शाम को या रात को सोते समय', english: 'In the evening or during sleep at night' },
      { value: 'constant', hindi: 'दिनभर लगभग एक जैसी बनी रहती है', english: 'Constant throughout the day' },
    ],
  },
  {
    key: 'familyHistory',
    titleHindi: 'क्या परिवार में किसी अन्य सदस्य को भी ऐसी समस्या रही है?',
    titleEnglish: 'Has anyone in your family had a similar condition?',
    options: [
      { value: 'family-similar', hindi: 'हाँ, माता-पिता या भाई-बहन को यही रोग रहा है', english: 'Yes, same condition in parents or siblings' },
      { value: 'family-chronic', hindi: 'हाँ, परिवार में मधुमेह (शुगर) या उच्च रक्तचाप (BP) है', english: 'Yes, family history of diabetes or blood pressure' },
      { value: 'family-none', hindi: 'नहीं, परिवार में किसी को ऐसा रोग नहीं है', english: 'No, no such history in the family' },
      { value: 'family-unsure', hindi: 'मुझे इस बारे में निश्चित जानकारी नहीं है', english: 'I am not sure / Don’t know' },
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

  const handleVoiceAnswer = (transcript: string) => {
    const lower = transcript.toLowerCase();
    const currentQ = questionsList[currentTurn];
    if (!currentQ) return;

    let matchedVal: string | null = null;
    currentQ.options.forEach((opt, idx) => {
      const optHindi = opt.hindi.toLowerCase();
      const optEng = opt.english.toLowerCase();
      if (
        lower.includes(optHindi) ||
        lower.includes(optEng) ||
        (idx === 0 && (lower.includes('पहला') || lower.includes('first') || lower.includes('1') || lower.includes('one'))) ||
        (idx === 1 && (lower.includes('दूसरा') || lower.includes('second') || lower.includes('2') || lower.includes('two'))) ||
        (idx === 2 && (lower.includes('तीसरा') || lower.includes('third') || lower.includes('3') || lower.includes('three'))) ||
        (idx === 3 && (lower.includes('चौथा') || lower.includes('fourth') || lower.includes('4') || lower.includes('four'))) ||
        (idx === 4 && (lower.includes('पांचवां') || lower.includes('fifth') || lower.includes('5') || lower.includes('five')))
      ) {
        matchedVal = opt.value;
      }
    });

    if (matchedVal) {
      handleSelectOption(matchedVal);
    } else {
      for (const opt of currentQ.options) {
        const words = (opt.hindi + ' ' + opt.english).toLowerCase().split(/\s+/);
        if (words.some((w) => w.length > 3 && lower.includes(w))) {
          handleSelectOption(opt.value);
          return;
        }
      }
      if (currentQ.options[0]) handleSelectOption(currentQ.options[0].value);
    }
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
                {language === 'hi'
                  ? `स्वास्थ्य विवरण • प्रश्न ${currentTurn + 1} / ${totalQuestions}`
                  : `Health Details • Question ${currentTurn + 1} of ${totalQuestions}`}
              </span>
            </div>

            <span className="text-xs font-extrabold text-[#495057] truncate max-w-xs">
              {chiefComplaint ? `लक्षण: ${chiefComplaint}` : 'लक्षण विवरण'}
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
            {language === 'hi' ? 'एक विकल्प चुनें (Single Choice):' : 'Select one option:'}
          </div>

          <div className="flex items-start justify-between gap-3 mb-3">
            <h2
              className="text-lg sm:text-2xl font-black leading-tight flex-1"
              style={{ color: '#0B5FA5' }}
            >
              {language === 'hi' ? question.titleHindi : question.titleEnglish}
            </h2>
            <VoiceAnswerButton
              language={language}
              onTranscript={handleVoiceAnswer}
              size="sm"
            />
          </div>

          {/* TOUCH OPTIONS WITH RADIO BUTTON INDICATOR & AUDIO BUTTON */}
          <div className="space-y-2">
            {question.options.map((opt, idx) => {
              const isSelected = selectedOption === opt.value;
              const optionText = language === 'hi' ? opt.hindi : opt.english;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelectOption(opt.value)}
                  className="w-full min-h-[50px] sm:min-h-[56px] py-2 px-4 rounded-[3px] border text-left transition-transform active:scale-[0.98] cursor-pointer flex items-center justify-between group"
                  style={{
                    backgroundColor: isSelected ? '#0B5FA5' : '#FFFFFF',
                    borderColor: isSelected ? '#084B83' : '#CED4DA',
                    color: isSelected ? '#FFFFFF' : '#212529',
                  }}
                >
                  <div className="flex items-center gap-3">
                    {/* Radio Button Indicator */}
                    <div
                      className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
                      style={{
                        borderColor: isSelected ? '#FFFFFF' : '#0B5FA5',
                        backgroundColor: isSelected ? '#FFFFFF' : 'transparent',
                      }}
                    >
                      {isSelected && (
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: '#0B5FA5' }}
                        />
                      )}
                    </div>
                    <span
                      className="text-xs sm:text-sm font-extrabold leading-snug"
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
                      title="इस विकल्प को सुनें"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
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
            <span>{currentTurn === 0 ? 'लक्षण पर वापस' : 'पिछला सवाल (Previous)'}</span>
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
              {currentTurn === totalQuestions - 1
                ? (treatmentMode === 'allopathy' ? 'सामान्य जांच शुरू करें (Next)' : 'प्रकृति परीक्षण शुरू करें (Next)')
                : 'अगला सवाल (Next)'}
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
            <span className="font-semibold text-[#495057]">नई दिल्ली</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-[#6C757D]">
            <span>राष्ट्रीय आयुष मिशन • ओपीडी सहायता प्रणाली</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
