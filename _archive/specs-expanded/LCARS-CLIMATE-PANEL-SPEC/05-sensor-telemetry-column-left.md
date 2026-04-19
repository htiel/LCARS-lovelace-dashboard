## 4. Sensor Telemetry Column (Left)

### Entity Ordering (Top to Bottom)

Sensors display in a fixed, prioritized order — the most actionable information at the top:

| Row | Sensor            | Source Attribute / Entity                  | Unit    | Color                              |
|-----|-------------------|--------------------------------------------|---------|------------------------------------|
| 1   | Current Temp      | `current_temperature` attr                 | °F/°C   | Dynamic `--climate-action-color`   |
| 2   | Target Temp       | `temperature` attr (single setpoint)       | °F/°C   | `var(--lcars-gold)`                |
| 2a  | Target Low        | `target_temp_low` attr (dual setpoint)     | °F/°C   | `var(--lcars-butterscotch)`        |
| 2b  | Target High       | `target_temp_high` attr (dual setpoint)    | °F/°C   | `var(--lcars-ice)`                 |
| 3   | Humidity          | `current_humidity` attr or linked sensor   | %       | `var(--lcars-data-accent)`         |
| —   | *(divider)*       |                                            |         |                                    |
| 4   | HVAC Mode         | `state` (climate entity)                   | —       | Dynamic per-mode color             |
| 5   | Fan Mode          | `fan_mode` attr                            | —       | `var(--lcars-data-accent)`         |
| 6   | Preset Mode       | `preset_mode` attr                         | —       | `var(--lcars-data-accent)`         |
| —   | *(divider)*       |                                            |         |                                    |
| 7   | Faults            | Linked `binary_sensor` entities            | —       | `var(--lcars-tomato)` or `--lcars-gray` |

### CSS

```css
.climate-sensors {
  grid-area: sensors;
  display: flex;
  flex-direction: column;
  gap: var(--lcars-gap);
  padding: 0.25rem 0;
  align-self: start;
}

.climate-sensors-divider {
  height: 1px;
  background: var(--lcars-disabled);
  margin: 0.25rem 0;
  opacity: 0.5;
}

.climate-section-label {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-disabled);
  text-transform: uppercase;
  padding: 0.25rem 0.5rem 0;
  letter-spacing: 0.05em;
}
```

Sensor lines reuse `.device-sensor-line` from the Device Panel Spec §3.3. The fault section is separated by a thin divider and a dim "FAULTS" sub-label — secondary information suppressed per Bracer Jack.

### Dual Setpoint Display Logic

```javascript
/**
 * Determine whether to show single or dual setpoint.
 * Dual setpoint when mode is heat_cool and both target temps exist.
 */
function isDualSetpoint(stateObj) {
  const mode = stateObj?.state;
  const hasLow = stateObj?.attributes?.target_temp_low != null;
  const hasHigh = stateObj?.attributes?.target_temp_high != null;
  return (mode === 'heat_cool' || mode === 'auto') && hasLow && hasHigh;
}
```

---
