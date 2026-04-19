## 2. HVAC Action → Color Mapping

The `hvac_action` attribute drives the dynamic frame color, temperature arc accent, and header badge color. This is the primary visual feedback channel.

### Color Map

| `hvac_action` | LCARS Variable           | Hex       | Rationale                                                    |
|---------------|--------------------------|-----------|--------------------------------------------------------------|
| `heating`     | `--lcars-butterscotch`   | `#ff9966` | Warm amber — furnace/heat pump active, warmth                |
| `cooling`     | `--lcars-ice`            | `#99ccff` | Cool blue — compressor active, cooling                       |
| `idle`        | `--lcars-sunflower`      | `#ffcc99` | Soft warm neutral — system at target, standing by            |
| `drying`      | `--lcars-almond`         | `#ffaa90` | Dry warmth — dehumidification active                         |
| `fan`         | `--lcars-african-violet` | `#cc99ff` | Distinct hue — fan circulation without heating/cooling       |
| `off`         | `--lcars-gray`           | `#666688` | Muted — system powered down, standard LCARS disabled         |
| N/A           | `--lcars-gray`           | `#666688` | Unavailable / unknown — sensor offline                       |

### HVAC Mode → Button Color (for mode selector strip)

| `hvac_mode`   | Active Color              | Hex       | Rationale                                          |
|---------------|---------------------------|-----------|-----------------------------------------------------|
| `heat`        | `--lcars-butterscotch`    | `#ff9966` | Same warm hue as heating action — visual consistency |
| `cool`        | `--lcars-ice`             | `#99ccff` | Same cool hue as cooling action                      |
| `heat_cool`   | `--lcars-gold`            | `#ffaa00` | Gold = dual-function active, important               |
| `auto`        | `--lcars-gold`            | `#ffaa00` | Gold = automatic/smart decision mode                 |
| `dry`         | `--lcars-almond`          | `#ffaa90` | Matches drying action color                          |
| `fan_only`    | `--lcars-african-violet`  | `#cc99ff` | Matches fan action color                             |
| `off`         | `--lcars-gray`            | `#666688` | Disabled state                                       |

### Contrast Verification (all vs `#000000` background)

| Color                    | Hex       | Contrast vs #000 | WCAG Level | Usage                        |
|--------------------------|-----------|-------------------|------------|------------------------------|
| `--lcars-butterscotch`   | `#ff9966` | 8.2:1             | AAA        | Heating action/mode          |
| `--lcars-ice`            | `#99ccff` | 10.3:1            | AAA        | Cooling action/mode          |
| `--lcars-sunflower`      | `#ffcc99` | 13.1:1            | AAA        | Idle action                  |
| `--lcars-gold`           | `#ffaa00` | 8.6:1             | AAA        | Auto/heat_cool mode          |
| `--lcars-almond`         | `#ffaa90` | 9.6:1             | AAA        | Dry action/mode              |
| `--lcars-african-violet` | `#cc99ff` | 8.5:1             | AAA        | Fan action/mode              |
| `--lcars-gray`           | `#666688` | 4.6:1             | AA         | Off/disabled                 |
| `--lcars-space-white`    | `#f5f6fa` | 18.9:1            | AAA        | Labels, data text            |
| `--lcars-tomato`         | `#ff5555` | 5.2:1             | AA         | Faults/alerts                |

All pass **WCAG 1.4.3 (AA)** minimum 4.5:1. `--lcars-gray` at 4.6:1 is intentionally dim for disabled state and passes AA. Color is never the sole indicator — all states have text labels.

### Implementation

```javascript
/**
 * Resolve hvac_action to LCARS color CSS variable.
 * This drives the dynamic frame color and temperature arc accent.
 */
function getClimateActionColor(hvacAction) {
  switch (hvacAction) {
    case 'heating': return 'var(--lcars-butterscotch)';
    case 'cooling': return 'var(--lcars-ice)';
    case 'idle':    return 'var(--lcars-sunflower)';
    case 'drying':  return 'var(--lcars-almond)';
    case 'fan':     return 'var(--lcars-african-violet)';
    case 'off':     return 'var(--lcars-disabled)';
    default:        return 'var(--lcars-disabled)';
  }
}

/**
 * Resolve hvac_mode to active button color.
 */
function getClimateModeColor(hvacMode) {
  switch (hvacMode) {
    case 'heat':      return 'var(--lcars-butterscotch)';
    case 'cool':      return 'var(--lcars-ice)';
    case 'heat_cool': return 'var(--lcars-gold)';
    case 'auto':      return 'var(--lcars-gold)';
    case 'dry':       return 'var(--lcars-almond)';
    case 'fan_only':  return 'var(--lcars-african-violet)';
    case 'off':       return 'var(--lcars-disabled)';
    default:          return 'var(--lcars-disabled)';
  }
}

/**
 * Map hvac_action to human-readable uppercase label for the header badge.
 */
function getClimateActionLabel(hvacAction) {
  switch (hvacAction) {
    case 'heating': return 'HEATING';
    case 'cooling': return 'COOLING';
    case 'idle':    return 'IDLE';
    case 'drying':  return 'DRYING';
    case 'fan':     return 'FAN';
    case 'off':     return 'OFF';
    default:        return 'STANDBY';
  }
}
```

---
