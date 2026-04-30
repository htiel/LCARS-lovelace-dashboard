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
// 5X-ENG-7: Tightened grid regex — removed overly broad `total.*power` and ambiguous `vueg3.*main`
const GRID_KEYWORDS = /\bgrid\b|\bmains\b|mainsfromgrid|mainstogrid|main[_.]?(panel|breaker|load|feed)|total[_.]?active[_.]?power|shelly.*total|3em.*total|vueg3[_.]?main[_.]?power/i;
const GRID_SIBLING_KEYWORDS = /\bgrid\b|\bmains\b|main[_.]?(panel|breaker|load|feed)|shelly.*total|3em.*total|totalusage/i;
// Aggregate/total sensors that double-count individual circuits
const AGGREGATE_KEYWORDS = /totalusage|total.*usage|^sensor\.balance|mainload|main.*load|mainsfromgrid|mainstogrid/i;
// 5X-ENG-7: Grid sensor scoring — whole-home monitors vs per-device monitors
const GRID_METER_PLATFORMS = new Set(['shelly', 'sense', 'iotawatt', 'brultech', 'neurio', 'rainforest']);
const DEVICE_MONITOR_PLATFORMS = new Set(['tplink', 'vesync', 'kasa', 'wemo', 'meross', 'tuya', 'tasmota']);
const CIRCUIT_NAME_KEYWORDS = /plug|outlet|strip|lamp|desk|bedroom|kitchen|garage|bathroom|laundry|office|closet|fridge|dryer|washer|disposal|microwave/i;
// 5X-ENG-8: Filter out non-storage battery entities
const STORAGE_PLATFORMS = new Set(['ecoflow_cloud', 'nut', 'victron', 'tesla_powerwall', 'solaredge']);
const NON_STORAGE_PLATFORMS = new Set(['wallbox', 'insteon', 'blink', 'simplisafe', 'tile', 'switchbot', 'unifiprotect', 'unifi', 'mobile_app', 'nest_protect']);
const NON_STORAGE_KEYWORDS = /motion.sensor|remote|phone|tablet|watch|tile|tag|lock|camera|protect|switch.?bot|wallbox|vilya|charger|thermostat|meter|doorbell/i;

/** 5X-ENG-7: Score a grid sensor candidate — higher = more confident it's the true grid sensor */
function _scoreGridCandidate(entry) {
  const eid = entry.entity.entity_id;
  const platform = entry.entity.platform || '';
  let score = 0;
  // Strong: explicit grid/mains naming
  if (/\bgrid\b/i.test(eid)) score += 50;
  if (/\bmains\b/i.test(eid)) score += 50;
  if (/mainsfromgrid|mainstogrid/i.test(eid)) score += 60;
  // Strong: known grid meter hardware
  if (/3em/i.test(eid)) score += 40;
  if (GRID_METER_PLATFORMS.has(platform)) score += 30;
  // Medium: breaker/panel terminology
  if (/main[_.]?(panel|breaker)/i.test(eid)) score += 35;
  if (/total[_.]?active[_.]?power/i.test(eid)) score += 25;
  if (/vueg3[_.]?main[_.]?power/i.test(eid)) score += 15;
  // Penalties: per-device monitors and circuit-like names
  if (DEVICE_MONITOR_PLATFORMS.has(platform)) score -= 40;
  if (CIRCUIT_NAME_KEYWORDS.test(eid)) score -= 50;
  return score;
}

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
    if (!this._hass) return { batteries: [], circuits: [], gridSensors: [], upsSensors: [], voltageSensors: [], totalDraw: 0 };
    const states = this._hass.states || {};
    const batteries = [], circuits = [], gridSensors = [], upsSensors = [], voltageSensors = [];
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
        // Collect all voltage sensors for voltage overview
        if (dc === 'voltage' && domain === 'sensor') {
          const val = Number(state.state);
          if (!isNaN(val) && val > 0) voltageSensors.push(entry);
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
        else if (!b.siblings.storedKwh && (dc === 'energy' && /remain|stored|available/i.test(leid) || /remain.*kwh|kwh.*remain|energy.*remain|stored.*energy/i.test(leid))) b.siblings.storedKwh = s;
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

    // 5X-ENG-7: Sort grid candidates by confidence score (highest first)
    gridSensors.sort((a, b) => _scoreGridCandidate(b) - _scoreGridCandidate(a));

    return { batteries, circuits: dedupedCircuits, gridSensors, upsSensors, voltageSensors, totalDraw, gridSiblings };
  }

  _getGridPower(data) {
    if (data.gridSensors.length === 0) return data.totalDraw;
    // 5X-ENG-7: gridSensors pre-sorted by confidence; pick first with valid numeric state.
    // Accepts 0W — a valid reading (e.g. solar/battery offsetting grid import).
    for (const s of data.gridSensors) {
      const val = Number(s.state?.state);
      if (!isNaN(val)) return val;
    }
    // All grid sensors unavailable → fall back to circuit sum
    return data.totalDraw;
  }

  _renderSystemStatus(data) {
    const gridPower = this._getGridPower(data);
    let avgSoc = 0, batteryCount = 0;
    let totalStoredKwh = 0, hasStoredKwh = false;
    for (const b of data.batteries) {
      const soc = Number(b.entry.state?.state); if (!isNaN(soc)) { avgSoc += soc; batteryCount++; }
      if (b.siblings?.storedKwh) { const kwh = Number(b.siblings.storedKwh.state); if (!isNaN(kwh)) { totalStoredKwh += kwh; hasStoredKwh = true; } }
    }
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
            ${hasStoredKwh ? html`<span class="eng-status-key">STORED</span><span class="eng-status-val" style="color:var(--lcars-ice)">${formatNumber(totalStoredKwh, 2)} KWH</span>` : ''}
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
          <div class="eng-source-card eng-grid-card" role="button" tabindex="0"
               @click=${() => data.gridSensors[0] && showMoreInfo(data.gridSensors[0].entity.entity_id)}
               @keydown=${(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); data.gridSensors[0] && showMoreInfo(data.gridSensors[0].entity.entity_id); } }}>
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
            <div class="eng-source-card" role="button" tabindex="0"
                 @click=${() => showMoreInfo(data.upsSensors[0].entity.entity_id)}
                 @keydown=${(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showMoreInfo(data.upsSensors[0].entity.entity_id); } }}>
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
                   role="button" tabindex="0"
                   @click=${() => showMoreInfo(b.entry.entity.entity_id)}
                   @keydown=${(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showMoreInfo(b.entry.entity.entity_id); } }}>
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
                <span class="eng-battery-detail" role="link" tabindex="0"
                      @click=${(e) => { e.stopPropagation(); navigate(`/lcars-habitat/0#area:${b.area?.area_id || ''}`); }}
                      @keydown=${(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); navigate(`/lcars-habitat/0#area:${b.area?.area_id || ''}`); } }}>DETAIL ►</span>
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

  _renderVoltageOverview(voltageSensors) {
    if (voltageSensors.length === 0) return '';
    const high = [], normal = [], low = [];
    for (const s of voltageSensors) {
      const v = Number(s.state?.state);
      if (isNaN(v) || v <= 0) continue;
      const name = (s.state?.attributes?.friendly_name || s.entity?.entity_id || '')
        .replace(/_/g, ' ').replace(/\s*(voltage|volt)\s*/gi, ' ').replace(/\s+/g, ' ').trim().toUpperCase();
      const item = { name, voltage: v, entity: s.entity };
      if (v > 130) high.push(item);
      else if (v >= 110) normal.push(item);
      else low.push(item);
    }
    // Compute home voltage average from normal-range sensors
    const homeAvg = normal.length > 0
      ? normal.reduce((sum, i) => sum + i.voltage, 0) / normal.length
      : null;
    const homeColor = homeAvg != null
      ? (homeAvg >= 118 && homeAvg <= 122 ? 'var(--lcars-ice)' : 'var(--lcars-sunflower)')
      : 'var(--lcars-gray)';

    return html`
      <div class="eng-section">
        <div class="eng-section-header"><span class="eng-section-label">VOLTAGE OVERVIEW</span><span class="eng-section-line"></span></div>
        <div class="eng-voltage-grid">
          ${high.length > 0 ? html`
            <div class="eng-voltage-tier">
              <div class="eng-voltage-tier-header" style="background:var(--lcars-tomato)">
                <span class="eng-voltage-tier-name">HIGH VOLTAGE</span>
                <span class="eng-voltage-tier-count">${high.length}</span>
              </div>
              ${high.map(h => html`
                <div class="eng-voltage-row eng-voltage-high" role="button" tabindex="0"
                     @click=${() => showMoreInfo(h.entity.entity_id)}
                     @keydown=${(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showMoreInfo(h.entity.entity_id); } }}>
                  <span class="eng-voltage-name">${h.name}</span>
                  <span class="eng-voltage-val" style="color:var(--lcars-tomato)">${formatNumber(h.voltage, 1)} V</span>
                </div>`)}
            </div>` : ''}
          <div class="eng-voltage-tier">
            <div class="eng-voltage-tier-header" style="background:var(--lcars-ice)">
              <span class="eng-voltage-tier-name">HOME VOLTAGE</span>
              <span class="eng-voltage-tier-count">${homeAvg != null ? `${formatNumber(homeAvg, 1)} V AVG` : 'N/A'}</span>
            </div>
            ${normal.length > 0 ? html`
              <div class="eng-voltage-home-avg" style="color:${homeColor}">${formatNumber(homeAvg, 1)} V</div>
              <div class="eng-voltage-home-detail">${normal.length} SENSORS · ${formatNumber(Math.min(...normal.map(n => n.voltage)), 1)}–${formatNumber(Math.max(...normal.map(n => n.voltage)), 1)} V RANGE</div>
              ${normal.map(n => html`
                <div class="eng-voltage-row" role="button" tabindex="0"
                     @click=${() => showMoreInfo(n.entity.entity_id)}
                     @keydown=${(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showMoreInfo(n.entity.entity_id); } }}>
                  <span class="eng-voltage-name">${n.name}</span>
                  <span class="eng-voltage-val">${formatNumber(n.voltage, 1)} V</span>
                </div>`)}
            ` : html`<div class="eng-voltage-home-detail">NO SENSORS IN RANGE</div>`}
          </div>
          ${low.length > 0 ? html`
            <div class="eng-voltage-tier">
              <div class="eng-voltage-tier-header" style="background:var(--lcars-sunflower)">
                <span class="eng-voltage-tier-name">LOW VOLTAGE</span>
                <span class="eng-voltage-tier-count">${low.length}</span>
              </div>
              ${low.map(l => html`
                <div class="eng-voltage-row" role="button" tabindex="0"
                     @click=${() => showMoreInfo(l.entity.entity_id)}
                     @keydown=${(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showMoreInfo(l.entity.entity_id); } }}>
                  <span class="eng-voltage-name">${l.name}</span>
                  <span class="eng-voltage-val" style="color:var(--lcars-sunflower)">${formatNumber(l.voltage, 1)} V</span>
                </div>`)}
            </div>` : ''}
        </div>
      </div>`;
  }

  /* ═══ Circuit Classification — HA Labels override, name heuristic fallback ═══ */
  /* Labels: 'dedicated' → DEDICATED, 'infrastructure' → INFRASTRUCTURE,
   *         'lighting' → LIGHTING, 'outlets' → OUTLETS, 'battery' → BATTERY
   *  Checked on entity, device, and area (same pattern as tactical camera labels) */
  _getCircuitLabel(entry) {
    const LABEL_MAP = {
      dedicated: 'DEDICATED', infrastructure: 'INFRASTRUCTURE',
      lighting: 'LIGHTING', outlets: 'OUTLETS', battery: 'BATTERY',
    };
    // Check entity labels
    const entityLabels = entry.entity?.labels || [];
    for (const l of entityLabels) {
      const cat = LABEL_MAP[(l || '').toLowerCase()];
      if (cat) return cat;
    }
    // Check device labels
    if (entry.entity?.device_id && this._hass?.devices) {
      const dev = this._hass.devices[entry.entity.device_id];
      for (const l of (dev?.labels || [])) {
        const cat = LABEL_MAP[(l || '').toLowerCase()];
        if (cat) return cat;
      }
    }
    // Check area labels
    const areaId = entry.entity?.area_id || (entry.entity?.device_id && this._hass?.devices?.[entry.entity.device_id]?.area_id);
    if (areaId && this._hass?.areas) {
      const area = this._hass.areas[areaId];
      for (const l of (area?.labels || [])) {
        const cat = LABEL_MAP[(l || '').toLowerCase()];
        if (cat) return cat;
      }
    }
    return null; // No label — caller uses name heuristic
  }

  _classifyCircuit(name) {
    const n = name.toLowerCase();
    if (/ecoflow|river|delta\s*\d|jackery|bluetti|battery/i.test(n)) return 'BATTERY';
    if (/heat|hvac|air\s*handler|furnace|hotub|hot\s*tub|spa|pool|pump|compressor|minisplit|dryer|washer|dishwash|water\s*heat|fridge|refrigerat|freezer|microwave|oven|disposal|range|stove|well\s*pump|sump|garage\s*door|ev\s*charg|car\s*charg/i.test(n)) return 'DEDICATED';
    if (/server|udm|poe|\bap\b|network|router|modem|nas|rack|stack|unifi|usw|usg|udmpro|switch\s*\d|patch|ups/i.test(n)) return 'INFRASTRUCTURE';
    if (/light|lamp|sconce|chandelier|fixture|\bled\b|illuminat/i.test(n)) return 'LIGHTING';
    if (/outlet|plug|receptacle|bedroom|kitchen|garage(?!.*light)|closet|hallway|entry|bathroom|living|dining|office/i.test(n)) return 'OUTLETS';
    return 'OTHER';
  }

  _renderCircuits(circuits) {
    if (circuits.length === 0) return '';
    const active = circuits.filter(c => Number(c.state?.state) > 1)
      .map(c => {
        const name = (c.state?.attributes?.friendly_name || c.entity?.entity_id || '')
          .replace(/_power.*$/i, '').replace(/_(current|energy|voltage)[\w]*$/i, '')
          .replace(/_/g, ' ')
          .replace(/\s+(l[12])$/i, ' $1')
          .replace(/\s*(power|current\s*consumption|minute\s*average|current\s*consumption)\s*/gi, ' ')
          .replace(/\s+/g, ' ').trim()
          .toUpperCase();
        const watts = Number(c.state?.state) || 0;
        // HA Labels override → name heuristic fallback
        const category = this._getCircuitLabel(c) || this._classifyCircuit(name);
        return { name, watts, entity: c.entity, category };
      })
      .sort((a, b) => b.watts - a.watts);

    const maxWatts = active.length > 0 ? active[0].watts : 1;
    const barColor = (w) => w > 1000 ? 'var(--lcars-tomato)' : w > 500 ? 'var(--lcars-butterscotch)' : w > 200 ? 'var(--lcars-sunflower)' : 'var(--lcars-ice)';

    // Group by category
    const CATEGORY_META = {
      'DEDICATED':      { color: 'var(--lcars-butterscotch, #ff9966)' },
      'INFRASTRUCTURE': { color: 'var(--lcars-ice, #99ccff)' },
      'LIGHTING':       { color: 'var(--lcars-sunflower, #ffcc99)' },
      'OUTLETS':        { color: 'var(--lcars-bluey, #8899ff)' },
      'BATTERY':        { color: 'var(--lcars-african-violet, #cc99ff)' },
      'OTHER':          { color: 'var(--lcars-gray, #666688)' },
    };
    const groups = new Map();
    for (const c of active) {
      if (!groups.has(c.category)) groups.set(c.category, []);
      groups.get(c.category).push(c);
    }

    // Fixed category order for layout stability
    const CATEGORY_ORDER = ['DEDICATED', 'OUTLETS', 'LIGHTING', 'INFRASTRUCTURE', 'BATTERY', 'OTHER'];
    const sortedGroups = CATEGORY_ORDER
      .filter(cat => groups.has(cat))
      .map(cat => {
        const items = groups.get(cat);
        return { cat, items, total: items.reduce((s, i) => s + i.watts, 0) };
      });

    return html`
      <div class="eng-section">
        <div class="eng-section-header"><span class="eng-section-label">LOAD CIRCUITS</span><span class="eng-section-line"></span><span class="eng-circuit-count">${active.length} ACTIVE</span></div>
        <div class="eng-loads-split">
          <div class="eng-loads-grouped">
            ${sortedGroups.map(g => html`
              <div class="eng-load-group">
                <div class="eng-group-bar" style="background:${CATEGORY_META[g.cat]?.color || 'var(--lcars-gray)'}">
                  <span class="eng-group-name">${g.cat}</span>
                  <span class="eng-group-total">${formatNumber(g.total, 0)} W</span>
                </div>
                ${g.items.map(c => html`
                  <div class="eng-group-row" role="button" tabindex="0"
                       @click=${() => showMoreInfo(c.entity.entity_id)}
                       @keydown=${(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showMoreInfo(c.entity.entity_id); } }}>
                    <span class="eng-group-circuit">${c.name}</span>
                    <span class="eng-group-watts">${formatNumber(c.watts, 0)} W</span>
                  </div>`)}
              </div>`)}
          </div>
          <div class="eng-loads-bars">
            <div class="eng-bars-title">LOAD DISTRIBUTION</div>
            ${active.slice(0, 15).map(c => {
              const pct = Math.min(100, (c.watts / maxWatts) * 100);
              return html`
                <div class="eng-bar-row" role="button" tabindex="0"
                     @click=${() => showMoreInfo(c.entity.entity_id)}
                     @keydown=${(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showMoreInfo(c.entity.entity_id); } }}>
                  <span class="eng-bar-name">${c.name}</span>
                  <div class="eng-bar-track"><div class="eng-bar-fill" style="width:${pct}%; background:${barColor(c.watts)}"></div></div>
                  <span class="eng-bar-watts">${formatNumber(c.watts, 0)} W</span>
                </div>`;
            })}
          </div>
        </div>
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
          ${(f === FILTER_ALL || f === FILTER_CIRCUITS) ? this._renderVoltageOverview(data.voltageSensors) : ''}
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
      .eng-circuit-count { font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 0.875rem; color: var(--lcars-gray, #666688); white-space: nowrap; text-transform: uppercase; }

      /* ─── Voltage Overview ─── */
      .eng-voltage-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(14rem, 100%), 1fr)); gap: 0.75rem; }
      .eng-voltage-tier { display: flex; flex-direction: column; }
      .eng-voltage-tier-header {
        display: flex; justify-content: space-between; align-items: center;
        padding: 0.25rem 0.5rem; height: 1.25rem;
        font-family: var(--lcars-font, 'Antonio', sans-serif); text-transform: uppercase;
        color: var(--lcars-black, #000);
        border-radius: 0 0.75rem 0.75rem 0;
      }
      .eng-voltage-tier-name { font-size: 0.75rem; letter-spacing: 0.05em; }
      .eng-voltage-tier-count { font-size: 0.75rem; font-variant-numeric: tabular-nums; }
      .eng-voltage-home-avg {
        font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 1.75rem;
        text-align: center; padding: 0.375rem 0 0.125rem; font-variant-numeric: tabular-nums;
      }
      .eng-voltage-home-detail {
        font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 0.7rem;
        color: var(--lcars-gray, #666688); text-transform: uppercase; text-align: center;
        padding-bottom: 0.25rem; letter-spacing: 0.04em;
      }
      .eng-voltage-row {
        display: flex; justify-content: space-between; align-items: baseline;
        padding: 0.125rem 0.5rem; cursor: pointer; min-height: 1.5rem;
        font-family: var(--lcars-font, 'Antonio', sans-serif); text-transform: uppercase;
        transition: background 150ms ease;
      }
      .eng-voltage-row:hover { background: rgba(153,204,255,0.08); }
      .eng-voltage-row:focus-visible { outline: 2px solid var(--lcars-space-white); outline-offset: 1px; }
      .eng-voltage-name { font-size: 0.7rem; color: var(--lcars-ice, #99ccff); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 14rem; }
      .eng-voltage-val { font-size: 0.7rem; color: var(--lcars-space-white, #f5f6fa); font-variant-numeric: tabular-nums; white-space: nowrap; padding-left: 0.5rem; }
      .eng-voltage-high .eng-voltage-name { color: var(--lcars-tomato, #ff5555); }

      /* ─── Load Circuits: Two-Column Split ─── */
      .eng-loads-split { display: grid; grid-template-columns: 1fr 18rem; gap: 1rem; }
      @media (max-width: 960px) { .eng-loads-split { grid-template-columns: 1fr; } }

      /* Left: Grouped Categories — 2-column masonry */
      .eng-loads-grouped { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; align-content: start; }
      @media (max-width: 700px) { .eng-loads-grouped { grid-template-columns: 1fr; } }
      .eng-load-group { display: flex; flex-direction: column; }
      .eng-group-bar {
        display: flex; justify-content: space-between; align-items: center;
        padding: 0.25rem 0.5rem; height: 1.25rem;
        font-family: var(--lcars-font, 'Antonio', sans-serif); text-transform: uppercase;
        color: var(--lcars-black, #000);
        border-radius: 0 0.75rem 0.75rem 0;
      }
      .eng-group-name { font-size: 0.75rem; letter-spacing: 0.05em; }
      .eng-group-total { font-size: 0.75rem; font-variant-numeric: tabular-nums; }
      .eng-group-row {
        display: flex; justify-content: space-between; align-items: baseline;
        padding: 0.125rem 0.5rem; cursor: pointer; min-height: 1.5rem;
        font-family: var(--lcars-font, 'Antonio', sans-serif); text-transform: uppercase;
        transition: background 150ms ease;
      }
      .eng-group-row:hover { background: rgba(153,204,255,0.08); }
      .eng-group-row:focus-visible { outline: 2px solid var(--lcars-space-white); outline-offset: 1px; }
      .eng-group-circuit { font-size: 0.7rem; color: var(--lcars-ice, #99ccff); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 12rem; }
      .eng-group-watts { font-size: 0.7rem; color: var(--lcars-space-white, #f5f6fa); font-variant-numeric: tabular-nums; white-space: nowrap; padding-left: 0.5rem; }

      /* Right: Ranked Bar Chart */
      .eng-loads-bars { display: flex; flex-direction: column; gap: 0.125rem; }
      .eng-bars-title {
        font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 1rem;
        color: var(--lcars-butterscotch, #ff9966); text-transform: uppercase;
        letter-spacing: 0.05em; margin-bottom: 0.25rem;
      }
      .eng-bar-row {
        display: grid; grid-template-columns: 6rem 1fr auto; gap: 0.25rem;
        align-items: center; cursor: pointer; padding: 0.125rem 0;
        font-family: var(--lcars-font, 'Antonio', sans-serif); text-transform: uppercase;
        transition: background 150ms ease;
      }
      .eng-bar-row:hover { background: rgba(153,204,255,0.08); }
      .eng-bar-row:focus-visible { outline: 2px solid var(--lcars-space-white); outline-offset: 1px; }
      .eng-bar-name { font-size: 0.7rem; color: var(--lcars-ice, #99ccff); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .eng-bar-track { height: 0.75rem; background: transparent; }
      .eng-bar-fill { height: 100%; border-radius: 0 0.75rem 0.75rem 0; transition: width 300ms ease; }
      .eng-bar-watts { font-size: 0.625rem; color: var(--lcars-space-white, #f5f6fa); font-variant-numeric: tabular-nums; white-space: nowrap; text-align: right; min-width: 3.5rem; }

      .eng-sources-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(12rem, 100%), 1fr)); gap: 0.375rem; position: relative; padding-bottom: 1.5rem; }
      .eng-source-card { display: flex; flex-direction: column; align-items: center; gap: 0.25rem; padding: 0.75rem; cursor: pointer; border: none; border-radius: 0; background: rgba(255,153,102,0.03); font-family: var(--lcars-font, 'Antonio', sans-serif); text-transform: uppercase; transition: background 200ms ease; position: relative; }
      /* ─── 5X-ENG-1: EPS Conduits — Source → Bus (solid structural bars) ─── */
      .eng-source-card::after { content: ''; position: absolute; bottom: -1.5rem; left: 50%; transform: translateX(-50%); width: 6px; height: 1.5rem; background: var(--lcars-butterscotch, #ff9966); opacity: 0.65; border-radius: 0 0 3px 3px; animation: eng-conduit-pulse 3s ease-in-out infinite; }
      @keyframes eng-conduit-pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 0.8; } }
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
        color: var(--lcars-black, #000); position: relative; margin-bottom: 1.5rem;
      }
      /* 5X-ENG-1: Bus → Circuits trunk conduit (thinner than source conduits per thick→thin rule) */
      .eng-distribution-bar::after { content: ''; position: absolute; bottom: -1.5rem; left: 50%; transform: translateX(-50%); width: 4px; height: 1.5rem; background: var(--lcars-butterscotch, #ff9966); opacity: 0.4; border-radius: 0 0 2px 2px; animation: eng-conduit-pulse 3s ease-in-out infinite; animation-delay: 1.5s; }
      .eng-dist-label { font-size: 0.875rem; opacity: 0.9; }
      .eng-dist-value { font-size: 1.125rem; font-variant-numeric: tabular-nums; }
      .eng-status-panel { padding: 0.75rem; align-self: start; }
      .eng-status-grid { display: grid; grid-template-columns: 1fr auto; gap: 0.25rem 0.75rem; font-family: var(--lcars-font, 'Antonio', sans-serif); text-transform: uppercase; }
      .eng-status-key { font-size: 0.75rem; color: var(--lcars-gray, #666688); }
      .eng-status-val { font-size: 0.875rem; color: var(--lcars-space-white, #f5f6fa); text-align: right; font-variant-numeric: tabular-nums; }

      /* ─── 5X-ENG-1: Reduced Motion — disable ALL conduit/flow animations (WCAG 2.3.3) ─── */
      @media (prefers-reduced-motion: reduce) {
        .eng-source-card::after { animation: none; opacity: 0.6; }
        .eng-distribution-bar::after { animation: none; opacity: 0.35; }
        .eng-section-line::after { animation: none; display: none; }
        .mini-core-fill.mini-core-idle,
        .mini-core-fill.mini-core-charging { animation: none; }
      }
    `];
  }
}

const ready = Promise.race([customElements.whenDefined('hui-masonry-view'), new Promise((r) => setTimeout(r, 5000))]);
ready.then(() => { if (!customElements.get('engineering-card')) { customElements.define('engineering-card', LcarsEngineeringCard); } });
