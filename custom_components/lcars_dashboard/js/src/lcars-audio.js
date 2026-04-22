/**
 * LCARS Audio Grammar — Synthesized LCARS interface sounds
 *
 * All sounds are generated at runtime via Web Audio API OscillatorNode.
 * Zero external audio files. Zero copyright concerns.
 * See specs/LCARS-AUDIO-SPEC.md for full specification.
 *
 * Usage:
 *   import { lcarsAudio } from './lcars-audio.js';
 *   lcarsAudio.play('acknowledge');
 *   lcarsAudio.toggle();  // toggle mute
 */

const STORAGE_KEY = 'lcars-audio-muted';

/** @type {AudioContext|null} */
let _ctx = null;

/** Lazy-init AudioContext (must be called from a user gesture) */
function _getContext() {
  if (!_ctx) {
    _ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (_ctx.state === 'suspended') {
    _ctx.resume();
  }
  return _ctx;
}

/**
 * Play a single tone burst.
 * @param {AudioContext} ctx
 * @param {string} waveform - 'sine'|'square'|'sawtooth'|'triangle'
 * @param {number} freq - Frequency in Hz
 * @param {number} startTime - When to start (ctx.currentTime-relative)
 * @param {number} duration - Duration in seconds
 * @param {number} gain - Volume 0.0–1.0
 * @returns {number} endTime
 */
function _tone(ctx, waveform, freq, startTime, duration, gain) {
  const osc = ctx.createOscillator();
  const vol = ctx.createGain();
  osc.type = waveform;
  osc.frequency.setValueAtTime(freq, startTime);
  // Envelope: quick attack, sustain, quick decay
  const attack = 0.005;
  const decay = Math.min(0.02, duration * 0.3);
  vol.gain.setValueAtTime(0, startTime);
  vol.gain.linearRampToValueAtTime(gain, startTime + attack);
  vol.gain.setValueAtTime(gain, startTime + duration - decay);
  vol.gain.linearRampToValueAtTime(0, startTime + duration);
  osc.connect(vol);
  vol.connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration);
  return startTime + duration;
}

/**
 * Play a frequency sweep (linear ramp).
 * @param {AudioContext} ctx
 * @param {string} waveform
 * @param {number} freqStart
 * @param {number} freqEnd
 * @param {number} startTime
 * @param {number} duration
 * @param {number} gain
 * @returns {number} endTime
 */
function _sweep(ctx, waveform, freqStart, freqEnd, startTime, duration, gain) {
  const osc = ctx.createOscillator();
  const vol = ctx.createGain();
  osc.type = waveform;
  osc.frequency.setValueAtTime(freqStart, startTime);
  osc.frequency.linearRampToValueAtTime(freqEnd, startTime + duration);
  const attack = 0.005;
  const decay = Math.min(0.02, duration * 0.3);
  vol.gain.setValueAtTime(0, startTime);
  vol.gain.linearRampToValueAtTime(gain, startTime + attack);
  vol.gain.setValueAtTime(gain, startTime + duration - decay);
  vol.gain.linearRampToValueAtTime(0, startTime + duration);
  osc.connect(vol);
  vol.connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration);
  return startTime + duration;
}

/* ─── Sound Definitions ─── */

const SOUNDS = {
  /** Button press acknowledgment — quick sine chirp at 880Hz */
  acknowledge(ctx) {
    const t = ctx.currentTime;
    _tone(ctx, 'sine', 880, t, 0.06, 0.15);
  },

  /** Navigation/view change — two-tone ascending (440→660Hz) */
  navAcknowledge(ctx) {
    const t = ctx.currentTime;
    _tone(ctx, 'sine', 440, t, 0.06, 0.12);
    _tone(ctx, 'sine', 660, t + 0.08, 0.06, 0.12);
  },

  /** Action denied — descending triangle tones (660→330Hz) */
  negativeAcknowledge(ctx) {
    const t = ctx.currentTime;
    _tone(ctx, 'triangle', 660, t, 0.08, 0.12);
    _tone(ctx, 'triangle', 330, t + 0.10, 0.10, 0.12);
  },

  /** Warning — triple sawtooth pulse at 880Hz */
  alert(ctx) {
    const t = ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      _tone(ctx, 'sawtooth', 880, t + i * 0.10, 0.06, 0.10);
    }
  },

  /** Critical system alert — alternating 440/880Hz square pulses */
  criticalAlert(ctx) {
    const t = ctx.currentTime;
    for (let i = 0; i < 6; i++) {
      const freq = i % 2 === 0 ? 440 : 880;
      _tone(ctx, 'square', freq, t + i * 0.15, 0.15, 0.15);
    }
  },

  /** Dashboard ready — ascending sine triad (330→440→660Hz) */
  ready(ctx) {
    const t = ctx.currentTime;
    _tone(ctx, 'sine', 330, t, 0.08, 0.10);
    _tone(ctx, 'sine', 440, t + 0.11, 0.08, 0.10);
    _tone(ctx, 'sine', 660, t + 0.22, 0.12, 0.10);
  },

  /** State toggle — quick ascending sweep (550→770Hz) */
  toggle(ctx) {
    const t = ctx.currentTime;
    _sweep(ctx, 'sine', 550, 770, t, 0.08, 0.12);
  },
};

/* ─── Reduced Motion Check ─── */

function _prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Sounds that are always allowed even with reduced motion */
const CRITICAL_SOUNDS = new Set(['alert', 'criticalAlert']);

/* ─── Public API ─── */

export const lcarsAudio = {
  /** @returns {boolean} */
  get isMuted() {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  },

  mute() {
    try { localStorage.setItem(STORAGE_KEY, 'true'); } catch { /* noop */ }
  },

  unmute() {
    try { localStorage.setItem(STORAGE_KEY, 'false'); } catch { /* noop */ }
  },

  toggle() {
    if (this.isMuted) {
      this.unmute();
      this.play('toggle');
    } else {
      this.mute();
    }
    return !this.isMuted;
  },

  /**
   * Play a named LCARS sound.
   * No-op if muted, if sound name is invalid, or if browser blocks audio.
   * @param {string} name - One of: acknowledge, navAcknowledge, negativeAcknowledge, alert, criticalAlert, ready, toggle
   */
  play(name) {
    if (this.isMuted) return;
    if (_prefersReducedMotion() && !CRITICAL_SOUNDS.has(name)) return;
    const fn = SOUNDS[name];
    if (!fn) return;
    try {
      const ctx = _getContext();
      fn(ctx);
    } catch {
      // Silently fail — browser may block audio
    }
  },
};
