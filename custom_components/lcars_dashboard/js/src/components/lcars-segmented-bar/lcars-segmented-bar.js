/**
 * lcars-segmented-bar.js
 *
 * <lcars-segmented-bar> — Horizontal threshold-colored level indicator.
 * Renders N solid-color segments; filled segments colored by threshold,
 * unfilled at reduced opacity. NO gradients (Bracer Jack Rule 1).
 *
 * Attributes:
 *   value       — Current numeric value
 *   min         — Scale minimum (default 0)
 *   max         — Scale maximum (default 100)
 *   segments    — Number of bar segments (default 7)
 *   thresholds  — JSON array: [{ value, color }] ascending by value
 *   label       — Accessible label text
 *
 * Geordi rules enforced:
 *   - role="meter" with aria-valuenow/min/max/label
 *   - Text readout alongside bar (WCAG 1.4.1)
 *   - Endcap radius on rightmost segment only
 *   - Empty segments: --lcars-gray at 30% opacity
 *   - Min 24px touch target height (WCAG 2.5.8)
 *
 * v4.18.0 — 4X-16 Segmented Bar Component
 */
import { defineLcars } from '../../lcars-helpers.js';
import { LitElement, html, css } from 'lit-element';
import { lcarsFocusRing } from '../../lcars-styles.js';

class LcarsSegmentedBar extends LitElement {

  static get properties() {
    return {
      value:      { type: Number },
      min:        { type: Number },
      max:        { type: Number },
      segments:   { type: Number },
      thresholds: { type: Array },
      label:      { type: String },
    };
  }

  constructor() {
    super();
    this.value = 0;
    this.min = 0;
    this.max = 100;
    this.segments = 7;
    this.thresholds = [];
    this.label = '';
  }

  static get styles() {
    return [
      lcarsFocusRing,
      css`
        :host { display: inline-flex; align-items: center; gap: 0.5rem; }

        .bar-container {
          display: flex;
          align-items: center;
          gap: 1px;
          min-height: 24px;
        }

        .segment {
          width: 4px;
          height: 12px;
          background: var(--lcars-gray, #666688);
          opacity: 0.3;
          transition: opacity 200ms, background 200ms;
        }

        .segment.filled {
          opacity: 1;
        }

        .segment:last-child {
          border-radius: 0 var(--lcars-endcap, 2px) var(--lcars-endcap, 2px) 0;
        }

        .bar-value {
          font-family: var(--lcars-font);
          font-size: var(--lcars-font-size-data);
          color: var(--lcars-space-white);
          white-space: nowrap;
          min-width: 2.5rem;
          text-align: right;
        }
      `,
    ];
  }

  _getColorForValue(val) {
    if (!this.thresholds?.length) return 'var(--lcars-ice)';
    let color = this.thresholds[0]?.color || 'var(--lcars-ice)';
    for (const t of this.thresholds) {
      if (val >= t.value) color = t.color;
      else break;
    }
    return color;
  }

  render() {
    const range = this.max - this.min;
    const fillRatio = range > 0 ? Math.max(0, Math.min(1, (this.value - this.min) / range)) : 0;
    const filledCount = Math.round(fillRatio * this.segments);
    const color = this._getColorForValue(this.value);

    const segmentTemplates = [];
    for (let i = 0; i < this.segments; i++) {
      const isFilled = i < filledCount;
      segmentTemplates.push(
        html`<div class="segment ${isFilled ? 'filled' : ''}"
          style="${isFilled ? `background: ${color}` : ''}"></div>`
      );
    }

    return html`
      <div class="bar-container"
        role="meter"
        aria-valuenow="${this.value}"
        aria-valuemin="${this.min}"
        aria-valuemax="${this.max}"
        aria-label="${this.label}">
        ${segmentTemplates}
      </div>
      <span class="bar-value">${this._formatValue()}</span>
    `;
  }

  _formatValue() {
    if (this.value == null) return '—';
    return Number.isInteger(this.value) ? String(this.value) : this.value.toFixed(1);
  }
}

defineLcars('lcars-segmented-bar', LcarsSegmentedBar);
