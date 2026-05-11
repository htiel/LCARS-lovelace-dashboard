/**
 * lcars-sparkline.js
 *
 * SVG sparkline renderer shared by environment, weather, and temp/humidity panels.
 * Returns lit-html TemplateResult for inline SVG polyline sparklines.
 */
import { html } from 'lit-element';

/**
 * Extract numeric mean values from HA statistics data.
 * @param {Array} points - Array of { mean: number } from recorder/statistics_during_period
 * @returns {number[]} Finite numeric values
 */
function extractValues(points) {
  if (!Array.isArray(points)) return [];
  return points.map(p => p.mean).filter(v => v != null && Number.isFinite(v));
}

/**
 * Build SVG polyline points string from values.
 * @param {number[]} vals - Numeric values
 * @param {number} w - SVG viewBox width
 * @param {number} h - SVG viewBox height
 * @returns {string} Space-separated "x,y" coordinate pairs
 */
function buildPath(vals, w, h) {
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  return vals.map((v, i) =>
    `${((i / (vals.length - 1)) * w).toFixed(1)},${(h - ((v - min) / range) * h).toFixed(1)}`
  ).join(' ');
}

/**
 * Render an SVG sparkline from statistics data.
 *
 * @param {Array} points - Array of { mean: number } from HA statistics
 * @param {Object} options - Rendering options
 * @param {string} options.color - CSS color for the stroke (e.g. 'var(--lcars-ice)')
 * @param {string} [options.label] - Optional label text shown before the sparkline
 * @param {number} [options.width=120] - SVG viewBox width
 * @param {number} [options.height=24] - SVG viewBox height
 * @param {string} [options.className='lcars-sparkline'] - CSS class on the wrapper
 * @returns {import('lit-element').TemplateResult|string} Sparkline HTML or empty string
 */
export function renderSparkline(points, { color, label = '', width = 120, height = 24, className = 'lcars-sparkline' } = {}) {
  const vals = extractValues(points);
  if (vals.length < 2) return '';

  const d = buildPath(vals, width, height);
  const lastVal = vals[vals.length - 1];
  const ariaLabel = label
    ? `${label}: ${lastVal?.toFixed(0) || ''}`
    : `Sparkline: ${lastVal?.toFixed(0) || ''}`;

  return html`
    <div class="${className}-wrap" role="img" aria-label="${ariaLabel}">
      ${label ? html`<span class="${className}-label">${label}</span>` : ''}
      <svg class="${className}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
        <polyline points="${d}" fill="none" stroke="${color}" stroke-width="1.5"
          vector-effect="non-scaling-stroke" />
      </svg>
    </div>
  `;
}

/**
 * Fetch 24h hourly statistics for entity IDs (with caching).
 * Cache is per-device, TTL 5 minutes. Pass a shared Map as the cache store.
 *
 * @param {Object} hass - Home Assistant hass object
 * @param {string} cacheKey - Cache key (typically device ID)
 * @param {string[]} entityIds - Entity IDs to fetch statistics for
 * @param {Map} cache - Shared cache Map (caller owns this)
 * @param {Object} [options]
 * @param {number} [options.ttlMs=300000] - Cache TTL in ms (default 5 min)
 * @param {number} [options.maxEntities=10] - Max entities per request
 * @param {number} [options.maxCacheSize=30] - Max cache entries before eviction
 * @returns {Promise<Object|null>} Statistics data or null if cached/failed
 */
export async function fetchSparklineData(hass, cacheKey, entityIds, cache, options = {}) {
  const { ttlMs = 300000, maxEntities = 10, maxCacheSize = 30 } = options;
  const ENTITY_ID_RE = /^[a-z_]+\.[a-z0-9_]+$/;

  const now = Date.now();
  const cached = cache.get(cacheKey);
  if (cached && now - cached.timestamp < ttlMs) return null; // cache hit

  try {
    const safeIds = entityIds
      .slice(0, maxEntities)
      .filter(id => ENTITY_ID_RE.test(id));
    if (safeIds.length === 0) return null;

    const end = new Date();
    const start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
    const data = await hass.callWS({
      type: 'recorder/statistics_during_period',
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      statistic_ids: safeIds,
      period: 'hour',
      types: ['mean'],
    });

    cache.set(cacheKey, { data, timestamp: now });
    // Evict oldest if cache grows too large
    if (cache.size > maxCacheSize) {
      const oldest = cache.keys().next().value;
      cache.delete(oldest);
    }
    return data;
  } catch (_) {
    return null;
  }
}
