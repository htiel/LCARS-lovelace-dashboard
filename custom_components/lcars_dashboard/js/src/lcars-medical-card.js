// LCARS Medical Bay — Biofunction Card
// Per LCARS-MEDICAL-BAY-DASHBOARD-SPEC.md (v5.3.0-beta.1, Phase 1: single-profile, summary tab)
//
// PRIVACY (Worf §16 BLOCKING):
//   - Closed shadow root (sibling-card reach-in protection)
//   - All vital values carry [data-medical="phi"] + .lcars-medical-redactable
//   - aria-live="off" on vital cells (§7.3) — AT must not announce silent BP changes
//   - No console logs with ${value} (CI lint enforced)
//   - No outbound network requests
//   - No localStorage writes other than the per-profile consent boolean
//   - No service.set_state / state writes back to HA

import { LitElement, html, css } from 'lit-element';
import { lcarsBaseStyles } from './lcars-styles.js';
import { lcarsAudio } from './lcars-audio.js';
import './lcars-biofunction-silhouette.js';
import {
  MEDICAL_VITAL_CLASSES,
  ANCHOR_MAP,
  DEFAULT_THRESHOLDS,
  computeStatus,
  rollupStatus,
  classifyVital,
  discoverProfiles,
  fileIdFor,
  decorativeNumerics,
  hasConsent,
  grantConsent,
  formatVital,
  MEDICAL_PLATFORMS,
  MEDICAL_STATUS,
} from './lcars-medical-utils.js';

const STATUS_COLOR = {
  NOMINAL:  'var(--lcars-data-accent, #99cc99)',
  ELEVATED: 'var(--lcars-gold, #ffaa00)',
  ALERT:    'var(--lcars-alert, #cc6666)',
  OFFLINE:  'var(--lcars-sky, #aaaaff)',
};

class LcarsMedicalCard extends LitElement {
  static get properties() {
    return {
      _hass: { type: Object },
      _config: { type: Object },
      _consentByFile: { type: Object },
      _thermal: { type: Boolean },
    };
  }

  // Closed shadow root — Worf §16 BLOCKING
  createRenderRoot() {
    return this.attachShadow({ mode: 'closed' });
  }

  constructor() {
    super();
    this._hass = null;
    this._config = {};
    this._consentByFile = {};
    this._thermal = false;
  }

  setConfig(config) {
    this._config = config || {};
  }

  set hass(hass) {
    this._hass = hass;
  }
  get hass() { return this._hass; }

  getCardSize() { return 12; }

  _grantConsent(fileId) {
    grantConsent(fileId);
    this._consentByFile = { ...this._consentByFile, [fileId]: true };
    lcarsAudio.play('navAcknowledge');
    this.requestUpdate();
  }

  // Reduce per-profile entity list into a vital-kind keyed dictionary.
  // Picks the most-recently-changed sample when multiple platforms supply the same vital.
  _reduceVitals(entities) {
    const byKind = new Map();
    for (const e of entities) {
      const kind = e.cls.kind;
      const ts = Date.parse(e.state.last_changed || e.state.last_updated || 0);
      const cur = byKind.get(kind);
      if (e.cls.isSystolic) {
        const ent = cur || { kind, ts: 0 };
        ent.systolic = parseFloat(e.state.state);
        ent.systolicEid = e.eid;
        ent.ts = Math.max(ent.ts, ts);
        byKind.set(kind, ent);
      } else if (e.cls.isDiastolic) {
        const ent = cur || { kind, ts: 0 };
        ent.diastolic = parseFloat(e.state.state);
        ent.diastolicEid = e.eid;
        ent.ts = Math.max(ent.ts, ts);
        byKind.set(kind, ent);
      } else {
        if (!cur || ts > cur.ts) {
          byKind.set(kind, { kind, value: parseFloat(e.state.state), eid: e.eid, ts });
        }
      }
    }
    return byKind;
  }

  // Build the silhouette anchor map: slot → { value, status, label }
  _buildAnchors(vitalsByKind) {
    const anchors = {};
    for (const vc of MEDICAL_VITAL_CLASSES) {
      if (!vc.anchor) continue;
      const v = vitalsByKind.get(vc.kind);
      if (!v) {
        anchors[vc.anchor] = { value: '—', status: MEDICAL_STATUS.NOMINAL, label: vc.label };
        continue;
      }
      const numeric = vc.kind === 'blood_pressure' ? v.systolic : v.value;
      const secondary = vc.kind === 'blood_pressure' ? v.diastolic : null;
      const status = computeStatus(vc.kind, numeric, DEFAULT_THRESHOLDS, secondary);
      const display = vc.kind === 'blood_pressure'
        ? formatVital('blood_pressure', v.systolic, v.diastolic)
        : `${formatVital(vc.kind, numeric)}`;
      anchors[vc.anchor] = { value: display, status, label: vc.label };
    }
    return anchors;
  }

  _renderHeader(profile, fileId, status) {
    const cols = decorativeNumerics(fileId, 3);
    const pillColor = STATUS_COLOR[status] || STATUS_COLOR.NOMINAL;
    return html`
      <header class="zone-a">
        <div class="title">MEDICAL REPORT
          <span class="file-id lcars-medical-redactable-id" data-medical="phi">${fileId}</span>
        </div>
        <div class="numerics" aria-hidden="true">
          ${cols.map((c) => html`<span class="numeric-col">${c}</span>`)}
        </div>
        <div class="header-actions">
          <button class="thermal-toggle ${this._thermal ? 'on' : ''}"
                  aria-pressed=${this._thermal}
                  title="Toggle thermal overlay"
                  @click=${() => { this._thermal = !this._thermal; this.requestUpdate(); }}>
            THERM
          </button>
          <span class="status-pill" style=${`background:${pillColor};color:#000`}>${status}</span>
        </div>
      </header>
    `;
  }

  _renderTiles(vitalsByKind) {
    const tiles = MEDICAL_VITAL_CLASSES
      .filter((vc) => vc.tile)
      .slice(0, 12);
    return html`
      <section class="zone-c" aria-label="Vital detail tiles">
        ${tiles.map((vc) => {
          const v = vitalsByKind.get(vc.kind);
          let display = '—';
          let unit = vc.unit;
          let status = MEDICAL_STATUS.OFFLINE;
          if (v && v.value != null && !isNaN(v.value)) {
            display = formatVital(vc.kind, v.value);
            status = computeStatus(vc.kind, v.value, DEFAULT_THRESHOLDS);
          }
          const color = v ? STATUS_COLOR[status] : 'var(--lcars-gray, #666688)';
          return html`
            <div class="tile">
              <div class="tile-label">${vc.label}</div>
              <div class="tile-value lcars-medical-redactable" data-medical="phi"
                   aria-live="off" style=${`color:${color}`}>${display}</div>
              <div class="tile-unit">${unit}</div>
            </div>`;
        })}
      </section>
    `;
  }

  _renderConsentGate(fileId) {
    return html`
      <div class="consent-gate" role="dialog" aria-modal="false" aria-labelledby="consent-h">
        <div class="consent-inner">
          <h2 id="consent-h">BIOFUNCTION DISPLAY REQUIRES CONSENT</h2>
          <p>This profile renders Protected Health Information (vitals, weight, sleep, glucose).
             Tap to enable for this device only. Consent is stored locally per-browser; no values are persisted.</p>
          <button class="consent-btn" @click=${() => this._grantConsent(fileId)}>
            ENABLE FOR PROFILE ${fileId}
          </button>
          <p class="consent-disclaimer">
            Personal residence dashboard. Not a HIPAA-covered medical record.
            Values shown for situational awareness only.
          </p>
        </div>
      </div>
    `;
  }

  render() {
    if (!this._hass) {
      return html`<div class="loading" role="status">INITIALIZING BIOBED…</div>`;
    }
    const profiles = discoverProfiles(this._hass);
    if (!profiles.length) {
      return html`
        <div class="empty" role="status">
          NO MEDICAL DATA AVAILABLE · INSTALL WITHINGS, FITBIT, DEXCOM, GARMIN, OURA, OR GOOGLE FIT
        </div>`;
    }

    return html`
      <div class="grid">
        ${profiles.slice(0, 1).map((profile) => {
          const fileId = fileIdFor(profile.profileId);
          const consentGranted = this._consentByFile[fileId] ?? hasConsent(fileId);
          const vitalsByKind = consentGranted ? this._reduceVitals(profile.entities) : new Map();
          const anchors = this._buildAnchors(vitalsByKind);
          const overall = consentGranted
            ? rollupStatus(Object.values(anchors).map((a) => a.status).filter(Boolean))
            : MEDICAL_STATUS.OFFLINE;

          return html`
            <article class="biofunction-card" aria-labelledby=${`med-h-${fileId}`}>
              <h2 id=${`med-h-${fileId}`} class="sr-only">Biofunction card ${fileId}</h2>
              ${this._renderHeader(profile, fileId, overall)}
              <section class="zone-b" aria-label="Anatomical vital map">
                <lcars-biofunction-silhouette
                  .anchors=${anchors}
                  .thermal=${this._thermal}
                ></lcars-biofunction-silhouette>
                ${!consentGranted ? this._renderConsentGate(fileId) : ''}
              </section>
              ${this._renderTiles(vitalsByKind)}
            </article>`;
        })}
      </div>
    `;
  }

  static get styles() {
    return [
      lcarsBaseStyles,
      css`
        :host { display: block; padding: 0.5rem; }
        .loading, .empty {
          padding: 2rem; text-align: center; color: var(--lcars-ice, #99ccff);
          font-family: var(--lcars-font, 'Antonio', sans-serif);
          letter-spacing: 0.1em; text-transform: uppercase;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: 1rem;
        }
        .biofunction-card {
          background: var(--lcars-black, #000);
          border-radius: 0.6rem;
          padding: 0.5rem;
          display: flex;
          flex-direction: column;
          min-height: 640px;
          gap: 0.5rem;
          color: var(--lcars-ice, #99ccff);
          font-family: var(--lcars-font, 'Antonio', sans-serif);
        }
        .sr-only {
          position: absolute; width: 1px; height: 1px; padding: 0;
          margin: -1px; overflow: hidden; clip: rect(0,0,0,0); border: 0;
        }
        /* Zone A */
        .zone-a {
          display: flex; align-items: center; gap: 0.5rem;
          background: var(--lcars-butterscotch, #ff9966);
          color: #000;
          border-radius: 0.4rem;
          padding: 0.4rem 0.75rem;
          min-height: 48px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .title { font-weight: 700; font-size: 1rem; flex: 0 0 auto; }
        .file-id { font-family: 'Courier New', monospace; margin-left: 0.4rem; font-size: 0.95rem; }
        .numerics { display: flex; gap: 0.6rem; flex: 1 1 auto; justify-content: center; opacity: 0.85; }
        .numeric-col {
          font-family: 'Courier New', monospace; font-size: 0.85rem;
          background: rgba(0,0,0,0.18); padding: 0 0.4rem; border-radius: 0.2rem;
        }
        .header-actions { display: flex; gap: 0.4rem; align-items: center; flex: 0 0 auto; }
        .thermal-toggle {
          background: var(--lcars-black, #000); color: var(--lcars-gold, #ffaa00);
          border: 1px solid var(--lcars-gold, #ffaa00);
          padding: 0.25rem 0.5rem; border-radius: 0.25rem; cursor: pointer;
          font-family: var(--lcars-font, 'Antonio', sans-serif); text-transform: uppercase;
          letter-spacing: 0.06em; font-size: 0.75rem; min-height: 32px;
        }
        .thermal-toggle.on { background: var(--lcars-gold, #ffaa00); color: #000; }
        .thermal-toggle:focus-visible { outline: 2px solid var(--lcars-ice, #99ccff); outline-offset: 2px; }
        .status-pill {
          padding: 0.2rem 0.6rem; border-radius: 999px; font-weight: 700;
          font-size: 0.85rem; letter-spacing: 0.08em;
        }
        /* Zone B */
        .zone-b {
          flex: 1 1 auto; position: relative; min-height: 320px;
          display: flex; align-items: center; justify-content: center;
        }
        lcars-biofunction-silhouette { width: 100%; height: 100%; max-height: 480px; }
        .consent-gate {
          position: absolute; inset: 0;
          background: rgba(0,0,0,0.92); backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          border-radius: 0.4rem; padding: 1rem;
          z-index: 5;
        }
        .consent-inner { max-width: 320px; text-align: center; }
        .consent-inner h2 {
          color: var(--lcars-gold, #ffaa00); font-size: 1rem;
          letter-spacing: 0.08em; margin: 0 0 0.6rem;
        }
        .consent-inner p {
          color: var(--lcars-ice, #99ccff); font-size: 0.85rem; line-height: 1.4;
          margin: 0 0 0.75rem; text-transform: none; letter-spacing: 0.02em;
        }
        .consent-btn {
          background: var(--lcars-gold, #ffaa00); color: #000;
          border: none; padding: 0.6rem 1rem; border-radius: 0.3rem;
          font-family: var(--lcars-font, 'Antonio', sans-serif);
          text-transform: uppercase; letter-spacing: 0.08em;
          font-weight: 700; cursor: pointer; min-height: 44px;
        }
        .consent-btn:focus-visible { outline: 2px solid var(--lcars-ice, #99ccff); outline-offset: 2px; }
        .consent-disclaimer { font-size: 0.7rem; opacity: 0.65; margin-top: 0.75rem; }
        /* Zone C — 4 cols × 3 rows tile grid */
        .zone-c {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          grid-auto-rows: minmax(72px, auto);
          gap: 0.4rem;
        }
        .tile {
          background: rgba(153, 204, 255, 0.06);
          border-left: 3px solid var(--lcars-ice, #99ccff);
          padding: 0.35rem 0.5rem;
          display: flex; flex-direction: column; gap: 0.1rem;
          border-radius: 0 0.25rem 0.25rem 0;
        }
        .tile-label {
          font-size: 0.65rem; letter-spacing: 0.08em;
          color: var(--lcars-ice, #99ccff); opacity: 0.85;
        }
        .tile-value {
          font-size: 1.4rem; font-weight: 700; line-height: 1;
        }
        .tile-unit {
          font-size: 0.65rem; letter-spacing: 0.06em; opacity: 0.75;
        }
        @media (max-width: 720px) {
          .zone-c { grid-template-columns: repeat(2, 1fr); }
        }
      `,
    ];
  }
}

if (!customElements.get('lcars-medical-card')) {
  customElements.define('lcars-medical-card', LcarsMedicalCard);
}
