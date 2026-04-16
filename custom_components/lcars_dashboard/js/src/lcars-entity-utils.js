/**
 * lcars-entity-utils.js
 *
 * Extensible panel type detection and entity classification.
 * Replaces the hardcoded _getDevicePanelType() cascade with a
 * priority-ordered registry of detector functions.
 *
 * Each detector receives the array of entity entries for a device
 * and returns a panel type string or null.
 */

// ─── Panel Type Constants ───────────────────────────────────────────────────

export const PANEL_TYPE_CAMERA      = 'camera';
export const PANEL_TYPE_ALARM       = 'alarm';
export const PANEL_TYPE_AQUATICS    = 'aquatics';
export const PANEL_TYPE_CLIMATE     = 'climate';
export const PANEL_TYPE_MEDIA       = 'media';
export const PANEL_TYPE_ENVIRONMENT = 'environment';
export const PANEL_TYPE_IRRIGATION  = 'irrigation';
export const PANEL_TYPE_WEATHER     = 'weather';
export const PANEL_TYPE_BATTERY     = 'battery';
export const PANEL_TYPE_POWER       = 'power';

// ─── Panel Render Priority (lower = rendered first in layout) ───────────────

export const PANEL_TYPE_ORDER = {
  [PANEL_TYPE_CAMERA]:      0,
  [PANEL_TYPE_ALARM]:       1,
  [PANEL_TYPE_AQUATICS]:    2,
  [PANEL_TYPE_CLIMATE]:     3,
  [PANEL_TYPE_MEDIA]:       4,
  [PANEL_TYPE_ENVIRONMENT]: 5,
  [PANEL_TYPE_IRRIGATION]:  6,
  [PANEL_TYPE_WEATHER]:     7,
  [PANEL_TYPE_BATTERY]:     8,
  [PANEL_TYPE_POWER]:       9,
};

// ─── Domain Sets ────────────────────────────────────────────────────────────

export const CAMERA_DOMAINS  = new Set(['camera']);
export const CLIMATE_DOMAINS = new Set(['climate']);
export const MEDIA_DOMAINS   = new Set(['media_player']);
export const ALARM_DOMAINS   = new Set(['alarm_control_panel']);
export const WEATHER_DOMAINS = new Set(['weather']);

export const TOGGLE_DOMAINS = new Set([
  'light', 'switch', 'fan', 'input_boolean', 'lock', 'automation', 'script',
]);
export const SENSOR_DOMAINS = new Set(['sensor', 'binary_sensor']);
export const COVER_DOMAINS  = new Set(['cover']);

// ─── Air Quality Detection ──────────────────────────────────────────────────

export const AQ_DEVICE_CLASSES = new Set([
  'carbon_dioxide', 'carbon_monoxide',
  'volatile_organic_compounds', 'volatile_organic_compounds_parts',
  'pm25', 'pm10', 'pm1', 'aqi',
]);

export const AQ_ENTITY_SUFFIX_RE = /_(air_quality|score)$/;

// ─── Pool/Spa Detection ─────────────────────────────────────────────────────

const POOL_SPA_ID_RE = /pool|spa/i;
const POOL_PRESET_MODES = new Set(['heater', 'solar', 'solar_preferred']);

function hasPoolPresets(attrs) {
  const modes = attrs?.preset_modes;
  if (!Array.isArray(modes)) return false;
  return modes.some(m => POOL_PRESET_MODES.has(m));
}

// ─── Irrigation Detection ───────────────────────────────────────────────────

function isIrrigationDevice(entries) {
  let zoneCount = 0;
  for (const e of entries) {
    if (e.domain !== 'switch') continue;
    const attrs = e.state?.attributes;
    // Rachio zones have zone_number attribute
    if (attrs?.zone_number != null) { zoneCount++; continue; }
    // Fallback: device_class outlet + entity_id contains 'zone'
    if (attrs?.device_class === 'outlet' && /zone/i.test(e.entity.entity_id)) zoneCount++;
  }
  return zoneCount >= 2;
}

// ─── Detector Registry ──────────────────────────────────────────────────────
// Priority-ordered: first match wins. More specific detectors run first.

const DETECTORS = [
  // Camera: any camera-domain entity
  (entries) => entries.some(e => CAMERA_DOMAINS.has(e.domain))
    ? PANEL_TYPE_CAMERA : null,

  // Alarm: any alarm_control_panel entity
  (entries) => entries.some(e => ALARM_DOMAINS.has(e.domain))
    ? PANEL_TYPE_ALARM : null,

  // Pool/Spa: climate entity with pool/spa in entity_id or pool-specific presets
  // MUST run before generic climate detector
  (entries) => {
    for (const e of entries) {
      if (e.domain !== 'climate') continue;
      if (POOL_SPA_ID_RE.test(e.entity.entity_id)) return PANEL_TYPE_AQUATICS;
      if (hasPoolPresets(e.state?.attributes)) return PANEL_TYPE_AQUATICS;
    }
    return null;
  },

  // Climate: any non-pool climate entity
  (entries) => entries.some(e => CLIMATE_DOMAINS.has(e.domain))
    ? PANEL_TYPE_CLIMATE : null,

  // Media: any media_player entity
  (entries) => entries.some(e => MEDIA_DOMAINS.has(e.domain))
    ? PANEL_TYPE_MEDIA : null,

  // Environment: air quality signals (≥2, or ≥1 + fan)
  (entries) => {
    let aqSignals = 0;
    let hasFan = false;
    for (const e of entries) {
      const dc = e.state?.attributes?.device_class || '';
      if (AQ_DEVICE_CLASSES.has(dc)) aqSignals++;
      if (e.domain === 'fan') hasFan = true;
      if (!dc && e.domain === 'sensor' && AQ_ENTITY_SUFFIX_RE.test(e.entity.entity_id)) {
        aqSignals++;
      }
    }
    if (aqSignals >= 2 || (aqSignals >= 1 && hasFan)) return PANEL_TYPE_ENVIRONMENT;
    return null;
  },

  // Irrigation: ≥2 zone switches
  (entries) => isIrrigationDevice(entries) ? PANEL_TYPE_IRRIGATION : null,

  // Weather: any weather-domain entity
  (entries) => entries.some(e => WEATHER_DOMAINS.has(e.domain))
    ? PANEL_TYPE_WEATHER : null,

  // Battery: battery sensor + (≥2 power sensors OR NUT UPS pattern)
  (entries) => {
    let hasBattery = false;
    let powerCount = 0;
    let hasNutSignal = false;
    for (const e of entries) {
      const attrs = e.state?.attributes;
      if (!attrs) continue;
      const dc = attrs.device_class || '';
      const unit = attrs.unit_of_measurement || '';
      if (dc === 'battery' && unit === '%') hasBattery = true;
      if (dc === 'power' && unit === 'W') powerCount++;
      // NUT UPS: has voltage sensors + load sensor but no power-class entities
      if (dc === 'voltage' && unit === 'V') hasNutSignal = true;
      const eid = e.entity?.entity_id || '';
      if (/ups[._]load|ups[._]status/i.test(eid)) hasNutSignal = true;
    }
    if (hasBattery && powerCount >= 2) return PANEL_TYPE_BATTERY;
    if (hasBattery && hasNutSignal) return PANEL_TYPE_BATTERY;
    return null;
  },

  // Power monitoring: ≥1 power/energy/voltage/current sensor, NO battery (4X-3)
  // MUST be last — lowest specificity. hasBattery gate prevents overlap with battery.
  (entries) => {
    let hasBattery = false;
    let powerSignals = 0;
    for (const e of entries) {
      const attrs = e.state?.attributes;
      if (!attrs) continue;
      const dc = attrs.device_class || '';
      const unit = attrs.unit_of_measurement || '';
      if (dc === 'battery' && unit === '%') { hasBattery = true; break; }
      if (dc === 'power' && (unit === 'W' || unit === 'kW')) powerSignals++;
      if (dc === 'energy' && (unit === 'kWh' || unit === 'Wh')) powerSignals++;
      if (dc === 'current' && unit === 'A') powerSignals++;
      if (dc === 'voltage' && unit === 'V') powerSignals++;
    }
    return (!hasBattery && powerSignals >= 1) ? PANEL_TYPE_POWER : null;
  },
];

/**
 * Detect the panel type for a device's entity group.
 * Runs detectors in priority order — first match wins.
 * @param {Array} entries - Array of { entity, domain, state } objects
 * @returns {string|null} Panel type constant or null
 */
export function classifyDevice(entries) {
  for (const detect of DETECTORS) {
    const result = detect(entries);
    if (result) return result;
  }
  return null;
}

// ─── Display Labels ─────────────────────────────────────────────────────────

export const DOMAIN_LABELS = {
  light: 'Lights', switch: 'Switches', fan: 'Fans', lock: 'Locks',
  input_boolean: 'Toggles', automation: 'Automations', script: 'Scripts',
  sensor: 'Sensors', binary_sensor: 'Binary Sensors',
  camera: 'Cameras', climate: 'Climate', cover: 'Covers',
  media_player: 'Media', button: 'Buttons', number: 'Numbers',
  select: 'Selects', input_number: 'Inputs', input_select: 'Selectors',
  input_text: 'Text Inputs', input_button: 'Buttons',
  input_datetime: 'Date/Time', scene: 'Scenes',
  device_tracker: 'Trackers', person: 'People',
  update: 'Updates', event: 'Events', conversation: 'Conversation',
  alarm_control_panel: 'Alarm', weather: 'Weather',
  remote: 'Remotes', vacuum: 'Vacuums',
};

export const DOMAIN_ORDER = {
  camera: 0, light: 1, switch: 2, climate: 3, cover: 4,
  media_player: 5, fan: 6, lock: 7, alarm_control_panel: 8,
  weather: 9, sensor: 10, binary_sensor: 11,
};
