const MUTE_KEY = 'daemonwave.muted';
const MASTER_VOLUME = 0.25;

/**
 * Procedural sound effects (Web Audio API). No audio files needed.
 * Browsers only allow audio after a user gesture, so call unlock() from an input handler.
 */
export class Sfx {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.noiseBuffer = null;
    this.muted = this.#loadMuted();
  }

  unlock() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.master = this.ctx.createGain();
      this.master.gain.value = MASTER_VOLUME;
      this.master.connect(this.ctx.destination);
      this.noiseBuffer = this.#createNoiseBuffer();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  toggleMute() {
    this.muted = !this.muted;
    this.#saveMuted();
  }

  start() {
    this.#arpeggio([330, 494, 659], { type: 'square', step: 0.07, duration: 0.12 });
  }

  shoot() {
    this.#tone({ type: 'square', from: 880, to: 220, duration: 0.1, volume: 0.35 });
  }

  enemyDestroyed() {
    this.#tone({ type: 'sawtooth', from: 320, to: 60, duration: 0.18, volume: 0.5 });
    this.#noise({ duration: 0.12, volume: 0.4 });
  }

  playerHit() {
    this.#tone({ type: 'sawtooth', from: 220, to: 35, duration: 0.5, volume: 0.6 });
    this.#noise({ duration: 0.4, volume: 0.6 });
  }

  waveClear() {
    this.#arpeggio([523, 659, 784, 1047], { type: 'square', step: 0.09, duration: 0.14 });
  }

  gameOver() {
    this.#arpeggio([392, 330, 262, 196], { type: 'sawtooth', step: 0.2, duration: 0.3 });
  }

  #isReady() {
    return Boolean(this.ctx) && !this.muted;
  }

  #arpeggio(notes, { type, step, duration }) {
    notes.forEach((freq, i) => {
      this.#tone({ type, from: freq, duration, volume: 0.4, delay: i * step });
    });
  }

  #tone({ type, from, to = from, duration, volume = 0.5, delay = 0 }) {
    if (!this.#isReady()) return;
    const t = this.ctx.currentTime + delay;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(from, t);
    osc.frequency.exponentialRampToValueAtTime(Math.max(to, 1), t + duration);
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(gain);
    gain.connect(this.master);
    osc.start(t);
    osc.stop(t + duration);
  }

  #noise({ duration, volume = 0.5 }) {
    if (!this.#isReady()) return;
    const t = this.ctx.currentTime;

    const source = this.ctx.createBufferSource();
    const gain = this.ctx.createGain();
    source.buffer = this.noiseBuffer;
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    source.connect(gain);
    gain.connect(this.master);
    source.start(t);
    source.stop(t + duration);
  }

  #createNoiseBuffer() {
    const length = this.ctx.sampleRate; // 1 second is plenty for short bursts
    const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  #loadMuted() {
    try {
      return localStorage.getItem(MUTE_KEY) === '1';
    } catch {
      return false;
    }
  }

  #saveMuted() {
    try {
      localStorage.setItem(MUTE_KEY, this.muted ? '1' : '0');
    } catch {
      // Storage can be unavailable; the setting just won't persist.
    }
  }
}
