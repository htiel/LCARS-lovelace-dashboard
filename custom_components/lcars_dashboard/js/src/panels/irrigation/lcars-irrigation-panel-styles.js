/**
 * lcars-irrigation-panel-styles.js
 *
 * CSS module for <lcars-irrigation-panel>.
 * 4-row grid: alert, sidebar+zones, quickrun, controls.
 * Zone photos, schedule strips, barberpole fill, controller status.
 *
 * v4.17.0 Panel Extraction Architecture (4X-4)
 * v4.18.2 Full Rachio integration redesign.
 */
import { css } from 'lit-element';

export const irrigationPanelStyles = css`
  :host {
    display: block;
    --panel-frame-color: var(--lcars-ice);
  }

  /* ─── Main Grid: 4 rows ─── */

  .irr-content {
    display: grid;
    grid-template-areas:
      "alert    alert"
      "sidebar  zones"
      "quickrun quickrun"
      "controls controls";
    grid-template-columns: minmax(8rem, 1fr) minmax(16rem, 3fr);
    grid-template-rows: auto 1fr auto auto;
    gap: var(--lcars-gap);
  }

  /* ─── Rain Alert Banner ─── */

  .irr-rain-alert {
    grid-area: alert;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.35rem 0.75rem;
    background: color-mix(in srgb, var(--alert-color) 12%, transparent);
    border-left: 4px solid var(--alert-color);
    border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    color: var(--alert-color);
    text-transform: uppercase;
    animation: irr-banner-in 300ms ease-out;
  }

  .irr-rain-alert ha-icon {
    --mdc-icon-size: 1rem;
    color: var(--alert-color);
  }

  .irr-rain-alert-label {
    flex: 1;
  }

  .irr-rain-cancel-btn {
    border: none;
    border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
    background: var(--lcars-tomato);
    color: var(--lcars-black);
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    text-transform: uppercase;
    padding: 0.2rem 0.6rem;
    cursor: pointer;
    min-height: 1.5rem;
  }

  .irr-rain-cancel-btn:focus-visible {
    outline: 2px solid var(--lcars-ice);
    outline-offset: 2px;
  }

  @keyframes irr-banner-in {
    from { opacity: 0; transform: translateY(-0.5rem); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ─── Sidebar: Schedules + Controller Status ─── */

  .irr-sidebar {
    grid-area: sidebar;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    overflow-y: auto;
  }

  .irr-section-label {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    color: var(--lcars-sunflower);
    text-transform: uppercase;
    padding-bottom: 0.15rem;
    border-bottom: 2px solid var(--lcars-gray);
    margin-bottom: 0.15rem;
  }

  /* ─── Schedule Strips ─── */

  .irr-schedules {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .irr-schedule-strip {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    flex-wrap: wrap;
  }

  .irr-schedule-toggle {
    min-width: 2.5rem;
    height: var(--lcars-btn-height, 2rem);
    border: none;
    border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    text-transform: uppercase;
    cursor: pointer;
    transition: background 200ms;
    background: var(--lcars-gray);
    color: var(--lcars-black);
  }

  .irr-schedule-toggle[data-on] {
    background: var(--lcars-ice);
  }

  .irr-schedule-toggle:focus-visible {
    outline: 2px solid var(--lcars-ice);
    outline-offset: 2px;
  }

  .irr-schedule-name {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    color: var(--lcars-space-white);
    text-transform: uppercase;
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .irr-schedule-type-badge {
    display: inline-block;
    padding: 0.1rem 0.4rem;
    border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
    font-family: var(--lcars-font);
    font-size: 0.65rem;
    text-transform: uppercase;
    background: var(--lcars-butterscotch);
    color: var(--lcars-black);
  }

  .irr-schedule-type-badge[data-flex] {
    background: var(--lcars-african-violet);
  }

  .irr-schedule-duration {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    color: var(--lcars-gray);
    text-transform: uppercase;
  }

  /* ─── Controller Status ─── */

  .irr-controller-status {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .irr-status-row {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    text-transform: uppercase;
  }

  .irr-status-bar {
    display: inline-block;
    width: 1.5rem;
    height: 0.375rem;
    border-radius: 0.1875rem;
    flex-shrink: 0;
    transition: background 200ms;
  }

  .irr-status-bar[data-state="on"]     { background: var(--lcars-ice); }
  .irr-status-bar[data-state="off"]    { background: var(--lcars-gray); }
  .irr-status-bar[data-state="alert"]  { background: var(--lcars-tomato); animation: irr-pulse 1.5s ease-in-out infinite; }
  .irr-status-bar[data-state="active"] { background: var(--lcars-gold); }
  .irr-status-bar[data-state="delay"]  { background: var(--lcars-african-violet); }

  .irr-status-label {
    color: var(--lcars-space-white);
  }

  @keyframes irr-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }

  /* ─── Zone Grid ─── */

  .irr-zones {
    grid-area: zones;
    display: flex;
    flex-direction: column;
    gap: var(--lcars-gap);
    overflow-y: auto;
  }

  .irr-zone-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    position: relative;
    flex-wrap: wrap;
    min-height: 2.5rem;
  }

  .irr-zone-row:focus-visible {
    outline: 2px solid var(--lcars-ice);
    outline-offset: 2px;
  }

  /* ─── Zone Thumbnail ─── */

  .irr-zone-thumb {
    width: 2.5rem;
    height: 2rem;
    border-radius: var(--lcars-btn-radius);
    overflow: hidden;
    border: 2px solid var(--zone-border, var(--lcars-sunflower));
    flex-shrink: 0;
    position: relative;
    cursor: pointer;
    background: var(--lcars-black);
  }

  .irr-zone-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .irr-zone-thumb-fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background: rgba(102, 102, 136, 0.15);
  }

  .irr-zone-thumb-fallback ha-icon {
    --mdc-icon-size: 1rem;
    color: var(--lcars-gray);
  }

  .irr-zone-num {
    position: absolute;
    bottom: 0;
    left: 0;
    padding: 0.05rem 0.25rem;
    background: rgba(0, 0, 0, 0.85);
    color: var(--lcars-sunflower);
    font-family: var(--lcars-font);
    font-size: 0.6rem;
    text-transform: uppercase;
    border-radius: 0 var(--lcars-btn-radius) 0 0;
    line-height: 1;
  }

  /* ─── Zone Button ─── */

  .irr-zone-btn {
    min-width: 4.5rem;
    height: var(--lcars-btn-height, 2rem);
    border: none;
    border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
    background: var(--lcars-sunflower);
    color: var(--lcars-black);
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    text-transform: uppercase;
    cursor: pointer;
    transition: background 200ms;
  }

  .irr-zone-btn[data-on] { background: var(--lcars-ice); }
  .irr-zone-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .irr-zone-btn:focus-visible {
    outline: 2px solid var(--lcars-ice);
    outline-offset: 2px;
  }

  /* ─── Zone Info ─── */

  .irr-zone-info {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    min-width: 0;
  }

  .irr-zone-name {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    color: var(--lcars-space-white);
    text-transform: uppercase;
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .irr-zone-status {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    text-transform: uppercase;
    flex-shrink: 0;
  }

  .irr-zone-countdown {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    color: var(--lcars-ice);
    text-transform: uppercase;
    flex-shrink: 0;
    font-variant-numeric: tabular-nums;
  }

  /* ─── Zone Fill Bar — Barberpole Flow ─── */

  .irr-zone-fill {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 0.5rem;
    border-radius: 0.25rem;
    background: var(--lcars-ice);
    transition: width 1s linear;
  }

  .irr-zone-fill.active {
    background:
      repeating-linear-gradient(
        -45deg,
        var(--lcars-ice) 0px,
        var(--lcars-ice) 4px,
        rgba(153, 204, 255, 0.4) 4px,
        rgba(153, 204, 255, 0.4) 8px
      );
    background-size: 11.31px 100%;
    animation: irr-flow 0.6s linear infinite;
  }

  @keyframes irr-flow {
    from { background-position: 0 0; }
    to   { background-position: 11.31px 0; }
  }

  /* ─── Zone Detail Expansion ─── */

  .irr-zone-detail {
    flex-basis: 100%;
    padding: 0.25rem 0 0.25rem 3rem;
    animation: irr-expand 200ms ease-out;
  }

  .irr-zone-attrs {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  .irr-zone-attr-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.15rem 0.5rem;
    background: rgba(102, 102, 136, 0.2);
    border-radius: 0 0.5rem 0.5rem 0;
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    color: var(--lcars-space-white);
    text-transform: uppercase;
  }

  .irr-zone-attr-badge ha-icon {
    --mdc-icon-size: 0.9rem;
    color: var(--badge-color, var(--lcars-sunflower));
  }

  .irr-zone-summary {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    color: var(--lcars-gray);
    text-transform: uppercase;
    padding-top: 0.15rem;
  }

  @keyframes irr-expand {
    from { opacity: 0; max-height: 0; }
    to   { opacity: 1; max-height: 4rem; }
  }

  /* ─── Quick Run Builder ─── */

  .irr-quickrun {
    grid-area: quickrun;
    border-top: 2px solid var(--lcars-gray);
    padding-top: 0.25rem;
  }

  .irr-quickrun-header {
    width: 100%;
    border: none;
    background: none;
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    color: var(--lcars-sunflower);
    text-transform: uppercase;
    cursor: pointer;
    text-align: left;
    padding: 0.25rem 0;
  }

  .irr-quickrun-header:focus-visible {
    outline: 2px solid var(--lcars-ice);
    outline-offset: 2px;
  }

  .irr-quickrun-body {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    padding: 0.25rem 0;
    animation: irr-expand 200ms ease-out;
  }

  .irr-quickrun-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .irr-quickrun-label {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    color: var(--lcars-gray);
    text-transform: uppercase;
    min-width: 5rem;
  }

  .irr-zone-selector,
  .irr-duration-selector {
    display: flex;
    gap: 0.25rem;
    flex-wrap: wrap;
  }

  .irr-zone-select-btn {
    width: 2rem;
    height: 2rem;
    border: none;
    border-radius: 0.25rem;
    background: var(--lcars-gray);
    color: var(--lcars-space-white);
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    cursor: pointer;
    transition: background 150ms;
    min-width: 2.5rem;
    min-height: 2.5rem;
  }

  .irr-zone-select-btn[data-selected] {
    background: var(--lcars-ice);
    color: var(--lcars-black);
  }

  .irr-zone-select-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .irr-zone-select-btn:focus-visible {
    outline: 2px solid var(--lcars-ice);
    outline-offset: 2px;
  }

  .irr-duration-btn {
    padding: 0.25rem 0.5rem;
    border: none;
    border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
    background: var(--lcars-gray);
    color: var(--lcars-space-white);
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    cursor: pointer;
    transition: background 150ms;
    min-height: 2.5rem;
  }

  .irr-duration-btn[data-selected] {
    background: var(--lcars-ice);
    color: var(--lcars-black);
  }

  .irr-duration-btn:focus-visible {
    outline: 2px solid var(--lcars-ice);
    outline-offset: 2px;
  }

  .irr-engage-btn {
    min-width: 10rem;
    height: var(--lcars-btn-height, 2rem);
    border: none;
    border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
    background: var(--lcars-butterscotch);
    color: var(--lcars-black);
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    text-transform: uppercase;
    cursor: pointer;
    transition: background 200ms;
    align-self: flex-start;
  }

  .irr-engage-btn:active { background: var(--lcars-gold); }
  .irr-engage-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .irr-engage-btn:focus-visible {
    outline: 2px solid var(--lcars-ice);
    outline-offset: 2px;
  }

  /* ─── Controls: Standby + Pause/Resume ─── */

  .irr-controls {
    grid-area: controls;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    padding: 0.25rem 0;
  }

  .irr-control-btn {
    min-width: 6rem;
    height: var(--lcars-btn-height, 2rem);
    border: none;
    border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
    background: var(--lcars-sunflower);
    color: var(--lcars-black);
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    text-transform: uppercase;
    cursor: pointer;
    transition: background 200ms;
  }

  .irr-control-btn[data-on] { background: var(--lcars-gold); }

  .irr-control-btn:focus-visible {
    outline: 2px solid var(--lcars-ice);
    outline-offset: 2px;
  }

  .irr-pause-btn { background: var(--lcars-butterscotch); }
  .irr-stop-btn  { background: var(--lcars-tomato); }

  /* ─── Reduced Motion ─── */

  @media (prefers-reduced-motion: reduce) {
    .irr-zone-fill.active,
    .irr-rain-alert,
    .irr-zone-detail,
    .irr-quickrun-body,
    .irr-status-bar[data-state="alert"] {
      animation: none !important;
    }
    .irr-zone-fill.active {
      background: var(--lcars-ice);
    }
  }
`;
