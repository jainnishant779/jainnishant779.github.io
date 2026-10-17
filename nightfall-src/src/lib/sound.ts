/**
 * Web Audio Sound Synthesizer for Project Nightfall
 * Zero external audio dependencies — 100% synthesized procedurally.
 */

class SoundSystem {
  private ctx: AudioContext | null = null;
  private ambienceGain: GainNode | null = null;
  private ambienceOsc1: OscillatorNode | null = null;
  private ambienceOsc2: OscillatorNode | null = null;
  private ambienceNoise: AudioBufferSourceNode | null = null;
  private ambienceLfo: OscillatorNode | null = null;
  private isAmbiencePlaying = false;

  private lastBeepTime = 0;
  private lastClunkTime = 0;
  private lastHissTime = 0;
  private lastFootstepTime = 0;
  private lastUiClickTime = 0;
  private lastKeyTime = 0;

  /**
   * Lazily initialize and resume the Web Audio Context
   */
  public initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.ctx) {
        const AudioCtxClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtxClass) {
          this.ctx = new AudioCtxClass();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    } catch {
      // AudioContext initialization prevented or unsupported
    }
    return this.ctx;
  }

  /**
   * Start continuous subterranean cavern ambience at volume 0.3.
   * Only plays after explicit user gesture.
   */
  public startAmbience(): void {
    if (this.isAmbiencePlaying) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const t = ctx.currentTime;

      // Master ambience gain clamped at 0.3
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, t);
      masterGain.gain.exponentialRampToValueAtTime(0.3, t + 1.5);
      masterGain.connect(ctx.destination);
      this.ambienceGain = masterGain;

      // 1. Subterranean Low Drone: Dual detuned sine oscillators (54Hz & 55.4Hz)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const droneGain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(54, t);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(55.4, t);

      droneGain.gain.setValueAtTime(0.12, t);

      osc1.connect(droneGain);
      osc2.connect(droneGain);
      droneGain.connect(masterGain);

      osc1.start(t);
      osc2.start(t);
      this.ambienceOsc1 = osc1;
      this.ambienceOsc2 = osc2;

      // 2. Cavern Atmospheric Air Resonance (Filtered Noise with slow LFO breath)
      const bufferSize = ctx.sampleRate * 4;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      let lastVal = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Brown noise filter for deep airy tone
        lastVal = (lastVal + 0.02 * white) / 1.02;
        data[i] = lastVal * 2.5;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(140, t);
      bandpass.Q.setValueAtTime(2.0, t);

      // Slow LFO to modulate cavern air currents (0.08 Hz)
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(0.08, t);
      lfoGain.gain.setValueAtTime(35, t);
      lfo.connect(lfoGain);
      lfoGain.connect(bandpass.frequency);

      const airGain = ctx.createGain();
      airGain.gain.setValueAtTime(0.18, t);

      noiseSource.connect(bandpass);
      bandpass.connect(airGain);
      airGain.connect(masterGain);

      lfo.start(t);
      noiseSource.start(t);

      this.ambienceNoise = noiseSource;
      this.ambienceLfo = lfo;
      this.isAmbiencePlaying = true;
    } catch {
      // Audio autoplay restriction
    }
  }

  /**
   * Gracefully fade out and stop continuous ambience
   */
  public stopAmbience(): void {
    if (!this.isAmbiencePlaying || !this.ctx || !this.ambienceGain) {
      this.isAmbiencePlaying = false;
      return;
    }

    try {
      const t = this.ctx.currentTime;
      this.ambienceGain.gain.cancelScheduledValues(t);
      this.ambienceGain.gain.setValueAtTime(this.ambienceGain.gain.value, t);
      this.ambienceGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);

      setTimeout(() => {
        try {
          this.ambienceOsc1?.stop();
          this.ambienceOsc2?.stop();
          this.ambienceNoise?.stop();
          this.ambienceLfo?.stop();
          this.ambienceGain?.disconnect();
        } catch {
          // Cleaned up
        }
        this.ambienceOsc1 = null;
        this.ambienceOsc2 = null;
        this.ambienceNoise = null;
        this.ambienceLfo = null;
        this.ambienceGain = null;
        this.isAmbiencePlaying = false;
      }, 850);
    } catch {
      this.isAmbiencePlaying = false;
    }
  }

  /**
   * Footstep audio for Free Explore locomotion (soft muffled mechanical boot tap)
   */
  public playFootstep(): void {
    const now = performance.now();
    if (now - this.lastFootstepTime < 320) return;
    this.lastFootstepTime = now;

    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(80, t);
      osc.frequency.exponentialRampToValueAtTime(25, t + 0.07);

      gain.gain.setValueAtTime(0.06, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.08);
    } catch {
      // Ignore
    }
  }

  /**
   * Crisp UI interaction click tone
   */
  public playUiClick(): void {
    const now = performance.now();
    if (now - this.lastUiClickTime < 80) return;
    this.lastUiClickTime = now;

    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(920, t);
      osc.frequency.exponentialRampToValueAtTime(460, t + 0.04);

      gain.gain.setValueAtTime(0.05, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.04);
    } catch {
      // Ignore
    }
  }

  /**
   * Cybernetic mechanical keyboard typing tick for terminal / input
   */
  public playTerminalKey(): void {
    const now = performance.now();
    if (now - this.lastKeyTime < 40) return;
    this.lastKeyTime = now;

    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const freq = 1200 + Math.random() * 400;
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.02, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.025);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.025);
    } catch {
      // Ignore
    }
  }

  /**
   * Cathode tube rising hum / workstation boot activation
   */
  public playBootHum(): void {
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(65, t);
      osc.frequency.exponentialRampToValueAtTime(195, t + 0.6);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, t);
      filter.frequency.exponentialRampToValueAtTime(1200, t + 0.6);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.09, t + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.7);
    } catch {
      // Ignore
    }
  }

  /**
   * Electronic access panel confirmation chime (timeline ~0.05)
   */
  public playAccessBeep(): void {
    const now = performance.now();
    if (now - this.lastBeepTime < 400) return;
    this.lastBeepTime = now;

    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1760, t); // A6
      osc.frequency.exponentialRampToValueAtTime(2349, t + 0.08); // D7

      gain.gain.setValueAtTime(0.06, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.12);
    } catch {
      // Silently ignore audio playback restrictions
    }
  }

  /**
   * Heavy mechanical lock disengage / deadbolt clunk (timeline ~0.15)
   */
  public playMechanicalClunk(): void {
    const now = performance.now();
    if (now - this.lastClunkTime < 600) return;
    this.lastClunkTime = now;

    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const t = ctx.currentTime;

      // Low resonant thud (frequency pitch sweep)
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(130, t);
      osc.frequency.exponentialRampToValueAtTime(32, t + 0.28);

      oscGain.gain.setValueAtTime(0.25, t);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.3);

      // Metal clink / noise transient
      const bufferSize = Math.floor(ctx.sampleRate * 0.06);
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.015));
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1100, t);
      filter.Q.setValueAtTime(2.5, t);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.18, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

      noiseSource.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      noiseSource.start(t);
    } catch {
      // Silently ignore audio playback restrictions
    }
  }

  /**
   * High-pressure pneumatic seal release / hydraulic hiss (timeline ~0.50)
   */
  public playPneumaticHiss(): void {
    const now = performance.now();
    if (now - this.lastHissTime < 1000) return;
    this.lastHissTime = now;

    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const duration = 0.7;
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const source = ctx.createBufferSource();
      source.buffer = noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3400, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + duration);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      source.start();
      source.stop(ctx.currentTime + duration);
    } catch {
      // Silently ignore audio playback restrictions
    }
  }
}

export const sound = new SoundSystem();
