/**
 * lcars-lifesupport-card.js — v5.1.0 Life Support Dashboard Redesign
 *
 * Inspired by ChatGPT LCARS Life Support mockup (Apr 26 2026).
 * Multi-panel layout: overview cards, air quality, purifiers table,
 * temp/humidity grid, thermostat zones, system controls.
 *
 * Entity sources: Nest thermostats, BlueAir purifiers, Awair AQ sensors,
 * SwitchBot meters, VeSync purifiers, HomeKit controllers, WeatherFlow/Link.
 */
import { LitElement, html, css, svg } from 'lit-element';
import { lcarsEventBus, showMoreInfo } from './lcars-helpers.js';
import { lcarsBaseStyles } from './lcars-styles.js';
import { getFloors, getAreasByFloor } from './lcars-hierarchy-utils.js';
import { getAreaEntities } from './lcars-entity-query.js';

/* ─── SVG Ring Gauge Utility ─── */
function _ringGauge(value, max, size, color, label, sublabel, opts = {}) {
  const r = (size - 8) / 2;
  const circumference = 2 * Math.PI * r;
  const pct = Math.min(1, Math.max(0, value / max));
  const dashOffset = circumference * (1 - pct);
  const cx = size / 2, cy = size / 2;
  const trackColor = opts.trackColor || 'rgba(153,204,255,0.12)';
  return svg`
    <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" class="ring-gauge" role="meter"
         aria-valuenow="${value}" aria-valuemin="0" aria-valuemax="${max}" aria-label="${label}: ${value}">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${trackColor}" stroke-width="4" />
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="4"
              stroke-dasharray="${circumference}" stroke-dashoffset="${dashOffset}"
              stroke-linecap="round" transform="rotate(-90 ${cx} ${cy})"
              style="transition: stroke-dashoffset 500ms ease" />
      <text x="${cx}" y="${cy - 4}" text-anchor="middle" dominant-baseline="central"
            class="ring-value" style="fill:${color}">${label}</text>
      ${sublabel ? svg`<text x="${cx}" y="${cy + 10}" text-anchor="middle" dominant-baseline="central"
            class="ring-sublabel">${sublabel}</text>` : ''}
    </svg>
  `;
}
import { isDiagnosticEntity, isEnvironmentEntity } from './lcars-entity-utils.js';
import { formatNumber } from './lcars-format-utils.js';
import { lcarsAudio } from './lcars-audio.js';

const TAG = 'LifeSupportCard';
const FILTER_ALL = 'all';
const FILTER_CLIMATE = 'climate';
const FILTER_AIR = 'air';

const CLIMATE_DOMAINS = new Set(['climate']);
const CLIMATE_CLASSES = new Set(['temperature', 'humidity']);
const AIR_DOMAINS = new Set(['fan', 'humidifier']);
const AIR_CLASSES = new Set(['pm25', 'pm10', 'carbon_dioxide', 'volatile_organic_compounds', 'aqi', 'carbon_monoxide']);
const PURIFIER_PLATFORMS = new Set(['ha_blueair', 'vesync', 'homekit_controller']);

class LcarsLifeSupportCard extends LitElement {

  static get properties() {
    return { hass: { type: Object }, _config: { type: Object }, filter: { type: String } };
  }

  constructor() {
    super();
    this._hass = null; this._config = {}; this.filter = FILTER_ALL;
    this._entityCache = new Map();
    this._onFilter = (e) => { this.filter = e.detail.filter; };
  }

  connectedCallback() { super.connectedCallback(); lcarsEventBus.addEventListener('lcars-ls-filter', this._onFilter); }
  disconnectedCallback() { super.disconnectedCallback(); lcarsEventBus.removeEventListener('lcars-ls-filter', this._onFilter); }
  setConfig(config) { this._config = config || {}; }
  set hass(val) { const old = this._hass; this._hass = val; if (val && old !== val) { this._entityCache.clear(); this.requestUpdate('hass', old); } }
  get hass() { return this._hass; }
  getCardSize() { return 16; }

  /* ═══ Entity Discovery ═══ */
  _discoverAll() {
    if (!this._hass) return { thermostats: [], purifiers: [], tempSensors: [], aqSensors: [], fans: [] };
    const floors = getFloors(this._hass);
    const floorMap = getAreasByFloor(this._hass);
    const thermostats = [], purifiers = [], tempSensors = [], aqSensors = [], fans = [];
    const entities = this._hass.entities || {};
    const states = this._hass.states || {};

    // Scan all areas
    const allAreas = [];
    for (const floor of floors) {
      const areas = floorMap.get(floor.floor_id) || [];
      for (const area of areas) allAreas.push({ floor, area });
    }
    const noFloor = floorMap.get(null) || [];
    for (const area of noFloor) allAreas.push({ floor: null, area });

    for (const { floor, area } of allAreas) {
      const raw = getAreaEntities(this._hass, area.area_id, this._entityCache);
      for (const e of raw) {
        const domain = e.entity_id.split('.')[0];
        const state = states[e.entity_id];
        if (!state) continue;
        const entry = { entity: e, domain, state, area, floor };
        if (isDiagnosticEntity(entry)) continue;
        const dc = state.attributes?.device_class || '';
        const platform = e.platform || '';

        // Skip pool/spa climate entities
        if (domain === 'climate' && /pool|spa|fridge|freezer/i.test(e.entity_id)) continue;

        if (domain === 'climate') { thermostats.push(entry); continue; }
        if (domain === 'fan' && PURIFIER_PLATFORMS.has(platform)) { purifiers.push(entry); continue; }
        if (domain === 'fan') { fans.push(entry); continue; }
        if (dc === 'temperature' && !/drive_|cpu_|phy_|display_|raw_|cook_|water_/i.test(e.entity_id)) { tempSensors.push(entry); continue; }
        if (dc === 'humidity') { tempSensors.push(entry); continue; }
        if (AIR_CLASSES.has(dc) || /filter_life/i.test(e.entity_id)) { aqSensors.push(entry); continue; }
      }
    }
    return { thermostats, purifiers, tempSensors, aqSensors, fans };
  }

  /* ═══ Overview Summary Cards (mockup top row) ═══ */
  _renderOverview(data) {
    const { thermostats, purifiers, tempSensors, aqSensors } = data;
    // Thermostat summary
    let heating = 0, cooling = 0, idle = 0;
    for (const t of thermostats) {
      const action = t.state?.attributes?.hvac_action || t.state?.state || 'idle';
      if (action === 'heating') heating++;
      else if (action === 'cooling') cooling++;
      else idle++;
    }
    // AQ summary
    let worstAqi = 0, aqiStatus = 'GOOD';
    for (const e of aqSensors) {
      if (e.state?.attributes?.device_class === 'aqi') {
        const v = Number(e.state?.state);
        if (!isNaN(v) && v > worstAqi) worstAqi = v;
      }
    }
    if (worstAqi > 100) aqiStatus = 'UNHEALTHY';
    else if (worstAqi > 50) aqiStatus = 'MODERATE';

    // Avg indoor temp
    let tempSum = 0, tempCount = 0;
    for (const e of tempSensors) {
      if (e.state?.attributes?.device_class === 'temperature') {
        const v = Number(e.state?.state);
        if (!isNaN(v) && v > 0 && v < 120) { tempSum += v; tempCount++; }
      }
    }
    const avgTemp = tempCount > 0 ? Math.round(tempSum / tempCount * 10) / 10 : null;

    // Avg humidity
    let humSum = 0, humCount = 0;
    for (const e of tempSensors) {
      if (e.state?.attributes?.device_class === 'humidity') {
        const v = Number(e.state?.state);
        if (!isNaN(v)) { humSum += v; humCount++; }
      }
    }
    const avgHum = humCount > 0 ? Math.round(humSum / humCount) : null;

    const aqiColor = worstAqi <= 50 ? '#99ccff' : worstAqi <= 100 ? '#ffcc99' : '#ff5555';
    const aqiCssColor = worstAqi <= 50 ? 'var(--lcars-ice)' : worstAqi <= 100 ? 'var(--lcars-sunflower)' : 'var(--lcars-tomato)';
    const thermoAvgTemp = thermostats.length > 0 ? Math.round(thermostats.reduce((s, t) => s + (Number(t.state?.attributes?.current_temperature) || 0), 0) / thermostats.length) : null;
    const thermoColor = heating > 0 ? '#ff9966' : cooling > 0 ? '#99ccff' : '#666688';

    return html`
      <div class="ls-overview">
        <div class="ls-overview-card">
          ${_ringGauge(purifiers.filter(p => (this._hass?.states?.[p.entity?.entity_id] || p.state)?.state === 'on').length, Math.max(purifiers.length, 1), 64, '#99ccff', `${purifiers.length}`, purifiers.length === 1 ? 'UNIT' : 'UNITS')}
          <span class="ls-ov-title">AIR PURIFIERS</span>
          <span class="ls-ov-status" style="color:var(--lcars-ice)">ALL NORMAL</span>
        </div>
        <div class="ls-overview-card">
          ${thermoAvgTemp != null ? _ringGauge(thermoAvgTemp, 100, 64, thermoColor, `${thermoAvgTemp}°`, heating > 0 ? 'HEATING' : cooling > 0 ? 'COOLING' : 'IDLE') : html`<span class="ls-ov-value">${thermostats.length} ${thermostats.length === 1 ? 'ZONE' : 'ZONES'}</span>`}
          <span class="ls-ov-title">THERMOSTATS</span>
          <span class="ls-ov-status">${thermostats.length} ${thermostats.length === 1 ? 'ZONE' : 'ZONES'}</span>
        </div>
        <div class="ls-overview-card">
          ${_ringGauge(Math.min(worstAqi, 300), 300, 64, aqiColor, worstAqi > 0 ? `${worstAqi}` : '—', 'AQI')}
          <span class="ls-ov-title">AIR QUALITY</span>
          <span class="ls-ov-status" style="color:${aqiCssColor}">${aqiStatus}</span>
        </div>
        <div class="ls-overview-card">
          ${avgTemp != null ? _ringGauge(avgTemp, 100, 64, avgTemp < 68 ? '#8899ff' : avgTemp <= 76 ? '#99ccff' : '#ff9966', `${avgTemp}°`, `${avgHum || '—'}%`) : html`<span class="ls-ov-value">—</span>`}
          <span class="ls-ov-title">ENVIRONMENT</span>
          <span class="ls-ov-status">${avgHum != null ? `${avgHum}% HUMIDITY` : ''}</span>
        </div>
      </div>
    `;
  }

  /* ═══ Thermostat Zones (mockup bottom-left) ═══ */
  _renderThermostats(thermostats) {
    if (thermostats.length === 0) return '';
    return html`
      <div class="ls-section">
        <div class="ls-section-header">
          <span class="ls-section-label">THERMOSTAT ZONES</span>
          <span class="ls-section-line"></span>
        </div>
        <div class="ls-thermo-grid">
          ${thermostats.map(t => {
            const s = this._hass?.states?.[t.entity?.entity_id] || t.state;
            const name = (t.area?.name || s?.attributes?.friendly_name || '').toUpperCase();
            const currentTemp = s?.attributes?.current_temperature;
            const targetTemp = s?.attributes?.temperature;
            const action = s?.attributes?.hvac_action || s?.state || 'idle';
            const actionHex = action === 'heating' ? '#ff9966' : action === 'cooling' ? '#99ccff' : '#666688';
            const actionColor = action === 'heating' ? 'var(--lcars-butterscotch)' : action === 'cooling' ? 'var(--lcars-ice)' : 'var(--lcars-gray)';
            const actionLabel = action.toUpperCase();
            return html`
              <div class="ls-thermo-card" @click=${() => showMoreInfo(t.entity.entity_id)}>
                ${currentTemp != null ? _ringGauge(currentTemp, 100, 80, actionHex, `${Math.round(currentTemp * 10) / 10}°`, actionLabel) : html`<span class="ls-thermo-temp">—</span>`}
                <span class="ls-thermo-name">${name}</span>
                ${targetTemp != null ? html`<span class="ls-thermo-setpoint">${targetTemp}° SETPOINT</span>` : ''}
              </div>
            `;
          })}
        </div>
      </div>
    `;
  }

  /* ═══ Air Purifiers Table (mockup middle-left) ═══ */
  _renderPurifiers(purifiers, aqSensors) {
    if (purifiers.length === 0) return '';
    // Group AQ sensors by device_id to pair with purifiers
    const deviceAq = new Map();
    for (const e of aqSensors) {
      const did = e.entity?.device_id;
      if (!did) continue;
      if (!deviceAq.has(did)) deviceAq.set(did, []);
      deviceAq.get(did).push(e);
    }

    return html`
      <div class="ls-section">
        <div class="ls-section-header">
          <span class="ls-section-label">AIR PURIFIERS</span>
          <span class="ls-section-line"></span>
        </div>
        <div class="ls-purifier-table">
          <div class="ls-table-header">
            <span class="ls-th">LOCATION</span>
            <span class="ls-th">STATUS</span>
            <span class="ls-th">SPEED</span>
            <span class="ls-th">FILTER</span>
            <span class="ls-th">PM2.5</span>
          </div>
          ${purifiers.map(p => {
            const s = this._hass?.states?.[p.entity?.entity_id] || p.state;
            const name = (p.area?.name || s?.attributes?.friendly_name || '').replace(/air purifier|fan/gi, '').trim().toUpperCase() || 'PURIFIER';
            const isOn = s?.state === 'on';
            const speed = s?.attributes?.percentage || s?.attributes?.speed || '—';
            // Find paired sensors
            const paired = deviceAq.get(p.entity?.device_id) || [];
            const filterLife = paired.find(e => /filter_life/i.test(e.entity?.entity_id));
            const pm25 = paired.find(e => /pm_?2_?5/i.test(e.entity?.entity_id));
            const filterVal = filterLife ? Number(this._hass?.states?.[filterLife.entity?.entity_id]?.state) : null;
            const pm25Val = pm25 ? Number(this._hass?.states?.[pm25.entity?.entity_id]?.state) : null;

            return html`
              <div class="ls-table-row" @click=${() => showMoreInfo(p.entity.entity_id)}>
                <span class="ls-td ls-td-name">${name}</span>
                <span class="ls-td" style="color:${isOn ? 'var(--lcars-ice)' : 'var(--lcars-gray)'}">${isOn ? 'ACTIVE' : 'OFF'}</span>
                <span class="ls-td">${isOn ? `${speed}%` : '—'}</span>
                <span class="ls-td">
                  ${filterVal != null ? html`
                    <div class="ls-filter-bar">
                      <div class="ls-filter-fill" style="width:${filterVal}%; background:${filterVal > 50 ? 'var(--lcars-ice)' : filterVal > 20 ? 'var(--lcars-sunflower)' : 'var(--lcars-tomato)'}"></div>
                    </div>
                    <span class="ls-filter-pct">${filterVal}%</span>
                  ` : '—'}
                </span>
                <span class="ls-td">${pm25Val != null ? `${pm25Val}` : '—'}</span>
              </div>
            `;
          })}
        </div>
      </div>
    `;
  }

  /* ═══ Temperature & Humidity Grid (mockup middle-right) ═══ */
  _renderTempGrid(tempSensors) {
    // Group by area, show temp + humidity pairs
    const areaMap = new Map();
    for (const e of tempSensors) {
      const areaName = e.area?.name || 'Unknown';
      if (!areaMap.has(areaName)) areaMap.set(areaName, { temp: null, humidity: null });
      const dc = e.state?.attributes?.device_class;
      const val = Number(e.state?.state);
      if (dc === 'temperature' && !isNaN(val)) {
        const existing = areaMap.get(areaName);
        if (!existing.temp || val > 0) existing.temp = { entry: e, val };
      }
      if (dc === 'humidity' && !isNaN(val)) {
        areaMap.get(areaName).humidity = { entry: e, val };
      }
    }

    const rows = [...areaMap.entries()]
      .filter(([, d]) => d.temp || d.humidity)
      .sort((a, b) => a[0].localeCompare(b[0]));

    if (rows.length === 0) return '';

    return html`
      <div class="ls-section">
        <div class="ls-section-header">
          <span class="ls-section-label">TEMPERATURE & HUMIDITY SENSORS</span>
          <span class="ls-section-line"></span>
          <span class="ls-sensor-count">${rows.length} ${rows.length === 1 ? 'ZONE' : 'ZONES'}</span>
        </div>
        <div class="ls-purifier-table">
          <div class="ls-table-header">
            <span class="ls-th">LOCATION</span>
            <span class="ls-th">TEMP</span>
            <span class="ls-th">HUMIDITY</span>
            <span class="ls-th">STATUS</span>
          </div>
          ${rows.map(([name, d]) => {
            const tempColor = d.temp ? (d.temp.val < 68 ? 'var(--lcars-bluey)' : d.temp.val <= 76 ? 'var(--lcars-ice)' : 'var(--lcars-butterscotch)') : 'var(--lcars-gray)';
            const status = d.temp ? (d.temp.val >= 65 && d.temp.val <= 78 ? 'NORMAL' : d.temp.val < 65 ? 'COOL' : 'WARM') : '—';
            const statusColor = status === 'NORMAL' ? 'var(--lcars-ice)' : status === 'COOL' ? 'var(--lcars-bluey)' : 'var(--lcars-butterscotch)';
            return html`
              <div class="ls-table-row" @click=${() => showMoreInfo(d.temp?.entry?.entity?.entity_id || d.humidity?.entry?.entity?.entity_id)}>
                <span class="ls-td ls-td-name">${name.toUpperCase()}</span>
                <span class="ls-td" style="color:${tempColor}">${d.temp ? `${Math.round(d.temp.val * 10) / 10}°` : '—'}</span>
                <span class="ls-td">${d.humidity ? `${Math.round(d.humidity.val)}%` : '—'}</span>
                <span class="ls-td" style="color:${statusColor}">${status}</span>
              </div>
            `;
          })}
        </div>
      </div>
    `;
  }

  /* ═══ Air Quality Breakdown (mockup top-right — AWAIR/AirLink) ═══ */
  _renderAirQuality(aqSensors) {
    // Find AQI, PM2.5, PM10, CO2, VOC sensors
    const metrics = {};
    for (const e of aqSensors) {
      const dc = e.state?.attributes?.device_class || '';
      const eid = e.entity?.entity_id || '';
      const val = Number(e.state?.state);
      if (isNaN(val)) continue;
      if (dc === 'aqi' && (!metrics.aqi || val > metrics.aqi.val)) metrics.aqi = { val, entry: e };
      if ((dc === 'pm25' || /pm_?2_?5/i.test(eid)) && !metrics.pm25) metrics.pm25 = { val, entry: e };
      if ((dc === 'pm10' || /pm_?10/i.test(eid)) && !metrics.pm10) metrics.pm10 = { val, entry: e };
      if ((dc === 'carbon_dioxide' || /co2|carbon_dioxide/i.test(eid)) && !metrics.co2) metrics.co2 = { val, entry: e };
      if ((dc === 'volatile_organic_compounds' || /voc/i.test(eid)) && !metrics.voc) metrics.voc = { val, entry: e };
    }

    if (Object.keys(metrics).length === 0) return '';

    const aqiVal = metrics.aqi?.val || 0;
    const aqiLabel = aqiVal <= 50 ? 'GOOD' : aqiVal <= 100 ? 'MODERATE' : aqiVal <= 150 ? 'SENSITIVE' : 'UNHEALTHY';
    const aqiHex = aqiVal <= 50 ? '#99ccff' : aqiVal <= 100 ? '#ffcc99' : '#ff5555';
    const aqiCssColor = aqiVal <= 50 ? 'var(--lcars-ice)' : aqiVal <= 100 ? 'var(--lcars-sunflower)' : 'var(--lcars-tomato)';
    // CO₂ threshold coloring (5X-LS-11)
    const co2Val = metrics.co2?.val || 0;
    const co2Color = co2Val > 1500 ? 'var(--lcars-tomato)' : co2Val > 1000 ? 'var(--lcars-sunflower)' : 'var(--lcars-ice)';
    const co2Status = co2Val > 1500 ? ' ⚠ HIGH' : co2Val > 1000 ? ' ⚠ ELEVATED' : '';

    return html`
      <div class="ls-section">
        <div class="ls-section-header">
          <span class="ls-section-label">AIR QUALITY</span>
          <span class="ls-section-line"></span>
        </div>
        <div class="ls-aq-panel">
          <div class="ls-aq-hero">
            ${_ringGauge(Math.min(aqiVal, 300), 300, 96, aqiHex, aqiVal > 0 ? `${aqiVal}` : '—', 'AQI')}
            <span class="ls-aq-status" style="color:${aqiCssColor}">${aqiLabel}</span>
          </div>
          <div class="ls-aq-metrics">
            ${metrics.pm25 ? html`<div class="ls-aq-row" @click=${() => showMoreInfo(metrics.pm25.entry.entity.entity_id)}><span class="ls-aq-metric-name">PM2.5</span><span class="ls-aq-metric-val">${metrics.pm25.val} µg/m³</span></div>` : ''}
            ${metrics.pm10 ? html`<div class="ls-aq-row" @click=${() => showMoreInfo(metrics.pm10.entry.entity.entity_id)}><span class="ls-aq-metric-name">PM10</span><span class="ls-aq-metric-val">${metrics.pm10.val} µg/m³</span></div>` : ''}
            ${metrics.co2 ? html`<div class="ls-aq-row" @click=${() => showMoreInfo(metrics.co2.entry.entity.entity_id)}><span class="ls-aq-metric-name">CO₂</span><span class="ls-aq-metric-val" style="color:${co2Color}">${metrics.co2.val} ppm${co2Status}</span></div>` : ''}
            ${metrics.voc ? html`<div class="ls-aq-row" @click=${() => showMoreInfo(metrics.voc.entry.entity.entity_id)}><span class="ls-aq-metric-name">TVOC</span><span class="ls-aq-metric-val">${metrics.voc.val} ppb</span></div>` : ''}
          </div>
        </div>
      </div>
    `;
  }

  /* ═══ Main Render ═══ */
  render() {
    if (!this._hass) return html`<div class="ls-loading">INITIALIZING LIFE SUPPORT...</div>`;
    const data = this._discoverAll();
    const f = this.filter;

    return html`
      <div class="ls-dashboard">
        ${this._renderOverview(data)}
        ${(f === FILTER_ALL || f === FILTER_CLIMATE) ? this._renderThermostats(data.thermostats) : ''}
        ${(f === FILTER_ALL || f === FILTER_AIR) ? this._renderAirQuality(data.aqSensors) : ''}
        ${(f === FILTER_ALL || f === FILTER_AIR) ? this._renderPurifiers(data.purifiers, data.aqSensors) : ''}
        ${(f === FILTER_ALL || f === FILTER_CLIMATE) ? this._renderTempGrid(data.tempSensors) : ''}
      </div>
    `;
  }

  static get styles() {
    return [
      lcarsBaseStyles,
      css`
        :host { display: block; }
        .ls-dashboard { display: flex; flex-direction: column; gap: 1rem; }
        .ls-loading { font-family: var(--lcars-font, 'Antonio', sans-serif); color: var(--lcars-gray); text-transform: uppercase; padding: 2rem; text-align: center; font-size: 1.25rem; letter-spacing: 0.1em; }

        /* ─── Overview Cards (mockup top row) ─── */
        .ls-overview {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(min(12rem, 100%), 1fr));
          gap: 0.375rem;
        }
        .ls-overview-card {
          display: flex; flex-direction: column; align-items: center; gap: 0.25rem;
          padding: 0.75rem 0.5rem;
          border: 2px solid var(--lcars-bluey, #8899ff); border-radius: 0.5rem;
          background: rgba(136,153,255,0.05);
          font-family: var(--lcars-font, 'Antonio', sans-serif); text-transform: uppercase;
        }
        .ls-ov-title { font-size: 0.75rem; color: var(--lcars-gray, #666688); letter-spacing: 0.1em; }
        .ls-ov-value { font-size: 1.5rem; color: var(--lcars-space-white, #f5f6fa); }
        .ls-ov-status { font-size: 0.75rem; }

        /* Ring gauge text */
        .ring-gauge .ring-value {
          font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 14px;
          text-transform: uppercase; font-weight: bold;
        }
        .ring-gauge .ring-sublabel {
          font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 8px;
          fill: var(--lcars-gray, #666688); text-transform: uppercase;
        }

        /* ─── Section Headers ─── */
        .ls-section { margin-bottom: 0.25rem; }
        .ls-section-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; }
        .ls-section-label {
          font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 1.25rem;
          color: var(--lcars-bluey, #8899ff); text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap;
        }
        .ls-section-line { flex: 1; height: 2px; background: var(--lcars-bluey, #8899ff); opacity: 0.4; }
        .ls-sensor-count {
          font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 1rem;
          color: var(--lcars-ice, #99ccff); white-space: nowrap;
        }

        /* ─── Thermostat Zone Cards ─── */
        .ls-thermo-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(min(10rem, 100%), 1fr));
          gap: 0.375rem;
        }
        .ls-thermo-card {
          display: flex; flex-direction: column; align-items: center; gap: 0.25rem;
          padding: 0.75rem; cursor: pointer;
          border: 2px solid var(--lcars-bluey, #8899ff); border-radius: 0.375rem;
          background: rgba(136,153,255,0.03);
          font-family: var(--lcars-font, 'Antonio', sans-serif); text-transform: uppercase;
          transition: border-color 200ms ease;
        }
        .ls-thermo-card:hover { border-color: var(--lcars-gold, #ffaa00); }
        .ls-thermo-card:focus-visible { outline: 2px solid var(--lcars-space-white); outline-offset: 2px; }
        .ls-thermo-name { font-size: 0.875rem; color: var(--lcars-space-white, #f5f6fa); letter-spacing: 0.05em; }
        .ls-thermo-temp { font-size: 2rem; }
        .ls-thermo-action { font-size: 0.75rem; }
        .ls-thermo-setpoint { font-size: 0.625rem; color: var(--lcars-gray, #666688); }

        /* ─── Table (purifiers + temp grid) ─── */
        .ls-purifier-table { display: flex; flex-direction: column; gap: 0.125rem; }
        .ls-table-header {
          display: grid; grid-template-columns: 2fr 1fr 1fr 1.5fr 1fr;
          gap: 0.5rem; padding: 0.25rem 0.5rem;
          font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 0.625rem;
          color: var(--lcars-gray, #666688); text-transform: uppercase; letter-spacing: 0.08em;
          border-bottom: 1px solid rgba(136,153,255,0.2);
        }
        .ls-table-row {
          display: grid; grid-template-columns: 2fr 1fr 1fr 1.5fr 1fr;
          gap: 0.5rem; padding: 0.375rem 0.5rem; cursor: pointer;
          font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 0.875rem;
          color: var(--lcars-space-white, #f5f6fa); text-transform: uppercase;
          border-bottom: 1px solid rgba(136,153,255,0.06);
          transition: background 150ms ease;
        }
        .ls-table-row:hover { background: rgba(136,153,255,0.08); }
        .ls-td { display: flex; align-items: center; }
        .ls-td-name { color: var(--lcars-ice, #99ccff); }
        .ls-th { display: flex; align-items: center; }

        /* Temp grid uses 4 columns */
        .ls-section:last-of-type .ls-table-header,
        .ls-section:last-of-type .ls-table-row {
          grid-template-columns: 2fr 1fr 1fr 1fr;
        }

        /* Filter life bar */
        .ls-filter-bar {
          width: 4rem; height: 0.5rem; background: rgba(153,204,255,0.15);
          border-radius: 0 0.25rem 0.25rem 0; overflow: hidden; display: inline-block; vertical-align: middle;
        }
        .ls-filter-fill { height: 100%; border-radius: 0 0.25rem 0.25rem 0; transition: width 300ms ease; }
        .ls-filter-pct { font-size: 0.7rem; margin-left: 0.25rem; color: var(--lcars-ice, #99ccff); }

        /* ─── Air Quality Panel ─── */
        .ls-aq-panel { display: flex; gap: 1.5rem; align-items: flex-start; }
        .ls-aq-hero {
          display: flex; flex-direction: column; align-items: center; gap: 0.125rem;
          min-width: 5rem;
        }
        .ls-aq-score { font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 2.5rem; }
        .ls-aq-label { font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 0.75rem; color: var(--lcars-gray, #666688); text-transform: uppercase; }
        .ls-aq-status { font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 0.875rem; text-transform: uppercase; }
        .ls-aq-metrics { display: flex; flex-direction: column; gap: 0.375rem; flex: 1; }
        .ls-aq-row {
          display: flex; justify-content: space-between; padding: 0.25rem 0; cursor: pointer;
          font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 0.875rem;
          text-transform: uppercase; border-bottom: 1px solid rgba(136,153,255,0.08);
        }
        .ls-aq-row:hover { background: rgba(136,153,255,0.08); }
        .ls-aq-metric-name { color: var(--lcars-ice, #99ccff); }
        .ls-aq-metric-val { color: var(--lcars-space-white, #f5f6fa); font-variant-numeric: tabular-nums; }
      `,
    ];
  }
}

const ready = Promise.race([customElements.whenDefined('hui-masonry-view'), new Promise((r) => setTimeout(r, 5000))]);
ready.then(() => { if (!customElements.get('lifesupport-card')) { customElements.define('lifesupport-card', LcarsLifeSupportCard); } });
