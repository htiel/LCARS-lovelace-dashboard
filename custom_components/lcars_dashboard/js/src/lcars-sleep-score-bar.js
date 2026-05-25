// lcars-sleep-score-bar.js
//
// LCARS sleep-score horizontal stacked bar. Donut chart was REJECTED per crew
// review C3 (circles aren't LCARS grammar). One pill-segment per contributor,
// width proportional to `value/max`. Score numeric above the bar, contributor
// breakdown table to the right.
//
// Per spec LCARS-SICKBAY-TAB-REDESIGN-SPEC.md §4.6.
//
// PRIVACY (Worf §16):
//   - Shadow host carries `data-medical="phi"`.
//   - All numeric cells inside the shadow tree carry `data-medical="phi"`.
//   - `_disposeCaches()` no-op stub (no caches — values read directly from props).

import { LitElement, html, css } from 'lit-element';

// Contributor → color token. Vocabulary auto-detected; unknown contributors
// fall back to LCARS gray so unfamiliar source labels still render legibly.
const CONTRIB_COLOR = {
  EFFICIENCY:   'var(--lcars-data-accent, #99cc99)',
  LATENCY:      'var(--lcars-ice, #a8d8ff)',
  REGULARITY:   'var(--lcars-african-violet, #cc99ff)',
  RESTFULNESS:  'var(--lcars-butterscotch, #ffaa66)',
  DURATION:     'var(--lcars-gold, #ffcc66)',
  // HAI vocabulary
  BEDTIME:      'var(--lcars-ice, #a8d8ff)',
  INTERRUPTIONS:'var(--lcars-butterscotch, #ffaa66)',
};

function _bandFor(score) {
  if (!Number.isFinite(score)) return { label: '—', color: 'var(--lcars-gray, #888899)' };
  if (score >= 85) return { label: 'EXCELLENT', color: 'var(--lcars-data-accent, #99cc99)' };
  if (score >= 70) return { label: 'GOOD',      color: 'var(--lcars-data-accent, #99cc99)' };
  if (score >= 60) return { label: 'OK',        color: 'var(--lcars-gold, #ffcc66)' };
  if (score >= 40) return { label: 'POOR',      color: 'var(--lcars-butterscotch, #ffaa66)' };
  return                     { label: 'ALERT',     color: 'var(--lcars-alert, #cc6666)' };
}

class LcarsSleepScoreBar extends LitElement {
  static get properties() {
    return {
      score: { type: Number },
      contributors: { type: Object },
    };
  }

  createRenderRoot() {
    const root = this.attachShadow({ mode: 'open' });
    this.setAttribute('data-medical', 'phi');
    return root;
  }

  constructor() {
    super();
    this.score = null;
    this.contributors = null;
  }

  _disposeCaches() { /* W6 no-op stub */ }

  _orderedContributors() {
    if (!this.contributors || typeof this.contributors !== 'object') return [];
    const PREFERRED = ['DURATION', 'EFFICIENCY', 'LATENCY', 'REGULARITY', 'RESTFULNESS', 'BEDTIME', 'INTERRUPTIONS'];
    const seen = new Set();
    const out = [];
    for (const k of PREFERRED) {
      if (this.contributors[k]) { out.push({ key: k, ...this.contributors[k] }); seen.add(k); }
    }
    for (const k of Object.keys(this.contributors)) {
      if (!seen.has(k)) out.push({ key: k, ...this.contributors[k] });
    }
    return out;
  }

  render() {
    const have = Number.isFinite(this.score) || (this.contributors && Object.keys(this.contributors).length > 0);
    if (!have) {
      return html`<div class="empty" role="meter" aria-label="Sleep score — no data">SLEEP SCORE · NO DATA</div>`;
    }
    const band = _bandFor(this.score);
    const contribs = this._orderedContributors();
    // Each segment width is proportional to value/max. The whole bar represents
    // 100% achievement; segments stack left-to-right. If contributors are empty
    // but score is present, render just the headline tile.
    const totalMax = contribs.reduce((s, c) => s + (Number(c.max) || 0), 0);
    const ariaLabel = Number.isFinite(this.score)
      ? `Sleep score: ${Math.round(this.score)} out of 100`
      : 'Sleep score';
    return html`
      <div class="wrap" role="meter" aria-valuemin="0" aria-valuemax="100"
           aria-valuenow=${Number.isFinite(this.score) ? Math.round(this.score) : ''}
           aria-label=${ariaLabel}>
        <div class="head">
          <span class="score" data-medical="phi"
                style=${`color:${band.color}`}>${Number.isFinite(this.score) ? Math.round(this.score) : '—'}</span>
          <span class="score-suffix">/ 100</span>
          <span class="band" style=${`color:${band.color}`}>${band.label}</span>
        </div>
        ${contribs.length && totalMax > 0 ? html`
          <div class="bar" aria-hidden="true">
            ${contribs.map((c) => {
              const v = Number(c.value);
              const m = Number(c.max);
              if (!Number.isFinite(v) || !Number.isFinite(m) || m <= 0) return '';
              const pct = Math.max(0, Math.min(100, (v / m) * 100));
              const widthPct = (m / totalMax) * 100;
              const color = CONTRIB_COLOR[c.key] || 'var(--lcars-gray, #888899)';
              return html`
                <div class="bar-segment"
                     style=${`flex-basis:${widthPct}%`}
                     title=${`${c.key}: ${v} / ${m}`}>
                  <div class="bar-fill" style=${`width:${pct.toFixed(1)}%;background:${color}`}></div>
                  <div class="bar-segment-label">${c.key}</div>
                </div>`;
            })}
          </div>
          <div class="contrib-table">
            ${contribs.map((c) => {
              const v = Number(c.value);
              const m = Number(c.max);
              if (!Number.isFinite(v)) return '';
              return html`
                <div class="contrib-row">
                  <span class="contrib-label">${c.key}</span>
                  <span class="contrib-value" data-medical="phi">${Math.round(v)}${Number.isFinite(m) ? html` <span class="contrib-max"> / ${Math.round(m)}</span>` : ''}</span>
                </div>`;
            })}
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
      .wrap { display: flex; flex-direction: column; gap: 0.55rem; }
      .head {
        display: flex; align-items: baseline; gap: 0.4rem;
      }
      .score {
        font-size: 2.6rem;
        font-weight: 700;
        font-variant-numeric: tabular-nums;
        letter-spacing: 0.04em;
        line-height: 1;
      }
      .score-suffix {
        font-size: 0.9rem;
        color: var(--lcars-gray, #aaaadd);
        letter-spacing: 0.1em;
      }
      .band {
        margin-left: auto;
        font-size: 0.85rem;
        letter-spacing: 0.18em;
        font-weight: 700;
        text-transform: uppercase;
      }
      .bar {
        display: flex;
        height: 22px;
        gap: 4px;
        background: rgba(153, 204, 255, 0.04);
        border-radius: 11px;
        padding: 2px;
      }
      .bar-segment {
        position: relative;
        height: 100%;
        min-width: 24px;
        background: rgba(102, 102, 136, 0.18);
        border-radius: 9px;
        overflow: hidden;
      }
      .bar-segment-label {
        position: absolute;
        bottom: -1.1rem;
        left: 0; right: 0;
        text-align: center;
        font-size: 0.6rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--lcars-gray, #aaaadd);
        white-space: nowrap;
      }
      .bar-fill {
        height: 100%;
        border-radius: 9px;
        transition: width 200ms ease-out;
      }
      .contrib-table {
        margin-top: 1.4rem;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
        gap: 0.2rem 0.8rem;
        font-size: 0.8rem;
        font-variant-numeric: tabular-nums;
      }
      .contrib-row {
        display: flex; justify-content: space-between;
        padding: 0.2rem 0;
        border-bottom: 1px solid rgba(153, 204, 255, 0.08);
      }
      .contrib-label {
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--lcars-gray, #aaaadd);
      }
      .contrib-value { color: var(--lcars-text, #ccccee); }
      .contrib-max { color: var(--lcars-gray, #888899); font-size: 0.78em; }
    `;
  }
}

if (!customElements.get('lcars-sleep-score-bar')) {
  customElements.define('lcars-sleep-score-bar', LcarsSleepScoreBar);
}
