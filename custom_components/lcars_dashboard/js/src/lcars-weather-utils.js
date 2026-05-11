/**
 * lcars-weather-utils.js
 *
 * Weather forecast fetcher with TTL cache.
 * Wraps the HA weather.get_forecasts service for daily/hourly forecasts.
 */

const _forecastCache = new Map();

/**
 * Fetch weather forecasts with caching.
 *
 * @param {Object} hass - Home Assistant hass object
 * @param {string} entityId - Weather entity ID (e.g. 'weather.home')
 * @param {'daily'|'hourly'} [forecastType='daily'] - Forecast type
 * @param {Object} [options]
 * @param {number} [options.ttlMs=600000] - Cache TTL in ms (default 10 min)
 * @returns {Promise<Array>} Array of forecast objects or empty array
 */
export async function fetchForecasts(hass, entityId, forecastType = 'daily', options = {}) {
  // #141 \u2014 TTL bumped 10\u219215 min per plan; empty arrays still cached so a forecast-empty
  // entity does not loop-refetch every render cycle.
  const { ttlMs = 900000 } = options;
  const cacheKey = `${entityId}:${forecastType}`;
  const now = Date.now();

  const cached = _forecastCache.get(cacheKey);
  if (cached && now - cached.timestamp < ttlMs) return cached.data;

  try {
    // #140 (revised post-Worf review) — use the weather.get_forecasts SERVICE with
    // return_response=true, not the weather/subscribe_forecasts WS subscription. Calling
    // a subscribe_* type through callWS leaks the listener on the HA server (no
    // unsubscribe lifecycle is held by this helper). The service-call is a true one-shot
    // and is the documented on-demand forecast API.
    const result = await hass.callService(
      'weather',
      'get_forecasts',
      { type: forecastType },
      { entity_id: entityId },
      true,   // blocking
      true,   // returnResponse
    );
    const raw = result?.response?.[entityId]?.forecast || result?.[entityId]?.forecast || [];
    const data = Array.isArray(raw) ? raw : [];

    _forecastCache.set(cacheKey, { data, timestamp: now });
    if (_forecastCache.size > 10) {
      const oldest = _forecastCache.keys().next().value;
      _forecastCache.delete(oldest);
    }
    return data;
  } catch (_) {
    // #141 — cache empty results too so a broken integration is not hammered every render.
    _forecastCache.set(cacheKey, { data: [], timestamp: now });
    return [];
  }
}

/**
 * Clear the forecast cache (e.g., on entity change).
 */
export function clearForecastCache() {
  _forecastCache.clear();
}
