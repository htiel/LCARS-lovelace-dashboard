/**
 * LCARS More Page Card — Renders a single user-defined more-page
 * Displays the cards configured for this specific more-page
 */
import { LitElement, html, css } from 'lit-element';
import { lcarsBaseStyles } from './lcars-styles.js';

const waitForHelpers = [
  customElements.whenDefined('hui-masonry-view'),
  customElements.whenDefined('hc-lovelace'),
];

Promise.race(waitForHelpers).then(async () => {
  await new Promise((r) => setTimeout(r, 2000));
  const helpers = await window.loadCardHelpers();

  class LcarsMorePageCard extends LitElement {
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
            const card = await helpers.createCardElement(cardConfig);
            if (this._hass) card.hass = this._hass;
            return card;
          } catch (e) {
            console.error('LCARS: Failed to create card', cardConfig, e);
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

          .divider {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 0;
          }

          .divider-label {
            font-size: var(--lcars-font-size-sub);
            color: var(--lcars-text-heading);
            white-space: nowrap;
          }

          .divider-line { flex: 1; height: 2px; background: var(--lcars-data-accent); }

          .cards-container {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            padding: 0.5rem 0;
          }

          .lcars-empty {
            color: var(--lcars-gray);
            font-size: var(--lcars-font-size-sub);
            padding: 2rem 0;
            text-align: center;
          }
        `,
      ];
    }

    render() {
      const title = (this._config && this._config.name) || 'More Page';

      return html`
        <div class="divider">
          <span class="divider-label">${title}</span>
          <div class="divider-line"></div>
        </div>

        <div class="cards-container">
          ${this._cards.length > 0
            ? this._cards.map((card) => html`${card}`)
            : html`<div class="lcars-empty">No cards configured</div>`}
        </div>
      `;
    }

    getCardSize() {
      return this._cards.length || 1;
    }
  }

  if (!customElements.get('lcars-more-page-card')) {
    customElements.define('lcars-more-page-card', LcarsMorePageCard);
  }
});
