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
]);

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
      || /^sensor\.home_assistant_core_cpu_percent$/i.test(eid) },
  { kind: 'cpu_temp',          anchor: 'port_nacelle',       unit: '°C',    label: 'CPU TMP',      tile: false, spark: true,
    match: (eid) => /processor_temperature|cpu_temperature/i.test(eid) },
  { kind: 'gpu_temp',          anchor: 'starboard_nacelle',  unit: '°C',    label: 'GPU TMP',      tile: false, spark: true,
    match: (eid) => /gpu_.*temperature/i.test(eid) },
  { kind: 'nvme_temp',         anchor: 'starboard_nacelle',  unit: '°C',    label: 'NVME TMP',     tile: false, spark: true,
    match: (eid) => /nvme.*temp|disk_.*temperature/i.test(eid) },
  // Memory: system_monitor OR hassio core memory %.
  { kind: 'memory',            anchor: 'main_computer',      unit: '%',     label: 'MEM',          tile: false, spark: true,
    match: (eid) => /memory_use_percent|mem_used_percent/i.test(eid)
      || /^sensor\.home_assistant_core_memory_percent$/i.test(eid) },
  { kind: 'swap',              anchor: null,                 unit: '%',     label: 'SWAP',         tile: true,  spark: true,
    match: (eid) => /swap_use_percent/i.test(eid) },
  // Disk: system_monitor disk_use_percent_*, glances fs_*_used_percent, OR hassio host disk_used
  // (paired with disk_total in _reduceMetrics to derive a %).
  { kind: 'disk_root',         anchor: 'engineering_hull',   unit: '%',     label: 'DISK',         tile: false, spark: true,
    match: (eid) => /^sensor\.disk_use_percent_/i.test(eid)
      || /fs_._used_percent/i.test(eid)
      || /^sensor\.home_assistant_host_disk_(used|total)$/i.test(eid) },
  { kind: 'load_15m',          anchor: 'saucer_section',     unit: '',      label: 'LOAD',         tile: false, spark: true,
    match: (eid) => /load_15m$/i.test(eid) },
  { kind: 'network_rx',        anchor: 'port_impulse',       unit: 'MB/s',  label: 'RX',           tile: false, spark: true,
    match: (eid) => /network_in_/i.test(eid) },
  { kind: 'network_tx',        anchor: 'starboard_impulse',  unit: 'MB/s',  label: 'TX',           tile: false, spark: true,
    match: (eid) => /network_out_/i.test(eid) },
  { kind: 'wan_reachable',     anchor: 'deflector',          unit: '',      label: 'WAN',          tile: false, spark: false,
    match: (eid) => /^binary_sensor\.wan_/i.test(eid) },
  // Addon running: any `binary_sensor.{name}_running` from the hassio platform. The
  // SYSTEM_PLATFORMS filter in discoverVessels (hassio/supervisor only) gates appliance
  // sensors out, so widening from `addon_`-prefixed to any `_running$` is safe.
  { kind: 'addon_running',     anchor: 'shuttlebay',         unit: '',      label: 'ADDONS',       tile: true,  spark: false,
    match: (eid) => /^binary_sensor\..*_running$/i.test(eid) },
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
  { kind: 'db_size',           anchor: null,                 unit: '',      label: 'DB SIZE',      tile: true,  spark: false },
  { kind: 'log_alerts',        anchor: null,                 unit: '',      label: 'LOG ALERTS',   tile: true,  spark: false },
  { kind: 'top_cpu_proc',      anchor: null,                 unit: '',      label: 'TOP CPU',      tile: true,  spark: false,
    match: (eid) => /^sensor\.process_/i.test(eid) },
  { kind: 'io_wait',           anchor: null,                 unit: '%',     label: 'I/O WAIT',     tile: true,  spark: false,
    match: (eid) => /cpu_iowait|io_wait/i.test(eid) },
  { kind: 'integrations',      anchor: null,                 unit: '',      label: 'INTEGRATIONS', tile: true,  spark: false },
  { kind: 'boot_time',         anchor: null,                 unit: '',      label: 'BOOT TIME',    tile: true,  spark: false },
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
  // 5.4.5 (Data review): edge labels relabeled to match true anchor position so the
  // silhouette renderer's edge-stagger algorithm has clean inputs. 6 top, 5 bottom,
  // 1 left, 1 right — symmetric distribution that resolves the 5.4.4 callout chop.
  deflector:          { x: 6,  y: 50, label: 'left'   },  // bow leading edge
  bridge:             { x: 22, y: 30, label: 'top'    },  // dorsal saucer hump
  main_computer:      { x: 22, y: 70, label: 'bottom' },  // ventral saucer
  saucer_section:     { x: 30, y: 18, label: 'top'    },  // upper saucer disc
  sensor_array:       { x: 30, y: 82, label: 'bottom' },  // lower saucer rim
  engineering_hull:   { x: 60, y: 50, label: 'top'    },  // mid hull
  warp_core:          { x: 56, y: 65, label: 'bottom' },  // ventral hull glow
  port_nacelle:       { x: 78, y: 18, label: 'top'    },  // upper (port) nacelle
  starboard_nacelle:  { x: 78, y: 82, label: 'bottom' },  // lower (starboard) nacelle
  port_impulse:       { x: 82, y: 32, label: 'top'    },  // port impulse glow
  starboard_impulse:  { x: 82, y: 68, label: 'bottom' },  // stbd impulse glow
  shuttlebay:         { x: 90, y: 50, label: 'right'  },  // aft hull bay door
  cargo_bay:          { x: 70, y: 50, label: 'top'    },  // mid-aft hull
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
  // 7-char hash, formatted like "8841-009"
  const h = fnv1a(seed);
  return `${h.slice(0, 4)}-${h.slice(4, 7)}`.toUpperCase();
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
    if (!SYSTEM_PLATFORMS.has(e.platform)) continue;
    if (e.disabled_by || e.hidden_by) continue;
    const state = states[eid];
    if (!state) continue;
    let key = 'local';
    if (e.platform === 'glances' && e.device_id) {
      key = `glances:${e.device_id}`;
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
 * Generic LCARS-styled saucer + twin-nacelle layout, ROTATED 90° so the ship
 * points forward to the LEFT (bow) with nacelles trailing to the RIGHT (aft).
 * Hand-authored, not traced from any production asset. ViewBox is 0 0 480 200.
 */
export const STARSHIP_SILHOUETTE_PATHS = svg`
  <!-- saucer section: ellipse at the bow (left third) -->
  <ellipse cx="140" cy="100" rx="110" ry="72" />
  <!-- deflector arc on the leading edge (forward of the saucer) -->
  <path d="M40 88 Q22 100 40 112" stroke-opacity="0.7" />
  <!-- inner saucer detail (sensor strip ring) -->
  <ellipse cx="140" cy="100" rx="78" ry="46" stroke-opacity="0.35" />
  <!-- bridge dome: small dorsal hump on the saucer -->
  <circle cx="108" cy="58" r="7" stroke-opacity="0.6" />
  <!-- neck / connector aft of saucer to engineering hull -->
  <path d="M236 88 L260 92 L260 108 L236 112 Z" />
  <!-- engineering hull: tapered bar running aft -->
  <path d="M260 88 L420 84 Q438 92 438 100 Q438 108 420 116 L260 112 Z" />
  <!-- warp-core indicator: horizontal channel inside the hull -->
  <line x1="272" y1="100" x2="410" y2="100" stroke-opacity="0.45" />
  <!-- shuttlebay: notch at aft tip of engineering hull -->
  <path d="M438 96 L452 96 L452 104 L438 104" stroke-opacity="0.7" />
  <!-- port pylon (upper) angled outward from mid-hull -->
  <path d="M340 84 L360 36" />
  <!-- starboard pylon (lower) -->
  <path d="M340 116 L360 164" />
  <!-- port nacelle (upper): horizontal capsule trailing aft -->
  <path d="M360 30 L432 26 L450 32 L450 40 L432 46 L360 42 Z" />
  <!-- starboard nacelle (lower) -->
  <path d="M360 158 L432 154 L450 160 L450 168 L432 174 L360 170 Z" />
  <!-- impulse engine glow indicators (aft-inner edges of nacelles) -->
  <line x1="408" y1="42" x2="398" y2="54" stroke-opacity="0.5" />
  <line x1="408" y1="158" x2="398" y2="146" stroke-opacity="0.5" />
  <!-- cargo bay marker: ventral mid-hull -->
  <circle cx="336" cy="108" r="4" stroke-opacity="0.45" />
`;
