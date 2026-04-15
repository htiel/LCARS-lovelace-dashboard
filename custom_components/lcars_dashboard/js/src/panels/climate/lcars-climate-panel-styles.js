/**
 * lcars-climate-panel-styles.js
 *
 * CSS module for <lcars-climate-panel>.
 * Temperature arc, setpoint controls, HVAC mode strips.
 *
 * v4.17.0 Panel Extraction Architecture (4X-4)
 */
import { css } from 'lit-element';

export const climatePanelStyles = css`
  :host {
    display: block;
  }

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

  .climate-content {
    display: grid;
    grid-template-areas:
      "sensors  media"
      "modes    modes"
      "auxctrl  auxctrl";
    grid-template-columns: minmax(10rem, 1fr) minmax(14rem, 2fr);
    grid-template-rows: 1fr auto auto;
    gap: var(--lcars-gap);
    transition: border-color 600ms;
  }

  .climate-header { grid-area: header; display: flex; align-items: center; gap: 0.5rem; }
  .device-panel-name {
    font-size: var(--lcars-font-size-sub);
    color: var(--panel-frame-color);
    text-transform: uppercase;
    white-space: nowrap;
  }
  .device-panel-header-line {
    flex: 1; height: 2px;
    background: var(--panel-frame-color);
    opacity: 0.5;
  }
  .climate-action-badge {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
  .panel-numeric-code {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    color: var(--panel-frame-color);
    opacity: 0.7;
    white-space: nowrap;
  }

  /* Sensors (left) */
  .climate-sensors { grid-area: sensors; overflow-y: auto; }
  .device-sensor-line {
    display: flex; align-items: center; gap: 0.5rem;
    padding: 0.25rem 0.5rem; cursor: pointer;
    border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
    transition: background var(--lcars-transition);
    font-size: var(--lcars-font-size-data); text-transform: uppercase;
  }
  .device-sensor-line:hover { background: rgba(255,255,255,0.05); }
  .device-sensor-line:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }
  .sensor-indicator { width: 0.5rem; height: 0.5rem; border-radius: 50%; flex-shrink: 0; }
  .sensor-label {
    flex: 1; color: var(--lcars-space-white);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.75rem;
  }
  .sensor-state-value { flex-shrink: 0; font-weight: 700; font-size: var(--lcars-font-size-data); }
  .battery-section-divider { height: 1px; background: var(--lcars-gray); opacity: 0.3; margin: 0.375rem 0; }
  .battery-section-label {
    font-family: var(--lcars-font); font-size: 0.55rem;
    color: var(--lcars-sky, #aaaaff); text-transform: uppercase;
    letter-spacing: 0.08em; padding: 0 0.5rem; margin-bottom: 0.125rem;
  }

  /* Viewscreen */
  .climate-viewscreen {
    grid-area: media;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    position: relative; cursor: pointer;
    border: 2px solid var(--panel-frame-color);
    border-radius: 4px; padding: 0.5rem;
    transition: border-color 600ms;
  }
  .climate-viewscreen::before,
  .climate-viewscreen::after {
    content: '';
    position: absolute;
    width: 1.5rem; height: 1.5rem;
    border: 2px solid var(--panel-frame-color);
  }
  .climate-viewscreen::before { top: 4px; left: 4px; border-right: none; border-bottom: none; }
  .climate-viewscreen::after { bottom: 4px; right: 4px; border-left: none; border-top: none; }
  .climate-arc { width: 100%; max-width: 200px; }

  /* Setpoint controls */
  .climate-setpoint-controls { display: flex; flex-direction: column; gap: 0.25rem; margin-top: 0.5rem; }
  .climate-setpoint-row { display: flex; align-items: center; gap: 0.5rem; justify-content: center; }
  .climate-sp-btn {
    width: 2.5rem; height: 2.5rem;
    border: none; border-radius: 50%;
    background: var(--lcars-disabled);
    color: var(--lcars-space-white);
    font-size: 1.25rem; font-family: var(--lcars-font);
    cursor: pointer; transition: background 200ms;
  }
  .climate-sp-btn:hover { background: var(--panel-frame-color); }
  .climate-sp-btn:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }
  .climate-sp-label {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    min-width: 6rem; text-align: center;
  }

  /* Mode strips */
  .climate-modes {
    grid-area: modes;
    display: flex; gap: var(--lcars-gap); flex-wrap: wrap;
  }
  .climate-mode-btn {
    flex: 1; min-width: 4rem;
    height: var(--lcars-btn-height);
    border: none; border-radius: var(--lcars-btn-radius);
    background: var(--lcars-disabled);
    color: var(--lcars-black);
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    text-transform: uppercase; cursor: pointer;
    transition: background 200ms;
  }
  .climate-mode-btn[data-active] { background: var(--panel-frame-color); }
  .climate-mode-btn:hover:not([data-active]) { background: var(--lcars-gray); }
  .climate-mode-btn:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }
  .climate-aux-controls {
    grid-area: auxctrl;
    display: flex; flex-direction: column; gap: var(--lcars-gap);
  }
  .climate-aux-strip { display: flex; gap: var(--lcars-gap); flex-wrap: wrap; }

  .panel-pip-strip {
    position: absolute;
    bottom: 4px; right: 4px;
    width: 2rem; height: 3px;
    background: var(--panel-frame-color);
    border-radius: 1.5px; opacity: 0.3;
  }
`;
