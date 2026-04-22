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
    grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
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

  @media (max-width: 30rem) {
    .galley-appliances {
      grid-template-columns: 1fr;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .galley-appliance-card {
      transition-duration: 0.01ms !important;
    }
  }
`;
