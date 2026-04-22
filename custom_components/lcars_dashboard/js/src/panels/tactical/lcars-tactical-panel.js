/**
 * lcars-tactical-panel.js (4X-42)
 *
 * Area-level composite panel: Tactical — consolidates alarm, locks,
 * door/window sensors, motion sensors, and security covers into one view.
 *
 * Composes existing <lcars-alarm-panel> as nested substation.
 * Four graceful degradation configurations:
 *   Full:       alarm + locks/sensors → alarm substation + access + perimeter + motion
 *   Alarm only: alarm entity only → compose alarm panel nested
 *   Access+Perimeter: locks + sensors, no alarm → access + perimeter + motion
 *   Sensors only: only door/window or motion sensors → compact status grid
 */
import { html, css } from 'lit-element';
import { LcarsBasePanel } from '../../lcars-base-panel.js';
import {
  isTacticalEntity, ALARM_DOMAINS, CAMERA_DOMAINS,
  SENSOR_DOMAINS,
} from '../../lcars-entity-utils.js';
import { getAlarmStateColor } from '../../lcars-color-utils.js';
import { showMoreInfo, lcarsLog } from '../../lcars-helpers.js';
import { sharedKeyframes, sharedReducedMotion } from '../../lcars-shared-animations.js';
import { lcarsFocusRing } from '../../lcars-styles.js';
import { tacticalPanelStyles } from './lcars-tactical-panel-styles.js';
import { lcarsAudio } from '../../lcars-audio.js';

/* Import alarm panel for composition */
import '../alarm/lcars-alarm-panel.js';
import '../../components/lcars-summary-badge/lcars-summary-badge.js';

const TAG = 'TacticalPanel';

class LcarsTacticalPanel extends LcarsBasePanel {

  static get properties() {
    return {
      ...super.properties,
    };
  }

  get panelType() { return 'tactical'; }
  get defaultPanelTitle() { return 'TACTICAL'; }

  get frameColor() {
    const alarmEntry = this._getAlarmEntry();
    if (alarmEntry) {
      return getAlarmStateColor(alarmEntry.state?.state || 'unavailable');
    }
    // No alarm: check for breaches
    const accessEntries = this._getAccessEntries();
    const hasBreach = accessEntries.some(e => {
      if (e.domain === 'lock') return e.state?.state !== 'locked';
      return e.state?.state === 'open';
    });
    return hasBreach ? 'var(--lcars-butterscotch)' : 'var(--lcars-ice)';
  }

  static get styles() {
    return [
      ...super.styles,
      sharedKeyframes,
      sharedReducedMotion,
      lcarsFocusRing,
      tacticalPanelStyles,
    ];
  }

  /* ─── Entity Partitioning ─── */

  _partitionEntities() {
    const allEntries = this._getAllEntities();
    const alarmEntries = [];
    const accessEntries = [];    // locks + security covers
    const perimeterEntries = []; // door/window/opening sensors
    const motionEntries = [];    // motion/occupancy sensors

    // Camera-device motion/occupancy stays with the camera panel, not tactical
    const cameraDeviceIds = new Set();
    for (const e of allEntries) {
      if (CAMERA_DOMAINS.has(e.domain) && e.entity?.device_id) {
        cameraDeviceIds.add(e.entity.device_id);
      }
    }

    for (const entry of allEntries) {
      if (ALARM_DOMAINS.has(entry.domain)) {
        alarmEntries.push(entry);
      } else if (entry.domain === 'lock') {
        accessEntries.push(entry);
      } else if (entry.domain === 'cover') {
        const dc = entry.state?.attributes?.device_class || '';
        if (['garage_door', 'gate', 'door'].includes(dc)) {
          accessEntries.push(entry);
        }
      } else if (entry.domain === 'binary_sensor') {
        const dc = entry.state?.attributes?.device_class || '';
        if (['door', 'window', 'opening', 'garage_door'].includes(dc)) {
          perimeterEntries.push(entry);
        } else if (['motion', 'occupancy'].includes(dc)) {
          // Skip motion/occupancy owned by camera devices
          if (entry.entity?.device_id && cameraDeviceIds.has(entry.entity.device_id)) continue;
          motionEntries.push(entry);
        } else if (['tamper', 'safety'].includes(dc)) {
          perimeterEntries.push(entry); // tamper/safety in perimeter section
        }
      }
    }

    const hasAlarm = alarmEntries.length > 0;
    const hasAccess = accessEntries.length > 0;
    const hasPerimeter = perimeterEntries.length > 0;
    const hasMotion = motionEntries.length > 0;
    const hasSensors = hasAccess || hasPerimeter || hasMotion;

    let config;
    if (hasAlarm && hasSensors) config = 'full';
    else if (hasAlarm && !hasSensors) config = 'alarm-only';
    else if (!hasAlarm && (hasAccess || hasPerimeter)) config = 'no-alarm';
    else config = 'sensors-only';

    return { alarmEntries, accessEntries, perimeterEntries, motionEntries, config };
  }

  _getAlarmEntry() {
    const allEntries = this._getAllEntities();
    return allEntries.find(e => ALARM_DOMAINS.has(e.domain)) || null;
  }

  _getAccessEntries() {
    const { accessEntries } = this._partitionEntities();
    return accessEntries;
  }

  /* ─── Badge ─── */

  renderBadge() {
    const alarmEntry = this._getAlarmEntry();
    const { accessEntries, perimeterEntries } = this._partitionEntities();

    const openPerimeter = perimeterEntries.filter(e => e.state?.state === 'on').length;
    const unlockedAccess = accessEntries.filter(e => {
      if (e.domain === 'lock') return e.state?.state !== 'locked';
      return e.state?.state === 'open';
    }).length;

    if (alarmEntry?.state?.state === 'triggered') {
      return html`<lcars-summary-badge value="⚠ ALERT" color="var(--lcars-tomato)"></lcars-summary-badge>`;
    }
    if (alarmEntry) {
      const label = (alarmEntry.state?.state || '').toUpperCase().replace(/_/g, ' ');
      return html`<lcars-summary-badge value="${label}" color="${this.frameColor}"></lcars-summary-badge>`;
    }
    if (unlockedAccess > 0 || openPerimeter > 0) {
      return html`<lcars-summary-badge value="${unlockedAccess + openPerimeter} OPEN" color="var(--lcars-butterscotch)"></lcars-summary-badge>`;
    }
    return html`<lcars-summary-badge value="SECURE" color="var(--lcars-ice)"></lcars-summary-badge>`;
  }

  /* ─── Render ─── */

  renderContent() {
    const { alarmEntries, accessEntries, perimeterEntries, motionEntries, config } = this._partitionEntities();

    return html`
      <div class="tactical-content ${config}">
        ${alarmEntries.length > 0 ? this._renderAlarmSection(alarmEntries) : ''}
        ${accessEntries.length > 0 ? this._renderAccessSection(accessEntries) : ''}
        ${perimeterEntries.length > 0 ? this._renderPerimeterSection(perimeterEntries) : ''}
        ${motionEntries.length > 0 ? this._renderMotionSection(motionEntries) : ''}
      </div>
    `;
  }

  /* ─── Alarm Section (nested composition) ─── */

  _renderAlarmSection(alarmEntries) {
    const devices = this.hass?.devices || {};
    const alarmGroup = this._buildGroup(alarmEntries, devices);
    return html`
      <div class="tactical-alarm">
        <lcars-alarm-panel
          .group=${alarmGroup}
          .hass=${this.hass}
          .editMode=${this.editMode}
          .config=${this.config}
          frame-mode="nested">
        </lcars-alarm-panel>
      </div>
    `;
  }

  /* ─── Access Points (locks + covers) ─── */

  _renderAccessSection(accessEntries) {
    return html`
      <div class="tactical-access" role="list" aria-label="Access points">
        <div class="tactical-section-label">ACCESS POINTS</div>
        ${accessEntries.map(entry => {
          const eid = entry.entity?.entity_id || '';
          const name = entry.state?.attributes?.friendly_name || eid;
          const isLock = entry.domain === 'lock';
          const isCover = entry.domain === 'cover';

          let isSecure, stateText, indicatorColor, actionHint = '', isTransitional = false;
          if (isLock) {
            isSecure = entry.state?.state === 'locked';
            stateText = isSecure ? 'LOCKED' : 'UNLOCKED';
            indicatorColor = isSecure ? 'var(--lcars-sunflower)' : 'var(--lcars-tomato)';
          } else if (isCover) {
            const info = this._getCoverStateInfo(entry.state);
            stateText = info.text;
            actionHint = info.hint;
            isSecure = entry.state?.state === 'closed';
            indicatorColor = info.color;
            isTransitional = info.transitional;
          } else {
            isSecure = entry.state?.state === 'closed' || entry.state?.state === 'locked';
            stateText = (entry.state?.state || '').toUpperCase();
            indicatorColor = isSecure ? 'var(--lcars-sunflower)' : 'var(--lcars-tomato)';
          }

          const position = isCover ? (entry.state?.attributes?.current_position ?? null) : null;
          const isConfirming = this._pendingConfirm?.entityId === eid;

          const handleClick = () => {
            if (isTransitional && isCover) {
              this._callService('cover', 'stop_cover', { entity_id: eid });
            } else if (isLock) {
              this._toggleLock(eid, !isSecure);
            } else if (isCover) {
              this._toggleCover(eid, entry.state?.state);
            } else {
              showMoreInfo(eid);
            }
          };

          if (isConfirming) {
            return html`
              <div class="tactical-access-row tactical-confirm-strip"
                   role="alert"
                   tabindex="0"
                   aria-label="${this._pendingConfirm.label}"
                   @click=${() => this._executeConfirm()}
                   @keydown=${(e) => {
                     if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._executeConfirm(); }
                     if (e.key === 'Escape') { e.preventDefault(); this._cancelConfirm(); }
                   }}>
                <span class="confirm-label">${this._pendingConfirm.label}</span>
                <div class="confirm-countdown-bar"></div>
              </div>
            `;
          }

          return html`
            <div class="tactical-access-row"
                 role="listitem"
                 tabindex="0"
                 aria-label="${name}: ${stateText}"
                 ?data-secure=${isSecure}
                 ?data-breach=${!isSecure}
                 ?data-transitional=${isTransitional}
                 @click=${handleClick}
                 @keydown=${(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), handleClick())}>
              <span class="tactical-access-indicator" style="background:${indicatorColor}"></span>
              <span class="tactical-access-name">${name}</span>
              ${position !== null ? html`
                <span class="tactical-cover-position" aria-label="Position: ${position}%">
                  <span class="cover-pos-track">
                    <span class="cover-pos-fill" style="height:${position}%"></span>
                  </span>
                  <span class="cover-pos-value">${position}%</span>
                </span>
              ` : ''}
              <span class="tactical-access-state">${stateText}</span>
              ${actionHint ? html`<span class="tactical-access-hint">${actionHint}</span>` : ''}
            </div>
          `;
        })}
      </div>
    `;
  }

  /* ─── Perimeter (door/window sensors) ─── */

  _renderPerimeterSection(perimeterEntries) {
    return html`
      <div class="tactical-perimeter" role="list" aria-label="Perimeter sensors" aria-live="polite">
        <div class="tactical-section-label" style="width:100%">PERIMETER</div>
        ${perimeterEntries.map(entry => {
          const eid = entry.entity?.entity_id || '';
          const name = entry.state?.attributes?.friendly_name || eid;
          const isOpen = entry.state?.state === 'on';
          const stateText = isOpen ? 'OPEN' : 'CLOSED';
          const indicatorColor = isOpen ? 'var(--lcars-butterscotch)' : 'var(--lcars-gray)';

          return html`
            <div class="tactical-perim-chip"
                 role="listitem"
                 tabindex="0"
                 aria-label="${name}: ${stateText}"
                 ?data-open=${isOpen}
                 ?data-closed=${!isOpen}
                 @click=${() => showMoreInfo(eid)}
                 @keydown=${(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), showMoreInfo(eid))}>
              <span class="chip-indicator" style="background:${indicatorColor}"></span>
              <span class="chip-name">${name}</span>
              <span class="chip-state">${stateText}</span>
            </div>
          `;
        })}
      </div>
    `;
  }

  /* ─── Motion Sensors ─── */

  /**
   * Find sibling entities (battery, light/illuminance) for motion sensor devices.
   * Returns Map<deviceId, { motion, battery, ambient }>.
   */
  _groupMotionDevices(motionEntries) {
    const hassEntities = this.hass?.entities || {};
    const hassStates = this.hass?.states || {};
    const deviceMap = new Map();

    // Build groups keyed by device_id (or entity_id for orphans)
    for (const entry of motionEntries) {
      const devId = entry.entity?.device_id;
      const key = devId || entry.entity?.entity_id || '';
      if (!deviceMap.has(key)) {
        deviceMap.set(key, { motion: null, battery: null, ambient: null, deviceId: devId });
      }
      deviceMap.get(key).motion = entry;
    }

    // For each device with a device_id, find battery and light/illuminance siblings
    const motionDeviceIds = new Set();
    for (const [, group] of deviceMap) {
      if (group.deviceId) motionDeviceIds.add(group.deviceId);
    }

    if (motionDeviceIds.size > 0) {
      for (const [entityId, regEntry] of Object.entries(hassEntities)) {
        const devId = regEntry.device_id;
        if (!devId || !motionDeviceIds.has(devId)) continue;

        const stateObj = hassStates[entityId];
        if (!stateObj) continue;

        const dc = stateObj.attributes?.device_class || '';
        const group = [...deviceMap.values()].find(g => g.deviceId === devId);
        if (!group) continue;

        if (dc === 'battery' && !group.battery) {
          group.battery = { entity: regEntry, state: stateObj };
        } else if ((dc === 'light' || dc === 'illuminance') && !group.ambient) {
          group.ambient = { entity: regEntry, state: stateObj };
        }
      }
    }

    return deviceMap;
  }

  _renderMotionSection(motionEntries) {
    const deviceMap = this._groupMotionDevices(motionEntries);

    return html`
      <div class="tactical-motion" role="list" aria-label="Motion sensors" aria-live="polite">
        <div class="tactical-section-label" style="width:100%">MOTION</div>
        ${[...deviceMap.values()].map(({ motion, battery, ambient, deviceId }) => {
          if (!motion) return '';
          const eid = motion.entity?.entity_id || '';
          // Composite chips: use short device name; standalone: use entity name
          const hasMeta = battery || ambient;
          let name;
          if (hasMeta && deviceId) {
            const device = this.hass?.devices?.[deviceId];
            const rawName = device?.name_by_user || device?.name || '';
            const area = this.hass?.areas?.[this.areaId];
            if (area?.name && rawName.toLowerCase().startsWith(area.name.toLowerCase())) {
              name = rawName.slice(area.name.length).trim().replace(/^[-–:]\s*/, '') || rawName;
            } else {
              name = rawName || motion.state?.attributes?.friendly_name || eid;
            }
          } else {
            name = motion.state?.attributes?.friendly_name || eid;
          }
          const isDetected = motion.state?.state === 'on';
          const stateText = isDetected ? 'DETECTED' : 'CLEAR';
          const indicatorColor = isDetected ? 'var(--lcars-butterscotch)' : 'var(--lcars-ice)';

          // Battery
          const battLevel = battery ? Number(battery.state?.state) || 0 : null;
          const battColor = battLevel !== null ? this._batteryColor(battLevel) : null;

          // Ambient light (binary_sensor light: on=bright, or sensor illuminance)
          const isBright = ambient
            ? (ambient.state?.attributes?.device_class === 'illuminance'
              ? Number(ambient.state?.state) > 10
              : ambient.state?.state === 'on')
            : null;

          const ariaLabel = `${name}: ${stateText}`
            + (battLevel !== null ? `, battery ${battLevel}%` : '')
            + (isBright !== null ? `, ${isBright ? 'bright' : 'dark'}` : '');

          return html`
            <div class="tactical-motion-chip ${hasMeta ? 'composite' : ''}"
                 role="listitem"
                 tabindex="0"
                 aria-label="${ariaLabel}"
                 ?data-detected=${isDetected}
                 ?data-clear=${!isDetected}
                 @click=${() => showMoreInfo(eid)}
                 @keydown=${(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), showMoreInfo(eid))}>
              <span class="chip-indicator" style="background:${indicatorColor}"></span>
              <span class="chip-name">${name}</span>
              <span class="chip-state">${stateText}</span>
              ${hasMeta ? html`
                <span class="chip-meta">
                  ${isBright !== null ? html`
                    <span class="chip-ambient ${isBright ? 'bright' : 'dark'}"
                          aria-hidden="true"
                          title="${isBright ? 'Bright' : 'Dark'}"></span>
                  ` : ''}
                  ${battLevel !== null ? html`
                    <span class="chip-battery" aria-hidden="true"
                          title="Battery: ${battLevel}%">
                      <span class="chip-battery-bar"
                            style="--battery-color: ${battColor}">
                        ${[1,2,3,4,5].map(seg => html`
                          <span class="chip-battery-seg ${this._batterySegFilled(battLevel, seg) ? 'filled' : ''}"></span>
                        `)}
                      </span>
                      <span class="chip-battery-pct">${battLevel}%</span>
                    </span>
                  ` : ''}
                </span>
              ` : ''}
            </div>
          `;
        })}
      </div>
    `;
  }

  _batterySegFilled(level, seg) {
    const thresholds = [0, 11, 26, 51, 76];
    return level >= thresholds[seg - 1];
  }

  _batteryColor(level) {
    if (level <= 10) return 'var(--lcars-tomato)';
    if (level <= 25) return 'var(--lcars-peach)';
    if (level <= 50) return 'var(--lcars-butterscotch)';
    return 'var(--lcars-sunflower)';
  }

  /* ─── Lock Toggle (confirm-gated) ─── */

  _toggleLock(entityId, isCurrentlyLocked) {
    lcarsAudio.play('lockToggle');
    if (isCurrentlyLocked) {
      // Locking is safe — execute immediately
      this._callService('lock', 'lock', { entity_id: entityId });
    } else {
      // Unlocking is risky — require confirmation
      this._requestConfirm(entityId, (eid) => {
        this._callService('lock', 'unlock', { entity_id: eid });
      }, 'CONFIRM UNLOCK?');
    }
  }

  /* ─── Cover Toggle (confirm-gated) ─── */

  _toggleCover(entityId, currentState) {
    lcarsAudio.play('coverAction');
    if (currentState === 'closed') {
      this._requestConfirm(entityId, (eid) => {
        this._callService('cover', 'open_cover', { entity_id: eid });
      }, 'CONFIRM OPEN?');
    } else if (currentState === 'open') {
      this._requestConfirm(entityId, (eid) => {
        this._callService('cover', 'close_cover', { entity_id: eid });
      }, 'CONFIRM CLOSE?');
    } else if (currentState === 'opening' || currentState === 'closing') {
      // Stopping is safe — immediate
      this._callService('cover', 'stop_cover', { entity_id: entityId });
    }
  }

  /* ─── Cover State Info ─── */

  _getCoverStateInfo(state) {
    const s = state?.state || '';
    switch (s) {
      case 'open':    return { text: 'OPEN',      hint: 'TAP TO CLOSE', color: 'var(--lcars-tomato)',       transitional: false };
      case 'closed':  return { text: 'CLOSED',    hint: 'TAP TO OPEN',  color: 'var(--lcars-sunflower)',    transitional: false };
      case 'opening': return { text: 'OPENING…',  hint: '',             color: 'var(--lcars-butterscotch)', transitional: true  };
      case 'closing': return { text: 'CLOSING…',  hint: '',             color: 'var(--lcars-butterscotch)', transitional: true  };
      case 'stopped': return { text: 'STOPPED',   hint: 'TAP TO OPEN',  color: 'var(--lcars-peach)',        transitional: false };
      default:        return { text: 'UNKNOWN',   hint: '',             color: 'var(--lcars-disabled)',     transitional: false };
    }
  }

  /* ─── Inline Confirmation Strip ─── */

  _pendingConfirm = null; // { entityId, action, label, timer }

  _requestConfirm(entityId, action, label) {
    this._cancelConfirm();
    this._pendingConfirm = { entityId, action, label };
    this._pendingConfirm.timer = setTimeout(() => {
      this._cancelConfirm();
    }, 5000);
    this.requestUpdate();
  }

  _executeConfirm() {
    if (!this._pendingConfirm) return;
    const { entityId, action } = this._pendingConfirm;
    clearTimeout(this._pendingConfirm.timer);
    this._pendingConfirm = null;
    action(entityId);
    this.requestUpdate();
  }

  _cancelConfirm() {
    if (!this._pendingConfirm) return;
    clearTimeout(this._pendingConfirm.timer);
    this._pendingConfirm = null;
    this.requestUpdate();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._cancelConfirm();
  }

  /* ─── Helper: build group object for alarm substation ─── */

  _buildGroup(entries, devices) {
    let primaryDevice = null;
    for (const e of entries) {
      const devId = e.entity?.device_id;
      if (devId && devices[devId]) {
        primaryDevice = devices[devId];
        break;
      }
    }
    return { device: primaryDevice, entities: entries };
  }
}

customElements.define('lcars-tactical-panel', LcarsTacticalPanel);
