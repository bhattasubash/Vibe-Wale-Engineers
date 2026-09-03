import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { speechEngine } from '@/lib/speech';
import { cn } from '@/lib/utils';

export interface AudioSpeakerProps {
  text?: string;
  hindiText?: string;
  englishText?: string;
  lang?: 'hi' | 'en';
  bilingual?: boolean;
  autoPlay?: boolean;
  onSpeechEnd?: () => void;
  className?: string;
}

export const AudioSpeaker: React.FC<AudioSpeakerProps> = ({
  text,
  hindiText,
  englishText,
  lang = 'hi',
  bilingual = false,
  autoPlay = true,
  onSpeechEnd,
  className,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const playAudio = () => {
    setIsPlaying(true);
    if (bilingual && hindiText && englishText) {
      speechEngine.speakBilingual(hindiText, englishText, () => {
        setIsPlaying(false);
        if (onSpeechEnd) onSpeechEnd();
      });
    } else if (text) {
      speechEngine.speak(text, lang, () => {
        setIsPlaying(false);
        if (onSpeechEnd) onSpeechEnd();
      });
    } else {
      setIsPlaying(false);
    }
  };

  const stopAudio = () => {
    speechEngine.stop();
    setIsPlaying(false);
  };

  useEffect(() => {
    if (autoPlay) {
      const timer = setTimeout(() => {
        playAudio();
      }, 500);
      return () => {
        clearTimeout(timer);
        speechEngine.stop();
      };
    }
  }, [text, hindiText, englishText, lang, autoPlay]);

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 bg-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-kiosk-md border border-ayush-border shadow-sm select-none',
        className
      )}
    >
      <button
        onClick={isPlaying ? stopAudio : playAudio}
        type="button"
        className={cn(
          'inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-kiosk-sm font-bold text-xs sm:text-sm transition-all duration-150 focus:outline-none',
          isPlaying
            ? 'bg-ayush-navy text-white shadow-sm animate-pulse'
            : 'bg-ayush-navyLight text-ayush-navy hover:bg-ayush-navy hover:text-white'
        )}
        aria-label={isPlaying ? 'Stop Spoken Audio' : 'Play Spoken Audio'}
      >
        {isPlaying ? (
          <>
            <VolumeX className="w-4 h-4 shrink-0" />
            <span>रोकें (Stop)</span>
          </>
        ) : (
          <>
            <Volume2 className="w-4 h-4 shrink-0 text-ayush-navy group-hover:text-white" />
            <span>आवाज़ में सुनें (Listen Aloud)</span>
          </>
        )}
      </button>

      {/* Repeat Button */}
      <button
        onClick={playAudio}
        type="button"
        className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-kiosk-sm text-ayush-textMuted hover:text-ayush-navy hover:bg-ayush-navyLight text-xs font-bold transition-all"
        title="Repeat Voice Instructions"
      >
        <RotateCcw className="w-3.5 h-3.5 shrink-0" />
        <span>दोबारा (Repeat)</span>
      </button>
    </div>
  );
};
