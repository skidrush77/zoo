import { MAX_INITIAL_VELOCITY } from "./physics";

export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private lastTickTime = 0;

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
    // interval in ms: fast spin = 60ms, slow spin = 700ms
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
    } catch {
      // AudioContext not available or suspended
    }
  }

  // Final landing tick — slightly louder
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
    } catch {
      // AudioContext not available
    }
  }
}
