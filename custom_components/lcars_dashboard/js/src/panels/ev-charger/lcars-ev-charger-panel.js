/**
 * lcars-ev-charger-panel.js (4X-55, 4X-58)
 *
 * EV Charger panel — Wallbox Vilya V2G energy flow visualization,
 * sensor telemetry, solar mode selector, and auxiliary controls.
 *
 * v4.23.0
 */
import { html } from 'lit-element';
import { LcarsBasePanel } from '../../lcars-base-panel.js';
import { showMoreInfo } from '../../lcars-helpers.js';
import { lcarsFocusRing } from '../../lcars-styles.js';
import { evChargerPanelStyles } from './lcars-ev-charger-panel-styles.js';
import { formatNumber } from '../../lcars-format-utils.js';
import { getEvChargerColor, getEvChargerLabel, getEvChargerIndicator, getEvSocColor } from '../../lcars-color-utils.js';
import { lcarsAudio } from '../../lcars-audio.js';

import '../../components/lcars-summary-badge/lcars-summary-badge.js';

const TAG = 'EvChargerPanel';

// ─── Entity detection helpers ───────────────────────────────────────────────

/** Match entity to a semantic role by entity_id suffix or device_class. */
function classifyEvEntity(entry) {
  const eid = entry.entity?.entity_id || '';
  const dc = entry.state?.attributes?.device_class || '';
  const domain = entry.domain || '';

  // Lock entity (cable lock)
  if (domain === 'lock') return 'lock';

  // Select entity (solar mode)
  if (domain === 'select' && /solar/i.test(eid)) return 'solar_mode';

  // Number entity (max charging current writable)
  if (domain === 'number' && /max.*current/i.test(eid)) return 'max_current_number';

  // Sensor classification by entity_id pattern
  if (domain === 'sensor') {
    if (/status_description/i.test(eid)) return 'status';
    if (/current_mode/i.test(eid)) return 'mode';
    if (/charging_power/i.test(eid)) return 'charging_power';
    if (/charging_speed/i.test(eid)) return 'charging_speed';
    if (/added_energy/i.test(eid) && !/green|grid/i.test(eid)) return 'added_energy';
    if (/added_range/i.test(eid)) return 'added_range';
    if (/(?:^|_)cost$/i.test(eid)) return 'cost';
    if (/added_green_energy/i.test(eid)) return 'green_energy';
    if (/added_grid_energy/i.test(eid)) return 'grid_energy';
    if (/discharged_energy/i.test(eid)) return 'discharged_energy';
    if (/state_of_charge/i.test(eid)) return 'soc';
    if (/depot_price/i.test(eid)) return 'depot_price';
    if (/max_available_power/i.test(eid)) return 'max_available';
    if (/max_charging_current/i.test(eid)) return 'max_current';
    if (/energy_price/i.test(eid)) return 'energy_price';
  }
  return null;
}

// ─── Sensor row definitions ─────────────────────────────────────────────────

const STATUS_GROUP = [
  { role: 'status',  label: 'STATUS',  color: null }, // dynamic
  { role: 'mode',    label: 'MODE',    color: 'var(--lcars-data-accent, var(--lcars-sunflower))' },
];

const SESSION_GROUP = [
  { role: 'charging_power',  label: 'POWER',  unit: 'kW', color: null }, // dynamic
  { role: 'charging_speed',  label: 'SPEED',  unit: 'km/h' },
  { role: 'added_energy',    label: 'ADDED',  unit: 'kWh' },
  { role: 'added_range',     label: 'RANGE',  unit: 'km' },
  { role: 'cost',            label: 'COST',   unit: '$' },
];

const ENERGY_GROUP = [
  { role: 'green_energy',      label: 'GREEN ENERGY', unit: 'kWh', color: 'var(--lcars-bluey, var(--lcars-ice))' },
  { role: 'grid_energy',       label: 'GRID ENERGY',  unit: 'kWh', color: 'var(--lcars-butterscotch)' },
  { role: 'discharged_energy', label: 'DISCHARGED',   unit: 'kWh', color: 'var(--lcars-ice)' },
];

const VEHICLE_GROUP = [
  { role: 'soc',         label: 'SOC',         unit: '%', color: null }, // dynamic
  { role: 'depot_price', label: 'DEPOT PRICE', unit: '$/kWh' },
];

const CHARGER_GROUP = [
  { role: 'max_available', label: 'MAX AVAILABLE', unit: 'kW' },
  { role: 'max_current',   label: 'MAX CURRENT',   unit: 'A' },
  { role: 'energy_price',  label: 'ENERGY PRICE',  unit: '$/kWh' },
];

// ─── Solar mode icon lookup ─────────────────────────────────────────────────

function getSolarModeIcon(mode) {
  const m = String(mode).toLowerCase();
  if (m.includes('full') && m.includes('solar')) return 'mdi:solar-power-variant';
  if (m.includes('eco'))  return 'mdi:leaf';
  if (m.includes('full')) return 'mdi:flash';
  if (m.includes('off'))  return 'mdi:power-off';
  return 'mdi:solar-power';
}

// ═════════════════════════════════════════════════════════════════════════════

class LcarsEvChargerPanel extends LcarsBasePanel {

  get panelType() { return 'ev_charger'; }
  get defaultPanelTitle() { return 'EV CHARGER'; }

  get frameColor() {
    const em = this._entityMap();
    const statusState = em.get('status')?.state?.state;
    const powerState = em.get('charging_power')?.state?.state;
    const power = powerState != null ? parseFloat(powerState) : null;
    return getEvChargerColor(statusState, power);
  }

  static get styles() {
    return [
      ...super.styles,
      lcarsFocusRing,
      evChargerPanelStyles,
    ];
  }

  // ─── Entity partitioning ──────────────────────────────────────────────────

  /** Build a Map<role, entry> from all entities. Cached per render. */
  _entityMap() {
    if (this.__entityMapCache) return this.__entityMapCache;
    const map = new Map();
    for (const entry of this._getAllEntities()) {
      const role = classifyEvEntity(entry);
      if (role && !map.has(role)) map.set(role, entry);
    }
    this.__entityMapCache = map;
    return map;
  }

  updated(changedProperties) {
    super.updated(changedProperties);
    // Invalidate cache each render cycle
    this.__entityMapCache = null;
  }

  // ─── Badge ────────────────────────────────────────────────────────────────

  renderBadge() {
    const em = this._entityMap();
    const statusState = em.get('status')?.state?.state;
    const label = getEvChargerLabel(statusState);
    const color = this.frameColor;
    return html`<lcars-summary-badge value="${label}" color="${color}"></lcars-summary-badge>`;
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  renderContent() {
    const em = this._entityMap();
    const statusState = em.get('status')?.state?.state;
    const powerRaw = em.get('charging_power')?.state?.state;
    const chargingPower = powerRaw != null ? parseFloat(powerRaw) : 0;
    const stateColor = this.frameColor;
    const statusLabel = getEvChargerLabel(statusState);
    const indicator = getEvChargerIndicator(statusState);
    const socRaw = em.get('soc')?.state?.state;
    const soc = socRaw != null && socRaw !== 'unavailable' && socRaw !== 'unknown' ? parseFloat(socRaw) : null;
    const socColor = getEvSocColor(soc);
    const isDischarging = statusState && (String(statusState).toLowerCase().includes('discharg') || String(statusState).toLowerCase().includes('v2g'));
    const isCharging = statusState && String(statusState).toLowerCase().includes('charg') && !String(statusState).toLowerCase().includes('waiting');
    const isIdle = !isCharging && !isDischarging;

    return html`
      <div class="lcars-device-panel" style="--ev-charger-state-color: ${stateColor}">
        ${this._renderHeader(stateColor, indicator, statusLabel, chargingPower)}
        ${this._renderSensors(em, stateColor, socColor)}
        ${this._renderFlowDisplay(chargingPower, stateColor, statusLabel, soc, socColor, isDischarging, isIdle)}
        ${this._renderSolarStrip(em)}
        ${this._renderAuxControls(em)}
      </div>
    `;
  }

  // ─── Header ───────────────────────────────────────────────────────────────

  _renderHeader(stateColor, indicator, statusLabel, chargingPower) {
    const deviceName = this._getPanelName ? this._getPanelName() : this.defaultPanelTitle;
    return html`
      <div class="ev-header">
        <ha-icon icon="mdi:ev-station" style="color: ${stateColor}"></ha-icon>
        <span class="device-panel-name">${deviceName}</span>
        <span class="device-panel-header-line" aria-hidden="true"></span>
        <span class="ev-status-badge" style="color: ${stateColor}">
          <span aria-hidden="true">${indicator}</span>
          ${statusLabel}
        </span>
        <span class="ev-header-power" style="color: ${stateColor}">
          ${chargingPower > 0.1 ? `${formatNumber(chargingPower, 1)} KW` : ''}
        </span>
      </div>
    `;
  }

  // ─── Sensor Telemetry Column ──────────────────────────────────────────────

  _renderSensors(em, stateColor, socColor) {
    return html`
      <div class="ev-sensors">
        ${this._renderSensorGroup(em, STATUS_GROUP, stateColor, null)}
        <div class="ev-section-divider"></div>
        <div class="ev-section-label">SESSION</div>
        ${this._renderSensorGroup(em, SESSION_GROUP, stateColor, null)}
        <div class="ev-section-divider"></div>
        <div class="ev-section-label">ENERGY BALANCE</div>
        ${this._renderSensorGroup(em, ENERGY_GROUP, null, null)}
        <div class="ev-section-divider"></div>
        <div class="ev-section-label">VEHICLE</div>
        ${this._renderSensorGroup(em, VEHICLE_GROUP, null, socColor)}
        <div class="ev-section-divider"></div>
        <div class="ev-section-label">CHARGER</div>
        ${this._renderSensorGroup(em, CHARGER_GROUP, null, null)}
      </div>
    `;
  }

  _renderSensorGroup(em, group, dynamicColor, socColor) {
    return group.map(def => {
      const entry = em.get(def.role);
      if (!entry) return html``;
      const raw = entry.state?.state;
      if (raw == null || raw === 'unavailable' || raw === 'unknown') {
        return this._renderSensorLine(entry, def.label, '—', 'var(--lcars-disabled)', def.unit);
      }
      const val = isNaN(raw) ? raw : formatNumber(parseFloat(raw), 1);
      let color = def.color || 'var(--lcars-space-white)';
      if (def.role === 'status' || def.role === 'charging_power') color = dynamicColor || color;
      if (def.role === 'soc' && socColor) color = socColor;
      return this._renderSensorLine(entry, def.label, val, color, def.unit);
    });
  }

  _renderSensorLine(entry, label, value, color, unit) {
    const eid = entry.entity?.entity_id || '';
    return html`
      <div class="device-sensor-line"
           tabindex="0"
           role="button"
           aria-label="${label}: ${value}${unit ? ' ' + unit : ''}"
           @click=${() => showMoreInfo(eid)}
           @keydown=${(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), showMoreInfo(eid))}>
        <span class="sensor-indicator" style="background: ${color}"></span>
        <span class="sensor-label">${label}</span>
        <span class="sensor-state-value" style="color: ${color}">
          ${value}${unit && value !== '—' ? html` <small>${unit}</small>` : ''}
        </span>
      </div>
    `;
  }

  // ─── Flow Visualization ───────────────────────────────────────────────────

  _renderFlowDisplay(chargingPower, stateColor, statusLabel, soc, socColor, isDischarging, isIdle) {
    const flowAriaLabel = `Energy flow: ${statusLabel}, ${chargingPower > 0.1 ? formatNumber(chargingPower, 1) + ' kilowatts' : 'idle'}${soc != null ? ', vehicle at ' + soc + ' percent' : ''}`;
    return html`
      <div class="ev-media">
        <svg class="ev-flow-display"
             viewBox="0 0 200 200"
             role="img"
             aria-label="${flowAriaLabel}">
          <!-- Flow direction chevrons -->
          ${isIdle ? html`
            <g class="ev-flow-idle">
              <line x1="65" y1="60" x2="85" y2="60" stroke="var(--lcars-lilac)" stroke-width="3" stroke-linecap="round" />
              <line x1="90" y1="60" x2="110" y2="60" stroke="var(--lcars-lilac)" stroke-width="3" stroke-linecap="round" />
              <line x1="115" y1="60" x2="135" y2="60" stroke="var(--lcars-lilac)" stroke-width="3" stroke-linecap="round" />
            </g>
          ` : html`
            <g class="ev-flow-chevrons"
               transform="${isDischarging ? 'rotate(180, 100, 60)' : ''}">
              <polyline class="ev-flow-chevron" points="70,40 100,55 130,40"
                fill="none" stroke="${stateColor}" stroke-width="3"
                stroke-linecap="round" stroke-linejoin="round" style="--chevron-delay: 0" />
              <polyline class="ev-flow-chevron" points="70,52 100,67 130,52"
                fill="none" stroke="${stateColor}" stroke-width="3"
                stroke-linecap="round" stroke-linejoin="round" style="--chevron-delay: 1" />
              <polyline class="ev-flow-chevron" points="70,64 100,79 130,64"
                fill="none" stroke="${stateColor}" stroke-width="3"
                stroke-linecap="round" stroke-linejoin="round" style="--chevron-delay: 2" />
            </g>
          `}

          <!-- Power readout -->
          <text x="100" y="110" text-anchor="middle" dominant-baseline="middle"
                fill="${stateColor}" font-family="var(--lcars-font)" font-size="32">
            ${chargingPower > 0.1 ? `${formatNumber(chargingPower, 1)} KW` : ''}
          </text>

          <!-- Status label -->
          <text x="100" y="128" text-anchor="middle" dominant-baseline="middle"
                fill="var(--lcars-space-white)" font-family="var(--lcars-font)" font-size="11">
            ${statusLabel}
          </text>

          <!-- SoC percentage -->
          <text x="100" y="155" text-anchor="middle" dominant-baseline="middle"
                fill="${socColor}" font-family="var(--lcars-font)" font-size="26">
            ${soc != null ? `${soc}%` : '--'}
          </text>

          <!-- SoC bar background -->
          <rect x="45" y="168" width="110" height="8" rx="4"
                fill="var(--lcars-gray)" opacity="0.3" />
          <!-- SoC bar fill -->
          <rect x="45" y="168"
                width="${soc != null ? Math.max(0, Math.min(110, (soc / 100) * 110)) : 0}"
                height="8" rx="4" fill="${socColor}" />
        </svg>
      </div>
    `;
  }

  // ─── Solar Mode Strip ─────────────────────────────────────────────────────

  _renderSolarStrip(em) {
    const solarEntry = em.get('solar_mode');
    if (!solarEntry) return html``;
    const eid = solarEntry.entity?.entity_id || '';
    const currentMode = solarEntry.state?.state || '';
    const options = solarEntry.state?.attributes?.options || [];
    if (options.length === 0) return html``;
    return html`
      <div class="ev-solar-strip" role="radiogroup" aria-label="Solar charging mode">
        <span class="ev-strip-label">SOLAR MODE</span>
        ${options.map(option => html`
          <button class="ev-solar-btn"
                  role="radio"
                  aria-checked="${String(option === currentMode)}"
                  aria-label="Solar mode: ${option}"
                  @click=${() => this._setSolarMode(eid, option)}>
            <ha-icon icon="${getSolarModeIcon(option)}" aria-hidden="true"></ha-icon>
            ${String(option).toUpperCase()}
          </button>
        `)}
      </div>
    `;
  }

  _setSolarMode(entityId, option) {
    if (!this.hass || !entityId) return;
    lcarsAudio.play('switchToggle');
    this._callService('select', 'select_option', {
      entity_id: entityId,
      option: option,
    });
  }

  // ─── Aux Controls ─────────────────────────────────────────────────────────

  _renderAuxControls(em) {
    const maxCurrentEntry = em.get('max_current_number');
    const lockEntry = em.get('lock');
    if (!maxCurrentEntry && !lockEntry) return html``;

    return html`
      <div class="ev-aux-controls">
        ${maxCurrentEntry ? this._renderCurrentControl(maxCurrentEntry) : ''}
        ${lockEntry ? this._renderLockControl(lockEntry) : ''}
      </div>
    `;
  }

  _renderCurrentControl(entry) {
    const eid = entry.entity?.entity_id || '';
    const raw = entry.state?.state;
    const val = raw != null && !isNaN(raw) ? Number(raw) : null;
    const min = entry.state?.attributes?.min ?? 6;
    const max = entry.state?.attributes?.max ?? 32;
    const step = entry.state?.attributes?.step ?? 1;

    return html`
      <div class="ev-current-control" role="group" aria-label="Maximum charging current">
        <span class="ev-aux-label">MAX CURRENT</span>
        <div class="ev-current-adjuster">
          <button class="ev-adj-btn decrement"
                  aria-label="Decrease maximum charging current"
                  ?disabled=${val == null || val <= min}
                  @click=${() => this._adjustCurrent(eid, val, -step, min, max)}>
            <span aria-hidden="true">–</span>
          </button>
          <span class="ev-current-value">${val != null ? `${val}A` : '—'}</span>
          <button class="ev-adj-btn increment"
                  aria-label="Increase maximum charging current"
                  ?disabled=${val == null || val >= max}
                  @click=${() => this._adjustCurrent(eid, val, step, min, max)}>
            <span aria-hidden="true">+</span>
          </button>
        </div>
      </div>
    `;
  }

  _adjustCurrent(entityId, currentVal, delta, min, max) {
    if (!this.hass || !entityId || currentVal == null) return;
    lcarsAudio.play('climateAdjust');
    const newVal = Math.max(min, Math.min(max, currentVal + delta));
    this._callService('number', 'set_value', {
      entity_id: entityId,
      value: newVal,
    });
  }

  _renderLockControl(entry) {
    const eid = entry.entity?.entity_id || '';
    const isLocked = entry.state?.state === 'locked';
    return html`
      <div class="ev-lock-control" role="group" aria-label="Cable lock control">
        <ha-icon icon="mdi:lock" style="color: var(--lcars-data-accent, var(--lcars-sunflower))" aria-hidden="true"></ha-icon>
        <span class="ev-aux-label">CABLE LOCK</span>
        <button class="ev-lock-toggle"
                role="switch"
                aria-checked="${String(isLocked)}"
                aria-label="Cable lock: ${isLocked ? 'locked' : 'unlocked'}"
                @click=${() => this._toggleLock(eid, isLocked)}>
          ${isLocked ? 'LOCKED' : 'UNLOCKED'}
        </button>
      </div>
    `;
  }

  _toggleLock(entityId, isLocked) {
    if (!this.hass || !entityId) return;
    lcarsAudio.play('lockToggle');
    this._callService('lock', isLocked ? 'unlock' : 'lock', {
      entity_id: entityId,
    });
  }
}

if (!customElements.get('lcars-ev-charger-panel')) {
  customElements.define('lcars-ev-charger-panel', LcarsEvChargerPanel);
}
