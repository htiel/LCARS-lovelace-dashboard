/**
 * LCARS Popup — Modal overlay with LCARS styling
 * Used for entity detail views and edit forms
 */
import { LitElement, html, css } from 'lit-element';
import { lcarsBaseStyles } from './lcars-styles.js';
import { createCardElement } from './lcars-helpers.js';

class LcarsPopup extends LitElement {
    static get properties() {
      return {
        _hass: { type: Object },
        _config: { type: Object },
        _open: { type: Boolean },
        _card: { type: Object },
      };
    }

    constructor() {
      super();
      this._open = false;
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
        console.error('LCARS Popup: Failed to create card', e);
      }
    }

    open() {
      this._open = true;
    }

    close() {
      this._open = false;
    }

    _handleBackdropClick(e) {
      if (e.target === e.currentTarget) this.close();
    }

    _handleKeydown(e) {
      if (e.key === 'Escape') this.close();
    }

    static get styles() {
      return [
        lcarsBaseStyles,
        css`
          :host { display: block; }

          .popup-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.7);
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            pointer-events: none;
            transition: opacity var(--lcars-transition);
          }

          .popup-backdrop[data-open] {
            opacity: 1;
            pointer-events: auto;
          }

          .popup-frame {
            background: var(--lcars-bg);
            border: 3px solid var(--lcars-butterscotch);
            border-radius: 0 2rem 0 2rem;
            max-width: 90vw;
            max-height: 85vh;
            min-width: 20rem;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            transform: scale(0.95);
            transition: transform var(--lcars-transition);
          }

          .popup-backdrop[data-open] .popup-frame {
            transform: scale(1);
          }

          .popup-header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            background: var(--lcars-butterscotch);
            color: var(--lcars-black);
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            text-transform: uppercase;
          }

          .popup-title { flex: 1; }

          .popup-close {
            background: none;
            border: none;
            color: var(--lcars-black);
            cursor: pointer;
            font-family: var(--lcars-font);
            font-size: 1rem;
            padding: 0.25rem 0.5rem;
          }

          .popup-close:hover {
            color: var(--lcars-red-alert);
          }

          .popup-body {
            padding: 1rem;
            overflow-y: auto;
            flex: 1;
          }

          @media (prefers-reduced-motion: reduce) {
            .popup-backdrop, .popup-frame { transition: none; }
          }
        `,
      ];
    }

    render() {
      return html`
        <div
          class="popup-backdrop"
          ?data-open=${this._open}
          @click=${this._handleBackdropClick}
          @keydown=${this._handleKeydown}
          role="dialog"
          aria-modal="true"
          aria-label="${this._config?.title || 'Popup'}"
        >
          <div class="popup-frame">
            <div class="popup-header">
              <span class="popup-title">${this._config?.title || 'LCARS'}</span>
              <button class="popup-close" @click=${this.close} aria-label="Close">&#x2715;</button>
            </div>
            <div class="popup-body">
              ${this._card ? html`${this._card}` : ''}
            </div>
          </div>
        </div>
      `;
    }

    getCardSize() { return 0; }
  }

if (!customElements.get('lcars-popup')) {
  customElements.define('lcars-popup', LcarsPopup);
}
