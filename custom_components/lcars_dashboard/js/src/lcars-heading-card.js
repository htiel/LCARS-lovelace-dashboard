/**
 * LCARS Heading Card — Section label with LCARS data-line divider
 */
import { LitElement, html, css } from 'lit-element';
import { lcarsBaseStyles } from './lcars-styles.js';

const waitForHelpers = [
  customElements.whenDefined('hui-masonry-view'),
  customElements.whenDefined('hc-lovelace'),
];

Promise.race(waitForHelpers).then(async () => {
  await new Promise((r) => setTimeout(r, 2000));

  class LcarsHeadingCard extends LitElement {
    static get properties() {
      return {
        _hass: { type: Object },
        _config: { type: Object },
      };
    }

    set hass(hass) { this._hass = hass; }

    setConfig(config) {
      if (!config.heading) throw new Error('Please define heading');
      this._config = config;
    }

    static get styles() {
      return [
        lcarsBaseStyles,
        css`
          :host { display: block; }

          .heading-row {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .heading-text {
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-sub);
            color: var(--lcars-text-heading);
            text-transform: uppercase;
            white-space: nowrap;
          }

          .heading-bar {
            flex: 1;
            height: 2px;
            background: var(--lcars-data-accent);
          }

          .heading-endcap {
            width: 1rem;
            height: 2px;
            background: var(--lcars-data-accent);
            border-radius: 0 1px 1px 0;
          }

          .heading-subtitle {
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            color: var(--lcars-gray);
            text-transform: uppercase;
            padding-top: 0.25rem;
          }
        `,
      ];
    }

    render() {
      return html`
        <div class="heading-row">
          <span class="heading-text">${this._config.heading}</span>
          <div class="heading-bar"></div>
          <div class="heading-endcap"></div>
        </div>
        ${this._config.subtitle
          ? html`<div class="heading-subtitle">${this._config.subtitle}</div>`
          : ''}
      `;
    }

    getCardSize() { return 1; }
  }

  if (!customElements.get('lcars-heading-card')) {
    customElements.define('lcars-heading-card', LcarsHeadingCard);
  }
});
