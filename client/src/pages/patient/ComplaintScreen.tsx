import React, { useState, useEffect } from 'react';
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
    english: 'Chronic Cough / Asthma / Breathing issue',
    ayushTerm: 'कास-श्वास (Kasa-Shwasa)',
    category: 'respiratory',
  },
  {
    id: 'skin',
    hindi: 'त्वचा में खुजली / लाल चकत्ते / दाद',
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
    id: 'metabolic',
    hindi: 'शुगर / बार-बार पेशाब / वजन समस्या',
    english: 'Diabetes / Frequent Urination',
    ayushTerm: 'प्रमेह (Prameha)',
    category: 'metabolic',
  },
  {
    id: 'fatigue',
    hindi: 'अत्यधिक कमजोरी / सुस्ती / भूख न लगना',
    english: 'Fatigue / Low Appetite / Weakness',
    ayushTerm: 'अग्निमांद्य (Agnimandya)',
    category: 'general',
  },
  {
    id: 'emergency-test',
    hindi: 'सीने में भारीपन / सांस फूलना (आपातकाल)',
    english: 'Chest Pain / Severe Shortness of Breath (Emergency)',
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
    'आज आपको क्या परेशानी या बीमारी महसूस हो रही है? कृपया माइक दबाकर अपनी भाषा में बोलें या नीचे दिए गए लक्षणों पर स्पर्श करें।';
  const promptEnglish =
    'What symptoms or health trouble brings you to the hospital today? Please tap the mic to speak or select from the options below.';

  // Check for Red Flags in Speech or Text
  const checkRedFlags = (text: string) => {
    const lower = text.toLowerCase();
    const criticalTerms = [
      'सीने में दर्द',
      'chest pain',
      'सांस फूलना',
      'breathing',
      'खून',
      'blood',
      'बेहोशी',
      'unconscious',
      'stroke',
      'heart attack',
      'हार्ट',
    ];

    const match = criticalTerms.some((term) => lower.includes(term));
    if (match) {
      setRedFlag(true, 'Critical Emergency Symptom Detected in Chief Complaint');
      setShowRedFlagModal(true);
    }
  };

  // Web Speech API Voice Recognition (STT)
  const handleToggleRecord = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }

    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Voice recognition is not supported in this browser. Please type or select a symptom.');
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

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

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
    <div className="flex flex-col min-h-[calc(100vh-76px)] bg-[#EAEDF0] text-[#212529] justify-between font-sans select-none">
      
      {/* Central Content */}
      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-8 flex-1 flex flex-col items-center">
        
        {/* Prompter */}
        <div className="mb-3">
          <AudioSpeaker
            hindiText={promptHindi}
            englishText={promptEnglish}
            bilingual={language === 'hi'}
            autoPlay={true}
          />
        </div>

        {/* Top Badge */}
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
          className="text-2xl sm:text-3xl font-black mb-1 tracking-tight text-center"
          style={{ color: '#0B5FA5' }}
        >
          {language === 'hi'
            ? 'आज आपको क्या परेशानी हो रही है?'
            : 'What health trouble brings you here today?'}
        </h1>
        <p className="text-xs sm:text-sm text-[#495057] font-semibold mb-4 text-center max-w-xl">
          {language === 'hi'
            ? 'माइक दबाकर अपनी भाषा में बोलें या नीचे दिए गए आम लक्षणों में से चुनें।'
            : 'Speak naturally using the mic or tap the common symptom tiles below.'}
        </p>

        {/* VOICE INPUT PULSING MIC + TRANSCRIPT BOX */}
        <div className="w-full max-w-2xl bg-white border border-[#CED4DA] rounded-[3px] p-4 sm:p-5 mb-4 flex flex-col items-center">
          
          <div className="flex items-center gap-4 w-full mb-3">
            
            {/* Big 64px Mic Button */}
            <button
              type="button"
              onClick={handleToggleRecord}
              className={`w-16 h-16 rounded-full flex items-center justify-center text-white shrink-0 cursor-pointer transition-transform active:scale-95 border-2 ${
                isRecording
                  ? 'bg-[#DC2626] border-red-700 animate-pulse'
                  : 'bg-[#0B5FA5] border-[#084B83] hover:bg-[#084B83]'
              }`}
              title="Click to speak your symptoms"
            >
              {isRecording ? (
                <MicOff className="w-7 h-7 text-white" />
              ) : (
                <Mic className="w-7 h-7 text-white" />
              )}
            </button>

            {/* Display Field */}
            <div className="flex-1">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#495057] mb-1 flex items-center justify-between">
                <span>
                  {isRecording
                    ? 'सुन रहे हैं... कृपया बोलें (Listening...)'
                    : 'आपका विवरण (Recorded Symptoms):'}
                </span>
                {inputText && (
                  <button
                    type="button"
                    onClick={() => {
                      setInputText('');
                      setSelectedPreset(null);
                    }}
                    className="text-[#DC2626] hover:underline flex items-center gap-1 cursor-pointer font-bold text-[10px]"
                  >
                    <RotateCcw className="w-3 h-3" />
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
                    ? 'माइक दबाकर बोलें या यहाँ लिखें (उदा. घुटनों में 2 हफ्ते से दर्द है)...'
                    : 'Tap mic or type symptoms here (e.g. severe knee pain for 2 weeks)...'
                }
                className="w-full p-2.5 bg-[#F8FAFC] border border-[#CED4DA] rounded-[3px] text-xs sm:text-sm font-bold text-[#212529] focus:outline-none focus:border-[#0B5FA5]"
              />
            </div>

          </div>

        </div>

        {/* COMMON SYMPTOMS TOUCH GRID */}
        <div className="w-full max-w-2xl mb-4">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#495057] mb-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-[#0B5FA5] rounded-full inline-block"></span>
            <span>आम ओपीडी समस्याएं (Touch to Select Symptom):</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {COMMON_SYMPTOMS.map((symptom) => {
              const isSelected = selectedPreset === symptom.id;
              return (
                <button
                  key={symptom.id}
                  type="button"
                  onClick={() => handleSelectPreset(symptom)}
                  className={`p-3 rounded-[3px] border text-left transition-colors cursor-pointer flex items-center justify-between active:scale-[0.99] ${
                    symptom.isRedFlag ? 'border-red-300 bg-red-50/50' : ''
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
                  <div>
                    <span
                      className="text-xs sm:text-sm font-black block leading-tight"
                      style={{ color: isSelected ? '#FFFFFF' : symptom.isRedFlag ? '#991B1B' : '#0B5FA5' }}
                    >
                      {language === 'hi' ? symptom.hindi : symptom.english}
                    </span>
                    <span
                      className="text-[10px] font-bold block mt-0.5"
                      style={{
                        color: isSelected ? 'rgba(255,255,255,0.85)' : '#6C757D',
                      }}
                    >
                      {symptom.ayushTerm}
                    </span>
                  </div>

                  <div
                    className="w-6 h-6 rounded-[2px] border flex items-center justify-center shrink-0 ml-2"
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
        <div className="w-full max-w-md mb-2">
          <button
            type="button"
            onClick={handleProceed}
            disabled={!inputText.trim()}
            className="w-full py-3.5 px-6 rounded-[3px] border border-[#084B83] text-base font-black text-white flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-transform active:scale-[0.99]"
            style={{ backgroundColor: '#0B5FA5' }}
          >
            <span>विस्तार से बताएं • PROCEED TO SOCRATES QUESTIONS</span>
            <ArrowRight className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Back Button */}
        <button
          type="button"
          onClick={() => navigate('/kiosk/consent')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[3px] border border-[#CED4DA] bg-white hover:border-[#0B5FA5] hover:text-[#0B5FA5] text-xs font-bold text-[#212529] transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>सहमति पृष्ठ पर वापस जाएं (Back to Consent)</span>
        </button>

      </main>

      {/* RED FLAG EMERGENCY SAFETY INTERCEPTOR MODAL */}
      {showRedFlagModal && (
        <div className="fixed inset-0 bg-red-950/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full p-6 rounded-[3px] border-4 border-[#DC2626] text-center shadow-2xl">
            <AlertTriangle className="w-16 h-16 text-[#DC2626] mx-auto mb-3 animate-bounce" />
            <div className="inline-block px-3 py-1 bg-[#FEF2F2] border border-[#DC2626] text-[#DC2626] text-xs font-extrabold uppercase tracking-widest mb-2">
              🚨 आपातकालीन लक्षण चेतावनी / EMERGENCY RED FLAG ALERT
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#DC2626] mb-2 leading-tight">
              तत्काल आपातकालीन चिकित्सा कक्ष में जाएं!
            </h2>
            <p className="text-xs sm:text-sm text-[#212529] font-bold mb-4 leading-relaxed">
              आपके बताए लक्षण (जैसे सीने में तेज दर्द या सांस फूलना) को तुरंत डॉक्टर द्वारा देखने की आवश्यकता है।
            </p>
            <div className="bg-[#FEF2F2] p-3 rounded-[3px] border border-red-200 text-xs font-extrabold text-[#991B1B] mb-6 text-left">
              • कृपया कियोस्क प्रक्रिया रोकें।<br />
              • सीधे भूतल (Ground Floor) <strong>इमरजेंसी / कैजुअल्टी वार्ड (Room #E-01)</strong> में जाएं।<br />
              • अस्पताल सुरक्षा एवं नर्सिंग स्टाफ को तुरंत सूचित कर दिया गया है।
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowRedFlagModal(false);
                  navigate('/');
                }}
                className="flex-1 py-3 bg-[#DC2626] hover:bg-red-700 text-white font-black text-xs rounded-[3px] cursor-pointer"
              >
                इमरजेंसी कक्ष में जाएं (Proceed to Emergency)
              </button>
              <button
                type="button"
                onClick={() => setShowRedFlagModal(false)}
                className="py-3 px-4 border border-[#CED4DA] text-xs font-bold text-[#495057] hover:bg-[#EAEDF0] rounded-[3px] cursor-pointer"
              >
                गलती से दर्ज हुआ (Dismiss & Continue)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Single-Line Clean Footer */}
      <footer className="w-full bg-white border-t border-[#CED4DA] py-2 px-6 text-xs text-[#495057] select-none">
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
