## 11. Accessibility (a11y) Requirements

### 11.1 Keyboard Navigation (WCAG 2.1.1)

| Element                  | Focusable        | Keydown Handlers                              |
|--------------------------|------------------|-----------------------------------------------|
| Zone rows                | `tabindex="0"`   | `Enter`/`Space` → expand/collapse attributes  |
| Start/Stop buttons       | `<button>`       | Native keyboard                               |
| Standby toggle           | `<button>`       | Native keyboard, `role="switch"`              |

Tab order: Header → Schedule lines → Zone rows (top to bottom, button first then row) → Standby toggle. Follows DOM order = visual order (WCAG 1.3.2).

### 11.2 ARIA Labeling (WCAG 4.1.2)

```html
<!-- Panel container -->
<div class="lcars-irrigation-panel"
     role="region"
     aria-label="${deviceName} irrigation control panel">

  <!-- Header -->
  <div class="irrigation-header" role="heading" aria-level="3">
    ...
  </div>

  <!-- Schedule column -->
  <div class="irrigation-schedule" role="list" aria-label="Irrigation schedule">
    <div class="device-sensor-line" role="listitem" tabindex="0"
         aria-label="Next run: ${nextRunTime}">
      ...
    </div>
  </div>

  <!-- Zone grid -->
  <div class="irrigation-zones" role="list" aria-label="Irrigation zones">
    <div class="irrigation-zone-row" role="listitem" tabindex="0"
         aria-label="${zoneName}: ${stateLabel}">
      <button aria-label="Start watering ${zoneName}">...</button>
      ...
    </div>
  </div>

  <!-- Standby toggle -->
  <button role="switch" aria-checked="${isStandby}"
          aria-label="Standby mode: ${isStandby ? 'on' : 'off'}">
    ...
  </button>

  <!-- Screen reader live region -->
  <div class="sr-only" aria-live="polite" aria-atomic="false"></div>
</div>
```

### 11.3 Color Is Not Sole Indicator (WCAG 1.4.1)

Every state conveys information through **both** color and text:
- Watering → `WATERING` label in ice-blue + fill bar + countdown
- Idle → `IDLE` label in sunflower
- Rain delay → `2 HR DELAY` text in violet
- Offline → `OFFLINE` label in tomato

### 11.4 Focus Visibility (WCAG 2.4.7, 2.4.11, 2.4.13)

```css
.irrigation-zone-row:focus-visible,
.irrigation-zone-btn:focus-visible,
.irrigation-standby-btn:focus-visible {
  outline: 2px solid var(--lcars-ice);
  outline-offset: 2px;
}
```

`--lcars-ice` (#99ccff) vs `--lcars-black` (#000000) = **10.3:1 contrast** — exceeds 3:1 requirement.

### 11.5 Target Size (WCAG 2.5.8)

| Element               | Size                | Pixels (at 16px base)  | Passes?   |
|-----------------------|---------------------|------------------------|-----------|
| Zone Start/Stop button| 3rem × 5rem min     | 48px × 80px            | ✅ AAA    |
| Standby button        | 3rem × 6rem min     | 48px × 96px            | ✅ AAA    |
| Zone row (tap target) | 2.25rem × full      | 36px × variable        | ✅ AA     |

### 11.6 Screen Reader Announcements (WCAG 4.1.3)

```javascript
/**
 * Announce irrigation state changes to screen readers.
 * @param {HTMLElement} liveRegion - the aria-live container
 * @param {string} deviceName - controller friendly name
 * @param {string} change - description of what changed
 */
function announceIrrigationChange(liveRegion, deviceName, change) {
  if (!liveRegion) return;
  liveRegion.textContent = `${deviceName}: ${change}`;
}

// Usage:
// announceIrrigationChange(el, 'Rachio', 'front lawn watering started');
// announceIrrigationChange(el, 'Rachio', 'garden stopped, 12 minutes remaining skipped');
// announceIrrigationChange(el, 'Rachio', 'rain delay activated for 24 hours');
// announceIrrigationChange(el, 'Rachio', 'standby mode enabled');
```

---
