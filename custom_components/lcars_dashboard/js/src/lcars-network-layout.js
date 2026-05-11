/**
 * lcars-network-layout.js
 *
 * LCARS frame layout for the Subspace Relay (Network) dashboard.
 * Sidebar: ALL / HEALTH / PERIPHERALS / CLIENTS filter buttons.
 *   CLIENTS panel ships in 5.2.1 with default-redacted hostnames+MACs and a
 *   per-session reveal toggle (auto-reverts after 60s; never persisted).
 * Color: butterscotch frame, ice sidebar — distinct from Engineering's african-violet.
 *
 * v5.2.0-beta.1 — Subspace Relay Dashboard (5X-3.3 retired)
 * Per specs/LCARS-SUBSPACE-RELAY-DASHBOARD-SPEC.md
 */
import { LitElement, html, css } from 'lit-element';
import { lcarsBaseStyles } from './lcars-styles.js';
import { lcarsEventBus } from './lcars-helpers.js';
import { lcarsAudio } from './lcars-audio.js';
import { ensureLcarsSidebarTop } from './lcars-sidebar-reorder.js';
import lcarsPkg from '../package.json';

const TAG = 'NetworkLayout';
const FILTER_ALL = 'all';
const FILTER_HEALTH = 'health';
const FILTER_PERIPHERALS = 'peripherals';
const FILTER_CLIENTS = 'clients';

class LcarsNetworkLayout extends LitElement {

  static get properties() {
    return {
      cards: { type: Array }, _hass: { type: Object }, _config: { type: Object },
      _filter: { type: String }, _siteName: { type: String },
      _audioMuted: { type: Boolean }, _editMode: { type: Boolean },
    };
  }

  constructor() {
    super();
    this.cards = []; this._hass = null; this._config = {};
    this._filter = FILTER_ALL; this._siteName = 'LCARS';
    this._audioMuted = lcarsAudio.isMuted; this._editMode = false;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }

  setConfig(config) { this._config = config; }

  set hass(hass) {
    this._hass = hass;
    if (hass?.config?.location_name) this._siteName = hass.config.location_name.toUpperCase();
    if (this.cards) this.cards.forEach((c) => { if (c) c.hass = hass; });
    ensureLcarsSidebarTop(hass);
  }

  _setFilter(filter) {
    this._filter = filter;
    lcarsAudio.play('navAcknowledge');
    lcarsEventBus.dispatchEvent(new CustomEvent('lcars-net-filter', { detail: { filter } }));
  }

  _toggleMute() { lcarsAudio.toggle(); this._audioMuted = lcarsAudio.isMuted; }

  _openSidebarReorder() {
    if (!this._hass?.user?.is_admin) return;
    let dialog = this.shadowRoot.querySelector('lcars-sidebar-reorder');
    if (!dialog) {
      dialog = document.createElement('lcars-sidebar-reorder');
      this.shadowRoot.appendChild(dialog);
    }
    dialog.hass = this._hass;
    dialog.open();
  }

  _toggleEditMode() {
    this._editMode = !this._editMode;
    lcarsEventBus.dispatchEvent(new CustomEvent('lcars-net-edit', { detail: { enabled: this._editMode } }));
  }

  render() {
    const version = lcarsPkg.version;
    return html`
      <div class="lcars-frame">
        <div class="lcars-elbow-top" aria-hidden="true"></div>
        <div class="lcars-header" role="banner">
          <span class="lcars-header-title">${this._siteName}</span>
          <div class="lcars-header-bar" aria-hidden="true"></div>
          <div class="lcars-header-endcap">
            <button class="mute-btn" role="switch" aria-checked=${!this._audioMuted} @click=${() => this._toggleMute()} aria-label=${this._audioMuted ? 'Unmute LCARS audio' : 'Mute LCARS audio'}>
              <ha-icon .icon=${this._audioMuted ? 'mdi:volume-off' : 'mdi:volume-high'}></ha-icon>
            </button>
            ${this._hass?.user?.is_admin ? html`
              <button class="mute-btn" aria-label="Reorder sidebar dashboards" @click=${() => this._openSidebarReorder()}>
                <ha-icon .icon=${'mdi:sort-variant'}></ha-icon>
              </button>
              <button class="mute-btn" aria-pressed=${this._editMode} aria-label="Toggle edit mode" @click=${() => this._toggleEditMode()}>
                <ha-icon .icon=${'mdi:cog-outline'}></ha-icon>
              </button>
            ` : ''}
          </div>
        </div>
        <nav class="lcars-sidebar" role="tablist" aria-label="Filter network systems">
          <div class="lcars-sidebar-panel">Subspace Relay</div>
          <div class="lcars-sidebar-filters">
            <button class="sidebar-filter-btn ${this._filter === FILTER_ALL ? 'active' : ''}" role="tab" aria-selected="${this._filter === FILTER_ALL ? 'true' : 'false'}" aria-controls="net-content" tabindex="${this._filter === FILTER_ALL ? '0' : '-1'}" @click=${() => this._setFilter(FILTER_ALL)}><span class="filter-label">ALL</span></button>
            <button class="sidebar-filter-btn ${this._filter === FILTER_HEALTH ? 'active' : ''}" role="tab" aria-selected="${this._filter === FILTER_HEALTH ? 'true' : 'false'}" aria-controls="net-content" tabindex="${this._filter === FILTER_HEALTH ? '0' : '-1'}" @click=${() => this._setFilter(FILTER_HEALTH)}><span class="filter-label">HEALTH</span></button>
            <button class="sidebar-filter-btn ${this._filter === FILTER_PERIPHERALS ? 'active' : ''}" role="tab" aria-selected="${this._filter === FILTER_PERIPHERALS ? 'true' : 'false'}" aria-controls="net-content" tabindex="${this._filter === FILTER_PERIPHERALS ? '0' : '-1'}" @click=${() => this._setFilter(FILTER_PERIPHERALS)}><span class="filter-label">PERIPHERALS</span></button>
            <button class="sidebar-filter-btn ${this._filter === FILTER_CLIENTS ? 'active' : ''}" role="tab" aria-selected="${this._filter === FILTER_CLIENTS ? 'true' : 'false'}" aria-controls="net-content" tabindex="${this._filter === FILTER_CLIENTS ? '0' : '-1'}" title="Connected Clients (default-redacted; reveal is per-session only)" @click=${() => this._setFilter(FILTER_CLIENTS)}><span class="filter-label">CLIENTS</span></button>
          </div>
          <div class="lcars-sidebar-filler" aria-hidden="true"></div>
        </nav>
        <main id="net-content" class="lcars-content" role="tabpanel" tabindex="0" aria-label="Subspace Relay dashboard">
          ${this.cards?.length > 0 ? this.cards.map((c) => html`${c}`) : html`<div class="lcars-heading">No data available</div>`}
        </main>
        <div class="lcars-elbow-bottom" aria-hidden="true"></div>
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
        :host { display: block; height: calc(100vh - var(--header-height, 0px)); overflow: hidden; box-sizing: border-box; background: var(--lcars-bg, #000); padding: var(--lcars-gap, 0.25rem); }
        .lcars-frame { display: grid; grid-template-columns: var(--lcars-sidebar-w, 12rem) 1fr; grid-template-rows: var(--lcars-elbow-h, 4.5rem) 1fr var(--lcars-elbow-h, 4.5rem); gap: var(--lcars-gap, 0.25rem); height: 100%; }
        .lcars-elbow-top { grid-column: 1; grid-row: 1; background: var(--lcars-butterscotch, #ff9966); border-radius: var(--lcars-elbow-radius, 3.75rem) 0 0 0; position: relative; overflow: hidden; }
        .lcars-elbow-top::after { content: ''; position: absolute; bottom: 0; right: 0; width: calc(var(--lcars-sidebar-w, 12rem) - var(--lcars-elbow-w, 9.5rem)); height: calc(var(--lcars-elbow-h, 4.5rem) - var(--lcars-bar-h, 1.5rem)); background: var(--lcars-bg, #000); border-radius: 1.5rem 0 0 0; }
        .lcars-header { grid-column: 2; grid-row: 1; display: flex; align-items: flex-start; gap: var(--lcars-gap, 0.25rem); }
        .lcars-header-title { font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: var(--lcars-font-size-title, 2rem); color: var(--lcars-butterscotch, #ff9966); text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap; line-height: var(--lcars-bar-h, 1.5rem); padding: 0 1rem; }
        .lcars-header-bar { flex: 1; height: var(--lcars-bar-h, 1.5rem); background: var(--lcars-butterscotch, #ff9966); }
        .lcars-header-endcap { height: var(--lcars-bar-h, 1.5rem); background: var(--lcars-butterscotch, #ff9966); border-radius: 0; display: flex; align-items: center; padding: 0 0.5rem; }
        .mute-btn { background: none; border: none; cursor: pointer; color: var(--lcars-black, #000); padding: 0 0.25rem; display: flex; align-items: center; min-width: 44px; min-height: 44px; justify-content: center; }
        .mute-btn:focus-visible { outline: 2px solid var(--lcars-ice, #99ccff); outline-offset: 2px; }
        .mute-btn ha-icon { --mdc-icon-size: 18px; }
        .lcars-sidebar { grid-column: 1; grid-row: 2; display: flex; flex-direction: column; gap: var(--lcars-gap, 0.25rem); overflow: hidden; }
        .lcars-sidebar-panel { background: var(--lcars-ice, #99ccff); color: var(--lcars-black, #000); font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: var(--lcars-font-size-data, 0.875rem); text-transform: uppercase; padding: 0.25rem 0.5rem; text-align: right; border-radius: 0 0 0 var(--lcars-btn-radius, 1.5rem); flex-shrink: 0; }
        .lcars-sidebar-filters { display: flex; flex-direction: column; gap: var(--lcars-gap, 0.25rem); flex: 1; }
        .sidebar-filter-btn { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.25rem; border: none; border-radius: var(--lcars-btn-radius, 1.5rem) 0 0 var(--lcars-btn-radius, 1.5rem); background: var(--lcars-ice, #99ccff); color: var(--lcars-black, #000); font-family: var(--lcars-font, 'Antonio', sans-serif); text-transform: uppercase; cursor: pointer; transition: background 200ms ease; padding: 0.5rem; min-height: 44px; }
        @media (prefers-reduced-motion: reduce) { .sidebar-filter-btn { transition: none; } }
        .sidebar-filter-btn:hover { filter: brightness(1.2); }
        .sidebar-filter-btn:focus-visible { outline: 2px solid var(--lcars-ice, #99ccff); outline-offset: 2px; }
        .sidebar-filter-btn.active { background: var(--lcars-gold, #ffaa00); }
        .sidebar-filter-btn.deferred { opacity: 0.45; cursor: not-allowed; background: var(--lcars-gray, #666688); }
        .sidebar-filter-btn.deferred:hover { filter: none; }
        .filter-label { font-size: 1.25rem; letter-spacing: 0.08em; text-align: center; }
        .filter-sublabel { font-size: 0.7rem; letter-spacing: 0.05em; opacity: 0.85; }
        .net-toast { background: var(--lcars-gold, #ffaa00); color: #000; padding: 0.5rem 0.75rem; border-radius: 0.4rem; margin: 0 0 0.5rem; font-family: var(--lcars-font, 'Antonio', sans-serif); text-transform: uppercase; letter-spacing: 0.05em; font-size: 0.85rem; }
        .lcars-sidebar-filler { flex: 1 0 0px; min-height: 0; background: var(--lcars-gray, #666688); border-radius: var(--lcars-btn-radius, 1.5rem) 0 0 0; }
        .lcars-content { grid-column: 2; grid-row: 2; overflow-y: auto; overflow-x: hidden; padding: 0.5rem; scrollbar-width: thin; scrollbar-color: var(--lcars-gray, #666688) transparent; }
        .lcars-elbow-bottom { grid-column: 1; grid-row: 3; background: var(--lcars-ice, #99ccff); border-radius: 0 0 0 var(--lcars-elbow-radius, 3.75rem); position: relative; overflow: hidden; }
        .lcars-elbow-bottom::after { content: ''; position: absolute; top: 0; right: 0; width: calc(var(--lcars-sidebar-w, 12rem) - var(--lcars-elbow-w, 9.5rem)); height: calc(var(--lcars-elbow-h, 4.5rem) - var(--lcars-bar-h, 1.5rem)); background: var(--lcars-bg, #000); border-radius: 0 0 0 1.5rem; }
        .lcars-footer { grid-column: 2; grid-row: 3; display: flex; align-items: flex-end; gap: var(--lcars-gap, 0.25rem); }
        .lcars-footer-bar { flex: 1; height: var(--lcars-bar-h, 1.5rem); background: var(--lcars-ice, #99ccff); }
        .lcars-footer-text { font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: var(--lcars-font-size-data, 0.875rem); color: var(--lcars-sky, #aaaaff); text-transform: uppercase; white-space: nowrap; line-height: var(--lcars-bar-h, 1.5rem); padding: 0 0.5rem; }
        .lcars-footer-endcap { width: var(--lcars-endcap-size, 1.5rem); height: var(--lcars-bar-h, 1.5rem); background: var(--lcars-ice, #99ccff); border-radius: 0; flex-shrink: 0; }
      `,
    ];
  }
}

const ready = Promise.race([customElements.whenDefined('hui-masonry-view'), new Promise((r) => setTimeout(r, 5000))]);
ready.then(() => { if (!customElements.get('lcars-network-layout')) { customElements.define('lcars-network-layout', LcarsNetworkLayout); } });
