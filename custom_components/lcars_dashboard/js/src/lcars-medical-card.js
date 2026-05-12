// LCARS Medical Bay — Biofunction Card
// Per LCARS-MEDICAL-BAY-DASHBOARD-SPEC.md (v5.3.0-beta.1, Phase 1: single-profile, summary tab)
//
// PRIVACY (Worf §16 BLOCKING):
//   - Closed shadow root (sibling-card reach-in protection)
//   - All vital values carry [data-medical="phi"] (screenshot-obfuscator hook only;
//     #219 removed runtime CSS-class redaction — dashboard renders cleartext)
//   - aria-live="off" on vital cells (§7.3) — AT must not announce silent BP changes
//   - No console logs with ${value} (CI lint enforced)
//   - No outbound network requests
//   - No localStorage writes other than the per-profile consent boolean
//   - No service.set_state / state writes back to HA

import { LitElement, html, css } from 'lit-element';
import { lcarsBaseStyles } from './lcars-styles.js';
import { lcarsAudio } from './lcars-audio.js';
import './lcars-anatomical-silhouette.js';
import { MEDICAL_SILHOUETTE_PATHS } from './lcars-medical-silhouette-paths.js';
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
  MEDICAL_STATUS,
  entityPriority,
  findRestModeState,
  classifyRestMode,
  discoverReadinessSubscores,
} from './lcars-medical-utils.js';

const STATUS_COLOR = {
  NOMINAL:  'var(--lcars-data-accent, #99cc99)',
  ELEVATED: 'var(--lcars-gold, #ffaa00)',
  ALERT:    'var(--lcars-alert, #cc6666)',
  // #177 — CRITICAL distinct from ALERT (was identical alert color, indistinguishable).
  // Tomato carries higher urgency in the LCARS palette; reserved for life-threatening tier.
  CRITICAL: 'var(--lcars-tomato, #ff6666)',
  OFFLINE:  'var(--lcars-sky, #aaaaff)',
};

// #171 — vital is considered stale (OFFLINE) when its last_changed/last_updated timestamp
// exceeds 24h. Even a numerically valid reading is unsafe to display as live when the
// integration hasn't reported in a day (sensor offline, sleep tracker not synced, etc.).
const STALE_VITAL_MS = 24 * 60 * 60 * 1000;

// #174 — blood-pressure plausibility gate. Readings outside human-survivable ranges or
// inverted systolic<=diastolic indicate a sensor fault and must NOT drive the rollup pill
// to NOMINAL. Source: AHA reference ranges + safety margin.
function _bpPlausible(sys, dia) {
  if (!Number.isFinite(sys) || !Number.isFinite(dia)) return Number.isFinite(sys);  // sys-only OK
  if (sys < 40 || sys > 300) return false;
  if (dia < 20 || dia > 200) return false;
  if (sys <= dia) return false;
  return true;
}

class LcarsMedicalCard extends LitElement {
  static get properties() {
    return {
      _hass: { type: Object },
      _config: { type: Object },
      _consentByFile: { type: Object },
      _thermal: { type: Boolean },
      _focusMode: { type: String },   // 5.3.1 — 'summary' | 'anatomical' | 'biomedical'
      _audioMuted: { type: Boolean }, // #169 — mirrors lcarsAudio.isMuted to gate PHI aria-hidden
      _restMode: { type: String },    // 5.8.0-beta.1 (Worf Gap E) — 'off' | 'rest' | 'sick'
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
    this._focusMode = this._readFocusFromHash();
    this._audioMuted = lcarsAudio.isMuted;
    this._restMode = 'off';
    this._lastRestMode = 'off';
    this._onHashChange = () => {
      const next = this._readFocusFromHash();
      if (next !== this._focusMode) {
        this._focusMode = next;
        this.requestUpdate();
      }
    };
    // #169 — PHI aria-hidden + aria-live state follow the header mute switch.
    // Muted dashboard → PHI hidden from SR (no announcement, no leakage).
    // Unmuted → PHI announced via aria-live=polite per AUDIO-SPEC.
    this._onMuteChange = (e) => {
      const muted = !!e?.detail?.muted;
      if (muted !== this._audioMuted) {
        this._audioMuted = muted;
        this.requestUpdate();
      }
    };
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('hashchange', this._onHashChange);
    window.addEventListener('lcars-audio-mute-changed', this._onMuteChange);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('hashchange', this._onHashChange);
    window.removeEventListener('lcars-audio-mute-changed', this._onMuteChange);
  }

  _readFocusFromHash() {
    const h = (window.location.hash || '').replace(/^#/, '').toLowerCase();
    if (h === 'anatomical' || h === 'biomedical') return h;
    return 'summary';
  }

  _setFocus(mode) {
    if (mode === this._focusMode) return;
    this._focusMode = mode;
    if (mode === 'summary') {
      // Drop the fragment cleanly without scrolling.
      history.replaceState(null, '', window.location.pathname + window.location.search);
    } else {
      history.replaceState(null, '', `#${mode}`);
    }
    lcarsAudio.play('navAcknowledge');
    this.requestUpdate();
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

  // Geordi 5.4.1 review #6: state-change toggles must announce per AUDIO-SPEC.
  _toggleThermal() {
    this._thermal = !this._thermal;
    lcarsAudio.play('navAcknowledge');
    this.requestUpdate();
  }

  // Reduce per-profile entity list into a vital-kind keyed dictionary.
  // v5.7.2 (5X-F35) — HYBRID multi-source mode: groups ALL entities of the same kind
  // into `variants[]`, picks the canonical via VITAL_SUFFIX_PRIORITY. Canonical drives
  // silhouette anchor + status rollup; variants render stacked under it in Zone C with
  // their source label (e.g. RESTING, AVG SLEEP, DEEP). Captain decision: show all
  // sources rather than hide duplicates behind a newest-timestamp coin flip.
  _reduceVitals(entities) {
    const byKind = new Map();
    for (const e of entities) {
      const kind = e.cls.kind;
      const ts = Date.parse(e.state.last_changed || e.state.last_updated || 0);
      // Withings reports BP in inHg when HA pressure UoM is imperial; convert to mmHg
      // for plausibility-gate compatibility (sys<40 → invalid would reject e.g. 4.13 inHg
      // which is actually ~105 mmHg). Audit finding F.
      const uom = (e.state.attributes && e.state.attributes.unit_of_measurement) || '';
      const rawVal = parseFloat(e.state.state);
      const isBp = e.cls.isSystolic || e.cls.isDiastolic;
      const val = (isBp && uom === 'inHg' && Number.isFinite(rawVal)) ? rawVal * 25.4 : rawVal;
      let cur = byKind.get(kind);
      if (!cur) {
        cur = { kind, variants: [], ts: 0 };
        byKind.set(kind, cur);
      }
      if (e.cls.isSystolic) {
        cur.systolic = val;
        cur.systolicEid = e.eid;
        cur.ts = Math.max(cur.ts, ts);
        continue;
      }
      if (e.cls.isDiastolic) {
        cur.diastolic = val;
        cur.diastolicEid = e.eid;
        cur.ts = Math.max(cur.ts, ts);
        continue;
      }
      const { priority, label } = entityPriority(kind, e.eid);
      cur.variants.push({
        value: val,
        eid: e.eid,
        ts,
        label: e.cls.sourceLabel || label || '',
        priority,
      });
      cur.ts = Math.max(cur.ts, ts);
    }
    // Resolve canonical per kind: lowest priority wins; ties broken by newest ts.
    for (const v of byKind.values()) {
      if (!v.variants || v.variants.length === 0) continue;
      v.variants.sort((a, b) => (a.priority - b.priority) || (b.ts - a.ts));
      // v5.8.0-beta.2 (Geordi+Wesley P1) — dedupe variants by (label, value) pair.
      // Multiple Withings/Oura entities can land on the same kind with the same
      // value (e.g. `_heart_rate` and `_current_heart_rate` both at 111), producing
      // duplicate rows like "HR 111 / HR 111".
      const seen = new Set();
      v.variants = v.variants.filter((vt) => {
        const k = `${vt.label || ''}::${vt.value}`;
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      });
      v.variants[0].isCanonical = true;
      // Back-compat aliases so _buildAnchors / _renderBiomedicalZone keep working.
      v.value = v.variants[0].value;
      v.eid = v.variants[0].eid;
    }
    return byKind;
  }

  // Build the silhouette anchor map: slot → { value, status, label, present }
  // `present: false` for slots with no resolved entity — these render as “—” but
  // are EXCLUDED from the rollup so a half-populated dashboard doesn't claim NOMINAL
  // it can't justify, OR (more importantly) doesn't drag the pill to OFFLINE just
  // because most slots are empty.
  _buildAnchors(vitalsByKind) {
    const anchors = {};
    const now = Date.now();
    for (const vc of MEDICAL_VITAL_CLASSES) {
      if (!vc.anchor) continue;
      const v = vitalsByKind.get(vc.kind);
      const numeric = vc && v ? (vc.kind === 'blood_pressure' ? v.systolic : v.value) : NaN;
      const secondary = vc.kind === 'blood_pressure' ? v?.diastolic : null;
      // #171 — stale (>24h) readings are demoted to OFFLINE regardless of numeric validity.
      const isStale = v && v.ts && (now - v.ts) > STALE_VITAL_MS;
      // #174 — implausible BP (sys<=dia, sys<40, sys>300, dia<20, dia>200) is dropped.
      const isImplausible = vc.kind === 'blood_pressure' && v && !_bpPlausible(v.systolic, v.diastolic);
      if (!v || numeric == null || isNaN(numeric) || isStale || isImplausible) {
        anchors[vc.anchor] = { value: '—', status: MEDICAL_STATUS.OFFLINE, label: vc.label, present: false };
        continue;
      }
      const status = computeStatus(vc.kind, numeric, DEFAULT_THRESHOLDS, secondary);
      const display = vc.kind === 'blood_pressure'
        ? formatVital('blood_pressure', v.systolic, v.diastolic)
        : `${formatVital(vc.kind, numeric)}`;
      // #116 / 5X-B39 — explicit `present: true` so the rollup gate (which filters on
      // present===true) can't accidentally exclude valid anchors. Earlier shape relied
      // on falsy absence of `present` and an `else !present` branch, which left this
      // branch with `present: undefined` → treated as missing by some consumers.
      anchors[vc.anchor] = { value: display, status, label: vc.label, present: true };
    }
    return anchors;
  }

  _renderHeader(profile, fileId, status) {
    const cols = decorativeNumerics(fileId, 3);
    const pillColor = STATUS_COLOR[status] || STATUS_COLOR.NOMINAL;
    const mode = this._focusMode;
    // 5.8.0-beta.1 (#176) — status pill legend. Tooltip describes the meaning of each
    // status tier; aria-describedby surfaces the same to AT.
    const pillLegend = `${status} — Biofunction rollup status. NOMINAL: all vitals in range. ELEVATED: at least one vital outside nominal band. ALERT: vital outside warning band. CRITICAL: life-threatening tier. OFFLINE: no recent data.`;
    const thermLegend = 'Thermal overlay — decorative gradient; not a calibrated thermal map.';
    return html`
      <header class="zone-a">
        <div class="title">MEDICAL REPORT
          <span class="file-id-sep" aria-hidden="true">·</span>
          <span class="file-id-label" aria-hidden="true">FILE ID</span>
          <span class="file-id" data-medical="phi"
                title="Profile file id (deterministic; not a patient number)"
                ?aria-hidden=${this._audioMuted}>${fileId}</span>
        </div>
        <div class="focus-tabs" aria-label="Scan focus mode">
          ${['summary', 'anatomical', 'biomedical'].map((m) => html`
            <button class="focus-tab ${mode === m ? 'active' : ''}"
                    aria-pressed=${mode === m}
                    @click=${() => this._setFocus(m)}>${m.toUpperCase()}</button>`)}
        </div>
        <div class="numerics" aria-hidden="true">
          ${cols.map((c) => html`<span class="numeric-col">${c}</span>`)}
        </div>
        <div class="header-actions">
          <button class="thermal-toggle ${this._thermal ? 'on' : ''}"
                  aria-pressed=${this._thermal}
                  aria-describedby="med-therm-legend"
                  title=${thermLegend}
                  @click=${() => this._toggleThermal()}>
            THERM
          </button>
          <span class="sr-only" id="med-therm-legend">${thermLegend}</span>
          <span class="status-pill" aria-live="polite"
                aria-describedby="med-status-legend"
                title=${pillLegend}
                style=${`background:${pillColor};color:#000`}>${status}</span>
          <span class="sr-only" id="med-status-legend">${pillLegend}</span>
        </div>
      </header>
    `;
  }

  // 5.3.1 — Anatomical scan: front + back silhouette pair. Back is a placeholder
  // until back-anchor SVG paths are authored. v5.8.0-beta.1 (#119): formally deferred
  // to 6.0 — ANTERIOR + BIOMEDICAL cover the operational use case.
  _renderAnatomicalZone(anchors) {
    return html`
      <section class="scan-pair" aria-label="Anatomical front + back scan">
        <div class="scan-pane" aria-label="Anterior">
          <div class="scan-cap">ANTERIOR</div>
          <lcars-anatomical-silhouette
            .paths=${MEDICAL_SILHOUETTE_PATHS}
            .anchorMap=${ANCHOR_MAP}
            .anchors=${anchors}
            .thermal=${this._thermal}
            .dataAttr=${{ name: 'medical', value: 'phi' }}
            .ariaLabel=${'Anterior biofunction silhouette'}
          ></lcars-anatomical-silhouette>
        </div>
        <div class="scan-pane placeholder" aria-label="Posterior">
          <div class="scan-cap">POSTERIOR</div>
          <div class="scan-pending">SCAN MODE PENDING — 6.0</div>
        </div>
      </section>
    `;
  }

  // 5.3.1 — Biomedical scan: ECG-style HR waveform + top-down silhouette placeholder.
  // ECG samples are derived directly from the present heart_rate vital (decorative
  // squarewave around the current value). No PHI leaves the closed shadow root.
  _renderBiomedicalZone(vitalsByKind, anchors) {
    const hrVital = vitalsByKind.get('heart_rate');
    const hrValue = hrVital && !isNaN(hrVital.value) ? hrVital.value : null;
    return html`
      <section class="scan-pair" aria-label="Biomedical waveform + top-down scan">
        <div class="scan-pane">
          <div class="scan-cap">ECG — HEART RATE</div>
          ${this._renderEcgWaveform(hrValue)}
        </div>
        <div class="scan-pane placeholder" aria-label="Top-down">
          <div class="scan-cap">TOP-DOWN</div>
          <div class="scan-pending">SCAN MODE PENDING — 6.0</div>
        </div>
      </section>
    `;
  }

  _renderEcgWaveform(bpm) {
    // Decorative ECG strip; not a clinical waveform. PHI: heart-rate value only.
    const haveBpm = bpm != null && !isNaN(bpm);
    const beats = haveBpm ? Math.max(2, Math.min(8, Math.round(bpm / 12))) : 4;
    const W = 600, H = 120, mid = H / 2;
    const pts = [];
    pts.push(`0,${mid}`);
    for (let i = 0; i < beats; i++) {
      const x = ((i + 0.5) * W) / beats;
      pts.push(`${x - 14},${mid}`);
      pts.push(`${x - 8},${mid + 6}`);
      pts.push(`${x - 4},${mid - 38}`);
      pts.push(`${x},${mid + 30}`);
      pts.push(`${x + 4},${mid - 6}`);
      pts.push(`${x + 12},${mid}`);
    }
    pts.push(`${W},${mid}`);
    const stroke = haveBpm ? 'var(--lcars-data-accent, #99cc99)' : 'var(--lcars-gray, #666688)';
    return html`
      <div class="ecg-wrap" data-medical="phi" ?aria-hidden=${this._audioMuted}>
        <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="Decorative ECG strip">
          <line x1="0" y1="${mid}" x2="${W}" y2="${mid}" stroke="rgba(153,204,255,0.15)" stroke-width="1"/>
          <polyline points=${pts.join(' ')} fill="none" stroke=${stroke} stroke-width="2" stroke-linejoin="round"/>
        </svg>
        <div class="ecg-readout" data-medical="phi">
          ${haveBpm ? `${Math.round(bpm)} BPM` : '—'}
        </div>
      </div>
    `;
  }

  _renderTiles(vitalsByKind, profileKey) {
    const tiles = MEDICAL_VITAL_CLASSES
      .filter((vc) => vc.tile)
      .slice(0, 16); // 5.8.0-beta.1 — raised from 12 to fit new Oura tiles.
    return html`
      <section class="zone-c" aria-label="Vital detail tiles">
        ${tiles.map((vc) => {
          // 5.8.0-beta.1 — composite tile (readiness) renders its own sub-lozenge layout.
          if (vc.composite && vc.kind === 'readiness') {
            return this._renderReadinessTile(vc, vitalsByKind.get(vc.kind), profileKey);
          }
          const v = vitalsByKind.get(vc.kind);
          // v5.7.2 hybrid: render canonical row + any additional variants stacked beneath.
          const variants = v && v.variants && v.variants.length ? v.variants : null;
          // 5.8.0-beta.1 — enum-typed value (e.g. stress_resilience as Oura
          // resilience_level "Strong"/"Solid"/"Low") renders as a label-only chip.
          const canonicalEntity = profileKey && v && v.eid;
          if (vc.kind === 'stress_resilience' && variants) {
            return this._renderEnumTile(vc, variants);
          }
          if (!variants) {
            return html`
              <div class="tile">
                <div class="tile-label">${vc.label}</div>
                <div class="tile-value tile-offline"
                     style=${`color:var(--lcars-gray, #666688)`}>—</div>
                <div class="tile-unit">${vc.unit}</div>
              </div>`;
          }
          // Status uses canonical only (Worf §1 isolation: thresholds applied to one number).
          const canonical = variants[0];
          const canonicalStatus = (canonical.value != null && !isNaN(canonical.value))
            ? computeStatus(vc.kind, canonical.value, DEFAULT_THRESHOLDS)
            : MEDICAL_STATUS.OFFLINE;
          const canonicalColor = STATUS_COLOR[canonicalStatus] || STATUS_COLOR.OFFLINE;
          // v5.8.0-beta.2 (Geordi+Wesley P1) — source pill suppressed when the source
          // label echoes the tile label (e.g. EFFICIENCY · EFFICIENCY).
          const showSrc = canonical.label && canonical.label.toUpperCase() !== vc.label.toUpperCase();
          return html`
            <div class="tile">
              <div class="tile-label">${vc.label}</div>
              <div class="tile-value" data-medical="phi"
                   aria-live="off"
                   ?aria-hidden=${this._audioMuted}
                   style=${`color:${canonicalColor}`}>${formatVital(vc.kind, canonical.value)}</div>
              <div class="tile-unit">${vc.unit}${showSrc ? html` · <span class="tile-source">${canonical.label}</span>` : ''}</div>
              ${variants.length > 1 ? html`
                <div class="tile-variants" aria-label="Additional sources">
                  ${variants.slice(1).map((vt) => html`
                    <div class="tile-variant">
                      <span class="tile-variant-label">${vt.label || '·'}</span>
                      <span class="tile-variant-value" data-medical="phi"
                            ?aria-hidden=${this._audioMuted}>${formatVital(vc.kind, vt.value)}</span>
                    </div>`)}
                </div>` : ''}
            </div>`;
        })}
      </section>
    `;
  }

  // 5.8.0-beta.1 — Readiness composite tile (Geordi recommendation).
  // Headline: Oura readiness_score 0-100 with status band.
  // Sub-lozenges: top-4 contributing sub-scores (resting_HR, HRV_balance, body_temp,
  // recovery_index) when present in the Oura entity inventory.
  _renderReadinessTile(vc, v, profileKey) {
    const variants = v && v.variants && v.variants.length ? v.variants : null;
    if (!variants) {
      // v5.8.0-beta.2 (Wesley P1) — when readiness has no data, collapse to a normal
      // 1-col tile (drop `tile-composite` span) so Withings-only dashboards don't show
      // a wide empty rectangle in the middle of the grid.
      return html`
        <div class="tile">
          <div class="tile-label">${vc.label}</div>
          <div class="tile-value tile-offline"
               style=${`color:var(--lcars-gray, #666688)`}>—</div>
          <div class="tile-unit">${vc.unit}</div>
        </div>`;
    }
    const canonical = variants[0];
    const status = (canonical.value != null && !isNaN(canonical.value))
      ? computeStatus('readiness', canonical.value, DEFAULT_THRESHOLDS)
      : MEDICAL_STATUS.OFFLINE;
    const color = STATUS_COLOR[status] || STATUS_COLOR.OFFLINE;
    const subs = profileKey ? discoverReadinessSubscores(this._hass, profileKey) : [];
    const showSrc = canonical.label && canonical.label.toUpperCase() !== vc.label.toUpperCase();
    return html`
      <div class="tile tile-composite">
        <div class="tile-label">${vc.label}</div>
        <div class="tile-value tile-value-large" data-medical="phi"
             aria-live="off"
             ?aria-hidden=${this._audioMuted}
             style=${`color:${color}`}>${formatVital('readiness', canonical.value)}</div>
        <div class="tile-unit">${vc.unit}${showSrc ? html` · <span class="tile-source">${canonical.label}</span>` : ''}</div>
        ${subs.length ? html`
          <div class="tile-sublozenges" aria-label="Readiness contributors">
            ${subs.map((s) => html`
              <div class="sublozenge sublozenge-${s.status.toLowerCase()}">
                <span class="sublozenge-label">${s.label}</span>
                <span class="sublozenge-value" data-medical="phi"
                      ?aria-hidden=${this._audioMuted}>${s.value}</span>
              </div>`)}
          </div>` : ''}
      </div>`;
  }

  // 5.8.0-beta.1 — Enum vital tile (e.g. Oura resilience_level "Great"/"Strong"/"Solid"/"Low").
  // Status is derived from the enum string itself rather than a numeric threshold.
  _renderEnumTile(vc, variants) {
    const canonical = variants[0];
    const raw = String(canonical.value ?? '').toLowerCase();
    let status = MEDICAL_STATUS.NOMINAL;
    if (/low|exceptional/.test(raw))   status = MEDICAL_STATUS.ALERT;
    else if (/solid|adequate/.test(raw)) status = MEDICAL_STATUS.ELEVATED;
    else if (!raw || raw === 'unknown' || raw === 'unavailable') status = MEDICAL_STATUS.OFFLINE;
    const color = STATUS_COLOR[status] || STATUS_COLOR.OFFLINE;
    const showSrc = canonical.label && canonical.label.toUpperCase() !== vc.label.toUpperCase();
    return html`
      <div class="tile">
        <div class="tile-label">${vc.label}</div>
        <div class="tile-value tile-value-enum" data-medical="phi"
             aria-live="off"
             ?aria-hidden=${this._audioMuted}
             style=${`color:${color}`}>${formatVital('enum', canonical.value)}</div>
        <div class="tile-unit">${vc.unit}${showSrc ? html` · <span class="tile-source">${canonical.label}</span>` : ''}</div>
      </div>`;
  }

  // 5.8.0-beta.1 (Worf Gap E) — Rest mode banner. Surfaces when Oura's rest_mode binary
  // sensor is on OR resilience drops to a "rest required" level. Butterscotch for
  // routine recovery, tomato for sick/illness. Audio cue on transition handled in
  // `updated()` lifecycle.
  _renderRestBanner(profileKey) {
    if (!profileKey || this._restMode === 'off') return '';
    const isSick = this._restMode === 'sick';
    const bg = isSick ? 'var(--lcars-tomato, #ff6666)' : 'var(--lcars-butterscotch, #ffaa44)';
    const fg = '#000';
    const text = isSick
      ? 'ILLNESS SIGNAL DETECTED — REST RECOMMENDED'
      : 'REST MODE ACTIVE — RECOVERY PROTOCOLS ENGAGED';
    return html`
      <div class="rest-banner" role="status" aria-live="polite"
           style=${`background:${bg};color:${fg}`}>
        <span class="rest-banner-icon" aria-hidden="true">${isSick ? '⚠' : '◐'}</span>
        <span class="rest-banner-text">${text}</span>
      </div>`;
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
        ${profiles.map((profile) => {
          const fileId = fileIdFor(profile.profileId);
          const consentGranted = this._consentByFile[fileId] ?? hasConsent(fileId);
          const vitalsByKind = consentGranted ? this._reduceVitals(profile.entities) : new Map();
          const anchors = this._buildAnchors(vitalsByKind);
          // 5.8.0-beta.1 (Worf Gap E) — rest mode lookup runs once per render. Result
          // is cached on the instance so the audio-cue transition logic in updated()
          // can compare against the previous value without re-walking hass.states.
          if (consentGranted) {
            const rm = findRestModeState(this._hass, profile.profileId);
            this._restMode = classifyRestMode(rm ? rm.state : null);
          } else {
            this._restMode = 'off';
          }
          // Rollup: only consider slots where data is actually present. An empty
          // dashboard with most anchors unresolved should not show OFFLINE everywhere
          // — OFFLINE means “data source went stale”, not “user hasn't installed it yet”.
          const presentStatuses = Object.values(anchors)
            .filter((a) => a && a.present)
            .map((a) => a.status);
          const overall = !consentGranted
            ? MEDICAL_STATUS.OFFLINE
            : (presentStatuses.length ? rollupStatus(presentStatuses) : MEDICAL_STATUS.NOMINAL);

          return html`
            <article class="biofunction-card" aria-labelledby=${`med-h-${fileId}`}>
              <h2 id=${`med-h-${fileId}`} class="sr-only">Biofunction card ${fileId}</h2>
              ${this._renderHeader(profile, fileId, overall)}
              ${this._renderRestBanner(profile.profileId)}
              ${this._focusMode === 'anatomical' ? this._renderAnatomicalZone(anchors)
                : this._focusMode === 'biomedical' ? this._renderBiomedicalZone(vitalsByKind, anchors)
                : html`
                  <section class="zone-b" aria-label="Anatomical vital map">
                    <lcars-anatomical-silhouette
                      .paths=${MEDICAL_SILHOUETTE_PATHS}
                      .anchorMap=${ANCHOR_MAP}
                      .anchors=${anchors}
                      .thermal=${this._thermal}
                      .dataAttr=${{ name: 'medical', value: 'phi' }}
                      .ariaLabel=${'Biofunction silhouette'}
                    ></lcars-anatomical-silhouette>
                    ${!consentGranted ? this._renderConsentGate(fileId) : ''}
                  </section>
                  ${this._renderTiles(vitalsByKind, profile.profileId)}
                `}
              ${this._focusMode !== 'summary' && !consentGranted ? this._renderConsentGate(fileId) : ''}
            </article>`;
        })}
      </div>
    `;
  }

  // 5.8.0-beta.1 (Worf Gap E) — audio cue on rest-mode transition. One ackPositive
  // chime entering rest/sick mode, one ackNegative exiting back to 'off'. Mute switch
  // honored via lcarsAudio.isMuted internally (no extra check needed here).
  updated() {
    if (this._restMode !== this._lastRestMode) {
      if (this._lastRestMode === 'off' && this._restMode !== 'off') {
        lcarsAudio.play(this._restMode === 'sick' ? 'navError' : 'navAcknowledge');
      } else if (this._restMode === 'off' && this._lastRestMode !== 'off') {
        lcarsAudio.play('navAcknowledge');
      }
      this._lastRestMode = this._restMode;
    }
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
          grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
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
        /* #175 — LCARS separator dot between report title and file id (was bare whitespace). */
        .file-id-sep { margin: 0 0.25rem 0 0.4rem; opacity: 0.7; }
        /* #172 — one-font rule: file-id / numeric-col use the LCARS Antonio stack, not Courier. */
        .file-id { font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 0.95rem; letter-spacing: 0.06em; }
        .numerics { display: flex; gap: 0.6rem; flex: 1 1 auto; justify-content: center; opacity: 0.85; }
        .numeric-col {
          font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 0.85rem; letter-spacing: 0.06em;
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
        lcars-anatomical-silhouette { width: 100%; height: 100%; min-height: 320px; max-height: 480px; aspect-ratio: 200 / 480; }
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
        .tile-source {
          color: var(--lcars-african-violet, #cc99ff);
          letter-spacing: 0.1em;
          margin-left: 0.15rem;
        }
        .tile-variants {
          margin-top: 0.25rem;
          display: flex; flex-direction: column; gap: 0.1rem;
          border-top: 1px solid rgba(153, 204, 255, 0.18);
          padding-top: 0.2rem;
        }
        .tile-variant {
          display: flex; justify-content: space-between; align-items: baseline;
          gap: 0.5rem; font-size: 0.7rem;
        }
        .tile-variant-label {
          color: var(--lcars-african-violet, #cc99ff);
          letter-spacing: 0.08em; opacity: 0.85;
        }
        .tile-variant-value {
          color: var(--lcars-ice, #99ccff);
          font-variant-numeric: tabular-nums;
        }
        .tile-offline {
          font-size: 1.4rem; font-weight: 700; line-height: 1;
        }
        /* 5.8.0-beta.1 — Composite tile (readiness). Spans 2 columns on wide screens
           to give the headline + sub-lozenges room. Geordi recommendation. */
        .tile-composite {
          grid-column: span 2;
        }
        .tile-value-large {
          font-size: 2rem; font-weight: 700; line-height: 1;
        }
        .tile-value-enum {
          font-size: 1.1rem; font-weight: 600; letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .tile-sublozenges {
          margin-top: 0.4rem;
          display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.25rem;
        }
        .sublozenge {
          display: flex; justify-content: space-between; align-items: baseline;
          padding: 0.25rem 0.55rem;
          border-radius: 0.6rem;
          font-size: 0.75rem;
          /* 5.8.0-beta.2 (Geordi P1) — raise background contrast so sub-lozenges
             register against the dark biofunction card body. */
          background: rgba(153, 204, 255, 0.12);
          border-left: 3px solid var(--lcars-ice, #99ccff);
        }
        .sublozenge-label {
          color: var(--lcars-ice, #99ccff);
          letter-spacing: 0.08em; opacity: 0.85;
        }
        .sublozenge-value {
          font-weight: 700; font-variant-numeric: tabular-nums;
        }
        .sublozenge-nominal  { border-left-color: var(--lcars-data-accent, #99cc99); }
        .sublozenge-elevated { border-left-color: var(--lcars-gold, #ffaa00); }
        .sublozenge-alert    { border-left-color: var(--lcars-alert, #cc6666); }
        .sublozenge-offline  { border-left-color: var(--lcars-gray, #666688); opacity: 0.6; }
        /* 5.8.0-beta.1 (Worf Gap E) — Rest mode banner. Butterscotch for routine
           rest-mode; tomato for sick. Strong visual weight so it isn't missed in a
           glance scan of vitals. */
        .rest-banner {
          display: flex; align-items: center; gap: 0.6rem;
          padding: 0.5rem 0.8rem;
          font-family: var(--lcars-font, 'Antonio', sans-serif);
          font-weight: 700; letter-spacing: 0.08em;
          text-transform: uppercase;
          border-radius: 0 0.6rem 0.6rem 0;
          border-left: 4px solid #000;
          margin-bottom: 0.5rem;
        }
        .rest-banner-icon { font-size: 1.2rem; line-height: 1; }
        .rest-banner-text { font-size: 0.85rem; }
        /* 5.8.0-beta.1 (#175) — FILE ID label clarifies the identifier.
           5.8.0-beta.2 (Wesley P0) — butterscotch + higher opacity so the label
           reads cleanly against the dark header AND doesn't visually merge with
           the screenshot-obfuscator's redaction rect on the adjacent file-id span. */
        .file-id-label {
          font-size: 0.7rem; letter-spacing: 0.14em; font-weight: 700;
          color: var(--lcars-butterscotch, #ffaa44); opacity: 0.95;
          margin-right: 0.45rem;
        }
        @media (max-width: 720px) {
          .zone-c { grid-template-columns: repeat(2, 1fr); }
          .tile-composite { grid-column: span 2; }
          .tile-value-large { font-size: 1.5rem; }
        }
        @media (max-width: 480px) {
          .tile-sublozenges { grid-template-columns: 1fr; }
          .rest-banner-text { font-size: 0.75rem; }
        }

        /* Focus tabs (5.3.1) — #173: --lcars-african-violet fallback corrected from
           off-palette #cc99cc to the actual palette value #cc99ff. */
        .focus-tabs { display: flex; gap: 0.25rem; margin-left: 0.5rem; }
        .focus-tab {
          background: var(--lcars-bg-elev, #111);
          color: var(--lcars-ice, #99ccff);
          border: 1px solid var(--lcars-african-violet, #cc99ff);
          border-radius: 999px;
          padding: 0.25rem 0.7rem;
          min-height: 32px;
          font: inherit;
          font-size: 0.7rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
        }
        .focus-tab:focus-visible { outline: 2px solid var(--lcars-ice, #99ccff); outline-offset: 2px; }
        .focus-tab.active { background: var(--lcars-african-violet, #cc99ff); color: #000; }

        /* Scan-pair layout (anatomical / biomedical modes) */
        .scan-pair {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
          min-height: 420px;
        }
        @media (max-width: 720px) { .scan-pair { grid-template-columns: 1fr; } }
        .scan-pane {
          position: relative;
          background: rgba(153, 204, 255, 0.04);
          border-left: 3px solid var(--lcars-african-violet, #cc99ff);
          border-radius: 0 0.4rem 0.4rem 0;
          display: flex; flex-direction: column;
          padding: 0.5rem;
          min-height: 380px;
        }
        .scan-cap {
          font-size: 0.7rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--lcars-african-violet, #cc99ff);
          margin-bottom: 0.4rem;
        }
        .scan-pane.placeholder { border-left-color: var(--lcars-gray, #666688); }
        .scan-pending {
          flex: 1;
          display: flex; align-items: center; justify-content: center;
          color: var(--lcars-gray, #888);
          font-size: 0.85rem; letter-spacing: 0.1em;
          text-transform: uppercase;
          background: repeating-linear-gradient(45deg,
            rgba(102,102,136,0.05),
            rgba(102,102,136,0.05) 12px,
            transparent 12px,
            transparent 24px);
          border-radius: 0.3rem;
        }
        .ecg-wrap { flex: 1; display: flex; flex-direction: column; gap: 0.5rem; }
        .ecg-wrap svg { width: 100%; height: 220px; }
        .ecg-readout {
          font-family: var(--lcars-font, 'Antonio', sans-serif);
          font-size: 2.2rem;
          font-weight: 700;
          color: var(--lcars-data-accent, #99cc99);
          letter-spacing: 0.08em;
          text-align: center;
        }
      `,
    ];
  }
}

if (!customElements.get('lcars-medical-card')) {
  customElements.define('lcars-medical-card', LcarsMedicalCard);
}
