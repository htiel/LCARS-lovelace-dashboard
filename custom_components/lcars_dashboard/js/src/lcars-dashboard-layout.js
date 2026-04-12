/**
 * LCARS Dashboard Layout — Main view layout component
 * Implements the classic LCARS frame: elbow + header bar + sidebar + content + footer bar + elbow
 * Sidebar contains area navigation; content shows detail for selected area
 * Registered as custom:lcars-dashboard-layout (Lovelace view type)
 */
import { LitElement, html, css } from 'lit-element';
import { lcarsBaseStyles } from './lcars-styles.js';
import { lcarsEventBus, lcarsLog, openEditPopup } from './lcars-helpers.js';

const TAG = 'Layout';

class LcarsDashboardLayout extends LitElement {
  static get properties() {
    return {
      cards: { type: Array },
      _hass: { type: Object },
      _narrow: { type: Boolean },
      _selectedArea: { type: String },
      _selectedFloor: { type: String },
      _editMode: { type: Boolean },
    };
  }

  constructor() {
    super();
    this.cards = [];
    this._narrow = window.innerWidth < 768;
    this._selectedArea = null;
    this._selectedFloor = null;
    this._editMode = false;
    this._elbowPressTimer = null;
    this._resizeHandler = () => {
      this._narrow = window.innerWidth < 768;
    };
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('resize', this._resizeHandler);
    lcarsLog.debug(TAG, 'connectedCallback — layout mounted');
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('resize', this._resizeHandler);
    lcarsLog.debug(TAG, 'disconnectedCallback — layout unmounted');
  }

  updated(changedProps) {
    super.updated(changedProps);
    if (changedProps.has('_editMode')) {
      if (this._editMode) {
        this.setAttribute('edit-mode', '');
      } else {
        this.removeAttribute('edit-mode');
      }
    }
  }

  setConfig(config) {
    try {
      this._config = config;
      lcarsLog.debug(TAG, 'setConfig', config);
    } catch (err) {
      lcarsLog.error(TAG, 'setConfig FAILED — this causes CONFIGURATION ERROR:', err);
      throw err;
    }
  }

  set hass(hass) {
    const prev = this._hass;
    this._hass = hass;
    if (!prev) {
      lcarsLog.debug(TAG, 'First hass received — cards:', this.cards?.length || 0);
    }
    // Auto-deselect area if it was deleted from HA
    if (prev && prev.areas !== hass.areas && this._selectedArea) {
      if (!hass.areas?.[this._selectedArea]) {
        lcarsLog.debug(TAG, 'Auto-deselecting deleted area:', this._selectedArea);
        this._selectedArea = null;
        lcarsEventBus.dispatchEvent(
          new CustomEvent('lcars-area-selected', { detail: { areaId: null } })
        );
      }
    }
    // Auto-deselect floor if it was deleted from HA
    if (prev && prev.floors !== hass.floors && this._selectedFloor) {
      if (!hass.floors?.[this._selectedFloor]) {
        lcarsLog.debug(TAG, 'Auto-deselecting deleted floor:', this._selectedFloor);
        this._selectedFloor = null;
        lcarsEventBus.dispatchEvent(
          new CustomEvent('lcars-floor-selected', { detail: { floorId: null } })
        );
      }
    }
    if (this.cards) {
      this.cards.forEach((card) => {
        if (card) card.hass = hass;
      });
    }
  }

  _selectArea(areaId) {
    // Deselect floor when an area is picked directly
    if (this._selectedFloor) {
      this._selectedFloor = null;
      lcarsEventBus.dispatchEvent(
        new CustomEvent('lcars-floor-selected', { detail: { floorId: null } })
      );
    }
    this._selectedArea = this._selectedArea === areaId ? null : areaId;
    lcarsLog.debug(TAG, 'Area selected:', this._selectedArea || '(deselected)');
    lcarsEventBus.dispatchEvent(
      new CustomEvent('lcars-area-selected', {
        detail: { areaId: this._selectedArea },
      })
    );
  }

  _selectFloor(floorId) {
    // Deselect area when a floor is picked
    if (this._selectedArea) {
      this._selectedArea = null;
      lcarsEventBus.dispatchEvent(
        new CustomEvent('lcars-area-selected', { detail: { areaId: null } })
      );
    }
    this._selectedFloor = this._selectedFloor === floorId ? null : floorId;
    lcarsLog.debug(TAG, 'Floor selected:', this._selectedFloor || '(deselected)');
    lcarsEventBus.dispatchEvent(
      new CustomEvent('lcars-floor-selected', {
        detail: { floorId: this._selectedFloor },
      })
    );
  }

  /* ─── Edit Mode ─── */
  _toggleEditMode() {
    if (!this._hass?.user?.is_admin) return;
    this._editMode = !this._editMode;
    lcarsLog.info(TAG, 'Edit mode:', this._editMode ? 'ENABLED' : 'DISABLED');
    lcarsEventBus.dispatchEvent(
      new CustomEvent('lcars-edit-mode', { detail: { enabled: this._editMode } })
    );
  }

  _handleElbowPointerDown(e) {
    if (!this._hass?.user?.is_admin) return;
    this._elbowPressTimer = setTimeout(() => {
      this._toggleEditMode();
      this._elbowPressTimer = null;
    }, 800);
  }

  _handleElbowPointerUp() {
    if (this._elbowPressTimer) {
      clearTimeout(this._elbowPressTimer);
      this._elbowPressTimer = null;
    }
  }

  _editHeaderTitle() {
    if (!this._editMode || !this._hass) return;
    openEditPopup(this._hass, 'lcars-edit-homepage-header-card', {}, 'Edit Header');
  }

  _getAreas() {
    if (!this._hass || !this._hass.areas) return [];
    return Object.values(this._hass.areas);
  }

  /* Group areas by floor, sorted by floor level. Returns:
     [{ floor: { floor_id, name, icon, level } | null, areas: [...] }, ...] */
  _getAreasGroupedByFloor() {
    const areas = this._getAreas();
    const floors = this._hass?.floors ? Object.values(this._hass.floors) : [];

    // Build floor lookup
    const floorMap = new Map();
    for (const f of floors) {
      floorMap.set(f.floor_id, { ...f, areas: [] });
    }

    const unassigned = [];
    for (const area of areas) {
      const fid = area.floor_id;
      if (fid && floorMap.has(fid)) {
        floorMap.get(fid).areas.push(area);
      } else {
        unassigned.push(area);
      }
    }

    // Sort floors by level (ascending), then by name
    const sortedFloors = [...floorMap.values()]
      .filter(f => f.areas.length > 0)
      .sort((a, b) => (a.level ?? 99) - (b.level ?? 99) || a.name.localeCompare(b.name));

    const groups = sortedFloors.map(f => ({
      floor: { floor_id: f.floor_id, name: f.name, icon: f.icon, level: f.level },
      areas: f.areas,
    }));

    // Unassigned areas at the bottom
    if (unassigned.length > 0) {
      groups.push({ floor: null, areas: unassigned });
    }

    return groups;
  }

  static get styles() {
    return [
      lcarsBaseStyles,
      css`
        :host {
          display: block;
          min-height: 100vh;
          background: var(--lcars-bg);
          padding: var(--lcars-gap);
        }

        /* ─── LCARS Frame Grid ─── */
        .lcars-frame {
          display: grid;
          grid-template-columns: var(--lcars-sidebar-w) 1fr;
          grid-template-rows: var(--lcars-elbow-h) 1fr var(--lcars-elbow-h);
          gap: var(--lcars-gap) var(--lcars-gap);
          min-height: calc(100vh - 0.5rem);
        }

        /* ─── Top-Left Elbow ─── */
        .lcars-elbow-top {
          grid-column: 1;
          grid-row: 1;
          background: var(--lcars-elbow-top);
          border-radius: var(--lcars-elbow-radius) 0 0 0;
          position: relative;
          overflow: hidden;
        }

        .lcars-elbow-top::after {
          content: '';
          position: absolute;
          bottom: 0;
          right: 0;
          width: calc(var(--lcars-sidebar-w) - var(--lcars-elbow-w) + 2rem);
          height: calc(var(--lcars-elbow-h) - var(--lcars-bar-h));
          background: var(--lcars-bg);
          border-radius: 1.875rem 0 0 0;
        }

        /* ─── Header Bar ─── */
        .lcars-header {
          grid-column: 2;
          grid-row: 1;
          display: flex;
          align-items: flex-start;
          gap: 0;
        }

        .lcars-header-bar {
          flex: 1;
          height: var(--lcars-bar-h);
          background: var(--lcars-header-bar);
        }

        .lcars-header-endcap {
          height: var(--lcars-bar-h);
          min-width: var(--lcars-endcap);
          background: var(--lcars-header-bar);
          border-radius: 0 var(--lcars-endcap) var(--lcars-endcap) 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 0.5rem;
        }

        .lcars-header-title {
          font-size: var(--lcars-font-size-title);
          color: var(--lcars-text-heading);
          white-space: nowrap;
          padding: 0 1rem;
          line-height: var(--lcars-bar-h);
        }

        /* ─── Configure Button (in header endcap) ─── */
        .configure-btn {
          background: none;
          border: none;
          color: var(--lcars-black);
          cursor: pointer;
          padding: 0 0.25rem;
          display: flex;
          align-items: center;
          font-family: var(--lcars-font);
          font-size: 0.65rem;
          text-transform: uppercase;
          user-select: none;
          gap: 0.25rem;
          white-space: nowrap;
          transition: filter var(--lcars-transition);
        }
        .configure-btn:hover { filter: brightness(0.8); }
        .configure-btn:focus-visible {
          outline: 2px solid var(--lcars-ice);
          outline-offset: 2px;
        }
        .configure-btn ha-icon { --mdc-icon-size: 16px; }

        /* ─── Sidebar ─── */
        .lcars-sidebar {
          grid-column: 1;
          grid-row: 2;
          display: flex;
          flex-direction: column;
          gap: var(--lcars-gap);
          padding-top: var(--lcars-gap);
          overflow: hidden;
          min-height: 0;
        }

        .lcars-sidebar-panel {
          background: var(--lcars-sidebar-bg);
          padding: 0.5rem 0.75rem;
          min-height: 2rem;
          font-size: var(--lcars-font-size-data);
          color: var(--lcars-black);
          text-transform: uppercase;
          flex-shrink: 0;
        }

        /* ─── Sidebar Area Buttons ─── */
        .lcars-sidebar-areas {
          display: flex;
          flex-direction: column;
          gap: var(--lcars-gap);
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          min-height: 0;
          mask-image: linear-gradient(to bottom, black calc(100% - 3rem), transparent 100%);
          -webkit-mask-image: linear-gradient(to bottom, black calc(100% - 3rem), transparent 100%);
        }

        .lcars-sidebar-areas::-webkit-scrollbar { width: 4px; }
        .lcars-sidebar-areas::-webkit-scrollbar-track { background: transparent; }
        .lcars-sidebar-areas::-webkit-scrollbar-thumb { background: var(--lcars-gray); border-radius: 2px; }

        .sidebar-area-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--lcars-almond-creme);
          color: var(--lcars-black);
          border: none;
          border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
          height: var(--lcars-btn-height);
          padding: 0 1rem 0 0.75rem;
          font-family: var(--lcars-font);
          font-size: var(--lcars-font-size-data);
          text-transform: uppercase;
          text-align: left;
          cursor: pointer;
          width: calc(100% - 0.25rem);
          transition: filter var(--lcars-transition), background var(--lcars-transition);
          user-select: none;
          white-space: nowrap;
          overflow: hidden;
          flex-shrink: 0;
        }
        .sidebar-area-btn:hover { filter: brightness(1.2); }
        .sidebar-area-btn:focus-visible {
          outline: 2px solid var(--lcars-ice);
          outline-offset: 2px;
        }
        .sidebar-area-btn[data-active] { background: var(--lcars-gold); }
        .sidebar-area-btn ha-icon { --mdc-icon-size: 18px; flex-shrink: 0; }
        .sidebar-area-btn .area-name { overflow: hidden; text-overflow: ellipsis; flex: 1; }

        /* ─── Floor Header Buttons ─── */
        .sidebar-floor-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--lcars-lilac, #cc99cc);
          color: var(--lcars-black);
          border: none;
          border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
          height: calc(var(--lcars-btn-height) * 0.7);
          padding: 0 1rem 0 0.75rem;
          font-family: var(--lcars-font);
          font-size: calc(var(--lcars-font-size-data) * 0.85);
          text-transform: uppercase;
          text-align: left;
          cursor: pointer;
          width: 100%;
          transition: filter var(--lcars-transition), background var(--lcars-transition);
          user-select: none;
          white-space: nowrap;
          overflow: hidden;
          flex-shrink: 0;
          margin-top: 0.25rem;
        }
        .sidebar-floor-btn:first-child { margin-top: 0; }
        .sidebar-floor-btn:hover { filter: brightness(1.2); }
        .sidebar-floor-btn:focus-visible {
          outline: 2px solid var(--lcars-ice);
          outline-offset: 2px;
        }
        .sidebar-floor-btn[data-active] { background: var(--lcars-gold); }
        .sidebar-floor-btn ha-icon { --mdc-icon-size: 16px; flex-shrink: 0; }
        .sidebar-floor-btn .floor-name { overflow: hidden; text-overflow: ellipsis; flex: 1; }

        .sidebar-unassigned-label {
          font-family: var(--lcars-font);
          font-size: calc(var(--lcars-font-size-data) * 0.7);
          color: var(--lcars-gray);
          text-transform: uppercase;
          padding: 0.25rem 0.75rem 0;
          flex-shrink: 0;
        }

        /* ─── Edit Mode Indicator ─── */
        :host([edit-mode]) .lcars-elbow-top { background: var(--lcars-lilac); }
        :host([edit-mode]) .lcars-header-bar { background: var(--lcars-lilac); }
        :host([edit-mode]) .lcars-header-endcap { background: var(--lcars-lilac); }

        /* ─── Sidebar Nav Buttons (bottom) ─── */
        .lcars-sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: var(--lcars-gap);
          flex-shrink: 0;
        }

        /* ─── Main Content Area ─── */
        .lcars-content {
          grid-column: 2;
          grid-row: 2;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        /* ─── Bottom-Left Elbow ─── */
        .lcars-elbow-bottom {
          grid-column: 1;
          grid-row: 3;
          background: var(--lcars-elbow-bottom);
          border-radius: 0 0 0 var(--lcars-elbow-radius);
          position: relative;
          overflow: hidden;
        }

        .lcars-elbow-bottom::after {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: calc(var(--lcars-sidebar-w) - var(--lcars-elbow-w) + 2rem);
          height: calc(var(--lcars-elbow-h) - var(--lcars-bar-h));
          background: var(--lcars-bg);
          border-radius: 0 0 0 1.875rem;
        }

        /* ─── Footer Bar ─── */
        .lcars-footer {
          grid-column: 2;
          grid-row: 3;
          display: flex;
          align-items: flex-end;
          gap: 0;
        }

        .lcars-footer-bar {
          flex: 1;
          height: var(--lcars-bar-h);
          background: var(--lcars-footer-bar);
        }

        .lcars-footer-endcap {
          min-width: var(--lcars-endcap);
          height: var(--lcars-bar-h);
          background: var(--lcars-footer-bar);
          border-radius: 0 var(--lcars-endcap) var(--lcars-endcap) 0;
        }

        .lcars-footer-text {
          font-size: var(--lcars-font-size-data);
          color: var(--lcars-sky);
          padding: 0 0.5rem;
          white-space: nowrap;
          line-height: var(--lcars-bar-h);
        }

        /* ─── Mobile: Collapse sidebar to top nav ─── */
        @media (max-width: 767px) {
          .lcars-frame {
            grid-template-columns: 1fr;
            grid-template-rows: auto auto 1fr auto;
          }

          .lcars-elbow-top,
          .lcars-elbow-bottom {
            display: none;
          }

          .lcars-header {
            grid-column: 1;
            grid-row: 1;
          }

          .lcars-sidebar {
            grid-column: 1;
            grid-row: 2;
            flex-direction: row;
            overflow-x: auto;
            overflow-y: hidden;
            padding: var(--lcars-gap) 0;
          }

          .lcars-sidebar-panel { display: none; }

          .lcars-sidebar-areas {
            flex-direction: row;
            overflow-x: auto;
            overflow-y: hidden;
            mask-image: none;
            -webkit-mask-image: none;
          }

          .sidebar-area-btn {
            flex-shrink: 0;
            width: auto;
            min-width: 8rem;
          }

          .sidebar-floor-btn {
            flex-shrink: 0;
            width: auto;
            min-width: 6rem;
            margin-top: 0;
          }

          .sidebar-unassigned-label {
            display: none;
          }

          .lcars-sidebar-nav {
            flex-direction: row;
          }

          .lcars-content {
            grid-column: 1;
            grid-row: 3;
          }

          .lcars-footer {
            grid-column: 1;
            grid-row: 4;
          }
        }
      `,
    ];
  }

  render() {
    const floorGroups = this._getAreasGroupedByFloor();

    return html`
      <div class="lcars-frame" role="main">
        <!-- Top-Left Elbow (long-press to toggle edit mode) -->
        <div class="lcars-elbow-top" aria-hidden="true"
          @pointerdown=${(e) => this._handleElbowPointerDown(e)}
          @pointerup=${() => this._handleElbowPointerUp()}
          @pointerleave=${() => this._handleElbowPointerUp()}></div>

        <!-- Header Bar -->
        <div class="lcars-header" role="banner">
          <span class="lcars-header-title"
            @click=${() => this._editHeaderTitle()}
            style="${this._editMode ? 'cursor:pointer' : ''}"
            >${this._editMode ? 'LCARS \u00B7 CONFIGURATION MODE' : 'LCARS'}</span>
          <div class="lcars-header-bar"></div>
          <div class="lcars-header-endcap">
            ${this._hass?.user?.is_admin ? html`
              <button class="configure-btn"
                aria-pressed=${this._editMode}
                aria-label="${this._editMode ? 'Exit configuration mode' : 'Enter configuration mode'}"
                @click=${() => this._toggleEditMode()}>
                <ha-icon .icon=${'mdi:cog-outline'}></ha-icon>
              </button>
            ` : ''}
          </div>
        </div>

        <!-- Sidebar -->
        <nav class="lcars-sidebar" role="navigation" aria-label="Dashboard navigation">
          <div class="lcars-sidebar-panel">Areas</div>

          <!-- Area buttons grouped by floor (scrollable) -->
          <div class="lcars-sidebar-areas" role="group" aria-label="Floor and area selection">
            ${floorGroups.map(({ floor, areas }) => html`
              ${floor ? html`
                <button class="sidebar-floor-btn"
                  ?data-active=${this._selectedFloor === floor.floor_id}
                  aria-pressed=${this._selectedFloor === floor.floor_id}
                  @click=${() => this._selectFloor(floor.floor_id)}>
                  <ha-icon .icon=${floor.icon || 'mdi:home-floor-1'}></ha-icon>
                  <span class="floor-name">${floor.name}</span>
                </button>
              ` : html`
                <span class="sidebar-unassigned-label">Unassigned</span>
              `}
              ${areas.map((area) => html`
                <button class="sidebar-area-btn"
                  ?data-active=${this._selectedArea === area.area_id}
                  aria-pressed=${this._selectedArea === area.area_id}
                  @click=${() => this._selectArea(area.area_id)}>
                  <ha-icon .icon=${area.icon || 'mdi:home-outline'}></ha-icon>
                  <span class="area-name">${area.name}</span>
                </button>
              `)}
            `)}
          </div>

          <!-- Fixed nav buttons at bottom -->
          <div class="lcars-sidebar-nav">
            <slot name="sidebar"></slot>
          </div>
        </nav>

        <!-- Main Content -->
        <div class="lcars-content" role="region" aria-label="Dashboard content" aria-live="polite">
          ${this.cards && this.cards.length > 0
            ? this.cards.map((card) => html`${card}`)
            : html`<div class="lcars-heading">No data available</div>`}
        </div>

        <!-- Bottom-Left Elbow -->
        <div class="lcars-elbow-bottom" aria-hidden="true"></div>

        <!-- Footer Bar -->
        <div class="lcars-footer" role="contentinfo">
          <div class="lcars-footer-bar"></div>
          <span class="lcars-footer-text">LCARS 47</span>
          <div class="lcars-footer-endcap"></div>
        </div>
      </div>
    `;
  }
}

// Register with timeout fallback (hui-masonry-view may be renamed in future HA)
const ready = Promise.race([
  customElements.whenDefined('hui-masonry-view'),
  new Promise((r) => setTimeout(r, 5000)),
]);
lcarsLog.debug(TAG, 'Waiting for hui-masonry-view (5s timeout)...');
ready.then(() => {
  if (!customElements.get('lcars-dashboard-layout')) {
    customElements.define('lcars-dashboard-layout', LcarsDashboardLayout);
    const pkg = require('../package.json');
    lcarsLog.info(TAG, `v${pkg.version} registered`);
    console.info(
      `%c LCARS-DASHBOARD \n%c Version ${pkg.version}`,
      'color: #ff9966; font-weight: bold; background: black',
      'color: #f5f6fa; font-weight: bold; background: #333'
    );
  } else {
    lcarsLog.warn(TAG, 'lcars-dashboard-layout already registered — skipping');
  }
}).catch((err) => {
  lcarsLog.error(TAG, 'Failed to register lcars-dashboard-layout:', err);
});
