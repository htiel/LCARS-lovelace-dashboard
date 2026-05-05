// LCARS Biofunction Silhouette — shared primitive
// Wraps the inline silhouette path data, accepts an `anchors` prop
// (slot → { value, status, label }), renders leader lines + an optional
// thermal overlay layer for ALERT regions.
//
// The SVG itself is non-PII (a schematic stroke, no avatar, no biometric likeness)
// and remains visible in screenshots (Worf §16). Only the callout values are redacted
// via the `.lcars-medical-redactable` class + `data-medical="phi"` attribute.
//
// Closed shadow root per Worf §16 BLOCKING — sibling Lovelace cards cannot reach in
// via document.querySelector. Trade: HA card_mod cannot pierce into PHI surfaces.

import { LitElement, html, css } from 'lit-element';
import { ANCHOR_MAP, MEDICAL_STATUS } from './lcars-medical-utils.js';

const STATUS_COLOR = {
  NOMINAL:  'var(--lcars-data-accent, #99cc99)',
  ELEVATED: 'var(--lcars-gold, #ffaa00)',
  ALERT:    'var(--lcars-alert, #cc6666)',
  OFFLINE:  'var(--lcars-sky, #aaaaff)',
};

class LcarsBiofunctionSilhouette extends LitElement {
  static get properties() {
    return {
      anchors: { type: Object },
      thermal: { type: Boolean },
    };
  }

  createRenderRoot() {
    return this.attachShadow({ mode: 'closed' });
  }

  constructor() {
    super();
    this.anchors = {};
    this.thermal = false;
  }

  _alertLayers() {
    if (!this.thermal) return '';
    const alerts = Object.entries(this.anchors)
      .filter(([slot, a]) => a && a.status === MEDICAL_STATUS.ALERT && ANCHOR_MAP[slot])
      .map(([slot]) => ANCHOR_MAP[slot]);
    if (!alerts.length) return '';
    const layers = alerts.map((p) =>
      `radial-gradient(circle at ${p.x}% ${p.y}%, rgba(239,68,68,0.45) 0%, transparent 30%)`
    ).join(', ');
    return html`<div class="thermal lcars-medical-redactable-overlay" style=${`background:${layers}`}></div>`;
  }

  render() {
    const callouts = [];
    for (const [slot, data] of Object.entries(this.anchors || {})) {
      const pos = ANCHOR_MAP[slot];
      if (!pos) continue;
      const status = data?.status || MEDICAL_STATUS.NOMINAL;
      const value = data?.value;
      const label = data?.label || '';
      const hasValue = value != null && value !== '—' && value !== '';
      const side = pos.label;
      const xPos = (pos.x / 100) * 200;
      const yPos = (pos.y / 100) * 480;
      // Place label box INSIDE the viewBox so text stays visible:
      //   left  side: text-anchor="start" at x=4    (extends rightward from x=4)
      //   right side: text-anchor="end"   at x=196  (extends leftward  from x=196)
      //   top   side: text-anchor="middle" at x=100
      const boxX = side === 'left' ? 4 : (side === 'right' ? 196 : 100);
      const anchor = side === 'left' ? 'start' : (side === 'right' ? 'end' : 'middle');
      const lineColor = hasValue ? STATUS_COLOR[status] : 'var(--lcars-gray, #666688)';
      const valColor  = hasValue ? STATUS_COLOR[status] : 'var(--lcars-gray, #666688)';
      callouts.push(html`
        <line x1=${xPos} y1=${yPos} x2=${boxX} y2=${yPos}
              stroke=${lineColor} stroke-width="0.6" stroke-opacity=${hasValue ? 0.9 : 0.3}/>
        <text x=${boxX} y=${yPos - 2} text-anchor=${anchor}
              fill="var(--lcars-ice, #99ccff)"
              font-size="9" font-family="Antonio, sans-serif"
              letter-spacing="0.5" style="text-transform:uppercase">${label}</text>
        <text x=${boxX} y=${yPos + 11} text-anchor=${anchor}
              class="lcars-medical-redactable" data-medical="phi"
              fill=${valColor}
              font-size="14" font-family="Antonio, sans-serif"
              font-weight="700" letter-spacing="0.3">${hasValue ? value : '—'}</text>
      `);
    }

    return html`
      ${this._alertLayers()}
      <svg viewBox="0 0 200 480" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <g stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" fill="none">
          <ellipse cx="100" cy="36" rx="22" ry="28"/>
          <path d="M88 60 L88 78 L112 78 L112 60"/>
          <path d="M88 78 L52 90 L42 200 L36 230 L46 232 L58 200 L66 100"/>
          <path d="M112 78 L148 90 L158 200 L164 230 L154 232 L142 200 L134 100"/>
          <path d="M66 100 L60 240 L82 250"/>
          <path d="M134 100 L140 240 L118 250"/>
          <path d="M82 250 L78 280 L122 280 L118 250"/>
          <path d="M78 280 L72 380 L70 460 L88 460 L92 380 L96 282"/>
          <path d="M122 280 L128 380 L130 460 L112 460 L108 380 L104 282"/>
          <path d="M70 460 L66 470 L92 470 L88 460"/>
          <path d="M130 460 L134 470 L108 470 L112 460"/>
          <line x1="100" y1="64" x2="100" y2="280" stroke-opacity="0.15"/>
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

if (!customElements.get('lcars-biofunction-silhouette')) {
  customElements.define('lcars-biofunction-silhouette', LcarsBiofunctionSilhouette);
}
