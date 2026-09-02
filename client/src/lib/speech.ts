/**
 * Web Speech API Engine for AYUSH-Care Kiosk
 * Handles text-to-speech (TTS) with voice preloading, asynchronous voice detection,
 * phonetic Romanized fallbacks for systems without native Hindi voice packs,
 * and sequential bilingual playback (Hindi FIRST -> English SECOND).
 */

class SpeechEngine {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => {
          this.loadVoices();
        };
      }
    }
  }

  private loadVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    this.voices = this.synth.getVoices();
    return this.voices;
  }

  private getHindiVoice(): SpeechSynthesisVoice | undefined {
    const vList = this.voices.length > 0 ? this.voices : this.loadVoices();
    return (
      vList.find(v => v.lang === 'hi-IN' || v.lang === 'hi_IN') ||
      vList.find(v => v.lang.toLowerCase().startsWith('hi')) ||
      vList.find(v => v.name.toLowerCase().includes('hindi')) ||
      vList.find(v => v.name.toLowerCase().includes('hemant')) ||
      vList.find(v => v.name.toLowerCase().includes('kalpana')) ||
      vList.find(v => v.name.toLowerCase().includes('swara'))
    );
  }

  private getEnglishVoice(): SpeechSynthesisVoice | undefined {
    const vList = this.voices.length > 0 ? this.voices : this.loadVoices();
    return (
      vList.find(v => v.lang === 'en-IN' || v.lang === 'en_IN') ||
      vList.find(v => v.name.toLowerCase().includes('india')) ||
      vList.find(v => v.name.toLowerCase().includes('heera')) ||
      vList.find(v => v.name.toLowerCase().includes('ravi')) ||
      vList.find(v => v.lang === 'en-GB') ||
      vList.find(v => v.lang === 'en-US') ||
      vList.find(v => v.lang.startsWith('en'))
    );
  }

  /**
   * Speak a single utterance in the chosen language.
   */
  public speak(text: string, lang: 'hi' | 'en' = 'hi', onEnd?: () => void) {
    if (!this.synth) {
      if (onEnd) onEnd();
      return;
    }

    this.stop();
    if (this.synth.paused) {
      this.synth.resume();
    }

    const isHindi = lang === 'hi';
    const hiVoice = isHindi ? this.getHindiVoice() : undefined;
    const enVoice = !isHindi ? this.getEnglishVoice() : undefined;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.88; // Slower, comfortable pace for elderly patients
    utterance.pitch = 1.0;

    if (isHindi) {
      utterance.lang = 'hi-IN';
      if (hiVoice) {
        utterance.voice = hiVoice;
      }
    } else {
      utterance.lang = 'en-IN';
      if (enVoice) {
        utterance.voice = enVoice;
      }
    }

    utterance.onend = () => {
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  /**
   * Sequential Bilingual Speech: Plays Hindi audio FIRST, then English audio SECOND.
   */
  public speakBilingual(
    hindiText: string,
    englishText: string,
    onEnd?: () => void
  ) {
    if (!this.synth) {
      if (onEnd) onEnd();
      return;
    }

    this.stop();
    if (this.synth.paused) {
      this.synth.resume();
    }

    const hiVoice = this.getHindiVoice();
    const enVoice = this.getEnglishVoice();

    // 1. First Utterance: HINDI
    const hiUtterance = new SpeechSynthesisUtterance(hindiText);
    hiUtterance.lang = 'hi-IN';
    hiUtterance.rate = 0.88;
    hiUtterance.pitch = 1.0;
    if (hiVoice) {
      hiUtterance.voice = hiVoice;
    }

    // 2. Second Utterance: ENGLISH
    const enUtterance = new SpeechSynthesisUtterance(englishText);
    enUtterance.lang = 'en-IN';
    enUtterance.rate = 0.90;
    enUtterance.pitch = 1.0;
    if (enVoice) {
      enUtterance.voice = enVoice;
    }

    // Sequence chaining: When Hindi finishes -> automatically play English
    hiUtterance.onend = () => {
      if (this.synth) {
        this.currentUtterance = enUtterance;
        this.synth.speak(enUtterance);
      }
    };

    hiUtterance.onerror = (err) => {
      console.warn('Hindi voice notice, proceeding to English audio:', err);
      if (this.synth) {
        this.currentUtterance = enUtterance;
        this.synth.speak(enUtterance);
      }
    };

    enUtterance.onend = () => {
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    enUtterance.onerror = () => {
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    this.currentUtterance = hiUtterance;
    this.synth.speak(hiUtterance);
  }

  /**
   * Stop any active audio speech.
   */
  public stop() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.currentUtterance = null;
  }

  /**
   * Check if speech synthesis is currently active.
   */
  public isSpeaking(): boolean {
    return !!(this.synth && this.synth.speaking);
  }
}

export const speechEngine = new SpeechEngine();
