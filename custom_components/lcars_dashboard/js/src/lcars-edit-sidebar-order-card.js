/**
 * LCARS Edit Sidebar Order Card
 *
 * Allows reordering LCARS dashboards in the HA sidebar and grouping
 * them together. Uses HA's per-user frontend/get_user_data and
 * frontend/set_user_data WS APIs (key: "sidebar").
 */
import { defineLcars } from './lcars-helpers.js';
import { LitElement, html, css } from 'lit-element';
import { lcarsBaseStyles } from './lcars-styles.js';

/** All LCARS dashboard url_paths (must match DASHBOARD_REGISTRY in const.py) */
const LCARS_PANELS = [
  'lcars-habitat',
  'lcars-power',
  'lcars-environmental',
  'lcars-lighting',
  'lcars-security',
  'lcars-cetacean',
];

const EDIT_STYLES = css`
  :host { display: block; }
  .edit-container { display: flex; flex-direction: column; gap: var(--lcars-gap); padding: 0.5rem 0; }
  .edit-label { font-family: var(--lcars-font); font-size: 0.625rem; color: var(--lcars-gray); text-transform: uppercase; }

  .order-list { display: flex; flex-direction: column; gap: 2px; }

  .order-item {
    display: flex; align-items: center; gap: 0.375rem;
    padding: 0.375rem 0.5rem; min-height: 2rem;
    background: var(--lcars-disabled); color: var(--lcars-space-white);
    border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
    font-family: var(--lcars-font); font-size: var(--lcars-font-size-data);
    text-transform: uppercase; cursor: pointer;
    transition: background var(--lcars-transition);
    user-select: none;
  }
  .order-item:hover { background: var(--lcars-gray); }
  .order-item.selected { background: var(--lcars-butterscotch); color: var(--lcars-black); }
  .order-item-index { font-size: 0.5rem; opacity: 0.5; min-width: 1rem; }
  .order-item-icon { width: 1.25rem; text-align: center; }
  .order-item-label { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.75rem; }
  .order-item-path { font-size: 0.5rem; opacity: 0.5; }

  .edit-actions { display: flex; gap: var(--lcars-gap); padding-top: 0.25rem; flex-wrap: wrap; }
  .action-btn {
    flex: 1; min-width: 3.5rem; height: 2.5rem;
    background: var(--lcars-butterscotch); color: var(--lcars-black); border: none;
    border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
    font-family: var(--lcars-font); font-size: var(--lcars-font-size-data);
    text-transform: uppercase; cursor: pointer;
    transition: filter var(--lcars-transition); user-select: none;
  }
  .action-btn:hover { filter: brightness(1.2); }
  .action-btn:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }
  .action-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .action-btn.apply { background: var(--lcars-gold); color: var(--lcars-black); }
  .action-btn.reset { background: var(--lcars-gray); color: var(--lcars-space-white); }

  .status-msg {
    font-family: var(--lcars-font); font-size: 0.625rem;
    color: var(--lcars-butterscotch); text-transform: uppercase;
    text-align: center; padding: 0.25rem 0;
    opacity: 0; transition: opacity 300ms ease;
  }
  .status-msg.visible { opacity: 1; }
`;

class LcarsEditSidebarOrderCard extends LitElement {
  static get properties() {
    return {
      _hass: { type: Object },
      _config: { type: Object },
      _order: { type: Array },       // LCARS panel url_paths in user's preferred order
      _selected: { type: String },    // currently selected url_path
      _panelInfo: { type: Object },   // url_path → {title, icon} from hass.panels
      _statusMsg: { type: String },
      _loading: { type: Boolean },
    };
  }

  constructor() {
    super();
    this._order = [];
    this._selected = '';
    this._panelInfo = {};
    this._statusMsg = '';
    this._loading = true;
  }

  set hass(hass) {
    this._hass = hass;
    if (hass && this._loading) {
      this._loadSidebarData();
    }
  }

  setConfig(config) {
    this._config = config;
  }

  async _loadSidebarData() {
    if (!this._hass) return;
    this._loading = false;

    // Gather LCARS panel info from hass.panels
    const panels = this._hass.panels || {};
    const info = {};
    for (const urlPath of LCARS_PANELS) {
      const panel = panels[urlPath];
      if (panel) {
        info[urlPath] = {
          title: panel.title || urlPath,
          icon: panel.icon || 'mdi:monitor-dashboard',
        };
      }
    }
    this._panelInfo = info;

    // Get current sidebar user data
    try {
      const result = await this._hass.connection.sendMessagePromise({
        type: 'frontend/get_user_data',
        key: 'sidebar',
      });
      const sidebarData = result?.value || {};
      const panelOrder = sidebarData.panelOrder || [];

      // Extract LCARS panels in their current sidebar order
      const lcarsInOrder = panelOrder.filter(p => LCARS_PANELS.includes(p));
      // Add any LCARS panels not yet in the order
      const missing = LCARS_PANELS.filter(p => info[p] && !lcarsInOrder.includes(p));
      this._order = [...lcarsInOrder, ...missing];
    } catch (e) {
      // Fallback: use default order from panels that exist
      this._order = LCARS_PANELS.filter(p => info[p]);
    }

    if (this._order.length > 0) {
      this._selected = this._order[0];
    }
  }

  _select(urlPath) {
    this._selected = urlPath;
  }

  _moveUp() {
    const idx = this._order.indexOf(this._selected);
    if (idx <= 0) return;
    const newOrder = [...this._order];
    [newOrder[idx - 1], newOrder[idx]] = [newOrder[idx], newOrder[idx - 1]];
    this._order = newOrder;
  }

  _moveDown() {
    const idx = this._order.indexOf(this._selected);
    if (idx < 0 || idx >= this._order.length - 1) return;
    const newOrder = [...this._order];
    [newOrder[idx], newOrder[idx + 1]] = [newOrder[idx + 1], newOrder[idx]];
    this._order = newOrder;
  }

  async _apply() {
    if (!this._hass) return;
    try {
      // Read current sidebar data
      const result = await this._hass.connection.sendMessagePromise({
        type: 'frontend/get_user_data',
        key: 'sidebar',
      });
      const sidebarData = result?.value || {};
      const currentOrder = sidebarData.panelOrder || [];
      const hiddenPanels = sidebarData.hiddenPanels || [];

      // Remove LCARS panels from current order
      const nonLcars = currentOrder.filter(p => !LCARS_PANELS.includes(p));

      // Find insertion point: after the default dashboard (lovelace) or at the start
      let insertIdx = 0;
      const lovelaceIdx = nonLcars.indexOf('lovelace');
      if (lovelaceIdx >= 0) {
        insertIdx = lovelaceIdx + 1;
      }

      // Insert LCARS panels grouped together
      const newOrder = [
        ...nonLcars.slice(0, insertIdx),
        ...this._order,
        ...nonLcars.slice(insertIdx),
      ];

      // Save
      await this._hass.connection.sendMessagePromise({
        type: 'frontend/set_user_data',
        key: 'sidebar',
        value: { panelOrder: newOrder, hiddenPanels },
      });

      this._statusMsg = 'Sidebar updated — reload page to see changes';
      this.requestUpdate();
      setTimeout(() => { this._statusMsg = ''; this.requestUpdate(); }, 4000);
    } catch (e) {
      console.error('LCARS: Sidebar order save failed', e);
      this._statusMsg = 'Error saving sidebar order';
      this.requestUpdate();
      setTimeout(() => { this._statusMsg = ''; this.requestUpdate(); }, 4000);
    }
  }

  async _reset() {
    // Reload from HA
    this._loading = true;
    await this._loadSidebarData();
    this._statusMsg = 'Reset to current sidebar order';
    this.requestUpdate();
    setTimeout(() => { this._statusMsg = ''; this.requestUpdate(); }, 3000);
  }

  static get styles() { return [lcarsBaseStyles, EDIT_STYLES]; }

  render() {
    const sel = this._selected;
    const selIdx = this._order.indexOf(sel);
    const canMoveUp = selIdx > 0;
    const canMoveDown = selIdx >= 0 && selIdx < this._order.length - 1;

    return html`
      <div class="edit-container">
        <span class="edit-label">DASHBOARD SIDEBAR ORDER</span>

        <div class="order-list" role="listbox" aria-label="Dashboard order">
          ${this._order.map((urlPath, i) => {
            const info = this._panelInfo[urlPath] || {};
            const isSelected = urlPath === sel;
            return html`
              <div class="order-item ${isSelected ? 'selected' : ''}"
                role="option" aria-selected="${isSelected}"
                @click=${() => this._select(urlPath)}>
                <span class="order-item-index">${i + 1}</span>
                <span class="order-item-icon"><ha-icon .icon=${info.icon || 'mdi:monitor-dashboard'}></ha-icon></span>
                <span class="order-item-label">${info.title || urlPath}</span>
              </div>
            `;
          })}
        </div>

        <div class="edit-actions">
          <button class="action-btn" ?disabled=${!canMoveUp} @click=${this._moveUp}>&#9650; Up</button>
          <button class="action-btn" ?disabled=${!canMoveDown} @click=${this._moveDown}>&#9660; Down</button>
        </div>
        <div class="edit-actions">
          <button class="action-btn apply" @click=${this._apply}>Group &amp; Apply</button>
          <button class="action-btn reset" @click=${this._reset}>Reset</button>
        </div>

        <div class="status-msg ${this._statusMsg ? 'visible' : ''}">${this._statusMsg}</div>
      </div>
    `;
  }

  getCardSize() { return 4; }
}

if (!customElements.get('lcars-edit-sidebar-order-card')) {
  defineLcars('lcars-edit-sidebar-order-card', LcarsEditSidebarOrderCard);
}
