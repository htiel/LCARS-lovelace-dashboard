/**
 * LCARS Edit Panel Order Card (4X-8)
 *
 * Editor popup for reordering panels within an area.
 * Move up / move down / reset to default.
 * Persists via lcars_dashboard/panel_order/set WS command.
 */
import { LitElement, html, css } from 'lit-element';
import { lcarsBaseStyles } from './lcars-styles.js';
import { fireEvent } from './lcars-helpers.js';

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
  .edit-actions { display: flex; gap: var(--lcars-gap); padding-top: 0.5rem; flex-wrap: wrap; }
  .action-btn {
    flex: 1; min-width: 5rem; height: var(--lcars-btn-height, 3rem);
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
  .edit-label { font-family: var(--lcars-font); font-size: 0.625rem; color: var(--lcars-gray); text-transform: uppercase; }
`;

class LcarsEditPanelOrderCard extends LitElement {
  static get properties() {
    return {
      _hass: { type: Object },
      _config: { type: Object },
      _order: { type: Array },
    };
  }

  set hass(hass) { this._hass = hass; }

  setConfig(config) {
    this._config = config;
    // Initialize order from config.panel_types
    this._order = [...(config?.panel_types || [])];
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

  async _save() {
    if (!this._hass || !this._config?.area_id) return;
    try {
      await this._hass.callWS({
        type: 'lcars_dashboard/panel_order/set',
        area_id: this._config.area_id,
        panel_order: JSON.stringify(this._order),
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
      this._order = [...(this._config?.panel_types || [])];
      fireEvent('lcars_dashboard_reload');
    } catch (e) {
      console.error('LCARS Edit: Panel order reset failed', e);
    }
  }

  static get styles() { return [lcarsBaseStyles, EDIT_STYLES]; }

  render() {
    const current = this._config?.panel_type || '';
    const idx = this._order.indexOf(current);
    return html`
      <div class="edit-container">
        <span class="edit-label">PANEL ORDER — ${this._config?.area_id || ''}</span>
        <div class="panel-list" role="list">
          ${this._order.map((pt, i) => html`
            <div class="panel-item ${pt === current ? 'current' : ''}" role="listitem">
              <span class="panel-item-index">${i + 1}</span>
              <span class="panel-item-label">${pt.replace(/_/g, ' ')}</span>
            </div>
          `)}
        </div>
        <div class="edit-actions">
          <button class="action-btn" ?disabled=${idx <= 0} @click=${this._moveUp}>Move Up</button>
          <button class="action-btn" ?disabled=${idx < 0 || idx >= this._order.length - 1} @click=${this._moveDown}>Move Down</button>
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
