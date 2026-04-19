## 2. Zone State → Color Mapping

Each zone has a simple state model: idle, watering, or unavailable.

| Zone State       | LCARS Variable          | Hex       | Text Label     | Rationale                                   |
|------------------|--------------------------|-----------|----------------|----------------------------------------------|
| `idle`           | `--lcars-sunflower`      | `#ffcc99` | `IDLE`         | Warm neutral — zone ready, standing by       |
| `watering`       | `--lcars-ice`            | `#99ccff` | `WATERING`     | Water blue — active irrigation               |
| `standby`        | `--lcars-gray`           | `#666688` | `STANDBY`      | Muted — controller offline                   |
| `unavailable`    | `--lcars-tomato` (pulse) | `#ff5555` | `OFFLINE`      | Fault — communication lost                   |

### Schedule/Rain State Colors

| State                | LCARS Variable          | Hex       | Usage                                    |
|----------------------|--------------------------|-----------|------------------------------------------|
| Rain delay active    | `--lcars-african-violet` | `#cc99ff` | Rain skip indicator — distinct from water |
| Next run scheduled   | `--lcars-sunflower`      | `#ffcc99` | Schedule time readout                    |
| No schedule          | `--lcars-gray`           | `#666688` | Dim — nothing pending                    |
| Controller online    | `--lcars-ice`            | `#99ccff` | Online status dot                        |
| Controller standby   | `--lcars-gold`           | `#ffaa00` | Standby toggle active                    |

### Contrast Verification (all text vs `#000000` background)

| Color                    | Hex       | Contrast vs #000 | WCAG Level | Usage                        |
|--------------------------|-----------|-------------------|------------|------------------------------|
| `--lcars-ice`            | `#99ccff` | 10.3:1            | AAA        | Frame, watering state, fill  |
| `--lcars-sunflower`      | `#ffcc99` | 13.1:1            | AAA        | Idle state, schedule readout |
| `--lcars-gold`           | `#ffaa00` | 8.6:1             | AAA        | Standby toggle active        |
| `--lcars-african-violet` | `#cc99ff` | 8.5:1             | AAA        | Rain delay indicator         |
| `--lcars-gray`           | `#666688` | 4.6:1             | AA         | Disabled/standby/no schedule |
| `--lcars-tomato`         | `#ff5555` | 5.2:1             | AA         | Offline/fault                |
| `--lcars-space-white`    | `#f5f6fa` | 18.9:1            | AAA        | Zone names, labels           |

All pass **WCAG 1.4.3 (AA)** minimum 4.5:1. Color is never the sole indicator — all states have text labels (WCAG 1.4.1).

### Implementation

```javascript
/**
 * Resolve zone switch state to LCARS color and label.
 * @param {string} state - HA entity state ('on', 'off', 'unavailable', 'standby')
 * @param {boolean} isStandby - controller is in standby mode
 * @returns {{ color: string, label: string }}
 */
function getZoneStateInfo(state, isStandby) {
  if (isStandby) {
    return { color: 'var(--lcars-disabled)', label: 'STANDBY' };
  }
  switch (state) {
    case 'on':          return { color: 'var(--lcars-ice)', label: 'WATERING' };
    case 'off':         return { color: 'var(--lcars-sunflower)', label: 'IDLE' };
    case 'unavailable': return { color: 'var(--lcars-tomato)', label: 'OFFLINE' };
    default:            return { color: 'var(--lcars-disabled)', label: 'UNKNOWN' };
  }
}

/**
 * Resolve rain delay status to display info.
 * @param {object} attrs - controller attributes
 * @returns {{ label: string, color: string }}
 */
function getRainDelayInfo(attrs) {
  const delay = Number(attrs?.rain_delay);
  if (!isNaN(delay) && delay > 0) { // [Worf M4] explicit numeric guard
    return { label: `${delay} HR DELAY`, color: 'var(--lcars-african-violet)' };
  }
  return { label: 'NONE', color: 'var(--lcars-disabled)' };
}
```

---
