import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2, Check, RotateCcw } from 'lucide-react';

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

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
    };
  }, []);

  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        language === 'hi'
          ? 'इस ब्राउज़र में ध्वनि पहचान उपलब्ध नहीं है। कृपया नीचे दिए विकल्पों में से चुनें।'
          : 'Speech recognition is not supported in this browser. Please select an option.'
      );
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 3;

      recognition.onstart = () => {
        setVoiceState('listening');
      };

      recognition.onresult = (event: any) => {
        setVoiceState('processing');
        const transcript = event.results[0][0].transcript;
        if (transcript && transcript.trim()) {
          setCandidateText(transcript.trim());
          setVoiceState('understood');
        } else {
          setVoiceState('ready');
        }
      };

      recognition.onerror = (err: any) => {
        console.warn('Speech recognition error:', err);
        setVoiceState('ready');
      };

      recognition.onend = () => {
        setVoiceState((prev) => (prev === 'listening' ? 'ready' : prev));
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Could not start recognition:', err);
      setVoiceState('ready');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }
  };

  const handleConfirm = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (candidateText) {
      onTranscript(candidateText);
      setVoiceState('ready');
      setCandidateText('');
    }
  };

  const handleRetry = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCandidateText('');
    startListening();
  };

  const sizeClasses = {
    sm: 'py-1 px-2 text-[11px]',
    md: 'py-1.5 px-3 text-xs',
    lg: 'py-2 px-4 text-sm',
  };

  if (voiceState === 'understood' && candidateText) {
    return (
      <div className={`inline-flex items-center gap-2 bg-[#F0FDF4] border border-[#15803D]/40 rounded-[3px] p-1.5 ${className}`}>
        <span className="text-xs font-bold text-[#15803D] pl-1">
          {language === 'hi' ? 'आपने कहा:' : 'You said:'} &ldquo;{candidateText}&rdquo;
        </span>
        <button
          type="button"
          onClick={handleConfirm}
          className="px-2 py-1 bg-[#15803D] text-white rounded-[2px] text-xs font-black flex items-center gap-1 hover:bg-[#166534] cursor-pointer"
          title="पुष्टि करें"
        >
          <Check className="w-3.5 h-3.5" />
          <span>{language === 'hi' ? 'सही है' : 'Confirm'}</span>
        </button>
        <button
          type="button"
          onClick={handleRetry}
          className="px-2 py-1 bg-white border border-[#CED4DA] text-[#495057] rounded-[2px] text-xs font-bold flex items-center gap-1 hover:bg-[#F8FAFC] cursor-pointer"
          title="दोबारा बोलें"
        >
          <RotateCcw className="w-3 h-3" />
          <span>{language === 'hi' ? 'दोबारा' : 'Retry'}</span>
        </button>
      </div>
    );
  }

  if (voiceState === 'processing') {
    return (
      <div className={`inline-flex items-center gap-1.5 py-1.5 px-3 rounded-[3px] bg-[#E8F1F8] border border-[#0B5FA5]/30 text-xs font-bold text-[#0B5FA5] ${className}`}>
        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0B5FA5]" />
        <span>{language === 'hi' ? 'आपकी बात समझ रहे हैं...' : 'Understanding your response...'}</span>
      </div>
    );
  }

  if (voiceState === 'listening') {
    return (
      <button
        type="button"
        onClick={stopListening}
        className={`inline-flex items-center gap-1.5 rounded-[3px] font-bold border transition-colors cursor-pointer select-none bg-[#FEF2F2] border-[#DC2626] text-[#DC2626] animate-pulse shadow-xs ${sizeClasses[size]} ${className}`}
        title="रोकें"
      >
        <Square className="w-3 h-3 fill-current text-[#DC2626]" />
        <span>{language === 'hi' ? 'सुन रहे हैं... (रोकने के लिए दबाएं)' : 'Listening... (Tap to stop)'}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={startListening}
      className={`inline-flex items-center gap-1.5 rounded-[3px] font-bold border transition-colors cursor-pointer select-none bg-[#F8FAFC] border-[#CED4DA] text-[#0B5FA5] hover:bg-[#E8F1F8] hover:border-[#0B5FA5] ${sizeClasses[size]} ${className}`}
      title="बोलकर जवाब दें"
    >
      <Mic className="w-3.5 h-3.5 shrink-0 text-[#0B5FA5]" />
      <span>{label || (language === 'hi' ? 'बोलना शुरू करें' : 'Tap to Speak')}</span>
    </button>
  );
};
