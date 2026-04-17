/**
 * lcars-setpoint.js
 *
 * <lcars-setpoint> — Temperature/value adjustment control with −/+ buttons.
 * Used by climate and pool/spa panels for setpoint adjustment.
 *
 * Properties:
 *   value — Current numeric value
 *   step  — Increment/decrement amount (default 0.5)
 *   min   — Minimum allowed value
 *   max   — Maximum allowed value
 *   unit  — Display unit suffix (°F, °C, %, etc.)
 *   label — Display label (e.g. "HEAT 72°")
 *   color — CSS color for buttons and label
 *
 * Events:
 *   lcars-setpoint-changed (detail: { value }) — fired on increment/decrement
 *
 * Accessibility (spec §8.3):
 *   role="spinbutton", aria-valuenow/min/max, aria-label
 *   −/+ buttons have explicit aria-label
 *
 * Phase 3 — v4.17.0 Panel Extraction Architecture (4X-4)
 */
import { LitElement, html } from 'lit-element';
import { setpointStyles } from './lcars-setpoint-styles.js';

class LcarsSetpoint extends LitElement {

  static get properties() {
    return {
      value: { type: Number },
      step:  { type: Number },
      min:   { type: Number },
      max:   { type: Number },
      unit:  { type: String },
      label: { type: String },
      color: { type: String },
    };
  }

  constructor() {
    super();
    this.value = 0;
    this.step = 0.5;
    this.min = 0;
    this.max = 100;
    this.unit = '';
    this.label = '';
    this.color = '';
  }

  static get styles() {
    return [setpointStyles];
  }

  _adjust(delta) {
    const newVal = Math.min(this.max, Math.max(this.min, this.value + delta));
    if (newVal === this.value) return;
    this.value = newVal;
    this.dispatchEvent(new CustomEvent('lcars-setpoint-changed', {
      detail: { value: newVal },
      bubbles: true,
      composed: true,
    }));
  }

  render() {
    const colorStyle = this.color ? `--sp-color:${this.color}` : '';
    const displayLabel = this.label || `${this.value}${this.unit}`;
    return html`
      <div class="setpoint-control"
        role="spinbutton"
        aria-valuenow="${this.value}"
        aria-valuemin="${this.min}"
        aria-valuemax="${this.max}"
        aria-label="${this.label || 'Setpoint'}"
        style="${colorStyle}">
        <button class="sp-btn sp-dec"
          aria-label="Decrease"
          ?disabled=${this.value <= this.min}
          @click=${() => this._adjust(-this.step)}>−</button>
        <span class="sp-label">${displayLabel}</span>
        <button class="sp-btn sp-inc"
          aria-label="Increase"
          ?disabled=${this.value >= this.max}
          @click=${() => this._adjust(this.step)}>+</button>
      </div>
    `;
  }
}

if (!customElements.get('lcars-setpoint')) {
  customElements.define('lcars-setpoint', LcarsSetpoint);
}
