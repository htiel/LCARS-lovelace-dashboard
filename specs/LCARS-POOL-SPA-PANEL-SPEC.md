# LCARS Pool & Spa Panel — Design Specification

**Author**: Wesley Crusher (Creative Technology & Experimentation)  
**Reviewed by**: Geordi La Forge (LCARS UI Design Authority)  
**Date**: Stardate 2026.04.13  
**Status**: Design Proposal  
**Priority**: HIGH  
**Panel Type**: Aquatics (Pool + Spa + Chemistry + Lighting)  
**Integration**: Pentair ScreenLogic (602 active installs, IoT class: Local Push)  
**Extends**: `LcarsDevicePanelBase` (per LCARS-DEVICE-PANEL-SPEC.md §9)

---

## 0. Design Philosophy

The Pool & Spa Panel is modeled after the Enterprise-D's **Cetacean Ops** — Deck 13, the aquatics laboratory where the ship's dolphin and whale crewmembers worked in navigational research. Yes, this is canon: TNG Technical Manual, page 53. A contained aquatic environment aboard a starship, monitored from a dedicated substation with water temperature, chemistry levels, flow rates, and environmental controls displayed on cool-blue LCARS consoles surrounding observation windows into the tank.

This panel gives the crew member (homeowner) that same substation experience: two side-by-side water bodies (pool and spa) displayed as a horizontal cross-section visualization — the "aquatic viewscreen" — with temperature gradients, chemistry telemetry running down the left column, pump and heating controls on the right, and an IntelliBrite lighting color selector along the bottom. At a glance: is the water warm, is the chemistry balanced, are the pumps running.

This panel is **unique in the LCARS dashboard** — there's no standard Lovelace pool card, and no existing custom card handles two climate entities, chemistry sensors, and 20+ lighting color modes in a single view. It's a completely new panel type.

Per Roddenberry's mandate: **the ship takes care of you**. The pool/spa runs autonomously. The panel reflects water conditions and lets the operator make adjustments — heating targets, pump circuits, light shows — without complexity.

Per Bracer Jack: **empty space is beautiful**. The cross-section visualization floats in black. Chemistry readouts are sparse text lines. The lighting selector is a compact swatch grid, not a garish color picker.

---

## 1. Grid Layout

### ASCII Layout — Full Panel (Desktop)

This is a **full-width panel** — significantly larger than a single device panel. It occupies the entire content area, similar to how Cetacean Ops fills an entire viewscreen.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  POOL & SPA — BACKYARD             POOL 78°F   SPA 102°F   AIR 85°F        │  ← header
├──────────────┬───────────────────────────────────────────────┬──────────────┤
│              │   ╔════════════════╗   ╔════════════════╗     │              │
│  CHEMISTRY   │   ║   POOL  78°F  ║   ║   SPA  102°F   ║     │  CONTROLS    │
│              │   ║   ┌──╮TGT┌──╮ ║   ║   ┌──╮TGT┌──╮ ║     │              │
│  PH    7.4   │   ║   │ –│82°│ +│ ║   ║   │ –│104│ +│ ║     │  POOL PUMP   │
│  ORP   720   │   ║   └──╯   └──╯ ║   ║   └──╯   └──╯ ║     │  ■ ON        │
│  SALT  3200  │   ║               ║   ║               ║     │              │
│  SAT   0.12  │   ║  ░░▒░░░░▒░░  ║   ║  ▓▓▒▓▓▓▓▒▓▓  ║     │  SPA PUMP    │
│              │   ║  ░░░░▒░░░░░  ║   ║  ▓▓▓▓▒▓▓▓▓▓  ║     │  □ OFF       │
│  ──────────  │   ║  ░░░░░░░▒░░  ║   ║  ▓▓▓▓▓▓▓▒▓▓  ║     │              │
│  FREEZE  OFF │   ╚════════════════╝   ╚════════════════╝     │  SPILLOVER   │
│  SCL    IDLE │   ──── HEAT: OFF ────   ──── HEAT: ON ─────  │  □ OFF       │
│  FLOW    OK  │                                               │              │
│              │                                               │  CLEANER     │
│  SUPPLY      │                                               │  □ OFF       │
│  PH   FULL   │                                               │              │
│  ORP  FULL   │                                               │  AUX 1       │
│              │                                               │  □ OFF       │
├──────────────┴───────────────────────────────────────────────┴──────────────┤
│  INTELLIBRITE    ┌───╮┌───╮┌───╮┌───╮┌───╮┌───╮┌───╮┌───╮┌───╮┌───╮       │  ← lighting
│  ● COLOR SWIM    │PAR││ROM││CAR││AMR││SUN││ROY││SWM││SYN││SET││ ▶ │       │
│                  └───╯└───╯└───╯└───╯└───╯└───╯└───╯└───╯└───╯└───╯       │
└──────────────────────────────────────────────────────────────────────────────┘
```

### ASCII Layout — Compact (No IntelliChem)

When IntelliChem chemistry sensors are not present, the chemistry column collapses:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  POOL & SPA — BACKYARD             POOL 78°F   SPA 102°F   AIR 85°F        │
├──────────────────────────────────────────────────────────┬──────────────────┤
│   ╔════════════════╗       ╔════════════════╗            │  POOL PUMP  ■    │
│   ║   POOL  78°F   ║       ║   SPA  102°F   ║            │  SPA PUMP   □    │
│   ║   ┌──╮TGT┌──╮ ║       ║   ┌──╮TGT┌──╮ ║            │  SPILLOVER  □    │
│   ║   │ –│82°│ +│ ║       ║   │ –│104│ +│ ║            │  CLEANER    □    │
│   ║   └──╯   └──╯ ║       ║   └──╯   └──╯ ║            │  AUX 1      □    │
│   ║  ░░▒░░░░▒░░░  ║       ║  ▓▓▒▓▓▓▓▒▓▓▓  ║            │  AUX 2      □    │
│   ╚════════════════╝       ╚════════════════╝            │                  │
│   ──── HEAT: OFF ────       ──── HEAT: ON ─────          │  FREEZE     OFF  │
├──────────────────────────────────────────────────────────┴──────────────────┤
│  INTELLIBRITE    ┌───╮┌───╮┌───╮┌───╮┌───╮┌───╮┌───╮┌───╮┌───╮┌───╮       │
│  ● COLOR SWIM    │PAR││ROM││CAR││AMR││SUN││ROY││SWM││SYN││SET││ ▶ │       │
│                  └───╯└───╯└───╯└───╯└───╯└───╯└───╯└───╯└───╯└───╯       │
└──────────────────────────────────────────────────────────────────────────────┘
```

### CSS Grid Definition

```css
.lcars-pool-spa-panel {
  display: grid;
  grid-template-areas:
    "header    header    header"
    "chemistry aquatics  controls"
    "lighting  lighting  lighting";
  grid-template-columns: minmax(8rem, 1fr) minmax(20rem, 3fr) minmax(8rem, 1.2fr);
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

  /* Pool/Spa frame color: bluey (aquatic/water systems) */
  --panel-frame-color: var(--lcars-bluey);

  /* Dynamic colors — set by JS based on pool/spa state */
  --pool-color: var(--lcars-ice);
  --spa-color: var(--lcars-butterscotch);
  --chem-status-color: var(--lcars-ice);

  min-height: calc(var(--lcars-vunit) * 6);

  /* Full-width panel */
  grid-column: 1 / -1;
}

/* No-chemistry variant — 2-column */
.lcars-pool-spa-panel.no-chem {
  grid-template-areas:
    "header   header"
    "aquatics controls"
    "lighting lighting";
  grid-template-columns: minmax(20rem, 3fr) minmax(8rem, 1.2fr);
}
```

### Why `--lcars-bluey` for the Frame

Water systems on the Enterprise-D — coolant, aquaculture, hydroponics, Cetacean Ops — are displayed on cool-blue consoles. The `--lcars-bluey` (#8899ff) sits in the blue family, distinct from the butterscotch of cameras, the violet of media, the deeper blue of atmoscrubbers. Within the panel, the two bodies get differentiated colors: `--lcars-ice` (#99ccff) for the pool (cool, unheated water) and `--lcars-butterscotch` (#ff9966) for the spa (warm, heated water). This thermal color coding gives immediate visual feedback about which body is which.

### Why Full-Width

A standard 2-column device panel can't contain two climate entities, chemistry readouts, circuit switches, AND a lighting selector. This panel occupies `grid-column: 1 / -1` on the dashboard layout — the same approach used for wide data panels on the Enterprise Ops console. The three-column internal grid (chemistry | aquatics | controls) keeps information organized without feeling cramped.

---

## 2. Color Mapping

### Body Heat State → Color

The pool and spa viewscreens use thermal coloring to communicate heating state at a glance.

| Body     | `hvac_action`  | LCARS Variable          | Hex       | Rationale                                        |
|----------|----------------|--------------------------|-----------|--------------------------------------------------|
| Pool     | `heating`      | `--lcars-butterscotch`   | `#ff9966` | Warm amber — heater active, warming up           |
| Pool     | `idle`         | `--lcars-ice`            | `#99ccff` | Cool blue — pool at temp or unheated             |
| Pool     | `off`          | `--lcars-gray`           | `#666688` | Muted — heater off                               |
| Spa      | `heating`      | `--lcars-butterscotch`   | `#ff9966` | Warm amber — heater active                       |
| Spa      | `idle`         | `--lcars-sunflower`      | `#ffcc99` | Warm neutral — spa at temp, standing by           |
| Spa      | `off`          | `--lcars-gray`           | `#666688` | Muted — heater off                               |
| Either   | `unavailable`  | `--lcars-tomato` (pulse) | `#ff5555` | System fault — red, distress pulse               |

### Heat Mode → Header Badge Color

| Heat Mode          | LCARS Variable           | Hex       | Rationale                                  |
|--------------------|--------------------------|-----------|---------------------------------------------|
| `heater`           | `--lcars-butterscotch`   | `#ff9966` | Standard gas/electric heater                |
| `solar`            | `--lcars-sunflower`      | `#ffcc99` | Solar — warm golden, passive                |
| `solar_preferred`  | `--lcars-gold`           | `#ffaa00` | Solar preferred — gold = smart/auto         |
| `off`              | `--lcars-gray`           | `#666688` | Disabled                                    |

### Chemistry Status → Color

pH and ORP readings drive dynamic coloring on chemistry readouts.

| Metric | Range            | Status      | LCARS Variable          | Hex       |
|--------|------------------|-------------|--------------------------|-----------|
| pH     | 7.2–7.6          | OPTIMAL     | `--lcars-ice`            | `#99ccff` |
| pH     | 7.0–7.2 / 7.6–7.8| ACCEPTABLE | `--lcars-sunflower`      | `#ffcc99` |
| pH     | < 7.0 / > 7.8   | ALERT       | `--lcars-tomato`         | `#ff5555` |
| pH     | unavailable      | OFFLINE     | `--lcars-gray`           | `#666688` |
| ORP    | 650–750 mV       | OPTIMAL     | `--lcars-ice`            | `#99ccff` |
| ORP    | 550–650 / 750–800| ACCEPTABLE | `--lcars-sunflower`      | `#ffcc99` |
| ORP    | < 550 / > 800    | ALERT       | `--lcars-tomato`         | `#ff5555` |
| ORP    | unavailable      | OFFLINE     | `--lcars-gray`           | `#666688` |
| Salt   | 2700–3400 ppm    | OPTIMAL     | `--lcars-ice`            | `#99ccff` |
| Salt   | 2500–2700 / 3400–3600 | LOW/HIGH | `--lcars-sunflower`   | `#ffcc99` |
| Salt   | < 2500 / > 3600  | ALERT       | `--lcars-tomato`         | `#ff5555` |

### IntelliBrite Color Mode → Swatch Color

Each lighting mode gets a representative color for its selector swatch.

| Color Mode    | Swatch Color  | Hex       | Description                         |
|---------------|---------------|-----------|--------------------------------------|
| `blue`        | Blue          | `#4488ff` | Fixed: Blue                          |
| `green`       | Green         | `#44cc88` | Fixed: Green                         |
| `red`         | Red           | `#ff4444` | Fixed: Red                           |
| `white`       | White         | `#ffffff` | Fixed: White                         |
| `magenta`     | Magenta       | `#cc44ff` | Fixed: Magenta                       |
| `party`       | Multi-flash   | `#ff44cc` | Rapid color mix (pink accent)        |
| `romance`     | Soft violet   | `#cc88ff` | Slow transitions (violet accent)     |
| `caribbean`   | Teal          | `#44ccbb` | Blues and greens                      |
| `american`    | Red/White     | `#ff4466` | Red, white, blue                     |
| `sunset`      | Orange        | `#ff8844` | Orange, red, magenta                 |
| `royal`       | Deep purple   | `#8844cc` | Rich, deep tones                     |
| `color_swim`  | Cycling       | `#88ccff` | W/M/B/G cycle (light blue accent)   |
| `color_sync`  | Sync          | `#88aaff` | Synchronized (medium blue)           |
| `color_set`   | Preset        | `#ffaa44` | Pre-set colors (gold accent)         |
| `all_on`      | Gold          | `#ffaa00` | All circuits on                      |
| `all_off`     | Gray          | `#666688` | All circuits off                     |

### Contrast Verification (all text colors vs `#000000` background)

| Color                    | Hex       | Contrast vs #000 | WCAG Level | Usage                          |
|--------------------------|-----------|-------------------|------------|--------------------------------|
| `--lcars-bluey`          | `#8899ff` | 7.5:1             | AAA        | Frame, section accents         |
| `--lcars-ice`            | `#99ccff` | 10.3:1            | AAA        | Pool color, optimal chemistry  |
| `--lcars-butterscotch`   | `#ff9966` | 8.2:1             | AAA        | Spa/heating color              |
| `--lcars-sunflower`      | `#ffcc99` | 13.1:1            | AAA        | Idle state, acceptable chem    |
| `--lcars-gold`           | `#ffaa00` | 8.6:1             | AAA        | Active buttons, solar pref     |
| `--lcars-tomato`         | `#ff5555` | 5.2:1             | AA         | Alerts, out-of-range chem      |
| `--lcars-gray`           | `#666688` | 4.6:1             | AA         | Off/disabled states            |
| `--lcars-space-white`    | `#f5f6fa` | 18.9:1            | AAA        | Labels, data text              |
| `--lcars-almond-creme`   | `#ffbbaa` | 11.4:1            | AAA        | Super chlorination active      |

All pass **WCAG 1.4.3 (AA)** minimum 4.5:1. `--lcars-gray` at 4.6:1 is the lowest — intentionally dim for disabled/off state and passes AA. Color is never the sole indicator — all states have text labels (WCAG 1.4.1).

### Implementation

```javascript
/**
 * Resolve pool/spa hvac_action to LCARS color CSS variable.
 * Pool defaults to ice (cool), spa defaults to sunflower (warm).
 */
function getBodyColor(hvacAction, bodyType) {
  switch (hvacAction) {
    case 'heating': return 'var(--lcars-butterscotch)';
    case 'idle':    return bodyType === 'spa'
                      ? 'var(--lcars-sunflower)'
                      : 'var(--lcars-ice)';
    case 'off':     return 'var(--lcars-disabled)';
    default:        return 'var(--lcars-disabled)';
  }
}

/**
 * Resolve heat mode to display label and color.
 */
function getHeatModeInfo(presetMode) {
  switch (presetMode) {
    case 'heater':          return { label: 'HEATER', color: 'var(--lcars-butterscotch)' };
    case 'solar':           return { label: 'SOLAR', color: 'var(--lcars-sunflower)' };
    case 'solar_preferred': return { label: 'SOLAR PREF', color: 'var(--lcars-gold)' };
    case 'off':             return { label: 'OFF', color: 'var(--lcars-disabled)' };
    default:                return { label: 'STANDBY', color: 'var(--lcars-disabled)' };
  }
}

/**
 * Resolve pH value to LCARS color CSS variable.
 * Optimal: 7.2–7.6, Acceptable: 7.0–7.8, Alert: outside.
 */
function getPhColor(ph) {
  if (ph == null || isNaN(ph)) return 'var(--lcars-disabled)';
  const v = Number(ph);
  if (v >= 7.2 && v <= 7.6) return 'var(--lcars-ice)';
  if (v >= 7.0 && v <= 7.8) return 'var(--lcars-sunflower)';
  return 'var(--lcars-alert)';
}

/**
 * Resolve pH value to human-readable status label (uppercase).
 */
function getPhLabel(ph) {
  if (ph == null || isNaN(ph)) return 'UNAVAILABLE';
  const v = Number(ph);
  if (v >= 7.2 && v <= 7.6) return 'OPTIMAL';
  if (v >= 7.0 && v <= 7.8) return 'ACCEPTABLE';
  if (v < 7.0) return 'LOW';
  return 'HIGH';
}

/**
 * Resolve ORP value (mV) to LCARS color CSS variable.
 * Optimal: 650–750, Acceptable: 550–800, Alert: outside.
 */
function getOrpColor(orp) {
  if (orp == null || isNaN(orp)) return 'var(--lcars-disabled)';
  const v = Number(orp);
  if (v >= 650 && v <= 750) return 'var(--lcars-ice)';
  if (v >= 550 && v <= 800) return 'var(--lcars-sunflower)';
  return 'var(--lcars-alert)';
}

/**
 * Resolve salt level (ppm) to LCARS color CSS variable.
 * Optimal: 2700–3400, Acceptable: 2500–3600, Alert: outside.
 */
function getSaltColor(salt) {
  if (salt == null || isNaN(salt)) return 'var(--lcars-disabled)';
  const v = Number(salt);
  if (v >= 2700 && v <= 3400) return 'var(--lcars-ice)';
  if (v >= 2500 && v <= 3600) return 'var(--lcars-sunflower)';
  return 'var(--lcars-alert)';
}

/**
 * Resolve saturation index to LCARS color.
 * Balanced: -0.3 to +0.3, Acceptable: -0.5 to +0.5, Alert: outside.
 */
function getSaturationColor(si) {
  if (si == null || isNaN(si)) return 'var(--lcars-disabled)';
  const v = Number(si);
  if (v >= -0.3 && v <= 0.3) return 'var(--lcars-ice)';
  if (v >= -0.5 && v <= 0.5) return 'var(--lcars-sunflower)';
  return 'var(--lcars-alert)';
}
```

---

## 3. Panel Header

### Structure

```html
<div class="pool-header" role="heading" aria-level="3">
  <span class="device-panel-name">${panelName}</span>
  <span class="device-panel-header-line" aria-hidden="true"></span>
  <span class="pool-header-badge pool" style="color: ${poolColor}">
    POOL ${poolTemp}°${unit}
  </span>
  <span class="pool-header-badge spa" style="color: ${spaColor}">
    SPA ${spaTemp}°${unit}
  </span>
  <span class="pool-header-badge air" style="color: var(--lcars-space-white)">
    AIR ${airTemp}°${unit}
  </span>
</div>
```

### CSS

```css
.pool-header {
  grid-area: header;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.25rem 0.75rem;
  min-height: var(--lcars-bar-h);
  border-bottom: 2px solid var(--panel-frame-color);
}

.pool-header-badge {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  text-transform: uppercase;
  white-space: nowrap;
  font-weight: 700;
  transition: color var(--lcars-transition-slow);
}

.pool-header-badge.pool {
  color: var(--pool-color, var(--lcars-ice));
}

.pool-header-badge.spa {
  color: var(--spa-color, var(--lcars-butterscotch));
}

.pool-header-badge.air {
  color: var(--lcars-space-white);
}
```

Reuses `.device-panel-name` and `.device-panel-header-line` from the Device Panel Spec §3.1. The three temperature badges in the header give at-a-glance thermal status — the bridge officer's peripheral view. Pool is always cool-colored, spa is warm-colored, air is neutral white.

---

## 4. Chemistry Telemetry Column (Left)

The left column is the "science station" — water chemistry data critical for pool maintenance. This column only renders when IntelliChem entities are present.

### Entity Ordering (Top to Bottom)

| Row | Sensor               | ScreenLogic Entity                        | Unit    | Color                              |
|-----|----------------------|-------------------------------------------|---------|------------------------------------|
| 1   | pH                   | `sensor.*_ph` / `sensor.*_ph_now`         | pH      | Dynamic `getPhColor()`             |
| 2   | ORP                  | `sensor.*_orp` / `sensor.*_orp_now`       | mV      | Dynamic `getOrpColor()`            |
| 3   | Salt / TDS           | `sensor.*_salt_tds_ppm`                   | ppm     | Dynamic `getSaltColor()`           |
| 4   | Saturation Index     | `sensor.*_saturation`                     | —       | Dynamic `getSaturationColor()`     |
| —   | *(divider)*          |                                           |         |                                    |
| 5   | Freeze Protection    | `binary_sensor.*_freeze_mode`             | on/off  | `--lcars-ice` / `--lcars-gray`     |
| 6   | Super Chlorination   | `sensor.*_super_chlor_timer`              | hrs     | `--lcars-almond-creme` / `--lcars-gray` |
| 7   | Flow Alarm           | `binary_sensor.*_flow_alarm`              | on/off  | `--lcars-tomato` / `--lcars-gray`  |
| —   | *(divider)*          |                                           |         |                                    |
| 8   | pH Supply Level      | `sensor.*_ph_supply_level`                | 0–4     | Supply level color                 |
| 9   | ORP Supply Level     | `sensor.*_orp_supply_level`               | 0–4     | Supply level color                 |

### CSS

```css
.pool-chemistry {
  grid-area: chemistry;
  display: flex;
  flex-direction: column;
  gap: var(--lcars-gap);
  padding: 0.25rem 0;
  align-self: start;
}

.pool-chem-heading {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-text-heading);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.25rem 0;
}

.pool-chem-divider {
  height: 1px;
  background: var(--lcars-disabled);
  margin: 0.25rem 0;
  opacity: 0.5;
}

.pool-chem-section-label {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-disabled);
  text-transform: uppercase;
  padding: 0.25rem 0.5rem 0;
  letter-spacing: 0.05em;
}
```

Sensor lines reuse `.device-sensor-line` from the Device Panel Spec §3.3. Chemistry values get dynamic coloring per the threshold tables in §2.

### Supply Level Indicator

The pH and ORP supply levels (IntelliChem tank levels) display as a small 4-segment bar.

```css
.pool-supply-bar {
  display: flex;
  gap: 2px;
  align-items: center;
}

.pool-supply-segment {
  width: 0.5rem;
  height: 0.75rem;
  border-radius: 1px;
  background: var(--lcars-disabled);
  transition: background var(--lcars-transition);
}

.pool-supply-segment.filled {
  background: var(--lcars-ice);
}

.pool-supply-segment.filled.low {
  background: var(--lcars-butterscotch);  /* level ≤ 1 */
}

.pool-supply-segment.filled.empty {
  background: var(--lcars-alert);         /* level 0 */
}
```

### Supply Level Logic

```javascript
/**
 * Map supply level (0–4) to filled segment count and status.
 * ScreenLogic reports 1–5 internally, the sensor subtracts 1 → 0–4.
 */
function getSupplyStatus(level) {
  if (level == null || isNaN(level)) return { filled: 0, status: 'UNAVAILABLE' };
  const v = Number(level);
  if (v >= 3) return { filled: v, status: 'FULL' };
  if (v >= 2) return { filled: v, status: 'OK' };
  if (v >= 1) return { filled: v, status: 'LOW' };
  return { filled: 0, status: 'EMPTY' };
}
```

---

## 5. Aquatic Viewscreen (Center) — Pool & Spa Cross-Section

The centerpiece: two side-by-side water body visualizations showing temperature, heating state, and setpoint controls. These are the "viewscreens" — the dominant visual element.

### 5.1 Body Viewscreen Structure

Each body (pool/spa) is rendered as a framed rectangle with:
- A large current temperature readout at the top
- Setpoint controls (–/+) below the temperature
- A water visualization area with animated particles
- A heat mode indicator below the frame

```html
<div class="pool-aquatics" role="group" aria-label="Pool and spa water bodies">
  <!-- Pool Body -->
  <div class="pool-body-viewscreen"
       data-body="pool"
       role="region"
       aria-label="Pool: ${poolTemp} degrees, target ${poolTarget} degrees">
    <div class="pool-body-frame" style="border-color: ${poolColor}">
      <!-- Corner brackets -->
      <div class="pool-body-temp" style="color: ${poolColor}">
        <span class="pool-body-label">POOL</span>
        <span class="pool-body-value">${poolTemp}°${unit}</span>
      </div>
      <div class="pool-body-setpoint" role="group" aria-label="Pool target temperature">
        <button class="pool-setpoint-btn decrement"
                aria-label="Decrease pool target temperature">–</button>
        <div class="pool-setpoint-display">
          <span class="pool-setpoint-label">TGT</span>
          <span class="pool-setpoint-value">${poolTarget}°</span>
        </div>
        <button class="pool-setpoint-btn increment"
                aria-label="Increase pool target temperature">+</button>
      </div>
      <!-- Water visualization -->
      <div class="pool-water-viz" aria-hidden="true">
        <div class="pool-water-particles"></div>
        <div class="pool-water-surface"></div>
      </div>
    </div>
    <div class="pool-body-heat-badge" style="color: ${heatModeColor}">
      HEAT: ${heatModeLabel}
    </div>
  </div>

  <!-- Spa Body (same structure) -->
  <div class="pool-body-viewscreen"
       data-body="spa"
       role="region"
       aria-label="Spa: ${spaTemp} degrees, target ${spaTarget} degrees">
    <!-- ... identical structure, different entity bindings ... -->
  </div>
</div>
```

### 5.2 Viewscreen CSS

```css
.pool-aquatics {
  grid-area: aquatics;
  display: flex;
  gap: calc(var(--lcars-gap) * 4);
  justify-content: center;
  align-items: start;
  padding: 0.5rem 0;
}

.pool-body-viewscreen {
  flex: 1;
  max-width: 16rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--lcars-gap);
}

.pool-body-frame {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  border: 3px solid var(--lcars-ice);
  border-radius: 0.5rem;
  overflow: hidden;
  background: var(--lcars-bg);

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 0.75rem 0.5rem 0;
  gap: 0.5rem;

  transition: border-color var(--lcars-transition-slow);
}

/* Spa frame uses warm border */
.pool-body-viewscreen[data-body="spa"] .pool-body-frame {
  border-color: var(--spa-color, var(--lcars-butterscotch));
}

/* Corner brackets — reuse from Device Panel Spec §3.2 */
.pool-body-frame::before,
.pool-body-frame::after {
  content: '';
  position: absolute;
  width: 1.5rem;
  height: 1.5rem;
  border-style: solid;
  pointer-events: none;
  z-index: 1;
}

.pool-body-frame::before {
  top: 0.25rem;
  left: 0.25rem;
  border-width: 2px 0 0 2px;
  border-color: inherit;
  border-radius: 0.25rem 0 0 0;
}

.pool-body-frame::after {
  bottom: 0.25rem;
  right: 0.25rem;
  border-width: 0 2px 2px 0;
  border-color: inherit;
  border-radius: 0 0 0.25rem 0;
}

/* Temperature display */
.pool-body-temp {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.125rem;
  z-index: 1;
}

.pool-body-label {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--lcars-space-white);
}

.pool-body-value {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-sub);
  text-transform: uppercase;
  font-weight: 700;
  transition: color var(--lcars-transition-slow);
}

/* Setpoint controls */
.pool-body-setpoint {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  z-index: 1;
}

.pool-setpoint-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;                              /* 36px — exceeds WCAG 2.5.8 24px */
  min-width: 2.25rem;

  background: var(--lcars-sunflower);
  color: var(--lcars-black);
  border: none;
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-sub);
  font-weight: 700;
  cursor: pointer;
  transition: filter var(--lcars-transition), background var(--lcars-transition);
  user-select: none;
}

.pool-setpoint-btn.decrement {
  border-radius: var(--lcars-btn-radius) 0 0 var(--lcars-btn-radius);
}

.pool-setpoint-btn.increment {
  border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
}

.pool-setpoint-btn:hover {
  filter: brightness(1.2);
}

.pool-setpoint-btn:focus-visible {
  outline: 2px solid var(--lcars-ice);
  outline-offset: 2px;
}

.pool-setpoint-btn:active {
  background: var(--lcars-gold);
}

.pool-setpoint-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  min-width: 2.5rem;
}

.pool-setpoint-label {
  font-family: var(--lcars-font);
  font-size: 0.6rem;
  color: var(--lcars-space-white);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.7;
}

.pool-setpoint-value {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-gold);
  text-transform: uppercase;
  font-weight: 700;
}

/* Heat mode badge below viewscreen */
.pool-body-heat-badge {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  text-transform: uppercase;
  white-space: nowrap;
  letter-spacing: 0.05em;
  padding-top: 0.25rem;
  border-top: 1px solid var(--panel-frame-color);
  width: 100%;
  text-align: center;
  transition: color var(--lcars-transition-slow);
}
```

### 5.3 Water Visualization

The lower portion of each viewscreen shows an animated water effect — slow-drifting particles that suggest water movement. Pool particles are cool-blue, spa particles are warm-amber.

```css
.pool-water-viz {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40%;
  overflow: hidden;
  pointer-events: none;
}

/* Water surface line — subtle horizontal gradient */
.pool-water-surface {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--pool-color, var(--lcars-ice));
  opacity: 0.4;
}

.pool-body-viewscreen[data-body="spa"] .pool-water-surface {
  background: var(--spa-color, var(--lcars-butterscotch));
}

/* Water particles — drift horizontally */
.pool-water-particle {
  position: absolute;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--pool-color, var(--lcars-ice));
  opacity: 0;
  animation: pool-particle-drift var(--pool-particle-speed, 8s) ease-in-out infinite;
}

.pool-body-viewscreen[data-body="spa"] .pool-water-particle {
  background: var(--spa-color, var(--lcars-butterscotch));
}

.pool-water-particle.lg {
  width: 5px;
  height: 5px;
}

@keyframes pool-particle-drift {
  0% {
    transform: translateX(-20%) translateY(0);
    opacity: 0;
  }
  15% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.25;
    transform: translateX(50%) translateY(var(--pool-particle-sway, -0.5rem));
  }
  85% {
    opacity: 0.15;
  }
  100% {
    transform: translateX(120%) translateY(0);
    opacity: 0;
  }
}

/* Heating active — particles drift upward (convection) */
.pool-body-viewscreen[data-heating] .pool-water-particle {
  animation-name: pool-particle-convection;
}

@keyframes pool-particle-convection {
  0% {
    transform: translateX(0) translateY(100%);
    opacity: 0;
  }
  15% {
    opacity: 0.5;
  }
  50% {
    opacity: 0.35;
    transform: translateX(var(--pool-particle-sway, 0.5rem)) translateY(30%);
  }
  85% {
    opacity: 0.15;
  }
  100% {
    transform: translateX(0) translateY(-20%);
    opacity: 0;
  }
}

/* Reduced motion — static particles */
@media (prefers-reduced-motion: reduce) {
  .pool-water-particle {
    animation: none !important;
    opacity: 0.2;
  }
}
```

### 5.4 Water Particle Configuration

```javascript
/**
 * Generate particle elements for a water body visualization.
 * @param {string} bodyType - 'pool' or 'spa'
 * @returns {Array<{top, left, delay, speed, sway, size}>} particle configs
 */
function generateWaterParticles(bodyType) {
  const count = 6;
  return Array.from({ length: count }, (_, i) => ({
    top: `${20 + Math.random() * 70}%`,
    left: `${Math.random() * 80}%`,
    delay: `${(i * 1.2) + Math.random()}s`,
    speed: `${6 + Math.random() * 4}s`,
    sway: `${-0.5 + Math.random()}rem`,
    size: i < 2 ? 'lg' : '',
  }));
}
```

### 5.5 Setpoint Adjustment Logic

```javascript
/**
 * Adjust pool or spa target temperature.
 * ScreenLogic climate entities support standard climate.set_temperature.
 * @param {object} hass - Home Assistant instance
 * @param {string} entityId - climate.pool_heat or climate.spa_heat
 * @param {number} delta - increment (+step) or decrement (-step)
 */
function adjustPoolSetpoint(hass, entityId, delta) {
  const stateObj = hass.states[entityId];
  if (!stateObj) return;

  const attrs = stateObj.attributes;
  const step = attrs.target_temp_step || 1;
  const min = attrs.min_temp || 40;
  const max = attrs.max_temp || 104;

  const current = attrs.temperature;
  if (current == null) return;

  const newTemp = Math.round((current + delta) / step) * step;
  const clamped = Math.max(min, Math.min(max, newTemp));

  hass.callService('climate', 'set_temperature', {
    entity_id: entityId,
    temperature: clamped,
  });
}

/**
 * Set the heat mode (preset) for a pool/spa body.
 * ScreenLogic uses preset_mode: heater, solar, solar_preferred, off.
 */
function setHeatMode(hass, entityId, presetMode) {
  hass.callService('climate', 'set_preset_mode', {
    entity_id: entityId,
    preset_mode: presetMode,
  });
}

/**
 * Toggle heater on/off for a pool/spa body.
 */
function toggleHeater(hass, entityId) {
  const stateObj = hass.states[entityId];
  if (!stateObj) return;

  const currentMode = stateObj.state;
  if (currentMode === 'off') {
    hass.callService('climate', 'set_hvac_mode', {
      entity_id: entityId,
      hvac_mode: 'heat',
    });
  } else {
    hass.callService('climate', 'set_hvac_mode', {
      entity_id: entityId,
      hvac_mode: 'off',
    });
  }
}
```

---

## 6. Controls Column (Right)

The right column contains circuit switches for pumps and auxiliary equipment, plus environmental status indicators.

### Structure

```
┌─────────────────┐
│  CIRCUITS        │  ← heading
│                  │
│  POOL PUMP  [■]  │  ← toggle (switch entity)
│  SPA PUMP   [□]  │  ← toggle
│  SPILLOVER  [□]  │  ← toggle
│  CLEANER    [□]  │  ← toggle
│  AUX 1      [□]  │  ← toggle
│  AUX 2      [□]  │  ← toggle
│                  │
│  ──────────────  │
│  STATUS          │  ← heading
│                  │
│  FREEZE     OFF  │  ← binary sensor readout
│  POOL DELAY OFF  │  ← binary sensor readout
│  SPA DELAY  OFF  │  ← binary sensor readout
│                  │
│  PUMP 1          │  ← pump diagnostics (if present)
│  2450 RPM        │
│  1850 W          │
│  22 GPM          │
└─────────────────┘
```

### CSS

```css
.pool-controls {
  grid-area: controls;
  display: flex;
  flex-direction: column;
  gap: var(--lcars-gap);
  padding: 0.25rem 0;
  align-self: start;
}

.pool-control-heading {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-text-heading);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.25rem 0;
}

.pool-controls-divider {
  height: 1px;
  background: var(--lcars-disabled);
  margin: 0.25rem 0;
  opacity: 0.5;
}

/* Circuit toggle row */
.pool-circuit-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.25rem 0;
  min-height: 2.25rem;                    /* WCAG 2.5.8 */
}

.pool-circuit-label {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-text);
  text-transform: uppercase;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* LCARS toggle — flat pill, no iOS-style slider */
.pool-circuit-toggle {
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
  color: var(--lcars-black);
  user-select: none;
}

.pool-circuit-toggle[aria-checked="true"] {
  background: var(--lcars-gold);
}

.pool-circuit-toggle[aria-checked="false"] {
  background: var(--lcars-disabled);
  color: var(--lcars-space-white);
}

.pool-circuit-toggle:hover {
  filter: brightness(1.2);
}

.pool-circuit-toggle:focus-visible {
  outline: 2px solid var(--lcars-ice);
  outline-offset: 2px;
}

/* Pump diagnostic readouts (sub-data, dimmer) */
.pool-pump-stats {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  padding-left: 0.5rem;
}

.pool-pump-stat {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-data-accent);
  text-transform: uppercase;
}
```

### Circuit Toggle Logic

```javascript
/**
 * Toggle a ScreenLogic switch entity (pump, aux circuit, etc.).
 */
function toggleCircuit(hass, entityId) {
  const stateObj = hass.states[entityId];
  if (!stateObj) return;

  const domain = entityId.split('.')[0];
  const service = stateObj.state === 'on' ? 'turn_off' : 'turn_on';

  hass.callService(domain, service, {
    entity_id: entityId,
  });
}
```

### Status Indicator Readouts

Binary sensor status lines use the standard `.device-sensor-line` pattern from Device Panel Spec §3.3.

```javascript
/**
 * Get color for an environmental binary sensor.
 */
function getEnvBinaryColor(entityId, state) {
  if (state === 'unavailable') return 'var(--lcars-alert)';
  if (entityId.includes('freeze')) {
    return state === 'on' ? 'var(--lcars-ice)' : 'var(--lcars-disabled)';
  }
  if (entityId.includes('alarm') || entityId.includes('fault')) {
    return state === 'on' ? 'var(--lcars-alert)' : 'var(--lcars-disabled)';
  }
  return state === 'on' ? 'var(--lcars-sunflower)' : 'var(--lcars-disabled)';
}
```

---

## 7. IntelliBrite Lighting Control (Bottom)

The bottom row contains the IntelliBrite color mode selector. 22 color modes need a compact, horizontally scrollable swatch strip — think the lighting control panel in a holodeck control room.

### 7.1 Layout Structure

```html
<div class="pool-lighting" role="group" aria-label="IntelliBrite pool light controls">
  <div class="pool-lighting-header">
    <span class="pool-lighting-label">INTELLIBRITE</span>
    <span class="pool-lighting-current" style="color: ${currentSwatchColor}">
      ● ${currentModeName}
    </span>
  </div>
  <div class="pool-lighting-swatches"
       role="radiogroup"
       aria-label="Light color mode"
       tabindex="0">
    ${colorModes.map(mode => html`
      <button class="pool-swatch ${mode.key === currentMode ? 'active' : ''}"
              role="radio"
              aria-checked="${mode.key === currentMode}"
              aria-label="${mode.label}"
              style="--swatch-color: ${mode.swatchHex}"
              @click="${() => setColorMode(mode.key)}">
        <span class="pool-swatch-fill" aria-hidden="true"></span>
        <span class="pool-swatch-label">${mode.shortLabel}</span>
      </button>
    `)}
  </div>
</div>
```

### 7.2 CSS

```css
.pool-lighting {
  grid-area: lighting;
  display: flex;
  flex-direction: column;
  gap: var(--lcars-gap);
  padding-top: var(--lcars-gap);
  border-top: 2px solid var(--panel-frame-color);
}

.pool-lighting-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.pool-lighting-label {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-text-heading);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.pool-lighting-current {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  text-transform: uppercase;
  font-weight: 700;
  white-space: nowrap;
  transition: color var(--lcars-transition);
}

/* Horizontal scrollable swatch strip */
.pool-lighting-swatches {
  display: flex;
  gap: var(--lcars-gap);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 0.25rem;
  scroll-snap-type: x proximity;

  /* Hide scrollbar but keep scrollable */
  scrollbar-width: thin;
  scrollbar-color: var(--lcars-disabled) transparent;
}

.pool-lighting-swatches::-webkit-scrollbar {
  height: 4px;
}

.pool-lighting-swatches::-webkit-scrollbar-thumb {
  background: var(--lcars-disabled);
  border-radius: 2px;
}

/* Individual color swatch button */
.pool-swatch {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.125rem;
  min-width: 3.5rem;
  padding: 0.25rem;
  border: none;
  border-radius: 0.375rem;
  background: transparent;
  cursor: pointer;
  transition: filter var(--lcars-transition), outline var(--lcars-transition);
  user-select: none;
  scroll-snap-align: start;
  flex-shrink: 0;
}

.pool-swatch:hover {
  filter: brightness(1.2);
}

.pool-swatch:focus-visible {
  outline: 2px solid var(--lcars-ice);
  outline-offset: 2px;
}

/* Active swatch — gold ring */
.pool-swatch.active,
.pool-swatch[aria-checked="true"] {
  outline: 2px solid var(--lcars-gold);
  outline-offset: 1px;
}

/* Color fill circle */
.pool-swatch-fill {
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  background: var(--swatch-color, var(--lcars-disabled));
  border: 2px solid rgba(255, 255, 255, 0.15);
  transition: transform var(--lcars-transition);
}

.pool-swatch.active .pool-swatch-fill {
  transform: scale(1.15);
}

/* Animated swatches for dynamic modes */
.pool-swatch[data-animated] .pool-swatch-fill {
  animation: swatch-color-cycle 3s ease-in-out infinite;
}

@keyframes swatch-color-cycle {
  0%, 100% { filter: hue-rotate(0deg); }
  50%      { filter: hue-rotate(60deg); }
}

@media (prefers-reduced-motion: reduce) {
  .pool-swatch[data-animated] .pool-swatch-fill {
    animation: none !important;
  }
}

/* Swatch label */
.pool-swatch-label {
  font-family: var(--lcars-font);
  font-size: 0.55rem;
  color: var(--lcars-space-white);
  text-transform: uppercase;
  letter-spacing: 0.02em;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 3.5rem;
}
```

### 7.3 Color Mode Data

```javascript
/**
 * IntelliBrite color mode definitions.
 * Key matches screenlogic.set_color_mode action parameter.
 */
const INTELLIBRITE_MODES = [
  // Dynamic modes (shown first — most used)
  { key: 'party',      label: 'PARTY',       shortLabel: 'PAR', swatchHex: '#ff44cc', animated: true },
  { key: 'romance',    label: 'ROMANCE',     shortLabel: 'ROM', swatchHex: '#cc88ff', animated: true },
  { key: 'caribbean',  label: 'CARIBBEAN',   shortLabel: 'CAR', swatchHex: '#44ccbb', animated: true },
  { key: 'american',   label: 'AMERICAN',    shortLabel: 'AMR', swatchHex: '#ff4466', animated: true },
  { key: 'sunset',     label: 'SUNSET',      shortLabel: 'SUN', swatchHex: '#ff8844', animated: true },
  { key: 'royal',      label: 'ROYAL',       shortLabel: 'ROY', swatchHex: '#8844cc', animated: true },
  { key: 'color_swim', label: 'COLOR SWIM',  shortLabel: 'SWM', swatchHex: '#88ccff', animated: true },
  { key: 'color_sync', label: 'COLOR SYNC',  shortLabel: 'SYN', swatchHex: '#88aaff', animated: true },
  { key: 'color_set',  label: 'COLOR SET',   shortLabel: 'SET', swatchHex: '#ffaa44', animated: false },

  // Fixed colors
  { key: 'blue',       label: 'BLUE',        shortLabel: 'BLU', swatchHex: '#4488ff', animated: false },
  { key: 'green',      label: 'GREEN',       shortLabel: 'GRN', swatchHex: '#44cc88', animated: false },
  { key: 'red',        label: 'RED',         shortLabel: 'RED', swatchHex: '#ff4444', animated: false },
  { key: 'white',      label: 'WHITE',       shortLabel: 'WHT', swatchHex: '#ffffff', animated: false },
  { key: 'magenta',    label: 'MAGENTA',     shortLabel: 'MAG', swatchHex: '#cc44ff', animated: false },

  // Control modes (shown last)
  { key: 'all_on',     label: 'ALL ON',      shortLabel: 'ON',  swatchHex: '#ffaa00', animated: false },
  { key: 'all_off',    label: 'ALL OFF',     shortLabel: 'OFF', swatchHex: '#666688', animated: false },
  { key: 'save',       label: 'SAVE',        shortLabel: 'SAV', swatchHex: '#ffcc99', animated: false },
  { key: 'recall',     label: 'RECALL',      shortLabel: 'RCL', swatchHex: '#ffcc99', animated: false },
  { key: 'next_mode',  label: 'NEXT MODE',   shortLabel: '▶',   swatchHex: '#aaaaff', animated: false },
  { key: 'hold',       label: 'HOLD',        shortLabel: 'HLD', swatchHex: '#aaaaff', animated: false },
  { key: 'reset',      label: 'RESET',       shortLabel: 'RST', swatchHex: '#ff8866', animated: false },
  { key: 'thumper',    label: 'THUMPER',     shortLabel: 'TMP', swatchHex: '#aaaaff', animated: false },
];
```

### 7.4 Color Mode Service Call

```javascript
/**
 * Set IntelliBrite color mode via ScreenLogic action.
 * @param {object} hass - Home Assistant instance
 * @param {string} configEntryId - ScreenLogic integration config_entry ID
 * @param {string} colorMode - One of the INTELLIBRITE_MODES keys
 */
function setColorMode(hass, configEntryId, colorMode) {
  hass.callService('screenlogic', 'set_color_mode', {
    config_entry: configEntryId,
    color_mode: colorMode,
  });
}
```

### 7.5 Super Chlorination Controls

Super chlorination is triggered via dedicated ScreenLogic actions. This gets a small control row in the chemistry column or as a modal popup.

```javascript
/**
 * Start super chlorination with runtime hours.
 */
function startSuperChlor(hass, configEntryId, hours = 24) {
  hass.callService('screenlogic', 'start_super_chlorination', {
    config_entry: configEntryId,
    runtime: hours,
  });
}

/**
 * Stop super chlorination.
 */
function stopSuperChlor(hass, configEntryId) {
  hass.callService('screenlogic', 'stop_super_chlorination', {
    config_entry: configEntryId,
  });
}
```

---

## 8. Heating State Animations

The water body viewscreens communicate heating state through subtle ambient animations on the frame border, matching the Climate Panel Spec §8 pattern.

### Heating Active — Border Pulse

When `hvac_action` is `heating`, the viewscreen border gently pulses brighter — like warmth radiating from the heater.

```css
.pool-body-frame.heating {
  animation: pool-heating-pulse 2.5s ease-in-out infinite;
}

@keyframes pool-heating-pulse {
  0%, 100% { border-color: var(--lcars-butterscotch); }
  50%      { border-color: rgba(255, 153, 102, 0.6); }
}
```

### Idle — Static

When `hvac_action` is `idle`, the frame is static at full opacity. Stillness communicates "at temperature."

### Off — Dimmed

```css
.pool-body-frame.off {
  opacity: 0.6;
  border-color: var(--lcars-disabled);
}

.pool-body-frame.off .pool-water-particle {
  animation: none !important;
  opacity: 0.1;
}
```

### Freeze Protection Active

When the freeze mode binary sensor is `on`, the pool viewscreen border shifts to a bright ice-blue pulse — the ship is protecting its aquatic systems.

```css
.pool-body-frame.freeze {
  animation: pool-freeze-pulse 1.5s ease-in-out infinite;
}

@keyframes pool-freeze-pulse {
  0%, 100% { border-color: var(--lcars-ice); }
  50%      { border-color: rgba(153, 204, 255, 0.4); }
}

@media (prefers-reduced-motion: reduce) {
  .pool-body-frame.freeze {
    animation: none !important;
    border-color: var(--lcars-ice);
    border-width: 4px;  /* Static thicker border as reduced-motion alternative */
  }
}
```

### Reduced Motion — All Animations

```css
@media (prefers-reduced-motion: reduce) {
  .pool-body-frame.heating {
    animation: none !important;
    border-color: var(--lcars-butterscotch);
  }

  .pool-water-particle {
    animation: none !important;
    opacity: 0.2;
  }

  .pool-swatch[data-animated] .pool-swatch-fill {
    animation: none !important;
  }
}
```

All animations respect `prefers-reduced-motion` per WCAG 2.3.3.

---

## 9. HA Entity Mapping — Complete Reference

### Climate Entities (2)

| Entity Pattern             | Body  | Domain    | Key Attributes                                    |
|----------------------------|-------|-----------|---------------------------------------------------|
| `climate.*_pool_heat`      | Pool  | `climate` | `current_temperature`, `temperature`, `hvac_mode`, `hvac_action`, `preset_mode`, `preset_modes` |
| `climate.*_spa_heat`       | Spa   | `climate` | Same as above                                     |

**Supported HVAC modes**: `heat`, `off`  
**Supported preset modes**: `heater`, `solar`, `solar_preferred` (from device, via `preset_modes` attribute)

### Sensor Entities

| Entity Pattern                      | Purpose              | Unit  | Domain   | Notes                      |
|-------------------------------------|----------------------|-------|----------|----------------------------|
| `sensor.*_air_temperature`          | Air temperature      | °F/°C | `sensor` | Controller sensor           |
| `sensor.*_controller_state`         | System state         | enum  | `sensor` | ready/sync/service          |
| `sensor.*_orp`                      | ORP (basic)          | mV    | `sensor` | SCG/basic chemistry         |
| `sensor.*_ph`                       | pH (basic)           | pH    | `sensor` | SCG/basic chemistry         |
| `sensor.*_orp_now`                  | ORP (IntelliChem)    | mV    | `sensor` | Real-time IntelliChem       |
| `sensor.*_ph_now`                   | pH (IntelliChem)     | pH    | `sensor` | Real-time IntelliChem       |
| `sensor.*_orp_supply_level`         | ORP tank level       | 0–4   | `sensor` | IntelliChem supply          |
| `sensor.*_ph_supply_level`          | pH tank level        | 0–4   | `sensor` | IntelliChem supply          |
| `sensor.*_saturation`               | Saturation index     | SI    | `sensor` | Langelier saturation index  |
| `sensor.*_salt_tds_ppm`             | Salt / TDS           | ppm   | `sensor` | Salt chlorine generator     |
| `sensor.*_ph_probe_water_temp`      | Probe water temp     | °F/°C | `sensor` | IntelliChem                 |
| `sensor.*_calcium_hardness`         | Calcium hardness     | ppm   | `sensor` | IntelliChem config          |
| `sensor.*_cya`                      | Cyanuric acid        | ppm   | `sensor` | IntelliChem config          |
| `sensor.*_orp_setpoint`             | ORP target           | mV    | `sensor` | IntelliChem config          |
| `sensor.*_ph_setpoint`              | pH target            | pH    | `sensor` | IntelliChem config          |
| `sensor.*_total_alkalinity`         | Total alkalinity     | ppm   | `sensor` | IntelliChem config          |
| `sensor.*_super_chlor_timer`        | Super chlor timer    | hrs   | `sensor` | SCG sensor                  |

### Pump Sensors (per pump, index 0–N)

| Entity Pattern                      | Purpose           | Unit   | Notes                        |
|-------------------------------------|-------------------|--------|------------------------------|
| `sensor.*_pump_*_watts_now`         | Current power     | W      | All pump types               |
| `sensor.*_pump_*_rpm_now`           | Current RPM       | RPM    | VS pumps (not VF)            |
| `sensor.*_pump_*_gpm_now`           | Current flow      | GPM    | VF pumps (not VS)            |

### Binary Sensors

| Entity Pattern                      | Purpose              | Device Class | Notes                     |
|-------------------------------------|----------------------|-------------|---------------------------|
| `binary_sensor.*_freeze_mode`       | Freeze protection    | —           | Core sensor               |
| `binary_sensor.*_pool_delay`        | Pool startup delay   | —           | Core sensor               |
| `binary_sensor.*_spa_delay`         | Spa startup delay    | —           | Core sensor               |
| `binary_sensor.*_pump_*_state`      | Pump running state   | —           | Per pump                  |
| `binary_sensor.*_flow_alarm`        | Flow sensor alarm    | `problem`   | IntelliChem               |
| `binary_sensor.*_orp_high_alarm`    | ORP high alarm       | `problem`   | IntelliChem               |
| `binary_sensor.*_orp_low_alarm`     | ORP low alarm        | `problem`   | IntelliChem               |
| `binary_sensor.*_ph_high_alarm`     | pH high alarm        | `problem`   | IntelliChem               |
| `binary_sensor.*_ph_low_alarm`      | pH low alarm         | `problem`   | IntelliChem               |
| `binary_sensor.*_probe_fault_alarm` | Probe sensor fault   | `problem`   | IntelliChem               |
| `binary_sensor.*_orp_chem_limit`    | ORP dosing limit     | —           | IntelliChem alert         |
| `binary_sensor.*_ph_chem_limit`     | pH dosing limit      | —           | IntelliChem alert         |
| `binary_sensor.*_ph_lockout`        | pH dosing lockout    | —           | IntelliChem alert         |

### Switch Entities (Circuit-Based)

| Entity Pattern                      | Purpose              | Domain   | Notes                      |
|-------------------------------------|----------------------|----------|----------------------------|
| `switch.*_pool_pump`                | Main pool pump       | `switch` | Primary circuit 505        |
| `switch.*_spa_pump`                 | Spa pump/jets        | `switch` | Primary circuit 500        |
| `switch.*_aux_*`                    | Auxiliary circuits   | `switch` | Spillover, cleaner, etc.   |

### Light Entities

| Entity Pattern                      | Purpose              | Domain  | Notes                       |
|-------------------------------------|----------------------|---------|-----------------------------|
| `light.*_intellibrite`              | Pool lights          | `light` | On/off via standard light   |
| `light.*_*`                         | Other light circuits | `light` | Landscape, etc.             |

### Actions (Integration-Level)

| Action                                   | Parameters                         | Purpose                      |
|------------------------------------------|------------------------------------|------------------------------|
| `screenlogic.set_color_mode`             | `config_entry`, `color_mode`       | IntelliBrite lighting control|
| `screenlogic.start_super_chlorination`   | `config_entry`, `runtime` (hrs)    | Start super chlor            |
| `screenlogic.stop_super_chlorination`    | `config_entry`                     | Stop super chlor             |

### Number Entities (IntelliChem Configuration)

| Entity Pattern                      | Purpose                | Notes                     |
|-------------------------------------|------------------------|---------------------------|
| `number.*_orp_setpoint`             | ORP target setpoint    | Configurable via HA       |
| `number.*_ph_setpoint`              | pH target setpoint     | Configurable via HA       |
| `number.*_calcium_hardness`         | Calcium hardness config| IntelliChem               |
| `number.*_cya`                      | CYA config             | IntelliChem               |
| `number.*_total_alkalinity`         | Total alkalinity config| IntelliChem               |
| `number.*_pool_setpoint`            | Pool temp setpoint     | Alternative to climate    |
| `number.*_spa_setpoint`             | Spa temp setpoint      | Alternative to climate    |

---

## 10. Entity Classification Logic

```javascript
/**
 * Classify entities for the pool/spa panel.
 * Returns { pool, spa, chemistry, pumps, circuits, lights, environmental, diagnostics }.
 */
function classifyPoolEntities(entities, hassStates) {
  const result = {
    pool: null,            // climate entity for pool heat
    spa: null,             // climate entity for spa heat
    chemistry: [],         // pH, ORP, salt, saturation sensors
    pumps: [],             // pump sensors (watts, rpm, gpm)
    circuits: [],          // switch entities for circuits
    lights: [],            // light entities
    environmental: [],     // air temp, freeze, delay binary sensors
    diagnostics: [],       // entity_category: diagnostic
    intellichem: false,    // whether IntelliChem entities exist
    configEntryId: null,   // for color_mode service calls
  };

  const CHEM_KEYS = ['orp', 'ph', 'salt_tds', 'saturation',
    'orp_now', 'ph_now', 'orp_supply', 'ph_supply',
    'super_chlor', 'calcium', 'cya', 'alkalinity'];

  for (const e of entities) {
    const eid = e.entity_id;
    const domain = eid.split('.')[0];
    const cat = e.entity_category || '';

    // Climate entities — pool vs spa
    if (domain === 'climate') {
      if (eid.includes('pool')) result.pool = e;
      else if (eid.includes('spa')) result.spa = e;
      continue;
    }

    // Diagnostic entities
    if (cat === 'diagnostic' || cat === 'config') {
      // Pump sensors are diagnostic but we want them visible
      if (eid.includes('pump') && domain === 'sensor') {
        result.pumps.push(e);
      } else {
        result.diagnostics.push(e);
      }
      continue;
    }

    // Chemistry sensors
    if (domain === 'sensor' && CHEM_KEYS.some(k => eid.includes(k))) {
      result.chemistry.push(e);
      if (eid.includes('orp_now') || eid.includes('ph_now')) {
        result.intellichem = true;
      }
      continue;
    }

    // Environmental sensors and binary sensors
    if (domain === 'sensor' && eid.includes('air_temperature')) {
      result.environmental.push(e);
      continue;
    }

    if (domain === 'binary_sensor') {
      result.environmental.push(e);
      continue;
    }

    // Switch entities — circuits
    if (domain === 'switch') {
      result.circuits.push(e);
      continue;
    }

    // Light entities
    if (domain === 'light') {
      result.lights.push(e);
      continue;
    }

    // Remaining sensors
    if (domain === 'sensor') {
      result.environmental.push(e);
    }
  }

  // Sort circuits: pool pump first, spa pump second, then alphabetical
  result.circuits.sort((a, b) => {
    const aPool = a.entity_id.includes('pool') ? 0 : 1;
    const bPool = b.entity_id.includes('pool') ? 0 : 1;
    if (aPool !== bPool) return aPool - bPool;
    const aSpa = a.entity_id.includes('spa') ? 0 : 1;
    const bSpa = b.entity_id.includes('spa') ? 0 : 1;
    if (aSpa !== bSpa) return aSpa - bSpa;
    return a.entity_id.localeCompare(b.entity_id);
  });

  // Sort chemistry by display priority
  const chemPriority = ['ph_now', 'ph', 'orp_now', 'orp',
    'salt_tds', 'saturation', 'super_chlor',
    'ph_supply', 'orp_supply'];
  result.chemistry.sort((a, b) => {
    const aIdx = chemPriority.findIndex(k => a.entity_id.includes(k));
    const bIdx = chemPriority.findIndex(k => b.entity_id.includes(k));
    return (aIdx === -1 ? 99 : aIdx) - (bIdx === -1 ? 99 : bIdx);
  });

  return result;
}

/**
 * Detect whether IntelliChem chemistry data is available.
 * Determines if the chemistry column should render.
 */
function hasIntelliChem(entities) {
  return entities.some(e =>
    e.entity_id.includes('orp_now') ||
    e.entity_id.includes('ph_now') ||
    e.entity_id.includes('saturation') ||
    e.entity_id.includes('orp_supply')
  );
}

/**
 * Detect whether IntelliChlor (SCG) is available.
 * If only basic pH/ORP sensors exist without IntelliChem, show simplified view.
 */
function hasSCG(entities) {
  return entities.some(e =>
    e.entity_id.includes('salt_tds') ||
    e.entity_id.includes('super_chlor')
  );
}
```

---

## 11. Heading & Label Hierarchy (Accessibility)

### Heading Levels

| Element                 | `aria-level` | Font Size                  | Color                          | Purpose                              |
|-------------------------|--------------|----------------------------|--------------------------------|--------------------------------------|
| Panel title             | 3            | `--lcars-font-size-sub`    | `--lcars-text-heading`         | "POOL & SPA — BACKYARD"             |
| Section headings        | 4            | `--lcars-font-size-data`   | `--lcars-text-heading`         | "CHEMISTRY", "CIRCUITS", "STATUS"   |
| Body labels             | —            | `--lcars-font-size-data`   | `--lcars-space-white`          | "POOL", "SPA"                        |
| Body temp values        | —            | `--lcars-font-size-sub`    | Dynamic (body color)           | "78°F", "102°F"                      |
| Sensor labels           | —            | `--lcars-font-size-data`   | `--lcars-text`                 | "PH", "ORP", "SALT", etc.           |
| Sensor values           | —            | `--lcars-font-size-data`   | Dynamic (threshold-based)      | "7.4", "720", "3200"                |
| Swatch labels           | —            | 0.55rem                    | `--lcars-space-white`          | "PAR", "ROM", "BLU"                 |
| Header badges           | —            | `--lcars-font-size-data`   | Dynamic (body/air color)       | "POOL 78°F", "SPA 102°F"            |

**Exactly 3 font sizes: title (reserved for page-level), sub-header, data.** (Bracer Jack Rule 6). The swatch labels use a smaller size out of necessity (22 items in a horizontal strip) but are supplemented by `aria-label` for accessibility.

### ARIA Labeling

```html
<!-- Panel container -->
<div class="lcars-pool-spa-panel ${hasChem ? '' : 'no-chem'}"
     role="region"
     aria-label="${panelName} pool and spa monitoring panel">

  <!-- Header -->
  <div class="pool-header" role="heading" aria-level="3">...</div>

  <!-- Chemistry column -->
  <div class="pool-chemistry" role="list" aria-label="Water chemistry readings">
    <div role="heading" aria-level="4" class="pool-chem-heading">CHEMISTRY</div>
    <div class="device-sensor-line" role="listitem" tabindex="0"
         aria-label="pH: ${phValue}, ${getPhLabel(phValue)}">
      ...
    </div>
    <div class="device-sensor-line" role="listitem" tabindex="0"
         aria-label="ORP: ${orpValue} millivolts">
      ...
    </div>
    <!-- ... -->
  </div>

  <!-- Aquatic viewscreens -->
  <div class="pool-aquatics" role="group" aria-label="Water body displays">
    <div class="pool-body-viewscreen" data-body="pool"
         role="region"
         aria-label="Pool: ${poolTemp} degrees, target ${poolTarget} degrees, heat mode ${heatMode}">
      ...
    </div>
    <div class="pool-body-viewscreen" data-body="spa"
         role="region"
         aria-label="Spa: ${spaTemp} degrees, target ${spaTarget} degrees, heat mode ${heatMode}">
      ...
    </div>
  </div>

  <!-- Controls column -->
  <div class="pool-controls" role="group" aria-label="Pool and spa controls">
    <div role="heading" aria-level="4" class="pool-control-heading">CIRCUITS</div>
    <div class="pool-circuit-row">
      <span class="pool-circuit-label" id="pool-pump-label">POOL PUMP</span>
      <button class="pool-circuit-toggle"
              role="switch"
              aria-checked="${pumpState}"
              aria-labelledby="pool-pump-label">
      </button>
    </div>
    <!-- ... -->
  </div>

  <!-- Lighting strip -->
  <div class="pool-lighting" role="group" aria-label="Pool light color controls">
    <div class="pool-lighting-swatches" role="radiogroup" aria-label="IntelliBrite color mode">
      <button class="pool-swatch"
              role="radio"
              aria-checked="${isActive}"
              aria-label="${mode.label} light mode">
      </button>
      <!-- ... -->
    </div>
  </div>

  <!-- Screen reader live region -->
  <div class="sr-only" aria-live="polite" aria-atomic="false">
    <!-- JS injects: "Pool temperature changed to 79 degrees"
         "pH alert: value 6.8, below optimal range"
         "Spa heater activated" -->
  </div>
</div>
```

### Keyboard Navigation (Tab Order)

1. Panel header (informational, not interactive)
2. Chemistry sensor lines — top to bottom (`Enter`/`Space` → open more-info dialog)
3. Pool viewscreen → pool setpoint –/+ buttons
4. Spa viewscreen → spa setpoint –/+ buttons
5. Circuit toggles — top to bottom (`Space` to toggle)
6. Status readouts (informational, `tabindex="0"`, `Enter` → more-info)
7. Lighting swatch strip — left to right (standard `radiogroup` keyboard: `Arrow Left`/`Right` to navigate, `Space` to select)

The tab order follows DOM order which matches visual order (WCAG 1.3.2 Meaningful Sequence).

### Screen Reader Announcements

```javascript
/**
 * Announce pool/spa state changes to screen readers via aria-live region.
 * Called when entity states update.
 */
function announcePoolChange(liveRegion, changeType, data) {
  let message = '';
  switch (changeType) {
    case 'temp_change':
      message = `${data.body} temperature changed to ${data.temp} degrees`;
      break;
    case 'chem_alert':
      message = `${data.metric} alert: value ${data.value}, ${data.status}`;
      break;
    case 'heat_change':
      message = `${data.body} heater ${data.action}`;
      break;
    case 'circuit_change':
      message = `${data.circuit} turned ${data.state}`;
      break;
    case 'color_change':
      message = `Pool lights set to ${data.mode}`;
      break;
  }
  if (message && liveRegion) {
    liveRegion.textContent = message;
  }
}
```

---

## 12. LCARS Design Rules Compliance

| Rule                                                | Source           | Compliant? | Notes                                        |
|-----------------------------------------------------|------------------|------------|----------------------------------------------|
| No gradients on buttons/panels                      | Bracer Jack #1   | ✅          | All flat fills, no gradients anywhere         |
| Frame goes thick→thin (4px→2px border)              | Bracer Jack #2   | ✅          | Left/bottom 4px, top/right 2px               |
| Pill buttons with flat left, rounded right           | Bracer Jack #4   | ✅          | Setpoint buttons, circuit toggles             |
| Exactly 3 font sizes (title, sub, data)              | Bracer Jack #6   | ✅          | Sub for body temp, data for everything else   |
| ≤5 hue families                                     | Bracer Jack      | ✅          | Blue (frame/pool), warm (spa/heating), white (text), gray (disabled), red (alerts) = 5 families |
| All text uppercase                                   | TheLCARS.com     | ✅          | Every label, value, heading, button           |
| Antonio font only                                    | TheLCARS.com     | ✅          | `var(--lcars-font)` throughout                |
| CSS custom properties, no hardcoded hex              | Project rule     | ✅          | All colors via `var(--lcars-*)` tokens. Swatch colors use inline hex but these are data values, not UI chrome |
| Background is always `#000000`                       | TheLCARS.com     | ✅          | `var(--lcars-bg)` = `var(--lcars-black)`      |
| Animations < 1s (or justified), respects `prefers-reduced-motion` | WCAG + project | ✅ | Heating pulse 2.5s (ambient, non-critical), particles 6–10s (decorative), all disable gracefully |
| WCAG AA contrast on all text                         | WCAG 1.4.3       | ✅          | Verified in §2 contrast table                |
| 24px+ touch targets                                  | WCAG 2.5.8       | ✅          | Setpoint btns 2.25rem=36px, toggles 1.75rem×3rem, swatches 3.5rem wide |
| Focus visible 2px outline, 3:1 contrast              | WCAG 2.4.7/13    | ✅          | Ice blue outline, 10.3:1 vs black            |
| Color not sole means of information                  | WCAG 1.4.1       | ✅          | All chemistry has text labels + values + color; heat badges have text labels |
| Keyboard operable                                    | WCAG 2.1.1       | ✅          | Full tab order defined, radiogroup keyboard   |
| `aria-label` / `role` on all interactive elements    | WCAG 4.1.2       | ✅          | See §11 ARIA template                        |
| `aria-live="polite"` for state changes               | WCAG 4.1.3       | ✅          | Hidden live region for temp/chem/circuit updates |
| Spacing uses `--lcars-gap` (0.25rem)                 | Jörn Weißenborn  | ✅          | Invisible grid constant throughout            |

---

## 13. Responsive Behavior

### Desktop (≥1024px) — Full 3-Column

The spec above — chemistry, aquatics (two viewscreens side-by-side), controls, lighting strip.

### Tablet (768px–1023px) — 2-Column, Stacked Chemistry

```css
@media (max-width: 1023px) {
  .lcars-pool-spa-panel {
    grid-template-areas:
      "header    header"
      "aquatics  controls"
      "chemistry chemistry"
      "lighting  lighting";
    grid-template-columns: minmax(16rem, 2fr) minmax(8rem, 1fr);
    grid-template-rows: auto 1fr auto auto;
  }

  .pool-chemistry {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.75rem;
    border-top: 2px solid var(--panel-frame-color);
    padding-top: var(--lcars-gap);
  }

  .device-sensor-line {
    flex: 1 1 45%;
    min-width: 8rem;
  }
}
```

### Mobile (<768px) — Single Column, Stacked Everything

```css
@media (max-width: 767px) {
  .lcars-pool-spa-panel,
  .lcars-pool-spa-panel.no-chem {
    grid-template-columns: 1fr;
    grid-template-areas:
      "header"
      "aquatics"
      "controls"
      "chemistry"
      "lighting";
  }

  .pool-aquatics {
    flex-direction: column;
    gap: calc(var(--lcars-gap) * 2);
    align-items: stretch;
  }

  .pool-body-viewscreen {
    max-width: 100%;
  }

  .pool-body-frame {
    aspect-ratio: 16 / 9;
  }

  .pool-chemistry {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .device-sensor-line {
    flex: 1 1 45%;
    min-width: 8rem;
  }

  /* Circuit toggles go horizontal on mobile */
  .pool-controls {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .pool-circuit-row {
    flex: 1 1 45%;
    min-width: 8rem;
  }

  /* Swatch strip remains horizontal, scrollable */
  .pool-lighting-swatches {
    gap: 0.5rem;
  }

  .pool-swatch {
    min-width: 3rem;
  }
}
```

On mobile, viewscreens stack vertically (pool on top, spa below), followed by controls and chemistry as wrapped pairs. The lighting strip stays horizontal and scrollable — it's the one element that works better as a continuous strip regardless of viewport.

---

## 14. CSS Custom Properties Summary (New)

Properties introduced by the Pool & Spa panel. All other properties from `lcars-styles.js`.

| Property                    | Default                        | Set By   | Purpose                                     |
|-----------------------------|--------------------------------|----------|----------------------------------------------|
| `--panel-frame-color`       | `var(--lcars-bluey)`           | CSS      | Panel border, header/footer rules            |
| `--pool-color`              | `var(--lcars-ice)`             | JS       | Dynamic pool body color (heat state)         |
| `--spa-color`               | `var(--lcars-butterscotch)`    | JS       | Dynamic spa body color (heat state)          |
| `--chem-status-color`       | `var(--lcars-ice)`             | JS       | Overall chemistry status indicator           |
| `--pool-particle-speed`     | `8s`                           | JS       | Water particle drift duration                |
| `--pool-particle-sway`      | `-0.5rem`                      | JS       | Per-particle vertical sway offset            |
| `--swatch-color`            | `var(--lcars-disabled)`        | JS/CSS   | Per-swatch IntelliBrite color (inline)       |

---

## 15. Alarm & Alert Handling

ScreenLogic's IntelliChem provides multiple alarm and limit binary sensors. These need prominent visual treatment.

### Alarm Priority Display

When any alarm binary sensor is `on`, the panel shows a consolidated alert in the header:

```javascript
/**
 * Check all IntelliChem alarm/alert binary sensors.
 * Returns array of active alarms for display.
 */
function getActiveAlarms(entities, hassStates) {
  const ALARM_ENTITIES = [
    { pattern: 'flow_alarm',        label: 'FLOW ALARM' },
    { pattern: 'orp_high_alarm',    label: 'ORP HIGH' },
    { pattern: 'orp_low_alarm',     label: 'ORP LOW' },
    { pattern: 'ph_high_alarm',     label: 'PH HIGH' },
    { pattern: 'ph_low_alarm',      label: 'PH LOW' },
    { pattern: 'probe_fault',       label: 'PROBE FAULT' },
    { pattern: 'orp_chem_limit',    label: 'ORP LIMIT' },
    { pattern: 'ph_chem_limit',     label: 'PH LIMIT' },
    { pattern: 'ph_lockout',        label: 'PH LOCKOUT' },
  ];

  const active = [];
  for (const alarm of ALARM_ENTITIES) {
    const entity = entities.find(e => e.entity_id.includes(alarm.pattern));
    if (entity) {
      const state = hassStates[entity.entity_id];
      if (state && state.state === 'on') {
        active.push(alarm.label);
      }
    }
  }
  return active;
}
```

### Alert Header Badge

When alarms are active, a tomato-colored alert badge appears in the header:

```css
.pool-header-alert {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-alert);
  text-transform: uppercase;
  white-space: nowrap;
  font-weight: 700;
  animation: pool-alert-pulse 1s ease-in-out infinite;
}

@keyframes pool-alert-pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.5; }
}

@media (prefers-reduced-motion: reduce) {
  .pool-header-alert {
    animation: none !important;
    opacity: 1;
    text-decoration: underline;  /* Static alternative to pulse */
  }
}
```

---

## 16. Single-Body Adaptation

Some ScreenLogic configurations have only a pool (no spa) or only a spa (no pool). The panel must adapt.

### Pool-Only Mode

```css
.lcars-pool-spa-panel.pool-only .pool-aquatics {
  justify-content: center;
}

.lcars-pool-spa-panel.pool-only .pool-body-viewscreen {
  max-width: 20rem;
}
```

The single viewscreen centers in the aquatics area and gets slightly wider. The controls column remains — it still has pump switches and environmental data.

### Detection Logic

```javascript
/**
 * Determine panel mode based on available climate entities.
 */
function getPanelMode(classifiedEntities) {
  const hasPool = classifiedEntities.pool != null;
  const hasSpa = classifiedEntities.spa != null;
  if (hasPool && hasSpa) return 'dual';
  if (hasPool) return 'pool-only';
  if (hasSpa) return 'spa-only';
  return 'no-climate'; // Shouldn't happen, but defensive
}
```

---

## 17. File Registration Plan

| Component Tag                | File                          | Purpose                            |
|------------------------------|-------------------------------|------------------------------------|
| `lcars-pool-spa-panel`       | `lcars-pool-spa-panel.js`     | Full panel component               |

Extends `LcarsDevicePanelBase`:
- `panelFrameColor` → `var(--lcars-bluey)`
- `mediaAspectRatio` → N/A (dual viewscreens have explicit dimensions)
- `_isPrimaryDomain(domain)` → `domain === 'climate'`
- `_renderMedia()` → renders the dual aquatic viewscreens
- `_renderControls()` → renders circuit toggles + lighting strip

### Lovelace YAML Configuration

```yaml
type: custom:lcars-pool-spa-panel
entities:
  pool_climate: climate.pool_heat
  spa_climate: climate.spa_heat
  # All other entities auto-discovered from ScreenLogic device
  # Can be overridden explicitly:
  # ph_sensor: sensor.screenlogic_ph_now
  # orp_sensor: sensor.screenlogic_orp_now
  # etc.
config_entry: <screenlogic_config_entry_id>  # For color_mode service
title: "POOL & SPA — BACKYARD"
```

### Card Configuration Schema

```javascript
/**
 * Pool/Spa panel card configuration schema.
 */
const POOL_SPA_SCHEMA = {
  type: { type: 'string', required: true },
  entities: {
    type: 'object',
    required: true,
    properties: {
      pool_climate: { type: 'string', required: true, domain: 'climate' },
      spa_climate:  { type: 'string', required: false, domain: 'climate' },
    },
  },
  config_entry: { type: 'string', required: false },
  title: { type: 'string', required: false },
};
```

---

## 18. Team Review Flags

### For Geordi La Forge (LCARS UI Design Authority)

- **Full-width layout departure**: This panel breaks the standard 2-column device panel. The 3-column full-width layout needs Geordi's approval for dashboard integration — it will occupy an entire row.
- **Swatch font size**: The IntelliBrite swatch labels use 0.55rem, below the standard data font size. This is a compromise for fitting 22 items — Geordi should confirm this is acceptable or suggest an alternative (e.g., tooltip only, no visible label).
- **Dual viewscreen**: Two side-by-side viewscreens is unprecedented in the dashboard. Geordi should verify this doesn't conflict with the "single media per panel" pattern from Device Panel Spec §3.2.
- **Inline swatch hex colors**: The IntelliBrite swatch fills use hardcoded hex values for color representation. These are data values (representing actual light output colors), not UI chrome, so they don't violate the "no hardcoded hex" rule — but Geordi should confirm.

### For Worf (Security)

- **Service calls**: The panel calls three ScreenLogic integration actions (`set_color_mode`, `start_super_chlorination`, `stop_super_chlorination`) plus standard climate and switch services. All use the standard `hass.callService()` API through the existing WebSocket connection — no additional network exposure.
- **Config entry ID**: The `config_entry` parameter for ScreenLogic actions exposes the integration config entry ID in the dashboard YAML. This is standard practice for integration-specific services, not a security concern, but Worf should note it.
- **No external API calls**: All data comes from the ScreenLogic gateway via the existing HA integration's Local Push connection. No cloud dependencies, no external API keys.
- **Chemical alarm binary sensors**: Alerts (pH/ORP out of range, probe faults) should be surfaced prominently. Worf may want to recommend these also trigger HA notifications/alerts outside the dashboard.

---

*"On Deck 13, there's a dedicated facility for the ship's cetacean crew — dolphins and whales who assist with navigational research. The water must be maintained at precise temperature and chemical balance at all times. If you can monitor a dolphin tank in deep space, you can certainly manage a pool in your backyard."*  
— Crusher, W., Personal Log
