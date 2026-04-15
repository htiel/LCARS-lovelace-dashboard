## 9. Heading & Label Hierarchy (Accessibility)

### Heading Levels

| Element               | `aria-level` | Font Size                  | Color                          | Purpose                       |
|-----------------------|--------------|----------------------------|--------------------------------|-------------------------------|
| Panel title           | 3            | `--lcars-font-size-sub`    | `--lcars-text-heading`         | Device name (e.g., "OFFICE PURIFIER") |
| Section headings      | 4            | `--lcars-font-size-data`   | `--lcars-text-heading`         | "PRESET MODE", "DIAGNOSTICS"  |
| Sensor labels         | —            | `--lcars-font-size-data`   | `--lcars-text`                 | "AQI", "PM2.5", "CO₂", etc.  |
| Sensor values         | —            | `--lcars-font-size-data`   | Dynamic (state-based)          | "42", "8 µG/M³", "620 PPM"   |
| Sparkline labels      | —            | `--lcars-font-size-data`   | `--lcars-disabled`             | "PM2.5", "AQI", "CO₂"        |
| Header badge          | —            | `--lcars-font-size-data`   | Dynamic `--atmos-quality-color`| "AQI: 42"                    |
| Quality label         | —            | `--lcars-font-size-data`   | Dynamic `--atmos-quality-color`| "GOOD"                       |

**Exactly 3 font sizes: title (unused here, reserved for page-level), sub-header, data.** (Bracer Jack Rule 6)

### ARIA Labeling

```html
<!-- Panel container -->
<div class="lcars-atmoscrubber-panel ${sensorOnly ? 'sensor-only' : ''}"
     role="region"
     aria-label="${deviceName} atmospheric monitoring panel">

  <!-- Header with quality status -->
  <div class="atmos-header" role="heading" aria-level="3">
    ...
  </div>

  <!-- Sensor column -->
  <div class="atmos-sensors" role="list" aria-label="Air quality sensors">
    <div class="device-sensor-line" role="listitem" tabindex="0"
         aria-label="AQI: ${aqiValue}, ${aqiLabel}">
      ...
    </div>
    <div class="device-sensor-line" role="listitem" tabindex="0"
         aria-label="PM 2.5: ${pm25Value} micrograms per cubic meter">
      ...
    </div>
    <!-- ... -->
  </div>

  <!-- Cylinder -->
  <div class="atmos-cylinder"
       role="meter"
       aria-label="Air quality level"
       aria-valuemin="0"
       aria-valuemax="300"
       aria-valuenow="${aqiValue}"
       aria-valuetext="AQI ${aqiValue}, ${aqiLabel}">
    ...
  </div>

  <!-- Controls (purifier only) -->
  <div class="atmos-controls" role="group" aria-label="Purifier controls">
    <div role="heading" aria-level="4" class="atmos-control-heading">
      PRESET MODE
    </div>
    <div class="atmos-preset-strip" role="radiogroup" aria-label="Fan preset mode">
      <button class="atmos-preset-btn"
              role="radio"
              aria-checked="${isActive}"
              aria-label="${modeName}">
        ${modeName}
      </button>
      <!-- ... -->
    </div>
    <div class="atmos-toggle-row">
      <span class="atmos-toggle-label" id="display-label">DISPLAY</span>
      <button class="atmos-toggle"
              role="switch"
              aria-checked="${displayState}"
              aria-labelledby="display-label">
      </button>
    </div>
    <!-- ... -->
  </div>

  <!-- Sparklines -->
  <div class="atmos-sparklines" role="group" aria-label="24-hour trend charts">
    ...
  </div>

  <!-- Screen reader live region -->
  <div class="sr-only" aria-live="polite" aria-atomic="false">
    <!-- JS injects: "Office Purifier: AQI changed to 65, moderate" -->
  </div>
</div>
```

### Keyboard Navigation (Tab Order)

1. Panel header (informational, not interactive)
2. Sensor lines — top to bottom (`Enter`/`Space` → open more-info dialog)
3. Cylinder (`role="meter"` — informational, `tabindex="0"`, `Enter` → open more-info for primary sensor)
4. Preset mode buttons — top to bottom (standard `radiogroup` keyboard: `Arrow Up`/`Down` to navigate, `Space` to select)
5. Toggle switches — top to bottom (`Space` to toggle)
6. Sparklines — left to right (informational, `tabindex="0"`, `Enter` → open history graph)

The tab order follows DOM order which matches visual order (WCAG 1.3.2 Meaningful Sequence).

---
