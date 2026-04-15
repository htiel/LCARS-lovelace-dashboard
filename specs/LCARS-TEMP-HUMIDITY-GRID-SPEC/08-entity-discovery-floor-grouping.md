## 7. Entity Discovery & Floor Grouping

### Discovery Algorithm

The card uses the HA WebSocket API to discover SwitchBot Meter devices without requiring manual entity configuration.

```javascript
/**
 * Discover all SwitchBot Meter temperature/humidity sensor groups.
 * Returns an array of room objects with entity IDs and area info.
 *
 * Strategy (D-C1: use hass object properties — NO WebSocket calls for discovery):
 *   1. Read registries from hass.entities, hass.devices, hass.areas, hass.floors
 *   2. Filter for device_class: 'temperature' (generalized — not platform-specific)
 *   3. Exclude devices that also have fan/climate/air_quality entities (those are
 *      air purifiers, HVAC, or air quality monitors — handled by other panels)
 *   4. For each temperature entity, find sibling humidity and battery entities
 *      via shared device_id
 *   5. Resolve area and floor from device → area → floor chain
 *   6. Optionally exclude "appliance" meters (by name_by_user or device name
 *      containing "fridge", "freezer", etc.)
 *   7. Validate all entity IDs with ENTITY_ID_RE at extraction time (W-R1)
 *
 * @param {Object} hass - Home Assistant connection object (with .entities, .devices, .areas, .floors)
 * @param {Object} config - Card configuration
 * @returns {Array<RoomSensorGroup>}
 */
function discoverSensorGroups(hass, config) {
  const ENTITY_ID_RE = /^[a-z_]+\.[a-z0-9_]+$/; // W-R1: validate at extraction

  // D-C1: Use hass object properties — NO WebSocket calls for registry discovery.
  // These are already loaded and reactive on the hass object.
  const entities = Object.values(hass.entities || {});
  const devices  = hass.devices || {};
  const areas    = hass.areas || {};
  const floors   = hass.floors || {};  // HA 2024.2+, fallback to empty

  // Build device → entities lookup
  const deviceMap = new Map();

  // Step 2: Find temperature entities (generalized — not platform-specific)
  // Exclude devices that also have fan/climate/air_quality entities
  const EXCLUDE_DOMAINS = new Set(['fan', 'climate']);
  const AQ_CLASSES = new Set(['aqi', 'pm25', 'pm10', 'volatile_organic_compounds']);

  const tempEntities = entities.filter(e =>
    e.original_device_class === 'temperature' &&
    !e.disabled_by &&
    ENTITY_ID_RE.test(e.entity_id)  // W-R1: validate at extraction
  );

  // Step 3: Group by device_id, exclude environment panel devices, resolve siblings + area
  const groups = [];
  const appliancePattern = /fridge|freezer|wine\s*cooler|kegerator|deep\s*freeze/i;

  for (const tempEntity of tempEntities) {
    const deviceId = tempEntity.device_id;
    const device = devices[deviceId];
    if (!device) continue;

    // Exclude devices that belong to other panels (air purifiers, HVAC, etc.)
    const siblings = entities.filter(e => e.device_id === deviceId && !e.disabled_by);
    const hasExcludedDomain = siblings.some(e => EXCLUDE_DOMAINS.has(e.entity_id?.split('.')[0]));
    const hasAqSensor = siblings.some(e => AQ_CLASSES.has(e.original_device_class));
    if (hasExcludedDomain || hasAqSensor) continue;

    // Optional: exclude appliance monitors
    const deviceName = device.name_by_user || device.name || '';
    if (!config.show_appliance_meters && appliancePattern.test(deviceName)) {
      continue;
    }

    // Find sibling entities on the same device
    const humidityEntity = siblings.find(e =>
      e.original_device_class === 'humidity' && ENTITY_ID_RE.test(e.entity_id)
    );
    const batteryEntity = siblings.find(e =>
      e.original_device_class === 'battery' && ENTITY_ID_RE.test(e.entity_id)
    );

    // Resolve area and floor
    const areaId = device.area_id;
    const area = areaId ? areas[areaId] : null;
    const floorId = area ? area.floor_id : null;
    const floor = floorId ? floors[floorId] : null;

    groups.push({
      deviceId,
      deviceName,
      areaId,
      areaName: area ? area.name : deviceName.replace(/^Meter\s*-\s*/i, ''),
      floorId,
      floorName: floor ? floor.name : 'UNASSIGNED',
      floorLevel: floor ? floor.level : 999,
      temperatureEntityId: tempEntity.entity_id,
      humidityEntityId: humidityEntity ? humidityEntity.entity_id : null,
      batteryEntityId: batteryEntity ? batteryEntity.entity_id : null,
    });
  }

  // Step 5: Sort by floor level (descending = top floors first), then area name
  groups.sort((a, b) => {
    if (b.floorLevel !== a.floorLevel) return b.floorLevel - a.floorLevel;
    return a.areaName.localeCompare(b.areaName);
  });

  return groups;
}
```

### Floor Grouping for Render

```javascript
/**
 * Group discovered sensor data by floor for rendering.
 * Returns a Map<floorName, RoomSensorGroup[]> in floor-level order.
 */
function groupByFloor(sensorGroups) {
  const floorGroups = new Map();

  for (const group of sensorGroups) {
    const key = group.floorName;
    if (!floorGroups.has(key)) {
      floorGroups.set(key, []);
    }
    floorGroups.get(key).push(group);
  }

  return floorGroups;
}
```

### History Fetch for Sparklines

```javascript
/**
 * v4.14.0 UPDATE (W-R2): The original fetchSensorHistory() using REST API
 * (hass.callApi('GET', 'history/period/...')) has been replaced.
 *
 * Use the shared fetchSparklineData() from lcars-sparkline.js which uses
 * hass.callWS({ type: 'recorder/statistics_during_period' }) — WebSocket only.
 */
// W-R2: DO NOT use REST API (hass.callApi) for history data.
// Reuse the shared fetchSparklineData() from lcars-sparkline.js which uses
// hass.callWS({ type: 'recorder/statistics_during_period' }) — WebSocket only.
//
// import { fetchSparklineData, renderSparkline } from './lcars-sparkline.js';
//
// Usage in the grid card:
//   const entityIds = this._sensorGroups.map(g => g.temperatureEntityId);
//   const data = await fetchSparklineData(this._hass, entityIds, {
//     cacheKey: 'sensors-grid',
//     cache: this._gridHistoryCache,
//     maxEntities: 14,  // matches typical fleet size
//   });
//
// Render per tile:
//   renderSparkline(data[group.temperatureEntityId], { width: 100, height: 16 })
//
// The shared function already handles:
//   - ENTITY_ID_RE validation on all entity IDs
//   - 5-minute TTL cache to prevent redundant fetches
//   - Pre-aggregated 5-minute statistics (no client-side downsampling needed)
//   - Single WebSocket call for ALL entities (vs 14 HTTP round-trips)
```

---
