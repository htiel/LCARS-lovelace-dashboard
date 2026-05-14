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
const FILTER_LIVE = 'live';
const FILTER_DAILY = 'daily';
const FILTER_FABRICATION = 'fabrication';

// #225 — Bambu Lab 3D printer integration; routed to Fabrication subpanel
const FABRICATION_PLATFORMS = new Set(['bambu_lab']);

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
          // #157 — totalDraw is consumer-only; negative readings (PV / V2G feed-in) are NOT
          // house draw. Generation is tracked separately via dedicated PV/grid sensors.
          // Counting negatives here under-reports load when solar offsets the panel sum.
          if (!isNaN(val) && val > 0) totalDraw += val;
          circuits.push(entry);
        }
      }
    }

    // #93 — Exclude port telemetry from devices that produced a battery card.
    // EcoFlow/UPS/Powerwall expose per-port power sensors (AC/DC/USB in/out) with
    // device_class='power' that fall into the circuit scan, double-counting battery
    // flow as discrete circuit loads (~1 kW phantom on a charging EcoFlow UPS Air).
    const batteryDeviceIds = new Set(batteries.map((b) => b.deviceId));
    if (batteryDeviceIds.size > 0) {
      for (let i = circuits.length - 1; i >= 0; i--) {
        const did = circuits[i].entity.device_id;
        if (did && batteryDeviceIds.has(did)) {
          const v = Number(circuits[i].state?.state);
          if (!isNaN(v) && v > 0) totalDraw -= v;
          circuits.splice(i, 1);
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

    // Power-strip dedup (Kasa HS300, Tapo P300, etc.):
    // Strips expose both a parent total (sensor.<strip>_power) and per-outlet children
    // (sensor.<strip>_plug_N_power). When both exist, prefer the children — finer granularity,
    // labelable per outlet, and avoids double-counting the strip total + each outlet.
    const stripChildRx = /^(sensor\..+?)_(plug|socket|outlet|child)_?\d+_(power|power_minute_average)$/i;
    const stripParents = new Map(); // base → { id, val }
    const stripChildBases = new Set();
    for (const c of circuitMap.values()) {
      const m = c.entity.entity_id.match(stripChildRx);
      if (m) stripChildBases.add(m[1]);
    }
    for (const c of circuitMap.values()) {
      const eid = c.entity.entity_id;
      // Parent candidate: matches a child base AND is itself a plain *_power(_minute_average)
      const parentRx = new RegExp(`^(sensor\\..+?)_(power|power_minute_average)$`, 'i');
      const m = eid.match(parentRx);
      if (m && stripChildBases.has(m[1])) {
        stripParents.set(eid, Number(c.state?.state) || 0);
      }
    }
    for (const [parentId, parentVal] of stripParents) {
      totalDraw -= parentVal;
      circuitMap.delete(parentId);
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
    // Patterns for multi-port battery flow detection.
    // Captain's note: batteries (UPS, EcoFlow, Bluetti, Tesla PW) often expose multiple
    // input ports (AC, Solar/PV, DC) and output ports (AC, DC, USB). We sum per device
    // to derive true charge/discharge flow, preferring a device-provided total when present.
    const TOTAL_IN_RX = /total.*(input|in_power|in_watts|charging_power|charge_power)|\b(total_in|input_total|charging_total)\b/i;
    const TOTAL_OUT_RX = /total.*(output|out_power|out_watts|discharging_power|discharge_power|load_power)|\b(total_out|output_total|load_total)\b/i;
    const PORT_IN_RX = /(^|_)(input|in|solar|pv|charge|charging|ac_in|dc_in|grid_in)(_power|_watts)?(_|$)/i;
    const PORT_OUT_RX = /(^|_)(output|out|discharge|discharging|load|ac_out|dc_out|usb|usb_out)(_power|_watts)?(_|$)/i;
    const sumPorts = (ports) => ports.reduce((a, p) => {
      const v = Number(p.state); return a + (isNaN(v) ? 0 : v);
    }, 0);

    for (const b of batteries) {
      b.siblings = {};
      const inPorts = [], outPorts = [];
      const operationalSwitches = [];
      const devEntities = byDevice.get(b.deviceId) || [];
      for (const { eid, state: s, entity: ent } of devEntities) {
        const dc = s.attributes?.device_class || '';
        const leid = eid.toLowerCase();
        // Capture operational switches (skip diagnostic/config category and disabled).
        // Pre-compute display label here (memoized) so render path doesn't run regex per frame.
        if (eid.startsWith('switch.') && !ent?.disabled_by && !ent?.hidden_by) {
          const cat = ent?.entity_category || s.attributes?.entity_category || '';
          if (cat !== 'config' && cat !== 'diagnostic') {
            const rawName = s.attributes?.friendly_name || eid.split('.').pop().replace(/_/g, ' ');
            const label = rawName
              .replace(/^.*?(USB Enabled|Grid Bypass|AC Enabled|DC \(?12V\)? Enabled|X-Boost Enabled|AC Always On|Backup Reserve Enabled)$/i, '$1')
              .toUpperCase()
              .slice(0, 40); // P3-3 length cap (Worf): defend against malicious/long friendly_name
            operationalSwitches.push({ eid, state: s, entity: ent, label });
          }
        }
        if (dc === 'voltage' && !b.siblings.voltage) b.siblings.voltage = s;
        else if (dc === 'temperature' && !/pcs/i.test(eid) && !b.siblings.temp) b.siblings.temp = s;
        else if (dc === 'power' && TOTAL_IN_RX.test(leid) && !b.siblings.totalIn) b.siblings.totalIn = s;
        else if (dc === 'power' && TOTAL_OUT_RX.test(leid) && !b.siblings.totalOut) b.siblings.totalOut = s;
        else if (dc === 'power' && PORT_IN_RX.test(leid)) inPorts.push(s);
        else if (dc === 'power' && PORT_OUT_RX.test(leid)) outPorts.push(s);
        else if (/remaining.*time|discharge.*remain|charge.*remain/i.test(eid) && !b.siblings.runtime) b.siblings.runtime = s;
        else if (/charging.*state|battery.*state/i.test(eid) && !b.siblings.chargeState) b.siblings.chargeState = s;
        else if (/state.of.health/i.test(leid) && !b.siblings.soh) b.siblings.soh = s;
        else if (/\bcycles\b/i.test(leid) && !b.siblings.cycles) b.siblings.cycles = s;
        else if (!b.siblings.storedKwh) {
          // Stored energy detection — broad: device_class=energy OR unit kWh/Wh, with capacity/remain/stored/available naming.
          const unit = (s.attributes?.unit_of_measurement || '').toLowerCase();
          const isEnergyish = dc === 'energy' || unit === 'kwh' || unit === 'wh';
          const hasCapacityName = /remain|stored|available|capacity/i.test(leid);
          // Exclude cumulative/lifetime totals and daily counters — we want instantaneous stored energy.
          const isCumulative = /(today|daily|total_increasing|lifetime|life_time|total_(in|out|consumed|delivered|generated))/i.test(leid);
          if (isEnergyish && hasCapacityName && !isCumulative) b.siblings.storedKwh = s;
        }
      }
      // Derive in/out watts: prefer device-provided total summary; otherwise sum per-port sensors.
      // Avoids double-counting: if device exposes total_in, ignore per-port sums for that side.
      b.siblings.inPorts = inPorts;
      b.siblings.outPorts = outPorts;
      b.siblings.totalInWatts = b.siblings.totalIn ? (Number(b.siblings.totalIn.state) || 0) : sumPorts(inPorts);
      b.siblings.totalOutWatts = b.siblings.totalOut ? (Number(b.siblings.totalOut.state) || 0) : sumPorts(outPorts);
      // Operational switches (e.g. EcoFlow USB Enabled, Grid Bypass) — sorted by computed label for stable, human-readable order
      b.siblings.switches = operationalSwitches.sort((a, c) => a.label.localeCompare(c.label));
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

    // Voltage sensors — global scan (not area-filtered) to catch diagnostic entities
    const seenVoltage = new Set();
    // #160 — Z-Wave/Zigbee battery devices expose a `<device>_battery_voltage` sensor
    // (1.5–4.2 V coin/Li-ion cell). These are NOT mains-feeder voltages and must not
    // appear in HIGH/LOW VOLTAGE alerts. Filter by entity_id keyword AND by sibling check.
    const _isBatteryCellVoltage = (eid, ent) => {
      if (/battery_voltage|cell_voltage|coin|aa_voltage|aaa_voltage/i.test(eid)) return true;
      // Sibling check: if any entity on the same device has device_class='battery', this
      // voltage sensor measures the battery cell and is diagnostic.
      const devId = ent?.device_id;
      if (!devId) return false;
      for (const [otherEid, otherEnt] of Object.entries(entities)) {
        if (otherEnt?.device_id !== devId) continue;
        if (otherEid === eid) continue;
        if (states[otherEid]?.attributes?.device_class === 'battery') return true;
      }
      return false;
    };
    for (const [eid, s] of Object.entries(states)) {
      if (!eid.startsWith('sensor.')) continue;
      const dc = s.attributes?.device_class || '';
      if (dc !== 'voltage') continue;
      const val = Number(s.state);
      if (isNaN(val) || val <= 0) continue;
      if (seenVoltage.has(eid)) continue;
      const entity = entities[eid] || { entity_id: eid };
      if (_isBatteryCellVoltage(eid, entity)) continue;
      seenVoltage.add(eid);
      voltageSensors.push({ entity, domain: 'sensor', state: s });
    }

    // Daily energy sensors — global scan for today/daily energy totals + per-circuit list
    let totalDailyEnergy = 0;
    let hasDailyEnergy = false;
    const dailyCircuits = [];
    for (const [eid, s] of Object.entries(states)) {
      if (!eid.startsWith('sensor.')) continue;
      const dc = s.attributes?.device_class || '';
      if (dc !== 'energy') continue;
      if (!/daily|today/i.test(eid)) continue;
      if (AGGREGATE_KEYWORDS.test(eid) || GRID_KEYWORDS.test(eid)) continue;
      const val = Number(s.state);
      if (!isNaN(val) && val > 0) {
        totalDailyEnergy += val;
        hasDailyEnergy = true;
        const entity = entities[eid] || { entity_id: eid };
        dailyCircuits.push({ entity, domain: 'sensor', state: s });
      }
    }
    dailyCircuits.sort((a, b) => (Number(b.state?.state) || 0) - (Number(a.state?.state) || 0));

    // 5X-ENG-7: Sort grid candidates by confidence score (highest first)
    gridSensors.sort((a, b) => _scoreGridCandidate(b) - _scoreGridCandidate(a));

    return { batteries, circuits: dedupedCircuits, dailyCircuits, gridSensors, upsSensors, voltageSensors, totalDraw, totalDailyEnergy, hasDailyEnergy, gridSiblings, fabrication: this._discoverFabrication(states, entities) };
  }

  /* ─── Fabrication discovery (#225) ─── */
  _discoverFabrication(states, entities) {
    const printers = new Map(); // deviceId → group
    for (const [eid, ent] of Object.entries(entities)) {
      if (!FABRICATION_PLATFORMS.has(ent?.platform)) continue;
      const devId = ent.device_id;
      if (!devId) continue;
      const dev = this._hass?.devices?.[devId] || null;
      // Identify the printer device (vs siblings like AMS, ExternalSpool, HotendRack).
      // Printer-domain entities (print_status, print_progress, etc.) anchor the group.
      const slug = this._fabPrinterSlug(eid);
      if (!slug) continue;
      if (!printers.has(slug)) {
        printers.set(slug, { slug, devices: new Map(), states: {} });
      }
      const group = printers.get(slug);
      if (dev) group.devices.set(devId, dev);
      if (states[eid]) group.states[eid] = states[eid];
    }
    // Resolve display name: prefer the *primary* device (no `_AMS_`, `_ExternalSpool`, `_HotendRack` suffix)
    const out = [];
    for (const g of printers.values()) {
      let primaryDev = null;
      for (const d of g.devices.values()) {
        if (!/_(AMS_|ExternalSpool|HotendRack)/i.test(d.name || '')) { primaryDev = d; break; }
      }
      const displayName = (primaryDev?.name_by_user || primaryDev?.name || g.slug.toUpperCase());
      out.push({ slug: g.slug, name: displayName, states: g.states });
    }
    return { printers: out };
  }

  /** Extract printer slug from a bambu_lab entity_id (e.g. sensor.h2c_31b8ap612800082_print_status → 'h2c_31b8ap612800082') */
  _fabPrinterSlug(eid) {
    const m = eid.match(/^[a-z_]+\.([a-z0-9]+_[a-z0-9]+)_/i);
    return m ? m[1].toLowerCase() : null;
  }

  _getGridPower(data) {
    if (data.gridSensors.length === 0) return data.totalDraw;
    // #88 — Split-phase mains: when an Emporia Vue (or similar whole-home monitor)
    // exposes per-leg sensors (mainload1 + mainload2, _l1_/_l2_, leg1/leg2) on a single
    // device, picking only the first leg under-reports grid draw (e.g. shows 0W while
    // house draws 2550W if leg 2 happens to be idle). Sum legs from the same device.
    if (data.gridSensors.length > 1) {
      const deviceIds = new Set(data.gridSensors.map((s) => s.entity.device_id).filter(Boolean));
      const splitPhaseRx = /(_|\b)(l\d+|leg\d+|mainload\d+|load\d+|phase\d+)(_|\b)/i;
      const allSplitPhase = data.gridSensors.every((s) => splitPhaseRx.test(s.entity.entity_id));
      if (deviceIds.size === 1 && allSplitPhase) {
        let sum = 0, anyValid = false;
        for (const s of data.gridSensors) {
          const v = Number(s.state?.state);
          if (!isNaN(v)) { sum += v; anyValid = true; }
        }
        if (anyValid) return sum;
      }
    }
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
      if (b.siblings?.storedKwh) {
        const raw = Number(b.siblings.storedKwh.state);
        if (!isNaN(raw)) {
          const unit = (b.siblings.storedKwh.attributes?.unit_of_measurement || '').toLowerCase();
          const kwh = unit === 'wh' ? raw / 1000 : raw;
          totalStoredKwh += kwh;
          hasStoredKwh = true;
        }
      }
    }
    if (batteryCount > 0) avgSoc = Math.round(avgSoc / batteryCount);

    // Voltage tiers from discovered sensors
    const high = [], low = [];
    let normalSum = 0, normalCount = 0;
    for (const s of (data.voltageSensors || [])) {
      const v = Number(s.state?.state);
      if (isNaN(v) || v <= 0) continue;
      const name = (s.state?.attributes?.friendly_name || s.entity?.entity_id || '')
        .replace(/_/g, ' ').replace(/\s*(voltage|volt)\s*/gi, ' ').replace(/\s+/g, ' ').trim().toUpperCase();
      if (v > 130) high.push({ name, voltage: v, entity: s.entity });
      else if (v >= 110) { normalSum += v; normalCount++; }
      else low.push({ name, voltage: v, entity: s.entity });
    }
    const homeVoltage = normalCount > 0 ? normalSum / normalCount : null;

    return html`
      <div class="eng-status-panel">
        <div class="eng-section-header"><span class="eng-section-label">SYSTEM STATUS</span></div>
        <div class="eng-status-grid">
          <span class="eng-status-key">LIVE DRAW</span><span class="eng-status-val">${formatNumber(data.totalDraw, 0)} W</span>
          <span class="eng-status-key">GRID</span><span class="eng-status-val">${formatNumber(gridPower, 0)} W</span>
          ${data.hasDailyEnergy ? html`
            <span class="eng-status-key">DAILY USAGE</span><span class="eng-status-val">${formatNumber(data.totalDailyEnergy, 1)} KWH</span>
          ` : ''}
          ${batteryCount > 0 ? html`
            <span class="eng-status-key">BATTERIES</span><span class="eng-status-val">${batteryCount} UNITS</span>
            <span class="eng-status-key">AVG SOC</span><span class="eng-status-val">${avgSoc}%</span>
            ${hasStoredKwh ? html`<span class="eng-status-key">STORED</span><span class="eng-status-val" style="color:var(--lcars-ice)">${formatNumber(totalStoredKwh, 2)} KWH</span>` : ''}
          ` : ''}
          <span class="eng-status-key">CIRCUITS</span><span class="eng-status-val">${data.circuits.length}</span>
          <span class="eng-status-key">HEALTH</span><span class="eng-status-val" style="color:var(--lcars-ice)">NOMINAL</span>
        </div>
        ${homeVoltage != null || high.length > 0 || low.length > 0 ? html`
          <div class="eng-voltage-sidebar">
            ${homeVoltage != null ? html`
              <span class="eng-status-key">HOME VOLTAGE</span>
              <span class="eng-status-val">${formatNumber(homeVoltage, 1)} V</span>
            ` : ''}
            ${high.length > 0 ? html`
              <span class="eng-volt-label" style="color:var(--lcars-tomato)">HIGH VOLTAGE</span>
              ${high.map(h => html`
                <div class="eng-volt-row" role="button" tabindex="0"
                     @click=${() => showMoreInfo(h.entity.entity_id)}
                     @keydown=${(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showMoreInfo(h.entity.entity_id); } }}>
                  <span class="eng-volt-name">${h.name}</span>
                  <span class="eng-volt-val" style="color:var(--lcars-tomato)">${formatNumber(h.voltage, 1)} V</span>
                </div>`)}
            ` : html`
              <span class="eng-volt-label" style="color:var(--lcars-gray)">HIGH VOLTAGE</span>
              <span class="eng-volt-clear">CLEAR</span>
            `}
            ${low.length > 0 ? html`
              <span class="eng-volt-label" style="color:var(--lcars-sunflower)">LOW VOLTAGE</span>
              ${low.map(l => html`
                <div class="eng-volt-row" role="button" tabindex="0"
                     @click=${() => showMoreInfo(l.entity.entity_id)}
                     @keydown=${(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showMoreInfo(l.entity.entity_id); } }}>
                  <span class="eng-volt-name">${l.name}</span>
                  <span class="eng-volt-val" style="color:var(--lcars-sunflower)">${formatNumber(l.voltage, 1)} V</span>
                </div>`)}
            ` : html`
              <span class="eng-volt-label" style="color:var(--lcars-gray)">LOW VOLTAGE</span>
              <span class="eng-volt-clear">CLEAR</span>
            `}
          </div>
        ` : ''}
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
            // Power flow — totals are pre-computed in _parse() (device total preferred, else sum of ports)
            const totalIn = b.siblings?.totalInWatts || 0;
            const totalOut = b.siblings?.totalOutWatts || 0;
            const isCharging = totalIn > totalOut + 5;
            const isDischarging = totalOut > totalIn + 5;
            // PASS-THRU: UPS online — grid feeding load through battery, balanced flow.
            // Triggered when both ports are doing work (>0 W) but net flow is within deadband.
            // BigBoy-DPU truly idle reads 0/0 → falls through to IDLE; an EcoFlow / NUT UPS
            // online reads e.g. 200W/200W → PASS-THRU. (Captain's call, beta.38 hotfix)
            const isPassthrough = !isCharging && !isDischarging && totalIn > 0 && totalOut > 0;
            const flowLabel = isCharging ? `▲ CHARGING ${formatNumber(totalIn, 0)}W`
                            : isDischarging ? `▼ DISCHARGING ${formatNumber(totalOut, 0)}W`
                            : isPassthrough ? `═ PASS-THRU ${formatNumber(totalOut, 0)}W`
                            : '━ IDLE';
            const flowColor = isCharging ? 'var(--lcars-ice)'
                            : isDischarging ? 'var(--lcars-butterscotch)'
                            : isPassthrough ? 'var(--lcars-sunflower)'
                            : 'var(--lcars-gray)';
            const flowBg = isCharging ? 'rgba(153,204,255,0.15)'
                          : isDischarging ? 'rgba(255,153,102,0.15)'
                          : isPassthrough ? 'rgba(255,204,153,0.15)'
                          : 'rgba(102,102,136,0.15)';
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
                    <span class="eng-battery-flow" style="color:${flowColor}">${isCharging ? '▲' : isDischarging ? '▼' : isPassthrough ? '═' : '━'} ${isCharging ? formatNumber(totalIn, 0) : isDischarging ? formatNumber(totalOut, 0) : isPassthrough ? formatNumber(totalOut, 0) : '0'}W</span>
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
                ${b.siblings?.switches?.length ? html`
                  <div class="eng-battery-switches" role="group" aria-label="${name} controls">
                    ${b.siblings.switches.map(sw => {
                      const isOn = sw.state?.state === 'on';
                      const label = sw.label;
                      const pillColor = isOn ? 'var(--lcars-ice)' : 'var(--lcars-gray)';
                      const pillBg = isOn ? 'rgba(153,204,255,0.15)' : 'rgba(102,102,136,0.10)';
                      return html`
                        <span class="eng-switch-pill"
                              role="button" tabindex="0"
                              aria-label="${label}: ${isOn ? 'on' : 'off'}, click to toggle"
                              style="color:${pillColor}; background:${pillBg}; border-color:${pillColor}"
                              @click=${(e) => { e.stopPropagation(); showMoreInfo(sw.eid); }}
                              @keydown=${(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); showMoreInfo(sw.eid); } }}>
                          <span class="eng-switch-dot" aria-hidden="true">${isOn ? '●' : '○'}</span>
                          <span class="eng-switch-name">${label}</span>
                        </span>`;
                    })}
                  </div>` : ''}
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
    // #161 — Span/Lumin panel circuits (LS-P<n>-<load>) are dedicated breakers; route to DEDICATED.
    if (/^ls-p\d+\b|\bls\s*p\d+\b/i.test(n)) return 'DEDICATED';
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

  _renderDailyCircuits(dailyCircuits) {
    if (dailyCircuits.length === 0) return html`<div class="eng-loading">NO DAILY ENERGY SENSORS DETECTED</div>`;
    const items = dailyCircuits.map(c => {
      const name = (c.state?.attributes?.friendly_name || c.entity?.entity_id || '')
        .replace(/_daily.*$/i, '').replace(/_today.*$/i, '').replace(/_energy.*$/i, '')
        .replace(/_/g, ' ')
        .replace(/\s*(daily|today|energy|consumption)\s*/gi, ' ')
        .replace(/\s+/g, ' ').trim().toUpperCase();
      const kwh = Number(c.state?.state) || 0;
      const category = this._getCircuitLabel(c) || this._classifyCircuit(name);
      return { name, kwh, entity: c.entity, category };
    }).sort((a, b) => b.kwh - a.kwh);

    const maxKwh = items.length > 0 ? items[0].kwh : 1;
    const barColor = (k) => k > 10 ? 'var(--lcars-tomato)' : k > 5 ? 'var(--lcars-butterscotch)' : k > 1 ? 'var(--lcars-sunflower)' : 'var(--lcars-ice)';
    const totalKwh = items.reduce((s, i) => s + i.kwh, 0);

    const CATEGORY_META = {
      'DEDICATED':      { color: 'var(--lcars-butterscotch, #ff9966)' },
      'INFRASTRUCTURE': { color: 'var(--lcars-ice, #99ccff)' },
      'LIGHTING':       { color: 'var(--lcars-sunflower, #ffcc99)' },
      'OUTLETS':        { color: 'var(--lcars-bluey, #8899ff)' },
      'BATTERY':        { color: 'var(--lcars-african-violet, #cc99ff)' },
      'OTHER':          { color: 'var(--lcars-gray, #666688)' },
    };
    const groups = new Map();
    for (const c of items) {
      if (!groups.has(c.category)) groups.set(c.category, []);
      groups.get(c.category).push(c);
    }
    const CATEGORY_ORDER = ['DEDICATED', 'OUTLETS', 'LIGHTING', 'INFRASTRUCTURE', 'BATTERY', 'OTHER'];
    const sortedGroups = CATEGORY_ORDER
      .filter(cat => groups.has(cat))
      .map(cat => {
        const catItems = groups.get(cat);
        return { cat, items: catItems, total: catItems.reduce((s, i) => s + i.kwh, 0) };
      });

    return html`
      <div class="eng-section">
        <div class="eng-section-header"><span class="eng-section-label">DAILY ENERGY USAGE</span><span class="eng-section-line"></span><span class="eng-circuit-count">${formatNumber(totalKwh, 1)} KWH TODAY</span></div>
        <div class="eng-loads-split">
          <div class="eng-loads-grouped">
            ${sortedGroups.map(g => html`
              <div class="eng-load-group">
                <div class="eng-group-bar" style="background:${CATEGORY_META[g.cat]?.color || 'var(--lcars-gray)'}">
                  <span class="eng-group-name">${g.cat}</span>
                  <span class="eng-group-total">${formatNumber(g.total, 2)} KWH</span>
                </div>
                ${g.items.map(c => html`
                  <div class="eng-group-row" role="button" tabindex="0"
                       @click=${() => showMoreInfo(c.entity.entity_id)}
                       @keydown=${(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showMoreInfo(c.entity.entity_id); } }}>
                    <span class="eng-group-circuit">${c.name}</span>
                    <span class="eng-group-watts">${formatNumber(c.kwh, 2)} KWH</span>
                  </div>`)}
              </div>`)}
          </div>
          <div class="eng-loads-bars">
            <div class="eng-bars-title">DAILY DISTRIBUTION</div>
            ${items.slice(0, 15).map(c => {
              const pct = Math.min(100, (c.kwh / maxKwh) * 100);
              return html`
                <div class="eng-bar-row" role="button" tabindex="0"
                     @click=${() => showMoreInfo(c.entity.entity_id)}
                     @keydown=${(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showMoreInfo(c.entity.entity_id); } }}>
                  <span class="eng-bar-name">${c.name}</span>
                  <div class="eng-bar-track"><div class="eng-bar-fill" style="width:${pct}%; background:${barColor(c.kwh)}"></div></div>
                  <span class="eng-bar-watts">${formatNumber(c.kwh, 2)} KWH</span>
                </div>`;
            })}
          </div>
        </div>
      </div>`;
  }

  /* ─── Fabrication renderer (#225) ─── */
  _renderFabrication(fab) {
    const cameras = this._discoverFabricationCameras();
    if ((!fab || fab.printers.length === 0) && cameras.length === 0) {
      return html`<div class="eng-loading">NO FABRICATION DEVICES DETECTED</div>`;
    }
    const printers = fab?.printers || [];
    return html`
      <div class="eng-section">
        <div class="eng-section-header">
          <span class="eng-section-label">FABRICATION</span>
          <span class="eng-section-line"></span>
          <span class="eng-circuit-count">${printers.length} UNIT${printers.length === 1 ? '' : 'S'}${cameras.length > 0 ? ` · ${cameras.length} CAM` : ''}</span>
        </div>
        ${printers.length > 0 ? html`
          <div class="eng-fab-grid">
            ${printers.map(p => this._renderFabPrinter(p))}
          </div>` : ''}
        ${cameras.length > 0 ? this._renderFabCameras(cameras) : ''}
      </div>`;
  }

  /** Discover cameras tagged with the `fabrication` (or `fab`) HA label.
   *  Checks entity, device, and area labels (same precedence as circuit labels). */
  _discoverFabricationCameras() {
    const FAB_LABELS = new Set(['fabrication', 'fab', 'printer', 'printers', '3d_printer', '3dprinter']);
    const entities = this._hass?.entities || {};
    const states = this._hass?.states || {};
    const out = [];
    for (const [eid, ent] of Object.entries(entities)) {
      if (!eid.startsWith('camera.')) continue;
      if (!this._entityHasLabel(ent, FAB_LABELS)) continue;
      const state = states[eid];
      if (!state) continue;
      const friendly = state.attributes?.friendly_name
        || this._hass?.devices?.[ent.device_id]?.name_by_user
        || this._hass?.devices?.[ent.device_id]?.name
        || eid.replace('camera.', '').replace(/_/g, ' ');
      out.push({ eid, state, name: friendly.toUpperCase() });
    }
    return out.sort((a, b) => a.name.localeCompare(b.name));
  }

  /** Generic label check across entity → device → area. */
  _entityHasLabel(ent, labelSet) {
    const check = (labels) => {
      for (const l of labels || []) {
        if (labelSet.has((l || '').toLowerCase())) return true;
      }
      return false;
    };
    if (check(ent?.labels)) return true;
    const dev = ent?.device_id ? this._hass?.devices?.[ent.device_id] : null;
    if (check(dev?.labels)) return true;
    const areaId = ent?.area_id || dev?.area_id;
    if (areaId) {
      const area = this._hass?.areas?.[areaId];
      if (check(area?.labels)) return true;
    }
    return false;
  }

  _renderFabCameras(cameras) {
    return html`
      <div class="eng-fab-cameras">
        <div class="eng-fab-cameras-label">WATCH</div>
        <div class="eng-fab-cameras-grid">
          ${cameras.map(c => {
            const pic = c.state?.attributes?.entity_picture;
            return html`
              <div class="eng-fab-cam-tile" role="button" tabindex="0"
                   @click=${() => showMoreInfo(c.eid)}
                   @keydown=${(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showMoreInfo(c.eid); } }}
                   aria-label="Open ${c.name} camera">
                ${pic
                  ? html`<img src="${pic}" alt="${c.name}" loading="lazy" />`
                  : html`<div class="eng-fab-cam-placeholder">NO SIGNAL</div>`}
                <span class="eng-fab-cam-name">${c.name}</span>
              </div>`;
          })}
        </div>
      </div>`;
  }

  _fabFind(states, slug, suffixRx) {
    for (const [eid, s] of Object.entries(states)) {
      if (!eid.includes(slug)) continue;
      if (suffixRx.test(eid)) return { eid, state: s };
    }
    return null;
  }
  _fabFindAll(states, slug, suffixRx) {
    const out = [];
    for (const [eid, s] of Object.entries(states)) {
      if (!eid.includes(slug)) continue;
      if (suffixRx.test(eid)) out.push({ eid, state: s });
    }
    return out.sort((a, b) => a.eid.localeCompare(b.eid));
  }

  _fabTempTile(label, current, target) {
    const cv = current ? Number(current.state?.state) : NaN;
    const tv = target ? Number(target.state?.state) : NaN;
    const unit = current?.state?.attributes?.unit_of_measurement || '°C';
    const heating = !isNaN(cv) && !isNaN(tv) && tv > 0 && Math.abs(cv - tv) > 2;
    const color = heating ? 'var(--lcars-tomato)' : (!isNaN(tv) && tv > 0 ? 'var(--lcars-butterscotch)' : 'var(--lcars-gray)');
    return html`
      <div class="eng-fab-tile" role="button" tabindex="0"
           @click=${() => current && showMoreInfo(current.eid)}
           @keydown=${(e) => { if ((e.key === 'Enter' || e.key === ' ') && current) { e.preventDefault(); showMoreInfo(current.eid); } }}>
        <div class="eng-fab-tile-label">${label}</div>
        <div class="eng-fab-tile-value" style="color:${color}">
          ${isNaN(cv) ? '—' : Math.round(cv)}<span class="eng-fab-tile-unit">${unit}</span>
        </div>
        ${!isNaN(tv) && tv > 0 ? html`<div class="eng-fab-tile-target">→ ${Math.round(tv)}${unit}</div>` : ''}
      </div>`;
  }

  _renderFabPrinter(p) {
    const s = p.states;
    const slug = p.slug;
    // Discover key sensors via suffix matching
    const status = this._fabFind(s, slug, /_print_status$/);
    const stage = this._fabFind(s, slug, /_current_stage$/);
    const progress = this._fabFind(s, slug, /_print_progress$/);
    const remaining = this._fabFind(s, slug, /_remaining_time$/);
    const startTime = this._fabFind(s, slug, /_start_time$/);
    const endTime = this._fabFind(s, slug, /_end_time$/);
    const currentLayer = this._fabFind(s, slug, /_current_layer$/);
    const totalLayers = this._fabFind(s, slug, /_total_layer_count$/);
    const bed = this._fabFind(s, slug, /_bed_temperature$/);
    const bedTarget = this._fabFind(s, slug, /_target_bed_temperature$/);
    const leftNozzle = this._fabFind(s, slug, /_left_nozzle_temperature$/);
    const leftTarget = this._fabFind(s, slug, /_target_left_nozzle_temperature$/);
    const rightNozzle = this._fabFind(s, slug, /_right_nozzle_temperature$/);
    const rightTarget = this._fabFind(s, slug, /_target_right_nozzle_temperature$/);
    const chamber = this._fabFind(s, slug, /_chamber_temperature$/);
    const printType = this._fabFind(s, slug, /_print_type$/);
    const speedProfile = this._fabFind(s, slug, /_print_speed_profile$/);
    const taskName = this._fabFind(s, slug, /_task_name$/);
    const chamberLight = this._fabFind(s, slug, /^light\..*_chamber_light$/);
    const heatbedLight = this._fabFind(s, slug, /^light\..*_heatbed_light$/);
    const printError = this._fabFind(s, slug, /_print_error$/);
    const hmsErrors = this._fabFind(s, slug, /_hms_errors$/);
    const chamberImg = this._fabFind(s, slug, /^image\..*_(cover_image|chamber_image|camera)$/);
    const amsHumidity = this._fabFindAll(s, slug, /_ams_humidity$/);
    const amsTrays = this._fabFindAll(s, slug, /_ams_tray_\d+$/);

    // Error border
    const errVal = (printError?.state?.state || '').toLowerCase();
    const hmsVal = Number(hmsErrors?.state?.state) || 0;
    const hasError = (errVal && errVal !== 'no_error' && errVal !== 'none' && errVal !== 'unknown' && errVal !== '0') || hmsVal > 0;
    const statusVal = (status?.state?.state || 'idle').toUpperCase();
    const isPrinting = /running|printing/i.test(statusVal);
    const borderColor = hasError ? 'var(--lcars-tomato)' : (isPrinting ? 'var(--lcars-gold)' : 'var(--lcars-gray)');

    const progressVal = Number(progress?.state?.state);
    const progressPct = !isNaN(progressVal) ? Math.max(0, Math.min(100, progressVal)) : 0;

    // Build chamber camera URL via HA auth (entity_picture attribute)
    let camSrc = null;
    if (chamberImg?.state?.attributes?.entity_picture) {
      camSrc = chamberImg.state.attributes.entity_picture;
    }

    const renderTrayChip = (t) => {
      const attr = t.state?.attributes || {};
      const filament = attr.type || attr.name || 'EMPTY';
      const color = attr.color || attr.tray_color || '#444';
      const idx = (t.eid.match(/_tray_(\d+)$/) || [])[1] || '?';
      return html`
        <span class="eng-fab-tray" title="${filament}"
              @click=${() => showMoreInfo(t.eid)}
              role="button" tabindex="0">
          <span class="eng-fab-tray-swatch" style="background:${color.startsWith('#') ? color : '#' + color}"></span>
          <span class="eng-fab-tray-label">T${idx} · ${filament}</span>
        </span>`;
    };

    const toggleLight = (lightEntry) => {
      if (!lightEntry) return;
      const on = lightEntry.state?.state === 'on';
      this._hass.callService('light', on ? 'turn_off' : 'turn_on', { entity_id: lightEntry.eid });
    };

    return html`
      <div class="eng-fab-printer" style="border-left-color:${borderColor}">
        <div class="eng-fab-head">
          <span class="eng-fab-name">${p.name}</span>
          <span class="eng-fab-status" style="background:${borderColor};color:var(--lcars-black,#000)">${statusVal}</span>
          ${stage?.state?.state && stage.state.state !== 'idle' ? html`<span class="eng-fab-stage">${stage.state.state.toUpperCase()}</span>` : ''}
          ${hasError ? html`<span class="eng-fab-error" title="${errVal || hmsVal + ' HMS'}">! ERROR</span>` : ''}
        </div>

        ${isPrinting || progressPct > 0 ? html`
          <div class="eng-fab-progress-row">
            <div class="eng-fab-progress-track">
              <div class="eng-fab-progress-fill" style="width:${progressPct}%; background:${borderColor}"></div>
              <span class="eng-fab-progress-text">${progressPct.toFixed(0)}%</span>
            </div>
            <div class="eng-fab-progress-meta">
              ${currentLayer?.state?.state && totalLayers?.state?.state ? html`<span>L ${currentLayer.state.state}/${totalLayers.state.state}</span>` : ''}
              ${remaining?.state?.state && remaining.state.state !== '0' ? html`<span>ETA ${remaining.state.state}m</span>` : ''}
              ${taskName?.state?.state && taskName.state.state !== 'unknown' ? html`<span class="eng-fab-task" title="${taskName.state.state}">${taskName.state.state}</span>` : ''}
            </div>
          </div>` : ''}

        <div class="eng-fab-body">
          <div class="eng-fab-temps">
            ${this._fabTempTile('BED', bed, bedTarget)}
            ${leftNozzle ? this._fabTempTile('L NOZ', leftNozzle, leftTarget) : ''}
            ${rightNozzle ? this._fabTempTile('R NOZ', rightNozzle, rightTarget) : ''}
            ${chamber ? this._fabTempTile('CHAMBER', chamber, null) : ''}
          </div>

          ${camSrc ? html`
            <div class="eng-fab-cam">
              <img src="${camSrc}" alt="Chamber camera for ${p.name}" loading="lazy" />
            </div>` : ''}
        </div>

        ${amsTrays.length > 0 ? html`
          <div class="eng-fab-ams">
            <span class="eng-fab-ams-label">AMS${amsHumidity.length > 0 && amsHumidity[0].state?.state !== 'unknown' ? ` · ${amsHumidity[0].state.state}%RH` : ''}</span>
            ${amsTrays.map(renderTrayChip)}
          </div>` : ''}

        <div class="eng-fab-foot">
          ${printType?.state?.state && printType.state.state !== 'unknown' ? html`<span class="eng-fab-meta">${printType.state.state.toUpperCase()}</span>` : ''}
          ${speedProfile?.state?.state ? html`<span class="eng-fab-meta">SPD ${speedProfile.state.state.toUpperCase()}</span>` : ''}
          ${chamberLight ? html`
            <button class="eng-fab-light ${chamberLight.state?.state === 'on' ? 'on' : ''}"
                    @click=${() => toggleLight(chamberLight)}
                    aria-pressed="${chamberLight.state?.state === 'on' ? 'true' : 'false'}">CHAMBER LIGHT</button>` : ''}
          ${heatbedLight ? html`
            <button class="eng-fab-light ${heatbedLight.state?.state === 'on' ? 'on' : ''}"
                    @click=${() => toggleLight(heatbedLight)}
                    aria-pressed="${heatbedLight.state?.state === 'on' ? 'true' : 'false'}">BED LIGHT</button>` : ''}
        </div>
      </div>`;
  }

  render() {
    if (!this._hass) return html`<div class="eng-loading">INITIALIZING ENGINEERING SYSTEMS...</div>`;
    const data = this._discoverAll();
    const f = this.filter;
    if (f === FILTER_FABRICATION) {
      return html`
        <div class="eng-dashboard">
          <div class="eng-main-content">
            ${this._renderFabrication(data.fabrication)}
          </div>
          ${this._renderSystemStatus(data)}
        </div>`;
    }
    return html`
      <div class="eng-dashboard">
        <div class="eng-main-content">
          ${f !== FILTER_DAILY ? this._renderSources(data) : ''}
          ${f !== FILTER_DAILY ? this._renderDistribution(data.totalDraw) : ''}
          ${(f === FILTER_ALL || f === FILTER_LIVE) ? this._renderCircuits(data.circuits) : ''}
          ${f === FILTER_DAILY ? this._renderDailyCircuits(data.dailyCircuits) : ''}
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

      /* ─── Voltage Sidebar (compact, inside System Status) ─── */
      .eng-voltage-sidebar {
        display: flex; flex-direction: column; gap: 0.125rem;
        border-top: 1px solid rgba(255,153,102,0.15); margin-top: 0.5rem; padding-top: 0.5rem;
        font-family: var(--lcars-font, 'Antonio', sans-serif); text-transform: uppercase;
      }
      .eng-volt-label { font-size: 0.7rem; letter-spacing: 0.05em; margin-top: 0.25rem; }
      .eng-volt-clear { font-size: 0.7rem; color: var(--lcars-ice, #99ccff); padding-left: 0.25rem; }
      .eng-volt-row {
        display: flex; justify-content: space-between; align-items: baseline;
        padding: 0.0625rem 0.25rem; cursor: pointer; transition: background 150ms ease;
      }
      .eng-volt-row:hover { background: rgba(153,204,255,0.08); }
      .eng-volt-row:focus-visible { outline: 2px solid var(--lcars-space-white); outline-offset: 1px; }
      .eng-volt-name { font-size: 0.625rem; color: var(--lcars-ice, #99ccff); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 8rem; }
      .eng-volt-val { font-size: 0.625rem; font-variant-numeric: tabular-nums; white-space: nowrap; }

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
      /* #162 \u2014 min-width keeps small loads visible (was rendering as <1px slivers when one
       * high-draw circuit dominated maxWatts). 4px is below the smallest meaningful tick on
       * any viewport \u2014 still legible as a presence indicator. */
      .eng-bar-fill { height: 100%; min-width: 4px; border-radius: 0 0.75rem 0.75rem 0; transition: width 300ms ease; }
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
      /* #163 — Flat charging indicator (LCARS flatness rule).
       * Was: repeating-linear-gradient barber-pole. Now: solid fill with pulsing brightness.
       * Same charging affordance without violating the no-gradient rule. */
      .mini-core-fill.mini-core-charging { animation: mini-core-charge-pulse 1.5s ease-in-out infinite; }
      .mini-core-tick { position: absolute; left: 15%; right: 15%; height: 1px; background: var(--core-color); opacity: 0.3; }
      @keyframes mini-core-pulse { 0%,100% { opacity: 0.6; } 50% { opacity: 0.9; } }
      @keyframes mini-core-charge-pulse { 0%,100% { opacity: 0.7; filter: brightness(1); } 50% { opacity: 1; filter: brightness(1.25); } }
      @keyframes mini-core-flow { from { background-position: 0 0; } to { background-position: 0 -1.125rem; } }
      .eng-battery-stats { display: flex; flex-direction: column; justify-content: center; gap: 0.125rem; }
      .eng-battery-soc { font-size: 1.5rem; font-weight: bold; line-height: 1; font-variant-numeric: tabular-nums; }
      .eng-battery-flow { font-size: 0.75rem; font-variant-numeric: tabular-nums; }
      .eng-battery-volt { font-size: 0.7rem; color: var(--lcars-ice, #99ccff); font-variant-numeric: tabular-nums; }
      .eng-battery-detail { font-size: 0.625rem; color: var(--lcars-gray, #666688); text-align: right; margin-top: auto; letter-spacing: 0.05em; cursor: pointer; }
      .eng-battery-detail:hover { color: var(--lcars-ice, #99ccff); }
      /* Operational switch pills (e.g. EcoFlow USB Enabled, Grid Bypass) */
      .eng-battery-switches {
        display: flex; flex-wrap: wrap; gap: 0.25rem; margin-top: 0.375rem;
        padding-top: 0.375rem; border-top: 1px solid rgba(136,153,255,0.08);
      }
      .eng-switch-pill {
        display: inline-flex; align-items: center; gap: 0.25rem;
        padding: 0.125rem 0.375rem; border-radius: 0.625rem;
        border: 1px solid; font-family: var(--lcars-font, 'Antonio', sans-serif);
        font-size: 0.625rem; letter-spacing: 0.05em; cursor: pointer;
        transition: filter 150ms ease, transform 100ms ease;
      }
      .eng-switch-pill:hover { filter: brightness(1.2); }
      .eng-switch-pill:focus-visible { outline: 2px solid var(--lcars-ice, #99ccff); outline-offset: 2px; }
      .eng-switch-pill:active { transform: scale(0.97); }
      .eng-switch-dot { font-size: 0.75rem; line-height: 1; }
      .eng-switch-name { white-space: nowrap; }
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

      /* ─── Fabrication subpanel (#225) ─── */
      .eng-fab-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr)); gap: 0.75rem; }
      .eng-fab-printer {
        display: flex; flex-direction: column; gap: 0.5rem;
        padding: 0.625rem 0.75rem;
        border-left: 3px solid var(--lcars-gray);
        border-radius: 0 var(--lcars-btn-radius, 1.5rem) var(--lcars-btn-radius, 1.5rem) 0;
        background: rgba(255,255,255,0.03);
      }
      .eng-fab-head { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
      .eng-fab-name { font-family: var(--lcars-font); font-size: 1rem; color: var(--lcars-space-white); text-transform: uppercase; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .eng-fab-status {
        font-family: var(--lcars-font); font-size: 0.7rem;
        padding: 0.1rem 0.5rem; border-radius: 0.75rem;
        letter-spacing: 0.08em;
      }
      .eng-fab-stage { font-family: var(--lcars-font); font-size: 0.7rem; color: var(--lcars-gray); text-transform: uppercase; }
      .eng-fab-error {
        font-family: var(--lcars-font); font-size: 0.7rem;
        padding: 0.1rem 0.5rem; border-radius: 0.75rem;
        background: var(--lcars-tomato, #ff5555); color: var(--lcars-black, #000);
        letter-spacing: 0.08em;
      }
      .eng-fab-progress-row { display: flex; flex-direction: column; gap: 0.25rem; }
      .eng-fab-progress-track {
        position: relative; height: 1.1rem;
        background: rgba(255,255,255,0.08); border-radius: 0.5rem; overflow: hidden;
      }
      .eng-fab-progress-fill { position: absolute; left: 0; top: 0; bottom: 0; transition: width 500ms ease; }
      .eng-fab-progress-text {
        position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
        font-family: var(--lcars-font); font-size: 0.7rem; color: var(--lcars-space-white);
        font-variant-numeric: tabular-nums;
      }
      .eng-fab-progress-meta {
        display: flex; flex-wrap: wrap; gap: 0.75rem;
        font-family: var(--lcars-font); font-size: 0.7rem; color: var(--lcars-gray);
        text-transform: uppercase; font-variant-numeric: tabular-nums;
      }
      .eng-fab-task { color: var(--lcars-ice); max-width: 18rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .eng-fab-body { display: grid; grid-template-columns: 1fr auto; gap: 0.5rem; align-items: start; }
      @container (max-width: 22rem) {
        .eng-fab-body { grid-template-columns: 1fr; }
      }
      .eng-fab-temps { display: grid; grid-template-columns: repeat(auto-fit, minmax(4.5rem, 1fr)); gap: 0.25rem; }
      .eng-fab-tile {
        display: flex; flex-direction: column; align-items: center; gap: 0.1rem;
        padding: 0.35rem 0.4rem;
        background: rgba(255,255,255,0.04); border-radius: 0.4rem;
        cursor: pointer; transition: background 150ms ease;
      }
      .eng-fab-tile:hover { background: rgba(255,255,255,0.08); }
      .eng-fab-tile:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }
      .eng-fab-tile-label { font-family: var(--lcars-font); font-size: 0.6rem; color: var(--lcars-gray); letter-spacing: 0.06em; }
      .eng-fab-tile-value { font-family: var(--lcars-font); font-size: 1.1rem; font-variant-numeric: tabular-nums; }
      .eng-fab-tile-unit { font-size: 0.6rem; opacity: 0.7; margin-left: 0.1rem; }
      .eng-fab-tile-target { font-family: var(--lcars-font); font-size: 0.6rem; color: var(--lcars-gray); font-variant-numeric: tabular-nums; }
      .eng-fab-cam {
        width: 8rem; max-width: 100%;
        border-radius: 0.4rem; overflow: hidden;
        background: var(--lcars-black, #000);
      }
      .eng-fab-cam img { display: block; width: 100%; height: auto; object-fit: cover; }
      .eng-fab-ams { display: flex; flex-wrap: wrap; align-items: center; gap: 0.35rem; padding-top: 0.25rem; border-top: 1px solid rgba(255,255,255,0.06); }
      .eng-fab-ams-label { font-family: var(--lcars-font); font-size: 0.65rem; color: var(--lcars-gray); text-transform: uppercase; letter-spacing: 0.06em; }
      .eng-fab-tray {
        display: inline-flex; align-items: center; gap: 0.25rem;
        padding: 0.1rem 0.4rem; border-radius: 0.4rem;
        background: rgba(255,255,255,0.05); cursor: pointer;
        font-family: var(--lcars-font); font-size: 0.65rem; color: var(--lcars-space-white);
        text-transform: uppercase;
      }
      .eng-fab-tray:hover { background: rgba(255,255,255,0.1); }
      .eng-fab-tray:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }
      .eng-fab-tray-swatch { display: inline-block; width: 0.7rem; height: 0.7rem; border-radius: 50%; border: 1px solid rgba(0,0,0,0.4); }
      .eng-fab-foot { display: flex; flex-wrap: wrap; gap: 0.4rem; align-items: center; }
      .eng-fab-meta { font-family: var(--lcars-font); font-size: 0.65rem; color: var(--lcars-gray); letter-spacing: 0.06em; }
      .eng-fab-light {
        font-family: var(--lcars-font); font-size: 0.65rem;
        padding: 0.15rem 0.6rem; border-radius: var(--lcars-btn-radius, 1.5rem);
        background: var(--lcars-bluey, #8899ff); color: var(--lcars-black, #000);
        border: 0; cursor: pointer; text-transform: uppercase; letter-spacing: 0.06em;
      }
      .eng-fab-light.on { background: var(--lcars-gold); }
      .eng-fab-light:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }

      /* ─── Fabrication WATCH cameras (label-tagged) ─── */
      .eng-fab-cameras { margin-top: 0.75rem; padding-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.08); }
      .eng-fab-cameras-label {
        font-family: var(--lcars-font); font-size: 0.7rem; color: var(--lcars-gray);
        letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 0.35rem;
      }
      .eng-fab-cameras-grid {
        display: grid; grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
        gap: 0.5rem;
      }
      .eng-fab-cam-tile {
        position: relative; cursor: pointer;
        background: var(--lcars-black, #000);
        border-radius: 0.4rem; overflow: hidden;
        aspect-ratio: 16 / 9;
      }
      .eng-fab-cam-tile:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }
      .eng-fab-cam-tile img { width: 100%; height: 100%; object-fit: cover; display: block; }
      .eng-fab-cam-placeholder {
        position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
        font-family: var(--lcars-font); font-size: 0.7rem; color: var(--lcars-gray);
        letter-spacing: 0.08em;
      }
      .eng-fab-cam-name {
        position: absolute; left: 0; right: 0; bottom: 0;
        padding: 0.15rem 0.4rem;
        background: rgba(0,0,0,0.6);
        font-family: var(--lcars-font); font-size: 0.65rem;
        color: var(--lcars-space-white); letter-spacing: 0.06em;
        text-overflow: ellipsis; white-space: nowrap; overflow: hidden;
      }
    `];
  }
}

const ready = Promise.race([customElements.whenDefined('hui-masonry-view'), new Promise((r) => setTimeout(r, 5000))]);
ready.then(() => { if (!customElements.get('engineering-card')) { customElements.define('engineering-card', LcarsEngineeringCard); } });
