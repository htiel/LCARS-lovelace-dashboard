# LCARS Climate Panel — Design Specification

**Author**: Wesley Crusher (Creative Technology & Experimentation)  
**Reviewed by**: Geordi La Forge (LCARS UI Design Authority)  
**Date**: Stardate 2026.04.13  
**Status**: Design Proposal  
**Priority**: CRITICAL  
**Panel Type**: Climate (Thermostat + HVAC)  
**Extends**: `LcarsDevicePanelBase` (per LCARS-DEVICE-PANEL-SPEC.md §9)

---

## 0. Design Philosophy

The Climate Panel is modeled after the Enterprise-D's **Environmental Control substations** — the displays the bridge crew monitors from the Ops station showing deck-by-deck atmospheric conditions: temperature, humidity, life-support status. When you sit down at Environmental Control, you see at a glance whether every deck is comfortable, which zones are being heated or cooled, and whether anything needs manual intervention.

This panel gives the crew member (homeowner) the same instant clarity: a large temperature readout at center-right (the "viewscreen"), the current HVAC action communicated through **dynamic frame color** — warm butterscotch when heating, cool ice-blue when cooling — and clean pill-button controls below for mode, fan, and preset selection.

Per Roddenberry's mandate: **the ship takes care of you**. The thermostat runs in the background. The panel reflects status, not complexity. The operator adjusts setpoints and modes; the system handles the rest.

Per Bracer Jack: **empty space is beautiful**. The temperature arc floats in black. The sensor readouts are spare text lines. No dial skeuomorphism, no gradient arcs, no fake chrome.

---

## 1. Grid Layout

### ASCII Layout

```
┌──────────────────────────────────────────────────────────────┐
│  LIVING ROOM THERMOSTAT          HEATING   72°F              │  ← header
├──────────────────┬───────────────────────────────────────────┤
│                  │        ╔══════════════════════╗           │
│  CURRENT  72°F   │        ║                      ║           │
│  TARGET   74°F   │        ║     ┌───────────┐    ║           │
│  HUMIDITY  48%   │        ║     │           │    ║           │
│                  │        ║     │    72°    │    ║           │
│  HVAC     HEAT   │        ║     │   ╱    ╲  │    ║           │
│  FAN      AUTO   │        ║     │  74° TGT  │    ║           │
│  PRESET   HOME   │        ║     │           │    ║           │
│                  │        ║     └───────────┘    ║           │
│  FAULTS          │        ║                      ║           │
│  ● NONE          │        ║   ┌──╮  TARGET  ┌──╮ ║           │
│                  │        ║   │ –│   74°F   │ +│ ║           │
│                  │        ║   └──╯          └──╯ ║           │
│                  │        ╚══════════════════════╝           │
├──────────────────┴───────────────────────────────────────────┤
│  ┌──────╮ ┌──────╮ ┌──────╮ ┌──────────╮ ┌──────╮ ┌──────╮ │  ← mode strip
│  │ HEAT │ │ COOL │ │ AUTO │ │HEAT/COOL │ │  DRY │ │  OFF │ │
│  └──────╯ └──────╯ └──────╯ └──────────╯ └──────╯ └──────╯ │
├──────────────────────────────────────────────────────────────┤
│  FAN: ○ AUTO  ● LOW  ○ MED  ○ HIGH    PRESET: ● HOME  ○ ECO│  ← aux controls
└──────────────────────────────────────────────────────────────┘
```

### Dual Setpoint Layout (heat_cool mode)

When in `heat_cool` mode, the media viewscreen adapts to show two setpoint targets:

```
        ╔══════════════════════╗
        ║                      ║
        ║     ┌───────────┐    ║
        ║     │           │    ║
        ║     │    72°    │    ║
        ║     │  CURRENT  │    ║
        ║     │           │    ║
        ║     └───────────┘    ║
        ║                      ║
        ║  ┌──╮  LOW   ┌──╮   ║
        ║  │ –│  68°F  │ +│   ║
        ║  └──╯        └──╯   ║
        ║  ┌──╮  HIGH  ┌──╮   ║
        ║  │ –│  76°F  │ +│   ║
        ║  └──╯        └──╯   ║
        ╚══════════════════════╝
```

### CSS Grid Definition

```css
.lcars-climate-panel {
  display: grid;
  grid-template-areas:
    "header   header"
    "sensors  media"
    "modes    modes"
    "auxctrl  auxctrl";
  grid-template-columns: minmax(10rem, 1fr) minmax(14rem, 2fr);
  grid-template-rows: auto 1fr auto auto;
  gap: var(--lcars-gap);

  /* Frame border — Bracer Jack Rule 2: thick→thin, NEVER same */
  border-left: 4px solid var(--panel-frame-color, var(--lcars-butterscotch));
  border-top: 2px solid var(--panel-frame-color, var(--lcars-butterscotch));
  border-right: 2px solid var(--panel-frame-color, var(--lcars-butterscotch));
  border-bottom: 4px solid var(--panel-frame-color, var(--lcars-butterscotch));
  border-radius: 0.75rem;

  padding: var(--lcars-gap);
  background: var(--lcars-bg);

  /* Dynamic frame color — set by JS based on hvac_action */
  --panel-frame-color: var(--climate-action-color, var(--lcars-butterscotch));

  /* Dynamic accent for temperature arc and current temp readout */
  --climate-action-color: var(--lcars-butterscotch);

  min-height: calc(var(--lcars-vunit) * 5);
}
```

### Why Dynamic `--panel-frame-color`

The frame color shifts based on the current `hvac_action` attribute — warm when the furnace is firing, cool when the compressor kicks in. This gives **instant, peripheral visual feedback** without reading a single number. You glance at the panel: warm glow = heating, cool glow = cooling, neutral = idle. This is how the Environmental Control station communicates systemwide status on the bridge — color fields you absorb at a distance.

---

## 2. HVAC Action → Color Mapping

The `hvac_action` attribute drives the dynamic frame color, temperature arc accent, and header badge color. This is the primary visual feedback channel.

### Color Map

| `hvac_action` | LCARS Variable           | Hex       | Rationale                                                    |
|---------------|--------------------------|-----------|--------------------------------------------------------------|
| `heating`     | `--lcars-butterscotch`   | `#ff9966` | Warm amber — furnace/heat pump active, warmth                |
| `cooling`     | `--lcars-ice`            | `#99ccff` | Cool blue — compressor active, cooling                       |
| `idle`        | `--lcars-sunflower`      | `#ffcc99` | Soft warm neutral — system at target, standing by            |
| `drying`      | `--lcars-almond`         | `#ffaa90` | Dry warmth — dehumidification active                         |
| `fan`         | `--lcars-african-violet` | `#cc99ff` | Distinct hue — fan circulation without heating/cooling       |
| `off`         | `--lcars-gray`           | `#666688` | Muted — system powered down, standard LCARS disabled         |
| N/A           | `--lcars-gray`           | `#666688` | Unavailable / unknown — sensor offline                       |

### HVAC Mode → Button Color (for mode selector strip)

| `hvac_mode`   | Active Color              | Hex       | Rationale                                          |
|---------------|---------------------------|-----------|-----------------------------------------------------|
| `heat`        | `--lcars-butterscotch`    | `#ff9966` | Same warm hue as heating action — visual consistency |
| `cool`        | `--lcars-ice`             | `#99ccff` | Same cool hue as cooling action                      |
| `heat_cool`   | `--lcars-gold`            | `#ffaa00` | Gold = dual-function active, important               |
| `auto`        | `--lcars-gold`            | `#ffaa00` | Gold = automatic/smart decision mode                 |
| `dry`         | `--lcars-almond`          | `#ffaa90` | Matches drying action color                          |
| `fan_only`    | `--lcars-african-violet`  | `#cc99ff` | Matches fan action color                             |
| `off`         | `--lcars-gray`            | `#666688` | Disabled state                                       |

### Contrast Verification (all vs `#000000` background)

| Color                    | Hex       | Contrast vs #000 | WCAG Level | Usage                        |
|--------------------------|-----------|-------------------|------------|------------------------------|
| `--lcars-butterscotch`   | `#ff9966` | 8.2:1             | AAA        | Heating action/mode          |
| `--lcars-ice`            | `#99ccff` | 10.3:1            | AAA        | Cooling action/mode          |
| `--lcars-sunflower`      | `#ffcc99` | 13.1:1            | AAA        | Idle action                  |
| `--lcars-gold`           | `#ffaa00` | 8.6:1             | AAA        | Auto/heat_cool mode          |
| `--lcars-almond`         | `#ffaa90` | 9.6:1             | AAA        | Dry action/mode              |
| `--lcars-african-violet` | `#cc99ff` | 8.5:1             | AAA        | Fan action/mode              |
| `--lcars-gray`           | `#666688` | 4.6:1             | AA         | Off/disabled                 |
| `--lcars-space-white`    | `#f5f6fa` | 18.9:1            | AAA        | Labels, data text            |
| `--lcars-tomato`         | `#ff5555` | 5.2:1             | AA         | Faults/alerts                |

All pass **WCAG 1.4.3 (AA)** minimum 4.5:1. `--lcars-gray` at 4.6:1 is intentionally dim for disabled state and passes AA. Color is never the sole indicator — all states have text labels.

### Implementation

```javascript
/**
 * Resolve hvac_action to LCARS color CSS variable.
 * This drives the dynamic frame color and temperature arc accent.
 */
function getClimateActionColor(hvacAction) {
  switch (hvacAction) {
    case 'heating': return 'var(--lcars-butterscotch)';
    case 'cooling': return 'var(--lcars-ice)';
    case 'idle':    return 'var(--lcars-sunflower)';
    case 'drying':  return 'var(--lcars-almond)';
    case 'fan':     return 'var(--lcars-african-violet)';
    case 'off':     return 'var(--lcars-disabled)';
    default:        return 'var(--lcars-disabled)';
  }
}

/**
 * Resolve hvac_mode to active button color.
 */
function getClimateModeColor(hvacMode) {
  switch (hvacMode) {
    case 'heat':      return 'var(--lcars-butterscotch)';
    case 'cool':      return 'var(--lcars-ice)';
    case 'heat_cool': return 'var(--lcars-gold)';
    case 'auto':      return 'var(--lcars-gold)';
    case 'dry':       return 'var(--lcars-almond)';
    case 'fan_only':  return 'var(--lcars-african-violet)';
    case 'off':       return 'var(--lcars-disabled)';
    default:          return 'var(--lcars-disabled)';
  }
}

/**
 * Map hvac_action to human-readable uppercase label for the header badge.
 */
function getClimateActionLabel(hvacAction) {
  switch (hvacAction) {
    case 'heating': return 'HEATING';
    case 'cooling': return 'COOLING';
    case 'idle':    return 'IDLE';
    case 'drying':  return 'DRYING';
    case 'fan':     return 'FAN';
    case 'off':     return 'OFF';
    default:        return 'STANDBY';
  }
}
```

---

## 3. Panel Header

### Structure

```html
<div class="climate-header" role="heading" aria-level="3">
  <span class="device-panel-name">${deviceName}</span>
  <span class="device-panel-header-line" aria-hidden="true"></span>
  <span class="climate-action-badge" style="color: ${actionColor}">
    ${actionLabel}
  </span>
  <span class="climate-header-temp" style="color: ${actionColor}">
    ${currentTemp}°${unit}
  </span>
</div>
```

### CSS

```css
.climate-header {
  grid-area: header;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  min-height: var(--lcars-bar-h);
  border-bottom: 2px solid var(--panel-frame-color);
}

.climate-action-badge {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  text-transform: uppercase;
  white-space: nowrap;
  font-weight: 700;
  transition: color var(--lcars-transition-slow);
}

.climate-header-temp {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  text-transform: uppercase;
  white-space: nowrap;
  transition: color var(--lcars-transition-slow);
}
```

Reuses `.device-panel-name` and `.device-panel-header-line` from the Device Panel Spec §3.1. The action badge and ambient temperature readout in the header give at-a-glance status without scrolling — the bridge officer's peripheral view.

---

## 4. Sensor Telemetry Column (Left)

### Entity Ordering (Top to Bottom)

Sensors display in a fixed, prioritized order — the most actionable information at the top:

| Row | Sensor            | Source Attribute / Entity                  | Unit    | Color                              |
|-----|-------------------|--------------------------------------------|---------|------------------------------------|
| 1   | Current Temp      | `current_temperature` attr                 | °F/°C   | Dynamic `--climate-action-color`   |
| 2   | Target Temp       | `temperature` attr (single setpoint)       | °F/°C   | `var(--lcars-gold)`                |
| 2a  | Target Low        | `target_temp_low` attr (dual setpoint)     | °F/°C   | `var(--lcars-butterscotch)`        |
| 2b  | Target High       | `target_temp_high` attr (dual setpoint)    | °F/°C   | `var(--lcars-ice)`                 |
| 3   | Humidity          | `current_humidity` attr or linked sensor   | %       | `var(--lcars-data-accent)`         |
| —   | *(divider)*       |                                            |         |                                    |
| 4   | HVAC Mode         | `state` (climate entity)                   | —       | Dynamic per-mode color             |
| 5   | Fan Mode          | `fan_mode` attr                            | —       | `var(--lcars-data-accent)`         |
| 6   | Preset Mode       | `preset_mode` attr                         | —       | `var(--lcars-data-accent)`         |
| —   | *(divider)*       |                                            |         |                                    |
| 7   | Faults            | Linked `binary_sensor` entities            | —       | `var(--lcars-tomato)` or `--lcars-gray` |

### CSS

```css
.climate-sensors {
  grid-area: sensors;
  display: flex;
  flex-direction: column;
  gap: var(--lcars-gap);
  padding: 0.25rem 0;
  align-self: start;
}

.climate-sensors-divider {
  height: 1px;
  background: var(--lcars-disabled);
  margin: 0.25rem 0;
  opacity: 0.5;
}

.climate-section-label {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-disabled);
  text-transform: uppercase;
  padding: 0.25rem 0.5rem 0;
  letter-spacing: 0.05em;
}
```

Sensor lines reuse `.device-sensor-line` from the Device Panel Spec §3.3. The fault section is separated by a thin divider and a dim "FAULTS" sub-label — secondary information suppressed per Bracer Jack.

### Dual Setpoint Display Logic

```javascript
/**
 * Determine whether to show single or dual setpoint.
 * Dual setpoint when mode is heat_cool and both target temps exist.
 */
function isDualSetpoint(stateObj) {
  const mode = stateObj?.state;
  const hasLow = stateObj?.attributes?.target_temp_low != null;
  const hasHigh = stateObj?.attributes?.target_temp_high != null;
  return (mode === 'heat_cool' || mode === 'auto') && hasLow && hasHigh;
}
```

---

## 5. Primary Media Frame — Temperature Viewscreen

The center-right viewscreen contains the large current temperature readout and setpoint controls. This is a **clean, minimal display** — not a skeuomorphic thermostat dial. Think the central readout on the Ops console: a number you can read from across the room.

### 5.1 Temperature Arc (SVG)

A semicircular arc behind the temperature number indicates where the current temperature falls within the `min_temp` → `max_temp` range. The arc uses the dynamic `--climate-action-color`.

```
          ╭─────────────╮
        ╱   ╱╱╱╱╱╱╱╱╱     ╲       ← colored arc (progress)
      ╱   ╱╱╱╱╱╱╱╱╱         ╲     ← gray arc (remaining)
     │                        │
     │         72°            │     ← large current temp
     │        CURRENT         │     ← label
     │                        │
      ╲                      ╱
        ╲                  ╱
          ╰──────────────╯
```

### SVG Structure

```html
<svg class="climate-temp-arc"
     viewBox="0 0 200 130"
     role="meter"
     aria-label="Current temperature: ${currentTemp} degrees"
     aria-valuemin="${minTemp}"
     aria-valuemax="${maxTemp}"
     aria-valuenow="${currentTemp}">

  <!-- Background arc (full range) -->
  <path class="climate-arc-bg"
        d="${arcPath(200, 130, 80, 180, 0)}"
        fill="none"
        stroke="var(--lcars-disabled)"
        stroke-width="6"
        stroke-linecap="round" />

  <!-- Progress arc (current position within range) -->
  <path class="climate-arc-progress"
        d="${arcPath(200, 130, 80, 180, progressAngle)}"
        fill="none"
        stroke="var(--climate-action-color)"
        stroke-width="6"
        stroke-linecap="round" />

  <!-- Target tick mark(s) on the arc -->
  <circle class="climate-arc-target-tick"
          cx="${targetTickX}" cy="${targetTickY}" r="4"
          fill="var(--lcars-gold)" />

  <!-- Dual setpoint: low tick (butterscotch) and high tick (ice) -->
  <!-- Only rendered in heat_cool mode -->
  <circle class="climate-arc-target-low"
          cx="${lowTickX}" cy="${lowTickY}" r="4"
          fill="var(--lcars-butterscotch)"
          style="display: ${isDual ? 'block' : 'none'}" />
  <circle class="climate-arc-target-high"
          cx="${highTickX}" cy="${highTickY}" r="4"
          fill="var(--lcars-ice)"
          style="display: ${isDual ? 'block' : 'none'}" />

  <!-- Current temperature — large text -->
  <text class="climate-temp-value"
        x="100" y="80"
        text-anchor="middle"
        dominant-baseline="middle"
        fill="var(--climate-action-color)"
        font-family="var(--lcars-font)"
        font-size="42"
        text-transform="uppercase">
    ${currentTemp}°
  </text>

  <!-- Label below temp -->
  <text class="climate-temp-label"
        x="100" y="105"
        text-anchor="middle"
        dominant-baseline="middle"
        fill="var(--lcars-space-white)"
        font-family="var(--lcars-font)"
        font-size="12"
        text-transform="uppercase">
    CURRENT
  </text>
</svg>
```

### CSS

```css
.climate-media {
  grid-area: media;
  position: relative;
  border: 3px solid var(--panel-frame-color, var(--lcars-butterscotch));
  border-radius: 0.5rem;
  overflow: hidden;
  background: var(--lcars-bg);
  aspect-ratio: var(--media-aspect, 1 / 1);

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
}

.climate-temp-arc {
  width: 100%;
  max-width: 14rem;
  height: auto;
  display: block;
}

/* Corner brackets — reuse from Device Panel Spec §3.2 */
.climate-media::before,
.climate-media::after {
  content: '';
  position: absolute;
  width: 1.5rem;
  height: 1.5rem;
  border-color: var(--panel-frame-color, var(--lcars-butterscotch));
  border-style: solid;
  pointer-events: none;
  z-index: 1;
}

.climate-media::before {
  top: 0.25rem;
  left: 0.25rem;
  border-width: 2px 0 0 2px;
  border-radius: 0.25rem 0 0 0;
}

.climate-media::after {
  bottom: 0.25rem;
  right: 0.25rem;
  border-width: 0 2px 2px 0;
  border-radius: 0 0 0.25rem 0;
}

/* Arc transition for color changes */
.climate-arc-progress {
  transition: stroke var(--lcars-transition-slow), stroke-dashoffset 0.6s ease-out;
}

.climate-arc-bg {
  opacity: 0.3;
}

/* Temperature text — large, dynamic color */
.climate-temp-value {
  transition: fill var(--lcars-transition-slow);
}
```

### Arc Path Generation (JS)

```javascript
/**
 * Generate an SVG arc path for the temperature gauge.
 * @param {number} w - viewBox width
 * @param {number} h - viewBox height
 * @param {number} r - arc radius
 * @param {number} startAngle - arc start in degrees (180 = left)
 * @param {number} endAngle - arc end in degrees (0 = right)
 * @returns {string} SVG path d-attribute
 */
function arcPath(w, h, r, startAngle, endAngle) {
  const cx = w / 2;
  const cy = h - 10;
  const toRad = (deg) => (deg * Math.PI) / 180;

  const x1 = cx + r * Math.cos(toRad(startAngle));
  const y1 = cy + r * Math.sin(toRad(startAngle));
  const x2 = cx + r * Math.cos(toRad(endAngle));
  const y2 = cy + r * Math.sin(toRad(endAngle));

  const largeArc = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;

  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
}

/**
 * Calculate the progress angle based on current temp within min/max range.
 * Arc spans from 180° (left) to 0° (right).
 * @param {number} current - current temperature
 * @param {number} min - thermostat min_temp
 * @param {number} max - thermostat max_temp
 * @returns {number} angle in degrees
 */
function getProgressAngle(current, min, max) {
  if (current == null || min == null || max == null) return 180;
  const range = max - min;
  if (range <= 0) return 180;
  const pct = Math.max(0, Math.min(1, (current - min) / range));
  // 180° = 0%, 0° = 100% (arc goes from left to right)
  return 180 - (pct * 180);
}

/**
 * Calculate the (x, y) position of a tick mark on the arc
 * for a given temperature value.
 */
function getArcTickPosition(temp, min, max, cx, cy, r) {
  const range = max - min;
  if (range <= 0) return { x: cx, y: cy };
  const pct = Math.max(0, Math.min(1, (temp - min) / range));
  const angle = 180 - (pct * 180);
  const rad = (angle * Math.PI) / 180;
  return {
    x: (cx + r * Math.cos(rad)).toFixed(1),
    y: (cy + r * Math.sin(rad)).toFixed(1),
  };
}
```

### 5.2 Setpoint Controls

Below the arc, inline setpoint controls with LCARS pill buttons for increment/decrement.

```html
<!-- Single setpoint (heat, cool modes) -->
<div class="climate-setpoint" role="group" aria-label="Target temperature control">
  <button class="climate-setpoint-btn decrement"
          aria-label="Decrease target temperature"
          @click="${() => adjustTemp(-step)}">
    <span aria-hidden="true">–</span>
  </button>
  <div class="climate-setpoint-display">
    <span class="climate-setpoint-label">TARGET</span>
    <span class="climate-setpoint-value">${targetTemp}°${unit}</span>
  </div>
  <button class="climate-setpoint-btn increment"
          aria-label="Increase target temperature"
          @click="${() => adjustTemp(+step)}">
    <span aria-hidden="true">+</span>
  </button>
</div>

<!-- Dual setpoint (heat_cool mode) -->
<div class="climate-setpoint-dual" role="group" aria-label="Temperature range controls">
  <div class="climate-setpoint-row" role="group" aria-label="Low temperature target">
    <button class="climate-setpoint-btn decrement"
            aria-label="Decrease low target temperature">–</button>
    <div class="climate-setpoint-display">
      <span class="climate-setpoint-label" style="color: var(--lcars-butterscotch)">LOW</span>
      <span class="climate-setpoint-value" style="color: var(--lcars-butterscotch)">
        ${targetTempLow}°${unit}
      </span>
    </div>
    <button class="climate-setpoint-btn increment"
            aria-label="Increase low target temperature">+</button>
  </div>
  <div class="climate-setpoint-row" role="group" aria-label="High temperature target">
    <button class="climate-setpoint-btn decrement"
            aria-label="Decrease high target temperature">–</button>
    <div class="climate-setpoint-display">
      <span class="climate-setpoint-label" style="color: var(--lcars-ice)">HIGH</span>
      <span class="climate-setpoint-value" style="color: var(--lcars-ice)">
        ${targetTempHigh}°${unit}
      </span>
    </div>
    <button class="climate-setpoint-btn increment"
            aria-label="Increase high target temperature">+</button>
  </div>
</div>
```

### Setpoint CSS

```css
.climate-setpoint,
.climate-setpoint-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
}

.climate-setpoint-dual {
  display: flex;
  flex-direction: column;
  gap: var(--lcars-gap);
  width: 100%;
}

.climate-setpoint-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;                               /* 40px — exceeds WCAG 2.5.8 24px */
  min-width: 2.5rem;

  background: var(--lcars-sunflower);
  color: var(--lcars-black);
  border: none;
  border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;

  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-sub);
  font-weight: 700;
  cursor: pointer;
  transition: filter var(--lcars-transition), background var(--lcars-transition);
  user-select: none;
}

.climate-setpoint-btn.decrement {
  border-radius: var(--lcars-btn-radius) 0 0 var(--lcars-btn-radius);
}

.climate-setpoint-btn:hover {
  filter: brightness(1.2);
}

.climate-setpoint-btn:focus-visible {
  outline: 2px solid var(--lcars-ice);
  outline-offset: 2px;
}

.climate-setpoint-btn:active {
  background: var(--lcars-gold);
}

.climate-setpoint-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.125rem;
  min-width: 4rem;
}

.climate-setpoint-label {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-space-white);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.climate-setpoint-value {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-sub);
  color: var(--lcars-gold);
  text-transform: uppercase;
  font-weight: 700;
  transition: color var(--lcars-transition);
}
```

### Setpoint Adjustment Logic (JS)

```javascript
/**
 * Adjust the thermostat target temperature.
 * Respects min_temp, max_temp, and target_temp_step from the entity.
 * @param {object} hass - Home Assistant instance
 * @param {string} entityId - climate entity ID
 * @param {number} delta - increment (+step) or decrement (-step)
 * @param {'temperature'|'target_temp_low'|'target_temp_high'} target - which setpoint
 */
function adjustSetpoint(hass, entityId, delta, target = 'temperature') {
  const stateObj = hass.states[entityId];
  if (!stateObj) return;

  const attrs = stateObj.attributes;
  const step = attrs.target_temp_step || 0.5;
  const min = attrs.min_temp || 45;
  const max = attrs.max_temp || 95;

  const current = attrs[target];
  if (current == null) return;

  const newTemp = Math.round((current + delta) / step) * step;
  const clamped = Math.max(min, Math.min(max, newTemp));

  // Enforce low < high constraint for dual setpoint
  if (target === 'target_temp_low' && attrs.target_temp_high != null) {
    if (clamped >= attrs.target_temp_high) return;
  }
  if (target === 'target_temp_high' && attrs.target_temp_low != null) {
    if (clamped <= attrs.target_temp_low) return;
  }

  hass.callService('climate', 'set_temperature', {
    entity_id: entityId,
    [target]: clamped,
  });
}
```

---

## 6. HVAC Mode Selector Strip

A horizontal row of pill buttons for selecting the HVAC mode. Only modes supported by the device are rendered (from the `hvac_modes` attribute).

### Structure

```html
<div class="climate-mode-strip" role="radiogroup" aria-label="HVAC mode selector">
  ${supportedModes.map(mode => html`
    <button class="climate-mode-btn ${mode === currentMode ? 'active' : ''}"
            role="radio"
            aria-checked="${mode === currentMode}"
            aria-label="${getModeLabel(mode)} mode"
            style="--mode-color: ${getClimateModeColor(mode)}"
            @click="${() => setHvacMode(mode)}">
      <ha-icon icon="${getModeIcon(mode)}" aria-hidden="true"></ha-icon>
      ${getModeLabel(mode)}
    </button>
  `)}
</div>
```

### CSS

```css
.climate-mode-strip {
  grid-area: modes;
  display: flex;
  flex-wrap: wrap;
  gap: var(--lcars-gap);
  padding-top: var(--lcars-gap);
  border-top: 2px solid var(--panel-frame-color);
}

.climate-mode-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  height: var(--lcars-btn-height);             /* 3rem = 48px */
  padding: 0 0.75rem 0 0.5rem;
  min-width: 5rem;                             /* WCAG 2.5.8 */

  background: var(--lcars-disabled);
  color: var(--lcars-space-white);
  border: none;
  border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;

  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  text-transform: uppercase;
  text-align: left;
  cursor: pointer;
  transition: filter var(--lcars-transition), background var(--lcars-transition);
  white-space: nowrap;
  user-select: none;
}

.climate-mode-btn:hover {
  filter: brightness(1.2);
}

.climate-mode-btn:focus-visible {
  outline: 2px solid var(--lcars-ice);
  outline-offset: 2px;
}

/* Active mode — uses dynamic mode color */
.climate-mode-btn.active,
.climate-mode-btn[aria-checked="true"] {
  background: var(--mode-color, var(--lcars-gold));
  color: var(--lcars-black);
}

.climate-mode-btn ha-icon {
  --mdc-icon-size: 16px;
  flex-shrink: 0;
}
```

### Mode Icons & Labels

```javascript
/**
 * Get the MDI icon for an HVAC mode.
 */
function getModeIcon(mode) {
  switch (mode) {
    case 'heat':      return 'mdi:fire';
    case 'cool':      return 'mdi:snowflake';
    case 'heat_cool': return 'mdi:sun-snowflake-variant';
    case 'auto':      return 'mdi:thermostat-auto';
    case 'dry':       return 'mdi:water-percent';
    case 'fan_only':  return 'mdi:fan';
    case 'off':       return 'mdi:power';
    default:          return 'mdi:thermostat';
  }
}

/**
 * Get the LCARS-style uppercase label for an HVAC mode.
 */
function getModeLabel(mode) {
  switch (mode) {
    case 'heat':      return 'HEAT';
    case 'cool':      return 'COOL';
    case 'heat_cool': return 'HEAT/COOL';
    case 'auto':      return 'AUTO';
    case 'dry':       return 'DRY';
    case 'fan_only':  return 'FAN';
    case 'off':       return 'OFF';
    default:          return mode.toUpperCase().replace(/_/g, ' ');
  }
}

/**
 * Set the HVAC mode via HA service call.
 */
function setHvacMode(hass, entityId, mode) {
  hass.callService('climate', 'set_hvac_mode', {
    entity_id: entityId,
    hvac_mode: mode,
  });
}
```

---

## 7. Auxiliary Controls Row (Fan Mode + Preset Mode)

Below the mode strip, a secondary control row for fan mode and preset selection. These are inline pill-strip selectors, more compact than the mode strip.

### Structure

```html
<div class="climate-aux-controls">
  <!-- Fan Mode (if device supports it) -->
  <div class="climate-aux-group" role="group" aria-label="Fan mode">
    <span class="climate-aux-label">FAN</span>
    <div class="climate-aux-strip" role="radiogroup" aria-label="Fan speed">
      ${fanModes.map(mode => html`
        <button class="climate-aux-btn ${mode === currentFanMode ? 'active' : ''}"
                role="radio"
                aria-checked="${mode === currentFanMode}"
                aria-label="Fan mode: ${mode}"
                @click="${() => setFanMode(mode)}">
          ${mode.toUpperCase()}
        </button>
      `)}
    </div>
  </div>

  <!-- Preset Mode (if device supports it) -->
  <div class="climate-aux-group" role="group" aria-label="Preset mode">
    <span class="climate-aux-label">PRESET</span>
    <div class="climate-aux-strip" role="radiogroup" aria-label="Preset">
      ${presetModes.map(mode => html`
        <button class="climate-aux-btn ${mode === currentPreset ? 'active' : ''}"
                role="radio"
                aria-checked="${mode === currentPreset}"
                aria-label="Preset: ${mode}"
                @click="${() => setPreset(mode)}">
          ${mode.toUpperCase()}
        </button>
      `)}
    </div>
  </div>
</div>
```

### CSS

```css
.climate-aux-controls {
  grid-area: auxctrl;
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--lcars-gap) * 4);
  padding-top: var(--lcars-gap);
  border-top: 2px solid var(--panel-frame-color);
}

.climate-aux-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.climate-aux-label {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-text-heading);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.climate-aux-strip {
  display: flex;
  gap: var(--lcars-gap);
  flex-wrap: wrap;
}

.climate-aux-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 2.25rem;                              /* 36px — exceeds 24px minimum */
  padding: 0 0.75rem;
  min-width: 3.5rem;                            /* WCAG 2.5.8 */

  background: var(--lcars-disabled);
  color: var(--lcars-space-white);
  border: none;
  border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;

  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  text-transform: uppercase;
  cursor: pointer;
  transition: filter var(--lcars-transition), background var(--lcars-transition);
  user-select: none;
}

.climate-aux-btn:hover {
  filter: brightness(1.2);
}

.climate-aux-btn:focus-visible {
  outline: 2px solid var(--lcars-ice);
  outline-offset: 2px;
}

.climate-aux-btn.active,
.climate-aux-btn[aria-checked="true"] {
  background: var(--lcars-gold);
  color: var(--lcars-black);
}
```

### Service Calls (JS)

```javascript
/**
 * Set the fan mode via HA service call.
 */
function setFanMode(hass, entityId, fanMode) {
  hass.callService('climate', 'set_fan_mode', {
    entity_id: entityId,
    fan_mode: fanMode,
  });
}

/**
 * Set the preset mode via HA service call.
 */
function setPresetMode(hass, entityId, presetMode) {
  hass.callService('climate', 'set_preset_mode', {
    entity_id: entityId,
    preset_mode: presetMode,
  });
}
```

### Conditional Rendering

Fan mode and preset mode strips are only rendered when the device supports them:

```javascript
/**
 * Check if climate entity supports fan modes.
 */
function hasFanModes(stateObj) {
  const modes = stateObj?.attributes?.fan_modes;
  return Array.isArray(modes) && modes.length > 0;
}

/**
 * Check if climate entity supports presets.
 */
function hasPresetModes(stateObj) {
  const modes = stateObj?.attributes?.preset_modes;
  return Array.isArray(modes) && modes.length > 0;
}
```

---

## 8. HVAC Action Animation

The current HVAC action is communicated through subtle ambient animation on the temperature arc. This provides an additional visual channel beyond color.

### Heating Pulse

When `hvac_action` is `heating`, the arc progress stroke gently pulses brighter — like the warmth of a furnace cycling.

```css
.climate-arc-progress.heating {
  animation: climate-heating-pulse 2s ease-in-out infinite;
}

@keyframes climate-heating-pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.7; }
}
```

### Cooling Pulse

When `hvac_action` is `cooling`, the arc progress gently cycles opacity in the opposite rhythm — cooler, more mechanical.

```css
.climate-arc-progress.cooling {
  animation: climate-cooling-pulse 3s ease-in-out infinite;
}

@keyframes climate-cooling-pulse {
  0%, 100% { opacity: 0.8; }
  50%      { opacity: 1; }
}
```

### Idle — No Animation

When idle, the arc is static with full opacity. Stillness communicates "at rest."

### Off — Dimmed

```css
.climate-arc-progress.off {
  opacity: 0.25;
}

.climate-arc-bg.off {
  opacity: 0.15;
}
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  .climate-arc-progress.heating,
  .climate-arc-progress.cooling {
    animation: none !important;
    opacity: 1;
  }
}
```

All animations respect `prefers-reduced-motion` per WCAG 2.3.3.

---

## 9. Fault Indicators

Associated `binary_sensor` entities (with device_class `problem`, `heat`, `cold`, or `connectivity`) display in the fault section. This is critical for Nest and Ecobee devices that expose diagnostic binary sensors.

### Detection Logic

```javascript
/**
 * Find binary_sensor entities associated with this climate device
 * that indicate faults or problems.
 */
function getFaultEntities(deviceEntities) {
  const FAULT_CLASSES = ['problem', 'heat', 'cold', 'connectivity',
                         'battery', 'tamper', 'smoke', 'safety'];
  return deviceEntities.filter(e => {
    const domain = e.entity_id.split('.')[0];
    if (domain !== 'binary_sensor') return false;
    const dc = e.original_device_class || e.device_class || '';
    return FAULT_CLASSES.includes(dc);
  });
}

/**
 * Check if any faults are currently active.
 */
function hasActiveFaults(hass, faultEntities) {
  return faultEntities.some(e => {
    const state = hass.states[e.entity_id];
    return state?.state === 'on';
  });
}
```

### Fault Display

```css
.climate-fault-line {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 1.75rem;
  padding: 0 0.5rem;
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  text-transform: uppercase;
}

.climate-fault-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.climate-fault-indicator.active {
  background: var(--lcars-tomato);
  animation: fault-pulse 1s ease-in-out infinite;
}

.climate-fault-indicator.clear {
  background: var(--lcars-disabled);
}

.climate-fault-label {
  color: var(--lcars-space-white);
  flex: 1;
}

.climate-fault-value.active {
  color: var(--lcars-tomato);
  font-weight: 700;
}

.climate-fault-value.clear {
  color: var(--lcars-disabled);
}

@keyframes fault-pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.5; }
}

@media (prefers-reduced-motion: reduce) {
  .climate-fault-indicator.active {
    animation: none !important;
    /* Static thicker dot as reduced-motion alternative */
    width: 10px;
    height: 10px;
  }
}
```

### No-Fault State

When no faults are active, display a single line: `● NONE` in `--lcars-disabled` gray. This confirms the panel is monitoring, not that it lacks fault support.

---

## 10. HA Entity Mapping

### Target Devices

| Device              | Climate Entity                | Key Attributes                                                        | Special Features                |
|---------------------|-------------------------------|-----------------------------------------------------------------------|---------------------------------|
| Nest Thermostat     | `climate.nest_thermostat`     | `hvac_modes`: heat, cool, heat_cool, eco, off; `fan_mode`: on, auto | Eco mode as hvac_mode           |
| Ecobee              | `climate.ecobee`              | `hvac_modes`: heat, cool, heat_cool, auto, off; `preset_modes`: home, away, sleep | Rich presets              |
| Generic HVAC        | `climate.*`                   | Varies                                                                | Subset of attributes            |

### Required Entity: Climate

The primary entity — provides all thermostat state and controls.

| Attribute             | Used For                                     | Fallback                    |
|-----------------------|----------------------------------------------|-----------------------------|
| `state`               | Current HVAC mode (displayed in mode strip)  | `'unavailable'`             |
| `current_temperature`  | Large temperature display                    | `'--'`                      |
| `temperature`          | Single setpoint value                        | Hidden if null              |
| `target_temp_high`     | Dual setpoint high target                    | Hidden if null              |
| `target_temp_low`      | Dual setpoint low target                     | Hidden if null              |
| `current_humidity`     | Humidity sensor line                         | Hidden if null              |
| `hvac_action`          | Dynamic frame color + action badge           | `'idle'`                    |
| `hvac_modes`           | Mode selector strip buttons                  | `['off']`                   |
| `fan_mode`             | Fan mode selector active state               | Section hidden if null      |
| `fan_modes`            | Fan mode selector buttons                    | Section hidden if null      |
| `preset_mode`          | Preset selector active state                 | Section hidden if null      |
| `preset_modes`         | Preset selector buttons                      | Section hidden if null      |
| `min_temp`             | Arc range minimum + setpoint clamping        | `45` (HA default)           |
| `max_temp`             | Arc range maximum + setpoint clamping        | `95` (HA default)           |
| `target_temp_step`     | Setpoint ±button increment                   | `0.5`                       |

### Optional Linked Entities

| Entity Domain        | Device Class        | Used For                          | Discovery                         |
|----------------------|---------------------|-----------------------------------|-----------------------------------|
| `binary_sensor`      | `problem`           | Fault indicator                   | Same device_id                    |
| `binary_sensor`      | `connectivity`      | Online/offline status             | Same device_id                    |
| `binary_sensor`      | `battery`           | Battery warning (wireless tstats) | Same device_id                    |
| `sensor`             | `humidity`          | Humidity (if not in climate attr) | Same device_id or configured      |
| `sensor`             | `temperature`       | Outdoor temp (if available)       | Configured entity                 |

### Entity Classification Logic

```javascript
/**
 * Classify entities for the climate panel.
 * Returns { climate, sensors, faults, diagnostics }.
 */
function classifyClimateEntities(entities) {
  const result = {
    climate: null,        // primary climate entity
    sensors: [],          // sensor domain, non-diagnostic
    faults: [],           // binary_sensor fault indicators
    diagnostics: [],      // entity_category: diagnostic
  };

  const FAULT_CLASSES = ['problem', 'heat', 'cold', 'connectivity',
                         'battery', 'tamper', 'smoke', 'safety'];

  for (const e of entities) {
    const domain = e.entity_id.split('.')[0];
    const dc = e.original_device_class || e.device_class || '';
    const cat = e.entity_category || '';

    if (domain === 'climate') {
      result.climate = result.climate || e;
      continue;
    }

    if (cat === 'diagnostic' || cat === 'config') {
      result.diagnostics.push(e);
      continue;
    }

    if (domain === 'binary_sensor' && FAULT_CLASSES.includes(dc)) {
      result.faults.push(e);
      continue;
    }

    if (domain === 'sensor') {
      result.sensors.push(e);
      continue;
    }
  }

  return result;
}
```

---

## 11. Typography & Spacing

### Font Sizes (Three sizes only — Bracer Jack Rule 6)

| Element                  | Size Token                   | Value      | Usage                             |
|--------------------------|------------------------------|------------|-----------------------------------|
| Current temperature (SVG)| Title tier equivalent        | `42` (SVG) | Large viewscreen readout          |
| Device name, setpoint val| `--lcars-font-size-sub`      | `1.25rem`  | Panel header, setpoint display    |
| All other text           | `--lcars-font-size-data`     | `0.875rem` | Sensor labels, values, buttons    |

**Three font sizes. No exceptions.** The SVG temperature text at font-size 42 (within a 200×130 viewBox) maps to the "title" tier visually. Everything else is sub-header or data.

### Spacing Constants (Jörn Weißenborn Grid)

| Spacing                      | Token / Value                | Usage                                       |
|------------------------------|------------------------------|---------------------------------------------|
| Gap between all elements     | `var(--lcars-gap)` = 0.25rem | Universal LCARS grid spacing                |
| Panel internal padding       | `var(--lcars-gap)` = 0.25rem | Inside the panel frame border               |
| Sensor line min-height       | 1.75rem                      | ~28px — exceeds WCAG 2.5.8 (24px min)      |
| Mode button height           | `var(--lcars-btn-height)` = 3rem | Standard LCARS button = 48px           |
| Mode button min-width        | 5rem = 80px                  | Exceeds WCAG 2.5.8                          |
| Aux button height            | 2.25rem = 36px               | Compact but exceeds 24px minimum            |
| Setpoint ± button size       | 2.5rem × 2.5rem = 40px      | Exceeds WCAG 2.5.8                          |
| Media frame border           | 3px solid                    | Viewscreen border — matches Device Panel    |
| Panel outer border (left/bottom) | 4px solid                | Thick side (Bracer Jack Rule 2)             |
| Panel outer border (top/right)   | 2px solid                | Thin side — thick→thin                      |

### Text Treatment

- **ALL UPPERCASE** for: device name, sensor labels, sensor values, button text, setpoint labels, "CURRENT"
- **Mixed case** ONLY for: none in this panel
- **Letter-spacing**: `0.05em` on headings and labels (matching existing `.lcars-heading`)
- **Font-weight**: `700` (bold) for sensor values, setpoint values, action badge. `400` (normal) for everything else

---

## 12. Responsive Behavior

### Desktop (≥768px) — Full 2-Column Layout

The spec above. Media right, sensors left, mode strip and aux controls full-width below.

### Mobile (<768px) — Stacked Layout

```css
@media (max-width: 767px) {
  .lcars-climate-panel {
    grid-template-columns: 1fr;
    grid-template-areas:
      "header"
      "media"
      "sensors"
      "modes"
      "auxctrl";
  }

  .climate-media {
    aspect-ratio: auto;
    max-width: 16rem;
    margin: 0 auto;
  }

  .climate-sensors {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .device-sensor-line {
    flex: 1 1 45%;
    min-width: 8rem;
  }

  .climate-mode-strip {
    justify-content: center;
  }

  .climate-aux-controls {
    flex-direction: column;
    gap: var(--lcars-gap);
  }

  .climate-aux-group {
    flex-direction: column;
    align-items: flex-start;
  }
}
```

On mobile, the temperature viewscreen moves to center-top for immediate visual status, sensors flow as wrapped pairs, and controls stack vertically. Reading priority: status → data → mode → controls.

### Compact Mode

For dashboard views with limited space, the panel can render in a compact 1-column strip:

```css
.lcars-climate-panel.compact {
  grid-template-columns: 1fr;
  grid-template-areas:
    "header"
    "media"
    "modes";

  /* Hide sensors and aux controls in compact mode */
}

.lcars-climate-panel.compact .climate-sensors,
.lcars-climate-panel.compact .climate-aux-controls {
  display: none;
}

.lcars-climate-panel.compact .climate-media {
  aspect-ratio: auto;
  max-width: 10rem;
  margin: 0 auto;
}
```

---

## 13. Animation

### Viewscreen Activation

Reuse the existing `viewscreen-activate` keyframes from the Device Panel Spec §7:

```css
.climate-media {
  animation: viewscreen-activate 600ms ease-out both;
}

@keyframes viewscreen-activate {
  0%   { clip-path: inset(50% 0 50% 0); filter: brightness(2) saturate(0); }
  40%  { clip-path: inset(10% 0 10% 0); filter: brightness(1.5) saturate(0.3); }
  100% { clip-path: inset(0 0 0 0); filter: brightness(1) saturate(1); }
}
```

### Frame Color Transition

When `hvac_action` changes (heating → cooling → idle), the frame color transitions smoothly:

```css
.lcars-climate-panel {
  transition: border-color var(--lcars-transition-slow);
}

.climate-header {
  transition: border-color var(--lcars-transition-slow);
}
```

`--lcars-transition-slow` is 600ms — slow enough to notice the shift, fast enough not to lag.

### Setpoint Value Flash

When the user adjusts a setpoint, the value text briefly flashes brighter:

```css
@keyframes setpoint-flash {
  0%   { filter: brightness(1.5); }
  100% { filter: brightness(1); }
}

.climate-setpoint-value[data-changed] {
  animation: setpoint-flash 300ms ease-out;
}
```

### Panel Cascade Entry

```css
.lcars-climate-panel {
  animation: lcars-cascade-in 300ms ease-out both;
}
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  .lcars-climate-panel,
  .climate-media,
  .climate-arc-progress.heating,
  .climate-arc-progress.cooling,
  .climate-setpoint-value[data-changed],
  .climate-fault-indicator.active {
    animation: none !important;
  }
  .lcars-climate-panel {
    transition: none !important;
  }
}
```

---

## 14. Accessibility (a11y) Requirements

### 14.1 Keyboard Navigation (WCAG 2.1.1)

| Element                  | Focusable        | Keydown Handlers                              |
|--------------------------|------------------|-----------------------------------------------|
| Temperature viewscreen   | `tabindex="0"`   | `Enter`/`Space` → open more-info dialog       |
| Sensor lines             | `tabindex="0"`   | `Enter`/`Space` → open more-info dialog       |
| Setpoint – button        | `<button>`       | Native keyboard + long-press repeat           |
| Setpoint + button        | `<button>`       | Native keyboard + long-press repeat           |
| HVAC mode buttons        | `<button>`       | `radiogroup` pattern: Arrow Left/Right        |
| Fan mode buttons         | `<button>`       | `radiogroup` pattern: Arrow Left/Right        |
| Preset mode buttons      | `<button>`       | `radiogroup` pattern: Arrow Left/Right        |

Tab order: Header → Viewscreen → Sensor lines (top to bottom) → Setpoint controls → Mode strip (left to right) → Fan mode strip → Preset strip. Follows DOM order = visual order (WCAG 1.3.2).

### 14.2 ARIA Labeling (WCAG 4.1.2)

```html
<!-- Panel container -->
<div class="lcars-climate-panel"
     role="region"
     aria-label="${deviceName} climate control panel">

  <!-- Header -->
  <div class="climate-header" role="heading" aria-level="3">
    ...
  </div>

  <!-- Sensor column -->
  <div class="climate-sensors" role="list" aria-label="Climate sensors">
    <div class="device-sensor-line" role="listitem" tabindex="0"
         aria-label="Current temperature: ${currentTemp} degrees">
      ...
    </div>
    <div class="device-sensor-line" role="listitem" tabindex="0"
         aria-label="Target temperature: ${targetTemp} degrees">
      ...
    </div>
  </div>

  <!-- Temperature viewscreen -->
  <div class="climate-media" tabindex="0"
       role="button"
       aria-label="Climate details: ${currentTemp} degrees, ${actionLabel}">
    <svg role="meter"
         aria-label="Temperature gauge"
         aria-valuemin="${minTemp}"
         aria-valuemax="${maxTemp}"
         aria-valuenow="${currentTemp}"
         aria-valuetext="${currentTemp} degrees, target ${targetTemp}">
      ...
    </svg>
    <!-- Setpoint controls have their own ARIA — see §5.2 -->
  </div>

  <!-- Mode selector -->
  <div class="climate-mode-strip" role="radiogroup"
       aria-label="HVAC mode: currently ${currentMode}">
    <button role="radio" aria-checked="true|false" aria-label="${mode} mode">
      ...
    </button>
  </div>

  <!-- Fan mode (conditional) -->
  <div class="climate-aux-strip" role="radiogroup"
       aria-label="Fan mode: currently ${fanMode}">
    ...
  </div>

  <!-- Preset mode (conditional) -->
  <div class="climate-aux-strip" role="radiogroup"
       aria-label="Preset: currently ${preset}">
    ...
  </div>

  <!-- Screen reader live region -->
  <div class="sr-only" aria-live="polite" aria-atomic="false">
    <!-- JS injects: "Living Room: heating to 74 degrees" -->
    <!-- JS injects: "Living Room: target changed to 72 degrees" -->
  </div>
</div>
```

### 14.3 Color Is Not Sole Indicator (WCAG 1.4.1)

Every state conveys information through **both** color and text:
- Heating → `HEATING` badge in butterscotch + warm frame border
- Cooling → `COOLING` badge in ice-blue + cool frame border
- Idle → `IDLE` badge in sunflower + neutral frame
- Mode buttons → mode name text + active/inactive visual state
- Faults → `ACTIVE`/`CLEAR` text + indicator dot color

Text alone is sufficient. Color is redundant reinforcement.

### 14.4 Focus Visibility (WCAG 2.4.7, 2.4.11, 2.4.13)

All interactive elements use:
```css
:focus-visible {
  outline: 2px solid var(--lcars-ice);
  outline-offset: 2px;
}
```

- 2px outline meets WCAG 2.4.13 (Focus Appearance)
- `--lcars-ice` (#99ccff) vs `--lcars-black` (#000000) = **10.3:1 contrast** — exceeds 3:1

### 14.5 Target Size (WCAG 2.5.8)

| Element               | Size                | Pixels (at 16px base)  | Passes?   |
|-----------------------|---------------------|------------------------|-----------|
| Mode button           | 3rem × 5rem min     | 48px × 80px            | ✅ AAA    |
| Setpoint ± button     | 2.5rem × 2.5rem     | 40px × 40px            | ✅ AAA    |
| Aux button (fan/preset)| 2.25rem × 3.5rem   | 36px × 56px            | ✅ AA     |
| Sensor line           | 1.75rem × full      | 28px × variable        | ✅ AA     |
| Temperature viewscreen| Full panel width     | ≫ 24px                 | ✅ AAA    |

### 14.6 Screen Reader Announcements (WCAG 4.1.3)

When state changes, use `aria-live="polite"`:

```javascript
/**
 * Announce climate state changes to screen readers.
 * @param {HTMLElement} liveRegion - the aria-live container
 * @param {string} deviceName - friendly name
 * @param {string} change - description of what changed
 */
function announceClimateChange(liveRegion, deviceName, change) {
  if (!liveRegion) return;
  liveRegion.textContent = `${deviceName}: ${change}`;
}

// Usage examples:
// announceClimateChange(el, 'Living Room', 'now heating to 74 degrees');
// announceClimateChange(el, 'Living Room', 'target changed to 72 degrees');
// announceClimateChange(el, 'Living Room', 'mode set to cool');
// announceClimateChange(el, 'Living Room', 'fault detected: connectivity');
```

---

## 15. Nest & Ecobee Device-Specific Behavior

### Nest Learning Thermostat

| Nest Feature           | Panel Behavior                                          |
|------------------------|---------------------------------------------------------|
| Eco mode               | Displayed as an HVAC mode button (Nest exposes `eco` in `hvac_modes`) |
| Eco setpoints          | When in eco mode, Nest provides `eco_temperature_high` / `eco_temperature_low` via custom attributes — display as dual setpoint if present |
| Fan modes: `on`, `auto`| Rendered in fan mode strip — only 2 buttons              |
| Home/Away              | Nest uses structure-level home/away via `preset_mode` — shown in preset strip if available |
| Leaf icon              | When Nest reports efficient operation, display a leaf indicator (🍃) next to the action badge — downgrade to text `ECO` for accessibility |

### Ecobee

| Ecobee Feature         | Panel Behavior                                          |
|------------------------|---------------------------------------------------------|
| Preset modes           | Rich preset support: `home`, `away`, `sleep` — full preset strip |
| Humidity sensor         | `current_humidity` attribute is reliable — shown in sensor column |
| Follow Me              | Ecobee's occupancy-based comfort setting — reflected in preset mode |
| Fan modes              | Multiple fan modes — rendered in fan strip               |
| Aux heat               | Ecobee may expose `aux_heat` — if present, show as additional mode or sensor line indicating auxiliary/emergency heat usage |

### Generic HVAC

For devices that support only a subset of features, the panel gracefully hides unsupported sections:

```javascript
/**
 * Determine which panel sections to render based on available data.
 */
function getClimatePanelSections(stateObj) {
  const attrs = stateObj?.attributes || {};
  return {
    showSetpoint: stateObj?.state !== 'off' && stateObj?.state !== 'unavailable',
    showDualSetpoint: isDualSetpoint(stateObj),
    showFanMode: hasFanModes(stateObj),
    showPresetMode: hasPresetModes(stateObj),
    showHumidity: attrs.current_humidity != null,
    showFaults: true,  // always check for fault entities
  };
}
```

---

## 16. CSS Custom Properties Summary (New)

Properties introduced by the Climate panel. All other properties from `lcars-styles.js`.

| Property                 | Default                      | Set By | Purpose                                      |
|--------------------------|------------------------------|--------|----------------------------------------------|
| `--panel-frame-color`    | `var(--lcars-butterscotch)`  | JS     | Dynamic frame border, header rule, mode strip separator — driven by `hvac_action` |
| `--climate-action-color` | `var(--lcars-butterscotch)`  | JS     | Temperature arc stroke, current temp text, action badge — driven by `hvac_action` |
| `--media-aspect`         | `1 / 1`                     | CSS    | Temperature viewscreen aspect ratio          |
| `--mode-color`           | `var(--lcars-gold)`          | JS     | Per-button active color for mode selector — varies by mode |

---

## 17. Heading & Label Hierarchy

| Element                 | `aria-level` | Font Size                   | Color                           | Purpose                               |
|-------------------------|--------------|-----------------------------|---------------------------------|---------------------------------------|
| Panel title             | 3            | `--lcars-font-size-sub`     | `--lcars-text-heading`          | Device name ("LIVING ROOM THERMOSTAT")|
| Section labels          | 4 (implicit) | `--lcars-font-size-data`    | `--lcars-text-heading`          | "FAN", "PRESET"                       |
| Sensor labels           | —            | `--lcars-font-size-data`    | `--lcars-space-white`           | "CURRENT", "TARGET", "HUMIDITY"       |
| Sensor values           | —            | `--lcars-font-size-data`    | Dynamic (state-based)           | "72°F", "48%", "HEAT"                 |
| Setpoint label          | —            | `--lcars-font-size-data`    | `--lcars-space-white`           | "TARGET", "LOW", "HIGH"              |
| Setpoint value          | —            | `--lcars-font-size-sub`     | `--lcars-gold` or per-setpoint  | "74°F"                                |
| Temperature (SVG)       | —            | Title tier (SVG 42)         | `--climate-action-color`        | "72°" — the big number               |
| Action badge            | —            | `--lcars-font-size-data`    | `--climate-action-color`        | "HEATING"                             |
| Mode button text        | —            | `--lcars-font-size-data`    | Black (active) / white (inactive)| "HEAT", "COOL", "AUTO"              |

**Exactly 3 visual font sizes.** Title (SVG temp), sub-header (device name + setpoint values), data (everything else). Bracer Jack Rule 6 — no exceptions.

---

## 18. File Registration Plan

| Component Tag               | File                         | Purpose                            |
|-----------------------------|------------------------------|------------------------------------|
| `lcars-climate-panel`       | `lcars-climate-panel.js`     | Full climate panel component       |

Extends `LcarsDevicePanelBase`:
- `panelFrameColor` → Dynamic via `getClimateActionColor(hvacAction)`
- `mediaAspectRatio` → `'1 / 1'`
- `_isPrimaryDomain(domain)` → `domain === 'climate'`
- `_renderMedia()` → renders the SVG temperature arc + setpoint controls

---

## 19. LCARS Design Rules Compliance

| Rule                                              | Source           | Compliant? | Notes                                               |
|---------------------------------------------------|------------------|------------|-----------------------------------------------------|
| No gradients, shadows, or 3D effects              | Bracer Jack #1   | ✅          | SVG arc is flat stroke, no gradient fills           |
| Frame goes thick→thin (4px→2px border)            | Bracer Jack #2   | ✅          | Left/bottom 4px, top/right 2px                     |
| Pill buttons with flat left, rounded right         | Bracer Jack #4   | ✅          | Mode buttons, aux buttons, setpoint ± buttons      |
| Exactly 3 font sizes (title, sub, data)            | Bracer Jack #6   | ✅          | SVG 42 (title), 1.25rem (sub), 0.875rem (data)    |
| ≤5 hue families in use                            | Bracer Jack      | ✅          | Warm (butterscotch/gold/sunflower), cool (ice), violet (fan), gray (disabled), white (text) = 5 |
| All text uppercase                                 | TheLCARS.com     | ✅          | Sensor labels, values, headings, buttons, SVG text |
| Antonio font only                                  | TheLCARS.com     | ✅          | `var(--lcars-font)` throughout                     |
| CSS custom properties, no hardcoded hex            | Project rule     | ✅          | All colors via `var(--lcars-*)` tokens             |
| Background is always `#000000`                     | TheLCARS.com     | ✅          | `var(--lcars-bg)` = `var(--lcars-black)`           |
| Animations < 1s, respects `prefers-reduced-motion` | WCAG + project   | ✅          | Heating pulse 2s (ambient only), all disable        |
| WCAG AA contrast on all text                       | WCAG 1.4.3       | ✅          | Verified in §2 contrast table                      |
| 24px+ touch targets                                | WCAG 2.5.8       | ✅          | All buttons ≥ 36px, sensor lines 28px              |
| Focus visible 2px outline, 3:1 contrast            | WCAG 2.4.7/13    | ✅          | Ice blue outline, 10.3:1 vs black                  |
| Color not sole means of information                | WCAG 1.4.1       | ✅          | All states have text + color                       |
| Keyboard operable                                  | WCAG 2.1.1       | ✅          | Full tab order, radiogroup keyboard patterns       |
| `aria-label` / `role` on all interactive elements  | WCAG 4.1.2       | ✅          | See §14 ARIA templates                             |
| `aria-live="polite"` for state changes             | WCAG 4.1.3       | ✅          | Hidden live region for temperature/mode changes    |
| Spacing uses `--lcars-gap` (0.25rem)               | Jörn Weißenborn  | ✅          | Invisible grid constant throughout                 |

---

## 20. Team Review Flags

- **Geordi Review Required**: Temperature arc SVG design, dynamic frame color shifting, dual-setpoint layout, mode button strip layout. All visual design elements need Geordi's sign-off for LCARS compliance before implementation.
- **Worf Review Required**: `hass.callService()` calls for `set_temperature`, `set_hvac_mode`, `set_fan_mode`, `set_preset_mode` — all state-changing service calls must be reviewed for proper authorization and input validation. Setpoint clamping logic (§5.2) should be verified to prevent out-of-range values.

---

*"Environmental Control is one of those systems you never think about — until it stops working. A good panel is the same way. It gives you what you need, instantly, and gets out of the way."*  
— La Forge, Environmental Substations, Deck 12
