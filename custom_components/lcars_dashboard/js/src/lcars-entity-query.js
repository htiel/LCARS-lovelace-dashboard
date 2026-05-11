/**
 * lcars-entity-query.js (4X-13)
 *
 * Shared entity resolution utility extracted from lcars-homepage-card.js.
 * Provides queryEntities() for retrieving and filtering HA entities by area,
 * floor, domain, and device class — with optional external cache injection.
 *
 * Design decisions per Geordi: cache must be externally injected (no module-level
 * singleton). Multiple dashboard instances in 5.x would collide.
 */

import { DOMAIN_ORDER } from './lcars-entity-utils.js';

// ─── Entity Resolution ──────────────────────────────────────────────────────

/**
 * Resolve entities from the HA registry matching the given query options.
 *
 * @param {Object} hass - Home Assistant instance
 * @param {Object} opts - Query options
 * @param {string[]} [opts.areaIds]           - Filter to these area IDs
 * @param {string[]} [opts.floorIds]          - Filter to areas on these floors
 * @param {string[]|Set<string>} [opts.domains] - Filter to these entity domains
 * @param {string[]|Set<string>} [opts.deviceClasses] - Filter to these device_class values
 * @param {Set<string>} [opts.excludeCategories] - Exclude entity_category values (default: all categories excluded when true-ish)
 * @param {Function} [opts.predicate]         - Additional predicate filter on hydrated entries
 * @param {Map} [cache]                       - Externally managed cache (keyed by stable query fingerprint)
 * @returns {Array<{entity: Object, domain: string, state: Object}>} Hydrated entity entries
 */
export function queryEntities(hass, opts = {}, cache = null) {
  if (!hass) return [];

  // Build a stable cache key from sorted options
  const cacheKey = cache ? _buildCacheKey(opts) : null;
  if (cache && cacheKey && cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const entityReg = Object.values(hass.entities || {});
  const deviceReg = hass.devices || {};
  const areaReg = hass.areas || {};

  // Resolve target area IDs (from explicit areaIds + floorIds)
  let targetAreaIds = null;
  if (opts.areaIds || opts.floorIds) {
    targetAreaIds = new Set(opts.areaIds || []);
    if (opts.floorIds) {
      const floorSet = new Set(opts.floorIds);
      for (const area of Object.values(areaReg)) {
        if (area.floor_id && floorSet.has(area.floor_id)) {
          targetAreaIds.add(area.area_id);
        }
      }
    }
  }

  // Build device→area lookup for inheritance
  const deviceAreaMap = new Map();
  if (targetAreaIds) {
    for (const dev of Object.values(deviceReg)) {
      if (dev.area_id && targetAreaIds.has(dev.area_id)) {
        deviceAreaMap.set(dev.id, dev.area_id);
      }
    }
  }

  // Domain filter
  const domainSet = opts.domains
    ? (opts.domains instanceof Set ? opts.domains : new Set(opts.domains))
    : null;

  // Device class filter
  const dcSet = opts.deviceClasses
    ? (opts.deviceClasses instanceof Set ? opts.deviceClasses : new Set(opts.deviceClasses))
    : null;

  // Category exclusion: defaults to excluding all categories unless overridden
  const excludeCats = opts.excludeCategories instanceof Set
    ? opts.excludeCategories
    : null; // null means exclude ALL entity_category values

  const result = [];

  for (const e of entityReg) {
    // Skip hidden/disabled/category entities
    if (e.hidden_by || e.hidden || e.disabled_by) continue;
    if (e.entity_category) {
      if (!excludeCats || excludeCats.has(e.entity_category)) continue;
    }

    // Area filter (with device inheritance)
    if (targetAreaIds) {
      const inArea = e.area_id
        ? targetAreaIds.has(e.area_id)
        : (e.device_id && deviceAreaMap.has(e.device_id));
      if (!inArea) continue;
    }

    // Domain filter
    const domain = e.entity_id.split('.')[0];
    if (domainSet && !domainSet.has(domain)) continue;

    // Hydrate state
    const state = hass.states?.[e.entity_id];
    if (!state) continue;

    // Device class filter
    if (dcSet) {
      const dc = state.attributes?.device_class || '';
      if (!dcSet.has(dc)) continue;
    }

    const entry = { entity: e, domain, state };

    // Custom predicate
    if (opts.predicate && !opts.predicate(entry)) continue;

    result.push(entry);
  }

  // Sort by domain priority then friendly name
  result.sort((a, b) => {
    const pa = DOMAIN_ORDER[a.domain] ?? 50;
    const pb = DOMAIN_ORDER[b.domain] ?? 50;
    if (pa !== pb) return pa - pb;
    return (a.state?.attributes?.friendly_name || '').localeCompare(
      b.state?.attributes?.friendly_name || ''
    );
  });

  // Cache result
  if (cache && cacheKey) {
    cache.set(cacheKey, result);
  }

  return result;
}

// ─── Area Entity Resolution (convenience) ───────────────────────────────────

/**
 * Resolve all entities for a single area. Drop-in replacement for the
 * original _getAreaEntities() in lcars-homepage-card.js.
 *
 * @param {Object} hass - Home Assistant instance
 * @param {string} areaId - Area to resolve
 * @param {Map} [cache] - Optional cache (keyed by areaId)
 * @returns {Array} Raw entity registry entries (not hydrated)
 */
export function getAreaEntities(hass, areaId, cache = null) {
  if (!hass) return [];
  if (cache && cache.has(areaId)) return cache.get(areaId);

  const entityReg = Object.values(hass.entities || {});
  const deviceReg = hass.devices || {};

  // Devices in this area
  const areaDeviceIds = new Set();
  for (const dev of Object.values(deviceReg)) {
    if (dev.area_id === areaId) areaDeviceIds.add(dev.id);
  }

  // #97 — development scaffolding entities (prototype_*, debug_*, test_*) leak into
  // user-facing area panels (notably the Office). Filter them out at the area-discovery
  // boundary so every downstream classifier (battery, power, tactical, illumination, etc.)
  // inherits the suppression. We match on the object id (the part after the domain dot).
  // Allow compound device-name prefixes (e.g. `prototypesouth_*`, `testbench_*`) by
  // accepting any [a-z0-9]* word-tail before the underscore boundary — the original
  // `^prototype_` regex missed `prototypesouth_prototype_button_1` (Captain's office).
  const DEV_PREFIX_RE = /^(?:prototype|debug|test)[a-z0-9]*(?:_|$)/i;

  const result = entityReg.filter((e) => {
    if (e.hidden_by || e.hidden || e.disabled_by) return false;
    if (e.entity_category) return false;
    const objId = (e.entity_id || '').split('.')[1] || '';
    if (DEV_PREFIX_RE.test(objId)) return false;
    if (e.area_id === areaId) return true;
    if (!e.area_id && e.device_id && areaDeviceIds.has(e.device_id)) return true;
    return false;
  });

  if (cache) cache.set(areaId, result);
  return result;
}

// ─── Entity Grouping ────────────────────────────────────────────────────────

/**
 * Group flat entity registry entries by device. Hydrates each with domain + state.
 * Drop-in replacement for _groupEntities() in lcars-homepage-card.js.
 *
 * @param {Object} hass - Home Assistant instance
 * @param {Array} entities - Raw entity registry entries
 * @returns {{ byDevice: Map<string, {device, entities[]}>, noDevice: Array }}
 */
export function groupEntities(hass, entities) {
  const devices = hass.devices || {};
  const byDevice = new Map();
  const noDevice = [];

  for (const e of entities) {
    const domain = e.entity_id.split('.')[0];
    const state = hass.states?.[e.entity_id];
    const entry = { entity: e, domain, state };
    if (!state) continue;

    if (e.device_id && devices[e.device_id]) {
      if (!byDevice.has(e.device_id)) {
        byDevice.set(e.device_id, { device: devices[e.device_id], entities: [] });
      }
      byDevice.get(e.device_id).entities.push(entry);
    } else {
      noDevice.push(entry);
    }
  }

  // Sort within each group
  const sortFn = (a, b) => {
    const pa = DOMAIN_ORDER[a.domain] ?? 50;
    const pb = DOMAIN_ORDER[b.domain] ?? 50;
    if (pa !== pb) return pa - pb;
    return (a.state?.attributes?.friendly_name || '').localeCompare(
      b.state?.attributes?.friendly_name || ''
    );
  };

  byDevice.forEach((v) => v.entities.sort(sortFn));
  noDevice.sort(sortFn);

  return { byDevice, noDevice };
}

// ─── Internal Helpers ───────────────────────────────────────────────────────

function _buildCacheKey(opts) {
  const parts = [];
  if (opts.areaIds) parts.push('a:' + [...opts.areaIds].sort().join(','));
  if (opts.floorIds) parts.push('f:' + [...opts.floorIds].sort().join(','));
  if (opts.domains) {
    const d = opts.domains instanceof Set ? [...opts.domains] : [...opts.domains];
    parts.push('d:' + d.sort().join(','));
  }
  if (opts.deviceClasses) {
    const dc = opts.deviceClasses instanceof Set ? [...opts.deviceClasses] : [...opts.deviceClasses];
    parts.push('dc:' + dc.sort().join(','));
  }
  // Predicate-based queries are not cacheable by key alone
  if (opts.predicate) return null;
  return parts.join('|') || '__all__';
}
