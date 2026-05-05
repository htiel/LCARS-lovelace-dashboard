/**
 * LCARS Sidebar Reorder Dialog
 *
 * Drag-and-drop reorder dialog for LCARS dashboard sidebar items.
 * Uses native HTML5 Drag & Drop with grip handles.
 * Loads/saves order via lcars_dashboard/sidebar_order/get|set WS commands.
 */
import { LitElement, html, css } from 'lit-element';
import { lcarsBaseStyles } from './lcars-styles.js';

const DASHBOARD_URL_MAP = {
  habitat: 'lcars-habitat',
  security: 'lcars-security',
  power: 'lcars-power',
  environmental: 'lcars-environmental',
  lighting: 'lcars-lighting',
  cetacean: 'lcars-cetacean',
  network: 'lcars-network',
  medical: 'lcars-medical',
  'starship-health': 'lcars-starship-health',
};

/**
 * Auto-fix sidebar order so LCARS dashboards are grouped at the top.
 * Runs at most once per page load. Uses HA's frontend/set_user_data WS.
 */
let _sidebarFixRan = false;
export async function ensureLcarsSidebarTop(hass) {
  if (_sidebarFixRan || !hass) return;
  _sidebarFixRan = true;

  try {
    // Get configured dashboard order from our backend
    const result = await hass.callWS({ type: 'lcars_dashboard/sidebar_order/get' });
    const order = result.order || [];

    const lcarsUrls = order.map(k => DASHBOARD_URL_MAP[k]).filter(Boolean);
    if (lcarsUrls.length === 0) return;
    const lcarsSet = new Set(lcarsUrls);

    // Get current sidebar data from HA frontend storage
    let sidebarData = {};
    try {
      const resp = await hass.callWS({ type: 'frontend/get_user_data', key: 'sidebar' });
      if (resp && resp.value) sidebarData = resp.value;
    } catch (e) { return; }

    let panelOrder = Array.isArray(sidebarData.panelOrder) ? [...sidebarData.panelOrder] : [];
    if (panelOrder.length === 0) return;

    // Check if LCARS panels are already at the top in correct order
    let alreadyCorrect = true;
    for (let i = 0; i < lcarsUrls.length; i++) {
      if (panelOrder[i] !== lcarsUrls[i]) { alreadyCorrect = false; break; }
    }
    if (alreadyCorrect) return;

    // Fix: remove LCARS, insert at top
    panelOrder = panelOrder.filter(p => !lcarsSet.has(p));
    panelOrder.splice(0, 0, ...lcarsUrls);

    // Ensure all registered panels are present
    const existing = new Set(panelOrder);
    for (const p of Object.keys(hass.panels || {})) {
      if (!existing.has(p)) panelOrder.push(p);
    }

    // Write back via HA frontend storage (subscription auto-updates sidebar)
    await hass.callWS({
      type: 'frontend/set_user_data',
      key: 'sidebar',
      value: { panelOrder, hiddenPanels: sidebarData.hiddenPanels || [] },
    });
  } catch (e) {
    console.warn('LCARS: auto-fix sidebar order failed', e);
  }
}

const REORDER_STYLES = css`
  :host { display: block; }

  .reorder-backdrop {
    display: none;
    position: fixed; inset: 0;
    background: rgba(0, 0, 0, 0.7);
    z-index: 10000;
    align-items: center; justify-content: center;
  }
  .reorder-backdrop[data-open] {
    display: flex;
  }

  .reorder-frame {
    background: var(--lcars-card-bg, #111);
    border: 2px solid var(--lcars-butterscotch, #f1df6f);
    border-radius: 0.5rem;
    min-width: 320px; max-width: 400px;
    width: 90vw;
    box-shadow: 0 0 40px rgba(0,0,0,0.5);
  }

  .reorder-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--lcars-gray, #999);
  }
  .reorder-title {
    font-family: var(--lcars-font, 'Antonio', sans-serif);
    font-size: 1.25rem;
    color: var(--lcars-butterscotch, #f1df6f);
    text-transform: uppercase;
  }
  .reorder-close {
    background: none; border: none;
    color: var(--lcars-gray, #999);
    font-size: 1.5rem; cursor: pointer;
    padding: 0 0.25rem;
    line-height: 1;
  }
  .reorder-close:hover { color: var(--lcars-space-white, #fff); }

  .reorder-body {
    padding: 0.75rem;
    display: flex; flex-direction: column; gap: 4px;
  }

  .reorder-item {
    display: flex; align-items: center; gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: var(--lcars-disabled, #444);
    color: var(--lcars-space-white, #fff);
    border-radius: 0 1rem 1rem 0;
    font-family: var(--lcars-font, 'Antonio', sans-serif);
    font-size: 1rem;
    text-transform: uppercase;
    cursor: grab;
    user-select: none;
    transition: background 0.15s, transform 0.15s, opacity 0.15s;
  }
  .reorder-item:hover { background: var(--lcars-gray, #666); }
  .reorder-item.dragging {
    opacity: 0.4;
    background: var(--lcars-butterscotch, #f1df6f);
    color: var(--lcars-black, #000);
  }
  .reorder-item.drag-over {
    border-top: 3px solid var(--lcars-butterscotch, #f1df6f);
    padding-top: calc(0.5rem - 3px);
  }

  .grip-handle {
    display: flex; flex-direction: column; gap: 2px;
    cursor: grab; padding: 0.25rem 0;
    flex-shrink: 0;
  }
  .grip-handle span {
    display: block; width: 14px; height: 2px;
    background: var(--lcars-gray, #999);
    border-radius: 1px;
  }
  .reorder-item:hover .grip-handle span {
    background: var(--lcars-space-white, #fff);
  }

  .item-icon { flex-shrink: 0; --mdc-icon-size: 20px; }
  .item-label { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  .reorder-footer {
    display: flex; gap: 0.5rem; padding: 0.75rem 1rem;
    border-top: 1px solid var(--lcars-gray, #999);
    justify-content: flex-end;
  }
  .reorder-btn {
    padding: 0.5rem 1.25rem;
    border: none; border-radius: 0 1rem 1rem 0;
    font-family: var(--lcars-font, 'Antonio', sans-serif);
    font-size: 0.875rem; text-transform: uppercase;
    cursor: pointer; transition: filter 0.15s;
  }
  .reorder-btn:hover { filter: brightness(1.2); }
  .reorder-btn.save {
    background: var(--lcars-butterscotch, #f1df6f);
    color: var(--lcars-black, #000);
  }
  .reorder-btn.cancel {
    background: var(--lcars-gray, #999);
    color: var(--lcars-black, #000);
  }
`;


class LcarsSidebarReorder extends LitElement {
  static get properties() {
    return {
      _hass: { type: Object },
      _open: { type: Boolean },
      _order: { type: Array },
      _dashboards: { type: Object },
      _dragIdx: { type: Number },
      _overIdx: { type: Number },
    };
  }

  static get styles() {
    return [lcarsBaseStyles, REORDER_STYLES];
  }

  constructor() {
    super();
    this._open = false;
    this._order = [];
    this._dashboards = {};
    this._dragIdx = -1;
    this._overIdx = -1;
  }

  set hass(hass) { this._hass = hass; }

  async open() {
    await this._load();
    this._open = true;
  }

  close() {
    this._open = false;
    this._dragIdx = -1;
    this._overIdx = -1;
  }

  async _load() {
    if (!this._hass) return;
    try {
      const result = await this._hass.callWS({ type: 'lcars_dashboard/sidebar_order/get' });
      this._order = result.order || [];
      this._dashboards = result.dashboards || {};
    } catch (e) {
      console.error('LCARS Reorder: Failed to load sidebar order', e);
    }
  }

  async _save() {
    if (!this._hass) return;
    try {
      // 1. Save order to our backend for persistence
      await this._hass.callWS({
        type: 'lcars_dashboard/sidebar_order/set',
        order: JSON.stringify(this._order),
      });

      // 2. Build LCARS url_paths from dashboard keys in chosen order
      const lcarsUrls = this._order.map(k => DASHBOARD_URL_MAP[k]).filter(Boolean);
      const lcarsSet = new Set(lcarsUrls);

      // 3. Get current sidebar data from HA frontend storage
      let sidebarData = {};
      try {
        const resp = await this._hass.callWS({ type: 'frontend/get_user_data', key: 'sidebar' });
        if (resp && resp.value) sidebarData = resp.value;
      } catch (e) { /* no existing sidebar data */ }

      let panelOrder = Array.isArray(sidebarData.panelOrder) ? [...sidebarData.panelOrder] : [];

      // 4. If panelOrder is empty, seed from all known panels
      if (panelOrder.length === 0) {
        panelOrder = Object.keys(this._hass.panels || {}).sort();
      }

      // 5. Remove all LCARS panels from current order
      panelOrder = panelOrder.filter(p => !lcarsSet.has(p));

      // 6. Insert LCARS panels at the top, grouped together
      panelOrder.splice(0, 0, ...lcarsUrls);

      // 7. Ensure all registered panels are present
      const existing = new Set(panelOrder);
      for (const p of Object.keys(this._hass.panels || {})) {
        if (!existing.has(p)) panelOrder.push(p);
      }

      // 8. Write sidebar data directly via HA frontend storage
      await this._hass.callWS({
        type: 'frontend/set_user_data',
        key: 'sidebar',
        value: {
          panelOrder,
          hiddenPanels: sidebarData.hiddenPanels || [],
        },
      });

      this.close();
      window.location.reload();
    } catch (e) {
      console.error('LCARS Reorder: Failed to save sidebar order', e);
    }
  }

  _onDragStart(e, idx) {
    this._dragIdx = idx;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(idx));
  }

  _onDragOver(e, idx) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (idx !== this._overIdx) {
      this._overIdx = idx;
    }
  }

  _onDragLeave(e, idx) {
    if (this._overIdx === idx) {
      this._overIdx = -1;
    }
  }

  _onDrop(e, dropIdx) {
    e.preventDefault();
    const fromIdx = this._dragIdx;
    if (fromIdx < 0 || fromIdx === dropIdx) {
      this._dragIdx = -1;
      this._overIdx = -1;
      return;
    }
    const newOrder = [...this._order];
    const [moved] = newOrder.splice(fromIdx, 1);
    newOrder.splice(dropIdx, 0, moved);
    this._order = newOrder;
    this._dragIdx = -1;
    this._overIdx = -1;
  }

  _onDragEnd() {
    this._dragIdx = -1;
    this._overIdx = -1;
  }

  _handleBackdropClick(e) {
    if (e.target === e.currentTarget) this.close();
  }

  _handleKeydown(e) {
    if (e.key === 'Escape') this.close();
  }

  render() {
    const items = this._order.map((key, idx) => {
      const info = this._dashboards[key] || {};
      const classes = ['reorder-item'];
      if (idx === this._dragIdx) classes.push('dragging');
      if (idx === this._overIdx && idx !== this._dragIdx) classes.push('drag-over');
      return html`
        <div class="${classes.join(' ')}"
          draggable="true"
          @dragstart=${(e) => this._onDragStart(e, idx)}
          @dragover=${(e) => this._onDragOver(e, idx)}
          @dragleave=${(e) => this._onDragLeave(e, idx)}
          @drop=${(e) => this._onDrop(e, idx)}
          @dragend=${() => this._onDragEnd()}>
          <div class="grip-handle" aria-hidden="true">
            <span></span><span></span><span></span>
          </div>
          <ha-icon class="item-icon" .icon=${info.icon || 'mdi:monitor-dashboard'}></ha-icon>
          <span class="item-label">${info.title || key}</span>
        </div>
      `;
    });

    return html`
      <div class="reorder-backdrop"
        ?data-open=${this._open}
        @click=${this._handleBackdropClick}
        @keydown=${this._handleKeydown}
        role="dialog"
        aria-modal="true"
        aria-label="Reorder dashboards">
        <div class="reorder-frame">
          <div class="reorder-header">
            <span class="reorder-title">Sidebar Order</span>
            <button class="reorder-close" @click=${() => this.close()} aria-label="Close">&times;</button>
          </div>
          <div class="reorder-body">
            ${items}
          </div>
          <div class="reorder-footer">
            <button class="reorder-btn cancel" @click=${() => this.close()}>Cancel</button>
            <button class="reorder-btn save" @click=${() => this._save()}>Save</button>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('lcars-sidebar-reorder', LcarsSidebarReorder);
