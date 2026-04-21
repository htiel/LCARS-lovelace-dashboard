/**
 * lcars-ev-charger-panel-styles.js
 *
 * CSS module for <lcars-ev-charger-panel>.
 * Wallbox Vilya V2G — energy flow visualization, solar mode strip, controls.
 *
 * v4.23.0 (4X-55)
 */
import { css } from 'lit-element';

export const evChargerPanelStyles = css`
  :host { display: block; }

  /* ═══ Panel Frame ═══ */
  .lcars-device-panel {
    --panel-frame-color: var(--ev-charger-state-color, var(--lcars-lilac));
    display: grid;
    grid-template-areas:
      "header  header"
      "sensors media"
      "solar   solar"
      "auxctrl auxctrl";
    grid-template-columns: minmax(10rem, 1fr) minmax(14rem, 2fr);
    grid-template-rows: auto 1fr auto auto;
    gap: var(--lcars-gap);
    border-left: 4px solid var(--panel-frame-color);
    border-top: 2px solid var(--panel-frame-color);
    border-right: 2px solid var(--panel-frame-color);
    border-bottom: 4px solid var(--panel-frame-color);
    border-radius: 0.75rem;
    padding: var(--lcars-gap);
    background: var(--lcars-black);
    min-height: calc(var(--lcars-vunit, 4rem) * 5);
    transition: border-color 600ms;
  }

  /* Header */
  .ev-header { grid-area: header; display: flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0.75rem; border-bottom: 2px solid var(--panel-frame-color); }
  .ev-header ha-icon { --mdc-icon-size: 20px; flex-shrink: 0; }
  .device-panel-name { font-size: var(--lcars-font-size-sub); color: var(--panel-frame-color); text-transform: uppercase; white-space: nowrap; }
  .device-panel-header-line { flex: 1; height: 2px; background: var(--panel-frame-color); opacity: 0.5; }
  .ev-status-badge { font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); text-transform: uppercase; white-space: nowrap; font-weight: 700; transition: color 600ms; }
  .ev-header-power { font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); text-transform: uppercase; white-space: nowrap; transition: color 600ms; }
  .panel-numeric-code { font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); color: var(--panel-frame-color); opacity: 0.7; white-space: nowrap; }

  /* Sensors column */
  .ev-sensors { grid-area: sensors; display: flex; flex-direction: column; gap: 0.125rem; padding: 0.25rem 0; align-self: start; overflow-y: auto; max-height: 28rem; }
  .ev-section-label { font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); color: var(--lcars-sky, #aaaaff); text-transform: uppercase; padding: 0.25rem 0.5rem 0; letter-spacing: 0.05em; }
  .ev-section-divider { height: 1px; background: var(--lcars-disabled); margin: 0.25rem 0; opacity: 0.5; }
  .device-sensor-line { display: flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0.5rem; cursor: pointer; border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0; transition: background var(--lcars-transition); font-size: var(--lcars-font-size-data); text-transform: uppercase; }
  .device-sensor-line:hover { background: rgba(255,255,255,0.05); }
  .device-sensor-line:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }
  .sensor-indicator { width: 0.5rem; height: 0.5rem; border-radius: 50%; flex-shrink: 0; }
  .sensor-label { flex: 1; color: var(--lcars-space-white); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.75rem; }
  .sensor-state-value { flex-shrink: 0; font-weight: 700; font-size: var(--lcars-font-size-data); }

  /* Media / Flow Visualization */
  .ev-media {
    grid-area: media; position: relative;
    border: 3px solid var(--panel-frame-color); border-radius: 0.5rem;
    overflow: hidden; background: var(--lcars-bg, #000);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 0.5rem; padding: 1rem; min-height: 14rem;
  }
  .ev-media::before, .ev-media::after {
    content: ''; position: absolute; width: 1.5rem; height: 1.5rem;
    border-color: var(--panel-frame-color); border-style: solid; pointer-events: none; z-index: 1;
  }
  .ev-media::before { top: 0.25rem; left: 0.25rem; border-width: 3px 0 0 3px; border-radius: 0.25rem 0 0 0; }
  .ev-media::after { bottom: 0.25rem; right: 0.25rem; border-width: 0 1px 1px 0; border-radius: 0 0 0.25rem 0; }
  .ev-flow-display { width: 100%; max-width: 14rem; height: auto; display: block; }

  /* Chevron cascade animation */
  @keyframes ev-chevron-cascade {
    0%   { opacity: 0.2; }
    33%  { opacity: 1; }
    66%  { opacity: 0.2; }
    100% { opacity: 0.2; }
  }
  .ev-flow-chevron {
    animation: ev-chevron-cascade 1.5s ease-in-out infinite;
    animation-delay: calc(var(--chevron-delay, 0) * 0.3s);
  }
  .ev-flow-idle .ev-flow-chevron { animation: none; }
  @media (prefers-reduced-motion: reduce) {
    .ev-flow-chevron { animation: none; }
  }

  /* Solar mode strip */
  .ev-solar-strip {
    grid-area: solar; display: flex; flex-wrap: wrap; align-items: center;
    gap: var(--lcars-gap); padding-top: var(--lcars-gap); border-top: 2px solid var(--panel-frame-color);
  }
  .ev-strip-label { font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); color: var(--lcars-text-heading, var(--lcars-sunflower)); text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap; margin-right: 0.5rem; }
  .ev-solar-btn {
    display: flex; align-items: center; gap: 0.375rem;
    height: var(--lcars-btn-height, 3rem); padding: 0 0.75rem 0 0.5rem; min-width: 5rem;
    background: var(--lcars-disabled); color: var(--lcars-space-white); border: none;
    border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
    font-family: var(--lcars-font); font-size: var(--lcars-font-size-data);
    text-transform: uppercase; cursor: pointer; transition: filter var(--lcars-transition), background var(--lcars-transition);
    white-space: nowrap; user-select: none;
  }
  .ev-solar-btn:hover { filter: brightness(1.2); }
  .ev-solar-btn:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }
  .ev-solar-btn[aria-checked="true"] { background: var(--lcars-gold, var(--lcars-sunflower)); color: var(--lcars-black); }
  .ev-solar-btn ha-icon { --mdc-icon-size: 16px; flex-shrink: 0; }

  /* Aux controls */
  .ev-aux-controls {
    grid-area: auxctrl; display: flex; flex-wrap: wrap; align-items: center;
    gap: calc(var(--lcars-gap) * 4); padding-top: var(--lcars-gap); border-top: 2px solid var(--panel-frame-color);
  }
  .ev-aux-label { font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); color: var(--lcars-text-heading, var(--lcars-sunflower)); text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap; }
  .ev-current-control { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
  .ev-current-adjuster { display: flex; align-items: center; gap: 0.5rem; }
  .ev-adj-btn {
    display: flex; align-items: center; justify-content: center;
    width: 2.5rem; height: 2.5rem; min-width: 2.5rem;
    background: var(--lcars-sunflower); color: var(--lcars-black); border: none;
    border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
    font-family: var(--lcars-font); font-size: var(--lcars-font-size-sub); font-weight: 700;
    cursor: pointer; transition: filter var(--lcars-transition); user-select: none;
  }
  .ev-adj-btn.decrement { border-radius: var(--lcars-btn-radius) 0 0 var(--lcars-btn-radius); }
  .ev-adj-btn:hover { filter: brightness(1.2); }
  .ev-adj-btn:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }
  .ev-current-value { font-family: var(--lcars-font); font-size: var(--lcars-font-size-sub); color: var(--lcars-space-white); text-transform: uppercase; font-weight: 700; min-width: 3rem; text-align: center; }
  .ev-lock-control { display: flex; align-items: center; gap: 0.5rem; }
  .ev-lock-toggle {
    height: var(--lcars-btn-height, 3rem); padding: 0 0.75rem; min-width: 3rem;
    background: var(--lcars-disabled); color: var(--lcars-space-white); border: none;
    border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
    font-family: var(--lcars-font); font-size: var(--lcars-font-size-data);
    text-transform: uppercase; font-weight: 700; cursor: pointer;
    transition: background var(--lcars-transition);
  }
  .ev-lock-toggle[aria-checked="true"] { background: var(--lcars-ice); color: var(--lcars-black); }
  .ev-lock-toggle:hover { filter: brightness(1.2); }
  .ev-lock-toggle:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }

  /* Responsive: stack on narrow */
  @media (max-width: 480px) {
    .lcars-device-panel {
      grid-template-areas: "header" "media" "sensors" "solar" "auxctrl";
      grid-template-columns: 1fr;
    }
  }
`;
