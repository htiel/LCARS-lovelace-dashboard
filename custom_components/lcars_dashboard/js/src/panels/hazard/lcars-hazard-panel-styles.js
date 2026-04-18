/**
 * lcars-hazard-panel-styles.js (4X-39)
 *
 * Styles for the Hazard Detection panel (smoke/CO/heat detectors).
 * Per-device status grid, battery overview, self-test summary.
 */
import { css } from 'lit-element';

export const hazardPanelStyles = css`

  .hazard-content {
    display: flex;
    flex-direction: column;
    gap: var(--lcars-gap);
  }

  .hazard-section-label {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-label, 0.75rem);
    color: var(--lcars-gray);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding-bottom: 0.15rem;
    border-bottom: 2px solid var(--lcars-gray);
    margin-bottom: 0.25rem;
  }

  /* ─── Detector Status Grid ─── */
  .hazard-detectors {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
    gap: var(--lcars-gap);
  }

  .hazard-detector-card {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.5rem 0.75rem;
    border-left: 3px solid var(--detector-color, var(--lcars-sunflower));
    border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
    cursor: pointer;
    transition: background var(--lcars-transition);
  }
  .hazard-detector-card:hover { background: rgba(255,255,255,0.05); }
  .hazard-detector-card:focus-visible {
    outline: 2px solid var(--lcars-ice);
    outline-offset: 2px;
  }

  .hazard-detector-card[data-alert] {
    border-left-color: var(--lcars-tomato);
    background: rgba(255, 85, 85, 0.08);
  }

  .hazard-detector-name {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    color: var(--lcars-space-white);
    text-transform: uppercase;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .hazard-status-row {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-family: var(--lcars-font);
    font-size: 0.75rem;
    text-transform: uppercase;
  }

  .hazard-status-indicator {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .hazard-status-label {
    color: var(--lcars-gray);
    flex: 1;
  }

  .hazard-status-value {
    font-weight: 700;
    flex-shrink: 0;
  }

  /* ─── Battery Overview ─── */
  .hazard-batteries {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1rem;
  }

  .hazard-battery-chip {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    text-transform: uppercase;
  }

  .hazard-battery-bar {
    width: 2rem;
    height: 0.5rem;
    background: var(--lcars-gray);
    border-radius: 2px;
    overflow: hidden;
  }

  .hazard-battery-fill {
    height: 100%;
    border-radius: inherit;
    transition: width 1s ease;
  }

  .hazard-empty {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    color: var(--lcars-gray);
    text-transform: uppercase;
    text-align: center;
    padding: 2rem 1rem;
  }

  @media (max-width: 30rem) {
    .hazard-detectors {
      grid-template-columns: 1fr;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .hazard-detector-card {
      transition-duration: 0.01ms !important;
    }
  }
`;
