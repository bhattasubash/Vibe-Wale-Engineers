import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

interface VoiceAnswerButtonProps {
  onTranscript: (text: string) => void;
  language?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export const VoiceAnswerButton: React.FC<VoiceAnswerButtonProps> = ({
  onTranscript,
  language = 'hi',
  className = '',
  size = 'md',
  label,
}) => {
  const [isListening, setIsListening] = useState(false);
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
          ? 'इस ब्राउज़र में ध्वनि पहचान उपलब्ध नहीं है। कृपया लिखकर या बटन दबाकर चुनें।'
          : 'Speech recognition is not supported in this browser. Please tap an option.'
      );
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 3;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript && transcript.trim()) {
          onTranscript(transcript.trim());
        }
      };

      recognition.onerror = (err: any) => {
        console.warn('Speech recognition error:', err);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Could not start recognition:', err);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
      setIsListening(false);
    }
  };

  const toggleListening = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const sizeClasses = {
    sm: 'py-1 px-2 text-[11px]',
    md: 'py-1.5 px-3 text-xs',
    lg: 'py-2 px-4 text-sm',
  };

  return (
    <button
      type="button"
      onClick={toggleListening}
      className={`inline-flex items-center gap-1.5 rounded-[3px] font-bold border transition-colors cursor-pointer select-none ${
        sizeClasses[size]
      } ${
        isListening
          ? 'bg-[#FEF2F2] border-[#DC2626] text-[#DC2626] animate-pulse shadow-xs'
          : 'bg-[#F8FAFC] border-[#CED4DA] text-[#0B5FA5] hover:bg-[#E8F1F8] hover:border-[#0B5FA5]'
      } ${className}`}
      title={isListening ? 'बोलना समाप्त करें (Stop Listening)' : 'बोलकर उत्तर दें (Speak Answer)'}
    >
      {isListening ? (
        <>
          <MicOff className="w-3.5 h-3.5 shrink-0 text-[#DC2626]" />
          <span>{label ? `${label} (सुन रहे हैं...)` : 'सुन रहे हैं... (Listening)'}</span>
        </>
      ) : (
        <>
          <Mic className="w-3.5 h-3.5 shrink-0 text-[#0B5FA5]" />
          <span>{label || (language === 'hi' ? 'बोलकर चुनें (Speak)' : 'Speak Option')}</span>
        </>
      )}
    </button>
  );
};
