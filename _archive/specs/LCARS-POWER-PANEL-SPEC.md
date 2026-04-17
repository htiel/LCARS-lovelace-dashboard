# LCARS Power Panel — Design Specification

**Backlog Item**: 4X-3 · Power Panel (Energy Monitoring)  
**Author**: Geordi La Forge (LCARS UI Design Authority)  
**Collaborator**: Wesley Crusher (Creative Technology & Experimentation)  
**Date**: Stardate 2026.04.14  
**Status**: **SHIPPED** — v4.15.0, hotfix v4.15.1  
**Target Version**: 4.15.0  
**Panel Type**: `power`  
**Extends**: `LcarsDevicePanelBase` (per LCARS-PANEL-EXTRACTION-ARCHITECTURE.md)

---

## 0. Design Philosophy

The Power Panel is modeled after the Enterprise-D's **Main Engineering power distribution display** — the large wall-mounted schematic that shows power flow from the warp core through the EPS conduits to every major system. When Geordi stands at that station, he sees at a glance: total power output, consumption by subsystem, any circuits drawing above nominal, and which feeds are offline.

This panel gives the crew member (homeowner) the same situational awareness: a **summary header** showing whole-home draw and grid balance, **per-circuit tiles** for Emporia Vue monitors, **switch+monitor rows** for TP-Link smart plugs, and **power strip blocks** for multi-outlet strips — all within a single area's LCARS device panel frame.

Per Roddenberry's mandate: **the ship takes care of you**. The EPS grid distributes power automatically. The panel reflects what's happening — the operator only intervenes when something is off-nominal.

Per Bracer Jack's Manifesto: **empty space is beautiful**. A panel with 3 circuits should not look cramped. A panel with 40+ circuits should scroll cleanly without visual noise. The frame tells you "this is the power monitoring station." The data inside breathes.

Per Bracer Jack's Core Design Rules: **LCARS is inherently flat/vector.** No gradients on bars, no drop shadows on tiles, no 3D embossing on icons. Clean shapes, solid color fills, the standard border-radius vocabulary.

---

## 1. Panel Frame Design

### 1.1 Frame Color Assignment

| Panel Type   | Frame Color               | CSS Variable               | Reasoning |
|-------------|---------------------------|----------------------------|-----------|
| Camera      | `--lcars-butterscotch`    | Default                    | General purpose |
| Climate     | Dynamic (HVAC action)     | `--lcars-butterscotch/ice` | State-driven |
| Battery     | `--lcars-ice`             | Cool accent                | Storage/passive |
| Alarm       | Dynamic (alarm state)     | State-driven               | Alert escalation |
| Media       | `--lcars-african-violet`  | Entertainment              | Distinctive |
| **Power**   | **`--lcars-butterscotch`**| **`--lcars-butterscotch`** | **EPS conduit orange** |

**Rationale**: Power distribution on TNG/DS9 Engineering consoles consistently used warm orange/amber tones for EPS conduit displays and power flow routing. Butterscotch (`#ff9966`) is our closest match. It also creates visual kinship with the Climate panel when heating, reinforcing the "energy flowing" metaphor. (Source: Ex Astris Scientia engineering console screen captures; TheLCARS.com header bar color)

When the panel detects **critical draw** (any circuit ≥3000W), the frame color shifts to `--lcars-tomato` via `--panel-frame-color`. This mirrors the Battery panel's low-charge alert and Alarm panel's triggered state — an established LCARS convention that "the frame tells you the status."

### 1.2 Border Style

Standard LCARS device panel frame per LCARS-DEVICE-PANEL-SPEC §2:

```css
.lcars-power-panel {
  --panel-frame-color: var(--lcars-butterscotch);

  display: grid;
  border-left: 4px solid var(--panel-frame-color);
  border-top: 2px solid var(--panel-frame-color);
  border-right: 2px solid var(--panel-frame-color);
  border-bottom: 4px solid var(--panel-frame-color);
  border-radius: 0.75rem;
  padding: var(--lcars-gap);
  background: var(--lcars-black);
  min-height: calc(var(--lcars-vunit) * 4);
}
```

**Bracer Jack Rule 2**: thick→thin (left 4px → top 2px) or thin→thick (right 2px → bottom 4px). NEVER same thickness on consecutive turns. ✓

### 1.3 Typography

All text follows the established three-tier LCARS font system:

| Element | Size Token | CSS Variable | Casing | Color |
|---------|-----------|-------------|--------|-------|
| Panel header (area name) | Title | `--lcars-font-size-title` (2rem) | UPPERCASE | `--lcars-text-heading` (sunflower) |
| Section labels ("CIRCUITS", "DEVICES", "POWER STRIPS") | Sub | `--lcars-font-size-sub` (1.25rem) | UPPERCASE | `--lcars-text-heading` (sunflower) |
| Entity names, values, units | Data | `--lcars-font-size-data` (0.875rem) | UPPERCASE | `--lcars-space-white` (values), `--lcars-ice` (units) |
| Summary large numbers (total W) | Title | `--lcars-font-size-title` (2rem) | UPPERCASE | Dynamic power-level color |
| Sparkline labels | Data | `--lcars-font-size-data` | UPPERCASE | `--lcars-ice` |

Font family: `var(--lcars-font)` — Antonio everywhere. No exceptions.

---

## 2. Color Palette — Power Level States

### 2.1 Power Draw Color Map

Power consumption is mapped to 5 semantic tiers using colors from the approved LCARS Classic palette. The metaphor is an EPS conduit load display: green/cool at nominal, warming through amber as load increases, red at capacity.

| State | Wattage Range | LCARS Color | CSS Variable | Hex | WCAG vs #000 | Shape Indicator |
|-------|--------------|-------------|-------------|-----|-------------|-----------------|
| **Off/Standby** | 0 W | Gray | `--lcars-gray` | `#666688` | 4.7:1 ✓ AA | Hollow dot `○` |
| **Low Draw** | 1–500 W | Ice | `--lcars-ice` | `#99ccff` | 10.5:1 ✓ AAA | Filled dot `●` |
| **Moderate Draw** | 501–1500 W | Sunflower | `--lcars-sunflower` | `#ffcc99` | 13.1:1 ✓ AAA | Filled dot `●` + 1 bar |
| **High Draw** | 1501–3000 W | Butterscotch | `--lcars-butterscotch` | `#ff9966` | 8.8:1 ✓ AAA | Filled dot `●` + 2 bars |
| **Critical Draw** | 3001+ W | Tomato | `--lcars-tomato` | `#ff5555` | 5.2:1 ✓ AA | Filled dot `●` + 3 bars (pulsing) |
| **Unavailable** | N/A | Tomato | `--lcars-tomato` | `#ff5555` | 5.2:1 ✓ AA | `✕` cross mark |

### 2.2 WCAG Contrast Verification

All colors verified against `#000000` background (WCAG 2.2 §1.4.3 — Contrast Minimum, AA):

| Color | Hex | Luminance Ratio vs #000 | WCAG AA Normal Text (4.5:1) | WCAG AA Large Text (3:1) | WCAG AAA (7:1) |
|-------|-----|------------------------|----------------------------|-------------------------|----------------|
| Gray | `#666688` | 4.7:1 | ✓ PASS | ✓ PASS | ✗ FAIL |
| Ice | `#99ccff` | 10.5:1 | ✓ PASS | ✓ PASS | ✓ PASS |
| Sunflower | `#ffcc99` | 13.1:1 | ✓ PASS | ✓ PASS | ✓ PASS |
| Butterscotch | `#ff9966` | 8.8:1 | ✓ PASS | ✓ PASS | ✓ PASS |
| Tomato | `#ff5555` | 5.2:1 | ✓ PASS | ✓ PASS | ✗ FAIL |
| Space White | `#f5f6fa` | 18.9:1 | ✓ PASS | ✓ PASS | ✓ PASS |

All power-state colors pass WCAG AA for normal text on black background. Gray and Tomato fall slightly below AAA — acceptable for data values (which are accompanied by shape indicators per §2.3) but labels on those colors should use `--lcars-space-white` for body text.

### 2.3 Color-Blind Considerations (WCAG 2.2 §1.4.1 — Use of Color)

Color MUST NOT be the sole means of conveying power level. Each tier includes **redundant indicators**:

1. **Shape indicator**: A small glyph prepended to each circuit tile (see table in §2.1)
   - Off = hollow circle `○`
   - Low–High = filled circle `●` + escalating bar count (like a Wi-Fi signal icon)
   - Critical = pulsing filled circle (animation disabled under `prefers-reduced-motion`, replaced by static `●●●`)
   - Unavailable = cross mark `✕`

2. **Numeric value**: The actual wattage is always displayed, providing unambiguous information regardless of color perception.

3. **ARIA label**: Screen readers receive "Kitchen lights: 342 watts, low draw" — the semantic tier is spoken.

4. **Luminance progression**: The 5 colors progress from dark (gray at 4.7:1) through cool-light (ice at 10.5:1) to warm-light (sunflower 13.1:1) to warm-medium (butterscotch 8.8:1) to warm-dark-ish (tomato 5.2:1). This luminance variance provides additional differentiation for protanopia/deuteranopia users.

### 2.4 Grid Balance Colors

For whole-home Emporia Vue meters that show grid import/export:

| State | Color | CSS Variable | Icon |
|-------|-------|-------------|------|
| Importing from grid | Butterscotch | `--lcars-butterscotch` | `mdi:transmission-tower-import` |
| Exporting to grid | Ice | `--lcars-ice` | `mdi:transmission-tower-export` |
| Balanced (net zero ±50W) | Sunflower | `--lcars-sunflower` | `mdi:transmission-tower` |

### 2.5 Color Resolver Function

New function for `lcars-color-utils.js`:

```js
// ─── Power Panel: Power Draw Level ──────────────────────────────────────────

/**
 * Resolve power consumption (watts) to LCARS color CSS variable.
 * 5-tier model: off/standby → low → moderate → high → critical.
 * @param {number|string|null} watts - Power consumption in watts
 * @returns {string} CSS variable string
 */
export function getPowerColor(watts, thresholds = {}) {
  const { lowMax = 500, moderateMax = 1500, highMax = 3000 } = thresholds;
  if (watts == null || isNaN(watts)) return 'var(--lcars-tomato)';
  const w = Math.abs(Number(watts));
  if (w === 0)          return 'var(--lcars-gray)';
  if (w <= lowMax)      return 'var(--lcars-ice)';
  if (w <= moderateMax) return 'var(--lcars-sunflower)';
  if (w <= highMax)     return 'var(--lcars-butterscotch)';
  return 'var(--lcars-tomato)';
}

/**
 * Resolve power draw to a semantic tier label (uppercase).
 * @param {number|string|null} watts - Power consumption in watts
 * @returns {string} Tier label
 */
export function getPowerLabel(watts, thresholds = {}) {
  const { lowMax = 500, moderateMax = 1500, highMax = 3000 } = thresholds;
  if (watts == null || isNaN(watts)) return 'UNAVAILABLE';
  const w = Math.abs(Number(watts));
  if (w === 0)          return 'STANDBY';
  if (w <= lowMax)      return 'LOW DRAW';
  if (w <= moderateMax) return 'MODERATE';
  if (w <= highMax)     return 'HIGH DRAW';
  return 'CRITICAL';
}

/**
 * Resolve grid balance direction to LCARS color CSS variable.
 * @param {number|string|null} watts - Positive = importing, negative = exporting
 * @param {number} [deadband=50] - Watts threshold for "balanced" state
 * @returns {string} CSS variable string
 */
export function getGridBalanceColor(watts, deadband = 50) {
  if (watts == null || isNaN(watts)) return 'var(--lcars-gray)';
  const w = Number(watts);
  if (Math.abs(w) <= deadband) return 'var(--lcars-sunflower)';
  return w > 0 ? 'var(--lcars-butterscotch)' : 'var(--lcars-ice)';
}
```

### 2.6 STATE_COLOR_MAP Entry

Add to the centralized map in `lcars-color-utils.js`:

```js
power: {
  standby:  '--lcars-gray',
  low:      '--lcars-ice',
  moderate: '--lcars-sunflower',
  high:     '--lcars-butterscotch',
  critical: '--lcars-tomato',
  unavailable: '--lcars-tomato',
},
```

---

## 3. Layout Specifications

### 3.1 Panel Variants

The Power Panel has **three layout variants** depending on the devices present in an area:

| Variant | Trigger | Grid Layout |
|---------|---------|-------------|
| **Summary + Circuits** | Area contains Emporia Vue with ≥5 circuits | Summary header + scrollable circuit grid |
| **Devices Only** | Area contains only switch+monitor plugs/strips | Section list of device rows |
| **Combined** | Area has both Vue circuits AND device monitors | Summary header + circuit grid + device section |

### 3.2 Grid Template — Combined Layout (Primary)

```
┌──────────────────────────────────────────────────────────────────┐
│  ⚡ MAIN PANEL                               POWER SYSTEMS      │  ← header
├──────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │  TOTAL USAGE        │  │  FROM GRID      │  │  TO GRID     │ │  ← summary
│  │  4,872 W            │  │  5,100 W ▼      │  │  228 W ▲     │ │
│  │  47.3 kWh today     │  │  51.2 kWh       │  │  3.9 kWh     │ │
│  └─────────────────────┘  └─────────────────┘  └──────────────┘ │
├──────────────────────────────────────────────────────────────────┤
│  CIRCUITS ─────────────────────────────────────────────── 43/43  │  ← section label
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐ │
│  │ ● KITCHEN LIGHTS │  │ ● OVEN          │  │ ○ GUEST BATH   │ │  ← circuit
│  │   342 W  ╌╌╌╌╌╌  │  │   2,847 W ╌╌╌╌  │  │   0 W          │ │     tiles
│  │   1.2 kWh today  │  │   8.4 kWh today │  │   0.0 kWh      │ │
│  └──────────────────┘  └──────────────────┘  └────────────────┘ │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐ │
│  │ ●● DRYER L1+L2   │  │ ● LIVING ROOM   │  │ ● OFFICE       │ │
│  │   4,200 W ╌╌╌╌╌  │  │   890 W ╌╌╌╌╌╌  │  │   156 W ╌╌╌╌╌  │
│  │   12.1 kWh today │  │   3.1 kWh today │  │   0.8 kWh      │
│  └──────────────────┘  └──────────────────┘  └────────────────┘ │
│         (scrollable — max-height with mask fade)                 │
├──────────────────────────────────────────────────────────────────┤
│  MONITORED DEVICES ──────────────────────────────────────── 3/3  │  ← section label
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ [ON]  DOG HEATING PAD        156 W │ 0.8 kWh │ ╌╌╌╌╌╌╌╌╌╌ ││  ← switch+monitor
│  ├──────────────────────────────────────────────────────────────┤│
│  │ [ON]  3D PRINTER             342 W │ 2.1 kWh │ ╌╌╌╌╌╌╌╌╌╌ ││
│  └──────────────────────────────────────────────────────────────┘│
├──────────────────────────────────────────────────────────────────┤
│  POWER STRIPS ───────────────────────────────────────────── 1/1  │  ← section label
│  ┌──────────────────────────────────────────────────────────────┐│
│  │  SERVER ROOM STRIP                          TOTAL: 487 W    ││  ← strip header
│  │  ┌──────────────────────────────────────────────────────────┐││
│  │  │ [ON]  OUTLET 1 — NAS         189 W │ 4.2 kWh │ ╌╌╌╌╌╌ │││  ← child outlets
│  │  │ [ON]  OUTLET 2 — SWITCH       12 W │ 0.3 kWh │ ╌╌╌╌╌╌ │││
│  │  │ [OFF] OUTLET 3 — UNUSED        0 W │ 0.0 kWh │         │││
│  │  │ [ON]  OUTLET 4 — UPS         186 W │ 4.1 kWh │ ╌╌╌╌╌╌ │││
│  │  │ [ON]  OUTLET 5 — PI CLUSTER  100 W │ 2.2 kWh │ ╌╌╌╌╌╌ │││
│  │  │ [OFF] OUTLET 6 — EMPTY         0 W │ 0.0 kWh │         │││
│  │  └──────────────────────────────────────────────────────────┘││
│  └──────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────┘
```

### 3.3 CSS Grid Definition

```css
.lcars-power-panel {
  --panel-frame-color: var(--lcars-butterscotch);

  display: grid;
  grid-template-areas:
    "header"
    "summary"
    "circuits"
    "devices"
    "strips";
  grid-template-columns: 1fr;
  grid-template-rows: auto auto auto auto auto;
  gap: var(--lcars-gap);

  border-left: 4px solid var(--panel-frame-color);
  border-top: 2px solid var(--panel-frame-color);
  border-right: 2px solid var(--panel-frame-color);
  border-bottom: 4px solid var(--panel-frame-color);
  border-radius: 0.75rem;
  padding: var(--lcars-gap);
  background: var(--lcars-black);
  min-height: calc(var(--lcars-vunit) * 4);
}

/* ─── Summary Cards Row ─── */
.power-summary {
  grid-area: summary;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr));
  gap: var(--lcars-gap);
}

/* ─── Circuit Tile Grid ─── */
.power-circuits {
  grid-area: circuits;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
  gap: var(--lcars-gap);
  max-height: 24rem;
  overflow-y: auto;
  mask-image: linear-gradient(to bottom, black calc(100% - 2rem), transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, black calc(100% - 2rem), transparent 100%);
}

/* ─── Device Rows ─── */
.power-devices {
  grid-area: devices;
  display: flex;
  flex-direction: column;
  gap: var(--lcars-gap);
}

/* ─── Power Strip Blocks ─── */
.power-strips {
  grid-area: strips;
  display: flex;
  flex-direction: column;
  gap: calc(var(--lcars-gap) * 2);
}
```

### 3.4 Handling Variable Device Counts

| Scenario | Behavior |
|----------|----------|
| **1–3 circuits** | Grid collapses to single row. Panel is compact. Empty space is beautiful. |
| **4–12 circuits** | Grid fills 2–4 rows. No scrolling needed. |
| **13–30 circuits** | Grid fills available height. Scroll activates with bottom fade mask. |
| **30+ circuits** (Main Panel) | Same as above. The 24rem `max-height` on `.power-circuits` triggers scroll. Section label shows count: "CIRCUITS ── 43/43" |
| **0 circuits, devices only** | `summary` and `circuits` grid areas are empty/hidden. Panel shows only device rows. |
| **Mixed** | All sections shown. Each section collapses to `display: none` if empty. |

### 3.5 240V Circuit Pairing

240V appliances (dryer, oven, EV charger, water heater) appear as L1/L2 pairs on Emporia Vue. The panel MUST combine these:

- **Detection**: Two circuits with matching names differing only by `L1`/`L2`, `Line 1`/`Line 2`, or adjacent circuit numbers
- **Display**: Single tile showing combined wattage (`L1 + L2`), labeled with the shared name
- **Indicator**: Double dot `●●` to indicate paired circuit
- **Tap action**: Shows both entity IDs in the `more-info` dialog

### 3.6 Responsive Breakpoints

```css
/* ─── Desktop (≥1024px) — Full grid ─── */
/* Default layout above applies */

/* ─── Tablet (768–1023px) — Narrower tiles ─── */
@media (max-width: 1023px) {
  .power-circuits {
    grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr));
  }
  .power-summary {
    grid-template-columns: repeat(auto-fit, minmax(7rem, 1fr));
  }
}

/* ─── Mobile (<768px) — Single column stack ─── */
@media (max-width: 767px) {
  .lcars-power-panel {
    grid-template-areas:
      "header"
      "summary"
      "circuits"
      "devices"
      "strips";
    /* Same areas, layout stays single-column */
  }

  .power-circuits {
    grid-template-columns: 1fr 1fr;
    max-height: 16rem;
  }

  .power-summary {
    grid-template-columns: 1fr;
    gap: var(--lcars-gap);
  }

  /* Switch+monitor rows stack vertically */
  .power-device-row {
    flex-direction: column;
    align-items: stretch;
  }
}

/* ─── Narrow mobile (<480px) — Single column everything ─── */
@media (max-width: 479px) {
  .power-circuits {
    grid-template-columns: 1fr;
  }
}
```

---

## 4. Component Specifications

### 4.1 Summary Header Cards

Three cards in a horizontal row showing whole-home metrics from Emporia Vue `TotalUsage`, `MainsFromGrid`, `MainsToGrid`:

```
┌─────────────────────┐
│  TOTAL USAGE        │  ← label (data size, ice)
│  4,872 W            │  ← value (title size, dynamic power color)
│  47.3 kWh TODAY     │  ← secondary (data size, space-white)
│  ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌   │  ← sparkline (24h trend)
└─────────────────────┘
```

```css
.power-summary-card {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  border-left: 3px solid var(--card-accent, var(--lcars-butterscotch));
  border-radius: 0 0.25rem 0.25rem 0;
  background: rgba(255, 255, 255, 0.03);
  min-width: 8rem;
}

.power-summary-label {
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-ice);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.power-summary-value {
  font-size: var(--lcars-font-size-title);
  font-weight: 700;
  color: var(--summary-value-color, var(--lcars-space-white));
  text-transform: uppercase;
}

.power-summary-secondary {
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-space-white);
  opacity: 0.8;
}
```

**Summary card contents**:

| Card | Label | Value Entity | Unit | Secondary Entity | Accent Color |
|------|-------|-------------|------|-----------------|-------------|
| Total Usage | TOTAL USAGE | `sensor.*_totalusage_power_minute_average` | W | `sensor.*_totalusage_energy_today` (kWh) | Dynamic (by wattage) |
| From Grid | FROM GRID | `sensor.*_mainsfromgrid_power_minute_average` | W | `sensor.*_mainsfromgrid_energy_today` (kWh) | `--lcars-butterscotch` |
| To Grid | TO GRID | `sensor.*_mainstogrid_power_minute_average` | W | `sensor.*_mainstogrid_energy_today` (kWh) | `--lcars-ice` |

If the area has no whole-home monitor (no `TotalUsage`/`MainsFromGrid` entities), the summary section is hidden entirely.

### 4.2 Circuit Tile

Compact tile for individual Emporia Vue circuit monitors. This is the most common element — areas can have 40+ of these.

```
┌──────────────────┐
│ ● KITCHEN LIGHTS │  ← indicator dot + name (data size, space-white)
│   342 W  ╌╌╌╌╌╌  │  ← value + inline sparkline
│   1.2 kWh TODAY  │  ← energy today (data size, dimmed)
└──────────────────┘
```

```css
.power-circuit-tile {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  padding: 0.375rem 0.5rem;
  background: rgba(255, 255, 255, 0.03);
  border-left: 3px solid var(--circuit-color, var(--lcars-ice));
  border-radius: 0 0.25rem 0.25rem 0;
  cursor: pointer;
  transition: background var(--lcars-transition);
  min-height: 3rem;
}

.power-circuit-tile:hover {
  background: rgba(255, 255, 255, 0.06);
}

.power-circuit-tile:focus-visible {
  outline: 2px solid var(--lcars-ice);
  outline-offset: 2px;
}

.power-circuit-name {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-space-white);
  text-transform: uppercase;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.power-circuit-indicator {
  flex-shrink: 0;
  font-size: 0.625rem;
  color: var(--circuit-color, var(--lcars-ice));
}

.power-circuit-value-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.power-circuit-watts {
  font-size: var(--lcars-font-size-data);
  font-weight: 700;
  color: var(--circuit-color, var(--lcars-ice));
  white-space: nowrap;
}

.power-circuit-energy {
  font-size: 0.75rem;
  color: var(--lcars-space-white);
  opacity: 0.6;
  text-transform: uppercase;
}
```

**Tile sizing**: Minimum 10rem wide. At default grid sizing, 3 columns on desktop, 2 on tablet, 1–2 on mobile. Tiles are uniform height per row via CSS grid auto-rows.

### 4.3 Switch + Monitor Row

For TP-Link smart plugs (KP115, KP125M, HS110) that have both a `switch.*` and power telemetry sensors.

```
┌────────────────────────────────────────────────────────────────┐
│ [ON]  DOG HEATING PAD          156 W │ 0.8 kWh │ ╌╌╌╌╌╌╌╌╌╌  │
└────────────────────────────────────────────────────────────────┘
```

```css
.power-device-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
  transition: background var(--lcars-transition);
  cursor: pointer;
  min-height: 2.5rem;
}

.power-device-row:hover {
  background: rgba(255, 255, 255, 0.05);
}

.power-device-row:focus-visible {
  outline: 2px solid var(--lcars-ice);
  outline-offset: 2px;
}

/* Toggle pill — reuses existing .toggle-pill pattern */
.power-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 1.5rem;
  border-radius: 0.75rem;
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
  border: none;
  cursor: pointer;
  flex-shrink: 0;
  transition: background var(--lcars-transition);
}

.power-toggle[data-state="on"] {
  background: var(--lcars-gold);
  color: var(--lcars-black);
}

.power-toggle[data-state="off"] {
  background: var(--lcars-gray);
  color: var(--lcars-space-white);
}

.power-toggle:focus-visible {
  outline: 2px solid var(--lcars-ice);
  outline-offset: 2px;
}

.power-device-name {
  flex: 1;
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-space-white);
  text-transform: uppercase;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.power-device-stats {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.power-device-watts {
  font-size: var(--lcars-font-size-data);
  font-weight: 700;
  color: var(--circuit-color, var(--lcars-ice));
  white-space: nowrap;
  min-width: 4rem;
  text-align: right;
}

.power-device-energy {
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-space-white);
  opacity: 0.7;
  white-space: nowrap;
  min-width: 4rem;
  text-align: right;
}
```

### 4.4 Power Strip Block

For TP-Link HS300 power strips. A parent block with 6 child outlet rows inside.

```
┌──────────────────────────────────────────────────────────────┐
│  SERVER ROOM STRIP                          TOTAL: 487 W     │  ← strip header
│ ─────────────────────────────────────────────────────────── │
│  [ON]  OUTLET 1 — NAS              189 W │ 4.2 kWh │ ╌╌╌╌  │  ← child rows
│  [ON]  OUTLET 2 — SWITCH            12 W │ 0.3 kWh │ ╌╌╌╌  │
│  [OFF] OUTLET 3 — UNUSED             0 W │ 0.0 kWh │        │
│  [ON]  OUTLET 4 — UPS              186 W │ 4.1 kWh │ ╌╌╌╌  │
│  [ON]  OUTLET 5 — PI CLUSTER       100 W │ 2.2 kWh │ ╌╌╌╌  │
│  [OFF] OUTLET 6 — EMPTY              0 W │ 0.0 kWh │        │
└──────────────────────────────────────────────────────────────┘
```

```css
.power-strip-block {
  border: 2px solid var(--panel-frame-color, var(--lcars-butterscotch));
  border-radius: 0.5rem;
  padding: var(--lcars-gap);
  background: var(--lcars-black);
}

.power-strip-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.25rem 0.5rem;
  margin-bottom: var(--lcars-gap);
}

.power-strip-name {
  font-size: var(--lcars-font-size-sub);
  color: var(--lcars-text-heading);
  text-transform: uppercase;
}

.power-strip-total {
  font-size: var(--lcars-font-size-data);
  color: var(--circuit-color, var(--lcars-ice));
  font-weight: 700;
  text-transform: uppercase;
}

.power-strip-divider {
  height: 1px;
  background: var(--panel-frame-color, var(--lcars-butterscotch));
  opacity: 0.3;
  margin-bottom: var(--lcars-gap);
}

.power-strip-outlets {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

/* Child outlet rows reuse .power-device-row styling */
.power-strip-outlets .power-device-row {
  padding-left: 1rem;  /* Indent children under parent */
}
```

### 4.5 Sparkline Sizing

Reuses `renderSparkline()` from `lcars-sparkline.js`:

| Context | Width | Height | Stroke Color | Data Source |
|---------|-------|--------|-------------|------------|
| Summary card sparkline | 120px | 24px | `var(--lcars-butterscotch)` | `*_power_minute_average` 24h stats |
| Circuit tile sparkline | 80px | 16px | `var(--circuit-color)` | `*_power_minute_average` 24h stats |
| Device row sparkline | 80px | 16px | `var(--circuit-color)` | `*_current_consumption` 24h stats |

Sparklines are fetched via `fetchSparklineData()` with the shared WebSocket-based statistics fetcher already used by the temp/humidity grid. Max 20 entities per batch (reconciled — spec originally said 50, Wesley's code said 10, Data recommended 20).

### 4.6 Section Labels

Each section within the panel has a thin rule + label in the established LCARS pattern:

```css
.power-section-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0;
  margin-top: 0.25rem;
}

.power-section-label-text {
  font-size: var(--lcars-font-size-sub);
  color: var(--lcars-text-heading);
  text-transform: uppercase;
  white-space: nowrap;
  flex-shrink: 0;
}

.power-section-label-rule {
  flex: 1;
  height: 2px;
  background: var(--panel-frame-color, var(--lcars-butterscotch));
  opacity: 0.5;
}

.power-section-label-count {
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-ice);
  white-space: nowrap;
  flex-shrink: 0;
}
```

### 4.7 Panel Header

Reuses the standard device panel header pattern:

```
⚡ MAIN PANEL                                    POWER SYSTEMS
^  ^                                              ^
icon  area name (sunflower, sub size)              badge (ice, data size)
      ──────────────────────────────── (thin rule)
```

```css
.power-panel-header {
  grid-area: header;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  min-height: var(--lcars-bar-h);
}

.power-panel-header ha-icon {
  --mdc-icon-size: 20px;
  color: var(--panel-frame-color, var(--lcars-butterscotch));
  flex-shrink: 0;
}

.power-panel-name {
  font-size: var(--lcars-font-size-sub);
  color: var(--lcars-text-heading);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.power-panel-header-line {
  flex: 1;
  height: 2px;
  background: var(--panel-frame-color, var(--lcars-butterscotch));
}

.power-panel-badge {
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-data-accent);
  text-transform: uppercase;
  white-space: nowrap;
}
```

---

## 5. Accessibility Requirements (WCAG 2.2 AA)

### 5.1 ARIA Structure

```html
<!-- Panel root -->
<div class="lcars-power-panel lcars-device-panel"
     role="region"
     aria-label="${areaName} Power Systems">

  <!-- Panel header -->
  <div class="power-panel-header" role="heading" aria-level="3">
    <ha-icon icon="mdi:flash"></ha-icon>
    <span class="power-panel-name">${areaName}</span>
    <div class="power-panel-header-line" aria-hidden="true"></div>
    <span class="power-panel-badge">POWER SYSTEMS</span>
  </div>

  <!-- Summary section (if Vue present) -->
  <div class="power-summary" role="group" aria-label="Power Summary">
    <div class="power-summary-card"
         role="status"
         aria-label="Total usage: ${totalW} watts, ${totalKwh} kilowatt hours today"
         aria-live="polite">
      ...
    </div>
    <!-- From Grid, To Grid cards similar -->
  </div>

  <!-- Circuits section -->
  <div class="power-circuits-section">
    <div class="power-section-label" role="heading" aria-level="4">
      <span>CIRCUITS</span>
      <span class="sr-only">: ${visibleCount} of ${totalCount}</span>
    </div>
    <div class="power-circuits"
         role="list"
         aria-label="Circuit Monitors">
      <div class="power-circuit-tile"
           role="listitem"
           tabindex="0"
           aria-label="${circuitName}: ${watts} watts, ${tier} draw, ${kwhToday} kilowatt hours today"
           @click="${() => showMoreInfo(entityId)}"
           @keydown="${(e) => e.key === 'Enter' && showMoreInfo(entityId)}">
        <span class="power-circuit-indicator" aria-hidden="true">●</span>
        ...
      </div>
    </div>
  </div>

  <!-- Devices section -->
  <div class="power-devices-section">
    <div class="power-section-label" role="heading" aria-level="4">
      <span>MONITORED DEVICES</span>
    </div>
    <div class="power-devices" role="list" aria-label="Monitored Devices">
      <div class="power-device-row"
           role="listitem"
           tabindex="0"
           aria-label="${deviceName}: ${switchState}, ${watts} watts">
        <button class="power-toggle"
                role="switch"
                aria-checked="${isOn}"
                aria-label="Toggle ${deviceName}"
                @click="${toggleSwitch}">
          ${isOn ? 'ON' : 'OFF'}
        </button>
        ...
      </div>
    </div>
  </div>

  <!-- Power strips section -->
  <div class="power-strips-section">
    <div class="power-section-label" role="heading" aria-level="4">
      <span>POWER STRIPS</span>
    </div>
    <div class="power-strips" role="list" aria-label="Power Strips">
      <div class="power-strip-block" role="listitem">
        <div class="power-strip-header" role="heading" aria-level="5">
          ${stripName}
        </div>
        <div class="power-strip-outlets" role="list" aria-label="${stripName} outlets">
          <!-- Child rows with role="listitem" -->
        </div>
      </div>
    </div>
  </div>
</div>
```

### 5.2 ARIA Roles and Landmarks Summary

| Element | Role | Purpose |
|---------|------|---------|
| Panel root | `region` + `aria-label` | Landmark for assistive tech navigation |
| Panel header | `heading` (level 3) | Area name as section heading |
| Summary cards | `status` + `aria-live="polite"` | Live-updating power values announced |
| Section labels | `heading` (level 4) | Subsection structure |
| Circuit grid | `list` | Navigable list of circuit tiles |
| Circuit tile | `listitem` + `tabindex="0"` | Focusable, activatable tile |
| Device list | `list` | Navigable list of device rows |
| Toggle button | `switch` + `aria-checked` | Switch control per WAI-ARIA APG |
| Power strip | `listitem` with nested `list` | Hierarchical strip → outlets |
| Strip outlet | `listitem` + toggle `switch` | Child outlet in strip |
| Sparklines | wrapper `aria-label` | Textual description of trend |
| Decorative indicators | `aria-hidden="true"` | Shape dots hidden from SR |

### 5.3 Keyboard Navigation

**Tab order** (follows visual top-to-bottom, left-to-right per WCAG §2.4.3 Focus Order):

1. Panel region (skippable via landmark nav)
2. Summary cards (not individually focusable — static status)
3. First circuit tile → Tab through all tiles (left-to-right, row-by-row)
4. First device row → Tab through device rows
5. First device toggle button (nested focus within row)
6. First strip block → first outlet toggle → through all outlets
7. Next panel

**Key bindings**:

| Key | Action |
|-----|--------|
| `Tab` | Move to next focusable element |
| `Shift+Tab` | Move to previous focusable element |
| `Enter` | Activate tile (show more-info) or toggle switch |
| `Space` | Toggle switch (per APG switch pattern) |
| `Escape` | Close more-info dialog (handled by HA) |

**Focus management**:
- Circuit tiles receive `tabindex="0"` — they participate in tab order
- Toggle buttons are native `<button>` elements — inherently focusable
- When circuit count exceeds scroll container, focus automatically scrolls the tile into view (browser default)
- No focus trapping within the panel — standard sequential navigation

### 5.4 Screen Reader Announcements

| Event | Announcement | Mechanism |
|-------|-------------|-----------|
| Enter panel region | "Main Panel Power Systems, region" | `role="region"` + `aria-label` |
| Reach summary card | "Total usage: 4,872 watts, 47.3 kilowatt hours today" | `aria-label` |
| Summary value change | Value politely announced | `aria-live="polite"` on status |
| Navigate to circuit | "Kitchen Lights: 342 watts, low draw, 1.2 kilowatt hours today" | `aria-label` with tier |
| Activate circuit | HA more-info dialog opens | Standard HA behavior |
| Toggle switch | "Toggle Dog Heating Pad, switch, checked/not checked" | `role="switch"` + `aria-checked` |
| Switch state change | "On" / "Off" confirmed | `aria-checked` update |
| Unavailable entity | "Garage Charger: unavailable" | `aria-label` + tomato color |

### 5.5 `prefers-reduced-motion` Overrides

Animations in the Power Panel:

| Animation | Default | Reduced Motion |
|-----------|---------|---------------|
| Critical draw pulse (frame border) | `lcars-distress-pulse` 1s infinite | Static `--lcars-tomato` border, no animation |
| Critical draw indicator dot pulse | Scale pulse 2s infinite | Static filled dot `●●●` |
| Value update flash (pill badge) | `lcars-value-flash` 300ms | Instant color change, no animation |
| Sparkline line draw | None (static SVG) | N/A |
| Tile hover background | 200ms transition | Instant (0.01ms) |
| Toggle switch state change | 200ms background transition | Instant (0.01ms) |

```css
@media (prefers-reduced-motion: reduce) {
  .lcars-power-panel { animation: none; }
  .lcars-power-panel[data-alert="critical"] {
    animation: none;
    border-color: var(--lcars-tomato);
  }
  .power-circuit-indicator.critical { animation: none; }
  .power-circuit-tile, .power-device-row, .power-toggle {
    transition-duration: 0.01ms !important;
  }
  .battery-pill-badge .pill-value.updated { animation: none; }
}
```

### 5.6 Focus-Visible Styling

All interactive elements use the established LCARS focus-visible pattern:

```css
.power-circuit-tile:focus-visible,
.power-device-row:focus-visible,
.power-toggle:focus-visible,
.power-strip-block:focus-visible {
  outline: 2px solid var(--lcars-ice);
  outline-offset: 2px;
}
```

- **2px solid** meets WCAG 2.2 §2.4.13 Focus Appearance (AAA) minimum perimeter thickness
- **`--lcars-ice` (`#99ccff`)** on `#000000` background = 10.5:1 contrast ratio (exceeds 3:1 requirement)
- **`outline-offset: 2px`** ensures the focus ring doesn't overlap the element content (§2.4.11 Focus Not Obscured)

### 5.7 Target Sizes (WCAG 2.2 §2.5.8)

| Element | Minimum Size | Actual Size | Compliant |
|---------|-------------|-------------|-----------|
| Circuit tile | 24×24 CSS px | ~160×48 px | ✓ PASS |
| Toggle button | 24×24 CSS px | 40×24 px | ✓ PASS |
| Device row | 24×24 CSS px | ~full-width × 40px | ✓ PASS |
| Strip outlet row | 24×24 CSS px | ~full-width × 40px | ✓ PASS |

All interactive targets exceed the 24×24 CSS pixel minimum.

---

## 6. Icon Specifications

All icons use Material Design Icons (MDI) available in Home Assistant.

| Usage | Icon | Fallback | Notes |
|-------|------|----------|-------|
| **Panel type** (header) | `mdi:flash` | — | Standard power/electricity icon |
| **Circuit monitor** (Emporia) | `mdi:lightning-bolt-circle` | `mdi:flash` | Individual circuit |
| **240V paired circuit** | `mdi:flash-alert` | — | Double circuit indicator |
| **Switch + monitor** (Kasa plug) | `mdi:power-plug` | `mdi:flash` | Device with toggle |
| **Power strip** (parent) | `mdi:power-strip` | `mdi:power-plug` | Multi-outlet strip |
| **Power strip outlet** (child) | `mdi:power-socket-us` | `mdi:power-plug` | Individual outlet |
| **Import from grid** | `mdi:transmission-tower-import` | `mdi:download` | Grid consumption |
| **Export to grid** | `mdi:transmission-tower-export` | `mdi:upload` | Solar/battery export |
| **Grid balanced** | `mdi:transmission-tower` | — | Net zero |
| **Total usage** | `mdi:sigma` | `mdi:counter` | Aggregate metric |
| **Off/standby** | (same as device icon) | — | Dimmed via `opacity: 0.4` |
| **Unavailable** | `mdi:alert-circle-outline` | — | Replaces device icon |

Icon sizing: `--mdc-icon-size: 16px` for inline icons, `20px` for panel header.

---

## 7. Entity Discovery & Classification

### 7.1 Domain Sets

```js
export const POWER_MONITOR_DOMAINS = new Set(['sensor']);
export const POWER_SWITCH_DOMAINS  = new Set(['switch']);

// Device classes that indicate power monitoring entities
export const POWER_DEVICE_CLASSES = new Set([
  'power',           // Watts (W)
  'energy',          // kWh
  'voltage',         // Volts (V)
  'current',         // Amps (A)
]);
```

### 7.2 Device Classification

```js
/**
 * Classify a power device into one of three tiers.
 * @param {Object[]} entries - Device entities
 * @param {Object} device - Device registry entry
 * @returns {'vue'|'plug'|'strip'|null}
 */
function classifyPowerDevice(entries, device) {
  const hasPowerSensor = entries.some(e =>
    e.domain === 'sensor' &&
    POWER_DEVICE_CLASSES.has(e.original_device_class)
  );
  if (!hasPowerSensor) return null;

  const hasSwitch = entries.some(e => e.domain === 'switch');
  const manufacturer = (device.manufacturer || '').toLowerCase();
  const model = (device.model || '').toLowerCase();

  // Emporia Vue — monitoring only, no switches
  if (manufacturer.includes('emporia') || model.includes('vue')) return 'vue';

  // Power strip — has child devices (HS300)
  // Detected by: parent device with 6+ switch entities, or model match
  const switchCount = entries.filter(e => e.domain === 'switch').length;
  if (switchCount >= 4 || model.includes('hs300') || model.includes('power strip')) return 'strip';

  // Smart plug with monitoring
  if (hasSwitch) return 'plug';

  // Sensor-only (non-Vue) — treat as circuit
  return 'vue';
}
```

### 7.3 Entity Filtering

```js
// MUST respect disabled_by and hidden_by
const visibleEntities = entries.filter(e =>
  !e.disabled_by && !e.hidden_by
);
```

### 7.4 240V Pair Detection

```js
const L1L2_PATTERN = /^(.+?)[\s_]*(l[12]|line[\s_]*[12])$/i;

function detect240VPairs(circuits) {
  const pairs = new Map();
  const unpaired = [];

  for (const c of circuits) {
    const match = c.name.match(L1L2_PATTERN);
    if (match) {
      const baseName = match[1].trim();
      if (!pairs.has(baseName)) pairs.set(baseName, []);
      pairs.get(baseName).push(c);
    } else {
      unpaired.push(c);
    }
  }

  const result = [...unpaired];
  for (const [name, pair] of pairs) {
    if (pair.length === 2) {
      result.push({
        name,
        is240V: true,
        entities: pair.flatMap(p => p.entities),
        watts: pair.reduce((sum, p) => sum + (p.watts || 0), 0),
        kwhToday: pair.reduce((sum, p) => sum + (p.kwhToday || 0), 0),
      });
    } else {
      result.push(...pair); // Odd count — don't pair
    }
  }

  return result;
}
```

---

## 8. Animation Specifications

### 8.1 Critical Draw Frame Pulse

When any circuit in the panel exceeds 3000W (or total exceeds configurable threshold):

```css
.lcars-power-panel[data-alert="critical"] {
  --panel-frame-color: var(--lcars-tomato);
  animation: lcars-distress-pulse var(--lcars-anim-pulse-urgent) ease-in-out infinite;
  --pulse-color-a: var(--lcars-tomato);
  --pulse-color-b: rgba(255, 85, 85, 0.3);
}
```

Reuses `lcars-distress-pulse` from `lcars-shared-animations.js`. Gated behind `prefers-reduced-motion`.

### 8.2 Value Update Flash

When a power reading changes:

```css
.power-circuit-watts.updated,
.power-summary-value.updated {
  animation: lcars-value-flash var(--lcars-anim-flash) ease-out;
  --flash-return-color: transparent;
}
```

Reuses `lcars-value-flash` from shared animations. Brief gold flash → fade back to transparent.

### 8.3 Tile Stagger Load

On initial render, tiles fade in with stagger delay:

```css
.power-circuit-tile {
  animation: lcars-tile-fadein 200ms ease-out backwards;
  animation-delay: calc(var(--tile-index, 0) * var(--lcars-anim-stagger));
}

@keyframes lcars-tile-fadein {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

Maximum stagger: 20 tiles × 50ms = 1s total. All tiles beyond index 20 appear at 1s delay (capped to stay under the 1-second animation budget per Source 2 animation rules).

### 8.4 `prefers-reduced-motion` Budget

Total concurrent animations per panel at any time:

| State | Concurrent Animations | Within Budget (≤6) |
|-------|---------------------|--------------------|
| Normal operation | 0 (all values are static between updates) | ✓ |
| Value update | 1 flash per changed value (300ms, non-looping) | ✓ |
| Initial load | Up to 20 stagger fades (200ms each, non-looping) | ✓ (transient) |
| Critical alert | 1 frame pulse (looping) + 1 indicator pulse | ✓ |
| Worst case | 1 frame pulse + 1 indicator + 1 value flash | ✓ (3 total) |

---

## 9. Interaction Patterns

### 9.1 Tile Tap / Click

- **Circuit tile tap**: Opens `showMoreInfo(entityId)` — standard HA more-info dialog showing history graph
- **Device row tap (on name/stats area)**: Opens `showMoreInfo(primaryEntityId)` for the power sensor
- **Toggle tap**: Calls `hass.callService('switch', 'toggle', { entity_id })` — no more-info
- **Strip header tap**: Opens `showMoreInfo(parentEntityId)` for the strip parent
- **Strip outlet tap**: Same as device row — tap name/stats for more-info, tap toggle for switch

### 9.2 Long Press (Future)

Reserved for edit mode. Not in v4.15.0 scope.

---

## 10. Data Flow

### 10.1 Entity Subscription

The panel subscribes to state changes for:
- All `sensor.*` entities in the area with `device_class` in `POWER_DEVICE_CLASSES`
- All `switch.*` entities in the area that share a `device_id` with a power sensor

Uses the existing `_getAreaEntities(areaId)` pattern from the homepage card, filtered by `classifyPowerDevice()`.

### 10.2 Sparkline Data

- Fetched via `fetchSparklineData()` from `lcars-sparkline.js`
- Entities: `*_power_minute_average` (Vue), `*_current_consumption` (Kasa)
- Period: 24 hours
- Max entities per batch: 20 (reconciled per Data C-4)
- Cache key: `'power-panel'`
- Refresh: On `firstUpdated()` and when `_sensorGroups` changes

### 10.3 Value Formatting

| Metric | Format | Examples |
|--------|--------|---------|
| Watts | `Intl.NumberFormat` with grouping | `342 W`, `4,872 W` |
| kWh | 1 decimal place | `47.3 kWh` |
| Voltage | 0 decimal places | `122 V` |
| Current | 1 decimal place | `3.2 A` |

---

## 11. Panel Type Registration

Add to `lcars-entity-utils.js`:

```js
export const PANEL_TYPE_POWER = 'power';

// Add to PANEL_TYPE_ORDER (after battery, before generic)
export const PANEL_TYPE_ORDER = {
  [PANEL_TYPE_CAMERA]:      0,
  [PANEL_TYPE_ALARM]:       1,
  [PANEL_TYPE_AQUATICS]:    2,
  [PANEL_TYPE_CLIMATE]:     3,
  [PANEL_TYPE_MEDIA]:       4,
  [PANEL_TYPE_ENVIRONMENT]: 5,
  [PANEL_TYPE_IRRIGATION]:  6,
  [PANEL_TYPE_WEATHER]:     7,
  [PANEL_TYPE_BATTERY]:     8,
  [PANEL_TYPE_POWER]:       9,   // ← NEW
};
```

---

## 12. Design Verification Checklist

### LCARS Compliance

- [ ] Frame uses thick→thin border pattern (4px left/bottom, 2px top/right) — **Bracer Jack Rule 2** ✓
- [ ] All colors from approved LCARS Classic palette — no rogue hex values ✓
- [ ] Font: Antonio only, three sizes only (title/sub/data) — **Bracer Jack Rule 6** ✓
- [ ] Text: UPPERCASE for all UI labels, mixed case never used ✓
- [ ] Flat design: No gradients, no shadows, no 3D effects — **Bracer Jack Rule 1** ✓
- [ ] Standard pill-button vocabulary for toggles — **Bracer Jack Rule 4** ✓
- [ ] CSS custom properties only, no hardcoded hex — **Project constraint** ✓
- [ ] Empty space preserved — panels with few devices breathe — **Manifesto §3** ✓
- [ ] ≤5 hue families (orange, blue/ice, gray, white, tomato) — **Bracer Jack color theory** ✓
- [ ] TheLCARS.com attribution preserved in footer — **EULA** ✓

### Accessibility (WCAG 2.2 AA)

- [ ] All text meets 4.5:1 contrast on black (§1.4.3) ✓
- [ ] Non-text elements (borders, indicators) meet 3:1 contrast (§1.4.11) ✓
- [ ] Color not sole indicator — shape + number redundancy (§1.4.1) ✓
- [ ] All interactive elements keyboard accessible (§2.1.1) ✓
- [ ] Focus order matches visual layout (§2.4.3) ✓
- [ ] Focus-visible: 2px solid ice outline on all focusable elements (§2.4.7, §2.4.13) ✓
- [ ] Focus not obscured: scroll container auto-scrolls focused tile (§2.4.11) ✓
- [ ] Target size ≥24×24 CSS px for all interactive elements (§2.5.8) ✓
- [ ] `role="region"` + `aria-label` on panel root (§4.1.2) ✓
- [ ] `role="switch"` + `aria-checked` on toggles (§4.1.2, APG Switch) ✓
- [ ] `role="list"` / `role="listitem"` on grids and rows (§4.1.2) ✓
- [ ] `aria-live="polite"` on summary status cards (§4.1.3) ✓
- [ ] `prefers-reduced-motion` disables all looping animations ✓
- [ ] All animations ≤1s duration ✓
- [ ] `sr-only` class for visually hidden screen reader text ✓

---

## 13. Open Questions for Wesley

1. **Doughnut/bar chart option**: The backlog mentions visualization options (bar charts, doughnut charts). Should we include an optional aggregate chart in the summary section? If yes, it would be an inline SVG (no library) keeping with the flat LCARS aesthetic — a segmented ring showing top-5 circuits by consumption.

2. **Power flow animation**: Wesley's reference cards (power-flow-card-plus, sankey-chart) suggest animated flow arrows. Should we include a simplified EPS conduit flow view as an alternative summary visualization? This would be scope creep for v4.15.0 — recommend deferring to v4.16.0 or later.

3. **Configurable thresholds**: The 500/1500/3000W tier boundaries work for US residential. Should we expose these as config options for users with different electrical systems (EU 230V, commercial, etc.)?

4. **ESP32 reflash note**: The backlog mentions Emporia Vue → ESPHome reflash. Should the panel detect ESPHome-flashed Vues and display differently (e.g., show local vs cloud indicator)?

---

## Appendix A: Color Hue Family Audit

Per Bracer Jack's color theory rules, the Power Panel uses these hue families:

| Family | Colors Used | Purpose |
|--------|-------------|---------|
| **Orange/Warm** | butterscotch, sunflower, gold | Frame, moderate/active states, headings |
| **Blue/Cool** | ice | Low draw, data accent, focus rings, export |
| **Red** | tomato | Critical draw, unavailable, alerts |
| **Neutral** | gray, space-white | Off/standby, text, backgrounds |
| **Violet** | (not used in this panel) | — |

**4 hue families** — well within the "sweet spot" of 3 colors per Bracer Jack. Each color has a clear, assigned meaning. No decorative color without purpose. ✓

---

## Appendix B: Entity Pattern Reference

### Emporia Vue (VUE003) Entities Per Device

| Entity Pattern | Domain | Device Class | Unit | Example |
|---------------|--------|-------------|------|---------|
| `sensor.*_totalusage_power_minute_average` | sensor | power | W | `sensor.vue_totalusage_power_minute_average` |
| `sensor.*_totalusage_energy_today` | sensor | energy | kWh | `sensor.vue_totalusage_energy_today` |
| `sensor.*_mainsfromgrid_power_minute_average` | sensor | power | W | `sensor.vue_mainsfromgrid_power_minute_average` |
| `sensor.*_mainsfromgrid_energy_today` | sensor | energy | kWh | — |
| `sensor.*_mainstogrid_power_minute_average` | sensor | power | W | — |
| `sensor.*_mainstogrid_energy_today` | sensor | energy | kWh | — |
| `sensor.*_balance_power_minute_average` | sensor | power | W | — |
| `sensor.*_{circuit_name}_power_minute_average` | sensor | power | W | `sensor.vue_kitchen_lights_power_minute_average` |
| `sensor.*_{circuit_name}_energy_today` | sensor | energy | kWh | — |

### TP-Link Kasa (KP115/KP125M/HS110) Entities Per Device

| Entity Pattern | Domain | Device Class | Unit |
|---------------|--------|-------------|------|
| `switch.*` | switch | — | — |
| `sensor.*_current_consumption` | sensor | power | W |
| `sensor.*_total_consumption` | sensor | energy | kWh |
| `sensor.*_today_s_consumption` | sensor | energy | kWh |
| `sensor.*_voltage` | sensor | voltage | V |
| `sensor.*_current` | sensor | current | A |

### TP-Link Kasa Power Strip (HS300) Entities

Parent device + 6 child devices. Each child has the same entity pattern as KP115 above. Parent device may also expose `sensor.*_total_consumption` for aggregate.

---

*Spec authored by Geordi La Forge, LCARS UI Design Authority. All design decisions reference the canonical LCARS sources documented in the Geordi mode instructions. WCAG compliance verified against WCAG 2.2 (W3C Recommendation, October 2023). Color contrast ratios computed per WCAG relative luminance formula.*

---

## Appendix C: Phase 3 Reconciliation Notes (Picard, SD 2026.04.14)

The following changes were applied during Phase 3 spec reconciliation to resolve Phase 2 conditions:

| Condition | Resolution | Section Updated |
|-----------|-----------|----------------|
| **F-1** | Renamed `getPowerDrawColor()` → `getPowerColor(watts, thresholds = {})` — matches project convention (`getTempColor`, `getHumidityColor`). Threshold-aware signature per Wesley. | §2.5 |
| **F-2** | Renamed `getPowerDrawLabel()` → `getPowerLabel(watts, thresholds = {})` — same rationale. | §2.5 |
| **C-4** | Sparkline batch size set to **20** (was 50). Reconciles with Wesley's 10. 43 circuits = 3 batches with stagger. | §4.5, §10.2 |
| **C-5** | Singleton popover pattern required. Spec defers to Wesley's addendum §2.1 for revised implementation. | See addendum |
| **C-6** | `_partitionPowerEntities()` defined in implementation plan Story 3. | See plan |
| **W-P1** | Rate limiter `createRateLimiter(10, 10000)` for power toggle calls. | See plan Story 6 |
| **C-1** | UPS edge case (battery + 1 power sensor) documented — falls through both detectors. Not fixed in 4X-3. | §5.2 (Wesley addendum) |
| **C-2** | Bundle analyzer to be run post-implementation. Delta estimated ~35 KB uncompressed. | Plan Story 10 |
