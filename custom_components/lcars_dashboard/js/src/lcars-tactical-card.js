/**
 * lcars-tactical-card.js
 *
 * Tactical (Security) Dashboard — all locks, alarm panels, and security
 * binary sensors across all areas, grouped by floor → area.
 *
 * Filter: ALL / ACCESS (locks + alarms) / ZONES (binary sensors)
 * v5.0.0 — 5X-2.2
 */
import { LitElement, html, css } from 'lit-element';
import { lcarsLog, lcarsEventBus } from './lcars-helpers.js';
import { lcarsBaseStyles } from './lcars-styles.js';
import { getFloors, getAreasByFloor } from './lcars-hierarchy-utils.js';
import { getAreaEntities } from './lcars-entity-query.js';
import { isTacticalEntity, isDiagnosticEntity } from './lcars-entity-utils.js';
import { lcarsAudio } from './lcars-audio.js';
import { showMoreInfo } from './lcars-helpers.js';

const TAG = 'TacticalCard';
const FILTER_ALL = 'all';
const FILTER_ACCESS = 'access';
const FILTER_ZONES = 'zones';

const ACCESS_DOMAINS = new Set(['lock', 'alarm_control_panel']);
const ZONE_CLASSES = new Set(['door', 'window', 'motion', 'occupancy', 'tamper', 'safety', 'smoke', 'gas', 'vibration']);

class LcarsTacticalCard extends LitElement {

  static get properties() {
    return {
      hass: { type: Object },
      _config: { type: Object },
      filter: { type: String },
    };
  }

  constructor() {
    super();
    this.hass = null;
    this._config = {};
    this.filter = FILTER_ALL;
    this._entityCache = new Map();
    this._onFilter = (e) => { this.filter = e.detail.filter; };
  }

  connectedCallback() {
    super.connectedCallback();
    lcarsEventBus.addEventListener('lcars-tac-filter', this._onFilter);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    lcarsEventBus.removeEventListener('lcars-tac-filter', this._onFilter);
  }

  setConfig(config) { this._config = config || {}; }

  set hass(val) {
    const old = this._hass;
    this._hass = val;
    if (val && old !== val) { this._entityCache.clear(); this.requestUpdate('hass', old); }
  }
  get hass() { return this._hass; }
  getCardSize() { return 12; }

  _getAreasWithTactical() {
    if (!this._hass) return [];
    const floors = getFloors(this._hass);
    const floorMap = getAreasByFloor(this._hass);
    const result = [];

    for (const floor of floors) {
      const areas = floorMap.get(floor.floor_id) || [];
      const floorAreas = [];
      for (const area of areas) {
        const data = this._resolveArea(area);
        if (data) floorAreas.push(data);
      }
      if (floorAreas.length > 0) result.push({ floor, areas: floorAreas });
    }

    const noFloor = floorMap.get(null) || [];
    const orphans = [];
    for (const area of noFloor) {
      const data = this._resolveArea(area);
      if (data) orphans.push(data);
    }
    if (orphans.length > 0) result.push({ floor: null, areas: orphans });
    return result;
  }

  _resolveArea(area) {
    const raw = getAreaEntities(this._hass, area.area_id, this._entityCache);
    const entities = [];
    for (const e of raw) {
      const domain = e.entity_id.split('.')[0];
      const state = this._hass.states?.[e.entity_id];
      if (!state) continue;
      const entry = { entity: e, domain, state };
      if (isDiagnosticEntity(entry)) continue;
      if (!isTacticalEntity(entry)) continue;
      entities.push(entry);
    }
    if (entities.length === 0) return null;

    const access = entities.filter(e => ACCESS_DOMAINS.has(e.domain));
    const zones = entities.filter(e => e.domain === 'binary_sensor' && ZONE_CLASSES.has(e.state?.attributes?.device_class || ''));
    return { area, entities, access, zones };
  }

  _getFiltered(data) {
    if (this.filter === FILTER_ACCESS) return data.access.length > 0 ? data.access : null;
    if (this.filter === FILTER_ZONES) return data.zones.length > 0 ? data.zones : null;
    return data.entities;
  }

  render() {
    if (!this._hass) return html``;
    const floorGroups = this._getAreasWithTactical();

    return html`
      <div class="tac-dashboard">
        ${floorGroups.map(({ floor, areas }) => {
          const visible = areas.filter(a => this._getFiltered(a) !== null);
          if (visible.length === 0) return html``;
          return html`
            ${floor ? html`<div class="tac-floor-header"><span class="tac-floor-name">${floor.name || 'FLOOR'}</span><span class="tac-floor-line"></span></div>` : ''}
            ${visible.map(data => {
              const filtered = this._getFiltered(data);
              return html`
                <div class="tac-area-section">
                  <div class="tac-area-header">
                    <span class="tac-area-name">${data.area.name}</span>
                    <span class="tac-area-line"></span>
                  </div>
                  <div class="tac-devices">
                    ${filtered.map(e => this._renderDevice(e))}
                  </div>
                </div>
              `;
            })}
          `;
        })}
        ${floorGroups.length === 0 ? html`<div class="tac-empty"><span>NO TACTICAL DEVICES DETECTED</span></div>` : ''}
      </div>
    `;
  }

  _renderDevice(entry) {
    const eid = entry.entity?.entity_id;
    const state = this._hass?.states?.[eid] || entry.state;
    const name = (state?.attributes?.friendly_name || eid || '').toUpperCase();
    const dc = state?.attributes?.device_class || '';
    const isActive = this._isActive(entry.domain, state);

    return html`
      <button class="tac-pill ${isActive ? 'active' : 'inactive'} ${entry.domain}"
              aria-label="${name} — ${state?.state}"
              @click=${() => showMoreInfo(eid)}
              @contextmenu=${(e) => { e.preventDefault(); showMoreInfo(eid); }}>
        <ha-icon .icon=${this._getIcon(entry.domain, dc, state)} style="--mdc-icon-size:18px"></ha-icon>
        <span class="tac-pill__name">${name}</span>
        <span class="tac-pill__state">${(state?.state || 'unknown').toUpperCase()}</span>
      </button>
    `;
  }

  _isActive(domain, state) {
    if (domain === 'lock') return state?.state === 'unlocked';
    if (domain === 'alarm_control_panel') return state?.state !== 'disarmed';
    if (domain === 'binary_sensor') return state?.state === 'on';
    return false;
  }

  _getIcon(domain, dc, state) {
    if (domain === 'lock') return state?.state === 'locked' ? 'mdi:lock' : 'mdi:lock-open';
    if (domain === 'alarm_control_panel') return 'mdi:shield';
    if (dc === 'door') return state?.state === 'on' ? 'mdi:door-open' : 'mdi:door-closed';
    if (dc === 'window') return state?.state === 'on' ? 'mdi:window-open' : 'mdi:window-closed';
    if (dc === 'motion' || dc === 'occupancy') return 'mdi:motion-sensor';
    if (dc === 'smoke') return 'mdi:smoke-detector';
    if (dc === 'gas') return 'mdi:gas-cylinder';
    return 'mdi:shield-alert';
  }

  static get styles() {
    return [
      lcarsBaseStyles,
      css`
        :host { display: block; }
        .tac-dashboard { padding: 0.25rem; }
        .tac-floor-header { display: flex; align-items: center; gap: 0.5rem; margin: 1rem 0 0.5rem 0; }
        .tac-floor-name { font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 1.25rem; color: var(--lcars-ice, #99ccff); text-transform: uppercase; letter-spacing: 0.08em; white-space: nowrap; }
        .tac-floor-line { flex: 1; height: 0.375rem; background: var(--lcars-ice, #99ccff); border-radius: 0 1.5rem 1.5rem 0; opacity: 0.4; }
        .tac-area-section { margin-bottom: 0.75rem; }
        .tac-area-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem; }
        .tac-area-name { font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 1.25rem; color: var(--lcars-ice, #99ccff); text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap; }
        .tac-area-line { flex: 1; height: 2px; background: var(--lcars-ice, #99ccff); opacity: 0.3; }
        .tac-devices { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(18rem, 100%), 1fr)); gap: 0.375rem; }
        .tac-pill { display: flex; align-items: center; gap: 0.5rem; height: 3rem; padding: 0 1rem 0 0.75rem; border-radius: 0 var(--lcars-btn-radius, 1.5rem) var(--lcars-btn-radius, 1.5rem) 0; background: var(--lcars-ice, #99ccff); color: var(--lcars-black, #000); font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 1rem; text-transform: uppercase; cursor: pointer; border: 1px solid rgba(153, 204, 255, 0.2); transition: filter 200ms ease; width: 100%; text-align: left; }
        .tac-pill:hover { filter: brightness(1.2); }
        .tac-pill:focus-visible { outline: 2px solid var(--lcars-ice, #99ccff); outline-offset: 2px; }
        .tac-pill.inactive { background: var(--lcars-gray, #666688); color: var(--lcars-space-white, #f5f6fa); border-color: rgba(102, 102, 136, 0.3); }
        .tac-pill.active.lock { background: var(--lcars-tomato, #ff5555); }
        .tac-pill.active.alarm_control_panel { background: var(--lcars-gold, #ffaa00); }
        .tac-pill.active.binary_sensor { background: var(--lcars-butterscotch, #ff9966); }
        .tac-pill__name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .tac-pill__state { font-variant-numeric: tabular-nums; min-width: 3rem; text-align: right; flex-shrink: 0; }
        .tac-empty { display: flex; align-items: center; justify-content: center; min-height: 10rem; color: var(--lcars-gray, #666688); font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 1.25rem; text-transform: uppercase; }
      `,
    ];
  }
}

if (!customElements.get('tactical-card')) {
  customElements.define('tactical-card', LcarsTacticalCard);
}
