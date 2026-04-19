/**
 * lcars-irrigation-panel.js
 *
 * Irrigation panel — "Arboretum Environmental Control"
 * Renders zone controls, zone photos, schedule strips, rain alerts,
 * quick-run builder, controller status, and standby/pause controls
 * for irrigation controller devices (e.g. Rachio Gen 3).
 *
 * v4.17.0 Panel Extraction Architecture (4X-4)
 * v4.18.2 Full Rachio integration — zone photos, attributes, schedules,
 *         rain alert, quick-run, barberpole flow, countdown timer,
 *         pause/resume, controller status telemetry.
 */
import { html } from 'lit-element';
import { LcarsBasePanel } from '../../lcars-base-panel.js';
import { getIrrigationZoneColor } from '../../lcars-color-utils.js';
import { createRateLimiter, clampValue } from '../../lcars-service-utils.js';
import { showMoreInfo } from '../../lcars-helpers.js';
import { humanizeTimestamp } from '../../lcars-format-utils.js';
import { sharedKeyframes, sharedReducedMotion } from '../../lcars-shared-animations.js';
import { irrigationPanelStyles } from './lcars-irrigation-panel-styles.js';

/* ─── Zone attribute icon map ─── */
const SHADE_ICONS = {
  'Full Sun':    'mdi:weather-sunny',
  'Mostly Sun':  'mdi:weather-sunny',
  'Half Shade':  'mdi:weather-partly-cloudy',
  'Full Shade':  'mdi:weather-cloudy',
};

const VEGETATION_ICONS = {
  'Cool Season Grass': 'mdi:grass',
  'Warm Season Grass': 'mdi:grass',
  'Trees':             'mdi:tree',
  'Shrubs':            'mdi:flower',
  'Perennials':        'mdi:flower-tulip',
  'Annuals':           'mdi:flower',
  'Ground Cover':      'mdi:grass',
  'Xeriscape':         'mdi:cactus',
};

const SLOPE_ICONS = {
  'Flat':     'mdi:triangle-outline',
  'Slight':   'mdi:triangle-outline',
  'Moderate': 'mdi:triangle-outline',
  'Steep':    'mdi:triangle-outline',
};

class LcarsIrrigationPanel extends LcarsBasePanel {

  #irrigationLimiter = createRateLimiter(5, 10000);

  static get properties() {
    return {
      ...super.properties,
      _expandedZone:    { type: String,  attribute: false },
      _quickRunOpen:    { type: Boolean, attribute: false },
      _quickRunZones:   { type: Array,   attribute: false },
      _quickRunDuration:{ type: Number,  attribute: false },
    };
  }

  constructor() {
    super();
    this._expandedZone = null;
    this._quickRunOpen = false;
    this._quickRunZones = [];
    this._quickRunDuration = 10;
    this._countdownTimer = null;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._countdownTimer) {
      clearInterval(this._countdownTimer);
      this._countdownTimer = null;
    }
  }

  get panelType() { return 'irrigation'; }
  get defaultPanelTitle() { return 'Irrigation'; }
  get frameColor() { return 'var(--lcars-ice)'; }

  static get styles() {
    return [...super.styles, sharedKeyframes, sharedReducedMotion, irrigationPanelStyles];
  }

  /* ─── Partition: zones, schedules, controller, binary sensors ─── */

  _partitionIrrigationEntities(entries = []) {
    const zones = [];
    const schedules = [];
    const controller = [];
    const binarySensors = [];

    for (const entry of entries) {
      const domain = entry.domain;
      const eid = entry.entity?.entity_id || '';
      const attrs = entry.state?.attributes || {};

      if (domain === 'switch') {
        if (attrs['Zone number'] != null || attrs.zone_number != null || /zone/i.test(eid)) {
          zones.push(entry);
        } else if (attrs.Type != null || /schedule/i.test(eid)) {
          schedules.push(entry);
        } else {
          controller.push(entry);
        }
        continue;
      }
      if (domain === 'binary_sensor') {
        binarySensors.push(entry);
        continue;
      }
    }

    zones.sort((a, b) => {
      const za = a.state?.attributes?.['Zone number'] ?? a.state?.attributes?.zone_number ?? 999;
      const zb = b.state?.attributes?.['Zone number'] ?? b.state?.attributes?.zone_number ?? 999;
      return za - zb;
    });

    return { zones, schedules, controller, binarySensors };
  }

  /* ─── Helpers ─── */

  _getZoneNumber(state) {
    return state?.attributes?.['Zone number'] ?? state?.attributes?.zone_number ?? '?';
  }

  _getZoneProgress(state) {
    if (state?.state !== 'on') return 0;
    const totalSec = state.attributes?.['Watering Duration seconds'];
    if (!totalSec || totalSec <= 0) return 100;
    const startTime = new Date(state.last_changed).getTime();
    const elapsed = (Date.now() - startTime) / 1000;
    return Math.min(100, (elapsed / totalSec) * 100);
  }

  _getCountdown(state) {
    if (state?.state !== 'on') return '';
    const totalSec = state.attributes?.['Watering Duration seconds'];
    if (!totalSec || totalSec <= 0) return '';
    const startTime = new Date(state.last_changed).getTime();
    const elapsed = (Date.now() - startTime) / 1000;
    const remaining = Math.max(0, totalSec - elapsed);
    const min = Math.floor(remaining / 60);
    const sec = Math.floor(remaining % 60);
    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }

  _findControllerSwitch(controller, keyword) {
    return controller.find(c =>
      c.domain === 'switch' && (c.entity?.entity_id || '').includes(keyword)
    );
  }

  _findBinarySensor(binarySensors, keyword) {
    return binarySensors.find(bs =>
      (bs.entity?.entity_id || '').includes(keyword)
    );
  }

  _handleIrrigationZone(entityId, turnOn) {
    if (!this.#irrigationLimiter.allow()) return;
    this._callService('switch', turnOn ? 'turn_on' : 'turn_off', { entity_id: entityId });
  }

  _handleIrrigationToggle(entityId) {
    if (!this.#irrigationLimiter.allow()) return;
    this._callService('homeassistant', 'toggle', { entity_id: entityId });
  }

  _handlePause() {
    if (!this.#irrigationLimiter.allow()) return;
    this._callService('rachio', 'pause_watering', { duration: 60 });
  }

  _handleResume() {
    if (!this.#irrigationLimiter.allow()) return;
    this._callService('rachio', 'resume_watering', {});
  }

  _handleStopAll() {
    if (!this.#irrigationLimiter.allow()) return;
    this._callService('rachio', 'stop_watering', {});
  }

  _toggleQuickRunZone(entityId) {
    const idx = this._quickRunZones.indexOf(entityId);
    if (idx >= 0) {
      this._quickRunZones = [...this._quickRunZones.filter(z => z !== entityId)];
    } else {
      this._quickRunZones = [...this._quickRunZones, entityId];
    }
  }

  _handleQuickRun() {
    if (!this.#irrigationLimiter.allow()) return;
    if (!this._quickRunZones.length || !this._quickRunDuration) return;
    if (!this.hass) return;
    const duration = clampValue(this._quickRunDuration, 1, 30);
    // Bypass base _callService — Rachio expects array entity_id
    this.hass.callService('rachio', 'start_multiple_zone_schedule', {
      entity_id: this._quickRunZones,
      duration: Array(this._quickRunZones.length).fill(duration),
    });
    this._quickRunOpen = false;
    this._quickRunZones = [];
  }

  /* ─── Badge ─── */

  renderBadge() {
    const { zones, controller } = this._partitionIrrigationEntities(this.group.entities);
    const activeZone = zones.find(z => z.state?.state === 'on');
    const standbyEntry = this._findControllerSwitch(controller, 'standby');
    const isStandby = standbyEntry?.state?.state === 'on';
    // GEORDI-022: Detect offline controller
    const allUnavailable = zones.length > 0 && zones.every(z => z.state?.state === 'unavailable');
    if (allUnavailable) return html`<span style="color:var(--lcars-gray)">OFFLINE</span>`;
    const color = activeZone ? 'var(--lcars-ice)' : isStandby ? 'var(--lcars-gray)' : 'var(--lcars-sunflower)';
    const label = activeZone ? `WATERING Z${this._getZoneNumber(activeZone.state)}` : isStandby ? 'STANDBY' : 'IDLE';
    return html`<span style="color:${color}">${label}</span>`;
  }

  /* ─── Main Content ─── */

  renderContent() {
    const { zones, schedules, controller, binarySensors } = this._partitionIrrigationEntities(this.group.entities);
    const activeZone = zones.find(z => z.state?.state === 'on');

    // Controller switches
    const standbyEntry = this._findControllerSwitch(controller, 'standby');
    const rainDelayEntry = this._findControllerSwitch(controller, 'rain_delay');
    const isStandby = standbyEntry?.state?.state === 'on';
    const isRainDelay = rainDelayEntry?.state?.state === 'on';

    // Binary sensors
    const connectivityEntry = this._findBinarySensor(binarySensors, 'connectivity');
    const rainEntry = this._findBinarySensor(binarySensors, 'rain');
    const isOnline = connectivityEntry?.state?.state === 'on';
    const isRaining = rainEntry?.state?.state === 'on';

    // GEORDI-022 / WESLEY-UX-007: Offline detection — all zones unavailable or connectivity off
    const allUnavailable = zones.length > 0 && zones.every(z => z.state?.state === 'unavailable');
    const isOffline = allUnavailable || (connectivityEntry && !isOnline);
    const lastChanged = connectivityEntry?.state?.last_changed;
    const lastKnownLabel = isOffline && lastChanged ? humanizeTimestamp(lastChanged) : null;

    // Start countdown timer when zone is active
    if (activeZone && !this._countdownTimer) {
      this._countdownTimer = setInterval(() => this.requestUpdate(), 1000);
    } else if (!activeZone && this._countdownTimer) {
      clearInterval(this._countdownTimer);
      this._countdownTimer = null;
    }

    return html`
      <div class="irr-content ${isOffline ? 'irr-offline' : ''}">

        ${isOffline ? html`
          <div class="irr-offline-banner" role="status" aria-live="polite">
            CONTROLLER OFFLINE${lastKnownLabel ? html` · LAST SEEN ${lastKnownLabel}` : ''}
          </div>
        ` : ''}

        <!-- Rain Alert Banner (conditional) -->
        ${!isOffline ? this._renderRainAlert(isRainDelay, isRaining, rainDelayEntry) : ''}

        <!-- Left column: schedules + controller status -->
        <div class="irr-sidebar">
          ${this._renderSchedules(schedules)}
          ${this._renderControllerStatus(isOnline, isStandby, isRainDelay, isRaining)}
        </div>

        <!-- Right column: zone grid -->
        <div class="irr-zones" role="list" aria-label="Irrigation zones">
          ${zones.map(entry => this._renderZoneRow(entry, isStandby || isOffline))}
        </div>

        <!-- Quick Run (collapsible) -->
        ${this._renderQuickRun(zones, isStandby || isOffline)}

        <!-- Controls: standby + pause/resume -->
        ${!isOffline ? this._renderControls(standbyEntry, rainDelayEntry, activeZone) : ''}
      </div>
    `;
  }

  /* ─── Rain Alert Banner ─── */

  _renderRainAlert(isRainDelay, isRaining, rainDelayEntry) {
    if (!isRainDelay && !isRaining) return '';
    const isDelay = isRainDelay;
    const icon = isDelay ? 'mdi:weather-pouring' : 'mdi:weather-rainy';
    const label = isDelay ? 'RAIN DELAY ACTIVE' : 'RAIN DETECTED';
    const color = isDelay ? 'var(--lcars-african-violet)' : 'var(--lcars-ice)';
    return html`
      <div class="irr-rain-alert" style="--alert-color:${color}"
           role="alert" aria-live="polite">
        <ha-icon icon="${icon}"></ha-icon>
        <span class="irr-rain-alert-label">${label}</span>
        ${isDelay ? html`
          <button class="irr-rain-cancel-btn"
            aria-label="Cancel rain delay"
            @click=${() => this._handleIrrigationToggle(rainDelayEntry.entity.entity_id)}>
            CANCEL
          </button>
        ` : ''}
      </div>
    `;
  }

  /* ─── Schedule Strips ─── */

  _renderSchedules(schedules) {
    if (!schedules.length) return '';
    return html`
      <div class="irr-schedules" role="list" aria-label="Irrigation schedules">
        <div class="irr-section-label">SCHEDULES</div>
        ${schedules.map(({ entity, state }) => {
          const name = this._friendlyName(state, entity);
          const isEnabled = state.attributes?.Enabled !== false && state.state !== 'off';
          const schedType = state.attributes?.Type || 'Fixed';
          const duration = state.attributes?.Duration || '';
          const isFlex = /flex/i.test(schedType);
          return html`
            <div class="irr-schedule-strip" role="listitem">
              <button class="irr-schedule-toggle" ?data-on=${isEnabled}
                aria-label="${name}: ${isEnabled ? 'enabled' : 'disabled'}"
                @click=${() => this._handleIrrigationToggle(entity.entity_id)}>
                ${isEnabled ? 'ON' : 'OFF'}
              </button>
              <span class="irr-schedule-name">${name}</span>
              <span class="irr-schedule-type-badge" ?data-flex=${isFlex}>
                ${isFlex ? 'FLEX' : 'FIXED'}
              </span>
              <span class="irr-schedule-duration">${duration}</span>
            </div>
          `;
        })}
      </div>
    `;
  }

  /* ─── Controller Status ─── */

  _renderControllerStatus(isOnline, isStandby, isRainDelay, isRaining) {
    return html`
      <div class="irr-controller-status">
        <div class="irr-section-label">CONTROLLER</div>
        <div class="irr-status-row">
          <span class="irr-status-bar" data-state="${isOnline ? 'on' : 'alert'}"></span>
          <span class="irr-status-label">${isOnline ? 'ONLINE' : 'OFFLINE'}</span>
        </div>
        <div class="irr-status-row">
          <span class="irr-status-bar" data-state="${isStandby ? 'active' : 'off'}"></span>
          <span class="irr-status-label">STANDBY ${isStandby ? 'ON' : 'OFF'}</span>
        </div>
        <div class="irr-status-row">
          <span class="irr-status-bar" data-state="${isRainDelay ? 'delay' : 'off'}"></span>
          <span class="irr-status-label">RAIN DELAY ${isRainDelay ? 'ON' : 'OFF'}</span>
        </div>
        <div class="irr-status-row">
          <span class="irr-status-bar" data-state="${isRaining ? 'on' : 'off'}"></span>
          <span class="irr-status-label">${isRaining ? 'RAIN' : 'NO RAIN'}</span>
        </div>
      </div>
    `;
  }

  /* ─── Zone Row ─── */

  _renderZoneRow(entry, isStandby) {
    const { entity, state } = entry;
    const eid = entity.entity_id;
    const name = this._friendlyName(state, entity);
    const isOn = state.state === 'on';
    const zoneColor = getIrrigationZoneColor(state.state, isStandby);
    const zoneNum = this._getZoneNumber(state);
    const progress = this._getZoneProgress(state);
    const countdown = this._getCountdown(state);
    const photo = state.attributes?.entity_picture;
    const isExpanded = this._expandedZone === eid;

    return html`
      <div class="irr-zone-row ${isOn ? 'active' : ''}" role="listitem">
        <!-- Zone photo thumbnail or fallback -->
        <div class="irr-zone-thumb"
             style="--zone-border:${zoneColor}"
             @click=${() => showMoreInfo(eid)}>
          ${photo ? html`
            <img src="${photo}" alt="${name} zone photo"
                 loading="lazy" referrerpolicy="no-referrer"
                 @error=${(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'flex'; }}>
            <span class="irr-zone-thumb-fallback" style="display:none">
              <ha-icon icon="${VEGETATION_ICONS[state.attributes?.Type] || 'mdi:grass'}"></ha-icon>
            </span>
          ` : html`
            <span class="irr-zone-thumb-fallback">
              <ha-icon icon="${VEGETATION_ICONS[state.attributes?.Type] || 'mdi:grass'}"></ha-icon>
            </span>
          `}
          <span class="irr-zone-num">${zoneNum}</span>
        </div>

        <!-- Zone action button -->
        <button class="irr-zone-btn" ?data-on=${isOn}
          ?disabled=${isStandby}
          aria-label="${isOn ? 'Stop' : 'Start'} watering ${name}"
          @click=${() => this._handleIrrigationZone(eid, !isOn)}>
          ${isOn ? 'STOP' : 'START'}
        </button>

        <!-- Zone info -->
        <div class="irr-zone-info"
             @click=${() => { this._expandedZone = isExpanded ? null : eid; }}>
          <span class="irr-zone-name">${name}</span>
          <span class="irr-zone-status" style="color:${zoneColor}">
            ${state.state === 'unavailable' ? 'OFFLINE' : isStandby ? 'STANDBY' : isOn ? 'WATERING' : 'IDLE'}
          </span>
        </div>

        <!-- Countdown timer (when active) -->
        ${countdown ? html`
          <span class="irr-zone-countdown">${countdown}</span>
        ` : ''}

        <!-- Active zone fill bar (barberpole) -->
        ${isOn ? html`
          <div class="irr-zone-fill active" role="progressbar"
            aria-label="Watering progress" aria-valuemin="0" aria-valuemax="100"
            aria-valuenow="${Math.round(progress)}"
            style="width:${progress}%"></div>
        ` : ''}

        <!-- Expanded detail row -->
        ${isExpanded ? this._renderZoneDetail(state) : ''}
      </div>
    `;
  }

  /* ─── Zone Detail Expansion ─── */

  _renderZoneDetail(state) {
    const attrs = state.attributes || {};
    const shade = attrs.Shade;
    const vegetation = attrs.Type;
    const slope = attrs.Slope;
    const summary = attrs.Summary;

    const badges = [];
    if (shade) {
      badges.push({ icon: SHADE_ICONS[shade] || 'mdi:weather-sunny', label: shade, color: 'var(--lcars-sunflower)' });
    }
    if (vegetation) {
      badges.push({ icon: VEGETATION_ICONS[vegetation] || 'mdi:grass', label: vegetation, color: 'var(--lcars-ice)' });
    }
    if (slope) {
      badges.push({ icon: SLOPE_ICONS[slope] || 'mdi:triangle-outline', label: slope, color: 'var(--lcars-butterscotch)' });
    }

    return html`
      <div class="irr-zone-detail">
        <div class="irr-zone-attrs">
          ${badges.map(b => html`
            <span class="irr-zone-attr-badge" style="--badge-color:${b.color}">
              <ha-icon icon="${b.icon}"></ha-icon>
              ${b.label}
            </span>
          `)}
        </div>
        ${summary ? html`<div class="irr-zone-summary">${summary}</div>` : ''}
      </div>
    `;
  }

  /* ─── Quick Run Builder ─── */

  _renderQuickRun(zones, isStandby) {
    return html`
      <div class="irr-quickrun">
        <button class="irr-quickrun-header"
          aria-expanded="${this._quickRunOpen}"
          @click=${() => { this._quickRunOpen = !this._quickRunOpen; }}>
          QUICK RUN ${this._quickRunOpen ? '▾' : '▸'}
        </button>
        ${this._quickRunOpen ? html`
          <div class="irr-quickrun-body">
            <!-- Zone selector -->
            <div class="irr-quickrun-row">
              <span class="irr-quickrun-label">ZONES</span>
              <div class="irr-zone-selector">
                ${zones.map(({ entity, state }) => {
                  const zn = this._getZoneNumber(state);
                  const eid = entity.entity_id;
                  const selected = this._quickRunZones.includes(eid);
                  return html`
                    <button class="irr-zone-select-btn" ?data-selected=${selected}
                      ?disabled=${isStandby}
                      aria-label="Zone ${zn}" aria-pressed="${selected}"
                      @click=${() => this._toggleQuickRunZone(eid)}>
                      ${zn}
                    </button>
                  `;
                })}
              </div>
            </div>
            <!-- Duration selector -->
            <div class="irr-quickrun-row">
              <span class="irr-quickrun-label">DURATION</span>
              <div class="irr-duration-selector">
                ${[3, 5, 10, 15, 20].map(min => html`
                  <button class="irr-duration-btn" ?data-selected=${this._quickRunDuration === min}
                    aria-label="${min} minutes" aria-pressed="${this._quickRunDuration === min}"
                    @click=${() => { this._quickRunDuration = min; }}>
                    ${min}M
                  </button>
                `)}
              </div>
            </div>
            <!-- Engage -->
            <button class="irr-engage-btn"
              ?disabled=${!this._quickRunZones.length || isStandby}
              aria-label="Start quick run: ${this._quickRunZones.length} zones for ${this._quickRunDuration} minutes"
              @click=${() => this._handleQuickRun()}>
              ENGAGE
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }

  /* ─── Controls: Standby + Rain Delay + Pause/Resume ─── */

  _renderControls(standbyEntry, rainDelayEntry, activeZone) {
    return html`
      <div class="irr-controls">
        ${standbyEntry ? html`
          <button class="irr-control-btn" ?data-on=${standbyEntry.state?.state === 'on'}
            role="switch" aria-checked="${standbyEntry.state?.state === 'on'}"
            aria-label="Standby mode: ${standbyEntry.state?.state === 'on' ? 'active' : 'inactive'}"
            @click=${() => this._handleIrrigationToggle(standbyEntry.entity.entity_id)}>
            STANDBY
          </button>
        ` : ''}
        ${rainDelayEntry ? html`
          <button class="irr-control-btn" ?data-on=${rainDelayEntry.state?.state === 'on'}
            aria-label="Rain delay: ${rainDelayEntry.state?.state === 'on' ? 'active, click to cancel' : 'inactive, click to activate 24 hour delay'}"
            @click=${() => this._handleIrrigationToggle(rainDelayEntry.entity.entity_id)}>
            RAIN DELAY
          </button>
        ` : ''}
        ${activeZone ? html`
          <button class="irr-control-btn irr-pause-btn"
            aria-label="Pause watering for 60 minutes"
            @click=${() => this._handlePause()}>
            PAUSE
          </button>
          <button class="irr-control-btn irr-stop-btn"
            aria-label="Stop all watering"
            @click=${() => this._handleStopAll()}>
            STOP ALL
          </button>
        ` : ''}
      </div>
    `;
  }
}

if (!customElements.get('lcars-irrigation-panel')) {
  customElements.define('lcars-irrigation-panel', LcarsIrrigationPanel);
}
