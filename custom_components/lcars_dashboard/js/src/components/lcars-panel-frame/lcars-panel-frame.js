/**
 * lcars-panel-frame.js
 *
 * <lcars-panel-frame> — Reusable LCARS device panel frame.
 * Renders the bordered frame, header bar (name + code), and slot areas
 * for sensors, media, and controls. Used by all extracted panels.
 *
 * Attributes:
 *   panel-name  — Display name for the panel header
 *   panel-code  — 6-digit code shown at right of header
 *   frame-color — CSS custom property value for border color
 *   panel-type  — String identifier (e.g. "irrigation", "climate")
 *
 * Slots:
 *   sensors  — Left column (sensor readouts)
 *   media    — Right column (viewscreen / main content)
 *   controls — Bottom row (buttons, toggles)
 *   default  — Falls into controls area
 *
 * Geordi fix: role="region" + aria-label for screen readers.
 * Geordi fix: data-lcars-panel attribute for cascade-in animation selector.
 *
 * Phase 0 — v4.17.0 Panel Extraction Architecture (4X-4)
 */
import { LitElement, html } from 'lit-element';
import { sharedKeyframes, sharedReducedMotion } from '../../lcars-shared-animations.js';
import { panelFrameStyles } from './lcars-panel-frame-styles.js';

class LcarsPanelFrame extends LitElement {

  static get properties() {
    return {
      panelName:  { type: String, attribute: 'panel-name' },
      panelCode:  { type: String, attribute: 'panel-code' },
      frameColor: { type: String, attribute: 'frame-color' },
      panelType:  { type: String, attribute: 'panel-type' },
    };
  }

  constructor() {
    super();
    this.panelName = '';
    this.panelCode = '';
    this.frameColor = 'var(--lcars-butterscotch)';
    this.panelType = '';
  }

  static get styles() {
    return [sharedKeyframes, sharedReducedMotion, panelFrameStyles];
  }

  render() {
    return html`
      <div class="lcars-panel-frame"
        role="region"
        aria-label="${this.panelName} panel"
        data-lcars-panel="${this.panelType}"
        data-panel-type="${this.panelType}"
        style="--frame-color-override:${this.frameColor}">
        <div class="panel-header">
          <span class="panel-name">${this.panelName}</span>
          <div class="panel-header-line"></div>
          <slot name="badge"></slot>
          ${this.panelCode ? html`
            <span class="panel-code" aria-hidden="true">${this.panelCode}</span>
          ` : ''}
        </div>
        <div class="panel-content">
          <slot></slot>
        </div>
      </div>
    `;
  }
}

if (!customElements.get('lcars-panel-frame')) {
  customElements.define('lcars-panel-frame', LcarsPanelFrame);
}
