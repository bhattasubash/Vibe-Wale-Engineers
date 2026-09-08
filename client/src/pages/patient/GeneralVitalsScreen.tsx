import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Activity, Check, Volume2 } from 'lucide-react';
import { AudioSpeaker } from '@/components/ui/AudioSpeaker';
import { VoiceAnswerButton } from '@/components/ui/VoiceAnswerButton';
import { useSessionStore } from '@/stores/sessionStore';
import { speechEngine } from '@/lib/speech';

interface VitalsQuestion {
  key: 'bloodPressureHistory' | 'diabetesStatus' | 'knownAllergies' | 'pastSurgeries';
  titleHindi: string;
  titleEnglish: string;
  hasDetailInput?: boolean;
  options: Array<{
    value: string;
    hindi: string;
    english: string;
  }>;
}

const GENERAL_VITALS_QUESTIONS: VitalsQuestion[] = [
  {
    key: 'bloodPressureHistory',
    titleHindi: 'क्या आपको पहले से उच्च रक्तचाप (High Blood Pressure) की शिकायत है?',
    titleEnglish: 'Do you have a known history of High Blood Pressure (Hypertension)?',
    options: [
      { value: 'hypertensive-meds', hindi: 'हाँ, BP की नियमित दवा ले रहे हैं', english: 'Yes, taking regular BP medicine' },
      { value: 'borderline-bp', hindi: 'कभी-कभार बढ़ जाता है (दवा नहीं लेते)', english: 'Occasional high BP (no regular medication)' },
      { value: 'normal-bp', hindi: 'नहीं, रक्तचाप सामान्य रहता है', english: 'No, blood pressure is normal' },
      { value: 'never-checked', hindi: 'जांच नहीं कराई / जानकारी नहीं है', english: 'Not checked recently / Don’t know' },
    ],
  },
  {
    key: 'diabetesStatus',
    titleHindi: 'क्या आपको मधुमेह (शुगर / Diabetes) की शिकायत है?',
    titleEnglish: 'Do you have a history of Diabetes / High Blood Sugar?',
    options: [
      { value: 'diabetic-meds', hindi: 'हाँ, शुगर की दवा या इंसुलिन लेते हैं', english: 'Yes, taking sugar medication or insulin' },
      { value: 'prediabetic', hindi: 'बॉर्डरलाइन शुगर है (परहेज़ करते हैं)', english: 'Borderline blood sugar (diet managed)' },
      { value: 'non-diabetic', hindi: 'नहीं, शुगर सामान्य है', english: 'No, blood sugar is normal' },
      { value: 'sugar-unknown', hindi: 'जांच नहीं कराई / जानकारी नहीं है', english: 'Not tested / Don’t know' },
    ],
  },
  {
    key: 'knownAllergies',
    titleHindi: 'क्या आपको किसी दवा (जैसे पेनिसिलिन, दर्द की गोली आदि) से एलर्जी है?',
    titleEnglish: 'Do you have any known allergies to medicines or drugs?',
    hasDetailInput: true,
    options: [
      { value: 'allergy-none', hindi: 'नहीं, किसी दवा से कोई एलर्जी नहीं है', english: 'No known drug allergies' },
      { value: 'allergy-medicines', hindi: 'हाँ, दवा से एलर्जी होती है (चकत्ते, सांस फूलना)', english: 'Yes, allergic to certain medicines' },
      { value: 'allergy-dust-food', hindi: 'केवल धूल / पराग / भोजन से एलर्जी है', english: 'Only environmental or food allergy' },
      { value: 'allergy-unsure', hindi: 'पता नहीं / कभी ऐसा अनुभव नहीं हुआ', english: 'Not sure / Never observed' },
    ],
  },
  {
    key: 'pastSurgeries',
    titleHindi: 'क्या पूर्व में आपका कोई ऑपरेशन (सर्जरी) या अस्पताल में भर्ती हुआ है?',
    titleEnglish: 'Have you had any prior surgeries or hospital admissions?',
    hasDetailInput: true,
    options: [
      { value: 'surgery-recent-year', hindi: 'हाँ, पिछले 1 वर्ष में सर्जरी हुई है', english: 'Yes, surgery within the past year' },
      { value: 'surgery-past', hindi: 'हाँ, कई वर्ष पूर्व ऑपरेशन हुआ था', english: 'Yes, past surgical procedure years ago' },
      { value: 'no-surgery', hindi: 'नहीं, कभी कोई ऑपरेशन या भर्ती नहीं हुई', english: 'No prior surgeries or hospitalization' },
      { value: 'surgery-unsure', hindi: 'निश्चित जानकारी नहीं है', english: 'Not sure / Don’t recall' },
    ],
  },
];

export const GeneralVitalsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { language, generalVitals, setGeneralVitals, chiefComplaint } = useSessionStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const currentQ = GENERAL_VITALS_QUESTIONS[currentIndex];

  const existingVal = generalVitals[currentQ.key];
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

    currentQ.options.forEach((opt, idx) => {
      const optHindi = opt.hindi.toLowerCase();
      const optEng = opt.english.toLowerCase();
      if (
        lower.includes(optHindi) ||
        lower.includes(optEng) ||
        (idx === 0 && (lower.includes('पहला') || lower.includes('एक') || lower.includes('first') || lower.includes('1') || lower.includes('one'))) ||
        (idx === 1 && (lower.includes('दूसरा') || lower.includes('दो') || lower.includes('second') || lower.includes('2') || lower.includes('two'))) ||
        (idx === 2 && (lower.includes('तीसरा') || lower.includes('तीन') || lower.includes('third') || lower.includes('3') || lower.includes('three'))) ||
        (idx === 3 && (lower.includes('चौथा') || lower.includes('चार') || lower.includes('fourth') || lower.includes('4') || lower.includes('four')))
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
      const nextVal = generalVitals[GENERAL_VITALS_QUESTIONS[nextIdx].key];
      setSelectedOption(nextVal || null);
      setDetailText('');
    } else {
      navigate('/kiosk/camera');
    }
  };

  const handlePrev = () => {
    speechEngine.stop();
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      const prevVal = generalVitals[GENERAL_VITALS_QUESTIONS[prevIdx].key];
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
            hindiText={currentQ.titleHindi}
            englishText={currentQ.titleEnglish}
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
                  ? `सामान्य स्वास्थ्य इतिहास • प्रश्न ${currentIndex + 1} / ${GENERAL_VITALS_QUESTIONS.length}`
                  : `General Health History • Question ${currentIndex + 1} of ${GENERAL_VITALS_QUESTIONS.length}`}
              </span>
            </div>

            <span className="text-xs font-extrabold text-[#495057] truncate max-w-xs">
              {chiefComplaint ? `लक्षण: ${chiefComplaint}` : 'सामान्य परामर्श'}
            </span>
          </div>

          <div className="w-full h-1.5 bg-[#CED4DA] rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${((currentIndex + 1) / GENERAL_VITALS_QUESTIONS.length) * 100}%`,
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
              {language === 'hi' ? currentQ.titleHindi : currentQ.titleEnglish}
            </h2>
            <VoiceAnswerButton
              language={language}
              onTranscript={handleVoiceAnswer}
              size="sm"
            />
          </div>

          {/* TOUCH OPTIONS WITH RADIO INDICATOR */}
          <div className="space-y-2">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOption === opt.value;
              const optionText = language === 'hi' ? opt.hindi : opt.english;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelectOption(opt.value)}
                  className="w-full min-h-[50px] sm:min-h-[54px] py-2 px-4 rounded-[3px] border text-left transition-transform active:scale-[0.98] cursor-pointer flex items-center justify-between group"
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

          {/* Conditional Detail Input for Allergies or Surgeries */}
          {currentQ.hasDetailInput && (selectedOption === 'allergy-medicines' || selectedOption === 'surgery-recent-year' || selectedOption === 'surgery-past') && (
            <div className="mt-3 p-3 bg-[#F8FAFC] border border-[#CED4DA] rounded-[3px]">
              <label className="block text-xs font-bold text-[#495057] mb-1">
                {currentQ.key === 'knownAllergies'
                  ? (language === 'hi' ? 'दवा का नाम लिखें या बताएं (वैकल्पिक):' : 'Specify medicine name (optional):')
                  : (language === 'hi' ? 'किस प्रकार का ऑपरेशन हुआ था (वैकल्पिक):' : 'Specify surgery or condition (optional):')}
              </label>
              <input
                type="text"
                value={detailText}
                onChange={(e) => setDetailText(e.target.value)}
                placeholder={
                  currentQ.key === 'knownAllergies'
                    ? (language === 'hi' ? 'जैसे: पेनिसिलिन, सिप्रोफ्लोक्सासिन...' : 'e.g. Penicillin, Ciprofloxacin...')
                    : (language === 'hi' ? 'जैसे: पित्त की थैली, मोतियाबिंद, घुटने की सर्जरी...' : 'e.g. Gallbladder, Cataract, Knee surgery...')
                }
                className="w-full p-2 bg-white border border-[#CED4DA] rounded-[3px] text-xs font-bold text-[#212529] focus:outline-none focus:border-[#0B5FA5]"
              />
            </div>
          )}

        </div>

        {/* 2 LARGE ACTION BUTTONS */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-2xl shrink-0">
          <button
            type="button"
            onClick={handlePrev}
            className="h-12 sm:h-14 px-4 rounded-[3px] border border-[#CED4DA] bg-white hover:bg-[#EAEDF0] font-black text-xs sm:text-sm text-[#495057] flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.98]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{currentIndex === 0 ? 'लक्षण पर वापस' : 'पिछला सवाल (Previous)'}</span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={selectedOption === null}
            className="h-12 sm:h-14 px-6 rounded-[3px] border font-black text-sm sm:text-base text-white flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: selectedOption !== null ? '#0B5FA5' : '#6C757D',
              borderColor: selectedOption !== null ? '#084B83' : '#495057',
            }}
          >
            <span>
              {currentIndex === GENERAL_VITALS_QUESTIONS.length - 1
                ? (language === 'hi' ? 'पुराने पर्चे जोड़ें (Next)' : 'Add Medical Documents')
                : (language === 'hi' ? 'अगला सवाल (Next)' : 'Next Question')}
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
          <div className="text-[11px] font-semibold text-[#6C757D]">
            <span>सामान्य ओपीडी परामर्श • स्वास्थ्य इतिहास</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
