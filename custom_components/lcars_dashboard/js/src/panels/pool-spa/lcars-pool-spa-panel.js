/**
 * lcars-pool-spa-panel.js
 *
 * Extracted pool & spa device panel — Pentair ScreenLogic.
 * Pool/spa body frames, water chemistry, pump controls, lighting.
 *
 * v4.17.0 Panel Extraction Architecture (4X-5)
 * v4.18.0 Visual Refresh (4X-9) — LCARS compliance fixes,
 *   chemistry segmented bars, freeze banner, circuit grouping,
 *   heating indicator, temperature trend, linkedEntities integration.
 */
import { defineLcars } from '../../lcars-helpers.js';
import { html } from 'lit-element';
import { LcarsBasePanel } from '../../lcars-base-panel.js';
import { SENSOR_DOMAINS } from '../../lcars-entity-utils.js';
import { getPoolBodyColor } from '../../lcars-color-utils.js';
import { clampSetpoint, createDebouncer } from '../../lcars-service-utils.js';
import { sharedKeyframes, sharedReducedMotion } from '../../lcars-shared-animations.js';
import { poolSpaPanelStyles } from './lcars-pool-spa-panel-styles.js';
import '../../components/lcars-segmented-bar/lcars-segmented-bar.js';

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
    const waterFeatures = [];
    const spaCircuits = [];
    const utilityCircuits = [];
    const lights = [];
    const environmental = [];
    const diagnostics = [];
    let freezeSensor = null;

    const CHEM_KEYS = /orp|ph_|salt|tds|saturation|calcium|alkalinity|cyanuric|chlorine|hardness/i;
    const FEATURE_KEYS = /waterfall|spillway|bubbler|fountain/i;
    const SPA_KEYS = /blower|spa.*jet|jet.*spa/i;

    for (const entry of entries) {
      const eid = entry.entity.entity_id;
      const domain = entry.domain;
      const attrs = entry.state?.attributes || {};
      const dc = attrs.device_class || '';

      if (domain === 'climate') {
        if (/spa/i.test(eid)) spa.push(entry);
        else pool.push(entry);
        continue;
      }
      if (domain === 'binary_sensor' && /freeze/i.test(eid)) {
        freezeSensor = entry;
        continue;
      }
      if (domain === 'light') { lights.push(entry); continue; }
      if (domain === 'sensor' && CHEM_KEYS.test(eid)) { chemistry.push(entry); continue; }
      if (domain === 'switch') {
        if (/pump/i.test(eid)) pumps.push(entry);
        else if (FEATURE_KEYS.test(eid)) waterFeatures.push(entry);
        else if (SPA_KEYS.test(eid)) spaCircuits.push(entry);
        else utilityCircuits.push(entry);
        continue;
      }
      if (domain === 'sensor' && dc === 'temperature') { environmental.push(entry); continue; }
      diagnostics.push(entry);
    }

    return { pool, spa, chemistry, pumps, waterFeatures, spaCircuits, utilityCircuits,
             lights, environmental, diagnostics, freezeSensor };
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
    const isHeating = hvacAction === 'heating';
    const thermalClass = bodyType === 'spa' ? 'thermal-warm' : 'thermal-cool';

    return html`
      <div class="pool-body-frame ${thermalClass}" style="--body-color:${bodyColor}" role="region"
        aria-label="${label}: ${currentTemp != null ? currentTemp + '°' : 'N/A'}, target ${targetTemp || 'N/A'}°">
        <div class="pool-body-label" style="color:${bodyColor}">${label}</div>
        <div class="pool-body-temp" style="color:${bodyColor}">${currentTemp != null ? `${Math.round(currentTemp)}°` : '—'}</div>
        ${targetTemp != null ? html`
          <div class="pool-setpoint-row">
            <button class="pool-sp-btn sp-decrement" aria-label="Decrease ${label} target"
              @click=${() => this._handlePoolSetpoint(primary.entity.entity_id, attrs, targetTemp - (step || 1))}>−</button>
            <span class="pool-target" style="color:${bodyColor}">${targetTemp}°</span>
            <button class="pool-sp-btn sp-increment" aria-label="Increase ${label} target"
              @click=${() => this._handlePoolSetpoint(primary.entity.entity_id, attrs, targetTemp + (step || 1))}>+</button>
          </div>
        ` : ''}
        ${isHeating ? html`
          <div class="pool-heating-bar" style="--body-color:${bodyColor}"></div>
        ` : ''}
      </div>
    `;
  }

  /** Chemistry threshold color: ice=optimal, sunflower=acceptable, tomato=alert */
  _getChemThresholds(eid) {
    if (/ph/i.test(eid)) return [
      { value: 0, color: 'var(--lcars-tomato)' },
      { value: 7.0, color: 'var(--lcars-sunflower)' },
      { value: 7.2, color: 'var(--lcars-ice)' },
      { value: 7.6, color: 'var(--lcars-sunflower)' },
      { value: 7.8, color: 'var(--lcars-tomato)' },
    ];
    if (/chlorine/i.test(eid)) return [
      { value: 0, color: 'var(--lcars-tomato)' },
      { value: 0.5, color: 'var(--lcars-sunflower)' },
      { value: 1.0, color: 'var(--lcars-ice)' },
      { value: 3.0, color: 'var(--lcars-sunflower)' },
      { value: 5.0, color: 'var(--lcars-tomato)' },
    ];
    if (/orp/i.test(eid)) return [
      { value: 0, color: 'var(--lcars-tomato)' },
      { value: 550, color: 'var(--lcars-sunflower)' },
      { value: 650, color: 'var(--lcars-ice)' },
      { value: 750, color: 'var(--lcars-sunflower)' },
      { value: 800, color: 'var(--lcars-tomato)' },
    ];
    if (/alkalinity/i.test(eid)) return [
      { value: 0, color: 'var(--lcars-tomato)' },
      { value: 60, color: 'var(--lcars-sunflower)' },
      { value: 80, color: 'var(--lcars-ice)' },
      { value: 120, color: 'var(--lcars-sunflower)' },
      { value: 150, color: 'var(--lcars-tomato)' },
    ];
    if (/hardness|calcium/i.test(eid)) return [
      { value: 0, color: 'var(--lcars-tomato)' },
      { value: 150, color: 'var(--lcars-sunflower)' },
      { value: 200, color: 'var(--lcars-ice)' },
      { value: 400, color: 'var(--lcars-sunflower)' },
      { value: 500, color: 'var(--lcars-tomato)' },
    ];
    if (/salt/i.test(eid)) return [
      { value: 0, color: 'var(--lcars-tomato)' },
      { value: 2500, color: 'var(--lcars-sunflower)' },
      { value: 2700, color: 'var(--lcars-ice)' },
      { value: 3400, color: 'var(--lcars-sunflower)' },
      { value: 3600, color: 'var(--lcars-tomato)' },
    ];
    return [{ value: 0, color: 'var(--lcars-ice)' }];
  }

  /** Get chemistry bar range for segmented bar min/max */
  _getChemRange(eid) {
    if (/ph/i.test(eid)) return { min: 6.5, max: 8.5 };
    if (/chlorine/i.test(eid)) return { min: 0, max: 6 };
    if (/orp/i.test(eid)) return { min: 400, max: 900 };
    if (/alkalinity/i.test(eid)) return { min: 0, max: 200 };
    if (/hardness|calcium/i.test(eid)) return { min: 0, max: 600 };
    if (/salt/i.test(eid)) return { min: 2000, max: 4000 };
    return { min: 0, max: 100 };
  }

  _renderCircuitGroup(entries, groupLabel) {
    if (!entries.length) return '';
    const onCount = entries.filter(e => e.state?.state === 'on').length;
    return html`
      <div class="circuit-group">
        <div class="circuit-group-label">${groupLabel} <span class="circuit-count">(${onCount}/${entries.length})</span></div>
        ${entries.map(({ entity, state }) => {
          const name = this._friendlyName(state, entity);
          const isOn = state?.state === 'on';
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
    `;
  }

  renderBadge() {
    const allEntities = this._getAllEntities();
    const { pool, spa, freezeSensor } = this._partitionPoolEntities(allEntities);
    const poolTemp = pool[0]?.state?.attributes?.current_temperature;
    const spaTemp = spa[0]?.state?.attributes?.current_temperature;
    const isFreezing = freezeSensor?.state?.state === 'on';
    return html`
      ${poolTemp != null ? html`<span style="color:var(--lcars-ice)">POOL ${Math.round(poolTemp)}°</span>` : ''}
      ${spaTemp != null ? html`<span style="color:var(--lcars-butterscotch)"> SPA ${Math.round(spaTemp)}°</span>` : ''}
      ${isFreezing ? html`<span style="color:var(--lcars-tomato)"> ❄ FREEZE</span>` : ''}
    `;
  }

  renderContent() {
    const allEntities = this._getAllEntities();
    const { pool, spa, chemistry, pumps, waterFeatures, spaCircuits, utilityCircuits,
            lights, environmental, freezeSensor } = this._partitionPoolEntities(allEntities);
    const hasChem = chemistry.length > 0;
    const isFreezing = freezeSensor?.state?.state === 'on';

    return html`
      ${isFreezing ? html`
        <div class="freeze-banner" role="alert">
          <span class="freeze-icon">❄</span> FREEZE PROTECT ACTIVE
        </div>
      ` : freezeSensor ? html`
        <div class="freeze-nominal">FREEZE: NOMINAL</div>
      ` : ''}

      <div class="pool-content ${hasChem ? '' : 'pool-no-chem'} ${isFreezing ? 'freeze-active' : ''}">

        ${hasChem ? html`
          <div class="pool-chemistry" role="list" aria-label="Water chemistry">
            ${chemistry.map(({ entity, state, _linked }) => {
              const name = this._friendlyName(state, entity);
              const val = parseFloat(state.state);
              const unit = state.attributes?.unit_of_measurement || '';
              const thresholds = this._getChemThresholds(entity.entity_id);
              const range = this._getChemRange(entity.entity_id);
              const isLinked = _linked;
              return html`
                <div class="chem-reading" tabindex="0" role="listitem"
                  aria-label="${name}: ${state.state}${unit ? ' ' + unit : ''}"
                  @click=${() => this._handleEntityClick(entity.entity_id)}
                  @keydown=${(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._handleEntityClick(entity.entity_id); } }}>
                  <span class="chem-label">${name}${isLinked ? html` <span class="source-pill">W</span>` : ''}</span>
                  <lcars-segmented-bar
                    .value=${isNaN(val) ? 0 : val}
                    .min=${range.min}
                    .max=${range.max}
                    .segments=${6}
                    .thresholds=${thresholds}
                    .label="${name}: ${state.state}${unit ? ' ' + unit : ''}">
                  </lcars-segmented-bar>
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
          ${pumps.length > 0 ? html`
            <div class="circuit-group">
              <div class="circuit-group-label">PUMPS <span class="circuit-count">(${pumps.filter(e => e.state?.state === 'on').length}/${pumps.length})</span></div>
              ${pumps.map(({ entity, state }, idx) => {
                const name = this._friendlyName(state, entity);
                const isOn = state.state === 'on';
                return html`
                  <button class="device-control-btn" role="switch" aria-checked="${isOn}" ?data-on=${isOn}
                    @click=${() => this._handleToggle(entity.entity_id)}
                    title="${name}: ${state.state}">
                    <div class="lcars-pump-spinner ${isOn ? 'on' : ''}" aria-hidden="true">
                      <div class="dot"></div><div class="dot"></div><div class="dot"></div>
                    </div>
                    <span>${name}</span>
                  </button>
                `;
              })}
            </div>
          ` : ''}
          ${this._renderCircuitGroup(waterFeatures, 'WATER FEATURES')}
          ${this._renderCircuitGroup(spaCircuits, 'SPA')}
          ${this._renderCircuitGroup(utilityCircuits, 'UTILITY')}

          ${environmental.map(({ entity, state }) => {
            const name = this._friendlyName(state, entity);
            const unit = state.attributes?.unit_of_measurement || '';
            return html`
              <div class="device-sensor-line" tabindex="0" role="listitem"
                @click=${() => this._handleEntityClick(entity.entity_id)}>
                <div class="sensor-indicator-bar" style="background:var(--lcars-data-accent)"></div>
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
  defineLcars('lcars-pool-spa-panel', LcarsPoolSpaPanel);
}
