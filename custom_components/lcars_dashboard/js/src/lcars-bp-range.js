// lcars-bp-range.js
//
// 30-day blood-pressure min/max/avg range chart. Per spec
// LCARS-SICKBAY-TAB-REDESIGN-SPEC.md §4.4. Two vertical range bars per day
// (systolic + diastolic) over an AHA-banded mmHg Y-axis. Color tokens locked
// per Geordi C6: sys = --lcars-butterscotch, dia = --lcars-ice, avg-tick =
// --lcars-space-white, AHA threshold lines = --lcars-gray @ 50% opacity.
//
// Data source: HA recorder `recorder/statistics_during_period` aggregated to
// per-day min/max/mean via the shared `lcars-recorder-stats.js` helper.
//
// PRIVACY (Worf W3 / §7.8):
//   - Shadow host carries `data-medical="phi"` AND `data-redact-priority="high"`
//     so the screenshot obfuscator blackouts the entire 30-day surface in one
//     click rather than per-bar.
//   - No console logs. No template binding of `hass.states` attributes.
//   - `_disposeCaches()` clears the per-instance recorder cache on profile
//     switch / consent toggle / right-to-erase (W6).

import { LitElement, html, css } from 'lit-element';
import { fetchRecorderStats, aggregateDaily } from './lcars-recorder-stats.js';

const Y_MIN = 60;
const Y_MAX = 180;
const AHA_LINES = [80, 90, 120, 130, 140]; // mmHg
const WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

class LcarsBpRange extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      systolicEntity: { type: String },
      diastolicEntity: { type: String },
      _data: { type: Object, state: true },
      _loading: { type: Boolean, state: true },
    };
  }

  createRenderRoot() {
    const root = this.attachShadow({ mode: 'open' });
    this.setAttribute('data-medical', 'phi');
    this.setAttribute('data-redact-priority', 'high');
    return root;
  }

  constructor() {
    super();
    this.hass = null;
    this.systolicEntity = null;
    this.diastolicEntity = null;
    this._data = null;
    this._loading = false;
    this._cache = new Map();
    this._lastKey = '';
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._disposeCaches();
  }

  _disposeCaches() {
    this._cache = new Map();
    this._data = null;
    this._lastKey = '';
  }

  updated(changed) {
    if (changed.has('systolicEntity') || changed.has('diastolicEntity')) {
      this._disposeCaches();
    }
    const ids = [this.systolicEntity, this.diastolicEntity].filter(Boolean);
    if (!ids.length || !this.hass) return;
    const key = ids.join('|');
    if (key !== this._lastKey) {
      this._lastKey = key;
      this._loadData(ids);
    }
  }

  async _loadData(ids) {
    if (!this.hass || this._loading) return;
    this._loading = true;
    try {
      const raw = await fetchRecorderStats(
        this.hass,
        ids,
        { windowMs: WINDOW_MS, period: 'day', types: ['min', 'max', 'mean'] },
        this._cache,
        { ttlMs: 5 * 60 * 1000 }
      );
      if (raw) this._data = aggregateDaily(raw);
    } finally {
      this._loading = false;
    }
  }

  _yFor(mmHg) {
    const clamped = Math.max(Y_MIN, Math.min(Y_MAX, mmHg));
    return ((Y_MAX - clamped) / (Y_MAX - Y_MIN)) * 100;
  }

  _summaryStats() {
    if (!Array.isArray(this._data) || !this._data.length) return null;
    const sys = this.systolicEntity;
    const dia = this.diastolicEntity;
    let sysMin = Infinity, sysMax = -Infinity, sysSum = 0, sysN = 0;
    let diaMin = Infinity, diaMax = -Infinity, diaSum = 0, diaN = 0;
    for (const d of this._data) {
      const s = d.byId[sys];
      const di = d.byId[dia];
      if (s) {
        if (Number.isFinite(s.min)) { sysMin = Math.min(sysMin, s.min); }
        if (Number.isFinite(s.max)) { sysMax = Math.max(sysMax, s.max); }
        if (Number.isFinite(s.mean)) { sysSum += s.mean; sysN += 1; }
      }
      if (di) {
        if (Number.isFinite(di.min)) { diaMin = Math.min(diaMin, di.min); }
        if (Number.isFinite(di.max)) { diaMax = Math.max(diaMax, di.max); }
        if (Number.isFinite(di.mean)) { diaSum += di.mean; diaN += 1; }
      }
    }
    if (!sysN && !diaN) return null;
    return {
      sysAvg: sysN ? Math.round(sysSum / sysN) : null,
      diaAvg: diaN ? Math.round(diaSum / diaN) : null,
      sysMax: sysMax === -Infinity ? null : Math.round(sysMax),
      sysMin: sysMin === Infinity ? null : Math.round(sysMin),
      diaMax: diaMax === -Infinity ? null : Math.round(diaMax),
      diaMin: diaMin === Infinity ? null : Math.round(diaMin),
      days: this._data.length,
    };
  }

  render() {
    const ids = [this.systolicEntity, this.diastolicEntity].filter(Boolean);
    if (!ids.length) {
      return html`<div class="empty" role="figure" aria-label="BP — no data">BP · NO DATA</div>`;
    }
    if (!Array.isArray(this._data) || !this._data.length) {
      return html`<div class="empty" role="figure" aria-label="BP — no data">BP · NO DATA</div>`;
    }
    const stats = this._summaryStats();
    if (!stats) {
      return html`<div class="empty" role="figure" aria-label="BP — no data">BP · NO DATA</div>`;
    }
    // Build SVG: 30 day slots × (sys bar + dia bar). viewBox is 0..300 wide,
    // 0..100 tall (each Y unit = 1.2 mmHg). Reference lines drawn first so
    // bars overlay them. Layout: 10 px per day, 4 px wide bars, 2 px gap.
    const SVG_W = 300;
    const SVG_H = 100;
    const slotW = SVG_W / 30;
    const barW = 3;
    // Right-align so newest day is at the rightmost slot.
    const days = this._data.slice(-30);
    const offset = (30 - days.length) * slotW;
    const ariaLabel = `Blood pressure trend, last 30 days. Systolic average ${stats.sysAvg || '—'}, diastolic average ${stats.diaAvg || '—'}.`;

    return html`
      <div class="wrap" role="figure" aria-label=${ariaLabel}>
        <div class="header">
          <span class="cap">BP · ${stats.days} DAYS</span>
          <span class="cap-avg" data-medical="phi">
            SYS AVG ${stats.sysAvg ?? '—'} · DIA AVG ${stats.diaAvg ?? '—'}
          </span>
        </div>
        <svg viewBox="0 0 ${SVG_W} ${SVG_H}" preserveAspectRatio="none"
             class="chart" aria-hidden="true">
          ${AHA_LINES.map((mmHg) => html`
            <line x1="0" x2=${SVG_W}
                  y1=${this._yFor(mmHg)} y2=${this._yFor(mmHg)}
                  stroke="var(--lcars-gray, #666688)" stroke-opacity="0.5"
                  stroke-width="0.4" stroke-dasharray="2 2"></line>
            <text x="2" y=${this._yFor(mmHg) - 0.5}
                  font-size="3" fill="var(--lcars-gray, #888899)"
                  opacity="0.6">${mmHg}</text>
          `)}
          ${days.map((d, i) => {
            const cx = offset + i * slotW + slotW / 2;
            const sys = d.byId[this.systolicEntity];
            const dia = d.byId[this.diastolicEntity];
            const parts = [];
            if (sys && Number.isFinite(sys.min) && Number.isFinite(sys.max)) {
              const y1 = this._yFor(sys.max);
              const y2 = this._yFor(sys.min);
              parts.push(html`
                <rect x=${cx - barW - 0.6} y=${y1}
                      width=${barW} height=${Math.max(0.5, y2 - y1)}
                      fill="var(--lcars-butterscotch, #ffaa66)"
                      rx="0.6"></rect>`);
              if (Number.isFinite(sys.mean)) {
                const ym = this._yFor(sys.mean);
                parts.push(html`
                  <line x1=${cx - barW - 1.2} x2=${cx - 0.4}
                        y1=${ym} y2=${ym}
                        stroke="var(--lcars-space-white, #f0f0ff)"
                        stroke-width="0.5"></line>`);
              }
            }
            if (dia && Number.isFinite(dia.min) && Number.isFinite(dia.max)) {
              const y1 = this._yFor(dia.max);
              const y2 = this._yFor(dia.min);
              parts.push(html`
                <rect x=${cx + 0.6} y=${y1}
                      width=${barW} height=${Math.max(0.5, y2 - y1)}
                      fill="var(--lcars-ice, #a8d8ff)"
                      rx="0.6"></rect>`);
              if (Number.isFinite(dia.mean)) {
                const ym = this._yFor(dia.mean);
                parts.push(html`
                  <line x1=${cx + 0.4} x2=${cx + barW + 1.2}
                        y1=${ym} y2=${ym}
                        stroke="var(--lcars-space-white, #f0f0ff)"
                        stroke-width="0.5"></line>`);
              }
            }
            return parts;
          })}
        </svg>
        <div class="footer" data-medical="phi">
          ${stats.sysMax != null ? html`<span>SYS MAX ${stats.sysMax}</span>` : ''}
          ${stats.diaMax != null ? html`<span>DIA MAX ${stats.diaMax}</span>` : ''}
          ${stats.sysMin != null ? html`<span>SYS MIN ${stats.sysMin}</span>` : ''}
          ${stats.diaMin != null ? html`<span>DIA MIN ${stats.diaMin}</span>` : ''}
        </div>
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
      .wrap { display: flex; flex-direction: column; gap: 0.45rem; }
      .header {
        display: flex; justify-content: space-between; align-items: baseline;
        font-size: 0.78rem; letter-spacing: 0.12em; text-transform: uppercase;
      }
      .header .cap { color: var(--lcars-african-violet, #cc99ff); }
      .header .cap-avg { color: var(--lcars-gray, #aaaadd); font-size: 0.72rem; }
      .chart {
        width: 100%;
        height: 220px;
        background: rgba(153, 204, 255, 0.04);
        border-radius: 0.3rem;
        display: block;
      }
      .footer {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem 0.9rem;
        font-size: 0.7rem;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--lcars-gray, #aaaadd);
        font-variant-numeric: tabular-nums;
      }
    `;
  }
}

if (!customElements.get('lcars-bp-range')) {
  customElements.define('lcars-bp-range', LcarsBpRange);
}
