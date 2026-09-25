import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Volume2, PenLine } from 'lucide-react';
import { AudioSpeaker } from '@/components/ui/AudioSpeaker';
import { VoiceAnswerButton } from '@/components/ui/VoiceAnswerButton';
import { useSessionStore } from '@/stores/sessionStore';
import { speechEngine } from '@/lib/speech';

export interface SocratesQuestion {
  key: string;
  titleHindi: string;
  titleEnglish: string;
  category?: string;
  options: Array<{
    value: string;
    hindi: string;
    english: string;
  }>;
}

const DEFAULT_SOCRATES_QUESTIONS: SocratesQuestion[] = [
  {
    key: 'site',
    titleHindi: 'तकलीफ शरीर में कहाँ है?',
    titleEnglish: 'Where in your body is the discomfort?',
    category: 'स्थान (Location)',
    options: [
      { value: 'head-neck', hindi: 'सिर या गर्दन', english: 'Head or Neck' },
      { value: 'chest-breathing', hindi: 'छाती या सांस नली', english: 'Chest or Breathing' },
      { value: 'abdomen', hindi: 'पेट या पाचन तंत्र', english: 'Abdomen or Digestion' },
      { value: 'limbs-joints', hindi: 'हाथ, पैर या जोड़', english: 'Limbs or Joints' },
      { value: 'whole-body', hindi: 'पूरे शरीर में', english: 'All over the body' },
    ],
  },
  {
    key: 'onset',
    titleHindi: 'यह आज से शुरू हुई, कुछ दिन पहले से, कुछ हफ्ते पहले से, या एक महीने से भी ज़्यादा समय से है?',
    titleEnglish: 'Did this start today, a few days ago, a few weeks ago, or longer than a month ago?',
    category: 'अवधि (Duration)',
    options: [
      { value: 'today', hindi: 'आज से', english: 'Today' },
      { value: 'few_days_ago', hindi: 'कुछ दिन पहले से', english: 'A few days ago' },
      { value: 'few_weeks_ago', hindi: 'कुछ हफ्ते पहले से', english: 'A few weeks ago' },
      { value: 'longer_than_month', hindi: 'एक महीने से भी ज़्यादा समय से', english: 'Longer than a month ago' },
    ],
  },
  {
    key: 'anger_irritation',
    titleHindi: 'क्या यह तकलीफ आपको गुस्सा या चिड़चिड़ा महसूस कराती है?',
    titleEnglish: 'Does this discomfort make you feel angry or irritated?',
    category: 'मानसिक प्रभाव (Emotional Impact)',
    options: [
      { value: 'yes', hindi: 'हाँ', english: 'Yes' },
      { value: 'no', hindi: 'नहीं', english: 'No' },
    ],
  },
  {
    key: 'timing',
    titleHindi: 'यह रात में ज़्यादा होता है, खाने के बाद ज़्यादा होता है, या हिलने-डुलने से ज़्यादा होता है?',
    titleEnglish: 'Is it worse at night, worse after eating, or worse with movement?',
    category: 'समय व कारक (Timing & Triggers)',
    options: [
      { value: 'night_worse', hindi: 'रात में ज़्यादा', english: 'Worse at night' },
      { value: 'after_eating_worse', hindi: 'खाने के बाद ज़्यादा', english: 'Worse after eating' },
      { value: 'movement_worse', hindi: 'हिलने-डुलने से ज़्यादा', english: 'Worse with movement' },
      { value: 'constant', hindi: 'दिनभर एक जैसा', english: 'Constant throughout day' },
    ],
  },
  {
    key: 'familyHistory',
    titleHindi: 'परिवार में किसी को ऐसी ही तकलीफ रही है — जैसे बीपी, शुगर, दिल की बीमारी, या ऐसी ही जोड़ों, पेट, या त्वचा की तकलीफ?',
    titleEnglish: 'Has anyone in your family had similar problems — like BP, sugar, heart problems, or similar joint/stomach/skin trouble?',
    category: 'पारिवारिक इतिहास (Family History)',
    options: [
      { value: 'yes_family', hindi: 'हाँ, परिवार में है', english: 'Yes, family history present' },
      { value: 'no_family', hindi: 'नहीं, किसी को नहीं', english: 'No, no family history' },
      { value: 'unsure', hindi: 'निश्चित जानकारी नहीं', english: 'Not sure / Don’t know' },
    ],
  },
];

export const SocratesScreen: React.FC = () => {
  const navigate = useNavigate();
  const {
    language,
    socrates,
    setSocratesResponse,
    chiefComplaint,
    treatmentMode,
    activeQuestionSet,
    dynamicQuestions,
  } = useSessionStore();

  const [currentTurn, setCurrentTurn] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [customAnswer, setCustomAnswer] = useState<string>('');
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);

  // Dynamic question selection (Gemini inferred question set -> dynamic questions -> default)
  const questionsList: SocratesQuestion[] = useMemo(() => {
    if (activeQuestionSet?.questions && activeQuestionSet.questions.length > 0) {
      return activeQuestionSet.questions.map((q) => ({
        key: q.key,
        category: q.category,
        titleHindi: q.titleHindi,
        titleEnglish: q.titleEnglish,
        options: q.options.map((opt) => ({
          value: opt.value,
          hindi: opt.hindi,
          english: opt.english,
        })),
      }));
    }
    if (dynamicQuestions && dynamicQuestions.length > 0) {
      return dynamicQuestions.map((q) => ({
        key: q.key,
        category: q.category,
        titleHindi: q.titleHindi,
        titleEnglish: q.titleEnglish,
        options: q.options.map((opt) => ({
          value: opt.value,
          hindi: opt.hindi,
          english: opt.english,
        })),
      }));
    }
    return DEFAULT_SOCRATES_QUESTIONS;
  }, [activeQuestionSet, dynamicQuestions]);

  const totalQuestions = questionsList.length;
  const question = questionsList[Math.min(currentTurn, totalQuestions - 1)];

  // Initialize or restore answer when turn changes
  useEffect(() => {
    speechEngine.stop();
    setVoiceNotice(null);
    if (!question) return;

    const existingAnswer = (socrates as any)[question.key];
    if (existingAnswer) {
      const isPreset = question.options.some((opt) => opt.value === existingAnswer);
      if (isPreset) {
        setSelectedOption(existingAnswer);
        setCustomAnswer('');
      } else {
        setSelectedOption('__custom__');
        setCustomAnswer(String(existingAnswer));
      }
    } else {
      setSelectedOption(null);
      setCustomAnswer('');
    }
  }, [currentTurn, question?.key]);

  const handleSelectOption = (optValue: string) => {
    speechEngine.stop();
    setSelectedOption(optValue);
    setVoiceNotice(null);
    setSocratesResponse(question.key as any, optValue);
  };

  const handleCustomInputChange = (text: string) => {
    setCustomAnswer(text);
    setSelectedOption('__custom__');
    setVoiceNotice(null);
    if (text.trim()) {
      setSocratesResponse(question.key as any, text.trim());
    }
  };

  const handleSelectCustom = () => {
    speechEngine.stop();
    setSelectedOption('__custom__');
    if (customAnswer.trim()) {
      setSocratesResponse(question.key as any, customAnswer.trim());
    }
  };

  const handleVoiceAnswer = (transcript: string) => {
    const lower = transcript.toLowerCase();
    const currentQ = questionsList[currentTurn];
    if (!currentQ) return;

    // Check if voice matched one of the preset options
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
      setVoiceNotice(language === 'hi' ? `विकल्प चुना गया: ${transcript}` : `Option selected: ${transcript}`);
    } else {
      // Freeform speech: populate custom answer so no patient words are lost
      handleCustomInputChange(transcript);
      setVoiceNotice(language === 'hi' ? `बोला गया विवरण दर्ज: "${transcript}"` : `Recorded response: "${transcript}"`);
    }
  };

  const handleSpeakOption = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    speechEngine.stop();
    speechEngine.speak(text, language);
  };

  const isCurrentAnswerValid =
    selectedOption !== null &&
    (selectedOption !== '__custom__' || customAnswer.trim().length > 0);

  const handleNextTurn = () => {
    speechEngine.stop();
    if (!isCurrentAnswerValid) return;

    if (currentTurn < totalQuestions - 1) {
      setCurrentTurn((prev) => prev + 1);
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
    } else {
      navigate('/kiosk/complaint');
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-76px)] bg-transparent text-[#212529] justify-between font-sans select-none overflow-y-auto">
      
      {/* Centered Main Container */}
      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-3 flex-1 flex flex-col justify-evenly items-center">
        
        {/* Top Prompter */}
        <div className="shrink-0 mb-1">
          <AudioSpeaker
            key={`socrates-turn-${currentTurn}-${question.key}`}
            hindiText={question.titleHindi}
            englishText={question.titleEnglish}
            autoPlay={true}
          />
        </div>

        {/* Progress Header */}
        <div className="w-full max-w-2xl shrink-0 mb-3">
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
        <div className="w-full max-w-2xl bg-white border border-[#CED4DA] rounded-[3px] p-4 sm:p-5 shrink-0 mb-3 shadow-xs">
          
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[10px] font-bold text-[#6C757D] uppercase tracking-wider">
              {question.category || (language === 'hi' ? 'नैदानिक विवरण:' : 'Clinical Parameter:')}
            </span>

            {/* Voice notice feedback chip */}
            {voiceNotice && (
              <span className="text-[11px] font-bold text-[#15803D] bg-[#F0FDF4] px-2 py-0.5 rounded border border-[#15803D]/30 truncate max-w-xs">
                ✓ {voiceNotice}
              </span>
            )}
          </div>

          {/* Question Title & Dedicated Voice Input Button */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <h2
              className="text-lg sm:text-2xl font-black leading-tight flex-1"
              style={{ color: '#0B5FA5' }}
            >
              {language === 'hi' ? question.titleHindi : question.titleEnglish}
            </h2>

            {/* Prominent Voice Answer Button for EVERY question turn */}
            <div className="shrink-0">
              <VoiceAnswerButton
                language={language}
                onTranscript={handleVoiceAnswer}
                size="md"
                label={language === 'hi' ? 'बोलकर जवाब दें' : 'Tap to Speak'}
              />
            </div>
          </div>

          {/* TOUCH PRESET OPTIONS */}
          <div className="space-y-2 mb-3">
            {question.options.map((opt, idx) => {
              const isSelected = selectedOption === opt.value;
              const optionText = language === 'hi' ? opt.hindi : opt.english;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelectOption(opt.value)}
                  className="w-full min-h-[50px] sm:min-h-[54px] py-2 px-3 sm:px-4 rounded-[3px] border text-left transition-transform active:scale-[0.98] cursor-pointer flex items-center justify-between group"
                  style={{
                    backgroundColor: isSelected ? '#0B5FA5' : '#FFFFFF',
                    borderColor: isSelected ? '#084B83' : '#CED4DA',
                    color: isSelected ? '#FFFFFF' : '#212529',
                  }}
                >
                  <div className="flex items-center gap-3">
                    {/* Radio Indicator */}
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
                    {/* Speaker Button */}
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

          {/* TYPE YOUR OWN OPTION FALLBACK (FOR EVERY QUESTION TURN) */}
          <div
            onClick={handleSelectCustom}
            className={`p-3 rounded-[3px] border transition-all cursor-pointer ${
              selectedOption === '__custom__'
                ? 'border-[#0B5FA5] bg-[#F0F7FD] shadow-2xs'
                : 'border-dashed border-[#CBD5E1] bg-[#F8FAFC] hover:border-[#0B5FA5]'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
                  style={{
                    borderColor: selectedOption === '__custom__' ? '#0B5FA5' : '#6C757D',
                    backgroundColor: selectedOption === '__custom__' ? '#FFFFFF' : 'transparent',
                  }}
                >
                  {selectedOption === '__custom__' && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#0B5FA5]" />
                  )}
                </div>
                <span className="text-xs font-black text-[#0B5FA5] flex items-center gap-1">
                  <PenLine className="w-3.5 h-3.5" />
                  <span>
                    {language === 'hi'
                      ? '✎ अन्य / अपना उत्तर लिखकर बताएं (Type your own option):'
                      : '✎ Other / Type or Speak your custom answer:'}
                  </span>
                </span>
              </div>
              <span className="text-[10px] text-[#6C757D] font-bold">
                {language === 'hi' ? '(वैकल्पिक)' : '(Custom answer)'}
              </span>
            </div>

            <input
              type="text"
              value={customAnswer}
              onChange={(e) => handleCustomInputChange(e.target.value)}
              onFocus={handleSelectCustom}
              placeholder={
                language === 'hi'
                  ? 'यदि आपका उत्तर ऊपर के विकल्पों में नहीं है, तो यहाँ लिखें या ऊपर माइक दबाकर बोलें...'
                  : 'Type your answer here or tap the mic button above...'
              }
              className="w-full p-2.5 text-xs sm:text-sm font-bold text-[#212529] bg-white border border-[#CED4DA] rounded-[2px] focus:outline-none focus:border-[#0B5FA5]"
            />
          </div>

        </div>

        {/* 2 LARGE ACTION BUTTONS */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-2xl shrink-0 mb-3">
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
            disabled={!isCurrentAnswerValid}
            className="h-12 sm:h-14 px-6 rounded-[3px] border font-black text-sm sm:text-base text-white flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: isCurrentAnswerValid ? '#0B5FA5' : '#6C757D',
              borderColor: isCurrentAnswerValid ? '#084B83' : '#495057',
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
      <footer className="w-full bg-white/90 backdrop-blur-sm border-t border-[#CED4DA] py-2 px-6 text-xs text-[#495057] select-none shrink-0">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-left">
          <div className="flex items-center gap-2 font-bold" style={{ color: '#0B5FA5' }}>
            <span>अखिल भारतीय आयुर्वेद संस्थान (AIIA)</span>
            <span className="text-[#CED4DA]">|</span>
            <span className="font-semibold text-[#495057]">नई दिल्ली</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-[#6C757D]">
            <span>राष्ट्रीय आयुष मिशन • 5-चरणीय नैदानिक इतिहास संकलन</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
