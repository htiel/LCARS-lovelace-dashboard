## 4. Chemistry Telemetry Column (Left)

The left column is the "science station" — water chemistry data critical for pool maintenance. This column only renders when IntelliChem entities are present.

### Entity Ordering (Top to Bottom)

| Row | Sensor               | ScreenLogic Entity                        | Unit    | Color                              |
|-----|----------------------|-------------------------------------------|---------|------------------------------------|
| 1   | pH                   | `sensor.*_ph` / `sensor.*_ph_now`         | pH      | Dynamic `getPhColor()`             |
| 2   | ORP                  | `sensor.*_orp` / `sensor.*_orp_now`       | mV      | Dynamic `getOrpColor()`            |
| 3   | Salt / TDS           | `sensor.*_salt_tds_ppm`                   | ppm     | Dynamic `getSaltColor()`           |
| 4   | Saturation Index     | `sensor.*_saturation`                     | —       | Dynamic `getSaturationColor()`     |
| —   | *(divider)*          |                                           |         |                                    |
| 5   | Freeze Protection    | `binary_sensor.*_freeze_mode`             | on/off  | `--lcars-ice` / `--lcars-gray`     |
| 6   | Super Chlorination   | `sensor.*_super_chlor_timer`              | hrs     | `--lcars-almond-creme` / `--lcars-gray` |
| 7   | Flow Alarm           | `binary_sensor.*_flow_alarm`              | on/off  | `--lcars-tomato` / `--lcars-gray`  |
| —   | *(divider)*          |                                           |         |                                    |
| 8   | pH Supply Level      | `sensor.*_ph_supply_level`                | 0–4     | Supply level color                 |
| 9   | ORP Supply Level     | `sensor.*_orp_supply_level`               | 0–4     | Supply level color                 |

### CSS

```css
.pool-chemistry {
  grid-area: chemistry;
  display: flex;
  flex-direction: column;
  gap: var(--lcars-gap);
  padding: 0.25rem 0;
  align-self: start;
}

.pool-chem-heading {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-text-heading);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.25rem 0;
}

.pool-chem-divider {
  height: 1px;
  background: var(--lcars-disabled);
  margin: 0.25rem 0;
  opacity: 0.5;
}

.pool-chem-section-label {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-disabled);
  text-transform: uppercase;
  padding: 0.25rem 0.5rem 0;
  letter-spacing: 0.05em;
}
```

Sensor lines reuse `.device-sensor-line` from the Device Panel Spec §3.3. Chemistry values get dynamic coloring per the threshold tables in §2.

### Supply Level Indicator

The pH and ORP supply levels (IntelliChem tank levels) display as a small 4-segment bar.

```css
.pool-supply-bar {
  display: flex;
  gap: 2px;
  align-items: center;
}

.pool-supply-segment {
  width: 0.5rem;
  height: 0.75rem;
  border-radius: 1px;
  background: var(--lcars-disabled);
  transition: background var(--lcars-transition);
}

.pool-supply-segment.filled {
  background: var(--lcars-ice);
}

.pool-supply-segment.filled.low {
  background: var(--lcars-butterscotch);  /* level ≤ 1 */
}

.pool-supply-segment.filled.empty {
  background: var(--lcars-alert);         /* level 0 */
}
```

### Supply Level Logic

```javascript
/**
 * Map supply level (0–4) to filled segment count and status.
 * ScreenLogic reports 1–5 internally, the sensor subtracts 1 → 0–4.
 */
function getSupplyStatus(level) {
  if (level == null || isNaN(level)) return { filled: 0, status: 'UNAVAILABLE' };
  const v = Number(level);
  if (v >= 3) return { filled: v, status: 'FULL' };
  if (v >= 2) return { filled: v, status: 'OK' };
  if (v >= 1) return { filled: v, status: 'LOW' };
  return { filled: 0, status: 'EMPTY' };
}
```

---
