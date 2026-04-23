/**
 * lcars-illumination-card.js
 *
 * Illumination Dashboard — standalone Lovelace card showing all lighting,
 * switches, and covers across all areas, grouped by floor → area.
 *
 * Thin orchestrator: reuses <lcars-illumination-panel> and <lcars-viewport-panel>
 * for per-area rendering. Adds global summary bar, floor headers, and
 * master toggle per area.
 *
 * v5.0.0 — 5X-2.5 Lighting Dashboard
 */
import { LitElement, html, css } from 'lit-element';
import { getHass, lcarsLog } from './lcars-helpers.js';
import { lcarsBaseStyles } from './lcars-styles.js';
import { getFloors, getAreasByFloor } from './lcars-hierarchy-utils.js';
import { getAreaEntities } from './lcars-entity-query.js';
import { isLightingEntity, isViewportEntity, isDiagnosticEntity } from './lcars-entity-utils.js';
import { lcarsAudio } from './lcars-audio.js';

// Side-effect: register panel custom elements
import './panels/illumination/lcars-illumination-panel.js';
import './panels/viewport/lcars-viewport-panel.js';
import './components/lcars-summary-badge/lcars-summary-badge.js';

const TAG = 'IlluminationCard';

class LcarsIlluminationCard extends LitElement {

  static get properties() {
    return {
      hass: { type: Object },
      _config: { type: Object },
    };
  }

  constructor() {
    super();
    this.hass = null;
    this._config = {};
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

    const lightEntities = hydrated.filter(e => isLightingEntity(e) || e.domain === 'scene');
    const viewportEntities = hydrated.filter(e => isViewportEntity(e));

    if (lightEntities.length === 0 && viewportEntities.length === 0) return null;

    return { area, lightEntities, viewportEntities, allHydrated: hydrated };
  }

  /* ─── Summary counts ─── */

  _getGlobalCounts(floorGroups) {
    let totalActive = 0;
    let totalAll = 0;
    let coversOpen = 0;
    let coversTotal = 0;

    for (const { areas } of floorGroups) {
      for (const { lightEntities, viewportEntities } of areas) {
        for (const e of lightEntities) {
          if (e.domain === 'scene') continue;
          totalAll++;
          if (e.state?.state === 'on') totalActive++;
        }
        for (const e of viewportEntities) {
          coversTotal++;
          if (e.state?.state === 'open') coversOpen++;
        }
      }
    }

    return { totalActive, totalAll, coversOpen, coversTotal };
  }

  /* ─── Master toggle ─── */

  _getAreaLightState(lightEntities) {
    const toggleable = lightEntities.filter(e => e.domain !== 'scene');
    if (toggleable.length === 0) return 'empty';
    const onCount = toggleable.filter(e => e.state?.state === 'on').length;
    if (onCount === 0) return 'off';
    if (onCount === toggleable.length) return 'on';
    return 'mixed';
  }

  _toggleAreaLights(lightEntities) {
    const toggleable = lightEntities.filter(e => e.domain !== 'scene');
    if (toggleable.length === 0) return;
    const allOn = toggleable.every(e => e.state?.state === 'on');
    const service = allOn ? 'turn_off' : 'turn_on';
    const domain = 'homeassistant';

    for (const e of toggleable) {
      this._hass.callService(domain, service, { entity_id: e.entity.entity_id });
    }
    lcarsAudio.play(allOn ? 'switchToggle' : 'lightToggle');
  }

  /* ─── Render ─── */

  render() {
    if (!this._hass) return html``;

    const floorGroups = this._getAreasWithLighting();
    const { totalActive, totalAll, coversOpen, coversTotal } = this._getGlobalCounts(floorGroups);

    return html`
      <div class="ilm-dashboard" role="main" aria-label="Illumination dashboard">

        <!-- Global Summary Bar -->
        <div class="ilm-summary" role="status" aria-live="polite"
             aria-label="${totalActive} lights active of ${totalAll} total">
          <div class="ilm-summary-label">ILLUMINATION STATUS</div>
          <div class="ilm-summary-values">
            <span class="ilm-summary-active">${totalActive}</span>
            <span class="ilm-summary-sep">ACTIVE /</span>
            <span class="ilm-summary-total">${totalAll}</span>
            <span class="ilm-summary-sep">TOTAL</span>
            ${coversTotal > 0 ? html`
              <span class="ilm-summary-divider">·</span>
              <span class="ilm-summary-covers">${coversOpen} COVERS OPEN</span>
            ` : ''}
          </div>
        </div>

        <!-- Floor → Area sections -->
        ${floorGroups.map(({ floor, areas }) => html`
          ${floor ? html`
            <div class="ilm-floor-header">
              <span class="ilm-floor-name">${floor.name || 'FLOOR'}</span>
              <span class="ilm-floor-line"></span>
            </div>
          ` : ''}
          ${areas.map(({ area, lightEntities, viewportEntities, allHydrated }) => html`
            <div class="ilm-area-section" data-area-id="${area.area_id}">

              <!-- Area header with master toggle -->
              <div class="ilm-area-header">
                <span class="ilm-area-name">${area.name}</span>
                <span class="ilm-area-line"></span>
                ${this._renderMasterToggle(lightEntities, area)}
              </div>

              <!-- Illumination panel (lights, scenes, circuits) -->
              ${lightEntities.length > 0 ? html`
                <lcars-illumination-panel
                  .hass=${this._hass}
                  .entities=${lightEntities}
                  area-id="${area.area_id}"
                  frame-mode="nested">
                </lcars-illumination-panel>
              ` : ''}

              <!-- Viewport panel (covers/blinds) -->
              ${viewportEntities.length > 0 ? html`
                <lcars-viewport-panel
                  .hass=${this._hass}
                  .entities=${viewportEntities}
                  area-id="${area.area_id}"
                  frame-mode="nested">
                </lcars-viewport-panel>
              ` : ''}
            </div>
          `)}
        `)}

        ${floorGroups.length === 0 ? html`
          <div class="ilm-empty">
            <span>NO LIGHTING DEVICES DETECTED</span>
          </div>
        ` : ''}
      </div>
    `;
  }

  _renderMasterToggle(lightEntities, area) {
    const areaState = this._getAreaLightState(lightEntities);
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
        @click=${() => this._toggleAreaLights(lightEntities)}>
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
        }

        .ilm-dashboard {
          padding: 0.25rem;
        }

        /* ─── Summary Bar ─── */
        .ilm-summary {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 0.5rem 0.75rem;
          margin-bottom: 0.75rem;
          background: rgba(102, 102, 136, 0.15);
          border-radius: 0 1.5rem 1.5rem 0;
          min-height: 3rem;
        }

        .ilm-summary-label {
          font-family: var(--lcars-font, 'Antonio', sans-serif);
          font-size: 1rem;
          color: var(--lcars-sunflower, #ffcc99);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          white-space: nowrap;
        }

        .ilm-summary-values {
          display: flex;
          align-items: baseline;
          gap: 0.375rem;
          font-family: var(--lcars-font, 'Antonio', sans-serif);
          font-size: 1rem;
          text-transform: uppercase;
        }

        .ilm-summary-active {
          font-size: 1.5rem;
          color: var(--lcars-sunflower, #ffcc99);
          font-variant-numeric: tabular-nums;
        }

        .ilm-summary-total {
          font-size: 1.5rem;
          color: var(--lcars-space-white, #f5f6fa);
          font-variant-numeric: tabular-nums;
        }

        .ilm-summary-sep {
          color: var(--lcars-gray, #666688);
        }

        .ilm-summary-divider {
          color: var(--lcars-gray, #666688);
          margin: 0 0.25rem;
        }

        .ilm-summary-covers {
          color: var(--lcars-ice, #99ccff);
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

        .ilm-master-btn:hover {
          filter: brightness(1.2);
        }

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
          transition: background 200ms ease;
        }

        .ilm-master-dot.on {
          background: var(--lcars-sunflower, #ffcc99);
        }

        .ilm-master-dot.off {
          background: var(--lcars-gray, #666688);
        }

        .ilm-master-dot.mixed {
          background: var(--lcars-butterscotch, #ff9966);
        }

        /* ─── Nested panels — reduce spacing ─── */
        lcars-illumination-panel,
        lcars-viewport-panel {
          --lcars-panel-margin: 0;
        }

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
          .ilm-summary {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.25rem;
          }

          .ilm-floor-name {
            font-size: 1rem;
          }
        }
      `,
    ];
  }
}

if (!customElements.get('illumination-card')) {
  customElements.define('illumination-card', LcarsIlluminationCard);
}
