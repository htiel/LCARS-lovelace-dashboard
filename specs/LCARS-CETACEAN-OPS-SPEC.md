# LCARS Cetacean Ops Dashboard Spec

> **Dashboard ID**: `cetacean` · **URL**: `lcars-cetacean` · **Title**: Cetacean Ops
> **Frame Color**: `--lcars-sky` (#aaaaff) · **Icon**: `mdi:dolphin`
> *"There are whales here?!" — Commander Riker*

---

## §1 Purpose

Dedicated aquatic systems monitoring dashboard for pool and spa equipment. Named after the Enterprise-D's Cetacean Ops on Deck 13 — where dolphins and whales assisted with stellar navigation. Here, it monitors water chemistry, thermal regulation, pump systems, and water features.

### Integrations

| Platform | Integration | Entities |
|----------|-------------|----------|
| Pentair ScreenLogic | `screenlogic` | 2 climate (pool/spa heat), 11 switches (pool/spa/waterfall/bubblers/spillway/blower/cleaner/feature 1-8), 2 lights, 6 pump sensors (watts/rpm/gpm × 2), 4 binary sensors (freeze/delays/alert), 1 air temp |
| WaterGuru GrandeBridge S2 | `waterguru` | 7 chemistry (pH/chlorine/alkalinity/calcium/hardness/CYA/flow), 7 alert sensors, battery, cassette, water temp, status, last measurement, signal |
| Emporia Vue | `emporia_vue` | 16 pool equipment power circuits |

### Entity Discovery

Cross-area scan by platform — pool equipment is location-independent:
```javascript
// Primary: platform-based (O(1) set lookup)
POOL_SPA_PLATFORMS.has(entity.platform)  // screenlogic, waterguru, etc.
// Secondary: Emporia Vue circuits matching pool keywords
entity.platform === 'emporia_vue' && /pool/i.test(entity.entity_id)
```

---

## §2 Frame & Color Identity

### Why `--lcars-sky` (#aaaaff)

| Dashboard | Frame Color | Variable |
|-----------|-------------|----------|
| Habitat | butterscotch | `--lcars-butterscotch` (#ff9966) |
| Tactical | ice | `--lcars-ice` (#99ccff) |
| Engineering | butterscotch | `--lcars-butterscotch` (#ff9966) |
| Life Support | bluey | `--lcars-bluey` (#8899ff) |
| Illumination | sunflower | `--lcars-sunflower` (#ffcc99) |
| **Cetacean Ops** | **sky** | **`--lcars-sky`** (#aaaaff) |

Sky stays in the cool/blue family (aquatic association) but is distinct from Life Support's bluey — lighter and more violet-shifted. Contrast vs black: 8.8:1 (AAA).

### Internal Color Palette

| Role | Variable | Hex | Usage |
|------|----------|-----|-------|
| Pool body | `--lcars-ice` | #99ccff | Pool temperature, optimal chemistry |
| Spa body | `--lcars-butterscotch` | #ff9966 | Spa temperature, active heating |
| Optimal | `--lcars-ice` | #99ccff | Chemistry in range |
| Advisory | `--lcars-sunflower` | #ffcc99 | Chemistry approaching limits |
| Alert | `--lcars-tomato` | #ff5555 | Chemistry out of range |
| Controls active | `--lcars-gold` | #ffaa00 | Active toggles |
| Inactive | `--lcars-gray` | #666688 | Off states |
| Accent | `--lcars-sky` | #aaaaff | Section labels, dividers |

---

## §3 Sidebar Filters

| Filter | Label | Shows |
|--------|-------|-------|
| `all` | ALL | Everything (default) |
| `water` | WATER BODIES | Pool/spa viewscreens, heat controls, temperature |
| `chemistry` | CHEMISTRY | Langford gauges, sensor health |
| `features` | FEATURES | Water features, lights, pump telemetry, circuits |
| `power` | POWER | Emporia Vue per-circuit power breakdown |

---

## §4 Hero Element: Cetacean Status Strip

Full-width summary bar below header elbow. Background: `--lcars-sky`. Text: `color: var(--lcars-black)`.

### Row 1 — Four Data Blocks

```
┌──────────────────────────────────────────────────────────────────────────┐
│  POOL 78°F        SPA 102°F       CHEMISTRY: OPTIMAL    SYSTEMS: 2/6   │
└──────────────────────────────────────────────────────────────────────────┘
```

| Block | Label | Content | Source |
|-------|-------|---------|--------|
| 1 | POOL | Current pool temperature + heating badge | `climate.pentair_*_pool_heat` |
| 2 | SPA | Current spa temperature + heating badge | `climate.pentair_*_spa_heat` |
| 3 | CHEMISTRY | Aggregate: `OPTIMAL` / `{n} CAUTION` / `{n} ALERT` | Worst-case of WaterGuru metrics |
| 4 | SYSTEMS | `{active}/{total} ACTIVE` | Count of running pumps + circuits |

Chemistry aggregate color: ice (all optimal), sunflower (any caution), tomato (any alert).

Freeze active: summary bar background shifts to `--lcars-ice` + freeze badge appears.

### Row 2 — Chemistry Status Segments

```
┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐
│  pH  ││ Cl₂  ││ ALK  ││  Ca  ││ HARD ││ CYA  │
└──────┘└──────┘└──────┘└──────┘└──────┘└──────┘
```

Each segment colored by status: ice (optimal), sunflower (caution), tomato (alert). Text: black on colored background. Follows Engineering Row 2 segmented bar pattern.

---

## §5 Section Layout

### ASCII Layout (Desktop)

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│ [Elbow]  SITE NAME ══════════════════════════════════════════════════ [🔇][⇕][⚙]    │
├──────────┬───────────────────────────────────────────────────────────────────────────┤
│          │  CETACEAN STATUS STRIP (§4)                                               │
│ CETACEAN │  POOL 78°F │ SPA 102°F │ CHEMISTRY: OPTIMAL │ SYSTEMS: 2/6              │
│  OPS     │  [pH OK][Cl₂ OK][ALK OK][Ca OK][HARD OK][CYA OK]                        │
│          ├──────────────────────────────────────────────────────────────────────────-─┤
│ ┌──────┐ │                                                                           │
│ │ ALL  │ │  WATER BODIES ─────────────────────────────────────────── AIR 85°F        │
│ │      │ │  ╔══════════════════╗          ╔══════════════════╗                        │
│ ├──────┤ │  ║    POOL   78°    ║          ║    SPA   102°    ║                        │
│ │WATER │ │  ║                  ║          ║                  ║                        │
│ │BODIES│ │  ║   [−] 82° [+]   ║          ║   [−] 104° [+]  ║                        │
│ │      │ │  ║ ▁▁▁▁▁▁▁▁▁▁▁▁▁▁ ║          ║ ▁▁▁▁▁▁▁▁▁▁▁▁▁▁ ║                        │
│ ├──────┤ │  ║   SOLAR PREF    ║          ║   HEATER         ║                        │
│ │CHEM  │ │  ╚══════════════════╝          ╚══════════════════╝                        │
│ │      │ │                                                                           │
│ ├──────┤ │  CHEMISTRY — SCIENCE STATION ─────────────────────────────────────────    │
│ │FEAT- │ │                                                                           │
│ │URES  │ │  pH ──────────────────────────────────── 7.4 OPTIMAL                      │
│ │      │ │  ┌────────────────────────────────────────────────────┐                    │
│ ├──────┤ │  │  ▓▓▓▓│████████████████|████████████████│▓▓▓▓▓▓▓  │                    │
│ │POWER │ │  └────────────────────────────────────────────────────┘                    │
│ │      │ │  6.5       7.2          7.4             7.6       8.5                     │
│ ├──────┤ │                                                                           │
│ │▓▓▓▓▓▓│ │  FREE CHLORINE ──────────────────────── 2.1 ppm OPTIMAL                  │
│ │filler│ │  ┌────────────────────────────────────────────────────┐                    │
│ │      │ │  │  ▓▓│██████████|████████████████████████│▓▓▓▓▓▓▓▓  │                    │
│          │  └────────────────────────────────────────────────────┘                    │
│          │  0         1.0         2.1              3.0         6                      │
│          │                                                                           │
│          │  ALKALINITY ─────────────────────────── 95 ppm OPTIMAL                    │
│          │  ┌────────────────────────────────────────────────────┐                    │
│          │  │  ▓▓▓▓│████████|██████████████████████│▓▓▓▓▓▓▓▓▓▓  │                    │
│          │  └────────────────────────────────────────────────────┘                    │
│          │                                                                           │
│          │  ── SENSOR ──                                                             │
│          │  CASSETTE    87% · 42d                                                    │
│          │  BATTERY     91%                                                          │
│          │  LAST READ   6h ago                                                       │
│          │                                                                           │
│          │  WATER FEATURES ──────────────────────────────────────────                │
│          │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐                     │
│          │  │WATERFALL │ │ BUBBLERS │ │ SPILLWAY │ │  BLOWER  │                      │
│          │  │  ● ON    │ │  □ OFF   │ │  □ OFF   │ │  □ OFF   │                      │
│          │  └──────────┘ └──────────┘ └──────────┘ └──────────┘                     │
│          │                                                                           │
│          │  PUMP TELEMETRY ──────────────────────────────────────────                │
│          │  ● SPA PUMP      1,847 RPM    246W    14 GPM                              │
│          │  ● WATERFALL      2,400 RPM    320W    22 GPM                             │
│          │                                                                           │
│          │  CIRCUITS ───────────────────────────────────────── 2/11                  │
│          │  ┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐                        │
│          │  │POOL  ││SPA   ││CLEAN ││FEAT 1││FEAT 2││FEAT 3│                        │
│          │  │● ON  ││□ OFF ││□ OFF ││□ OFF ││□ OFF ││□ OFF │                        │
│          │  └──────┘└──────┘└──────┘└──────┘└──────┘└──────┘                        │
│          │  ┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐                                │
│          │  │FEAT 4││FEAT 5││FEAT 6││FEAT 7││FEAT 8│                                │
│          │  │□ OFF ││□ OFF ││□ OFF ││□ OFF ││□ OFF │                                │
├──────────┤  └──────┘└──────┘└──────┘└──────┘└──────┘                                │
│ [Elbow]  ═══════════════════════════════════ LCARS 5.0.2 ════════ [endcap]          │
└──────────┴───────────────────────────────────────────────────────────────────────────┘
```

---

## §6 Chemistry — Langford Gauges

The signature visualization of Cetacean Ops. Horizontal range bars replacing the circular dial meters from the user's current dashboard — compliant with LCARS design rules (no circles, rectangles only).

### Gauge Structure

```
pH ──────────────────────────────────── 7.4 OPTIMAL
┌────────────────────────────────────────────────────┐
│  ▓▓▓▓▓│████████████████|████████████████│▓▓▓▓▓▓▓  │
└────────────────────────────────────────────────────┘
 6.5       7.2          ▲7.4           7.6       8.5
           ╰── OPTIMAL ──╯
```

- **Background**: Full possible range as a track bar
- **Optimal zone**: `--lcars-ice` (#99ccff)
- **Warning zones**: `--lcars-sunflower` (#ffcc99) flanking optimal
- **Needle**: 3px vertical rectangle, `--lcars-black` with 1px `--lcars-space-white` outline
- **Needle extends**: 3px above and below the track for visual anchoring
- **Text readout**: Value + status label (OPTIMAL/CAUTION/ALERT) right-aligned in gauge header

### ARIA

```html
<div role="meter" aria-valuenow="7.4" aria-valuemin="6.5" aria-valuemax="8.5"
     aria-label="pH: 7.4 - Optimal">
```

### Contrast (Geordi-verified)

| Needle vs Zone | Contrast | Result |
|----------------|----------|--------|
| Black (#000) vs ice (#99ccff) | 10.3:1 | AAA PASS |
| Black (#000) vs sunflower (#ffcc99) | 13.1:1 | AAA PASS |
| Black (#000) vs tomato (#ff5555) | 5.2:1 | AA PASS |

### Chemistry Thresholds

| Metric | Unit | Min | Optimal Min | Optimal Max | Max |
|--------|------|-----|-------------|-------------|-----|
| pH | — | 6.5 | 7.2 | 7.6 | 8.5 |
| Free Chlorine | ppm | 0 | 1.0 | 3.0 | 6 |
| Alkalinity | ppm | 0 | 80 | 120 | 200 |
| Calcium Hardness | ppm | 0 | 200 | 400 | 600 |
| Total Hardness | ppm | 0 | 200 | 400 | 600 |
| CYA (Stabilizer) | ppm | 0 | 30 | 50 | 100 |

### Needle Animation

```css
.gauge-needle {
  left: var(--needle-pos, 0%);
  transition: left 300ms ease-out;
}
@media (prefers-reduced-motion: reduce) {
  .gauge-needle { transition: none; }
}
```

### Aggregate Chemistry Score

Below individual gauges, the summary bar Row 2 shows per-metric status pills. Aggregate logic:
- All optimal → `OPTIMAL` (ice)
- Any acceptable → `{n} CAUTION` (sunflower)
- Any alert → `{n} ALERT` (tomato)

---

## §7 Water Bodies

Reuses the pool/spa panel rendering pattern:

### Pool/Spa Viewscreen

```
╔══════════════════╗
║    POOL   78°    ║  ← body label + current temp (ice for pool, butterscotch for spa)
║                  ║
║   [−] 82° [+]   ║  ← setpoint controls (clamped 40-104°F, 1500ms debounce)
║ ▁▁▁▁▁▁▁▁▁▁▁▁▁▁ ║  ← heating indicator bar (pulsing when hvac_action=heating)
║   SOLAR PREF     ║  ← heat mode / preset mode
╚══════════════════╝
```

- Border color: `getPoolBodyColor(hvacAction, bodyType)`
  - Pool idle: ice, Pool heating: butterscotch
  - Spa idle: sunflower, Spa heating: butterscotch
- Heating bar: 4px strip at bottom, animated opacity pulse (2s cycle)
- Air temperature displayed in section header

---

## §8 Water Features

Toggle pills for equipment controls:

```
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│WATERFALL │ │ BUBBLERS │ │ SPILLWAY │ │  BLOWER  │
│  ● ON    │ │  □ OFF   │ │  □ OFF   │ │  □ OFF   │
└──────────┘ └──────────┘ └──────────┘ └──────────┘
```

- ON: `--lcars-ice` background, black text
- OFF: `--lcars-gray` background, white text
- `role="switch"`, `aria-checked`, keyboard: Enter/Space toggle
- Audio: `switchToggle` on activation
- Responsive grid: `repeat(auto-fill, minmax(14rem, 1fr))`
- Lights (pool/spa) rendered with same toggle pattern

---

## §9 Pump Telemetry

Compact data rows showing vital signs for each pump:

```
● SPA PUMP      1,847 RPM    246W    14 GPM
● WATERFALL      2,400 RPM    320W    22 GPM
```

- Status dot: ice (running), gray (off)
- Active rows: white text; inactive: gray text
- Three data columns: RPM, Watts, GPM (tabular-nums alignment)
- Grouped by pump name prefix from entity IDs
- OFF state: dashes for values

---

## §10 Circuit Grid

All ScreenLogic switches in a responsive grid:

```
┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐
│POOL  ││SPA   ││CLEAN ││FEAT 1││FEAT 2││FEAT 3│
│● ON  ││□ OFF ││□ OFF ││□ OFF ││□ OFF ││□ OFF │
└──────┘└──────┘└──────┘└──────┘└──────┘└──────┘
```

- Same toggle pill pattern as water features
- Grid: `repeat(auto-fill, minmax(14rem, 1fr))`
- Header shows active count: `2/11`
- Includes pool, spa, cleaner, feature 1-8

---

## §11 Power Section (Filter: POWER)

When POWER filter is active, shows Emporia Vue per-circuit power monitoring:

```
POOL EQUIPMENT POWER ──────────────────── TOTAL: 742W
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ CIRCUIT 3       │ │ CIRCUIT 4       │ │ CIRCUIT 5       │
│ 320W            │ │ 246W            │ │ 112W            │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

- Sorted by wattage (descending)
- Circuits <1W filtered out
- Total wattage in section header
- Tile grid: `repeat(auto-fill, minmax(12rem, 1fr))`
- Power values in ice color

---

## §12 Freeze Protection

Alert banner when `binary_sensor.pentair_*_freeze_mode` is `on`:

```
┌────────────────────────────────────────────┐
│  ❄  FREEZE PROTECT ACTIVE                 │
└────────────────────────────────────────────┘
```

- Background: `--lcars-ice`, text: black
- Pulsing opacity animation (2s cycle)
- `role="alert"` for screen reader announcement
- Summary bar shifts to ice background when active
- `prefers-reduced-motion`: static, no pulse

---

## §13 Sensor Health

WaterGuru device telemetry below chemistry gauges:

```
── SENSOR ──
CASSETTE    87% · 42d
BATTERY     91%
LAST READ   6h ago
```

- Compact key-value rows
- Cassette: percentage + days remaining
- Battery: percentage
- Last measurement: relative timestamp from WaterGuru

---

## §14 Animation Budget

| # | Animation | Duration | Properties | GPU |
|---|-----------|----------|------------|-----|
| 1 | Heating bar pulse | 2s ease-in-out | `opacity` | Yes |
| 2 | Gauge needle transition | 300ms ease-out | `left` | Partial |
| 3 | Freeze banner pulse | 2s ease-in-out | `opacity` | Yes |

**Steady-state concurrent: 2** (heating + freeze rarely overlap). Well within ≤6 budget.

All behind `@media (prefers-reduced-motion: reduce)` with static fallbacks.

---

## §15 Accessibility Summary

| Requirement | Implementation | WCAG |
|-------------|----------------|------|
| Gauge color redundancy | Text labels (OPTIMAL/CAUTION/ALERT) + numeric readout | 1.4.1 |
| Gauge needle contrast | Black needle with white outline (10.3:1+ vs all zones) | 1.4.11 |
| Summary bar text | Black on sky (8.8:1) | 1.4.3 |
| Toggle focus | `focus-visible` outline, 2px solid white, offset 2px | 2.4.7 |
| Toggle semantics | `role="switch"`, `aria-checked`, Enter/Space toggle | 4.1.2 |
| Gauge semantics | `role="meter"`, `aria-valuenow/min/max`, `aria-label` | 4.1.2 |
| Minimum target | 3rem (48px) button height | 2.5.8 |
| Freeze announcement | `role="alert"` on banner | 4.1.3 |

---

## §16 File Manifest

| File | Purpose |
|------|---------|
| `const.py` | `DASHBOARD_REGISTRY["cetacean"]` entry |
| `lovelace/ui-lovelace-cetacean.yaml` | Lovelace view configuration |
| `js/src/lcars-cetacean-layout.js` | LCARS frame + 5 sidebar filter buttons |
| `js/src/lcars-cetacean-card.js` | Dashboard card: entity discovery, summary, content |
| `js/webpack.config.js` | 2 entry points added |
| `js/src/lcars-entity-utils.js` | `POOL_SPA_PLATFORMS` exported |

---

## §17 Design Credits

- **Wesley Crusher** — Creative vision: "underwater observation deck" metaphor, Langford gauge concept, section layout, animation ideas
- **Geordi La Forge** — LCARS compliance: frame color change (bluey → sky), summary bar reduction (5→4 blocks), gauge needle contrast, ARIA requirements, animation budget
- **Data** — Implementation architecture: file manifest, entity discovery strategy, reuse analysis, webpack configuration
