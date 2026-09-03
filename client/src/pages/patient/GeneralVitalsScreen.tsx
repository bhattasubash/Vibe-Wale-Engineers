import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Activity, Check, Volume2 } from 'lucide-react';
import { AudioSpeaker } from '@/components/ui/AudioSpeaker';
import { useSessionStore } from '@/stores/sessionStore';
import { speechEngine } from '@/lib/speech';

interface VitalsQuestion {
  key: 'bloodPressureHistory' | 'diabetesStatus' | 'knownAllergies' | 'pastSurgeries';
  titleHindi: string;
  titleEnglish: string;
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
      { value: 'hypertensive-meds', hindi: 'हाँ, BP की नियमित दवा चल रही है (Hypertensive on Meds)', english: 'Yes, taking regular BP medicine' },
      { value: 'borderline-bp', hindi: 'कभी-कभार बढ़ जाता है (Borderline / Fluctuating BP)', english: 'Occasional high BP' },
      { value: 'normal-bp', hindi: 'सामान्य रहता है (Normal Blood Pressure)', english: 'Normal Blood Pressure' },
      { value: 'never-checked', hindi: 'हाल ही में जांच नहीं कराई (Never Checked Recently)', english: 'Not checked recently' },
    ],
  },
  {
    key: 'diabetesStatus',
    titleHindi: 'क्या आपको मधुमेह (शुगर / Diabetes) का रोग है?',
    titleEnglish: 'Do you have a history of Diabetes / High Blood Sugar?',
    options: [
      { value: 'diabetic-meds', hindi: 'हाँ, शुगर की गोली या इंसुलिन लेते हैं (Diabetic)', english: 'Yes, taking sugar medication/insulin' },
      { value: 'prediabetic', hindi: 'बॉर्डरलाइन शुगर है (Pre-diabetic / Borderline)', english: 'Borderline blood sugar' },
      { value: 'non-diabetic', hindi: 'नहीं, शुगर की कोई समस्या नहीं है (Non-diabetic)', english: 'No, blood sugar is normal' },
      { value: 'sugar-unknown', hindi: 'जांच नहीं हुई है (Not tested recently)', english: 'Not tested' },
    ],
  },
  {
    key: 'knownAllergies',
    titleHindi: 'क्या आपको किसी एलोपैथिक दवा (पेनिसिलिन, दर्द निवारक आदि) से एलर्जी है?',
    titleEnglish: 'Do you have any known allergies to medicines (Penicillin, Sulfa, Painkillers)?',
    options: [
      { value: 'allergy-antibiotic', hindi: 'हाँ, एंटीबायोटिक / पेनिसिलिन से एलर्जी है', english: 'Yes, allergic to antibiotics / penicillin' },
      { value: 'allergy-nsaid', hindi: 'हाँ, दर्द निवारक गोलियों (NSAIDs) से गैस/चकत्ते होते हैं', english: 'Yes, allergic to pain relief drugs' },
      { value: 'allergy-none', hindi: 'नहीं, किसी दवा से कोई ज्ञात एलर्जी नहीं है (NKDA)', english: 'No known drug allergies (NKDA)' },
      { value: 'allergy-dust-food', hindi: 'दवा से नहीं, केवल धूल/खाद्य पदार्थ से एलर्जी है', english: 'Only environmental / food allergy' },
    ],
  },
  {
    key: 'pastSurgeries',
    titleHindi: 'क्या पूर्व में आपका कोई बड़ा ऑपरेशन (Surgery) या अस्पताल में भर्ती हुआ है?',
    titleEnglish: 'Any past surgeries, major procedures, or hospitalization?',
    options: [
      { value: 'surgery-recent-year', hindi: 'हाँ, पिछले 1 वर्ष में सर्जरी हुई है (Recent Surgery)', english: 'Yes, surgery in the past year' },
      { value: 'surgery-past', hindi: 'हाँ, कई वर्ष पूर्व पुराना ऑपरेशन हुआ था', english: 'Past surgical procedure years ago' },
      { value: 'chronic-cardiac-renal', hindi: 'हृदय, गुर्दे या थायरॉयड का पुराना इलाज चल रहा है', english: 'Ongoing cardiac/renal/thyroid care' },
      { value: 'no-surgery', hindi: 'नहीं, कभी कोई ऑपरेशन या भर्ती नहीं हुई है', english: 'No prior surgeries or hospitalization' },
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

  const handleNext = () => {
    speechEngine.stop();
    if (currentIndex < GENERAL_VITALS_QUESTIONS.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      const nextVal = generalVitals[GENERAL_VITALS_QUESTIONS[nextIdx].key];
      setSelectedOption(nextVal || null);
    } else {
      navigate('/kiosk/review');
    }
  };

  const handlePrev = () => {
    speechEngine.stop();
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      const prevVal = generalVitals[GENERAL_VITALS_QUESTIONS[prevIdx].key];
      setSelectedOption(prevVal || null);
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
              <span>सामान्य चिकित्सा इतिहास • प्रश्न {currentIndex + 1} / {GENERAL_VITALS_QUESTIONS.length}</span>
            </div>

            <span className="text-xs font-extrabold text-[#495057] truncate max-w-xs">
              लक्षण: {chiefComplaint || 'सामान्य परामर्श'}
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
            सामान्य चिकित्सा व स्वास्थ्य इतिहास (General Medicine & Vitals)
          </div>

          <h2
            className="text-lg sm:text-2xl font-black mb-3 leading-tight"
            style={{ color: '#0B5FA5' }}
          >
            {language === 'hi' ? currentQ.titleHindi : currentQ.titleEnglish}
          </h2>

          {/* 4 TOUCH OPTIONS WITH DEDICATED SPEAKER ICONS */}
          <div className="space-y-2">
            {currentQ.options.map((opt, idx) => {
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
                    {/* Per-Option Audio Speaker */}
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
                      title="इस विकल्प को आवाज़ में सुनें"
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
                ? 'समीक्षा देखें • REVIEW CASE'
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
            <span className="font-semibold text-[#495057]">General Medicine Consultation Wing</span>
          </div>
          <div className="text-[11px] font-semibold text-[#6C757D]">
            <span>आधुनिक एलोपैथी व स्वास्थ्य इतिहास प्रोटोकॉल</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
