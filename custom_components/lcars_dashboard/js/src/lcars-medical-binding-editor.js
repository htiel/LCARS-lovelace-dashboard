/**
 * LCARS Medical Binding Editor (v5.12.0-beta.2 — Phase 2)
 *
 * Admin-only modal for the Medical Bay multi-user mapping introduced in
 * v5.12.0-beta.1. Lists every detected binding key (HAE prefix or
 * `<platform>:<id>`) and lets the Captain assign each one to a HA `person.*`
 * entity. Also exposes the `respect_user_scoping` toggle and per-profile
 * label override.
 *
 * Spec authority: LCARS-MEDICAL-BAY-DASHBOARD-SPEC.md §4.5 (resolver), §5.4
 * (multi-user composition), §7.7 (per-user scope masking).
 *
 * Persists via `lcars_dashboard/medical_profiles/set` (admin-gated) and
 * fires `lcars_dashboard_medical_profiles_updated` for live cache
 * invalidation across all connected sessions.
 */
import { LitElement, html, css } from 'lit-element';
import { lcarsBaseStyles } from './lcars-styles.js';
import { listObservedBindings } from './lcars-medical-utils.js';

const UNMAPPED = '__unmapped__';

const STYLES = css`
  :host { display: block; }

  .be-backdrop {
    display: none;
    position: fixed; inset: 0;
    background: rgba(0, 0, 0, 0.7);
    z-index: 10000;
    align-items: center; justify-content: center;
  }
  .be-backdrop[data-open] { display: flex; }

  .be-frame {
    background: var(--lcars-card-bg, #111);
    border: 2px solid var(--lcars-african-violet, #cc99ff);
    border-radius: 0.5rem;
    min-width: 360px; max-width: 600px;
    width: 92vw; max-height: 88vh;
    display: flex; flex-direction: column;
    box-shadow: 0 0 40px rgba(0,0,0,0.5);
  }

  .be-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--lcars-gray, #999);
    flex-shrink: 0;
  }
  .be-title {
    font-family: var(--lcars-font, 'Antonio', sans-serif);
    font-size: 1.25rem;
    color: var(--lcars-african-violet, #cc99ff);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .be-close {
    background: none; border: none;
    color: var(--lcars-gray, #999);
    font-size: 1.5rem; cursor: pointer;
    padding: 0 0.25rem; line-height: 1;
    min-width: 44px; min-height: 44px;
  }
  .be-close:hover { color: var(--lcars-space-white, #fff); }
  .be-close:focus-visible { outline: 2px solid var(--lcars-ice, #99ccff); outline-offset: 2px; }

  .be-body {
    padding: 0.75rem 1rem;
    overflow-y: auto;
    display: flex; flex-direction: column; gap: 0.75rem;
    color: var(--lcars-space-white, #fff);
    font-family: var(--lcars-font, 'Antonio', sans-serif);
  }

  .be-help {
    font-size: 0.75rem;
    color: var(--lcars-gray, #999);
    line-height: 1.4;
    background: rgba(204, 153, 255, 0.05);
    border-left: 2px solid var(--lcars-african-violet, #cc99ff);
    padding: 0.5rem 0.75rem;
    border-radius: 0 0.25rem 0.25rem 0;
  }

  .be-section {
    display: flex; flex-direction: column; gap: 0.4rem;
  }
  .be-section-title {
    font-size: 0.7rem;
    color: var(--lcars-african-violet, #cc99ff);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    border-bottom: 1px solid rgba(204, 153, 255, 0.3);
    padding-bottom: 0.25rem;
  }

  .be-toggle-row {
    display: flex; align-items: center; gap: 0.6rem;
    padding: 0.4rem 0.5rem;
    background: rgba(255,255,255,0.03);
    border-radius: 0.25rem;
  }
  .be-toggle-row label {
    flex: 1; font-size: 0.85rem; cursor: pointer;
  }
  .be-toggle-row input[type="checkbox"] {
    width: 18px; height: 18px; cursor: pointer;
    accent-color: var(--lcars-african-violet, #cc99ff);
  }
  .be-toggle-row .be-toggle-help {
    font-size: 0.7rem; color: var(--lcars-gray, #999);
    margin-top: 0.15rem;
  }

  .be-row {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 0.5rem;
    align-items: center;
    padding: 0.4rem 0.5rem;
    background: rgba(255,255,255,0.03);
    border-radius: 0.25rem;
  }
  .be-row.unmapped { border-left: 2px solid var(--lcars-gold, #ffaa00); }
  .be-row.mapped { border-left: 2px solid var(--lcars-data-accent, #99cc99); }

  .be-row-label {
    display: flex; flex-direction: column; gap: 0.15rem;
    overflow: hidden;
  }
  .be-binding-key {
    font-family: 'Antonio', monospace;
    font-size: 0.85rem;
    color: var(--lcars-space-white, #fff);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .be-binding-meta {
    font-size: 0.7rem; color: var(--lcars-gray, #999);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }

  .be-select {
    background: var(--lcars-bg-elev, #111);
    color: var(--lcars-ice, #99ccff);
    border: 1px solid var(--lcars-ice, #99ccff);
    border-radius: 4px;
    padding: 0.35rem 0.5rem;
    font-family: inherit;
    font-size: 0.85rem;
    min-width: 10rem;
    min-height: 36px;
    cursor: pointer;
  }
  .be-select:focus-visible { outline: 2px solid var(--lcars-ice, #99ccff); outline-offset: 2px; }

  .be-input {
    background: var(--lcars-bg-elev, #111);
    color: var(--lcars-space-white, #fff);
    border: 1px solid var(--lcars-gray, #999);
    border-radius: 4px;
    padding: 0.35rem 0.5rem;
    font-family: inherit;
    font-size: 0.85rem;
    min-width: 10rem;
    min-height: 36px;
  }
  .be-input:focus-visible { outline: 2px solid var(--lcars-ice, #99ccff); outline-offset: 2px; }

  .be-empty {
    padding: 0.75rem;
    text-align: center;
    color: var(--lcars-gray, #999);
    font-size: 0.8rem;
    font-style: italic;
  }

  .be-status {
    padding: 0.4rem 0.6rem;
    font-size: 0.8rem;
    border-radius: 0.25rem;
  }
  .be-status.error {
    background: rgba(255, 102, 102, 0.15);
    color: var(--lcars-tomato, #ff6666);
    border: 1px solid var(--lcars-tomato, #ff6666);
  }
  .be-status.busy {
    background: rgba(153, 204, 255, 0.1);
    color: var(--lcars-ice, #99ccff);
  }

  .be-footer {
    display: flex; gap: 0.5rem; padding: 0.75rem 1rem;
    border-top: 1px solid var(--lcars-gray, #999);
    justify-content: flex-end;
    flex-shrink: 0;
  }
  .be-btn {
    padding: 0.5rem 1.25rem;
    border: none; border-radius: 0 1rem 1rem 0;
    font-family: var(--lcars-font, 'Antonio', sans-serif);
    font-size: 0.875rem; text-transform: uppercase;
    cursor: pointer; transition: filter 0.15s;
    min-height: 44px;
  }
  .be-btn:hover { filter: brightness(1.2); }
  .be-btn:focus-visible { outline: 2px solid var(--lcars-ice, #99ccff); outline-offset: 2px; }
  .be-btn:disabled { opacity: 0.4; cursor: not-allowed; filter: none; }
  .be-btn.save { background: var(--lcars-african-violet, #cc99ff); color: var(--lcars-black, #000); }
  .be-btn.cancel { background: var(--lcars-gray, #999); color: var(--lcars-black, #000); }
`;

class LcarsMedicalBindingEditor extends LitElement {
  static get properties() {
    return {
      _hass: { type: Object },
      _open: { type: Boolean },
      _respectScoping: { type: Boolean },
      _bindingMap: { type: Object },     // bindingKey -> personId | UNMAPPED
      _labels: { type: Object },         // personId -> label override
      _observed: { type: Array },        // [{ bindingKey, count, platform, sampleEntityId }]
      _persons: { type: Array },         // [{ id, name }]
      _existingPersons: { type: Array }, // person ids that have entries even if no binding
      _busy: { type: Boolean },
      _error: { type: String },
    };
  }

  static get styles() { return [lcarsBaseStyles, STYLES]; }

  constructor() {
    super();
    this._open = false;
    this._respectScoping = true;
    this._bindingMap = {};
    this._labels = {};
    this._observed = [];
    this._persons = [];
    this._existingPersons = [];
    this._busy = false;
    this._error = '';
    this._onDocKeydown = (e) => this._handleKeydown(e);
  }

  set hass(hass) { this._hass = hass; }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('keydown', this._onDocKeydown, true);
  }

  disconnectedCallback() {
    document.removeEventListener('keydown', this._onDocKeydown, true);
    super.disconnectedCallback();
  }

  async open() {
    this._error = '';
    this._busy = true;
    this._open = true;
    await this._load();
    this._busy = false;
    this.updateComplete.then(() => {
      const closeBtn = this.shadowRoot?.querySelector('.be-close');
      if (closeBtn) closeBtn.focus();
    });
  }

  close() {
    this._open = false;
    this._error = '';
  }

  async _load() {
    if (!this._hass) return;
    // Enumerate persons (always — basis for the dropdown choices).
    const personIds = Object.keys(this._hass.states || {})
      .filter((eid) => eid.startsWith('person.'))
      .sort();
    this._persons = personIds.map((id) => ({
      id,
      name: this._hass.states[id]?.attributes?.friendly_name || id,
    }));

    // Walk the medical entity universe to populate the bindings list.
    this._observed = listObservedBindings(this._hass)
      .sort((a, b) => a.bindingKey.localeCompare(b.bindingKey));

    // Load the persisted mapping.
    let mapping = null;
    try {
      mapping = await this._hass.callWS({ type: 'lcars_dashboard/medical_profiles/get' });
    } catch (e) {
      this._error = `Failed to load mapping: ${e?.message || e}`;
      mapping = { version: 1, respect_user_scoping: true, profiles: [] };
    }

    this._respectScoping = mapping?.respect_user_scoping !== false;

    const bindingMap = {};
    const labels = {};
    const existing = new Set();
    if (Array.isArray(mapping?.profiles)) {
      for (const p of mapping.profiles) {
        if (!p || typeof p.id !== 'string') continue;
        existing.add(p.id);
        if (typeof p.label === 'string' && p.label) labels[p.id] = p.label;
        if (Array.isArray(p.bindings)) {
          for (const b of p.bindings) {
            if (typeof b === 'string') bindingMap[b] = p.id;
          }
        }
      }
    }
    this._bindingMap = bindingMap;
    this._labels = labels;
    this._existingPersons = Array.from(existing);
  }

  _onBindingChange(bindingKey, value) {
    const next = { ...this._bindingMap };
    if (!value || value === UNMAPPED) {
      delete next[bindingKey];
    } else {
      next[bindingKey] = value;
    }
    this._bindingMap = next;
  }

  _onLabelChange(personId, value) {
    const next = { ...this._labels };
    const trimmed = (value || '').trim();
    if (!trimmed) {
      delete next[personId];
    } else {
      next[personId] = trimmed;
    }
    this._labels = next;
  }

  _onScopingToggle(checked) {
    this._respectScoping = !!checked;
  }

  _handleBackdropClick(e) {
    if (e.target === e.currentTarget) this.close();
  }

  _handleKeydown(e) {
    if (!this._open) return;
    if (e.key !== 'Escape') return;
    const path = (typeof e.composedPath === 'function') ? e.composedPath() : [];
    if (path.length && !path.includes(this)) return;
    e.stopPropagation();
    this.close();
  }

  _buildPayload() {
    // Bucket bindings by mapped personId.
    const byPerson = new Map();
    for (const [bindingKey, personId] of Object.entries(this._bindingMap)) {
      if (!personId) continue;
      if (!byPerson.has(personId)) byPerson.set(personId, []);
      byPerson.get(personId).push(bindingKey);
    }
    // Include any persons that previously had a label / entry but no current
    // bindings, so the Captain can keep editing labels without losing the row.
    for (const pid of this._existingPersons) {
      if (!byPerson.has(pid)) byPerson.set(pid, []);
    }
    for (const pid of Object.keys(this._labels)) {
      if (!byPerson.has(pid)) byPerson.set(pid, []);
    }

    const profiles = [];
    for (const [pid, bindings] of byPerson.entries()) {
      const entry = { id: pid, bindings: bindings.slice().sort() };
      if (this._labels[pid]) entry.label = this._labels[pid];
      profiles.push(entry);
    }
    profiles.sort((a, b) => a.id.localeCompare(b.id));

    return {
      version: 1,
      respect_user_scoping: !!this._respectScoping,
      profiles,
    };
  }

  async _save() {
    if (!this._hass) return;
    this._busy = true;
    this._error = '';
    try {
      const data = this._buildPayload();
      await this._hass.callWS({
        type: 'lcars_dashboard/medical_profiles/set',
        data,
      });
      this._busy = false;
      this.close();
    } catch (e) {
      this._busy = false;
      this._error = `Save failed: ${e?.message || e}`;
    }
  }

  _renderBindingRow(item) {
    const current = this._bindingMap[item.bindingKey] || UNMAPPED;
    const mapped = current !== UNMAPPED;
    return html`
      <div class="be-row ${mapped ? 'mapped' : 'unmapped'}">
        <div class="be-row-label">
          <span class="be-binding-key" title=${item.bindingKey}>${item.bindingKey}</span>
          <span class="be-binding-meta">${item.platform} · ${item.count} entit${item.count === 1 ? 'y' : 'ies'} · e.g. ${item.sampleEntityId}</span>
        </div>
        <select class="be-select"
                aria-label="Map ${item.bindingKey} to a person"
                .value=${current}
                @change=${(e) => this._onBindingChange(item.bindingKey, e.target.value)}>
          <option value=${UNMAPPED}>(unmapped)</option>
          ${this._persons.map((p) => html`
            <option value=${p.id} ?selected=${p.id === current}>${p.name}</option>
          `)}
        </select>
      </div>
    `;
  }

  _renderLabelRow(personId) {
    const person = this._persons.find((p) => p.id === personId);
    const fallback = person?.name || personId;
    const current = this._labels[personId] || '';
    return html`
      <div class="be-row mapped">
        <div class="be-row-label">
          <span class="be-binding-key">${personId}</span>
          <span class="be-binding-meta">HA name: ${fallback}</span>
        </div>
        <input class="be-input" type="text"
               aria-label="Display label override for ${personId}"
               placeholder="(use HA name)"
               maxlength="64"
               .value=${current}
               @input=${(e) => this._onLabelChange(personId, e.target.value)}>
      </div>
    `;
  }

  render() {
    // Persons that currently have at least one binding mapped to them.
    const activePersonIds = Array.from(new Set(Object.values(this._bindingMap).filter(Boolean)));
    activePersonIds.sort();

    return html`
      <div class="be-backdrop"
           ?data-open=${this._open}
           @click=${this._handleBackdropClick}
           role="dialog"
           aria-modal="true"
           aria-label="Medical profile bindings">
        <div class="be-frame">
          <div class="be-header">
            <span class="be-title">Medical Profile Bindings</span>
            <button class="be-close" @click=${() => this.close()} aria-label="Close">&times;</button>
          </div>
          <div class="be-body">
            <div class="be-help">
              Assign each detected medical-data source (HAE prefix or integration account) to a Home Assistant person. Unmapped bindings still surface on the dashboard under an &ldquo;unmapped&rdquo; bucket so nothing is hidden.
            </div>

            ${this._error ? html`<div class="be-status error" role="alert">${this._error}</div>` : ''}
            ${this._busy ? html`<div class="be-status busy" role="status">Working&hellip;</div>` : ''}

            <div class="be-section">
              <div class="be-section-title">Privacy</div>
              <div class="be-toggle-row">
                <input id="be-scoping" type="checkbox"
                       .checked=${this._respectScoping}
                       @change=${(e) => this._onScopingToggle(e.target.checked)}>
                <label for="be-scoping">
                  Respect per-user scoping
                  <div class="be-toggle-help">When enabled, vitals are masked (&bull;&bull;&bull;) for non-admin viewers who are not the linked HA user. Spec &sect;7.7.</div>
                </label>
              </div>
            </div>

            <div class="be-section">
              <div class="be-section-title">Detected Bindings (${this._observed.length})</div>
              ${this._observed.length === 0
                ? html`<div class="be-empty">No medical bindings detected. Install a supported integration (Withings, Fitbit, Dexcom, Garmin, Oura, Google Fit, HAE / Apple Health).</div>`
                : this._observed.map((item) => this._renderBindingRow(item))}
            </div>

            <div class="be-section">
              <div class="be-section-title">Profile Labels</div>
              ${activePersonIds.length === 0
                ? html`<div class="be-empty">Map at least one binding to a person to customize labels.</div>`
                : activePersonIds.map((pid) => this._renderLabelRow(pid))}
            </div>
          </div>
          <div class="be-footer">
            <button class="be-btn cancel" @click=${() => this.close()} ?disabled=${this._busy}>Cancel</button>
            <button class="be-btn save" @click=${() => this._save()} ?disabled=${this._busy}>Save</button>
          </div>
        </div>
      </div>
    `;
  }
}

if (!customElements.get('lcars-medical-binding-editor')) {
  customElements.define('lcars-medical-binding-editor', LcarsMedicalBindingEditor);
}
