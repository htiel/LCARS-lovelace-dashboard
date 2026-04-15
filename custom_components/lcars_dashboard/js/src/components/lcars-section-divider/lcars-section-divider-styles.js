/**
 * lcars-section-divider-styles.js
 *
 * CSS module for <lcars-section-divider>.
 * Horizontal rule + optional label.
 *
 * Geordi fix: font-size 0.625rem (was 0.55rem — below WCAG minimum).
 *
 * Phase 0 — v4.17.0 Panel Extraction Architecture (4X-4)
 */
import { css } from 'lit-element';

export const sectionDividerStyles = css`
  :host {
    display: block;
  }

  .divider-line {
    height: 1px;
    background: var(--lcars-gray);
    opacity: 0.3;
    margin: 0.375rem 0;
  }

  .divider-label {
    font-family: var(--lcars-font);
    font-size: 0.625rem;
    color: var(--lcars-sky, #aaaaff);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding: 0 0.5rem;
    margin-bottom: 0.125rem;
  }
`;
