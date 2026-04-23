/**
 * lcars-hierarchy-utils.js
 *
 * Shared floor/area hierarchy utilities — extracted from lcars-homepage-card.js.
 * Pure data functions — no render imports, no side effects.
 *
 * 5x-prep: 4X-12
 */

/**
 * Get all floors from HA registry, sorted by floor_id.
 * @param {Object} hass - Home Assistant instance
 * @returns {Array<Object>} Array of floor objects sorted by floor_id
 */
export function getFloors(hass) {
  if (!hass?.floors) return [];
  return Object.values(hass.floors).sort((a, b) => {
    const aOrder = a.sort_order ?? 999;
    const bOrder = b.sort_order ?? 999;
    if (aOrder !== bOrder) return aOrder - bOrder;
    const aId = a.floor_id || '';
    const bId = b.floor_id || '';
    return aId.localeCompare(bId);
  });
}

/**
 * Get all area IDs belonging to a specific floor.
 * @param {Object} hass - Home Assistant instance
 * @param {string} floorId - Floor ID to query
 * @returns {Array<string>} Array of area_id strings
 */
export function getFloorAreas(hass, floorId) {
  if (!hass?.areas) return [];
  return Object.values(hass.areas)
    .filter(a => a.floor_id === floorId)
    .map(a => a.area_id);
}

/**
 * Get all areas grouped by floor, returned as a Map.
 * Areas with no floor_id are grouped under the key `null`.
 * Floor keys are sorted; areas within each floor are sorted by name.
 * @param {Object} hass - Home Assistant instance
 * @returns {Map<string|null, Array<Object>>} Map of floorId → area objects
 */
export function getAreasByFloor(hass) {
  const result = new Map();
  if (!hass?.areas) return result;

  const areas = Object.values(hass.areas);
  for (const area of areas) {
    const floorId = area.floor_id || null;
    if (!result.has(floorId)) result.set(floorId, []);
    result.get(floorId).push(area);
  }

  // Sort areas within each floor by HA sort_order (user-configured), fallback to name
  for (const [, areaList] of result) {
    areaList.sort((a, b) => {
      const aOrder = a.sort_order ?? 999;
      const bOrder = b.sort_order ?? 999;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return (a.name || '').localeCompare(b.name || '');
    });
  }

  return result;
}

/**
 * Get sibling area IDs — areas on the same floor as the given area,
 * excluding the given area itself. Useful for multi-zone awareness.
 * @param {Object} hass - Home Assistant instance
 * @param {string} areaId - The reference area ID
 * @returns {Array<string>} Sibling area IDs (empty if area has no floor)
 */
export function getSiblingAreas(hass, areaId) {
  if (!hass?.areas) return [];
  const area = hass.areas[areaId];
  if (!area?.floor_id) return [];
  return Object.values(hass.areas)
    .filter(a => a.floor_id === area.floor_id && a.area_id !== areaId)
    .map(a => a.area_id);
}
