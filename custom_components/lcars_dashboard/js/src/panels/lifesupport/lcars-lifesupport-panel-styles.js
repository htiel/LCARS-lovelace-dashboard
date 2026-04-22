/**
 * lcars-lifesupport-panel-styles.js (4X-10)
 *
 * Styles for the Life Support composite panel.
 * Four layout configurations: full, atmos-only, climate-only, sensors-only.
 */
import { css } from 'lit-element';

export const lifeSupportPanelStyles = css`
  /* ─── Base Content ─── */

  .ls-content {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    width: 100%;
    overflow: visible;
  }

  .ls-empty {
    font-family: var(--lcars-font, 'Antonio', sans-serif);
    font-size: var(--lcars-font-size-data, 0.875rem);
    color: var(--lcars-gray, #666688);
    text-transform: uppercase;
    text-align: center;
    padding: 2rem 1rem;
  }

  /* ─── Full Layout: Dual Substations ─── */

  .ls-substations {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
    overflow: visible;
    align-items: start;
  }

  @media (max-width: 56rem) {
    .ls-substations {
      grid-template-columns: 1fr;
    }
  }

  .ls-substation {
    min-width: 0;
    min-height: 0;
    overflow: visible;
  }

  /* Nested panels should fill their substation */
  .ls-substation lcars-climate-panel,
  .ls-substation lcars-environment-panel {
    width: 100%;
  }

  /* ─── Sensor Hero Layout ─── */

  .ls-sensor-hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1.5rem 0;
  }

  .ls-hero-temp {
    font-family: var(--lcars-font, 'Antonio', sans-serif);
    font-size: var(--lcars-font-size-hero, 3.5rem);
    line-height: 1;
    text-transform: uppercase;
  }

  .ls-hero-unit {
    font-size: 0.5em;
    opacity: 0.7;
    margin-left: 0.125rem;
  }

  .ls-hero-humidity {
    font-family: var(--lcars-font, 'Antonio', sans-serif);
    font-size: var(--lcars-font-size-data, 0.875rem);
    color: var(--lcars-ice, #99ccff);
    margin-top: 0.5rem;
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    text-transform: uppercase;
  }

  .ls-hero-label {
    font-size: 0.75em;
    opacity: 0.6;
    letter-spacing: 0.05em;
  }

  /* ─── Ambient Sensor Row ─── */

  .ls-ambient-row {
    border-top: 2px solid var(--lcars-gray, #666688);
    padding-top: 0.5rem;
    margin-top: 0.25rem;
  }

  .ls-ambient-label {
    font-family: var(--lcars-font, 'Antonio', sans-serif);
    font-size: var(--lcars-font-size-label, 0.75rem);
    color: var(--lcars-gray, #666688);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 0.375rem;
  }

  .ls-ambient-readings {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1.5rem;
  }

  .ls-ambient-reading {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-family: var(--lcars-font, 'Antonio', sans-serif);
    font-size: var(--lcars-font-size-data, 0.875rem);
    text-transform: uppercase;
  }

  .ls-ambient-indicator {
    display: inline-block;
    width: 2px;
    height: 1rem;
    border-radius: 1px;
    flex-shrink: 0;
  }

  .ls-ambient-name {
    color: var(--lcars-gray, #666688);
    font-size: 0.85em;
  }

  .ls-ambient-value {
    font-variant-numeric: tabular-nums;
  }

  /* ─── Sparkline Tray ─── */

  .ls-sparkline-tray {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1rem;
    border-top: 2px solid var(--lcars-gray, #666688);
    padding-top: 0.5rem;
    margin-top: 0.25rem;
  }

  .ls-sparkline-slot {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.125rem;
    flex: 1 1 auto;
    min-width: 7rem;
  }

  .ls-sparkline-label {
    font-family: var(--lcars-font, 'Antonio', sans-serif);
    font-size: var(--lcars-font-size-label, 0.75rem);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    opacity: 0.8;
  }

  .ls-sparkline-slot svg {
    width: 100%;
    max-width: 120px;
    height: 24px;
  }

  /* ─── Sensor Array: passive AQ monitors (4X-46) ─── */

  .ls-sensor-array {
    border-top: 2px solid var(--lcars-gray, #666688);
    padding-top: 0.5rem;
    margin-top: 0.25rem;
  }

  .ls-sensor-array-header {
    display: flex;
    align-items: baseline;
    gap: 0.75rem;
    margin-bottom: 0.5rem;
  }

  .ls-sensor-array-label {
    font-family: var(--lcars-font, 'Antonio', sans-serif);
    font-size: var(--lcars-font-size-label, 0.75rem);
    color: var(--lcars-gray, #666688);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .ls-sensor-array-score {
    font-family: var(--lcars-font, 'Antonio', sans-serif);
    font-size: var(--lcars-font-size-data, 0.875rem);
    font-variant-numeric: tabular-nums;
  }

  .ls-sensor-array-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1.5rem;
  }

  .ls-aq-metric {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-family: var(--lcars-font, 'Antonio', sans-serif);
    font-size: var(--lcars-font-size-data, 0.875rem);
    text-transform: uppercase;
  }

  .ls-aq-indicator {
    display: inline-block;
    width: 2px;
    height: 1rem;
    border-radius: 1px;
    flex-shrink: 0;
  }

  .ls-aq-name {
    color: var(--lcars-gray, #666688);
    font-size: 0.85em;
  }

  .ls-aq-value {
    font-variant-numeric: tabular-nums;
  }

  /* Sensor-array-only layout: add some padding for standalone display */
  .ls-sensor-array-only .ls-sensor-array {
    border-top: none;
    padding-top: 0;
    margin-top: 0;
  }

  @media (max-width: 32rem) {
    .ls-sensor-array-grid {
      gap: 0.375rem 1rem;
    }
  }
`;
