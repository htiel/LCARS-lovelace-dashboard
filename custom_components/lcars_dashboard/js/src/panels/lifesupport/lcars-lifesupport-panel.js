/**
 * lcars-lifesupport-panel.js (4X-10)
 *
 * Area-level composite panel: Life Support — aggregates climate, environment,
 * and ambient sensor entities into a unified area view.
 *
 * Composes existing panels as nested substations via frame-mode="nested".
 * Four graceful degradation configurations:
 *   Full:         thermostat + purifier + sensors → 2-column substations + ambient + sparklines
 *   Atmos only:   purifier + sensors, no thermostat → single environment substation
 *   Climate only: thermostat + sensors, no purifier → single climate + ambient + sparklines
 *   Sensors only: standalone temp/humidity → sensor hero layout
 */
import { html, css } from 'lit-element';
import { LcarsBasePanel } from '../../lcars-base-panel.js';
import {
  isClimateEntity, isEnvironmentEntity, isAmbientSensor,
  classifyDevice, PANEL_TYPE_CLIMATE, PANEL_TYPE_ENVIRONMENT,
  SENSOR_DOMAINS,
} from '../../lcars-entity-utils.js';
import { getTempColor, getComfortColor } from '../../lcars-color-utils.js';
import { renderSparkline, fetchSparklineData } from '../../lcars-sparkline.js';
import { sharedKeyframes, sharedReducedMotion } from '../../lcars-shared-animations.js';
import { lcarsFocusRing } from '../../lcars-styles.js';
import { lifeSupportPanelStyles } from './lcars-lifesupport-panel-styles.js';

/* ─── Import child panels for composition ─── */
import '../climate/lcars-climate-panel.js';
import '../environment/lcars-environment-panel.js';
import '../../components/lcars-summary-badge/lcars-summary-badge.js';

class LcarsLifeSupportPanel extends LcarsBasePanel {

  static get properties() {
    return {
      ...super.properties,
      _sparklineData: { type: Object },
    };
  }

  constructor() {
    super();
    this._sparklineData = new Map();
    this._sparklineTimer = null;
    this._sparklineCache = new Map();
    this._prevAreaId = null;
  }

  get panelType() { return 'life_support'; }
  get defaultPanelTitle() { return 'LIFE SUPPORT'; }
  get frameColor() { return 'var(--lcars-blue)'; }

  static get styles() {
    return [
      ...super.styles,
      sharedKeyframes,
      sharedReducedMotion,
      lcarsFocusRing,
      lifeSupportPanelStyles,
    ];
  }

  /* ─── Entity Partitioning ─── */

  /**
   * Partition all entities into functional groups for substations.
   * Returns { climateGroup, envGroup, ambientEntries, config }.
   */
  _partitionEntities() {
    const allEntries = this._getAllEntities();
    const devices = this.hass?.devices || {};

    // Separate climate device entities, environment device entities, and standalone sensors
    const climateEntries = [];
    const envEntries = [];
    const ambientEntries = [];
    const otherEntries = [];

    for (const entry of allEntries) {
      if (isClimateEntity(entry)) {
        climateEntries.push(entry);
      } else if (isEnvironmentEntity(entry)) {
        envEntries.push(entry);
      } else if (isAmbientSensor(entry)) {
        ambientEntries.push(entry);
      } else {
        otherEntries.push(entry);
      }
    }

    // Build device groups for climate and environment substations
    const climateGroup = this._buildDeviceGroup(climateEntries, devices);
    const envGroup = this._buildDeviceGroup(envEntries, devices);

    // Determine configuration
    const hasClimate = climateEntries.length > 0;
    const hasEnvironment = envEntries.length > 0;
    const hasAmbient = ambientEntries.length > 0;

    let config;
    if (hasClimate && hasEnvironment) config = 'full';
    else if (!hasClimate && hasEnvironment) config = 'atmos-only';
    else if (hasClimate && !hasEnvironment) config = 'climate-only';
    else config = 'sensors-only';

    return { climateGroup, envGroup, ambientEntries, otherEntries, config };
  }

  /**
   * Build a group object compatible with panel expectations.
   * Finds the primary device from the entries.
   */
  _buildDeviceGroup(entries, devices) {
    if (!entries.length) return null;
    // Find primary device
    let primaryDevice = null;
    for (const e of entries) {
      const devId = e.entity?.device_id;
      if (devId && devices[devId]) {
        primaryDevice = devices[devId];
        break;
      }
    }
    return { device: primaryDevice, entities: entries };
  }

  /* ─── Sparkline Data ─── */

  connectedCallback() {
    super.connectedCallback();
    // Refresh every 30 minutes
    this._sparklineTimer = setInterval(() => this._fetchSparklines(), 30 * 60 * 1000);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._sparklineTimer) {
      clearInterval(this._sparklineTimer);
      this._sparklineTimer = null;
    }
  }

  updated(changedProps) {
    super.updated(changedProps);
    // Clear stale sparklines on area change
    if (this.areaId !== this._prevAreaId) {
      this._prevAreaId = this.areaId;
      this._sparklineData.clear();
      this._sparklineCache.clear();
    }
    // Fetch sparklines once hass is available
    if (changedProps.has('hass') && this.hass && this._sparklineData.size === 0) {
      this._fetchSparklines();
    }
  }

  async _fetchSparklines() {
    if (!this.hass || !this.isConnected) return;
    const allEntries = this._getAllEntities();
    const sparklineEntities = allEntries.filter(e => {
      if (e.domain !== 'sensor') return false;
      const dc = e.state?.attributes?.device_class || '';
      return ['temperature', 'humidity', 'pm25', 'carbon_dioxide',
              'volatile_organic_compounds', 'aqi'].includes(dc);
    });

    const eids = sparklineEntities
      .map(e => e.entity?.entity_id)
      .filter(Boolean);
    if (eids.length === 0) return;

    const cacheKey = this.areaId || 'ls';
    const data = await fetchSparklineData(this.hass, cacheKey, eids, this._sparklineCache);
    if (data) {
      for (const eid of eids) {
        if (data[eid]) this._sparklineData.set(eid, data[eid]);
      }
    }
    if (this.isConnected) this.requestUpdate();
  }

  /* ─── Render ─── */

  renderBadge() {
    const { ambientEntries, config } = this._partitionEntities();
    const tempEntry = ambientEntries.find(e =>
      e.state?.attributes?.device_class === 'temperature'
    );
    if (!tempEntry) return html``;
    const val = parseFloat(tempEntry.state?.state);
    if (isNaN(val)) return html``;
    const unit = tempEntry.state?.attributes?.unit_of_measurement || '°F';
    const color = getTempColor(val);
    return html`<lcars-summary-badge value="${val}${unit}" color="${color}"></lcars-summary-badge>`;
  }

  renderContent() {
    const { climateGroup, envGroup, ambientEntries, config } = this._partitionEntities();

    switch (config) {
      case 'full':
        return this._renderFullLayout(climateGroup, envGroup, ambientEntries);
      case 'atmos-only':
        return this._renderAtmosOnly(envGroup);
      case 'climate-only':
        return this._renderClimateOnly(climateGroup, ambientEntries);
      case 'sensors-only':
        return this._renderSensorHero(ambientEntries);
      default:
        return html`<div class="ls-empty">NO LIFE SUPPORT DATA</div>`;
    }
  }

  /* ─── Full Layout: Climate + Environment substations + ambient + sparklines ─── */

  _renderFullLayout(climateGroup, envGroup, ambientEntries) {
    return html`
      <div class="ls-content ls-full">
        <div class="ls-substations">
          <div class="ls-substation ls-climate-sub">
            <lcars-climate-panel
              .group=${climateGroup}
              .hass=${this.hass}
              .editMode=${this.editMode}
              .config=${this.config}
              frame-mode="nested">
            </lcars-climate-panel>
          </div>
          <div class="ls-substation ls-env-sub">
            <lcars-environment-panel
              .group=${envGroup}
              .hass=${this.hass}
              .editMode=${this.editMode}
              .config=${this.config}
              frame-mode="nested">
            </lcars-environment-panel>
          </div>
        </div>
        ${this._renderAmbientRow(ambientEntries)}
        ${this._renderSparklineTray()}
      </div>
    `;
  }

  /* ─── Atmos Only: Single environment panel ─── */

  _renderAtmosOnly(envGroup) {
    return html`
      <div class="ls-content ls-atmos-only">
        <lcars-environment-panel
          .group=${envGroup}
          .hass=${this.hass}
          .editMode=${this.editMode}
          .config=${this.config}
          frame-mode="nested">
        </lcars-environment-panel>
      </div>
    `;
  }

  /* ─── Climate Only: Single climate + ambient + sparklines ─── */

  _renderClimateOnly(climateGroup, ambientEntries) {
    return html`
      <div class="ls-content ls-climate-only">
        <lcars-climate-panel
          .group=${climateGroup}
          .hass=${this.hass}
          .editMode=${this.editMode}
          .config=${this.config}
          frame-mode="nested">
        </lcars-climate-panel>
        ${this._renderAmbientRow(ambientEntries)}
        ${this._renderSparklineTray()}
      </div>
    `;
  }

  /* ─── Sensor Hero: Large temp/humidity display for sensor-only rooms ─── */

  _renderSensorHero(ambientEntries) {
    const tempEntry = ambientEntries.find(e =>
      e.state?.attributes?.device_class === 'temperature'
    );
    const humEntry = ambientEntries.find(e =>
      e.state?.attributes?.device_class === 'humidity'
    );

    const tempVal = tempEntry ? parseFloat(tempEntry.state?.state) : null;
    const humVal = humEntry ? parseFloat(humEntry.state?.state) : null;
    const tempUnit = tempEntry?.state?.attributes?.unit_of_measurement || '°F';
    const tempColor = tempVal != null ? getTempColor(tempVal) : 'var(--lcars-butterscotch)';

    return html`
      <div class="ls-content ls-sensor-hero" role="status" aria-live="polite">
        ${tempVal != null ? html`
          <div class="ls-hero-temp"
               style="color:${tempColor}"
               aria-label="Temperature: ${tempVal} ${tempUnit}">
            ${tempVal}<span class="ls-hero-unit">${tempUnit}</span>
          </div>
        ` : ''}
        ${humVal != null ? html`
          <div class="ls-hero-humidity"
               aria-label="Humidity: ${humVal} percent">
            ${humVal}<span class="ls-hero-unit">%</span>
            <span class="ls-hero-label">HUMIDITY</span>
          </div>
        ` : ''}
        ${this._renderAmbientRow(ambientEntries.filter(e => {
          const dc = e.state?.attributes?.device_class || '';
          return dc !== 'temperature' && dc !== 'humidity';
        }))}
        ${this._renderSparklineTray()}
      </div>
    `;
  }

  /* ─── Ambient Sensor Row ─── */

  _renderAmbientRow(entries) {
    if (!entries?.length) return html``;
    return html`
      <div class="ls-ambient-row" role="region" aria-label="Ambient Sensors">
        <div class="ls-ambient-label">AMBIENT SENSORS</div>
        <div class="ls-ambient-readings">
          ${entries.map(entry => {
            const name = this._shortEntityName(entry);
            const val = entry.state?.state;
            const unit = entry.state?.attributes?.unit_of_measurement || '';
            const dc = entry.state?.attributes?.device_class || '';
            const color = dc === 'temperature' ? getTempColor(parseFloat(val))
                        : dc === 'humidity' ? 'var(--lcars-ice)'
                        : 'var(--lcars-butterscotch)';
            return html`
              <div class="ls-ambient-reading"
                   aria-label="${name}: ${val} ${unit}">
                <span class="ls-ambient-indicator" style="background:${color}"></span>
                <span class="ls-ambient-name">${name}</span>
                <span class="ls-ambient-value" style="color:${color}">${val}${unit}</span>
              </div>
            `;
          })}
        </div>
      </div>
    `;
  }

  /* ─── Sparkline Tray ─── */

  _renderSparklineTray() {
    if (this._sparklineData.size === 0) return html``;

    const sparklines = [];
    const dcColors = {
      temperature: 'var(--lcars-butterscotch)',
      humidity: 'var(--lcars-ice)',
      aqi: 'var(--lcars-sunflower)',
      pm25: 'var(--lcars-peach)',
      carbon_dioxide: 'var(--lcars-sunflower)',
      volatile_organic_compounds: 'var(--lcars-african-violet)',
    };

    const allEntities = this._getAllEntities();

    for (const [eid, data] of this._sparklineData) {
      const entry = allEntities.find(e => e.entity?.entity_id === eid);
      if (!entry) continue;
      const dc = entry.state?.attributes?.device_class || '';
      const color = dcColors[dc] || 'var(--lcars-butterscotch)';
      const label = (dc || eid.split('.')[1]).toUpperCase().replace(/_/g, ' ');

      sparklines.push(html`
        <div class="ls-sparkline-slot" aria-hidden="true">
          <span class="ls-sparkline-label" style="color:${color}">${label}</span>
          ${renderSparkline(data, { color, width: 120, height: 24 })}
        </div>
      `);
    }

    if (sparklines.length === 0) return html``;

    return html`
      <div class="ls-sparkline-tray" role="region" aria-label="24-hour trends">
        ${sparklines}
      </div>
    `;
  }

  /* ─── Utility ─── */

  _shortEntityName(entry) {
    const raw = entry.state?.attributes?.friendly_name || entry.entity?.entity_id || '';
    return this._shortenName(raw, entry.entity).toUpperCase();
  }
}

customElements.define('lcars-lifesupport-panel', LcarsLifeSupportPanel);
export { LcarsLifeSupportPanel };
