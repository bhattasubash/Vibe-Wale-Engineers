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
            <span>चिकित्सा विभाग चयन</span>
          </div>

          <h1
            className="text-2xl sm:text-3xl font-black tracking-tight"
            style={{ color: '#0B5FA5' }}
          >
            {language === 'hi'
              ? 'आप किस प्रकार की चिकित्सा के लिए आए हैं?'
              : 'What type of care are you seeking today?'}
          </h1>
          <p className="text-xs sm:text-sm text-[#495057] font-semibold">
            {language === 'hi'
              ? 'आपकी पसंद के अनुसार आपको संबंधित डॉक्टर के पास भेजा जाएगा।'
              : 'You will be routed to the appropriate department based on your choice.'}
          </p>
        </div>

        {/* 2 BALANCED TREATMENT SYSTEM CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl shrink-0">
          
          {/* OPTION 1: AYURVEDA */}
          <div
            onClick={() => handleSelectMode('ayurveda')}
            className={`p-5 rounded-[3px] border-2 text-left cursor-pointer transition-transform active:scale-[0.98] flex flex-col justify-between shadow-xs ${
              selectedMode === 'ayurveda'
                ? 'border-[#0B5FA5] bg-[#E8F1F8]'
                : 'border-[#CED4DA] bg-white hover:border-[#0B5FA5]/50'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className="w-12 h-12 rounded-[3px] flex items-center justify-center shrink-0 text-white"
                style={{ backgroundColor: '#186036' }}
              >
                <Leaf className="w-6 h-6 text-white" />
              </div>

              {/* Radio Indicator */}
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedMode === 'ayurveda'
                    ? 'border-[#0B5FA5] bg-white'
                    : 'border-[#CED4DA] bg-transparent'
                }`}
              >
                {selectedMode === 'ayurveda' && (
                  <span className="w-3 h-3 rounded-full bg-[#0B5FA5]" />
                )}
              </div>
            </div>

            <div>
              <span className="text-lg font-black block text-[#212529] mb-0.5">
                {language === 'hi' ? 'आयुर्वेद चिकित्सा' : 'Ayurvedic Medicine'}
              </span>
              <span className="text-xs font-bold text-[#186036] block mb-2">
                {language === 'hi' ? 'आयुर्वेदिक डॉक्टर से परामर्श एवं दिनचर्या परीक्षण' : 'Consultation with Ayurvedic Physician'}
              </span>
              <p className="text-xs text-[#495057] font-medium leading-normal">
                {language === 'hi'
                  ? 'शारीरिक प्रकृति, खान-पान एवं हर्बल चिकित्सा परामर्श।'
                  : 'Ayurvedic constitution, diet regimen and herbal consultation.'}
              </p>
            </div>
          </div>

          {/* OPTION 2: GENERAL MEDICINE */}
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

              {/* Radio Indicator */}
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedMode === 'allopathy'
                    ? 'border-[#0B5FA5] bg-white'
                    : 'border-[#CED4DA] bg-transparent'
                }`}
              >
                {selectedMode === 'allopathy' && (
                  <span className="w-3 h-3 rounded-full bg-[#0B5FA5]" />
                )}
              </div>
            </div>

            <div>
              <span className="text-lg font-black block text-[#212529] mb-0.5">
                {language === 'hi' ? 'सामान्य चिकित्सा' : 'General Medicine'}
              </span>
              <span className="text-xs font-bold text-[#0B5FA5] block mb-2">
                {language === 'hi' ? 'सामान्य / आधुनिक चिकित्सा डॉक्टर से परामर्श' : 'Consultation with General Medicine Doctor'}
              </span>
              <p className="text-xs text-[#495057] font-medium leading-normal">
                {language === 'hi'
                  ? 'प्राथमिक स्वास्थ्य विटल्स, रक्तचाप एवं सामान्य चिकित्सा परामर्श।'
                  : 'General health vitals, blood pressure and routine clinical consultation.'}
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
