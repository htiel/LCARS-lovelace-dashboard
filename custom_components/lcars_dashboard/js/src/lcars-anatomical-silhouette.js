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
//   - .viewBox    — defaults to "0 0 200 480" — outer SVG canvas (with gutter for callouts)
//   - .bodyBox    — defaults to viewBox — INNER coord system for anchor x/y %.
//                   When wider than viewBox, the body sits centered inside a
//                   gutter that hosts callouts; when equal to viewBox, the
//                   silhouette is gutter-less (back-compat for Starship/Tactical/Network).
//   - .thermal    — boolean overlay enable
//   - .dataAttr   — #219: { name, value } data-* attribute pair applied to value text
//                    nodes for the screenshot-obfuscator tool to find at capture time.
//                    NOT used for runtime redaction — values render in cleartext.
//
// 5.11.0-beta.3 — Tactical Readout Tab callout style (Geordi spec): each anchor
// emits a stadium-capped <path> tab + filled <circle> body terminator + orthogonal
// L-leader <polyline>. Replaces the prior diagonal-line + naked-text layout.
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
      bodyBox: { type: String },       // 5.11.0-beta.3 — inner coord system for anchors
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
    this.bodyBox = '';
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
    // 5.11.0-beta.3 — convert body-coord % to canvas-coord % so thermal blooms
    // line up with the centered silhouette when a wider viewBox + inner bodyBox
    // is in use (Geordi tactical-readout-tab gutter mode).
    const [vbX, vbY, vbW, vbH] = this.viewBox.split(/\s+/).map(Number);
    const [bbX, bbY, bbW, bbH] = (this.bodyBox || this.viewBox).split(/\s+/).map(Number);
    const toCanvasX = (px) => (((px / 100) * bbW + bbX) - vbX) / vbW * 100;
    const toCanvasY = (py) => (((py / 100) * bbH + bbY) - vbY) / vbH * 100;
    // #179 (5.8.0-beta.1) — thermal overlay token. The CSS variable
    // `--lcars-thermal-bloom` carries the literal rgba; the silhouette never
    // ships a hardcoded color. Default falls back to a tomato-adjacent value
    // matching --lcars-tomato (#ff5555 / #ff6666) at 45% alpha.
    const layers = alerts.map((p) =>
      `radial-gradient(circle at ${toCanvasX(p.x)}% ${toCanvasY(p.y)}%, var(--lcars-thermal-bloom, rgba(255,85,85,0.45)) 0%, transparent 30%)`
    ).join(', ');
    return html`<div class="thermal" style=${`background:${layers}`}></div>`;
  }

  render() {
    const [vbX, vbY, vbW, vbH] = this.viewBox.split(/\s+/).map(Number);
    // 5.11.0-beta.3 — bodyBox decouples anchor coordinates from the outer SVG
    // viewBox so the canvas can have a callout gutter without shifting body
    // landmarks. When .bodyBox is unset, anchor % map directly against viewBox
    // (back-compat for Starship/Tactical/Network silhouettes).
    const [bbX, bbY, bbW, bbH] = (this.bodyBox || this.viewBox).split(/\s+/).map(Number);
    // #219 / #178 (5.8.0-beta.1): data-* passthrough is now fully generic.
    // The dataAttr.name determines which `data-*` attribute carries the value at
    // capture time; no consumer-specific branches. Allowed names are gated to
    // prevent attribute-injection from misconfigured callers (Worf §3 §5).
    const ALLOWED_DATA_ATTRS = new Set(['medical', 'starship', 'network', 'tactical']);
    const rawAttrName = this.dataAttr?.name;
    const safeAttrName = (rawAttrName && ALLOWED_DATA_ATTRS.has(rawAttrName))
      ? `data-${rawAttrName}`
      : null;
    const attrValue = (safeAttrName && typeof this.dataAttr?.value === 'string')
      ? this.dataAttr.value
      : null;

    // Typography (Geordi 5.4.5): clamp landscape-safe so callouts don't collapse
    // to ~0.4× on landscape silhouettes (vbH=200) where the old vbH/480 formula failed.
    const rawScale = Math.min(vbW / 480, vbH / 240);
    const fontScale = Math.max(0.75, Math.min(1.25, rawScale));
    // 5.11.0-beta.3 — Tactical Readout Tab style (Geordi spec):
    // single-line LABEL + VALUE inside a stadium-capped <path> tab,
    // small filled circle anchor terminator, orthogonal-L leader.
    const labelFontSize = 9 * fontScale;
    const valueFontSize = 11 * fontScale;
    const tabHeight = 16 * fontScale;
    const tabPadX = 4 * fontScale;
    const tabRadius = tabHeight / 2;
    const dotRadius = 2.5 * fontScale;
    const leaderStroke = 1.5 * fontScale;
    const tabStroke = 1 * fontScale;
    const sepDx = 4 * fontScale;
    const canvasInset = 8 * fontScale;
    // 5.11.0-beta.5 — tab clearance OUTSIDE the body coord box. Pinning the
    // flat (body-facing) side at a fixed distance from the body silhouette
    // means tab borders never grow inward toward the body regardless of label
    // length — tab growth always extends INTO the gutter (rounded end at canvas
    // edge, flat end facing body). Bumped 4 → 12 viewBox units per Captain.
    const bodyClearance = 12;

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
    // Pass 2 — anchor-aligned slot allocation with 1D collision avoidance.
    // 5.11.0-beta.5: previous even-distribution pushed slot Y far from anchor Y
    // even for 2–3 callouts/edge, forcing long vertical leader segments that
    // ran along the body-facing border of intermediate tabs (visible as "line
    // through WEIGHT/TEMP" in beta.4). Now each tab sits AT its anchor
    // coordinate and is only pushed outward when it would overlap the previous
    // tab in the bucket. Result: vertical leader length = 0 in the common
    // (n≤3/edge) case, eliminating cross-tab leader intrusions.
    const distributed = {};
    // Convert tab footprint (in viewBox units) to a body-coord percentage so
    // collision math operates in the same coordinate space as anchor x/y.
    const tabFootprintCoord = (range) => (tabHeight * 1.15) / range * 100;
    for (const [edge, list] of Object.entries(buckets)) {
      if (!list.length) continue;
      const isHorizontal = edge === 'top' || edge === 'bottom';
      list.sort((a, b) => isHorizontal ? a.pos.x - b.pos.x : a.pos.y - b.pos.y);
      const minGap = tabFootprintCoord(isHorizontal ? bbW : bbH);
      let prev = -Infinity;
      list.forEach((entry) => {
        const preferred = isHorizontal ? entry.pos.x : entry.pos.y;
        const coord = Math.max(preferred, prev + minGap);
        distributed[entry.slot] = { pos: entry.pos, edge, distCoord: coord };
        prev = coord;
      });
    }

    // Pass 3 — emit one tactical-readout-tab callout group per slot.
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
      const displayValue = hasValue ? String(value) : '—';

      // Anchor in BODY coords (decoupled from outer viewBox).
      const anchorPx = (pos.x / 100) * bbW + bbX;
      const anchorPy = (pos.y / 100) * bbH + bbY;

      // Approximate single-line text width. 5.11.0-beta.6: bumped per-char
      // ratios (Antonio uppercase W/M/H/E run wider than 0.52em; bold digits
      // 8/0/6 run wider than 0.55em) and added an explicit letter-spacing
      // contribution. Previous estimate underflowed for "WEIGHT 82.1" by ~6
      // viewBox units, causing the trailing "1" to escape the tab on the right.
      const labelLen = label.length || 0;
      const valueLen = displayValue.length || 1;
      const labelLetterSpacing = 0.5;
      const valueLetterSpacing = 0.3;
      const labelW = labelLen * labelFontSize * 0.62 + Math.max(0, labelLen - 1) * labelLetterSpacing;
      const valueW = valueLen * valueFontSize * 0.62 + Math.max(0, valueLen - 1) * valueLetterSpacing;
      const textW = (label ? labelW + sepDx : 0) + valueW;
      const tabWidth = Math.max(48 * fontScale, textW + tabPadX * 2);

      let tabPath, leaderPoints, textAnchor, textX, slotY;

      if (edge === 'left') {
        slotY = (dist.distCoord / 100) * bbH + bbY;
        // Tab pinned at body-left edge with bodyClearance gap, growing LEFT into gutter.
        const tabRightX = bbX - bodyClearance;
        const tabX = tabRightX - tabWidth;
        const tabY = slotY - tabHeight / 2;
        const tabBotY = tabY + tabHeight;
        // Stadium: rounded LEFT (canvas edge), flat RIGHT (faces body).
        tabPath = `M ${tabX + tabRadius},${tabY} L ${tabRightX},${tabY}`
          + ` L ${tabRightX},${tabBotY} L ${tabX + tabRadius},${tabBotY}`
          + ` A ${tabRadius},${tabRadius} 0 0 1 ${tabX + tabRadius},${tabY} Z`;
        // Orthogonal-L leader: anchor → (tabRightX, anchorPy) → (tabRightX, slotY).
        leaderPoints = `${anchorPx},${anchorPy} ${tabRightX},${anchorPy} ${tabRightX},${slotY}`;
        textAnchor = 'end';
        textX = tabRightX - tabPadX;
      } else if (edge === 'right') {
        slotY = (dist.distCoord / 100) * bbH + bbY;
        // Tab pinned at body-right edge with bodyClearance gap, growing RIGHT into gutter.
        const tabX = (bbX + bbW) + bodyClearance;
        const tabRightX = tabX + tabWidth;
        const tabY = slotY - tabHeight / 2;
        const tabBotY = tabY + tabHeight;
        // Stadium: flat LEFT (faces body), rounded RIGHT (canvas edge).
        tabPath = `M ${tabX},${tabY} L ${tabRightX - tabRadius},${tabY}`
          + ` A ${tabRadius},${tabRadius} 0 0 1 ${tabRightX - tabRadius},${tabBotY}`
          + ` L ${tabX},${tabBotY} Z`;
        leaderPoints = `${anchorPx},${anchorPy} ${tabX},${anchorPy} ${tabX},${slotY}`;
        textAnchor = 'start';
        textX = tabX + tabPadX;
      } else if (edge === 'top') {
        const slotX = (dist.distCoord / 100) * bbW + bbX;
        const tabY = vbY + canvasInset / 2;
        const tabBotY = tabY + tabHeight;
        const tabX = slotX - tabWidth / 2;
        const tabRightX = tabX + tabWidth;
        // Full stadium (rounded both ends).
        tabPath = `M ${tabX + tabRadius},${tabY} L ${tabRightX - tabRadius},${tabY}`
          + ` A ${tabRadius},${tabRadius} 0 0 1 ${tabRightX - tabRadius},${tabBotY}`
          + ` L ${tabX + tabRadius},${tabBotY}`
          + ` A ${tabRadius},${tabRadius} 0 0 1 ${tabX + tabRadius},${tabY} Z`;
        const kinkY = tabBotY + 4 * fontScale;
        leaderPoints = `${anchorPx},${anchorPy} ${anchorPx},${kinkY} ${slotX},${kinkY} ${slotX},${tabBotY}`;
        textAnchor = 'middle';
        textX = slotX;
        slotY = tabY + tabHeight / 2;
      } else { // bottom
        const slotX = (dist.distCoord / 100) * bbW + bbX;
        const tabBotY = vbY + vbH - canvasInset / 2;
        const tabY = tabBotY - tabHeight;
        const tabX = slotX - tabWidth / 2;
        const tabRightX = tabX + tabWidth;
        tabPath = `M ${tabX + tabRadius},${tabY} L ${tabRightX - tabRadius},${tabY}`
          + ` A ${tabRadius},${tabRadius} 0 0 1 ${tabRightX - tabRadius},${tabBotY}`
          + ` L ${tabX + tabRadius},${tabBotY}`
          + ` A ${tabRadius},${tabRadius} 0 0 1 ${tabX + tabRadius},${tabY} Z`;
        const kinkY = tabY - 4 * fontScale;
        leaderPoints = `${anchorPx},${anchorPy} ${anchorPx},${kinkY} ${slotX},${kinkY} ${slotX},${tabY}`;
        textAnchor = 'middle';
        textX = slotX;
        slotY = tabY + tabHeight / 2;
      }

      const lineColor = hasValue ? (STATUS_COLOR[status] || STATUS_COLOR.NOMINAL) : 'var(--lcars-gray, #666688)';
      const ariaLabel = `${label}, ${hasValue ? value : 'offline'}, ${String(status).toLowerCase()}`;
      callouts.push(svg`
        <g role="img" aria-label=${ariaLabel}>
          <polyline aria-hidden="true" fill="none" points=${leaderPoints}
                    stroke=${lineColor} stroke-width=${leaderStroke}
                    stroke-opacity=${hasValue ? 0.9 : 0.35}
                    stroke-linecap="round" stroke-linejoin="round" />
          <circle aria-hidden="true" cx=${anchorPx} cy=${anchorPy} r=${dotRadius}
                  fill=${lineColor} fill-opacity=${hasValue ? 1 : 0.4} />
          <path aria-hidden="true" d=${tabPath}
                fill=${lineColor} fill-opacity=${hasValue ? 0.15 : 0.08}
                stroke=${lineColor} stroke-width=${tabStroke}
                stroke-opacity=${hasValue ? 0.9 : 0.4} />
          <text x=${textX} y=${slotY} text-anchor=${textAnchor}
                dominant-baseline="central"
                font-family="Antonio, sans-serif"
                style="text-transform:uppercase">
            <tspan fill="var(--lcars-ice, #99ccff)"
                   font-size=${labelFontSize}
                   letter-spacing="0.5">${label}</tspan>
            <tspan fill=${lineColor}
                   font-size=${valueFontSize}
                   font-weight="700"
                   letter-spacing="0.3"
                   dx=${sepDx}
                   data-medical=${safeAttrName === 'data-medical' ? attrValue : null}
                   data-starship=${safeAttrName === 'data-starship' ? attrValue : null}
                   data-network=${safeAttrName === 'data-network' ? attrValue : null}
                   data-tactical=${safeAttrName === 'data-tactical' ? attrValue : null}>${displayValue}</tspan>
          </text>
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
