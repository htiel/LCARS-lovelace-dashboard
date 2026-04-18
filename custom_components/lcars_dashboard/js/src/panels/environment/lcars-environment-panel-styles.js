/**
 * lcars-environment-panel-styles.js
 *
 * CSS module for <lcars-environment-panel>.
 * Atmoscrubber cylinder, sparklines, sensor readouts, fan controls.
 *
 * v4.17.0 Panel Extraction Architecture (4X-4)
 */
import { css } from 'lit-element';

export const environmentPanelStyles = css`
  :host {
    display: block;
  }

  /* ═══ Device Panel Frame (shared base) ═══ */
  .lcars-device-panel {
    --panel-frame-color: var(--lcars-butterscotch);
    display: grid;
    gap: var(--lcars-gap);
    width: 100%;
    max-width: 42rem;
    border-left: 4px solid var(--panel-frame-color);
    border-bottom: 4px solid var(--panel-frame-color);
    border-top: 2px solid var(--panel-frame-color);
    border-right: 2px solid var(--panel-frame-color);
    border-radius: 0.75rem 0.25rem 0.25rem 0.75rem;
    padding: var(--lcars-gap);
    background: var(--lcars-black);
    position: relative;
  }
  .lcars-device-panel::before {
    content: '';
    position: absolute;
    top: -2px; left: -4px;
    width: 1.5rem; height: 1.5rem;
    border-top: 4px solid var(--panel-frame-color);
    border-left: 4px solid var(--panel-frame-color);
    border-radius: 0.75rem 0 0 0;
    pointer-events: none;
  }
  .lcars-device-panel::after {
    content: '';
    position: absolute;
    bottom: -4px; right: -2px;
    width: 1.5rem; height: 1.5rem;
    border-bottom: 4px solid var(--panel-frame-color);
    border-right: 2px solid var(--panel-frame-color);
    border-radius: 0 0 0.25rem 0;
    pointer-events: none;
  }

  /* ═══ Environment Panel Grid ═══ */
  .env-content {
    display: grid;
    grid-template-areas:
      "sensors core controls"
      "sparklines sparklines sparklines";
    grid-template-columns: 1fr auto 1fr;
    grid-template-rows: auto auto;
    gap: var(--lcars-gap);
    overflow: hidden;
    min-width: 0;
  }
  .env-content.sensor-only {
    grid-template-areas:
      "sensors core"
      "sparklines sparklines";
    grid-template-columns: 1fr auto;
  }

  /* Header */
  .env-header {
    grid-area: header;
    display: flex;
    align-items: center;
    gap: var(--lcars-gap);
    padding: 0.25rem 0.5rem;
  }
  .device-panel-name {
    font-size: var(--lcars-font-size-sub);
    color: var(--panel-frame-color);
    text-transform: uppercase;
    white-space: nowrap;
  }
  .device-panel-header-line {
    flex: 1;
    height: 2px;
    background: var(--panel-frame-color);
    opacity: 0.5;
  }
  .env-score-label {
    font-size: 1.25rem;
    font-weight: bold;
    white-space: nowrap;
  }
  .panel-numeric-code {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    color: var(--panel-frame-color);
    opacity: 0.7;
    white-space: nowrap;
  }

  /* Sensors (left column) */
  .env-sensors {
    grid-area: sensors;
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    padding: 0.25rem 0.5rem;
    overflow-y: auto;
    min-width: 0;
  }
  .device-sensor-line {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0.5rem;
    cursor: pointer;
    border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
    transition: background var(--lcars-transition);
    font-size: var(--lcars-font-size-data);
    text-transform: uppercase;
  }
  .device-sensor-line:hover { background: rgba(255,255,255,0.05); }
  .device-sensor-line:focus-visible {
    outline: 2px solid var(--lcars-ice);
    outline-offset: 2px;
  }
  .sensor-indicator {
    width: 0.5rem; height: 0.5rem;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .sensor-label {
    flex: 1;
    color: var(--lcars-space-white);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.75rem;
  }
  .sensor-state-value {
    flex-shrink: 1;
    font-weight: 700;
    font-size: var(--lcars-font-size-data);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* Section dividers */
  .battery-section-divider {
    height: 1px;
    background: var(--lcars-gray);
    opacity: 0.3;
    margin: 0.375rem 0;
  }
  .battery-section-label {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-label, 0.75rem);
    color: var(--lcars-sky, #aaaaff);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding: 0 0.5rem;
    margin-bottom: 0.125rem;
  }

  /* Controls (right column) */
  .env-controls {
    grid-area: controls;
    display: flex;
    flex-direction: column;
    gap: var(--lcars-gap);
    padding: 0.25rem 0.5rem;
    border-left: 2px solid var(--panel-frame-color);
    min-width: 0;
    overflow: hidden;
  }
  .device-control-btn {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    height: 2.25rem;
    padding: 0 0.75rem;
    background: var(--lcars-sunflower);
    color: var(--lcars-black);
    border: none;
    border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    text-transform: uppercase;
    cursor: pointer;
    transition: filter var(--lcars-transition), background var(--lcars-transition);
    white-space: nowrap;
  }
  .device-control-btn:hover { filter: brightness(1.15); }
  .device-control-btn:focus-visible {
    outline: 2px solid var(--lcars-ice);
    outline-offset: 2px;
  }
  .device-control-btn ha-icon { --mdc-icon-size: 16px; flex-shrink: 0; }
  .device-control-btn[data-on] { background: var(--lcars-gold); }
  .device-control-btn[data-off] { background: var(--lcars-gray); color: var(--lcars-space-white); }

  /* LCARS Option Strip */
  .lcars-option-strip {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    padding: 0.125rem 0;
  }
  .lcars-option-strip-label {
    font-size: 0.65rem;
    color: var(--lcars-space-white, #f5f6fa);
    text-transform: uppercase;
    padding: 0 0.25rem;
    margin-bottom: 0.125rem;
  }
  .lcars-option-strip-btns {
    display: flex;
    flex-wrap: wrap;
    gap: 2px;
  }
  .lcars-option-btn {
    display: flex;
    align-items: center;
    height: 1.5rem;
    padding: 0 0.75rem;
    background: var(--lcars-gray);
    color: var(--lcars-space-white, #f5f6fa);
    border: none;
    border-radius: 0 0.75rem 0.75rem 0;
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-label, 0.75rem);
    text-transform: uppercase;
    cursor: pointer;
    transition: filter 0.2s, background 0.2s;
    user-select: none;
    white-space: nowrap;
  }
  .lcars-option-btn:hover { filter: brightness(1.2); }
  .lcars-option-btn:focus-visible {
    outline: 2px solid var(--lcars-ice);
    outline-offset: 2px;
  }
  .lcars-option-btn[data-selected] {
    background: var(--lcars-gold, var(--lcars-butterscotch));
    color: var(--lcars-black, #000);
  }

  /* ═══ Atmoscrubber Cylinder ═══ */
  .atmoscrubber-container {
    grid-area: core;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem 0;
    min-height: 10rem;
  }
  .atmoscrubber {
    position: relative;
    width: 4rem;
    height: 100%;
    min-height: 10rem;
    border-radius: 2rem;
    border: 2px solid hsl(var(--scrubber-hue, 120), 70%, 60%);
    background: var(--lcars-black);
    overflow: hidden;
    transition: border-color 1s ease, box-shadow 1s ease;
    box-shadow: 0 0 8px hsla(var(--scrubber-hue, 120), 70%, 50%, 0.3);
  }
  .atmoscrubber::before,
  .atmoscrubber::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background-image:
      radial-gradient(circle 3px, hsla(var(--scrubber-hue, 120), 80%, 65%, 0.8) 50%, transparent 51%),
      radial-gradient(circle 2px, hsla(var(--scrubber-hue, 120), 80%, 65%, 0.8) 50%, transparent 51%),
      radial-gradient(circle 2.5px, hsla(var(--scrubber-hue, 120), 80%, 65%, 0.8) 50%, transparent 51%),
      radial-gradient(circle 2px, hsla(var(--scrubber-hue, 120), 80%, 65%, 0.8) 50%, transparent 51%);
    background-size: 100% 3rem;
    background-position: 25% 0, 65% 33%, 40% 60%, 80% 85%;
    background-repeat: repeat-y;
    animation: scrubber-flow var(--scrubber-speed, 20s) linear infinite;
  }
  .atmoscrubber::after {
    opacity: 0.4;
    background-size: 100% 2.5rem;
    background-position: 15% 10%, 55% 50%, 75% 75%;
    background-image:
      radial-gradient(circle 2px, hsla(var(--scrubber-hue, 120), 80%, 65%, 0.6) 50%, transparent 51%),
      radial-gradient(circle 1.5px, hsla(var(--scrubber-hue, 120), 80%, 65%, 0.6) 50%, transparent 51%),
      radial-gradient(circle 2px, hsla(var(--scrubber-hue, 120), 80%, 65%, 0.6) 50%, transparent 51%);
    animation-duration: calc(var(--scrubber-speed, 20s) * 1.4);
  }
  @keyframes scrubber-flow {
    from { background-position-y: 0; }
    to { background-position-y: -3rem; }
  }
  .atmoscrubber.scrubber-idle {
    opacity: 0.5;
    animation: scrubber-idle-glow 3s ease-in-out infinite;
  }
  .atmoscrubber.scrubber-idle::before,
  .atmoscrubber.scrubber-idle::after {
    opacity: 0.2;
  }
  @keyframes scrubber-idle-glow {
    0%, 100% { box-shadow: 0 0 4px hsla(var(--scrubber-hue, 120), 70%, 50%, 0.15); }
    50% { box-shadow: 0 0 12px hsla(var(--scrubber-hue, 120), 70%, 50%, 0.35); }
  }
  .scrubber-score {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
    font-weight: bold;
    color: var(--lcars-space-white);
    z-index: 1;
    text-shadow: 0 0 4px rgba(0,0,0,0.8);
  }

  /* Sparklines (bottom row) */
  .env-sparklines {
    grid-area: sparklines;
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
    padding: 0.25rem 0.5rem;
    border-top: 2px solid var(--panel-frame-color);
  }
  .env-sparkline-wrap {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    min-width: 6rem;
    flex: 1 1 auto;
  }
  .env-sparkline-label {
    font-size: var(--lcars-font-size-label, 0.75rem);
    color: var(--lcars-space-white);
    text-transform: uppercase;
    white-space: nowrap;
    width: 3rem;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .env-sparkline {
    width: 100%;
    height: 1.5rem;
    display: block;
  }

  .panel-pip-strip {
    position: absolute;
    bottom: 4px; right: 4px;
    width: 2rem; height: 3px;
    background: var(--panel-frame-color);
    border-radius: 1.5px;
    opacity: 0.3;
  }

  @media (max-width: 30rem) {
    .env-content {
      grid-template-areas: "core" "sensors" "controls" "sparklines";
      grid-template-columns: 1fr;
      grid-template-rows: auto auto auto auto;
    }
    .env-content.sensor-only {
      grid-template-areas: "core" "sensors" "sparklines";
      grid-template-columns: 1fr;
      grid-template-rows: auto auto auto;
    }
    .atmoscrubber-container {
      min-height: 6rem;
    }
    .atmoscrubber {
      width: 100%;
      height: 4rem;
      min-height: 4rem;
      border-radius: 2rem;
    }
    .env-controls {
      border-left: none;
      border-top: 2px solid var(--panel-frame-color);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .atmoscrubber::before,
    .atmoscrubber::after,
    .atmoscrubber.scrubber-idle { animation: none; }
  }
`;
