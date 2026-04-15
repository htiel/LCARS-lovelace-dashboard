/**
 * lcars-alarm-panel.js
 *
 * Extracted alarm device panel — shield viewscreen, PIN keypad,
 * zone sensors, arm mode strip.
 *
 * v4.17.0 Panel Extraction Architecture (4X-4)
 */
import { html } from 'lit-element';
import { LcarsBasePanel } from '../../lcars-base-panel.js';
import { getAlarmStateColor } from '../../lcars-color-utils.js';
import { createRateLimiter } from '../../lcars-service-utils.js';
import { sharedKeyframes, sharedReducedMotion } from '../../lcars-shared-animations.js';
import { alarmPanelStyles } from './lcars-alarm-panel-styles.js';

class LcarsAlarmPanel extends LcarsBasePanel {

  _alarmPinCode = '';
  _alarmPinLimiter = createRateLimiter(3, 60000);
  _alarmCountdown = null;
  _alarmCountdownTimer = null;
  _alarmPinError = false;

  get panelType() { return 'alarm'; }
  get defaultPanelTitle() { return 'Alarm'; }
  get frameColor() {
    const as = this.group?.entities?.find(e => e.domain === 'alarm_control_panel')?.state;
    return getAlarmStateColor(as?.state || 'unavailable');
  }

  static get styles() {
    return [...super.styles, sharedKeyframes, sharedReducedMotion, alarmPanelStyles];
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._stopAlarmCountdown();
  }

  updated(changedProps) {
    super.updated(changedProps);
    const as = this.group?.entities?.find(e => e.domain === 'alarm_control_panel')?.state;
    const isTransitional = ['arming', 'pending', 'disarming'].includes(as?.state);
    if (isTransitional && this._alarmCountdown == null) {
      this._startAlarmCountdown(as?.attributes?.delay || 60);
    } else if (!isTransitional && this._alarmCountdown != null) {
      this._stopAlarmCountdown();
    }
  }

  _partitionAlarmEntities(entries, categoryEntities) {
    const alarm = [];
    const zones = [];
    const auxiliary = [];
    const diagnostics = [];
    const ZONE_CLASSES = new Set(['door', 'window', 'motion', 'vibration', 'moisture', 'cold', 'smoke', 'safety', 'opening', 'garage_door', 'lock', 'tamper', 'problem']);

    for (const entry of entries) {
      if (entry.domain === 'alarm_control_panel') { alarm.push(entry); continue; }
      if (entry.domain === 'binary_sensor') {
        const dc = entry.state?.attributes?.device_class || '';
        if (ZONE_CLASSES.has(dc)) { zones.push(entry); continue; }
      }
      auxiliary.push(entry);
    }

    if (categoryEntities) {
      for (const e of categoryEntities.diagnostic || []) {
        const state = this._getEntityState(e.entity_id);
        if (!state) continue;
        diagnostics.push({ entity: e, domain: e.entity_id.split('.')[0], state });
      }
    }
    return { alarm, zones, auxiliary, diagnostics };
  }

  _handleAlarmPinDigit(digit) {
    if (this._alarmPinCode.length >= 6) return;
    this._alarmPinCode += String(digit).replace(/\D/g, '').charAt(0) || '';
    this._alarmPinError = false;
    this.requestUpdate();
  }

  _handleAlarmPinClear() {
    this._alarmPinCode = '';
    this._alarmPinError = false;
    this.requestUpdate();
  }

  _handleAlarmArm(entityId, mode) {
    const code = this._alarmPinCode || undefined;
    this.hass.callService('alarm_control_panel', `alarm_arm_${mode}`, {
      entity_id: entityId, ...(code ? { code } : {}),
    });
    this._alarmPinCode = '';
    this.requestUpdate();
  }

  _handleAlarmDisarm(entityId) {
    if (!this._alarmPinLimiter.allow()) {
      this._alarmPinError = true;
      this.requestUpdate();
      return;
    }
    const code = this._alarmPinCode || undefined;
    this.hass.callService('alarm_control_panel', 'alarm_disarm', {
      entity_id: entityId, ...(code ? { code } : {}),
    });
    this._alarmPinCode = '';
    this.requestUpdate();
  }

  _startAlarmCountdown(seconds) {
    this._alarmCountdown = Math.max(0, seconds);
    if (this._alarmCountdownTimer) clearInterval(this._alarmCountdownTimer);
    this._alarmCountdownTimer = setInterval(() => {
      this._alarmCountdown = Math.max(0, (this._alarmCountdown || 0) - 1);
      this.requestUpdate();
      if (this._alarmCountdown <= 0) {
        clearInterval(this._alarmCountdownTimer);
        this._alarmCountdownTimer = null;
      }
    }, 1000);
  }

  _stopAlarmCountdown() {
    if (this._alarmCountdownTimer) {
      clearInterval(this._alarmCountdownTimer);
      this._alarmCountdownTimer = null;
    }
    this._alarmCountdown = null;
  }

  _getAlarmShieldSymbol(s) {
    switch (s) {
      case 'disarmed': return '✓';
      case 'armed_home': case 'armed_night': return '◉';
      case 'armed_away': case 'armed_vacation': return '▲';
      case 'triggered': return '✕';
      case 'arming': case 'pending': case 'disarming': return '⋯';
      default: return '?';
    }
  }

  _handleAlarmKeydown(e, entityId) {
    const key = e.key;
    if (/^[0-9]$/.test(key)) { e.preventDefault(); this._handleAlarmPinDigit(key); }
    else if (key === 'Backspace') { e.preventDefault(); this._alarmPinCode = this._alarmPinCode.slice(0, -1); this.requestUpdate(); }
    else if (key === 'Enter') { e.preventDefault(); this._handleAlarmDisarm(entityId); }
    else if (key === 'Escape') { e.preventDefault(); this._handleAlarmPinClear(); }
  }

  renderBadge() {
    const as = this.group?.entities?.find(e => e.domain === 'alarm_control_panel')?.state;
    const alarmState = as?.state || 'unavailable';
    const stateColor = getAlarmStateColor(alarmState);
    const stateLabel = (alarmState || 'unknown').toUpperCase().replace(/_/g, ' ');
    return html`<span style="color:${stateColor}">${stateLabel}</span>`;
  }

  renderContent() {
    const categoryEntities = this._getDeviceCategoryEntities(this.group.device.id);
    const { alarm, zones, auxiliary } = this._partitionAlarmEntities(this.group.entities, categoryEntities);
    const deviceName = this._shortDeviceName(this.group.device) || 'Alarm';

    if (alarm.length === 0) return html``;
    const primary = alarm[0];
    const as = primary.state;
    const alarmState = as?.state || 'unavailable';
    const stateColor = getAlarmStateColor(alarmState);
    const isTransitional = ['arming', 'pending', 'disarming'].includes(alarmState);
    const isTriggered = alarmState === 'triggered';
    const symbol = this._getAlarmShieldSymbol(alarmState);
    const stateLabel = (alarmState || 'unknown').toUpperCase().replace(/_/g, ' ');
    const armModes = ['home', 'away', 'night'];
    const codeRequired = as?.attributes?.code_required !== false;
    const pinDots = Array.from({ length: 6 }, (_, i) => i < this._alarmPinCode.length);

    return html`
      <div class="alarm-content ${isTriggered ? 'alarm-triggered' : ''}" data-state="${alarmState}">

        <div class="alarm-sensors" role="list" aria-label="${deviceName} zones">
          ${zones.map(({ entity, state }) => {
            const name = this._friendlyName(state, entity);
            const isOpen = state.state === 'on';
            const color = isOpen ? 'var(--lcars-butterscotch)' : 'var(--lcars-gray)';
            return html`
              <div class="device-sensor-line" tabindex="0" role="listitem"
                aria-label="${name}: ${isOpen ? 'open' : 'closed'}"
                @click=${() => this._handleEntityClick(entity.entity_id)}
                @keydown=${(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._handleEntityClick(entity.entity_id); } }}>
                <div class="sensor-indicator" style="background:${color}"></div>
                <span class="sensor-label">${name}</span>
                <span class="sensor-state-value" style="color:${color}">${isOpen ? 'OPEN' : 'CLOSED'}</span>
              </div>
            `;
          })}
          ${auxiliary.length > 0 ? html`
            <div class="battery-section-divider"></div>
            ${auxiliary.map(({ entity, state }) => {
              const name = this._friendlyName(state, entity);
              const color = this._getSensorIndicatorColor(state);
              return html`
                <div class="device-sensor-line" tabindex="0" role="listitem"
                  @click=${() => this._handleEntityClick(entity.entity_id)}
                  @keydown=${(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._handleEntityClick(entity.entity_id); } }}>
                  <div class="sensor-indicator" style="background:${color}"></div>
                  <span class="sensor-label">${name}</span>
                  <span class="sensor-state-value" style="color:${color}">${state.state}</span>
                </div>
              `;
            })}
          ` : ''}
        </div>

        <div class="alarm-viewscreen">
          ${isTransitional && this._alarmCountdown != null ? html`
            <div class="alarm-countdown" aria-live="polite">
              <span class="alarm-countdown-num" style="color:${stateColor}">${this._alarmCountdown}</span>
              <span class="alarm-countdown-label">${stateLabel}</span>
            </div>
          ` : html`
            <svg class="alarm-shield" viewBox="0 0 160 180" role="img" aria-label="${deviceName}: ${stateLabel}">
              <path d="M80,10 L145,45 L145,110 Q145,160 80,175 Q15,160 15,110 L15,45 Z" fill="none" stroke="${stateColor}" stroke-width="4" />
              <text x="80" y="105" text-anchor="middle" fill="${stateColor}" font-family="var(--lcars-font)" font-size="48">${symbol}</text>
              <text x="80" y="145" text-anchor="middle" fill="${stateColor}" font-family="var(--lcars-font)" font-size="14">${stateLabel}</text>
            </svg>
          `}
          <div class="alarm-arm-strip" role="radiogroup" aria-label="Arm mode">
            ${armModes.map(mode => html`
              <button class="alarm-arm-btn" role="radio" aria-checked="${alarmState === `armed_${mode}`}"
                ?data-active=${alarmState === `armed_${mode}`}
                @click=${() => this._handleAlarmArm(primary.entity.entity_id, mode)}>
                ${mode.toUpperCase()}
              </button>
            `)}
          </div>
        </div>

        ${codeRequired ? html`
          <div class="alarm-keypad" tabindex="0" aria-label="PIN keypad"
            @keydown=${(e) => this._handleAlarmKeydown(e, primary.entity.entity_id)}>
            <div class="alarm-code-display ${this._alarmPinError ? 'alarm-pin-error' : ''}" role="status" aria-live="polite">
              ${pinDots.map(filled => html`
                <div class="alarm-code-dot" style="background:${filled ? (this._alarmPinError ? 'var(--lcars-tomato)' : stateColor) : 'var(--lcars-disabled)'}"></div>
              `)}
            </div>
            <div class="alarm-digit-grid">
              ${[1,2,3,4,5,6,7,8,9].map(d => html`
                <button class="alarm-digit-btn" aria-label="Digit ${d}" @click=${() => this._handleAlarmPinDigit(d)}>${d}</button>
              `)}
              <button class="alarm-digit-btn alarm-action-btn" aria-label="Clear code" @click=${() => this._handleAlarmPinClear()}>⌫</button>
              <button class="alarm-digit-btn" aria-label="Digit 0" @click=${() => this._handleAlarmPinDigit(0)}>0</button>
              <button class="alarm-digit-btn alarm-action-btn" aria-label="Disarm" @click=${() => this._handleAlarmDisarm(primary.entity.entity_id)}>⏎</button>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }
}

if (!customElements.get('lcars-alarm-panel')) {
  customElements.define('lcars-alarm-panel', LcarsAlarmPanel);
}
