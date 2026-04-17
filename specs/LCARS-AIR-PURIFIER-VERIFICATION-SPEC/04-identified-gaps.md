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
