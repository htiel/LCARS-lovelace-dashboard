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

  // Layout sets this to push filter state
  set filter(val) {
    const old = this._filter;
    this._filter = val || FILTER_ALL;
    if (old !== this._filter) this.requestUpdate('_filter', old);
  }

  get filter() { return this._filter; }

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

  /** Called by lcars-illumination-layout to get counts for sidebar buttons */
  _getGlobalCountsForLayout() {
    const floorGroups = this._getAreasWithLighting();
    return this._getGlobalCounts(floorGroups);
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

    return html`
      <div class="ilm-dashboard">
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
                    ${this._renderScenePills(areaData.scenes)}
                    ${this._renderMasterToggle(filtered, areaData.area)}
                  </div>
                  <lcars-illumination-panel
                    .hass=${this._hass}
                    .entities=${filtered}
                    .filter=${this._filter}
                    area-id="${areaData.area.area_id}">
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

    const isOn = areaState === 'on' || areaState === 'mixed';

    return html`
      <button
        class="ilm-master-btn ${isOn ? 'active' : ''}"
        aria-pressed="${isOn ? 'true' : 'false'}"
        aria-label="Toggle all lights in ${area.name}"
        @click=${() => this._toggleAreaLights(entities)}>
        ${isOn ? 'ALL ON' : 'ALL OFF'}
      </button>
    `;
  }

  _renderScenePills(scenes) {
    if (!scenes || scenes.length === 0) return html``;
    return html`
      <div class="ilm-scene-strip">
        ${scenes.map(entry => {
          const eid = entry.entity?.entity_id;
          const name = (entry.state?.attributes?.friendly_name || eid || '').toUpperCase();
          // Strip area name prefix
          const area = this.hass?.areas;
          let shortName = name;
          if (area) {
            for (const a of Object.values(area)) {
              if (shortName.startsWith(a.name.toUpperCase())) {
                shortName = shortName.slice(a.name.length).trim().replace(/^[-–:]\s*/, '');
                break;
              }
            }
          }
          return html`
            <button class="ilm-scene-pill"
                    aria-label="Activate ${shortName || name} scene"
                    @click=${() => {
                      if (!this._hass) return;
                      lcarsAudio.play('scriptFire');
                      this._hass.callService('scene', 'turn_on', { entity_id: eid });
                    }}>
              ${shortName || name}
            </button>
          `;
        })}
      </div>
    `;
  }

  static get styles() {
    return [
      lcarsBaseStyles,
      css`
        :host { display: block; }
        .ilm-dashboard { padding: 0.25rem; }

        /* ─── Floor Header ─── */
        .ilm-floor-header {
          display: flex; align-items: center; gap: 0.5rem;
          margin: 1rem 0 0.5rem 0;
        }
        .ilm-floor-name {
          font-family: var(--lcars-font, 'Antonio', sans-serif);
          font-size: 1.25rem; color: var(--lcars-ice, #99ccff);
          text-transform: uppercase; letter-spacing: 0.08em; white-space: nowrap;
        }
        .ilm-floor-line {
          flex: 1; height: 0.375rem;
          background: var(--lcars-ice, #99ccff);
          border-radius: 0 1.5rem 1.5rem 0; opacity: 0.4;
        }

        /* ─── Area Section ─── */
        .ilm-area-section { margin-bottom: 0.75rem; }
        .ilm-area-header {
          display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;
        }
        .ilm-area-name {
          font-family: var(--lcars-font, 'Antonio', sans-serif);
          font-size: 1.25rem; color: var(--lcars-sunflower, #ffcc99);
          text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap;
        }
        .ilm-area-line {
          flex: 1; height: 2px;
          background: var(--lcars-sunflower, #ffcc99); opacity: 0.3;
        }

        /* ─── Master Toggle ─── */
        .ilm-master-btn {
          display: flex; align-items: center; justify-content: center;
          padding: 0.25rem 0.75rem; min-height: 2rem; border: none;
          border-radius: 0 var(--lcars-btn-radius, 1.5rem) var(--lcars-btn-radius, 1.5rem) 0;
          background: var(--lcars-gray, #666688);
          color: var(--lcars-space-white, #f5f6fa);
          font-family: var(--lcars-font, 'Antonio', sans-serif);
          font-size: 0.875rem; text-transform: uppercase;
          cursor: pointer; white-space: nowrap;
          transition: background 200ms ease, color 200ms ease;
          flex-shrink: 0;
        }
        .ilm-master-btn:hover { filter: brightness(1.2); }
        .ilm-master-btn:focus-visible {
          outline: 2px solid var(--lcars-ice, #99ccff); outline-offset: 2px;
        }
        .ilm-master-btn.active {
          background: var(--lcars-butterscotch, #ff9966);
          color: var(--lcars-black, #000);
        }

        /* ─── Scene Pill Strip ─── */
        .ilm-scene-strip {
          display: flex;
          gap: 0.25rem;
          flex-shrink: 1;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .ilm-scene-strip::-webkit-scrollbar { display: none; }

        .ilm-scene-pill {
          font-family: var(--lcars-font, 'Antonio', sans-serif);
          font-size: 0.875rem; text-transform: uppercase;
          color: var(--lcars-black, #000);
          background: var(--lcars-sunflower, #ffcc99);
          border: none;
          padding: 0.25rem 0.75rem;
          min-height: 2rem;
          border-radius: 0;
          cursor: pointer; white-space: nowrap;
          transition: filter 150ms ease;
          flex-shrink: 0;
        }
        .ilm-scene-pill:first-child {
          border-radius: var(--lcars-btn-radius, 1.5rem) 0 0 var(--lcars-btn-radius, 1.5rem);
        }
        .ilm-scene-pill:last-child {
          border-radius: 0;
        }
        .ilm-scene-pill:hover { filter: brightness(1.2); }
        .ilm-scene-pill:active { filter: brightness(0.8); }
        .ilm-scene-pill:focus-visible {
          outline: 2px solid var(--lcars-ice, #99ccff); outline-offset: 2px;
        }

        lcars-illumination-panel { --lcars-panel-margin: 0; }

        .ilm-empty {
          display: flex; align-items: center; justify-content: center;
          min-height: 10rem; color: var(--lcars-gray, #666688);
          font-family: var(--lcars-font, 'Antonio', sans-serif);
          font-size: 1.25rem; text-transform: uppercase;
        }
      `,
    ];
  }
}

if (!customElements.get('illumination-card')) {
  customElements.define('illumination-card', LcarsIlluminationCard);
}
