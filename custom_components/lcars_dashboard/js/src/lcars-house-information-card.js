/**
 * LCARS House Information Card — Shows house-wide sensor summary
 * Weather, occupancy, battery, and system status panels
 */
import { LitElement, html, css } from 'lit-element';
import { lcarsBaseStyles } from './lcars-styles.js';
import { showMoreInfo } from './lcars-helpers.js';

const waitForHelpers = [
  customElements.whenDefined('hui-masonry-view'),
  customElements.whenDefined('hc-lovelace'),
];

Promise.race(waitForHelpers).then(async () => {
  await new Promise((r) => setTimeout(r, 2000));

  class LcarsHouseInfoCard extends LitElement {
    static get properties() {
      return {
        _hass: { type: Object },
        _config: { type: Object },
        _expanded: { type: Boolean },
      };
    }

    constructor() {
      super();
      this._expanded = false;
    }

    set hass(hass) {
      this._hass = hass;
    }

    setConfig(config) {
      this._config = config;
    }

    _toggle() {
      this._expanded = !this._expanded;
    }

    _getWeatherEntity() {
      if (!this._hass) return null;
      const weatherEntities = Object.keys(this._hass.states).filter((id) =>
        id.startsWith('weather.')
      );
      return weatherEntities.length > 0 ? this._hass.states[weatherEntities[0]] : null;
    }

    _getPersonEntities() {
      if (!this._hass) return [];
      return Object.keys(this._hass.states)
        .filter((id) => id.startsWith('person.'))
        .map((id) => this._hass.states[id]);
    }

    static get styles() {
      return [
        lcarsBaseStyles,
        css`
          :host { display: block; }

          .info-header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            height: var(--lcars-btn-height);
            padding: 0 1rem 0 0.75rem;
            background: var(--lcars-peach);
            color: var(--lcars-black);
            border: none;
            border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            text-transform: uppercase;
            cursor: pointer;
            transition: filter var(--lcars-transition);
            width: 100%;
            user-select: none;
          }

          .info-header:hover { filter: brightness(1.2); }
          .info-header ha-icon { --mdc-icon-size: 20px; flex-shrink: 0; }
          .info-label { flex: 1; }

          .info-body {
            overflow: hidden;
            max-height: 0;
            opacity: 0;
            transition: max-height var(--lcars-transition-slow), opacity var(--lcars-transition);
          }

          .info-body[data-open] {
            max-height: 1500px;
            opacity: 1;
            padding: 0.5rem 0;
          }

          .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
            gap: var(--lcars-gap);
          }

          .info-tile {
            background: var(--lcars-ice);
            color: var(--lcars-black);
            padding: 0.5rem 0.75rem;
            border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            text-transform: uppercase;
            cursor: pointer;
            transition: filter var(--lcars-transition);
            user-select: none;
            border: none;
            text-align: left;
            width: 100%;
          }

          .info-tile:hover { filter: brightness(1.2); }

          .info-tile-label {
            font-size: 0.625rem;
            opacity: 0.7;
            margin-bottom: 0.125rem;
          }

          .info-tile-value {
            font-size: var(--lcars-font-size-data);
          }

          @media (prefers-reduced-motion: reduce) {
            .info-body { transition: none; }
          }
        `,
      ];
    }

    render() {
      if (!this._hass) return html``;

      const weather = this._getWeatherEntity();
      const persons = this._getPersonEntities();

      return html`
        <button class="info-header" @click=${this._toggle} aria-expanded=${this._expanded}>
          <ha-icon icon="mdi:home-analytics"></ha-icon>
          <span class="info-label">House Information</span>
          ${weather
            ? html`<span>${weather.state} ${weather.attributes.temperature || ''}°</span>`
            : ''}
        </button>

        <div class="info-body" ?data-open=${this._expanded}>
          <div class="info-grid">
            ${weather
              ? html`
                  <button
                    class="info-tile"
                    @click=${() => showMoreInfo(weather.entity_id)}
                  >
                    <div class="info-tile-label">Weather</div>
                    <div class="info-tile-value">
                      ${weather.state} ${weather.attributes.temperature || ''}°
                    </div>
                  </button>
                  <button
                    class="info-tile"
                    @click=${() => showMoreInfo(weather.entity_id)}
                  >
                    <div class="info-tile-label">Humidity</div>
                    <div class="info-tile-value">
                      ${weather.attributes.humidity || '--'}%
                    </div>
                  </button>
                `
              : ''}

            ${persons.map(
              (p) => html`
                <button
                  class="info-tile"
                  @click=${() => showMoreInfo(p.entity_id)}
                >
                  <div class="info-tile-label">
                    ${p.attributes?.friendly_name || p.entity_id.split('.').pop()}
                  </div>
                  <div class="info-tile-value">${p.state}</div>
                </button>
              `
            )}
          </div>
        </div>
      `;
    }

    getCardSize() { return this._expanded ? 4 : 1; }
  }

  if (!customElements.get('lcars-house-information-card')) {
    customElements.define('lcars-house-information-card', LcarsHouseInfoCard);
  }
});
