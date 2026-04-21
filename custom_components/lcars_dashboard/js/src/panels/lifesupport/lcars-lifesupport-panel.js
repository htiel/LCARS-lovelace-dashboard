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
import { canonicalLabel, ariaLabel, formatNumber } from '../../lcars-format-utils.js';
import {
  isClimateEntity, isEnvironmentEntity, isAmbientSensor,
  isAirPurifierEntity, isAQSensorEntity,
  AQ_DEVICE_CLASSES, AQ_ENTITY_SUFFIX_RE,
  classifyDevice, PANEL_TYPE_CLIMATE, PANEL_TYPE_ENVIRONMENT,
  SENSOR_DOMAINS, isDiagnosticEntity,
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
   * Partition all entities into functional groups for substations. (4X-46)
   * Returns { climateGroup, scrubberGroup, sensorArrayEntries, ambientEntries, otherEntries, config }.
   *
   * Environment entities are split into two buckets:
   * - scrubberEntries: from devices that include an active purifier fan (AQ_FAN_PLATFORMS)
   * - sensorArrayEntries: passive AQ monitors with no purifier fan (e.g. Awair)
   */
  _partitionEntities() {
    const allEntries = this._getAllEntities();
    const devices = this.hass?.devices || {};

    // First pass: partition by function
    const climateEntries = [];
    const envEntries = [];
    const ambientEntries = [];
    const otherEntries = [];

    for (const entry of allEntries) {
      // P3 QA-E06: filter diagnostic entities from life support panels
      if (isDiagnosticEntity(entry)) continue;
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

    // Second pass: split environment entries into scrubber vs sensor-array (4X-46)
    // A device with ANY purifier fan entity → all its env entities go to scrubber
    // A device with ONLY passive AQ sensors → sensor array
    const scrubberEntries = [];
    const sensorArrayEntries = [];

    const envByDevice = new Map();
    for (const entry of envEntries) {
      const devId = entry.entity?.device_id || '_ungrouped';
      if (!envByDevice.has(devId)) envByDevice.set(devId, []);
      envByDevice.get(devId).push(entry);
    }

    for (const [devId, entries] of envByDevice) {
      const hasPurifierFan = entries.some(e => isAirPurifierEntity(e));
      // 4X-57: HomeKit air purifier detection — a homekit_controller fan qualifies
      // as a purifier ONLY if the same device has an AQ sensor (PM2.5, etc.).
      // Prevents generic HomeKit ceiling/desk fans from being misclassified.
      const hasHomeKitPurifier = !hasPurifierFan && entries.some(e =>
        e.domain === 'fan' && e.entity?.platform === 'homekit_controller'
      ) && entries.some(e => AQ_DEVICE_CLASSES.has(e.state?.attributes?.device_class || ''));
      if (hasPurifierFan || hasHomeKitPurifier) {
        scrubberEntries.push(...entries);
      } else {
        sensorArrayEntries.push(...entries);
      }
    }

    // Build device groups
    const climateGroup = this._buildDeviceGroup(climateEntries, devices);
    const scrubberGroup = this._buildDeviceGroup(scrubberEntries, devices);

    // Determine configuration
    const hasClimate = climateEntries.length > 0;
    const hasScrubber = scrubberEntries.length > 0;
    const hasSensorArray = sensorArrayEntries.length > 0;

    let config;
    if (hasClimate && hasScrubber) config = 'full';
    else if (!hasClimate && hasScrubber) config = 'atmos-only';
    else if (hasClimate && !hasScrubber) config = 'climate-only';
    else if (hasSensorArray) config = 'sensor-array-only';
    else config = 'sensors-only';

    return { climateGroup, scrubberGroup, sensorArrayEntries, ambientEntries, otherEntries, config };
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
    const raw = tempEntry.state?.state;
    // 4X-52: Show gray placeholder when temperature sensor is unavailable
    if (raw === 'unavailable' || raw === 'unknown') {
      return html`<lcars-summary-badge value="\u2014" color="var(--lcars-gray)"></lcars-summary-badge>`;
    }
    const val = parseFloat(raw);
    if (isNaN(val)) return html`<lcars-summary-badge value="\u2014" color="var(--lcars-gray)"></lcars-summary-badge>`;
    const unit = tempEntry.state?.attributes?.unit_of_measurement || '°F';
    const color = getTempColor(val);
    return html`<lcars-summary-badge value="${formatNumber(String(val), 'temperature')}${unit}" color="${color}"></lcars-summary-badge>`;
  }

  renderContent() {
    const { climateGroup, scrubberGroup, sensorArrayEntries, ambientEntries, config } = this._partitionEntities();

    switch (config) {
      case 'full':
        return this._renderFullLayout(climateGroup, scrubberGroup, sensorArrayEntries, ambientEntries);
      case 'atmos-only':
        return this._renderAtmosOnly(scrubberGroup, sensorArrayEntries, ambientEntries);
      case 'climate-only':
        return this._renderClimateOnly(climateGroup, sensorArrayEntries, ambientEntries);
      case 'sensor-array-only':
        return this._renderSensorArrayOnly(sensorArrayEntries, ambientEntries);
      case 'sensors-only':
        return this._renderSensorHero(ambientEntries);
      default:
        return html`<div class="ls-empty">NO LIFE SUPPORT DATA</div>`;
    }
  }

  /* ─── Full Layout: Climate + Scrubber substations + sensor array + ambient + sparklines ─── */

  _renderFullLayout(climateGroup, scrubberGroup, sensorArrayEntries, ambientEntries) {
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
              .group=${scrubberGroup}
              .hass=${this.hass}
              .editMode=${this.editMode}
              .config=${this.config}
              frame-mode="nested">
            </lcars-environment-panel>
          </div>
        </div>
        ${this._renderSensorArray(sensorArrayEntries)}
        ${this._renderAmbientRow(ambientEntries)}
        ${this._renderSparklineTray()}
      </div>
    `;
  }

  /* ─── Atmos Only: Scrubber + optional sensor array + ambient (4X-46 fix) ─── */

  _renderAtmosOnly(scrubberGroup, sensorArrayEntries, ambientEntries) {
    return html`
      <div class="ls-content ls-atmos-only">
        <lcars-environment-panel
          .group=${scrubberGroup}
          .hass=${this.hass}
          .editMode=${this.editMode}
          .config=${this.config}
          frame-mode="nested">
        </lcars-environment-panel>
        ${this._renderSensorArray(sensorArrayEntries)}
        ${this._renderAmbientRow(ambientEntries)}
        ${this._renderSparklineTray()}
      </div>
    `;
  }

  /* ─── Climate Only: Single climate + sensor array + ambient + sparklines ─── */

  _renderClimateOnly(climateGroup, sensorArrayEntries, ambientEntries) {
    return html`
      <div class="ls-content ls-climate-only">
        <lcars-climate-panel
          .group=${climateGroup}
          .hass=${this.hass}
          .editMode=${this.editMode}
          .config=${this.config}
          frame-mode="nested">
        </lcars-climate-panel>
        ${this._renderSensorArray(sensorArrayEntries)}
        ${this._renderAmbientRow(ambientEntries)}
        ${this._renderSparklineTray()}
      </div>
    `;
  }

  /* ─── Sensor Array Only: passive AQ monitors with no thermostat/purifier (4X-46) ─── */

  _renderSensorArrayOnly(sensorArrayEntries, ambientEntries) {
    return html`
      <div class="ls-content ls-sensor-array-only">
        ${this._renderSensorArray(sensorArrayEntries)}
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
    const tempDisplay = tempVal != null ? formatNumber(String(tempVal), 'temperature') : null;
    const humDisplay = humVal != null ? formatNumber(String(humVal), 'humidity') : null;

    return html`
      <div class="ls-content ls-sensor-hero" role="status" aria-live="polite">
        ${tempDisplay != null ? html`
          <div class="ls-hero-temp"
               style="color:${tempColor}"
               aria-label="Temperature: ${tempDisplay} ${tempUnit}">
            ${tempDisplay}<span class="ls-hero-unit">${tempUnit}</span>
          </div>
        ` : ''}
        ${humDisplay != null ? html`
          <div class="ls-hero-humidity"
               aria-label="Humidity: ${humDisplay} percent">
            ${humDisplay}<span class="ls-hero-unit">%</span>
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

  /* ─── Sensor Array: compact AQ readout for passive monitors (4X-46) ─── */

  _getAQMetricColor(deviceClass, value) {
    const v = parseFloat(value);
    if (isNaN(v)) return 'var(--lcars-gray, #666688)';
    switch (deviceClass) {
      case 'carbon_dioxide':
        return v <= 600 ? 'var(--lcars-ice)' : v <= 1000 ? 'var(--lcars-sunflower)' : 'var(--lcars-tomato)';
      case 'volatile_organic_compounds':
      case 'volatile_organic_compounds_parts':
        return v <= 150 ? 'var(--lcars-ice)' : v <= 500 ? 'var(--lcars-sunflower)' : 'var(--lcars-tomato)';
      case 'pm25':
        return v <= 12 ? 'var(--lcars-ice)' : v <= 35 ? 'var(--lcars-sunflower)' : 'var(--lcars-tomato)';
      case 'pm10':
        return v <= 54 ? 'var(--lcars-ice)' : v <= 154 ? 'var(--lcars-sunflower)' : 'var(--lcars-tomato)';
      case 'aqi':
        return v <= 50 ? 'var(--lcars-ice)' : v <= 100 ? 'var(--lcars-sunflower)' : 'var(--lcars-tomato)';
      default:
        return 'var(--lcars-butterscotch)';
    }
  }

  _renderSensorArray(entries) {
    if (!entries?.length) return html``;

    // Separate score entries from AQ metric entries
    const scoreEntries = entries.filter(e =>
      !e.state?.attributes?.device_class &&
      e.domain === 'sensor' &&
      AQ_ENTITY_SUFFIX_RE.test(e.entity?.entity_id || '')
    );
    const aqEntries = entries.filter(e =>
      AQ_DEVICE_CLASSES.has(e.state?.attributes?.device_class || '')
    );

    // Order AQ metrics: PM2.5, CO2, VOC, PM10, then rest
    const AQ_ORDER = ['pm25', 'carbon_dioxide', 'volatile_organic_compounds', 'volatile_organic_compounds_parts', 'pm10', 'aqi'];
    aqEntries.sort((a, b) => {
      const dcA = a.state?.attributes?.device_class || '';
      const dcB = b.state?.attributes?.device_class || '';
      const iA = AQ_ORDER.indexOf(dcA);
      const iB = AQ_ORDER.indexOf(dcB);
      return (iA === -1 ? 99 : iA) - (iB === -1 ? 99 : iB);
    });

    const scoreEntry = scoreEntries[0];
    const scoreVal = scoreEntry ? parseFloat(scoreEntry.state?.state) : null;
    const scoreColor = scoreVal != null && Number.isFinite(scoreVal)
      ? (scoreVal >= 80 ? 'var(--lcars-ice)' : scoreVal >= 60 ? 'var(--lcars-sunflower)' : 'var(--lcars-tomato)')
      : 'var(--lcars-gray)';

    return html`
      <div class="ls-sensor-array" role="region" aria-label="Air Quality Sensor Array">
        <div class="ls-sensor-array-header">
          <span class="ls-sensor-array-label">SENSOR ARRAY</span>
          ${scoreEntry && scoreVal != null && Number.isFinite(scoreVal) ? html`
            <span class="ls-sensor-array-score" style="color:${scoreColor}"
                  aria-label="Air quality score: ${Math.round(scoreVal)}">
              ${Math.round(scoreVal)}
            </span>
          ` : ''}
        </div>
        <div class="ls-sensor-array-grid">
          ${aqEntries.map(entry => {
            const dc = entry.state?.attributes?.device_class || '';
            const name = this._shortEntityName(entry);
            const { text } = this._formatSensorValue(entry.state, entry.entity);
            const color = this._getAQMetricColor(dc, entry.state?.state);
            return html`
              <div class="ls-aq-metric" aria-label="${name}: ${text}">
                <span class="ls-aq-indicator" style="background:${color}"></span>
                <span class="ls-aq-name">${name}</span>
                <span class="ls-aq-value" style="color:${color}">${text}</span>
              </div>
            `;
          })}
        </div>
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
            const { text } = this._formatSensorValue(entry.state, entry.entity);
            const dc = entry.state?.attributes?.device_class || '';
            const color = dc === 'temperature' ? getTempColor(parseFloat(entry.state?.state))
                        : dc === 'humidity' ? 'var(--lcars-ice)'
                        : 'var(--lcars-butterscotch)';
            return html`
              <div class="ls-ambient-reading"
                   aria-label="${name}: ${text}">
                <span class="ls-ambient-indicator" style="background:${color}"></span>
                <span class="ls-ambient-name">${name}</span>
                <span class="ls-ambient-value" style="color:${color}">${text}</span>
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

    // P3 QA-E05: deduplicate sparklines by device_class, keep most recent
    const dcBestMap = new Map(); // device_class → { eid, entry, data, lastUpdated }
    for (const [eid, data] of this._sparklineData) {
      const entry = allEntities.find(e => e.entity?.entity_id === eid);
      if (!entry) continue;
      const dc = entry.state?.attributes?.device_class || eid;
      const lastUpdated = entry.state?.last_updated || '';
      const existing = dcBestMap.get(dc);
      if (!existing || lastUpdated > existing.lastUpdated) {
        dcBestMap.set(dc, { eid, entry, data, lastUpdated });
      }
    }

    for (const { eid, entry, data } of dcBestMap.values()) {
      const dc = entry.state?.attributes?.device_class || '';
      const color = dcColors[dc] || 'var(--lcars-butterscotch)';
      const rawFallback = (dc || eid.split('.')[1] || '').toUpperCase().replace(/_/g, ' ');
      const label = canonicalLabel(dc, rawFallback, eid);
      const ariaText = ariaLabel(label);

      sparklines.push(html`
        <div class="ls-sparkline-slot" aria-label="${ariaText}">
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
