/**
 * lcars-engineering-card.js — v5.1.0 Engineering Dashboard Redesign
 *
 * Inspired by ChatGPT LCARS Power Distribution mockup (Apr 26 2026).
 * Power flow topology: Sources → Distribution Bus → Load Circuits.
 * System status sidebar, battery overview, circuit monitoring table.
 *
 * Entity sources:
 * - Eric: Emporia Vue (210 circuits), NUT UPS, TP-Link smart plugs
 * - Leith: EcoFlow batteries (3 units, 191 entities), Emporia Vue (84), Shelly Pro 3EM
 */
import { LitElement, html, css, svg } from 'lit-element';
import { lcarsEventBus, showMoreInfo } from './lcars-helpers.js';
import { lcarsBaseStyles } from './lcars-styles.js';
import { getFloors, getAreasByFloor } from './lcars-hierarchy-utils.js';

/* ─── SVG Ring Gauge for Battery SOC ─── */
function _ringGauge(value, max, size, color, label, sublabel) {
  const r = (size - 8) / 2;
  const circumference = 2 * Math.PI * r;
  const pct = Math.min(1, Math.max(0, value / max));
  const dashOffset = circumference * (1 - pct);
  const cx = size / 2, cy = size / 2;
  return svg`
    <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" class="ring-gauge" role="meter"
         aria-valuenow="${value}" aria-valuemin="0" aria-valuemax="${max}" aria-label="${label}: ${value}">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="rgba(153,204,255,0.12)" stroke-width="4" />
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="4"
              stroke-dasharray="${circumference}" stroke-dashoffset="${dashOffset}"
              stroke-linecap="round" transform="rotate(-90 ${cx} ${cy})"
              style="transition: stroke-dashoffset 500ms ease" />
      <text x="${cx}" y="${cy - 4}" text-anchor="middle" dominant-baseline="central"
            class="ring-value" style="fill:${color}">${label}</text>
      ${sublabel ? svg`<text x="${cx}" y="${cy + 10}" text-anchor="middle" dominant-baseline="central"
            class="ring-sublabel">${sublabel}</text>` : ''}
    </svg>`;
}
import { getAreaEntities } from './lcars-entity-query.js';
import { isDiagnosticEntity } from './lcars-entity-utils.js';
import { formatNumber } from './lcars-format-utils.js';
import { lcarsAudio } from './lcars-audio.js';

import './panels/battery/lcars-battery-panel.js';

const TAG = 'EngineeringCard';
const FILTER_ALL = 'all';
const FILTER_STORAGE = 'storage';
const FILTER_CIRCUITS = 'circuits';

const POWER_CLASSES = new Set(['battery', 'power', 'energy', 'voltage', 'current']);
const UPS_KEYWORDS = /ups|battery_charge|battery_runtime|battery_voltage/i;
const GRID_KEYWORDS = /grid|mains|mainsfromgrid|main.*load|total.*power|vueg3.*main|shelly.*total|3em.*total/i;
// 5X-ENG-8: Filter out non-storage battery entities
const STORAGE_PLATFORMS = new Set(['ecoflow_cloud', 'nut', 'victron', 'tesla_powerwall', 'solaredge']);
const NON_STORAGE_PLATFORMS = new Set(['wallbox', 'insteon', 'blink', 'simplisafe', 'tile', 'switchbot', 'unifiprotect', 'unifi', 'mobile_app', 'nest_protect']);
const NON_STORAGE_KEYWORDS = /motion.sensor|remote|phone|tablet|watch|tile|tag|lock|camera|protect|switch.?bot|wallbox|vilya|charger|thermostat|meter|doorbell/i;

class LcarsEngineeringCard extends LitElement {
  static get properties() {
    return { hass: { type: Object }, _config: { type: Object }, filter: { type: String } };
  }
  constructor() {
    super();
    this._hass = null; this._config = {}; this.filter = FILTER_ALL;
    this._entityCache = new Map();
    this._onFilter = (e) => { this.filter = e.detail.filter; };
  }
  connectedCallback() { super.connectedCallback(); lcarsEventBus.addEventListener('lcars-eng-filter', this._onFilter); }
  disconnectedCallback() { super.disconnectedCallback(); lcarsEventBus.removeEventListener('lcars-eng-filter', this._onFilter); }
  setConfig(config) { this._config = config || {}; }
  set hass(val) { const old = this._hass; this._hass = val; if (val && old !== val) { this._entityCache.clear(); this.requestUpdate('hass', old); } }
  get hass() { return this._hass; }
  getCardSize() { return 16; }

  _discoverAll() {
    if (!this._hass) return { batteries: [], circuits: [], gridSensors: [], upsSensors: [], totalDraw: 0 };
    const states = this._hass.states || {};
    const batteries = [], circuits = [], gridSensors = [], upsSensors = [];
    let totalDraw = 0;
    const floors = getFloors(this._hass);
    const floorMap = getAreasByFloor(this._hass);
    const seenDevices = new Set();
    const allAreas = [];
    for (const floor of floors) { for (const area of (floorMap.get(floor.floor_id) || [])) allAreas.push({ floor, area }); }
    for (const area of (floorMap.get(null) || [])) allAreas.push({ floor: null, area });

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
        if (dc === 'battery' && e.device_id && !seenDevices.has(e.device_id)) {
          // 5X-ENG-8: Only include actual energy storage devices, not motion sensors etc.
          if (NON_STORAGE_PLATFORMS.has(platform)) continue;
          const device = this._hass?.devices?.[e.device_id];
          const devName = (device?.name || e.entity_id || '').toLowerCase();
          if (NON_STORAGE_KEYWORDS.test(devName) || NON_STORAGE_KEYWORDS.test(e.entity_id)) continue;
          const isStorage = STORAGE_PLATFORMS.has(platform) || /ecoflow|river|delta|powerwall|ups/i.test(devName);
          if (!isStorage) continue; // Only show confirmed storage devices
          seenDevices.add(e.device_id);
          batteries.push({ entry, device, deviceId: e.device_id, area, floor });
          continue;
        }
        if (platform === 'nut' && UPS_KEYWORDS.test(e.entity_id)) { upsSensors.push(entry); continue; }
        if (dc === 'power' && GRID_KEYWORDS.test(e.entity_id)) { gridSensors.push(entry); continue; }
        if (dc === 'power' && !GRID_KEYWORDS.test(e.entity_id)) {
          const val = Number(state.state);
          if (!isNaN(val)) totalDraw += val;
          circuits.push(entry);
        }
      }
    }
    circuits.sort((a, b) => (Number(b.state?.state) || 0) - (Number(a.state?.state) || 0));
    return { batteries, circuits, gridSensors, upsSensors, totalDraw };
  }

  _getGridPower(data) {
    // Find grid power sensor with non-zero value
    const powerSensor = data.gridSensors.find(s =>
      (s.state?.attributes?.device_class === 'power') && Number(s.state?.state) > 0
    );
    if (powerSensor) return Number(powerSensor.state.state);
    // No solar/generator detected → grid ≈ total draw
    return data.totalDraw;
  }

  _renderSystemStatus(data) {
    const gridPower = this._getGridPower(data);
    let avgSoc = 0, batteryCount = 0;
    for (const b of data.batteries) { const soc = Number(b.entry.state?.state); if (!isNaN(soc)) { avgSoc += soc; batteryCount++; } }
    if (batteryCount > 0) avgSoc = Math.round(avgSoc / batteryCount);
    return html`
      <div class="eng-status-panel">
        <div class="eng-section-header"><span class="eng-section-label">SYSTEM STATUS</span></div>
        <div class="eng-status-grid">
          <span class="eng-status-key">LOAD</span><span class="eng-status-val">${formatNumber(data.totalDraw, 0)} W</span>
          <span class="eng-status-key">GRID</span><span class="eng-status-val">${formatNumber(gridPower, 0)} W</span>
          ${batteryCount > 0 ? html`
            <span class="eng-status-key">BATTERIES</span><span class="eng-status-val">${batteryCount} UNITS</span>
            <span class="eng-status-key">AVG SOC</span><span class="eng-status-val">${avgSoc}%</span>
          ` : ''}
          <span class="eng-status-key">CIRCUITS</span><span class="eng-status-val">${data.circuits.length}</span>
          <span class="eng-status-key">HEALTH</span><span class="eng-status-val" style="color:var(--lcars-ice)">NOMINAL</span>
        </div>
      </div>`;
  }

  _renderSources(data) {
    const gridPower = this._getGridPower(data);
    return html`
      <div class="eng-section">
        <div class="eng-section-header"><span class="eng-section-label">POWER SOURCES</span><span class="eng-section-line"></span></div>
        <div class="eng-sources-row">
          <div class="eng-source-card" @click=${() => data.gridSensors[0] && showMoreInfo(data.gridSensors[0].entity.entity_id)}>
            <span class="eng-source-title" style="color:var(--lcars-ice)">GRID</span>
            <span class="eng-source-power">${formatNumber(gridPower, 0)} W</span>
            <span class="eng-source-status" style="color:var(--lcars-ice)">ONLINE</span>
          </div>
          ${data.upsSensors.length > 0 ? html`
            <div class="eng-source-card" @click=${() => showMoreInfo(data.upsSensors[0].entity.entity_id)}>
              <span class="eng-source-title" style="color:var(--lcars-sunflower)">UPS</span>
              ${data.upsSensors.filter(s => /charge$|load$|runtime$/i.test(s.entity?.entity_id)).map(s => {
                const val = s.state?.state;
                if (/charge/i.test(s.entity?.entity_id)) return html`<span class="eng-source-detail">${val}% CHARGE</span>`;
                if (/runtime/i.test(s.entity?.entity_id)) return html`<span class="eng-source-detail">${val} RUNTIME</span>`;
                if (/load$/i.test(s.entity?.entity_id)) return html`<span class="eng-source-detail">${val}% LOAD</span>`;
                return '';
              })}
              <span class="eng-source-status" style="color:var(--lcars-ice)">
                ${data.upsSensors.find(s => /status$/i.test(s.entity?.entity_id))?.state?.state?.toUpperCase() || 'ONLINE'}
              </span>
            </div>` : ''}
          ${data.batteries.map(b => {
            const soc = Number(b.entry.state?.state) || 0;
            const name = (b.device?.name || b.entry.state?.attributes?.friendly_name || 'BATTERY').toUpperCase();
            const socHex = soc > 50 ? '#99ccff' : soc > 20 ? '#ffcc99' : '#ff5555';
            return html`
              <div class="eng-source-card" @click=${() => showMoreInfo(b.entry.entity.entity_id)}>
                ${_ringGauge(soc, 100, 72, socHex, `${soc}%`, name.length > 10 ? name.substring(0, 10) : name)}
                <span class="eng-source-title" style="color:var(--lcars-butterscotch)">${name}</span>
              </div>`;
          })}
        </div>
      </div>`;
  }

  _renderDistribution(totalDraw) {
    return html`
      <div class="eng-distribution-bar">
        <span class="eng-dist-label">AC DISTRIBUTION BUS</span>
        <span class="eng-dist-value">${formatNumber(totalDraw, 0)} W TOTAL LOAD</span>
      </div>`;
  }

  _renderCircuits(circuits) {
    if (circuits.length === 0) return '';
    const active = circuits.filter(c => Number(c.state?.state) > 1);
    const top = active.slice(0, 12);
    const remaining = active.length - top.length;
    return html`
      <div class="eng-section">
        <div class="eng-section-header"><span class="eng-section-label">LOAD CIRCUITS</span><span class="eng-section-line"></span><span class="eng-circuit-count">${active.length} ACTIVE</span></div>
        <div class="eng-circuit-grid">
          ${top.map(c => {
            const name = (c.state?.attributes?.friendly_name || c.entity?.entity_id || '').replace(/_power.*$/i, '').replace(/_/g, ' ').toUpperCase();
            const watts = Number(c.state?.state) || 0;
            const barPct = Math.min(100, (watts / Math.max(watts, 500)) * 100);
            const barColor = watts > 1000 ? 'var(--lcars-tomato)' : watts > 500 ? 'var(--lcars-butterscotch)' : watts > 200 ? 'var(--lcars-sunflower)' : 'var(--lcars-ice)';
            return html`
              <div class="eng-circuit-card" @click=${() => showMoreInfo(c.entity.entity_id)}>
                <span class="eng-circuit-name">${name}</span>
                <span class="eng-circuit-watts">${formatNumber(watts, 0)} W</span>
                <div class="eng-circuit-bar"><div class="eng-circuit-fill" style="width:${barPct}%; background:${barColor}"></div></div>
              </div>`;
          })}
        </div>
        ${remaining > 0 ? html`<span class="eng-circuit-remaining">${remaining} MORE CIRCUITS</span>` : ''}
      </div>`;
  }

  render() {
    if (!this._hass) return html`<div class="eng-loading">INITIALIZING ENGINEERING SYSTEMS...</div>`;
    const data = this._discoverAll();
    const f = this.filter;
    return html`
      <div class="eng-dashboard">
        <div class="eng-main-content">
          ${this._renderSources(data)}
          ${this._renderDistribution(data.totalDraw)}
          ${(f === FILTER_ALL || f === FILTER_CIRCUITS) ? this._renderCircuits(data.circuits) : ''}
        </div>
        ${this._renderSystemStatus(data)}
      </div>`;
  }

  static get styles() {
    return [lcarsBaseStyles, css`
      :host { display: block; }
      .eng-dashboard { display: grid; grid-template-columns: 1fr 16rem; gap: 1rem; }
      .eng-main-content { display: flex; flex-direction: column; gap: 1rem; }
      .eng-loading { font-family: var(--lcars-font, 'Antonio', sans-serif); color: var(--lcars-gray); text-transform: uppercase; padding: 2rem; text-align: center; font-size: 1.25rem; letter-spacing: 0.1em; }
      @media (max-width: 900px) { .eng-dashboard { grid-template-columns: 1fr; } }
      .eng-section-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; }
      .eng-section-label { font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 1.25rem; color: var(--lcars-butterscotch, #ff9966); text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap; }
      .eng-section-line { flex: 1; height: 2px; background: var(--lcars-butterscotch, #ff9966); opacity: 0.4; }
      .eng-circuit-count, .eng-circuit-remaining { font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 0.875rem; color: var(--lcars-gray, #666688); white-space: nowrap; text-transform: uppercase; }
      .eng-sources-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(12rem, 100%), 1fr)); gap: 0.375rem; position: relative; padding-bottom: 1.5rem; }
      .eng-source-card { display: flex; flex-direction: column; align-items: center; gap: 0.25rem; padding: 0.75rem; cursor: pointer; border: 2px solid var(--lcars-butterscotch, #ff9966); border-radius: 0.375rem; background: rgba(255,153,102,0.03); font-family: var(--lcars-font, 'Antonio', sans-serif); text-transform: uppercase; transition: border-color 200ms ease; position: relative; }
      .eng-source-card::after { content: ''; position: absolute; bottom: -1.5rem; left: 50%; width: 3px; height: 1.5rem; background: var(--lcars-butterscotch, #ff9966); opacity: 0.4; }
      .eng-source-card:hover { border-color: var(--lcars-gold, #ffaa00); }
      .eng-source-card:focus-visible { outline: 2px solid var(--lcars-space-white); outline-offset: 2px; }
      .eng-source-title { font-size: 0.875rem; letter-spacing: 0.08em; }
      .eng-source-power { font-size: 1.75rem; color: var(--lcars-space-white, #f5f6fa); }
      .eng-source-detail { font-size: 0.75rem; color: var(--lcars-ice, #99ccff); }
      .eng-source-status { font-size: 0.75rem; }
      /* Ring gauge text */
      .ring-gauge .ring-value { font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 14px; text-transform: uppercase; font-weight: bold; }
      .ring-gauge .ring-sublabel { font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 7px; fill: var(--lcars-gray, #666688); text-transform: uppercase; }
      .eng-soc-bar { width: 100%; height: 0.5rem; background: rgba(153,204,255,0.15); border-radius: 0 0.25rem 0.25rem 0; overflow: hidden; }
      .eng-soc-fill { height: 100%; border-radius: 0 0.25rem 0.25rem 0; transition: width 300ms ease; }
      .eng-distribution-bar { display: flex; align-items: center; justify-content: center; gap: 1rem; padding: 0.5rem 1rem; background: var(--lcars-butterscotch, #ff9966); border-radius: 0.375rem; font-family: var(--lcars-font, 'Antonio', sans-serif); text-transform: uppercase; color: var(--lcars-black, #000); position: relative; margin-bottom: 1rem; }
      .eng-distribution-bar::after { content: ''; position: absolute; bottom: -1rem; left: 50%; width: 3px; height: 1rem; background: var(--lcars-butterscotch, #ff9966); opacity: 0.4; }
      .eng-dist-label { font-size: 0.875rem; opacity: 0.9; }
      .eng-dist-value { font-size: 1.125rem; font-weight: bold; font-variant-numeric: tabular-nums; }
      .eng-circuit-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(10rem, 100%), 1fr)); gap: 0.375rem; }
      .eng-circuit-card { display: flex; flex-direction: column; gap: 0.25rem; padding: 0.5rem 0.75rem; cursor: pointer; border: 1px solid rgba(255,153,102,0.2); border-radius: 0.25rem; font-family: var(--lcars-font, 'Antonio', sans-serif); text-transform: uppercase; transition: background 150ms ease; }
      .eng-circuit-card:hover { background: rgba(255,153,102,0.08); }
      .eng-circuit-name { font-size: 0.7rem; color: var(--lcars-ice, #99ccff); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .eng-circuit-watts { font-size: 1.25rem; color: var(--lcars-space-white, #f5f6fa); font-variant-numeric: tabular-nums; }
      .eng-circuit-bar { width: 100%; height: 0.375rem; background: rgba(153,204,255,0.1); border-radius: 0 0.25rem 0.25rem 0; overflow: hidden; }
      .eng-circuit-fill { height: 100%; border-radius: 0 0.25rem 0.25rem 0; transition: width 300ms ease; }
      .eng-status-panel { border: 2px solid var(--lcars-butterscotch, #ff9966); border-radius: 0.375rem; padding: 0.75rem; align-self: start; }
      .eng-status-grid { display: grid; grid-template-columns: 1fr auto; gap: 0.25rem 0.75rem; font-family: var(--lcars-font, 'Antonio', sans-serif); text-transform: uppercase; }
      .eng-status-key { font-size: 0.75rem; color: var(--lcars-gray, #666688); }
      .eng-status-val { font-size: 0.875rem; color: var(--lcars-space-white, #f5f6fa); text-align: right; font-variant-numeric: tabular-nums; }
    `];
  }
}

const ready = Promise.race([customElements.whenDefined('hui-masonry-view'), new Promise((r) => setTimeout(r, 5000))]);
ready.then(() => { if (!customElements.get('engineering-card')) { customElements.define('engineering-card', LcarsEngineeringCard); } });
