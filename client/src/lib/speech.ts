/**
 * Web Speech API Engine for AYUSH-Care Kiosk
 * Handles text-to-speech (TTS) with voice preloading, asynchronous voice detection, and sequential bilingual playback.
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

  private loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
  }

  private getBestVoice(lang: 'hi' | 'en'): SpeechSynthesisVoice | undefined {
    if (this.voices.length === 0) {
      this.loadVoices();
    }

    if (lang === 'hi') {
      // Look for explicit Hindi voices in browser / OS
      return (
        this.voices.find(v => v.lang === 'hi-IN' || v.lang === 'hi_IN') ||
        this.voices.find(v => v.lang.startsWith('hi')) ||
        this.voices.find(v => v.name.toLowerCase().includes('hindi')) ||
        this.voices.find(v => v.name.toLowerCase().includes('hemant')) ||
        this.voices.find(v => v.name.toLowerCase().includes('swara'))
      );
    } else {
      // English voice
      return (
        this.voices.find(v => v.lang === 'en-IN') ||
        this.voices.find(v => v.lang === 'en-GB') ||
        this.voices.find(v => v.lang === 'en-US') ||
        this.voices.find(v => v.lang.startsWith('en'))
      );
    }
  }

  /**
   * Speak a single text utterance in the given language.
   */
  public speak(text: string, lang: 'hi' | 'en' = 'hi', onEnd?: () => void) {
    if (!this.synth) {
      if (onEnd) onEnd();
      return;
    }

    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.88; // Slightly slower, highly intelligible pace for patients
    utterance.pitch = 1.0;

    const matchedVoice = this.getBestVoice(lang);
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onend = () => {
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  /**
   * Speak bilingually: Plays Hindi audio FIRST, then immediately plays English audio SECOND.
   */
  public speakBilingual(hindiText: string, englishText: string, onEnd?: () => void) {
    if (!this.synth) {
      if (onEnd) onEnd();
      return;
    }

    this.stop();

    // 1. Prepare Hindi Utterance
    const hiUtterance = new SpeechSynthesisUtterance(hindiText);
    hiUtterance.lang = 'hi-IN';
    hiUtterance.rate = 0.88;
    hiUtterance.pitch = 1.0;
    const hiVoice = this.getBestVoice('hi');
    if (hiVoice) {
      hiUtterance.voice = hiVoice;
    }

    // 2. Prepare English Utterance
    const enUtterance = new SpeechSynthesisUtterance(englishText);
    enUtterance.lang = 'en-IN';
    enUtterance.rate = 0.90;
    enUtterance.pitch = 1.0;
    const enVoice = this.getBestVoice('en');
    if (enVoice) {
      enUtterance.voice = enVoice;
    }

    // Sequence chaining: When Hindi finishes -> play English immediately
    hiUtterance.onend = () => {
      this.currentUtterance = enUtterance;
      this.synth?.speak(enUtterance);
    };

    hiUtterance.onerror = () => {
      // In case OS lacks Hindi voice, gracefully continue to English
      this.currentUtterance = enUtterance;
      this.synth?.speak(enUtterance);
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
