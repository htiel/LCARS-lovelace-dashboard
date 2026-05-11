/**
 * lcars-network-card.js — Subspace Relay (Network Health + Peripherals)
 *
 * 5.2.0-beta.1 — Network Health panel + WAN strip
 * 5.2.0-beta.2 — Equipment & Peripherals panel (IPP printers)
 * 5.2.1 — Connected Clients panel (deferred — Worf privacy gate)
 *
 * Per specs/LCARS-SUBSPACE-RELAY-DASHBOARD-SPEC.md
 *
 * Discovery contract:
 *   - Platform 'unifi' sensors grouped by device_id → one card per AP/Switch/UDM
 *   - WAN latency hero: sensor.* matching /wan.?latency/i grouped by name token
 *   - Platform 'ipp' sensors grouped by device_id → one card per printer
 *
 * Privacy (Worf):
 *   - All client/host identifiers carry data-network="*" attributes for
 *     localinfo/screenshot-obfuscator.js to redact.
 */
import { LitElement, html, css } from 'lit-element';
import { lcarsEventBus, showMoreInfo } from './lcars-helpers.js';
import { lcarsBaseStyles } from './lcars-styles.js';
import { lcarsAudio } from './lcars-audio.js';
import { formatNumber } from './lcars-format-utils.js';

const FILTER_ALL = 'all';
const FILTER_HEALTH = 'health';
const FILTER_PERIPHERALS = 'peripherals';
const FILTER_CLIENTS = 'clients';

// Anchored regex to avoid false positives on substrings (e.g. *_state_changes).
// WAN latency is matched separately because the prefix can be Google/Cloudflare/Microsoft.
// #183 — entity-id pattern for UniFi infrastructure health sensors. Suffix-only:
// modern HA UniFi entity IDs are named after the device (e.g.
// `sensor.dream_machine_pro_cpu_utilization`, `sensor.u7_pro_xg_uptime`), NOT
// `sensor.unifi_*`. The platform === 'unifi' gate above is the actual integration
// filter; this regex only classifies the suffix. The previous `^sensor\.unifi_`
// prefix anchor produced empty Health panels on every site (5.6.6 hotfix).
// `_state` is gated separately below to exclude `port_*_state` / `uplink_*_state`.
const UNIFI_HEALTH_RE = /^sensor\..+(_cpu_utilization|_memory_utilization|_uptime|_state|_clients|(?:_cpu|_phy|_local)_temperature|_link_speed)$/i;
const WAN_LATENCY_RE = /wan.?latency/i;
const IPP_INK_RE = /_(black|cyan|magenta|yellow)_ink$/i;

/* Threshold map per spec §5 — green/amber/red */
const THRESHOLDS = {
  cpu:    { warn: 70, crit: 90 },     // %
  memory: { warn: 80, crit: 95 },     // %
  temp:   { warn: 65, crit: 80 },     // °C
  ink:    { warn: 25, crit: 10 },     // % remaining (lower-is-worse)
  latency:{ warn: 60, crit: 150 },    // ms
};

function _statusColor(value, t, lowerIsWorse = false) {
  const v = Number(value);
  if (isNaN(v)) return 'var(--lcars-gray, #666688)';
  if (lowerIsWorse) {
    if (v <= t.crit) return 'var(--lcars-alert, #cc6666)';
    if (v <= t.warn) return 'var(--lcars-gold, #ffaa00)';
    return 'var(--lcars-data-accent, #99cc99)';
  }
  if (v >= t.crit) return 'var(--lcars-alert, #cc6666)';
  if (v >= t.warn) return 'var(--lcars-gold, #ffaa00)';
  return 'var(--lcars-data-accent, #99cc99)';
}

function _fmtUptime(state) {
  // UniFi gives an ISO timestamp; compute friendly duration
  if (!state || state === 'unknown' || state === 'unavailable') return '—';
  const t = Date.parse(state);
  if (isNaN(t)) return state;
  const sec = Math.max(0, (Date.now() - t) / 1000);
  const days = Math.floor(sec / 86400);
  const hrs = Math.floor((sec % 86400) / 3600);
  if (days > 0) return `${days}d ${hrs}h`;
  const min = Math.floor((sec % 3600) / 60);
  return `${hrs}h ${min}m`;
}

class LcarsNetworkCard extends LitElement {
  // Closed shadow root — Worf 5.4.1 review B2 (parity with Medical §16 + Starship §7).
  // Network device names + client identifiers must NOT be reachable via
  // document.querySelector('lcars-network-card').shadowRoot from sibling cards.
  createRenderRoot() { return this.attachShadow({ mode: 'closed' }); }

  static get properties() {
    return {
      hass: { type: Object }, _config: { type: Object }, filter: { type: String },
    };
  }

  constructor() {
    super();
    this._hass = null; this._config = {}; this.filter = FILTER_ALL;
    this._onFilter = (e) => { this.filter = e.detail.filter; };
  }

  setConfig(config) { this._config = config || {}; }

  set hass(val) {
    const old = this._hass;
    this._hass = val;
    if (val && old !== val) this.requestUpdate('hass', old);
  }
  get hass() { return this._hass; }

  connectedCallback() {
    super.connectedCallback();
    lcarsEventBus.addEventListener('lcars-net-filter', this._onFilter);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    lcarsEventBus.removeEventListener('lcars-net-filter', this._onFilter);
  }

  getCardSize() { return 12; }

  /* ═══ Discovery ═══ */

  _discoverUnifi() {
    if (!this._hass) return { devices: [], wanLatency: [] };
    const states = this._hass.states || {};
    const entities = this._hass.entities || {};
    const devices = this._hass.devices || {};
    const byDevice = new Map();
    const wanLatency = [];

    for (const [eid, e] of Object.entries(entities)) {
      if (e.platform !== 'unifi') continue;
      if (e.disabled_by || e.hidden_by) continue;
      const domain = eid.split('.')[0];
      if (domain === 'device_tracker') continue;        // → 5.2.1 Clients panel
      if (domain === 'update') continue;                // firmware updates — separate concern
      if (domain === 'switch') continue;                // config switches noise
      if (domain === 'button') continue;
      const state = states[eid];
      if (!state) continue;

      // WAN latency is special — fan out to hero strip not into per-device card
      if (WAN_LATENCY_RE.test(eid)) {
        wanLatency.push({ entity: e, state, eid });
        continue;
      }

      if (!UNIFI_HEALTH_RE.test(eid)) continue;

      const devId = e.device_id;
      if (!devId) continue;
      if (!byDevice.has(devId)) {
        const device = devices[devId];
        byDevice.set(devId, {
          device_id: devId,
          name: device?.name_by_user || device?.name || 'Unknown UniFi Device',
          model: device?.model || '',
          area_id: device?.area_id || null,
          sensors: {},
        });
      }
      const bucket = byDevice.get(devId);
      // Classify sensor by suffix
      if (/cpu_utilization$/i.test(eid)) bucket.sensors.cpu = { entity: e, state, eid };
      else if (/memory_utilization$/i.test(eid)) bucket.sensors.memory = { entity: e, state, eid };
      else if (/uptime$/i.test(eid)) bucket.sensors.uptime = { entity: e, state, eid };
      // 5.6.6: gate _state against port_/uplink_ so per-port state sensors do
      // not last-write-win over the device-level state. Pair with the
      // suffix-only UNIFI_HEALTH_RE relaxation above.
      else if (/_state$/i.test(eid) && !/_(port|uplink)_/i.test(eid)) bucket.sensors.state = { entity: e, state, eid };
      else if (/clients$/i.test(eid)) bucket.sensors.clients = { entity: e, state, eid };
      else if (/(cpu|phy|local)_temperature$/i.test(eid)) {
        // Prefer cpu_temperature over phy/local
        if (!bucket.sensors.temperature || /cpu_temperature$/i.test(eid)) {
          bucket.sensors.temperature = { entity: e, state, eid };
        }
      } else if (/link_speed$/i.test(eid) && !/port_/i.test(eid)) {
        bucket.sensors.link_speed = { entity: e, state, eid };
      }
    }

    // Order: UDM-class first (has temperature OR cpu+memory), then APs, then switches
    const list = [...byDevice.values()];
    list.sort((a, b) => {
      const aIsGw = a.sensors.temperature ? 0 : 1;
      const bIsGw = b.sensors.temperature ? 0 : 1;
      if (aIsGw !== bIsGw) return aIsGw - bIsGw;
      return (a.name || '').localeCompare(b.name || '');
    });

    return { devices: list, wanLatency };
  }

  _discoverPrinters() {
    if (!this._hass) return [];
    const states = this._hass.states || {};
    const entities = this._hass.entities || {};
    const devices = this._hass.devices || {};
    const byDevice = new Map();

    for (const [eid, e] of Object.entries(entities)) {
      if (e.platform !== 'ipp') continue;
      if (e.disabled_by || e.hidden_by) continue;
      const state = states[eid];
      if (!state) continue;
      const devId = e.device_id;
      if (!devId) continue;
      if (!byDevice.has(devId)) {
        const device = devices[devId];
        byDevice.set(devId, {
          device_id: devId,
          name: device?.name_by_user || device?.name || 'Printer',
          model: device?.model || '',
          manufacturer: device?.manufacturer || '',
          status: null, inks: [],
        });
      }
      const bucket = byDevice.get(devId);
      const m = eid.match(IPP_INK_RE);
      if (m) {
        const color = m[1].toLowerCase();
        // Dedupe: replace any existing entry for the same color (multiple integration
        // instances or stale entities in the registry can yield duplicates).
        const existingIdx = bucket.inks.findIndex((x) => x.color === color);
        const entry = { color, entity: e, state, eid };
        if (existingIdx >= 0) bucket.inks[existingIdx] = entry;
        else bucket.inks.push(entry);
      } else if (e.translation_key === 'printer' || e.unique_id?.endsWith('_printer')) {
        // Printer status enum sensor (idle/printing/stopped). Match on the entity-registry
        // entry's translation_key (NOT state.attributes — that field doesn't exist there).
        bucket.status = { entity: e, state, eid };
      }
    }

    // Stable ink order: KCMY (industry-standard print order)
    const COLOR_ORDER = ['black', 'cyan', 'magenta', 'yellow'];
    for (const p of byDevice.values()) {
      p.inks.sort((a, b) => COLOR_ORDER.indexOf(a.color) - COLOR_ORDER.indexOf(b.color));
    }
    return [...byDevice.values()];
  }

  /* ═══ Connected Clients (5.2.1) ═══
   * #219 — in-card runtime obfuscation removed. Dashboard renders real hostnames/MACs/SSIDs.
   * Screenshot redaction is handled by localinfo/screenshot-obfuscator.js via the
   * data-network="hostname|mac|ssid" attributes preserved below.
   */
  _discoverClients() {
    if (!this._hass) return [];
    const states = this._hass.states || {};
    const entities = this._hass.entities || {};
    const devices = this._hass.devices || {};
    const out = [];

    for (const [eid, e] of Object.entries(entities)) {
      if (e.platform !== 'unifi') continue;
      if (e.disabled_by || e.hidden_by) continue;
      if (!eid.startsWith('device_tracker.')) continue;
      const state = states[eid];
      if (!state) continue;
      const dev = devices[e.device_id || ''] || {};
      const attrs = state.attributes || {};
      const hostname = dev.name_by_user || dev.name || attrs.host_name || attrs.friendly_name || eid.split('.')[1];
      const mac = (attrs.mac || '').toLowerCase();
      const ip = attrs.ip || '';
      const isHome = state.state === 'home';
      out.push({
        eid,
        hostname,
        mac,
        ip,
        connected: isHome,
        ssid: attrs.essid || attrs.ssid || '',
        firstSeen: attrs.first_seen,
      });
    }

    out.sort((a, b) => {
      if (a.connected !== b.connected) return a.connected ? -1 : 1;
      return (a.hostname || '').localeCompare(b.hostname || '');
    });
    return out;
  }

  // #219 — was: hash device name when reveal toggle off. Now: render real name.
  // Screenshot tool handles redaction via data-network="hostname".
  _maskName(name /* , prefix */) {
    return name || '';
  }

  _renderClients(clients) {
    const connected = clients.filter((c) => c.connected).length;
    const total = clients.length;
    return html`
      <section aria-labelledby="net-clients-h">
        <header class="clients-head">
          <h2 id="net-clients-h" class="net-section-h" style="margin:0">
            Connected Clients · ${connected} / ${total} online
          </h2>
        </header>
        <div class="net-clients-grid">
          ${clients.map((c) => this._renderClient(c))}
        </div>
      </section>`;
  }

  _renderClient(c) {
    const dotColor = c.connected ? 'var(--lcars-data-accent, #99cc99)' : 'var(--lcars-gray, #666688)';
    return html`
      <button class="client-tile" @click=${() => showMoreInfo(this, c.eid)}>
        <span class="client-dot" style=${`background:${dotColor}`} aria-hidden="true"></span>
        <span class="client-name" data-network="hostname">${c.hostname}</span>
        ${c.mac ? html`<span class="client-mac" data-network="mac">${c.mac}</span>` : ''}
        ${c.ssid ? html`<span class="client-ssid" data-network="ssid">${c.ssid}</span>` : ''}
      </button>`;
  }

  /* ═══ Renderers ═══ */

  _renderWanStrip(wanSensors) {
    if (!wanSensors.length) return '';
    return html`
      <section class="wan-strip" aria-label="WAN latency">
        <div class="wan-label">WAN STATUS</div>
        ${wanSensors.map((s) => {
          const v = Number(s.state.state);
          const color = _statusColor(v, THRESHOLDS.latency);
          // Strip the *suffix* ("... WAN Latency"); keep the prefix (probe target).
          const fname = s.state.attributes?.friendly_name || s.eid;
          const label = fname.replace(/\s*wan.?latency.*$/i, '').trim() || 'Latency';
          const display = isNaN(v) ? '—' : `${formatNumber(v, 0)} ms`;
          // data-network="hostname" defensively redacts self-hosted probe target names
          // in screenshots (Google/Cloudflare/Microsoft are public services and remain
          // visible after redaction; private DNS gets scrubbed).
          return html`
            <button class="wan-tile" @click=${() => showMoreInfo(this, s.eid)} aria-label="${label} latency ${display}">
              <span class="wan-tile-label" data-network="hostname">${label}</span>
              <span class="wan-tile-value" style="color:${color}">${display}</span>
            </button>`;
        })}
      </section>`;
  }

  _renderHealthDevice(d) {
    const cpu = d.sensors.cpu?.state?.state;
    const mem = d.sensors.memory?.state?.state;
    const temp = d.sensors.temperature?.state?.state;
    const uptime = d.sensors.uptime?.state?.state;
    const state = d.sensors.state?.state?.state;
    const clients = d.sensors.clients?.state?.state;
    const linkSpeed = d.sensors.link_speed?.state?.state;
    const linkUnit = d.sensors.link_speed?.state?.attributes?.unit_of_measurement || '';

    const isOnline = state === 'connected' || state === 'online' || state === 'on';
    // Use --lcars-sky for unknown/unavailable (gray fails 4.5:1 on dark; sky passes ~9:1)
    const stateColor = isOnline
      ? 'var(--lcars-data-accent, #99cc99)'
      : (state === 'unknown' || state === 'unavailable' ? 'var(--lcars-sky, #aaaaff)' : 'var(--lcars-alert, #cc6666)');

    // article aria-label intentionally omitted — the inner data-network="hostname"
    // span carries the visible name and is the redaction target. Adding the name to
    // aria-label would leak it into the AX tree (Worf review 5.2.0-beta.1).
    return html`
      <article class="net-device" aria-labelledby="net-dev-${d.device_id}">
        <header class="net-device-head">
          <span class="net-device-name" id="net-dev-${d.device_id}" data-network="hostname">${this._maskName(d.name, 'ap')}</span>
          ${d.model ? html`<span class="net-device-model" data-network="model">${d.model}</span>` : ''}
          <span class="net-device-state" style="color:${stateColor}">${(state || 'unknown').toUpperCase()}</span>
        </header>
        <div class="net-device-grid">
          ${cpu != null ? this._tile('CPU', `${formatNumber(cpu, 0)}%`, _statusColor(cpu, THRESHOLDS.cpu), d.sensors.cpu.eid) : ''}
          ${mem != null ? this._tile('MEM', `${formatNumber(mem, 0)}%`, _statusColor(mem, THRESHOLDS.memory), d.sensors.memory.eid) : ''}
          ${temp != null ? this._tile('TEMP', `${formatNumber(temp, 0)}°C`, _statusColor(temp, THRESHOLDS.temp), d.sensors.temperature.eid) : ''}
          ${uptime ? this._tile('UPTIME', _fmtUptime(uptime), 'var(--lcars-sky, #aaaaff)', d.sensors.uptime.eid) : ''}
          ${clients != null ? this._tile('CLIENTS', formatNumber(clients, 0), 'var(--lcars-sky, #aaaaff)', d.sensors.clients.eid) : ''}
          ${linkSpeed != null ? this._tile('LINK', `${formatNumber(linkSpeed, 0)} ${linkUnit}`, 'var(--lcars-sky, #aaaaff)', d.sensors.link_speed.eid) : ''}
        </div>
      </article>`;
  }

  _tile(label, value, color, eid) {
    return html`
      <button class="net-tile" @click=${() => showMoreInfo(this, eid)} aria-label="${label} ${value}">
        <span class="net-tile-label">${label}</span>
        <span class="net-tile-value" style="color:${color}">${value}</span>
      </button>`;
  }

  // #188 — dedupe manufacturer prefix already embedded in model (e.g. EPSON IPP
  // reports model='EPSON ET-3850 Series' with manufacturer='EPSON' → was rendered
  // “EPSON EPSON ET-3850 SERIES”). Case-insensitive prefix check, retains original
  // casing from the model string.
  _formatPrinterModel(manufacturer, model) {
    if (!model) return '';
    if (!manufacturer) return model;
    const mfg = manufacturer.trim();
    if (!mfg) return model;
    const lc = model.toLowerCase();
    if (lc.startsWith(mfg.toLowerCase())) return model;
    return `${mfg} ${model}`;
  }

  _renderPrinter(p) {
    const statusVal = p.status?.state?.state || 'unknown';
    // #184 — expand status palette: HA IPP integration emits printing, idle, stopped, paused,
    // processing, server_error. Older switch collapsed everything not-idle/printing/stopped
    // to gray (“unknown”), which made paused / error states invisible to the operator.
    let statusColor;
    switch (statusVal) {
      case 'idle':
        statusColor = 'var(--lcars-data-accent, #99cc99)'; break;
      case 'printing':
      case 'processing':
        statusColor = 'var(--lcars-gold, #ffaa00)'; break;
      case 'stopped':
      case 'server_error':
      case 'error':
        statusColor = 'var(--lcars-alert, #cc6666)'; break;
      case 'paused':
        statusColor = 'var(--lcars-sunflower, #ffcc66)'; break;
      default:
        statusColor = 'var(--lcars-gray, #666688)';
    }
    const inkColor = (color) => `var(--lcars-ink-${color}, var(--lcars-gray))`;

    return html`
      <article class="net-printer" aria-labelledby="net-prn-${p.device_id}">
        <header class="net-device-head">
          <span class="net-device-name" id="net-prn-${p.device_id}" data-network="hostname">${this._maskName(p.name, 'printer')}</span>
          ${p.model ? html`<span class="net-device-model" data-network="model">${this._formatPrinterModel(p.manufacturer, p.model)}</span>` : ''}
          <span class="net-device-state" style="color:${statusColor}">${statusVal.toUpperCase()}</span>
        </header>
        <div class="net-ink-row">
          ${p.inks.map((ink) => {
            const v = Number(ink.state.state);
            const pct = isNaN(v) ? 0 : Math.max(0, Math.min(100, v));
            const display = isNaN(v) ? '—' : `${formatNumber(pct, 0)}%`;
            const isLow = !isNaN(v) && v <= THRESHOLDS.ink.warn;
            const isCrit = !isNaN(v) && v <= THRESHOLDS.ink.crit;
            const labelText = isCrit ? 'CRIT' : (isLow ? 'LOW' : '');
            return html`
              <button
                class="net-ink ${isCrit ? 'crit' : isLow ? 'low' : ''}"
                @click=${() => showMoreInfo(this, ink.eid)}
                aria-label="${ink.color} ink ${display}${labelText ? ' ' + labelText : ''}"
                title="${ink.color} ${display}"
              >
                <span class="net-ink-label">${ink.color.toUpperCase()}</span>
                <div class="net-ink-bar"><div class="net-ink-fill" style="width:${pct}%; background:${inkColor(ink.color)}"></div></div>
                <span class="net-ink-value">${display}${labelText ? html` <span class="net-ink-glyph">${labelText}</span>` : ''}</span>
              </button>`;
          })}
        </div>
      </article>`;
  }

  render() {
    if (!this._hass) {
      return html`<div class="net-loading" role="status">INITIALIZING SUBSPACE RELAY…</div>`;
    }
    const { devices, wanLatency } = this._discoverUnifi();
    const printers = this._discoverPrinters();
    const clients = this._discoverClients();
    const f = this.filter;
    const showHealth = f === FILTER_ALL || f === FILTER_HEALTH;
    const showPeripherals = f === FILTER_ALL || f === FILTER_PERIPHERALS;
    const showClients = f === FILTER_ALL || f === FILTER_CLIENTS;

    if (!devices.length && !printers.length && !wanLatency.length && !clients.length) {
      return html`<div class="net-empty" role="status">NO NETWORK INFRASTRUCTURE DETECTED · INSTALL UNIFI OR IPP INTEGRATION</div>`;
    }

    return html`
      <div class="net-root">
        ${showHealth && wanLatency.length ? this._renderWanStrip(wanLatency) : ''}
        ${showHealth && devices.length ? html`
          <section aria-labelledby="net-health-h">
            <h2 id="net-health-h" class="net-section-h">Network Health</h2>
            <div class="net-device-list">
              ${devices.map((d) => this._renderHealthDevice(d))}
            </div>
          </section>` : ''}
        ${showPeripherals && printers.length ? html`
          <section aria-labelledby="net-periph-h">
            <h2 id="net-periph-h" class="net-section-h">Equipment &amp; Peripherals</h2>
            <div class="net-printer-list">
              ${printers.map((p) => this._renderPrinter(p))}
            </div>
          </section>` : ''}
        ${showClients && clients.length ? this._renderClients(clients) : ''}
        ${showHealth && !devices.length ? html`<div class="net-empty" role="status">NO UNIFI INFRASTRUCTURE DETECTED</div>` : ''}
        ${showPeripherals && !printers.length ? html`<div class="net-empty" role="status">NO PERIPHERALS DETECTED · INSTALL IPP INTEGRATION</div>` : ''}
        ${showClients && !clients.length ? html`<div class="net-empty" role="status">NO CONNECTED CLIENTS · UNIFI DEVICE_TRACKER NOT FOUND</div>` : ''}
      </div>`;
  }

  static get styles() {
    return [
      lcarsBaseStyles,
      css`
        :host { display: block; color: var(--lcars-text, #fff); font-family: var(--lcars-font, 'Antonio', sans-serif); }
        .net-root { display: flex; flex-direction: column; gap: 0.75rem; }
        .net-loading, .net-empty { padding: 1rem; color: var(--lcars-sky, #aaaaff); text-transform: uppercase; letter-spacing: 0.05em; text-align: center; }
        .net-section-h { font-family: var(--lcars-font, 'Antonio', sans-serif); font-size: 1.25rem; color: var(--lcars-butterscotch, #ff9966); text-transform: uppercase; letter-spacing: 0.08em; margin: 0.5rem 0 0.25rem; padding: 0 0.5rem; border-left: 4px solid var(--lcars-butterscotch, #ff9966); }

        .wan-strip { display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: stretch; padding: 0.5rem; background: rgba(255,153,102,0.06); border-radius: 0.5rem; }
        .wan-label { font-size: 0.85rem; color: var(--lcars-ice, #99ccff); letter-spacing: 0.1em; align-self: center; padding: 0 0.5rem; }
        .wan-tile { background: var(--lcars-bg-elev, #111); border: 1px solid rgba(153,204,255,0.25); border-radius: 0.4rem; padding: 0.4rem 0.75rem; min-width: 7rem; min-height: 44px; display: flex; flex-direction: column; align-items: flex-start; cursor: pointer; color: inherit; font-family: inherit; }
        .wan-tile:focus-visible { outline: 2px solid var(--lcars-ice, #99ccff); outline-offset: 2px; }
        .wan-tile-label { font-size: 0.7rem; opacity: 0.8; text-transform: uppercase; letter-spacing: 0.05em; }
        .wan-tile-value { font-size: 1.25rem; font-weight: 600; }

        .net-device-list, .net-printer-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 22rem), 1fr)); gap: 0.5rem; }
        .net-device, .net-printer { background: rgba(153,204,255,0.05); border-radius: 0.5rem; padding: 0.5rem 0.75rem; border-left: 4px solid var(--lcars-ice, #99ccff); }
        .net-device-head { display: flex; flex-wrap: wrap; align-items: baseline; gap: 0.5rem; margin-bottom: 0.4rem; }
        .net-device-name { font-size: 1.1rem; color: var(--lcars-ice, #99ccff); text-transform: uppercase; letter-spacing: 0.05em; }
        .net-device-model { font-size: 0.75rem; opacity: 0.7; }
        .net-device-state { margin-left: auto; font-size: 0.85rem; letter-spacing: 0.08em; }
        .net-device-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(5rem, 1fr)); gap: 0.4rem; }
        .net-tile { background: var(--lcars-bg-elev, #111); border: 1px solid rgba(255,255,255,0.08); border-radius: 0.4rem; padding: 0.35rem 0.5rem; min-height: 44px; display: flex; flex-direction: column; align-items: flex-start; cursor: pointer; color: inherit; font-family: inherit; }
        .net-tile:focus-visible { outline: 2px solid var(--lcars-ice, #99ccff); outline-offset: 2px; }
        .net-tile-label { font-size: 0.65rem; opacity: 0.75; letter-spacing: 0.05em; }
        .net-tile-value { font-size: 1rem; font-weight: 600; }

        .net-ink-row { display: flex; flex-wrap: wrap; gap: 0.5rem; }
        .net-ink { flex: 1 1 6rem; min-width: 6rem; min-height: 44px; background: var(--lcars-bg-elev, #111); border: 1px solid rgba(255,255,255,0.08); border-radius: 0.4rem; padding: 0.4rem; display: flex; flex-direction: column; gap: 0.2rem; cursor: pointer; color: inherit; font-family: inherit; }
        .net-ink:focus-visible { outline: 2px solid var(--lcars-ice, #99ccff); outline-offset: 2px; }
        .net-ink.low { border-color: var(--lcars-gold, #ffaa00); }
        .net-ink.crit { border-color: var(--lcars-alert, #cc6666); }
        .net-ink-label { font-size: 0.65rem; letter-spacing: 0.05em; opacity: 0.85; }
        .net-ink-bar { height: 6px; background: rgba(255,255,255,0.08); border-radius: 3px; overflow: hidden; }
        .net-ink-fill { height: 100%; transition: width 400ms ease; }
        .net-ink-value { font-size: 0.95rem; font-weight: 600; display: flex; align-items: baseline; gap: 0.25rem; }
        .net-ink-glyph { font-size: 0.65rem; padding: 0 0.25rem; border-radius: 0.2rem; background: var(--lcars-gold, #ffaa00); color: #000; }
        /* CRIT glyph: keep dark text on alert background — #fff/#cc6666 fails AA (4.08:1).
           Black text on tomato (#cc6666) reaches ~5.7:1 ✓. (Geordi review beta.1) */
        .net-ink.crit .net-ink-glyph { background: var(--lcars-alert, #cc6666); color: #000; }

        @media (prefers-reduced-motion: reduce) {
          .net-ink-fill { transition: none; }
        }

        /* Connected Clients (5.2.1) */
        .clients-head { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; margin: 0.4rem 0; }
        .net-clients-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr)); gap: 0.4rem; }
        .client-tile {
          background: rgba(153,204,255,0.05);
          border: 1px solid rgba(153,204,255,0.15);
          border-radius: 0.4rem;
          padding: 0.4rem 0.6rem;
          min-height: 44px;
          display: grid;
          grid-template-columns: auto 1fr;
          grid-template-rows: auto auto;
          column-gap: 0.5rem;
          row-gap: 0.15rem;
          align-items: center;
          cursor: pointer;
          color: inherit;
          font-family: inherit;
          text-align: left;
        }
        .client-tile:focus-visible { outline: 2px solid var(--lcars-ice, #99ccff); outline-offset: 2px; }
        .client-dot { grid-row: 1 / span 2; width: 10px; height: 10px; border-radius: 50%; }
        .client-name { font-size: 0.85rem; color: var(--lcars-ice, #99ccff); letter-spacing: 0.04em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        /* #186 (Geordi review revision) — ensure the fallback chain actually lands on a
         * MONOSPACE font even when --lcars-font-mono is undefined (Antonio is
         * proportional and would destroy column alignment for MACs/SSIDs). */
        .client-mac, .client-ssid { grid-column: 2; font-size: 0.65rem; opacity: 0.7; font-family: var(--lcars-font-mono, ui-monospace, 'SF Mono', Consolas, monospace); }
      `,
    ];
  }
}

const ready = Promise.race([customElements.whenDefined('hui-masonry-view'), new Promise((r) => setTimeout(r, 5000))]);
ready.then(() => { if (!customElements.get('lcars-network-card')) { customElements.define('lcars-network-card', LcarsNetworkCard); } });
