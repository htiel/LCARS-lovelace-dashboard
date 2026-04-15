/**
 * lcars-irrigation-panel-styles.js
 *
 * CSS module for <lcars-irrigation-panel>.
 * Grid layout, zone buttons, schedule readouts, standby toggle.
 *
 * v4.17.0 Panel Extraction Architecture (4X-4)
 */
import { css } from 'lit-element';

export const irrigationPanelStyles = css`
  :host {
    display: block;
    --panel-frame-color: var(--lcars-ice);
  }

  .irrigation-content {
    display: grid;
    grid-template-areas:
      "schedule zones"
      "standby  standby";
    grid-template-columns: minmax(8rem, 1fr) minmax(16rem, 3fr);
    grid-template-rows: 1fr auto;
    gap: var(--lcars-gap);
  }

  /* Schedule sensors — left column */
  .irrigation-schedule {
    grid-area: schedule;
    overflow-y: auto;
  }

  /* Zone controls — right column */
  .irrigation-zones {
    grid-area: zones;
    display: flex;
    flex-direction: column;
    gap: var(--lcars-gap);
    overflow-y: auto;
  }
  .irrigation-zone-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    position: relative;
  }
  .irrigation-zone-row:focus-visible {
    outline: 2px solid var(--lcars-ice);
    outline-offset: 2px;
  }
  .irrigation-zone-btn {
    min-width: 4.5rem;
    height: var(--lcars-btn-height);
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
  .irrigation-zone-btn[data-on] { background: var(--lcars-ice); }
  .irrigation-zone-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .irrigation-zone-btn:focus-visible {
    outline: 2px solid var(--lcars-ice);
    outline-offset: 2px;
  }
  .irrigation-zone-name {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    color: var(--lcars-space-white);
    flex: 1;
  }
  .irrigation-zone-status {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    text-transform: uppercase;
  }
  .irrigation-zone-fill {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 0.5rem;
    border-radius: 0.25rem;
    transition: width 1s linear;
  }

  /* Standby toggle — bottom */
  .irrigation-standby {
    grid-area: standby;
    display: flex;
    justify-content: center;
    padding: 0.25rem;
  }
  .irrigation-standby-btn {
    min-width: 10rem;
    height: var(--lcars-btn-height);
    border: none;
    border-radius: var(--lcars-btn-radius);
    background: var(--lcars-sunflower);
    color: var(--lcars-black);
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    text-transform: uppercase;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    justify-content: center;
    transition: background 200ms;
  }
  .irrigation-standby-btn[data-on] { background: var(--lcars-ice); }
  .irrigation-standby-btn:focus-visible {
    outline: 2px solid var(--lcars-ice);
    outline-offset: 2px;
  }
`;
