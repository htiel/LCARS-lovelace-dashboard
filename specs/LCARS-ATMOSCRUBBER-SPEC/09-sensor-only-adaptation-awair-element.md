## 8. Sensor-Only Adaptation (Awair Element)

The Awair Element has sensors but no fan entity and no controls. The panel must gracefully adapt.

### Grid Change: 2-Column Mode

```css
/* When no controls exist, collapse to 2 columns */
.lcars-atmoscrubber-panel.sensor-only {
  grid-template-areas:
    "header     header"
    "sensors    core"
    "sparklines sparklines";
  grid-template-columns: minmax(8rem, 1.2fr) minmax(5rem, 6rem);
}
```

### Behavioral Differences

| Aspect                | Purifier (VeSync)            | Sensor-Only (Awair)                     |
|-----------------------|------------------------------|-----------------------------------------|
| Grid columns          | 3 (sensors / core / controls)| 2 (sensors / core)                      |
| Controls column       | Preset mode, toggles, filter | **Hidden** (empty, not rendered)        |
| Cylinder fill         | Fan speed %                  | Inverted AQI % (good=high, bad=low)    |
| Particle speed        | Tied to fan speed %          | Slow ambient drift (6s)                 |
| Particle color        | AQI color                    | AQI color                               |
| AQI source            | `device_class: aqi` entity   | Derived from PM2.5 if no AQI entity    |
| Header badge          | `AQI: ${value} ${label}`     | `AQI: ${value} ${label}`               |
| Sparklines            | PM2.5 + AQI (if available)   | PM2.5 + CO₂ + VOC + Humidity           |

### Awair Cylinder Fill Logic

```javascript
/**
 * For sensor-only devices, fill the cylinder inversely from AQI:
 * AQI 0 (perfect) = 100% fill (scrubber fully effective)
 * AQI 300+ (hazardous) = ~5% fill (scrubber overwhelmed)
 */
function getSensorOnlyFill(aqi) {
  if (aqi == null || isNaN(aqi)) return 50;
  const v = Math.min(300, Math.max(0, Number(aqi)));
  return Math.round(100 - (v / 300) * 95);
}
```

### Detection Logic

```javascript
/**
 * Determine if this is a sensor-only device (no fan entity).
 */
function isSensorOnly(entities) {
  return !entities.some(e => {
    const domain = e.entity_id.split('.')[0];
    return domain === 'fan';
  });
}
```

---
