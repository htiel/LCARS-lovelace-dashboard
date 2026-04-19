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
// Reconciled 3-tier model — matches getCo2Color() in lcars-color-utils.js
if (deviceClass === 'carbon_dioxide') {
  const v = parseFloat(val);
  if (!isNaN(v)) {
    if (v <= 800)  return 'var(--lcars-ice)';        // nominal
    if (v <= 1200) return 'var(--lcars-sunflower)';   // elevated
    return 'var(--lcars-tomato)';                     // high
  }
}
```

> **v4.14.0 reconciliation**: The original 4-tier model (data-accent / sunflower / butterscotch / tomato) was collapsed to 3 tiers (ice / sunflower / tomato) per Geordi's design review. The `butterscotch` tier at 1200–2000 ppm was removed — at >1200 ppm the alert should be immediately visible. This matches `getCo2Color()` in `lcars-color-utils.js` and the v4.13.0 CSS data-attribute classes. All three colors pass WCAG AA contrast against #000 (ice 10.3:1, sunflower 13.1:1, tomato 5.2:1).

**Trade-off**: +7 lines. Benefits both BlueAir (which has CO₂) and any future device with a CO₂ sensor (SwitchBot WoTHPc for item 9). Low risk.

**Recommendation**: Implement. This was specced in the atmoscrubber doc but not yet implemented.

### 4.3 Filter Expired Binary Sensor Alert

BlueAir's `binary_sensor.*_filter_expired` (`device_class: problem`) could trigger a visual alert on the filter progress bar — changing it to `--lcars-tomato` when the binary sensor is `on`.

**Trade-off**: Requires correlating a binary_sensor with the filter life sensor on the same device. Adds complexity for a marginal improvement (filter % at 0 already implies expiration).

**Recommendation**: Skip for now. Filter life % reaching 0 is sufficient.

---
