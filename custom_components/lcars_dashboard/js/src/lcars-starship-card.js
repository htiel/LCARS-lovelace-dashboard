// LCARS Starship Health — Vessel Diagnostic Card.
//
// Per LCARS-STARSHIP-HEALTH-DASHBOARD-SPEC. Renders one card per discovered
// vessel; default is the local HA host (VESSEL-LOCAL). Multi-host: every
// glances config entry surfaces as an additional vessel in the responsive grid.
//
// Privacy posture (Worf §7):
//   - Closed shadow root.
//   - Zero outbound network bytes; reads only hass.states.
//   - No hostnames, IPs, MACs, SSIDs, container names rendered.
//   - All metric value cells carry data-starship="op" (screenshot-obfuscator hook only).
//   - Vessel ID + class strings carry data-starship="op|class" (screenshot-obfuscator hook only).
//   - #219 (5.5.8): runtime CSS-class redaction removed; dashboard renders cleartext.
//     VESSEL-ID renders the full vessel key (e.g. VESSEL-LOCAL or GLANCES:<device_id>),
//     not a 7-char fnv1a hash, per Captain's directive.
//   - aria-live: metric cells "off"; status pill "polite"; WAN DOWN transition "assertive".
//
// Focus modes (spec §5.5):
//   - summary       (#vessel/{id})              default 3-zone view
//   - engineering   (#vessel/{id}/engineering)  all-sparklines + full disk/iface lists
//   - tactical      (#vessel/{id}/tactical)     side-profile placeholder for v5.4.2
//
// 5.4.0 ships summary; 5.4.1 ships engineering + tactical (skeleton; tactical
// renders a "SCAN MODE PENDING" overlay where the side-profile silhouette will go).

import { LitElement, html, css } from 'lit-element';
import { lcarsBaseStyles } from './lcars-styles.js';
import { lcarsAudio } from './lcars-audio.js';
import { showMoreInfo } from './lcars-helpers.js';
import './lcars-anatomical-silhouette.js';
import {
  STARSHIP_STATUS,
  STARSHIP_METRIC_CLASSES,
  STARSHIP_ANCHOR_MAP,
  STARSHIP_THRESHOLDS,
  STARSHIP_SILHOUETTE_PATHS,
  classifyMetric,
  computeStarshipStatus,
  rollupStarshipStatus,
  discoverVessels,
  decorativeNumerics,
  formatMetric,
} from './lcars-starship-utils.js';

const STATUS_COLOR = {
  NOMINAL:  'var(--lcars-data-accent, #99cc99)',
  DEGRADED: 'var(--lcars-sky, #aaaaff)',
  WARNING:  'var(--lcars-gold, #ffaa00)',
  // #195 — CRITICAL now uses --lcars-tomato (parity with medical-card). Previously
  // CRITICAL shared --lcars-alert with the THERM toggle 'on' state, making the
  // two visually indistinguishable. Tomato is the LCARS escalation tier.
  CRITICAL: 'var(--lcars-tomato, #ff5555)',
  OFFLINE:  'var(--lcars-gray, #666688)',
};

// #192 — vessel metrics older than this are treated as OFFLINE even if numerically
// valid. 5 min matches system_monitor's default scan interval (60s) plus generous
// jitter; a host that hasn't reported in this long is effectively unreachable.
const STALE_METRIC_MS = 5 * 60 * 1000;

class LcarsStarshipCard extends LitElement {
  static get properties() {
    return {
      _hass: { type: Object },
      _config: { type: Object },
      _thermal: { type: Boolean },
      _focusMode: { type: String },        // summary | engineering | tactical
      _focusedVessel: { type: String },    // null = grid view, else vessel key
    };
  }

  // Closed shadow root — Worf §7 (parity with Medical §16)
  createRenderRoot() { return this.attachShadow({ mode: 'closed' }); }

  constructor() {
    super();
    this._hass = null;
    this._config = {};
    this._thermal = true;        // Engineering: thermal overlay default ON (spec §5.2)
    this._focusMode = 'summary';
    this._focusedVessel = null;
    this._lastWanState = {};     // for aria-live="assertive" on DOWN transition (post-render diff)
    this._pendingWanState = {};  // accumulator written by render(), diffed in updated()
    this._wanAlerts = {};        // alert text emitted on next render after a transition
    this._onHashChange = () => this._readFocusFromHash();
    this._readFocusFromHash();
  }

  // Diff WAN state OUTSIDE render() per Geordi 5.4.1 review #7.
  updated(_changed) {
    let dirty = false;
    for (const [key, cur] of Object.entries(this._pendingWanState)) {
      const prev = this._lastWanState[key];
      const newAlert = (prev === 'UP' && cur === 'DOWN') ? 'WAN reachability DOWN' : '';
      if (newAlert && this._wanAlerts[key] !== newAlert) {
        this._wanAlerts[key] = newAlert;
        dirty = true;
      } else if (!newAlert && this._wanAlerts[key]) {
        // Clear last frame's alert so AT only announces the transition once.
        this._wanAlerts[key] = '';
        dirty = true;
      }
      this._lastWanState[key] = cur;
    }
    if (dirty) this.requestUpdate();
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('hashchange', this._onHashChange);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('hashchange', this._onHashChange);
  }

  setConfig(config) { this._config = config || {}; }

  set hass(hass) {
    this._hass = hass;
    this.requestUpdate();
  }
  get hass() { return this._hass; }

  getCardSize() { return 12; }

  _readFocusFromHash() {
    // Format: #vessel/{id}/{mode?}
    const h = (window.location.hash || '').replace(/^#/, '').toLowerCase();
    const parts = h.split('/').filter(Boolean);
    if (parts[0] === 'vessel' && parts[1]) {
      this._focusedVessel = parts[1];
      const mode = parts[2];
      this._focusMode = (mode === 'engineering' || mode === 'tactical') ? mode : 'summary';
    } else {
      this._focusedVessel = null;
      this._focusMode = 'summary';
    }
    this.requestUpdate();
  }

  // Geordi 5.4.1 review #6: state-change toggles must announce per AUDIO-SPEC.
  _toggleThermal() {
    this._thermal = !this._thermal;
    lcarsAudio.play('navAcknowledge');
    this.requestUpdate();
  }

  _setFocus(vesselKey, mode) {
    if (!vesselKey) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
      this._focusedVessel = null;
      this._focusMode = 'summary';
    } else {
      const id = encodeURIComponent(vesselKey.toLowerCase());
      history.replaceState(null, '', `#vessel/${id}${mode && mode !== 'summary' ? `/${mode}` : ''}`);
      this._focusedVessel = vesselKey.toLowerCase();
      this._focusMode = mode || 'summary';
    }
    lcarsAudio.play('navAcknowledge');
    this.requestUpdate();
  }

  /* ═══ Per-vessel metric reduction ═══ */

  _reduceMetrics(vessel) {
    const byKind = new Map();
    let stoppedAddons = 0;
    let runningAddons = 0;
    let updatesPending = 0;
    let updatesTotal = 0;
    let diskUsed = null;
    let diskTotal = null;
    for (const { eid, state } of vessel.entities) {
      const cls = classifyMetric(eid);
      if (!cls) continue;
      const ts = Date.parse(state.last_changed || state.last_updated || 0);
      if (cls.kind === 'addon_running') {
        if (state.state === 'on') runningAddons++;
        else stoppedAddons++;
        continue;
      }
      if (cls.kind === 'updates_pending') {
        updatesTotal++;
        if (state.state === 'on') updatesPending++;
        continue;
      }
      // disk_root: if this is the hassio host pair, capture used + total to derive %.
      if (cls.kind === 'disk_root' && /home_assistant_host_disk_(used|total)$/i.test(eid)) {
        const n = parseFloat(state.state);
        if (!isNaN(n)) {
          if (/disk_used$/i.test(eid)) diskUsed = n;
          else diskTotal = n;
        }
        continue;
      }
      let value;
      if (cls.kind === 'wan_reachable') {
        value = state.state;
      } else if (cls.kind === 'top_cpu_proc' || cls.kind === 'top_memory_proc') {
        // #191 — top process names are intentionally string-valued; parseFloat would
        // drop them. Preserve the raw state so the tile displays the process name.
        value = state.state;
      } else if (cls.kind === 'ha_core_version') {
        // Prefer the OS version sensor's plain string state; the update entity exposes
        // installed_version on .attributes (state itself is on/off).
        value = state.attributes?.installed_version || state.state;
      } else if (cls.kind === 'uptime') {
        value = state.state;   // ISO timestamp; formatMetric converts to days/hours
      } else {
        const n = parseFloat(state.state);
        if (isNaN(n)) continue;
        value = n;
      }
      const cur = byKind.get(cls.kind);
      if (!cur || ts > cur.ts) {
        byKind.set(cls.kind, { kind: cls.kind, value, eid, ts, raw: state.state });
      }
    }
    if (runningAddons || stoppedAddons) {
      byKind.set('addon_running', {
        kind: 'addon_running',
        value: stoppedAddons,
        running: runningAddons,
        total: runningAddons + stoppedAddons,
        ts: Date.now(),
      });
    }
    if (updatesTotal) {
      byKind.set('updates_pending', {
        kind: 'updates_pending',
        value: updatesPending,
        total: updatesTotal,
        ts: Date.now(),
      });
    }
    // Derived disk_root from hassio host disk_used/disk_total (only when system_monitor
    // didn't already supply a direct percent reading).
    if (!byKind.get('disk_root') && diskUsed != null && diskTotal && diskTotal > 0) {
      byKind.set('disk_root', {
        kind: 'disk_root',
        value: Math.round((diskUsed / diskTotal) * 100),
        ts: Date.now(),
        raw: `${Math.round(diskUsed)}/${Math.round(diskTotal)} GB`,
      });
    }
    // Derived: composite_thermal — max of cpu/gpu/nvme normalized to 100-x
    const temps = ['cpu_temp', 'gpu_temp', 'nvme_temp']
      .map((k) => byKind.get(k)?.value)
      .filter((v) => v != null && !isNaN(v));
    if (temps.length) {
      const maxT = Math.max(...temps);
      // 40°C → 100, 90°C → 0; clamp.
      const score = Math.max(0, Math.min(100, Math.round(100 - (maxT - 40) * 2)));
      byKind.set('composite_thermal', { kind: 'composite_thermal', value: score, ts: Date.now() });
    }
    // Derived: entity_health (count unavailable across all states)
    if (this._hass && vessel.key === 'local') {
      const states = this._hass.states || {};
      let unavail = 0;
      for (const s of Object.values(states)) {
        if (s.state === 'unavailable' || s.state === 'unknown') unavail++;
      }
      byKind.set('entity_health', { kind: 'entity_health', value: unavail, ts: Date.now() });
    }
    return byKind;
  }

  _buildAnchors(byKind) {
    const anchors = {};
    const now = Date.now();
    for (const cls of STARSHIP_METRIC_CLASSES) {
      if (!cls.anchor) continue;
      const m = byKind.get(cls.kind);
      // #192 — demote stale metrics (>5 min since last_changed) to OFFLINE so the
      // rollup pill reflects vessel unreachability rather than last-known-good values.
      const isStale = m && m.ts && (now - m.ts) > STALE_METRIC_MS;
      if (!m || m.value == null || (typeof m.value === 'number' && isNaN(m.value)) || isStale) {
        anchors[cls.anchor] = { value: '—', status: STARSHIP_STATUS.OFFLINE, label: cls.label, present: false };
        continue;
      }
      let display, status;
      if (cls.kind === 'addon_running') {
        display = `${m.running}/${m.total}`;
        const t = STARSHIP_THRESHOLDS.addon_stopped;
        status = m.value >= t.critical ? STARSHIP_STATUS.CRITICAL
              : m.value >= t.warning  ? STARSHIP_STATUS.WARNING
              : m.value >= t.degraded ? STARSHIP_STATUS.DEGRADED
              : STARSHIP_STATUS.NOMINAL;
      } else {
        display = formatMetric(cls.kind, m.value);
        status = computeStarshipStatus(cls.kind, m.value);
      }
      anchors[cls.anchor] = { value: display, status, label: cls.label, present: true };
    }
    return anchors;
  }

  /* ═══ Renderers ═══ */

  _renderHeader(vessel, status, byKind) {
    const cols = decorativeNumerics(vessel.key, 3);
    const pillColor = STATUS_COLOR[status] || STATUS_COLOR.NOMINAL;
    return html`
      <header class="zone-a">
        <div class="title">
          <span class="title-text">VESSEL DIAGNOSTIC</span>
          <span class="vessel-id" data-starship="op">${vessel.vesselId}</span>
        </div>
        <div class="vessel-class" data-starship="class">${vessel.vesselClass}</div>
        <div class="numerics" aria-hidden="true">
          ${cols.map((c) => html`<span class="numeric-col">${c}</span>`)}
        </div>
        <div class="header-actions">
          <button class="thermal-toggle ${this._thermal ? 'on' : ''}"
                  aria-pressed=${this._thermal}
                  aria-label="Toggle thermal overlay"
                  title="Toggle thermal overlay"
                  @click=${() => this._toggleThermal()}>
            THERM
          </button>
          <span class="status-pill" aria-live="polite"
                style=${`background:${pillColor};color:#000`}>${status}</span>
        </div>
      </header>
    `;
  }

  _renderTiles(byKind) {
    const tiles = STARSHIP_METRIC_CLASSES.filter((c) => c.tile).slice(0, 12);
    return html`
      <section class="zone-c" aria-label="Vessel detail metrics">
        ${tiles.map((cls) => {
          const m = byKind.get(cls.kind);
          let display = '—';
          let status = STARSHIP_STATUS.OFFLINE;
          let present = false;
          if (m && m.value != null && !(typeof m.value === 'number' && isNaN(m.value))) {
            present = true;
            if (cls.kind === 'addon_running') {
              display = `${m.running}/${m.total}`;
              const t = STARSHIP_THRESHOLDS.addon_stopped;
              status = m.value >= t.critical ? STARSHIP_STATUS.CRITICAL
                    : m.value >= t.warning  ? STARSHIP_STATUS.WARNING
                    : m.value >= t.degraded ? STARSHIP_STATUS.DEGRADED
                    : STARSHIP_STATUS.NOMINAL;
            } else if (cls.kind === 'updates_pending') {
              display = `${m.value}/${m.total}`;
              status = m.value > 0 ? STARSHIP_STATUS.DEGRADED : STARSHIP_STATUS.NOMINAL;
            } else if (cls.kind === 'ha_core_version') {
              display = m.value;
              status = STARSHIP_STATUS.NOMINAL;
            } else {
              display = formatMetric(cls.kind, m.value);
              status = computeStarshipStatus(cls.kind, m.value);
            }
          }
          // Sparklines deferred to v5.4.2 (Data 5.4.1 review #10) — noise-band
          // fabrication is misleading on an Engineering panel; recorder-history
          // sourcing lands with the next minor.
          const color = present ? STATUS_COLOR[status] : 'var(--lcars-gray, #666688)';
          return html`
            <button class="tile" @click=${() => m?.eid && showMoreInfo(this, m.eid)}>
              <div class="tile-label">${cls.label}</div>
              <div class="tile-value" data-starship="op"
                   aria-live="off" style=${`color:${color}`}>${display}</div>
              ${cls.unit ? html`<div class="tile-unit">${cls.unit}</div>` : ''}
            </button>`;
        })}
      </section>
    `;
  }

  _renderFocusTabs(vessel) {
    const id = vessel.vesselId.toLowerCase();
    const mode = this._focusMode;
    const active = this._focusedVessel === id;
    return html`
      <div class="focus-tabs" aria-label="Vessel focus mode">
        ${[
          { m: 'summary', label: 'SUMMARY' },
          { m: 'engineering', label: 'ENGINEERING' },
          { m: 'tactical', label: 'TACTICAL' },
        ].map(({ m, label }) => html`
          <button class="focus-tab ${active && mode === m ? 'active' : ''}"
                  aria-pressed=${active && mode === m}
                  @click=${() => this._setFocus(id, m)}>${label}</button>`)}
        ${active ? html`
          <button class="focus-tab close"
                  aria-label="Return to vessel grid"
                  @click=${() => this._setFocus(null)}
                  title="Return to vessel grid">× CLOSE</button>` : ''}
      </div>`;
  }

  _renderVesselCard(vessel) {
    const byKind = this._reduceMetrics(vessel);
    const anchors = this._buildAnchors(byKind);
    const presentStatuses = Object.values(anchors).filter((a) => a.present).map((a) => a.status);
    const overall = presentStatuses.length ? rollupStarshipStatus(presentStatuses) : STARSHIP_STATUS.NOMINAL;

    // WAN-down assertive announce: state-tracking is performed in `updated()`
    // (Geordi 5.4.1 #7) — render() must not mutate component state. We only
    // EMIT the announcement here based on the pending alert flag set last cycle.
    const wanState = anchors.deflector?.value;
    this._pendingWanState[vessel.key] = wanState;
    const wanAlert = this._wanAlerts[vessel.key] || '';

    const id = vessel.vesselId.toLowerCase();
    const focused = this._focusedVessel === id;
    const tactical = focused && this._focusMode === 'tactical';

    return html`
      <article class="vessel-card ${focused ? 'focused' : ''}" aria-labelledby=${`v-h-${id}`}>
        <h2 id=${`v-h-${id}`} class="sr-only">Vessel ${vessel.vesselId}</h2>
        ${this._renderHeader(vessel, overall, byKind)}
        ${wanAlert ? html`<div class="sr-only" aria-live="assertive">${wanAlert}</div>` : ''}
        ${this._renderFocusTabs(vessel)}
        <section class="zone-b" aria-label="Vessel silhouette diagnostic map">
          <lcars-anatomical-silhouette
            .paths=${STARSHIP_SILHOUETTE_PATHS}
            .anchorMap=${STARSHIP_ANCHOR_MAP}
            .anchors=${anchors}
            .viewBox=${'0 0 480 200'}
            .thermal=${this._thermal}
            .dataAttr=${{ name: 'starship', value: 'op' }}
            .ariaLabel=${`Starship silhouette for vessel ${vessel.vesselId}`}
          ></lcars-anatomical-silhouette>
          ${tactical ? html`
            <div class="scan-pending tactical-overlay" role="status">
              SCAN MODE PENDING — v5.4.2 (side-profile silhouette)
            </div>` : ''}
        </section>
        ${this._renderTiles(byKind)}
      </article>
    `;
  }

  render() {
    if (!this._hass) {
      return html`<div class="loading" role="status">INITIALIZING ENGINEERING DIAGNOSTICS…</div>`;
    }
    const vessels = discoverVessels(this._hass);
    if (!vessels.length) {
      return html`
        <div class="empty" role="status">
          NO HOST TELEMETRY AVAILABLE · INSTALL SYSTEM_MONITOR, HASSIO, OR GLANCES INTEGRATION
        </div>`;
    }
    const visibleVessels = this._focusedVessel
      ? vessels.filter((v) => v.vesselId.toLowerCase() === this._focusedVessel)
      : vessels;
    return html`
      <div class="grid ${this._focusedVessel ? 'focused' : ''}">
        ${visibleVessels.map((v) => this._renderVesselCard(v))}
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
          /* #196 — auto-fit collapses empty tracks; auto-fill left phantom 360px columns at >1600px when only one vessel was registered. */
          grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
          gap: 1rem;
        }
        .grid.focused {
          grid-template-columns: minmax(0, 1fr);
        }
        .vessel-card {
          background: rgba(255, 153, 102, 0.04);
          border-left: 4px solid var(--lcars-butterscotch, #ff9966);
          border-radius: 0 0.5rem 0.5rem 0;
          padding: 0.5rem 0.75rem;
          display: flex; flex-direction: column; gap: 0.5rem;
        }
        .vessel-card.focused { min-height: 80vh; }
        .sr-only {
          position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
          overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;
        }

        /* Zone A — header */
        .zone-a {
          display: grid;
          grid-template-columns: auto 1fr auto;
          grid-template-rows: auto auto;
          gap: 0.25rem 0.75rem;
          align-items: center;
        }
        .title { display: flex; align-items: baseline; gap: 0.5rem; flex-wrap: wrap; }
        .title-text {
          font-family: var(--lcars-font, 'Antonio', sans-serif);
          font-size: 1.1rem;
          color: var(--lcars-gold, #ffaa00);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .vessel-id {
          /* #193 — one-font rule: vessel-id uses Antonio stack, not JetBrains Mono. */
          font-family: var(--lcars-font, 'Antonio', sans-serif);
          font-size: 0.95rem;
          letter-spacing: 0.08em;
          color: var(--lcars-ice, #99ccff);
        }
        .vessel-class {
          grid-column: 1;
          font-size: 0.75rem;
          opacity: 0.75;
          letter-spacing: 0.05em;
        }
        .numerics {
          grid-row: 1 / span 2; grid-column: 2;
          display: flex; gap: 0.4rem; justify-content: center;
          /* #193 — numerics row also unified to Antonio. */
          font-family: var(--lcars-font, 'Antonio', sans-serif);
          font-size: 0.55rem;
          opacity: 0.4;
          line-height: 0.9;
          white-space: pre;
        }
        .header-actions {
          grid-row: 1 / span 2; grid-column: 3;
          display: flex; gap: 0.4rem; align-items: center;
        }
        .thermal-toggle {
          background: var(--lcars-bg-elev, #111);
          color: var(--lcars-ice, #99ccff);
          border: 1px solid var(--lcars-ice, #99ccff);
          border-radius: 999px;
          padding: 0.25rem 0.6rem;
          min-height: 32px;
          font: inherit;
          font-size: 0.7rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
        }
        .thermal-toggle:focus-visible { outline: 2px solid var(--lcars-ice, #99ccff); outline-offset: 2px; }
        .thermal-toggle.on { background: var(--lcars-alert, #cc6666); color: #000; border-color: var(--lcars-alert, #cc6666); }
        .status-pill {
          font-family: var(--lcars-font, 'Antonio', sans-serif);
          font-weight: 700;
          letter-spacing: 0.1em;
          padding: 0.25rem 0.85rem;
          border-radius: 999px;
          font-size: 0.85rem;
        }

        /* Focus tabs */
        .focus-tabs { display: flex; gap: 0.25rem; flex-wrap: wrap; }
        .focus-tab {
          background: var(--lcars-bg-elev, #111);
          color: var(--lcars-butterscotch, #ff9966);
          border: 1px solid var(--lcars-butterscotch, #ff9966);
          border-radius: 999px;
          padding: 0.2rem 0.7rem;
          min-height: 30px;
          font: inherit;
          font-size: 0.65rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
        }
        .focus-tab:focus-visible { outline: 2px solid var(--lcars-ice, #99ccff); outline-offset: 2px; }
        .focus-tab.active { background: var(--lcars-butterscotch, #ff9966); color: #000; }
        .focus-tab.close { border-color: var(--lcars-gray, #666688); color: var(--lcars-gray, #888); }

        /* Zone B — silhouette */
        .zone-b {
          position: relative;
          min-height: 380px;
          color: var(--lcars-butterscotch, #ff9966);
        }
        .vessel-card.focused .zone-b { min-height: 540px; }
        lcars-anatomical-silhouette { width: 100%; height: 100%; min-height: 200px; aspect-ratio: 480 / 240; }
        .scan-pending {
          position: absolute; inset: 1rem;
          display: flex; align-items: center; justify-content: center;
          color: var(--lcars-gray, #888);
          font-size: 0.85rem; letter-spacing: 0.1em; text-transform: uppercase;
          background: repeating-linear-gradient(45deg,
            rgba(102,102,136,0.08),
            rgba(102,102,136,0.08) 12px,
            transparent 12px,
            transparent 24px);
          border-radius: 0.3rem;
          pointer-events: none;
        }
        .tactical-overlay { mix-blend-mode: screen; }

        /* Zone C — tiles */
        .zone-c {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          grid-auto-rows: minmax(60px, auto);
          gap: 0.4rem;
        }
        @media (max-width: 720px) { .zone-c { grid-template-columns: repeat(2, 1fr); } }
        .tile {
          background: rgba(255, 153, 102, 0.06);
          border-left: 3px solid var(--lcars-butterscotch, #ff9966);
          padding: 0.3rem 0.5rem;
          display: flex; flex-direction: column; gap: 0.1rem;
          border-radius: 0 0.25rem 0.25rem 0;
          color: inherit;
          font: inherit;
          text-align: left;
          cursor: pointer;
          min-height: 60px;
        }
        .tile:focus-visible { outline: 2px solid var(--lcars-ice, #99ccff); outline-offset: 2px; }
        .tile-label { font-size: 0.6rem; letter-spacing: 0.08em; color: var(--lcars-butterscotch, #ff9966); opacity: 0.85; }
        .tile-value { font-size: 1.15rem; font-weight: 700; line-height: 1; }
        .tile-unit { font-size: 0.6rem; letter-spacing: 0.06em; opacity: 0.65; }
        .tile-spark { margin-top: 0.2rem; }
      `,
    ];
  }
}

if (!customElements.get('lcars-starship-card')) {
  customElements.define('lcars-starship-card', LcarsStarshipCard);
}
