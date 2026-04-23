/**
 * lcars-illumination-card.js
 *
 * Illumination Dashboard — standalone Lovelace card showing all lighting
 * and switches across all areas, grouped by floor → area.
 *
 * Three filter modes: ALL DEVICES, LIGHTS (dimmable), CIRCUITS (switches).
 * Reuses <lcars-illumination-panel> for per-area rendering.
 *
 * v5.0.0 — 5X-2.5 Lighting Dashboard
 */
import { LitElement, html, css } from 'lit-element';
import { getHass, lcarsLog } from './lcars-helpers.js';
import { lcarsBaseStyles } from './lcars-styles.js';
import { getFloors, getAreasByFloor } from './lcars-hierarchy-utils.js';
import { getAreaEntities } from './lcars-entity-query.js';
import { isLightingEntity, isDiagnosticEntity } from './lcars-entity-utils.js';
import { lcarsAudio } from './lcars-audio.js';

// Side-effect: register panel custom elements
import './panels/illumination/lcars-illumination-panel.js';
import './components/lcars-summary-badge/lcars-summary-badge.js';

const TAG = 'IlluminationCard';
const FILTER_ALL = 'all';
const FILTER_LIGHTS = 'lights';
const FILTER_CIRCUITS = 'circuits';

class LcarsIlluminationCard extends LitElement {

  static get properties() {
    return {
      hass: { type: Object },
      _config: { type: Object },
      _filter: { type: String },
    };
  }

  constructor() {
    super();
    this.hass = null;
    this._config = {};
    this._filter = FILTER_ALL;
    this._entityCache = new Map();
  }

  setConfig(config) {
    this._config = config || {};
  }

  set hass(val) {
    const old = this._hass;
    this._hass = val;
    if (val && old !== val) {
      this._entityCache.clear();
      this.requestUpdate('hass', old);
    }
  }

  get hass() { return this._hass; }

  getCardSize() { return 12; }

  /* ─── Entity resolution ─── */

  _getAreasWithLighting() {
    if (!this._hass) return [];

    const floors = getFloors(this._hass);
    const floorMap = getAreasByFloor(this._hass);
    const result = [];

    // Process floors in order
    for (const floor of floors) {
      const areas = floorMap.get(floor.floor_id) || [];
      const floorAreas = [];
      for (const area of areas) {
        const areaData = this._resolveAreaEntities(area);
        if (areaData) floorAreas.push(areaData);
      }
      if (floorAreas.length > 0) {
        result.push({ floor, areas: floorAreas });
      }
    }

    // Areas with no floor
    const noFloorAreas = floorMap.get(null) || [];
    const orphanAreas = [];
    for (const area of noFloorAreas) {
      const areaData = this._resolveAreaEntities(area);
      if (areaData) orphanAreas.push(areaData);
    }
    if (orphanAreas.length > 0) {
      result.push({ floor: null, areas: orphanAreas });
    }

    return result;
  }

  _resolveAreaEntities(area) {
    const rawEntities = getAreaEntities(this._hass, area.area_id, this._entityCache);

    const hydrated = [];
    for (const e of rawEntities) {
      const domain = e.entity_id.split('.')[0];
      const state = this._hass.states?.[e.entity_id];
      if (!state) continue;
      const entry = { entity: e, domain, state };
      if (isDiagnosticEntity(entry)) continue;
      hydrated.push(entry);
    }

    // Lighting entities (lights + lighting switches) and scenes
    const lightEntities = hydrated.filter(e => isLightingEntity(e) || e.domain === 'scene');
    if (lightEntities.length === 0) return null;

    // Pre-partition for filter counts
    const lights = lightEntities.filter(e => e.domain === 'light');
    const circuits = lightEntities.filter(e => e.domain !== 'light' && e.domain !== 'scene');
    const scenes = lightEntities.filter(e => e.domain === 'scene');

    return { area, lightEntities, lights, circuits, scenes };
  }

  /* ─── Filtering ─── */

  _getFilteredEntities(areaData) {
    if (this._filter === FILTER_LIGHTS) {
      // Dimmable lights + scenes only
      const filtered = [...areaData.lights, ...areaData.scenes];
      return filtered.length > 0 ? filtered : null;
    }
    if (this._filter === FILTER_CIRCUITS) {
      // Circuits (switches) only — no scenes
      return areaData.circuits.length > 0 ? areaData.circuits : null;
    }
    // ALL — everything
    return areaData.lightEntities;
  }

  /* ─── Summary counts ─── */

  _getGlobalCounts(floorGroups) {
    let lightsActive = 0;
    let lightsTotal = 0;
    let circuitsActive = 0;
    let circuitsTotal = 0;

    for (const { areas } of floorGroups) {
      for (const { lights, circuits } of areas) {
        for (const e of lights) {
          lightsTotal++;
          if (e.state?.state === 'on') lightsActive++;
        }
        for (const e of circuits) {
          circuitsTotal++;
          if (e.state?.state === 'on') circuitsActive++;
        }
      }
    }

    return {
      lightsActive, lightsTotal,
      circuitsActive, circuitsTotal,
      totalActive: lightsActive + circuitsActive,
      totalAll: lightsTotal + circuitsTotal,
    };
  }

  /* ─── Master toggle ─── */

  _getAreaLightState(entities) {
    const toggleable = entities.filter(e => e.domain !== 'scene');
    if (toggleable.length === 0) return 'empty';
    const onCount = toggleable.filter(e => e.state?.state === 'on').length;
    if (onCount === 0) return 'off';
    if (onCount === toggleable.length) return 'on';
    return 'mixed';
  }

  _toggleAreaLights(entities) {
    const toggleable = entities.filter(e => e.domain !== 'scene');
    if (toggleable.length === 0) return;
    const allOn = toggleable.every(e => e.state?.state === 'on');
    const service = allOn ? 'turn_off' : 'turn_on';

    for (const e of toggleable) {
      this._hass.callService('homeassistant', service, { entity_id: e.entity.entity_id });
    }
    lcarsAudio.play(allOn ? 'switchToggle' : 'lightToggle');
  }

  /* ─── Render ─── */

  render() {
    if (!this._hass) return html``;

    const floorGroups = this._getAreasWithLighting();
    const counts = this._getGlobalCounts(floorGroups);
    const version = require('../package.json').version;

    return html`
      <div class="lcars-frame">

        <!-- Top-Left Elbow -->
        <div class="lcars-elbow-top" aria-hidden="true">
          <span class="lcars-elbow-label">${this._hass.config?.location_name || 'LCARS'}</span>
        </div>

        <!-- Header Bar -->
        <div class="lcars-header" aria-hidden="true">
          <div class="lcars-header-bar"></div>
          <span class="lcars-header-title">ILLUMINATION CONTROL</span>
          <div class="lcars-header-endcap"></div>
        </div>

        <!-- Sidebar: 3 filter buttons stacked vertically -->
        <nav class="lcars-sidebar" role="tablist" aria-label="Filter illumination devices">
          <button class="ilm-sidebar-btn ${this._filter === FILTER_ALL ? 'active' : ''}"
                  role="tab"
                  aria-selected="${this._filter === FILTER_ALL ? 'true' : 'false'}"
                  @click=${() => this._setFilter(FILTER_ALL)}>
            <span class="ilm-sidebar-count">${counts.totalActive}/${counts.totalAll}</span>
            <span class="ilm-sidebar-label">ALL DEVICES</span>
          </button>
          <button class="ilm-sidebar-btn ${this._filter === FILTER_LIGHTS ? 'active' : ''}"
                  role="tab"
                  aria-selected="${this._filter === FILTER_LIGHTS ? 'true' : 'false'}"
                  @click=${() => this._setFilter(FILTER_LIGHTS)}>
            <span class="ilm-sidebar-count">${counts.lightsActive}/${counts.lightsTotal}</span>
            <span class="ilm-sidebar-label">LIGHTS</span>
          </button>
          <button class="ilm-sidebar-btn ${this._filter === FILTER_CIRCUITS ? 'active' : ''}"
                  role="tab"
                  aria-selected="${this._filter === FILTER_CIRCUITS ? 'true' : 'false'}"
                  @click=${() => this._setFilter(FILTER_CIRCUITS)}>
            <span class="ilm-sidebar-count">${counts.circuitsActive}/${counts.circuitsTotal}</span>
            <span class="ilm-sidebar-label">CIRCUITS</span>
          </button>
        </nav>

        <!-- Main Content -->
        <main class="lcars-content" role="main" aria-label="Illumination dashboard">
          ${floorGroups.map(({ floor, areas }) => {
            const visibleAreas = areas.filter(a => this._getFilteredEntities(a) !== null);
            if (visibleAreas.length === 0) return html``;

            return html`
              ${floor ? html`
                <div class="ilm-floor-header">
                  <span class="ilm-floor-name">${floor.name || 'FLOOR'}</span>
                  <span class="ilm-floor-line"></span>
                </div>
              ` : ''}
              ${visibleAreas.map(areaData => {
                const filtered = this._getFilteredEntities(areaData);
                return html`
                  <div class="ilm-area-section" data-area-id="${areaData.area.area_id}">
                    <div class="ilm-area-header">
                      <span class="ilm-area-name">${areaData.area.name}</span>
                      <span class="ilm-area-line"></span>
                      ${this._renderMasterToggle(filtered, areaData.area)}
                    </div>
                    <lcars-illumination-panel
                      .hass=${this._hass}
                      .entities=${filtered}
                      area-id="${areaData.area.area_id}"
                      frame-mode="nested">
                    </lcars-illumination-panel>
                  </div>
                `;
              })}
            `;
          })}

          ${floorGroups.length === 0 ? html`
            <div class="ilm-empty">
              <span>NO LIGHTING DEVICES DETECTED</span>
            </div>
          ` : ''}
        </main>

        <!-- Bottom-Left Elbow -->
        <div class="lcars-elbow-bottom" aria-hidden="true"></div>

        <!-- Footer Bar -->
        <div class="lcars-footer" role="contentinfo">
          <div class="lcars-footer-bar"></div>
          <span class="lcars-footer-text">LCARS ${version}</span>
          <div class="lcars-footer-endcap"></div>
        </div>
      </div>
    `;
  }

  _setFilter(filter) {
    this._filter = filter;
    lcarsAudio.play('navAcknowledge');
  }

  _renderMasterToggle(entities, area) {
    const areaState = this._getAreaLightState(entities);
    if (areaState === 'empty') return html``;

    const label = areaState === 'on' ? 'ALL ON'
      : areaState === 'off' ? 'ALL OFF'
      : 'MIXED';
    const isOn = areaState === 'on';

    return html`
      <button
        class="ilm-master-btn ${isOn ? 'active' : ''}"
        role="switch"
        aria-checked="${isOn ? 'true' : 'false'}"
        aria-label="Toggle all lights in ${area.name}"
        @click=${() => this._toggleAreaLights(entities)}>
        <span class="ilm-master-dot ${areaState}"></span>
        ${label}
      </button>
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

        /* ─── LCARS Frame Grid ─── */
        .lcars-frame {
          display: grid;
          grid-template-columns: var(--lcars-sidebar-w, 12rem) 1fr;
          grid-template-rows: var(--lcars-elbow-h, 4.5rem) 1fr var(--lcars-elbow-h, 4.5rem);
          gap: var(--lcars-gap, 0.25rem);
          height: 100%;
        }

        /* ─── Top-Left Elbow ─── */
        .lcars-elbow-top {
          grid-column: 1;
          grid-row: 1;
          background: var(--lcars-sunflower, #ffcc99);
          border-radius: var(--lcars-elbow-radius, 3.75rem) 0 0 0;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: flex-end;
          padding: 0.25rem 0.5rem;
        }
        .lcars-elbow-top::after {
          content: '';
          position: absolute;
          bottom: 0;
          right: 0;
          width: calc(var(--lcars-sidebar-w, 12rem) - var(--lcars-elbow-w, 9.5rem));
          height: calc(var(--lcars-elbow-h, 4.5rem) - var(--lcars-bar-h, 1.5rem));
          background: var(--lcars-bg, #000);
          border-radius: 1.5rem 0 0 0;
        }
        .lcars-elbow-label {
          font-family: var(--lcars-font, 'Antonio', sans-serif);
          font-size: 0.75rem;
          color: var(--lcars-black, #000);
          text-transform: uppercase;
          position: relative;
          z-index: 1;
        }

        /* ─── Header Bar ─── */
        .lcars-header {
          grid-column: 2;
          grid-row: 1;
          display: flex;
          align-items: flex-start;
          gap: var(--lcars-gap, 0.25rem);
        }
        .lcars-header-bar {
          flex: 1;
          height: var(--lcars-bar-h, 1.5rem);
          background: var(--lcars-sunflower, #ffcc99);
        }
        .lcars-header-title {
          font-family: var(--lcars-font, 'Antonio', sans-serif);
          font-size: 1rem;
          color: var(--lcars-sunflower, #ffcc99);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          white-space: nowrap;
          line-height: var(--lcars-bar-h, 1.5rem);
          padding: 0 0.5rem;
        }
        .lcars-header-endcap {
          width: var(--lcars-endcap-size, 1.5rem);
          height: var(--lcars-bar-h, 1.5rem);
          background: var(--lcars-sunflower, #ffcc99);
          border-radius: 0 var(--lcars-endcap-radius, 0.75rem) var(--lcars-endcap-radius, 0.75rem) 0;
          flex-shrink: 0;
        }

        /* ─── Sidebar: 3 Filter Buttons ─── */
        .lcars-sidebar {
          grid-column: 1;
          grid-row: 2;
          display: flex;
          flex-direction: column;
          gap: var(--lcars-gap, 0.25rem);
          padding-right: var(--lcars-gap, 0.25rem);
        }

        .ilm-sidebar-btn {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.25rem;
          border: none;
          border-radius: var(--lcars-btn-radius, 1.5rem) 0 0 var(--lcars-btn-radius, 1.5rem);
          background: var(--lcars-african-violet, #cc99ff);
          color: var(--lcars-black, #000);
          font-family: var(--lcars-font, 'Antonio', sans-serif);
          text-transform: uppercase;
          cursor: pointer;
          transition: background 200ms ease, color 200ms ease;
          padding: 0.5rem;
          min-width: 0;
        }

        .ilm-sidebar-btn:hover {
          filter: brightness(1.2);
        }

        .ilm-sidebar-btn:focus-visible {
          outline: 2px solid var(--lcars-ice, #99ccff);
          outline-offset: 2px;
        }

        .ilm-sidebar-btn.active {
          background: var(--lcars-gold, #ffaa00);
        }

        .ilm-sidebar-count {
          font-size: 2rem;
          font-variant-numeric: tabular-nums;
          line-height: 1;
        }

        .ilm-sidebar-label {
          font-size: 0.875rem;
          letter-spacing: 0.05em;
          text-align: center;
        }

        /* ─── Content Area ─── */
        .lcars-content {
          grid-column: 2;
          grid-row: 2;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 0.25rem 0.5rem;
          scrollbar-width: thin;
          scrollbar-color: var(--lcars-gray, #666688) transparent;
        }

        /* ─── Bottom-Left Elbow ─── */
        .lcars-elbow-bottom {
          grid-column: 1;
          grid-row: 3;
          background: var(--lcars-african-violet, #cc99ff);
          border-radius: 0 0 0 var(--lcars-elbow-radius, 3.75rem);
          position: relative;
          overflow: hidden;
        }
        .lcars-elbow-bottom::after {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: calc(var(--lcars-sidebar-w, 12rem) - var(--lcars-elbow-w, 9.5rem));
          height: calc(var(--lcars-elbow-h, 4.5rem) - var(--lcars-bar-h, 1.5rem));
          background: var(--lcars-bg, #000);
          border-radius: 0 0 0 1.5rem;
        }

        /* ─── Footer Bar ─── */
        .lcars-footer {
          grid-column: 2;
          grid-row: 3;
          display: flex;
          align-items: flex-end;
          gap: var(--lcars-gap, 0.25rem);
        }
        .lcars-footer-bar {
          flex: 1;
          height: var(--lcars-bar-h, 1.5rem);
          background: var(--lcars-african-violet, #cc99ff);
        }
        .lcars-footer-text {
          font-family: var(--lcars-font, 'Antonio', sans-serif);
          font-size: 0.75rem;
          color: var(--lcars-african-violet, #cc99ff);
          text-transform: uppercase;
          white-space: nowrap;
          line-height: var(--lcars-bar-h, 1.5rem);
          padding: 0 0.5rem;
        }
        .lcars-footer-endcap {
          width: var(--lcars-endcap-size, 1.5rem);
          height: var(--lcars-bar-h, 1.5rem);
          background: var(--lcars-african-violet, #cc99ff);
          border-radius: 0 var(--lcars-endcap-radius, 0.75rem) var(--lcars-endcap-radius, 0.75rem) 0;
          flex-shrink: 0;
        }

        /* ─── Floor Header ─── */
        .ilm-floor-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 1rem 0 0.5rem 0;
        }
        .ilm-floor-name {
          font-family: var(--lcars-font, 'Antonio', sans-serif);
          font-size: 1.25rem;
          color: var(--lcars-ice, #99ccff);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          white-space: nowrap;
        }
        .ilm-floor-line {
          flex: 1;
          height: 0.375rem;
          background: var(--lcars-ice, #99ccff);
          border-radius: 0 1.5rem 1.5rem 0;
          opacity: 0.4;
        }

        /* ─── Area Section ─── */
        .ilm-area-section {
          margin-bottom: 0.75rem;
        }
        .ilm-area-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.25rem;
        }
        .ilm-area-name {
          font-family: var(--lcars-font, 'Antonio', sans-serif);
          font-size: 1.25rem;
          color: var(--lcars-sunflower, #ffcc99);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          white-space: nowrap;
        }
        .ilm-area-line {
          flex: 1;
          height: 2px;
          background: var(--lcars-sunflower, #ffcc99);
          opacity: 0.3;
        }

        /* ─── Master Toggle ─── */
        .ilm-master-btn {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.25rem 0.75rem;
          min-height: 2rem;
          border: none;
          border-radius: 0 1rem 1rem 0;
          background: rgba(102, 102, 136, 0.25);
          color: var(--lcars-space-white, #f5f6fa);
          font-family: var(--lcars-font, 'Antonio', sans-serif);
          font-size: 0.875rem;
          text-transform: uppercase;
          cursor: pointer;
          white-space: nowrap;
          transition: background 200ms ease, color 200ms ease;
        }
        .ilm-master-btn:hover { filter: brightness(1.2); }
        .ilm-master-btn:focus-visible {
          outline: 2px solid var(--lcars-ice, #99ccff);
          outline-offset: 2px;
        }
        .ilm-master-btn.active {
          background: var(--lcars-sunflower, #ffcc99);
          color: var(--lcars-black, #000);
        }
        .ilm-master-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .ilm-master-dot.on { background: var(--lcars-sunflower, #ffcc99); }
        .ilm-master-dot.off { background: var(--lcars-gray, #666688); }
        .ilm-master-dot.mixed { background: var(--lcars-butterscotch, #ff9966); }

        /* ─── Nested panels ─── */
        lcars-illumination-panel { --lcars-panel-margin: 0; }

        /* ─── Empty State ─── */
        .ilm-empty {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 10rem;
          color: var(--lcars-gray, #666688);
          font-family: var(--lcars-font, 'Antonio', sans-serif);
          font-size: 1.25rem;
          text-transform: uppercase;
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
            grid-column: 1;
            grid-row: 2;
            flex-direction: row;
            padding-right: 0;
          }
          .ilm-sidebar-btn {
            border-radius: 0;
            min-height: 3rem;
          }
          .ilm-sidebar-btn:first-child { border-radius: 1rem 0 0 1rem; }
          .ilm-sidebar-btn:last-child { border-radius: 0 1rem 1rem 0; }
          .ilm-sidebar-count { font-size: 1.25rem; }
          .ilm-sidebar-label { font-size: 0.75rem; }
          .lcars-content { grid-column: 1; grid-row: 3; }
          .lcars-footer { grid-column: 1; grid-row: 4; }
        }
      `,
    ];
  }
}

if (!customElements.get('illumination-card')) {
  customElements.define('illumination-card', LcarsIlluminationCard);
}
