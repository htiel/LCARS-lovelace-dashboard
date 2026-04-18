/**
 * lcars-base-panel.js
 *
 * Abstract base class for all extracted LCARS device panels.
 * Provides shared methods that every panel needs: entity resolution,
 * service calls, sensor indicator colors, name shortening, etc.
 *
 * Panel subclasses extend this and implement their own render() and styles.
 * Imported as a side-effect — no webpack entry point needed.
 *
 * Phase 0 — v4.17.0 Panel Extraction Architecture (4X-4)
 */
import { LitElement, html, css } from 'lit-element';
import { getHass, showMoreInfo, lcarsLog } from './lcars-helpers.js';
import { getStateColor, getCo2Color } from './lcars-color-utils.js';
import { createRateLimiter } from './lcars-service-utils.js';
import { SENSOR_DOMAINS, TOGGLE_DOMAINS, CAMERA_DOMAINS } from './lcars-entity-utils.js';
import './components/lcars-panel-frame/lcars-panel-frame.js';
import './components/lcars-sensor-row/lcars-sensor-row.js';
import './components/lcars-section-divider/lcars-section-divider.js';

const ENTITY_ID_RE = /^[a-z_]+\.[a-z0-9_]+$/;

export class LcarsBasePanel extends LitElement {

  static get properties() {
    return {
      group:           { type: Object },
      hass:            { type: Object },
      config:          { type: Object },
      editMode:        { type: Boolean, attribute: 'edit-mode', reflect: true },
      areaId:          { type: String, attribute: 'area-id' },
      linkedEntities:  { type: Array },
      entities:        { type: Array },     // 4X-15: direct entity collection (cross-device panels)
      devices:         { type: Array },     // 4X-15: plural device list
      frameMode:       { type: String, attribute: 'frame-mode' },  // 4X-19: standard|nested|header-only
    };
  }

  constructor() {
    super();
    this.group = null;
    this.hass = null;
    this.config = null;
    this.editMode = false;
    this.areaId = null;
    this.linkedEntities = [];
    this.entities = null;
    this.devices = null;
    this.frameMode = 'standard';
  }

  /* ─── Entity helpers ─── */

  _getEntityState(entityId) {
    if (!this.hass || !this.hass.states[entityId]) return null;
    return this.hass.states[entityId];
  }

  _isValidEntityId(entityId) {
    return typeof entityId === 'string' && ENTITY_ID_RE.test(entityId);
  }

  _callService(domain, service, data) {
    if (!this.hass) {
      lcarsLog.warn('BasePanel', '_callService: no hass instance');
      return;
    }
    const entityId = data?.entity_id;
    if (entityId && !this._isValidEntityId(entityId)) {
      lcarsLog.warn('BasePanel', `_callService: invalid entity_id "${entityId}"`);
      return;
    }
    return this.hass.callService(domain, service, data);
  }

  _handleEntityClick(entityId) {
    showMoreInfo(entityId);
  }

  /* ─── Sensor indicator color (Data must-fix: centralized in base) ─── */

  _getSensorIndicatorColor(state) {
    const dc = state?.attributes?.device_class || '';
    if (dc === 'carbon_dioxide') {
      return getCo2Color(state?.state);
    }
    return getStateColor(state?.entity_id || '', state);
  }

  /* ─── Device category entities (Data must-fix: battery/diagnostic) ─── */

  _getDeviceCategoryEntities(deviceId) {
    if (!this.hass || !deviceId) return { config: [], diagnostic: [] };
    const entities = Object.values(this.hass.entities || {});
    const config = [];
    const diagnostic = [];
    for (const e of entities) {
      if (e.device_id !== deviceId) continue;
      if (e.disabled_by) continue;
      if (e.hidden_by === 'user' || e.hidden) continue;
      if (e.entity_category === 'config') config.push(e);
      else if (e.entity_category === 'diagnostic') diagnostic.push(e);
    }
    return { config, diagnostic };
  }

  /* ─── Name shortening ─── */

  _shortenName(fullName, entity) {
    if (!fullName) return fullName;
    const prefixes = [];
    const area = this.hass?.areas?.[this.areaId];
    if (area?.name) prefixes.push(area.name);
    if (entity?.device_id) {
      const dev = this.hass?.devices?.[entity.device_id];
      const dn = dev?.name_by_user || dev?.name;
      if (dn) prefixes.push(dn);
    }
    prefixes.sort((a, b) => b.length - a.length);
    let result = fullName;
    let changed = true;
    while (changed) {
      changed = false;
      for (const p of prefixes) {
        if (result.toLowerCase().startsWith(p.toLowerCase())) {
          result = result.slice(p.length).trim().replace(/^[-–:]\s*/, '');
          changed = true;
        }
      }
    }
    return result || fullName;
  }

  _friendlyName(state, entity) {
    const raw = state?.attributes?.friendly_name
      || entity.entity_id.split('.').pop().replace(/_/g, ' ');
    return this._shortenName(raw, entity);
  }

  _shortDeviceName(device) {
    const raw = device?.name_by_user || device?.name || '';
    if (!raw) return 'Device';
    const area = this.hass?.areas?.[this.areaId];
    if (!area?.name) return raw;
    if (raw.toLowerCase().startsWith(area.name.toLowerCase())) {
      const stripped = raw.slice(area.name.length).trim().replace(/^[-–:]\s*/, '');
      return stripped || raw;
    }
    return raw;
  }

  _isOff(state) {
    return ['off', 'unavailable', 'unknown', 'idle', 'standby', 'locked'].includes(state?.state);
  }

  /* ─── Panel code generator (deterministic 6-digit hash) ─── */

  _generatePanelCode(entityId) {
    let h = 5381;
    for (let i = 0; i < entityId.length; i++) {
      h = ((h << 5) + h + entityId.charCodeAt(i)) | 0;
    }
    const code = String(Math.abs(h) % 1000000).padStart(6, '0');
    return `${code.slice(0, 3)}-${code.slice(3)}`;
  }

  /* ─── Toggle helper ─── */

  _handleToggle(entityId) {
    const domain = entityId.split('.')[0];
    if (domain === 'lock') {
      const state = this._getEntityState(entityId);
      this._callService('lock', state?.state === 'locked' ? 'unlock' : 'lock', { entity_id: entityId });
    } else if (domain === 'script') {
      this._callService('script', 'turn_on', { entity_id: entityId });
    } else {
      this._callService('homeassistant', 'toggle', { entity_id: entityId });
    }
  }

  /* ─── Entity icon resolver ─── */

  _getEntityIcon(state) {
    if (!state) return 'mdi:help-circle-outline';
    if (state.attributes?.icon) return state.attributes.icon;
    const domain = state.entity_id.split('.')[0];
    const iconMap = {
      light: 'mdi:lightbulb', switch: 'mdi:toggle-switch', sensor: 'mdi:eye',
      binary_sensor: 'mdi:radiobox-blank', climate: 'mdi:thermostat',
      cover: 'mdi:window-shutter', fan: 'mdi:fan', lock: 'mdi:lock',
      camera: 'mdi:video', media_player: 'mdi:cast', automation: 'mdi:robot',
      script: 'mdi:script-text', update: 'mdi:package-up',
    };
    return iconMap[domain] || 'mdi:information-outline';
  }

  /* ─── Single-pass entity partition (camera / sensor / control) ─── */

  _partitionDeviceEntities(entries) {
    const cameras = [];
    const sensors = [];
    const controls = [];
    for (const entry of entries) {
      if (CAMERA_DOMAINS.has(entry.domain)) cameras.push(entry);
      else if (SENSOR_DOMAINS.has(entry.domain)) sensors.push(entry);
      else controls.push(entry);
    }
    return { cameras, sensors, controls };
  }

  /* ─── Panel identity getters (override in subclass) ─── */

  /**
   * Merge group entities with linked external entities.
   * When this.entities is set directly (4X-15), use that instead of group.
   * Linked entries carry `_linked: true` for provenance display.
   */
  _getAllEntities() {
    const own = this.entities || this.group?.entities || [];
    if (!this.linkedEntities?.length) return own;
    const linked = this.linkedEntities.map(e => ({ ...e, _linked: true }));
    return [...own, ...linked];
  }

  /** Panel type identifier — used for data attributes and frame theming */
  get panelType() { return 'unknown'; }

  /** Default panel title — used when device name is unavailable */
  get defaultPanelTitle() { return 'PANEL'; }

  /** Frame color — CSS custom property value */
  get frameColor() { return 'var(--lcars-butterscotch)'; }

  /** Computed panel name — device name with area prefix stripped (4X-15 fallback) */
  _getPanelName() {
    if (this.group?.device) return this._shortDeviceName(this.group.device) || this.defaultPanelTitle;
    if (this.devices?.length) return this._shortDeviceName(this.devices[0]) || this.defaultPanelTitle;
    return this.defaultPanelTitle;
  }

  /** Computed panel code — deterministic 6-digit hash (4X-15 fallback) */
  _getPanelCode() {
    const id = this.entities?.[0]?.entity?.entity_id
      || this.group?.entities?.[0]?.entity?.entity_id
      || this.group?.device?.id
      || this.areaId
      || 'panel';
    return this._generatePanelCode(id);
  }

  /* ─── Styles (base provides :host display — subclasses spread with ...super.styles) ─── */

  static get styles() { return [css`:host { display: block; }`]; }

  /* ─── Render lifecycle (spec §5.2 — base wraps in <lcars-panel-frame>) ─── */

  /** Override in subclass: render panel-specific header badge */
  renderBadge() { return html``; }

  /** Override in subclass: render panel-specific content */
  renderContent() { return html``; }

  /**
   * Base class render() wraps subclass content in <lcars-panel-frame>.
   * Subclasses override renderContent() and renderBadge() — never render().
   * This resolves the double-framing concern (Data N8): ONE framing path.
   *
   * 4X-15: Support panels without group (entities-only mode).
   * 4X-19: frame-mode attribute controls frame chrome level.
   */
  render() {
    if (!this.group && !this.entities?.length) return html``;
    return html`
      <lcars-panel-frame
        panel-name="${this._getPanelName()}"
        panel-code="${this._getPanelCode()}"
        frame-color="${this.frameColor}"
        panel-type="${this.panelType}"
        frame-mode="${this.frameMode}">
        <span slot="badge">${this.renderBadge()}</span>
        ${this.renderContent()}
      </lcars-panel-frame>
    `;
  }
}
