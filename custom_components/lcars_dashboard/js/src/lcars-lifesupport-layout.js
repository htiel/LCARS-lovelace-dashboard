/**
 * lcars-lifesupport-layout.js
 *
 * LCARS frame layout for the Life Support (Environmental) dashboard.
 * Sidebar: ALL / CLIMATE / AIR filter buttons.
 * Color: ice frame (environmental blue), african-violet sidebar.
 *
 * v5.0.0 — 5X-2.4 Environmental Dashboard
 */
import { LitElement, html, css } from 'lit-element';
import { lcarsBaseStyles } from './lcars-styles.js';
import { lcarsLog, lcarsEventBus } from './lcars-helpers.js';
import { lcarsAudio } from './lcars-audio.js';
import { ensureLcarsSidebarTop } from './lcars-sidebar-reorder.js';
import lcarsPkg from '../package.json';

const TAG = 'LifeSupportLayout';
const FILTER_ALL = 'all';
const FILTER_CLIMATE = 'climate';
const FILTER_AIR = 'air';

class LcarsLifeSupportLayout extends LitElement {

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
    lcarsEventBus.dispatchEvent(new CustomEvent('lcars-ls-filter', { detail: { filter } }));
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
    lcarsEventBus.dispatchEvent(new CustomEvent('lcars-ls-edit', { detail: { enabled: this._editMode } }));
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
            <button class="mute-btn" role="switch" aria-checked=${!this._audioMuted} aria-label=${this._audioMuted ? 'Unmute LCARS audio' : 'Mute LCARS audio'} @click=${() => this._toggleMute()}>
              <ha-icon .icon=${this._audioMuted ? 'mdi:volume-off' : 'mdi:volume-high'}></ha-icon>
            </button>
            ${this._hass?.user?.is_admin ? html`
              <button class="mute-btn" aria-label="Reorder sidebar dashboards" @click=${() => this._openSidebarReorder()}>
                <ha-icon .icon=${'mdi:sort-variant'}></ha-icon>
              </button>
              <button class="mute-btn" aria-pressed=${this._editMode} @click=${() => this._toggleEditMode()}>
                <ha-icon .icon=${'mdi:cog-outline'}></ha-icon>
              </button>
            ` : ''}
          </div>
        </div>
        <nav class="lcars-sidebar" role="tablist" aria-label="Filter life support devices">
          <div class="lcars-sidebar-panel">Life Support</div>
          <div class="lcars-sidebar-filters">
            <button class="sidebar-filter-btn ${this._filter === FILTER_ALL ? 'active' : ''}" role="tab" aria-selected="${this._filter === FILTER_ALL ? 'true' : 'false'}" @click=${() => this._setFilter(FILTER_ALL)}><span class="filter-label">ALL</span></button>
            <button class="sidebar-filter-btn ${this._filter === FILTER_CLIMATE ? 'active' : ''}" role="tab" aria-selected="${this._filter === FILTER_CLIMATE ? 'true' : 'false'}" @click=${() => this._setFilter(FILTER_CLIMATE)}><span class="filter-label">CLIMATE</span></button>
            <button class="sidebar-filter-btn ${this._filter === FILTER_AIR ? 'active' : ''}" role="tab" aria-selected="${this._filter === FILTER_AIR ? 'true' : 'false'}" @click=${() => this._setFilter(FILTER_AIR)}><span class="filter-label">AIR</span></button>
          </div>
          <div class="lcars-sidebar-filler" aria-hidden="true"></div>
        </nav>
        <main class="lcars-content" aria-label="Life support dashboard">
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
        .lcars-elbow-top { grid-column: 1; grid-row: 1; background: var(--lcars-bluey, #8899ff); border-radius: var(--lcars-elbow-radius, 3.75rem) 0 0 0; position: relative; overflow: hidden; }
        .lcars-elbow-top::after { content: ''; position: absolute; bottom: 0; right: 0; width: calc(var(--lcars-sidebar-w, 12rem) - var(--lcars-elbow-w, 9.5rem)); height: calc(var(--lcars-elbow-h, 4.5rem) - var(--lcars-bar-h, 1.5rem)); background: var(--lcars-bg, #000); border-radius: 1.5rem 0 0 0; }
        .lcars-header { grid-column: 2; grid-row: 1; display: flex; align-items: flex-start; gap: var(--lcars-gap, 0.25rem); }
        .lcars-header-title { font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: var(--lcars-font-size-title, 2rem); color: var(--lcars-bluey, #8899ff); text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap; line-height: var(--lcars-bar-h, 1.5rem); padding: 0 1rem; }
        .lcars-header-bar { flex: 1; height: var(--lcars-bar-h, 1.5rem); background: var(--lcars-bluey, #8899ff); }
        .lcars-header-endcap { height: var(--lcars-bar-h, 1.5rem); background: var(--lcars-bluey, #8899ff); border-radius: 0; display: flex; align-items: center; padding: 0 0.5rem; }
        .mute-btn { background: none; border: none; cursor: pointer; color: var(--lcars-black, #000); padding: 0 0.25rem; display: flex; align-items: center; }
        .mute-btn:focus-visible { outline: 2px solid var(--lcars-ice, #99ccff); outline-offset: 2px; }
        .mute-btn ha-icon { --mdc-icon-size: 18px; }
        .lcars-sidebar { grid-column: 1; grid-row: 2; display: flex; flex-direction: column; gap: var(--lcars-gap, 0.25rem); overflow: hidden; }
        .lcars-sidebar-panel { background: var(--lcars-african-violet, #cc99ff); color: var(--lcars-black, #000); font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: var(--lcars-font-size-data, 0.875rem); text-transform: uppercase; padding: 0.25rem 0.5rem; text-align: right; border-radius: 0 0 0 var(--lcars-btn-radius, 1.5rem); flex-shrink: 0; }
        .lcars-sidebar-filters { display: flex; flex-direction: column; gap: var(--lcars-gap, 0.25rem); flex: 1; }
        .sidebar-filter-btn { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem; border: none; border-radius: var(--lcars-btn-radius, 1.5rem) 0 0 var(--lcars-btn-radius, 1.5rem); background: var(--lcars-african-violet, #cc99ff); color: var(--lcars-black, #000); font-family: var(--lcars-font, 'Antonio', sans-serif); text-transform: uppercase; cursor: pointer; transition: background 200ms ease; padding: 0.5rem; }
        .sidebar-filter-btn:hover { filter: brightness(1.2); }
        .sidebar-filter-btn:focus-visible { outline: 2px solid var(--lcars-ice, #99ccff); outline-offset: 2px; }
        .sidebar-filter-btn.active { background: var(--lcars-gold, #ffaa00); }
        .filter-label { font-size: 1.25rem; letter-spacing: 0.08em; text-align: center; }
        .lcars-sidebar-filler { flex: 1 0 0px; min-height: 0; background: var(--lcars-gray, #666688); border-radius: var(--lcars-btn-radius, 1.5rem) 0 0 0; }
        .lcars-content { grid-column: 2; grid-row: 2; overflow-y: auto; overflow-x: hidden; padding: 0.5rem; scrollbar-width: thin; scrollbar-color: var(--lcars-gray, #666688) transparent; }
        .lcars-elbow-bottom { grid-column: 1; grid-row: 3; background: var(--lcars-african-violet, #cc99ff); border-radius: 0 0 0 var(--lcars-elbow-radius, 3.75rem); position: relative; overflow: hidden; }
        .lcars-elbow-bottom::after { content: ''; position: absolute; top: 0; right: 0; width: calc(var(--lcars-sidebar-w, 12rem) - var(--lcars-elbow-w, 9.5rem)); height: calc(var(--lcars-elbow-h, 4.5rem) - var(--lcars-bar-h, 1.5rem)); background: var(--lcars-bg, #000); border-radius: 0 0 0 1.5rem; }
        .lcars-footer { grid-column: 2; grid-row: 3; display: flex; align-items: flex-end; gap: var(--lcars-gap, 0.25rem); }
        .lcars-footer-bar { flex: 1; height: var(--lcars-bar-h, 1.5rem); background: var(--lcars-african-violet, #cc99ff); }
        .lcars-footer-text { font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: var(--lcars-font-size-data, 0.875rem); color: var(--lcars-sky, #aaaaff); text-transform: uppercase; white-space: nowrap; line-height: var(--lcars-bar-h, 1.5rem); padding: 0 0.5rem; }
        .lcars-footer-endcap { width: var(--lcars-endcap-size, 1.5rem); height: var(--lcars-bar-h, 1.5rem); background: var(--lcars-african-violet, #cc99ff); border-radius: 0; flex-shrink: 0; }
      `,
    ];
  }
}

const ready = Promise.race([customElements.whenDefined('hui-masonry-view'), new Promise((r) => setTimeout(r, 5000))]);
ready.then(() => { if (!customElements.get('lcars-lifesupport-layout')) { customElements.define('lcars-lifesupport-layout', LcarsLifeSupportLayout); } });
