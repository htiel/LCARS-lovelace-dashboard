## 9. HA Entity Mapping

### Target Devices

| Device          | Entity ID                            | Supported States                                    | Code Required |
|-----------------|--------------------------------------|-----------------------------------------------------|---------------|
| SimpliSafe      | `alarm_control_panel.simplisafe`     | `disarmed`, `armed_home`, `armed_away`, `triggered` | Config-dependent |

### Required Entity: alarm_control_panel

The primary entity — provides all alarm state and arm/disarm controls.

| Attribute               | Used For                                      | Fallback             |
|-------------------------|-----------------------------------------------|----------------------|
| `state`                 | Current alarm state (frame color, shield icon)| `'unavailable'`     |
| `code_arm_required`     | Whether code is needed to arm                 | `false`              |
| `code_format`           | Code format (`number` or `text`)              | `'number'`           |
| `supported_features`    | Bitmask of supported arm modes                | Derive from state    |
| `changed_by`            | Who/what last changed the state               | Section hidden       |
| `last_changed`          | Timestamp of last state change                | `'--:--'`            |

### Supported Features Bitmask

```javascript
/**
 * Alarm control panel supported features (from HA core).
 * Source: homeassistant/components/alarm_control_panel/const.py
 */
const AlarmFeatures = {
  ARM_HOME:          1,
  ARM_AWAY:          2,
  ARM_NIGHT:         4,
  ARM_VACATION:      16,
  ARM_CUSTOM_BYPASS: 8,
  TRIGGER:           32,
};

/**
 * Get the list of arm modes supported by this alarm entity.
 */
function getSupportedArmModes(stateObj) {
  const features = stateObj?.attributes?.supported_features || 0;
  const modes = [];
  if (features & AlarmFeatures.ARM_HOME)          modes.push('armed_home');
  if (features & AlarmFeatures.ARM_AWAY)          modes.push('armed_away');
  if (features & AlarmFeatures.ARM_NIGHT)         modes.push('armed_night');
  if (features & AlarmFeatures.ARM_VACATION)      modes.push('armed_vacation');
  if (features & AlarmFeatures.ARM_CUSTOM_BYPASS) modes.push('armed_custom_bypass');
  return modes;
}
```

### Optional Linked Entities (SimpliSafe Sensor Zones)

Zone sensors are discovered via the same device or configured explicitly. SimpliSafe exposes these sensor types:

| Entity Domain     | Device Class        | Zone Name Example      | Used For                       |
|-------------------|---------------------|------------------------|--------------------------------|
| `binary_sensor`   | `door`              | Front Door             | Entry zone contact sensor      |
| `binary_sensor`   | `window`            | Living Room Window     | Window contact sensor          |
| `binary_sensor`   | `motion`            | Hallway Motion         | Motion detector                |
| `binary_sensor`   | `vibration`         | Glass Break            | Glass break sensor             |
| `binary_sensor`   | `moisture`          | Basement Water Leak    | Water leak sensor              |
| `binary_sensor`   | `cold`              | Freeze Sensor          | Freeze/temperature alert       |
| `binary_sensor`   | `smoke`             | Smoke Detector         | Smoke/CO detector              |
| `binary_sensor`   | `safety`            | CO Detector            | Carbon monoxide detector       |
| `sensor`          | `signal_strength`   | Base Station Signal    | Diagnostics                    |
| `sensor`          | `battery`           | Sensor Battery         | Zone sensor battery level      |

### Entity Classification Logic

```javascript
/**
 * Classify entities for the alarm panel.
 * Returns { alarm, zones, diagnostics, auxiliary }.
 */
function classifyAlarmEntities(entities) {
  const result = {
    alarm: null,          // primary alarm_control_panel entity
    zones: [],            // binary_sensor zone entities
    diagnostics: [],      // entity_category: diagnostic
    auxiliary: [],        // other sensors (battery, signal, etc.)
  };

  const ZONE_CLASSES = ['door', 'window', 'motion', 'vibration',
    'moisture', 'cold', 'smoke', 'safety', 'opening',
    'garage_door', 'lock', 'tamper', 'problem'];

  for (const e of entities) {
    const domain = e.entity_id.split('.')[0];
    const dc = e.original_device_class || e.device_class || '';
    const cat = e.entity_category || '';

    if (domain === 'alarm_control_panel') {
      result.alarm = result.alarm || e;
      continue;
    }

    if (cat === 'diagnostic' || cat === 'config') {
      result.diagnostics.push(e);
      continue;
    }

    if (domain === 'binary_sensor' && ZONE_CLASSES.includes(dc)) {
      result.zones.push(e);
      continue;
    }

    if (domain === 'sensor') {
      result.auxiliary.push(e);
      continue;
    }
  }

  // Sort zones by device class priority (entry points first, then detection, then environmental)
  const zonePriority = ['door', 'window', 'opening', 'garage_door', 'lock',
    'motion', 'vibration', 'tamper', 'moisture', 'cold', 'smoke', 'safety', 'problem'];
  result.zones.sort((a, b) => {
    const aDc = a.original_device_class || a.device_class || '';
    const bDc = b.original_device_class || b.device_class || '';
    const aIdx = zonePriority.indexOf(aDc);
    const bIdx = zonePriority.indexOf(bDc);
    return (aIdx === -1 ? 99 : aIdx) - (bIdx === -1 ? 99 : bIdx);
  });

  return result;
}
```

### HA Service Call Mapping

| Panel Action       | HA Service                                     | Data                                 |
|--------------------|------------------------------------------------|--------------------------------------|
| Arm Home           | `alarm_control_panel.alarm_arm_home`           | `{ entity_id, code? }`              |
| Arm Away           | `alarm_control_panel.alarm_arm_away`           | `{ entity_id, code? }`              |
| Arm Night          | `alarm_control_panel.alarm_arm_night`          | `{ entity_id, code? }`              |
| Arm Vacation       | `alarm_control_panel.alarm_arm_vacation`       | `{ entity_id, code? }`              |
| Arm Custom Bypass  | `alarm_control_panel.alarm_arm_custom_bypass`  | `{ entity_id, code? }`              |
| Disarm             | `alarm_control_panel.alarm_disarm`             | `{ entity_id, code? }`              |

The `code` parameter is included only when the user has entered digits. It is consumed from the `AlarmCodeHandler` via `consumeCode()` — the handler clears it from memory immediately after extraction. The code string is passed directly to `hass.callService()` — it is never stored in component state, DOM attributes, local storage, or logged.

---
