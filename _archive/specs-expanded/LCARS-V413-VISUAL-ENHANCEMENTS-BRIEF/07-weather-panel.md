## 6. Weather Panel

### 6.1 — Condition-Reactive Ambient Glow

- **What it does**: The viewscreen area gains a subtle full-bleed ambient glow behind the temperature number, colored by weather condition: sunny = warm golden glow, cloudy = cool gray, rain = deep blue, storm = flickering violet, snow = bright white. The glow is a radial gradient positioned behind the text — the "atmosphere" of the atmosphere.
- **Where it goes**: `.lcars-weather-viewscreen::before` — `background: radial-gradient(circle at 50% 50%, var(--weather-ambient-color) 0%, transparent 70%); opacity: 0.15`
- **LCARS justification**: When Data scans a planet's atmosphere, the sensor display tints to match conditions — ice worlds glow cool blue, volcanic worlds glow orange. The display itself becomes a visual summary of its content. The glow is data, not decoration.
- **Animation details**: Storm state adds `@keyframes lcars-storm-flicker` — opacity jitters between 0.1 and 0.25 at irregular intervals (use `steps()` timing). Duration: `3s`. Other conditions: static glow, `transition: background 1s ease-out` when condition changes.

### 6.2 — Wind Compass Animated Needle

- **What it does**: The wind direction indicator gains a smooth animated rotation when wind direction updates — the compass needle doesn't jump to the new bearing, it rotates to it via the shortest path. When wind speed exceeds 20mph, the needle adds a subtle oscillation (±5°) to convey gusty conditions.
- **Where it goes**: `.lcars-wind-compass .needle` SVG element — `transform: rotate(var(--wind-deg))`
- **LCARS justification**: Navigation deflector controls on TNG show vector indicators that smoothly rotate to new headings — they never snap. Helm control is continuous, not discrete. The wind compass is a miniature navigation display.
- **Animation details**: `transition: transform 800ms ease-out` for heading changes. Gusty overlay: `@keyframes lcars-gust-oscillate` — `rotate(calc(var(--wind-deg) - 5deg))` → `rotate(calc(var(--wind-deg) + 5deg))`. Duration: `0.8s alternate infinite`. Only when wind speed > 20mph threshold (set via JS class `.gusty`).

### 6.3 — Forecast Strip Temperature Range Bars

- **What it does**: The 7-day forecast strip's high/low numbers gain thin vertical colored bars between them — a visual temperature RANGE indicator. The bar spans from low (bottom, blue) to high (top, warm) with a gradient fill. The bar height is proportional to the temp range across the 7-day spread — wide-range days have tall bars, narrow-range days have short bars. Inspired by `thermostat.png` precipitation bar chart.
- **Where it goes**: `.lcars-forecast-day .temp-range-bar` — new `<div>` element between high and low temp numbers
- **LCARS justification**: The `thermostat.png` reference shows gradient bar charts for hourly precipitation. This same visual pattern applied to temperature ranges gives the forecast strip *shape* — not just numbers but a visual contour of the week ahead.
- **Animation details**: On data update, bars grow from 0 to their target height over 400ms with `@keyframes lcars-bar-grow` — `scaleY(0)→scaleY(1)`. `transform-origin: bottom`. Staggered by day index: `animation-delay: calc(var(--day-index) * 60ms)` for a left-to-right cascade effect.

### 6.4 — Sun Arc Day Progress

- **What it does**: The sunrise/sunset time display gains a thin semicircular arc above it representing the day's arc from sunrise to sunset. A bright dot tracks the sun's current position along the arc. Before sunrise and after sunset, the dot is absent and the arc dims to 20% opacity. From `thermostat.png` sun/moon indicators.
- **Where it goes**: `.lcars-sun-arc` — new SVG element, half-circle path, positioned between viewscreen and forecast strip
- **LCARS justification**: Astrometrics displays show orbital arcs for planetary bodies with current-position indicators. The sun arc is a miniature orbital display — where is our star right now? This turns a pair of timestamp numbers into a visual position readout.
- **Animation details**: The sun dot position updates via `stroke-dashoffset` keyed to current time between sunrise/sunset. `transition: stroke-dashoffset 60s linear` (updates every minute, transitions smoothly). The dot has a soft glow: `filter: drop-shadow(0 0 3px var(--lcars-gold))`.

### 6.5 — Precipitation Probability Pips

- **What it does**: Below each forecast day, the precipitation percentage is rendered as a row of 10 tiny pips (5×2 grid) — filled pips = probability. 30% = 3 filled pips out of 10. Filled pips are `--lcars-ice`, empty pips are `--lcars-gray` at 30% opacity. A spatial representation of probability rather than a number.
- **Where it goes**: `.lcars-forecast-day .precip-pips` — 10 `<span>` elements in a `display: grid; grid-template-columns: repeat(5, 4px); gap: 1px` container
- **LCARS justification**: LCARS represents probability and fill levels with discrete indicator blocks, not percentages. On TNG's tactical displays, shield strength is shown as lit/unlit segments. Precipitation probability mapped to the same visual language feels native.
- **Animation details**: On data update, pips light sequentially with 30ms stagger: `animation-delay: calc(var(--pip-index) * 30ms)`. `@keyframes lcars-pip-light` — `opacity: 0.3→1.0`. Duration: `200ms`.

---
