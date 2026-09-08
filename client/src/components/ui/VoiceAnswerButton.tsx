import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2, Check, RotateCcw } from 'lucide-react';
import { audioRecorder } from '@/lib/audioRecorder';
import { API_BASE_URL } from '@/lib/config';

interface VoiceAnswerButtonProps {
  onTranscript: (text: string) => void;
  language?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

type VoiceState = 'ready' | 'listening' | 'processing' | 'understood';

export const VoiceAnswerButton: React.FC<VoiceAnswerButtonProps> = ({
  onTranscript,
  language = 'hi',
  className = '',
  size = 'md',
  label,
}) => {
  const [voiceState, setVoiceState] = useState<VoiceState>('ready');
  const [candidateText, setCandidateText] = useState<string>('');
  const recognitionRef = useRef<any>(null);
  const isRecordingAudioRef = useRef(false);

  useEffect(() => {
    return () => {
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

  const handleReceivedTranscript = (text: string) => {
    const clean = text.trim();
    if (!clean) {
      setVoiceState('ready');
      return;
    }
    setCandidateText(clean);
    setVoiceState('understood');
    onTranscript(clean);
  };

  const startListening = async () => {
    setCandidateText('');
    setVoiceState('listening');

    // Start hardware audio recorder for Wispr Flow fallback
    try {
      await audioRecorder.start();
      isRecordingAudioRef.current = true;
    } catch (err) {
      isRecordingAudioRef.current = false;
      console.warn('Hardware mic recorder not available, using Web Speech only:', err);
    }

    // Try browser SpeechRecognition
    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRec) {
      try {
        const recognition = new SpeechRec();
        recognitionRef.current = recognition;
        recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
        recognition.interimResults = false;
        recognition.maxAlternatives = 3;

        recognition.onresult = (event: any) => {
          const transcript = event.results[0]?.[0]?.transcript;
          if (transcript && transcript.trim()) {
            handleReceivedTranscript(transcript);
          }
        };

        recognition.onerror = (err: any) => {
          console.warn('SpeechRecognition error, falling back to Wispr Flow:', err);
        };

        recognition.onend = async () => {
          // If already understood via SpeechRecognition, stop audio recorder
          if (isRecordingAudioRef.current && audioRecorder.recording) {
            try {
              const audioResult = await audioRecorder.stop();
              isRecordingAudioRef.current = false;
              // If SpeechRecognition produced nothing, transcribe with Wispr Flow
              if (!candidateText && audioResult.durationSeconds >= 0.4 && audioResult.base64) {
                setVoiceState('processing');
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
                  if (data.success && data.text?.trim()) {
                    handleReceivedTranscript(data.text);
                    return;
                  }
                }
              }
            } catch (recErr) {
              console.warn('Wispr Flow fallback error:', recErr);
            }
          }
          setVoiceState((prev) => (prev === 'listening' ? 'ready' : prev));
        };

        recognition.start();
        return;
      } catch (e) {
        console.warn('Web Speech recognition start error:', e);
      }
    }

    // If SpeechRecognition is not available at all, rely purely on audioRecorder
    if (!SpeechRec && !isRecordingAudioRef.current) {
      alert(
        language === 'hi'
          ? 'इस ब्राउज़र में ध्वनि पहचान उपलब्ध नहीं है। कृपया नीचे दिए विकल्पों में से चुनें या लिखकर बताएं।'
          : 'Speech recognition is not supported in this browser. Please select or type an option.'
      );
      setVoiceState('ready');
    }
  };

  const stopListening = async () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }

    if (isRecordingAudioRef.current && audioRecorder.recording) {
      try {
        setVoiceState('processing');
        const audioResult = await audioRecorder.stop();
        isRecordingAudioRef.current = false;
        if (!candidateText && audioResult.durationSeconds >= 0.4 && audioResult.base64) {
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
            if (data.success && data.text?.trim()) {
              handleReceivedTranscript(data.text);
              return;
            }
          }
        }
      } catch (err) {
        console.warn('Wispr Flow transcription error:', err);
      }
    }

    setVoiceState((prev) => (prev === 'listening' || prev === 'processing' ? 'ready' : prev));
  };

  const handleRetry = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCandidateText('');
    startListening();
  };

  const sizeClasses = {
    sm: 'py-1 px-2.5 text-[11px]',
    md: 'py-1.5 px-3 text-xs',
    lg: 'py-2 px-4 text-sm',
  };

  if (voiceState === 'understood' && candidateText) {
    return (
      <div className={`inline-flex items-center gap-2 bg-[#F0FDF4] border border-[#15803D]/40 rounded-[3px] p-1.5 ${className}`}>
        <span className="text-xs font-bold text-[#15803D] pl-1 max-w-[200px] truncate">
          ✓ {language === 'hi' ? 'दर्ज किया गया:' : 'Recorded:'} &ldquo;{candidateText}&rdquo;
        </span>
        <button
          type="button"
          onClick={handleRetry}
          className="px-2 py-0.5 bg-white border border-[#CED4DA] text-[#495057] rounded-[2px] text-[11px] font-bold flex items-center gap-1 hover:bg-[#F8FAFC] cursor-pointer"
          title="दोबारा बोलें"
        >
          <RotateCcw className="w-3 h-3" />
          <span>{language === 'hi' ? 'दोबारा बोलें' : 'Retry'}</span>
        </button>
      </div>
    );
  }

  if (voiceState === 'processing') {
    return (
      <div className={`inline-flex items-center gap-1.5 py-1.5 px-3 rounded-[3px] bg-[#E8F1F8] border border-[#0B5FA5]/30 text-xs font-bold text-[#0B5FA5] ${className}`}>
        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0B5FA5]" />
        <span>{language === 'hi' ? 'आवाज़ समझ रहे हैं...' : 'Transcribing voice...'}</span>
      </div>
    );
  }

  if (voiceState === 'listening') {
    return (
      <button
        type="button"
        onClick={stopListening}
        className={`inline-flex items-center gap-1.5 rounded-[3px] font-bold border transition-colors cursor-pointer select-none bg-[#FEF2F2] border-[#DC2626] text-[#DC2626] animate-pulse shadow-xs ${sizeClasses[size]} ${className}`}
        title="बोलना समाप्त करने के लिए दबाएं"
      >
        <Square className="w-3 h-3 fill-current text-[#DC2626]" />
        <span>{language === 'hi' ? 'सुन रहे हैं... (रोकने के लिए दबाएं)' : 'Listening... (Tap to finish)'}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={startListening}
      className={`inline-flex items-center gap-1.5 rounded-[3px] font-black border transition-colors cursor-pointer select-none bg-[#E8F1F8] border-[#0B5FA5]/40 text-[#0B5FA5] hover:bg-[#0B5FA5] hover:text-white shadow-2xs ${sizeClasses[size]} ${className}`}
      title="बोलकर जवाब दें"
    >
      <Mic className="w-3.5 h-3.5 shrink-0" />
      <span>{label || (language === 'hi' ? 'बोलकर जवाब दें' : 'Tap to Speak')}</span>
    </button>
  );
};
