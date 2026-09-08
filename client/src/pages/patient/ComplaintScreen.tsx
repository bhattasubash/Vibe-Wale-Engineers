import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mic,
  MicOff,
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  Check,
  RotateCcw,
  Activity,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { AudioSpeaker } from '@/components/ui/AudioSpeaker';
import { useSessionStore } from '@/stores/sessionStore';
import { speechEngine } from '@/lib/speech';
import { audioRecorder } from '@/lib/audioRecorder';
import { API_BASE_URL } from '@/lib/config';


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
  const {
    sessionId,
    language,
    setChiefComplaint,
    setRedFlag,
    setDynamicQuestions,
    setSessionId,
    getOrCreateSessionId,
  } = useSessionStore();

  const [inputText, setInputText] = useState('');
  const [selectedPresets, setSelectedPresets] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isInferring, setIsInferring] = useState(false);
  const [transcriptionNotice, setTranscriptionNotice] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const [showRedFlagModal, setShowRedFlagModal] = useState(false);
  const [showTypingFallback, setShowTypingFallback] = useState(false);

  const recognitionRef = useRef<any>(null);

  const promptHindi =
    'आज आपको क्या परेशानी महसूस हो रही है? बोलकर बताएं या नीचे दिए गए लक्षणों पर निशान लगाएं।';
  const promptEnglish =
    'What symptoms bring you here today? Speak using the mic or check the symptom options below.';

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      speechEngine.stop();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
      if (audioRecorder.recording) {
        audioRecorder.stop().catch(() => {});
      }
    };
  }, []);

  const checkRedFlags = (text: string) => {
    const lower = text.toLowerCase();
    const criticalTerms = [
      'सीने में दर्द',
      'chest pain',
      'सीने में भारीपन',
      'सांस फूलना',
      'shortness of breath',
      'खून',
      'blood',
      'बेहोशी',
      'stroke',
      'हार्ट',
      'heart pain',
      'लकवा',
    ];

    const negationWords = [
      'no',
      'not',
      'never',
      'denies',
      'denied',
      'without',
      'नहीं',
      'ना',
      'बिना',
      'कोई नहीं',
    ];

    const matchedTerm = criticalTerms.find((term) => {
      const idx = lower.indexOf(term);
      if (idx === -1) return false;

      // Extract surrounding window
      const start = Math.max(0, idx - 30);
      const end = Math.min(lower.length, idx + term.length + 20);
      const preWords = lower.slice(start, idx).trim().split(/\s+/);
      const postWords = lower.slice(idx + term.length, end).trim().split(/\s+/);

      const isNegatedPre = preWords.slice(-3).some((w) => negationWords.includes(w));
      const isNegatedPost = postWords.slice(0, 3).some((w) => negationWords.includes(w));

      return !isNegatedPre && !isNegatedPost;
    });

    if (matchedTerm) {
      setRedFlag(true, `Emergency symptom detected: ${matchedTerm}`);
      setShowRedFlagModal(true);
    }
  };

  const handleToggleRecord = async () => {
    // 1. FORCEFULLY SILENCE any background TTS speech immediately
    speechEngine.stop();

    if (isRecording) {
      setIsRecording(false);

      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }

      // If audioRecorder was capturing WAV, finalize and send
      if (audioRecorder.recording) {
        try {
          setIsTranscribing(true);
          setTranscriptionNotice(
            language === 'hi'
              ? 'आवाज़ ट्रांसक्रिप्शन जारी है...'
              : 'Transcribing voice audio...'
          );
          const audioResult = await audioRecorder.stop();
          if (audioResult.durationSeconds >= 0.3 && audioResult.base64) {
            try {
              const res = await fetch(`${API_BASE_URL}/api/sessions/transcribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  audio_base64: audioResult.base64,
                  properties: { language },
                }),
              });

              if (res.ok) {
                const data = await res.json();
                if (data.success && data.text && data.text.trim()) {
                  setInputText((prev) => (prev ? `${prev}, ${data.text.trim()}` : data.text.trim()));
                  checkRedFlags(data.text.trim());
                }
              }
            } catch (apiErr) {
              console.warn('Transcription API request failed, keeping local transcript:', apiErr);
            }
          }
        } catch (err) {
          console.warn('Audio recorder stop error:', err);
        } finally {
          setIsTranscribing(false);
          setTranscriptionNotice(null);
        }
      }
      return;
    }

    setMicError(null);
    setTranscriptionNotice(null);

    // 2. Start hardware audio recorder
    try {
      await audioRecorder.start();
    } catch (audioErr) {
      console.warn('AudioRecorder start failed (mic permission or unsupported), using Web Speech:', audioErr);
    }

    // 3. Initialize Web Speech API for real-time live preview
    const SpeechRec =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition ||
      (window as any).mozSpeechRecognition ||
      (window as any).msSpeechRecognition;

    if (SpeechRec) {
      try {
        const recognition = new SpeechRec();
        recognitionRef.current = recognition;

        recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          speechEngine.stop();
          setIsRecording(true);
        };

        recognition.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          const currentText = finalTranscript || interimTranscript;
          if (currentText.trim()) {
            setInputText(currentText);
            checkRedFlags(currentText);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('SpeechRecognition warning:', event.error);
          if (event.error === 'not-allowed') {
            setMicError('माइक अनुमति अस्वीकृत है। कृपया सेटिंग्स में अनुमति दें।');
            setIsRecording(false);
          }
        };

        recognition.onend = () => {
          // Handled on explicit toggle
        };

        recognition.start();
        setIsRecording(true);
      } catch (err: any) {
        console.warn('Web Speech start error:', err);
        setIsRecording(true);
      }
    } else {
      setIsRecording(true);
    }
  };

  const handleTogglePreset = (preset: SymptomPreset) => {
    speechEngine.stop();
    const isCurrentlySelected = selectedPresets.includes(preset.id);
    let nextPresets: string[];

    if (isCurrentlySelected) {
      nextPresets = selectedPresets.filter((id) => id !== preset.id);
    } else {
      nextPresets = [...selectedPresets, preset.id];
    }
    setSelectedPresets(nextPresets);

    // Build text from selected presets + custom input
    const presetLabels = nextPresets
      .map((id) => COMMON_SYMPTOMS.find((s) => s.id === id))
      .filter(Boolean)
      .map((s) => (language === 'hi' ? `${s!.hindi} (${s!.ayushTerm})` : `${s!.english} (${s!.ayushTerm})`));

    setInputText(presetLabels.join(', '));

    if (!isCurrentlySelected && preset.isRedFlag) {
      setRedFlag(true, 'Red Flag Triggered: Emergency Chest / Respiratory Disturbance');
      setShowRedFlagModal(true);
    }
  };

  const handleProceed = async () => {
    speechEngine.stop();
    if (isRecording) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
      if (audioRecorder.recording) {
        try {
          await audioRecorder.stop();
        } catch (_) {}
      }
      setIsRecording(false);
    }

    if (!inputText.trim() || isInferring) return;

    const activePreset = COMMON_SYMPTOMS.find((s) => selectedPresets.includes(s.id));
    const category = activePreset ? activePreset.category : 'general';
    setChiefComplaint(inputText, category);

    // Call Complaint Inference
    setIsInferring(true);
    const activeSessionId = sessionId || getOrCreateSessionId();
    try {
      const res = await fetch(`${API_BASE_URL}/api/sessions/infer-complaint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          complaint_text: inputText,
          session_id: activeSessionId,
          language: language,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.session_id) {
          setSessionId(data.session_id);
        }
        if (data.questions && data.questions.length > 0) {
          setDynamicQuestions(
            data.questions,
            data.matched_set_id,
            data.matched_set_title,
            data.source
          );
        }
        if (data.red_flag && data.red_flag.triggered) {
          setRedFlag(true, data.red_flag.rule_name || 'Emergency Red Flag Triggered');
          setShowRedFlagModal(true);
          return;
        }
      }
    } catch (err) {
      console.warn('Complaint inference endpoint error, proceeding with default questions:', err);
    } finally {
      setIsInferring(false);
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
            <span>{language === 'hi' ? 'मुख्य स्वास्थ्य समस्या' : 'Primary Symptoms'}</span>
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
              ? 'बोलकर बताएं या नीचे दिए गए लक्षणों में से चुनें (एक या अधिक)'
              : 'Speak into the mic or select symptoms below (one or more)'}
          </p>
        </div>

        {/* VOICE INPUT PULSING MIC + TRANSCRIPT FIELD */}
        <div className="w-full max-w-2xl bg-white border border-[#CED4DA] rounded-[3px] p-3 sm:p-4 flex flex-col gap-2 shrink-0">
          
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleToggleRecord}
              className={`w-14 h-14 rounded-full flex items-center justify-center text-white shrink-0 cursor-pointer transition-transform active:scale-95 border-2 ${
                isRecording
                  ? 'bg-[#DC2626] border-red-700 animate-pulse'
                  : 'bg-[#0B5FA5] border-[#084B83] hover:bg-[#084B83]'
              }`}
              title={isRecording ? 'रोकें (Stop)' : 'बोलने के लिए दबाएं (Tap to Speak)'}
            >
              {isRecording ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
            </button>

            <div className="flex-1">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#495057] mb-0.5 flex items-center justify-between">
                <span className={isRecording ? 'text-[#DC2626] font-black animate-pulse flex items-center gap-1.5' : ''}>
                  {isRecording ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-[#DC2626] inline-block animate-ping" />
                      <span>सुन रहे हैं... बोलिए (Listening...)</span>
                    </>
                  ) : (
                    <span>{language === 'hi' ? 'दर्ज लक्षण (Selected Symptoms):' : 'Selected Symptoms:'}</span>
                  )}
                </span>
                {inputText && (
                  <button
                    type="button"
                    onClick={() => {
                      setInputText('');
                      setSelectedPresets([]);
                    }}
                    className="text-[#DC2626] hover:underline flex items-center gap-0.5 cursor-pointer font-bold text-[10px]"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    <span>हटाएं (Clear)</span>
                  </button>
                )}
              </div>

              {/* Display Box */}
              <div
                className={`w-full min-h-[42px] p-2.5 bg-[#F8FAFC] border rounded-[3px] text-xs sm:text-sm font-bold text-[#212529] flex items-center justify-between ${
                  isRecording ? 'border-[#DC2626] bg-[#FEF2F2]/50' : 'border-[#CED4DA]'
                }`}
              >
                <span className={inputText ? 'text-[#212529]' : 'text-[#6C757D] font-normal'}>
                  {inputText || (language === 'hi' ? 'माइक दबाकर बोलें या नीचे से चुनें...' : 'Speak into mic or choose below...')}
                </span>
              </div>
            </div>
          </div>

          {/* Transcribing Status Banner */}
          {isTranscribing && (
            <div className="p-2 bg-[#E8F1F8] border border-[#0B5FA5]/30 rounded-[2px] text-[11px] text-[#0B5FA5] font-bold flex items-center gap-1.5 animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0B5FA5] shrink-0" />
              <span>{transcriptionNotice || 'आवाज़ ट्रांसक्रिप्शन जारी है...'}</span>
            </div>
          )}

          {/* Mic Error Banner if any */}
          {micError && (
            <div className="p-2 bg-[#FEF2F2] border border-[#DC2626]/40 rounded-[2px] text-[11px] text-[#DC2626] font-bold flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-[#DC2626]" />
              <span>{micError}</span>
            </div>
          )}

        </div>

        {/* COMMON SYMPTOMS CHECKBOX GRID (Multi-select) */}
        <div className="w-full max-w-2xl shrink-0">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#495057] mb-1.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#0B5FA5] rounded-full inline-block"></span>
              <span>{language === 'hi' ? 'लक्षण चुनें (Touch to Select):' : 'Select Symptoms (Checkboxes):'}</span>
            </div>
            <span className="text-[10px] text-[#6C757D] font-bold">
              {language === 'hi' ? 'एक से अधिक चुन सकते हैं' : 'Multiple selections allowed'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {COMMON_SYMPTOMS.map((symptom) => {
              const isSelected = selectedPresets.includes(symptom.id);
              return (
                <button
                  key={symptom.id}
                  type="button"
                  onClick={() => handleTogglePreset(symptom)}
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

                  {/* Checkbox square indicator */}
                  <div
                    className="w-5 h-5 rounded-[2px] border-2 flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: isSelected ? '#FFFFFF' : 'transparent',
                      borderColor: isSelected ? '#FFFFFF' : '#6C757D',
                      color: isSelected ? (symptom.isRedFlag ? '#DC2626' : '#0B5FA5') : 'transparent',
                    }}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* TYPING FALLBACK (Clean toggleable section) */}
        <div className="w-full max-w-2xl shrink-0 text-center">
          {!showTypingFallback ? (
            <button
              type="button"
              onClick={() => setShowTypingFallback(true)}
              className="text-xs text-[#0B5FA5] hover:underline font-bold inline-flex items-center gap-1 cursor-pointer py-1"
            >
              <span>{language === 'hi' ? 'समस्या सूची में नहीं मिल रही? [ यहाँ लिखकर बताएं ]' : 'Symptom not listed? [ Type Here ]'}</span>
            </button>
          ) : (
            <div className="bg-white border border-[#CED4DA] p-2.5 rounded-[3px] text-left">
              <label className="block text-[11px] font-bold text-[#495057] mb-1">
                {language === 'hi' ? 'अपनी समस्या संक्षेप में लिखें:' : 'Type your symptom briefly:'}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => {
                    setInputText(e.target.value);
                    checkRedFlags(e.target.value);
                  }}
                  placeholder={language === 'hi' ? 'जैसे: 3 दिन से पेट में हल्का दर्द...' : 'e.g. mild stomach ache since 3 days...'}
                  className="flex-1 p-2 bg-[#F8FAFC] border border-[#CED4DA] rounded-[3px] text-xs font-bold text-[#212529] focus:outline-none focus:border-[#0B5FA5]"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowTypingFallback(false)}
                  className="px-3 py-1 bg-[#EAEDF0] text-xs font-bold text-[#495057] rounded-[3px] hover:bg-[#CED4DA] cursor-pointer"
                >
                  बंद करें
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Primary CTA Button */}
        <div className="w-full max-w-md shrink-0">
          <button
            type="button"
            onClick={handleProceed}
            disabled={!inputText.trim() || isInferring}
            className="h-12 sm:h-14 px-6 rounded-[3px] border font-black text-sm sm:text-base text-white flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: inputText.trim() ? '#0B5FA5' : '#6C757D',
              borderColor: inputText.trim() ? '#084B83' : '#495057',
            }}
          >
            {isInferring ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-white" />
                <span>
                  {language === 'hi'
                    ? 'लक्षणों का विश्लेषण जारी है (5 प्रश्न तैयार हो रहे हैं)...'
                    : 'Analyzing symptoms & tailoring 5 questions...'}
                </span>
              </>
            ) : (
              <>
                <span>{language === 'hi' ? 'आगे बढ़ें (5 सवाल पूछें)' : 'Proceed to 5 Questions'}</span>
                <ArrowRight className="w-5 h-5 text-white" />
              </>
            )}
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

      {/* ACTIVE EMERGENCY INTERRUPTION MODAL */}
      {showRedFlagModal && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full p-6 rounded-[3px] border-4 border-[#DC2626] text-center shadow-2xl">
            <AlertTriangle className="w-16 h-16 text-[#DC2626] mx-auto mb-2 animate-bounce" />
            <div className="inline-block px-3 py-1 bg-[#FEF2F2] border border-[#DC2626] text-[#DC2626] text-xs font-extrabold uppercase tracking-widest mb-2">
              तत्काल आपातकालीन सहायता / EMERGENCY ALERT
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#DC2626] mb-2 leading-tight">
              सीने में दर्द / सांस फूलने की समस्या
            </h2>
            <p className="text-xs sm:text-sm text-[#212529] font-bold mb-5 leading-relaxed">
              यदि आपको सीने में तेज दर्द, सांस लेने में भारी तकलीफ या अत्यधिक बेचैनी महसूस हो रही है, तो कृपया कतार में प्रतीक्षा न करें। तुरंत आपातकालीन कक्ष (कमरा सं. 02) में जाएं।
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => {
                  alert('अस्पताल सहायता दल को सूचित किया गया है। कृपया काउंटर नंबर 02 (इमरजेंसी) पर तुरंत जाएं।');
                  setShowRedFlagModal(false);
                  navigate('/');
                }}
                className="flex-1 py-3 bg-[#DC2626] hover:bg-red-700 text-white font-black text-xs sm:text-sm rounded-[3px] cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>🚨 अस्पताल कर्मचारी को बुलाएँ</span>
              </button>
              <button
                type="button"
                onClick={() => setShowRedFlagModal(false)}
                className="py-3 px-4 border border-[#CED4DA] text-xs sm:text-sm font-bold text-[#495057] hover:bg-[#EAEDF0] rounded-[3px] cursor-pointer"
              >
                सामान्य परामर्श जारी रखें
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
            <span className="font-semibold text-[#495057]">नई दिल्ली</span>
          </div>
          <div className="text-[11px] font-semibold text-[#6C757D]">
            <span>राष्ट्रीय आयुष हेल्पलाइन: 1800-11-2233</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
