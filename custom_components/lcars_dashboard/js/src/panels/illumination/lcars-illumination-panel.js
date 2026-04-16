/**
 * lcars-illumination-panel.js (4X-11)
 *
 * Area-level lighting control panel — aggregates all light domain entities,
 * lighting switches, and scenes into a unified LCARS console.
 *
 * Sections:
 *   1. Dimmable lights — full-width brightness bars with toggle + slider
 *   2. Scenes — horizontal strip of LCARS endcap activation buttons
 *   3. Switch circuits — simple on/off rows for non-dimmable lighting switches
 *
 * Badge: "3/5 ON" — active count / total count
 * Frame color: var(--lcars-sunflower) — warm light aesthetic
 */
import { html, css } from 'lit-element';
import { LcarsBasePanel } from '../../lcars-base-panel.js';
import { isLightingEntity } from '../../lcars-entity-utils.js';
import { showMoreInfo, fireEvent, lcarsLog } from '../../lcars-helpers.js';
import { createDebouncer, createRateLimiter, clampValue } from '../../lcars-service-utils.js';
import { sharedKeyframes, sharedReducedMotion } from '../../lcars-shared-animations.js';
import { lcarsFocusRing } from '../../lcars-styles.js';
import { illuminationPanelStyles } from './lcars-illumination-panel-styles.js';

import '../../components/lcars-summary-badge/lcars-summary-badge.js';

const TAG = 'IlluminationPanel';

class LcarsIlluminationPanel extends LcarsBasePanel {

  static get properties() {
    return {
      ...super.properties,
      _expandedLight: { type: String },  // entity_id of expanded brightness slider
    };
  }

  constructor() {
    super();
    this._expandedLight = null;
    this._brightnessDebouncer = createDebouncer((eid, pct) => {
      const safePct = clampValue(pct, 1, 100);
      const brightness = Math.round(safePct / 100 * 255);
      this._callService('light', 'turn_on', { entity_id: eid, brightness });
    }, 300);
    this._sceneRateLimiter = createRateLimiter(3, 5000);
  }

  get panelType() { return 'illumination'; }
  get defaultPanelTitle() { return 'ILLUMINATION CONTROL'; }
  get frameColor() { return 'var(--lcars-sunflower)'; }

  static get styles() {
    return [
      ...super.styles,
      sharedKeyframes,
      sharedReducedMotion,
      lcarsFocusRing,
      illuminationPanelStyles,
    ];
  }

  /* ─── Entity Partitioning ─── */

  /**
   * Partition area entities into lights, scenes, and circuits.
   */
  _partitionLightingEntities() {
    const allEntries = this._getAllEntities();

    const dimmableLights = [];  // light domain entities
    const scenes = [];          // scene domain
    const circuits = [];        // switches/booleans controlling lights

    for (const entry of allEntries) {
      if (entry.domain === 'light') {
        dimmableLights.push(entry);
      } else if (entry.domain === 'scene') {
        scenes.push(entry);
      } else if (isLightingEntity(entry) && entry.domain !== 'light') {
        circuits.push(entry);
      }
    }

    // Sort lights: on first, then by brightness descending, then by name
    dimmableLights.sort((a, b) => {
      const aOn = a.state?.state === 'on' ? 0 : 1;
      const bOn = b.state?.state === 'on' ? 0 : 1;
      if (aOn !== bOn) return aOn - bOn;
      const aBri = a.state?.attributes?.brightness || 0;
      const bBri = b.state?.attributes?.brightness || 0;
      if (aBri !== bBri) return bBri - aBri;
      return (a.state?.attributes?.friendly_name || '').localeCompare(
        b.state?.attributes?.friendly_name || ''
      );
    });

    return { dimmableLights, scenes, circuits };
  }

  /* ─── Badge ─── */

  renderBadge() {
    const { dimmableLights, circuits } = this._partitionLightingEntities();
    const all = [...dimmableLights, ...circuits];
    const total = all.length;
    const active = all.filter(e => e.state?.state === 'on').length;
    if (total === 0) return html``;

    return html`
      <lcars-summary-badge
        value="${active}"
        total="${total}"
        label="ON"
        color="var(--lcars-sunflower)">
      </lcars-summary-badge>
    `;
  }

  /* ─── Content ─── */

  renderContent() {
    const { dimmableLights, scenes, circuits } = this._partitionLightingEntities();

    if (dimmableLights.length === 0 && circuits.length === 0) {
      return html`<div class="ilm-empty">NO LIGHTING ENTITIES</div>`;
    }

    return html`
      <div class="ilm-content">
        ${dimmableLights.length > 0 ? html`
          <div class="ilm-lights" role="list" aria-label="Dimmable lights">
            ${dimmableLights.map(entry => this._renderLightBar(entry))}
          </div>
        ` : ''}

        ${scenes.length > 0 ? html`
          <div class="ilm-section-divider">
            <span class="ilm-section-label">SCENES</span>
            <span class="ilm-section-line"></span>
          </div>
          <div class="ilm-scenes" role="list" aria-label="Scene presets">
            ${scenes.map(entry => this._renderSceneButton(entry))}
          </div>
        ` : ''}

        ${circuits.length > 0 ? html`
          <div class="ilm-section-divider">
            <span class="ilm-section-label">CIRCUITS</span>
            <span class="ilm-section-line"></span>
          </div>
          <div class="ilm-circuits" role="list" aria-label="Lighting circuits">
            ${circuits.map(entry => this._renderCircuitRow(entry))}
          </div>
        ` : ''}
      </div>
    `;
  }

  /* ─── Light Brightness Bar ─── */

  _renderLightBar(entry) {
    const eid = entry.entity?.entity_id;
    const state = entry.state;
    const isOn = state?.state === 'on';
    const brightness = isOn ? Math.round((state?.attributes?.brightness || 0) / 255 * 100) : 0;
    const name = this._shortEntityName(entry);
    const expanded = this._expandedLight === eid;

    // Color temperature awareness
    const colorTemp = state?.attributes?.color_temp_kelvin;
    const barColor = this._getBarColor(colorTemp, isOn);

    return html`
      <div class="ilm-light-bar ${isOn ? 'on' : 'off'}"
           role="listitem"
           tabindex="0"
           style="--brightness:${brightness}%; --bar-color:${barColor}"
           @click=${() => this._toggleLight(eid)}
           @contextmenu=${(e) => { e.preventDefault(); showMoreInfo(eid); }}
           @keydown=${(e) => this._handleLightKeydown(e, eid, brightness)}>
        <span class="ilm-indicator ${isOn ? 'active' : ''}"
              aria-hidden="true"></span>
        <span class="ilm-light-name">${name}</span>
        <span class="ilm-light-value"
              tabindex="0"
              role="button"
              aria-expanded="${expanded}"
              aria-label="${name} brightness ${isOn ? brightness + '%' : 'OFF'} — click to ${expanded ? 'collapse' : 'expand'} slider"
              @click=${(e) => { e.stopPropagation(); this._expandedLight = expanded ? null : eid; }}>
          ${isOn ? `${brightness}%` : 'OFF'}
        </span>
      </div>
      ${expanded ? html`
        <div class="ilm-slider-row">
          <input type="range" min="1" max="100" .value=${String(brightness)}
                 aria-label="${name} brightness slider"
                 @input=${(e) => this._brightnessDebouncer.call(eid, parseInt(e.target.value))}
                 @change=${(e) => this._setBrightness(eid, parseInt(e.target.value))}>
        </div>
      ` : ''}
    `;
  }

  /* ─── Scene Button ─── */

  _renderSceneButton(entry) {
    const eid = entry.entity?.entity_id;
    const name = this._shortEntityName(entry);
    return html`
      <div role="listitem">
        <button class="ilm-scene-btn"
                aria-label="Activate ${name} scene"
                @click=${() => this._activateScene(eid)}>
          ${name}
        </button>
      </div>
    `;
  }

  /* ─── Circuit Row ─── */

  _renderCircuitRow(entry) {
    const eid = entry.entity?.entity_id;
    const isOn = entry.state?.state === 'on';
    const name = this._shortEntityName(entry);
    return html`
      <div class="ilm-circuit-row ${isOn ? 'on' : 'off'}"
           role="listitem"
           tabindex="0"
           @click=${() => this._toggleLight(eid)}
           @contextmenu=${(e) => { e.preventDefault(); showMoreInfo(eid); }}
           @keydown=${(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._toggleLight(eid); } }}>
        <span class="ilm-indicator ${isOn ? 'active' : ''}"
              aria-hidden="true"></span>
        <span class="ilm-circuit-name">${name}</span>
        <span class="ilm-circuit-state">${isOn ? 'ON' : 'OFF'}</span>
      </div>
    `;
  }

  /* ─── Color Temperature Bar Color ─── */

  _getBarColor(colorTempK, isOn) {
    if (!isOn) return 'var(--lcars-gray, #666688)';
    if (!colorTempK) return 'var(--lcars-sunflower)';
    // Map 2000K (warm amber) to 6500K (cool white)
    const t = Math.max(0, Math.min(1, (colorTempK - 2000) / 4500));
    // Interpolate between butterscotch and ice
    if (t < 0.5) return 'var(--lcars-butterscotch)';
    if (t < 0.8) return 'var(--lcars-sunflower)';
    return 'var(--lcars-ice)';
  }

  /* ─── Actions ─── */

  _toggleLight(entityId) {
    if (!this.hass || !entityId) return;
    const domain = entityId.split('.')[0];
    this._callService(domain, 'toggle', { entity_id: entityId });
  }

  _setBrightness(entityId, pct) {
    if (!this.hass || !entityId) return;
    const safePct = clampValue(pct, 1, 100);
    const brightness = Math.round(safePct / 100 * 255);
    this._callService('light', 'turn_on', { entity_id: entityId, brightness });
  }

  _activateScene(entityId) {
    if (!this.hass || !entityId) return;
    if (!this._sceneRateLimiter.allow()) return;
    this._callService('scene', 'turn_on', { entity_id: entityId });
  }

  _handleLightKeydown(e, entityId, currentBrightness) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this._toggleLight(entityId);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
      e.preventDefault();
      if (currentBrightness > 0) {
        this._setBrightness(entityId, Math.min(100, currentBrightness + 5));
      }
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
      e.preventDefault();
      if (currentBrightness > 0) {
        this._setBrightness(entityId, Math.max(1, currentBrightness - 5));
      }
    }
  }

  /* ─── Utility ─── */

  _shortEntityName(entry) {
    const raw = entry.state?.attributes?.friendly_name || entry.entity?.entity_id || '';
    return this._shortenName(raw, entry.entity).toUpperCase();
  }
}

customElements.define('lcars-illumination-panel', LcarsIlluminationPanel);
export { LcarsIlluminationPanel };
