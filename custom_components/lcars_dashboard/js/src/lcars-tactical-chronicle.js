/**
 * lcars-tactical-chronicle.js
 *
 * Chronicle mode component (#224) — per-area 24h Gantt timeline of state
 * changes for tactical entities.
 *
 * Spec: specs/LCARS-TACTICAL-CHRONICLE-MODE-SPEC.md
 * Security gates enforced upstream in lcars-tactical-history-store.js (§7).
 *
 * Renders a single area-grouped Gantt viewport with:
 *   • 4-band astronomical sun row (computed from sun.sun attributes)
 *   • Landmark hairlines (sunrise/set, alarm armed/disarmed/triggered)
 *   • Per-area collapsible sections, sessionStorage for collapse-state only
 *   • Now-indicator vertical line
 *   • JUMP TO NOW pill
 *
 * No localStorage. No payload logging. No camera entities. (See history store.)
 */
import { LitElement, html, css, svg } from 'lit-element';
import { lcarsBaseStyles } from './lcars-styles.js';
import {
  tacticalHistoryStart,
  tacticalHistoryStop,
  tacticalHistoryUpdateHass,
  tacticalHistorySegments,
  tacticalHistorySubscribe,
} from './lcars-tactical-history-store.js';
import { getAreasByFloor } from './lcars-hierarchy-utils.js';
import { getAreaEntities } from './lcars-entity-query.js';
import { isTacticalEntity } from './lcars-entity-utils.js';

const COLLAPSE_KEY = 'lcars-chronicle-collapsed-areas';

const STATE_COLORS = {
  motion:    'var(--lcars-butterscotch)',
  occupancy: 'var(--lcars-gold)',
  door:      'var(--lcars-peach)',
  window:    'var(--lcars-peach)',
  opening:   'var(--lcars-peach)',
  lock:      'var(--lcars-peach)',
  light:     'var(--lcars-sunflower)',
  switch:    'var(--lcars-ice)',
  alarm:     'var(--lcars-butterscotch)',
  alert:     'var(--lcars-tomato)',
  problem:   'var(--lcars-tomato)',
  smoke:     'var(--lcars-tomato)',
  gas:       'var(--lcars-tomato)',
  safety:    'var(--lcars-tomato)',
  tamper:    'var(--lcars-tomato)',
};

const ALERT_DEVICE_CLASSES = new Set([
  'smoke', 'gas', 'safety', 'tamper', 'vibration',
  'carbon_monoxide', 'heat', 'problem',
]);

function colorForEntity(entityId, deviceClass) {
  const dot = entityId.indexOf('.');
  const domain = dot >= 0 ? entityId.slice(0, dot) : entityId;
  if (ALERT_DEVICE_CLASSES.has(deviceClass)) return STATE_COLORS.alert;
  if (deviceClass && STATE_COLORS[deviceClass]) return STATE_COLORS[deviceClass];
  if (domain === 'light')  return STATE_COLORS.light;
  if (domain === 'switch') return STATE_COLORS.switch;
  if (domain === 'lock')   return STATE_COLORS.lock;
  if (domain === 'alarm_control_panel') return STATE_COLORS.alarm;
  if (domain === 'binary_sensor') return STATE_COLORS.motion;
  return 'var(--lcars-ice)';
}

function isAlertColor(c) {
  return c === STATE_COLORS.alert;
}

function shortName(name, entityId) {
  const raw = (name || entityId || '').toString();
  return raw.replace(/_/g, ' ').toUpperCase();
}

function readCollapsed() {
  try {
    const raw = sessionStorage.getItem(COLLAPSE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? new Set(arr) : new Set();
  } catch (_) { return new Set(); }
}

function writeCollapsed(set) {
  try {
    sessionStorage.setItem(COLLAPSE_KEY, JSON.stringify([...set]));
  } catch (_) { /* quota or disabled — silently ignore */ }
}

/* ── Astronomical band computation from sun.sun ──────────────── */
function sunBandsForWindow(sunState, startMs, endMs) {
  // Use sun.sun next_rising / next_setting (ISO strings). For 24h windows
  // we extrapolate ±24h to bracket the visible range without needing
  // historical sun.sun data.
  const attrs = sunState?.attributes || {};
  const rising = Date.parse(attrs.next_rising || '');
  const setting = Date.parse(attrs.next_setting || '');
  if (!isFinite(rising) || !isFinite(setting)) return [];
  const dayMs = 86_400_000;
  const events = [];
  // Generate rising/setting events bracketing the window
  for (let d = -2; d <= 2; d++) {
    events.push({ t: rising + d * dayMs, type: 'rise' });
    events.push({ t: setting + d * dayMs, type: 'set' });
  }
  events.sort((a, b) => a.t - b.t);
  const bands = [];
  // Walk through, emit bands inside [startMs, endMs]
  let cursor = startMs;
  // Determine initial daylight state at startMs: most-recent prior event
  let priorRise = -Infinity, priorSet = -Infinity;
  for (const e of events) {
    if (e.t > startMs) break;
    if (e.type === 'rise') priorRise = e.t;
    else priorSet = e.t;
  }
  let isDay = priorRise > priorSet;
  while (cursor < endMs) {
    const next = events.find(e => e.t > cursor && e.t <= endMs);
    const segEnd = next ? next.t : endMs;
    bands.push({ start: cursor, end: segEnd, kind: isDay ? 'day' : 'night' });
    if (next) {
      // golden hour ±1h around transition
      const goldenStart = next.t - 30 * 60_000;
      const goldenEnd = next.t + 30 * 60_000;
      bands.push({ start: Math.max(startMs, goldenStart), end: Math.min(endMs, goldenEnd), kind: 'golden' });
      // civil twilight ±15min outside golden hour
      bands.push({
        start: Math.max(startMs, next.t - 75 * 60_000),
        end: Math.max(startMs, next.t - 30 * 60_000),
        kind: 'twilight',
      });
      bands.push({
        start: Math.min(endMs, next.t + 30 * 60_000),
        end: Math.min(endMs, next.t + 75 * 60_000),
        kind: 'twilight',
      });
      isDay = next.type === 'rise';
      cursor = next.t;
    } else {
      cursor = endMs;
    }
  }
  return bands.filter(b => b.end > b.start);
}

const BAND_COLORS = {
  night:    'var(--lcars-bluey, #4477aa)',
  twilight: 'var(--lcars-ice)',
  golden:   'var(--lcars-peach)',
  day:      'var(--lcars-sunflower)',
};
const BAND_OPACITY = { night: 0.6, twilight: 0.5, golden: 0.55, day: 0.35 };

/* ── Entity classification for chronicle ──────────────────────── */
/**
 * Strict whitelist for the Movement & Illumination chronicle.
 * Charter: lights on/off, switches/fans, motion/occupancy/presence, door/window opening,
 * locks/covers. Excludes power telemetry, AI camera detections (animal/vehicle/baby/
 * package), UPS/battery/server/sprinkler/irrigation noise — these belong elsewhere.
 */
const CHRONICLE_BS_CLASSES = new Set([
  'motion', 'occupancy', 'presence',
  'door', 'window', 'opening', 'garage_door',
]);
const CHRONICLE_COVER_CLASSES = new Set([
  'door', 'window', 'garage', 'shutter', 'awning', 'blind', 'curtain', 'shade',
]);
const BS_FALLBACK_OBJID_RE = /(_motion|_occupancy|_presence|_door|_window|_contact|_opening|_reedswitch)(?:$|_)/i;
// Configuration toggles disguised as motion/detection entities — reject across
// every domain. e.g. `switch.front_door_motion_detection` is the "is motion
// detection enabled?" toggle, not an actual motion event. Same for the
// `_detection_enabled`, `_alarm_enabled`, `_recording`, `_audio_recording`
// helpers exposed by many camera integrations (Reolink, Unifi, Amcrest, etc.).
// Also catches UPS/appliance config toggles (display LEDs, beepers, always-on,
// auto-reboot) and status-LED entities that pass as `light.*` on some vendors.
const CONFIG_TOGGLE_RE = /(_motion_detection|_motion_enabled|_motion_alarm|_alarm_enabled|_detection_enabled|_detection_switch|_audio_detection|_pir(?:_enabled)?|_recording(?:_enabled)?|_audio_recording|_ftp_upload|_email_on_event|_notifications?|_siren|_floodlight_(?:on|enabled)|_privacy_mode|_ir_lights|_night_vision|_display(?:_enabled)?|_panel_light|_status_light|_status_led|_indicator_led|_beeper|_buzzer|_audible_alarm|_audible_warning|_auto_reboot|_auto_restart|_power_cycle|_always_on|_ac_enabled|_usb_enabled|_schedule_enabled|_timer_enabled|_child_lock)(?:$|_)/i;

// Appliance-fan suffixes — the `fan.*` domain is admitted for room ventilation
// (ceiling/exhaust/floor fans). Air purifiers, humidifiers, dehumidifiers, etc.
// are exposed as fan entities by their integrations but represent appliance
// state, not human movement, and pollute Chronicle. Reject by name heuristic.
const APPLIANCE_FAN_RE = /(_purifier|_humidifier|_dehumidifier|_air_quality|_ionizer|_diffuser)(?:$|_)/i;

function isChronicleEntity(eid, hass) {
  if (!eid || typeof eid !== 'string') return false;
  const dot = eid.indexOf('.');
  if (dot < 0) return false;
  const domain = eid.slice(0, dot);
  const objId = eid.slice(dot + 1);
  if (domain === 'camera' || domain === 'media_player' || domain === 'person' || domain === 'device_tracker') return false;
  if (/secret|key|token|password/i.test(eid)) return false;
  // Reject camera/UPS/appliance config toggles regardless of domain
  if (CONFIG_TOGGLE_RE.test(objId)) return false;
  // Reject HA-categorised config / diagnostic entities — most vendors tag
  // helper toggles correctly; this catches everything CONFIG_TOGGLE_RE misses.
  const reg = hass?.entities?.[eid];
  if (reg?.entity_category === 'config' || reg?.entity_category === 'diagnostic') return false;

  const state = hass?.states?.[eid];
  const dc = state?.attributes?.device_class || '';

  if (domain === 'light') return true;
  if (domain === 'fan') {
    if (APPLIANCE_FAN_RE.test(objId)) return false;
    return true;
  }
  if (domain === 'lock') return true;
  if (domain === 'switch') {
    // Reject power-monitoring / outlet-energy switches by name heuristic
    if (/(_power|_energy|_watt|_volt|_amp|_current|_ups|_battery|_inverter|_grid|_charge)/i.test(objId)) return false;
    return true;
  }
  if (domain === 'cover') {
    return !dc || CHRONICLE_COVER_CLASSES.has(dc);
  }
  if (domain === 'binary_sensor') {
    if (dc && CHRONICLE_BS_CLASSES.has(dc)) return true;
    // Fallback for legacy/unclassified door/motion sensors
    if (!dc && BS_FALLBACK_OBJID_RE.test(objId)) {
      // But still reject AI camera detections + power/battery
      if (/(_vehicle|_animal|_baby|_package|_person|_face|_ups|_battery|_g6|_grid|_charge|_sprinkler|_irrigat)/i.test(objId)) return false;
      return true;
    }
    return false;
  }
  if (domain === 'alarm_control_panel') return true;
  return false;
}

function dedupeAreaPrefix(name, areaName) {
  if (!name || !areaName) return name || '';
  const cleanArea = areaName.replace(/[^a-z0-9 ]/gi, ' ').trim();
  if (!cleanArea) return name;
  // Build a permissive regex: each area word optional space/underscore between
  const words = cleanArea.split(/\s+/).filter(Boolean);
  if (!words.length) return name;
  const pattern = new RegExp(`^${words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('[ _-]*')}[ _-]*`, 'i');
  const stripped = name.replace(pattern, '').trim();
  return stripped || name;
}

/* ──────────────────────────────────────────────────────────────── */
export class LcarsTacticalChronicle extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      hours: { type: Number },
      areaScope: { type: String, attribute: 'area-scope' },
      _collapsed: { state: true },
      _now: { state: true },
      _renderTick: { state: true },
    };
  }

  static get styles() {
    return [
      lcarsBaseStyles,
      css`
        :host {
          display: block;
          font-family: var(--lcars-font, 'Antonio', sans-serif);
          color: var(--lcars-space-white, #f5f6fa);
          --row-h: 1.75rem;
          --bar-h: 1.125rem;
          --label-w: 11rem;
          --axis-h: 1.5rem;
          --sun-h: 0.5rem;
        }
        .chron-toolbar {
          display: flex; justify-content: space-between; align-items: center;
          padding: 0.25rem 0.5rem;
          text-transform: uppercase; letter-spacing: 0.1em;
        }
        .chron-toolbar-label {
          color: var(--lcars-butterscotch);
          font-size: 1rem;
        }
        .chron-jump-now {
          background: var(--lcars-butterscotch);
          color: #000;
          border: none;
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
          font-family: inherit;
          font-size: 0.75rem;
          letter-spacing: 0.1em;
          cursor: pointer;
          text-transform: uppercase;
        }
        .chron-jump-now:hover { background: var(--lcars-sunflower); }
        .chron-viewport {
          position: relative;
          overflow-x: auto;
          overflow-y: hidden;
          padding-bottom: 0.5rem;
        }
        .chron-axis {
          display: grid;
          grid-template-columns: var(--label-w) 1fr;
          height: var(--axis-h);
          align-items: end;
          font-size: 0.65rem;
          color: var(--lcars-gray);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .chron-axis-ticks {
          position: relative; height: 100%;
        }
        .chron-axis-tick {
          position: absolute; top: 0; height: 100%;
          border-left: 1px solid rgba(255,153,102,0.12);
          padding-left: 0.25rem;
          font-size: 0.6rem;
        }
        .chron-sun-row {
          display: grid;
          grid-template-columns: var(--label-w) 1fr;
          height: var(--sun-h);
        }
        .chron-sun-bands {
          position: relative; height: 100%;
        }
        .chron-sun-band {
          position: absolute; top: 0; height: 100%;
        }
        .chron-area {
          border-top: 2px solid var(--lcars-african-violet, #cc99cc);
        }
        .chron-area-header {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.35rem 0.5rem 0.35rem 0.75rem;
          cursor: pointer;
          background: linear-gradient(
            90deg,
            var(--lcars-african-violet, #cc99cc) 0,
            var(--lcars-african-violet, #cc99cc) 0.5rem,
            rgba(204,153,204,0.18) 0.5rem,
            rgba(204,153,204,0.10) 100%
          );
          border-left: 0.5rem solid var(--lcars-african-violet, #cc99cc);
          transition: background 150ms ease;
        }
        .chron-area-header:hover { background-color: rgba(204,153,204,0.22); }
        .chron-area-toggle {
          font-size: 0.85rem;
          color: var(--lcars-space-white, #f5f6fa);
          width: 1rem;
        }
        .chron-area-name {
          font-size: 0.95rem;
          color: var(--lcars-space-white, #f5f6fa);
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        .chron-area-wasted {
          background: var(--lcars-tomato);
          color: #000;
          font-size: 0.6rem;
          padding: 0.0625rem 0.45rem;
          border-radius: 0.75rem;
          letter-spacing: 0.1em;
          font-weight: 700;
        }
        .chron-area-incidents {
          background: var(--lcars-tomato);
          color: #000;
          font-size: 0.6rem;
          padding: 0.0625rem 0.4rem;
          border-radius: 0.75rem;
          letter-spacing: 0.1em;
        }
        .chron-area-dots {
          display: flex; gap: 0.125rem;
          color: var(--lcars-tomato);
          font-size: 0.55rem;
          letter-spacing: 0.1em;
        }
        .chron-rows {
          display: flex; flex-direction: column;
          transition: max-height 200ms ease;
          overflow: hidden;
        }
        @media (prefers-reduced-motion: reduce) {
          .chron-rows { transition: none; }
        }
        .chron-row {
          display: grid;
          grid-template-columns: var(--label-w) 1fr;
          align-items: center;
          height: var(--row-h);
          border-top: 1px dashed rgba(255,153,102,0.08);
        }
        .chron-row-label {
          font-size: 0.72rem;
          color: var(--lcars-space-white, #f5f6fa);
          padding: 0 0.5rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          cursor: pointer;
        }
        .chron-row-label:hover { color: var(--lcars-butterscotch); }
        .chron-row-track {
          position: relative;
          height: 100%;
        }
        .chron-bar {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          height: var(--bar-h);
          border-radius: calc(var(--bar-h) / 2);
          min-width: 0.5rem;
          cursor: pointer;
        }
        .chron-bar:focus-visible {
          outline: 2px solid var(--lcars-ice);
          outline-offset: 1px;
        }
        .chron-bar.alert {
          background-image: repeating-linear-gradient(
            45deg,
            transparent 0 4px,
            rgba(0,0,0,0.35) 4px 5px
          );
        }
        .chron-now {
          position: absolute;
          top: 0; bottom: 0; width: 2px;
          background: var(--lcars-ice);
          pointer-events: none;
          z-index: 5;
        }
        .chron-landmark {
          position: absolute;
          top: 0; bottom: 0; width: 1px;
          opacity: 0.55;
          pointer-events: none;
          z-index: 1;
        }
        .chron-empty {
          padding: 2rem 1rem;
          color: var(--lcars-gray);
          text-align: center;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
      `,
    ];
  }

  constructor() {
    super();
    this.hours = 24;
    this.areaScope = '';
    this._collapsed = readCollapsed();
    this._now = Date.now();
    this._renderTick = 0;
    this._historyUnsub = null;
    this._nowTimer = null;
  }

  connectedCallback() {
    super.connectedCallback();
    this._startup();
    this._nowTimer = setInterval(() => { this._now = Date.now(); }, 30_000);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._historyUnsub) { this._historyUnsub(); this._historyUnsub = null; }
    if (this._nowTimer) { clearInterval(this._nowTimer); this._nowTimer = null; }
    tacticalHistoryStop();
  }

  updated(changed) {
    if (changed.has('hass')) {
      tacticalHistoryUpdateHass(this.hass);
      if (!this._historyUnsub) this._startup();
    }
  }

  _startup() {
    if (!this.hass) return;
    const groups = this._gatherEntities();
    const entityIds = [];
    for (const a of groups) for (const e of a.entities) entityIds.push(e.eid);
    tacticalHistoryStart(this.hass, { entityIds, hours: this.hours });
    if (this._historyUnsub) this._historyUnsub();
    this._historyUnsub = tacticalHistorySubscribe(() => {
      this._renderTick++;
    });
  }

  _gatherEntities() {
    if (!this.hass) return [];
    const floorMap = getAreasByFloor(this.hass);
    const out = [];
    const visit = (a) => {
      if (this.areaScope && this.areaScope !== a.area_id) return;
      const entries = getAreaEntities(this.hass, a.area_id) || [];
      const ents = [];
      let lightOnCount = 0;
      let motionPresentCount = 0;
      let motionTotalCount = 0;
      for (const entry of entries) {
        const eid = entry.entity?.entity_id || entry.entity_id;
        if (!eid) continue;
        if (!isChronicleEntity(eid, this.hass)) continue;
        const state = this.hass.states?.[eid];
        const dc = state?.attributes?.device_class || '';
        const friendly = state?.attributes?.friendly_name || eid;
        const displayName = dedupeAreaPrefix(friendly, a.name);
        ents.push({ eid, name: friendly, displayName, deviceClass: dc });
        const domain = eid.split('.')[0];
        const stateVal = state?.state;
        if (domain === 'light' && stateVal === 'on') lightOnCount++;
        if (domain === 'binary_sensor' && (dc === 'motion' || dc === 'occupancy' || dc === 'presence')) {
          motionTotalCount++;
          if (stateVal === 'on') motionPresentCount++;
        }
      }
      if (ents.length === 0) return;
      out.push({
        areaId: a.area_id,
        areaName: a.name || a.area_id,
        entities: ents,
        lightOnCount,
        motionPresentCount,
        motionTotalCount,
      });
    };
    if (floorMap && typeof floorMap.forEach === 'function') {
      floorMap.forEach((areaList) => {
        for (const a of (areaList || [])) visit(a);
      });
    }
    return out;
  }

  _sunAboveHorizon() {
    const s = this.hass?.states?.['sun.sun'];
    return s?.state === 'above_horizon';
  }

  _isAreaWasted(area) {
    if (!area.lightOnCount) return false;
    if (area.motionTotalCount === 0) return false;
    if (area.motionPresentCount > 0) return false;
    return this._sunAboveHorizon();
  }

  _fireMoreInfo(eid, ev) {
    if (ev) ev.stopPropagation();
    if (!eid) return;
    this.dispatchEvent(new CustomEvent('hass-more-info', {
      bubbles: true,
      composed: true,
      detail: { entityId: eid },
    }));
  }

  _onRowKey(eid, ev) {
    if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault();
      this._fireMoreInfo(eid, ev);
    }
  }

  _toggleArea(areaId) {
    const next = new Set(this._collapsed);
    if (next.has(areaId)) next.delete(areaId);
    else next.add(areaId);
    this._collapsed = next;
    writeCollapsed(next);
  }

  _jumpToNow() {
    const vp = this.shadowRoot?.querySelector('.chron-viewport');
    if (vp) vp.scrollLeft = vp.scrollWidth;
  }

  _renderAxis(startMs, endMs) {
    const tickCount = 6;
    const span = endMs - startMs;
    const ticks = [];
    for (let i = 0; i <= tickCount; i++) {
      const t = startMs + (span * i) / tickCount;
      const pct = (i / tickCount) * 100;
      const d = new Date(t);
      const h = d.getHours();
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = ((h + 11) % 12) + 1;
      ticks.push(html`<span class="chron-axis-tick" style="left:${pct}%">${h12}${ampm}</span>`);
    }
    return html`
      <div class="chron-axis">
        <span></span>
        <div class="chron-axis-ticks">${ticks}</div>
      </div>
    `;
  }

  _renderSunRow(startMs, endMs) {
    const sun = this.hass?.states?.['sun.sun'];
    if (!sun) return html`<div class="chron-sun-row"><span></span><div class="chron-sun-bands"></div></div>`;
    const bands = sunBandsForWindow(sun, startMs, endMs);
    const span = endMs - startMs;
    return html`
      <div class="chron-sun-row">
        <span></span>
        <div class="chron-sun-bands">
          ${bands.map(b => {
            const left = ((b.start - startMs) / span) * 100;
            const width = ((b.end - b.start) / span) * 100;
            return html`<span class="chron-sun-band"
              style="left:${left}%; width:${width}%; background:${BAND_COLORS[b.kind]}; opacity:${BAND_OPACITY[b.kind]}"></span>`;
          })}
        </div>
      </div>
    `;
  }

  _renderRowBars(eid, startMs, endMs, color, isAlert) {
    const segs = tacticalHistorySegments(eid);
    if (!segs.length) return '';
    const span = endMs - startMs;
    return segs.map(s => {
      if (s.end < startMs || s.start > endMs) return '';
      const left = Math.max(0, ((s.start - startMs) / span) * 100);
      const right = Math.min(100, ((s.end - startMs) / span) * 100);
      const width = Math.max(0.5, right - left);
      return html`<span class="chron-bar ${isAlert ? 'alert' : ''}"
        style="left:${left}%; width:${width}%; background:${color}"
        title="${new Date(s.start).toLocaleTimeString()} → ${new Date(s.end).toLocaleTimeString()}"
        role="button"
        tabindex="0"
        @click=${(ev) => this._fireMoreInfo(eid, ev)}
        @keydown=${(ev) => this._onRowKey(eid, ev)}></span>`;
    });
  }

  _entityHasSegments(eid, startMs, endMs) {
    const segs = tacticalHistorySegments(eid);
    if (!segs.length) return false;
    for (const s of segs) {
      if (s.end >= startMs && s.start <= endMs) return true;
    }
    return false;
  }

  _renderAreaIncidents(area, startMs, endMs) {
    // count distinct alert segments
    let alertSegs = 0;
    for (const e of area.entities) {
      const isAlert = ALERT_DEVICE_CLASSES.has(e.deviceClass);
      if (!isAlert) continue;
      const segs = tacticalHistorySegments(e.eid);
      for (const s of segs) {
        if (s.end >= startMs && s.start <= endMs) alertSegs++;
      }
    }
    return alertSegs;
  }

  _renderAreaDots(count) {
    if (count <= 0) return '';
    const dots = Math.min(count, 3);
    const more = count > 3 ? `+${count - 3}` : '';
    return html`<span class="chron-area-dots" aria-label="${count} alerts">
      ${'●'.repeat(dots)}${more}
    </span>`;
  }

  render() {
    if (!this.hass) {
      return html`<div class="chron-empty">CHRONICLE INITIALISING…</div>`;
    }
    const groups = this._gatherEntities();
    if (!groups.length) {
      return html`<div class="chron-empty">CHRONICLE — NO TACTICAL ENTITIES IN SCOPE</div>`;
    }
    const endMs = this._now;
    const startMs = endMs - (this.hours || 24) * 3600_000;
    const span = endMs - startMs;
    const nowLeft = (((this._now - startMs) / span) * 100).toFixed(2);

    return html`
      <div class="chron-toolbar">
        <span class="chron-toolbar-label">CHRONICLE · ${this.hours || 24}H</span>
        <button class="chron-jump-now" @click=${this._jumpToNow}>JUMP TO NOW</button>
      </div>
      <div class="chron-viewport">
        ${this._renderAxis(startMs, endMs)}
        ${this._renderSunRow(startMs, endMs)}
        ${groups.map(area => {
          const collapsed = this._collapsed.has(area.areaId);
          const incidents = this._renderAreaIncidents(area, startMs, endMs);
          const wasted = this._isAreaWasted(area);
          const visibleEntities = area.entities.filter(e => this._entityHasSegments(e.eid, startMs, endMs));
          return html`
            <div class="chron-area">
              <div class="chron-area-header"
                   role="button" tabindex="0"
                   aria-expanded=${!collapsed}
                   @click=${() => this._toggleArea(area.areaId)}
                   @keydown=${(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._toggleArea(area.areaId); } }}>
                <span class="chron-area-toggle">${collapsed ? '▸' : '▾'}</span>
                <span class="chron-area-name">${shortName(area.areaName)}</span>
                ${wasted ? html`<span class="chron-area-wasted" title="Lights on but nobody home + sun is up">⚠ LIGHTS WASTED</span>` : ''}
                ${incidents > 0 ? html`<span class="chron-area-incidents">⚑ ${incidents} INCIDENT${incidents > 1 ? 'S' : ''}</span>` : ''}
                ${collapsed ? this._renderAreaDots(incidents) : ''}
              </div>
              ${!collapsed && visibleEntities.length > 0 ? html`
                <div class="chron-rows">
                  ${visibleEntities.map(e => {
                    const color = colorForEntity(e.eid, e.deviceClass);
                    const isAlert = isAlertColor(color);
                    const label = shortName(e.displayName || e.name, e.eid);
                    return html`
                      <div class="chron-row">
                        <span class="chron-row-label"
                              role="button" tabindex="0"
                              title="${e.name} (${e.eid}) — click for details"
                              @click=${(ev) => this._fireMoreInfo(e.eid, ev)}
                              @keydown=${(ev) => this._onRowKey(e.eid, ev)}>${label}</span>
                        <div class="chron-row-track">
                          ${this._renderRowBars(e.eid, startMs, endMs, color, isAlert)}
                        </div>
                      </div>
                    `;
                  })}
                </div>
              ` : ''}
            </div>
          `;
        })}
        <span class="chron-now" style="left:calc(var(--label-w) + ${nowLeft}% * (100% - var(--label-w)) / 100)" aria-hidden="true"></span>
      </div>
    `;
  }
}

customElements.define('lcars-tactical-chronicle', LcarsTacticalChronicle);
