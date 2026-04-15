/**
 * lcars-pool-spa-panel-styles.js
 *
 * CSS module for <lcars-pool-spa-panel>.
 * Pentair ScreenLogic — pool/spa bodies, chemistry, pump spinner, lighting.
 *
 * v4.17.0 Panel Extraction Architecture (4X-5)
 */
import { css } from 'lit-element';

export const poolSpaPanelStyles = css`
  :host { display: block; }

  .lcars-device-panel {
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

  .pool-chemistry { grid-area: chemistry; overflow-y: auto; }
  .device-sensor-line { display: flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0.5rem; cursor: pointer; border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0; transition: background var(--lcars-transition); font-size: var(--lcars-font-size-data); text-transform: uppercase; }
  .device-sensor-line:hover { background: rgba(255,255,255,0.05); }
  .device-sensor-line:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }
  .sensor-indicator { width: 0.5rem; height: 0.5rem; border-radius: 50%; flex-shrink: 0; }
  .sensor-label { flex: 1; color: var(--lcars-space-white); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.75rem; }
  .sensor-state-value { flex-shrink: 0; font-weight: 700; font-size: var(--lcars-font-size-data); }

  /* Aquatics center */
  .pool-aquatics { grid-area: aquatics; display: flex; gap: var(--lcars-gap); justify-content: center; }
  .pool-body-frame {
    flex: 1; border: 2px solid var(--body-color); border-radius: 4px;
    padding: 0.5rem; text-align: center; display: flex; flex-direction: column;
    align-items: center; gap: 0.25rem; position: relative;
  }
  .pool-body-frame::before, .pool-body-frame::after {
    content: ''; position: absolute; width: 1.5rem; height: 1.5rem;
    border: 2px solid var(--body-color);
  }
  .pool-body-frame::before { top: 4px; left: 4px; border-right: none; border-bottom: none; }
  .pool-body-frame::after { bottom: 4px; right: 4px; border-left: none; border-top: none; }
  .pool-body-label { font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); text-transform: uppercase; letter-spacing: 0.1em; }
  .pool-body-temp { font-family: var(--lcars-font); font-size: 2.5rem; font-weight: bold; color: var(--body-color); }
  .pool-setpoint-row { display: flex; align-items: center; gap: 0.5rem; }
  .pool-target { font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); }

  /* Setpoint buttons (shared with climate) */
  .climate-sp-btn {
    width: 2.5rem; height: 2.5rem; border: none; border-radius: 50%;
    background: var(--lcars-disabled); color: var(--lcars-space-white);
    font-size: 1.25rem; font-family: var(--lcars-font); cursor: pointer;
    transition: background 200ms;
  }
  .climate-sp-btn:hover { background: var(--panel-frame-color); }
  .climate-sp-btn:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }

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

  @media (prefers-reduced-motion: reduce) {
    .lcars-pump-spinner.on { animation: none; }
  }
`;
