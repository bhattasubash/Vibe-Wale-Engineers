import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Leaf, Stethoscope, Volume2, Shield } from 'lucide-react';
import { AudioSpeaker } from '@/components/ui/AudioSpeaker';
import { useSessionStore, TreatmentMode } from '@/stores/sessionStore';
import { speechEngine } from '@/lib/speech';

export const DepartmentScreen: React.FC = () => {
  const navigate = useNavigate();
  const { language, treatmentMode, setTreatmentMode } = useSessionStore();

  const [selectedMode, setSelectedMode] = useState<TreatmentMode>(treatmentMode || 'ayurveda');

  const promptHindi =
    'आप कौन सी चिकित्सा पद्धति में परामर्श लेना चाहते हैं? आयुर्वेद चिकित्सा या सामान्य एलोपैथी चिकित्सा पर स्पर्श करें।';
  const promptEnglish =
    'Please select your preferred treatment system: Ayurvedic Medicine or General Allopathic Medicine.';

  const handleSelectMode = (mode: TreatmentMode) => {
    speechEngine.stop();
    setSelectedMode(mode);
    setTreatmentMode(mode);
  };

  const handleSpeakOption = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    speechEngine.stop();
    speechEngine.speak(text, language);
  };

  const handleProceed = () => {
    speechEngine.stop();
    setTreatmentMode(selectedMode);
    navigate('/kiosk/consent');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-76px)] max-h-[calc(100vh-76px)] bg-[#EAEDF0] text-[#212529] justify-between font-sans select-none overflow-hidden">
      
      {/* Non-Scrollable Centered Main Container */}
      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-2 flex-1 flex flex-col justify-evenly items-center">
        
        {/* Top Prompter */}
        <div className="shrink-0">
          <AudioSpeaker
            hindiText={promptHindi}
            englishText={promptEnglish}
            bilingual={language === 'hi'}
            autoPlay={true}
          />
        </div>

        {/* Title Area */}
        <div className="text-center shrink-0">
          <div
            className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-[3px] border text-[11px] font-bold uppercase tracking-wider mb-1"
            style={{
              backgroundColor: '#E8F1F8',
              borderColor: 'rgba(11, 95, 165, 0.3)',
              color: '#0B5FA5',
            }}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>चरण 1(B): चिकित्सा पद्धति चयन • TREATMENT PATH SELECTION</span>
          </div>

          <h1
            className="text-2xl sm:text-3xl font-black tracking-tight"
            style={{ color: '#0B5FA5' }}
          >
            {language === 'hi'
              ? 'आप किस पद्धति में परामर्श लेना चाहते हैं?'
              : 'Which Treatment System do you prefer?'}
          </h1>
          <p className="text-xs sm:text-sm text-[#495057] font-semibold">
            {language === 'hi'
              ? 'अपनी पसंद के चिकित्सा विभाग पर स्पर्श करें।'
              : 'Tap to choose between Ayurvedic Holistic Care and General Modern Medicine.'}
          </p>
        </div>

        {/* 2 LARGE HIGH-CONTRAST TREATMENT SYSTEM CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl shrink-0">
          
          {/* OPTION 1: AYURVEDA MEDICINE */}
          <div
            onClick={() => handleSelectMode('ayurveda')}
            className={`p-5 rounded-[3px] border-2 text-left cursor-pointer transition-transform active:scale-[0.98] flex flex-col justify-between shadow-xs ${
              selectedMode === 'ayurveda'
                ? 'border-[#2F7D4F] bg-[#EDF7F1]'
                : 'border-[#CED4DA] bg-white hover:border-[#2F7D4F]/50'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className="w-12 h-12 rounded-[3px] flex items-center justify-center shrink-0 text-white"
                style={{ backgroundColor: '#2F7D4F' }}
              >
                <Leaf className="w-6 h-6 text-white" />
              </div>

              <div className="flex items-center gap-1.5">
                {/* Per-Option Audio Speaker */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={(e) =>
                    handleSpeakOption(
                      e,
                      language === 'hi'
                        ? 'आयुर्वेद चिकित्सा विभाग। त्रिदोष एवं प्रकृति परीक्षण, हर्बल औषधि एवं पंचकर्म उपचार।'
                        : 'Ayurvedic Medicine Department. Tri-dosha Prakriti assessment, classical herbal formulations and panchakarma.'
                    )
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ')
                      handleSpeakOption(
                        e as any,
                        'आयुर्वेद चिकित्सा विभाग। त्रिदोष एवं प्रकृति परीक्षण, हर्बल औषधि एवं पंचकर्म उपचार।'
                      );
                  }}
                  className="w-8 h-8 rounded-[2px] border border-[#2F7D4F]/30 bg-white text-[#2F7D4F] flex items-center justify-center hover:bg-[#2F7D4F] hover:text-white cursor-pointer transition-colors"
                  title="विकल्प को आवाज़ में सुनें"
                >
                  <Volume2 className="w-4 h-4" />
                </div>

                {/* Selection Checkbox */}
                <div
                  className={`w-6 h-6 rounded-[2px] border flex items-center justify-center ${
                    selectedMode === 'ayurveda'
                      ? 'bg-[#2F7D4F] border-[#2F7D4F] text-white'
                      : 'bg-[#EAEDF0] border-[#CED4DA] text-transparent'
                  }`}
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
              </div>
            </div>

            <div>
              <span className="text-base sm:text-lg font-black block text-[#1E4620] mb-0.5">
                आयुर्वेद चिकित्सा (Ayurvedic Care)
              </span>
              <span className="text-[11px] font-bold text-[#2F7D4F] uppercase tracking-wider block mb-2">
                कायचिकित्सा, पंचकर्म एवं प्राकृतिक उपचार
              </span>
              <p className="text-xs text-[#495057] font-medium leading-relaxed">
                • 15-प्रश्नों की शास्त्रीय <strong>चरक संहिता प्रकृति परीक्षा</strong> (वात-पित्त-कफ)<br />
                • हर्बल क्वाथ, वटी एवं पंचकर्म चिकित्सा योजना<br />
                • <strong>आवंटन:</strong> आयुष बी.ए.एम.एस. विशेषज्ञ चिकित्सक
              </p>
            </div>
          </div>

          {/* OPTION 2: GENERAL ALLOPATHIC MEDICINE */}
          <div
            onClick={() => handleSelectMode('allopathy')}
            className={`p-5 rounded-[3px] border-2 text-left cursor-pointer transition-transform active:scale-[0.98] flex flex-col justify-between shadow-xs ${
              selectedMode === 'allopathy'
                ? 'border-[#0B5FA5] bg-[#E8F1F8]'
                : 'border-[#CED4DA] bg-white hover:border-[#0B5FA5]/50'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className="w-12 h-12 rounded-[3px] flex items-center justify-center shrink-0 text-white"
                style={{ backgroundColor: '#0B5FA5' }}
              >
                <Stethoscope className="w-6 h-6 text-white" />
              </div>

              <div className="flex items-center gap-1.5">
                {/* Per-Option Audio Speaker */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={(e) =>
                    handleSpeakOption(
                      e,
                      language === 'hi'
                        ? 'सामान्य एलोपैथी चिकित्सा। आधुनिक जांच, रक्तचाप, शुगर, संक्रमण एवं त्वरित लक्षण शमन।'
                        : 'General Allopathic Medicine. Modern diagnostics, vitals, blood sugar, infections and acute care.'
                    )
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ')
                      handleSpeakOption(
                        e as any,
                        'सामान्य एलोपैथी चिकित्सा। आधुनिक जांच, रक्तचाप, शुगर, संक्रमण एवं त्वरित लक्षण शमन।'
                      );
                  }}
                  className="w-8 h-8 rounded-[2px] border border-[#0B5FA5]/30 bg-white text-[#0B5FA5] flex items-center justify-center hover:bg-[#0B5FA5] hover:text-white cursor-pointer transition-colors"
                  title="विकल्प को आवाज़ में सुनें"
                >
                  <Volume2 className="w-4 h-4" />
                </div>

                {/* Selection Checkbox */}
                <div
                  className={`w-6 h-6 rounded-[2px] border flex items-center justify-center ${
                    selectedMode === 'allopathy'
                      ? 'bg-[#0B5FA5] border-[#0B5FA5] text-white'
                      : 'bg-[#EAEDF0] border-[#CED4DA] text-transparent'
                  }`}
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
              </div>
            </div>

            <div>
              <span className="text-base sm:text-lg font-black block text-[#0B5FA5] mb-0.5">
                सामान्य चिकित्सा (General Medicine)
              </span>
              <span className="text-[11px] font-bold text-[#0B5FA5] uppercase tracking-wider block mb-2">
                एलोपैथी, आधुनिक जांच एवं त्वरित राहत
              </span>
              <p className="text-xs text-[#495057] font-medium leading-relaxed">
                • रक्तचाप (BP), शुगर, एलर्जी एवं आधुनिक स्वास्थ्य जांच<br />
                • तीव्र लक्षणों का त्वरित शमन व एंटीबायोटिक/ऑलॉपैथिक परामर्श<br />
                • <strong>आवंटन:</strong> जनरल फिजिशियन (MD Medicine)
              </p>
            </div>
          </div>

        </div>

        {/* Primary CTA Proceed Button */}
        <div className="w-full max-w-md shrink-0">
          <button
            type="button"
            onClick={handleProceed}
            className="w-full py-3.5 px-6 rounded-[3px] border text-sm sm:text-base font-black text-white flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.98] shadow-xs"
            style={{
              backgroundColor: selectedMode === 'ayurveda' ? '#2F7D4F' : '#0B5FA5',
              borderColor: selectedMode === 'ayurveda' ? '#1E4620' : '#084B83',
            }}
          >
            <span>
              {selectedMode === 'ayurveda'
                ? 'आयुर्वेद परामर्श हेतु आगे बढ़ें • PROCEED'
                : 'सामान्य चिकित्सा हेतु आगे बढ़ें • PROCEED'}
            </span>
            <ArrowRight className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Back Button */}
        <div className="shrink-0">
          <button
            type="button"
            onClick={() => navigate('/kiosk/identify')}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-[3px] border border-[#CED4DA] bg-white hover:border-[#0B5FA5] hover:text-[#0B5FA5] text-xs font-bold text-[#212529] transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>पहचान पृष्ठ पर वापस जाएं (Back)</span>
          </button>
        </div>

      </main>

      {/* Persistent Single-Line Clean Footer */}
      <footer className="w-full bg-white border-t border-[#CED4DA] py-2 px-6 text-xs text-[#495057] select-none shrink-0">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-left">
          <div className="flex items-center gap-2 font-bold" style={{ color: '#0B5FA5' }}>
            <span>अखिल भारतीय आयुर्वेद संस्थान (AIIA)</span>
            <span className="text-[#CED4DA]">|</span>
            <span className="font-semibold text-[#495057]">OPD Intake Mode Selector</span>
          </div>
          <div className="text-[11px] font-semibold text-[#6C757D]">
            <span>राष्ट्रीय स्वास्थ्य प्राधिकरण (NHA) एवं आयुष मानक</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
