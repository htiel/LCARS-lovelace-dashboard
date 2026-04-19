## 7. Forecast Strip

A horizontal row of day tiles at the bottom of the panel showing upcoming weather. This is the **"long-range sensor scan"** — forecast data rendered as a compact, scannable strip.

### Structure

```html
<div class="weather-forecast-strip" role="list"
     aria-label="Weather forecast for the next ${forecastDays.length} days">
  ${forecastDays.map((day, i) => html`
    <div class="weather-forecast-tile" role="listitem"
         tabindex="0"
         aria-label="${day.dayName}: ${day.conditionLabel}, high ${day.tempHigh} degrees, low ${day.tempLow} degrees, ${day.precipProb} percent precipitation">
      <span class="forecast-day-name">${day.dayName}</span>
      <span class="forecast-glyph"
            style="color: ${day.conditionColor}"
            aria-hidden="true">${day.glyph}</span>
      <span class="forecast-temp-high">${day.tempHigh}°</span>
      <span class="forecast-temp-low">${day.tempLow}°</span>
      <div class="forecast-range-bar" aria-hidden="true">
        <div class="forecast-range-fill"
             style="margin-left: ${day.rangeLowPct}%; width: ${day.rangeWidthPct}%">
        </div>
      </div>
      <span class="forecast-precip"
            style="color: ${day.precipProb > 50 ? 'var(--lcars-sky)' : 'var(--lcars-disabled)'}">
        ${day.precipProb}%
      </span>
    </div>
  `)}
</div>
```

### Temperature Range Bar

Each forecast tile includes a small horizontal bar showing where the day's high/low falls within the overall forecast range. This gives a quick visual comparison across days.

```javascript
/**
 * Calculate range bar positions for forecast tiles.
 * Maps each day's high/low onto the full forecast range.
 * @param {Array} forecasts - Array of forecast objects with temperature/templow
 * @returns {Array} Forecasts with rangeLowPct and rangeWidthPct added
 */
function calculateForecastRanges(forecasts) {
  if (!forecasts || forecasts.length === 0) return [];

  // Find the overall min/max across all forecast days
  let overallMin = Infinity;
  let overallMax = -Infinity;
  for (const f of forecasts) {
    const low = f.templow ?? f.temperature;
    const high = f.temperature;
    if (low != null && low < overallMin) overallMin = low;
    if (high != null && high > overallMax) overallMax = high;
  }

  const range = overallMax - overallMin;
  if (range <= 0) {
    return forecasts.map(f => ({ ...f, rangeLowPct: 0, rangeWidthPct: 100 }));
  }

  return forecasts.map(f => {
    const low = f.templow ?? f.temperature;
    const high = f.temperature;
    const rangeLowPct = ((low - overallMin) / range) * 100;
    const rangeWidthPct = ((high - low) / range) * 100;
    return { ...f, rangeLowPct, rangeWidthPct: Math.max(rangeWidthPct, 4) };
  });
}
```

### Forecast Data Fetching

```javascript
/**
 * Fetch daily forecast data from a weather entity.
 * Uses the weather.get_forecasts action (HA 2024.3+).
 * @param {object} hass - Home Assistant instance
 * @param {string} entityId - weather entity ID
 * @param {number} days - number of forecast days (default 7)
 * @returns {Promise<Array>} Array of forecast objects
 */
async function fetchDailyForecast(hass, entityId, days = 7) {
  try {
    const result = await hass.callService('weather', 'get_forecasts', {
      entity_id: entityId,
      type: 'daily',
    }, true);  // returnResponse = true

    const forecasts = result?.[entityId]?.forecast || [];
    return forecasts.slice(0, days);
  } catch (e) {
    console.warn('LCARS Weather: Failed to fetch forecast', e);
    return [];
  }
}

/**
 * Fetch hourly forecast data.
 * @param {object} hass - Home Assistant instance
 * @param {string} entityId - weather entity ID
 * @param {number} hours - number of forecast hours (default 24)
 * @returns {Promise<Array>} Array of hourly forecast objects
 */
async function fetchHourlyForecast(hass, entityId, hours = 24) {
  try {
    const result = await hass.callService('weather', 'get_forecasts', {
      entity_id: entityId,
      type: 'hourly',
    }, true);

    const forecasts = result?.[entityId]?.forecast || [];
    return forecasts.slice(0, hours);
  } catch (e) {
    console.warn('LCARS Weather: Failed to fetch hourly forecast', e);
    return [];
  }
}

/**
 * Transform raw forecast data into display-ready objects.
 */
function transformForecastDay(forecast) {
  const dt = new Date(forecast.datetime);
  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  return {
    dayName: dayNames[dt.getDay()],
    dateStr: dt.toLocaleDateString([], { month: 'short', day: 'numeric' }).toUpperCase(),
    condition: forecast.condition,
    conditionLabel: getWeatherLabel(forecast.condition),
    conditionColor: getWeatherConditionColor(forecast.condition),
    glyph: getWeatherGlyph(forecast.condition),
    tempHigh: Math.round(forecast.temperature),
    tempLow: forecast.templow != null ? Math.round(forecast.templow) : null,
    precipProb: forecast.precipitation_probability ?? 0,
    precipitation: forecast.precipitation ?? 0,
    windSpeed: forecast.wind_speed,
    windBearing: forecast.wind_bearing,
    humidity: forecast.humidity,
  };
}

/**
 * Transform raw hourly forecast for display.
 */
function transformForecastHour(forecast) {
  const dt = new Date(forecast.datetime);
  const hour = dt.toLocaleTimeString([], { hour: '2-digit', hour12: false });

  return {
    hourLabel: hour,
    condition: forecast.condition,
    conditionColor: getWeatherConditionColor(forecast.condition),
    glyph: getWeatherGlyph(forecast.condition),
    temp: Math.round(forecast.temperature),
    precipProb: forecast.precipitation_probability ?? 0,
    windSpeed: forecast.wind_speed,
  };
}
```

### Forecast Strip CSS

```css
.weather-forecast-strip {
  grid-area: forecast;
  display: flex;
  gap: var(--lcars-gap);
  padding-top: var(--lcars-gap);
  border-top: 2px solid var(--panel-frame-color);
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;

  /* Hide scrollbar but allow scrolling */
  scrollbar-width: none;
}

.weather-forecast-strip::-webkit-scrollbar {
  display: none;
}

.weather-forecast-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.125rem;
  padding: 0.25rem 0.375rem;
  min-width: 4.5rem;
  flex: 1 1 0;
  scroll-snap-align: start;
  transition: filter var(--lcars-transition);
  cursor: pointer;
}

.weather-forecast-tile:hover {
  filter: brightness(1.2);
}

.weather-forecast-tile:focus-visible {
  outline: 2px solid var(--lcars-ice);
  outline-offset: 2px;
}

.forecast-day-name {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-text-heading);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.forecast-glyph {
  font-size: 1.25rem;
  line-height: 1;
  transition: color var(--lcars-transition);
}

.forecast-temp-high {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-space-white);
  font-weight: 700;
}

.forecast-temp-low {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-disabled);
}

.forecast-range-bar {
  width: 100%;
  height: 3px;
  background: var(--lcars-disabled);
  border-radius: 1.5px;
  overflow: hidden;
  opacity: 0.5;
}

.forecast-range-fill {
  height: 100%;
  background: linear-gradient(
    to right,
    var(--lcars-ice),
    var(--lcars-sunflower)
  );
  border-radius: 1.5px;
  /* NOTE: This is the ONE exception to "no gradients" — this is a data
     visualization heatmap, not a decorative gradient. The gradient maps
     cold (left/blue) to warm (right/amber) as a temperature range.
     APPROVED by Geordi as data-viz exception. RESTRICTED to this 3px
     range bar only — never applied to buttons, frames, or panels. */
}

.forecast-precip {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  transition: color var(--lcars-transition);
}
```

### Hourly Forecast Variant

When configured for hourly forecast, the strip shows hour labels instead of day names:

```css
.weather-forecast-strip.hourly .weather-forecast-tile {
  min-width: 3.5rem;
}
```

The hourly variant omits `templow` and the range bar (hourly data has single temperature) and replaces the day name with the hour label.

---
