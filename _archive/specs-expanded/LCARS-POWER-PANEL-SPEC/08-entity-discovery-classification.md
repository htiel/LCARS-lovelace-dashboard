## 7. Entity Discovery & Classification

### 7.1 Domain Sets

```js
export const POWER_MONITOR_DOMAINS = new Set(['sensor']);
export const POWER_SWITCH_DOMAINS  = new Set(['switch']);

// Device classes that indicate power monitoring entities
export const POWER_DEVICE_CLASSES = new Set([
  'power',           // Watts (W)
  'energy',          // kWh
  'voltage',         // Volts (V)
  'current',         // Amps (A)
]);
```

### 7.2 Device Classification

```js
/**
 * Classify a power device into one of three tiers.
 * @param {Object[]} entries - Device entities
 * @param {Object} device - Device registry entry
 * @returns {'vue'|'plug'|'strip'|null}
 */
function classifyPowerDevice(entries, device) {
  const hasPowerSensor = entries.some(e =>
    e.domain === 'sensor' &&
    POWER_DEVICE_CLASSES.has(e.original_device_class)
  );
  if (!hasPowerSensor) return null;

  const hasSwitch = entries.some(e => e.domain === 'switch');
  const manufacturer = (device.manufacturer || '').toLowerCase();
  const model = (device.model || '').toLowerCase();

  // Emporia Vue — monitoring only, no switches
  if (manufacturer.includes('emporia') || model.includes('vue')) return 'vue';

  // Power strip — has child devices (HS300)
  // Detected by: parent device with 6+ switch entities, or model match
  const switchCount = entries.filter(e => e.domain === 'switch').length;
  if (switchCount >= 4 || model.includes('hs300') || model.includes('power strip')) return 'strip';

  // Smart plug with monitoring
  if (hasSwitch) return 'plug';

  // Sensor-only (non-Vue) — treat as circuit
  return 'vue';
}
```

### 7.3 Entity Filtering

```js
// MUST respect disabled_by and hidden_by
const visibleEntities = entries.filter(e =>
  !e.disabled_by && !e.hidden_by
);
```

### 7.4 240V Pair Detection

```js
const L1L2_PATTERN = /^(.+?)[\s_]*(l[12]|line[\s_]*[12])$/i;

function detect240VPairs(circuits) {
  const pairs = new Map();
  const unpaired = [];

  for (const c of circuits) {
    const match = c.name.match(L1L2_PATTERN);
    if (match) {
      const baseName = match[1].trim();
      if (!pairs.has(baseName)) pairs.set(baseName, []);
      pairs.get(baseName).push(c);
    } else {
      unpaired.push(c);
    }
  }

  const result = [...unpaired];
  for (const [name, pair] of pairs) {
    if (pair.length === 2) {
      result.push({
        name,
        is240V: true,
        entities: pair.flatMap(p => p.entities),
        watts: pair.reduce((sum, p) => sum + (p.watts || 0), 0),
        kwhToday: pair.reduce((sum, p) => sum + (p.kwhToday || 0), 0),
      });
    } else {
      result.push(...pair); // Odd count — don't pair
    }
  }

  return result;
}
```

---
