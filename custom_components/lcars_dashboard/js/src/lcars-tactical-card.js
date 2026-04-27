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
import { lcarsLog, lcarsEventBus, showMoreInfo } from './lcars-helpers.js';
import { lcarsBaseStyles } from './lcars-styles.js';
import { getFloors, getAreasByFloor } from './lcars-hierarchy-utils.js';
import { getAreaEntities } from './lcars-entity-query.js';
import { isTacticalEntity, isDiagnosticEntity } from './lcars-entity-utils.js';
import { lcarsAudio } from './lcars-audio.js';

const TAG = 'TacticalCard';

/* ─── Entity Classification Constants ─── */
const ACCESS_DOMAINS = new Set(['lock', 'alarm_control_panel']);
const PERIMETER_CLASSES = new Set(['door', 'window', 'garage_door']);
const SAFETY_CLASSES = new Set(['smoke', 'gas', 'safety', 'tamper', 'vibration', 'carbon_monoxide']);
const MOTION_CLASSES = new Set(['motion', 'occupancy']);
const ALARM_SEVERITY = { triggered: 5, pending: 4, armed_away: 3, armed_night: 2, armed_home: 2, armed_vacation: 2, arming: 1, disarmed: 0 };

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

  connectedCallback() { super.connectedCallback(); }
  disconnectedCallback() {
    super.disconnectedCallback();
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
    const allCameras = [], allLocks = [], allPersons = [];

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
        allCameras.push(...data.cameras);
        if (data.locks) {
          for (const l of data.locks) {
            locksTotal++;
            if ((this._hass?.states?.[l.entity?.entity_id] || l.state)?.state === 'locked') locksLocked++;
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
    return { alarmState, perimeterTotal, perimeterSecure, safetyAlerts,
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

  /* ═══ Perimeter Schematic (F-01) ═══ */
  _renderPerimeter(floorGroups, summary) {
    const cx = 150, cy = 150, sensorR = 100, shieldR = 120;
    // Build zone data from areas
    const zones = [];
    let fallbackAngle = 0;
    for (const { areas } of floorGroups) {
      for (const data of areas) {
        const zp = _zoneForArea(data.area.name);
        const angle = zp ? zp.angle : (fallbackAngle += 360 / 8);
        const zoneName = zp ? zp.zone : data.area.name.substring(0, 4).toUpperCase();
        const sensorCount = data.perimeter.length + data.motion.length;
        if (sensorCount > 0 || data.cameras.length > 0) {
          zones.push({
            name: zoneName, angle, area: data.area,
            perimeter: data.perimeter, motion: data.motion, cameras: data.cameras,
            hasBreaches: data.perimeter.some(e => (this._hass?.states?.[e.entity?.entity_id] || e.state)?.state === 'on'),
            hasMotion: data.motion.some(e => (this._hass?.states?.[e.entity?.entity_id] || e.state)?.state === 'on'),
          });
        }
      }
    }

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

          <!-- Sensor ring arcs -->
          ${zones.map((z, i) => {
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
              <text x="${_polarToCart(cx, cy, sensorR + 16, z.angle).x}"
                    y="${_polarToCart(cx, cy, sensorR + 16, z.angle).y}"
                    class="tac-zone-label" text-anchor="middle" dominant-baseline="central">${z.name}</text>
            `;
          })}

          <!-- Shield Core (F-02) -->
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
        </svg>
      </div>
    `;
  }

  /* ═══ Camera Viewscreen Array (F-23, F-09, F-10, F-11) ═══ */
  _renderCameras(allCameras) {
    if (allCameras.length === 0) return '';
    // Separate active vs idle cameras
    const active = [], idle = [];
    for (const cam of allCameras) {
      const det = this._getCameraDetection(cam.entity.entity_id);
      if (det) active.push({ cam, det });
      else idle.push(cam);
    }

    return html`
      ${active.length > 0 ? html`
        <div class="tac-section-header">
          <span class="tac-section-label">ACTIVE VIEWSCREENS</span>
          <span class="tac-section-line"></span>
        </div>
        <div class="tac-camera-grid tac-camera-active">
          ${active.map(({ cam, det }) => this._renderCamera(cam, det))}
        </div>
      ` : ''}
      <div class="tac-section-header">
        <span class="tac-section-label">VIEWSCREENS</span>
        <span class="tac-section-line"></span>
        <span class="tac-camera-count">${allCameras.filter(c => (this._hass?.states?.[c.entity?.entity_id] || c.state)?.state !== 'unavailable').length}/${allCameras.length}</span>
      </div>
      <div class="tac-camera-grid">
        ${idle.map(cam => this._renderCamera(cam, null))}
      </div>
    `;
  }

  _renderCamera(entry, detection) {
    const eid = entry.entity?.entity_id;
    const state = this._hass?.states?.[eid] || entry.state;
    const name = (state?.attributes?.friendly_name || eid || '').toUpperCase();
    const imgUrl = state?.attributes?.entity_picture;
    const stateVal = state?.state || 'unknown';
    const isOff = stateVal === 'unavailable' || stateVal === 'unknown';
    const camState = (isOff || !imgUrl) ? 'offline' : 'connecting';

    const level = detection?.level || DETECT_IDLE;
    const borderColor = DETECT_COLORS[level];
    const scale = DETECT_SCALE[level];
    const glow = DETECT_GLOW[level] || 'none';
    const levelLabel = level === DETECT_PERSON ? 'PERSON' : level === DETECT_VEHICLE ? 'VEHICLE' : level === DETECT_MOTION ? 'MOTION' : '';

    // Active cameras get live MJPEG stream, idle get still snapshots
    const isActive = level > DETECT_IDLE;
    const feedUrl = isActive && imgUrl
      ? `/api/camera_proxy_stream/${eid}?token=${state?.attributes?.access_token || ''}`
      : imgUrl;

    return html`
      <div class="tac-camera" data-state="${camState}" data-level="${level}"
           style="--cam-border:${borderColor}; --cam-scale:${scale}; --cam-glow:${glow}; --cam-z:${level > 0 ? 10 + level * 10 : 1}"
           @click=${() => showMoreInfo(eid)}
           role="button" tabindex="0" aria-label="${name}${levelLabel ? ` — ${levelLabel} DETECTED` : ''}">
        <div class="tac-camera__connecting">
          <span class="tac-camera__connecting-text">ESTABLISHING LINK</span>
        </div>
        <div class="tac-camera__offline">
          <ha-icon .icon=${'mdi:video-off'} style="--mdc-icon-size:24px"></ha-icon>
          <span class="tac-camera__offline-text">VIEWSCREEN OFFLINE</span>
        </div>
        ${feedUrl ? html`
          <img src="${feedUrl}" alt="${name}" loading="${isActive ? 'eager' : 'lazy'}"
               @load=${(e) => { e.target.closest('.tac-camera')?.setAttribute('data-state', 'live'); }}
               @error=${(e) => { e.target.closest('.tac-camera')?.setAttribute('data-state', 'offline'); }} />
        ` : ''}
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
        <span class="tac-bar-value" style="color:${allEngaged ? 'var(--lcars-ice)' : 'var(--lcars-tomato)'}">
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
          const isLocked = s?.state === 'locked';
          return html`
            <button class="tac-lock-pill ${isLocked ? 'locked' : 'unlocked'}"
                    role="switch" aria-checked="${isLocked}"
                    aria-label="${name}: ${isLocked ? 'locked' : 'unlocked'}"
                    @click=${() => this._toggleLock(l.entity.entity_id, isLocked)}>
              <ha-icon .icon=${isLocked ? 'mdi:lock' : 'mdi:lock-open'} style="--mdc-icon-size:18px"></ha-icon>
              <span class="tac-lock-name">${name}</span>
              <span class="tac-lock-state">${isLocked ? 'ENGAGED' : 'UNSECURED'}</span>
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

  /* ═══ Sensor Timeline placeholder (F-21, Phase 3 full implementation) ═══ */
  _renderTimeline(floorGroups) {
    return html`
      <div class="tac-timeline" role="img" aria-label="24-hour sensor timeline">
        <span class="tac-timeline-label">SENSOR LOG</span>
        <div class="tac-timeline-track"></div>
      </div>
    `;
  }

  /* ═══ Main Render ═══ */
  render() {
    if (!this._hass) return html`<div class="tac-loading">INITIALIZING TACTICAL SYSTEMS...</div>`;
    const floorGroups = this._getAreasWithTactical();
    const summary = this._getGlobalSummary(floorGroups);
    const isRedAlert = summary.alarmState === 'triggered' || summary.alarmState === 'pending';

    return html`
      <div class="tac-dashboard ${isRedAlert ? 'red-alert' : ''} mode-${this._mode}">
        ${this._renderPerimeter(floorGroups, summary)}
        ${this._renderCrewManifest(summary.allPersons)}
        ${this._renderLockStatus(summary.allLocks, summary.locksTotal, summary.locksLocked)}
        ${this._renderCameras(summary.allCameras)}
        ${this._renderTimeline(floorGroups)}
      </div>
    `;
  }

  static get styles() {
    return [
      lcarsBaseStyles,
      css`
        :host { display: block; }
        .tac-dashboard { display: flex; flex-direction: column; gap: 0.75rem; }
        .tac-loading { font-family: var(--lcars-font, 'Antonio', sans-serif); color: var(--lcars-gray); text-transform: uppercase; padding: 2rem; text-align: center; font-size: 1.25rem; letter-spacing: 0.1em; }

        /* ─── Perimeter Schematic ─── */
        .tac-perimeter { display: flex; justify-content: center; padding: 0.5rem; }
        .tac-perimeter-svg { width: 100%; max-width: 400px; height: auto; }
        .tac-shield-arc {
          fill: none; stroke-width: 3; stroke-linecap: round; opacity: 0.4;
          transition: opacity 300ms ease;
        }
        .mode-tactical .tac-shield-arc, .mode-redalert .tac-shield-arc { opacity: 0.8; stroke-width: 4; }
        .tac-sensor-arc { fill: none; stroke-width: 5; stroke-linecap: round; opacity: 0.6; }
        .tac-sensor-arc.motion-flash {
          opacity: 1; stroke-width: 7;
          animation: tac-arc-flash 2s ease-out forwards;
        }
        @keyframes tac-arc-flash { 0% { opacity: 1; stroke-width: 7; } 100% { opacity: 0.6; stroke-width: 5; } }
        @media (prefers-reduced-motion: reduce) { .tac-sensor-arc.motion-flash { animation: none; opacity: 0.8; } }
        .tac-sensor-node { cursor: pointer; transition: r 300ms ease; }
        .tac-sensor-node:hover { r: 8; }
        .tac-sensor-node.breach { animation: tac-node-pulse 1s ease-in-out infinite; }
        @keyframes tac-node-pulse { 0%, 100% { r: 6; } 50% { r: 9; } }
        @media (prefers-reduced-motion: reduce) { .tac-sensor-node.breach { animation: none; r: 8; } }
        .tac-zone-label {
          font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 9px;
          fill: var(--lcars-gray, #666688); text-transform: uppercase; letter-spacing: 0.08em;
        }
        .tac-shield-core { opacity: 0.9; transition: fill 500ms ease; }
        .tac-shield-text {
          font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 11px;
          fill: var(--lcars-black, #000); text-transform: uppercase; letter-spacing: 0.08em; font-weight: bold;
        }
        .tac-shield-subtext {
          font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 8px;
          fill: var(--lcars-black, #000); text-transform: uppercase; opacity: 0.7;
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
          display: grid; grid-template-columns: repeat(auto-fill, minmax(min(16rem, 100%), 1fr));
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
        .tac-bar-label { font-size: 0.75rem; letter-spacing: 0.08em; opacity: 0.7; }
        .tac-bar-value { font-size: 0.875rem; font-variant-numeric: tabular-nums; }

        /* Crew pills */
        .tac-crew-pill {
          display: inline-block; padding: 0.125rem 0.5rem; border-radius: 0 1rem 1rem 0;
          font-size: 0.75rem; letter-spacing: 0.05em;
        }
        .tac-crew-pill.home { background: var(--lcars-ice, #99ccff); color: var(--lcars-black, #000); }
        .tac-crew-pill.away { background: var(--lcars-gray, #666688); color: var(--lcars-space-white, #f5f6fa); }

        /* Lock All button */
        .tac-lock-all-btn {
          margin-left: auto; padding: 0.25rem 0.75rem; border: none;
          border-radius: 0 1rem 1rem 0; background: var(--lcars-gold, #ffaa00);
          color: var(--lcars-black, #000); font-family: var(--lcars-font, 'Antonio', sans-serif);
          font-size: 0.75rem; text-transform: uppercase; cursor: pointer;
          transition: filter 200ms ease;
        }
        .tac-lock-all-btn:hover { filter: brightness(1.2); }
        .tac-lock-all-btn:focus-visible { outline: 2px solid var(--lcars-space-white); outline-offset: 2px; }

        /* Lock individual pills */
        .tac-lock-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(min(14rem, 100%), 1fr));
          gap: 0.375rem;
        }
        .tac-lock-pill {
          display: flex; align-items: center; gap: 0.5rem; height: 3rem; padding: 0 1rem;
          border: none; border-radius: 0 var(--lcars-btn-radius, 1.5rem) var(--lcars-btn-radius, 1.5rem) 0;
          font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 1rem;
          text-transform: uppercase; cursor: pointer; transition: background 200ms ease, filter 200ms ease;
        }
        .tac-lock-pill.locked {
          background: var(--lcars-ice, #99ccff); color: var(--lcars-black, #000);
        }
        .tac-lock-pill.unlocked {
          background: var(--lcars-tomato, #ff5555); color: var(--lcars-black, #000);
        }
        .tac-lock-pill:hover { filter: brightness(1.2); }
        .tac-lock-pill:focus-visible { outline: 2px solid var(--lcars-space-white); outline-offset: 2px; }
        .tac-lock-name { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .tac-lock-state { font-size: 0.75rem; opacity: 0.8; flex-shrink: 0; }

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
ready.then(() => { if (!customElements.get('tactical-card')) { customElements.define('tactical-card', LcarsTacticalCard); } });
