## 4. Schedule & Status Column (Left)

The left column shows summary telemetry — schedule, usage, controller status. This mirrors the sensor telemetry column from the device panel spec.

### Entity Ordering (Top to Bottom)

| Row | Label            | Source                                      | Color                           |
|-----|------------------|---------------------------------------------|---------------------------------|
| 1   | NEXT RUN         | `sensor.rachio_*_next_run` or `calendar.*`  | `var(--lcars-sunflower)`        |
| 2   | DURATION         | Sum of zone durations from schedule attrs   | `var(--lcars-space-white)`      |
| 3   | RAIN DELAY       | Controller attributes (rain_delay)          | Dynamic (violet if active)      |
| —   | *(divider)*      |                                             |                                 |
| 4   | DAILY USED       | `sensor.rachio_*_daily_used`                | `var(--lcars-space-white)`      |
| —   | *(divider)*      |                                             |                                 |
| 5   | CONTROLLER       | Controller entity status                    | Dynamic                         |

### CSS

```css
.irrigation-schedule {
  grid-area: schedule;
  display: flex;
  flex-direction: column;
  gap: var(--lcars-gap);
  padding: 0.25rem 0;
  align-self: start;
}

.irrigation-schedule-divider {
  height: 1px;
  background: var(--lcars-disabled);
  margin: 0.25rem 0;
  opacity: 0.5;
}
```

Sensor lines reuse `.device-sensor-line` from the Device Panel Spec §3.3.

---
