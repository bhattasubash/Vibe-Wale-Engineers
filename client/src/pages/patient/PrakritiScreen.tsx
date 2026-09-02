import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Scale, Check } from 'lucide-react';
import { AudioSpeaker } from '@/components/ui/AudioSpeaker';
import { useSessionStore } from '@/stores/sessionStore';
import { PRAKRITI_15_QUESTIONS } from '@/config/prakritiQuestions';

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
    setSelectedOptionIdx(idx);
    setPrakritiAnswer(currentQuestion.id, { optionIndex: idx, doshaTag: dosha });
  };

  // Deterministic Math Execution when all 15 questions finish
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
    if (currentIndex < PRAKRITI_15_QUESTIONS.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      const nextAns = prakritiAnswers[PRAKRITI_15_QUESTIONS[nextIdx].id];
      setSelectedOptionIdx(nextAns !== undefined ? nextAns.optionIndex : null);
    } else {
      // Finished 15 Questions -> Compute & Proceed to Review Screen
      calculateFinalScores();
      navigate('/kiosk/review');
    }
  };

  const handlePrev = () => {
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
    <div className="flex flex-col min-h-[calc(100vh-76px)] bg-[#EAEDF0] text-[#212529] justify-between font-sans select-none">
      
      {/* Central Prakriti Card */}
      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-8 flex-1 flex flex-col items-center">
        
        {/* Prompter */}
        <div className="mb-3">
          <AudioSpeaker
            hindiText={currentQuestion.questionHindi}
            englishText={currentQuestion.questionEnglish}
            bilingual={language === 'hi'}
            autoPlay={true}
          />
        </div>

        {/* Top Header Badge */}
        <div className="w-full max-w-2xl flex items-center justify-between mb-2">
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

        {/* 15-Step Progress Bar */}
        <div className="w-full max-w-2xl h-1.5 bg-[#CED4DA] rounded-full overflow-hidden mb-4">
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${((currentIndex + 1) / 15) * 100}%`,
              backgroundColor: '#2F7D4F',
            }}
          />
        </div>

        {/* Question Container */}
        <div className="w-full max-w-2xl bg-white border border-[#CED4DA] rounded-[3px] p-5 mb-4">
          
          <div className="text-[10px] font-bold text-[#6C757D] uppercase tracking-wider mb-1">
            शास्त्रीय मापदंड: {currentQuestion.sanskritParam}
          </div>

          <h2
            className="text-lg sm:text-2xl font-black mb-1 leading-snug"
            style={{ color: '#0B5FA5' }}
          >
            {language === 'hi' ? currentQuestion.questionHindi : currentQuestion.questionEnglish}
          </h2>

          <p className="text-xs text-[#495057] font-semibold mb-4">
            {language === 'hi'
              ? 'अपनी स्वाभाविक शारीरिक स्थिति के अनुसार सबसे उपयुक्त विकल्प चुनें:'
              : 'Choose the option that best matches your lifelong bodily nature:'}
          </p>

          {/* 3 LAYMAN TOUCH OPTIONS */}
          <div className="space-y-3">
            {currentQuestion.options.map((opt, idx) => {
              const isSelected = selectedOptionIdx === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectOption(idx, opt.dosha)}
                  className="w-full p-4 rounded-[3px] border text-left transition-colors cursor-pointer flex items-center justify-between active:scale-[0.99]"
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
                      className="text-xs sm:text-sm font-extrabold leading-tight"
                      style={{ color: isSelected ? '#FFFFFF' : '#212529' }}
                    >
                      {language === 'hi' ? opt.textHindi : opt.textEnglish}
                    </span>
                  </div>

                  <div
                    className="w-6 h-6 rounded-[2px] border flex items-center justify-center shrink-0 ml-2"
                    style={{
                      backgroundColor: isSelected ? '#FFFFFF' : '#EAEDF0',
                      borderColor: isSelected ? '#FFFFFF' : '#CED4DA',
                      color: isSelected ? '#0B5FA5' : '#495057',
                    }}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                </button>
              );
            })}
          </div>

        </div>

        {/* Bottom Nav */}
        <div className="w-full max-w-2xl flex items-center justify-between gap-3">
          
          <button
            type="button"
            onClick={handlePrev}
            className="py-3 px-5 rounded-[3px] border border-[#CED4DA] bg-white hover:border-[#0B5FA5] hover:text-[#0B5FA5] text-xs font-bold text-[#212529] flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{currentIndex === 0 ? 'SOCRATES पर वापस' : 'पिछला प्रश्न (Previous)'}</span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={selectedOptionIdx === null}
            className="py-3 px-6 rounded-[3px] border border-[#084B83] text-sm font-black text-white flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-transform active:scale-[0.99]"
            style={{ backgroundColor: '#0B5FA5' }}
          >
            <span>
              {currentIndex === PRAKRITI_15_QUESTIONS.length - 1
                ? 'समीक्षा पृष्ठ पर आगे बढ़ें • PROCEED TO REVIEW'
                : 'अगला प्रश्न • NEXT QUESTION'}
            </span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>

        </div>

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
            <span>Charaka Samhita Vimana Sthana 8 Protocol</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
