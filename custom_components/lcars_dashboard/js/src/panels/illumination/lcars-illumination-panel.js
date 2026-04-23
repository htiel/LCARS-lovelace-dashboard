/**
 * lcars-illumination-panel.js
 *
 * Area-level device list for the Illumination dashboard.
 * Renders individual device elements based on capability classification:
 *   Type A (onoff)  â€” simple pill button
 *   Type B (dimmer)  â€” LCARS segmented slider + on/off pill
 *   Type C (full)    â€” slider + color/effect controls
 *   Type D (circuit) â€” switch toggle pill
 *
 * No panel frame â€” devices render directly under area dividers.
 * v5.0.0-beta.12 â€” Illumination Device Elements
 */
import { LitElement, html, css } from 'lit-element';
import { isLightingEntity, classifyDevice, classifyLightType } from '../../lcars-entity-utils.js';
import { showMoreInfo, lcarsLog } from '../../lcars-helpers.js';
import { createDebouncer, createRateLimiter, clampValue } from '../../lcars-service-utils.js';
import { sharedKeyframes, sharedReducedMotion } from '../../lcars-shared-animations.js';
import { lcarsAudio } from '../../lcars-audio.js';

import '../../components/lcars-slider/lcars-slider.js';
import '../../components/lcars-panel-frame/lcars-panel-frame.js';
import '../../components/lcars-summary-badge/lcars-summary-badge.js';

const TAG = 'IlluminationPanel';

class LcarsIlluminationPanel extends LitElement {

  static get properties() {
    return {
      hass:       { type: Object },
      entities:   { type: Array },
      group:      { type: Object },
      config:     { type: Object },
      areaId:     { type: String, attribute: 'area-id' },
      editMode:   { type: Boolean, attribute: 'edit-mode', reflect: true },
      filter:     { type: String },
    };
  }

  constructor() {
    super();
    this.hass = null;
    this.entities = null;
    this.group = null;
    this.config = null;
    this.filter = 'all';
    this.areaId = null;
    this.editMode = false;
    this._expandedEffects = new Set();
    this._brightnessDebouncer = createDebouncer((eid, pct) => {
      const safePct = clampValue(pct, 1, 100);
      const brightness = Math.round(safePct / 100 * 255);
      this._callService('light', 'turn_on', { entity_id: eid, brightness });
    }, 300);
    this._sceneRateLimiter = createRateLimiter(3, 5000);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._brightnessDebouncer.cancel();
  }

  /* â”€â”€â”€ Entity Partitioning â”€â”€â”€ */

  _getPartition() {
    const allEntries = this.entities || this.group?.entities || [];
    const lights = [];   // light domain entities
    const circuits = []; // switches/input_booleans
    const scenes = [];

    const coveredDeviceIds = new Set();

    for (const entry of allEntries) {
      if (entry.domain === 'scene') {
        scenes.push(entry);
      } else if (entry.domain === 'light' && isLightingEntity(entry)) {
        lights.push(entry);
        if (entry.entity?.device_id) coveredDeviceIds.add(entry.entity.device_id);
      }
    }

    // Pass 2: circuits (switches that are lighting entities)
    const claimedDeviceIds = new Set();
    const byDevice = new Map();
    for (const entry of allEntries) {
      const did = entry.entity?.device_id;
      if (did && !coveredDeviceIds.has(did)) {
        if (!byDevice.has(did)) byDevice.set(did, []);
        byDevice.get(did).push(entry);
      }
    }
    for (const [did, devEntries] of byDevice) {
      if (classifyDevice(devEntries)) claimedDeviceIds.add(did);
    }

    for (const entry of allEntries) {
      if (entry.domain === 'light' || entry.domain === 'scene') continue;
      if (entry.entity?.device_id && coveredDeviceIds.has(entry.entity.device_id)) continue;
      if (!isLightingEntity(entry)) continue;
      if (entry.entity?.device_id && claimedDeviceIds.has(entry.entity.device_id)) continue;
      circuits.push(entry);
    }

    return { lights, circuits, scenes };
  }

  /* ─── Render ─── */

  render() {
    const { lights, circuits, scenes } = this._getPartition();

    // Apply filter
    const showLights = this.filter !== 'circuits';
    const showCircuits = this.filter !== 'lights';
    const filteredLights = showLights ? lights : [];
    const filteredCircuits = showCircuits ? circuits : [];

    if (filteredLights.length === 0 && filteredCircuits.length === 0) return html``;

    // Sub-partition lights: complex (dimmer/full) left, simple (onoff) right
    const complexLights = filteredLights.filter(e => {
      const state = this.hass?.states?.[e.entity?.entity_id] || e.state;
      const t = classifyLightType(state);
      return t === 'dimmer' || t === 'full';
    });
    const simpleLights = filteredLights.filter(e => {
      const state = this.hass?.states?.[e.entity?.entity_id] || e.state;
      return classifyLightType(state) === 'onoff';
    });

    const content = html`
      ${filteredLights.length > 0 ? html`
        <div class="ilm-lights-split">
          ${complexLights.length > 0 ? html`
            <div class="ilm-devices ilm-complex">
              ${complexLights.map(entry => this._renderDevice(entry))}
            </div>
          ` : ''}
          ${simpleLights.length > 0 ? html`
            <div class="ilm-simple-group">
              ${simpleLights.map(entry => this._renderDevice(entry))}
            </div>
          ` : ''}
        </div>
      ` : ''}
      ${filteredLights.length > 0 && filteredCircuits.length > 0 ? html`
        <div class="ilm-section-divider">
          <span class="ilm-section-label">CIRCUITS</span>
          <span class="ilm-section-line"></span>
        </div>
      ` : ''}
      ${filteredCircuits.length > 0 ? html`
        <div class="ilm-devices">
          ${filteredCircuits.map(entry => this._renderDevice(entry))}
        </div>
      ` : ''}
    `;

    // Habitat mode: group present → wrap in panel frame
    if (this.group) {
      const all = [...lights, ...circuits];
      const active = all.filter(e => {
        const eid = e.entity?.entity_id;
        return (this.hass?.states?.[eid] || e.state)?.state === 'on';
      }).length;
      const panelName = this._getPanelName();
      const panelCode = this._getPanelCode();
      return html`
        <lcars-panel-frame
          panel-name="${panelName}"
          panel-code="${panelCode}"
          frame-color="var(--lcars-sunflower)"
          panel-type="illumination">
          <span slot="badge">
            <lcars-summary-badge value="${active}" total="${all.length}" label="ON" color="var(--lcars-sunflower)"></lcars-summary-badge>
          </span>
          ${content}
        </lcars-panel-frame>
      `;
    }

    // Illumination dashboard mode: no frame
    return content;
  }

  _getPanelName() {
    if (this.group?.device) {
      const dev = this.group.device;
      const raw = dev.name_by_user || dev.name || 'ILLUMINATION CONTROL';
      const area = this.hass?.areas?.[this.areaId];
      if (area?.name && raw.toLowerCase().startsWith(area.name.toLowerCase())) {
        const stripped = raw.slice(area.name.length).trim().replace(/^[-–:]\s*/, '');
        return stripped || raw;
      }
      return raw;
    }
    return 'ILLUMINATION CONTROL';
  }

  _getPanelCode() {
    const id = this.entities?.[0]?.entity?.entity_id
      || this.group?.entities?.[0]?.entity?.entity_id
      || this.group?.device?.id
      || this.areaId || 'panel';
    let h = 5381;
    for (let i = 0; i < id.length; i++) {
      h = ((h << 5) + h + id.charCodeAt(i)) | 0;
    }
    const code = String(Math.abs(h) % 1000000).padStart(6, '0');
    return `${code.slice(0, 3)}-${code.slice(3)}`;
  }

  _renderDevice(entry) {
    const eid = entry.entity?.entity_id;
    const state = this.hass?.states?.[eid] || entry.state;
    const isOn = state?.state === 'on';
    const name = this._shortName(entry);

    if (entry.domain === 'light') {
      const lightType = classifyLightType(state);
      switch (lightType) {
        case 'onoff': return this._renderOnOffPill(eid, name, isOn);
        case 'dimmer': return this._renderDimmer(eid, name, isOn, state);
        case 'full':   return this._renderFullLight(eid, name, isOn, state);
      }
    }
    // Circuit (switch/input_boolean)
    return this._renderCircuitPill(eid, name, isOn);
  }

  /* â”€â”€â”€ Type A: On/Off Pill â”€â”€â”€ */

  _renderOnOffPill(eid, name, isOn) {
    return html`
      <button class="ilm-pill ${isOn ? 'on' : 'off'}"
              aria-pressed="${isOn ? 'true' : 'false'}"
              aria-label="${name} â€” ${isOn ? 'ON' : 'OFF'}"
              @click=${() => this._toggleEntity(eid)}
              @contextmenu=${(e) => { e.preventDefault(); showMoreInfo(eid); }}>
        <span class="ilm-pill__indicator ${isOn ? 'active' : ''}"></span>
        <span class="ilm-pill__name">${name}</span>
        <span class="ilm-pill__state">${isOn ? 'ON' : 'OFF'}</span>
      </button>
    `;
  }

  /* â”€â”€â”€ Type B: Dimmer â”€â”€â”€ */

  _renderDimmer(eid, name, isOn, state) {
    const brightness = isOn ? Math.round((state?.attributes?.brightness || 0) / 255 * 100) : 0;
    const barColor = this._getBarColor(state);

    return html`
      <div class="ilm-dimmer">
        <div class="ilm-dimmer__header">
          <span class="ilm-dimmer__name">${name}</span>
          <span class="ilm-type-badge">DIM</span>
          <span class="ilm-dimmer__value">${isOn ? brightness + '%' : 'OFF'}</span>
        </div>
        <lcars-slider
          .value=${brightness}
          min="1"
          max="100"
          step="1"
          color="${barColor}"
          label="${name} brightness"
          @lcars-slider-input=${(e) => { e.stopPropagation(); this._brightnessDebouncer.call(eid, e.detail.value); }}
          @lcars-slider-change=${(e) => { e.stopPropagation(); this._setBrightness(eid, e.detail.value); }}
          @click=${(e) => e.stopPropagation()}>
        </lcars-slider>
        <button class="ilm-pill compact ${isOn ? 'on' : 'off'}"
                aria-pressed="${isOn ? 'true' : 'false'}"
                aria-label="${name} power"
                @click=${() => this._toggleEntity(eid)}
                @contextmenu=${(e) => { e.preventDefault(); showMoreInfo(eid); }}>
          <span class="ilm-pill__state">${isOn ? 'ON' : 'OFF'}</span>
        </button>
      </div>
    `;
  }

  /* â”€â”€â”€ Type C: Full-Featured Light â”€â”€â”€ */

  _renderFullLight(eid, name, isOn, state) {
    const brightness = isOn ? Math.round((state?.attributes?.brightness || 0) / 255 * 100) : 0;
    const barColor = this._getBarColor(state);
    const supportedModes = state?.attributes?.supported_color_modes || [];
    const hasColorControl = supportedModes.some(m => m === 'hs' || m === 'rgb' || m === 'xy');
    const effectList = state?.attributes?.effect_list;
    const activeEffect = state?.attributes?.effect;
    const hasEffects = Array.isArray(effectList) && effectList.length > 0;
    const activeHue = state?.attributes?.hs_color?.[0];

    return html`
      <div class="ilm-full" role="group" aria-label="${name} controls">
        <div class="ilm-dimmer__header">
          <span class="ilm-dimmer__name">${name}</span>
          <span class="ilm-type-badge full">${hasColorControl ? 'RGB' : 'FX'}</span>
          <span class="ilm-dimmer__value">${isOn ? brightness + '%' : 'OFF'}</span>
        </div>
        <lcars-slider
          .value=${brightness}
          min="1"
          max="100"
          step="1"
          color="${barColor}"
          label="${name} brightness"
          @lcars-slider-input=${(e) => { e.stopPropagation(); this._brightnessDebouncer.call(eid, e.detail.value); }}
          @lcars-slider-change=${(e) => { e.stopPropagation(); this._setBrightness(eid, e.detail.value); }}
          @click=${(e) => e.stopPropagation()}>
        </lcars-slider>
        <div class="ilm-full__controls">
          <button class="ilm-pill compact ${isOn ? 'on' : 'off'}"
                  aria-pressed="${isOn ? 'true' : 'false'}"
                  aria-label="${name} power"
                  @click=${() => this._toggleEntity(eid)}
                  @contextmenu=${(e) => { e.preventDefault(); showMoreInfo(eid); }}>
            <span class="ilm-pill__state">${isOn ? 'ON' : 'OFF'}</span>
          </button>
          ${hasColorControl ? html`
            <div class="ilm-color-presets">
              ${LcarsIlluminationPanel.COLOR_PRESETS.map(p => html`
                <button class="ilm-color-btn ${this._isActivePreset(activeHue, p.hs[0]) ? 'active' : ''}"
                        style="--preset-color:${p.color}"
                        aria-pressed="${this._isActivePreset(activeHue, p.hs[0]) ? 'true' : 'false'}"
                        aria-label="Set ${p.name.toLowerCase()} color"
                        @click=${(e) => { e.stopPropagation(); this._setColor(eid, p.hs); }}>
                  ${p.name}
                </button>
              `)}
            </div>
          ` : ''}
          ${hasEffects ? html`
            <button class="ilm-fx-toggle"
                    aria-expanded="${this._expandedEffects.has(eid) ? 'true' : 'false'}"
                    @click=${(e) => { e.stopPropagation(); this._toggleEffects(eid); }}>
              ${this._expandedEffects.has(eid) ? '\u25BE' : '\u25B8'} ${effectList.length} EFFECTS
            </button>
            ${this._expandedEffects.has(eid) ? html`
              <div class="ilm-effect-strip">
                <button class="ilm-effect-btn ${!activeEffect || activeEffect === 'none' ? 'active' : ''}"
                        aria-pressed="${!activeEffect || activeEffect === 'none' ? 'true' : 'false'}"
                        @click=${(e) => { e.stopPropagation(); this._clearEffect(eid); }}>
                  SOLID
                </button>
                ${effectList.map(fx => html`
                  <button class="ilm-effect-btn ${activeEffect === fx ? 'active' : ''}"
                          aria-pressed="${activeEffect === fx ? 'true' : 'false'}"
                          @click=${(e) => { e.stopPropagation(); this._setEffect(eid, fx); }}>
                    ${fx.toUpperCase()}
                  </button>
                `)}
              </div>
            ` : ''}
          ` : ''}
        </div>
      </div>
    `;
  }

  /* â”€â”€â”€ Type D: Circuit/Switch Pill â”€â”€â”€ */

  _renderCircuitPill(eid, name, isOn) {
    return html`
      <button class="ilm-pill circuit ${isOn ? 'on' : 'off'}"
              aria-pressed="${isOn ? 'true' : 'false'}"
              aria-label="${name} â€” ${isOn ? 'ON' : 'OFF'}"
              @click=${() => this._toggleEntity(eid)}
              @contextmenu=${(e) => { e.preventDefault(); showMoreInfo(eid); }}>
        <span class="ilm-pill__indicator ${isOn ? 'active' : ''}"></span>
        <span class="ilm-pill__name">${name}</span>
        <span class="ilm-pill__state">${isOn ? 'ON' : 'OFF'}</span>
      </button>
    `;
  }

  _toggleEffects(eid) {
    if (this._expandedEffects.has(eid)) {
      this._expandedEffects.delete(eid);
    } else {
      this._expandedEffects.add(eid);
    }
    this.requestUpdate();
  }

  _getBarColor(state) {
    const isOn = state?.state === 'on';
    if (!isOn) return 'var(--lcars-gray, #666688)';
    const colorMode = state?.attributes?.color_mode;
    if (colorMode === 'hs' || colorMode === 'rgb' || colorMode === 'xy') {
      const hs = state?.attributes?.hs_color;
      if (hs) return this._hueToLcarsColor(hs[0], hs[1]);
    }
    const colorTempK = state?.attributes?.color_temp_kelvin;
    if (!colorTempK) return 'var(--lcars-sunflower)';
    const t = Math.max(0, Math.min(1, (colorTempK - 2000) / 4500));
    if (t < 0.5) return 'var(--lcars-butterscotch)';
    if (t < 0.8) return 'var(--lcars-sunflower)';
    return 'var(--lcars-ice)';
  }

  _hueToLcarsColor(hue, saturation) {
    if (saturation != null && saturation < 15) return 'var(--lcars-sunflower)';
    if (hue < 30)  return 'var(--lcars-tomato)';
    if (hue < 60)  return 'var(--lcars-butterscotch)';
    if (hue < 90)  return 'var(--lcars-sunflower)';
    if (hue < 160) return 'var(--lcars-green, #66bb6a)';
    if (hue < 220) return 'var(--lcars-ice)';
    if (hue < 270) return 'var(--lcars-bluey)';
    if (hue < 330) return 'var(--lcars-lilac)';
    return 'var(--lcars-tomato)';
  }

  /* â”€â”€â”€ Color Presets â”€â”€â”€ */

  static get COLOR_PRESETS() {
    return [
      { name: 'WARM',   hs: [30, 80],   color: 'var(--lcars-butterscotch, #ff9966)' },
      { name: 'COOL',   hs: [210, 20],  color: 'var(--lcars-ice, #99ccff)' },
      { name: 'RED',    hs: [0, 100],   color: 'var(--lcars-tomato, #ff5555)' },
      { name: 'GREEN',  hs: [120, 100], color: 'var(--lcars-green, #66bb6a)' },
      { name: 'BLUE',   hs: [240, 100], color: 'var(--lcars-bluey, #8899ff)' },
      { name: 'PURPLE', hs: [280, 80],  color: 'var(--lcars-lilac, #cc55ff)' },
    ];
  }

  _isActivePreset(activeHue, presetHue) {
    if (activeHue == null) return false;
    const diff = Math.abs(activeHue - presetHue);
    return diff < 20 || diff > 340;
  }

  /* â”€â”€â”€ Service Calls â”€â”€â”€ */

  _callService(domain, service, data) {
    if (!this.hass) return;
    return this.hass.callService(domain, service, data);
  }

  _toggleEntity(entityId) {
    if (!this.hass || !entityId) return;
    lcarsAudio.playForEntity(entityId);
    const domain = entityId.split('.')[0];
    this._callService(domain, 'toggle', { entity_id: entityId });
  }

  _setBrightness(entityId, pct) {
    if (!this.hass || !entityId) return;
    lcarsAudio.play('climateAdjust');
    const safePct = clampValue(pct, 1, 100);
    const brightness = Math.round(safePct / 100 * 255);
    this._callService('light', 'turn_on', { entity_id: entityId, brightness });
  }

  _setEffect(entityId, effect) {
    if (!this.hass || !entityId) return;
    lcarsAudio.play('lightToggle');
    this._callService('light', 'turn_on', { entity_id: entityId, effect });
  }

  _clearEffect(entityId) {
    if (!this.hass || !entityId) return;
    lcarsAudio.play('lightToggle');
    this._callService('light', 'turn_on', { entity_id: entityId, effect: 'none' });
  }

  _setColor(entityId, hs) {
    if (!this.hass || !entityId) return;
    lcarsAudio.play('lightToggle');
    this._callService('light', 'turn_on', { entity_id: entityId, hs_color: hs });
  }

  _activateScene(entityId) {
    if (!this.hass || !entityId) return;
    if (!this._sceneRateLimiter.allow()) return;
    lcarsAudio.play('scriptFire');
    this._callService('scene', 'turn_on', { entity_id: entityId });
  }

  /* â”€â”€â”€ Utility â”€â”€â”€ */

  _shortName(entry) {
    const raw = entry.state?.attributes?.friendly_name || entry.entity?.entity_id || '';
    const area = this.hass?.areas?.[this.areaId];
    if (!area?.name) return raw.toUpperCase();
    let result = raw;
    const prefixes = [area.name, area.name.replace(/[''']s$/i, '')];
    for (const p of prefixes) {
      if (result.toLowerCase().startsWith(p.toLowerCase())) {
        result = result.slice(p.length).trim().replace(/^[-â€“:]\s*/, '');
      }
    }
    return (result || raw).toUpperCase();
  }

  /* â”€â”€â”€ Styles â”€â”€â”€ */

  static get styles() {
    return [
      sharedKeyframes,
      sharedReducedMotion,
      css`
        :host { display: block; }

        /* ─── Section Divider ─── */
        .ilm-section-divider {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0.5rem 0 0.25rem 0;
        }
        .ilm-section-label {
          font-family: var(--lcars-font, 'Antonio', sans-serif);
          font-size: 0.75rem;
          color: var(--lcars-gray, #666688);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          white-space: nowrap;
        }
        .ilm-section-line {
          flex: 1;
          height: 1px;
          background: var(--lcars-gray, #666688);
          opacity: 0.3;
        }

        .ilm-devices {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(min(18rem, 100%), 1fr));
          gap: 0.375rem;
        }

        /* Split layout: complex lights left, simple pills right */
        .ilm-lights-split {
          display: flex;
          gap: 0.5rem;
        }

        .ilm-complex {
          flex: 1;
          min-width: 0;
        }

        .ilm-simple-group {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
          flex-shrink: 0;
          min-width: 10rem;
          max-width: 14rem;
          border-left: 1px solid rgba(102, 102, 136, 0.2);
          padding-left: 0.5rem;
        }

        /* â”€â”€â”€ Shared Pill Button (Type A & D) â”€â”€â”€ */

        .ilm-pill {
          display: flex;
          align-items: center;
          height: 3rem;
          padding: 0 1rem 0 0.75rem;
          border-radius: 0 var(--lcars-btn-radius, 1.5rem) var(--lcars-btn-radius, 1.5rem) 0;
          background: var(--lcars-sunflower, #ffcc99);
          color: var(--lcars-black, #000);
          font-family: var(--lcars-font, 'Antonio', sans-serif);
          font-size: 1rem;
          text-transform: uppercase;
          cursor: pointer;
          border: 1px solid rgba(255, 204, 153, 0.2);
          transition: filter 200ms ease;
          width: 100%;
          text-align: left;
        }

        .ilm-pill:hover { filter: brightness(1.2); }
        .ilm-pill:active { background: var(--lcars-gold, #ffaa00); }
        .ilm-pill:focus-visible {
          outline: 2px solid var(--lcars-ice, #99ccff);
          outline-offset: 2px;
        }

        .ilm-pill.off {
          background: var(--lcars-gray, #666688);
          color: var(--lcars-space-white, #f5f6fa);
          border-color: rgba(102, 102, 136, 0.3);
          animation: standbyPulse 4s ease-in-out infinite;
        }

        .ilm-pill.circuit { background: var(--lcars-almond-creme, #ffbbaa); }
        .ilm-pill.circuit.off { background: var(--lcars-gray, #666688); }

        .ilm-pill.compact {
          height: 2rem;
          width: auto;
          min-width: 5rem;
          padding: 0 0.75rem;
          justify-content: center;
          border-radius: var(--lcars-btn-radius, 1.5rem);
        }

        @keyframes standbyPulse {
          0%, 100% { opacity: 0.5; }
          50%      { opacity: 0.65; }
        }

        @media (prefers-reduced-motion: reduce) {
          .ilm-pill.off { animation: none; opacity: 0.55; }
        }

        .ilm-pill__indicator {
          display: inline-block;
          width: 3px;
          height: 1.25rem;
          border-radius: 1.5px;
          background: var(--lcars-black, #000);
          margin-right: 0.625rem;
          flex-shrink: 0;
          opacity: 0.3;
        }

        .ilm-pill__indicator.active { opacity: 1; }

        .ilm-pill__name {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .ilm-pill__state {
          font-variant-numeric: tabular-nums;
          min-width: 2.5rem;
          text-align: right;
          flex-shrink: 0;
        }

        /* â”€â”€â”€ Dimmer (Type B) â”€â”€â”€ */

        .ilm-dimmer {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          border: 1px solid rgba(255, 204, 153, 0.15);
          border-radius: 0.5rem;
          padding: 0.375rem;
        }

        .ilm-dimmer__header {
          display: flex;
          align-items: center;
          padding: 0 0.25rem;
        }

        .ilm-type-badge {
          font-family: var(--lcars-font, 'Antonio', sans-serif);
          font-size: 0.625rem;
          color: var(--lcars-gray, #666688);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-left: 0.5rem;
          flex-shrink: 0;
        }
        .ilm-type-badge.full {
          color: var(--lcars-gold, #ffaa00);
        }

        .ilm-fx-toggle {
          font-family: var(--lcars-font, 'Antonio', sans-serif);
          font-size: 0.625rem;
          text-transform: uppercase;
          color: var(--lcars-gray, #666688);
          background: rgba(102, 102, 136, 0.15);
          border: none;
          padding: 0.25rem 0.5rem;
          height: 1.5rem;
          border-radius: var(--lcars-btn-radius, 1.5rem);
          cursor: pointer;
          white-space: nowrap;
          transition: filter 150ms ease;
        }
        .ilm-fx-toggle:hover { filter: brightness(1.3); }
        .ilm-fx-toggle:focus-visible {
          outline: 2px solid var(--lcars-ice, #99ccff);
          outline-offset: 2px;
        }

        .ilm-dimmer__name {
          flex: 1;
          font-family: var(--lcars-font, 'Antonio', sans-serif);
          font-size: 0.875rem;
          color: var(--lcars-sunflower, #ffcc99);
          text-transform: uppercase;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .ilm-dimmer__value {
          font-family: var(--lcars-font, 'Antonio', sans-serif);
          font-size: 0.875rem;
          color: var(--lcars-sunflower, #ffcc99);
          font-variant-numeric: tabular-nums;
          min-width: 3rem;
          text-align: right;
        }

        /* â”€â”€â”€ Full-Featured Light (Type C) â”€â”€â”€ */

        .ilm-full {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          border: 1px solid rgba(255, 204, 153, 0.15);
          border-left: 4px solid var(--lcars-gold, #ffaa00);
          border-radius: 0.5rem;
          padding: 0.375rem;
        }

        .ilm-full__controls {
          display: flex;
          flex-wrap: wrap;
          gap: 0.375rem;
          align-items: center;
        }

        /* â”€â”€â”€ Color Presets â”€â”€â”€ */

        .ilm-color-presets {
          display: flex;
          gap: 0.125rem;
          flex-wrap: wrap;
        }

        .ilm-color-btn {
          font-family: var(--lcars-font, 'Antonio', sans-serif);
          font-size: 0.625rem;
          text-transform: uppercase;
          color: var(--lcars-black, #000);
          background: var(--preset-color, var(--lcars-sunflower));
          border: none;
          padding: 0.125rem 0.375rem;
          height: 1.5rem;
          border-radius: var(--lcars-btn-radius, 1.5rem);
          cursor: pointer;
          transition: filter 150ms ease;
          opacity: 0.45;
        }

        .ilm-color-btn.active { opacity: 1; }
        .ilm-color-btn:hover { filter: brightness(1.2); }
        .ilm-color-btn:focus-visible {
          outline: 2px solid var(--lcars-ice, #99ccff);
          outline-offset: 2px;
        }

        /* â”€â”€â”€ Effect Strip â”€â”€â”€ */

        .ilm-effect-strip {
          display: flex;
          gap: 0.25rem;
          flex-wrap: wrap;
        }

        .ilm-effect-btn {
          font-family: var(--lcars-font, 'Antonio', sans-serif);
          font-size: 0.75rem;
          text-transform: uppercase;
          color: var(--lcars-space-white, #f5f6fa);
          background: rgba(102, 102, 136, 0.3);
          border: none;
          padding: 0.25rem 0.5rem;
          height: 2rem;
          border-radius: var(--lcars-btn-radius, 1.5rem);
          cursor: pointer;
          transition: filter 150ms ease;
        }

        .ilm-effect-btn.active {
          background: var(--lcars-gold, #ffaa00);
          color: var(--lcars-black, #000);
        }

        .ilm-effect-btn:hover { filter: brightness(1.2); }
        .ilm-effect-btn:focus-visible {
          outline: 2px solid var(--lcars-ice, #99ccff);
          outline-offset: 2px;
        }
      `,
    ];
  }
}

customElements.define('lcars-illumination-panel', LcarsIlluminationPanel);
export { LcarsIlluminationPanel };
