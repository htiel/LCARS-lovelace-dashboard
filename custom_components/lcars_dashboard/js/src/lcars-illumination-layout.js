/**
 * lcars-illumination-layout.js
 *
 * LCARS frame layout for the Illumination dashboard.
 * Same frame as lcars-dashboard-layout (elbows, header, footer, sidebar)
 * but sidebar shows 3 filter buttons instead of area navigation.
 *
 * Passes selected filter to child cards via card.filter property.
 *
 * v5.0.0 — 5X-2.5 Lighting Dashboard
 */
import { LitElement, html, css } from 'lit-element';
import { lcarsBaseStyles } from './lcars-styles.js';
import { lcarsLog, lcarsEventBus } from './lcars-helpers.js';
import { lcarsAudio } from './lcars-audio.js';

const TAG = 'IlluminationLayout';
const FILTER_ALL = 'all';
const FILTER_LIGHTS = 'lights';
const FILTER_CIRCUITS = 'circuits';

class LcarsIlluminationLayout extends LitElement {

  static get properties() {
    return {
      cards: { type: Array },
      _hass: { type: Object },
      _config: { type: Object },
      _filter: { type: String },
      _siteName: { type: String },
      _audioMuted: { type: Boolean },
    };
  }

  constructor() {
    super();
    this.cards = [];
    this._hass = null;
    this._config = {};
    this._filter = FILTER_ALL;
    this._siteName = 'LCARS';
    this._audioMuted = lcarsAudio.isMuted;
  }

  setConfig(config) {
    this._config = config;
  }

  set hass(hass) {
    this._hass = hass;
    if (hass?.config?.location_name) {
      this._siteName = hass.config.location_name.toUpperCase();
    }
    if (this.cards) {
      this.cards.forEach((card) => {
        if (card) {
          card.hass = hass;
          card.filter = this._filter;
        }
      });
    }
  }

  _setFilter(filter) {
    this._filter = filter;
    lcarsAudio.play('navAcknowledge');
    // Push filter to child cards
    if (this.cards) {
      this.cards.forEach((card) => {
        if (card) card.filter = filter;
      });
    }
  }

  _toggleMute() {
    lcarsAudio.toggle();
    this._audioMuted = lcarsAudio.isMuted;
  }

  render() {
    const version = require('../package.json').version;

    return html`
      <div class="lcars-frame">
        <!-- Top-Left Elbow -->
        <div class="lcars-elbow-top" aria-hidden="true"></div>

        <!-- Header Bar -->
        <div class="lcars-header" role="banner">
          <span class="lcars-header-title">${this._siteName}</span>
          <div class="lcars-header-bar" aria-hidden="true"></div>
          <div class="lcars-header-endcap">
            <button class="mute-btn"
              role="switch"
              aria-checked=${!this._audioMuted}
              aria-label="Dashboard sounds"
              @click=${() => this._toggleMute()}>
              <ha-icon .icon=${this._audioMuted ? 'mdi:volume-off' : 'mdi:volume-high'}></ha-icon>
            </button>
          </div>
        </div>

        <!-- Sidebar: 3 Filter Buttons -->
        <nav class="lcars-sidebar" role="tablist" aria-label="Filter illumination devices">
          <div class="lcars-sidebar-panel">Illumination</div>

          <div class="lcars-sidebar-filters">
            <button class="sidebar-filter-btn ${this._filter === FILTER_ALL ? 'active' : ''}"
                    role="tab"
                    aria-selected="${this._filter === FILTER_ALL ? 'true' : 'false'}"
                    @click=${() => this._setFilter(FILTER_ALL)}>
              <span class="filter-label">ALL DEVICES</span>
            </button>
            <button class="sidebar-filter-btn ${this._filter === FILTER_LIGHTS ? 'active' : ''}"
                    role="tab"
                    aria-selected="${this._filter === FILTER_LIGHTS ? 'true' : 'false'}"
                    @click=${() => this._setFilter(FILTER_LIGHTS)}>
              <span class="filter-label">LIGHTS</span>
            </button>
            <button class="sidebar-filter-btn ${this._filter === FILTER_CIRCUITS ? 'active' : ''}"
                    role="tab"
                    aria-selected="${this._filter === FILTER_CIRCUITS ? 'true' : 'false'}"
                    @click=${() => this._setFilter(FILTER_CIRCUITS)}>
              <span class="filter-label">CIRCUITS</span>
            </button>
          </div>
        </nav>

        <!-- Main Content -->
        <main class="lcars-content" id="lcars-main-content" aria-label="Illumination dashboard">
          ${this.cards && this.cards.length > 0
            ? this.cards.map((card) => html`${card}`)
            : html`<div class="lcars-heading">No data available</div>`}
        </main>

        <!-- Bottom-Left Elbow -->
        <div class="lcars-elbow-bottom" aria-hidden="true"></div>

        <!-- Footer Bar -->
        <div class="lcars-footer" role="contentinfo">
          <div class="lcars-footer-bar" aria-hidden="true"></div>
          <span class="lcars-footer-text">LCARS ${version}</span>
          <div class="lcars-footer-endcap" aria-hidden="true"></div>
        </div>
      </div>
    `;
  }

  static get styles() {
    return [
      lcarsBaseStyles,
      css`
        :host {
          display: block;
          height: calc(100vh - var(--header-height, 0px));
          overflow: hidden;
          box-sizing: border-box;
          background: var(--lcars-bg, #000);
          padding: var(--lcars-gap, 0.25rem);
        }

        .lcars-frame {
          display: grid;
          grid-template-columns: var(--lcars-sidebar-w, 12rem) 1fr;
          grid-template-rows: var(--lcars-elbow-h, 4.5rem) 1fr var(--lcars-elbow-h, 4.5rem);
          gap: var(--lcars-gap, 0.25rem);
          height: 100%;
        }

        /* ─── Top-Left Elbow ─── */
        .lcars-elbow-top {
          grid-column: 1; grid-row: 1;
          background: var(--lcars-sunflower, #ffcc99);
          border-radius: var(--lcars-elbow-radius, 3.75rem) 0 0 0;
          position: relative; overflow: hidden;
        }
        .lcars-elbow-top::after {
          content: ''; position: absolute; bottom: 0; right: 0;
          width: calc(var(--lcars-sidebar-w, 12rem) - var(--lcars-elbow-w, 9.5rem));
          height: calc(var(--lcars-elbow-h, 4.5rem) - var(--lcars-bar-h, 1.5rem));
          background: var(--lcars-bg, #000);
          border-radius: 1.5rem 0 0 0;
        }

        /* ─── Header Bar ─── */
        .lcars-header {
          grid-column: 2; grid-row: 1;
          display: flex; align-items: flex-start; gap: var(--lcars-gap, 0.25rem);
        }
        .lcars-header-title {
          font-family: var(--lcars-font, 'Antonio', sans-serif);
          font-size: var(--lcars-font-size-sub, 1.25rem);
          color: var(--lcars-sunflower, #ffcc99);
          text-transform: uppercase; letter-spacing: 0.05em;
          white-space: nowrap;
          line-height: var(--lcars-bar-h, 1.5rem);
          padding: 0 0.5rem;
        }
        .lcars-header-bar {
          flex: 1; height: var(--lcars-bar-h, 1.5rem);
          background: var(--lcars-sunflower, #ffcc99);
        }
        .lcars-header-endcap {
          height: var(--lcars-bar-h, 1.5rem);
          background: var(--lcars-sunflower, #ffcc99);
          border-radius: 0;
          display: flex; align-items: center; padding: 0 0.25rem;
        }
        .mute-btn {
          background: none; border: none; cursor: pointer;
          color: var(--lcars-black, #000); padding: 0 0.25rem;
          display: flex; align-items: center;
        }
        .mute-btn:focus-visible {
          outline: 2px solid var(--lcars-ice, #99ccff); outline-offset: 2px;
        }
        .mute-btn ha-icon { --mdc-icon-size: 18px; }

        /* ─── Sidebar ─── */
        .lcars-sidebar {
          grid-column: 1; grid-row: 2;
          display: flex; flex-direction: column;
          gap: var(--lcars-gap, 0.25rem);
          overflow: hidden;
        }
        .lcars-sidebar-panel {
          background: var(--lcars-african-violet, #cc99ff);
          color: var(--lcars-black, #000);
          font-family: var(--lcars-font, 'Antonio', sans-serif);
          font-size: var(--lcars-font-size-data, 0.875rem);
          text-transform: uppercase;
          padding: 0.25rem 0.5rem;
          text-align: right;
          border-radius: var(--lcars-btn-radius, 1.5rem) 0 0 var(--lcars-btn-radius, 1.5rem);
          flex-shrink: 0;
        }

        /* ─── 3 Filter Buttons ─── */
        .lcars-sidebar-filters {
          display: flex; flex-direction: column;
          gap: var(--lcars-gap, 0.25rem);
          flex: 1;
        }
        .sidebar-filter-btn {
          flex: 1;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 0.5rem; border: none;
          border-radius: var(--lcars-btn-radius, 1.5rem) 0 0 var(--lcars-btn-radius, 1.5rem);
          background: var(--lcars-african-violet, #cc99ff);
          color: var(--lcars-black, #000);
          font-family: var(--lcars-font, 'Antonio', sans-serif);
          text-transform: uppercase; cursor: pointer;
          transition: background 200ms ease;
          padding: 0.5rem;
        }
        .sidebar-filter-btn:hover { filter: brightness(1.2); }
        .sidebar-filter-btn:focus-visible {
          outline: 2px solid var(--lcars-ice, #99ccff); outline-offset: 2px;
        }
        .sidebar-filter-btn.active { background: var(--lcars-gold, #ffaa00); }

        .filter-label {
          font-size: 1.25rem; letter-spacing: 0.08em; text-align: center;
        }

        /* ─── Content ─── */
        .lcars-content {
          grid-column: 2; grid-row: 2;
          overflow-y: auto; overflow-x: hidden;
          padding: 0.5rem;
          scrollbar-width: thin;
          scrollbar-color: var(--lcars-gray, #666688) transparent;
        }

        /* ─── Bottom-Left Elbow ─── */
        .lcars-elbow-bottom {
          grid-column: 1; grid-row: 3;
          background: var(--lcars-african-violet, #cc99ff);
          border-radius: 0 0 0 var(--lcars-elbow-radius, 3.75rem);
          position: relative; overflow: hidden;
        }
        .lcars-elbow-bottom::after {
          content: ''; position: absolute; top: 0; right: 0;
          width: calc(var(--lcars-sidebar-w, 12rem) - var(--lcars-elbow-w, 9.5rem));
          height: calc(var(--lcars-elbow-h, 4.5rem) - var(--lcars-bar-h, 1.5rem));
          background: var(--lcars-bg, #000);
          border-radius: 0 0 0 1.5rem;
        }

        /* ─── Footer Bar ─── */
        .lcars-footer {
          grid-column: 2; grid-row: 3;
          display: flex; align-items: flex-end; gap: var(--lcars-gap, 0.25rem);
        }
        .lcars-footer-bar {
          flex: 1; height: var(--lcars-bar-h, 1.5rem);
          background: var(--lcars-african-violet, #cc99ff);
        }
        .lcars-footer-text {
          font-family: var(--lcars-font, 'Antonio', sans-serif);
          font-size: 0.75rem; color: var(--lcars-african-violet, #cc99ff);
          text-transform: uppercase; white-space: nowrap;
          line-height: var(--lcars-bar-h, 1.5rem); padding: 0 0.5rem;
        }
        .lcars-footer-endcap {
          width: var(--lcars-endcap-size, 1.5rem); height: var(--lcars-bar-h, 1.5rem);
          background: var(--lcars-african-violet, #cc99ff);
          border-radius: 0;
          flex-shrink: 0;
        }

        /* ─── Mobile ─── */
        @media (max-width: 767px) {
          .lcars-frame {
            grid-template-columns: 1fr;
            grid-template-rows: auto auto 1fr auto;
          }
          .lcars-elbow-top, .lcars-elbow-bottom { display: none; }
          .lcars-header { grid-column: 1; grid-row: 1; }
          .lcars-sidebar {
            grid-column: 1; grid-row: 2;
            flex-direction: row;
          }
          .lcars-sidebar-panel { display: none; }
          .lcars-sidebar-filters { flex-direction: row; }
          .sidebar-filter-btn {
            border-radius: 0; min-height: 3.5rem;
          }
          .sidebar-filter-btn:first-child { border-radius: 1rem 0 0 1rem; }
          .sidebar-filter-btn:last-child { border-radius: 0 1rem 1rem 0; }
          .filter-count { font-size: 1.5rem; }
          .filter-label { font-size: 0.75rem; }
          .lcars-content { grid-column: 1; grid-row: 3; }
          .lcars-footer { grid-column: 1; grid-row: 4; }
        }
      `,
    ];
  }
}

const ready = Promise.race([
  customElements.whenDefined('hui-masonry-view'),
  new Promise((r) => setTimeout(r, 5000)),
]);
ready.then(() => {
  if (!customElements.get('lcars-illumination-layout')) {
    customElements.define('lcars-illumination-layout', LcarsIlluminationLayout);
    lcarsLog.info(TAG, 'Illumination layout registered');
  }
});
