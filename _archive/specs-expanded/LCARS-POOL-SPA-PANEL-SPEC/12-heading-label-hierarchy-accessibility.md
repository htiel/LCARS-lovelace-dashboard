## 11. Heading & Label Hierarchy (Accessibility)

### Heading Levels

| Element                 | `aria-level` | Font Size                  | Color                          | Purpose                              |
|-------------------------|--------------|----------------------------|--------------------------------|--------------------------------------|
| Panel title             | 3            | `--lcars-font-size-sub`    | `--lcars-text-heading`         | "POOL & SPA — BACKYARD"             |
| Section headings        | 4            | `--lcars-font-size-data`   | `--lcars-text-heading`         | "CHEMISTRY", "CIRCUITS", "STATUS"   |
| Body labels             | —            | `--lcars-font-size-data`   | `--lcars-space-white`          | "POOL", "SPA"                        |
| Body temp values        | —            | `--lcars-font-size-sub`    | Dynamic (body color)           | "78°F", "102°F"                      |
| Sensor labels           | —            | `--lcars-font-size-data`   | `--lcars-text`                 | "PH", "ORP", "SALT", etc.           |
| Sensor values           | —            | `--lcars-font-size-data`   | Dynamic (threshold-based)      | "7.4", "720", "3200"                |
| Swatch labels           | —            | 0.55rem                    | `--lcars-space-white`          | "PAR", "ROM", "BLU"                 |
| Header badges           | —            | `--lcars-font-size-data`   | Dynamic (body/air color)       | "POOL 78°F", "SPA 102°F"            |

**Exactly 3 font sizes: title (reserved for page-level), sub-header, data.** (Bracer Jack Rule 6). The swatch labels use a smaller size out of necessity (22 items in a horizontal strip) but are supplemented by `aria-label` for accessibility.

### ARIA Labeling

```html
<!-- Panel container -->
<div class="lcars-pool-spa-panel ${hasChem ? '' : 'no-chem'}"
     role="region"
     aria-label="${panelName} pool and spa monitoring panel">

  <!-- Header -->
  <div class="pool-header" role="heading" aria-level="3">...</div>

  <!-- Chemistry column -->
  <div class="pool-chemistry" role="list" aria-label="Water chemistry readings">
    <div role="heading" aria-level="4" class="pool-chem-heading">CHEMISTRY</div>
    <div class="device-sensor-line" role="listitem" tabindex="0"
         aria-label="pH: ${phValue}, ${getPhLabel(phValue)}">
      ...
    </div>
    <div class="device-sensor-line" role="listitem" tabindex="0"
         aria-label="ORP: ${orpValue} millivolts">
      ...
    </div>
    <!-- ... -->
  </div>

  <!-- Aquatic viewscreens -->
  <div class="pool-aquatics" role="group" aria-label="Water body displays">
    <div class="pool-body-viewscreen" data-body="pool"
         role="region"
         aria-label="Pool: ${poolTemp} degrees, target ${poolTarget} degrees, heat mode ${heatMode}">
      ...
    </div>
    <div class="pool-body-viewscreen" data-body="spa"
         role="region"
         aria-label="Spa: ${spaTemp} degrees, target ${spaTarget} degrees, heat mode ${heatMode}">
      ...
    </div>
  </div>

  <!-- Controls column -->
  <div class="pool-controls" role="group" aria-label="Pool and spa controls">
    <div role="heading" aria-level="4" class="pool-control-heading">CIRCUITS</div>
    <div class="pool-circuit-row">
      <span class="pool-circuit-label" id="pool-pump-label">POOL PUMP</span>
      <button class="pool-circuit-toggle"
              role="switch"
              aria-checked="${pumpState}"
              aria-labelledby="pool-pump-label">
      </button>
    </div>
    <!-- ... -->
  </div>

  <!-- Lighting strip -->
  <div class="pool-lighting" role="group" aria-label="Pool light color controls">
    <div class="pool-lighting-swatches" role="radiogroup" aria-label="IntelliBrite color mode">
      <button class="pool-swatch"
              role="radio"
              aria-checked="${isActive}"
              aria-label="${mode.label} light mode">
      </button>
      <!-- ... -->
    </div>
  </div>

  <!-- Screen reader live region -->
  <div class="sr-only" aria-live="polite" aria-atomic="false">
    <!-- JS injects: "Pool temperature changed to 79 degrees"
         "pH alert: value 6.8, below optimal range"
         "Spa heater activated" -->
  </div>
</div>
```

### Keyboard Navigation (Tab Order)

1. Panel header (informational, not interactive)
2. Chemistry sensor lines — top to bottom (`Enter`/`Space` → open more-info dialog)
3. Pool viewscreen → pool setpoint –/+ buttons
4. Spa viewscreen → spa setpoint –/+ buttons
5. Circuit toggles — top to bottom (`Space` to toggle)
6. Status readouts (informational, `tabindex="0"`, `Enter` → more-info)
7. Lighting swatch strip — left to right (standard `radiogroup` keyboard: `Arrow Left`/`Right` to navigate, `Space` to select)

The tab order follows DOM order which matches visual order (WCAG 1.3.2 Meaningful Sequence).

### Screen Reader Announcements

```javascript
/**
 * Announce pool/spa state changes to screen readers via aria-live region.
 * Called when entity states update.
 */
function announcePoolChange(liveRegion, changeType, data) {
  let message = '';
  switch (changeType) {
    case 'temp_change':
      message = `${data.body} temperature changed to ${data.temp} degrees`;
      break;
    case 'chem_alert':
      message = `${data.metric} alert: value ${data.value}, ${data.status}`;
      break;
    case 'heat_change':
      message = `${data.body} heater ${data.action}`;
      break;
    case 'circuit_change':
      message = `${data.circuit} turned ${data.state}`;
      break;
    case 'color_change':
      message = `Pool lights set to ${data.mode}`;
      break;
  }
  if (message && liveRegion) {
    liveRegion.textContent = message;
  }
}
```

---
