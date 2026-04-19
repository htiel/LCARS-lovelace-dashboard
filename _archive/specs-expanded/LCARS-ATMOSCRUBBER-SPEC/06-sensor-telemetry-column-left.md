## 5. Sensor Telemetry Column (Left)

### Entity Ordering (Top to Bottom)

The sensors display in a fixed, prioritized order — the most actionable information at the top:

| Row | Sensor            | Device Class / Entity ID Pattern          | Unit    | Color                            |
|-----|-------------------|-------------------------------------------|---------|----------------------------------|
| 1   | AQI               | `device_class: aqi`                       | —       | Dynamic `--atmos-quality-color`  |
| 2   | PM2.5             | `device_class: pm25`                      | µg/m³   | Dynamic `--atmos-quality-color`  |
| 3   | CO₂               | `device_class: carbon_dioxide`            | ppm     | `var(--lcars-data-accent)`       |
| 4   | VOC               | `device_class: volatile_organic_compounds`| ppb/idx | `var(--lcars-data-accent)`       |
| 5   | Temperature       | `device_class: temperature`               | °C/°F   | `var(--lcars-sunflower)`         |
| 6   | Humidity          | `device_class: humidity`                  | %       | `var(--lcars-data-accent)`       |
| —   | *(divider)*       |                                           |         |                                  |
| 7   | Filter Lifetime   | `entity_category: diagnostic`, filter     | %       | `var(--lcars-data-accent)`       |
| 8   | Firmware          | `entity_category: diagnostic`, firmware   | ver.    | `var(--lcars-disabled)`          |

### CSS

```css
.atmos-sensors {
  grid-area: sensors;
  display: flex;
  flex-direction: column;
  gap: var(--lcars-gap);
  padding: 0.25rem 0;
  align-self: start;
}

.atmos-sensors-divider {
  height: 1px;
  background: var(--lcars-disabled);
  margin: 0.25rem 0;
  opacity: 0.5;
}

.atmos-diag-label {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-disabled);
  text-transform: uppercase;
  padding: 0.25rem 0.5rem 0;
  letter-spacing: 0.05em;
}
```

Sensor lines reuse `.device-sensor-line` from the Device Panel Spec §3.3. The diagnostic section is separated by a thin divider and a dim "DIAGNOSTICS" sub-label in `--lcars-disabled` gray — this follows the LCARS pattern of suppressing secondary information to keep focus on primary readouts (Bracer Jack: "empty space is beautiful").

### CO₂ Threshold Coloring

CO₂ gets its own threshold coloring since it's a critical indoor air quality metric:

| CO₂ (ppm)  | Color                     | Rationale                    |
|------------|---------------------------|------------------------------|
| 0–800      | `var(--lcars-data-accent)` | Normal — standard blue readout|
| 801–1200   | `var(--lcars-sunflower)`   | Elevated — warm amber         |
| 1201–2000  | `var(--lcars-butterscotch)`| High — operational alert      |
| 2001+      | `var(--lcars-alert)`       | Danger — immediate ventilation|

```javascript
function getCo2Color(co2) {
  if (co2 == null || isNaN(co2)) return 'var(--lcars-disabled)';
  const v = Number(co2);
  if (v <= 800)  return 'var(--lcars-data-accent)';
  if (v <= 1200) return 'var(--lcars-sunflower)';
  if (v <= 2000) return 'var(--lcars-butterscotch)';
  return 'var(--lcars-alert)';
}
```

---
