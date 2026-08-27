/**
 * lcars-tactical-card.js — v5.1.0 Phase 1: Tactical Dashboard Redesign
 *
 * Perimeter schematic with radial arc sensor nodes, shield core,
 * camera viewscreen array with detection hierarchy, lock status bar,
 * sensor timeline, structural LCARS bars.
 *
 * Designed by Wesley (creative), Geordi (LCARS), Worf (security ops).
 * 5-round collaborative design — 30 approved features (F-01 through F-30).
 * Phase 1: Foundation (Cruise mode, perimeter, shield, cameras, locks)
 */
import { LitElement, html, css, svg } from 'lit-element';
import { lcarsLog, lcarsEventBus, showMoreInfo, defineLcars } from './lcars-helpers.js';
import { lcarsBaseStyles } from './lcars-styles.js';
import { getFloors, getAreasByFloor } from './lcars-hierarchy-utils.js';
import { getAreaEntities } from './lcars-entity-query.js';
import { isTacticalEntity, isDiagnosticEntity } from './lcars-entity-utils.js';
import { lcarsAudio } from './lcars-audio.js';
import { renderRingGauge } from './lcars-ring-gauge.js';
import './lcars-camera-tile.js';
import './lcars-tactical-chronicle.js';

const TAG = 'TacticalCard';

/* ─── Entity Classification Constants ─── */
const ACCESS_DOMAINS = new Set(['lock', 'alarm_control_panel']);
const PERIMETER_CLASSES = new Set(['door', 'window', 'garage_door']);
const SAFETY_CLASSES = new Set(['smoke', 'gas', 'safety', 'tamper', 'vibration', 'carbon_monoxide', 'heat']);
const MOTION_CLASSES = new Set(['motion', 'occupancy']);
const ALARM_SEVERITY = { triggered: 5, pending: 4, armed_away: 3, armed_night: 2, armed_home: 2, armed_vacation: 2, arming: 1, disarmed: 0 };

/* #143 — Lock state tri-state mapping (secure / unsecure / fault).
 * Covers Z-Wave (jammed), Schlage Encode (error→unknown), August (unknown-during-sync),
 * door-position sensors that expose open/opening, and unavailable integrations. */
const LOCK_STATE_MAP = {
  locked:    { tier: 'secure',   label: 'ENGAGED',     icon: 'mdi:lock' },
  locking:   { tier: 'pending',  label: 'LOCKING',     icon: 'mdi:lock-clock' },
  unlocked:  { tier: 'unsecure', label: 'UNSECURED',   icon: 'mdi:lock-open' },
  unlocking: { tier: 'pending',  label: 'UNLOCKING',   icon: 'mdi:lock-clock' },
  jammed:    { tier: 'fault',    label: 'JAMMED',      icon: 'mdi:lock-alert' },
  open:      { tier: 'fault',    label: 'DOOR OPEN',   icon: 'mdi:door-open' },
  opening:   { tier: 'fault',    label: 'OPENING',     icon: 'mdi:door-open' },
  unavailable: { tier: 'fault', label: 'OFFLINE',     icon: 'mdi:lock-off' },
  unknown:   { tier: 'fault',    label: 'UNKNOWN',     icon: 'mdi:lock-question' },
};
function _resolveLockState(stateVal) {
  return LOCK_STATE_MAP[stateVal] || LOCK_STATE_MAP.unknown;
}

/* ─── Perimeter Zone Heuristics (F-01) ─── */
const ZONE_PATTERNS = [
  { re: /front|entry|porch|foyer/i, zone: 'FRONT', angle: 0 },
  { re: /garage|driveway|carport/i, zone: 'GARAGE', angle: 45 },
  { re: /side|lateral/i, zone: 'SIDE', angle: 90 },
  { re: /back|rear|patio|deck/i, zone: 'BACK', angle: 180 },
  { re: /yard|garden|pool/i, zone: 'YARD', angle: 225 },
  { re: /basement|cellar|crawl/i, zone: 'LOWER', angle: 270 },
];

function _zoneForArea(areaName) {
  for (const p of ZONE_PATTERNS) {
    if (p.re.test(areaName)) return p;
  }
  return null;
}

/* ─── SVG Arc Utilities (U-02) ─── */
function _polarToCart(cx, cy, r, angleDeg) {
  const rad = (angleDeg - 90) * Math.PI / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function _describeArc(cx, cy, r, startAngle, endAngle) {
  const s = _polarToCart(cx, cy, r, startAngle);
  const e = _polarToCart(cx, cy, r, endAngle);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
}

/* ─── Detection State (F-09) ─── */
const DETECT_IDLE = 0, DETECT_MOTION = 1, DETECT_VEHICLE = 2, DETECT_PERSON = 3;
const DETECT_COLORS = {
  [DETECT_IDLE]: 'var(--lcars-butterscotch, #ff9966)',
  [DETECT_MOTION]: 'var(--lcars-sunflower, #ffcc99)',
  [DETECT_VEHICLE]: 'var(--lcars-butterscotch, #ff9966)',
  [DETECT_PERSON]: 'var(--lcars-tomato, #ff5555)',
};
const DETECT_SCALE = { [DETECT_IDLE]: 1, [DETECT_MOTION]: 1.15, [DETECT_VEHICLE]: 1.15, [DETECT_PERSON]: 1.25 };
const DETECT_HOLD = { [DETECT_MOTION]: 10000, [DETECT_VEHICLE]: 15000, [DETECT_PERSON]: 30000 };
const DETECT_GLOW = {
  [DETECT_MOTION]: '0 0 12px rgba(255,204,153,0.5)',
  [DETECT_VEHICLE]: '0 0 12px rgba(255,153,102,0.5)',
  [DETECT_PERSON]: '0 0 16px rgba(255,85,85,0.6)',
};

class LcarsTacticalCard extends LitElement {

  static get properties() {
    return {
      hass: { type: Object }, _config: { type: Object },
      _mode: { type: String },           // 'cruise' | 'tactical' | 'redalert'
      _cameraStates: { type: Object },   // Map<entityId, { level, timer, lastUpdate }>
      _focusedCamera: { type: String },   // entity_id of main viewscreen camera
      _patrolActive: { type: Boolean },
      _patrolIndex: { type: Number },
      _filter: { type: String },          // #144 — 'all'|'access'|'zones' driven by sidebar
    };
  }

  constructor() {
    super();
    this._hass = null; this._config = {};
    this._mode = 'cruise';
    this._cameraStates = new Map();
    this._focusedCamera = null;
    this._patrolActive = false; this._patrolIndex = 0;
    this._patrolTimer = null;
    this._entityCache = new Map();
    this._ringBuffer = [];   // approach path (F-18)
    this._soundCooldowns = new Map();
    this._cascadeFirstTime = 0;
    this._cascadeSoundCount = 0;
    this._lockAllPending = false;
    this._cameraFilter = 'all';  // 'all' | 'exterior' | 'interior'
    this._filter = 'all';        // #144 — sidebar filter ALL/ACCESS/ZONES
    this._onSidebarFilter = (e) => {
      const f = e?.detail?.filter;
      if (f === 'all' || f === 'access' || f === 'zones' || f === 'chronicle') {
        this._filter = f;
        this.requestUpdate();
      }
    };
  }

  setConfig(config) { this._config = config || {}; }

  set hass(val) {
    const old = this._hass;
    this._hass = val;
    if (val && old !== val) {
      this._entityCache.clear();
      this._updateDetectionStates();
      this._updateMode();
      this.requestUpdate('hass', old);
    }
  }
  get hass() { return this._hass; }
  getCardSize() { return 16; }

  connectedCallback() {
    super.connectedCallback();
    // #144 — honor the sidebar's ALL/ACCESS/ZONES filter contract
    lcarsEventBus.addEventListener('lcars-tac-filter', this._onSidebarFilter);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    lcarsEventBus.removeEventListener('lcars-tac-filter', this._onSidebarFilter);
    if (this._patrolTimer) { clearInterval(this._patrolTimer); this._patrolTimer = null; }
    // Clear detection hold timers
    for (const [, cs] of this._cameraStates) { if (cs.timer) clearTimeout(cs.timer); }
    this._cameraStates.clear();
    this._ringBuffer.length = 0;
  }

  /* ═══ Entity Discovery (reused from existing) ═══ */
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
    const entities = [], cameras = [], locks = [], persons = [];
    for (const e of raw) {
      const domain = e.entity_id.split('.')[0];
      const state = this._hass.states?.[e.entity_id];
      if (!state) continue;
      const entry = { entity: e, domain, state };
      if (isDiagnosticEntity(entry)) continue;
      if (domain === 'camera') {
        if (!/_low$|_medium$|_insecure$/.test(e.entity_id)) cameras.push(entry);
        continue;
      }
      if (domain === 'lock') { locks.push(entry); entities.push(entry); continue; }
      if (!isTacticalEntity(entry)) continue;
      entities.push(entry);
    }
    const perimeter = entities.filter(e => e.domain === 'binary_sensor' && PERIMETER_CLASSES.has(e.state?.attributes?.device_class || ''));
    const safety = entities.filter(e => e.domain === 'binary_sensor' && SAFETY_CLASSES.has(e.state?.attributes?.device_class || ''));
    const motion = entities.filter(e => e.domain === 'binary_sensor' && MOTION_CLASSES.has(e.state?.attributes?.device_class || ''));
    const access = entities.filter(e => ACCESS_DOMAINS.has(e.domain));
    if (entities.length === 0 && cameras.length === 0) return null;
    return { area, entities, access, perimeter, safety, motion, cameras, locks };
  }

  /* ═══ Global Summary (F-02, F-19) ═══ */
  _getGlobalSummary(floorGroups) {
    let alarmState = 'disarmed', perimeterTotal = 0, perimeterSecure = 0, safetyAlerts = 0;
    let locksTotal = 0, locksLocked = 0;
    let safetyTotal = 0;
    let alarmEntityId = null;
    const allCameras = [], allLocks = [], allPersons = [];

    for (const { areas } of floorGroups) {
      for (const data of areas) {
        for (const e of data.access) {
          if (e.domain === 'alarm_control_panel') {
            const s = (this._hass?.states?.[e.entity?.entity_id] || e.state)?.state || 'disarmed';
            if ((ALARM_SEVERITY[s] || 0) > (ALARM_SEVERITY[alarmState] || 0)) {
              alarmState = s;
              alarmEntityId = e.entity?.entity_id;
            }
          }
        }
        for (const e of data.perimeter) {
          perimeterTotal++;
          if ((this._hass?.states?.[e.entity?.entity_id] || e.state)?.state !== 'on') perimeterSecure++;
        }
        for (const e of data.safety) {
          safetyTotal++;
          if ((this._hass?.states?.[e.entity?.entity_id] || e.state)?.state === 'on') safetyAlerts++;
        }
        allCameras.push(...data.cameras);
        if (data.locks) {
          for (const l of data.locks) {
            locksTotal++;
            // #143 — count only confirmed 'locked'; jammed/open/unavailable count as unsecure.
            const lockStateVal = (this._hass?.states?.[l.entity?.entity_id] || l.state)?.state;
            if (lockStateVal === 'locked') locksLocked++;
            allLocks.push(l);
          }
        }
      }
    }
    // Person entities (F-22)
    if (this._hass?.states) {
      for (const [eid, s] of Object.entries(this._hass.states)) {
        if (eid.startsWith('person.')) allPersons.push({ entity_id: eid, state: s });
      }
    }
    return { alarmState, alarmEntityId, perimeterTotal, perimeterSecure, safetyAlerts, safetyTotal,
             locksTotal, locksLocked, allCameras, allLocks, allPersons };
  }

  _getSummaryColor(alarmState) {
    switch (alarmState) {
      case 'armed_away': return 'var(--lcars-sunflower, #ffcc99)';
      case 'armed_home': case 'armed_night': case 'armed_vacation': return 'var(--lcars-butterscotch, #ff9966)';
      case 'triggered': case 'pending': return 'var(--lcars-tomato, #ff5555)';
      default: return 'var(--lcars-ice, #99ccff)';
    }
  }

  /* ═══ Mode Management (F-05, F-06) ═══ */
  _updateMode() {
    if (!this._hass) return;
    // Find alarm state
    let alarmState = 'disarmed';
    const states = this._hass.states || {};
    for (const [eid, s] of Object.entries(states)) {
      if (eid.startsWith('alarm_control_panel.')) {
        const st = s.state || 'disarmed';
        if ((ALARM_SEVERITY[st] || 0) > (ALARM_SEVERITY[alarmState] || 0)) alarmState = st;
      }
    }
    if (alarmState === 'triggered' || alarmState === 'pending') {
      this._mode = 'redalert';
    } else if (alarmState !== 'disarmed') {
      this._mode = 'tactical';
    } else {
      this._mode = 'cruise';
    }
  }

  /* ═══ Camera Detection State Machine (F-09, F-10, F-12) ═══ */
  _updateDetectionStates() {
    if (!this._hass) return;
    const states = this._hass.states || {};
    const entities = this._hass.entities || {};

    // Build camera entity_id set for quick lookup
    const cameraEids = new Set();
    for (const eid of Object.keys(states)) {
      if (eid.startsWith('camera.') && !/_low$|_medium$|_insecure$/.test(eid)) {
        cameraEids.add(eid);
      }
    }

    // For each camera, find paired detection binary sensors by device_id
    for (const camEid of cameraEids) {
      const camEntity = entities[camEid];
      if (!camEntity?.device_id) continue;

      // Find all binary sensors on same device
      let hasPersonDetection = false;
      let hasVehicleDetection = false;
      let hasMotionDetection = false;

      for (const [eid, s] of Object.entries(states)) {
        if (!eid.startsWith('binary_sensor.') || s.state !== 'on') continue;
        const e = entities[eid];
        if (!e || e.device_id !== camEntity.device_id) continue;

        // Check by entity_id pattern (UniFi Protect naming)
        if (/_person_detected$/.test(eid)) hasPersonDetection = true;
        else if (/_vehicle_detected$/.test(eid)) hasVehicleDetection = true;
        else if (/_motion$|_motion_detected$/.test(eid)) hasMotionDetection = true;
        // Also check device_class
        else if (s.attributes?.device_class === 'motion' || s.attributes?.device_class === 'occupancy') hasMotionDetection = true;
      }

      // Escalate camera to highest detected level
      if (hasPersonDetection) this._escalateCamera(camEid, DETECT_PERSON);
      else if (hasVehicleDetection) this._escalateCamera(camEid, DETECT_VEHICLE);
      else if (hasMotionDetection) this._escalateCamera(camEid, DETECT_MOTION);
    }
  }

  _escalateCamera(camEid, level) {
    const current = this._cameraStates.get(camEid);
    if (current && current.level >= level) return; // escalate-only
    // Clear existing timer
    if (current?.timer) clearTimeout(current.timer);
    const holdMs = DETECT_HOLD[level] || 10000;
    const timer = setTimeout(() => {
      this._cameraStates.delete(camEid);
      this.requestUpdate();
    }, holdMs);
    this._cameraStates.set(camEid, { level, timer, lastUpdate: Date.now() });
    // Ring buffer (F-18)
    this._ringBuffer.push({ camEid, level, time: Date.now() });
    if (this._ringBuffer.length > 50) this._ringBuffer.shift();
    // Sound dispatch (F-13)
    this._dispatchDetectionSound(camEid, level);
    // Auto-switch viewscreen (F-24)
    if (level >= DETECT_PERSON || (level >= DETECT_MOTION && this._mode !== 'cruise')) {
      this._focusedCamera = camEid;
    }
    this.requestUpdate();
  }

  _dispatchDetectionSound(camEid, level) {
    if (level < DETECT_VEHICLE) return; // Only person + vehicle trigger sounds
    const now = Date.now();
    // Per-camera cooldown
    const lastSound = this._soundCooldowns.get(camEid) || 0;
    if (now - lastSound < 10000) return;
    // Cascade logic: max 2 sounds per 60s cascade
    if (now - this._cascadeFirstTime > 60000) {
      this._cascadeFirstTime = now;
      this._cascadeSoundCount = 0;
    }
    if (this._cascadeSoundCount >= 2) return;
    this._cascadeSoundCount++;
    this._soundCooldowns.set(camEid, now);
    if (level === DETECT_PERSON) lcarsAudio.play('alert');
    else if (level === DETECT_VEHICLE) lcarsAudio.play('doorEvent');
  }

  _getCameraDetection(camEid) {
    return this._cameraStates.get(camEid) || null;
  }

  /* ═══ Perimeter Schematic (F-01) — Tiered: outer perimeter + inner motion ═══ */
  _renderPerimeter(floorGroups, summary) {
    const cx = 150, cy = 150, sensorR = 100, shieldR = 120, innerR = 45;
    const outerZones = [], innerZones = [];
    const usedAngles = new Set();
    let fallbackIdx = 0;
    const allAreas = [];
    for (const { areas } of floorGroups) {
      for (const data of areas) allAreas.push(data);
    }

    // Classify: outer (has door/window sensors) vs inner (motion-only)
    for (const data of allAreas) {
      const hasPerimeter = data.perimeter.length > 0;
      const hasMotion = data.motion.length > 0;
      if (!hasPerimeter && !hasMotion && data.cameras.length === 0) continue;

      const zp = _zoneForArea(data.area.name);
      const hasBreaches = data.perimeter.some(e => (this._hass?.states?.[e.entity?.entity_id] || e.state)?.state === 'on');
      const hasActiveMotion = data.motion.some(e => (this._hass?.states?.[e.entity?.entity_id] || e.state)?.state === 'on');

      if (hasPerimeter) {
        // OUTER ring — entry-point areas
        let angle = zp ? zp.angle : null;
        const zoneName = zp ? zp.zone : data.area.name.substring(0, 5).toUpperCase();
        if (angle != null) {
          while (usedAngles.has(Math.round(angle))) angle += 30;
        } else {
          angle = (fallbackIdx * (360 / Math.max(allAreas.length, 6))) % 360;
          fallbackIdx++;
          while (usedAngles.has(Math.round(angle))) angle += 20;
        }
        usedAngles.add(Math.round(angle));
        outerZones.push({ name: zoneName, angle, area: data.area, perimeter: data.perimeter,
                          motion: data.motion, hasBreaches, hasMotion: hasActiveMotion });
      } else if (hasMotion) {
        // INNER field — interior motion-only areas
        const abbr = data.area.name.substring(0, 3).toUpperCase();
        innerZones.push({ name: abbr, area: data.area, motion: data.motion, hasMotion: hasActiveMotion });
      }
    }

    // Distribute inner zones evenly around the inner ring
    const innerAngleStep = innerZones.length > 0 ? 360 / innerZones.length : 0;
    innerZones.forEach((z, i) => { z.angle = i * innerAngleStep; });

    const isArmed = summary.alarmState !== 'disarmed';
    const shieldColor = this._getSummaryColor(summary.alarmState);
    const personsHome = summary.allPersons.filter(p => p.state?.state === 'home').length;

    return html`
      <div class="tac-perimeter">
        <svg viewBox="0 0 300 300" class="tac-perimeter-svg" role="img"
             aria-label="Perimeter schematic: ${summary.perimeterSecure}/${summary.perimeterTotal} secure">
          <!-- Shield arcs (F-28, only when armed) -->
          ${isArmed ? svg`
            <path d="${_describeArc(cx, cy, shieldR, 10, 80)}" class="tac-shield-arc" style="stroke:${shieldColor}" />
            <path d="${_describeArc(cx, cy, shieldR, 100, 170)}" class="tac-shield-arc" style="stroke:${shieldColor}" />
            <path d="${_describeArc(cx, cy, shieldR, 190, 260)}" class="tac-shield-arc" style="stroke:${shieldColor}" />
            <path d="${_describeArc(cx, cy, shieldR, 280, 350)}" class="tac-shield-arc" style="stroke:${shieldColor}" />
          ` : ''}

          <!-- Sensor ring arcs (OUTER — perimeter zones with door/window sensors) -->
          ${outerZones.map((z, i) => {
            const startA = z.angle - 20;
            const endA = z.angle + 20;
            const nodeColor = z.hasBreaches ? 'var(--lcars-tomato)' : z.hasMotion ? 'var(--lcars-sunflower)' : 'var(--lcars-ice)';
            const nodePos = _polarToCart(cx, cy, sensorR, z.angle);
            return svg`
              <path d="${_describeArc(cx, cy, sensorR, startA, endA)}"
                    class="tac-sensor-arc ${z.hasMotion ? 'motion-flash' : ''}"
                    style="stroke:${nodeColor}" />
              <circle cx="${nodePos.x}" cy="${nodePos.y}" r="6" fill="${nodeColor}"
                      class="tac-sensor-node ${z.hasBreaches ? 'breach' : ''}"
                      @click=${() => showMoreInfo(z.perimeter[0]?.entity?.entity_id || z.motion[0]?.entity?.entity_id)} />
              <text x="${_polarToCart(cx, cy, sensorR + 20, z.angle).x}"
                    y="${_polarToCart(cx, cy, sensorR + 20, z.angle).y}"
                    class="tac-zone-label"
                    text-anchor="${z.angle > 45 && z.angle < 180 ? 'start' : z.angle > 180 && z.angle < 315 ? 'end' : 'middle'}"
                    dominant-baseline="central">${z.name}</text>
            `;
          })}

          <!-- Interior motion pills (INNER — motion-only areas, labels hidden when idle) -->
          ${innerZones.map(z => {
            const pos = _polarToCart(cx, cy, innerR, z.angle);
            const color = z.hasMotion ? 'var(--lcars-sunflower)' : 'var(--lcars-gray)';
            return svg`
              <rect x="${pos.x - 4}" y="${pos.y - 2}" width="8" height="4" rx="2"
                    fill="${color}" class="tac-inner-pip ${z.hasMotion ? 'active' : ''}"
                    @click=${() => showMoreInfo(z.motion[0]?.entity?.entity_id)} />
              ${z.hasMotion ? svg`
                <text x="${pos.x}" y="${pos.y + 10}" class="tac-inner-label"
                      text-anchor="middle" dominant-baseline="central">${z.name}</text>
              ` : ''}
            `;
          })}

          <!-- Shield Core (F-02) — tap to arm/disarm -->
          <g class="tac-shield-core-group" tabindex="0" role="button"
             aria-label="Alarm: ${summary.alarmState.replace(/_/g, ' ')}. Tap to arm or disarm."
             @click=${() => { if (summary.alarmEntityId) showMoreInfo(summary.alarmEntityId); }}>
            <rect x="${cx - 40}" y="${cy - 28}" width="80" height="56" rx="8"
                  class="tac-shield-core" style="fill:${shieldColor}" />
            <text x="${cx}" y="${cy - 8}" class="tac-shield-text"
                  text-anchor="middle" dominant-baseline="central">
              ${summary.alarmState.replace(/_/g, ' ').toUpperCase()}
            </text>
            <text x="${cx}" y="${cy + 12}" class="tac-shield-subtext"
                  text-anchor="middle" dominant-baseline="central">
              ${this._config?.tactical?.privacy === 'hidden'
                ? ''
                : personsHome > 0 ? `${personsHome} HOME` : 'EMPTY'}
            </text>
          </g>
        </svg>
      </div>
    `;
  }

  /* ═══ Camera Location Labels ═══ */
  /** Check HA labels on entity, device, and area for 'exterior'/'interior' classification.
   *  Labels: 'exterior', 'outdoor', 'outside' → 'exterior'
   *          'interior', 'indoor', 'inside'   → 'interior'
   *  Returns 'exterior', 'interior', or null (no label — fall back to name heuristic) */
  _getCameraLocation(camEntry) {
    const EXTERIOR = new Set(['exterior', 'outdoor', 'outside']);
    const INTERIOR = new Set(['interior', 'indoor', 'inside']);
    // Check entity labels
    const entityLabels = camEntry.entity?.labels || [];
    for (const l of entityLabels) {
      const lower = (l || '').toLowerCase();
      if (EXTERIOR.has(lower)) return 'exterior';
      if (INTERIOR.has(lower)) return 'interior';
    }
    // Check device labels
    if (camEntry.entity?.device_id && this._hass?.devices) {
      const dev = this._hass.devices[camEntry.entity.device_id];
      for (const l of (dev?.labels || [])) {
        const lower = (l || '').toLowerCase();
        if (EXTERIOR.has(lower)) return 'exterior';
        if (INTERIOR.has(lower)) return 'interior';
      }
    }
    // Check area labels
    const areaId = camEntry.entity?.area_id || (camEntry.entity?.device_id && this._hass?.devices?.[camEntry.entity.device_id]?.area_id);
    if (areaId && this._hass?.areas) {
      const area = this._hass.areas[areaId];
      for (const l of (area?.labels || [])) {
        const lower = (l || '').toLowerCase();
        if (EXTERIOR.has(lower)) return 'exterior';
        if (INTERIOR.has(lower)) return 'interior';
      }
    }
    return null; // No label — caller uses name heuristic
  }

  /* ═══ Camera Viewscreen Array (F-23, F-09, F-10, F-11) ═══ */
  _renderCameras(allCameras) {
    if (allCameras.length === 0) return '';
    // Filter cameras — labels take priority, then name heuristic fallback
    const filtered = this._cameraFilter === 'all' ? allCameras
      : allCameras.filter(c => {
          const labelMatch = this._getCameraLocation(c);
          if (labelMatch) return labelMatch === this._cameraFilter;
          // Fallback: name-based heuristic
          const name = (c.entity?.entity_id || '').toLowerCase();
          if (this._cameraFilter === 'exterior') return /front|back|drive|garage|yard|outdoor|porch|door/i.test(name);
          if (this._cameraFilter === 'interior') return !/front|back|drive|garage|yard|outdoor|porch|door/i.test(name);
          return true;
        });
    // Stable render order keyed by entity_id. Reordering on motion would make
    // lit-html 1.x reuse <lcars-camera-tile> elements in place with a new
    // entity-id prop, forcing every shifted tile back through ESTABLISHING
    // for ~8 s. Visual priority for active cameras is conveyed per-tile via
    // border color / scale / glow / z-index — not by DOM order.
    const stable = [...filtered].sort((a, b) =>
      (a.entity?.entity_id || '').localeCompare(b.entity?.entity_id || '')
    );
    // Main viewscreen (focused camera)
    const focusedEid = this._focusedCamera;
    const focusedCam = focusedEid ? allCameras.find(c => c.entity.entity_id === focusedEid) : null;
    const focusedDet = focusedEid ? this._getCameraDetection(focusedEid) : null;
    const onlineCount = allCameras.filter(c => (this._hass?.states?.[c.entity?.entity_id] || c.state)?.state !== 'unavailable').length;

    return html`
      <div class="tac-section-header">
        <span class="tac-section-label">VIEWSCREENS</span>
        <span class="tac-section-line"></span>
        <span class="tac-camera-count">${onlineCount}/${allCameras.length}</span>
      </div>
      <div class="tac-camera-presets">
        ${['all', 'exterior', 'interior'].map(f => html`
          <button class="tac-preset-btn ${this._cameraFilter === f ? 'active' : ''}"
                  @click=${() => { this._cameraFilter = f; this.requestUpdate(); }}>
            ${f.toUpperCase()}
          </button>
        `)}
      </div>
      <div class="tac-camera-grid">
        ${stable.map((cam, i) => this._renderCamera(cam, this._getCameraDetection(cam.entity.entity_id), i + 1))}
      </div>
      ${focusedCam ? html`
        <div class="tac-main-viewscreen">
          ${this._renderMainViewscreen(focusedCam, focusedDet)}
        </div>
      ` : ''}
    `;
  }

  _renderMainViewscreen(entry, detection) {
    const eid = entry.entity?.entity_id;
    const state = this._hass?.states?.[eid] || entry.state;
    const name = this._shortCamName(state?.attributes?.friendly_name || eid || '');
    const hasFeed = !!state?.attributes?.entity_picture;
    const level = detection?.level || DETECT_IDLE;
    const levelLabel = level === DETECT_PERSON ? 'PERSON DETECTED' : level === DETECT_VEHICLE ? 'VEHICLE DETECTED' : level === DETECT_MOTION ? 'MOTION DETECTED' : '';
    const borderColor = DETECT_COLORS[level];
    const now = new Date();
    const timestamp = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
    return html`
      <div class="tac-viewscreen-frame" style="border-color:${borderColor}">
        ${hasFeed
          ? html`<lcars-camera-tile mode="stream" .hass=${this._hass} entity-id=${eid} label=${name} ?active=${level > DETECT_IDLE}></lcars-camera-tile>`
          : html`<span class="tac-viewscreen-offline">VIEWSCREEN OFFLINE</span>`}
        <div class="tac-viewscreen-overlay">
          <span class="tac-viewscreen-name">${name}</span>
          ${levelLabel ? html`<span class="tac-viewscreen-detect" style="color:${borderColor}">${levelLabel}</span>` : ''}
          <span class="tac-viewscreen-live">LIVE</span>
          <span class="tac-viewscreen-time">${timestamp}</span>
        </div>
      </div>
    `;
  }

  _shortCamName(name) {
    return name.replace(/high resolution channel|channel|camera/gi, '').trim().toUpperCase();
  }

  _renderCamera(entry, detection, index) {
    const eid = entry.entity?.entity_id;
    const state = this._hass?.states?.[eid] || entry.state;
    const name = this._shortCamName(state?.attributes?.friendly_name || eid || '');
    const imgUrl = state?.attributes?.entity_picture;
    const stateVal = state?.state || 'unknown';
    const isOff = stateVal === 'unavailable' || stateVal === 'unknown';
    const camState = (isOff || !imgUrl) ? 'offline' : 'connecting';

    const level = detection?.level || DETECT_IDLE;
    const borderColor = DETECT_COLORS[level];
    const scale = DETECT_SCALE[level];
    const glow = DETECT_GLOW[level] || 'none';
    const levelLabel = level === DETECT_PERSON ? 'PERSON' : level === DETECT_VEHICLE ? 'VEHICLE' : level === DETECT_MOTION ? 'MOTION' : '';

    // Active cameras refresh faster but always use blob+cookie path (no tokens in URL)
    const isActive = level > DETECT_IDLE;

    return html`
      <div class="tac-camera" data-state="${camState}" data-level="${level}"
           style="--cam-border:${borderColor}; --cam-scale:${scale}; --cam-glow:${glow}; --cam-z:${level > 0 ? 10 + level * 10 : 1}"
           @click=${() => { this._focusedCamera = eid; this.requestUpdate(); showMoreInfo(eid); }}
           role="button" tabindex="0" aria-label="${name}${levelLabel ? ` — ${levelLabel} DETECTED` : ''}">
        <span class="tac-camera__badge">${String(index || 0).padStart(2, '0')}</span>
        ${imgUrl ? html`
          <lcars-camera-tile mode="snap" .hass=${this._hass} entity-id=${eid} label=${name} ?active=${isActive}></lcars-camera-tile>
        ` : html`
          <div class="tac-camera__offline">
            <ha-icon .icon=${'mdi:video-off'} style="--mdc-icon-size:24px"></ha-icon>
            <span class="tac-camera__offline-text">VIEWSCREEN OFFLINE</span>
          </div>
        `}
        <span class="tac-camera__label">
          ${name}
          ${levelLabel ? html`<span class="tac-camera__detect-badge" style="color:${borderColor}">${levelLabel}</span>` : ''}
          ${isActive ? html`<span class="tac-camera__live-badge">LIVE</span>` : ''}
        </span>
      </div>
    `;
  }

  /* ═══ Lock Status Bar (F-19) ═══ */
  _renderLockStatus(allLocks, locksTotal, locksLocked) {
    if (locksTotal === 0) return '';
    const allEngaged = locksLocked === locksTotal;
    const unsecured = locksTotal - locksLocked;
    return html`
      <div class="tac-structural-bar">
        <span class="tac-bar-label">LOCKS</span>
        <span class="tac-bar-value">
          <span class="tac-status-pip ${allEngaged ? 'engaged' : 'alert'}" aria-hidden="true"></span>
          ${locksLocked}/${locksTotal} ${allEngaged ? 'ENGAGED' : `· ${unsecured} UNSECURED`}
        </span>
        ${!allEngaged ? html`
          <button class="tac-lock-all-btn" @click=${() => this._lockAll(allLocks)}
                  aria-label="Lock all doors">
            LOCK ALL
          </button>
        ` : ''}
      </div>
      <div class="tac-lock-grid">
        ${allLocks.map(l => {
          const s = this._hass?.states?.[l.entity?.entity_id] || l.state;
          const name = (s?.attributes?.friendly_name || l.entity?.entity_id || '').toUpperCase();
          // #143 — tri-state lock display (secure / unsecure / fault).
          const stateVal = s?.state || 'unknown';
          const resolved = _resolveLockState(stateVal);
          const isLocked = stateVal === 'locked';
          return html`
            <button class="tac-lock-pill ${resolved.tier}"
                    role="switch" aria-checked="${isLocked}"
                    ?disabled=${resolved.tier === 'fault'}
                    aria-label="${name}: ${resolved.label.toLowerCase()}"
                    @click=${() => this._toggleLock(l.entity.entity_id, isLocked)}>
              <ha-icon .icon=${resolved.icon} style="--mdc-icon-size:18px"></ha-icon>
              <span class="tac-lock-name">${name}</span>
              <span class="tac-lock-state">${resolved.label}</span>
            </button>
          `;
        })}
      </div>
    `;
  }

  _toggleLock(entityId, isLocked) {
    this._hass.callService('lock', isLocked ? 'unlock' : 'lock', { entity_id: entityId });
    lcarsAudio.play(isLocked ? 'switchToggle' : 'lockToggle');
  }

  _lockAll(locks) {
    if (this._lockAllPending) return;
    this._lockAllPending = true;
    setTimeout(() => { this._lockAllPending = false; }, 5000);
    for (const l of locks) {
      const s = this._hass?.states?.[l.entity?.entity_id];
      if (s?.state !== 'locked') {
        this._hass.callService('lock', 'lock', { entity_id: l.entity.entity_id });
      }
    }
    lcarsAudio.play('acknowledge');
  }

  /* ═══ Crew Manifest (F-22) ═══ */
  _renderCrewManifest(persons) {
    if (persons.length === 0) return '';
    const privacy = this._config?.tactical?.privacy || 'full';
    if (privacy === 'hidden') return '';
    const home = persons.filter(p => p.state?.state === 'home');
    const away = persons.filter(p => p.state?.state !== 'home');

    if (privacy === 'icons') {
      return html`<span class="tac-bar-value" style="color:var(--lcars-ice)">${home.length} HOME</span>`;
    }
    return html`
      <div class="tac-structural-bar">
        <span class="tac-bar-label">CREW</span>
        ${home.map(p => html`<span class="tac-crew-pill home">${(p.state?.attributes?.friendly_name || p.entity_id).toUpperCase()}</span>`)}
        ${away.map(p => html`<span class="tac-crew-pill away">${(p.state?.attributes?.friendly_name || p.entity_id).toUpperCase()}</span>`)}
      </div>
    `;
  }

  /* ═══ Summary Bar (#146 — replaces ring-gauge cluster in v5.9.0) ═══
   * Geordi: dense single-row bar reads as one shape, scales 2×2 ≤720px.
   * Color follows alarm-state across the whole bar. Threat glyph far-left,
   * 4 quadrant tiles in the middle, LAST EVENT pill far-right.
   */
  _renderOverview(summary) {
    const ICE = 'var(--lcars-ice)';
    const TOMATO = 'var(--lcars-tomato)';
    const SUNFLOWER = 'var(--lcars-sunflower)';
    const BUTTERSCOTCH = 'var(--lcars-butterscotch)';
    const GRAY = 'var(--lcars-gray)';

    const alarmState = summary.alarmState || 'unknown';
    const barColor = this._getSummaryColor(alarmState);
    const isRedAlert = alarmState === 'triggered' || alarmState === 'pending';
    const isArmed = alarmState.startsWith('armed');
    const threatGlyph = isRedAlert ? '⚡' : isArmed ? '◆' : '❯';

    const shieldLabel = alarmState.replace(/_/g, ' ').toUpperCase();

    const perimOpen = summary.perimeterTotal - summary.perimeterSecure;
    const perimOk = perimOpen === 0;
    const perimColor = perimOk ? ICE : TOMATO;
    const perimText = perimOk ? `${summary.perimeterTotal}/${summary.perimeterTotal} SECURE` : `${perimOpen} BREACH`;

    const camOnline = summary.allCameras.filter(c => (this._hass?.states?.[c.entity?.entity_id] || c.state)?.state !== 'unavailable').length;
    const camTotal = summary.allCameras.length;
    const camColor = camTotal === 0 ? GRAY : camOnline === camTotal ? ICE : camOnline > 0 ? SUNFLOWER : TOMATO;
    const camText = camTotal === 0 ? 'NONE' : camOnline === camTotal ? `${camTotal}/${camTotal} ONLINE` : `${camTotal - camOnline} OFFLINE`;

    const hazardColor = summary.safetyAlerts > 0 ? TOMATO : summary.safetyTotal > 0 ? ICE : GRAY;
    const sensorText = summary.safetyTotal === 0 ? 'NONE'
      : summary.safetyAlerts > 0 ? `${summary.safetyAlerts} ALERT${summary.safetyAlerts > 1 ? 'S' : ''}`
      : 'ALL CLEAR';

    const lastEvent = this._lastEventLabel(summary);

    return html`
      <div class="tac-summary-bar" data-state=${alarmState}
           style="--bar-color:${barColor}"
           @click=${() => { if (summary.alarmEntityId) showMoreInfo(summary.alarmEntityId); }}
           role="region" aria-label="Tactical summary">
        <div class="tac-sum-glyph" aria-hidden="true">${threatGlyph}</div>
        <div class="tac-sum-quad tac-sum-shields" style="--quad-color:${barColor}">
          <span class="tac-sum-label">SHIELDS</span>
          <span class="tac-sum-value">${shieldLabel}</span>
        </div>
        <div class="tac-sum-quad tac-sum-perim" style="--quad-color:${perimColor}">
          <span class="tac-sum-label">PERIMETER</span>
          <span class="tac-sum-value">${perimText}</span>
        </div>
        <div class="tac-sum-quad tac-sum-sensors" style="--quad-color:${hazardColor}">
          <span class="tac-sum-label">SENSORS</span>
          <span class="tac-sum-value">${sensorText}</span>
        </div>
        <div class="tac-sum-quad tac-sum-cams" style="--quad-color:${camColor}">
          <span class="tac-sum-label">VIEWSCREENS</span>
          <span class="tac-sum-value">${camText}</span>
        </div>
        ${lastEvent ? html`
          <div class="tac-sum-last" title="${lastEvent.full}">
            <span class="tac-sum-last-label">LAST EVENT</span>
            <span class="tac-sum-last-value">${lastEvent.short}</span>
          </div>
        ` : ''}
      </div>
    `;
  }

  /* ═══ Last Event derivation (#146) ═══ */
  _lastEventLabel(summary) {
    if (!this._hass) return null;
    // Find most-recent state change among alarm, locks, perimeter, hazards
    const candidates = [];
    if (summary.alarmEntityId) candidates.push(summary.alarmEntityId);
    for (const l of (summary.allLocks || [])) candidates.push(l.entity?.entity_id);
    // perimeter/hazards arrive via floorGroups; keep scope narrow for v1
    let best = null;
    let bestT = 0;
    for (const eid of candidates) {
      if (!eid) continue;
      const s = this._hass.states[eid];
      if (!s) continue;
      const t = new Date(s.last_changed || s.last_updated || 0).getTime();
      if (t > bestT) { bestT = t; best = s; }
    }
    if (!best) return null;
    const name = (best.attributes?.friendly_name || best.entity_id).toUpperCase();
    const stateLabel = String(best.state).replace(/_/g, ' ').toUpperCase();
    const ageMs = Date.now() - bestT;
    const ageStr = this._formatEventAge(ageMs);
    return {
      short: `${ageStr} · ${stateLabel}`,
      full: `${name} → ${stateLabel} (${ageStr})`,
    };
  }

  _formatEventAge(ms) {
    if (ms < 0 || !isFinite(ms)) return '—';
    const mins = Math.floor(ms / 60000);
    if (mins < 1) return 'NOW';
    if (mins < 60) return `${mins}M`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}H`;
    return `${Math.floor(hours / 24)}D`;
  }

  /* ═══ SVG Ring Gauge (shared) ═══ */
  _ringGauge(value, max, size, color, label, sublabel) {
    const strokeW = 6;
    const r = (size - strokeW * 2) / 2;
    const circumference = 2 * Math.PI * r;
    const pct = Math.min(1, Math.max(0, value / max));
    const dashOffset = circumference * (1 - pct);
    const cx = size / 2, cy = size / 2;
    return svg`
      <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" class="ring-gauge">
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}22" stroke-width="${strokeW}" />
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="${strokeW}"
                stroke-dasharray="${circumference}" stroke-dashoffset="${dashOffset}"
                stroke-linecap="butt" transform="rotate(-90 ${cx} ${cy})"
                style="transition: stroke-dashoffset 500ms ease" />
        <text x="${cx}" y="${cy - 5}" text-anchor="middle" dominant-baseline="central"
              class="ring-value" style="fill:${color}">${label}</text>
        ${sublabel ? svg`<text x="${cx}" y="${cy + 11}" text-anchor="middle" dominant-baseline="central"
              class="ring-sublabel" style="fill:${color}; opacity:0.7">${sublabel}</text>` : ''}
      </svg>`;
  }

  /* ═══ Sensor Summary Sidebar ═══ */
  _renderSensorSummary(floorGroups, summary) {
    let motionTotal = 0, motionClear = 0;
    for (const { areas } of floorGroups) {
      for (const data of areas) {
        for (const e of data.motion) {
          motionTotal++;
          if ((this._hass?.states?.[e.entity?.entity_id] || e.state)?.state !== 'on') motionClear++;
        }
      }
    }
    const motionTriggered = motionTotal - motionClear;
    const perimeterOpen = summary.perimeterTotal - summary.perimeterSecure;
    const safetyClear = summary.safetyTotal - summary.safetyAlerts;

    return html`
      <div class="tac-sidebar-section">
        <div class="tac-section-header"><span class="tac-section-label">SENSOR STATUS</span><span class="tac-section-line"></span></div>
        <div class="tac-sensor-summary">
          <div class="tac-sensor-group">
            <span class="tac-sensor-group-title">DOORS / WINDOWS</span>
            <div class="tac-sensor-row"><span class="tac-sensor-key">TOTAL</span><span class="tac-sensor-val">${summary.perimeterTotal}</span></div>
            <div class="tac-sensor-row"><span class="tac-sensor-key">SECURE</span><span class="tac-sensor-val ok">${summary.perimeterSecure}</span></div>
            <div class="tac-sensor-row"><span class="tac-sensor-key">OPEN</span><span class="tac-sensor-val ${perimeterOpen > 0 ? 'alert' : 'ok'}">${perimeterOpen}</span></div>
          </div>
          <div class="tac-sensor-group">
            <span class="tac-sensor-group-title">MOTION SENSORS</span>
            <div class="tac-sensor-row"><span class="tac-sensor-key">TOTAL</span><span class="tac-sensor-val">${motionTotal}</span></div>
            <div class="tac-sensor-row"><span class="tac-sensor-key">CLEAR</span><span class="tac-sensor-val ok">${motionClear}</span></div>
            <div class="tac-sensor-row"><span class="tac-sensor-key">TRIGGERED</span><span class="tac-sensor-val ${motionTriggered > 0 ? 'alert' : 'ok'}">${motionTriggered}</span></div>
          </div>
          ${summary.safetyTotal > 0 ? html`
            <div class="tac-sensor-group">
              <span class="tac-sensor-group-title">HAZARD DETECTORS</span>
              <div class="tac-sensor-row"><span class="tac-sensor-key">TOTAL</span><span class="tac-sensor-val">${summary.safetyTotal}</span></div>
              <div class="tac-sensor-row"><span class="tac-sensor-key">CLEAR</span><span class="tac-sensor-val ok">${safetyClear}</span></div>
              <div class="tac-sensor-row"><span class="tac-sensor-key">ALERTS</span><span class="tac-sensor-val ${summary.safetyAlerts > 0 ? 'alert' : 'ok'}">${summary.safetyAlerts}</span></div>
            </div>
          ` : ''}
        </div>
      </div>`;
  }

  /* ═══ System Status Sidebar ═══ */
  _renderSystemStatus(summary) {
    if (!summary.alarmEntityId) return '';
    const s = this._hass?.states?.[summary.alarmEntityId];
    if (!s) return '';
    const attrs = s.attributes || {};
    return html`
      <div class="tac-sidebar-section">
        <div class="tac-section-header"><span class="tac-section-label">SYSTEM STATUS</span><span class="tac-section-line"></span></div>
        <div class="tac-system-grid">
          <span class="tac-sensor-key">SYSTEM MODE</span><span class="tac-sensor-val" style="color:${this._getSummaryColor(summary.alarmState)}">${summary.alarmState.replace(/_/g, ' ').toUpperCase()}</span>
          ${attrs.changed_by ? html`<span class="tac-sensor-key">CHANGED BY</span><span class="tac-sensor-val">${String(attrs.changed_by).toUpperCase()}</span>` : ''}
          ${attrs.code_arm_required != null ? html`<span class="tac-sensor-key">PIN REQUIRED</span><span class="tac-sensor-val">${attrs.code_arm_required ? 'YES' : 'NO'}</span>` : ''}
          <span class="tac-sensor-key">CREW HOME</span><span class="tac-sensor-val">${summary.allPersons.filter(p => p.state?.state === 'home').length}</span>
        </div>
      </div>`;
  }

  /* ═══ Main Render ═══ */
  render() {
    if (!this._hass) return html`<div class="tac-loading">INITIALIZING TACTICAL SYSTEMS...</div>`;
    // #224 — Chronicle mode: replace tactical view entirely with timeline component.
    if (this._filter === 'chronicle') {
      const hours = this._config?.chronicle?.hours || 24;
      return html`<lcars-tactical-chronicle .hass=${this._hass} .hours=${hours}></lcars-tactical-chronicle>`;
    }
    const floorGroups = this._getAreasWithTactical();
    const summary = this._getGlobalSummary(floorGroups);
    const isRedAlert = summary.alarmState === 'triggered' || summary.alarmState === 'pending';
    // #144 — sidebar wins. ALL renders the full dashboard; ACCESS scopes to lock
    // status + crew (door/identity surfaces); ZONES scopes to perimeter sensor
    // status + system status. Cameras render in ALL only.
    const showAccess = this._filter === 'all' || this._filter === 'access';
    const showZones = this._filter === 'all' || this._filter === 'zones';
    const showCameras = this._filter === 'all';

    return html`
      <div class="tac-dashboard ${isRedAlert ? 'red-alert' : ''} mode-${this._mode}" data-filter=${this._filter}>
        <span class="tac-sr-status" role="status" aria-live="polite">${
          this._filter === 'all' ? 'Tactical view: all sections.'
          : this._filter === 'access' ? 'Tactical view: access only.'
          : 'Tactical view: zones only.'
        }</span>
        ${this._renderOverview(summary)}
        <div class="tac-main-grid">
          <div class="tac-main-content">
            ${showAccess ? this._renderCrewManifest(summary.allPersons) : ''}
            ${showAccess ? this._renderLockStatus(summary.allLocks, summary.locksTotal, summary.locksLocked) : ''}
            ${showCameras ? this._renderCameras(summary.allCameras) : ''}
          </div>
          <div class="tac-sidebar">
            ${showZones ? this._renderSensorSummary(floorGroups, summary) : ''}
            ${this._renderSystemStatus(summary)}
          </div>
        </div>
      </div>
    `;
  }

  static get styles() {
    return [
      lcarsBaseStyles,
      css`
        :host { display: block; }
        /* 5.6.5 (Geordi S5): visually-hidden status node so AT users hear when
           the sidebar filter swaps the dashboard between ALL/ACCESS/ZONES. */
        .tac-sr-status {
          position: absolute;
          width: 1px; height: 1px; padding: 0; margin: -1px;
          overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0;
        }
        .tac-dashboard { display: flex; flex-direction: column; gap: 0.75rem; }
        .tac-loading { font-family: var(--lcars-font, 'Antonio', sans-serif); color: var(--lcars-gray); text-transform: uppercase; padding: 2rem; text-align: center; font-size: 1.25rem; letter-spacing: 0.1em; }

        /* ─── Summary Bar (#146) — replaces ring-gauge overview cards ─── */
        .tac-summary-bar {
          display: grid;
          grid-template-columns: auto repeat(4, minmax(0, 1fr)) auto;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.875rem;
          background: rgba(255,153,102,0.05);
          border-left: 0.375rem solid var(--bar-color, var(--lcars-butterscotch));
          font-family: var(--lcars-font, 'Antonio', sans-serif);
          text-transform: uppercase;
          cursor: pointer;
          transition: background 200ms ease, border-color 200ms ease;
        }
        .tac-summary-bar:hover { background: rgba(255,153,102,0.1); }
        .tac-summary-bar[data-state="triggered"],
        .tac-summary-bar[data-state="pending"] {
          background: rgba(255,85,85,0.08);
          animation: tac-bar-pulse 1.2s ease-in-out infinite;
        }
        @keyframes tac-bar-pulse {
          0%, 100% { background: rgba(255,85,85,0.08); }
          50% { background: rgba(255,85,85,0.18); }
        }
        @media (prefers-reduced-motion: reduce) {
          .tac-summary-bar[data-state="triggered"],
          .tac-summary-bar[data-state="pending"] { animation: none; }
        }
        .tac-sum-glyph {
          font-size: 1.5rem;
          color: var(--bar-color, var(--lcars-butterscotch));
          line-height: 1;
          padding: 0 0.25rem;
        }
        .tac-sum-quad {
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
          min-width: 0;
          padding: 0 0.5rem;
          border-left: 1px solid rgba(255,153,102,0.15);
        }
        .tac-sum-quad:first-of-type { border-left: none; }
        .tac-sum-label {
          font-size: 0.65rem;
          color: var(--lcars-gray, #666688);
          letter-spacing: 0.1em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .tac-sum-value {
          font-size: 0.85rem;
          font-weight: 700;
          background: var(--quad-color, var(--lcars-space-white));
          color: #000;
          padding: 0.1rem 0.65rem;
          border-radius: 0.85rem;
          letter-spacing: 0.08em;
          font-variant-numeric: tabular-nums;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          align-self: flex-start;
          max-width: 100%;
        }
        .tac-sum-last {
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
          padding: 0.25rem 0.625rem;
          background: rgba(255,153,102,0.08);
          border-radius: 0.875rem;
          min-width: 0;
          max-width: 14rem;
        }
        .tac-sum-last-label {
          font-size: 0.6rem;
          color: var(--lcars-gray, #666688);
          letter-spacing: 0.1em;
        }
        .tac-sum-last-value {
          font-size: 0.85rem;
          color: var(--lcars-peach, #ffcc99);
          font-variant-numeric: tabular-nums;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        @media (max-width: 720px) {
          .tac-summary-bar {
            grid-template-columns: auto 1fr 1fr;
            grid-template-areas:
              "glyph shields perim"
              "glyph sensors cams"
              "last  last    last";
            padding: 0.5rem 0.625rem;
          }
          .tac-sum-glyph { grid-area: glyph; }
          .tac-sum-shields { grid-area: shields; }
          .tac-sum-perim   { grid-area: perim; }
          .tac-sum-sensors { grid-area: sensors; }
          .tac-sum-cams    { grid-area: cams; }
          .tac-sum-last    { grid-area: last; max-width: none; }
          .tac-sum-quad { border-left: none; padding: 0.125rem 0.25rem; }
        }

        /* ─── Main Grid (2-column) ─── */
        .tac-main-grid { display: grid; grid-template-columns: 1fr 18rem; gap: 1rem; }
        @media (max-width: 960px) { .tac-main-grid { grid-template-columns: 1fr; } }
        .tac-main-content { display: flex; flex-direction: column; gap: 0.75rem; }
        .tac-sidebar { display: flex; flex-direction: column; gap: 0.75rem; align-self: start; }

        /* ─── Section Headers (animated) ─── */
        .tac-section-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; }
        .tac-section-label { font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 1.25rem; color: var(--lcars-butterscotch, #ff9966); text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap; }
        .tac-section-line {
          flex: 1; height: 2px; background: var(--lcars-butterscotch, #ff9966); opacity: 0.4;
          position: relative; overflow: hidden;
        }
        .tac-section-line::after {
          content: ''; position: absolute; top: 0; left: -15%; width: 15%; height: 100%;
          background: var(--lcars-gold, #ffaa00); opacity: 0.25;
          animation: tac-scan-line 4s ease-in-out infinite;
        }
        @keyframes tac-scan-line { 0% { left: -15%; } 100% { left: 100%; } }

        /* ─── Sidebar Sections ─── */
        .tac-sidebar-section {
          padding: 0.75rem; background: rgba(255,153,102,0.03);
        }
        .tac-sensor-summary { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
        .tac-sensor-group-title { font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 0.75rem; color: var(--lcars-butterscotch, #ff9966); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem; display: block; }
        .tac-sensor-row { display: flex; justify-content: space-between; font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 0.875rem; text-transform: uppercase; padding: 0.125rem 0; }
        .tac-sensor-key { color: var(--lcars-gray, #666688); }
        .tac-sensor-val { color: var(--lcars-space-white, #f5f6fa); font-variant-numeric: tabular-nums; }
        /* #147 — status classes for sensor values (replaces inline style=color:#hex). */
        .tac-sensor-val.ok { color: var(--lcars-ice, #99ccff); }
        /* #151 — TRIGGERED / alert values bolder + larger so they stand out next to neutral counts. */
        .tac-sensor-val.alert {
          color: var(--lcars-tomato, #ff5555);
          font-weight: 700;
          font-size: 1rem;
          letter-spacing: 0.04em;
        }

        /* ─── Camera Presets ─── */
        .tac-camera-presets { display: flex; gap: 0.25rem; margin-bottom: 0.5rem; }
        .tac-preset-btn {
          font-family: var(--lcars-font, 'Antonio', sans-serif); text-transform: uppercase;
          font-size: 0.75rem; letter-spacing: 0.08em; cursor: pointer;
          padding: 0.25rem 0.75rem; border: 1px solid var(--lcars-butterscotch, #ff9966);
          border-radius: 0 0.75rem 0.75rem 0; background: transparent;
          color: var(--lcars-butterscotch, #ff9966); transition: background 200ms ease, color 200ms ease;
        }
        .tac-preset-btn.active { background: var(--lcars-butterscotch, #ff9966); color: var(--lcars-black, #000); }
        .tac-preset-btn:hover { filter: brightness(1.2); }

        /* ─── Camera Badge ─── */
        .tac-camera__badge {
          position: absolute; top: 0.25rem; right: 0.25rem; z-index: 5;
          font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 0.625rem;
          color: var(--lcars-gray, #666688); background: rgba(0,0,0,0.6);
          padding: 0.1rem 0.3rem; border-radius: 0.25rem;
        }

        /* ─── Main Viewscreen ─── */
        .tac-main-viewscreen { margin-top: 0.5rem; }
        .tac-viewscreen-frame {
          position: relative; width: 100%; aspect-ratio: 16/9;
          border: 3px solid var(--lcars-butterscotch, #ff9966); border-radius: 0;
          overflow: hidden; background: var(--lcars-black, #000);
        }
        .tac-viewscreen-frame img { width: 100%; height: 100%; object-fit: cover; }
        .tac-viewscreen-overlay {
          position: absolute; bottom: 0; left: 0; right: 0;
          display: flex; justify-content: space-between; align-items: center;
          padding: 0.375rem 0.5rem; background: linear-gradient(transparent, rgba(0,0,0,0.8));
          font-family: var(--lcars-font, 'Antonio', sans-serif); text-transform: uppercase; font-size: 0.75rem;
        }
        .tac-viewscreen-name { color: var(--lcars-butterscotch, #ff9966); }
        .tac-viewscreen-detect { font-size: 0.625rem; animation: tac-detect-pulse 1.5s ease-in-out infinite; }
        @keyframes tac-detect-pulse { 0%,100% { opacity: 0.7; } 50% { opacity: 1; } }
        .tac-viewscreen-live { color: var(--lcars-tomato, #ff5555); font-size: 0.625rem; animation: tac-live-blink 2s step-start infinite; }
        @keyframes tac-live-blink { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
        /* #149 — timestamp on dark gradient: lift contrast from gray to space-white. */
        .tac-viewscreen-time { color: var(--lcars-space-white, #f5f6fa); font-size: 0.75rem; font-variant-numeric: tabular-nums; text-shadow: 0 1px 2px rgba(0,0,0,0.8); }
        .tac-viewscreen-offline { color: var(--lcars-gray); font-family: var(--lcars-font); text-transform: uppercase; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; }

        /* ─── System Status Grid ─── */
        .tac-system-grid {
          display: grid; grid-template-columns: 1fr auto; gap: 0.25rem 0.75rem;
          font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 0.875rem; text-transform: uppercase;
        }
        .tac-inner-pip { cursor: pointer; transition: opacity 200ms ease; }
        .tac-inner-pip.active { opacity: 1; }
        .tac-inner-pip:not(.active) { opacity: 0.4; }
        .tac-inner-label {
          font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 8px;
          fill: var(--lcars-sunflower, #ffcc99); text-transform: uppercase; letter-spacing: 0.05em;
        }
        .tac-shield-core { opacity: 0.9; transition: fill 500ms ease; }
        .tac-shield-core-group { cursor: pointer; }
        .tac-shield-core-group:hover .tac-shield-core { opacity: 1; filter: brightness(1.15); }
        .tac-shield-core-group:focus-visible { outline: 2px solid var(--lcars-space-white, #f5f6fa); outline-offset: 4px; border-radius: 8px; }
        .tac-shield-text {
          font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 11px;
          fill: var(--lcars-black, #000); text-transform: uppercase; letter-spacing: 0.08em; font-weight: bold;
        }
        .tac-shield-subtext {
          font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 9px;
          fill: var(--lcars-black, #000); text-transform: uppercase;
        }

        /* ─── Section Headers ─── */
        .tac-section-header { display: flex; align-items: center; gap: 0.5rem; }
        .tac-section-label {
          font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 1.25rem;
          color: var(--lcars-ice, #99ccff); text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap;
        }
        .tac-section-line { flex: 1; height: 2px; background: var(--lcars-ice, #99ccff); opacity: 0.4; }
        .tac-camera-count {
          font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 1rem;
          color: var(--lcars-ice, #99ccff); white-space: nowrap;
        }

        /* ─── Camera Grid ─── */
        .tac-camera-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(min(16rem, 100%), 1fr));
          gap: 0.375rem; overflow: visible;
        }
        .tac-camera-active { padding: 0.5rem 0; }
        .tac-camera {
          position: relative; border-radius: 0.25rem; overflow: visible;
          cursor: pointer; border: 2px solid var(--cam-border, var(--lcars-butterscotch));
          aspect-ratio: 16/9; background: var(--lcars-bg, #000);
          transform: scale(var(--cam-scale, 1)); transform-origin: center center;
          box-shadow: var(--cam-glow, none);
          transition: transform 300ms ease, box-shadow 300ms ease, border-color 300ms ease;
          z-index: var(--cam-z, 1);
        }
        .tac-camera img { width: 100%; height: 100%; object-fit: cover; display: block; position: relative; z-index: 0; border-radius: 0.2rem; }
        .tac-camera__label {
          position: absolute; bottom: 0; left: 0; right: 0; z-index: 3;
          padding: 0.25rem 0.5rem; font-family: var(--lcars-font, 'Antonio', sans-serif);
          font-size: 0.75rem; color: var(--lcars-space-white, #f5f6fa);
          background: rgba(0,0,0,0.6); text-transform: uppercase;
          display: flex; justify-content: space-between; align-items: center;
        }
        .tac-camera__detect-badge { font-size: 0.65rem; font-weight: bold; }
        .tac-camera__live-badge {
          font-size: 0.55rem; font-weight: bold; color: var(--lcars-tomato, #ff5555);
          background: rgba(0,0,0,0.6); padding: 0.05rem 0.3rem; border-radius: 0.2rem;
          animation: tac-live-blink 1.5s ease-in-out infinite;
        }
        @keyframes tac-live-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @media (prefers-reduced-motion: reduce) { .tac-camera__live-badge { animation: none; } }
        .tac-camera:focus-visible { outline: 2px solid var(--lcars-space-white, #f5f6fa); outline-offset: 2px; }

        /* Camera state overlays */
        .tac-camera__connecting, .tac-camera__offline {
          position: absolute; inset: 0; display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 0.25rem;
          background: var(--lcars-bg, #000); z-index: 2; border-radius: 0.2rem;
          opacity: 0; visibility: hidden; transition: opacity 300ms ease-out, visibility 300ms ease-out;
        }
        .tac-camera[data-state="connecting"] .tac-camera__connecting {
          opacity: 1; visibility: visible;
          transition: opacity 300ms ease-out 500ms, visibility 300ms ease-out 500ms;
        }
        .tac-camera[data-state="connecting"] .tac-camera__offline,
        .tac-camera[data-state="offline"] .tac-camera__connecting,
        .tac-camera[data-state="live"] .tac-camera__connecting,
        .tac-camera[data-state="live"] .tac-camera__offline { opacity: 0; visibility: hidden; }
        .tac-camera[data-state="offline"] .tac-camera__offline { opacity: 1; visibility: visible; }
        .tac-camera__connecting-text {
          font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 0.7rem;
          color: var(--lcars-ice, #99ccff); text-transform: uppercase; letter-spacing: 0.1em;
          animation: tac-breathe 4s ease-in-out infinite;
        }
        .tac-camera__offline ha-icon { color: var(--lcars-gray, #666688); }
        .tac-camera__offline-text {
          font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 0.7rem;
          color: var(--lcars-gray, #666688); text-transform: uppercase; letter-spacing: 0.1em;
        }
        @keyframes tac-breathe { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @media (prefers-reduced-motion: reduce) { .tac-camera__connecting-text { animation: none; } }

        /* ─── Structural Bars ─── */
        .tac-structural-bar {
          display: flex; align-items: center; gap: 0.5rem; padding: 0.375rem 0.75rem;
          background: var(--lcars-butterscotch, #ff9966); border-radius: 0.375rem;
          font-family: var(--lcars-font, 'Antonio', sans-serif); text-transform: uppercase;
          color: var(--lcars-black, #000); min-height: 2rem;
        }
        .tac-bar-label { font-size: 0.75rem; letter-spacing: 0.08em; opacity: 0.9; }
        .tac-bar-value { font-size: 0.875rem; font-variant-numeric: tabular-nums; display: flex; align-items: center; }
        .tac-status-pip {
          display: inline-block; width: 0.5rem; height: 0.5rem;
          border-radius: 50%; margin-right: 0.375rem; flex-shrink: 0;
        }
        .tac-status-pip.engaged { background: var(--lcars-ice, #99ccff); }
        .tac-status-pip.alert { background: var(--lcars-tomato, #ff5555); }

        /* Crew pills */
        .tac-crew-pill {
          display: inline-block; padding: 0.125rem 0.5rem; border-radius: 0 1rem 1rem 0;
          font-size: 0.75rem; letter-spacing: 0.05em;
        }
        .tac-crew-pill.home { background: var(--lcars-ice, #99ccff); color: var(--lcars-black, #000); }
        .tac-crew-pill.away { background: var(--lcars-gray, #666688); color: var(--lcars-space-white, #f5f6fa); }

        /* #150 (Geordi review revision) — LOCK ALL is a security action; tomato bg with
         * BLACK text (not space-white). White-on-tomato was ~3.4:1, failed WCAG 1.4.3.
         * Black-on-tomato ≈ 5.2:1 and matches every other tomato pill in this file. */
        .tac-lock-all-btn {
          margin-left: auto; padding: 0.375rem 0.75rem; border: none;
          border-radius: 0 1rem 1rem 0; background: var(--lcars-tomato, #ff5555);
          color: var(--lcars-black, #000); font-family: var(--lcars-font, 'Antonio', sans-serif);
          font-size: 0.75rem; font-weight: 700; letter-spacing: 0.05em;
          text-transform: uppercase; cursor: pointer;
          transition: filter 200ms ease;
        }
        .tac-lock-all-btn:hover { filter: brightness(1.2); }
        .tac-lock-all-btn:focus-visible { outline: 2px solid var(--lcars-space-white); outline-offset: 2px; }

        /* Lock individual pills */
        .tac-lock-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(min(14rem, 100%), 1fr));
          gap: 0.375rem;
        }
        .tac-lock-pill {
          display: flex; align-items: center; gap: 0.5rem; height: 3rem; padding: 0 1rem;
          border: none; border-radius: 0 var(--lcars-btn-radius, 1.5rem) var(--lcars-btn-radius, 1.5rem) 0;
          font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 1rem;
          text-transform: uppercase; cursor: pointer; transition: background 200ms ease, filter 200ms ease;
        }
        /* #143 (Geordi review revision) — tri-state lock pill: secure (ice), unsecure
         * (tomato), pending (butterscotch), fault (sunflower, FLAT pulse — stripe
         * removed). LCARS flatness rule: no gradients. Engineering mini-core charge-pulse
         * is the precedent. */
        .tac-lock-pill.secure {
          background: var(--lcars-ice, #99ccff); color: var(--lcars-black, #000);
        }
        .tac-lock-pill.unsecure {
          background: var(--lcars-tomato, #ff5555); color: var(--lcars-black, #000);
        }
        .tac-lock-pill.pending {
          background: var(--lcars-butterscotch, #ff9966); color: var(--lcars-black, #000);
        }
        .tac-lock-pill.fault {
          background: var(--lcars-sunflower, #ffcc99); color: var(--lcars-black, #000);
          animation: tac-lock-fault-pulse 1.6s ease-in-out infinite;
        }
        @keyframes tac-lock-fault-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.65; }
        }
        @media (prefers-reduced-motion: reduce) {
          .tac-lock-pill.fault { animation: none; }
        }
        .tac-lock-pill:hover { filter: brightness(1.2); }
        .tac-lock-pill[disabled] { cursor: not-allowed; opacity: 0.85; }
        .tac-lock-pill:focus-visible { outline: 2px solid var(--lcars-space-white); outline-offset: 2px; }
        .tac-lock-name { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .tac-lock-state { font-size: 0.75rem; flex-shrink: 0; }

        /* ─── Timeline ─── */
        .tac-timeline {
          display: flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0;
        }
        .tac-timeline-label {
          font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 0.625rem;
          color: var(--lcars-gray, #666688); text-transform: uppercase; letter-spacing: 0.08em; white-space: nowrap;
        }
        .tac-timeline-track {
          flex: 1; height: 1.5rem; background: rgba(153,204,255,0.08);
          border-radius: 0 0.75rem 0.75rem 0;
        }

        /* ─── Red Alert ─── */
        .red-alert { }
        .red-alert .tac-perimeter-svg .tac-shield-core {
          animation: tac-redalert-pulse 1s ease-in-out infinite;
        }
        @keyframes tac-redalert-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @media (prefers-reduced-motion: reduce) { .red-alert .tac-perimeter-svg .tac-shield-core { animation: none; } }
      `,
    ];
  }
}

const ready = Promise.race([customElements.whenDefined('hui-masonry-view'), new Promise((r) => setTimeout(r, 5000))]);
ready.then(() => { if (!customElements.get('tactical-card')) { defineLcars('tactical-card', LcarsTacticalCard); } });
