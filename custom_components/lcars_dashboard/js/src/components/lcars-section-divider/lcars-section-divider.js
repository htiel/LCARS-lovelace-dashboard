/**
 * lcars-section-divider.js
 *
 * <lcars-section-divider> — Thin horizontal rule with an optional label.
 * Used inside battery panels and environment panels to separate
 * diagnostic/config entity groups.
 *
 * Attributes:
 *   label — Optional text label (e.g. "CONFIG", "DIAGNOSTIC")
 *
 * Phase 0 — v4.17.0 Panel Extraction Architecture (4X-4)
 */
import { defineLcars } from '../../lcars-helpers.js';
import { LitElement, html } from 'lit-element';
import { sectionDividerStyles } from './lcars-section-divider-styles.js';

class LcarsSectionDivider extends LitElement {

  static get properties() {
    return {
      label: { type: String },
    };
  }

  constructor() {
    super();
    this.label = '';
  }

  static get styles() {
    return [sectionDividerStyles];
  }

  render() {
    return html`
      <div class="divider-line"></div>
      ${this.label ? html`
        <div class="divider-label">${this.label}</div>
      ` : ''}
    `;
  }
}

if (!customElements.get('lcars-section-divider')) {
  defineLcars('lcars-section-divider', LcarsSectionDivider);
}
