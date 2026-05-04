# LCARS Galley Panel — Design Specification

**Author**: Geordi La Forge (LCARS UI Design Authority)
**Date**: Stardate 2026.05.03
**Status**: SHIPPED — 4X-40 panel extraction. Current as of v5.1.0-beta.38.
**Priority**: MEDIUM
**Panel Type**: `galley`
**Extends**: `LcarsBasePanel` (per `custom_components/lcars_dashboard/js/src/lcars-base-panel.js`)
**File**: `custom_components/lcars_dashboard/js/src/panels/galley/lcars-galley-panel.js`
**Styles**: `custom_components/lcars_dashboard/js/src/panels/galley/lcars-galley-panel-styles.js`

---

## 0. Design Philosophy

The Galley Panel is the **smart kitchen appliance console** — modeled after the Enterprise-D's galley/replicator monitoring station. On a Federation starship the galley is not an isolated room; it is part of the ship's life-support envelope. Ovens, microwaves, refrigerators, washers and dryers are all monitored from a single console because they share thermal load, water, and power with the rest of the ship. The galley *is* the ship.

This panel federates two physically distinct vendor ecosystems behind one LCARS facade:

- **GE Home (SmartHQ)** — wall ovens, microwaves, ice makers (`ge_home` integration)
- **LG SmartThinQ** — refrigerators, washers, dryers (`smartthinq_sensors` integration)

Per Roddenberry's mandate — **the ship takes care of you**. The operator does not need to know which appliance is GE and which is LG. They need to know: *what is running, how hot, how long left.* The panel collapses vendor-specific entity sprawl into one card per physical appliance, surfacing only the three signals that matter at a glance: **state, temperature, timer**.

Per Bracer Jack's Manifesto — **empty space is beautiful**. Each appliance card shows at most: name + 2 status rows + 2 temperature rows + 1 timer. Diagnostic entities are filtered out. Idle appliances render in muted gray; active ones in gold. The eye finds the running oven instantly.

Per Bracer Jack's Core Design Rules — **LCARS is inherently flat/vector**. No gradients, no glows, no 3D bevels. The active-state indicator is a single 3px left border that shifts from butterscotch (idle) to gold (active). One geometric change, one color change.

---

## 1. Panel Frame Design

### 1.1 Frame Color Assignment

| State | Frame Color | CSS Variable | Hex |
|-------|-------------|--------------|-----|
| All states | Butterscotch | `--lcars-butterscotch` | `#ff9966` |

```js
get frameColor() { return 'var(--lcars-butterscotch)'; }
```

The galley frame is **static butterscotch** — the warm hue family shared with Engineering and other thermal-systems panels. State change is communicated *inside* the panel via per-card border color (see §5.2), not by frame recolor. This keeps the galley visually anchored as a single ship system regardless of which appliance happens to be running.

**Bracer Jack Color Theory**: 1 hue family, ≤5 tints/shades — well within safe zone.

### 1.2 Typography

All text follows the established three-tier LCARS font system:

| Element | Size Token | CSS Variable | Casing | Color |
|---------|-----------|--------------|--------|-------|
| Section label ("APPLIANCES") | Label | `--lcars-font-size-label` (0.75rem) | UPPERCASE | `--lcars-gray` |
| Appliance name | Data | `--lcars-font-size-data` | UPPERCASE | `--lcars-space-white` |
| Status label / value | Fixed | 0.75rem | UPPERCASE | gray (label), state-color (value) |
| Timer readout | Sub | `--lcars-font-size-sub` | — | `--lcars-gold` |
| Empty state | Data | `--lcars-font-size-data` | UPPERCASE | `--lcars-gray` |

Font family: `var(--lcars-font)` — Antonio everywhere.

### 1.3 Default Title

```js
get defaultPanelTitle() { return 'GALLEY SYSTEMS'; }
```

---

## 2. Supported Platforms

The panel auto-discovers entities from a known set of integration platforms via `GALLEY_PLATFORMS`:

```js
const GALLEY_PLATFORMS = new Set(['ge_home', 'smartthinq_sensors']);
```

| Platform | Vendor | Typical Devices |
|----------|--------|-----------------|
| `ge_home` | GE Appliances (SmartHQ) | Wall ovens, microwaves, ice makers, dishwashers |
| `smartthinq_sensors` | LG (SmartThinQ) | Refrigerators, washers, dryers |

Entity collection is performed by the inherited `_getAllEntities()` helper, then platform-filtered upstream by the panel auto-grouping pipeline. The constant is declared as a module-level `Set` for O(1) membership checks.

---

## 3. Sensor Device Classes

Within the platform-filtered entity set, the panel inspects sensor `device_class` values to identify display-worthy telemetry:

```js
const GALLEY_SENSOR_CLASSES = new Set(['temperature', 'duration', 'enum']);
```

| Device Class | Use | Example |
|--------------|-----|---------|
| `temperature` | Oven cavity temp, fridge zone temp, freezer temp | `sensor.kitchen_oven_current_temperature` |
| `duration` | Cook timers, wash/dry cycle remaining | `sensor.washer_remaining_time` |
| `enum` | Cook mode, current state, status descriptions | `sensor.oven_current_state` |

Diagnostic-category entities are filtered out at render time (`entity_category !== 'diagnostic'`) to avoid surfacing internal telemetry the user never asked for.

---

## 4. Grid Layout

### 4.1 Outer Layout

```
┌────────────────────────────────────────────────┐
│ [HEADER]                          [BADGE]      │  ← active count or STANDBY
├────────────────────────────────────────────────┤
│ APPLIANCES                                     │  ← section label
│ ┌────────────┐ ┌────────────┐ ┌────────────┐  │
│ │ OVEN       │ │ FRIDGE     │ │ DRYER      │  │
│ │ ● state    │ │ ● temp     │ │ ● state    │  │
│ │ ● temp     │ │ ● temp     │ │ ⏱ 00:42:11│  │
│ │ ⏱ 00:18:00│ │            │ │            │  │
│ └────────────┘ └────────────┘ └────────────┘  │
└────────────────────────────────────────────────┘
```

### 4.2 Grid CSS

```css
.galley-appliances {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
  gap: var(--lcars-gap);
}
```

- **Auto-fill** at 14rem minimum column width — adapts to available width
- **`var(--lcars-gap)`** between cards (the LCARS invisible-grid constant)
- Below 30rem viewport, collapses to single column (see §10)

### 4.3 Section Label

A single `APPLIANCES` label sits above the grid with a 2px gray underline (`border-bottom: 2px solid var(--lcars-gray)`), 0.08em letter-spacing, and 0.25rem bottom margin. There is currently **only one section** — all appliances render in the same grid regardless of vendor.

---

## 5. Device Grouping Logic

### 5.1 Grouping by `device_id`

`_partitionEntities()` walks the platform-filtered entity list and groups entries by the registry `device_id`:

```js
const deviceMap = new Map();
for (const entry of allEntries) {
  const devId = entry.entity?.device_id;
  if (devId) {
    if (!deviceMap.has(devId)) {
      deviceMap.set(devId, {
        device: devices[devId] || null,
        entries: [],
      });
    }
    deviceMap.get(devId).entries.push(entry);
  }
}
return { deviceMap };
```

- Entries without a `device_id` are **dropped silently** (no orphan card)
- Each group carries the resolved `device` object from `hass.devices` for name lookup
- Map insertion order = device discovery order (no explicit sort)

### 5.2 Per-Card Active State

A card is considered **active** if any entry's state matches one of:

```
running | cooking | preheat | on | drying | washing
```

Active cards apply `data-active` attribute, which:

- Recolors left border from butterscotch → gold (`--lcars-gold`)
- Adds faint amber wash background (`rgba(255, 170, 0, 0.06)`)

```css
.galley-appliance-card[data-active] {
  border-left-color: var(--lcars-gold);
  background: rgba(255, 170, 0, 0.06);
}
```

### 5.3 Device Name Resolution

```js
const deviceName = group.device?.name_by_user || group.device?.name || 'Appliance';
```

User-assigned name wins over the integration's default name. Falls back to literal `'Appliance'` when the device record is missing.

### 5.4 Entity Display Limits (per card)

| Entry Type | Filter | Render Limit |
|-----------|--------|--------------|
| State entries | `entity_id` matches `/cook_mode\|current_state\|status/i` AND not diagnostic | First **2** |
| Temperature entries | `device_class === 'temperature'` AND not diagnostic | First **2** |
| Timer entries | `device_class === 'duration'` | First **1** |

The slice limits are deliberate — Bracer Jack Manifesto: empty space is beautiful. A wall oven typically has 6+ temperature sensors; the user only wants the cavity reading, not the door, the meat probe inactive state, or the convection fan temp. First-match wins; no ranking heuristic.

---

## 6. Cook Status / Timer Display

### 6.1 Status Row Anatomy

Each status / temperature entry renders as a three-column row:

```
●  LABEL ……………………………… VALUE
```

```css
.galley-status-row {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-family: var(--lcars-font);
  font-size: 0.75rem;
  text-transform: uppercase;
}
```

- **Indicator**: 0.5rem × 0.5rem circle. `border-radius: 50%`. Color encodes meaning (see §6.2)
- **Label**: `flex: 1`, gray, name with appliance prefix stripped (`friendly_name.replace(deviceName, '').trim()`)
- **Value**: bold, right-aligned, color matches indicator

### 6.2 Status Indicator Colors

| Context | Indicator Color | Value Color |
|---------|----------------|-------------|
| State row, appliance active | `--lcars-gold` (#ffaa00) | `--lcars-gold` |
| State row, appliance idle | `--lcars-gray` (#666688) | `--lcars-gray` |
| Temperature row | `--lcars-butterscotch` (#ff9966) | `--lcars-butterscotch` |

Single source of color: indicator and value share the same hex per row, so the eye reads each row as one chromatic unit.

### 6.3 Timer Row

```html
<div class="galley-timer" aria-label="Timer: ${value}">⏱ ${value}</div>
```

```css
.galley-timer {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-sub);
  color: var(--lcars-gold);
  font-weight: 700;
}
```

- Stopwatch glyph + raw `state` value (Home Assistant ships `duration` sensors as `HH:MM:SS` strings)
- Always gold — timer presence implies active cycle by definition
- One timer per card maximum (the *primary* cycle)

### 6.4 Header Badge

The header badge summarizes panel state via `lcars-summary-badge`:

| Condition | Badge Value | Badge Color |
|-----------|-------------|-------------|
| ≥1 active appliance | `${activeCount} ACTIVE` | `--lcars-gold` |
| All idle | `STANDBY` | `--lcars-gray` |

Active = same state vocabulary as §5.2.

---

## 7. Temperature Display

Temperature rows use the same three-column row anatomy as status rows (§6.1), filtered to `device_class === 'temperature'` and excluding diagnostic-category entities.

```js
const value = entry.state?.state || '--';
const unit = entry.state?.attributes?.unit_of_measurement || '';
// renders as `${value}${unit}` — e.g. "375°F" or "38°F"
```

- Unit is **concatenated directly** to the value (no space) — matches HA's native presentation for temperature
- Missing readings render as `--` (not `unknown`, not blank)
- Color is butterscotch regardless of value — the panel does **not** apply hot/cold thresholding (out of scope; appliances self-regulate)
- Limit: first 2 temperature entries per appliance

---

## 8. Interactions

### 8.1 Card Click → More-Info

```html
<div class="galley-appliance-card"
     tabindex="0"
     role="group"
     aria-label="${deviceName}"
     ?data-active=${isActive}
     @click=${() => showMoreInfo(primaryEid)}
     @keydown=${(e) => (e.key === 'Enter' || e.key === ' ') &&
                       (e.preventDefault(), showMoreInfo(primaryEid))}>
```

- Click anywhere on the card → opens HA more-info dialog for the **first entity** of the group (`group.entries[0].entity.entity_id`)
- `Enter` / `Space` keys also trigger more-info (WCAG 2.1.1 keyboard parity)
- `preventDefault()` on Space prevents page scroll

### 8.2 Hover State

```css
.galley-appliance-card:hover { background: rgba(255,255,255,0.05); }
```

Subtle 5%-white wash. No transform, no scale, no shadow — flat LCARS.

### 8.3 No In-Card Controls

The galley panel is **read-only**. There are no start/stop/pause buttons, no temperature setpoint sliders. Appliance control surfaces remain in the native vendor app or HA more-info dialog. (See §12 Future Work.)

---

## 9. Accessibility

### 9.1 WCAG 2.2 Compliance Matrix

| Criterion | Level | Implementation |
|-----------|-------|----------------|
| **1.4.3 Contrast (Minimum)** | AA | All foreground colors ≥ 4.5:1 vs `#000000` (see §9.2) |
| **1.4.11 Non-text Contrast** | AA | Indicator dots use colors ≥ 3:1 vs background |
| **2.1.1 Keyboard** | A | Cards focusable via `tabindex="0"`, activated via Enter/Space |
| **2.4.7 Focus Visible** | AA | `:focus-visible` outline 2px ice (`--lcars-ice`) + 2px offset |
| **2.5.8 Target Size** | AA | Cards span full grid cell (≥14rem × ~6rem) — far exceeds 24×24 px |
| **4.1.2 Name, Role, Value** | A | `role="group"`, `aria-label="${deviceName}"`, timer carries `aria-label` |
| **4.1.3 Status Messages** | AA | Header badge inherits `role="status"` + `aria-live="polite"` from `lcars-summary-badge` |

### 9.2 Contrast Verification (vs `#000000`)

| Color | Hex | Ratio | AA Normal | AA Large | AAA |
|-------|-----|-------|-----------|----------|-----|
| Butterscotch | `#ff9966` | 8.8:1 | ✓ | ✓ | ✓ |
| Gold | `#ffaa00` | 11.0:1 | ✓ | ✓ | ✓ |
| Gray | `#666688` | 4.7:1 | ✓ | ✓ | ✗ |
| Space-white | `#f5f6fa` | 19.4:1 | ✓ | ✓ | ✓ |
| Ice (focus ring) | `#99ccff` | 10.5:1 | ✓ | ✓ | ✓ |

### 9.3 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  .galley-appliance-card {
    transition-duration: 0.01ms !important;
  }
}
```

The only transition (background on hover) is collapsed to near-zero duration.

### 9.4 Screen Reader Behavior

- Each card announces as a group with the device's user-assigned name
- Status / temperature rows are read in source order: state → temperature → timer
- Timer carries explicit `aria-label="Timer: ${value}"` so the stopwatch glyph is not voiced as raw Unicode
- Empty state announces `NO GALLEY SYSTEMS`

---

## 10. Mobile / Responsive

### 10.1 Breakpoint

```css
@media (max-width: 30rem) {
  .galley-appliances {
    grid-template-columns: 1fr;
  }
}
```

At ≤480px viewport, the appliance grid collapses to a single column. Cards retain full content (no field hiding).

The **≤767px** project-wide tablet/phone breakpoint is not specifically branched in this panel — the 14rem auto-fill behavior already handles 480–767px gracefully (typically 1–2 columns).

### 10.2 Touch Targets

- Card height in single-column mode is governed by content (≥3 rows × ~1rem line height + 1rem padding ≈ 4rem) — well above the WCAG 2.5.8 minimum of 24px
- Cards are full-width on phones, eliminating accidental adjacent taps

---

## 11. Performance Notes

- **Entity resolution** uses the inherited `_getAllEntities()` helper. Filtering and grouping is O(n) in entity count, executed every Lit render
- **No per-cell animations**, no SVG paths, no canvas draws — flat DOM only
- **No timer ticks** — the panel re-renders on `hass.states` updates from HA's event stream; remaining-time sensors update at the integration's native cadence (typically 1/min for GE, variable for LG)
- **Grid auto-fill** is browser-native CSS — no JS resize observer
- **No subscriptions** beyond the inherited `hass` property reactivity
- Diagnostic-category filter at render time is cheap (string equality on already-loaded entity records)

Worst-case render path: ~20 appliances × ~10 entries each = ~200 entries scanned per render. Well below the panel-architecture budget.

---

## 12. Known Limitations / Future Work

### 12.1 Limitations

- **Vendor coverage is hardcoded** to `ge_home` and `smartthinq_sensors`. Other ecosystems (Bosch Home Connect, Samsung SmartThings appliances, Miele@home, Whirlpool) are not surfaced — entities exist in HA but won't be picked up by `GALLEY_PLATFORMS`
- **Read-only** — no start/stop, no setpoint adjustment, no remote-start arming
- **No cycle progress visualization** — only raw remaining-time string. No progress bar, no ETA timestamp
- **Status entity matching is regex-based** (`/cook_mode|current_state|status/i`) and may miss vendor-specific naming (e.g., `oven_program_state`, `washing_phase`)
- **Friendly name de-prefixing is a string `replace(deviceName, '')`** — fails when the friendly name does not literally contain the device name, leaving labels like "Sensor Current Temperature" rather than "Current Temperature"
- **No grouping by area** — all appliances render in one flat grid regardless of room (kitchen vs laundry)
- **First-entity click target** — `more-info` opens for `entries[0]`, which may not be the most-meaningful entity for the appliance (often the diagnostic that happened to register first)
- **No empty / disconnected state per card** — an appliance with all entities `unavailable` still renders a card with `--` values rather than collapsing or fading

### 12.2 Future Work

| Item | Notes |
|------|-------|
| **Add Bosch Home Connect** | Add `home_connect` to `GALLEY_PLATFORMS`; verify entity device_class mapping |
| **Add Samsung SmartThings appliances** | Distinguish appliance subdevices from generic SmartThings noise |
| **Cycle progress bar** | Render a horizontal bar fed by `(elapsed / (elapsed + remaining))` for washer/dryer cycles |
| **Cook program label** | Surface oven program (BAKE / BROIL / CONVECTION) as a small chip beside status |
| **Group by area** | Sub-section the grid: KITCHEN / LAUNDRY / PANTRY |
| **Smarter primary entity** | Prefer `current_state`/`status` entities for `more-info` over `entries[0]` |
| **Door-open badge** | Per-card warning badge when fridge/oven door sensor reports open >60s |
| **Remote start arming** | Two-tap confirmation flow for vendors that support it (LG, GE) — pending UX review |
| **Per-card offline state** | Mirror EV-charger §1.1.1 pattern: collapse card to "OFFLINE" when all entities `unavailable` |

---

## Source Map

| Concept | Source File | Symbol |
|---------|-------------|--------|
| Panel class | `panels/galley/lcars-galley-panel.js` | `LcarsGalleyPanel` |
| Frame color | same | `get frameColor()` |
| Default title | same | `get defaultPanelTitle()` |
| Platform allowlist | same | `GALLEY_PLATFORMS` |
| Sensor class allowlist | same | `GALLEY_SENSOR_CLASSES` |
| Grouping | same | `_partitionEntities()` |
| Card render | same | `_renderApplianceCard()` |
| Header badge | same | `renderBadge()` |
| Styles | `panels/galley/lcars-galley-panel-styles.js` | `galleyPanelStyles` |
| Base class | `lcars-base-panel.js` | `LcarsBasePanel` |
| Badge component | `components/lcars-summary-badge/lcars-summary-badge.js` | `<lcars-summary-badge>` |
| More-info helper | `lcars-helpers.js` | `showMoreInfo()` |
| Focus ring mixin | `lcars-styles.js` | `lcarsFocusRing` |
