/**
 * lcars-climate-panel.js
 *
 * Extracted climate/thermostat device panel — temperature arc,
 * setpoint controls, HVAC/fan/preset mode strips.
 *
 * v4.17.0 Panel Extraction Architecture (4X-4)
 */
import { html } from 'lit-element';
import { LcarsBasePanel } from '../../lcars-base-panel.js';
import { SENSOR_DOMAINS } from '../../lcars-entity-utils.js';
import { getHvacActionColor } from '../../lcars-color-utils.js';
import { clampSetpoint, createDebouncer } from '../../lcars-service-utils.js';
import { sharedKeyframes, sharedReducedMotion } from '../../lcars-shared-animations.js';
import { climatePanelStyles } from './lcars-climate-panel-styles.js';

class LcarsClimatePanel extends LcarsBasePanel {

  _climateSetpointDebouncer = null;

  get panelType() { return 'climate'; }
  get defaultPanelTitle() { return 'Thermostat'; }
  get frameColor() {
    const cs = this.group?.entities?.find(e => e.domain === 'climate')?.state;
    return getHvacActionColor(cs?.attributes?.hvac_action || 'off');
  }

  static get styles() {
    return [...super.styles, sharedKeyframes, sharedReducedMotion, climatePanelStyles];
  }

  /* ─── Partition ─── */

  _partitionClimateEntities(entries, categoryEntities) {
    const climate = [];
    const sensors = [];
    const faults = [];
    const diagnostics = [];
    const FAULT_CLASSES = new Set(['problem', 'heat', 'cold', 'connectivity', 'battery', 'tamper', 'smoke', 'safety']);

    for (const entry of entries) {
      const domain = entry.domain;
      if (domain === 'climate') { climate.push(entry); continue; }
      if (domain === 'binary_sensor') {
        const dc = entry.state?.attributes?.device_class || '';
        if (FAULT_CLASSES.has(dc)) { faults.push(entry); continue; }
      }
      if (SENSOR_DOMAINS.has(domain)) { sensors.push(entry); continue; }
      sensors.push(entry);
    }

    if (categoryEntities) {
      for (const e of categoryEntities.diagnostic || []) {
        const state = this._getEntityState(e.entity_id);
        if (!state) continue;
        diagnostics.push({ entity: e, domain: e.entity_id.split('.')[0], state });
      }
    }
    return { climate, sensors, faults, diagnostics };
  }

  _isDualSetpoint(cs) {
    return cs?.attributes?.hvac_mode === 'heat_cool'
      || (cs?.attributes?.target_temp_low != null && cs?.attributes?.target_temp_high != null);
  }

  _renderClimateArc(currentTemp, targetTemp, minTemp, maxTemp, actionColor) {
    const cx = 100, cy = 120, r = 80;
    const range = maxTemp - minTemp || 1;
    const progress = Math.max(0, Math.min(1, (currentTemp - minTemp) / range));
    const startAngle = Math.PI;
    const sweepAngle = startAngle - startAngle * progress;
    const sx = cx + r * Math.cos(startAngle);
    const sy = cy - r * Math.sin(startAngle);
    const ex = cx + r * Math.cos(sweepAngle);
    const ey = cy - r * Math.sin(sweepAngle);
    const largeArc = progress > 0.5 ? 1 : 0;
    const targetProgress = Math.max(0, Math.min(1, (targetTemp - minTemp) / range));
    const tickAngle = startAngle - startAngle * targetProgress;
    const tx = cx + r * Math.cos(tickAngle);
    const ty = cy - r * Math.sin(tickAngle);

    return html`
      <svg class="climate-arc" viewBox="0 0 200 130" role="meter"
        aria-valuemin="${minTemp}" aria-valuemax="${maxTemp}" aria-valuenow="${currentTemp}"
        aria-label="Temperature: ${currentTemp}°, target ${targetTemp}°">
        <path d="M ${sx},${sy} A ${r},${r} 0 1,1 ${cx + r},${cy}"
          fill="none" stroke="var(--lcars-disabled)" stroke-width="8" stroke-linecap="round" />
        ${progress > 0 ? html`
          <path d="M ${sx},${sy} A ${r},${r} 0 ${largeArc},1 ${ex},${ey}"
            fill="none" stroke="${actionColor}" stroke-width="8" stroke-linecap="round" />
        ` : ''}
        <circle cx="${tx}" cy="${ty}" r="5" fill="${actionColor}" stroke="var(--lcars-card-bg, #1a1a2e)" stroke-width="2" />
        <text x="${cx}" y="${cy - 20}" text-anchor="middle" fill="${actionColor}"
          font-family="var(--lcars-font)" font-size="42" font-weight="bold">
          ${currentTemp != null && Number.isFinite(currentTemp) ? Math.round(currentTemp) : '—'}°
        </text>
      </svg>
    `;
  }

  _handleClimateSetpoint(entityId, attrs, value, isDual, which) {
    const clamped = clampSetpoint(value, attrs);
    if (!this._climateSetpointDebouncer) {
      this._climateSetpointDebouncer = createDebouncer((eid, data) => {
        this.hass.callService('climate', 'set_temperature', { entity_id: eid, ...data });
      }, 1500);
    }
    const data = isDual
      ? { [which === 'low' ? 'target_temp_low' : 'target_temp_high']: clamped }
      : { temperature: clamped };
    this._climateSetpointDebouncer.call(entityId, data);
  }

  /* ─── Render ─── */

  renderBadge() {
    const cs = this.group?.entities?.find(e => e.domain === 'climate')?.state;
    const hvacAction = cs?.attributes?.hvac_action || 'off';
    const actionColor = getHvacActionColor(hvacAction);
    return html`<span style="color:${actionColor}">${hvacAction.toUpperCase()}</span>`;
  }

  renderContent() {
    const categoryEntities = this._getDeviceCategoryEntities(this.group.device.id);
    const { climate, sensors, faults, diagnostics } = this._partitionClimateEntities(this.group.entities, categoryEntities);
    const deviceName = this._shortDeviceName(this.group.device) || 'Thermostat';

    if (climate.length === 0) return html``;
    const primary = climate[0];
    const cs = primary.state;
    const attrs = cs?.attributes || {};
    const currentTemp = attrs.current_temperature != null ? Number(attrs.current_temperature) : null;
    const hvacAction = attrs.hvac_action || 'off';
    const actionColor = getHvacActionColor(hvacAction);
    const isDual = this._isDualSetpoint(cs);
    const targetTemp = isDual ? null : (attrs.temperature != null ? Number(attrs.temperature) : null);
    const targetLow = isDual ? Number(attrs.target_temp_low) : null;
    const targetHigh = isDual ? Number(attrs.target_temp_high) : null;
    const minTemp = attrs.min_temp != null ? Number(attrs.min_temp) : 45;
    const maxTemp = attrs.max_temp != null ? Number(attrs.max_temp) : 95;
    const hvacModes = attrs.hvac_modes || [];
    const currentMode = attrs.hvac_mode || 'off';
    const fanModes = attrs.fan_modes || [];
    const currentFanMode = attrs.fan_mode || '';
    const presetModes = attrs.preset_modes || [];
    const currentPreset = attrs.preset_mode || '';
    const humidity = sensors.find(e => (e.state?.attributes?.device_class || '') === 'humidity');
    const step = attrs.target_temp_step || 1;

    return html`
      <div class="climate-content" data-hvac-action="${hvacAction}">

        <div class="climate-sensors" role="list" aria-label="${deviceName} readings">
          ${currentTemp != null ? html`
            <div class="device-sensor-line" role="listitem" aria-label="Current temperature: ${currentTemp}°">
              <div class="sensor-indicator" style="background:${actionColor}"></div>
              <span class="sensor-label">Current</span>
              <span class="sensor-state-value" style="color:${actionColor}">${Math.round(currentTemp)}°</span>
            </div>
          ` : ''}
          ${isDual ? html`
            <div class="device-sensor-line" role="listitem"><div class="sensor-indicator" style="background:var(--lcars-butterscotch)"></div><span class="sensor-label">Heat To</span><span class="sensor-state-value" style="color:var(--lcars-butterscotch)">${targetLow}°</span></div>
            <div class="device-sensor-line" role="listitem"><div class="sensor-indicator" style="background:var(--lcars-ice)"></div><span class="sensor-label">Cool To</span><span class="sensor-state-value" style="color:var(--lcars-ice)">${targetHigh}°</span></div>
          ` : targetTemp != null ? html`
            <div class="device-sensor-line" role="listitem"><div class="sensor-indicator" style="background:${actionColor}"></div><span class="sensor-label">Target</span><span class="sensor-state-value" style="color:${actionColor}">${targetTemp}°</span></div>
          ` : ''}
          ${humidity ? html`
            <div class="device-sensor-line" role="listitem" @click=${() => this._handleEntityClick(humidity.entity.entity_id)}>
              <div class="sensor-indicator" style="background:var(--lcars-ice)"></div>
              <span class="sensor-label">Humidity</span>
              <span class="sensor-state-value" style="color:var(--lcars-ice)">${humidity.state.state}%</span>
            </div>
          ` : ''}
          <div class="battery-section-divider"></div>
          <div class="device-sensor-line" role="listitem">
            <div class="sensor-indicator" style="background:${actionColor}"></div>
            <span class="sensor-label">Mode</span>
            <span class="sensor-state-value">${currentMode}</span>
          </div>
          ${currentFanMode ? html`
            <div class="device-sensor-line" role="listitem">
              <div class="sensor-indicator" style="background:var(--lcars-data-accent)"></div>
              <span class="sensor-label">Fan</span>
              <span class="sensor-state-value">${currentFanMode}</span>
            </div>
          ` : ''}
          ${faults.length > 0 ? html`
            <div class="battery-section-divider"></div>
            <div class="battery-section-label">FAULTS</div>
            ${faults.map(({ entity, state }) => {
              const name = this._friendlyName(state, entity);
              const color = state.state === 'on' ? 'var(--lcars-tomato)' : 'var(--lcars-gray)';
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

        <div class="climate-viewscreen" tabindex="0"
          @click=${() => this._handleEntityClick(primary.entity.entity_id)}
          @keydown=${(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._handleEntityClick(primary.entity.entity_id); } }}>
          ${this._renderClimateArc(currentTemp, isDual ? (targetLow + targetHigh) / 2 : targetTemp, minTemp, maxTemp, actionColor)}
          <div class="climate-setpoint-controls">
            ${isDual ? html`
              <div class="climate-setpoint-row">
                <button class="climate-sp-btn" aria-label="Decrease heat target" @click=${(e) => { e.stopPropagation(); this._handleClimateSetpoint(primary.entity.entity_id, attrs, targetLow - step, true, 'low'); }}>−</button>
                <span class="climate-sp-label" style="color:var(--lcars-butterscotch)">HEAT ${targetLow}°</span>
                <button class="climate-sp-btn" aria-label="Increase heat target" @click=${(e) => { e.stopPropagation(); this._handleClimateSetpoint(primary.entity.entity_id, attrs, targetLow + step, true, 'low'); }}>+</button>
              </div>
              <div class="climate-setpoint-row">
                <button class="climate-sp-btn" aria-label="Decrease cool target" @click=${(e) => { e.stopPropagation(); this._handleClimateSetpoint(primary.entity.entity_id, attrs, targetHigh - step, true, 'high'); }}>−</button>
                <span class="climate-sp-label" style="color:var(--lcars-ice)">COOL ${targetHigh}°</span>
                <button class="climate-sp-btn" aria-label="Increase cool target" @click=${(e) => { e.stopPropagation(); this._handleClimateSetpoint(primary.entity.entity_id, attrs, targetHigh + step, true, 'high'); }}>+</button>
              </div>
            ` : targetTemp != null ? html`
              <div class="climate-setpoint-row">
                <button class="climate-sp-btn" aria-label="Decrease target" @click=${(e) => { e.stopPropagation(); this._handleClimateSetpoint(primary.entity.entity_id, attrs, targetTemp - step, false); }}>−</button>
                <span class="climate-sp-label" style="color:${actionColor}">TARGET ${targetTemp}°</span>
                <button class="climate-sp-btn" aria-label="Increase target" @click=${(e) => { e.stopPropagation(); this._handleClimateSetpoint(primary.entity.entity_id, attrs, targetTemp + step, false); }}>+</button>
              </div>
            ` : ''}
          </div>
        </div>

        ${hvacModes.length > 1 ? html`
          <div class="climate-modes" role="radiogroup" aria-label="HVAC mode">
            ${hvacModes.map(mode => html`
              <button class="climate-mode-btn" role="radio"
                aria-checked="${mode === currentMode}" ?data-active=${mode === currentMode}
                @click=${() => this.hass.callService('climate', 'set_hvac_mode', { entity_id: primary.entity.entity_id, hvac_mode: mode })}>
                ${mode.toUpperCase().replace('_', ' ')}
              </button>
            `)}
          </div>
        ` : ''}

        <div class="climate-aux-controls">
          ${fanModes.length > 1 ? html`
            <div class="climate-aux-strip" role="radiogroup" aria-label="Fan mode">
              ${fanModes.map(fm => html`
                <button class="climate-mode-btn" role="radio"
                  aria-checked="${fm === currentFanMode}" ?data-active=${fm === currentFanMode}
                  @click=${() => this.hass.callService('climate', 'set_fan_mode', { entity_id: primary.entity.entity_id, fan_mode: fm })}>
                  ${fm.toUpperCase().replace('_', ' ')}
                </button>
              `)}
            </div>
          ` : ''}
          ${presetModes.length > 0 ? html`
            <div class="climate-aux-strip" role="radiogroup" aria-label="Preset mode">
              ${presetModes.map(pm => html`
                <button class="climate-mode-btn" role="radio"
                  aria-checked="${pm === currentPreset}" ?data-active=${pm === currentPreset}
                  @click=${() => this.hass.callService('climate', 'set_preset_mode', { entity_id: primary.entity.entity_id, preset_mode: pm })}>
                  ${pm.toUpperCase().replace('_', ' ')}
                </button>
              `)}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }
}

if (!customElements.get('lcars-climate-panel')) {
  customElements.define('lcars-climate-panel', LcarsClimatePanel);
}
