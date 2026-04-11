/**
 * LCARS Homepage Card — Main dashboard view with areas
 * Entities grouped by device → domain type with specialized renderers:
 *   camera → LCARS-framed live feed
 *   light/switch/fan/lock → LCARS toggle pill
 *   sensor/binary_sensor → data readout bar
 *   climate → thermostat panel
 *   cover → position controls
 *   media_player → media strip
 *   default → LCARS button
 */
import { LitElement, html, css } from 'lit-element';
import { lcarsBaseStyles } from './lcars-styles.js';
import { getHass, showMoreInfo, fireEvent, createCardElement, lcarsEventBus, lcarsLog } from './lcars-helpers.js';

const TAG = 'Homepage';

/* Domain rendering categories */
const TOGGLE_DOMAINS = new Set(['light', 'switch', 'fan', 'input_boolean', 'lock', 'automation', 'script']);
const SENSOR_DOMAINS = new Set(['sensor', 'binary_sensor']);
const CAMERA_DOMAINS = new Set(['camera']);
const CLIMATE_DOMAINS = new Set(['climate']);
const COVER_DOMAINS = new Set(['cover']);
const MEDIA_DOMAINS = new Set(['media_player']);

/* Display-friendly domain labels */
const DOMAIN_LABELS = {
  light: 'Lights', switch: 'Switches', fan: 'Fans', lock: 'Locks',
  input_boolean: 'Toggles', automation: 'Automations', script: 'Scripts',
  sensor: 'Sensors', binary_sensor: 'Binary Sensors',
  camera: 'Cameras', climate: 'Climate', cover: 'Covers',
  media_player: 'Media', button: 'Buttons', number: 'Numbers',
  select: 'Selects', input_number: 'Inputs', input_select: 'Selectors',
  input_text: 'Text Inputs', input_button: 'Buttons',
  input_datetime: 'Date/Time', scene: 'Scenes',
  device_tracker: 'Trackers', person: 'People',
  update: 'Updates', event: 'Events', conversation: 'Conversation',
};

/* Device panel type constants */
const PANEL_TYPE_CAMERA = 'camera';
// Future: PANEL_TYPE_CLIMATE = 'climate', PANEL_TYPE_MEDIA = 'media'

/* Domain sort priority (lower = shown first) */
const DOMAIN_ORDER = {
  camera: 0, light: 1, switch: 2, climate: 3, cover: 4,
  media_player: 5, fan: 6, lock: 7, sensor: 8, binary_sensor: 9,
};

/* Build a cache-busted camera image URL using last_updated timestamp */
function cameraImageUrl(state) {
  const base = state?.attributes?.entity_picture;
  if (!base) return '';
  const ts = state.last_updated || state.last_changed || '';
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}_cb=${encodeURIComponent(ts)}`;
}

class LcarsHomepageCard extends LitElement {
  static get properties() {
    return {
      data: { type: Object },
      selectedArea: { type: String },
      _hass: { type: Object },
      _cards: { type: Object },
    };
    }

    constructor() {
      super();
      this.data = null;
      this.selectedArea = null;
      this._cards = {};
      this._cachedEntities = null;
      this._cachedAreaId = null;
      /* Camera auto-refresh state */
      this._cameraRefreshInterval = null;
      this._cameraObserver = null;
      this._visibleCameras = new Set();
      this._loadingCameras = new Set();
      this._onAreaSelected = (e) => {
        lcarsLog.debug(TAG, 'Area selected event:', e.detail.areaId);
        this.selectedArea = e.detail.areaId;
        this._cachedEntities = null; // bust cache on area change
      };
    }

    connectedCallback() {
      super.connectedCallback();
      lcarsEventBus.addEventListener('lcars-area-selected', this._onAreaSelected);
      this._startCameraRefresh();
      document.addEventListener('visibilitychange', this._onVisibilityChange);
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      lcarsEventBus.removeEventListener('lcars-area-selected', this._onAreaSelected);
      this._stopCameraRefresh();
      document.removeEventListener('visibilitychange', this._onVisibilityChange);
    }

    /* ─── Camera auto-refresh: pause/resume on tab visibility ─── */
    _onVisibilityChange = () => {
      if (document.hidden) {
        this._stopCameraTimer();
      } else {
        this._startCameraTimer();
        this._refreshVisibleCameras();
      }
    };

    _startCameraRefresh() {
      this._cameraObserver = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const entityId = entry.target.dataset.entity;
            if (!entityId) continue;
            if (entry.isIntersecting) {
              this._visibleCameras.add(entityId);
            } else {
              this._visibleCameras.delete(entityId);
            }
          }
        },
        { rootMargin: '50px' }
      );
      this._startCameraTimer();
    }

    _startCameraTimer() {
      if (this._cameraRefreshInterval) return;
      this._cameraRefreshInterval = setInterval(() => {
        this._refreshVisibleCameras();
      }, 10000);
    }

    _stopCameraTimer() {
      if (this._cameraRefreshInterval) {
        clearInterval(this._cameraRefreshInterval);
        this._cameraRefreshInterval = null;
      }
    }

    _stopCameraRefresh() {
      this._stopCameraTimer();
      if (this._cameraObserver) {
        this._cameraObserver.disconnect();
        this._cameraObserver = null;
      }
      this._visibleCameras.clear();
      this._loadingCameras.clear();
    }

    _refreshVisibleCameras() {
      if (document.hidden || !this._hass) return;
      const now = Date.now();
      for (const entityId of this._visibleCameras) {
        if (this._loadingCameras.has(entityId)) continue;
        const state = this._hass.states[entityId];
        if (!state || state.state === 'unavailable') continue;
        const base = state.attributes?.entity_picture;
        if (!base) continue;
        const img = this.shadowRoot?.querySelector(`img[data-entity="${CSS.escape(entityId)}"]`);
        if (!img) continue;
        const sep = base.includes('?') ? '&' : '?';
        const newUrl = `${base}${sep}_cb=${now}`;
        this._loadingCameras.add(entityId);
        img.addEventListener('load', () => this._loadingCameras.delete(entityId), { once: true });
        img.addEventListener('error', () => this._loadingCameras.delete(entityId), { once: true });
        img.src = newUrl;
      }
    }

    updated(changedProps) {
      super.updated(changedProps);
      if (this._cameraObserver) {
        const imgs = this.shadowRoot?.querySelectorAll('img[data-entity]') || [];
        const currentEntities = new Set();
        for (const img of imgs) {
          currentEntities.add(img.dataset.entity);
          this._cameraObserver.observe(img);
        }
        for (const entityId of this._visibleCameras) {
          if (!currentEntities.has(entityId)) {
            this._visibleCameras.delete(entityId);
            this._loadingCameras.delete(entityId);
          }
        }
      }
    }

    setConfig(config) {
      this._config = config;
    }

    set hass(hass) {
      const prev = this._hass;
      this._hass = hass;
      // Bust entity cache when registries change
      if (prev && (prev.entities !== hass.entities || prev.devices !== hass.devices)) {
        this._cachedEntities = null;
      }
      // Deselect area if it was removed from HA
      if (prev && prev.areas !== hass.areas && this.selectedArea) {
        if (!hass.areas?.[this.selectedArea]) {
          this.selectedArea = null;
          this._cachedEntities = null;
        }
      }
      if (this._cards) {
        Object.values(this._cards).forEach((card) => {
          if (card && card.hass !== undefined) card.hass = hass;
        });
      }
      if (!this.data) this._loadConfiguration();
    }

    async _loadConfiguration() {
      if (!this._hass) return;
      lcarsLog.debug(TAG, 'Loading configuration via WS...');
      try {
        const result = await this._hass.callWS({
          type: 'lcars_dashboard/configuration/get',
        });
        this.data = result;
        lcarsLog.debug(TAG, 'Configuration loaded:', Object.keys(result));
      } catch (e) {
        lcarsLog.error(TAG, 'Failed to load configuration', e);
        // Set empty data so we don't retry endlessly — card still works dynamically from hass
        this.data = {};
      }
    }

    _handleEntityClick(entityId) {
      showMoreInfo(entityId);
    }

    /* ─── Toggle a light/switch/fan/etc ─── */
    _handleToggle(entityId) {
      const domain = entityId.split('.')[0];
      if (domain === 'lock') {
        const state = this._getEntityState(entityId);
        this._hass.callService('lock', state?.state === 'locked' ? 'unlock' : 'lock', { entity_id: entityId });
      } else if (domain === 'script') {
        this._hass.callService('script', 'turn_on', { entity_id: entityId });
      } else {
        this._hass.callService('homeassistant', 'toggle', { entity_id: entityId });
      }
    }

    /* ─── Entity resolution: direct area_id OR via device (cached) ─── */
    _getAreaEntities(areaId) {
      if (!this._hass) return [];
      // Return cached result if area and registry haven't changed
      if (this._cachedEntities && this._cachedAreaId === areaId) {
        lcarsLog.debug(TAG, 'Entity cache HIT for area:', areaId, this._cachedEntities.length, 'entities');
        return this._cachedEntities;
      }
      lcarsLog.debug(TAG, 'Entity cache MISS — resolving area:', areaId);
      const entityReg = Object.values(this._hass.entities || {});
      const deviceReg = this._hass.devices || {};
      const areaDeviceIds = new Set();
      Object.values(deviceReg).forEach((dev) => {
        if (dev.area_id === areaId) areaDeviceIds.add(dev.id);
      });
      const result = entityReg.filter((e) => {
        if (e.hidden_by || e.disabled_by) return false;
        if (e.entity_category) return false;
        if (e.area_id === areaId) return true;
        if (!e.area_id && e.device_id && areaDeviceIds.has(e.device_id)) return true;
        return false;
      });
      this._cachedEntities = result;
      this._cachedAreaId = areaId;
      lcarsLog.debug(TAG, 'Resolved', result.length, 'entities for area:', areaId);
      return result;
    }

    /* ─── Group entities: device → domain ─── */
    _groupEntities(entities) {
      const devices = this._hass.devices || {};
      const byDevice = new Map();     // deviceId → { device, entities[] }
      const noDevice = [];             // entities with no device

      entities.forEach((e) => {
        const domain = e.entity_id.split('.')[0];
        const entry = { entity: e, domain, state: this._getEntityState(e.entity_id) };
        if (!entry.state) return;
        if (e.device_id && devices[e.device_id]) {
          if (!byDevice.has(e.device_id)) {
            byDevice.set(e.device_id, { device: devices[e.device_id], entities: [] });
          }
          byDevice.get(e.device_id).entities.push(entry);
        } else {
          noDevice.push(entry);
        }
      });

      // Within each device, sort entities by domain priority then name
      const sortFn = (a, b) => {
        const pa = DOMAIN_ORDER[a.domain] ?? 50;
        const pb = DOMAIN_ORDER[b.domain] ?? 50;
        if (pa !== pb) return pa - pb;
        return (a.state?.attributes?.friendly_name || '').localeCompare(
          b.state?.attributes?.friendly_name || ''
        );
      };

      byDevice.forEach((v) => v.entities.sort(sortFn));
      noDevice.sort(sortFn);

      return { byDevice, noDevice };
    }

    /* ─── Group entries by domain ─── */
    _groupByDomain(entries) {
      const groups = new Map();
      entries.forEach((entry) => {
        if (!groups.has(entry.domain)) groups.set(entry.domain, []);
        groups.get(entry.domain).push(entry);
      });
      // Sort domain groups by priority
      return [...groups.entries()].sort(
        (a, b) => (DOMAIN_ORDER[a[0]] ?? 50) - (DOMAIN_ORDER[b[0]] ?? 50)
      );
    }

    _getEntityState(entityId) {
      if (!this._hass || !this._hass.states[entityId]) return null;
      return this._hass.states[entityId];
    }

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

    _friendlyName(state, entity) {
      return state?.attributes?.friendly_name
        || entity.entity_id.split('.').pop().replace(/_/g, ' ');
    }

    _isOff(state) {
      return ['off', 'unavailable', 'unknown', 'idle', 'standby', 'locked'].includes(state?.state);
    }

    /* ─── Segmented sensor bar for numeric values ─── */
    _renderSensorBar(state) {
      const val = parseFloat(state.state);
      if (isNaN(val)) return '';
      const deviceClass = state.attributes?.device_class || '';
      let min = 0, max = 100;
      if (deviceClass === 'temperature') { min = 10; max = 40; }
      else if (deviceClass === 'humidity') { min = 0; max = 100; }
      else if (deviceClass === 'battery') { min = 0; max = 100; }
      else if (deviceClass === 'illuminance') { min = 0; max = 1000; }
      else if (deviceClass === 'power') { min = 0; max = 3000; }
      else if (state.attributes?.min != null) {
        min = state.attributes.min; max = state.attributes.max;
      }
      else return '';
      const pct = Math.max(0, Math.min(100, ((val - min) / (max - min)) * 100));
      const segments = 10;
      const filled = Math.round((pct / 100) * segments);
      return html`
        <div class="sensor-bar" title="${Math.round(pct)}%">
          ${Array.from({ length: segments }, (_, i) => html`
            <div class="sensor-seg ${i < filled ? 'filled' : ''}"
                 style="--seg-i:${i}"></div>
          `)}
        </div>
      `;
    }

    /* ──────────── STYLES ──────────── */
    static get styles() {
      return [
        lcarsBaseStyles,
        css`
          :host { display: block; }

          /* ─── Content Area Header (Geordi: gold = active area) ─── */
          .content-area-panel {
            animation: lcars-cascade-in 300ms ease-out both;
            padding-left: 1rem;
          }
          .content-area-header {
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-title);
            color: var(--lcars-gold);
            text-transform: uppercase;
            padding: 0.25rem 0 0.5rem 0;
            border-left: 3px solid var(--lcars-gold);
            padding-left: 1rem;
          }
          .content-area-header::after {
            content: '';
            display: block;
            height: 2px;
            background: var(--lcars-data-accent);
            margin-top: 0.5rem;
          }

          /* ─── Divider ─── */
          .lcars-divider {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 0;
          }
          .lcars-divider-label {
            font-size: var(--lcars-font-size-sub);
            color: var(--lcars-text-heading);
            white-space: nowrap;
          }
          .lcars-divider-line {
            flex: 1;
            height: 2px;
            background: var(--lcars-data-accent);
          }

          /* ─── Device Group ─── */
          .device-group {
            margin-bottom: 0.75rem;
            position: relative;
            padding-left: 1rem;
            border-left: 3px solid var(--lcars-gold);
            border-image: linear-gradient(to bottom, var(--lcars-gold) 70%, transparent) 1;
          }
          .device-group::before {
            content: '';
            position: absolute;
            top: 0; left: -3px;
            width: 1rem;
            height: 1.5rem;
            border-top: 3px solid var(--lcars-gold);
            border-left: none;
            border-top-left-radius: 0;
          }
          .device-header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.25rem 0;
            margin-bottom: 0.25rem;
          }
          .device-name {
            font-size: var(--lcars-font-size-data);
            color: var(--lcars-gold);
            text-transform: uppercase;
            white-space: nowrap;
          }
          .device-line {
            flex: 1;
            height: 1px;
            background: var(--lcars-gold);
            opacity: 0.4;
          }

          /* ─── Domain Sub-header ─── */
          .domain-label {
            font-size: 0.7rem;
            color: var(--lcars-african-violet);
            text-transform: uppercase;
            padding: 0.375rem 0 0.125rem 0.25rem;
            letter-spacing: 0.05em;
          }

          /* ─── Entity Grid (default) ─── */
          .entity-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
            gap: var(--lcars-gap);
            padding: 0.25rem 0;
          }

          /* ─── Generic Entity Button (fallback) ─── */
          .entity-btn {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            height: 2.5rem;
            padding: 0 0.75rem;
            background: var(--lcars-ice);
            color: var(--lcars-black);
            border: none;
            border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            text-transform: uppercase;
            cursor: pointer;
            transition: filter var(--lcars-transition);
            white-space: nowrap;
            overflow: hidden;
            user-select: none;
          }
          .entity-btn:hover { filter: brightness(1.2); }
          .entity-btn:focus-visible {
            outline: 2px solid var(--lcars-ice);
            outline-offset: 2px;
          }
          .entity-btn:active { background: var(--lcars-btn-active); }
          .entity-btn ha-icon { --mdc-icon-size: 16px; flex-shrink: 0; }
          .entity-btn .entity-name { overflow: hidden; text-overflow: ellipsis; flex: 1; }
          .entity-btn .entity-state { font-size: 0.75rem; opacity: 0.7; flex-shrink: 0; }
          .entity-btn[data-off] { background: var(--lcars-gray); color: var(--lcars-space-white); }

          /* ═══════ TOGGLE PILL (light / switch / fan / lock) ═══════ */
          .toggle-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
            gap: var(--lcars-gap);
            padding: 0.25rem 0;
          }
          .toggle-pill {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            height: var(--lcars-btn-height);
            padding: 0 0.25rem 0 0.75rem;
            background: var(--lcars-gold);
            color: var(--lcars-black);
            border: none;
            border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            text-transform: uppercase;
            cursor: pointer;
            transition: background var(--lcars-transition), filter var(--lcars-transition);
            overflow: hidden;
            user-select: none;
          }
          .toggle-pill:hover { filter: brightness(1.15); }
          .toggle-pill:focus-visible {
            outline: 2px solid var(--lcars-ice);
            outline-offset: 2px;
          }
          .toggle-pill ha-icon { --mdc-icon-size: 20px; flex-shrink: 0; }
          .toggle-pill .toggle-name { overflow: hidden; text-overflow: ellipsis; flex: 1; }
          .toggle-pill .toggle-state {
            font-size: 0.7rem;
            padding: 0.25rem 0.5rem;
            border-radius: var(--lcars-btn-radius);
            background: rgba(0,0,0,0.15);
            white-space: nowrap;
          }
          .toggle-pill .toggle-switch {
            width: 2.5rem;
            height: 1.5rem;
            border-radius: 0.75rem;
            background: var(--lcars-black);
            position: relative;
            flex-shrink: 0;
            transition: background var(--lcars-transition);
            border: 2px solid transparent;
          }
          .toggle-pill .toggle-switch::after {
            content: '';
            position: absolute;
            top: 2px; left: 2px;
            width: calc(1.5rem - 8px);
            height: calc(1.5rem - 8px);
            border-radius: 50%;
            background: var(--lcars-gray);
            transition: transform var(--lcars-transition), background var(--lcars-transition);
          }
          .toggle-pill[data-on] { background: var(--lcars-gold); }
          .toggle-pill[data-on] .toggle-switch { background: var(--lcars-black); }
          .toggle-pill[data-on] .toggle-switch::after {
            transform: translateX(1rem);
            background: var(--lcars-gold);
          }
          .toggle-pill[data-off] {
            background: var(--lcars-gray);
            color: var(--lcars-space-white);
          }
          .toggle-pill[data-off] .toggle-switch::after { background: var(--lcars-gray); }
          /* Light brightness bar */
          .toggle-pill .brightness-bar {
            width: 3rem;
            height: 0.375rem;
            background: rgba(0,0,0,0.3);
            border-radius: 0.2rem;
            overflow: hidden;
            flex-shrink: 0;
          }
          .toggle-pill .brightness-fill {
            height: 100%;
            background: var(--lcars-sunflower);
            border-radius: 0.2rem;
            transition: width var(--lcars-transition);
          }

          /* ═══════ SENSOR DATA READOUT ═══════ */
          .sensor-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
            gap: var(--lcars-gap);
            padding: 0.25rem 0;
          }
          .sensor-readout {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            height: 2.25rem;
            padding: 0 0.75rem;
            background: var(--lcars-ice);
            color: var(--lcars-black);
            border: none;
            border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            text-transform: uppercase;
            cursor: pointer;
            overflow: hidden;
            transition: filter var(--lcars-transition);
          }
          .sensor-readout:hover { filter: brightness(1.1); }
          .sensor-readout:focus-visible {
            outline: 2px solid var(--lcars-ice);
            outline-offset: 2px;
          }
          .sensor-readout ha-icon { --mdc-icon-size: 14px; flex-shrink: 0; }
          .sensor-readout .sensor-name { overflow: hidden; text-overflow: ellipsis; flex: 1; font-size: 0.75rem; }
          .sensor-readout .sensor-value {
            font-size: var(--lcars-font-size-data);
            font-weight: 700;
            color: var(--lcars-black);
            flex-shrink: 0;
          }
          .sensor-readout .sensor-unit {
            font-size: 0.65rem;
            opacity: 0.6;
            flex-shrink: 0;
          }
          .sensor-readout[data-warn] { background: var(--lcars-tomato); color: var(--lcars-space-white); }
          .sensor-readout[data-warn] .sensor-value { color: var(--lcars-space-white); }
          .sensor-readout[data-off] { background: var(--lcars-gray); color: var(--lcars-space-white); }
          .sensor-readout[data-off] .sensor-value { color: var(--lcars-space-white); }

          /* ═══════ CAMERA FEED ═══════ */
          .camera-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));
            gap: var(--lcars-gap);
            padding: 0.25rem 0;
          }
          .camera-frame {
            position: relative;
            border: 3px solid var(--lcars-butterscotch);
            border-radius: 0.75rem;
            overflow: hidden;
            background: var(--lcars-black);
            cursor: pointer;
            transition: border-color var(--lcars-transition);
          }
          .camera-frame:hover { border-color: var(--lcars-gold); }
          .camera-frame:focus-visible {
            outline: 2px solid var(--lcars-ice);
            outline-offset: 2px;
          }
          .camera-frame img {
            width: 100%;
            display: block;
            aspect-ratio: 16/9;
            object-fit: cover;
            background: #111;
          }
          .camera-label {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.375rem 0.75rem;
            background: linear-gradient(transparent, rgba(0,0,0,0.85));
            color: var(--lcars-sunflower);
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            text-transform: uppercase;
          }
          .camera-label ha-icon { --mdc-icon-size: 14px; }
          .camera-label .cam-state {
            margin-left: auto;
            font-size: 0.65rem;
            color: var(--lcars-space-white);
            opacity: 0.7;
          }
          .camera-frame[data-off] { border-color: var(--lcars-gray); opacity: 0.5; }

          /* ═══════ DEVICE PANEL (reusable frame for camera / climate / media) ═══════ */
          .device-panels-section {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: var(--lcars-gap);
            margin-bottom: 0.75rem;
          }

          /* ─── Two-column split: entities left, camera panels right ─── */
          .area-split-layout {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            align-items: start;
          }
          .area-split-main {
            min-width: 0;
          }
          .area-split-panels {
            display: flex;
            flex-direction: column;
            gap: var(--lcars-gap);
          }
          .area-split-panels .lcars-device-panel {
            max-width: none;
          }
          @media (max-width: 960px) {
            .area-split-layout {
              grid-template-columns: 1fr;
            }
          }
          .lcars-device-panel {
            --panel-frame-color: var(--lcars-butterscotch);
            --media-aspect: 16/9;
            display: grid;
            grid-template-columns: minmax(10rem, 14rem) minmax(18rem, 1fr);
            grid-template-rows: auto 1fr auto;
            grid-template-areas:
              "header  header"
              "sensors media"
              "controls controls";
            gap: var(--lcars-gap);
            width: 100%;
            max-width: 42rem;
            border-left: 4px solid var(--panel-frame-color);
            border-bottom: 4px solid var(--panel-frame-color);
            border-top: 2px solid var(--panel-frame-color);
            border-right: 2px solid var(--panel-frame-color);
            border-radius: 0.75rem 0.25rem 0.25rem 0.75rem;
            padding: var(--lcars-gap);
            background: var(--lcars-black);
            position: relative;
          }
          /* Corner bracket — top-left */
          .lcars-device-panel::before {
            content: '';
            position: absolute;
            top: -2px;
            left: -4px;
            width: 1.5rem;
            height: 1.5rem;
            border-top: 4px solid var(--panel-frame-color);
            border-left: 4px solid var(--panel-frame-color);
            border-radius: 0.75rem 0 0 0;
            pointer-events: none;
          }
          /* Corner bracket — bottom-right */
          .lcars-device-panel::after {
            content: '';
            position: absolute;
            bottom: -4px;
            right: -2px;
            width: 1.5rem;
            height: 1.5rem;
            border-bottom: 4px solid var(--panel-frame-color);
            border-right: 2px solid var(--panel-frame-color);
            border-radius: 0 0 0.25rem 0;
            pointer-events: none;
          }

          /* Panel header */
          .device-panel-header {
            grid-area: header;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.25rem 0.5rem;
          }
          .device-panel-name {
            font-size: var(--lcars-font-size-sub);
            color: var(--panel-frame-color);
            text-transform: uppercase;
            white-space: nowrap;
          }
          .device-panel-header-line {
            flex: 1;
            height: 2px;
            background: var(--panel-frame-color);
            opacity: 0.5;
          }

          /* Sensor telemetry readouts — left column */
          .device-panel-sensors {
            grid-area: sensors;
            display: flex;
            flex-direction: column;
            gap: var(--lcars-gap);
            overflow-y: auto;
            max-height: 20rem;
            padding: 0.25rem;
          }
          .device-sensor-line {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.25rem 0.5rem;
            cursor: pointer;
            border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
            transition: background var(--lcars-transition);
            font-size: var(--lcars-font-size-data);
            text-transform: uppercase;
          }
          .device-sensor-line:hover {
            background: rgba(255, 255, 255, 0.05);
          }
          .device-sensor-line:focus-visible {
            outline: 2px solid var(--lcars-ice);
            outline-offset: 2px;
          }
          .sensor-indicator {
            width: 0.5rem;
            height: 0.5rem;
            border-radius: 50%;
            flex-shrink: 0;
          }
          .sensor-label {
            flex: 1;
            color: var(--lcars-space-white);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-size: 0.75rem;
          }
          .sensor-state-value {
            flex-shrink: 0;
            font-weight: 700;
            font-size: var(--lcars-font-size-data);
          }

          /* Media viewscreen — right column */
          .device-panel-media {
            grid-area: media;
            position: relative;
            border: 3px solid var(--panel-frame-color);
            border-radius: 0.5rem;
            overflow: hidden;
            background: var(--lcars-black);
            aspect-ratio: var(--media-aspect);
          }
          .device-panel-media img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
          }
          .device-panel-media[data-offline] {
            border-color: var(--lcars-gray);
            opacity: 0.5;
          }

          /* Control buttons — bottom row */
          .device-panel-controls {
            grid-area: controls;
            display: flex;
            flex-wrap: wrap;
            gap: var(--lcars-gap);
            padding: 0.25rem 0;
          }
          .device-control-btn {
            display: flex;
            align-items: center;
            gap: 0.375rem;
            height: 2.25rem;
            padding: 0 0.75rem;
            background: var(--lcars-sunflower);
            color: var(--lcars-black);
            border: none;
            border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            text-transform: uppercase;
            cursor: pointer;
            transition: filter var(--lcars-transition), background var(--lcars-transition);
            white-space: nowrap;
          }
          .device-control-btn:hover { filter: brightness(1.15); }
          .device-control-btn:focus-visible {
            outline: 2px solid var(--lcars-ice);
            outline-offset: 2px;
          }
          .device-control-btn ha-icon { --mdc-icon-size: 16px; flex-shrink: 0; }
          .device-control-btn[data-on] { background: var(--lcars-gold); }
          .device-control-btn[data-off] { background: var(--lcars-gray); color: var(--lcars-space-white); }

          /* ═══════ CLIMATE PANEL ═══════ */
          .climate-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
            gap: var(--lcars-gap);
            padding: 0.25rem 0;
          }
          .climate-panel {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.5rem 0.75rem;
            background: var(--lcars-bluey);
            color: var(--lcars-black);
            border: none;
            border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
            font-family: var(--lcars-font);
            text-transform: uppercase;
            cursor: pointer;
            transition: filter var(--lcars-transition);
          }
          .climate-panel:hover { filter: brightness(1.1); }
          .climate-panel:focus-visible {
            outline: 2px solid var(--lcars-ice);
            outline-offset: 2px;
          }
          .climate-panel ha-icon { --mdc-icon-size: 24px; flex-shrink: 0; }
          .climate-panel .climate-info { flex: 1; display: flex; flex-direction: column; gap: 0.125rem; }
          .climate-panel .climate-name { font-size: var(--lcars-font-size-data); }
          .climate-panel .climate-temps { font-size: 0.75rem; display: flex; gap: 0.5rem; }
          .climate-panel .climate-current { font-weight: 700; font-size: 1.25rem; }
          .climate-panel .climate-target { opacity: 0.6; }
          .climate-panel .climate-mode {
            font-size: 0.65rem;
            padding: 0.125rem 0.5rem;
            background: rgba(0,0,0,0.15);
            border-radius: var(--lcars-btn-radius);
            flex-shrink: 0;
          }
          .climate-panel[data-heat] { background: var(--lcars-peach); }
          .climate-panel[data-cool] { background: var(--lcars-ice); }
          .climate-panel[data-off] { background: var(--lcars-gray); color: var(--lcars-space-white); }

          /* ═══════ COVER CONTROLS ═══════ */
          .cover-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
            gap: var(--lcars-gap);
            padding: 0.25rem 0;
          }
          .cover-panel {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            height: var(--lcars-btn-height);
            padding: 0 0.75rem;
            background: var(--lcars-almond-creme);
            color: var(--lcars-black);
            border: none;
            border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            text-transform: uppercase;
            cursor: pointer;
            transition: filter var(--lcars-transition);
          }
          .cover-panel:hover { filter: brightness(1.1); }
          .cover-panel:focus-visible {
            outline: 2px solid var(--lcars-ice);
            outline-offset: 2px;
          }
          .cover-panel ha-icon { --mdc-icon-size: 18px; flex-shrink: 0; }
          .cover-panel .cover-name { overflow: hidden; text-overflow: ellipsis; flex: 1; }
          .cover-panel .cover-position { font-size: 0.75rem; opacity: 0.7; flex-shrink: 0; }
          .cover-panel[data-off] { background: var(--lcars-gray); color: var(--lcars-space-white); }

          /* ═══════ MEDIA PLAYER ═══════ */
          .media-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));
            gap: var(--lcars-gap);
            padding: 0.25rem 0;
          }
          .media-strip {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            height: 3rem;
            padding: 0 0.75rem;
            background: var(--lcars-violet-creme);
            color: var(--lcars-black);
            border: none;
            border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            text-transform: uppercase;
            cursor: pointer;
            transition: filter var(--lcars-transition);
            overflow: hidden;
          }
          .media-strip:hover { filter: brightness(1.1); }
          .media-strip:focus-visible {
            outline: 2px solid var(--lcars-ice);
            outline-offset: 2px;
          }
          .media-strip ha-icon { --mdc-icon-size: 20px; flex-shrink: 0; }
          .media-strip .media-info { flex: 1; overflow: hidden; }
          .media-strip .media-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
          .media-strip .media-title { font-size: 0.7rem; opacity: 0.7; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
          .media-strip .media-state { font-size: 0.65rem; opacity: 0.5; flex-shrink: 0; }
          .media-strip[data-off] { background: var(--lcars-gray); color: var(--lcars-space-white); }

          /* ─── No data ─── */
          .lcars-empty {
            color: var(--lcars-gray);
            font-size: var(--lcars-font-size-sub);
            padding: 2rem 0;
            text-align: center;
          }

          /* ═══════ ANIMATIONS (Wesley Crusher specials) ═══════ */

          /* ── 1. Staggered Cascade Reveal ── */
          @keyframes lcars-cascade-in {
            0% {
              opacity: 0;
              transform: translateX(-1.5rem);
              clip-path: inset(0 100% 0 0);
            }
            100% {
              opacity: 1;
              transform: translateX(0);
              clip-path: inset(0 0 0 0);
            }
          }
          .content-area-panel .toggle-pill,
          .content-area-panel .sensor-readout,
          .content-area-panel .climate-panel,
          .content-area-panel .cover-panel,
          .content-area-panel .media-strip,
          .content-area-panel .camera-frame,
          .content-area-panel .entity-btn,
          .content-area-panel .lcars-device-panel {
            animation: lcars-cascade-in 300ms ease-out both;
            animation-delay: calc(var(--i, 0) * 40ms);
          }

          /* ── 2. Sensor Scan Sweep ── */
          @keyframes lcars-scan-sweep {
            0%   { transform: translateX(-100%); }
            100% { transform: translateX(300%); }
          }
          .sensor-readout {
            position: relative;
          }
          .sensor-readout::after {
            content: '';
            position: absolute;
            top: 0; left: 0;
            width: 30%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
            animation: lcars-scan-sweep 3s ease-in-out infinite;
            pointer-events: none;
          }
          .sensor-readout:nth-child(2n)::after { animation-delay: 0.8s; }
          .sensor-readout:nth-child(3n)::after { animation-delay: 1.6s; }
          .sensor-readout:nth-child(5n)::after { animation-delay: 2.4s; }
          .sensor-readout[data-off]::after { animation: none; }

          /* ── 3. Camera Viewscreen Activation ── */
          @keyframes viewscreen-activate {
            0%   { clip-path: inset(50% 0 50% 0); filter: brightness(2) saturate(0); }
            40%  { clip-path: inset(10% 0 10% 0); filter: brightness(1.5) saturate(0.3); }
            100% { clip-path: inset(0 0 0 0); filter: brightness(1) saturate(1); }
          }
          .camera-frame img {
            animation: viewscreen-activate 600ms ease-out both;
          }
          .camera-frame[data-off] img {
            filter: saturate(0) brightness(0.3);
            animation: none;
          }
          @keyframes frame-pulse {
            0%, 100% { border-color: var(--lcars-butterscotch); }
            50%      { border-color: var(--lcars-gold); }
          }
          .camera-frame:active { animation: frame-pulse 400ms ease-out; }

          /* ── 4. Heartbeat Pulse for Active Entities ── */
          @keyframes lcars-heartbeat {
            0%, 100% { filter: brightness(1); }
            50%      { filter: brightness(1.1); }
          }
          .toggle-pill[data-on] { animation: lcars-heartbeat 3s ease-in-out infinite; }
          .climate-panel[data-heat],
          .climate-panel[data-cool] { animation: lcars-heartbeat 3s ease-in-out infinite; }
          .media-strip:not([data-off]) { animation: lcars-heartbeat 2s ease-in-out infinite; }

          /* Unavailable distress pulse */
          @keyframes lcars-distress {
            0%, 100% { opacity: 1; }
            50%      { opacity: 0.5; }
          }
          .sensor-readout[data-off],
          .toggle-pill[data-off] { animation: lcars-distress 4s ease-in-out infinite; }

          /* ── Device Panel Viewscreen Activation ── */
          .device-panel-media img {
            animation: viewscreen-activate 600ms ease-out both;
          }
          .device-panel-media[data-offline] img {
            filter: saturate(0) brightness(0.3);
            animation: none;
          }
          /* Unavailable panel pulsing border */
          @keyframes panel-distress {
            0%, 100% { border-color: var(--panel-frame-color); }
            50%      { border-color: var(--lcars-tomato); }
          }
          .lcars-device-panel:has(.device-panel-media[data-offline]) {
            animation: panel-distress 3s ease-in-out infinite;
          }

          /* ── 5. Segmented Sensor Bar ── */
          .sensor-bar {
            display: flex;
            gap: 2px;
            align-items: center;
            height: 0.625rem;
            flex-shrink: 0;
            margin-left: 0.25rem;
          }
          .sensor-seg {
            width: 3px;
            background: rgba(0,0,0,0.2);
            border-radius: 1px;
            transition: background var(--lcars-transition), height var(--lcars-transition);
            height: 40%;
          }
          .sensor-seg.filled {
            background: var(--lcars-black);
            height: calc(40% + var(--seg-i, 0) * 6%);
          }
          .sensor-readout[data-warn] .sensor-seg.filled { background: var(--lcars-space-white); }

          @media (prefers-reduced-motion: reduce) {
            .content-area-panel { animation: none; }
            .content-area-panel .toggle-pill,
            .content-area-panel .sensor-readout,
            .content-area-panel .climate-panel,
            .content-area-panel .cover-panel,
            .content-area-panel .media-strip,
            .content-area-panel .camera-frame,
            .content-area-panel .entity-btn,
            .content-area-panel .lcars-device-panel { animation: none; }
            .sensor-readout::after { animation: none; }
            .camera-frame img,
            .device-panel-media img { animation: none; }
            .toggle-pill[data-on],
            .climate-panel[data-heat],
            .climate-panel[data-cool],
            .media-strip:not([data-off]),
            .sensor-readout[data-off],
            .toggle-pill[data-off],
            .lcars-device-panel:has(.device-panel-media[data-offline]) { animation: none; }
          }
        `,
      ];
    }

    /* ──────────── RENDER ──────────── */
    render() {
      if (!this._hass) return html`<div class="lcars-empty">Initializing...</div>`;

      // No area selected — show prompt
      if (!this.selectedArea) {
        return html`<div class="lcars-empty">Select an area</div>`;
      }

      // Find the area object
      const area = this._hass.areas?.[this.selectedArea];
      if (!area) return html`<div class="lcars-empty">Area not found</div>`;

      const entities = this._getAreaEntities(this.selectedArea);

      return html`
        <div class="content-area-panel">
          <div class="content-area-header">${area.name}</div>
          ${this._renderAreaContent(entities)}
        </div>
      `;
    }

    /* ─── Detect if a device warrants a unified panel ─── */
    _getDevicePanelType(entries) {
      if (entries.some(e => CAMERA_DOMAINS.has(e.domain))) return PANEL_TYPE_CAMERA;
      // Future panel types go here in priority order
      return null;
    }

    /* ─── Single-pass partition of device entities for panel rendering ─── */
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

    /* ─── Dispatch to the correct panel renderer ─── */
    _renderDevicePanel(panelType, group) {
      switch (panelType) {
        case PANEL_TYPE_CAMERA: return this._renderCameraPanel(group);
        // Future: case PANEL_TYPE_CLIMATE: return this._renderClimatePanel(group);
        default: return '';
      }
    }

    /* ─── Sensor indicator color per state (Geordi spec) ─── */
    _getSensorIndicatorColor(state) {
      if (!state || state.state === 'unavailable' || state.state === 'unknown')
        return 'var(--lcars-tomato)';
      const deviceClass = state.attributes?.device_class || '';
      const val = state.state;
      // Motion sensor
      if (deviceClass === 'motion' || deviceClass === 'occupancy')
        return val === 'on' ? 'var(--lcars-butterscotch)' : 'var(--lcars-gray)';
      // Person or presence
      if (deviceClass === 'presence')
        return val === 'on' || val === 'home' ? 'var(--lcars-gold)' : 'var(--lcars-gray)';
      // Doorbell / tamper / problem / safety
      if (['problem', 'safety', 'tamper'].includes(deviceClass))
        return val === 'on' ? 'var(--lcars-tomato)' : 'var(--lcars-gray)';
      // Generic binary on/off
      if (state.entity_id?.startsWith('binary_sensor.'))
        return val === 'on' ? 'var(--lcars-ice)' : 'var(--lcars-gray)';
      // Numeric sensor — always data accent
      return 'var(--lcars-data-accent)';
    }

    /* ═══ CAMERA DEVICE PANEL RENDERER ═══ */
    _renderCameraPanel(group) {
      const { cameras, sensors, controls } = this._partitionDeviceEntities(group.entities);
      const deviceName = group.device.name_by_user || group.device.name || 'Device';

      return html`
        <div class="lcars-device-panel" data-panel-type="camera">
          <div class="device-panel-header">
            <span class="device-panel-name">${deviceName}</span>
            <div class="device-panel-header-line"></div>
          </div>

          <div class="device-panel-sensors" role="list" aria-label="${deviceName} sensors">
            ${sensors.map(({ entity, state }) => {
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

          <div class="device-panel-media"
            ?data-offline=${cameras.length > 0 && this._isOff(cameras[0].state)}>
            ${cameras.map(({ entity, state }, idx) => {
              const imgUrl = cameraImageUrl(state);
              const name = idx === 0 ? deviceName : this._friendlyName(state, entity);
              return imgUrl
                ? html`<img src="${imgUrl}"
                            alt="${name} camera feed" loading="lazy"
                            data-entity="${entity.entity_id}"
                            style="${idx > 0 ? 'margin-top:var(--lcars-gap);border-top:2px solid var(--panel-frame-color)' : ''}"
                            @error=${(e) => { e.target.style.display = 'none'; e.target.nextElementSibling && (e.target.nextElementSibling.style.display = ''); }}
                            @load=${(e) => { e.target.style.display = ''; const sib = e.target.nextElementSibling; if (sib?.classList.contains('camera-error-fallback')) sib.style.display = 'none'; }}
                            @click=${() => this._handleEntityClick(entity.entity_id)} /><div class="camera-error-fallback" style="display:none;aspect-ratio:16/9;align-items:center;justify-content:center"
                            @click=${() => this._handleEntityClick(entity.entity_id)}>
                    <ha-icon icon="mdi:video-off" style="--mdc-icon-size:48px;color:var(--lcars-gray)"></ha-icon>
                  </div>`
                : html`<div style="display:flex;aspect-ratio:16/9;align-items:center;justify-content:center"
                            @click=${() => this._handleEntityClick(entity.entity_id)}>
                    <ha-icon icon="mdi:video-off" style="--mdc-icon-size:48px;color:var(--lcars-gray)"></ha-icon>
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

    /* ─── Render area content: two-column when cameras present ─── */
    _renderAreaContent(entities) {
      if (entities.length === 0)
        return html`<div class="lcars-empty">No entities in this area</div>`;

      const { byDevice, noDevice } = this._groupEntities(entities);

      // Partition devices into panel-worthy and normal
      const panelDevices = [];
      const normalDevices = [];
      for (const group of byDevice.values()) {
        const panelType = this._getDevicePanelType(group.entities);
        if (panelType) {
          panelDevices.push({ ...group, panelType });
        } else {
          normalDevices.push(group);
        }
      }

      // Build normal content once — used in both layouts
      const normalContent = html`
        ${normalDevices.map((group) => html`
          <div class="device-group">
            <div class="device-header">
              <span class="device-name">${group.device.name_by_user || group.device.name || 'Device'}</span>
              <div class="device-line"></div>
            </div>
            ${this._renderDomainGroups(group.entities)}
          </div>
        `)}
        ${noDevice.length > 0 ? html`
          <div class="device-group">
            <div class="device-header">
              <span class="device-name">Other Entities</span>
              <div class="device-line"></div>
            </div>
            ${this._renderDomainGroups(noDevice)}
          </div>
        ` : ''}
      `;

      // No camera panels → single-column (unchanged behavior)
      if (panelDevices.length === 0) return normalContent;

      // Camera panels present → two-column split layout
      return html`
        <div class="area-split-layout">
          <div class="area-split-main">${normalContent}</div>
          <div class="area-split-panels" aria-live="polite">
            ${panelDevices.map(g => this._renderDevicePanel(g.panelType, g))}
          </div>
        </div>
      `;
    }

    /* ─── Render domain-grouped entity lists ─── */
    _renderDomainGroups(entries) {
      const domainGroups = this._groupByDomain(entries);
      return html`${domainGroups.map(([domain, items]) => html`
        <div class="domain-label">${DOMAIN_LABELS[domain] || domain}</div>
        ${this._renderDomainEntities(domain, items)}
      `)}`;
    }

    /* ─── Route to the correct renderer per domain ─── */
    _renderDomainEntities(domain, entries) {
      if (CAMERA_DOMAINS.has(domain)) return this._renderCameras(entries);
      if (TOGGLE_DOMAINS.has(domain)) return this._renderToggles(entries);
      if (CLIMATE_DOMAINS.has(domain)) return this._renderClimates(entries);
      if (COVER_DOMAINS.has(domain)) return this._renderCovers(entries);
      if (MEDIA_DOMAINS.has(domain)) return this._renderMedia(entries);
      if (SENSOR_DOMAINS.has(domain)) return this._renderSensors(entries);
      return this._renderGeneric(entries);
    }

    /* ═══ CAMERA RENDERER ═══ */
    _renderCameras(entries) {
      return html`<div class="camera-grid">
        ${entries.map(({ entity, state }, i) => {
          const name = this._friendlyName(state, entity);
          const off = this._isOff(state);
          const imgUrl = cameraImageUrl(state);
          return html`
            <div class="camera-frame" ?data-off=${off} style="--i:${i}"
              role="button"
              tabindex="0"
              aria-label="${name} camera: ${state.state}"
              @click=${() => this._handleEntityClick(entity.entity_id)}
              @keydown=${(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._handleEntityClick(entity.entity_id); } }}>
              ${imgUrl
                ? html`<img src="${imgUrl}" alt="${name}" loading="lazy"
                            data-entity="${entity.entity_id}"
                            @error=${(e) => { e.target.style.display = 'none'; e.target.nextElementSibling && (e.target.nextElementSibling.style.display = 'flex'); }}
                            @load=${(e) => { e.target.style.display = ''; const sib = e.target.nextElementSibling; if (sib?.classList.contains('camera-error-fallback')) sib.style.display = 'none'; }} /><div class="camera-error-fallback" style="display:none;aspect-ratio:16/9;align-items:center;justify-content:center;">
                    <ha-icon icon="mdi:video-off" style="--mdc-icon-size:48px;color:var(--lcars-gray)"></ha-icon>
                  </div>`
                : html`<div style="aspect-ratio:16/9;display:flex;align-items:center;justify-content:center;">
                    <ha-icon icon="mdi:video-off" style="--mdc-icon-size:48px;color:var(--lcars-gray)"></ha-icon>
                  </div>`
              }
              <div class="camera-label">
                <ha-icon icon="mdi:video"></ha-icon>
                <span>${name}</span>
                <span class="cam-state">${state.state}</span>
              </div>
            </div>
          `;
        })}
      </div>`;
    }

    /* ═══ TOGGLE RENDERER (light/switch/fan/lock) ═══ */
    _renderToggles(entries) {
      return html`<div class="toggle-grid">
        ${entries.map(({ entity, state }, i) => {
          const name = this._friendlyName(state, entity);
          const isOn = state.state === 'on' || state.state === 'unlocked' || state.state === 'playing';
          const isOff = this._isOff(state);
          const domain = entity.entity_id.split('.')[0];
          const brightness = state.attributes?.brightness;
          const brightPct = brightness ? Math.round((brightness / 255) * 100) : 0;

          return html`
            <button class="toggle-pill" ?data-on=${isOn} ?data-off=${isOff} style="--i:${i}"
              role="switch"
              aria-checked=${isOn}
              aria-label="${name}: ${state.state}${brightness ? ` (${brightPct}%)` : ''}"
              @click=${(e) => { e.stopPropagation(); this._handleToggle(entity.entity_id); }}
              @dblclick=${() => this._handleEntityClick(entity.entity_id)}
              title="${name}: ${state.state}${brightness ? ` (${brightPct}%)` : ''}">
              <ha-icon .icon=${this._getEntityIcon(state)}></ha-icon>
              <span class="toggle-name">${name}</span>
              ${domain === 'light' && brightness && isOn ? html`
                <div class="brightness-bar">
                  <div class="brightness-fill" style="width:${brightPct}%"></div>
                </div>
              ` : ''}
              <span class="toggle-state">${state.state}</span>
              <div class="toggle-switch"></div>
            </button>
          `;
        })}
      </div>`;
    }

    /* ═══ SENSOR RENDERER ═══ */
    _renderSensors(entries) {
      return html`<div class="sensor-grid">
        ${entries.map(({ entity, state }, i) => {
          const name = this._friendlyName(state, entity);
          const off = this._isOff(state);
          const unit = state.attributes?.unit_of_measurement || '';
          const val = state.state;
          const numVal = parseFloat(val);
          // Warn if battery < 20% or any numeric > threshold patterns
          const isBattery = entity.entity_id.includes('battery') ||
            state.attributes?.device_class === 'battery';
          const warn = isBattery && !isNaN(numVal) && numVal < 20;

          return html`
            <button class="sensor-readout" ?data-off=${off} ?data-warn=${warn} style="--i:${i}"
              @click=${() => this._handleEntityClick(entity.entity_id)}
              title="${name}: ${val} ${unit}">
              <ha-icon .icon=${this._getEntityIcon(state)}></ha-icon>
              <span class="sensor-name">${name}</span>
              ${this._renderSensorBar(state)}
              <span class="sensor-value">${val}</span>
              ${unit ? html`<span class="sensor-unit">${unit}</span>` : ''}
            </button>
          `;
        })}
      </div>`;
    }

    /* ═══ CLIMATE RENDERER ═══ */
    _renderClimates(entries) {
      return html`<div class="climate-grid">
        ${entries.map(({ entity, state }, i) => {
          const name = this._friendlyName(state, entity);
          const mode = state.state; // heat, cool, heat_cool, off, etc.
          const current = state.attributes?.current_temperature;
          const target = state.attributes?.temperature;
          const unit = state.attributes?.temperature_unit || '°';
          const isHeat = mode === 'heat' || mode === 'heat_cool';
          const isCool = mode === 'cool';
          const isOff = mode === 'off';

          return html`
            <button class="climate-panel" ?data-heat=${isHeat} ?data-cool=${isCool} ?data-off=${isOff} style="--i:${i}"
              @click=${() => this._handleEntityClick(entity.entity_id)}
              title="${name}: ${mode}">
              <ha-icon .icon=${this._getEntityIcon(state)}></ha-icon>
              <div class="climate-info">
                <span class="climate-name">${name}</span>
                <div class="climate-temps">
                  ${current != null ? html`<span class="climate-current">${current}${unit}</span>` : ''}
                  ${target != null ? html`<span class="climate-target">→ ${target}${unit}</span>` : ''}
                </div>
              </div>
              <span class="climate-mode">${mode}</span>
            </button>
          `;
        })}
      </div>`;
    }

    /* ═══ COVER RENDERER ═══ */
    _renderCovers(entries) {
      return html`<div class="cover-grid">
        ${entries.map(({ entity, state }, i) => {
          const name = this._friendlyName(state, entity);
          const off = state.state === 'closed';
          const pos = state.attributes?.current_position;
          return html`
            <button class="cover-panel" ?data-off=${off} style="--i:${i}"
              @click=${() => this._handleEntityClick(entity.entity_id)}
              title="${name}: ${state.state}">
              <ha-icon .icon=${this._getEntityIcon(state)}></ha-icon>
              <span class="cover-name">${name}</span>
              ${pos != null ? html`<span class="cover-position">${pos}%</span>` : ''}
            </button>
          `;
        })}
      </div>`;
    }

    /* ═══ MEDIA PLAYER RENDERER ═══ */
    _renderMedia(entries) {
      return html`<div class="media-grid">
        ${entries.map(({ entity, state }, i) => {
          const name = this._friendlyName(state, entity);
          const off = this._isOff(state);
          const title = state.attributes?.media_title || '';
          const artist = state.attributes?.media_artist || '';
          const nowPlaying = [title, artist].filter(Boolean).join(' — ');
          return html`
            <button class="media-strip" ?data-off=${off} style="--i:${i}"
              @click=${() => this._handleEntityClick(entity.entity_id)}
              title="${name}: ${state.state}">
              <ha-icon .icon=${this._getEntityIcon(state)}></ha-icon>
              <div class="media-info">
                <div class="media-name">${name}</div>
                ${nowPlaying ? html`<div class="media-title">${nowPlaying}</div>` : ''}
              </div>
              <span class="media-state">${state.state}</span>
            </button>
          `;
        })}
      </div>`;
    }

    /* ═══ GENERIC BUTTON RENDERER ═══ */
    _renderGeneric(entries) {
      return html`<div class="entity-grid">
        ${entries.map(({ entity, state }, i) => {
          const name = this._friendlyName(state, entity);
          const off = this._isOff(state);
          return html`
            <button class="entity-btn" ?data-off=${off} style="--i:${i}"
              @click=${() => this._handleEntityClick(entity.entity_id)}
              title="${name}: ${state.state}">
              <ha-icon .icon=${this._getEntityIcon(state)}></ha-icon>
              <span class="entity-name">${name}</span>
              <span class="entity-state">${state.state}</span>
            </button>
          `;
        })}
      </div>`;
    }

    getCardSize() { return 6; }
  }

  if (!customElements.get('homepage-card')) {
    customElements.define('homepage-card', LcarsHomepageCard);
  }
