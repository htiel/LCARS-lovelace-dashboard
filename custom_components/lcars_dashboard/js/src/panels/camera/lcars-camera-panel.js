/**
 * lcars-camera-panel.js
 *
 * Extracted camera device panel — viewscreen feed, sensors, and control buttons.
 * Imported as a side-effect from the orchestrator (lcars-homepage-card.js).
 *
 * v4.17.0 Panel Extraction Architecture (4X-4)
 */
import { html } from 'lit-element';
import { LcarsBasePanel } from '../../lcars-base-panel.js';
import { TOGGLE_DOMAINS } from '../../lcars-entity-utils.js';
import { sharedKeyframes, sharedReducedMotion } from '../../lcars-shared-animations.js';
import { cameraPanelStyles } from './lcars-camera-panel-styles.js';

/* ── Build a cache-busted camera image URL ── */
function cameraImageUrl(state) {
  const base = state?.attributes?.entity_picture;
  if (!base) return '';
  const ts = state.last_updated || state.last_changed || '';
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}_cb=${encodeURIComponent(ts)}`;
}

class LcarsCameraPanel extends LcarsBasePanel {

  get panelType() { return 'camera'; }
  get defaultPanelTitle() { return 'Camera'; }
  get frameColor() { return 'var(--lcars-butterscotch)'; }

  static get styles() {
    return [...super.styles, sharedKeyframes, sharedReducedMotion, cameraPanelStyles];
  }

  renderContent() {
    const { cameras, sensors, controls } = this._partitionDeviceEntities(this.group.entities);
    const deviceName = this._shortDeviceName(this.group.device);

    return html`
      <div class="camera-content">
        <div class="device-panel-sensors" role="list" aria-label="${deviceName} sensors">
          ${sensors.map(({ entity, state }) => {
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
        </div>

        <div class="device-panel-media"
          ?data-offline=${cameras.length > 0 && this._isOff(cameras[0].state)}>
          ${cameras.map(({ entity, state }, idx) => {
            const imgUrl = cameraImageUrl(state);
            const name = idx === 0 ? deviceName : this._friendlyName(state, entity);
            const off = this._isOff(state);
            const camState = (off || !imgUrl) ? 'offline' : 'connecting';
            return html`
              <div class="camera-frame" data-state="${camState}"
                style="${idx > 0 ? 'margin-top:var(--lcars-gap);border-top:2px solid var(--panel-frame-color)' : ''}"
                aria-busy="${camState === 'connecting'}"
                @click=${() => this._handleEntityClick(entity.entity_id)}>
                <div class="camera-connecting-overlay" aria-hidden="true">
                  <span class="camera-connecting-text">ESTABLISHING LINK</span>
                </div>
                <div class="camera-offline-overlay" aria-hidden="true">
                  <ha-icon icon="mdi:video-off"></ha-icon>
                  <span class="camera-offline-text">VIEWSCREEN OFFLINE</span>
                </div>
                ${imgUrl
                  ? html`<img src="${imgUrl}" alt="${name} camera feed"
                              data-entity="${entity.entity_id}"
                              .src=${imgUrl}
                              @load=${(e) => { const f = e.target.closest('.camera-frame'); if (f) { f.setAttribute('data-state', 'live'); f.removeAttribute('aria-busy'); } }}
                              @error=${(e) => { const f = e.target.closest('.camera-frame'); if (f) { f.setAttribute('data-state', 'offline'); f.removeAttribute('aria-busy'); } }} />`
                  : html`<div class="camera-spacer"></div>`
                }
              </div>`;
          })}
        </div>

        <div class="device-panel-controls" aria-label="${deviceName} controls">
          ${controls.map(({ entity, state }) => {
            const name = this._friendlyName(state, entity);
            const isOn = state.state === 'on';
            const isOff = this._isOff(state);
            const domain = entity.entity_id.split('.')[0];
            return html`
              <button class="device-control-btn" ?data-on=${isOn} ?data-off=${isOff}
                @click=${() => TOGGLE_DOMAINS.has(domain)
                  ? this._handleToggle(entity.entity_id)
                  : this._handleEntityClick(entity.entity_id)}
                title="${name}: ${state.state}">
                <ha-icon .icon=${this._getEntityIcon(state)}></ha-icon>
                <span>${name}</span>
              </button>
            `;
          })}
        </div>
      </div>
    `;
  }
}

if (!customElements.get('lcars-camera-panel')) {
  customElements.define('lcars-camera-panel', LcarsCameraPanel);
}
