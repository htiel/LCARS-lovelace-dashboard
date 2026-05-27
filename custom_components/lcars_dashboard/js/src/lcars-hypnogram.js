// lcars-hypnogram.js
//
// Per-segment sleep hypnogram (Awake / REM / Core / Deep) over the night's
// timeline. Per spec LCARS-SICKBAY-TAB-REDESIGN-SPEC.md §4.2.
//
// Default placement: BIOMEDICAL row 5 with `suppressTimestamps=true` (totals
// only, no clock times — Worf S2-10). When `dashboard_options.sickbay_sleep_tab`
// is on, the parent moves the component to the SLEEP tab and clears the
// suppress flag.
//
// Data contract: HAI v1.1.0 attributes on
//   sensor.health_auto_import_health_metrics_sleep_analysis_latest
// (see plans/health-auto-import-data-contract.md §2.2 + handback).
// Degraded fallback when `segments[]` is absent: single stacked horizontal
// bar with deep/rem/core/awake widths proportional to totals (no timeline).
//
// PRIVACY (Worf W5 / W6 / §7.8):
//   - Shadow host carries `data-medical="phi"`.
//   - Numeric PHI in `aria-label` is silenced by default (Worf W7).
//   - Truncation degraded-mode honored (typeof attrs === 'string').

import { LitElement, html, css, svg } from 'lit-element';

const STAGE_ORDER = ['awake', 'rem', 'core', 'deep'];
const STAGE_LABEL = {
  awake: 'AWAKE',
  rem:   'REM',
  core:  'CORE',
  deep:  'DEEP',
};
const STAGE_COLOR = {
  awake: 'var(--lcars-color-warning, #ffaa66)',
  rem:   'var(--lcars-violet-creme, #cca0cc)',
  core:  'var(--lcars-color-nominal, #99cccc)',
  deep:  'var(--lcars-color-nominal-deep, #3399cc)',
};

const normalizeStage = (s) => {
  if (!s || typeof s !== 'string') return null;
  const k = s.toLowerCase();
  if (k === 'awake' || k === 'rem' || k === 'core' || k === 'deep') return k;
  return null;
};

const fmtClock = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const MONTHS_SHORT = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
const fmtDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return '';
  return `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}`;
};

const fmtDuration = (mins) => {
  if (!Number.isFinite(mins) || mins < 0) return '';
  const h = Math.floor(mins / 60);
  const m = Math.round(mins - h * 60);
  if (h === 0) return `${m}M`;
  if (m === 0) return `${h}H`;
  return `${h}H ${m}M`;
};

class LcarsHypnogram extends LitElement {
  static get properties() {
    return {
      // HAI attrs: { segments[], time_asleep_min, time_in_bed_min, efficiency_pct,
      //              sleep_score?, night_start?, night_end?, lcars_schema_version }
      sleepAttrs: { type: Object },
      suppressTimestamps: { type: Boolean },
      // 5.15.0-beta.7 — recent nights list for multi-day display
      sleepHistory: { type: Array },
      cacheRevision: { type: Number },
    };
  }

  createRenderRoot() {
    const root = this.attachShadow({ mode: 'open' });
    this.setAttribute('data-medical', 'phi');
    return root;
  }

  constructor() {
    super();
    this.sleepAttrs = null;
    this.suppressTimestamps = true;
    this.sleepHistory = null;
    this.cacheRevision = 0;
    this._segmentsCache = null;
    this._segmentsCacheKey = null;
  }

  _disposeCaches() {
    this._segmentsCache = null;
    this._segmentsCacheKey = null;
  }

  updated(changedProps) {
    if (changedProps.has('cacheRevision') || changedProps.has('sleepAttrs')) {
      this._disposeCaches();
    }
  }

  _hasVerifiedSchema() {
    const a = this.sleepAttrs;
    return a && typeof a === 'object' && a.lcars_schema_version === '1';
  }

  _isTruncated() {
    return typeof this.sleepAttrs === 'string';
  }

  _normalizedSegments() {
    const a = this.sleepAttrs;
    if (!a || typeof a !== 'object' || !Array.isArray(a.segments)) return null;
    if (this._segmentsCache && this._segmentsCacheKey === a.segments) {
      return this._segmentsCache;
    }
    const out = [];
    for (const s of a.segments) {
      if (!s || typeof s !== 'object') continue;
      const stage = normalizeStage(s.stage);
      const startMs = Date.parse(s.start);
      const endMs   = Date.parse(s.end);
      if (!stage || !Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs) continue;
      out.push({ stage, startMs, endMs });
    }
    out.sort((p, q) => p.startMs - q.startMs);
    this._segmentsCache = out;
    this._segmentsCacheKey = a.segments;
    return out;
  }

  _renderHeader() {
    const a = this.sleepAttrs && typeof this.sleepAttrs === 'object' ? this.sleepAttrs : null;
    const asleepM = a && Number.isFinite(a.time_asleep_min) ? a.time_asleep_min : null;
    const inBedM  = a && Number.isFinite(a.time_in_bed_min) ? a.time_in_bed_min : null;
    const effRaw  = a && Number.isFinite(a.efficiency_pct) ? a.efficiency_pct : null;
    // 5.15.0-beta.2: HAI / Apple Health occasionally ship efficiency_pct > 100
    // when a multi-day window is aggregated (or when time_asleep_min exceeds
    // time_in_bed_min due to overlapping nap sessions). Clamp display at 100%
    // — anything above is a data quality issue, not a renderable value.
    const effPct = effRaw != null ? Math.min(100, Math.max(0, effRaw)) : null;
    const parts = ['SLEEP'];
    if (asleepM != null) parts.push(`${fmtDuration(asleepM)} ASLEEP`);
    if (inBedM  != null) parts.push(`${fmtDuration(inBedM)} IN BED`);
    if (effPct  != null) parts.push(`${Math.round(effPct)}% EFFICIENCY`);
    // 5.15.0-beta.7 — show night date (e.g. “MAY 23”) from night_end or night_start
    const nightIso = a && (a.night_end || a.night_start);
    const nightDate = fmtDate(nightIso);
    if (nightDate) parts.push(nightDate);
    if (!this.suppressTimestamps && a && a.night_start && a.night_end) {
      parts.push(`${fmtClock(a.night_start)}–${fmtClock(a.night_end)}`);
    }
    return html`<div class="hp-header" data-medical="phi">${parts.join(' · ')}</div>`;
  }

  // Per-segment timeline render (the "real" hypnogram, when segments are present).
  _renderTimeline(segments) {
    const a = this.sleepAttrs;
    const t0 = Math.min(segments[0].startMs, a.night_start ? Date.parse(a.night_start) : segments[0].startMs);
    const tN = Math.max(segments[segments.length - 1].endMs, a.night_end ? Date.parse(a.night_end) : segments[segments.length - 1].endMs);
    const span = tN - t0;
    if (!(span > 0)) return null;
    const VIEW_W = 600;
    const ROW_H = 24;
    const ROW_GAP = 2;
    const TOTAL_H = STAGE_ORDER.length * (ROW_H + ROW_GAP);
    const rows = STAGE_ORDER.map((stage, idx) => {
      const y = idx * (ROW_H + ROW_GAP);
      const stageSegs = segments.filter((s) => s.stage === stage);
      // 5.15.0-beta.4: use svg`` so children land in SVG namespace and render.
      return svg`
        <g>
          <text x="0" y=${y + ROW_H / 2 + 4} font-size="10"
                fill="var(--lcars-gray, #aaaadd)"
                style="text-transform:uppercase;letter-spacing:0.08em;">
            ${STAGE_LABEL[stage]}
          </text>
          <rect x="48" y=${y} width=${VIEW_W - 48} height=${ROW_H}
                fill="rgba(255,255,255,0.03)" rx="2"></rect>
          ${stageSegs.map((s) => {
            const x = 48 + ((s.startMs - t0) / span) * (VIEW_W - 48);
            const w = Math.max(1, ((s.endMs - s.startMs) / span) * (VIEW_W - 48));
            return svg`<rect x=${x} y=${y} width=${w} height=${ROW_H}
                              fill=${STAGE_COLOR[stage]} rx="2"></rect>`;
          })}
        </g>`;
    });
    return html`
      <svg viewBox="0 0 ${VIEW_W} ${TOTAL_H}" preserveAspectRatio="none"
           class="hp-chart" aria-hidden="true">
        ${rows}
      </svg>
    `;
  }

  // Degraded stacked-bar render (totals only, no timestamps).
  // Used when segments[] is absent or empty.
  _renderStackedBar() {
    const a = this.sleepAttrs && typeof this.sleepAttrs === 'object' ? this.sleepAttrs : null;
    if (!a) return null;
    // Try to harvest per-stage totals — HAI doesn't ship these directly, but
    // Oura/other source attributes may. Fall back to a single ASLEEP bar
    // proportional to efficiency.
    const asleepM = Number.isFinite(a.time_asleep_min) ? a.time_asleep_min : null;
    const inBedM  = Number.isFinite(a.time_in_bed_min) ? a.time_in_bed_min : null;
    if (!asleepM || !inBedM || asleepM <= 0 || inBedM <= 0) return null;
    const asleepPct = Math.min(100, Math.max(0, (asleepM / inBedM) * 100));
    const awakePct  = Math.max(0, 100 - asleepPct);
    return html`
      <div class="hp-fallback" aria-hidden="true">
        <div class="hp-bar">
          <span class="hp-bar-seg" style=${`width:${asleepPct}%;background:${STAGE_COLOR.core};`}></span>
          ${awakePct > 0 ? html`<span class="hp-bar-seg" style=${`width:${awakePct}%;background:${STAGE_COLOR.awake};`}></span>` : ''}
        </div>
        <div class="hp-fallback-legend">
          TOTALS ONLY · PER-SEGMENT DATA UNAVAILABLE
        </div>
      </div>
    `;
  }

  // 5.15.0-beta.7 — compact table of recent nights below the main hypnogram.
  // Shows up to 7 prior nights (index 1+ from the history array).
  _renderHistoryRows() {
    const hist = this.sleepHistory;
    if (!Array.isArray(hist) || hist.length < 2) return '';
    const rows = hist.slice(1, 8);
    if (!rows.length) return '';
    return html`
      <div class="hp-history">
        <div class="hp-history-cap">RECENT NIGHTS</div>
        ${rows.map((item) => {
          const a = item.sleepAttrs;
          if (!a) return '';
          const asleepM = Number.isFinite(a.time_asleep_min) ? a.time_asleep_min : null;
          const nightIso = a.night_end || a.night_start || item.recordedAt;
          const date = fmtDate(nightIso);
          const time = fmtClock(nightIso);
          const dur  = asleepM != null ? fmtDuration(asleepM) : null;
          return html`
            <div class="hp-hist-row" data-medical="phi">
              <span class="hp-hist-date">${date}${time ? html` <span class="hp-hist-time">${time}</span>` : ''}</span>
              ${dur ? html`<span class="hp-hist-dur">${dur} ASLEEP</span>` : ''}
            </div>`;
        })}
      </div>
    `;
  }

  render() {
    if (this._isTruncated()) {
      return html`<section role="figure" aria-label="Sleep hypnogram">
        ${this._renderHeader()}
        <div class="hp-empty">SLEEP · DATA TRUNCATED</div>
      </section>`;
    }
    if (!this.sleepAttrs) {
      return html`<section role="figure" aria-label="Sleep hypnogram">
        <div class="hp-empty">SLEEP · NO DATA</div>
        ${this._renderHistoryRows()}
      </section>`;
    }
    // Schema-mismatch: HAI didn't ship the v2 contract. Fall back to totals-only
    // stacked bar if time_asleep_min + time_in_bed_min are present (those
    // attributes pre-date the v2 contract).
    if (!this._hasVerifiedSchema()) {
      const stacked = this._renderStackedBar();
      return html`<section role="figure" aria-label="Sleep hypnogram">
        ${this._renderHeader()}
        ${stacked || html`<div class="hp-empty">SLEEP · WAVEFORM UNAVAILABLE</div>`}
        ${this._renderHistoryRows()}
      </section>`;
    }
    const segs = this._normalizedSegments();
    if (!segs || segs.length === 0) {
      const stacked = this._renderStackedBar();
      return html`<section role="figure" aria-label="Sleep hypnogram">
        ${this._renderHeader()}
        ${stacked || html`<div class="hp-empty">SLEEP · NO SEGMENTS</div>`}
        ${this._renderHistoryRows()}
      </section>`;
    }
    return html`<section role="figure" aria-label="Sleep hypnogram">
      ${this._renderHeader()}
      ${this._renderTimeline(segs)}
      ${this._renderHistoryRows()}
    </section>`;
  }

  static get styles() {
    return css`
      :host {
        display: block;
        font-family: var(--lcars-font, 'Antonio', sans-serif);
        color: var(--lcars-text, #ccccee);
      }
      section { display: flex; flex-direction: column; gap: 0.4rem; }
      .hp-header {
        font-size: 0.75rem; letter-spacing: 0.12em; text-transform: uppercase;
        color: var(--lcars-gold, #ffcc66); font-variant-numeric: tabular-nums;
      }
      .hp-chart {
        width: 100%; min-height: 110px; max-height: 140px; display: block;
        background: rgba(0, 0, 0, 0.4); border-radius: 0.3rem; padding: 0.4rem;
      }
      .hp-empty {
        padding: 1rem 0.75rem;
        text-align: center;
        font-size: 0.8rem;
        letter-spacing: 0.12em;
        color: var(--lcars-gray, #888899);
        text-transform: uppercase;
        background: rgba(102, 102, 136, 0.06);
        border-left: 3px solid var(--lcars-gray, #666688);
        border-radius: 0 0.3rem 0.3rem 0;
      }
      .hp-fallback { display: flex; flex-direction: column; gap: 0.3rem; }
      .hp-bar {
        display: flex; height: 18px; width: 100%;
        background: rgba(255,255,255,0.04); border-radius: 999px;
        overflow: hidden;
      }
      .hp-bar-seg { display: block; height: 100%; }
      .hp-fallback-legend {
        font-size: 0.65rem; letter-spacing: 0.1em; text-transform: uppercase;
        color: var(--lcars-gray, #888899);
      }
      /* 5.15.0-beta.7 — recent nights history list */
      .hp-history {
        display: flex; flex-direction: column; gap: 0.2rem;
        margin-top: 0.35rem;
        border-top: 1px solid rgba(153,204,255,0.12);
        padding-top: 0.35rem;
      }
      .hp-history-cap {
        font-size: 0.6rem; letter-spacing: 0.15em; text-transform: uppercase;
        color: var(--lcars-gray, #888899); margin-bottom: 0.15rem;
      }
      .hp-hist-row {
        display: flex; align-items: baseline; gap: 0.6rem;
        font-size: 0.7rem; letter-spacing: 0.08em;
        padding: 0.15rem 0;
        border-bottom: 1px solid rgba(255,255,255,0.04);
      }
      .hp-hist-row:last-child { border-bottom: none; }
      .hp-hist-date {
        font-size: 0.65rem; color: var(--lcars-violet-creme, #cca0cc);
        font-variant-numeric: tabular-nums; white-space: nowrap;
        min-width: 6ch;
      }
      .hp-hist-time {
        color: var(--lcars-gray, #aaaadd);
      }
      .hp-hist-dur {
        color: var(--lcars-text, #ccccee);
        font-variant-numeric: tabular-nums;
      }
    `;
  }
}

if (!customElements.get('lcars-hypnogram')) {
  customElements.define('lcars-hypnogram', LcarsHypnogram);
}
