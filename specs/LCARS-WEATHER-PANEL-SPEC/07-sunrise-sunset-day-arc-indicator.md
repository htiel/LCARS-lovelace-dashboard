## 6. Sunrise / Sunset Day-Arc Indicator

Below the viewscreen (still within the media grid area), a simple horizontal arc shows the current position of the sun between sunrise and sunset. This is a **time-of-day readout** — not a traditional sun path diagram.

### Structure

```html
<div class="weather-dayarc" role="img"
     aria-label="Sunrise at ${sunriseTime}, sunset at ${sunsetTime}, currently ${isDaytime ? 'daytime' : 'nighttime'}">
  <span class="weather-dayarc-label">
    <span class="weather-dayarc-glyph" aria-hidden="true">☀</span> RISE ${sunriseTime}
  </span>
  <div class="weather-dayarc-bar">
    <div class="weather-dayarc-fill"
         style="width: ${dayProgressPct}%"></div>
    <div class="weather-dayarc-marker"
         style="left: ${dayProgressPct}%"
         aria-hidden="true">●</div>
  </div>
  <span class="weather-dayarc-label">
    <span class="weather-dayarc-glyph" aria-hidden="true">☀</span> SET ${sunsetTime}
  </span>
</div>
```

### CSS

```css
.weather-dayarc {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  width: 100%;
}

.weather-dayarc-label {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-sunflower);
  text-transform: uppercase;
  white-space: nowrap;
  flex-shrink: 0;
}

.weather-dayarc-glyph {
  font-size: 0.75em;
}

.weather-dayarc-bar {
  flex: 1;
  height: 3px;
  background: var(--lcars-disabled);
  border-radius: 1.5px;
  position: relative;
  overflow: visible;
}

.weather-dayarc-fill {
  height: 100%;
  background: var(--lcars-sunflower);
  border-radius: 1.5px;
  transition: width 60s linear;  /* Slow update — sun moves slowly */
}

.weather-dayarc-marker {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.5rem;
  color: var(--lcars-sunflower);
  pointer-events: none;
}

/* Night time — dim the arc */
.weather-dayarc.night .weather-dayarc-fill {
  background: var(--lcars-bluey);
}

.weather-dayarc.night .weather-dayarc-label {
  color: var(--lcars-bluey);
}

.weather-dayarc.night .weather-dayarc-marker {
  color: var(--lcars-bluey);
}
```

### Day Progress Calculation

```javascript
/**
 * Calculate the percentage of daylight elapsed.
 * Uses the sun.sun entity's next_rising and next_setting attributes.
 * @param {object} hass - Home Assistant instance
 * @returns {{ pct: number, sunrise: string, sunset: string, isDaytime: boolean }}
 */
function getDayProgress(hass) {
  const sun = hass.states['sun.sun'];
  if (!sun) return { pct: 0, sunrise: '--:--', sunset: '--:--', isDaytime: false };

  const isDaytime = sun.state === 'above_horizon';
  const rising = sun.attributes.next_rising;
  const setting = sun.attributes.next_setting;

  if (!rising || !setting) {
    return { pct: isDaytime ? 50 : 0, sunrise: '--:--', sunset: '--:--', isDaytime };
  }

  const now = Date.now();
  const riseTime = new Date(rising).getTime();
  const setTime = new Date(setting).getTime();

  // Format times for display
  const formatTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  let pct = 0;
  if (isDaytime) {
    // Sun is up: calculate position between last rise and next set
    // next_rising is TOMORROW's rise when sun is up, so we estimate today's rise
    const dayLength = setTime - (riseTime - 86400000); // yesterday's rise to today's set
    const elapsed = now - (riseTime - 86400000);
    pct = Math.max(0, Math.min(100, (elapsed / dayLength) * 100));
  } else {
    // Night: marker at 0% (before sunrise) or 100% (after sunset)
    pct = now < riseTime ? 0 : 100;
  }

  return {
    pct,
    sunrise: formatTime(rising),
    sunset: formatTime(setting),
    isDaytime,
  };
}
```

---
