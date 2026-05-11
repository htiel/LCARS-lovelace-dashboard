/**
 * lcars-starship-layout.js
 *
 * LCARS frame layout for the Starship Health (Engineering) dashboard.
 * Color: gold top elbow + butterscotch sidebar/bottom — distinct from Medical's
 * gold+african-violet and Subspace Relay's butterscotch+ice.
 *
 * v5.4.1 — single+multi-host. Per LCARS-STARSHIP-HEALTH-DASHBOARD-SPEC.
 *
 * PRIVACY (Worf §7): no outbound network requests originate from this frame.
 *   The audio mode is 'engineering' (existing) — navAcknowledge on focus tab
 *   changes is dispatched by the card itself.
 */
import { LitElement, html, css } from 'lit-element';
import { lcarsBaseStyles } from './lcars-styles.js';
import { lcarsAudio } from './lcars-audio.js';
import { ensureLcarsSidebarTop } from './lcars-sidebar-reorder.js';
import lcarsPkg from '../package.json';

class LcarsStarshipLayout extends LitElement {
  static get properties() {
    return {
      cards: { type: Array },
      _hass: { type: Object },
      _config: { type: Object },
      _siteName: { type: String },
      _audioMuted: { type: Boolean },
    };
  }

  constructor() {
    super();
    this.cards = [];
    this._hass = null;
    this._config = {};
    this._siteName = 'STARSHIP HEALTH';
    this._audioMuted = lcarsAudio.isMuted;
  }

  setConfig(config) { this._config = config; }

  set hass(hass) {
    this._hass = hass;
    if (this.cards) this.cards.forEach((c) => { if (c) c.hass = hass; });
    ensureLcarsSidebarTop(hass);
  }

  _toggleMute() {
    lcarsAudio.toggle();
    this._audioMuted = lcarsAudio.isMuted;
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
            <button class="mute-btn" role="switch" aria-checked=${!this._audioMuted}
                    @click=${() => this._toggleMute()}
                    aria-label=${this._audioMuted ? 'Unmute LCARS audio' : 'Mute LCARS audio'}>
              <ha-icon .icon=${this._audioMuted ? 'mdi:volume-off' : 'mdi:volume-high'}></ha-icon>
            </button>
          </div>
        </div>
        <nav class="lcars-sidebar" aria-label="Engineering">
          <div class="lcars-sidebar-panel">Engineering</div>
          <div class="lcars-sidebar-subpanel">Vessel Status</div>
          <div class="lcars-sidebar-filler" aria-hidden="true"></div>
        </nav>
        <main id="ship-content" class="lcars-content" aria-label="Starship Health dashboard">
          ${this.cards?.length > 0
            ? this.cards.map((c) => html`${c}`)
            : html`<div class="lcars-heading">No data available</div>`}
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
        .lcars-elbow-top { grid-column: 1; grid-row: 1; background: var(--lcars-gold, #ffaa00); border-radius: var(--lcars-elbow-radius, 3.75rem) 0 0 0; position: relative; overflow: hidden; }
        .lcars-elbow-top::after { content: ''; position: absolute; bottom: 0; right: 0; width: calc(var(--lcars-sidebar-w, 12rem) - var(--lcars-elbow-w, 9.5rem)); height: calc(var(--lcars-elbow-h, 4.5rem) - var(--lcars-bar-h, 1.5rem)); background: var(--lcars-bg, #000); border-radius: 1.5rem 0 0 0; }
        .lcars-header { grid-column: 2; grid-row: 1; display: flex; align-items: flex-start; gap: var(--lcars-gap, 0.25rem); }
        .lcars-header-title { font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: var(--lcars-font-size-title, 2rem); color: var(--lcars-gold, #ffaa00); text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap; line-height: var(--lcars-bar-h, 1.5rem); padding: 0 1rem; }
        .lcars-header-bar { flex: 1; height: var(--lcars-bar-h, 1.5rem); background: var(--lcars-gold, #ffaa00); }
        .lcars-header-endcap { height: var(--lcars-bar-h, 1.5rem); background: var(--lcars-gold, #ffaa00); display: flex; align-items: center; padding: 0 0.5rem; }
        .mute-btn { background: none; border: none; cursor: pointer; color: var(--lcars-black, #000); padding: 0 0.25rem; display: flex; align-items: center; min-width: 44px; min-height: 44px; justify-content: center; }
        .mute-btn:focus-visible { outline: 2px solid var(--lcars-ice, #99ccff); outline-offset: 2px; }
        .mute-btn ha-icon { --mdc-icon-size: 18px; }
        .lcars-sidebar { grid-column: 1; grid-row: 2; display: flex; flex-direction: column; gap: var(--lcars-gap, 0.25rem); overflow: hidden; }
        .lcars-sidebar-panel { background: var(--lcars-butterscotch, #ff9966); color: var(--lcars-black, #000); font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: var(--lcars-font-size-data, 0.875rem); text-transform: uppercase; padding: 0.25rem 0.5rem; text-align: right; flex-shrink: 0; }
        .lcars-sidebar-subpanel { background: var(--lcars-butterscotch, #ff9966); color: var(--lcars-black, #000); font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 0.75rem; text-transform: uppercase; padding: 0.25rem 0.5rem; text-align: right; opacity: 0.8; flex-shrink: 0; }
        .lcars-sidebar-filler { flex: 1 0 0px; min-height: 0; background: var(--lcars-butterscotch, #ff9966); border-radius: 0 0 0 var(--lcars-btn-radius, 1.5rem); opacity: 0.55; }
        .lcars-content { grid-column: 2; grid-row: 2; overflow-y: auto; overflow-x: hidden; padding: 0.5rem; scrollbar-width: thin; scrollbar-color: var(--lcars-gray, #666688) transparent; }
        .lcars-elbow-bottom { grid-column: 1; grid-row: 3; background: var(--lcars-butterscotch, #ff9966); border-radius: 0 0 0 var(--lcars-elbow-radius, 3.75rem); position: relative; overflow: hidden; }
        .lcars-elbow-bottom::after { content: ''; position: absolute; top: 0; right: 0; width: calc(var(--lcars-sidebar-w, 12rem) - var(--lcars-elbow-w, 9.5rem)); height: calc(var(--lcars-elbow-h, 4.5rem) - var(--lcars-bar-h, 1.5rem)); background: var(--lcars-bg, #000); border-radius: 0 0 0 1.5rem; }
        .lcars-footer { grid-column: 2; grid-row: 3; display: flex; align-items: flex-end; gap: var(--lcars-gap, 0.25rem); }
        .lcars-footer-bar { flex: 1; height: var(--lcars-bar-h, 1.5rem); background: var(--lcars-butterscotch, #ff9966); }
        .lcars-footer-text { font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: var(--lcars-font-size-data, 0.875rem); color: var(--lcars-butterscotch, #ff9966); text-transform: uppercase; white-space: nowrap; line-height: var(--lcars-bar-h, 1.5rem); padding: 0 0.5rem; }
        .lcars-footer-endcap { width: var(--lcars-endcap-size, 1.5rem); height: var(--lcars-bar-h, 1.5rem); background: var(--lcars-butterscotch, #ff9966); flex-shrink: 0; }
      `,
    ];
  }
}

const ready = Promise.race([
  customElements.whenDefined('hui-masonry-view'),
  new Promise((r) => setTimeout(r, 5000)),
]);
ready.then(() => {
  if (!customElements.get('lcars-starship-layout')) {
    customElements.define('lcars-starship-layout', LcarsStarshipLayout);
  }
});
