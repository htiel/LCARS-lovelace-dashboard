/**
 * lcars-sensor-row.js
 *
 * <lcars-sensor-row> — Reusable sensor readout line for device panels.
 * Renders: indicator dot + label + value with color. Clickable to open
 * the entity's more-info dialog.
 *
 * Attributes:
 *   label     — Sensor display name
 *   value     — Formatted state value (e.g. "72.1 °F")
 *   color     — Indicator and value color
 *   entity-id — HA entity_id for click handling
 *
 * Geordi fix: role="listitem" for screen reader list semantics.
 *
 * Phase 0 — v4.17.0 Panel Extraction Architecture (4X-4)
 */
import { LitElement, html } from 'lit-element';
import { showMoreInfo, defineLcars } from '../../lcars-helpers.js';
import { sensorRowStyles } from './lcars-sensor-row-styles.js';

class LcarsSensorRow extends LitElement {

  static get properties() {
    return {
      label:    { type: String },
      value:    { type: String },
      color:    { type: String },
      entityId: { type: String, attribute: 'entity-id' },
    };
  }

  constructor() {
    super();
    this.label = '';
    this.value = '';
    this.color = 'var(--lcars-space-white)';
    this.entityId = '';
  }

  static get styles() {
    return [sensorRowStyles];
  }

  _handleClick() {
    if (this.entityId) {
      showMoreInfo(this.entityId);
    }
  }

  _handleKeydown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this._handleClick();
    }
  }

  render() {
    return html`
      <div class="sensor-line"
        tabindex="0"
        role="listitem"
        aria-label="${this.label}: ${this.value}"
        @click=${this._handleClick}
        @keydown=${this._handleKeydown}>
        <div class="sensor-indicator" style="background:${this.color}"></div>
        <span class="sensor-label">${this.label}</span>
        <span class="sensor-value" style="color:${this.color}">${this.value}</span>
      </div>
    `;
  }
}

if (!customElements.get('lcars-sensor-row')) {
  defineLcars('lcars-sensor-row', LcarsSensorRow);
}
