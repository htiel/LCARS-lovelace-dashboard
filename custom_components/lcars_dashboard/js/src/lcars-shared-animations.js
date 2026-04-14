/**
 * lcars-shared-animations.js
 *
 * Shared CSS keyframes and reduced-motion overrides for all LCARS panels.
 * Extracted per Data R-1 / v4.13.0 DRY recovery plan.
 * Import into panel components via LitElement static styles array.
 *
 * Performance budget: ≤6 concurrent CSS animations per panel,
 * ≤2 box-shadow keyframe definitions per panel.
 * All looping animations gated behind prefers-reduced-motion.
 */
import { css } from 'lit-element';

// ─── Shared Keyframes ───────────────────────────────────────────────────────

export const sharedKeyframes = css`
  /* ── Viewscreen power-on scanline (Device §7.10) ── */
  @keyframes lcars-scanline {
    from { transform: translateY(-100%); opacity: 0.6; }
    to   { transform: translateY(100%);  opacity: 0; }
  }

  /* ── Frame breathing pulse — ambient opacity cycle (Device §7.6) ── */
  @keyframes lcars-frame-breathe {
    0%, 100% { opacity: 0.88; }
    50%      { opacity: 1; }
  }

  /* ── Button press ripple flash (Device §7.9) ── */
  @keyframes lcars-button-flash {
    from { transform: scale(0.5); opacity: 0.8; }
    to   { transform: scale(2.5); opacity: 0; }
  }

  /* ── Data pip sweep — single bright pip animation (Device §7.7) ── */
  @keyframes lcars-pip-sweep {
    0%   { left: 0; opacity: 0; }
    10%  { opacity: 1; }
    90%  { opacity: 1; }
    100% { left: calc(100% - 6px); opacity: 0; }
  }

  /* ── Generic distress/fault pulse (parametric via CSS vars) ── */
  @keyframes lcars-distress-pulse {
    0%, 100% { border-color: var(--pulse-color-a, var(--lcars-tomato)); }
    50%      { border-color: var(--pulse-color-b, rgba(255, 85, 85, 0.3)); }
  }

  /* ── Value update flash (pill badges, sensor values) ── */
  @keyframes lcars-value-flash {
    0%   { background-color: var(--lcars-gold); }
    100% { background-color: var(--flash-return-color, var(--lcars-black)); }
  }

  /* ── Confirmation scale bounce ── */
  @keyframes lcars-confirm-scale {
    0%   { transform: scale(1); }
    50%  { transform: scale(1.05); }
    100% { transform: scale(1); }
  }

  /* ── Setpoint confirmation flash — scale + glow (Climate §13 enh.3) ── */
  @keyframes lcars-setpoint-confirm {
    0%   { transform: scale(1); text-shadow: none; }
    50%  { transform: scale(1.05); text-shadow: 0 0 8px var(--lcars-gold); }
    100% { transform: scale(1); text-shadow: none; }
  }
`;

// ─── Shared Reduced-Motion Overrides ────────────────────────────────────────

export const sharedReducedMotion = css`
  @media (prefers-reduced-motion: reduce) {
    /* Ambient loops — disabled entirely */
    .lcars-device-panel,
    .lcars-audio-waveform .bar,
    .lcars-water-viewscreen::after,
    .lcars-pump-spinner,
    .lcars-atmos-particle,
    .lcars-rain-badge {
      animation: none !important;
    }

    /* Confirmations — halved duration, still play */
    .lcars-button:active::after,
    .lcars-setpoint-confirm,
    .lcars-zone-complete,
    .lcars-pip-flash,
    .lcars-value-flash {
      animation-duration: calc(var(--lcars-anim-confirm, 400ms) / 2) !important;
    }

    /* State transitions — instant */
    .device-panel-media,
    .lcars-mode-indicator,
    .lcars-heat-status-bar,
    .wind-needle {
      transition-duration: 0.01ms !important;
    }

    /* Static glow fallbacks — glows encode state, keep visible */
    .lcars-device-panel[data-state="triggered"] {
      border-color: var(--lcars-tomato);
      border-width: 6px 3px 6px 6px;
    }
  }
`;

// ─── Combined export for LitElement static styles ───────────────────────────

export function getSharedAnimationStyles() {
  return [sharedKeyframes, sharedReducedMotion];
}
