/**
 * LCARS Internal Sensors Grid — Ship-wide environmental monitoring
 * Discovers temp/humidity sensors, groups by floor, renders a responsive tile grid.
 *
 * 4X-2: v4.14.0
 * Conditions: D-C1 (no WS for discovery), D-C3 (tracked-entity diffing),
 *             W-R1 (entity ID validation), W-R2 (WebSocket-only sparklines),
 *             G-F1 (square floor labels), G-F2 (no humidity-warn), G-F3 (keyboard a11y)
 */
import { LitElement, html, css } from 'lit-element';
import { lcarsBaseStyles } from './lcars-styles.js';
import { showMoreInfo, lcarsLog } from './lcars-helpers.js';
import {
  getTempColor, getHumidityColor, getTempComfortClass,
  getSafeComfortColor, COMFORT_COLORS
} from './lcars-color-utils.js';
import { renderSparkline, fetchSparklineData } from './lcars-sparkline.js';

const TAG = 'lcars-sensors-grid';
const ENTITY_ID_RE = /^[a-z_]+\.[a-z0-9_]+$/; // W-R1: validate at extraction
const EXCLUDE_DOMAINS = new Set(['fan', 'climate']);
const AQ_CLASSES = new Set(['aqi', 'pm25', 'pm10', 'volatile_organic_compounds']);
const APPLIANCE_PATTERN = /fridge|freezer|refrigerator|wine\s*cooler|kegerator|deep\s*freeze/i;

class LcarsInternalSensorsGrid extends LitElement {

  static get properties() {
    return {
      _hass: { type: Object },
      _config: { type: Object },
      _sensorGroups: { type: Array },
      _sparklineData: { type: Object },
    };
  }

  constructor() {
    super();
    this._sensorGroups = [];
    this._trackedEntityIds = new Set();
    this._sparklineCache = new Map();
    this._sparklineData = null;
    this._needsDiscovery = true;
    this._lastRegistryRef = null;
  }

  /* ─── Config ─── */

  setConfig(config) {
    const clampTemp = (v, d) => (v != null ? Math.max(-50, Math.min(200, Number(v))) : d);
    const clampPct  = (v, d) => (v != null ? Math.max(0, Math.min(100, Number(v))) : d);

    this._config = {
      ...config,
      temp_comfort_min:     clampTemp(config.temp_comfort_min, 68),
      temp_comfort_max:     clampTemp(config.temp_comfort_max, 76),
      humidity_comfort_min: clampPct(config.humidity_comfort_min, 30),
      humidity_comfort_max: clampPct(config.humidity_comfort_max, 60),
      battery_alert:        clampPct(config.battery_alert, 20),
      show_sparklines:      config.show_sparklines !== false,
      show_averages:        config.show_averages !== false,
      show_appliance_meters: config.show_appliance_meters === true,
      group_by_floor:       config.group_by_floor !== false,
    };
    this._needsDiscovery = true;
  }

  /* ─── Hass setter with D-C3 tracked-entity diffing ─── */

  set hass(hass) {
    const oldHass = this._hass;
    this._hass = hass;

    // Re-discover if registries changed (reference equality check)
    const registryRef = `${Object.keys(hass.entities || {}).length}:${Object.keys(hass.devices || {}).length}`;
    if (!oldHass || this._needsDiscovery || registryRef !== this._lastRegistryRef) {
      this._lastRegistryRef = registryRef;
      this._discoverSensors();
      this._needsDiscovery = false;
      this.requestUpdate();
      return;
    }

    // D-C3: Only re-render if a tracked entity's state actually changed
    if (this._trackedEntityIds.size > 0) {
      let changed = false;
      for (const eid of this._trackedEntityIds) {
        if (oldHass.states[eid] !== hass.states[eid]) {
          changed = true;
          break;
        }
      }
      if (!changed) return;
    }

    this.requestUpdate();
  }

  /* ─── Discovery (D-C1: hass object properties, NO WebSocket) ─── */

  _discoverSensors() {
    if (!this._hass) return;

    const entities = Object.values(this._hass.entities || {});
    const devices  = this._hass.devices || {};
    const areas    = this._hass.areas || {};
    const floors   = this._hass.floors || {};

    // Build device → entity list
    const deviceEntities = new Map();
    for (const e of entities) {
      if (!e.device_id || e.disabled_by) continue;
      if (!deviceEntities.has(e.device_id)) deviceEntities.set(e.device_id, []);
      deviceEntities.get(e.device_id).push(e);
    }

    // Find temp entities, W-R1: validate at extraction
    const tempEntities = entities.filter(e =>
      e.original_device_class === 'temperature' &&
      !e.disabled_by &&
      ENTITY_ID_RE.test(e.entity_id)
    );

    const groups = [];
    const tracked = new Set();

    for (const tempEntity of tempEntities) {
      const deviceId = tempEntity.device_id;
      const device = devices[deviceId];
      if (!device) continue;

      // Exclude devices handled by other panels (air purifiers, HVAC)
      const siblings = deviceEntities.get(deviceId) || [];
      const hasExcludedDomain = siblings.some(e => {
        const domain = e.entity_id?.split('.')[0];
        return EXCLUDE_DOMAINS.has(domain);
      });
      const hasAqSensor = siblings.some(e => AQ_CLASSES.has(e.original_device_class));
      if (hasExcludedDomain || hasAqSensor) continue;

      // Appliance filter
      const deviceName = device.name_by_user || device.name || '';
      if (!this._config.show_appliance_meters && APPLIANCE_PATTERN.test(deviceName)) continue;

      // Must have humidity sibling
      const humidityEntity = siblings.find(e =>
        e.original_device_class === 'humidity' && ENTITY_ID_RE.test(e.entity_id)
      );
      if (!humidityEntity) continue;

      const batteryEntity = siblings.find(e =>
        e.original_device_class === 'battery' && ENTITY_ID_RE.test(e.entity_id)
      );

      // Resolve area → floor
      const areaId = device.area_id;
      const area = areaId ? areas[areaId] : null;
      const floorId = area?.floor_id;
      const floor = floorId ? floors[floorId] : null;

      groups.push({
        deviceId,
        deviceName,
        areaId,
        areaName: area ? area.name : deviceName.replace(/^Meter\s*-\s*/i, ''),
        floorId,
        floorName: floor ? floor.name : 'UNASSIGNED',
        floorLevel: floor ? floor.level : -999,
        temperatureEntityId: tempEntity.entity_id,
        humidityEntityId: humidityEntity.entity_id,
        batteryEntityId: batteryEntity ? batteryEntity.entity_id : null,
      });

      // Track all entity IDs for D-C3 diffing
      tracked.add(tempEntity.entity_id);
      tracked.add(humidityEntity.entity_id);
      if (batteryEntity) tracked.add(batteryEntity.entity_id);
    }

    // Sort: highest floor first, then alpha by area
    groups.sort((a, b) => {
      if (b.floorLevel !== a.floorLevel) return b.floorLevel - a.floorLevel;
      return a.areaName.localeCompare(b.areaName);
    });

    this._sensorGroups = groups;
    this._trackedEntityIds = tracked;
    lcarsLog.debug(TAG, `Discovered ${groups.length} sensor groups, tracking ${tracked.size} entities`);
  }

  /* ─── Sparklines (W-R2: WebSocket only, reuse shared fetcher) ─── */

  async _fetchSparklines() {
    if (!this._config?.show_sparklines || !this._hass || this._sensorGroups.length === 0) return;

    const entityIds = this._sensorGroups.map(g => g.temperatureEntityId);
    const data = await fetchSparklineData(
      this._hass, 'sensors-grid', entityIds, this._sparklineCache,
      { maxEntities: Math.max(entityIds.length, 10) }
    );
    if (data) {
      this._sparklineData = data;
      this.requestUpdate();
    }
  }

  /* ─── Lifecycle ─── */

  firstUpdated() {
    this._fetchSparklines();
  }

  updated(changedProps) {
    // Refresh sparklines periodically
    if (changedProps.has('_sensorGroups') && this._sensorGroups.length > 0) {
      this._fetchSparklines();
    }
  }

  /* ─── Helpers ─── */

  _getState(entityId) {
    return entityId ? this._hass?.states[entityId] : null;
  }

  _getNumericState(entityId) {
    const state = this._getState(entityId);
    if (!state || state.state === 'unavailable' || state.state === 'unknown') return null;
    const v = parseFloat(state.state);
    return isNaN(v) ? null : v;
  }

  _isUnavailable(entityId) {
    const state = this._getState(entityId);
    return !state || ['unavailable', 'unknown'].includes(state.state);
  }

  _getStardate() {
    const now = new Date();
    const y = now.getFullYear();
    const start = new Date(y, 0, 0);
    const dayOfYear = Math.floor((now - start) / 86400000);
    return `${y}${String(dayOfYear).padStart(3, '0')}.${String(now.getHours()).padStart(2, '0')}`;
  }

  _handleTileTap(e, entityId) {
    e.stopPropagation();
    showMoreInfo(entityId);
  }

  /* ─── Averages ─── */

  _computeAverages() {
    const temps = [];
    const humids = [];
    let online = 0;
    let lowBattery = 0;

    for (const g of this._sensorGroups) {
      const t = this._getNumericState(g.temperatureEntityId);
      const h = this._getNumericState(g.humidityEntityId);
      if (t != null) { temps.push(t); online++; }
      if (h != null) humids.push(h);

      if (g.batteryEntityId) {
        const b = this._getNumericState(g.batteryEntityId);
        if (b != null && b <= (this._config.battery_alert || 20)) lowBattery++;
      }
    }

    const avg = arr => arr.length > 0
      ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length * 10) / 10
      : null;

    return {
      avgTemp: avg(temps),
      avgHumidity: avg(humids),
      onlineCount: online,
      totalCount: this._sensorGroups.length,
      lowBatteryCount: lowBattery,
    };
  }

  /* ─── Floor Grouping ─── */

  _groupByFloor() {
    const floorGroups = new Map();
    for (const g of this._sensorGroups) {
      const key = g.floorName;
      if (!floorGroups.has(key)) floorGroups.set(key, []);
      floorGroups.get(key).push(g);
    }
    return floorGroups;
  }

  /* ─── Sparkline data for a tile ─── */

  _getSparklinePoints(entityId) {
    if (!this._sparklineData || !this._sparklineData[entityId]) return null;
    return this._sparklineData[entityId];
  }

  /* ─── Render ─── */

  render() {
    if (!this._hass || !this._config) return html``;
    if (this._sensorGroups.length === 0) {
      return html`
        <ha-card>
          <div class="lcars-sensors-grid empty" role="region"
               aria-label="Internal environmental sensors — no sensors found">
            <div class="sensors-header" role="heading" aria-level="3">
              <span class="sensors-header-title">INTERNAL SENSORS</span>
              <span class="sensors-header-line" aria-hidden="true"></span>
              <span class="sensors-header-stardate">${this._getStardate()}</span>
            </div>
            <div class="sensors-empty">NO ENVIRONMENTAL SENSORS DETECTED</div>
          </div>
        </ha-card>
      `;
    }

    const floorGroups = this._groupByFloor();
    const avgs = this._config.show_averages ? this._computeAverages() : null;

    return html`
      <ha-card>
        <div class="lcars-sensors-grid"
             role="region"
             aria-label="Internal environmental sensors — ${avgs?.onlineCount || 0} rooms monitored">

          ${this._renderHeader()}
          ${this._renderBody(floorGroups)}
          ${avgs ? this._renderSummary(avgs) : ''}
        </div>
      </ha-card>
    `;
  }

  _renderHeader() {
    return html`
      <div class="sensors-header" role="heading" aria-level="3">
        <span class="sensors-header-title">INTERNAL SENSORS</span>
        <span class="sensors-header-line" aria-hidden="true"></span>
        <span class="sensors-header-stardate">${this._getStardate()}</span>
      </div>
    `;
  }

  _renderBody(floorGroups) {
    return html`
      <div class="sensors-body" role="list"
           aria-label="Room environmental readings grouped by floor">
        ${[...floorGroups.entries()].map(([floorName, groups]) => html`
          <div class="sensors-floor-group" role="group"
               aria-label="${floorName} — ${groups.length} rooms">
            <div class="sensors-floor-label" role="heading" aria-level="4">
              ${floorName.toUpperCase()}
            </div>
            <div class="sensors-tile-grid" role="list">
              ${groups.map((g, i) => this._renderTile(g, i))}
            </div>
          </div>
        `)}
      </div>
    `;
  }

  _renderTile(group, index) {
    const temp = this._getNumericState(group.temperatureEntityId);
    const humidity = this._getNumericState(group.humidityEntityId);
    const battery = group.batteryEntityId ? this._getNumericState(group.batteryEntityId) : null;
    const isUnavailable = this._isUnavailable(group.temperatureEntityId);

    const comfortClass = isUnavailable ? 'unavailable' : getTempComfortClass(temp);
    const tempColor = isUnavailable ? 'var(--lcars-gray)' : getTempColor(temp);
    const humidityColor = isUnavailable ? 'var(--lcars-gray)' : getHumidityColor(humidity);
    const showLowBattery = battery != null && battery <= (this._config.battery_alert || 20);

    // Sparkline points
    const sparkPoints = this._config.show_sparklines
      ? this._getSparklinePoints(group.temperatureEntityId)
      : null;

    // Aria label
    let ariaLabel = isUnavailable
      ? `${group.areaName}: sensor offline`
      : `${group.areaName}: ${temp != null ? Math.round(temp) : '?'} degrees, ${humidity != null ? Math.round(humidity) : '?'} percent humidity`;
    if (showLowBattery) ariaLabel += `. Low battery: ${Math.round(battery)} percent`;

    return html`
      <div class="sensor-tile ${comfortClass}"
           tabindex="0"
           role="listitem"
           aria-label="${ariaLabel}"
           style="--tile-index: ${index}"
           @click=${(e) => this._handleTileTap(e, group.temperatureEntityId)}
           @keydown=${(e) => {
             if (e.key === 'Enter' || e.key === ' ') {
               e.preventDefault();
               this._handleTileTap(e, group.temperatureEntityId);
             }
           }}>

        <div class="tile-name">${group.areaName}</div>

        <div class="tile-readings">
          <span class="tile-temp" style="color: ${tempColor}">
            ${temp != null ? `${Math.round(temp)}°` : '—'}
          </span>
          <span class="tile-humidity" style="color: ${humidityColor}">
            ${humidity != null ? `${Math.round(humidity)}%` : '—'}
          </span>
        </div>

        ${showLowBattery ? html`
          <div class="tile-battery-badge"
               aria-label="Low battery: ${Math.round(battery)} percent"
               title="BATTERY: ${Math.round(battery)}%">●</div>
        ` : ''}

        ${sparkPoints && sparkPoints.length >= 2 ? html`
          ${renderSparkline(sparkPoints, {
            color: tempColor,
            width: 100,
            height: 16,
            className: 'tile-sparkline',
          })}
        ` : ''}

        ${isUnavailable ? html`
          <div class="tile-unavailable" aria-label="Sensor unavailable">
            <span>OFFLINE</span>
          </div>
        ` : ''}
      </div>
    `;
  }

  _renderSummary(avgs) {
    const avgTempColor = avgs.avgTemp != null ? getTempColor(avgs.avgTemp) : 'var(--lcars-gray)';
    const avgHumidityColor = avgs.avgHumidity != null ? getHumidityColor(avgs.avgHumidity) : 'var(--lcars-gray)';

    return html`
      <div class="sensors-summary" role="status" aria-live="polite">
        <span class="summary-label">SHIP AVG</span>
        <span class="summary-temp" style="color: ${avgTempColor}">
          ${avgs.avgTemp != null ? `${avgs.avgTemp}°` : '—'}
        </span>
        <span class="summary-humidity" style="color: ${avgHumidityColor}">
          ${avgs.avgHumidity != null ? `${avgs.avgHumidity}%RH` : '—'}
        </span>
        <span class="summary-divider" aria-hidden="true">■</span>
        <span class="summary-online">
          ${avgs.onlineCount} ${avgs.onlineCount === 1 ? 'SENSOR' : 'SENSORS'} ONLINE
        </span>
        ${avgs.lowBatteryCount > 0 ? html`
          <span class="summary-low" style="color: var(--lcars-tomato)">
            ● ${avgs.lowBatteryCount} LOW
          </span>
        ` : ''}
      </div>
    `;
  }

  /* ─── Styles (Story 2.3) ─── */

  static get styles() {
    return [
      lcarsBaseStyles,
      css`
        :host { display: block; --grid-frame-color: var(--lcars-ice); }
        ha-card { background: transparent; border: none; box-shadow: none; }

        .lcars-sensors-grid {
          display: flex; flex-direction: column;
          border: 2px solid var(--grid-frame-color);
          border-radius: 0 0.75rem 0.75rem 0;
          overflow: hidden; background: var(--lcars-bg);
        }
        .lcars-sensors-grid.empty { min-height: 6rem; }
        .sensors-empty {
          display: flex; align-items: center; justify-content: center;
          padding: 2rem; font-size: var(--lcars-font-size-data);
          color: var(--lcars-gray); letter-spacing: 0.1em;
        }

        .sensors-header {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.25rem 0.75rem; min-height: var(--lcars-bar-height);
          border-bottom: 2px solid var(--grid-frame-color);
        }
        .sensors-header-title { font-size: var(--lcars-font-size-sub); color: var(--lcars-sunflower); white-space: nowrap; letter-spacing: 0.05em; }
        .sensors-header-line { flex: 1; height: 2px; background: var(--grid-frame-color); min-width: 1rem; }
        .sensors-header-stardate { font-size: var(--lcars-font-size-data); color: var(--lcars-ice); white-space: nowrap; }

        .sensors-body { display: flex; flex-direction: column; gap: var(--lcars-gap); padding: var(--lcars-gap); }
        .sensors-floor-group { display: flex; flex-direction: column; gap: var(--lcars-gap); }
        .sensors-floor-label {
          font-size: var(--lcars-font-size-data); color: var(--lcars-ice);
          letter-spacing: 0.1em; padding: 0.125rem 0.5rem;
          display: flex; align-items: center; gap: 0.5rem;
        }
        .sensors-floor-label::before {
          content: ''; display: inline-block; width: 0.5rem; height: 0.5rem;
          background: var(--lcars-ice); flex-shrink: 0;
        }

        .sensors-tile-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(9.5rem, 1fr));
          gap: var(--lcars-gap);
        }

        .sensor-tile {
          position: relative; display: flex; flex-direction: column; gap: 0.125rem;
          padding: 0.375rem 0.5rem; min-height: calc(var(--lcars-vunit) * 1.5); min-width: 7.5rem;
          background: var(--lcars-bg); border: 2px solid var(--lcars-gray);
          border-radius: 0 0.75rem 0.75rem 0; overflow: hidden;
          transition: border-color var(--lcars-transition-speed) var(--lcars-transition-function);
          cursor: default;
          animation: tile-appear 0.3s ease both;
          animation-delay: calc(min(var(--tile-index, 0), 20) * 50ms);
        }
        @keyframes tile-appear { from { opacity: 0; transform: translateY(0.25rem); } }
        .sensor-tile.comfort-nominal { border-color: var(--lcars-ice); }
        .sensor-tile.comfort-warm { border-color: var(--lcars-butterscotch); }
        .sensor-tile.comfort-hot { border-color: var(--lcars-peach); }
        .sensor-tile.comfort-cool { border-color: var(--lcars-bluey); }
        .sensor-tile.comfort-cold { border-color: var(--lcars-blue); }
        .sensor-tile.unavailable { border-color: var(--lcars-gray); opacity: 0.5; }
        .sensor-tile:focus-visible { outline: 2px solid var(--lcars-sunflower); outline-offset: 2px; }

        .tile-name {
          font-size: var(--lcars-font-size-data); color: var(--lcars-sunflower);
          letter-spacing: 0.05em; white-space: nowrap; overflow: hidden;
          text-overflow: ellipsis; line-height: 1.2;
        }
        .tile-readings { display: flex; align-items: baseline; gap: 0.5rem; }
        .tile-temp {
          font-size: var(--lcars-font-size-sub); font-weight: 700; line-height: 1;
          transition: color var(--lcars-transition-speed) var(--lcars-transition-function);
        }
        .tile-humidity {
          font-size: var(--lcars-font-size-data); line-height: 1; opacity: 0.85;
          transition: color var(--lcars-transition-speed) var(--lcars-transition-function);
        }

        .tile-battery-badge {
          position: absolute; top: 0.25rem; right: 0.5rem;
          color: var(--lcars-tomato); font-size: 0.5rem; line-height: 1;
          animation: battery-pulse 2s ease-in-out infinite;
        }
        @keyframes battery-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

        .tile-sparkline-wrap { width: 100%; margin-top: auto; }
        .tile-sparkline { width: 100%; height: 1rem; display: block; }

        .tile-unavailable {
          position: absolute; inset: 0; display: flex; align-items: center;
          justify-content: center; background: rgba(0,0,0,0.7); z-index: 1;
        }
        .tile-unavailable span { font-size: var(--lcars-font-size-data); color: var(--lcars-gray); letter-spacing: 0.1em; }

        .sensors-summary {
          display: flex; align-items: center; gap: 0.75rem;
          padding: 0.375rem 0.75rem; border-top: 2px solid var(--grid-frame-color); flex-wrap: wrap;
        }
        .summary-label { font-size: var(--lcars-font-size-data); color: var(--lcars-sunflower); letter-spacing: 0.05em; font-weight: 700; }
        .summary-temp, .summary-humidity { font-size: var(--lcars-font-size-sub); font-weight: 700; }
        .summary-divider { color: var(--lcars-gray); font-size: 0.5rem; }
        .summary-online { font-size: var(--lcars-font-size-data); color: var(--lcars-ice); }
        .summary-low { font-size: var(--lcars-font-size-data); margin-left: auto; }

        @media (max-width: 767px) {
          .tile-sparkline-wrap, .tile-sparkline { display: none; }
          .sensor-tile { flex-direction: row; align-items: center; gap: 0.5rem; min-height: var(--lcars-vunit); padding: 0.25rem 0.5rem; }
          .tile-name { flex: 1; min-width: 0; }
          .tile-readings { flex-shrink: 0; }
          .sensors-summary { gap: 0.25rem 0.75rem; }
        }
        @media (prefers-reduced-motion: reduce) {
          .sensor-tile, .tile-temp, .tile-humidity { transition: none !important; }
          .sensor-tile { animation: none !important; }
          .tile-battery-badge { animation: none !important; opacity: 1; }
        }
      `,
    ];
  }

  getCardSize() {
    return Math.max(2, Math.ceil(this._sensorGroups.length / 4) + 1);
  }
}

/* ─── Registration ─── */
if (!customElements.get('lcars-internal-sensors-grid')) {
  customElements.define('lcars-internal-sensors-grid', LcarsInternalSensorsGrid);
  lcarsLog.debug(TAG, 'Custom element registered: lcars-internal-sensors-grid');
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'lcars-internal-sensors-grid',
  name: 'LCARS Internal Sensors Grid',
  description: 'Ship-wide environmental monitoring grid',
  preview: true,
});
