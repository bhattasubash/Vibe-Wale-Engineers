import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Activity, Check, Volume2 } from 'lucide-react';
import { AudioSpeaker } from '@/components/ui/AudioSpeaker';
import { VoiceAnswerButton } from '@/components/ui/VoiceAnswerButton';
import { useSessionStore } from '@/stores/sessionStore';
import { speechEngine } from '@/lib/speech';

interface VitalsQuestion {
  key: string;
  titleHindi: string;
  titleEnglish: string;
  category: string;
  hasDetailInput?: boolean;
  options: Array<{
    value: string;
    hindi: string;
    english: string;
  }>;
}

/**
 * Section 7: General Medical History & Comorbidity Screening (6 Questions)
 * Doctor-verified questions for Allopathic consultation path.
 */
const GENERAL_VITALS_QUESTIONS: VitalsQuestion[] = [
  {
    key: 'bloodPressureHistory',
    category: 'रक्तचाप (Blood Pressure)',
    titleHindi: 'क्या आपको बीपी यानी हाई ब्लड प्रेशर की बीमारी है?',
    titleEnglish: 'Do you have high blood pressure (BP)?',
    options: [
      { value: 'yes', hindi: 'हाँ', english: 'Yes' },
      { value: 'no', hindi: 'नहीं', english: 'No' },
    ],
  },
  {
    key: 'bpMedication',
    category: 'बीपी की दवा (BP Medicine)',
    titleHindi: 'क्या आप इसके लिए नियमित दवा ले रहे हैं?',
    titleEnglish: 'Are you currently taking medicine for it regularly?',
    options: [
      { value: 'yes', hindi: 'हाँ', english: 'Yes' },
      { value: 'no', hindi: 'नहीं', english: 'No' },
    ],
  },
  {
    key: 'diabetesStatus',
    category: 'मधुमेह (Diabetes / Sugar)',
    titleHindi: 'क्या आपको शुगर यानी डायबिटीज़ की बीमारी है?',
    titleEnglish: 'Do you have diabetes (sugar)?',
    options: [
      { value: 'yes', hindi: 'हाँ', english: 'Yes' },
      { value: 'no', hindi: 'नहीं', english: 'No' },
    ],
  },
  {
    key: 'diabetesMedication',
    category: 'शुगर की दवा (Diabetes Medicine)',
    titleHindi: 'क्या आप इसके लिए नियमित दवा ले रहे हैं?',
    titleEnglish: 'Are you currently taking medicine for it regularly?',
    options: [
      { value: 'yes', hindi: 'हाँ', english: 'Yes' },
      { value: 'no', hindi: 'नहीं', english: 'No' },
    ],
  },
  {
    key: 'knownAllergies',
    category: 'दवा से एलर्जी (Drug Allergies)',
    titleHindi: 'क्या किसी दवा से पहले कभी शरीर पर दाने, सूजन, या सांस लेने में तकलीफ हुई है?',
    titleEnglish: 'Has any medicine ever caused you a rash, swelling, or breathing trouble?',
    hasDetailInput: true,
    options: [
      { value: 'yes', hindi: 'हाँ', english: 'Yes' },
      { value: 'no', hindi: 'नहीं', english: 'No' },
    ],
  },
  {
    key: 'pastSurgeries',
    category: 'सर्जरी व अस्पताल भर्ती (Surgeries & Hospital Admissions)',
    titleHindi: 'क्या पहले कभी कोई ऑपरेशन हुआ है, या अस्पताल में भर्ती हुए हैं?',
    titleEnglish: 'Have you had any prior surgeries or hospital admissions?',
    hasDetailInput: true,
    options: [
      { value: 'yes', hindi: 'हाँ', english: 'Yes' },
      { value: 'no', hindi: 'नहीं', english: 'No' },
    ],
  },
];

export const GeneralVitalsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { language, generalVitals, setGeneralVitals, chiefComplaint } = useSessionStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const currentQ = GENERAL_VITALS_QUESTIONS[currentIndex];

  const existingVal = (generalVitals as any)[currentQ.key];
  const [selectedOption, setSelectedOption] = useState<string | null>(existingVal || null);
  const [detailText, setDetailText] = useState<string>('');

  const handleSelectOption = (optVal: string) => {
    speechEngine.stop();
    setSelectedOption(optVal);
    setGeneralVitals({ [currentQ.key]: optVal });
  };

  const handleSpeakOption = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    speechEngine.stop();
    speechEngine.speak(text, language);
  };

  const handleVoiceAnswer = (transcript: string) => {
    speechEngine.stop();
    const lower = transcript.toLowerCase();
    let matchedVal: string | null = null;

    if (
      lower.includes('हाँ') ||
      lower.includes('हा') ||
      lower.includes('yes') ||
      lower.includes('yeah') ||
      lower.includes('पहला') ||
      lower.includes('एक') ||
      lower.includes('1')
    ) {
      matchedVal = 'yes';
    } else if (
      lower.includes('नहीं') ||
      lower.includes('ना') ||
      lower.includes('no') ||
      lower.includes('nah') ||
      lower.includes('दूसरा') ||
      lower.includes('दो') ||
      lower.includes('2')
    ) {
      matchedVal = 'no';
    }

    if (matchedVal) {
      handleSelectOption(matchedVal);
    } else {
      for (const opt of currentQ.options) {
        const words = (opt.hindi + ' ' + opt.english).toLowerCase().split(/\\s+/);
        if (words.some((w) => w.length > 2 && lower.includes(w))) {
          handleSelectOption(opt.value);
          return;
        }
      }
      if (currentQ.options[0]) handleSelectOption(currentQ.options[0].value);
    }
  };

  const handleNext = () => {
    speechEngine.stop();
    // Save detail if provided
    if (detailText.trim()) {
      const combinedVal = selectedOption ? `${selectedOption} (${detailText.trim()})` : detailText.trim();
      setGeneralVitals({ [currentQ.key]: combinedVal });
    }

    if (currentIndex < GENERAL_VITALS_QUESTIONS.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      const nextVal = (generalVitals as any)[GENERAL_VITALS_QUESTIONS[nextIdx].key];
      setSelectedOption(nextVal || null);
      setDetailText('');
    } else {
      navigate('/kiosk/review');
    }
  };

  const handlePrev = () => {
    speechEngine.stop();
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      const prevVal = (generalVitals as any)[GENERAL_VITALS_QUESTIONS[prevIdx].key];
      setSelectedOption(prevVal || null);
      setDetailText('');
    } else {
      navigate('/kiosk/socrates');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-76px)] max-h-[calc(100vh-76px)] bg-[#EAEDF0] text-[#212529] justify-between font-sans select-none overflow-hidden">
      
      {/* Non-Scrollable Centered Main Container */}
      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-2 flex-1 flex flex-col justify-evenly items-center">
        
        {/* Top Prompter */}
        <div className="shrink-0">
          <AudioSpeaker
            key={`vitals-${currentIndex}-${currentQ.key}`}
            hindiText={currentQ.titleHindi}
            englishText={currentQ.titleEnglish}
            autoPlay={true}
          />
        </div>

        {/* Header & Progress Indicator */}
        <div className="text-center shrink-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-[3px] border border-[#0B5FA5]/30 bg-[#E8F1F8] text-[11px] font-bold uppercase tracking-wider text-[#0B5FA5] mb-1">
            <Activity className="w-3.5 h-3.5" />
            <span>
              {language === 'hi'
                ? `सामान्य चिकित्सा स्वास्थ्य इतिहास • प्रश्न ${currentIndex + 1} / ${GENERAL_VITALS_QUESTIONS.length}`
                : `General Medical History • Question ${currentIndex + 1} of ${GENERAL_VITALS_QUESTIONS.length}`}
            </span>
          </div>

          <p className="text-xs font-semibold text-[#495057]">
            {language === 'hi' ? currentQ.category : currentQ.category}
          </p>

          <h2 className="text-xl sm:text-2xl font-black text-[#212529] leading-snug mt-1 max-w-2xl px-2">
            {language === 'hi' ? currentQ.titleHindi : currentQ.titleEnglish}
          </h2>

          <div className="w-full max-w-xs mx-auto bg-[#CED4DA] h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-[#0B5FA5] h-full transition-all duration-300 rounded-full"
              style={{ width: `${((currentIndex + 1) / GENERAL_VITALS_QUESTIONS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* 2 Big High-Contrast Touch Option Cards */}
        <div className="w-full max-w-xl grid grid-cols-2 gap-4 shrink-0">
          {currentQ.options.map((opt) => {
            const isSelected = selectedOption === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelectOption(opt.value)}
                className={`group relative p-4 rounded-[3px] border-2 text-left transition-all duration-150 flex flex-col justify-between cursor-pointer min-h-[95px] ${
                  isSelected
                    ? 'border-[#0B5FA5] bg-[#E8F1F8] shadow-md'
                    : 'border-[#CED4DA] bg-white hover:border-[#0B5FA5]/50 hover:bg-[#F8FAFC]'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs border ${
                        isSelected
                          ? 'bg-[#0B5FA5] text-white border-[#0B5FA5]'
                          : 'bg-[#EAEDF0] text-[#495057] border-[#CED4DA]'
                      }`}
                    >
                      {opt.value === 'yes' ? '1' : '2'}
                    </span>
                    <span
                      className={`text-lg font-black ${
                        isSelected ? 'text-[#0B5FA5]' : 'text-[#212529]'
                      }`}
                    >
                      {language === 'hi' ? opt.hindi : opt.english}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <span
                      onClick={(e) =>
                        handleSpeakOption(e, language === 'hi' ? opt.hindi : opt.english)
                      }
                      className="p-1.5 rounded-full text-[#6C757D] hover:text-[#0B5FA5] hover:bg-white/80 transition-colors cursor-pointer"
                      title="Listen"
                    >
                      <Volume2 className="w-4 h-4" />
                    </span>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-[#2F7D4F] text-white flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-xs font-semibold text-[#6C757D] mt-1 pl-8">
                  {language === 'hi' ? opt.english : opt.hindi}
                </div>
              </button>
            );
          })}
        </div>

        {/* Optional Detail Note Input if selected 'yes' on allergy/surgery */}
        {currentQ.hasDetailInput && selectedOption === 'yes' && (
          <div className="w-full max-w-xl bg-white border border-[#CED4DA] p-2.5 rounded-[3px] shrink-0">
            <label className="text-[11px] font-bold text-[#495057] block mb-1">
              {language === 'hi'
                ? 'यदि विवरण याद हो तो लिखें (वैकल्पिक):'
                : 'Any specific medicine name or year (optional):'}
            </label>
            <input
              type="text"
              value={detailText}
              onChange={(e) => setDetailText(e.target.value)}
              placeholder={
                language === 'hi'
                  ? 'जैसे: पेनिसिलिन से एलर्जी / 2021 में अपेंडिक्स ऑपरेशन'
                  : 'e.g. Penicillin allergy / Appendix surgery in 2021'
              }
              className="w-full p-2 border border-[#CED4DA] rounded-[2px] text-xs focus:border-[#0B5FA5] focus:outline-none"
            />
          </div>
        )}

        {/* Voice Input Button & Skip / Prev / Next Row */}
        <div className="w-full max-w-xl flex items-center justify-between gap-3 shrink-0 pt-1">
          <button
            type="button"
            onClick={handlePrev}
            className="h-11 px-4 rounded-[3px] border border-[#CED4DA] bg-white hover:bg-[#EAEDF0] text-xs font-bold text-[#495057] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{language === 'hi' ? 'पिछला' : 'Back'}</span>
          </button>

          <VoiceAnswerButton onTranscript={handleVoiceAnswer} />

          <button
            type="button"
            onClick={handleNext}
            disabled={!selectedOption}
            className={`h-11 px-6 rounded-[3px] font-black text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-transform active:scale-[0.98] cursor-pointer ${
              selectedOption
                ? 'bg-[#0B5FA5] hover:bg-[#094c84] text-white'
                : 'bg-[#CED4DA] text-[#6C757D] cursor-not-allowed'
            }`}
          >
            <span>
              {currentIndex < GENERAL_VITALS_QUESTIONS.length - 1
                ? language === 'hi'
                  ? 'आगे बढ़ें (Next)'
                  : 'Continue (Next)'
                : language === 'hi'
                ? 'समीक्षा देखें (Review)'
                : 'Review Summary'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </main>

      {/* Persistent Single-Line Clean Footer */}
      <footer className="w-full bg-white border-t border-[#CED4DA] py-2 px-6 text-xs text-[#495057] select-none shrink-0">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-left">
          <div className="flex items-center gap-2 font-bold text-[#0B5FA5]">
            <span>सामान्य चिकित्सा ओपीडी (General Medicine OPD)</span>
            <span className="text-[#CED4DA]">|</span>
            <span className="font-semibold text-[#495057]">कमरा 205</span>
          </div>
          <div className="text-[11px] font-semibold text-[#6C757D]">
            <span>राष्ट्रीय स्वास्थ्य मिशन • भारत सरकार</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
