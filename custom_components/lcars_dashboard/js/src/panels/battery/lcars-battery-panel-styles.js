/**
 * lcars-battery-panel-styles.js
 *
 * CSS module for <lcars-battery-panel>.
 * Warp core visualization, I/O flow conduits, telemetry, slider controls.
 *
 * v4.17.0 Panel Extraction Architecture (4X-4)
 */
import { css } from 'lit-element';

export const batteryPanelStyles = css`
  :host {
    display: block;
  }

  /* ═══ Device Panel Content ═══ */
  .lcars-device-panel {
    --panel-frame-color: var(--lcars-butterscotch);
    display: grid;
    gap: var(--lcars-gap);
  }

  /* ═══ Battery Panel Grid ═══ */
  .battery-content {
    display: grid;
    grid-template-columns: minmax(8rem, 1fr) minmax(5rem, 6rem) minmax(8rem, 1.2fr);
    grid-template-rows: 1fr auto;
    grid-template-areas:
      "sensors  core      controls"
      "ioflow   ioflow    ioflow";
    gap: var(--lcars-gap);
  }

  /* Header */
  .battery-header {
    grid-area: header;
    display: flex;
    align-items: center;
    gap: 0.5rem;
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
  .battery-charge-label {
    font-size: var(--lcars-font-size-title);
    font-weight: 700;
    text-transform: uppercase;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .panel-numeric-code {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    color: var(--panel-frame-color);
    opacity: 0.7;
    white-space: nowrap;
  }

  /* Telemetry (left) */
  .battery-telemetry {
    grid-area: sensors;
    display: flex;
    flex-direction: column;
    gap: var(--lcars-gap);
    padding: 0.25rem;
    overflow-y: auto;
    max-height: 22rem;
  }
  .battery-total-line {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0.5rem;
    cursor: pointer;
    font-size: var(--lcars-font-size-data);
    text-transform: uppercase;
    border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
    transition: background var(--lcars-transition);
  }
  .battery-total-line:hover { background: rgba(255,255,255,0.05); }
  .battery-total-line:focus-visible {
    outline: 2px solid var(--lcars-ice, #99ccff);
    outline-offset: 2px;
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
    flex-shrink: 0;
    font-weight: 700;
    font-size: var(--lcars-font-size-data);
  }
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

  /* ═══ Warp Core ═══ */
  .warp-core-container {
    grid-area: core;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem 0;
    min-height: 10rem;
  }
  .warp-core {
    position: relative;
    width: 4rem;
    height: 100%;
    min-height: 10rem;
    border-radius: 2rem;
    border: 2px solid var(--core-color);
    background: var(--lcars-black);
    overflow: hidden;
    box-shadow: 0 0 calc(var(--core-charge, 0) * 0.2px) var(--core-color);
    transition: border-color 1s ease, box-shadow 1s ease;
  }
  .warp-core-fill {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: calc(var(--core-charge, 0) * 1%);
    background: var(--core-color);
    opacity: 0.8;
    transition: height 1s ease, background 1s ease;
  }
  .warp-core-fill.core-idle {
    animation: core-idle-pulse 3s ease-in-out infinite;
  }
  .warp-core-fill.core-charging {
    animation: core-charge-flow 2s linear infinite;
    background-image: repeating-linear-gradient(
      0deg,
      transparent 0px, transparent 0.75rem,
      rgba(255,255,255,0.15) 0.75rem, rgba(255,255,255,0.15) 1rem
    );
    background-size: 100% 2rem;
  }
  .warp-core-stream {
    position: absolute;
    left: 50%; top: 0; bottom: 0;
    width: 2px;
    transform: translateX(-50%);
    background: rgba(255,255,255,0.35);
  }
  .warp-core-tick {
    position: absolute;
    left: 10%; right: 10%;
    height: 1px;
    background: var(--core-color);
    opacity: 0.3;
    pointer-events: none;
  }
  @keyframes core-idle-pulse {
    0%, 100% { opacity: 0.8; }
    50% { opacity: 0.55; }
  }
  @keyframes core-charge-flow {
    0% { background-position-y: 0; }
    100% { background-position-y: -2rem; }
  }

  /* Controls (right) */
  .battery-controls {
    grid-area: controls;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.25rem;
    overflow-y: auto;
    max-height: 22rem;
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

  /* Number slider controls */
  .battery-slider-control {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    padding: 0.25rem 0.5rem;
  }
  .battery-slider-label {
    font-size: 0.65rem;
    color: var(--lcars-space-white);
    text-transform: uppercase;
  }
  .battery-slider-track {
    position: relative;
    height: 1.25rem;
    background: var(--lcars-gray);
    border-radius: 0.625rem;
    cursor: pointer;
    overflow: visible;
  }
  .battery-slider-fill {
    height: 100%;
    background: var(--lcars-ice);
    border-radius: 0.625rem 0 0 0.625rem;
    transition: width 0.3s ease;
  }
  .battery-slider-thumb {
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 1.25rem; height: 1.25rem;
    border-radius: 50%;
    background: var(--lcars-sunflower);
    border: 2px solid var(--lcars-black);
    pointer-events: none;
  }
  .battery-slider-value {
    font-size: 0.7rem;
    color: var(--lcars-data-accent, var(--lcars-ice));
    text-align: right;
    font-weight: 700;
  }

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

  /* ═══ Power I/O Flow ═══ */
  .battery-io-flow {
    grid-area: ioflow;
    display: flex;
    flex-direction: column;
    gap: var(--lcars-gap);
    padding: 0.25rem 0.5rem;
    border-top: 2px solid var(--panel-frame-color);
  }
  .io-pair-row {
    display: flex;
    align-items: center;
    gap: 0;
    min-height: 1.75rem;
  }
  .io-port {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 3.5rem;
    flex-shrink: 0;
  }
  .io-port.io-out { order: 5; }
  .io-label {
    font-size: 0.6rem;
    color: var(--lcars-space-white);
    text-transform: uppercase;
    white-space: nowrap;
  }
  .io-watts {
    font-size: var(--lcars-font-size-data);
    font-weight: 700;
  }
  .io-conduit {
    flex: 1;
    height: 3px;
    position: relative;
    overflow: hidden;
  }
  .io-conduit-in { order: 2; background: var(--lcars-ice); opacity: 0.4; }
  .io-conduit-out { order: 4; background: var(--lcars-butterscotch); opacity: 0.4; }
  .io-core-gap { order: 3; width: 1rem; flex-shrink: 0; }
  .io-conduit::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
  }
  .io-conduit-in:not(.flow-stopped)::before {
    background: repeating-linear-gradient(
      90deg, transparent 0px, transparent 6px,
      var(--lcars-ice) 6px, var(--lcars-ice) 10px
    );
    background-size: 16px 100%;
    animation: flow-in var(--flow-duration, 0.8s) linear infinite;
  }
  .io-conduit-out:not(.flow-stopped)::before {
    background: repeating-linear-gradient(
      270deg, transparent 0px, transparent 6px,
      var(--lcars-butterscotch) 6px, var(--lcars-butterscotch) 10px
    );
    background-size: 16px 100%;
    animation: flow-out var(--flow-duration, 0.8s) linear infinite;
  }
  .flow-fast { --flow-duration: 0.4s; opacity: 1; }
  .flow-medium { --flow-duration: 0.8s; opacity: 0.8; }
  .flow-slow { --flow-duration: 1.5s; opacity: 0.6; }
  .flow-stopped { opacity: 0.15; }
  .flow-stopped::before { display: none; }
  @keyframes flow-in {
    from { background-position-x: 0; }
    to { background-position-x: -16px; }
  }
  @keyframes flow-out {
    from { background-position-x: 0; }
    to { background-position-x: 16px; }
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
    .battery-content {
      grid-template-areas: "core" "sensors" "controls" "ioflow";
      grid-template-columns: 1fr;
      grid-template-rows: auto auto auto auto;
    }
    .warp-core-container {
      min-height: 6rem;
      flex-direction: row;
    }
    .warp-core {
      width: 100%;
      height: 4rem;
      min-height: 4rem;
      border-radius: 2rem;
    }
    .warp-core-fill {
      left: 0; bottom: 0; top: 0;
      right: auto;
      width: calc(var(--core-charge, 0) * 1%);
      height: 100%;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .warp-core-fill.core-idle,
    .warp-core-fill.core-charging { animation: none; }
    .io-conduit-in::before,
    .io-conduit-out::before { animation: none; }
  }
`;
