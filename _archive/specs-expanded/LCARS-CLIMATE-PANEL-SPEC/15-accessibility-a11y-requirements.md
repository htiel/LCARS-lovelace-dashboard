## 14. Accessibility (a11y) Requirements

### 14.1 Keyboard Navigation (WCAG 2.1.1)

| Element                  | Focusable        | Keydown Handlers                              |
|--------------------------|------------------|-----------------------------------------------|
| Temperature viewscreen   | `tabindex="0"`   | `Enter`/`Space` → open more-info dialog       |
| Sensor lines             | `tabindex="0"`   | `Enter`/`Space` → open more-info dialog       |
| Setpoint – button        | `<button>`       | Native keyboard + long-press repeat           |
| Setpoint + button        | `<button>`       | Native keyboard + long-press repeat           |
| HVAC mode buttons        | `<button>`       | `radiogroup` pattern: Arrow Left/Right        |
| Fan mode buttons         | `<button>`       | `radiogroup` pattern: Arrow Left/Right        |
| Preset mode buttons      | `<button>`       | `radiogroup` pattern: Arrow Left/Right        |

Tab order: Header → Viewscreen → Sensor lines (top to bottom) → Setpoint controls → Mode strip (left to right) → Fan mode strip → Preset strip. Follows DOM order = visual order (WCAG 1.3.2).

### 14.2 ARIA Labeling (WCAG 4.1.2)

```html
<!-- Panel container -->
<div class="lcars-climate-panel"
     role="region"
     aria-label="${deviceName} climate control panel">

  <!-- Header -->
  <div class="climate-header" role="heading" aria-level="3">
    ...
  </div>

  <!-- Sensor column -->
  <div class="climate-sensors" role="list" aria-label="Climate sensors">
    <div class="device-sensor-line" role="listitem" tabindex="0"
         aria-label="Current temperature: ${currentTemp} degrees">
      ...
    </div>
    <div class="device-sensor-line" role="listitem" tabindex="0"
         aria-label="Target temperature: ${targetTemp} degrees">
      ...
    </div>
  </div>

  <!-- Temperature viewscreen -->
  <div class="climate-media" tabindex="0"
       role="button"
       aria-label="Climate details: ${currentTemp} degrees, ${actionLabel}">
    <svg role="meter"
         aria-label="Temperature gauge"
         aria-valuemin="${minTemp}"
         aria-valuemax="${maxTemp}"
         aria-valuenow="${currentTemp}"
         aria-valuetext="${currentTemp} degrees, target ${targetTemp}">
      ...
    </svg>
    <!-- Setpoint controls have their own ARIA — see §5.2 -->
  </div>

  <!-- Mode selector -->
  <div class="climate-mode-strip" role="radiogroup"
       aria-label="HVAC mode: currently ${currentMode}">
    <button role="radio" aria-checked="true|false" aria-label="${mode} mode">
      ...
    </button>
  </div>

  <!-- Fan mode (conditional) -->
  <div class="climate-aux-strip" role="radiogroup"
       aria-label="Fan mode: currently ${fanMode}">
    ...
  </div>

  <!-- Preset mode (conditional) -->
  <div class="climate-aux-strip" role="radiogroup"
       aria-label="Preset: currently ${preset}">
    ...
  </div>

  <!-- Screen reader live region -->
  <div class="sr-only" aria-live="polite" aria-atomic="false">
    <!-- JS injects: "Living Room: heating to 74 degrees" -->
    <!-- JS injects: "Living Room: target changed to 72 degrees" -->
  </div>
</div>
```

### 14.3 Color Is Not Sole Indicator (WCAG 1.4.1)

Every state conveys information through **both** color and text:
- Heating → `HEATING` badge in butterscotch + warm frame border
- Cooling → `COOLING` badge in ice-blue + cool frame border
- Idle → `IDLE` badge in sunflower + neutral frame
- Mode buttons → mode name text + active/inactive visual state
- Faults → `ACTIVE`/`CLEAR` text + indicator dot color

Text alone is sufficient. Color is redundant reinforcement.

### 14.4 Focus Visibility (WCAG 2.4.7, 2.4.11, 2.4.13)

All interactive elements use:
```css
:focus-visible {
  outline: 2px solid var(--lcars-ice);
  outline-offset: 2px;
}
```

- 2px outline meets WCAG 2.4.13 (Focus Appearance)
- `--lcars-ice` (#99ccff) vs `--lcars-black` (#000000) = **10.3:1 contrast** — exceeds 3:1

### 14.5 Target Size (WCAG 2.5.8)

| Element               | Size                | Pixels (at 16px base)  | Passes?   |
|-----------------------|---------------------|------------------------|-----------|
| Mode button           | 3rem × 5rem min     | 48px × 80px            | ✅ AAA    |
| Setpoint ± button     | 2.5rem × 2.5rem     | 40px × 40px            | ✅ AAA    |
| Aux button (fan/preset)| 2.25rem × 3.5rem   | 36px × 56px            | ✅ AA     |
| Sensor line           | 1.75rem × full      | 28px × variable        | ✅ AA     |
| Temperature viewscreen| Full panel width     | ≫ 24px                 | ✅ AAA    |

### 14.6 Screen Reader Announcements (WCAG 4.1.3)

When state changes, use `aria-live="polite"`:

```javascript
/**
 * Announce climate state changes to screen readers.
 * @param {HTMLElement} liveRegion - the aria-live container
 * @param {string} deviceName - friendly name
 * @param {string} change - description of what changed
 */
function announceClimateChange(liveRegion, deviceName, change) {
  if (!liveRegion) return;
  liveRegion.textContent = `${deviceName}: ${change}`;
}

// Usage examples:
// announceClimateChange(el, 'Living Room', 'now heating to 74 degrees');
// announceClimateChange(el, 'Living Room', 'target changed to 72 degrees');
// announceClimateChange(el, 'Living Room', 'mode set to cool');
// announceClimateChange(el, 'Living Room', 'fault detected: connectivity');
```

---
