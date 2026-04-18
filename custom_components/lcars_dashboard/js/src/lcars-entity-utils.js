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

// Area-level composite panel types (4X-17)
export const PANEL_TYPE_LIFE_SUPPORT  = 'life_support';
export const PANEL_TYPE_ILLUMINATION  = 'illumination';
export const PANEL_TYPE_TACTICAL      = 'tactical'; // 4X-42: subsumes PANEL_TYPE_ALARM
export const PANEL_TYPE_VIEWPORT      = 'viewport'; // 4X-41: blinds/shades/covers
export const PANEL_TYPE_HAZARD        = 'hazard'; // 4X-39: smoke/CO/heat detectors
export const PANEL_TYPE_GALLEY        = 'galley'; // 4X-40: smart appliances

// ─── Panel Column Assignments ───────────────────────────────────────────────
// 'left' = renders alongside entity groups; 'right' = opposite column

export const PANEL_COLUMN = {
  [PANEL_TYPE_ILLUMINATION]: 'left',
  [PANEL_TYPE_CLIMATE]:      'left',
  [PANEL_TYPE_LIFE_SUPPORT]: 'left',
  [PANEL_TYPE_ENVIRONMENT]:  'left',
  [PANEL_TYPE_POWER]:        'left',
  [PANEL_TYPE_ALARM]:        'right',
  [PANEL_TYPE_TACTICAL]:      'right', // 4X-42: same column as alarm (mutual exclusion)
  [PANEL_TYPE_CAMERA]:       'right',
  [PANEL_TYPE_BATTERY]:      'right',
  [PANEL_TYPE_IRRIGATION]:   'right',
  [PANEL_TYPE_MEDIA]:        'right',
  [PANEL_TYPE_AQUATICS]:     'right',
  [PANEL_TYPE_WEATHER]:      'right',
  [PANEL_TYPE_VIEWPORT]:     'left', // 4X-41: blinds near illumination
  [PANEL_TYPE_GALLEY]:        'left', // 4X-40: appliances
  [PANEL_TYPE_HAZARD]:        'right', // 4X-39: safety alerts
};

// ─── Panel Render Priority (lower = rendered first within its column) ───────

export const PANEL_TYPE_ORDER = {
  // Left column: illumination above entities, rest below
  [PANEL_TYPE_ILLUMINATION]: 0,
  [PANEL_TYPE_CLIMATE]:      2,
  [PANEL_TYPE_LIFE_SUPPORT]: 3,
  [PANEL_TYPE_ENVIRONMENT]:  4,
  [PANEL_TYPE_VIEWPORT]:     4.5, // 4X-41: between environment and power
  [PANEL_TYPE_GALLEY]:        4.7, // 4X-40: near power
  [PANEL_TYPE_POWER]:        5,
  // Right column
  [PANEL_TYPE_ALARM]:        0, // subsumed by tactical when both present
  [PANEL_TYPE_TACTICAL]:     0, // 4X-42: replaces alarm at priority 0 (mutual exclusion)
  [PANEL_TYPE_CAMERA]:       1,
  [PANEL_TYPE_BATTERY]:      2,
  [PANEL_TYPE_IRRIGATION]:   3,
  [PANEL_TYPE_MEDIA]:        4,
  [PANEL_TYPE_AQUATICS]:     5,
  [PANEL_TYPE_WEATHER]:      6,
  [PANEL_TYPE_HAZARD]:       7, // 4X-39: after weather
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
// Known pool/spa integration platforms (4X-37)
const POOL_SPA_PLATFORMS = new Set([
  'screenlogic', 'iaqualink', 'poolmath', 'waterguru', 'pentair',
]);

function hasPoolPresets(attrs) {
  const modes = attrs?.preset_modes;
  if (!Array.isArray(modes)) return false;
  return modes.some(m => POOL_PRESET_MODES.has(m));
}

// ─── Weather Detection ──────────────────────────────────────────────────────
// Known weather station platforms (4X-36)
const WEATHER_PLATFORMS = new Set([
  'weatherflow', 'weatherlink', 'met', 'openweathermap', 'accuweather',
  'ecobee', 'environment_canada', 'nws', 'pirateweather',
]);
// Weather sensor device classes
const WEATHER_SENSOR_CLASSES = new Set([
  'wind_speed', 'wind_direction', 'precipitation', 'precipitation_intensity',
  'pressure', 'irradiance',
]);

// ─── Hazard Detection ───────────────────────────────────────────────────────
// Safety-critical device classes (4X-39)
const HAZARD_STATUS_CLASSES = new Set(['smoke', 'gas', 'carbon_monoxide', 'heat', 'safety']);

// ─── Galley/Appliance Detection ─────────────────────────────────────────────
// Known appliance platforms (4X-40)
const GALLEY_PLATFORMS = new Set(['ge_home', 'smartthinq_sensors']);

// ─── Irrigation Detection ───────────────────────────────────────────────────

// Known irrigation integration platforms
const IRRIGATION_PLATFORMS = new Set([
  'rachio', 'rainbird', 'rainmachine', 'opensprinkler', 'hydrawise', 'hunter',
]);

function isIrrigationDevice(entries) {
  // Platform/integration check — most reliable for known controllers
  if (entries.some(e => IRRIGATION_PLATFORMS.has(e.entity?.platform))) return true;

  let zoneCount = 0;
  let hasRainSensor = false;
  let switchCount = 0;
  for (const e of entries) {
    if (e.domain === 'binary_sensor') {
      const eid = e.entity?.entity_id || '';
      if (/rain/i.test(eid)) hasRainSensor = true;
    }
    if (e.domain !== 'switch') continue;
    switchCount++;
    const attrs = e.state?.attributes;
    // Rachio zones have zone_number attribute
    if (attrs?.zone_number != null) { zoneCount++; continue; }
    // Fallback: device_class outlet + entity_id contains 'zone'
    if (attrs?.device_class === 'outlet' && /zone/i.test(e.entity.entity_id)) zoneCount++;
  }
  if (zoneCount >= 2) return true;
  // Heuristic: many switches + rain sensor → irrigation controller
  if (switchCount >= 5 && hasRainSensor) return true;
  return false;
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

  // Hazard Detection: nest_protect platform OR ≥1 smoke/CO/heat binary sensor (4X-39)
  (entries) => {
    if (entries.some(e => e.entity?.platform === 'nest_protect')) return PANEL_TYPE_HAZARD;
    const hazardCount = entries.filter(e =>
      e.domain === 'binary_sensor' && HAZARD_STATUS_CLASSES.has(e.state?.attributes?.device_class || '')
    ).length;
    if (hazardCount >= 1) return PANEL_TYPE_HAZARD;
    return null;
  },

  // Galley Systems: ge_home or smartthinq_sensors platform (4X-40)
  (entries) => {
    if (entries.some(e => GALLEY_PLATFORMS.has(e.entity?.platform))) return PANEL_TYPE_GALLEY;
    return null;
  },

  // Pool/Spa: climate entity with pool/spa in entity_id, pool-specific presets, OR known platform
  // MUST run before generic climate detector
  (entries) => {
    // Platform check first — most reliable (4X-37)
    if (entries.some(e => POOL_SPA_PLATFORMS.has(e.entity?.platform))) return PANEL_TYPE_AQUATICS;
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

  // Weather: any weather-domain entity OR known weather platform OR ≥2 weather sensor classes (4X-36)
  (entries) => {
    if (entries.some(e => WEATHER_DOMAINS.has(e.domain))) return PANEL_TYPE_WEATHER;
    if (entries.some(e => WEATHER_PLATFORMS.has(e.entity?.platform))) return PANEL_TYPE_WEATHER;
    let weatherSignals = 0;
    for (const e of entries) {
      const dc = e.state?.attributes?.device_class || '';
      if (WEATHER_SENSOR_CLASSES.has(dc)) weatherSignals++;
    }
    if (weatherSignals >= 2) return PANEL_TYPE_WEATHER;
    return null;
  },

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

// ─── Filter Predicates (4X-18) ──────────────────────────────────────────────

/**
 * Create a domain filter predicate.
 * @param {string[]|Set<string>} domains
 * @returns {(entry) => boolean}
 */
export function createDomainFilter(domains) {
  const s = domains instanceof Set ? domains : new Set(domains);
  return (entry) => s.has(entry.domain);
}

/**
 * Create a device_class filter predicate.
 * @param {string[]|Set<string>} classes
 * @returns {(entry) => boolean}
 */
export function createDeviceClassFilter(classes) {
  const s = classes instanceof Set ? classes : new Set(classes);
  return (entry) => s.has(entry.state?.attributes?.device_class || '');
}

/**
 * Compose multiple predicates with OR logic.
 * @param  {...Function} predicates
 * @returns {(entry) => boolean}
 */
export function createCompositeFilter(...predicates) {
  return (entry) => predicates.some(p => p(entry));
}

/** Named predicate: is this a climate/HVAC entity? */
export function isClimateEntity(entry) {
  return CLIMATE_DOMAINS.has(entry.domain);
}

/** Named predicate: is this an air quality / environment entity? */
export function isEnvironmentEntity(entry) {
  const dc = entry.state?.attributes?.device_class || '';
  if (AQ_DEVICE_CLASSES.has(dc)) return true;
  // Only fans with no device_class (air purifier fans) — ceiling/exhaust fans are not environment
  if (entry.domain === 'fan' && !dc) return true;
  if (entry.domain === 'sensor' && AQ_ENTITY_SUFFIX_RE.test(entry.entity?.entity_id || '')) return true;
  return false;
}

// ─── Infrastructure LED Detection ───────────────────────────────────────────

const INFRA_LED_PLATFORMS = new Set(['unifi']);

/**
 * Detect infrastructure/indicator LEDs that are NOT room lighting.
 * UniFi AP LEDs, ESPHome status panels, tplink plug LED indicators, etc.
 */
function isInfrastructureLED(entry) {
  if (entry.domain !== 'light') return false;
  if (INFRA_LED_PLATFORMS.has(entry.entity?.platform)) return true;
  const eid = entry.entity?.entity_id || '';
  if (/led_indicator|status_led|status_panel|status_light/.test(eid)) return true;
  const name = (entry.state?.attributes?.friendly_name || '').toLowerCase();
  if (/\bindicator\b|\bstatus\s*(led|light|panel)\b/.test(name)) return true;
  return false;
}

/** Named predicate: is this a lighting entity (light domain or lighting switch)? */
export function isLightingEntity(entry) {
  if (isInfrastructureLED(entry)) return false;
  if (entry.domain === 'light') return true;
  if (entry.domain === 'scene') return true;
  if (entry.domain === 'switch' || entry.domain === 'input_boolean') {
    const eid = entry.entity?.entity_id || '';
    const name = (entry.state?.attributes?.friendly_name || '').toLowerCase();
    if (entry.state?.attributes?.device_class === 'outlet') return false;
    return /light|lamp|sconce|chandelier|pendant|fixture|dimmer|illuminat/i.test(name) ||
           /light|lamp|sconce|chandelier|switchlinc|lamplinc|togglelinc/i.test(eid);
  }
  return false;
}

/** Named predicate: is this a security entity? */
export function isSecurityEntity(entry) {
  if (ALARM_DOMAINS.has(entry.domain)) return true;
  if (entry.domain === 'lock') return true;
  if (CAMERA_DOMAINS.has(entry.domain)) return true;
  const dc = entry.state?.attributes?.device_class || '';
  if (entry.domain === 'binary_sensor' && ['door', 'window', 'motion', 'occupancy', 'tamper'].includes(dc)) return true;
  return false;
}

/** Named predicate: is this a tactical panel entity? (security minus cameras) */
const TACTICAL_BINARY_CLASSES = new Set(['door', 'window', 'opening', 'garage_door', 'motion', 'occupancy', 'tamper', 'safety']);
const TACTICAL_COVER_CLASSES = new Set(['garage_door', 'gate', 'door']);
export function isTacticalEntity(entry) {
  if (ALARM_DOMAINS.has(entry.domain)) return true;
  if (entry.domain === 'lock') return true;
  const dc = entry.state?.attributes?.device_class || '';
  if (entry.domain === 'binary_sensor' && TACTICAL_BINARY_CLASSES.has(dc)) return true;
  if (entry.domain === 'cover' && TACTICAL_COVER_CLASSES.has(dc)) return true;
  return false;
}

/** Named predicate: is this a standalone temperature or humidity sensor? */
export function isAmbientSensor(entry) {
  if (entry.domain !== 'sensor') return false;
  const dc = entry.state?.attributes?.device_class || '';
  return dc === 'temperature' || dc === 'humidity';
}

// ─── Area-Level Classification (4X-17) ──────────────────────────────────────

/**
 * Classify an area's entities into area-level composite panel types.
 * Returns a Set of PANEL_TYPE_* constants for composite panels that should
 * be rendered at the area level instead of per-device.
 *
 * @param {Object} hass - Home Assistant instance
 * @param {string} areaId - Area to classify
 * @param {Array} entityEntries - All entity entries for the area
 * @returns {Set<string>} Set of area-level panel types
 */
export function classifyArea(hass, areaId, entityEntries) {
  const types = new Set();

  // Life Support: climate entity OR (environment entity AND ambient sensors)
  const hasClimate = entityEntries.some(isClimateEntity);
  const hasEnvironment = entityEntries.some(isEnvironmentEntity);
  const hasAmbient = entityEntries.some(isAmbientSensor);
  if (hasClimate || (hasEnvironment && hasAmbient)) {
    types.add(PANEL_TYPE_LIFE_SUPPORT);
  }

  // Illumination: ≥1 lighting entity in the area
  const lightCount = entityEntries.filter(isLightingEntity).length;
  if (lightCount >= 1) {
    types.add(PANEL_TYPE_ILLUMINATION);
  }

  // Tactical: any alarm, lock, or security binary/cover sensor (4X-42)
  const hasTactical = entityEntries.some(isTacticalEntity);
  if (hasTactical) {
    types.add(PANEL_TYPE_TACTICAL);
  }

  // Viewport: any cover entity that's a blind/shade/curtain (4X-41)
  const VIEWPORT_COVER_CLASSES = new Set(['blind', 'shade', 'curtain', 'awning', 'shutter']);
  const hasViewport = entityEntries.some(e => {
    if (e.domain !== 'cover') return false;
    const dc = e.state?.attributes?.device_class || '';
    // Covers without a device_class that aren't security covers are also viewport candidates
    return VIEWPORT_COVER_CLASSES.has(dc) || (dc === '' && !TACTICAL_COVER_CLASSES.has(dc));
  });
  if (hasViewport) {
    types.add(PANEL_TYPE_VIEWPORT);
  }

  // Media: ≥1 media_player entity — consolidate Apple TV + HomePods per room (4X-43)
  const mediaCount = entityEntries.filter(e => MEDIA_DOMAINS.has(e.domain)).length;
  if (mediaCount >= 1) {
    types.add(PANEL_TYPE_MEDIA);
  }

  return types;
}
