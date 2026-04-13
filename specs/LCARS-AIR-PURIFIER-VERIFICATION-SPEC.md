# LCARS Atmoscrubber Panel — BlueAir Compatibility Verification

**Author**: Wesley Crusher (Creative Technology & Experimentation)  
**Date**: Stardate 2026.04.13  
**Status**: Verification / Compatibility Addendum  
**Priority**: MEDIUM (to-do item 8)  
**Panel Type**: Environment (Air Purifier + Air Quality)  
**Integration**: `ha_blueair` v1.47+ (HACS, 101+ stars, active maintenance)  
**Base Spec**: LCARS-ATMOSCRUBBER-SPEC.md  
**Target Device**: Blueair Blue Pure 311i Max

---

## 0. Purpose

This is an **Engineering Compatibility Report** — not a new panel spec. The atmoscrubber panel (LCARS-ATMOSCRUBBER-SPEC.md) was designed and implemented against VeSync Core400S / LAP-C601S-WUS air purifiers. This document verifies whether the existing panel handles BlueAir devices correctly and documents the minimal adaptations needed.

*"Can the Type-2 atmoscrubber handle the BlueAir atmospheric processor, or do we need a Type-2A variant?"*

**TL;DR**: The existing panel works with BlueAir devices with **zero code changes** for core rendering. Two minor quality-of-life improvements are recommended but not required.

---

## 1. Entity Mapping — VeSync vs BlueAir

### 1.1 Sensor Entities

| Panel Slot        | Device Class                          | VeSync (Core400S)                              | BlueAir (Blue Pure 311i Max)                     | Compatible? |
|-------------------|---------------------------------------|-------------------------------------------------|--------------------------------------------------|-------------|
| AQI score         | `aqi` / entity_id `*_air_quality`     | `sensor.*_air_quality` (text: excellent/good/moderate/bad) | **Not provided**                                 | ⚠️ Fallback  |
| PM2.5             | `pm25`                                | `sensor.*_pm2_5` (µg/m³)                        | `sensor.*_pm_2_5` (`SensorDeviceClass.PM25`, µg/m³) | ✅ Direct    |
| PM1               | `pm1`                                 | Not provided                                    | `sensor.*_pm_1` (`SensorDeviceClass.PM1`, µg/m³)    | ✅ New data  |
| PM10              | `pm10`                                | Not provided                                    | `sensor.*_pm_10` (`SensorDeviceClass.PM10`, µg/m³)  | ✅ New data  |
| CO₂               | `carbon_dioxide`                      | Not provided                                    | `sensor.*_co2` (`SensorDeviceClass.CO2`, ppm)        | ✅ New data  |
| VOC               | `volatile_organic_compounds_parts`    | Not provided                                    | `sensor.*_voc` (ppb)                                 | ✅ New data  |
| Temperature       | `temperature`                         | Not provided                                    | `sensor.*_temperature` (°C)                          | ✅ New data  |
| Humidity          | `humidity`                            | Not provided                                    | `sensor.*_humidity` (%)                              | ✅ New data  |
| Filter life       | `battery` (⚠️ see §3.1)              | `sensor.*_filter_life` (%, diagnostic)           | `sensor.*_filter_life` (`SensorDeviceClass.BATTERY`, %) | ⚠️ See §3.1 |

### 1.2 Control Entities

| Panel Slot        | Domain / Type              | VeSync (Core400S)                                 | BlueAir (Blue Pure 311i Max)                       | Compatible? |
|-------------------|----------------------------|----------------------------------------------------|-----------------------------------------------------|-------------|
| Fan on/off        | `fan`                      | `fan.core400s_*` (on/off, percentage)              | `fan.*_fan` (on/off, percentage)                     | ✅ Direct    |
| Fan speed %       | `fan` attribute            | `percentage` (0–100, mapped to low/med/high)       | `percentage` (0–100, mapped to `speed_count` steps)  | ✅ Direct    |
| Preset modes      | `fan` attribute            | `preset_modes`: `['auto', 'sleep', 'turbo', 'pet']` | `preset_modes`: `['auto', 'night']`                 | ✅ Dynamic   |
| Display toggle    | `switch`                   | `switch.*_display` (on/off)                         | **Not provided** (light entity instead — see §1.3)  | ⚠️ Different |
| Child lock        | `switch`                   | `switch.*_child_lock` (on/off)                      | `switch.*_child_lock` (on/off)                       | ✅ Direct    |
| Night light       | `switch` attribute         | `night_light` attribute on fan entity               | **Not provided** (BlueAir uses `light` entity)       | ⚠️ Different |

### 1.3 Additional BlueAir Entities (Not in VeSync)

| Entity                          | Domain          | Device Class              | Notes                                |
|---------------------------------|-----------------|---------------------------|--------------------------------------|
| `light.*_led` (if supported)    | `light`         | —                         | LED brightness control (display equivalent) |
| `switch.*_germ_shield`          | `switch`        | `switch`                  | UV-C germ shield toggle (311i Max may not have this) |
| `binary_sensor.*_online`        | `binary_sensor` | `connectivity`            | Device connectivity status           |
| `binary_sensor.*_filter_expired`| `binary_sensor` | `problem`                 | Boolean filter expiration alert      |

---

## 2. Feature Compatibility Matrix

| Atmoscrubber Feature              | VeSync Status | BlueAir Status  | Notes                                                 |
|-----------------------------------|---------------|-----------------|-------------------------------------------------------|
| **Auto-detection heuristic**      | ✅ Works       | ✅ Works         | BlueAir exposes `fan` domain + `pm25`/`pm10`/`pm1` sensors → triggers `PANEL_TYPE_ENVIRONMENT` (`aqSignals >= 1 && hasFan`) |
| **Entity partition**              | ✅ Works       | ✅ Works         | `_partitionEnvironmentEntities()` routes: `fan`→controls, `pm25`/`pm10`/`pm1`/`co2`/`voc`→airQuality, `temperature`/`humidity`→telemetry, `switch`→controls, category entities→diagnostics |
| **3-column grid layout**          | ✅ Works       | ✅ Works         | Fan entity present → `sensorOnly = false` → full 3-column mode |
| **AQI → color mapping**           | ✅ Direct AQI  | ⚠️ PM2.5 fallback | VeSync has `air_quality` score entity. BlueAir has no AQI entity — falls back to PM2.5 → `Math.min(300, pm25Val * 4)` estimation. This is the existing fallback path already in the code. |
| **Cylinder visualization**        | ✅ Works       | ✅ Works         | Color driven by `aqiEstimate`, speed by `fanPct`. Both available from BlueAir `fan` entity. |
| **Particle animation speed**      | ✅ Works       | ✅ Works         | `fanState.attributes.percentage` available from BlueAir fan entity. Speed mapping identical. |
| **Preset mode strip**             | ✅ 4 modes     | ✅ 2 modes       | BlueAir exposes `['auto', 'night']` vs VeSync's `['auto', 'sleep', 'turbo', 'pet']`. The strip renders dynamically from `fanState.attributes.preset_modes` — fewer buttons, still works. |
| **Fan on/off toggle**             | ✅ Works       | ✅ Works         | Both use `fan` domain. Same `_handleToggle()` / service calls. |
| **Switch controls**               | ✅ Works       | ✅ Works         | BlueAir's `switch.child_lock` renders as a control button. `switch.germ_shield` also renders if present. |
| **Filter life progress bar**      | ⚠️ Diagnostic   | ⚠️ See §3.1      | VeSync's filter_life has `entity_category: diagnostic`. BlueAir's has `device_class: battery` — see §3.1 for routing implications. |
| **Filter expired alert**          | ❌ Not available| ✅ Available     | BlueAir provides `binary_sensor.*_filter_expired` (`problem` class). Currently unused by the panel. |
| **Sparkline history**             | ✅ Works       | ✅ Works         | `recorder/statistics_during_period` works for any sensor entity. BlueAir sensors are `SensorStateClass.MEASUREMENT` → recorded by default. |
| **CO₂ threshold coloring**        | N/A for VeSync | ✅ Works         | BlueAir exposes CO₂. The `_getSensorIndicatorColor()` handles numeric sensors with data-accent. Spec's `getCo2Color()` thresholds would need to be wired in (see §4.2). |
| **Diagnostics section**           | ✅ Works       | ✅ Works         | Category entities (diagnostic/config) are fetched via `_getDeviceCategoryEntities()` and rendered below a divider. |
| **Sensor-only mode**              | ✅ Works       | N/A             | BlueAir has a fan entity → never enters sensor-only mode. Not relevant. |
| **Responsive mobile stacking**    | ✅ Works       | ✅ Works         | Layout is CSS grid — no entity-specific logic. |
| **Accessibility (ARIA/keyboard)** | ✅ Works       | ✅ Works         | Dynamic labels from entity state — no hardcoded VeSync strings. |

---

## 3. Identified Gaps

### 3.1 Filter Life Routing — `device_class: battery` Misclassification

**Problem**: BlueAir's `ha_blueair` integration registers the filter life sensor with `device_class=SensorDeviceClass.BATTERY`. This is a known upstream quirk — the integration reuses the battery device class for percentage-based "life remaining" sensors (filter, wick, water refresher).

**Impact on detection**: The `_getDevicePanelType()` heuristic checks for `device_class === 'battery' && unit === '%'` to trigger `PANEL_TYPE_BATTERY` (warp core panel). If a BlueAir device has filter_life + enough AQ sensors, the environment panel wins (because `aqSignals >= 2` is checked first, before the battery check). However, this filter_life sensor does increment `hasBattery` and `powerCount` counters unnecessarily.

**Impact on partition**: In `_partitionEnvironmentEntities()`, `device_class: battery` is NOT in `AQ_DEVICE_CLASSES`, so it falls through to the `telemetry` bucket. It renders as a generic sensor line — not in the diagnostics section where it logically belongs.

**Severity**: LOW. The sensor still renders; it's just in the wrong visual group.

**Fix** (optional, recommended):

```javascript
// In _partitionEnvironmentEntities(), before the AQ_DEVICE_CLASSES check:
// Route filter-life sensors (BlueAir uses device_class: battery for these)
if (dc === 'battery' && domain === 'sensor' &&
    /filter|wick/i.test(entry.entity.entity_id)) {
  // Treat as telemetry (will show below AQ sensors), not as a battery SOC
  telemetry.push(entry);
  continue;
}
```

Or better — wait for an upstream fix in `ha_blueair` to use a proper device class (there isn't a `filter` device class in HA, so `battery` is a reasonable hack). No action needed unless it causes confusion.

### 3.2 No AQI Entity — PM2.5 Fallback Quality

**Problem**: BlueAir provides no aggregate AQI entity. VeSync's `air_quality` sensor provides a text value (excellent/good/moderate/bad) that the panel matches via `AQ_ENTITY_SUFFIX_RE = /_(air_quality|score)$/`.

**Current behavior**: The panel already handles this. In `_renderEnvironmentPanel()`:
```javascript
const aqiEstimate = scoreVal != null && Number.isFinite(scoreVal) ? scoreVal
  : pm25Val != null && Number.isFinite(pm25Val) ? Math.min(300, pm25Val * 4)
  : null;
```

The `pm25Val * 4` approximation maps PM2.5 µg/m³ to an AQI-like range. This is a rough linear mapping that works acceptably for typical indoor readings (0–75 µg/m³ → 0–300 AQI estimate).

**Severity**: NONE — already handled. The header won't show a "score" badge when there's no score entity, and the cylinder color/hue derives from `aqiEstimate` which falls back to PM2.5.

### 3.3 Display/Light Entity Difference

**Problem**: VeSync exposes a `switch.*_display` entity for the LED display toggle. BlueAir exposes a `light.*_led` entity instead (with brightness control). The panel renders non-fan controls from `switchControls = controls.filter(e => e.domain !== 'fan')`, but `light` domain entities are NOT routed to `controls` — they'd be captured as `telemetry` or missed entirely.

**Severity**: LOW. The LED brightness control won't appear in the control column. Users can still control it via the entity's more-info dialog.

**Fix** (optional):

```javascript
// In _partitionEnvironmentEntities(), update the controls check:
if (['fan', 'switch', 'button', 'number', 'select', 'light'].includes(domain)) {
  controls.push(entry);
  continue;
}
```

Adding `light` to the control domains means BlueAir's LED entity renders as a toggle button in the controls column. Since `_handleToggle()` already supports `light` domain (it uses `homeassistant.toggle`), this works out of the box.

**Flag for Geordi**: Adding `light` to environment controls could affect other device types that have `light` entities grouped with environment sensors. Verify no false positives before shipping.

### 3.4 BlueAir Preset Mode Names

**Problem**: VeSync uses `['auto', 'sleep', 'turbo', 'pet']`. BlueAir uses `['auto', 'night']` (with `MODE_AUTO = "auto"` and `MODE_NIGHT = "night"` constants in the integration). The VeSync atmoscrubber spec labels one mode as "SLEEP" — BlueAir calls the equivalent "NIGHT".

**Severity**: NONE — the panel renders preset names dynamically from `fanState.attributes.preset_modes`. The button text will read "AUTO" and "NIGHT" for BlueAir, which is correct. No hardcoded mode names.

### 3.5 Additional Sensor Data (PM1, PM10, CO₂, VOC, Temperature, Humidity)

**Problem**: BlueAir exposes significantly more sensor data than VeSync. VeSync Core400S only provides PM2.5, air_quality score, and filter_life. BlueAir provides PM1, PM2.5, PM10, CO₂, VOC, temperature, and humidity.

**Severity**: NONE — this is a positive. All these device classes are in `AQ_DEVICE_CLASSES` (pm1, pm10, carbon_dioxide, volatile_organic_compounds_parts) or are standard telemetry (temperature, humidity). The partition logic routes them correctly. The sensor column will be fuller for BlueAir, which is a better user experience.

**Note**: `pm1` was added to `AQ_DEVICE_CLASSES` in the existing code. Confirmed present in the Set definition. ✅

### 3.6 Germ Shield Switch

**Problem**: Some BlueAir models expose `switch.*_germ_shield` for UV-C sanitization. This has no VeSync equivalent.

**Severity**: NONE. It routes to `controls` as a `switch` domain entity and renders as a toggle button alongside child lock. No special handling needed.

---

## 4. Recommended Improvements (Optional)

These are quality-of-life enhancements that would improve the BlueAir experience but are NOT required for basic compatibility.

### 4.1 EPA-Accurate PM2.5 → AQI Conversion

The current `pm25Val * 4` linear approximation diverges from EPA breakpoints at higher concentrations. A more accurate piecewise mapping:

```javascript
/**
 * Convert PM2.5 µg/m³ to EPA AQI using official breakpoint table.
 * EPA Technical Assistance Document for the Reporting of Daily Air Quality, 2024.
 */
function pm25ToAqi(pm25) {
  if (pm25 == null || isNaN(pm25)) return null;
  const c = Math.max(0, Number(pm25));
  // EPA breakpoints: [Clow, Chigh, Ilow, Ihigh]
  const bp = [
    [0,    12,    0,   50],
    [12.1, 35.4,  51,  100],
    [35.5, 55.4,  101, 150],
    [55.5, 150.4, 151, 200],
    [150.5,250.4, 201, 300],
    [250.5,350.4, 301, 400],
    [350.5,500.4, 401, 500],
  ];
  for (const [Cl, Ch, Il, Ih] of bp) {
    if (c <= Ch) return Math.round(((Ih - Il) / (Ch - Cl)) * (c - Cl) + Il);
  }
  return 500; // Beyond AQI scale
}
```

**Trade-off**: +15 lines of code vs more accurate color mapping. The current `*4` approximation gives AQI 48 for PM2.5 12µg/m³ (EPA says 50) — close enough for color bucket selection. The divergence matters more at higher readings: PM2.5 75µg/m³ → current estimate 300 (red), EPA AQI = ~161 (orange). This could cause false red alerts.

**Recommendation**: Implement if users report alarmist colors.

### 4.2 CO₂ Sensor Color Enhancement

The atmoscrubber spec defines CO₂ threshold coloring (§5, `getCo2Color()`), but the current implementation uses `_getSensorIndicatorColor()` which returns a generic `var(--lcars-data-accent)` for numeric sensors. To apply the spec's CO₂-specific coloring:

```javascript
// In _getSensorIndicatorColor(), add before the generic numeric fallback:
if (deviceClass === 'carbon_dioxide') {
  const v = parseFloat(val);
  if (!isNaN(v)) {
    if (v <= 800)  return 'var(--lcars-data-accent)';
    if (v <= 1200) return 'var(--lcars-sunflower)';
    if (v <= 2000) return 'var(--lcars-butterscotch)';
    return 'var(--lcars-tomato)';
  }
}
```

**Trade-off**: +7 lines. Benefits both BlueAir (which has CO₂) and any future device with a CO₂ sensor (SwitchBot WoTHPc for item 9). Low risk.

**Recommendation**: Implement. This was specced in the atmoscrubber doc but not yet implemented.

### 4.3 Filter Expired Binary Sensor Alert

BlueAir's `binary_sensor.*_filter_expired` (`device_class: problem`) could trigger a visual alert on the filter progress bar — changing it to `--lcars-tomato` when the binary sensor is `on`.

**Trade-off**: Requires correlating a binary_sensor with the filter life sensor on the same device. Adds complexity for a marginal improvement (filter % at 0 already implies expiration).

**Recommendation**: Skip for now. Filter life % reaching 0 is sufficient.

---

## 5. Configuration YAML — BlueAir Device

No special YAML configuration is needed. The atmoscrubber panel auto-discovers devices via the `_getDevicePanelType()` heuristic. For a Blueair Blue Pure 311i Max, HA will expose entities under the device registry, and the environment panel triggers when it detects `fan` domain + AQ sensors.

### Expected Entity Layout (Blue Pure 311i Max)

```yaml
# Auto-discovered by LCARS dashboard — no manual config required
# These entities are created by ha_blueair integration

# Fan (primary control)
fan.blueair_311i_max_fan:
  state: "on"
  attributes:
    percentage: 67
    preset_mode: null          # null when manual speed, "auto" or "night" when in preset
    preset_modes: ["auto", "night"]
    speed_count: 3             # 311i Max has 3 speed levels

# Air Quality Sensors (→ airQuality partition bucket)
sensor.blueair_311i_max_pm_2_5:
  device_class: pm25
  unit_of_measurement: "µg/m³"

sensor.blueair_311i_max_pm_1:
  device_class: pm1
  unit_of_measurement: "µg/m³"

sensor.blueair_311i_max_pm_10:
  device_class: pm10
  unit_of_measurement: "µg/m³"

sensor.blueair_311i_max_co2:
  device_class: carbon_dioxide
  unit_of_measurement: "ppm"

sensor.blueair_311i_max_voc:
  device_class: volatile_organic_compounds_parts
  unit_of_measurement: "ppb"

# Telemetry Sensors (→ telemetry partition bucket)
sensor.blueair_311i_max_temperature:
  device_class: temperature
  unit_of_measurement: "°C"

sensor.blueair_311i_max_humidity:
  device_class: humidity
  unit_of_measurement: "%"

# Filter (→ telemetry or diagnostics, depending on entity_category)
sensor.blueair_311i_max_filter_life:
  device_class: battery       # ⚠️ upstream quirk — treated as percentage sensor
  unit_of_measurement: "%"

# Switches (→ controls partition bucket)
switch.blueair_311i_max_child_lock:
  device_class: switch

switch.blueair_311i_max_germ_shield:   # if supported by model
  device_class: switch

# Binary Sensors (→ sensors/diagnostics)
binary_sensor.blueair_311i_max_online:
  device_class: connectivity

binary_sensor.blueair_311i_max_filter_expired:
  device_class: problem

# Light (→ currently NOT routed to controls — see §3.3)
light.blueair_311i_max_led:
  # LED brightness control
```

### Panel Detection Path

```
_getDevicePanelType() scans device entities:
  → pm25 (device_class in AQ_DEVICE_CLASSES) → aqSignals++     (1)
  → pm1  (device_class in AQ_DEVICE_CLASSES) → aqSignals++     (2)
  → pm10 (device_class in AQ_DEVICE_CLASSES) → aqSignals++     (3)
  → co2  (device_class in AQ_DEVICE_CLASSES) → aqSignals++     (4)
  → voc  (device_class in AQ_DEVICE_CLASSES) → aqSignals++     (5)
  → fan  (domain === 'fan')                  → hasFan = true

  aqSignals (5) >= 2 → return PANEL_TYPE_ENVIRONMENT  ✅
```

Detection is unambiguous. BlueAir devices will always trigger the environment panel.

---

## 6. Visual Comparison — Expected Rendering

### BlueAir Panel (Expected)

```
┌──────────────────────────────────────────────────────────┐
│  BLUEAIR 311I MAX                    8                   │  ← header (PM2.5 as score fallback)
├──────────────┬──────────┬────────────────────────────────┤
│  PM2.5  8µg  │ ┌──────┐ │  🔁 FAN: ON 67%               │
│  PM1    3µg  │ │░░░░░░│ │                                │
│  PM10  12µg  │ │░▒░░▒░│ │  MODE                          │
│  CO₂   580   │ │░░░▒░░│ │  ○ AUTO  ○ NIGHT               │  ← only 2 presets
│  VOC   120   │ │▒░░░░░│ │                                │
│  TEMP  22.1° │ │░░▒░░░│ │  🔒 CHILD LOCK: OFF            │
│  HUM   45%   │ │░░░░▒░│ │  🛡️ GERM SHIELD: ON            │  ← extra BlueAir control
│              │ │░▒░░░░│ │                                │
│  FILTER  72% │ └──────┘ │                                │
├──────────────┴──────────┴────────────────────────────────┤
│  ─── PM2.5 ──  ─── PM1 ──  ─── CO₂ ──  ─── VOC ───────│  ← sparklines
│  ╱╲  ╱╲       ╱╲  ╱╲      ╱╲  ╱╲       ╱╲  ╱╲         │
│ ╱  ╲╱  ╲╱   ╱  ╲╱  ╲    ╱  ╲╱  ╲╱   ╱  ╲╱  ╲╱        │
└──────────────────────────────────────────────────────────┘
```

### VeSync Panel (Current — for comparison)

```
┌──────────────────────────────────────────────────────────┐
│  CORE 400S                  42  (score entity)           │  ← header (air_quality score)
├──────────────┬──────────┬────────────────────────────────┤
│  PM2.5  8µg  │ ┌──────┐ │  🔁 FAN: ON 50%               │
│              │ │░░░░░░│ │                                │
│              │ │░▒░░▒░│ │  MODE                          │
│              │ │░░░▒░░│ │  ● AUTO ○ SLEEP ○ TURBO ○ PET │  ← 4 presets
│              │ │▒░░░░░│ │                                │
│              │ │░░▒░░░│ │  🔒 CHILD LOCK: OFF            │
│              │ │░░░░▒░│ │  📺 DISPLAY: ON                 │
│              │ │░▒░░░░│ │                                │
│  FILTER  78% │ └──────┘ │                                │
├──────────────┴──────────┴────────────────────────────────┤
│  ─── PM2.5 ──────────────────────────────────────────────│  ← one sparkline only
│  ╱╲  ╱╲                                                  │
│ ╱  ╲╱  ╲╱                                                │
└──────────────────────────────────────────────────────────┘
```

Key differences:
- BlueAir has **6 more sensor rows** (PM1, PM10, CO₂, VOC, temp, humidity) — richer telemetry
- BlueAir has **2 preset modes** instead of 4 — narrower option strip
- BlueAir has **4 sparklines** instead of 1 — more history context
- No AQI score badge in header — falls back to PM2.5 numeric display
- Germ shield switch appears as additional control (if model supports it)

---

## 7. Testing Checklist

### 7.1 Detection & Rendering

| # | Test Case                                          | Expected Result                                    | Pass? |
|---|----------------------------------------------------|----------------------------------------------------|-------|
| 1 | BlueAir device appears in an area                  | Environment panel renders (not generic/camera/battery) | ☐    |
| 2 | Panel shows 3-column layout (sensors/cylinder/controls) | Not sensor-only mode (fan entity present)      | ☐    |
| 3 | All BlueAir sensors appear in left column          | PM2.5, PM1, PM10, CO₂, VOC, Temp, Humidity visible | ☐    |
| 4 | Fan toggle button appears in right column          | Shows fan state (on/off) + percentage              | ☐    |
| 5 | Preset mode strip shows `auto` and `night`         | Two buttons, correct one highlighted               | ☐    |
| 6 | Child lock switch renders in controls              | Toggle button with current state                   | ☐    |
| 7 | Germ shield switch renders (if model supports it)  | Toggle button, or absent if not supported          | ☐    |
| 8 | Filter life sensor renders in sensor column        | Shows percentage value                             | ☐    |

### 7.2 Cylinder Visualization

| # | Test Case                                          | Expected Result                                    | Pass? |
|---|----------------------------------------------------|----------------------------------------------------|-------|
| 9 | Cylinder color reflects air quality (PM2.5-based)  | Blue(good) → amber → orange → red as PM2.5 rises  | ☐    |
| 10| Particle animation speed tracks fan percentage     | Faster particles at higher fan speed               | ☐    |
| 11| Fan off → cylinder shows idle state                | Slow ambient particle drift, `scrubber-idle` class | ☐    |
| 12| PM2.5 value shown inside cylinder                  | Numeric readout centered in cylinder               | ☐    |

### 7.3 Controls & Interactions

| # | Test Case                                          | Expected Result                                    | Pass? |
|---|----------------------------------------------------|----------------------------------------------------|-------|
| 13| Tap fan toggle → fan turns on/off                  | `fan.toggle` service called, state updates         | ☐    |
| 14| Tap "auto" preset → fan goes to auto mode          | `fan.set_preset_mode` called with `auto`           | ☐    |
| 15| Tap "night" preset → fan goes to night mode        | `fan.set_preset_mode` called with `night`          | ☐    |
| 16| Tap child lock → toggle state                      | `switch.toggle` service called                     | ☐    |
| 17| Tap any sensor line → more-info dialog opens       | Standard HA entity dialog with history             | ☐    |

### 7.4 Sparklines & History

| # | Test Case                                          | Expected Result                                    | Pass? |
|---|----------------------------------------------------|----------------------------------------------------|-------|
| 18| Sparklines render for PM2.5, PM1, CO₂, VOC        | 24h trend traces with correct colors               | ☐    |
| 19| Sparklines update after cache expiry (5 min)       | New data fetched, traces updated                   | ☐    |
| 20| Missing history (new device) → sparklines hidden   | No broken SVG or empty boxes                       | ☐    |

### 7.5 Edge Cases

| # | Test Case                                          | Expected Result                                    | Pass? |
|---|----------------------------------------------------|----------------------------------------------------|-------|
| 21| BlueAir device offline (`binary_sensor.online` off)| Sensors show `unavailable`, indicator tomato        | ☐    |
| 22| Filter expired (`binary_sensor.filter_expired` on) | Filter life shows low/critical state               | ☐    |
| 23| Preset mode `null` (manual speed, no preset active)| No preset button highlighted                       | ☐    |
| 24| Both VeSync AND BlueAir in same area               | Two separate environment panels render              | ☐    |
| 25| Mobile viewport (<768px)                           | Panel stacks vertically per responsive CSS          | ☐    |

---

## 8. Verdict

### Compatibility: ✅ COMPATIBLE — No code changes required

The existing atmoscrubber panel handles BlueAir devices **out of the box** because:

1. **Detection** is entity-driven (device classes + domain), not integration-specific
2. **Controls** use the standard `fan` domain service calls (`fan.toggle`, `fan.set_preset_mode`)
3. **Preset modes** render dynamically from entity attributes — no hardcoded mode names
4. **PM2.5 → AQI fallback** is already implemented for the Awair (sensor-only) path
5. **Sensor column** renders any entity with a recognized `device_class` — more sensors = richer panel

### Recommended Follow-ups (Priority Order)

| Priority | Change | Effort | Benefit |
|----------|--------|--------|---------|
| LOW      | Add `light` to environment controls routing (§3.3) | 1 line | BlueAir LED control appears in panel |
| LOW      | Implement CO₂ threshold coloring (§4.2) | 7 lines | Better CO₂ alert visibility (benefits all integrations) |
| LOW      | EPA-accurate PM2.5→AQI conversion (§4.1) | 15 lines | More accurate cylinder color at high PM2.5 |
| SKIP     | Filter expired binary sensor alert (§4.3) | ~20 lines | Marginal — filter % at 0 is sufficient |

### No Type-2A Variant Needed

The Type-2 atmoscrubber handles the BlueAir atmospheric processor as-is. The entity-driven architecture (entity partitioning by device_class and domain, dynamic preset rendering, PM2.5 fallback for AQI) means the panel is already integration-agnostic. BlueAir is actually a *better* data source than VeSync — more sensors, proper device classes, and standard `fan` domain patterns.

*"The best-designed systems are the ones that don't need modification when you plug in new hardware. That's not luck — that's good engineering."*  
— La Forge, Environmental Systems Control
