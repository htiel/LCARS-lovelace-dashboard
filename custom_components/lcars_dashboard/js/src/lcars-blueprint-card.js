/**
 * LCARS Blueprint Card — Renders a blueprint-configured card
 * Supports user-customized Lovelace cards from blueprint templates
 */
import { LitElement, html, css } from 'lit-element';
import { lcarsBaseStyles } from './lcars-styles.js';
import { createCardElement, defineLcars } from './lcars-helpers.js';

class LcarsBlueprintCard extends LitElement {
    static get properties() {
      return {
        _hass: { type: Object },
        _config: { type: Object },
        _card: { type: Object },
      };
    }

    constructor() {
      super();
      this._card = null;
    }

    set hass(hass) {
      this._hass = hass;
      if (this._card) this._card.hass = hass;
    }

    setConfig(config) {
      this._config = config;
      if (config.card) {
        this._createCard(config.card);
      }
    }

    async _createCard(cardConfig) {
      try {
        this._card = await createCardElement(cardConfig);
        if (this._hass) this._card.hass = this._hass;
        this.requestUpdate();
      } catch (e) {
        console.error('LCARS Blueprint: Failed to create card', e);
      }
    }

    static get styles() {
      return [
        lcarsBaseStyles,
        css`
          :host { display: block; }

          .blueprint-wrapper {
            border-left: 3px solid var(--lcars-butterscotch);
            padding: 0.5rem 0 0.5rem 0.75rem;
          }

          .blueprint-label {
            font-family: var(--lcars-font);
            font-size: 0.625rem;
            color: var(--lcars-gray);
            text-transform: uppercase;
            margin-bottom: 0.25rem;
          }
        `,
      ];
    }

    render() {
      return html`
        <div class="blueprint-wrapper">
          ${this._config?.name
            ? html`<div class="blueprint-label">${this._config.name}</div>`
            : ''}
          ${this._card ? html`${this._card}` : ''}
        </div>
      `;
    }

    getCardSize() { return this._card ? 2 : 1; }
  }

if (!customElements.get('lcars-blueprint-card')) {
  defineLcars('lcars-blueprint-card', LcarsBlueprintCard);
}
