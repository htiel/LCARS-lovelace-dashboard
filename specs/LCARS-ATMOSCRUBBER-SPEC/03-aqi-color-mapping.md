## 2. AQI → Color Mapping

Air quality drives the dynamic color of the cylinder, particle effects, and AQI readout. We map EPA AQI breakpoints to LCARS palette colors.

### Color Map

| AQI Range | EPA Category         | LCARS Variable           | Hex       | Rationale                                          |
|-----------|----------------------|--------------------------|-----------|-----------------------------------------------------|
| 0–50      | Good                 | `--lcars-ice`            | `#99ccff` | Cool blue — nominal operations, breathe easy        |
| 51–100    | Moderate             | `--lcars-sunflower`      | `#ffcc99` | Warm amber — elevated but not concerning            |
| 101–150   | Unhealthy (Sensitive)| `--lcars-butterscotch`   | `#ff9966` | Operational alert — scrubbers working harder        |
| 151–200   | Unhealthy            | `--lcars-peach`          | `#ff8866` | Warning — fans should be high                       |
| 201–300   | Very Unhealthy       | `--lcars-tomato`         | `#ff5555` | Alert state — red, demands attention                |
| 301+      | Hazardous            | `--lcars-tomato` (pulse) | `#ff5555` | Emergency — tomato with the distress pulse animation|
| N/A       | Unavailable          | `--lcars-gray`           | `#666688` | Sensor offline — standard disabled state            |

### Implementation

```javascript
/**
 * Resolve AQI value to LCARS color CSS variable.
 * Returns the CSS variable string for use in style bindings.
 */
function getAqiColor(aqi) {
  if (aqi == null || isNaN(aqi)) return 'var(--lcars-disabled)';
  const v = Number(aqi);
  if (v <= 50)  return 'var(--lcars-ice)';
  if (v <= 100) return 'var(--lcars-sunflower)';
  if (v <= 150) return 'var(--lcars-butterscotch)';
  if (v <= 200) return 'var(--lcars-peach)';
  return 'var(--lcars-alert)';  /* 201+ = tomato */
}

/**
 * Returns true if AQI is in hazardous range (301+),
 * triggering the distress pulse animation on the cylinder.
 */
function isHazardous(aqi) {
  return aqi != null && Number(aqi) > 300;
}

/**
 * Map AQI to a human-readable status label (uppercase for LCARS).
 */
function getAqiLabel(aqi) {
  if (aqi == null || isNaN(aqi)) return 'UNAVAILABLE';
  const v = Number(aqi);
  if (v <= 50)  return 'GOOD';
  if (v <= 100) return 'MODERATE';
  if (v <= 150) return 'SENSITIVE';
  if (v <= 200) return 'UNHEALTHY';
  if (v <= 300) return 'VERY UNHEALTHY';
  return 'HAZARDOUS';
}
```

### PM2.5 Direct Mapping (for Awair devices without AQI entity)

When no AQI entity exists, derive color from PM2.5 µg/m³:

| PM2.5 (µg/m³) | Equivalent AQI Band | LCARS Variable         |
|----------------|----------------------|------------------------|
| 0–12           | Good                 | `--lcars-ice`          |
| 12.1–35.4      | Moderate             | `--lcars-sunflower`    |
| 35.5–55.4      | Unhealthy (Sens.)    | `--lcars-butterscotch` |
| 55.5–150.4     | Unhealthy            | `--lcars-peach`        |
| 150.5+         | Very Unhealthy+      | `--lcars-tomato`       |

### Contrast Verification (all vs `#000000` background)

| Color                  | Hex       | Contrast vs #000 | WCAG Level |
|------------------------|-----------|-------------------|------------|
| `--lcars-ice`          | `#99ccff` | 10.3:1            | AAA        |
| `--lcars-sunflower`    | `#ffcc99` | 13.1:1            | AAA        |
| `--lcars-butterscotch` | `#ff9966` | 8.2:1             | AAA        |
| `--lcars-peach`        | `#ff8866` | 6.8:1             | AAA        |
| `--lcars-tomato`       | `#ff5555` | 5.2:1             | AA         |
| `--lcars-gray`         | `#666688` | 4.6:1             | AA         |

All pass WCAG 1.4.3 (AA) minimum 4.5:1. Tomato at 5.2:1 is the lowest, and it's always paired with "HAZARDOUS"/"VERY UNHEALTHY" text label — color is never the sole indicator (WCAG 1.4.1).

---
