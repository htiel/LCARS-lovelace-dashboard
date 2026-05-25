// lcars-recorder-stats.js
//
// Shared HA recorder-statistics fetcher with per-call cache + simple batching.
// Used by <lcars-sparkline> (24h hourly mean) and <lcars-bp-range> (30d daily min/max/mean).
//
// Cache key: `${period}|${start}|${end}|${sortedStatisticIds.join(',')}|${typesCsv}`.
// Default TTL 5 min; caller supplies a Map so per-component lifetimes can vary.
//
// PRIVACY (Worf §16):
//   - Never logs values. Wraps `recorder/statistics_during_period` calls only.
//   - Entity-id regex sanitises caller input; non-matching ids are dropped silently.

const ENTITY_ID_RE = /^[a-z_]+\.[a-z0-9_]+$/;

/**
 * Build a stable cache key from request shape.
 */
function _cacheKey({ period, startMs, endMs, statisticIds, types }) {
  const ids = [...statisticIds].sort().join(',');
  const t = (types || ['mean']).slice().sort().join(',');
  return `${period}|${startMs}|${endMs}|${ids}|${t}`;
}

/**
 * Round a millisecond timestamp down to its nearest period bucket so two
 * concurrent calls within the same hour/day land on the same cache key.
 */
function _bucketMs(ms, period) {
  if (period === 'hour') return Math.floor(ms / 3_600_000) * 3_600_000;
  if (period === 'day')  return Math.floor(ms / 86_400_000) * 86_400_000;
  return ms;
}

/**
 * Fetch HA recorder statistics with caching.
 *
 * @param {Object} hass - HA hass object (callWS).
 * @param {string[]} statisticIds - entity ids; non-matching ids dropped.
 * @param {Object} options
 * @param {number} options.windowMs - lookback window in ms
 * @param {'hour'|'day'} [options.period='hour']
 * @param {Array<'mean'|'min'|'max'|'sum'|'state'|'change'>} [options.types=['mean']]
 * @param {Map} cache - caller-owned cache Map
 * @param {Object} [policy]
 * @param {number} [policy.ttlMs=300_000]
 * @param {number} [policy.maxEntities=20]
 * @param {number} [policy.maxCacheSize=30]
 * @returns {Promise<Object|null>} HA response shape `{ <statistic_id>: [{start, mean, min, max, ...}] }`
 */
export async function fetchRecorderStats(hass, statisticIds, options, cache, policy = {}) {
  if (!hass || !cache) return null;
  const { windowMs, period = 'hour', types = ['mean'] } = options || {};
  if (!windowMs || !Array.isArray(statisticIds) || statisticIds.length === 0) return null;

  const { ttlMs = 300_000, maxEntities = 20, maxCacheSize = 30 } = policy;
  const safeIds = statisticIds.filter((id) => ENTITY_ID_RE.test(id)).slice(0, maxEntities);
  if (safeIds.length === 0) return null;

  const now = Date.now();
  const endMs = _bucketMs(now, period);
  const startMs = endMs - windowMs;
  const key = _cacheKey({ period, startMs, endMs, statisticIds: safeIds, types });

  const cached = cache.get(key);
  if (cached && now - cached.timestamp < ttlMs) {
    // Mark cache hit but return real data (lets caller skip re-render check too).
    cached.timestamp = now;
    return cached.data;
  }

  try {
    const data = await hass.callWS({
      type: 'recorder/statistics_during_period',
      start_time: new Date(startMs).toISOString(),
      end_time: new Date(endMs).toISOString(),
      statistic_ids: safeIds,
      period,
      types,
    });
    cache.set(key, { data, timestamp: now });
    if (cache.size > maxCacheSize) {
      const oldest = cache.keys().next().value;
      cache.delete(oldest);
    }
    return data;
  } catch (_) {
    return null;
  }
}

/**
 * Aggregate raw recorder buckets into per-day rows. Input shape:
 *   `{ <id>: [{start: epochMs|isoStr, min?, max?, mean?}] }`
 * Output: `Array<{date: 'YYYY-MM-DD', byId: {<id>: {min,max,mean}}}>` sorted oldest→newest.
 */
export function aggregateDaily(raw) {
  if (!raw || typeof raw !== 'object') return [];
  const dayMap = new Map(); // 'YYYY-MM-DD' -> { byId: {} }
  for (const id of Object.keys(raw)) {
    const rows = raw[id];
    if (!Array.isArray(rows)) continue;
    for (const r of rows) {
      const t = typeof r.start === 'number' ? r.start : Date.parse(r.start);
      if (!Number.isFinite(t)) continue;
      const dt = new Date(t);
      const day = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
      let bucket = dayMap.get(day);
      if (!bucket) { bucket = { date: day, byId: {} }; dayMap.set(day, bucket); }
      const cur = bucket.byId[id] || { min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY, sum: 0, n: 0 };
      if (Number.isFinite(r.min)) cur.min = Math.min(cur.min, r.min);
      if (Number.isFinite(r.max)) cur.max = Math.max(cur.max, r.max);
      const m = Number.isFinite(r.mean) ? r.mean : (Number.isFinite(r.min) && Number.isFinite(r.max) ? (r.min + r.max) / 2 : null);
      if (m != null) { cur.sum += m; cur.n += 1; }
      bucket.byId[id] = cur;
    }
  }
  const out = [];
  for (const b of dayMap.values()) {
    const byId = {};
    for (const id of Object.keys(b.byId)) {
      const c = b.byId[id];
      byId[id] = {
        min: c.min === Number.POSITIVE_INFINITY ? null : c.min,
        max: c.max === Number.NEGATIVE_INFINITY ? null : c.max,
        mean: c.n ? c.sum / c.n : null,
      };
    }
    out.push({ date: b.date, byId });
  }
  out.sort((a, b) => (a.date < b.date ? -1 : 1));
  return out;
}
