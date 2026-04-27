/**
 * lcars-lifesupport-card.js
 *
 * Life Support (Environmental) Dashboard — climate, temperature, humidity,
 * air quality, fans, humidifiers across all areas, grouped by floor → area.
 *
 * Filter: ALL / CLIMATE (thermostats + temp/humidity) / AIR (AQ sensors + fans)
 * v5.0.0 — 5X-2.4
 */
import { LitElement, html, css } from 'lit-element';
import { lcarsEventBus, showMoreInfo } from './lcars-helpers.js';
import { lcarsBaseStyles } from './lcars-styles.js';
import { getFloors, getAreasByFloor } from './lcars-hierarchy-utils.js';
import { getAreaEntities } from './lcars-entity-query.js';
import { isDiagnosticEntity, isEnvironmentEntity } from './lcars-entity-utils.js';
import { formatNumber } from './lcars-format-utils.js';
import { lcarsAudio } from './lcars-audio.js';

const TAG = 'LifeSupportCard';
const FILTER_ALL = 'all';
const FILTER_CLIMATE = 'climate';
const FILTER_AIR = 'air';

const CLIMATE_DOMAINS = new Set(['climate']);
const CLIMATE_CLASSES = new Set(['temperature', 'humidity']);
const AIR_DOMAINS = new Set(['fan', 'humidifier', 'air_quality']);
const AIR_CLASSES = new Set(['pm25', 'pm10', 'carbon_dioxide', 'volatile_organic_compounds', 'aqi']);

class LcarsLifeSupportCard extends LitElement {

  static get properties() {
    return { hass: { type: Object }, _config: { type: Object }, filter: { type: String } };
  }

  constructor() {
    super();
    this.hass = null; this._config = {}; this.filter = FILTER_ALL;
    this._entityCache = new Map();
    this._onFilter = (e) => { this.filter = e.detail.filter; };
  }

  connectedCallback() { super.connectedCallback(); lcarsEventBus.addEventListener('lcars-ls-filter', this._onFilter); }
  disconnectedCallback() { super.disconnectedCallback(); lcarsEventBus.removeEventListener('lcars-ls-filter', this._onFilter); }
  setConfig(config) { this._config = config || {}; }
  set hass(val) { const old = this._hass; this._hass = val; if (val && old !== val) { this._entityCache.clear(); this.requestUpdate('hass', old); } }
  get hass() { return this._hass; }
  getCardSize() { return 12; }

  _getAreasWithEnv() {
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
    for (const area of noFloor) { const data = this._resolveArea(area); if (data) orphans.push(data); }
    if (orphans.length > 0) result.push({ floor: null, areas: orphans });
    return result;
  }

  _resolveArea(area) {
    const raw = getAreaEntities(this._hass, area.area_id, this._entityCache);
    const climateEntities = [];
    const airEntities = [];

    for (const e of raw) {
      const domain = e.entity_id.split('.')[0];
      const state = this._hass.states?.[e.entity_id];
      if (!state) continue;
      const entry = { entity: e, domain, state };
      if (isDiagnosticEntity(entry)) continue;
      const dc = state.attributes?.device_class || '';

      if (CLIMATE_DOMAINS.has(domain) || CLIMATE_CLASSES.has(dc)) {
        climateEntities.push(entry);
      } else if (AIR_DOMAINS.has(domain) || AIR_CLASSES.has(dc) || isEnvironmentEntity(entry)) {
        airEntities.push(entry);
      }
    }

    const all = [...climateEntities, ...airEntities];
    if (all.length === 0) return null;
    return { area, all, climateEntities, airEntities };
  }

  _getFiltered(data) {
    if (this.filter === FILTER_CLIMATE) return data.climateEntities.length > 0 ? data.climateEntities : null;
    if (this.filter === FILTER_AIR) return data.airEntities.length > 0 ? data.airEntities : null;
    return data.all;
  }

  /* ─── Summary ─── */

  _getGlobalSummary(floorGroups) {
    let tempSum = 0, tempCount = 0;
    let hvacHeating = 0, hvacCooling = 0, hvacIdle = 0;
    let worstAqi = 0, worstAqiArea = '';

    for (const { areas } of floorGroups) {
      for (const data of areas) {
        for (const e of data.climateEntities) {
          const state = this._hass?.states?.[e.entity?.entity_id] || e.state;
          if (e.domain === 'climate') {
            const action = state?.attributes?.hvac_action || state?.state;
            if (action === 'heating') hvacHeating++;
            else if (action === 'cooling') hvacCooling++;
            else hvacIdle++;
          }
          if (state?.attributes?.device_class === 'temperature') {
            const v = parseFloat(state?.state);
            if (!isNaN(v)) { tempSum += v; tempCount++; }
          }
        }
        for (const e of data.airEntities) {
          const state = this._hass?.states?.[e.entity?.entity_id] || e.state;
          if (state?.attributes?.device_class === 'aqi') {
            const v = parseFloat(state?.state);
            if (!isNaN(v) && v > worstAqi) { worstAqi = v; worstAqiArea = data.area.name; }
          }
        }
      }
    }
    const avgTemp = tempCount > 0 ? Math.round(tempSum / tempCount) : null;
    const weatherEid = Object.keys(this._hass?.states || {}).find(k => k.startsWith('weather.'));
    const outdoor = weatherEid ? this._hass.states[weatherEid]?.attributes?.temperature : null;
    return { avgTemp, outdoor, worstAqi, worstAqiArea, hvacHeating, hvacCooling, hvacIdle };
  }

  _getComfortColor(tempF) {
    if (tempF == null) return 'var(--lcars-gray)';
    if (tempF < 68) return 'var(--lcars-bluey, #8899ff)';
    if (tempF <= 74) return 'var(--lcars-ice, #99ccff)';
    if (tempF <= 80) return 'var(--lcars-butterscotch, #ff9966)';
    return 'var(--lcars-tomato, #ff5555)';
  }

  _getAqiColor(aqi) {
    if (aqi <= 50) return 'var(--lcars-ice, #99ccff)';
    if (aqi <= 100) return 'var(--lcars-sunflower, #ffcc99)';
    if (aqi <= 150) return 'var(--lcars-butterscotch, #ff9966)';
    return 'var(--lcars-tomato, #ff5555)';
  }

  render() {
    if (!this._hass) return html``;
    const floorGroups = this._getAreasWithEnv();
    const summary = this._getGlobalSummary(floorGroups);

    return html`
      <div class="ls-dashboard">
        <!-- Summary Strip -->
        <div class="ls-summary">
          ${summary.avgTemp != null ? html`
            <span class="ls-summary__block">
              <span class="ls-summary__label">INDOOR AVG</span>
              <span class="ls-summary__value">${summary.avgTemp}°</span>
            </span>
          ` : ''}
          ${summary.outdoor != null ? html`
            <span class="ls-summary__block">
              <span class="ls-summary__label">OUTDOOR</span>
              <span class="ls-summary__value">${Math.round(summary.outdoor)}°</span>
            </span>
          ` : ''}
          ${summary.worstAqi > 0 ? html`
            <span class="ls-summary__block">
              <span class="ls-summary__label">WORST AQI</span>
              <span class="ls-summary__value">${summary.worstAqi} (${summary.worstAqiArea.toUpperCase()})</span>
            </span>
          ` : ''}
          <span class="ls-summary__block">
            <span class="ls-summary__label">HVAC</span>
            <span class="ls-summary__value">${summary.hvacHeating} HEAT · ${summary.hvacCooling} COOL · ${summary.hvacIdle} IDLE</span>
          </span>
        </div>

        ${floorGroups.map(({ floor, areas }) => {
          const visible = areas.filter(a => this._getFiltered(a) !== null);
          if (visible.length === 0) return html``;
          return html`
            ${floor ? html`<div class="ls-floor-header"><span class="ls-floor-name">${floor.name || 'FLOOR'}</span><span class="ls-floor-line"></span></div>` : ''}
            ${visible.map(data => {
              const filtered = this._getFiltered(data);
              return html`
                <div class="ls-area-section">
                  <div class="ls-area-header">
                    <span class="ls-area-name">${data.area.name}</span>
                    <span class="ls-area-line"></span>
                  </div>
                  <div class="ls-devices">
                    ${filtered.map(e => this._renderDevice(e))}
                  </div>
                </div>
              `;
            })}
          `;
        })}
        ${floorGroups.length === 0 ? html`<div class="ls-empty"><span>NO ENVIRONMENTAL DEVICES DETECTED</span></div>` : ''}
      </div>
    `;
  }

  _renderDevice(entry) {
    const eid = entry.entity?.entity_id;
    const state = this._hass?.states?.[eid] || entry.state;
    const name = (state?.attributes?.friendly_name || eid || '').toUpperCase();
    const dc = state?.attributes?.device_class || '';
    const domain = entry.domain;
    const unit = state?.attributes?.unit_of_measurement || '';
    const val = state?.state;

    if (domain === 'climate') {
      const currentTemp = state?.attributes?.current_temperature;
      const targetTemp = state?.attributes?.temperature;
      const hvacAction = state?.attributes?.hvac_action || val;
      return html`
        <div class="ls-device climate" @click=${() => showMoreInfo(eid)}>
          <div class="ls-device__header">
            <span class="ls-device__name">${name}</span>
            <span class="ls-device__badge ${hvacAction}">${(hvacAction || '').toUpperCase()}</span>
          </div>
          <div class="ls-device__temps">
            ${currentTemp != null ? html`<span class="ls-temp current">${formatNumber(currentTemp)}°</span>` : ''}
            ${targetTemp != null ? html`<span class="ls-temp target">→ ${formatNumber(targetTemp)}°</span>` : ''}
          </div>
        </div>
      `;
    }

    // Sensor or fan/humidifier
    const numVal = parseFloat(val);
    const displayVal = isNaN(numVal) ? (val || '').toUpperCase() : `${formatNumber(numVal)} ${unit}`;
    const isToggleable = domain === 'fan' || domain === 'humidifier';
    const isOn = state?.state === 'on';

    if (isToggleable) {
      return html`
        <button class="ls-pill ${isOn ? 'on' : 'off'}"
                aria-pressed="${isOn ? 'true' : 'false'}"
                @click=${() => { lcarsAudio.playForEntity(eid); this._hass.callService(domain, 'toggle', { entity_id: eid }); }}
                @contextmenu=${(e) => { e.preventDefault(); showMoreInfo(eid); }}>
          <span class="ls-pill__name">${name}</span>
          <span class="ls-pill__state">${isOn ? 'ON' : 'OFF'}</span>
        </button>
      `;
    }

    return html`
      <div class="ls-device sensor" @click=${() => showMoreInfo(eid)}>
        <div class="ls-device__header">
          <span class="ls-device__name">${name}</span>
          <span class="ls-device__badge">${dc.toUpperCase()}</span>
        </div>
        <div class="ls-device__value" style="color:${this._getSensorColor(dc, numVal)}">${displayVal}</div>
      </div>
    `;
  }

  _getSensorColor(dc, val) {
    if (isNaN(val)) return 'var(--lcars-space-white)';
    if (dc === 'temperature') return this._getComfortColor(val);
    if (dc === 'aqi' || dc === 'pm25' || dc === 'pm10') return this._getAqiColor(val);
    if (dc === 'carbon_dioxide') {
      if (val < 800) return 'var(--lcars-ice)';
      if (val < 1200) return 'var(--lcars-sunflower)';
      return 'var(--lcars-tomato)';
    }
    if (dc === 'humidity') {
      if (val < 30 || val > 70) return 'var(--lcars-butterscotch)';
      return 'var(--lcars-ice)';
    }
    return 'var(--lcars-space-white)';
  }

  static get styles() {
    return [
      lcarsBaseStyles,
      css`
        :host { display: block; }
        .ls-dashboard { padding: 0.25rem; }

        /* ─── Summary Strip ─── */
        .ls-summary {
          display: flex; gap: 0.25rem; margin-bottom: 0.75rem;
          background: var(--lcars-bluey, #8899ff); border-radius: 0.5rem;
          padding: 0.5rem 1rem; color: var(--lcars-black, #000);
          font-family: var(--lcars-font, 'Antonio', sans-serif); text-transform: uppercase;
        }
        .ls-summary__block { flex: 1; display: flex; flex-direction: column; gap: 0.125rem; }
        .ls-summary__label { font-size: 0.625rem; letter-spacing: 0.1em; color: var(--lcars-black, #000); opacity: 0.75; }
        .ls-summary__value { font-size: 1rem; font-variant-numeric: tabular-nums; color: var(--lcars-black, #000); }

        .ls-floor-header { display: flex; align-items: center; gap: 0.5rem; margin: 1rem 0 0.5rem 0; }
        .ls-floor-name { font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 1.25rem; color: var(--lcars-bluey, #8899ff); text-transform: uppercase; letter-spacing: 0.08em; white-space: nowrap; }
        .ls-floor-line { flex: 1; height: 0.375rem; background: var(--lcars-bluey, #8899ff); border-radius: 0 1.5rem 1.5rem 0; opacity: 0.4; }
        .ls-area-section { margin-bottom: 0.75rem; }
        .ls-area-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem; }
        .ls-area-name { font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 1.25rem; color: var(--lcars-bluey, #8899ff); text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap; }
        .ls-area-line { flex: 1; height: 2px; background: var(--lcars-bluey, #8899ff); opacity: 0.3; }
        .ls-devices { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(16rem, 100%), 1fr)); gap: 0.375rem; }
        .ls-device { border: 1px solid rgba(136, 153, 255, 0.15); border-radius: 0.5rem; padding: 0.5rem 0.75rem; cursor: pointer; transition: filter 200ms ease; }
        .ls-device:hover { filter: brightness(1.15); }
        .ls-device.climate { border-left: 4px solid var(--lcars-bluey, #8899ff); }
        .ls-device__header { display: flex; align-items: center; gap: 0.5rem; }
        .ls-device__name { flex: 1; font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 0.875rem; color: var(--lcars-bluey, #8899ff); text-transform: uppercase; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .ls-device__badge { font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 0.625rem; color: var(--lcars-gray, #666688); text-transform: uppercase; letter-spacing: 0.1em; }
        .ls-device__badge.heating { color: var(--lcars-butterscotch, #ff9966); }
        .ls-device__badge.cooling { color: var(--lcars-ice, #99ccff); }
        .ls-device__badge.idle { color: var(--lcars-gray, #666688); }
        .ls-device__value { font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 1.25rem; color: var(--lcars-space-white, #f5f6fa); font-variant-numeric: tabular-nums; margin-top: 0.125rem; }
        .ls-device__temps { display: flex; gap: 0.75rem; align-items: baseline; margin-top: 0.125rem; }
        .ls-temp { font-family: var(--lcars-font, 'Antonio', sans-serif); font-variant-numeric: tabular-nums; }
        .ls-temp.current { font-size: 1.75rem; color: var(--lcars-space-white, #f5f6fa); }
        .ls-temp.target { font-size: 1rem; color: var(--lcars-ice, #99ccff); }
        .ls-pill { display: flex; align-items: center; height: 3rem; padding: 0 1rem 0 0.75rem; border-radius: 0 var(--lcars-btn-radius, 1.5rem) var(--lcars-btn-radius, 1.5rem) 0; background: var(--lcars-bluey, #8899ff); color: var(--lcars-black, #000); font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 1rem; text-transform: uppercase; cursor: pointer; border: 1px solid rgba(136, 153, 255, 0.2); transition: filter 200ms ease; width: 100%; text-align: left; }
        .ls-pill:hover { filter: brightness(1.2); }
        .ls-pill:focus-visible { outline: 2px solid var(--lcars-ice, #99ccff); outline-offset: 2px; }
        .ls-pill.off { background: var(--lcars-gray, #666688); color: var(--lcars-space-white, #f5f6fa); border-color: rgba(102, 102, 136, 0.3); }
        .ls-pill__name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .ls-pill__state { font-variant-numeric: tabular-nums; min-width: 2.5rem; text-align: right; flex-shrink: 0; }
        .ls-empty { display: flex; align-items: center; justify-content: center; min-height: 10rem; color: var(--lcars-gray, #666688); font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 1.25rem; text-transform: uppercase; }
      `,
    ];
  }
}

if (!customElements.get('lifesupport-card')) {
  customElements.define('lifesupport-card', LcarsLifeSupportCard);
}
