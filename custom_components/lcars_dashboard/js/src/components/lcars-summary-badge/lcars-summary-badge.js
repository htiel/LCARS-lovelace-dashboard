/**
 * lcars-summary-badge.js (4X-20)
 *
 * Reusable badge component for panel header status readouts.
 * Renders as "3/5 ON" or "1847 W" or "LSE 94%".
 *
 * Props: label, value, total, color, icon
 * Composable in horizontal strip for multi-stat summaries.
 *
 * Geordi rules:
 *   - Font: var(--lcars-font), size var(--lcars-font-size-data)
 *   - Color: inherit from --panel-frame-color, overridable via attribute
 *   - Text: ALL UPPERCASE
 *   - role="status" + aria-live="polite" (WCAG 4.1.3)
 *   - No borders, no background, no shadows — text-only
 */
import { LitElement, html, css } from 'lit-element';
import { lcarsFocusRing } from '../../lcars-styles.js';

class LcarsSummaryBadge extends LitElement {

  static get properties() {
    return {
      label: { type: String },
      value: { type: String },
      total: { type: String },
      color: { type: String },
      icon:  { type: String },
    };
  }

  constructor() {
    super();
    this.label = '';
    this.value = '';
    this.total = '';
    this.color = '';
    this.icon = '';
  }

  static get styles() {
    return [
      lcarsFocusRing,
      css`
        :host {
          display: inline-flex;
          align-items: baseline;
          gap: 0.25rem;
          font-family: var(--lcars-font, 'Antonio', sans-serif);
          font-size: var(--lcars-font-size-data, 1rem);
          text-transform: uppercase;
          color: var(--badge-color, var(--panel-frame-color, var(--lcars-butterscotch, #ff9966)));
          white-space: nowrap;
        }

        .badge-value {
          font-variant-numeric: tabular-nums;
        }

        .badge-separator {
          opacity: 0.6;
        }

        .badge-label {
          font-size: 0.85em;
          opacity: 0.8;
          letter-spacing: 0.04em;
        }

        ha-icon {
          --mdc-icon-size: 1em;
          margin-right: 0.125rem;
        }
      `,
    ];
  }

  render() {
    const style = this.color ? `--badge-color:${this.color}` : '';
    const ariaText = this.total
      ? `${this.value} of ${this.total} ${this.label}`
      : `${this.value} ${this.label}`;

    return html`
      <span role="status"
            aria-label="${ariaText}"
            style="${style}">
        ${this.icon ? html`<ha-icon icon="${this.icon}"></ha-icon>` : ''}
        <span class="badge-value">${this.value}</span>
        ${this.total ? html`<span class="badge-separator">/</span><span class="badge-value">${this.total}</span>` : ''}
        ${this.label ? html`<span class="badge-label">${this.label}</span>` : ''}
      </span>
    `;
  }
}

customElements.define('lcars-summary-badge', LcarsSummaryBadge);
export { LcarsSummaryBadge };
