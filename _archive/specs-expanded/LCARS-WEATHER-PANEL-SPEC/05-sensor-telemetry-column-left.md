## 4. Sensor Telemetry Column (Left)

### Entity Ordering (Top to Bottom)

Sensors display in a fixed, prioritized order — most immediate atmospheric data at the top:

| Row | Sensor             | Source                                           | Unit    | Color                              |
|-----|--------------------|--------------------------------------------------|---------|------------------------------------|
| 1   | Feels Like         | Weather attr `apparent_temperature` or sensor    | °F/°C   | Dynamic `--weather-condition-color` |
| —   | *(divider)*        |                                                  |         |                                    |
| 2   | Humidity           | Weather attr `humidity` or sensor                | %       | `var(--lcars-data-accent)`         |
| 3   | Dew Point          | Weather attr `dew_point` or sensor               | °F/°C   | `var(--lcars-data-accent)`         |
| —   | *(divider)*        |                                                  |         |                                    |
| 4   | Pressure           | Weather attr `pressure` or sensor                | inHg/hPa| `var(--lcars-data-accent)`         |
| 5   | Pressure Trend     | Linked `sensor.*_pressure_trend`                 | ↑↓─     | Dynamic per trend direction        |
| —   | *(divider)*        |                                                  |         |                                    |
| 6   | UV Index           | Weather attr `uv_index` or sensor                | index   | Dynamic per UV level               |
| 7   | Solar Radiation    | Linked `sensor.*_irradiance`                     | W/m²    | `var(--lcars-data-accent)`         |
| 8   | Visibility         | Weather attr `visibility`                        | mi/km   | `var(--lcars-data-accent)`         |
| —   | *(divider)*        |                                                  |         |                                    |
| 9   | Lightning Count    | Linked `sensor.*_lightning_count`                | strikes | `var(--lcars-gold)`                |
| 10  | Lightning Distance | Linked `sensor.*_lightning_average_distance`     | mi/km   | `var(--lcars-gold)`                |
| —   | *(divider)*        |                                                  |         |                                    |
| 11  | Rain Today         | Linked `sensor.*_rain_today`                     | in/mm   | `var(--lcars-sky)`                 |
| 12  | Rain Intensity     | Linked `sensor.*_rain_intensity`                 | in/h    | `var(--lcars-sky)`                 |

### UV Index Color Thresholds

The UV index readout changes color based on severity — visual triage:

| UV Index | Risk Label  | Color                     | Hex       |
|----------|-------------|---------------------------|-----------|
| 0–2      | LOW         | `var(--lcars-ice)`        | `#99ccff` |
| 3–5      | MODERATE    | `var(--lcars-sunflower)`  | `#ffcc99` |
| 6–7      | HIGH        | `var(--lcars-gold)`       | `#ffaa00` |
| 8–10     | VERY HIGH   | `var(--lcars-orange)`     | `#ff8800` |
| 11+      | EXTREME     | `var(--lcars-tomato)`     | `#ff5555` |

### Pressure Trend Indicator

```javascript
/**
 * Resolve pressure trend string to arrow indicator.
 * Davis Vantage and WeatherFlow report trend as text or numeric.
 */
function getPressureTrendArrow(trend) {
  if (trend == null) return '';
  const t = String(trend).toLowerCase();
  if (t === 'rising' || t === 'rapidly rising' || Number(trend) > 0) return '↑';
  if (t === 'falling' || t === 'rapidly falling' || Number(trend) < 0) return '↓';
  if (t === 'steady' || Number(trend) === 0) return '─';
  return '';
}

/**
 * Resolve pressure trend to color.
 * Rising = good weather coming, falling = storm potential.
 */
function getPressureTrendColor(trend) {
  const t = String(trend).toLowerCase();
  if (t === 'rising' || t === 'rapidly rising') return 'var(--lcars-ice)';
  if (t === 'falling' || t === 'rapidly falling') return 'var(--lcars-gold)';
  return 'var(--lcars-data-accent)';
}

/**
 * Resolve UV index to risk label and color.
 */
function getUVRisk(uvIndex) {
  const uv = Number(uvIndex);
  if (isNaN(uv) || uv < 0) return { label: '—', color: 'var(--lcars-disabled)' };
  if (uv <= 2)  return { label: 'LOW',       color: 'var(--lcars-ice)' };
  if (uv <= 5)  return { label: 'MODERATE',  color: 'var(--lcars-sunflower)' };
  if (uv <= 7)  return { label: 'HIGH',      color: 'var(--lcars-gold)' };
  if (uv <= 10) return { label: 'VERY HIGH', color: 'var(--lcars-orange)' };
  return           { label: 'EXTREME',   color: 'var(--lcars-tomato)' };
}
```

### CSS

```css
.weather-sensors {
  grid-area: sensors;
  display: flex;
  flex-direction: column;
  gap: var(--lcars-gap);
  padding: 0.25rem 0;
  align-self: start;
}

.weather-sensors-divider {
  height: 1px;
  background: var(--lcars-disabled);
  margin: 0.25rem 0;
  opacity: 0.5;
}

.weather-section-label {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-disabled);
  text-transform: uppercase;
  padding: 0.25rem 0.5rem 0;
  letter-spacing: 0.05em;
}
```

Sensor lines reuse `.device-sensor-line` from the Device Panel Spec §3.3. Lightning and rain sections are conditionally rendered — hidden when no data is available (WeatherFlow Tempest provides lightning; Davis Vantage does not natively). The telemetry column is the "Science station" sidebar: scrollable atmospheric readouts.

---
