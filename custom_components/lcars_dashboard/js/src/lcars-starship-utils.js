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
  { kind: 'cpu_usage',         anchor: 'bridge',             unit: '%',     label: 'CPU',          tile: true,  spark: true,
    match: (eid) => /^sensor\.processor_use$/i.test(eid) || /processor_use|cpu_used/i.test(eid) },
  { kind: 'cpu_temp',          anchor: 'port_nacelle',       unit: '°C',    label: 'CPU TMP',      tile: false, spark: true,
    match: (eid) => /processor_temperature|cpu_temperature/i.test(eid) },
  { kind: 'gpu_temp',          anchor: 'starboard_nacelle',  unit: '°C',    label: 'GPU TMP',      tile: false, spark: true,
    match: (eid) => /gpu_.*temperature/i.test(eid) },
  { kind: 'nvme_temp',         anchor: 'starboard_nacelle',  unit: '°C',    label: 'NVME TMP',     tile: false, spark: true,
    match: (eid) => /nvme.*temp|disk_.*temperature/i.test(eid) },
  { kind: 'memory',            anchor: 'main_computer',      unit: '%',     label: 'MEM',          tile: false, spark: true,
    match: (eid) => /memory_use_percent|mem_used_percent/i.test(eid) },
  { kind: 'swap',              anchor: null,                 unit: '%',     label: 'SWAP',         tile: true,  spark: true,
    match: (eid) => /swap_use_percent/i.test(eid) },
  { kind: 'disk_root',         anchor: 'engineering_hull',   unit: '%',     label: 'DISK',         tile: false, spark: true,
    match: (eid) => /^sensor\.disk_use_percent_/i.test(eid) || /fs_._used_percent/i.test(eid) },
  { kind: 'load_15m',          anchor: 'saucer_section',     unit: '',      label: 'LOAD',         tile: false, spark: true,
    match: (eid) => /load_15m$/i.test(eid) },
  { kind: 'network_rx',        anchor: 'port_impulse',       unit: 'MB/s',  label: 'RX',           tile: false, spark: true,
    match: (eid) => /network_in_/i.test(eid) },
  { kind: 'network_tx',        anchor: 'starboard_impulse',  unit: 'MB/s',  label: 'TX',           tile: false, spark: true,
    match: (eid) => /network_out_/i.test(eid) },
  { kind: 'wan_reachable',     anchor: 'deflector',          unit: '',      label: 'WAN',          tile: false, spark: false,
    match: (eid) => /^binary_sensor\.wan_/i.test(eid) },
  { kind: 'addon_running',     anchor: 'shuttlebay',         unit: '',      label: 'ADDONS',       tile: true,  spark: false,
    // Constrain to hassio-style addon entities only (Worf m6, Data #2). Generic
    // appliance binary_sensors with `_running` in the name MUST NOT be counted.
    match: (eid) => /^binary_sensor\.(addon_|.*_addon_running$|hassio_)/i.test(eid) },
  { kind: 'backup_age',        anchor: 'cargo_bay',          unit: '',      label: 'BACKUP',       tile: false, spark: false,
    match: (eid) => /^sensor\.backup_.*_last$|backup_state/i.test(eid) },
  { kind: 'entity_health',     anchor: 'sensor_array',       unit: '',      label: 'SENSORS',      tile: false, spark: true },
  { kind: 'composite_thermal', anchor: 'warp_core',          unit: '',      label: 'CORE',         tile: false, spark: true },
  { kind: 'uptime',            anchor: null,                 unit: '',      label: 'UPTIME',       tile: true,  spark: false,
    match: (eid) => /^sensor\.last_boot$/i.test(eid) },
  { kind: 'ha_core_version',   anchor: null,                 unit: '',      label: 'HA CORE',      tile: true,  spark: false,
    match: (eid) => /^update\.home_assistant_core_update$/i.test(eid) },
  { kind: 'db_size',           anchor: null,                 unit: '',      label: 'DB SIZE',      tile: true,  spark: false },
  { kind: 'log_alerts',        anchor: null,                 unit: '',      label: 'LOG ALERTS',   tile: true,  spark: false },
  { kind: 'top_cpu_proc',      anchor: null,                 unit: '',      label: 'TOP CPU',      tile: true,  spark: false,
    match: (eid) => /^sensor\.process_/i.test(eid) },
  { kind: 'io_wait',           anchor: null,                 unit: '%',     label: 'I/O WAIT',     tile: true,  spark: false,
    match: (eid) => /cpu_iowait|io_wait/i.test(eid) },
  { kind: 'integrations',      anchor: null,                 unit: '',      label: 'INTEGRATIONS', tile: true,  spark: false },
  { kind: 'boot_time',         anchor: null,                 unit: '',      label: 'BOOT TIME',    tile: true,  spark: false },
  { kind: 'coordinators',      anchor: null,                 unit: '',      label: 'COORDS',       tile: true,  spark: false },
];

export function classifyMetric(eid) {
  for (const c of STARSHIP_METRIC_CLASSES) {
    if (typeof c.match === 'function' && c.match(eid)) return c;
  }
  return null;
}

/* ═══ Anchor map (spec §6) ═══ */

export const STARSHIP_ANCHOR_MAP = Object.freeze({
  deflector:          { x: 50, y: 4,  label: 'top' },
  bridge:             { x: 50, y: 12, label: 'left' },
  main_computer:      { x: 50, y: 22, label: 'right' },
  saucer_section:     { x: 28, y: 22, label: 'left' },
  sensor_array:       { x: 72, y: 28, label: 'right' },
  engineering_hull:   { x: 50, y: 50, label: 'right' },
  warp_core:          { x: 50, y: 56, label: 'left' },
  port_nacelle:       { x: 22, y: 70, label: 'left' },
  starboard_nacelle:  { x: 78, y: 70, label: 'right' },
  port_impulse:       { x: 38, y: 80, label: 'left' },
  starboard_impulse:  { x: 62, y: 80, label: 'right' },
  shuttlebay:         { x: 50, y: 88, label: 'right' },
  cargo_bay:          { x: 38, y: 92, label: 'left' },
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
    default:
      return String(value);
  }
}

/* ═══ Inline silhouette paths (spec §5.7 — top-down hand-authored) ═══
 * Generic LCARS-styled saucer + twin-nacelle layout. Hand-authored, not traced
 * from any production asset. Subsystems are commented; viewBox is 0 0 200 480.
 */
export const STARSHIP_SILHOUETTE_PATHS = svg`
  <!-- saucer section: round disc at top, ~120 wide -->
  <ellipse cx="100" cy="58" rx="60" ry="42"/>
  <!-- deflector arc at the leading edge (top of saucer) -->
  <path d="M82 18 Q100 8 118 18" stroke-opacity="0.7"/>
  <!-- inner saucer detail (sensor strip) -->
  <ellipse cx="100" cy="58" rx="42" ry="26" stroke-opacity="0.35"/>
  <!-- bridge dome: small center hump -->
  <circle cx="100" cy="46" r="6" stroke-opacity="0.6"/>
  <!-- neck / connector down to engineering hull -->
  <path d="M88 92 L92 130 L108 130 L112 92 Z"/>
  <!-- engineering hull: rectangular ~70x140 below the neck -->
  <path d="M70 130 L70 290 Q70 310 90 312 L110 312 Q130 310 130 290 L130 130 Z"/>
  <!-- warp-core indicator: vertical channel inside the hull -->
  <line x1="100" y1="160" x2="100" y2="290" stroke-opacity="0.45"/>
  <!-- shuttlebay: small notch at aft of engineering hull -->
  <path d="M88 312 L88 322 L112 322 L112 312" stroke-opacity="0.7"/>
  <!-- port pylon angled outward 15° -->
  <path d="M80 230 L48 320"/>
  <!-- starboard pylon -->
  <path d="M120 230 L152 320"/>
  <!-- port nacelle: long capsule trailing aft -->
  <path d="M44 320 L26 330 L20 360 L26 388 L44 398 L48 388 L48 330 Z"/>
  <!-- starboard nacelle -->
  <path d="M156 320 L174 330 L180 360 L174 388 L156 398 L152 388 L152 330 Z"/>
  <!-- impulse engine glow indicators (inner edges of nacelles) -->
  <line x1="48" y1="350" x2="58" y2="358" stroke-opacity="0.5"/>
  <line x1="152" y1="350" x2="142" y2="358" stroke-opacity="0.5"/>
  <!-- cargo bay marker: aft offset on engineering hull -->
  <circle cx="78" cy="306" r="4" stroke-opacity="0.45"/>
`;
