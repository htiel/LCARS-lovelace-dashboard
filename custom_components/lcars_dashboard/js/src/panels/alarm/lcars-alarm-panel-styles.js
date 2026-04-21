/**
 * lcars-alarm-panel-styles.js
 *
 * CSS module for <lcars-alarm-panel>.
 * Shield viewscreen, PIN keypad, zone sensor list, arm mode strip.
 *
 * v4.17.0 Panel Extraction Architecture (4X-4)
 */
import { css } from 'lit-element';

export const alarmPanelStyles = css`
  :host { display: block; }

  .lcars-device-panel {
    --panel-frame-color: var(--lcars-butterscotch);
    display: grid;
    gap: var(--lcars-gap);
    width: 100%; max-width: 42rem;
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
    content: ''; position: absolute;
    top: -2px; left: -4px; width: 1.5rem; height: 1.5rem;
    border-top: 4px solid var(--panel-frame-color);
    border-left: 4px solid var(--panel-frame-color);
    border-radius: 0.75rem 0 0 0; pointer-events: none;
  }
  .lcars-device-panel::after {
    content: ''; position: absolute;
    bottom: -4px; right: -2px; width: 1.5rem; height: 1.5rem;
    border-bottom: 4px solid var(--panel-frame-color);
    border-right: 2px solid var(--panel-frame-color);
    border-radius: 0 0 0.25rem 0; pointer-events: none;
  }

  .alarm-content {
    display: grid;
    grid-template-areas: "sensors media" "keypad keypad";
    grid-template-columns: minmax(10rem, 1fr) minmax(14rem, 2fr);
    grid-template-rows: 1fr auto;
    gap: var(--lcars-gap);
    transition: border-color 600ms;
  }
  .alarm-triggered {
    border-width: 6px;
    animation: alarm-pulse 1s ease-in-out infinite;
  }
  @keyframes alarm-pulse {
    0%, 100% { border-color: var(--lcars-tomato); }
    50% { border-color: transparent; }
  }

  .alarm-header { grid-area: header; display: flex; align-items: center; gap: 0.5rem; }
  .device-panel-name { font-size: var(--lcars-font-size-sub); color: var(--panel-frame-color); text-transform: uppercase; white-space: nowrap; }
  .device-panel-header-line { flex: 1; height: 2px; background: var(--panel-frame-color); opacity: 0.5; }
  .alarm-state-badge { font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); text-transform: uppercase; letter-spacing: 0.1em; }
  .panel-numeric-code { font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); color: var(--panel-frame-color); opacity: 0.7; white-space: nowrap; }

  .alarm-sensors { grid-area: sensors; overflow-y: auto; }
  .device-sensor-line { display: flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0.5rem; cursor: pointer; border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0; transition: background var(--lcars-transition); font-size: var(--lcars-font-size-data); text-transform: uppercase; }
  .device-sensor-line:hover { background: rgba(255,255,255,0.05); }
  .device-sensor-line:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }
  .sensor-indicator { width: 0.5rem; height: 0.5rem; border-radius: 50%; flex-shrink: 0; }
  .sensor-label { flex: 1; color: var(--lcars-space-white); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.75rem; }
  .sensor-state-value { flex-shrink: 0; font-weight: 700; font-size: var(--lcars-font-size-data); }
  /* 4X-7: zone sibling telemetry (battery, illuminance) inline pips */
  .zone-siblings { flex-shrink: 0; display: flex; gap: 0.375rem; margin: 0 0.25rem; }
  .zone-sibling-pip { font-size: 0.625rem; color: var(--lcars-sky, #aaaaff); white-space: nowrap; }
  .battery-section-divider { height: 1px; background: var(--lcars-gray); opacity: 0.3; margin: 0.375rem 0; }

  .alarm-viewscreen { grid-area: media; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem; }
  .alarm-shield { width: 100%; max-width: 140px; }
  .alarm-countdown { display: flex; flex-direction: column; align-items: center; }
  .alarm-countdown-num { font-family: var(--lcars-font); font-size: 3rem; font-weight: bold; }
  .alarm-countdown-label { font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); color: var(--lcars-data-accent); }
  .alarm-arm-strip { display: flex; gap: var(--lcars-gap); width: 100%; }
  .alarm-arm-btn {
    flex: 1; height: var(--lcars-btn-height);
    border: none; border-radius: var(--lcars-btn-radius);
    background: var(--lcars-disabled); color: var(--lcars-black);
    font-family: var(--lcars-font); font-size: var(--lcars-font-size-data);
    text-transform: uppercase; cursor: pointer; transition: background 200ms;
  }
  .alarm-arm-btn[data-active] { background: var(--panel-frame-color); }
  .alarm-arm-btn:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }

  .alarm-keypad { grid-area: keypad; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 0.5rem; }
  .alarm-keypad:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }
  .alarm-code-display { display: flex; gap: 0.5rem; }
  .alarm-code-dot { width: 14px; height: 14px; border-radius: 50%; transition: background 200ms; }
  .alarm-pin-error { animation: alarm-shake 400ms ease-out; }
  @keyframes alarm-shake { 0%, 100% { transform: translateX(0); } 20% { transform: translateX(-6px); } 40% { transform: translateX(6px); } 60% { transform: translateX(-4px); } 80% { transform: translateX(4px); } }
  .alarm-digit-grid { display: grid; grid-template-columns: repeat(3, minmax(3.5rem, 4.5rem)); gap: 0.5rem; justify-content: center; }
  .alarm-digit-btn {
    height: 4rem; min-width: 3.5rem; border: none; border-radius: var(--lcars-btn-radius);
    background: var(--lcars-sunflower); color: var(--lcars-black);
    font-family: var(--lcars-font); font-size: 1.375rem;
    cursor: pointer; transition: background 200ms;
    -webkit-tap-highlight-color: transparent; /* intentional: custom :active feedback provided */
  }
  .alarm-digit-btn:hover { filter: brightness(1.1); }
  .alarm-digit-btn:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }
  .alarm-digit-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    pointer-events: none;
  }
  .alarm-action-btn { background: var(--lcars-disabled); }

  /* ─── Lockout Message ─── */
  .alarm-lockout-msg {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    color: var(--lcars-tomato);
    text-transform: uppercase;
    text-align: center;
    letter-spacing: 0.08em;
    padding: 0.25rem 0;
    animation: lockout-pulse 2s ease-in-out infinite;
  }
  .alarm-lockout-countdown {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    color: var(--lcars-tomato);
    text-transform: uppercase;
    text-align: center;
    letter-spacing: 0.08em;
    opacity: 0.7;
  }
  @keyframes lockout-pulse {
    0%, 100% { opacity: 1; }
    50%      { opacity: 0.5; }
  }

  .panel-pip-strip { position: absolute; bottom: 4px; right: 4px; width: 2rem; height: 3px; background: var(--panel-frame-color); border-radius: 1.5px; opacity: 0.3; }

  @media (max-width: 30rem) {
    .alarm-content {
      grid-template-areas: "media" "sensors" "keypad";
      grid-template-columns: 1fr;
      grid-template-rows: auto auto auto;
    }
    .alarm-digit-grid {
      grid-template-columns: repeat(3, 1fr);
      gap: 0.75rem;
      width: 100%;
      max-width: 18rem;
    }
    .alarm-digit-btn {
      height: 3.5rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .alarm-triggered { animation: none; }
    .alarm-pin-error { animation: none; }
    .alarm-lockout-msg { animation: none; }
  }
`;
