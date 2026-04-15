/**
 * lcars-weather-panel-styles.js
 *
 * CSS module for <lcars-weather-panel>.
 * Weather viewscreen, wind compass, 7-day forecast strip.
 *
 * v4.17.0 Panel Extraction Architecture (4X-6)
 */
import { css } from 'lit-element';

export const weatherPanelStyles = css`
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
    transition: border-color 600ms;
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

  .weather-content {
    display: grid;
    grid-template-areas:
      "sensors  media"
      "forecast forecast";
    grid-template-columns: minmax(10rem, 1fr) minmax(14rem, 2fr);
    grid-template-rows: 1fr auto;
    gap: var(--lcars-gap);
  }

  .weather-header { grid-area: header; display: flex; align-items: center; gap: 0.5rem; }
  .device-panel-name { font-size: var(--lcars-font-size-sub); color: var(--panel-frame-color); text-transform: uppercase; white-space: nowrap; }
  .device-panel-header-line { flex: 1; height: 2px; background: var(--panel-frame-color); opacity: 0.5; }
  .panel-numeric-code { font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); color: var(--panel-frame-color); opacity: 0.7; white-space: nowrap; }
  .weather-condition-badge { font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); text-transform: uppercase; }

  .weather-sensors { grid-area: sensors; overflow-y: auto; }
  .device-sensor-line { display: flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0.5rem; cursor: pointer; border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0; transition: background var(--lcars-transition); font-size: var(--lcars-font-size-data); text-transform: uppercase; }
  .device-sensor-line:hover { background: rgba(255,255,255,0.05); }
  .device-sensor-line:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }
  .sensor-indicator { width: 0.5rem; height: 0.5rem; border-radius: 50%; flex-shrink: 0; }
  .sensor-label { flex: 1; color: var(--lcars-space-white); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.75rem; }
  .sensor-state-value { flex-shrink: 0; font-weight: 700; font-size: var(--lcars-font-size-data); }

  /* Viewscreen */
  .weather-viewscreen {
    grid-area: media; display: flex; flex-direction: column; align-items: center;
    border: 2px solid var(--panel-frame-color); border-radius: 4px;
    padding: 0.5rem; transition: border-color 600ms; position: relative;
  }
  .weather-viewscreen::before, .weather-viewscreen::after {
    content: ''; position: absolute; width: 1.5rem; height: 1.5rem;
    border: 2px solid var(--panel-frame-color);
  }
  .weather-viewscreen::before { top: 4px; left: 4px; border-right: none; border-bottom: none; }
  .weather-viewscreen::after { bottom: 4px; right: 4px; border-left: none; border-top: none; }
  .weather-display { width: 100%; max-width: 200px; }

  /* Wind compass */
  .weather-wind-compass { display: flex; flex-direction: column; align-items: center; gap: 0.25rem; }
  .wind-svg { width: 5rem; height: 5rem; }
  .wind-reading { font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); color: var(--lcars-data-accent); }

  /* Forecast strip */
  .weather-forecast { grid-area: forecast; display: flex; gap: var(--lcars-gap); overflow-x: auto; padding: 0.25rem 0; }
  .forecast-tile {
    flex: 1; min-width: 5rem; display: flex; flex-direction: column;
    align-items: center; gap: 0.125rem; padding: 0.25rem;
    font-family: var(--lcars-font); font-size: var(--lcars-font-size-data);
  }
  .forecast-tile:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }
  .forecast-day { color: var(--lcars-data-accent); }
  .forecast-glyph { font-size: 1.25rem; }
  .forecast-hi { color: var(--lcars-butterscotch); }
  .forecast-lo { color: var(--lcars-ice); }
  .forecast-range-bar { width: 100%; height: 4px; background: var(--lcars-disabled); border-radius: 2px; position: relative; }
  .forecast-range-fill { position: absolute; height: 100%; background: linear-gradient(90deg, var(--lcars-ice), var(--lcars-butterscotch)); border-radius: 2px; }
  .forecast-precip { color: var(--lcars-gray); font-size: 0.75rem; }

  .panel-pip-strip { position: absolute; bottom: 4px; right: 4px; width: 2rem; height: 3px; background: var(--panel-frame-color); border-radius: 1.5px; opacity: 0.3; }
`;
