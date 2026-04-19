# P2 Design — Shared Formatting, Labels, and State Semantics

**Author**: Wesley Crusher
**Date**: Stardate 2026-04-19
**Status**: DESIGN — Awaiting Geordi LCARS Compliance Review
**Pass**: P2 (WSJF Implementation Plan)

---

## Bugs Addressed

| ID | Summary | Root Fix |
|----|---------|----------|
| DATA-008 | Add shared numeric formatting | `lcars-format-utils.js` |
| DATA-012 | Normalize button unknown → READY/STANDBY | `formatStateValue()` + `getStateColor()` |
| DATA-018 | Route all sensor rows through shared formatter | `_formatSensorValue()` in base panel |
| GEORDI-001 | Raw decimals break LCARS typography | `formatNumber()` rounding rules |
| GEORDI-003 | WaterGuru label truncation | `CANONICAL_LABELS` map |
| GEORDI-014 | Alert red for non-alert unknown/unavailable | `getStateColor()` domain/category awareness |
| GEORDI-032 | Standardize canonical short sensor labels | `canonicalLabel()` function |
| WESLEY-UX-003 | Show READY / NO DATA instead of red UNKNOWN | `formatStateValue()` + color resolver |
| WESLEY-UX-010 | Fix truncated sparkline labels | `canonicalLabel()` in sparkline tray |

---

## 1. New Module: `lcars-format-utils.js`

Location: `custom_components/lcars_dashboard/js/src/lcars-format-utils.js`

Pure functions, no DOM, no imports beyond constants. Target: <2 KiB minified.

### 1.1 `formatNumber(value, deviceClass, unit)`

Rounds numeric state values to LCARS-appropriate precision. Handles the core visual bug (GEORDI-001, DATA-008).

```js
/**
 * Format a numeric value to LCARS display precision.
 * @param {string|number|null} value - Raw state value
 * @param {string} [deviceClass=''] - HA device_class
 * @param {string} [unit=''] - unit_of_measurement
 * @returns {string} Formatted string or '—' for bad data
 */
export function formatNumber(value, deviceClass = '', unit = '') {
  if (value == null || value === '' || value === 'unavailable' || value === 'unknown') return '—';
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';

  // ── Device-class rules (highest priority) ──
  const DC_RULES = {
    temperature:                  1,   // 72.1°F
    humidity:                     0,   // 45%
    pressure:                     0,   // 1013 hPa
    pm25:                         0,   // 3 µg/m³
    pm10:                         0,
    pm1:                          0,
    carbon_dioxide:               0,   // 412 ppm
    volatile_organic_compounds:   0,   // 28 ppb
    aqi:                          0,   // 42
    battery:                      0,   // 87%
    power:                        0,   // 342 W
    energy:                       1,   // 14.2 kWh
    voltage:                      1,   // 120.1 V
    current:                      1,   // 2.3 A
    frequency:                    1,   // 60.0 Hz
    signal_strength:              0,   // -72 dBm
    illuminance:                  0,   // 450 lx
    speed:                        1,   // 5.2 mph
    wind_speed:                   1,
    precipitation:                2,   // 0.04 in
    precipitation_intensity:      2,
  };

  if (deviceClass in DC_RULES) {
    return _round(n, DC_RULES[deviceClass], unit);
  }

  // ── Unit-based rules (fallback) ──
  const U = unit.toLowerCase();
  if (U === 'w' || U === 'kw')    return _round(n, 0, unit);
  if (U === 'kwh' || U === 'wh')  return _round(n, 1, unit);
  if (U === '°f' || U === '°c')   return _round(n, 1, unit);
  if (U === '%')                   return _round(n, 0, unit);

  // ── Large-number abbreviation (storage, data rates) ──
  if (U === 'mb' || U === 'gb' || U === 'tb' || U === 'mb/s' || U === 'kb/s') {
    return _abbreviateDataSize(n, unit);
  }

  // ── Default: auto-precision ──
  // If the value has >1 decimal place, cap at 1
  return _round(n, n === Math.floor(n) ? 0 : 1, unit);
}
```

#### `_round(n, decimals, unit)` (private)

```js
function _round(n, decimals, unit) {
  // Large-watt shortening: 10000W → 10.0 kW
  if ((unit === 'W' || unit === 'w') && Math.abs(n) >= 10000) {
    return `${(n / 1000).toFixed(1)} kW`;
  }
  return decimals === 0 ? String(Math.round(n)) : n.toFixed(decimals);
}
```

#### `_abbreviateDataSize(n, unit)` (private)

```js
function _abbreviateDataSize(n, unit) {
  const u = unit.toUpperCase();
  // Promote MB → GB → TB
  if ((u === 'MB' || u === 'MB/S') && n >= 1000) {
    const suffix = u === 'MB/S' ? ' GB/S' : ' GB';
    return `${(n / 1000).toFixed(1)}${suffix}`;
  }
  if (u === 'GB' && n >= 1000) {
    return `${(n / 1000).toFixed(1)} TB`;
  }
  // Small values keep 1 decimal, large keep 0
  return n >= 100 ? String(Math.round(n)) : n.toFixed(1);
}
```

### 1.2 `formatStateValue(state)`

High-level formatter that handles non-numeric states, domain-aware display text, and delegates numeric values to `formatNumber()`. Fixes DATA-012, WESLEY-UX-003.

```js
/**
 * Format an entity state for LCARS display.
 * Returns { text, isIdle } where isIdle indicates a benign non-data state.
 * @param {Object|null} state - HA state object { state, attributes, entity_id }
 * @returns {{ text: string, isIdle: boolean }}
 */
export function formatStateValue(state) {
  if (!state) return { text: '—', isIdle: true };

  const s = state.state;
  const domain = state.entity_id?.split('.')[0] || '';
  const dc = state.attributes?.device_class || '';
  const unit = state.attributes?.unit_of_measurement || '';
  const cat = state.attributes?.entity_category || '';

  // ── Unknown/unavailable handling (domain-aware) ──
  if (s === 'unknown') {
    // Buttons are fire-and-forget — unknown is their resting state
    if (domain === 'button' || domain === 'input_button') {
      return { text: 'READY', isIdle: true };
    }
    // Scene, script, automation — ready to fire
    if (domain === 'scene' || domain === 'script' || domain === 'automation') {
      return { text: 'READY', isIdle: true };
    }
    // Diagnostic/config entities — not an emergency
    if (cat === 'diagnostic' || cat === 'config') {
      return { text: 'NO DATA', isIdle: true };
    }
    // Sensors — show NO DATA, not red UNKNOWN
    if (domain === 'sensor' || domain === 'binary_sensor') {
      return { text: 'NO DATA', isIdle: true };
    }
    return { text: 'UNKNOWN', isIdle: false };
  }

  if (s === 'unavailable') {
    if (cat === 'diagnostic' || cat === 'config') {
      return { text: 'OFFLINE', isIdle: true };
    }
    return { text: 'OFFLINE', isIdle: false };
  }

  // ── Numeric sensor formatting ──
  const parsed = Number(s);
  if (unit && Number.isFinite(parsed)) {
    const formatted = formatNumber(s, dc, unit);
    return { text: `${formatted} ${unit}`, isIdle: false };
  }

  // ── Non-numeric pass-through (ON, OFF, idle, etc.) ──
  return { text: s.toUpperCase(), isIdle: false };
}
```

### 1.3 `canonicalLabel(state, fallbackName)`

Maps device_class → canonical short label. Solves GEORDI-003, GEORDI-032, WESLEY-UX-010.

```js
/**
 * Canonical short label map.
 * Key: device_class. Value: LCARS-standard abbreviation.
 */
const CANONICAL_LABELS = {
  // ── Air Quality ──
  pm25:                           'PM₂.₅',
  pm10:                           'PM₁₀',
  pm1:                            'PM₁',
  carbon_dioxide:                 'CO₂',
  volatile_organic_compounds:     'VOC',
  aqi:                            'AQI',
  nitrogen_dioxide:               'NO₂',
  nitrogen_monoxide:              'NO',
  ozone:                          'O₃',
  sulphur_dioxide:                'SO₂',

  // ── Climate / Comfort ──
  temperature:                    'TEMP',
  humidity:                       'HUMIDITY',
  pressure:                       'PRESSURE',
  atmospheric_pressure:           'BARO',
  dew_point:                      'DEW PT',

  // ── Power / Energy ──
  power:                          'POWER',
  energy:                         'ENERGY',
  voltage:                        'VOLTAGE',
  current:                        'CURRENT',
  frequency:                      'FREQ',
  apparent_power:                 'VA',
  reactive_power:                 'VAR',
  power_factor:                   'PF',

  // ── Battery ──
  battery:                        'BATTERY',

  // ── Connectivity ──
  signal_strength:                'SIGNAL',

  // ── Illuminance ──
  illuminance:                    'LUX',

  // ── Weather ──
  wind_speed:                     'WIND',
  precipitation:                  'PRECIP',
  precipitation_intensity:        'RAIN RATE',

  // ── Pool Chemistry ──
  ph:                             'pH',
};

/**
 * Secondary label map for entity_id suffix patterns.
 * Used when device_class is empty/generic but entity_id is descriptive.
 */
const ENTITY_SUFFIX_LABELS = {
  calcium_hardness:               'CA HARD',
  cyanuric_acid:                  'CYA',
  free_chlorine:                  'FREE CL',
  total_alkalinity:               'TOTAL ALK',
  total_hardness:                 'TOTAL HARD',
  total_dissolved_solids:         'TDS',
  salt:                           'SALT',
  orp:                            'ORP',
  saturation_index:               'SAT INDEX',
};

/**
 * Get canonical short label for a sensor entity.
 * Priority: device_class map → entity_id suffix map → fallbackName.
 * @param {Object|null} state - HA state object
 * @param {string} [fallbackName=''] - Pre-shortened friendly name
 * @returns {string} Canonical label (uppercase)
 */
export function canonicalLabel(state, fallbackName = '') {
  const dc = state?.attributes?.device_class || '';

  // Direct device_class hit
  if (dc && CANONICAL_LABELS[dc]) return CANONICAL_LABELS[dc];

  // Entity ID suffix match (pool chemistry, etc.)
  const eid = state?.entity_id || '';
  const suffix = eid.split('.').pop() || '';
  for (const [pattern, label] of Object.entries(ENTITY_SUFFIX_LABELS)) {
    if (suffix.includes(pattern)) return label;
  }

  // Fallback to provided name
  return fallbackName;
}
```

---

## 2. `getStateColor()` Refinement

**File**: `lcars-color-utils.js`
**Fixes**: GEORDI-014, DATA-012, WESLEY-UX-003

### Current (broken)

```js
export function getStateColor(entityId, state) {
  const s = state?.state;
  if (s === 'unavailable' || s === 'unknown') return 'var(--lcars-alert)'; // ← ALL red
  ...
}
```

### Proposed

Replace the blanket `unknown/unavailable → red` with domain- and category-aware routing:

```js
export function getStateColor(entityId, state) {
  const s = state?.state;
  const domain = entityId.split('.')[0];
  const cat = state?.attributes?.entity_category || '';

  // ── Unknown / Unavailable (nuanced) ──
  if (s === 'unavailable' || s === 'unknown') {
    // Buttons/scripts are always "unknown" at rest — not an error
    if (domain === 'button' || domain === 'input_button'
        || domain === 'scene' || domain === 'script') {
      return 'var(--lcars-gray)';
    }
    // Diagnostic/config entities — informational, not alert
    if (cat === 'diagnostic' || cat === 'config') {
      return 'var(--lcars-gray)';
    }
    // Operational sensors — unavailable IS a genuine concern
    // but "unknown" on a newly-added sensor is just missing data
    if (s === 'unknown' && (domain === 'sensor' || domain === 'binary_sensor')) {
      return 'var(--lcars-disabled)';  // muted, not alarming
    }
    // Genuinely unavailable operational entity → alert (but softer)
    return 'var(--lcars-tomato)';
  }

  // ... rest of existing logic unchanged ...
}
```

### Color Semantics Summary

| State | Domain/Category | Color | Visual Meaning |
|-------|----------------|-------|----------------|
| `unknown` | button, input_button, scene, script | `--lcars-gray` | Idle/ready — expected |
| `unknown` | entity_category: diagnostic/config | `--lcars-gray` | No data — informational |
| `unknown` | sensor, binary_sensor | `--lcars-disabled` | Missing data — not critical |
| `unknown` | all other | `--lcars-tomato` | Genuine concern |
| `unavailable` | entity_category: diagnostic/config | `--lcars-gray` | Offline — informational |
| `unavailable` | button, scene, script | `--lcars-gray` | Offline — expected dormancy |
| `unavailable` | operational sensors, controls | `--lcars-tomato` | Device offline — real issue |

**Geordi review point**: Confirm `--lcars-disabled` vs `--lcars-gray` for the "unknown sensor" case. Both are muted, but `--lcars-disabled` has a specific opacity semantic in the existing palette. If they're the same CSS variable, we unify. If different, Geordi decides which reads better.

---

## 3. `_isOff()` Refinement in `lcars-base-panel.js`

Current `_isOff()` lumps unknown/unavailable with off/idle/standby. This is used for toggle state, camera offline detection, and conditional rendering. We should NOT change its boolean behavior (that would be a larger refactor), but panels that need to distinguish "off" from "unavailable" should use `formatStateValue()` or check state directly.

**No change to `_isOff()`** — it stays as-is. The P2 fix is at the display layer, not the control-flow layer.

---

## 4. Integration into Base Panel

### 4.1 New `_formatSensorValue()` Method

Add to `lcars-base-panel.js`:

```js
import { formatNumber, formatStateValue, canonicalLabel } from './lcars-format-utils.js';

/* ─── Sensor value formatting (P2: DATA-008, DATA-018, GEORDI-001) ─── */

_formatSensorValue(state) {
  return formatStateValue(state);
}

_formatSensorLabel(state, entity) {
  const shortName = this._friendlyName(state, entity);
  return canonicalLabel(state, shortName);
}
```

### 4.2 Adoption in Panel Renderers

Every panel that currently does this:

```js
const val = state.state;
const unit = state.attributes?.unit_of_measurement || '';
// ...
value="${val}${unit ? ' ' + unit : ''}"
```

Changes to:

```js
const { text } = this._formatSensorValue(state);
const label = this._formatSensorLabel(state, entity);
// ...
value="${text}"
```

**Affected panels** (each needs ~5 lines changed per sensor render block):

| Panel | File | Sensor render sites |
|-------|------|-------------------|
| Environment | `lcars-environment-panel.js` | `airQuality.map()`, `telemetry.map()`, `diagnostics.map()` |
| Life Support | `lcars-lifesupport-panel.js` | `_renderAmbientRow()`, `_renderSparklineTray()` |
| Climate | `lcars-climate-panel.js` | Fault sensors, diagnostic rows |
| Camera | `lcars-camera-panel.js` | `sensors.map()` in camera panel |
| Device (generic) | `lcars-homepage-card.js` | `_renderDevicePanel()` camera sensor rows |
| Power | `lcars-power-panel.js` | Already has own formatters — keep `_formatWatts()`, `_formatEnergy()` |
| Pool/Spa | `lcars-pool-spa-panel.js` | Chemistry readings, telemetry rows |

**Power panel exception**: The power panel's `_formatWatts()` and `_formatEnergy()` are domain-specific and already correct. They stay as-is. `formatNumber()` with `dc='power'` and `dc='energy'` produces the same output, so calling either path works — but no need to refactor working code.

### 4.3 Color Integration

Panels that call `this._getSensorIndicatorColor(state)` already route through `getStateColor()`. Once `getStateColor()` is updated per §2 above, all indicator dots automatically pick up the nuanced unknown/unavailable coloring. No additional per-panel changes needed.

---

## 5. Sparkline Label Fix (WESLEY-UX-010)

**File**: `lcars-lifesupport-panel.js` → `_renderSparklineTray()`

### Current (line ~375)

```js
const label = (dc || eid.split('.')[1]).toUpperCase().replace(/_/g, ' ');
```

Produces: `VOLATILE ORGANIC COMPOUNDS`, `PM25`, `CARBON DIOXIDE`, `TEMPERATURE`

### Proposed

```js
const label = canonicalLabel(entry.state, (dc || eid.split('.')[1]).toUpperCase().replace(/_/g, ' '));
```

Produces: `VOC`, `PM₂.₅`, `CO₂`, `TEMP`

One line changed. Imports `canonicalLabel` from `lcars-format-utils.js`.

---

## 6. WaterGuru / Pool Chemistry Labels (GEORDI-003)

The `ENTITY_SUFFIX_LABELS` map in `canonicalLabel()` handles these:

| Raw HA Label | After `_shortenName()` | After `canonicalLabel()` |
|-------------|----------------------|------------------------|
| Water Calcium Hardness | Calcium Hardness | **CA HARD** |
| Water Cyanuric Acid | Cyanuric Acid | **CYA** |
| Water Free Chlorine | Free Chlorine | **FREE CL** |
| Water Total Alkalinity | Total Alkalinity | **TOTAL ALK** |
| Water Total Hardness | Total Hardness | **TOTAL HARD** |
| Water pH | pH | **pH** |
| Water ORP | ORP | **ORP** |
| Water Saturation Index | Saturation Index | **SAT INDEX** |

These fit in the sensor row without truncation. The abbreviations are standard pool chemistry shorthand — any pool owner will recognize them.

---

## 7. CSS Considerations

### No new CSS required for formatting

The formatting changes are value-level (strings passed to existing components). The `<lcars-sensor-row>` component renders `value` as text content — shorter formatted values automatically fix overflow.

### One potential CSS addition: subscript rendering

The canonical labels use Unicode subscript characters (₂, ₅, ₁₀). These render correctly in all modern browsers. However, if Geordi prefers CSS-based subscripts:

```css
/* Optional: If Unicode subscripts render poorly at small sizes */
.sensor-label sub {
  font-size: 0.7em;
  vertical-align: sub;
}
```

**My recommendation**: Use Unicode subscripts (₂, ₅). They're simpler, require no HTML changes, and work in the `label` string attribute. HTML `<sub>` tags inside an attribute value would require property binding instead, which is more fragile.

**Geordi review point**: Confirm Unicode subscripts are acceptable for LCARS typography.

---

## 8. Bundle Impact Analysis

| Addition | Est. Minified Size |
|----------|--------------------|
| `lcars-format-utils.js` (`formatNumber`, `formatStateValue`, `canonicalLabel`, maps) | ~1.4 KiB |
| `getStateColor()` changes in `lcars-color-utils.js` | ~+0.2 KiB (net) |
| Base panel import + helper methods | ~+0.1 KiB |
| **Total** | **~1.7 KiB** |

Current bundle: 690 KiB. P2 adds <0.25% — negligible.

The `CANONICAL_LABELS` and `ENTITY_SUFFIX_LABELS` maps are small static objects that compress excellently with gzip/brotli (repetitive string patterns).

---

## 9. Creative Enhancement: LCARS-Authentic State Display

What if we tried... going beyond just fixing the bugs, and making the state display feel more Starfleet?

### 9.1 Trek-Authentic Idle States

Instead of raw `ON`/`OFF`/`IDLE`, map to LCARS-authentic display text:

| Raw State | LCARS Display | Color |
|-----------|--------------|-------|
| `unknown` (button) | `READY` | `--lcars-gray` |
| `unknown` (sensor) | `NO DATA` | `--lcars-disabled` |
| `unavailable` | `OFFLINE` | Contextual (gray or tomato) |
| `idle` | `STANDBY` | `--lcars-disabled` |
| `standby` | `STANDBY` | `--lcars-disabled` |
| `on` | `ACTIVE` | Domain-color |
| `off` | `INACTIVE` | `--lcars-disabled` |

**Trade-off**: This is a larger scope change. The P2 minimum is fixing `unknown` → `READY` for buttons and `NO DATA` for sensors. The full state-text mapping is a COULD-priority enhancement that could land in P2 or defer to a later pass.

**My recommendation**: Ship the minimum fixes (unknown/unavailable only) in P2. The full state vocabulary (`ACTIVE`/`INACTIVE`/`STANDBY`) is a polish item that can ride in a later pass — changing `ON` to `ACTIVE` across 50+ entities needs visual QA and could cause user confusion if done without a clear communication.

### 9.2 `em-dash` for Null/Missing Data

The `—` (em-dash) character is already used in the codebase for missing values. P2 standardizes this: `formatNumber()` returns `—` for all non-finite inputs. This is LCARS-correct — the gallery panels show `—` for absent readings, not blank space or `0`.

### 9.3 Sparkline Color Bands (WESLEY-UX-010 enhancement)

The sparkline tray could add a subtle colored underline matching each trace:

```css
.ls-sparkline-slot {
  border-bottom: 2px solid var(--sparkline-color, transparent);
}
```

Set via inline style: `style="--sparkline-color:${color}"`. This provides visual differentiation even without reading labels — the peach PM₂.₅ sparkline has a peach underline, the violet VOC has a violet underline.

**Trade-off**: Minimal CSS, high visual payoff. Recommend including in P2.

**Geordi review point**: Is the sparkline underline consistent with LCARS visual rules? It's a colored line under data — similar to the sensor indicator dots.

---

## 10. Test Verification Strategy

### Manual verification checklist (post-implementation):

1. **Raw decimal fix**: Navigate to Eric's Family Room, Outside, Garage — confirm all sensor values show ≤1 decimal place
2. **Button READY**: Check any room with TP-Link Kasa devices — "Restart" should show "READY" in gray, not "UNKNOWN" in red
3. **Sensor NO DATA**: Find any sensor in `unknown` state — should show "NO DATA" in muted color
4. **Unavailable diagnostic**: Check Nest Protect diagnostic rows — "OFFLINE" in gray, not "UNKNOWN" in red
5. **Sparkline labels**: Check Life Support panels — labels should read "PM₂.₅", "CO₂", "VOC", "TEMP", not truncated full names
6. **Pool chemistry**: Check Eric's Pool panel — labels should read "CA HARD", "CYA", "FREE CL", etc.
7. **Large number abbreviation**: Check camera Storage sensor — should show "2.6 GB", not "2613487.599616 MB"
8. **Power panel untouched**: Verify power panel `_formatWatts()` / `_formatEnergy()` still work correctly (regression check)
9. **Color semantics**: Confirm no false-red indicators on diagnostic entities across both homes

---

## 11. Implementation Order

1. **Create `lcars-format-utils.js`** — `formatNumber()`, `formatStateValue()`, `canonicalLabel()`, all maps
2. **Update `lcars-color-utils.js`** — Refine `getStateColor()` per §2
3. **Update `lcars-base-panel.js`** — Import, add `_formatSensorValue()`, `_formatSensorLabel()`
4. **Update `lcars-lifesupport-panel.js`** — Sparkline label fix (one line)
5. **Update panel renderers** — Environment, Climate, Camera, Pool, Device sensor rows
6. **Update `lcars-homepage-card.js`** — Camera panel inline sensor rendering
7. **Webpack build + smoke test**
8. **Visual QA on both homes**

---

## 12. Review Flags

### For Geordi (LCARS Compliance)
- [ ] Confirm `--lcars-disabled` vs `--lcars-gray` for muted unknown states (§2)
- [ ] Confirm Unicode subscripts (₂, ₅, ₁₀) in canonical labels are acceptable (§7)
- [ ] Review sparkline color-band underline proposal (§9.3)
- [ ] Verify sensor label column width is sufficient for canonical labels (e.g., "SAT INDEX" is 9 chars)
- [ ] Confirm `READY` / `NO DATA` / `OFFLINE` display text meets LCARS typography standards

### For Worf (Security)
- No external inputs, no DOM manipulation, no user-controlled strings reaching innerHTML
- All formatting is pure function on HA state objects — no injection surface
- No new dependencies

### For Data (Architecture)
- `formatNumber()` rounding rules align with HA's `sensor` platform precision conventions
- `canonicalLabel()` gracefully degrades: device_class → entity_id suffix → friendly_name fallback
- Power panel keeps its own formatters — no forced migration, but `formatNumber(val, 'power', 'W')` produces compatible output if they want to consolidate later
