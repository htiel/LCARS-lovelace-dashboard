/**
 * LCARS Homepage Card — Main dashboard view with areas, favorites, house info
 * Fetches configuration via websocket, renders LCARS-styled area panels
 * Areas expand/contract on click with LCARS transition animations
 */
import { LitElement, html, css } from 'lit-element';
import { lcarsBaseStyles } from './lcars-styles.js';
import { getHass, showMoreInfo, fireEvent } from './lcars-helpers.js';

const waitForHelpers = [
  customElements.whenDefined('hui-masonry-view'),
  customElements.whenDefined('hc-lovelace'),
];

Promise.race(waitForHelpers).then(async () => {
  await new Promise((r) => setTimeout(r, 2000));
  const helpers = await window.loadCardHelpers();

  class LcarsHomepageCard extends LitElement {
    static get properties() {
      return {
        data: { type: Object },
        favorites: { type: Object },
        selectedArea: { type: String },
        _hass: { type: Object },
        _cards: { type: Object },
      };
    }

    constructor() {
      super();
      this.data = null;
      this.favorites = {};
      this.selectedArea = null;
      this._cards = {};
    }

    set hass(hass) {
      this._hass = hass;
      // Propagate hass to child cards
      if (this._cards) {
        Object.values(this._cards).forEach((card) => {
          if (card && card.hass !== undefined) card.hass = hass;
        });
      }
      if (!this.data) {
        this._loadConfiguration();
      }
    }

    async _loadConfiguration() {
      if (!this._hass) return;
      try {
        const result = await this._hass.callWS({
          type: 'lcars_dashboard/configuration/get',
        });
        this.data = result;
      } catch (e) {
        console.error('LCARS: Failed to load configuration', e);
      }
    }

    _selectArea(areaId) {
      if (this.selectedArea === areaId) {
        this.selectedArea = null; // Collapse
      } else {
        this.selectedArea = areaId; // Expand
      }
    }

    _handleEntityClick(entityId) {
      showMoreInfo(entityId);
    }

    _getAreaEntities(areaId) {
      if (!this._hass || !this.data) return [];
      const entityReg = Object.values(this._hass.entities || {});
      return entityReg.filter(
        (e) => e.area_id === areaId && !e.hidden_by && !e.disabled_by
      );
    }

    _getEntityState(entityId) {
      if (!this._hass || !this._hass.states[entityId]) return null;
      return this._hass.states[entityId];
    }

    _getEntityIcon(state) {
      if (!state) return 'mdi:help-circle-outline';
      if (state.attributes && state.attributes.icon) return state.attributes.icon;
      const domain = state.entity_id.split('.')[0];
      const iconMap = {
        light: 'mdi:lightbulb',
        switch: 'mdi:toggle-switch',
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
      };
      return iconMap[domain] || 'mdi:information-outline';
    }

    static get styles() {
      return [
        lcarsBaseStyles,
        css`
          :host {
            display: block;
          }

          /* ─── Areas Grid ─── */
          .areas-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
            gap: var(--lcars-gap);
          }

          /* ─── Area Panel (LCARS bracket-style) ─── */
          .area-panel {
            background: transparent;
            border: none;
            cursor: pointer;
            padding: 0;
            text-align: left;
            width: 100%;
          }

          .area-btn {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            height: var(--lcars-btn-height);
            padding: 0 1rem 0 0.75rem;
            background: var(--lcars-butterscotch);
            color: var(--lcars-black);
            border: none;
            border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            text-transform: uppercase;
            cursor: pointer;
            transition: filter var(--lcars-transition), background var(--lcars-transition);
            width: 100%;
            white-space: nowrap;
            overflow: hidden;
            user-select: none;
          }

          .area-btn:hover {
            filter: brightness(1.2);
          }

          .area-btn[data-active] {
            background: var(--lcars-btn-active);
          }

          .area-btn ha-icon {
            --mdc-icon-size: 20px;
            flex-shrink: 0;
          }

          .area-name {
            overflow: hidden;
            text-overflow: ellipsis;
            flex: 1;
          }

          .area-count {
            font-size: 0.75rem;
            opacity: 0.7;
            flex-shrink: 0;
          }

          /* ─── Expanded Area Content ─── */
          .area-expanded {
            grid-column: 1 / -1;
            overflow: hidden;
            max-height: 0;
            opacity: 0;
            transition: max-height var(--lcars-transition-slow),
                        opacity var(--lcars-transition);
          }

          .area-expanded[data-open] {
            max-height: 2000px;
            opacity: 1;
            padding: 0.5rem 0;
          }

          /* ─── Entity List within Area ─── */
          .entity-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
            gap: var(--lcars-gap);
            padding: 0.5rem 0;
          }

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

          .entity-btn:hover {
            filter: brightness(1.2);
          }

          .entity-btn:active {
            background: var(--lcars-btn-active);
          }

          .entity-btn ha-icon {
            --mdc-icon-size: 16px;
            flex-shrink: 0;
          }

          .entity-btn .entity-name {
            overflow: hidden;
            text-overflow: ellipsis;
            flex: 1;
          }

          .entity-btn .entity-state {
            font-size: 0.75rem;
            color: var(--lcars-black);
            opacity: 0.7;
            flex-shrink: 0;
          }

          .entity-btn[data-off] {
            background: var(--lcars-gray);
            color: var(--lcars-space-white);
          }

          .entity-btn[data-off] .entity-state {
            color: var(--lcars-space-white);
          }

          /* ─── Section Divider ─── */
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

          /* ─── No data state ─── */
          .lcars-empty {
            color: var(--lcars-gray);
            font-size: var(--lcars-font-size-sub);
            padding: 2rem 0;
            text-align: center;
          }

          @media (prefers-reduced-motion: reduce) {
            .area-expanded {
              transition: none;
            }
          }
        `,
      ];
    }

    render() {
      if (!this._hass) {
        return html`<div class="lcars-empty">Initializing...</div>`;
      }

      const areas = this._hass.areas
        ? Object.values(this._hass.areas)
        : [];

      if (areas.length === 0) {
        return html`<div class="lcars-empty">No areas configured</div>`;
      }

      return html`
        <div class="lcars-divider">
          <span class="lcars-divider-label">Areas</span>
          <div class="lcars-divider-line"></div>
        </div>

        <div class="areas-grid">
          ${areas.map((area) => this._renderArea(area))}
        </div>
      `;
    }

    _renderArea(area) {
      const isSelected = this.selectedArea === area.area_id;
      const entities = this._getAreaEntities(area.area_id);

      return html`
        <div class="area-panel">
          <button
            class="area-btn"
            ?data-active=${isSelected}
            aria-expanded=${isSelected}
            aria-controls="area-${area.area_id}"
            @click=${() => this._selectArea(area.area_id)}
          >
            <ha-icon .icon=${area.icon || 'mdi:home-outline'}></ha-icon>
            <span class="area-name">${area.name}</span>
            <span class="area-count">${entities.length}</span>
          </button>
        </div>

        <div
          class="area-expanded"
          id="area-${area.area_id}"
          ?data-open=${isSelected}
          role="region"
          aria-label="${area.name} entities"
        >
          ${isSelected ? this._renderAreaEntities(entities) : ''}
        </div>
      `;
    }

    _renderAreaEntities(entities) {
      if (entities.length === 0) {
        return html`<div class="lcars-empty">No entities in this area</div>`;
      }

      return html`
        <div class="entity-grid">
          ${entities.map((entity) => {
            const state = this._getEntityState(entity.entity_id);
            if (!state) return '';
            const isOff =
              state.state === 'off' ||
              state.state === 'unavailable' ||
              state.state === 'unknown';
            const friendlyName =
              state.attributes?.friendly_name ||
              entity.entity_id.split('.').pop().replace(/_/g, ' ');
            const stateDisplay =
              state.state === 'unavailable'
                ? 'N/A'
                : state.state;

            return html`
              <button
                class="entity-btn"
                ?data-off=${isOff}
                @click=${() => this._handleEntityClick(entity.entity_id)}
                title="${friendlyName}: ${stateDisplay}"
              >
                <ha-icon .icon=${this._getEntityIcon(state)}></ha-icon>
                <span class="entity-name">${friendlyName}</span>
                <span class="entity-state">${stateDisplay}</span>
              </button>
            `;
          })}
        </div>
      `;
    }

    getCardSize() {
      return 6;
    }
  }

  if (!customElements.get('homepage-card')) {
    customElements.define('homepage-card', LcarsHomepageCard);
  }
});
