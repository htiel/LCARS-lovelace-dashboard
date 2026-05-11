// LCARS Anatomical Silhouette — generalized shared primitive (5.4.0)
//
// Refactored from <lcars-biofunction-silhouette> per
// LCARS-STARSHIP-HEALTH-DASHBOARD-SPEC §8 — the second consumer (Starship Health)
// promotes this primitive to dashboard-neutral.
//
// Inputs are now fully injected:
//   - .paths      — lit-html template of the SVG <g> child paths (silhouette outline)
//   - .anchorMap  — { slot: { x%, y%, label: 'left'|'right'|'top' } }
//   - .anchors    — { slot: { value, status, label } }   (caller-supplied)
//   - .viewBox    — defaults to "0 0 200 480"
//   - .thermal    — boolean overlay enable
//   - .dataAttr   — #219: { name, value } data-* attribute pair applied to value text
//                    nodes for the screenshot-obfuscator tool to find at capture time.
//                    NOT used for runtime redaction — values render in cleartext.
//
// #219 (5.5.8) — runtime CSS-class redaction wiring removed. The dashboard always
// renders real values; the localinfo/screenshot-obfuscator.js tool keys off the
// data-medical / data-starship attributes preserved below.
//
// Closed shadow root preserved (Worf §16). Both consumers (Medical + Starship)
// pass their own anchorMap + paths constants. Backward-compat alias
// <lcars-biofunction-silhouette> is registered for any external user.

import { LitElement, html, svg, css } from 'lit-element';

const STATUS_COLOR = {
  NOMINAL:  'var(--lcars-data-accent, #99cc99)',
  DEGRADED: 'var(--lcars-sky, #aaaaff)',
  ELEVATED: 'var(--lcars-gold, #ffaa00)',
  WARNING:  'var(--lcars-gold, #ffaa00)',
  ALERT:    'var(--lcars-alert, #cc6666)',
  // #177 — distinct from ALERT (was duplicate alert color)
  CRITICAL: 'var(--lcars-tomato, #ff6666)',
  OFFLINE:  'var(--lcars-sky, #aaaaff)',
};

class LcarsAnatomicalSilhouette extends LitElement {
  static get properties() {
    return {
      paths: { type: Object },         // lit-html template
      anchorMap: { type: Object },     // { slot: {x,y,label} }
      anchors: { type: Object },       // { slot: {value,status,label} }
      viewBox: { type: String },
      thermal: { type: Boolean },
      dataAttr: { type: Object },      // #219: { name, value } data-* for screenshot tool only
      ariaLabel: { type: String },
    };
  }

  // Closed shadow root — Worf §16 (Medical) carries forward to Starship.
  createRenderRoot() {
    return this.attachShadow({ mode: 'closed' });
  }

  constructor() {
    super();
    this.paths = null;
    this.anchorMap = {};
    this.anchors = {};
    this.viewBox = '0 0 200 480';
    this.thermal = false;
    this.dataAttr = null;
    this.ariaLabel = '';
  }

  _alertLayers() {
    if (!this.thermal) return '';
    const alerts = Object.entries(this.anchors)
      .filter(([slot, a]) => {
        if (!a || !this.anchorMap[slot]) return false;
        return a.status === 'ALERT' || a.status === 'CRITICAL' || a.status === 'WARNING';
      })
      .map(([slot]) => this.anchorMap[slot]);
    if (!alerts.length) return '';
    // #179 — thermal overlay now uses --lcars-tomato (#ff5555) instead of the
    // off-palette tailwind red #ef4444. Same 45% alpha preserves the heat-bloom feel.
    const layers = alerts.map((p) =>
      `radial-gradient(circle at ${p.x}% ${p.y}%, rgba(255,85,85,0.45) 0%, transparent 30%)`
    ).join(', ');
    return html`<div class="thermal" style=${`background:${layers}`}></div>`;
  }

  render() {
    const [vbX, vbY, vbW, vbH] = this.viewBox.split(/\s+/).map(Number);
    // #219: data-* passthrough for screenshot tool only; no CSS class application.
    const attrName = this.dataAttr?.name ? `data-${this.dataAttr.name}` : null;
    const attrValue = this.dataAttr?.value || '';

    // Typography (Geordi 5.4.5): clamp landscape-safe so callouts don't collapse
    // to ~0.4× on landscape silhouettes (vbH=200) where the old vbH/480 formula failed.
    const rawScale = Math.min(vbW / 480, vbH / 240);
    const fontScale = Math.max(0.75, Math.min(1.25, rawScale));
    const labelFontSize = 12 * fontScale;
    const valueFontSize = 16 * fontScale;
    const inset = Math.max(vbW, vbH) * 0.015;

    // Pass 1 — bucket active slots by edge. Iterate sorted anchorMap keys for
    // cross-engine deterministic ordering on ties (Data 5.4.5 review #4).
    const buckets = { left: [], right: [], top: [], bottom: [] };
    const slotKeys = Object.keys(this.anchorMap || {}).sort();
    for (const slot of slotKeys) {
      if (!Object.prototype.hasOwnProperty.call(this.anchors || {}, slot)) continue;
      const pos = this.anchorMap[slot];
      if (!pos) continue;
      const edge = pos.label;
      if (!buckets[edge]) continue;
      buckets[edge].push({ slot, pos });
    }
    // Pass 2 — sort each bucket along its run-axis and assign an evenly-distributed
    // coordinate in the [10%, 90%] band. n=1 keeps the natural anchor coordinate
    // so sparse maps (Medical at n≤3/edge) render unchanged from pre-5.4.5.
    const distributed = {};
    for (const [edge, list] of Object.entries(buckets)) {
      if (!list.length) continue;
      const isHorizontal = edge === 'top' || edge === 'bottom';
      list.sort((a, b) => isHorizontal ? a.pos.x - b.pos.x : a.pos.y - b.pos.y);
      const n = list.length;
      list.forEach((entry, i) => {
        const coord = (n === 1)
          ? (isHorizontal ? entry.pos.x : entry.pos.y)
          : 10 + ((i + 0.5) * (80 / n));
        distributed[entry.slot] = { pos: entry.pos, edge, distCoord: coord };
      });
    }

    // Pass 3 — emit one callout group per slot.
    const callouts = [];
    for (const slot of slotKeys) {
      const dist = distributed[slot];
      if (!dist) continue;
      const data = this.anchors[slot];
      const pos = dist.pos;
      const edge = dist.edge;
      const status = data?.status || 'NOMINAL';
      const value = data?.value;
      const label = data?.label || '';
      const hasValue = value != null && value !== '—' && value !== '';
      const anchorPx = (pos.x / 100) * vbW + vbX;
      const anchorPy = (pos.y / 100) * vbH + vbY;
      let leaderX, leaderY, textAnchor;
      if (edge === 'left') {
        leaderX = vbX + inset;
        leaderY = (dist.distCoord / 100) * vbH + vbY;
        textAnchor = 'start';
      } else if (edge === 'right') {
        leaderX = vbX + vbW - inset;
        leaderY = (dist.distCoord / 100) * vbH + vbY;
        textAnchor = 'end';
      } else if (edge === 'top') {
        leaderX = (dist.distCoord / 100) * vbW + vbX;
        leaderY = vbY + 16 * fontScale;
        textAnchor = 'middle';
      } else { // bottom
        leaderX = (dist.distCoord / 100) * vbW + vbX;
        leaderY = vbY + vbH - 4 * fontScale;
        textAnchor = 'middle';
      }
      // Stack label above value. For top/left/right the leader endpoint sits
      // between the two lines; for bottom both lines sit above the endpoint so
      // the value glyph doesn't run off the canvas.
      const labelDy = (edge === 'bottom') ? -14 * fontScale : -2 * fontScale;
      const valueDy = (edge === 'bottom') ? -2 * fontScale  : 11 * fontScale;
      const lineColor = hasValue ? (STATUS_COLOR[status] || STATUS_COLOR.NOMINAL) : 'var(--lcars-gray, #666688)';
      const valColor = hasValue ? (STATUS_COLOR[status] || STATUS_COLOR.NOMINAL) : 'var(--lcars-gray, #666688)';
      const ariaLabel = `${label}, ${hasValue ? value : 'offline'}, ${String(status).toLowerCase()}`;
      callouts.push(svg`
        <g role="img" aria-label=${ariaLabel}>
          <line aria-hidden="true"
                x1=${anchorPx} y1=${anchorPy} x2=${leaderX} y2=${leaderY}
                stroke=${lineColor} stroke-width=${0.6 * fontScale} stroke-opacity=${hasValue ? 0.9 : 0.3} />
          <text aria-hidden="true"
                x=${leaderX} y=${leaderY + labelDy} text-anchor=${textAnchor}
                fill="var(--lcars-ice, #99ccff)"
                font-size=${labelFontSize} font-family="Antonio, sans-serif"
                letter-spacing="0.5" style="text-transform:uppercase">${label}</text>
          <text aria-hidden="true"
                x=${leaderX} y=${leaderY + valueDy} text-anchor=${textAnchor}
                data-medical=${attrName === 'data-medical' ? attrValue : null}
                data-starship=${attrName === 'data-starship' ? attrValue : null}
                fill=${valColor}
                font-size=${valueFontSize} font-family="Antonio, sans-serif"
                font-weight="700" letter-spacing="0.3"
                paint-order="stroke fill" stroke="#000" stroke-width=${1.5 * fontScale} stroke-opacity="0.85"
                >${hasValue ? value : '—'}</text>
        </g>
      `);
    }

    return html`
      ${this._alertLayers()}
      <svg viewBox=${this.viewBox} preserveAspectRatio="xMidYMid meet"
           role="group" aria-label=${this.ariaLabel || 'Anatomical silhouette'}>
        <g aria-hidden="true" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" fill="none">
          ${this.paths || ''}
        </g>
        ${callouts}
      </svg>
    `;
  }

  static get styles() {
    return css`
      :host {
        display: block;
        color: var(--lcars-ice, #99ccff);
        position: relative;
        width: 100%;
        height: 100%;
      }
      svg { display: block; width: 100%; height: 100%; }
      .thermal {
        position: absolute; inset: 0; pointer-events: none;
        mix-blend-mode: screen;
        z-index: 1;
      }
    `;
  }
}

if (!customElements.get('lcars-anatomical-silhouette')) {
  customElements.define('lcars-anatomical-silhouette', LcarsAnatomicalSilhouette);
}
// Backward-compat alias for the original medical-only consumer.
if (!customElements.get('lcars-biofunction-silhouette')) {
  customElements.define('lcars-biofunction-silhouette', class extends LcarsAnatomicalSilhouette {});
}
