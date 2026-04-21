/**
 * LCARS Edit Panel Order Card (4X-8)
 *
 * Editor popup for reordering panels within an area.
 * Move up / move down / move left / move right / reset to default.
 * Persists via lcars_dashboard/panel_order/set and panel_column/set WS commands.
 */
import { LitElement, html, css } from 'lit-element';
import { lcarsBaseStyles } from './lcars-styles.js';
import { fireEvent } from './lcars-helpers.js';
import { PANEL_COLUMN } from './lcars-entity-utils.js';

const EDIT_STYLES = css`
  :host { display: block; }
  .edit-container { display: flex; flex-direction: column; gap: var(--lcars-gap); padding: 0.5rem 0; }
  .panel-list { display: flex; flex-direction: column; gap: 2px; }
  .panel-item {
    display: flex; align-items: center; gap: 0.5rem;
    padding: 0.5rem 0.75rem; min-height: 2.5rem;
    background: var(--lcars-disabled); color: var(--lcars-space-white);
    border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
    font-family: var(--lcars-font); font-size: var(--lcars-font-size-data);
    text-transform: uppercase; transition: background var(--lcars-transition);
  }
  .panel-item.current { background: var(--lcars-butterscotch); color: var(--lcars-black); }
  .panel-item-label { flex: 1; }
  .panel-item-index { opacity: 0.5; font-size: 0.625rem; min-width: 1.5rem; }
  .panel-item-column {
    font-size: 0.5rem; opacity: 0.6; padding: 0.125rem 0.375rem;
    border: 1px solid currentColor; border-radius: 0.25rem;
  }
  .panel-item.current .panel-item-column { opacity: 0.8; }
  .edit-actions { display: flex; gap: var(--lcars-gap); padding-top: 0.5rem; flex-wrap: wrap; }
  .action-btn {
    flex: 1; min-width: 4rem; height: var(--lcars-btn-height, 3rem);
    background: var(--lcars-butterscotch); color: var(--lcars-black); border: none;
    border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
    font-family: var(--lcars-font); font-size: var(--lcars-font-size-data);
    text-transform: uppercase; cursor: pointer;
    transition: filter var(--lcars-transition); user-select: none;
  }
  .action-btn:hover { filter: brightness(1.2); }
  .action-btn:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }
  .action-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .action-btn.reset { background: var(--lcars-gray); color: var(--lcars-space-white); }
  .action-btn.column { background: var(--lcars-ice); color: var(--lcars-black); }
  .edit-label { font-family: var(--lcars-font); font-size: 0.625rem; color: var(--lcars-gray); text-transform: uppercase; }
`;

class LcarsEditPanelOrderCard extends LitElement {
  static get properties() {
    return {
      _hass: { type: Object },
      _config: { type: Object },
      _order: { type: Array },
      _columnOverrides: { type: Object },
    };
  }

  set hass(hass) { this._hass = hass; }

  setConfig(config) {
    this._config = config;
    this._order = [...(config?.panel_types || [])];
    // Initialize column overrides from config (passed from homepage card)
    this._columnOverrides = { ...(config?.column_overrides || {}) };
  }

  _getColumn(panelType) {
    return this._columnOverrides[panelType] || PANEL_COLUMN[panelType] || 'left';
  }

  _moveUp() {
    const idx = this._order.indexOf(this._config?.panel_type);
    if (idx <= 0) return;
    const newOrder = [...this._order];
    [newOrder[idx - 1], newOrder[idx]] = [newOrder[idx], newOrder[idx - 1]];
    this._order = newOrder;
  }

  _moveDown() {
    const idx = this._order.indexOf(this._config?.panel_type);
    if (idx < 0 || idx >= this._order.length - 1) return;
    const newOrder = [...this._order];
    [newOrder[idx], newOrder[idx + 1]] = [newOrder[idx + 1], newOrder[idx]];
    this._order = newOrder;
  }

  _moveLeft() {
    const pt = this._config?.panel_type;
    if (!pt || this._getColumn(pt) === 'left') return;
    this._columnOverrides = { ...this._columnOverrides, [pt]: 'left' };
  }

  _moveRight() {
    const pt = this._config?.panel_type;
    if (!pt || this._getColumn(pt) === 'right') return;
    this._columnOverrides = { ...this._columnOverrides, [pt]: 'right' };
  }

  async _save() {
    if (!this._hass || !this._config?.area_id) return;
    try {
      // Save order
      await this._hass.callWS({
        type: 'lcars_dashboard/panel_order/set',
        area_id: this._config.area_id,
        panel_order: JSON.stringify(this._order),
      });
      // Save column overrides (only non-default entries)
      const colOverrides = {};
      for (const [pt, col] of Object.entries(this._columnOverrides)) {
        if (col !== (PANEL_COLUMN[pt] || 'left')) {
          colOverrides[pt] = col;
        }
      }
      await this._hass.callWS({
        type: 'lcars_dashboard/panel_column/set',
        area_id: this._config.area_id,
        panel_columns: JSON.stringify(colOverrides),
      });
      fireEvent('lcars_dashboard_reload');
    } catch (e) {
      console.error('LCARS Edit: Panel order save failed', e);
    }
  }

  async _reset() {
    if (!this._hass || !this._config?.area_id) return;
    try {
      await this._hass.callWS({
        type: 'lcars_dashboard/panel_order/set',
        area_id: this._config.area_id,
        panel_order: JSON.stringify([]),
      });
      await this._hass.callWS({
        type: 'lcars_dashboard/panel_column/set',
        area_id: this._config.area_id,
        panel_columns: JSON.stringify({}),
      });
      this._order = [...(this._config?.panel_types || [])];
      this._columnOverrides = {};
      fireEvent('lcars_dashboard_reload');
    } catch (e) {
      console.error('LCARS Edit: Panel order reset failed', e);
    }
  }

  static get styles() { return [lcarsBaseStyles, EDIT_STYLES]; }

  render() {
    const current = this._config?.panel_type || '';
    const idx = this._order.indexOf(current);
    const currentCol = this._getColumn(current);
    return html`
      <div class="edit-container">
        <span class="edit-label">PANEL ORDER — ${this._config?.area_id || ''}</span>
        <div class="panel-list" role="list">
          ${this._order.map((pt, i) => html`
            <div class="panel-item ${pt === current ? 'current' : ''}" role="listitem">
              <span class="panel-item-index">${i + 1}</span>
              <span class="panel-item-label">${pt.replace(/_/g, ' ')}</span>
              <span class="panel-item-column">${this._getColumn(pt) === 'left' ? 'L' : 'R'}</span>
            </div>
          `)}
        </div>
        <div class="edit-actions">
          <button class="action-btn" ?disabled=${idx <= 0} @click=${this._moveUp}>&#9650; Up</button>
          <button class="action-btn" ?disabled=${idx < 0 || idx >= this._order.length - 1} @click=${this._moveDown}>&#9660; Down</button>
          <button class="action-btn column" ?disabled=${currentCol === 'left'} @click=${this._moveLeft}>&#9664; Left</button>
          <button class="action-btn column" ?disabled=${currentCol === 'right'} @click=${this._moveRight}>&#9654; Right</button>
        </div>
        <div class="edit-actions">
          <button class="action-btn" @click=${this._save}>Save</button>
          <button class="action-btn reset" @click=${this._reset}>Reset</button>
        </div>
      </div>
    `;
  }

  getCardSize() { return 4; }
}

if (!customElements.get('lcars-edit-panel-order-card')) {
  customElements.define('lcars-edit-panel-order-card', LcarsEditPanelOrderCard);
}
