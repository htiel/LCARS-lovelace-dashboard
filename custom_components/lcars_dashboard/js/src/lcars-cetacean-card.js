/**
 * lcars-cetacean-card.js
 *
 * Cetacean Ops (Pool & Spa) Dashboard — dedicated aquatics dashboard
 * with summary bar, chemistry Langford gauges, water body controls,
 * pump telemetry, circuit grid, and lighting.
 *
 * v5.0.2 — Cetacean Ops Dashboard
 */
import { LitElement, html, css } from 'lit-element';
import { lcarsEventBus, showMoreInfo, lcarsLog } from './lcars-helpers.js';
import { lcarsBaseStyles } from './lcars-styles.js';
import { POOL_SPA_PLATFORMS } from './lcars-entity-utils.js';
import { formatNumber } from './lcars-format-utils.js';
import { getPoolBodyColor } from './lcars-color-utils.js';
import { clampSetpoint, createDebouncer } from './lcars-service-utils.js';
import { lcarsAudio } from './lcars-audio.js';

const TAG = 'CetaceanCard';
const FILTER_ALL = 'all';
const FILTER_WATER = 'water';
const FILTER_CHEMISTRY = 'chemistry';
const FILTER_FEATURES = 'features';
const FILTER_POWER = 'power';

/* Chemistry thresholds for Langford gauges */
const CHEM_CONFIG = {
  ph:          { label: 'pH',            unit: '',    min: 6.5, max: 8.5, optMin: 7.2, optMax: 7.6 },
  chlorine:    { label: 'FREE CHLORINE', unit: 'ppm', min: 0,   max: 6,   optMin: 1.0, optMax: 3.0 },
  alkalinity:  { label: 'ALKALINITY',    unit: 'ppm', min: 0,   max: 200, optMin: 80,  optMax: 120 },
  calcium:     { label: 'CALCIUM',       unit: 'ppm', min: 0,   max: 600, optMin: 200, optMax: 400 },
  hardness:    { label: 'HARDNESS',      unit: 'ppm', min: 0,   max: 600, optMin: 200, optMax: 400 },
  cya:         { label: 'CYA',           unit: 'ppm', min: 0,   max: 100, optMin: 30,  optMax: 50  },
};

const CHEM_KEYS = /ph_|ph$|chlorine|alkalinity|calcium|hardness|cyanuric/i;
const FEATURE_KEYS = /waterfall|spillway|bubbler|fountain|blower/i;
const PUMP_SENSOR_KEYS = /pump.*(watts|rpm|gpm)/i;
const PUMP_BINARY_KEYS = /pump$/i;

function _chemType(eid) {
  if (/ph/i.test(eid)) return 'ph';
  if (/chlorine/i.test(eid)) return 'chlorine';
  if (/alkalinity/i.test(eid)) return 'alkalinity';
  if (/calcium/i.test(eid)) return 'calcium';
  if (/total_hardness/i.test(eid)) return 'hardness';
  if (/cyanuric/i.test(eid)) return 'cya';
  return null;
}

function _chemStatus(value, cfg) {
  if (value == null || isNaN(value)) return 'unknown';
  const v = Number(value);
  if (v >= cfg.optMin && v <= cfg.optMax) return 'optimal';
  const lowWarn = cfg.optMin - (cfg.optMin - cfg.min) * 0.4;
  const highWarn = cfg.optMax + (cfg.max - cfg.optMax) * 0.4;
  if (v >= lowWarn && v <= highWarn) return 'acceptable';
  return 'alert';
}

class LcarsCetaceanCard extends LitElement {

  static get properties() {
    return { hass: { type: Object }, _config: { type: Object }, filter: { type: String } };
  }

  constructor() {
    super();
    this.hass = null; this._config = {}; this.filter = FILTER_ALL;
    this._spDebouncer = null;
    this._onFilter = (e) => { this.filter = e.detail.filter; };
  }

  setConfig(config) { this._config = config; }

  connectedCallback() {
    super.connectedCallback();
    lcarsEventBus.addEventListener('lcars-cet-filter', this._onFilter);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    lcarsEventBus.removeEventListener('lcars-cet-filter', this._onFilter);
  }

  /* ═══ Entity Discovery ═══ */
  _discoverEntities() {
    if (!this.hass) return [];
    const entities = Object.values(this.hass.entities || {});
    const states = this.hass.states || {};
    const result = [];
    for (const e of entities) {
      if (e.hidden_by || e.disabled_by) continue;
      if (POOL_SPA_PLATFORMS.has(e.platform)) {
        const state = states[e.entity_id];
        if (state) result.push({ entity: e, domain: e.entity_id.split('.')[0], state });
        continue;
      }
      if (e.platform === 'emporia_vue' && /pool/i.test(e.entity_id)) {
        const state = states[e.entity_id];
        if (state) result.push({ entity: e, domain: e.entity_id.split('.')[0], state, _source: 'emporia' });
      }
    }
    return result;
  }

  _partition(entries) {
    const pool = [], spa = [], chemistry = [], waterFeatures = [], circuits = [];
    const lights = [], pumpTelemetry = [], pumpBinary = [], environmental = [];
    const sensorHealth = [], power = [];
    let freezeSensor = null, airTemp = null;

    for (const entry of entries) {
      const eid = entry.entity.entity_id;
      const domain = entry.domain;
      if (entry._source === 'emporia') { power.push(entry); continue; }
      if (domain === 'climate') { /spa/i.test(eid) ? spa.push(entry) : pool.push(entry); continue; }
      if (domain === 'binary_sensor' && /freeze/i.test(eid)) { freezeSensor = entry; continue; }
      if (domain === 'binary_sensor' && PUMP_BINARY_KEYS.test(eid)) { pumpBinary.push(entry); continue; }
      if (domain === 'binary_sensor') continue; // skip delay/alert binary sensors
      if (domain === 'light') { lights.push(entry); continue; }
      if (domain === 'sensor' && CHEM_KEYS.test(eid) && !/alert/i.test(eid)) { chemistry.push(entry); continue; }
      if (domain === 'sensor' && PUMP_SENSOR_KEYS.test(eid)) { pumpTelemetry.push(entry); continue; }
      if (domain === 'sensor' && /air.*temp/i.test(eid)) { airTemp = entry; continue; }
      if (domain === 'sensor' && /cassette|battery|last_measurement|signal_strength|status|skimmer_flow/i.test(eid)) {
        sensorHealth.push(entry); continue;
      }
      if (domain === 'switch') {
        if (FEATURE_KEYS.test(eid)) waterFeatures.push(entry);
        else circuits.push(entry);
        continue;
      }
      if (domain === 'sensor' && entry.state?.attributes?.device_class === 'temperature') { environmental.push(entry); continue; }
    }
    return { pool, spa, chemistry, waterFeatures, circuits, lights, pumpTelemetry,
             pumpBinary, environmental, sensorHealth, power, freezeSensor, airTemp };
  }

  /* ═══ Summary Bar ═══ */
  _renderSummary(p) {
    const poolTemp = p.pool[0]?.state?.attributes?.current_temperature;
    const spaTemp = p.spa[0]?.state?.attributes?.current_temperature;
    const poolAction = p.pool[0]?.state?.attributes?.hvac_action || 'off';
    const spaAction = p.spa[0]?.state?.attributes?.hvac_action || 'off';

    // Chemistry aggregate
    const chemStatuses = p.chemistry.map(e => {
      const ct = _chemType(e.entity.entity_id);
      if (!ct || !CHEM_CONFIG[ct]) return null;
      return _chemStatus(Number(e.state?.state), CHEM_CONFIG[ct]);
    }).filter(Boolean);
    const alertCount = chemStatuses.filter(s => s === 'alert').length;
    const cautionCount = chemStatuses.filter(s => s === 'acceptable').length;
    const chemLabel = alertCount > 0 ? `${alertCount} ALERT` : cautionCount > 0 ? `${cautionCount} CAUTION` : 'OPTIMAL';
    const chemColor = alertCount > 0 ? 'var(--lcars-tomato)' : cautionCount > 0 ? 'var(--lcars-sunflower)' : 'var(--lcars-ice)';

    // Systems count
    const activePumps = p.pumpBinary.filter(e => e.state?.state === 'on').length;
    const activeCircuits = p.circuits.filter(e => e.state?.state === 'on').length;
    const totalSystems = p.pumpBinary.length + p.circuits.length;
    const activeSystems = activePumps + activeCircuits;

    const isFreezing = p.freezeSensor?.state?.state === 'on';
    const summaryColor = isFreezing ? 'var(--lcars-ice, #99ccff)' : 'var(--lcars-sky, #aaaaff)';

    return html`
      <div class="cet-summary" style="--summary-color:${summaryColor}">
        <div class="cet-summary__block">
          <span class="cet-summary__label">POOL</span>
          <span class="cet-summary__value">${poolTemp != null ? `${Math.round(poolTemp)}°F` : '—'}</span>
          ${poolAction === 'heating' ? html`<span class="cet-summary__badge" style="color:var(--lcars-butterscotch)">● HEATING</span>` : ''}
        </div>
        <div class="cet-summary__block">
          <span class="cet-summary__label">SPA</span>
          <span class="cet-summary__value">${spaTemp != null ? `${Math.round(spaTemp)}°F` : '—'}</span>
          ${spaAction === 'heating' ? html`<span class="cet-summary__badge" style="color:var(--lcars-butterscotch)">● HEATING</span>` : ''}
        </div>
        <div class="cet-summary__block">
          <span class="cet-summary__label">CHEMISTRY</span>
          <span class="cet-summary__value" style="color:${chemColor}">${chemLabel}</span>
        </div>
        <div class="cet-summary__block">
          <span class="cet-summary__label">SYSTEMS</span>
          <span class="cet-summary__value">${activeSystems}/${totalSystems} ACTIVE</span>
        </div>
        ${isFreezing ? html`
          <div class="cet-summary__block">
            <span class="cet-summary__label" style="color:var(--lcars-ice)">❄ FREEZE</span>
            <span class="cet-summary__value" style="color:var(--lcars-ice)">ACTIVE</span>
          </div>
        ` : ''}
      </div>

      <!-- Chemistry status segments (Row 2) -->
      ${chemStatuses.length > 0 ? html`
        <div class="cet-chem-segments">
          ${p.chemistry.map(e => {
            const ct = _chemType(e.entity.entity_id);
            if (!ct || !CHEM_CONFIG[ct]) return '';
            const status = _chemStatus(Number(e.state?.state), CHEM_CONFIG[ct]);
            const segColor = status === 'alert' ? 'var(--lcars-tomato)' : status === 'acceptable' ? 'var(--lcars-sunflower)' : 'var(--lcars-ice)';
            return html`<span class="cet-chem-seg" style="background:${segColor}">${CHEM_CONFIG[ct].label.split(' ')[0]}</span>`;
          })}
        </div>
      ` : ''}
    `;
  }

  /* ═══ Water Bodies ═══ */
  _handleSetpoint(entityId, attrs, value) {
    const clamped = clampSetpoint(value, attrs, { min: 40, max: 104 });
    if (!this._spDebouncer) {
      this._spDebouncer = createDebouncer((eid, temp) => {
        this.hass.callService('climate', 'set_temperature', { entity_id: eid, temperature: temp });
      }, 1500);
    }
    this._spDebouncer.call(entityId, clamped);
  }

  _renderWaterBody(entries, bodyType) {
    if (!entries.length) return '';
    const primary = entries[0];
    const cs = primary.state;
    const attrs = cs?.attributes || {};
    const currentTemp = attrs.current_temperature != null ? Number(attrs.current_temperature) : null;
    const targetTemp = attrs.temperature != null ? Number(attrs.temperature) : null;
    const hvacAction = attrs.hvac_action || 'off';
    const bodyColor = getPoolBodyColor(hvacAction, bodyType);
    const label = bodyType === 'spa' ? 'SPA' : 'POOL';
    const isHeating = hvacAction === 'heating';

    return html`
      <div class="cet-body-frame" style="--body-color:${bodyColor}" role="region"
        aria-label="${label}: ${currentTemp != null ? currentTemp + '°' : 'N/A'}">
        <div class="cet-body-label" style="color:${bodyColor}">${label}</div>
        <div class="cet-body-temp" style="color:${bodyColor}">${currentTemp != null ? `${Math.round(currentTemp)}°` : '—'}</div>
        ${targetTemp != null ? html`
          <div class="cet-sp-row">
            <button class="cet-sp-btn" aria-label="Decrease ${label} target"
              @click=${() => this._handleSetpoint(primary.entity.entity_id, attrs, targetTemp - 1)}>−</button>
            <span class="cet-sp-target" style="color:${bodyColor}">${targetTemp}°</span>
            <button class="cet-sp-btn" aria-label="Increase ${label} target"
              @click=${() => this._handleSetpoint(primary.entity.entity_id, attrs, targetTemp + 1)}>+</button>
          </div>
        ` : ''}
        ${isHeating ? html`<div class="cet-heating-bar" style="--body-color:${bodyColor}"></div>` : ''}
        <div class="cet-body-mode">${attrs.preset_mode || hvacAction}</div>
      </div>
    `;
  }

  _renderWaterBodies(p) {
    if (!p.pool.length && !p.spa.length) return '';
    const airVal = p.airTemp?.state?.state;
    return html`
      <div class="cet-section">
        <div class="cet-section-header">
          <span class="cet-section-label">WATER BODIES</span>
          <span class="cet-section-line"></span>
          ${airVal ? html`<span class="cet-air-temp">AIR ${Math.round(Number(airVal))}°F</span>` : ''}
        </div>
        <div class="cet-bodies-row">
          ${this._renderWaterBody(p.pool, 'pool')}
          ${this._renderWaterBody(p.spa, 'spa')}
        </div>
      </div>
    `;
  }

  /* ═══ Chemistry Langford Gauges ═══ */
  _renderChemistry(p) {
    if (!p.chemistry.length) return '';
    return html`
      <div class="cet-section">
        <div class="cet-section-header">
          <span class="cet-section-label">CHEMISTRY — SCIENCE STATION</span>
          <span class="cet-section-line"></span>
        </div>
        <div class="cet-chem-gauges">
          ${p.chemistry.map(e => {
            const ct = _chemType(e.entity.entity_id);
            if (!ct || !CHEM_CONFIG[ct]) return '';
            const cfg = CHEM_CONFIG[ct];
            const val = Number(e.state?.state);
            const status = _chemStatus(val, cfg);
            return this._renderGauge(cfg, val, status, e.entity.entity_id);
          })}
        </div>
        ${this._renderSensorHealth(p.sensorHealth)}
      </div>
    `;
  }

  _renderGauge(cfg, value, status, entityId) {
    const range = cfg.max - cfg.min;
    const lowPct = ((cfg.optMin - cfg.min) / range) * 100;
    const optPct = ((cfg.optMax - cfg.optMin) / range) * 100;
    const highPct = 100 - lowPct - optPct;
    const needlePx = isNaN(value) ? 0 : Math.max(0, Math.min(100, ((value - cfg.min) / range) * 100));
    const statusLabel = status === 'optimal' ? 'OPTIMAL' : status === 'acceptable' ? 'CAUTION' : status === 'alert' ? 'ALERT' : '—';
    const statusColor = status === 'optimal' ? 'var(--lcars-ice)' : status === 'acceptable' ? 'var(--lcars-sunflower)' : 'var(--lcars-tomato)';

    return html`
      <div class="langford-gauge" role="meter" aria-valuenow="${value}" aria-valuemin="${cfg.min}" aria-valuemax="${cfg.max}"
           aria-label="${cfg.label}: ${isNaN(value) ? 'unavailable' : value}${cfg.unit}" @click=${() => showMoreInfo(entityId)}>
        <div class="gauge-header">
          <span class="gauge-label">${cfg.label}</span>
          <span class="gauge-readout" style="color:${statusColor}">${isNaN(value) ? '—' : value}${cfg.unit} ${statusLabel}</span>
        </div>
        <div class="gauge-track">
          <div class="gauge-zone gauge-warn-low" style="width:${lowPct}%"></div>
          <div class="gauge-zone gauge-optimal" style="width:${optPct}%"></div>
          <div class="gauge-zone gauge-warn-high" style="width:${highPct}%"></div>
          ${!isNaN(value) ? html`<div class="gauge-needle" style="--needle-pos:${needlePx}%"></div>` : ''}
        </div>
        <div class="gauge-scale">
          <span>${cfg.min}</span>
          <span>${cfg.optMin}</span>
          <span>${cfg.optMax}</span>
          <span>${cfg.max}</span>
        </div>
      </div>
    `;
  }

  _renderSensorHealth(sensors) {
    if (!sensors.length) return '';
    const battery = sensors.find(e => /battery/i.test(e.entity.entity_id));
    const cassette = sensors.find(e => /cassette_remaining/i.test(e.entity.entity_id));
    const cassetteDays = sensors.find(e => /cassette_days/i.test(e.entity.entity_id));
    const lastMeasure = sensors.find(e => /last_measurement/i.test(e.entity.entity_id));

    return html`
      <div class="cet-sensor-health">
        <span class="cet-section-sublabel">SENSOR</span>
        ${cassette ? html`<div class="cet-health-row"><span>CASSETTE</span><span>${cassette.state?.state}%${cassetteDays ? ` · ${cassetteDays.state?.state}d` : ''}</span></div>` : ''}
        ${battery ? html`<div class="cet-health-row"><span>BATTERY</span><span>${battery.state?.state}%</span></div>` : ''}
        ${lastMeasure ? html`<div class="cet-health-row"><span>LAST READ</span><span>${lastMeasure.state?.state}</span></div>` : ''}
      </div>
    `;
  }

  /* ═══ Water Features ═══ */
  _renderFeatures(p) {
    if (!p.waterFeatures.length && !p.lights.length) return '';
    return html`
      <div class="cet-section">
        <div class="cet-section-header">
          <span class="cet-section-label">WATER FEATURES</span>
          <span class="cet-section-line"></span>
        </div>
        <div class="cet-feature-grid">
          ${p.waterFeatures.map(e => this._renderToggle(e))}
          ${p.lights.map(e => this._renderToggle(e, true))}
        </div>
      </div>
    `;
  }

  _renderToggle(entry, isLight = false) {
    const name = (entry.state?.attributes?.friendly_name || entry.entity.entity_id).replace(/pentair.*?_/i, '').replace(/_/g, ' ').toUpperCase();
    const isOn = entry.state?.state === 'on';
    return html`
      <button class="cet-toggle ${isOn ? 'on' : ''}" role="switch" aria-checked="${isOn}"
        @click=${() => { this.hass.callService(isLight ? 'light' : 'switch', 'toggle', { entity_id: entry.entity.entity_id }); lcarsAudio.play('switchToggle'); }}>
        <span class="cet-toggle-name">${name}</span>
        <span class="cet-toggle-state">${isOn ? 'ON' : 'OFF'}</span>
      </button>
    `;
  }

  /* ═══ Pump Telemetry ═══ */
  _renderPumps(p) {
    if (!p.pumpBinary.length && !p.pumpTelemetry.length) return '';
    // Group telemetry by pump name prefix
    const pumpGroups = new Map();
    for (const e of p.pumpBinary) {
      const key = e.entity.entity_id.replace('binary_sensor.', '').replace(/_pump$/, '');
      if (!pumpGroups.has(key)) pumpGroups.set(key, { binary: null, watts: null, rpm: null, gpm: null });
      pumpGroups.get(key).binary = e;
    }
    for (const e of p.pumpTelemetry) {
      const eid = e.entity.entity_id;
      const key = eid.replace('sensor.', '').replace(/_pump_(watts|rpm|gpm)_now$/, '');
      if (!pumpGroups.has(key)) pumpGroups.set(key, { binary: null, watts: null, rpm: null, gpm: null });
      const g = pumpGroups.get(key);
      if (/watts/i.test(eid)) g.watts = e;
      else if (/rpm/i.test(eid)) g.rpm = e;
      else if (/gpm/i.test(eid)) g.gpm = e;
    }

    return html`
      <div class="cet-section">
        <div class="cet-section-header">
          <span class="cet-section-label">PUMP TELEMETRY</span>
          <span class="cet-section-line"></span>
        </div>
        ${[...pumpGroups.entries()].map(([key, g]) => {
          const name = key.replace(/pentair.*?_/i, '').replace(/_/g, ' ').toUpperCase();
          const isOn = g.binary?.state?.state === 'on';
          const watts = g.watts?.state?.state;
          const rpm = g.rpm?.state?.state;
          const gpm = g.gpm?.state?.state;
          return html`
            <div class="cet-pump-row ${isOn ? 'active' : ''}">
              <span class="cet-pump-dot ${isOn ? 'on' : ''}"></span>
              <span class="cet-pump-name">${name}</span>
              <span class="cet-pump-stat">${rpm ? `${formatNumber(Number(rpm), 0)} RPM` : '—'}</span>
              <span class="cet-pump-stat">${watts ? `${formatNumber(Number(watts), 0)}W` : '—'}</span>
              <span class="cet-pump-stat">${gpm ? `${formatNumber(Number(gpm), 0)} GPM` : '—'}</span>
            </div>
          `;
        })}
      </div>
    `;
  }

  /* ═══ Circuits ═══ */
  _renderCircuits(p) {
    if (!p.circuits.length) return '';
    return html`
      <div class="cet-section">
        <div class="cet-section-header">
          <span class="cet-section-label">CIRCUITS</span>
          <span class="cet-section-line"></span>
          <span class="cet-circuit-count">${p.circuits.filter(e => e.state?.state === 'on').length}/${p.circuits.length}</span>
        </div>
        <div class="cet-circuit-grid">
          ${p.circuits.map(e => this._renderToggle(e))}
        </div>
      </div>
    `;
  }

  /* ═══ Power (Emporia) ═══ */
  _renderPower(p) {
    if (!p.power.length) return '';
    const sorted = [...p.power].sort((a, b) => Number(b.state?.state || 0) - Number(a.state?.state || 0));
    const total = sorted.reduce((s, e) => s + (Number(e.state?.state) || 0), 0);
    return html`
      <div class="cet-section">
        <div class="cet-section-header">
          <span class="cet-section-label">POOL EQUIPMENT POWER</span>
          <span class="cet-section-line"></span>
          <span class="cet-power-total">${formatNumber(total, 0)}W</span>
        </div>
        <div class="cet-power-grid">
          ${sorted.filter(e => Number(e.state?.state) > 1).map(e => {
            const name = (e.state?.attributes?.friendly_name || e.entity.entity_id).toUpperCase();
            const watts = Number(e.state?.state) || 0;
            return html`
              <div class="cet-power-tile" @click=${() => showMoreInfo(e.entity.entity_id)}>
                <span class="cet-power-name">${name}</span>
                <span class="cet-power-watts">${formatNumber(watts, 0)}W</span>
              </div>
            `;
          })}
        </div>
      </div>
    `;
  }

  /* ═══ Freeze Banner ═══ */
  _renderFreezeBanner(p) {
    if (!p.freezeSensor || p.freezeSensor.state?.state !== 'on') return '';
    return html`
      <div class="cet-freeze-banner" role="alert">
        <span>❄</span> FREEZE PROTECT ACTIVE
      </div>
    `;
  }

  /* ═══ Main Render ═══ */
  render() {
    if (!this.hass) return html`<div class="cet-loading">INITIALIZING CETACEAN OPS...</div>`;
    const entries = this._discoverEntities();
    if (!entries.length) return html`<div class="cet-empty">NO AQUATIC SYSTEMS DETECTED</div>`;
    const p = this._partition(entries);
    const f = this.filter;

    return html`
      <div class="cet-dashboard">
        ${this._renderSummary(p)}
        ${this._renderFreezeBanner(p)}
        ${(f === FILTER_ALL || f === FILTER_WATER) ? this._renderWaterBodies(p) : ''}
        ${(f === FILTER_ALL || f === FILTER_CHEMISTRY) ? this._renderChemistry(p) : ''}
        ${(f === FILTER_ALL || f === FILTER_FEATURES) ? this._renderFeatures(p) : ''}
        ${(f === FILTER_ALL || f === FILTER_FEATURES) ? this._renderPumps(p) : ''}
        ${(f === FILTER_ALL || f === FILTER_FEATURES) ? this._renderCircuits(p) : ''}
        ${f === FILTER_POWER ? this._renderPower(p) : ''}
      </div>
    `;
  }

  static get styles() {
    return [
      lcarsBaseStyles,
      css`
        :host { display: block; }
        .cet-dashboard { display: flex; flex-direction: column; gap: 1rem; }
        .cet-loading, .cet-empty { font-family: var(--lcars-font, 'Antonio', sans-serif); color: var(--lcars-gray, #666688); text-transform: uppercase; padding: 2rem; text-align: center; font-size: 1.25rem; letter-spacing: 0.1em; }

        /* ─── Summary Bar ─── */
        .cet-summary {
          display: flex; gap: 0.25rem; padding: 0.5rem 1rem;
          background: var(--summary-color, var(--lcars-sky, #aaaaff));
          border-radius: 0.5rem; color: var(--lcars-black, #000);
          font-family: var(--lcars-font, 'Antonio', sans-serif); text-transform: uppercase;
        }
        .cet-summary__block { flex: 1; display: flex; flex-direction: column; gap: 0.125rem; }
        .cet-summary__label { font-size: 0.625rem; letter-spacing: 0.1em; opacity: 0.7; }
        .cet-summary__value { font-size: 1rem; font-variant-numeric: tabular-nums; }
        .cet-summary__badge { font-size: 0.625rem; }

        /* Chemistry status segments (Row 2) */
        .cet-chem-segments {
          display: flex; gap: 0.125rem; margin-top: 0.25rem;
        }
        .cet-chem-seg {
          flex: 1; text-align: center; padding: 0.125rem 0.25rem;
          border-radius: 0.25rem; font-family: var(--lcars-font, 'Antonio', sans-serif);
          font-size: 0.625rem; text-transform: uppercase; color: var(--lcars-black, #000);
          letter-spacing: 0.05em;
        }

        /* ─── Section Headers ─── */
        .cet-section { margin-bottom: 0.25rem; }
        .cet-section-header {
          display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;
        }
        .cet-section-label {
          font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 1.25rem;
          color: var(--lcars-sky, #aaaaff); text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap;
        }
        .cet-section-line { flex: 1; height: 2px; background: var(--lcars-sky, #aaaaff); opacity: 0.4; }
        .cet-section-sublabel {
          font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 0.875rem;
          color: var(--lcars-gray, #666688); text-transform: uppercase; margin-top: 0.75rem; margin-bottom: 0.25rem;
        }
        .cet-air-temp {
          font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 1rem;
          color: var(--lcars-space-white, #f5f6fa); text-transform: uppercase; white-space: nowrap;
        }
        .cet-circuit-count, .cet-power-total {
          font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 1rem;
          color: var(--lcars-ice, #99ccff); white-space: nowrap;
        }

        /* ─── Water Bodies ─── */
        .cet-bodies-row { display: flex; gap: 0.75rem; flex-wrap: wrap; }
        .cet-body-frame {
          flex: 1; min-width: 12rem; border: 3px solid var(--body-color);
          border-radius: 0.75rem; padding: 1rem; background: var(--lcars-bg, #000);
          display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
          position: relative; overflow: hidden;
        }
        .cet-body-label { font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 1.25rem; text-transform: uppercase; letter-spacing: 0.1em; }
        .cet-body-temp { font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 2.5rem; }
        .cet-sp-row { display: flex; align-items: center; gap: 1rem; }
        .cet-sp-btn {
          width: 2.5rem; height: 2.5rem; border: none; border-radius: 0.375rem;
          background: var(--lcars-gray, #666688); color: var(--lcars-space-white, #f5f6fa);
          font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 1.5rem;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
        }
        .cet-sp-btn:hover { background: var(--lcars-gold, #ffaa00); color: var(--lcars-black, #000); }
        .cet-sp-btn:focus-visible { outline: 2px solid var(--lcars-ice, #99ccff); outline-offset: 2px; }
        .cet-sp-target { font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 1.5rem; }
        .cet-heating-bar {
          position: absolute; bottom: 0; left: 0; right: 0; height: 4px;
          background: var(--body-color); animation: cet-heat-pulse 2s ease-in-out infinite;
        }
        @keyframes cet-heat-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @media (prefers-reduced-motion: reduce) { .cet-heating-bar { animation: none; } }
        .cet-body-mode {
          font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 0.75rem;
          color: var(--lcars-gray, #666688); text-transform: uppercase; letter-spacing: 0.08em;
        }

        /* ─── Langford Gauges ─── */
        .cet-chem-gauges { display: flex; flex-direction: column; gap: 0.75rem; }
        .langford-gauge { cursor: pointer; }
        .langford-gauge:hover .gauge-track { filter: brightness(1.15); }
        .gauge-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.25rem; }
        .gauge-label {
          font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 1rem;
          color: var(--lcars-space-white, #f5f6fa); text-transform: uppercase; letter-spacing: 0.05em;
        }
        .gauge-readout {
          font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 0.875rem;
          text-transform: uppercase; font-variant-numeric: tabular-nums;
        }
        .gauge-track {
          position: relative; height: 1.25rem; display: flex;
          border-radius: 0 var(--lcars-btn-radius, 1.5rem) var(--lcars-btn-radius, 1.5rem) 0;
          overflow: visible;
        }
        .gauge-zone { height: 100%; }
        .gauge-zone:first-child { border-radius: 0.375rem 0 0 0.375rem; }
        .gauge-zone:last-child { border-radius: 0 var(--lcars-btn-radius, 1.5rem) var(--lcars-btn-radius, 1.5rem) 0; }
        .gauge-warn-low, .gauge-warn-high { background: var(--lcars-sunflower, #ffcc99); }
        .gauge-optimal { background: var(--lcars-ice, #99ccff); }
        .gauge-needle {
          position: absolute; top: -3px; bottom: -3px; width: 3px;
          background: var(--lcars-black, #000); outline: 1px solid var(--lcars-space-white, #f5f6fa);
          left: var(--needle-pos, 0%); pointer-events: none;
          transition: left 300ms ease-out;
        }
        @media (prefers-reduced-motion: reduce) { .gauge-needle { transition: none; } }
        .gauge-scale {
          display: flex; justify-content: space-between; margin-top: 0.125rem;
          font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 0.625rem;
          color: var(--lcars-gray, #666688); text-transform: uppercase;
        }

        /* Sensor health */
        .cet-sensor-health { margin-top: 0.75rem; }
        .cet-health-row {
          display: flex; justify-content: space-between; padding: 0.125rem 0;
          font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 0.875rem;
          color: var(--lcars-space-white, #f5f6fa); text-transform: uppercase;
        }

        /* ─── Toggle Buttons ─── */
        .cet-feature-grid, .cet-circuit-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(min(14rem, 100%), 1fr));
          gap: 0.375rem;
        }
        .cet-toggle {
          display: flex; align-items: center; justify-content: space-between;
          height: 3rem; padding: 0 1rem;
          border: none; border-radius: 0 var(--lcars-btn-radius, 1.5rem) var(--lcars-btn-radius, 1.5rem) 0;
          background: var(--lcars-gray, #666688); color: var(--lcars-space-white, #f5f6fa);
          font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 1rem;
          text-transform: uppercase; cursor: pointer; transition: background 200ms ease;
        }
        .cet-toggle.on { background: var(--lcars-ice, #99ccff); color: var(--lcars-black, #000); }
        .cet-toggle:hover { filter: brightness(1.2); }
        .cet-toggle:focus-visible { outline: 2px solid var(--lcars-space-white, #f5f6fa); outline-offset: 2px; }
        .cet-toggle-name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .cet-toggle-state { font-size: 0.75rem; opacity: 0.8; flex-shrink: 0; margin-left: 0.5rem; }

        /* ─── Pump Telemetry ─── */
        .cet-pump-row {
          display: flex; align-items: center; gap: 0.75rem; padding: 0.375rem 0;
          font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 0.875rem;
          color: var(--lcars-gray, #666688); text-transform: uppercase;
          border-bottom: 1px solid rgba(170,170,255,0.1);
        }
        .cet-pump-row.active { color: var(--lcars-space-white, #f5f6fa); }
        .cet-pump-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: var(--lcars-gray, #666688); flex-shrink: 0;
        }
        .cet-pump-dot.on { background: var(--lcars-ice, #99ccff); }
        .cet-pump-name { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .cet-pump-stat { min-width: 5rem; text-align: right; font-variant-numeric: tabular-nums; }

        /* ─── Power Grid ─── */
        .cet-power-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(min(12rem, 100%), 1fr));
          gap: 0.375rem;
        }
        .cet-power-tile {
          display: flex; flex-direction: column; gap: 0.25rem;
          padding: 0.5rem 0.75rem; border-radius: 0.375rem;
          background: rgba(170,170,255,0.08); cursor: pointer;
          font-family: var(--lcars-font, 'Antonio', sans-serif); text-transform: uppercase;
        }
        .cet-power-tile:hover { background: rgba(170,170,255,0.15); }
        .cet-power-name { font-size: 0.75rem; color: var(--lcars-gray, #666688); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .cet-power-watts { font-size: 1.25rem; color: var(--lcars-ice, #99ccff); font-variant-numeric: tabular-nums; }

        /* ─── Freeze Banner ─── */
        .cet-freeze-banner {
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          padding: 0.5rem; border-radius: 0.25rem;
          background: var(--lcars-ice, #99ccff); color: var(--lcars-black, #000);
          font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 1rem;
          text-transform: uppercase; letter-spacing: 0.1em;
          animation: cet-freeze-pulse 2s ease-in-out infinite;
        }
        @keyframes cet-freeze-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
        @media (prefers-reduced-motion: reduce) { .cet-freeze-banner { animation: none; } }
      `,
    ];
  }
}

const ready = Promise.race([customElements.whenDefined('hui-masonry-view'), new Promise((r) => setTimeout(r, 5000))]);
ready.then(() => { if (!customElements.get('cetacean-card')) { customElements.define('cetacean-card', LcarsCetaceanCard); } });
