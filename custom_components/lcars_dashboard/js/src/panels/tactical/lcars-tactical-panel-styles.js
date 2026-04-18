/**
 * lcars-tactical-panel-styles.js (4X-42)
 *
 * Styles for the Tactical composite panel.
 * Alarm control + access points + perimeter + motion sensors.
 */
import { css } from 'lit-element';

export const tacticalPanelStyles = css`

  /* ─── Tactical Content Grid ─── */

  .tactical-content {
    display: grid;
    grid-template-areas:
      "alarm   access"
      "perim   perim"
      "motion  motion"
      "keypad  keypad";
    grid-template-columns: minmax(14rem, 2fr) minmax(10rem, 1fr);
    grid-template-rows: auto auto auto auto;
    gap: var(--lcars-gap);
  }

  .tactical-content.no-alarm {
    grid-template-areas:
      "access access"
      "perim  perim"
      "motion motion";
  }

  .tactical-content.alarm-only {
    grid-template-areas:
      "alarm alarm"
      "keypad keypad";
    grid-template-columns: 1fr;
  }

  .tactical-content.sensors-only {
    grid-template-areas:
      "perim"
      "motion";
    grid-template-columns: 1fr;
  }

  @media (max-width: 30rem) {
    .tactical-content {
      grid-template-areas: "alarm" "access" "perim" "motion" "keypad";
      grid-template-columns: 1fr;
    }
  }

  /* ─── Section Labels ─── */

  .tactical-section-label {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-label, 0.75rem);
    color: var(--lcars-gray);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding-bottom: 0.15rem;
    border-bottom: 2px solid var(--lcars-gray);
    margin-bottom: 0.25rem;
  }

  /* ─── Alarm Substation ─── */

  .tactical-alarm {
    grid-area: alarm;
  }

  /* ─── Access Points (locks, covers) ─── */

  .tactical-access {
    grid-area: access;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .tactical-access-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0.75rem;
    border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    text-transform: uppercase;
    cursor: pointer;
    transition: background var(--lcars-transition), filter var(--lcars-transition);
    min-height: var(--lcars-btn-height, 2rem);
  }

  .tactical-access-row:hover { filter: brightness(1.15); }
  .tactical-access-row:focus-visible {
    outline: 2px solid var(--lcars-ice);
    outline-offset: 2px;
  }

  .tactical-access-row[data-secure] {
    background: var(--lcars-sunflower);
    color: var(--lcars-black);
  }
  .tactical-access-row[data-breach] {
    background: var(--lcars-tomato);
    color: var(--lcars-black);
  }

  .tactical-access-indicator {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .tactical-access-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tactical-access-state {
    flex-shrink: 0;
    font-weight: 700;
  }

  /* ─── Perimeter (door/window sensors) ─── */

  .tactical-perimeter {
    grid-area: perim;
    display: flex;
    flex-wrap: wrap;
    gap: var(--lcars-gap);
  }

  .tactical-perim-chip {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.25rem 0.75rem;
    border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    text-transform: uppercase;
    min-width: 8rem;
    cursor: pointer;
    transition: background var(--lcars-transition);
  }

  .tactical-perim-chip:hover { background: rgba(255,255,255,0.05); }
  .tactical-perim-chip:focus-visible {
    outline: 2px solid var(--lcars-ice);
    outline-offset: 2px;
  }

  .tactical-perim-chip[data-open] {
    background: var(--lcars-butterscotch);
    color: var(--lcars-black);
  }
  .tactical-perim-chip[data-closed] {
    background: var(--lcars-gray);
    color: var(--lcars-space-white);
  }

  /* ─── Motion Sensors ─── */

  .tactical-motion {
    grid-area: motion;
    display: flex;
    flex-wrap: wrap;
    gap: var(--lcars-gap);
  }

  .tactical-motion-chip {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.25rem 0.75rem;
    border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    text-transform: uppercase;
    min-width: 8rem;
    cursor: pointer;
    transition: background var(--lcars-transition);
  }

  .tactical-motion-chip:hover { background: rgba(255,255,255,0.05); }
  .tactical-motion-chip:focus-visible {
    outline: 2px solid var(--lcars-ice);
    outline-offset: 2px;
  }

  .tactical-motion-chip[data-detected] {
    background: var(--lcars-butterscotch);
    color: var(--lcars-black);
  }
  .tactical-motion-chip[data-clear] {
    background: var(--lcars-gray);
    color: var(--lcars-space-white);
  }

  .chip-indicator {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .chip-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .chip-state {
    flex-shrink: 0;
    font-weight: 700;
    font-size: var(--lcars-font-size-data);
  }

  /* ─── Keypad (from alarm substation) ─── */

  .tactical-keypad {
    grid-area: keypad;
  }

  /* ─── Empty State ─── */

  .tactical-empty {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    color: var(--lcars-gray);
    text-transform: uppercase;
    text-align: center;
    padding: 2rem 1rem;
  }

  @media (prefers-reduced-motion: reduce) {
    .tactical-access-row,
    .tactical-perim-chip,
    .tactical-motion-chip {
      transition-duration: 0.01ms !important;
    }
  }
`;
