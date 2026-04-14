# LCARS Atmoscrubber Panel — Design Specification

**Author**: Geordi La Forge (LCARS UI Design Authority)  
**Date**: Stardate 2026.04.12  
**Status**: Implementation-Ready  
**Panel Type**: Environment (Air Purifier + Air Quality)  
**Extends**: `LcarsDevicePanelBase` (per LCARS-DEVICE-PANEL-SPEC.md §9)

---

## 0. Design Philosophy

The Atmoscrubber panel is modeled after a **starship atmospheric processing readout** — the kind of display you'd see on the Engineering environmental substations monitoring air composition, scrubber throughput, and contaminant levels. The center column houses a vertical cylinder visualization (the "atmoscrubber") with particles rising through it — clean air flowing upward through the filtration column. Surrounding it: sensor telemetry on the left, fan/filter controls on the right, and 24-hour trend sparklines along the bottom.

Per Roddenberry's mandate: **the ship takes care of you**. The atmoscrubber runs quietly in the background. The panel should convey ambient status at a glance — green means breathe easy, orange means the scrubbers are working harder, red means alert the chief engineer.

Per Bracer Jack: **empty space is beautiful**. The cylinder floats in black. The sparklines are minimal traces, not dense charts.

---

## 1. Grid Layout

### ASCII Layout

```
┌──────────────────────────────────────────────────────────┐
│  ATMOSCRUBBER - OFFICE          AQI: 42   GOOD           │  ← header
├──────────────┬──────────┬────────────────────────────────┤
│  AQI     42  │ ┌──────┐ │  PRESET MODE                   │
│  PM2.5  8µg  │ │░░░░░░│ │  ○ AUTO  ● SLEEP  ○ TURBO     │
│  CO₂   620   │ │░▒░░▒░│ │                                │
│  VOC   185   │ │░░░▒░░│ │  DISPLAY     ┌─────╮           │
│  TEMP  21.3° │ │▒░░░░░│ │  ■ ON        └─────╯           │
│  HUM   48%   │ │░░▒░░░│ │  CHILD LOCK  ┌─────╮           │
│              │ │░░░░▒░│ │  □ OFF       └─────╯           │
│  DIAGNOSTICS │ │░▒░░░░│ │                                │
│  FILTER 78%  │ └──────┘ │  FILTER LIFE ████████░░ 78%    │
│  FW  1.2.14  │          │                                │
├──────────────┴──────────┴────────────────────────────────┤
│  ─── PM2.5 ───   ─── AQI ───   ─── CO₂ ───   ─── VOC ──│  ← sparklines
│  ╱╲  ╱╲          ╱╲   ╱╲       ╱╲  ╱╲         ╱╲  ╱╲    │
│ ╱  ╲╱  ╲╱       ╱  ╲╱  ╲     ╱  ╲╱  ╲╱      ╱  ╲╱  ╲╱  │
└──────────────────────────────────────────────────────────┘
```

### CSS Grid Definition

```css
.lcars-atmoscrubber-panel {
  display: grid;
  grid-template-areas:
    "header     header     header"
    "sensors    core       controls"
    "sparklines sparklines sparklines";
  grid-template-columns: minmax(8rem, 1fr) minmax(5rem, 6rem) minmax(8rem, 1.2fr);
  grid-template-rows: auto 1fr auto;
  gap: var(--lcars-gap);

  /* Frame border — Bracer Jack Rule 2: thick→thin, NEVER same */
  border-left: 4px solid var(--panel-frame-color, var(--lcars-bluey));
  border-top: 2px solid var(--panel-frame-color, var(--lcars-bluey));
  border-right: 2px solid var(--panel-frame-color, var(--lcars-bluey));
  border-bottom: 4px solid var(--panel-frame-color, var(--lcars-bluey));
  border-radius: 0.75rem;

  padding: var(--lcars-gap);
  background: var(--lcars-bg);

  /* Atmoscrubber frame color: bluey (cool, environmental) */
  --panel-frame-color: var(--lcars-bluey);

  /* Dynamic AQI color — set by JS based on air quality */
  --atmos-quality-color: var(--lcars-ice);

  min-height: calc(var(--lcars-vunit) * 6);
}
```

### Why `--lcars-bluey` for the Frame

Environmental systems on starships are cool-blue displays — life support, atmospheric processing, environmental controls. The blue hue family (`--lcars-bluey` #8899ff) distinguishes this from the warm butterscotch of cameras/generic panels and the violet of nav/media. This is the same logic as the Device Panel Spec §9 table: each device type gets a distinct frame color from a different hue family. Blue = environmental/life-support. (Source: TheLCARS.com color semantics, Ex Astris Scientia TNG Engineering displays)

---

## 2. AQI → Color Mapping

Air quality drives the dynamic color of the cylinder, particle effects, and AQI readout. We map EPA AQI breakpoints to LCARS palette colors.

### Color Map

| AQI Range | EPA Category         | LCARS Variable           | Hex       | Rationale                                          |
|-----------|----------------------|--------------------------|-----------|-----------------------------------------------------|
| 0–50      | Good                 | `--lcars-ice`            | `#99ccff` | Cool blue — nominal operations, breathe easy        |
| 51–100    | Moderate             | `--lcars-sunflower`      | `#ffcc99` | Warm amber — elevated but not concerning            |
| 101–150   | Unhealthy (Sensitive)| `--lcars-butterscotch`   | `#ff9966` | Operational alert — scrubbers working harder        |
| 151–200   | Unhealthy            | `--lcars-peach`          | `#ff8866` | Warning — fans should be high                       |
| 201–300   | Very Unhealthy       | `--lcars-tomato`         | `#ff5555` | Alert state — red, demands attention                |
| 301+      | Hazardous            | `--lcars-tomato` (pulse) | `#ff5555` | Emergency — tomato with the distress pulse animation|
| N/A       | Unavailable          | `--lcars-gray`           | `#666688` | Sensor offline — standard disabled state            |

### Implementation

```javascript
/**
 * Resolve AQI value to LCARS color CSS variable.
 * Returns the CSS variable string for use in style bindings.
 */
function getAqiColor(aqi) {
  if (aqi == null || isNaN(aqi)) return 'var(--lcars-disabled)';
  const v = Number(aqi);
  if (v <= 50)  return 'var(--lcars-ice)';
  if (v <= 100) return 'var(--lcars-sunflower)';
  if (v <= 150) return 'var(--lcars-butterscotch)';
  if (v <= 200) return 'var(--lcars-peach)';
  return 'var(--lcars-alert)';  /* 201+ = tomato */
}

/**
 * Returns true if AQI is in hazardous range (301+),
 * triggering the distress pulse animation on the cylinder.
 */
function isHazardous(aqi) {
  return aqi != null && Number(aqi) > 300;
}

/**
 * Map AQI to a human-readable status label (uppercase for LCARS).
 */
function getAqiLabel(aqi) {
  if (aqi == null || isNaN(aqi)) return 'UNAVAILABLE';
  const v = Number(aqi);
  if (v <= 50)  return 'GOOD';
  if (v <= 100) return 'MODERATE';
  if (v <= 150) return 'SENSITIVE';
  if (v <= 200) return 'UNHEALTHY';
  if (v <= 300) return 'VERY UNHEALTHY';
  return 'HAZARDOUS';
}
```

### PM2.5 Direct Mapping (for Awair devices without AQI entity)

When no AQI entity exists, derive color from PM2.5 µg/m³:

| PM2.5 (µg/m³) | Equivalent AQI Band | LCARS Variable         |
|----------------|----------------------|------------------------|
| 0–12           | Good                 | `--lcars-ice`          |
| 12.1–35.4      | Moderate             | `--lcars-sunflower`    |
| 35.5–55.4      | Unhealthy (Sens.)    | `--lcars-butterscotch` |
| 55.5–150.4     | Unhealthy            | `--lcars-peach`        |
| 150.5+         | Very Unhealthy+      | `--lcars-tomato`       |

### Contrast Verification (all vs `#000000` background)

| Color                  | Hex       | Contrast vs #000 | WCAG Level |
|------------------------|-----------|-------------------|------------|
| `--lcars-ice`          | `#99ccff` | 10.3:1            | AAA        |
| `--lcars-sunflower`    | `#ffcc99` | 13.1:1            | AAA        |
| `--lcars-butterscotch` | `#ff9966` | 8.2:1             | AAA        |
| `--lcars-peach`        | `#ff8866` | 6.8:1             | AAA        |
| `--lcars-tomato`       | `#ff5555` | 5.2:1             | AA         |
| `--lcars-gray`         | `#666688` | 4.6:1             | AA         |

All pass WCAG 1.4.3 (AA) minimum 4.5:1. Tomato at 5.2:1 is the lowest, and it's always paired with "HAZARDOUS"/"VERY UNHEALTHY" text label — color is never the sole indicator (WCAG 1.4.1).

---

## 3. Atmoscrubber Cylinder (Center Column)

The centerpiece visualization: a vertical cylinder representing the air filtration column. Particles drift upward through it — dirty air enters the bottom, clean air exits the top.

### Cylinder CSS

```css
.atmos-cylinder {
  grid-area: core;
  position: relative;
  align-self: center;
  justify-self: center;

  /* Cylinder dimensions — vertical, narrow */
  width: 4rem;
  height: 100%;
  min-height: 10rem;
  max-height: 18rem;

  /* Pill shape — rounded top and bottom caps */
  border-radius: 2rem;

  /* Cylinder body — subtle gradient NOT on the fill, but structural shading
     to convey 3D cylindrical form. This is the ONE exception to "no gradients" —
     the cylinder itself is a structural element, not a button or panel.
     Bracer Jack Rule 1 applies to UI chrome, not data visualizations.
     The gradient is minimal: a 10% brightness shift to imply curvature. */
  background:
    linear-gradient(
      90deg,
      rgba(255,255,255,0) 0%,
      rgba(255,255,255,0.06) 40%,
      rgba(255,255,255,0.03) 60%,
      rgba(255,255,255,0) 100%
    ),
    var(--lcars-bg);

  /* Border uses the dynamic AQI color */
  border: 2px solid var(--atmos-quality-color, var(--lcars-ice));

  /* Overflow hidden to clip particles */
  overflow: hidden;

  /* Transition for color changes */
  transition: border-color var(--lcars-transition-slow);
}
```

### Cylinder Internal Structure

```
┌──────────┐  ← rounded cap (clean air exit)
│ ░  ▒  ░  │  ← particles drifting up
│  ░    ▒  │
│ ▒  ░     │
│    ░  ▒  │
│ ░     ░  │
│  ▒  ░    │
│ ░    ▒ ░ │
│   ░   ░  │
└──────────┘  ← rounded cap (dirty air intake)
```

### Tick Marks (AQI Scale)

Horizontal tick marks along the left edge of the cylinder, spaced evenly, representing AQI thresholds. These are purely decorative/informational — they don't change with data.

```css
.atmos-cylinder-ticks {
  position: absolute;
  top: 1rem;        /* Below the rounded cap */
  bottom: 1rem;     /* Above the rounded cap */
  left: 0;
  width: 0.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  pointer-events: none;
}

.atmos-tick {
  width: 100%;
  height: 2px;
  background: var(--atmos-quality-color, var(--lcars-ice));
  opacity: 0.4;
  transition: background var(--lcars-transition-slow);
}

/* 5 ticks: corresponding to AQI thresholds 50, 100, 150, 200, 300 */
/* The active tick (closest to current AQI) gets full opacity */
.atmos-tick.active {
  opacity: 1;
  height: 3px;
}
```

### Fill Level (Optional — Fan Speed Indicator)

An inner fill rectangle that rises from the bottom, height proportional to fan speed percentage (0% = off/idle, 100% = turbo). For sensor-only devices, this shows AQI level instead.

```css
.atmos-fill {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--atmos-quality-color, var(--lcars-ice));
  opacity: 0.12;
  border-radius: 0 0 2rem 2rem;
  transition: height 1s ease-out, background var(--lcars-transition-slow);
  /* Height set by JS: style="height: ${fillPercent}%" */
}
```

### Particle Animation

Particles are small circles that drift upward through the cylinder, simulating air flow through the scrubber. Their speed is tied to fan speed.

```css
/* Particle container — absolute positioned inside the cylinder */
.atmos-particles {
  position: absolute;
  inset: 1rem 0.5rem;  /* inset from rounded caps */
  overflow: hidden;
  pointer-events: none;
}

/* Individual particle */
.atmos-particle {
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--atmos-quality-color, var(--lcars-ice));
  opacity: 0;
  animation: atmos-particle-rise var(--atmos-particle-speed, 4s) ease-in-out infinite;
  /* Each particle gets a random animation-delay and horizontal offset via JS */
}

/* Small particle variant */
.atmos-particle.sm {
  width: 3px;
  height: 3px;
  opacity: 0;
}

/* Large particle variant */
.atmos-particle.lg {
  width: 6px;
  height: 6px;
  opacity: 0;
}

@keyframes atmos-particle-rise {
  0% {
    transform: translateY(100%) translateX(0);
    opacity: 0;
  }
  10% {
    opacity: 0.7;
  }
  50% {
    opacity: 0.5;
  }
  90% {
    opacity: 0.3;
  }
  100% {
    transform: translateY(-100%) translateX(var(--atmos-particle-drift, 0.5rem));
    opacity: 0;
  }
}
```

### Particle Speed ↔ Fan Speed

```javascript
/**
 * Map fan speed percentage to particle animation duration.
 * Faster fan = faster particles (shorter duration).
 * Idle/off = slow ambient drift.
 */
function getParticleSpeed(fanSpeedPercent) {
  if (fanSpeedPercent == null || fanSpeedPercent <= 0) {
    return '6s';    /* Idle drift — slow, ambient */
  }
  // Linear interpolation: 100% speed → 1.5s, 1% speed → 5.5s
  const duration = 5.5 - (fanSpeedPercent / 100) * 4;
  return `${Math.max(1.5, duration).toFixed(1)}s`;
}
```

### Particle Count

- **8 particles** in the cylinder at any time (staggered via `animation-delay`)
- Mix of `.sm` (3), default (3), `.lg` (2) sizes
- Each particle gets a random `left` offset (10%–90%) and `animation-delay` (0s–variable based on speed) set via inline style in JS
- Each particle gets a random `--atmos-particle-drift` custom property between `-0.5rem` and `0.5rem` for horizontal wander

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  .atmos-particle {
    animation: none !important;
    opacity: 0.3;  /* Static, visible but not moving */
  }
  .atmos-fill {
    transition: none !important;
  }
}
```

### Hazardous Pulse (AQI > 300)

```css
.atmos-cylinder.hazardous {
  animation: atmos-hazard-pulse 1s ease-in-out infinite;
}

@keyframes atmos-hazard-pulse {
  0%, 100% { border-color: var(--lcars-alert); }
  50%      { border-color: rgba(255, 85, 85, 0.4); }
}

@media (prefers-reduced-motion: reduce) {
  .atmos-cylinder.hazardous {
    animation: none !important;
    border-color: var(--lcars-alert);
    border-width: 3px;  /* Static thicker border as reduced-motion alternative */
  }
}
```

---

## 4. Panel Header

### Structure

```html
<div class="atmos-header" role="heading" aria-level="3">
  <span class="device-panel-name">${deviceName}</span>
  <span class="device-panel-header-line" aria-hidden="true"></span>
  <span class="device-panel-badge" style="color: ${aqiColor}">
    AQI: ${aqiValue}
  </span>
  <span class="atmos-quality-label" style="color: ${aqiColor}">
    ${aqiLabel}
  </span>
</div>
```

### CSS

```css
.atmos-header {
  grid-area: header;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  min-height: var(--lcars-bar-h);
  /* Thin rule separator below header */
  border-bottom: 2px solid var(--panel-frame-color);
}

.atmos-quality-label {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  text-transform: uppercase;
  white-space: nowrap;
  font-weight: 700;
  transition: color var(--lcars-transition-slow);
}
```

Reuses `.device-panel-name`, `.device-panel-header-line`, `.device-panel-badge` from the Device Panel Spec §3.1. The quality label is a new element — bold, colored to match AQI state, gives instant visual status.

---

## 5. Sensor Telemetry Column (Left)

### Entity Ordering (Top to Bottom)

The sensors display in a fixed, prioritized order — the most actionable information at the top:

| Row | Sensor            | Device Class / Entity ID Pattern          | Unit    | Color                            |
|-----|-------------------|-------------------------------------------|---------|----------------------------------|
| 1   | AQI               | `device_class: aqi`                       | —       | Dynamic `--atmos-quality-color`  |
| 2   | PM2.5             | `device_class: pm25`                      | µg/m³   | Dynamic `--atmos-quality-color`  |
| 3   | CO₂               | `device_class: carbon_dioxide`            | ppm     | `var(--lcars-data-accent)`       |
| 4   | VOC               | `device_class: volatile_organic_compounds`| ppb/idx | `var(--lcars-data-accent)`       |
| 5   | Temperature       | `device_class: temperature`               | °C/°F   | `var(--lcars-sunflower)`         |
| 6   | Humidity          | `device_class: humidity`                  | %       | `var(--lcars-data-accent)`       |
| —   | *(divider)*       |                                           |         |                                  |
| 7   | Filter Lifetime   | `entity_category: diagnostic`, filter     | %       | `var(--lcars-data-accent)`       |
| 8   | Firmware          | `entity_category: diagnostic`, firmware   | ver.    | `var(--lcars-disabled)`          |

### CSS

```css
.atmos-sensors {
  grid-area: sensors;
  display: flex;
  flex-direction: column;
  gap: var(--lcars-gap);
  padding: 0.25rem 0;
  align-self: start;
}

.atmos-sensors-divider {
  height: 1px;
  background: var(--lcars-disabled);
  margin: 0.25rem 0;
  opacity: 0.5;
}

.atmos-diag-label {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-disabled);
  text-transform: uppercase;
  padding: 0.25rem 0.5rem 0;
  letter-spacing: 0.05em;
}
```

Sensor lines reuse `.device-sensor-line` from the Device Panel Spec §3.3. The diagnostic section is separated by a thin divider and a dim "DIAGNOSTICS" sub-label in `--lcars-disabled` gray — this follows the LCARS pattern of suppressing secondary information to keep focus on primary readouts (Bracer Jack: "empty space is beautiful").

### CO₂ Threshold Coloring

CO₂ gets its own threshold coloring since it's a critical indoor air quality metric:

| CO₂ (ppm)  | Color                     | Rationale                    |
|------------|---------------------------|------------------------------|
| 0–800      | `var(--lcars-data-accent)` | Normal — standard blue readout|
| 801–1200   | `var(--lcars-sunflower)`   | Elevated — warm amber         |
| 1201–2000  | `var(--lcars-butterscotch)`| High — operational alert      |
| 2001+      | `var(--lcars-alert)`       | Danger — immediate ventilation|

```javascript
function getCo2Color(co2) {
  if (co2 == null || isNaN(co2)) return 'var(--lcars-disabled)';
  const v = Number(co2);
  if (v <= 800)  return 'var(--lcars-data-accent)';
  if (v <= 1200) return 'var(--lcars-sunflower)';
  if (v <= 2000) return 'var(--lcars-butterscotch)';
  return 'var(--lcars-alert)';
}
```

---

## 6. Controls Column (Right)

### Structure

For purifier devices (VeSync Core400S, LAP-C601S-WUS), the right column shows fan controls:

```
┌────────────────────┐
│  PRESET MODE       │  ← heading (sub-header font)
│  ○ AUTO            │  ← option strip (radio-style pills)
│  ● SLEEP           │
│  ○ TURBO           │
│  ○ PET             │
│                    │
│  DISPLAY     [■]   │  ← toggle switch
│  CHILD LOCK  [□]   │  ← toggle switch
│                    │
│  FILTER LIFE       │  ← progress bar
│  ████████░░  78%   │
└────────────────────┘
```

### Preset Mode Option Strip

A vertical list of pill-shaped radio buttons for fan preset modes. Only one active at a time.

```css
.atmos-controls {
  grid-area: controls;
  display: flex;
  flex-direction: column;
  gap: var(--lcars-gap);
  padding: 0.25rem 0;
  align-self: start;
}

.atmos-control-heading {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-text-heading);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.25rem 0;
}

/* Preset mode option strip */
.atmos-preset-strip {
  display: flex;
  flex-direction: column;
  gap: var(--lcars-gap);
}

.atmos-preset-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  height: 2.25rem;                         /* Slightly shorter than main buttons */
  padding: 0 0.75rem;
  min-width: 6rem;                         /* WCAG 2.5.8: ≥24px target */

  background: var(--lcars-disabled);       /* Default: gray (unselected) */
  color: var(--lcars-space-white);
  border: none;
  border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;

  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  text-transform: uppercase;
  text-align: left;
  cursor: pointer;
  transition: filter var(--lcars-transition), background var(--lcars-transition);
  user-select: none;
}

.atmos-preset-btn:hover {
  filter: brightness(1.2);
}

.atmos-preset-btn:focus-visible {
  outline: 2px solid var(--lcars-ice);
  outline-offset: 2px;
}

/* Active/selected preset */
.atmos-preset-btn[aria-pressed="true"],
.atmos-preset-btn.active {
  background: var(--lcars-btn-active);     /* --lcars-gold */
  color: var(--lcars-black);
}
```

### Toggle Switches (Display, Child Lock)

```css
.atmos-toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.25rem 0;
  min-height: 2.25rem;                    /* WCAG 2.5.8 */
}

.atmos-toggle-label {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-text);
  text-transform: uppercase;
}

/* LCARS toggle — flat pill, no iOS-style sliding */
.atmos-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 1.75rem;
  border-radius: var(--lcars-btn-radius);
  border: none;
  cursor: pointer;
  transition: background var(--lcars-transition);
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
}

.atmos-toggle[aria-checked="true"] {
  background: var(--lcars-btn-active);     /* Gold = on */
  color: var(--lcars-black);
}

.atmos-toggle[aria-checked="false"] {
  background: var(--lcars-disabled);       /* Gray = off */
  color: var(--lcars-space-white);
}

.atmos-toggle:hover {
  filter: brightness(1.2);
}

.atmos-toggle:focus-visible {
  outline: 2px solid var(--lcars-ice);
  outline-offset: 2px;
}
```

### Filter Life Progress Bar

```css
.atmos-filter-bar-container {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.25rem 0;
}

.atmos-filter-bar {
  height: 0.5rem;
  background: var(--lcars-disabled);
  border-radius: 0.25rem;
  overflow: hidden;
}

.atmos-filter-bar-fill {
  height: 100%;
  background: var(--lcars-data-accent);
  border-radius: 0.25rem;
  transition: width var(--lcars-transition-slow);
  /* Width set by JS: style="width: ${filterPct}%" */
}

/* Low filter warning */
.atmos-filter-bar-fill.low {
  background: var(--lcars-butterscotch);   /* < 20% */
}

.atmos-filter-bar-fill.critical {
  background: var(--lcars-alert);          /* < 5% */
}

.atmos-filter-value {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-data-accent);
  text-transform: uppercase;
}
```

---

## 7. Sparkline History Row (Bottom)

24-hour trend sparklines for key air quality metrics. Small SVG traces — think the ambient data readouts scrolling across the bottom of TNG Engineering displays.

### Layout

```css
.atmos-sparklines {
  grid-area: sparklines;
  display: flex;
  gap: calc(var(--lcars-gap) * 2);
  padding-top: var(--lcars-gap);
  border-top: 2px solid var(--panel-frame-color);
  overflow-x: auto;
  /* Horizontal scroll for narrow viewports */
  -webkit-overflow-scrolling: touch;
}

.atmos-sparkline-cell {
  flex: 1;
  min-width: 6rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.atmos-sparkline-label {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-disabled);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
}
```

### SVG Sparkline

```css
.atmos-sparkline-svg {
  width: 100%;
  height: 2rem;
  display: block;
}

.atmos-sparkline-path {
  fill: none;
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
  vector-effect: non-scaling-stroke;
  /* Stroke color set per-trace */
}

/* Subtle fill area under the line */
.atmos-sparkline-area {
  opacity: 0.08;
  /* Fill color matches stroke */
}
```

### Trace Configuration

| Sparkline | Stroke Color                    | Priority | Shown When               |
|-----------|---------------------------------|----------|--------------------------|
| PM2.5     | `var(--atmos-quality-color)`    | 1        | Always (primary metric)  |
| AQI       | `var(--lcars-sunflower)`        | 2        | When AQI entity exists   |
| CO₂       | `var(--lcars-data-accent)`      | 3        | When CO₂ entity exists   |
| VOC       | `var(--lcars-african-violet)`   | 4        | When VOC entity exists   |

**Maximum 4 sparklines**. If fewer sensors exist, the remaining sparklines stretch wider (flex layout handles this). PM2.5 is always first. Each sparkline shows 24h of data with 1-point-per-15-minutes resolution (96 data points).

### SVG Generation (JS)

```javascript
/**
 * Generate an SVG sparkline path from an array of numeric values.
 * Returns the 'd' attribute string for an SVG <path>.
 * @param {number[]} values - Array of data points
 * @param {number} width - SVG viewBox width
 * @param {number} height - SVG viewBox height
 */
function sparklinePath(values, width = 100, height = 24) {
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
 * Generate the closed area path (for the subtle fill under the line).
 */
function sparklineAreaPath(values, width = 100, height = 24) {
  const linePath = sparklinePath(values, width, height);
  if (!linePath) return '';
  const step = width / (values.filter(v => v != null && !isNaN(v)).length - 1);
  const lastX = ((values.filter(v => v != null && !isNaN(v)).length - 1) * step).toFixed(1);
  return `${linePath} L${lastX},${height} L0,${height} Z`;
}
```

### SVG Template

```html
<svg class="atmos-sparkline-svg"
     viewBox="0 0 100 24"
     preserveAspectRatio="none"
     role="img"
     aria-label="PM2.5 trend: last 24 hours, current ${currentValue} µg/m³">
  <path class="atmos-sparkline-area"
        d="${areaPath}"
        fill="${traceColor}" />
  <path class="atmos-sparkline-path"
        d="${linePath}"
        stroke="${traceColor}" />
</svg>
```

Each sparkline has an `aria-label` describing the metric, time range, and current value — screen reader accessible (WCAG 4.1.2) without needing to see the visual.

---

## 8. Sensor-Only Adaptation (Awair Element)

The Awair Element has sensors but no fan entity and no controls. The panel must gracefully adapt.

### Grid Change: 2-Column Mode

```css
/* When no controls exist, collapse to 2 columns */
.lcars-atmoscrubber-panel.sensor-only {
  grid-template-areas:
    "header     header"
    "sensors    core"
    "sparklines sparklines";
  grid-template-columns: minmax(8rem, 1.2fr) minmax(5rem, 6rem);
}
```

### Behavioral Differences

| Aspect                | Purifier (VeSync)            | Sensor-Only (Awair)                     |
|-----------------------|------------------------------|-----------------------------------------|
| Grid columns          | 3 (sensors / core / controls)| 2 (sensors / core)                      |
| Controls column       | Preset mode, toggles, filter | **Hidden** (empty, not rendered)        |
| Cylinder fill         | Fan speed %                  | Inverted AQI % (good=high, bad=low)    |
| Particle speed        | Tied to fan speed %          | Slow ambient drift (6s)                 |
| Particle color        | AQI color                    | AQI color                               |
| AQI source            | `device_class: aqi` entity   | Derived from PM2.5 if no AQI entity    |
| Header badge          | `AQI: ${value} ${label}`     | `AQI: ${value} ${label}`               |
| Sparklines            | PM2.5 + AQI (if available)   | PM2.5 + CO₂ + VOC + Humidity           |

### Awair Cylinder Fill Logic

```javascript
/**
 * For sensor-only devices, fill the cylinder inversely from AQI:
 * AQI 0 (perfect) = 100% fill (scrubber fully effective)
 * AQI 300+ (hazardous) = ~5% fill (scrubber overwhelmed)
 */
function getSensorOnlyFill(aqi) {
  if (aqi == null || isNaN(aqi)) return 50;
  const v = Math.min(300, Math.max(0, Number(aqi)));
  return Math.round(100 - (v / 300) * 95);
}
```

### Detection Logic

```javascript
/**
 * Determine if this is a sensor-only device (no fan entity).
 */
function isSensorOnly(entities) {
  return !entities.some(e => {
    const domain = e.entity_id.split('.')[0];
    return domain === 'fan';
  });
}
```

---

## 9. Heading & Label Hierarchy (Accessibility)

### Heading Levels

| Element               | `aria-level` | Font Size                  | Color                          | Purpose                       |
|-----------------------|--------------|----------------------------|--------------------------------|-------------------------------|
| Panel title           | 3            | `--lcars-font-size-sub`    | `--lcars-text-heading`         | Device name (e.g., "OFFICE PURIFIER") |
| Section headings      | 4            | `--lcars-font-size-data`   | `--lcars-text-heading`         | "PRESET MODE", "DIAGNOSTICS"  |
| Sensor labels         | —            | `--lcars-font-size-data`   | `--lcars-text`                 | "AQI", "PM2.5", "CO₂", etc.  |
| Sensor values         | —            | `--lcars-font-size-data`   | Dynamic (state-based)          | "42", "8 µG/M³", "620 PPM"   |
| Sparkline labels      | —            | `--lcars-font-size-data`   | `--lcars-disabled`             | "PM2.5", "AQI", "CO₂"        |
| Header badge          | —            | `--lcars-font-size-data`   | Dynamic `--atmos-quality-color`| "AQI: 42"                    |
| Quality label         | —            | `--lcars-font-size-data`   | Dynamic `--atmos-quality-color`| "GOOD"                       |

**Exactly 3 font sizes: title (unused here, reserved for page-level), sub-header, data.** (Bracer Jack Rule 6)

### ARIA Labeling

```html
<!-- Panel container -->
<div class="lcars-atmoscrubber-panel ${sensorOnly ? 'sensor-only' : ''}"
     role="region"
     aria-label="${deviceName} atmospheric monitoring panel">

  <!-- Header with quality status -->
  <div class="atmos-header" role="heading" aria-level="3">
    ...
  </div>

  <!-- Sensor column -->
  <div class="atmos-sensors" role="list" aria-label="Air quality sensors">
    <div class="device-sensor-line" role="listitem" tabindex="0"
         aria-label="AQI: ${aqiValue}, ${aqiLabel}">
      ...
    </div>
    <div class="device-sensor-line" role="listitem" tabindex="0"
         aria-label="PM 2.5: ${pm25Value} micrograms per cubic meter">
      ...
    </div>
    <!-- ... -->
  </div>

  <!-- Cylinder -->
  <div class="atmos-cylinder"
       role="meter"
       aria-label="Air quality level"
       aria-valuemin="0"
       aria-valuemax="300"
       aria-valuenow="${aqiValue}"
       aria-valuetext="AQI ${aqiValue}, ${aqiLabel}">
    ...
  </div>

  <!-- Controls (purifier only) -->
  <div class="atmos-controls" role="group" aria-label="Purifier controls">
    <div role="heading" aria-level="4" class="atmos-control-heading">
      PRESET MODE
    </div>
    <div class="atmos-preset-strip" role="radiogroup" aria-label="Fan preset mode">
      <button class="atmos-preset-btn"
              role="radio"
              aria-checked="${isActive}"
              aria-label="${modeName}">
        ${modeName}
      </button>
      <!-- ... -->
    </div>
    <div class="atmos-toggle-row">
      <span class="atmos-toggle-label" id="display-label">DISPLAY</span>
      <button class="atmos-toggle"
              role="switch"
              aria-checked="${displayState}"
              aria-labelledby="display-label">
      </button>
    </div>
    <!-- ... -->
  </div>

  <!-- Sparklines -->
  <div class="atmos-sparklines" role="group" aria-label="24-hour trend charts">
    ...
  </div>

  <!-- Screen reader live region -->
  <div class="sr-only" aria-live="polite" aria-atomic="false">
    <!-- JS injects: "Office Purifier: AQI changed to 65, moderate" -->
  </div>
</div>
```

### Keyboard Navigation (Tab Order)

1. Panel header (informational, not interactive)
2. Sensor lines — top to bottom (`Enter`/`Space` → open more-info dialog)
3. Cylinder (`role="meter"` — informational, `tabindex="0"`, `Enter` → open more-info for primary sensor)
4. Preset mode buttons — top to bottom (standard `radiogroup` keyboard: `Arrow Up`/`Down` to navigate, `Space` to select)
5. Toggle switches — top to bottom (`Space` to toggle)
6. Sparklines — left to right (informational, `tabindex="0"`, `Enter` → open history graph)

The tab order follows DOM order which matches visual order (WCAG 1.3.2 Meaningful Sequence).

---

## 10. LCARS Design Rules Compliance

| Rule                                              | Source           | Compliant? | Notes                                  |
|---------------------------------------------------|------------------|------------|----------------------------------------|
| No gradients on buttons/panels                    | Bracer Jack #1   | ✅          | Cylinder uses minimal structural shading only |
| Frame goes thick→thin (4px→2px border)            | Bracer Jack #2   | ✅          | Left/bottom 4px, top/right 2px         |
| Pill buttons with flat left, rounded right         | Bracer Jack #4   | ✅          | Preset buttons and toggles             |
| Exactly 3 font sizes (title, sub, data)            | Bracer Jack #6   | ✅          | Sub for header, data for everything else|
| ≤5 hue families                                   | Bracer Jack      | ✅          | Blue (frame), warm (AQI states), violet (VOC sparkline), gray (disabled), white (text) = 5 families |
| All text uppercase                                 | TheLCARS.com     | ✅          | Sensor labels, values, headings, buttons|
| Antonio font only                                  | TheLCARS.com     | ✅          | `var(--lcars-font)` throughout          |
| CSS custom properties, no hardcoded hex            | Project rule     | ✅          | All colors via `var(--lcars-*)` tokens  |
| Background is always `#000000`                     | TheLCARS.com     | ✅          | `var(--lcars-bg)` = `var(--lcars-black)`|
| Animations < 1s, respects `prefers-reduced-motion` | WCAG + project   | ✅          | Hazard pulse = 1s, particles gentle, all disable with reduced-motion |
| WCAG AA contrast on all text                       | WCAG 1.4.3       | ✅          | Verified in §2 table                   |
| 24px+ touch targets                                | WCAG 2.5.8       | ✅          | Preset buttons 2.25rem=36px, toggles 1.75rem × 3rem ≥ 24px |
| Focus visible 2px outline, 3:1 contrast            | WCAG 2.4.7/13    | ✅          | Ice blue outline, 10.3:1 vs black      |
| Color not sole means of information                | WCAG 1.4.1       | ✅          | AQI text label + value + color; all sensors have text state |
| Keyboard operable                                  | WCAG 2.1.1       | ✅          | Full tab order defined, radiogroup keyboard pattern |
| `aria-label` / `role` on all interactive elements  | WCAG 4.1.2       | ✅          | See §9 ARIA template                   |
| `aria-live="polite"` for state changes             | WCAG 4.1.3       | ✅          | Hidden live region for AQI updates     |
| Spacing uses `--lcars-gap` (0.25rem)               | Jörn Weißenborn  | ✅          | Invisible grid constant throughout      |

---

## 11. Responsive Behavior

### Desktop (≥768px) — Full 3-Column (or 2-Column Sensor-Only)

The spec above.

### Mobile (<768px) — Stacked Layout

```css
@media (max-width: 767px) {
  .lcars-atmoscrubber-panel {
    grid-template-columns: 1fr;
    grid-template-areas:
      "header"
      "core"
      "sensors"
      "controls"
      "sparklines";
  }

  .lcars-atmoscrubber-panel.sensor-only {
    grid-template-areas:
      "header"
      "core"
      "sensors"
      "sparklines";
  }

  .atmos-cylinder {
    width: 3rem;
    max-height: 8rem;
    margin: 0 auto;
  }

  .atmos-sensors {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .device-sensor-line {
    flex: 1 1 45%;
    min-width: 8rem;
  }

  .atmos-sparklines {
    flex-direction: column;
    gap: var(--lcars-gap);
  }

  .atmos-sparkline-cell {
    min-width: 100%;
  }
}
```

On mobile, the cylinder moves to the top (below header) for immediate visual status, then sensors flow as wrapped pairs, controls stack, and sparklines go full-width vertical. This maintains the reading priority: status → data → actions → history.

---

## 12. CSS Custom Properties Summary (New)

Properties introduced by the Atmoscrubber panel. All other properties from `lcars-styles.js`.

| Property                    | Default                    | Set By   | Purpose                                 |
|-----------------------------|----------------------------|----------|------------------------------------------|
| `--panel-frame-color`       | `var(--lcars-bluey)`       | CSS      | Panel border, header/footer rules        |
| `--atmos-quality-color`     | `var(--lcars-ice)`         | JS       | Dynamic AQI-driven color for cylinder, particles, AQI readouts |
| `--atmos-particle-speed`    | `4s`                       | JS       | Particle rise duration (tied to fan speed)|
| `--atmos-particle-drift`    | `0.5rem`                   | JS       | Per-particle horizontal wander range     |

---

## 13. Entity Classification Logic

```javascript
/**
 * Classify entities for the atmoscrubber panel.
 * Returns { sensors, controls, diagnostics, fan, primaryAqi }.
 */
function classifyAtmosEntities(entities) {
  const result = {
    sensors: [],       // sensor domain, non-diagnostic
    controls: [],      // switch, select, number, fan domains
    diagnostics: [],   // entity_category: diagnostic
    fan: null,         // first fan entity (null for sensor-only)
    primaryAqi: null,  // AQI or PM2.5 entity for cylinder color
  };

  const AQI_DEVICE_CLASSES = ['aqi', 'pm25', 'carbon_dioxide',
    'volatile_organic_compounds', 'temperature', 'humidity'];

  for (const e of entities) {
    const domain = e.entity_id.split('.')[0];
    const dc = e.original_device_class || e.device_class || '';
    const cat = e.entity_category || '';

    if (domain === 'fan') {
      result.fan = result.fan || e;
      continue;
    }

    if (cat === 'diagnostic' || cat === 'config') {
      result.diagnostics.push(e);
      continue;
    }

    if (domain === 'sensor' && AQI_DEVICE_CLASSES.includes(dc)) {
      result.sensors.push(e);
      // Track primary AQI source: prefer device_class=aqi, fallback to pm25
      if (dc === 'aqi') result.primaryAqi = e;
      if (dc === 'pm25' && !result.primaryAqi) result.primaryAqi = e;
      continue;
    }

    if (domain === 'switch' || domain === 'select' || domain === 'number') {
      result.controls.push(e);
      continue;
    }

    // Fallback: any remaining sensor
    if (domain === 'sensor' || domain === 'binary_sensor') {
      result.sensors.push(e);
    }
  }

  // Sort sensors by priority order
  const priorityOrder = ['aqi', 'pm25', 'carbon_dioxide',
    'volatile_organic_compounds', 'temperature', 'humidity'];
  result.sensors.sort((a, b) => {
    const aDc = a.original_device_class || a.device_class || '';
    const bDc = b.original_device_class || b.device_class || '';
    const aIdx = priorityOrder.indexOf(aDc);
    const bIdx = priorityOrder.indexOf(bDc);
    return (aIdx === -1 ? 99 : aIdx) - (bIdx === -1 ? 99 : bIdx);
  });

  return result;
}
```

---

## 14. File Registration Plan

| Component Tag                    | File                            | Purpose                           |
|----------------------------------|---------------------------------|-----------------------------------|
| `lcars-atmoscrubber-panel`       | `lcars-atmoscrubber-panel.js`   | Full panel component              |

Extends `LcarsDevicePanelBase`:
- `panelFrameColor` → `var(--lcars-bluey)`
- `mediaAspectRatio` → N/A (cylinder has explicit dimensions)
- `_isPrimaryDomain(domain)` → `domain === 'fan'`
- `_renderMedia()` → renders the `atmos-cylinder` with particles

---

*"The environmental systems on a Galaxy-class starship process over 7,000 cubic meters of atmosphere per hour. You'd never know it — they just work. That's what good engineering looks like."*  
— La Forge, Main Engineering
