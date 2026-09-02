/**
 * Universal Speech & Audio Engine for AYUSH-Care Kiosk
 * 
 * Explaining Windows TTS vs Browser TTS:
 * On Windows OS, Chromium's Web Speech API directly uses Windows SAPI5 (Microsoft David Desktop - Male).
 * Because standard Windows does NOT install the Hindi voice pack, Windows SAPI5 cannot pronounce Devanagari Hindi
 * and only speaks English with the Windows male voice.
 * 
 * The Universal Solution:
 * We use the high-clarity Google Female Hindi Audio Stream for Hindi playback.
 * 1. Step 1: Plays authentic, clear Female Hindi Audio stream (Works on 100% of Windows Chrome/Brave/Edge).
 * 2. Step 2: Once Hindi speech ends -> Plays English speech.
 */

class SpeechEngine {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private voices: SpeechSynthesisVoice[] = [];

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

  public getEnglishVoice(): SpeechSynthesisVoice | undefined {
    const vList = this.voices.length > 0 ? this.voices : (this.synth?.getVoices() || []);
    return (
      vList.find(v => v.lang === 'en-IN' || v.lang === 'en_IN') ||
      vList.find(v => v.name.toLowerCase().includes('india') || v.name.toLowerCase().includes('heera') || v.name.toLowerCase().includes('neerja')) ||
      vList.find(v => v.lang === 'en-GB') ||
      vList.find(v => v.lang === 'en-US') ||
      vList.find(v => v.lang.startsWith('en'))
    );
  }

  /**
   * Play high-quality Female Hindi Audio Stream directly.
   */
  public playHindiAudio(text: string, onEnd?: () => void) {
    this.stop();

    try {
      const cleanText = text.trim();
      const encoded = encodeURIComponent(cleanText);
      const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=hi&client=tw-ob&q=${encoded}`;

      const audio = new Audio(audioUrl);
      this.currentAudio = audio;

      audio.onended = () => {
        this.currentAudio = null;
        if (onEnd) onEnd();
      };

      audio.onerror = (e) => {
        console.warn('Hindi audio stream error, falling back to synth:', e);
        this.currentAudio = null;
        this.speakNativeSynth(text, 'hi', onEnd);
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Autoplay prevented, fallback to synth:', err);
          this.speakNativeSynth(text, 'hi', onEnd);
        });
      }
    } catch (err) {
      console.warn('Audio stream error:', err);
      this.speakNativeSynth(text, 'hi', onEnd);
    }
  }

  /**
   * Native Speech Synthesis Fallback.
   */
  private speakNativeSynth(text: string, lang: 'hi' | 'en', onEnd?: () => void) {
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
    utterance.pitch = 1.0;

    if (lang === 'en') {
      const voice = this.getEnglishVoice();
      if (voice) {
        utterance.voice = voice;
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
   * Speak single utterance: If Hindi -> uses Female Hindi Audio stream; If English -> uses English voice.
   */
  public speak(text: string, lang: 'hi' | 'en' = 'hi', onEnd?: () => void) {
    this.stop();

    if (lang === 'hi') {
      this.playHindiAudio(text, onEnd);
    } else {
      this.speakNativeSynth(text, 'en', onEnd);
    }
  }

  /**
   * Sequential Bilingual Speech: Plays Female Hindi Audio FIRST -> then English Audio SECOND.
   */
  public speakBilingual(
    hindiText: string,
    englishText: string,
    onEnd?: () => void
  ) {
    this.stop();

    // Step 1: Play Female Hindi Audio Stream FIRST
    this.playHindiAudio(hindiText, () => {
      // Step 2: Once Hindi finishes -> Play English voice SECOND
      setTimeout(() => {
        this.speakNativeSynth(englishText, 'en', onEnd);
      }, 200);
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
