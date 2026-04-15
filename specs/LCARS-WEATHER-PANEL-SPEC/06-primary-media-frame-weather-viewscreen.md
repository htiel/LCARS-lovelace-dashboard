## 5. Primary Media Frame — Weather Viewscreen

The center-right viewscreen contains the large current temperature, condition glyph, and wind indicator. This is the **"planetary surface scan"** focal point.

### 5.1 Temperature Display (SVG)

A large temperature number centered in the viewscreen with the condition label below. No arc or dial — weather conditions don't have a meaningful min/max range like thermostats. The temperature floats in black space.

```html
<svg class="weather-temp-display"
     viewBox="0 0 200 160"
     role="img"
     aria-label="Current temperature: ${currentTemp} degrees, condition: ${conditionLabel}">

  <!-- Condition glyph — large geometric icon above temp -->
  <text class="weather-condition-glyph"
        x="100" y="35"
        text-anchor="middle"
        dominant-baseline="middle"
        fill="var(--weather-condition-color)"
        font-size="28">
    ${glyph}
  </text>

  <!-- Current temperature — dominant readout -->
  <text class="weather-temp-value"
        x="100" y="80"
        text-anchor="middle"
        dominant-baseline="middle"
        fill="var(--weather-condition-color)"
        font-family="var(--lcars-font)"
        font-size="48"
        text-transform="uppercase">
    ${currentTemp}°
  </text>

  <!-- Condition label -->
  <text class="weather-temp-label"
        x="100" y="108"
        text-anchor="middle"
        dominant-baseline="middle"
        fill="var(--lcars-space-white)"
        font-family="var(--lcars-font)"
        font-size="12"
        text-transform="uppercase">
    ${conditionLabel}
  </text>
</svg>
```

### 5.2 Wind Direction Compass (SVG)

Below the temperature, a compact compass rose showing wind direction and speed. This is the "wind vector readout" — not a decorative compass, but an abstract directional sensor indicator.

```html
<svg class="weather-wind-compass"
     viewBox="0 0 80 80"
     role="img"
     aria-label="Wind: ${windSpeed} ${windUnit} from ${windCardinal}">

  <!-- Compass circle -->
  <circle cx="40" cy="40" r="28"
          fill="none"
          stroke="var(--lcars-disabled)"
          stroke-width="1.5"
          opacity="0.4" />

  <!-- Cardinal direction ticks -->
  <text x="40" y="8"  text-anchor="middle" fill="var(--lcars-space-white)"
        font-family="var(--lcars-font)" font-size="7">N</text>
  <text x="72" y="43" text-anchor="middle" fill="var(--lcars-disabled)"
        font-family="var(--lcars-font)" font-size="6">E</text>
  <text x="40" y="78" text-anchor="middle" fill="var(--lcars-disabled)"
        font-family="var(--lcars-font)" font-size="6">S</text>
  <text x="8"  y="43" text-anchor="middle" fill="var(--lcars-disabled)"
        font-family="var(--lcars-font)" font-size="6">W</text>

  <!-- Wind direction arrow — rotated to bearing -->
  <line class="weather-wind-arrow"
        x1="40" y1="40"
        x2="40" y2="16"
        stroke="var(--weather-condition-color)"
        stroke-width="2.5"
        stroke-linecap="round"
        transform="rotate(${windBearing}, 40, 40)" />

  <!-- Arrow head -->
  <polygon class="weather-wind-arrowhead"
           points="40,14 37,20 43,20"
           fill="var(--weather-condition-color)"
           transform="rotate(${windBearing}, 40, 40)" />

  <!-- Center dot -->
  <circle cx="40" cy="40" r="3"
          fill="var(--weather-condition-color)" />
</svg>
```

### Wind Speed & Direction Text

Below the compass within the viewscreen:

```html
<div class="weather-wind-readout">
  <span class="weather-wind-speed">${windSpeed} ${windUnit}</span>
  <span class="weather-wind-cardinal">${windCardinal}</span>
</div>
```

### Wind Direction Formatting Helpers

```javascript
/**
 * Convert wind bearing (degrees) to cardinal direction string.
 * @param {number} bearing - 0–360 degrees (0/360 = North)
 * @returns {string} Cardinal direction (N, NNE, NE, etc.)
 */
function bearingToCardinal(bearing) {
  if (bearing == null || isNaN(bearing)) return '—';
  const dirs = [
    'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'
  ];
  const idx = Math.round(((bearing % 360) + 360) % 360 / 22.5) % 16;
  return dirs[idx];
}

/**
 * Get wind speed description for screen readers.
 * Uses Beaufort scale classification.
 */
function getWindDescription(speedMph) {
  const s = Number(speedMph);
  if (isNaN(s) || s < 0) return 'unknown';
  if (s < 1)  return 'calm';
  if (s < 4)  return 'light air';
  if (s < 8)  return 'light breeze';
  if (s < 13) return 'gentle breeze';
  if (s < 19) return 'moderate breeze';
  if (s < 25) return 'fresh breeze';
  if (s < 32) return 'strong breeze';
  if (s < 39) return 'near gale';
  if (s < 47) return 'gale';
  if (s < 55) return 'strong gale';
  if (s < 64) return 'storm';
  if (s < 73) return 'violent storm';
  return 'hurricane force';
}
```

### Viewscreen CSS

```css
.weather-media {
  grid-area: media;
  position: relative;
  border: 3px solid var(--panel-frame-color, var(--lcars-sky));
  border-radius: 0.5rem;
  overflow: hidden;
  background: var(--lcars-bg);
  aspect-ratio: var(--media-aspect, 4 / 3);

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.75rem;
}

.weather-temp-display {
  width: 100%;
  max-width: 14rem;
  height: auto;
  display: block;
}

.weather-wind-compass {
  width: 5rem;
  height: 5rem;
  display: block;
}

.weather-wind-readout {
  display: flex;
  gap: 0.5rem;
  align-items: baseline;
  font-family: var(--lcars-font);
  text-transform: uppercase;
}

.weather-wind-speed {
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-space-white);
  font-weight: 700;
}

.weather-wind-cardinal {
  font-size: var(--lcars-font-size-data);
  color: var(--weather-condition-color);
}

/* Corner brackets — from Device Panel Spec §3.2 */
.weather-media::before,
.weather-media::after {
  content: '';
  position: absolute;
  width: 1.5rem;
  height: 1.5rem;
  border-color: var(--panel-frame-color, var(--lcars-sky));
  border-style: solid;
  pointer-events: none;
  z-index: 1;
}

.weather-media::before {
  top: 0.25rem;
  left: 0.25rem;
  border-width: 2px 0 0 2px;
  border-radius: 0.25rem 0 0 0;
}

.weather-media::after {
  bottom: 0.25rem;
  right: 0.25rem;
  border-width: 0 2px 2px 0;
  border-radius: 0 0 0.25rem 0;
}

/* Wind arrow transition when direction changes */
.weather-wind-arrow,
.weather-wind-arrowhead {
  transition: transform 0.8s ease-out;
}

/* Temperature text — dynamic color */
.weather-temp-value {
  transition: fill var(--lcars-transition-slow);
}
```

---
