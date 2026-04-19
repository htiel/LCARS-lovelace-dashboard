/**
 * lcars-format-utils.js
 *
 * Centralized formatting for sensor values, state text, and canonical labels.
 * Pure functions — no side effects, no DOM access.
 *
 * v4.22.0 P2: Shared Formatting, Labels, and State Semantics
 * Bugs: DATA-008, DATA-012, DATA-018, GEORDI-001, GEORDI-003, GEORDI-014,
 *        GEORDI-032, WESLEY-UX-003, WESLEY-UX-010
 */

// ─── Rounding Rules by device_class ─────────────────────────────────────────

const DC_DECIMALS = {
  temperature: 1,
  humidity: 0,
  power: 0,
  energy: 1,
  pm25: 0,
  pm10: 0,
  pm1: 0,
  aqi: 0,
  carbon_dioxide: 0,
  carbon_monoxide: 0,
  volatile_organic_compounds: 0,
  battery: 0,
  pressure: 1,
  illuminance: 0,
  moisture: 0,
  signal_strength: 0,
  voltage: 1,
  current: 2,
  frequency: 1,
  speed: 1,
  distance: 1,
  weight: 1,
  duration: 0,
};

/**
 * Format a numeric sensor value with device-class-aware rounding.
 * Returns a bare number string — no unit appended.
 * Non-numeric values pass through as-is.
 *
 * @param {string} value - Raw state.state string
 * @param {string} [deviceClass=''] - HA device_class
 * @returns {string} Formatted number string
 */
export function formatNumber(value, deviceClass = '') {
  if (value == null || value === '') return '—';
  if (value === 'unavailable' || value === 'unknown') return '—';
  const n = Number(value);
  if (!Number.isFinite(n)) return value;

  const decimals = DC_DECIMALS[deviceClass];
  if (decimals !== undefined) {
    return decimals === 0 ? String(Math.round(n)) : n.toFixed(decimals);
  }
  // Default: 0 for integers, 1 for floats
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

// ─── Canonical Short Labels ─────────────────────────────────────────────────

const CANONICAL_LABELS = {
  pm25: 'PM\u2082.\u2085',
  pm10: 'PM\u2081\u2080',
  pm1: 'PM\u2081',
  carbon_dioxide: 'CO\u2082',
  carbon_monoxide: 'CO',
  volatile_organic_compounds: 'VOC',
  nitrogen_dioxide: 'NO\u2082',
  ozone: 'O\u2083',
  sulphur_dioxide: 'SO\u2082',
  aqi: 'AQI',
  temperature: 'TEMP',
  humidity: 'RH',
  pressure: 'PRESS',
  illuminance: 'LUX',
  battery: 'BATT',
  signal_strength: 'RSSI',
  moisture: 'MOIST',
  gas: 'GAS',
  water: 'WATER',
  data_rate: 'RATE',
  data_size: 'SIZE',
};

const ENTITY_SUFFIX_LABELS = [
  ['orp', 'ORP'],
  ['ph', 'pH'],
  ['salt_tds', 'SALT'],
  ['saturation', 'SAT'],
  ['total_alkalinity', 'ALK'],
  ['calcium_hardness', 'CA HARD'],
  ['cyanuric_acid', 'CYA'],
  ['free_chlorine', 'FREE CL'],
  ['total_chlorine', 'TOTAL CL'],
  ['water_temp', 'WATER'],
];

/**
 * Get a canonical short label for a sensor entity.
 * Prefers device_class mapping, falls back to entity_id suffix matching,
 * then to the provided fallback name.
 *
 * @param {string} [deviceClass=''] - HA device_class
 * @param {string} [fallbackName=''] - Fallback label (e.g., shortened friendly_name)
 * @param {string} [entityId=''] - Full entity_id for suffix matching
 * @returns {string} Canonical label
 */
export function canonicalLabel(deviceClass = '', fallbackName = '', entityId = '') {
  if (CANONICAL_LABELS[deviceClass]) return CANONICAL_LABELS[deviceClass];

  if (entityId) {
    const suffix = entityId.split('.').pop() || '';
    for (const [pattern, label] of ENTITY_SUFFIX_LABELS) {
      if (suffix.endsWith(pattern)) return label;
    }
  }

  return fallbackName;
}

/**
 * Get a plain-text (screen-reader-safe) version of a canonical label.
 * Strips Unicode subscripts for aria-label usage.
 *
 * @param {string} label - Canonical label (may contain Unicode subscripts)
 * @returns {string} Plain text label
 */
export function ariaLabel(label) {
  return label
    .replace(/\u2080/g, '0').replace(/\u2081/g, '1').replace(/\u2082/g, '2')
    .replace(/\u2083/g, '3').replace(/\u2084/g, '4').replace(/\u2085/g, '5')
    .replace(/\u2086/g, '6').replace(/\u2087/g, '7').replace(/\u2088/g, '8')
    .replace(/\u2089/g, '9');
}

// ─── State Text Formatting ──────────────────────────────────────────────────

const IDLE_DOMAINS = new Set(['button', 'input_button', 'scene', 'script']);

/**
 * Format a state value for display, with domain-aware idle/error semantics.
 * Returns { text, isIdle } where isIdle indicates a dormant/non-error state.
 *
 * @param {Object} state - HA state object { state, attributes, entity_id }
 * @param {string} [entityCategory=''] - Entity category (diagnostic, config, '')
 * @returns {{ text: string, isIdle: boolean }}
 */
export function formatStateValue(state, entityCategory = '') {
  const s = state?.state;
  if (s == null || s === '') return { text: '—', isIdle: true };

  const domain = (state?.entity_id || '').split('.')[0];
  const dc = state?.attributes?.device_class || '';
  const unit = state?.attributes?.unit_of_measurement || '';

  // Sentinel states — domain-aware display text
  if (s === 'unknown') {
    if (IDLE_DOMAINS.has(domain)) return { text: 'READY', isIdle: true };
    if (domain === 'sensor' || domain === 'binary_sensor') return { text: 'NO DATA', isIdle: true };
    if (entityCategory === 'diagnostic' || entityCategory === 'config') return { text: '—', isIdle: true };
    return { text: 'UNKNOWN', isIdle: true };
  }

  if (s === 'unavailable') {
    if (entityCategory === 'diagnostic' || entityCategory === 'config') return { text: '—', isIdle: true };
    if (domain === 'sensor' || domain === 'binary_sensor') return { text: 'OFFLINE', isIdle: true };
    return { text: 'UNAVAILABLE', isIdle: true };
  }

  // Idle domains with non-sentinel states
  if (IDLE_DOMAINS.has(domain)) {
    return { text: s.toUpperCase(), isIdle: s === 'idle' || s === 'off' };
  }

  // Numeric formatting with unit
  const formatted = formatNumber(s, dc);
  // If formatNumber returned the original value (non-numeric), uppercase it
  if (formatted === s && isNaN(Number(s))) {
    return { text: s.toUpperCase(), isIdle: false };
  }

  // Watt → kW promotion (Data M1: keep unit logic in formatStateValue, not formatNumber)
  if (unit === 'W' || unit === 'w') {
    const n = Number(s);
    if (Number.isFinite(n) && Math.abs(n) >= 10000) {
      return { text: `${(n / 1000).toFixed(1)} kW`, isIdle: false };
    }
  }

  return { text: unit ? `${formatted} ${unit}` : formatted, isIdle: false };
}
