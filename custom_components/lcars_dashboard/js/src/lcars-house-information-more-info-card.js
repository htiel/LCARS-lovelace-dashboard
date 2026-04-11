/**
 * LCARS House Information More Info Card — Expanded detail view
 * Shows detailed house info when user clicks "more info" on house panel
 */
import { LitElement, html, css } from 'lit-element';
import { lcarsBaseStyles } from './lcars-styles.js';
import { showMoreInfo } from './lcars-helpers.js';


  class LcarsHouseInfoMoreInfoCard extends LitElement {
    static get properties() {
      return {
        _hass: { type: Object },
        _config: { type: Object },
      };
    }

    set hass(hass) { this._hass = hass; }
    setConfig(config) { this._config = config; }

    static get styles() {
      return [
        lcarsBaseStyles,
        css`
          :host { display: block; }

          .detail-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
            gap: var(--lcars-gap);
            padding: 0.5rem 0;
          }

          .detail-tile {
            background: var(--lcars-ice);
            color: var(--lcars-black);
            padding: 0.75rem;
            border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
            font-family: var(--lcars-font);
            text-transform: uppercase;
            cursor: pointer;
            border: none;
            text-align: left;
            width: 100%;
            transition: filter var(--lcars-transition);
          }

          .detail-tile:hover { filter: brightness(1.2); }

          .detail-label {
            font-size: 0.625rem;
            opacity: 0.7;
            margin-bottom: 0.25rem;
          }

          .detail-value {
            font-size: var(--lcars-font-size-data);
          }
        `,
      ];
    }

    render() {
      if (!this._hass) return html``;

      // Show all sensor entities as detail tiles
      const sensors = Object.keys(this._hass.states)
        .filter((id) => id.startsWith('sensor.'))
        .slice(0, 20) // Limit for performance
        .map((id) => this._hass.states[id]);

      return html`
        <div class="detail-grid">
          ${sensors.map(
            (s) => html`
              <button
                class="detail-tile"
                @click=${() => showMoreInfo(s.entity_id)}
              >
                <div class="detail-label">
                  ${s.attributes?.friendly_name || s.entity_id.split('.').pop().replace(/_/g, ' ')}
                </div>
                <div class="detail-value">
                  ${s.state}${s.attributes?.unit_of_measurement ? ` ${s.attributes.unit_of_measurement}` : ''}
                </div>
              </button>
            `
          )}
        </div>
      `;
    }

    getCardSize() { return 4; }
  }

  if (!customElements.get('lcars-house-information-more-info-card')) {
    customElements.define('lcars-house-information-more-info-card', LcarsHouseInfoMoreInfoCard);
  }