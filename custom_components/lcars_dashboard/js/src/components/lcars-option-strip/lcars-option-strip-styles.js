/**
 * lcars-option-strip-styles.js
 *
 * CSS module for <lcars-option-strip>.
 * Unifies 3 CSS variants (option buttons, climate mode, alarm arm) into one.
 * LCARS pill-shape radiogroup selector.
 *
 * Phase 3 — v4.17.0 Panel Extraction Architecture (4X-4)
 */
import { css } from 'lit-element';

export const optionStripStyles = css`
  :host {
    display: block;
    --strip-accent: var(--lcars-sunflower);
  }

  .option-strip {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
    padding: 0.25rem 0;
  }

  .option-btn {
    min-width: 4rem;
    height: var(--lcars-btn-height, 1.75rem);
    border: none;
    border-radius: 0 var(--lcars-btn-radius, 1rem) var(--lcars-btn-radius, 1rem) 0;
    background: var(--lcars-card-bg-color, #1a1a2e);
    color: var(--lcars-space-white, #ccc);
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data, 0.75rem);
    text-transform: uppercase;
    cursor: pointer;
    transition: background 200ms, color 200ms;
    padding: 0 0.75rem;
    white-space: nowrap;
  }

  .option-btn:hover:not([aria-disabled="true"]) {
    background: rgba(255, 255, 255, 0.08);
  }

  .option-btn[aria-checked="true"] {
    background: var(--strip-accent);
    color: var(--lcars-black, #000);
    font-weight: 700;
  }

  .option-btn[aria-disabled="true"] {
    opacity: 0.35;
    cursor: not-allowed;
  }

  .option-btn:focus-visible {
    outline: 2px solid var(--lcars-ice, #88f);
    outline-offset: 2px;
  }
`;
