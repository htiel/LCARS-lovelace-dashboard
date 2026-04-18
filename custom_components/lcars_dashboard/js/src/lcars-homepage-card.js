/**
 * LCARS Homepage Card — Main dashboard view with areas
 * Entities grouped by device → domain type with specialized renderers:
 *   camera → LCARS-framed live feed
 *   light/switch/fan/lock → LCARS toggle pill
 *   sensor/binary_sensor → data readout bar
 *   climate → thermostat panel
 *   alarm → alarm panel with PIN keypad
 *   media_player → media panel
 *   pool/spa → aquatics panel
 *   weather → weather panel
 *   irrigation → irrigation panel
 *   cover → position controls
 *   default → LCARS button
 */
import { LitElement, html, css } from 'lit-element';
import { svg, render } from 'lit-html';
import { lcarsBaseStyles } from './lcars-styles.js';
import { getHass, showMoreInfo, fireEvent, createCardElement, lcarsEventBus, lcarsLog, openEditPopup } from './lcars-helpers.js';
import {
  classifyDevice, classifyArea,
  PANEL_TYPE_CAMERA, PANEL_TYPE_ALARM, PANEL_TYPE_AQUATICS,
  PANEL_TYPE_CLIMATE, PANEL_TYPE_MEDIA, PANEL_TYPE_ENVIRONMENT,
  PANEL_TYPE_IRRIGATION, PANEL_TYPE_WEATHER, PANEL_TYPE_BATTERY,
  PANEL_TYPE_POWER, PANEL_TYPE_LIFE_SUPPORT, PANEL_TYPE_ILLUMINATION,
  PANEL_TYPE_ORDER, PANEL_COLUMN,
  CAMERA_DOMAINS, CLIMATE_DOMAINS, MEDIA_DOMAINS, ALARM_DOMAINS, WEATHER_DOMAINS,
  TOGGLE_DOMAINS, SENSOR_DOMAINS, COVER_DOMAINS,
  AQ_DEVICE_CLASSES, AQ_ENTITY_SUFFIX_RE,
  DOMAIN_LABELS, DOMAIN_ORDER,
  isLightingEntity, isClimateEntity, isEnvironmentEntity, isAmbientSensor,
  isTacticalEntity, PANEL_TYPE_TACTICAL,
  PANEL_TYPE_VIEWPORT,
} from './lcars-entity-utils.js';
import { getStateColor, getAqiColor, getHvacActionColor, getAlarmStateColor, getPlaybackStateColor, getPoolBodyColor, getWeatherConditionColor, getIrrigationZoneColor, getComfortColor, getCo2Color, getTempColor, getTempComfortClass, getSafeComfortColor, COMFORT_COLORS, getRainDelayInfo, getPowerColor, getPowerLabel, getGridBalanceColor } from './lcars-color-utils.js';
import { clampSetpoint, clampValue, createRateLimiter, createDebouncer } from './lcars-service-utils.js';
import { renderSparkline, fetchSparklineData } from './lcars-sparkline.js';
import { fetchForecasts } from './lcars-weather-utils.js';
import { sharedKeyframes, sharedReducedMotion } from './lcars-shared-animations.js';
import { getFloorAreas } from './lcars-hierarchy-utils.js';
import { getAreaEntities, groupEntities } from './lcars-entity-query.js';

/* ─── Side-effect imports: extracted components & panels (no webpack entry needed) ─── */
import './components/lcars-panel-frame/lcars-panel-frame.js';
import './components/lcars-sensor-row/lcars-sensor-row.js';
import './components/lcars-section-divider/lcars-section-divider.js';
import './components/lcars-option-strip/lcars-option-strip.js';
import './components/lcars-setpoint/lcars-setpoint.js';
import './panels/irrigation/lcars-irrigation-panel.js';
import './panels/camera/lcars-camera-panel.js';
import './panels/environment/lcars-environment-panel.js';
import './panels/battery/lcars-battery-panel.js';
import './panels/climate/lcars-climate-panel.js';
import './panels/alarm/lcars-alarm-panel.js';
import './panels/media/lcars-media-panel.js';
import './panels/pool-spa/lcars-pool-spa-panel.js';
import './panels/weather/lcars-weather-panel.js';
import './panels/power/lcars-power-panel.js';
import './panels/lifesupport/lcars-lifesupport-panel.js';
import './panels/illumination/lcars-illumination-panel.js';
import './panels/tactical/lcars-tactical-panel.js';
import './panels/viewport/lcars-viewport-panel.js';

const TAG = 'Homepage';

// ─── Panel Dispatch Registry (4X-21) ────────────────────────────────────────
// Factory function pattern per Geordi — no unsafeStatic, no dynamic tag injection.
// Each entry returns a lit-html template for the panel type.

const PANEL_TAG_REGISTRY = new Map([
  [PANEL_TYPE_CAMERA,       (group, hass, editMode, config) => html`<lcars-camera-panel .group=${group} .hass=${hass} .editMode=${editMode} .config=${config}></lcars-camera-panel>`],
  [PANEL_TYPE_ENVIRONMENT,  (group, hass, editMode, config) => html`<lcars-environment-panel .group=${group} .hass=${hass} .editMode=${editMode} .config=${config}></lcars-environment-panel>`],
  [PANEL_TYPE_BATTERY,      (group, hass, editMode, config) => html`<lcars-battery-panel .group=${group} .hass=${hass} .editMode=${editMode} .config=${config}></lcars-battery-panel>`],
  [PANEL_TYPE_CLIMATE,      (group, hass, editMode, config) => html`<lcars-climate-panel .group=${group} .hass=${hass} .editMode=${editMode} .config=${config}></lcars-climate-panel>`],
  [PANEL_TYPE_ALARM,        (group, hass, editMode, config) => html`<lcars-alarm-panel .group=${group} .hass=${hass} .editMode=${editMode} .config=${config}></lcars-alarm-panel>`],
  [PANEL_TYPE_MEDIA,        (group, hass, editMode, config) => html`<lcars-media-panel .group=${group} .hass=${hass} .editMode=${editMode} .config=${config}></lcars-media-panel>`],
  [PANEL_TYPE_AQUATICS,     (group, hass, editMode, config) => html`<lcars-pool-spa-panel .group=${group} .hass=${hass} .editMode=${editMode} .config=${config}></lcars-pool-spa-panel>`],
  [PANEL_TYPE_WEATHER,      (group, hass, editMode, config) => html`<lcars-weather-panel .group=${group} .hass=${hass} .editMode=${editMode} .config=${config}></lcars-weather-panel>`],
  [PANEL_TYPE_LIFE_SUPPORT, (group, hass, editMode, config) => html`<lcars-lifesupport-panel .group=${group} .hass=${hass} .editMode=${editMode} .config=${config} area-id="${group.areaId || ''}"></lcars-lifesupport-panel>`],
  [PANEL_TYPE_ILLUMINATION, (group, hass, editMode, config) => html`<lcars-illumination-panel .group=${group} .entities=${group.entities} .hass=${hass} .editMode=${editMode} .config=${config} area-id="${group.areaId || ''}"></lcars-illumination-panel>`],
  [PANEL_TYPE_TACTICAL,      (group, hass, editMode, config) => html`<lcars-tactical-panel .group=${group} .entities=${group.entities} .hass=${hass} .editMode=${editMode} .config=${config} area-id="${group.areaId || ''}"></lcars-tactical-panel>`],
  [PANEL_TYPE_VIEWPORT,       (group, hass, editMode, config) => html`<lcars-viewport-panel .group=${group} .entities=${group.entities} .hass=${hass} .editMode=${editMode} .config=${config} area-id="${group.areaId || ''}"></lcars-viewport-panel>`],
]);

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
      selectedFloor: { type: String },
      _hass: { type: Object },
      _editMode: { type: Boolean },
    };
    }

    constructor() {
      super();
      this.data = null;
      this.selectedArea = null;
      this.selectedFloor = null;
      this._editMode = false;
      this._configLoading = false;
      this._entityCache = new Map();
      /* Camera auto-refresh state */
      this._cameraRefreshInterval = null;
      this._cameraObserver = null;
      this._visibleCameras = new Set();
      this._loadingCameras = new Set();
      this._onAreaSelected = (e) => {
        lcarsLog.debug(TAG, 'Area selected event:', e.detail.areaId);
        this.selectedArea = e.detail.areaId;
        this.selectedFloor = null; // area overrides floor
        this._entityCache.clear();
      };
      this._onFloorSelected = (e) => {
        lcarsLog.debug(TAG, 'Floor selected event:', e.detail.floorId);
        this.selectedFloor = e.detail.floorId;
        this.selectedArea = null; // floor overrides area
        this._entityCache.clear();
      };
      this._onEditMode = (e) => {
        this._editMode = e.detail.enabled;
        lcarsLog.debug(TAG, 'Edit mode:', this._editMode);
      };
    }

    connectedCallback() {
      super.connectedCallback();
      lcarsEventBus.addEventListener('lcars-area-selected', this._onAreaSelected);
      lcarsEventBus.addEventListener('lcars-floor-selected', this._onFloorSelected);
      lcarsEventBus.addEventListener('lcars-edit-mode', this._onEditMode);
      this._startCameraRefresh();
      document.addEventListener('visibilitychange', this._onVisibilityChange);
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      lcarsEventBus.removeEventListener('lcars-area-selected', this._onAreaSelected);
      lcarsEventBus.removeEventListener('lcars-floor-selected', this._onFloorSelected);
      lcarsEventBus.removeEventListener('lcars-edit-mode', this._onEditMode);
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
      try {
        this._config = config;
        lcarsLog.debug(TAG, 'setConfig:', config);
      } catch (err) {
        lcarsLog.error(TAG, 'setConfig FAILED — this causes CONFIGURATION ERROR:', err);
        throw err;
      }
    }

    set hass(hass) {
      const prev = this._hass;
      this._hass = hass;
      if (!prev) {
        lcarsLog.debug(TAG, 'First hass received — areas:', Object.keys(hass.areas || {}).length, 'entities:', Object.keys(hass.entities || {}).length);
      }
      // Bust entity cache when registries change
      if (prev && (prev.entities !== hass.entities || prev.devices !== hass.devices)) {
        lcarsLog.debug(TAG, 'Entity/device registry changed — busting cache');
        this._entityCache.clear();
      }
      // Deselect area if it was removed from HA
      if (prev && prev.areas !== hass.areas && this.selectedArea) {
        if (!hass.areas?.[this.selectedArea]) {
          this.selectedArea = null;
          this._entityCache.clear();
        }
      }
      if (!this.data && !this._configLoading) this._loadConfiguration();
    }

    async _loadConfiguration() {
      if (!this._hass) return;
      this._configLoading = true;
      lcarsLog.debug(TAG, 'Loading configuration via WS...');
      try {
        const result = await this._hass.callWS({
          type: 'lcars_dashboard/configuration/get',
        });
        this.data = result;
        // Auto-sync debug flag from backend
        if (result.debug !== undefined) {
          window.__LCARS_DEBUG = result.debug;
          if (result.debug) lcarsLog.info(TAG, 'Debug logging auto-enabled from HA backend');
        }
        lcarsLog.debug(TAG, 'Configuration loaded:', Object.keys(result), 'version:', result.installed_version);
      } catch (e) {
        lcarsLog.error(TAG, 'Failed to load configuration — WS call failed:', e);
        // Set empty data so we don't retry endlessly — card still works dynamically from hass
        this.data = {};
      } finally {
        this._configLoading = false;
      }
    }

    _handleEntityClick(entityId) {
      lcarsLog.debug(TAG, 'Entity click:', entityId);
      showMoreInfo(entityId);
    }

    _handleEditEntity(e, entityId) {
      e.stopPropagation();
      e.preventDefault();
      if (!this._hass) return;
      const state = this._getEntityState(entityId);
      const name = state?.attributes?.friendly_name || entityId;
      openEditPopup(this._hass, 'lcars-edit-entity-card', {
        entity: entityId,
        icon: state?.attributes?.icon || '',
        name: name,
      }, `Edit: ${name}`);
    }

    _handleEditDevice(e, deviceId) {
      e.stopPropagation();
      e.preventDefault();
      if (!this._hass) return;
      const device = this._hass.devices?.[deviceId];
      const name = device?.name_by_user || device?.name || deviceId;
      openEditPopup(this._hass, 'lcars-edit-device-button-card', {
        device: deviceId,
        name: name,
        icon: '',
      }, `Edit: ${name}`);
    }

    /* ─── Toggle a light/switch/fan/etc ─── */
    _handleToggle(entityId) {
      const domain = entityId.split('.')[0];
      lcarsLog.debug(TAG, 'Toggle:', entityId, 'domain:', domain);
      if (domain === 'lock') {
        const state = this._getEntityState(entityId);
        this._hass.callService('lock', state?.state === 'locked' ? 'unlock' : 'lock', { entity_id: entityId });
      } else if (domain === 'script') {
        this._hass.callService('script', 'turn_on', { entity_id: entityId });
      } else {
        this._hass.callService('homeassistant', 'toggle', { entity_id: entityId });
      }
    }

    /* ─── Entity resolution: delegates to shared lcars-entity-query.js (4X-13) ─── */
    _getAreaEntities(areaId) {
      return getAreaEntities(this._hass, areaId, this._entityCache);
    }

    /* ─── Floor-level entity resolution: union all areas on a floor ─── */
    _getFloorAreaIds(floorId) {
      return getFloorAreas(this._hass, floorId);
    }

    /* ─── Fetch config/diagnostic entities for a specific device (battery panels) ─── */
    _getDeviceCategoryEntities(deviceId) {
      if (!this._hass || !deviceId) return { config: [], diagnostic: [] };
      const entities = Object.values(this._hass.entities || {});
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

    /* ─── Group entities: delegates to shared lcars-entity-query.js (4X-13) ─── */
    _groupEntities(entities) {
      return groupEntities(this._hass, entities);
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

    /* ─── Wrap an entity element with an edit pip overlay ─── */
    _withEditPip(entityId, content) {
      if (!this._editMode) return content;
      return html`
        <div class="edit-pip-wrap">
          ${content}
          <div class="edit-pip" tabindex="0" role="button" aria-label="Edit entity"
            @click=${(e) => this._handleEditEntity(e, entityId)}
            @keydown=${(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._handleEditEntity(e, entityId); } }}></div>
        </div>
      `;
    }

    /* Strip area name and device name prefixes from a display name */
    _shortenName(fullName, entity) {
      if (!fullName) return fullName;
      const prefixes = [];
      const area = this._hass?.areas?.[this.selectedArea];
      if (area?.name) prefixes.push(area.name);
      if (entity?.device_id) {
        const dev = this._hass?.devices?.[entity.device_id];
        const dn = dev?.name_by_user || dev?.name;
        if (dn) prefixes.push(dn);
      }
      // Longest first to avoid partial matches
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

    /* Strip area name from a device display name */
    _shortDeviceName(device) {
      const raw = device?.name_by_user || device?.name || '';
      if (!raw) return 'Device';
      const area = this._hass?.areas?.[this.selectedArea];
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
      if (min === max) return '';
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
        sharedKeyframes,
        sharedReducedMotion,
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
            font-weight: normal;
            margin: 0;
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

          /* ─── Floor View ─── */
          .content-floor-panel {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
            padding-left: 1rem;
          }
          .content-floor-header {
            font-family: var(--lcars-font);
            font-size: calc(var(--lcars-font-size-title) * 1.15);
            font-weight: normal;
            margin: 0;
            color: var(--lcars-lilac, #cc55ff);
            text-transform: uppercase;
            padding: 0.25rem 0 0.5rem 0;
            border-left: 4px solid var(--lcars-lilac, #cc55ff);
            padding-left: 1rem;
          }
          .content-floor-header::after {
            content: '';
            display: block;
            height: 3px;
            background: var(--lcars-lilac, #cc55ff);
            margin-top: 0.5rem;
            opacity: 0.5;
          }
          .floor-area-section {
            padding-left: 0;
          }
          .floor-area-subheader {
            font-size: calc(var(--lcars-font-size-title) * 0.85);
            border-left-width: 2px;
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
            font-weight: normal;
            margin: 0;
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
            background: var(--lcars-black);
            position: relative;
            z-index: 0;
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
            z-index: 3;
          }
          .camera-label ha-icon { --mdc-icon-size: 14px; }
          .camera-label .cam-state {
            margin-left: auto;
            font-size: 0.65rem;
            color: var(--lcars-space-white);
            opacity: 0.7;
          }

          /* ── Camera state overlays ── */
          .camera-connecting-overlay,
          .camera-offline-overlay {
            position: absolute;
            inset: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            background: var(--lcars-black);
            z-index: 2;
            transition: opacity 300ms ease-out, visibility 300ms ease-out;
          }
          .camera-connecting-text {
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            color: var(--lcars-ice);
            text-transform: uppercase;
            letter-spacing: 0.1em;
            animation: lcars-viewscreen-breathe 4s ease-in-out infinite;
          }
          @keyframes lcars-viewscreen-breathe {
            0%, 100% { opacity: 1; }
            50%      { opacity: 0.4; }
          }
          .camera-offline-overlay ha-icon {
            --mdc-icon-size: 32px;
            color: var(--lcars-tomato);
          }
          .camera-offline-text {
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            color: var(--lcars-tomato);
            text-transform: uppercase;
            letter-spacing: 0.1em;
          }

          /* State-driven visibility (D-4: opacity/visibility, not display:none) */
          .camera-frame[data-state="live"] .camera-connecting-overlay,
          .camera-frame[data-state="offline"] .camera-connecting-overlay {
            opacity: 0;
            visibility: hidden;
          }
          .camera-frame[data-state="connecting"] .camera-offline-overlay,
          .camera-frame[data-state="live"] .camera-offline-overlay {
            opacity: 0;
            visibility: hidden;
          }
          .camera-frame[data-state="offline"] {
            border-color: var(--lcars-tomato);
            opacity: 1;
          }
          .camera-frame[data-state="offline"]:hover { border-color: var(--lcars-gold); }
          /* Hide img during connecting so overlay text is visible */
          .camera-frame[data-state="connecting"] img { opacity: 0; }
          /* Hide img during offline so overlay is visible */
          .camera-frame[data-state="offline"] img { opacity: 0; }
          /* Spacer to maintain 16:9 when no img rendered */
          .camera-spacer { aspect-ratio: 16/9; }
          /* Camera frame inside device panel media fills container */
          .device-panel-media .camera-frame {
            border: none;
            border-radius: 0;
            width: 100%;
            height: 100%;
          }

          /* ═══════ DEVICE PANEL (reusable frame for camera / climate / media) ═══════ */
          .device-panels-section {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: var(--lcars-gap);
            margin-bottom: 0.75rem;
          }

          /* ─── Two-column split: entities+left-panels left, right-panels right ─── */
          .area-split-layout {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            align-items: start;
          }
          /* ─── Full-width illumination panel above columns ─── */
          .area-illumination-full {
            margin-bottom: 1rem;
          }
          .area-illumination-full lcars-illumination-panel {
            --panel-max-width: none;
          }
          .area-split-main {
            min-width: 0;
          }
          .area-split-panels {
            display: flex;
            flex-direction: column;
            gap: var(--lcars-gap);
            min-width: 0;
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

          /* ═══════ BATTERY WARP CORE PANEL ═══════ */
          .battery-panel {
            --panel-frame-color: var(--lcars-ice);
            grid-template-columns: minmax(8rem, 1fr) minmax(5rem, 6rem) minmax(8rem, 1.2fr);
            grid-template-rows: auto 1fr auto;
            grid-template-areas:
              "header   header    header"
              "sensors  core      controls"
              "ioflow   ioflow    ioflow";
          }
          .battery-header {
            grid-area: header;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.25rem 0.5rem;
          }
          .battery-charge-label {
            font-size: var(--lcars-font-size-title);
            font-weight: 700;
            text-transform: uppercase;
            white-space: nowrap;
            flex-shrink: 0;
          }
          .battery-telemetry {
            grid-area: sensors;
            display: flex;
            flex-direction: column;
            gap: var(--lcars-gap);
            padding: 0.25rem;
            overflow-y: auto;
            max-height: 22rem;
          }
          .battery-total-line {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.25rem 0.5rem;
            cursor: pointer;
            font-size: var(--lcars-font-size-data);
            text-transform: uppercase;
            border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
            transition: background var(--lcars-transition);
          }
          .battery-total-line:hover { background: rgba(255,255,255,0.05); }
          .battery-controls {
            grid-area: controls;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            padding: 0.25rem;
            overflow-y: auto;
            max-height: 22rem;
          }

          /* Warp Core */
          .warp-core-container {
            grid-area: core;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0.5rem 0;
            min-height: 10rem;
          }
          .warp-core {
            position: relative;
            width: 4rem;
            height: 100%;
            min-height: 10rem;
            border-radius: 2rem;
            border: 2px solid var(--core-color);
            background: var(--lcars-black);
            overflow: hidden;
            box-shadow: 0 0 calc(var(--core-charge, 0) * 0.2px) var(--core-color);
            transition: border-color 1s ease, box-shadow 1s ease;
          }
          .warp-core-fill {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: calc(var(--core-charge, 0) * 1%);
            background: var(--core-color);
            opacity: 0.8;
            transition: height 1s ease, background 1s ease;
          }
          .warp-core-fill.core-idle {
            animation: core-idle-pulse 3s ease-in-out infinite;
          }
          .warp-core-fill.core-charging {
            animation: core-charge-flow 2s linear infinite;
          }
          .warp-core-stream {
            position: absolute;
            left: 50%;
            top: 0;
            bottom: 0;
            width: 2px;
            transform: translateX(-50%);
            background: rgba(255,255,255,0.35);
          }
          .warp-core-tick {
            position: absolute;
            left: 10%;
            right: 10%;
            height: 1px;
            background: var(--core-color);
            opacity: 0.3;
            pointer-events: none;
          }
          @keyframes core-idle-pulse {
            0%, 100% { opacity: 0.8; }
            50% { opacity: 0.55; }
          }
          @keyframes core-charge-flow {
            0% { background-position-y: 0; }
            100% { background-position-y: -2rem; }
          }
          .warp-core-fill.core-charging {
            background-image: repeating-linear-gradient(
              0deg,
              transparent 0px,
              transparent 0.75rem,
              rgba(255,255,255,0.15) 0.75rem,
              rgba(255,255,255,0.15) 1rem
            );
            background-size: 100% 2rem;
          }

          /* Number slider controls */
          .battery-slider-control {
            display: flex;
            flex-direction: column;
            gap: 0.125rem;
            padding: 0.25rem 0.5rem;
          }
          .battery-slider-label {
            font-size: 0.65rem;
            color: var(--lcars-space-white);
            text-transform: uppercase;
          }
          .battery-slider-track {
            position: relative;
            height: 1.25rem;
            background: var(--lcars-gray);
            border-radius: 0.625rem;
            cursor: pointer;
            overflow: visible;
          }
          .battery-slider-fill {
            height: 100%;
            background: var(--lcars-ice);
            border-radius: 0.625rem 0 0 0.625rem;
            transition: width 0.3s ease;
          }
          .battery-slider-thumb {
            position: absolute;
            top: 50%;
            transform: translate(-50%, -50%);
            width: 1.25rem;
            height: 1.25rem;
            border-radius: 50%;
            background: var(--lcars-sunflower);
            border: 2px solid var(--lcars-black);
            pointer-events: none;
          }
          .battery-slider-value {
            font-size: 0.7rem;
            color: var(--lcars-data-accent, var(--lcars-ice));
            text-align: right;
            font-weight: 700;
          }

          /* Section dividers and labels */
          .battery-section-divider {
            height: 1px;
            background: var(--lcars-gray);
            opacity: 0.3;
            margin: 0.375rem 0;
          }
          .battery-section-label {
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-label, 0.75rem);
            color: var(--lcars-sky, #aaaaff);
            text-transform: uppercase;
            letter-spacing: 0.08em;
            padding: 0 0.5rem;
            margin-bottom: 0.125rem;
          }

          /* LCARS Option Strip (for select entities) */
          .lcars-option-strip {
            display: flex;
            flex-direction: column;
            gap: 0.125rem;
            padding: 0.125rem 0;
          }
          .lcars-option-strip-label {
            font-size: 0.65rem;
            color: var(--lcars-space-white, #f5f6fa);
            text-transform: uppercase;
            padding: 0 0.25rem;
            margin-bottom: 0.125rem;
          }
          .lcars-option-strip-btns {
            display: flex;
            flex-wrap: wrap;
            gap: 2px;
          }
          .lcars-option-btn {
            display: flex;
            align-items: center;
            height: 1.5rem;
            padding: 0 0.75rem;
            background: var(--lcars-gray);
            color: var(--lcars-space-white, #f5f6fa);
            border: none;
            border-radius: 0 0.75rem 0.75rem 0;
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-label, 0.75rem);
            text-transform: uppercase;
            cursor: pointer;
            transition: filter 0.2s, background 0.2s;
            user-select: none;
            white-space: nowrap;
          }
          .lcars-option-btn:hover {
            filter: brightness(1.2);
          }
          .lcars-option-btn:focus-visible {
            outline: 2px solid var(--lcars-ice);
            outline-offset: 2px;
          }
          .lcars-option-btn[data-selected] {
            background: var(--lcars-gold, var(--lcars-butterscotch));
            color: var(--lcars-black, #000);
          }

          /* ═══ Environment Panel ═══ */
          .env-panel {
            grid-template-areas:
              "header header header"
              "sensors core controls"
              "sparklines sparklines sparklines";
            grid-template-columns: 1fr auto 1fr;
            grid-template-rows: auto 1fr auto;
          }
          .env-panel.sensor-only {
            grid-template-areas:
              "header header"
              "sensors core"
              "sparklines sparklines";
            grid-template-columns: 1fr auto;
          }
          .env-header {
            grid-area: header;
            display: flex;
            align-items: center;
            gap: var(--lcars-gap);
            padding: 0.25rem 0.5rem;
          }
          .env-score-label {
            font-size: 1.25rem;
            font-weight: bold;
            white-space: nowrap;
          }
          .env-sensors {
            grid-area: sensors;
            display: flex;
            flex-direction: column;
            gap: 0.125rem;
            padding: 0.25rem 0.5rem;
            overflow-y: auto;
          }
          .env-controls {
            grid-area: controls;
            display: flex;
            flex-direction: column;
            gap: var(--lcars-gap);
            padding: 0.25rem 0.5rem;
            border-left: 2px solid var(--panel-frame-color);
          }
          .env-sparklines {
            grid-area: sparklines;
            display: flex;
            flex-wrap: wrap;
            gap: 0.375rem;
            padding: 0.25rem 0.5rem;
            border-top: 2px solid var(--panel-frame-color);
          }
          .env-sparkline-wrap {
            display: flex;
            align-items: center;
            gap: 0.25rem;
            min-width: 6rem;
            flex: 1 1 auto;
          }
          .env-sparkline-label {
            font-size: var(--lcars-font-size-label, 0.75rem);
            color: var(--lcars-space-white);
            text-transform: uppercase;
            white-space: nowrap;
            width: 3rem;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .env-sparkline {
            width: 100%;
            height: 1.5rem;
            display: block;
          }

          /* Atmoscrubber cylinder */
          .atmoscrubber-container {
            grid-area: core;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0.5rem 0;
            min-height: 10rem;
          }
          .atmoscrubber {
            position: relative;
            width: 4rem;
            height: 100%;
            min-height: 10rem;
            border-radius: 2rem;
            border: 2px solid hsl(var(--scrubber-hue, 120), 70%, 60%);
            background: var(--lcars-black);
            overflow: hidden;
            transition: border-color 1s ease, box-shadow 1s ease;
            box-shadow: 0 0 8px hsla(var(--scrubber-hue, 120), 70%, 50%, 0.3);
          }
          .atmoscrubber::before,
          .atmoscrubber::after {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: inherit;
            background-image:
              radial-gradient(circle 3px, hsla(var(--scrubber-hue, 120), 80%, 65%, 0.8) 50%, transparent 51%),
              radial-gradient(circle 2px, hsla(var(--scrubber-hue, 120), 80%, 65%, 0.8) 50%, transparent 51%),
              radial-gradient(circle 2.5px, hsla(var(--scrubber-hue, 120), 80%, 65%, 0.8) 50%, transparent 51%),
              radial-gradient(circle 2px, hsla(var(--scrubber-hue, 120), 80%, 65%, 0.8) 50%, transparent 51%);
            background-size: 100% 3rem;
            background-position:
              25% 0, 65% 33%, 40% 60%, 80% 85%;
            background-repeat: repeat-y;
            animation: scrubber-flow var(--scrubber-speed, 20s) linear infinite;
          }
          .atmoscrubber::after {
            opacity: 0.4;
            background-size: 100% 2.5rem;
            background-position:
              15% 10%, 55% 50%, 75% 75%;
            background-image:
              radial-gradient(circle 2px, hsla(var(--scrubber-hue, 120), 80%, 65%, 0.6) 50%, transparent 51%),
              radial-gradient(circle 1.5px, hsla(var(--scrubber-hue, 120), 80%, 65%, 0.6) 50%, transparent 51%),
              radial-gradient(circle 2px, hsla(var(--scrubber-hue, 120), 80%, 65%, 0.6) 50%, transparent 51%);
            animation-duration: calc(var(--scrubber-speed, 20s) * 1.4);
          }
          @keyframes scrubber-flow {
            from { background-position-y: 0; }
            to { background-position-y: -3rem; }
          }
          .atmoscrubber.scrubber-idle {
            opacity: 0.5;
            animation: scrubber-idle-glow 3s ease-in-out infinite;
          }
          .atmoscrubber.scrubber-idle::before,
          .atmoscrubber.scrubber-idle::after {
            opacity: 0.2;
          }
          @keyframes scrubber-idle-glow {
            0%, 100% { box-shadow: 0 0 4px hsla(var(--scrubber-hue, 120), 70%, 50%, 0.15); }
            50% { box-shadow: 0 0 12px hsla(var(--scrubber-hue, 120), 70%, 50%, 0.35); }
          }
          .scrubber-score {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.1rem;
            font-weight: bold;
            color: var(--lcars-space-white);
            z-index: 1;
            text-shadow: 0 0 4px rgba(0,0,0,0.8);
          }
          @media (prefers-reduced-motion: reduce) {
            .atmoscrubber::before,
            .atmoscrubber::after,
            .atmoscrubber.scrubber-idle {
              animation: none;
            }
          }

          /* Power I/O Flow */
          .battery-io-flow {
            grid-area: ioflow;
            display: flex;
            flex-direction: column;
            gap: var(--lcars-gap);
            padding: 0.25rem 0.5rem;
            border-top: 2px solid var(--panel-frame-color);
          }
          .io-pair-row {
            display: flex;
            align-items: center;
            gap: 0;
            min-height: 1.75rem;
          }
          .io-port {
            display: flex;
            flex-direction: column;
            align-items: center;
            min-width: 3.5rem;
            flex-shrink: 0;
          }
          .io-port.io-out { order: 5; }
          .io-label {
            font-size: 0.6rem;
            color: var(--lcars-space-white);
            text-transform: uppercase;
            white-space: nowrap;
          }
          .io-watts {
            font-size: var(--lcars-font-size-data);
            font-weight: 700;
          }
          .io-conduit {
            flex: 1;
            height: 3px;
            position: relative;
            overflow: hidden;
          }
          .io-conduit-in {
            order: 2;
            background: var(--lcars-ice);
            opacity: 0.4;
          }
          .io-conduit-out {
            order: 4;
            background: var(--lcars-butterscotch);
            opacity: 0.4;
          }
          .io-core-gap {
            order: 3;
            width: 1rem;
            flex-shrink: 0;
          }
          /* Flow particles */
          .io-conduit::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
          }
          .io-conduit-in:not(.flow-stopped)::before {
            background: repeating-linear-gradient(
              90deg,
              transparent 0px, transparent 6px,
              var(--lcars-ice) 6px, var(--lcars-ice) 10px
            );
            background-size: 16px 100%;
            animation: flow-in var(--flow-duration, 0.8s) linear infinite;
          }
          .io-conduit-out:not(.flow-stopped)::before {
            background: repeating-linear-gradient(
              270deg,
              transparent 0px, transparent 6px,
              var(--lcars-butterscotch) 6px, var(--lcars-butterscotch) 10px
            );
            background-size: 16px 100%;
            animation: flow-out var(--flow-duration, 0.8s) linear infinite;
          }
          .flow-fast { --flow-duration: 0.4s; opacity: 1; }
          .flow-medium { --flow-duration: 0.8s; opacity: 0.8; }
          .flow-slow { --flow-duration: 1.5s; opacity: 0.6; }
          .flow-stopped { opacity: 0.15; }
          .flow-stopped::before { display: none; }
          @keyframes flow-in {
            from { background-position-x: 0; }
            to { background-position-x: -16px; }
          }
          @keyframes flow-out {
            from { background-position-x: 0; }
            to { background-position-x: 16px; }
          }

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
            color: var(--lcars-sky, #aaaaff);
            font-size: var(--lcars-font-size-sub);
            padding: 2rem 0;
            text-align: center;
          }

          /* ═══════ EDIT MODE — Edit Pips ═══════ */
          .edit-pip-wrap {
            position: relative;
          }
          .edit-pip {
            position: absolute;
            top: 4px;
            right: 8px;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: var(--lcars-lilac);
            cursor: pointer;
            z-index: 5;
            border: 1px solid rgba(0,0,0,0.3);
            animation: edit-pip-pulse 2s ease-in-out infinite;
          }
          .edit-pip:hover {
            transform: scale(1.5);
            background: var(--lcars-gold);
          }
          .edit-pip:focus-visible, .device-edit-pip:focus-visible {
            outline: 2px solid var(--lcars-ice);
            outline-offset: 2px;
            transform: scale(1.5);
          }
          @keyframes edit-pip-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          .device-edit-pip {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: var(--lcars-lilac);
            cursor: pointer;
            flex-shrink: 0;
            border: 1px solid rgba(0,0,0,0.3);
            animation: edit-pip-pulse 2s ease-in-out infinite;
          }
          .device-edit-pip:hover {
            transform: scale(1.5);
            background: var(--lcars-gold);
          }
          @media (prefers-reduced-motion: reduce) {
            .edit-pip, .device-edit-pip { animation: none; }
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
          .camera-frame[data-state="live"] img {
            animation: viewscreen-activate 600ms ease-out both;
          }
          .camera-frame[data-state="offline"] img {
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
            .camera-connecting-text { animation: none; }
            .toggle-pill[data-on],
            .climate-panel[data-heat],
            .climate-panel[data-cool],
            .media-strip:not([data-off]),
            .sensor-readout[data-off],
            .toggle-pill[data-off],
            .lcars-device-panel:has(.device-panel-media[data-offline]) { animation: none; }
            .alarm-triggered .alarm-shield,
            .alarm-triggered .alarm-viewscreen { animation: none; }
          }

          /* ═══════ CLIMATE PANEL ═══════ */
          .climate-panel {
            display: grid;
            grid-template-areas:
              "header   header"
              "sensors  media"
              "modes    modes"
              "auxctrl  auxctrl";
            grid-template-columns: minmax(10rem, 1fr) minmax(14rem, 2fr);
            grid-template-rows: auto 1fr auto auto;
            gap: var(--lcars-gap);
            border-left: 4px solid var(--panel-frame-color);
            border-bottom: 4px solid var(--panel-frame-color);
            border-top: 2px solid var(--panel-frame-color);
            border-right: 2px solid var(--panel-frame-color);
            transition: border-color 600ms;
          }
          .climate-header { grid-area: header; display: flex; align-items: center; gap: 0.5rem; }
          .climate-action-badge {
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            text-transform: uppercase;
            letter-spacing: 0.1em;
          }
          .climate-sensors { grid-area: sensors; overflow-y: auto; }
          .climate-viewscreen {
            grid-area: media;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            position: relative;
            cursor: pointer;
            border: 2px solid var(--panel-frame-color);
            border-radius: 4px;
            padding: 0.5rem;
            transition: border-color 600ms;
          }
          .climate-viewscreen::before,
          .climate-viewscreen::after {
            content: '';
            position: absolute;
            width: 1.5rem;
            height: 1.5rem;
            border: 2px solid var(--panel-frame-color);
          }
          .climate-viewscreen::before { top: 4px; left: 4px; border-right: none; border-bottom: none; }
          .climate-viewscreen::after { bottom: 4px; right: 4px; border-left: none; border-top: none; }
          .climate-arc { width: 100%; max-width: 200px; }
          .climate-setpoint-controls { display: flex; flex-direction: column; gap: 0.25rem; margin-top: 0.5rem; }
          .climate-setpoint-row { display: flex; align-items: center; gap: 0.5rem; justify-content: center; }
          .climate-sp-btn {
            width: 2.5rem;
            height: 2.5rem;
            border: none;
            border-radius: 50%;
            background: var(--lcars-disabled);
            color: var(--lcars-space-white);
            font-size: 1.25rem;
            font-family: var(--lcars-font);
            cursor: pointer;
            transition: background 200ms;
          }
          .climate-sp-btn:hover { background: var(--panel-frame-color); }
          .climate-sp-btn:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }
          .climate-sp-label {
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            min-width: 6rem;
            text-align: center;
          }
          .climate-modes {
            grid-area: modes;
            display: flex;
            gap: var(--lcars-gap);
            flex-wrap: wrap;
          }
          .climate-mode-btn {
            flex: 1;
            min-width: 4rem;
            height: var(--lcars-btn-height);
            border: none;
            border-radius: var(--lcars-btn-radius);
            background: var(--lcars-disabled);
            color: var(--lcars-black);
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            text-transform: uppercase;
            cursor: pointer;
            transition: background 200ms;
          }
          .climate-mode-btn[data-active] { background: var(--panel-frame-color); }
          .climate-mode-btn:hover:not([data-active]) { background: var(--lcars-gray); }
          .climate-mode-btn:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }
          .climate-aux-controls {
            grid-area: auxctrl;
            display: flex;
            flex-direction: column;
            gap: var(--lcars-gap);
          }
          .climate-aux-strip { display: flex; gap: var(--lcars-gap); flex-wrap: wrap; }

          /* ═══════ ALARM PANEL ═══════ */
          .alarm-panel {
            display: grid;
            grid-template-areas:
              "header  header"
              "sensors media"
              "keypad  keypad";
            grid-template-columns: minmax(10rem, 1fr) minmax(14rem, 2fr);
            grid-template-rows: auto 1fr auto;
            gap: var(--lcars-gap);
            border-left: 4px solid var(--panel-frame-color);
            border-bottom: 4px solid var(--panel-frame-color);
            border-top: 2px solid var(--panel-frame-color);
            border-right: 2px solid var(--panel-frame-color);
            transition: border-color 600ms;
          }
          .alarm-triggered {
            border-width: 6px;
            animation: alarm-pulse 1s ease-in-out infinite;
          }
          @keyframes alarm-pulse {
            0%, 100% { border-color: var(--lcars-tomato); }
            50% { border-color: transparent; }
          }
          .alarm-header { grid-area: header; display: flex; align-items: center; gap: 0.5rem; }
          .alarm-state-badge {
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            text-transform: uppercase;
            letter-spacing: 0.1em;
          }
          .alarm-sensors { grid-area: sensors; overflow-y: auto; }
          .alarm-viewscreen {
            grid-area: media;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
          }
          .alarm-shield { width: 100%; max-width: 140px; }
          .alarm-countdown {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .alarm-countdown-num {
            font-family: var(--lcars-font);
            font-size: 3rem;
            font-weight: bold;
          }
          .alarm-countdown-label {
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            color: var(--lcars-data-accent);
          }
          .alarm-arm-strip {
            display: flex;
            gap: var(--lcars-gap);
            width: 100%;
          }
          .alarm-arm-btn {
            flex: 1;
            height: var(--lcars-btn-height);
            border: none;
            border-radius: var(--lcars-btn-radius);
            background: var(--lcars-disabled);
            color: var(--lcars-black);
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            text-transform: uppercase;
            cursor: pointer;
            transition: background 200ms;
          }
          .alarm-arm-btn[data-active] { background: var(--panel-frame-color); }
          .alarm-arm-btn:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }
          .alarm-keypad {
            grid-area: keypad;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem;
          }
          .alarm-keypad:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }
          .alarm-code-display {
            display: flex;
            gap: 0.5rem;
          }
          .alarm-code-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            transition: background 200ms;
          }
          .alarm-pin-error { animation: alarm-shake 400ms ease-out; }
          @keyframes alarm-shake {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-6px); }
            40% { transform: translateX(6px); }
            60% { transform: translateX(-4px); }
            80% { transform: translateX(4px); }
          }
          .alarm-digit-grid {
            display: grid;
            grid-template-columns: repeat(3, 3.5rem);
            gap: var(--lcars-gap);
          }
          .alarm-digit-btn {
            height: 3.5rem;
            border: none;
            border-radius: var(--lcars-btn-radius);
            background: var(--lcars-sunflower);
            color: var(--lcars-black);
            font-family: var(--lcars-font);
            font-size: 1.25rem;
            cursor: pointer;
            transition: background 200ms;
          }
          .alarm-digit-btn:hover { filter: brightness(1.1); }
          .alarm-digit-btn:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }
          .alarm-action-btn { background: var(--lcars-disabled); }

          /* ═══════ MEDIA PANEL ═══════ */
          .media-panel {
            display: grid;
            grid-template-areas:
              "header   header"
              "metadata media"
              "volume   volume";
            grid-template-columns: minmax(8rem, 1fr) minmax(14rem, 2.5fr);
            grid-template-rows: auto 1fr auto;
            gap: var(--lcars-gap);
            border-left: 4px solid var(--panel-frame-color);
            border-bottom: 4px solid var(--panel-frame-color);
            border-top: 2px solid var(--panel-frame-color);
            border-right: 2px solid var(--panel-frame-color);
            transition: border-color 600ms;
          }
          .media-idle { opacity: 0.7; }
          .media-header { grid-area: header; display: flex; align-items: center; gap: 0.5rem; }
          .media-state-badge {
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            text-transform: uppercase;
          }
          .media-metadata { grid-area: metadata; overflow-y: auto; }
          .media-viewscreen {
            grid-area: media;
            display: flex;
            flex-direction: column;
            border: 2px solid var(--panel-frame-color);
            border-radius: 4px;
            overflow: hidden;
            cursor: pointer;
            position: relative;
          }
          .media-viewscreen::before,
          .media-viewscreen::after {
            content: '';
            position: absolute;
            width: 1.5rem;
            height: 1.5rem;
            border: 2px solid var(--panel-frame-color);
            z-index: 1;
          }
          .media-viewscreen::before { top: 4px; left: 4px; border-right: none; border-bottom: none; }
          .media-viewscreen::after { bottom: 4px; right: 4px; border-left: none; border-top: none; }
          .media-art {
            width: 100%;
            aspect-ratio: 1/1;
            max-height: 18rem;
            object-fit: cover;
          }
          .media-idle-display {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            aspect-ratio: 1/1;
            max-height: 12rem;
            color: var(--lcars-gray);
          }
          .media-idle-glyph { font-size: 3rem; }
          .media-idle-label { font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); }
          .media-now-playing {
            padding: 0.5rem;
            background: rgba(0,0,0,0.5);
          }
          .media-title {
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-sub);
            color: var(--lcars-sunflower);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .media-artist {
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            color: var(--lcars-african-violet);
          }
          .media-controls {
            grid-area: volume;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            padding: 0.5rem;
          }
          .media-transport {
            display: flex;
            justify-content: center;
            gap: var(--lcars-gap);
          }
          .media-transport-btn {
            width: 2.5rem;
            height: 2.5rem;
            border: none;
            border-radius: 50%;
            background: var(--lcars-disabled);
            color: var(--lcars-space-white);
            font-size: 1rem;
            cursor: pointer;
            transition: background 200ms;
          }
          .media-transport-btn:hover { background: var(--lcars-gray); }
          .media-transport-btn:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }
          .media-play-btn {
            width: 3.5rem;
            background: var(--lcars-african-violet);
            color: var(--lcars-black);
          }
          .media-transport-btn[aria-pressed="true"] { background: var(--lcars-african-violet); color: var(--lcars-black); }
          .media-volume {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          .media-mute-btn {
            border: none;
            background: transparent;
            font-size: 1.25rem;
            cursor: pointer;
          }
          .media-volume-bar {
            flex: 1;
            height: 0.75rem;
            background: var(--lcars-disabled);
            border-radius: var(--lcars-btn-radius);
            cursor: pointer;
            position: relative;
            overflow: hidden;
          }
          .media-volume-bar:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }
          .media-volume-fill {
            height: 100%;
            background: var(--lcars-african-violet);
            border-radius: inherit;
            transition: width 200ms;
          }
          .media-volume-pct {
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            color: var(--lcars-data-accent);
            min-width: 3rem;
            text-align: right;
          }

          /* ═══════ POOL & SPA PANEL ═══════ */
          .pool-panel {
            display: grid;
            grid-template-areas:
              "header    header    header"
              "chemistry aquatics  controls"
              "lighting  lighting  lighting";
            grid-template-columns: minmax(8rem, 1fr) minmax(20rem, 3fr) minmax(8rem, 1.2fr);
            grid-template-rows: auto 1fr auto;
            gap: var(--lcars-gap);
            grid-column: 1 / -1;
            border-left: 4px solid var(--panel-frame-color);
            border-bottom: 4px solid var(--panel-frame-color);
            border-top: 2px solid var(--panel-frame-color);
            border-right: 2px solid var(--panel-frame-color);
          }
          .pool-no-chem {
            grid-template-areas:
              "header   header"
              "aquatics controls"
              "lighting lighting";
            grid-template-columns: minmax(20rem, 3fr) minmax(8rem, 1.2fr);
          }
          .pool-header { grid-area: header; display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
          .pool-temp-badge {
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            margin-left: 0.5rem;
          }
          .pool-chemistry { grid-area: chemistry; overflow-y: auto; }
          .pool-aquatics {
            grid-area: aquatics;
            display: flex;
            gap: var(--lcars-gap);
            justify-content: center;
          }
          .pool-body-frame {
            flex: 1;
            border: 2px solid var(--body-color);
            border-radius: 4px;
            padding: 0.5rem;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.25rem;
            position: relative;
          }
          .pool-body-frame::before,
          .pool-body-frame::after {
            content: '';
            position: absolute;
            width: 1.5rem;
            height: 1.5rem;
            border: 2px solid var(--body-color);
          }
          .pool-body-frame::before { top: 4px; left: 4px; border-right: none; border-bottom: none; }
          .pool-body-frame::after { bottom: 4px; right: 4px; border-left: none; border-top: none; }
          .pool-body-label {
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            text-transform: uppercase;
            letter-spacing: 0.1em;
          }
          .pool-body-temp {
            font-family: var(--lcars-font);
            font-size: 2.5rem;
            font-weight: bold;
            color: var(--body-color);
          }
          .pool-setpoint-row { display: flex; align-items: center; gap: 0.5rem; }
          .pool-target {
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
          }
          .pool-controls { grid-area: controls; display: flex; flex-direction: column; gap: var(--lcars-gap); }
          .pool-lighting {
            grid-area: lighting;
            display: flex;
            gap: var(--lcars-gap);
            flex-wrap: wrap;
          }

          /* ═══════ WEATHER PANEL ═══════ */
          .weather-panel {
            display: grid;
            grid-template-areas:
              "header   header"
              "sensors  media"
              "forecast forecast";
            grid-template-columns: minmax(10rem, 1fr) minmax(14rem, 2fr);
            grid-template-rows: auto 1fr auto;
            gap: var(--lcars-gap);
            border-left: 4px solid var(--panel-frame-color);
            border-bottom: 4px solid var(--panel-frame-color);
            border-top: 2px solid var(--panel-frame-color);
            border-right: 2px solid var(--panel-frame-color);
            transition: border-color 600ms;
          }
          .weather-header { grid-area: header; display: flex; align-items: center; gap: 0.5rem; }
          .weather-condition-badge {
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            text-transform: uppercase;
          }
          .weather-sensors { grid-area: sensors; overflow-y: auto; }
          .weather-viewscreen {
            grid-area: media;
            display: flex;
            flex-direction: column;
            align-items: center;
            border: 2px solid var(--panel-frame-color);
            border-radius: 4px;
            padding: 0.5rem;
            transition: border-color 600ms;
          }
          .weather-viewscreen::before,
          .weather-viewscreen::after {
            content: '';
            position: absolute;
            width: 1.5rem;
            height: 1.5rem;
            border: 2px solid var(--panel-frame-color);
          }
          .weather-viewscreen::before { top: 4px; left: 4px; border-right: none; border-bottom: none; }
          .weather-viewscreen::after { bottom: 4px; right: 4px; border-left: none; border-top: none; }
          .weather-display { width: 100%; max-width: 200px; }
          .weather-wind-compass {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.25rem;
          }
          .wind-svg { width: 5rem; height: 5rem; }
          .wind-reading {
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            color: var(--lcars-data-accent);
          }
          .weather-forecast {
            grid-area: forecast;
            display: flex;
            gap: var(--lcars-gap);
            overflow-x: auto;
            padding: 0.25rem 0;
          }
          .forecast-tile {
            flex: 1;
            min-width: 5rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.125rem;
            padding: 0.25rem;
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
          }
          .forecast-tile:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }
          .forecast-day { color: var(--lcars-data-accent); }
          .forecast-glyph { font-size: 1.25rem; }
          .forecast-hi { color: var(--lcars-butterscotch); }
          .forecast-lo { color: var(--lcars-ice); }
          .forecast-range-bar {
            width: 100%;
            height: 4px;
            background: var(--lcars-disabled);
            border-radius: 2px;
            position: relative;
          }
          .forecast-range-fill {
            position: absolute;
            height: 100%;
            background: var(--lcars-butterscotch);
            border-radius: 2px;
          }
          .forecast-precip { color: var(--lcars-gray); font-size: 0.75rem; }

          /* ═══════ IRRIGATION PANEL ═══════ */
          .irrigation-panel {
            display: grid;
            grid-template-areas:
              "header   header"
              "schedule zones"
              "standby  standby";
            grid-template-columns: minmax(8rem, 1fr) minmax(16rem, 3fr);
            grid-template-rows: auto 1fr auto;
            gap: var(--lcars-gap);
            border-left: 4px solid var(--panel-frame-color);
            border-bottom: 4px solid var(--panel-frame-color);
            border-top: 2px solid var(--panel-frame-color);
            border-right: 2px solid var(--panel-frame-color);
          }
          .irrigation-header { grid-area: header; display: flex; align-items: center; gap: 0.5rem; }
          .irrigation-status-badge {
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            text-transform: uppercase;
          }
          .irrigation-schedule { grid-area: schedule; overflow-y: auto; }
          .irrigation-zones {
            grid-area: zones;
            display: flex;
            flex-direction: column;
            gap: var(--lcars-gap);
            overflow-y: auto;
          }
          .irrigation-zone-row {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            position: relative;
          }
          .irrigation-zone-row:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }
          .irrigation-zone-btn {
            min-width: 4.5rem;
            height: var(--lcars-btn-height);
            border: none;
            border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
            background: var(--lcars-sunflower);
            color: var(--lcars-black);
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            text-transform: uppercase;
            cursor: pointer;
            transition: background 200ms;
          }
          .irrigation-zone-btn[data-on] { background: var(--lcars-ice); }
          .irrigation-zone-btn:disabled { opacity: 0.4; cursor: not-allowed; }
          .irrigation-zone-btn:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }
          .irrigation-zone-name {
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            color: var(--lcars-space-white);
            flex: 1;
          }
          .irrigation-zone-status {
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            text-transform: uppercase;
          }
          .irrigation-zone-fill {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 0.5rem;
            border-radius: 0.25rem;
            transition: width 1s linear;
          }
          .irrigation-standby {
            grid-area: standby;
            display: flex;
            justify-content: center;
            padding: 0.25rem;
          }
          .irrigation-standby-btn { min-width: 10rem; }

          /* ═══════ POWER PANEL (4X-3) ═══════ */
          .power-panel {
            --panel-frame-color: var(--lcars-butterscotch);
            display: grid;
            grid-template-areas:
              "header"
              "arc"
              "summary"
              "circuits"
              "devices"
              "strips";
            grid-template-columns: 1fr;
            grid-template-rows: auto auto auto auto auto auto;
            gap: var(--lcars-gap);
          }
          .power-panel[data-alert="critical"] {
            --panel-frame-color: var(--lcars-tomato);
            animation: lcars-distress-pulse var(--lcars-anim-pulse-urgent, 1s) ease-in-out infinite;
            --pulse-color-a: var(--lcars-tomato);
            --pulse-color-b: rgba(255, 85, 85, 0.3);
          }
          /* Header */
          .power-panel-header {
            grid-area: header;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.25rem 0.75rem;
            min-height: var(--lcars-bar-h);
          }
          .power-panel-header ha-icon {
            --mdc-icon-size: 20px;
            color: var(--panel-frame-color);
            flex-shrink: 0;
          }
          .power-panel-name {
            font-size: var(--lcars-font-size-sub);
            color: var(--lcars-text-heading);
            text-transform: uppercase;
            letter-spacing: 0.05em;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .power-panel-header-line {
            flex: 1;
            height: 2px;
            background: var(--panel-frame-color);
          }
          .power-panel-badge {
            font-size: var(--lcars-font-size-data);
            color: var(--lcars-data-accent, var(--lcars-ice));
            text-transform: uppercase;
            white-space: nowrap;
          }
          /* SVG Arc */
          .power-arc-area { grid-area: arc; display: flex; justify-content: center; }
          .power-distribution-arc {
            width: 100%;
            max-width: 15rem;
            height: auto;
          }
          /* Summary */
          .power-summary {
            grid-area: summary;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr));
            gap: var(--lcars-gap);
          }
          .power-summary-card {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
            padding: 0.5rem 0.75rem;
            border-left: 3px solid var(--card-accent, var(--lcars-butterscotch));
            border-radius: 0 0.25rem 0.25rem 0;
            background: rgba(255, 255, 255, 0.03);
            min-width: 8rem;
          }
          .power-summary-label {
            font-size: var(--lcars-font-size-data);
            color: var(--lcars-ice);
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .power-summary-value {
            font-size: var(--lcars-font-size-title);
            font-weight: 700;
            text-transform: uppercase;
          }
          .power-summary-secondary {
            font-size: var(--lcars-font-size-data);
            color: var(--lcars-space-white);
            opacity: 0.8;
          }
          /* Section labels */
          .power-section-label {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.25rem 0;
            margin-top: 0.25rem;
          }
          .power-section-label-text {
            font-size: var(--lcars-font-size-sub);
            color: var(--lcars-text-heading);
            text-transform: uppercase;
            white-space: nowrap;
            flex-shrink: 0;
            text-wrap: balance;
          }
          .power-section-label-rule {
            flex: 1;
            height: 2px;
            background: var(--panel-frame-color);
            opacity: 0.5;
          }
          .power-section-label-count {
            font-size: var(--lcars-font-size-data);
            color: var(--lcars-ice);
            white-space: nowrap;
            flex-shrink: 0;
          }
          /* Circuit tile grid */
          .power-circuits {
            grid-area: circuits;
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
            gap: var(--lcars-gap);
            max-height: 24rem;
            overflow-y: auto;
            mask-image: linear-gradient(to bottom, black calc(100% - 2rem), transparent 100%);
            -webkit-mask-image: linear-gradient(to bottom, black calc(100% - 2rem), transparent 100%);
          }
          .power-circuit-tile {
            display: flex;
            flex-direction: column;
            gap: 0.125rem;
            padding: 0.375rem 0.5rem;
            background: rgba(255, 255, 255, 0.03);
            border-left: 3px solid var(--circuit-color, var(--lcars-ice));
            border-radius: 0 0.25rem 0.25rem 0;
            cursor: pointer;
            transition: background var(--lcars-transition);
            min-height: 3rem;
          }
          .power-circuit-tile:hover { background: rgba(255, 255, 255, 0.06); }
          .power-circuit-tile:focus-visible {
            outline: 2px solid var(--lcars-ice);
            outline-offset: 2px;
          }
          .power-circuit-name {
            display: flex;
            align-items: center;
            gap: 0.375rem;
            font-size: var(--lcars-font-size-data);
            color: var(--lcars-space-white);
            text-transform: uppercase;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .power-circuit-indicator {
            flex-shrink: 0;
            font-size: 0.625rem;
            color: var(--circuit-color, var(--lcars-ice));
          }
          .power-circuit-value-row {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          .power-circuit-watts {
            font-size: var(--lcars-font-size-data);
            font-weight: 700;
            color: var(--circuit-color, var(--lcars-ice));
            white-space: nowrap;
          }
          .power-circuit-energy {
            font-size: 0.75rem;
            color: var(--lcars-space-white);
            opacity: 0.6;
            text-transform: uppercase;
          }
          /* Device rows (switch + monitor) */
          .power-devices {
            grid-area: devices;
            display: flex;
            flex-direction: column;
            gap: var(--lcars-gap);
          }
          .power-device-row {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.25rem 0.5rem;
            border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
            transition: background var(--lcars-transition);
            cursor: pointer;
            min-height: 2.5rem;
          }
          .power-device-row:hover { background: rgba(255, 255, 255, 0.05); }
          .power-device-row:focus-visible {
            outline: 2px solid var(--lcars-ice);
            outline-offset: 2px;
          }
          /* ── LCARS sliding track toggle ── */
          .lcars-track-toggle {
            position: relative;
            display: inline-flex;
            align-items: center;
            width: 3.25rem;
            height: 1.5rem;
            border-radius: 0.75rem;
            border: none;
            cursor: pointer;
            background: var(--lcars-gray);
            padding: 0 0.25rem;
            flex-shrink: 0;
            transition: background var(--lcars-transition);
            overflow: hidden;
          }
          .lcars-track-toggle[data-on] {
            background: var(--lcars-gold);
          }
          .lcars-track-toggle .track-label {
            position: absolute;
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-label, 0.75rem);
            font-weight: 700;
            text-transform: uppercase;
            line-height: 1;
            pointer-events: none;
            transition: left var(--lcars-transition), right var(--lcars-transition), color var(--lcars-transition);
          }
          .lcars-track-toggle:not([data-on]) .track-label {
            right: 0.35rem;
            left: auto;
            color: var(--lcars-space-white);
          }
          .lcars-track-toggle[data-on] .track-label {
            left: 0.35rem;
            right: auto;
            color: var(--lcars-black);
          }
          .lcars-track-toggle .track-thumb {
            position: absolute;
            width: 1.1rem;
            height: 1.1rem;
            border-radius: 50%;
            background: var(--lcars-space-white);
            top: 0.2rem;
            transition: left var(--lcars-transition);
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
          }
          .lcars-track-toggle:not([data-on]) .track-thumb {
            left: 0.2rem;
          }
          .lcars-track-toggle[data-on] .track-thumb {
            left: calc(100% - 1.3rem);
          }
          .lcars-track-toggle:focus-visible {
            outline: 2px solid var(--lcars-ice);
            outline-offset: 2px;
          }
          .power-device-name {
            flex: 1;
            font-size: var(--lcars-font-size-data);
            color: var(--lcars-space-white);
            text-transform: uppercase;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .power-device-stats {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            flex-shrink: 0;
          }
          .power-device-watts {
            font-size: var(--lcars-font-size-data);
            font-weight: 700;
            color: var(--circuit-color, var(--lcars-ice));
            white-space: nowrap;
            min-width: 4rem;
            text-align: right;
          }
          .power-device-energy {
            font-size: var(--lcars-font-size-data);
            color: var(--lcars-space-white);
            opacity: 0.7;
            white-space: nowrap;
            min-width: 4rem;
            text-align: right;
          }
          /* Power strip blocks */
          .power-strips {
            grid-area: strips;
            display: flex;
            flex-direction: column;
            gap: calc(var(--lcars-gap) * 2);
          }
          .power-strip-block {
            border: 1px solid var(--lcars-butterscotch);
            border-left-width: 3px;
            border-radius: 0.5rem;
            padding: var(--lcars-gap);
          }
          .power-strip-header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.25rem 0.5rem;
            margin-bottom: var(--lcars-gap);
          }
          .power-strip-name {
            font-size: var(--lcars-font-size-sub);
            color: var(--lcars-text-heading);
            text-transform: uppercase;
            text-wrap: balance;
            flex: 1;
          }
          .power-strip-master-toggle {
            /* Legacy — replaced by lcars-track-toggle */
            display: none;
          }
          .power-strip-master-toggle[data-on] {
            display: none;
          }
          .power-strip-total {
            font-size: var(--lcars-font-size-data);
            color: var(--lcars-butterscotch);
            font-weight: 700;
            white-space: nowrap;
          }
          .power-strip-divider {
            height: 1px;
            background: var(--panel-frame-color);
            opacity: 0.3;
            margin-bottom: var(--lcars-gap);
          }
          .power-strip-children {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr));
            gap: var(--lcars-gap);
          }
          .power-strip-child-tile {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
            padding: 0.375rem 0.5rem;
            border-left: 3px solid var(--tile-power-color, var(--lcars-gray));
            min-height: 3.5rem;
          }
          .strip-child-controls {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 0.25rem;
          }
          .strip-child-toggle {
            /* Legacy — replaced by lcars-track-toggle */
            display: none;
          }
          .strip-child-toggle[data-on] {
            display: none;
          }
          /* Popover (singleton) */
          .power-detail-popover {
            margin: auto;
            padding: 0;
            border: none;
            background: transparent;
            overflow: visible;
            max-width: min(26rem, 90vw);
            min-width: 18rem;
            opacity: 0;
            transform: translateY(0.5rem) scale(0.98);
            transition:
              opacity var(--lcars-transition-slow, 300ms) ease-out,
              transform var(--lcars-transition-slow, 300ms) ease-out,
              overlay var(--lcars-transition-slow, 300ms) allow-discrete,
              display var(--lcars-transition-slow, 300ms) allow-discrete;
          }
          .power-detail-popover:popover-open {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          .power-detail-popover::backdrop {
            background: rgba(0, 0, 0, 0.5);
          }
          .popover-content {
            background: var(--lcars-black);
            border: 2px solid var(--lcars-butterscotch);
            border-left-width: 4px;
            border-radius: 0.75rem;
            padding: 0.75rem;
            font-family: var(--lcars-font);
            color: var(--lcars-text);
            text-transform: uppercase;
          }
          .popover-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid var(--lcars-gray);
            margin-bottom: 0.5rem;
          }
          .popover-title {
            font-size: var(--lcars-font-size-sub);
            color: var(--lcars-text-heading);
          }
          .popover-status {
            font-size: var(--lcars-font-size-data);
            font-weight: 700;
          }
          .popover-hero-value {
            font-size: 2.5rem;
            font-weight: 700;
            text-align: center;
            padding: 0.5rem 0;
          }
          .popover-sparkline { padding: 0.5rem 0; }
          .popover-sparkline-label {
            display: block;
            font-size: 0.6rem;
            color: var(--lcars-gray);
            text-align: center;
            margin-top: 0.25rem;
          }
          .popover-stats {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
            padding: 0.5rem 0;
          }
          .popover-stat-row {
            display: flex;
            justify-content: space-between;
            font-size: var(--lcars-font-size-data);
          }
          .popover-stat-label { color: var(--lcars-space-white); opacity: 0.7; }
          .popover-stat-value { color: var(--lcars-ice); font-weight: 700; }
          .popover-history-btn {
            width: 100%;
            margin-top: 0.5rem;
            display: flex;
            justify-content: center;
            background: var(--lcars-butterscotch);
            color: var(--lcars-black);
            border: none;
            border-radius: var(--lcars-btn-radius);
            padding: 0.375rem 0.75rem;
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            text-transform: uppercase;
            cursor: pointer;
          }
          /* Scroll-driven tile animations */
          @supports (animation-timeline: view()) {
            .power-circuit-tile {
              animation: circuit-energize linear both;
              animation-timeline: view();
              animation-range: entry 0% entry 40%;
            }
            @keyframes circuit-energize {
              from {
                opacity: 0;
                border-left-color: var(--lcars-disabled);
                transform: translateX(-0.25rem);
              }
              to {
                opacity: 1;
                border-left-color: var(--circuit-color, var(--lcars-ice));
                transform: translateX(0);
              }
            }
          }
          @supports not (animation-timeline: view()) {
            .power-circuit-tile { opacity: 1; }
          }
          /* Responsive */
          @media (max-width: 1023px) {
            .power-circuits {
              grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr));
            }
            .power-summary {
              grid-template-columns: repeat(auto-fit, minmax(7rem, 1fr));
            }
          }
          @media (max-width: 767px) {
            .power-circuits {
              grid-template-columns: 1fr 1fr;
              max-height: 16rem;
            }
            .power-summary {
              grid-template-columns: 1fr;
            }
            .power-device-row {
              flex-direction: column;
              align-items: stretch;
            }
          }
          @media (max-width: 479px) {
            .power-circuits {
              grid-template-columns: 1fr;
            }
          }

          /* ═══════════════════════════════════════════════════════════
             v4.13.0 — VISUAL ENHANCEMENTS (All Panels)
             Phase 1: Device Panel Base (cascades to all)
             ═══════════════════════════════════════════════════════════ */

          /* ── 1.1 Frame Breathing Pulse ── */
          .lcars-device-panel {
            animation: lcars-frame-breathe var(--lcars-anim-breathe) ease-in-out infinite;
          }

          /* ── 1.2 Data Pip Footer Strip ── */
          .lcars-device-panel .panel-pip-strip {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: var(--panel-frame-color);
            pointer-events: none;
            border-radius: 0 0 0.25rem 0.75rem;
          }

          /* ── 1.3 Header Numeric Code Watermark ── */
          .panel-numeric-code {
            position: absolute;
            right: var(--lcars-gap);
            top: 50%;
            transform: translateY(-50%);
            font-family: var(--lcars-font);
            font-size: 0.625rem;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            color: var(--lcars-gray);
            opacity: 0.4;
            pointer-events: none;
            user-select: none;
          }

          /* ── 1.4 Button Press Ripple Flash ── */
          .device-control-btn {
            position: relative;
            overflow: hidden;
          }
          .device-control-btn::after {
            content: '';
            position: absolute;
            top: 50%; left: 50%;
            width: 1rem; height: 1rem;
            margin: -0.5rem 0 0 -0.5rem;
            border-radius: 50%;
            background: var(--lcars-space-white);
            opacity: 0;
            pointer-events: none;
          }
          .device-control-btn:active::after {
            animation: lcars-button-flash var(--lcars-anim-flash) ease-out forwards;
          }

          /* ── 1.5 Viewscreen Power-On Scanline ── */
          .device-panel-media .scanline-overlay {
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            pointer-events: none;
            overflow: hidden;
            z-index: 2;
          }
          .device-panel-media .scanline-overlay::before {
            content: '';
            position: absolute;
            top: -2px; left: 0; right: 0;
            height: 2px;
            background: linear-gradient(90deg, transparent, var(--lcars-space-white) 50%, transparent);
            opacity: 0;
            transform: translateY(-100%);
          }
          .device-panel-media.scanning .scanline-overlay::before {
            animation: lcars-scanline var(--lcars-anim-scan) ease-out forwards;
          }

          /* ═══════ Phase 3: CLIMATE v4.13.0 ═══════ */

          /* ── 3.1 Arc Gauge Segmented Stroke ── */
          .climate-arc-fill {
            stroke-dasharray: 6 2;
            stroke-linecap: butt;
            transition: stroke-dashoffset 800ms ease-in-out;
          }
          .climate-arc-flash {
            animation: lcars-setpoint-confirm var(--lcars-anim-confirm) ease-out forwards;
          }

          /* ── 3.2 HVAC Action Frame Pulse ── */
          .lcars-device-panel[data-hvac-action="heating"] {
            animation: lcars-hvac-pulse var(--lcars-anim-pulse) ease-in-out infinite;
            --pulse-color: var(--lcars-butterscotch);
          }
          .lcars-device-panel[data-hvac-action="cooling"] {
            animation: lcars-hvac-pulse var(--lcars-anim-pulse) ease-in-out infinite;
            --pulse-color: var(--lcars-ice);
          }
          @keyframes lcars-hvac-pulse {
            0%, 100% { border-color: var(--pulse-color); }
            50%      { border-color: var(--pulse-color); border-color: color-mix(in srgb, var(--pulse-color) 70%, black); }
          }

          /* ── 3.3 Setpoint Button Glow ── */
          .lcars-target-temp.confirm {
            animation: lcars-setpoint-confirm var(--lcars-anim-confirm) ease-out forwards;
          }

          /* ── 3.4 Mode Strip Active Indicator ── */
          .lcars-mode-strip {
            position: relative;
          }
          .lcars-mode-strip .mode-indicator {
            position: absolute;
            bottom: 0;
            height: 2px;
            background: var(--lcars-gold);
            transition: transform 300ms ease-out, width 300ms ease-out;
            transform: translateX(var(--indicator-x, 0));
            width: var(--indicator-w, 3rem);
          }

          /* ── 3.5 Ambient Temperature Data Pips ── */
          .climate-temp-pips {
            display: flex;
            gap: 2px;
            padding: 0.25rem 0;
          }
          .climate-temp-pips .pip {
            width: 4px;
            height: 4px;
            border-radius: 1px;
            opacity: 0;
            transition: opacity 500ms ease-out;
          }
          .climate-temp-pips .pip.visible {
            opacity: 1;
          }

          /* ═══════ Phase 4: MEDIA v4.13.0 ═══════ */

          /* ── 4.1 Audio Waveform (12 bars, scaleY — Data C-1/C-2) ── */
          .lcars-audio-waveform {
            display: flex;
            align-items: flex-end;
            justify-content: center;
            gap: 2px;
            height: 32px;
            overflow: hidden;
          }
          .lcars-audio-waveform .bar {
            width: 2px;
            border-radius: 1px 1px 0 0;
            background: var(--lcars-ice);
            height: 60%;
            transform-origin: bottom;
            transform: scaleY(var(--bar-min-ratio, 0.17));
            will-change: transform;
            animation: lcars-waveform var(--bar-dur, 400ms) ease-in-out alternate infinite;
            animation-delay: var(--bar-delay, 0ms);
          }
          .lcars-audio-waveform .bar.peak {
            background: var(--lcars-tomato);
          }
          .lcars-audio-waveform[data-paused] .bar {
            animation-play-state: paused;
            transform: scaleY(0.03);
            opacity: 0.3;
          }
          @keyframes lcars-waveform {
            0%   { transform: scaleY(var(--bar-min-ratio, 0.17)); }
            100% { transform: scaleY(1); }
          }

          /* ── 4.2 Album Art Viewscreen Glow ── */
          .media-viewscreen-glow {
            box-shadow: 0 0 12px 4px var(--lcars-african-violet);
            animation: lcars-media-glow 3s ease-in-out infinite;
          }
          @keyframes lcars-media-glow {
            0%, 100% { box-shadow: 0 0 6px 2px var(--lcars-african-violet); }
            50%      { box-shadow: 0 0 14px 6px var(--lcars-african-violet); }
          }

          /* ── 4.3 Transport Active State ── */
          .media-transport-btn.active {
            box-shadow: 0 0 6px 1px var(--lcars-african-violet);
          }
          .media-transport-btn.active::before {
            content: '';
            position: absolute;
            bottom: 2px; left: 50%;
            width: 4px; height: 4px;
            margin-left: -2px;
            border-radius: 50%;
            background: var(--lcars-african-violet);
          }

          /* ── 4.4 Progress Bar Luminous Head ── */
          .media-progress-fill::after {
            content: '';
            position: absolute;
            right: -2px; top: -1px;
            width: 4px; height: calc(100% + 2px);
            border-radius: 2px;
            background: var(--lcars-gold);
            box-shadow: 0 0 6px 2px var(--lcars-gold);
            animation: lcars-progress-glow var(--lcars-anim-pulse) ease-in-out infinite;
          }
          @keyframes lcars-progress-glow {
            0%, 100% { box-shadow: 0 0 4px 1px var(--lcars-gold); }
            50%      { box-shadow: 0 0 8px 3px var(--lcars-gold); }
          }

          /* ── 4.5 Idle Standby Pulse ── */
          .media-idle-glyph {
            font-size: 2rem;
            color: var(--lcars-african-violet);
            opacity: 0.4;
            animation: lcars-standby-pulse var(--lcars-anim-breathe) ease-in-out infinite;
          }
          @keyframes lcars-standby-pulse {
            0%, 100% { opacity: 0.3; }
            50%      { opacity: 0.6; }
          }

          /* ═══════ Phase 5: ALARM v4.13.0 ═══════ */

          /* ── 5.1 Red Alert Frame Strobe ── */
          .lcars-device-panel[data-state="triggered"] {
            animation: lcars-red-alert var(--lcars-anim-pulse-urgent) linear infinite;
            box-shadow: 0 0 20px var(--lcars-tomato);
          }
          @keyframes lcars-red-alert {
            0%, 100% { border-color: var(--lcars-tomato); box-shadow: 0 0 20px var(--lcars-tomato); }
            50%      { border-color: var(--lcars-tomato); border-color: color-mix(in srgb, var(--lcars-tomato) 40%, black); box-shadow: 0 0 8px var(--lcars-tomato); box-shadow: color-mix(in srgb, var(--lcars-tomato) 40%, black); }
          }

          /* ── 5.2 Shield Icon Reactive Glow ── */
          .alarm-shield-icon {
            transition: filter 500ms ease-out;
          }
          .alarm-shield-icon[data-glow="ice"] {
            filter: drop-shadow(0 0 8px var(--lcars-ice));
          }
          .alarm-shield-icon[data-glow="butterscotch"] {
            filter: drop-shadow(0 0 8px var(--lcars-butterscotch));
          }
          .alarm-shield-icon[data-glow="butterscotch-pulse"] {
            filter: drop-shadow(0 0 8px var(--lcars-butterscotch));
            animation: lcars-shield-armed 3s ease-in-out infinite;
          }
          .alarm-shield-icon[data-glow="tomato"] {
            filter: drop-shadow(0 0 12px var(--lcars-tomato));
            /* Worf M1: MUST NOT shorten below 0.34s (WCAG 2.3.1) */
            animation: lcars-shield-critical 0.5s linear infinite;
          }
          @keyframes lcars-shield-armed {
            0%, 100% { filter: drop-shadow(0 0 6px var(--lcars-butterscotch)); }
            50%      { filter: drop-shadow(0 0 12px var(--lcars-butterscotch)); }
          }
          @keyframes lcars-shield-critical {
            0%, 100% { filter: drop-shadow(0 0 12px var(--lcars-tomato)); }
            50%      { filter: drop-shadow(0 0 20px var(--lcars-tomato)); }
          }

          /* ── 5.3 Keypad Tactile Flash ── */
          .alarm-key {
            position: relative;
          }
          .alarm-key:active::before {
            content: attr(data-digit);
            position: absolute;
            top: -1rem;
            left: 50%;
            transform: translateX(-50%);
            font-size: 1.5rem;
            color: var(--lcars-space-white);
            opacity: 0;
            animation: lcars-key-preview 200ms ease-out forwards;
            pointer-events: none;
          }
          @keyframes lcars-key-preview {
            0%   { opacity: 0.8; transform: translateX(-50%) translateY(0); }
            100% { opacity: 0;   transform: translateX(-50%) translateY(-0.75rem); }
          }

          /* ── 5.4 Countdown Urgency Escalation ── */
          .alarm-countdown[data-urgency="calm"]     { color: var(--lcars-sunflower); }
          .alarm-countdown[data-urgency="elevated"] { color: var(--lcars-golden-orange); animation: lcars-urgency-blink var(--lcars-anim-pulse) ease-in-out infinite; }
          .alarm-countdown[data-urgency="high"]     { color: var(--lcars-tomato); animation: lcars-urgency-blink var(--lcars-anim-pulse-urgent) ease-in-out infinite; }
          .alarm-countdown[data-urgency="critical"] { color: var(--lcars-tomato); animation: lcars-urgency-critical 0.5s ease-in-out infinite; }
          @keyframes lcars-urgency-blink {
            0%, 100% { opacity: 1; }
            50%      { opacity: 0.5; }
          }
          @keyframes lcars-urgency-critical {
            0%, 100% { transform: scale(1); opacity: 1; }
            50%      { transform: scale(1.05); opacity: 0.7; }
          }

          /* ── 5.5 Zone Status Micro-Pips ── */
          .alarm-zone-pip {
            width: 6px; height: 6px;
            border-radius: 50%;
            flex-shrink: 0;
            transition: background 300ms ease-out;
          }
          .alarm-zone-pip.ok      { background: var(--lcars-ice); }
          .alarm-zone-pip.bypass  { background: var(--lcars-butterscotch); }
          .alarm-zone-pip.fault   { background: var(--lcars-tomato); }
          .alarm-zone-pip.flash {
            animation: lcars-pip-flash 300ms ease-out;
          }
          @keyframes lcars-pip-flash {
            0%   { transform: scale(1.5); background: var(--lcars-space-white); }
            100% { transform: scale(1); }
          }

          /* ═══════ Phase 6: WEATHER v4.13.0 ═══════ */

          /* ── 6.1 Weather Condition Feedback ── */
          .weather-viewscreen {
            position: relative;
            border-color: var(--weather-glow-color, var(--panel-frame-color));
            transition: border-color 1s ease-out;
          }

          /* ── 6.2 Wind Compass Needle ── */
          .wind-compass {
            position: relative;
            width: 3rem; height: 3rem;
          }
          .wind-needle {
            position: absolute;
            top: 50%; left: 50%;
            width: 2px; height: 40%;
            margin-left: -1px; margin-top: -40%;
            background: var(--lcars-ice);
            transform-origin: bottom center;
            transform: rotate(var(--wind-deg, 0deg));
            transition: transform 800ms ease-out;
            border-radius: 1px;
          }
          .wind-compass.gusty .wind-needle {
            animation: lcars-gust-oscillate 0.8s ease-in-out infinite alternate;
          }
          @keyframes lcars-gust-oscillate {
            0%   { transform: rotate(calc(var(--wind-deg, 0deg) - 5deg)); }
            100% { transform: rotate(calc(var(--wind-deg, 0deg) + 5deg)); }
          }

          /* ── 6.3 Forecast Range Bars ── */
          .forecast-range-bar {
            width: 3px;
            transform-origin: bottom;
            transform: scaleY(0);
            animation: lcars-bar-grow 400ms ease-out forwards;
            animation-delay: calc(var(--day-index, 0) * 60ms);
            border-radius: 1px;
          }
          @keyframes lcars-bar-grow {
            to { transform: scaleY(1); }
          }

          /* ── 6.4 Sun Arc ── */
          .sun-arc-track {
            stroke: var(--lcars-gray);
            stroke-width: 2;
            fill: none;
            opacity: 0.3;
          }
          .sun-arc-progress {
            stroke: var(--lcars-sunflower);
            stroke-width: 2;
            fill: none;
            transition: stroke-dashoffset 60s linear;
          }
          .sun-dot {
            fill: var(--lcars-gold);
            filter: drop-shadow(0 0 4px var(--lcars-gold));
            transition: cx 60s linear, cy 60s linear;
          }

          /* ── 6.5 Precip Pips ── */
          .precip-pips {
            display: grid;
            grid-template-columns: repeat(5, 4px);
            grid-template-rows: repeat(2, 4px);
            gap: 1px;
          }
          .precip-pips .pip {
            width: 4px; height: 4px;
            border-radius: 1px;
            background: var(--lcars-gray);
            opacity: 0.3;
          }
          .precip-pips .pip.filled {
            background: var(--lcars-ice);
            opacity: 1;
          }

          /* ═══════ Phase 7: POOL/SPA v4.13.0 ═══════ */

          /* ── 7.2 Heating Active Indicator ── */
          .pool-heat-bar {
            height: 3px;
            background: var(--lcars-gray);
            border-radius: 1px;
            overflow: hidden;
            position: relative;
          }
          .pool-heat-bar.heating {
            background: linear-gradient(90deg, var(--lcars-tomato), var(--lcars-golden-orange), var(--lcars-butterscotch));
            background-size: 200% 100%;
            animation: lcars-heat-flow var(--lcars-anim-pulse) linear infinite;
          }
          @keyframes lcars-heat-flow {
            0%   { background-position: 0% 0; }
            100% { background-position: 200% 0; }
          }

          /* ── 7.3 Chemistry Sensor Badges ── */
          .chem-badge {
            display: inline-flex;
            gap: 0.25rem;
            padding: 0.125rem 0.5rem;
            border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
            font-size: 0.7rem;
            text-transform: uppercase;
          }
          .chem-badge[data-threshold="ok"]   { background: var(--lcars-ice); color: var(--lcars-black); }
          .chem-badge[data-threshold="warn"] { background: var(--lcars-golden-orange); color: var(--lcars-black); }
          .chem-badge[data-threshold="critical"] {
            background: var(--lcars-tomato);
            color: var(--lcars-black);
            animation: lcars-chem-alert 1.5s ease-in-out infinite;
          }
          @keyframes lcars-chem-alert {
            0%, 100% { opacity: 1; }
            50%      { opacity: 0.6; }
          }

          /* ── 7.4 IntelliBrite Swatch Glow ── */
          .pool-swatch.active {
            box-shadow: 0 0 8px 2px var(--swatch-color, var(--lcars-ice));
            transition: box-shadow 200ms ease-out;
          }

          /* ── 7.5 Pump Spinner (primary only — Data R-6) ── */
          .lcars-pump-spinner {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 14px; height: 14px;
            position: relative;
          }
          .lcars-pump-spinner .dot {
            position: absolute;
            width: 4px; height: 4px;
            border-radius: 50%;
            background: var(--lcars-ice);
            opacity: 0.3;
          }
          .lcars-pump-spinner .dot:nth-child(1) { top: 0;    left: 5px;  }
          .lcars-pump-spinner .dot:nth-child(2) { bottom: 1px; left: 0;   }
          .lcars-pump-spinner .dot:nth-child(3) { bottom: 1px; right: 0;  }
          .lcars-pump-spinner.on {
            animation: lcars-pump-spin 1.2s linear infinite;
          }
          .lcars-pump-spinner.on .dot { opacity: 1; }
          .lcars-pump-spinner.on .dot:nth-child(2) { opacity: 0.6; }
          .lcars-pump-spinner.on .dot:nth-child(3) { opacity: 0.3; }
          @keyframes lcars-pump-spin {
            to { transform: rotate(360deg); }
          }

          /* ═══════ Phase 8: IRRIGATION v4.13.0 ═══════ */

          /* ── 8.1 Barberpole Flow ── */
          .zone-fill.active {
            background-image: repeating-linear-gradient(
              -45deg,
              var(--lcars-ice) 0 4px,
              rgba(153,204,255,0.3) 4px 8px
            );
            background-size: 11.31px 11.31px;
            animation: lcars-flow 0.6s linear infinite;
          }
          @keyframes lcars-flow {
            0%   { background-position: 0 0; }
            100% { background-position: 11.31px 0; }
          }

          /* ── 8.2 Zone Completion Flash ── */
          .zone-bar.completing {
            animation: lcars-zone-complete 2s ease-out forwards;
          }
          @keyframes lcars-zone-complete {
            0%   { border-left-color: var(--lcars-ice); background: rgba(153,204,255,0.15); }
            100% { border-left-color: var(--panel-frame-color); background: transparent; }
          }

          /* ── 8.3 Schedule Countdown Proximity Glow ── */
          .schedule-countdown {
            text-shadow: 0 0 calc(var(--schedule-proximity, 0) * 8px) var(--lcars-ice);
            transition: text-shadow 10s ease-out;
          }

          /* ── 8.4 Rain Delay Badge ── */
          .lcars-rain-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
            padding: 0.125rem 0.5rem 0.125rem 0.375rem;
            border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
            background: var(--lcars-ice);
            color: var(--lcars-black);
            font-size: 0.7rem;
            text-transform: uppercase;
            animation: lcars-cloud-bob 3s ease-in-out infinite;
          }
          @keyframes lcars-cloud-bob {
            0%, 100% { transform: translateY(0); }
            50%      { transform: translateY(-1px); }
          }

          /* ═══════ Phase 9: ATMOSCRUBBER v4.13.0 ═══════ */

          /* ── 9.1 Particles (6 max, single merged keyframe — Data C-5/R-4) ── */
          .lcars-atmos-particle {
            position: absolute;
            border-radius: 50%;
            background: var(--atmos-quality-color, var(--lcars-ice));
            will-change: transform, opacity;
            width: var(--particle-size, 3px);
            height: var(--particle-size, 3px);
            animation: lcars-particle-float var(--particle-speed, 4s) linear infinite;
            animation-delay: var(--particle-delay, 0s);
          }
          @keyframes lcars-particle-float {
            from { transform: translateY(100%) translateX(calc(var(--particle-drift, 4px) * -1)); opacity: 0; }
            10%  { opacity: var(--particle-opacity, 0.5); }
            90%  { opacity: var(--particle-opacity, 0.5); }
            to   { transform: translateY(-100%) translateX(var(--particle-drift, 4px)); opacity: 0; }
          }

          /* ── 9.2 AQI Cylinder Glow ── */
          .atmos-cylinder {
            box-shadow: inset 0 0 12px 4px var(--atmos-quality-color, var(--lcars-ice));
            transition: box-shadow 1s ease-out;
          }
          .atmos-cylinder.warn {
            animation: lcars-aqi-warn var(--lcars-anim-pulse) ease-in-out infinite;
          }
          @keyframes lcars-aqi-warn {
            0%, 100% { box-shadow: inset 0 0 12px 4px var(--atmos-quality-color); }
            50%      { box-shadow: inset 0 0 20px 8px var(--atmos-quality-color); }
          }

          /* ── 9.3 Filter Life Segments ── */
          .filter-segments {
            display: flex;
            gap: 2px;
          }
          .filter-seg {
            flex: 1;
            height: 6px;
            border-radius: 1px;
            background: var(--lcars-gray);
            opacity: 0.3;
          }
          .filter-seg.lit { background: var(--lcars-ice); opacity: 1; }
          .filter-seg.warn { background: var(--lcars-golden-orange); opacity: 1; }
          .filter-seg.critical {
            background: var(--lcars-tomato);
            opacity: 1;
            animation: lcars-filter-critical var(--lcars-anim-pulse-urgent) ease-in-out infinite;
          }
          @keyframes lcars-filter-critical {
            0%, 100% { opacity: 1; }
            50%      { opacity: 0.4; }
          }

          /* ── 9.4 Sparkline Scan ── */
          .atmos-sparkline-path {
            stroke-dasharray: var(--sparkline-length, 200);
            stroke-dashoffset: var(--sparkline-length, 200);
            animation: lcars-sparkline-draw 1.5s ease-out forwards;
            animation-delay: calc(var(--sparkline-index, 0) * 200ms);
          }
          @keyframes lcars-sparkline-draw {
            to { stroke-dashoffset: 0; }
          }

          /* ── 9.5 Preset Mode Wipe ── */
          .atmos-preset-btn {
            position: relative;
            overflow: hidden;
          }
          .atmos-preset-btn::before {
            content: '';
            position: absolute;
            top: 0; left: 0; bottom: 0;
            width: 0;
            background: var(--lcars-african-violet);
            opacity: 0.3;
            transition: width 250ms ease-out;
          }
          .atmos-preset-btn.active::before {
            width: 100%;
          }

          /* ═══════ Phase 10: AIR PURIFIER v4.13.0 ═══════ */

          /* ── 10.1 Sensor Row Stagger ── */
          .purifier-sensor-row {
            animation: lcars-cascade-in 250ms ease-out both;
            animation-delay: calc(var(--sensor-index, 0) * 80ms);
          }

          /* ═══════ Phase 11: TEMP/HUMIDITY GRID v4.13.0 ═══════ */

          /* ── 11.1 Tile Comfort Glow (Worf R1: COMFORT_COLORS whitelist) ── */
          .env-tile.warm {
            box-shadow: 0 0 8px 2px rgba(255, 153, 102, 0.2);
            animation: lcars-warm-glow 3s ease-in-out infinite;
          }
          .env-tile.cool {
            box-shadow: 0 0 8px 2px rgba(136, 153, 255, 0.2);
            animation: lcars-cool-glow 3s ease-in-out infinite;
          }
          .env-tile.hot {
            box-shadow: 0 0 8px 2px rgba(255, 136, 102, 0.25);
            animation: lcars-warm-glow 3s ease-in-out infinite;
          }
          .env-tile.cold {
            box-shadow: 0 0 8px 2px rgba(85, 102, 255, 0.25);
            animation: lcars-cool-glow 3s ease-in-out infinite;
          }
          @keyframes lcars-warm-glow {
            0%, 100% { box-shadow: 0 0 6px 1px rgba(255,153,102,0.15); }
            50%      { box-shadow: 0 0 10px 3px rgba(255,153,102,0.25); }
          }
          @keyframes lcars-cool-glow {
            0%, 100% { box-shadow: 0 0 6px 1px rgba(136,153,255,0.15); }
            50%      { box-shadow: 0 0 10px 3px rgba(136,153,255,0.25); }
          }

          /* ── 11.2 Floor Label Scan-In ── */
          .env-floor-label {
            position: relative;
            overflow: hidden;
          }
          .env-floor-label::after {
            content: '';
            position: absolute;
            top: 0; left: 0; bottom: 0; right: 0;
            background: var(--lcars-black);
            transform-origin: right;
            transform: scaleX(1);
            animation: lcars-floor-scan 200ms ease-out forwards;
            animation-delay: calc(var(--floor-index, 0) * 200ms);
          }
          @keyframes lcars-floor-scan {
            to { transform: scaleX(0); }
          }

          /* ── 11.3 Sparkline Draw-On ── */
          .env-sparkline-path {
            stroke-dasharray: var(--sparkline-length, 200);
            stroke-dashoffset: var(--sparkline-length, 200);
            animation: lcars-sparkline-draw 1.2s ease-out forwards;
            animation-delay: calc(var(--tile-index, 0) * var(--lcars-anim-stagger));
          }

          /* ── 11.4 Summary Row Pulse ── */
          .sensors-summary-row {
            animation: lcars-summary-pulse var(--lcars-anim-breathe) ease-in-out infinite;
          }
          @keyframes lcars-summary-pulse {
            0%, 100% { border-color: var(--lcars-ice); box-shadow: none; }
            50%      { border-color: var(--lcars-ice); box-shadow: 0 0 4px 1px rgba(153,204,255,0.2); }
          }

          /* ── 11.5 Hot/Cold Alert Pulse ── */
          .env-tile.hot-alert {
            animation: lcars-hot-alert-pulse 1.5s ease-in-out infinite, lcars-warm-glow 3s ease-in-out infinite;
          }
          .env-tile.cold-alert {
            animation: lcars-cold-alert-pulse 2s ease-in-out infinite, lcars-cool-glow 3s ease-in-out infinite;
          }
          @keyframes lcars-hot-alert-pulse {
            0%, 100% { border-color: var(--lcars-peach); }
            50%      { border-color: var(--lcars-tomato); }
          }
          @keyframes lcars-cold-alert-pulse {
            0%, 100% { border-color: var(--lcars-bluey); }
            50%      { border-color: var(--lcars-blue); }
          }

          /* ── 11.6 Value Change Ripple ── */
          .env-tile.value-changed {
            animation: lcars-value-ripple 300ms ease-out;
          }
          @keyframes lcars-value-ripple {
            0%   { box-shadow: inset 4px 0 0 0 transparent; }
            50%  { box-shadow: inset 4px 0 0 0 var(--tile-new-comfort-color, var(--lcars-ice)); }
            100% { box-shadow: inset 4px 0 0 0 transparent; }
          }

          /* ═══════ Phase 2: BATTERY v4.13.0 ═══════ */

          /* ── 2.1 Sensor Pill Badges ── */
          .battery-pill-badge {
            display: inline-flex;
            overflow: hidden;
            border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
            font-size: 0.75rem;
            text-transform: uppercase;
          }
          .battery-pill-badge .pill-label {
            padding: 0.125rem 0.375rem;
            background: var(--panel-frame-color);
            color: var(--lcars-black);
          }
          .battery-pill-badge .pill-value {
            padding: 0.125rem 0.5rem;
            background: rgba(255,255,255,0.08);
            color: var(--lcars-space-white);
            font-weight: 700;
          }
          .battery-pill-badge .pill-value.updated {
            animation: lcars-value-flash 300ms ease-out;
          }

          /* ── 2.3 Charge State Glow ── */
          .battery-charge-glow {
            transition: box-shadow 500ms ease-out;
          }
          .battery-charge-glow[data-level="high"]    { box-shadow: 0 0 8px 2px rgba(153,204,255,0.3); }
          .battery-charge-glow[data-level="medium"]  { box-shadow: 0 0 6px 2px rgba(255,153,0,0.25); }
          .battery-charge-glow[data-level="low"]     { box-shadow: 0 0 8px 2px rgba(255,85,85,0.3); }

          /* ═══════ v4.16.0 CONSOLIDATED POWER PANEL (4X-6) ═══════ */

          /* G-1: Transition separator */
          .device-group + .lcars-consolidated-power-panel {
            margin-top: calc(var(--lcars-gap, 12px) * 2);
            border-top: 2px solid var(--lcars-gray-blue, #7799bb);
            padding-top: var(--lcars-gap, 12px);
          }

          /* Panel frame — G-2: asymmetric border-radius + corner brackets */
          .lcars-consolidated-power-panel {
            display: flex;
            flex-direction: column;
            gap: var(--lcars-gap, 12px);
            padding: var(--lcars-gap, 12px);
            border-left: 4px solid var(--lcars-butterscotch, #ffcc99);
            border-top: 2px solid var(--lcars-butterscotch, #ffcc99);
            border-right: 2px solid var(--lcars-butterscotch, #ffcc99);
            border-bottom: 4px solid var(--lcars-butterscotch, #ffcc99);
            border-radius: 0.75rem 0.25rem 0.25rem 0.75rem;
            background: rgba(0, 0, 0, 0.35);
            position: relative;
            transition: border-color 400ms ease;
          }
          .lcars-consolidated-power-panel::before {
            content: '';
            position: absolute;
            top: -2px; left: -4px;
            width: 1.5rem; height: 1.5rem;
            border-top: 3px solid var(--lcars-butterscotch, #ffcc99);
            border-left: 3px solid var(--lcars-butterscotch, #ffcc99);
            border-radius: 0.75rem 0 0 0;
            pointer-events: none;
          }
          .lcars-consolidated-power-panel::after {
            content: '';
            position: absolute;
            bottom: -4px; right: -2px;
            width: 1.5rem; height: 1.5rem;
            border-bottom: 3px solid var(--lcars-butterscotch, #ffcc99);
            border-right: 3px solid var(--lcars-butterscotch, #ffcc99);
            border-radius: 0 0 0.25rem 0;
            pointer-events: none;
          }
          .lcars-consolidated-power-panel[data-alert="critical"] {
            border-color: var(--lcars-tomato, #ff5555);
            animation: power-critical-pulse 2s ease-in-out infinite;
          }

          /* Header */
          .consolidated-power-header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-family: var(--lcars-font, 'Antonio', sans-serif);
            font-size: 1.1rem;
            text-transform: uppercase;
            color: var(--lcars-butterscotch, #ffcc99);
            letter-spacing: 0.05em;
          }
          .consolidated-power-header ha-icon {
            --mdc-icon-size: 20px;
            color: var(--lcars-butterscotch, #ffcc99);
          }
          .consolidated-power-header .power-panel-header-line {
            flex: 1;
            height: 2px;
            background: var(--lcars-butterscotch, #ffcc99);
            opacity: 0.3;
          }
          .consolidated-power-header .power-panel-badge {
            font-size: 0.7rem;
            opacity: 0.7;
            white-space: nowrap;
          }

          /* G-6: Section accent bars */
          .lcars-consolidated-power-panel .power-circuits-section {
            border-left: 3px solid var(--lcars-butterscotch, #ffcc99);
            padding-left: var(--lcars-gap, 12px);
          }
          .lcars-consolidated-power-panel .power-devices-section {
            border-left: 3px solid var(--lcars-ice, #99ccff);
            padding-left: var(--lcars-gap, 12px);
          }
          .lcars-consolidated-power-panel .power-strips-section {
            border-left: 3px solid var(--lcars-african-violet, #cc99ff);
            padding-left: var(--lcars-gap, 12px);
          }

          /* G-3: Tile minimum height */
          .lcars-consolidated-power-panel .power-circuit-tile {
            min-height: 3rem;
          }

          /* G-5: Focus-visible on circuit tiles */
          .lcars-consolidated-power-panel .power-circuit-tile:focus-visible {
            outline: 2px solid var(--lcars-sunflower, #ffcc99);
            outline-offset: -2px;
          }

          /* Wider circuit grid for left column */
          .lcars-consolidated-power-panel .power-circuits {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));
            gap: 0.5rem;
            max-height: 24rem;
            overflow-y: auto;
          }

          /* Clickable value styling */
          .power-clickable-value {
            cursor: pointer;
            display: inline;
          }
          .power-clickable-value:hover,
          .power-clickable-value:focus-visible {
            text-decoration: underline;
            text-decoration-style: dashed;
            text-underline-offset: 2px;
          }
          .power-clickable-value:focus-visible {
            outline: 2px solid var(--lcars-sunflower, #ffcc99);
            outline-offset: 1px;
            border-radius: 2px;
          }

          /* Truncation pill — G-7 */
          .power-show-all-pill {
            display: block;
            margin: 0.5rem auto 0;
            padding: 0.25rem 1rem;
            border: 1px solid var(--lcars-gray, #666688);
            border-radius: 0 1.5rem 1.5rem 0;
            background: rgba(153, 153, 153, 0.15);
            color: var(--lcars-gray, #666688);
            font-family: var(--lcars-font, 'Antonio', sans-serif);
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            cursor: pointer;
            transition: background 200ms ease, color 200ms ease;
          }
          .power-show-all-pill:hover,
          .power-show-all-pill:focus-visible {
            background: var(--lcars-gray, #666688);
            color: var(--lcars-black, #000000);
          }
          .power-show-all-pill:focus-visible {
            outline: 2px solid var(--lcars-sunflower, #ffcc99);
            outline-offset: 2px;
          }

          /* Responsive breakpoints */
          @media (max-width: 1023px) {
            .lcars-consolidated-power-panel .power-circuits {
              grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr));
            }
          }
          @media (max-width: 767px) {
            .lcars-consolidated-power-panel .power-circuits {
              grid-template-columns: 1fr 1fr;
            }
          }
          @media (max-width: 479px) {
            .lcars-consolidated-power-panel .power-circuits {
              grid-template-columns: 1fr;
            }
          }

          /* ═══════ v4.13.0 REDUCED MOTION OVERRIDES ═══════ */
          @media (prefers-reduced-motion: reduce) {
            .lcars-device-panel { animation: none; }
            .lcars-device-panel[data-hvac-action="heating"],
            .lcars-device-panel[data-hvac-action="cooling"] {
              animation: none;
              border-color: var(--pulse-color);
            }
            .lcars-audio-waveform .bar { animation: none !important; transform: scaleY(0.17); }
            .lcars-device-panel[data-state="triggered"] {
              animation: none;
              border-color: var(--lcars-tomato);
              border-width: 6px 3px 6px 6px;
              box-shadow: none;
            }
            .alarm-shield-icon[data-glow="butterscotch-pulse"],
            .alarm-shield-icon[data-glow="tomato"] { animation: none; }
            .alarm-countdown[data-urgency="elevated"],
            .alarm-countdown[data-urgency="high"],
            .alarm-countdown[data-urgency="critical"] { animation: none; }
            .weather-viewscreen.storm::before { animation: none; opacity: 0.18; }
            .wind-compass.gusty .wind-needle { animation: none; }
            .pool-viewscreen::after { animation: none; opacity: 0.04; }
            .pool-heat-bar.heating { animation: none; }
            .lcars-pump-spinner.on { animation: none; }
            .chem-badge[data-threshold="critical"] { animation: none; }
            .zone-fill.active { animation: none; }
            .lcars-rain-badge { animation: none; }
            .lcars-atmos-particle { animation: none; opacity: 0.4; }
            .atmos-cylinder.warn { animation: none; }
            .filter-seg.critical { animation: none; }
            .env-tile.warm, .env-tile.cool, .env-tile.hot, .env-tile.cold { animation: none; }
            .env-tile.hot-alert, .env-tile.cold-alert { animation: none; }
            .sensors-summary-row { animation: none; }
            .media-viewscreen-glow { animation: none; }
            .media-idle-glyph { animation: none; opacity: 0.4; }
            .media-progress-fill::after { animation: none; }
            /* Power panel reduced motion */
            .power-panel[data-alert="critical"] { animation: none; border-color: var(--lcars-tomato); }
            .lcars-consolidated-power-panel[data-alert="critical"] { animation: none; border-color: var(--lcars-tomato); }
            .power-circuit-tile { animation: none !important; opacity: 1; }
            .power-circuit-tile, .power-device-row, .power-toggle { transition-duration: 0.01ms !important; }
            /* Confirmations: halved, still play */
            .device-control-btn:active::after { animation-duration: 100ms !important; }
            .alarm-key:active::before { animation-duration: 100ms !important; }
            .zone-bar.completing { animation-duration: 1s !important; }
          }
        `,
      ];
    }

    /* ──────────── FLOOR VIEW ──────────── */
    _renderFloorView(floorId) {
      const floor = this._hass.floors?.[floorId];
      if (!floor) {
        lcarsLog.debug(TAG, 'Render: floor not found:', floorId);
        return html`<div class="lcars-empty">Floor not found</div>`;
      }

      const areaIds = this._getFloorAreaIds(floorId);
      if (areaIds.length === 0) {
        return html`
          <div class="content-area-panel">
            <h2 class="content-area-header">${floor.name}</h2>
            <div class="lcars-empty">No areas on this floor</div>
          </div>
        `;
      }

      lcarsLog.debug(TAG, 'Render: floor=%s areas=%d', floor.name, areaIds.length);

      return html`
        <div class="content-floor-panel">
          <h2 class="content-floor-header">${floor.name}</h2>
          ${areaIds.map(areaId => {
            const area = this._hass.areas?.[areaId];
            if (!area) return '';
            const entities = this._getAreaEntities(areaId);
            if (entities.length === 0) return '';
            return html`
              <div class="content-area-panel floor-area-section">
                <h3 class="content-area-header floor-area-subheader">${area.name}</h3>
                ${this._renderAreaContent(entities, areaId)}
              </div>
            `;
          })}
        </div>
      `;
    }

    /* ──────────── RENDER ──────────── */
    render() {
      if (!this._hass) {
        lcarsLog.debug(TAG, 'Render: waiting for hass');
        return html`<div class="lcars-empty">Initializing...</div>`;
      }

      // Floor selected — combined view of all areas on that floor
      if (this.selectedFloor) {
        return this._renderFloorView(this.selectedFloor);
      }

      // No area selected — show prompt
      if (!this.selectedArea) {
        lcarsLog.debug(TAG, 'Render: no area selected');
        return html`<div class="lcars-empty">Select an area</div>`;
      }

      // Find the area object
      const area = this._hass.areas?.[this.selectedArea];
      if (!area) {
        lcarsLog.debug(TAG, 'Render: area not found:', this.selectedArea);
        return html`<div class="lcars-empty">Area not found</div>`;
      }

      const entities = this._getAreaEntities(this.selectedArea);
      lcarsLog.debug(TAG, 'Render: area=%s entities=%d', area.name, entities.length);

      return html`
        <div class="content-area-panel">
          <h2 class="content-area-header">${area.name}</h2>
          ${this._renderAreaContent(entities, this.selectedArea)}
        </div>
      `;
    }

    /* ─── Detect if a device warrants a unified panel ─── */
    _getDevicePanelType(entries) {
      return classifyDevice(entries);
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

    /* ─── v4.13.0: Generate deterministic 6-digit panel code (Data L-4) ─── */
    _generatePanelCode(entityId) {
      let h = 5381;
      for (let i = 0; i < entityId.length; i++) {
        h = ((h << 5) + h + entityId.charCodeAt(i)) | 0;
      }
      const code = String(Math.abs(h) % 1000000).padStart(6, '0');
      return `${code.slice(0, 3)}-${code.slice(3)}`;
    }

    /* ─── Dispatch to the correct panel renderer (4X-21: registry-based) ─── */
    _renderDevicePanel(panelType, group) {
      // Irrigation has custom rendering logic — handle separately
      if (panelType === PANEL_TYPE_IRRIGATION) return this._renderIrrigationPanel(group);
      const factory = PANEL_TAG_REGISTRY.get(panelType);
      return factory ? factory(group, this._hass, this._editMode, this._config) : '';
    }

    /* ─── Sensor indicator color per state (Geordi spec) ─── */
    _getSensorIndicatorColor(state) {
      // 4X-1: CO₂-specific 3-tier coloring (D-C2 — wire getCo2Color into rendering)
      const dc = state?.attributes?.device_class || '';
      if (dc === 'carbon_dioxide') {
        return getCo2Color(state?.state);
      }
      return getStateColor(state?.entity_id || '', state);
    }

    /* ═══ CAMERA DEVICE PANEL RENDERER ═══ */
    _renderCameraPanel(group) {
      const { cameras, sensors, controls } = this._partitionDeviceEntities(group.entities);
      const deviceName = this._shortDeviceName(group.device);

      return html`
        <div class="lcars-device-panel" data-panel-type="camera">
          <div class="device-panel-header">
            <span class="device-panel-name">${deviceName}</span>
            <div class="device-panel-header-line"></div>
            <span class="panel-numeric-code" aria-hidden="true">${this._generatePanelCode(cameras[0]?.entity?.entity_id || deviceName)}</span>
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
          <div class="panel-pip-strip" aria-hidden="true"></div>
        </div>
      `;
    }

    /* ═══ BATTERY DEVICE PANEL — WARP CORE VISUALIZATION ═══ */

    /* Classify a power entity as input/output by friendly_name patterns */
    _classifyPowerEntity(name) {
      const n = (name || '').toLowerCase();
      if (/total\s*in\s*power/.test(n)) return { side: 'in', type: 'total' };
      if (/total\s*out\s*power/.test(n)) return { side: 'out', type: 'total' };
      if (/solar.*in.*power/.test(n)) return { side: 'in', type: 'solar' };
      if (/ac.*in.*power/.test(n)) return { side: 'in', type: 'ac' };
      if (/ac.*out.*power/.test(n)) return { side: 'out', type: 'ac' };
      if (/dc.*out.*power/.test(n)) return { side: 'out', type: 'dc' };
      if (/usb.*out.*power/.test(n)) return { side: 'out', type: 'usb' };
      if (/type.*c.*out.*power/.test(n)) return { side: 'out', type: 'usbc' };
      if (/power.*i.*o.*input.*power/.test(n)) return { side: 'in', type: 'pio' };
      if (/power.*i.*o.*output.*power/.test(n)) return { side: 'out', type: 'pio' };
      if (/anderson.*out.*power/.test(n)) return { side: 'out', type: 'dc' };
      if (/alternator.*in.*power/.test(n)) return { side: 'in', type: 'alt' };
      if (/station.*power/.test(n)) return { side: 'out', type: 'station' };
      // Fallback: check for "in" or "out" in name
      if (/\bin\b/.test(n)) return { side: 'in', type: 'other' };
      if (/\bout\b/.test(n)) return { side: 'out', type: 'other' };
      return null;
    }

    /* Partition battery device entities into render groups */
    _partitionBatteryEntities(entries, categoryEntities) {
      const soc = [];
      const powerIn = [];
      const powerOut = [];
      const telemetry = [];
      const controls = [];
      const configControls = [];
      const diagnostics = [];

      for (const entry of entries) {
        const attrs = entry.state?.attributes || {};
        const dc = attrs.device_class || '';
        const unit = attrs.unit_of_measurement || '';
        const domain = entry.domain;
        const name = attrs.friendly_name || entry.entity.entity_id;

        // Controls: switches, numbers, buttons, selects
        if (['switch', 'number', 'button', 'select'].includes(domain)) {
          controls.push(entry);
          continue;
        }

        // Battery SOC
        if (dc === 'battery' && unit === '%') {
          soc.push(entry);
          continue;
        }

        // Power entities → classify as in/out
        if (dc === 'power' && unit === 'W') {
          const cls = this._classifyPowerEntity(name);
          if (cls) {
            if (cls.side === 'in') powerIn.push({ ...entry, ioType: cls.type });
            else powerOut.push({ ...entry, ioType: cls.type });
          } else {
            telemetry.push(entry);
          }
          continue;
        }

        // Telemetry: temperature, duration, energy, voltage, current, etc.
        telemetry.push(entry);
      }

      // Partition category entities (config + diagnostic)
      if (categoryEntities) {
        for (const e of categoryEntities.config) {
          const state = this._getEntityState(e.entity_id);
          if (!state) continue;
          const domain = e.entity_id.split('.')[0];
          configControls.push({ entity: e, domain, state });
        }
        for (const e of categoryEntities.diagnostic) {
          const state = this._getEntityState(e.entity_id);
          if (!state) continue;
          const domain = e.entity_id.split('.')[0];
          diagnostics.push({ entity: e, domain, state });
        }
      }

      return { soc, powerIn, powerOut, telemetry, controls, configControls, diagnostics };
    }

    /* ═══ ENVIRONMENT PANEL: partition, color, history, sparkline ═══ */

    /* Partition environment device entities into functional buckets */
    _partitionEnvironmentEntities(entries, categoryEntities) {
      const score = [];
      const airQuality = [];
      const telemetry = [];
      const controls = [];
      const diagnostics = [];

      for (const entry of entries) {
        const dc = entry.state?.attributes?.device_class || '';
        const domain = entry.domain;

        // Controls: fan, switch, button, number, select, light (4X-1: BlueAir LED)
        if (['fan', 'switch', 'button', 'number', 'select', 'light'].includes(domain)) {
          controls.push(entry);
          continue;
        }

        // AQ-specific device_classes → airQuality
        if (AQ_DEVICE_CLASSES.has(dc)) {
          airQuality.push(entry);
          continue;
        }

        // Score: composite AQ index (no device_class, matched by entity_id)
        if (!dc && domain === 'sensor' && AQ_ENTITY_SUFFIX_RE.test(entry.entity.entity_id)) {
          score.push(entry);
          continue;
        }

        // Everything else → telemetry (temperature, humidity, etc.)
        telemetry.push(entry);
      }

      // Append category entities (diagnostic + config)
      if (categoryEntities) {
        for (const e of [...categoryEntities.diagnostic, ...categoryEntities.config]) {
          const state = this._getEntityState(e.entity_id);
          if (!state) continue;
          diagnostics.push({ entity: e, domain: e.entity_id.split('.')[0], state });
        }
      }

      return { score, airQuality, telemetry, controls, diagnostics };
    }

    /* Map AQI value → hue angle (120=green → 0=red) for atmoscrubber */
    _getScrubberHue(aqi) {
      if (aqi == null || aqi <= 50) return 120;
      if (aqi <= 100) return 120 - ((aqi - 50) / 50) * 70;   // 120→50
      if (aqi <= 150) return 50 - ((aqi - 100) / 50) * 35;    // 50→15
      return Math.max(0, 15 - ((aqi - 150) / 100) * 15);       // 15→0
    }

    /* Map AQI value → LCARS color variable name */
    _getAQColor(aqi) {
      if (aqi == null || aqi <= 50) return 'var(--lcars-ice)';
      if (aqi <= 100) return 'var(--lcars-sunflower)';
      if (aqi <= 150) return 'var(--lcars-butterscotch)';
      if (aqi <= 200) return 'var(--lcars-peach)';
      return 'var(--lcars-tomato)';
    }

    /* Map fan percentage → particle animation duration (lower = faster) */
    _getScrubberSpeed(fanPercentage) {
      if (fanPercentage == null || fanPercentage === 0) return 20;
      return 2 + (18 * Math.pow(1 - fanPercentage / 100, 1.5));
    }

    /* Fetch 24h statistics for sparklines (hourly means, cached 5 min) */
    _envHistoryCache = new Map();
    async _getSparklineData(deviceId, entityIds) {
      return fetchSparklineData(this._hass, deviceId, entityIds, this._envHistoryCache);
    }

    /* Render a tiny SVG sparkline from hourly statistics data */
    _renderSparkline(points, color, label) {
      return renderSparkline(points, { color, label, className: 'env-sparkline' });
    }

    /* Render the environment panel */
    _renderEnvironmentPanel(group) {
      const categoryEntities = this._getDeviceCategoryEntities(group.device.id);
      const { score, airQuality, telemetry, controls, diagnostics } = this._partitionEnvironmentEntities(group.entities, categoryEntities);
      const deviceName = this._shortDeviceName(group.device) || 'Environment';

      // Find primary AQ reading for color mapping
      const scoreEntry = score[0];
      const scoreVal = scoreEntry ? parseFloat(scoreEntry.state.state) : null;
      const pm25Entry = airQuality.find(e => (e.state?.attributes?.device_class || '') === 'pm25');
      const pm25Val = pm25Entry ? parseFloat(pm25Entry.state.state) : null;
      // Use Score as AQI proxy; fallback to PM2.5 mapped to AQI-ish range
      const aqiEstimate = scoreVal != null && Number.isFinite(scoreVal) ? scoreVal
        : pm25Val != null && Number.isFinite(pm25Val) ? Math.min(300, pm25Val * 4)
        : null;
      const hue = this._getScrubberHue(aqiEstimate);
      const aqColor = this._getAQColor(aqiEstimate);

      // Fan state
      const fanEntry = controls.find(e => e.domain === 'fan');
      const fanState = fanEntry?.state;
      const fanPct = fanState?.attributes?.percentage ?? null;
      const fanPresets = fanState?.attributes?.preset_modes || [];
      const fanPreset = fanState?.attributes?.preset_mode || '';
      const isIdle = !fanEntry || fanState?.state === 'off' || fanPct === 0;
      const scrubberSpeed = this._getScrubberSpeed(isIdle ? 0 : fanPct);
      const sensorOnly = !fanEntry;

      // Non-fan controls (switches like display, child lock)
      const switchControls = controls.filter(e => e.domain !== 'fan');

      // Async trigger sparkline fetch (renders on next update)
      const sparklineIds = [...score, ...airQuality].map(e => e.entity.entity_id);
      if (sparklineIds.length > 0) {
        this._getSparklineData(group.device.id, sparklineIds).then((fresh) => {
          if (fresh) this.requestUpdate(); // only re-render when new data arrived
        });
      }
      const sparkData = this._envHistoryCache.get(group.device.id)?.data || {};

      return html`
        <div class="lcars-device-panel env-panel ${sensorOnly ? 'sensor-only' : ''}" data-panel-type="environment">
          <!-- Header -->
          <div class="env-header">
            <span class="device-panel-name">${deviceName}</span>
            <div class="device-panel-header-line"></div>
            ${scoreEntry ? html`
              <span class="env-score-label" style="color:${aqColor}">
                ${scoreVal != null && Number.isFinite(scoreVal) ? Math.round(scoreVal) : '—'}
              </span>
            ` : ''}
            <span class="panel-numeric-code" aria-hidden="true">${this._generatePanelCode(group.device.id)}</span>
          </div>

          <!-- Sensors (left) -->
          <div class="env-sensors" role="list" aria-label="${deviceName} sensors">
            ${airQuality.map(({ entity, state }) => {
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
            ${telemetry.map(({ entity, state }) => {
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
            ${diagnostics.length > 0 ? html`
              <div class="battery-section-divider"></div>
              <div class="battery-section-label">DIAGNOSTICS</div>
              ${diagnostics.map(({ entity, state }) => {
                const name = this._friendlyName(state, entity);
                const val = state.state;
                const unit = state.attributes?.unit_of_measurement || '';
                const color = this._getSensorIndicatorColor(state);
                return html`
                  <div class="device-sensor-line" tabindex="0" role="listitem"
                    @click=${() => this._handleEntityClick(entity.entity_id)}
                    @keydown=${(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._handleEntityClick(entity.entity_id); } }}>
                    <div class="sensor-indicator" style="background:${color}"></div>
                    <span class="sensor-label">${name}</span>
                    <span class="sensor-state-value" style="color:${color}">${val}${unit ? ' ' + unit : ''}</span>
                  </div>
                `;
              })}
            ` : ''}
          </div>

          <!-- Atmoscrubber Cylinder (center) -->
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
              ${!isIdle ? html`${Array.from({ length: 6 }, (_, i) => html`
                <div class="lcars-atmos-particle" aria-hidden="true"
                  style="--particle-speed:${3 + i * 0.8}s;--particle-delay:${i * 0.6}s;--particle-drift:${3 + (i % 3) * 2}px;--particle-size:${2 + (i % 3)}px;--particle-opacity:${0.3 + (i % 2) * 0.2};left:${10 + i * 14}%"></div>
              `)}` : ''}
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
                            const validModes = this._hass.states[fanEntry.entity.entity_id]?.attributes?.preset_modes || [];
                            if (!validModes.includes(mode)) return;
                            this._hass.callService('fan', 'set_preset_mode', {
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

          <!-- Sparklines (bottom) -->
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
          <div class="panel-pip-strip" aria-hidden="true"></div>
        </div>
      `;
    }

    /* Get warp core color for a given charge percentage */
    _getCoreColor(charge) {
      if (charge >= 80) return 'var(--lcars-ice)';
      if (charge >= 60) return 'var(--lcars-sky)';
      if (charge >= 40) return 'var(--lcars-bluey)';
      if (charge >= 20) return 'var(--lcars-butterscotch)';
      if (charge >= 10) return 'var(--lcars-peach)';
      return 'var(--lcars-tomato)';
    }

    /* Get flow animation speed class based on wattage */
    _getFlowSpeed(watts) {
      const w = Math.abs(parseFloat(watts) || 0);
      if (w === 0) return 'flow-stopped';
      if (w > 1000) return 'flow-fast';
      if (w > 100) return 'flow-medium';
      return 'flow-slow';
    }

    /* Render the battery panel */
    _renderBatteryPanel(group) {
      const categoryEntities = this._getDeviceCategoryEntities(group.device.id);
      const { soc, powerIn, powerOut, telemetry, controls, configControls, diagnostics } = this._partitionBatteryEntities(group.entities, categoryEntities);
      const deviceName = this._shortDeviceName(group.device) || 'Battery';

      // Primary SOC value
      const socEntry = soc[0];
      const charge = socEntry ? parseFloat(socEntry.state.state) || 0 : 0;
      const chargeAvailable = socEntry && socEntry.state.state !== 'unavailable' && socEntry.state.state !== 'unknown';
      const coreColor = chargeAvailable ? this._getCoreColor(charge) : 'var(--lcars-gray)';

      // Total power for determining charging/discharging state
      const totalIn = powerIn.find(e => e.ioType === 'total');
      const totalOut = powerOut.find(e => e.ioType === 'total');
      const totalInW = totalIn ? parseFloat(totalIn.state.state) || 0 : 0;
      const totalOutW = totalOut ? parseFloat(totalOut.state.state) || 0 : 0;
      const isCharging = totalInW > 5;
      const isDischarging = totalOutW > 5;
      const isIdle = !isCharging && !isDischarging;

      // Build I/O pairs: match in/out by type (ac, dc, solar, etc.)
      const ioTypes = new Set();
      powerIn.filter(e => e.ioType !== 'total').forEach(e => ioTypes.add(e.ioType));
      powerOut.filter(e => e.ioType !== 'total').forEach(e => ioTypes.add(e.ioType));
      const ioPairs = [...ioTypes].map(type => ({
        type,
        label: type.toUpperCase(),
        inEntry: powerIn.find(e => e.ioType === type),
        outEntry: powerOut.find(e => e.ioType === type),
      }));

      // Filter telemetry to key items for display
      const keyTelemetry = telemetry.filter(e => {
        const dc = e.state?.attributes?.device_class || '';
        const name = (e.state?.attributes?.friendly_name || '').toLowerCase();
        return dc === 'temperature' || dc === 'duration' ||
          /state.*health|cycles|remain.*time|status|error.*code|battery.*count/.test(name);
      }).slice(0, 8);

      // Filter diagnostics to key items (temp, cycles, status, errors — skip hidden energy readings)
      const keyDiagnostics = diagnostics.filter(e => {
        const dc = e.state?.attributes?.device_class || '';
        const name = (e.state?.attributes?.friendly_name || '').toLowerCase();
        return dc === 'temperature' || /cycles|status|error|battery.*count|charging.*state|power.*diff/.test(name);
      }).slice(0, 8);

      return html`
        <div class="lcars-device-panel battery-panel" data-panel-type="battery">
          <!-- Header -->
          <div class="battery-header">
            <span class="device-panel-name">${deviceName}</span>
            <div class="device-panel-header-line"></div>
            <span class="battery-charge-label" style="color:${coreColor}">
              ${chargeAvailable ? `${Math.round(charge)}%` : 'N/A'}
            </span>
            <span class="panel-numeric-code" aria-hidden="true">${this._generatePanelCode(socEntry?.entity?.entity_id || group.device.id)}</span>
          </div>

          <!-- Telemetry (left) -->
          <div class="battery-telemetry" role="list" aria-label="${deviceName} telemetry">
            ${totalIn ? html`
              <div class="battery-total-line" tabindex="0" role="button"
                @click=${() => this._handleEntityClick(totalIn.entity.entity_id)}
                @keydown=${(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._handleEntityClick(totalIn.entity.entity_id); } }}>
                <ha-icon icon="mdi:transmission-tower-import" style="--mdc-icon-size:14px;color:var(--lcars-ice)"></ha-icon>
                <span class="sensor-label">Total In</span>
                <span class="sensor-state-value" style="color:var(--lcars-ice)">${totalIn.state.state} W</span>
              </div>
            ` : ''}
            ${totalOut ? html`
              <div class="battery-total-line" tabindex="0" role="button"
                @click=${() => this._handleEntityClick(totalOut.entity.entity_id)}
                @keydown=${(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._handleEntityClick(totalOut.entity.entity_id); } }}>
                <ha-icon icon="mdi:transmission-tower-export" style="--mdc-icon-size:14px;color:var(--lcars-butterscotch)"></ha-icon>
                <span class="sensor-label">Total Out</span>
                <span class="sensor-state-value" style="color:var(--lcars-butterscotch)">${totalOut.state.state} W</span>
              </div>
            ` : ''}
            ${keyTelemetry.map(({ entity, state }) => {
              const name = this._friendlyName(state, entity);
              const val = state.state;
              const unit = state.attributes?.unit_of_measurement || '';
              const color = this._getSensorIndicatorColor(state);
              return html`
                <div class="device-sensor-line" tabindex="0" role="listitem"
                  @click=${() => this._handleEntityClick(entity.entity_id)}
                  @keydown=${(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._handleEntityClick(entity.entity_id); } }}>
                  <div class="sensor-indicator" style="background:${color}"></div>
                  <span class="sensor-label">${name}</span>
                  <span class="sensor-state-value" style="color:${color}">${val}${unit ? ' ' + unit : ''}</span>
                </div>
              `;
            })}
            ${keyDiagnostics.length > 0 ? html`
              <div class="battery-section-divider"></div>
              <div class="battery-section-label">DIAGNOSTICS</div>
              ${keyDiagnostics.map(({ entity, state }) => {
                const name = this._friendlyName(state, entity);
                const val = state.state;
                const unit = state.attributes?.unit_of_measurement || '';
                const color = this._getSensorIndicatorColor(state);
                return html`
                  <div class="device-sensor-line" tabindex="0" role="listitem"
                    @click=${() => this._handleEntityClick(entity.entity_id)}
                    @keydown=${(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._handleEntityClick(entity.entity_id); } }}>
                    <div class="sensor-indicator" style="background:${color}"></div>
                    <span class="sensor-label">${name}</span>
                    <span class="sensor-state-value" style="color:${color}">${val}${unit ? ' ' + unit : ''}</span>
                  </div>
                `;
              })}
            ` : ''}
          </div>

          <!-- Warp Core (center) -->
          <div class="warp-core-container" role="meter"
            aria-valuenow="${charge}" aria-valuemin="0" aria-valuemax="100"
            aria-label="Battery charge level: ${Math.round(charge)} percent">
            <div class="warp-core" style="--core-color:${coreColor};--core-charge:${chargeAvailable ? charge : 0}">
              <div class="warp-core-fill ${isIdle ? 'core-idle' : ''} ${isCharging ? 'core-charging' : ''}">
                <div class="warp-core-stream"></div>
              </div>
              <div class="warp-core-tick" style="bottom:25%"></div>
              <div class="warp-core-tick" style="bottom:50%"></div>
              <div class="warp-core-tick" style="bottom:75%"></div>
            </div>
          </div>

          <!-- Controls (right) -->
          <div class="battery-controls" aria-label="${deviceName} controls">
            ${controls.map(({ entity, state }) => {
              const name = this._friendlyName(state, entity);
              const domain = entity.entity_id.split('.')[0];
              if (domain === 'number') {
                const min = state.attributes?.min || 0;
                const max = state.attributes?.max || 100;
                const val = parseFloat(state.state) || 0;
                const unit = state.attributes?.unit_of_measurement || '';
                const pct = max > min ? ((val - min) / (max - min)) * 100 : 0;
                return html`
                  <div class="battery-slider-control">
                    <span class="battery-slider-label" id="slider-${entity.entity_id}">${name}</span>
                    <div class="battery-slider-track"
                      tabindex="0" role="slider"
                      aria-labelledby="slider-${entity.entity_id}"
                      aria-valuemin="${min}" aria-valuemax="${max}" aria-valuenow="${val}"
                      @click=${(ev) => {
                        const rect = ev.currentTarget.getBoundingClientRect();
                        const ratio = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width));
                        const newVal = Math.round(min + ratio * (max - min));
                        this._hass.callService('number', 'set_value', { entity_id: entity.entity_id, value: newVal });
                      }}
                      @keydown=${(ev) => {
                        let newVal = val;
                        if (ev.key === 'ArrowRight' || ev.key === 'ArrowUp') { newVal = Math.min(max, val + 1); }
                        else if (ev.key === 'ArrowLeft' || ev.key === 'ArrowDown') { newVal = Math.max(min, val - 1); }
                        else if (ev.key === 'Home') { newVal = min; }
                        else if (ev.key === 'End') { newVal = max; }
                        else return;
                        ev.preventDefault();
                        this._hass.callService('number', 'set_value', { entity_id: entity.entity_id, value: newVal });
                      }}>
                      <div class="battery-slider-fill" style="width:${pct}%"></div>
                      <div class="battery-slider-thumb" style="left:${pct}%"></div>
                    </div>
                    <span class="battery-slider-value">${val}${unit ? ' ' + unit : ''}</span>
                  </div>
                `;
              }
              const isOn = state.state === 'on';
              const isOff = this._isOff(state);
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
            ${configControls.length > 0 ? html`
              <div class="battery-section-divider"></div>
              <div class="battery-section-label">CONFIG</div>
              ${configControls.map(({ entity, state }) => {
                const name = this._friendlyName(state, entity);
                const domain = entity.entity_id.split('.')[0];
                if (domain === 'number') {
                  const min = state.attributes?.min || 0;
                  const max = state.attributes?.max || 100;
                  const step = state.attributes?.step || 1;
                  const val = parseFloat(state.state) || 0;
                  const unit = state.attributes?.unit_of_measurement || '';
                  const pct = max > min ? ((val - min) / (max - min)) * 100 : 0;
                  return html`
                    <div class="battery-slider-control">
                      <span class="battery-slider-label" id="slider-${entity.entity_id}">${name}</span>
                      <div class="battery-slider-track"
                        tabindex="0" role="slider"
                        aria-labelledby="slider-${entity.entity_id}"
                        aria-valuemin="${min}" aria-valuemax="${max}" aria-valuenow="${val}"
                        @click=${(ev) => {
                          const rect = ev.currentTarget.getBoundingClientRect();
                          const ratio = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width));
                          let newVal = min + ratio * (max - min);
                          newVal = Math.round(newVal / step) * step;
                          newVal = Math.max(min, Math.min(max, newVal));
                          this._hass.callService('number', 'set_value', { entity_id: entity.entity_id, value: newVal });
                        }}
                        @keydown=${(ev) => {
                          let newVal = val;
                          if (ev.key === 'ArrowRight' || ev.key === 'ArrowUp') { newVal = Math.min(max, val + step); }
                          else if (ev.key === 'ArrowLeft' || ev.key === 'ArrowDown') { newVal = Math.max(min, val - step); }
                          else if (ev.key === 'Home') { newVal = min; }
                          else if (ev.key === 'End') { newVal = max; }
                          else return;
                          ev.preventDefault();
                          this._hass.callService('number', 'set_value', { entity_id: entity.entity_id, value: newVal });
                        }}>
                        <div class="battery-slider-fill" style="width:${pct}%"></div>
                        <div class="battery-slider-thumb" style="left:${pct}%"></div>
                      </div>
                      <span class="battery-slider-value">${val}${unit ? ' ' + unit : ''}</span>
                    </div>
                  `;
                }
                if (domain === 'select') {
                  const options = state.attributes?.options || [];
                  const current = state.state;
                  return html`
                    <div class="lcars-option-strip" role="radiogroup" aria-label="${name}">
                      <span class="lcars-option-strip-label">${name}</span>
                      <div class="lcars-option-strip-btns">
                        ${options.map(opt => html`
                          <button class="lcars-option-btn"
                            role="radio"
                            aria-checked="${opt === current}"
                            ?data-selected=${opt === current}
                            @click=${() => this._hass.callService('select', 'select_option', {
                              entity_id: entity.entity_id, option: opt
                            })}>
                            ${opt}
                          </button>
                        `)}
                      </div>
                    </div>
                  `;
                }
                // switch/button fallback
                const isOn = state.state === 'on';
                const isOff = this._isOff(state);
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
            ` : ''}
          </div>

          <!-- Power I/O Flow (bottom) -->
          <div class="battery-io-flow" aria-label="Power flow">
            ${ioPairs.map(pair => {
              const inW = pair.inEntry ? parseFloat(pair.inEntry.state.state) || 0 : 0;
              const outW = pair.outEntry ? parseFloat(pair.outEntry.state.state) || 0 : 0;
              const inSpeed = this._getFlowSpeed(inW);
              const outSpeed = this._getFlowSpeed(outW);
              return html`
                <div class="io-pair-row">
                  <div class="io-port io-in" aria-label="${pair.label} input: ${inW} watts">
                    <span class="io-label">${pair.label} IN</span>
                    <span class="io-watts" style="color:var(--lcars-ice)">${inW > 0 ? `${Math.round(inW)}W` : '—'}</span>
                  </div>
                  <div class="io-conduit io-conduit-in ${inSpeed}"></div>
                  <div class="io-core-gap"></div>
                  <div class="io-conduit io-conduit-out ${outSpeed}"></div>
                  <div class="io-port io-out" aria-label="${pair.label} output: ${outW} watts">
                    <span class="io-label">${pair.label} OUT</span>
                    <span class="io-watts" style="color:var(--lcars-butterscotch)">${outW > 0 ? `${Math.round(outW)}W` : '—'}</span>
                  </div>
                </div>
              `;
            })}
          </div>
          <div class="panel-pip-strip" aria-hidden="true"></div>
        </div>
      `;
    }

    /* ═══════════════════════════════════════════════════════════════════════ */
    /* ═══ CLIMATE PANEL — THERMOSTAT (Nest, Ecobee) ═══════════════════════ */
    /* ═══════════════════════════════════════════════════════════════════════ */

    _climateSetpointDebouncer = null;

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
        // Controls/other go to sensors for display
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

    _isDualSetpoint(climateState) {
      return climateState?.attributes?.hvac_mode === 'heat_cool'
        || (climateState?.attributes?.target_temp_low != null
            && climateState?.attributes?.target_temp_high != null);
    }

    _renderClimateArc(currentTemp, targetTemp, minTemp, maxTemp, actionColor) {
      const w = 200, h = 130, cx = 100, cy = 120, r = 80;
      const range = maxTemp - minTemp || 1;
      const progress = Math.max(0, Math.min(1, (currentTemp - minTemp) / range));
      // Arc from 180° (left) to 0° (right)
      const startAngle = Math.PI;
      const endAngle = 0;
      const sweepAngle = startAngle - (startAngle - endAngle) * progress;
      const sx = cx + r * Math.cos(startAngle);
      const sy = cy - r * Math.sin(startAngle);
      const ex = cx + r * Math.cos(sweepAngle);
      const ey = cy - r * Math.sin(sweepAngle);
      const largeArc = progress > 0.5 ? 1 : 0;
      // Target tick on arc
      const targetProgress = Math.max(0, Math.min(1, (targetTemp - minTemp) / range));
      const tickAngle = startAngle - (startAngle - endAngle) * targetProgress;
      const tx = cx + r * Math.cos(tickAngle);
      const ty = cy - r * Math.sin(tickAngle);

      return html`
        <svg class="climate-arc" viewBox="0 0 ${w} ${h}" role="meter"
          aria-valuemin="${minTemp}" aria-valuemax="${maxTemp}" aria-valuenow="${currentTemp}"
          aria-label="Temperature: ${currentTemp}°, target ${targetTemp}°">
          <!-- Background arc -->
          <path d="M ${sx},${sy} A ${r},${r} 0 1,1 ${cx + r},${cy}"
            fill="none" stroke="var(--lcars-disabled)" stroke-width="8" stroke-linecap="round" />
          <!-- Progress arc -->
          ${progress > 0 ? html`
            <path d="M ${sx},${sy} A ${r},${r} 0 ${largeArc},1 ${ex},${ey}"
              fill="none" stroke="${actionColor}" stroke-width="8" stroke-linecap="round" />
          ` : ''}
          <!-- Target tick -->
          <circle cx="${tx}" cy="${ty}" r="5" fill="${actionColor}" stroke="var(--lcars-card-bg, var(--lcars-black, #000))" stroke-width="2" />
          <!-- Current temp text -->
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
          this._hass.callService('climate', 'set_temperature', { entity_id: eid, ...data });
        }, 1500);
      }
      const data = isDual
        ? { [which === 'low' ? 'target_temp_low' : 'target_temp_high']: clamped }
        : { temperature: clamped };
      this._climateSetpointDebouncer.call(entityId, data);
    }

    _handleClimateMode(entityId, mode) {
      this._hass.callService('climate', 'set_hvac_mode', { entity_id: entityId, hvac_mode: mode });
    }

    _handleClimateFanMode(entityId, fanMode) {
      this._hass.callService('climate', 'set_fan_mode', { entity_id: entityId, fan_mode: fanMode });
    }

    _handleClimatePreset(entityId, preset) {
      this._hass.callService('climate', 'set_preset_mode', { entity_id: entityId, preset_mode: preset });
    }

    _renderClimatePanel(group) {
      const categoryEntities = this._getDeviceCategoryEntities(group.device.id);
      const { climate, sensors, faults, diagnostics } = this._partitionClimateEntities(group.entities, categoryEntities);
      const deviceName = this._shortDeviceName(group.device) || 'Thermostat';

      if (climate.length === 0) return '';
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
        <div class="lcars-device-panel climate-panel" data-panel-type="climate"
          data-hvac-action="${hvacAction}"
          style="--panel-frame-color:${actionColor}">
          <!-- Header -->
          <div class="climate-header">
            <span class="device-panel-name">${deviceName}</span>
            <div class="device-panel-header-line"></div>
            <span class="climate-action-badge" style="color:${actionColor}">
              ${hvacAction.toUpperCase()}
            </span>
            <span class="panel-numeric-code" aria-hidden="true">${this._generatePanelCode(primary.entity.entity_id)}</span>
          </div>

          <!-- Sensors (left) -->
          <div class="climate-sensors" role="list" aria-label="${deviceName} readings">
            ${currentTemp != null ? html`
              <div class="device-sensor-line" role="listitem" aria-label="Current temperature: ${currentTemp}°">
                <div class="sensor-indicator" style="background:${actionColor}"></div>
                <span class="sensor-label">Current</span>
                <span class="sensor-state-value" style="color:${actionColor}">${Math.round(currentTemp)}°</span>
              </div>
            ` : ''}
            ${isDual ? html`
              <div class="device-sensor-line" role="listitem" aria-label="Heat target: ${targetLow}°">
                <div class="sensor-indicator" style="background:var(--lcars-butterscotch)"></div>
                <span class="sensor-label">Heat To</span>
                <span class="sensor-state-value" style="color:var(--lcars-butterscotch)">${targetLow}°</span>
              </div>
              <div class="device-sensor-line" role="listitem" aria-label="Cool target: ${targetHigh}°">
                <div class="sensor-indicator" style="background:var(--lcars-ice)"></div>
                <span class="sensor-label">Cool To</span>
                <span class="sensor-state-value" style="color:var(--lcars-ice)">${targetHigh}°</span>
              </div>
            ` : targetTemp != null ? html`
              <div class="device-sensor-line" role="listitem" aria-label="Target temperature: ${targetTemp}°">
                <div class="sensor-indicator" style="background:${actionColor}"></div>
                <span class="sensor-label">Target</span>
                <span class="sensor-state-value" style="color:${actionColor}">${targetTemp}°</span>
              </div>
            ` : ''}
            ${humidity ? html`
              <div class="device-sensor-line" role="listitem"
                aria-label="Humidity: ${humidity.state.state}%"
                @click=${() => this._handleEntityClick(humidity.entity.entity_id)}>
                <div class="sensor-indicator" style="background:var(--lcars-ice)"></div>
                <span class="sensor-label">Humidity</span>
                <span class="sensor-state-value" style="color:var(--lcars-ice)">${humidity.state.state}%</span>
              </div>
            ` : ''}
            <div class="battery-section-divider"></div>
            <div class="device-sensor-line" role="listitem" aria-label="HVAC mode: ${currentMode}">
              <div class="sensor-indicator" style="background:${actionColor}"></div>
              <span class="sensor-label">Mode</span>
              <span class="sensor-state-value">${currentMode}</span>
            </div>
            ${currentFanMode ? html`
              <div class="device-sensor-line" role="listitem" aria-label="Fan mode: ${currentFanMode}">
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
                    aria-label="${name}: ${state.state}"
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

          <!-- Viewscreen (right) -->
          <div class="climate-viewscreen" tabindex="0"
            @click=${() => this._handleEntityClick(primary.entity.entity_id)}
            @keydown=${(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._handleEntityClick(primary.entity.entity_id); } }}>
            ${this._renderClimateArc(currentTemp, isDual ? (targetLow + targetHigh) / 2 : targetTemp, minTemp, maxTemp, actionColor)}
            <!-- Setpoint controls -->
            <div class="climate-setpoint-controls">
              ${isDual ? html`
                <div class="climate-setpoint-row">
                  <button class="climate-sp-btn" aria-label="Decrease heat target"
                    @click=${(e) => { e.stopPropagation(); this._handleClimateSetpoint(primary.entity.entity_id, attrs, targetLow - step, true, 'low'); }}>−</button>
                  <span class="climate-sp-label" style="color:var(--lcars-butterscotch)">HEAT ${targetLow}°</span>
                  <button class="climate-sp-btn" aria-label="Increase heat target"
                    @click=${(e) => { e.stopPropagation(); this._handleClimateSetpoint(primary.entity.entity_id, attrs, targetLow + step, true, 'low'); }}>+</button>
                </div>
                <div class="climate-setpoint-row">
                  <button class="climate-sp-btn" aria-label="Decrease cool target"
                    @click=${(e) => { e.stopPropagation(); this._handleClimateSetpoint(primary.entity.entity_id, attrs, targetHigh - step, true, 'high'); }}>−</button>
                  <span class="climate-sp-label" style="color:var(--lcars-ice)">COOL ${targetHigh}°</span>
                  <button class="climate-sp-btn" aria-label="Increase cool target"
                    @click=${(e) => { e.stopPropagation(); this._handleClimateSetpoint(primary.entity.entity_id, attrs, targetHigh + step, true, 'high'); }}>+</button>
                </div>
              ` : targetTemp != null ? html`
                <div class="climate-setpoint-row">
                  <button class="climate-sp-btn" aria-label="Decrease target temperature"
                    @click=${(e) => { e.stopPropagation(); this._handleClimateSetpoint(primary.entity.entity_id, attrs, targetTemp - step, false); }}>−</button>
                  <span class="climate-sp-label" style="color:${actionColor}">TARGET ${targetTemp}°</span>
                  <button class="climate-sp-btn" aria-label="Increase target temperature"
                    @click=${(e) => { e.stopPropagation(); this._handleClimateSetpoint(primary.entity.entity_id, attrs, targetTemp + step, false); }}>+</button>
                </div>
              ` : ''}
            </div>
          </div>

          <!-- HVAC Mode Strip -->
          ${hvacModes.length > 1 ? html`
            <div class="climate-modes" role="radiogroup" aria-label="HVAC mode">
              ${hvacModes.map(mode => html`
                <button class="climate-mode-btn" role="radio"
                  aria-checked="${mode === currentMode}"
                  ?data-active=${mode === currentMode}
                  @click=${() => this._handleClimateMode(primary.entity.entity_id, mode)}>
                  ${mode.toUpperCase().replace('_', ' ')}
                </button>
              `)}
            </div>
          ` : ''}

          <!-- Fan Mode + Preset Strips -->
          <div class="climate-aux-controls">
            ${fanModes.length > 1 ? html`
              <div class="climate-aux-strip" role="radiogroup" aria-label="Fan mode">
                ${fanModes.map(fm => html`
                  <button class="climate-mode-btn" role="radio"
                    aria-checked="${fm === currentFanMode}"
                    ?data-active=${fm === currentFanMode}
                    @click=${() => this._handleClimateFanMode(primary.entity.entity_id, fm)}>
                    ${fm.toUpperCase().replace('_', ' ')}
                  </button>
                `)}
              </div>
            ` : ''}
            ${presetModes.length > 0 ? html`
              <div class="climate-aux-strip" role="radiogroup" aria-label="Preset mode">
                ${presetModes.map(pm => html`
                  <button class="climate-mode-btn" role="radio"
                    aria-checked="${pm === currentPreset}"
                    ?data-active=${pm === currentPreset}
                    @click=${() => this._handleClimatePreset(primary.entity.entity_id, pm)}>
                    ${pm.toUpperCase().replace('_', ' ')}
                  </button>
                `)}
              </div>
            ` : ''}
          </div>
          <div class="panel-pip-strip" aria-hidden="true"></div>
        </div>
      `;
    }

    /* ═══════════════════════════════════════════════════════════════════════ */
    /* ═══ ALARM PANEL — SimpliSafe, Honeywell, Ring ═══════════════════════ */
    /* ═══════════════════════════════════════════════════════════════════════ */

    _alarmPinCode = '';
    _alarmPinLimiter = createRateLimiter(3, 60000);
    _alarmCountdown = null;
    _alarmCountdownTimer = null;
    _alarmPinError = false;

    _partitionAlarmEntities(entries, categoryEntities) {
      const alarm = [];
      const zones = [];
      const auxiliary = [];
      const diagnostics = [];

      const ZONE_CLASSES = new Set([
        'door', 'window', 'motion', 'vibration', 'moisture',
        'cold', 'smoke', 'safety', 'opening', 'garage_door', 'lock', 'tamper', 'problem',
      ]);

      for (const entry of entries) {
        if (entry.domain === 'alarm_control_panel') { alarm.push(entry); continue; }
        if (entry.domain === 'binary_sensor') {
          const dc = entry.state?.attributes?.device_class || '';
          if (ZONE_CLASSES.has(dc)) { zones.push(entry); continue; }
        }
        auxiliary.push(entry);
      }

      if (categoryEntities) {
        for (const e of categoryEntities.diagnostic || []) {
          const state = this._getEntityState(e.entity_id);
          if (!state) continue;
          diagnostics.push({ entity: e, domain: e.entity_id.split('.')[0], state });
        }
      }

      return { alarm, zones, auxiliary, diagnostics };
    }

    _handleAlarmPinDigit(digit) {
      if (this._alarmPinCode.length >= 6) return;
      this._alarmPinCode += String(digit).replace(/\D/g, '').charAt(0) || '';
      this._alarmPinError = false;
      this.requestUpdate();
    }

    _handleAlarmPinClear() {
      this._alarmPinCode = '';
      this._alarmPinError = false;
      this.requestUpdate();
    }

    _handleAlarmArm(entityId, mode) {
      const code = this._alarmPinCode || undefined;
      const service = `alarm_arm_${mode}`;
      this._hass.callService('alarm_control_panel', service, {
        entity_id: entityId,
        ...(code ? { code } : {}),
      });
      this._alarmPinCode = '';
      this.requestUpdate();
    }

    _handleAlarmDisarm(entityId) {
      if (!this._alarmPinLimiter.allow()) {
        this._alarmPinError = true;
        this.requestUpdate();
        return;
      }
      const code = this._alarmPinCode || undefined;
      this._hass.callService('alarm_control_panel', 'alarm_disarm', {
        entity_id: entityId,
        ...(code ? { code } : {}),
      });
      this._alarmPinCode = '';
      this.requestUpdate();
    }

    _startAlarmCountdown(seconds) {
      this._alarmCountdown = Math.max(0, seconds);
      if (this._alarmCountdownTimer) clearInterval(this._alarmCountdownTimer);
      this._alarmCountdownTimer = setInterval(() => {
        this._alarmCountdown = Math.max(0, (this._alarmCountdown || 0) - 1);
        this.requestUpdate();
        if (this._alarmCountdown <= 0) {
          clearInterval(this._alarmCountdownTimer);
          this._alarmCountdownTimer = null;
        }
      }, 1000);
    }

    _stopAlarmCountdown() {
      if (this._alarmCountdownTimer) {
        clearInterval(this._alarmCountdownTimer);
        this._alarmCountdownTimer = null;
      }
      this._alarmCountdown = null;
    }

    _getAlarmShieldSymbol(alarmState) {
      switch (alarmState) {
        case 'disarmed':       return '✓';
        case 'armed_home':
        case 'armed_night':    return '◉';
        case 'armed_away':
        case 'armed_vacation': return '▲';
        case 'triggered':      return '✕';
        case 'arming':
        case 'pending':
        case 'disarming':      return '⋯';
        default:               return '?';
      }
    }

    _getAlarmStateLabel(alarmState) {
      return (alarmState || 'unknown').toUpperCase().replace(/_/g, ' ');
    }

    _handleAlarmKeydown(e, entityId) {
      const key = e.key;
      if (/^[0-9]$/.test(key)) { e.preventDefault(); this._handleAlarmPinDigit(key); }
      else if (key === 'Backspace') { e.preventDefault(); this._alarmPinCode = this._alarmPinCode.slice(0, -1); this.requestUpdate(); }
      else if (key === 'Enter') { e.preventDefault(); this._handleAlarmDisarm(entityId); }
      else if (key === 'Escape') { e.preventDefault(); this._handleAlarmPinClear(); }
    }

    _renderAlarmPanel(group) {
      const categoryEntities = this._getDeviceCategoryEntities(group.device.id);
      const { alarm, zones, auxiliary, diagnostics } = this._partitionAlarmEntities(group.entities, categoryEntities);
      const deviceName = this._shortDeviceName(group.device) || 'Alarm';

      if (alarm.length === 0) return '';
      const primary = alarm[0];
      const as = primary.state;
      const alarmState = as?.state || 'unavailable';
      const stateColor = getAlarmStateColor(alarmState);
      const isTransitional = ['arming', 'pending', 'disarming'].includes(alarmState);
      const isTriggered = alarmState === 'triggered';
      const symbol = this._getAlarmShieldSymbol(alarmState);
      const stateLabel = this._getAlarmStateLabel(alarmState);
      const armModes = ['home', 'away', 'night'];
      const codeRequired = as?.attributes?.code_required !== false;
      const pinDots = Array.from({ length: 6 }, (_, i) => i < this._alarmPinCode.length);

      // Start countdown for transitional states
      if (isTransitional && this._alarmCountdown == null) {
        const delay = as?.attributes?.delay || 60;
        this._startAlarmCountdown(delay);
      } else if (!isTransitional && this._alarmCountdown != null) {
        this._stopAlarmCountdown();
      }

      return html`
        <div class="lcars-device-panel alarm-panel ${isTriggered ? 'alarm-triggered' : ''}" data-panel-type="alarm"
          data-state="${alarmState}"
          style="--panel-frame-color:${stateColor}">
          <!-- Header -->
          <div class="alarm-header">
            <span class="device-panel-name">${deviceName}</span>
            <div class="device-panel-header-line"></div>
            <span class="alarm-state-badge" style="color:${stateColor}">${stateLabel}</span>
            <span class="panel-numeric-code" aria-hidden="true">${this._generatePanelCode(primary.entity.entity_id)}</span>
          </div>

          <!-- Zones (left) -->
          <div class="alarm-sensors" role="list" aria-label="${deviceName} zones">
            ${zones.map(({ entity, state }) => {
              const name = this._friendlyName(state, entity);
              const isOpen = state.state === 'on';
              const color = isOpen ? 'var(--lcars-butterscotch)' : 'var(--lcars-gray)';
              return html`
                <div class="device-sensor-line" tabindex="0" role="listitem"
                  aria-label="${name}: ${isOpen ? 'open' : 'closed'}"
                  @click=${() => this._handleEntityClick(entity.entity_id)}
                  @keydown=${(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._handleEntityClick(entity.entity_id); } }}>
                  <div class="sensor-indicator" style="background:${color}"></div>
                  <span class="sensor-label">${name}</span>
                  <span class="sensor-state-value" style="color:${color}">${isOpen ? 'OPEN' : 'CLOSED'}</span>
                </div>
              `;
            })}
            ${auxiliary.length > 0 ? html`
              <div class="battery-section-divider"></div>
              ${auxiliary.map(({ entity, state }) => {
                const name = this._friendlyName(state, entity);
                const color = this._getSensorIndicatorColor(state);
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

          <!-- Viewscreen (right) -->
          <div class="alarm-viewscreen">
            ${isTransitional && this._alarmCountdown != null ? html`
              <div class="alarm-countdown" aria-live="polite">
                <span class="alarm-countdown-num" style="color:${stateColor}">${this._alarmCountdown}</span>
                <span class="alarm-countdown-label">${stateLabel}</span>
              </div>
            ` : html`
              <svg class="alarm-shield" viewBox="0 0 160 180" role="img"
                aria-label="${deviceName}: ${stateLabel}">
                <path d="M80,10 L145,45 L145,110 Q145,160 80,175 Q15,160 15,110 L15,45 Z"
                  fill="none" stroke="${stateColor}" stroke-width="4" />
                <text x="80" y="105" text-anchor="middle" fill="${stateColor}"
                  font-family="var(--lcars-font)" font-size="48">${symbol}</text>
                <text x="80" y="145" text-anchor="middle" fill="${stateColor}"
                  font-family="var(--lcars-font)" font-size="14">${stateLabel}</text>
              </svg>
            `}
            <!-- Arm mode strip -->
            <div class="alarm-arm-strip" role="radiogroup" aria-label="Arm mode">
              ${armModes.map(mode => {
                const isActive = alarmState === `armed_${mode}`;
                return html`
                  <button class="alarm-arm-btn" role="radio"
                    aria-checked="${isActive}"
                    ?data-active=${isActive}
                    @click=${() => this._handleAlarmArm(primary.entity.entity_id, mode)}>
                    ${mode.toUpperCase()}
                  </button>
                `;
              })}
            </div>
          </div>

          <!-- PIN Keypad -->
          ${codeRequired ? html`
            <div class="alarm-keypad" tabindex="0" aria-label="PIN keypad"
              @keydown=${(e) => this._handleAlarmKeydown(e, primary.entity.entity_id)}>
              <div class="alarm-code-display ${this._alarmPinError ? 'alarm-pin-error' : ''}" role="status" aria-live="polite">
                ${pinDots.map(filled => html`
                  <div class="alarm-code-dot ${filled ? 'filled' : ''}"
                    style="background:${filled ? (this._alarmPinError ? 'var(--lcars-tomato)' : stateColor) : 'var(--lcars-disabled)'}"></div>
                `)}
              </div>
              <div class="alarm-digit-grid">
                ${[1,2,3,4,5,6,7,8,9].map(d => html`
                  <button class="alarm-digit-btn" aria-label="Digit ${d}"
                    @click=${() => this._handleAlarmPinDigit(d)}>${d}</button>
                `)}
                <button class="alarm-digit-btn alarm-action-btn" aria-label="Clear code"
                  @click=${() => this._handleAlarmPinClear()}>⌫</button>
                <button class="alarm-digit-btn" aria-label="Digit 0"
                  @click=${() => this._handleAlarmPinDigit(0)}>0</button>
                <button class="alarm-digit-btn alarm-action-btn" aria-label="Disarm"
                  @click=${() => this._handleAlarmDisarm(primary.entity.entity_id)}>⏎</button>
              </div>
            </div>
          ` : ''}
          <div class="panel-pip-strip" aria-hidden="true"></div>
        </div>
      `;
    }

    /* ═══════════════════════════════════════════════════════════════════════ */
    /* ═══ MEDIA PANEL — Apple TV, HomePod, Sonos ═════════════════════════ */
    /* ═══════════════════════════════════════════════════════════════════════ */

    _isValidArtworkUrl(url) {
      if (!url) return false;
      return url.startsWith('/api/') || url.startsWith('/local/');
    }

    _getMediaTransportSymbol(state) {
      switch (state) {
        case 'playing': return '▶';
        case 'paused':  return '❚❚';
        default:        return '■';
      }
    }

    _partitionMediaEntities(entries) {
      const player = [];
      const sensors = [];
      const controls = [];
      const remotes = [];
      for (const entry of entries) {
        if (entry.domain === 'media_player') { player.push(entry); continue; }
        if (entry.domain === 'remote') { remotes.push(entry); continue; }
        if (SENSOR_DOMAINS.has(entry.domain)) { sensors.push(entry); continue; }
        controls.push(entry);
      }
      return { player, sensors, controls, remotes };
    }

    _handleMediaService(entityId, service, data = {}) {
      this._hass.callService('media_player', service, { entity_id: entityId, ...data });
    }

    _handleVolumeChange(entityId, e) {
      const rect = e.currentTarget.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      this._handleMediaService(entityId, 'volume_set', { volume_level: Math.round(pct * 100) / 100 });
    }

    _renderMediaPanel(group) {
      const { player, sensors, controls, remotes } = this._partitionMediaEntities(group.entities);
      const deviceName = this._shortDeviceName(group.device) || 'Media';

      if (player.length === 0) return '';
      const primary = player[0];
      const ms = primary.state;
      const attrs = ms?.attributes || {};
      const playerState = ms?.state || 'unavailable';
      const stateColor = getPlaybackStateColor(playerState);
      const transportSymbol = this._getMediaTransportSymbol(playerState);
      const isPlaying = playerState === 'playing';
      const isPaused = playerState === 'paused';
      const isIdle = !isPlaying && !isPaused;
      const artUrl = attrs.entity_picture;
      const validArt = this._isValidArtworkUrl(artUrl);
      const title = attrs.media_title || '';
      const artist = attrs.media_artist || '';
      const source = attrs.source || '';
      const volume = attrs.volume_level != null ? Number(attrs.volume_level) : 0;
      const isMuted = attrs.is_volume_muted || false;
      const sources = attrs.source_list || [];
      const features = attrs.supported_features || 0;
      // Feature flags from HA
      const supportsPrev = (features & 16) !== 0;
      const supportsNext = (features & 32) !== 0;
      const supportsPause = (features & 1) !== 0;
      const supportsVolume = (features & 4) !== 0;
      const supportsShuffle = (features & 32768) !== 0;
      const supportsRepeat = (features & 262144) !== 0;
      const shuffle = attrs.shuffle || false;
      const repeat = attrs.repeat || 'off';

      return html`
        <div class="lcars-device-panel media-panel ${isIdle ? 'media-idle' : ''}" data-panel-type="media"
          style="--panel-frame-color:var(--lcars-african-violet)">
          <!-- Header -->
          <div class="media-header">
            <span class="device-panel-name">${deviceName}</span>
            <div class="device-panel-header-line"></div>
            <span class="media-state-badge" style="color:${stateColor}">${transportSymbol} ${playerState.toUpperCase()}</span>
            <span class="panel-numeric-code" aria-hidden="true">${this._generatePanelCode(primary.entity.entity_id)}</span>
          </div>

          <!-- Metadata (left) -->
          <div class="media-metadata" role="list" aria-label="${deviceName} info">
            ${source ? html`
              <div class="device-sensor-line" role="listitem">
                <div class="sensor-indicator" style="background:var(--lcars-african-violet)"></div>
                <span class="sensor-label">Source</span>
                <span class="sensor-state-value">${source}</span>
              </div>
            ` : ''}
            ${supportsShuffle ? html`
              <div class="device-sensor-line" role="listitem">
                <div class="sensor-indicator" style="background:${shuffle ? 'var(--lcars-african-violet)' : 'var(--lcars-gray)'}"></div>
                <span class="sensor-label">Shuffle</span>
                <span class="sensor-state-value">${shuffle ? 'ON' : 'OFF'}</span>
              </div>
            ` : ''}
            ${supportsRepeat ? html`
              <div class="device-sensor-line" role="listitem">
                <div class="sensor-indicator" style="background:${repeat !== 'off' ? 'var(--lcars-african-violet)' : 'var(--lcars-gray)'}"></div>
                <span class="sensor-label">Repeat</span>
                <span class="sensor-state-value">${repeat.toUpperCase()}</span>
              </div>
            ` : ''}
            ${sensors.map(({ entity, state }) => {
              const name = this._friendlyName(state, entity);
              const color = this._getSensorIndicatorColor(state);
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
          </div>

          <!-- Viewscreen (right) -->
          <div class="media-viewscreen ${isPlaying ? 'media-viewscreen-glow' : ''}" @click=${() => this._handleEntityClick(primary.entity.entity_id)}>
            ${validArt && !isIdle ? html`
              <img class="media-art" src="${artUrl}" alt="Album art"
                crossorigin="anonymous" referrerpolicy="no-referrer" loading="lazy"
                @error=${(e) => { e.target.style.display = 'none'; }} />
            ` : html`
              <div class="media-idle-display">
                <span class="media-idle-glyph">&#9834;</span>
                <span class="media-idle-label">STANDBY</span>
              </div>
            `}
            ${!isIdle ? html`
              <div class="media-now-playing">
                ${title ? html`<div class="media-title">${title}</div>` : ''}
                ${artist ? html`<div class="media-artist">${artist}</div>` : ''}
              </div>
            ` : ''}
          </div>

          <!-- Audio Waveform (12 bars, 4 groups — Data C-1/C-2) -->
          <div class="lcars-audio-waveform" ?data-paused=${!isPlaying} aria-hidden="true">
            ${Array.from({ length: 12 }, (_, i) => {
              const group = Math.floor(i / 3);
              const baseDur = [380, 420, 350, 460][group];
              const delay = i * 50;
              const isPeak = i === 2 || i === 8;
              return html`<div class="bar ${isPeak ? 'peak' : ''}"
                style="--bar-dur:${baseDur + (i % 3) * 30}ms;--bar-delay:${delay}ms;--bar-min-ratio:${0.1 + group * 0.05}"></div>`;
            })}
          </div>

          <!-- Transport + Volume (bottom) -->
          <div class="media-controls">
            <div class="media-transport" aria-label="Transport controls">
              ${supportsShuffle ? html`
                <button class="media-transport-btn" aria-pressed="${shuffle}" title="Shuffle"
                  @click=${() => this._handleMediaService(primary.entity.entity_id, 'shuffle_set', { shuffle: !shuffle })}>⇄</button>
              ` : ''}
              ${supportsPrev ? html`
                <button class="media-transport-btn" title="Previous"
                  @click=${() => this._handleMediaService(primary.entity.entity_id, 'media_previous_track')}>⏮</button>
              ` : ''}
              <button class="media-transport-btn media-play-btn" title="${isPlaying ? 'Pause' : 'Play'}"
                @click=${() => this._handleMediaService(primary.entity.entity_id, isPlaying ? 'media_pause' : 'media_play')}>
                ${isPlaying ? '❚❚' : '▶'}
              </button>
              ${supportsNext ? html`
                <button class="media-transport-btn" title="Next"
                  @click=${() => this._handleMediaService(primary.entity.entity_id, 'media_next_track')}>⏭</button>
              ` : ''}
              ${supportsRepeat ? html`
                <button class="media-transport-btn" aria-pressed="${repeat !== 'off'}" title="Repeat: ${repeat}"
                  @click=${() => this._handleMediaService(primary.entity.entity_id, 'repeat_set', { repeat: repeat === 'off' ? 'all' : repeat === 'all' ? 'one' : 'off' })}>🔁</button>
              ` : ''}
            </div>
            ${supportsVolume ? html`
              <div class="media-volume" aria-label="Volume: ${Math.round(volume * 100)}%">
                <button class="media-mute-btn" aria-pressed="${isMuted}" title="${isMuted ? 'Unmute' : 'Mute'}"
                  @click=${() => this._handleMediaService(primary.entity.entity_id, 'volume_mute', { is_volume_muted: !isMuted })}>
                  ${isMuted ? '🔇' : '🔊'}
                </button>
                <div class="media-volume-bar" tabindex="0" role="slider"
                  aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(volume * 100)}"
                  @click=${(e) => this._handleVolumeChange(primary.entity.entity_id, e)}
                  @keydown=${(e) => {
                    if (e.key === 'ArrowRight') { e.preventDefault(); this._handleMediaService(primary.entity.entity_id, 'volume_set', { volume_level: Math.min(1, volume + 0.05) }); }
                    if (e.key === 'ArrowLeft') { e.preventDefault(); this._handleMediaService(primary.entity.entity_id, 'volume_set', { volume_level: Math.max(0, volume - 0.05) }); }
                  }}>
                  <div class="media-volume-fill" style="width:${Math.round(volume * 100)}%"></div>
                </div>
                <span class="media-volume-pct">${Math.round(volume * 100)}%</span>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }

    /* ═══════════════════════════════════════════════════════════════════════ */
    /* ═══ POOL & SPA PANEL — Pentair ScreenLogic ═════════════════════════ */
    /* ═══════════════════════════════════════════════════════════════════════ */

    _partitionPoolEntities(entries) {
      const pool = [];
      const spa = [];
      const chemistry = [];
      const pumps = [];
      const circuits = [];
      const lights = [];
      const environmental = [];
      const diagnostics = [];

      const CHEM_KEYS = /orp|ph_|salt|tds|saturation|calcium|alkalinity|cyanuric/i;

      for (const entry of entries) {
        const eid = entry.entity.entity_id;
        const domain = entry.domain;
        const attrs = entry.state?.attributes || {};

        // Pool vs spa climate entities
        if (domain === 'climate') {
          if (/spa/i.test(eid)) spa.push(entry);
          else pool.push(entry);
          continue;
        }
        // Lights
        if (domain === 'light') { lights.push(entry); continue; }
        // Chemistry sensors
        if (domain === 'sensor' && CHEM_KEYS.test(eid)) { chemistry.push(entry); continue; }
        // Pump/circuit switches
        if (domain === 'switch') {
          if (/pump/i.test(eid)) pumps.push(entry);
          else circuits.push(entry);
          continue;
        }
        // Environmental (air temp, etc.)
        if (domain === 'sensor') {
          const dc = attrs.device_class || '';
          if (dc === 'temperature') { environmental.push(entry); continue; }
        }
        diagnostics.push(entry);
      }

      return { pool, spa, chemistry, pumps, circuits, lights, environmental, diagnostics };
    }

    _handlePoolSetpoint(entityId, attrs, value) {
      const clamped = clampSetpoint(value, attrs, { min: 40, max: 104 });
      if (!this._poolSetpointDebouncer) {
        this._poolSetpointDebouncer = createDebouncer((eid, temp) => {
          this._hass.callService('climate', 'set_temperature', { entity_id: eid, temperature: temp });
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

      return html`
        <div class="pool-body-frame" style="--body-color:${bodyColor}" role="region"
          aria-label="${label}: ${currentTemp != null ? currentTemp + '°' : 'N/A'}, target ${targetTemp || 'N/A'}°">
          <div class="pool-body-label" style="color:${bodyColor}">${label}</div>
          <div class="pool-body-temp">${currentTemp != null ? `${Math.round(currentTemp)}°` : '—'}</div>
          ${targetTemp != null ? html`
            <div class="pool-setpoint-row">
              <button class="climate-sp-btn" aria-label="Decrease ${label} target"
                @click=${() => this._handlePoolSetpoint(primary.entity.entity_id, attrs, targetTemp - (step || 1))}>−</button>
              <span class="pool-target" style="color:${bodyColor}">${targetTemp}°</span>
              <button class="climate-sp-btn" aria-label="Increase ${label} target"
                @click=${() => this._handlePoolSetpoint(primary.entity.entity_id, attrs, targetTemp + (step || 1))}>+</button>
            </div>
          ` : ''}
          <div class="panel-pip-strip" aria-hidden="true"></div>
        </div>
      `;
    }

    _renderPoolSpaPanel(group) {
      const { pool, spa, chemistry, pumps, circuits, lights, environmental, diagnostics } = this._partitionPoolEntities(group.entities);
      const deviceName = this._shortDeviceName(group.device) || 'Pool & Spa';
      const hasChem = chemistry.length > 0;

      // Header temp badges
      const poolTemp = pool[0]?.state?.attributes?.current_temperature;
      const spaTemp = spa[0]?.state?.attributes?.current_temperature;
      const airEntry = environmental.find(e => /air/i.test(e.entity.entity_id));
      const airTemp = airEntry?.state?.state;

      return html`
        <div class="lcars-device-panel pool-panel ${hasChem ? '' : 'pool-no-chem'}" data-panel-type="aquatics"
          style="--panel-frame-color:var(--lcars-bluey)">
          <!-- Header -->
          <div class="pool-header">
            <span class="device-panel-name">${deviceName}</span>
            <div class="device-panel-header-line"></div>
            ${poolTemp != null ? html`<span class="pool-temp-badge" style="color:var(--lcars-ice)">POOL ${Math.round(poolTemp)}°</span>` : ''}
            ${spaTemp != null ? html`<span class="pool-temp-badge" style="color:var(--lcars-butterscotch)">SPA ${Math.round(spaTemp)}°</span>` : ''}
            ${airTemp != null ? html`<span class="pool-temp-badge" style="color:var(--lcars-space-white)">AIR ${Math.round(Number(airTemp))}°</span>` : ''}
            <span class="panel-numeric-code" aria-hidden="true">${this._generatePanelCode(pool[0]?.entity?.entity_id || spa[0]?.entity?.entity_id || group.device.id)}</span>
          </div>

          <!-- Chemistry (left, conditional) -->
          ${hasChem ? html`
            <div class="pool-chemistry" role="list" aria-label="Water chemistry">
              ${chemistry.map(({ entity, state }) => {
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
          ` : ''}

          <!-- Aquatics (center) -->
          <div class="pool-aquatics">
            ${this._renderPoolBody(pool, 'pool', 1)}
            ${this._renderPoolBody(spa, 'spa', 1)}
          </div>

          <!-- Controls (right) -->
          <div class="pool-controls" aria-label="Circuit controls">
            ${[...pumps, ...circuits].map(({ entity, state }, idx) => {
              const name = this._friendlyName(state, entity);
              const isOn = state.state === 'on';
              const isPrimaryPump = idx === 0 && pumps.length > 0 && entity.entity_id === pumps[0].entity.entity_id;
              return html`
                <button class="device-control-btn" role="switch" aria-checked="${isOn}" ?data-on=${isOn}
                  @click=${() => this._handleToggle(entity.entity_id)}
                  title="${name}: ${state.state}">
                  ${isPrimaryPump ? html`
                    <div class="lcars-pump-spinner ${isOn ? 'on' : ''}" aria-hidden="true">
                      <div class="dot"></div><div class="dot"></div><div class="dot"></div>
                    </div>
                  ` : html`<ha-icon .icon=${this._getEntityIcon(state)}></ha-icon>`}
                  <span>${name}</span>
                </button>
              `;
            })}
            ${environmental.map(({ entity, state }) => {
              const name = this._friendlyName(state, entity);
              const unit = state.attributes?.unit_of_measurement || '';
              return html`
                <div class="device-sensor-line" tabindex="0" role="listitem"
                  @click=${() => this._handleEntityClick(entity.entity_id)}>
                  <div class="sensor-indicator" style="background:var(--lcars-data-accent)"></div>
                  <span class="sensor-label">${name}</span>
                  <span class="sensor-state-value">${state.state}${unit ? ' ' + unit : ''}</span>
                </div>
              `;
            })}
          </div>

          <!-- Lighting (bottom, full width) -->
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
          <div class="panel-pip-strip" aria-hidden="true"></div>
        </div>
      `;
    }

    /* ═══════════════════════════════════════════════════════════════════════ */
    /* ═══ WEATHER PANEL — Davis Instruments, WeatherFlow ═════════════════ */
    /* ═══════════════════════════════════════════════════════════════════════ */

    _weatherForecastCache = {};

    _getWeatherGlyph(condition) {
      const glyphs = {
        'sunny': '☀', 'clear-night': '●', 'partlycloudy': '◑',
        'cloudy': '◔', 'fog': '≡', 'rainy': '▽', 'pouring': '▼',
        'snowy': '✦', 'snowy-rainy': '◆', 'hail': '◆',
        'windy': '〰', 'windy-variant': '〰',
        'lightning': '⚡', 'lightning-rainy': '⚡', 'exceptional': '⚠',
      };
      return glyphs[condition] || '○';
    }

    _getWindCardinal(bearing) {
      if (bearing == null) return '';
      const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
      return dirs[Math.round(bearing / 22.5) % 16];
    }

    _partitionWeatherEntities(entries) {
      const weather = [];
      const sensors = [];
      const lightning = [];
      const precipitation = [];
      const wind = [];
      const diagnostics = [];

      for (const entry of entries) {
        if (entry.domain === 'weather') { weather.push(entry); continue; }
        const eid = entry.entity.entity_id;
        const dc = entry.state?.attributes?.device_class || '';
        if (/lightning/i.test(eid)) { lightning.push(entry); continue; }
        if (dc === 'precipitation' || dc === 'precipitation_intensity' || /rain/i.test(eid)) { precipitation.push(entry); continue; }
        if (dc === 'wind_speed' || /wind/i.test(eid)) { wind.push(entry); continue; }
        if (SENSOR_DOMAINS.has(entry.domain)) { sensors.push(entry); continue; }
        diagnostics.push(entry);
      }

      return { weather, sensors, lightning, precipitation, wind, diagnostics };
    }

    _renderWindCompass(bearing, speed, unit) {
      if (bearing == null) return '';
      const cardinal = this._getWindCardinal(bearing);
      const arrowAngle = bearing; // degrees clockwise from N
      return html`
        <div class="weather-wind-compass" role="img"
          aria-label="Wind: ${speed || '?'} ${unit || 'mph'} from ${cardinal}">
          <svg viewBox="0 0 80 80" class="wind-svg">
            <circle cx="40" cy="40" r="28" fill="none" stroke="var(--lcars-disabled)" stroke-width="1" />
            <text x="40" y="12" text-anchor="middle" fill="var(--lcars-data-accent)" font-size="7" font-family="var(--lcars-font)">N</text>
            <text x="40" y="76" text-anchor="middle" fill="var(--lcars-data-accent)" font-size="7" font-family="var(--lcars-font)">S</text>
            <text x="8" y="43" text-anchor="middle" fill="var(--lcars-data-accent)" font-size="7" font-family="var(--lcars-font)">W</text>
            <text x="72" y="43" text-anchor="middle" fill="var(--lcars-data-accent)" font-size="7" font-family="var(--lcars-font)">E</text>
            <g transform="rotate(${arrowAngle}, 40, 40)">
              <line x1="40" y1="55" x2="40" y2="18" stroke="var(--lcars-ice)" stroke-width="2" />
              <polygon points="40,15 36,24 44,24" fill="var(--lcars-ice)" />
            </g>
          </svg>
          <div class="wind-reading">${speed || '—'} ${unit || ''} ${cardinal}</div>
        </div>
      `;
    }

    async _loadWeatherForecast(entityId) {
      if (this._weatherForecastCache[entityId]) return;
      const data = await fetchForecasts(this._hass, entityId, 'daily');
      if (data.length > 0) {
        this._weatherForecastCache[entityId] = data;
        this.requestUpdate();
      }
    }

    _renderForecastStrip(forecasts) {
      if (!forecasts?.length) return '';
      const days = forecasts.slice(0, 7);
      const allHighs = days.map(d => d.temperature).filter(Number.isFinite);
      const allLows = days.map(d => d.templow).filter(Number.isFinite);
      const overallMin = Math.min(...allLows, ...allHighs);
      const overallMax = Math.max(...allHighs, ...allLows);
      const overallRange = overallMax - overallMin || 1;

      return html`
        <div class="weather-forecast" role="list" aria-label="7-day forecast">
          ${days.map(day => {
            const date = new Date(day.datetime);
            const dayName = date.toLocaleDateString('en', { weekday: 'short' }).toUpperCase();
            const hi = day.temperature;
            const lo = day.templow;
            const cond = day.condition;
            const glyph = this._getWeatherGlyph(cond);
            const glyphColor = getWeatherConditionColor(cond);
            const precip = day.precipitation_probability;
            const leftPct = ((lo - overallMin) / overallRange) * 100;
            const widthPct = (((hi - lo) || 1) / overallRange) * 100;
            return html`
              <div class="forecast-tile" role="listitem" tabindex="0"
                aria-label="${dayName}: ${cond}, high ${hi}°, low ${lo}°${precip != null ? `, ${precip}% precipitation` : ''}">
                <span class="forecast-day">${dayName}</span>
                <span class="forecast-glyph" style="color:${glyphColor}">${glyph}</span>
                <span class="forecast-hi">${hi != null ? Math.round(hi) : '—'}°</span>
                <div class="forecast-range-bar">
                  <div class="forecast-range-fill" style="left:${leftPct.toFixed(1)}%;width:${widthPct.toFixed(1)}%"></div>
                </div>
                <span class="forecast-lo">${lo != null ? Math.round(lo) : '—'}°</span>
                ${precip != null ? html`<span class="forecast-precip" style="color:${precip > 50 ? 'var(--lcars-sky)' : 'var(--lcars-gray)'}">${precip}%</span>` : ''}
              </div>
            `;
          })}
        </div>
      `;
    }

    _renderWeatherPanel(group) {
      const { weather, sensors, lightning, precipitation, wind, diagnostics } = this._partitionWeatherEntities(group.entities);
      const deviceName = this._shortDeviceName(group.device) || 'Weather';

      if (weather.length === 0) return '';
      const primary = weather[0];
      const ws = primary.state;
      const attrs = ws?.attributes || {};
      const condition = ws?.state || 'unavailable';
      const condColor = getWeatherConditionColor(condition);
      const glyph = this._getWeatherGlyph(condition);
      const currentTemp = attrs.temperature;
      const humidity = attrs.humidity;
      const pressure = attrs.pressure;
      const windSpeed = attrs.wind_speed;
      const windBearing = attrs.wind_bearing;
      const windUnit = attrs.wind_speed_unit || 'mph';

      // Trigger async forecast load
      this._loadWeatherForecast(primary.entity.entity_id);
      const forecasts = this._weatherForecastCache[primary.entity.entity_id];

      return html`
        <div class="lcars-device-panel weather-panel" data-panel-type="weather"
          style="--panel-frame-color:${condColor}">
          <!-- Header -->
          <div class="weather-header">
            <span class="device-panel-name">${deviceName}</span>
            <div class="device-panel-header-line"></div>
            <span class="weather-condition-badge" style="color:${condColor}">
              ${glyph} ${condition.toUpperCase().replace(/[_-]/g, ' ')}
            </span>
            <span class="panel-numeric-code" aria-hidden="true">${this._generatePanelCode(primary.entity.entity_id)}</span>
          </div>

          <!-- Sensors (left) -->
          <div class="weather-sensors" role="list" aria-label="${deviceName} readings">
            ${humidity != null ? html`
              <div class="device-sensor-line" role="listitem" aria-label="Humidity: ${humidity}%">
                <div class="sensor-indicator" style="background:var(--lcars-ice)"></div>
                <span class="sensor-label">Humidity</span>
                <span class="sensor-state-value" style="color:var(--lcars-ice)">${humidity}%</span>
              </div>
            ` : ''}
            ${pressure != null ? html`
              <div class="device-sensor-line" role="listitem" aria-label="Pressure: ${pressure}">
                <div class="sensor-indicator" style="background:var(--lcars-data-accent)"></div>
                <span class="sensor-label">Pressure</span>
                <span class="sensor-state-value">${pressure}</span>
              </div>
            ` : ''}
            ${lightning.map(({ entity, state }) => {
              const name = this._friendlyName(state, entity);
              const unit = state.attributes?.unit_of_measurement || '';
              return html`
                <div class="device-sensor-line" tabindex="0" role="listitem"
                  aria-label="${name}: ${state.state}${unit ? ' ' + unit : ''}"
                  @click=${() => this._handleEntityClick(entity.entity_id)}>
                  <div class="sensor-indicator" style="background:var(--lcars-gold)"></div>
                  <span class="sensor-label">${name}</span>
                  <span class="sensor-state-value" style="color:var(--lcars-gold)">${state.state}${unit ? ' ' + unit : ''}</span>
                </div>
              `;
            })}
            ${precipitation.map(({ entity, state }) => {
              const name = this._friendlyName(state, entity);
              const unit = state.attributes?.unit_of_measurement || '';
              return html`
                <div class="device-sensor-line" tabindex="0" role="listitem"
                  aria-label="${name}: ${state.state}${unit ? ' ' + unit : ''}"
                  @click=${() => this._handleEntityClick(entity.entity_id)}>
                  <div class="sensor-indicator" style="background:var(--lcars-sky)"></div>
                  <span class="sensor-label">${name}</span>
                  <span class="sensor-state-value" style="color:var(--lcars-sky)">${state.state}${unit ? ' ' + unit : ''}</span>
                </div>
              `;
            })}
            ${sensors.map(({ entity, state }) => {
              const name = this._friendlyName(state, entity);
              const unit = state.attributes?.unit_of_measurement || '';
              const color = this._getSensorIndicatorColor(state);
              return html`
                <div class="device-sensor-line" tabindex="0" role="listitem"
                  aria-label="${name}: ${state.state}${unit ? ' ' + unit : ''}"
                  @click=${() => this._handleEntityClick(entity.entity_id)}
                  @keydown=${(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._handleEntityClick(entity.entity_id); } }}>
                  <div class="sensor-indicator" style="background:${color}"></div>
                  <span class="sensor-label">${name}</span>
                  <span class="sensor-state-value" style="color:${color}">${state.state}${unit ? ' ' + unit : ''}</span>
                </div>
              `;
            })}
          </div>

          <!-- Viewscreen (right) -->
          <div class="weather-viewscreen" role="img"
            aria-label="${condition}: ${currentTemp != null ? currentTemp + '°' : 'N/A'}">
            <svg class="weather-display" viewBox="0 0 200 160">
              <text x="100" y="35" text-anchor="middle" fill="${condColor}"
                font-family="var(--lcars-font)" font-size="28">${glyph}</text>
              <text x="100" y="85" text-anchor="middle" fill="${condColor}"
                font-family="var(--lcars-font)" font-size="48" font-weight="bold">
                ${currentTemp != null ? `${Math.round(currentTemp)}°` : '—'}
              </text>
              <text x="100" y="108" text-anchor="middle" fill="var(--lcars-data-accent)"
                font-family="var(--lcars-font)" font-size="12">
                ${condition.toUpperCase().replace(/[_-]/g, ' ')}
              </text>
            </svg>
            ${this._renderWindCompass(windBearing, windSpeed, windUnit)}
          </div>

          <!-- Forecast (bottom) -->
          ${this._renderForecastStrip(forecasts)}
          <div class="panel-pip-strip" aria-hidden="true"></div>
        </div>
      `;
    }

    /* ═══════════════════════════════════════════════════════════════════════ */
    /* ═══ IRRIGATION PANEL — Rachio ══════════════════════════════════════ */
    /* ═══════════════════════════════════════════════════════════════════════ */

    _irrigationLimiter = createRateLimiter(5, 10000);

    _partitionIrrigationEntities(entries) {
      const zones = [];
      const sensors = [];
      const controller = [];

      for (const entry of entries) {
        const domain = entry.domain;
        const eid = entry.entity.entity_id;
        const attrs = entry.state?.attributes || {};

        if (domain === 'switch') {
          if (attrs.zone_number != null || /zone/i.test(eid)) {
            zones.push(entry);
          } else {
            controller.push(entry);
          }
          continue;
        }
        if (domain === 'binary_sensor' && !controller.some(c => true)) {
          controller.push(entry);
          continue;
        }
        sensors.push(entry);
      }

      // Sort zones by zone_number if available
      zones.sort((a, b) => {
        const za = a.state?.attributes?.zone_number ?? 999;
        const zb = b.state?.attributes?.zone_number ?? 999;
        return za - zb;
      });

      return { zones, sensors, controller };
    }

    _handleIrrigationZone(entityId, turnOn) {
      if (!this._irrigationLimiter.allow()) return;
      this._hass.callService('switch', turnOn ? 'turn_on' : 'turn_off', { entity_id: entityId });
    }

    /* ─── Delegate to extracted <lcars-irrigation-panel> component ─── */
    _renderIrrigationPanel(group) {
      return html`
        <lcars-irrigation-panel
          .group=${group}
          .hass=${this._hass}
          .editMode=${this._editMode}
          area-id="${this.selectedArea || ''}">
        </lcars-irrigation-panel>
      `;
    }

    /* ═══════════════════════════════════════════════════════════════════════ */
    /* ═══ POWER PANEL — Energy Monitoring (4X-3) ═════════════════════════ */
    /* ═══════════════════════════════════════════════════════════════════════ */

    _powerToggleLimiter = createRateLimiter(10, 10000);

    /* ── Format helpers (Wesley §7) ── */

    _formatWatts(watts) {
      if (watts == null) return '—';
      const w = Number(watts);
      if (!Number.isFinite(w)) return '—';
      if (Math.abs(w) >= 10000) return `${(w / 1000).toFixed(1)} kW`;
      return `${Math.round(w)} W`;
    }

    _formatEnergy(kwh) {
      if (kwh == null) return '—';
      const v = Number(kwh);
      if (!Number.isFinite(v)) return '—';
      return `${v.toFixed(1)} kWh`;
    }

    /* ── Power shape indicator (Geordi §2.3 — color-blind safe) ── */

    _getPowerIndicator(watts) {
      if (watts == null || isNaN(watts)) return '✕';
      const w = Math.abs(Number(watts));
      if (w <= 0)    return '○';
      if (w <= 500)  return '●';
      if (w <= 1500) return '●━';
      if (w <= 3000) return '●━━';
      return '●━━━';
    }

    /* ── Partition power device entities (Data C-6) ── */

    _partitionPowerEntities(entries) {
      const switches = [];
      const powerSensors = [];
      const energySensors = [];
      const voltageSensors = [];
      const currentSensors = [];
      const diagnostics = [];

      for (const entry of entries) {
        if (entry.disabled_by || entry.hidden_by) continue;
        const domain = entry.entity?.entity_id?.split('.')[0] || entry.domain;
        const dc = entry.state?.attributes?.device_class || '';
        const unit = entry.state?.attributes?.unit_of_measurement || '';

        if (domain === 'switch') {
          switches.push(entry);
        } else if (dc === 'power' && (unit === 'W' || unit === 'kW')) {
          powerSensors.push(entry);
        } else if (dc === 'energy' && (unit === 'kWh' || unit === 'Wh')) {
          energySensors.push(entry);
        } else if (dc === 'voltage' && unit === 'V') {
          voltageSensors.push(entry);
        } else if (dc === 'current' && unit === 'A') {
          currentSensors.push(entry);
        } else {
          diagnostics.push(entry);
        }
      }

      return { switches, powerSensors, energySensors, voltageSensors, currentSensors, diagnostics };
    }

    /* ── Device classification (Geordi §7.2) ── */

    _classifyPowerDevice(entries, device) {
      const hasPowerSensor = entries.some(e => {
        const dc = e.state?.attributes?.device_class || '';
        return e.domain === 'sensor' && (dc === 'power' || dc === 'energy' || dc === 'voltage' || dc === 'current');
      });
      if (!hasPowerSensor) return null;

      const hasSwitch = entries.some(e => e.domain === 'switch');
      const manufacturer = (device?.manufacturer || '').toLowerCase();
      const model = (device?.model || '').toLowerCase();

      // Emporia Vue — monitoring only, no switches
      if (manufacturer.includes('emporia') || model.includes('vue')) return 'vue';

      // Power strip — HS300 or many switches
      const switchCount = entries.filter(e => e.domain === 'switch').length;
      if (switchCount >= 4 || model.includes('hs300') || model.includes('power strip')) return 'strip';

      // Smart plug with monitoring (KP115, KP125M, HS110, etc.)
      if (hasSwitch) return 'plug';

      // Sensor-only (non-Vue) — treat as circuit
      return 'vue';
    }

    /* ── Extract primary power/energy sensors ── */

    _getPrimaryPower(group) {
      for (const entry of group.entities) {
        const dc = entry.state?.attributes?.device_class || '';
        const unit = entry.state?.attributes?.unit_of_measurement || '';
        if (dc === 'power' && (unit === 'W' || unit === 'kW')) {
          const val = parseFloat(entry.state?.state);
          if (!isNaN(val)) return unit === 'kW' ? val * 1000 : val;
        }
      }
      return null;
    }

    _getPrimaryEnergy(group) {
      for (const entry of group.entities) {
        const dc = entry.state?.attributes?.device_class || '';
        const unit = entry.state?.attributes?.unit_of_measurement || '';
        if (dc === 'energy' && (unit === 'kWh' || unit === 'Wh')) {
          const val = parseFloat(entry.state?.state);
          if (!isNaN(val)) return unit === 'Wh' ? val / 1000 : val;
        }
      }
      return null;
    }

    /* ── 240V pair detection (Geordi §7.4) ── */

    _detect240VPairs(circuits) {
      const L1L2_PATTERN = /^(.+?)[\s_]*(l[12]|line[\s_]*[12])$/i;
      const pairs = new Map();
      const unpaired = [];

      for (const c of circuits) {
        const name = this._shortDeviceName(c.device) || '';
        const match = name.match(L1L2_PATTERN);
        if (match) {
          const baseName = match[1].trim();
          if (!pairs.has(baseName)) pairs.set(baseName, []);
          pairs.get(baseName).push(c);
        } else {
          unpaired.push(c);
        }
      }

      const result = [...unpaired];
      for (const [name, pair] of pairs) {
        if (pair.length === 2) {
          const watts = pair.reduce((sum, p) => sum + (this._getPrimaryPower(p) || 0), 0);
          const kwhToday = pair.reduce((sum, p) => sum + (this._getPrimaryEnergy(p) || 0), 0);
          result.push({
            device: { ...pair[0].device, name },
            entities: pair.flatMap(p => p.entities),
            is240V: true,
            combinedWatts: watts,
            combinedEnergy: kwhToday,
          });
        } else {
          result.push(...pair);
        }
      }

      return result;
    }

    /* ── Sort circuits power-descending (Wesley §6) ── */

    _sortCircuits(circuits) {
      return [...circuits].sort((a, b) => {
        const wA = a.combinedWatts != null ? a.combinedWatts : (this._getPrimaryPower(a) || 0);
        const wB = b.combinedWatts != null ? b.combinedWatts : (this._getPrimaryPower(b) || 0);
        if (wB !== wA) return wB - wA;
        const nA = (a.device?.name || '').toLowerCase();
        const nB = (b.device?.name || '').toLowerCase();
        return nA.localeCompare(nB);
      });
    }

    /* ── Power strip grouping (Wesley §3.2) ── */

    _groupPowerStrips(powerDevices) {
      const strips = new Map();
      const standalone = [];

      // First pass: identify strip parents
      for (const group of powerDevices) {
        if (group.subType === 'strip') {
          strips.set(group.device.id, { parent: group, children: [] });
        }
      }

      // Second pass: assign children via via_device_id
      for (const group of powerDevices) {
        if (group.subType === 'strip') continue;
        if (group.device?.via_device_id) {
          const parentStrip = strips.get(group.device.via_device_id);
          if (parentStrip) {
            parentStrip.children.push(group);
            continue;
          }
        }
        standalone.push(group);
      }

      return { strips, standalone };
    }

    /* ── SVG half-arc power distribution (Wesley §1/Q1) ── */

    _renderPowerArc(circuits, totalWatts) {
      if (!circuits.length || !totalWatts || totalWatts <= 0) return '';

      const thresholds = this._config?.power_thresholds || {};
      const sorted = circuits
        .map(c => ({
          name: this._shortDeviceName(c.device) || 'Unknown',
          watts: c.combinedWatts != null ? c.combinedWatts : (this._getPrimaryPower(c) || 0),
        }))
        .filter(c => c.watts > 0)
        .sort((a, b) => b.watts - a.watts);

      if (sorted.length === 0) return '';

      const top5 = sorted.slice(0, 5);
      const otherWatts = sorted.slice(5).reduce((sum, c) => sum + c.watts, 0);
      if (otherWatts > 0) top5.push({ name: 'OTHER', watts: otherWatts });

      const cx = 120, cy = 100, r = 80;
      const startAngle = Math.PI;
      const totalAngle = Math.PI;
      const GAP = 0.02; // Small gap between segments

      let currentAngle = startAngle;
      const segments = top5.map(seg => {
        const fraction = seg.watts / totalWatts;
        const sweep = Math.max(fraction * totalAngle - GAP, 0.01);
        const endAngle = currentAngle - sweep;
        const color = getPowerColor(seg.watts, thresholds);

        const x1 = cx + r * Math.cos(currentAngle);
        const y1 = cy - r * Math.sin(currentAngle);
        const x2 = cx + r * Math.cos(endAngle);
        const y2 = cy - r * Math.sin(endAngle);
        const largeArc = sweep > Math.PI ? 1 : 0;

        const path = `M ${x1.toFixed(1)},${y1.toFixed(1)} A ${r},${r} 0 ${largeArc},1 ${x2.toFixed(1)},${y2.toFixed(1)}`;
        currentAngle = endAngle - GAP;

        return { path, color, name: seg.name, watts: seg.watts, fraction };
      });

      return html`
        <div class="power-arc-area">
          <svg class="power-distribution-arc" viewBox="0 0 240 120"
            role="img" aria-label="Power distribution: ${this._formatWatts(totalWatts)} total">
            <!-- Background arc -->
            <path d="M ${cx - r},${cy} A ${r},${r} 0 1,1 ${cx + r},${cy}"
              fill="none" stroke="var(--lcars-gray)" stroke-width="10"
              stroke-linecap="butt" opacity="0.15" />
            <!-- Segments -->
            ${segments.map(seg => svg`
              <path d="${seg.path}" fill="none" stroke="${seg.color}"
                stroke-width="10" stroke-linecap="butt">
                <title>${seg.name}: ${Math.round(seg.watts)}W (${Math.round(seg.fraction * 100)}%)</title>
              </path>
            `)}
            <!-- Total text -->
            <text x="${cx}" y="${cy - 15}" text-anchor="middle"
              fill="var(--lcars-text-heading)" font-family="var(--lcars-font)"
              font-size="28" font-weight="bold">
              ${this._formatWatts(totalWatts)}
            </text>
            <text x="${cx}" y="${cy + 5}" text-anchor="middle"
              fill="var(--lcars-space-white)" font-family="var(--lcars-font)"
              font-size="10" opacity="0.7">
              TOTAL
            </text>
          </svg>
        </div>
      `;
    }

    /* ── Singleton popover (Data C-5) ── */

    _showCircuitPopover(circuit) {
      const popover = this.shadowRoot?.querySelector('#power-detail-popover');
      if (!popover) return;

      const watts = circuit.combinedWatts != null ? circuit.combinedWatts : this._getPrimaryPower(circuit);
      const energy = circuit.combinedEnergy != null ? circuit.combinedEnergy : this._getPrimaryEnergy(circuit);
      const thresholds = this._config?.power_thresholds || {};
      const color = getPowerColor(watts, thresholds);
      const label = getPowerLabel(watts, thresholds);
      const name = this._shortDeviceName(circuit.device) || 'Unknown';
      const entityId = circuit.entities?.[0]?.entity?.entity_id;

      const content = popover.querySelector('.popover-content');
      if (content) {
        render(html`
          <div>
            <div class="popover-header">
              <span class="popover-title">${name}</span>
              <span class="popover-status" style="color:${color}">${label}</span>
            </div>
            <div class="popover-hero-value" style="color:${color}">
              ${watts != null ? this._formatWatts(watts) : 'UNAVAILABLE'}
            </div>
            <div class="popover-stats">
              ${energy != null ? html`
                <div class="popover-stat-row">
                  <span class="popover-stat-label">TODAY</span>
                  <span class="popover-stat-value">${this._formatEnergy(energy)}</span>
                </div>
              ` : ''}
              ${circuit.is240V ? html`
                <div class="popover-stat-row">
                  <span class="popover-stat-label">CIRCUIT TYPE</span>
                  <span class="popover-stat-value" style="color:var(--lcars-butterscotch)">240V PAIRED</span>
                </div>
              ` : ''}
            </div>
            ${entityId ? html`
              <button class="popover-history-btn" @click=${() => {
                showMoreInfo(entityId);
                try { popover.hidePopover(); } catch (_) {}
              }}>VIEW FULL HISTORY</button>
            ` : ''}
          </div>
        `, content);
      }

      try {
        popover.showPopover();
      } catch (_) {
        // Fallback for browsers without Popover API
        if (entityId) showMoreInfo(entityId);
      }
    }

    /* ── Circuit tile renderer ── */

    _renderCircuitTile(circuit) {
      const watts = circuit.combinedWatts != null ? circuit.combinedWatts : this._getPrimaryPower(circuit);
      const energy = circuit.combinedEnergy != null ? circuit.combinedEnergy : this._getPrimaryEnergy(circuit);
      const thresholds = this._config?.power_thresholds || {};
      const color = getPowerColor(watts, thresholds);
      const tier = getPowerLabel(watts, thresholds);
      const indicator = this._getPowerIndicator(watts);
      const name = this._shortDeviceName(circuit.device) || 'Unknown';
      const supportsPopover = typeof HTMLElement.prototype.showPopover === 'function';
      const { powerSensors, energySensors } = this._partitionPowerEntities(circuit.entities || []);
      const powerEntityId = powerSensors[0]?.entity?.entity_id;
      const energyEntityId = energySensors[0]?.entity?.entity_id;

      return html`
        <div class="power-circuit-tile"
          style="--circuit-color:${color}"
          role="listitem"
          tabindex="0"
          aria-label="${name}: ${watts != null ? Math.round(watts) + ' watts, ' + tier.toLowerCase() : 'unavailable'}${energy != null ? ', ' + energy.toFixed(1) + ' kilowatt hours today' : ''}"
          @click=${() => supportsPopover ? this._showCircuitPopover(circuit) : showMoreInfo(circuit.entities?.[0]?.entity?.entity_id)}
          @keydown=${(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); supportsPopover ? this._showCircuitPopover(circuit) : showMoreInfo(circuit.entities?.[0]?.entity?.entity_id); }}}>
          <div class="power-circuit-name">
            <span class="power-circuit-indicator" aria-hidden="true">${circuit.is240V ? '●●' : indicator}</span>
            <span>${name}</span>
          </div>
          <div class="power-circuit-value-row">
            ${this._renderClickableValue(powerEntityId, `View ${name} power: ${watts != null ? Math.round(watts) + ' watts' : 'unavailable'}`, html`<span class="power-circuit-watts">${this._formatWatts(watts)}</span>`)}
          </div>
          ${energy != null ? this._renderClickableValue(energyEntityId, `View ${name} energy: ${energy.toFixed(1)} kWh today`, html`<span class="power-circuit-energy">${this._formatEnergy(energy)} TODAY</span>`) : ''}
        </div>
      `;
    }

    /* ── Switch + monitor device row renderer ── */

    _renderPowerDeviceRow(group) {
      const { switches, powerSensors, energySensors } = this._partitionPowerEntities(group.entities);
      const sw = switches[0];
      const watts = powerSensors[0] ? parseFloat(powerSensors[0].state?.state) || 0 : null;
      const energy = energySensors[0] ? parseFloat(energySensors[0].state?.state) || null : null;
      const thresholds = this._config?.power_thresholds || {};
      const color = getPowerColor(watts, thresholds);
      const name = this._shortDeviceName(group.device) || 'Unknown';
      const isOn = sw?.state?.state === 'on';
      const powerEntityId = powerSensors[0]?.entity?.entity_id;
      const energyEntityId = energySensors[0]?.entity?.entity_id;

      return html`
        <div class="power-device-row"
          role="listitem" tabindex="0"
          style="--circuit-color:${color}"
          aria-label="${name}: ${sw ? (isOn ? 'on' : 'off') + ', ' : ''}${watts != null ? Math.round(watts) + ' watts' : 'unknown'}">
          ${sw ? this._renderTrackToggle(
            isOn, `Toggle ${name}`,
            () => { if (this._powerToggleLimiter.allow()) this._handleToggle(sw.entity.entity_id); }
          ) : ''}
          <span class="power-device-name">${name}</span>
          <div class="power-device-stats">
            ${this._renderClickableValue(powerEntityId, `View ${name} power: ${watts != null ? Math.round(watts) + ' watts' : 'unknown'}`, html`<span class="power-device-watts" style="color:${color}">${this._formatWatts(watts)}</span>`)}
            ${energy != null ? this._renderClickableValue(energyEntityId, `View ${name} energy: ${energy.toFixed(1)} kWh`, html`<span class="power-device-energy">${this._formatEnergy(energy)}</span>`) : ''}
          </div>
        </div>
      `;
    }

    /* ── Power strip renderer (Wesley §3.3) ── */

    _renderPowerStrip(parentGroup, children) {
      const parentName = this._shortDeviceName(parentGroup.device) || 'Power Strip';
      const { powerSensors: parentPower, switches: parentSwitches } = this._partitionPowerEntities(parentGroup.entities);
      const totalWatts = parentPower.reduce((sum, e) => sum + (parseFloat(e.state?.state) || 0), 0);
      const thresholds = this._config?.power_thresholds || {};
      const totalColor = getPowerColor(totalWatts, thresholds);
      const parentSwitch = parentSwitches[0];

      return html`
        <div class="power-strip-block" role="listitem">
          <div class="power-strip-header" role="heading" aria-level="5">
            <span class="power-strip-name">${parentName}</span>
            ${parentSwitch ? this._renderTrackToggle(
              parentSwitch.state?.state === 'on',
              `Master toggle ${parentName}`,
              () => { if (this._powerToggleLimiter.allow()) this._handleToggle(parentSwitch.entity.entity_id); }
            ) : ''}
            <span class="power-strip-total" style="color:${totalColor}">TOTAL: ${this._formatWatts(totalWatts)}</span>
          </div>
          <div class="power-strip-divider" aria-hidden="true"></div>
          <div class="power-strip-children" role="list" aria-label="${parentName} outlets">
            ${children.map(child => this._renderStripChild(child, parentSwitches))}
          </div>
        </div>
      `;
    }

    _renderStripChild(childGroup, parentSwitches) {
      const name = this._shortDeviceName(childGroup.device) || 'Outlet';
      const { switches: childSwitches, powerSensors, energySensors } = this._partitionPowerEntities(childGroup.entities);
      const watts = powerSensors[0] ? parseFloat(powerSensors[0].state?.state) || 0 : 0;
      const energy = energySensors[0] ? parseFloat(energySensors[0].state?.state) || null : null;
      const thresholds = this._config?.power_thresholds || {};
      const color = getPowerColor(watts, thresholds);
      const powerEntityId = powerSensors[0]?.entity?.entity_id;
      const energyEntityId = energySensors[0]?.entity?.entity_id;

      // Child outlets may have switches on the child device, OR the parent
      // device owns all switch entities (Kasa HS300 pattern). Match by name/index.
      let childSwitch = childSwitches[0];
      if (!childSwitch && parentSwitches?.length > 0) {
        // Kasa HS300 pattern: parent device owns all switch entities, child
        // devices only have sensors. The child device name (e.g. "US-P1-UDMPRO")
        // appears in the parent switch entity_id and friendly_name.
        const childName = (childGroup.device?.name || '').toLowerCase().replace(/[\s\-_]+/g, '');
        childSwitch = parentSwitches.find(s => {
          const eid = (s.entity?.entity_id || '').toLowerCase().replace(/[\s\-_]+/g, '');
          const fn = (s.state?.attributes?.friendly_name || '').toLowerCase().replace(/[\s\-_]+/g, '');
          return eid.includes(childName) || fn.includes(childName);
        });
      }

      const isOn = childSwitch?.state?.state === 'on';

      return html`
        <div class="power-strip-child-tile" style="--tile-power-color:${color}"
          role="listitem" aria-label="${name}: ${isOn ? 'on' : 'off'}, ${Math.round(watts)} watts">
          <span class="circuit-name">${name}</span>
          <div class="strip-child-controls">
            ${childSwitch ? this._renderTrackToggle(
              isOn, `Toggle ${name}`,
              () => { if (this._powerToggleLimiter.allow()) this._handleToggle(childSwitch.entity.entity_id); }
            ) : ''}
            ${this._renderClickableValue(powerEntityId, `View ${name} power: ${Math.round(watts)} watts`, html`
              <span class="circuit-watts" style="color:${color}">
                <span class="power-dot" ?data-zero=${watts === 0} aria-hidden="true"></span>
                ${this._formatWatts(watts)}
              </span>
            `)}
            ${energy != null ? this._renderClickableValue(energyEntityId, `View ${name} energy: ${energy.toFixed(1)} kWh`, html`<span class="power-device-energy">${this._formatEnergy(energy)}</span>`) : ''}
          </div>
        </div>
      `;
    }

    /* ── Summary card renderer (Geordi §4.1) ── */

    _renderPowerSummaryCard(label, watts, energy, accentColor, icon) {
      const thresholds = this._config?.power_thresholds || {};
      const color = label === 'TOTAL USAGE' ? getPowerColor(watts, thresholds) : accentColor;

      return html`
        <div class="power-summary-card" role="status"
          style="--card-accent:${accentColor}"
          aria-label="${label}: ${watts != null ? Math.round(watts) + ' watts' : 'unavailable'}${energy != null ? ', ' + energy.toFixed(1) + ' kilowatt hours today' : ''}"
          aria-live="polite">
          <span class="power-summary-label">
            <ha-icon icon="${icon}" style="--mdc-icon-size:14px; vertical-align:middle; color:${accentColor}"></ha-icon>
            ${label}
          </span>
          <span class="power-summary-value" style="color:${color}">
            ${this._formatWatts(watts)}
          </span>
          ${energy != null ? html`
            <span class="power-summary-secondary">${this._formatEnergy(energy)} TODAY</span>
          ` : ''}
        </div>
      `;
    }

    /* ═══ CONSOLIDATED POWER PANEL (4X-6) ═══ */

    /* ── Aggregate all power groups for an area into a structured collection ── */

    _buildPowerCollection(powerGroups) {
      const circuits = [];
      const plugs = [];
      const allStrips = [];

      for (const group of powerGroups) {
        const deviceType = this._classifyPowerDevice(group.entities || [], group.device);
        if (deviceType === 'vue') {
          circuits.push(group);
        } else if (deviceType === 'strip') {
          allStrips.push(group);
        } else {
          plugs.push(group);
        }
      }

      // Distinguish strip parents from strip children (#4).
      // Child outlets (e.g. Kasa HS300 ports) inherit the parent's model string,
      // so _classifyPowerDevice marks them ALL as 'strip'. A device whose
      // via_device_id points to another strip-classified device is a child outlet.
      const stripDeviceIds = new Set(allStrips.map(g => g.device?.id).filter(Boolean));
      const stripParents = [];
      const stripChildren = [];
      for (const group of allStrips) {
        if (group.device?.via_device_id && stripDeviceIds.has(group.device.via_device_id)) {
          stripChildren.push(group); // child outlet — no subType tag
        } else {
          stripParents.push({ ...group, subType: 'strip' }); // genuine parent
        }
      }

      // Group strip parents with their children via via_device_id
      const { strips: stripMap, standalone } = this._groupPowerStrips([...stripParents, ...stripChildren, ...plugs]);
      const strips = [];
      for (const [, entry] of stripMap) {
        strips.push({ parent: entry.parent, children: entry.children || [] });
      }

      // Orphan plugs = standalone (not assigned to any strip)
      const orphanPlugs = standalone;

      // Process circuits through 240V pairing + sort
      const processedCircuits = this._sortCircuits(this._detect240VPairs(circuits));

      // Build set of device IDs that are children of a strip (used for dedup)
      const stripChildIds = new Set();
      for (const { children } of strips) {
        for (const child of children) {
          if (child.device?.id) stripChildIds.add(child.device.id);
        }
      }

      // Detect aggregate/total circuits to exclude from totals (#2)
      const AGGREGATE_PATTERN = /^(balance|total|main[s]?|net|whole[\s_-]?home)$/i;
      const aggregateCircuitIds = new Set();
      for (const c of processedCircuits) {
        const name = this._shortDeviceName(c.device) || '';
        if (AGGREGATE_PATTERN.test(name.trim())) {
          if (c.device?.id) aggregateCircuitIds.add(c.device.id);
        }
      }

      // Detect UPS/battery parent devices whose children are also in the group (#1)
      const upsParentIds = new Set();
      for (const group of powerGroups) {
        const dc = (group.device?.model || '').toLowerCase();
        const mfr = (group.device?.manufacturer || '').toLowerCase();
        const isUps = group.entities?.some(e =>
          e.state?.attributes?.device_class === 'battery' ||
          (e.domain === 'sensor' && (e.state?.attributes?.device_class || '') === 'battery')
        ) || dc.includes('ups') || mfr.includes('ups') || mfr.includes('cyberpower') ||
          mfr.includes('apc') || mfr.includes('tripp');
        if (!isUps || !group.device?.id) continue;
        // Only mark as UPS parent if at least one other group has via_device_id pointing to it
        const hasChildren = powerGroups.some(
          g => g !== group && g.device?.via_device_id === group.device.id
        );
        if (hasChildren) upsParentIds.add(group.device.id);
      }

      // Compute area-wide totals with dedup
      let totalWatts = 0;
      let totalEnergy = 0;
      for (const group of powerGroups) {
        const devId = group.device?.id;
        // Skip aggregate circuits (Balance/Total/Mains) — already summed by children (#2)
        if (devId && aggregateCircuitIds.has(devId)) continue;
        // Skip UPS parents when their children are also in the group (#1)
        if (devId && upsParentIds.has(devId)) continue;
        // Skip strip children — parent already reports their total
        if (devId && stripChildIds.has(devId)) continue;
        const w = this._getPrimaryPower(group);
        const e = this._getPrimaryEnergy(group);
        if (w != null) totalWatts += w;
        if (e != null) totalEnergy += e;
      }

      return {
        circuits: processedCircuits,
        plugs: orphanPlugs,
        strips,
        totalWatts,
        totalEnergy: totalEnergy || null,
        deviceCount: powerGroups.length,
      };
    }

    /* ── LCARS sliding track toggle ── */

    _renderTrackToggle(isOn, ariaLabel, onClick) {
      return html`
        <button class="lcars-track-toggle" ?data-on=${isOn}
          role="switch" aria-checked="${isOn}" aria-label="${ariaLabel}"
          @click=${(e) => { e.stopPropagation(); onClick(); }}
          @keydown=${(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}>
          <span class="track-label">${isOn ? 'ON' : 'OFF'}</span>
          <span class="track-thumb" aria-hidden="true"></span>
        </button>
      `;
    }

    /* ── Clickable sensor value wrapper (Geordi G-4) ── */

    _renderClickableValue(entityId, ariaLabel, displayHtml) {
      if (!entityId) return displayHtml;
      return html`
        <span class="power-clickable-value"
          role="button" tabindex="0"
          aria-label="${ariaLabel}"
          @click=${(e) => { e.stopPropagation(); this._handleEntityClick(entityId); }}
          @keydown=${(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._handleEntityClick(entityId); } }}>
          ${displayHtml}
        </span>
      `;
    }

    /* ── Arc adapter for consolidated panel ── */

    _renderConsolidatedPowerArc(collection) {
      const allSources = [];
      for (const c of collection.circuits) {
        allSources.push({
          device: c.device,
          entities: c.entities,
          combinedWatts: c.combinedWatts != null ? c.combinedWatts : this._getPrimaryPower(c),
          combinedEnergy: c.combinedEnergy,
        });
      }
      for (const p of collection.plugs) {
        allSources.push({
          device: p.device,
          entities: p.entities,
          combinedWatts: this._getPrimaryPower(p),
        });
      }
      for (const { parent } of collection.strips) {
        allSources.push({
          device: parent.device,
          entities: parent.entities,
          combinedWatts: this._getPrimaryPower(parent),
        });
      }
      return this._renderPowerArc(allSources, collection.totalWatts);
    }

    /* ── Consolidated Power Panel Renderer (4X-6 main orchestrator) ── */

    _renderConsolidatedPowerPanel(collection) {
      const { circuits, plugs, strips, totalWatts, totalEnergy, deviceCount } = collection;
      const thresholds = this._config?.power_thresholds || {};
      const panelColor = getPowerColor(totalWatts, thresholds);
      const hasCritical = totalWatts != null && Math.abs(totalWatts) > (thresholds.highMax || 3000);
      const totalSources = circuits.length + plugs.length + strips.length;

      // Build section count badge
      const badgeParts = [];
      if (circuits.length > 0) badgeParts.push(`${circuits.length} CIRCUIT${circuits.length !== 1 ? 'S' : ''}`);
      if (plugs.length > 0) badgeParts.push(`${plugs.length} DEVICE${plugs.length !== 1 ? 'S' : ''}`);
      if (strips.length > 0) badgeParts.push(`${strips.length} STRIP${strips.length !== 1 ? 'S' : ''}`);
      const badge = badgeParts.join(' · ') || 'POWER SYSTEMS';

      // Truncation state
      this._expandedPowerSections = this._expandedPowerSections || new Set();
      const MAX_VISIBLE = 12;

      const circuitsExpanded = this._expandedPowerSections.has('circuits');
      const visibleCircuits = circuitsExpanded ? circuits : circuits.slice(0, MAX_VISIBLE);
      const circuitsHasMore = circuits.length > MAX_VISIBLE;

      const plugsExpanded = this._expandedPowerSections.has('plugs');
      const visiblePlugs = plugsExpanded ? plugs : plugs.slice(0, MAX_VISIBLE);
      const plugsHasMore = plugs.length > MAX_VISIBLE;

      return html`
        <div class="lcars-consolidated-power-panel" data-panel-type="power"
          data-alert="${hasCritical ? 'critical' : ''}"
          role="region" aria-label="Power Systems — ${badge}">

          <!-- Header -->
          <div class="consolidated-power-header" role="heading" aria-level="3">
            <ha-icon icon="mdi:flash"></ha-icon>
            <span class="power-panel-name">POWER SYSTEMS</span>
            <div class="power-panel-header-line" aria-hidden="true"></div>
            <span class="power-panel-badge">${badge}</span>
          </div>

          <!-- Summary -->
          <div class="power-summary" role="group" aria-label="Power Summary">
            ${this._renderPowerSummaryCard(
              'TOTAL USAGE', totalWatts, totalEnergy,
              panelColor, 'mdi:sigma'
            )}
          </div>

          <!-- SVG Arc (when 3+ sources) -->
          ${totalSources >= 3 ? this._renderConsolidatedPowerArc(collection) : ''}

          <!-- Circuits section -->
          ${circuits.length > 0 ? html`
            <div class="power-circuits-section">
              <div class="power-section-label" role="heading" aria-level="4">
                <span class="power-section-label-text">CIRCUITS</span>
                <div class="power-section-label-rule" aria-hidden="true"></div>
                <span class="power-section-label-count">${circuits.length}</span>
              </div>
              <div class="power-circuits" role="list" aria-label="Circuit monitors${circuitsHasMore && !circuitsExpanded ? ', showing first 12, expandable' : ''}">
                ${visibleCircuits.map(c => this._renderCircuitTile(c))}
              </div>
              ${circuitsHasMore && !circuitsExpanded ? html`
                <button class="power-show-all-pill"
                  aria-label="Show all ${circuits.length} circuits"
                  @click=${() => { this._expandedPowerSections.add('circuits'); this.requestUpdate(); }}>
                  SHOW ALL (${circuits.length})
                </button>
              ` : ''}
            </div>
          ` : ''}

          <!-- Monitored Devices section -->
          ${plugs.length > 0 ? html`
            <div class="power-devices-section">
              <div class="power-section-label" role="heading" aria-level="4">
                <span class="power-section-label-text">MONITORED DEVICES</span>
                <div class="power-section-label-rule" aria-hidden="true"></div>
                <span class="power-section-label-count">${plugs.length}</span>
              </div>
              <div class="power-devices" role="list" aria-label="Monitored devices${plugsHasMore && !plugsExpanded ? ', showing first 12, expandable' : ''}">
                ${visiblePlugs.map(p => this._renderPowerDeviceRow(p))}
              </div>
              ${plugsHasMore && !plugsExpanded ? html`
                <button class="power-show-all-pill"
                  aria-label="Show all ${plugs.length} devices"
                  @click=${() => { this._expandedPowerSections.add('plugs'); this.requestUpdate(); }}>
                  SHOW ALL (${plugs.length})
                </button>
              ` : ''}
            </div>
          ` : ''}

          <!-- Power Strips section -->
          ${strips.length > 0 ? html`
            <div class="power-strips-section">
              <div class="power-section-label" role="heading" aria-level="4">
                <span class="power-section-label-text">POWER STRIPS</span>
                <div class="power-section-label-rule" aria-hidden="true"></div>
                <span class="power-section-label-count">${strips.length}</span>
              </div>
              <div class="power-strips" role="list" aria-label="Power strips">
                ${strips.map(({ parent, children }) => this._renderPowerStrip(parent, children))}
              </div>
            </div>
          ` : ''}

          <!-- Singleton popover element -->
          <div popover id="power-detail-popover" class="power-detail-popover"
            role="dialog" aria-label="Circuit detail">
            <div class="popover-content"></div>
          </div>

          <div class="panel-pip-strip" aria-hidden="true"></div>
        </div>
      `;
    }

    /* ═══ LEGACY SINGLE-DEVICE POWER PANEL (v4.15.0) ═══ */
    /** @deprecated Use _renderConsolidatedPowerPanel instead. Retained for potential future single-device detail view. */

    _renderPowerPanel(group) {
      const allEntries = group.entities || [];
      const deviceName = this._shortDeviceName(group.device) || 'Power';
      const thresholds = this._config?.power_thresholds || {};

      // Classify and partition all power devices in this area
      const deviceType = this._classifyPowerDevice(allEntries, group.device);
      const { powerSensors, energySensors, switches } = this._partitionPowerEntities(allEntries);

      // For single-device panels, render based on device type
      const watts = this._getPrimaryPower(group);
      const energy = this._getPrimaryEnergy(group);
      const panelColor = getPowerColor(watts, thresholds);

      // Check for critical draw
      const hasCritical = watts != null && Math.abs(watts) > (thresholds.highMax || 3000);

      // Build circuit list for Vue-type devices
      const circuits = deviceType === 'vue' ? [group] : [];
      const processedCircuits = this._sortCircuits(this._detect240VPairs(circuits));

      // Total watts for arc
      const totalWatts = watts || 0;

      // Determine sections to show
      const hasCircuits = processedCircuits.length > 0;
      const hasSwitch = switches.length > 0;
      const isPlug = deviceType === 'plug';
      const isStrip = deviceType === 'strip';

      return html`
        <div class="lcars-device-panel power-panel" data-panel-type="power"
          data-alert="${hasCritical ? 'critical' : ''}"
          role="region" aria-label="${deviceName} Power Systems">

          <!-- Header -->
          <div class="power-panel-header" role="heading" aria-level="3">
            <ha-icon icon="mdi:flash"></ha-icon>
            <span class="power-panel-name">${deviceName}</span>
            <div class="power-panel-header-line" aria-hidden="true"></div>
            <span class="power-panel-badge">POWER SYSTEMS</span>
            <span class="panel-numeric-code" aria-hidden="true">${this._generatePanelCode(allEntries[0]?.entity?.entity_id || group.device?.id || 'power')}</span>
          </div>

          <!-- SVG Arc (for multi-circuit devices) -->
          ${hasCircuits && processedCircuits.length > 1 ? this._renderPowerArc(processedCircuits, totalWatts) : ''}

          <!-- Summary -->
          <div class="power-summary" role="group" aria-label="Power Summary">
            ${this._renderPowerSummaryCard(
              'TOTAL USAGE', totalWatts, energy,
              panelColor, 'mdi:sigma'
            )}
          </div>

          <!-- Circuits section (Vue-type) -->
          ${hasCircuits ? html`
            <div class="power-circuits-section">
              <div class="power-section-label" role="heading" aria-level="4">
                <span class="power-section-label-text">CIRCUITS</span>
                <div class="power-section-label-rule" aria-hidden="true"></div>
                <span class="power-section-label-count">${processedCircuits.length}/${processedCircuits.length}</span>
              </div>
              <div class="power-circuits" role="list" aria-label="Circuit Monitors">
                ${processedCircuits.map(c => this._renderCircuitTile(c))}
              </div>
            </div>
          ` : ''}

          <!-- Device row (plug-type with switch) -->
          ${isPlug ? html`
            <div class="power-devices-section">
              <div class="power-section-label" role="heading" aria-level="4">
                <span class="power-section-label-text">MONITORED DEVICES</span>
                <div class="power-section-label-rule" aria-hidden="true"></div>
                <span class="power-section-label-count">1/1</span>
              </div>
              <div class="power-devices" role="list" aria-label="Monitored Devices">
                ${this._renderPowerDeviceRow(group)}
              </div>
            </div>
          ` : ''}

          <!-- Strip rendering -->
          ${isStrip ? html`
            <div class="power-strips-section">
              <div class="power-section-label" role="heading" aria-level="4">
                <span class="power-section-label-text">POWER STRIPS</span>
                <div class="power-section-label-rule" aria-hidden="true"></div>
              </div>
              <div class="power-strips" role="list" aria-label="Power Strips">
                ${this._renderPowerStrip(group, [])}
              </div>
            </div>
          ` : ''}

          <!-- Singleton popover element (Data C-5) -->
          <div popover id="power-detail-popover" class="power-detail-popover"
            role="dialog" aria-label="Circuit detail">
            <div class="popover-content"></div>
          </div>

          <div class="panel-pip-strip" aria-hidden="true"></div>
        </div>
      `;
    }

    /* ─── Render area content: two-column when cameras present ─── */
    _renderAreaContent(entities, areaId) {
      if (entities.length === 0)
        return html`<div class="lcars-empty" role="status">No entities in this area</div>`;

      const { byDevice, noDevice } = this._groupEntities(entities);

      // ── Area-level composite panels (4X-17): life_support, illumination ──
      // Hydrate flat entities for classifyArea (need domain + state)
      const hydratedEntries = entities.map(e => {
        const domain = e.entity_id.split('.')[0];
        const state = this._hass?.states?.[e.entity_id];
        return { entity: e, domain, state };
      }).filter(e => e.state);

      const areaPanelTypes = classifyArea(this._hass, areaId, hydratedEntries);
      const areaPanels = [];
      for (const pt of areaPanelTypes) {
        const factory = PANEL_TAG_REGISTRY.get(pt);
        if (factory) {
          // Build a synthetic group with areaId + all hydrated entries for this panel type
          areaPanels.push({ panelType: pt, template: factory({ entities: hydratedEntries, areaId }, this._hass, this._editMode, this._config) });
        }
      }

      // ── Exclude entities consumed by area panels from standalone rendering ──
      const consumedByArea = this._buildAreaPanelFilter(areaPanelTypes);
      if (consumedByArea) {
        for (const [devId, group] of byDevice) {
          group.entities = group.entities.filter(e => !consumedByArea(e));
          if (group.entities.length === 0) byDevice.delete(devId);
        }
      }
      const filteredNoDevice = consumedByArea
        ? noDevice.filter(e => !consumedByArea(e))
        : noDevice;

      // Device panel types subsumed by area panels (e.g., climate → life_support, alarm → tactical)
      const subsumedDeviceTypes = new Set();
      if (areaPanelTypes.has(PANEL_TYPE_LIFE_SUPPORT)) {
        subsumedDeviceTypes.add(PANEL_TYPE_CLIMATE);
        subsumedDeviceTypes.add(PANEL_TYPE_ENVIRONMENT);
      }
      if (areaPanelTypes.has(PANEL_TYPE_TACTICAL)) {
        subsumedDeviceTypes.add(PANEL_TYPE_ALARM);
      }
      if (areaPanelTypes.has(PANEL_TYPE_MEDIA)) {
        subsumedDeviceTypes.add(PANEL_TYPE_MEDIA);
      }

      // Partition devices into panel-worthy, normal, and power
      const panelDevices = [];
      const normalDevices = [];
      const powerGroups = [];
      for (const group of byDevice.values()) {
        const panelType = this._getDevicePanelType(group.entities);
        if (panelType && subsumedDeviceTypes.has(panelType)) {
          // Skip — subsumed by area-level composite panel
          continue;
        } else if (panelType === PANEL_TYPE_POWER) {
          powerGroups.push({ ...group, panelType });
        } else if (panelType) {
          panelDevices.push({ ...group, panelType });
        } else {
          normalDevices.push(group);
        }
      }

      // Build entity groups content (without power — power rendered in left column)
      const entityContent = html`
        ${normalDevices.map((group) => html`
          <div class="device-group">
            <div class="device-header">
              <h3 class="device-name">${this._shortDeviceName(group.device)}</h3>
              <div class="device-line"></div>
              ${this._editMode ? html`
                <div class="device-edit-pip" tabindex="0" role="button" aria-label="Edit device"
                  @click=${(e) => this._handleEditDevice(e, group.device.id)}
                  @keydown=${(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._handleEditDevice(e, group.device.id); } }}></div>
              ` : ''}
            </div>
            ${this._renderDomainGroups(group.entities)}
          </div>
        `)}
        ${filteredNoDevice.length > 0 ? html`
          <div class="device-group">
            <div class="device-header">
              <h3 class="device-name">Other Entities</h3>
              <div class="device-line"></div>
            </div>
            ${this._renderDomainGroups(filteredNoDevice)}
          </div>
        ` : ''}
      `;

      // Power panel template (left column, below environment)
      const powerTemplate = powerGroups.length > 0
        ? html`<lcars-power-panel .powerGroups=${powerGroups} .hass=${this._hass} .editMode=${this._editMode} .config=${this._config}></lcars-power-panel>`
        : '';

      // Merge all panels (device + area)
      const allPanels = [
        ...panelDevices.map(g => ({ panelType: g.panelType, template: this._renderDevicePanel(g.panelType, g) })),
        ...areaPanels,
      ];

      // No panels at all → single-column with entities + power
      if (allPanels.length === 0 && powerGroups.length === 0) return html`${entityContent}${powerTemplate}`;

      // Split panels into left and right columns
      const leftPanels = [];
      const rightPanels = [];
      for (const p of allPanels) {
        if (PANEL_COLUMN[p.panelType] === 'right') {
          rightPanels.push(p);
        } else {
          leftPanels.push(p);
        }
      }
      leftPanels.sort((a, b) => (PANEL_TYPE_ORDER[a.panelType] ?? 99) - (PANEL_TYPE_ORDER[b.panelType] ?? 99));
      rightPanels.sort((a, b) => (PANEL_TYPE_ORDER[a.panelType] ?? 99) - (PANEL_TYPE_ORDER[b.panelType] ?? 99));

      // Illumination renders FULL-WIDTH above both columns as primary room control
      const ilmPanel = leftPanels.find(p => p.panelType === PANEL_TYPE_ILLUMINATION);
      const belowEntityPanels = leftPanels.filter(p => p.panelType !== PANEL_TYPE_ILLUMINATION);

      // Left column: entities → climate/life-support/env → power
      const leftColumn = html`
        <div class="area-split-main" role="region" aria-label="Device controls">
          ${entityContent}
          ${belowEntityPanels.map(p => p.template)}
          ${powerTemplate}
        </div>
      `;

      // No right-column panels → single column (with illumination on top if present)
      if (rightPanels.length === 0) return html`
        ${ilmPanel ? html`<div class="area-illumination-full">${ilmPanel.template}</div>` : ''}
        ${leftColumn}
      `;

      // Two-column split: illumination full-width on top, then columns below
      return html`
        ${ilmPanel ? html`<div class="area-illumination-full">${ilmPanel.template}</div>` : ''}
        <div class="area-split-layout">
          ${leftColumn}
          <div class="area-split-panels" role="region" aria-label="System panels">
            ${rightPanels.map(p => p.template)}
          </div>
        </div>
      `;
    }

    /* ─── Build predicate for entities consumed by area-level panels ─── */
    _buildAreaPanelFilter(areaPanelTypes) {
      if (areaPanelTypes.size === 0) return null;
      const predicates = [];
      if (areaPanelTypes.has(PANEL_TYPE_ILLUMINATION)) predicates.push(isLightingEntity);
      if (areaPanelTypes.has(PANEL_TYPE_LIFE_SUPPORT)) predicates.push(
        e => isClimateEntity(e) || isEnvironmentEntity(e) || isAmbientSensor(e)
      );
      if (areaPanelTypes.has(PANEL_TYPE_TACTICAL)) predicates.push(isTacticalEntity);
      if (areaPanelTypes.has(PANEL_TYPE_MEDIA)) predicates.push(e => MEDIA_DOMAINS.has(e.domain));
      if (predicates.length === 0) return null;
      return entry => predicates.some(p => p(entry));
    }

    /* ─── Render domain-grouped entity lists ─── */
    _renderDomainGroups(entries) {
      const domainGroups = this._groupByDomain(entries);
      return html`${domainGroups.map(([domain, items]) => html`
        <div class="domain-label" role="heading" aria-level="4">${DOMAIN_LABELS[domain] || domain}</div>
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
          const initialState = (off || !imgUrl) ? 'offline' : 'connecting';
          return html`
            <div class="camera-frame" data-state="${initialState}" style="--i:${i}"
              role="button"
              tabindex="0"
              aria-label="${name} camera: ${off ? 'viewscreen offline' : state.state}"
              aria-busy="${initialState === 'connecting'}"
              @click=${() => this._handleEntityClick(entity.entity_id)}
              @keydown=${(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._handleEntityClick(entity.entity_id); } }}>
              <div class="camera-connecting-overlay" aria-hidden="true">
                <span class="camera-connecting-text">ESTABLISHING LINK</span>
              </div>
              <div class="camera-offline-overlay" aria-hidden="true">
                <ha-icon icon="mdi:video-off"></ha-icon>
                <span class="camera-offline-text">VIEWSCREEN OFFLINE</span>
              </div>
              ${imgUrl
                ? html`<img src="${imgUrl}" alt="${name}"
                            data-entity="${entity.entity_id}"
                            .src=${imgUrl}
                            @load=${(e) => { const f = e.target.closest('.camera-frame'); if (f) { f.setAttribute('data-state', 'live'); f.removeAttribute('aria-busy'); } }}
                            @error=${(e) => { const f = e.target.closest('.camera-frame'); if (f) { f.setAttribute('data-state', 'offline'); f.removeAttribute('aria-busy'); } }} />`
                : html`<div class="camera-spacer"></div>`
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

          return this._withEditPip(entity.entity_id, html`
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
          `);
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

          return this._withEditPip(entity.entity_id, html`
            <button class="sensor-readout" ?data-off=${off} ?data-warn=${warn} style="--i:${i}"
              @click=${() => this._handleEntityClick(entity.entity_id)}
              title="${name}: ${val} ${unit}">
              <ha-icon .icon=${this._getEntityIcon(state)}></ha-icon>
              <span class="sensor-name">${name}</span>
              ${this._renderSensorBar(state)}
              <span class="sensor-value">${val}</span>
              ${unit ? html`<span class="sensor-unit">${unit}</span>` : ''}
            </button>
          `);
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

          return this._withEditPip(entity.entity_id, html`
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
          `);
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
          return this._withEditPip(entity.entity_id, html`
            <button class="cover-panel" ?data-off=${off} style="--i:${i}"
              @click=${() => this._handleEntityClick(entity.entity_id)}
              title="${name}: ${state.state}">
              <ha-icon .icon=${this._getEntityIcon(state)}></ha-icon>
              <span class="cover-name">${name}</span>
              ${pos != null ? html`<span class="cover-position">${pos}%</span>` : ''}
            </button>
          `);
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
          return this._withEditPip(entity.entity_id, html`
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
          `);
        })}
      </div>`;
    }

    /* ═══ GENERIC BUTTON RENDERER ═══ */
    _renderGeneric(entries) {
      return html`<div class="entity-grid">
        ${entries.map(({ entity, state }, i) => {
          const name = this._friendlyName(state, entity);
          const off = this._isOff(state);
          return this._withEditPip(entity.entity_id, html`
            <button class="entity-btn" ?data-off=${off} style="--i:${i}"
              @click=${() => this._handleEntityClick(entity.entity_id)}
              title="${name}: ${state.state}">
              <ha-icon .icon=${this._getEntityIcon(state)}></ha-icon>
              <span class="entity-name">${name}</span>
              <span class="entity-state">${state.state}</span>
            </button>
          `);
        })}
      </div>`;
    }

    getCardSize() { return 6; }
  }

  if (!customElements.get('homepage-card')) {
    customElements.define('homepage-card', LcarsHomepageCard);
    lcarsLog.debug(TAG, 'Custom element registered: homepage-card');
  } else {
    lcarsLog.warn(TAG, 'Custom element homepage-card already registered — skipping');
  }
