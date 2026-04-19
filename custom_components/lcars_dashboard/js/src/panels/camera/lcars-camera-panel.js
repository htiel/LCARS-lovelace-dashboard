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
import { TOGGLE_DOMAINS, tierEntities, isDiagnosticEntity } from '../../lcars-entity-utils.js';
import { formatStateValue } from '../../lcars-format-utils.js';
import { showMoreInfo } from '../../lcars-helpers.js';
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

/* ── Camera hero filter for tier partitioning (P3 DATA-007) ── */
const CAMERA_HERO_CLASSES = new Set([
  'motion', 'occupancy', 'sound', 'connectivity', 'battery', 'recording',
]);
function isCameraHero(entry) {
  const dc = entry.state?.attributes?.device_class || '';
  return CAMERA_HERO_CLASSES.has(dc);
}

/* ── Platform name humanization (P3 DATA-014) ── */
const PLATFORM_NAMES = { unifiprotect: 'UniFi Protect', blink: 'Blink', nest: 'Nest' };
function humanizePlatform(slug) {
  return PLATFORM_NAMES[slug] || slug.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

/* ── "2h 14m ago" from last_changed ── */
function formatTimeSince(isoStr) {
  if (!isoStr) return '';
  const ms = Date.now() - new Date(isoStr).getTime();
  if (ms < 0 || isNaN(ms)) return '';
  const mins = Math.floor(ms / 60000);
  if (mins < 5) return ''; // suppress for very recent — likely rebooting
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}D ${hours % 24}H AGO`;
  if (hours > 0) return `${hours}H ${mins % 60}M AGO`;
  return `${mins}M AGO`;
}

class LcarsCameraPanel extends LcarsBasePanel {

  get panelType() { return 'camera'; }
  get defaultPanelTitle() { return 'Camera'; }
  get frameColor() { return 'var(--lcars-butterscotch)'; }

  static get styles() {
    return [...super.styles, sharedKeyframes, sharedReducedMotion, cameraPanelStyles];
  }

  static get properties() {
    return {
      ...super.properties,
      _disclosureOpen: { type: Boolean },
    };
  }

  constructor() {
    super();
    this._disclosureOpen = false;
  }

  renderContent() {
    const { cameras, sensors, controls } = this._partitionDeviceEntities(this.group.entities);
    const deviceName = this._shortDeviceName(this.group.device);

    // P3 DATA-007 / GEORDI-013 / WESLEY-IDEA-011: tier sensors into hero/operational/diagnostic
    const { hero, operational, diagnostic } = tierEntities(sensors, isCameraHero);
    const hiddenCount = operational.length + diagnostic.length;

    // P3 DATA-014 / WESLEY-UX-001: detect adopt-device / long-unavailable cameras
    const primaryCam = cameras[0];
    const primaryOff = primaryCam && this._isOff(primaryCam.state);
    const lastSignal = primaryCam ? formatTimeSince(primaryCam.state?.last_changed) : '';
    const allSiblingsDown = this.group.entities.every(e =>
      e.state?.state === 'unavailable' || e.state?.state === 'unknown'
    );
    const showConfigCta = primaryOff && allSiblingsDown;
    const platform = primaryCam?.entity?.platform || '';
    const deviceId = this.group.device?.id || '';

    return html`
      <div class="camera-content">
        <div class="device-panel-sensors" role="list" aria-label="${deviceName} sensors">
          ${hero.map(({ entity, state }) => {
            const name = this._friendlyName(state, entity);
            const { text } = formatStateValue(state, entity?.entity_category || '');
            const color = this._getSensorIndicatorColor(state);
            return html`
              <lcars-sensor-row
                label="${name}"
                value="${text}"
                color="${color}"
                entity-id="${entity.entity_id}">
              </lcars-sensor-row>
            `;
          })}
          ${hiddenCount > 0 ? html`
            <button class="camera-disclosure-btn"
              aria-expanded="${this._disclosureOpen}"
              aria-controls="cam-disclosure-${deviceId}"
              @click=${() => { this._disclosureOpen = !this._disclosureOpen; }}
              @keydown=${(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._disclosureOpen = !this._disclosureOpen; } }}>
              <span class="disclosure-triangle" ?data-open=${this._disclosureOpen}>▸</span>
              <span>${hiddenCount} ${diagnostic.length > 0 && operational.length === 0 ? 'DIAGNOSTIC' : 'MORE'}</span>
            </button>
            <div id="cam-disclosure-${deviceId}"
              class="camera-disclosure-content"
              ?data-open=${this._disclosureOpen}>
              ${operational.map(({ entity, state }) => {
                const name = this._friendlyName(state, entity);
                const { text } = formatStateValue(state, entity?.entity_category || '');
                return html`
                  <lcars-sensor-row
                    label="${name}"
                    value="${text}"
                    color="var(--lcars-gray)"
                    entity-id="${entity.entity_id}">
                  </lcars-sensor-row>
                `;
              })}
              ${diagnostic.length > 0 && operational.length > 0 ? html`
                <div class="camera-diag-divider">DIAGNOSTICS</div>
              ` : ''}
              ${diagnostic.map(({ entity, state }) => {
                const name = this._friendlyName(state, entity);
                const { text } = formatStateValue(state, entity?.entity_category || '');
                return html`
                  <lcars-sensor-row
                    label="${name}"
                    value="${text}"
                    color="var(--lcars-gray)"
                    entity-id="${entity.entity_id}">
                  </lcars-sensor-row>
                `;
              })}
            </div>
          ` : ''}
        </div>

        <div class="device-panel-media"
          ?data-offline=${primaryOff}>
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
                  ${lastSignal ? html`<span class="camera-last-signal">LAST SIGNAL: ${lastSignal}</span>` : ''}
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
          ${showConfigCta ? html`
            <button class="device-control-btn camera-config-cta"
              @click=${() => { history.pushState(null, '', `/config/devices/device/${deviceId}`); window.dispatchEvent(new Event('location-changed')); }}
              aria-label="Configure in ${humanizePlatform(platform)}">
              <ha-icon icon="mdi:cog"></ha-icon>
              <span>${platform ? `CONFIGURE IN ${humanizePlatform(platform).toUpperCase()}` : 'DEVICE REQUIRES SETUP'}</span>
            </button>
          ` : ''}
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
                title="${name}: ${state.state}"
                aria-label="${name}: ${state.state}">
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
