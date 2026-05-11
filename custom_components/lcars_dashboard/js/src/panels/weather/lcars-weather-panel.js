/**
 * lcars-weather-panel.js
 *
 * Extracted weather device panel — Davis Instruments / WeatherFlow.
 * Condition viewscreen, wind compass, 7-day forecast strip, lightning/precip sensors.
 *
 * v4.17.0 Panel Extraction Architecture (4X-6)
 */
import { html } from 'lit-element';
import { LcarsBasePanel } from '../../lcars-base-panel.js';
import { SENSOR_DOMAINS } from '../../lcars-entity-utils.js';
import { getWeatherConditionColor } from '../../lcars-color-utils.js';
import { fetchForecasts } from '../../lcars-weather-utils.js';
import { humanizeTimestamp } from '../../lcars-format-utils.js';
import { sharedKeyframes, sharedReducedMotion } from '../../lcars-shared-animations.js';
import { weatherPanelStyles } from './lcars-weather-panel-styles.js';

class LcarsWeatherPanel extends LcarsBasePanel {

  get panelType() { return 'weather'; }
  get defaultPanelTitle() { return 'Weather'; }
  get frameColor() {
    const ws = this.group?.entities?.find(e => e.domain === 'weather')?.state;
    const condition = ws?.state || 'unavailable';
    if (condition === 'unavailable' || condition === 'unknown') return 'var(--lcars-gray)';
    return getWeatherConditionColor(condition);
  }

  static get styles() {
    return [...super.styles, sharedKeyframes, sharedReducedMotion, weatherPanelStyles];
  }

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
    return html`
      <div class="weather-wind-compass" role="img"
        aria-label="Wind: ${speed || '?'} ${unit || 'mph'} from ${cardinal}">
        <svg viewBox="0 0 80 80" class="wind-svg">
          <circle cx="40" cy="40" r="28" fill="none" stroke="var(--lcars-disabled)" stroke-width="1" />
          <text x="40" y="12" text-anchor="middle" fill="var(--lcars-data-accent)" font-size="7" font-family="var(--lcars-font)">N</text>
          <text x="40" y="76" text-anchor="middle" fill="var(--lcars-data-accent)" font-size="7" font-family="var(--lcars-font)">S</text>
          <text x="8" y="43" text-anchor="middle" fill="var(--lcars-data-accent)" font-size="7" font-family="var(--lcars-font)">W</text>
          <text x="72" y="43" text-anchor="middle" fill="var(--lcars-data-accent)" font-size="7" font-family="var(--lcars-font)">E</text>
          <g transform="rotate(${bearing}, 40, 40)">
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
    const data = await fetchForecasts(this.hass, entityId, 'daily');
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
              <span class="forecast-hi">${hi != null ? html`${Math.round(hi)}°` : '—'}</span>
              <div class="forecast-range-bar">
                <div class="forecast-range-fill" style="left:${leftPct.toFixed(1)}%;width:${widthPct.toFixed(1)}%"></div>
              </div>
              <span class="forecast-lo">${lo != null ? html`${Math.round(lo)}°` : '—'}</span>
              ${precip != null ? html`<span class="forecast-precip" style="color:${precip > 50 ? 'var(--lcars-sky)' : 'var(--lcars-gray)'}">${precip}%</span>` : ''}
            </div>
          `;
        })}
      </div>
    `;
  }

  renderBadge() {
    const ws = this.group?.entities?.find(e => e.domain === 'weather')?.state;
    const condition = ws?.state || 'unavailable';
    const isOffline = condition === 'unavailable' || condition === 'unknown';
    const condColor = isOffline ? 'var(--lcars-gray)' : getWeatherConditionColor(condition);
    const glyph = isOffline ? '○' : this._getWeatherGlyph(condition);
    const label = isOffline ? 'OFFLINE' : condition.toUpperCase().replace(/[_-]/g, ' ');
    return html`<span style="color:${condColor}">${glyph} ${label}</span>`;
  }

  renderContent() {
    const { weather, sensors, lightning, precipitation } = this._partitionWeatherEntities(this.group.entities);
    const deviceName = this._shortDeviceName(this.group.device) || 'Weather';

    if (weather.length === 0) return html``;
    const primary = weather[0];
    const ws = primary.state;
    const attrs = ws?.attributes || {};
    const condition = ws?.state || 'unavailable';
    const isOffline = condition === 'unavailable' || condition === 'unknown';
    const condColor = isOffline ? 'var(--lcars-gray)' : getWeatherConditionColor(condition);
    const glyph = isOffline ? '○' : this._getWeatherGlyph(condition);
    const currentTemp = attrs.temperature;
    const humidity = attrs.humidity;
    const pressure = attrs.pressure;
    const windSpeed = attrs.wind_speed;
    const windBearing = attrs.wind_bearing;
    const windUnit = attrs.wind_speed_unit || 'mph';
    const lastChanged = ws?.last_changed || ws?.last_updated;
    const lastKnownLabel = isOffline && lastChanged ? humanizeTimestamp(lastChanged) : null;

    if (!isOffline) this._loadWeatherForecast(primary.entity.entity_id);
    const forecasts = this._weatherForecastCache[primary.entity.entity_id];

    return html`
      <div class="weather-content ${isOffline ? 'weather-offline' : ''}">

        ${isOffline ? html`
          <div class="weather-offline-banner" role="status" aria-live="polite">
            OFFLINE${lastKnownLabel ? html` · LAST DATA ${lastKnownLabel}` : ''}
          </div>
        ` : ''}

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

        ${this._renderForecastStrip(forecasts)}
      </div>
    `;
  }
}

if (!customElements.get('lcars-weather-panel')) {
  customElements.define('lcars-weather-panel', LcarsWeatherPanel);
}
