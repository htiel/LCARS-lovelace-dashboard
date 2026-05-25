// lcars-hr-zones.js
//
// LCARS workout heart-rate zone bars. Renders four stacked horizontal LCARS
// pill segments (PEAK / INTENSE / MODERATE / LIGHT) sized by time spent in
// each zone during the most recent workout. Zone thresholds are derived from
// the bound person's birthdate (220 - age fallback formula).
//
// Per spec LCARS-SICKBAY-TAB-REDESIGN-SPEC.md §4.3 (Q-C ratified):
//   - When `personMaxHrEst` is null (no birthdate), hide bars and render a
//     single LCARS pill `WORKOUT HR · SET PERSON BIRTHDATE TO ENABLE ZONES`.
//   - When `samples` are present, compute per-zone durations from samples.
//     When only `avgHr` + `maxHr` + `durationS` are available, render a
//     dominant-zone estimate with a `~` prefix in the value column.
//   - `role="img"` + aria-label per spec §4.8.
//
// PRIVACY (Worf §16 / W6 / §7.8):
//   - Shadow host carries `data-medical="phi"` so the screenshot obfuscator
//     redacts the entire component in one pass.
//   - No console logs. No template binding from `hass.states` attributes.
//   - Input hygiene: all string interpolation goes through Lit `${}`.
//   - `_disposeCaches()` no-op stub for W6 (no caches today; method present so
//     parent components can call it uniformly across all primitives).

import { LitElement, html, css } from 'lit-element';

const ZONES = [
  { key: 'PEAK',     minPct: 90 },
  { key: 'INTENSE',  minPct: 80 },
  { key: 'MODERATE', minPct: 70 },
  { key: 'LIGHT',    minPct: 50 },
];

const ZONE_COLOR = {
  PEAK:     'var(--lcars-alert, #cc6666)',
  INTENSE:  'var(--lcars-tomato, #ff6666)',
  MODERATE: 'var(--lcars-butterscotch, #ffaa66)',
  LIGHT:    'var(--lcars-gold, #ffcc66)',
};

class LcarsHrZones extends LitElement {
  static get properties() {
    return {
      avgHr: { type: Number },
      maxHr: { type: Number },
      durationS: { type: Number },
      samples: { type: Array },          // optional: [{ tS, bpm }]
      personMaxHrEst: { type: Number },  // 220 - age; null = hide bars
      workoutType: { type: String },
    };
  }

  // Open shadow root — primitive is intentionally inspectable for redaction;
  // the parent card's closed root contains the PHI surface boundary.
  createRenderRoot() {
    const root = this.attachShadow({ mode: 'open' });
    this.setAttribute('data-medical', 'phi');
    return root;
  }

  constructor() {
    super();
    this.avgHr = null;
    this.maxHr = null;
    this.durationS = null;
    this.samples = null;
    this.personMaxHrEst = null;
    this.workoutType = null;
  }

  _disposeCaches() {
    // W6 stub. No caches in v5.14; method exists so the parent card can call
    // it uniformly across every primitive when a profile-switch happens.
  }

  updated(changed) {
    if (changed.has('personMaxHrEst') || changed.has('avgHr') || changed.has('samples')) {
      this._disposeCaches();
    }
  }

  _computeZoneDurations() {
    if (!Number.isFinite(this.personMaxHrEst) || this.personMaxHrEst <= 0) return null;
    const thresholds = ZONES.map((z) => ({ ...z, threshold: (z.minPct / 100) * this.personMaxHrEst }));
    // Sample-based path (preferred when HAI plug-in ships §2.3).
    if (Array.isArray(this.samples) && this.samples.length > 1) {
      const buckets = { PEAK: 0, INTENSE: 0, MODERATE: 0, LIGHT: 0 };
      for (let i = 0; i < this.samples.length - 1; i++) {
        const s = this.samples[i];
        const next = this.samples[i + 1];
        const bpm = Number(s && s.bpm);
        if (!Number.isFinite(bpm)) continue;
        const dt = Math.max(0, Number(next.tS) - Number(s.tS));
        if (!Number.isFinite(dt)) continue;
        for (const z of thresholds) {
          if (bpm >= z.threshold) { buckets[z.key] += dt; break; }
        }
      }
      return { buckets, approximate: false };
    }
    // Degraded fallback: assign the entire duration to the band containing avgHr.
    if (Number.isFinite(this.avgHr) && Number.isFinite(this.durationS)) {
      const buckets = { PEAK: 0, INTENSE: 0, MODERATE: 0, LIGHT: 0 };
      for (const z of thresholds) {
        if (this.avgHr >= z.threshold) { buckets[z.key] = this.durationS; break; }
      }
      return { buckets, approximate: true };
    }
    return null;
  }

  _formatDuration(s) {
    if (!Number.isFinite(s) || s <= 0) return '0s';
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    if (mins === 0) return `${secs}s`;
    if (secs === 0) return `${mins}m`;
    return `${mins}m ${secs}s`;
  }

  render() {
    // Birthdate-gated guard (spec Q-C ratified).
    if (!Number.isFinite(this.personMaxHrEst) || this.personMaxHrEst <= 0) {
      return html`
        <div class="empty empty-config"
             role="img"
             aria-label="Workout heart rate zones unavailable — person birthdate not set">
          WORKOUT HR · SET PERSON BIRTHDATE TO ENABLE ZONES
        </div>`;
    }
    // No workout data at all.
    if (!Number.isFinite(this.avgHr) && !Number.isFinite(this.maxHr) && (!Array.isArray(this.samples) || this.samples.length === 0)) {
      return html`<div class="empty" role="img" aria-label="Workout HR — no data">WORKOUT HR · NO DATA</div>`;
    }
    const computed = this._computeZoneDurations();
    if (!computed) {
      return html`<div class="empty" role="img" aria-label="Workout HR — no data">WORKOUT HR · NO DATA</div>`;
    }
    const { buckets, approximate } = computed;
    const total = Object.values(buckets).reduce((a, b) => a + b, 0) || 1;
    const totalMins = Math.round((Number.isFinite(this.durationS) ? this.durationS : total) / 60);
    const type = this.workoutType ? String(this.workoutType).toUpperCase() : 'WORKOUT';
    const ariaLabel = `Workout heart rate zones: ${totalMins} minutes total`;
    return html`
      <div class="wrap" role="img" aria-label=${ariaLabel}>
        <div class="header">
          <span class="type">${type}</span>
          <span class="total" data-medical="phi">${totalMins} MIN · MAX HR ${Math.round(this.personMaxHrEst)} EST</span>
        </div>
        <div class="bars">
          ${ZONES.map((z) => {
            const secs = buckets[z.key] || 0;
            const pct = total > 0 ? (secs / total) * 100 : 0;
            const display = (approximate && secs > 0) ? `~${this._formatDuration(secs)}` : this._formatDuration(secs);
            return html`
              <div class="bar-row" data-zone=${z.key}>
                <span class="bar-label">${z.key}</span>
                <div class="bar-track" aria-hidden="true">
                  <div class="bar-fill"
                       style=${`width:${pct.toFixed(1)}%;background:${ZONE_COLOR[z.key]}`}></div>
                </div>
                <span class="bar-value" data-medical="phi">${display}</span>
              </div>`;
          })}
        </div>
        ${approximate ? html`
          <div class="approx-note">
            ESTIMATED FROM AVG HR · INSTALL HAI WORKOUT SAMPLES FOR EXACT BANDS
          </div>` : ''}
      </div>`;
  }

  static get styles() {
    return css`
      :host {
        display: block;
        font-family: var(--lcars-font, 'Antonio', sans-serif);
        color: var(--lcars-text, #ccccee);
      }
      .empty {
        padding: 1.5rem 0.75rem;
        text-align: center;
        font-size: 0.85rem;
        letter-spacing: 0.12em;
        color: var(--lcars-gray, #888899);
        text-transform: uppercase;
        background: rgba(102, 102, 136, 0.06);
        border-left: 3px solid var(--lcars-gray, #666688);
        border-radius: 0 0.3rem 0.3rem 0;
      }
      .empty-config { color: var(--lcars-ice, #a8d8ff); border-left-color: var(--lcars-ice, #a8d8ff); }
      .wrap { display: flex; flex-direction: column; gap: 0.5rem; }
      .header {
        display: flex; justify-content: space-between; align-items: baseline;
        font-size: 0.8rem; letter-spacing: 0.1em; text-transform: uppercase;
        color: var(--lcars-african-violet, #cc99ff);
      }
      .header .total { color: var(--lcars-gray, #aaaadd); font-size: 0.72rem; }
      .bars { display: flex; flex-direction: column; gap: 0.35rem; }
      .bar-row {
        display: grid;
        grid-template-columns: 5.5em 1fr 5.5em;
        gap: 0.5rem;
        align-items: center;
        min-height: 28px;
      }
      .bar-label {
        font-size: 0.8rem;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--lcars-gray, #aaaadd);
      }
      .bar-track {
        height: 16px;
        background: rgba(153, 204, 255, 0.06);
        border-radius: 8px;
        overflow: hidden;
        position: relative;
      }
      .bar-fill {
        height: 100%;
        border-radius: 8px;
        transition: width 200ms ease-out;
      }
      .bar-value {
        font-variant-numeric: tabular-nums;
        font-size: 0.8rem;
        text-align: right;
        letter-spacing: 0.04em;
        color: var(--lcars-text, #ccccee);
      }
      .approx-note {
        font-size: 0.65rem;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--lcars-gray, #888899);
        text-align: center;
        padding-top: 0.3rem;
      }
    `;
  }
}

if (!customElements.get('lcars-hr-zones')) {
  customElements.define('lcars-hr-zones', LcarsHrZones);
}
