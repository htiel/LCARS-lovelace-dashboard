// lcars-ecg-strip.js
//
// LCARS analog of the Apple Health ECG measurement screen. Current-reading
// only — the history list was dropped per Worf S0-3 (contradicts the
// `recorder.exclude` privacy recommendation). Per spec
// LCARS-SICKBAY-TAB-REDESIGN-SPEC.md §4.1.
//
// Renders three rows:
//   1. Classification banner   (~32 px)  — pill, color by class
//   2. Waveform card           (~120 px) — SVG <polyline> over LCARS dot grid
//   3. Footer pill row         (~28 px)  — status segment + notifications segment
//
// Data contract: HAI v1.1.0 attributes on
//   sensor.health_auto_import_heart_ecg_voltage_measurements
// (see plans/health-auto-import-data-contract.md §2.1 + handback).
//
// PRIVACY (Worf W4 / W6 / §7.7 / §7.8 / §7.10):
//   - Waveform render is two-layer AND-gated:
//       (a) base `consent` (parent §7.5) — already enforced by parent card
//       (b) `consent.ecg` (this spec §7.7) — second-layer waveform consent
//     When (b) is false: banner + footer still render (classification +
//     BPM + sanitized source + timestamp + notifications). Waveform card
//     is replaced with a consent-gate pill. **Voltage samples never reach
//     the DOM in this state — they are not even bound into a template.**
//   - Shadow host carries `data-medical="phi"`. The closed-shadow-root
//     pattern protects only the rendered surface, not the source
//     hass.states attribute (Worf S0-2 trust-boundary doctrine).
//   - `source` device name is allowlist-filtered: ASCII alphanumerics,
//     spaces, dashes only. Anything else collapses to "UNKNOWN DEVICE".
//   - Numeric PHI in `aria-label` is silenced by default (Worf W7).
//   - LTTB-downsampled polyline cache keyed on (sample array reference,
//     viewBox width, target bucket count) per Data CR-5 — NOT on theme
//     color. `_disposeCaches()` runs on every W6 trigger.
//   - Schema-mismatch state: when HAI omits `lcars_schema_version: "1"`,
//     the contract is treated as unverified — waveform replaced with
//     `ECG · WAVEFORM UNAVAILABLE` and banner/footer fall back to the
//     simpler classification/BPM sensors that carry no schema risk.
//   - Truncation degraded-mode: when HAI ships
//     `typeof attrs === 'string'`, the entire attribute dict was replaced
//     by `(truncated — too large for entity attributes)`. Waveform replaced
//     with `ECG · DATA TRUNCATED`. Banner/footer still render from sibling
//     entities (classification + average_bpm + duration + sampling_frequency).

import { LitElement, html, css, svg } from 'lit-element';

// Allowlist for device-name source string (Worf §7.8 / spec §4.1 footer).
const SOURCE_SAFE_RE = /^[A-Za-z0-9 \-]+$/;
const sanitizeSource = (s) => {
  if (typeof s !== 'string' || !s) return null;
  return SOURCE_SAFE_RE.test(s) && s.length <= 64 ? s : 'UNKNOWN DEVICE';
};

// Classification → display label + color token.
const CLASS_DISPLAY = {
  sinusRhythm:         { label: 'NORMAL SINUS RHYTHM',    color: 'var(--lcars-color-nominal, #99cc99)' },
  atrialFibrillation:  { label: 'ATRIAL FIBRILLATION',    color: 'var(--lcars-color-alert, #cc6666)'   },
  highHeartRate:       { label: 'HIGH HEART RATE',        color: 'var(--lcars-color-warning, #ffaa66)' },
  lowHeartRate:        { label: 'LOW HEART RATE',         color: 'var(--lcars-color-warning, #ffaa66)' },
  inconclusive:        { label: 'INCONCLUSIVE',           color: 'var(--lcars-gray, #888899)'          },
  // HAI may pass classification verbatim from HealthKit; cover common
  // alternate snake-case forms.
  sinus:               { label: 'NORMAL SINUS RHYTHM',    color: 'var(--lcars-color-nominal, #99cc99)' },
  afib:                { label: 'ATRIAL FIBRILLATION',    color: 'var(--lcars-color-alert, #cc6666)'   },
  high:                { label: 'HIGH HEART RATE',        color: 'var(--lcars-color-warning, #ffaa66)' },
  low:                 { label: 'LOW HEART RATE',         color: 'var(--lcars-color-warning, #ffaa66)' },
};

const classifyDisplay = (c) => {
  if (!c || typeof c !== 'string') return null;
  const key = c.replace(/[\s_]+/g, '').toLowerCase();
  // Try canonical (sinusRhythm, atrialFibrillation, etc.) first.
  for (const k of Object.keys(CLASS_DISPLAY)) {
    if (k.toLowerCase() === key) return CLASS_DISPLAY[k];
  }
  return null;
};

// LTTB (Largest Triangle Three Buckets) — preserves visual peaks.
// O(N), single pass, returns `targetBuckets` points.
const lttbDownsample = (samples, targetBuckets) => {
  if (!samples || samples.length <= targetBuckets || targetBuckets < 3) {
    return samples ? Array.from(samples) : [];
  }
  const n = samples.length;
  const bucketSize = (n - 2) / (targetBuckets - 2);
  const sampled = new Array(targetBuckets);
  sampled[0] = { i: 0, y: samples[0] };
  let a = 0;
  for (let i = 0; i < targetBuckets - 2; i++) {
    const rangeStart = Math.floor((i + 1) * bucketSize) + 1;
    const rangeEnd   = Math.min(Math.floor((i + 2) * bucketSize) + 1, n);
    // Average of next bucket
    let avgX = 0, avgY = 0;
    const avgRangeStart = rangeStart;
    const avgRangeEnd   = rangeEnd;
    const avgRangeLen   = avgRangeEnd - avgRangeStart;
    if (avgRangeLen <= 0) {
      sampled[i + 1] = { i: rangeStart, y: samples[rangeStart] || 0 };
      a = rangeStart;
      continue;
    }
    for (let k = avgRangeStart; k < avgRangeEnd; k++) {
      avgX += k;
      avgY += samples[k];
    }
    avgX /= avgRangeLen;
    avgY /= avgRangeLen;
    // Point-A is the previously selected sample
    const ax = a;
    const ay = samples[a];
    // Pick the point in the current bucket that forms the largest triangle
    // with point-A and the average of the next bucket.
    const curStart = Math.floor(i * bucketSize) + 1;
    const curEnd   = Math.floor((i + 1) * bucketSize) + 1;
    let maxArea = -1;
    let nextA = curStart;
    for (let k = curStart; k < curEnd; k++) {
      const area = Math.abs((ax - avgX) * (samples[k] - ay) - (ax - k) * (avgY - ay)) * 0.5;
      if (area > maxArea) { maxArea = area; nextA = k; }
    }
    sampled[i + 1] = { i: nextA, y: samples[nextA] };
    a = nextA;
  }
  sampled[targetBuckets - 1] = { i: n - 1, y: samples[n - 1] };
  return sampled;
};

// Format an ISO date as `YYYY-MM-DD HH:MM` (local TZ).
const fmtTimestamp = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// `Xh ago` / `Nd ago` short ISO-relative.
const fmtAgo = (iso) => {
  if (!iso) return '';
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return '';
  const mins = Math.floor((Date.now() - t) / 60000);
  if (mins < 1)   return 'JUST NOW';
  if (mins < 60)  return `${mins}M AGO`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs}H AGO`;
  const days = Math.floor(hrs / 24);
  return `${days}D AGO`;
};

class LcarsEcgStrip extends LitElement {
  static get properties() {
    return {
      // Voltage attribute payload from HAI
      // sensor.health_auto_import_heart_ecg_voltage_measurements
      voltageAttrs: { type: Object },
      // Fallback values from sibling sensors (always populated, no schema risk)
      classification: { type: String },
      avgBpm: { type: Number },
      durationS: { type: Number },
      samplingHz: { type: Number },
      lastTakenIso: { type: String },
      source: { type: String },
      // Per-profile consent gate (this is the AND-of-base + ECG layer; parent
      // hands in the final boolean so the primitive does not need to read
      // localStorage itself).
      consent: { type: Boolean },
      // Notifications composite (folded into footer per Geordi C8).
      hrAlerts: { type: Object },
      // W6 cache flush ticker from parent.
      cacheRevision: { type: Number },
      // Toggle UI callback — primitive emits an event on click.
      consentToggleEnabled: { type: Boolean },
      _expanded: { type: Boolean, state: true },
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
    this.voltageAttrs = null;
    this.classification = null;
    this.avgBpm = NaN;
    this.durationS = NaN;
    this.samplingHz = NaN;
    this.lastTakenIso = null;
    this.source = null;
    this.consent = false;
    this.hrAlerts = null;
    this.cacheRevision = 0;
    this.consentToggleEnabled = true;
    this._expanded = false;
    this._polylinePointsCache = null;
    this._polylineCacheKey = null;
  }

  // W6 dispose: keep this exposed so the parent can call it explicitly on
  // unmount/profile-switch even when cacheRevision wiring is bypassed.
  _disposeCaches() {
    this._polylinePointsCache = null;
    this._polylineCacheKey = null;
  }

  updated(changedProps) {
    if (changedProps.has('cacheRevision')) {
      this._disposeCaches();
    }
    // Wipe cache when underlying sample array reference changes (W6 §7.9).
    if (changedProps.has('voltageAttrs')) {
      this._disposeCaches();
    }
  }

  // Schema probe — voltage attrs only trusted when HAI shipped lcars_schema_version: "1".
  _hasVerifiedSchema() {
    const a = this.voltageAttrs;
    if (!a || typeof a !== 'object') return false;
    return a.lcars_schema_version === '1';
  }

  _isTruncated() {
    return typeof this.voltageAttrs === 'string';
  }

  _voltageArray() {
    const a = this.voltageAttrs;
    if (!a || typeof a !== 'object') return null;
    return Array.isArray(a.voltage_uv) ? a.voltage_uv : null;
  }

  _polylinePoints(viewW, viewH) {
    const samples = this._voltageArray();
    if (!samples || samples.length < 2) return null;
    const target = Math.min(1200, samples.length);
    const key = `${samples.length}_${viewW}_${viewH}_${target}`;
    if (this._polylineCacheKey === key && this._polylinePointsCache) {
      return this._polylinePointsCache;
    }
    // Auto-scale: peak-to-peak fills ~80% of card height.
    let lo = Infinity, hi = -Infinity;
    for (let i = 0; i < samples.length; i++) {
      const v = samples[i];
      if (!Number.isFinite(v)) continue;
      if (v < lo) lo = v;
      if (v > hi) hi = v;
    }
    if (!Number.isFinite(lo) || !Number.isFinite(hi) || hi === lo) return null;
    const yScale = (viewH * 0.8) / (hi - lo);
    const yMid = viewH / 2;
    // Downsample with LTTB
    const downsampled = lttbDownsample(samples, target);
    const n = downsampled.length;
    const xStep = viewW / Math.max(1, n - 1);
    const parts = new Array(n);
    for (let i = 0; i < n; i++) {
      const pt = downsampled[i];
      const x = i * xStep;
      const y = yMid - (pt.y - (lo + hi) / 2) * yScale;
      // Round to 0.1 to keep the points attribute lean.
      parts[i] = `${x.toFixed(1)},${y.toFixed(1)}`;
    }
    const out = parts.join(' ');
    this._polylinePointsCache = out;
    this._polylineCacheKey = key;
    return out;
  }

  _renderBanner(cls, bpm, duration, ago) {
    const display = cls || { label: 'NO READING', color: 'var(--lcars-gray, #888899)' };
    const bpmTxt = Number.isFinite(bpm) ? `${Math.round(bpm)} BPM` : '— BPM';
    const durTxt = Number.isFinite(duration) ? `${Math.round(duration)} SEC` : '— SEC';
    const agoTxt = ago ? ` · ${ago}` : '';
    return html`
      <div class="banner" style=${`background:${display.color};`}>
        <span class="banner-text" data-medical="phi">
          ECG · ${display.label} · ${bpmTxt} · ${durTxt}${agoTxt}
        </span>
      </div>
    `;
  }

  _renderWaveformCard() {
    // Three-state ladder: truncated → schema-mismatch → no-consent → ok
    if (this._isTruncated()) {
      return html`<div class="waveform-empty">ECG · DATA TRUNCATED</div>`;
    }
    if (!this._hasVerifiedSchema()) {
      return html`<div class="waveform-empty">ECG · WAVEFORM UNAVAILABLE</div>`;
    }
    if (!this.consent) {
      return html`
        <div class="waveform-empty consent">
          WAVEFORM CONSENT NOT GIVEN
          ${this.consentToggleEnabled ? html`
            <button class="consent-pill"
                    @click=${() => this._onConsentToggle()}
                    aria-label="Enable ECG waveform display">
              ENABLE WAVEFORM »
            </button>
          ` : html`<span class="consent-hint">ENABLE IN PROFILE SETTINGS</span>`}
        </div>`;
    }
    const VIEW_W = 600;
    const VIEW_H = 120;
    const points = this._polylinePoints(VIEW_W, VIEW_H);
    if (!points) {
      return html`<div class="waveform-empty">ECG · NO DATA</div>`;
    }
    // Decorative LCARS dot grid: vertical 12 columns × horizontal 5 rows.
    // Pure SVG <line>s; no animation, no glow.
    // 5.15.0-beta.4: must use svg`` template tag (not html``) so children
    // are created in the SVG namespace and actually render.
    const gridV = [];
    for (let i = 1; i < 12; i++) {
      const x = (VIEW_W / 12) * i;
      gridV.push(svg`<line x1=${x} x2=${x} y1="0" y2=${VIEW_H}
                            stroke="var(--lcars-color-grid, rgba(153,204,255,0.10))"
                            stroke-width="0.5"></line>`);
    }
    const gridH = [];
    for (let i = 1; i < 5; i++) {
      const y = (VIEW_H / 5) * i;
      gridH.push(svg`<line x1="0" x2=${VIEW_W} y1=${y} y2=${y}
                            stroke="var(--lcars-color-grid, rgba(153,204,255,0.10))"
                            stroke-width="0.5"></line>`);
    }
    const polyline = svg`<polyline points=${points}
                  fill="none"
                  stroke="var(--lcars-data-accent, #99cc99)"
                  stroke-width="1.5"
                  stroke-linejoin="round"
                  stroke-linecap="round"></polyline>`;
    return html`
      <div class="waveform-card">
        <svg viewBox="0 0 ${VIEW_W} ${VIEW_H}" preserveAspectRatio="none"
             class="waveform" aria-hidden="true">
          ${gridV}
          ${gridH}
          ${polyline}
        </svg>
      </div>
    `;
  }

  _renderFooter(safeSource, ts, classDisplay, bpm, duration) {
    const segA = [];
    segA.push('STATUS');
    if (classDisplay) segA.push(classDisplay.label);
    if (Number.isFinite(bpm)) segA.push(`${Math.round(bpm)} BPM`);
    if (Number.isFinite(duration)) segA.push(`${Math.round(duration)} SEC`);
    if (safeSource) segA.push(safeSource);
    if (ts) segA.push(ts);
    const a = this.hrAlerts;
    const segBVisible = a && (Number.isFinite(a.high7d) || Number.isFinite(a.low7d) || Number.isFinite(a.irreg7d));
    return html`
      <div class="footer-row">
        <span class="footer-seg" data-medical="phi">
          ${segA.filter(Boolean).join(' · ')}
        </span>
        ${segBVisible ? html`
          <span class="footer-seg notify" data-medical="phi">
            NOTIFICATIONS · ${a.high7d ?? 0} HIGH · ${a.low7d ?? 0} LOW · ${a.irreg7d ?? 0} IRREG (7D)
          </span>
        ` : ''}
      </div>
    `;
  }

  _onConsentToggle() {
    this.dispatchEvent(new CustomEvent('lcars-ecg-consent-request', {
      bubbles: true,
      composed: true,
    }));
  }

  render() {
    const classDisplay = classifyDisplay(this.classification);
    const safeSource = sanitizeSource(this.source);
    const ts = fmtTimestamp(this.lastTakenIso);
    const ago = fmtAgo(this.lastTakenIso);
    return html`
      <section role="figure" aria-label="ECG measurement">
        ${this._renderBanner(classDisplay, this.avgBpm, this.durationS, ago)}
        ${this._renderWaveformCard()}
        ${this._renderFooter(safeSource, ts, classDisplay, this.avgBpm, this.durationS)}
      </section>
    `;
  }

  static get styles() {
    return css`
      :host {
        display: block;
        font-family: var(--lcars-font, 'Antonio', sans-serif);
        color: var(--lcars-text, #ccccee);
      }
      section {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
      }
      .banner {
        height: 32px;
        display: flex; align-items: center; justify-content: center;
        border-radius: 0.3rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-size: 0.85rem;
        color: #000;
        font-variant-numeric: tabular-nums;
      }
      .banner-text { font-weight: 700; }
      .waveform-card {
        position: relative;
        width: 100%;
        height: 120px;
        background: rgba(0, 0, 0, 0.65);
        border-radius: 0.3rem;
        border-left: 3px solid var(--lcars-color-nominal, #99cc99);
      }
      .waveform {
        width: 100%; height: 100%; display: block;
      }
      .waveform-empty {
        height: 64px;
        display: flex; align-items: center; justify-content: center; gap: 0.6rem;
        background: rgba(102, 102, 136, 0.06);
        border-left: 3px solid var(--lcars-gray, #666688);
        border-radius: 0 0.3rem 0.3rem 0;
        font-size: 0.85rem;
        letter-spacing: 0.12em;
        color: var(--lcars-gray, #aaaadd);
        text-transform: uppercase;
      }
      .waveform-empty.consent {
        border-left-color: var(--lcars-gold, #ffaa00);
      }
      .consent-pill {
        background: var(--lcars-gold, #ffaa00);
        color: #000;
        font-family: inherit;
        font-weight: 700;
        font-size: 0.75rem;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        padding: 0.25rem 0.8rem;
        border: none;
        border-radius: 999px;
        cursor: pointer;
      }
      .consent-pill:focus-visible {
        outline: 2px solid var(--lcars-ice, #99ccff);
        outline-offset: 2px;
      }
      .consent-hint {
        font-size: 0.7rem;
        opacity: 0.7;
      }
      .footer-row {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem 0.8rem;
        font-size: 0.7rem;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--lcars-gray, #aaaadd);
        font-variant-numeric: tabular-nums;
      }
      .footer-seg.notify {
        color: var(--lcars-gold, #ffcc66);
      }
    `;
  }
}

if (!customElements.get('lcars-ecg-strip')) {
  customElements.define('lcars-ecg-strip', LcarsEcgStrip);
}
