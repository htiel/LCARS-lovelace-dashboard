/**
 * lcars-climate-panel-styles.js
 *
 * CSS module for <lcars-climate-panel>.
 * Segmented temperature arc, LCARS endcap setpoint buttons,
 * connected mode strips, mini-elbow viewscreen brackets.
 *
 * v4.17.0 Panel Extraction Architecture (4X-4)
 * v4.18.0 Visual Refresh (4X-8) — All 7 LCARS compliance fixes
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

  /* Compliance #5: mini-bars not dots — 2px × 1rem vertical bars */
  .sensor-indicator-bar { width: 2px; height: 1rem; border-radius: 1px; flex-shrink: 0; }
  /* Legacy dot class kept for backward compatibility */
  .sensor-indicator { width: 0.5rem; height: 0.5rem; border-radius: 50%; flex-shrink: 0; }

  .sensor-label {
    flex: 1; color: var(--lcars-space-white);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    font-size: var(--lcars-font-size-data); /* Compliance #3: use LCARS 3-tier font, not 0.75rem */
  }
  .sensor-state-value { flex-shrink: 0; font-weight: 700; font-size: var(--lcars-font-size-data); }
  .battery-section-divider { height: 1px; background: var(--lcars-gray); opacity: 0.3; margin: 0.375rem 0; }
  .battery-section-label {
    font-family: var(--lcars-font); font-size: var(--lcars-font-size-label, 0.75rem);
    color: var(--lcars-sky, #aaaaff); text-transform: uppercase;
    letter-spacing: 0.08em; padding: 0 0.5rem; margin-bottom: 0.125rem;
  }

  /* Viewscreen — Compliance #1: explicit black bg, not inherited */
  .climate-viewscreen {
    grid-area: media;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    position: relative; cursor: pointer;
    background: var(--lcars-black, #000); /* Compliance #1: no lavender bleed */
    border: 2px solid var(--panel-frame-color);
    border-radius: 4px; padding: 0.5rem;
    transition: border-color 600ms;
  }
  /* Compliance #6: mini-elbow brackets with thick→thin asymmetry */
  .climate-viewscreen::before {
    content: '';
    position: absolute;
    top: 4px; left: 4px;
    width: 1.5rem; height: 1.5rem;
    border-top: 3px solid var(--panel-frame-color); /* thick */
    border-left: 3px solid var(--panel-frame-color); /* thick */
    border-right: none; border-bottom: none;
    border-radius: 0.5rem 0 0 0; /* mini-elbow corner */
  }
  .climate-viewscreen::after {
    content: '';
    position: absolute;
    bottom: 4px; right: 4px;
    width: 1.5rem; height: 1.5rem;
    border-bottom: 1px solid var(--panel-frame-color); /* thin */
    border-right: 1px solid var(--panel-frame-color); /* thin */
    border-left: none; border-top: none;
    border-radius: 0 0 0.25rem 0;
  }
  .climate-arc { width: 100%; max-width: 200px; }

  /* Arc halo drift animation (active HVAC only) */
  .arc-halo-active {
    stroke-dasharray: 6 4;
    animation: arc-halo-drift var(--lcars-anim-ambient) linear infinite;
  }
  @keyframes arc-halo-drift {
    from { stroke-dashoffset: 0; }
    to { stroke-dashoffset: 40; }
  }

  /* HVAC action feedback bar — 3px flat pulse bar below viewscreen */
  .climate-action-bar {
    width: 100%; height: 3px;
    margin-top: 0.25rem;
    border-radius: 1.5px;
    background: var(--action-color);
    animation: action-bar-pulse 2s ease-in-out infinite;
  }
  @keyframes action-bar-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  /* Setpoint controls — Compliance #3: LCARS endcap pills, not circles */
  .climate-setpoint-controls { display: flex; flex-direction: column; gap: 0.25rem; margin-top: 0.5rem; }
  .climate-setpoint-row { display: flex; align-items: center; gap: 0.5rem; justify-content: center; }
  .climate-sp-btn {
    width: 3rem; height: 2.5rem;
    border: none;
    background: var(--lcars-disabled);
    color: var(--lcars-space-white);
    font-size: 1.25rem; font-family: var(--lcars-font);
    cursor: pointer; transition: background 200ms;
  }
  .climate-sp-btn:hover { background: var(--panel-frame-color); }
  .climate-sp-btn:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }
  /* Decrement: rounded-left, flat-right */
  .climate-sp-btn.sp-decrement {
    border-radius: var(--lcars-btn-radius) 0 0 var(--lcars-btn-radius);
  }
  /* Increment: flat-left, rounded-right */
  .climate-sp-btn.sp-increment {
    border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
  }
  .climate-sp-label {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    min-width: 6rem; text-align: center;
  }

  /* Mode strips — Compliance #2: connected strip, first rounded-left, last rounded-right */
  .climate-modes {
    grid-area: modes;
    display: flex; gap: 1px; flex-wrap: wrap;
  }
  .climate-mode-btn {
    flex: 1; min-width: 4rem;
    height: var(--lcars-btn-height);
    border: none;
    border-radius: 0; /* default: flat both sides (middle buttons) */
    background: var(--lcars-disabled);
    color: var(--lcars-black);
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    text-transform: uppercase; cursor: pointer;
    transition: background 200ms;
  }
  .climate-mode-btn.mode-first {
    border-radius: var(--lcars-btn-radius) 0 0 var(--lcars-btn-radius);
  }
  .climate-mode-btn.mode-last {
    border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
  }
  /* Single button (both first and last) */
  .climate-mode-btn.mode-first.mode-last {
    border-radius: var(--lcars-btn-radius);
  }
  .climate-mode-btn[data-active] { background: var(--panel-frame-color); }
  .climate-mode-btn:hover:not([data-active]) { background: var(--lcars-gray); }
  .climate-mode-btn:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }
  .climate-aux-controls {
    grid-area: auxctrl;
    display: flex; flex-direction: column; gap: var(--lcars-gap);
  }
  .climate-aux-strip { display: flex; gap: 1px; flex-wrap: wrap; align-items: center; }

  /* 4X-56: Toggle-style aux button for portable AC switches */
  .climate-toggle-btn { display: flex; align-items: center; gap: 0.375rem; }
  .climate-toggle-btn ha-icon { --mdc-icon-size: 14px; flex-shrink: 0; }
  .climate-toggle-btn[data-active] { background: var(--toggle-active-bg, var(--lcars-gold)); color: var(--lcars-black); }

  /* 4X-56: Inline label for aux number controls */
  .climate-aux-inline-label { font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); color: var(--lcars-text-heading, var(--lcars-sunflower)); text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap; margin-right: 0.5rem; }
  .climate-timer-value { font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); color: var(--lcars-gold, var(--lcars-sunflower)); text-transform: uppercase; font-weight: 700; min-width: 3rem; text-align: center; }

  .panel-pip-strip {
    position: absolute;
    bottom: 4px; right: 4px;
    width: 2rem; height: 3px;
    background: var(--panel-frame-color);
    border-radius: 1.5px; opacity: 0.3;
  }

  /* Animation budget: all gated behind reduced-motion preference */
  @media (max-width: 30rem) {
    .climate-content {
      grid-template-areas: "media" "sensors" "modes" "auxctrl";
      grid-template-columns: 1fr;
      grid-template-rows: auto auto auto auto;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .arc-halo-active,
    .climate-action-bar {
      animation: none;
    }
  }
`;
