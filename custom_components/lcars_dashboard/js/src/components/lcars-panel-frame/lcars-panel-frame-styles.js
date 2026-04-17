/**
 * lcars-panel-frame-styles.js
 *
 * CSS module for <lcars-panel-frame>.
 * Frame border, corner brackets, header bar, slot grid.
 * INVARIANT: thick→thin border (Bracer Jack Rule 2)
 * Left+Bottom = 4px, Top+Right = 2px. Corner brackets match.
 *
 * Phase 0 — v4.17.0 Panel Extraction Architecture (4X-4)
 */
import { css } from 'lit-element';

export const panelFrameStyles = css`
  :host {
    display: block;
  }

  .lcars-panel-frame {
    --panel-frame-color: var(--frame-color-override, var(--lcars-butterscotch));
    display: flex;
    flex-direction: column;
    gap: var(--lcars-gap);
    width: 100%;
    max-width: var(--panel-max-width, 42rem);
    border-left: 4px solid var(--panel-frame-color);
    border-bottom: 4px solid var(--panel-frame-color);
    border-top: 2px solid var(--panel-frame-color);
    border-right: 2px solid var(--panel-frame-color);
    border-radius: 0.75rem 0.25rem 0.25rem 0.75rem;
    padding: var(--lcars-gap);
    background: var(--lcars-black);
    position: relative;
  }

  /* Corner bracket — top-left */
  .lcars-panel-frame::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -4px;
    width: 1.5rem;
    height: 1.5rem;
    border-top: 4px solid var(--panel-frame-color);
    border-left: 4px solid var(--panel-frame-color);
    border-radius: 0.75rem 0 0 0;
    pointer-events: none;
  }

  /* Corner bracket — bottom-right */
  .lcars-panel-frame::after {
    content: '';
    position: absolute;
    bottom: -4px;
    right: -2px;
    width: 1.5rem;
    height: 1.5rem;
    border-bottom: 4px solid var(--panel-frame-color);
    border-right: 2px solid var(--panel-frame-color);
    border-radius: 0 0 0.25rem 0;
    pointer-events: none;
  }

  /* Header bar */
  .panel-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0.5rem;
  }

  .panel-name {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-sub);
    color: var(--panel-frame-color);
    text-transform: uppercase;
    white-space: nowrap;
  }

  .panel-header-line {
    flex: 1;
    height: 2px;
    background: var(--panel-frame-color);
    opacity: 0.5;
  }

  .panel-code {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    color: var(--panel-frame-color);
    opacity: 0.7;
    white-space: nowrap;
  }

  /* Badge slot */
  ::slotted([slot="badge"]) {
    font-family: var(--lcars-font);
    font-size: var(--lcars-font-size-data);
    text-transform: uppercase;
    white-space: nowrap;
  }

  /* Content area */
  .panel-content {
    flex: 1;
    min-height: 0;
    overflow: visible;
  }
`;
