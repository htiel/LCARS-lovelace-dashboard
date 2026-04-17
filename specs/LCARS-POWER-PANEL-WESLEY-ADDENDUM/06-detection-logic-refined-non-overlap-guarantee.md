## 5. Detection Logic — Refined Non-Overlap Guarantee

### 5.1 Updated Detector for `lcars-entity-utils.js`

```js
// Power monitoring: ≥1 power/energy/voltage/current sensor, NO battery
// MUST be last in DETECTORS array
(entries) => {
  let hasBattery = false;
  let powerSignals = 0;

  for (const e of entries) {
    const attrs = e.state?.attributes;
    if (!attrs) continue;
    const dc = attrs.device_class || '';
    const unit = attrs.unit_of_measurement || '';

    if (dc === 'battery' && unit === '%') { hasBattery = true; break; }
    if (dc === 'power' && (unit === 'W' || unit === 'kW')) powerSignals++;
    if (dc === 'energy' && (unit === 'kWh' || unit === 'Wh')) powerSignals++;
    if (dc === 'current' && unit === 'A') powerSignals++;
    if (dc === 'voltage' && unit === 'V') powerSignals++;
  }

  return (!hasBattery && powerSignals >= 1) ? PANEL_TYPE_POWER : null;
},
```

### 5.2 Non-Overlap Proof

| Device | battery dc + % | power dc + W | Other power signals | Battery result | Power result |
|--------|---------------|-------------|---------------------|---------------|-------------|
| EcoFlow DELTA | ✓ | ✓ (≥2) | energy, temp | `battery` ✓ | Skip (hasBattery) |
| Emporia Vue circuit | ✗ | ✓ (1) | energy (kWh) | null (no battery) | `power` ✓ |
| Kasa KP115 | ✗ | ✓ (1) | voltage, current | null | `power` ✓ |
| SwitchBot meter | ✗ | ✗ | ✗ | null | null (no signals) |
| Ecobee thermostat | ✗ | ✗ | ✗ | null (caught by climate) | Never reaches |

The key: battery detector requires `hasBattery && powerCount >= 2`. Power detector requires `!hasBattery && powerSignals >= 1`. The `hasBattery` boolean is the mutual exclusion gate.

### 5.3 Edge Case: Kasa Plug Controlling a Fan

A Kasa KP115 plug powering a box fan provides both `switch` + `power`/`energy` entities. The fan domain is not present (it's just a `switch`). This correctly routes to the power panel, not environment. If someone has a dedicated `fan` entity, it would be caught by the environment detector earlier in the chain.

---
