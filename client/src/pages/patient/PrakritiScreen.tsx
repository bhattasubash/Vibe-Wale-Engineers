import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Scale, Check, Volume2 } from 'lucide-react';
import { AudioSpeaker } from '@/components/ui/AudioSpeaker';
import { VoiceAnswerButton } from '@/components/ui/VoiceAnswerButton';
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

  const handleVoiceAnswer = (transcript: string) => {
    speechEngine.stop();
    const lower = transcript.toLowerCase();
    let matchedIdx: number | null = null;
    let matchedDosha: 'vata' | 'pitta' | 'kapha' | null = null;

    currentQuestion.options.forEach((opt, idx) => {
      const optHindi = opt.textHindi.toLowerCase();
      const optEng = opt.textEnglish.toLowerCase();
      if (
        lower.includes(optHindi) ||
        lower.includes(optEng) ||
        (idx === 0 && (lower.includes('पहला') || lower.includes('एक') || lower.includes('first') || lower.includes('1') || lower.includes('one') || lower.includes('ए') || lower.includes('वात') || lower.includes('vata'))) ||
        (idx === 1 && (lower.includes('दूसरा') || lower.includes('दो') || lower.includes('second') || lower.includes('2') || lower.includes('two') || lower.includes('बी') || lower.includes('पित्त') || lower.includes('pitta'))) ||
        (idx === 2 && (lower.includes('तीसरा') || lower.includes('तीन') || lower.includes('third') || lower.includes('3') || lower.includes('three') || lower.includes('सी') || lower.includes('कफ') || lower.includes('kapha'))) ||
        lower.includes(opt.dosha)
      ) {
        matchedIdx = idx;
        matchedDosha = opt.dosha;
      }
    });

    if (matchedIdx !== null && matchedDosha !== null) {
      handleSelectOption(matchedIdx, matchedDosha);
    } else {
      for (let i = 0; i < currentQuestion.options.length; i++) {
        const opt = currentQuestion.options[i];
        const words = (opt.textHindi + ' ' + opt.textEnglish).toLowerCase().split(/\s+/);
        if (words.some((w) => w.length > 3 && lower.includes(w))) {
          handleSelectOption(i, opt.dosha);
          return;
        }
      }
      handleSelectOption(0, currentQuestion.options[0].dosha);
    }
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
                borderColor: 'rgba(24, 96, 54, 0.4)',
                color: '#186036',
              }}
            >
              <Scale className="w-3.5 h-3.5 text-[#186036]" />
              <span>
                {language === 'hi'
                  ? `प्रकृति परीक्षण • प्रश्न ${currentIndex + 1} / 15`
                  : `Prakriti Assessment • Question ${currentIndex + 1} of 15`}
              </span>
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
                backgroundColor: '#186036',
              }}
            />
          </div>
        </div>

        {/* Friendly Reassuring Intro Banner (on Question 1) */}
        {currentIndex === 0 && (
          <div className="w-full max-w-2xl p-2.5 bg-[#EDF7F1] border border-[#186036]/30 rounded-[3px] text-left shrink-0">
            <p className="text-xs text-[#186036] font-bold leading-relaxed">
              {language === 'hi'
                ? '🌿 प्रकृति परीक्षण: यह प्रश्नावली आपके स्वाभाविक स्वास्थ्य, स्वभाव और पाचन की प्रकृति समझने के लिए है। कृपया अपनी सामान्य स्थिति के अनुसार उत्तर दें।'
                : '🌿 Body Constitution Assessment: These 15 questions help your Ayurvedic physician understand your natural body constitution and digestive habits.'}
            </p>
          </div>
        )}

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
              {language === 'hi' ? currentQuestion.questionHindi : currentQuestion.questionEnglish}
            </h2>
            <VoiceAnswerButton
              language={language}
              onTranscript={handleVoiceAnswer}
              size="sm"
            />
          </div>

          {/* EXACTLY 3 TOUCH OPTIONS WITH RADIO BUTTON INDICATOR & AUDIO BUTTON */}
          <div className="space-y-2.5">
            {currentQuestion.options.map((opt, idx) => {
              const isSelected = selectedOptionIdx === idx;
              const optionText = language === 'hi' ? opt.textHindi : opt.textEnglish;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectOption(idx, opt.dosha)}
                  className="w-full min-h-[56px] sm:min-h-[64px] p-3 rounded-[3px] border text-left transition-transform active:scale-[0.98] cursor-pointer flex items-center justify-between group"
                  style={{
                    backgroundColor: isSelected ? '#186036' : '#FFFFFF',
                    borderColor: isSelected ? '#0F3F23' : '#CED4DA',
                    color: isSelected ? '#FFFFFF' : '#212529',
                  }}
                >
                  <div className="flex items-center gap-3">
                    {/* Radio Button Indicator */}
                    <div
                      className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
                      style={{
                        borderColor: isSelected ? '#FFFFFF' : '#186036',
                        backgroundColor: isSelected ? '#FFFFFF' : 'transparent',
                      }}
                    >
                      {isSelected && (
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: '#186036' }}
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
                        color: isSelected ? '#FFFFFF' : '#186036',
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
            onClick={handlePrev}
            className="h-12 sm:h-14 px-4 rounded-[3px] border border-[#CED4DA] bg-white hover:bg-[#EAEDF0] font-black text-xs sm:text-sm text-[#495057] flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.98]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{currentIndex === 0 ? 'लक्षण पर वापस' : 'पिछला प्रश्न (Previous)'}</span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={selectedOptionIdx === null}
            className="h-12 sm:h-14 px-6 rounded-[3px] border font-black text-sm sm:text-base text-white flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: selectedOptionIdx !== null ? '#186036' : '#6C757D',
              borderColor: selectedOptionIdx !== null ? '#0F3F23' : '#495057',
            }}
          >
            <span>
              {currentIndex === PRAKRITI_15_QUESTIONS.length - 1
                ? (language === 'hi' ? 'समीक्षा देखें (Review)' : 'Review Details')
                : (language === 'hi' ? 'अगला प्रश्न (Next)' : 'Next Question')}
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
            <span>राष्ट्रीय आयुष मिशन • प्रकृति स्वास्थ्य विश्लेषण</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
