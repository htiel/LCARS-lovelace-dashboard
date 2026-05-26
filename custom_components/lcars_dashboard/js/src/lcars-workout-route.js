// lcars-workout-route.js
//
// Workout GPS route — Google-encoded polyline string decoded inside the
// closed shadow root and rendered as a single <polyline> over a faint
// LCARS grid backdrop. Per spec LCARS-SICKBAY-TAB-REDESIGN-SPEC.md §4.5.
//
// Data contract: HAI v1.1.0 attribute `route_compressed` on
//   sensor.health_auto_import_workouts_workout_last_started
// (see plans/health-auto-import-data-contract.md §2.4 + handback).
//
// PRIVACY (Worf S0-2 / W2 / W6 / §7.8 / §7.10):
//   - The component accepts an ENCODED POLYLINE STRING, NOT raw {lat,lon}[].
//     This is non-negotiable per Worf S0-2. The HAI v1.1.0 handback ships
//     only encoded form; this primitive must reject anything else.
//   - Lat/lon coordinates exist transiently inside the closed shadow root
//     during decode; they are never bound to a template and are discarded
//     after normalization to the SVG viewBox. No text rendering of
//     coordinates anywhere (Worf W2).
//   - Shadow host carries `data-medical="phi"` so the screenshot obfuscator
//     blackouts the route surface.
//   - Numeric PHI in `aria-label` is silenced by default (Worf W7).
//   - Truncation degraded-mode honored (typeof attrs === 'string').

import { LitElement, html, css } from 'lit-element';

// Google polyline algorithm decoder — in-house, ~30 lines, no external dep.
// https://developers.google.com/maps/documentation/utilities/polylinealgorithm
const decodePolyline = (s) => {
  if (typeof s !== 'string' || s.length === 0) return null;
  const out = [];
  let i = 0;
  let lat = 0;
  let lng = 0;
  const len = s.length;
  while (i < len) {
    let result = 0;
    let shift = 0;
    let b;
    do {
      if (i >= len) return null;
      b = s.charCodeAt(i++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = (result & 1) ? ~(result >> 1) : (result >> 1);
    lat += dlat;
    result = 0;
    shift = 0;
    do {
      if (i >= len) return null;
      b = s.charCodeAt(i++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = (result & 1) ? ~(result >> 1) : (result >> 1);
    lng += dlng;
    out.push([lat * 1e-5, lng * 1e-5]);
  }
  return out.length ? out : null;
};

const fmtClock = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const fmtDistance = (m) => {
  if (!Number.isFinite(m) || m <= 0) return '';
  if (m >= 1000) return `${(m / 1000).toFixed(2)} KM`;
  return `${Math.round(m)} M`;
};

const fmtDurationS = (s) => {
  if (!Number.isFinite(s) || s <= 0) return '';
  const totalMin = Math.round(s / 60);
  const h = Math.floor(totalMin / 60);
  const m = totalMin - h * 60;
  if (h === 0) return `${m} MIN`;
  if (m === 0) return `${h}H`;
  return `${h}H ${m}M`;
};

const fmtPace = (distM, durS) => {
  if (!Number.isFinite(distM) || distM <= 0) return '';
  if (!Number.isFinite(durS) || durS <= 0) return '';
  const secPerKm = (durS / distM) * 1000;
  const mm = Math.floor(secPerKm / 60);
  const ss = Math.round(secPerKm - mm * 60);
  return `${mm}:${String(ss).padStart(2, '0')} /KM`;
};

class LcarsWorkoutRoute extends LitElement {
  static get properties() {
    return {
      // HAI attrs: { route_compressed, distance_m, duration_s, workout_type,
      //              lcars_schema_version }
      workoutAttrs: { type: Object },
      startedIso: { type: String },
      endedIso: { type: String },
      cacheRevision: { type: Number },
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
    this.workoutAttrs = null;
    this.startedIso = null;
    this.endedIso = null;
    this.cacheRevision = 0;
    this._pointsCache = null;
    this._pointsCacheKey = null;
  }

  _disposeCaches() {
    // Wipe the decoded polyline. Lat/lon values must not survive a profile
    // switch / consent toggle / right-to-erase (W6 + Worf S1-7).
    this._pointsCache = null;
    this._pointsCacheKey = null;
  }

  updated(changedProps) {
    if (changedProps.has('cacheRevision') || changedProps.has('workoutAttrs')) {
      this._disposeCaches();
    }
  }

  _hasVerifiedSchema() {
    const a = this.workoutAttrs;
    return a && typeof a === 'object' && a.lcars_schema_version === '1';
  }

  _isTruncated() {
    return typeof this.workoutAttrs === 'string';
  }

  // Decode the encoded polyline and normalize to a viewBox string.
  // The decoded {lat,lng} pairs live ONLY in this function's local scope —
  // we discard them after building the points string. They are never
  // assigned to `this`, never bound to a Lit template.
  _routePoints(viewW, viewH, pad) {
    const a = this.workoutAttrs;
    if (!a || typeof a !== 'object') return null;
    const encoded = typeof a.route_compressed === 'string' ? a.route_compressed : null;
    if (!encoded) return null;
    const key = `${encoded.length}_${viewW}_${viewH}`;
    if (this._pointsCacheKey === key && this._pointsCache) {
      return this._pointsCache;
    }
    const decoded = decodePolyline(encoded);
    if (!decoded || decoded.length < 2) return null;
    let minLat =  Infinity;
    let maxLat = -Infinity;
    let minLng =  Infinity;
    let maxLng = -Infinity;
    for (const [lat, lng] of decoded) {
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
    }
    const latSpan = maxLat - minLat;
    const lngSpan = maxLng - minLng;
    if (!(latSpan > 0) && !(lngSpan > 0)) return null;
    // Use the larger span to preserve aspect ratio; center the smaller.
    const span = Math.max(latSpan, lngSpan) || 1;
    const usableW = viewW - pad * 2;
    const usableH = viewH - pad * 2;
    const latCenter = (minLat + maxLat) / 2;
    const lngCenter = (minLng + maxLng) / 2;
    const parts = new Array(decoded.length);
    for (let i = 0; i < decoded.length; i++) {
      const [lat, lng] = decoded[i];
      // SVG y grows downward; latitude grows upward; flip.
      const xN = (lng - lngCenter) / span;
      const yN = -(lat - latCenter) / span;
      const x = pad + usableW / 2 + xN * usableW;
      const y = pad + usableH / 2 + yN * usableH;
      parts[i] = `${x.toFixed(1)},${y.toFixed(1)}`;
    }
    // Save start/end positions for markers
    const first = parts[0].split(',').map(Number);
    const last  = parts[parts.length - 1].split(',').map(Number);
    const out = {
      polyline: parts.join(' '),
      startX: first[0], startY: first[1],
      endX:   last[0],  endY:   last[1],
    };
    this._pointsCache = out;
    this._pointsCacheKey = key;
    return out;
  }

  _renderHeader(distM, durS) {
    const a = this.workoutAttrs && typeof this.workoutAttrs === 'object' ? this.workoutAttrs : null;
    const type = a && typeof a.workout_type === 'string' && /^[A-Za-z0-9 \-]+$/.test(a.workout_type)
      ? a.workout_type.toUpperCase() : 'WORKOUT';
    const dist = fmtDistance(distM);
    const dur  = fmtDurationS(durS);
    const pace = fmtPace(distM, durS);
    const parts = [type];
    if (dist) parts.push(dist);
    if (dur)  parts.push(dur);
    if (pace) parts.push(pace);
    return html`<div class="wr-header" data-medical="phi">${parts.join(' · ')}</div>`;
  }

  _renderFooter() {
    const s = fmtClock(this.startedIso);
    const e = fmtClock(this.endedIso);
    if (!s && !e) return '';
    return html`<div class="wr-footer" data-medical="phi">
      ${s ? html`<span>START ${s}</span>` : ''}
      ${e ? html`<span>END ${e}</span>` : ''}
    </div>`;
  }

  render() {
    if (this._isTruncated()) {
      return html`<section role="figure" aria-label="Workout route">
        <div class="wr-empty">WORKOUT · DATA TRUNCATED</div>
      </section>`;
    }
    const a = this.workoutAttrs && typeof this.workoutAttrs === 'object' ? this.workoutAttrs : null;
    // 5.15.0-beta.2: HAI ships an empty `{device_class, friendly_name}` dict
    // when the workout entity is `state: unavailable`. Treat the absence of
    // EVERY meaningful workout field as NO DATA, not as schema-mismatch — the
    // user has no workout, not a contract-version problem.
    const hasAnyWorkoutSignal = a && (
      'route_compressed' in a ||
      'distance_m' in a ||
      'duration_s' in a ||
      'workout_type' in a ||
      'lcars_schema_version' in a
    );
    if (!a || !hasAnyWorkoutSignal) {
      return html`<section role="figure" aria-label="Workout route">
        <div class="wr-empty">WORKOUT · NO DATA</div>
      </section>`;
    }
    const distM = Number.isFinite(a.distance_m) ? a.distance_m : NaN;
    const durS  = Number.isFinite(a.duration_s) ? a.duration_s : NaN;
    if (!this._hasVerifiedSchema()) {
      return html`<section role="figure" aria-label="Workout route">
        ${this._renderHeader(distM, durS)}
        <div class="wr-empty">WORKOUT · ROUTE UNAVAILABLE</div>
        ${this._renderFooter()}
      </section>`;
    }
    const VIEW = 200;
    const PAD = 8;
    const route = this._routePoints(VIEW, VIEW, PAD);
    if (!route) {
      return html`<section role="figure" aria-label="Workout route">
        ${this._renderHeader(distM, durS)}
        <div class="wr-empty">WORKOUT · NO ROUTE</div>
        ${this._renderFooter()}
      </section>`;
    }
    // Decorative LCARS dot grid: 6×6 thin lines
    const grid = [];
    for (let i = 1; i < 6; i++) {
      const v = (VIEW / 6) * i;
      grid.push(html`<line x1=${v} x2=${v} y1="0" y2=${VIEW}
                           stroke="var(--lcars-color-grid, rgba(153,204,255,0.10))"
                           stroke-width="0.5"></line>`);
      grid.push(html`<line x1="0" x2=${VIEW} y1=${v} y2=${v}
                           stroke="var(--lcars-color-grid, rgba(153,204,255,0.10))"
                           stroke-width="0.5"></line>`);
    }
    return html`<section role="figure" aria-label="Workout route">
      ${this._renderHeader(distM, durS)}
      <div class="wr-map">
        <svg viewBox="0 0 ${VIEW} ${VIEW}" preserveAspectRatio="xMidYMid meet"
             class="wr-svg" aria-hidden="true">
          ${grid}
          <polyline points=${route.polyline}
                    fill="none"
                    stroke="var(--lcars-cyan, #99cccc)"
                    stroke-width="2"
                    stroke-linejoin="round"
                    stroke-linecap="round"></polyline>
          <circle cx=${route.startX} cy=${route.startY} r="3.5"
                  fill="none" stroke="var(--lcars-color-nominal, #99cc99)" stroke-width="1.5"></circle>
          <polygon points=${`${route.endX - 3.5},${route.endY + 3} ${route.endX + 3.5},${route.endY + 3} ${route.endX},${route.endY - 3.5}`}
                   fill="var(--lcars-gold, #ffcc66)"></polygon>
        </svg>
      </div>
      ${this._renderFooter()}
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
      .wr-header {
        font-size: 0.75rem; letter-spacing: 0.12em; text-transform: uppercase;
        color: var(--lcars-gold, #ffcc66); font-variant-numeric: tabular-nums;
      }
      .wr-map {
        width: 100%;
        aspect-ratio: 1 / 1;
        max-height: 240px;
        background: rgba(0, 0, 0, 0.55);
        border-radius: 0.3rem;
        border-left: 3px solid var(--lcars-cyan, #99cccc);
        display: flex; align-items: center; justify-content: center;
      }
      .wr-svg { width: 100%; height: 100%; display: block; }
      .wr-empty {
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
      .wr-footer {
        display: flex; gap: 0.9rem;
        font-size: 0.7rem; letter-spacing: 0.12em; text-transform: uppercase;
        color: var(--lcars-gray, #aaaadd); font-variant-numeric: tabular-nums;
      }
    `;
  }
}

if (!customElements.get('lcars-workout-route')) {
  customElements.define('lcars-workout-route', LcarsWorkoutRoute);
}
