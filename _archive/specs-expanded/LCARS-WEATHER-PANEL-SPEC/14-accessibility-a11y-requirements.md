## 13. Accessibility (a11y) Requirements

### 13.1 Keyboard Navigation (WCAG 2.1.1)

| Element                  | Focusable        | Keydown Handlers                              |
|--------------------------|------------------|-----------------------------------------------|
| Temperature viewscreen   | `tabindex="0"`   | `Enter`/`Space` → open more-info dialog       |
| Sensor lines             | `tabindex="0"`   | `Enter`/`Space` → open more-info dialog       |
| Forecast tiles           | `tabindex="0"`   | `Enter`/`Space` → show detailed forecast, Arrow Left/Right → navigate tiles |

Tab order: Header → Viewscreen → Day arc → Sensor lines (top to bottom) → Forecast tiles (left to right). Follows DOM order = visual order (WCAG 1.3.2).

### 13.2 ARIA Labeling (WCAG 4.1.2)

```html
<!-- Panel container -->
<div class="lcars-weather-panel ${conditionClass}"
     role="region"
     aria-label="${locationName} weather panel">

  <!-- Header -->
  <div class="weather-header" role="heading" aria-level="3">
    <span class="device-panel-name">${locationName}</span>
    <span class="device-panel-header-line" aria-hidden="true"></span>
    <span class="weather-condition-badge" style="color: ${conditionColor}">
      <span class="weather-glyph" aria-hidden="true">${glyph}</span>
      ${conditionLabel}
    </span>
    <span class="weather-header-temp" style="color: ${conditionColor}">
      ${currentTemp}°${unit}
    </span>
  </div>

  <!-- Sensor column -->
  <div class="weather-sensors" role="list" aria-label="Weather observations">
    <div class="device-sensor-line" role="listitem" tabindex="0"
         aria-label="Feels like: ${feelsLike} degrees">
      ...
    </div>
    <div class="device-sensor-line" role="listitem" tabindex="0"
         aria-label="Humidity: ${humidity} percent">
      ...
    </div>
    <!-- etc. -->
  </div>

  <!-- Weather viewscreen -->
  <div class="weather-media" tabindex="0"
       role="button"
       aria-label="Weather details: ${currentTemp} degrees, ${conditionLabel}, wind ${windSpeed} ${windUnit} from ${windCardinal}">
    <svg role="img"
         aria-label="Current temperature: ${currentTemp} degrees, condition: ${conditionLabel}">
      ...
    </svg>
    <svg class="weather-wind-compass" role="img"
         aria-label="Wind: ${windSpeed} ${windUnit} from ${windCardinal}">
      ...
    </svg>
  </div>

  <!-- Day arc -->
  <div class="weather-dayarc" role="img"
       aria-label="Sunrise at ${sunriseTime}, sunset at ${sunsetTime}">
    ...
  </div>

  <!-- Forecast strip -->
  <div class="weather-forecast-strip" role="list"
       aria-label="Weather forecast">
    <div class="weather-forecast-tile" role="listitem" tabindex="0"
         aria-label="${day}: ${conditionLabel}, high ${high}, low ${low}, ${precipProb}% precipitation">
      ...
    </div>
  </div>

  <!-- Screen reader live region -->
  <div class="sr-only" aria-live="polite" aria-atomic="false">
    <!-- JS injects: "Weather update: 72 degrees, sunny" -->
    <!-- JS injects: "Severe weather alert: thunderstorm" -->
  </div>
</div>
```

### 13.3 Color Is Not Sole Indicator (WCAG 1.4.1)

Every state conveys information through **both** color and text:
- Sunny → `☀ SUNNY` text + sunflower frame
- Severe → `⚠ SEVERE WEATHER` text + red frame + "SEVERE" in header
- UV High → `6 HIGH` label text + gold color
- Pressure rising → `↑` arrow + "RISING" text + blue color

Text alone is sufficient. Color is redundant reinforcement.

### 13.4 Focus Visibility (WCAG 2.4.7, 2.4.11, 2.4.13)

All interactive elements use:
```css
:focus-visible {
  outline: 2px solid var(--lcars-ice);
  outline-offset: 2px;
}
```

- 2px outline meets WCAG 2.4.13 (Focus Appearance)
- `--lcars-ice` (#99ccff) vs `--lcars-black` (#000000) = **10.3:1** — exceeds 3:1

### 13.5 Target Size (WCAG 2.5.8)

| Element               | Size                       | Pixels (at 16px base) | Passes? |
|-----------------------|----------------------------|-----------------------|---------|
| Sensor line           | 1.75rem × full width       | 28px × variable       | ✅ AA   |
| Forecast tile         | ~3rem × 4.5rem min         | 48px × 72px           | ✅ AAA  |
| Viewscreen            | Full panel width           | ≫ 24px                | ✅ AAA  |

### 13.6 Screen Reader Announcements (WCAG 4.1.3)

When significant weather changes occur:

```javascript
/**
 * Announce weather state changes to screen readers.
 */
function announceWeatherChange(liveRegion, locationName, change) {
  if (!liveRegion) return;
  liveRegion.textContent = `${locationName}: ${change}`;
}

// Usage examples:
// announceWeatherChange(el, 'Grandbridge', 'weather update: 72 degrees, sunny');
// announceWeatherChange(el, 'Grandbridge', 'severe weather alert: thunderstorm');
// announceWeatherChange(el, 'Grandbridge', 'lightning detected 5 miles away');
```

---
