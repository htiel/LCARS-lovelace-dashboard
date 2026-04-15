## 12. Responsive Behavior

### Desktop (≥768px) — Full 2-Column Layout

The spec above. Sensors left, viewscreen right, forecast strip full-width below.

### Mobile (<768px) — Stacked Layout

```css
@media (max-width: 767px) {
  .lcars-weather-panel {
    grid-template-columns: 1fr;
    grid-template-areas:
      "header"
      "media"
      "sensors"
      "forecast";
  }

  .weather-media {
    aspect-ratio: auto;
    max-width: 16rem;
    margin: 0 auto;
  }

  .weather-sensors {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .device-sensor-line {
    flex: 1 1 45%;
    min-width: 8rem;
  }

  .weather-sensors-divider {
    display: none;
  }

  /* Forecast strip scrolls horizontally on mobile */
  .weather-forecast-strip {
    overflow-x: auto;
    flex-wrap: nowrap;
  }

  .weather-forecast-tile {
    min-width: 4rem;
    flex-shrink: 0;
  }

  /* Day arc goes below viewscreen */
  .weather-dayarc {
    flex-wrap: wrap;
    justify-content: center;
  }
}
```

On mobile, the temperature viewscreen moves to center-top for immediate visual status, sensors flow as wrapped pairs, and the forecast strip scrolls horizontally. Reading priority: current conditions → temperature → sensor data → forecast.

### Compact Mode

For dashboard views with limited space:

```css
.lcars-weather-panel.compact {
  grid-template-columns: 1fr;
  grid-template-areas:
    "header"
    "media"
    "forecast";
}

.lcars-weather-panel.compact .weather-sensors {
  display: none;
}

.lcars-weather-panel.compact .weather-dayarc {
  display: none;
}

.lcars-weather-panel.compact .weather-media {
  aspect-ratio: auto;
  max-width: 10rem;
  margin: 0 auto;
}

.lcars-weather-panel.compact .weather-forecast-strip {
  max-height: 4rem;
}

/* Compact forecast: glyph + high temp only */
.lcars-weather-panel.compact .forecast-temp-low,
.lcars-weather-panel.compact .forecast-range-bar,
.lcars-weather-panel.compact .forecast-precip {
  display: none;
}
```

---
