import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, ArrowLeft, ArrowRight, AlertTriangle, Check, RotateCcw, Activity } from 'lucide-react';
import { AudioSpeaker } from '@/components/ui/AudioSpeaker';
import { useSessionStore } from '@/stores/sessionStore';

interface SymptomPreset {
  id: string;
  hindi: string;
  english: string;
  ayushTerm: string;
  category: string;
  isRedFlag?: boolean;
}

const COMMON_SYMPTOMS: SymptomPreset[] = [
  {
    id: 'joint-pain',
    hindi: 'जोड़ों / घुटनों / कमर में दर्द',
    english: 'Joint / Knee / Back Pain',
    ayushTerm: 'संधिवात (Sandhivata)',
    category: 'musculoskeletal',
  },
  {
    id: 'acidity',
    hindi: 'गैस / खट्टी डकार / पेट में जलन',
    english: 'Acidity / Gas / Indigestion',
    ayushTerm: 'अम्लपित्त (Amlapitta)',
    category: 'digestive',
  },
  {
    id: 'respiratory',
    hindi: 'पुरानी खांसी / सांस लेने में तकलीफ',
    english: 'Chronic Cough / Asthma',
    ayushTerm: 'कास-श्वास (Kasa-Shwasa)',
    category: 'respiratory',
  },
  {
    id: 'skin',
    hindi: 'त्वचा में खुजली / लाल चकत्ते',
    english: 'Skin Rash / Itching / Eczema',
    ayushTerm: 'त्वक विकार (Kushtha)',
    category: 'dermatology',
  },
  {
    id: 'insomnia',
    hindi: 'सिरदर्द / तनाव / नींद न आना',
    english: 'Headache / Insomnia / Stress',
    ayushTerm: 'शिरोरोग / अनिद्रा (Anidra)',
    category: 'neurological',
  },
  {
    id: 'emergency-test',
    hindi: 'सीने में तेज दर्द / सांस फूलना (आपातकाल)',
    english: 'Chest Pain / Severe Shortness of Breath',
    ayushTerm: 'हृदशूल (Emergency Red Flag)',
    category: 'emergency',
    isRedFlag: true,
  },
];

export const ComplaintScreen: React.FC = () => {
  const navigate = useNavigate();
  const { language, setChiefComplaint, setRedFlag } = useSessionStore();

  const [inputText, setInputText] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showRedFlagModal, setShowRedFlagModal] = useState(false);

  const promptHindi =
    'आज आपको क्या परेशानी महसूस हो रही है? माइक दबाकर अपनी भाषा में बोलें या नीचे दिए गए लक्षणों पर स्पर्श करें।';
  const promptEnglish =
    'What symptoms or health trouble brings you here today? Tap the mic to speak or select from the options below.';

  const checkRedFlags = (text: string) => {
    const lower = text.toLowerCase();
    const criticalTerms = ['सीने में दर्द', 'chest pain', 'सांस फूलना', 'खून', 'blood', 'बेहोशी', 'stroke', 'हार्ट'];
    const match = criticalTerms.some((term) => lower.includes(term));
    if (match) {
      setRedFlag(true, 'Critical Emergency Symptom Detected in Chief Complaint');
      setShowRedFlagModal(true);
    }
  };

  const handleToggleRecord = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }

    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Voice recognition not supported. Please select from the symptoms below.');
      return;
    }

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRec();
    recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    setIsRecording(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
      setSelectedPreset(null);
      setIsRecording(false);
      checkRedFlags(transcript);
    };

    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);
    recognition.start();
  };

  const handleSelectPreset = (preset: SymptomPreset) => {
    setSelectedPreset(preset.id);
    const text = language === 'hi' ? `${preset.hindi} (${preset.ayushTerm})` : `${preset.english} (${preset.ayushTerm})`;
    setInputText(text);

    if (preset.isRedFlag) {
      setRedFlag(true, 'Red Flag Triggered: Emergency Chest / Respiratory Disturbance');
      setShowRedFlagModal(true);
    }
  };

  const handleProceed = () => {
    if (inputText.trim()) {
      const activePreset = COMMON_SYMPTOMS.find((s) => s.id === selectedPreset);
      setChiefComplaint(inputText, activePreset ? activePreset.category : 'general');
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
            <Activity className="w-3.5 h-3.5" />
            <span>चरण 2: मुख्य स्वास्थ्य समस्या / CHIEF COMPLAINT</span>
          </div>

          <h1
            className="text-2xl sm:text-3xl font-black tracking-tight"
            style={{ color: '#0B5FA5' }}
          >
            {language === 'hi'
              ? 'आज आपको क्या परेशानी हो रही है?'
              : 'What health trouble brings you here today?'}
          </h1>
          <p className="text-xs sm:text-sm text-[#495057] font-semibold">
            {language === 'hi'
              ? 'माइक दबाकर अपनी भाषा में बोलें या नीचे दिए गए आम लक्षणों पर स्पर्श करें।'
              : 'Speak using the mic or tap the common symptom tiles below.'}
          </p>
        </div>

        {/* VOICE INPUT PULSING MIC + TRANSCRIPT FIELD */}
        <div className="w-full max-w-2xl bg-white border border-[#CED4DA] rounded-[3px] p-3 sm:p-4 flex items-center gap-3 shrink-0">
          
          <button
            type="button"
            onClick={handleToggleRecord}
            className={`w-14 h-14 rounded-full flex items-center justify-center text-white shrink-0 cursor-pointer transition-transform active:scale-95 border-2 ${
              isRecording
                ? 'bg-[#DC2626] border-red-700 animate-pulse'
                : 'bg-[#0B5FA5] border-[#084B83] hover:bg-[#084B83]'
            }`}
          >
            {isRecording ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
          </button>

          <div className="flex-1">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#495057] mb-0.5 flex items-center justify-between">
              <span>{isRecording ? 'सुन रहे हैं... बोलिए (Listening...)' : 'आपका विवरण (Recorded Symptoms):'}</span>
              {inputText && (
                <button
                  type="button"
                  onClick={() => {
                    setInputText('');
                    setSelectedPreset(null);
                  }}
                  className="text-[#DC2626] hover:underline flex items-center gap-0.5 cursor-pointer font-bold text-[10px]"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  <span>हटाएं (Clear)</span>
                </button>
              )}
            </div>
            <input
              type="text"
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                checkRedFlags(e.target.value);
              }}
              placeholder={
                language === 'hi'
                  ? 'माइक दबाकर बोलें या यहाँ लिखें...'
                  : 'Tap mic or type symptoms here...'
              }
              className="w-full p-2 bg-[#F8FAFC] border border-[#CED4DA] rounded-[3px] text-xs sm:text-sm font-bold text-[#212529] focus:outline-none focus:border-[#0B5FA5]"
            />
          </div>

        </div>

        {/* SPATIOUS 6 COMMON SYMPTOMS TOUCH GRID */}
        <div className="w-full max-w-2xl shrink-0">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#495057] mb-1.5 flex items-center gap-2">
            <span className="w-2 h-2 bg-[#0B5FA5] rounded-full inline-block"></span>
            <span>आम ओपीडी समस्याएं (Touch to Select):</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {COMMON_SYMPTOMS.map((symptom) => {
              const isSelected = selectedPreset === symptom.id;
              return (
                <button
                  key={symptom.id}
                  type="button"
                  onClick={() => handleSelectPreset(symptom)}
                  className={`h-14 sm:h-16 px-3.5 rounded-[3px] border text-left transition-transform active:scale-[0.98] cursor-pointer flex items-center justify-between ${
                    symptom.isRedFlag ? 'border-red-300' : ''
                  }`}
                  style={{
                    backgroundColor: isSelected
                      ? symptom.isRedFlag
                        ? '#DC2626'
                        : '#0B5FA5'
                      : symptom.isRedFlag
                      ? '#FEF2F2'
                      : '#FFFFFF',
                    borderColor: isSelected ? '#084B83' : symptom.isRedFlag ? '#FCA5A5' : '#CED4DA',
                    color: isSelected ? '#FFFFFF' : '#212529',
                  }}
                >
                  <div className="truncate pr-2">
                    <span
                      className="text-xs sm:text-sm font-black block leading-tight truncate"
                      style={{ color: isSelected ? '#FFFFFF' : symptom.isRedFlag ? '#991B1B' : '#0B5FA5' }}
                    >
                      {language === 'hi' ? symptom.hindi : symptom.english}
                    </span>
                    <span
                      className="text-[10px] font-bold block truncate"
                      style={{ color: isSelected ? 'rgba(255,255,255,0.85)' : '#6C757D' }}
                    >
                      {symptom.ayushTerm}
                    </span>
                  </div>

                  <div
                    className="w-5 h-5 rounded-[2px] border flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: isSelected ? '#FFFFFF' : '#EAEDF0',
                      borderColor: isSelected ? '#FFFFFF' : '#CED4DA',
                      color: isSelected ? (symptom.isRedFlag ? '#DC2626' : '#0B5FA5') : '#495057',
                    }}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Primary CTA Button */}
        <div className="w-full max-w-md shrink-0">
          <button
            type="button"
            onClick={handleProceed}
            disabled={!inputText.trim()}
            className="w-full py-3.5 px-6 rounded-[3px] border border-[#084B83] text-sm sm:text-base font-black text-white flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-transform active:scale-[0.98]"
            style={{ backgroundColor: '#0B5FA5' }}
          >
            <span>विस्तार से बताएं • PROCEED TO SOCRATES QUESTIONS</span>
            <ArrowRight className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Back Button */}
        <div className="shrink-0">
          <button
            type="button"
            onClick={() => navigate('/kiosk/consent')}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-[3px] border border-[#CED4DA] bg-white hover:border-[#0B5FA5] hover:text-[#0B5FA5] text-xs font-bold text-[#212529] transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>सहमति पृष्ठ पर वापस जाएं (Back)</span>
          </button>
        </div>

      </main>

      {/* EMERGENCY RED FLAG MODAL */}
      {showRedFlagModal && (
        <div className="fixed inset-0 bg-red-950/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full p-6 rounded-[3px] border-4 border-[#DC2626] text-center shadow-2xl">
            <AlertTriangle className="w-16 h-16 text-[#DC2626] mx-auto mb-2" />
            <div className="inline-block px-3 py-1 bg-[#FEF2F2] border border-[#DC2626] text-[#DC2626] text-xs font-extrabold uppercase tracking-widest mb-2">
              आपातकालीन लक्षण चेतावनी / EMERGENCY ALERT
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#DC2626] mb-2 leading-tight">
              तत्काल आपातकालीन चिकित्सा कक्ष में जाएं!
            </h2>
            <p className="text-xs sm:text-sm text-[#212529] font-bold mb-4">
              आपके लक्षण (सीने में तेज दर्द/सांस फूलना) को तुरंत इमरजेंसी डॉक्टर द्वारा देखने की आवश्यकता है।
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowRedFlagModal(false);
                  navigate('/');
                }}
                className="flex-1 py-2.5 bg-[#DC2626] hover:bg-red-700 text-white font-black text-xs rounded-[3px] cursor-pointer"
              >
                इमरजेंसी कक्ष में जाएं (Proceed to Emergency)
              </button>
              <button
                type="button"
                onClick={() => setShowRedFlagModal(false)}
                className="py-2.5 px-3 border border-[#CED4DA] text-xs font-bold text-[#495057] hover:bg-[#EAEDF0] rounded-[3px] cursor-pointer"
              >
                गलती से दर्ज हुआ (Dismiss)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Single-Line Clean Footer */}
      <footer className="w-full bg-white border-t border-[#CED4DA] py-2 px-6 text-xs text-[#495057] select-none shrink-0">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-left">
          <div className="flex items-center gap-2 font-bold" style={{ color: '#0B5FA5' }}>
            <span>अखिल भारतीय आयुर्वेद संस्थान (AIIA)</span>
            <span className="text-[#CED4DA]">|</span>
            <span className="font-semibold text-[#495057]">OPD Terminal #01</span>
          </div>
          <div className="text-[11px] font-semibold text-[#6C757D]">
            <span>राष्ट्रीय आयुष हेल्पलाइन: 1800-11-2233</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
