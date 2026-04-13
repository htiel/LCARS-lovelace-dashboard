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
  const { ttlMs = 600000 } = options;
  const cacheKey = `${entityId}:${forecastType}`;
  const now = Date.now();

  const cached = _forecastCache.get(cacheKey);
  if (cached && now - cached.timestamp < ttlMs) return cached.data;

  try {
    const result = await hass.callWS({
      type: 'weather/subscribe_forecast',
      entity_id: entityId,
      forecast_type: forecastType,
    });

    // HA 2024.x+ returns { forecast: [...] } from the subscription
    const forecasts = result?.forecast || result || [];
    const data = Array.isArray(forecasts) ? forecasts : [];

    _forecastCache.set(cacheKey, { data, timestamp: now });

    // Evict old entries
    if (_forecastCache.size > 10) {
      const oldest = _forecastCache.keys().next().value;
      _forecastCache.delete(oldest);
    }

    return data;
  } catch (_) {
    // Fallback: try the older service call method
    try {
      const result = await hass.callService('weather', 'get_forecasts', {
        type: forecastType,
      }, { entity_id: entityId });
      const data = result?.[entityId]?.forecast || [];
      _forecastCache.set(cacheKey, { data, timestamp: now });
      return data;
    } catch (__) {
      return [];
    }
  }
}

/**
 * Clear the forecast cache (e.g., on entity change).
 */
export function clearForecastCache() {
  _forecastCache.clear();
}
