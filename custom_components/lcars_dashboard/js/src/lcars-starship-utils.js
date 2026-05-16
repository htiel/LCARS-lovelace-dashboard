// LCARS Starship Health — utils, classifier, threshold engine, anchor map.
//
// Per LCARS-STARSHIP-HEALTH-DASHBOARD-SPEC §4-§6.
//
// Privacy posture (Worf §7):
//   - No hostnames, IPs, MACs, SSIDs, container names rendered anywhere.
//   - Vessel IDs are 7-char hashes of config-entry IDs (or 'local' for the HA host).
//   - Vessel class strings are generic ship-class names + OS+version.
//   - Top-CPU process names ARE shown (well-known software, not host identifiers).
//   - All numeric values flow through `formatMetric`; no values appear in console.*.

import { html, svg } from 'lit-html';

/* ═══ Discovery ═══ */

export const SYSTEM_PLATFORMS = new Set([
  'system_monitor',  // Core — CPU/mem/disk/load/network/swap
  'hassio',          // Core (Supervisor) — addons, host info, OS update
  'supervisor',      // Core alias for hassio
  'glances',         // HACS — cross-host telemetry, GPU+NVMe temp, SMART
  'beszel',          // Hypothetical future native HA integration (no such integration exists today).
]);

// Generic platforms (rest/template/mqtt/scrape) are NOT in SYSTEM_PLATFORMS — too broad.
// Entities from these platforms are admitted only when their entity_id matches a
// known telemetry naming prefix (currently: `beszel_`, for users bridging a Beszel Hub
// via REST sensors). Extend this set carefully — every admitted naming prefix becomes
// part of the vessel rollup and counts against per-anchor metrics.
const NAMEGATED_PLATFORMS = new Set(['rest', 'template', 'mqtt', 'scrape', 'command_line']);
const NAMEGATE_PREFIXES = [/^sensor\.beszel_/i, /^binary_sensor\.beszel_/i];

export const STARSHIP_STATUS = Object.freeze({
  NOMINAL: 'NOMINAL',
  DEGRADED: 'DEGRADED',
  WARNING: 'WARNING',
  CRITICAL: 'CRITICAL',
  OFFLINE: 'OFFLINE',
});

const STATUS_PRECEDENCE = ['OFFLINE', 'CRITICAL', 'WARNING', 'DEGRADED', 'NOMINAL'];

export function rollupStarshipStatus(statuses) {
  if (!statuses || !statuses.length) return STARSHIP_STATUS.NOMINAL;
  for (const s of STATUS_PRECEDENCE) if (statuses.includes(s)) return s;
  return STARSHIP_STATUS.NOMINAL;
}

/* ═══ Metric classifier (spec §4.3) ═══ */

export const STARSHIP_METRIC_CLASSES = [
  // CPU usage: system_monitor (`processor_use`) OR hassio core (`home_assistant_core_cpu_percent`).
  // Hassio supervisor / addon CPU sensors are intentionally NOT mapped to the bridge anchor;
  // they roll up via the per-addon tile path so the headline CPU metric stays HA-core-only.
  { kind: 'cpu_usage',         anchor: 'bridge',             unit: '%',     label: 'CPU',          tile: true,  spark: true,
    match: (eid) => /^sensor\.processor_use$/i.test(eid)
      || /processor_use|cpu_used/i.test(eid)
      || /^sensor\.home_assistant_core_cpu_percent$/i.test(eid)
      || /^sensor\.beszel_.*_cpu(_pct|_percent|_usage)?$/i.test(eid) },
  { kind: 'cpu_temp',          anchor: 'port_nacelle',       unit: '°C',    label: 'CPU TMP',      tile: false, spark: true,
    match: (eid) => /processor_temperature|cpu_temperature/i.test(eid)
      || /^sensor\.beszel_.*_(cpu_)?temp(erature)?$/i.test(eid) },
  { kind: 'gpu_temp',          anchor: 'starboard_nacelle',  unit: '°C',    label: 'GPU TMP',      tile: false, spark: true,
    match: (eid) => /gpu_.*temperature/i.test(eid)
      || /^sensor\.beszel_.*_gpu_temp(erature)?$/i.test(eid) },
  { kind: 'nvme_temp',         anchor: 'starboard_nacelle',  unit: '°C',    label: 'NVME TMP',     tile: false, spark: true,
    match: (eid) => /nvme.*temp|disk_.*temperature/i.test(eid)
      || /^sensor\.beszel_.*_(nvme|disk)_temp(erature)?$/i.test(eid) },
  // Memory: system_monitor OR hassio core memory %.
  { kind: 'memory',            anchor: 'main_computer',      unit: '%',     label: 'MEM',          tile: false, spark: true,
    match: (eid) => /memory_use_percent|mem_used_percent/i.test(eid)
      || /^sensor\.home_assistant_core_memory_percent$/i.test(eid)
      || /^sensor\.beszel_.*_(mem|memory)(_pct|_percent|_usage)?$/i.test(eid) },
  { kind: 'swap',              anchor: null,                 unit: '%',     label: 'SWAP',         tile: true,  spark: true,
    match: (eid) => /swap_use_percent/i.test(eid)
      || /^sensor\.beszel_.*_swap(_pct|_percent|_usage)?$/i.test(eid) },
  // Disk: system_monitor disk_use_percent_*, glances fs_*_used_percent, OR hassio host disk_used
  // (paired with disk_total in _reduceMetrics to derive a %).
  { kind: 'disk_root',         anchor: 'engineering_hull',   unit: '%',     label: 'DISK',         tile: false, spark: true,
    match: (eid) => /^sensor\.disk_use_percent_/i.test(eid)
      || /fs_._used_percent/i.test(eid)
      || /^sensor\.home_assistant_host_disk_(used|total)$/i.test(eid)
      || /^sensor\.beszel_.*_disk(_pct|_percent|_usage|_used_percent)?$/i.test(eid) },
  { kind: 'load_15m',          anchor: 'saucer_section',     unit: '',      label: 'LOAD',         tile: false, spark: true,
    match: (eid) => /load_15m$/i.test(eid)
      || /^sensor\.beszel_.*_load(_15m?|_avg)?$/i.test(eid) },
  { kind: 'network_rx',        anchor: 'port_impulse',       unit: 'MB/s',  label: 'RX',           tile: false, spark: true,
    match: (eid) => /network_in_/i.test(eid)
      || /^sensor\.beszel_.*_(net|network)_in$/i.test(eid)
      || /^sensor\.beszel_.*_rx$/i.test(eid) },
  { kind: 'network_tx',        anchor: 'starboard_impulse',  unit: 'MB/s',  label: 'TX',           tile: false, spark: true,
    match: (eid) => /network_out_/i.test(eid)
      || /^sensor\.beszel_.*_(net|network)_out$/i.test(eid)
      || /^sensor\.beszel_.*_tx$/i.test(eid) },
  { kind: 'wan_reachable',     anchor: 'deflector',          unit: '',      label: 'WAN',          tile: false, spark: false,
    match: (eid) => /^binary_sensor\.wan_/i.test(eid) },
  // Addon running: any `binary_sensor.{name}_running` from the hassio platform. The
  // SYSTEM_PLATFORMS filter in discoverVessels (hassio/supervisor only) gates appliance
  // sensors out, so widening from `addon_`-prefixed to any `_running$` is safe.
  { kind: 'addon_running',     anchor: 'shuttlebay',         unit: '',      label: 'ADDONS',       tile: true,  spark: false,
    match: (eid) => /^binary_sensor\..*_running$/i.test(eid) },
  // Beszel Docker/Podman container running state — shares the shuttlebay rollup.
  // Beszel agents commonly expose `binary_sensor.beszel_<system>_<container>_running`
  // or `sensor.beszel_<system>_containers_running` (count).
  { kind: 'container_health',  anchor: null,                 unit: '',      label: 'CONTAINERS',   tile: true,  spark: false,
    match: (eid) => /^binary_sensor\.beszel_.*_(container|docker)_.*_running$/i.test(eid)
      || /^sensor\.beszel_.*_(containers|docker)_(running|count|total)$/i.test(eid) },
  { kind: 'backup_age',        anchor: 'cargo_bay',          unit: '',      label: 'BACKUP',       tile: false, spark: false,
    match: (eid) => /^sensor\.backup_.*_last$|backup_state/i.test(eid) },
  { kind: 'entity_health',     anchor: 'sensor_array',       unit: '',      label: 'SENSORS',      tile: false, spark: true },
  { kind: 'composite_thermal', anchor: 'warp_core',          unit: '',      label: 'CORE',         tile: false, spark: true },
  { kind: 'uptime',            anchor: null,                 unit: '',      label: 'UPTIME',       tile: true,  spark: false,
    match: (eid) => /^sensor\.last_boot$/i.test(eid) },
  // HA Core version: prefer the dedicated OS Version sensor when present (always-fresh
  // string), fall back to the update entity (which carries installed_version on its attrs).
  { kind: 'ha_core_version',   anchor: null,                 unit: '',      label: 'HA CORE',      tile: true,  spark: false,
    match: (eid) => /^update\.home_assistant_core_update$/i.test(eid)
      || /^sensor\.home_assistant_operating_system_version$/i.test(eid) },
  { kind: 'db_size',           anchor: null,                 unit: '',      label: 'DB SIZE',      tile: true,  spark: false,
    match: (eid) => /^sensor\.(recorder_)?database_size$/i.test(eid)
      || /^sensor\.recorder_.*size$/i.test(eid) },
  { kind: 'log_alerts',        anchor: null,                 unit: '',      label: 'LOG ALERTS',   tile: true,  spark: false,
    match: (eid) => /^sensor\.system_log/i.test(eid)
      || /^sensor\.log_alerts_24h$/i.test(eid) },
  { kind: 'top_cpu_proc',      anchor: null,                 unit: '',      label: 'TOP CPU',      tile: true,  spark: false,
    match: (eid) => /^sensor\.process_/i.test(eid) },
  { kind: 'io_wait',           anchor: null,                 unit: '%',     label: 'I/O WAIT',     tile: true,  spark: false,
    match: (eid) => /cpu_iowait|io_wait/i.test(eid)
      || /^sensor\.beszel_.*_iowait$/i.test(eid) },
  { kind: 'integrations',      anchor: null,                 unit: '',      label: 'INTEGRATIONS', tile: true,  spark: false },
  // boot_time = formatted timestamp ("today 06:30"); same source as uptime but rendered differently.
  { kind: 'boot_time',         anchor: null,                 unit: '',      label: 'BOOT TIME',    tile: true,  spark: false,
    match: (eid) => /^sensor\.last_boot$/i.test(eid) },
  { kind: 'coordinators',      anchor: null,                 unit: '',      label: 'COORDS',       tile: true,  spark: false },
  // Pending update count: counts addon `update.*` entities whose state === 'on'.
  { kind: 'updates_pending',   anchor: null,                 unit: '',      label: 'UPDATES',      tile: true,  spark: false,
    match: (eid) => /^update\./i.test(eid) },
];

export function classifyMetric(eid) {
  for (const c of STARSHIP_METRIC_CLASSES) {
    if (typeof c.match === 'function' && c.match(eid)) return c;
  }
  return null;
}

/* ═══ Anchor map (spec §6) ═══ */

export const STARSHIP_ANCHOR_MAP = Object.freeze({
  // Anchors are percentages of the landscape viewBox (480 × 200).
  // Forward (saucer) is on the LEFT; aft (nacelles + shuttlebay) is on the RIGHT.
  // 5.13.2-beta.2 (Captain visual redesign): full respread to eliminate the
  // right-side pile-up (CPU TMRX over BACKUP, NVME TMRX clipped, SENSORS over MEM).
  // Each edge now has 4–5 anchors with sufficient x-spread that the silhouette's
  // pairwise-collision algorithm leaves them at their preferred positions.
  //
  // Edge distribution:
  //   left  (1): deflector
  //   right (1): shuttlebay
  //   top   (5): saucer_section, bridge, engineering_hull, port_impulse, port_nacelle
  //   bottom (5): sensor_array, main_computer, warp_core, starboard_impulse, starboard_nacelle
  //   cargo_bay is bottom (between warp_core and starboard_impulse)
  //
  // The dot's (x,y) terminates on the body landmark; the label position is
  // determined by `label` edge. Y values are kept inside the silhouette body
  // so leader length stays short.
  deflector:          { x: 35, y: 50, label: 'left'   },  // bow leading edge (saucer fore-rim)
  saucer_section:     { x: 12, y: 30, label: 'top'    },  // upper saucer disc, far-forward
  bridge:             { x: 27, y: 30, label: 'top'    },  // dorsal saucer hump
  engineering_hull:   { x: 50, y: 35, label: 'top'    },  // mid hull, dorsal
  port_impulse:       { x: 68, y: 35, label: 'top'    },  // port impulse (mid-pylon junction)
  port_nacelle:       { x: 85, y: 12, label: 'top'    },  // port nacelle, dorsal-aft
  sensor_array:       { x: 12, y: 70, label: 'bottom' },  // lower saucer rim, far-forward
  main_computer:      { x: 27, y: 70, label: 'bottom' },  // ventral saucer
  warp_core:          { x: 50, y: 65, label: 'bottom' },  // ventral hull glow
  cargo_bay:          { x: 62, y: 65, label: 'bottom' },  // mid-aft hull
  starboard_impulse:  { x: 72, y: 65, label: 'bottom' },  // stbd impulse glow
  starboard_nacelle:  { x: 85, y: 88, label: 'bottom' },  // stbd nacelle, ventral-aft
  shuttlebay:         { x: 96, y: 50, label: 'right'  },  // aft hull bay door
});

/* ═══ Default thresholds (spec §5.6) ═══ */

export const STARSHIP_THRESHOLDS = Object.freeze({
  cpu_usage:        { degraded: 60, warning: 76, critical: 85 },
  cpu_temp:         { degraded: 60, warning: 71, critical: 80 },
  gpu_temp:         { degraded: 55, warning: 66, critical: 75 },
  nvme_temp:        { degraded: 55, warning: 66, critical: 75 },
  memory:           { degraded: 70, warning: 81, critical: 90 },
  swap:             { degraded: 5,  warning: 26, critical: 50 },
  disk_root:        { degraded: 75, warning: 86, critical: 92 },
  io_wait:          { degraded: 2,  warning: 6,  critical: 15 },
  // load_15m is normalized to core count (computed inline in card).
  load_15m_norm:    { degraded: 0.7, warning: 1.0, critical: 1.5 },
  // composite_thermal is a 0-100 score; lower is worse.
  composite_thermal:{ degradedBelow: 80, warningBelow: 60, criticalBelow: 40 },
  // entity_health is "count unavailable" — higher is worse.
  entity_health:    { degraded: 5, warning: 16, critical: 30 },
  // backup_age in days
  backup_age_days:  { degraded: 2, warning: 8, critical: 14 },
  // addon_running counts STOPPED add-ons
  addon_stopped:    { degraded: 1, warning: 2, critical: 4 },
});

export function computeStarshipStatus(kind, value) {
  if (value == null || (typeof value === 'number' && isNaN(value))) {
    return STARSHIP_STATUS.OFFLINE;
  }
  const t = STARSHIP_THRESHOLDS[kind];
  if (!t) return STARSHIP_STATUS.NOMINAL;
  if (kind === 'composite_thermal') {
    if (value < t.criticalBelow) return STARSHIP_STATUS.CRITICAL;
    if (value < t.warningBelow)  return STARSHIP_STATUS.WARNING;
    if (value < t.degradedBelow) return STARSHIP_STATUS.DEGRADED;
    return STARSHIP_STATUS.NOMINAL;
  }
  if (kind === 'wan_reachable') {
    return value === 'on' || value === true || value === 'connected'
      ? STARSHIP_STATUS.NOMINAL : STARSHIP_STATUS.CRITICAL;
  }
  if (value >= t.critical) return STARSHIP_STATUS.CRITICAL;
  if (value >= t.warning)  return STARSHIP_STATUS.WARNING;
  if (value >= t.degraded) return STARSHIP_STATUS.DEGRADED;
  return STARSHIP_STATUS.NOMINAL;
}

/* ═══ Vessel discovery (spec §4.5) ═══ */

const VESSEL_CLASSES = ['INTREPID', 'GALAXY', 'MIRANDA', 'NOVA', 'DEFIANT', 'OBERTH'];

function fnv1a(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0).toString(16).padStart(8, '0');
}

export function vesselIdFor(seed) {
  if (!seed || seed === 'local') return 'VESSEL-LOCAL';
  // #219 (5.5.8) \u2014 was a 7-char fnv1a hash; per Captain's directive, render the
  // full vessel key (typically "glances:<device_id>") so operators see the real
  // identifier in normal operation. Screenshot tool can still redact via the
  // data-starship="op" attribute on the rendered span.
  return `VESSEL-${String(seed).toUpperCase()}`;
}

export function vesselClassFor(seed, osLabel) {
  const h = fnv1a(seed || 'local');
  const idx = parseInt(h.slice(0, 2), 16) % VESSEL_CLASSES.length;
  const klass = VESSEL_CLASSES[idx];
  return osLabel ? `${klass}-class · ${osLabel}` : `${klass}-class`;
}

/**
 * Discover vessels from hass. Default: a single 'local' vessel that owns every
 * SYSTEM_PLATFORMS entity. Multi-host: each glances config entry becomes its own
 * vessel keyed off the device_id.
 */
export function discoverVessels(hass) {
  if (!hass) return [];
  const states = hass.states || {};
  const entities = hass.entities || {};
  const devices = hass.devices || {};
  const byVessel = new Map();

  const ensure = (key, label) => {
    if (!byVessel.has(key)) {
      byVessel.set(key, { key, vesselId: vesselIdFor(key), entities: [], osLabel: '', deviceLabel: label || '' });
    }
    return byVessel.get(key);
  };

  for (const [eid, e] of Object.entries(entities)) {
    const isSystem = SYSTEM_PLATFORMS.has(e.platform);
    const isNameGated = NAMEGATED_PLATFORMS.has(e.platform)
      && NAMEGATE_PREFIXES.some((rx) => rx.test(eid));
    if (!isSystem && !isNameGated) continue;
    if (e.disabled_by || e.hidden_by) continue;
    const state = states[eid];
    if (!state) continue;
    let key = 'local';
    if (e.platform === 'glances' && e.device_id) {
      key = `glances:${e.device_id}`;
    } else if (e.platform === 'beszel' && e.device_id) {
      key = `beszel:${e.device_id}`;
    } else if (isNameGated) {
      // Beszel REST-bridge entities don't carry a device_id; group them all under
      // a single synthetic 'beszel-hub' vessel so they don't pollute the local rollup.
      key = 'beszel-hub';
    }
    const dev = devices[e.device_id || ''] || {};
    const v = ensure(key, dev.model || '');
    v.entities.push({ eid, entity: e, state });
  }

  // OS label from update entity if present (spec §5.1)
  for (const v of byVessel.values()) {
    const osEntity = v.entities.find((e) => /home_assistant_operating_system_update/i.test(e.eid));
    if (osEntity) {
      const ver = osEntity.state.attributes?.installed_version || '';
      v.osLabel = ver ? `HA OS ${ver}` : 'HA OS';
    } else if (v.key === 'local') {
      v.osLabel = 'Home Assistant';
    } else {
      v.osLabel = v.deviceLabel || 'Unknown OS';
    }
    v.vesselClass = vesselClassFor(v.key, v.osLabel);
  }

  // Deterministic order: local first, then by vesselId
  return [...byVessel.values()].sort((a, b) => {
    if (a.key === 'local') return -1;
    if (b.key === 'local') return 1;
    return a.vesselId.localeCompare(b.vesselId);
  });
}

/* ═══ Decorative numerics (header chrome) ═══ */

export function decorativeNumerics(seed, cols = 3, rows = 6) {
  const h = fnv1a(seed || 'local');
  const out = [];
  for (let c = 0; c < cols; c++) {
    let s = '';
    for (let r = 0; r < rows; r++) {
      const idx = (c * rows + r) * 2;
      const part = parseInt(h.slice(idx % h.length, (idx % h.length) + 2) || '00', 16);
      s += String(1000 + (part * 37) % 9000).padStart(4, '0') + '\n';
    }
    out.push(s);
  }
  return out;
}

/* ═══ Format helpers ═══ */

export function formatMetric(kind, value, opts = {}) {
  if (value == null || (typeof value === 'number' && isNaN(value))) return '—';
  switch (kind) {
    case 'cpu_usage':
    case 'memory':
    case 'swap':
    case 'disk_root':
    case 'io_wait':
      return `${Math.round(value)} %`;
    case 'cpu_temp':
    case 'gpu_temp':
    case 'nvme_temp':
      return `${Math.round(value)} °C`;
    case 'load_15m':
      return opts.cores ? `${(+value).toFixed(2)} / ${opts.cores}c` : `${(+value).toFixed(2)}`;
    case 'network_rx':
    case 'network_tx':
      return `${(+value).toFixed(1)} MB/s`;
    case 'wan_reachable':
      return (value === 'on' || value === true || value === 'connected') ? 'UP' : 'DOWN';
    case 'composite_thermal':
      return `${Math.round(value)} / 100`;
    case 'uptime': {
      const ms = Date.now() - Date.parse(value);
      const days = Math.floor(ms / 86400000);
      const hours = Math.floor((ms % 86400000) / 3600000);
      return `${days}d ${hours}h`;
    }
    case 'updates_pending':
      // value = pending count, opts.total = total update entities considered
      return opts.total != null ? `${value} / ${opts.total}` : `${value}`;
    case 'addon_running':
      // value = stopped count, opts.total = total addons
      return opts.total != null ? `${opts.total - value} / ${opts.total}` : `${value}`;
    case 'ha_core_version':
      return String(value);
    default:
      return String(value);
  }
}

/* ═══ Inline silhouette paths (spec §5.7 — top-down LANDSCAPE) ═══
 * Galaxy-class proportions, top-down view (bow LEFT, stern RIGHT).
 * Real Galaxy-class dimensions used as design reference: 642m length, 466m beam,
 * 503m nacelle length. ViewBox 0 0 480 200 mapped so 1 unit ≈ 1.34m fore-aft.
 *
 * Layout:
 *   - Saucer disc: large near-circular ellipse, forward third
 *   - Neck: narrow connector between saucer-aft and engineering hull
 *   - Engineering (secondary) hull: tapered oblong amidships
 *   - Pylons: angled outboard from engineering hull
 *   - Nacelles: long parallel tubes flanking aft, mounted above + below
 *   - Bussard collectors: forward tip of each nacelle (warp coil glow)
 *   - Deflector: arc forward of secondary hull (visible through saucer rear)
 *   - Shuttlebay: aft notch at engineering hull tip
 */
export const STARSHIP_SILHOUETTE_PATHS = svg`
  <!-- Saucer disc: forward third, near-circular -->
  <ellipse cx="128" cy="100" rx="96" ry="82" />
  <!-- Sensor strip ring on saucer dorsal surface -->
  <ellipse cx="128" cy="100" rx="72" ry="58" stroke-opacity="0.32" />
  <!-- Inner cabin band -->
  <ellipse cx="128" cy="100" rx="40" ry="30" stroke-opacity="0.22" />
  <!-- Bridge dome: small dorsal hump on saucer center -->
  <circle cx="128" cy="100" r="8" stroke-opacity="0.6" />
  <!-- Neck: short trapezoid connecting saucer-aft to engineering hull -->
  <path d="M218 90 L240 86 L240 114 L218 110 Z" />
  <!-- Engineering (secondary) hull: tapered oblong amidships -->
  <path d="M240 84 L400 80 Q422 88 422 100 Q422 112 400 120 L240 116 Z" />
  <!-- Warp core: longitudinal channel inside engineering hull -->
  <line x1="250" y1="100" x2="410" y2="100" stroke-opacity="0.5" />
  <!-- Shuttlebay: aft notch at engineering hull tip -->
  <path d="M422 96 L438 96 L438 104 L422 104" stroke-opacity="0.7" />
  <!-- Cargo bay marker: ventral mid-aft hull -->
  <circle cx="300" cy="108" r="3" stroke-opacity="0.5" />
  <!-- Deflector dish: forward arc of secondary hull (visible aft of saucer) -->
  <path d="M238 92 Q230 100 238 108" stroke-opacity="0.7" />
  <!-- Impulse engines: trailing edge of saucer, dorsal + ventral -->
  <line x1="218" y1="94" x2="212" y2="90" stroke-opacity="0.55" />
  <line x1="218" y1="106" x2="212" y2="110" stroke-opacity="0.55" />
  <!-- Port pylon (upper): angled outboard from engineering hull amidships -->
  <path d="M286 82 L316 32" stroke-width="2.5" />
  <path d="M298 82 L328 32" stroke-opacity="0.5" />
  <!-- Starboard pylon (lower): mirror -->
  <path d="M286 118 L316 168" stroke-width="2.5" />
  <path d="M298 118 L328 168" stroke-opacity="0.5" />
  <!-- Port nacelle (upper): parallel tube extending aft, mounted above engineering plane -->
  <path d="M308 24 L450 22 Q464 26 464 32 L464 36 Q464 42 450 46 L308 44 Q302 40 302 34 Q302 28 308 24 Z" />
  <!-- Starboard nacelle (lower): mirror -->
  <path d="M308 156 L450 154 Q464 158 464 164 L464 168 Q464 174 450 178 L308 176 Q302 172 302 166 Q302 160 308 156 Z" />
  <!-- Bussard collectors: red glow at fore-tip of each nacelle -->
  <circle cx="310" cy="34" r="4" stroke-opacity="0.85" />
  <circle cx="310" cy="166" r="4" stroke-opacity="0.85" />
  <!-- Nacelle cap glow: aft-tip impulse-like markers -->
  <line x1="456" y1="30" x2="460" y2="38" stroke-opacity="0.55" />
  <line x1="456" y1="170" x2="460" y2="162" stroke-opacity="0.55" />
  <!-- Warp coil detail lines on each nacelle (longitudinal subdivisions) -->
  <line x1="325" y1="34" x2="450" y2="32" stroke-opacity="0.3" />
  <line x1="325" y1="166" x2="450" y2="168" stroke-opacity="0.3" />
`;
