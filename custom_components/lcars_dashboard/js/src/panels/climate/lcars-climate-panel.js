/**
 * lcars-climate-panel.js
 *
 * Extracted climate/thermostat device panel — segmented temperature arc,
 * LCARS endcap setpoint controls, connected HVAC/fan/preset mode strips,
 * viewscreen with mini-elbow brackets, HVAC action feedback.
 *
 * v4.17.0 Panel Extraction Architecture (4X-4)
 * v4.18.0 Visual Refresh (4X-8)
 */
import { defineLcars } from '../../lcars-helpers.js';
import { html } from 'lit-element';
import { LcarsBasePanel } from '../../lcars-base-panel.js';
import { SENSOR_DOMAINS } from '../../lcars-entity-utils.js';
import { getHvacActionColor, getHvacModeColor } from '../../lcars-color-utils.js';
import { clampSetpoint, createDebouncer } from '../../lcars-service-utils.js';
import { lcarsAudio } from '../../lcars-audio.js';
import { sharedKeyframes, sharedReducedMotion } from '../../lcars-shared-animations.js';
import { getSiblingAreas } from '../../lcars-hierarchy-utils.js';
import { climatePanelStyles } from './lcars-climate-panel-styles.js';

class LcarsClimatePanel extends LcarsBasePanel {

  _climateSetpointDebouncer = null;

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._climateSetpointDebouncer) {
      this._climateSetpointDebouncer.cancel();
      this._climateSetpointDebouncer = null;
    }
  }

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
    const auxSwitches = [];
    const auxNumbers = [];
    const FAULT_CLASSES = new Set(['problem', 'heat', 'cold', 'connectivity', 'battery', 'tamper', 'smoke', 'safety']);
    const AUX_SWITCH_PATTERNS = ['eco_mode', 'turbo_mode', 'swing_mode'];
    const HIDDEN_SWITCHES = ['beep'];

    for (const entry of entries) {
      const domain = entry.domain;
      if (domain === 'climate') { climate.push(entry); continue; }
      if (domain === 'binary_sensor') {
        const dc = entry.state?.attributes?.device_class || '';
        if (FAULT_CLASSES.has(dc)) { faults.push(entry); continue; }
      }
      // 4X-56: Portable AC auxiliary switches (eco, turbo, swing)
      if (domain === 'switch') {
        const eid = entry.entity?.entity_id || '';
        if (HIDDEN_SWITCHES.some(p => eid.includes(p))) { diagnostics.push(entry); continue; }
        if (AUX_SWITCH_PATTERNS.some(p => eid.includes(p))) { auxSwitches.push(entry); continue; }
      }
      // 4X-56: Timer / number entities
      if (domain === 'number') { auxNumbers.push(entry); continue; }
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
    return { climate, sensors, faults, diagnostics, auxSwitches, auxNumbers };
  }

  _isDualSetpoint(cs) {
    return cs?.attributes?.hvac_mode === 'heat_cool'
      || (cs?.attributes?.target_temp_low != null && cs?.attributes?.target_temp_high != null);
  }

  _renderClimateArc(currentTemp, targetTemp, minTemp, maxTemp, actionColor, isDual, targetLow, targetHigh, hvacAction) {
    const cx = 100, cy = 120, r = 80;
    const range = maxTemp - minTemp || 1;
    const progress = Math.max(0, Math.min(1, (currentTemp - minTemp) / range));

    // Segmented arc: discrete lit segments like Main Engineering ring gauges (Compliance #4)
    const totalSegments = 40;
    const filledSegments = Math.round(progress * totalSegments);
    const segmentAngle = Math.PI / totalSegments;

    // Target marker position
    const targetProgress = Math.max(0, Math.min(1, (targetTemp - minTemp) / range));
    const tickAngle = Math.PI - Math.PI * targetProgress;
    const tx = cx + r * Math.cos(tickAngle);
    const ty = cy - r * Math.sin(tickAngle);

    // Dual setpoint band (heat_cool mode)
    let bandLow = 0, bandHigh = 0;
    if (isDual && targetLow != null && targetHigh != null) {
      bandLow = Math.round(((targetLow - minTemp) / range) * totalSegments);
      bandHigh = Math.round(((targetHigh - minTemp) / range) * totalSegments);
    }

    const isActive = hvacAction !== 'off' && hvacAction !== 'idle';

    const segments = [];
    for (let i = 0; i < totalSegments; i++) {
      const angle = Math.PI - (i + 0.5) * segmentAngle;
      const x1 = cx + (r - 6) * Math.cos(angle);
      const y1 = cy - (r - 6) * Math.sin(angle);
      const x2 = cx + (r + 6) * Math.cos(angle);
      const y2 = cy - (r + 6) * Math.sin(angle);

      let color = 'var(--lcars-disabled)';
      let opacity = '0.2';

      if (i < filledSegments) {
        if (isDual) {
          // Dual-setpoint coloring: ice below band, sunflower in band, butterscotch above
          if (i < bandLow) { color = 'var(--lcars-ice)'; opacity = '0.8'; }
          else if (i <= bandHigh) { color = 'var(--lcars-sunflower)'; opacity = '1'; }
          else { color = 'var(--lcars-butterscotch)'; opacity = '0.8'; }
        } else {
          color = actionColor;
          opacity = '1';
        }
      }

      segments.push({ x1, y1, x2, y2, color, opacity });
    }

    return html`
      <svg class="climate-arc" viewBox="0 0 200 140" role="meter"
        aria-valuemin="${minTemp}" aria-valuemax="${maxTemp}" aria-valuenow="${currentTemp}"
        aria-label="Temperature: ${currentTemp}°, target ${targetTemp}°">

        <!-- Background segments (dim ticks) -->
        ${segments.map(s => html`
          <line x1="${s.x1}" y1="${s.y1}" x2="${s.x2}" y2="${s.y2}"
            stroke="${s.color}" stroke-width="3" stroke-linecap="round" opacity="${s.opacity}" />
        `)}

        <!-- Outer halo ring at 40% opacity -->
        <path d="M ${cx - r - 4},${cy} A ${r + 4},${r + 4} 0 1,1 ${cx + r + 4},${cy}"
          fill="none" stroke="${actionColor}" stroke-width="1.5" opacity="0.4"
          class="${isActive ? 'arc-halo-active' : ''}" />

        <!-- Target marker: 6px dot with stroke ring -->
        ${targetTemp != null ? html`
          <circle cx="${tx}" cy="${ty}" r="4" fill="${actionColor}"
            stroke="var(--lcars-black)" stroke-width="2" />
        ` : ''}

        <!-- Temperature readout (Compliance #7: mapped to --lcars-font-size-title) -->
        <text x="${cx}" y="${cy - 16}" text-anchor="middle" fill="${actionColor}"
          font-family="var(--lcars-font)" font-size="38" font-weight="bold">
          ${currentTemp != null && Number.isFinite(currentTemp) ? html`${Math.round(currentTemp)}°` : '—'}
        </text>

        <!-- HVAC action label -->
        <text x="${cx}" y="${cy + 6}" text-anchor="middle" fill="${actionColor}"
          font-family="var(--lcars-font)" font-size="10" opacity="0.7">
          ${hvacAction.toUpperCase().replace(/_/g, ' ')}
        </text>
      </svg>
    `;
  }

  _handleClimateSetpoint(entityId, attrs, value, isDual, which) {
    lcarsAudio.play('climateAdjust');
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
    const { climate, sensors, faults, diagnostics, auxSwitches, auxNumbers } = this._partitionClimateEntities(this.group.entities, categoryEntities);
    const deviceName = this._shortDeviceName(this.group.device) || 'Thermostat';

    if (climate.length === 0) return html``;
    const primary = climate[0];
    const cs = primary.state;
    const attrs = cs?.attributes || {};
    const currentTemp = attrs.current_temperature != null ? Number(attrs.current_temperature) : null;
    const hvacAction = attrs.hvac_action || 'off';
    const actionColor = getHvacActionColor(hvacAction);
    const isDual = this._isDualSetpoint(cs);
    // #154 — Nest/ecobee/Daikin in heat_cool with only one bound reported produce NaN
    // when averaged. Guard each bound with Number.isFinite before averaging; null when
    // either side is missing so the arc/center text shows '—' instead of NaN°.
    const _rawLow = isDual ? Number(attrs.target_temp_low) : NaN;
    const _rawHigh = isDual ? Number(attrs.target_temp_high) : NaN;
    const _dualValid = Number.isFinite(_rawLow) && Number.isFinite(_rawHigh);
    const targetTemp = isDual
      ? (_dualValid ? (_rawLow + _rawHigh) / 2 : null)
      : (attrs.temperature != null && Number.isFinite(Number(attrs.temperature)) ? Number(attrs.temperature) : null);
    const targetLow = isDual && Number.isFinite(_rawLow) ? _rawLow : null;
    const targetHigh = isDual && Number.isFinite(_rawHigh) ? _rawHigh : null;
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
    const isActive = hvacAction !== 'off' && hvacAction !== 'idle';
    // 4X-56: Swing mode support (climate attribute)
    const swingModes = attrs.swing_modes || [];
    const currentSwingMode = attrs.swing_mode || '';

    // Multi-zone awareness: sibling areas' thermostats (4X-12 prep)
    const siblingZones = this._getSiblingZoneTemps();

    return html`
      <div class="climate-content" data-hvac-action="${hvacAction}">

        <!-- Sensor readouts (left column) — Compliance #5: mini-bars not dots -->
        <div class="climate-sensors" role="list" aria-label="${deviceName} readings">
          ${currentTemp != null ? html`
            <div class="device-sensor-line" role="listitem" aria-label="Current temperature: ${currentTemp}°">
              <div class="sensor-indicator-bar" style="background:${actionColor}"></div>
              <span class="sensor-label">Current</span>
              <span class="sensor-state-value" style="color:${actionColor}">${Math.round(currentTemp)}°</span>
            </div>
          ` : ''}
          ${isDual ? html`
            <div class="device-sensor-line" role="listitem" aria-label="Heat target: ${targetLow}°">
              <div class="sensor-indicator-bar" style="background:var(--lcars-butterscotch)"></div>
              <span class="sensor-label">Heat To</span>
              <span class="sensor-state-value" style="color:var(--lcars-butterscotch)">${targetLow}°</span>
            </div>
            <div class="device-sensor-line" role="listitem" aria-label="Cool target: ${targetHigh}°">
              <div class="sensor-indicator-bar" style="background:var(--lcars-ice)"></div>
              <span class="sensor-label">Cool To</span>
              <span class="sensor-state-value" style="color:var(--lcars-ice)">${targetHigh}°</span>
            </div>
          ` : targetTemp != null ? html`
            <div class="device-sensor-line" role="listitem" aria-label="Target temperature: ${targetTemp}°">
              <div class="sensor-indicator-bar" style="background:${actionColor}"></div>
              <span class="sensor-label">Target</span>
              <span class="sensor-state-value" style="color:${actionColor}">${targetTemp}°</span>
            </div>
          ` : ''}
          ${humidity ? html`
            <div class="device-sensor-line" role="listitem"
              aria-label="Humidity: ${humidity.state.state}%"
              @click=${() => this._handleEntityClick(humidity.entity.entity_id)}>
              <div class="sensor-indicator-bar" style="background:var(--lcars-ice)"></div>
              <span class="sensor-label">Humidity</span>
              <span class="sensor-state-value" style="color:var(--lcars-ice)">${humidity.state.state}%</span>
            </div>
          ` : ''}
          <div class="battery-section-divider"></div>
          <div class="device-sensor-line" role="listitem" aria-label="HVAC mode: ${currentMode}">
            <div class="sensor-indicator-bar" style="background:${actionColor}"></div>
            <span class="sensor-label">Mode</span>
            <span class="sensor-state-value">${currentMode}</span>
          </div>
          ${currentFanMode ? html`
            <div class="device-sensor-line" role="listitem" aria-label="Fan mode: ${currentFanMode}">
              <div class="sensor-indicator-bar" style="background:var(--lcars-data-accent)"></div>
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
                  aria-label="${name}: ${state.state}"
                  @click=${() => this._handleEntityClick(entity.entity_id)}
                  @keydown=${(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._handleEntityClick(entity.entity_id); } }}>
                  <div class="sensor-indicator-bar" style="background:${color}"></div>
                  <span class="sensor-label">${name}</span>
                  <span class="sensor-state-value" style="color:${color}">${state.state}</span>
                </div>
              `;
            })}
          ` : ''}
          ${siblingZones.length > 0 ? html`
            <div class="battery-section-divider"></div>
            <div class="battery-section-label">OTHER ZONES</div>
            ${siblingZones.map(z => html`
              <div class="device-sensor-line" role="listitem" aria-label="${z.name}: ${z.temp}°">
                <div class="sensor-indicator-bar" style="background:${z.color}"></div>
                <span class="sensor-label">${z.name}</span>
                <span class="sensor-state-value" style="color:${z.color}">${z.temp}°</span>
              </div>
            `)}
          ` : ''}
        </div>

        <!-- Viewscreen: Compliance #1 (black bg), #6 (mini-elbow brackets) -->
        <div class="climate-viewscreen" tabindex="0"
          @click=${() => this._handleEntityClick(primary.entity.entity_id)}
          @keydown=${(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._handleEntityClick(primary.entity.entity_id); } }}>
          ${this._renderClimateArc(currentTemp, targetTemp, minTemp, maxTemp, actionColor, isDual, targetLow, targetHigh, hvacAction)}

          <!-- Setpoint controls: Compliance #3 (LCARS endcap pills, not circles) -->
          <div class="climate-setpoint-controls">
            ${isDual ? html`
              <div class="climate-setpoint-row">
                <button class="climate-sp-btn sp-decrement" aria-label="Decrease heat target"
                  @click=${(e) => { e.stopPropagation(); this._handleClimateSetpoint(primary.entity.entity_id, attrs, targetLow - step, true, 'low'); }}>−</button>
                <span class="climate-sp-label" style="color:var(--lcars-butterscotch)">HEAT ${targetLow}°</span>
                <button class="climate-sp-btn sp-increment" aria-label="Increase heat target"
                  @click=${(e) => { e.stopPropagation(); this._handleClimateSetpoint(primary.entity.entity_id, attrs, targetLow + step, true, 'low'); }}>+</button>
              </div>
              <div class="climate-setpoint-row">
                <button class="climate-sp-btn sp-decrement" aria-label="Decrease cool target"
                  @click=${(e) => { e.stopPropagation(); this._handleClimateSetpoint(primary.entity.entity_id, attrs, targetHigh - step, true, 'high'); }}>−</button>
                <span class="climate-sp-label" style="color:var(--lcars-ice)">COOL ${targetHigh}°</span>
                <button class="climate-sp-btn sp-increment" aria-label="Increase cool target"
                  @click=${(e) => { e.stopPropagation(); this._handleClimateSetpoint(primary.entity.entity_id, attrs, targetHigh + step, true, 'high'); }}>+</button>
              </div>
            ` : targetTemp != null ? html`
              <div class="climate-setpoint-row">
                <button class="climate-sp-btn sp-decrement" aria-label="Decrease target temperature"
                  @click=${(e) => { e.stopPropagation(); this._handleClimateSetpoint(primary.entity.entity_id, attrs, targetTemp - step, false); }}>−</button>
                <span class="climate-sp-label" style="color:${actionColor}">TARGET ${targetTemp}°</span>
                <button class="climate-sp-btn sp-increment" aria-label="Increase target temperature"
                  @click=${(e) => { e.stopPropagation(); this._handleClimateSetpoint(primary.entity.entity_id, attrs, targetTemp + step, false); }}>+</button>
              </div>
            ` : ''}
          </div>

          <!-- HVAC action feedback bar -->
          ${isActive ? html`
            <div class="climate-action-bar" style="--action-color: ${actionColor}"></div>
          ` : ''}
        </div>

        <!-- Mode strips: Compliance #2 (connected strip, flat sides) -->
        ${hvacModes.length > 1 ? html`
          <div class="climate-modes" role="radiogroup" aria-label="HVAC mode">
            ${hvacModes.map((mode, i) => html`
              <button class="climate-mode-btn ${i === 0 ? 'mode-first' : ''} ${i === hvacModes.length - 1 ? 'mode-last' : ''}" role="radio"
                aria-checked="${mode === currentMode}" ?data-active=${mode === currentMode}
                style="--mode-btn-color: ${getHvacModeColor(mode)}"
                @click=${() => { const live = this.hass.states[primary.entity.entity_id]?.attributes?.hvac_modes; if (!live?.includes(mode)) return; lcarsAudio.play('climateAdjust'); this.hass.callService('climate', 'set_hvac_mode', { entity_id: primary.entity.entity_id, hvac_mode: mode }); }}>
                ${mode.toUpperCase().replace(/_/g, ' ')}
              </button>
            `)}
          </div>
        ` : ''}

        <div class="climate-aux-controls">
          ${fanModes.length > 1 ? html`
            <span class="climate-aux-strip-label">FAN</span>
            <div class="climate-aux-strip" role="radiogroup" aria-label="Fan mode">
              ${fanModes.map((fm, i) => html`
                <button class="climate-mode-btn ${i === 0 ? 'mode-first' : ''} ${i === fanModes.length - 1 ? 'mode-last' : ''}" role="radio"
                  aria-checked="${fm === currentFanMode}" ?data-active=${fm === currentFanMode}
                  @click=${() => { const live = this.hass.states[primary.entity.entity_id]?.attributes?.fan_modes; if (!live?.includes(fm)) return; lcarsAudio.play('climateAdjust'); this.hass.callService('climate', 'set_fan_mode', { entity_id: primary.entity.entity_id, fan_mode: fm }); }}>
                  ${fm.toUpperCase().replace(/_/g, ' ')}
                </button>
              `)}
            </div>
            ${currentMode === 'off' && currentFanMode && !/^(off|auto)$/i.test(currentFanMode) ? html`
              <!-- #156 — Fan-while-off advisory: thermostat OFF but fan still running.
                   Common Nest/ecobee/Honeywell footgun — energy waste with no warning. -->
              <span class="climate-fan-warning" role="status" aria-live="polite">
                ⚠ FAN RUNNING WHILE MODE OFF
              </span>
            ` : ''}
          ` : ''}
          ${presetModes.length > 0 ? html`
            <span class="climate-aux-strip-label">PRESET</span>
            <div class="climate-aux-strip" role="radiogroup" aria-label="Preset mode">
              ${presetModes.map((pm, i) => html`
                <button class="climate-mode-btn ${i === 0 ? 'mode-first' : ''} ${i === presetModes.length - 1 ? 'mode-last' : ''}" role="radio"
                  aria-checked="${pm === currentPreset}" ?data-active=${pm === currentPreset}
                  @click=${() => { const live = this.hass.states[primary.entity.entity_id]?.attributes?.preset_modes; if (!live?.includes(pm)) return; lcarsAudio.play('climateAdjust'); this.hass.callService('climate', 'set_preset_mode', { entity_id: primary.entity.entity_id, preset_mode: pm }); }}>
                  ${pm.toUpperCase().replace(/_/g, ' ')}
                </button>
              `)}
            </div>
          ` : ''}
          ${swingModes.length > 1 ? html`
            <span class="climate-aux-strip-label">SWING</span>
            <div class="climate-aux-strip" role="radiogroup" aria-label="Swing mode">
              ${swingModes.map((sm, i) => html`
                <button class="climate-mode-btn ${i === 0 ? 'mode-first' : ''} ${i === swingModes.length - 1 ? 'mode-last' : ''}" role="radio"
                  aria-checked="${sm === currentSwingMode}" ?data-active=${sm === currentSwingMode}
                  @click=${() => { if (!this.hass) return; const live = this.hass.states[primary.entity.entity_id]?.attributes?.swing_modes; if (!live?.includes(sm)) return; lcarsAudio.play('climateAdjust'); this.hass.callService('climate', 'set_swing_mode', { entity_id: primary.entity.entity_id, swing_mode: sm }); }}>
                  ${sm.toUpperCase().replace(/_/g, ' ')}
                </button>
              `)}
            </div>
          ` : ''}
          ${auxSwitches.length > 0 ? html`
            <div class="climate-aux-strip" role="group" aria-label="System controls">
              ${auxSwitches.map(entry => {
                const eid = entry.entity?.entity_id || '';
                const isOn = entry.state?.state === 'on';
                const label = eid.includes('eco_mode') ? 'ECO' : eid.includes('turbo_mode') ? 'TURBO' : eid.includes('swing_mode') ? 'SWING' : (entry.state?.attributes?.friendly_name || 'SWITCH').toUpperCase();
                const icon = eid.includes('eco_mode') ? 'mdi:leaf' : eid.includes('turbo_mode') ? 'mdi:rocket-launch' : eid.includes('swing_mode') ? 'mdi:arrow-oscillating' : 'mdi:toggle-switch-outline';
                const activeColor = eid.includes('eco_mode') ? 'var(--lcars-sunflower)' : eid.includes('turbo_mode') ? 'var(--lcars-ice)' : 'var(--lcars-african-violet)';
                return html`
                  <button class="climate-mode-btn climate-toggle-btn" role="switch"
                    aria-checked="${String(isOn)}" ?data-active=${isOn}
                    style="${isOn ? `--toggle-active-bg: ${activeColor}` : ''}"
                    @click=${() => { if (!this.hass) return; lcarsAudio.play('switchToggle'); this.hass.callService('switch', 'toggle', { entity_id: eid }); }}>
                    <ha-icon icon="${icon}" aria-hidden="true"></ha-icon>
                    ${label}
                  </button>
                `;
              })}
            </div>
          ` : ''}
          ${auxNumbers.length > 0 ? auxNumbers.map(entry => {
            const eid = entry.entity?.entity_id || '';
            const raw = entry.state?.state;
            const val = raw != null && !isNaN(raw) ? Number(raw) : null;
            const nAttrs = entry.state?.attributes || {};
            const min = nAttrs.min ?? 0;
            const max = nAttrs.max ?? 24;
            const nStep = nAttrs.step ?? 1;
            const isTimer = /timer/i.test(eid);
            const label = isTimer ? 'TIMER' : (nAttrs.friendly_name || 'SETTING').toUpperCase();
            return html`
              <div class="climate-aux-strip" role="group" aria-label="${label}">
                <span class="climate-aux-inline-label">${label}</span>
                <button class="climate-sp-btn sp-decrement" aria-label="Decrease ${label}"
                  ?disabled=${val == null || val <= min}
                  @click=${() => { if (!this.hass || val == null) return; this.hass.callService('number', 'set_value', { entity_id: eid, value: Math.max(min, val - nStep) }); }}>−</button>
                <span class="climate-timer-value">${val != null ? (isTimer ? (val > 0 ? `${val}H` : 'OFF') : `${val}`) : '—'}</span>
                <button class="climate-sp-btn sp-increment" aria-label="Increase ${label}"
                  ?disabled=${val == null || val >= max}
                  @click=${() => { if (!this.hass || val == null) return; this.hass.callService('number', 'set_value', { entity_id: eid, value: Math.min(max, val + nStep) }); }}>+</button>
              </div>
            `;
          }) : ''}
        </div>
      </div>
    `;
  }

  /**
   * Multi-zone awareness: get temperature readings from sibling areas' thermostats.
   * Uses hierarchy utils (4X-12) for floor→area resolution.
   */
  _getSiblingZoneTemps() {
    if (!this.hass || !this.areaId) return [];
    const siblings = getSiblingAreas(this.hass, this.areaId);
    const zones = [];
    for (const sibAreaId of siblings) {
      const area = this.hass.areas?.[sibAreaId];
      if (!area) continue;
      // Find climate entities in sibling area
      const entityReg = Object.values(this.hass.entities || {});
      const deviceReg = this.hass.devices || {};
      const areaDeviceIds = new Set();
      Object.values(deviceReg).forEach(dev => {
        if (dev.area_id === sibAreaId) areaDeviceIds.add(dev.id);
      });
      for (const ent of entityReg) {
        if (ent.entity_id?.startsWith('climate.') && !ent.hidden_by && !ent.disabled_by) {
          const inArea = ent.area_id === sibAreaId || (!ent.area_id && ent.device_id && areaDeviceIds.has(ent.device_id));
          if (!inArea) continue;
          const state = this.hass.states?.[ent.entity_id];
          const temp = state?.attributes?.current_temperature;
          if (temp != null) {
            const action = state.attributes?.hvac_action || 'off';
            zones.push({
              name: area.name,
              temp: Math.round(Number(temp)),
              color: getHvacActionColor(action),
            });
            break; // one thermostat per area
          }
        }
      }
    }
    return zones;
  }
}

if (!customElements.get('lcars-climate-panel')) {
  defineLcars('lcars-climate-panel', LcarsClimatePanel);
}
