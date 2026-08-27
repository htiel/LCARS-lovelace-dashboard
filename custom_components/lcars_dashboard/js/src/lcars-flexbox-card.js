/**
 * LCARS Flexbox Card — Wraps child cards in a flex container
 * Generic layout helper for arranging child cards
 */
import { LitElement, html, css } from 'lit-element';
import { lcarsBaseStyles } from './lcars-styles.js';
import { createCardElement, defineLcars } from './lcars-helpers.js';

class LcarsFlexboxCard extends LitElement {
    static get properties() {
      return {
        _hass: { type: Object },
        _config: { type: Object },
        _cards: { type: Array },
      };
    }

    constructor() {
      super();
      this._cards = [];
    }

    set hass(hass) {
      this._hass = hass;
      this._cards.forEach((card) => {
        if (card) card.hass = hass;
      });
    }

    setConfig(config) {
      this._config = config;
      this._createCards();
    }

    async _createCards() {
      if (!this._config || !this._config.cards) return;
      this._cards = await Promise.all(
        this._config.cards.map(async (cardConfig) => {
          try {
            const card = await createCardElement(cardConfig);
            if (this._hass) card.hass = this._hass;
            return card;
          } catch (e) {
            console.error('LCARS Flexbox: Failed to create card', cardConfig, e);
            return null;
          }
        })
      );
      this._cards = this._cards.filter(Boolean);
      this.requestUpdate();
    }

    static get styles() {
      return [
        lcarsBaseStyles,
        css`
          :host { display: block; }

          .flexbox {
            display: flex;
            flex-wrap: wrap;
            gap: var(--lcars-gap);
          }

          .flexbox > * {
            flex: 1 1 auto;
            min-width: 0;
          }
        `,
      ];
    }

    render() {
      return html`
        <div class="flexbox">
          ${this._cards.map((card) => html`${card}`)}
        </div>
      `;
    }

    getCardSize() { return 1; }
  }

if (!customElements.get('lcars-flexbox-card')) {
  defineLcars('lcars-flexbox-card', LcarsFlexboxCard);
}
