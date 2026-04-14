/**
 * lcars-color-utils.js
 *
 * Consolidated color resolver functions for all LCARS panel types.
 * Pure functions — no side effects, no DOM access.
 * Each returns a CSS variable string like 'var(--lcars-ice)'.
 *
 * Sources: LCARS-DEVICE-PANEL-SPEC §4, LCARS-ATMOSCRUBBER-SPEC §2/§5,
 * LCARS-TEMP-HUMIDITY-GRID-SPEC §5/§6, LCARS-CLIMATE-PANEL-SPEC §2,
 * LCARS-ALARM-PANEL-SPEC §2, LCARS-MEDIA-CARD-SPEC §2,
 * LCARS-POOL-SPA-PANEL-SPEC §2, LCARS-WEATHER-PANEL-SPEC §2,
 * LCARS-IRRIGATION-PANEL-SPEC §2.
 */

// ─── Device Panel: Sensor State ─────────────────────────────────────────────

/**
 * Resolve entity state to an LCARS indicator color.
 * Covers binary_sensor (motion, occupancy, presence, sound, etc.),
 * sensor (battery threshold), and event domains.
 * @param {string} entityId - Full entity_id (e.g. 'binary_sensor.motion_front')
 * @param {Object|null} state - HA state object { state, attributes, entity_id }
 * @returns {string} CSS variable string
 */
export function getStateColor(entityId, state) {
  const s = state?.state;
  if (s === 'unavailable' || s === 'unknown') return 'var(--lcars-alert)';

  const dc = state?.attributes?.device_class || '';
  const domain = entityId.split('.')[0];

  if (domain === 'binary_sensor') {
    if (s === 'off') return 'var(--lcars-disabled)';
    switch (dc) {
      case 'motion':
      case 'moving':
        return 'var(--lcars-butterscotch)';
      case 'occupancy':
      case 'presence':
        return 'var(--lcars-gold)';
      case 'sound':
        return 'var(--lcars-alert)';
      default:
        return 'var(--lcars-data-accent)';
    }
  }

  if (domain === 'sensor') {
    if (dc === 'battery') {
      const val = parseFloat(s);
      if (!isNaN(val) && val < 20) return 'var(--lcars-alert)';
    }
    return 'var(--lcars-data-accent)';
  }

  if (domain === 'event') return 'var(--lcars-alert)';

  return 'var(--lcars-data-accent)';
}

// ─── Atmoscrubber: AQI ──────────────────────────────────────────────────────

/**
 * Resolve AQI value to LCARS color CSS variable.
 * EPA breakpoints: 0–50 Good, 51–100 Moderate, 101–150 Sensitive,
 * 151–200 Unhealthy, 201+ Very Unhealthy/Hazardous.
 * @param {number|string|null} aqi - AQI value
 * @returns {string} CSS variable string
 */
export function getAqiColor(aqi) {
  if (aqi == null || isNaN(aqi)) return 'var(--lcars-disabled)';
  const v = Number(aqi);
  if (v <= 50)  return 'var(--lcars-ice)';
  if (v <= 100) return 'var(--lcars-sunflower)';
  if (v <= 150) return 'var(--lcars-butterscotch)';
  if (v <= 200) return 'var(--lcars-peach)';
  return 'var(--lcars-alert)';
}

/**
 * Map AQI to a human-readable uppercase status label.
 * @param {number|string|null} aqi - AQI value
 * @returns {string} Status label
 */
export function getAqiLabel(aqi) {
  if (aqi == null || isNaN(aqi)) return 'UNAVAILABLE';
  const v = Number(aqi);
  if (v <= 50)  return 'GOOD';
  if (v <= 100) return 'MODERATE';
  if (v <= 150) return 'SENSITIVE';
  if (v <= 200) return 'UNHEALTHY';
  if (v <= 300) return 'VERY UNHEALTHY';
  return 'HAZARDOUS';
}

// ─── Atmoscrubber: CO₂ ──────────────────────────────────────────────────────

/**
 * Resolve CO₂ ppm to LCARS color CSS variable.
 * 3-tier model per Air Purifier v4.13.0 reconciliation (Data R1):
 *   ≤800 nominal, 801–1200 elevated, >1200 high.
 * Bad/invalid data returns alert color (Worf R1 — fail visible).
 * @param {number|string|null} co2 - CO₂ in ppm
 * @returns {string} CSS variable string
 */
export function getCo2Color(co2) {
  const v = Number(co2);
  if (!Number.isFinite(v)) return 'var(--lcars-tomato)';
  if (v <= 800)  return 'var(--lcars-ice)';
  if (v <= 1200) return 'var(--lcars-sunflower)';
  return 'var(--lcars-tomato)';
}

// ─── Temp/Humidity Grid: Comfort Colors ─────────────────────────────────────

/**
 * Resolve temperature (°F) to LCARS color CSS variable.
 * <55 cold, 55–67 cool, 68–76 nominal, 77–84 warm, 85+ hot.
 * @param {number|string|null} temp - Temperature in Fahrenheit
 * @param {Object} [thresholds] - Custom comfort thresholds
 * @param {number} [thresholds.coldMax=55]
 * @param {number} [thresholds.coolMax=67]
 * @param {number} [thresholds.nominalMax=76]
 * @param {number} [thresholds.warmMax=84]
 * @returns {string} CSS variable string
 */
export function getTempColor(temp, thresholds = {}) {
  const {
    coldMax = 55,
    coolMax = 67,
    nominalMax = 76,
    warmMax = 84
  } = thresholds;

  if (temp == null || isNaN(temp)) return 'var(--lcars-gray)';
  const v = Number(temp);
  if (v < coldMax)     return 'var(--lcars-blue)';
  if (v <= coolMax)    return 'var(--lcars-bluey)';
  if (v <= nominalMax) return 'var(--lcars-ice)';
  if (v <= warmMax)    return 'var(--lcars-butterscotch)';
  return 'var(--lcars-peach)';
}

/**
 * Resolve humidity percentage to LCARS color CSS variable.
 * <20 very dry, 20–29 dry, 30–60 nominal, 61–70 humid, 71+ very humid.
 * @param {number|string|null} humidity - Humidity percentage
 * @param {Object} [thresholds] - Custom comfort thresholds
 * @param {number} [thresholds.veryDryMax=20]
 * @param {number} [thresholds.dryMax=29]
 * @param {number} [thresholds.nominalMax=60]
 * @param {number} [thresholds.humidMax=70]
 * @returns {string} CSS variable string
 */
export function getHumidityColor(humidity, thresholds = {}) {
  const {
    veryDryMax = 20,
    dryMax = 29,
    nominalMax = 60,
    humidMax = 70
  } = thresholds;

  if (humidity == null || isNaN(humidity)) return 'var(--lcars-gray)';
  const v = Number(humidity);
  if (v < veryDryMax)  return 'var(--lcars-peach)';
  if (v <= dryMax)     return 'var(--lcars-sunflower)';
  if (v <= nominalMax) return 'var(--lcars-space-white)';
  if (v <= humidMax)   return 'var(--lcars-sunflower)';
  return 'var(--lcars-tomato)';
}

/**
 * Resolve a comfort value to LCARS color by type.
 * Routes to getTempColor or getHumidityColor.
 * @param {number|string|null} value - Numeric value
 * @param {'temperature'|'humidity'} type - Measurement type
 * @param {Object} [thresholds] - Custom comfort thresholds
 * @returns {string} CSS variable string
 */
export function getComfortColor(value, type, thresholds) {
  if (type === 'humidity') return getHumidityColor(value, thresholds);
  return getTempColor(value, thresholds);
}

// ─── Climate Panel: HVAC Action ─────────────────────────────────────────────

/**
 * Resolve hvac_action to LCARS color CSS variable.
 * Drives dynamic frame color and temperature arc accent.
 * @param {string|null} hvacAction - 'heating'|'cooling'|'idle'|'drying'|'fan'|'off'
 * @returns {string} CSS variable string
 */
export function getHvacActionColor(hvacAction) {
  switch (hvacAction) {
    case 'heating': return 'var(--lcars-butterscotch)';
    case 'cooling': return 'var(--lcars-ice)';
    case 'idle':    return 'var(--lcars-sunflower)';
    case 'drying':  return 'var(--lcars-almond)';
    case 'fan':     return 'var(--lcars-african-violet)';
    case 'off':     return 'var(--lcars-disabled)';
    default:        return 'var(--lcars-disabled)';
  }
}

// ─── Alarm Panel: Alarm State ───────────────────────────────────────────────

/**
 * Resolve alarm_control_panel state to LCARS color CSS variable.
 * Drives dynamic frame color, shield icon, and header badge.
 * @param {string|null} alarmState - HA alarm_control_panel state
 * @returns {string} CSS variable string
 */
export function getAlarmStateColor(alarmState) {
  switch (alarmState) {
    case 'disarmed':            return 'var(--lcars-ice)';
    case 'armed_home':
    case 'armed_night':         return 'var(--lcars-sunflower)';
    case 'armed_away':
    case 'armed_vacation':      return 'var(--lcars-butterscotch)';
    case 'armed_custom_bypass': return 'var(--lcars-african-violet)';
    case 'arming':
    case 'pending':
    case 'disarming':           return 'var(--lcars-gold)';
    case 'triggered':           return 'var(--lcars-alert)';
    default:                    return 'var(--lcars-disabled)';
  }
}

// ─── Media Card: Playback State ─────────────────────────────────────────────

/**
 * Resolve media_player state to LCARS color CSS variable.
 * @param {string|null} state - HA media_player state
 * @returns {string} CSS variable string
 */
export function getPlaybackStateColor(state) {
  if (state == null) return 'var(--lcars-disabled)';
  switch (state) {
    case 'playing':      return 'var(--lcars-african-violet)';
    case 'paused':
    case 'buffering':    return 'var(--lcars-sunflower)';
    case 'on':           return 'var(--lcars-data-accent)';
    case 'idle':
    case 'standby':
    case 'off':          return 'var(--lcars-disabled)';
    case 'unavailable':
    case 'unknown':      return 'var(--lcars-alert)';
    default:             return 'var(--lcars-disabled)';
  }
}

// ─── Pool/Spa Panel: Body Color ─────────────────────────────────────────────

/**
 * Resolve pool/spa hvac_action to LCARS color CSS variable.
 * Pool idle = ice (cool), spa idle = sunflower (warm).
 * @param {string|null} hvacAction - 'heating'|'idle'|'off'
 * @param {'pool'|'spa'} [bodyType='pool'] - Which water body
 * @returns {string} CSS variable string
 */
export function getPoolBodyColor(hvacAction, bodyType = 'pool') {
  switch (hvacAction) {
    case 'heating': return 'var(--lcars-butterscotch)';
    case 'idle':    return bodyType === 'spa'
                      ? 'var(--lcars-sunflower)'
                      : 'var(--lcars-ice)';
    case 'off':     return 'var(--lcars-disabled)';
    default:        return 'var(--lcars-disabled)';
  }
}

// ─── Weather Panel: Condition Color ─────────────────────────────────────────

/**
 * Resolve weather entity condition to LCARS color CSS variable.
 * Drives dynamic frame color and temperature text accent.
 * @param {string|null} condition - HA weather entity state
 * @returns {string} CSS variable string
 */
export function getWeatherConditionColor(condition) {
  switch (condition) {
    case 'sunny':           return 'var(--lcars-sunflower)';
    case 'clear-night':     return 'var(--lcars-bluey)';
    case 'partlycloudy':    return 'var(--lcars-ice)';
    case 'cloudy':
    case 'fog':             return 'var(--lcars-gray)';
    case 'rainy':
    case 'pouring':         return 'var(--lcars-sky)';
    case 'snowy':           return 'var(--lcars-space-white)';
    case 'snowy-rainy':
    case 'hail':            return 'var(--lcars-ice)';
    case 'windy':
    case 'windy-variant':   return 'var(--lcars-almond)';
    case 'lightning':
    case 'lightning-rainy': return 'var(--lcars-gold)';
    case 'exceptional':
    case 'unavailable':     return 'var(--lcars-tomato)';
    default:                return 'var(--lcars-sky)';
  }
}

// ─── Irrigation Panel: Zone Color ───────────────────────────────────────────

/**
 * Resolve irrigation zone state to LCARS color CSS variable.
 * @param {string|null} zoneState - HA switch entity state ('on'|'off'|'unavailable')
 * @param {boolean} [isStandby=false] - Controller is in standby mode
 * @returns {string} CSS variable string
 */
export function getIrrigationZoneColor(zoneState, isStandby = false) {
  if (isStandby) return 'var(--lcars-disabled)';
  switch (zoneState) {
    case 'on':          return 'var(--lcars-ice)';
    case 'off':         return 'var(--lcars-sunflower)';
    case 'unavailable': return 'var(--lcars-tomato)';
    default:            return 'var(--lcars-disabled)';
  }
}

// ─── Consolidated STATE_COLOR_MAP (Data R-2, v4.13.0) ──────────────────────

/**
 * Centralized state-to-color map for all panel domains.
 * Use getStateColorForDomain() for lookup.
 */
export const STATE_COLOR_MAP = {
  alarm: {
    disarmed: '--lcars-ice',
    armed_home: '--lcars-sunflower',
    armed_night: '--lcars-sunflower',
    armed_away: '--lcars-butterscotch',
    armed_vacation: '--lcars-butterscotch',
    armed_custom_bypass: '--lcars-african-violet',
    arming: '--lcars-gold',
    pending: '--lcars-gold',
    disarming: '--lcars-gold',
    triggered: '--lcars-tomato',
  },
  climate: {
    heating: '--lcars-butterscotch',
    cooling: '--lcars-ice',
    idle: '--lcars-sunflower',
    drying: '--lcars-almond',
    fan: '--lcars-african-violet',
    off: '--lcars-gray',
  },
  media: {
    playing: '--lcars-african-violet',
    paused: '--lcars-sunflower',
    buffering: '--lcars-sunflower',
    on: '--lcars-ice',
    idle: '--lcars-gray',
    standby: '--lcars-gray',
    off: '--lcars-gray',
    unavailable: '--lcars-tomato',
  },
  pool: {
    heating: '--lcars-butterscotch',
    idle_pool: '--lcars-ice',
    idle_spa: '--lcars-sunflower',
    off: '--lcars-gray',
  },
  irrigation: {
    on: '--lcars-ice',
    off: '--lcars-sunflower',
    unavailable: '--lcars-tomato',
  },
};

/**
 * Get color for a domain + state combo from the centralized map.
 * @param {string} domain – 'alarm'|'climate'|'media'|'pool'|'irrigation'
 * @param {string} state – entity state value
 * @returns {string} CSS variable string or disabled fallback
 */
export function getStateColorForDomain(domain, state) {
  const varName = STATE_COLOR_MAP[domain]?.[state];
  return varName ? `var(${varName})` : 'var(--lcars-disabled)';
}

// ─── COMFORT_COLORS Whitelist (Worf R1 — Temp Grid) ────────────────────────

/**
 * Whitelist map of comfort class names → CSS variable strings.
 * Only these values may reach style.setProperty() for tile colors.
 * Prevents raw entity data from flowing into CSS.
 */
export const COMFORT_COLORS = {
  cold:    'var(--lcars-blue)',
  cool:    'var(--lcars-bluey)',
  nominal: 'var(--lcars-ice)',
  warm:    'var(--lcars-butterscotch)',
  hot:     'var(--lcars-peach)',
  dry:     'var(--lcars-sunflower)',
  humid:   'var(--lcars-tomato)',
};

/**
 * Get comfort class for a temperature value (°F).
 * @param {number|string|null} tempF – temperature in Fahrenheit
 * @returns {string} comfort class name: cold|cool|nominal|warm|hot
 */
export function getTempComfortClass(tempF) {
  const v = Number(tempF);
  if (!Number.isFinite(v)) return 'nominal';
  if (v < 55)  return 'cold';
  if (v <= 67) return 'cool';
  if (v <= 76) return 'nominal';
  if (v <= 84) return 'warm';
  return 'hot';
}

/**
 * Safe comfort color resolver — only returns whitelisted CSS variables.
 * @param {string} comfortClass – from getTempComfortClass or similar
 * @returns {string} CSS variable string
 */
export function getSafeComfortColor(comfortClass) {
  return COMFORT_COLORS[comfortClass] || COMFORT_COLORS.nominal;
}

/**
 * Resolve rain delay info with explicit numeric guard (Worf M4).
 * @param {Object} attrs – entity attributes
 * @returns {{ label: string, color: string }}
 */
export function getRainDelayInfo(attrs) {
  const delay = Number(attrs?.rain_delay);
  if (!isNaN(delay) && delay > 0) {
    return { label: `${delay} HR DELAY`, color: 'var(--lcars-african-violet)' };
  }
  return { label: 'NONE', color: 'var(--lcars-disabled)' };
}
