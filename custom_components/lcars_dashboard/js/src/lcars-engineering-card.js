/**
 * lcars-engineering-card.js
 *
 * Engineering (Power) Dashboard — batteries, power/energy/voltage/current
 * sensors across all areas, grouped by floor → area.
 *
 * Filter: ALL / STORAGE (batteries) / CIRCUITS (power sensors)
 * v5.0.0 — 5X-2.3
 */
import { LitElement, html, css } from 'lit-element';
import { lcarsEventBus, showMoreInfo } from './lcars-helpers.js';
import { lcarsBaseStyles } from './lcars-styles.js';
import { getFloors, getAreasByFloor } from './lcars-hierarchy-utils.js';
import { getAreaEntities } from './lcars-entity-query.js';
import { isDiagnosticEntity } from './lcars-entity-utils.js';
import { formatNumber } from './lcars-format-utils.js';

// Side-effect: register battery panel
import './panels/battery/lcars-battery-panel.js';

const TAG = 'EngineeringCard';
const FILTER_ALL = 'all';
const FILTER_STORAGE = 'storage';
const FILTER_CIRCUITS = 'circuits';

const POWER_CLASSES = new Set(['battery', 'power', 'energy', 'voltage', 'current']);

class LcarsEngineeringCard extends LitElement {

  static get properties() {
    return { hass: { type: Object }, _config: { type: Object }, filter: { type: String } };
  }

  constructor() {
    super();
    this.hass = null; this._config = {}; this.filter = FILTER_ALL;
    this._entityCache = new Map();
    this._onFilter = (e) => { this.filter = e.detail.filter; };
  }

  connectedCallback() { super.connectedCallback(); lcarsEventBus.addEventListener('lcars-eng-filter', this._onFilter); }
  disconnectedCallback() { super.disconnectedCallback(); lcarsEventBus.removeEventListener('lcars-eng-filter', this._onFilter); }
  setConfig(config) { this._config = config || {}; }
  set hass(val) { const old = this._hass; this._hass = val; if (val && old !== val) { this._entityCache.clear(); this.requestUpdate('hass', old); } }
  get hass() { return this._hass; }
  getCardSize() { return 12; }

  _getAreasWithPower() {
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
    const circuits = [];
    const batteryDeviceMap = new Map(); // device_id → { battery, powerEntries[] }

    for (const e of raw) {
      const domain = e.entity_id.split('.')[0];
      const state = this._hass.states?.[e.entity_id];
      if (!state) continue;
      const entry = { entity: e, domain, state };
      if (isDiagnosticEntity(entry)) continue;
      const dc = state.attributes?.device_class || '';
      if (!POWER_CLASSES.has(dc)) continue;

      const deviceId = e.device_id;

      if (dc === 'battery' && deviceId) {
        // Group battery with its device's power entities
        if (!batteryDeviceMap.has(deviceId)) {
          batteryDeviceMap.set(deviceId, { battery: entry, entities: [entry], device: this._hass?.devices?.[deviceId] });
        } else {
          batteryDeviceMap.get(deviceId).battery = entry;
          batteryDeviceMap.get(deviceId).entities.push(entry);
        }
      } else if (deviceId && batteryDeviceMap.has(deviceId)) {
        // Power entity belongs to a battery device
        batteryDeviceMap.get(deviceId).entities.push(entry);
      } else if (dc === 'battery' && !deviceId) {
        // Orphan battery (no device) — treat as standalone
        circuits.push(entry);
      } else {
        // Check if this device has a battery — if so, add to its group
        let addedToDevice = false;
        if (deviceId) {
          // Look ahead: does this device have a battery?
          for (const e2 of raw) {
            if (e2.device_id === deviceId) {
              const s2 = this._hass.states?.[e2.entity_id];
              if (s2?.attributes?.device_class === 'battery') {
                if (!batteryDeviceMap.has(deviceId)) {
                  batteryDeviceMap.set(deviceId, { battery: null, entities: [], device: this._hass?.devices?.[deviceId] });
                }
                batteryDeviceMap.get(deviceId).entities.push(entry);
                addedToDevice = true;
                break;
              }
            }
          }
        }
        if (!addedToDevice) circuits.push(entry);
      }
    }

    // Build device groups for battery panel rendering
    // Only render warp core for devices with power I/O siblings (not battery-only like motion sensors)
    const deviceGroups = [];
    const batteryOnlyEntries = []; // Battery-only devices render as compact tiles
    for (const [deviceId, group] of batteryDeviceMap) {
      if (group.battery) {
        const hasPowerSibling = group.entities.some(e => {
          const dc = (this._hass?.states?.[e.entity?.entity_id] || e.state)?.attributes?.device_class;
          return dc === 'power' || dc === 'energy' || dc === 'voltage' || dc === 'current';
        });
        if (hasPowerSibling) {
          deviceGroups.push({
            device: group.device,
            entities: group.entities,
            areaId: area.area_id,
          });
        } else {
          batteryOnlyEntries.push(group.battery);
        }
      }
    }

    if (deviceGroups.length === 0 && circuits.length === 0 && batteryOnlyEntries.length === 0) return null;
    return { area, deviceGroups, circuits: [...circuits, ...batteryOnlyEntries], all: [...deviceGroups.flatMap(g => g.entities), ...circuits, ...batteryOnlyEntries] };
  }

  _getFiltered(data) {
    if (this.filter === FILTER_STORAGE) return data.deviceGroups.length > 0 ? data.deviceGroups : null;
    if (this.filter === FILTER_CIRCUITS) return data.circuits.length > 0 ? data.circuits : null;
    return data.all.length > 0 ? data.all : null;
  }

  /* ─── Summary ─── */

  _getGlobalSummary(floorGroups) {
    let totalPowerW = 0;
    let batteryCount = 0, batterySum = 0, lowestBat = 100;

    for (const { areas } of floorGroups) {
      for (const data of areas) {
        for (const e of data.circuits) {
          const state = this._hass?.states?.[e.entity?.entity_id] || e.state;
          if (state?.attributes?.device_class === 'power') {
            const v = parseFloat(state?.state);
            if (!isNaN(v)) totalPowerW += v;
          }
        }
        for (const g of data.deviceGroups) {
          if (g.entities) {
            for (const e of g.entities) {
              const state = this._hass?.states?.[e.entity?.entity_id] || e.state;
              if (state?.attributes?.device_class === 'battery') {
                const v = parseFloat(state?.state);
                if (!isNaN(v)) { batteryCount++; batterySum += v; lowestBat = Math.min(lowestBat, v); }
              }
            }
          }
        }
      }
    }
    const avgBattery = batteryCount > 0 ? Math.round(batterySum / batteryCount) : null;
    return { totalPowerW, batteryCount, avgBattery, lowestBat: batteryCount > 0 ? Math.round(lowestBat) : null };
  }

  _getPowerTierColor(watts) {
    if (watts > 1000) return 'var(--lcars-tomato, #ff5555)';
    if (watts > 500) return 'var(--lcars-butterscotch, #ff9966)';
    if (watts > 200) return 'var(--lcars-sunflower, #ffcc99)';
    if (watts > 50) return 'var(--lcars-ice, #99ccff)';
    return 'var(--lcars-gray, #666688)';
  }

  _getBatteryColor(pct) {
    if (pct < 20) return 'var(--lcars-tomato, #ff5555)';
    if (pct < 50) return 'var(--lcars-butterscotch, #ff9966)';
    return 'var(--lcars-ice, #99ccff)';
  }

  render() {
    if (!this._hass) return html``;
    const floorGroups = this._getAreasWithPower();
    const summary = this._getGlobalSummary(floorGroups);

    return html`
      <div class="eng-dashboard">
        <!-- Warp Core Summary -->
        <div class="eng-summary">
          <span class="eng-summary__block">
            <span class="eng-summary__label">TOTAL DRAW</span>
            <span class="eng-summary__value">${formatNumber(Math.round(summary.totalPowerW))} W</span>
          </span>
          ${summary.batteryCount > 0 ? html`
            <span class="eng-summary__block">
              <span class="eng-summary__label">BATTERIES</span>
              <span class="eng-summary__value">${summary.batteryCount} UNITS · AVG ${summary.avgBattery}%</span>
            </span>
            <span class="eng-summary__block">
              <span class="eng-summary__label">LOWEST</span>
              <span class="eng-summary__value">${summary.lowestBat}%</span>
            </span>
          ` : ''}
        </div>

        ${floorGroups.map(({ floor, areas }) => {
          const visible = areas.filter(a => this._getFiltered(a) !== null);
          if (visible.length === 0) return html``;
          return html`
            ${floor ? html`<div class="eng-floor-header"><span class="eng-floor-name">${floor.name || 'FLOOR'}</span><span class="eng-floor-line"></span></div>` : ''}
            ${visible.map(data => html`
              <div class="eng-area-section">
                <div class="eng-area-header">
                  <span class="eng-area-name">${data.area.name}</span>
                  <span class="eng-area-line"></span>
                </div>
                ${this.filter !== FILTER_CIRCUITS && data.deviceGroups.length > 0 ? html`
                  <div class="eng-battery-panels">
                    ${data.deviceGroups.map(g => html`
                      <lcars-battery-panel
                        .group=${{ device: g.device, entities: g.entities, areaId: g.areaId }}
                        .hass=${this._hass}
                        area-id="${g.areaId}">
                      </lcars-battery-panel>
                    `)}
                  </div>
                ` : ''}
                ${this.filter !== FILTER_STORAGE && data.circuits.length > 0 ? html`
                  <div class="eng-devices">
                    ${data.circuits.map(e => this._renderDevice(e))}
                  </div>
                ` : ''}
              </div>
            `)}
          `;
        })}
        ${floorGroups.length === 0 ? html`<div class="eng-empty"><span>NO POWER DEVICES DETECTED</span></div>` : ''}
      </div>
    `;
  }

  _renderDevice(entry) {
    const eid = entry.entity?.entity_id;
    const state = this._hass?.states?.[eid] || entry.state;
    const name = (state?.attributes?.friendly_name || eid || '').toUpperCase();
    const dc = state?.attributes?.device_class || '';
    const unit = state?.attributes?.unit_of_measurement || '';
    const val = state?.state;
    const numVal = parseFloat(val);
    const displayVal = isNaN(numVal) ? (val || '').toUpperCase() : `${formatNumber(numVal)} ${unit}`;
    const isBattery = dc === 'battery';
    const batteryPct = isBattery ? (isNaN(numVal) ? 0 : numVal) : null;

    if (isBattery) {
      const batColor = this._getBatteryColor(batteryPct);
      return html`
        <div class="eng-device battery" @click=${() => showMoreInfo(eid)}
             style="--bat-color:${batColor}">
          <div class="eng-device__header">
            <span class="eng-device__name">${name}</span>
            <span class="eng-device__value-inline" style="color:${batColor}">${Math.round(batteryPct)}%</span>
          </div>
          <div class="eng-bat-bar">
            <div class="eng-bat-fill" style="width:${batteryPct}%; background:${batColor}"></div>
          </div>
        </div>
      `;
    }

    // Power/energy/voltage/current sensor
    const watts = dc === 'power' ? numVal : 0;
    const tierColor = dc === 'power' ? this._getPowerTierColor(watts) : 'var(--lcars-butterscotch, #ff9966)';

    return html`
      <div class="eng-device sensor" @click=${() => showMoreInfo(eid)}>
        <div class="eng-device__header">
          <span class="eng-device__name">${name}</span>
          <span class="eng-device__badge">${dc.toUpperCase()}</span>
        </div>
        <div class="eng-device__value" style="color:${tierColor}">${displayVal}</div>
      </div>
    `;
  }

  static get styles() {
    return [
      lcarsBaseStyles,
      css`
        :host { display: block; }
        .eng-dashboard { padding: 0.25rem; }

        /* ─── Summary Strip ─── */
        .eng-summary {
          display: flex; gap: 0.25rem; margin-bottom: 0.75rem;
          background: var(--lcars-butterscotch, #ff9966); border-radius: 0.5rem;
          padding: 0.5rem 1rem; color: var(--lcars-black, #000);
          font-family: var(--lcars-font, 'Antonio', sans-serif); text-transform: uppercase;
        }
        .eng-summary__block { flex: 1; display: flex; flex-direction: column; gap: 0.125rem; }
        .eng-summary__label { font-size: 0.625rem; letter-spacing: 0.1em; color: var(--lcars-black, #000); opacity: 0.7; }
        .eng-summary__value { font-size: 1.25rem; font-variant-numeric: tabular-nums; color: var(--lcars-black, #000); }

        .eng-floor-header { display: flex; align-items: center; gap: 0.5rem; margin: 1rem 0 0.5rem 0; }
        .eng-floor-name { font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 1.25rem; color: var(--lcars-butterscotch, #ff9966); text-transform: uppercase; letter-spacing: 0.08em; white-space: nowrap; }
        .eng-floor-line { flex: 1; height: 0.375rem; background: var(--lcars-butterscotch, #ff9966); border-radius: 0 1.5rem 1.5rem 0; opacity: 0.4; }
        .eng-area-section { margin-bottom: 0.75rem; }
        .eng-area-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem; }
        .eng-area-name { font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 1.25rem; color: var(--lcars-butterscotch, #ff9966); text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap; }
        .eng-area-line { flex: 1; height: 2px; background: var(--lcars-butterscotch, #ff9966); opacity: 0.3; }
        .eng-devices { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(16rem, 100%), 1fr)); gap: 0.375rem; }
        .eng-battery-panels { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(22rem, 100%), 1fr)); gap: 0.5rem; margin-bottom: 0.5rem; }
        .eng-device { border: 1px solid rgba(255, 153, 102, 0.15); border-radius: 0.5rem; padding: 0.5rem 0.75rem; cursor: pointer; transition: filter 200ms ease; }
        .eng-device:hover { filter: brightness(1.15); }
        .eng-device.battery { border-left: 4px solid var(--lcars-butterscotch, #ff9966); }
        .eng-device__header { display: flex; align-items: center; gap: 0.5rem; }
        .eng-device__name { flex: 1; font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 0.875rem; color: var(--lcars-butterscotch, #ff9966); text-transform: uppercase; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .eng-device__badge { font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 0.625rem; color: var(--lcars-gray, #666688); text-transform: uppercase; letter-spacing: 0.1em; }
        .eng-device__value { font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 1.5rem; color: var(--lcars-space-white, #f5f6fa); font-variant-numeric: tabular-nums; margin-top: 0.25rem; }
        .eng-device__value-inline { font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 1.25rem; font-variant-numeric: tabular-nums; flex-shrink: 0; }
        .eng-bat-bar { height: 0.375rem; background: rgba(102, 102, 136, 0.2); border-radius: 0.25rem; margin-top: 0.25rem; overflow: hidden; }
        .eng-bat-fill { height: 100%; background: var(--lcars-butterscotch, #ff9966); border-radius: 0.25rem; transition: width 300ms ease; }
        .eng-empty { display: flex; align-items: center; justify-content: center; min-height: 10rem; color: var(--lcars-gray, #666688); font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 1.25rem; text-transform: uppercase; }
      `,
    ];
  }
}

if (!customElements.get('engineering-card')) {
  customElements.define('engineering-card', LcarsEngineeringCard);
}
