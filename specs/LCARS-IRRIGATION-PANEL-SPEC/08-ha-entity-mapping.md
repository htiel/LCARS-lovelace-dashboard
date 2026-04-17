## 7. HA Entity Mapping

### Target Device

| Device              | Integration     | Key Entities                                                      |
|---------------------|-----------------|-------------------------------------------------------------------|
| Rachio Controller   | `rachio`        | `switch.rachio_zone_*`, `binary_sensor.rachio_*_is_watering`, `sensor.rachio_*_next_run`, `sensor.rachio_*_daily_used`, `calendar.rachio_*` |

### Required Entity: Zone Switches

Each irrigation zone is a `switch` entity. The panel discovers all zones belonging to the controller via `device_id`.

| Attribute / State    | Used For                                     | Fallback                    |
|----------------------|----------------------------------------------|-----------------------------|
| `state`              | Zone status (`on` = watering, `off` = idle)  | `'unavailable'`             |
| `friendly_name`      | Zone display name in grid                    | Entity ID fallback          |
| `zone_number`        | Sort order in zone grid                      | Alphabetical by name        |
| `soil_type`          | Expanded zone attribute                      | Hidden if null              |
| `nozzle_type`        | Expanded zone attribute                      | Hidden if null              |
| `shade`              | Expanded zone attribute                      | Hidden if null              |
| `slope`              | Expanded zone attribute                      | Hidden if null              |

### Optional Entities

| Entity Pattern                        | Domain          | Used For                          | Fallback                      |
|---------------------------------------|-----------------|-----------------------------------|-------------------------------|
| `binary_sensor.rachio_*_is_watering`  | `binary_sensor` | Active watering confirmation      | Derive from zone switch state |
| `sensor.rachio_*_next_run`            | `sensor`        | Next scheduled run time           | `'NO SCHEDULE'`               |
| `sensor.rachio_*_daily_used`          | `sensor`        | Daily water usage (gallons/liters)| Section hidden if null        |
| `calendar.rachio_*`                   | `calendar`      | Schedule calendar                 | Use next_run sensor instead   |

### Entity Classification Logic

```javascript
/**
 * Classify entities for the irrigation panel.
 * Returns { zones, sensors, controller }.
 */
function classifyIrrigationEntities(entities) {
  const result = {
    zones: [],         // switch entities (zone controls)
    sensors: [],       // sensor entities (schedule, usage)
    controller: null,  // primary controller entity (binary_sensor or switch)
  };

  for (const e of entities) {
    const domain = e.entity_id.split('.')[0];
    const dc = e.original_device_class || e.device_class || '';
    const cat = e.entity_category || '';

    // Skip diagnostic/config entities
    if (cat === 'diagnostic' || cat === 'config') continue;

    if (domain === 'switch') {
      result.zones.push(e);
      continue;
    }

    if (domain === 'sensor') {
      result.sensors.push(e);
      continue;
    }

    if (domain === 'binary_sensor') {
      // Controller online status or watering indicator
      if (!result.controller) result.controller = e;
      continue;
    }
  }

  // Sort zones by zone_number attribute, falling back to name
  result.zones.sort((a, b) => {
    const numA = a.attributes?.zone_number ?? 999;
    const numB = b.attributes?.zone_number ?? 999;
    if (numA !== numB) return numA - numB;
    return (a.attributes?.friendly_name || '').localeCompare(
      b.attributes?.friendly_name || ''
    );
  });

  return result;
}
```

### Service Calls

```javascript
/**
 * Validate that an entity_id belongs to the classified zone list.
 * Prevents stale UI state from calling services on unrelated entities.
 * @param {string} entityId - entity_id to validate
 * @param {string[]} validZoneIds - list of valid zone entity_ids
 * @returns {boolean}
 */
function isValidZoneEntity(entityId, validZoneIds) {
  return validZoneIds.includes(entityId);
}

/** Rate-limit timestamp — prevents rapid toggle cycling (protects solenoid valves). */
let _lastZoneActionTime = 0;
const ZONE_ACTION_COOLDOWN_MS = 2000;

/**
 * Start watering a specific zone.
 * Guards: entity must be in valid zone list, controller must not be in standby,
 * and a 2-second cooldown prevents rapid toggling.
 * @param {object} hass - Home Assistant connection
 * @param {string} entityId - zone switch entity_id
 * @param {string[]} validZoneIds - classified zone entity_ids
 * @param {boolean} isStandby - true if controller is in standby mode
 */
function startZone(hass, entityId, validZoneIds, isStandby) {
  if (isStandby) return;
  if (!isValidZoneEntity(entityId, validZoneIds)) return;
  const now = Date.now();
  if (now - _lastZoneActionTime < ZONE_ACTION_COOLDOWN_MS) return;
  _lastZoneActionTime = now;
  hass.callService('switch', 'turn_on', { entity_id: entityId });
}

/**
 * Stop watering a specific zone.
 * Guards: entity must be in valid zone list, 2-second cooldown.
 * @param {object} hass - Home Assistant connection
 * @param {string} entityId - zone switch entity_id
 * @param {string[]} validZoneIds - classified zone entity_ids
 */
function stopZone(hass, entityId, validZoneIds) {
  if (!isValidZoneEntity(entityId, validZoneIds)) return;
  const now = Date.now();
  if (now - _lastZoneActionTime < ZONE_ACTION_COOLDOWN_MS) return;
  _lastZoneActionTime = now;
  hass.callService('switch', 'turn_off', { entity_id: entityId });
}

/**
 * Toggle controller standby mode.
 * Rachio standby is exposed as a switch entity on the controller.
 * @param {object} hass - Home Assistant connection
 * @param {string} controllerEntityId - controller switch entity_id
 * @param {boolean} standby - true = enter standby, false = resume
 */
function toggleStandby(hass, controllerEntityId, standby) {
  hass.callService('switch', standby ? 'turn_on' : 'turn_off', {
    entity_id: controllerEntityId,
  });
}
```

---
