/**
 * lcars-viewport-panel-styles.js (4X-41)
 *
 * Styles for the Viewport Controls panel (blinds/shades/covers).
 */
import { css } from 'lit-element';

export const viewportPanelStyles = css`

  .viewport-content {
    display: flex;
    flex-direction: column;
    gap: var(--lcars-gap);
  }

  .viewport-cover-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.375rem 0.75rem;
    border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    text-transform: uppercase;
    transition: background var(--lcars-transition);
    cursor: pointer;
    min-height: var(--lcars-btn-height, 2rem);
  }

  .viewport-cover-row:hover { background: rgba(255,255,255,0.05); }
  .viewport-cover-row:focus-visible {
    outline: 2px solid var(--lcars-ice);
    outline-offset: 2px;
  }

  .viewport-indicator {
    width: 2px;
    height: 1rem;
    border-radius: 1px;
    flex-shrink: 0;
  }

  .viewport-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .viewport-position {
    font-weight: 700;
    flex-shrink: 0;
    min-width: 3rem;
    text-align: right;
  }

  .viewport-controls {
    display: flex;
    gap: 0.25rem;
    flex-shrink: 0;
  }

  .viewport-btn {
    width: 2rem;
    height: 2rem;
    border: none;
    border-radius: var(--lcars-btn-radius);
    background: var(--lcars-sunflower);
    color: var(--lcars-black);
    font-family: var(--lcars-font);
    font-size: 0.875rem;
    cursor: pointer;
    transition: background 200ms;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .viewport-btn:hover { filter: brightness(1.15); }
  .viewport-btn:focus-visible {
    outline: 2px solid var(--lcars-ice);
    outline-offset: 2px;
  }
  .viewport-btn[data-active] { background: var(--lcars-gold); }

  .viewport-empty {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    color: var(--lcars-gray);
    text-transform: uppercase;
    text-align: center;
    padding: 2rem 1rem;
  }

  @media (prefers-reduced-motion: reduce) {
    .viewport-cover-row,
    .viewport-btn {
      transition-duration: 0.01ms !important;
    }
  }
`;
