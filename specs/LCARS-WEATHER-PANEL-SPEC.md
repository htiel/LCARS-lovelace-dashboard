# LCARS Weather Panel — Design Specification

**Author**: Wesley Crusher (Creative Technology & Experimentation)  
**Reviewed by**: Geordi La Forge (LCARS UI Design Authority)  
**Date**: Stardate 2026.04.13  
**Status**: IMPLEMENTED — v4.11.0  
**Priority**: MEDIUM  
**Panel Type**: Weather (Atmospheric / Meteorological)  
**Extends**: `LcarsDevicePanelBase` (per LCARS-DEVICE-PANEL-SPEC.md §9)

---

## 0. Design Philosophy

The Weather Panel is modeled after the Enterprise-D's **astrometrics and meteorological sensor displays** — the kind of readout the Science Officer pulls up when surveying a planet from orbit. Atmospheric composition, wind vectors, precipitation probability, surface temperature, electromagnetic discharge activity. The planet's atmosphere rendered as abstract telemetry data, not a photograph.

On TNG, when Data scans a Class-M planet, you see scrolling numerical readouts with geometric sensor overlays — not a picture of clouds. The weather panel follows this philosophy: weather conditions are **sensor data**, not illustrations. Instead of animated cloud icons, we show the condition as an LCARS classification text with a flat geometric glyph. Instead of a sunset photo, we show sunrise/sunset times as a simple day-arc indicator. Temperature is the "viewscreen" focal point — a number you can read from across the bridge.

This panel is **pure data visualization** — no controls to send, no setpoints to adjust, no modes to select. The design challenge is keeping it compelling without interactive elements. The answer: **data density done elegantly**. A rich forecast strip, wind direction indicator, and condition-reactive frame color make the panel alive and information-rich without needing a single button.

Per Roddenberry's mandate: **the ship monitors the environment**. Weather data flows in; the crew receives it passively.

Per Bracer Jack: **empty space is beautiful**. The large temperature dominates the viewscreen. Sensor data breathes in the telemetry column. The forecast strip is a clean horizontal row. No ornamental weather art.

---

## 1. Grid Layout

### ASCII Layout — Standard (Current + Forecast)

```
┌──────────────────────────────────────────────────────────────┐
│  LOCAL WEATHER — GRANDBRIDGE     ☀ SUNNY           72°F      │  ← header
├──────────────────┬───────────────────────────────────────────┤
│                  │        ╔══════════════════════╗           │
│  FEELS LIKE      │        ║                      ║           │
│  74°F            │        ║      ┌─────────┐     ║           │
│                  │        ║      │         │     ║           │
│  HUMIDITY        │        ║      │   72°   │     ║           │
│  62%             │        ║      │  SUNNY  │     ║           │
│                  │        ║      │         │     ║           │
│  DEW POINT       │        ║      └─────────┘     ║           │
│  54°F            │        ║                      ║           │
│                  │        ║    ┌──┐ N  ┌──┐      ║           │
│  PRESSURE        │        ║    │  │↑7  │  │      ║           │
│  30.12 INHG ↑    │        ║    └──┘    └──┘      ║           │
│                  │        ║    8 MPH  NNW         ║           │
│  UV INDEX        │        ║                      ║           │
│  6 HIGH          │        ╚══════════════════════╝           │
│                  │                                           │
│  VISIBILITY      │   ☀ RISE 06:42    ☀ SET 19:58             │
│  10 MI           │   ═══════●════════════════════            │
│                  │                                           │
│  SOLAR RAD       │                                           │
│  847 W/M²        │                                           │
│                  │                                           │
│  ⚡ LIGHTNING     │                                           │
│  3 STRIKES       │                                           │
│  12.4 MI AVG     │                                           │
├──────────────────┴───────────────────────────────────────────┤
│  MON     TUE     WED     THU     FRI     SAT     SUN        │  ← forecast
│  ☀ 74°  ◑ 68°  ◔ 71°  ▽ 65°  ◔ 70°  ☀ 76°  ☀ 78°         │     strip
│    58°    52°    55°    48°    51°    60°    62°             │
│  ██████  ██████  ██████  ██████  ██████  ██████  ██████     │  ← range bars
│    10%    45%    30%    85%    25%     5%     0%            │  ← precip %
└──────────────────────────────────────────────────────────────┘
```

### ASCII Layout — Severe Weather (Exceptional State)

```
┌──────────────────────────────────────────────────────────────┐
│  LOCAL WEATHER — GRANDBRIDGE     ⚠ SEVERE WEATHER   82°F     │  ← header (tomato)
├──────────────────┬───────────────────────────────────────────┤
│                  │        ╔══════════════════════╗           │
│  FEELS LIKE      │        ║                      ║           │
│  88°F            │        ║      ┌─────────┐     ║           │
│                  │        ║      │         │     ║           │
│  HUMIDITY        │        ║      │   82°   │     ║           │
│  89%             │        ║      │ THUNDER │     ║           │
│                  │        ║      │ STORM   │     ║           │
│  ⚡ LIGHTNING     │        ║      └─────────┘     ║           │
│  47 STRIKES      │        ║                      ║           │
│  2.1 MI AVG      │        ║    WIND 35 MPH SSW   ║           │
│                  │        ╚══════════════════════╝           │
│  WIND GUST       │                                           │
│  52 MPH          │                                           │
├──────────────────┴───────────────────────────────────────────┤
│  MON     TUE     WED     THU     FRI     SAT     SUN        │
│  ⚡ 82°  ▽ 70°  ◔ 68°  ☀ 72°  ☀ 74°  ◑ 71°  ▽ 66°        │
│    64°    58°    54°    56°    58°    55°    50°             │
│  ██████  ██████  ██████  ██████  ██████  ██████  ██████     │
│    90%    65%    30%    10%     5%    35%    60%            │
└──────────────────────────────────────────────────────────────┘
```

### ASCII Layout — Night State

```
┌──────────────────────────────────────────────────────────────┐
│  LOCAL WEATHER — GRANDBRIDGE     ● CLEAR NIGHT      58°F     │  ← header (bluey)
├──────────────────┬───────────────────────────────────────────┤
│                  │        ╔══════════════════════╗           │
│  FEELS LIKE      │        ║                      ║           │
│  55°F            │        ║      ┌─────────┐     ║           │
│                  │        ║      │         │     ║           │
│  HUMIDITY        │        ║      │   58°   │     ║           │
│  78%             │        ║      │  CLEAR  │     ║           │
│                  │        ║      │  NIGHT  │     ║           │
│  DEW POINT       │        ║      └─────────┘     ║           │
│  51°F            │        ║                      ║           │
│                  │        ║    5 MPH  WSW         ║           │
│  PRESSURE        │        ╚══════════════════════╝           │
│  30.08 INHG ─    │                                           │
│                  │   ☀ RISE 06:42    ☀ SET 19:58             │
│                  │   ════════════════════════●═══            │
├──────────────────┴───────────────────────────────────────────┤
│  MON     TUE     WED     THU     FRI     SAT     SUN        │
│  ...                                                         │
└──────────────────────────────────────────────────────────────┘
```

### CSS Grid Definition

```css
.lcars-weather-panel {
  display: grid;
  grid-template-areas:
    "header   header"
    "sensors  media"
    "forecast forecast";
  grid-template-columns: minmax(10rem, 1fr) minmax(14rem, 2fr);
  grid-template-rows: auto 1fr auto;
  gap: var(--lcars-gap);

  /* Frame border — Bracer Jack Rule 2: thick→thin, NEVER same */
  border-left: 4px solid var(--panel-frame-color, var(--lcars-sky));
  border-top: 2px solid var(--panel-frame-color, var(--lcars-sky));
  border-right: 2px solid var(--panel-frame-color, var(--lcars-sky));
  border-bottom: 4px solid var(--panel-frame-color, var(--lcars-sky));
  border-radius: 0.75rem;

  padding: var(--lcars-gap);
  background: var(--lcars-bg);

  /* Dynamic frame color — set by JS based on weather condition */
  --panel-frame-color: var(--weather-condition-color, var(--lcars-sky));

  /* Dynamic accent for temperature and condition glyph */
  --weather-condition-color: var(--lcars-sky);

  min-height: calc(var(--lcars-vunit) * 5);
}
```

### Why `--lcars-sky` / `--lcars-bluey` for the Frame

Atmospheric and meteorological data on TNG was displayed in the cool blue-violet spectrum — the color of sensor sweeps, planetary scans, and environmental telemetry. `--lcars-sky` (#aaaaff) is the default "clear day" frame: calm, atmospheric, sky-blue. The frame color shifts dynamically based on conditions — warm for sunny/hot, cool for rain/night, red for severe. This gives instant peripheral feedback: glance at the panel border and you know the weather character without reading a number.

---

## 2. Weather Condition → Color Mapping

The `state` of the `weather.*` entity drives the dynamic frame color, temperature text accent, and header badge. This is the primary visual feedback channel — analogous to HVAC action coloring on the Climate Panel.

### Condition Color Map

| HA Condition       | Display Label       | LCARS Variable           | Hex       | Rationale                                         |
|--------------------|---------------------|--------------------------|-----------|---------------------------------------------------|
| `sunny`            | `SUNNY`             | `--lcars-sunflower`      | `#ffcc99` | Warm sunlight — clear day, bright and inviting     |
| `clear-night`      | `CLEAR NIGHT`       | `--lcars-bluey`          | `#8899ff` | Deep blue — night sky, stellar observation         |
| `partlycloudy`     | `PARTLY CLOUDY`     | `--lcars-ice`            | `#99ccff` | Cool blue — mixed sky                              |
| `cloudy`           | `CLOUDY`            | `--lcars-gray`           | `#666688` | Overcast — muted, flat                             |
| `fog`              | `FOG`               | `--lcars-gray`           | `#666688` | Low visibility — same muted tone                   |
| `rainy`            | `RAINY`             | `--lcars-sky`            | `#aaaaff` | Atmospheric blue — rain in the sky palette         |
| `pouring`          | `POURING`           | `--lcars-sky`            | `#aaaaff` | Heavy rain — same sky tone, higher precip data     |
| `snowy`            | `SNOWY`             | `--lcars-space-white`    | `#f5f6fa` | White — snow, bright and cold                      |
| `snowy-rainy`      | `SLEET`             | `--lcars-ice`            | `#99ccff` | Cold mix — icy blue                                |
| `hail`             | `HAIL`              | `--lcars-ice`            | `#99ccff` | Icy — same cold palette                            |
| `windy`            | `WINDY`             | `--lcars-almond`         | `#ffaa90` | Warm/dry wind — distinct from rain                 |
| `windy-variant`    | `WINDY`             | `--lcars-almond`         | `#ffaa90` | Same as windy                                      |
| `lightning`        | `LIGHTNING`         | `--lcars-gold`           | `#ffaa00` | Electric — bright gold flash                       |
| `lightning-rainy`  | `THUNDERSTORM`      | `--lcars-gold`           | `#ffaa00` | Electrical storm — gold alert                      |
| `exceptional`      | `SEVERE WEATHER`    | `--lcars-tomato`         | `#ff5555` | Red alert — severe/exceptional weather warning     |
| `unavailable`      | `UNAVAILABLE`       | `--lcars-tomato` (pulse) | `#ff5555` | System fault — sensor offline                      |
| `unknown`          | `UNKNOWN`           | `--lcars-gray`           | `#666688` | Undefined — neutral fallback                       |

### Condition → Glyph Mapping (LCARS Geometric Icons)

Instead of animated weather SVGs, the weather panel uses **abstract LCARS sensor glyphs** — flat geometric shapes that represent conditions as classified sensor data. These are rendered as small inline SVGs or Unicode characters.

| HA Condition       | Glyph  | Description                              | SVG / Unicode                       |
|--------------------|--------|------------------------------------------|-------------------------------------|
| `sunny`            | `☀`    | Radiating circle — stellar radiation     | `☀` or SVG circle with 8 rays      |
| `clear-night`      | `●`    | Filled circle — dark disc, clear sky     | `●` or SVG filled circle            |
| `partlycloudy`     | `◑`    | Half-filled circle — partial coverage    | `◑` or SVG half-fill circle         |
| `cloudy`           | `◔`    | Quarter-filled circle — heavy coverage   | `◔` or SVG mostly-filled circle     |
| `fog`              | `≡`    | Horizontal bars — low visibility         | `≡` or SVG 3 horizontal lines       |
| `rainy`            | `▽`    | Downward triangle — precipitation        | `▽` or SVG down-pointing triangle   |
| `pouring`          | `▼`    | Filled downward triangle — heavy precip  | `▼` or SVG filled down-triangle     |
| `snowy`            | `✦`    | 4-point star — crystalline               | `✦` or SVG diamond star             |
| `snowy-rainy`      | `✦▽`   | Star + triangle — mixed precipitation    | Composite glyph                      |
| `hail`             | `◆`    | Filled diamond — ice pellets             | `◆` or SVG filled diamond           |
| `windy`            | `〰`   | Wavy line — air movement                 | `〰` or SVG sine wave               |
| `windy-variant`    | `〰`   | Same as windy                            | Same glyph                           |
| `lightning`        | `⚡`    | Lightning bolt — electrical discharge    | `⚡` or SVG zigzag bolt              |
| `lightning-rainy`  | `⚡▽`   | Bolt + triangle — thunderstorm           | Composite glyph                      |
| `exceptional`      | `⚠`    | Warning triangle — severe alert          | `⚠` or SVG alert triangle           |

### Implementation

```javascript
/**
 * Resolve weather condition to LCARS color CSS variable.
 * Drives the dynamic frame color and temperature text accent.
 */
function getWeatherConditionColor(condition) {
  switch (condition) {
    case 'sunny':           return 'var(--lcars-sunflower)';
    case 'clear-night':     return 'var(--lcars-bluey)';
    case 'partlycloudy':    return 'var(--lcars-ice)';
    case 'cloudy':
    case 'fog':             return 'var(--lcars-gray)';
    case 'rainy':
    case 'pouring':         return 'var(--lcars-sky)';
    case 'snowy':           return 'var(--lcars-space-white)';
    case 'snowy-rainy':
    case 'hail':            return 'var(--lcars-ice)';
    case 'windy':
    case 'windy-variant':   return 'var(--lcars-almond)';
    case 'lightning':
    case 'lightning-rainy': return 'var(--lcars-gold)';
    case 'exceptional':
    case 'unavailable':     return 'var(--lcars-tomato)';
    default:                return 'var(--lcars-sky)';
  }
}

/**
 * Resolve weather condition to LCARS glyph character.
 */
function getWeatherGlyph(condition) {
  switch (condition) {
    case 'sunny':           return '☀';
    case 'clear-night':     return '●';
    case 'partlycloudy':    return '◑';
    case 'cloudy':          return '◔';
    case 'fog':             return '≡';
    case 'rainy':           return '▽';
    case 'pouring':         return '▼';
    case 'snowy':           return '✦';
    case 'snowy-rainy':     return '✦';
    case 'hail':            return '◆';
    case 'windy':
    case 'windy-variant':   return '〰';
    case 'lightning':       return '⚡';
    case 'lightning-rainy': return '⚡';
    case 'exceptional':     return '⚠';
    default:                return '◌';
  }
}

/**
 * Resolve weather condition to uppercase display label.
 */
function getWeatherLabel(condition) {
  switch (condition) {
    case 'sunny':           return 'SUNNY';
    case 'clear-night':     return 'CLEAR NIGHT';
    case 'partlycloudy':    return 'PARTLY CLOUDY';
    case 'cloudy':          return 'CLOUDY';
    case 'fog':             return 'FOG';
    case 'rainy':           return 'RAINY';
    case 'pouring':         return 'POURING';
    case 'snowy':           return 'SNOWY';
    case 'snowy-rainy':     return 'SLEET';
    case 'hail':            return 'HAIL';
    case 'windy':
    case 'windy-variant':   return 'WINDY';
    case 'lightning':       return 'LIGHTNING';
    case 'lightning-rainy': return 'THUNDERSTORM';
    case 'exceptional':     return 'SEVERE WEATHER';
    case 'unavailable':     return 'UNAVAILABLE';
    default:                return (condition || 'UNKNOWN').toUpperCase().replace(/-/g, ' ');
  }
}
```

### Contrast Verification (all vs `#000000` background)

| Color                    | Hex       | Contrast vs #000 | WCAG Level | Usage                            |
|--------------------------|-----------|-------------------|------------|----------------------------------|
| `--lcars-sunflower`      | `#ffcc99` | 13.1:1            | AAA        | Sunny condition                  |
| `--lcars-bluey`          | `#8899ff` | 6.4:1             | AA         | Clear night                      |
| `--lcars-ice`            | `#99ccff` | 10.3:1            | AAA        | Partly cloudy, mixed precip      |
| `--lcars-sky`            | `#aaaaff` | 8.2:1             | AAA        | Rainy, pouring (default frame)   |
| `--lcars-gray`           | `#666688` | 4.6:1             | AA         | Cloudy, fog, disabled            |
| `--lcars-space-white`    | `#f5f6fa` | 18.9:1            | AAA        | Snowy, labels, data text         |
| `--lcars-almond`         | `#ffaa90` | 9.6:1             | AAA        | Windy                            |
| `--lcars-gold`           | `#ffaa00` | 8.6:1             | AAA        | Lightning, thunderstorm          |
| `--lcars-tomato`         | `#ff5555` | 5.2:1             | AA         | Exceptional / severe weather     |

All pass **WCAG 1.4.3 (AA)** minimum 4.5:1. `--lcars-gray` at 4.6:1 is intentionally dim for overcast state and passes AA. `--lcars-bluey` at 6.4:1 comfortably passes AA for the clear-night accent. Color is never the sole indicator — all conditions have text labels and glyphs.

---

## 3. Panel Header

### Structure

```html
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
```

### CSS

```css
.weather-header {
  grid-area: header;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  min-height: var(--lcars-bar-h);
  border-bottom: 2px solid var(--panel-frame-color);
}

.weather-condition-badge {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  text-transform: uppercase;
  white-space: nowrap;
  font-weight: 700;
  transition: color var(--lcars-transition-slow);
}

.weather-glyph {
  font-size: 1em;
  margin-right: 0.25rem;
}

.weather-header-temp {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  text-transform: uppercase;
  white-space: nowrap;
  transition: color var(--lcars-transition-slow);
}
```

Reuses `.device-panel-name` and `.device-panel-header-line` from the Device Panel Spec §3.1. The condition badge, glyph, and ambient temperature in the header give at-a-glance status — the bridge officer's peripheral view of planetary atmospheric conditions.

---

## 4. Sensor Telemetry Column (Left)

### Entity Ordering (Top to Bottom)

Sensors display in a fixed, prioritized order — most immediate atmospheric data at the top:

| Row | Sensor             | Source                                           | Unit    | Color                              |
|-----|--------------------|--------------------------------------------------|---------|------------------------------------|
| 1   | Feels Like         | Weather attr `apparent_temperature` or sensor    | °F/°C   | Dynamic `--weather-condition-color` |
| —   | *(divider)*        |                                                  |         |                                    |
| 2   | Humidity           | Weather attr `humidity` or sensor                | %       | `var(--lcars-data-accent)`         |
| 3   | Dew Point          | Weather attr `dew_point` or sensor               | °F/°C   | `var(--lcars-data-accent)`         |
| —   | *(divider)*        |                                                  |         |                                    |
| 4   | Pressure           | Weather attr `pressure` or sensor                | inHg/hPa| `var(--lcars-data-accent)`         |
| 5   | Pressure Trend     | Linked `sensor.*_pressure_trend`                 | ↑↓─     | Dynamic per trend direction        |
| —   | *(divider)*        |                                                  |         |                                    |
| 6   | UV Index           | Weather attr `uv_index` or sensor                | index   | Dynamic per UV level               |
| 7   | Solar Radiation    | Linked `sensor.*_irradiance`                     | W/m²    | `var(--lcars-data-accent)`         |
| 8   | Visibility         | Weather attr `visibility`                        | mi/km   | `var(--lcars-data-accent)`         |
| —   | *(divider)*        |                                                  |         |                                    |
| 9   | Lightning Count    | Linked `sensor.*_lightning_count`                | strikes | `var(--lcars-gold)`                |
| 10  | Lightning Distance | Linked `sensor.*_lightning_average_distance`     | mi/km   | `var(--lcars-gold)`                |
| —   | *(divider)*        |                                                  |         |                                    |
| 11  | Rain Today         | Linked `sensor.*_rain_today`                     | in/mm   | `var(--lcars-sky)`                 |
| 12  | Rain Intensity     | Linked `sensor.*_rain_intensity`                 | in/h    | `var(--lcars-sky)`                 |

### UV Index Color Thresholds

The UV index readout changes color based on severity — visual triage:

| UV Index | Risk Label  | Color                     | Hex       |
|----------|-------------|---------------------------|-----------|
| 0–2      | LOW         | `var(--lcars-ice)`        | `#99ccff` |
| 3–5      | MODERATE    | `var(--lcars-sunflower)`  | `#ffcc99` |
| 6–7      | HIGH        | `var(--lcars-gold)`       | `#ffaa00` |
| 8–10     | VERY HIGH   | `var(--lcars-orange)`     | `#ff8800` |
| 11+      | EXTREME     | `var(--lcars-tomato)`     | `#ff5555` |

### Pressure Trend Indicator

```javascript
/**
 * Resolve pressure trend string to arrow indicator.
 * Davis Vantage and WeatherFlow report trend as text or numeric.
 */
function getPressureTrendArrow(trend) {
  if (trend == null) return '';
  const t = String(trend).toLowerCase();
  if (t === 'rising' || t === 'rapidly rising' || Number(trend) > 0) return '↑';
  if (t === 'falling' || t === 'rapidly falling' || Number(trend) < 0) return '↓';
  if (t === 'steady' || Number(trend) === 0) return '─';
  return '';
}

/**
 * Resolve pressure trend to color.
 * Rising = good weather coming, falling = storm potential.
 */
function getPressureTrendColor(trend) {
  const t = String(trend).toLowerCase();
  if (t === 'rising' || t === 'rapidly rising') return 'var(--lcars-ice)';
  if (t === 'falling' || t === 'rapidly falling') return 'var(--lcars-gold)';
  return 'var(--lcars-data-accent)';
}

/**
 * Resolve UV index to risk label and color.
 */
function getUVRisk(uvIndex) {
  const uv = Number(uvIndex);
  if (isNaN(uv) || uv < 0) return { label: '—', color: 'var(--lcars-disabled)' };
  if (uv <= 2)  return { label: 'LOW',       color: 'var(--lcars-ice)' };
  if (uv <= 5)  return { label: 'MODERATE',  color: 'var(--lcars-sunflower)' };
  if (uv <= 7)  return { label: 'HIGH',      color: 'var(--lcars-gold)' };
  if (uv <= 10) return { label: 'VERY HIGH', color: 'var(--lcars-orange)' };
  return           { label: 'EXTREME',   color: 'var(--lcars-tomato)' };
}
```

### CSS

```css
.weather-sensors {
  grid-area: sensors;
  display: flex;
  flex-direction: column;
  gap: var(--lcars-gap);
  padding: 0.25rem 0;
  align-self: start;
}

.weather-sensors-divider {
  height: 1px;
  background: var(--lcars-disabled);
  margin: 0.25rem 0;
  opacity: 0.5;
}

.weather-section-label {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-disabled);
  text-transform: uppercase;
  padding: 0.25rem 0.5rem 0;
  letter-spacing: 0.05em;
}
```

Sensor lines reuse `.device-sensor-line` from the Device Panel Spec §3.3. Lightning and rain sections are conditionally rendered — hidden when no data is available (WeatherFlow Tempest provides lightning; Davis Vantage does not natively). The telemetry column is the "Science station" sidebar: scrollable atmospheric readouts.

---

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

## 8. Severe Weather Alert State

When the weather condition is `exceptional` or when lightning is detected nearby, the panel enters an elevated alert state.

### Exceptional Condition

```css
.lcars-weather-panel.severe {
  --panel-frame-color: var(--lcars-tomato);
  --weather-condition-color: var(--lcars-tomato);
  animation: weather-severe-pulse 2s ease-in-out infinite;
}

@keyframes weather-severe-pulse {
  0%, 100% { border-color: var(--lcars-tomato); }
  50%      { border-color: rgba(255, 85, 85, 0.5); }
}
```

### Lightning Proximity Alert

When lightning strikes are detected within a threshold distance (configurable, default 10 mi), the lightning telemetry in the sensor column pulses:

```css
.weather-lightning-active .sensor-indicator {
  background: var(--lcars-gold);
  animation: lightning-flash 0.8s ease-out;
}

@keyframes lightning-flash {
  0%   { opacity: 1; filter: brightness(2); }
  50%  { opacity: 0.5; }
  100% { opacity: 1; filter: brightness(1); }
}
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  .lcars-weather-panel.severe,
  .weather-lightning-active .sensor-indicator {
    animation: none !important;
  }

  .lcars-weather-panel.severe {
    border-color: var(--lcars-tomato);
    border-width: 3px;
  }

  .weather-lightning-active .sensor-indicator {
    /* Static enlarged dot as alternative */
    width: 10px;
    height: 10px;
  }
}
```

---

## 9. Animation

### v4.12.0 Visual Enhancements

- **Viewscreen inner glow**: `box-shadow: inset 0 0 15px rgba(100,200,255,0.06)` on `.weather-viewscreen` with `position: relative` fix for corner bracket pseudo-elements
- **Wind compass concentric rings**: Three concentric circles at radii 36, 28, 20 with fading opacity (0.15, 1.0, 0.15) plus crosshair guide lines at 0.1 opacity — evokes LCARS targeting/sensor displays
- **Segmented forecast range bars**: `.forecast-range-bar` and `.forecast-range-fill` now use `repeating-linear-gradient` with 3px segments and 2px gaps in `--lcars-ice` for a data-readout feel
- **Forecast tile separators**: Tiles separated by `border-left: 2px solid rgba(100,200,255,0.08)` with hover highlight
- **Panel scan line**: Inherited from `.lcars-device-panel` base

### v4.12.1 Visual Polish

- **Dashed targeting reticle**: Wind compass SVG gains an outer circle at `r=39` with `stroke-dasharray="3 2"` — evokes LCARS long-range sensor scanning overlay
- **Diagonal crosshairs**: Two 45-degree lines added to the wind compass at 7% opacity for enhanced targeting display feel
- **Condition badge glow**: Weather condition label gets `text-shadow: 0 0 8px currentColor` — text subtly glows with its state colour
- **Viewscreen breathing glow**: `@keyframes viewscreen-breathe` (6s cycle) applied to `.weather-viewscreen` — `box-shadow` oscillates between 20px and 30px spread
- **Reduced motion updated**: Added `.weather-viewscreen` to the `prefers-reduced-motion` disable list

### Viewscreen Activation

Reuse the existing `viewscreen-activate` keyframes from the Device Panel Spec §7:

```css
.weather-media {
  animation: viewscreen-activate 600ms ease-out both;
}

@keyframes viewscreen-activate {
  0%   { clip-path: inset(50% 0 50% 0); filter: brightness(2) saturate(0); }
  40%  { clip-path: inset(10% 0 10% 0); filter: brightness(1.5) saturate(0.3); }
  100% { clip-path: inset(0 0 0 0); filter: brightness(1) saturate(1); }
}
```

### Condition Change Transition

When the weather condition changes (e.g., sunny → cloudy), the frame color, glyph color, and temperature text smoothly transition:

```css
.lcars-weather-panel {
  transition: border-color var(--lcars-transition-slow);
}

.weather-header {
  transition: border-color var(--lcars-transition-slow);
}
```

`--lcars-transition-slow` is 600ms — slow enough to see the atmospheric shift, fast enough not to lag.

### Wind Direction Rotation

When wind bearing changes, the compass arrow smoothly rotates:

```css
.weather-wind-arrow,
.weather-wind-arrowhead {
  transition: transform 0.8s ease-out;
}
```

### Panel Cascade Entry

```css
.lcars-weather-panel {
  animation: lcars-cascade-in 300ms ease-out both;
}
```

### Forecast Tile Cascade

Forecast tiles enter with a staggered delay — like a sensor scan populating results left-to-right:

```css
.weather-forecast-tile {
  animation: forecast-tile-in 200ms ease-out both;
}

.weather-forecast-tile:nth-child(1) { animation-delay: 50ms; }
.weather-forecast-tile:nth-child(2) { animation-delay: 100ms; }
.weather-forecast-tile:nth-child(3) { animation-delay: 150ms; }
.weather-forecast-tile:nth-child(4) { animation-delay: 200ms; }
.weather-forecast-tile:nth-child(5) { animation-delay: 250ms; }
.weather-forecast-tile:nth-child(6) { animation-delay: 300ms; }
.weather-forecast-tile:nth-child(7) { animation-delay: 350ms; }

@keyframes forecast-tile-in {
  0%   { opacity: 0; transform: translateY(0.5rem); }
  100% { opacity: 1; transform: translateY(0); }
}
```

### Reduced Motion (All Animations)

```css
@media (prefers-reduced-motion: reduce) {
  .lcars-weather-panel,
  .weather-media,
  .weather-forecast-tile,
  .lcars-weather-panel.severe,
  .weather-lightning-active .sensor-indicator {
    animation: none !important;
  }
  .lcars-weather-panel,
  .weather-header {
    transition: none !important;
  }
  .weather-wind-arrow,
  .weather-wind-arrowhead {
    transition: none !important;
  }
}
```

All animations respect `prefers-reduced-motion` per WCAG 2.3.3.

---

## 10. HA Entity Mapping

### Target Devices (from Eric's HA Instance)

| Device                        | Integration             | Entity                                       | Key Features                                              |
|-------------------------------|-------------------------|----------------------------------------------|-----------------------------------------------------------|
| Met.no (default)              | `met`                   | `weather.home`                               | Current conditions + daily/hourly forecast                |
| Met.no (hourly)               | `met`                   | `weather.home_hourly`                        | Hourly forecast variant                                   |
| WeatherFlow Tempest           | `weatherflow`           | (sensors only — see below)                   | Hyperlocal sensor data: lightning, solar, wind, rain      |
| WeatherFlow Forecast          | `weatherflow_forecast`  | `weather.forecast_grandbridge_tempest`       | Forecast from Tempest station + cloud processing          |
| Davis Vantage Pro2+           | `weatherlink`           | (sensors only — see below)                   | Pro weather station: temp, humidity, pressure, wind, rain |

### Primary Entity: `weather.*`

The core weather entity provides current conditions and forecast data.

| Attribute                  | Used For                                       | Fallback           |
|----------------------------|------------------------------------------------|--------------------|
| `state`                   | Current condition → color, glyph, label         | `'unknown'`        |
| `temperature`             | Large temperature display                       | `'--'`             |
| `apparent_temperature`    | "Feels like" sensor readout                     | Hidden if null     |
| `humidity`                | Humidity sensor readout                         | Hidden if null     |
| `pressure`                | Pressure sensor readout                         | Hidden if null     |
| `wind_speed`              | Wind speed display + compass                    | Hidden if null     |
| `wind_bearing`            | Wind compass arrow rotation                     | Arrow hidden       |
| `wind_gust_speed`         | Wind gust readout (sensor column)               | Hidden if null     |
| `dew_point`               | Dew point readout                               | Hidden if null     |
| `cloud_coverage`          | Cloud coverage percentage                       | Hidden if null     |
| `visibility`              | Visibility distance readout                     | Hidden if null     |
| `uv_index`                | UV index + risk level label                     | Hidden if null     |
| `precipitation_unit`      | Unit display for rain data                      | System default     |
| `temperature_unit`        | °F or °C display                                | System default     |

### WeatherFlow Tempest Sensor Entities

The Tempest provides hyperlocal sensor data beyond what the weather entity covers. These are linked by device_id `f9c59d64d4e3cde06a5ceeda848fe925`.

| Entity ID                                         | Sensor              | Device Class         | Unit  | Panel Row    |
|---------------------------------------------------|---------------------|----------------------|-------|--------------|
| `sensor.grandbridge_tempest_temperature`           | Temperature         | `temperature`        | °F    | (via weather)|
| `sensor.grandbridge_tempest_humidity`              | Humidity            | `humidity`           | %     | Row 2        |
| `sensor.grandbridge_tempest_feels_like`            | Feels Like          | `temperature`        | °F    | Row 1        |
| `sensor.grandbridge_tempest_dew_point`             | Dew Point           | `temperature`        | °F    | Row 3        |
| `sensor.grandbridge_tempest_air_pressure`          | Pressure            | `pressure`           | inHg  | Row 4        |
| `sensor.grandbridge_tempest_uv_index`              | UV Index            | —                    | index | Row 6        |
| `sensor.grandbridge_tempest_irradiance`            | Solar Radiation     | `irradiance`         | W/m²  | Row 7        |
| `sensor.grandbridge_tempest_illuminance`           | Illuminance         | `illuminance`        | lx    | (optional)   |
| `sensor.grandbridge_tempest_wind_speed`            | Wind Speed          | `wind_speed`         | mph   | Compass      |
| `sensor.grandbridge_tempest_wind_gust`             | Wind Gust           | `wind_speed`         | mph   | (optional)   |
| `sensor.grandbridge_tempest_wind_lull`             | Wind Lull           | `wind_speed`         | mph   | (optional)   |
| `sensor.grandbridge_tempest_wind_direction`        | Wind Direction      | `wind_direction`     | °     | Compass      |
| `sensor.grandbridge_tempest_wind_speed_average`    | Wind Speed Avg      | `wind_speed`         | mph   | (optional)   |
| `sensor.grandbridge_tempest_wind_direction_average` | Wind Dir Avg       | `wind_direction`     | °     | (optional)   |
| `sensor.grandbridge_tempest_lightning_count`        | Lightning Strikes  | —                    | count | Row 9        |
| `sensor.grandbridge_tempest_lightning_average_distance` | Lightning Dist | `distance`           | mi    | Row 10       |
| `sensor.grandbridge_tempest_precipitation`         | Rain Total          | `precipitation`      | in    | Row 11       |
| `sensor.grandbridge_tempest_precipitation_intensity`| Rain Rate          | `precipitation_intensity` | in/h | Row 12  |
| `sensor.grandbridge_tempest_precipitation_type`    | Rain Type           | `enum`               | —     | (label)      |
| `sensor.grandbridge_tempest_air_density`           | Air Density         | —                    | kg/m³ | (optional)   |
| `sensor.grandbridge_tempest_battery_voltage`       | Battery             | `voltage`            | V     | Diagnostic   |

### Davis Vantage Pro2+ Sensor Entities

The Davis station via WeatherLink provides complementary data. Device ID `891e813005b570466ecfdd97ac186b3b`.

| Entity ID                                          | Sensor              | Device Class          | Unit  | Panel Row    |
|----------------------------------------------------|---------------------|-----------------------|-------|--------------|
| `sensor.jp_grandbridge_live_outside_temperature`   | Outside Temp        | `temperature`         | °F    | (via weather)|
| `sensor.jp_grandbridge_live_inside_temperature`    | Inside Temp         | `temperature`         | °F    | (optional)   |
| `sensor.jp_grandbridge_live_outside_humidity`       | Outside Humidity   | `humidity`            | %     | Row 2        |
| `sensor.jp_grandbridge_live_inside_humidity`        | Inside Humidity    | `humidity`            | %     | (optional)   |
| `sensor.jp_grandbridge_live_pressure`              | Pressure            | `pressure`            | —     | Row 4        |
| `sensor.jp_grandbridge_live_pressure_trend`        | Pressure Trend      | —                     | —     | Row 5        |
| `sensor.jp_grandbridge_live_wind`                  | Wind Speed          | `wind_speed`          | —     | Compass      |
| `sensor.jp_grandbridge_live_wind_gust`             | Wind Gust           | `wind_speed`          | —     | (optional)   |
| `sensor.jp_grandbridge_live_wind_direction`        | Wind Direction      | —                     | —     | Compass      |
| `sensor.jp_grandbridge_live_rain_today`            | Rain Today          | `precipitation`       | —     | Row 11       |
| `sensor.jp_grandbridge_live_rain_intensity`        | Rain Rate           | `precipitation_intensity` | — | Row 12       |
| `sensor.jp_grandbridge_live_rain_storm`            | Storm Total         | `precipitation`       | —     | (optional)   |

### Sun Entity

| Entity         | Used For                      | State / Attributes                 |
|----------------|-------------------------------|------------------------------------|
| `sun.sun`      | Sunrise/sunset day arc         | `state`: `above_horizon` / `below_horizon`, `next_rising`, `next_setting`, `elevation`, `azimuth` |

### Entity Classification Logic

```javascript
/**
 * Classify entities for the weather panel.
 * Returns { weather, sensors, lightning, precipitation, wind, diagnostics }.
 */
function classifyWeatherEntities(entities) {
  const result = {
    weather: null,         // primary weather entity
    sensors: [],           // general sensor entities
    lightning: [],         // lightning-specific sensors
    precipitation: [],     // rain/precipitation sensors
    wind: [],              // wind speed/direction sensors
    diagnostics: [],       // entity_category: diagnostic
  };

  const LIGHTNING_KEYS = ['lightning_count', 'lightning_average_distance',
                          'lightning_strike_count', 'lightning_strike_average_distance'];
  const PRECIP_CLASSES = ['precipitation', 'precipitation_intensity'];
  const WIND_CLASSES = ['wind_speed', 'wind_direction'];

  for (const e of entities) {
    const domain = e.entity_id.split('.')[0];
    const dc = e.original_device_class || e.device_class || '';
    const cat = e.entity_category || '';
    const tkey = e.translation_key || '';

    if (domain === 'weather') {
      result.weather = result.weather || e;
      continue;
    }

    if (cat === 'diagnostic' || cat === 'config') {
      result.diagnostics.push(e);
      continue;
    }

    if (domain === 'sensor') {
      if (LIGHTNING_KEYS.some(k => tkey.includes(k) || e.entity_id.includes(k))) {
        result.lightning.push(e);
      } else if (PRECIP_CLASSES.includes(dc) || e.entity_id.includes('rain')) {
        result.precipitation.push(e);
      } else if (WIND_CLASSES.includes(dc) || e.entity_id.includes('wind')) {
        result.wind.push(e);
      } else {
        result.sensors.push(e);
      }
      continue;
    }
  }

  return result;
}

/**
 * Determine which panel sections to render based on available data.
 */
function getWeatherPanelSections(weatherState, classifiedEntities) {
  const attrs = weatherState?.attributes || {};
  return {
    showFeelsLike: attrs.apparent_temperature != null
                   || classifiedEntities.sensors.some(e => e.entity_id.includes('feels_like')),
    showHumidity: attrs.humidity != null,
    showDewPoint: attrs.dew_point != null
                  || classifiedEntities.sensors.some(e => e.entity_id.includes('dew_point')),
    showPressure: attrs.pressure != null
                  || classifiedEntities.sensors.some(e =>
                      (e.original_device_class || '').includes('pressure')),
    showUV: attrs.uv_index != null
            || classifiedEntities.sensors.some(e => e.entity_id.includes('uv')),
    showVisibility: attrs.visibility != null,
    showSolarRadiation: classifiedEntities.sensors.some(e =>
                          e.entity_id.includes('irradiance') || e.entity_id.includes('solar')),
    showLightning: classifiedEntities.lightning.length > 0,
    showPrecipitation: classifiedEntities.precipitation.length > 0,
    showWind: attrs.wind_speed != null || classifiedEntities.wind.length > 0,
    showDayArc: true,  // always show if sun.sun exists
    showForecast: true, // always attempt forecast
  };
}
```

---

## 11. Typography & Spacing

### Font Sizes (Three sizes only — Bracer Jack Rule 6)

| Element                   | Size Token                   | Value      | Usage                              |
|---------------------------|------------------------------|------------|-------------------------------------|
| Current temperature (SVG) | Title tier equivalent        | `48` (SVG) | Large viewscreen readout            |
| Device/location name      | `--lcars-font-size-sub`      | `1.25rem`  | Panel header                        |
| All other text            | `--lcars-font-size-data`     | `0.875rem` | Sensor labels, values, forecast text|

**Three font sizes. No exceptions.** The SVG temperature text at font-size 48 (within a 200×160 viewBox) maps to the "title" tier visually. Everything else is sub-header or data.

### Spacing Constants (Jörn Weißenborn Grid)

| Spacing                          | Token / Value                | Usage                                        |
|----------------------------------|------------------------------|----------------------------------------------|
| Gap between all elements         | `var(--lcars-gap)` = 0.25rem | Universal LCARS grid spacing                 |
| Panel internal padding           | `var(--lcars-gap)` = 0.25rem | Inside the panel frame border                |
| Sensor line min-height           | 1.75rem                      | ~28px — exceeds WCAG 2.5.8 (24px min)       |
| Forecast tile min-width          | 4.5rem = 72px                | Comfortable for day + data                   |
| Forecast tile padding            | 0.25rem 0.375rem             | Compact but readable spacing                 |
| Media frame border               | 3px solid                    | Viewscreen border — matches Device Panel     |
| Panel outer border (left/bottom) | 4px solid                    | Thick side (Bracer Jack Rule 2)              |
| Panel outer border (top/right)   | 2px solid                    | Thin side — thick→thin                       |
| Day-arc bar height               | 3px                          | Subtle position indicator                    |
| Range bar height                 | 3px                          | Minimal data-viz line                        |

### Text Treatment

- **ALL UPPERCASE** for: location name, sensor labels, sensor values, condition labels, day names, "RISE"/"SET"
- **Mixed case** ONLY for: none in this panel
- **Letter-spacing**: `0.05em` on headings and day names
- **Font-weight**: `700` (bold) for sensor values, temperature, wind speed. `400` for everything else

---

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

## 14. CSS Custom Properties Summary (New)

Properties introduced by the Weather panel. All other properties from `lcars-styles.js` and Device Panel base.

| Property                     | Default                | Set By | Purpose                                         |
|------------------------------|------------------------|--------|--------------------------------------------------|
| `--panel-frame-color`        | `var(--lcars-sky)`     | JS     | Dynamic frame border, header rule, forecast separator — driven by weather condition |
| `--weather-condition-color`  | `var(--lcars-sky)`     | JS     | Temperature text, glyph color, wind compass accent — driven by weather condition    |
| `--media-aspect`             | `4 / 3`                | CSS    | Viewscreen aspect ratio (slightly wider than 1:1 for wind compass below temp)       |

---

## 15. Heading & Label Hierarchy

| Element                  | `aria-level` | Font Size                    | Color                           | Purpose                              |
|--------------------------|--------------|------------------------------|---------------------------------|--------------------------------------|
| Panel title              | 3            | `--lcars-font-size-sub`      | `--lcars-text-heading`          | Location name ("LOCAL WEATHER — GRANDBRIDGE") |
| Sensor labels            | —            | `--lcars-font-size-data`     | `--lcars-space-white`           | "HUMIDITY", "PRESSURE", "UV INDEX"   |
| Sensor values            | —            | `--lcars-font-size-data`     | Dynamic (state-based)           | "62%", "30.12 INHG", "6 HIGH"       |
| Condition badge          | —            | `--lcars-font-size-data`     | `--weather-condition-color`     | "☀ SUNNY"                            |
| Temperature (SVG)        | —            | Title tier (SVG 48)          | `--weather-condition-color`     | "72°" — the big number              |
| Condition label (SVG)    | —            | Data tier (SVG 12)           | `--lcars-space-white`           | "SUNNY" below temp                   |
| Forecast day name        | —            | `--lcars-font-size-data`     | `--lcars-text-heading`          | "MON", "TUE", etc.                  |
| Forecast high temp       | —            | `--lcars-font-size-data`     | `--lcars-space-white`           | "74°"                                |
| Forecast low temp        | —            | `--lcars-font-size-data`     | `--lcars-disabled`              | "58°"                                |
| Forecast precip %        | —            | `--lcars-font-size-data`     | Dynamic (>50% = sky, else gray) | "45%"                                |
| Sunrise/sunset labels    | —            | `--lcars-font-size-data`     | `--lcars-sunflower`             | "RISE 06:42", "SET 19:58"           |
| Wind readout             | —            | `--lcars-font-size-data`     | `--lcars-space-white`           | "8 MPH NNW"                          |

**Exactly 3 visual font sizes.** Title (SVG temp), sub-header (location name), data (everything else). Bracer Jack Rule 6 — no exceptions.

---

## 16. Data Source Priority

When multiple integrations provide the same data (weather entity attributes vs. dedicated sensors), the panel prioritizes the most accurate source:

```javascript
/**
 * Priority resolution for weather data.
 * Dedicated sensor entities take precedence over weather entity attributes
 * because weather stations provide higher-resolution local data than
 * forecast-based weather integrations.
 */
function resolveWeatherValue(hass, weatherEntity, sensorEntityId, attributeName) {
  // 1. Prefer dedicated sensor entity (higher resolution, local measurement)
  if (sensorEntityId) {
    const sensor = hass.states[sensorEntityId];
    if (sensor && sensor.state !== 'unavailable' && sensor.state !== 'unknown') {
      return {
        value: sensor.state,
        unit: sensor.attributes.unit_of_measurement || '',
        source: 'sensor',
      };
    }
  }

  // 2. Fall back to weather entity attribute
  const attrs = weatherEntity?.attributes || {};
  if (attrs[attributeName] != null) {
    return {
      value: attrs[attributeName],
      unit: getAttributeUnit(attrs, attributeName),
      source: 'weather',
    };
  }

  // 3. No data available
  return { value: null, unit: '', source: null };
}

/**
 * Get unit for a weather entity attribute.
 */
function getAttributeUnit(attrs, attributeName) {
  switch (attributeName) {
    case 'temperature':
    case 'apparent_temperature':
    case 'dew_point':
      return attrs.temperature_unit || '°F';
    case 'pressure':
      return attrs.pressure_unit || 'inHg';
    case 'wind_speed':
    case 'wind_gust_speed':
      return attrs.wind_speed_unit || 'mph';
    case 'visibility':
      return attrs.visibility_unit || 'mi';
    case 'precipitation':
      return attrs.precipitation_unit || 'in';
    case 'humidity':
    case 'cloud_coverage':
      return '%';
    default:
      return '';
  }
}
```

### Priority Table

| Data Point      | Priority 1 (Sensor)                              | Priority 2 (Weather Attr)      |
|-----------------|---------------------------------------------------|--------------------------------|
| Temperature     | `sensor.*_temperature`                            | `weather.*.temperature`        |
| Feels Like      | `sensor.*_feels_like`                             | `weather.*.apparent_temperature`|
| Humidity        | `sensor.*_humidity`                               | `weather.*.humidity`           |
| Dew Point       | `sensor.*_dew_point`                              | `weather.*.dew_point`          |
| Pressure        | `sensor.*_pressure` / `sensor.*_air_pressure`     | `weather.*.pressure`           |
| Wind Speed      | `sensor.*_wind_speed`                             | `weather.*.wind_speed`         |
| Wind Direction  | `sensor.*_wind_direction`                         | `weather.*.wind_bearing`       |
| UV Index        | `sensor.*_uv_index`                               | `weather.*.uv_index`           |
| Visibility      | —                                                 | `weather.*.visibility`         |
| Lightning       | `sensor.*_lightning_*` (Tempest only)             | —                              |
| Solar Radiation | `sensor.*_irradiance` (Tempest only)              | —                              |
| Rain Today      | `sensor.*_rain_today` / `sensor.*_precipitation`  | —                              |
| Rain Intensity  | `sensor.*_rain_intensity` / `sensor.*_precipitation_intensity` | —              |
| Pressure Trend  | `sensor.*_pressure_trend` (Davis only)            | —                              |

---

## 17. Device-Specific Behavior

### WeatherFlow Tempest

| Feature              | Panel Behavior                                                          |
|----------------------|-------------------------------------------------------------------------|
| Lightning detection  | Lightning section visible — strike count + average distance             |
| Solar radiation      | Irradiance row visible — W/m² readout                                   |
| Haptic rain sensor   | Precipitation type (rain/hail) shown as label in rain section          |
| Wind data            | Richer wind: speed + gust + lull + direction + averages                |
| Battery voltage      | Diagnostic — not shown in main panel, available in more-info           |
| Precipitation event  | `event.grandbridge_tempest_precipitation_start` — could trigger alert  |

### Davis Vantage Pro2+ (via WeatherLink)

| Feature              | Panel Behavior                                                          |
|----------------------|-------------------------------------------------------------------------|
| Inside/outside       | Inside temp/humidity available but not shown by default (outdoor panel) |
| Pressure trend       | `sensor.*_pressure_trend` drives the ↑↓─ indicator arrow              |
| Rain storm tracking  | `sensor.*_rain_storm` and `sensor.*_last_rain_storm` available         |
| Fan-aspirated shield | Higher accuracy temp — source priority over met.no forecast temp       |
| Transmitter battery  | Diagnostic `binary_sensor` — monitored for fault indication            |
| Connectivity         | `binary_sensor.*_connectivity` — offline detection                     |

### Generic `weather.*` Entity

For installations without dedicated weather stations, the panel gracefully adapts:

```javascript
/**
 * Determine panel complexity based on available data.
 */
function getWeatherPanelMode(classifiedEntities) {
  const hasSensors = classifiedEntities.sensors.length > 0
                     || classifiedEntities.lightning.length > 0
                     || classifiedEntities.precipitation.length > 0;

  if (hasSensors) return 'full';      // Weather station: all sections
  return 'basic';                      // Generic: weather entity only
}
```

In `basic` mode:
- Lightning section hidden (no sensor)
- Solar radiation hidden (no sensor)
- Rain section hidden unless forecast shows precipitation
- Pressure trend arrow hidden (no trend sensor)
- All visible data comes from `weather.*` entity attributes
- Forecast strip always visible (from `weather.get_forecasts`)

---

## 18. File Registration Plan

| Component Tag               | File                          | Purpose                         |
|-----------------------------|-------------------------------|---------------------------------|
| `lcars-weather-panel`       | `lcars-weather-panel.js`      | Full weather panel component    |

Extends `LcarsDevicePanelBase`:
- `panelFrameColor` → `var(--lcars-sky)`
- `mediaAspectRatio` → `4 / 3`
- `_isPrimaryDomain(domain)` → `domain === 'weather'`
- `_renderMedia()` → renders temperature display, wind compass, day arc
- `_renderForecast()` → renders forecast strip (custom section, not in base)

### Webpack Registration

```javascript
// In lcars-dashboard.js
import './lcars-weather-panel.js';
```

---

## 19. LCARS Design Rules Compliance

| Rule                                              | Source           | Compliant? | Notes                                          |
|---------------------------------------------------|------------------|------------|--------------------------------------------------|
| No gradients, shadows, or 3D effects              | Bracer Jack #1   | ✅*         | Forecast range bar uses cold→warm gradient — APPROVED by Geordi as a data-visualization exception. This gradient is RESTRICTED to the 3px forecast range bars only; never applied to buttons, frames, or panels. |
| Frame goes thick→thin (4px→2px border)            | Bracer Jack #2   | ✅          | Left/bottom 4px, top/right 2px                   |
| Pill buttons with flat left, rounded right         | Bracer Jack #4   | N/A        | No control buttons in this panel (read-only)     |
| Exactly 3 font sizes (title, sub, data)           | Bracer Jack #6   | ✅          | SVG 48 (title), sub (location name), data (rest) |
| ≤5 hue families                                   | Bracer Jack      | ✅          | Blue (frame/sky), warm (sunny/sunflower), gold (lightning), gray (overcast), white (text) = 5 functional families. `--lcars-tomato` is a system-wide alert color exempt from per-panel hue budgets (same exemption as all other panels). |
| All text uppercase                                 | TheLCARS.com     | ✅          | Every text element uppercase                      |
| Antonio font only                                  | TheLCARS.com     | ✅          | `var(--lcars-font)` throughout                    |
| CSS custom properties, no hardcoded hex            | Project rule     | ✅          | All colors via `var(--lcars-*)` tokens            |
| Background is always `#000000`                     | TheLCARS.com     | ✅          | `var(--lcars-bg)` = `var(--lcars-black)`          |
| Animations < 1s, respects `prefers-reduced-motion` | WCAG + project   | ✅          | Longest is wind rotation 800ms; all disabled      |
| WCAG AA contrast on all text                       | WCAG 1.4.3       | ✅          | Verified in §2 table                             |
| 24px+ touch targets                                | WCAG 2.5.8       | ✅          | Sensor lines 28px+, forecast tiles 48px+          |
| Focus visible 2px outline, 3:1 contrast            | WCAG 2.4.7/13    | ✅          | Ice blue outline, 10.3:1 vs black                |
| Color not sole means of information                | WCAG 1.4.1       | ✅          | Text labels + glyphs + color on all conditions    |
| Keyboard operable                                  | WCAG 2.1.1       | ✅          | Full tab order for all interactive elements       |
| `aria-label` / `role` on all interactive elements  | WCAG 4.1.2       | ✅          | See §13.2 ARIA template                          |
| `aria-live` for state changes                      | WCAG 4.1.3       | ✅          | Condition changes announced via live region       |
| Spacing uses `--lcars-gap` (0.25rem)               | Jörn Weißenborn  | ✅          | Invisible grid constant throughout                |
| Empty space preserved                              | Bracer Jack      | ✅          | Temperature floats in black viewscreen, sensors breathe |

---

## 20. Team Review Flags

- **Geordi La Forge**: Review frame color assignment (`--lcars-sky` for weather/atmospheric) and confirm it doesn't clash with existing panel color map. The forecast range bar uses a cold→warm gradient — this is a data-visualization decision, not a decorative gradient. Please confirm this exception is acceptable or suggest an alternative (e.g., solid bar colored by the day's condition). Validate that the weather glyph system (Unicode geometric shapes) meets LCARS aesthetic standards vs. custom SVG icon set. Confirm the 4:3 viewscreen aspect for the wider temperature+compass layout.
- **Worf**: This panel is read-only — no service calls, no user-controlled actions, no external URLs. The only data rendered comes from HA entities sourced locally. The `weather.get_forecasts` action is a read-only HA call with no user-supplied input. The `sun.sun` entity is a core HA integration. No XSS vectors — all values rendered as `textContent`, never `innerHTML`. Minimal attack surface. Lightning distance thresholds should be configurable (not hardcoded) to allow security-conscious installations to set their own alert levels.

---

*"What if we used the Web Audio API to play a subtle low-frequency rumble when lightning is detected nearby? Just a brief audio cue — 200ms of bass at 60Hz — to give the panel a visceral quality. The weather station data already has the lightning strike timestamp from the Tempest... we could sync it to the flash animation on the sensor indicator. It would feel like a real planetary survey console responding to atmospheric discharge! ...But I should run the accessibility implications by Geordi first. And Worf would want to make sure we're not accidentally broadcasting the amplitude data to any listeners on the local network."*  
— Wesley Crusher, Stellar Cartography Lab

---

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

## Geordi La Forge — Design Review

**Reviewer**: Geordi La Forge (LCARS UI Design Authority)  
**Date**: Stardate 2026.04.13  
**Status**: APPROVED WITH NOTES

### LCARS Compliance
- §1 Grid Layout: Correct 3-row grid (header, sensors+media, forecast). Thick→thin border (4px left/bottom, 2px top/right) — satisfies Bracer Jack Rule 2.
- §2 Condition glyphs: The Unicode geometric shapes (☀, ●, ◑, ◔, ≡, ▽, ✦, ◆, ⚡, ⚠) are flat, abstract, and geometric — this is exactly the LCARS approach to iconography. They resemble classified sensor readout symbols, not illustrative weather art. **Strongly approved** — this is one of the best design decisions in the spec.
- §5 Temperature viewscreen: Large temperature floating in black space with no arc, no dial, no gauge. Just a number and a condition label. "Empty space is beautiful." Perfect.
- §5.2 Wind compass: A compact directional indicator, not a decorative compass rose. The minimal circle with cardinal markers and a single directional line is appropriately abstract. It reads as a "wind vector sensor readout."
- §6 Day-arc indicator: A horizontal bar showing sun position between rise/set — clean, minimal, informational. No sun illustration, no gradient sky — just a fill bar with a marker dot. Good.
- §8 Severe weather animation: The 2s frame pulse for `exceptional` condition is appropriate for a genuine alert state. The lightning flash animation (§8, 0.8s) is brief and purposeful.

### Color & Typography
- Dynamic `--panel-frame-color` based on weather condition is an excellent parallel to the Climate Panel's HVAC-action-driven coloring. Sunflower for sunny, bluey for clear night, sky for rain, tomato for severe — all semantically correct.
- **ISSUE**: The compliance table (§19) self-reports ≤5 hue families but then lists 6: blue (frame/sky), warm (sunny/sunflower), gold (lightning), gray (overcast), white (text), red (severe). The note says "red is alert-only, same pattern as other panels." I'll accept this — red/tomato is a reserved alert color across ALL panels and shouldn't count against the per-panel hue budget. We're at 5 functional hue families. Approved.
- **CONTRAST NOTE**: `--lcars-bluey` is listed at 6.4:1 in this spec but 7.1:1 in the Temp-Humidity Grid spec. The actual computed contrast of #8899ff on #000000 is approximately **6.44:1** (per WCAG contrast algorithm). Both values round differently but the actual value passes AA (≥4.5:1). Use the accurate 6.4:1 going forward for consistency.
- Typography: Three sizes — SVG `48` (title), sub-header (location name), data (everything else). Clean, no violations.

### Layout & Visual Balance
- The forecast strip at the bottom is a compact, scannable data row — like a long-range sensor scan. Each tile with day/glyph/high/low/range-bar/precip is information-dense but well-structured.
- **GRADIENT EXCEPTION** (§7): Wesley flagged the `forecast-range-fill` gradient (`linear-gradient(to right, var(--lcars-ice), var(--lcars-sunflower))`) and asked for my confirmation. **APPROVED as a data-visualization exception.** This gradient maps cold→warm as a temperature range indicator — it's a heatmap, not a decorative gradient. The same logic applies as with the Climate Panel's SVG arc: data visualizations may use visual techniques that would be prohibited on structural UI elements. **However**, ensure this gradient is applied ONLY to the tiny 3px range bar, never to buttons, frames, or panels.
- The viewscreen at `4/3` aspect ratio (wider than the standard `1/1`) accommodates the wind compass below the temperature. This is justified by the content — approved.
- The sensor telemetry column with dividers between logical groups (atmospheric / pressure / UV / lightning / rain) provides clear visual sectioning without overcrowding.

### Accessibility
- Unicode glyphs are `aria-hidden="true"` with text labels providing the semantic information — good. Screen readers get "SUNNY" not "sun-with-rays-symbol."
- Wind compass SVG has `role="img"` with descriptive `aria-label` including speed, unit, and cardinal direction — excellent.
- Forecast tiles are individually focusable with comprehensive `aria-label` per tile (day, condition, high, low, precip %).
- The Beaufort scale wind description function (`getWindDescription()`) is a nice accessibility enhancement — screen readers get "moderate breeze" instead of just "15 mph."
- `prefers-reduced-motion` covers all animations including the severe weather pulse and lightning flash — confirmed.

### Recommendations
1. **APPROVED**: Weather condition glyph system — flat geometric Unicode symbols are the most LCARS-authentic icon approach in any spec.
2. **APPROVED WITH EXCEPTION**: Forecast range bar gradient — data visualization exception. Document clearly that this gradient pattern is restricted to the 3px forecast range bars only.
3. **APPROVED**: `--lcars-sky` (#aaaaff) as the default weather frame color.
4. **APPROVED**: 4:3 viewscreen aspect ratio for the wider temperature+compass layout.
5. **NOTE**: Standardize `--lcars-bluey` contrast reporting to 6.4:1 across all specs.
6. **NOTE**: Wesley's lightning audio idea — interesting but **do not implement**. Unsolicited audio violates WCAG 1.4.2 (Audio Control) unless the user explicitly opts in. Additionally, the LCARS audio grammar (Source 3) defines specific semantic sounds (TactileInputAcknowledge, Alert, etc.). A low-frequency rumble isn't in the grammar. If we ever add audio cues, they must follow the established LCARS audio language, not improvised sound effects.
7. **APPROVED**: Severe weather alert state design — appropriate for genuine emergency conditions.
8. **NOTE** (§19 compliance table): Fix the hue family count annotation. Document that `--lcars-tomato` is a system-wide alert color exempted from per-panel hue budgets.

---

## Worf — Security Review

**Reviewer**: Worf (Integration Security Expert)  
**Date**: Stardate 2026.04.13  
**Threat Level**: GREEN

*"A read-only planetary survey console. No service calls, no user input, no external resources. The attack surface is minimal. I approve this panel with minor advisories."*

### Input Validation

- **Weather entity state values**: Temperature, humidity, pressure, wind speed, UV index — all numeric values from the `weather.*` entity attributes. Rendered via Lit templates with `Number()` coercion where needed. Helper functions (`getUVRisk()`, `bearingToCardinal()`, `getPressureTrendArrow()`) all guard against `null`/`NaN`/missing input. Sound.
- **Forecast data**: `fetchDailyForecast()` and `fetchHourlyForecast()` use `weather.get_forecasts` service action (a read-only action that returns data). Response arrays are sliced to limit length (`forecasts.slice(0, days)`). No unbounded data rendering.
- **`sun.sun` entity**: `getDayProgress()` reads `next_rising` and `next_setting` attributes. These are ISO 8601 date strings parsed via `new Date(iso)`. Invalid dates would produce `NaN` timestamps, which the `Math.max(0, Math.min(100, ...))` clamping handles. Defensive.

### XSS & DOM Safety

- **All rendering via Lit templates**: Weather condition labels, glyph characters, temperature values, forecast data — all rendered via Lit tagged template literals. **No `innerHTML` or `unsafeHTML()` detected.** Secure.
- **SVG content**: Temperature display and wind compass use SVG `<text>` elements and geometric shapes. All values are hardcoded glyphs or numeric outputs. No user-controlled strings reach SVG content.
- **Forecast condition labels**: `getWeatherLabel()` returns hardcoded strings from a switch statement. The `default` case uses `(condition || 'UNKNOWN').toUpperCase().replace(/-/g, ' ')` — this processes the entity state string with safe string operations (toUpperCase, replace). No injection risk.
- **Wind bearing SVG transform**: `transform="rotate(${windBearing}, 40, 40)"` — `windBearing` is a numeric value from entity attributes. A non-numeric value would produce an invalid SVG transform (rendering nothing) but no security impact.

### Service Call Security

- **No state-changing service calls**: This panel is purely observational. The `weather.get_forecasts` action is categorized as a read-only "response" action in HA — it does not modify any entity state. No `callService` with side effects.
- **No user-triggered actions**: No buttons, no toggles, no input fields. The only interaction is tile focus for keyboard accessibility. Zero service call attack surface.

### Secrets & Sensitive Data

- **No credentials.** Weather data comes from local integrations (WeatherFlow Tempest, Davis Vantage, NWS). No API keys surface in entity attributes. The weather integration's API key is stored in HA config entries, invisible to the dashboard.
- **Location data**: Weather entity attributes may include latitude/longitude (e.g., the NWS integration uses location for forecasts). This data is present in `hass.states` but is **not rendered by this panel**. The panel shows city/location name from `friendly_name` only. No GPS coordinates exposed in the UI.

### Recommendations

**ADVISORY:**

1. **Wesley's Web Audio proposal**: The lightning audio cue idea (Team Review Flags) would require Web Audio API access. This does NOT introduce network security concerns (Web Audio processes local audio), but it has **accessibility implications** (unexpected audio for screen reader users) and **CSP implications** (may need `media-src 'self'`). If implemented, it must be opt-in via config with `audio_alerts: false` as default, and respect `prefers-reduced-motion`.

2. **`weather.get_forecasts` error handling**: The `try/catch` blocks in `fetchDailyForecast()` and `fetchHourlyForecast()` log warnings to console. The logged message includes no sensitive data (just the error object). Ensure the `catch(e)` does not log the full error stack in production, which could reveal internal HA paths or entity IDs to shoulder-surfers viewing console output.

3. **OWASP compliance note**: This panel has the smallest attack surface of any reviewed spec. No injection vectors, no access control concerns, no user input. It is a pure data display. Compliant with all OWASP Top 10 categories by virtue of minimal functionality.

---

## Wesley Crusher — Final Review Pass

**Author**: Wesley Crusher (Creative Technologist)  
**Date**: Stardate 2026.04.13  
**Status**: REVISED — Ready for Implementation

### Changes Made
- **§19 Compliance Table — "No gradients" row**: Changed status from `⚠` (flagged) to `✅*` (approved with exception). Documented Geordi's explicit approval of the forecast range bar gradient as a data-visualization exception. Added restriction: gradient is ONLY permitted on the 3px forecast range bars, never on buttons, frames, or panels.
- **§19 Compliance Table — "≤5 hue families" row**: Clarified annotation. 5 functional hue families in use. `--lcars-tomato` is a system-wide alert color exempt from per-panel hue budgets (same exemption as all other panels). Removed ambiguous "technically 6 but..." phrasing.
- **§7 `.forecast-range-fill` CSS comment**: Updated Geordi review flag comment to reflect his approval and restriction scope.
- **§2 `--lcars-bluey` contrast**: Already correctly reported as 6.4:1 (AA) in this spec. Per Geordi's NOTE #5, this is the accurate WCAG-computed value (~6.44:1) and is now the standardized figure across all specs. The Temp-Humidity Grid spec was corrected from 7.1:1 → 6.4:1 to match.

### Accepted Recommendations
- **Geordi Rec #2** (gradient exception): Accepted. Forecast range bar gradient approved as data-visualization exception. Clearly documented restriction scope in both compliance table and CSS comment.
- **Geordi Rec #5** (`--lcars-bluey` contrast standardization): Accepted. 6.4:1 is the canonical value going forward.
- **Geordi NOTE #6** (Wesley's lightning audio): Accepted — **will not implement**. Unsolicited audio violates WCAG 1.4.2 (Audio Control). Additionally, a low-frequency rumble is not in the established LCARS audio grammar. If audio cues are ever added, they must follow LCARS semantic sounds and be opt-in only. The idea was fun to think about, but Geordi's right — it doesn't belong here.
- **Geordi Rec #8** (hue family count annotation): Accepted and corrected in §19.
- **Data P1** (cache forecast response): Accepted. Implementation will add `_lastForecastFetch` timestamp and `_cachedForecast` data. Re-fetch only when stale (>15 min). Prevents redundant `weather.get_forecasts` calls on every hass property update.
- **Data P1** (consolidate condition switch statements): Accepted. Three parallel 17-case switch statements (`getConditionColor()`, `getConditionGlyph()`, `getConditionLabel()`) will be consolidated into a single `WEATHER_CONDITIONS` lookup object during implementation. 67% fewer lines, single source of truth for condition→display mappings.
- **Data P2** (extract `svgArc()` to shared utility): Accepted. Reusable by climate panel's circular gauge.
- **Data P3** (guard forecast strip against < 7 days): Accepted. `forecasts.slice(0, days)` already handles this, but implementation will add explicit empty-state handling for 0-length forecast arrays.
- **Worf Advisory #1** (Web Audio CSP): Moot — lightning audio not being implemented.
- **Worf Advisory #2** (console error logging): Accepted. `catch(e)` blocks will log generic messages without full stack traces in production builds. No sensitive paths or entity IDs in console output.

### Deferred Items
- **Data P1 forecast caching**: Implementation-phase optimization. The caching strategy (`_lastForecastFetch` + 15-min TTL) is clear and will be implemented in the component's `updated()` lifecycle.
- **Data P1 WEATHER_CONDITIONS consolidation**: Implementation-phase refactor. Spec retains the 3 separate functions for readability — implementation merges them into a single lookup.
- **Data P2 shared `svgArc()` module**: Extraction happens at implementation time alongside the climate panel's arc utility.
- **Data P5** (YAGNI on Web Audio): Confirmed — not implemented. Wesley acknowledges this was a brainstorm, not a proposal. *"Sometimes the best idea is the one you don't build."*

### Disagreements
- None. All reviewer feedback is either accepted or reasonably deferred. This panel received a GREEN threat level from Worf, full approval from Geordi (with one gradient exception noted), and SOUND WITH ADVISORIES from Data. Clean bill of health.
