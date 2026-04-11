/**
 * LCARS Edit Area Button Card — Editor for area button appearance
 */
import { LitElement, html, css } from 'lit-element';
import { lcarsBaseStyles } from './lcars-styles.js';
import { fireEvent } from './lcars-helpers.js';

const EDIT_STYLES = css`
  :host { display: block; }
  .edit-container { display: flex; flex-direction: column; gap: var(--lcars-gap); padding: 0.5rem 0; }
  .edit-field { display: flex; flex-direction: column; gap: 0.25rem; }
  .edit-label { font-family: var(--lcars-font); font-size: 0.625rem; color: var(--lcars-gray); text-transform: uppercase; }
  .edit-input { height: 2.5rem; padding: 0 0.75rem; background: var(--lcars-ice); color: var(--lcars-black); border: none; border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0; font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); text-transform: uppercase; outline: none; }
  .edit-input:focus { box-shadow: 0 0 0 2px var(--lcars-btn-active); }
  .edit-actions { display: flex; gap: var(--lcars-gap); padding-top: 0.5rem; }
  .action-btn { flex: 1; height: var(--lcars-btn-height); background: var(--lcars-butterscotch); color: var(--lcars-black); border: none; border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0; font-family: var(--lcars-font); font-size: var(--lcars-font-size-data); text-transform: uppercase; cursor: pointer; transition: filter var(--lcars-transition); user-select: none; }
  .action-btn:hover { filter: brightness(1.2); }
  .action-btn.danger { background: var(--lcars-red-alert); color: var(--lcars-space-white); }
`;

const waitForHelpers = [
  customElements.whenDefined('hui-masonry-view'),
  customElements.whenDefined('hc-lovelace'),
];

Promise.race(waitForHelpers).then(async () => {
  await new Promise((r) => setTimeout(r, 2000));

  class LcarsEditAreaButtonCard extends LitElement {
    static get properties() {
      return { _hass: { type: Object }, _config: { type: Object } };
    }
    set hass(hass) { this._hass = hass; }
    setConfig(config) { this._config = config; }

    async _save() {
      if (!this._hass) return;
      try {
        await this._hass.callWS({ type: 'lcars_dashboard/area_button/set', ...this._getFormData() });
        fireEvent('lcars_dashboard_reload');
      } catch (e) { console.error('LCARS Edit: Save failed', e); }
    }

    _getFormData() {
      const inputs = this.shadowRoot.querySelectorAll('.edit-input');
      return { name: inputs[0]?.value, icon: inputs[1]?.value };
    }

    static get styles() { return [lcarsBaseStyles, EDIT_STYLES]; }

    render() {
      return html`
        <div class="edit-container">
          <div class="edit-field">
            <span class="edit-label">Button Label</span>
            <input class="edit-input" type="text" .value=${this._config?.name || ''} />
          </div>
          <div class="edit-field">
            <span class="edit-label">Icon</span>
            <input class="edit-input" type="text" .value=${this._config?.icon || ''} placeholder="mdi:home" />
          </div>
          <div class="edit-actions">
            <button class="action-btn" @click=${this._save}>Save</button>
          </div>
        </div>
      `;
    }
    getCardSize() { return 3; }
  }

  if (!customElements.get('lcars-edit-area-button-card')) {
    customElements.define('lcars-edit-area-button-card', LcarsEditAreaButtonCard);
  }
});
