## Data — Architecture Review

**Reviewer**: Data (Project Architect & Performance Engineer)  
**Date**: Stardate 2026.04.13  
**Assessment**: SOUND WITH ADVISORIES

### Component Architecture
- This is a **read-only display panel** — no service calls, no user input, no state mutations. This is the simplest integration pattern from a security and state-management perspective. I am... appreciative of this simplicity.
- The panel extends `LcarsDevicePanelBase` with the standard 2-column layout (sensors + viewscreen | controls). The "controls" column contains forecast and sun data rather than interactive controls, which is an acceptable adaptation of the layout pattern. The column is better described as "data" but renaming would require a base class change.
- The entity classification (`classifyWeatherEntities()`) is more complex than other panels because weather data spans 3 distinct integration sources: `weather.*` (Met.no), `sensor.tempest_*` (WeatherFlow Tempest), and `sensor.davis_*` (Davis Vantage). The cascading discovery pattern (primary weather entity → supplemental sensor entities) is well-designed. The priority system (`tempest > davis > weather.*`) for overlapping measurements (e.g., temperature available from all 3) is explicitly documented. Good.
- The **condition→glyph mapping** (§5.6) uses a `CONDITION_GLYPHS` object with Unicode geometric shapes instead of SVG icons. This is architecturally sound — it avoids SVG asset management, renders with the system font stack, and is CSS-stylable. The 17 condition types map to 7 distinct glyphs. The fallback glyph (`◇`) handles unknown conditions.
- The **forecast strip** (§8) renders 7 day-forecast tiles with temperature range bars. The range bar uses a `background: linear-gradient()` with cold-to-warm coloring sized by `(high - low) / (max_high - min_low) * 100%`. This is a pure CSS data visualization — no canvas, no SVG. Efficient.

### Performance Considerations
- **`weather.get_forecasts` caching**: The `_fetchForecast()` method calls `hass.callWS({ type: 'weather/subscribe_forecasts' })` or `hass.callService('weather', 'get_forecasts', ...)` each time the panel updates. Forecast data changes at most every 30-60 minutes for Met.no. **Advisory**: Cache the forecast response and only re-fetch when `this._lastForecastFetch` is older than 15 minutes. This avoids redundant API calls on every `hass` property update (which fires on any entity state change in HA — potentially hundreds per minute).
- **`getDayProgress()` recomputation**: The sun arc position (§6) computes `(Date.now() - sunrise) / (sunset - sunrise)` to position the sun dot on the arc path. This value changes every second, but `updated()` fires on hass changes (not on a timer). The spec does NOT implement a 1-second interval for smooth sun arc animation — it only recalculates when hass updates. This is correct. Implementing a timer for cosmetic smoothness would be wasteful for a value that changes by ~0.001% per HA update cycle.
- **SVG wind compass** (§5.3): A single `<circle>`, `<line>`, and `<polygon>` rotated by `transform: rotate(${windDir}deg)`. Minimal SVG complexity — 4 elements total. CSS `transition: transform 0.6s ease` on direction changes is GPU-compositable. No concern.
- **Condition-reactive frame color**: `--panel-frame-color` is set via `getConditionColor(state)`. This triggers a CSS custom property update on the panel root, which causes a repaint of the frame border and header elements. This happens only on condition changes (typically 1-4 times per day). Negligible.
- **Bundle impact estimate**: ~4.5 KiB minified/gzipped. The condition mapping tables (~0.8 KiB), SVG arc/compass templates, and forecast strip rendering are the main contributors. No external dependencies. Roughly 2.2% of the 203 KiB bundle.

### HA Integration Patterns
- `weather.get_forecasts` (introduced HA 2024.3) is the correct action for forecast data. The spec declares HA 2024.3+ as a minimum requirement for this specific feature. Since the project minimum is HA 2025.4.0, this is already satisfied.
- The `sun.sun` entity is a core HA integration, always available. Using `state_attr('sun.sun', 'next_rising')` / `next_setting` for arc computation is correct. These attributes update once per day at sunrise/sunset. Stable data source.
- The WeatherFlow Tempest and Davis Vantage entities use standard `sensor` domain with `device_class: temperature`, `humidity`, `pressure`, etc. These follow the standard HA sensor pattern and require no integration-specific service calls. The Tempest lightning entities (`lightning_count`, `lightning_distance`) use non-standard `device_class` values — the spec correctly handles these by entity ID matching rather than device class.
- **No service calls at all**. Zero write operations. This panel is purely reactive to entity state changes. This is the ideal pattern for a monitoring-only display.

### Code Quality & Reusability
- **DRY concern**: The `getConditionColor()`, `getConditionGlyph()`, and `getConditionLabel()` functions are 3 separate switch statements, each with 17 cases mapping the same condition string to different outputs. These should be consolidated into a single `WEATHER_CONDITIONS` lookup table:
  ```javascript
  const WEATHER_CONDITIONS = {
    'clear-night': { color: 'var(--lcars-delta)', glyph: '◆', label: 'Clear' },
    'cloudy':      { color: 'var(--lcars-gray)',  glyph: '●', label: 'Cloudy' },
    // ... 15 more
  };
  function getConditionProp(condition, prop) {
    return WEATHER_CONDITIONS[condition]?.[prop] ?? WEATHER_CONDITIONS._default[prop];
  }
  ```
  This replaces 3 × 17-case switches (~75 lines) with 1 object + 1 accessor (~25 lines). 67% reduction. More maintainable — adding a new condition is 1 line instead of 3.
- **DRY**: The SVG arc path computation in `getDayArcPath()` (§6) uses the standard parametric arc formula. This is identical in structure to the climate panel's circular gauge arc. Extract to a shared `svgArc(cx, cy, r, startAngle, endAngle)` utility.
- **KISS compliance**: High. The panel is read-only, uses no timers (except implicit hass updates), and has no user interaction beyond tapping an entity to open its more-info dialog. The forecast strip is pure CSS. The wind compass is 4 SVG elements. This is lean engineering.
- **YAGNI**: Wesley's audio cue idea (concluding quote) is firmly in YAGNI territory. Web Audio API for weather sounds would add complexity, accessibility concerns, and bundle weight for minimal functional value. Do not implement.

### Recommendations
1. **P1**: Cache forecast response. Add `_lastForecastFetch` timestamp and `_cachedForecast` data. Only re-fetch when stale (>15 min). This prevents redundant `weather.get_forecasts` calls on every hass property update.
2. **P1**: Consolidate `getConditionColor()` + `getConditionGlyph()` + `getConditionLabel()` into a single `WEATHER_CONDITIONS` lookup object. 67% fewer lines, easier to maintain, eliminates 3 parallel switch statements that must be kept in sync.
3. **P2**: Extract `svgArc()` path computation to shared utility — reusable by climate panel's circular gauge.
4. **P3**: The forecast strip hardcodes 7 `forecast-day-tile` elements. If Met.no returns fewer than 7 days (it does not currently, but WeatherFlow hourly forecasts return 24 hours, not 7 days), the strip will render empty tiles. Add a guard: `forecast.slice(0, 7).map(...)`.
5. **SKIP**: Wesley's Web Audio API idea. Fascinating, but firmly YAGNI. The audio context initialization alone would add ~0.5 KiB to the bundle.

---
