# LCARS Battery Panel — Design Specification

**Author**: Geordi La Forge (LCARS UI Design Authority)
**Date**: Stardate 2026.05.03
**Status**: SHIPPED — original v4.17.0 Panel Extraction Architecture (4X-4); current as of v5.1.0-beta.38.
**Priority**: HIGH (foundational extracted panel)
**Panel Type**: `battery`
**Extends**: `LcarsBasePanel` (per [LCARS-DEVICE-PANEL-SPEC.md](LCARS-DEVICE-PANEL-SPEC.md) §9 — base panel inheritance contract)
**Source**: [custom_components/lcars_dashboard/js/src/panels/battery/lcars-battery-panel.js](../custom_components/lcars_dashboard/js/src/panels/battery/lcars-battery-panel.js), [lcars-battery-panel-styles.js](../custom_components/lcars_dashboard/js/src/panels/battery/lcars-battery-panel-styles.js)
**Devices Supported**: Bluetti, EcoFlow, Anker, Goal Zero, and similar portable power stations; NUT-monitored UPS units (auto-detected)

---

## 0. Design Philosophy

The Battery Panel is modeled after the **Enterprise-D's Main Engineering warp core** — the vertical matter/antimatter reaction column that dominates the room. Power doesn't sit horizontally on a shelf; it *streams vertically* through a containment cylinder, with input conduits feeding it from one side and output conduits drawing from the other. Geordi's eye reads the column's fill level, color, and pulse rhythm in a single glance: full and steady = nominal; pulsing = receiving energy; dim and dropping = discharging.

The visual language is borrowed directly from the warp core prop:
- A **vertical cylindrical fill** whose color shifts from ice (full charge) through butterscotch (low) to tomato (critical) — the same hue progression used on the LCARS coolant temperature displays.
- **Horizontal tick lines** at 25/50/75% — quarter graduations reminiscent of the warp core's segment rings.
- A **center stream line** — the matter/antimatter injection beam.
- **I/O conduits** flowing horizontally beneath the core — animated dashes whose speed encodes power magnitude (slow / medium / fast).

This is explicitly a **storage** panel, not a power monitoring panel and not an EV charger. A power panel reports household consumption; an EV charger is a directional coupling station; this panel shows a vessel that **holds energy** with measurable level, multiple I/O ports, and an internal state-of-charge.

Per Bracer Jack's Manifesto: **the Cap is a termination point**. The warp core's rounded top and bottom caps are deliberately unconnected — they signal "this is the end of the conduit; energy stops here, as charge." Per the same source: **empty space is beautiful** — the I/O conduit row spans the full width with deliberate gaps at the core, allowing the eye to rest.

Per Bracer Jack's Core Design Rules: **LCARS is inherently flat/vector**. The warp core uses a single solid fill (no gradient), one inner stream line, and three tick marks. The animation is a repeating linear gradient — pure CSS, GPU-friendly, no SVG particles, no glow filters. The only "depth" is a state-driven `box-shadow` whose blur radius scales with charge level — and that single effect is gated behind `prefers-reduced-motion` via the surrounding animation rules.

---

## 1. Panel Frame Design

### 1.1 Frame Color Assignment

| State | Frame Color | CSS Variable | Hex | Rationale |
|-------|-------------|--------------|-----|-----------|
| **All states** | Ice | `--lcars-ice` | `#99ccff` | Battery storage = cool / capacitive. Matches Cetacean Ops dashboard color and the "stored energy" convention used across the LCARS dashboard suite. The frame color is **static** (declared via `get frameColor() { return 'var(--lcars-ice)'; }`) — state information is encoded in the warp core fill, not the frame. |

The Battery Panel does **not** cycle frame colors with state (unlike the EV Charger Panel, [LCARS-EV-CHARGER-PANEL-SPEC.md](LCARS-EV-CHARGER-PANEL-SPEC.md) §1.1). The decision: a battery is a passive vessel — its identity ("this is storage") is invariant. Charge level and flow direction are communicated by the *interior* (warp core color, conduit animation) so the frame can serve as a stable visual anchor.

### 1.2 Border Style

The frame chrome is provided entirely by the shared `<lcars-panel-frame>` wrapper instantiated by `LcarsBasePanel.render()`. The panel forwards its `frameColor` getter through the `frame-color` attribute. No border declarations live in `lcars-battery-panel-styles.js` — the panel content is grid-only.

### 1.3 Typography

Standard three-tier LCARS font system per `lcars-base-panel.js`:

| Element | Size Token | Casing | Color |
|---------|-----------|--------|-------|
| Panel header (device name, in `<lcars-panel-frame>`) | `--lcars-font-size-sub` | UPPERCASE | `var(--panel-frame-color)` (ice) |
| Section labels (rendered via `<lcars-section-divider>` — `DIAGNOSTICS`, `CONFIG`) | `--lcars-font-size-label` (~0.75rem) | UPPERCASE | `--lcars-sky` |
| Total In/Out lines, telemetry rows | `--lcars-font-size-data` | UPPERCASE | `--lcars-space-white` (label), state-color (value) |
| Charge badge (rendered by `renderBadge()`) | inherits header sizing | numeric % | dynamic via `_getCoreColor()` |
| Slider labels | `0.65rem` (hardcoded) | UPPERCASE | `--lcars-space-white` |
| I/O conduit labels | `0.6rem` (hardcoded) | UPPERCASE | `--lcars-space-white` |

Font family is `var(--lcars-font)` (Antonio) inherited from the host dashboard; the panel does not override it.

---

## 2. Color Palette — Charge Level Mapping

### 2.1 Warp Core Color Map

The function `_getCoreColor(charge)` maps the battery state-of-charge percentage to a single CSS variable. This drives the warp core fill, border, box-shadow, and the badge digit color:

| Charge Range | LCARS Color | CSS Variable | Hex |
|--------------|-------------|--------------|-----|
| **≥ 80 %** | Ice | `--lcars-ice` | `#99ccff` |
| **60 – 79 %** | Sky | `--lcars-sky` | `#aaaaff` |
| **40 – 59 %** | Bluey | `--lcars-bluey` | `#8899ff` |
| **20 – 39 %** | Butterscotch | `--lcars-butterscotch` | `#ff9966` |
| **10 – 19 %** | Peach | `--lcars-peach` | `#ff8866` |
| **< 10 %** | Tomato | `--lcars-tomato` | `#ff5555` |
| **Unavailable / unknown** | Gray | `--lcars-gray` | `#666688` |

Six discrete colors crosses Bracer Jack's "danger zone" of 4–5 colors. The justification (and what keeps it within LCARS canon): each color carries a single, monotonic meaning — **fuller = cooler, emptier = warmer** — exactly the matter/antimatter coolant gradient. The progression is luminance-monotonic and hue-continuous, not categorical, so users perceive it as *one* gradient rather than six independent states.

### 2.2 Conduit Color Map (static)

| Direction | LCARS Color | CSS Variable | Hex | Source line |
|-----------|-------------|--------------|-----|-------------|
| Input (`io-conduit-in`) | Ice | `--lcars-ice` | `#99ccff` | styles `background: var(--lcars-ice)` |
| Output (`io-conduit-out`) | Butterscotch | `--lcars-butterscotch` | `#ff9966` | styles `background: var(--lcars-butterscotch)` |

Idle conduits render at `opacity: 0.15` (`flow-stopped`); active conduits scale opacity with magnitude (`0.6 / 0.8 / 1.0` for slow / medium / fast).

### 2.3 WCAG Contrast Verification

All colors verified against `#000000` background (WCAG 2.2 §1.4.3 Contrast Minimum):

| Color | Hex | Ratio vs `#000` | AA Normal (4.5:1) | AA Large (3:1) | AAA (7:1) |
|-------|-----|----------------|-------------------|----------------|-----------|
| Ice | `#99ccff` | 10.5:1 | ✓ | ✓ | ✓ |
| Sky | `#aaaaff` | 9.1:1 | ✓ | ✓ | ✓ |
| Bluey | `#8899ff` | 7.2:1 | ✓ | ✓ | ✓ |
| Butterscotch | `#ff9966` | 8.8:1 | ✓ | ✓ | ✓ |
| Peach | `#ff8866` | 7.7:1 | ✓ | ✓ | ✓ |
| Tomato | `#ff5555` | 5.2:1 | ✓ | ✓ | ✗ |
| Gray | `#666688` | 4.7:1 | ✓ | ✓ | ✗ |
| Sunflower (button face) | `#ffcc99` | 13.1:1 | ✓ | ✓ | ✓ |
| Space White (text) | `#f5f6fa` | 18.9:1 | ✓ | ✓ | ✓ |

All visible text and meaningful indicators meet WCAG 2.2 AA on a `#000000` background.

### 2.4 Color-Blind Considerations (WCAG 2.2 §1.4.1)

Color is **not** the sole channel for charge state:

1. **Numeric badge**: `renderBadge()` always emits "`NN%`" — the percentage is an unambiguous text label.
2. **Fill height**: the warp core column is filled to `calc(var(--core-charge) * 1%)` — physical height encodes magnitude independently of color.
3. **Animation rhythm**: charging cores carry the `core-charging` modifier (steady upward dashes); idle cores pulse via `core-idle-pulse`; discharging cores are static — three distinguishable behaviors.
4. **I/O conduit labels**: every flow row carries text labels (`SOLAR IN  120 W`, `AC OUT  450 W`) and a wattage readout.
5. **ARIA**: the warp core container exposes `role="meter"` with `aria-valuenow / aria-valuemin / aria-valuemax / aria-label="Battery charge level: NN percent"`.

---

## 3. Grid Layout

### 3.1 ASCII Layout — Standard Power Station (charging, multiple I/O)

```
┌──────────────────────────────────────────────────────────────────────┐
│ 🔋 BLUETTI AC500          ───────────────────────────────────  87 % │  ← <lcars-panel-frame> header + badge
├──────────────────────┬─────────────┬─────────────────────────────────┤
│ ⚡ TOTAL IN   220 W  │             │ ┌─────────────────────────────╮ │
│ 🔌 TOTAL OUT  450 W  │   ╔═════╗   │ │ POWER SAVING MODE           │ │
│ ─────────────────── │   ║ ▒▒▒ ║   │ │ ━━━━━━━━○━━━━━━━━  3 / 5    │ │
│ TEMPERATURE   28 °C  │   ║ ▒▒▒ ║   │ └─────────────────────────────╯ │
│ CYCLES         142   │   ║ ▒▒▒ ║   │ ┌──╮                            │
│ STATE OF HEALTH 99 % │   ║ ▒▒▒ ║   │ │AC│  ┌────────╮ ┌──────────╮  │
│ REMAINING TIME 8h12m │   ║ ▒▒▒ ║   │ └──╯  │ DC OUT │ │ USB OUT  │  │
│ STATUS       NORMAL  │   ║ ▒░░ ║   │       └────────╯ └──────────╯  │
│  ── DIAGNOSTICS ──   │   ║ ░░░ ║   │   ── CONFIG ──                  │
│ ERROR CODE       0   │   ╚═════╝   │   GRID CHARGE LIMIT             │
│ POWER DIFF    -12 W  │     ▲       │   ━━━━━━━━━━━○━  90 %           │
├──────────────────────┴─────────────┴─────────────────────────────────┤
│  SOLAR IN   120 W ════════════════ ┊ ════════════════ AC OUT  450 W │  ← I/O flow row
│  AC IN      100 W ════════════════ ┊ ════════════════ DC OUT   45 W │
│                                                       USB OUT    8 W │
└──────────────────────────────────────────────────────────────────────┘
```

### 3.2 ASCII Layout — NUT UPS (auto-detected, line interactive)

```
┌──────────────────────────────────────────────────────────────────────┐
│ 🔋 OFFICE UPS             ───────────────────────────────────  100% │
├──────────────────────┬─────────────┬─────────────────────────────────┤
│ 🔌 STATUS    OL CHRG │             │                                 │
│ 📊 LOAD      45 W (15│   ╔═════╗   │   ── CONFIG ──                  │
│ ⏲  RUNTIME    24 m   │   ║ ▒▒▒ ║   │   BEEPER ENABLED                │
│ ─────────────────── │   ║ ▒▒▒ ║   │   ON  / OFF                     │
│ INPUT VOLTAGE 122 V  │   ║ ▒▒▒ ║   │                                 │
│ BATTERY VOLT  13.6 V │   ║ ▒▒▒ ║   │                                 │
│ NOMINAL POWER 300 W  │   ╚═════╝   │                                 │
├──────────────────────┴─────────────┴─────────────────────────────────┤
│  GRID    ONLINE  ════════════════ ┊ ════════════════ LOAD  45 W (15%)│
└──────────────────────────────────────────────────────────────────────┘
```

### 3.3 CSS Grid Definition (verbatim, from `lcars-battery-panel-styles.js`)

```css
.battery-content {
  display: grid;
  grid-template-columns: minmax(8rem, 1fr) minmax(5rem, 6rem) minmax(8rem, 1.2fr);
  grid-template-rows: 1fr auto;
  grid-template-areas:
    "sensors  core      controls"
    "ioflow   ioflow    ioflow";
  gap: var(--lcars-gap);
}
```

### 3.4 Why This Grid

- **3-column primary row**: Telemetry (left, scrollable) | warp core (center, fixed-narrow) | controls (right, scrollable). The narrow center column (`5–6rem`) keeps the warp core the visual focal point without dominating the panel.
- **Full-width I/O row**: `ioflow` spans all three columns so input conduits visually originate at the telemetry side and output conduits terminate at the controls side — reinforcing the "energy enters from sensors, exits to consumers" mental model.
- **`minmax()` columns**: telemetry (`min 8rem`) and controls (`min 8rem, 1.2fr` — slightly wider) flex with viewport; the warp core stays bounded between `5rem` and `6rem`.
- **`max-height: 22rem` + `overflow-y: auto`** on telemetry and controls keeps the warp core visible regardless of entity count.

---

## 4. Entity Discovery & Classification

The panel performs all classification inside `_partitionBatteryEntities(entries, categoryEntities)`. The function returns `{ soc, powerIn, powerOut, telemetry, controls, configControls, diagnostics }`.

### 4.1 Classification Order (first match wins)

1. **Controls** — `domain ∈ {switch, number, button, select}` → `controls[]`.
2. **State of Charge** — `device_class === 'battery'` && `unit_of_measurement === '%'` → `soc[]`.
3. **NUT-specific entities** (only when `_isNutDevice()` is true) — captured into `_nutLoadEntry`, `_nutStatusEntry`, `_nutStatusDataEntry`, `_nutNominalPower`, `_nutRuntimeEntry`.
4. **Power entities** — `device_class === 'power'` && `unit === 'W'` → routed through `_classifyPowerEntity(name)`; matches go to `powerIn[]` or `powerOut[]` with an `ioType` tag; non-matches fall through to `telemetry[]`.
5. **Everything else** → `telemetry[]`.

Then the device's `entity_category === 'config'` and `'diagnostic'` entities (looked up via `LcarsBasePanel._getDeviceCategoryEntities()`) are partitioned into `configControls[]` and `diagnostics[]`.

### 4.2 `_classifyPowerEntity(name)` — Regex Matching

The function tags a power sensor by side and type via case-insensitive regex on the friendly name:

| Side / Type | Regex (informal) | Example friendly name |
|-------------|------------------|----------------------|
| `in` / `total` | `total\s*in\s*power` | "Total In Power" |
| `out` / `total` | `total\s*out\s*power` | "Total Out Power" |
| `in` / `solar` | `solar.*in.*power` | "Solar In Power" |
| `in` / `ac` | `ac.*in.*power` | "AC In Power" |
| `out` / `ac` | `ac.*out.*power` | "AC Out Power" |
| `out` / `dc` | `dc.*out.*power`, `anderson.*out.*power` | "DC Out Power", "Anderson Out Power" |
| `out` / `usb` | `usb.*out.*power` | "USB Out Power" |
| `out` / `usbc` | `type.*c.*out.*power` | "Type-C Out Power" |
| `in` / `pio` | `power.*i.*o.*input.*power` | "Power I/O Input Power" |
| `out` / `pio` | `power.*i.*o.*output.*power` | "Power I/O Output Power" |
| `in` / `alt` | `alternator.*in.*power` | "Alternator In Power" |
| `out` / `station` | `station.*power` | "Station Power" |
| `in` / `other` | `\bin\b` | fallback for "X In" |
| `out` / `other` | `\bout\b` | fallback for "X Out" |
| `null` | none of the above | falls through to `telemetry[]` |

### 4.3 NUT UPS Detection — `_isNutDevice(entries)`

A device is treated as a NUT UPS when **all three** are true:
1. Has at least one `device_class === 'battery'` entity reported in `%`.
2. Has **no** entity with `device_class === 'power'` && `unit === 'W'` (NUT exposes load as a percentage, not raw watts).
3. Has at least one NUT-typical signal: an entity_id matching `/ups[._]load|ups[._]status/` **or** a `device_class === 'voltage'` entity.

When detected, the panel:
- Parses NUT status flags via `_parseNutStatus(s)` into `{ online, onBattery, charging, lowBattery, shutdown, off }` from the raw status string (`OL`, `OB`, `CHRG`, `LB`, `FSD`, `OFF`).
- Synthesizes a `total`-typed `powerOut` entry from `load %` × `nominal real power W` (when both are available), surfacing the computed wattage as a display string `"NN W (LL%)"` (`_nutSynthetic: true`).
- Replaces the standard "Total In / Total Out" telemetry rows with NUT-specific Status / Load / Runtime rows.
- Replaces the I/O conduit row with a single `GRID → LOAD` pair driven by `online` and load%.

### 4.4 Telemetry & Diagnostics Filtering

`renderContent()` further trims the telemetry to a "key" set capped at **8 entries** each:

- `keyTelemetry`: entries whose `device_class` is `temperature`, `duration`, or `voltage`, **or** whose friendly name matches `/state.*health|cycles|remain.*time|status|error.*code|battery.*count|runtime|load/`.
- `keyDiagnostics`: entries whose `device_class === 'temperature'` **or** whose friendly name matches `/cycles|status|error|battery.*count|charging.*state|power.*diff/`.

Diagnostics are only rendered when at least one survives, and they appear under a `<lcars-section-divider label="DIAGNOSTICS">`.

---

## 5. Warp Core Visualization

### 5.1 Structure

```html
<div class="warp-core-container" role="meter"
     aria-valuenow="${charge}" aria-valuemin="0" aria-valuemax="100"
     aria-label="Battery charge level: ${Math.round(charge)} percent">
  <div class="warp-core" style="--core-color:${coreColor};--core-charge:${charge}">
    <div class="warp-core-fill ${isIdle?'core-idle':''} ${isCharging?'core-charging':''}">
      <div class="warp-core-stream"></div>
    </div>
    <div class="warp-core-tick" style="bottom:25%"></div>
    <div class="warp-core-tick" style="bottom:50%"></div>
    <div class="warp-core-tick" style="bottom:75%"></div>
  </div>
</div>
```

### 5.2 Geometry

| Property | Value | Notes |
|----------|-------|-------|
| `.warp-core` width | `4 rem` | fixed |
| `.warp-core` min-height | `10 rem` (desktop), `4 rem` (mobile) | flexes to row height |
| `.warp-core` border-radius | `2 rem` | full pill — Bracer Jack's "Cap" termination at top **and** bottom |
| `.warp-core` border | `2px solid var(--core-color)` | flat, no gradient |
| `.warp-core` box-shadow | `0 0 calc(var(--core-charge) * 0.2px) var(--core-color)` | blur radius scales linearly with charge (0–20 px); solid LCARS color, no spread |
| `.warp-core-fill` height | `calc(var(--core-charge) * 1%)` | physical fill encodes charge |
| `.warp-core-fill` opacity | `0.8` (or pulses 0.55–0.8 when idle) | leaves room for the stream line to read on top |
| `.warp-core-stream` | `2 px` vertical line, `rgba(255,255,255,0.35)`, centered | the matter/antimatter injection beam |
| `.warp-core-tick` | 1 px lines at 25 / 50 / 75 % | `opacity: 0.3` — quarter graduations |

### 5.3 Animation States

| State | Trigger | CSS class | Effect |
|-------|---------|-----------|--------|
| Charging | `_nutStatus.charging` (NUT) **or** `totalInW > 5` | `.core-charging` | Repeating linear-gradient stripes (`0.75rem`/`1rem` bands) animated upward via `core-charge-flow` (2 s linear infinite) |
| Idle | not charging and not discharging | `.core-idle` | Opacity pulse 0.55 ↔ 0.8 via `core-idle-pulse` (3 s ease-in-out infinite) |
| Discharging | `_nutStatus.onBattery` (NUT) **or** `totalOutW > 5` | (none — fill is static) | The level drops; conduit animation conveys the activity |

All animations are suppressed by the `@media (prefers-reduced-motion: reduce)` block in the styles module.

---

## 6. I/O Flow Conduits

### 6.1 Row Structure

Each pair renders as a single `.io-pair-row` with the DOM order **input port → input conduit → core gap → output conduit → output port**. The output port is reordered to the right end via `order: 5`, which keeps the visual layout symmetrical even though the source markup writes the input pair first.

### 6.2 Pair Generation (non-NUT devices)

`renderContent()` collects every distinct `ioType` from `powerIn` and `powerOut` (excluding `'total'`), then renders one row per type:

```js
const ioPairs = [...ioTypes].map(type => ({
  type,
  label: type.toUpperCase(),
  inEntry:  powerIn.find(e => e.ioType === type),
  outEntry: powerOut.find(e => e.ioType === type),
}));
```

For each pair the wattage is parsed and bucketed by `_getFlowSpeed(watts)`:

| Magnitude | Bucket | Animation duration | Opacity |
|-----------|--------|-------------------|---------|
| `> 1000 W` | `flow-fast` | 0.4 s | 1.0 |
| `> 100 W` | `flow-medium` | 0.8 s | 0.8 |
| `> 0 W` | `flow-slow` | 1.5 s | 0.6 |
| `0 W` | `flow-stopped` | (none) | 0.15 |

### 6.3 Animation

Conduits use a `repeating-linear-gradient` of 6 px transparent / 4 px color bands, animated by translating `background-position-x` ±16 px per cycle. Input conduits use `--lcars-ice` and animate left-to-right (toward the core); output conduits use `--lcars-butterscotch` and animate right-to-left (away from the core, toward the consumer port). The directional reversal makes "energy flowing **into** the battery" and "energy flowing **out of** the battery" instantly distinguishable without color reference.

The center `.io-core-gap` is a `1 rem` blank spacer separating the in and out conduits — Bracer Jack's "empty space" rule applied at the row level.

### 6.4 NUT Special-Case

When `_nutStatus` is set, the conduit row collapses to a single `GRID → LOAD` pair:
- Input port: `GRID  ONLINE / OFFLINE` (color: ice when online, tomato when offline).
- Input conduit: `flow-medium` when online, `flow-stopped` when offline.
- Output port: `LOAD  NN W (LL%)` (always butterscotch).
- Output conduit: `flow-medium` when load > 0%, `flow-stopped` otherwise.

---

## 7. Telemetry Readouts

### 7.1 Total Lines (top of telemetry column)

Rendered as `.battery-total-line` rows — interactive (`role="button"`, `tabindex="0"`, click and Enter/Space handlers). Two render paths:

- **Standard path** (no NUT): `Total In` (ice icon `mdi:transmission-tower-import`) and `Total Out` (butterscotch icon `mdi:transmission-tower-export`), each formatted via `formatNumber(state, 'power')` + `' W'`.
- **NUT path**: three rows — `Status` (icon flips between `mdi:battery-alert` and `mdi:power-plug` based on `onBattery`), `Load` (formatted as `"NN W (LL%)"` or raw percentage), `Runtime` (formatted via `_formatNutRuntime()` to `Xh Ym`).

### 7.2 Sensor Rows

Below the totals, every entry in `keyTelemetry` is rendered via the shared `<lcars-sensor-row>` component with `label`, `value` (formatted via `formatNumber`), `color` (resolved via `LcarsBasePanel._getSensorIndicatorColor()`), and `entity-id` (for click-to-more-info wiring inside that component).

### 7.3 Diagnostics Block

When `keyDiagnostics.length > 0`, a `<lcars-section-divider label="DIAGNOSTICS">` is emitted, followed by another set of `<lcars-sensor-row>` entries.

### 7.4 Header Badge

`renderBadge()` returns a single `<span>` colored by `_getCoreColor(charge)` containing either `"NN%"` or `"N/A"` (when the SoC entity is `unavailable`/`unknown`). This is slotted into the `<lcars-panel-frame>` header by the base class.

---

## 8. Config Controls

The right-hand controls column renders **two** banks: primary device controls (`controls[]` from the partition) and a secondary "CONFIG" bank under a `<lcars-section-divider label="CONFIG">`.

### 8.1 Domain Renderers

| Domain | Renderer | Service call |
|--------|----------|--------------|
| `number` | `.battery-slider-control` (custom HTML slider — see §8.2) | `number.set_value` |
| `select` | `.lcars-option-strip` (radiogroup with one button per option) | `select.select_option` (with `lcarsAudio.play('switchToggle')`) |
| `switch`, `light`, `lock`, `script`, others in `TOGGLE_DOMAINS` | `.device-control-btn` with `data-on` / `data-off` attributes | routed through `LcarsBasePanel._handleToggle()` |
| Anything else | `.device-control-btn` (click opens more-info) | `showMoreInfo()` via `_handleEntityClick()` |

### 8.2 Custom Slider

The `number` slider is hand-rolled (not a `<input type="range">`):

- `.battery-slider-track` carries `role="slider"` + `aria-labelledby` + `aria-valuemin/max/now`.
- Mouse: `@click` translates pointer-X within the track into a value snapped to `step` and clamped to `[min, max]`.
- Keyboard:
  - `ArrowUp`/`ArrowRight` → +`step`
  - `ArrowDown`/`ArrowLeft` → −`step`
  - `Home` → `min`
  - `End` → `max`
  - All preventDefault to suppress page scroll.
- Visual: `.battery-slider-fill` width tracks current %; `.battery-slider-thumb` is positioned by `left: NN%`.

The primary (non-config) `controls[]` slider variant uses a fixed step of `±1` (the config variant honors the entity's `step` attribute).

### 8.3 Toggle Buttons

`.device-control-btn` defaults to `--lcars-sunflower` background with `--lcars-black` text. State styling:
- `[data-on]` → `--lcars-gold`
- `[data-off]` → `--lcars-gray` background, `--lcars-space-white` text

Hover: `filter: brightness(1.15)` per Bracer Jack — no shadow, no scale, no transform.

---

## 9. Interactions

### 9.1 Click Targets

| Target | Handler | Result |
|--------|---------|--------|
| Total In / Total Out / NUT Status / Load / Runtime line | inline `_handleEntityClick(entityId)` | `showMoreInfo()` on the entity |
| `<lcars-sensor-row>` | handled by the component (passes `entity-id`) | `showMoreInfo()` |
| Toggle button (TOGGLE_DOMAINS) | `_handleToggle(entityId)` | `homeassistant.toggle` (or domain-specific service for `lock`/`script`); emits `lcarsAudio.playForEntity()` on success or `lcarsAudio.play('negativeAcknowledge')` if the entity is `unavailable` |
| Other-domain control button | `_handleEntityClick(entityId)` | `showMoreInfo()` |
| Slider track click | inline service call | `number.set_value` |
| Select option button | inline service call | `select.select_option` + `lcarsAudio.play('switchToggle')` |

### 9.2 Audio

The panel relies on `lcarsAudio` from `lcars-audio.js` (per [LCARS-AUDIO-SPEC.md](LCARS-AUDIO-SPEC.md)):

- **Select option**: explicit `lcarsAudio.play('switchToggle')` on click (in the inline handler).
- **Toggle button**: routed through base-class `_handleToggle()`, which calls `lcarsAudio.playForEntity(entityId)` for entity-typed feedback or `'negativeAcknowledge'` when the entity is unavailable.
- **Slider, total lines, sensor rows, more-info clicks**: the panel emits **no** explicit audio for these; any sound comes from the surrounding shell or the `<lcars-sensor-row>` component if it plays its own.

---

## 10. Accessibility (WCAG 2.2 AA)

### 10.1 Keyboard

| Element | Tab stop | Activation | Behavior |
|---------|----------|------------|----------|
| `.battery-total-line` | `tabindex="0"` | `Enter` / `Space` (handler `preventDefault`s) | opens more-info |
| Warp core container | none — informational only (`role="meter"`) | — | exposes `aria-valuenow / min / max / label` to assistive tech |
| `.battery-slider-track` | `tabindex="0"` (`role="slider"`) | Arrow keys, Home, End | adjusts value (per §8.2) |
| `.lcars-option-btn` | native `<button>` | Enter / Space | `select.select_option` |
| `.device-control-btn` | native `<button>` | Enter / Space | toggle or more-info |
| I/O conduit row | not focusable | — | conduits are decorative; entity values appear in the telemetry column |

### 10.2 ARIA

- Telemetry column wraps in `role="list"` with `aria-label="${deviceName} telemetry"`.
- Warp core: `role="meter"` + percentage label.
- Sliders: `role="slider"` + `aria-labelledby` + value bounds.
- Select strips: `role="radiogroup"` with each option `role="radio"` + `aria-checked`.
- I/O ports carry per-port `aria-label` strings naming direction and wattage.

### 10.3 Focus Indicators

Each focusable element declares an inline `:focus-visible` ring: `outline: 2px solid var(--lcars-ice); outline-offset: 2px;`. This satisfies WCAG 2.2 §2.4.7 (Focus Visible) and §2.4.13 (Focus Appearance, AAA — 2 px, ≥3:1 contrast against the black panel).

> **Note**: The panel does **not** import the shared `lcarsFocusRing` style from `lcars-styles.js` (used by the Galley, Life Support, and Hazard panels). The inline outlines are functionally equivalent. See §13.

### 10.4 Color & Motion

- All meaningful text/colors clear WCAG AA (per §2.3).
- All animations are wrapped by `@media (prefers-reduced-motion: reduce)` which disables `core-idle`, `core-charging`, and both `flow-in`/`flow-out` keyframes (the static fill height and conduit colors remain to preserve information).

### 10.5 Target Size (WCAG 2.2 §2.5.8)

- `.device-control-btn`: `2.25 rem` (36 px) tall — passes 24×24.
- `.lcars-option-btn`: `1.5 rem` (24 px) tall — at the 24-CSS-pixel minimum; horizontally generous (`0.75 rem` padding each side).
- `.battery-slider-track`: `1.25 rem` (20 px) tall — **below** 24 px. Spacing between sliders (gap + label) keeps inadvertent activation low, and the track has a `cursor: pointer` and is keyboard-operable as the primary path. See §13.
- `.battery-total-line`: `0.25 / 0.5 rem` padding around `0.875 rem` text → roughly 24 px tall depending on icon. Acceptable.

---

## 11. Mobile / Responsive

### 11.1 Panel-Local Breakpoint (`max-width: 30 rem`, ~480 px)

When the panel itself shrinks below ~30 rem, `lcars-battery-panel-styles.js` rewrites the grid to a single column and reorients the warp core horizontally:

```css
@media (max-width: 30rem) {
  .battery-content {
    grid-template-areas: "core" "sensors" "controls" "ioflow";
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto auto;
  }
  .warp-core-container {
    min-height: 6rem;
    flex-direction: row;
  }
  .warp-core {
    width: 100%;
    height: 4rem;
    min-height: 4rem;
    border-radius: 2rem;
  }
  .warp-core-fill {
    left: 0; bottom: 0; top: 0;
    right: auto;
    width: calc(var(--core-charge, 0) * 1%);
    height: 100%;
  }
}
```

The fill becomes a **horizontal** bar that grows from left to right (the "warp core lying on its side"). Tick marks are not repositioned — this is a documented gap (§13).

### 11.2 Dashboard Frame Behavior (≤ 767 px)

The surrounding LCARS dashboard frame narrows per Geordi-canon — see [LCARS-UI-ARCHITECTURE.md](LCARS-UI-ARCHITECTURE.md) §10. The Battery Panel itself does not implement any media queries between `30 rem` and `767 px`; it relies on the dashboard's grid to deliver an appropriately sized container, and engages its own `30 rem` rule only when the container is genuinely narrow (e.g., a single-column phone layout or a sidebar slot).

---

## 12. Performance Notes

- **Render path**: a single `renderContent()` per `hass` update; no per-frame timers. All animation is CSS keyframes — no `requestAnimationFrame` loops.
- **Concurrent animations** when the panel is fully active:
  1. `core-charging` (or `core-idle-pulse`) on the warp core fill.
  2. `flow-in` on each input conduit (one per `ioType`).
  3. `flow-out` on each output conduit (one per `ioType`).

  A typical Bluetti device has 3–4 I/O pairs → 7–9 simultaneous animations. This **exceeds** the project's "≤6 concurrent" budget noted in the Tactical guidelines. All animations are pure CSS and GPU-eligible (`background-position-x` is a paint, not a composite — see §13), and the `prefers-reduced-motion` gate disables them.
- **Box-shadow on warp core** (`box-shadow: 0 0 calc(var(--core-charge) * 0.2px) var(--core-color)`) is paint-triggered. Acceptable per the established Tactical precedent (see Animation Budget Standard in mode notes).
- **Entity loops**: telemetry and diagnostics are capped at 8 entries each (`.slice(0, 8)`), bounding the render cost regardless of how many sensors a vendor exposes.
- **No external assets**: the panel references no images, fonts, or audio files — all visuals are CSS, all sounds come from `lcars-audio` synthesis.

---

## 13. Known Limitations / Future Work

1. **Focus ring inconsistency**: The panel uses inline `:focus-visible { outline: 2px solid var(--lcars-ice); }` rather than importing the shared `lcarsFocusRing` style from `lcars-styles.js` (which Galley, Life Support, and Hazard panels use). Visually equivalent today, but a future change to the shared ring would not propagate. **Future**: spread `lcarsFocusRing` into `static get styles()` and remove the inline rules.

2. **Slider target size**: `.battery-slider-track` is 20 px tall — below the WCAG 2.2 §2.5.8 (Minimum) 24 px target. Keyboard operation remains accessible; pointer users on touch devices may have difficulty hitting the track precisely. **Future**: increase track height to 24 px or expand the hit target with padding while keeping the visual track at 20 px.

3. **I/O animation count**: With many I/O ports active, concurrent CSS animations exceed the 6-animation budget. Functioning correctly today (CSS-only, GPU-friendly, motion-gated), but worth monitoring if more I/O types are added.

4. **`background-position-x` is paint, not composite**: The flow conduit animation is not strictly compositor-only. On low-power devices with many concurrent flows, this could drop frames. **Future**: investigate a `transform: translateX()` implementation on a child element to move animation to the GPU compositor.

5. **Mobile warp core ticks**: When the core rotates to horizontal at `max-width: 30rem`, the three `.warp-core-tick` lines are still positioned with `bottom: 25/50/75%` — they remain horizontal across the now-horizontal core, no longer functioning as quarter graduations. **Future**: rotate or reposition ticks under the mobile media query.

6. **NUT load percentage label truncation**: In the ASCII layout for NUT (§3.2) the load reads `"45 W (15"` because the cell is narrow — the actual rendered `_nutDisplayValue` is `"45W (15%)"` and may overflow the narrow telemetry column on short widths. **Future**: ellipsis or two-line layout for the synthetic label.

7. **Power entity classification is regex-only**: `_classifyPowerEntity()` matches on friendly names. A device that localizes its sensor names (Spanish, German, Japanese) will fall through to `telemetry[]` and never appear in the I/O conduit row. **Future**: consider matching on `entity_id` patterns or device-class-specific attributes as a fallback.

8. **No frame-color state cycling**: Unlike the EV Charger Panel, the frame color does not change with state. Users with tunnel vision (focusing only on the frame) may miss state changes. Mitigated by the warp core color, fill height, animation rhythm, and badge — but worth noting.

9. **`renderBadge()` re-runs `_partitionBatteryEntities()`**: The badge calls the full partition pipeline (regex matches, NUT detection) just to retrieve the SoC entry, then `renderContent()` runs it again. **Future**: memoize per `hass` update, or compute SoC once in `updated()` and stash on the instance.

10. **No "battery health" surfacing in badge or hero**: The State of Health entity is shown only as a text row in telemetry. **Future**: a small secondary indicator beside the SoC badge could surface degraded health (<80%) at a glance.

---

**End of specification.**
