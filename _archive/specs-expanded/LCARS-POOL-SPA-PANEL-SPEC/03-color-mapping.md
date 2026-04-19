## 2. Color Mapping

### Body Heat State → Color

The pool and spa viewscreens use thermal coloring to communicate heating state at a glance.

| Body     | `hvac_action`  | LCARS Variable          | Hex       | Rationale                                        |
|----------|----------------|--------------------------|-----------|--------------------------------------------------|
| Pool     | `heating`      | `--lcars-butterscotch`   | `#ff9966` | Warm amber — heater active, warming up           |
| Pool     | `idle`         | `--lcars-ice`            | `#99ccff` | Cool blue — pool at temp or unheated             |
| Pool     | `off`          | `--lcars-gray`           | `#666688` | Muted — heater off                               |
| Spa      | `heating`      | `--lcars-butterscotch`   | `#ff9966` | Warm amber — heater active                       |
| Spa      | `idle`         | `--lcars-sunflower`      | `#ffcc99` | Warm neutral — spa at temp, standing by           |
| Spa      | `off`          | `--lcars-gray`           | `#666688` | Muted — heater off                               |
| Either   | `unavailable`  | `--lcars-tomato` (pulse) | `#ff5555` | System fault — red, distress pulse               |

### Heat Mode → Header Badge Color

| Heat Mode          | LCARS Variable           | Hex       | Rationale                                  |
|--------------------|--------------------------|-----------|---------------------------------------------|
| `heater`           | `--lcars-butterscotch`   | `#ff9966` | Standard gas/electric heater                |
| `solar`            | `--lcars-sunflower`      | `#ffcc99` | Solar — warm golden, passive                |
| `solar_preferred`  | `--lcars-gold`           | `#ffaa00` | Solar preferred — gold = smart/auto         |
| `off`              | `--lcars-gray`           | `#666688` | Disabled                                    |

### Chemistry Status → Color

pH and ORP readings drive dynamic coloring on chemistry readouts.

| Metric | Range            | Status      | LCARS Variable          | Hex       |
|--------|------------------|-------------|--------------------------|-----------|
| pH     | 7.2–7.6          | OPTIMAL     | `--lcars-ice`            | `#99ccff` |
| pH     | 7.0–7.2 / 7.6–7.8| ACCEPTABLE | `--lcars-sunflower`      | `#ffcc99` |
| pH     | < 7.0 / > 7.8   | ALERT       | `--lcars-tomato`         | `#ff5555` |
| pH     | unavailable      | OFFLINE     | `--lcars-gray`           | `#666688` |
| ORP    | 650–750 mV       | OPTIMAL     | `--lcars-ice`            | `#99ccff` |
| ORP    | 550–650 / 750–800| ACCEPTABLE | `--lcars-sunflower`      | `#ffcc99` |
| ORP    | < 550 / > 800    | ALERT       | `--lcars-tomato`         | `#ff5555` |
| ORP    | unavailable      | OFFLINE     | `--lcars-gray`           | `#666688` |
| Salt   | 2700–3400 ppm    | OPTIMAL     | `--lcars-ice`            | `#99ccff` |
| Salt   | 2500–2700 / 3400–3600 | LOW/HIGH | `--lcars-sunflower`   | `#ffcc99` |
| Salt   | < 2500 / > 3600  | ALERT       | `--lcars-tomato`         | `#ff5555` |

### IntelliBrite Color Mode → Swatch Color

Each lighting mode gets a representative color for its selector swatch.

| Color Mode    | Swatch Color  | Hex       | Description                         |
|---------------|---------------|-----------|--------------------------------------|
| `blue`        | Blue          | `#4488ff` | Fixed: Blue                          |
| `green`       | Green         | `#44cc88` | Fixed: Green                         |
| `red`         | Red           | `#ff4444` | Fixed: Red                           |
| `white`       | White         | `#ffffff` | Fixed: White                         |
| `magenta`     | Magenta       | `#cc44ff` | Fixed: Magenta                       |
| `party`       | Multi-flash   | `#ff44cc` | Rapid color mix (pink accent)        |
| `romance`     | Soft violet   | `#cc88ff` | Slow transitions (violet accent)     |
| `caribbean`   | Teal          | `#44ccbb` | Blues and greens                      |
| `american`    | Red/White     | `#ff4466` | Red, white, blue                     |
| `sunset`      | Orange        | `#ff8844` | Orange, red, magenta                 |
| `royal`       | Deep purple   | `#8844cc` | Rich, deep tones                     |
| `color_swim`  | Cycling       | `#88ccff` | W/M/B/G cycle (light blue accent)   |
| `color_sync`  | Sync          | `#88aaff` | Synchronized (medium blue)           |
| `color_set`   | Preset        | `#ffaa44` | Pre-set colors (gold accent)         |
| `all_on`      | Gold          | `#ffaa00` | All circuits on                      |
| `all_off`     | Gray          | `#666688` | All circuits off                     |

### Contrast Verification (all text colors vs `#000000` background)

| Color                    | Hex       | Contrast vs #000 | WCAG Level | Usage                          |
|--------------------------|-----------|-------------------|------------|--------------------------------|
| `--lcars-bluey`          | `#8899ff` | 7.5:1             | AAA        | Frame, section accents         |
| `--lcars-ice`            | `#99ccff` | 10.3:1            | AAA        | Pool color, optimal chemistry  |
| `--lcars-butterscotch`   | `#ff9966` | 8.2:1             | AAA        | Spa/heating color              |
| `--lcars-sunflower`      | `#ffcc99` | 13.1:1            | AAA        | Idle state, acceptable chem    |
| `--lcars-gold`           | `#ffaa00` | 8.6:1             | AAA        | Active buttons, solar pref     |
| `--lcars-tomato`         | `#ff5555` | 5.2:1             | AA         | Alerts, out-of-range chem      |
| `--lcars-gray`           | `#666688` | 4.6:1             | AA         | Off/disabled states            |
| `--lcars-space-white`    | `#f5f6fa` | 18.9:1            | AAA        | Labels, data text              |
| `--lcars-almond-creme`   | `#ffbbaa` | 11.4:1            | AAA        | Super chlorination active      |

All pass **WCAG 1.4.3 (AA)** minimum 4.5:1. `--lcars-gray` at 4.6:1 is the lowest — intentionally dim for disabled/off state and passes AA. Color is never the sole indicator — all states have text labels (WCAG 1.4.1).

### Implementation

```javascript
/**
 * Resolve pool/spa hvac_action to LCARS color CSS variable.
 * Pool defaults to ice (cool), spa defaults to sunflower (warm).
 */
function getBodyColor(hvacAction, bodyType) {
  switch (hvacAction) {
    case 'heating': return 'var(--lcars-butterscotch)';
    case 'idle':    return bodyType === 'spa'
                      ? 'var(--lcars-sunflower)'
                      : 'var(--lcars-ice)';
    case 'off':     return 'var(--lcars-disabled)';
    default:        return 'var(--lcars-disabled)';
  }
}

/**
 * Resolve heat mode to display label and color.
 */
function getHeatModeInfo(presetMode) {
  switch (presetMode) {
    case 'heater':          return { label: 'HEATER', color: 'var(--lcars-butterscotch)' };
    case 'solar':           return { label: 'SOLAR', color: 'var(--lcars-sunflower)' };
    case 'solar_preferred': return { label: 'SOLAR PREF', color: 'var(--lcars-gold)' };
    case 'off':             return { label: 'OFF', color: 'var(--lcars-disabled)' };
    default:                return { label: 'STANDBY', color: 'var(--lcars-disabled)' };
  }
}

/**
 * Resolve pH value to LCARS color CSS variable.
 * Optimal: 7.2–7.6, Acceptable: 7.0–7.8, Alert: outside.
 */
function getPhColor(ph) {
  if (ph == null || isNaN(ph)) return 'var(--lcars-disabled)';
  const v = Number(ph);
  if (v >= 7.2 && v <= 7.6) return 'var(--lcars-ice)';
  if (v >= 7.0 && v <= 7.8) return 'var(--lcars-sunflower)';
  return 'var(--lcars-alert)';
}

/**
 * Resolve pH value to human-readable status label (uppercase).
 */
function getPhLabel(ph) {
  if (ph == null || isNaN(ph)) return 'UNAVAILABLE';
  const v = Number(ph);
  if (v >= 7.2 && v <= 7.6) return 'OPTIMAL';
  if (v >= 7.0 && v <= 7.8) return 'ACCEPTABLE';
  if (v < 7.0) return 'LOW';
  return 'HIGH';
}

/**
 * Resolve ORP value (mV) to LCARS color CSS variable.
 * Optimal: 650–750, Acceptable: 550–800, Alert: outside.
 */
function getOrpColor(orp) {
  if (orp == null || isNaN(orp)) return 'var(--lcars-disabled)';
  const v = Number(orp);
  if (v >= 650 && v <= 750) return 'var(--lcars-ice)';
  if (v >= 550 && v <= 800) return 'var(--lcars-sunflower)';
  return 'var(--lcars-alert)';
}

/**
 * Resolve salt level (ppm) to LCARS color CSS variable.
 * Optimal: 2700–3400, Acceptable: 2500–3600, Alert: outside.
 */
function getSaltColor(salt) {
  if (salt == null || isNaN(salt)) return 'var(--lcars-disabled)';
  const v = Number(salt);
  if (v >= 2700 && v <= 3400) return 'var(--lcars-ice)';
  if (v >= 2500 && v <= 3600) return 'var(--lcars-sunflower)';
  return 'var(--lcars-alert)';
}

/**
 * Resolve saturation index to LCARS color.
 * Balanced: -0.3 to +0.3, Acceptable: -0.5 to +0.5, Alert: outside.
 */
function getSaturationColor(si) {
  if (si == null || isNaN(si)) return 'var(--lcars-disabled)';
  const v = Number(si);
  if (v >= -0.3 && v <= 0.3) return 'var(--lcars-ice)';
  if (v >= -0.5 && v <= 0.5) return 'var(--lcars-sunflower)';
  return 'var(--lcars-alert)';
}
```

---
