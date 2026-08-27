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
import { showMoreInfo, defineLcars } from './lcars-helpers.js';
import './lcars-anatomical-silhouette.js';
// 5.14.0-beta.1 — new primitives wired into BIOMEDICAL focus mode (no HAI deps).
import './lcars-hr-zones.js';
import './lcars-bp-range.js';
import './lcars-sleep-score-bar.js';
// 5.15.0-beta.1 — Stories 5–6 HAI-dependent primitives.
import './lcars-ecg-strip.js';
import './lcars-hypnogram.js';
import './lcars-workout-route.js';
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
  // 5.15.0-beta.1 (Worf §7.7) — second-layer ECG waveform consent.
  hasEcgConsent,
  grantEcgConsent,
  formatVital,
  MEDICAL_STATUS,
  entityPriority,
  findRestModeState,
  classifyRestMode,
  discoverReadinessSubscores,
  convertImperial,
  // 5.14.0-beta.1 (crew C2 / Wesley #2)
  vitalKindsForTab,
  MEDICAL_SOURCE_PRIORITY,
  sourceChipForEntity,
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

// 5.12.0-beta.6 — body composition composite. The WEIGHT tile absorbs these
// kinds as breakdown rows so the BIOMEDICAL grid isn't an 8-tile sprawl.
// Order is the row order shown inside the tile.
const BODY_COMP_CHILDREN = [
  { kind: 'muscle_mass',  label: 'MUSCLE' },
  { kind: 'lean_mass',    label: 'LEAN' },
  { kind: 'fat_mass',     label: 'FAT' },
  { kind: 'body_fat_pct', label: 'BODY FAT' },
  { kind: 'bone_mass',    label: 'BONE' },
  { kind: 'visceral_fat', label: 'VISCERAL' },
  { kind: 'hydration',    label: 'HYDRO' },
  { kind: 'bmi',          label: 'BMI' },
];
const BODY_COMP_CHILD_KINDS = new Set(BODY_COMP_CHILDREN.map((c) => c.kind));

// 5.14.0-beta.2 (crew S1-2 / spec C13) — empty-state helpers shared by the
// composite tile + inline composite render paths. These exist because beta.1
// leaked literal 'NaN' / 'undefined' / 'null' strings to user-visible text
// whenever a composite child value was upstream-typed as a number that came
// out of `parseFloat` as NaN. `_isEnumValueDisplayable` rejects every flavor
// of "missing" we've seen in HA states; `_formatEnum` uppercases + replaces
// underscores so the visible text reads like the rest of LCARS chrome.
function _isEnumValueDisplayable(v) {
  if (v == null) return false;
  if (typeof v === 'number') return Number.isFinite(v);
  const s = String(v).trim().toLowerCase();
  if (s === '' || s === 'unknown' || s === 'unavailable' || s === 'none' || s === 'null') return false;
  if (s === 'nan' || s === 'undefined') return false;
  return true;
}
function _formatEnum(v) {
  return String(v).toUpperCase().replace(/_/g, ' ');
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
      // 5.15.0-beta.7 — multi-day history for PHYSIOLOGY tab panels
      _workoutHistory: { type: Array },
      _sleepHistory: { type: Array },
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
    // 5.14.0-beta.2 (Worf W6.1) — cache-revision ticker propagated to every
    // PHI primitive (<lcars-bp-range>, <lcars-hr-zones>, <lcars-sleep-score-bar>).
    // Bumped on focus-mode change (URL profile switch surrogate today since the
    // card serves one profile per URL), consent grant/revoke, and the standard
    // `lcars-medical-consent-changed` / `lcars-binding-changed` window events.
    // The primitives wipe their LTTB / recorder / contributor caches on each
    // bump so PHI from a prior profile/consent state cannot survive a switch.
    this._cacheRevision = 0;
    // 5.15.0-beta.7 — history load state for multi-day panels
    this._workoutHistory = null;
    this._sleepHistory = null;
    this._historyLoadKey = '';
    this._historyLoading = false;
    this._onHashChange = () => {
      const next = this._readFocusFromHash();
      if (next !== this._focusMode) {
        this._focusMode = next;
        this._cacheRevision += 1;  // focus-mode change → flush primitive caches (W6 trigger a)
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
    // 5.14.0-beta.2 (Worf W6.1) — explicit consent / binding change events
    // wipe primitive caches. Other LCARS code can dispatch either event when
    // it knows a relevant change has happened; the medical card listens to
    // both and bumps the cacheRevision in lockstep.
    this._onConsentChanged = () => { this._cacheRevision += 1; this.requestUpdate(); };
    this._onBindingChanged = () => { this._cacheRevision += 1; this.requestUpdate(); };
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('hashchange', this._onHashChange);
    window.addEventListener('lcars-audio-mute-changed', this._onMuteChange);
    window.addEventListener('lcars-medical-consent-changed', this._onConsentChanged);
    window.addEventListener('lcars-binding-changed', this._onBindingChanged);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('hashchange', this._onHashChange);
    window.removeEventListener('lcars-audio-mute-changed', this._onMuteChange);
    window.removeEventListener('lcars-medical-consent-changed', this._onConsentChanged);
    window.removeEventListener('lcars-binding-changed', this._onBindingChanged);
  }

  _readFocusFromHash() {
    const h = (window.location.hash || '').replace(/^#/, '').toLowerCase();
    // 5.15.0-beta.7 — accept display-name hashes (physiology/cardiology) as aliases
    // for the internal mode names (anatomical/biomedical). Back-compat: old anchors
    // (anatomical/biomedical) still work so existing bookmarks aren't broken.
    if (h === 'anatomical' || h === 'physiology') return 'anatomical';
    if (h === 'biomedical' || h === 'cardiology') return 'biomedical';
    return 'summary';
  }

  _setFocus(mode) {
    if (mode === this._focusMode) return;
    this._focusMode = mode;
    if (mode === 'summary') {
      // Drop the fragment cleanly without scrolling.
      history.replaceState(null, '', window.location.pathname + window.location.search);
    } else if (mode === 'anatomical') {
      // 5.15.0-beta.7 — push the visual label as the hash, not the internal mode
      history.replaceState(null, '', '#physiology');
    } else if (mode === 'biomedical') {
      history.replaceState(null, '', '#cardiology');
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
    // 5.14.0-beta.2 (Worf W6.1) — consent transition bumps the cache ticker
    // so any PHI primitive caches from a prior "consent denied" state cannot
    // survive the transition (and vice versa on revoke).
    this._cacheRevision += 1;
    lcarsAudio.play('navAcknowledge');
    this.requestUpdate();
  }

  // Geordi 5.4.1 review #6: state-change toggles must announce per AUDIO-SPEC.
  _toggleThermal() {
    this._thermal = !this._thermal;
    lcarsAudio.play('navAcknowledge');
    this.requestUpdate();
  }

  // 5.11.0-beta.1 (Captain explicit ask): tiles backed by a real entity open the
  // standard HA more-info dialog when activated. Audio cue on activation matches
  // the rest of the dashboard's interaction grammar; PHI is never logged.
  _openMoreInfo(entityId) {
    if (!entityId) return;
    lcarsAudio.play('navAcknowledge');
    showMoreInfo(entityId);
  }

  _tileKeydown(ev, entityId) {
    if (ev.key === 'Enter' || ev.key === ' ' || ev.key === 'Spacebar') {
      ev.preventDefault();
      this._openMoreInfo(entityId);
    }
  }

  // Wraps a tile body in either a clickable shell (when an entity_id is bound)
  // or a plain shell. Two literal templates avoid lit-html 1.x conditional-attribute
  // pitfalls (no `?tabindex` — that prefix is reserved for HTML boolean attributes).
  _wrapTile(label, entityId, body, extraClass = '') {
    if (entityId) {
      const aria = `${label} — open details`;
      return html`
        <div class="tile tile-clickable ${extraClass}"
             tabindex="0" role="button" aria-label=${aria}
             @click=${() => this._openMoreInfo(entityId)}
             @keydown=${(ev) => this._tileKeydown(ev, entityId)}>
          ${body}
        </div>`;
    }
    return html`<div class="tile ${extraClass}">${body}</div>`;
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
      let val;
      if (isBp && uom === 'inHg' && Number.isFinite(rawVal)) {
        val = rawVal * 25.4;
      } else if (!isBp && Number.isFinite(rawVal)) {
        // 5.13.x — normalize imperial units from HealthyApps MQTT bridge
        // (mi, mph, in, ft, ft/s, °F, lb) to metric so thresholds, sparklines,
        // and tile rendering all see a single unit system per kind.
        val = convertImperial(rawVal, uom).value;
      } else {
        val = rawVal;
      }
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
      // 5.12.0-beta.6 — dedupe by label only (was `${label}::${value}`). The same
      // semantic label coming from multiple integrations (e.g. HAE `_heart_rate_avg`
      // 84 vs Oura `_average_heart_rate` 77 both labeled AVG) was producing two
      // visually-identical AVG rows with divergent numbers, which is confusing.
      // First-by-priority wins; the alternate source value is dropped.
      const seen = new Set();
      v.variants = v.variants.filter((vt) => {
        const k = (vt.label || '').toUpperCase();
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      });
      // 5.14.0-beta.2 (crew S2-3) — enforce MEDICAL_SOURCE_PRIORITY by
      // re-promoting the highest-platform-priority variant to the canonical
      // slot when the kind has a declared priority list. The original suffix
      // priority still drives variant order within a single platform; the
      // platform table just chooses which platform's CURRENT-reading wins
      // for the silhouette / headline value. Variants from other platforms
      // are NOT removed — they continue to render as stacked rows under the
      // canonical so the captain can still see HAE-vs-Oura comparisons.
      const platformList = MEDICAL_SOURCE_PRIORITY[v.kind];
      if (Array.isArray(platformList) && platformList.length > 0 && v.variants.length > 1) {
        const platformOf = (eid) => {
          const id = String(eid || '').toLowerCase();
          if (/^[^.]+\.oura_/.test(id)) return 'oura';
          if (/^[^.]+\.withings_/.test(id) || /^[^.]+\.bpm_connect_/.test(id)) return 'withings';
          if (/^[^.]+\.health_auto_import_/.test(id)) return 'health_auto_import';
          if (/^[^.]+\.health_auto_export_/.test(id)) return 'health_auto_export';
          if (/^hae\./.test(id)) return 'hae';
          if (/^apple_health\./.test(id)) return 'apple_health';
          if (/^[^.]+\.fitbit_/.test(id)) return 'fitbit';
          if (/^[^.]+\.garmin_/.test(id)) return 'garmin_connect';
          if (/^[^.]+\.dexcom_/.test(id)) return 'dexcom';
          // Treat MQTT entities by namespace (HealthyApps HAE MQTT bridge)
          if (/_health_auto_export_/.test(id)) return 'mqtt';
          return 'unknown';
        };
        // Find the variant whose platform is HIGHEST in the priority list AND
        // whose value is finite. If found and it's not already index 0, move it.
        let bestIdx = -1;
        let bestRank = Infinity;
        for (let i = 0; i < v.variants.length; i++) {
          const vt = v.variants[i];
          if (vt.value == null || (typeof vt.value === 'number' && !Number.isFinite(vt.value))) continue;
          const rank = platformList.indexOf(platformOf(vt.eid));
          if (rank === -1) continue;
          if (rank < bestRank) { bestRank = rank; bestIdx = i; }
        }
        if (bestIdx > 0) {
          const [winner] = v.variants.splice(bestIdx, 1);
          v.variants.unshift(winner);
        }
      }
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

  _renderHeader(profile, fileId, status, anchors = {}) {
    const cols = decorativeNumerics(fileId, 3);
    // 5.14.0-beta.1 (Wesley #6) — RECOVERY MODE pill modifier. When Oura
    // rest_mode is on/sick the status pill displays `RECOVERY MODE · DAY N`
    // (amber) regardless of the underlying reducer, preserving the "ship takes
    // care of you" tone. Day count derived from rest_mode_start when present.
    const isRecovery = this._restMode === 'rest' || this._restMode === 'sick';
    let pillText = status;
    let pillColor = STATUS_COLOR[status] || STATUS_COLOR.NOMINAL;
    if (isRecovery) {
      const days = this._restModeDayCount(profile.profileId);
      pillText = days ? `RECOVERY MODE · DAY ${days}` : 'RECOVERY MODE';
      pillColor = STATUS_COLOR[MEDICAL_STATUS.ELEVATED];
    }
    // 5.14.0-beta.2 (crew S2-5) — surface WHY the pill is non-NOMINAL by
    // naming the worst anchor (severity > NOMINAL) driving the rollup. The
    // sub-line uses the standard `data-medical="phi"` redaction tag so the
    // numeric value blackouts cleanly under the screenshot obfuscator.
    let whyLabel = null;
    let whyValue = null;
    if (!isRecovery && status !== MEDICAL_STATUS.NOMINAL && status !== MEDICAL_STATUS.OFFLINE) {
      const SEVERITY_RANK = {
        [MEDICAL_STATUS.NOMINAL]:  0,
        [MEDICAL_STATUS.OFFLINE]:  0,
        [MEDICAL_STATUS.ELEVATED]: 1,
        [MEDICAL_STATUS.ALERT]:    2,
        [MEDICAL_STATUS.CRITICAL]: 3,
      };
      let worst = null;
      let worstRank = -1;
      for (const slot of Object.keys(anchors || {})) {
        const a = anchors[slot];
        if (!a || !a.present) continue;
        const rank = SEVERITY_RANK[a.status] || 0;
        if (rank > worstRank) { worst = a; worstRank = rank; }
      }
      if (worst) { whyLabel = worst.label; whyValue = worst.value; }
    }
    const mode = this._focusMode;
    // 5.8.0-beta.1 (#176) — status pill legend. Tooltip describes the meaning of each
    // status tier; aria-describedby surfaces the same to AT.
    const pillLegend = isRecovery
      ? `${pillText} — Oura recovery / rest mode is active. Vital thresholds are not enforced; recover at your own pace.`
      : `${status} — Biofunction rollup status. NOMINAL: all vitals in range. ELEVATED: at least one vital outside nominal band. ALERT: vital outside warning band. CRITICAL: life-threatening tier. OFFLINE: no recent data.`;
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
          ${[
            { mode: 'summary', label: 'SUMMARY' },
            { mode: 'anatomical', label: 'PHYSIOLOGY' },
            { mode: 'biomedical', label: 'CARDIOLOGY' },
          ].map(({ mode: m, label }) => html`
            <button class="focus-tab ${mode === m ? 'active' : ''}"
                    aria-pressed=${mode === m}
                    @click=${() => this._setFocus(m)}>${label}</button>`)}
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
          <div class="status-pill-group">
            <span class="status-pill ${isRecovery ? 'status-pill-recovery' : ''}"
                  aria-live="polite"
                  aria-describedby="med-status-legend"
                  title=${pillLegend}
                  style=${`background:${pillColor};color:#000`}>${pillText}</span>
            ${whyLabel ? html`
              <span class="status-why" aria-live="polite">
                ${whyLabel} <span data-medical="phi" ?aria-hidden=${this._audioMuted}>${whyValue}</span>
              </span>` : ''}
          </div>
          <span class="sr-only" id="med-status-legend">${pillLegend}</span>
        </div>
      </header>
    `;
  }

  // 5.3.1 — Anatomical scan: front silhouette plus conditioning panel.
  // 5.15.x refinement: remove placeholder scan panes and reuse this tab for
  // weight/sleep/workout surfaces to reduce BIOMEDICAL density.
  // 5.14.0-beta.1 (crew C2) — appends a tile strip filtered to the ANATOMICAL
  // kinds (body composition + mobility + fitness gauges). Kinds are routed via
  // `tabs[]` on MEDICAL_VITAL_CLASSES.
  //
  // 5.15.0-beta.1 (S2-anat): anchor set is restricted to body-composition
  // kinds whose `tabs[]` includes 'anatomical'. Today only `weight` (abdomen)
  // carries an anchor — everything else is anchor-null and renders as tiles
  // below. Anchors NOT in the allowed set are OMITTED ENTIRELY (not
  // dash-padded) so the silhouette is sparse instead of dash-spammed.
  _renderAnatomicalZone(anchors, vitalsByKind = new Map(), profileKey = null) {
    const allowed = new Set(
      MEDICAL_VITAL_CLASSES
        .filter((vc) => vc.anchor && Array.isArray(vc.tabs) && vc.tabs.includes('anatomical'))
        .map((vc) => vc.anchor)
    );
    const filtered = {};
    for (const slot of Object.keys(anchors)) {
      if (allowed.has(slot)) filtered[slot] = anchors[slot];
    }
    const workoutRouteProps = this._workoutPropsFor(profileKey);
    const sleepAttrs = this._sleepAttrsFor(profileKey);
    // 5.15.0-beta.7 — kick off history load (no-op if already running/cached)
    this._maybeLoadHistory(profileKey);
    // Derive recordedAt for sleep score from the night_end attribute or sensor last_changed
    const sleepAnalysisId = this._sleepAnalysisEntityFor(profileKey);
    const sleepSt = sleepAnalysisId && this._hass && this._hass.states && this._hass.states[sleepAnalysisId];
    const sleepRecordedAt = (sleepSt && sleepAttrs && sleepAttrs.night_end) || (sleepSt && sleepSt.last_changed) || null;
    return html`
      <section class="scan-pair" aria-label="Anatomical front + back scan">
        <div class="scan-pane" aria-label="Anterior">
          <div class="scan-cap">ANTERIOR</div>
          <lcars-anatomical-silhouette
            .paths=${MEDICAL_SILHOUETTE_PATHS}
            .anchorMap=${ANCHOR_MAP}
            .anchors=${filtered}
            .thermal=${this._thermal}
            .viewBox=${'-110 0 420 480'}
            .bodyBox=${'0 0 200 480'}
            .dataAttr=${{ name: 'medical', value: 'phi' }}
            .ariaLabel=${'Anterior biofunction silhouette'}
          ></lcars-anatomical-silhouette>
        </div>
        <div class="scan-pane" aria-label="Workout route">
          <div class="scan-cap">LAST WORKOUT — ROUTE</div>
          <lcars-workout-route
            .workoutAttrs=${workoutRouteProps.workoutAttrs}
            .startedIso=${workoutRouteProps.startedIso}
            .endedIso=${workoutRouteProps.endedIso}
            .workoutHistory=${this._workoutHistory}
            .cacheRevision=${this._cacheRevision}
          ></lcars-workout-route>
        </div>
      </section>
      <section class="scan-pair" aria-label="Sleep surfaces">
        <div class="scan-pane">
          <div class="scan-cap">SLEEP SCORE</div>
          <lcars-sleep-score-bar
            .score=${this._extractSleepScore(vitalsByKind)}
            .contributors=${this._extractSleepContributors(vitalsByKind, profileKey)}
            .recordedAt=${sleepRecordedAt}
            .scoreHistory=${this._sleepHistory}
            .cacheRevision=${this._cacheRevision}
          ></lcars-sleep-score-bar>
        </div>
        <div class="scan-pane">
          <div class="scan-cap">SLEEP STAGES — LAST NIGHT</div>
          <lcars-hypnogram
            .sleepAttrs=${sleepAttrs}
            .sleepHistory=${this._sleepHistory}
            .suppressTimestamps=${false}
            .cacheRevision=${this._cacheRevision}
          ></lcars-hypnogram>
        </div>
      </section>
      ${this._renderTiles(vitalsByKind, profileKey, 'anatomical')}
    `;
  }

  // 5.3.1 — Biomedical scan: cardiac detail panes.
  // 5.15.x refinement — promote the real ECG waveform into the top pane and
  // replace the duplicate lower waveform section with a heart-rate metrics panel.
  //
  // 5.13.x — when HealthyApps MQTT Apple ECG entities are present, the right pane
  // replaces the SCAN MODE PENDING placeholder with a real HR ALERTS composite,
  // and the left pane appends an ECG composite summary beneath the decorative
  // waveform.
  //
  // 5.14.0-beta.1 (crew C2) — appends the cardiac-tile strip filtered to the
  // BIOMEDICAL kinds, and below that wires the three new v5.14 primitives:
  // `<lcars-bp-range>` (30-day BP min/max/avg) and `<lcars-hr-zones>` (HR zone
  // bars for the most recent workout). When neither workout HR nor a BP series
  // is present, the new primitives render their own NO DATA empty states.
  _renderBiomedicalZone(vitalsByKind, anchors, profileKey = null) {
    const hrVital = vitalsByKind.get('heart_rate');
    const ecg = vitalsByKind.get('ecg');
    const hrAlerts = vitalsByKind.get('hr_notifications');
    const hasEcg = ecg && ecg.variants && ecg.variants.length;
    const hasHrAlerts = hrAlerts && hrAlerts.variants && hrAlerts.variants.length;
    // 5.14.0-beta.1 — workout HR primitive props from existing HAI/Withings sensors.
    const workout = this._extractLastWorkout(profileKey);
    // 5.14.0-beta.1 — derive person max-HR estimate (220 - age) from person.birthdate
    // when present; otherwise null → <lcars-hr-zones> renders its "set birthdate" pill.
    const personMaxHrEst = this._personMaxHrEstimate(profileKey);
    // 5.15.0-beta.1 (Stories 5–6) — HAI-dependent primitives.
    const ecgProps = this._ecgPropsFor(profileKey);
    // Two-layer consent: parent already gates the whole card on base consent;
    // the ECG waveform also requires the second-layer ECG consent. The fileId
    // comes from the parent's `_renderCard` scope; we re-derive it from the
    // profileKey so this helper stays self-contained.
    const fileIdHere = profileKey ? fileIdFor(profileKey) : null;
    const ecgConsent = this._ecgConsentFor(fileIdHere);
    // HR-alerts composite — fold the 7-day rollup into ECG-strip footer.
    const hrAlertsProp = hasHrAlerts ? this._extractHrAlertsRollup(hrAlerts) : null;
    return html`
      <section class="scan-pair" aria-label="Biomedical waveform + ECG + HR alerts">
        <div class="scan-pane">
          <div class="scan-cap">ECG — LAST SINGLE-LEAD READING</div>
          <lcars-ecg-strip
            .voltageAttrs=${ecgProps.voltageAttrs}
            .classification=${ecgProps.classification}
            .avgBpm=${ecgProps.avgBpm}
            .durationS=${ecgProps.durationS}
            .samplingHz=${ecgProps.samplingHz}
            .lastTakenIso=${ecgProps.lastTakenIso}
            .source=${ecgProps.source}
            .consent=${ecgConsent}
            .hrAlerts=${hrAlertsProp}
            .cacheRevision=${this._cacheRevision}
            @lcars-ecg-consent-request=${() => this._grantEcgConsent(fileIdHere)}
          ></lcars-ecg-strip>
          ${hasEcg ? this._renderEcgCompositeInline(ecg) : ''}
        </div>
        ${hasHrAlerts ? html`
          <div class="scan-pane">
            <div class="scan-cap">HR ALERTS</div>
            ${this._renderHrAlertsInline(hrAlerts)}
          </div>` : html`
          <div class="scan-pane" aria-label="Cardiac alerts">
            <div class="scan-cap">HR ALERTS</div>
            <div class="scan-pending">NO CARDIAC ALERTS DATA</div>
          </div>`}
      </section>
      ${this._renderTiles(vitalsByKind, profileKey, 'biomedical')}
      <section class="scan-pair" aria-label="Heart rate metrics panel">
        <div class="scan-pane scan-pane-wide">
          <div class="scan-cap">HEART RATE — METRIC PANEL</div>
          ${this._renderHeartRateMetricsPanel(hrVital, workout)}
        </div>
      </section>
      <section class="scan-pair" aria-label="Cardiac primitives">
        <div class="scan-pane">
          <div class="scan-cap">BLOOD PRESSURE — 30 DAYS</div>
          <lcars-bp-range
            .hass=${this._hass}
            .systolicEntity=${this._systolicEntityFor(profileKey)}
            .diastolicEntity=${this._diastolicEntityFor(profileKey)}
            .cacheRevision=${this._cacheRevision}
          ></lcars-bp-range>
        </div>
        <div class="scan-pane">
          <div class="scan-cap">LAST WORKOUT — HR ZONES</div>
          <lcars-hr-zones
            .avgHr=${workout.avgHr}
            .maxHr=${workout.maxHr}
            .durationS=${workout.durationS}
            .workoutType=${workout.type}
            .personMaxHrEst=${personMaxHrEst}
            .personEntity=${this._personEntityFor(profileKey)}
            .cacheRevision=${this._cacheRevision}
          ></lcars-hr-zones>
        </div>
      </section>
    `;
  }

  _renderHeartRateMetricsPanel(hrVital, workout = {}) {
    const rows = [];
    const seen = new Set();
    const addRow = (label, value, unit = 'bpm') => {
      if (value == null || !Number.isFinite(Number(value))) return;
      const key = String(label || '').toUpperCase();
      if (!key || seen.has(key)) return;
      seen.add(key);
      rows.push({ label: key, value: Math.round(Number(value)), unit });
    };

    const variants = hrVital && hrVital.variants && hrVital.variants.length ? hrVital.variants : [];
    variants.forEach((variant) => addRow(variant.label || 'HR', variant.value));
    addRow('WORKOUT AVG', workout.avgHr);
    addRow('WORKOUT MAX', workout.maxHr);

    if (!rows.length) {
      return html`<div class="heart-metrics-empty">HEART RATE · NO DATA</div>`;
    }

    return html`
      <div class="heart-metrics-panel" data-medical="phi" ?aria-hidden=${this._audioMuted}>
        ${rows.map((row) => html`
          <div class="heart-metric-row">
            <div class="heart-metric-label">${row.label}</div>
            <div class="heart-metric-value">${row.value}</div>
            <div class="heart-metric-unit">${row.unit}</div>
          </div>
        `)}
      </div>
    `;
  }

  // 5.14.0-beta.1 — extract the canonical last-workout block for <lcars-hr-zones>.
  // Walks both the legacy `last_workout` variants (Withings/Oura) and the HAI
  // workouts.workout_last_* sensor family. Returns a plain object; null fields
  // collapse the dependent UI per the primitive's empty-state policy.
  _extractLastWorkout(profileKey) {
    const empty = { avgHr: null, maxHr: null, durationS: null, type: null };
    if (!this._hass || !this._hass.states) return empty;
    const haiPrefixes = [
      'sensor.health_auto_import_workouts_workout_last_',
      'sensor.health_auto_export_workouts_workout_last_',
    ];
    const out = { ...empty };
    const states = this._hass.states;
    for (const id of Object.keys(states)) {
      for (const prefix of haiPrefixes) {
        if (!id.startsWith(prefix)) continue;
        const tail = id.slice(prefix.length);
        const v = parseFloat(states[id].state);
        if (tail === 'avg_hr' && Number.isFinite(v)) out.avgHr = v;
        else if (tail === 'max_hr' && Number.isFinite(v)) out.maxHr = v;
        else if (tail === 'duration' && Number.isFinite(v)) out.durationS = v;
        else if (tail === 'type') out.type = String(states[id].state || '').toUpperCase();
      }
    }
    // Withings fallback for duration/type when HAI is absent.
    if (out.durationS == null && states['sensor.withings_last_workout_duration']) {
      const w = parseFloat(states['sensor.withings_last_workout_duration'].state);
      if (Number.isFinite(w)) out.durationS = w;
    }
    if (!out.type && states['sensor.withings_last_workout_type']) {
      out.type = String(states['sensor.withings_last_workout_type'].state || '').toUpperCase();
    }
    return out;
  }

  // 5.14.0-beta.1 — resolve the systolic/diastolic entity for the BP-range
  // primitive. Picks the first matching entity bound to this profile; falls
  // back to Withings defaults when discoverProfiles hasn't bound the entity.
  _systolicEntityFor(profileKey) {
    return this._findBpEntity(profileKey, /_systolic.*blood.*pressure$|_systolic_blood_pressure$/);
  }
  _diastolicEntityFor(profileKey) {
    return this._findBpEntity(profileKey, /_diastolic.*blood.*pressure$|_diastolic_blood_pressure$/);
  }
  _findBpEntity(profileKey, re) {
    if (!this._hass || !this._hass.states) return null;
    for (const id of Object.keys(this._hass.states)) {
      if (re.test(id)) return id;
    }
    return null;
  }

  // 5.14.0-beta.1 — derive max-HR estimate (220 - age) from person.birthdate.
  // Returns null when birthdate is not set on the bound HA person, which signals
  // <lcars-hr-zones> to render its "set birthdate" pill instead of hidden bars.
  _personMaxHrEstimate(profileKey) {
    if (!this._hass || !this._hass.states) return null;
    const candidates = [];
    if (profileKey) candidates.push(`person.${profileKey.replace(/^person:/, '')}`);
    for (const id of Object.keys(this._hass.states)) {
      if (id.startsWith('person.')) candidates.push(id);
    }
    for (const id of candidates) {
      const st = this._hass.states[id];
      if (!st) continue;
      const bday = (st.attributes && (st.attributes.birthdate || st.attributes.dob || st.attributes.birthday)) || null;
      if (!bday) continue;
      const dt = new Date(bday);
      if (Number.isNaN(dt.getTime())) continue;
      const ageMs = Date.now() - dt.getTime();
      const ageYears = ageMs / (365.2422 * 24 * 60 * 60 * 1000);
      if (ageYears < 10 || ageYears > 110) continue;
      return Math.round(220 - ageYears);
    }
    return null;
  }

  // 5.14.0-beta.1 — pull the sleep-score numeric for <lcars-sleep-score-bar>.
  // Returns null when no score is present, which collapses the primitive to a
  // single LCARS pill per its empty-state contract.
  _extractSleepScore(vitalsByKind) {
    const v = vitalsByKind.get('sleep_score');
    if (!v || !v.variants || !v.variants.length) return null;
    const value = v.variants[0].value;
    return Number.isFinite(value) ? value : null;
  }

  // 5.14.0-beta.1 — build the contributors map for <lcars-sleep-score-bar>.
  // Pulls the existing Oura / HAI contributor sensors from hass.states (these
  // are not part of MEDICAL_VITAL_CLASSES so we walk states directly). Returns
  // a `{label: {value, max, label}}` map ordered roughly by clinical weight.
  //
  // 5.14.0-beta.2 (crew S1-4 / Wesley root-cause) — beta.1 read only 3
  // hard-coded Oura suffixes while ignoring 5+ already-classified kinds. This
  // is the v2 implementation: it pulls the contributor values from
  // `vitalsByKind` FIRST for any kind that already classified (recovery_score,
  // hrv_balance, stress_resilience, activity_score, sleep_efficiency,
  // sleep_recovery_score, daytime_recovery_score, sleep_regularity_score),
  // then falls back to the Oura-prefix walk for `latency` / `restfulness`
  // which aren't independent kinds today.
  _extractSleepContributors(vitalsByKind, profileKey) {
    const out = {};
    if (!this._hass || !this._hass.states) return out;
    // Helper: pull a contributor from an existing vital kind in vitalsByKind.
    const fromKind = (kind, label, max = 100) => {
      const v = vitalsByKind.get(kind);
      if (!v || !v.variants || !v.variants.length) return;
      const val = parseFloat(v.variants[0].value);
      if (Number.isFinite(val)) out[label] = { value: val, max, label };
    };
    fromKind('sleep_efficiency', 'EFFICIENCY', 100);
    fromKind('recovery_score',   'RECOVERY',   100);
    fromKind('hrv_balance',      'HRV BAL',    100);
    fromKind('activity_score',   'ACTIVITY',   100);
    // Oura prefix walk for contributors NOT mapped to their own kind.
    // Per-profile scoped — defensive against unknown profile keys.
    const profileSlug = (profileKey || '').replace(/^person[:.]/, '').replace(/^oura[:.]/, '');
    if (!profileSlug) return out;
    const ouraPrefix = `sensor.oura_ring_${profileSlug}_`;
    const tryAdd = (suffix, label, max = 100) => {
      const st = this._hass.states[ouraPrefix + suffix];
      if (!st) return;
      const v = parseFloat(st.state);
      if (!Number.isFinite(v)) return;
      // Don't overwrite contributors we already pulled from kinds.
      if (out[label] && Number.isFinite(out[label].value)) return;
      out[label] = { value: v, max, label };
    };
    tryAdd('sleep_latency',           'LATENCY',         60);   // minutes; lower is better
    tryAdd('sleep_regularity_score',  'REGULARITY',     100);
    tryAdd('restfulness',             'RESTFULNESS',    100);
    tryAdd('sleep_recovery_score',    'SLEEP RECOVERY', 100);
    tryAdd('daytime_recovery_score',  'DAY RECOVERY',   100);
    tryAdd('stress_resilience_score', 'RESILIENCE',     100);
    return out;
  }

  // 5.14.0-beta.2 (Wesley W-1) — resolve the bound HA person entity id for the
  // current profile. Used to wire the SET-BIRTHDATE click in <lcars-hr-zones>.
  // Returns null when the profile key is unmappable.
  _personEntityFor(profileKey) {
    if (!this._hass || !this._hass.states || !profileKey) return null;
    const slug = String(profileKey).replace(/^person[:.]/, '').replace(/^oura[:.]/, '').replace(/^withings[:.]/, '');
    const direct = `person.${slug}`;
    if (this._hass.states[direct]) return direct;
    // Fall back to a single-person install: pick the only person if there is one.
    const persons = Object.keys(this._hass.states).filter((id) => id.startsWith('person.'));
    if (persons.length === 1) return persons[0];
    return null;
  }

  // 5.15.0-beta.1 (Story 5) — resolve the HAI ECG voltage sensor for the
  // current profile. Returns the entity_id string or null when no ECG entity
  // is bound. The ECG strip primitive falls back to its NO DATA pill.
  _ecgVoltageEntityFor(profileKey) {
    if (!this._hass || !this._hass.states) return null;
    for (const id of Object.keys(this._hass.states)) {
      if (id === 'sensor.health_auto_import_heart_ecg_voltage_measurements') return id;
      if (/_heart_ecg_voltage_measurements$/.test(id)) return id;
    }
    return null;
  }
  _ecgSiblingEntity(suffix) {
    // 5.15.0-beta.1 — return the first HAI ECG sibling sensor matching the
    // suffix (`classification`, `average_bpm`, `duration`, `sampling_frequency`,
    // `last_taken`). Used as the schema-safe fallback when the voltage attribute
    // contract is not honored.
    if (!this._hass || !this._hass.states) return null;
    for (const id of Object.keys(this._hass.states)) {
      if (id.endsWith(`_heart_ecg_${suffix}`)) return id;
    }
    return null;
  }
  _ecgPropsFor(profileKey) {
    // Read all six ECG sensors and merge into the lcars-ecg-strip prop bag.
    // The voltage entity is the only one that needs schema-version probing —
    // the siblings are simple numbers/strings.
    if (!this._hass || !this._hass.states) {
      return { voltageAttrs: null, classification: null, avgBpm: NaN, durationS: NaN, samplingHz: NaN, lastTakenIso: null, source: null };
    }
    const voltageId = this._ecgVoltageEntityFor(profileKey);
    const st = voltageId ? this._hass.states[voltageId] : null;
    const voltageAttrs = st ? st.attributes : null;
    const readNum = (suffix) => {
      const id = this._ecgSiblingEntity(suffix);
      if (!id) return NaN;
      const s = this._hass.states[id];
      const v = s && s.state != null ? Number(s.state) : NaN;
      return Number.isFinite(v) ? v : NaN;
    };
    const readStr = (suffix) => {
      const id = this._ecgSiblingEntity(suffix);
      if (!id) return null;
      const s = this._hass.states[id];
      return s && typeof s.state === 'string' && s.state !== 'unknown' && s.state !== 'unavailable' ? s.state : null;
    };
    // Prefer attribute-level metadata when the voltage entity ships it.
    const fromAttr = (key) => (voltageAttrs && typeof voltageAttrs === 'object' ? voltageAttrs[key] : undefined);
    return {
      voltageAttrs,
      classification: readStr('classification') || (typeof fromAttr('classification') === 'string' ? fromAttr('classification') : null),
      avgBpm:    Number.isFinite(fromAttr('average_bpm')) ? fromAttr('average_bpm') : readNum('average_bpm'),
      durationS: Number.isFinite(fromAttr('duration_s')) ? fromAttr('duration_s') : readNum('duration'),
      samplingHz: Number.isFinite(fromAttr('sampling_frequency_hz')) ? fromAttr('sampling_frequency_hz') : readNum('sampling_frequency'),
      lastTakenIso: typeof fromAttr('recorded_at') === 'string' ? fromAttr('recorded_at') : readStr('last_taken'),
      source: typeof fromAttr('source') === 'string' ? fromAttr('source') : null,
    };
  }

  // 5.15.0-beta.1 (Story 6a) — resolve the HAI sleep-analysis-latest sensor.
  _sleepAnalysisEntityFor(profileKey) {
    if (!this._hass || !this._hass.states) return null;
    for (const id of Object.keys(this._hass.states)) {
      if (id === 'sensor.health_auto_import_health_metrics_sleep_analysis_latest') return id;
      if (/_sleep_analysis_latest$/.test(id)) return id;
    }
    return null;
  }
  _sleepAttrsFor(profileKey) {
    if (!this._hass || !this._hass.states) return null;
    const id = this._sleepAnalysisEntityFor(profileKey);
    if (!id) return null;
    const st = this._hass.states[id];
    return st ? st.attributes : null;
  }

  // 5.15.0-beta.1 (Story 6b) — resolve the HAI workout-last-started sensor.
  _workoutEntityFor(profileKey) {
    if (!this._hass || !this._hass.states) return null;
    for (const id of Object.keys(this._hass.states)) {
      if (id === 'sensor.health_auto_import_workouts_workout_last_started') return id;
      if (/_workouts_workout_last_started$/.test(id)) return id;
    }
    return null;
  }
  _workoutPropsFor(profileKey) {
    if (!this._hass || !this._hass.states) {
      return { workoutAttrs: null, startedIso: null, endedIso: null };
    }
    const id = this._workoutEntityFor(profileKey);
    if (!id) return { workoutAttrs: null, startedIso: null, endedIso: null };
    const st = this._hass.states[id];
    const attrs = st ? st.attributes : null;
    const startedIso = st && typeof st.state === 'string' ? st.state : null;
    // Derive endedIso from started + duration_s when ended isn't surfaced.
    let endedIso = null;
    if (startedIso && attrs && Number.isFinite(attrs.duration_s)) {
      const t = Date.parse(startedIso);
      if (Number.isFinite(t)) {
        endedIso = new Date(t + attrs.duration_s * 1000).toISOString();
      }
    }
    return { workoutAttrs: attrs, startedIso, endedIso };
  }

  // 5.15.0-beta.7 — load 14-day HA state history for the workout + sleep sensors.
  // Triggers a fire-and-forget async fetch keyed by entity IDs; re-renders when
  // data arrives. Called from _renderAnatomicalZone so it only runs while the
  // PHYSIOLOGY tab is active.
  _maybeLoadHistory(profileKey) {
    if (!this._hass) return;
    const workoutId = this._workoutEntityFor(profileKey);
    const sleepId = this._sleepAnalysisEntityFor(profileKey);
    const key = `${workoutId || ''}|${sleepId || ''}`;
    if (key === '|' || key === this._historyLoadKey || this._historyLoading) return;
    this._loadHistory(workoutId, sleepId, key);
  }

  async _loadHistory(workoutId, sleepId, key) {
    if (!this._hass || this._historyLoading) return;
    this._historyLoading = true;
    this._historyLoadKey = key;
    try {
      const start = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
      const fetchOne = async (eid) => {
        if (!eid) return [];
        try {
          const raw = await this._hass.callApi(
            'GET',
            `history/period/${start}?filter_entity_id=${encodeURIComponent(eid)}&minimal_response=0`
          );
          return (raw && Array.isArray(raw[0])) ? raw[0] : [];
        } catch (_) { return []; }
      };
      const [wItems, sItems] = await Promise.all([
        fetchOne(workoutId),
        fetchOne(sleepId),
      ]);
      this._workoutHistory = wItems
        .filter((s) => s && s.attributes && s.attributes.lcars_schema_version === '1'
                    && typeof s.state === 'string' && s.state !== 'unavailable' && s.state !== 'unknown')
        .map((s) => {
          const startedIso = s.state;
          const attrs = s.attributes;
          let endedIso = null;
          const t = Date.parse(startedIso);
          if (Number.isFinite(t) && Number.isFinite(attrs.duration_s)) {
            endedIso = new Date(t + attrs.duration_s * 1000).toISOString();
          }
          return { startedIso, endedIso, workoutAttrs: attrs };
        })
        .reverse();   // most recent first
      this._sleepHistory = sItems
        .filter((s) => s && s.attributes && s.attributes.lcars_schema_version === '1'
                    && s.state !== 'unavailable' && s.state !== 'unknown')
        .map((s) => ({ sleepAttrs: s.attributes, recordedAt: s.last_changed }))
        .reverse();   // most recent first
      this.requestUpdate();
    } finally {
      this._historyLoading = false;
    }
  }

  // 5.15.0-beta.1 (Story 5 / Worf S0-4 §7.7) — resolve the AND-of base-consent
  // and ECG-waveform-consent for the given profile id. Returns false unless
  // both layers are explicitly granted.
  _ecgConsentFor(fileId) {
    if (!fileId) return false;
    // Base consent — already wired via parent §7.5
    const base = (this._consentByFile[fileId] ?? hasConsent(fileId));
    if (!base) return false;
    return hasEcgConsent(fileId);
  }
  _grantEcgConsent(fileId) {
    if (!fileId) return;
    grantEcgConsent(fileId);
    // Bump cache so the primitive's `_disposeCaches()` runs before the
    // waveform is first drawn (W6.1 / §7.7 mid-render toggle contract).
    this._cacheRevision += 1;
    lcarsAudio.play('navAcknowledge');
    this.requestUpdate();
  }

  // 5.15.0-beta.1 (Story 5 / Geordi C8) — fold the 7-day HR-alerts counts into
  // a compact `{high7d, low7d, irreg7d, lastEventIso, lastEventKind}` rollup
  // for the ECG-strip footer's notifications segment.
  _extractHrAlertsRollup(hrAlerts) {
    if (!hrAlerts || !hrAlerts.variants || !hrAlerts.variants.length) return null;
    const byLabel = (L) => hrAlerts.variants.find((vt) => String(vt.label || '').toUpperCase() === L);
    const n = (v) => Number.isFinite(parseFloat(v?.value)) ? Math.round(parseFloat(v.value)) : 0;
    const lastType = byLabel('LAST TYPE');
    const lastAt = byLabel('LAST AT');
    return {
      high7d: n(byLabel('HIGH #')),
      low7d:  n(byLabel('LOW #')),
      irreg7d: n(byLabel('IRREG #')),
      lastEventIso: lastAt && typeof lastAt.value === 'string' ? lastAt.value : null,
      lastEventKind: lastType && typeof lastType.value === 'string' ? lastType.value : null,
    };
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

  _renderTiles(vitalsByKind, profileKey, tab = 'summary') {
    // 5.12.0-beta.6 — body composition is a composite tile owned by `weight`;
    // standalone tiles for its children are skipped and rendered as breakdown rows.
    // 5.14.0-beta.1 (crew C2) — tile selection driven by per-kind `tabs[]` field on
    // MEDICAL_VITAL_CLASSES. The previous "first 20 tiles" slice is replaced with
    // a tab-filtered list so SUMMARY / ANATOMICAL / BIOMEDICAL / SLEEP each render
    // their own slice. Default tab='summary' preserves back-compat for callers.
    const tiles = vitalKindsForTab(tab)
      .filter((vc) => vc.tile && !BODY_COMP_CHILD_KINDS.has(vc.kind));
    if (!tiles.length) return '';
    return html`
      <section class="zone-c" aria-label="Vital detail tiles">
        ${tiles.map((vc) => {
          // 5.8.0-beta.1 — composite tile (readiness) renders its own sub-lozenge layout.
          if (vc.composite && vc.kind === 'readiness') {
            return this._renderReadinessTile(vc, vitalsByKind.get(vc.kind), profileKey);
          }
          // 5.12.0-beta.6 — weight composite absorbs body comp children.
          if (vc.composite === 'body_comp' && vc.kind === 'weight') {
            return this._renderBodyCompositionTile(vc, vitalsByKind);
          }
          // 5.13.x — HealthyApps MQTT bridge composites (ECG / HR alerts / data link).
          if (vc.composite === 'ecg' && vc.kind === 'ecg') {
            return this._renderEcgCompositeTile(vc, vitalsByKind.get('ecg'));
          }
          if (vc.composite === 'hr_notifications' && vc.kind === 'hr_notifications') {
            return this._renderHrNotificationsTile(vc, vitalsByKind.get('hr_notifications'));
          }
          if (vc.composite === 'data_link' && vc.kind === 'data_link') {
            return this._renderDataLinkTile(vc, vitalsByKind.get('data_link'));
          }
          // 5.14.0-beta.1 (Wesley #1) — HAI medications composite.
          if (vc.composite === 'medications' && vc.kind === 'medications') {
            return this._renderMedicationsTile(vc, vitalsByKind.get('medications'));
          }
          const v = vitalsByKind.get(vc.kind);
          // v5.7.2 hybrid: render canonical row + any additional variants stacked beneath.
          const variants = v && v.variants && v.variants.length ? v.variants : null;
          // 5.8.0-beta.1 — enum-typed value (e.g. stress_resilience as Oura
          // resilience_level "Strong"/"Solid"/"Low") renders as a label-only chip.
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
          // 5.14.0-beta.1 (Wesley #2) — multi-platform superscript source chip.
          // Only shows when this kind has variants from more than one platform
          // (otherwise the chip is visual noise on a single-source household).
          const platforms = new Set(variants.map((vt) => sourceChipForEntity(vt.eid)));
          const multiSource = platforms.size > 1;
          const sourceChip = multiSource ? sourceChipForEntity(canonical.eid) : '';
          // 5.14.0-beta.2 (crew S1-6) — hide variant rows whose value would
          // render as `—` (non-finite numerics OR explicit unknown/unavailable).
          // Keeps the tile compact when half the variant sensors are stale.
          const displayVariants = variants.slice(1).filter((vt) => {
            if (vt.value == null) return false;
            if (vt.value === 'unknown' || vt.value === 'unavailable') return false;
            if (typeof vt.value === 'number' && !Number.isFinite(vt.value)) return false;
            return true;
          });
          return this._wrapTile(vc.label, canonical.eid, html`
            <div class="tile-label">${vc.label}${sourceChip ? html` <sup class="tile-source-chip" aria-label="Source platform">${sourceChip}</sup>` : ''}</div>
            <div class="tile-value" data-medical="phi"
                 aria-live="off"
                 ?aria-hidden=${this._audioMuted}
                 style=${`color:${canonicalColor}`}>${formatVital(vc.kind, canonical.value)}</div>
            <div class="tile-unit">${vc.unit}${showSrc ? html` · <span class="tile-source">${canonical.label}</span>` : ''}</div>
            ${displayVariants.length ? html`
              <div class="tile-variants" aria-label="Additional sources">
                ${displayVariants.map((vt) => html`
                  <div class="tile-variant">
                    <span class="tile-variant-label">${vt.label || '·'}${multiSource ? html` <sup class="tile-source-chip">${sourceChipForEntity(vt.eid)}</sup>` : ''}</span>
                    <span class="tile-variant-value" data-medical="phi"
                          ?aria-hidden=${this._audioMuted}>${formatVital(vc.kind, vt.value)}</span>
                  </div>`)}
              </div>` : ''}
          `);
        })}
      </section>
    `;
  }

  // 5.12.0-beta.6 — Body Composition composite tile.
  // Headline: WEIGHT (Withings primary). Breakdown rows pull canonical values
  // from sibling kinds (fat_mass / lean_mass / muscle_mass / bone_mass /
  // visceral_fat / body_fat_pct / bmi / hydration). Each row formats its own
  // value through formatVital(child.kind, value) and shows its unit suffix.
  // Replaces the 8-tile body-comp grid sprawl with one tall tile.
  _renderBodyCompositionTile(vc, vitalsByKind) {
    const v = vitalsByKind.get('weight');
    const variants = v && v.variants && v.variants.length ? v.variants : null;
    if (!variants) {
      return html`
        <div class="tile">
          <div class="tile-label">${vc.label}</div>
          <div class="tile-value tile-offline"
               style=${`color:var(--lcars-gray, #666688)`}>—</div>
          <div class="tile-unit">${vc.unit}</div>
        </div>`;
    }
    const canonical = variants[0];
    const canonicalStatus = (canonical.value != null && !isNaN(canonical.value))
      ? computeStatus('weight', canonical.value, DEFAULT_THRESHOLDS)
      : MEDICAL_STATUS.OFFLINE;
    const canonicalColor = STATUS_COLOR[canonicalStatus] || STATUS_COLOR.OFFLINE;
    const rows = [];
    for (const child of BODY_COMP_CHILDREN) {
      const cv = vitalsByKind.get(child.kind);
      const cvar = cv && cv.variants && cv.variants.length ? cv.variants[0] : null;
      if (!cvar || cvar.value == null || isNaN(cvar.value)) continue;
      const meta = MEDICAL_VITAL_CLASSES.find((c) => c.kind === child.kind);
      const unit = meta ? meta.unit : '';
      rows.push({
        label: child.label,
        value: formatVital(child.kind, cvar.value),
        unit,
      });
    }
    return this._wrapTile(vc.label, canonical.eid, html`
      <div class="tile-label">${vc.label}</div>
      <div class="tile-value" data-medical="phi"
           aria-live="off"
           ?aria-hidden=${this._audioMuted}
           style=${`color:${canonicalColor}`}>${formatVital('weight', canonical.value)}</div>
      <div class="tile-unit">${vc.unit}</div>
      ${rows.length ? html`
        <div class="tile-variants" aria-label="Body composition">
          ${rows.map((r) => html`
            <div class="tile-variant">
              <span class="tile-variant-label">${r.label}</span>
              <span class="tile-variant-value" data-medical="phi"
                    ?aria-hidden=${this._audioMuted}>${r.value}${r.unit ? html` <span class="tile-variant-unit">${r.unit}</span>` : ''}</span>
            </div>`)}
        </div>` : ''}
    `);
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
    // 5.12.0-beta.7 — only span 2 cols + use the large headline when contributing
    // sub-lozenges are actually present. Without subs the tile collapses to a
    // normal 1-col tile so it stops creating a giant empty rectangle in the grid
    // (Captain visual review on beta.6).
    const compositeClass = subs.length ? 'tile-composite' : '';
    const valueClass = subs.length ? 'tile-value tile-value-large' : 'tile-value';
    return this._wrapTile(vc.label, canonical.eid, html`
      <div class="tile-label">${vc.label}</div>
      <div class=${valueClass} data-medical="phi"
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
    `, compositeClass);
  }

  // 5.8.0-beta.1 — Enum vital tile (e.g. Oura resilience_level).
  // Status is derived from the enum string itself rather than a numeric threshold.
  //
  // 5.11.0-beta.1 (S0-2): Oura v2.0.0 changed resilience vocabulary from
  // 'Great/Strong/Solid/Low' to 'limited/adequate/solid/strong/exceptional'. The
  // pre-2.0 mapping (`solid|adequate` → ELEVATED, `low|exceptional` → ALERT) inverted
  // safety semantics for the new vocabulary — 'exceptional' (best) flagged as ALERT,
  // 'limited' (worst) was unmatched. Rewritten to the new vocabulary; legacy `great`
  // still routes to NOMINAL.
  _renderEnumTile(vc, variants) {
    const canonical = variants[0];
    const raw = String(canonical.value ?? '').toLowerCase();
    let status = MEDICAL_STATUS.NOMINAL;
    if (!raw || raw === 'unknown' || raw === 'unavailable') {
      status = MEDICAL_STATUS.OFFLINE;
    } else if (/limited|low/.test(raw)) {
      status = MEDICAL_STATUS.ALERT;
    } else if (/adequate/.test(raw)) {
      status = MEDICAL_STATUS.ELEVATED;
    } else if (/solid|strong|exceptional|great/.test(raw)) {
      status = MEDICAL_STATUS.NOMINAL;
    }
    const color = STATUS_COLOR[status] || STATUS_COLOR.OFFLINE;
    const showSrc = canonical.label && canonical.label.toUpperCase() !== vc.label.toUpperCase();
    return this._wrapTile(vc.label, canonical.eid, html`
      <div class="tile-label">${vc.label}</div>
      <div class="tile-value tile-value-enum" data-medical="phi"
           aria-live="off"
           ?aria-hidden=${this._audioMuted}
           style=${`color:${color}`}>${formatVital('enum', canonical.value)}</div>
      <div class="tile-unit">${vc.unit}${showSrc ? html` · <span class="tile-source">${canonical.label}</span>` : ''}</div>
    `);
  }

  // 5.13.x — internal helper for composite tiles. Given a composite vital
  // (collected as variants of the same kind by classifyVital + suffix priority),
  // walk an ORDERED list of expected child labels and pick the first variant
  // whose label matches. Returns an array of { label, value, eid, ts } in the
  // requested order; missing children are simply absent (no empty rows).
  _pickCompositeChildren(v, expectedLabels) {
    if (!v || !v.variants) return [];
    const out = [];
    for (const want of expectedLabels) {
      const W = String(want).toUpperCase();
      const hit = v.variants.find((vt) => String(vt.label || '').toUpperCase() === W);
      if (!hit) continue;
      if (hit.value == null || (typeof hit.value === 'number' && isNaN(hit.value))) continue;
      out.push({ label: want, value: hit.value, eid: hit.eid, ts: hit.ts });
    }
    return out;
  }

  // 5.13.x — format a timestamp variant (ISO string or epoch ms) as relative
  // age (e.g. "12m", "3h", "2d") for telemetry-link freshness display. Returns
  // '—' on unparseable input. No timezone; uses now-relative duration.
  _formatStaleness(value) {
    if (value == null || value === '' || value === 'unknown' || value === 'unavailable') return '—';
    const d = (typeof value === 'number') ? new Date(value) : new Date(String(value));
    const ts = d.getTime();
    if (!Number.isFinite(ts)) return '—';
    const delta = Math.max(0, Date.now() - ts);
    const m = Math.floor(delta / 60000);
    if (m < 1) return 'now';
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    const days = Math.floor(h / 24);
    return `${days}d`;
  }

  // 5.14.0-beta.1 (Wesley #6) — derive the day count for the RECOVERY MODE
  // pill modifier. Walks the profile-bound `_rest_mode_start` Oura sensor and
  // returns the integer day count since rest mode began. Returns 0 when the
  // start timestamp is missing or in the future, which downgrades the pill to
  // just `RECOVERY MODE` without a day counter (still amber).
  _restModeDayCount(profileKey) {
    if (!this._hass || !this._hass.states || !profileKey) return 0;
    const slug = profileKey.replace(/^person:/, '').replace(/^oura:/, '');
    const candidates = [
      `sensor.oura_ring_${slug}_rest_mode_start`,
      `sensor.oura_${slug}_rest_mode_start`,
    ];
    for (const id of candidates) {
      const st = this._hass.states[id];
      if (!st || !st.state || st.state === 'unknown' || st.state === 'unavailable') continue;
      const ts = Date.parse(st.state);
      if (!Number.isFinite(ts)) continue;
      const delta = Date.now() - ts;
      if (delta <= 0) return 1;
      return Math.max(1, Math.ceil(delta / (24 * 60 * 60 * 1000)));
    }
    return 0;
  }

  // 5.13.x — ECG composite tile (HealthyApps MQTT bridge: Apple Watch ECG).
  // Headline: latest classification (Sinus Rhythm / AFib / Inconclusive).
  // Status: ALERT if AFib detected today, ELEVATED if inconclusive present,
  // NOMINAL on sinus, OFFLINE if no readings ever.
  // Rows: latest avg HR, today counts (sinus / AFib / inconclusive / total),
  // last AFib timestamp.
  _renderEcgCompositeTile(vc, v) {
    const variants = v && v.variants && v.variants.length ? v.variants : null;
    if (!variants) {
      return html`
        <div class="tile">
          <div class="tile-label">${vc.label}</div>
          <div class="tile-value tile-offline"
               style=${`color:var(--lcars-gray, #666688)`}>—</div>
          <div class="tile-unit">${vc.unit}</div>
        </div>`;
    }
    const byLabel = (L) => variants.find((vt) => String(vt.label || '').toUpperCase() === L);
    const cls = byLabel('CLASS');
    const afibDetected = byLabel('AFIB?');
    const sinusToday = byLabel('SINUS');
    const afibToday = byLabel('AFIB');
    const inconcToday = byLabel('INCONC');
    const countToday = byLabel('TODAY #');
    const avgHr = byLabel('AVG HR');
    const lastAfib = byLabel('LAST AFIB');
    const sev = byLabel('SEVERITY');
    const lastRead = byLabel('LAST READ');

    // Status decision: AFib detected today → ALERT; AFib historical reading today → ELEVATED;
    // any inconclusive today → ELEVATED; sinus only → NOMINAL.
    let status = MEDICAL_STATUS.NOMINAL;
    const afibDetectedNow = afibDetected && /on|true|1|yes|detect/i.test(String(afibDetected.value));
    const afibCountToday = Number(afibToday?.value) > 0;
    const inconcCountToday = Number(inconcToday?.value) > 0;
    if (afibDetectedNow) status = MEDICAL_STATUS.ALERT;
    else if (afibCountToday) status = MEDICAL_STATUS.ELEVATED;
    else if (inconcCountToday) status = MEDICAL_STATUS.ELEVATED;
    if (!cls && !countToday) status = MEDICAL_STATUS.OFFLINE;
    const color = STATUS_COLOR[status] || STATUS_COLOR.OFFLINE;

    // 5.14.0-beta.2 (crew S1-2 / spec C13) — guard against `String(NaN)` →
    // 'NaN' / `String(undefined)` → 'undefined' leaks into the visible
    // headline. cls.value upstream comes through `parseFloat` in some HAI
    // paths so it can legitimately be the number NaN, not just an empty
    // string. Use the enum-string-safe helper.
    const headline = _isEnumValueDisplayable(cls?.value) ? _formatEnum(cls.value) : '—';

    const rows = [];
    if (_isEnumValueDisplayable(sev?.value)) {
      rows.push({ label: 'SEVERITY', value: _formatEnum(sev.value), unit: '' });
    }
    if (avgHr && Number.isFinite(parseFloat(avgHr.value))) {
      rows.push({ label: 'AVG HR', value: String(Math.round(parseFloat(avgHr.value))), unit: 'bpm' });
    }
    if (countToday && Number.isFinite(Number(countToday.value))) {
      rows.push({ label: 'TODAY #', value: String(Math.round(Number(countToday.value))), unit: '' });
    }
    if (sinusToday && Number(sinusToday.value) > 0) {
      rows.push({ label: 'SINUS', value: String(Math.round(Number(sinusToday.value))), unit: '' });
    }
    if (afibToday && Number(afibToday.value) > 0) {
      rows.push({ label: 'AFIB', value: String(Math.round(Number(afibToday.value))), unit: '' });
    }
    if (inconcToday && Number(inconcToday.value) > 0) {
      rows.push({ label: 'INCONC', value: String(Math.round(Number(inconcToday.value))), unit: '' });
    }
    if (lastAfib && lastAfib.value) {
      rows.push({ label: 'LAST AFIB', value: this._formatStaleness(lastAfib.value), unit: 'ago' });
    }
    if (lastRead && lastRead.value) {
      rows.push({ label: 'LAST READ', value: this._formatStaleness(lastRead.value), unit: 'ago' });
    }

    // If we have no headline AND no rows, render the standardized empty state.
    if (headline === '—' && rows.length === 0) {
      return html`
        <div class="tile">
          <div class="tile-label">${vc.label}</div>
          <div class="tile-value tile-offline"
               style=${`color:var(--lcars-gray, #666688)`}>NO DATA</div>
          <div class="tile-unit">${vc.unit || 'classification'}</div>
        </div>`;
    }

    return this._wrapTile(vc.label, (cls || avgHr || countToday)?.eid, html`
      <div class="tile-label">${vc.label}</div>
      <div class="tile-value" data-medical="phi"
           aria-live="off"
           ?aria-hidden=${this._audioMuted}
           style=${`color:${color}`}>${headline}</div>
      <div class="tile-unit">${vc.unit || 'classification'}</div>
      ${rows.length ? html`
        <div class="tile-variants" aria-label="ECG breakdown">
          ${rows.map((r) => html`
            <div class="tile-variant">
              <span class="tile-variant-label">${r.label}</span>
              <span class="tile-variant-value" data-medical="phi"
                    ?aria-hidden=${this._audioMuted}>${r.value}${r.unit ? html` <span class="tile-variant-unit">${r.unit}</span>` : ''}</span>
            </div>`)}
        </div>` : ''}
    `);
  }

  // 5.13.x — HR Notifications composite tile (HealthyApps MQTT bridge).
  // Headline: today's irregular notification count (Apple Watch irregular-rhythm
  // notifications drive the AFib screening pathway), with high / low / latest
  // breakdown rows. Status: ALERT on any irregular today, ELEVATED on high/low
  // events today, NOMINAL on no events, OFFLINE if no data at all.
  _renderHrNotificationsTile(vc, v) {
    const variants = v && v.variants && v.variants.length ? v.variants : null;
    if (!variants) {
      return html`
        <div class="tile">
          <div class="tile-label">${vc.label}</div>
          <div class="tile-value tile-offline"
               style=${`color:var(--lcars-gray, #666688)`}>—</div>
          <div class="tile-unit">${vc.unit}</div>
        </div>`;
    }
    const byLabel = (L) => variants.find((vt) => String(vt.label || '').toUpperCase() === L);
    const high = byLabel('HIGH #');
    const low = byLabel('LOW #');
    const irreg = byLabel('IRREG #');
    const irregBinary = byLabel('IRREG?');
    const lastType = byLabel('LAST TYPE');
    const peakHr = byLabel('PEAK HR');
    const thresh = byLabel('THRESH');
    const dur = byLabel('DURATION');
    const evtHrv = byLabel('EVT HRV');
    const lastAt = byLabel('LAST AT');
    const lastIrreg = byLabel('LAST IRREG');

    const n = (x) => Number.isFinite(parseFloat(x?.value)) ? parseFloat(x.value) : 0;
    const irregBin = irregBinary && /on|true|1|yes|detect/i.test(String(irregBinary.value));

    let status = MEDICAL_STATUS.NOMINAL;
    if (irregBin || n(irreg) > 0) status = MEDICAL_STATUS.ALERT;
    else if (n(high) > 0 || n(low) > 0) status = MEDICAL_STATUS.ELEVATED;
    if (!high && !low && !irreg && !lastType) status = MEDICAL_STATUS.OFFLINE;
    const color = STATUS_COLOR[status] || STATUS_COLOR.OFFLINE;

    const headline = irregBin
      ? 'IRREGULAR'
      : (n(irreg) > 0
        ? `${Math.round(n(irreg))} IRREG`
        : (n(high) + n(low) > 0
          ? `${Math.round(n(high) + n(low))} ALERT`
          : '0'));

    const rows = [];
    if (high) rows.push({ label: 'HIGH #', value: String(Math.round(n(high))), unit: '' });
    if (low)  rows.push({ label: 'LOW #',  value: String(Math.round(n(low))),  unit: '' });
    if (irreg) rows.push({ label: 'IRREG #', value: String(Math.round(n(irreg))), unit: '' });
    if (lastType && lastType.value && String(lastType.value).toLowerCase() !== 'unknown') {
      rows.push({ label: 'TYPE', value: String(lastType.value).toUpperCase().replace(/_/g, ' '), unit: '' });
    }
    if (peakHr && Number.isFinite(parseFloat(peakHr.value))) {
      rows.push({ label: 'PEAK', value: String(Math.round(parseFloat(peakHr.value))), unit: 'bpm' });
    }
    if (thresh && Number.isFinite(parseFloat(thresh.value))) {
      rows.push({ label: 'THRESH', value: String(Math.round(parseFloat(thresh.value))), unit: 'bpm' });
    }
    if (dur && Number.isFinite(parseFloat(dur.value))) {
      rows.push({ label: 'DURATION', value: String(Math.round(parseFloat(dur.value))), unit: 'min' });
    }
    if (evtHrv && Number.isFinite(parseFloat(evtHrv.value))) {
      rows.push({ label: 'EVT HRV', value: String(Math.round(parseFloat(evtHrv.value))), unit: 'ms' });
    }
    if (lastAt && lastAt.value) {
      rows.push({ label: 'LAST AT', value: this._formatStaleness(lastAt.value), unit: 'ago' });
    }
    if (lastIrreg && lastIrreg.value) {
      rows.push({ label: 'LAST IRREG', value: this._formatStaleness(lastIrreg.value), unit: 'ago' });
    }

    return this._wrapTile(vc.label, (irreg || high || low || lastType)?.eid, html`
      <div class="tile-label">${vc.label}</div>
      <div class="tile-value" data-medical="phi"
           aria-live="off"
           ?aria-hidden=${this._audioMuted}
           style=${`color:${color}`}>${headline}</div>
      <div class="tile-unit">${vc.unit || 'today'}</div>
      ${rows.length ? html`
        <div class="tile-variants" aria-label="HR notification breakdown">
          ${rows.map((r) => html`
            <div class="tile-variant">
              <span class="tile-variant-label">${r.label}</span>
              <span class="tile-variant-value" data-medical="phi"
                    ?aria-hidden=${this._audioMuted}>${r.value}${r.unit ? html` <span class="tile-variant-unit">${r.unit}</span>` : ''}</span>
            </div>`)}
        </div>` : ''}
    `);
  }

  // 5.13.x — Data Link composite tile (HealthyApps MQTT bridge: telemetry
  // freshness). Headline: most-stale push age across (metrics, workouts, ECG, HRN).
  // Status: NOMINAL <1h, ELEVATED <6h, ALERT <24h, CRITICAL ≥24h, OFFLINE never.
  _renderDataLinkTile(vc, v) {
    const variants = v && v.variants && v.variants.length ? v.variants : null;
    if (!variants) {
      return html`
        <div class="tile">
          <div class="tile-label">${vc.label}</div>
          <div class="tile-value tile-offline"
               style=${`color:var(--lcars-gray, #666688)`}>—</div>
          <div class="tile-unit">${vc.unit}</div>
        </div>`;
    }
    const channels = [
      { key: 'METRICS',  label: 'METRICS'  },
      { key: 'WORKOUTS', label: 'WORKOUTS' },
      { key: 'ECG',      label: 'ECG'      },
      { key: 'HR NOTIF', label: 'HR NOTIF' },
    ];
    const rows = [];
    let oldestDeltaMs = -1;
    let oldestEid = null;
    for (const ch of channels) {
      const vt = variants.find((x) => String(x.label || '').toUpperCase() === ch.key);
      if (!vt || !vt.value || vt.value === 'unknown' || vt.value === 'unavailable') {
        rows.push({ label: ch.label, value: '—', unit: '' });
        continue;
      }
      const d = (typeof vt.value === 'number') ? new Date(vt.value) : new Date(String(vt.value));
      const ts = d.getTime();
      if (!Number.isFinite(ts)) {
        rows.push({ label: ch.label, value: '—', unit: '' });
        continue;
      }
      const delta = Math.max(0, Date.now() - ts);
      if (delta > oldestDeltaMs) {
        oldestDeltaMs = delta;
        oldestEid = vt.eid;
      }
      rows.push({ label: ch.label, value: this._formatStaleness(vt.value), unit: 'ago' });
    }

    let status = MEDICAL_STATUS.OFFLINE;
    if (oldestDeltaMs >= 0) {
      if (oldestDeltaMs < 60 * 60 * 1000) status = MEDICAL_STATUS.NOMINAL;
      else if (oldestDeltaMs < 6 * 60 * 60 * 1000) status = MEDICAL_STATUS.ELEVATED;
      else if (oldestDeltaMs < 24 * 60 * 60 * 1000) status = MEDICAL_STATUS.ALERT;
      else status = MEDICAL_STATUS.CRITICAL;
    }
    const color = STATUS_COLOR[status] || STATUS_COLOR.OFFLINE;
    const headline = oldestDeltaMs < 0
      ? '—'
      : (oldestDeltaMs < 60000 ? 'LIVE' : this._formatStaleness(Date.now() - oldestDeltaMs));

    return this._wrapTile(vc.label, oldestEid, html`
      <div class="tile-label">${vc.label}</div>
      <div class="tile-value" data-medical="phi"
           aria-live="off"
           ?aria-hidden=${this._audioMuted}
           style=${`color:${color}`}>${headline}</div>
      <div class="tile-unit">oldest push</div>
      ${rows.length ? html`
        <div class="tile-variants" aria-label="Channel freshness">
          ${rows.map((r) => html`
            <div class="tile-variant">
              <span class="tile-variant-label">${r.label}</span>
              <span class="tile-variant-value" data-medical="phi"
                    ?aria-hidden=${this._audioMuted}>${r.value}${r.unit ? html` <span class="tile-variant-unit">${r.unit}</span>` : ''}</span>
            </div>`)}
        </div>` : ''}
    `);
  }

  // 5.14.0-beta.1 (Wesley #1) — Medications composite tile.
  // Headline: most-recent status (TAKEN / MISSED / OVERDUE band derived from
  // STATUS + SCHEDULED timestamp delta). Subrow shows the scheduled time and
  // status enum so the captain can glance at "did mom take her morning pill?".
  // Status mapping:
  //   STATUS = 'taken'/'logged'/'recorded'           → NOMINAL
  //   STATUS = 'pending' AND scheduled <30m ago      → NOMINAL
  //   STATUS = 'pending' AND scheduled 30m–2h ago    → ELEVATED
  //   STATUS = 'missed'/'overdue' OR scheduled >2h   → ALERT
  //   Anything else (no data)                        → OFFLINE
  _renderMedicationsTile(vc, v) {
    const variants = v && v.variants && v.variants.length ? v.variants : null;
    if (!variants) {
      return html`
        <div class="tile">
          <div class="tile-label">${vc.label}</div>
          <div class="tile-value tile-offline"
               style=${`color:var(--lcars-gray, #666688)`}>—</div>
          <div class="tile-unit">no data</div>
        </div>`;
    }
    const byLabel = (L) => variants.find((vt) => String(vt.label || '').toUpperCase() === L);
    const scheduled = byLabel('SCHEDULED');
    const status = byLabel('STATUS');
    const taken = byLabel('TAKEN');
    const statusRaw = String((status && status.value) || '').toLowerCase();
    let scheduledMs = NaN;
    if (scheduled && scheduled.value) {
      const t = typeof scheduled.value === 'number' ? scheduled.value : Date.parse(scheduled.value);
      if (Number.isFinite(t)) scheduledMs = t;
    }
    const ageMs = Number.isFinite(scheduledMs) ? (Date.now() - scheduledMs) : NaN;
    let band = MEDICAL_STATUS.OFFLINE;
    let headline = '—';
    if (statusRaw) {
      if (/taken|logged|recorded|complete/.test(statusRaw)) {
        band = MEDICAL_STATUS.NOMINAL;
        headline = 'TAKEN';
      } else if (/missed|overdue|skip/.test(statusRaw)) {
        band = MEDICAL_STATUS.ALERT;
        headline = 'OVERDUE';
      } else if (/pending|due/.test(statusRaw)) {
        if (Number.isFinite(ageMs) && ageMs > 2 * 60 * 60 * 1000) {
          band = MEDICAL_STATUS.ALERT;
          headline = 'OVERDUE';
        } else if (Number.isFinite(ageMs) && ageMs > 30 * 60 * 1000) {
          band = MEDICAL_STATUS.ELEVATED;
          headline = 'PENDING';
        } else {
          band = MEDICAL_STATUS.NOMINAL;
          headline = 'PENDING';
        }
      } else {
        band = MEDICAL_STATUS.NOMINAL;
        headline = String(statusRaw).toUpperCase();
      }
    } else if (taken && taken.value) {
      band = MEDICAL_STATUS.NOMINAL;
      headline = 'TAKEN';
    }
    const color = STATUS_COLOR[band] || STATUS_COLOR.OFFLINE;
    const schedDisplay = Number.isFinite(scheduledMs)
      ? this._formatStaleness(scheduledMs)
      : '—';
    const headlineEid = (status && status.eid) || (scheduled && scheduled.eid) || (taken && taken.eid);
    return this._wrapTile(vc.label, headlineEid, html`
      <div class="tile-label">${vc.label}</div>
      <div class="tile-value" data-medical="phi"
           aria-live="off"
           ?aria-hidden=${this._audioMuted}
           style=${`color:${color}`}>${headline}</div>
      <div class="tile-unit">${schedDisplay !== '—' ? html`scheduled ${schedDisplay} ago` : 'no schedule'}</div>
      ${variants.length ? html`
        <div class="tile-variants" aria-label="Medication detail">
          ${variants.map((vt) => html`
            <div class="tile-variant">
              <span class="tile-variant-label">${vt.label || '·'}</span>
              <span class="tile-variant-value" data-medical="phi"
                    ?aria-hidden=${this._audioMuted}>${this._formatMedicationValue(vt)}</span>
            </div>`)}
        </div>` : ''}
    `);
  }

  // Helper for the medications composite — formats timestamps as relative age
  // and pretty-cases status enums. Keeps the composite tile rendering clean.
  _formatMedicationValue(vt) {
    if (!vt || vt.value == null || vt.value === '' || vt.value === 'unknown' || vt.value === 'unavailable') return '—';
    const label = String(vt.label || '').toUpperCase();
    if (label === 'SCHEDULED' || label === 'TAKEN') {
      return this._formatStaleness(vt.value) + ' ago';
    }
    return String(vt.value).toUpperCase();
  }

  // 5.14.0-beta.1 — Last-sync row (per spec §3.1.2). Renders a single LCARS
  // pill at the bottom of SUMMARY: `LAST SYNC · {max_freshness} · {N} SOURCES
  // ({comma_list})`. max_freshness = age of the most-recent sample across all
  // bound entities for this profile. comma_list = platforms that produced ≥1
  // rendered value (uniqued by sourceChipForEntity → platform name).
  _renderLastSyncRow(profile) {
    if (!profile || !Array.isArray(profile.entities) || !profile.entities.length) {
      return html`<div class="last-sync-row" role="contentinfo">LAST SYNC · NO DATA</div>`;
    }
    let newestMs = 0;
    const platformsSet = new Set();
    for (const e of profile.entities) {
      const ts = Date.parse(e.state.last_changed || e.state.last_updated || 0);
      if (Number.isFinite(ts) && ts > newestMs) newestMs = ts;
      const eid = e.eid || (e.state && e.state.entity_id);
      const chip = sourceChipForEntity(eid);
      if (chip && chip !== '·') platformsSet.add(this._platformNameForChip(chip));
    }
    const freshness = newestMs ? this._formatStaleness(newestMs) : '—';
    const platforms = [...platformsSet];
    const platformList = platforms.length ? platforms.join(' · ') : 'NONE';
    return html`
      <div class="last-sync-row" role="contentinfo"
           aria-label="Last sync ${freshness} ago, ${platforms.length} sources">
        LAST SYNC · ${freshness} AGO · ${platforms.length} SOURCE${platforms.length === 1 ? '' : 'S'}
        <span class="last-sync-platforms">(${platformList})</span>
      </div>`;
  }

  _platformNameForChip(chip) {
    switch (chip) {
      case 'ᴼ': return 'OURA';
      case 'ᵂ': return 'WITHINGS';
      case 'ᴴ': return 'HEALTH AUTO IMPORT';
      case 'ᴬ': return 'APPLE HEALTH';
      case 'ᴹ': return 'MQTT';
      case 'ᶠ': return 'FITBIT';
      case 'ᴳ': return 'GARMIN';
      case 'ᵍ': return 'GOOGLE FIT';
      case 'ᴰ': return 'DEXCOM';
      case 'ᴺ': return 'NEST PROTECT';
      default:  return chip;
    }
  }

  // 5.13.x — inline ECG summary rendered BELOW the decorative waveform in the
  // BIOMEDICAL view. Compact 2-line layout: classification on top, AFib + today
  // counts on the bottom. Designed to fit inside `scan-pane` without scrolling.
  _renderEcgCompositeInline(v) {
    const variants = v && v.variants && v.variants.length ? v.variants : null;
    if (!variants) return '';
    const byLabel = (L) => variants.find((vt) => String(vt.label || '').toUpperCase() === L);
    const cls = byLabel('CLASS');
    const sev = byLabel('SEVERITY');
    const avgHr = byLabel('AVG HR');
    const afibDetected = byLabel('AFIB?');
    const countToday = byLabel('TODAY #');
    const lastAfib = byLabel('LAST AFIB');
    // 5.14.0-beta.2 (crew S1-2 / spec C13) — NaN-safe headline + cells.
    const hasHeadline = _isEnumValueDisplayable(cls?.value);
    const headline = hasHeadline ? _formatEnum(cls.value) : null;
    const afibDetectedNow = afibDetected && /on|true|1|yes|detect/i.test(String(afibDetected.value));
    const avgHrNum = avgHr && Number.isFinite(parseFloat(avgHr.value)) ? Math.round(parseFloat(avgHr.value)) : null;
    const countTodayNum = countToday && Number.isFinite(Number(countToday.value)) ? Math.round(Number(countToday.value)) : null;
    const hasAnyData = headline || avgHrNum != null || countTodayNum != null || afibDetectedNow || (lastAfib && lastAfib.value);
    if (!hasAnyData) {
      return html`
        <div class="ecg-inline" data-medical="phi" ?aria-hidden=${this._audioMuted}>
          <div class="ecg-inline-row">
            <span class="ecg-inline-label">ECG</span>
            <span class="ecg-inline-sub">NO DATA</span>
          </div>
        </div>
      `;
    }
    let status = MEDICAL_STATUS.NOMINAL;
    if (afibDetectedNow) status = MEDICAL_STATUS.ALERT;
    else if (sev && /high|severe/i.test(String(sev.value))) status = MEDICAL_STATUS.ELEVATED;
    const color = STATUS_COLOR[status] || STATUS_COLOR.OFFLINE;
    return html`
      <div class="ecg-inline" data-medical="phi" ?aria-hidden=${this._audioMuted}>
        <div class="ecg-inline-row">
          <span class="ecg-inline-label">LATEST</span>
          ${headline ? html`<span class="ecg-inline-value" style=${`color:${color}`}>${headline}</span>` : html`<span class="ecg-inline-sub">—</span>`}
          ${avgHrNum != null ? html`<span class="ecg-inline-sub">${avgHrNum} bpm</span>` : ''}
        </div>
        <div class="ecg-inline-row">
          ${countTodayNum != null ? html`<span class="ecg-inline-sub">${countTodayNum} today</span>` : ''}
          ${afibDetectedNow ? html`<span class="ecg-inline-sub" style="color:var(--lcars-alert,#cc6666)">AFIB DETECTED</span>` : ''}
          ${lastAfib && lastAfib.value ? html`<span class="ecg-inline-sub">last AFib ${this._formatStaleness(lastAfib.value)}</span>` : ''}
        </div>
      </div>
    `;
  }

  // 5.13.x — inline HR Alerts summary rendered as the RIGHT pane of the
  // BIOMEDICAL view when HealthyApps HR notifications are present. Lists today's
  // event counts and the most-recent notification metadata.
  _renderHrAlertsInline(v) {
    const variants = v && v.variants && v.variants.length ? v.variants : null;
    if (!variants) return '';
    const byLabel = (L) => variants.find((vt) => String(vt.label || '').toUpperCase() === L);
    const high = byLabel('HIGH #');
    const low = byLabel('LOW #');
    const irreg = byLabel('IRREG #');
    const irregBin = byLabel('IRREG?');
    const lastType = byLabel('LAST TYPE');
    const peakHr = byLabel('PEAK HR');
    const thresh = byLabel('THRESH');
    const dur = byLabel('DURATION');
    const lastAt = byLabel('LAST AT');
    const n = (x) => Number.isFinite(parseFloat(x?.value)) ? parseFloat(x.value) : 0;
    const irregActive = irregBin && /on|true|1|yes|detect/i.test(String(irregBin.value));
    const tone = irregActive || n(irreg) > 0
      ? 'var(--lcars-alert, #cc6666)'
      : (n(high) > 0 || n(low) > 0 ? 'var(--lcars-gold, #ffaa00)' : 'var(--lcars-data-accent, #99cc99)');
    return html`
      <div class="hr-alerts-inline" data-medical="phi" ?aria-hidden=${this._audioMuted}>
        <div class="hr-alerts-counts">
          <div class="hr-alerts-count">
            <span class="hr-alerts-count-label">HIGH</span>
            <span class="hr-alerts-count-value" style=${`color:${tone}`}>${high ? Math.round(n(high)) : 0}</span>
          </div>
          <div class="hr-alerts-count">
            <span class="hr-alerts-count-label">LOW</span>
            <span class="hr-alerts-count-value" style=${`color:${tone}`}>${low ? Math.round(n(low)) : 0}</span>
          </div>
          <div class="hr-alerts-count">
            <span class="hr-alerts-count-label">IRREG</span>
            <span class="hr-alerts-count-value" style=${`color:${tone}`}>${irreg ? Math.round(n(irreg)) : 0}</span>
          </div>
        </div>
        ${lastType && _isEnumValueDisplayable(lastType.value) ? html`
          <div class="hr-alerts-latest">
            <div class="hr-alerts-row">
              <span class="hr-alerts-label">LATEST</span>
              <span class="hr-alerts-value">${_formatEnum(lastType.value)}</span>
            </div>
            ${peakHr && Number.isFinite(parseFloat(peakHr.value)) ? html`
              <div class="hr-alerts-row">
                <span class="hr-alerts-label">PEAK</span>
                <span class="hr-alerts-value">${Math.round(parseFloat(peakHr.value))} bpm</span>
              </div>` : ''}
            ${thresh && Number.isFinite(parseFloat(thresh.value)) ? html`
              <div class="hr-alerts-row">
                <span class="hr-alerts-label">THRESH</span>
                <span class="hr-alerts-value">${Math.round(parseFloat(thresh.value))} bpm</span>
              </div>` : ''}
            ${dur && Number.isFinite(parseFloat(dur.value)) ? html`
              <div class="hr-alerts-row">
                <span class="hr-alerts-label">DURATION</span>
                <span class="hr-alerts-value">${Math.round(parseFloat(dur.value))} min</span>
              </div>` : ''}
            ${lastAt && lastAt.value ? html`
              <div class="hr-alerts-row">
                <span class="hr-alerts-label">WHEN</span>
                <span class="hr-alerts-value">${this._formatStaleness(lastAt.value)} ago</span>
              </div>` : ''}
          </div>` : html`<div class="hr-alerts-empty">NO RECENT ALERTS</div>`}
      </div>
    `;
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
              ${this._renderHeader(profile, fileId, overall, anchors)}
              ${this._renderRestBanner(profile.profileId)}
              ${this._focusMode === 'anatomical' ? this._renderAnatomicalZone(anchors, vitalsByKind, profile.profileId)
                : this._focusMode === 'biomedical' ? this._renderBiomedicalZone(vitalsByKind, anchors, profile.profileId)
                : html`
                  <section class="zone-b" aria-label="Anatomical vital map">
                    <lcars-anatomical-silhouette
                      .paths=${MEDICAL_SILHOUETTE_PATHS}
                      .anchorMap=${ANCHOR_MAP}
                      .anchors=${anchors}
                      .thermal=${this._thermal}
                      .viewBox=${'-110 0 420 480'}
                      .bodyBox=${'0 0 200 480'}
                      .dataAttr=${{ name: 'medical', value: 'phi' }}
                      .ariaLabel=${'Biofunction silhouette'}
                    ></lcars-anatomical-silhouette>
                    ${!consentGranted ? this._renderConsentGate(fileId) : ''}
                  </section>
                  ${this._renderTiles(vitalsByKind, profile.profileId, 'summary')}
                  ${this._renderLastSyncRow(profile)}
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
        .status-pill-group {
          display: inline-flex; flex-direction: column; align-items: flex-end;
          gap: 0.15rem;
        }
        .status-why {
          font-family: var(--lcars-font, 'Antonio', sans-serif);
          text-transform: uppercase; letter-spacing: 0.06em;
          font-size: 0.65rem; color: var(--lcars-ice, #99ccff);
          opacity: 0.85;
        }
        /* Zone B */
        .zone-b {
          flex: 1 1 auto; position: relative; min-height: 320px;
          display: flex; align-items: center; justify-content: center;
        }
        lcars-anatomical-silhouette { width: 100%; height: 100%; min-height: 320px; max-height: 480px; aspect-ratio: 420 / 480; }
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
        /* 5.11.0-beta.1 (Captain) — clickable tiles open HA more-info dialog. */
        .tile-clickable {
          cursor: pointer;
          transition: background 0.12s ease, border-color 0.12s ease;
        }
        .tile-clickable:hover {
          background: rgba(153, 204, 255, 0.12);
          border-left-color: var(--lcars-gold, #ffaa00);
        }
        .tile-clickable:focus-visible {
          outline: 2px solid var(--lcars-ice, #99ccff);
          outline-offset: 2px;
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
        /* 5.12.0-beta.7 (Geordi) — body-comp breakdown rows render an inline unit
           after the value (e.g. "65.65 KG"); subordinate it per LCARS label hierarchy
           so it doesn't compete with the numeric value. */
        .tile-variant-unit {
          font-size: 0.55rem;
          opacity: 0.75;
          letter-spacing: 0.06em;
          margin-left: 0.15rem;
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

        /* 5.13.x — HealthyApps MQTT bridge: BIOMEDICAL view ECG / HR alerts panes */
        .ecg-inline {
          margin-top: 0.6rem;
          padding-top: 0.6rem;
          border-top: 1px solid rgba(153, 204, 255, 0.18);
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
          font-family: var(--lcars-font, 'Antonio', sans-serif);
        }
        .ecg-inline-row {
          display: flex;
          flex-wrap: wrap;
          align-items: baseline;
          gap: 0.6rem;
        }
        .ecg-inline-label {
          font-size: 0.8rem;
          letter-spacing: 0.12em;
          color: var(--lcars-gray, #aaaadd);
        }
        .ecg-inline-value {
          font-size: 1.2rem;
          font-weight: 700;
          letter-spacing: 0.06em;
        }
        .ecg-inline-sub {
          font-size: 0.9rem;
          color: var(--lcars-text, #ccccee);
          letter-spacing: 0.04em;
        }

        .hr-alerts-inline {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
          font-family: var(--lcars-font, 'Antonio', sans-serif);
        }
        .hr-alerts-counts {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;
        }
        .hr-alerts-count {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0.6rem 0.4rem;
          background: rgba(102, 102, 136, 0.15);
          border-radius: 0.3rem;
        }
        .hr-alerts-count-label {
          font-size: 0.75rem;
          letter-spacing: 0.12em;
          color: var(--lcars-gray, #aaaadd);
        }
        .hr-alerts-count-value {
          font-size: 1.8rem;
          font-weight: 700;
          letter-spacing: 0.04em;
        }
        .hr-alerts-latest {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          padding-top: 0.5rem;
          border-top: 1px solid rgba(153, 204, 255, 0.18);
        }
        .hr-alerts-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 0.6rem;
        }
        .hr-alerts-label {
          font-size: 0.8rem;
          letter-spacing: 0.12em;
          color: var(--lcars-gray, #aaaadd);
        }
        .hr-alerts-value {
          font-size: 1rem;
          color: var(--lcars-text, #ccccee);
          letter-spacing: 0.04em;
        }
        .hr-alerts-empty {
          font-size: 0.95rem;
          letter-spacing: 0.1em;
          color: var(--lcars-gray, #888899);
          text-align: center;
          padding: 1rem 0;
        }

        .heart-metrics-panel {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 0.55rem;
          font-family: var(--lcars-font, 'Antonio', sans-serif);
        }
        .heart-metric-row {
          display: grid;
          grid-template-columns: 1fr auto auto;
          align-items: baseline;
          gap: 0.45rem;
          min-height: 3.4rem;
          padding: 0.65rem 0.75rem;
          background: rgba(153, 204, 255, 0.05);
          border-left: 3px solid var(--lcars-ice, #a8d8ff);
          border-radius: 0 0.45rem 0.45rem 0;
        }
        .heart-metric-label {
          font-size: 0.78rem;
          letter-spacing: 0.12em;
          color: var(--lcars-gray, #aaaadd);
          text-transform: uppercase;
        }
        .heart-metric-value {
          font-size: 1.45rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: var(--lcars-data-accent, #99cc99);
        }
        .heart-metric-unit {
          font-size: 0.75rem;
          letter-spacing: 0.12em;
          color: var(--lcars-gray, #aaaadd);
          text-transform: uppercase;
        }
        .heart-metrics-empty {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 6rem;
          font-family: var(--lcars-font, 'Antonio', sans-serif);
          font-size: 0.95rem;
          letter-spacing: 0.1em;
          color: var(--lcars-gray, #888899);
          text-transform: uppercase;
          background: rgba(153, 204, 255, 0.03);
          border-radius: 0.3rem;
        }

        /* 5.14.0-beta.1 — last-sync row, source chip, recovery pill modifier */
        .last-sync-row {
          margin-top: 0.6rem;
          padding: 0.5rem 0.75rem;
          font-family: var(--lcars-font, 'Antonio', sans-serif);
          font-size: 0.85rem;
          letter-spacing: 0.1em;
          color: var(--lcars-gray, #aaaadd);
          background: rgba(153, 204, 255, 0.04);
          border-left: 3px solid var(--lcars-ice, #a8d8ff);
          border-radius: 0 var(--lcars-btn-radius, 0.6rem) var(--lcars-btn-radius, 0.6rem) 0;
          text-transform: uppercase;
        }
        .last-sync-row .last-sync-platforms {
          margin-left: 0.5rem;
          color: var(--lcars-text, #ccccee);
          opacity: 0.85;
          font-size: 0.78rem;
          letter-spacing: 0.06em;
        }
        .tile-source-chip {
          font-size: 0.65em;
          color: var(--lcars-gold, #ffcc66);
          margin-left: 0.18em;
          letter-spacing: 0;
          vertical-align: super;
        }
        .status-pill-recovery {
          /* Visually distinguish recovery from the standard rollup pill so it
             doesn't read as a regular ELEVATED. Slight glow + uppercase comma. */
          box-shadow: 0 0 0 2px var(--lcars-gold, #ffaa00) inset;
          font-weight: 700;
          letter-spacing: 0.12em;
        }
        .scan-pane-wide { grid-column: 1 / -1; }
      `,
    ];
  }
}

if (!customElements.get('lcars-medical-card')) {
  defineLcars('lcars-medical-card', LcarsMedicalCard);
}
