# LCARS Engineering Dashboard Spec (5X-2.3)

> Engineering / Power — all batteries, power sensors, energy monitoring.
> Frame color: `--lcars-butterscotch` (#ff9966). Sidebar: african-violet.
> Filters: ALL / STORAGE / CIRCUITS
> **Updated**: 2026-05-03 — current as of v5.1.0-beta.38. Topology + voltage overview + circuit classification shipped in v5.1.0-beta.30; quad-agent QA polish (memoized switch labels, 40-char label cap) shipped in v5.1.0-beta.36.

---

## §1 Entity Scope

| Domain | Device Classes | Count (this instance) |
|--------|---------------|----------------------|
| `sensor` | battery | 130 |
| `sensor` | power | 287 |
| `sensor` | energy | 337 |
| `sensor` | voltage | 69 |
| `sensor` | current | 54 |
| `switch` | (smart plugs) | 5 (TPLink: UDM SE, Switch 24E, NVR, RPS, DS918+) |

**Key platforms**: TPLink (smart plugs), EcoFlow (portable battery), Emporia Vue (circuit monitoring), NUT (UPS).

---

## §2 Layout Structure (v5.1.0)

```
┌──────────────────────────────────────────────────────────┐
│ [Elbow]  SITE NAME ════════════════════════ [🔇][⚙]    │
├──────────┬───────────────────────┬──────────────────────┤
│          │  POWER SOURCES ═══   │  SYSTEM STATUS       │
│ ENGINEER │  ┌──────┐ ┌────────┐ │  LOAD:  2,847 W     │
│ -ING     │  │ GRID │ │RIVER 3+│ │  GRID:  3,100 W     │
│          │  │2340 W│ │[▓▓▓]85%│ │  BATTERIES: 3 UNITS │
│ ┌──────┐ │  │ONLINE│ │▼342W   │ │  AVG SOC:   78%     │
│ │ ALL  │ │  └──┼───┘ └──┼─────┘ │  CIRCUITS:  28      │
│ │      │ │     │  ║  ║  │       │  HEALTH: NOMINAL    │
│ ├──────┤ │  ═══╧══╧══╧══╧═══   │                      │
│ │STORE │ │  AC DISTRIBUTION BUS │                      │
│ │      │ │  2,847 W TOTAL LOAD  │                      │
│ ├──────┤ │  ════════════════    │                      │
│ │CIRCT │ │                      │                      │
│ │      │ │  LOAD CIRCUITS ═══ 28 ACTIVE                │
│ ├──────┤ │  ┌────────┐┌────────┐┌────────┐┌────────┐  │
│ │▓▓▓▓▓▓│ │  │DRYER   ││HOT TUB ││KITCHEN ││WASHER  │  │
│ │filler│ │  │4200W   ││1800W   ││342W    ││120W    │  │
│ │      │ │  │████████││██████░░││███░░░░░││█░░░░░░░│  │
│ │      │ │  └────────┘└────────┘└────────┘└────────┘  │
├──────────┤──────────────────────────────────────────────┤
│ [Elbow]  │  LCARS 5.1.0-BETA.16 ═══════════            │
└──────────┴──────────────────────────────────────────────┘
```

### §2.1 Source Row
- **GRID card**: Ice blue border, voltage/frequency/energy telemetry, power bar, ONLINE pill
- **UPS card**: Sunflower, charge%/load%/runtime (NUT sensors)
- **Battery cards**: Mini warp core (CSS fill, idle pulse, charging stripes), SOC% + flow + voltage side-by-side, DETAIL ► deep-link to Habitat `#area:<area_id>`
- **Conduit connectors**: 4px animated dashed flow lines from each source to bus

### §2.2 Distribution Bus
- Butterscotch horizontal bar with breathing glow animation
- Total load readout (summed from all circuits)

### §2.3 Circuit Grid
- Top 24 active circuits sorted by wattage descending
- Bar width relative to highest-draw circuit (not self-referencing)
- 4-tier color: ice (<200W), sunflower (200-500W), butterscotch (500-1000W), tomato (>1000W)
- Shimmer animation on fill bars
- Aggregate exclusion: `totalusage`, `balance`, `mainload`, `mainsfromgrid`, `mainstogrid` filtered
- 240V dedup: L1+L2 pairs removed when combined sensor exists

### §2.4 System Status Sidebar
- 16rem fixed width, sticky, key-value grid
- LOAD, GRID, BATTERIES count, AVG SOC, CIRCUITS count, HEALTH

---

## §3 Device Elements

### §3.1 Power Monitor Tile
- Bordered card: `1px solid rgba(255,153,102,0.15)`, `0.5rem` border-radius
- Header: device name + `POWER` / `ENERGY` / `VOLTAGE` / `CURRENT` badge
- Value: large text (`1.5rem`), unit suffix, tabular-nums
- Color: 5-tier wattage scale (reuse from Power Panel):
  - 0-50W: `--lcars-gray`
  - 50-200W: `--lcars-ice`
  - 200-500W: `--lcars-sunflower`
  - 500-1000W: `--lcars-butterscotch`
  - 1000W+: `--lcars-tomato`
- Flat fills only — no gradients (Bracer Jack Rule 1)
- Area labels must accompany color (WCAG 1.4.1)

### §3.2 Battery Pill (Compact)
- For devices with `device_class: battery`
- Pill shape: device name + segmented fill bar + percentage
- Color by charge level:
  - >50%: `--lcars-ice`
  - 20-50%: `--lcars-butterscotch`
  - <20%: `--lcars-tomato`
- Sorted: lowest charge first
- Grid: `repeat(auto-fill, minmax(14rem, 1fr))`

### §3.3 Battery Warp Core (EcoFlow / UPS)
- Reuse `<lcars-battery-panel>` from Habitat for full battery devices
- Vertical cylinder with fill level
- I/O flow conduits: charge/discharge arrows
- Estimated runtime text
- Frame: `--lcars-ice`

### §3.4 Smart Plug Toggle
- Reuse Consolidated Power Panel sliding track
- Toggle track + name + wattage readout
- Rate-limited service calls

---

## §4 Hero Element: Warp Core Summary Strip

Full-width 2-row block below header. Text uses `color: var(--lcars-black, #000)` for WCAG contrast on butterscotch background (5X-B05). Labels use `opacity: 0.7` for visual hierarchy while maintaining ≥4.5:1 contrast ratio.

**Row 1** — three data blocks:
| Block | Content | Source |
|-------|---------|--------|
| TOTAL DRAW | Sum of all power sensors (W) | `sensor.*` where `device_class: power` |
| GRID | Import/export direction + value | Main panel sensors |
| BATTERY | Highest-priority battery % + estimated runtime | EcoFlow / UPS sensors |

**Row 2** — Power Distribution Bar:
- Horizontal segmented bar, proportional width per area
- Each segment: area name label + wattage
- Color palette rotating: butterscotch → sunflower → almond → ice
- Tap segment → scroll to area section below

---

## §5 Energy Chart (Future Enhancement)

7-day horizontal bar chart using HA `recorder/statistics_during_period` WebSocket API.
- One bar per day, segmented by area
- Y-axis: kWh
- Pure CSS/SVG — no chart library dependency
- `role="img"` + `aria-label` on SVG for screen readers
- Statistics entity IDs validated with regex before WS call (Worf: approved)

---

## §6 Filter Behavior

| Filter | Shows |
|--------|-------|
| ALL | All power/battery entities |
| STORAGE | Battery-class entities + full battery panels (EcoFlow/UPS) |
| CIRCUITS | Power/energy/voltage/current sensors + smart plug toggles |

---

## §7 Reused Components

- `<lcars-battery-panel>` — warp core visualization for full battery devices
- `<lcars-power-panel>` — consolidated power monitoring (reference for power-tier colors)
- Smart plug sliding track toggle from Consolidated Power Panel
- `formatNumber()` from `lcars-format-utils.js`
