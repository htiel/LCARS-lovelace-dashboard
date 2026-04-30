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
import { lcarsEventBus, showMoreInfo, navigate } from './lcars-helpers.js';
import { lcarsBaseStyles } from './lcars-styles.js';
import { getAllAreasFlat } from './lcars-hierarchy-utils.js';
import { getAreaEntities } from './lcars-entity-query.js';
import { isDiagnosticEntity } from './lcars-entity-utils.js';
import { formatNumber } from './lcars-format-utils.js';

const TAG = 'EngineeringCard';
const FILTER_ALL = 'all';
const FILTER_STORAGE = 'storage';
const FILTER_CIRCUITS = 'circuits';

const POWER_CLASSES = new Set(['battery', 'power', 'energy', 'voltage', 'current']);
const UPS_KEYWORDS = /ups|battery_charge|battery_runtime|battery_voltage/i;
const GRID_KEYWORDS = /grid|mains|mainsfromgrid|main.*load|total.*power|vueg3.*main|shelly.*total|3em.*total/i;
const GRID_SIBLING_KEYWORDS = /grid|mains|main.*load|vueg3.*main|shelly.*total|3em.*total|totalusage/i;
// Aggregate/total sensors that double-count individual circuits
const AGGREGATE_KEYWORDS = /totalusage|total.*usage|^sensor\.balance|mainload|main.*load|mainsfromgrid|mainstogrid/i;
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
    const gridSiblings = {};
    let totalDraw = 0;
    const seenDevices = new Set();
    const allAreas = getAllAreasFlat(this._hass);

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
          // Skip aggregate/total sensors that double-count individual circuits
          if (AGGREGATE_KEYWORDS.test(e.entity_id)) continue;
          const val = Number(state.state);
          if (!isNaN(val)) totalDraw += val;
          circuits.push(entry);
        }
      }
    }
    circuits.sort((a, b) => (Number(b.state?.state) || 0) - (Number(a.state?.state) || 0));

    // Deduplicate 240V paired circuits: if both _l1 and _l2 exist, keep only the combined sensor
    // or if only _l1/_l2 exist without a combined, merge them into one entry
    const circuitMap = new Map();
    const pairedBases = new Set();
    for (const c of circuits) {
      const eid = c.entity.entity_id;
      const l1Match = eid.match(/^(sensor\..+?)_l1_/i);
      const l2Match = eid.match(/^(sensor\..+?)_l2_/i);
      if (l1Match) pairedBases.add(l1Match[1]);
      if (l2Match) pairedBases.add(l2Match[1]);
      circuitMap.set(eid, c);
    }
    // Remove _l1 and _l2 variants when a combined sensor exists for the same base
    for (const base of pairedBases) {
      const combinedId = `${base}_power_minute_average`;
      if (circuitMap.has(combinedId)) {
        // Combined exists — remove the L1/L2 variants and subtract from totalDraw
        for (const suffix of ['_l1_power_minute_average', '_l2_power_minute_average']) {
          const pairId = `${base}${suffix}`;
          if (circuitMap.has(pairId)) {
            const pairVal = Number(circuitMap.get(pairId).state?.state) || 0;
            totalDraw -= pairVal;
            circuitMap.delete(pairId);
          }
        }
      }
    }
    const dedupedCircuits = [...circuitMap.values()].sort((a, b) => (Number(b.state?.state) || 0) - (Number(a.state?.state) || 0));

    // Enrich batteries with sibling entities — pre-index by device_id (O(n) vs O(n²))
    const entities = this._hass?.entities || {};
    const byDevice = new Map();
    for (const [eid, e] of Object.entries(entities)) {
      if (e.device_id && states[eid]) {
        if (!byDevice.has(e.device_id)) byDevice.set(e.device_id, []);
        byDevice.get(e.device_id).push({ eid, state: states[eid], entity: e });
      }
    }
    for (const b of batteries) {
      b.siblings = {};
      const devEntities = byDevice.get(b.deviceId) || [];
      for (const { eid, state: s } of devEntities) {
        const dc = s.attributes?.device_class || '';
        const leid = eid.toLowerCase();
        if (dc === 'voltage' && !b.siblings.voltage) b.siblings.voltage = s;
        else if (dc === 'temperature' && !/pcs/i.test(eid) && !b.siblings.temp) b.siblings.temp = s;
        else if (dc === 'power' && /total.*in/i.test(eid) && !b.siblings.totalIn) b.siblings.totalIn = s;
        else if (dc === 'power' && /total.*out/i.test(eid) && !b.siblings.totalOut) b.siblings.totalOut = s;
        else if (/remaining.*time|discharge.*remain|charge.*remain/i.test(eid) && !b.siblings.runtime) b.siblings.runtime = s;
        else if (/charging.*state|battery.*state/i.test(eid) && !b.siblings.chargeState) b.siblings.chargeState = s;
        else if (/state.of.health/i.test(leid) && !b.siblings.soh) b.siblings.soh = s;
        else if (/\bcycles\b/i.test(leid) && !b.siblings.cycles) b.siblings.cycles = s;
      }
    }

    // Grid siblings: voltage, frequency, energy from grid-related entities
    for (const [eid, s] of Object.entries(states)) {
      if (!GRID_SIBLING_KEYWORDS.test(eid)) continue;
      const dc = s.attributes?.device_class || '';
      if (dc === 'voltage' && !gridSiblings.voltage) gridSiblings.voltage = s;
      else if (dc === 'frequency' && !gridSiblings.frequency) gridSiblings.frequency = s;
      else if (dc === 'energy' && /today/i.test(eid) && !gridSiblings.energyToday) gridSiblings.energyToday = s;
      else if (dc === 'current' && !gridSiblings.current) gridSiblings.current = s;
    }

    return { batteries, circuits: dedupedCircuits, gridSensors, upsSensors, totalDraw, gridSiblings };
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
    const gs = data.gridSiblings || {};
    const gridVoltage = gs.voltage ? Number(gs.voltage.state) : null;
    const gridFreq = gs.frequency ? Number(gs.frequency.state) : null;
    const gridEnergy = gs.energyToday ? Number(gs.energyToday.state) : null;
    const gridBarPct = Math.min(100, (gridPower / 5000) * 100);
    return html`
      <div class="eng-section">
        <div class="eng-section-header"><span class="eng-section-label">POWER SOURCES</span><span class="eng-section-line"></span></div>
        <div class="eng-sources-row">
          <div class="eng-source-card eng-grid-card" @click=${() => data.gridSensors[0] && showMoreInfo(data.gridSensors[0].entity.entity_id)}>
            <div class="eng-grid-header">
              <span class="eng-source-title" style="color:var(--lcars-ice)">GRID</span>
              ${gridVoltage != null ? html`<span class="eng-grid-voltage">${gridVoltage}V</span>` : ''}
            </div>
            <span class="eng-grid-power">${formatNumber(gridPower, 0)} W</span>
            <div class="eng-grid-bar"><div class="eng-grid-fill" style="width:${gridBarPct}%"></div></div>
            <div class="eng-battery-telemetry">
              ${gridVoltage != null ? html`<span class="eng-bt-key">VOLTAGE</span><span class="eng-bt-val">${gridVoltage} V</span>` : ''}
              ${gridFreq != null ? html`<span class="eng-bt-key">FREQUENCY</span><span class="eng-bt-val">${gridFreq} HZ</span>` : ''}
              ${gridEnergy != null ? html`<span class="eng-bt-key">TODAY</span><span class="eng-bt-val" style="color:var(--lcars-sunflower)">${formatNumber(gridEnergy, 1)} KWH</span>` : ''}
            </div>
            <div class="eng-grid-status">ONLINE</div>
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
            const socCssColor = soc > 50 ? 'var(--lcars-ice)' : soc > 20 ? 'var(--lcars-sunflower)' : 'var(--lcars-tomato)';
            const borderColor = socCssColor;
            // Power flow
            const totalIn = b.siblings?.totalIn ? Number(b.siblings.totalIn.state) || 0 : 0;
            const totalOut = b.siblings?.totalOut ? Number(b.siblings.totalOut.state) || 0 : 0;
            const isCharging = totalIn > totalOut + 5;
            const isDischarging = totalOut > totalIn + 5;
            const flowLabel = isCharging ? `▲ CHARGING ${formatNumber(totalIn, 0)}W` : isDischarging ? `▼ DISCHARGING ${formatNumber(totalOut, 0)}W` : '━ IDLE';
            const flowColor = isCharging ? 'var(--lcars-ice)' : isDischarging ? 'var(--lcars-butterscotch)' : 'var(--lcars-gray)';
            const flowBg = isCharging ? 'rgba(153,204,255,0.15)' : isDischarging ? 'rgba(255,153,102,0.15)' : 'rgba(102,102,136,0.15)';
            // Telemetry
            const voltage = b.siblings?.voltage ? Number(b.siblings.voltage.state) : null;
            const temp = b.siblings?.temp ? Number(b.siblings.temp.state) : null;
            const runtime = b.siblings?.runtime?.state || null;
            const chargeState = b.siblings?.chargeState?.state || null;
            // Numeric code from device model/serial
            const model = b.device?.model || '';
            const coreColor = soc > 80 ? 'var(--lcars-ice)' : soc > 60 ? 'var(--lcars-sky,#aaaaff)' : soc > 40 ? 'var(--lcars-bluey,#8899ff)' : soc > 20 ? 'var(--lcars-butterscotch)' : soc > 10 ? 'var(--lcars-peach,#ff8866)' : 'var(--lcars-tomato)';
            const coreClass = isCharging ? 'mini-core-charging' : isDischarging ? '' : 'mini-core-idle';
            // Enriched telemetry
            const soh = b.siblings?.soh ? Number(b.siblings.soh.state) : null;
            const cycles = b.siblings?.cycles ? Number(b.siblings.cycles.state) : null;
            const runtimeLabel = isCharging ? 'FULL IN' : isDischarging ? 'EMPTY IN' : 'RUNTIME';
            return html`
              <div class="eng-source-card eng-battery-card" style="border-color:${borderColor}"
                   @click=${() => showMoreInfo(b.entry.entity.entity_id)}>
                <div class="eng-battery-header">
                  <span class="eng-source-title" style="color:var(--lcars-butterscotch)">${name}</span>
                  ${model ? html`<span class="eng-battery-code">${model}</span>` : ''}
                </div>
                <div class="eng-battery-body">
                  <div class="mini-core" style="--core-color:${coreColor};--core-charge:${soc}">
                    <div class="mini-core-fill ${coreClass}"></div>
                    <div class="mini-core-tick" style="bottom:25%"></div>
                    <div class="mini-core-tick" style="bottom:50%"></div>
                    <div class="mini-core-tick" style="bottom:75%"></div>
                  </div>
                  <div class="eng-battery-stats">
                    <span class="eng-battery-soc" style="color:${coreColor}">${soc}%</span>
                    <span class="eng-battery-flow" style="color:${flowColor}">${isCharging ? '▲' : isDischarging ? '▼' : '━'} ${isCharging ? formatNumber(totalIn, 0) : isDischarging ? formatNumber(totalOut, 0) : '0'}W</span>
                    ${voltage != null ? html`<span class="eng-battery-volt">${voltage}V</span>` : ''}
                  </div>
                </div>
                <div class="eng-battery-status" style="background:${flowBg}; color:${flowColor}">${flowLabel}</div>
                <div class="eng-battery-telemetry">
                  ${temp != null ? html`<span class="eng-bt-key">TEMP</span><span class="eng-bt-val">${Math.round(temp)}°</span>` : ''}
                  ${runtime ? html`<span class="eng-bt-key">${runtimeLabel}</span><span class="eng-bt-val">${runtime}</span>` : ''}
                  ${soh != null && soh < 100 ? html`<span class="eng-bt-key">HEALTH</span><span class="eng-bt-val" style="color:${soh > 80 ? 'var(--lcars-ice)' : 'var(--lcars-sunflower)'}">${soh}%</span>` : ''}
                  ${cycles != null ? html`<span class="eng-bt-key">CYCLES</span><span class="eng-bt-val">${cycles}</span>` : ''}
                </div>
                <span class="eng-battery-detail" @click=${(e) => { e.stopPropagation(); navigate(`/lcars-habitat/0#area:${b.area?.area_id || ''}`); }}>DETAIL ►</span>
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
    const top = active.slice(0, 24);
    const remaining = active.length - top.length;
    return html`
      <div class="eng-section">
        <div class="eng-section-header"><span class="eng-section-label">LOAD CIRCUITS</span><span class="eng-section-line"></span><span class="eng-circuit-count">${active.length} ACTIVE</span></div>
        <div class="eng-circuit-grid">
          ${top.map(c => {
            const name = (c.state?.attributes?.friendly_name || c.entity?.entity_id || '')
              .replace(/_power.*$/i, '').replace(/_/g, ' ')
              .replace(/\s+(l[12])$/i, ' $1')  // keep L1/L2 suffix readable
              .toUpperCase();
            const watts = Number(c.state?.state) || 0;
            const barPct = Math.min(100, (watts / Math.max(...active.map(a => Number(a.state?.state) || 0), 500)) * 100);
            const barColor = watts > 1000 ? 'var(--lcars-tomato)' : watts > 500 ? 'var(--lcars-butterscotch)' : watts > 200 ? 'var(--lcars-sunflower)' : 'var(--lcars-ice)';
            return html`
              <div class="eng-circuit-card" @click=${() => showMoreInfo(c.entity.entity_id)}>
                <span class="eng-circuit-name">${name}</span>
                <span class="eng-circuit-watts">${formatNumber(watts, 0)} W</span>
                <div class="eng-circuit-bar"><div class="eng-circuit-fill" style="width:${barPct}%; background:${barColor}"></div></div>
              </div>`;
          })}
        </div>
        ${remaining > 0 ? html`<span class="eng-circuit-remaining">+ ${remaining} MORE CIRCUITS</span>` : ''}
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
      .eng-section-line {
        flex: 1; height: 2px; background: var(--lcars-butterscotch, #ff9966); opacity: 0.4;
        position: relative; overflow: hidden;
      }
      .eng-section-line::after {
        content: ''; position: absolute; top: 0; left: -15%; width: 15%; height: 100%;
        background: var(--lcars-gold, #ffaa00); opacity: 0.25;
        animation: eng-scan-line 4s ease-in-out infinite;
      }
      @keyframes eng-scan-line { 0% { left: -15%; } 100% { left: 100%; } }
      .eng-circuit-count, .eng-circuit-remaining { font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 0.875rem; color: var(--lcars-gray, #666688); white-space: nowrap; text-transform: uppercase; }
      .eng-sources-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(12rem, 100%), 1fr)); gap: 0.375rem; position: relative; padding-bottom: 1.5rem; }
      .eng-source-card { display: flex; flex-direction: column; align-items: center; gap: 0.25rem; padding: 0.75rem; cursor: pointer; border: none; border-radius: 0; background: rgba(255,153,102,0.03); font-family: var(--lcars-font, 'Antonio', sans-serif); text-transform: uppercase; transition: background 200ms ease; position: relative; }
      .eng-source-card::after { content: ''; position: absolute; bottom: -1.5rem; left: 50%; width: 4px; height: 1.5rem; background: var(--lcars-butterscotch, #ff9966); opacity: 0.65; animation: eng-conduit-flow 2s linear infinite; background-size: 4px 8px; background-image: repeating-linear-gradient(180deg, var(--lcars-butterscotch, #ff9966) 0px, var(--lcars-butterscotch, #ff9966) 4px, transparent 4px, transparent 8px); }
      @keyframes eng-conduit-flow { from { background-position: 0 0; } to { background-position: 0 8px; } }
      .eng-source-card:hover { background: rgba(255,153,102,0.08); }
      .eng-source-card:focus-visible { outline: 2px solid var(--lcars-space-white); outline-offset: 2px; }
      /* Enriched battery card — mini warp core (Prompt 3 mockup) */
      .eng-battery-card { gap: 0.375rem; }
      .eng-battery-body { display: flex; align-items: stretch; gap: 0.625rem; width: 100%; min-height: 4.5rem; }
      .mini-core { position: relative; width: 2rem; flex-shrink: 0; border-radius: 1rem; border: 2px solid var(--core-color); background: var(--lcars-black, #000); overflow: hidden; transition: border-color 1s ease; }
      .mini-core-fill { position: absolute; bottom: 0; left: 0; right: 0; height: calc(var(--core-charge, 0) * 1%); background: var(--core-color); opacity: 0.8; transition: height 1s ease; }
      .mini-core-fill.mini-core-idle { animation: mini-core-pulse 3s ease-in-out infinite; }
      .mini-core-fill.mini-core-charging { animation: mini-core-flow 2s linear infinite; background-image: repeating-linear-gradient(0deg, transparent 0px, transparent 0.5rem, rgba(255,255,255,0.15) 0.5rem, rgba(255,255,255,0.15) 0.625rem); }
      .mini-core-tick { position: absolute; left: 15%; right: 15%; height: 1px; background: var(--core-color); opacity: 0.3; }
      @keyframes mini-core-pulse { 0%,100% { opacity: 0.6; } 50% { opacity: 0.9; } }
      @keyframes mini-core-flow { from { background-position: 0 0; } to { background-position: 0 -1.125rem; } }
      .eng-battery-stats { display: flex; flex-direction: column; justify-content: center; gap: 0.125rem; }
      .eng-battery-soc { font-size: 1.5rem; font-weight: bold; line-height: 1; font-variant-numeric: tabular-nums; }
      .eng-battery-flow { font-size: 0.75rem; font-variant-numeric: tabular-nums; }
      .eng-battery-volt { font-size: 0.7rem; color: var(--lcars-ice, #99ccff); font-variant-numeric: tabular-nums; }
      .eng-battery-detail { font-size: 0.625rem; color: var(--lcars-gray, #666688); text-align: right; margin-top: auto; letter-spacing: 0.05em; cursor: pointer; }
      .eng-battery-detail:hover { color: var(--lcars-ice, #99ccff); }
      /* Enriched GRID card */
      .eng-grid-card { background: rgba(153,204,255,0.03) !important; }
      .eng-grid-header { display: flex; justify-content: space-between; align-items: baseline; width: 100%; }
      .eng-grid-voltage { font-size: 0.625rem; color: var(--lcars-gray, #666688); }
      .eng-grid-power { font-size: 1.75rem; color: var(--lcars-space-white, #f5f6fa); font-variant-numeric: tabular-nums; }
      .eng-grid-bar { width: 100%; height: 0.375rem; background: rgba(153,204,255,0.12); border-radius: 0 0.25rem 0.25rem 0; overflow: hidden; }
      .eng-grid-fill { height: 100%; background: var(--lcars-ice, #99ccff); border-radius: 0 0.25rem 0.25rem 0; transition: width 500ms ease; }
      .eng-grid-status { font-size: 0.75rem; color: var(--lcars-ice, #99ccff); padding: 0.125rem 0.5rem; border: 1px solid var(--lcars-ice, #99ccff); border-radius: 0 0.75rem 0.75rem 0; margin-top: auto; letter-spacing: 0.08em; }
      .eng-battery-header { display: flex; justify-content: space-between; align-items: baseline; width: 100%; }
      .eng-battery-code { font-size: 0.625rem; color: var(--lcars-gray, #666688); }
      .eng-battery-status {
        width: 100%; padding: 0.25rem 0.5rem; border-radius: 0 1rem 1rem 0;
        font-size: 0.75rem; text-align: center; text-transform: uppercase;
        font-family: var(--lcars-font, 'Antonio', sans-serif);
      }
      .eng-battery-telemetry {
        display: grid; grid-template-columns: auto 1fr; gap: 0.125rem 0.5rem;
        width: 100%; font-family: var(--lcars-font, 'Antonio', sans-serif);
        text-transform: uppercase; font-size: 0.7rem;
        border-top: 1px solid rgba(255,153,102,0.15); padding-top: 0.375rem;
      }
      .eng-bt-key { color: var(--lcars-gray, #666688); }
      .eng-bt-val { color: var(--lcars-ice, #99ccff); text-align: right; font-variant-numeric: tabular-nums; }
      .eng-source-title { font-size: 0.875rem; letter-spacing: 0.08em; }
      .eng-source-power { font-size: 1.75rem; color: var(--lcars-space-white, #f5f6fa); }
      .eng-source-detail { font-size: 0.75rem; color: var(--lcars-ice, #99ccff); }
      .eng-source-status { font-size: 0.75rem; }
      /* Ring gauge text */
      .ring-gauge .ring-value { font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 14px; text-transform: uppercase; }
      .ring-gauge .ring-sublabel { font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 7px; fill: var(--lcars-gray, #666688); text-transform: uppercase; }
      .eng-soc-bar { width: 100%; height: 0.5rem; background: rgba(153,204,255,0.15); border-radius: 0 0.25rem 0.25rem 0; overflow: hidden; }
      .eng-soc-fill { height: 100%; border-radius: 0 0.25rem 0.25rem 0; transition: width 300ms ease; }
      .eng-distribution-bar {
        display: flex; align-items: center; justify-content: center; gap: 1rem; padding: 0.5rem 1rem;
        background: var(--lcars-butterscotch, #ff9966); border-radius: 0;
        font-family: var(--lcars-font, 'Antonio', sans-serif); text-transform: uppercase;
        color: var(--lcars-black, #000); position: relative; margin-bottom: 1rem;
      }
      .eng-distribution-bar::after { content: ''; position: absolute; bottom: -1rem; left: 50%; width: 3px; height: 1rem; background: var(--lcars-butterscotch, #ff9966); opacity: 0.4; }
      .eng-dist-label { font-size: 0.875rem; opacity: 0.9; }
      .eng-dist-value { font-size: 1.125rem; font-weight: bold; font-variant-numeric: tabular-nums; }
      .eng-circuit-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(10rem, 100%), 1fr)); gap: 0.375rem; }
      .eng-circuit-card { display: flex; flex-direction: column; gap: 0.25rem; padding: 0.5rem 0.75rem; cursor: pointer; border: none; border-radius: 0; font-family: var(--lcars-font, 'Antonio', sans-serif); text-transform: uppercase; transition: background 150ms ease; }
      .eng-circuit-card:hover { background: rgba(255,153,102,0.08); }
      .eng-circuit-name { font-size: 0.7rem; color: var(--lcars-ice, #99ccff); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .eng-circuit-watts { font-size: 1.25rem; color: var(--lcars-space-white, #f5f6fa); font-variant-numeric: tabular-nums; }
      .eng-circuit-bar { width: 100%; height: 0.375rem; background: rgba(153,204,255,0.1); border-radius: 0 0.25rem 0.25rem 0; overflow: hidden; }
      .eng-circuit-fill {
        height: 100%; border-radius: 0 0.25rem 0.25rem 0; transition: width 300ms ease;
      }
      .eng-status-panel { padding: 0.75rem; align-self: start; }
      .eng-status-grid { display: grid; grid-template-columns: 1fr auto; gap: 0.25rem 0.75rem; font-family: var(--lcars-font, 'Antonio', sans-serif); text-transform: uppercase; }
      .eng-status-key { font-size: 0.75rem; color: var(--lcars-gray, #666688); }
      .eng-status-val { font-size: 0.875rem; color: var(--lcars-space-white, #f5f6fa); text-align: right; font-variant-numeric: tabular-nums; }
    `];
  }
}

const ready = Promise.race([customElements.whenDefined('hui-masonry-view'), new Promise((r) => setTimeout(r, 5000))]);
ready.then(() => { if (!customElements.get('engineering-card')) { customElements.define('engineering-card', LcarsEngineeringCard); } });
