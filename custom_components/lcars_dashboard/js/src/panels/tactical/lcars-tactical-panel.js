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
  isTacticalEntity, ALARM_DOMAINS,
  SENSOR_DOMAINS,
} from '../../lcars-entity-utils.js';
import { showMoreInfo, lcarsLog } from '../../lcars-helpers.js';
import { sharedKeyframes, sharedReducedMotion } from '../../lcars-shared-animations.js';
import { lcarsFocusRing } from '../../lcars-styles.js';
import { tacticalPanelStyles } from './lcars-tactical-panel-styles.js';

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
      const state = alarmEntry.state?.state || '';
      if (state === 'triggered') return 'var(--lcars-tomato)';
      if (state === 'armed_away' || state === 'armed_vacation') return 'var(--lcars-butterscotch)';
      if (state === 'armed_home' || state === 'armed_night') return 'var(--lcars-sunflower)';
      if (state === 'arming' || state === 'pending') return 'var(--lcars-gold)';
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
          const isSecure = isLock
            ? entry.state?.state === 'locked'
            : entry.state?.state === 'closed';
          const stateText = isLock
            ? (isSecure ? 'LOCKED' : 'UNLOCKED')
            : (entry.state?.state || '').toUpperCase();
          const indicatorColor = isSecure ? 'var(--lcars-sunflower)' : 'var(--lcars-tomato)';

          return html`
            <div class="tactical-access-row"
                 role="listitem"
                 tabindex="0"
                 aria-label="${name}: ${stateText}"
                 ?data-secure=${isSecure}
                 ?data-breach=${!isSecure}
                 @click=${() => isLock ? this._toggleLock(eid, isSecure) : showMoreInfo(eid)}
                 @keydown=${(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), isLock ? this._toggleLock(eid, isSecure) : showMoreInfo(eid))}>
              <span class="tactical-access-indicator" style="background:${indicatorColor}"></span>
              <span class="tactical-access-name">${name}</span>
              <span class="tactical-access-state">${stateText}</span>
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

  _renderMotionSection(motionEntries) {
    return html`
      <div class="tactical-motion" role="list" aria-label="Motion sensors" aria-live="polite">
        <div class="tactical-section-label" style="width:100%">MOTION</div>
        ${motionEntries.map(entry => {
          const eid = entry.entity?.entity_id || '';
          const name = entry.state?.attributes?.friendly_name || eid;
          const isDetected = entry.state?.state === 'on';
          const stateText = isDetected ? 'DETECTED' : 'CLEAR';
          const indicatorColor = isDetected ? 'var(--lcars-butterscotch)' : 'var(--lcars-gray)';

          return html`
            <div class="tactical-motion-chip"
                 role="listitem"
                 tabindex="0"
                 aria-label="${name}: ${stateText}"
                 ?data-detected=${isDetected}
                 ?data-clear=${!isDetected}
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

  /* ─── Lock Toggle ─── */

  _toggleLock(entityId, isCurrentlyLocked) {
    const service = isCurrentlyLocked ? 'unlock' : 'lock';
    this._callService('lock', service, { entity_id: entityId });
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
