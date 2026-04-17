import { MAX_INITIAL_VELOCITY } from "./physics";

export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private lastTickTime = 0;
  private bgmNodes: { osc: OscillatorNode[]; gain: GainNode; lfo?: OscillatorNode } | null = null;
  private bgmInterval: ReturnType<typeof setInterval> | null = null;

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return this.audioContext;
  }

  resume() {
    this.audioContext?.resume();
  }

  playTick(velocity: number) {
    const normalizedVelocity = Math.min(velocity / MAX_INITIAL_VELOCITY, 1);
    const interval = 700 - normalizedVelocity * 640;
    const now = Date.now();
    if (now - this.lastTickTime < interval) return;
    this.lastTickTime = now;

    try {
      const ctx = this.getContext();
      const t = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = "square";
      osc.frequency.setValueAtTime(900, t);
      osc.frequency.exponentialRampToValueAtTime(180, t + 0.04);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.25, t + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

      osc.start(t);
      osc.stop(t + 0.06);
    } catch {}
  }

  playLandingTick() {
    try {
      const ctx = this.getContext();
      const t = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = "triangle";
      osc.frequency.setValueAtTime(600, t);
      osc.frequency.exponentialRampToValueAtTime(150, t + 0.15);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.4, t + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

      osc.start(t);
      osc.stop(t + 0.2);
    } catch {}
  }

  // Casino/Vegas style BGM loop — cheerful ragtime-ish pattern
  startBGM() {
    this.stopBGM();
    try {
      const ctx = this.getContext();

      // Ragtime/casino jingle melody (note frequencies in Hz)
      // Cheerful major-key pattern: C E G C' G E C ... repeating
      const melody = [
        { f: 523.25, d: 0.15 }, // C5
        { f: 659.25, d: 0.15 }, // E5
        { f: 783.99, d: 0.15 }, // G5
        { f: 1046.5, d: 0.30 }, // C6
        { f: 783.99, d: 0.15 }, // G5
        { f: 659.25, d: 0.15 }, // E5
        { f: 523.25, d: 0.30 }, // C5
        { f: 587.33, d: 0.15 }, // D5
        { f: 698.46, d: 0.15 }, // F5
        { f: 880.00, d: 0.15 }, // A5
        { f: 1046.5, d: 0.30 }, // C6
        { f: 880.00, d: 0.15 }, // A5
        { f: 698.46, d: 0.15 }, // F5
        { f: 587.33, d: 0.45 }, // D5
      ];

      // Bass line (oom-pah)
      const bass = [
        { f: 130.81, d: 0.3 }, // C3
        { f: 196.00, d: 0.3 }, // G3
        { f: 130.81, d: 0.3 }, // C3
        { f: 196.00, d: 0.3 }, // G3
        { f: 146.83, d: 0.3 }, // D3
        { f: 220.00, d: 0.3 }, // A3
        { f: 146.83, d: 0.3 }, // D3
        { f: 220.00, d: 0.3 }, // A3
      ];

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0, ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.3);
      masterGain.connect(ctx.destination);

      const scheduleLoop = (startOffset: number) => {
        let t = ctx.currentTime + startOffset;

        // Schedule melody
        melody.forEach((note) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(note.f, t);
          gain.gain.setValueAtTime(0, t);
          gain.gain.linearRampToValueAtTime(0.5, t + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.001, t + note.d * 0.95);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(t);
          osc.stop(t + note.d);
          t += note.d;
        });

        // Schedule bass in parallel (start from same base time)
        let bt = ctx.currentTime + startOffset;
        bass.forEach((note) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "square";
          osc.frequency.setValueAtTime(note.f, bt);
          gain.gain.setValueAtTime(0, bt);
          gain.gain.linearRampToValueAtTime(0.15, bt + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.001, bt + note.d * 0.8);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(bt);
          osc.stop(bt + note.d);
          bt += note.d;
        });
      };

      // Schedule first loop immediately, then repeat via interval
      scheduleLoop(0);
      const melodyDuration = melody.reduce((sum, n) => sum + n.d, 0);
      const loopMs = melodyDuration * 1000;

      this.bgmInterval = setInterval(() => {
        scheduleLoop(0);
      }, loopMs);

      this.bgmNodes = { osc: [], gain: masterGain };
    } catch {}
  }

  stopBGM() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
    if (this.bgmNodes) {
      try {
        const ctx = this.getContext();
        const t = ctx.currentTime;
        this.bgmNodes.gain.gain.cancelScheduledValues(t);
        this.bgmNodes.gain.gain.setValueAtTime(this.bgmNodes.gain.gain.value, t);
        this.bgmNodes.gain.gain.linearRampToValueAtTime(0, t + 0.2);
        const toDisconnect = this.bgmNodes.gain;
        setTimeout(() => {
          try { toDisconnect.disconnect(); } catch {}
        }, 300);
      } catch {}
      this.bgmNodes = null;
    }
  }

  // Celebration fanfare — brass-style chord with triumphant rhythm
  playFanfare() {
    try {
      const ctx = this.getContext();
      const startT = ctx.currentTime;

      // Classic fanfare rhythm: da-da-da DAAAA (C5-C5-C5-E5-G5-C6 chord)
      // Build with sawtooth oscillators for brass-like timbre + filter

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.35, startT);
      masterGain.connect(ctx.destination);

      const playNote = (freqs: number[], startOffset: number, duration: number, vol = 1) => {
        const t = startT + startOffset;
        const noteGain = ctx.createGain();
        noteGain.gain.setValueAtTime(0, t);
        noteGain.gain.linearRampToValueAtTime(0.35 * vol, t + 0.02);
        noteGain.gain.setValueAtTime(0.3 * vol, t + duration - 0.1);
        noteGain.gain.exponentialRampToValueAtTime(0.001, t + duration);
        noteGain.connect(masterGain);

        freqs.forEach((f) => {
          const osc = ctx.createOscillator();
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(f, t);
          // Slight vibrato for realism
          osc.detune.setValueAtTime(-5, t);
          osc.detune.linearRampToValueAtTime(5, t + duration);
          osc.connect(noteGain);
          osc.start(t);
          osc.stop(t + duration);

          // Harmonic layer (triangle) for warmth
          const harm = ctx.createOscillator();
          harm.type = "triangle";
          harm.frequency.setValueAtTime(f * 2, t);
          const hg = ctx.createGain();
          hg.gain.setValueAtTime(0.15, t);
          harm.connect(hg);
          hg.connect(noteGain);
          harm.start(t);
          harm.stop(t + duration);
        });
      };

      // C major fanfare: short-short-short-LONG with rising chord
      playNote([523.25], 0.0, 0.18, 0.9);          // C5
      playNote([523.25], 0.2, 0.18, 0.9);          // C5
      playNote([523.25], 0.4, 0.18, 0.9);          // C5
      // Final triumphant chord: C-E-G-C
      playNote([523.25, 659.25, 783.99, 1046.5], 0.65, 1.4, 1.3);

      // Cymbal/crash white-noise burst on final chord
      const noiseDuration = 0.6;
      const bufferSize = ctx.sampleRate * noiseDuration;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const noiseData = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        noiseData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
      }
      const noiseSrc = ctx.createBufferSource();
      noiseSrc.buffer = noiseBuffer;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = "highpass";
      noiseFilter.frequency.value = 4000;
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.25, startT + 0.65);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, startT + 0.65 + noiseDuration);
      noiseSrc.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(masterGain);
      noiseSrc.start(startT + 0.65);
      noiseSrc.stop(startT + 0.65 + noiseDuration);
    } catch {}
  }
}
