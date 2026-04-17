/**
 * lcars-environment-panel.js
 *
 * Extracted environment/air-quality device panel — atmoscrubber cylinder,
 * AQ sensors, fan controls, and 24-hour sparklines.
 *
 * v4.17.0 Panel Extraction Architecture (4X-4)
 */
import { html } from 'lit-element';
import { LcarsBasePanel } from '../../lcars-base-panel.js';
import { AQ_DEVICE_CLASSES, AQ_ENTITY_SUFFIX_RE } from '../../lcars-entity-utils.js';
import { getStateColor, getCo2Color } from '../../lcars-color-utils.js';
import { renderSparkline, fetchSparklineData } from '../../lcars-sparkline.js';
import { sharedKeyframes, sharedReducedMotion } from '../../lcars-shared-animations.js';
import { environmentPanelStyles } from './lcars-environment-panel-styles.js';

class LcarsEnvironmentPanel extends LcarsBasePanel {

  _envHistoryCache = new Map();

  get panelType() { return 'environment'; }
  get defaultPanelTitle() { return 'Environment'; }
  get frameColor() { return 'var(--lcars-blue)'; }

  static get styles() {
    return [...super.styles, sharedKeyframes, sharedReducedMotion, environmentPanelStyles];
  }

  /* ─── Partition environment entities ─── */

  _partitionEnvironmentEntities(entries, categoryEntities) {
    const score = [];
    const airQuality = [];
    const telemetry = [];
    const controls = [];
    const diagnostics = [];

    for (const entry of entries) {
      const dc = entry.state?.attributes?.device_class || '';
      const domain = entry.domain;

      if (['fan', 'switch', 'button', 'number', 'select', 'light'].includes(domain)) {
        controls.push(entry);
        continue;
      }
      if (AQ_DEVICE_CLASSES.has(dc)) {
        airQuality.push(entry);
        continue;
      }
      if (!dc && domain === 'sensor' && AQ_ENTITY_SUFFIX_RE.test(entry.entity.entity_id)) {
        score.push(entry);
        continue;
      }
      telemetry.push(entry);
    }

    if (categoryEntities) {
      for (const e of [...categoryEntities.diagnostic, ...categoryEntities.config]) {
        const state = this._getEntityState(e.entity_id);
        if (!state) continue;
        diagnostics.push({ entity: e, domain: e.entity_id.split('.')[0], state });
      }
    }

    return { score, airQuality, telemetry, controls, diagnostics };
  }

  /* ─── Atmoscrubber helpers ─── */

  _getScrubberHue(aqi) {
    if (aqi == null || aqi <= 50) return 120;
    if (aqi <= 100) return 120 - ((aqi - 50) / 50) * 70;
    if (aqi <= 150) return 50 - ((aqi - 100) / 50) * 35;
    return Math.max(0, 15 - ((aqi - 150) / 100) * 15);
  }

  _getAQColor(aqi) {
    if (aqi == null || aqi <= 50) return 'var(--lcars-ice)';
    if (aqi <= 100) return 'var(--lcars-sunflower)';
    if (aqi <= 150) return 'var(--lcars-butterscotch)';
    if (aqi <= 200) return 'var(--lcars-peach)';
    return 'var(--lcars-tomato)';
  }

  _getScrubberSpeed(fanPercentage) {
    if (fanPercentage == null || fanPercentage === 0) return 20;
    return 2 + (18 * Math.pow(1 - fanPercentage / 100, 1.5));
  }

  /* ─── Sparkline data ─── */

  async _getSparklineData(deviceId, entityIds) {
    return fetchSparklineData(this.hass, deviceId, entityIds, this._envHistoryCache);
  }

  _renderSparkline(points, color, label) {
    return renderSparkline(points, { color, label, className: 'env-sparkline' });
  }

  /* ─── Render ─── */

  renderBadge() {
    const { score, airQuality } = this._partitionEnvironmentEntities(this.group.entities, this._getDeviceCategoryEntities(this.group.device.id));
    const scoreEntry = score[0];
    const scoreVal = scoreEntry ? parseFloat(scoreEntry.state.state) : null;
    const pm25Entry = airQuality.find(e => (e.state?.attributes?.device_class || '') === 'pm25');
    const pm25Val = pm25Entry ? parseFloat(pm25Entry.state.state) : null;
    const aqiEstimate = scoreVal != null && Number.isFinite(scoreVal) ? scoreVal
      : pm25Val != null && Number.isFinite(pm25Val) ? Math.min(300, pm25Val * 4)
      : null;
    const aqColor = this._getAQColor(aqiEstimate);
    if (!scoreEntry) return html``;
    return html`<span style="color:${aqColor}">${scoreVal != null && Number.isFinite(scoreVal) ? Math.round(scoreVal) : '—'}</span>`;
  }

  renderContent() {
    const categoryEntities = this._getDeviceCategoryEntities(this.group.device.id);
    const { score, airQuality, telemetry, controls, diagnostics } = this._partitionEnvironmentEntities(this.group.entities, categoryEntities);
    const deviceName = this._shortDeviceName(this.group.device) || 'Environment';

    const scoreEntry = score[0];
    const scoreVal = scoreEntry ? parseFloat(scoreEntry.state.state) : null;
    const pm25Entry = airQuality.find(e => (e.state?.attributes?.device_class || '') === 'pm25');
    const pm25Val = pm25Entry ? parseFloat(pm25Entry.state.state) : null;
    const aqiEstimate = scoreVal != null && Number.isFinite(scoreVal) ? scoreVal
      : pm25Val != null && Number.isFinite(pm25Val) ? Math.min(300, pm25Val * 4)
      : null;
    const hue = this._getScrubberHue(aqiEstimate);
    const aqColor = this._getAQColor(aqiEstimate);

    const fanEntry = controls.find(e => e.domain === 'fan');
    const fanState = fanEntry?.state;
    const fanPct = fanState?.attributes?.percentage ?? null;
    const fanPresets = fanState?.attributes?.preset_modes || [];
    const fanPreset = fanState?.attributes?.preset_mode || '';
    const isIdle = !fanEntry || fanState?.state === 'off' || fanPct === 0;
    const scrubberSpeed = this._getScrubberSpeed(isIdle ? 0 : fanPct);
    const sensorOnly = !fanEntry;
    const switchControls = controls.filter(e => e.domain !== 'fan');

    const sparklineIds = [...score, ...airQuality].map(e => e.entity.entity_id);
    if (sparklineIds.length > 0) {
      this._getSparklineData(this.group.device.id, sparklineIds).then((fresh) => {
        if (fresh) this.requestUpdate();
      });
    }
    const sparkData = this._envHistoryCache.get(this.group.device.id)?.data || {};

    return html`
      <div class="env-content ${sensorOnly ? 'sensor-only' : ''}">
        <!-- Sensors (left) -->
        <div class="env-sensors" role="list" aria-label="${deviceName} sensors">
          ${airQuality.map(({ entity, state }) => {
            const name = this._friendlyName(state, entity);
            const val = state.state;
            const unit = state.attributes?.unit_of_measurement || '';
            const color = this._getSensorIndicatorColor(state);
            return html`
              <lcars-sensor-row
                label="${name}"
                value="${val}${unit ? ' ' + unit : ''}"
                color="${color}"
                entity-id="${entity.entity_id}">
              </lcars-sensor-row>
            `;
          })}
          ${telemetry.map(({ entity, state }) => {
            const name = this._friendlyName(state, entity);
            const val = state.state;
            const unit = state.attributes?.unit_of_measurement || '';
            const color = this._getSensorIndicatorColor(state);
            return html`
              <lcars-sensor-row
                label="${name}"
                value="${val}${unit ? ' ' + unit : ''}"
                color="${color}"
                entity-id="${entity.entity_id}">
              </lcars-sensor-row>
            `;
          })}
          ${diagnostics.length > 0 ? html`
            <lcars-section-divider label="DIAGNOSTICS"></lcars-section-divider>
            ${diagnostics.map(({ entity, state }) => {
              const name = this._friendlyName(state, entity);
              const val = state.state;
              const unit = state.attributes?.unit_of_measurement || '';
              const color = this._getSensorIndicatorColor(state);
              return html`
                <lcars-sensor-row
                  label="${name}"
                  value="${val}${unit ? ' ' + unit : ''}"
                  color="${color}"
                  entity-id="${entity.entity_id}">
                </lcars-sensor-row>
              `;
            })}
          ` : ''}
        </div>

        <!-- Atmoscrubber Cylinder -->
        <div class="atmoscrubber-container" role="meter"
          aria-valuenow="${aqiEstimate != null ? Math.round(aqiEstimate) : ''}"
          aria-valuemin="0" aria-valuemax="300"
          aria-label="Air quality: ${aqiEstimate != null ? Math.round(aqiEstimate) : 'unknown'}">
          <div class="atmoscrubber ${isIdle ? 'scrubber-idle' : ''}"
            style="--scrubber-hue:${Math.round(hue)};--scrubber-speed:${scrubberSpeed.toFixed(1)}s;--atmos-quality-color:${aqColor}">
            ${scoreEntry ? html`
              <div class="scrubber-score">${scoreVal != null && Number.isFinite(scoreVal) ? Math.round(scoreVal) : '—'}</div>
            ` : pm25Entry ? html`
              <div class="scrubber-score">${pm25Val != null && Number.isFinite(pm25Val) ? Math.round(pm25Val) : '—'}</div>
            ` : ''}
          </div>
        </div>

        <!-- Controls (right) — only for purifiers -->
        ${!sensorOnly ? html`
          <div class="env-controls" aria-label="${deviceName} controls">
            ${fanEntry ? html`
              <button class="device-control-btn"
                ?data-on=${fanState?.state === 'on'}
                ?data-off=${this._isOff(fanState)}
                @click=${() => this._handleToggle(fanEntry.entity.entity_id)}
                title="Fan: ${fanState?.state}">
                <ha-icon .icon=${'mdi:fan'}></ha-icon>
                <span>${fanState?.state === 'on' ? `${fanPct || ''}%` : 'Off'}</span>
              </button>
              ${fanPresets.length > 0 ? html`
                <div class="lcars-option-strip" role="radiogroup" aria-label="Preset mode">
                  <span class="lcars-option-strip-label">Mode</span>
                  <div class="lcars-option-strip-btns">
                    ${fanPresets.map(mode => html`
                      <button class="lcars-option-btn"
                        role="radio"
                        aria-checked="${mode === fanPreset}"
                        ?data-selected=${mode === fanPreset}
                        @click=${() => {
                          const validModes = this.hass.states[fanEntry.entity.entity_id]?.attributes?.preset_modes || [];
                          if (!validModes.includes(mode)) return;
                          this.hass.callService('fan', 'set_preset_mode', {
                            entity_id: fanEntry.entity.entity_id, preset_mode: mode
                          });
                        }}>
                        ${mode}
                      </button>
                    `)}
                  </div>
                </div>
              ` : ''}
            ` : ''}
            ${switchControls.map(({ entity, state }) => {
              const name = this._friendlyName(state, entity);
              const isOn = state.state === 'on';
              const isOff = this._isOff(state);
              return html`
                <button class="device-control-btn" ?data-on=${isOn} ?data-off=${isOff}
                  @click=${() => this._handleToggle(entity.entity_id)}
                  title="${name}: ${state.state}">
                  <ha-icon .icon=${this._getEntityIcon(state)}></ha-icon>
                  <span>${name}</span>
                </button>
              `;
            })}
          </div>
        ` : ''}

        <!-- Sparklines -->
        <div class="env-sparklines" aria-label="24-hour history">
          ${[...score, ...airQuality].map(({ entity, state }) => {
            const name = this._friendlyName(state, entity);
            const points = sparkData[entity.entity_id];
            const dc = state.attributes?.device_class || '';
            const color = dc === 'pm25' ? 'var(--lcars-peach)'
              : dc === 'carbon_dioxide' ? 'var(--lcars-sunflower)'
              : dc === 'volatile_organic_compounds_parts' || dc === 'volatile_organic_compounds' ? 'var(--lcars-african-violet)'
              : 'var(--lcars-ice)';
            return this._renderSparkline(points, color, name);
          })}
        </div>
      </div>
    `;
  }
}

if (!customElements.get('lcars-environment-panel')) {
  customElements.define('lcars-environment-panel', LcarsEnvironmentPanel);
}
