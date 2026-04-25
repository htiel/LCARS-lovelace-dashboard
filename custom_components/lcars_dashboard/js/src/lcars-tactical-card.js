/**
 * lcars-tactical-card.js
 *
 * Tactical (Security) Dashboard — all locks, alarm panels, and security
 * binary sensors across all areas, grouped by floor → area.
 *
 * Filter: ALL / ACCESS (locks + alarms) / ZONES (binary sensors)
 * v5.0.0 — 5X-2.2
 */
import { LitElement, html, css } from 'lit-element';
import { lcarsLog, lcarsEventBus } from './lcars-helpers.js';
import { lcarsBaseStyles } from './lcars-styles.js';
import { getFloors, getAreasByFloor } from './lcars-hierarchy-utils.js';
import { getAreaEntities } from './lcars-entity-query.js';
import { isTacticalEntity, isDiagnosticEntity } from './lcars-entity-utils.js';
import { showMoreInfo } from './lcars-helpers.js';

const TAG = 'TacticalCard';
const FILTER_ALL = 'all';
const FILTER_ACCESS = 'access';
const FILTER_ZONES = 'zones';

const ACCESS_DOMAINS = new Set(['lock', 'alarm_control_panel']);
const ZONE_CLASSES = new Set(['door', 'window', 'motion', 'occupancy', 'tamper', 'safety', 'smoke', 'gas', 'vibration']);
const SAFETY_CLASSES = new Set(['smoke', 'gas', 'safety', 'tamper', 'vibration']);
const PERIMETER_CLASSES = new Set(['door', 'window']);

class LcarsTacticalCard extends LitElement {

  static get properties() {
    return {
      hass: { type: Object },
      _config: { type: Object },
      filter: { type: String },
    };
  }

  constructor() {
    super();
    this.hass = null;
    this._config = {};
    this.filter = FILTER_ALL;
    this._entityCache = new Map();
    this._onFilter = (e) => { this.filter = e.detail.filter; };
  }

  connectedCallback() {
    super.connectedCallback();
    lcarsEventBus.addEventListener('lcars-tac-filter', this._onFilter);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    lcarsEventBus.removeEventListener('lcars-tac-filter', this._onFilter);
  }

  setConfig(config) { this._config = config || {}; }

  set hass(val) {
    const old = this._hass;
    this._hass = val;
    if (val && old !== val) { this._entityCache.clear(); this.requestUpdate('hass', old); }
  }
  get hass() { return this._hass; }
  getCardSize() { return 12; }

  _getAreasWithTactical() {
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
    for (const area of noFloor) {
      const data = this._resolveArea(area);
      if (data) orphans.push(data);
    }
    if (orphans.length > 0) result.push({ floor: null, areas: orphans });
    return result;
  }

  _resolveArea(area) {
    const raw = getAreaEntities(this._hass, area.area_id, this._entityCache);
    const entities = [];
    const cameras = [];
    for (const e of raw) {
      const domain = e.entity_id.split('.')[0];
      const state = this._hass.states?.[e.entity_id];
      if (!state) continue;
      const entry = { entity: e, domain, state };
      if (isDiagnosticEntity(entry)) continue;
      // Cameras go to separate bucket
      if (domain === 'camera') {
        // Only include high-quality streams (skip low/medium/insecure variants)
        const eid = e.entity_id;
        if (!/_low$|_medium$|_insecure$/.test(eid)) cameras.push(entry);
        continue;
      }
      if (!isTacticalEntity(entry)) continue;
      entities.push(entry);
    }

    const access = entities.filter(e => ACCESS_DOMAINS.has(e.domain));
    const perimeter = entities.filter(e => e.domain === 'binary_sensor' && PERIMETER_CLASSES.has(e.state?.attributes?.device_class || ''));
    const safety = entities.filter(e => e.domain === 'binary_sensor' && SAFETY_CLASSES.has(e.state?.attributes?.device_class || ''));
    const motion = entities.filter(e => e.domain === 'binary_sensor' && (e.state?.attributes?.device_class === 'motion' || e.state?.attributes?.device_class === 'occupancy'));

    if (entities.length === 0 && cameras.length === 0) return null;
    return { area, entities, access, perimeter, safety, motion, cameras };
  }

  _getFiltered(data) {
    if (this.filter === FILTER_ACCESS) return data.access.length > 0 ? data.access : null;
    if (this.filter === FILTER_ZONES) {
      const zones = [...data.perimeter, ...data.safety, ...data.motion];
      return zones.length > 0 ? zones : null;
    }
    return [...data.entities, ...data.cameras];
  }

  /* ─── Summary ─── */

  _getGlobalSummary(floorGroups) {
    const ALARM_SEVERITY = { triggered: 5, pending: 4, armed_away: 3, armed_home: 2, armed_night: 2, armed_vacation: 2, arming: 1, disarmed: 0 };
    let alarmState = 'disarmed';
    let perimeterTotal = 0, perimeterSecure = 0;
    let safetyAlerts = 0;

    for (const { areas } of floorGroups) {
      for (const data of areas) {
        for (const e of data.access) {
          if (e.domain === 'alarm_control_panel') {
            const s = (this._hass?.states?.[e.entity?.entity_id] || e.state)?.state || 'disarmed';
            if ((ALARM_SEVERITY[s] || 0) > (ALARM_SEVERITY[alarmState] || 0)) alarmState = s;
          }
        }
        for (const e of data.perimeter) {
          perimeterTotal++;
          if ((this._hass?.states?.[e.entity?.entity_id] || e.state)?.state !== 'on') perimeterSecure++;
        }
        for (const e of data.safety) {
          if ((this._hass?.states?.[e.entity?.entity_id] || e.state)?.state === 'on') safetyAlerts++;
        }
      }
    }
    return { alarmState, perimeterTotal, perimeterSecure, safetyAlerts };
  }

  _getSummaryColor(alarmState) {
    switch (alarmState) {
      case 'armed_away': return 'var(--lcars-sunflower, #ffcc99)';
      case 'armed_home': case 'armed_night': case 'armed_vacation': return 'var(--lcars-butterscotch, #ff9966)';
      case 'triggered': case 'pending': return 'var(--lcars-tomato, #ff5555)';
      default: return 'var(--lcars-ice, #99ccff)';
    }
  }

  render() {
    if (!this._hass) return html``;
    const floorGroups = this._getAreasWithTactical();
    const summary = this._getGlobalSummary(floorGroups);
    const isTriggered = summary.alarmState === 'triggered' || summary.alarmState === 'pending';

    // Collect all cameras across areas
    const allCameras = [];
    for (const { areas } of floorGroups) {
      for (const data of areas) allCameras.push(...data.cameras);
    }

    return html`
      <div class="tac-dashboard ${isTriggered ? 'red-alert' : ''}">
        <!-- Summary Bar -->
        <div class="tac-summary" style="--summary-color:${this._getSummaryColor(summary.alarmState)}">
          <span class="tac-summary__block">
            <span class="tac-summary__label">SHIELDS</span>
            <span class="tac-summary__value">${summary.alarmState.replace(/_/g, ' ').toUpperCase()}</span>
          </span>
          <span class="tac-summary__block">
            <span class="tac-summary__label">PERIMETER</span>
            <span class="tac-summary__value">${summary.perimeterSecure}/${summary.perimeterTotal} SECURE</span>
          </span>
          <span class="tac-summary__block">
            <span class="tac-summary__label">SENSORS</span>
            <span class="tac-summary__value">${summary.safetyAlerts === 0 ? 'ALL CLEAR' : summary.safetyAlerts + ' ALERTS'}</span>
          </span>
          ${allCameras.length > 0 ? html`
            <span class="tac-summary__block">
              <span class="tac-summary__label">VIEWSCREENS</span>
              <span class="tac-summary__value">${allCameras.filter(e => (this._hass?.states?.[e.entity?.entity_id] || e.state)?.state !== 'unavailable').length}/${allCameras.length} ACTIVE</span>
            </span>
          ` : ''}
        </div>

        <!-- Camera Grid -->
        ${allCameras.length > 0 && this.filter !== FILTER_ZONES ? html`
          <div class="tac-camera-grid">
            ${allCameras.map(e => this._renderCamera(e))}
          </div>
        ` : ''}

        <!-- Area Sections (entities only, cameras shown in grid above) -->
        ${floorGroups.map(({ floor, areas }) => {
          const visible = areas.filter(a => a.entities.length > 0 && this._getFiltered(a) !== null);
          if (visible.length === 0) return html``;
          return html`
            ${floor ? html`<div class="tac-floor-header"><span class="tac-floor-name">${floor.name || 'FLOOR'}</span><span class="tac-floor-line"></span></div>` : ''}
            ${visible.map(data => html`
              <div class="tac-area-section">
                <div class="tac-area-header">
                  <span class="tac-area-name">${data.area.name}</span>
                  <span class="tac-area-line"></span>
                </div>
                <div class="tac-devices">
                  ${this._getSortedDevices(data).map(e => this._renderDevice(e))}
                </div>
              </div>
            `)}
          `;
        })}
        ${floorGroups.length === 0 ? html`<div class="tac-empty"><span>NO TACTICAL DEVICES DETECTED</span></div>` : ''}
      </div>
    `;
  }

  _getSortedDevices(data) {
    const filtered = this.filter === FILTER_ACCESS ? data.access
      : this.filter === FILTER_ZONES ? [...data.perimeter, ...data.safety, ...data.motion]
      : data.entities;
    // Sort: active/open items first
    return [...filtered].sort((a, b) => {
      const aActive = this._isActive(a.domain, this._hass?.states?.[a.entity?.entity_id] || a.state) ? 0 : 1;
      const bActive = this._isActive(b.domain, this._hass?.states?.[b.entity?.entity_id] || b.state) ? 0 : 1;
      return aActive - bActive;
    });
  }

  _renderCamera(entry) {
    const eid = entry.entity?.entity_id;
    const state = this._hass?.states?.[eid] || entry.state;
    const name = (state?.attributes?.friendly_name || eid || '').toUpperCase();
    const imgUrl = state?.attributes?.entity_picture;
    const motionEid = eid.replace('camera.', 'binary_sensor.').replace(/_high$/, '_motion');
    const hasMotion = this._hass?.states?.[motionEid]?.state === 'on';

    return html`
      <div class="tac-camera ${hasMotion ? 'motion' : ''}"
           @click=${() => showMoreInfo(eid)}
           role="button" tabindex="0" aria-label="${name}">
        ${imgUrl ? html`<img src="${imgUrl}" alt="${name}" loading="lazy">` : html`<div class="tac-camera__placeholder"><ha-icon .icon=${'mdi:camera'} style="--mdc-icon-size:32px"></ha-icon></div>`}
        <span class="tac-camera__label">${name}</span>
      </div>
    `;
  }

  _renderDevice(entry) {
    const eid = entry.entity?.entity_id;
    const state = this._hass?.states?.[eid] || entry.state;
    const name = (state?.attributes?.friendly_name || eid || '').toUpperCase();
    const dc = state?.attributes?.device_class || '';
    const isActive = this._isActive(entry.domain, state);

    // Door/window sensors: SEALED/BREACH labels
    if (entry.domain === 'binary_sensor' && PERIMETER_CLASSES.has(dc)) {
      return html`
        <button class="tac-pill ${isActive ? 'breach' : 'sealed'}"
                aria-label="${name} — ${isActive ? 'BREACH' : 'SEALED'}"
                @click=${() => showMoreInfo(eid)}>
          <ha-icon .icon=${this._getIcon(entry.domain, dc, state)} style="--mdc-icon-size:18px"></ha-icon>
          <span class="tac-pill__name">${name}</span>
          <span class="tac-pill__state">${isActive ? 'BREACH' : 'SEALED'}</span>
        </button>
      `;
    }

    // Smoke/gas/safety: ⚠ prefix when active
    if (entry.domain === 'binary_sensor' && SAFETY_CLASSES.has(dc)) {
      return html`
        <button class="tac-pill ${isActive ? 'alert' : 'clear'}"
                aria-label="${name} — ${isActive ? 'ALERT' : 'CLEAR'}"
                @click=${() => showMoreInfo(eid)}>
          <ha-icon .icon=${this._getIcon(entry.domain, dc, state)} style="--mdc-icon-size:18px"></ha-icon>
          <span class="tac-pill__name">${isActive ? '⚠ ' : ''}${name}</span>
          <span class="tac-pill__state">${isActive ? 'ALERT' : 'CLEAR'}</span>
        </button>
      `;
    }

    // Motion: dot indicator
    if (entry.domain === 'binary_sensor' && (dc === 'motion' || dc === 'occupancy')) {
      return html`
        <div class="tac-motion ${isActive ? 'detected' : ''}"
             @click=${() => showMoreInfo(eid)}>
          <span class="tac-motion__dot"></span>
          <span class="tac-motion__name">${name}</span>
        </div>
      `;
    }

    // Lock/alarm: standard pill
    return html`
      <button class="tac-pill ${isActive ? 'active' : 'inactive'} ${entry.domain}"
              aria-label="${name} — ${(state?.state || '').toUpperCase()}"
              @click=${() => showMoreInfo(eid)}>
        <ha-icon .icon=${this._getIcon(entry.domain, dc, state)} style="--mdc-icon-size:18px"></ha-icon>
        <span class="tac-pill__name">${name}</span>
        <span class="tac-pill__state">${(state?.state || 'unknown').replace(/_/g, ' ').toUpperCase()}</span>
      </button>
    `;
  }

  _isActive(domain, state) {
    if (domain === 'lock') return state?.state === 'unlocked';
    if (domain === 'alarm_control_panel') return state?.state !== 'disarmed';
    if (domain === 'binary_sensor') return state?.state === 'on';
    return false;
  }

  _getIcon(domain, dc, state) {
    if (domain === 'lock') return state?.state === 'locked' ? 'mdi:lock' : 'mdi:lock-open';
    if (domain === 'alarm_control_panel') return 'mdi:shield';
    if (dc === 'door') return state?.state === 'on' ? 'mdi:door-open' : 'mdi:door-closed';
    if (dc === 'window') return state?.state === 'on' ? 'mdi:window-open' : 'mdi:window-closed';
    if (dc === 'motion' || dc === 'occupancy') return 'mdi:motion-sensor';
    if (dc === 'smoke') return 'mdi:smoke-detector';
    if (dc === 'gas') return 'mdi:gas-cylinder';
    return 'mdi:shield-alert';
  }

  static get styles() {
    return [
      lcarsBaseStyles,
      css`
        :host { display: block; }
        .tac-dashboard { padding: 0.25rem; }

        /* ─── Summary Bar ─── */
        .tac-summary {
          display: flex; gap: 0.25rem; margin-bottom: 0.75rem;
          background: var(--summary-color, var(--lcars-ice)); border-radius: 0.5rem;
          padding: 0.5rem 1rem; color: var(--lcars-black, #000);
          font-family: var(--lcars-font, 'Antonio', sans-serif); text-transform: uppercase;
        }
        .tac-summary__block { flex: 1; display: flex; flex-direction: column; gap: 0.125rem; }
        .tac-summary__label { font-size: 0.625rem; letter-spacing: 0.1em; opacity: 0.6; }
        .tac-summary__value { font-size: 1rem; font-variant-numeric: tabular-nums; }

        /* ─── Red Alert ─── */
        .red-alert .tac-summary { animation: redAlert 1s ease-in-out infinite; }
        @keyframes redAlert { 0%, 100% { background: var(--lcars-tomato, #ff5555); } 50% { background: var(--lcars-bg, #000); color: var(--lcars-tomato, #ff5555); } }
        @media (prefers-reduced-motion: reduce) { .red-alert .tac-summary { animation: none; background: var(--lcars-tomato, #ff5555); } }

        /* ─── Camera Grid ─── */
        .tac-camera-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(min(16rem, 100%), 1fr));
          gap: 0.375rem; margin-bottom: 0.75rem;
        }
        .tac-camera {
          position: relative; border-radius: 0.25rem; overflow: hidden;
          cursor: pointer; border: 2px solid var(--lcars-butterscotch, #ff9966);
          aspect-ratio: 16/9; background: var(--lcars-bg, #000);
        }
        .tac-camera.motion { border-color: var(--lcars-tomato, #ff5555); }
        .tac-camera img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .tac-camera__placeholder { display: flex; align-items: center; justify-content: center; height: 100%; color: var(--lcars-gray, #666688); }
        .tac-camera__label {
          position: absolute; bottom: 0; left: 0; right: 0;
          padding: 0.25rem 0.5rem; font-family: var(--lcars-font, 'Antonio', sans-serif);
          font-size: 0.75rem; color: var(--lcars-space-white, #f5f6fa);
          background: rgba(0,0,0,0.6); text-transform: uppercase;
        }
        .tac-camera:focus-visible { outline: 2px solid var(--lcars-ice, #99ccff); outline-offset: 2px; }

        /* ─── Floor / Area ─── */
        .tac-floor-header { display: flex; align-items: center; gap: 0.5rem; margin: 1rem 0 0.5rem 0; }
        .tac-floor-name { font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 1.25rem; color: var(--lcars-ice, #99ccff); text-transform: uppercase; letter-spacing: 0.08em; white-space: nowrap; }
        .tac-floor-line { flex: 1; height: 0.375rem; background: var(--lcars-ice, #99ccff); border-radius: 0 1.5rem 1.5rem 0; opacity: 0.4; }
        .tac-area-section { margin-bottom: 0.75rem; }
        .tac-area-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem; }
        .tac-area-name { font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 1.25rem; color: var(--lcars-ice, #99ccff); text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap; }
        .tac-area-line { flex: 1; height: 2px; background: var(--lcars-ice, #99ccff); opacity: 0.3; }
        .tac-devices { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(16rem, 100%), 1fr)); gap: 0.375rem; }

        /* ─── Pill Base ─── */
        .tac-pill {
          display: flex; align-items: center; gap: 0.5rem; height: 3rem;
          padding: 0 1rem 0 0.75rem;
          border-radius: 0 var(--lcars-btn-radius, 1.5rem) var(--lcars-btn-radius, 1.5rem) 0;
          font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 1rem;
          text-transform: uppercase; cursor: pointer;
          border: 1px solid rgba(153, 204, 255, 0.2);
          transition: filter 200ms ease; width: 100%; text-align: left;
        }
        .tac-pill:hover { filter: brightness(1.2); }
        .tac-pill:focus-visible { outline: 2px solid var(--lcars-ice, #99ccff); outline-offset: 2px; }
        .tac-pill__name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .tac-pill__state { font-variant-numeric: tabular-nums; min-width: 3.5rem; text-align: right; flex-shrink: 0; }

        /* Door/Window: SEALED (ice) / BREACH (tomato) */
        .tac-pill.sealed { background: var(--lcars-ice, #99ccff); color: var(--lcars-black, #000); }
        .tac-pill.breach { background: var(--lcars-tomato, #ff5555); color: var(--lcars-black, #000); }

        /* Smoke/Safety: CLEAR (gray) / ALERT (tomato + ⚠) */
        .tac-pill.clear { background: var(--lcars-gray, #666688); color: var(--lcars-space-white, #f5f6fa); border-color: rgba(102,102,136,0.3); }
        .tac-pill.alert { background: var(--lcars-tomato, #ff5555); color: var(--lcars-black, #000); }

        /* Lock/Alarm */
        .tac-pill.inactive { background: var(--lcars-gray, #666688); color: var(--lcars-space-white, #f5f6fa); border-color: rgba(102,102,136,0.3); }
        .tac-pill.active.lock { background: var(--lcars-tomato, #ff5555); color: var(--lcars-black, #000); }
        .tac-pill.active.alarm_control_panel { background: var(--lcars-gold, #ffaa00); color: var(--lcars-black, #000); }

        /* ─── Motion Dot ─── */
        .tac-motion {
          display: flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0.75rem;
          cursor: pointer; font-family: var(--lcars-font, 'Antonio', sans-serif);
          font-size: 0.875rem; text-transform: uppercase; color: var(--lcars-gray, #666688);
        }
        .tac-motion.detected { color: var(--lcars-sunflower, #ffcc99); }
        .tac-motion__dot {
          width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
          background: var(--lcars-gray, #666688); transition: background 200ms ease;
        }
        .tac-motion.detected .tac-motion__dot { background: var(--lcars-sunflower, #ffcc99); }
        .tac-motion__name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

        .tac-empty { display: flex; align-items: center; justify-content: center; min-height: 10rem; color: var(--lcars-gray, #666688); font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 1.25rem; text-transform: uppercase; }
      `,
    ];
  }
}

if (!customElements.get('tactical-card')) {
  customElements.define('tactical-card', LcarsTacticalCard);
}
