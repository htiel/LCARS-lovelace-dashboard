/**
 * LCARS Dashboard Layout — Main view layout component
 * Implements the classic LCARS frame: elbow + header bar + sidebar + content + footer bar + elbow
 * Sidebar contains area navigation; content shows detail for selected area
 * Registered as custom:lcars-dashboard-layout (Lovelace view type)
 */
import { LitElement, html, css } from 'lit-element';
import { lcarsBaseStyles } from './lcars-styles.js';
import { lcarsEventBus } from './lcars-helpers.js';

class LcarsDashboardLayout extends LitElement {
  static get properties() {
    return {
      cards: { type: Array },
      _hass: { type: Object },
      _narrow: { type: Boolean },
      _selectedArea: { type: String },
    };
  }

  constructor() {
    super();
    this.cards = [];
    this._narrow = window.innerWidth < 768;
    this._selectedArea = null;
    this._resizeHandler = () => {
      this._narrow = window.innerWidth < 768;
    };
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('resize', this._resizeHandler);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('resize', this._resizeHandler);
  }

  setConfig(config) {
    this._config = config;
  }

  set hass(hass) {
    const prev = this._hass;
    this._hass = hass;
    // Auto-deselect area if it was deleted from HA
    if (prev && prev.areas !== hass.areas && this._selectedArea) {
      if (!hass.areas?.[this._selectedArea]) {
        this._selectedArea = null;
        lcarsEventBus.dispatchEvent(
          new CustomEvent('lcars-area-selected', { detail: { areaId: null } })
        );
      }
    }
    if (this.cards) {
      this.cards.forEach((card) => {
        if (card) card.hass = hass;
      });
    }
  }

  _selectArea(areaId) {
    this._selectedArea = this._selectedArea === areaId ? null : areaId;
    // Broadcast area selection via private event bus (prevents injection from untrusted cards)
    lcarsEventBus.dispatchEvent(
      new CustomEvent('lcars-area-selected', {
        detail: { areaId: this._selectedArea },
      })
    );
  }

  _getAreas() {
    if (!this._hass || !this._hass.areas) return [];
    return Object.values(this._hass.areas);
  }

  static get styles() {
    return [
      lcarsBaseStyles,
      css`
        :host {
          display: block;
          min-height: 100vh;
          background: var(--lcars-bg);
          padding: var(--lcars-gap);
        }

        /* ─── LCARS Frame Grid ─── */
        .lcars-frame {
          display: grid;
          grid-template-columns: var(--lcars-sidebar-w) 1fr;
          grid-template-rows: var(--lcars-elbow-h) 1fr var(--lcars-elbow-h);
          gap: var(--lcars-gap);
          min-height: calc(100vh - 0.5rem);
        }

        /* ─── Top-Left Elbow ─── */
        .lcars-elbow-top {
          grid-column: 1;
          grid-row: 1;
          background: var(--lcars-elbow-top);
          border-radius: var(--lcars-elbow-radius) 0 0 0;
          position: relative;
          overflow: hidden;
        }

        .lcars-elbow-top::after {
          content: '';
          position: absolute;
          bottom: 0;
          right: 0;
          width: calc(var(--lcars-sidebar-w) - var(--lcars-elbow-w) + 2rem);
          height: calc(var(--lcars-elbow-h) - var(--lcars-bar-h));
          background: var(--lcars-bg);
          border-radius: 1.875rem 0 0 0;
        }

        /* ─── Header Bar ─── */
        .lcars-header {
          grid-column: 2;
          grid-row: 1;
          display: flex;
          align-items: flex-end;
          gap: var(--lcars-gap);
        }

        .lcars-header-bar {
          flex: 1;
          height: var(--lcars-bar-h);
          background: var(--lcars-header-bar);
        }

        .lcars-header-endcap {
          width: var(--lcars-endcap);
          height: var(--lcars-bar-h);
          background: var(--lcars-header-bar);
          border-radius: 0 var(--lcars-endcap) var(--lcars-endcap) 0;
        }

        .lcars-header-title {
          font-size: var(--lcars-font-size-title);
          color: var(--lcars-text-heading);
          white-space: nowrap;
          padding: 0 1rem;
          line-height: var(--lcars-bar-h);
        }

        /* ─── Sidebar ─── */
        .lcars-sidebar {
          grid-column: 1;
          grid-row: 2;
          display: flex;
          flex-direction: column;
          gap: var(--lcars-gap);
          padding-top: var(--lcars-gap);
          overflow: hidden;
          min-height: 0;
        }

        .lcars-sidebar-panel {
          background: var(--lcars-sidebar-bg);
          padding: 0.5rem 0.75rem;
          min-height: 2rem;
          font-size: var(--lcars-font-size-data);
          color: var(--lcars-black);
          text-transform: uppercase;
          flex-shrink: 0;
        }

        /* ─── Sidebar Area Buttons ─── */
        .lcars-sidebar-areas {
          display: flex;
          flex-direction: column;
          gap: var(--lcars-gap);
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          min-height: 0;
          mask-image: linear-gradient(to bottom, black calc(100% - 3rem), transparent 100%);
          -webkit-mask-image: linear-gradient(to bottom, black calc(100% - 3rem), transparent 100%);
        }

        .lcars-sidebar-areas::-webkit-scrollbar { width: 4px; }
        .lcars-sidebar-areas::-webkit-scrollbar-track { background: transparent; }
        .lcars-sidebar-areas::-webkit-scrollbar-thumb { background: var(--lcars-gray); border-radius: 2px; }

        .sidebar-area-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--lcars-almond-creme);
          color: var(--lcars-black);
          border: none;
          border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
          height: var(--lcars-btn-height);
          padding: 0 1rem 0 0.75rem;
          font-family: var(--lcars-font);
          font-size: var(--lcars-font-size-data);
          text-transform: uppercase;
          text-align: left;
          cursor: pointer;
          width: calc(100% - 0.25rem);
          transition: filter var(--lcars-transition), background var(--lcars-transition);
          user-select: none;
          white-space: nowrap;
          overflow: hidden;
          flex-shrink: 0;
        }
        .sidebar-area-btn:hover { filter: brightness(1.2); }
        .sidebar-area-btn:focus-visible {
          outline: 2px solid var(--lcars-ice);
          outline-offset: 2px;
        }
        .sidebar-area-btn[data-active] { background: var(--lcars-gold); }
        .sidebar-area-btn ha-icon { --mdc-icon-size: 18px; flex-shrink: 0; }
        .sidebar-area-btn .area-name { overflow: hidden; text-overflow: ellipsis; flex: 1; }

        /* ─── Sidebar Nav Buttons (bottom) ─── */
        .lcars-sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: var(--lcars-gap);
          flex-shrink: 0;
        }

        /* ─── Main Content Area ─── */
        .lcars-content {
          grid-column: 2;
          grid-row: 2;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        /* ─── Bottom-Left Elbow ─── */
        .lcars-elbow-bottom {
          grid-column: 1;
          grid-row: 3;
          background: var(--lcars-elbow-bottom);
          border-radius: 0 0 0 var(--lcars-elbow-radius);
          position: relative;
          overflow: hidden;
        }

        .lcars-elbow-bottom::after {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: calc(var(--lcars-sidebar-w) - var(--lcars-elbow-w) + 2rem);
          height: calc(var(--lcars-elbow-h) - var(--lcars-bar-h));
          background: var(--lcars-bg);
          border-radius: 1.875rem 0 0 0;
        }

        /* ─── Footer Bar ─── */
        .lcars-footer {
          grid-column: 2;
          grid-row: 3;
          display: flex;
          align-items: flex-start;
          gap: var(--lcars-gap);
        }

        .lcars-footer-bar {
          flex: 1;
          height: var(--lcars-bar-h);
          background: var(--lcars-footer-bar);
        }

        .lcars-footer-endcap {
          width: var(--lcars-endcap);
          height: var(--lcars-bar-h);
          background: var(--lcars-footer-bar);
          border-radius: 0 var(--lcars-endcap) var(--lcars-endcap) 0;
        }

        .lcars-footer-text {
          font-size: var(--lcars-font-size-data);
          color: var(--lcars-sky);
          padding: 0 0.5rem;
          white-space: nowrap;
          line-height: var(--lcars-bar-h);
        }

        /* ─── Mobile: Collapse sidebar to top nav ─── */
        @media (max-width: 767px) {
          .lcars-frame {
            grid-template-columns: 1fr;
            grid-template-rows: auto auto 1fr auto;
          }

          .lcars-elbow-top,
          .lcars-elbow-bottom {
            display: none;
          }

          .lcars-header {
            grid-column: 1;
            grid-row: 1;
          }

          .lcars-sidebar {
            grid-column: 1;
            grid-row: 2;
            flex-direction: row;
            overflow-x: auto;
            overflow-y: hidden;
            padding: var(--lcars-gap) 0;
          }

          .lcars-sidebar-panel { display: none; }

          .lcars-sidebar-areas {
            flex-direction: row;
            overflow-x: auto;
            overflow-y: hidden;
            mask-image: none;
            -webkit-mask-image: none;
          }

          .sidebar-area-btn {
            flex-shrink: 0;
            width: auto;
            min-width: 8rem;
          }

          .lcars-sidebar-nav {
            flex-direction: row;
          }

          .lcars-content {
            grid-column: 1;
            grid-row: 3;
          }

          .lcars-footer {
            grid-column: 1;
            grid-row: 4;
          }
        }
      `,
    ];
  }

  render() {
    const areas = this._getAreas();

    return html`
      <div class="lcars-frame" role="main">
        <!-- Top-Left Elbow -->
        <div class="lcars-elbow-top" aria-hidden="true"></div>

        <!-- Header Bar -->
        <div class="lcars-header" role="banner">
          <span class="lcars-header-title">LCARS</span>
          <div class="lcars-header-bar"></div>
          <div class="lcars-header-endcap"></div>
        </div>

        <!-- Sidebar -->
        <nav class="lcars-sidebar" role="navigation" aria-label="Dashboard navigation">
          <div class="lcars-sidebar-panel">Areas</div>

          <!-- Area buttons (scrollable) -->
          <div class="lcars-sidebar-areas" role="group" aria-label="Area selection">
            ${areas.map((area) => html`
              <button class="sidebar-area-btn"
                ?data-active=${this._selectedArea === area.area_id}
                aria-pressed=${this._selectedArea === area.area_id}
                @click=${() => this._selectArea(area.area_id)}>
                <ha-icon .icon=${area.icon || 'mdi:home-outline'}></ha-icon>
                <span class="area-name">${area.name}</span>
              </button>
            `)}
          </div>

          <!-- Fixed nav buttons at bottom -->
          <div class="lcars-sidebar-nav">
            <slot name="sidebar"></slot>
          </div>
        </nav>

        <!-- Main Content -->
        <div class="lcars-content" role="region" aria-label="Dashboard content" aria-live="polite">
          ${this.cards && this.cards.length > 0
            ? this.cards.map((card) => html`${card}`)
            : html`<div class="lcars-heading">No data available</div>`}
        </div>

        <!-- Bottom-Left Elbow -->
        <div class="lcars-elbow-bottom" aria-hidden="true"></div>

        <!-- Footer Bar -->
        <div class="lcars-footer" role="contentinfo">
          <div class="lcars-footer-bar"></div>
          <span class="lcars-footer-text">LCARS 47</span>
          <div class="lcars-footer-endcap"></div>
        </div>
      </div>
    `;
  }
}

// Register with timeout fallback (hui-masonry-view may be renamed in future HA)
const ready = Promise.race([
  customElements.whenDefined('hui-masonry-view'),
  new Promise((r) => setTimeout(r, 5000)),
]);
ready.then(() => {
  if (!customElements.get('lcars-dashboard-layout')) {
    customElements.define('lcars-dashboard-layout', LcarsDashboardLayout);
    const pkg = require('../package.json');
    console.info(
      `%c LCARS-DASHBOARD \n%c Version ${pkg.version}`,
      'color: #ff9966; font-weight: bold; background: black',
      'color: #f5f6fa; font-weight: bold; background: #333'
    );
  }
});
