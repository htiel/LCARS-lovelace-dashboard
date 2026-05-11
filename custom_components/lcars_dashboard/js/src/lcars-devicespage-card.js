/**
 * LCARS Devices Page Card — Lists devices grouped by domain
 * Renders LCARS-styled entity buttons with expand/contract per device
 */
import { LitElement, html, css } from 'lit-element';
import { lcarsBaseStyles } from './lcars-styles.js';
import { getHass, showMoreInfo } from './lcars-helpers.js';


  class LcarsDevicesCard extends LitElement {
    static get properties() {
      return {
        _hass: { type: Object },
        _selectedDomain: { type: String },
      };
    }

    constructor() {
      super();
      this._selectedDomain = null;
    }

    set hass(hass) {
      this._hass = hass;
    }

    setConfig(config) {
      this._config = config;
    }

    _getDomainGroups() {
      if (!this._hass || !this._hass.states) return {};
      const groups = {};
      Object.keys(this._hass.states).forEach((entityId) => {
        const domain = entityId.split('.')[0];
        if (!groups[domain]) groups[domain] = [];
        groups[domain].push(entityId);
      });
      // Sort domains alphabetically
      const sorted = {};
      Object.keys(groups).sort().forEach((k) => { sorted[k] = groups[k]; });
      return sorted;
    }

    _getDomainIcon(domain) {
      const iconMap = {
        light: 'mdi:lightbulb-group',
        switch: 'mdi:toggle-switch-outline',
        sensor: 'mdi:eye',
        binary_sensor: 'mdi:radiobox-blank',
        climate: 'mdi:thermostat',
        cover: 'mdi:window-shutter',
        fan: 'mdi:fan',
        lock: 'mdi:lock',
        camera: 'mdi:video',
        media_player: 'mdi:cast',
        automation: 'mdi:robot',
        script: 'mdi:script-text',
        person: 'mdi:account',
        input_boolean: 'mdi:toggle-switch',
        input_number: 'mdi:ray-vertex',
        input_select: 'mdi:format-list-bulleted',
        input_text: 'mdi:form-textbox',
        scene: 'mdi:palette',
        group: 'mdi:google-circles-communities',
        timer: 'mdi:timer-outline',
        counter: 'mdi:counter',
        weather: 'mdi:weather-partly-cloudy',
        vacuum: 'mdi:robot-vacuum',
        water_heater: 'mdi:water-boiler',
      };
      return iconMap[domain] || 'mdi:devices';
    }

    _toggleDomain(domain) {
      this._selectedDomain = this._selectedDomain === domain ? null : domain;
    }

    _handleEntityClick(entityId) {
      showMoreInfo(entityId);
    }

    static get styles() {
      return [
        lcarsBaseStyles,
        css`
          :host { display: block; }

          .domain-list {
            display: flex;
            flex-direction: column;
            gap: var(--lcars-gap);
          }

          .domain-btn {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            height: var(--lcars-btn-height);
            padding: 0 1rem 0 0.75rem;
            background: var(--lcars-bluey);
            color: var(--lcars-black);
            border: none;
            border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            text-transform: uppercase;
            cursor: pointer;
            transition: filter var(--lcars-transition), background var(--lcars-transition);
            width: 100%;
            user-select: none;
          }

          .domain-btn:hover { filter: brightness(1.2); }
          .domain-btn[data-active] { background: var(--lcars-btn-active); }

          .domain-btn ha-icon {
            --mdc-icon-size: 20px;
            flex-shrink: 0;
          }

          .domain-name { flex: 1; overflow: hidden; text-overflow: ellipsis; }
          .domain-count { font-size: 0.75rem; opacity: 0.7; }

          .domain-entities {
            overflow: hidden;
            max-height: 0;
            opacity: 0;
            transition: max-height var(--lcars-transition-slow), opacity var(--lcars-transition);
          }

          .domain-entities[data-open] {
            max-height: 5000px;
            opacity: 1;
            padding: 0.5rem 0 0.5rem 1rem;
          }

          .entity-list {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
            gap: var(--lcars-gap);
          }

          .entity-item {
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
            user-select: none;
          }

          .entity-item:hover { filter: brightness(1.2); }
          .entity-item:active { background: var(--lcars-btn-active); }
          .entity-item[data-off] { background: var(--lcars-gray); color: var(--lcars-space-white); }

          .entity-item ha-icon { --mdc-icon-size: 16px; flex-shrink: 0; }
          .entity-item-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
          .entity-item-state { font-size: 0.75rem; opacity: 0.7; flex-shrink: 0; }

          .divider {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 0;
          }

          .divider-label {
            font-size: var(--lcars-font-size-sub);
            color: var(--lcars-text-heading);
            white-space: nowrap;
          }

          .divider-line { flex: 1; height: 2px; background: var(--lcars-data-accent); }

          @media (prefers-reduced-motion: reduce) {
            .domain-entities { transition: none; }
          }
        `,
      ];
    }

    render() {
      if (!this._hass) return html``;
      const groups = this._getDomainGroups();
      const domains = Object.keys(groups);

      return html`
        <div class="divider">
          <span class="divider-label">Devices</span>
          <div class="divider-line"></div>
        </div>

        <div class="domain-list">
          ${domains.map((domain) => html`
            <button
              class="domain-btn"
              ?data-active=${this._selectedDomain === domain}
              @click=${() => this._toggleDomain(domain)}
              aria-expanded=${this._selectedDomain === domain}
            >
              <ha-icon .icon=${this._getDomainIcon(domain)}></ha-icon>
              <span class="domain-name">${domain.replace(/_/g, ' ')}</span>
              <span class="domain-count">${groups[domain].length}</span>
            </button>

            <div class="domain-entities" ?data-open=${this._selectedDomain === domain}>
              ${this._selectedDomain === domain
                ? html`
                    <div class="entity-list">
                      ${groups[domain].map((entityId) => {
                        const state = this._hass.states[entityId];
                        if (!state) return '';
                        const isOff = state.state === 'off' || state.state === 'unavailable' || state.state === 'unknown';
                        const name = state.attributes?.friendly_name || entityId.split('.').pop().replace(/_/g, ' ');
                        return html`
                          <button
                            class="entity-item"
                            ?data-off=${isOff}
                            @click=${() => this._handleEntityClick(entityId)}
                            title="${name}: ${state.state}"
                          >
                            <ha-icon .icon=${state.attributes?.icon || this._getDomainIcon(domain)}></ha-icon>
                            <span class="entity-item-name">${name}</span>
                            <span class="entity-item-state">${state.state}</span>
                          </button>
                        `;
                      })}
                    </div>
                  `
                : ''}
            </div>
          `)}
        </div>
      `;
    }

    getCardSize() { return 8; }
  }

  if (!customElements.get('devices-card')) {
    customElements.define('devices-card', LcarsDevicesCard);
  }