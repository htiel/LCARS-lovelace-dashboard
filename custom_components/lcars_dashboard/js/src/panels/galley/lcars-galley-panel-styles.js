/**
 * lcars-galley-panel-styles.js (4X-40)
 *
 * Styles for the Galley Systems panel (smart appliances).
 * GE Home, LG SmartThinQ — ovens, microwaves, fridges, dryers.
 */
import { css } from 'lit-element';

export const galleyPanelStyles = css`

  .galley-content {
    display: flex;
    flex-direction: column;
    gap: var(--lcars-gap);
  }

  .galley-section-label {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-label, 0.75rem);
    color: var(--lcars-gray);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding-bottom: 0.15rem;
    border-bottom: 2px solid var(--lcars-gray);
    margin-bottom: 0.25rem;
  }

  /* ─── Appliance Cards ─── */
  .galley-appliances {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
    gap: var(--lcars-gap);
  }

  .galley-appliance-card {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.5rem 0.75rem;
    border-left: 3px solid var(--appliance-color, var(--lcars-butterscotch));
    border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
    cursor: pointer;
    transition: background var(--lcars-transition);
  }
  .galley-appliance-card:hover { background: rgba(255,255,255,0.05); }
  .galley-appliance-card:focus-visible {
    outline: 2px solid var(--lcars-ice);
    outline-offset: 2px;
  }

  .galley-appliance-card[data-active] {
    border-left-color: var(--lcars-gold);
    background: rgba(255, 170, 0, 0.06);
  }

  .galley-appliance-name {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    color: var(--lcars-space-white);
    text-transform: uppercase;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .galley-status-row {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-family: var(--lcars-font);
    font-size: 0.75rem;
    text-transform: uppercase;
  }

  .galley-status-indicator {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .galley-status-label {
    color: var(--lcars-gray);
    flex: 1;
  }

  .galley-status-value {
    font-weight: 700;
    flex-shrink: 0;
  }

  .galley-timer {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-sub);
    color: var(--lcars-gold);
    font-weight: 700;
  }

  .galley-empty {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    color: var(--lcars-gray);
    text-transform: uppercase;
    text-align: center;
    padding: 2rem 1rem;
  }
  .galley-empty-inline { padding: 0.5rem 0; }

  /* ─── Section header w/ inline toggle ─── */
  .galley-section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    border-bottom: 2px solid var(--lcars-gray);
    padding-bottom: 0.15rem;
    margin-bottom: 0.25rem;
  }
  .galley-section-header .galley-section-label {
    border-bottom: 0;
    padding-bottom: 0;
    margin-bottom: 0;
  }
  .galley-stale-toggle {
    font-family: var(--lcars-font);
    font-size: 0.65rem;
    color: var(--lcars-black, #000);
    background: var(--lcars-african-violet);
    border: 0;
    border-radius: var(--lcars-btn-radius, 1.5rem);
    padding: 0.15rem 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    cursor: pointer;
  }
  .galley-stale-toggle[aria-pressed="true"] { background: var(--lcars-gold); }
  .galley-stale-toggle:focus-visible {
    outline: 2px solid var(--lcars-ice);
    outline-offset: 2px;
  }

  /* ─── PROBES Cluster (#226) ─── */
  .galley-probes {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
    gap: var(--lcars-gap);
  }
  .galley-probe-card {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    padding: 0.5rem 0.6rem;
    border-left: 3px solid var(--probe-color, var(--lcars-gray));
    border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
    cursor: pointer;
    transition: background var(--lcars-transition);
  }
  .galley-probe-card:hover { background: rgba(255,255,255,0.05); }
  .galley-probe-card:focus-visible {
    outline: 2px solid var(--lcars-ice);
    outline-offset: 2px;
  }
  .galley-probe-card[data-stale] { opacity: 0.55; }
  .galley-probe-head {
    display: flex;
    align-items: baseline;
    gap: 0.4rem;
    font-family: var(--lcars-font);
    text-transform: uppercase;
  }
  .galley-probe-name {
    font-size: var(--lcars-font-size-data);
    color: var(--lcars-space-white);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
  }
  .galley-probe-id {
    font-size: 0.65rem;
    color: var(--lcars-gray);
    font-variant-numeric: tabular-nums;
  }
  .galley-probe-stale {
    font-size: 0.6rem;
    color: var(--lcars-black, #000);
    background: var(--lcars-gray);
    padding: 0.05rem 0.4rem;
    border-radius: 0.5rem;
    letter-spacing: 0.08em;
  }
  .galley-probe-channels {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
  }
  .galley-probe-chip {
    display: inline-flex;
    align-items: baseline;
    gap: 0.25rem;
    padding: 0.1rem 0.4rem;
    background: rgba(255,255,255,0.05);
    border-radius: 0.5rem;
    font-family: var(--lcars-font);
    font-size: 0.7rem;
    text-transform: uppercase;
    color: var(--probe-color, var(--lcars-butterscotch));
  }
  .galley-probe-chip-empty {
    color: var(--lcars-gray);
    opacity: 0.5;
  }
  .galley-probe-chip-ch {
    color: var(--lcars-gray);
    font-size: 0.6rem;
  }
  .galley-probe-chip-val { font-weight: 700; font-variant-numeric: tabular-nums; }
  .galley-probe-foot {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    font-family: var(--lcars-font);
    font-size: 0.625rem;
    text-transform: uppercase;
    color: var(--lcars-gray);
  }
  .galley-probe-meta { font-variant-numeric: tabular-nums; }

  @media (max-width: 30rem) {
    .galley-appliances,
    .galley-probes {
      grid-template-columns: 1fr;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .galley-appliance-card {
      transition-duration: 0.01ms !important;
    }
  }
`;
