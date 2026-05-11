/**
 * LCARS Dashboard Layout — Main view layout component
 * Implements the classic LCARS frame: elbow + header bar + sidebar + content + footer bar + elbow
 * Sidebar contains area navigation; content shows detail for selected area
 * Registered as custom:lcars-dashboard-layout (Lovelace view type)
 */
import { LitElement, html, css } from 'lit-element';
import { lcarsBaseStyles } from './lcars-styles.js';
import { lcarsEventBus, lcarsLog, openEditPopup } from './lcars-helpers.js';
import { lcarsAudio } from './lcars-audio.js';
import { ensureLcarsSidebarTop } from './lcars-sidebar-reorder.js';
import lcarsPkg from '../package.json';

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
      _audioMuted: { type: Boolean },
    };
  }

  constructor() {
    super();
    this.cards = [];
    this._narrow = window.innerWidth < 768;
    this._selectedArea = null;
    this._selectedFloor = null;
    this._editMode = false;
    this._audioMuted = lcarsAudio.isMuted;
    this._elbowPressTimer = null;
    this._siteName = window.location.hostname.toUpperCase().replace(/\.LOCAL$/, '');
    this._readyPlayed = false;
    this._resizeHandler = () => {
      this._narrow = window.innerWidth < 768;
    };
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('resize', this._resizeHandler);
    lcarsLog.debug(TAG, 'connectedCallback — layout mounted');
    // Deep-link: check hash for #area:<area_id>
    this._applyHashDeepLink();
    this._hashHandler = () => this._applyHashDeepLink();
    window.addEventListener('hashchange', this._hashHandler);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('resize', this._resizeHandler);
    window.removeEventListener('hashchange', this._hashHandler);
    if (this._elbowPressTimer) {
      clearTimeout(this._elbowPressTimer);
      this._elbowPressTimer = null;
    }
    if (this._deepLinkTimer) {
      clearTimeout(this._deepLinkTimer);
      this._deepLinkTimer = null;
    }
    lcarsLog.debug(TAG, 'disconnectedCallback — layout unmounted');
  }

  _applyHashDeepLink() {
    const hash = location.hash;
    const match = hash.match(/^#area:([a-z0-9_]+)$/i);
    if (match) {
      const areaId = decodeURIComponent(match[1]);
      lcarsLog.debug(TAG, 'Deep-link: auto-selecting area', areaId);
      // #206 — track the deferred timer so disconnectedCallback can clear it
      // (rapid dashboard switch on first load would otherwise dispatch
      // lcars-area-selected against a detached element 100ms after teardown).
      if (this._deepLinkTimer) clearTimeout(this._deepLinkTimer);
      this._deepLinkTimer = setTimeout(() => {
        this._deepLinkTimer = null;
        if (this._selectedArea !== areaId) {
          this._selectedArea = areaId;
          lcarsEventBus.dispatchEvent(
            new CustomEvent('lcars-area-selected', { detail: { areaId } })
          );
          this.requestUpdate();
        }
      }, 100);
    }
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
      ensureLcarsSidebarTop(hass);
    }
    // Update site name from HA config if available (GEO-015/DATA-006)
    if (hass?.config?.location_name) {
      this._siteName = hass.config.location_name.toUpperCase();
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

  _toggleMute() {
    lcarsAudio.toggle();
    this._audioMuted = lcarsAudio.isMuted;
  }

  _selectArea(areaId) {
    if (!this._readyPlayed) {
      this._readyPlayed = true;
      lcarsAudio.play('ready');
    } else {
      lcarsAudio.play('navAcknowledge');
    }
    // Deselect floor when an area is picked directly
    if (this._selectedFloor) {
      this._selectedFloor = null;
      lcarsEventBus.dispatchEvent(
        new CustomEvent('lcars-floor-selected', { detail: { floorId: null } })
      );
    }
    this._selectedArea = this._selectedArea === areaId ? null : areaId;
    lcarsLog.debug(TAG, 'Area selected:', this._selectedArea || '(deselected)');
    // Update hash for deep-link persistence
    if (this._selectedArea) {
      history.replaceState(null, '', `${location.pathname}#area:${this._selectedArea}`);
    } else {
      history.replaceState(null, '', location.pathname);
    }
    lcarsEventBus.dispatchEvent(
      new CustomEvent('lcars-area-selected', {
        detail: { areaId: this._selectedArea },
      })
    );
  }

  _selectFloor(floorId) {
    lcarsAudio.play('navAcknowledge');
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
    lcarsAudio.play('toggle');
    this._editMode = !this._editMode;
    lcarsLog.info(TAG, 'Edit mode:', this._editMode ? 'ENABLED' : 'DISABLED');
    lcarsEventBus.dispatchEvent(
      new CustomEvent('lcars-edit-mode', { detail: { enabled: this._editMode } })
    );
  }

  _openSidebarReorder() {
    if (!this._hass?.user?.is_admin) return;
    let dialog = this.shadowRoot.querySelector('lcars-sidebar-reorder');
    if (!dialog) {
      dialog = document.createElement('lcars-sidebar-reorder');
      this.shadowRoot.appendChild(dialog);
    }
    dialog.hass = this._hass;
    dialog.open();
  }

  _handleElbowPointerDown(e) {
    if (!this._hass?.user?.is_admin) return;
    e.preventDefault();
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
    lcarsAudio.play('acknowledge');
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
          height: calc(100vh - var(--header-height, 0px));
          overflow: hidden;
          box-sizing: border-box;
          background: var(--lcars-bg);
          padding: var(--lcars-gap);
        }

        /* ─── Skip Navigation Link (GEO-006) ─── */
        .skip-nav {
          position: absolute;
          left: -9999px;
          top: auto;
          width: 1px;
          height: 1px;
          overflow: hidden;
          z-index: 1000;
          background: var(--lcars-gold);
          color: var(--lcars-black);
          padding: 0.5rem 1rem;
          font-family: var(--lcars-font);
          font-size: var(--lcars-font-size-data);
          text-decoration: none;
          border-radius: 0 0 var(--lcars-btn-radius) var(--lcars-btn-radius);
        }
        .skip-nav:focus {
          position: fixed;
          left: 50%;
          top: 0;
          transform: translateX(-50%);
          width: auto;
          height: auto;
          z-index: 1000;
        }

        /* ─── LCARS Frame Grid ─── */
        .lcars-frame {
          display: grid;
          grid-template-columns: var(--lcars-sidebar-w) 1fr;
          grid-template-rows: var(--lcars-elbow-h) 1fr var(--lcars-elbow-h);
          gap: var(--lcars-gap) var(--lcars-gap);
          height: 100%;
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
          width: calc(var(--lcars-sidebar-w) - var(--lcars-elbow-w));
          height: calc(var(--lcars-elbow-h) - var(--lcars-bar-h));
          background: var(--lcars-bg);
          border-radius: 1.5rem 0 0 0;
        }

        /* ─── Header Bar ─── */
        .lcars-header {
          grid-column: 2;
          grid-row: 1;
          display: flex;
          align-items: flex-start;
          gap: var(--lcars-gap);
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
          border-radius: 0;
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
          letter-spacing: 0.05em;
        }

        /* ─── Header Action Buttons (shared) ─── */
        .configure-btn,
        .mute-btn {
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
        .configure-btn:hover,
        .mute-btn:hover { filter: brightness(0.8); }
        .configure-btn:focus-visible,
        .mute-btn:focus-visible {
          outline: 2px solid var(--lcars-ice);
          outline-offset: 2px;
        }
        .configure-btn ha-icon,
        .mute-btn ha-icon { --mdc-icon-size: 18px; }

        /* ─── Sidebar ─── */
        .lcars-sidebar {
          grid-column: 1;
          grid-row: 2;
          display: flex;
          flex-direction: column;
          gap: var(--lcars-gap);
          overflow: hidden;
          min-height: 0;
        }

        .lcars-sidebar-panel {
          background: var(--lcars-sidebar-bg);
          padding: 0.25rem 0.5rem;
          font-size: var(--lcars-font-size-data);
          color: var(--lcars-black);
          text-transform: uppercase;
          text-align: right;
          flex-shrink: 0;
          border-radius: 0 0 0 var(--lcars-btn-radius);
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
        }

        .lcars-sidebar-areas::-webkit-scrollbar { width: 4px; }
        .lcars-sidebar-areas::-webkit-scrollbar-track { background: transparent; }
        .lcars-sidebar-areas::-webkit-scrollbar-thumb { background: var(--lcars-gray); border-radius: 2px; }

        /* Structural filler — fills dead space below nav buttons with LCARS gray panel.
           Grows to fill remaining sidebar height when buttons are few;
           collapses to 0px when buttons overflow (scroll case). */
        .lcars-sidebar-areas::after {
          content: '';
          display: block;
          flex: 1 0 0px;
          min-height: 0;
          background: var(--lcars-gray);
          border-radius: var(--lcars-btn-radius) 0 0 0;
          width: calc(100% - 0.25rem);
        }

        .sidebar-area-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--lcars-african-violet);
          color: var(--lcars-black);
          border: none;
          border-radius: var(--lcars-btn-radius) 0 0 var(--lcars-btn-radius);
          height: var(--lcars-btn-height);
          padding: 0 0.75rem 0 1rem;
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
          background: var(--lcars-lilac, #cc55ff);
          color: var(--lcars-black);
          border: none;
          border-radius: var(--lcars-btn-radius) 0 0 var(--lcars-btn-radius);
          height: calc(var(--lcars-btn-height) * 0.7);
          padding: 0 0.75rem 0 1rem;
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
          color: var(--lcars-sky, #aaaaff);
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
          padding: 0.5rem;
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
          width: calc(var(--lcars-sidebar-w) - var(--lcars-elbow-w));
          height: calc(var(--lcars-elbow-h) - var(--lcars-bar-h));
          background: var(--lcars-bg);
          border-radius: 0 0 0 1.5rem;
        }

        /* ─── Footer Bar ─── */
        .lcars-footer {
          grid-column: 2;
          grid-row: 3;
          display: flex;
          align-items: flex-end;
          gap: var(--lcars-gap);
        }

        .lcars-footer-bar {
          flex: 1;
          height: var(--lcars-bar-h);
          background: var(--lcars-footer-bar);
        }

        .lcars-footer-endcap {
          width: var(--lcars-endcap);
          height: var(--lcars-bar-h);
          background: var(--lcars-footer-bar);
          border-radius: 0;
          flex-shrink: 0;
        }

        .lcars-footer-text {
          font-size: var(--lcars-font-size-data);
          color: var(--lcars-sky);
          padding: 0 0.5rem;
          white-space: nowrap;
          line-height: var(--lcars-bar-h);
        }

        /* ─── Mobile: Hold the LCARS sweep, narrow to one elbow unit (Geordi ruling, beta.36 QA) ─── */
        @media (max-width: 767px) {
          :host {
            /* Narrow the entire frame to one elbow unit (~88px) per LCARS PADD canon.
               Sweep is preserved — never flip to a horizontal nav. */
            --lcars-sidebar-w: 5.5rem;
            --lcars-elbow-w: 5rem;
            --lcars-elbow-h: 3rem;
            --lcars-elbow-radius: 2.25rem;
          }
          .lcars-header-title { font-size: 1.25rem; padding: 0 0.5rem; }
          .lcars-sidebar-panel {
            font-size: 0.625rem;
            padding: 0.125rem 0.25rem;
            text-align: center;
          }
          /* Icon-only sidebar buttons on phone (Captain's call, #94).
             Labels truncate to 2-3 chars at this width — drop them entirely
             and let the area's mdi: icon (already in the button) carry the
             affordance. aria-label + title= keep accessibility intact. */
          .sidebar-area-btn,
          .sidebar-floor-btn {
            justify-content: center;
            padding: 0.5rem 0.25rem;
            gap: 0;
          }
          .sidebar-area-btn .area-name,
          .sidebar-floor-btn .floor-name {
            display: none;
          }
          .sidebar-area-btn ha-icon { --mdc-icon-size: 28px; }
          .sidebar-floor-btn ha-icon { --mdc-icon-size: 24px; }
          .sidebar-unassigned-label { display: none; }
          .lcars-content { padding: 0.25rem; }
          .mute-btn ha-icon { --mdc-icon-size: 14px; }
        }
      `,
    ];
  }

  render() {
    const floorGroups = this._getAreasGroupedByFloor();

    return html`
      <a class="skip-nav" href="#lcars-main-content" @click=${(e) => { e.preventDefault(); this.shadowRoot.getElementById('lcars-main-content')?.focus(); }}>Skip to content</a>
      <div class="lcars-frame">
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
            >${this._editMode ? `${this._siteName} \u00B7 CONFIGURATION MODE` : this._siteName}</span>
          <div class="lcars-header-bar" aria-hidden="true"></div>
          <div class="lcars-header-endcap">
            <button class="mute-btn"
              role="switch"
              aria-checked=${!this._audioMuted}
              aria-label="Dashboard sounds"
              @click=${() => this._toggleMute()}>
              <ha-icon .icon=${this._audioMuted ? 'mdi:volume-off' : 'mdi:volume-high'}></ha-icon>
            </button>
            ${this._hass?.user?.is_admin ? html`
              <button class="configure-btn"
                aria-label="Reorder sidebar dashboards"
                @click=${() => this._openSidebarReorder()}>
                <ha-icon .icon=${'mdi:sort-variant'}></ha-icon>
              </button>
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
                  aria-label="${floor.name}"
                  title="${floor.name}"
                  @click=${() => this._selectFloor(floor.floor_id)}>
                  <ha-icon .icon=${floor.icon || 'mdi:home-floor-1'}></ha-icon>
                  <span class="floor-name">${floor.name}</span>
                </button>
              ` : html`
                <span class="sidebar-unassigned-label">Unassigned</span>
              `}
              ${areas.map((area) => html`
                <button class="sidebar-area-btn"
                  title="${area.name}"
                  ?data-active=${this._selectedArea === area.area_id}
                  aria-pressed=${this._selectedArea === area.area_id}
                  aria-label="${area.name}"
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
        <main class="lcars-content" id="lcars-main-content" aria-label="Dashboard content">
          ${this.cards && this.cards.length > 0
            ? this.cards.map((card) => html`${card}`)
            : html`<div class="lcars-heading">No data available</div>`}
        </main>

        <!-- Bottom-Left Elbow -->
        <div class="lcars-elbow-bottom" aria-hidden="true"></div>

        <!-- Footer Bar -->
        <div class="lcars-footer" role="contentinfo">
          <div class="lcars-footer-bar" aria-hidden="true"></div>
          <span class="lcars-footer-text">LCARS ${lcarsPkg.version}</span>
          <div class="lcars-footer-endcap" aria-hidden="true"></div>
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
    const pkgVersion = lcarsPkg.version;
    lcarsLog.info(TAG, `v${pkgVersion} registered`);
    console.info(
      `%c LCARS-DASHBOARD \n%c Version ${pkgVersion}`,
      'color: #ff9966; font-weight: bold; background: black',
      'color: #f5f6fa; font-weight: bold; background: #333'
    );
  } else {
    lcarsLog.warn(TAG, 'lcars-dashboard-layout already registered — skipping');
  }
}).catch((err) => {
  lcarsLog.error(TAG, 'Failed to register lcars-dashboard-layout:', err);
});
