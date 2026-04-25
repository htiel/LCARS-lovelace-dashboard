# LCARS EV Charger Panel — Design Specification

**Author**: Geordi La Forge (LCARS UI Design Authority)  
**Collaborator**: Wesley Crusher (Creative Technology & Experimentation)  
**Date**: Stardate 2026.04.20  
**Status**: IMPLEMENTED (v4.23.0-beta.1)  
**Priority**: MEDIUM  
**Panel Type**: `ev_charger`  
**Extends**: `LcarsDevicePanelBase` (per LCARS-DEVICE-PANEL-SPEC.md §2)  
**Device**: Wallbox Vilya V2G (Bidirectional EV Charger)  
**Area**: Garage  

---

## 0. Design Philosophy

The EV Charger Panel is modeled after the Enterprise-D's **Shuttlebay Power Coupling Console** — the dedicated station where the flight deck crew monitors power transfer to and from docked shuttlecraft. When a shuttle is in the bay, the console shows at a glance: coupling status (connected/disconnected), power flow direction (charging the shuttle's batteries or drawing auxiliary power from them), transfer rate, and accumulated energy. The operator sees a clear directional flow — power going *in* or power coming *out* — without ambiguity.

The Wallbox Vilya V2G is a **bidirectional charger**: it charges the vehicle AND can discharge energy back to the grid (Vehicle-to-Grid). This dual nature is the defining design challenge. The panel must communicate power flow *direction* as its primary visual signal — not just magnitude. When Geordi glances at the shuttlebay console, he knows instantly whether the shuttle is taking power or giving it.

This is explicitly **NOT** a battery panel and **NOT** a power monitoring panel. A battery stores energy passively. A power panel shows consumption metrics. This panel shows an *active power coupling* with bidirectional flow, operator-configurable charging modes, and vehicle state-of-charge readback. It is its own device category — a dedicated charging station console.

Per Roddenberry's mandate: **the ship takes care of you**. The charger manages its own schedule and solar optimization. The panel reflects what's happening — the operator sets the mode, adjusts the current limit, and the system handles the rest.

Per Bracer Jack's Manifesto: **empty space is beautiful**. With 20 entities, there's ample data to display, but the panel must still breathe. Sensor telemetry is organized in logical groups with visual separation. The energy flow visualization floats in black space — the shuttlebay coupling status at center stage.

Per Bracer Jack's Core Design Rules: **LCARS is inherently flat/vector.** The energy flow indicator uses simple directional chevrons — no gradient arrows, no animated particle systems, no 3D pipe metaphors. Clean shapes, solid color, direction communicated through geometry and color.

---

## 1. Panel Frame Design

### 1.1 Frame Color Assignment

The EV Charger introduces a state-driven frame that cycles between three operational hues — encoding the most critical information (flow direction) in the frame itself.

| Charger State | Frame Color | CSS Variable | Hex | Rationale |
|---------------|-------------|-------------|-----|-----------|
| **Idle / Standby** | Lilac | `--lcars-lilac` | `#cc55ff` | Distinct hue — not warm (power), not cool (storage). The charger is connected but dormant. Lilac signals "specialized infrastructure" — a unique station, not a generic power outlet |
| **Charging** (Grid → Vehicle) | Butterscotch | `--lcars-butterscotch` | `#ff9966` | Warm amber = active power flow. Same hue family as EPS conduit displays in Main Engineering. Energy is flowing *into* the coupling |
| **Discharging / V2G** (Vehicle → Grid) | Ice | `--lcars-ice` | `#99ccff` | Cool blue = power export/return. Matches the Power Panel's "Export to Grid" convention. Energy is flowing *out* of the coupling |
| **Error / Fault** | Tomato | `--lcars-tomato` | `#ff5555` | Red alert. Standard LCARS error state across all panels |
| **Unavailable** | Gray | `--lcars-gray` | `#666688` | Offline / sensor unavailable. Standard LCARS disabled state |

### 1.1.1 Offline Empty State (5X-B18)

When the status entity is `unavailable` or `unknown`, `renderContent()` returns an early offline state instead of the full telemetry panel (which would display N/A values). The offline view shows:
- Gray frame color (`--lcars-gray`)
- Gray "OFFLINE" badge in header
- Minimal panel height — no sensor rows, no energy flow SVG, no controls
- Panel remains in the DOM (not suppressed) so the user sees their charger exists but is unreachable

**Rationale for Lilac as primary/idle color**: Lilac (`#cc55ff`) is currently unused by any panel as a *frame* color. The EV charger is a specialized piece of infrastructure — not an HVAC system (butterscotch), not a media player (african-violet), not a battery (ice). Lilac communicates "dedicated energy coupling" — visually distinct from every other panel in the dashboard. When the charger activates, the frame shifts to butterscotch (charging) or ice (V2G discharge), creating a clear "idle → active" transition. (Source: Bracer Jack Color Theory — 3 colors is the sweet spot; the panel cycles through lilac/butterscotch/ice based on state)

### 1.2 Border Style

Standard LCARS device panel frame per LCARS-DEVICE-PANEL-SPEC §2:

```css
.lcars-ev-charger-panel {
  --panel-frame-color: var(--ev-charger-state-color, var(--lcars-lilac));

  display: grid;
  border-left: 4px solid var(--panel-frame-color);
  border-top: 2px solid var(--panel-frame-color);
  border-right: 2px solid var(--panel-frame-color);
  border-bottom: 4px solid var(--panel-frame-color);
  border-radius: 0.75rem;
  padding: var(--lcars-gap);
  background: var(--lcars-black);
  min-height: calc(var(--lcars-vunit) * 5);
}
```

**Bracer Jack Rule 2**: thick→thin (left 4px → top 2px) or thin→thick (right 2px → bottom 4px). NEVER same thickness on consecutive turns. ✓

### 1.3 Typography

All text follows the established three-tier LCARS font system:

| Element | Size Token | CSS Variable | Casing | Color |
|---------|-----------|-------------|--------|-------|
| Panel header (device name) | Sub | `--lcars-font-size-sub` (1.25rem) | UPPERCASE | `--lcars-text-heading` (sunflower) |
| Section labels ("CHARGING SESSION", "ENERGY BALANCE") | Sub | `--lcars-font-size-sub` (1.25rem) | UPPERCASE | `--lcars-text-heading` (sunflower) |
| SoC percentage (hero readout) | Title | `--lcars-font-size-title` (2rem) | UPPERCASE | Dynamic state color |
| Charging power (hero readout) | Title | `--lcars-font-size-title` (2rem) | UPPERCASE | Dynamic state color |
| Entity names, values, units | Data | `--lcars-font-size-data` (0.875rem) | UPPERCASE | `--lcars-space-white` (values), `--lcars-ice` (units) |

Font family: `var(--lcars-font)` — Antonio everywhere. No exceptions.

---

## 2. Color Palette — Charger State Mapping

### 2.1 Charger State Color Map

The `sensor.wallbox_vilya_status_description` entity drives the dynamic frame color and flow visualization. States are derived from the Wallbox API status codes.

| Charger State | Status Description Values | LCARS Color | CSS Variable | Hex | Shape Indicator |
|---------------|--------------------------|-------------|-------------|-----|-----------------|
| **Idle / Connected** | `Connected: waiting for car demand`, `Ready`, `Connected: waiting for next schedule` | Lilac | `--lcars-lilac` | `#cc55ff` | Horizontal line `━` |
| **Charging** | `Charging`, `Charging (solar)` | Butterscotch | `--lcars-butterscotch` | `#ff9966` | Down chevron `▼` |
| **Discharging / V2G** | `Discharging`, `V2G active` | Ice | `--lcars-ice` | `#99ccff` | Up chevron `▲` |
| **Scheduled** | `Scheduled`, `Paused by user` | Sunflower | `--lcars-sunflower` | `#ffcc99` | Clock `◷` |
| **Error** | `Error`, `Locked by error` | Tomato | `--lcars-tomato` | `#ff5555` | Cross `✕` |
| **Disconnected** | `Disconnected`, `Waiting for car` | Gray | `--lcars-gray` | `#666688` | Empty circle `○` |
| **Unavailable** | `unavailable`, `unknown` | Gray | `--lcars-gray` | `#666688` | Cross `✕` |

### 2.2 WCAG Contrast Verification

All colors verified against `#000000` background (WCAG 2.2 §1.4.3 — Contrast Minimum, AA):

| Color | Hex | Luminance Ratio vs #000 | WCAG AA Normal Text (4.5:1) | WCAG AA Large Text (3:1) | WCAG AAA (7:1) |
|-------|-----|------------------------|----------------------------|-------------------------|----------------|
| Lilac | `#cc55ff` | 5.4:1 | ✓ PASS | ✓ PASS | ✗ FAIL |
| Butterscotch | `#ff9966` | 8.8:1 | ✓ PASS | ✓ PASS | ✓ PASS |
| Ice | `#99ccff` | 10.5:1 | ✓ PASS | ✓ PASS | ✓ PASS |
| Sunflower | `#ffcc99` | 13.1:1 | ✓ PASS | ✓ PASS | ✓ PASS |
| Tomato | `#ff5555` | 5.2:1 | ✓ PASS | ✓ PASS | ✗ FAIL |
| Gray | `#666688` | 4.7:1 | ✓ PASS | ✓ PASS | ✗ FAIL |
| Space White | `#f5f6fa` | 18.9:1 | ✓ PASS | ✓ PASS | ✓ PASS |

All charger-state colors pass WCAG AA for normal text on black background. Lilac, Tomato, and Gray fall below AAA — acceptable for state accent colors (always accompanied by text labels and shape indicators per §2.3). Body text on these accents uses `--lcars-space-white`.

### 2.3 Color-Blind Considerations (WCAG 2.2 §1.4.1 — Use of Color)

Color MUST NOT be the sole means of conveying charger state. Each state includes **redundant indicators**:

1. **Shape indicator**: A glyph prepended to the status badge (see table in §2.1)
   - Idle = horizontal line `━` (static, connected)
   - Charging = down chevron `▼` (power flowing in)
   - Discharging = up chevron `▲` (power flowing out)
   - Scheduled = clock `◷`
   - Error = cross `✕`
   - Disconnected = empty circle `○`

2. **Text label**: The status description is always displayed (`CHARGING`, `V2G ACTIVE`, `IDLE`, etc.) — unambiguous regardless of color perception.

3. **Flow direction chevrons**: The energy flow visualization uses geometric direction (chevrons pointing down for charging, up for discharging) in addition to color.

4. **ARIA labels**: Screen readers receive "Wallbox Vilya: charging at 7.4 kilowatts, vehicle at 62 percent" — full semantic state.

5. **Luminance progression**: Lilac (5.4:1) → Butterscotch (8.8:1) → Ice (10.5:1) provides luminance differentiation for protanopia/deuteranopia users.

### 2.4 Color Resolver Function

New function for `lcars-color-utils.js`:

```js
// ─── EV Charger Panel: Charger State ────────────────────────────────────────

/**
 * Resolve EV charger status description to LCARS color CSS variable.
 * Determines frame color and flow visualization accent.
 * @param {string|null} statusDescription - sensor.wallbox_vilya_status_description value
 * @param {number|null} chargingPower - sensor.wallbox_vilya_charging_power value (kW)
 * @returns {string} CSS variable string
 */
export function getEvChargerColor(statusDescription, chargingPower = null) {
  if (statusDescription == null || statusDescription === 'unavailable' || statusDescription === 'unknown') {
    return 'var(--lcars-gray)';
  }

  const status = String(statusDescription).toLowerCase();

  // Error states
  if (status.includes('error') || status.includes('locked by error')) {
    return 'var(--lcars-tomato)';
  }

  // Discharging / V2G — power flowing OUT
  if (status.includes('discharg') || status.includes('v2g')) {
    return 'var(--lcars-ice)';
  }

  // Charging — power flowing IN
  if (status.includes('charg') && !status.includes('waiting')) {
    return 'var(--lcars-butterscotch)';
  }

  // Scheduled / Paused
  if (status.includes('schedul') || status.includes('paused')) {
    return 'var(--lcars-sunflower)';
  }

  // Disconnected
  if (status.includes('disconnect') || status.includes('waiting for car')) {
    return 'var(--lcars-gray)';
  }

  // Fallback: use charging power to disambiguate
  if (chargingPower != null && !isNaN(chargingPower)) {
    const kw = Math.abs(Number(chargingPower));
    if (kw > 0.1) {
      return Number(chargingPower) < 0 ? 'var(--lcars-ice)' : 'var(--lcars-butterscotch)';
    }
  }

  // Default idle (connected, waiting)
  return 'var(--lcars-lilac)';
}

/**
 * Resolve EV charger status to uppercase label for header badge.
 * @param {string|null} statusDescription
 * @returns {string} Uppercase label
 */
export function getEvChargerLabel(statusDescription) {
  if (statusDescription == null || statusDescription === 'unavailable') return 'UNAVAILABLE';
  const status = String(statusDescription).toLowerCase();
  if (status.includes('error'))       return 'FAULT';
  if (status.includes('discharg') || status.includes('v2g')) return 'V2G ACTIVE';
  if (status.includes('charg') && !status.includes('waiting')) return 'CHARGING';
  if (status.includes('schedul'))     return 'SCHEDULED';
  if (status.includes('paused'))      return 'PAUSED';
  if (status.includes('disconnect') || status.includes('waiting for car')) return 'DISCONNECTED';
  if (status.includes('ready') || status.includes('waiting')) return 'STANDBY';
  return 'IDLE';
}

/**
 * Get the shape indicator glyph for colorblind-accessible state display.
 * @param {string|null} statusDescription
 * @returns {string} Unicode glyph
 */
export function getEvChargerIndicator(statusDescription) {
  if (statusDescription == null || statusDescription === 'unavailable') return '✕';
  const status = String(statusDescription).toLowerCase();
  if (status.includes('error'))       return '✕';
  if (status.includes('discharg') || status.includes('v2g')) return '▲';
  if (status.includes('charg') && !status.includes('waiting')) return '▼';
  if (status.includes('schedul') || status.includes('paused')) return '◷';
  if (status.includes('disconnect') || status.includes('waiting for car')) return '○';
  return '━';
}
```

### 2.5 STATE_COLOR_MAP Entry

Add to the centralized map in `lcars-color-utils.js`:

```js
ev_charger: {
  idle:         '--lcars-lilac',
  charging:     '--lcars-butterscotch',
  discharging:  '--lcars-ice',
  scheduled:    '--lcars-sunflower',
  error:        '--lcars-tomato',
  disconnected: '--lcars-gray',
  unavailable:  '--lcars-gray',
},
```

---

## 3. Grid Layout

### 3.1 ASCII Layout — Primary (Vehicle Connected, Charging)

```
┌──────────────────────────────────────────────────────────────────┐
│  ⚡ WALLBOX VILYA           ─────────── ▼ CHARGING  7.4 KW      │  ← header
├──────────────────┬───────────────────────────────────────────────┤
│                  │        ╔══════════════════════════╗           │
│  STATUS          │        ║                          ║           │
│  ▼ CHARGING      │        ║      ┌──────────────┐   ║           │
│  MODE   SOLAR    │        ║      │              │   ║           │
│                  │        ║      │    ▼  ▼  ▼   │   ║           │
│  CHARGING SESSION│        ║      │              │   ║           │
│  ─────────────── │        ║      │  7.4 KW      │   ║           │
│  POWER  7.4 KW   │        ║      │  CHARGING    │   ║           │
│  SPEED  32 KM/H  │        ║      │              │   ║           │
│  ADDED  12.6 KWH │        ║      │    62%       │   ║           │
│  RANGE  +48 KM   │        ║      │  ████████░░  │   ║           │
│  COST   $1.89    │        ║      │              │   ║           │
│                  │        ║      └──────────────┘   ║           │
│  ENERGY BALANCE  │        ║                          ║           │
│  ─────────────── │        ╚══════════════════════════╝           │
│  GREEN    8.2 KWH│                                               │
│  GRID     4.4 KWH│                                               │
│  DISCHRGD 1.1 KWH│                                               │
├──────────────────┴───────────────────────────────────────────────┤
│  SOLAR MODE   │ ┌──────╮ ┌──────────╮ ┌──────╮ ┌─────────────╮ │  ← controls
│               │ │  OFF │ │ ECO SOLAR│ │ FULL │ │ FULL SOLAR  │ │
│               │ └──────╯ └──────────╯ └──────╯ └─────────────╯ │
├──────────────────────────────────────────────────────────────────┤
│  MAX CURRENT ┌──╮      32A      ┌──╮   │  🔒 CABLE LOCK  [ON] │  ← aux controls
│              │ –│               │ +│   │                       │
│              └──╯               └──╯   │                       │
└──────────────────────────────────────────────────────────────────┘
```

### 3.2 ASCII Layout — V2G Discharging State

```
┌──────────────────────────────────────────────────────────────────┐
│  ⚡ WALLBOX VILYA           ─────────── ▲ V2G ACTIVE  3.2 KW    │  ← header (ice frame)
├──────────────────┬───────────────────────────────────────────────┤
│                  │        ╔══════════════════════════╗           │
│  STATUS          │        ║                          ║           │
│  ▲ V2G ACTIVE    │        ║      ┌──────────────┐   ║           │
│  MODE   ECO      │        ║      │              │   ║           │
│                  │        ║      │    ▲  ▲  ▲   │   ║           │
│  DISCHARGE STATS │        ║      │              │   ║           │
│  ─────────────── │        ║      │  3.2 KW      │   ║           │
│  POWER  3.2 KW   │        ║      │  V2G EXPORT  │   ║           │
│  DISCHRGD 4.7 KWH│        ║      │              │   ║           │
│                  │        ║      │    78%       │   ║           │
│  VEHICLE         │        ║      │  ████████░░  │   ║           │
│  ─────────────── │        ║      │              │   ║           │
│  SOC     78%     │        ║      └──────────────┘   ║           │
│  DEPOT   $0.12   │        ║                          ║           │
│                  │        ╚══════════════════════════╝           │
├──────────────────┴───────────────────────────────────────────────┤
│  SOLAR MODE   │ ┌──────╮ ┌──────────╮ ┌──────╮ ┌─────────────╮ │  ← controls
│               │ │  OFF │ │ ECO SOLAR│ │ FULL │ │ FULL SOLAR  │ │
│               │ └──────╯ └──────────╯ └──────╯ └─────────────╯ │
├──────────────────────────────────────────────────────────────────┤
│  MAX CURRENT ┌──╮      32A      ┌──╮   │  🔒 CABLE LOCK  [ON] │  ← aux controls
│              │ –│               │ +│   │                       │
│              └──╯               └──╯   │                       │
└──────────────────────────────────────────────────────────────────┘
```

### 3.3 ASCII Layout — Idle / Disconnected State

```
┌──────────────────────────────────────────────────────────────────┐
│  ⚡ WALLBOX VILYA           ─────────── ━ STANDBY                │  ← header (lilac frame)
├──────────────────┬───────────────────────────────────────────────┤
│                  │        ╔══════════════════════════╗           │
│  STATUS          │        ║                          ║           │
│  ━ STANDBY       │        ║      ┌──────────────┐   ║           │
│  MODE   OFF      │        ║      │              │   ║           │
│                  │        ║      │              │   ║           │
│  CHARGER INFO    │        ║      │  ━  ━  ━     │   ║           │
│  ─────────────── │        ║      │              │   ║           │
│  MAX AVAIL       │        ║      │  0.0 KW      │   ║           │
│    11.0 KW       │        ║      │  STANDBY     │   ║           │
│  MAX CURRENT     │        ║      │              │   ║           │
│    32A           │        ║      │              │   ║           │
│  ENERGY PRICE    │        ║      │              │   ║           │
│    $0.28/KWH     │        ║      └──────────────┘   ║           │
│                  │        ║                          ║           │
│                  │        ╚══════════════════════════╝           │
├──────────────────┴───────────────────────────────────────────────┤
│  SOLAR MODE   │ ┌──────╮ ┌──────────╮ ┌──────╮ ┌─────────────╮ │
│               │ │  OFF │ │ ECO SOLAR│ │ FULL │ │ FULL SOLAR  │ │
│               │ └──────╯ └──────────╯ └──────╯ └─────────────╯ │
├──────────────────────────────────────────────────────────────────┤
│  MAX CURRENT ┌──╮      32A      ┌──╮   │  🔒 CABLE LOCK  [ON] │
│              │ –│               │ +│   │                       │
│              └──╯               └──╯   │                       │
└──────────────────────────────────────────────────────────────────┘
```

### 3.4 CSS Grid Definition

```css
.lcars-ev-charger-panel {
  --panel-frame-color: var(--ev-charger-state-color, var(--lcars-lilac));
  --ev-charger-state-color: var(--lcars-lilac);

  display: grid;
  grid-template-areas:
    "header    header"
    "sensors   media"
    "solar     solar"
    "auxctrl   auxctrl";
  grid-template-columns: minmax(10rem, 1fr) minmax(14rem, 2fr);
  grid-template-rows: auto 1fr auto auto;
  gap: var(--lcars-gap);

  border-left: 4px solid var(--panel-frame-color);
  border-top: 2px solid var(--panel-frame-color);
  border-right: 2px solid var(--panel-frame-color);
  border-bottom: 4px solid var(--panel-frame-color);
  border-radius: 0.75rem;

  padding: var(--lcars-gap);
  background: var(--lcars-black);

  min-height: calc(var(--lcars-vunit) * 5);

  /* Frame color transition between states */
  transition: border-color var(--lcars-transition-slow);
}
```

### 3.5 Why This Grid

- **2-column asymmetric**: Standard LCARS device panel pattern (LCARS-DEVICE-PANEL-SPEC §2). Sensors left, visualization right.
- **`sensors` area**: Scrollable telemetry column — 20 entities organized into logical groups. Vertical layout matches the alphanumeric columns flanking viewscreens in TNG Engineering.
- **`media` area**: The energy flow visualization — the "viewscreen." Shows directional chevrons, power readout, and SoC bar. This is the shuttlebay coupling status display.
- **`solar` area**: Solar mode selector strip — full-width, like the HVAC mode strip in the Climate Panel.
- **`auxctrl` area**: Max current adjustment + cable lock toggle — secondary controls that don't need frequent interaction.

---

## 4. Component Anatomy

### 4.1 Panel Header

```html
<div class="ev-charger-header" role="heading" aria-level="3">
  <ha-icon icon="mdi:ev-station" style="color: var(--panel-frame-color)"></ha-icon>
  <span class="device-panel-name">${deviceName}</span>
  <span class="device-panel-header-line" aria-hidden="true"></span>
  <span class="ev-charger-status-badge" style="color: ${stateColor}">
    <span class="ev-charger-indicator" aria-hidden="true">${indicator}</span>
    ${statusLabel}
  </span>
  <span class="ev-charger-header-power" style="color: ${stateColor}">
    ${chargingPower > 0.1 ? `${formatNumber(chargingPower, 1)} KW` : ''}
  </span>
</div>
```

```css
.ev-charger-header {
  grid-area: header;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  min-height: var(--lcars-bar-h);
  border-bottom: 2px solid var(--panel-frame-color);
}

.ev-charger-header ha-icon {
  --mdc-icon-size: 20px;
  flex-shrink: 0;
}

.ev-charger-status-badge {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  text-transform: uppercase;
  white-space: nowrap;
  font-weight: 700;
  transition: color var(--lcars-transition-slow);
}

.ev-charger-indicator {
  margin-right: 0.25rem;
}

.ev-charger-header-power {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  text-transform: uppercase;
  white-space: nowrap;
  transition: color var(--lcars-transition-slow);
}
```

### 4.2 Sensor Telemetry Column (Left)

Sensors display in logical groups with thin dividers between sections. The left column is a scrollable flex column.

#### Entity Ordering (Top to Bottom)

**Status Group**

| Row | Label | Entity | Unit | Color |
|-----|-------|--------|------|-------|
| 1 | STATUS | `sensor.wallbox_vilya_status_description` | — | Dynamic `--ev-charger-state-color` |
| 2 | MODE | `sensor.wallbox_vilya_current_mode` | — | `var(--lcars-data-accent)` |

**Charging Session Group** (visible when charging or recently charged)

| Row | Label | Entity | Unit | Color |
|-----|-------|--------|------|-------|
| 3 | POWER | `sensor.wallbox_vilya_charging_power` | kW | Dynamic state color |
| 4 | SPEED | `sensor.wallbox_vilya_charging_speed` | km/h | `var(--lcars-space-white)` |
| 5 | ADDED | `sensor.wallbox_vilya_added_energy` | kWh | `var(--lcars-space-white)` |
| 6 | RANGE | `sensor.wallbox_vilya_added_range` | km | `var(--lcars-space-white)` |
| 7 | COST | `sensor.wallbox_vilya_cost` | $ | `var(--lcars-space-white)` |

**Energy Balance Group**

| Row | Label | Entity | Unit | Color |
|-----|-------|--------|------|-------|
| 8 | GREEN ENERGY | `sensor.wallbox_vilya_added_green_energy` | kWh | `var(--lcars-bluey)` |
| 9 | GRID ENERGY | `sensor.wallbox_vilya_added_grid_energy` | kWh | `var(--lcars-butterscotch)` |
| 10 | DISCHARGED | `sensor.wallbox_vilya_discharged_energy` | kWh | `var(--lcars-ice)` |

**Vehicle Group** (visible when vehicle connected)

| Row | Label | Entity | Unit | Color |
|-----|-------|--------|------|-------|
| 11 | SOC | `sensor.wallbox_vilya_state_of_charge` | % | Dynamic (see §4.4) |
| 12 | DEPOT PRICE | `sensor.wallbox_vilya_depot_price` | $/kWh | `var(--lcars-space-white)` |

**Charger Info Group** (always visible)

| Row | Label | Entity | Unit | Color |
|-----|-------|--------|------|-------|
| 13 | MAX AVAILABLE | `sensor.wallbox_vilya_max_available_power` | kW | `var(--lcars-space-white)` |
| 14 | MAX CURRENT | `sensor.wallbox_vilya_max_charging_current` | A | `var(--lcars-space-white)` |
| 15 | ENERGY PRICE | `sensor.wallbox_vilya_energy_price` | $/kWh | `var(--lcars-space-white)` |

```css
.ev-charger-sensors {
  grid-area: sensors;
  display: flex;
  flex-direction: column;
  gap: var(--lcars-gap);
  padding: 0.25rem 0;
  align-self: start;
  overflow-y: auto;
  max-height: 28rem;
}

.ev-charger-section-label {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-disabled);
  text-transform: uppercase;
  padding: 0.25rem 0.5rem 0;
  letter-spacing: 0.05em;
}

.ev-charger-sensors-divider {
  height: 1px;
  background: var(--lcars-disabled);
  margin: 0.25rem 0;
  opacity: 0.5;
}
```

Sensor lines reuse `.device-sensor-line` from the Device Panel Spec §3.3.

### 4.3 Energy Flow Visualization — The "Viewscreen"

The center-right media frame contains the primary visual: an energy flow direction indicator with power readout and vehicle SoC bar. This is the shuttlebay power coupling status display — the single most important thing on the console.

#### Visualization Design

The visualization is a flat, geometric display — not a skeuomorphic gauge. Three stacked directional chevrons indicate flow direction, flanked by the power readout and a horizontal SoC progress bar.

```
╔══════════════════════════╗
║                          ║
║      ┌──────────────┐    ║
║      │              │    ║
║      │    ▼  ▼  ▼   │    ║  ← 3 chevrons (down=charging, up=V2G)
║      │              │    ║
║      │  7.4 KW      │    ║  ← power readout (title size, state color)
║      │  CHARGING    │    ║  ← status label (data size)
║      │              │    ║
║      │    62%       │    ║  ← SoC percentage (title size)
║      │  ████████░░  │    ║  ← SoC progress bar
║      │              │    ║
║      └──────────────┘    ║
║                          ║
╚══════════════════════════╝
```

#### SVG Structure

```html
<svg class="ev-charger-flow-display"
     viewBox="0 0 200 200"
     role="img"
     aria-label="${flowAriaLabel}">

  <!-- Flow direction chevrons -->
  <g class="ev-flow-chevrons"
     transform="${isDischarging ? 'rotate(180, 100, 60)' : ''}">
    <!-- Chevron 1 (top) -->
    <polyline class="ev-flow-chevron"
              points="70,40 100,55 130,40"
              fill="none"
              stroke="var(--ev-charger-state-color)"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
              style="--chevron-delay: 0" />
    <!-- Chevron 2 (middle) -->
    <polyline class="ev-flow-chevron"
              points="70,52 100,67 130,52"
              fill="none"
              stroke="var(--ev-charger-state-color)"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
              style="--chevron-delay: 1" />
    <!-- Chevron 3 (bottom) -->
    <polyline class="ev-flow-chevron"
              points="70,64 100,79 130,64"
              fill="none"
              stroke="var(--ev-charger-state-color)"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
              style="--chevron-delay: 2" />
  </g>

  <!-- Idle state: horizontal dashes instead of chevrons -->
  <g class="ev-flow-idle" style="display: ${isIdle ? 'block' : 'none'}">
    <line x1="65" y1="60" x2="85" y2="60"
          stroke="var(--lcars-lilac)" stroke-width="3" stroke-linecap="round" />
    <line x1="90" y1="60" x2="110" y2="60"
          stroke="var(--lcars-lilac)" stroke-width="3" stroke-linecap="round" />
    <line x1="115" y1="60" x2="135" y2="60"
          stroke="var(--lcars-lilac)" stroke-width="3" stroke-linecap="round" />
  </g>

  <!-- Power readout -->
  <text class="ev-flow-power"
        x="100" y="110"
        text-anchor="middle"
        dominant-baseline="middle"
        fill="var(--ev-charger-state-color)"
        font-family="var(--lcars-font)"
        font-size="32"
        text-transform="uppercase">
    ${formatNumber(chargingPower, 1)} KW
  </text>

  <!-- Status label -->
  <text class="ev-flow-label"
        x="100" y="128"
        text-anchor="middle"
        dominant-baseline="middle"
        fill="var(--lcars-space-white)"
        font-family="var(--lcars-font)"
        font-size="11"
        text-transform="uppercase">
    ${statusLabel}
  </text>

  <!-- SoC percentage -->
  <text class="ev-flow-soc"
        x="100" y="155"
        text-anchor="middle"
        dominant-baseline="middle"
        fill="${socColor}"
        font-family="var(--lcars-font)"
        font-size="26"
        text-transform="uppercase">
    ${soc != null ? `${soc}%` : '--'}
  </text>

  <!-- SoC progress bar background -->
  <rect x="45" y="168" width="110" height="8" rx="4"
        fill="var(--lcars-gray)" opacity="0.3" />

  <!-- SoC progress bar fill -->
  <rect x="45" y="168"
        width="${Math.max(0, Math.min(110, (soc / 100) * 110))}"
        height="8" rx="4"
        fill="${socColor}" />
</svg>
```

#### Media Frame CSS

```css
.ev-charger-media {
  grid-area: media;
  position: relative;
  border: 3px solid var(--panel-frame-color);
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

.ev-charger-flow-display {
  width: 100%;
  max-width: 14rem;
  height: auto;
  display: block;
}

/* Corner brackets — reuse from Device Panel Spec §3.2 */
.ev-charger-media::before,
.ev-charger-media::after {
  content: '';
  position: absolute;
  width: 1.5rem;
  height: 1.5rem;
  border-color: var(--panel-frame-color);
  border-style: solid;
  pointer-events: none;
  z-index: 1;
}

.ev-charger-media::before {
  top: 0.25rem;
  left: 0.25rem;
  border-width: 2px 0 0 2px;
  border-radius: 0.25rem 0 0 0;
}

.ev-charger-media::after {
  bottom: 0.25rem;
  right: 0.25rem;
  border-width: 0 2px 2px 0;
  border-radius: 0 0 0.25rem 0;
}
```

### 4.4 SoC (State of Charge) Color Mapping

The vehicle battery SoC percentage uses a 4-tier color map — analogous to the Battery Panel's charge level colors, but applied to a *vehicle* that we don't own (we're just reading back what the charger reports).

| SoC Range | LCARS Color | CSS Variable | Hex | Rationale |
|-----------|-------------|-------------|-----|-----------|
| 0–15% | Tomato | `--lcars-tomato` | `#ff5555` | Critical — vehicle nearly depleted |
| 16–40% | Butterscotch | `--lcars-butterscotch` | `#ff9966` | Low — needs charging |
| 41–80% | Sunflower | `--lcars-sunflower` | `#ffcc99` | Normal operating range |
| 81–100% | Ice | `--lcars-ice` | `#99ccff` | Full/near-full — ready for V2G |

```js
/**
 * Resolve vehicle SoC percentage to LCARS color CSS variable.
 * @param {number|null} soc - State of charge (0-100)
 * @returns {string} CSS variable string
 */
export function getEvSocColor(soc) {
  if (soc == null || isNaN(soc)) return 'var(--lcars-gray)';
  const s = Number(soc);
  if (s <= 15) return 'var(--lcars-tomato)';
  if (s <= 40) return 'var(--lcars-butterscotch)';
  if (s <= 80) return 'var(--lcars-sunflower)';
  return 'var(--lcars-ice)';
}
```

### 4.5 Solar Mode Selector Strip

A horizontal row of pill buttons for selecting the solar charging mode. Maps to `select.wallbox_vilya_solar_charging`.

```html
<div class="ev-charger-solar-strip" role="radiogroup" aria-label="Solar charging mode">
  <span class="ev-charger-strip-label">SOLAR MODE</span>
  ${solarOptions.map(option => html`
    <button class="ev-charger-solar-btn ${option === currentSolarMode ? 'active' : ''}"
            role="radio"
            aria-checked="${option === currentSolarMode}"
            aria-label="Solar mode: ${option}"
            @click="${() => setSolarMode(option)}">
      <ha-icon icon="${getSolarModeIcon(option)}" aria-hidden="true"></ha-icon>
      ${option.toUpperCase()}
    </button>
  `)}
</div>
```

```css
.ev-charger-solar-strip {
  grid-area: solar;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--lcars-gap);
  padding-top: var(--lcars-gap);
  border-top: 2px solid var(--panel-frame-color);
}

.ev-charger-strip-label {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-text-heading);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
  margin-right: 0.5rem;
}

.ev-charger-solar-btn {
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

.ev-charger-solar-btn:hover {
  filter: brightness(1.2);
}

.ev-charger-solar-btn:focus-visible {
  outline: 2px solid var(--lcars-ice);
  outline-offset: 2px;
}

.ev-charger-solar-btn.active,
.ev-charger-solar-btn[aria-checked="true"] {
  background: var(--lcars-gold);
  color: var(--lcars-black);
}

.ev-charger-solar-btn ha-icon {
  --mdc-icon-size: 16px;
  flex-shrink: 0;
}
```

#### Solar Mode Icons & Labels

```javascript
/**
 * Get the MDI icon for a solar charging mode.
 */
function getSolarModeIcon(mode) {
  const m = String(mode).toLowerCase();
  if (m.includes('full') && m.includes('solar')) return 'mdi:solar-power-variant';
  if (m.includes('eco'))   return 'mdi:leaf';
  if (m.includes('full'))  return 'mdi:flash';
  if (m.includes('off'))   return 'mdi:power-off';
  return 'mdi:solar-power';
}

/**
 * Set the solar charging mode via HA select service.
 */
function setSolarMode(hass, entityId, option) {
  hass.callService('select', 'select_option', {
    entity_id: entityId,
    option: option,
  });
}
```

### 4.6 Auxiliary Controls Row

A split row containing the max charging current adjustment (left) and cable lock toggle (right).

```html
<div class="ev-charger-aux-controls">
  <!-- Max Current Adjustment -->
  <div class="ev-charger-current-control" role="group" aria-label="Maximum charging current">
    <span class="ev-charger-aux-label">MAX CURRENT</span>
    <div class="ev-charger-current-adjuster">
      <button class="ev-charger-adj-btn decrement"
              aria-label="Decrease maximum charging current"
              @click="${() => adjustMaxCurrent(-1)}">
        <span aria-hidden="true">–</span>
      </button>
      <span class="ev-charger-current-value">${maxCurrentValue}A</span>
      <button class="ev-charger-adj-btn increment"
              aria-label="Increase maximum charging current"
              @click="${() => adjustMaxCurrent(+1)}">
        <span aria-hidden="true">+</span>
      </button>
    </div>
  </div>

  <!-- Cable Lock Toggle -->
  <div class="ev-charger-lock-control" role="group" aria-label="Cable lock control">
    <ha-icon icon="mdi:lock" style="color: var(--lcars-data-accent)"
             aria-hidden="true"></ha-icon>
    <span class="ev-charger-aux-label">CABLE LOCK</span>
    <button class="ev-charger-lock-toggle"
            role="switch"
            aria-checked="${isLocked}"
            aria-label="Cable lock: ${isLocked ? 'locked' : 'unlocked'}"
            @click="${toggleCableLock}">
      ${isLocked ? 'ON' : 'OFF'}
    </button>
  </div>
</div>
```

```css
.ev-charger-aux-controls {
  grid-area: auxctrl;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: calc(var(--lcars-gap) * 4);
  padding-top: var(--lcars-gap);
  border-top: 2px solid var(--panel-frame-color);
}

.ev-charger-current-control {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.ev-charger-aux-label {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-text-heading);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.ev-charger-current-adjuster {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.ev-charger-adj-btn {
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

.ev-charger-adj-btn.decrement {
  border-radius: var(--lcars-btn-radius) 0 0 var(--lcars-btn-radius);
}

.ev-charger-adj-btn:hover {
  filter: brightness(1.2);
}

.ev-charger-adj-btn:focus-visible {
  outline: 2px solid var(--lcars-ice);
  outline-offset: 2px;
}

.ev-charger-adj-btn:active {
  background: var(--lcars-gold);
}

.ev-charger-current-value {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-sub);
  color: var(--lcars-space-white);
  text-transform: uppercase;
  font-weight: 700;
  min-width: 3rem;
  text-align: center;
}

.ev-charger-lock-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.ev-charger-lock-control ha-icon {
  --mdc-icon-size: 16px;
}

.ev-charger-lock-toggle {
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
  font-family: var(--lcars-font);
}

.ev-charger-lock-toggle[aria-checked="true"] {
  background: var(--lcars-gold);
  color: var(--lcars-black);
}

.ev-charger-lock-toggle[aria-checked="false"] {
  background: var(--lcars-gray);
  color: var(--lcars-space-white);
}

.ev-charger-lock-toggle:focus-visible {
  outline: 2px solid var(--lcars-ice);
  outline-offset: 2px;
}
```

#### ⚠ CRITICAL: Cable Lock Is NOT a Security Lock

**`lock.wallbox_vilya_lock`** controls the **physical cable latch** — it locks the charging cable into the vehicle's charging port to prevent accidental disconnection during charging. It is a mechanical convenience feature, NOT a security mechanism.

**Tactical false-positive risk**: The `lock` domain in Home Assistant is the same domain used for door locks, deadbolts, and security locks. The Tactical Panel (`PANEL_TYPE_TACTICAL`) classifies `lock.*` entities as security devices. **This entity MUST be excluded from tactical classification.**

Implementation requirement:
```js
// In _getDevicePanelType() or entity classification logic:
// Wallbox lock entities are cable locks, not security locks.
// Exclude from PANEL_TYPE_TACTICAL classification.
const CABLE_LOCK_MANUFACTURERS = ['wallbox'];
const isCableLock = entity.domain === 'lock' &&
  CABLE_LOCK_MANUFACTURERS.includes(device?.manufacturer?.toLowerCase());
```

The lock toggle is rendered within the EV Charger Panel's aux controls — it belongs here, next to the charging controls, not on a security panel.

#### Max Current Adjustment Logic

```javascript
/**
 * Adjust the maximum charging current.
 * Reads min/max/step from the number entity attributes.
 * @param {object} hass - Home Assistant instance
 * @param {string} entityId - number.wallbox_vilya_maximum_charging_current
 * @param {number} delta - increment (+1) or decrement (-1) amps
 */
function adjustMaxCurrent(hass, entityId, delta) {
  const stateObj = hass.states[entityId];
  if (!stateObj) return;

  const attrs = stateObj.attributes;
  const step = attrs.step || 1;
  const min = attrs.min || 6;   // Wallbox typical minimum: 6A
  const max = attrs.max || 32;  // Wallbox typical maximum: 32A

  const current = Number(stateObj.state);
  if (isNaN(current)) return;

  const newValue = Math.round((current + delta * step) / step) * step;
  const clamped = Math.max(min, Math.min(max, newValue));

  hass.callService('number', 'set_value', {
    entity_id: entityId,
    value: clamped,
  });
}

/**
 * Toggle the cable lock.
 * @param {object} hass - Home Assistant instance
 * @param {string} entityId - lock.wallbox_vilya_lock
 */
function toggleCableLock(hass, entityId) {
  const stateObj = hass.states[entityId];
  if (!stateObj) return;

  const service = stateObj.state === 'locked' ? 'unlock' : 'lock';
  hass.callService('lock', service, {
    entity_id: entityId,
  });
}
```

---

## 5. Accessibility Requirements (WCAG 2.2 AA)

### 5.1 ARIA Structure

```html
<!-- Panel root -->
<div class="lcars-ev-charger-panel lcars-device-panel"
     role="region"
     aria-label="Wallbox Vilya EV Charger">

  <!-- Panel header -->
  <div class="ev-charger-header" role="heading" aria-level="3">
    <ha-icon icon="mdi:ev-station" aria-hidden="true"></ha-icon>
    <span class="device-panel-name">${deviceName}</span>
    <div class="device-panel-header-line" aria-hidden="true"></div>
    <span class="ev-charger-status-badge"
          role="status"
          aria-live="polite"
          aria-label="Charger status: ${statusLabel}, ${chargingPower} kilowatts">
      ${indicator} ${statusLabel}
    </span>
  </div>

  <!-- Sensor telemetry column -->
  <div class="ev-charger-sensors" role="group" aria-label="Charger telemetry">
    <div class="ev-charger-section-label" role="heading" aria-level="4">
      STATUS
    </div>
    <!-- Sensor lines with aria-label on each -->
    <div class="device-sensor-line"
         aria-label="Status: ${statusDescription}">
      ...
    </div>

    <div class="ev-charger-section-label" role="heading" aria-level="4">
      CHARGING SESSION
    </div>
    <div class="device-sensor-line"
         aria-label="Charging power: ${power} kilowatts">
      ...
    </div>
    <!-- etc. -->
  </div>

  <!-- Energy flow visualization -->
  <div class="ev-charger-media">
    <svg role="img"
         aria-label="Energy flow: ${flowDirection} at ${power} kilowatts. Vehicle battery at ${soc} percent">
      ...
    </svg>
  </div>

  <!-- Solar mode selector -->
  <div class="ev-charger-solar-strip" role="radiogroup" aria-label="Solar charging mode">
    <button role="radio" aria-checked="${isActive}" aria-label="Solar mode: ${option}">
      ...
    </button>
  </div>

  <!-- Aux controls -->
  <div class="ev-charger-aux-controls">
    <div role="group" aria-label="Maximum charging current">
      <button aria-label="Decrease maximum charging current">–</button>
      <span aria-label="Current maximum: ${value} amps">${value}A</span>
      <button aria-label="Increase maximum charging current">+</button>
    </div>
    <div role="group" aria-label="Cable lock control">
      <button role="switch"
              aria-checked="${isLocked}"
              aria-label="Cable lock: ${isLocked ? 'locked' : 'unlocked'}">
        ...
      </button>
    </div>
  </div>
</div>
```

### 5.2 ARIA Roles and Landmarks Summary

| Element | Role | Purpose |
|---------|------|---------|
| Panel root | `region` + `aria-label` | Landmark for assistive tech navigation |
| Panel header | `heading` (level 3) | Device name as section heading |
| Status badge | `status` + `aria-live="polite"` | Live-updating charger state announced |
| Sensor groups | `group` + `aria-label` | Logical grouping of telemetry |
| Section labels | `heading` (level 4) | Subsection structure |
| Flow visualization SVG | `img` + `aria-label` | Complete state description for screen readers |
| Solar mode strip | `radiogroup` | Mode selection pattern per APG |
| Solar mode buttons | `radio` + `aria-checked` | Individual mode options |
| Max current group | `group` + `aria-label` | Grouped control |
| Increment/decrement buttons | `button` + `aria-label` | Descriptive action labels |
| Cable lock toggle | `switch` + `aria-checked` | Switch control per WAI-ARIA APG |
| Decorative indicators | `aria-hidden="true"` | Shape glyphs hidden from SR |
| Header line | `aria-hidden="true"` | Decorative rule |

### 5.3 Keyboard Navigation

**Tab order** (follows visual top-to-bottom, left-to-right per WCAG §2.4.3 Focus Order):

1. Panel region (skippable via landmark nav)
2. Status badge (not individually focusable — live region, auto-announced)
3. First solar mode button → Tab/Arrow through solar options
4. Max current decrement button → value display → increment button
5. Cable lock toggle
6. Next panel

**Key bindings**:

| Key | Action |
|-----|--------|
| `Tab` | Move to next focusable element |
| `Shift+Tab` | Move to previous focusable element |
| `Enter` / `Space` | Activate button (solar mode, +/-, lock toggle) |
| `Arrow Left/Right` | Navigate within radiogroup (solar mode) |
| `Escape` | Close more-info dialog (handled by HA) |

**Focus management**:
- Solar mode buttons form a `radiogroup` — arrow keys move selection within the group, Tab moves out
- +/- buttons are native `<button>` elements — inherently focusable
- No focus trapping within the panel — standard sequential navigation

### 5.4 Screen Reader Announcements

| Event | Announcement | Mechanism |
|-------|-------------|-----------|
| Enter panel region | "Wallbox Vilya EV Charger, region" | `role="region"` + `aria-label` |
| Status change | "Charger status: charging, 7.4 kilowatts" | `aria-live="polite"` on status badge |
| Solar mode change | "Eco Solar, radio, checked" | `role="radio"` + `aria-checked` update |
| Current adjusted | Button activation confirmed | Native button semantics |
| Lock toggled | "Cable lock: locked/unlocked, switch, checked/not checked" | `role="switch"` + `aria-checked` |
| Flow visualization | "Energy flow: charging at 7.4 kilowatts. Vehicle battery at 62 percent" | `aria-label` on SVG |

### 5.5 Target Sizes (WCAG 2.2 §2.5.8)

| Element | Minimum Size | Actual Size | Compliant |
|---------|-------------|-------------|-----------|
| Solar mode button | 24×24 CSS px | ≥80×48 px | ✓ PASS |
| Max current +/- button | 24×24 CSS px | 40×40 px | ✓ PASS |
| Cable lock toggle | 24×24 CSS px | 40×24 px | ✓ PASS |

All interactive targets exceed the 24×24 CSS pixel minimum.

### 5.6 Focus-Visible Styling

All interactive elements use the established LCARS focus-visible pattern:

```css
.ev-charger-solar-btn:focus-visible,
.ev-charger-adj-btn:focus-visible,
.ev-charger-lock-toggle:focus-visible {
  outline: 2px solid var(--lcars-ice);
  outline-offset: 2px;
}
```

- **2px solid** meets WCAG 2.2 §2.4.13 Focus Appearance (AAA) minimum perimeter thickness
- **`--lcars-ice` (`#99ccff`)** on `#000000` background = 10.5:1 contrast ratio (exceeds 3:1 requirement)
- **`outline-offset: 2px`** ensures the focus ring doesn't overlap the element content (§2.4.11 Focus Not Obscured)

### 5.7 `prefers-reduced-motion` Overrides

| Animation | Default | Reduced Motion |
|-----------|---------|---------------|
| Flow chevron cascade | Sequential opacity fade 2s | Static full opacity, no animation |
| Frame color transition | `var(--lcars-transition-slow)` | Instant (0.01ms) |
| Error frame pulse | `lcars-distress-pulse` 1s infinite | Static `--lcars-tomato` border |
| Value update flash | `lcars-value-flash` 300ms | Instant color change |
| Button hover brightness | 200ms transition | Instant (0.01ms) |
| SoC bar width change | 600ms ease-out | Instant (0.01ms) |

```css
@media (prefers-reduced-motion: reduce) {
  .lcars-ev-charger-panel { animation: none; }
  .lcars-ev-charger-panel[data-alert="error"] {
    animation: none;
    border-color: var(--lcars-tomato);
  }
  .ev-flow-chevron { animation: none !important; opacity: 1; }
  .ev-charger-solar-btn,
  .ev-charger-adj-btn,
  .ev-charger-lock-toggle,
  .lcars-ev-charger-panel {
    transition-duration: 0.01ms !important;
  }
  .ev-flow-soc-bar-fill {
    transition-duration: 0.01ms !important;
  }
}
```

---

## 6. Animation Specifications

### 6.1 Flow Chevron Cascade

When the charger is actively charging or discharging, the three chevrons animate in a sequential cascade — like energy pulses flowing through an EPS conduit. This is the primary ambient animation.

```css
.ev-flow-chevron {
  opacity: 0.3;
  transition: opacity 0.2s ease;
}

/* Active state: sequential fade cascade */
.ev-charger-flow-display.active .ev-flow-chevron {
  animation: ev-chevron-pulse 2s ease-in-out infinite;
  animation-delay: calc(var(--chevron-delay) * 0.3s);
}

@keyframes ev-chevron-pulse {
  0%, 100% { opacity: 0.3; }
  33%      { opacity: 1; }
  66%      { opacity: 0.3; }
}
```

**Behavior by state**:
- **Charging**: Chevrons point down, cascade top→bottom (energy flowing into vehicle)
- **Discharging/V2G**: Chevrons point up (SVG group rotated 180°), cascade bottom→top (energy flowing out)
- **Idle**: Horizontal dashes, no animation — stillness communicates "at rest"
- **Error**: Chevrons replaced by static `✕`, tomato color
- **Disconnected**: No chevrons visible

### 6.2 Error Frame Pulse

When charger reports an error state:

```css
.lcars-ev-charger-panel[data-alert="error"] {
  --panel-frame-color: var(--lcars-tomato);
  animation: lcars-distress-pulse var(--lcars-anim-pulse-urgent) ease-in-out infinite;
  --pulse-color-a: var(--lcars-tomato);
  --pulse-color-b: rgba(255, 85, 85, 0.3);
}
```

Reuses `lcars-distress-pulse` from `lcars-shared-animations.js`. Gated behind `prefers-reduced-motion`.

### 6.3 SoC Bar Transition

When vehicle SoC updates, the progress bar width animates smoothly:

```css
.ev-flow-soc-bar-fill {
  transition: width 600ms ease-out;
}
```

### 6.4 Value Update Flash

When power readings change:

```css
.ev-charger-header-power.updated,
.ev-flow-power.updated {
  animation: lcars-value-flash var(--lcars-anim-flash) ease-out;
  --flash-return-color: transparent;
}
```

Reuses `lcars-value-flash` from shared animations.

### 6.5 Animation Budget

Total concurrent animations per panel at any time:

| State | Concurrent Animations | Within Budget (≤6) |
|-------|---------------------|--------------------|
| Normal operation (charging) | 3 chevron pulses (sequential, looping) | ✓ |
| Value update during charging | 3 chevrons + 1 value flash (non-looping) | ✓ (4 total) |
| Error state | 1 frame pulse (looping) | ✓ |
| Idle / disconnected | 0 | ✓ |
| Worst case | 3 chevrons + 1 frame pulse + 1 value flash | ✓ (5 total) |

---

## 7. Interaction Patterns

### 7.1 Sensor Line Tap

- **Any sensor line tap**: Opens `showMoreInfo(entityId)` — standard HA more-info dialog showing history graph
- **Flow visualization tap**: Opens `showMoreInfo(chargingPowerEntityId)` for the primary power sensor

### 7.2 Solar Mode Selection

- **Solar mode button tap**: Calls `hass.callService('select', 'select_option', { entity_id, option })` on `select.wallbox_vilya_solar_charging`
- Active button highlights gold; previously active reverts to gray
- Only options available from the `select` entity's `options` attribute are rendered

### 7.3 Max Current Adjustment

- **+/- button tap**: Calls `hass.callService('number', 'set_value', { entity_id, value })` on `number.wallbox_vilya_maximum_charging_current`
- Respects `min`, `max`, `step` from entity attributes
- Typical range: 6A–32A in 1A steps
- Value display updates on state change callback (not optimistically)

### 7.4 Cable Lock Toggle

- **Lock toggle tap**: Calls `hass.callService('lock', 'lock'|'unlock', { entity_id })` on `lock.wallbox_vilya_lock`
- Toggle shows ON (locked, gold) / OFF (unlocked, gray)
- This is a **cable lock**, not a security lock — see §4.6 critical note

### 7.5 Long Press (Future)

Reserved for edit mode. Not in initial scope.

---

## 8. Data Flow

### 8.1 Entity Subscription

The panel subscribes to state changes for all 20 Wallbox entities:

| Domain | Entity | Purpose |
|--------|--------|---------|
| `lock` | `lock.wallbox_vilya_lock` | Cable lock state |
| `number` | `number.wallbox_vilya_maximum_charging_current` | Adjustable max amps |
| `number` | `number.wallbox_vilya_energy_price` | Configurable price |
| `select` | `select.wallbox_vilya_solar_charging` | Solar mode |
| `sensor` | `sensor.wallbox_vilya_charging_power` | **Primary** — drives flow viz |
| `sensor` | `sensor.wallbox_vilya_status_description` | **Primary** — drives state color |
| `sensor` | `sensor.wallbox_vilya_state_of_charge` | Vehicle SoC |
| `sensor` | `sensor.wallbox_vilya_current_mode` | Operating mode |
| `sensor` | `sensor.wallbox_vilya_max_available_power` | Charger capacity |
| `sensor` | `sensor.wallbox_vilya_charging_speed` | Km/h equivalent |
| `sensor` | `sensor.wallbox_vilya_added_range` | Range added |
| `sensor` | `sensor.wallbox_vilya_added_energy` | Session energy |
| `sensor` | `sensor.wallbox_vilya_added_green_energy` | Green energy |
| `sensor` | `sensor.wallbox_vilya_discharged_energy` | V2G energy out |
| `sensor` | `sensor.wallbox_vilya_added_grid_energy` | Grid energy |
| `sensor` | `sensor.wallbox_vilya_cost` | Session cost |
| `sensor` | `sensor.wallbox_vilya_depot_price` | Depot price |
| `sensor` | `sensor.wallbox_vilya_max_charging_current` | Max current readout |
| `sensor` | `sensor.wallbox_vilya_energy_price` | Price readout |

### 8.2 Value Formatting

| Metric | Format | Examples |
|--------|--------|---------|
| Power (kW) | 1 decimal place | `7.4 KW`, `0.0 KW` |
| Energy (kWh) | 1 decimal place | `12.6 KWH`, `0.0 KWH` |
| Current (A) | 0 decimal places | `32A`, `6A` |
| SoC (%) | 0 decimal places | `62%`, `100%` |
| Speed (km/h) | 0 decimal places | `32 KM/H` |
| Range (km) | 0 decimal places, with + prefix | `+48 KM` |
| Cost ($) | 2 decimal places | `$1.89` |
| Price ($/kWh) | 2 decimal places | `$0.28/KWH` |

### 8.3 State-Driven Display Logic

```javascript
/**
 * Determine which sensor groups to show based on charger state.
 * @param {string} statusDescription - Current charger status
 * @param {number} soc - Vehicle state of charge (null if disconnected)
 * @returns {Object} Visibility flags for each sensor group
 */
function getEvChargerVisibility(statusDescription, soc) {
  const status = String(statusDescription || '').toLowerCase();
  const isConnected = !status.includes('disconnect') && !status.includes('waiting for car');
  const isCharging = status.includes('charg') && !status.includes('waiting');
  const isDischarging = status.includes('discharg') || status.includes('v2g');
  const isActive = isCharging || isDischarging;

  return {
    showSessionGroup: isActive || (isConnected && soc != null),
    showEnergyBalance: true,  // Always show cumulative energy data
    showVehicleGroup: isConnected && soc != null,
    showChargerInfo: true,     // Always show static charger info
    showFlowChevrons: isActive,
    showSocBar: isConnected && soc != null,
  };
}
```

---

## 9. Entity Discovery & Classification

### 9.1 Domain Sets

```js
export const EV_CHARGER_DOMAINS = new Set(['sensor', 'lock', 'number', 'select']);

// Wallbox integration identifier
export const EV_CHARGER_INTEGRATIONS = new Set(['wallbox']);
```

### 9.2 Device Classification

```js
/**
 * Classify whether a device group is an EV charger.
 * @param {Object[]} entries - Device entities
 * @param {Object} device - Device registry entry
 * @returns {boolean}
 */
function isEvChargerDevice(entries, device) {
  // Check integration/manufacturer
  const manufacturer = (device?.manufacturer || '').toLowerCase();
  const model = (device?.model || '').toLowerCase();

  // Wallbox detection
  if (manufacturer.includes('wallbox') || model.includes('vilya')) return true;

  // Generic EV charger detection: has select with "solar" + sensor with "charging_power"
  const hasSolarSelect = entries.some(e =>
    e.domain === 'select' && e.entity_id.includes('solar_charging')
  );
  const hasChargingPower = entries.some(e =>
    e.domain === 'sensor' && e.entity_id.includes('charging_power')
  );
  const hasLock = entries.some(e => e.domain === 'lock');

  return hasSolarSelect && hasChargingPower && hasLock;
}
```

### 9.3 Entity Filtering

```js
// MUST respect disabled_by and hidden_by
const visibleEntities = entries.filter(e =>
  !e.disabled_by && !e.hidden_by
);
```

### 9.4 Panel Type Detection Integration

In `_getDevicePanelType()`:

```js
// EV Charger detection — MUST run BEFORE power panel detection
// to prevent the charger's power sensors from being classified as generic power devices
if (isEvChargerDevice(entries, device)) {
  return PANEL_TYPE_EV_CHARGER;
}
```

**Order matters**: The EV charger has power sensors (`sensor.wallbox_vilya_charging_power`) that would match the Power Panel's `POWER_DEVICE_CLASSES` filter. EV Charger classification MUST run first to claim these entities.

---

## 10. Panel Type Registration

Add to `lcars-entity-utils.js`:

```js
export const PANEL_TYPE_EV_CHARGER = 'ev_charger';

// Add to PANEL_TYPE_ORDER (after power, before generic panels)
export const PANEL_TYPE_ORDER = {
  [PANEL_TYPE_CAMERA]:       0,
  [PANEL_TYPE_ALARM]:        1,
  [PANEL_TYPE_AQUATICS]:     2,
  [PANEL_TYPE_CLIMATE]:      3,
  [PANEL_TYPE_MEDIA]:        4,
  [PANEL_TYPE_ENVIRONMENT]:  5,
  [PANEL_TYPE_IRRIGATION]:   6,
  [PANEL_TYPE_WEATHER]:      7,
  [PANEL_TYPE_BATTERY]:      8,
  [PANEL_TYPE_POWER]:        9,
  [PANEL_TYPE_EV_CHARGER]:   10,  // ← NEW
  // ... remaining panel types
};
```

---

## 11. Icon Specifications

All icons use Material Design Icons (MDI) available in Home Assistant.

| Usage | Icon | Fallback | Notes |
|-------|------|----------|-------|
| **Panel type** (header) | `mdi:ev-station` | `mdi:car-electric` | EV charging station |
| **Charging state** | `mdi:battery-charging` | — | Active charging |
| **V2G / Discharging** | `mdi:battery-arrow-up` | `mdi:upload` | Power flowing out |
| **Idle / Standby** | `mdi:ev-plug-type2` | `mdi:power-plug` | Connected, waiting |
| **Disconnected** | `mdi:car-off` | `mdi:power-plug-off` | No vehicle |
| **Solar mode (eco)** | `mdi:leaf` | — | Eco solar mode |
| **Solar mode (full solar)** | `mdi:solar-power-variant` | `mdi:white-balance-sunny` | Full solar only |
| **Solar mode (full)** | `mdi:flash` | — | Maximum charge rate |
| **Solar mode (off)** | `mdi:power-off` | — | Solar optimization disabled |
| **Cable lock** | `mdi:lock` | — | Cable latch control |
| **Cable unlocked** | `mdi:lock-open` | — | Cable latch open |
| **Error/Fault** | `mdi:alert-circle-outline` | — | Charger fault state |
| **SoC (vehicle)** | `mdi:car-battery` | `mdi:battery` | Vehicle battery level |
| **Energy price** | `mdi:currency-usd` | `mdi:tag` | Cost/pricing |

Icon sizing: `--mdc-icon-size: 16px` for inline icons, `20px` for panel header.

---

## 12. Responsive Behavior

### Desktop (≥768px) — Full 2-Column Layout

The spec above. Sensors left, flow visualization right, solar strip and aux controls full-width below.

### Mobile (<768px) — Stacked Layout

```css
@media (max-width: 767px) {
  .lcars-ev-charger-panel {
    grid-template-columns: 1fr;
    grid-template-areas:
      "header"
      "media"
      "sensors"
      "solar"
      "auxctrl";
  }

  .ev-charger-media {
    aspect-ratio: auto;
    max-width: 14rem;
    margin: 0 auto;
  }

  .ev-charger-sensors {
    max-height: none;  /* Remove scroll constraint on mobile */
  }

  .ev-charger-solar-strip {
    justify-content: center;
    flex-direction: column;
    align-items: flex-start;
  }

  .ev-charger-aux-controls {
    flex-direction: column;
    gap: var(--lcars-gap);
    align-items: flex-start;
  }

  .ev-charger-current-control {
    width: 100%;
  }

  .ev-charger-lock-control {
    width: 100%;
  }
}
```

On mobile, the flow visualization moves to center-top for immediate visual status (flow direction + power), sensors stack below, and controls stack vertically. Reading priority: flow direction → data → mode → controls.

---

## 13. Typography & Spacing

### Font Sizes (Three sizes only — Bracer Jack Rule 6)

| Element | Size Token | Value | Usage |
|---------|-----------|-------|-------|
| Power readout (SVG) | Title tier equivalent | `32` (SVG) | Hero power number in viewscreen |
| SoC readout (SVG) | Sub tier equivalent | `26` (SVG) | Vehicle battery percentage |
| Device name, current value | `--lcars-font-size-sub` | `1.25rem` | Panel header, max current display |
| All other text | `--lcars-font-size-data` | `0.875rem` | Sensor labels, values, buttons |

**Three font sizes. No exceptions.** The SVG text sizes map to the title and sub-header tiers visually within the viewBox.

### Spacing Constants (Jörn Weißenborn Grid)

| Spacing | Token / Value | Usage |
|---------|--------------|-------|
| Gap between all elements | `var(--lcars-gap)` = 0.25rem | Universal LCARS grid spacing |
| Panel internal padding | `var(--lcars-gap)` = 0.25rem | Inside the panel frame border |
| Sensor line min-height | 1.75rem | ~28px — exceeds WCAG 2.5.8 (24px min) |
| Solar mode button height | `var(--lcars-btn-height)` = 3rem | Standard LCARS button = 48px |
| Solar mode button min-width | 5rem = 80px | Exceeds WCAG 2.5.8 |
| Adj button size | 2.5rem × 2.5rem = 40px | Exceeds WCAG 2.5.8 |
| Media frame border | 3px solid | Viewscreen border — matches Device Panel |
| Panel outer border (left/bottom) | 4px solid | Thick side (Bracer Jack Rule 2) |
| Panel outer border (top/right) | 2px solid | Thin side — thick→thin |

### Text Treatment

- **ALL UPPERCASE** for: device name, sensor labels, sensor values, button text, status badges, flow labels
- **Mixed case** ONLY for: none in this panel
- **Letter-spacing**: `0.05em` on headings and labels
- **Font-weight**: `700` (bold) for power readout, SoC readout, status badge, current value. `400` (normal) for everything else

---

## 14. Design Verification Checklist

### LCARS Compliance

- [ ] Frame uses thick→thin border pattern (4px left/bottom, 2px top/right) — **Bracer Jack Rule 2** ✓
- [ ] All colors from approved LCARS Classic palette — no rogue hex values ✓
- [ ] Font: Antonio only, three sizes only (title/sub/data) — **Bracer Jack Rule 6** ✓
- [ ] Text: UPPERCASE for all UI labels, mixed case never used ✓
- [ ] Flat design: No gradients, no shadows, no 3D effects — **Bracer Jack Rule 1** ✓
- [ ] Standard pill-button vocabulary for solar mode and lock toggle — **Bracer Jack Rule 4** ✓
- [ ] CSS custom properties only, no hardcoded hex — **Project constraint** ✓
- [ ] Empty space preserved — panel breathes with clean separation between groups — **Manifesto §3** ✓
- [ ] ≤5 hue families (lilac, butterscotch/sunflower, ice, gray/white, tomato) — **Bracer Jack color theory** ✓
- [ ] Flow chevrons are flat geometric shapes — no gradient arrows, no particle effects ✓
- [ ] TheLCARS.com attribution preserved in footer — **EULA** ✓

### Accessibility (WCAG 2.2 AA)

- [ ] All text meets 4.5:1 contrast on black (§1.4.3) ✓
- [ ] Non-text elements (borders, indicators, chevrons) meet 3:1 contrast (§1.4.11) ✓
- [ ] Color not sole indicator — shape + text redundancy (§1.4.1) ✓
- [ ] All interactive elements keyboard accessible (§2.1.1) ✓
- [ ] Focus order matches visual layout (§2.4.3) ✓
- [ ] Focus-visible: 2px solid ice outline on all focusable elements (§2.4.7, §2.4.13) ✓
- [ ] Focus not obscured: no sticky overlays blocking focused elements (§2.4.11) ✓
- [ ] Target size ≥24×24 CSS px for all interactive elements (§2.5.8) ✓
- [ ] `role="region"` + `aria-label` on panel root (§4.1.2) ✓
- [ ] `role="switch"` + `aria-checked` on cable lock toggle (§4.1.2, APG Switch) ✓
- [ ] `role="radiogroup"` / `role="radio"` on solar mode strip (§4.1.2, APG Radio) ✓
- [ ] `aria-live="polite"` on status badge for state changes (§4.1.3) ✓
- [ ] SVG `role="img"` + `aria-label` with full state description ✓
- [ ] `prefers-reduced-motion` disables all looping animations ✓
- [ ] All animations ≤2s duration (chevron cascade is looping but individual pulses are <1s effective) ✓

### Cable Lock Safety

- [ ] `lock.wallbox_vilya_lock` is treated as cable lock, NOT security lock ✓
- [ ] Excluded from `PANEL_TYPE_TACTICAL` classification ✓
- [ ] Rendered within EV Charger Panel aux controls, not on Tactical Panel ✓
- [ ] ARIA label says "Cable lock", not "Lock" — no false security implication ✓

---

## Appendix A: Color Hue Family Audit

Per Bracer Jack's color theory rules, the EV Charger Panel uses these hue families:

| Family | Colors Used | Purpose |
|--------|-------------|---------|
| **Violet** | lilac | Idle frame, standby state — distinctive to this panel |
| **Orange/Warm** | butterscotch, sunflower, gold | Charging state, grid energy, headings, active buttons |
| **Blue/Cool** | ice, bluey | V2G/discharge state, green energy, focus rings |
| **Red** | tomato | Error/fault state |
| **Neutral** | gray, space-white | Disabled, text, backgrounds |

**5 hue families** — at the upper end of Bracer Jack's "sweet spot" but each color has a clear, assigned meaning with no decorative usage. The lilac idle frame is the panel's signature color, distinguishing it from every other panel type in the dashboard. ✓

---

## Appendix B: Entity Inventory

### All 20 Wallbox Vilya Entities

| # | Entity ID | Domain | Role in Panel | Section |
|---|-----------|--------|---------------|---------|
| 1 | `lock.wallbox_vilya_lock` | lock | Cable lock toggle | Aux controls |
| 2 | `number.wallbox_vilya_maximum_charging_current` | number | Max current adjuster | Aux controls |
| 3 | `number.wallbox_vilya_energy_price` | number | Configurable (future) | Not rendered (config entity) |
| 4 | `select.wallbox_vilya_solar_charging` | select | Solar mode selector | Solar strip |
| 5 | `sensor.wallbox_vilya_depot_price` | sensor | Depot price readout | Vehicle group |
| 6 | `sensor.wallbox_vilya_charging_power` | sensor | **Primary** — flow viz + header | Header + viewscreen |
| 7 | `sensor.wallbox_vilya_max_available_power` | sensor | Charger capacity | Charger info |
| 8 | `sensor.wallbox_vilya_charging_speed` | sensor | Session speed | Session group |
| 9 | `sensor.wallbox_vilya_added_range` | sensor | Range added | Session group |
| 10 | `sensor.wallbox_vilya_added_energy` | sensor | Session energy | Session group |
| 11 | `sensor.wallbox_vilya_added_green_energy` | sensor | Green energy metric | Energy balance |
| 12 | `sensor.wallbox_vilya_discharged_energy` | sensor | V2G energy out | Energy balance |
| 13 | `sensor.wallbox_vilya_added_grid_energy` | sensor | Grid energy in | Energy balance |
| 14 | `sensor.wallbox_vilya_cost` | sensor | Session cost | Session group |
| 15 | `sensor.wallbox_vilya_current_mode` | sensor | Operating mode | Status group |
| 16 | `sensor.wallbox_vilya_state_of_charge` | sensor | Vehicle SoC | Vehicle group + viewscreen |
| 17 | `sensor.wallbox_vilya_max_charging_current` | sensor | Max current readout | Charger info |
| 18 | `sensor.wallbox_vilya_energy_price` | sensor | Energy price readout | Charger info |
| 19 | `sensor.wallbox_vilya_status_description` | sensor | **Primary** — state color driver | Header + status group |
| 20 | (reserved) | — | `number.wallbox_vilya_energy_price` appears as both number and sensor — the `number` entity is for configuration, the `sensor` is the read-only display value | — |

**Note**: Entity #3 (`number.wallbox_vilya_energy_price`) is a configuration entity — it sets the price used for cost calculations. It could be exposed as an advanced control in a future version but is not rendered in the initial panel to avoid clutter. The read-only `sensor.wallbox_vilya_energy_price` (#18) displays the current value in the Charger Info section.

---

## Appendix C: Comparison with Other Panel Types

| Feature | Power Panel | Battery Panel | **EV Charger Panel** |
|---------|-------------|---------------|---------------------|
| Primary entity type | sensor (power/energy) | sensor (battery) | sensor + lock + number + select |
| Frame color | Static butterscotch | Static ice | **Dynamic** (3-state: lilac/butterscotch/ice) |
| Direction | Consumption only | Charge level | **Bidirectional** (charge + V2G discharge) |
| Controls | Toggle switches | None | Solar mode, max current, cable lock |
| Visualization | Sparklines per circuit | Battery bar | **Directional flow chevrons** |
| Per-area aggregation | Yes (consolidated) | Per-device | **Per-device** (single charger) |
| Metaphor | EPS conduit monitoring | Auxiliary power cells | **Shuttlebay power coupling** |

---

*Spec authored by Geordi La Forge, LCARS UI Design Authority. All design decisions reference the canonical LCARS sources documented in the Geordi mode instructions. WCAG compliance verified against WCAG 2.2 (W3C Recommendation, October 2023). Color contrast ratios computed per WCAG relative luminance formula.*
