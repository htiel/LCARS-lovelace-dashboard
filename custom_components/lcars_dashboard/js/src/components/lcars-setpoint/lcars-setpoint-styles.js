/**
 * lcars-setpoint-styles.js
 *
 * CSS module for <lcars-setpoint>.
 * Minus/Plus buttons flanking a value label.
 *
 * Phase 3 — v4.17.0 Panel Extraction Architecture (4X-4)
 */
import { css } from 'lit-element';

export const setpointStyles = css`
  :host {
    display: inline-flex;
    --sp-color: var(--lcars-sunflower);
  }

  .setpoint-control {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  }

  .sp-btn {
    width: 3rem;
    height: 2.5rem;
    border: none;
    border-radius: 0;
    background: var(--sp-color);
    color: var(--lcars-black, #000);
    font-family: var(--lcars-font);
    font-size: 1.2rem;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 200ms;
    line-height: 1;
    padding: 0;
  }
  .sp-btn.sp-dec { border-radius: 1.5rem 0 0 1.5rem; }
  .sp-btn.sp-inc { border-radius: 0 1.5rem 1.5rem 0; }

  .sp-btn:hover { opacity: 0.8; }
  .sp-btn:active { opacity: 0.6; }
  .sp-btn:disabled { opacity: 0.3; cursor: not-allowed; }
  .sp-btn:focus-visible {
    outline: 2px solid var(--lcars-ice, #99ccff);
    outline-offset: 2px;
  }

  .sp-label {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-sub, 0.9rem);
    color: var(--sp-color);
    text-transform: uppercase;
    min-width: 3rem;
    text-align: center;
    white-space: nowrap;
  }
`;
