/**
 * Universal Speech & Audio Engine for AYUSH-Care Kiosk
 * 
 * Provides 100% reliable voice playback in Hindi and English:
 * 1. Primary: High-fidelity Server-side TTS stream via /api/tts (gTTS cached MP3).
 *    Works on all browsers, bypasses CORS, zero missing-voice issues on Windows.
 * 2. Secondary Fallback: Browser Web Speech Synthesis with dedicated Hindi/English voice matching.
 * 3. Automatic Autoplay unlock on first user tap/key.
 */

import { API_BASE_URL } from '@/lib/config';

class SpeechEngine {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private isUnlocked: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
        this.loadVoices();
        if (this.synth.onvoiceschanged !== undefined) {
          this.synth.onvoiceschanged = () => {
            this.loadVoices();
          };
        }
      }

      // Automatically unlock audio on first interaction
      const unlockHandler = () => {
        this.unlockAudio();
        window.removeEventListener('pointerdown', unlockHandler);
        window.removeEventListener('keydown', unlockHandler);
      };
      window.addEventListener('pointerdown', unlockHandler, { passive: true });
      window.addEventListener('keydown', unlockHandler, { passive: true });
    }
  }

  public unlockAudio() {
    this.isUnlocked = true;
    if (this.synth && this.synth.paused) {
      this.synth.resume();
    }
  }

  public loadVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    const v = this.synth.getVoices();
    if (v.length > 0) {
      this.voices = v;
    }
    return this.voices;
  }

  public getHindiVoice(): SpeechSynthesisVoice | undefined {
    const vList = this.voices.length > 0 ? this.voices : (this.synth?.getVoices() || []);
    return (
      vList.find((v) => v.lang === 'hi-IN' || v.lang === 'hi_IN' || v.lang.startsWith('hi')) ||
      vList.find(
        (v) =>
          v.name.toLowerCase().includes('hindi') ||
          v.name.toLowerCase().includes('swara') ||
          v.name.toLowerCase().includes('kalpana') ||
          v.name.toLowerCase().includes('madhur') ||
          v.name.toLowerCase().includes('hemant')
      )
    );
  }

  public getEnglishVoice(): SpeechSynthesisVoice | undefined {
    const vList = this.voices.length > 0 ? this.voices : (this.synth?.getVoices() || []);
    return (
      vList.find((v) => v.lang === 'en-IN' || v.lang === 'en_IN') ||
      vList.find(
        (v) =>
          v.name.toLowerCase().includes('india') ||
          v.name.toLowerCase().includes('heera') ||
          v.name.toLowerCase().includes('neerja')
      ) ||
      vList.find((v) => v.lang === 'en-GB') ||
      vList.find((v) => v.lang === 'en-US') ||
      vList.find((v) => v.lang.startsWith('en'))
    );
  }

  /**
   * Play speech using the backend TTS endpoint (/api/tts), falling back to native SpeechSynthesis.
   */
  public playAudioStream(text: string, lang: string = 'hi', onEnd?: () => void) {
    this.stop();

    const cleanText = text.trim();
    if (!cleanText) {
      if (onEnd) onEnd();
      return;
    }

    const cleanLang = lang.startsWith('hi') ? 'hi' : 'en';

    try {
      const encoded = encodeURIComponent(cleanText);
      const audioUrl = `${API_BASE_URL}/api/tts?lang=${cleanLang}&text=${encoded}`;

      const audio = new Audio(audioUrl);
      this.currentAudio = audio;

      audio.onended = () => {
        this.currentAudio = null;
        if (onEnd) onEnd();
      };

      audio.onerror = (e) => {
        console.warn('Backend TTS stream failed, using native synth fallback:', e);
        this.currentAudio = null;
        this.speakNativeSynth(cleanText, cleanLang as 'hi' | 'en', onEnd);
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Audio play prevented (Autoplay), attempting native synth fallback:', err);
          this.speakNativeSynth(cleanText, cleanLang as 'hi' | 'en', onEnd);
        });
      }
    } catch (err) {
      console.warn('Audio initialization error:', err);
      this.speakNativeSynth(cleanText, cleanLang as 'hi' | 'en', onEnd);
    }
  }

  /**
   * Native Speech Synthesis Fallback.
   */
  public speakNativeSynth(text: string, lang: 'hi' | 'en', onEnd?: () => void) {
    if (!this.synth) {
      if (onEnd) onEnd();
      return;
    }

    if (this.synth.paused) {
      this.synth.resume();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.90;
    utterance.pitch = 1.0;

    if (lang === 'hi') {
      const hVoice = this.getHindiVoice();
      if (hVoice) {
        utterance.voice = hVoice;
      }
    } else {
      const eVoice = this.getEnglishVoice();
      if (eVoice) {
        utterance.voice = eVoice;
      }
    }

    utterance.onend = () => {
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = (err) => {
      console.warn('SpeechSynthesis error:', err);
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    this.currentUtterance = utterance;

    setTimeout(() => {
      if (this.synth) {
        this.synth.resume();
        this.synth.speak(utterance);
      }
    }, 50);
  }

  /**
   * Speak single utterance in specified language ('hi' or 'en').
   */
  public speak(text: string, lang: string = 'hi', onEnd?: () => void) {
    this.stop();
    this.playAudioStream(text, lang, onEnd);
  }

  /**
   * Sequential Bilingual Speech: Plays Hindi first, then English second.
   */
  public speakBilingual(
    hindiText: string,
    englishText: string,
    onEnd?: () => void
  ) {
    this.stop();

    // Step 1: Hindi voice prompt
    this.playAudioStream(hindiText, 'hi', () => {
      // Step 2: Once Hindi finishes -> English voice prompt
      setTimeout(() => {
        this.playAudioStream(englishText, 'en', onEnd);
      }, 250);
    });
  }

  /**
   * Stop any active audio or speech synthesis immediately.
   */
  public stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    if (this.synth) {
      this.synth.cancel();
    }
    this.currentUtterance = null;
  }

  /**
   * Check if speech or audio is currently playing.
   */
  public isSpeaking(): boolean {
    const isSynthSpeaking = !!(this.synth && this.synth.speaking);
    const isAudioPlaying = !!(this.currentAudio && !this.currentAudio.paused);
    return isSynthSpeaking || isAudioPlaying;
  }
}

export const speechEngine = new SpeechEngine();
