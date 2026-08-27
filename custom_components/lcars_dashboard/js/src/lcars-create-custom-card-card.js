/**
 * LCARS Create Custom Card Card — Form for adding a new custom card to a view
 */
import { defineLcars } from './lcars-helpers.js';
import { LitElement, html, css } from 'lit-element';
import { lcarsBaseStyles } from './lcars-styles.js';


  class LcarsCreateCustomCardCard extends LitElement {
    static get properties() {
      return {
        _hass: { type: Object },
        _config: { type: Object },
      };
    }

    set hass(hass) { this._hass = hass; }
    setConfig(config) { this._config = config; }

    static get styles() {
      return [
        lcarsBaseStyles,
        css`
          :host { display: block; }

          .create-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            width: 100%;
            height: var(--lcars-btn-height);
            background: var(--lcars-mars);
            color: var(--lcars-black);
            border: none;
            border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            text-transform: uppercase;
            cursor: pointer;
            transition: filter var(--lcars-transition);
            user-select: none;
          }

          .create-btn:hover { filter: brightness(1.2); }

          .create-btn ha-icon {
            --mdc-icon-size: 20px;
          }
        `,
      ];
    }

    render() {
      return html`
        <button class="create-btn">
          <ha-icon icon="mdi:plus"></ha-icon>
          Add Custom Card
        </button>
      `;
    }

    getCardSize() { return 1; }
  }

  if (!customElements.get('lcars-create-custom-card-card')) {
    defineLcars('lcars-create-custom-card-card', LcarsCreateCustomCardCard);
  }