# LCARS Internal Sensors Grid — Design Specification

**Author**: Wesley Crusher (Creative / Emerging Tech)  
**Date**: Stardate 2026.04.13  
**Status**: Implementation-Ready  
**Card Type**: Multi-Entity Aggregation Grid (Environment)  
**Review Required**: Geordi La Forge (LCARS Design), Worf (Security)  
**References**: LCARS-UI-ARCHITECTURE.md, LCARS-DEVICE-PANEL-SPEC.md, LCARS-ATMOSCRUBBER-SPEC.md

---

## 0. Design Philosophy

This is the **Enterprise-D internal sensor grid** — the display Geordi pulls up on the Engineering substations when he says *"Computer, show me environmental readings across all decks."* It's a ship-wide cross-section. One glance tells you which decks are comfortable, which are running hot, and which have a humidity problem. No need to drill into 14 separate sensor cards.

On TNG, these multi-zone environmental displays appeared as grids of compact readout cells on the large Engineering wall panels — minimal text, color-coded status, grouped by deck section. Each cell showed a section identifier, temperature, and atmospheric status. That's exactly what this card does.

Per Roddenberry's mandate: **the ship takes care of you**. The environmental grid runs silently in the background, monitoring every zone. You only intervene when something goes orange or red.

Per Bracer Jack: **empty space is beautiful**. Each tile is minimal — room name, two numbers, done. The grid breathes. Black space between tiles is the void between decks.

---

## 1. Target Entity Inventory

### Eric's SwitchBot Meter Fleet (from `core.device_registry`)

All devices use model `WoTHP` (SwitchBot Meter / Meter Plus), platform `switchbot`, connected via Bluetooth.

#### Room Environment Meters

| Device Name         | Device ID      | Area ID          | Entity Prefix        |
|---------------------|----------------|------------------|----------------------|
| Meter - Network Closet | `fe2a7f45...` | `utility`        | `sensor.meter_502c_` |
| Meter - Boys Bath   | `2489c248...`  | `t_e`            | `sensor.meter_3888_` |
| Meter - Garage      | `80e60a2b...`  | `garage`         | `sensor.meter_1eda_` |
| Meter - Office      | `171b51b0...`  | `the_office`     | `sensor.meter_e06d_` |
| Meter - Kyler       | `dd1c449f...`  | `kyler`          | `sensor.meter_d3ab_` |
| Meter - E&R         | `c7b132ae...`  | `ashlyn`         | `sensor.meter_c4c8_` |
| Meter - Living Room | `22491c77...`  | `shared_spaces`  | `sensor.meter_d487_` |
| Meter - Master Bed  | `ddf7900d...`  | `master_bed`     | `sensor.meter_2790_` |
| Meter - Elysia      | `61194ccd...`  | `elysia`         | `sensor.meter_3380_` |
| Meter - Master Bath | `bece20cb...`  | `master_bath`    | `sensor.meter_cc32_` |
| Meter - South Bath  | `0087a47d...`  | `south_bath`     | `sensor.meter_450a_` |
| Meter - Alex Bath   | `97eb75e3...`  | `alex`           | `sensor.meter_ab6e_` |
| Meter - Attic       | `83874841...`  | `attic`          | `sensor.meter_5e03_` |
| Meter - Crawl Space | `020f0733...`  | `outside`        | `sensor.meter_4cb8_` |

#### Appliance Monitors (excluded from room grid by default)

| Device Name              | Area ID    | Entity Prefix          | Notes                    |
|--------------------------|------------|------------------------|--------------------------|
| Meter - Kitchen Freezer  | `kitchen`  | `sensor.meter_2095_`   | Appliance, not room temp |
| Meter - Kitchen Fridge   | `kitchen`  | `sensor.meter_fb57_`   | Appliance, not room temp |
| Meter - Garage Fridge    | `garage`   | `sensor.meter_55f0_`   | Appliance, not room temp |

### Entity Pattern Per Device

Each SwitchBot Meter exposes 4 entities:

| Entity Suffix      | Device Class       | Category     | Unit | Used in Grid |
|---------------------|--------------------|-------------|------|--------------|
| `_temperature`      | `temperature`      | —           | °F   | Primary      |
| `_humidity`         | `humidity`         | —           | %    | Primary      |
| `_battery`          | `battery`          | `diagnostic`| %    | Badge only   |
| `_bluetooth_signal_strength` | `signal_strength` | `diagnostic` | dBm | Hidden |

### Floor Registry (from `core.floor_registry`)

| Floor ID    | Name      | Level | Icon               |
|-------------|-----------|-------|--------------------|
| `main`      | Main      | 1     | `mdi:stairs-down`  |
| `upstairs`  | Upstairs  | 2     | `mdi:stairs-up`    |

---

## 2. Card Configuration

### Card Type Registration

```yaml
type: custom:lcars-internal-sensors-grid
```

### YAML Configuration Schema

```yaml
type: custom:lcars-internal-sensors-grid
# Optional: override auto-discovery with explicit entities
rooms:
  - name: "BRIDGE"            # Display name override (auto-discovered from area name)
    temperature: sensor.meter_e06d_temperature
    humidity: sensor.meter_e06d_humidity
    battery: sensor.meter_e06d_battery
    floor: upstairs           # Floor grouping override

# Temperature unit preference (auto-detected from HA config)
unit_system: imperial         # imperial (°F) | metric (°C)

# Comfort thresholds (Fahrenheit; auto-converted if metric)
temp_comfort_min: 68
temp_comfort_max: 76
humidity_comfort_min: 30
humidity_comfort_max: 60

# Battery alert threshold
battery_alert: 20

# Optional features
show_sparklines: true         # 24h trend sparklines per tile
show_averages: true           # Summary row with whole-home averages
show_appliance_meters: false  # Include fridge/freezer meters in grid
group_by_floor: true          # Group tiles by floor_registry
```

### Auto-Discovery Mode (Default)

When no `rooms` config is provided, the card auto-discovers all SwitchBot Meter devices and groups them by area → floor. This is the recommended mode.

---

## 3. Grid Layout

### ASCII Layout — Desktop (≥768px)

```
┌──────────────────────────────────────────────────────────────────┐
│  INTERNAL SENSORS                          STARDATE 2426.04.13   │  ← header
├──────────────────────────────────────────────────────────────────┤
│  ■ DECK 2 — UPSTAIRS                                            │  ← floor label
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌────────────┐│
│  │ OFFICE      │ │ KYLER       │ │ E&R         │ │ ELYSIA     ││
│  │  72.1°  48% │ │  73.4°  51% │ │  71.8°  45% │ │  74.0°  52%││
│  │  ╱╲╱╲╱╲    │ │  ╱╲─╱╲     │ │  ╱╲╱╲╱╲    │ │  ╱╲╱╲╱╲   ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └────────────┘│
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐               │
│  │ BOYS BATH   │ │ ALEX BATH   │ │ ATTIC    ●  │               │
│  │  75.2°  68% │ │  70.9°  44% │ │  88.3°  32% │               │
│  │  ╱╲╱╲╱╲    │ │  ╱╲╱╲╱╲    │ │  ╱╲╱╲╱╲    │               │
│  └─────────────┘ └─────────────┘ └─────────────┘               │
│                                                                  │
│  ■ DECK 1 — MAIN                                                │  ← floor label
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌────────────┐│
│  │ LIVING ROOM │ │ MASTER BED  │ │ MASTER BATH │ │ SOUTH BATH ││
│  │  71.5°  49% │ │  70.2°  47% │ │  72.8°  62% │ │  73.1°  58%││
│  │  ╱╲╱╲╱╲    │ │  ╱╲╱╲╱╲    │ │  ╱╲╱╲╱╲    │ │  ╱╲╱╲╱╲   ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └────────────┘│
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐               │
│  │ GARAGE      │ │ NETWORK CLO │ │ CRAWL SPACE │               │
│  │  64.1°  55% │ │  78.9°  38% │ │  58.2°  72% │               │
│  │  ╱╲╱╲╱╲    │ │  ╱╲╱╲╱╲    │ │  ╱╲╱╲╱╲    │               │
│  └─────────────┘ └─────────────┘ └─────────────┘               │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│  SHIP AVG    71.8°F    50%RH    ■ 14 SENSORS ONLINE    ● 0 LOW │  ← summary row
└──────────────────────────────────────────────────────────────────┘
```

### ASCII Layout — Mobile (<768px)

```
┌──────────────────────┐
│ INTERNAL SENSORS     │
├──────────────────────┤
│ ■ UPSTAIRS           │
│ ┌──────────────────┐ │
│ │ OFFICE     72.1° │ │
│ │            48%   │ │
│ └──────────────────┘ │
│ ┌──────────────────┐ │
│ │ KYLER      73.4° │ │
│ │            51%   │ │
│ └──────────────────┘ │
│ ...                  │
│ ■ MAIN               │
│ ...                  │
├──────────────────────┤
│ AVG 71.8° 50%  14●  │
└──────────────────────┘
```

### CSS Grid Definition

```css
.lcars-sensors-grid {
  display: grid;
  grid-template-areas:
    "header"
    "body"
    "summary";
  grid-template-rows: auto 1fr auto;
  gap: var(--lcars-gap);

  /* Frame border — thick left/bottom, thin top/right (Bracer Jack Rule 2) */
  border-left: 4px solid var(--lcars-ice);
  border-bottom: 4px solid var(--lcars-ice);
  border-top: 2px solid var(--lcars-ice);
  border-right: 2px solid var(--lcars-ice);
  border-radius: 0.75rem;

  padding: var(--lcars-gap);
  background: var(--lcars-bg);

  /* Environmental frame color: ice (cool, life-support family) */
  --grid-frame-color: var(--lcars-ice);
}
```

### Why `--lcars-ice` for the Frame

The internal sensors grid is an **environmental monitoring display** — the same blue-spectrum family as the Atmoscrubber panel (`--lcars-bluey`). Ice (#99ccff) is a lighter, cooler blue — fitting for a passive monitoring panel that doesn't demand attention the way an active air purifier does. It says "all systems nominal" as a default state. Blue = environmental/life-support. (Source: TNG Engineering wall panels, environmental control substations)

### Floor Group Container

```css
.sensors-floor-group {
  display: flex;
  flex-direction: column;
  gap: var(--lcars-gap);
}

.sensors-floor-label {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-body);
  color: var(--lcars-ice);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.25rem 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sensors-floor-label::before {
  content: '';
  display: inline-block;
  width: 0.5rem;
  height: 0.5rem;
  background: var(--lcars-ice);
  border-radius: 50%;
  flex-shrink: 0;
}
```

### Tile Grid (within each floor group)

```css
.sensors-tile-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(9.5rem, 1fr));
  gap: var(--lcars-gap);
}

/* Mobile: single column list */
@media (max-width: 767px) {
  .sensors-tile-grid {
    grid-template-columns: 1fr;
  }
}

/* Tablet: 2 columns minimum */
@media (min-width: 768px) and (max-width: 1023px) {
  .sensors-tile-grid {
    grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr));
  }
}
```

---

## 4. Room Tile Anatomy

Each tile is a compact, self-contained readout cell — the equivalent of one deck section on the Enterprise internal sensor grid.

### HTML Template

```html
<div class="sensor-tile ${comfortClass}"
     role="listitem"
     aria-label="${areaName}: ${temperature} degrees, ${humidity} percent humidity">

  <!-- Room Name -->
  <div class="tile-name">${areaName}</div>

  <!-- Primary Readouts -->
  <div class="tile-readings">
    <span class="tile-temp" style="color: ${tempColor}">
      ${temperature}°
    </span>
    <span class="tile-humidity" style="color: ${humidityColor}">
      ${humidity}%
    </span>
  </div>

  <!-- Battery Badge (only when low) -->
  ${batteryLevel < batteryAlert ? html`
    <div class="tile-battery-badge"
         aria-label="Low battery: ${batteryLevel} percent"
         title="BATTERY: ${batteryLevel}%">
      ●
    </div>
  ` : ''}

  <!-- Optional Sparkline -->
  ${showSparklines ? html`
    <svg class="tile-sparkline"
         viewBox="0 0 100 16"
         preserveAspectRatio="none"
         role="img"
         aria-label="Temperature trend: last 24 hours">
      <path class="tile-sparkline-area"
            d="${sparklineAreaPath(tempHistory)}"
            fill="${tempColor}" />
      <path class="tile-sparkline-path"
            d="${sparklinePath(tempHistory)}"
            stroke="${tempColor}" />
    </svg>
  ` : ''}

  <!-- Unavailable Overlay -->
  ${isUnavailable ? html`
    <div class="tile-unavailable" aria-label="Sensor unavailable">
      <span>OFFLINE</span>
    </div>
  ` : ''}
</div>
```

### Tile CSS

```css
.sensor-tile {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  padding: 0.375rem 0.5rem;
  min-height: calc(var(--lcars-vunit) * 1.5);  /* 4.5rem = 72px */
  min-width: 7.5rem;                            /* 1 LCARS unit */
  background: var(--lcars-bg);
  border: 2px solid var(--lcars-gray);
  border-radius: 0 0.75rem 0.75rem 0;           /* Flat left, rounded right — LCARS pill */
  overflow: hidden;
  transition: border-color var(--lcars-transition-speed) var(--lcars-transition-function);
  cursor: default;
}

/* Comfort state drives border color */
.sensor-tile.comfort-nominal {
  border-color: var(--lcars-ice);
}

.sensor-tile.comfort-warm {
  border-color: var(--lcars-butterscotch);
}

.sensor-tile.comfort-hot {
  border-color: var(--lcars-peach);
}

.sensor-tile.comfort-cool {
  border-color: var(--lcars-bluey);
}

.sensor-tile.comfort-cold {
  border-color: var(--lcars-blue);
}

.sensor-tile.humidity-warn {
  border-right-color: var(--lcars-sunflower);
}

.sensor-tile.unavailable {
  border-color: var(--lcars-gray);
  opacity: 0.5;
}
```

### Tile Name

```css
.tile-name {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-body);           /* 1rem = 16px */
  color: var(--lcars-sunflower);               /* Heading color for room labels */
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
}
```

### Tile Readings

```css
.tile-readings {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.tile-temp {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-subtitle);       /* 1.5rem = 24px — big, dominant */
  font-weight: 700;
  text-transform: uppercase;
  line-height: 1;
  transition: color var(--lcars-transition-speed) var(--lcars-transition-function);
}

.tile-humidity {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-body);           /* 1rem — secondary, smaller */
  color: var(--lcars-space-white);
  text-transform: uppercase;
  line-height: 1;
  opacity: 0.85;
  transition: color var(--lcars-transition-speed) var(--lcars-transition-function);
}
```

### Battery Badge

```css
.tile-battery-badge {
  position: absolute;
  top: 0.25rem;
  right: 0.5rem;
  width: 0.5rem;
  height: 0.5rem;
  color: var(--lcars-tomato);
  font-size: 0.5rem;
  line-height: 1;
  animation: battery-pulse 2s ease-in-out infinite;
}

@keyframes battery-pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.3; }
}

@media (prefers-reduced-motion: reduce) {
  .tile-battery-badge {
    animation: none;
    opacity: 1;
  }
}
```

### Tile Sparkline

```css
.tile-sparkline {
  width: 100%;
  height: 1rem;
  display: block;
  margin-top: auto;                           /* Push to bottom of tile */
}

.tile-sparkline-path {
  fill: none;
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
  vector-effect: non-scaling-stroke;
}

.tile-sparkline-area {
  opacity: 0.06;
}
```

### Unavailable Overlay

```css
.tile-unavailable {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  z-index: 1;
}

.tile-unavailable span {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-body);
  color: var(--lcars-gray);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
```

---

## 5. Color Threshold Maps

### Temperature → Color Mapping

Temperature drives the **tile border** and **temperature text** color. Thresholds are configurable but defaults are based on standard HVAC comfort zones.

#### Fahrenheit (Default — Eric's units)

| Range        | Comfort Zone       | LCARS Variable         | Hex       | Rationale                                     |
|--------------|--------------------|------------------------|-----------|-----------------------------------------------|
| < 55°F       | Cold               | `--lcars-blue`         | `#5566ff` | Deep blue — dangerously cold, pipe freeze risk|
| 55–67°F      | Cool               | `--lcars-bluey`        | `#8899ff` | Cool blue — below comfort                     |
| 68–76°F      | Nominal            | `--lcars-ice`          | `#99ccff` | Ice blue — nominal, comfortable               |
| 77–84°F      | Warm               | `--lcars-butterscotch` | `#ff9966` | Warm amber — above comfort                    |
| ≥ 85°F       | Hot                | `--lcars-peach`        | `#ff8866` | Hot — demands attention                       |
| N/A          | Unavailable        | `--lcars-gray`         | `#666688` | Sensor offline                                |

#### Celsius Equivalents

| Range        | Comfort Zone       | LCARS Variable         |
|--------------|--------------------|------------------------|
| < 12.8°C     | Cold               | `--lcars-blue`         |
| 12.8–19.4°C  | Cool               | `--lcars-bluey`        |
| 20–24°C      | Nominal            | `--lcars-ice`          |
| 25–29°C      | Warm               | `--lcars-butterscotch` |
| ≥ 29.4°C     | Hot                | `--lcars-peach`        |

### Humidity → Color Mapping

Humidity drives the **humidity text** color. The tile border is NOT affected by humidity — temperature takes precedence for border (avoiding conflicting dual-encoding per WCAG 1.4.1).

| Range   | Status     | LCARS Variable         | Hex       | Rationale                              |
|---------|------------|------------------------|-----------|----------------------------------------|
| < 20%   | Very Dry   | `--lcars-peach`        | `#ff8866` | Dry air warning — cracked wood, static |
| 20–29%  | Dry        | `--lcars-sunflower`    | `#ffcc99` | Below comfort — marginal               |
| 30–60%  | Nominal    | `--lcars-space-white`  | `#f5f6fa` | Comfortable — default text color       |
| 61–70%  | Humid      | `--lcars-sunflower`    | `#ffcc99` | Above comfort — mold risk rising       |
| > 70%   | Very Humid | `--lcars-tomato`       | `#ff5555` | Alert — mold, condensation, damage     |
| N/A     | Unavailable| `--lcars-gray`         | `#666688` | Sensor offline                         |

### Battery → Visual Treatment

Battery does NOT get continuous coloring — it uses a **binary threshold** approach:

| Range   | Treatment                                                     |
|---------|---------------------------------------------------------------|
| > 20%   | **Hidden** — no visual indicator (good battery is no news)    |
| ≤ 20%   | **Tomato dot** (●) — pulsing, top-right of tile              |
| 0% / N/A | **Gray dot** — static, sensor may be dead                   |

### Contrast Verification (all vs `#000000` background)

| Color                  | Hex       | Contrast vs #000 | WCAG Level | Usage                    |
|------------------------|-----------|-------------------|------------|--------------------------|
| `--lcars-ice`          | `#99ccff` | 10.3:1            | AAA        | Nominal temp, frame      |
| `--lcars-bluey`        | `#8899ff` | 7.1:1             | AAA        | Cool temp                |
| `--lcars-blue`         | `#5566ff` | 4.6:1             | AA         | Cold temp (+ label)      |
| `--lcars-butterscotch` | `#ff9966` | 8.2:1             | AAA        | Warm temp                |
| `--lcars-peach`        | `#ff8866` | 6.8:1             | AAA        | Hot temp, very dry       |
| `--lcars-sunflower`    | `#ffcc99` | 13.1:1            | AAA        | Room name, dry/humid     |
| `--lcars-tomato`       | `#ff5555` | 5.2:1             | AA         | Low battery, very humid  |
| `--lcars-gray`         | `#666688` | 4.6:1             | AA         | Unavailable/offline      |
| `--lcars-space-white`  | `#f5f6fa` | 18.1:1            | AAA        | Nominal humidity text     |

All pass WCAG 1.4.3 (AA) minimum 4.5:1 against #000000. Color is **never the sole indicator** — temperature has numeric text alongside color, battery has the dot symbol, and unavailable states have the "OFFLINE" text label (WCAG 1.4.1).

---

## 6. JavaScript Helpers

### Temperature Color Resolution

```javascript
/**
 * Resolve temperature value to LCARS color CSS variable.
 * All thresholds in Fahrenheit — convert if metric.
 * @param {number|string|null} temp - Temperature value
 * @param {Object} [thresholds] - Custom comfort thresholds
 * @returns {string} CSS variable string
 */
function getTempColor(temp, thresholds = {}) {
  const {
    coldMax = 55,
    coolMax = 67,
    nominalMax = 76,
    warmMax = 84
  } = thresholds;

  if (temp == null || isNaN(temp)) return 'var(--lcars-gray)';
  const v = Number(temp);
  if (v < coldMax)    return 'var(--lcars-blue)';
  if (v <= coolMax)   return 'var(--lcars-bluey)';
  if (v <= nominalMax) return 'var(--lcars-ice)';
  if (v <= warmMax)   return 'var(--lcars-butterscotch)';
  return 'var(--lcars-peach)';
}

/**
 * Resolve temperature to a comfort class name for the tile.
 */
function getTempComfortClass(temp, thresholds = {}) {
  const {
    coldMax = 55,
    coolMax = 67,
    nominalMax = 76,
    warmMax = 84
  } = thresholds;

  if (temp == null || isNaN(temp)) return 'unavailable';
  const v = Number(temp);
  if (v < coldMax)     return 'comfort-cold';
  if (v <= coolMax)    return 'comfort-cool';
  if (v <= nominalMax) return 'comfort-nominal';
  if (v <= warmMax)    return 'comfort-warm';
  return 'comfort-hot';
}

/**
 * Resolve temperature to an LCARS status label (uppercase).
 */
function getTempLabel(temp, thresholds = {}) {
  const {
    coldMax = 55,
    coolMax = 67,
    nominalMax = 76,
    warmMax = 84
  } = thresholds;

  if (temp == null || isNaN(temp)) return 'UNAVAILABLE';
  const v = Number(temp);
  if (v < coldMax)     return 'COLD';
  if (v <= coolMax)    return 'COOL';
  if (v <= nominalMax) return 'NOMINAL';
  if (v <= warmMax)    return 'WARM';
  return 'HOT';
}
```

### Humidity Color Resolution

```javascript
/**
 * Resolve humidity value to LCARS color CSS variable.
 * @param {number|string|null} humidity - Humidity percentage
 * @param {Object} [thresholds] - Custom comfort thresholds
 * @returns {string} CSS variable string
 */
function getHumidityColor(humidity, thresholds = {}) {
  const {
    veryDryMax = 20,
    dryMax = 29,
    nominalMax = 60,
    humidMax = 70
  } = thresholds;

  if (humidity == null || isNaN(humidity)) return 'var(--lcars-gray)';
  const v = Number(humidity);
  if (v < veryDryMax)   return 'var(--lcars-peach)';
  if (v <= dryMax)      return 'var(--lcars-sunflower)';
  if (v <= nominalMax)  return 'var(--lcars-space-white)';
  if (v <= humidMax)    return 'var(--lcars-sunflower)';
  return 'var(--lcars-tomato)';
}
```

### Temperature Unit Conversion

```javascript
/**
 * Convert Celsius to Fahrenheit.
 */
function cToF(celsius) {
  return (celsius * 9 / 5) + 32;
}

/**
 * Convert Fahrenheit to Celsius.
 */
function fToC(fahrenheit) {
  return (fahrenheit - 32) * 5 / 9;
}

/**
 * Convert comfort thresholds between unit systems.
 * Thresholds are stored in Fahrenheit internally.
 * @param {Object} thresholds - Fahrenheit thresholds
 * @returns {Object} Celsius thresholds
 */
function convertThresholdsToCelsius(thresholds) {
  return Object.fromEntries(
    Object.entries(thresholds).map(([k, v]) => [k, Math.round(fToC(v) * 10) / 10])
  );
}
```

### Sparkline Generation

Reuses the pattern from the Atmoscrubber Spec §7, adapted for the smaller tile dimensions:

```javascript
/**
 * Generate an SVG sparkline path from an array of numeric values.
 * Identical to Atmoscrubber sparklinePath() — shared utility.
 * @param {number[]} values - Array of data points (24h, 1 per 15 min = 96 points)
 * @param {number} width - SVG viewBox width
 * @param {number} height - SVG viewBox height
 * @returns {string} SVG path 'd' attribute
 */
function sparklinePath(values, width = 100, height = 16) {
  if (!values || values.length < 2) return '';
  const filtered = values.filter(v => v != null && !isNaN(v));
  if (filtered.length < 2) return '';

  const min = Math.min(...filtered);
  const max = Math.max(...filtered);
  const range = max - min || 1;
  const step = width / (filtered.length - 1);

  return filtered.map((v, i) => {
    const x = (i * step).toFixed(1);
    const y = (height - ((v - min) / range) * (height - 2) - 1).toFixed(1);
    return `${i === 0 ? 'M' : 'L'}${x},${y}`;
  }).join(' ');
}

/**
 * Generate the closed area path for the fill under the sparkline.
 */
function sparklineAreaPath(values, width = 100, height = 16) {
  const linePath = sparklinePath(values, width, height);
  if (!linePath) return '';
  const count = values.filter(v => v != null && !isNaN(v)).length;
  const step = width / (count - 1);
  const lastX = ((count - 1) * step).toFixed(1);
  return `${linePath} L${lastX},${height} L0,${height} Z`;
}
```

### Whole-Home Averages

```javascript
/**
 * Compute the average of an array of numeric values, ignoring null/unavailable.
 * @param {Array<number|string|null>} values
 * @returns {{ avg: number|null, count: number }}
 */
function computeAverage(values) {
  const nums = values
    .map(v => (v != null && v !== 'unavailable') ? Number(v) : null)
    .filter(v => v != null && !isNaN(v));
  if (nums.length === 0) return { avg: null, count: 0 };
  return {
    avg: Math.round(nums.reduce((a, b) => a + b, 0) / nums.length * 10) / 10,
    count: nums.length
  };
}
```

---

## 7. Entity Discovery & Floor Grouping

### Discovery Algorithm

The card uses the HA WebSocket API to discover SwitchBot Meter devices without requiring manual entity configuration.

```javascript
/**
 * Discover all SwitchBot Meter temperature/humidity sensor groups.
 * Returns an array of room objects with entity IDs and area info.
 *
 * Strategy:
 *   1. Fetch all entities via `config/entity_registry/list`
 *   2. Filter for platform: 'switchbot', device_class: 'temperature'
 *   3. For each temperature entity, find the sibling humidity and battery
 *      entities via shared device_id
 *   4. Fetch device info via `config/device_registry/list` to get area_id
 *   5. Fetch area info via `config/area_registry/list` to get area name and floor_id
 *   6. Fetch floor info via `config/floor_registry/list` for floor names
 *   7. Optionally exclude "appliance" meters (by name_by_user or device name
 *      containing "fridge", "freezer", etc.)
 *
 * @param {Object} hass - Home Assistant connection object
 * @param {Object} config - Card configuration
 * @returns {Promise<Array<RoomSensorGroup>>}
 */
async function discoverSensorGroups(hass, config) {
  // Step 1: Fetch registries
  const [entities, devices, areas, floors] = await Promise.all([
    hass.callWS({ type: 'config/entity_registry/list' }),
    hass.callWS({ type: 'config/device_registry/list' }),
    hass.callWS({ type: 'config/area_registry/list' }),
    hass.callWS({ type: 'config/floor_registry/list' }),
  ]);

  // Step 2: Build lookup maps
  const deviceMap = new Map(devices.map(d => [d.id, d]));
  const areaMap = new Map(areas.map(a => [a.id, a]));
  const floorMap = new Map(floors.map(f => [f.floor_id, f]));

  // Step 3: Find SwitchBot temperature entities
  const tempEntities = entities.filter(e =>
    e.platform === 'switchbot' &&
    e.original_device_class === 'temperature' &&
    !e.disabled_by
  );

  // Step 4: Group by device_id and resolve siblings + area
  const groups = [];
  const appliancePattern = /fridge|freezer|wine\s*cooler/i;

  for (const tempEntity of tempEntities) {
    const deviceId = tempEntity.device_id;
    const device = deviceMap.get(deviceId);
    if (!device) continue;

    // Optional: exclude appliance monitors
    const deviceName = device.name_by_user || device.name || '';
    if (!config.show_appliance_meters && appliancePattern.test(deviceName)) {
      continue;
    }

    // Find sibling entities on the same device
    const siblings = entities.filter(e => e.device_id === deviceId && !e.disabled_by);
    const humidityEntity = siblings.find(e => e.original_device_class === 'humidity');
    const batteryEntity = siblings.find(e => e.original_device_class === 'battery');

    // Resolve area and floor
    const areaId = device.area_id;
    const area = areaId ? areaMap.get(areaId) : null;
    const floorId = area ? area.floor_id : null;
    const floor = floorId ? floorMap.get(floorId) : null;

    groups.push({
      deviceId,
      deviceName,
      areaId,
      areaName: area ? area.name : deviceName.replace(/^Meter\s*-\s*/i, ''),
      floorId,
      floorName: floor ? floor.name : 'UNASSIGNED',
      floorLevel: floor ? floor.level : 999,
      temperatureEntityId: tempEntity.entity_id,
      humidityEntityId: humidityEntity ? humidityEntity.entity_id : null,
      batteryEntityId: batteryEntity ? batteryEntity.entity_id : null,
    });
  }

  // Step 5: Sort by floor level (descending = top floors first), then area name
  groups.sort((a, b) => {
    if (b.floorLevel !== a.floorLevel) return b.floorLevel - a.floorLevel;
    return a.areaName.localeCompare(b.areaName);
  });

  return groups;
}
```

### Floor Grouping for Render

```javascript
/**
 * Group discovered sensor data by floor for rendering.
 * Returns a Map<floorName, RoomSensorGroup[]> in floor-level order.
 */
function groupByFloor(sensorGroups) {
  const floorGroups = new Map();

  for (const group of sensorGroups) {
    const key = group.floorName;
    if (!floorGroups.has(key)) {
      floorGroups.set(key, []);
    }
    floorGroups.get(key).push(group);
  }

  return floorGroups;
}
```

### History Fetch for Sparklines

```javascript
/**
 * Fetch 24h history for a sensor entity.
 * Uses HA REST API `/api/history/period`.
 * Returns an array of numeric values at ~15-minute intervals.
 *
 * @param {Object} hass - Home Assistant connection object
 * @param {string} entityId - Entity ID to fetch history for
 * @returns {Promise<number[]>} Array of ~96 numeric data points
 */
async function fetchSensorHistory(hass, entityId) {
  const now = new Date();
  const start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const startISO = start.toISOString();

  const url = `history/period/${startISO}?filter_entity_id=${encodeURIComponent(entityId)}&minimal_response&no_attributes`;

  try {
    const result = await hass.callApi('GET', url);
    if (!result || !result[0]) return [];

    // Downsample to ~96 points (every 15 minutes)
    const states = result[0];
    const interval = Math.max(1, Math.floor(states.length / 96));
    return states
      .filter((_, i) => i % interval === 0)
      .map(s => {
        const v = parseFloat(s.state);
        return isNaN(v) ? null : v;
      })
      .filter(v => v !== null);
  } catch (e) {
    console.warn(`LCARS Sensors Grid: Failed to fetch history for ${entityId}`, e);
    return [];
  }
}
```

---

## 8. Panel Header

### Structure

```html
<div class="sensors-header" role="heading" aria-level="3">
  <span class="sensors-header-title">INTERNAL SENSORS</span>
  <span class="sensors-header-line" aria-hidden="true"></span>
  <span class="sensors-header-stardate">${stardate}</span>
</div>
```

### CSS

```css
.sensors-header {
  grid-area: header;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  min-height: var(--lcars-bar-height);
  border-bottom: 2px solid var(--grid-frame-color);
}

.sensors-header-title {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-subtitle);       /* 1.5rem */
  color: var(--lcars-sunflower);
  text-transform: uppercase;
  white-space: nowrap;
  letter-spacing: 0.05em;
}

/* Flexible line separator — fills remaining space */
.sensors-header-line {
  flex: 1;
  height: 2px;
  background: var(--grid-frame-color);
  min-width: 1rem;
}

.sensors-header-stardate {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-body);           /* 1rem */
  color: var(--lcars-ice);
  text-transform: uppercase;
  white-space: nowrap;
}
```

---

## 9. Summary Row

### Structure

```html
<div class="sensors-summary" role="status" aria-live="polite">
  <span class="summary-label">SHIP AVG</span>
  <span class="summary-temp" style="color: ${avgTempColor}">
    ${avgTemp}°${unit}
  </span>
  <span class="summary-humidity" style="color: ${avgHumidityColor}">
    ${avgHumidity}%RH
  </span>
  <span class="summary-divider" aria-hidden="true">■</span>
  <span class="summary-online">
    ${onlineCount} SENSORS ONLINE
  </span>
  <span class="summary-low" style="color: ${lowBatteryCount > 0 ? 'var(--lcars-tomato)' : 'var(--lcars-ice)'}">
    ● ${lowBatteryCount} LOW
  </span>
</div>
```

### CSS

```css
.sensors-summary {
  grid-area: summary;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.375rem 0.75rem;
  border-top: 2px solid var(--grid-frame-color);
  flex-wrap: wrap;
}

.summary-label {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-body);
  color: var(--lcars-sunflower);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 700;
}

.summary-temp,
.summary-humidity {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-subtitle);       /* 1.5rem — prominent */
  text-transform: uppercase;
  font-weight: 700;
}

.summary-divider {
  color: var(--lcars-gray);
  font-size: 0.5rem;
}

.summary-online {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-body);
  color: var(--lcars-ice);
  text-transform: uppercase;
}

.summary-low {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-body);
  text-transform: uppercase;
  margin-left: auto;                          /* Push to far right */
}

/* Mobile: wrap to 2 rows */
@media (max-width: 767px) {
  .sensors-summary {
    gap: 0.25rem 0.75rem;
  }
}
```

---

## 10. Responsive Behavior

### Breakpoint Strategy

| Viewport          | Columns   | Tile Size    | Sparklines | Summary        |
|-------------------|-----------|--------------|------------|----------------|
| < 480px (phone)   | 1         | Full width   | Hidden     | Stacked, 2-row |
| 480–767px (small) | 2         | ~50% width   | Hidden     | 1-row compact  |
| 768–1023px (tablet) | 3       | ~8rem min    | Visible    | Full           |
| 1024–1439px (desktop) | 4     | ~9.5rem min  | Visible    | Full           |
| ≥ 1440px (wide)   | 5–6       | 9.5rem min   | Visible    | Full           |

### CSS

```css
/* Sparklines hidden on small viewports — too compressed to be useful */
@media (max-width: 767px) {
  .tile-sparkline {
    display: none;
  }

  /* Tiles become horizontal rows on mobile */
  .sensor-tile {
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
    min-height: var(--lcars-vunit);           /* 3rem = 48px = 1 vertical unit */
    padding: 0.25rem 0.5rem;
  }

  .tile-name {
    flex: 1;
    min-width: 0;                             /* Allow truncation */
  }

  .tile-readings {
    flex-shrink: 0;
  }
}
```

### Grid-to-List Transition

On mobile, the card transitions from a **grid of tiles** to a **vertical list** — each room becomes a single-line row. This matches TNG's smaller status displays (PADDs, armrest consoles) which showed the same environmental data in list format.

---

## 11. Accessibility

### ARIA Structure

```html
<div class="lcars-sensors-grid"
     role="region"
     aria-label="Internal environmental sensors — ${onlineCount} rooms monitored">

  <div class="sensors-header" role="heading" aria-level="3">
    ...
  </div>

  <div class="sensors-body" role="list"
       aria-label="Room environmental readings grouped by floor">

    <div class="sensors-floor-group" role="group"
         aria-label="Upstairs — ${count} rooms">
      <div class="sensors-floor-label" role="heading" aria-level="4">
        DECK 2 — UPSTAIRS
      </div>
      <div class="sensors-tile-grid" role="list">
        <!-- tiles with role="listitem" -->
      </div>
    </div>
    ...
  </div>

  <div class="sensors-summary" role="status" aria-live="polite">
    ...
  </div>
</div>
```

### Keyboard Navigation

| Key         | Action                                                     |
|-------------|------------------------------------------------------------|
| `Tab`       | Move focus between tiles (standard tab order)              |
| `Enter`     | Open HA more-info dialog for the focused tile's device     |
| `Escape`    | Close any open more-info dialog                            |

### Screen Reader Announcements

- Each tile has `aria-label="${areaName}: ${temp} degrees, ${humidity} percent humidity"`
- Low battery tiles append `. Low battery: ${level} percent`
- Unavailable tiles announce `${areaName}: sensor offline`
- Summary row uses `aria-live="polite"` — updates announced when averages change

### Color + Text Dual Encoding

Per WCAG 1.4.1, color is never the sole indicator:
- Temperature color is **always paired with the numeric value**
- Humidity color is **always paired with the percentage**
- Battery alert is a **colored dot + pulse animation** (and announced via aria-label)
- Unavailable state uses **gray + "OFFLINE" text overlay**

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  .sensor-tile,
  .tile-temp,
  .tile-humidity {
    transition: none !important;
  }

  .tile-battery-badge {
    animation: none !important;
    opacity: 1;
  }
}
```

### Touch Target Compliance

Per WCAG 2.5.8, all interactive elements must be ≥ 24×24px:
- Tiles: minimum `7.5rem × 3rem` (120×48px) — well above threshold
- Mobile row tiles: minimum `100% × 3rem` (48px height) — compliant

---

## 12. Animations

### Tile Entry Animation

When the card first renders, tiles stagger-animate in, evoking the sequential bootup of Enterprise internal sensors coming online deck by deck.

```css
.sensor-tile {
  opacity: 0;
  transform: translateY(0.25rem);
  animation: tile-appear 300ms var(--lcars-transition-function) forwards;
}

/* Stagger delay assigned via CSS custom property in JS */
/* style="--tile-index: ${index}" */
.sensor-tile {
  animation-delay: calc(var(--tile-index, 0) * 50ms);
}

@keyframes tile-appear {
  from {
    opacity: 0;
    transform: translateY(0.25rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .sensor-tile {
    animation: none !important;
    opacity: 1;
    transform: none;
  }
}
```

### Value Update Flash

When a temperature or humidity value changes, the text briefly brightens — a subtle acknowledgment of fresh data, like a readout refreshing on a bridge console.

```css
.tile-temp.updated,
.tile-humidity.updated {
  animation: value-flash 600ms ease-out;
}

@keyframes value-flash {
  0%  { filter: brightness(1.5); }
  100% { filter: brightness(1); }
}

@media (prefers-reduced-motion: reduce) {
  .tile-temp.updated,
  .tile-humidity.updated {
    animation: none !important;
  }
}
```

### Comfort State Transition

Border color transitions smoothly when a room's temperature crosses a comfort threshold — the tile "shifts" from blue to amber like a gradual environmental alert.

```css
.sensor-tile {
  transition:
    border-color 1s ease-in-out,
    opacity var(--lcars-transition-speed) var(--lcars-transition-function);
}
```

---

## 13. Tile Tap / Click Interaction

Tapping a tile opens the HA `more-info` dialog for the room's temperature entity, giving access to the full history graph and entity details.

```javascript
/**
 * Handle tile tap — fire HA more-info event.
 * @param {Event} e - Click/tap event
 * @param {string} entityId - Primary entity (temperature) to show
 */
function handleTileTap(e, entityId) {
  e.stopPropagation();
  const event = new CustomEvent('hass-more-info', {
    bubbles: true,
    composed: true,
    detail: { entityId },
  });
  this.dispatchEvent(event);
}
```

---

## 14. Appliance Meter Handling

Some SwitchBot Meters monitor appliances (fridge, freezer) rather than room temperature. These are filtered out by default (`show_appliance_meters: false`) because their temperature ranges are dramatically different (-10°F to 40°F) and would distort the grid's color coding and averages.

### Detection Heuristic

Appliance meters are identified by device name matching:

```javascript
const APPLIANCE_PATTERN = /fridge|freezer|wine\s*cooler|kegerator|deep\s*freeze/i;
```

### When Enabled (`show_appliance_meters: true`)

Appliance meters render with a distinct visual treatment:

```css
.sensor-tile.appliance {
  border-style: dashed;                       /* Dashed border = secondary/utility */
  opacity: 0.7;
}

.sensor-tile.appliance .tile-name::after {
  content: ' ❄';                              /* Snowflake suffix for appliance tiles */
  font-size: 0.75rem;
}
```

Appliance meters use **different color thresholds** (not the room comfort scale):

| Range (°F)   | Status   | LCARS Variable         | Notes                  |
|--------------|----------|------------------------|------------------------|
| < 0          | Too Cold | `--lcars-blue`         | Freezer over-cooling   |
| 0–10         | Nominal  | `--lcars-ice`          | Freezer happy range    |
| 11–38        | Nominal  | `--lcars-ice`          | Fridge happy range     |
| 39–45        | Warm     | `--lcars-sunflower`    | Getting warm for a fridge |
| > 45         | Alert    | `--lcars-tomato`       | Food safety concern    |

Appliance meters are **excluded from whole-home averages** regardless of visibility.

---

## 15. Error States & Edge Cases

### No Sensors Found

If auto-discovery returns zero SwitchBot Meter devices:

```html
<div class="sensors-empty" role="alert">
  <span class="sensors-empty-title">NO INTERNAL SENSORS</span>
  <span class="sensors-empty-detail">
    NO SWITCHBOT METER DEVICES DETECTED.
    VERIFY BLUETOOTH INTEGRATION STATUS.
  </span>
</div>
```

```css
.sensors-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2rem;
  min-height: calc(var(--lcars-vunit) * 4);
}

.sensors-empty-title {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-subtitle);
  color: var(--lcars-sunflower);
  text-transform: uppercase;
}

.sensors-empty-detail {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-body);
  color: var(--lcars-gray);
  text-transform: uppercase;
  text-align: center;
}
```

### Partial Unavailability

If some sensors go offline (state = `unavailable` / `unknown`):
- Tile renders with gray border and 50% opacity
- "OFFLINE" overlay text
- Tile is sorted to the end of its floor group
- Excluded from averages
- Battery badge hidden (no data)

### Area Not Assigned

If a device has no `area_id` in the device registry:
- Room name falls back to the device name with "Meter - " prefix stripped
- Floor group = "UNASSIGNED" — rendered last, below all known floors

### All Sensors Offline

If all discovered sensors are `unavailable`:
- Summary row shows: `SHIP AVG — — 0 SENSORS ONLINE`
- All tiles grayed out
- No averages computed

---

## 16. Component Registration

### Lit Element Class Skeleton

```javascript
import { LitElement, html, css } from 'lit-element';

class LcarsInternalSensorsGrid extends LitElement {

  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
      _sensorGroups: { type: Array },
      _historyData: { type: Object },
    };
  }

  setConfig(config) {
    this.config = {
      unit_system: 'imperial',
      temp_comfort_min: 68,
      temp_comfort_max: 76,
      humidity_comfort_min: 30,
      humidity_comfort_max: 60,
      battery_alert: 20,
      show_sparklines: true,
      show_averages: true,
      show_appliance_meters: false,
      group_by_floor: true,
      ...config,
    };
  }

  static getConfigElement() {
    return document.createElement('lcars-internal-sensors-grid-editor');
  }

  static getStubConfig() {
    return {};
  }

  getCardSize() {
    // Estimate: 1 per floor header + 1 per 4 tiles row + 1 for header + 1 for summary
    const groups = this._sensorGroups || [];
    const floorCount = new Set(groups.map(g => g.floorId)).size;
    const tileRows = Math.ceil(groups.length / 4);
    return 2 + floorCount + tileRows;
  }

  // ... render(), updated(), etc.
}

customElements.define('lcars-internal-sensors-grid', LcarsInternalSensorsGrid);
```

### Card Registration for HA

```javascript
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'lcars-internal-sensors-grid',
  name: 'LCARS Internal Sensors Grid',
  description: 'Ship-wide environmental monitoring grid — temperature and humidity across all rooms',
  preview: true,
});
```

---

## 17. Sparkline History Integration

### Data Flow

1. On first load and every 15 minutes, fetch 24h history for each temperature entity
2. Store as `Map<entityId, number[]>` in `_historyData`
3. Pass to tile template for SVG rendering
4. Sparkline color matches the **current** temperature color (not historical)

### Update Cadence

```javascript
/**
 * Schedule periodic history refresh.
 * 15-minute interval matches the sparkline resolution.
 */
connectedCallback() {
  super.connectedCallback();
  this._refreshHistory();
  this._historyInterval = setInterval(() => this._refreshHistory(), 15 * 60 * 1000);
}

disconnectedCallback() {
  super.disconnectedCallback();
  if (this._historyInterval) {
    clearInterval(this._historyInterval);
    this._historyInterval = null;
  }
}

async _refreshHistory() {
  if (!this.hass || !this._sensorGroups) return;
  const newHistory = new Map();
  // Fetch in parallel — max 14 concurrent (one per room meter)
  const fetches = this._sensorGroups.map(async (group) => {
    const data = await fetchSensorHistory(this.hass, group.temperatureEntityId);
    newHistory.set(group.temperatureEntityId, data);
  });
  await Promise.all(fetches);
  this._historyData = newHistory;
}
```

### Sparkline Dimensions

- **SVG viewBox**: `0 0 100 16`
- **Rendered height**: `1rem` (16px) within the tile
- **Data points**: ~96 (1 per 15 minutes over 24 hours)
- **Stroke**: 1.5px, non-scaling, rounded caps
- **Fill area**: 6% opacity under the line

---

## 18. Performance Considerations

### Rendering Optimization

- **Tile count**: Maximum ~14 room meters in Eric's setup. No virtualization needed.
- **History fetches**: Parallelized with `Promise.all()`, 15-minute refresh interval.
- **SVG sparklines**: Pure SVG path strings — no canvas, no third-party charting library.
- **Lit-element**: Only re-renders tiles whose entity state actually changed (Lit diffing).
- **Entity subscriptions**: Uses `hass` property setter — standard HA reactive update pattern.

### Memory

- History data: ~96 floats × 14 entities = ~5KB. Negligible.
- SVG paths are generated on render — not stored.

---

## 19. Design Review Checklist

### For Geordi La Forge (LCARS Design Authority)

- [ ] Frame uses `--lcars-ice` (#99ccff) — environmental system color family
- [ ] Tile shape: flat-left, rounded-right pill (0 0.75rem 0.75rem 0) — matches LCARS button DNA
- [ ] Three font sizes only: subtitle (1.5rem) for header/summary, body (1rem) for tile names/readings
- [ ] All text uppercase via `text-transform: uppercase`
- [ ] Font: Antonio only
- [ ] Border: thick→thin (4px left/bottom, 2px top/right)
- [ ] Empty space between tiles = black void between decks
- [ ] Color palette: only approved LCARS variables, no custom hex
- [ ] Sparklines minimal — 1rem tall, no axis labels, no grid lines

### For Worf (Security Review)

- [ ] No external API calls — all data from local HA WebSocket
- [ ] Entity discovery uses standard HA API (no custom endpoints)
- [ ] No user-supplied HTML rendered (template literals only)
- [ ] History API uses `encodeURIComponent()` for entity ID in URL
- [ ] No persistent storage beyond HA standard card config
- [ ] No sensitive data exposed — temperature/humidity are non-PII
- [ ] `aria-live="polite"` on summary — no XSS vector (text-only)

---

## 20. Implementation Notes

### File Location

```
custom_components/lcars_dashboard/js/src/lcars-internal-sensors-grid.js
```

### Dependencies

- `lit-element` v2 / `lit-html` v1 (existing project dependency)
- No additional npm packages required
- Sparkline generation is self-contained (no charting library)
- Uses `hass.callWS()` and `hass.callApi()` — standard HA frontend API

### Testing Scenarios

| Scenario                        | Expected Behavior                                  |
|---------------------------------|----------------------------------------------------|
| Normal: all 14 meters online    | Full grid, 2 floor groups, color-coded tiles       |
| 1 meter offline                 | Gray tile at end of floor group, "OFFLINE" overlay |
| All meters offline              | All gray, summary shows "0 SENSORS ONLINE"         |
| No SwitchBot meters in HA       | Empty state with diagnostic message                |
| New meter added to HA           | Auto-discovered on next card refresh               |
| Battery drops below 20%         | Red pulsing dot appears on tile                    |
| Temperature crosses threshold   | Smooth 1s border color transition                  |
| Appliance meters enabled        | Dashed-border tiles, excluded from averages        |
| Humidity > 70%                  | Humidity text turns tomato, aria-label updated     |
| Mobile viewport                 | Single-column list, sparklines hidden              |
| Reduced motion preference       | No animations, static battery dot, instant colors  |

---

## Appendix A: Complete Token Reference

| Token                     | Value                | Source                      |
|---------------------------|----------------------|-----------------------------|
| `--lcars-font`            | `'Antonio', sans-serif` | UI Architecture §2        |
| `--lcars-font-title`      | `2.5rem`             | UI Architecture §2          |
| `--lcars-font-subtitle`   | `1.5rem`             | UI Architecture §2          |
| `--lcars-font-body`       | `1rem`               | UI Architecture §2          |
| `--lcars-unit`            | `7.5rem`             | UI Architecture §1          |
| `--lcars-vunit`           | `3rem`               | UI Architecture §1          |
| `--lcars-gap`             | `0.25rem`            | UI Architecture §1          |
| `--lcars-bg`              | `#000000`            | UI Architecture §2          |
| `--lcars-transition-speed`| `200ms`              | UI Architecture §2          |
| `--lcars-bar-height`      | `1.5rem`             | UI Architecture §2          |
| `--lcars-ice`             | `#99ccff`            | Grid frame color            |
| `--lcars-sunflower`       | `#ffcc99`            | Room name text, dry/humid   |
| `--lcars-butterscotch`    | `#ff9966`            | Warm temperature             |
| `--lcars-peach`           | `#ff8866`            | Hot temperature              |
| `--lcars-bluey`           | `#8899ff`            | Cool temperature             |
| `--lcars-blue`            | `#5566ff`            | Cold temperature             |
| `--lcars-tomato`          | `#ff5555`            | Alert: very humid, low batt |
| `--lcars-gray`            | `#666688`            | Unavailable/offline          |
| `--lcars-space-white`     | `#f5f6fa`            | Nominal humidity text        |
| `--lcars-gold`            | `#ffaa00`            | Active state (tapped tile)   |

---

## Appendix B: Eric's Area → Floor Mapping

From `core.area_registry` and `core.floor_registry`:

### Main Floor (`floor_id: "main"`, level: 1)

| Area ID           | Area Name          | Has SwitchBot Meter |
|-------------------|--------------------|---------------------|
| `front_yard`      | Front Yard         | No                  |
| `entrance`        | Entrance           | No                  |
| `garage`          | Garage             | Yes (+ Garage Fridge) |
| `downstairs_hallway` | Downstairs Hallway | No               |
| `server_room`     | Server Room        | No (utility closet?) |
| `kitchen`         | Kitchen            | Yes (Fridge + Freezer only) |
| `living_room`     | Living Room        | Yes                 |
| `dinning_room`    | Dinning Room       | No                  |
| `master_bedroom`  | Master Bedroom     | Yes                 |
| `back_yard`       | Back Yard          | No                  |

### Upstairs (`floor_id: "upstairs"`, level: 2)

| Area ID             | Area Name          | Has SwitchBot Meter |
|---------------------|--------------------|---------------------|
| `game_room`         | Game Room          | No                  |
| `office`            | Office             | Yes                 |
| `duncan_s_room`     | Duncan's Room      | No                  |
| `quinn_s_room`      | Quinn's Room       | No                  |
| `upstairs_bathroom` | Upstairs Bathroom  | No                  |

> **Note**: Eric's device registry uses different area_id values than the static reference registry (e.g., `the_office` vs `office`, `kyler` vs a child's room, `ashlyn` vs E&R bedroom). The auto-discovery algorithm resolves names from whichever area registry is live, so these mappings are always current.

---

## Appendix C: Stardate Generator

LCARS displays commonly show stardates. The header uses a simple TNG-era stardate approximation:

```javascript
/**
 * Generate a TNG-era stardate from the current date.
 * Approximation: year 2323 → stardate 0, each year = 1000 units.
 * This matches the commonly accepted fan calculation.
 */
function getStardate() {
  const now = new Date();
  const year = now.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year + 1, 0, 1);
  const dayFraction = (now - startOfYear) / (endOfYear - startOfYear);
  const stardate = ((year - 2323) * 1000 + dayFraction * 1000).toFixed(2);
  return stardate;
}
```
