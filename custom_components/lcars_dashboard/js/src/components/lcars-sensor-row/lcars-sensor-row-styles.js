/**
 * lcars-sensor-row-styles.js
 *
 * CSS module for <lcars-sensor-row>.
 * Indicator dot + label + value layout.
 *
 * Phase 0 — v4.17.0 Panel Extraction Architecture (4X-4)
 */
import { css } from 'lit-element';

export const sensorRowStyles = css`
  :host {
    display: block;
  }

  .sensor-line {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0.5rem;
    cursor: pointer;
    border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
    transition: background var(--lcars-transition);
    font-size: var(--lcars-font-size-data);
    text-transform: uppercase;
  }

  .sensor-line:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  .sensor-line:focus-visible {
    outline: 2px solid var(--lcars-ice);
    outline-offset: 2px;
  }

  .sensor-indicator {
    width: 0.625rem;
    height: 0.625rem;
    border-radius: 50%;
    flex-shrink: 0;
    /* GEORDI-030: Boost indicator visibility — add subtle ring for low-contrast dots */
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.15);
  }

  .sensor-label {
    flex: 1;
    color: var(--lcars-space-white);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.75rem;
    min-width: 3rem;
  }

  .sensor-value {
    flex-shrink: 0;
    font-weight: 700;
    font-size: var(--lcars-font-size-data);
  }
`;
