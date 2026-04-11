/**
 * LCARS Navigation Card — Sidebar navigation with LCARS pill buttons
 * Shows areas as pill-shaped buttons, handles selection with gold active state
 */
import { LitElement, html, css } from 'lit-element';
import { lcarsBaseStyles } from './lcars-styles.js';
import { getHass, navigate, fireEvent } from './lcars-helpers.js';

const waitForHelpers = [
  customElements.whenDefined('hui-masonry-view'),
  customElements.whenDefined('hc-lovelace'),
];

Promise.race(waitForHelpers).then(async () => {
  await new Promise((r) => setTimeout(r, 2000));

  class LcarsNavigationCard extends LitElement {
    static get properties() {
      return {
        _hass: { type: Object },
        _config: { type: Object },
        _activePath: { type: String },
      };
    }

    constructor() {
      super();
      this._activePath = 'home';
    }

    set hass(hass) {
      this._hass = hass;
    }

    setConfig(config) {
      this._config = config;
    }

    _handleNav(path) {
      this._activePath = path;
      navigate(`/lcars-dashboard/${path}`);
      this.requestUpdate();
    }

    static get styles() {
      return [
        lcarsBaseStyles,
        css`
          :host {
            display: block;
          }

          .nav-container {
            display: flex;
            flex-direction: column;
            gap: var(--lcars-gap);
          }

          .nav-btn {
            display: flex;
            align-items: center;
            height: var(--lcars-btn-height);
            padding: 0 1rem 0 0.75rem;
            background: var(--lcars-btn-nav);
            color: var(--lcars-black);
            border: none;
            border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
            font-family: var(--lcars-font);
            font-size: var(--lcars-font-size-data);
            text-transform: uppercase;
            text-align: left;
            cursor: pointer;
            transition: filter var(--lcars-transition);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            user-select: none;
            min-width: 0;
            width: 100%;
          }

          .nav-btn:hover {
            filter: brightness(1.2);
          }

          .nav-btn:active,
          .nav-btn[data-active] {
            background: var(--lcars-btn-active);
          }

          .nav-btn ha-icon {
            --mdc-icon-size: 18px;
            margin-right: 0.5rem;
            flex-shrink: 0;
          }

          .nav-label {
            overflow: hidden;
            text-overflow: ellipsis;
          }
        `,
      ];
    }

    render() {
      const navItems = [
        { path: 'home', icon: 'mdi:home', label: 'Home' },
        { path: 'devices', icon: 'mdi:format-list-bulleted-type', label: 'Devices' },
        { path: 'more', icon: 'mdi:dots-horizontal', label: 'More' },
      ];

      return html`
        <div class="nav-container" role="menubar" aria-label="Main navigation">
          ${navItems.map(
            (item) => html`
              <button
                class="nav-btn"
                role="menuitem"
                ?data-active=${this._activePath === item.path}
                aria-current=${this._activePath === item.path ? 'page' : 'false'}
                @click=${() => this._handleNav(item.path)}
              >
                <ha-icon .icon=${item.icon}></ha-icon>
                <span class="nav-label">${item.label}</span>
              </button>
            `
          )}
        </div>
      `;
    }

    getCardSize() {
      return 3;
    }
  }

  if (!customElements.get('lcars-navigation-card')) {
    customElements.define('lcars-navigation-card', LcarsNavigationCard);
  }
});
