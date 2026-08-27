/**
 * LCARS More Pages Card — Grid of user-defined more-pages
 * Renders LCARS pill buttons for each more-page configured by the user
 */
import { LitElement, html, css } from 'lit-element';
import { lcarsBaseStyles } from './lcars-styles.js';
import { navigate, defineLcars } from './lcars-helpers.js';


  class LcarsMorePagesCard extends LitElement {
    static get properties() {
      return {
        _hass: { type: Object },
        _config: { type: Object },
        _pages: { type: Array },
      };
    }

    constructor() {
      super();
      this._pages = [];
    }

    set hass(hass) {
      this._hass = hass;
      if (this._pages.length === 0) this._loadPages();
    }

    setConfig(config) {
      this._config = config;
    }

    async _loadPages() {
      if (!this._hass) return;
      try {
        const result = await this._hass.callWS({
          type: 'lcars_dashboard/configuration/get',
        });
        if (result && result.more_pages) {
          this._pages = Object.entries(result.more_pages).map(([key, val]) => ({
            id: key,
            ...val,
          }));
        }
      } catch (e) {
        console.warn('LCARS: Could not load more-pages', e);
      }
    }

    _openPage(pageId) {
      navigate(`/lcars-dashboard/more/${pageId}`);
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

          .pages-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
            gap: var(--lcars-gap);
            padding: 0.5rem 0;
          }

          .page-btn {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            height: var(--lcars-btn-height);
            padding: 0 1rem 0 0.75rem;
            background: var(--lcars-almond);
            color: var(--lcars-black);
            border: none;
            border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            text-transform: uppercase;
            cursor: pointer;
            transition: filter var(--lcars-transition);
            user-select: none;
            width: 100%;
          }

          .page-btn:hover { filter: brightness(1.2); }
          .page-btn:active { background: var(--lcars-btn-active); }

          .page-btn ha-icon { --mdc-icon-size: 20px; flex-shrink: 0; }
          .page-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

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
      return html`
        <div class="divider">
          <span class="divider-label">More Pages</span>
          <div class="divider-line"></div>
        </div>

        ${this._pages.length > 0
          ? html`
              <div class="pages-grid">
                ${this._pages.map(
                  (page) => html`
                    <button
                      class="page-btn"
                      @click=${() => this._openPage(page.id)}
                    >
                      <ha-icon .icon=${page.icon || 'mdi:file-document-outline'}></ha-icon>
                      <span class="page-name">${page.name || page.id}</span>
                    </button>
                  `
                )}
              </div>
            `
          : html`<div class="lcars-empty">No additional pages configured</div>`}
      `;
    }

    getCardSize() { return 4; }
  }

  if (!customElements.get('lcars-more-pages-card')) {
    defineLcars('lcars-more-pages-card', LcarsMorePagesCard);
  }