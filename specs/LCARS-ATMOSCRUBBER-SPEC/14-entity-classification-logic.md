## 13. Entity Classification Logic

```javascript
/**
 * Classify entities for the atmoscrubber panel.
 * Returns { sensors, controls, diagnostics, fan, primaryAqi }.
 */
function classifyAtmosEntities(entities) {
  const result = {
    sensors: [],       // sensor domain, non-diagnostic
    controls: [],      // switch, select, number, fan domains
    diagnostics: [],   // entity_category: diagnostic
    fan: null,         // first fan entity (null for sensor-only)
    primaryAqi: null,  // AQI or PM2.5 entity for cylinder color
  };

  const AQI_DEVICE_CLASSES = ['aqi', 'pm25', 'carbon_dioxide',
    'volatile_organic_compounds', 'temperature', 'humidity'];

  for (const e of entities) {
    const domain = e.entity_id.split('.')[0];
    const dc = e.original_device_class || e.device_class || '';
    const cat = e.entity_category || '';

    if (domain === 'fan') {
      result.fan = result.fan || e;
      continue;
    }

    if (cat === 'diagnostic' || cat === 'config') {
      result.diagnostics.push(e);
      continue;
    }

    if (domain === 'sensor' && AQI_DEVICE_CLASSES.includes(dc)) {
      result.sensors.push(e);
      // Track primary AQI source: prefer device_class=aqi, fallback to pm25
      if (dc === 'aqi') result.primaryAqi = e;
      if (dc === 'pm25' && !result.primaryAqi) result.primaryAqi = e;
      continue;
    }

    if (domain === 'switch' || domain === 'select' || domain === 'number') {
      result.controls.push(e);
      continue;
    }

    // Fallback: any remaining sensor
    if (domain === 'sensor' || domain === 'binary_sensor') {
      result.sensors.push(e);
    }
  }

  // Sort sensors by priority order
  const priorityOrder = ['aqi', 'pm25', 'carbon_dioxide',
    'volatile_organic_compounds', 'temperature', 'humidity'];
  result.sensors.sort((a, b) => {
    const aDc = a.original_device_class || a.device_class || '';
    const bDc = b.original_device_class || b.device_class || '';
    const aIdx = priorityOrder.indexOf(aDc);
    const bIdx = priorityOrder.indexOf(bDc);
    return (aIdx === -1 ? 99 : aIdx) - (bIdx === -1 ? 99 : bIdx);
  });

  return result;
}
```

---
