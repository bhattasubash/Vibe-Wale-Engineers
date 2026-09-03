import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Scale, Check, Volume2 } from 'lucide-react';
import { AudioSpeaker } from '@/components/ui/AudioSpeaker';
import { useSessionStore } from '@/stores/sessionStore';
import { PRAKRITI_15_QUESTIONS } from '@/config/prakritiQuestions';
import { speechEngine } from '@/lib/speech';

export const PrakritiScreen: React.FC = () => {
  const navigate = useNavigate();
  const { language, setPrakritiAnswer, setPrakritiResult, prakritiAnswers } = useSessionStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const currentQuestion = PRAKRITI_15_QUESTIONS[currentIndex];

  const existingAnswer = prakritiAnswers[currentQuestion.id];
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(
    existingAnswer !== undefined ? existingAnswer.optionIndex : null
  );

  const handleSelectOption = (idx: number, dosha: 'vata' | 'pitta' | 'kapha') => {
    speechEngine.stop();
    setSelectedOptionIdx(idx);
    setPrakritiAnswer(currentQuestion.id, { optionIndex: idx, doshaTag: dosha });
  };

  const handleSpeakOption = (e: React.MouseEvent, optText: string) => {
    e.stopPropagation();
    speechEngine.stop();
    speechEngine.speak(optText, language);
  };

  const calculateFinalScores = () => {
    let vScore = 0;
    let pScore = 0;
    let kScore = 0;

    PRAKRITI_15_QUESTIONS.forEach((q) => {
      const ans = prakritiAnswers[q.id];
      if (ans) {
        if (ans.doshaTag === 'vata') vScore += 1;
        else if (ans.doshaTag === 'pitta') pScore += 1;
        else if (ans.doshaTag === 'kapha') kScore += 1;
      }
    });

    const total = vScore + pScore + kScore || 15;
    const sorted = [
      { dosha: 'vata', score: vScore },
      { dosha: 'pitta', score: pScore },
      { dosha: 'kapha', score: kScore },
    ].sort((a, b) => b.score - a.score);

    const s1 = sorted[0];
    const s2 = sorted[1];
    const gap = s1.score - s2.score;

    let dominantLabel = '';
    let secDosha: string | null = null;
    let conf: 'high' | 'medium' | 'low' = 'medium';

    if (gap >= 5) {
      dominantLabel = `Predominantly ${s1.dosha.toUpperCase()}`;
      conf = 'high';
    } else if (gap >= 3) {
      dominantLabel = `${s1.dosha.toUpperCase()}-${s2.dosha.toUpperCase()}`;
      secDosha = s2.dosha;
      conf = 'medium';
    } else {
      dominantLabel = 'SAMA (Balanced / Tri-Doshic)';
      secDosha = s2.dosha;
      conf = 'low';
    }

    setPrakritiResult({
      vataScore: Math.round((vScore / total) * 100),
      pittaScore: Math.round((pScore / total) * 100),
      kaphaScore: Math.round((kScore / total) * 100),
      dominantPrakriti: dominantLabel,
      secondaryPrakriti: secDosha,
      confidence: conf,
    });
  };

  const handleNext = () => {
    speechEngine.stop();
    if (currentIndex < PRAKRITI_15_QUESTIONS.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      const nextAns = prakritiAnswers[PRAKRITI_15_QUESTIONS[nextIdx].id];
      setSelectedOptionIdx(nextAns !== undefined ? nextAns.optionIndex : null);
    } else {
      calculateFinalScores();
      navigate('/kiosk/review');
    }
  };

  const handlePrev = () => {
    speechEngine.stop();
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      const prevAns = prakritiAnswers[PRAKRITI_15_QUESTIONS[prevIdx].id];
      setSelectedOptionIdx(prevAns !== undefined ? prevAns.optionIndex : null);
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
            hindiText={currentQuestion.questionHindi}
            englishText={currentQuestion.questionEnglish}
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
                backgroundColor: '#EDF7F1',
                borderColor: 'rgba(47, 125, 79, 0.4)',
                color: '#2F7D4F',
              }}
            >
              <Scale className="w-3.5 h-3.5 text-[#2F7D4F]" />
              <span>चरक संहिता प्रकृति परीक्षण • प्रश्न {currentIndex + 1} / 15</span>
            </div>

            <span className="text-xs font-extrabold text-[#495057]">
              {language === 'hi' ? currentQuestion.categoryHindi : currentQuestion.categoryEnglish}
            </span>
          </div>

          <div className="w-full h-1.5 bg-[#CED4DA] rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${((currentIndex + 1) / 15) * 100}%`,
                backgroundColor: '#2F7D4F',
              }}
            />
          </div>
        </div>

        {/* Current Question Container */}
        <div className="w-full max-w-2xl bg-white border border-[#CED4DA] rounded-[3px] p-4 sm:p-5 shrink-0">
          
          <div className="text-[10px] font-bold text-[#6C757D] uppercase tracking-wider mb-0.5">
            शास्त्रीय मापदंड: {currentQuestion.sanskritParam}
          </div>

          <h2
            className="text-lg sm:text-2xl font-black mb-3 leading-tight"
            style={{ color: '#0B5FA5' }}
          >
            {language === 'hi' ? currentQuestion.questionHindi : currentQuestion.questionEnglish}
          </h2>

          {/* EXACTLY 3 SPACIOUS TOUCH OPTIONS WITH PER-OPTION AUDIO BUTTONS */}
          <div className="space-y-2.5">
            {currentQuestion.options.map((opt, idx) => {
              const isSelected = selectedOptionIdx === idx;
              const optionText = language === 'hi' ? opt.textHindi : opt.textEnglish;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectOption(idx, opt.dosha)}
                  className="w-full h-16 sm:h-18 p-3.5 rounded-[3px] border text-left transition-transform active:scale-[0.98] cursor-pointer flex items-center justify-between group"
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
                      className="w-8 h-8 rounded-[2px] border flex items-center justify-center transition-transform active:scale-90 hover:opacity-90 cursor-pointer"
                      style={{
                        backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.2)' : '#F1F5F9',
                        borderColor: isSelected ? 'rgba(255, 255, 255, 0.4)' : '#CBD5E1',
                        color: isSelected ? '#FFFFFF' : '#0B5FA5',
                      }}
                      title="इस विकल्प को आवाज़ में सुनें (Listen aloud)"
                    >
                      <Volume2 className="w-4 h-4" />
                    </div>

                    {/* Selection Check Indicator */}
                    <div
                      className="w-6 h-6 rounded-[2px] border flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: isSelected ? '#FFFFFF' : '#EAEDF0',
                        borderColor: isSelected ? '#FFFFFF' : '#CED4DA',
                        color: isSelected ? '#0B5FA5' : '#495057',
                      }}
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

        </div>

        {/* 2 LARGE ACTION BUTTONS (64px Target Height) */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-2xl shrink-0">
          <button
            type="button"
            onClick={handlePrev}
            className="h-12 sm:h-14 px-4 rounded-[3px] border border-[#CED4DA] bg-white hover:bg-[#EAEDF0] font-black text-xs sm:text-sm text-[#495057] flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.98]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{currentIndex === 0 ? 'शिकायत पर वापस' : 'पिछला प्रश्न (Previous)'}</span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={selectedOptionIdx === null}
            className="h-12 sm:h-14 px-6 rounded-[3px] border font-black text-sm sm:text-base text-white flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: selectedOptionIdx !== null ? '#2F7D4F' : '#6C757D',
              borderColor: selectedOptionIdx !== null ? '#1E4620' : '#495057',
            }}
          >
            <span>
              {currentIndex === PRAKRITI_15_QUESTIONS.length - 1
                ? 'स्कोर देखें • CALCULATE RESULT'
                : 'अगला प्रश्न • NEXT QUESTION'}
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
            <span>चरक संहिता (विमान स्थान 8) • 100% Deterministic Math</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
