## 10. HA Entity Mapping

### Target Devices

| Device              | Climate Entity                | Key Attributes                                                        | Special Features                |
|---------------------|-------------------------------|-----------------------------------------------------------------------|---------------------------------|
| Nest Thermostat     | `climate.nest_thermostat`     | `hvac_modes`: heat, cool, heat_cool, eco, off; `fan_mode`: on, auto | Eco mode as hvac_mode           |
| Ecobee              | `climate.ecobee`              | `hvac_modes`: heat, cool, heat_cool, auto, off; `preset_modes`: home, away, sleep | Rich presets              |
| Generic HVAC        | `climate.*`                   | Varies                                                                | Subset of attributes            |

### Required Entity: Climate

The primary entity — provides all thermostat state and controls.

| Attribute             | Used For                                     | Fallback                    |
|-----------------------|----------------------------------------------|-----------------------------|
| `state`               | Current HVAC mode (displayed in mode strip)  | `'unavailable'`             |
| `current_temperature`  | Large temperature display                    | `'--'`                      |
| `temperature`          | Single setpoint value                        | Hidden if null              |
| `target_temp_high`     | Dual setpoint high target                    | Hidden if null              |
| `target_temp_low`      | Dual setpoint low target                     | Hidden if null              |
| `current_humidity`     | Humidity sensor line                         | Hidden if null              |
| `hvac_action`          | Dynamic frame color + action badge           | `'idle'`                    |
| `hvac_modes`           | Mode selector strip buttons                  | `['off']`                   |
| `fan_mode`             | Fan mode selector active state               | Section hidden if null      |
| `fan_modes`            | Fan mode selector buttons                    | Section hidden if null      |
| `preset_mode`          | Preset selector active state                 | Section hidden if null      |
| `preset_modes`         | Preset selector buttons                      | Section hidden if null      |
| `min_temp`             | Arc range minimum + setpoint clamping        | `45` (HA default)           |
| `max_temp`             | Arc range maximum + setpoint clamping        | `95` (HA default)           |
| `target_temp_step`     | Setpoint ±button increment                   | `0.5`                       |

### Optional Linked Entities

| Entity Domain        | Device Class        | Used For                          | Discovery                         |
|----------------------|---------------------|-----------------------------------|-----------------------------------|
| `binary_sensor`      | `problem`           | Fault indicator                   | Same device_id                    |
| `binary_sensor`      | `connectivity`      | Online/offline status             | Same device_id                    |
| `binary_sensor`      | `battery`           | Battery warning (wireless tstats) | Same device_id                    |
| `sensor`             | `humidity`          | Humidity (if not in climate attr) | Same device_id or configured      |
| `sensor`             | `temperature`       | Outdoor temp (if available)       | Configured entity                 |

### Entity Classification Logic

```javascript
/**
 * Classify entities for the climate panel.
 * Returns { climate, sensors, faults, diagnostics }.
 */
function classifyClimateEntities(entities) {
  const result = {
    climate: null,        // primary climate entity
    sensors: [],          // sensor domain, non-diagnostic
    faults: [],           // binary_sensor fault indicators
    diagnostics: [],      // entity_category: diagnostic
  };

  const FAULT_CLASSES = ['problem', 'heat', 'cold', 'connectivity',
                         'battery', 'tamper', 'smoke', 'safety'];

  for (const e of entities) {
    const domain = e.entity_id.split('.')[0];
    const dc = e.original_device_class || e.device_class || '';
    const cat = e.entity_category || '';

    if (domain === 'climate') {
      result.climate = result.climate || e;
      continue;
    }

    if (cat === 'diagnostic' || cat === 'config') {
      result.diagnostics.push(e);
      continue;
    }

    if (domain === 'binary_sensor' && FAULT_CLASSES.includes(dc)) {
      result.faults.push(e);
      continue;
    }

    if (domain === 'sensor') {
      result.sensors.push(e);
      continue;
    }
  }

  return result;
}
```

---
