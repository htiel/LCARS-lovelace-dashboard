## 4. Sensor Telemetry Column (Left)

### Entity Ordering (Top to Bottom)

The sensor column shows the alarm status, zone sensors, and last event. Information is ordered by actionability — the most urgent data at the top.

| Row | Sensor            | Source                                     | Color                             |
|-----|-------------------|--------------------------------------------|-----------------------------------|
| 1   | Status            | `alarm_control_panel` state                | Dynamic `--alarm-state-color`     |
| 2   | Arming Time       | Countdown during `arming`/`pending` only   | Dynamic `--alarm-state-color`     |
| —   | *(divider)*       |                                            |                                   |
| 3   | Trigger Source    | Triggered sensor name (triggered only)     | `var(--lcars-alert)` (tomato)     |
| —   | *(label: ZONES)*  |                                            |                                   |
| 4+  | Zone Sensors      | `binary_sensor.*` entries from the device  | Dynamic per-zone (see §4.1)      |
| —   | *(divider)*       |                                            |                                   |
| N   | Last Event        | Last state change timestamp                | `var(--lcars-disabled)`           |

### CSS

```css
.alarm-sensors {
  grid-area: sensors;
  display: flex;
  flex-direction: column;
  gap: var(--lcars-gap);
  padding: 0.25rem 0;
  align-self: start;
}

.alarm-sensors-divider {
  height: 1px;
  background: var(--lcars-disabled);
  margin: 0.25rem 0;
  opacity: 0.5;
}

.alarm-section-label {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-disabled);
  text-transform: uppercase;
  padding: 0.25rem 0.5rem 0;
  letter-spacing: 0.05em;
}
```

Sensor lines reuse `.device-sensor-line` from the Device Panel Spec §3.3. The ZONES section label is suppressed in dim gray per Bracer Jack — secondary organizational text, not primary data.

### 4.1 Zone Sensor Status Coloring

Each zone sensor (`binary_sensor`) gets dynamic indicator coloring based on its current state and the alarm panel state:

| Sensor State | Alarm State     | Indicator Color           | Value Text     | Rationale                                  |
|--------------|-----------------|---------------------------|----------------|--------------------------------------------|
| `off` (OK)   | Any              | `var(--lcars-disabled)`   | `OK`           | Normal — zone secure, baseline gray dot    |
| `on` (open)  | `disarmed`       | `var(--lcars-sunflower)`  | `OPEN`         | Informational — door open while disarmed   |
| `on` (open)  | `armed_*`        | `var(--lcars-alert)`      | `OPEN`         | Warning — zone breached while armed        |
| `on` (open)  | `triggered`      | `var(--lcars-alert)` pulse| `!!`           | Emergency — this zone may be the trigger   |
| unavailable  | Any              | `var(--lcars-disabled)`   | `N/A`          | Sensor offline                             |

```javascript
/**
 * Get the indicator color for a zone sensor based on its state
 * and the current alarm panel state.
 */
function getZoneColor(sensorState, alarmState) {
  if (sensorState === 'unavailable' || sensorState === 'unknown') {
    return 'var(--lcars-disabled)';
  }
  if (sensorState === 'off') {
    return 'var(--lcars-disabled)';
  }
  // Sensor is on (open/detected/triggered)
  if (alarmState === 'disarmed') {
    return 'var(--lcars-sunflower)';
  }
  return 'var(--lcars-alert)';
}

/**
 * Get the display value for a zone sensor.
 */
function getZoneValue(sensorState, alarmState) {
  if (sensorState === 'unavailable' || sensorState === 'unknown') return 'N/A';
  if (sensorState === 'off') return 'OK';
  if (alarmState === 'triggered') return '!!';
  return 'OPEN';
}
```

### 4.2 Zone Sensor CSS

```css
.alarm-zone-line {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 1.75rem;
  padding: 0 0.5rem;
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  text-transform: uppercase;
}

.alarm-zone-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  transition: background var(--lcars-transition);
}

.alarm-zone-indicator.ok {
  background: var(--lcars-disabled);
}

.alarm-zone-indicator.open {
  background: var(--lcars-sunflower);
}

.alarm-zone-indicator.alert {
  background: var(--lcars-alert);
  animation: zone-alert-pulse 1s ease-in-out infinite;
}

.alarm-zone-name {
  color: var(--lcars-space-white);
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.alarm-zone-value {
  white-space: nowrap;
  font-weight: 700;
  transition: color var(--lcars-transition);
}

.alarm-zone-value.ok {
  color: var(--lcars-disabled);
}

.alarm-zone-value.open {
  color: var(--lcars-sunflower);
}

.alarm-zone-value.alert {
  color: var(--lcars-alert);
  font-weight: 700;
}

@keyframes zone-alert-pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.5; }
}

@media (prefers-reduced-motion: reduce) {
  .alarm-zone-indicator.alert {
    animation: none !important;
    width: 10px;
    height: 10px;
  }
}
```

### 4.3 Last Event Badge

```css
.alarm-last-event {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-disabled);
  text-transform: uppercase;
  padding: 0 0.5rem;
  white-space: nowrap;
  letter-spacing: 0.05em;
}
```

```javascript
/**
 * Format the last state change as a compact timestamp.
 * Returns "HH:MM" for today, "MMM DD HH:MM" for older.
 */
function formatLastEvent(lastChanged) {
  if (!lastChanged) return '--:--';
  const d = new Date(lastChanged);
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;

  if (d.toDateString() === now.toDateString()) {
    return time;
  }

  const months = ['JAN','FEB','MAR','APR','MAY','JUN',
                  'JUL','AUG','SEP','OCT','NOV','DEC'];
  return `${months[d.getMonth()]} ${pad(d.getDate())} ${time}`;
}
```

---
