/**
 * lcars-service-utils.js
 *
 * Service call utilities: value clamping and rate limiting.
 * Used by climate (setpoints), alarm (PIN), pool (temp), irrigation (zones).
 */

/**
 * Clamp a setpoint value to safe bounds.
 * Uses entity attributes (min_temp/max_temp) with absolute fallbacks.
 * @param {number} value - Desired setpoint
 * @param {Object} attrs - Entity attributes { min_temp, max_temp }
 * @param {Object} [absoluteBounds] - Absolute safety bounds
 * @param {number} [absoluteBounds.min=35] - Absolute minimum (°F)
 * @param {number} [absoluteBounds.max=95] - Absolute maximum (°F)
 * @returns {number} Clamped value
 */
export function clampSetpoint(value, attrs = {}, absoluteBounds = {}) {
  const absMin = absoluteBounds.min ?? 35;
  const absMax = absoluteBounds.max ?? 95;
  const entityMin = attrs.min_temp != null ? Number(attrs.min_temp) : absMin;
  const entityMax = attrs.max_temp != null ? Number(attrs.max_temp) : absMax;
  // Use tighter of entity vs absolute bounds
  const lo = Math.max(absMin, entityMin);
  const hi = Math.min(absMax, entityMax);
  return Math.min(hi, Math.max(lo, Number(value) || lo));
}

/**
 * Clamp a generic numeric value to bounds.
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clampValue(value, min, max) {
  return Math.min(max, Math.max(min, Number(value) || min));
}

/**
 * Create a rate limiter for service calls.
 * Token-bucket pattern: allows `maxCalls` within `windowMs`, then blocks
 * until the window resets. Returns { allow(), remaining, resetTime }.
 *
 * @param {number} maxCalls - Maximum calls per window (e.g. 3 for alarm PIN)
 * @param {number} windowMs - Window duration in ms (e.g. 60000 for 1 minute)
 * @returns {{ allow: () => boolean, remaining: () => number, resetTime: () => number, reset: () => void }}
 */
export function createRateLimiter(maxCalls, windowMs) {
  const timestamps = [];

  function prune() {
    const cutoff = Date.now() - windowMs;
    while (timestamps.length > 0 && timestamps[0] < cutoff) {
      timestamps.shift();
    }
  }

  return {
    /** Check if a call is allowed, and consume a token if so. */
    allow() {
      prune();
      if (timestamps.length >= maxCalls) return false;
      timestamps.push(Date.now());
      return true;
    },
    /** How many calls remain in the current window. */
    remaining() {
      prune();
      return Math.max(0, maxCalls - timestamps.length);
    },
    /** Epoch ms when next token becomes available (0 if already available). */
    resetTime() {
      prune();
      if (timestamps.length < maxCalls) return 0;
      return timestamps[0] + windowMs;
    },
    /** Force reset (e.g. after successful alarm disarm). */
    reset() {
      timestamps.length = 0;
    },
  };
}

/**
 * Create a simple debouncer for setpoint adjustments.
 * Collapses rapid changes (e.g. holding +/- button) into a single service call.
 * @param {Function} fn - Function to debounce
 * @param {number} delayMs - Delay in ms (default 1500 for climate setpoints)
 * @returns {{ call: (...args) => void, cancel: () => void }}
 */
export function createDebouncer(fn, delayMs = 1500) {
  let timer = null;
  return {
    call(...args) {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => { timer = null; fn(...args); }, delayMs);
    },
    cancel() {
      if (timer) { clearTimeout(timer); timer = null; }
    },
  };
}
