/**
 * Web Speech API Engine for AYUSH-Care Kiosk
 * Handles text-to-speech (TTS) with async voice loading, Chrome "Google हिन्दी" female voice detection,
 * and guaranteed sequential bilingual playback (Hindi FIRST -> English SECOND).
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

  public loadVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    const v = this.synth.getVoices();
    if (v.length > 0) {
      this.voices = v;
    }
    return this.voices;
  }

  public async ensureVoicesLoaded(): Promise<SpeechSynthesisVoice[]> {
    if (!this.synth) return [];
    let v = this.synth.getVoices();
    if (v && v.length > 0) {
      this.voices = v;
      return v;
    }

    return new Promise((resolve) => {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        v = this.synth?.getVoices() || [];
        if (v.length > 0 || attempts >= 20) {
          clearInterval(interval);
          this.voices = v;
          resolve(v);
        }
      }, 50);
    });
  }

  public getHindiVoice(): SpeechSynthesisVoice | undefined {
    const vList = this.voices.length > 0 ? this.voices : (this.synth?.getVoices() || []);
    return (
      // 1. Chrome built-in "Google हिन्दी" female voice
      vList.find(v => v.name.includes('Google') && (v.lang.includes('hi') || v.name.includes('हिन्दी') || v.name.includes('Hindi'))) ||
      // 2. Exact hi-IN / hi_IN
      vList.find(v => v.lang === 'hi-IN' || v.lang === 'hi_IN') ||
      vList.find(v => v.lang.toLowerCase().startsWith('hi')) ||
      // 3. Named Hindi voices (Microsoft Swara, Kalpana, Hemant)
      vList.find(v => v.name.toLowerCase().includes('hindi')) ||
      vList.find(v => v.name.toLowerCase().includes('swara')) ||
      vList.find(v => v.name.toLowerCase().includes('kalpana')) ||
      vList.find(v => v.name.toLowerCase().includes('hemant'))
    );
  }

  public getEnglishVoice(): SpeechSynthesisVoice | undefined {
    const vList = this.voices.length > 0 ? this.voices : (this.synth?.getVoices() || []);
    return (
      // 1. Indian English Accent (Google English India, Microsoft Heera / Neerja)
      vList.find(v => v.name.includes('Google') && v.lang.includes('en-IN')) ||
      vList.find(v => v.lang === 'en-IN' || v.lang === 'en_IN') ||
      vList.find(v => v.name.toLowerCase().includes('india') || v.name.toLowerCase().includes('heera') || v.name.toLowerCase().includes('neerja')) ||
      // 2. Standard English Fallbacks
      vList.find(v => v.lang === 'en-GB') ||
      vList.find(v => v.lang === 'en-US') ||
      vList.find(v => v.lang.startsWith('en'))
    );
  }

  /**
   * Speak in a single language (Used after user chooses language).
   */
  public async speak(text: string, lang: 'hi' | 'en' = 'hi', onEnd?: () => void) {
    if (!this.synth) {
      if (onEnd) onEnd();
      return;
    }

    await this.ensureVoicesLoaded();
    this.stop();

    const isHindi = lang === 'hi';
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = isHindi ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.88;
    utterance.pitch = 1.0;

    const voice = isHindi ? this.getHindiVoice() : this.getEnglishVoice();
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onend = () => {
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = (err) => {
      console.warn('Speech error:', err);
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    this.currentUtterance = utterance;

    // Chrome bug fix: slight timeout prevents speech cancellation
    setTimeout(() => {
      if (this.synth) {
        if (this.synth.paused) {
          this.synth.resume();
        }
        this.synth.speak(utterance);
      }
    }, 50);
  }

  /**
   * Sequential Bilingual Speech: Plays Hindi audio FIRST -> then English audio SECOND.
   */
  public async speakBilingual(
    hindiText: string,
    englishText: string,
    onEnd?: () => void
  ) {
    if (!this.synth) {
      if (onEnd) onEnd();
      return;
    }

    // Ensure Chrome has loaded Google हिन्दी voice
    await this.ensureVoicesLoaded();
    this.stop();

    const hiVoice = this.getHindiVoice();
    const enVoice = this.getEnglishVoice();

    // 1. Hindi Utterance (Plays 1st)
    const hiUtterance = new SpeechSynthesisUtterance(hindiText);
    hiUtterance.lang = 'hi-IN';
    hiUtterance.rate = 0.88;
    hiUtterance.pitch = 1.0;
    if (hiVoice) {
      hiUtterance.voice = hiVoice;
    }

    // 2. English Utterance (Plays 2nd)
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
        setTimeout(() => {
          if (this.synth) {
            this.synth.speak(enUtterance);
          }
        }, 150);
      }
    };

    hiUtterance.onerror = (err) => {
      console.warn('Hindi utterance error/skipped, proceeding to English:', err);
      if (this.synth) {
        this.currentUtterance = enUtterance;
        setTimeout(() => {
          if (this.synth) {
            this.synth.speak(enUtterance);
          }
        }, 150);
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

    // Chrome bug fix: slight timeout prevents cancel collision
    setTimeout(() => {
      if (this.synth) {
        if (this.synth.paused) {
          this.synth.resume();
        }
        this.synth.speak(hiUtterance);
      }
    }, 50);
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
