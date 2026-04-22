/**
 * lcars-pool-spa-panel-styles.js
 *
 * CSS module for <lcars-pool-spa-panel>.
 * Pentair ScreenLogic — pool/spa bodies, chemistry bars, pump spinner, lighting.
 *
 * v4.17.0 Panel Extraction Architecture (4X-5)
 * v4.18.0 Visual Refresh (4X-9) — LCARS compliance fixes:
 *   #1 Endcap pill setpoints, #2 Asymmetric mini-elbow brackets,
 *   #3 Font size → var(--lcars-font-size-data), #4 Body temp → var(--lcars-font-size-title),
 *   #6 Inner frame asymmetric borders.
 *   Chemistry segmented bars, freeze banner, circuit grouping,
 *   heating indicator, thermal tint, sensor mini-bars.
 */
import { css } from 'lit-element';

export const poolSpaPanelStyles = css`
  :host { display: block; }

  .lcars-device-panel {
    display: grid;
    gap: var(--lcars-gap);
  }

  /* Freeze protection banner */
  .freeze-banner {
    background: var(--lcars-tomato);
    color: var(--lcars-black);
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    padding: 0.25rem 0.75rem;
    border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
    text-align: center;
    animation: freeze-pulse 3s ease-in-out infinite;
  }
  .freeze-icon { margin-right: 0.25rem; }
  .freeze-nominal {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    color: var(--lcars-gray);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    opacity: 0.5;
    padding: 0 0.5rem;
  }
  @keyframes freeze-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }
  .freeze-active {
    border-color: var(--lcars-ice) !important;
  }

  .pool-content {
    display: grid;
    grid-template-areas:
      "chemistry aquatics  controls"
      "lighting  lighting  lighting";
    grid-template-columns: minmax(8rem, 1fr) minmax(20rem, 3fr) minmax(8rem, 1.2fr);
    grid-template-rows: 1fr auto;
    gap: var(--lcars-gap);
  }
  .pool-content.pool-no-chem {
    grid-template-areas:
      "aquatics controls"
      "lighting lighting";
    grid-template-columns: minmax(20rem, 3fr) minmax(8rem, 1.2fr);
  }

  .pool-header { grid-area: header; display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
  .device-panel-name { font-size: var(--lcars-font-size-sub); color: var(--panel-frame-color); text-transform: uppercase; white-space: nowrap; }
  .device-panel-header-line { flex: 1; height: 2px; background: var(--panel-frame-color); opacity: 0.5; }
  .panel-numeric-code { font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); color: var(--panel-frame-color); opacity: 0.7; white-space: nowrap; }
  .pool-temp-badge { font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); margin-left: 0.5rem; }

  /* Chemistry — segmented bars */
  .pool-chemistry { grid-area: chemistry; overflow-y: auto; }
  .chem-reading {
    display: flex; flex-direction: column; gap: 0.125rem;
    padding: 0.25rem 0.5rem; cursor: pointer;
    border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
    transition: background var(--lcars-transition);
  }
  .chem-reading:hover { background: rgba(255,255,255,0.05); }
  .chem-reading:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }
  .chem-label {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    color: var(--lcars-space-white);
    text-transform: uppercase;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .source-pill {
    display: inline-block;
    font-size: 0.5rem;
    padding: 0 0.2rem;
    border: 1px solid var(--lcars-gray);
    border-radius: 2px;
    vertical-align: middle;
    color: var(--lcars-gray);
    line-height: 1.2;
  }

  /* Legacy sensor lines (environmental, diagnostics) */
  .device-sensor-line { display: flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0.5rem; cursor: pointer; border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0; transition: background var(--lcars-transition); font-size: var(--lcars-font-size-data); text-transform: uppercase; }
  .device-sensor-line:hover { background: rgba(255,255,255,0.05); }
  .device-sensor-line:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }
  /* Compliance #5 equivalent: mini-bars not dots */
  .sensor-indicator-bar { width: 2px; height: 1rem; border-radius: 1px; flex-shrink: 0; }
  .sensor-indicator { width: 0.5rem; height: 0.5rem; border-radius: 50%; flex-shrink: 0; }
  .sensor-label {
    flex: 1; color: var(--lcars-space-white);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    font-size: var(--lcars-font-size-data); /* Compliance #3: use LCARS 3-tier font */
  }
  .sensor-state-value { flex-shrink: 0; font-weight: 700; font-size: var(--lcars-font-size-data); }

  /* Aquatics center */
  .pool-aquatics { grid-area: aquatics; display: flex; gap: var(--lcars-gap); justify-content: center; }
  .pool-body-frame {
    flex: 1;
    /* Compliance #6: asymmetric borders — thick left/top, thin right/bottom */
    border-left: 3px solid var(--body-color);
    border-top: 3px solid var(--body-color);
    border-right: 1px solid var(--body-color);
    border-bottom: 1px solid var(--body-color);
    border-radius: 0.5rem 0.25rem 0.25rem 0.25rem;
    padding: 0.5rem; text-align: center; display: flex; flex-direction: column;
    align-items: center; gap: 0.25rem; position: relative;
    background: var(--lcars-black, #000);
  }
  /* Thermal tint backgrounds */
  .pool-body-frame.thermal-cool { background: rgba(153, 204, 255, 0.04); }
  .pool-body-frame.thermal-warm { background: rgba(255, 180, 100, 0.04); }
  /* Compliance #2: Asymmetric mini-elbow brackets */
  .pool-body-frame::before {
    content: ''; position: absolute;
    top: 4px; left: 4px; width: 1.5rem; height: 1.5rem;
    border-top: 3px solid var(--body-color);
    border-left: 3px solid var(--body-color);
    border-right: none; border-bottom: none;
    border-radius: 0.5rem 0 0 0;
    pointer-events: none;
  }
  .pool-body-frame::after {
    content: ''; position: absolute;
    bottom: 4px; right: 4px; width: 1.5rem; height: 1.5rem;
    border-bottom: 1px solid var(--body-color);
    border-right: 1px solid var(--body-color);
    border-left: none; border-top: none;
    border-radius: 0 0 0.25rem 0;
    pointer-events: none;
  }
  .pool-body-label { font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); text-transform: uppercase; letter-spacing: 0.1em; }
  /* Compliance #4: map to LCARS title tier */
  .pool-body-temp { font-family: var(--lcars-font); font-size: var(--lcars-font-size-title); font-weight: bold; }
  .pool-setpoint-row { display: flex; align-items: center; gap: 0.5rem; }
  .pool-target { font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); }

  /* Compliance #1: Endcap pill setpoint buttons, not circles */
  .pool-sp-btn {
    width: 3rem; height: 2.5rem;
    border: none;
    background: var(--lcars-disabled);
    color: var(--lcars-space-white);
    font-size: 1.25rem; font-family: var(--lcars-font);
    cursor: pointer; transition: background 200ms;
    border-radius: 0;
  }
  .pool-sp-btn:hover { background: var(--panel-frame-color); }
  .pool-sp-btn:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }
  .pool-sp-btn.sp-decrement {
    border-radius: var(--lcars-btn-radius) 0 0 var(--lcars-btn-radius);
  }
  .pool-sp-btn.sp-increment {
    border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
  }

  /* Heating indicator bar — flat pulse, no gradient (Bracer Jack Rule 1) */
  .pool-heating-bar {
    width: 100%; height: 3px;
    margin-top: 0.25rem;
    border-radius: 1.5px;
    background: var(--body-color);
    animation: pool-heat-pulse 2s ease-in-out infinite;
  }
  @keyframes pool-heat-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  /* Circuit groups */
  .circuit-group { margin-bottom: 0.5rem; }
  .circuit-group-label {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    color: var(--lcars-sky, #aaaaff);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding: 0 0.5rem;
    margin-bottom: 0.25rem;
  }
  .circuit-count { color: var(--lcars-gray); }

  /* Controls */
  .pool-controls { grid-area: controls; display: flex; flex-direction: column; gap: var(--lcars-gap); }
  .device-control-btn {
    display: flex; align-items: center; gap: 0.375rem; height: 2.25rem;
    padding: 0 0.75rem; background: var(--lcars-sunflower); color: var(--lcars-black);
    border: none; border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
    font-family: var(--lcars-font); font-size: var(--lcars-font-size-data);
    text-transform: uppercase; cursor: pointer;
    transition: filter var(--lcars-transition), background var(--lcars-transition);
    white-space: nowrap; position: relative; overflow: hidden;
  }
  .device-control-btn:hover { filter: brightness(1.15); }
  .device-control-btn:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }
  .device-control-btn ha-icon { --mdc-icon-size: 16px; flex-shrink: 0; }
  .device-control-btn[data-on] { background: var(--lcars-gold); }
  .device-control-btn[data-off] { background: var(--lcars-gray); color: var(--lcars-space-white); }
  .device-control-btn::after {
    content: ''; position: absolute; top: 50%; left: 50%;
    width: 1rem; height: 1rem; margin: -0.5rem 0 0 -0.5rem;
    border-radius: 50%; background: var(--lcars-space-white);
    opacity: 0; pointer-events: none;
  }
  .device-control-btn:active::after { animation: lcars-button-flash var(--lcars-anim-flash, 300ms) ease-out forwards; }
  @keyframes lcars-button-flash {
    0% { transform: scale(0); opacity: 0.6; }
    100% { transform: scale(6); opacity: 0; }
  }

  /* Pump spinner */
  .lcars-pump-spinner { display: inline-flex; align-items: center; justify-content: center; width: 14px; height: 14px; position: relative; }
  .lcars-pump-spinner .dot { position: absolute; width: 4px; height: 4px; border-radius: 50%; background: var(--lcars-ice); opacity: 0.3; }
  .lcars-pump-spinner .dot:nth-child(1) { top: 0; left: 5px; }
  .lcars-pump-spinner .dot:nth-child(2) { bottom: 1px; left: 0; }
  .lcars-pump-spinner .dot:nth-child(3) { bottom: 1px; right: 0; }
  .lcars-pump-spinner.on { animation: lcars-pump-spin 1.2s linear infinite; }
  .lcars-pump-spinner.on .dot { opacity: 1; }
  .lcars-pump-spinner.on .dot:nth-child(2) { opacity: 0.6; }
  .lcars-pump-spinner.on .dot:nth-child(3) { opacity: 0.3; }
  @keyframes lcars-pump-spin { to { transform: rotate(360deg); } }

  /* Lighting */
  .pool-lighting { grid-area: lighting; display: flex; gap: var(--lcars-gap); flex-wrap: wrap; }

  .panel-pip-strip { position: absolute; bottom: 4px; right: 4px; width: 2rem; height: 3px; background: var(--panel-frame-color); border-radius: 1.5px; opacity: 0.3; }

  @media (max-width: 30rem) {
    .pool-content {
      grid-template-areas: "aquatics" "chemistry" "controls" "lighting";
      grid-template-columns: 1fr;
      grid-template-rows: auto auto auto auto;
    }
    .pool-content.pool-no-chem {
      grid-template-areas: "aquatics" "controls" "lighting";
      grid-template-columns: 1fr;
      grid-template-rows: auto auto auto;
    }
    .pool-aquatics {
      flex-direction: column;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .lcars-pump-spinner.on { animation: none; }
    .pool-heating-bar { animation: none; }
    .freeze-banner { animation: none; }
  }
`;
