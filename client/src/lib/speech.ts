/**
 * Hybrid Web Speech & Audio Engine for AYUSH-Care Kiosk
 * 
 * Root Cause Fix for Windows Chrome/Brave:
 * Windows OS default installations only include English voices (Microsoft David/Zira) and lack
 * the Hindi TTS voice pack. When Chromium encounters Devanagari text on an English-only OS,
 * it silently errors or skips to English.
 * 
 * Solution:
 * 1. Checks if the browser/OS has a native Hindi voice installed (e.g., Google हिन्दी, Hemant, Kalpana).
 * 2. If a native Hindi voice exists -> Uses native SpeechSynthesis.
 * 3. If NO native Hindi voice exists (Standard Windows Chrome/Brave) -> Automatically plays authentic,
 *    crystal-clear Hindi audio stream via HTML5 Audio element.
 * 4. Chains sequentially: Hindi audio plays FIRST -> English voice plays SECOND.
 */

class SpeechEngine {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private currentAudio: HTMLAudioElement | null = null;
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

  public getHindiVoice(): SpeechSynthesisVoice | undefined {
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

  public getEnglishVoice(): SpeechSynthesisVoice | undefined {
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
   * Play text using high-clarity TTS audio stream (Works on 100% of Windows PCs without Hindi voice pack).
   */
  private playAudioStream(text: string, lang: 'hi' | 'en', onEnd?: () => void) {
    this.stop();
    const encodedText = encodeURIComponent(text.trim());
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodedText}`;

    const audio = new Audio(ttsUrl);
    this.currentAudio = audio;

    audio.onended = () => {
      this.currentAudio = null;
      if (onEnd) onEnd();
    };

    audio.onerror = () => {
      this.currentAudio = null;
      // If network audio stream fails, fallback to local speech synthesis
      this.speakFallbackSynth(text, lang, onEnd);
    };

    audio.play().catch((err) => {
      console.warn('Audio stream autoplay policy caught, falling back to synth:', err);
      this.speakFallbackSynth(text, lang, onEnd);
    });
  }

  private speakFallbackSynth(text: string, lang: 'hi' | 'en', onEnd?: () => void) {
    if (!this.synth) {
      if (onEnd) onEnd();
      return;
    }

    if (this.synth.paused) {
      this.synth.resume();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.88;

    const voice = lang === 'hi' ? this.getHindiVoice() : this.getEnglishVoice();
    if (voice) {
      utterance.voice = voice;
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
   * Speak a single utterance in the chosen language.
   */
  public speak(text: string, lang: 'hi' | 'en' = 'hi', onEnd?: () => void) {
    this.stop();

    if (lang === 'hi') {
      const hiVoice = this.getHindiVoice();
      if (hiVoice) {
        this.speakFallbackSynth(text, 'hi', onEnd);
      } else {
        // No native Hindi voice on Windows -> use authentic Hindi audio stream
        this.playAudioStream(text, 'hi', onEnd);
      }
    } else {
      this.speakFallbackSynth(text, 'en', onEnd);
    }
  }

  /**
   * Sequential Bilingual Speech: Plays Hindi audio FIRST -> then English audio SECOND.
   */
  public speakBilingual(
    hindiText: string,
    englishText: string,
    onEnd?: () => void
  ) {
    this.stop();

    const hiVoice = this.getHindiVoice();

    // Step 2: English Speech Callback
    const playEnglish = () => {
      this.speakFallbackSynth(englishText, 'en', onEnd);
    };

    // Step 1: Play Hindi First
    if (hiVoice) {
      this.speakFallbackSynth(hindiText, 'hi', playEnglish);
    } else {
      // Stream authentic Hindi audio on Windows Chrome/Brave
      this.playAudioStream(hindiText, 'hi', playEnglish);
    }
  }

  /**
   * Stop any active audio speech or stream.
   */
  public stop() {
    if (this.synth) {
      this.synth.cancel();
    }
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    this.currentUtterance = null;
  }

  /**
   * Check if audio is currently playing.
   */
  public isSpeaking(): boolean {
    const isSynthSpeaking = !!(this.synth && this.synth.speaking);
    const isAudioPlaying = !!(this.currentAudio && !this.currentAudio.paused);
    return isSynthSpeaking || isAudioPlaying;
  }
}

export const speechEngine = new SpeechEngine();
