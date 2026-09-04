/**
 * Audio Recorder for Wispr Flow Voice API
 * Records microphone input, downsamples to 16kHz mono WAV, and exports Base64 data.
 */

export interface RecordedAudioResult {
  blob: Blob;
  base64: string;
  durationSeconds: number;
}

class AudioRecorder {
  private mediaStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private recordedChunks: Float32Array[] = [];
  private sampleRate = 16000;
  private startTime = 0;
  private isRecording = false;

  public async start(): Promise<void> {
    if (this.isRecording) return;

    this.recordedChunks = [];
    this.mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        sampleRate: this.sampleRate,
        echoCancellation: true,
        noiseSuppression: true,
      },
    });

    const AudioContextClass =
      window.AudioContext || (window as any).webkitAudioContext;
    this.audioContext = new AudioContextClass();
    const sourceSampleRate = this.audioContext.sampleRate;

    this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);
    // Buffer size 4096 gives good responsiveness without stutter
    this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

    this.processor.onaudioprocess = (e) => {
      if (!this.isRecording) return;
      const inputData = e.inputBuffer.getChannelData(0);
      // Clone the slice of data
      const downsampled = this.downsampleBuffer(inputData, sourceSampleRate, this.sampleRate);
      this.recordedChunks.push(new Float32Array(downsampled));
    };

    this.sourceNode.connect(this.processor);
    this.processor.connect(this.audioContext.destination);

    this.isRecording = true;
    this.startTime = Date.now();
  }

  public async stop(): Promise<RecordedAudioResult> {
    if (!this.isRecording) {
      throw new Error('Recorder is not active');
    }

    this.isRecording = false;
    const durationSeconds = (Date.now() - this.startTime) / 1000;

    // Disconnect audio nodes
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }
    if (this.audioContext) {
      await this.audioContext.close();
      this.audioContext = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((t) => t.stop());
      this.mediaStream = null;
    }

    // Merge recorded 16kHz chunks
    const totalLength = this.recordedChunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const mergedSamples = new Float32Array(totalLength);
    let offset = 0;
    for (const chunk of this.recordedChunks) {
      mergedSamples.set(chunk, offset);
      offset += chunk.length;
    }

    // Encode to 16kHz mono 16-bit PCM WAV
    const wavBlob = this.encodeWAV(mergedSamples, this.sampleRate);
    const base64 = await this.blobToBase64(wavBlob);

    this.recordedChunks = [];

    return {
      blob: wavBlob,
      base64,
      durationSeconds,
    };
  }

  public get recording(): boolean {
    return this.isRecording;
  }

  private downsampleBuffer(
    buffer: Float32Array,
    inputRate: number,
    outputRate: number
  ): Float32Array {
    if (inputRate === outputRate) {
      return buffer;
    }
    const sampleRateRatio = inputRate / outputRate;
    const newLength = Math.round(buffer.length / sampleRateRatio);
    const result = new Float32Array(newLength);
    let offsetResult = 0;
    let offsetBuffer = 0;

    while (offsetResult < result.length) {
      const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
      let accum = 0;
      let count = 0;
      for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
        accum += buffer[i];
        count++;
      }
      result[offsetResult] = count > 0 ? accum / count : 0;
      offsetResult++;
      offsetBuffer = nextOffsetBuffer;
    }
    return result;
  }

  private encodeWAV(samples: Float32Array, sampleRate: number): Blob {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    /* RIFF identifier */
    this.writeString(view, 0, 'RIFF');
    /* file length */
    view.setUint32(4, 36 + samples.length * 2, true);
    /* RIFF type */
    this.writeString(view, 8, 'WAVE');
    /* format chunk identifier */
    this.writeString(view, 12, 'fmt ');
    /* format chunk length */
    view.setUint32(16, 16, true);
    /* sample format (raw PCM = 1) */
    view.setUint16(20, 1, true);
    /* channel count (mono = 1) */
    view.setUint16(22, 1, true);
    /* sample rate */
    view.setUint32(24, sampleRate, true);
    /* byte rate (sampleRate * blockAlign) */
    view.setUint32(28, sampleRate * 2, true);
    /* block align (channelCount * bytesPerSample) */
    view.setUint16(32, 2, true);
    /* bits per sample */
    view.setUint16(34, 16, true);
    /* data chunk identifier */
    this.writeString(view, 36, 'data');
    /* data chunk length */
    view.setUint32(40, samples.length * 2, true);

    // Write 16-bit PCM samples
    let index = 44;
    for (let i = 0; i < samples.length; i++) {
      const s = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(index, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      index += 2;
    }

    return new Blob([view], { type: 'audio/wav' });
  }

  private writeString(view: DataView, offset: number, string: string): void {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        // Strip data:audio/wav;base64,
        const base64 = dataUrl.split(',')[1] || '';
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

export const audioRecorder = new AudioRecorder();
