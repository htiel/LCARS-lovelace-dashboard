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
//   - .redactClass — CSS class to apply to value text nodes (e.g. 'lcars-medical-redactable',
//                    'lcars-starship-redactable'). Also drives data-{family}=phi/op attribute.
//   - .redactAttr  — { name, value } the data-* attribute pair (e.g. {name:'medical', value:'phi'})
//
// Closed shadow root preserved (Worf §16). Both consumers (Medical + Starship)
// pass their own anchorMap + paths constants. Backward-compat alias
// <lcars-biofunction-silhouette> is registered for any external user.

import { LitElement, html, css } from 'lit-element';

const STATUS_COLOR = {
  NOMINAL:  'var(--lcars-data-accent, #99cc99)',
  DEGRADED: 'var(--lcars-sky, #aaaaff)',
  ELEVATED: 'var(--lcars-gold, #ffaa00)',
  WARNING:  'var(--lcars-gold, #ffaa00)',
  ALERT:    'var(--lcars-alert, #cc6666)',
  CRITICAL: 'var(--lcars-alert, #cc6666)',
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
      redactClass: { type: String },
      redactAttr: { type: Object },    // { name: 'medical', value: 'phi' }
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
    this.redactClass = '';
    this.redactAttr = null;
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
    const layers = alerts.map((p) =>
      `radial-gradient(circle at ${p.x}% ${p.y}%, rgba(239,68,68,0.45) 0%, transparent 30%)`
    ).join(', ');
    const overlayClass = this.redactClass ? `${this.redactClass}-overlay` : '';
    return html`<div class=${`thermal ${overlayClass}`} style=${`background:${layers}`}></div>`;
  }

  render() {
    const [vbX, vbY, vbW, vbH] = this.viewBox.split(/\s+/).map(Number);
    const callouts = [];
    const valueClass = this.redactClass || '';
    const attrName = this.redactAttr?.name ? `data-${this.redactAttr.name}` : null;
    const attrValue = this.redactAttr?.value || '';

    for (const [slot, data] of Object.entries(this.anchors || {})) {
      const pos = this.anchorMap[slot];
      if (!pos) continue;
      const status = data?.status || 'NOMINAL';
      const value = data?.value;
      const label = data?.label || '';
      const hasValue = value != null && value !== '—' && value !== '';
      const side = pos.label;
      const xPos = (pos.x / 100) * vbW + vbX;
      const yPos = (pos.y / 100) * vbH + vbY;
      // Place text INSIDE the canvas:
      //   left side: text-anchor=start at viewBox left edge + small inset
      //   right side: text-anchor=end at viewBox right edge - small inset
      //   top: anchor=middle at canvas center
      const inset = vbW * 0.02;
      const boxX = side === 'left' ? vbX + inset
                 : (side === 'right' ? vbX + vbW - inset : vbX + vbW / 2);
      const anchor = side === 'left' ? 'start' : (side === 'right' ? 'end' : 'middle');
      const lineColor = hasValue ? (STATUS_COLOR[status] || STATUS_COLOR.NOMINAL) : 'var(--lcars-gray, #666688)';
      const valColor = hasValue ? (STATUS_COLOR[status] || STATUS_COLOR.NOMINAL) : 'var(--lcars-gray, #666688)';
      const fontScale = vbH / 480;
      callouts.push(html`
        <line x1=${xPos} y1=${yPos} x2=${boxX} y2=${yPos}
              stroke=${lineColor} stroke-width=${0.6 * fontScale} stroke-opacity=${hasValue ? 0.9 : 0.3}/>
        <text x=${boxX} y=${yPos - 2 * fontScale} text-anchor=${anchor}
              fill="var(--lcars-ice, #99ccff)"
              font-size=${9 * fontScale} font-family="Antonio, sans-serif"
              letter-spacing="0.5" style="text-transform:uppercase">${label}</text>
        <text x=${boxX} y=${yPos + 11 * fontScale} text-anchor=${anchor}
              class=${valueClass}
              data-medical=${attrName === 'data-medical' ? attrValue : null}
              data-starship=${attrName === 'data-starship' ? attrValue : null}
              fill=${valColor}
              font-size=${14 * fontScale} font-family="Antonio, sans-serif"
              font-weight="700" letter-spacing="0.3"
              paint-order="stroke fill" stroke="#000" stroke-width=${1.5 * fontScale} stroke-opacity="0.85"
              >${hasValue ? value : '—'}</text>
      `);
    }

    return html`
      ${this._alertLayers()}
      <svg viewBox=${this.viewBox} preserveAspectRatio="xMidYMid meet"
           role="img" aria-label=${this.ariaLabel || 'Anatomical silhouette'}>
        <g stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" fill="none">
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
        min-height: 320px;
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
