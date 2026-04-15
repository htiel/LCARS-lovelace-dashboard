/**
 * lcars-pool-spa-panel.js
 *
 * Extracted pool & spa device panel — Pentair ScreenLogic.
 * Pool/spa body frames, water chemistry, pump controls, lighting.
 *
 * v4.17.0 Panel Extraction Architecture (4X-5)
 */
import { html } from 'lit-element';
import { LcarsBasePanel } from '../../lcars-base-panel.js';
import { SENSOR_DOMAINS } from '../../lcars-entity-utils.js';
import { getPoolBodyColor } from '../../lcars-color-utils.js';
import { clampSetpoint, createDebouncer } from '../../lcars-service-utils.js';
import { sharedKeyframes, sharedReducedMotion } from '../../lcars-shared-animations.js';
import { poolSpaPanelStyles } from './lcars-pool-spa-panel-styles.js';

class LcarsPoolSpaPanel extends LcarsBasePanel {

  get panelType() { return 'pool-spa'; }
  get defaultPanelTitle() { return 'Pool & Spa'; }
  get frameColor() { return 'var(--lcars-bluey)'; }

  static get styles() {
    return [...super.styles, sharedKeyframes, sharedReducedMotion, poolSpaPanelStyles];
  }

  _poolSetpointDebouncer = null;

  _partitionPoolEntities(entries) {
    const pool = [];
    const spa = [];
    const chemistry = [];
    const pumps = [];
    const circuits = [];
    const lights = [];
    const environmental = [];
    const diagnostics = [];

    const CHEM_KEYS = /orp|ph_|salt|tds|saturation|calcium|alkalinity|cyanuric/i;

    for (const entry of entries) {
      const eid = entry.entity.entity_id;
      const domain = entry.domain;
      const attrs = entry.state?.attributes || {};

      if (domain === 'climate') {
        if (/spa/i.test(eid)) spa.push(entry);
        else pool.push(entry);
        continue;
      }
      if (domain === 'light') { lights.push(entry); continue; }
      if (domain === 'sensor' && CHEM_KEYS.test(eid)) { chemistry.push(entry); continue; }
      if (domain === 'switch') {
        if (/pump/i.test(eid)) pumps.push(entry);
        else circuits.push(entry);
        continue;
      }
      if (domain === 'sensor') {
        const dc = attrs.device_class || '';
        if (dc === 'temperature') { environmental.push(entry); continue; }
      }
      diagnostics.push(entry);
    }

    return { pool, spa, chemistry, pumps, circuits, lights, environmental, diagnostics };
  }

  _handlePoolSetpoint(entityId, attrs, value) {
    const clamped = clampSetpoint(value, attrs, { min: 40, max: 104 });
    if (!this._poolSetpointDebouncer) {
      this._poolSetpointDebouncer = createDebouncer((eid, temp) => {
        this.hass.callService('climate', 'set_temperature', { entity_id: eid, temperature: temp });
      }, 1500);
    }
    this._poolSetpointDebouncer.call(entityId, clamped);
  }

  _renderPoolBody(bodyEntries, bodyType, step) {
    if (bodyEntries.length === 0) return '';
    const primary = bodyEntries[0];
    const cs = primary.state;
    const attrs = cs?.attributes || {};
    const currentTemp = attrs.current_temperature != null ? Number(attrs.current_temperature) : null;
    const targetTemp = attrs.temperature != null ? Number(attrs.temperature) : null;
    const hvacAction = attrs.hvac_action || 'off';
    const bodyColor = getPoolBodyColor(hvacAction, bodyType);
    const label = bodyType === 'spa' ? 'SPA' : 'POOL';

    return html`
      <div class="pool-body-frame" style="--body-color:${bodyColor}" role="region"
        aria-label="${label}: ${currentTemp != null ? currentTemp + '°' : 'N/A'}, target ${targetTemp || 'N/A'}°">
        <div class="pool-body-label" style="color:${bodyColor}">${label}</div>
        <div class="pool-body-temp">${currentTemp != null ? `${Math.round(currentTemp)}°` : '—'}</div>
        ${targetTemp != null ? html`
          <div class="pool-setpoint-row">
            <button class="climate-sp-btn" aria-label="Decrease ${label} target"
              @click=${() => this._handlePoolSetpoint(primary.entity.entity_id, attrs, targetTemp - (step || 1))}>−</button>
            <span class="pool-target" style="color:${bodyColor}">${targetTemp}°</span>
            <button class="climate-sp-btn" aria-label="Increase ${label} target"
              @click=${() => this._handlePoolSetpoint(primary.entity.entity_id, attrs, targetTemp + (step || 1))}>+</button>
          </div>
        ` : ''}
        <div class="panel-pip-strip" aria-hidden="true"></div>
      </div>
    `;
  }

  renderBadge() {
    const { pool, spa } = this._partitionPoolEntities(this.group?.entities || []);
    const poolTemp = pool[0]?.state?.attributes?.current_temperature;
    const spaTemp = spa[0]?.state?.attributes?.current_temperature;
    return html`
      ${poolTemp != null ? html`<span style="color:var(--lcars-ice)">POOL ${Math.round(poolTemp)}°</span>` : ''}
      ${spaTemp != null ? html`<span style="color:var(--lcars-butterscotch)"> SPA ${Math.round(spaTemp)}°</span>` : ''}
    `;
  }

  renderContent() {
    const { pool, spa, chemistry, pumps, circuits, lights, environmental } = this._partitionPoolEntities(this.group.entities);
    const deviceName = this._shortDeviceName(this.group.device) || 'Pool & Spa';
    const hasChem = chemistry.length > 0;

    return html`
      <div class="pool-content ${hasChem ? '' : 'pool-no-chem'}">

        ${hasChem ? html`
          <div class="pool-chemistry" role="list" aria-label="Water chemistry">
            ${chemistry.map(({ entity, state }) => {
              const name = this._friendlyName(state, entity);
              const val = state.state;
              const unit = state.attributes?.unit_of_measurement || '';
              const color = this._getSensorIndicatorColor(state);
              return html`
                <div class="device-sensor-line" tabindex="0" role="listitem"
                  aria-label="${name}: ${val}${unit ? ' ' + unit : ''}"
                  @click=${() => this._handleEntityClick(entity.entity_id)}
                  @keydown=${(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._handleEntityClick(entity.entity_id); } }}>
                  <div class="sensor-indicator" style="background:${color}"></div>
                  <span class="sensor-label">${name}</span>
                  <span class="sensor-state-value" style="color:${color}">${val}${unit ? ' ' + unit : ''}</span>
                </div>
              `;
            })}
          </div>
        ` : ''}

        <div class="pool-aquatics">
          ${this._renderPoolBody(pool, 'pool', 1)}
          ${this._renderPoolBody(spa, 'spa', 1)}
        </div>

        <div class="pool-controls" aria-label="Circuit controls">
          ${[...pumps, ...circuits].map(({ entity, state }, idx) => {
            const name = this._friendlyName(state, entity);
            const isOn = state.state === 'on';
            const isPrimaryPump = idx === 0 && pumps.length > 0 && entity.entity_id === pumps[0].entity.entity_id;
            return html`
              <button class="device-control-btn" role="switch" aria-checked="${isOn}" ?data-on=${isOn}
                @click=${() => this._handleToggle(entity.entity_id)}
                title="${name}: ${state.state}">
                ${isPrimaryPump ? html`
                  <div class="lcars-pump-spinner ${isOn ? 'on' : ''}" aria-hidden="true">
                    <div class="dot"></div><div class="dot"></div><div class="dot"></div>
                  </div>
                ` : html`<ha-icon .icon=${this._getEntityIcon(state)}></ha-icon>`}
                <span>${name}</span>
              </button>
            `;
          })}
          ${environmental.map(({ entity, state }) => {
            const name = this._friendlyName(state, entity);
            const unit = state.attributes?.unit_of_measurement || '';
            return html`
              <div class="device-sensor-line" tabindex="0" role="listitem"
                @click=${() => this._handleEntityClick(entity.entity_id)}>
                <div class="sensor-indicator" style="background:var(--lcars-data-accent)"></div>
                <span class="sensor-label">${name}</span>
                <span class="sensor-state-value">${state.state}${unit ? ' ' + unit : ''}</span>
              </div>
            `;
          })}
        </div>

        ${lights.length > 0 ? html`
          <div class="pool-lighting" aria-label="Pool lighting">
            ${lights.map(({ entity, state }) => {
              const name = this._friendlyName(state, entity);
              const isOn = state.state === 'on';
              return html`
                <button class="device-control-btn" role="switch" aria-checked="${isOn}" ?data-on=${isOn}
                  @click=${() => this._handleToggle(entity.entity_id)}
                  title="${name}: ${state.state}">
                  <ha-icon .icon=${this._getEntityIcon(state)}></ha-icon>
                  <span>${name}</span>
                </button>
              `;
            })}
          </div>
        ` : ''}
      </div>
    `;
  }
}

if (!customElements.get('lcars-pool-spa-panel')) {
  customElements.define('lcars-pool-spa-panel', LcarsPoolSpaPanel);
}
