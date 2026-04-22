/**
 * LCARS Edit Panel Order Card (4X-8)
 *
 * Visual layout editor for reordering panels and switching columns.
 * Shows a mini 2-column layout preview. Illumination is locked full-width.
 * Each panel (including multiple cameras) is independently selectable and movable.
 * Persists via lcars_dashboard/panel_order/set and panel_column/set WS commands.
 */
import { LitElement, html, css } from 'lit-element';
import { lcarsBaseStyles } from './lcars-styles.js';
import { fireEvent } from './lcars-helpers.js';
import { PANEL_COLUMN, PANEL_TYPE_ILLUMINATION } from './lcars-entity-utils.js';

const EDIT_STYLES = css`
  :host { display: block; }
  .edit-container { display: flex; flex-direction: column; gap: var(--lcars-gap); padding: 0.5rem 0; }
  .edit-label { font-family: var(--lcars-font); font-size: 0.625rem; color: var(--lcars-gray); text-transform: uppercase; }

  /* Visual layout preview */
  .layout-preview {
    display: flex; flex-direction: column; gap: 2px;
    background: rgba(255,255,255,0.03);
    border: 1px solid var(--lcars-gray);
    border-radius: 0.25rem;
    padding: 0.375rem;
    min-height: 6rem;
  }
  .layout-fullwidth { display: flex; flex-direction: column; gap: 2px; }
  .layout-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 0.375rem; }
  .layout-col { display: flex; flex-direction: column; gap: 2px; }
  .layout-col-label {
    font-family: var(--lcars-font); font-size: 0.5rem;
    color: var(--lcars-gray); text-transform: uppercase;
    text-align: center; padding-bottom: 0.125rem;
    border-bottom: 1px solid var(--lcars-gray); opacity: 0.5;
    margin-bottom: 0.125rem;
  }

  /* Panel items in layout */
  .panel-item {
    display: flex; align-items: center; gap: 0.375rem;
    padding: 0.375rem 0.5rem; min-height: 2rem;
    background: var(--lcars-disabled); color: var(--lcars-space-white);
    border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
    font-family: var(--lcars-font); font-size: var(--lcars-font-size-data);
    text-transform: uppercase; cursor: pointer;
    transition: background var(--lcars-transition);
    user-select: none;
  }
  .panel-item:hover { background: var(--lcars-gray); }
  .panel-item.selected { background: var(--lcars-butterscotch); color: var(--lcars-black); }
  .panel-item.locked { opacity: 0.6; cursor: default; }
  .panel-item.locked.selected { background: var(--lcars-gold); color: var(--lcars-black); opacity: 1; }
  .panel-item-label { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.75rem; }
  .panel-item-type { font-size: 0.5rem; opacity: 0.5; }
  .panel-item-index { font-size: 0.5rem; opacity: 0.5; min-width: 1rem; }
  .panel-item-lock { font-size: 0.5rem; opacity: 0.5; }

  /* Action buttons */
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
  .action-btn.reset { background: var(--lcars-gray); color: var(--lcars-space-white); }
  .action-btn.column { background: var(--lcars-ice); color: var(--lcars-black); }
`;

class LcarsEditPanelOrderCard extends LitElement {
  static get properties() {
    return {
      _hass: { type: Object },
      _config: { type: Object },
      _order: { type: Array },       // array of panelId strings
      _columnOverrides: { type: Object }, // panelId → 'left'|'right'
      _selected: { type: String },    // currently selected panelId
    };
  }

  set hass(hass) { this._hass = hass; }

  setConfig(config) {
    this._config = config;
    // panels: [{panelId, panelType, label, deviceId}]
    const panels = config?.panels || [];
    this._order = panels.map(p => p.panelId);
    this._columnOverrides = { ...(config?.column_overrides || {}) };
    this._selected = config?.panel_id || (panels[0]?.panelId) || '';
  }

  _getPanelInfo(panelId) {
    return (this._config?.panels || []).find(p => p.panelId === panelId);
  }

  _isIllumination(panelId) {
    const info = this._getPanelInfo(panelId);
    return info?.panelType === PANEL_TYPE_ILLUMINATION;
  }

  _getColumn(panelId) {
    if (this._isIllumination(panelId)) return 'full';
    const info = this._getPanelInfo(panelId);
    return this._columnOverrides[panelId] || this._columnOverrides[info?.panelType] || PANEL_COLUMN[info?.panelType] || 'left';
  }

  _getLabel(panelId) {
    const info = this._getPanelInfo(panelId);
    if (!info) return panelId;
    return info.label || info.panelType.replace(/_/g, ' ');
  }

  _select(panelId) {
    this._selected = panelId;
  }

  _moveUp() {
    const col = this._getColumn(this._selected);
    // Get panels in the same column, in current order
    const colPanels = this._order.filter(pid => this._getColumn(pid) === col);
    const colIdx = colPanels.indexOf(this._selected);
    if (colIdx <= 0) return;
    // Swap in the global order
    const globalIdxCurrent = this._order.indexOf(this._selected);
    const globalIdxAbove = this._order.indexOf(colPanels[colIdx - 1]);
    const newOrder = [...this._order];
    [newOrder[globalIdxAbove], newOrder[globalIdxCurrent]] = [newOrder[globalIdxCurrent], newOrder[globalIdxAbove]];
    this._order = newOrder;
  }

  _moveDown() {
    const col = this._getColumn(this._selected);
    const colPanels = this._order.filter(pid => this._getColumn(pid) === col);
    const colIdx = colPanels.indexOf(this._selected);
    if (colIdx < 0 || colIdx >= colPanels.length - 1) return;
    const globalIdxCurrent = this._order.indexOf(this._selected);
    const globalIdxBelow = this._order.indexOf(colPanels[colIdx + 1]);
    const newOrder = [...this._order];
    [newOrder[globalIdxCurrent], newOrder[globalIdxBelow]] = [newOrder[globalIdxBelow], newOrder[globalIdxCurrent]];
    this._order = newOrder;
  }

  _moveLeft() {
    if (this._isIllumination(this._selected)) return;
    if (this._getColumn(this._selected) === 'left') return;
    this._columnOverrides = { ...this._columnOverrides, [this._selected]: 'left' };
  }

  _moveRight() {
    if (this._isIllumination(this._selected)) return;
    if (this._getColumn(this._selected) === 'right') return;
    this._columnOverrides = { ...this._columnOverrides, [this._selected]: 'right' };
  }

  async _save() {
    if (!this._hass || !this._config?.area_id) return;
    try {
      await this._hass.callWS({
        type: 'lcars_dashboard/panel_order/set',
        area_id: this._config.area_id,
        panel_order: JSON.stringify(this._order),
      });
      const colOverrides = {};
      for (const [pid, col] of Object.entries(this._columnOverrides)) {
        const info = this._getPanelInfo(pid);
        const defaultCol = PANEL_COLUMN[info?.panelType] || 'left';
        if (col !== defaultCol) {
          colOverrides[pid] = col;
        }
      }
      await this._hass.callWS({
        type: 'lcars_dashboard/panel_column/set',
        area_id: this._config.area_id,
        panel_columns: JSON.stringify(colOverrides),
      });
      fireEvent('lcars_dashboard_reload');
    } catch (e) {
      console.error('LCARS Edit: Panel layout save failed', e);
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
      const panels = this._config?.panels || [];
      this._order = panels.map(p => p.panelId);
      this._columnOverrides = {};
      fireEvent('lcars_dashboard_reload');
    } catch (e) {
      console.error('LCARS Edit: Panel layout reset failed', e);
    }
  }

  static get styles() { return [lcarsBaseStyles, EDIT_STYLES]; }

  _renderPanelItem(panelId, index) {
    const isSelected = panelId === this._selected;
    const isLocked = this._isIllumination(panelId);
    const info = this._getPanelInfo(panelId);
    const typeLabel = info?.panelType?.replace(/_/g, ' ') || '';
    const displayLabel = this._getLabel(panelId);
    // Show type tag only if label differs from type (i.e. device panels)
    const showType = info?.deviceId && displayLabel.toLowerCase() !== typeLabel.toLowerCase();
    return html`
      <div class="panel-item ${isSelected ? 'selected' : ''} ${isLocked ? 'locked' : ''}"
        role="option" aria-selected="${isSelected}"
        @click=${() => this._select(panelId)}>
        <span class="panel-item-index">${index + 1}</span>
        <span class="panel-item-label">${displayLabel}</span>
        ${showType ? html`<span class="panel-item-type">${typeLabel}</span>` : ''}
        ${isLocked ? html`<span class="panel-item-lock">&#128274;</span>` : ''}
      </div>
    `;
  }

  render() {
    const sel = this._selected;
    const selCol = this._getColumn(sel);
    const isLocked = this._isIllumination(sel);

    // Split panels into full-width (illumination) and columned
    const fullWidthPanels = this._order.filter(pid => this._getColumn(pid) === 'full');
    const leftPanels = this._order.filter(pid => this._getColumn(pid) === 'left');
    const rightPanels = this._order.filter(pid => this._getColumn(pid) === 'right');

    // Calculate move constraints
    const currentColPanels = selCol === 'full' ? fullWidthPanels : selCol === 'left' ? leftPanels : rightPanels;
    const colIdx = currentColPanels.indexOf(sel);
    const canMoveUp = colIdx > 0 && !isLocked;
    const canMoveDown = colIdx >= 0 && colIdx < currentColPanels.length - 1 && !isLocked;
    const canMoveLeft = selCol === 'right' && !isLocked;
    const canMoveRight = selCol === 'left' && !isLocked;

    return html`
      <div class="edit-container">
        <span class="edit-label">PANEL LAYOUT — ${this._config?.area_id?.replace(/_/g, ' ') || ''}</span>

        <div class="layout-preview" role="listbox" aria-label="Panel layout">
          ${fullWidthPanels.length > 0 ? html`
            <div class="layout-fullwidth">
              ${fullWidthPanels.map((pid, i) => this._renderPanelItem(pid, i))}
            </div>
          ` : ''}
          <div class="layout-columns">
            <div class="layout-col">
              <div class="layout-col-label">LEFT</div>
              ${leftPanels.length > 0
                ? leftPanels.map((pid, i) => this._renderPanelItem(pid, i))
                : html`<div class="panel-item" style="opacity:0.2;cursor:default">— EMPTY —</div>`}
            </div>
            <div class="layout-col">
              <div class="layout-col-label">RIGHT</div>
              ${rightPanels.length > 0
                ? rightPanels.map((pid, i) => this._renderPanelItem(pid, i))
                : html`<div class="panel-item" style="opacity:0.2;cursor:default">— EMPTY —</div>`}
            </div>
          </div>
        </div>

        <div class="edit-actions">
          <button class="action-btn" ?disabled=${!canMoveUp} @click=${this._moveUp}>&#9650; Up</button>
          <button class="action-btn" ?disabled=${!canMoveDown} @click=${this._moveDown}>&#9660; Down</button>
          <button class="action-btn column" ?disabled=${!canMoveLeft} @click=${this._moveLeft}>&#9664; Left</button>
          <button class="action-btn column" ?disabled=${!canMoveRight} @click=${this._moveRight}>&#9654; Right</button>
        </div>
        <div class="edit-actions">
          <button class="action-btn" @click=${this._save}>Save</button>
          <button class="action-btn reset" @click=${this._reset}>Reset</button>
        </div>
      </div>
    `;
  }

  getCardSize() { return 5; }
}

if (!customElements.get('lcars-edit-panel-order-card')) {
  customElements.define('lcars-edit-panel-order-card', LcarsEditPanelOrderCard);
}
